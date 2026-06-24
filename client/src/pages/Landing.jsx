import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Brain, Sparkles, ChevronRight } from 'lucide-react';

const stats = [
  { value: '90%',  label: 'Faster Onboarding' },
  { value: '6×',   label: 'More Lead Capture' },
  { value: '94M+', label: 'YONO Users Reachable' },
  { value: '₹1–3B',label: 'Addressable Market' },
];

const features = [
  {
    icon: Brain,
    title: 'Hyper-Personalised AI',
    description: "Conversational engine that adapts to each customer's unique financial profile — in real time, at scale.",
    accent: '#5046e4',
    bg: 'rgba(80,70,228,0.07)',
    border: 'rgba(80,70,228,0.14)',
  },
  {
    icon: Shield,
    title: 'Instant Digital KYC',
    description: 'OCR-based Aadhaar & PAN verification. Onboard customers in minutes — no branch visit, no paperwork.',
    accent: '#059669',
    bg: 'rgba(5,150,105,0.07)',
    border: 'rgba(5,150,105,0.14)',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics Dashboard',
    description: 'Real-time insights on conversions, customer segments, product recommendations and onboarding velocity.',
    accent: '#7c3aed',
    bg: 'rgba(124,58,237,0.07)',
    border: 'rgba(124,58,237,0.14)',
  },
];

const steps = [
  { num: '01', label: 'Chat with AI',     desc: 'Share your financial goals naturally in a conversation' },
  { num: '02', label: 'Get Matched',      desc: 'Receive a personalised banking product bundle' },
  { num: '03', label: 'Verify Identity',  desc: 'Upload KYC docs — done in under 2 minutes' },
  { num: '04', label: 'Bank Instantly',   desc: 'Account ready. No branch visit needed' },
];

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f7', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>

      {/* ── Sticky Navigation ──────────────────────── */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo — clickable */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
          >
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[1.05rem] tracking-tight" style={{ color: '#1d1d1f' }}>HyperOne</span>
          </button>

          {/* Centre links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: 'Features',     action: () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'How It Works', action: () => howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              { label: 'Dashboard',    action: () => navigate('/dashboard') },
            ].map(item => (
              <button
                key={item.label}
                onClick={item.action}
                className="text-[0.88rem] px-4 py-2 rounded-full transition-all"
                style={{ color: '#6e6e73' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#1d1d1f'; e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6e6e73'; e.currentTarget.style.background = 'transparent'; }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat')}
            className="flex items-center gap-1.5 text-[0.88rem] font-semibold text-white px-5 py-2.5 rounded-full"
            style={{ background: '#1d1d1f', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
          >
            Get Started
            <ChevronRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Subtle gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(80,70,228,0.09) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-24 pb-28 text-center">

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-[0.78rem] font-medium tracking-wide"
            style={{ background: 'rgba(80,70,228,0.08)', color: '#5046e4', border: '1px solid rgba(80,70,228,0.18)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#5046e4] animate-pulse flex-shrink-0" />
            AI-Powered Banking Onboarding · SBI HackFest 2026
            <Sparkles className="w-3 h-3 flex-shrink-0" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="font-bold leading-[1.04] tracking-[-0.035em] mb-7"
            style={{ fontSize: 'clamp(2.8rem, 8vw, 5.5rem)', color: '#1d1d1f' }}
          >
            Banking Onboarding,
            <br />
            <span style={{
              background: 'linear-gradient(135deg, #5046e4 0%, #7c3aed 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              Reinvented.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: '#6e6e73' }}
          >
            HyperOne uses conversational AI to acquire, qualify, and onboard bank customers
            with hyper-personalised journeys — in minutes, not days.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.32 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/chat')}
              className="inline-flex items-center gap-2.5 font-semibold text-white text-base px-9 py-4 rounded-full group"
              style={{ background: '#1d1d1f', boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)' }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 font-medium text-base px-9 py-4 rounded-full"
              style={{ color: '#1d1d1f', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)' }}
            >
              View Analytics
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* ── Stats — dark contrast section ───────────── */}
      <section style={{ background: '#1d1d1f' }}>
        <div className="max-w-5xl mx-auto px-6 py-20 md:py-24">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-14">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="text-center"
              >
                <p className="font-bold text-white tracking-tight mb-2" style={{ fontSize: 'clamp(2rem, 5vw, 3.25rem)' }}>
                  {s.value}
                </p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.42)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section ref={featuresRef} id="features" className="max-w-6xl mx-auto px-6 py-24 md:py-32">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
            style={{ color: '#5046e4' }}
          >
            Platform Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-[2.75rem] font-bold tracking-tight mb-4"
            style={{ color: '#1d1d1f' }}
          >
            Everything banks need to grow
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-xl mx-auto leading-relaxed"
            style={{ color: '#6e6e73' }}
          >
            From lead capture to account creation — one intelligent platform
            covers the entire acquisition funnel.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="rounded-2xl p-8 cursor-default"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 24px rgba(0,0,0,0.06)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl mb-6 flex items-center justify-center"
                  style={{ background: f.bg, border: `1px solid ${f.border}` }}
                >
                  <Icon className="w-6 h-6" style={{ color: f.accent }} />
                </div>
                <h3 className="font-semibold text-base mb-2.5 tracking-tight" style={{ color: '#1d1d1f' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6e6e73' }}>{f.description}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section ref={howItWorksRef} id="how-it-works" style={{ background: '#fff' }} className="py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-[0.22em] mb-4"
              style={{ color: '#7c3aed' }}
            >
              How It Works
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-[2.5rem] font-bold tracking-tight"
              style={{ color: '#1d1d1f' }}
            >
              From hello to account in 4 steps
            </motion.h2>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute h-px"
              style={{ top: '28px', left: 'calc(12.5% + 28px)', right: 'calc(12.5% + 28px)', background: 'rgba(0,0,0,0.09)', zIndex: 0 }}
            />
            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((s, i) => (
                <motion.div
                  key={s.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl mb-5 relative"
                    style={{ background: 'rgba(80,70,228,0.07)', color: '#5046e4', border: '1px solid rgba(80,70,228,0.15)', zIndex: 1 }}
                  >
                    {s.num}
                  </div>
                  <h4 className="text-sm font-semibold mb-1.5" style={{ color: '#1d1d1f' }}>{s.label}</h4>
                  <p className="text-xs leading-relaxed" style={{ color: '#6e6e73' }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center rounded-3xl px-8 py-20 md:py-24"
          style={{ background: '#1d1d1f', boxShadow: '0 40px 80px rgba(0,0,0,0.16)' }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-8"
            style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Ready to experience the future of banking?
          </h2>
          <p className="mb-10 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
            Open your account in under 3 minutes with our AI assistant.
            No branch visit, no paperwork.
          </p>
          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2.5 font-semibold text-base bg-white rounded-full px-9 py-4 group"
            style={{ color: '#1d1d1f', boxShadow: '0 4px 28px rgba(0,0,0,0.28)' }}
          >
            Begin Onboarding
            <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </motion.button>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────── */}
      <footer className="py-10 px-6 text-center" style={{ borderTop: '1px solid rgba(0,0,0,0.07)', background: '#f5f5f7' }}>
        <button
          onClick={handleLogoClick}
          className="inline-flex items-center gap-2 mb-3 mx-auto transition-opacity hover:opacity-70"
        >
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}>
            <Zap className="w-3 h-3 text-white" />
          </div>
          <span className="font-medium text-sm" style={{ color: '#6e6e73' }}>HyperOne</span>
        </button>
        <p className="text-xs tracking-wide" style={{ color: '#b2b2b7' }}>
          Built for SBI HackFest 2026 · Bank-grade security · © 2026
        </p>
      </footer>
    </div>
  );
}
