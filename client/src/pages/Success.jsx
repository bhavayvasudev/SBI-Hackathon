import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle, Copy, Download, Sparkles, Zap,
  Home, LayoutDashboard, KeyRound, ShieldCheck,
  TrendingUp, BarChart2, Cpu, Check, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';

const SUC_CSS = `
  @keyframes sucFloat1 {
    0%, 100% { transform: perspective(600px) rotateY(-18deg) rotateX(6deg) translateY(0px); }
    50%       { transform: perspective(600px) rotateY(-13deg) rotateX(3deg) translateY(-14px); }
  }
  @keyframes sucFloat2 {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50%       { transform: translateY(-18px) rotate(5deg); }
  }
  @keyframes sucFloat3 {
    0%, 100% { transform: translateY(0px) rotate(-3deg); }
    50%       { transform: translateY(-12px) rotate(2deg); }
  }
  @keyframes sucFloat4 {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-10px) scale(1.05); }
  }
  @keyframes sucFloat5 {
    0%, 100% { transform: translateY(0px) rotate(2deg); }
    50%       { transform: translateY(-8px) rotate(-1deg); }
  }
  @keyframes ambPulse {
    0%, 100% { opacity: 0.07; transform: scale(1); }
    50%       { opacity: 0.12; transform: scale(1.06); }
  }
  .suc-f1 { animation: sucFloat1 6s ease-in-out infinite; will-change: transform; }
  .suc-f2 { animation: sucFloat2 5.5s ease-in-out infinite 1.1s; will-change: transform; }
  .suc-f3 { animation: sucFloat3 4.5s ease-in-out infinite 2.2s; will-change: transform; }
  .suc-f4 { animation: sucFloat4 3.8s ease-in-out infinite 0.6s; will-change: transform; }
  .suc-f5 { animation: sucFloat5 7s ease-in-out infinite 1.8s; will-change: transform; }
`;

const CONFETTI_COLORS = ['#1A56DB', '#1E3A8A', '#10b981', '#f59e0b', '#60a5fa', '#34d399'];

function Confetti() {
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
      {Array.from({ length: 28 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: -24, rotate: 0, opacity: 1,
            scale: 0.6 + Math.random() * 0.8,
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 30,
            rotate: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
            opacity: [1, 1, 0.6, 0],
          }}
          transition={{
            duration: 3.5 + Math.random() * 2.5,
            delay: Math.random() * 2,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            width: 6 + Math.random() * 8,
            height: 6 + Math.random() * 8,
            borderRadius: Math.random() > 0.4 ? '50%' : '2px',
            backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          }}
        />
      ))}
    </div>
  );
}

const CHECKS = [
  { label: 'Account activated', color: '#34d399' },
  { label: 'KYC verified', color: '#60a5fa' },
  { label: 'RBI compliant', color: '#a78bfa' },
  { label: 'AI Copilot enabled', color: '#fbbf24' },
  { label: 'Bank-grade security', color: '#f472b6' },
];

function FloatingVisuals({ name }) {
  return (
    <div style={{ position: 'relative', flex: 1, width: '100%' }}>
      {/* Glow behind card */}
      <div style={{
        position: 'absolute', left: '50%', bottom: '28%',
        transform: 'translateX(-50%)',
        width: 220, height: 130, borderRadius: '50%',
        background: 'rgba(26,107,255,0.32)', filter: 'blur(44px)',
        pointerEvents: 'none',
      }} />

      {/* Main debit card */}
      <div className="suc-f1" style={{
        position: 'absolute', left: '50%', bottom: '22%',
        transform: 'translateX(-52%)',
        width: 224, height: 140,
        borderRadius: 18,
        background: 'linear-gradient(140deg, #0A1F6E 0%, #0942CC 55%, #1A6BFF 100%)',
        boxShadow: '0 32px 80px rgba(0,0,0,0.55), 0 8px 32px rgba(15,82,255,0.4), 0 0 0 1px rgba(255,255,255,0.14)',
        padding: '18px 20px 16px',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 20%, rgba(255,255,255,0.22) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', right: -28, top: -28, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600 }}>HyperOne</p>
            <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 500 }}>State Bank of India</p>
          </div>
          <div style={{ width: 26, height: 19, borderRadius: 4, background: 'linear-gradient(135deg, #f0c040, #c8960c)', boxShadow: '0 2px 8px rgba(192,144,12,0.4)' }} />
        </div>
        <p style={{ fontFamily: 'monospace', fontSize: 13, color: 'rgba(255,255,255,0.88)', letterSpacing: '0.12em', marginBottom: 14, fontWeight: 600 }}>
          **** **** **** 4821
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.32)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>Card Holder</p>
            <p style={{ fontSize: 11, color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {name?.toUpperCase().split(' ').slice(0, 2).join(' ') || 'HYPERONE USER'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontWeight: 700 }}>VISA</p>
            <div style={{ marginTop: 2, fontSize: 8, color: '#34d399', fontWeight: 700, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Emerald shield orb */}
      <div className="suc-f2" style={{
        position: 'absolute', right: '8%', top: '8%',
        width: 82, height: 82, borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 35%, #34d399, #059669)',
        boxShadow: '0 16px 48px rgba(52,211,153,0.5), 0 0 0 1px rgba(52,211,153,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <ShieldCheck style={{ width: 34, height: 34, color: 'white' }} />
      </div>

      {/* Gold coin */}
      <div className="suc-f3" style={{
        position: 'absolute', left: '5%', bottom: '40%',
        width: 66, height: 66, borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #fde68a, #f59e0b, #d97706)',
        boxShadow: '0 12px 36px rgba(245,158,11,0.55), 0 0 0 2px rgba(255,255,255,0.22)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2px solid rgba(255,255,255,0.22)',
      }}>
        <span style={{ fontSize: 24, fontWeight: 900, color: '#92400e', lineHeight: 1 }}>₹</span>
      </div>

      {/* AI badge */}
      <div className="suc-f4" style={{
        position: 'absolute', left: '10%', top: '14%',
        background: 'rgba(255,255,255,0.12)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.22)',
        borderRadius: 28, padding: '7px 15px',
        display: 'flex', alignItems: 'center', gap: 7,
        boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
      }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399', boxShadow: '0 0 8px #34d399' }} />
        <span style={{ fontSize: 11, color: 'white', fontWeight: 600, letterSpacing: '0.02em' }}>AI Copilot Active</span>
      </div>

      {/* Account activated pill */}
      <div className="suc-f5" style={{
        position: 'absolute', left: '50%', bottom: '10%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(52,211,153,0.3)',
        borderRadius: 16, padding: '9px 20px',
        display: 'flex', alignItems: 'center', gap: 9,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)', whiteSpace: 'nowrap',
      }}>
        <CheckCircle style={{ width: 14, height: 14, color: '#34d399' }} />
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.9)', fontWeight: 600, letterSpacing: '0.02em' }}>Account Activated</span>
      </div>
    </div>
  );
}

function CopyField({ label, value }) {
  const copy = () => { navigator.clipboard.writeText(value); toast.success(`${label} copied!`); };
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '12px 16px' }}>
      <div>
        <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.38)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>{label}</p>
        <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', fontFamily: 'monospace', letterSpacing: '0.06em' }}>{value}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
        onClick={copy}
        style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(10,88,245,0.06)', border: '1px solid rgba(10,88,245,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A58F5', cursor: 'pointer', flexShrink: 0, marginLeft: 12 }}
      >
        <Copy style={{ width: 14, height: 14 }} />
      </motion.button>
    </div>
  );
}

const NEXT_STEPS = [
  { icon: <LayoutDashboard style={{ width: 20, height: 20 }} />, title: 'Explore Dashboard', desc: 'Balances, transactions, insights', color: '#0A58F5', to: '/my-dashboard' },
  { icon: <Cpu style={{ width: 20, height: 20 }} />, title: 'Meet AI Copilot', desc: 'Your personal financial advisor', color: '#7c3aed', to: '/my-dashboard' },
  { icon: <TrendingUp style={{ width: 20, height: 20 }} />, title: 'Start Investing', desc: 'FDs, SIPs and mutual funds', color: '#059669', to: '/my-dashboard' },
  { icon: <BarChart2 style={{ width: 20, height: 20 }} />, title: 'View Portfolio', desc: 'Risk profile & recommendations', color: '#d97706', to: '/my-dashboard' },
];

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore(s => s.setAuth);
  const accountData = location.state?.accountData;

  useEffect(() => {
    sessionStorage.setItem('hyperone_auth', '1');
    sessionStorage.setItem('hyperone_role', 'customer');
    if (accountData?.token) {
      setAuth(accountData.token, {
        customerId: accountData.customerId,
        accountNumber: accountData.accountNumber,
        profile: accountData.profile,
        kycDocuments: accountData.kycDocuments,
        recommendedProducts: accountData.recommendedProducts,
        ifscCode: accountData.ifscCode,
        branchName: accountData.branchName,
      });
    }
  }, []);

  const mockData = {
    accountNumber: '3' + Math.floor(Math.random() * 9e10 + 1e10).toString().slice(0, 10),
    customerId: 'SBIH' + Math.floor(Math.random() * 9e5 + 1e5),
    mpin: '123456',
    ifscCode: 'SBIN0001234',
    branchName: 'HyperOne Digital Branch',
    profile: { name: 'Demo User', category: 'salaried' },
    recommendedProducts: ['SBI Salary Account', 'SBI Fixed Deposit', 'SBI SimplyCLICK Credit Card'],
  };

  const data = accountData || mockData;
  const name = data.profile?.name || 'Customer';

  const handleDownload = () => {
    const el = document.createElement('a');
    el.setAttribute('download', 'hyperone-account-details.txt');
    el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(
      `HyperOne Account Details\n\nAccount Number: ${data.accountNumber}\nCustomer ID: ${data.customerId}\nMPIN: ${data.mpin}\nIFSC Code: ${data.ifscCode}\nBranch: ${data.branchName}\n\nKeep your MPIN secret.`
    ));
    el.click();
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif", background: '#EEF1F8' }}>
      <style>{SUC_CSS}</style>
      <Confetti />

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex" style={{
        width: '45%', minWidth: '360px',
        position: 'sticky', top: 0, height: '100vh', alignSelf: 'flex-start',
        background: 'linear-gradient(135deg, #0A1F6E 0%, #0942CC 55%, #1A6BFF 100%)',
        flexDirection: 'column', padding: '44px 44px 36px', overflow: 'hidden',
      }}>
        {/* Ambient orbs */}
        <div style={{ position: 'absolute', top: -120, right: -80, width: 380, height: 380, borderRadius: '50%', background: 'rgba(100,160,255,0.07)', pointerEvents: 'none', animation: 'ambPulse 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: -100, left: -60, width: 300, height: 300, borderRadius: '50%', background: 'rgba(52,211,153,0.06)', pointerEvents: 'none', animation: 'ambPulse 10s ease-in-out infinite 3s' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap style={{ width: 16, height: 16, color: 'white' }} />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>HyperOne</span>
          <span style={{ marginLeft: 6, fontSize: 9, fontWeight: 700, color: '#34d399', background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.3)', padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live</span>
        </div>

        {/* Headline */}
        <div style={{ marginTop: 36 }}>
          <h1 style={{ fontSize: 'clamp(38px, 4vw, 58px)', fontWeight: 900, color: 'white', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 14 }}>
            Banking,<br />
            <span style={{ color: 'rgba(255,255,255,0.68)' }}>Activated.</span>
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, maxWidth: 290 }}>
            Your identity is verified. Your HyperOne account is live and ready.
          </p>
        </div>

        {/* Animated checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 28 }}>
          {CHECKS.map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.4, ease: 'easeOut' }}
              style={{ display: 'flex', alignItems: 'center', gap: 10 }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: `${c.color}22`, border: `1px solid ${c.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Check style={{ width: 10, height: 10, color: c.color }} />
              </div>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.72)', fontWeight: 500 }}>{c.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Floating visuals fill remaining space */}
        <FloatingVisuals name={name} />

        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', fontWeight: 500, letterSpacing: '0.04em' }}>
          Built for SBI HackFest 2026 · Secured by RBI Guidelines
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 'clamp(24px, 4vw, 52px) clamp(16px, 3vw, 44px)', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{ width: '100%', maxWidth: 680, background: 'rgba(255,255,255,0.93)', backdropFilter: 'blur(30px)', borderRadius: 40, padding: 'clamp(28px, 4vw, 52px)', boxShadow: '0 40px 100px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.7)' }}
        >

          {/* ── Success orb sequence ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 36, textAlign: 'center' }}>
            <div style={{ position: 'relative', marginBottom: 24 }}>
              {/* Orb */}
              <motion.div
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 22 }}
                style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', boxShadow: '0 8px 40px rgba(10,88,245,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.3, type: 'spring', stiffness: 320 }}
                >
                  <Check style={{ width: 40, height: 40, color: 'white', strokeWidth: 3 }} />
                </motion.div>
              </motion.div>

              {/* Ripple 1 */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ delay: 0.7, duration: 1.4, ease: 'easeOut', repeat: Infinity, repeatDelay: 2.2 }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(10,88,245,0.4)', zIndex: 1 }}
              />
              {/* Ripple 2 */}
              <motion.div
                initial={{ scale: 1, opacity: 0.3 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ delay: 0.95, duration: 1.6, ease: 'easeOut', repeat: Infinity, repeatDelay: 2.2 }}
                style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(10,88,245,0.2)', zIndex: 1 }}
              />

              {/* Verification badge */}
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.1, duration: 0.4, type: 'spring', stiffness: 280, damping: 20 }}
                style={{ position: 'absolute', bottom: -8, right: -8, background: '#34d399', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid white', boxShadow: '0 4px 12px rgba(52,211,153,0.5)', zIndex: 3 }}
              >
                <CheckCircle style={{ width: 14, height: 14, color: 'white' }} />
              </motion.div>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 800, color: '#0A1628', lineHeight: 1.12, letterSpacing: '-0.03em', marginBottom: 10 }}
            >
              Your account is ready.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ fontSize: 15, color: 'rgba(0,0,0,0.44)', lineHeight: 1.6, maxWidth: 440 }}
            >
              You can now access AI-powered banking, investments and personalised financial guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              style={{ marginTop: 16, background: 'linear-gradient(135deg, rgba(10,40,138,0.06), rgba(10,88,245,0.06))', border: '1px solid rgba(10,88,245,0.12)', borderRadius: 20, padding: '8px 22px', fontSize: 14, color: '#0A2A8A', fontWeight: 600 }}
            >
              Welcome, {name}! 🎉
            </motion.div>
          </div>

          {/* ── HyperOne Debit Card ── */}
          <motion.div
            initial={{ opacity: 0, y: 20, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(140deg, #0A1F6E 0%, #0942CC 55%, #1A6BFF 100%)', boxShadow: '0 24px 64px rgba(10,40,110,0.4), 0 8px 24px rgba(0,0,0,0.2)', padding: '26px 28px 22px', position: 'relative', marginBottom: 28 }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 20%, rgba(255,255,255,0.2) 0%, transparent 60%)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 26 }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.44)', textTransform: 'uppercase', letterSpacing: '0.18em', fontWeight: 600, marginBottom: 4 }}>State Bank of India</p>
                <p style={{ fontSize: 16, color: 'white', fontWeight: 700, letterSpacing: '-0.01em' }}>HyperOne Digital Account</p>
              </div>
              <div style={{ width: 32, height: 24, borderRadius: 5, background: 'linear-gradient(135deg, #f0c040, #c8960c)', boxShadow: '0 2px 8px rgba(192,144,12,0.4)' }} />
            </div>

            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontWeight: 500 }}>Account Number</p>
            <p style={{ fontFamily: 'monospace', fontSize: '1.35rem', color: 'white', fontWeight: 700, letterSpacing: '0.1em', marginBottom: 26 }}>
              {data.accountNumber
                ? '*'.repeat(Math.max(0, data.accountNumber.length - 4)).replace(/(.{4})/g, '$1 ').trim() + ' ' + data.accountNumber.slice(-4)
                : '**** **** 1234'}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.34)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 3 }}>Customer</p>
                <p style={{ fontSize: 14, color: 'white', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {name.toUpperCase().split(' ').slice(0, 2).join(' ')}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.48)', fontStyle: 'italic', fontWeight: 700 }}>VISA</p>
                <div style={{ fontSize: 9, color: '#34d399', fontWeight: 700, background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.35)', padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  ● ACTIVE
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── MPIN ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.42 }}
            style={{ background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(5,150,105,0.05))', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 20, padding: '20px 22px', marginBottom: 24 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(52,211,153,0.14)', border: '1px solid rgba(52,211,153,0.24)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound style={{ width: 16, height: 16, color: '#059669' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#059669', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Save Your MPIN</p>
                <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.38)', marginTop: 1 }}>Shown only once — use it to sign in later</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.04)', borderRadius: 14, padding: '14px 18px' }}>
              <div>
                <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.34)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>6-digit MPIN</p>
                <p style={{ fontFamily: 'monospace', fontSize: 28, fontWeight: 800, letterSpacing: '0.2em', color: '#1a1a2e' }}>{data.mpin || '——'}</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                onClick={() => { navigator.clipboard.writeText(data.mpin || ''); toast.success('MPIN copied!'); }}
                style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#059669' }}
              >
                <Copy style={{ width: 15, height: 15 }} />
              </motion.button>
            </div>
            <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.34)', marginTop: 10 }}>
              Sign in with: <span style={{ fontFamily: 'monospace', color: 'rgba(0,0,0,0.54)', fontWeight: 600 }}>{data.customerId}</span> + this MPIN
            </p>
          </motion.div>

          {/* ── Account Details ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            style={{ marginBottom: 24 }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.34)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Account Details</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <CopyField label="Account Number" value={data.accountNumber || '—'} />
              <CopyField label="Customer ID" value={data.customerId || '—'} />
              <CopyField label="IFSC Code" value={data.ifscCode || '—'} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 2 }}>
                {[
                  { label: 'Account Type', value: 'Digital Savings', icon: '🏦' },
                  { label: 'KYC Status', value: 'Verified', icon: '✅' },
                  { label: 'Risk Profile', value: data.profile?.category === 'salaried' ? 'Moderate' : 'Conservative', icon: '📊' },
                  { label: 'Account Status', value: 'Active', icon: '🟢' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.54 + i * 0.06 }}
                    whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(10,88,245,0.08)' }}
                    style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 14, padding: '14px 16px', cursor: 'default' }}
                  >
                    <p style={{ fontSize: 17, marginBottom: 6 }}>{item.icon}</p>
                    <p style={{ fontSize: 10, color: 'rgba(0,0,0,0.34)', textTransform: 'uppercase', letterSpacing: '0.09em', fontWeight: 600, marginBottom: 3 }}>{item.label}</p>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{item.value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Products Activated ── */}
          {data.recommendedProducts?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.58 }}
              style={{ background: '#f8fafc', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 20, padding: '18px 20px', marginBottom: 24 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <Sparkles style={{ width: 14, height: 14, color: '#0A58F5' }} />
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.34)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Products Activated</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.recommendedProducts.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.62 + i * 0.06 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Check style={{ width: 10, height: 10, color: '#059669' }} />
                    </div>
                    <span style={{ fontSize: 13, color: 'rgba(0,0,0,0.62)', fontWeight: 500 }}>{p}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Next Steps ── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.64 }}
            style={{ marginBottom: 32 }}
          >
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,0,0,0.34)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>What's Next</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {NEXT_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.07 }}
                  whileHover={{ y: -3, boxShadow: `0 12px 32px ${step.color}1a` }}
                  onClick={() => navigate(step.to, { replace: true })}
                  style={{ background: 'white', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 18, padding: '18px 16px', cursor: 'pointer' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `${step.color}12`, border: `1px solid ${step.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: step.color, marginBottom: 12 }}>
                    {step.icon}
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', marginBottom: 4 }}>{step.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(0,0,0,0.4)', lineHeight: 1.4, marginBottom: 10 }}>{step.desc}</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <ArrowRight style={{ width: 14, height: 14, color: 'rgba(0,0,0,0.22)' }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── CTAs ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 12 }}
          >
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 16px 48px rgba(10,88,245,0.42)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/my-dashboard', { replace: true })}
              style={{ width: '100%', minHeight: 64, borderRadius: 100, background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', border: 'none', color: 'white', fontSize: 16, fontWeight: 700, letterSpacing: '-0.01em', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, boxShadow: '0 8px 32px rgba(10,88,245,0.35)', fontFamily: 'inherit' }}
            >
              <LayoutDashboard style={{ width: 20, height: 20 }} />
              Go To Dashboard
              <ArrowRight style={{ width: 18, height: 18, opacity: 0.75 }} />
            </motion.button>

            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Save Details', icon: <Download style={{ width: 15, height: 15 }} />, action: handleDownload },
                { label: 'Dashboard', icon: <Home style={{ width: 15, height: 15 }} />, action: () => navigate('/my-dashboard', { replace: true }) },
              ].map((btn, i) => (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.97 }}
                  onClick={btn.action}
                  style={{ flex: 1, height: 50, borderRadius: 100, background: 'transparent', border: '1.5px solid rgba(0,0,0,0.11)', color: 'rgba(0,0,0,0.52)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontFamily: 'inherit', transition: 'background 0.18s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.04)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  {btn.icon}
                  {btn.label}
                </motion.button>
              ))}
            </div>
          </motion.div>

          <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(0,0,0,0.24)', marginTop: 24 }}>
            Welcome aboard · Built for SBI HackFest 2026
          </p>
        </motion.div>
      </div>
    </div>
  );
}
