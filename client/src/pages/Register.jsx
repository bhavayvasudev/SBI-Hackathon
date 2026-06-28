import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Zap, Shield,
  TrendingUp, ChevronDown, Sparkles, Check,
} from 'lucide-react';
import useChatStore from '../store/chatStore.js';

/* ─── Static data (preserved) ──────────────────────────────── */
const OCCUPATIONS = [
  'Student', 'Salaried Employee', 'Business Owner',
  'Self-Employed / Freelancer', 'Government Employee',
  'Professional (Doctor / Lawyer / CA)', 'Retired',
];

const INCOME_RANGES = [
  'Below ₹25,000', '₹25K–₹50K', '₹50K–₹1 Lakh', 'Above ₹1 Lakh',
];

const GOAL_OPTIONS = [
  { id: 'wealth',     label: 'Wealth Creation',    icon: '📈' },
  { id: 'retirement', label: 'Retirement Planning', icon: '🌅' },
  { id: 'tax',        label: 'Tax Saving',          icon: '💡' },
  { id: 'education',  label: 'Education Planning',  icon: '🎓' },
  { id: 'home',       label: 'Home Purchase',       icon: '🏠' },
  { id: 'emergency',  label: 'Emergency Fund',      icon: '🛡️' },
];

const RISK_OPTIONS = [
  {
    value: 'Low', label: 'Conservative',
    desc: 'Preserve capital, steady returns',
    icon: '🛡️', accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)', border: '#10b981',
    glow: '0 0 0 3px rgba(16,185,129,0.18), 0 8px 24px rgba(16,185,129,0.14)',
    iconBg: 'rgba(16,185,129,0.12)',
  },
  {
    value: 'Medium', label: 'Balanced',
    desc: 'Mix of growth and stability',
    icon: '⚖️', accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)', border: '#f59e0b',
    glow: '0 0 0 3px rgba(245,158,11,0.18), 0 8px 24px rgba(245,158,11,0.14)',
    iconBg: 'rgba(245,158,11,0.12)',
  },
  {
    value: 'High', label: 'Aggressive',
    desc: 'Maximum growth potential',
    icon: '🚀', accent: '#1A56DB',
    bg: 'rgba(26,86,219,0.08)', border: '#1A56DB',
    glow: '0 0 0 3px rgba(26,86,219,0.18), 0 8px 24px rgba(26,86,219,0.14)',
    iconBg: 'rgba(26,86,219,0.1)',
  },
];

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

const STEPS_META = [
  { label: 'Personal',     sub: 'Basic info' },
  { label: 'Professional', sub: 'Work & location' },
  { label: 'Financial',    sub: 'Goals & income' },
];

const STEP_HINTS = [
  'Tell us about yourself.',
  'Help us personalise your banking experience.',
  'Define your financial goals.',
];

const LEFT_FEATURES = [
  'AI-powered financial insights',
  'Bank-grade 256-bit security',
  'Instant account onboarding',
  'Investment-ready from day one',
];

/* ─── CSS keyframes (compositor-thread only) ────────────────── */
const REGISTER_CSS = `
  @keyframes cf1 { 0%,100%{transform:translateY(0px) rotate(-6deg);}50%{transform:translateY(-13px) rotate(-6deg);} }
  @keyframes cf2 { 0%,100%{transform:translateY(0px) rotate(4deg);}50%{transform:translateY(-9px) rotate(4deg);} }
  @keyframes cf3 { 0%,100%{transform:translateY(0px);}50%{transform:translateY(-7px);} }
  @keyframes regPulse { 0%,100%{opacity:0.55;}50%{opacity:1;} }
  @keyframes bgGlow { 0%,100%{opacity:0.32;transform:scale(1);}50%{opacity:0.55;transform:scale(1.1);} }
  .card-f1 { animation: cf1 5s ease-in-out infinite; will-change: transform; }
  .card-f2 { animation: cf2 6.5s ease-in-out infinite 1.2s; will-change: transform; }
  .card-f3 { animation: cf3 4s ease-in-out infinite 2.3s; will-change: transform; }
  .reg-pulse { animation: regPulse 2.4s ease-in-out infinite; }
  .reg-bg-glow { animation: bgGlow 8s ease-in-out infinite; }
  .custom-dropdown-scroll::-webkit-scrollbar { width: 4px; }
  .custom-dropdown-scroll::-webkit-scrollbar-track { background: transparent; }
  .custom-dropdown-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 4px; }
`;

/* ─── Helpers ────────────────────────────────────────────────── */
function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 && age < 120 ? age : null;
}

/* ─── FloatInput ─────────────────────────────────────────────── */
function FloatInput({ label, value, onChange, type = 'text', prefix, maxLength, inputMode, error }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || !!value || type === 'date';

  return (
    <div>
      <div style={{
        position: 'relative',
        height: '64px',
        borderRadius: '14px',
        background: '#ffffff',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#1A56DB' : 'rgba(0,0,0,0.08)'}`,
        boxShadow: focused
          ? '0 0 0 4px rgba(26,86,219,0.08), 0 2px 8px rgba(0,0,0,0.04)'
          : error ? '0 0 0 3px rgba(239,68,68,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}>
        <label style={{
          position: 'absolute',
          top: '50%',
          left: prefix ? '56px' : '16px',
          transform: floated ? 'translateY(-130%) scale(0.74)' : 'translateY(-50%)',
          color: error ? '#ef4444' : focused ? '#1A56DB' : 'rgba(0,0,0,0.32)',
          fontSize: '15px',
          fontWeight: 500,
          pointerEvents: 'none',
          transition: 'transform 0.2s, color 0.2s',
          transformOrigin: 'left',
          whiteSpace: 'nowrap',
        }}>{label}</label>

        {prefix && (
          <span style={{
            position: 'absolute', left: '16px', top: '50%',
            transform: 'translateY(-50%)',
            color: 'rgba(0,0,0,0.45)', fontSize: '15px', fontWeight: 600,
          }}>{prefix}</span>
        )}

        <input
          type={type}
          value={value}
          inputMode={inputMode}
          maxLength={maxLength}
          onChange={e => {
            let v = e.target.value;
            if (inputMode === 'numeric') v = v.replace(/\D/g, '').slice(0, maxLength);
            onChange(v);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            outline: 'none',
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            paddingTop: '20px',
            paddingBottom: '4px',
            paddingLeft: prefix ? '56px' : '16px',
            paddingRight: '16px',
            color: '#0A0A0A',
            caretColor: '#1A56DB',
            boxSizing: 'border-box',
          }}
        />
      </div>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginLeft: '4px' }}
          >{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── CustomSelect (premium dropdown, replaces native select) ── */
function CustomSelect({ label, value, onChange, options, error }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const floated = open || !!value;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(o => !o)}
        onKeyDown={e => e.key === 'Enter' && setOpen(o => !o)}
        style={{
          position: 'relative',
          height: '64px',
          borderRadius: '14px',
          background: '#ffffff',
          border: `1.5px solid ${error ? '#ef4444' : open ? '#1A56DB' : 'rgba(0,0,0,0.08)'}`,
          boxShadow: open
            ? '0 0 0 4px rgba(26,86,219,0.08), 0 2px 8px rgba(0,0,0,0.04)'
            : error ? '0 0 0 3px rgba(239,68,68,0.08)' : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          cursor: 'pointer',
          userSelect: 'none',
          outline: 'none',
        }}
      >
        <label style={{
          position: 'absolute',
          top: '50%',
          left: '16px',
          transform: floated ? 'translateY(-130%) scale(0.74)' : 'translateY(-50%)',
          color: error ? '#ef4444' : open ? '#1A56DB' : 'rgba(0,0,0,0.32)',
          fontSize: '15px',
          fontWeight: 500,
          pointerEvents: 'none',
          transition: 'transform 0.2s, color 0.2s',
          transformOrigin: 'left',
          whiteSpace: 'nowrap',
        }}>{label}</label>

        {value && (
          <span style={{
            position: 'absolute',
            left: '16px',
            right: '44px',
            bottom: '12px',
            fontSize: '15px',
            fontWeight: 500,
            color: '#0A0A0A',
            pointerEvents: 'none',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{value}</span>
        )}

        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            position: 'absolute', right: '16px', top: '50%',
            marginTop: '-8px',
            display: 'flex', alignItems: 'center', pointerEvents: 'none',
          }}
        >
          <ChevronDown style={{ color: open ? '#1A56DB' : 'rgba(0,0,0,0.3)', width: 16, height: 16, transition: 'color 0.2s' }} />
        </motion.span>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="custom-dropdown-scroll"
            style={{
              position: 'absolute',
              top: 'calc(100% + 6px)',
              left: 0,
              right: 0,
              zIndex: 500,
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1.5px solid rgba(0,0,0,0.07)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.13), 0 4px 16px rgba(0,0,0,0.07)',
              overflow: 'hidden',
              maxHeight: '232px',
              overflowY: 'auto',
              padding: '6px',
            }}
          >
            {options.map((opt) => {
              const sel = value === opt;
              return (
                <motion.div
                  key={opt}
                  onClick={() => { onChange(opt); setOpen(false); }}
                  whileHover={{ background: sel ? 'rgba(26,86,219,0.08)' : 'rgba(0,0,0,0.04)' }}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: sel ? 600 : 400,
                    color: sel ? '#1A56DB' : '#374151',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: sel ? 'rgba(26,86,219,0.06)' : 'transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  {opt}
                  {sel && (
                    <Check style={{ color: '#1A56DB', width: 14, height: 14, flexShrink: 0 }} />
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', marginLeft: '4px' }}
          >{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Age gate dialog ────────────────────────────────────────── */
function AgeGateDialog({ onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'rgba(10,20,60,0.72)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', stiffness: 360, damping: 28 }}
        style={{
          width: '100%', maxWidth: '380px',
          borderRadius: '28px',
          background: '#ffffff',
          boxShadow: '0 48px 96px rgba(0,0,0,0.28), 0 12px 32px rgba(0,0,0,0.14)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '40px 32px', textAlign: 'center' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            margin: '0 auto 20px',
            background: 'rgba(239,68,68,0.07)',
            border: '1.5px solid rgba(239,68,68,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Shield style={{ color: '#ef4444', width: 28, height: 28 }} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0A0A0A', marginBottom: '12px' }}>
            Age Requirement
          </h3>
          <p style={{ fontSize: '14px', lineHeight: 1.65, color: '#6b7280', marginBottom: '28px' }}>
            HyperOne account creation is currently available only for individuals aged 18 years and above. Please return once you meet the eligibility criteria.
          </p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(26,86,219,0.36)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              width: '100%',
              height: '56px',
              borderRadius: '100px',
              background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '15px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(26,86,219,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            Return Home
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─── Progress bar with step hint ───────────────────────────── */
function ProgressBar({ current }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '10px',
      }}>
        <span style={{
          fontSize: '11px', fontWeight: 700, color: '#1A56DB',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Step {current + 1} of 3
        </span>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {STEPS_META.map((s, i) => (
            <span key={i} style={{
              fontSize: '11px', fontWeight: i === current ? 600 : 400,
              color: i === current ? '#1A56DB' : i < current ? '#10b981' : '#d1d5db',
              transition: 'color 0.3s',
            }}>
              {s.label}{i < 2 ? ' ·' : ''}
            </span>
          ))}
        </div>
      </div>

      <div style={{
        height: '3px', borderRadius: '100px',
        background: '#f1f5f9', overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${((current + 1) / 3) * 100}%` }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            height: '100%', borderRadius: '100px',
            background: 'linear-gradient(90deg, #1E3A8A, #1A56DB)',
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={current}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.22 }}
          style={{
            fontSize: '12px', color: '#b0b7c3',
            marginTop: '8px', fontWeight: 400,
          }}
        >
          {STEP_HINTS[current]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

/* ─── Floating card illustrations ────────────────────────────── */
function HeroIllustration() {
  return (
    <div style={{ position: 'relative', height: '260px', marginTop: 'auto', flexShrink: 0 }}>
      <div style={{
        position: 'absolute',
        width: '280px', height: '280px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 65%)',
        top: '-40px', left: '0px',
        filter: 'blur(40px)',
        pointerEvents: 'none',
      }} />

      {/* Main debit card */}
      <div className="card-f1" style={{
        position: 'absolute',
        width: '210px', height: '130px',
        borderRadius: '18px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.07) 100%)',
        border: '1px solid rgba(255,255,255,0.26)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.22)',
        top: '50px', left: '16px',
        padding: '18px 20px',
        boxSizing: 'border-box',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div style={{
            width: '30px', height: '22px', borderRadius: '4px',
            background: 'rgba(255,255,255,0.28)',
            border: '1px solid rgba(255,255,255,0.15)',
          }} />
          <Zap style={{ color: 'rgba(255,255,255,0.65)', width: 15, height: 15 }} />
        </div>
        <p style={{
          color: 'rgba(255,255,255,0.42)', fontSize: '10px',
          letterSpacing: '0.16em', marginBottom: '6px',
          fontFamily: 'monospace',
        }}>•••• •••• •••• 4821</p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: '12px', fontWeight: 600 }}>HyperOne</p>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}>VISA</p>
        </div>
      </div>

      {/* Portfolio widget */}
      <div className="card-f2" style={{
        position: 'absolute',
        width: '155px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.13)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        boxShadow: '0 16px 40px rgba(0,0,0,0.22)',
        top: '8px', right: '8px',
        padding: '14px 16px',
        boxSizing: 'border-box',
      }}>
        <p style={{ color: 'rgba(255,255,255,0.42)', fontSize: '10px', marginBottom: '4px' }}>Portfolio</p>
        <p style={{
          color: '#ffffff', fontSize: '16px', fontWeight: 700,
          letterSpacing: '-0.02em', marginBottom: '8px',
        }}>₹4,82,310</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', flexShrink: 0 }} />
          <p style={{ color: '#34d399', fontSize: '11px', fontWeight: 600 }}>+12.4% this month</p>
        </div>
      </div>

      {/* AI insights chip */}
      <div className="card-f3" style={{
        position: 'absolute',
        borderRadius: '100px',
        background: 'rgba(52,211,153,0.18)',
        border: '1px solid rgba(52,211,153,0.3)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        bottom: '12px', right: '24px',
        padding: '9px 14px',
        display: 'flex', alignItems: 'center', gap: '7px',
      }}>
        <Sparkles style={{ color: '#34d399', width: 13, height: 13 }} />
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '11px', fontWeight: 600 }}>AI Insights Active</p>
      </div>
    </div>
  );
}

/* ─── Left panel ─────────────────────────────────────────────── */
function LeftPanel() {
  return (
    <div
      className="hidden lg:flex"
      style={{
        width: '45%',
        minWidth: '380px',
        flexShrink: 0,
        background: 'linear-gradient(148deg, #1E3A8A 0%, #1A56DB 55%, #1d5fd8 100%)',
        padding: '52px 44px 44px',
        position: 'relative',
        overflow: 'hidden',
        flexDirection: 'column',
      }}
    >
      <div className="reg-bg-glow" style={{
        position: 'absolute',
        width: '500px', height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.11) 0%, transparent 62%)',
        top: '-180px', right: '-160px',
        filter: 'blur(50px)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute',
        width: '320px', height: '320px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.14) 0%, transparent 65%)',
        bottom: '-100px', left: '-70px',
        filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1 }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.18)',
          border: '1px solid rgba(255,255,255,0.26)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Zap style={{ color: '#ffffff', width: 20, height: 20 }} />
        </div>
        <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '18px', letterSpacing: '-0.02em' }}>HyperOne</span>
      </div>

      {/* AI badge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.22)',
          borderRadius: '100px',
          padding: '6px 14px',
          marginTop: '40px',
          alignSelf: 'flex-start',
          position: 'relative', zIndex: 1,
        }}
      >
        <div className="reg-pulse" style={{ width: 7, height: 7, borderRadius: '50%', background: '#34d399' }} />
        <span style={{
          color: 'rgba(255,255,255,0.88)', fontSize: '11px',
          fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>AI-Powered Banking</span>
      </motion.div>

      {/* Headline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{ marginTop: '28px', position: 'relative', zIndex: 1 }}
      >
        <h1 style={{
          color: '#ffffff',
          fontSize: 'clamp(48px, 4.2vw, 76px)',
          fontWeight: 800,
          lineHeight: 1.06,
          letterSpacing: '-0.04em',
          margin: 0,
        }}>
          Banking,<br />
          <span style={{ opacity: 0.86 }}>Reimagined.</span>
        </h1>
        <p style={{
          color: 'rgba(255,255,255,0.52)',
          fontSize: '15px',
          lineHeight: 1.65,
          marginTop: '16px',
          maxWidth: '290px',
        }}>
          Smart, secure and seamless banking built for the future of India.
        </p>
      </motion.div>

      {/* Trust features */}
      <div style={{
        marginTop: '32px',
        display: 'flex', flexDirection: 'column', gap: '12px',
        position: 'relative', zIndex: 1,
      }}>
        {LEFT_FEATURES.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.38 + i * 0.07, type: 'spring', stiffness: 280, damping: 24 }}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'rgba(52,211,153,0.18)',
              border: '1px solid rgba(52,211,153,0.34)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Check style={{ color: '#34d399', width: 11, height: 11, strokeWidth: 3 }} />
            </div>
            <span style={{ color: 'rgba(255,255,255,0.76)', fontSize: '13px', fontWeight: 500 }}>{f}</span>
          </motion.div>
        ))}
      </div>

      <HeroIllustration />

      <p style={{
        color: 'rgba(255,255,255,0.25)', fontSize: '11px',
        position: 'relative', zIndex: 1, marginTop: '16px',
      }}>
        RBI compliant · 256-bit SSL · Zero data sharing
      </p>
    </div>
  );
}

/* ─── Buttons ────────────────────────────────────────────────── */
function PrimaryBtn({ onClick, disabled, children }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02, boxShadow: '0 14px 40px rgba(26,86,219,0.40)' }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        minHeight: '60px',
        borderRadius: '100px',
        background: disabled ? '#e5e7eb' : 'linear-gradient(135deg, #1E3A8A, #1A56DB)',
        color: disabled ? '#9ca3af' : '#ffffff',
        fontWeight: 600,
        fontSize: '15px',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '0 8px 28px rgba(26,86,219,0.28)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        padding: '0 28px',
        whiteSpace: 'nowrap',
        transition: 'background 0.2s, box-shadow 0.2s',
      }}
    >
      {children}
    </motion.button>
  );
}

function BackBtn({ onClick }) {
  return (
    <motion.button
      whileHover={{ background: '#f1f5f9', scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        minHeight: '60px',
        borderRadius: '100px',
        background: '#f8fafc',
        border: '1.5px solid rgba(0,0,0,0.07)',
        color: '#374151',
        fontWeight: 500,
        fontSize: '14px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '0 24px',
        flexShrink: 0,
        whiteSpace: 'nowrap',
        transition: 'background 0.15s',
      }}
    >
      <ArrowLeft style={{ width: 16, height: 16 }} /> Back
    </motion.button>
  );
}

/* ─── Risk card ──────────────────────────────────────────────── */
function RiskCard({ r, selected, onSelect }) {
  const sel = selected === r.value;
  return (
    <motion.button
      onClick={() => onSelect(r.value)}
      whileHover={{ y: -4, scale: 1.04, transition: { type: 'spring', stiffness: 420, damping: 22 } }}
      whileTap={{ scale: 0.97 }}
      animate={{
        background: sel ? r.bg : '#fafafa',
        borderColor: sel ? r.border : 'rgba(0,0,0,0.07)',
        boxShadow: sel ? r.glow : '0 1px 4px rgba(0,0,0,0.05)',
      }}
      transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: '8px', padding: '16px 10px',
        borderRadius: '16px', border: '2px solid',
        cursor: 'pointer', textAlign: 'center',
        backgroundColor: 'transparent',
      }}
    >
      <motion.div
        animate={{ background: sel ? r.iconBg : 'rgba(0,0,0,0.04)' }}
        transition={{ duration: 0.2 }}
        style={{
          width: '38px', height: '38px', borderRadius: '11px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px', flexShrink: 0,
        }}
      >
        {r.icon}
      </motion.div>
      <span style={{
        fontSize: '12px', fontWeight: 700,
        color: sel ? r.accent : '#374151',
        transition: 'color 0.2s',
      }}>{r.label}</span>
      <span style={{ fontSize: '10px', color: '#9ca3af', lineHeight: 1.3 }}>{r.desc}</span>
    </motion.button>
  );
}

/* ─── Step 1: Personal ───────────────────────────────────────── */
function Step1({ data, onChange, onNext, onAgeGate }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = 'Name is required';
    if (!data.dateOfBirth) {
      e.dateOfBirth = 'Date of birth is required';
    } else {
      const age = calculateAge(data.dateOfBirth);
      if (age === null) e.dateOfBirth = 'Enter a valid date of birth';
      else if (age < 18) { e.dateOfBirth = 'You must be 18 or older to open an account'; onAgeGate(); }
    }
    if (!data.mobile.trim() || !/^\d{10}$/.test(data.mobile)) e.mobile = 'Enter a valid 10-digit mobile number';
    if (!data.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email = 'Enter a valid email address';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, color: '#0A0A0A',
          lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 8px',
        }}>
          Let's build your<br />financial identity.
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, marginTop: '8px' }}>
          Tell us about yourself so we can personalise your experience.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <FloatInput label="Full Name" value={data.fullName}
          onChange={v => onChange('fullName', v)} error={errors.fullName} />
        <FloatInput label="Date of Birth" value={data.dateOfBirth}
          onChange={v => onChange('dateOfBirth', v)} type="date" error={errors.dateOfBirth} />
        <FloatInput label="Mobile Number" value={data.mobile}
          onChange={v => onChange('mobile', v)} prefix="+91"
          inputMode="numeric" maxLength={10} error={errors.mobile} />
        <FloatInput label="Email Address" value={data.email}
          onChange={v => onChange('email', v)} type="email" error={errors.email} />
      </div>

      <div style={{ marginTop: '28px' }}>
        <PrimaryBtn onClick={handleNext}>
          Continue <ArrowRight style={{ width: 16, height: 16, flexShrink: 0 }} />
        </PrimaryBtn>
      </div>
    </motion.div>
  );
}

/* ─── Step 2: Professional ───────────────────────────────────── */
function Step2({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.occupation) e.occupation = 'Please select your occupation';
    if (!data.city.trim()) e.city = 'City is required';
    if (!data.state) e.state = 'Please select your state';
    if (!data.pinCode.trim() || !/^\d{6}$/.test(data.pinCode)) e.pinCode = 'Enter a valid 6-digit PIN code';
    if (!data.riskAppetite) e.riskAppetite = 'Please select your investment style';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <motion.div
      key="step2"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, color: '#0A0A0A',
          lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 8px',
        }}>
          Your professional<br />profile.
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, marginTop: '8px' }}>
          Help us personalise your banking experience.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <CustomSelect label="Occupation" value={data.occupation}
          onChange={v => onChange('occupation', v)} options={OCCUPATIONS} error={errors.occupation} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FloatInput label="City" value={data.city}
            onChange={v => onChange('city', v)} error={errors.city} />
          <FloatInput label="PIN Code" value={data.pinCode}
            onChange={v => onChange('pinCode', v)} inputMode="numeric" maxLength={6} error={errors.pinCode} />
        </div>

        <CustomSelect label="State" value={data.state}
          onChange={v => onChange('state', v)} options={STATES} error={errors.state} />

        {/* Risk cards */}
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'rgba(0,0,0,0.35)', marginBottom: '10px',
          }}>Investment Style</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' }}>
            {RISK_OPTIONS.map(r => (
              <RiskCard key={r.value} r={r} selected={data.riskAppetite} onSelect={v => onChange('riskAppetite', v)} />
            ))}
          </div>
          <AnimatePresence>
            {errors.riskAppetite && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginLeft: '4px' }}
              >{errors.riskAppetite}</motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <BackBtn onClick={onBack} />
        <PrimaryBtn onClick={handleNext}>
          Continue <ArrowRight style={{ width: 16, height: 16, flexShrink: 0 }} />
        </PrimaryBtn>
      </div>
    </motion.div>
  );
}

/* ─── Step 3: Financial ──────────────────────────────────────── */
function Step3({ data, onChange, onSubmit, onBack, loading }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.monthlyIncome) e.monthlyIncome = 'Please select your income range';
    if (data.investmentGoals.length === 0) e.investmentGoals = 'Select at least one goal';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onSubmit();
  };

  const toggleGoal = (id) => {
    const current = data.investmentGoals;
    onChange('investmentGoals', current.includes(id)
      ? current.filter(g => g !== id)
      : [...current, id]);
  };

  return (
    <motion.div
      key="step3"
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.32, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{
          fontSize: '28px', fontWeight: 700, color: '#0A0A0A',
          lineHeight: 1.2, letterSpacing: '-0.025em', margin: '0 0 8px',
        }}>
          Define your<br />financial goals.
        </h2>
        <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.6, marginTop: '8px' }}>
          We'll recommend products tailored to your goals.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Income */}
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'rgba(0,0,0,0.35)', marginBottom: '10px',
          }}>Monthly Income</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {INCOME_RANGES.map(range => {
              const sel = data.monthlyIncome === range;
              return (
                <motion.button
                  key={range}
                  onClick={() => onChange('monthlyIncome', range)}
                  whileHover={{ y: -2, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    background: sel ? 'rgba(26,86,219,0.07)' : '#fafafa',
                    borderColor: sel ? 'rgba(26,86,219,0.32)' : 'rgba(0,0,0,0.07)',
                    boxShadow: sel ? '0 0 0 3px rgba(26,86,219,0.12), 0 6px 20px rgba(26,86,219,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 26 }}
                  style={{
                    padding: '14px 16px', borderRadius: '14px',
                    border: '1.5px solid', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: '4px',
                    backgroundColor: 'transparent',
                  }}
                >
                  <TrendingUp style={{ color: sel ? '#1A56DB' : '#9ca3af', width: 15, height: 15, transition: 'color 0.2s' }} />
                  <p style={{ fontSize: '13px', fontWeight: 600, color: sel ? '#1A56DB' : '#374151', transition: 'color 0.2s' }}>{range}</p>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {errors.monthlyIncome && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginLeft: '4px' }}
              >{errors.monthlyIncome}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Goals */}
        <div>
          <p style={{
            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.07em', color: 'rgba(0,0,0,0.35)', marginBottom: '10px',
          }}>
            Investment Goals <span style={{ fontWeight: 400, textTransform: 'none', color: '#c4c4c9' }}>(select all that apply)</span>
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {GOAL_OPTIONS.map(g => {
              const sel = data.investmentGoals.includes(g.id);
              return (
                <motion.button
                  key={g.id}
                  onClick={() => toggleGoal(g.id)}
                  whileHover={{ y: -2, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
                  whileTap={{ scale: 0.97 }}
                  animate={{
                    background: sel ? 'rgba(26,86,219,0.07)' : '#fafafa',
                    borderColor: sel ? 'rgba(26,86,219,0.28)' : 'rgba(0,0,0,0.07)',
                    boxShadow: sel ? '0 0 0 3px rgba(26,86,219,0.1), 0 4px 16px rgba(26,86,219,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px', borderRadius: '14px',
                    border: '1.5px solid', cursor: 'pointer', textAlign: 'left',
                    backgroundColor: 'transparent',
                  }}
                >
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{g.icon}</span>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: sel ? '#1A56DB' : '#374151', transition: 'color 0.2s' }}>
                    {g.label}
                  </span>
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {errors.investmentGoals && (
              <motion.p
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18 }}
                style={{ color: '#ef4444', fontSize: '12px', marginTop: '8px', marginLeft: '4px' }}
              >{errors.investmentGoals}</motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* What's next */}
        <div style={{
          borderRadius: '14px', padding: '16px 18px',
          background: 'rgba(26,86,219,0.04)',
          border: '1.5px solid rgba(26,86,219,0.1)',
        }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1A56DB', marginBottom: '4px' }}>What happens next?</p>
          <p style={{ fontSize: '12px', lineHeight: 1.65, color: '#6b7280' }}>
            You'll upload your PAN card and Aadhaar for identity verification. Our AI will auto-fill your details. Account creation takes under 2 minutes.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        <BackBtn onClick={onBack} />
        <PrimaryBtn onClick={handleSubmit} disabled={loading}>
          {loading
            ? 'Saving…'
            : <><span>Proceed to KYC</span><ArrowRight style={{ width: 16, height: 16, flexShrink: 0 }} /></>
          }
        </PrimaryBtn>
      </div>
    </motion.div>
  );
}

/* ─── Main Register page ─────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { setProfile, startTimer } = useChatStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAgeGate, setShowAgeGate] = useState(false);

  const [personal, setPersonal] = useState({ fullName: '', dateOfBirth: '', mobile: '', email: '' });
  const [professional, setProfessional] = useState({ occupation: '', city: '', state: '', pinCode: '', riskAppetite: '' });
  const [financial, setFinancial] = useState({ monthlyIncome: '', investmentGoals: [] });

  const updatePersonal     = (key, val) => setPersonal(p => ({ ...p, [key]: val }));
  const updateProfessional = (key, val) => setProfessional(p => ({ ...p, [key]: val }));
  const updateFinancial    = (key, val) => setFinancial(p => ({ ...p, [key]: val }));

  const handleSubmit = () => {
    setLoading(true);
    const age = calculateAge(personal.dateOfBirth);
    const goalLabels = financial.investmentGoals
      .map(id => GOAL_OPTIONS.find(g => g.id === id)?.label)
      .filter(Boolean)
      .join(', ');

    const profile = {
      name: personal.fullName.trim(),
      age,
      email: personal.email.trim(),
      mobile: personal.mobile.trim(),
      dateOfBirth: personal.dateOfBirth,
      occupation: professional.occupation,
      city: professional.city.trim(),
      state: professional.state,
      pinCode: professional.pinCode,
      riskAppetite: professional.riskAppetite,
      income: financial.monthlyIncome,
      goals: goalLabels || 'Wealth Creation',
    };

    setProfile(profile);
    startTimer();

    setTimeout(() => {
      setLoading(false);
      navigate('/kyc', { replace: true });
    }, 400);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#EEF1F8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
        position: 'relative',
      }}
    >
      <style>{REGISTER_CSS}</style>

      {/* Ambient background radials */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute',
          width: '700px', height: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(26,86,219,0.07) 0%, transparent 60%)',
          top: '-250px', left: '-150px',
          filter: 'blur(60px)',
        }} />
        <div style={{
          position: 'absolute',
          width: '500px', height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 60%)',
          bottom: '-150px', right: '-100px',
          filter: 'blur(60px)',
        }} />
      </div>

      {/* Main floating container */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          width: '100%',
          maxWidth: '1360px',
          borderRadius: '36px',
          overflow: 'hidden',
          boxShadow: '0 40px 120px rgba(0,0,0,0.14), 0 8px 32px rgba(0,0,0,0.08)',
          display: 'flex',
          minHeight: '720px',
          background: '#ffffff',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <LeftPanel />

        {/* Right form panel */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          minHeight: '720px',
        }}>
          {/* Mobile top bar */}
          <header
            className="lg:hidden"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              borderBottom: '1px solid rgba(0,0,0,0.06)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '10px',
                background: 'linear-gradient(135deg, #1E3A8A, #1A56DB)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Zap style={{ color: '#ffffff', width: 15, height: 15 }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#0A0A0A', letterSpacing: '-0.02em' }}>HyperOne</span>
            </div>
            <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>Step {step + 1} of 3</span>
          </header>

          {/* Scrollable form area — responsive padding via Tailwind */}
          <div
            className="lg:p-14 p-6"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflowY: 'auto',
            }}
          >
            <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
              <ProgressBar current={step} />

              <AnimatePresence mode="wait">
                {step === 0 && (
                  <Step1
                    key="s1"
                    data={personal}
                    onChange={updatePersonal}
                    onNext={() => setStep(1)}
                    onAgeGate={() => setShowAgeGate(true)}
                  />
                )}
                {step === 1 && (
                  <Step2
                    key="s2"
                    data={professional}
                    onChange={updateProfessional}
                    onNext={() => setStep(2)}
                    onBack={() => setStep(0)}
                  />
                )}
                {step === 2 && (
                  <Step3
                    key="s3"
                    data={financial}
                    onChange={updateFinancial}
                    onSubmit={handleSubmit}
                    onBack={() => setStep(1)}
                    loading={loading}
                  />
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom trust line */}
          <div style={{
            padding: '16px 24px 24px',
            textAlign: 'center',
            borderTop: '1px solid rgba(0,0,0,0.04)',
          }}>
            <p style={{ fontSize: '11px', color: '#d1d5db' }}>
              Bank-grade security · 256-bit encryption · Built for SBI HackFest 2026
            </p>
          </div>
        </div>
      </motion.div>

      {/* Age gate overlay */}
      <AnimatePresence>
        {showAgeGate && (
          <AgeGateDialog
            onClose={() => { setShowAgeGate(false); navigate('/'); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
