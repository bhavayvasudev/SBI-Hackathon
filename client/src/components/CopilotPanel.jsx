import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, RotateCcw, ChevronRight } from 'lucide-react';
import { streamCopilotMessage } from '../lib/api.js';

/* ─── Suggestion chips ─────────────────────────────── */
const SUGGESTIONS = [
  { label: 'Portfolio summary', query: 'Give me a summary of my portfolio performance.' },
  { label: 'Loan eligibility', query: 'What loans am I eligible for based on my income?' },
  { label: 'Tax saving tips', query: 'How much tax can I save this year? What should I invest in?' },
  { label: 'Investment advice', query: 'Suggest the best investments for my goals.' },
  { label: 'SIP recommendation', query: 'Should I increase my SIP amount? What do you recommend?' },
  { label: 'Home loan EMI', query: 'What EMI would I pay on a ₹30 lakh home loan for 20 years?' },
  { label: 'Explain my returns', query: 'Explain my investment returns and if they are good.' },
  { label: 'Emergency fund', query: 'Do I have an adequate emergency fund? What should I set aside?' },
];

/* ─── Message bubble ───────────────────────────────── */
function MessageBubble({ msg, isStreaming }) {
  const isUser = msg.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse pl-10' : 'flex-row pr-10'}`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 self-end mb-0.5"
          style={{
            background: 'linear-gradient(135deg, #1d1d1f 0%, #3730a3 100%)',
            boxShadow: '0 2px 10px rgba(55,48,163,0.3)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      {/* Bubble */}
      <div
        style={{
          maxWidth: '78%',
          fontSize: '14.5px',
          lineHeight: '1.65',
          padding: '12px 16px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          ...(isUser
            ? {
                background: 'linear-gradient(145deg, #1e3a8a 0%, #3730a3 50%, #4f46e5 100%)',
                borderRadius: '18px 18px 5px 18px',
                color: '#ffffff',
                boxShadow: '0 3px 16px rgba(79,70,229,0.28), inset 0 1px 0 rgba(255,255,255,0.1)',
              }
            : {
                background: 'rgba(255,255,255,0.96)',
                borderRadius: '18px 18px 18px 5px',
                color: '#1d1d1f',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)',
                backdropFilter: 'blur(12px)',
              }),
        }}
      >
        {msg.content}
        {isStreaming && !isUser && (
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '13px',
              marginLeft: '3px',
              verticalAlign: 'middle',
              borderRadius: '2px',
              background: '#4f46e5',
              animation: 'copilot-cursor 0.7s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 self-end mb-0.5"
          style={{
            background: 'rgba(0,0,0,0.06)',
            color: '#6e6e73',
            border: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          {msg._initial || 'U'}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Typing indicator ─────────────────────────────── */
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      className="flex items-end gap-3 pr-10"
    >
      <div
        className="w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1d1d1f 0%, #3730a3 100%)',
          boxShadow: '0 2px 10px rgba(55,48,163,0.3)',
        }}
      >
        <Sparkles className="w-3.5 h-3.5 text-white" />
      </div>
      <div
        style={{
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(0,0,0,0.08)',
          borderRadius: '18px 18px 18px 5px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        <div className="flex gap-[5px] items-center" style={{ height: '1rem' }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#8e8e93',
                animation: 'copilot-dot 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Welcome state ────────────────────────────────── */
function WelcomeState({ customerName, onSuggest }) {
  const firstName = (customerName || 'there').split(' ')[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center h-full px-6 text-center"
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 20 }}
        className="w-16 h-16 rounded-[20px] flex items-center justify-center mb-5"
        style={{
          background: 'linear-gradient(135deg, #1d1d1f 0%, #3730a3 60%, #4f46e5 100%)',
          boxShadow: '0 8px 32px rgba(79,70,229,0.28)',
        }}
      >
        <Sparkles className="w-7 h-7 text-white" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        className="text-[22px] font-bold tracking-tight mb-2"
        style={{ color: '#1d1d1f' }}
      >
        Hi {firstName}, I'm your<br />
        <span style={{ color: '#4f46e5' }}>AI Banking Copilot</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="text-[13.5px] mb-8 max-w-xs"
        style={{ color: '#6e6e73', lineHeight: 1.6 }}
      >
        Ask me anything about your portfolio, loans,<br />
        investments, tax savings, or banking.
      </motion.p>

      {/* Suggestion chips */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-sm space-y-2"
      >
        {SUGGESTIONS.slice(0, 4).map((s, i) => (
          <motion.button
            key={s.label}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.32 + i * 0.06 }}
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggest(s.query)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all"
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <span className="text-[13px] font-medium" style={{ color: '#1d1d1f' }}>{s.label}</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#aeaeb2' }} />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main Copilot Panel ───────────────────────────── */
export default function CopilotPanel({ customerName, userInitial }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingRef = useRef(false); // dedup guard

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showTyping]);

  const sendMessage = useCallback(async (text) => {
    const trimmed = text.trim();
    if (!trimmed || streamingRef.current) return;

    setError(null);
    streamingRef.current = true;
    setIsStreaming(true);

    const userMsg = { role: 'user', content: trimmed, _initial: userInitial || 'U' };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    // Show typing indicator briefly before stream starts
    setShowTyping(true);

    try {
      const reader = await streamCopilotMessage(
        nextMessages.map(m => ({ role: m.role, content: m.content }))
      );

      const decoder = new TextDecoder();
      let accumulated = '';
      let assistantAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;
          try {
            const data = JSON.parse(raw);

            if (data.type === 'delta') {
              accumulated += data.text;
              setShowTyping(false);
              if (!assistantAdded) {
                setMessages(prev => [...prev, { role: 'assistant', content: accumulated }]);
                assistantAdded = true;
              } else {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: accumulated };
                  return updated;
                });
              }
            } else if (data.type === 'done') {
              setShowTyping(false);
              if (!assistantAdded && data.fullText) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.fullText }]);
              } else if (data.fullText) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: 'assistant', content: data.fullText };
                  return updated;
                });
              }
            } else if (data.type === 'error') {
              setShowTyping(false);
              setMessages(prev => [...prev, { role: 'assistant', content: data.message }]);
              assistantAdded = true;
            }
          } catch { /* skip malformed */ }
        }
      }
    } catch (err) {
      setShowTyping(false);
      const msg = err.message?.includes('401')
        ? 'Session expired. Please sign in again.'
        : 'I\'m having trouble connecting right now. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
      setError(msg);
    } finally {
      streamingRef.current = false;
      setIsStreaming(false);
      setShowTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, userInitial]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        height: 'calc(100vh - 180px)',
        minHeight: 500,
        maxHeight: 820,
        background: 'rgba(248,248,250,0.95)',
        border: '1px solid rgba(0,0,0,0.08)',
        boxShadow: '0 2px 24px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-5 py-4 flex-shrink-0"
        style={{
          background: 'rgba(255,255,255,0.8)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-[11px] flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #1d1d1f 0%, #3730a3 100%)',
              boxShadow: '0 2px 10px rgba(55,48,163,0.25)',
            }}
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[14px] font-semibold" style={{ color: '#1d1d1f' }}>AI Banking Copilot</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" style={{ boxShadow: '0 0 4px rgba(16,185,129,0.6)' }} />
              <p className="text-[11px]" style={{ color: '#8e8e93' }}>Powered by Gemini · Personalized for you</p>
            </div>
          </div>
        </div>
        {hasMessages && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-medium transition-colors"
            style={{ color: '#6e6e73', background: 'rgba(0,0,0,0.05)' }}
          >
            <RotateCcw className="w-3 h-3" />
            New chat
          </motion.button>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4" style={{ scrollBehavior: 'smooth' }}>
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <WelcomeState key="welcome" customerName={customerName} onSuggest={sendMessage} />
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              <AnimatePresence>
                {showTyping && <TypingDots key="typing" />}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestion chips (compact row, shown when messages exist) ── */}
      {hasMessages && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-5 pb-2 flex gap-2 overflow-x-auto flex-shrink-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {SUGGESTIONS.slice(4).map(s => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.query)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-medium whitespace-nowrap transition-all"
              style={{
                background: 'rgba(79,70,229,0.08)',
                color: '#4f46e5',
                border: '1px solid rgba(79,70,229,0.15)',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.14)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.08)'; }}
            >
              {s.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Input bar ── */}
      <div
        className="px-4 py-4 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,0.8)', borderTop: '1px solid rgba(0,0,0,0.07)' }}
      >
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <div
            className="flex-1 flex items-end rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(0,0,0,0.04)',
              border: '1px solid rgba(0,0,0,0.09)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
              transition: 'border-color 0.15s',
            }}
            onFocusCapture={e => { e.currentTarget.style.borderColor = 'rgba(79,70,229,0.4)'; }}
            onBlurCapture={e => { e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)'; }}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your portfolio, loans, investments…"
              rows={1}
              disabled={isStreaming}
              className="flex-1 bg-transparent px-4 py-3 resize-none outline-none text-[14px]"
              style={{
                color: '#1d1d1f',
                lineHeight: 1.5,
                maxHeight: 120,
                minHeight: 44,
                fontFamily: 'inherit',
              }}
            />
          </div>

          <motion.button
            type="submit"
            disabled={!input.trim() || isStreaming}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            className="w-11 h-11 rounded-[14px] flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              background: input.trim() && !isStreaming
                ? 'linear-gradient(135deg, #3730a3, #4f46e5)'
                : 'rgba(0,0,0,0.08)',
              boxShadow: input.trim() && !isStreaming
                ? '0 3px 14px rgba(79,70,229,0.32)'
                : 'none',
            }}
          >
            {isStreaming ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="w-4 h-4 rounded-full border-2"
                style={{ borderColor: 'rgba(0,0,0,0.2)', borderTopColor: '#4f46e5' }}
              />
            ) : (
              <Send
                className="w-4 h-4"
                style={{ color: input.trim() ? '#fff' : '#aeaeb2' }}
              />
            )}
          </motion.button>
        </form>

        {/* Disclaimer */}
        <p className="text-center text-[10.5px] mt-2.5" style={{ color: '#aeaeb2' }}>
          AI responses are illustrative. Consult a certified advisor for financial decisions.
        </p>
      </div>

      <style>{`
        @keyframes copilot-cursor {
          0%, 100% { opacity: 0.8; }
          50% { opacity: 0; }
        }
        @keyframes copilot-dot {
          0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
          40% { transform: scale(1.3); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
