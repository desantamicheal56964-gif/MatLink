import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Bot,
  User,
  ExternalLink,
  ChevronDown,
  Minimize2,
  Maximize2,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
}

const SUGGESTED_QUESTIONS = [
  'How do I sell my leftover cement in Hinjawadi?',
  'How does the AI Material Inspector work?',
  'Where can I find red bricks near Kharadi?',
  'How much money can buyers save on surplus steel?',
  'How does this platform reduce construction waste in Pune?',
];

export const Chatbot: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome_msg',
      role: 'assistant',
      content: `Hello! 👋 I'm **BuildSmart AI Assistant**, your intelligent guide to the **CircuBuild Platform** in Pune.\n\nI can help you list leftover materials, find surplus stock across Pune sites, explain our AI Vision Inspector, or calculate your circular economy savings. How can I help you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async (messageToSend?: string) => {
    const text = (messageToSend || input).trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setLastError(null);

    try {
      const response = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am ready to help with your construction material questions in Pune.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chatbot error:', err);
      setLastError('Could not connect to AI service. Click retry to resend.');
      setMessages((prev) => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          role: 'assistant',
          content: `I ran into an issue connecting to the AI backend. ${err.message || ''}\n\nYou can click **Retry** or ask another question about Pune construction sites and materials.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome_msg_reset',
        role: 'assistant',
        content: `Chat session cleared. How else can I assist with your construction material listings or searches today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLastError(null);
  };

  const formatMarkdown = (text: string) => {
    // Basic formatting for bullets and bold text
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let formatted = line;
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-bold text-[#51416F] text-xs mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const content = line.substring(2);
        return (
          <li key={idx} className="ml-3 list-disc text-xs my-0.5">
            {renderBold(content)}
          </li>
        );
      }
      if (/^\d+\.\s/.test(line)) {
        return (
          <p key={idx} className="text-xs my-1 pl-1">
            {renderBold(line)}
          </p>
        );
      }
      return (
        <p key={idx} className="text-xs my-1">
          {renderBold(formatted)}
        </p>
      );
    });
  };

  const renderBold = (str: string) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-[#252536]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#7561A8] to-[#51416F] text-white shadow-xl shadow-[#7561A8]/40 hover:scale-105 transition-all group focus:outline-hidden"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#72B9E8] rounded-full ring-2 ring-[#7561A8]" />
          </div>
          <span className="text-xs md:text-sm font-semibold tracking-wide">
            BuildSmart AI
          </span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#72B9E8] text-[#252536]">
            Online
          </span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed right-4 md:right-6 bottom-4 md:bottom-6 z-50 w-[92vw] sm:w-[410px] bg-white rounded-3xl shadow-2xl border border-[#7561A8]/20 flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'h-16' : 'h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-[#7561A8] via-[#635091] to-[#51416F] text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-[#72B9E8]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm tracking-tight">BuildSmart AI</h3>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#72B9E8] text-[#252536]">
                    Gemini 3.8
                  </span>
                </div>
                <p className="text-[10px] text-purple-200">Pune Sustainable Construction Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-white/80">
              <button
                onClick={handleClear}
                title="Clear Chat History"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                title={isMinimized ? 'Maximize' : 'Minimize'}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Message Feed */}
              <div className="flex-1 p-4 overflow-y-auto bg-[#F1F2F5]/60 space-y-3 text-[#252536]">
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                          isUser
                            ? 'bg-[#7561A8] text-white'
                            : 'bg-white border border-[#7561A8]/30 text-[#7561A8] shadow-xs'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs leading-relaxed ${
                          isUser
                            ? 'bg-[#7561A8] text-white rounded-tr-none'
                            : 'bg-white text-[#252536] border border-gray-100 rounded-tl-none'
                        }`}
                      >
                        {isUser ? msg.content : formatMarkdown(msg.content)}
                        <span
                          className={`block text-[9px] mt-1 ${
                            isUser ? 'text-purple-200 text-right' : 'text-[#8B8D98]'
                          }`}
                        >
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex gap-2.5 items-center">
                    <div className="w-7 h-7 rounded-full bg-white border border-[#7561A8]/30 flex items-center justify-center text-[#7561A8] shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-2.5 shadow-xs flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#7561A8] rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      <span className="text-[11px] text-[#8B8D98] ml-2">BuildSmart AI is typing...</span>
                    </div>
                  </div>
                )}

                {lastError && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>{lastError}</span>
                    </div>
                    <button
                      onClick={() => handleSend(messages[messages.length - 2]?.content)}
                      className="px-2 py-1 bg-amber-200 hover:bg-amber-300 rounded font-semibold text-[10px]"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Questions Chips (when 3 or fewer messages) */}
              {messages.length <= 4 && (
                <div className="px-3 py-2 bg-white border-t border-gray-100">
                  <p className="text-[10px] font-semibold text-[#8B8D98] mb-1.5">Suggested Questions:</p>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {SUGGESTED_QUESTIONS.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(q)}
                        disabled={loading}
                        className="text-[10px] whitespace-nowrap bg-[#F1F2F5] hover:bg-[#7561A8]/10 text-[#51416F] hover:text-[#7561A8] font-medium px-2.5 py-1 rounded-full border border-gray-200 transition-colors shrink-0"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Footer */}
              <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about materials, sites, selling, or AI inspection..."
                  disabled={loading}
                  className="flex-1 bg-[#F1F2F5] text-xs text-[#252536] placeholder-[#8B8D98] px-3.5 py-2.5 rounded-xl border border-transparent focus:border-[#7561A8] focus:bg-white focus:outline-hidden transition-all"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || loading}
                  className="p-2.5 bg-[#7561A8] hover:bg-[#51416F] disabled:opacity-40 text-white rounded-xl shadow-xs transition-colors shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
