import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Brain, Users, Clock, Sparkles, ChevronRight } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const stats = [
  { value: '90%', label: 'Faster Onboarding', icon: Clock, color: 'indigo' },
  { value: '6×', label: 'More Lead Capture', icon: Users, color: 'purple' },
  { value: '94M+', label: 'YONO Users Reachable', icon: BarChart3, color: 'emerald' },
  { value: '₹1–3B', label: 'Addressable Market', icon: Zap, color: 'amber' },
];

const features = [
  {
    icon: Brain,
    title: 'Hyper-Personalised AI',
    description: 'Claude-powered conversational engine that adapts to each customer\'s unique financial profile in real time.',
    gradient: 'from-indigo-500/20 to-purple-500/10',
    border: 'border-indigo-500/20',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.12)',
  },
  {
    icon: Shield,
    title: 'Instant Digital KYC',
    description: 'OCR-based document verification with Aadhaar & PAN validation — onboard customers in minutes, not days.',
    gradient: 'from-emerald-500/20 to-teal-500/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.1)',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description: 'Real-time insights on conversions, customer segments, product recommendations and onboarding metrics.',
    gradient: 'from-purple-500/20 to-pink-500/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    glow: 'rgba(168,85,247,0.1)',
  },
];

const steps = [
  { num: '01', label: 'Chat with AI', desc: 'Share your financial goals naturally' },
  { num: '02', label: 'Get Matched', desc: 'Receive a personalised product bundle' },
  { num: '03', label: 'Verify Identity', desc: 'Upload KYC docs in 2 minutes' },
  { num: '04', label: 'Bank Instantly', desc: 'Account ready, no branch visit needed' },
];

const spring = { type: 'spring', stiffness: 260, damping: 28 };

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#060609] relative overflow-x-hidden">

      {/* ── Background mesh ─────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[700px] h-[700px] bg-indigo-600" style={{ top: '-200px', left: '-150px' }} />
        <div className="orb w-[500px] h-[500px] bg-purple-700" style={{ top: '25%', right: '-100px' }} />
        <div className="orb w-[400px] h-[400px] bg-pink-700" style={{ bottom: '10%', left: '15%' }} />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(at 20% 80%, rgba(99,102,241,0.07) 0%, transparent 55%), ' +
              'radial-gradient(at 80% 20%, rgba(168,85,247,0.06) 0%, transparent 50%)',
          }}
        />
      </div>

      {/* ── Floating Navigation ─────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-50 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-[1.15rem] tracking-tight">HyperOne</span>
        </div>

        <div className="hidden md:flex items-center gap-1 glass rounded-full px-2 py-2">
          {['Features', 'How it works', 'Dashboard'].map((item, i) => (
            <button
              key={item}
              onClick={() => item === 'Dashboard' && navigate('/dashboard')}
              className="text-sm text-white/55 hover:text-white/90 transition-colors px-4 py-1.5 rounded-full hover:bg-white/[0.07]"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="hidden sm:block text-sm text-white/50 hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat')}
            className="btn-primary text-sm py-2.5 px-5"
          >
            Get Started
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative z-10 text-center px-6 pt-20 pb-28 max-w-5xl mx-auto">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 glass-strong rounded-full px-5 py-2.5 mb-10"
        >
          <span className="flex relative">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse-ring" />
          </span>
          <span className="text-xs font-medium text-white/70 tracking-wide">
            AI-Powered Banking Onboarding · SBI HackFest 2024
          </span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="text-[3.2rem] md:text-[5.5rem] font-bold leading-[1.08] tracking-[-0.03em] mb-7"
        >
          Banking Onboarding,
          <br />
          <span className="gradient-text">Reinvented.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.28 }}
          className="text-lg md:text-xl text-white/45 max-w-2xl mx-auto mb-12 leading-relaxed font-light"
        >
          HyperOne uses conversational AI to acquire, qualify, and onboard bank customers
          with hyper-personalised journeys — in minutes, not days.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat')}
            className="btn-primary text-base px-8 py-4 group"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard')}
            className="btn-glass text-base px-8 py-4"
          >
            View Analytics
          </motion.button>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-white/25 mt-8 tracking-wide"
        >
          Powered by Claude AI · Bank-grade security · Zero data storage
        </motion.p>
      </section>

      {/* ── Stats Row ───────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative z-10 max-w-5xl mx-auto px-6 mb-28"
      >
        <div className="glass-card rounded-3xl p-8 md:p-10 gradient-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => {
              const Icon = s.icon;
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.88 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ ...spring, delay: 0.6 + i * 0.08 }}
                  className="text-center group"
                >
                  <p className="text-3xl md:text-4xl font-bold gradient-text tracking-tight">{s.value}</p>
                  <p className="text-sm text-white/45 mt-1.5 font-medium">{s.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* ── Features ────────────────────────────────── */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-[0.2em] mb-4">
            Platform Features
          </p>
          <h2 className="text-3xl md:text-[2.75rem] font-bold leading-tight tracking-tight mb-4">
            Everything banks need to grow
          </h2>
          <p className="text-white/45 max-w-xl mx-auto leading-relaxed">
            From lead capture to account creation — one intelligent platform covers
            the entire acquisition funnel.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...spring, delay: 0.75 + i * 0.12 }}
                whileHover={{ y: -4 }}
                className={`relative glass-card rounded-2xl p-7 ${f.border} gradient-border cursor-default overflow-hidden`}
                style={{
                  boxShadow: `0 0 60px ${f.glow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
                }}
              >
                {/* Card bg gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${f.gradient} opacity-60 pointer-events-none`}
                />
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl ${f.iconBg} border ${f.border} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${f.iconColor}`} />
                  </div>
                  <h3 className="font-semibold text-white text-base mb-2.5 tracking-tight">{f.title}</h3>
                  <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-28">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold text-purple-400 uppercase tracking-[0.2em] mb-4">
            How It Works
          </p>
          <h2 className="text-3xl md:text-[2.5rem] font-bold tracking-tight">
            From hello to account in 4 steps
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...spring, delay: 0.95 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center relative overflow-hidden group cursor-default"
            >
              <div className="text-3xl font-black gradient-text-subtle mb-3 tracking-tight">{s.num}</div>
              <h4 className="text-sm font-semibold text-white mb-1.5">{s.label}</h4>
              <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1 }}
        className="relative z-10 max-w-4xl mx-auto px-6 pb-28 text-center"
      >
        <div
          className="glass-card rounded-3xl p-12 md:p-16 gradient-border relative overflow-hidden"
          style={{
            boxShadow: '0 0 100px rgba(99,102,241,0.12), 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}
        >
          {/* Glow orb inside CTA */}
          <div className="orb w-[300px] h-[300px] bg-indigo-600" style={{ top: '-100px', left: '50%', transform: 'translateX(-50%)' }} />
          <div className="relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-7 shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Ready to experience the future of banking?
            </h2>
            <p className="text-white/45 mb-10 max-w-md mx-auto leading-relaxed">
              Open your account in under 3 minutes with our AI assistant.
            </p>
            <motion.button
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="btn-primary text-base px-9 py-4 group"
            >
              Begin Onboarding
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </div>
      </motion.section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="text-white/40 text-sm font-medium">HyperOne</span>
        </div>
        <p className="text-white/25 text-xs tracking-wide">
          Built for SBI HackFest 2024 · Powered by Claude AI · © 2024
        </p>
      </footer>
    </div>
  );
}
