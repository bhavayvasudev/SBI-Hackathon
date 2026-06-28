import { useRef, useState, useEffect, useCallback } from 'react';
import {
  motion, AnimatePresence, useScroll,
  useMotionValue, useSpring, useTransform,
} from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import {
  ArrowRight, Zap, Shield, BarChart3, Brain, Sparkles,
  ChevronDown, X, Lock, User, TrendingUp, CheckCircle,
  ArrowUpRight, Activity, Globe, Target,
} from 'lucide-react';
import { loginCustomer, loginAdmin } from '../lib/api.js';
import useAuthStore from '../store/authStore.js';

/* ─── Tokens ─── */
const T = {
  ink: '#0A0A0A', blue: '#1A56DB', navy: '#1E3A8A',
  muted: '#6B7280', border: '#E5E7EB', bg: '#FFFFFF',
};

/* ─── Data ─── */
const METRICS = [
  { value: '90%', label: 'Faster Onboarding' },
  { value: '6×', label: 'Lead Capture Uplift' },
  { value: '94M+', label: 'YONO Users Reachable' },
  { value: '3 min', label: 'Time to Account' },
  { value: '₹1–3B', label: 'Addressable Market' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const FEATURES = [
  {
    n: '01', icon: Brain, eyebrow: 'Intelligence Layer',
    title: 'Hyper-Personalised AI Conversations',
    body: "Our conversational engine adapts in real time to each customer's unique financial profile — delivering product recommendations that feel personal, not algorithmic.",
    accent: '#1A56DB', stat: '6× higher conversion',
    meta: [{ label: 'Avg. Session', v: '4.2 min' }, { label: 'Completion', v: '91%' }],
  },
  {
    n: '02', icon: Shield, eyebrow: 'Compliance Engine',
    title: 'Instant Digital KYC in Seconds',
    body: 'Aadhaar + PAN OCR extraction, AI-driven verification, and RBI-compliant document processing. No branch visit. No paperwork. Full compliance, end-to-end.',
    accent: '#059669', stat: 'RBI-compliant',
    meta: [{ label: 'KYC Time', v: '< 90s' }, { label: 'Accuracy', v: '99.4%' }],
  },
  {
    n: '03', icon: BarChart3, eyebrow: 'Analytics Suite',
    title: 'Executive-Grade Analytics Dashboard',
    body: 'Live funnel analytics, customer segmentation, onboarding velocity metrics, and KYC status tracking — all in one enterprise command center.',
    accent: '#1E3A8A', stat: 'Real-time insights',
    meta: [{ label: 'Data Lag', v: '< 2s' }, { label: 'Metrics', v: '40+' }],
  },
];

const STEPS = [
  { n: '01', label: 'Profile', desc: 'Personal, professional and financial details in 3 guided steps' },
  { n: '02', label: 'KYC', desc: 'AI auto-fills Aadhaar & PAN — verified in seconds, not hours' },
  { n: '03', label: 'Account', desc: 'Instant account number, Customer ID, and MPIN generated' },
  { n: '04', label: 'Banking', desc: 'Full dashboard with investments, AI Copilot, and live portfolio' },
];

const TRUST = [
  { label: 'Bank-grade 256-bit AES encryption' },
  { label: 'RBI-compliant KYC pipeline' },
  { label: 'ISO 27001 architecture' },
  { label: 'Zero-knowledge auth' },
];

const PORTFOLIO_DATA = [
  { v: 620 }, { v: 582 }, { v: 645 }, { v: 703 }, { v: 688 },
  { v: 741 }, { v: 718 }, { v: 789 }, { v: 763 }, { v: 824 },
];

/* ─── CSS Keyframes — compositor-thread animations for 60fps ─── */
const LANDING_CSS = `
  @keyframes hoFloatA { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-7px); } }
  @keyframes hoFloatB { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(9px); } }
  @keyframes hoFloatC { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-6px); } }
  @keyframes hoFloatD { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(5px); } }
  @keyframes hoFloatE { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-5px); } }
  @keyframes hoOrbA { 0%,100% { opacity:0.28; transform:scale(1); } 50% { opacity:0.45; transform:scale(1.10); } }
  @keyframes hoOrbB { 0%,100% { opacity:0.18; transform:scale(1); } 50% { opacity:0.30; transform:scale(1.14); } }
  @keyframes hoOrbC { 0%,100% { opacity:0.12; } 50% { opacity:0.24; } }
  @keyframes hoOrbD { 0%,100% { opacity:0.08; transform:scale(1); } 50% { opacity:0.18; transform:scale(1.12); } }
  @keyframes hoOrbE { 0%,100% { opacity:0.06; } 50% { opacity:0.14; } }
  @keyframes hoHeroA { 0%,100% { opacity:0.22; transform:scale(1); } 50% { opacity:0.38; transform:scale(1.12); } }
  @keyframes hoHeroB { 0%,100% { opacity:0.18; transform:scale(1); } 50% { opacity:0.32; transform:scale(1.18); } }
  @keyframes hoHeroC { 0%,100% { opacity:0.06; } 50% { opacity:0.18; } }
  .ho-float-a { animation: hoFloatA 4.2s ease-in-out infinite 1.2s; }
  .ho-float-b { animation: hoFloatB 3.6s ease-in-out infinite 0.6s; }
  .ho-float-c { animation: hoFloatC 4.6s ease-in-out infinite 2.4s; }
  .ho-float-d { animation: hoFloatD 5.0s ease-in-out infinite 1.0s; }
  .ho-float-e { animation: hoFloatE 3.9s ease-in-out infinite 1.8s; }
  .ho-orb-a { animation: hoOrbA 7s ease-in-out infinite; }
  .ho-orb-b { animation: hoOrbB 9s ease-in-out infinite 1.8s; }
  .ho-orb-c { animation: hoOrbC 6s ease-in-out infinite 0.8s; }
  .ho-orb-d { animation: hoOrbD 8s ease-in-out infinite 3.2s; }
  .ho-orb-e { animation: hoOrbE 5.5s ease-in-out infinite 2s; }
  .ho-hero-a { animation: hoHeroA 9s ease-in-out infinite; }
  .ho-hero-b { animation: hoHeroB 11s ease-in-out infinite 2.5s; }
  .ho-hero-c { animation: hoHeroC 7s ease-in-out infinite 1s; }
`;

/* ─── Noise Texture Layer ─── */
const NOISE_URI = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;
function NoiseLayer({ opacity = 0.038 }) {
  return (
    <div aria-hidden="true" style={{
      position: 'absolute', inset: 0, borderRadius: 'inherit',
      backgroundImage: NOISE_URI, backgroundSize: '180px 180px',
      opacity, pointerEvents: 'none', mixBlendMode: 'soft-light',
    }} />
  );
}

/* ─── Magnetic Button ─── */
function MagneticButton({ children, className, style, onClick, whileHover, whileTap, type, disabled, ...rest }) {
  const ref = useRef(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 220, damping: 22 });
  const sy = useSpring(my, { stiffness: 220, damping: 22 });
  return (
    <motion.button ref={ref} type={type} disabled={disabled}
      style={{ x: sx, y: sy, ...style }}
      className={className}
      whileHover={whileHover} whileTap={whileTap ?? { scale: 0.97 }}
      onClick={onClick}
      onMouseMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left - r.width / 2) * 0.28);
        my.set((e.clientY - r.top - r.height / 2) * 0.28);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      {...rest}>
      {children}
    </motion.button>
  );
}

/* ─── Premium Input ─── */
function PremiumInput({ label, type = 'text', value, onChange, placeholder, maxLength, mono }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: T.muted }}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} maxLength={maxLength}
        className={`w-full px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 ${mono ? 'font-mono' : ''}`}
        style={{
          background: focused ? '#fff' : '#F9FAFB',
          border: `1px solid ${focused ? T.blue : T.border}`,
          boxShadow: focused ? `0 0 0 3px rgba(26,86,219,0.1)` : 'none',
          color: T.ink,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

/* ─── Customer Sign-In Modal ─── */
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
    setLoading(true); setError('');
    try {
      const res = await loginCustomer(form.customerId.trim().toUpperCase(), form.mpin);
      setAuth(res.token, res.data);
      sessionStorage.setItem('hyperone_role', 'customer');
      setStep('success');
      setTimeout(() => { onClose(); navigate('/my-dashboard'); }, 900);
    } catch (err) {
      setError(err.message || 'Invalid Customer ID or MPIN.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-[28px] overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.1)' }}>
        {step === 'form' ? (
          <>
            <div className="px-8 pt-8 pb-0 flex items-start justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3"
                  style={{ background: 'rgba(26,86,219,0.08)', color: T.blue }}>
                  Existing Customer
                </span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: T.ink }}>Welcome back</h2>
                <p className="text-sm mt-1" style={{ color: T.muted }}>Sign in to your HyperOne account</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full transition-colors mt-1"
                style={{ color: T.muted }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <PremiumInput label="Customer ID" value={form.customerId} mono
                onChange={e => { setForm(f => ({ ...f, customerId: e.target.value })); setError(''); }}
                placeholder="e.g. SBIH123456" />
              <PremiumInput label="6-digit MPIN" type="password" maxLength={6} value={form.mpin}
                onChange={e => { setForm(f => ({ ...f, mpin: e.target.value.replace(/\D/g, '') })); setError(''); }}
                placeholder="••••••" />
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium px-3 py-2 rounded-lg"
                  style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  {error}
                </motion.p>
              )}
              <p className="text-[11px]" style={{ color: '#9CA3AF' }}>
                Your Customer ID and MPIN were provided at account creation.
              </p>
              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)', boxShadow: '0 4px 16px rgba(26,86,219,0.3)' }}>
                {loading ? 'Signing in…' : 'Sign In →'}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="px-8 py-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <CheckCircle className="w-8 h-8" style={{ color: '#10b981' }} />
            </motion.div>
            <h2 className="text-xl font-bold mb-2" style={{ color: T.ink }}>You're in!</h2>
            <p className="text-sm" style={{ color: T.muted }}>Loading your dashboard…</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Admin Sign-In Modal ─── */
function AdminSignInModal({ onClose, navigate }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Please enter your credentials.'); return; }
    setLoading(true); setError('');
    try {
      const res = await loginAdmin(form.username, form.password);
      sessionStorage.setItem('hyperone_admin_token', res.token);
      setStep('success');
      setTimeout(() => { onClose(); sessionStorage.setItem('hyperone_role', 'admin'); navigate('/dashboard'); }, 900);
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[300] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[400px] rounded-[28px] overflow-hidden"
        style={{ background: '#fff', boxShadow: '0 40px 100px rgba(0,0,0,0.22), 0 8px 32px rgba(0,0,0,0.1)' }}>
        {step === 'form' ? (
          <>
            <div className="px-8 pt-8 pb-0 flex items-start justify-between">
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-[0.2em] px-2.5 py-1 rounded-full mb-3"
                  style={{ background: 'rgba(30,58,138,0.08)', color: T.navy }}>
                  Staff Portal
                </span>
                <h2 className="text-2xl font-bold tracking-tight" style={{ color: T.ink }}>Admin Sign In</h2>
                <p className="text-sm mt-1" style={{ color: T.muted }}>Access the analytics command center</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-full transition-colors mt-1"
                style={{ color: T.muted }}
                onMouseEnter={e => e.currentTarget.style.background = '#F3F4F6'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
              <PremiumInput label="Username" value={form.username}
                onChange={e => { setForm(f => ({ ...f, username: e.target.value })); setError(''); }}
                placeholder="admin" />
              <PremiumInput label="Password" type="password" value={form.password}
                onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                placeholder="••••••••" />
              {error && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="text-xs font-medium px-3 py-2 rounded-lg"
                  style={{ color: '#DC2626', background: '#FEF2F2', border: '1px solid #FECACA' }}>
                  {error}
                </motion.p>
              )}
              <p className="text-xs px-3 py-2 rounded-lg" style={{ color: T.muted, background: '#F9FAFB', border: `1px solid ${T.border}` }}>
                Demo: <span className="font-mono font-semibold" style={{ color: T.ink }}>admin</span> / <span className="font-mono font-semibold" style={{ color: T.ink }}>admin123</span>
              </p>
              <motion.button whileHover={{ scale: loading ? 1 : 1.01 }} whileTap={{ scale: loading ? 1 : 0.99 }}
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)', boxShadow: '0 4px 16px rgba(26,86,219,0.3)' }}>
                {loading ? 'Authenticating…' : 'Access Dashboard →'}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="px-8 py-12 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-16 h-16 rounded-[18px] flex items-center justify-center mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)' }}>
              <Lock className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-xl font-bold mb-2" style={{ color: T.ink }}>Authenticated</h2>
            <p className="text-sm" style={{ color: T.muted }}>Loading analytics dashboard…</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Financial Cockpit ─── */
function FinancialCockpit({ mouseX, mouseY }) {
  const t1x = useTransform(mouseX, [-500, 500], [-5, 5]);
  const t1y = useTransform(mouseY, [-500, 500], [-5, 5]);
  const s1x = useSpring(t1x, { stiffness: 180, damping: 42 });
  const s1y = useSpring(t1y, { stiffness: 180, damping: 42 });

  const t2x = useTransform(mouseX, [-500, 500], [-13, 13]);
  const t2y = useTransform(mouseY, [-500, 500], [-13, 13]);
  const s2x = useSpring(t2x, { stiffness: 130, damping: 34 });
  const s2y = useSpring(t2y, { stiffness: 130, damping: 34 });

  const t3x = useTransform(mouseX, [-500, 500], [-22, 22]);
  const t3y = useTransform(mouseY, [-500, 500], [-22, 22]);
  const s3x = useSpring(t3x, { stiffness: 90, damping: 26 });
  const s3y = useSpring(t3y, { stiffness: 90, damping: 26 });

  return (
    <div className="relative select-none" style={{ width: '640px', height: '600px', flexShrink: 0 }}>
      {/* Ambient glows — CSS animated for compositor performance */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="ho-orb-a absolute rounded-full" style={{
          width: '340px', height: '340px', top: '4%', left: '-10%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.32) 0%, transparent 68%)',
          filter: 'blur(52px)',
        }} />
        <div className="ho-orb-b absolute rounded-full" style={{
          width: '240px', height: '240px', top: '22%', right: '0%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.22) 0%, transparent 68%)',
          filter: 'blur(40px)',
        }} />
        <div className="ho-orb-c absolute rounded-full" style={{
          width: '180px', height: '180px', bottom: '8%', left: '28%',
          background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 68%)',
          filter: 'blur(34px)',
        }} />
        <div className="ho-orb-d absolute rounded-full" style={{
          width: '180px', height: '180px', top: '45%', right: '10%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 68%)',
          filter: 'blur(38px)',
        }} />
        <div className="ho-orb-e absolute rounded-full" style={{
          width: '110px', height: '110px', bottom: '22%', right: '20%',
          background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 68%)',
          filter: 'blur(26px)',
        }} />
      </div>

      {/* ── Total Balance mini card (top-left) ── */}
      <motion.div
        style={{ x: s1x, y: s1y, position: 'absolute', top: '14px', left: '0px', width: '156px', zIndex: 12, willChange: 'transform' }}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="ho-float-e rounded-[16px] p-4 relative overflow-hidden" style={{
          background: 'rgba(9,14,36,0.92)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(26,86,219,0.28)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(26,86,219,0.12), inset 0 1px 0 rgba(255,255,255,0.08)',
        }}>
          <NoiseLayer opacity={0.038} />
          <div className="flex items-center justify-between mb-2">
            <p className="text-[9px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.32)' }}>Total Balance</p>
            <div className="w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(26,86,219,0.2)' }}>
              <Activity className="w-2.5 h-2.5" style={{ color: '#93C5FD' }} />
            </div>
          </div>
          <p className="text-[1.15rem] font-bold text-white leading-none mb-2">₹8,24,350</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-2.5 h-2.5 flex-shrink-0" style={{ color: '#34d399' }} />
            <span className="text-[10px] font-bold" style={{ color: '#34d399' }}>+14.2%</span>
            <span className="text-[9px] ml-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>today</span>
          </div>
        </div>
      </motion.div>

      {/* ── Monthly Spend mini card (mid-left) ── */}
      <motion.div
        style={{ x: s1x, y: s1y, position: 'absolute', top: '126px', left: '0px', width: '156px', zIndex: 12, willChange: 'transform' }}
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
        transition={{ duration: 0.7, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="ho-float-d rounded-[16px] p-4 relative overflow-hidden" style={{
          background: 'rgba(255,255,255,0.97)',
          boxShadow: '0 16px 44px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,1)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}>
          <p className="text-[9px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#9CA3AF' }}>Monthly Spend</p>
          <p className="text-[1.15rem] font-bold leading-none mb-3" style={{ color: '#0A0A0A' }}>₹48,650</p>
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-1.5" style={{ background: '#E5E7EB' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '72%' }}
              transition={{ duration: 1.1, delay: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #10b981, #34d399)' }}
            />
          </div>
          <p className="text-[10px]" style={{ color: '#9CA3AF' }}>72% of limit</p>
        </div>
      </motion.div>

      {/* ── Layer 1: Main Portfolio Card ── */}
      <motion.div
        style={{ x: s1x, y: s1y, position: 'absolute', top: '55px', left: '148px', width: '295px', zIndex: 10, willChange: 'transform' }}
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 260, damping: 22 } }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="rounded-[22px] p-5 overflow-hidden relative" style={{
          background: 'linear-gradient(148deg, #091228 0%, #1a2e6e 52%, #1A56DB 100%)',
          boxShadow: '0 48px 120px rgba(26,86,219,0.55), 0 20px 60px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none" style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)',
            borderRadius: '22px 22px 0 0',
          }} />
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none" style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.09) 0%, transparent 70%)',
          }} />
          <NoiseLayer opacity={0.04} />
          <motion.div
            animate={{ x: ['-120%', '220%'] }}
            transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 8, ease: 'easeInOut', delay: 3 }}
            aria-hidden="true"
            style={{
              position: 'absolute', inset: 0, borderRadius: '22px',
              background: 'linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.045) 50%, transparent 62%)',
              pointerEvents: 'none',
            }}
          />

          <div className="flex items-start justify-between mb-3 relative">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] mb-1.5" style={{ color: 'rgba(255,255,255,0.38)' }}>
                Portfolio Overview
              </p>
              <p className="text-[1.9rem] font-bold text-white tracking-tight leading-none">₹8,24,350</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full flex-shrink-0" style={{
              background: 'rgba(16,185,129,0.14)',
              border: '1px solid rgba(16,185,129,0.28)',
            }}>
              <TrendingUp className="w-3 h-3" style={{ color: '#34d399' }} />
              <span className="text-[11px] font-bold" style={{ color: '#34d399' }}>+14.2%</span>
            </div>
          </div>

          <div style={{ height: '76px', marginBottom: '14px', marginLeft: '-4px', marginRight: '-4px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PORTFOLIO_DATA} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                <defs>
                  <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke="#34d399" strokeWidth={1.5}
                  fill="url(#pgGrad)" dot={false} activeDot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2">
            {[
              { name: 'SBI Blue Chip Fund', val: '₹2,84,120', pct: '+18.4%' },
              { name: 'SBI Term Deposit', val: '₹1,50,000', pct: '+7.35%' },
            ].map(h => (
              <div key={h.name} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{
                background: 'rgba(255,255,255,0.055)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <p className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{h.name}</p>
                <div className="text-right">
                  <p className="text-xs font-semibold text-white">{h.val}</p>
                  <p className="text-[10px] font-semibold" style={{ color: '#34d399' }}>{h.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Layer 2: AI Copilot Widget (top-right) ── */}
      <motion.div
        style={{ x: s2x, y: s2y, position: 'absolute', top: '0px', right: '0px', width: '210px', zIndex: 20, willChange: 'transform' }}
        initial={{ opacity: 0, x: 28 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
        transition={{ duration: 0.8, delay: 0.65 }}
      >
        <div className="ho-float-a rounded-[18px] p-4 relative overflow-hidden" style={{
          background: 'rgba(9,14,36,0.9)',
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          border: '1px solid rgba(26,86,219,0.36)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.62), 0 6px 20px rgba(26,86,219,0.18), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}>
          <NoiseLayer opacity={0.042} />
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)',
              }}>
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.38)' }}>
                AI Copilot
              </p>
            </div>
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{
              background: '#34d399',
              boxShadow: '0 0 7px rgba(52,211,153,0.9)',
            }} />
          </div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.68)' }}>
            Increase your{' '}
            <span style={{ color: '#93C5FD', fontWeight: 600 }}>SBI Small Cap SIP</span>{' '}
            by ₹2,000 — matches your risk profile.
          </p>
          <p className="text-[10px] mt-2.5 font-medium" style={{ color: '#60a5fa' }}>View Insight →</p>
        </div>
      </motion.div>

      {/* ── Layer 3: SIP Notification (right-mid) ── */}
      <motion.div
        style={{ x: s3x, y: s3y, position: 'absolute', right: '-20px', top: '238px', zIndex: 30, willChange: 'transform' }}
        initial={{ opacity: 0, x: 36 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
        transition={{ duration: 0.7, delay: 1.0 }}
      >
        <div className="ho-float-b rounded-[16px] px-4 py-3 flex items-center gap-3 relative overflow-hidden" style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 20px 56px rgba(0,0,0,0.28), 0 4px 12px rgba(16,185,129,0.12), inset 0 1px 0 rgba(255,255,255,1)',
          border: '1px solid rgba(255,255,255,0.92)',
          minWidth: '198px',
        }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
            background: 'rgba(16,185,129,0.12)',
          }}>
            <ArrowUpRight className="w-4 h-4" style={{ color: '#059669' }} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold" style={{ color: T.ink }}>SIP Executed</p>
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#10b981' }} />
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: T.muted }}>₹8,000 · SBI Small Cap</p>
          </div>
        </div>
      </motion.div>

      {/* ── Layer 4: KYC Badge (bottom-right) ── */}
      <motion.div
        style={{ x: s2x, y: s2y, position: 'absolute', right: '-14px', bottom: '52px', zIndex: 25, willChange: 'transform' }}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.04, transition: { type: 'spring', stiffness: 300, damping: 22 } }}
        transition={{ duration: 0.8, delay: 0.88 }}
      >
        <div className="ho-float-c rounded-[16px] px-4 py-3 flex items-center gap-3 relative overflow-hidden" style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(28px) saturate(180%)',
          WebkitBackdropFilter: 'blur(28px) saturate(180%)',
          boxShadow: '0 20px 52px rgba(0,0,0,0.22), 0 4px 12px rgba(16,185,129,0.1), inset 0 1px 0 rgba(255,255,255,1)',
          border: '1px solid rgba(255,255,255,0.92)',
        }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.2)',
          }}>
            <CheckCircle className="w-4 h-4" style={{ color: '#10b981' }} />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: T.ink }}>KYC Verified</p>
            <p className="text-[10px] mt-0.5" style={{ color: T.muted }}>Aadhaar · PAN</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── Metric Ticker ─── */
function MetricTicker() {
  const items = [...METRICS, ...METRICS];
  return (
    <div className="overflow-hidden py-4" style={{
      background: '#020810',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <motion.div
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'linear' }}
        className="flex" style={{ width: 'max-content' }}
      >
        {items.map((m, i) => (
          <div key={i} className="flex items-center gap-7 px-10">
            <span className="text-sm font-bold text-white">{m.value}</span>
            <span className="text-sm" style={{ color: 'rgba(255,255,255,0.32)' }}>{m.label}</span>
            <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: '1.2em' }}>·</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Feature Visuals ─── */
function FeatureVisual({ index, accent }) {
  if (index === 0) {
    return (
      <div className="w-full max-w-[340px] rounded-[22px] p-5 overflow-hidden" style={{
        background: 'linear-gradient(145deg, #EEF4FF 0%, #E8F0FF 100%)',
        border: '1px solid rgba(26,86,219,0.1)',
      }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(26,86,219,0.5)' }}>
          AI Onboarding Chat
        </p>
        <div className="space-y-2.5">
          {[
            { text: 'Hi! What kind of account suits me?', self: false },
            { text: 'Based on your income of ₹85,000/mo, I recommend a SBI Savings Plus account with zero MAB.', self: true },
            { text: 'Can I get an FD too?', self: false },
            { text: 'Absolutely — I can open a 6-month FD at 7.35% p.a. alongside. Want to proceed?', self: true },
          ].map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.self ? 12 : -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`flex ${msg.self ? 'justify-end' : 'justify-start'}`}
            >
              <div className="max-w-[82%] px-3.5 py-2.5 rounded-[14px] text-[11px] leading-relaxed" style={{
                background: msg.self ? 'linear-gradient(135deg, #1E3A8A, #1A56DB)' : '#FFFFFF',
                color: msg.self ? '#FFFFFF' : T.ink,
                boxShadow: msg.self ? '0 4px 12px rgba(26,86,219,0.3)' : '0 2px 8px rgba(0,0,0,0.06)',
                border: msg.self ? 'none' : `1px solid ${T.border}`,
              }}>
                {msg.text}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }
  if (index === 1) {
    return (
      <div className="w-full max-w-[340px] rounded-[22px] p-5 overflow-hidden" style={{
        background: 'linear-gradient(145deg, #ECFDF5 0%, #E6F9F1 100%)',
        border: '1px solid rgba(5,150,105,0.12)',
      }}>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{
            background: 'rgba(5,150,105,0.12)', border: '1px solid rgba(5,150,105,0.2)',
          }}>
            <Shield className="w-5 h-5" style={{ color: '#059669' }} />
          </div>
          <div>
            <p className="text-xs font-bold" style={{ color: '#059669' }}>KYC Verification</p>
            <p className="text-[10px]" style={{ color: 'rgba(5,150,105,0.6)' }}>RBI-compliant pipeline</p>
          </div>
          <div className="ml-auto px-2.5 py-1 rounded-full" style={{ background: 'rgba(5,150,105,0.12)' }}>
            <p className="text-[10px] font-bold" style={{ color: '#059669' }}>✓ Live</p>
          </div>
        </div>
        {[
          { label: 'Aadhaar OCR', status: 'Verified', done: true },
          { label: 'PAN Extraction', status: 'Verified', done: true },
          { label: 'Face Match', status: 'Verified', done: true },
          { label: 'RBI Check', status: 'Passed', done: true },
        ].map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center justify-between py-2.5 border-b last:border-0"
            style={{ borderColor: 'rgba(5,150,105,0.1)' }}
          >
            <p className="text-xs font-medium" style={{ color: '#064E3B' }}>{step.label}</p>
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" style={{ color: '#10b981' }} />
              <p className="text-[11px] font-semibold" style={{ color: '#10b981' }}>{step.status}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }
  return (
    <div className="w-full max-w-[340px] rounded-[22px] p-5 overflow-hidden" style={{
      background: 'linear-gradient(145deg, #EEF2FF 0%, #E8EEFF 100%)',
      border: '1px solid rgba(30,58,138,0.1)',
    }}>
      <p className="text-[10px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: 'rgba(30,58,138,0.5)' }}>
        Live Funnel Analytics
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          { label: 'Drop-off Rate', value: '8.4%', sub: '↓ 3.1% vs last week', good: true },
          { label: 'KYC Pass Rate', value: '91.2%', sub: '↑ 2.4% vs last week', good: true },
          { label: 'Avg. Time', value: '2m 48s', sub: 'Onboarding flow', good: false },
          { label: "Today's Signups", value: '247', sub: 'Since 9:00 AM', good: false },
        ].map(stat => (
          <div key={stat.label} className="rounded-[14px] p-3" style={{
            background: '#fff',
            border: `1px solid ${T.border}`,
          }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: T.muted }}>{stat.label}</p>
            <p className="text-base font-black tracking-tight" style={{ color: T.ink }}>{stat.value}</p>
            <p className="text-[10px] mt-0.5" style={{ color: stat.good ? '#10b981' : T.muted }}>{stat.sub}</p>
          </div>
        ))}
      </div>
      <div className="flex items-end gap-1 h-12">
        {[35, 48, 42, 60, 54, 68, 61, 75, 70, 82, 78, 91].map((h, i) => (
          <motion.div key={i}
            initial={{ height: 0 }} whileInView={{ height: `${h}%` }} viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.03, duration: 0.4, ease: 'easeOut' }}
            className="flex-1 rounded-t-sm"
            style={{ background: i >= 9 ? '#1A56DB' : 'rgba(26,86,219,0.18)' }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Export ─── */
export default function Landing() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);
  const howItWorksRef = useRef(null);
  const heroRef = useRef(null);
  const [modal, setModal] = useState(null);
  const [signInOpen, setSignInOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const signInRef = useRef(null);
  const { scrollY } = useScroll();

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    let prev = false;
    return scrollY.on('change', v => {
      const next = v > 55;
      if (next !== prev) { prev = next; setScrolled(next); }
    });
  }, [scrollY]);

  useEffect(() => {
    const handler = (e) => {
      if (signInRef.current && !signInRef.current.contains(e.target)) setSignInOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: 'smooth' });

  const navTextDark = scrolled ? T.ink : '#FFFFFF';
  const navLinkColor = scrolled ? T.muted : 'rgba(255,255,255,0.58)';
  const navBorder = scrolled ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.0)';
  const navBg = scrolled ? 'rgba(255,255,255,0.93)' : 'rgba(3,7,18,0)';

  return (
    <div style={{ fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{LANDING_CSS}</style>

      <AnimatePresence>
        {modal === 'customer' && <CustomerSignInModal onClose={() => setModal(null)} navigate={navigate} />}
        {modal === 'admin' && <AdminSignInModal onClose={() => setModal(null)} navigate={navigate} />}
      </AnimatePresence>

      {/* ── Navbar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navBg,
          borderBottom: `1px solid ${navBorder}`,
          backdropFilter: 'blur(40px) saturate(190%)',
          WebkitBackdropFilter: 'blur(40px) saturate(190%)',
          boxShadow: scrolled ? '0 1px 40px rgba(0,0,0,0.07), 0 0 0 0.5px rgba(0,0,0,0.04)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2.5 group"
          >
            <div className="w-8 h-8 rounded-[10px] flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)' }}>
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[1.05rem] tracking-tight transition-colors duration-300"
              style={{ color: navTextDark }}>
              HyperOne
            </span>
            <span className="hidden sm:inline text-[10px] font-semibold px-2 py-0.5 rounded-full transition-all duration-300"
              style={{
                background: scrolled ? 'rgba(26,86,219,0.08)' : 'rgba(255,255,255,0.1)',
                color: scrolled ? T.blue : 'rgba(255,255,255,0.65)',
              }}>
              Beta
            </span>
          </button>

          <div className="hidden md:flex items-center gap-1">
            {[
              { label: 'Features', action: () => scrollTo(featuresRef) },
              { label: 'How It Works', action: () => scrollTo(howItWorksRef) },
            ].map(item => (
              <button key={item.label} onClick={item.action}
                className="text-sm px-4 py-2 rounded-full transition-all duration-200"
                style={{ color: navLinkColor }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = navTextDark;
                  e.currentTarget.style.background = scrolled ? '#F3F4F6' : 'rgba(255,255,255,0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = navLinkColor;
                  e.currentTarget.style.background = 'transparent';
                }}>
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block" ref={signInRef}>
              <button
                onClick={() => setSignInOpen(o => !o)}
                className="flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200"
                style={{
                  color: navLinkColor,
                  border: `1px solid ${scrolled ? T.border : 'rgba(255,255,255,0.14)'}`,
                  background: signInOpen ? (scrolled ? '#F3F4F6' : 'rgba(255,255,255,0.08)') : 'transparent',
                }}>
                <User className="w-3.5 h-3.5" />
                Sign In
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200"
                  style={{ transform: signInOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              <AnimatePresence>
                {signInOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.14 }}
                    className="absolute right-0 top-full mt-2 w-56 rounded-2xl p-1.5 z-50"
                    style={{ background: '#fff', border: `1px solid ${T.border}`, boxShadow: '0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)' }}>
                    {[
                      { label: 'Existing Customer', sub: 'Sign in to your account', icon: User, type: 'customer' },
                      { label: 'Admin Portal', sub: 'Staff & analytics access', icon: Lock, type: 'admin' },
                    ].map((item, i) => (
                      <button key={item.type}
                        onClick={() => { setSignInOpen(false); setModal(item.type); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
                        style={{ borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: `rgba(26,86,219,${i === 0 ? '0.06' : '0.1'})` }}>
                          <item.icon className="w-3.5 h-3.5" style={{ color: T.blue }} />
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: T.ink }}>{item.label}</p>
                          <p className="text-[11px]" style={{ color: T.muted }}>{item.sub}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <MagneticButton
              whileHover={{ scale: 1.03, y: -1 }}
              onClick={() => { sessionStorage.setItem('hyperone_role', 'customer'); navigate('/register'); }}
              className="flex items-center gap-2 text-sm font-semibold text-white px-5 py-2.5 rounded-full"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)', boxShadow: '0 2px 14px rgba(26,86,219,0.42)' }}>
              Get Started
              <ArrowRight className="w-3.5 h-3.5" />
            </MagneticButton>
          </div>
        </div>
      </div>

      {/* ── Hero + Ticker (unified dark section) ── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="relative overflow-hidden"
        style={{ background: '#030712' }}
      >
        {/* Animated mesh */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.032 }}>
            <defs>
              <pattern id="hg" width="64" height="64" patternUnits="userSpaceOnUse">
                <path d="M 64 0 L 0 0 0 64" fill="none" stroke="rgba(255,255,255,1)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hg)" />
          </svg>
          {/* Light ring — Vision Pro style */}
          <div className="absolute pointer-events-none" style={{
            width: '580px', height: '580px', top: '6%', right: '4%',
            transform: 'translate(18%, -12%)',
            border: '1px solid rgba(26,86,219,0.09)',
            borderRadius: '50%',
            boxShadow: '0 0 0 44px rgba(26,86,219,0.03), 0 0 0 88px rgba(26,86,219,0.018)',
          }} />
          {/* CSS-animated ambient orbs for compositor performance */}
          <div className="ho-hero-a absolute rounded-full" style={{
            width: '760px', height: '760px', top: '-220px', right: '-140px',
            background: 'radial-gradient(circle, rgba(26,86,219,0.22) 0%, transparent 65%)',
            filter: 'blur(70px)',
          }} />
          <div className="ho-hero-b absolute rounded-full" style={{
            width: '560px', height: '560px', bottom: '-120px', left: '-120px',
            background: 'radial-gradient(circle, rgba(30,58,138,0.28) 0%, transparent 65%)',
            filter: 'blur(64px)',
          }} />
          <div className="ho-hero-c absolute rounded-full" style={{
            width: '340px', height: '340px', top: '38%', left: '44%',
            background: 'radial-gradient(circle, rgba(56,189,248,0.28) 0%, transparent 70%)',
            filter: 'blur(56px)',
          }} />
        </div>

        {/* Main hero content */}
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-12 lg:gap-6"
          style={{ minHeight: '100vh', paddingTop: '7rem', paddingBottom: '5rem' }}>
          {/* Left column */}
          <div className="flex-1 max-w-[560px]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] px-4 py-2 rounded-full mb-8"
                style={{ background: 'rgba(26,86,219,0.14)', color: '#93C5FD', border: '1px solid rgba(26,86,219,0.24)' }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#93C5FD', animation: 'pulse 2s ease-in-out infinite' }} />
                SBI HackFest 2026 · Live Demo
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 36 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ fontSize: 'clamp(3.2rem, 5.8vw, 5.2rem)', lineHeight: 1.03, fontWeight: 700, letterSpacing: '-0.04em', marginBottom: '1.5rem' }}
            >
              <span style={{ color: '#FFFFFF' }}>Banking.</span>
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #93C5FD 45%, #BFDBFE 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>
                Reimagined.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.56, delay: 0.2 }}
              className="text-lg leading-relaxed mb-10 max-w-[480px]"
              style={{ color: 'rgba(255,255,255,0.48)' }}
            >
              HyperOne uses conversational AI to acquire, qualify, and onboard customers
              with hyper-personalised journeys — in minutes, not days.
            </motion.p>

            {/* Single CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.46, delay: 0.3 }}
              className="mb-8"
            >
              <MagneticButton
                whileHover={{ scale: 1.025, y: -2 }}
                onClick={() => { sessionStorage.setItem('hyperone_role', 'customer'); navigate('/register'); }}
                className="inline-flex items-center justify-center gap-2.5 font-semibold text-white text-base px-8 py-4 rounded-full group"
                style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)', boxShadow: '0 8px 32px rgba(26,86,219,0.45), 0 2px 8px rgba(26,86,219,0.3)' }}>
                Begin Onboarding
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </MagneticButton>
            </motion.div>

            {/* Avatar trust row */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
              className="flex items-center gap-3 mb-10"
            >
              <div className="flex" style={{ gap: '-0.5rem' }}>
                {[
                  { bg: 'linear-gradient(135deg,#1E3A8A,#1A56DB)', t: 'R' },
                  { bg: 'linear-gradient(135deg,#065F46,#059669)', t: 'S' },
                  { bg: 'linear-gradient(135deg,#5B21B6,#7C3AED)', t: 'A' },
                  { bg: 'linear-gradient(135deg,#92400E,#D97706)', t: 'P' },
                  { bg: 'linear-gradient(135deg,#831843,#DB2777)', t: 'K' },
                ].map((av, i) => (
                  <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                    style={{
                      background: av.bg,
                      border: '2px solid #030712',
                      marginLeft: i > 0 ? '-8px' : '0',
                      zIndex: 5 - i,
                      position: 'relative',
                    }}>
                    {av.t}
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Trusted by <span style={{ color: '#ffffff', fontWeight: 600 }}>1,000+</span> users
              </p>
            </motion.div>
          </div>

          {/* Right: Cockpit */}
          <div className="hidden lg:flex flex-1 items-center justify-end pr-4">
            <FinancialCockpit mouseX={mouseX} mouseY={mouseY} />
          </div>
        </div>

        {/* Security trust badges — full-width bottom bar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{
            borderTop: '1px solid rgba(255,255,255,0.06)',
            background: 'rgba(3,7,18,0.6)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
          }}>
          <div className="max-w-7xl mx-auto px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
            {TRUST.map(t => (
              <div key={t.label} className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0" style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  <Shield className="w-3 h-3" style={{ color: 'rgba(255,255,255,0.4)' }} />
                </div>
                <span className="text-[11px] font-medium" style={{ color: 'rgba(255,255,255,0.38)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Scroll cue */}
        <div className="flex flex-col items-center py-5 gap-2" style={{ background: '#020810' }}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Scroll to Explore
          </p>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.2)' }} />
          </motion.div>
        </div>

        {/* Metric Ticker — stays inside dark section */}
        <MetricTicker />

        {/* Apple-quality gradient fade to white */}
        <div aria-hidden="true" style={{
          height: '120px',
          background: 'linear-gradient(to bottom, #020810 0%, #ffffff 100%)',
        }} />
      </section>

      {/* ── Features ── */}
      <section ref={featuresRef} id="features" className="py-28 lg:py-36" style={{ background: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-3xl mb-20">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.22em] mb-5" style={{ color: T.blue }}>
              Platform Capabilities
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 'clamp(2rem, 3.5vw, 3rem)', lineHeight: 1.07, fontWeight: 700, letterSpacing: '-0.025em', color: T.ink, marginBottom: '1rem' }}>
              Everything a modern bank needs —<br />in one platform.
            </motion.h2>
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              transition={{ delay: 0.1 }} className="text-lg leading-relaxed" style={{ color: T.muted }}>
              From lead capture to account creation, HyperOne covers the entire acquisition
              funnel with AI precision and enterprise reliability.
            </motion.p>
          </div>

          <div className="space-y-6">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              const flip = i % 2 !== 0;
              return (
                <motion.div key={f.n}
                  initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: 0.06 }}
                  whileHover={{ y: -6, boxShadow: '0 20px 56px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)' }}
                  className={`flex flex-col ${flip ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-10 lg:gap-16 items-center p-8 lg:p-12 rounded-[28px]`}
                  style={{ background: '#FAFAFA', border: `1px solid ${T.border}`, boxShadow: '0 2px 8px rgba(0,0,0,0)' }}>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-5">
                      <span className="text-[3.5rem] font-black leading-none select-none" style={{ color: 'rgba(0,0,0,0.05)', letterSpacing: '-0.04em' }}>
                        {f.n}
                      </span>
                      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center" style={{
                        background: `${f.accent}12`, border: `1px solid ${f.accent}22`,
                      }}>
                        <Icon className="w-5 h-5" style={{ color: f.accent }} />
                      </div>
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: f.accent }}>
                      {f.eyebrow}
                    </p>
                    <h3 style={{ fontSize: 'clamp(1.4rem, 2.4vw, 1.9rem)', lineHeight: 1.15, fontWeight: 700, letterSpacing: '-0.022em', color: T.ink, marginBottom: '1rem' }}>
                      {f.title}
                    </h3>
                    <p className="text-base leading-relaxed mb-7" style={{ color: T.muted }}>{f.body}</p>
                    <div className="flex items-center gap-5">
                      {f.meta.map(m => (
                        <div key={m.label} className="flex flex-col">
                          <span className="text-xl font-black tracking-tight" style={{ color: T.ink }}>{m.v}</span>
                          <span className="text-xs mt-0.5" style={{ color: T.muted }}>{m.label}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full ml-1" style={{
                        background: `${f.accent}0e`,
                      }}>
                        <Activity className="w-3 h-3" style={{ color: f.accent }} />
                        <span className="text-xs font-semibold" style={{ color: f.accent }}>{f.stat}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <FeatureVisual index={i} accent={f.accent} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section ref={howItWorksRef} id="how-it-works" className="py-28 lg:py-36"
        style={{ background: '#FAFAFA', borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
              className="text-xs font-bold uppercase tracking-[0.22em] mb-5" style={{ color: T.blue }}>
              Onboarding Journey
            </motion.p>
            <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              style={{ fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.025em', color: T.ink }}>
              From hello to full account<br />in 4 steps.
            </motion.h2>
          </div>

          <div className="relative">
            <div className="hidden lg:block absolute top-8 left-0 right-0 h-px"
              style={{ background: `linear-gradient(90deg, transparent, ${T.border} 10%, ${T.border} 90%, transparent)` }} />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {STEPS.map((s, i) => (
                <motion.div key={s.n}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="relative">
                  <motion.div
                    whileHover={{ scale: 1.1, y: -3, transition: { type: 'spring', stiffness: 280, damping: 20 } }}
                    className="w-16 h-16 rounded-[18px] flex items-center justify-center mb-6 relative z-10"
                    style={{
                      background: i === 0 ? 'linear-gradient(135deg, #1E3A8A, #1A56DB)' : '#FFFFFF',
                      border: `1px solid ${i === 0 ? 'transparent' : T.border}`,
                      boxShadow: i === 0 ? '0 8px 24px rgba(26,86,219,0.35)' : '0 2px 8px rgba(0,0,0,0.06)',
                    }}>
                    <span className="font-black text-lg" style={{ color: i === 0 ? '#FFFFFF' : T.muted }}>{s.n}</span>
                  </motion.div>
                  <h4 className="font-semibold text-base mb-2" style={{ color: T.ink }}>{s.label}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: T.muted }}>{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 lg:py-28 px-6" style={{ background: '#FFFFFF', borderTop: `1px solid ${T.border}` }}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="relative rounded-[32px] overflow-hidden px-10 lg:px-20 py-20 text-center"
            style={{ background: 'linear-gradient(140deg, #0F172A 0%, #1E3A8A 52%, #1A56DB 100%)', boxShadow: '0 40px 80px rgba(26,86,219,0.26), 0 8px 24px rgba(0,0,0,0.22)' }}>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute rounded-full" style={{
                width: '480px', height: '480px',
                top: '50%', left: '50%', transform: 'translate(-50%, -80%)',
                background: 'radial-gradient(circle, rgba(59,130,246,0.32) 0%, transparent 70%)',
                filter: 'blur(64px)',
              }} />
            </div>
            <div className="relative">
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-8" style={{
                  background: 'rgba(255,255,255,0.11)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(16px)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.24)',
                }}>
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>
              <h2 className="font-bold text-white mb-5 tracking-tight"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', lineHeight: 1.08 }}>
                Ready to experience the<br />future of banking?
              </h2>
              <p className="text-lg mb-10 max-w-md mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
                Open a full bank account in under 3 minutes. No branch visit, no paperwork.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <MagneticButton
                  whileHover={{ scale: 1.03, y: -2, boxShadow: '0 10px 36px rgba(0,0,0,0.32)' }}
                  onClick={() => { sessionStorage.setItem('hyperone_role', 'customer'); navigate('/register'); }}
                  className="flex items-center gap-2.5 font-semibold text-base bg-white rounded-full px-9 py-4 group"
                  style={{ color: T.ink, boxShadow: '0 4px 20px rgba(0,0,0,0.22)' }}>
                  Begin Onboarding
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </MagneticButton>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  onClick={() => setModal('customer')}
                  className="flex items-center gap-2 font-medium text-sm rounded-full px-7 py-4"
                  style={{ color: 'rgba(255,255,255,0.68)', border: '1px solid rgba(255,255,255,0.14)', background: 'rgba(255,255,255,0.06)' }}>
                  Already a customer? Sign In
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-10 px-6" style={{ background: '#030712', borderTop: '1px solid rgba(255,255,255,0.09)' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[7px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)', boxShadow: '0 0 10px rgba(26,86,219,0.35)' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-sm" style={{ color: '#CBD5E1', letterSpacing: '0.01em' }}>HyperOne</span>
          </div>
          <p className="text-xs tracking-wide" style={{ color: '#94A3B8' }}>
            Built for SBI HackFest 2026&nbsp;·&nbsp;Bank-grade security&nbsp;·&nbsp;© 2026
          </p>
          <div className="flex items-center gap-5">
            {[
              { icon: Globe, label: 'SBI Compliant' },
              { icon: Shield, label: 'Secure' },
              { icon: Target, label: 'Award Entry' },
            ].map(item => (
              <motion.div
                key={item.label}
                className="flex items-center gap-1.5 text-xs cursor-default select-none"
                style={{ color: '#64748B' }}
                whileHover={{ color: '#CBD5E1' }}
                transition={{ duration: 0.18 }}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </motion.div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
