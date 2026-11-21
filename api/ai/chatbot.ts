import { GoogleGenAI, ThinkingLevel } from '@google/genai';

const MODEL_CHAIN = [
  { model: 'gemini-3.1-flash-lite', useLowThinking: false, timeoutMs: 15000 },
  { model: 'gemini-4-hydrogen', useLowThinking: true, timeoutMs: 15000 },
] as const;

// Initialize Gemini SDK with User-Agent header as required
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `You are "MatLink AI", the intelligent conversational assistant for **MatLink Pune** — a sustainable construction material marketplace and site-reuse platform operating across Pune, Maharashtra, India.

Be like a helpful, knowledgeable ChatGPT-style assistant tailored for builders, site engineers, contractors, architects, and homeowners:
- Give direct, clear, accurate, and well-structured answers to whatever the user asks (whether about MatLink Pune, material selection, structural/civil best practices, quantity/cost estimation, or general construction questions).
- When explaining steps, comparisons, or estimates, use clean Markdown formatting: short headings, bullet points, numbered steps, or compact Markdown tables where helpful.
- For pricing or budgets, use Indian Rupees (₹ / INR) and practical Pune market context when relevant (areas like Hinjawadi, Kharadi, Wakad, Baner, Kothrud, Viman Nagar, Pimpri-Chinchwad, Hadapsar).

Platform knowledge about **MatLink Pune**:
1. **Buyer Mode**: Buyers browse verified surplus construction material listings across Pune (with live inventory automatically synced when sellers publish), view site locations, and inspect condition reports.
2. **Seller Mode**: Sellers upload photos and details of leftover materials (cement, TMT steel, bricks, sand, tiles, pipes, timber, paint, stone) and pin their site on the live Pune Construction Site Map; published items appear automatically in Buyer Mode.
3. **AI Material Inspector (RoboInspector)**: Evaluates uploaded photos of construction materials for condition grade (Excellent, Good, Average, Worst), visible defects (rust, cracks, moisture lumps), and suitability for reuse. Note: visual screening does not replace formal lab testing (e.g., cube compression or tensile tests).
4. **Pune Construction Site Map**: Visualizes active construction sites and available surplus locations across Pune.

Always keep answers practical, honest, concise yet thorough, and easy to act on.`;

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function extractCleanErrorMessage(error: any): { status: number; message: string } {
  let status = Number(error?.status) || Number(error?.statusCode) || 500;
  let message = typeof error?.message === 'string' ? error.message : 'Failed to generate AI response';

  if (message.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(message);
      if (parsed?.error?.message) {
        message = parsed.error.message;
      }
      if (parsed?.error?.code) {
        status = Number(parsed.error.code) || status;
      }
    } catch {
      // Keep original message if not JSON
    }
  }

  if (status === 403 || message.includes('PERMISSION_DENIED') || message.includes('API_KEY_INVALID')) {
    message = 'The configured Gemini API key was rejected. Please verify it in Settings > Secrets.';
  } else if (status === 429 || message.includes('RESOURCE_EXHAUSTED')) {
    message = 'AI service rate limit reached. Please wait a moment and try again.';
  }

  return {
    status: status >= 400 && status < 600 ? status : 500,
    message,
  };
}

/**
 * Normalizes chat history for Gemini `ai.chats.create`:
 * - Starts on a 'user' turn
 * - Strictly alternates 'user' and 'model' turns
 * - Ends on a 'model' turn so the incoming user message follows cleanly
 */
function normalizeHistory(
  rawHistory: unknown
): Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> {
  if (!Array.isArray(rawHistory)) return [];

  const sliced = rawHistory.slice(-14);
  const normalized: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const turn of sliced) {
    if (!turn || typeof turn !== 'object') continue;
    const rawContent = (turn as any).content;
    const rawRole = (turn as any).role;
    if (typeof rawContent !== 'string' || !rawContent.trim()) continue;

    const role: 'user' | 'model' = rawRole === 'user' ? 'user' : 'model';
    if (normalized.length === 0 && role !== 'user') {
      continue;
    }

    const last = normalized[normalized.length - 1];
    if (last && last.role === role) {
      // Merge consecutive same-role messages rather than breaking turn alternation
      last.parts[0].text = `${last.parts[0].text}\n\n${rawContent.trim()}`;
    } else {
      normalized.push({
        role,
        parts: [{ text: rawContent.trim() }],
      });
    }
  }

  // Gemini expects the final turn in `history` to be 'model' before sending a new user message
  if (normalized.length > 0 && normalized[normalized.length - 1].role === 'user') {
    normalized.pop();
  }

  return normalized;
}

function isRetryableModelError(status: number, message: string): boolean {
  if (status === 503 || status === 500 || status === 429 || status === 404) return true;
  const lower = message.toLowerCase();
  return (
    lower.includes('high demand') ||
    lower.includes('unavailable') ||
    lower.includes('overloaded') ||
    lower.includes('temporarily') ||
    lower.includes('timed out') ||
    lower.includes('timeout')
  );
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history, stream } = req.body || {};
    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: 'Gemini API key is not configured on the server. Please set GEMINI_API_KEY in Settings > Secrets.',
      });
    }

    const formattedHistory = normalizeHistory(history);
    const trimmedMessage = message.trim();

    if (stream === true) {
      let lastError: any = null;

      for (const candidate of MODEL_CHAIN) {
        try {
          const config: Record<string, any> = {
            systemInstruction: SYSTEM_INSTRUCTION,
          };
          if (candidate.useLowThinking) {
            config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
          }

          const chat = ai.chats.create({
            model: candidate.model,
            history: formattedHistory,
            config,
          });

          const responseStream = await withTimeout(
            chat.sendMessageStream({ message: trimmedMessage }),
            candidate.timeoutMs,
            candidate.model
          );

          res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
          res.setHeader('Cache-Control', 'no-cache, no-transform');
          res.setHeader('Connection', 'keep-alive');

          let streamedAny = false;
          for await (const chunk of responseStream) {
            const chunkText = chunk?.text;
            if (chunkText) {
              streamedAny = true;
              res.write(`data: ${JSON.stringify({ delta: chunkText, provider: candidate.model })}\n\n`);
            }
          }

          if (!streamedAny) {
            res.write(
              `data: ${JSON.stringify({
                delta: 'I am MatLink AI. How can I assist you with construction materials or Pune sites today?',
                provider: candidate.model,
              })}\n\n`
            );
          }
          res.write(`data: ${JSON.stringify({ done: true, provider: candidate.model })}\n\n`);
          return res.end();
        } catch (err: any) {
          lastError = err;
          if (res.headersSent) {
            const { message: errMsg } = extractCleanErrorMessage(err);
            res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
            return res.end();
          }
          const { status, message: errMsg } = extractCleanErrorMessage(err);
          if (isRetryableModelError(status, errMsg)) {
            continue;
          }
          throw err;
        }
      }

      throw lastError;
    }

    // Standard non-streaming JSON mode
    let lastError: any = null;
    for (const candidate of MODEL_CHAIN) {
      try {
        const config: Record<string, any> = {
          systemInstruction: SYSTEM_INSTRUCTION,
        };
        if (candidate.useLowThinking) {
          config.thinkingConfig = { thinkingLevel: ThinkingLevel.LOW };
        }

        const chat = ai.chats.create({
          model: candidate.model,
          history: formattedHistory,
          config,
        });

        const response = await withTimeout(
          chat.sendMessage({ message: trimmedMessage }),
          candidate.timeoutMs,
          candidate.model
        );
        const replyText =
          response.text ||
          'I am MatLink AI. How can I help you with construction materials or MatLink Pune today?';

        return res.status(200).json({
          reply: replyText,
          provider: candidate.model,
        });
      } catch (err: any) {
        lastError = err;
        const { status, message: errMsg } = extractCleanErrorMessage(err);
        if (isRetryableModelError(status, errMsg)) {
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  } catch (error: any) {
    console.error('Error in chatbot handler:', error);
    if (res.headersSent) {
      return res.end();
    }
    const { status, message } = extractCleanErrorMessage(error);
    return res.status(status).json({ error: message });
  }
}
