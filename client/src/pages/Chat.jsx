import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Zap, Sparkles, CheckCircle, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBubble from '../components/chat/ChatBubble.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import ProductCard from '../components/chat/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';
import useChatStore from '../store/chatStore.js';
import { getRecommendations } from '../lib/api.js';

const FLOW_STEPS = [
  { key: 'greeting',      label: 'Profile',   phaseMatch: ['greeting', 'collection'] },
  { key: 'products',      label: 'Products',  phaseMatch: ['profile_complete', 'recommendations'] },
  { key: 'kyc',           label: 'KYC',       phaseMatch: ['kyc'] },
];

const spring = { type: 'spring', stiffness: 300, damping: 30 };

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState('');

  const {
    messages, addMessage, updateLastMessage, profile, setProfile,
    recommendations, setRecommendations, phase, setPhase,
    isStreaming, setStreaming, startTimer, reset,
  } = useChatStore();

  useEffect(() => {
    if (messages.length === 0) {
      reset();
      startTimer();
      sendGreeting();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, recommendations]);

  const sendGreeting = async () => {
    await streamMessage([{ role: 'user', content: 'Hello' }]);
  };

  const loadRecommendations = useCallback(async (profileData) => {
    try {
      const res = await getRecommendations(profileData);
      if (res.success) setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
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

      if (!res.ok) throw new Error('Failed to connect to AI');

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
              const cleanText = data.cleanText || accumulated;
              updateLastMessage(cleanText);
              if (data.profile) {
                setProfile(data.profile);
                setPhase('profile_complete');
                await loadRecommendations(data.profile);
              }
              if (data.showProducts) setPhase('recommendations');
              if (data.gotoKyc) setPhase('kyc');
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (_) { /* skip malformed */ }
        }
      }
    } catch (err) {
      updateLastMessage('I apologize — I ran into a technical issue. Please try again!');
      toast.error('Connection error. Please try again.');
      console.error(err);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [addMessage, updateLastMessage, setStreaming, setProfile, setPhase, loadRecommendations]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    const userMessage = { role: 'user', content: text };
    addMessage(userMessage);
    setInput('');
    const allMessages = [...messages, userMessage].filter(m => m.content);
    await streamMessage(allMessages);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const activeStepIndex = FLOW_STEPS.findIndex(s => s.phaseMatch.includes(phase));

  return (
    <div className="min-h-screen bg-[#060609] flex flex-col relative overflow-hidden">

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[450px] h-[450px] bg-indigo-700" style={{ top: '-150px', right: '-80px' }} />
        <div className="orb w-[350px] h-[350px] bg-purple-800" style={{ bottom: '-80px', left: '-60px' }} />
        <div className="orb w-[200px] h-[200px] bg-indigo-600" style={{ top: '40%', left: '-40px', opacity: 0.08 }} />
      </div>

      {/* ── Header ──────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-20 nav-glass px-4 py-3.5 flex-shrink-0"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          {/* Left: Back + Identity */}
          <div className="flex items-center gap-3.5">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                style={{ boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">HyperOne AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="flex relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </span>
                  <p className="text-[11px] text-white/40">Online · SBI Banking Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Progress steps */}
          <div className="hidden md:flex items-center gap-1.5">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-1.5">
                {i > 0 && <div className="w-5 h-px bg-white/10" />}
                <motion.div
                  animate={
                    i < activeStepIndex ? 'done' :
                    i === activeStepIndex ? 'active' : 'pending'
                  }
                  variants={{
                    done: { opacity: 1 },
                    active: { opacity: 1 },
                    pending: { opacity: 0.5 },
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                    i < activeStepIndex ? 'step-done' :
                    i === activeStepIndex ? 'step-active' : 'step-pending'
                  }`}
                >
                  {i < activeStepIndex && <CheckCircle className="w-3 h-3" />}
                  {step.label}
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* ── Messages ────────────────────────────────── */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
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

          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <TypingIndicator />
          )}

          {/* ── Profile Card ───────── */}
          <AnimatePresence>
            {profile && phase !== 'greeting' && phase !== 'collection' && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={spring}
                className="mx-2"
              >
                <div
                  className="glass-card rounded-2xl p-5"
                  style={{ boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="text-xs font-semibold text-indigo-300 uppercase tracking-[0.12em]">
                        Profile Created
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
                    {[
                      ['Name', profile.name],
                      ['Age', profile.age],
                      ['Segment', profile.category],
                      ['Occupation', profile.occupation],
                      ['Income', profile.income],
                      ['Goal', profile.goals],
                    ].map(([k, v]) => v && (
                      <div key={k}>
                        <p className="text-[10px] text-white/35 uppercase tracking-wide font-medium">{k}</p>
                        <p className="text-sm font-medium text-white/90 capitalize mt-0.5">{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product Recommendations ── */}
          <AnimatePresence>
            {recommendations && (phase === 'recommendations' || phase === 'kyc') && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="px-2"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <p className="text-sm font-semibold text-white/90">Your Personalised Banking Package</p>
                </div>
                <div className="grid gap-3">
                  {recommendations.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── KYC CTA ─────────────── */}
          <AnimatePresence>
            {phase === 'kyc' && (
              <motion.div
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ ...spring, delay: 0.3 }}
                className="px-2"
              >
                <div
                  className="glass-card rounded-2xl p-6 text-center"
                  style={{ boxShadow: '0 0 50px rgba(16,185,129,0.1), 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)', borderColor: 'rgba(16,185,129,0.18)' }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-7 h-7 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2">One Last Step — Verify Identity</h3>
                  <p className="text-sm text-white/45 mb-5 max-w-xs mx-auto">
                    Upload your PAN & Aadhaar to complete account opening
                  </p>
                  <Button variant="primary" onClick={() => navigate('/kyc')}>
                    Complete KYC Verification
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-2" />
        </div>
      </main>

      {/* ── Input Bar ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="relative z-20 nav-glass px-4 py-4 flex-shrink-0"
      >
        <div className="max-w-3xl mx-auto">
          {phase === 'kyc' ? (
            <div className="text-center py-1">
              <Button variant="primary" size="lg" onClick={() => navigate('/kyc')}>
                Proceed to KYC Verification
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Button>
            </div>
          ) : (
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message…"
                  rows={1}
                  disabled={isStreaming}
                  className="w-full glass-card rounded-2xl px-5 py-3.5 pr-4 text-white text-sm placeholder-white/30 outline-none resize-none disabled:opacity-50 transition-all duration-200 max-h-32 leading-relaxed"
                  style={{
                    scrollbarWidth: 'none',
                    borderColor: isStreaming ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.09)',
                  }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.93 }}
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                }}
              >
                <Send className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          )}
          <p className="text-[11px] text-white/20 text-center mt-2.5 tracking-wide">
            HyperOne AI · Powered by Claude Sonnet · End-to-end encrypted
          </p>
        </div>
      </motion.div>
    </div>
  );
}
