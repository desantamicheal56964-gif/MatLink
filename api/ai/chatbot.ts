import { GoogleGenAI } from '@google/genai';

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

const SYSTEM_INSTRUCTION = `You are "BuildSmart AI Assistant", the official expert AI assistant for "CircuBuild - Digital Platform for Sustainable Use of Construction Material" operating across the Pune metropolitan region, Maharashtra, India.
Your mission is to guide construction contractors, builders, site engineers, architects, and buyers on:
1. How the CircuBuild platform works (connecting construction sites with surplus materials to sites needing materials).
2. How to sell leftover materials (listing cement, steel rebars, bricks, sand, tiles, shuttering wood, pipes, paint, granite).
3. How to buy surplus materials at 30% to 60% discounts compared to current market prices in Pune.
4. How to use the AI Material Inspector to analyze photo condition before listing.
5. How the Pune Construction Site Map works (visualizing sites in Hinjawadi, Kharadi, Wakad, Baner, Kothrud, Viman Nagar, Pimpri, Hadapsar).
6. Environmental & economic benefits: reducing Pune landfill disposal, avoiding quarrying and virgin cement/steel production, saving lakhs of rupees for builders.
7. Technical construction guidance (storage precautions for cement, rebar rust removal, brick water absorption, tile adhesion, shuttering board reuse cycles).
8. Platform features: purchase request flow, inventory tracking, role-based dashboards (Buyer, Seller, Admin), and verified site locations.

Always be professional, practical, encouraging, and clear. Format your answers with bullet points and bold highlights when explaining steps.
Important rules:
- State monetary values in Indian Rupees (₹ / INR).
- Mention local Pune hubs (e.g., Hinjawadi IT Park, Kharadi, Wakad, Baner, Kothrud, Hadapsar).
- If asked whether visual inspection guarantees structural load capacity, explain that visual AI inspection assesses surface condition, packaging, and visible flaws, but does not replace standard lab testing (cube compression tests, tensile test, etc.).`;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback domain-aware assistant if GEMINI_API_KEY is not yet populated
      const fallbackResponse = generateDomainFallbackResponse(message);
      return res.status(200).json({
        reply: fallbackResponse,
        provider: 'circubuild-domain-expert',
      });
    }

    // Call Gemini 3.8 Flash
    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // Provide previous conversation history if present
    if (Array.isArray(history) && history.length > 0) {
      for (const turn of history.slice(-6)) {
        if (turn.role === 'user' && turn.content) {
          // Send context
          await chat.sendMessage({ message: turn.content });
        }
      }
    }

    const response = await chat.sendMessage({ message });
    const replyText = response.text || 'I am here to help you buy, sell, or inspect leftover construction materials in Pune. How can I assist you?';

    return res.status(200).json({
      reply: replyText,
      provider: 'gemini-3.8-flash',
    });
  } catch (error: any) {
    console.error('Error in chatbot handler:', error);
    // Graceful fallback response
    return res.status(200).json({
      reply: `Thank you for asking about CircuBuild Pune! ${generateDomainFallbackResponse(req.body?.message || '')}`,
      provider: 'circubuild-fallback',
      warning: 'Service running in resilience mode.',
    });
  }
}

function generateDomainFallbackResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('sell') || q.includes('list') || q.includes('upload')) {
    return `### How to Sell Leftover Material on CircuBuild Pune:
1. **Navigate to "Sell Your Material"**: Click the button in the top navigation or main dashboard.
2. **Inspect with AI (Optional)**: Upload an image in the **AI Material Inspector** to automatically detect category, condition, and defects.
3. **Fill Listing Details**: Enter material title (e.g. *Surplus OPC 53 UltraTech Cement*), category, quantity, unit, and location (select your Pune site).
4. **Set Your Pricing**: Provide the estimated original market price and your discounted selling price (typically 20-50% off for fast reuse).
5. **Publish & Track**: Once published, buyers across Pune can view your listing and send direct purchase requests to your Seller Dashboard!`;
  }

  if (q.includes('buy') || q.includes('explore') || q.includes('search') || q.includes('purchase')) {
    return `### How to Buy Construction Materials:
1. **Explore Materials**: Browse hundreds of active listings across Pune filtered by category (Cement, Steel, Bricks, Tiles, Pipes, etc.), condition, and price.
2. **Review Material Details**: Inspect high-res photographs, condition reports, seller site details, and verified percentage savings.
3. **Send Purchase Request**: Specify your required quantity and delivery preference (Self-Pickup or Site Delivery).
4. **Seller Confirmation**: Once the seller accepts your request, the inventory is reserved and you receive direct contact details to coordinate logistics and payment.`;
  }

  if (q.includes('map') || q.includes('pune') || q.includes('site') || q.includes('location')) {
    return `### Pune Construction Site Map:
The interactive **Construction Site Map** visualizes active project sites across:
- **Hinjawadi IT Park** (Phases 1-3)
- **Kharadi & EON Free Zone**
- **Wakad & Punawale Corridor**
- **Baner - Balewadi High Street**
- **Kothrud & Paud Road**
- **Viman Nagar & Nagar Road**
- **Pimpri-Chinchwad Industrial Belt**
- **Hadapsar & Magarpatta City**

Markers indicate:
- **Purple**: Active construction site
- **Blue**: Surplus materials currently available for purchase
- **Green**: Sites with successfully completed reuse transactions!`;
  }

  if (q.includes('inspect') || q.includes('ai') || q.includes('defect') || q.includes('quality')) {
    return `### How the AI Material Inspector Works:
1. **Upload a clear photo** of your leftover material (e.g. cement bags, steel rebar stack, pallet of bricks, or tile boxes).
2. **Gemini Vision Analysis**: The AI inspects surface rust, packaging integrity, moisture damage, cracks, spalling, and weathering.
3. **Instant Rating**: Generates an assessment (**Excellent**, **Good**, **Average**, or **Poor**) with recommended next steps.
4. **One-Click Listing**: Click *"Use AI-Generated Details"* to auto-populate your listing form!
*Note: AI inspection is a preliminary visual check and does not replace lab compressive strength or chemical testing.*`;
  }

  if (q.includes('waste') || q.includes('environment') || q.includes('saving') || q.includes('money') || q.includes('impact')) {
    return `### Economic & Environmental Impact of CircuBuild:
- **Economic**: Buyers save an average of **35% to 55%** compared to retail prices, while sellers convert dead site inventory into working capital.
- **Environmental**: Construction and demolition (C&D) waste accounts for over 30% of municipal solid waste in Indian cities. Every ton of steel reused prevents **1.8 tons of CO2**, and reusing cement prevents greenhouse emissions from limestone calcination.
- Check our live **Environmental & Economic Impact Dashboard** for real-time tonnage and savings metrics!`;
  }

  return `### Welcome to BuildSmart AI Assistant!
I can help you navigate **CircuBuild Pune**:
- **Sell Leftover Materials**: Learn how to list surplus cement, steel, bricks, sand, tiles, and timber.
- **Find Discounted Materials**: Discover materials nearby in Hinjawadi, Kharadi, Wakad, Baner, and across Pune.
- **AI Material Inspector**: Use computer vision to evaluate material condition before purchase or sale.
- **Construction Site Map**: Locate verified builder sites with available surplus inventory.

Feel free to ask any specific question about materials, prices, or how to get started!`;
}
