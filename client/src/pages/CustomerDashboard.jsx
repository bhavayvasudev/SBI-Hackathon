import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Zap, LogOut, Bell, TrendingUp, TrendingDown, Wallet,
  CreditCard, Shield, Activity, ChevronRight, Eye, EyeOff,
  ArrowUpRight, ArrowDownLeft, RefreshCw, User, CheckCircle,
  XCircle, Clock, Building2, Landmark, Star, Copy, Sparkles,
  Target, Plus, Heart, X as XIcon, AlertCircle, Gift,
  FileText, Download as DownloadIcon, Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';
import { getMyProfile } from '../lib/api.js';
import CopilotPanel from '../components/CopilotPanel.jsx';

/* ─── Deterministic mock data generator ─────────────────── */
function hashNum(str, salt = 0) {
  let h = 5381 + salt;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
    h = h & h;
  }
  return Math.abs(h);
}

function seeded(str, salt, min, max) {
  const n = hashNum(str, salt);
  return min + (n % (max - min + 1));
}

function generateFinancialData(customerId, category) {
  const seed = customerId || 'DEMO';

  const baseValues = {
    student:  { invested: seeded(seed, 1, 45000, 85000),  balance: seeded(seed, 2, 8000, 25000),  credit: 0 },
    salaried: { invested: seeded(seed, 1, 180000, 650000), balance: seeded(seed, 2, 45000, 120000), credit: seeded(seed, 3, 100000, 300000) },
    business: { invested: seeded(seed, 1, 500000, 2000000), balance: seeded(seed, 2, 150000, 500000), credit: seeded(seed, 3, 500000, 2000000) },
  };

  const base = baseValues[category] || baseValues.salaried;
  const returnPct = (seeded(seed, 4, 800, 2400)) / 100; // 8–24%
  const currentValue = Math.round(base.invested * (1 + returnPct / 100));
  const todayChangePct = (seeded(seed, 5, 0, 200) - 100) / 100; // -1% to +1%
  const todayChange = Math.round(currentValue * todayChangePct / 100);

  // Generate 6 months of area chart data
  const now = new Date();
  const chartData = Array.from({ length: 24 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (23 - i) * 7); // weekly for ~6 months
    const jitter = seeded(seed, 100 + i, -5, 8) / 100;
    const val = Math.round(base.invested * (1 + (returnPct / 100) * (i / 23)) * (1 + jitter));
    return {
      date: `${d.toLocaleString('default', { month: 'short' })} ${d.getDate()}`,
      value: val,
    };
  });

  // Investments
  const sipAmount = category === 'student' ? 2000 : category === 'salaried' ? 8000 : 25000;
  const sipMonths = seeded(seed, 10, 6, 24);

  const investments = [
    {
      id: 'mf1',
      type: 'Mutual Fund',
      name: 'SBI Blue Chip Fund',
      subLabel: 'Large Cap · Growth',
      icon: '📈',
      invested: Math.round(base.invested * 0.32),
      currentValue: Math.round(base.invested * 0.32 * (1 + (seeded(seed, 20, 12, 28) / 100))),
      units: seeded(seed, 21, 800, 2000),
      nav: seeded(seed, 22, 85, 130),
    },
    {
      id: 'sip1',
      type: 'SIP',
      name: 'SBI Small Cap Fund',
      subLabel: `₹${sipAmount.toLocaleString()}/mo · Active`,
      icon: '🔄',
      invested: sipAmount * sipMonths,
      currentValue: Math.round(sipAmount * sipMonths * (1 + (seeded(seed, 30, 10, 22) / 100))),
      months: sipMonths,
      monthly: sipAmount,
    },
    {
      id: 'fd1',
      type: 'Fixed Deposit',
      name: 'SBI Term Deposit',
      subLabel: `${(seeded(seed, 40, 65, 75) / 10).toFixed(1)}% p.a. · ${seeded(seed, 41, 12, 36)} months`,
      icon: '🏦',
      invested: Math.round(base.invested * 0.28),
      currentValue: Math.round(base.invested * 0.28 * 1.0735),
      maturity: '2026-12-15',
      rate: seeded(seed, 40, 65, 75) / 10,
    },
    {
      id: 'ins1',
      type: 'Insurance',
      name: 'SBI Life Smart Wealth Builder',
      subLabel: 'Life + Investment · Active',
      icon: '🛡️',
      premium: seeded(seed, 50, 20000, 80000),
      coverage: seeded(seed, 51, 2000000, 10000000),
      invested: seeded(seed, 50, 20000, 80000),
      currentValue: seeded(seed, 50, 20000, 80000),
      nextDue: '2026-07-01',
    },
  ];

  if (category === 'salaried' || category === 'business') {
    investments.push({
      id: 'mf2',
      type: 'Mutual Fund',
      name: 'SBI Flexicap Fund',
      subLabel: 'Flexicap · IDCW',
      icon: '📊',
      invested: Math.round(base.invested * 0.15),
      currentValue: Math.round(base.invested * 0.15 * (1 + seeded(seed, 60, 8, 20) / 100)),
      units: seeded(seed, 61, 500, 1500),
      nav: seeded(seed, 62, 55, 95),
    });
  }

  const totalInvested = investments.reduce((s, i) => s + i.invested, 0);
  const totalCurrent = investments.reduce((s, i) => s + i.currentValue, 0);

  // Allocation for pie
  const typeMap = {};
  investments.forEach(inv => {
    typeMap[inv.type] = (typeMap[inv.type] || 0) + inv.currentValue;
  });
  const allocation = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

  // Transactions
  const txTypes = [
    { label: 'UPI Payment',   sign: -1, icon: ArrowUpRight,   color: '#dc2626' },
    { label: 'Salary Credit', sign: +1, icon: ArrowDownLeft,  color: '#16a34a' },
    { label: 'SIP Debit',     sign: -1, icon: RefreshCw,      color: '#d97706' },
    { label: 'ATM Withdrawal',sign: -1, icon: CreditCard,     color: '#dc2626' },
    { label: 'Interest Credit',sign: +1, icon: TrendingUp,    color: '#16a34a' },
    { label: 'Bill Payment',  sign: -1, icon: Wallet,         color: '#dc2626' },
    { label: 'NEFT Transfer', sign: -1, icon: ArrowUpRight,   color: '#dc2626' },
  ];

  const transactions = Array.from({ length: 8 }, (_, i) => {
    const tx = txTypes[seeded(seed, 200 + i, 0, txTypes.length - 1)];
    const d = new Date();
    d.setDate(d.getDate() - seeded(seed, 210 + i, 0, 14));
    const amount = seeded(seed, 220 + i, 500, 15000);
    return {
      id: `tx${i}`,
      label: tx.label,
      amount: amount * tx.sign,
      date: d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      color: tx.color,
      Icon: tx.icon,
    };
  });

  return {
    portfolio: {
      totalInvested,
      totalCurrent,
      todayChange,
      todayChangePct,
      returns: totalCurrent - totalInvested,
      returnsPct: ((totalCurrent - totalInvested) / totalInvested) * 100,
      chartData,
    },
    banking: {
      balance: base.balance,
      availableCredit: base.credit,
      activeLoans: category === 'business' ? seeded(seed, 70, 1, 3) : category === 'salaried' ? seeded(seed, 70, 0, 1) : 0,
      emiAmount: category === 'salaried' ? seeded(seed, 71, 5000, 25000) : category === 'business' ? seeded(seed, 71, 20000, 80000) : 0,
      insuranceActive: true,
    },
    investments,
    allocation,
    transactions,
  };
}

/* ─── Sub-components ─────────────────────────────────────── */
const PIE_COLORS = ['#5046e4', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

function formatINR(n) {
  if (Math.abs(n) >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
  if (Math.abs(n) >= 1e5) return `₹${(n / 1e5).toFixed(2)}L`;
  return `₹${Math.abs(n).toLocaleString('en-IN')}`;
}

/* ─── Notifications ──────────────────────────────────────── */
const MOCK_NOTIFICATIONS = [
  { id: 'n1', title: 'KYC Verified', body: 'Your PAN and Aadhaar have been successfully verified.', time: '2 hours ago', type: 'success', icon: CheckCircle, color: '#16a34a', bg: 'rgba(22,163,74,0.08)', read: false },
  { id: 'n2', title: 'SIP Reminder', body: 'Your monthly SIP debit of ₹8,000 is due in 3 days.', time: '1 day ago', type: 'reminder', icon: RefreshCw, color: '#d97706', bg: 'rgba(217,119,6,0.08)', read: false },
  { id: 'n3', title: 'Portfolio Alert', body: 'Your portfolio is up 2.4% today — your best week this quarter! 🎉', time: '1 day ago', type: 'alert', icon: TrendingUp, color: '#5046e4', bg: 'rgba(80,70,228,0.08)', read: true },
  { id: 'n4', title: 'Loan Pre-Approval', body: 'You are pre-approved for SBI Personal Loan up to ₹5 Lakh.', time: '3 days ago', type: 'offer', icon: Gift, color: '#ec4899', bg: 'rgba(236,72,153,0.08)', read: true },
  { id: 'n5', title: 'EMI Reminder', body: 'Home loan EMI of ₹15,200 is due on 5th of this month.', time: '5 days ago', type: 'reminder', icon: AlertCircle, color: '#dc2626', bg: 'rgba(220,38,38,0.08)', read: true },
];

/* ─── Health score ───────────────────────────────────────── */
function computeHealthScore(fin, banking, category) {
  const monthlyIncome = { student: 15000, salaried: 50000, business: 150000 }[category] || 50000;
  let score = 0;

  // Emergency fund: target 6× monthly income (25 pts)
  score += Math.round(Math.min(banking.balance / (monthlyIncome * 6), 1) * 25);

  // Investment rate: SIP ≥ 20% of income (30 pts)
  const sipRate = (fin.investments?.find(i => i.type === 'SIP')?.monthly || 0) / monthlyIncome;
  score += Math.round(Math.min(sipRate / 0.20, 1) * 30);

  // Insurance active (20 pts)
  if (banking.insuranceActive) score += 20;

  // Loan burden: EMI < 40% of income (25 pts)
  if (!banking.emiAmount) {
    score += 25;
  } else {
    score += Math.round(Math.max(0, 1 - (banking.emiAmount / monthlyIncome) / 0.40) * 25);
  }

  return Math.min(100, Math.max(0, score));
}

/* ─── Goal helpers ───────────────────────────────────────── */
const GOAL_TEMPLATES = [
  { id: 'home',       title: 'Buy a House',     emoji: '🏠', defaultTarget: 5000000, color: '#5046e4' },
  { id: 'retire',     title: 'Retirement Fund', emoji: '🌅', defaultTarget: 10000000, color: '#10b981' },
  { id: 'education',  title: 'Education Fund',  emoji: '🎓', defaultTarget: 2000000, color: '#f59e0b' },
  { id: 'emergency',  title: 'Emergency Fund',  emoji: '🛡️', defaultTarget: 500000, color: '#06b6d4' },
  { id: 'car',        title: 'Buy a Car',        emoji: '🚗', defaultTarget: 1500000, color: '#ec4899' },
  { id: 'travel',     title: 'Dream Vacation',   emoji: '✈️', defaultTarget: 300000, color: '#8b5cf6' },
];

function loadGoals(customerId) {
  try {
    const stored = localStorage.getItem(`hyperone_goals_${customerId}`);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  // Default seed goals
  return [
    { id: 'g1', templateId: 'emergency', title: 'Emergency Fund', emoji: '🛡️', target: 500000, current: 80000, color: '#06b6d4', deadline: '2026-12-31' },
    { id: 'g2', templateId: 'home',      title: 'Buy a House',    emoji: '🏠', target: 5000000, current: 350000, color: '#5046e4', deadline: '2029-06-30' },
  ];
}

function saveGoals(customerId, goals) {
  try { localStorage.setItem(`hyperone_goals_${customerId}`, JSON.stringify(goals)); } catch { /* ignore */ }
}

function Delta({ value, pct, size = 'sm' }) {
  const positive = value >= 0;
  const Icon = positive ? TrendingUp : TrendingDown;
  const color = positive ? '#16a34a' : '#dc2626';
  const bg = positive ? 'rgba(22,163,74,0.08)' : 'rgba(220,38,38,0.08)';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold ${size === 'lg' ? 'text-sm' : 'text-[11px]'}`}
      style={{ background: bg, color }}
    >
      <Icon className="w-3 h-3" />
      {positive ? '+' : '-'}{formatINR(Math.abs(value))}
      {pct !== undefined && ` (${positive ? '+' : ''}${pct.toFixed(2)}%)`}
    </span>
  );
}

function StatCard({ title, value, sub, icon: Icon, accent, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium" style={{ color: '#6b7280' }}>{title}</p>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: accent + '15' }}>
          <Icon className="w-4 h-4" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-[22px] font-bold tracking-tight" style={{ color: '#111827' }}>{value}</p>
        {sub && <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>{sub}</p>}
      </div>
    </motion.div>
  );
}

function InvestmentRow({ inv, index }) {
  const ret = inv.currentValue - inv.invested;
  const retPct = (ret / inv.invested) * 100;
  const typeColor = {
    'Mutual Fund':  '#5046e4',
    'SIP':          '#059669',
    'Fixed Deposit':'#d97706',
    'Insurance':    '#dc2626',
  }[inv.type] || '#6b7280';

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex items-center gap-4 py-3.5 px-1 rounded-xl transition-colors"
      style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div className="text-2xl w-10 text-center flex-shrink-0">{inv.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: '#111827' }}>{inv.name}</p>
        <p className="text-[11px] mt-0.5 truncate" style={{ color: '#9ca3af' }}>{inv.subLabel}</p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>{formatINR(inv.currentValue)}</p>
        <span
          className="text-[11px] font-medium"
          style={{ color: ret >= 0 ? '#16a34a' : '#dc2626' }}
        >
          {ret >= 0 ? '+' : ''}{retPct.toFixed(1)}%
        </span>
      </div>
      <div
        className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
        style={{ background: typeColor + '15', color: typeColor }}
      >
        {inv.type}
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 12, padding: '10px 14px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }}>
      <p style={{ color: '#6b7280', fontSize: 11, marginBottom: 4 }}>{payload[0]?.payload?.date}</p>
      <p style={{ color: '#111827', fontWeight: 700 }}>{formatINR(payload[0]?.value)}</p>
    </div>
  );
};

/* ─── Main Dashboard ─────────────────────────────────────── */
export default function CustomerDashboard() {
  const navigate = useNavigate();
  const { customer, clearAuth } = useAuthStore();
  const [profile, setProfile] = useState(customer);
  const [activeTab, setActiveTab] = useState('overview');
  const [hideBalance, setHideBalance] = useState(false);
  const [loading, setLoading] = useState(!customer);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [goals, setGoals] = useState([]);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (!customer) {
      getMyProfile()
        .then(res => { if (res.success) setProfile(res.data); })
        .catch(() => { clearAuth(); navigate('/'); })
        .finally(() => setLoading(false));
    }
  }, []);

  const data = useMemo(() => {
    if (!profile) return null;
    return generateFinancialData(profile.customerId, profile.profile?.category || 'salaried');
  }, [profile]);

  useEffect(() => {
    if (profile?.customerId) setGoals(loadGoals(profile.customerId));
  }, [profile?.customerId]);

  const handleSignOut = () => {
    clearAuth();
    sessionStorage.removeItem('hyperone_role');
    navigate('/');
  };

  const addGoal = (template) => {
    const newGoal = {
      id: 'g' + Date.now(),
      templateId: template.id,
      title: template.title,
      emoji: template.emoji,
      target: template.defaultTarget,
      current: 0,
      color: template.color,
      deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };
    const updated = [...goals, newGoal];
    setGoals(updated);
    saveGoals(profile.customerId, updated);
    setShowGoalDialog(false);
    toast.success('Goal added!');
  };

  const markAllRead = () => setNotifications(ns => ns.map(n => ({ ...n, read: true })));

  if (loading || !profile || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f6fa' }}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)', boxShadow: '0 0 32px rgba(80,70,228,0.3)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <p className="text-sm" style={{ color: '#9ca3af' }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const { portfolio, banking, investments, allocation, transactions } = data;
  const name = profile.profile?.name || 'Customer';
  const category = profile.profile?.category || 'salaried';
  const kycVerified = profile.kycDocuments?.panVerified && profile.kycDocuments?.aadhaarVerified;

  const tabs = [
    { id: 'overview',     label: 'Overview' },
    { id: 'investments',  label: 'Investments' },
    { id: 'transactions', label: 'Activity' },
    { id: 'goals',        label: 'Goals' },
    { id: 'profile',      label: 'Profile' },
    { id: 'copilot',      label: 'AI Copilot', highlight: true },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#f5f6fa', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", Inter, sans-serif' }}>

      {/* ── Sticky Header ── */}
      <header
        className="sticky top-0 z-40 px-6 py-0"
        style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}
      >
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between">
          {/* Logo + title */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-[10px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #5046e4, #7c3aed)', boxShadow: '0 4px 14px rgba(80,70,228,0.3)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-[13px] font-bold tracking-tight" style={{ color: '#111827' }}>HyperOne</p>
              <p className="text-[10px]" style={{ color: '#9ca3af' }}>My Banking</p>
            </div>
          </div>

          {/* Centre tabs — desktop */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(0,0,0,0.05)' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: activeTab === tab.id
                    ? tab.highlight ? 'linear-gradient(135deg, #3730a3, #4f46e5)' : '#fff'
                    : 'transparent',
                  color: activeTab === tab.id
                    ? tab.highlight ? '#fff' : '#111827'
                    : tab.highlight ? '#4f46e5' : '#6b7280',
                  boxShadow: activeTab === tab.id
                    ? tab.highlight ? '0 2px 10px rgba(79,70,229,0.3)' : '0 1px 4px rgba(0,0,0,0.1)'
                    : 'none',
                }}
              >
                {tab.highlight && <Sparkles className="w-3 h-3" />}
                {tab.label}
              </button>
            ))}
          </nav>

          {/* User + sign out */}
          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: notifOpen ? 'rgba(80,70,228,0.1)' : 'rgba(0,0,0,0.05)', color: '#6b7280' }}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                    style={{ background: '#dc2626' }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-50"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.09)', boxShadow: '0 16px 48px rgba(0,0,0,0.15)' }}
                  >
                    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>Notifications</p>
                      <button onClick={markAllRead} className="text-[11px] font-medium" style={{ color: '#5046e4' }}>Mark all read</button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => {
                        const NIcon = n.icon;
                        return (
                          <div
                            key={n.id}
                            className="flex items-start gap-3 px-4 py-3 transition-colors"
                            style={{ background: n.read ? 'transparent' : 'rgba(80,70,228,0.03)', borderBottom: '1px solid rgba(0,0,0,0.04)' }}
                          >
                            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: n.bg }}>
                              <NIcon className="w-3.5 h-3.5" style={{ color: n.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-[12px] font-semibold" style={{ color: '#111827' }}>{n.title}</p>
                                {!n.read && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#6b7280' }}>{n.body}</p>
                              <p className="text-[10px] mt-1" style={{ color: '#9ca3af' }}>{n.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="hidden sm:flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold"
                style={{ background: 'rgba(80,70,228,0.12)', color: '#5046e4' }}
              >
                {name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right hidden lg:block">
                <p className="text-[12px] font-semibold" style={{ color: '#111827' }}>{name}</p>
                <p className="text-[10px]" style={{ color: '#9ca3af' }}>{profile.customerId}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-xl transition-colors"
              style={{ color: '#dc2626', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.12)' }}
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </motion.button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex gap-1 pb-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all flex items-center gap-1"
              style={{
                background: activeTab === tab.id
                  ? tab.highlight ? 'linear-gradient(135deg, #3730a3, #4f46e5)' : '#5046e4'
                  : 'transparent',
                color: activeTab === tab.id ? '#fff' : tab.highlight ? '#4f46e5' : '#6b7280',
              }}
            >
              {tab.highlight && <Sparkles className="w-3 h-3" />}
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6">

        {/* ── Greeting strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: '#111827' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {name.split(' ')[0]}
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: '#9ca3af' }}>
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {kycVerified ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}>
              <CheckCircle className="w-3.5 h-3.5" />
              KYC Verified
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Clock className="w-3.5 h-3.5" />
              KYC Pending
            </div>
          )}
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ══════════ OVERVIEW TAB ══════════ */}
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Portfolio hero card */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl p-6 md:p-8 text-white relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #5046e4 100%)',
                  boxShadow: '0 8px 40px rgba(80,70,228,0.35), 0 2px 8px rgba(0,0,0,0.1)',
                }}
              >
                {/* Decorative rings */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)' }} />
                  <div style={{ position: 'absolute', top: -30, right: -30, width: 140, height: 140, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.06)' }} />
                  <div style={{ position: 'absolute', bottom: -50, left: '40%', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                </div>

                <div className="relative grid md:grid-cols-2 gap-6 md:gap-8">
                  {/* Left: portfolio total */}
                  <div>
                    <p className="text-[12px] text-white/60 uppercase tracking-[0.18em] font-medium mb-2">Total Portfolio Value</p>
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-4xl md:text-5xl font-bold tracking-tight">
                        {hideBalance ? '₹ ••••••' : formatINR(portfolio.totalCurrent)}
                      </p>
                      <button onClick={() => setHideBalance(b => !b)} className="text-white/40 hover:text-white/80 transition-colors mt-1">
                        {hideBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    <Delta value={portfolio.todayChange} pct={portfolio.todayChangePct} size="lg" />
                    <p className="text-[12px] text-white/45 mt-1">Today's change</p>
                  </div>

                  {/* Right: breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Invested', value: formatINR(portfolio.totalInvested), sub: 'Total cost' },
                      { label: 'Total Returns', value: formatINR(portfolio.returns), sub: `${portfolio.returnsPct.toFixed(1)}%`, green: portfolio.returns >= 0 },
                      { label: 'Account Balance', value: formatINR(banking.balance), sub: `A/C ${profile.accountNumber?.slice(-4) ? '•••• ' + profile.accountNumber.slice(-4) : ''}` },
                      ...(banking.availableCredit > 0 ? [{ label: 'Credit Limit', value: formatINR(banking.availableCredit), sub: 'Available' }] : []),
                    ].map((item, i) => (
                      <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p className="text-[10px] text-white/50 uppercase tracking-wide mb-1">{item.label}</p>
                        <p className="text-base font-bold" style={{ color: item.green === false ? '#fca5a5' : '#fff' }}>
                          {hideBalance ? '••••' : item.value}
                        </p>
                        <p className="text-[10px] text-white/40 mt-0.5">{item.sub}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Account Balance" value={hideBalance ? '₹ ••••' : formatINR(banking.balance)} sub={`A/C ${profile.accountNumber?.slice(-4) ? '•••' + profile.accountNumber.slice(-4) : ''}`} icon={Landmark} accent="#5046e4" index={0} />
                <StatCard title="Total Invested" value={formatINR(portfolio.totalInvested)} sub="Across all assets" icon={TrendingUp} accent="#10b981" index={1} />
                <StatCard title="Overall Returns" value={formatINR(portfolio.returns)} sub={`${portfolio.returnsPct >= 0 ? '+' : ''}${portfolio.returnsPct.toFixed(2)}% XIRR`} icon={Star} accent={portfolio.returns >= 0 ? '#16a34a' : '#dc2626'} index={2} />
                {banking.availableCredit > 0
                  ? <StatCard title="Credit Available" value={formatINR(banking.availableCredit)} sub="Credit line" icon={CreditCard} accent="#d97706" index={3} />
                  : <StatCard title="KYC Status" value={kycVerified ? 'Verified' : 'Pending'} sub={kycVerified ? 'PAN + Aadhaar' : 'Complete KYC'} icon={kycVerified ? CheckCircle : Clock} accent={kycVerified ? '#16a34a' : '#d97706'} index={3} />
                }
              </div>

              {/* Financial Health Score */}
              {(() => {
                const score = computeHealthScore({ investments }, banking, category);
                const scoreColor = score >= 75 ? '#16a34a' : score >= 50 ? '#d97706' : '#dc2626';
                const scoreLabel = score >= 75 ? 'Excellent' : score >= 50 ? 'Good' : 'Needs Attention';
                const scoreFactors = [
                  { label: 'Emergency Fund', done: banking.balance >= 200000, tip: 'Maintain 6× monthly expenses as buffer' },
                  { label: 'Active Investments', done: portfolio.totalInvested > 0, tip: 'Invest regularly via SIP for long-term growth' },
                  { label: 'Insurance Coverage', done: banking.insuranceActive, tip: 'Life + health insurance recommended' },
                  { label: 'Managed Debt', done: !banking.emiAmount || banking.emiAmount < 25000, tip: 'Keep EMIs below 40% of monthly income' },
                ];
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 }}
                    className="rounded-2xl p-6"
                    style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-[14px] font-semibold" style={{ color: '#111827' }}>Financial Health Score</h3>
                        <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>Based on savings, investments, insurance & debt</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[36px] font-bold leading-none" style={{ color: scoreColor }}>{score}</p>
                        <p className="text-[12px] font-semibold mt-0.5" style={{ color: scoreColor }}>{scoreLabel}</p>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="h-2.5 rounded-full overflow-hidden mb-5" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${scoreColor}, ${scoreColor}99)` }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${score}%` }}
                        transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                      />
                    </div>
                    {/* Factors */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {scoreFactors.map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl" style={{ background: f.done ? 'rgba(22,163,74,0.05)' : 'rgba(245,158,11,0.05)', border: `1px solid ${f.done ? 'rgba(22,163,74,0.15)' : 'rgba(245,158,11,0.15)'}` }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: f.done ? 'rgba(22,163,74,0.15)' : 'rgba(245,158,11,0.15)' }}>
                            {f.done
                              ? <CheckCircle className="w-3 h-3" style={{ color: '#16a34a' }} />
                              : <AlertCircle className="w-3 h-3" style={{ color: '#d97706' }} />
                            }
                          </div>
                          <div>
                            <p className="text-[12px] font-semibold" style={{ color: '#374151' }}>{f.label}</p>
                            {!f.done && <p className="text-[11px] mt-0.5 leading-snug" style={{ color: '#9ca3af' }}>{f.tip}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })()}

              {/* Chart + Allocation */}
              <div className="grid lg:grid-cols-3 gap-5">
                {/* Portfolio area chart */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="lg:col-span-2 rounded-2xl p-6"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="text-[14px] font-semibold" style={{ color: '#111827' }}>Portfolio Performance</h3>
                      <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>Last 6 months</p>
                    </div>
                    <Delta value={portfolio.returns} pct={portfolio.returnsPct} />
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={portfolio.chartData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="portGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#5046e4" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#5046e4" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} interval={5} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${Math.round(v / 1000)}K`} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(80,70,228,0.2)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="value" stroke="#5046e4" strokeWidth={2.5} fill="url(#portGrad)" dot={false} activeDot={{ r: 5, fill: '#5046e4', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                {/* Allocation pie */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-2xl p-6"
                  style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                >
                  <h3 className="text-[14px] font-semibold mb-1" style={{ color: '#111827' }}>Allocation</h3>
                  <p className="text-[12px] mb-4" style={{ color: '#9ca3af' }}>By asset class</p>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={allocation} cx="50%" cy="50%" innerRadius={44} outerRadius={64} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {allocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} opacity={0.9} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val, name) => [formatINR(val), name]}
                        contentStyle={{ background: '#fff', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 10, fontSize: 12 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-2">
                    {allocation.map((a, i) => (
                      <div key={a.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-[12px]" style={{ color: '#6b7280' }}>{a.name}</span>
                        </div>
                        <span className="text-[12px] font-semibold" style={{ color: '#111827' }}>{formatINR(a.value)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Recent investments preview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-2xl p-6"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold" style={{ color: '#111827' }}>Your Investments</h3>
                  <button onClick={() => setActiveTab('investments')} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: '#5046e4' }}>
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  {investments.slice(0, 3).map((inv, i) => (
                    <InvestmentRow key={inv.id} inv={inv} index={i} />
                  ))}
                </div>
              </motion.div>

              {/* Recent activity preview */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl p-6"
                style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[14px] font-semibold" style={{ color: '#111827' }}>Recent Activity</h3>
                  <button onClick={() => setActiveTab('transactions')} className="flex items-center gap-1 text-[12px] font-medium" style={{ color: '#5046e4' }}>
                    View all <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {transactions.slice(0, 5).map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-3 py-2.5 px-2 rounded-xl transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: tx.amount >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.08)' }}>
                        <tx.Icon className="w-4 h-4" style={{ color: tx.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-medium truncate" style={{ color: '#111827' }}>{tx.label}</p>
                        <p className="text-[11px]" style={{ color: '#9ca3af' }}>{tx.date}</p>
                      </div>
                      <p className="text-[13px] font-semibold flex-shrink-0" style={{ color: tx.amount >= 0 ? '#16a34a' : '#111827' }}>
                        {tx.amount >= 0 ? '+' : '-'}{formatINR(Math.abs(tx.amount))}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* ══════════ INVESTMENTS TAB ══════════ */}
          {activeTab === 'investments' && (
            <motion.div
              key="investments"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Summary bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Invested" value={formatINR(portfolio.totalInvested)} sub="Your cost" icon={Wallet} accent="#5046e4" index={0} />
                <StatCard title="Current Value" value={formatINR(portfolio.totalCurrent)} sub="Market value" icon={TrendingUp} accent="#10b981" index={1} />
                <StatCard title="P&L" value={`${portfolio.returns >= 0 ? '+' : ''}${formatINR(portfolio.returns)}`} sub={`${portfolio.returnsPct.toFixed(2)}% returns`} icon={portfolio.returns >= 0 ? TrendingUp : TrendingDown} accent={portfolio.returns >= 0 ? '#16a34a' : '#dc2626'} index={2} />
                <StatCard title="Active SIPs" value={`${investments.filter(i => i.type === 'SIP').length}`} sub="Monthly auto-invest" icon={RefreshCw} accent="#d97706" index={3} />
              </div>

              {/* All investments */}
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[14px] font-semibold mb-5" style={{ color: '#111827' }}>All Holdings</h3>
                <div>
                  {investments.map((inv, i) => (
                    <InvestmentRow key={inv.id} inv={inv} index={i} />
                  ))}
                </div>
              </div>

              {/* Allocation chart */}
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[14px] font-semibold mb-1" style={{ color: '#111827' }}>Portfolio Allocation</h3>
                <p className="text-[12px] mb-5" style={{ color: '#9ca3af' }}>Distribution across asset classes</p>
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={allocation} cx="50%" cy="50%" innerRadius={56} outerRadius={82} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {allocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val, name) => [formatINR(val), name]} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {allocation.map((a, i) => {
                      const pct = ((a.value / portfolio.totalCurrent) * 100).toFixed(1);
                      return (
                        <div key={a.name}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                              <span className="text-[13px] font-medium" style={{ color: '#374151' }}>{a.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[12px]" style={{ color: '#9ca3af' }}>{formatINR(a.value)}</span>
                              <span className="text-[12px] font-semibold" style={{ color: '#111827' }}>{pct}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                            <motion.div
                              className="h-full rounded-full"
                              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                              initial={{ width: '0%' }}
                              animate={{ width: `${pct}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ TRANSACTIONS TAB ══════════ */}
          {activeTab === 'transactions' && (
            <motion.div
              key="transactions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[14px] font-semibold mb-5" style={{ color: '#111827' }}>Recent Transactions</h3>
                <div className="space-y-1">
                  {transactions.map((tx, i) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center gap-4 py-3.5 px-3 rounded-xl transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.02)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: tx.amount >= 0 ? 'rgba(22,163,74,0.1)' : 'rgba(220,38,38,0.07)', border: `1px solid ${tx.amount >= 0 ? 'rgba(22,163,74,0.2)' : 'rgba(220,38,38,0.12)'}` }}
                      >
                        <tx.Icon className="w-4 h-4" style={{ color: tx.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: '#111827' }}>{tx.label}</p>
                        <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>{tx.date} · {profile.accountNumber?.slice(-4) ? 'A/C •••• ' + profile.accountNumber.slice(-4) : 'HyperOne'}</p>
                      </div>
                      <p className="text-[15px] font-semibold flex-shrink-0" style={{ color: tx.amount >= 0 ? '#16a34a' : '#111827' }}>
                        {tx.amount >= 0 ? '+' : '-'}{formatINR(Math.abs(tx.amount))}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Banking summary */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#111827' }}>Banking Summary</h3>
                  {[
                    { label: 'Account Balance', value: formatINR(banking.balance), color: '#111827' },
                    ...(banking.availableCredit > 0 ? [{ label: 'Credit Available', value: formatINR(banking.availableCredit), color: '#16a34a' }] : []),
                    ...(banking.activeLoans > 0 ? [{ label: 'Active Loans', value: `${banking.activeLoans} loan${banking.activeLoans > 1 ? 's' : ''}`, color: '#d97706' }] : []),
                    ...(banking.emiAmount > 0 ? [{ label: 'Monthly EMI', value: formatINR(banking.emiAmount), color: '#dc2626' }] : []),
                    { label: 'Insurance', value: 'Active', color: '#16a34a' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <p className="text-[13px]" style={{ color: '#6b7280' }}>{item.label}</p>
                      <p className="text-[13px] font-semibold" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#111827' }}>Account Info</h3>
                  {[
                    { label: 'Account Number', value: profile.accountNumber },
                    { label: 'Customer ID', value: profile.customerId },
                    { label: 'IFSC Code', value: profile.ifscCode || 'SBIN0001234' },
                    { label: 'Branch', value: profile.branchName || 'HyperOne Digital Branch' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <p className="text-[12px]" style={{ color: '#6b7280' }}>{item.label}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-mono font-medium" style={{ color: '#111827' }}>{item.value}</p>
                        <button onClick={() => { navigator.clipboard.writeText(item.value || ''); toast.success(`${item.label} copied!`); }} className="text-gray-300 hover:text-gray-500 transition-colors">
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ GOALS TAB ══════════ */}
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Header row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold" style={{ color: '#111827' }}>Goals & Planning</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>Track your financial milestones</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowGoalDialog(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-[13px] text-white"
                  style={{ background: '#1d1d1f' }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Goal
                </motion.button>
              </div>

              {/* Goal cards */}
              {goals.length === 0 ? (
                <div className="rounded-2xl p-12 text-center" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <Target className="w-10 h-10 mx-auto mb-3" style={{ color: '#d1d5db' }} />
                  <p className="text-[14px] font-medium" style={{ color: '#6b7280' }}>No goals yet</p>
                  <p className="text-[12px] mt-1" style={{ color: '#9ca3af' }}>Add your first financial goal to start tracking progress.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {goals.map((goal, i) => {
                    const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                    const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
                    return (
                      <motion.div
                        key={goal.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="rounded-2xl p-5"
                        style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[22px]" style={{ background: goal.color + '15' }}>
                              {goal.emoji}
                            </div>
                            <div>
                              <p className="text-[14px] font-semibold" style={{ color: '#111827' }}>{goal.title}</p>
                              <p className="text-[11px] mt-0.5" style={{ color: '#9ca3af' }}>
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[13px] font-bold" style={{ color: goal.color }}>{pct}%</span>
                        </div>
                        {/* Progress bar */}
                        <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: 'rgba(0,0,0,0.06)' }}>
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: goal.color }}
                            initial={{ width: '0%' }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.9, delay: i * 0.1 + 0.2, ease: 'easeOut' }}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-[12px]" style={{ color: '#6b7280' }}>
                            {formatINR(goal.current)} saved
                          </p>
                          <p className="text-[12px] font-semibold" style={{ color: '#111827' }}>
                            Target: {formatINR(goal.target)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Add Goal Dialog */}
              <AnimatePresence>
                {showGoalDialog && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center px-4"
                    style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setShowGoalDialog(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.94, y: 16 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.94, y: 16 }}
                      onClick={e => e.stopPropagation()}
                      className="w-full max-w-sm rounded-2xl p-6"
                      style={{ background: '#fff', boxShadow: '0 24px 64px rgba(0,0,0,0.2)' }}
                    >
                      <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[16px] font-bold" style={{ color: '#111827' }}>Choose a Goal</h3>
                        <button onClick={() => setShowGoalDialog(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                          <XIcon className="w-4 h-4" style={{ color: '#6b7280' }} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {GOAL_TEMPLATES.filter(t => !goals.some(g => g.templateId === t.id)).map(template => (
                          <button
                            key={template.id}
                            onClick={() => addGoal(template)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                            style={{ border: '1px solid rgba(0,0,0,0.07)' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.03)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[20px]" style={{ background: template.color + '15' }}>
                              {template.emoji}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>{template.title}</p>
                              <p className="text-[11px]" style={{ color: '#9ca3af' }}>Target: {formatINR(template.defaultTarget)}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 ml-auto flex-shrink-0" style={{ color: '#d1d5db' }} />
                          </button>
                        ))}
                        {GOAL_TEMPLATES.every(t => goals.some(g => g.templateId === t.id)) && (
                          <p className="text-center text-[13px] py-4" style={{ color: '#9ca3af' }}>All goal templates added!</p>
                        )}
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* ══════════ PROFILE TAB ══════════ */}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="grid md:grid-cols-2 gap-5">

                {/* Personal info */}
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold" style={{ background: 'rgba(80,70,228,0.1)', color: '#5046e4' }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-[16px] font-bold" style={{ color: '#111827' }}>{name}</p>
                      <p className="text-[12px] capitalize mt-0.5" style={{ color: '#9ca3af' }}>{category} customer</p>
                    </div>
                  </div>
                  {[
                    { label: 'Customer ID', value: profile.customerId },
                    { label: 'Account Number', value: profile.accountNumber },
                    { label: 'Occupation', value: profile.profile?.occupation || '—' },
                    { label: 'Income', value: profile.profile?.income || '—' },
                    { label: 'Goals', value: profile.profile?.goals || '—' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start justify-between py-2.5" style={{ borderTop: i === 0 ? '1px solid rgba(0,0,0,0.06)' : undefined, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                      <p className="text-[12px]" style={{ color: '#6b7280' }}>{item.label}</p>
                      <p className="text-[12px] font-medium text-right max-w-[55%]" style={{ color: '#111827' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* KYC status */}
                <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#111827' }}>KYC Documents</h3>

                  <div className="space-y-3">
                    {/* PAN */}
                    <div className="rounded-xl p-4" style={{ background: profile.kycDocuments?.panVerified ? 'rgba(22,163,74,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${profile.kycDocuments?.panVerified ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>PAN Card</p>
                        {profile.kycDocuments?.panVerified
                          ? <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#16a34a' }}><CheckCircle className="w-3.5 h-3.5" /> Verified</div>
                          : <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#d97706' }}><Clock className="w-3.5 h-3.5" /> Pending</div>
                        }
                      </div>
                      <p className="text-[12px] font-mono" style={{ color: '#6b7280' }}>{profile.kycDocuments?.panNumber || 'Not uploaded'}</p>
                    </div>

                    {/* Aadhaar */}
                    <div className="rounded-xl p-4" style={{ background: profile.kycDocuments?.aadhaarVerified ? 'rgba(22,163,74,0.06)' : 'rgba(245,158,11,0.06)', border: `1px solid ${profile.kycDocuments?.aadhaarVerified ? 'rgba(22,163,74,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>Aadhaar Card</p>
                        {profile.kycDocuments?.aadhaarVerified
                          ? <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#16a34a' }}><CheckCircle className="w-3.5 h-3.5" /> Verified</div>
                          : <div className="flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: '#d97706' }}><Clock className="w-3.5 h-3.5" /> Pending</div>
                        }
                      </div>
                      <p className="text-[12px] font-mono" style={{ color: '#6b7280' }}>{profile.kycDocuments?.aadhaarNumber ? profile.kycDocuments.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'Not uploaded'}</p>
                    </div>
                  </div>

                  {/* Recommended products */}
                  {profile.recommendedProducts?.length > 0 && (
                    <div className="mt-5">
                      <p className="text-[12px] font-semibold uppercase tracking-[0.14em] mb-3" style={{ color: '#9ca3af' }}>Active Products</p>
                      <div className="space-y-2">
                        {profile.recommendedProducts.map((p, i) => (
                          <div key={i} className="flex items-center gap-2.5">
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                            <p className="text-[12px]" style={{ color: '#374151' }}>{p}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Account opening info */}
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <h3 className="text-[14px] font-semibold mb-4" style={{ color: '#111827' }}>Account Details</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'IFSC Code', value: profile.ifscCode || 'SBIN0001234' },
                    { label: 'Branch', value: profile.branchName || 'HyperOne Digital Branch' },
                    { label: 'Account Status', value: 'Active' },
                    { label: 'Account Type', value: 'Savings' },
                  ].map((item, i) => (
                    <div key={i} className="rounded-xl p-4" style={{ background: '#f9fafb', border: '1px solid rgba(0,0,0,0.05)' }}>
                      <p className="text-[11px] uppercase tracking-wide mb-1" style={{ color: '#9ca3af' }}>{item.label}</p>
                      <p className="text-[13px] font-semibold" style={{ color: '#111827' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Document Vault */}
              <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-[14px] font-semibold" style={{ color: '#111827' }}>Document Vault</h3>
                    <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>Your verified identity documents</p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold" style={{ background: 'rgba(16,163,74,0.08)', color: '#16a34a', border: '1px solid rgba(16,163,74,0.2)' }}>
                    <Shield className="w-3 h-3" /> Encrypted
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {/* PAN Card */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', boxShadow: '0 4px 20px rgba(30,58,138,0.3)' }}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-white/50 text-[9px] uppercase tracking-[0.18em] font-semibold">INCOME TAX DEPT · GOVT. OF INDIA</p>
                          <p className="text-white font-bold text-[13px] mt-1">Permanent Account Number</p>
                        </div>
                        <FileText className="w-5 h-5 text-white/40" />
                      </div>
                      <p className="text-white font-mono text-[20px] font-bold tracking-[0.1em] mb-4">
                        {profile.kycDocuments?.panNumber || '•••• •••••• ••••'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-wide mb-0.5">Name</p>
                          <p className="text-white text-[12px] font-semibold">{name.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile.kycDocuments?.panVerified
                            ? <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(22,163,74,0.25)', color: '#6ee7b7' }}><CheckCircle className="w-2.5 h-2.5" /> Verified</div>
                            : <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.25)', color: '#fcd34d' }}><Clock className="w-2.5 h-2.5" /> Pending</div>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="text-white/40 text-[11px]">PAN Card</span>
                      <button
                        onClick={() => { navigator.clipboard.writeText(profile.kycDocuments?.panNumber || ''); toast.success('PAN copied!'); }}
                        className="flex items-center gap-1 text-[11px] font-medium text-white/60 hover:text-white transition-colors"
                      >
                        <Copy className="w-3 h-3" /> Copy
                      </button>
                    </div>
                  </div>

                  {/* Aadhaar Card */}
                  <div className="rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #064e3b 0%, #065f46 100%)', boxShadow: '0 4px 20px rgba(6,78,59,0.35)' }}>
                    <div className="p-5">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <p className="text-white/50 text-[9px] uppercase tracking-[0.18em] font-semibold">UNIQUE IDENTIFICATION AUTHORITY · INDIA</p>
                          <p className="text-white font-bold text-[13px] mt-1">Aadhaar Card</p>
                        </div>
                        <Shield className="w-5 h-5 text-white/40" />
                      </div>
                      <p className="text-white font-mono text-[20px] font-bold tracking-[0.1em] mb-4">
                        {profile.kycDocuments?.aadhaarNumber
                          ? profile.kycDocuments.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3')
                          : 'XXXX XXXX XXXX'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white/40 text-[9px] uppercase tracking-wide mb-0.5">Name</p>
                          <p className="text-white text-[12px] font-semibold">{name.toUpperCase()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile.kycDocuments?.aadhaarVerified
                            ? <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(22,163,74,0.25)', color: '#6ee7b7' }}><CheckCircle className="w-2.5 h-2.5" /> Verified</div>
                            : <div className="flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.25)', color: '#fcd34d' }}><Clock className="w-2.5 h-2.5" /> Pending</div>
                          }
                        </div>
                      </div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="text-white/40 text-[11px]">Aadhaar (Masked)</span>
                      <span className="text-[11px] font-medium text-white/40">Secured & Encrypted</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ══════════ AI COPILOT TAB ══════════ */}
          {activeTab === 'copilot' && (
            <motion.div
              key="copilot"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* Copilot intro strip */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 mb-5 px-1"
              >
                <div
                  className="w-10 h-10 rounded-[12px] flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #1d1d1f, #3730a3)', boxShadow: '0 4px 14px rgba(55,48,163,0.25)' }}
                >
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-[16px] font-bold tracking-tight" style={{ color: '#111827' }}>AI Banking Copilot</h2>
                  <p className="text-[12px] mt-0.5" style={{ color: '#9ca3af' }}>
                    Your personal financial assistant — portfolio, loans, investments, tax, and more.
                  </p>
                </div>
              </motion.div>

              <CopilotPanel
                customerName={name}
                userInitial={name.charAt(0).toUpperCase()}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
}
