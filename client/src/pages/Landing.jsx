import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Brain, Users, Clock } from 'lucide-react';
import Button from '../components/ui/Button.jsx';

const stats = [
  { value: '90%', label: 'Faster Onboarding', icon: Clock },
  { value: '6×', label: 'More Lead Capture', icon: Users },
  { value: '94M+', label: 'YONO Users Reachable', icon: BarChart3 },
  { value: '₹1–3B', label: 'Total Addressable Market', icon: Zap },
];

const features = [
  {
    icon: Brain,
    title: 'Hyper-Personalized AI',
    description: 'Claude-powered conversational engine that adapts to each customer\'s unique profile in real time.',
    color: 'indigo',
  },
  {
    icon: Shield,
    title: 'Instant Digital KYC',
    description: 'OCR-based document verification with mock Aadhaar & PAN validation — onboard in minutes, not days.',
    color: 'emerald',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics Dashboard',
    description: 'Real-time insights on conversions, customer segments, product recommendations and onboarding metrics.',
    color: 'purple',
  },
];

const colorMap = {
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', icon: 'text-indigo-400' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'text-emerald-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: 'text-purple-400' },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb w-[600px] h-[600px] bg-indigo-600 top-[-200px] left-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-purple-600 top-[20%] right-[-100px]" />
      <div className="orb w-[300px] h-[300px] bg-pink-600 bottom-[10%] left-[20%]" />

      {/* Nav */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">HyperOne</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-white/60 hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <Button variant="primary" size="sm" onClick={() => navigate('/chat')}>
            Get Started
          </Button>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 text-center px-6 pt-16 pb-24 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-xs text-white/70">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            AI-Powered Banking Onboarding · Built for SBI HackFest 2024
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl md:text-7xl font-bold leading-tight tracking-tight mb-6"
        >
          Banking Onboarding,
          <br />
          <span className="gradient-text">Reinvented.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          HyperOne uses conversational AI to acquire, qualify, and onboard bank customers
          with hyper-personalized journeys — in minutes, not days.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button
            variant="primary"
            size="xl"
            onClick={() => navigate('/chat')}
            className="group"
          >
            Start Your Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="glass" size="xl" onClick={() => navigate('/dashboard')}>
            View Analytics
          </Button>
        </motion.div>
      </section>

      {/* Stats */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative z-10 max-w-5xl mx-auto px-6 mb-24"
      >
        <div className="glass rounded-3xl p-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center"
            >
              <p className="text-3xl md:text-4xl font-bold gradient-text">{s.value}</p>
              <p className="text-sm text-white/50 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything banks need to grow</h2>
          <p className="text-white/50 max-w-xl mx-auto">From lead capture to account creation — one intelligent platform covers the entire acquisition funnel.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            const c = colorMap[f.color];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="glass rounded-2xl p-6 glass-hover gradient-border"
              >
                <div className={`w-12 h-12 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${c.icon}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center"
      >
        <div className="glass rounded-3xl p-12 gradient-border">
          <h2 className="text-3xl font-bold mb-4">Ready to experience the future of banking?</h2>
          <p className="text-white/50 mb-8">Open your account in under 3 minutes with our AI assistant.</p>
          <Button variant="primary" size="xl" onClick={() => navigate('/chat')}>
            Begin Onboarding <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] py-8 px-6 text-center">
        <p className="text-white/30 text-sm">
          HyperOne © 2024 · Built for SBI HackFest · Powered by Claude AI
        </p>
      </footer>
    </div>
  );
}
