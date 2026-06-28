import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Sparkles, RotateCcw,
  TrendingUp, Shield, BarChart2, Wallet,
  Calculator, Home, Mic, Paperclip, Activity,
} from 'lucide-react';
import { streamCopilotMessage } from '../lib/api.js';

/* ─── Suggestions (enriched) ──────────────────────────── */
const SUGGESTIONS = [
  { label: 'Optimize SIP',     query: 'Should I increase my SIP amount? What do you recommend?',                icon: Activity,   iconColor: '#1A56DB', iconBg: '#EFF6FF', description: 'Rebalance fund allocation',     impact: '+₹18K/yr',     time: '2 min' },
  { label: 'Tax Planning',     query: 'How much tax can I save this year? What should I invest in?',           icon: Calculator, iconColor: '#7C3AED', iconBg: '#F5F3FF', description: 'Maximize 80C deductions',       impact: '₹46,800 saved', time: '3 min' },
  { label: 'Loan Check',       query: 'What loans am I eligible for based on my income?',                      icon: Home,       iconColor: '#059669', iconBg: '#ECFDF5', description: 'Based on score & income',       impact: 'Up to ₹40L',   time: '1 min' },
  { label: 'Portfolio Review', query: 'Give me a summary of my portfolio performance.',                        icon: BarChart2,  iconColor: '#D97706', iconBg: '#FFFBEB', description: 'Identify underperformers',      impact: '+2.4% returns', time: '5 min' },
  { label: 'Emergency Fund',   query: 'Do I have an adequate emergency fund? What should I set aside?',        icon: Shield,     iconColor: '#DC2626', iconBg: '#FEF2F2', description: 'Cover 6 months expenses',       impact: '₹2.1L target',  time: '2 min' },
  { label: 'Home Loan EMI',    query: 'What EMI would I pay on a ₹30 lakh home loan for 20 years?',           icon: Wallet,     iconColor: '#0891B2', iconBg: '#ECFEFF', description: 'EMI & tenure planning',         impact: '₹30L loan',     time: '1 min' },
  { label: 'Investment Ideas', query: 'Suggest the best investments for my goals.',                            icon: TrendingUp, iconColor: '#D97706', iconBg: '#FFFBEB', description: 'Goal-aligned strategies',       impact: '+15% potential', time: '4 min' },
  { label: 'Explain Returns',  query: 'Explain my investment returns and if they are good.',                   icon: TrendingUp, iconColor: '#059669', iconBg: '#ECFDF5', description: 'CAGR vs. benchmark',            impact: 'Full analysis',  time: '3 min' },
];

/* ─── AI Avatar ───────────────────────────────────────── */
function AIAvatar({ size = 40 }) {
  const br = Math.round(size * 0.3);
  return (
    <div style={{ position: 'relative', flexShrink: 0, width: size, height: size }}>
      <motion.div
        animate={{ scale: [1, 1.6, 1], opacity: [0.22, 0, 0.22] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeOut' }}
        style={{
          position: 'absolute', top: -5, left: -5, right: -5, bottom: -5,
          borderRadius: br + 5, background: 'rgba(26,86,219,0.18)', zIndex: 0,
        }}
      />
      <div style={{
        width: size, height: size, borderRadius: br,
        background: 'linear-gradient(145deg, #1556CB 0%, #1A56DB 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
        boxShadow: '0 4px 18px rgba(26,86,219,0.3)',
      }}>
        <Sparkles style={{ width: size * 0.42, height: size * 0.42, color: '#fff' }} />
      </div>
    </div>
  );
}

/* ─── User Avatar ─────────────────────────────────────── */
function UserAvatar({ initial }) {
  return (
    <div style={{
      width: 32, height: 32, borderRadius: '50%',
      background: '#F1F5F9', border: '1.5px solid #E2E8F0',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, fontSize: 12, fontWeight: 600, color: '#475569',
    }}>
      {initial || 'U'}
    </div>
  );
}

/* ─── Typing indicator ────────────────────────────────── */
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}
    >
      <AIAvatar size={36} />
      <div style={{
        padding: '14px 18px',
        background: '#FFFFFF',
        border: '1px solid rgba(15,23,42,0.07)',
        borderRadius: '4px 20px 20px 20px',
        boxShadow: '0 2px 12px rgba(15,23,42,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 16 }}>
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
              style={{
                display: 'inline-block', width: 5, height: 5,
                borderRadius: '50%', background: '#94A3B8',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Message bubble ──────────────────────────────────── */
function MessageBubble({ msg, isStreaming }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {!isUser ? <AIAvatar size={36} /> : <UserAvatar initial={msg._initial} />}
      <div style={{
        whiteSpace: 'pre-wrap', wordBreak: 'break-word',
        fontSize: 14, lineHeight: 1.75,
        ...(isUser ? {
          maxWidth: '72%',
          background: 'rgba(26,86,219,0.07)',
          border: '1px solid rgba(26,86,219,0.13)',
          borderRadius: '20px 4px 20px 20px',
          padding: '10px 16px',
          color: '#1E40AF',
          fontWeight: 500,
        } : {
          flex: 1,
          background: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.07)',
          borderRadius: '4px 20px 20px 20px',
          padding: '18px 22px',
          boxShadow: '0 2px 16px rgba(15,23,42,0.06)',
          color: '#1C1C1E',
        }),
      }}>
        {msg.content}
        {isStreaming && !isUser && (
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.65, repeat: Infinity }}
            style={{
              display: 'inline-block', width: 2, height: 14,
              background: '#1A56DB', marginLeft: 3,
              verticalAlign: 'middle', borderRadius: 2,
            }}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ─── Hero Card ───────────────────────────────────────── */
function HeroCard({ customerName }) {
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = (customerName || 'there').split(' ')[0];

  const metrics = [
    { label: 'Net Worth',       value: '₹8.2L',  change: '+₹12,400' },
    { label: 'Monthly Savings', value: '₹34K',   change: '+12%' },
    { label: 'Goal Progress',   value: '74%',    change: '▲ On track' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        margin: '16px 16px 0',
        borderRadius: 22,
        background: 'linear-gradient(145deg, #0D1B3E 0%, #1A3A8A 52%, #1E54C0 100%)',
        padding: '22px 22px 20px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(26,86,219,0.26), 0 2px 8px rgba(0,0,0,0.12)',
      }}
    >
      {/* Decorative glow blobs */}
      <div style={{ position: 'absolute', top: -40, right: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(36px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -30, left: 10, width: 130, height: 130, borderRadius: '50%', background: 'rgba(99,179,237,0.06)', filter: 'blur(28px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: 15, left: '55%', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(16px)', pointerEvents: 'none' }} />

      <motion.p
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 500, marginBottom: 7 }}
      >
        {greeting}, {firstName}
      </motion.p>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{ fontSize: 17, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4, letterSpacing: '-0.2px', marginBottom: 5 }}
      >
        Your net worth grew{' '}
        <span style={{ color: '#6EE7B7' }}>₹12,400</span> this month.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.14 }}
        style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 20, lineHeight: 1.5 }}
      >
        What would you like to achieve today?
      </motion.p>

      <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', marginBottom: 16 }} />

      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18 }}
        style={{ display: 'flex' }}
      >
        {metrics.map((m, i) => (
          <div
            key={m.label}
            style={{
              flex: 1,
              paddingRight: i < metrics.length - 1 ? 14 : 0,
              borderRight: i < metrics.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              paddingLeft: i > 0 ? 14 : 0,
            }}
          >
            <p style={{ fontSize: 8.5, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 5 }}>
              {m.label}
            </p>
            <p style={{ fontSize: 15, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.3px', marginBottom: 3 }}>
              {m.value}
            </p>
            <p style={{ fontSize: 10, fontWeight: 600, color: '#6EE7B7' }}>
              {m.change}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Financial Widgets ───────────────────────────────── */
function FinancialWidgets() {
  return (
    <div style={{
      padding: '12px 16px 0',
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gridTemplateRows: 'auto auto',
      gap: 10,
    }}>

      {/* Credit Score — tall, spans 2 rows */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          gridRow: 'span 2',
          borderRadius: 20,
          background: '#FFFFFF',
          border: '1px solid rgba(15,23,42,0.07)',
          padding: '18px 16px',
          boxShadow: '0 2px 14px rgba(15,23,42,0.06)',
          display: 'flex', flexDirection: 'column',
        }}
      >
        <p style={{ fontSize: 8.5, color: '#94A3B8', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 10 }}>
          Credit Score
        </p>
        <p style={{ fontSize: 46, fontWeight: 900, color: '#059669', letterSpacing: '-2px', lineHeight: 1, marginBottom: 4 }}>
          782
        </p>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#059669', marginBottom: 14 }}>▲ Excellent</p>

        <div style={{ height: 5, borderRadius: 5, background: '#F1F5F9', overflow: 'hidden', marginBottom: 4 }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '78%' }}
            transition={{ delay: 0.55, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: '100%', borderRadius: 5, background: 'linear-gradient(90deg, #10B981, #34D399)' }}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontSize: 9, color: '#CBD5E1' }}>300</span>
          <span style={{ fontSize: 9, color: '#CBD5E1' }}>900</span>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {['Home Loan', 'Car Loan', 'Premium CC'].map(tag => (
            <span key={tag} style={{
              display: 'inline-block', marginRight: 4, marginBottom: 4,
              fontSize: 9.5, color: '#059669', background: '#ECFDF5',
              padding: '2px 7px', borderRadius: 5, fontWeight: 600,
            }}>
              {tag}
            </span>
          ))}
          <p style={{ fontSize: 10, color: '#94A3B8', marginTop: 6 }}>Eligible for premium rates</p>
        </div>
      </motion.div>

      {/* Portfolio Health */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.24 }}
        style={{
          borderRadius: 20,
          background: 'linear-gradient(145deg, #EFF6FF, #DBEAFE)',
          border: '1px solid rgba(26,86,219,0.1)',
          padding: '14px 14px',
          boxShadow: '0 2px 10px rgba(26,86,219,0.08)',
        }}
      >
        <p style={{ fontSize: 8.5, color: '#93C5FD', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 6 }}>
          Portfolio
        </p>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#1A56DB', letterSpacing: '-0.3px', marginBottom: 2 }}>Excellent</p>
        <p style={{ fontSize: 10.5, color: '#60A5FA', fontWeight: 500 }}>5 funds · All healthy</p>
      </motion.div>

      {/* Savings Opportunity */}
      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.29 }}
        style={{
          borderRadius: 20,
          background: 'linear-gradient(145deg, #F5F3FF, #EDE9FE)',
          border: '1px solid rgba(124,58,237,0.1)',
          padding: '14px 14px',
          boxShadow: '0 2px 10px rgba(124,58,237,0.07)',
        }}
      >
        <p style={{ fontSize: 8.5, color: '#C4B5FD', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 6 }}>
          Save Potential
        </p>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#7C3AED', letterSpacing: '-0.3px', marginBottom: 2 }}>₹12K/mo</p>
        <p style={{ fontSize: 10.5, color: '#A78BFA', fontWeight: 500 }}>Identified for you</p>
      </motion.div>
    </div>
  );
}

/* ─── Suggestion Section ──────────────────────────────── */
function SuggestionSection({ onSuggest }) {
  return (
    <div style={{ padding: '16px 16px 16px' }}>
      <p style={{ fontSize: 9, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: 10 }}>
        Recommended Actions
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {SUGGESTIONS.slice(0, 6).map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 + i * 0.05 }}
              whileHover={{ y: -3, boxShadow: '0 8px 26px rgba(15,23,42,0.12)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSuggest(s.query)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                padding: '13px 12px',
                borderRadius: 18,
                background: '#FFFFFF',
                border: '1px solid rgba(15,23,42,0.07)',
                boxShadow: '0 2px 8px rgba(15,23,42,0.05)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'box-shadow 0.2s ease',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10,
                background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 9, flexShrink: 0,
              }}>
                <Icon style={{ width: 15, height: 15, color: s.iconColor }} />
              </div>

              <span style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', lineHeight: 1.3, marginBottom: 3, display: 'block' }}>
                {s.label}
              </span>
              <span style={{ fontSize: 10.5, color: '#94A3B8', lineHeight: 1.4, marginBottom: 9, display: 'block' }}>
                {s.description}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 9.5, fontWeight: 700, color: s.iconColor, background: s.iconBg, padding: '2px 7px', borderRadius: 5 }}>
                  {s.impact}
                </span>
                <span style={{ fontSize: 9.5, color: '#CBD5E1', fontWeight: 500 }}>
                  · {s.time}
                </span>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Welcome content (hero + widgets + suggestions) ─── */
function WelcomeContent({ customerName, onSuggest }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.25 }}
    >
      <HeroCard customerName={customerName} />
      <FinancialWidgets />
      <SuggestionSection onSuggest={onSuggest} />
    </motion.div>
  );
}

/* ─── Main CopilotPanel ───────────────────────────────── */
export default function CopilotPanel({ customerName, userInitial }) {
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [error, setError]           = useState(null);
  const [inputFocused, setInputFocused] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const streamingRef   = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, showTyping]);

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
        : "I'm having trouble connecting right now. Please try again.";
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
      setError(msg);
    } finally {
      streamingRef.current = false;
      setIsStreaming(false);
      setShowTyping(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [messages, userInitial]);

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  const handleReset = () => {
    setMessages([]);
    setError(null);
    setInput('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const hasMessages = messages.length > 0;

  return (
    <div style={{
      height: 'calc(100vh - 180px)',
      minHeight: 520, maxHeight: 860,
      display: 'flex', flexDirection: 'column',
      borderRadius: 24, overflow: 'hidden',
      background: '#F7F8FC',
      border: '1px solid rgba(15,23,42,0.08)',
      boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
    }}>

      {/* ── Compact identity bar ── */}
      <div style={{
        padding: '13px 18px',
        background: '#FFFFFF',
        borderBottom: '1px solid rgba(15,23,42,0.07)',
        flexShrink: 0,
        display: 'flex', alignItems: 'center', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -20, left: -20, width: 100, height: 100,
          background: 'rgba(26,86,219,0.05)', filter: 'blur(28px)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

        <AIAvatar size={42} />

        <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 14.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.3px', lineHeight: 1.2, marginBottom: 4 }}>
            HyperOne Intelligence
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
              <motion.div
                animate={{ scale: [1, 2.3, 1], opacity: [0.45, 0, 0.45] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#10B981' }}
              />
              <div style={{ position: 'absolute', inset: 1, borderRadius: '50%', background: '#10B981' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>Online</span>
            <span style={{ fontSize: 11, color: '#CBD5E1' }}>· Your personal financial strategist</span>
          </div>
        </div>

        <AnimatePresence>
          {hasMessages && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              whileHover={{ scale: 1.04, background: 'rgba(15,23,42,0.08)' }}
              whileTap={{ scale: 0.96 }}
              onClick={handleReset}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 10,
                background: 'rgba(15,23,42,0.05)',
                border: 'none', cursor: 'pointer',
                fontSize: 11.5, fontWeight: 500, color: '#64748B',
                flexShrink: 0, position: 'relative', zIndex: 1,
              }}
            >
              <RotateCcw style={{ width: 11, height: 11 }} />
              New chat
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main scrollable area ── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        display: 'flex', flexDirection: 'column',
        ...(hasMessages ? { padding: '20px 18px', gap: 16 } : {}),
        scrollBehavior: 'smooth',
      }}>
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <WelcomeContent
              key="welcome"
              customerName={customerName}
              onSuggest={sendMessage}
            />
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
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

      {/* ── Quick chips (chat mode, after AI responds) ── */}
      {hasMessages && !isStreaming && (
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '8px 18px 4px',
            display: 'flex', gap: 8, overflowX: 'auto',
            scrollbarWidth: 'none', flexShrink: 0,
          }}
        >
          {SUGGESTIONS.slice(4).map(s => (
            <button
              key={s.label}
              onClick={() => sendMessage(s.query)}
              style={{
                flexShrink: 0, padding: '6px 14px',
                borderRadius: 20, fontSize: 12, fontWeight: 500,
                whiteSpace: 'nowrap', cursor: 'pointer',
                background: 'rgba(26,86,219,0.07)',
                color: '#1A56DB',
                border: '1px solid rgba(26,86,219,0.12)',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(26,86,219,0.13)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(26,86,219,0.07)'; }}
            >
              {s.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Floating composer ── */}
      <div style={{
        padding: '10px 14px 14px',
        background: '#FFFFFF',
        borderTop: '1px solid rgba(15,23,42,0.07)',
        flexShrink: 0,
      }}>
        <form onSubmit={handleSubmit}>
          <motion.div
            animate={{
              boxShadow: inputFocused
                ? '0 0 0 2.5px rgba(26,86,219,0.18), 0 6px 24px rgba(15,23,42,0.09)'
                : '0 2px 12px rgba(15,23,42,0.07)',
              borderColor: inputFocused
                ? 'rgba(26,86,219,0.28)'
                : 'rgba(15,23,42,0.09)',
            }}
            transition={{ duration: 0.18 }}
            style={{
              display: 'flex', alignItems: 'flex-end', gap: 6,
              background: '#F8FAFC',
              border: '1.5px solid rgba(15,23,42,0.09)',
              borderRadius: 28,
              padding: '8px 8px 8px 14px',
            }}
          >
            <motion.button
              type="button"
              whileHover={{ scale: 1.12, color: '#1A56DB' }}
              whileTap={{ scale: 0.88 }}
              style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#CBD5E1', alignSelf: 'flex-end', marginBottom: 2,
              }}
            >
              <Paperclip style={{ width: 15, height: 15 }} />
            </motion.button>

            <textarea
              ref={inputRef}
              value={input}
              onChange={e => {
                setInput(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setInputFocused(true)}
              onBlur={() => setInputFocused(false)}
              placeholder="Ask your AI banker anything..."
              rows={1}
              disabled={isStreaming}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                resize: 'none', outline: 'none',
                fontSize: 14, color: '#0F172A', lineHeight: 1.55,
                minHeight: 36, maxHeight: 120, fontFamily: 'inherit',
                padding: '8px 0',
              }}
            />

            <motion.button
              type="button"
              whileHover={{ scale: 1.12, color: '#1A56DB' }}
              whileTap={{ scale: 0.88 }}
              style={{
                width: 30, height: 30, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: '#CBD5E1', alignSelf: 'flex-end', marginBottom: 2,
              }}
            >
              <Mic style={{ width: 15, height: 15 }} />
            </motion.button>

            <motion.button
              type="submit"
              disabled={!input.trim() || isStreaming}
              whileHover={input.trim() && !isStreaming ? { scale: 1.08 } : {}}
              whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
              style={{
                width: 38, height: 38, borderRadius: 14, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: input.trim() && !isStreaming
                  ? 'linear-gradient(135deg, #1556CB, #1A56DB)'
                  : 'rgba(15,23,42,0.07)',
                border: 'none',
                cursor: input.trim() && !isStreaming ? 'pointer' : 'default',
                boxShadow: input.trim() && !isStreaming
                  ? '0 3px 14px rgba(26,86,219,0.32)' : 'none',
                transition: 'background 0.2s ease, box-shadow 0.2s ease',
                alignSelf: 'flex-end', marginBottom: 1,
              }}
            >
              {isStreaming ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  style={{
                    width: 14, height: 14, borderRadius: '50%',
                    border: '2px solid rgba(15,23,42,0.15)',
                    borderTopColor: '#1A56DB',
                  }}
                />
              ) : (
                <Send style={{ width: 15, height: 15, color: input.trim() ? '#fff' : '#CBD5E1' }} />
              )}
            </motion.button>
          </motion.div>
        </form>

        <p style={{ textAlign: 'center', fontSize: 10.5, marginTop: 8, color: '#CBD5E1', lineHeight: 1.4 }}>
          AI responses are illustrative. Consult a certified advisor for financial decisions.
        </p>
      </div>
    </div>
  );
}
