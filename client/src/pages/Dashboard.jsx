import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, TrendingUp, Clock, Zap, GraduationCap, Briefcase,
  Building2, Activity, Search, ChevronDown, ThumbsUp, ThumbsDown,
  XCircle, ShieldCheck, ShieldAlert, LogOut, Bell,
  ArrowUpRight, ArrowDownRight, Plus, UserPlus,
} from 'lucide-react';
import { getDashboardStats, getAdminCustomers, updateCustomerKyc, logoutAdmin } from '../lib/api.js';
import toast from 'react-hot-toast';

/* ─── Constants ─────────────────────────────────────────── */
const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B'];
const spring = { type: 'spring', stiffness: 260, damping: 28 };

const CAT_LIGHT = {
  student:  { initial: 'bg-blue-100 text-blue-700',    chip: 'bg-blue-50 text-blue-700' },
  salaried: { initial: 'bg-emerald-100 text-emerald-700', chip: 'bg-emerald-50 text-emerald-700' },
  business: { initial: 'bg-amber-100 text-amber-700',  chip: 'bg-amber-50 text-amber-700' },
};
const CAT_DEFAULT = { initial: 'bg-slate-100 text-slate-600', chip: 'bg-slate-50 text-slate-600' };

/* ─── Light Tooltip ─────────────────────────────────────── */
const LightTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-xl px-4 py-3 shadow-lg border border-slate-100 text-sm min-w-[130px]">
      {label && <p className="text-slate-400 text-[11px] mb-1.5 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.stroke || '#2563EB' }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── KPI Card ──────────────────────────────────────────── */
function KpiCard({ title, value, subtitle, icon: Icon, iconBg, iconColor, index, trend, trendUp }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, ...spring }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="bg-white rounded-2xl p-5 border border-slate-100 cursor-default"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            trendUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
          }`}>
            {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p className="text-[1.7rem] font-bold text-slate-900 tracking-tight leading-none mb-1">{value}</p>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
    </motion.div>
  );
}

/* ─── Customer Row ──────────────────────────────────────── */
function CustomerRow({ record, onKycAction, index }) {
  const [expanded, setExpanded] = useState(false);
  const kycOk = record.kycDocuments?.panVerified && record.kycDocuments?.aadhaarVerified;
  const cat = CAT_LIGHT[record.profile?.category] || CAT_DEFAULT;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, ...spring }}
      className="border-b border-slate-50 last:border-none"
    >
      {/* Row summary */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-slate-50/80 transition-colors group"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Avatar + name */}
        <div className="flex items-center gap-3 flex-[2] min-w-0">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${cat.initial}`}>
            {(record.profile?.name || 'U').charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{record.profile?.name || 'Unknown'}</p>
            <p className="text-[11px] text-slate-400 font-mono truncate">{record.customerId}</p>
          </div>
        </div>

        {/* Account number */}
        <p className="text-sm text-slate-500 font-mono flex-[1.5] hidden md:block truncate">{record.accountNumber || '—'}</p>

        {/* Category chip */}
        <div className="flex-1 hidden sm:flex">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize ${cat.chip}`}>
            {record.profile?.category || '—'}
          </span>
        </div>

        {/* KYC status */}
        <div className="flex-shrink-0">
          {kycOk
            ? <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </div>
            : <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                <ShieldAlert className="w-3.5 h-3.5" /> Pending
              </div>
          }
        </div>

        {/* Expand chevron */}
        <ChevronDown
          className="w-4 h-4 text-slate-300 group-hover:text-slate-400 flex-shrink-0 transition-transform"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        />
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-3 bg-slate-50/60 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Occupation', value: record.profile?.occupation || '—' },
                  { label: 'Income', value: record.profile?.income || '—' },
                  { label: 'PAN Number', value: record.kycDocuments?.panNumber || 'Not uploaded' },
                  { label: 'PAN Name', value: record.kycDocuments?.panName || '—' },
                  { label: 'PAN DOB', value: record.kycDocuments?.panDob || '—' },
                  { label: 'Aadhaar', value: record.kycDocuments?.aadhaarNumber ? record.kycDocuments.aadhaarNumber.replace(/^(\w{4})-(\w{4})-(\w{4})$/, '$1 $2 $3') : 'Not uploaded' },
                  { label: 'Aadhaar Name', value: record.kycDocuments?.aadhaarName || '—' },
                  { label: 'Aadhaar DOB', value: record.kycDocuments?.aadhaarDob || (record.kycDocuments?.aadhaarGender ? `— · ${record.kycDocuments.aadhaarGender}` : '—') },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5 font-semibold">{item.label}</p>
                    <p className="text-xs text-slate-700 font-mono">{item.value}</p>
                  </div>
                ))}
              </div>

              {record.profile?.goals && (
                <div>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide mb-0.5 font-semibold">Goals</p>
                  <p className="text-xs text-slate-600">{record.profile.goals}</p>
                </div>
              )}

              {/* KYC actions */}
              {!kycOk && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'approve')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Approve KYC
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'reject')}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Reject
                  </motion.button>
                </div>
              )}
              {kycOk && (
                <div className="flex items-center gap-2 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <p className="text-xs text-emerald-600 font-medium">KYC fully verified — PAN + Aadhaar</p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'reject')}
                    className="ml-auto flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors"
                  >
                    <XCircle className="w-3 h-3" /> Revoke
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Customers Panel ───────────────────────────────────── */
function CustomersPanel() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pages, setPages]         = useState(1);
  const [search, setSearch]       = useState('');
  const [category, setCategory]   = useState('');
  const [kyc, setKyc]             = useState('');
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const res = await getAdminCustomers({ search, category, kyc, page: p, limit: 10 });
      if (res.success) {
        setCustomers(res.data.customers);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setPage(p);
      }
    } catch (e) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, category, kyc]);

  useEffect(() => { load(1); }, [load]);

  const handleKycAction = async (id, action) => {
    try {
      await updateCustomerKyc(id, action);
      toast.success(action === 'approve' ? 'KYC approved' : 'KYC revoked');
      load(page);
    } catch {
      toast.error('Action failed');
    }
  };

  return (
    <div className="space-y-5">
      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1)}
            placeholder="Search by name, customer ID, account, PAN…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none bg-white border border-slate-200 text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-w-[140px] cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="student">Student</option>
          <option value="salaried">Salaried</option>
          <option value="business">Business</option>
        </select>
        <select
          value={kyc}
          onChange={e => setKyc(e.target.value)}
          className="px-4 py-2.5 rounded-xl text-sm outline-none bg-white border border-slate-200 text-slate-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-50 min-w-[130px] cursor-pointer"
        >
          <option value="">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <p className="text-sm text-slate-400 font-medium">{total} customer{total !== 1 ? 's' : ''} found</p>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3.5 bg-slate-50 border-b border-slate-100">
          <div className="flex-[2] text-[11px] font-semibold uppercase tracking-wider text-slate-400">Customer</div>
          <div className="flex-[1.5] text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:block">Account</div>
          <div className="flex-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:block">Category</div>
          <div className="w-20 text-[11px] font-semibold uppercase tracking-wider text-slate-400">KYC</div>
          <div className="w-4" />
        </div>

        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
            Loading customers…
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-10 h-10 mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 text-sm">No customers found</p>
          </div>
        ) : (
          customers.map((r, i) => (
            <CustomerRow key={r._id} record={r} onKycAction={handleKycAction} index={i} />
          ))
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            ← Prev
          </button>
          <span className="text-sm text-slate-400 font-medium px-4">{page} / {pages}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pages}
            className="px-4 py-2 rounded-xl text-sm font-medium disabled:opacity-40 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Dashboard ────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    getDashboardStats()
      .then(res => { if (res.success) setStats(res.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAdminLogout = async () => {
    try { await logoutAdmin(); } catch { /* best effort */ }
    sessionStorage.removeItem('hyperone_admin_token');
    sessionStorage.removeItem('hyperone_role');
    navigate('/');
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', boxShadow: '0 8px 30px rgba(37,99,235,0.3)' }}
          >
            <Zap className="w-5 h-5 text-white" />
          </motion.div>
          <p className="text-slate-400 text-sm font-medium">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  /* ── Derived data (identical logic to before) ── */
  const categoryData = stats ? [
    { name: 'Students',  value: stats.categories.student,  icon: GraduationCap },
    { name: 'Salaried',  value: stats.categories.salaried, icon: Briefcase },
    { name: 'Business',  value: stats.categories.business, icon: Building2 },
  ] : [];

  const pieData = categoryData.map(d => ({ name: d.name, value: d.value }));

  const dailyChartData = (stats?.dailyData || []).map(d => ({
    date: typeof d.date === 'string' ? d.date.slice(5) : d.date,
    onboardings: d.count,
  }));

  const productData = (stats?.topProducts || []).map(p => ({
    name: p.name.length > 22 ? p.name.slice(0, 22) + '…' : p.name,
    count: p.count,
  }));

  /* ── Trend: compare last two days ── */
  const todayNew = dailyChartData.length > 0 ? dailyChartData[dailyChartData.length - 1].onboardings : 0;
  const prevDay  = dailyChartData.length > 1 ? dailyChartData[dailyChartData.length - 2].onboardings : 0;
  const dayTrend = prevDay > 0 ? Math.round(((todayNew - prevDay) / prevDay) * 100) : 0;

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'customers', label: 'Customers' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]" style={{ fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Sticky Nav ─────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 py-3.5"
        style={{ boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.04)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center gap-4">

          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            <div
              className="w-8 h-8 rounded-[9px] flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}
            >
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900 leading-tight">HyperOne</p>
              <p className="text-[10px] text-slate-400 leading-tight font-medium">Admin Console</p>
            </div>
          </button>

          {/* Global search */}
          <div className="flex-1 max-w-sm hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                placeholder="Search customers, accounts, KYC…"
                className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          {/* Tab switcher */}
          <div className="hidden sm:flex items-center gap-0.5 rounded-xl p-1 bg-slate-100 ml-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#1e40af' : '#64748b',
                  boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>
            <button className="relative w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center hover:bg-slate-100 transition-colors">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-500" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-sm font-bold select-none">
              A
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleAdminLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 bg-red-50 border border-red-100 hover:bg-red-100 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Mobile tab switcher */}
      <div className="sm:hidden flex gap-2 px-6 pt-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: activeTab === tab.id ? '#EFF6FF' : '#fff',
              color: activeTab === tab.id ? '#2563EB' : '#64748B',
              border: `1px solid ${activeTab === tab.id ? '#BFDBFE' : '#E2E8F0'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Page Content ────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ══ ANALYTICS TAB ══════════════════════════════════ */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-8"
            >
              {/* Hero header */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pt-2">
                <div>
                  <motion.h1
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-slate-900 tracking-tight"
                  >
                    {greeting}, Admin
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-slate-500 mt-1.5 text-[15px]"
                  >
                    Here's what's happening across HyperOne today.
                  </motion.p>
                </div>
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  whileHover={{ y: -1, boxShadow: '0 8px 24px rgba(37,99,235,0.4)' }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 self-start"
                  style={{ background: 'linear-gradient(135deg, #1E3A8A, #2563EB)', boxShadow: '0 4px 14px rgba(37,99,235,0.3)' }}
                >
                  <Plus className="w-4 h-4" />
                  Quick Actions
                </motion.button>
              </div>

              {/* KPI Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <KpiCard
                  title="Total Users"
                  value={stats?.totalOnboarded?.toLocaleString() || '0'}
                  subtitle="All time"
                  icon={Users}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  index={0}
                />
                <KpiCard
                  title="New Today"
                  value={todayNew}
                  subtitle="Accounts opened"
                  icon={UserPlus}
                  iconBg="bg-indigo-50"
                  iconColor="text-indigo-600"
                  index={1}
                  trend={dayTrend}
                  trendUp={dayTrend >= 0}
                />
                <KpiCard
                  title="KYC Success"
                  value="98.4%"
                  subtitle="Digital verification"
                  icon={ShieldCheck}
                  iconBg="bg-emerald-50"
                  iconColor="text-emerald-600"
                  index={2}
                  trend={2}
                  trendUp={true}
                />
                <KpiCard
                  title="Conversion Rate"
                  value={`${stats?.conversionRate || 0}%`}
                  subtitle="Lead → Account"
                  icon={TrendingUp}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  index={3}
                />
                <KpiCard
                  title="Avg. Onboarding"
                  value={`${Math.floor((stats?.avgOnboardingTime || 0) / 60)}m ${(stats?.avgOnboardingTime || 0) % 60}s`}
                  subtitle="vs. 3 days at branch"
                  icon={Clock}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  index={4}
                />
              </div>

              {/* Bento Row 1: Area chart + Pie */}
              <div className="grid lg:grid-cols-3 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.3 }}
                  className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Daily User Growth</h2>
                      <p className="text-xs text-slate-400 mt-0.5">New onboardings — last 14 days</p>
                    </div>
                    <div className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-100">
                      Trend ↑
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dailyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGradLight" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12} />
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<LightTooltip />} cursor={{ stroke: 'rgba(37,99,235,0.12)', strokeWidth: 1 }} />
                      <Area
                        type="monotone"
                        dataKey="onboardings"
                        name="Onboardings"
                        stroke="#2563EB"
                        strokeWidth={2.5}
                        fill="url(#areaGradLight)"
                        dot={false}
                        activeDot={{ r: 5, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.4 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <div className="mb-4">
                    <h2 className="text-base font-bold text-slate-900">Customer Segments</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Distribution by category</p>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%" cy="50%"
                        innerRadius={42} outerRadius={62}
                        paddingAngle={4}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />)}
                      </Pie>
                      <Tooltip content={<LightTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-3">
                    {categoryData.map((c, i) => {
                      const total = stats?.totalOnboarded || 1;
                      const pct = Math.round((c.value / total) * 100);
                      return (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-xs text-slate-500">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i] }} />
                            </div>
                            <span className="text-xs font-semibold text-slate-600 w-8 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Bento Row 2: Bar chart + Activity feed */}
              <div className="grid lg:grid-cols-2 gap-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.5 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <h2 className="text-base font-bold text-slate-900 mb-1">Top Recommended Products</h2>
                  <p className="text-xs text-slate-400 mb-6">By AI recommendation count</p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={productData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGradLight" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%"   stopColor="#1E40AF" />
                          <stop offset="100%" stopColor="#2563EB" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                      <XAxis type="number"   tick={{ fill: '#94A3B8', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fill: '#64748B', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<LightTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)' }} />
                      <Bar dataKey="count" name="Count" fill="url(#barGradLight)" radius={[0, 7, 7, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...spring, delay: 0.6 }}
                  className="bg-white rounded-2xl p-6 border border-slate-100"
                  style={{ boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}
                >
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
                      <p className="text-xs text-slate-400 mt-0.5">Latest customer onboardings</p>
                    </div>
                    <Activity className="w-4 h-4 text-slate-300" />
                  </div>
                  <div className="space-y-0.5">
                    {(stats?.recentOnboardings || []).slice(0, 7).map((r, i) => {
                      const cat = CAT_LIGHT[r.profile?.category] || CAT_DEFAULT;
                      const kycOk = r.kycDocuments?.panVerified && r.kycDocuments?.aadhaarVerified;
                      return (
                        <motion.div
                          key={r._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.65 + i * 0.05 }}
                          className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${cat.initial}`}>
                            {(r.profile?.name || 'U').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">{r.profile?.name || 'Unknown'}</p>
                            <p className="text-xs text-slate-400 truncate capitalize">{r.profile?.occupation || r.profile?.category}</p>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                            kycOk ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {kycOk ? 'KYC ✓' : 'Pending'}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ══ CUSTOMERS TAB ══════════════════════════════════ */}
          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Management</h2>
                <p className="text-slate-500 mt-1 text-sm">Search, filter, and manage KYC for all onboarded customers</p>
              </div>
              <CustomersPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
