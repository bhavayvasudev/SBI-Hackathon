import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowLeft, Zap, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ChatBubble from '../components/chat/ChatBubble.jsx';
import TypingIndicator from '../components/chat/TypingIndicator.jsx';
import ProductCard from '../components/chat/ProductCard.jsx';
import Button from '../components/ui/Button.jsx';
import useChatStore from '../store/chatStore.js';
import { getRecommendations } from '../lib/api.js';

const PHASES = [
  { key: 'greeting', label: 'Welcome', done: false },
  { key: 'collection', label: 'Profile', done: false },
  { key: 'recommendations', label: 'Products', done: false },
  { key: 'kyc', label: 'Verification', done: false },
];

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
    const greetingMessages = [
      { role: 'user', content: 'Hello' }
    ];
    await streamMessage(greetingMessages, true);
  };

  const streamMessage = useCallback(async (allMessages, isGreeting = false) => {
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
      let fullResponseData = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const raw = line.slice(6).trim();
          if (!raw) continue;

          try {
            const data = JSON.parse(raw);

            if (data.type === 'delta') {
              accumulated += data.text;
              updateLastMessage(accumulated);
            } else if (data.type === 'done') {
              fullResponseData = data;
              const cleanText = data.cleanText || accumulated;
              updateLastMessage(cleanText);

              if (data.profile) {
                setProfile(data.profile);
                setPhase('profile_complete');
                await loadRecommendations(data.profile);
              }

              if (data.showProducts) {
                setPhase('recommendations');
              }

              if (data.gotoKyc) {
                setPhase('kyc');
              }
            } else if (data.type === 'error') {
              throw new Error(data.message);
            }
          } catch (parseErr) {
            // skip malformed lines
          }
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
  }, [addMessage, updateLastMessage, setStreaming, setProfile, setPhase, setRecommendations]);

  const loadRecommendations = async (profileData) => {
    try {
      const res = await getRecommendations(profileData);
      if (res.success) {
        setRecommendations(res.data.recommendations);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    }
  };

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

  const handleGoToKYC = () => {
    navigate('/kyc');
  };

  const currentPhaseIndex = ['greeting', 'collection', 'profile_complete', 'recommendations', 'kyc'].indexOf(phase);

  return (
    <div className="min-h-screen bg-[#050508] flex flex-col relative overflow-hidden">
      {/* Background */}
      <div className="orb w-[400px] h-[400px] bg-indigo-700 top-[-150px] right-[-100px]" />
      <div className="orb w-[300px] h-[300px] bg-purple-700 bottom-[-100px] left-[-50px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 glass border-b border-white/[0.06] px-4 py-4"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">HyperOne AI</p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-xs text-white/40">Online · SBI Banking Assistant</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress steps */}
          <div className="hidden md:flex items-center gap-2">
            {['Profile', 'Products', 'KYC'].map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                {i > 0 && <div className="w-6 h-px bg-white/10" />}
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  currentPhaseIndex > i
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20'
                    : currentPhaseIndex === i + 1
                    ? 'bg-white/10 text-white border border-white/15'
                    : 'text-white/30'
                }`}>
                  {step}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Messages */}
      <main className="flex-1 relative z-10 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              msg.content !== '' && (
                <ChatBubble
                  key={msg.id || i}
                  message={msg}
                  isStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
                />
              )
            ))}
          </AnimatePresence>

          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <TypingIndicator />
          )}

          {/* Profile card appears inline after profile is complete */}
          {profile && phase !== 'greeting' && phase !== 'collection' && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-4"
            >
              <div className="glass rounded-2xl p-4 border border-indigo-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">
                    Profile Created
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Name', profile.name],
                    ['Age', profile.age],
                    ['Occupation', profile.occupation],
                    ['Income', profile.income],
                    ['Goal', profile.goals],
                    ['Segment', profile.category],
                  ].map(([k, v]) => v && (
                    <div key={k}>
                      <p className="text-xs text-white/40">{k}</p>
                      <p className="text-sm font-medium text-white capitalize">{v}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Product recommendations appear inline */}
          {recommendations && (phase === 'recommendations' || phase === 'kyc') && (
            <div className="px-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 mb-3"
              >
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-semibold text-white">
                  Your Personalised Banking Package
                </p>
              </motion.div>
              <div className="grid gap-3">
                {recommendations.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* KYC CTA */}
          {phase === 'kyc' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="px-4"
            >
              <div className="glass rounded-2xl p-5 border border-emerald-500/20 text-center">
                <div className="text-2xl mb-2">🎯</div>
                <h3 className="font-semibold text-white mb-1">One last step — Verify Your Identity</h3>
                <p className="text-sm text-white/50 mb-4">Upload your PAN & Aadhaar to complete account opening</p>
                <Button variant="primary" onClick={handleGoToKYC}>
                  Complete KYC Verification →
                </Button>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 glass border-t border-white/[0.06] px-4 py-4"
      >
        <div className="max-w-3xl mx-auto">
          {phase === 'kyc' ? (
            <div className="text-center">
              <Button variant="primary" size="lg" onClick={handleGoToKYC}>
                Proceed to KYC Verification →
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
                  placeholder="Type your message..."
                  rows={1}
                  disabled={isStreaming}
                  className="w-full glass rounded-2xl px-4 py-3.5 pr-12 text-white text-sm placeholder-white/30 outline-none focus:border-indigo-500/50 resize-none disabled:opacity-50 transition-all duration-200 max-h-32"
                  style={{ scrollbarWidth: 'none' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:from-indigo-400 hover:to-purple-500 transition-all active:scale-95"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <p className="text-xs text-white/20 text-center mt-2">
            HyperOne AI · Powered by Claude Sonnet
          </p>
        </div>
      </motion.div>
    </div>
  );
}
