import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Zap, Sparkles, CheckCircle, ShieldCheck, ChevronRight, Plus,
  Search, MessageSquare, TrendingUp, PiggyBank, CreditCard, Shield,
  BarChart2, Landmark, Mic, Paperclip, X, Download, LayoutDashboard,
  User, Brain, Star, Target, Wallet, Home, RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBubble from '../components/chat/ChatBubble.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import ProductCard from '../components/chat/ProductCard.jsx';
import useChatStore from '../store/chatStore.js';
import { getRecommendations } from '../lib/api.js';

/* ─── CSS ──────────────────────────────────────────────────────── */
const CHAT_CSS = `
  @keyframes chatAmbFloat {
    0%, 100% { transform: translateY(0) scale(1); opacity: 0.07; }
    50%       { transform: translateY(-14px) scale(1.05); opacity: 0.13; }
  }
  @keyframes chatStatusPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.55; transform: scale(0.82); }
  }
  .chat-sidebar-cat {
    transition: background 0.16s ease, transform 0.16s ease;
  }
  .chat-sidebar-cat:hover {
    background: rgba(10,40,130,0.07) !important;
    transform: translateX(3px);
  }
  .chat-input-wrap:focus-within {
    border-color: rgba(10,88,245,0.32) !important;
    box-shadow: 0 0 0 4px rgba(10,88,245,0.07), 0 10px 40px rgba(0,0,0,0.1) !important;
  }
  .chat-input-wrap { transition: border-color 0.2s ease, box-shadow 0.2s ease; }
  .chat-sug-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .chat-sug-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 36px rgba(0,0,0,0.12) !important;
    border-color: rgba(10,88,245,0.28) !important;
  }
  .chat-qr-pill {
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .chat-qr-pill:hover {
    background: rgba(10,88,245,0.09) !important;
    border-color: rgba(10,88,245,0.28) !important;
    color: #0A58F5 !important;
  }
  .chat-widget-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .chat-widget-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 44px rgba(0,0,0,0.1) !important;
  }
`;

/* ─── Data ─────────────────────────────────────────────────────── */
const CATEGORIES = [
  { icon: TrendingUp,  label: 'Investments',    color: '#059669', prompt: 'Help me plan my investments and choose the right options' },
  { icon: Landmark,    label: 'Loans',           color: '#d97706', prompt: 'What loan options are available and how do I qualify?' },
  { icon: Shield,      label: 'Insurance',       color: '#7c3aed', prompt: 'Help me choose the right insurance coverage for my needs' },
  { icon: PiggyBank,   label: 'Savings',         color: '#0A58F5', prompt: 'How can I improve my savings and reach my financial goals?' },
  { icon: Target,      label: 'Tax Planning',    color: '#dc2626', prompt: 'What tax planning strategies should I use this financial year?' },
  { icon: BarChart2,   label: 'Budgeting',       color: '#0891b2', prompt: 'Create a personalized monthly budget plan for me' },
  { icon: Star,        label: 'Wealth Insights', color: '#d97706', prompt: 'Give me wealth management insights based on my profile' },
  { icon: Wallet,      label: 'FD & SIP',        color: '#7c3aed', prompt: 'Compare Fixed Deposit and SIP investment options for me' },
];

const SUGGESTIONS = [
  { text: 'Where should I invest ₹50,000?',       icon: TrendingUp, color: '#059669' },
  { text: 'Help me build an emergency fund',       icon: PiggyBank,  color: '#0A58F5' },
  { text: 'Recommend an SBI product for me',      icon: Sparkles,   color: '#7c3aed' },
  { text: 'Create a monthly SIP plan for me',     icon: BarChart2,  color: '#d97706' },
  { text: "What's my ideal risk profile?",        icon: Shield,     color: '#dc2626' },
  { text: 'Analyze my spending habits',           icon: Brain,      color: '#0891b2' },
];

const QUICK_REPLIES = ['Tell me more', 'How do I apply?', 'What are the risks?', 'Compare options'];

/* ─── Welcome Hero ─────────────────────────────────────────────── */
function WelcomeHero({ onSend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ maxWidth: 720, margin: '0 auto', padding: '52px 32px 40px', textAlign: 'center' }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          width: 80, height: 80, borderRadius: 24, margin: '0 auto 32px',
          background: 'linear-gradient(135deg, #0A1F6E, #0A58F5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 20px 56px rgba(10,88,245,0.32)',
        }}
      >
        <Zap style={{ width: 38, height: 38, color: 'white' }} />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.4 }}
        style={{
          fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: '#0A1F6E',
          letterSpacing: '-0.035em', lineHeight: 1.12, marginBottom: 18,
        }}
      >
        What can I help you<br />achieve today?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.4 }}
        style={{ fontSize: 16, color: '#6e6e73', lineHeight: 1.7, marginBottom: 52, maxWidth: 440, margin: '0 auto 52px' }}
      >
        Plan investments · Improve savings · Analyze spending · Get loan guidance
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.36, duration: 0.38 }}
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, textAlign: 'left' }}
      >
        {SUGGESTIONS.map((s, i) => (
          <motion.button
            key={i}
            className="chat-sug-card"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36 + i * 0.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSend(s.text)}
            style={{
              background: 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,0,0,0.07)',
              borderRadius: 18, padding: '18px 20px',
              cursor: 'pointer', textAlign: 'left',
              boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, marginBottom: 14,
              background: s.color + '16',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <s.icon style={{ width: 15, height: 15, color: s.color }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', lineHeight: 1.45, margin: 0 }}>
              {s.text}
            </p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

/* ─── Chat ─────────────────────────────────────────────────────── */
export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
  const [showClearModal, setShowClearModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    messages, addMessage, updateLastMessage, profile, setProfile,
    recommendations, setRecommendations, phase, setPhase,
    isStreaming, setStreaming, startTimer, reset,
  } = useChatStore();

  /* ── Business logic (verbatim from original) ── */
  const loadRecommendations = useCallback(async (profileData) => {
    try {
      const res = await getRecommendations(profileData);
      if (res.success) setRecommendations(res.data.recommendations);
    } catch { /* non-critical */ }
  }, [setRecommendations]);

  const streamMessage = useCallback(async (allMessages) => {
    setStreaming(true);
    addMessage({ role: 'assistant', content: '', id: Date.now() });
    try {
      const res = await fetch('/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: allMessages }),
      });
      if (!res.ok) throw new Error('Server unavailable');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
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
              updateLastMessage(accumulated);
            } else if (data.type === 'done') {
              updateLastMessage(data.cleanText || accumulated);
              if (data.profile) { setProfile(data.profile); setPhase('profile_complete'); await loadRecommendations(data.profile); }
              if (data.showProducts) setPhase('recommendations');
              if (data.gotoKyc) setPhase('kyc');
            } else if (data.type === 'error') {
              updateLastMessage(data.message || 'Something went wrong. Please try again.');
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } catch {
      updateLastMessage("I'm having trouble connecting right now. Please try again in a moment.");
      toast.error('Connection issue — please retry.');
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [addMessage, updateLastMessage, setStreaming, setProfile, setPhase, loadRecommendations]);

  const sendGreeting = useCallback(async () => {
    await streamMessage([{ role: 'user', content: 'Hello' }]);
  }, [streamMessage]);

  useEffect(() => {
    if (messages.length === 0 && !isStreaming) {
      startTimer();
      sendGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, recommendations]);

  /* ── Extended actions ── */
  const handleSend = async (textOverride) => {
    const text = (textOverride !== undefined ? textOverride : input).trim();
    if (!text || isStreaming) return;
    const userMessage = { role: 'user', content: text };
    addMessage(userMessage);
    setInput('');
    const allMessages = [...messages, userMessage].filter(m => m.content);
    await streamMessage(allMessages);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleExport = () => {
    const content = messages.filter(m => m.content).map(m =>
      `${m.role === 'user' ? 'You' : 'HyperOne AI'}: ${m.content}`
    ).join('\n\n');
    const el = document.createElement('a');
    el.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(content);
    el.download = 'hyperone-conversation.txt';
    el.click();
    toast.success('Conversation exported');
  };

  const handleClearChat = () => {
    reset();
    setShowClearModal(false);
    setTimeout(() => { startTimer(); sendGreeting(); }, 60);
    toast.success('Conversation cleared');
  };

  const conversationTitle = messages.find(m => m.role === 'user' && m.content)?.content?.slice(0, 42) || 'New Conversation';
  const hasMessages = messages.some(m => m.content && m.content.length > 0);
  const showWelcome = !hasMessages && !isStreaming;
  const lastMsgIsAI = !isStreaming && messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content;

  return (
    <div style={{
      display: 'flex', height: '100vh', overflow: 'hidden',
      fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#EEF1F8',
    }}>
      <style>{CHAT_CSS}</style>

      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(10,88,245,0.11) 1px, transparent 1px)',
          backgroundSize: '30px 30px', opacity: 0.55,
        }} />
        <div style={{
          position: 'absolute', top: '-8%', right: '-4%', width: 560, height: 560, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,88,245,0.14) 0%, transparent 70%)',
          animation: 'chatAmbFloat 9s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '15%', width: 440, height: 440, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(10,88,245,0.09) 0%, transparent 70%)',
          animation: 'chatAmbFloat 11s ease-in-out infinite 2.5s',
        }} />
      </div>

      {/* ── LEFT SIDEBAR ─────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          flexShrink: 0, height: '100vh', overflow: 'hidden',
          position: 'relative', zIndex: 10,
          background: 'rgba(255,255,255,0.76)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div style={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 16px 20px', overflowY: 'auto', overflowX: 'hidden' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 26, paddingLeft: 4 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #0A1F6E, #0A58F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(10,88,245,0.32)', flexShrink: 0 }}>
              <Zap style={{ width: 17, height: 17, color: 'white' }} />
            </div>
            <div>
              <p style={{ fontSize: 15, fontWeight: 800, color: '#0A1F6E', letterSpacing: '-0.025em', lineHeight: 1.1 }}>HyperOne</p>
              <p style={{ fontSize: 10, color: '#8e8e93', fontWeight: 500, marginTop: 2, letterSpacing: '0.02em' }}>AI Financial Copilot</p>
            </div>
          </div>

          {/* New Conversation */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => { reset(); setTimeout(() => { startTimer(); sendGreeting(); }, 60); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 18px', borderRadius: 14,
              background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)',
              border: 'none', cursor: 'pointer', marginBottom: 18,
              boxShadow: '0 4px 18px rgba(10,88,245,0.3)',
            }}
          >
            <Plus style={{ width: 16, height: 16, color: 'white' }} />
            <span style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>New Conversation</span>
          </motion.button>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 12, padding: '9px 14px', marginBottom: 22 }}>
            <Search style={{ width: 13, height: 13, color: '#8e8e93', flexShrink: 0 }} />
            <input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: 13, color: '#1a1a2e', flex: 1 }}
            />
          </div>

          {/* Recent */}
          <div style={{ marginBottom: 22 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>Recent</p>
            <div className="chat-sidebar-cat" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12, cursor: 'pointer', background: 'rgba(10,88,245,0.06)', border: '1px solid rgba(10,88,245,0.1)' }}>
              <MessageSquare style={{ width: 13, height: 13, color: '#0A58F5', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#1a1a2e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conversationTitle}</span>
              <span style={{ fontSize: 10, color: '#b0b0b8', flexShrink: 0 }}>Now</span>
            </div>
          </div>

          {/* Categories */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: '#b0b0b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, paddingLeft: 4 }}>Categories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {CATEGORIES.map((cat) => (
                <motion.button
                  key={cat.label}
                  className="chat-sidebar-cat"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setInput(cat.prompt); inputRef.current?.focus(); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none', textAlign: 'left', width: '100%' }}
                >
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: cat.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <cat.icon style={{ width: 13, height: 13, color: cat.color }} />
                  </div>
                  <span style={{ fontSize: 13, color: '#3d3d4a', fontWeight: 500 }}>{cat.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Sidebar Footer */}
          <div style={{ paddingTop: 16, borderTop: '1px solid rgba(0,0,0,0.07)', marginTop: 16 }}>
            <motion.button
              whileHover={{ x: 2 }} onClick={() => navigate('/my-dashboard')}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
            >
              <Home style={{ width: 14, height: 14, color: '#8e8e93' }} />
              <span style={{ fontSize: 13, color: '#6e6e73' }}>Go to Dashboard</span>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* ── MAIN AREA ────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', position: 'relative', zIndex: 1, minWidth: 0 }}>

        {/* ── TOP BAR ── */}
        <motion.header
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.36, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: 64, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 24px',
            background: 'rgba(238,241,248,0.88)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
          }}
        >
          {/* Left */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() => setSidebarOpen(v => !v)}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <LayoutDashboard style={{ width: 15, height: 15, color: '#4e4e52' }} />
            </motion.button>

            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#0A1F6E', letterSpacing: '-0.02em', lineHeight: 1.2, maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {conversationTitle.length > 38 ? conversationTitle.slice(0, 38) + '…' : conversationTitle}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 10, color: '#8e8e93' }}>
                  {phase === 'greeting' || phase === 'collection' ? 'Collecting profile' :
                   phase === 'profile_complete' || phase === 'recommendations' ? 'Recommendations ready' :
                   'KYC ready'}
                </span>
                <span style={{ color: '#d0d0d8', fontSize: 10 }}>·</span>
                <span style={{ fontSize: 10, color: '#b0b0b8' }}>{messages.filter(m => m.content).length} messages</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(0,0,0,0.07)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: isStreaming ? '#f59e0b' : '#10b981', animation: 'chatStatusPulse 2s ease-in-out infinite', flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: '#3d3d4a' }}>{isStreaming ? 'Thinking' : 'Online'}</span>
              <span style={{ fontSize: 10, color: '#0A58F5', background: 'rgba(10,88,245,0.08)', padding: '2px 7px', borderRadius: 6, fontWeight: 700 }}>HyperOne AI</span>
            </div>

            {[
              { icon: Download, onClick: handleExport, title: 'Export' },
              { icon: RefreshCw, onClick: () => setShowClearModal(true), title: 'Clear chat' },
            ].map(({ icon: Icon, onClick, title }) => (
              <motion.button
                key={title}
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={onClick}
                title={title}
                style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Icon style={{ width: 14, height: 14, color: '#6e6e73' }} />
              </motion.button>
            ))}

            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 10px rgba(10,88,245,0.28)' }}>
              <User style={{ width: 14, height: 14, color: 'white' }} />
            </div>
          </div>
        </motion.header>

        {/* ── CONTENT ROW (messages + right panel) ── */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

          {/* ── CENTER MESSAGES ── */}
          <main style={{ flex: 1, overflowY: 'auto', paddingBottom: 8 }}>
            <AnimatePresence>
              {showWelcome && <WelcomeHero onSend={handleSend} />}
            </AnimatePresence>

            <div style={{ maxWidth: 720, margin: '0 auto', padding: '28px 28px 8px', display: 'flex', flexDirection: 'column', gap: 28 }}>
              <AnimatePresence initial={false}>
                {messages.map((msg, i) =>
                  msg.content !== '' && (
                    <ChatBubble
                      key={msg.id || i}
                      message={msg}
                      isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                    />
                  )
                )}
              </AnimatePresence>

              {isStreaming && messages[messages.length - 1]?.content === '' && <TypingIndicator />}

              {/* Profile summary */}
              <AnimatePresence>
                {profile && phase !== 'greeting' && phase !== 'collection' && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                    style={{ paddingLeft: 56 }}
                  >
                    <div style={{ borderRadius: 20, padding: '20px 22px', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Sparkles style={{ width: 14, height: 14, color: '#0A58F5' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#0A58F5' }}>Profile Created</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px 20px' }}>
                        {[['Name', profile.name], ['Age', profile.age], ['Segment', profile.category], ['Occupation', profile.occupation], ['Income', profile.income], ['Goal', profile.goals]].map(([k, v]) => v && (
                          <div key={k}>
                            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, color: '#8e8e93', marginBottom: 3 }}>{k}</p>
                            <p style={{ fontSize: 13, fontWeight: 600, capitalize: 'true', color: '#1d1d1f', textTransform: 'capitalize' }}>{String(v)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Product recommendations */}
              <AnimatePresence>
                {recommendations && (phase === 'recommendations' || phase === 'kyc') && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.38 }}
                    style={{ paddingLeft: 56 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <Sparkles style={{ width: 14, height: 14, color: '#0A58F5' }} />
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>Your Personalised Banking Package</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {recommendations.map((product, i) => (
                        <ProductCard key={product.id} product={product} index={i} />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* KYC CTA */}
              <AnimatePresence>
                {phase === 'kyc' && (
                  <motion.div
                    initial={{ opacity: 0, y: 14, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.28 }}
                    style={{ paddingLeft: 56 }}
                  >
                    <div style={{ borderRadius: 20, padding: '24px 28px', textAlign: 'center', background: 'rgba(255,255,255,0.95)', border: '1px solid rgba(16,185,129,0.18)', boxShadow: '0 4px 24px rgba(16,185,129,0.07)' }}>
                      <div style={{ width: 52, height: 52, borderRadius: 18, background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <ShieldCheck style={{ width: 24, height: 24, color: '#10b981' }} />
                      </div>
                      <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: '#1d1d1f' }}>One Last Step — Verify Identity</h3>
                      <p style={{ fontSize: 13, lineHeight: 1.65, marginBottom: 20, color: '#6e6e73', maxWidth: 300, margin: '0 auto 20px' }}>
                        Upload your PAN & Aadhaar to complete account opening in minutes.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate('/kyc', { replace: true })}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 28px', borderRadius: 100, fontWeight: 600, fontSize: 14, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', boxShadow: '0 4px 18px rgba(10,88,245,0.3)' }}
                      >
                        Complete KYC Verification
                        <ChevronRight style={{ width: 16, height: 16 }} />
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick reply chips */}
              <AnimatePresence>
                {lastMsgIsAI && phase !== 'kyc' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: 0.2 }}
                    style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 56 }}
                  >
                    {QUICK_REPLIES.map(reply => (
                      <motion.button
                        key={reply}
                        className="chat-qr-pill"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSend(reply)}
                        style={{ padding: '7px 16px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.09)', color: '#4e4e52', cursor: 'pointer' }}
                      >
                        {reply}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} style={{ height: 4 }} />
            </div>
          </main>

          {/* ── RIGHT COPILOT PANEL ── */}
          <aside className="hidden xl:flex" style={{
            width: 320, flexShrink: 0,
            borderLeft: '1px solid rgba(0,0,0,0.07)',
            overflowY: 'auto', flexDirection: 'column', gap: 10,
            background: 'rgba(255,255,255,0.42)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '18px 14px',
          }}>

            {/* AI Status */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="chat-widget-card"
              style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, #0A1F6E, #0A58F5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(10,88,245,0.3)' }}>
                  <Zap style={{ width: 18, height: 18, color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#0A1F6E' }}>HyperOne AI</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isStreaming ? '#f59e0b' : '#10b981', animation: 'chatStatusPulse 2s ease-in-out infinite' }} />
                    <span style={{ fontSize: 11, color: '#8e8e93' }}>{isStreaming ? 'Processing…' : 'Ready'}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Account Balance */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="chat-widget-card"
              style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Account Balance</p>
              <p style={{ fontSize: 26, fontWeight: 900, color: '#0A1F6E', letterSpacing: '-0.03em', marginBottom: 6 }}>₹2,84,500</p>
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600, background: 'rgba(16,185,129,0.09)', padding: '3px 9px', borderRadius: 20 }}>↑ ₹12,400 this month</span>
            </motion.div>

            {/* Portfolio */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="chat-widget-card"
              style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio Value</p>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.09)', padding: '3px 9px', borderRadius: 20 }}>+14.2%</span>
              </div>
              <p style={{ fontSize: 22, fontWeight: 900, color: '#0A1F6E', letterSpacing: '-0.02em', marginBottom: 12 }}>₹8,42,000</p>
              <div style={{ display: 'flex', height: 5, borderRadius: 4, overflow: 'hidden', gap: 1.5 }}>
                {[['#0A58F5', 4], ['#10b981', 3], ['#f59e0b', 2], ['#7c3aed', 1]].map(([c, f], i) => (
                  <motion.div
                    key={i}
                    initial={{ flex: 0 }} animate={{ flex: f }}
                    transition={{ delay: 0.4 + i * 0.08, duration: 0.6, ease: 'easeOut' }}
                    style={{ background: c, borderRadius: 4 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                {[['#0A58F5', 'FD 40%'], ['#10b981', 'MF 30%'], ['#f59e0b', 'SIP 20%']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 7, height: 7, borderRadius: 2, background: c }} />
                    <span style={{ fontSize: 10, color: '#8e8e93' }}>{l}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Credit Score */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
              className="chat-widget-card"
              style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Credit Score</p>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#0A1F6E', letterSpacing: '-0.02em', lineHeight: 1 }}>742</span>
                <span style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginBottom: 2 }}>Excellent</span>
              </div>
              <div style={{ height: 5, background: 'rgba(0,0,0,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                <motion.div
                  initial={{ width: '0%' }} animate={{ width: '74.2%' }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981)', borderRadius: 4 }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 9, color: '#c0c0c8' }}>300</span>
                <span style={{ fontSize: 9, color: '#c0c0c8' }}>900</span>
              </div>
            </motion.div>

            {/* SIP */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="chat-widget-card"
              style={{ background: 'rgba(255,255,255,0.9)', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: '#8e8e93', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Monthly SIP</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 20, fontWeight: 800, color: '#0A1F6E', letterSpacing: '-0.02em' }}>₹5,000</p>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#8e8e93' }}>Next deduction</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>Dec 27</p>
                </div>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              style={{ display: 'flex', gap: 8 }}
            >
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/my-dashboard')}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', border: 'none', cursor: 'pointer', color: 'white', fontSize: 12, fontWeight: 700, boxShadow: '0 4px 14px rgba(10,88,245,0.28)' }}>
                Dashboard
              </motion.button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/kyc', { replace: true })}
                style={{ flex: 1, padding: '11px 0', borderRadius: 12, background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.2)', cursor: 'pointer', color: '#059669', fontSize: 12, fontWeight: 700 }}>
                Complete KYC
              </motion.button>
            </motion.div>

            {/* AI Recommendation */}
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="chat-widget-card"
              style={{ background: 'linear-gradient(135deg, rgba(10,42,138,0.06), rgba(10,88,245,0.08))', borderRadius: 18, padding: '16px 18px', border: '1px solid rgba(10,88,245,0.14)', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Sparkles style={{ width: 13, height: 13, color: '#0A58F5' }} />
                <p style={{ fontSize: 10, fontWeight: 700, color: '#0A58F5', textTransform: 'uppercase', letterSpacing: '0.1em' }}>AI Recommendation</p>
              </div>
              <p style={{ fontSize: 13, color: '#1a1a2e', lineHeight: 1.65 }}>
                Based on your profile, consider <strong>SBI Flexi Deposit</strong> for optimal returns with liquidity.
              </p>
            </motion.div>

          </aside>
        </div>

        {/* ── INPUT AREA ── */}
        <motion.footer
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.36, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            flexShrink: 0,
            background: 'rgba(238,241,248,0.94)',
            backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
            borderTop: '1px solid rgba(0,0,0,0.07)',
            padding: '14px 24px 18px',
          }}
        >
          {phase === 'kyc' ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/kyc', { replace: true })}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px', borderRadius: 100, fontWeight: 700, fontSize: 14, color: 'white', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', boxShadow: '0 6px 24px rgba(10,88,245,0.3)' }}
              >
                Proceed to KYC Verification
                <ChevronRight style={{ width: 16, height: 16 }} />
              </motion.button>
            </div>
          ) : (
            <div style={{ maxWidth: 720, margin: '0 auto' }}>

              {/* Suggestion chips above input */}
              <AnimatePresence>
                {inputFocused && !input && messages.filter(m => m.content).length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
                    style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}
                  >
                    {QUICK_REPLIES.slice(0, 3).map(r => (
                      <button key={r} className="chat-qr-pill" onMouseDown={() => setInput(r)}
                        style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.82)', border: '1px solid rgba(0,0,0,0.09)', color: '#4e4e52', cursor: 'pointer' }}>
                        {r}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Composer */}
              <div
                className="chat-input-wrap"
                style={{
                  display: 'flex', alignItems: 'flex-end', gap: 10,
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(20px)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 26,
                  padding: '12px 12px 12px 20px',
                  boxShadow: '0 6px 30px rgba(0,0,0,0.08)',
                }}
              >
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Paperclip style={{ width: 15, height: 15, color: '#8e8e93' }} />
                </motion.button>

                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setInputFocused(true)}
                  onBlur={() => setInputFocused(false)}
                  placeholder={isStreaming ? 'HyperOne AI is thinking…' : 'Ask your financial copilot anything…'}
                  rows={1}
                  disabled={isStreaming}
                  style={{
                    flex: 1, outline: 'none', resize: 'none', background: 'transparent',
                    fontSize: 15, lineHeight: 1.6, color: '#1a1a2e',
                    maxHeight: 180, scrollbarWidth: 'none', caretColor: '#0A58F5',
                    fontFamily: 'inherit', border: 'none', padding: '7px 0',
                  }}
                  onInput={e => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px';
                  }}
                />

                {input.length > 0 && (
                  <span style={{ fontSize: 11, color: '#c0c0c8', flexShrink: 0, paddingBottom: 9 }}>
                    {input.length}
                  </span>
                )}

                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                  <Mic style={{ width: 15, height: 15, color: '#8e8e93' }} />
                </motion.button>

                <motion.button
                  whileHover={input.trim() && !isStreaming ? { scale: 1.08 } : {}}
                  whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isStreaming}
                  style={{
                    width: 42, height: 42, borderRadius: 14, flexShrink: 0,
                    background: input.trim() && !isStreaming ? 'linear-gradient(135deg, #0A2A8A, #0A58F5)' : 'rgba(0,0,0,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: input.trim() && !isStreaming ? 'pointer' : 'not-allowed',
                    border: 'none',
                    boxShadow: input.trim() && !isStreaming ? '0 4px 16px rgba(10,88,245,0.36)' : 'none',
                    transition: 'background 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  <Send style={{ width: 16, height: 16, color: input.trim() && !isStreaming ? 'white' : '#b0b0b8' }} />
                </motion.button>
              </div>

              <p style={{ fontSize: 11, textAlign: 'center', color: '#c0c0c8', marginTop: 10, letterSpacing: '0.02em' }}>
                HyperOne AI · SBI HackFest 2026 · End-to-end encrypted
              </p>
            </div>
          )}
        </motion.footer>
      </div>

      {/* ── CLEAR CHAT MODAL ── */}
      <AnimatePresence>
        {showClearModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(10,15,40,0.38)', backdropFilter: 'blur(10px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowClearModal(false)}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onClick={e => e.stopPropagation()}
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', borderRadius: 28, padding: 36, maxWidth: 360, width: '90%', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,0.16)' }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 18, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                <RefreshCw style={{ width: 22, height: 22, color: '#dc2626' }} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0A1F6E', marginBottom: 10, letterSpacing: '-0.02em' }}>Clear Conversation?</h3>
              <p style={{ fontSize: 14, color: '#6e6e73', lineHeight: 1.65, marginBottom: 28 }}>
                All messages will be permanently deleted. Your session will restart with a fresh conversation.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setShowClearModal(false)}
                  style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'rgba(0,0,0,0.05)', border: 'none', fontSize: 14, fontWeight: 600, color: '#4e4e52', cursor: 'pointer' }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={handleClearChat}
                  style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg, #b91c1c, #ef4444)', border: 'none', fontSize: 14, fontWeight: 700, color: 'white', cursor: 'pointer', boxShadow: '0 4px 14px rgba(220,38,38,0.3)' }}
                >
                  Clear Chat
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
