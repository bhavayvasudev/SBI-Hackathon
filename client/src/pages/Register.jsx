import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Zap, CheckCircle, User, MapPin,
  TrendingUp, ChevronDown,
} from 'lucide-react';
import useChatStore from '../store/chatStore.js';

/* ─── Static data ──────────────────────────────────────── */
const OCCUPATIONS = [
  'Student',
  'Salaried Employee',
  'Business Owner',
  'Self-Employed / Freelancer',
  'Government Employee',
  'Professional (Doctor / Lawyer / CA)',
  'Retired',
];

const INCOME_RANGES = [
  'Below ₹25,000',
  '₹25K–₹50K',
  '₹50K–₹1 Lakh',
  'Above ₹1 Lakh',
];

const GOAL_OPTIONS = [
  { id: 'wealth',     label: 'Wealth Creation',    emoji: '📈' },
  { id: 'retirement', label: 'Retirement Planning', emoji: '🌅' },
  { id: 'tax',        label: 'Tax Saving',          emoji: '💡' },
  { id: 'education',  label: 'Education Planning',  emoji: '🎓' },
  { id: 'home',       label: 'Home Purchase',       emoji: '🏠' },
  { id: 'emergency',  label: 'Emergency Fund',      emoji: '🛡️' },
];

const RISK_OPTIONS = [
  {
    value: 'Low',
    label: 'Conservative',
    desc: 'Preserve capital, steady returns',
    emoji: '🛡️',
    accent: '#10b981',
    bg: 'rgba(16,185,129,0.08)',
    border: 'rgba(16,185,129,0.25)',
  },
  {
    value: 'Medium',
    label: 'Balanced',
    desc: 'Mix of growth and stability',
    emoji: '⚖️',
    accent: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    value: 'High',
    label: 'Aggressive',
    desc: 'Maximum growth potential',
    emoji: '🚀',
    accent: '#5046e4',
    bg: 'rgba(80,70,228,0.08)',
    border: 'rgba(80,70,228,0.25)',
  },
];

const STATES = [
  'Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa',
  'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka',
  'Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya',
  'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana',
  'Uttar Pradesh','Uttarakhand','West Bengal',
];

function calculateAge(dob) {
  if (!dob) return null;
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 && age < 120 ? age : null;
}

/* ─── Field + Select components ────────────────────────── */
function Field({ label, children, error }) {
  return (
    <div>
      <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#6b7280' }}>{label}</label>
      {children}
      {error && <p className="text-[11px] mt-1" style={{ color: '#dc2626' }}>{error}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = 'text', maxLength, pattern }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      maxLength={maxLength}
      pattern={pattern}
      className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all"
      style={{
        background: '#f9fafb',
        border: '1.5px solid rgba(0,0,0,0.09)',
        color: '#111827',
      }}
      onFocus={e => { e.target.style.border = '1.5px solid #5046e4'; e.target.style.boxShadow = '0 0 0 3px rgba(80,70,228,0.1)'; }}
      onBlur={e => { e.target.style.border = '1.5px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl text-[14px] outline-none transition-all appearance-none"
        style={{
          background: '#f9fafb',
          border: '1.5px solid rgba(0,0,0,0.09)',
          color: value ? '#111827' : '#9ca3af',
        }}
        onFocus={e => { e.target.style.border = '1.5px solid #5046e4'; e.target.style.boxShadow = '0 0 0 3px rgba(80,70,228,0.1)'; }}
        onBlur={e => { e.target.style.border = '1.5px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
      >
        <option value="" disabled>{placeholder}</option>
        {options.map(o => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#9ca3af' }} />
    </div>
  );
}

/* ─── Step indicators ───────────────────────────────────── */
const STEPS = [
  { label: 'Personal', icon: User },
  { label: 'Professional', icon: MapPin },
  { label: 'Financial', icon: TrendingUp },
];

function StepBar({ current }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        const Icon = step.icon;
        return (
          <div key={i} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                style={{
                  background: done ? '#5046e4' : active ? 'rgba(80,70,228,0.1)' : 'rgba(0,0,0,0.05)',
                  border: active ? '2px solid rgba(80,70,228,0.4)' : '2px solid transparent',
                }}
              >
                {done
                  ? <CheckCircle className="w-4 h-4 text-white" />
                  : <Icon className="w-3.5 h-3.5" style={{ color: active ? '#5046e4' : '#9ca3af' }} />
                }
              </div>
              <span
                className="text-[12px] font-medium hidden sm:block"
                style={{ color: done ? '#5046e4' : active ? '#5046e4' : '#9ca3af' }}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-px mx-1"
                style={{ background: done ? '#5046e4' : 'rgba(0,0,0,0.1)' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Step 1: Personal Info ─────────────────────────────── */
function Step1({ data, onChange, onNext }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.fullName.trim()) e.fullName = 'Name is required';
    if (!data.dateOfBirth) e.dateOfBirth = 'Date of birth is required';
    else if (calculateAge(data.dateOfBirth) === null) e.dateOfBirth = 'Enter a valid date of birth';
    else if (calculateAge(data.dateOfBirth) < 18) e.dateOfBirth = 'You must be 18 or older to open an account';
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
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: '#111827' }}>Personal Information</h2>
        <p className="text-[13px]" style={{ color: '#6b7280' }}>Tell us about yourself so we can set up your account.</p>
      </div>

      <Field label="Full Name" error={errors.fullName}>
        <Input value={data.fullName} onChange={v => onChange('fullName', v)} placeholder="e.g. Bhavay Vasudev" />
      </Field>

      <Field label="Date of Birth" error={errors.dateOfBirth}>
        <Input value={data.dateOfBirth} onChange={v => onChange('dateOfBirth', v)} type="date" />
      </Field>

      <Field label="Mobile Number" error={errors.mobile}>
        <div className="relative">
          <span
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-medium"
            style={{ color: '#6b7280' }}
          >+91</span>
          <input
            type="tel"
            value={data.mobile}
            onChange={e => onChange('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
            placeholder="98765 43210"
            maxLength={10}
            className="w-full pl-12 pr-4 py-3 rounded-xl text-[14px] outline-none transition-all"
            style={{ background: '#f9fafb', border: '1.5px solid rgba(0,0,0,0.09)', color: '#111827' }}
            onFocus={e => { e.target.style.border = '1.5px solid #5046e4'; e.target.style.boxShadow = '0 0 0 3px rgba(80,70,228,0.1)'; }}
            onBlur={e => { e.target.style.border = '1.5px solid rgba(0,0,0,0.09)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        {errors.mobile && <p className="text-[11px] mt-1" style={{ color: '#dc2626' }}>{errors.mobile}</p>}
      </Field>

      <Field label="Email Address" error={errors.email}>
        <Input value={data.email} onChange={v => onChange('email', v)} type="email" placeholder="you@email.com" />
      </Field>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleNext}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-white mt-2"
        style={{ background: '#1d1d1f', boxShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
      >
        Continue <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}

/* ─── Step 2: Professional ──────────────────────────────── */
function Step2({ data, onChange, onNext, onBack }) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!data.occupation) e.occupation = 'Please select your occupation';
    if (!data.city.trim()) e.city = 'City is required';
    if (!data.state) e.state = 'Please select your state';
    if (!data.pinCode.trim() || !/^\d{6}$/.test(data.pinCode)) e.pinCode = 'Enter a valid 6-digit PIN code';
    if (!data.riskAppetite) e.riskAppetite = 'Please select your risk appetite';
    return e;
  };

  const handleNext = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length === 0) onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: '#111827' }}>Professional Profile</h2>
        <p className="text-[13px]" style={{ color: '#6b7280' }}>Help us personalise your banking experience.</p>
      </div>

      <Field label="Occupation" error={errors.occupation}>
        <Select value={data.occupation} onChange={v => onChange('occupation', v)} options={OCCUPATIONS} placeholder="Select occupation" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="City" error={errors.city}>
          <Input value={data.city} onChange={v => onChange('city', v)} placeholder="e.g. Mumbai" />
        </Field>
        <Field label="PIN Code" error={errors.pinCode}>
          <Input
            value={data.pinCode}
            onChange={v => onChange('pinCode', v.replace(/\D/g, '').slice(0, 6))}
            placeholder="110001"
            maxLength={6}
          />
        </Field>
      </div>

      <Field label="State" error={errors.state}>
        <Select value={data.state} onChange={v => onChange('state', v)} options={STATES} placeholder="Select state" />
      </Field>

      {/* Risk Appetite */}
      <div>
        <label className="block text-[12px] font-medium mb-2" style={{ color: '#6b7280' }}>Risk Appetite</label>
        <div className="grid grid-cols-3 gap-3">
          {RISK_OPTIONS.map(r => (
            <button
              key={r.value}
              onClick={() => onChange('riskAppetite', r.value)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all text-center"
              style={{
                background: data.riskAppetite === r.value ? r.bg : 'rgba(0,0,0,0.03)',
                border: `1.5px solid ${data.riskAppetite === r.value ? r.border : 'rgba(0,0,0,0.08)'}`,
                boxShadow: data.riskAppetite === r.value ? `0 0 0 3px ${r.accent}18` : 'none',
              }}
            >
              <span className="text-[18px]">{r.emoji}</span>
              <span className="text-[12px] font-semibold" style={{ color: data.riskAppetite === r.value ? r.accent : '#374151' }}>
                {r.label}
              </span>
              <span className="text-[10px] leading-snug" style={{ color: '#9ca3af' }}>{r.desc}</span>
            </button>
          ))}
        </div>
        {errors.riskAppetite && <p className="text-[11px] mt-1.5" style={{ color: '#dc2626' }}>{errors.riskAppetite}</p>}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-medium text-[14px] transition-colors flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.05)', color: '#374151' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleNext}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white"
          style={{ background: '#1d1d1f' }}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Step 3: Financial ─────────────────────────────────── */
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
    if (current.includes(id)) {
      onChange('investmentGoals', current.filter(g => g !== id));
    } else {
      onChange('investmentGoals', [...current, id]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-[22px] font-bold tracking-tight mb-1" style={{ color: '#111827' }}>Financial Goals</h2>
        <p className="text-[13px]" style={{ color: '#6b7280' }}>We'll recommend products tailored to your goals.</p>
      </div>

      <Field label="Monthly Income" error={errors.monthlyIncome}>
        <Select
          value={data.monthlyIncome}
          onChange={v => onChange('monthlyIncome', v)}
          options={INCOME_RANGES}
          placeholder="Select income range"
        />
      </Field>

      <div>
        <label className="block text-[12px] font-medium mb-2" style={{ color: '#6b7280' }}>
          Investment Goals <span style={{ color: '#9ca3af' }}>(select all that apply)</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {GOAL_OPTIONS.map(g => {
            const selected = data.investmentGoals.includes(g.id);
            return (
              <button
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
                style={{
                  background: selected ? 'rgba(80,70,228,0.08)' : 'rgba(0,0,0,0.03)',
                  border: `1.5px solid ${selected ? 'rgba(80,70,228,0.3)' : 'rgba(0,0,0,0.08)'}`,
                }}
              >
                <span className="text-[18px]">{g.emoji}</span>
                <span className="text-[13px] font-medium" style={{ color: selected ? '#5046e4' : '#374151' }}>
                  {g.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.investmentGoals && (
          <p className="text-[11px] mt-1.5" style={{ color: '#dc2626' }}>{errors.investmentGoals}</p>
        )}
      </div>

      <div className="rounded-xl p-4" style={{ background: 'rgba(80,70,228,0.05)', border: '1px solid rgba(80,70,228,0.12)' }}>
        <p className="text-[12px] font-semibold mb-1" style={{ color: '#5046e4' }}>What happens next?</p>
        <p className="text-[12px] leading-relaxed" style={{ color: '#6b7280' }}>
          You'll upload your PAN card and Aadhaar for identity verification. Our AI will auto-fill your details from the documents. Account creation takes under 2 minutes.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-5 py-3 rounded-xl font-medium text-[14px] flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.05)', color: '#374151' }}
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <motion.button
          whileHover={{ scale: loading ? 1 : 1.02 }}
          whileTap={{ scale: loading ? 1 : 0.97 }}
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)', boxShadow: '0 4px 18px rgba(80,70,228,0.28)' }}
        >
          {loading ? 'Saving…' : 'Proceed to KYC Verification'}
          {!loading && <ArrowRight className="w-4 h-4" />}
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ─── Main Register Page ────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { setProfile, startTimer } = useChatStore();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [personal, setPersonal] = useState({
    fullName: '', dateOfBirth: '', mobile: '', email: '',
  });

  const [professional, setProfessional] = useState({
    occupation: '', city: '', state: '', pinCode: '', riskAppetite: '',
  });

  const [financial, setFinancial] = useState({
    monthlyIncome: '', investmentGoals: [],
  });

  const updatePersonal = (key, val) => setPersonal(p => ({ ...p, [key]: val }));
  const updateProfessional = (key, val) => setProfessional(p => ({ ...p, [key]: val }));
  const updateFinancial = (key, val) => setFinancial(p => ({ ...p, [key]: val }));

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
      navigate('/kyc');
    }, 400);
  };

  return (
    <div
      className="min-h-screen"
      style={{
        background: '#f5f5f7',
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif',
      }}
    >
      {/* Nav */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'rgba(255,255,255,0.88)',
          backdropFilter: 'blur(24px) saturate(200%)',
          WebkitBackdropFilter: 'blur(24px) saturate(200%)',
          borderBottom: '1px solid rgba(0,0,0,0.07)',
        }}
      >
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <div
              className="w-7 h-7 rounded-[8px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-[15px] tracking-tight" style={{ color: '#1d1d1f' }}>HyperOne</span>
          </button>
          <span className="text-[12px] font-medium" style={{ color: '#9ca3af' }}>
            Step {step + 1} of 3
          </span>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-lg mx-auto px-5 py-8">

        {/* Progress */}
        <StepBar current={step} />

        {/* Form card */}
        <div
          className="rounded-2xl p-6 md:p-8"
          style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <Step1
                key="step1"
                data={personal}
                onChange={updatePersonal}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <Step2
                key="step2"
                data={professional}
                onChange={updateProfessional}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <Step3
                key="step3"
                data={financial}
                onChange={updateFinancial}
                onSubmit={handleSubmit}
                onBack={() => setStep(1)}
                loading={loading}
              />
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-[11px] mt-5" style={{ color: '#b2b2b7' }}>
          Bank-grade security · 256-bit encryption · Built for SBI HackFest 2026
        </p>
      </div>
    </div>
  );
}
