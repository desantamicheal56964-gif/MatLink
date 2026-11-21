import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Square,
  Plus,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  isError?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'How do I list surplus materials in Seller Mode?',
  'Estimate cement & steel for a 1,000 sq.ft RCC slab',
  'OPC 53 vs PPC cement: which is better for plastering?',
  'How does the AI Material Inspector check quality?',
  'What precautions should I take before buying leftover TMT bars?',
];

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome_msg',
  role: 'assistant',
  content: `Hello! I'm **MatLink AI**, your smart construction assistant for **MatLink Pune**.

Ask me anything — from listing or buying surplus materials across Pune sites, to cement/steel quantity estimates, material quality checks, and civil engineering best practices. How can I help you today?`,
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
};

export const Chatbot: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, loading]);

  // Auto-resize textarea height cleanly
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
  };

  const handleCopy = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
    } catch {
      // Clipboard blocked in non-HTTPS iframe contexts
    }
  };

  const sendPrompt = async (promptText: string, baseMessages: ChatMessage[]) => {
    const cleanHistory = baseMessages
      .filter((m) => !m.isError && m.id !== 'welcome_msg' && m.content.trim().length > 0)
      .map((m) => ({ role: m.role, content: m.content }));

    const assistantMsgId = `bot_${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setLastError(null);

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: promptText,
          history: cleanHistory,
          stream: true,
        }),
      });

      const contentType = response.headers.get('content-type') || '';

      // SSE Streaming path (ChatGPT-style progressive output)
      if (response.ok && contentType.includes('text/event-stream') && response.body) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp,
          },
        ]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let accumulated = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const events = sseBuffer.split('\n\n');
          sseBuffer = events.pop() || '';

          for (const evt of events) {
            const lines = evt.split('\n');
            for (const line of lines) {
              if (!line.startsWith('data: ')) continue;
              const payloadStr = line.slice(6).trim();
              if (!payloadStr) continue;

              let payload: any;
              try {
                payload = JSON.parse(payloadStr);
              } catch {
                continue;
              }

              if (payload.error) {
                throw new Error(payload.error);
              }
              if (payload.delta) {
                accumulated += payload.delta;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantMsgId ? { ...m, content: accumulated } : m))
                );
              }
            }
          }
        }

        if (!accumulated.trim()) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsgId
                ? {
                    ...m,
                    content:
                      'I am **MatLink AI**. Could you please rephrase or share a bit more detail so I can help?',
                  }
                : m
            )
          );
        }
        return;
      }

      // Standard JSON fallback path
      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        throw new Error(
          rawText.trim().startsWith('<')
            ? 'MatLink AI endpoint returned an HTML page instead of JSON. Please retry.'
            : 'MatLink AI returned an unreadable response.'
        );
      }

      if (!response.ok) {
        throw new Error(data?.error || `Server returned status ${response.status}`);
      }

      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: data?.reply || 'How else can MatLink AI assist you today?',
          timestamp,
        },
      ]);
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return;
      }
      console.error('MatLink AI error:', err);
      const errMsg = err?.message || 'Unable to reach MatLink AI right now.';
      setLastError(errMsg);
      setMessages((prev) => {
        const filtered = prev.filter(
          (m) => !(m.id === assistantMsgId && m.content.trim().length === 0)
        );
        return [
          ...filtered,
          {
            id: `bot_err_${Date.now()}`,
            role: 'assistant',
            content: `Sorry, I couldn't complete that response: ${errMsg}\n\nClick **Retry** below to try again.`,
            timestamp,
            isError: true,
          },
        ];
      });
    } finally {
      abortControllerRef.current = null;
      setLoading(false);
    }
  };

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend ?? input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const historySnapshot = messages;
    setMessages((prev) => [...prev, userMessage]);
    if (!messageToSend) {
      setInput('');
    }

    await sendPrompt(text, historySnapshot);
  };

  const handleRegenerate = async () => {
    if (loading) return;
    const lastUserIdx = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIdx === -1) return;

    const actualUserIdx = messages.length - 1 - lastUserIdx;
    const userPrompt = messages[actualUserIdx].content;
    const trimmedToUser = messages.slice(0, actualUserIdx + 1);
    const historyBeforeUser = messages.slice(0, actualUserIdx);

    setMessages(trimmedToUser);
    await sendPrompt(userPrompt, historyBeforeUser);
  };

  const handleNewChat = () => {
    handleStop();
    setMessages([
      {
        ...WELCOME_MESSAGE,
        id: `welcome_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastError(null);
    setInput('');
  };

  const renderInline = (str: string) => {
    const tokens = str.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
    return tokens.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
        return (
          <strong key={i} className="font-semibold text-[#1C1C2B]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return (
          <em key={i} className="italic">
            {part.slice(1, -1)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded bg-[#F1F2F5] text-[#51416F] font-mono text-[11px]"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const formatMarkdown = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Fenced code blocks
      if (line.trim().startsWith('```')) {
        const codeLines: string[] = [];
        i++;
        while (i < lines.length && !lines[i].trim().startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-2 p-2.5 rounded-xl bg-[#1E1E2E] text-gray-100 text-[11px] font-mono overflow-x-auto leading-relaxed"
          >
            <code>{codeLines.join('\n')}</code>
          </pre>
        );
        i++;
        continue;
      }

      // Markdown tables
      if (
        line.trim().startsWith('|') &&
        i + 1 < lines.length &&
        /^\|[\s:|-]+\|/.test(lines[i + 1].trim())
      ) {
        const headerCells = line
          .split('|')
          .map((c) => c.trim())
          .filter(Boolean);
        i += 2; // Skip separator row
        const bodyRows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|')) {
          const rowCells = lines[i]
            .split('|')
            .map((c) => c.trim())
            .filter(Boolean);
          if (rowCells.length > 0) bodyRows.push(rowCells);
          i++;
        }
        elements.push(
          <div key={`tbl-${i}`} className="my-2 overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead className="bg-[#7561A8]/10 text-[#51416F] font-semibold">
                <tr>
                  {headerCells.map((cell, ci) => (
                    <th key={ci} className="px-2.5 py-1.5 border-b border-gray-200">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, ri) => (
                  <tr key={ri} className="even:bg-[#F8F9FB]">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-2.5 py-1.5 border-b border-gray-100">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }

      if (line.startsWith('### ')) {
        elements.push(
          <h4 key={i} className="font-bold text-[#51416F] text-[13px] mt-2.5 mb-1">
            {renderInline(line.replace('### ', ''))}
          </h4>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h3 key={i} className="font-bold text-[#252536] text-sm mt-3 mb-1">
            {renderInline(line.replace('## ', ''))}
          </h3>
        );
      } else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const content = line.trim().substring(2);
        elements.push(
          <li key={i} className="ml-4 list-disc text-xs my-0.5 leading-relaxed">
            {renderInline(content)}
          </li>
        );
      } else if (/^\s*\d+\.\s/.test(line)) {
        elements.push(
          <p key={i} className="text-xs my-1 pl-1 leading-relaxed">
            {renderInline(line.trim())}
          </p>
        );
      } else if (line.trim() === '') {
        elements.push(<div key={i} className="h-1.5" />);
      } else {
        elements.push(
          <p key={i} className="text-xs my-1 leading-relaxed">
            {renderInline(line)}
          </p>
        );
      }
      i++;
    }

    return elements;
  };

  const hasUserMessages = messages.some((m) => m.role === 'user');
  const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
  const actualLastAssistantIdx =
    lastAssistantIdx === -1 ? -1 : messages.length - 1 - lastAssistantIdx;

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#7561A8] to-[#51416F] text-white shadow-xl shadow-[#7561A8]/40 hover:scale-105 transition-all group focus:outline-hidden"
          aria-label="Open MatLink AI"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#72B9E8] rounded-full ring-2 ring-[#7561A8]" />
          </div>
          <span className="text-xs md:text-sm font-semibold tracking-wide">MatLink AI</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#72B9E8] text-[#252536]">
            Ask AI
          </span>
        </button>
      )}

      {/* ChatGPT-Style Chat Workspace */}
      {isOpen && (
        <div
          className={`fixed right-3 sm:right-6 bottom-3 sm:bottom-6 z-50 bg-white rounded-3xl shadow-2xl border border-[#7561A8]/20 flex flex-col overflow-hidden transition-all duration-300 ${
            isExpanded
              ? 'w-[94vw] sm:w-[680px] h-[84vh]'
              : 'w-[94vw] sm:w-[430px] h-[600px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#7561A8] via-[#635091] to-[#51416F] text-white flex items-center justify-between shadow-md shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-[#72B9E8]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-tight">MatLink AI</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#72B9E8] text-[#252536]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[10px] text-purple-100/90">
                  Smart Construction & Material Assistant • Pune
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/85">
              <button
                onClick={handleNewChat}
                title="New Chat"
                className="flex items-center gap-1 px-2 py-1.5 hover:bg-white/15 rounded-lg transition-colors text-[11px] font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New</span>
              </button>
              <button
                onClick={() => setIsExpanded((prev) => !prev)}
                title={isExpanded ? 'Compact View' : 'Expand View'}
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:bg-white/15 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message Feed */}
          <div className="flex-1 p-4 overflow-y-auto bg-[#F6F7FA] space-y-4 text-[#252536]">
            {messages.map((msg, idx) => {
              const isUser = msg.role === 'user';
              const isLastAssistant = idx === actualLastAssistantIdx && msg.id !== 'welcome_msg';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold mt-0.5 ${
                      isUser
                        ? 'bg-[#7561A8] text-white'
                        : 'bg-white border border-[#7561A8]/30 text-[#7561A8] shadow-xs'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>

                  <div className={`max-w-[85%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                        isUser
                          ? 'bg-[#7561A8] text-white rounded-tr-none whitespace-pre-wrap'
                          : msg.isError
                          ? 'bg-amber-50 text-amber-950 border border-amber-200 rounded-tl-none'
                          : 'bg-white text-[#252536] border border-gray-100 rounded-tl-none'
                      }`}
                    >
                      {isUser ? (
                        msg.content
                      ) : msg.content ? (
                        formatMarkdown(msg.content)
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[#8B8D98]">
                          <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.15s]" />
                          <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.3s]" />
                        </span>
                      )}
                    </div>

                    {/* Message footer actions */}
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[9px] text-[#8B8D98]">{msg.timestamp}</span>
                      {!isUser && !msg.isError && msg.content && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 text-[10px] text-[#8B8D98] hover:text-[#51416F] transition-colors"
                          title="Copy reply"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                      {isLastAssistant && !loading && (
                        <button
                          onClick={handleRegenerate}
                          className="inline-flex items-center gap-1 text-[10px] text-[#8B8D98] hover:text-[#51416F] transition-colors"
                          title="Regenerate answer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Regenerate</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-white border border-[#7561A8]/30 flex items-center justify-center text-[#7561A8] shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.4s]" />
                  <span className="text-[11px] text-[#8B8D98] ml-2">MatLink AI is thinking...</span>
                </div>
              </div>
            )}

            {lastError && !loading && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="truncate">{lastError}</span>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 rounded-lg font-semibold text-[10px] shrink-0 ml-2"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Starter Prompts */}
          {!hasUserMessages && (
            <div className="px-3 py-2.5 bg-white border-t border-gray-100 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[10px] font-semibold text-[#8B8D98]">Try asking MatLink AI:</p>
                {onNavigate && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onNavigate('ai-inspector');
                    }}
                    className="text-[10px] font-semibold text-[#7561A8] hover:underline"
                  >
                    Open AI Inspector →
                  </button>
                )}
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {SUGGESTED_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    disabled={loading}
                    className="text-[11px] whitespace-nowrap bg-[#F1F2F5] hover:bg-[#7561A8]/10 text-[#51416F] hover:text-[#7561A8] font-medium px-3 py-1.5 rounded-full border border-gray-200 transition-colors shrink-0"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ChatGPT-style Multi-line Input Composer */}
          <div className="p-3 bg-white border-t border-gray-100 shrink-0">
            <div className="flex items-end gap-2 bg-[#F1F2F5] rounded-2xl px-3 py-2 border border-transparent focus-within:border-[#7561A8] focus-within:bg-white transition-all">
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Message MatLink AI... (Shift+Enter for new line)"
                disabled={loading}
                className="flex-1 bg-transparent text-xs text-[#252536] placeholder-[#8B8D98] resize-none focus:outline-hidden max-h-[120px] py-1 leading-relaxed"
              />
              {loading ? (
                <button
                  onClick={handleStop}
                  className="p-2 bg-[#252536] hover:bg-[#151522] text-white rounded-xl shadow-xs transition-colors shrink-0"
                  aria-label="Stop generating"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              ) : (
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className="p-2 bg-[#7561A8] hover:bg-[#51416F] disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-[9px] text-center text-[#8B8D98] mt-1.5">
              MatLink AI can make mistakes. Verify structural specifications with a site engineer.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
