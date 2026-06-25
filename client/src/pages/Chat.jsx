import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Zap, Sparkles, CheckCircle, ShieldCheck, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBubble from '../components/chat/ChatBubble.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import ProductCard from '../components/chat/ProductCard.jsx';
import useChatStore from '../store/chatStore.js';
import { getRecommendations } from '../lib/api.js';

const FLOW_STEPS = [
  { key: 'greeting', label: 'Profile',  phaseMatch: ['greeting', 'collection'] },
  { key: 'products', label: 'Products', phaseMatch: ['profile_complete', 'recommendations'] },
  { key: 'kyc',      label: 'KYC',      phaseMatch: ['kyc'] },
];

export default function Chat() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [input, setInput] = useState('');

  const {
    messages, addMessage, updateLastMessage, profile, setProfile,
    recommendations, setRecommendations, phase, setPhase,
    isStreaming, setStreaming, startTimer,
  } = useChatStore();

  const loadRecommendations = useCallback(async (profileData) => {
    try {
      const res = await getRecommendations(profileData);
      if (res.success) setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error('Recommendations failed:', err);
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
              if (data.profile) {
                setProfile(data.profile);
                setPhase('profile_complete');
                await loadRecommendations(data.profile);
              }
              if (data.showProducts) setPhase('recommendations');
              if (data.gotoKyc) setPhase('kyc');
            } else if (data.type === 'error') {
              updateLastMessage(data.message || 'Something went wrong. Please try again.');
            }
          } catch { /* skip malformed JSON */ }
        }
      }
    } catch (err) {
      updateLastMessage("I'm having trouble connecting right now. Please try again in a moment.");
      toast.error('Connection issue — please retry.');
      console.error(err);
    } finally {
      setStreaming(false);
      inputRef.current?.focus();
    }
  }, [addMessage, updateLastMessage, setStreaming, setProfile, setPhase, loadRecommendations]);

  const sendGreeting = useCallback(async () => {
    await streamMessage([{ role: 'user', content: 'Hello' }]);
  }, [streamMessage]);

  // Guard against StrictMode double-invoke: setStreaming(true) fires synchronously
  // inside streamMessage before any await, so the second effect sees isStreaming===true and exits.
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
    <div
      className="min-h-screen flex flex-col relative"
      style={{
        background: '#f2f2f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", Inter, sans-serif',
      }}
    >
      {/* Subtle background tint */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 50% at 60% -5%, rgba(80,70,228,0.055) 0%, transparent 65%)',
        }}
      />

      {/* ── Header ───────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="sticky top-0 z-30 flex-shrink-0"
        style={{
          background: 'rgba(242,242,247,0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
          boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 h-[58px] flex items-center justify-between">

          {/* Left — back + brand */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
              style={{ background: 'rgba(0,0,0,0.06)', color: '#6e6e73' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
                style={{
                  background: 'linear-gradient(135deg, #5046e4, #7c3aed)',
                  boxShadow: '0 3px 10px rgba(80,70,228,0.28)',
                }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-[14px] font-semibold leading-tight" style={{ color: '#1d1d1f' }}>HyperOne AI</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" style={{ animation: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite' }} />
                  <p className="text-[11px]" style={{ color: '#8e8e93' }}>SBI Banking Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right — step progress */}
          <div className="hidden sm:flex items-center gap-1.5">
            {FLOW_STEPS.map((step, i) => (
              <div key={step.key} className="flex items-center gap-1.5">
                {i > 0 && (
                  <div
                    className="w-6 h-px"
                    style={{
                      background: i <= activeStepIndex
                        ? 'rgba(80,70,228,0.4)'
                        : 'rgba(0,0,0,0.13)',
                    }}
                  />
                )}
                <div className="flex items-center gap-1">
                  <motion.div
                    animate={{ scale: i === activeStepIndex ? [1, 1.15, 1] : 1 }}
                    transition={{ duration: 0.35 }}
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{
                      background: i < activeStepIndex
                        ? '#5046e4'
                        : i === activeStepIndex
                          ? 'rgba(80,70,228,0.1)'
                          : 'rgba(0,0,0,0.06)',
                      border: i === activeStepIndex
                        ? '1.5px solid rgba(80,70,228,0.35)'
                        : '1.5px solid transparent',
                      color: i < activeStepIndex
                        ? '#fff'
                        : i === activeStepIndex
                          ? '#5046e4'
                          : '#b0b0b8',
                    }}
                  >
                    {i < activeStepIndex ? <CheckCircle className="w-3 h-3" /> : i + 1}
                  </motion.div>
                  <span
                    className="text-[11px]"
                    style={{
                      fontWeight: i === activeStepIndex ? 600 : 400,
                      color: i < activeStepIndex
                        ? 'rgba(0,0,0,0.55)'
                        : i === activeStepIndex
                          ? '#5046e4'
                          : '#c0c0c8',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </motion.header>

      {/* ── Messages ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto relative z-10" style={{ paddingBottom: '8px' }}>
        <div className="max-w-2xl mx-auto px-4 pt-7 pb-4 space-y-3">

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

          {/* ── Profile summary card ── */}
          <AnimatePresence>
            {profile && phase !== 'greeting' && phase !== 'collection' && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                className="ml-[46px]"
              >
                <div
                  className="rounded-[18px] p-5"
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(0,0,0,0.07)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}
                    >
                      {(profile.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5046e4' }} />
                    <span
                      className="text-[11px] font-semibold uppercase tracking-[0.14em]"
                      style={{ color: '#5046e4' }}
                    >
                      Profile Created
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-5 gap-y-3">
                    {[
                      ['Name', profile.name],
                      ['Age', profile.age],
                      ['Segment', profile.category],
                      ['Occupation', profile.occupation],
                      ['Income', profile.income],
                      ['Goal', profile.goals],
                    ].map(([k, v]) => v && (
                      <div key={k}>
                        <p className="text-[10px] uppercase tracking-wide font-medium" style={{ color: '#8e8e93' }}>{k}</p>
                        <p className="text-[13px] font-medium capitalize mt-0.5" style={{ color: '#1d1d1f' }}>{String(v)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Product recommendations ── */}
          <AnimatePresence>
            {recommendations && (phase === 'recommendations' || phase === 'kyc') && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38 }}
                className="ml-[46px]"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#5046e4' }} />
                  <p className="text-[13px] font-semibold" style={{ color: '#1d1d1f' }}>
                    Your Personalised Banking Package
                  </p>
                </div>
                <div className="grid gap-3">
                  {recommendations.map((product, i) => (
                    <ProductCard key={product.id} product={product} index={i} />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── KYC CTA card ── */}
          <AnimatePresence>
            {phase === 'kyc' && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.28 }}
                className="ml-[46px]"
              >
                <div
                  className="rounded-[18px] p-6 text-center"
                  style={{
                    background: 'rgba(255,255,255,0.96)',
                    border: '1px solid rgba(16,185,129,0.18)',
                    boxShadow: '0 4px 24px rgba(16,185,129,0.07), 0 2px 10px rgba(0,0,0,0.05)',
                  }}
                >
                  <div
                    className="w-[52px] h-[52px] rounded-2xl flex items-center justify-center mx-auto mb-4"
                    style={{
                      background: 'rgba(16,185,129,0.09)',
                      border: '1px solid rgba(16,185,129,0.18)',
                    }}
                  >
                    <ShieldCheck className="w-6 h-6" style={{ color: '#10b981' }} />
                  </div>
                  <h3 className="font-semibold text-[15px] mb-2" style={{ color: '#1d1d1f' }}>
                    One Last Step — Verify Identity
                  </h3>
                  <p className="text-[13px] mb-5 max-w-xs mx-auto leading-relaxed" style={{ color: '#6e6e73' }}>
                    Upload your PAN & Aadhaar to complete account opening in minutes.
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/kyc')}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-full font-semibold text-sm text-white"
                    style={{
                      background: 'linear-gradient(135deg, #5046e4, #7c3aed)',
                      boxShadow: '0 4px 18px rgba(80,70,228,0.28)',
                    }}
                  >
                    Complete KYC Verification
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} className="h-4" />
        </div>
      </main>

      {/* ── Input bar ────────────────────────────────────── */}
      <motion.footer
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22, duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-20 flex-shrink-0"
        style={{
          background: 'rgba(242,242,247,0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          WebkitBackdropFilter: 'blur(40px) saturate(180%)',
          borderTop: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3.5">
          {phase === 'kyc' ? (
            <div className="flex justify-center py-1">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/kyc')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-sm text-white"
                style={{
                  background: 'linear-gradient(135deg, #5046e4, #7c3aed)',
                  boxShadow: '0 4px 20px rgba(80,70,228,0.28)',
                }}
              >
                Proceed to KYC Verification
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          ) : (
            <div
              className="flex items-end gap-3 rounded-[20px] px-4 py-3 transition-shadow duration-200"
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.09)',
                boxShadow: isStreaming
                  ? '0 2px 12px rgba(0,0,0,0.06)'
                  : '0 4px 20px rgba(0,0,0,0.08)',
              }}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isStreaming ? 'HyperOne is thinking…' : 'Message HyperOne…'}
                rows={1}
                disabled={isStreaming}
                className="flex-1 outline-none resize-none bg-transparent leading-relaxed disabled:opacity-40 max-h-32"
                style={{
                  fontSize: '15px',
                  color: '#1d1d1f',
                  scrollbarWidth: 'none',
                  caretColor: '#5046e4',
                }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
              <motion.button
                whileHover={input.trim() && !isStreaming ? { scale: 1.08 } : {}}
                whileTap={input.trim() && !isStreaming ? { scale: 0.92 } : {}}
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 disabled:cursor-not-allowed"
                style={{
                  background: input.trim() && !isStreaming
                    ? 'linear-gradient(135deg, #5046e4, #7c3aed)'
                    : 'rgba(0,0,0,0.07)',
                  boxShadow: input.trim() && !isStreaming
                    ? '0 2px 10px rgba(80,70,228,0.32)'
                    : 'none',
                  opacity: isStreaming ? 0.3 : 1,
                }}
              >
                <Send
                  className="w-4 h-4"
                  style={{ color: input.trim() && !isStreaming ? '#fff' : '#8e8e93' }}
                />
              </motion.button>
            </div>
          )}

          <p
            className="text-[11px] text-center mt-2 tracking-wide"
            style={{ color: '#c0c0c8' }}
          >
            HyperOne AI · SBI HackFest 2026 · End-to-end encrypted
          </p>
        </div>
      </motion.footer>
    </div>
  );
}
