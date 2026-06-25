import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, BarChart3, Brain, Sparkles, ChevronRight, ChevronDown, Menu, X, Lock, User, LogIn } from 'lucide-react';
import { loginCustomer } from '../lib/api.js';
import useAuthStore from '../store/authStore.js';

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
  { num: '01', label: 'Fill Your Profile', desc: 'Enter personal, professional, and financial details in 3 quick steps' },
  { num: '02', label: 'Upload KYC Docs',   desc: 'Upload PAN & Aadhaar — AI auto-fills and verifies in seconds' },
  { num: '03', label: 'Account Created',   desc: 'Get your account number, Customer ID and MPIN instantly' },
  { num: '04', label: 'Bank Instantly',    desc: 'Log in to your full dashboard with investments, AI Copilot and more' },
];

function startCustomer(navigate) {
  sessionStorage.setItem('hyperone_role', 'customer');
  navigate('/register');
}

function startAdmin(navigate) {
  sessionStorage.setItem('hyperone_role', 'admin');
  navigate('/dashboard');
}

// Modal for existing customer sign-in — uses real backend auth
function CustomerSignInModal({ onClose, navigate }) {
  const [step, setStep] = useState('form');
  const [form, setForm] = useState({ customerId: '', mpin: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(s => s.setAuth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerId.trim()) { setError('Enter your Customer ID.'); return; }
    if (!form.mpin || form.mpin.length < 6) { setError('Enter your 6-digit MPIN.'); return; }

    setLoading(true);
    setError('');
    try {
      const res = await loginCustomer(form.customerId.trim().toUpperCase(), form.mpin);
      setAuth(res.token, res.data);
      sessionStorage.setItem('hyperone_role', 'customer');
      setStep('success');
      setTimeout(() => { onClose(); navigate('/my-dashboard'); }, 1000);
    } catch (err) {
      setError(err.message || 'Invalid Customer ID or MPIN.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-8"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: '#5046e4' }}>Existing Customer</p>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: '#1d1d1f' }}>Sign In</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: '#6e6e73' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6e6e73' }}>Customer ID</label>
                <input
                  type="text"
                  value={form.customerId}
                  onChange={e => { setForm(f => ({ ...f, customerId: e.target.value })); setError(''); }}
                  placeholder="e.g. SBIH123456"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all font-mono"
                  style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.09)', color: '#1d1d1f' }}
                  onFocus={e => { e.target.style.border = '1px solid #5046e4'; e.target.style.boxShadow = '0 0 0 3px rgba(80,70,228,0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6e6e73' }}>6-digit MPIN</label>
                <input
                  type="password"
                  maxLength={6}
                  value={form.mpin}
                  onChange={e => { setForm(f => ({ ...f, mpin: e.target.value.replace(/\D/g, '') })); setError(''); }}
                  placeholder="••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.09)', color: '#1d1d1f' }}
                  onFocus={e => { e.target.style.border = '1px solid #5046e4'; e.target.style.boxShadow = '0 0 0 3px rgba(80,70,228,0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {error && <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>}
              <p className="text-[11px]" style={{ color: '#b2b2b7' }}>
                Your Customer ID and MPIN were shown on your account creation page.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-2 disabled:opacity-60"
                style={{ background: '#1d1d1f' }}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#1d1d1f' }}>Signed in!</h2>
            <p className="text-sm" style={{ color: '#6e6e73' }}>Loading your dashboard…</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// Modal for admin sign-in
function AdminSignInModal({ onClose, navigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      setError('Please enter your credentials.');
      return;
    }
    // For hackathon demo — accept admin / admin123
    if (form.username === 'admin' && form.password === 'admin123') {
      setStep('success');
      setTimeout(() => {
        onClose();
        sessionStorage.setItem('hyperone_role', 'admin');
        navigate('/dashboard');
      }, 1200);
    } else {
      setError('Invalid credentials. Use admin / admin123 for this demo.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 12 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-[24px] p-8"
        style={{ background: '#fff', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}
      >
        {step === 'form' ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: '#7c3aed' }}>Staff Portal</p>
                <h2 className="text-xl font-bold tracking-tight" style={{ color: '#1d1d1f' }}>Admin Sign In</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors" style={{ color: '#6e6e73' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6e6e73' }}>Username</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(''); }}
                  placeholder="admin"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.09)', color: '#1d1d1f' }}
                  onFocus={e => { e.target.style.border = '1px solid #7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#6e6e73' }}>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{ background: '#f5f5f7', border: '1px solid rgba(0,0,0,0.09)', color: '#1d1d1f' }}
                  onFocus={e => { e.target.style.border = '1px solid #7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.1)'; }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              {error && <p className="text-xs font-medium" style={{ color: '#dc2626' }}>{error}</p>}
              <p className="text-xs" style={{ color: '#b2b2b7' }}>Demo credentials: admin / admin123</p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white mt-2"
                style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}
              >
                Sign In to Dashboard
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}>
              <Lock className="w-6 h-6" style={{ color: '#7c3aed' }} />
            </div>
            <h2 className="text-lg font-bold mb-1" style={{ color: '#1d1d1f' }}>Authenticated!</h2>
            <p className="text-sm" style={{ color: '#6e6e73' }}>Loading dashboard…</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [modal, setModal] = useState(null); // 'customer' | 'admin' | null
  const [signInOpen, setSignInOpen] = useState(false);
  const signInRef = useRef(null);

  // Close sign-in dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (signInRef.current && !signInRef.current.contains(e.target)) {
        setSignInOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogoClick = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollTo = (ref) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f7', color: '#1d1d1f', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>

      {/* ── Sign-in modals ────────────────────────── */}
      <AnimatePresence>
        {modal === 'customer' && (
          <CustomerSignInModal onClose={() => setModal(null)} navigate={navigate} />
        )}
        {modal === 'admin' && (
          <AdminSignInModal onClose={() => setModal(null)} navigate={navigate} />
        )}
      </AnimatePresence>

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
        {/* ── Main nav bar ─── */}
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 transition-opacity hover:opacity-70"
          >
            <div className="w-8 h-8 rounded-[9px] flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[1.05rem] tracking-tight" style={{ color: '#1d1d1f' }}>HyperOne</span>
          </button>

          {/* Desktop centre links */}
          <div className="hidden md:flex items-center gap-0.5">
            {[
              { label: 'Features',     action: () => scrollTo(featuresRef) },
              { label: 'How It Works', action: () => scrollTo(howItWorksRef) },
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

          {/* Right: Sign In dropdown + Get Started + hamburger */}
          <div className="flex items-center gap-2">

            {/* Single "Sign In" dropdown — desktop */}
            <div className="relative hidden md:block" ref={signInRef}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSignInOpen(o => !o)}
                className="flex items-center gap-1.5 text-[0.84rem] font-medium px-3.5 py-2 rounded-full transition-all"
                style={{
                  color: signInOpen ? '#1d1d1f' : '#6e6e73',
                  border: '1px solid rgba(0,0,0,0.1)',
                  background: signInOpen ? 'rgba(0,0,0,0.05)' : 'transparent',
                }}
              >
                <User className="w-3.5 h-3.5" />
                Sign In
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: signInOpen ? 'rotate(180deg)' : 'none' }}
                />
              </motion.button>

              <AnimatePresence>
                {signInOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-[16px] p-1.5 z-50"
                    style={{
                      background: '#fff',
                      border: '1px solid rgba(0,0,0,0.09)',
                      boxShadow: '0 8px 36px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.07)',
                    }}
                  >
                    {/* Existing Customer option */}
                    <button
                      onClick={() => { setSignInOpen(false); setModal('customer'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left text-[0.87rem] transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(0,0,0,0.05)' }}>
                        <User className="w-3.5 h-3.5" style={{ color: '#6e6e73' }} />
                      </div>
                      <div>
                        <p className="font-medium text-[0.86rem]" style={{ color: '#1d1d1f' }}>Existing Customer</p>
                        <p className="text-[11px]" style={{ color: '#8e8e93' }}>Sign in to your account</p>
                      </div>
                    </button>

                    <div className="my-1" style={{ height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                    {/* Admin option */}
                    <button
                      onClick={() => { setSignInOpen(false); setModal('admin'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-left text-[0.87rem] transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(124,58,237,0.08)' }}>
                        <Lock className="w-3.5 h-3.5" style={{ color: '#7c3aed' }} />
                      </div>
                      <div>
                        <p className="font-medium text-[0.86rem]" style={{ color: '#1d1d1f' }}>Admin</p>
                        <p className="text-[11px]" style={{ color: '#8e8e93' }}>Staff & analytics portal</p>
                      </div>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startCustomer(navigate)}
              className="hidden sm:flex items-center gap-1.5 text-[0.88rem] font-semibold text-white px-5 py-2.5 rounded-full"
              style={{ background: '#1d1d1f', boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
            >
              Get Started
              <ChevronRight className="w-3.5 h-3.5" />
            </motion.button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="md:hidden p-2 rounded-xl transition-colors"
              style={{ color: '#6e6e73' }}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown ─── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeInOut' }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}
            >
              <div className="px-5 py-4 space-y-1">
                {[
                  { label: 'Features',     action: () => scrollTo(featuresRef) },
                  { label: 'How It Works', action: () => scrollTo(howItWorksRef) },
                ].map(item => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="block w-full text-left px-3 py-2.5 rounded-xl text-[0.95rem] transition-colors"
                    style={{ color: '#6e6e73' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; e.currentTarget.style.color = '#1d1d1f'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6e6e73'; }}
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-3 mt-1 space-y-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <button
                    onClick={() => { setMobileOpen(false); startCustomer(navigate); }}
                    className="w-full font-semibold text-white text-sm py-3 rounded-full"
                    style={{ background: '#1d1d1f' }}
                  >
                    Begin Onboarding
                  </button>
                  <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                    <button
                      onClick={() => { setMobileOpen(false); setModal('customer'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors"
                      style={{ color: '#1d1d1f', borderBottom: '1px solid rgba(0,0,0,0.06)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <User className="w-4 h-4 flex-shrink-0" style={{ color: '#6e6e73' }} />
                      <div className="text-left">
                        <p className="font-medium">Existing Customer</p>
                        <p className="text-[11px]" style={{ color: '#8e8e93' }}>Sign in to your account</p>
                      </div>
                    </button>
                    <button
                      onClick={() => { setMobileOpen(false); setModal('admin'); }}
                      className="w-full flex items-center gap-2.5 px-4 py-3 text-left text-sm transition-colors"
                      style={{ color: '#1d1d1f' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.05)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Lock className="w-4 h-4 flex-shrink-0" style={{ color: '#7c3aed' }} />
                      <div className="text-left">
                        <p className="font-medium">Admin</p>
                        <p className="text-[11px]" style={{ color: '#8e8e93' }}>Staff & analytics portal</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="relative overflow-hidden">
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
            className="flex flex-col items-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => startCustomer(navigate)}
              className="inline-flex items-center gap-2.5 font-semibold text-white text-base px-9 py-4 rounded-full group"
              style={{ background: '#1d1d1f', boxShadow: '0 4px 24px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1)' }}
            >
              Begin Onboarding
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-0.5" />
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
            onClick={() => startCustomer(navigate)}
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
