import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, TrendingUp, Clock, CheckCircle, ArrowLeft,
  Zap, GraduationCap, Briefcase, Building2, Activity,
  Search, Filter, ChevronDown, Eye, ThumbsUp, ThumbsDown,
  XCircle, Shield, ShieldCheck, ShieldAlert,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import { getDashboardStats, getAdminCustomers, updateCustomerKyc } from '../lib/api.js';
import toast from 'react-hot-toast';

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b'];
const spring = { type: 'spring', stiffness: 260, damping: 28 };

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-strong rounded-xl px-4 py-3 text-sm min-w-[120px]"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
    >
      {label && <p className="text-white/45 text-[11px] mb-1.5 font-medium">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="font-semibold" style={{ color: p.color || p.stroke }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ─── Customer Management Section ─────────────────────── */
function CustomerRow({ record, onKycAction }) {
  const [expanded, setExpanded] = useState(false);
  const kycOk = record.kycDocuments?.panVerified && record.kycDocuments?.aadhaarVerified;
  const catColor = {
    student:  { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', dot: '#6366f1' },
    salaried: { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7', dot: '#10b981' },
    business: { bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d', dot: '#f59e0b' },
  }[record.profile?.category] || { bg: 'rgba(255,255,255,0.08)', text: '#fff', dot: '#fff' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid rgba(255,255,255,0.07)', marginBottom: 6 }}
    >
      {/* Row summary */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.03] transition-colors"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: catColor.bg, color: catColor.text }}>
          {(record.profile?.name || 'U').charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/85 truncate">{record.profile?.name || 'Unknown'}</p>
          <p className="text-[11px] text-white/35 truncate font-mono">{record.customerId} · {record.accountNumber}</p>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize hidden sm:inline"
          style={{ background: catColor.bg, color: catColor.text }}>
          {record.profile?.category}
        </span>
        {kycOk
          ? <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400"><ShieldCheck className="w-3.5 h-3.5" /> Verified</div>
          : <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-400"><ShieldAlert className="w-3.5 h-3.5" /> Pending</div>
        }
        <ChevronDown
          className="w-4 h-4 text-white/30 transition-transform flex-shrink-0"
          style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
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
            <div className="px-4 pb-4 pt-1 border-t border-white/[0.06] space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Occupation', value: record.profile?.occupation || '—' },
                  { label: 'Income', value: record.profile?.income || '—' },
                  { label: 'PAN', value: record.kycDocuments?.panNumber || 'Not uploaded' },
                  { label: 'Aadhaar', value: record.kycDocuments?.aadhaarNumber ? record.kycDocuments.aadhaarNumber.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') : 'Not uploaded' },
                ].map((item, i) => (
                  <div key={i}>
                    <p className="text-[10px] text-white/35 uppercase tracking-wide mb-0.5">{item.label}</p>
                    <p className="text-xs text-white/70 font-mono">{item.value}</p>
                  </div>
                ))}
              </div>
              {record.profile?.goals && (
                <div>
                  <p className="text-[10px] text-white/35 uppercase tracking-wide mb-0.5">Goals</p>
                  <p className="text-xs text-white/60">{record.profile.goals}</p>
                </div>
              )}
              {/* KYC actions */}
              {!kycOk && (
                <div className="flex gap-2 pt-1">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'approve')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" /> Approve KYC
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'reject')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Reject
                  </motion.button>
                </div>
              )}
              {kycOk && (
                <div className="flex items-center gap-2 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs text-emerald-400 font-medium">KYC fully verified — PAN + Aadhaar</p>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onKycAction(record._id, 'reject')}
                    className="ml-auto flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold"
                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)' }}
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

function CustomersPanel() {
  const [customers, setCustomers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [kyc, setKyc] = useState('');
  const [loading, setLoading] = useState(true);

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
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(1)}
            placeholder="Search by name, customer ID, account, PAN…"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
            onFocus={e => { e.target.style.border = '1px solid rgba(99,102,241,0.5)'; }}
            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; }}
          />
        </div>
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', minWidth: 130 }}
        >
          <option value="">All Categories</option>
          <option value="student">Student</option>
          <option value="salaried">Salaried</option>
          <option value="business">Business</option>
        </select>
        <select
          value={kyc}
          onChange={e => setKyc(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm outline-none"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', minWidth: 130 }}
        >
          <option value="">All KYC</option>
          <option value="verified">Verified</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/40">{total} customer{total !== 1 ? 's' : ''} found</p>
      </div>

      {/* Customer list */}
      {loading ? (
        <div className="text-center py-12 text-white/35 text-sm">Loading…</div>
      ) : customers.length === 0 ? (
        <div className="text-center py-16 glass-card rounded-2xl">
          <Users className="w-10 h-10 mx-auto text-white/20 mb-3" />
          <p className="text-white/40 text-sm">No customers found</p>
        </div>
      ) : (
        <div>
          {customers.map(r => (
            <CustomerRow key={r._id} record={r} onKycAction={handleKycAction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => load(page - 1)}
            disabled={page <= 1}
            className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            Prev
          </button>
          <span className="text-sm text-white/40">{page} / {pages}</span>
          <button
            onClick={() => load(page + 1)}
            disabled={page >= pages}
            className="px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-30 transition-colors"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Main Admin Dashboard ───────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');

  useEffect(() => {
    getDashboardStats()
      .then(res => { if (res.success) setStats(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060609] flex items-center justify-center">
        <div className="text-center space-y-5">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 rounded-2xl mx-auto"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}
          >
            <div className="w-full h-full rounded-2xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <p className="text-white/40 text-sm">Loading analytics…</p>
        </div>
      </div>
    );
  }

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

  const tabs = [
    { id: 'analytics', label: 'Analytics' },
    { id: 'customers', label: 'Customers' },
  ];

  return (
    <div className="min-h-screen bg-[#060609] relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[500px] h-[500px] bg-indigo-700" style={{ top: '-200px', right: '-100px' }} />
        <div className="orb w-[300px] h-[300px] bg-purple-800" style={{ bottom: '-100px', left: '-80px', opacity: 0.09 }} />
      </div>

      {/* ── Header ── */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 nav-glass px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
            <button
              onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="flex items-center gap-3 hover:opacity-75 transition-opacity"
            >
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-bold text-white">HyperOne Admin</h1>
                <p className="text-[11px] text-white/40">SBI HackFest 2026 · Live Intelligence</p>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Tab switcher */}
            <div className="hidden sm:flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="px-4 py-1.5 rounded-lg text-[12px] font-medium transition-all"
                  style={{
                    background: activeTab === tab.id ? 'rgba(99,102,241,0.25)' : 'transparent',
                    color: activeTab === tab.id ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
                    border: activeTab === tab.id ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-white/50 font-medium">Live</span>
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile tab switcher */}
      <div className="sm:hidden flex gap-2 px-6 pt-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.id ? '#a5b4fc' : 'rgba(255,255,255,0.45)',
              border: `1px solid ${activeTab === tab.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">

          {/* ══ ANALYTICS TAB ══ */}
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-6"
            >
              {/* Stat cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Onboarded" value={stats?.totalOnboarded?.toLocaleString() || '0'} subtitle="All time" icon={Users} color="indigo" index={0} />
                <StatCard title="Conversion Rate" value={`${stats?.conversionRate || 0}%`} subtitle="Lead → Account" icon={TrendingUp} color="emerald" index={1} />
                <StatCard title="Avg. Onboarding" value={`${Math.floor((stats?.avgOnboardingTime || 0) / 60)}m ${(stats?.avgOnboardingTime || 0) % 60}s`} subtitle="vs. 3 days at branch" icon={Clock} color="purple" index={2} />
                <StatCard title="KYC Success" value="98.4%" subtitle="Digital verification" icon={CheckCircle} color="amber" index={3} />
              </div>

              {/* Charts row 1 */}
              <div className="grid lg:grid-cols-3 gap-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.35 }} className="lg:col-span-2 glass-card rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-sm font-semibold text-white">Daily Onboardings</h2>
                      <p className="text-xs text-white/35 mt-0.5">Last 14 days</p>
                    </div>
                    <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>Trend ↑</div>
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={dailyChartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                      <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
                      <Area type="monotone" dataKey="onboardings" stroke="#6366f1" strokeWidth={2.5} fill="url(#areaGrad)" dot={false} activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.45 }} className="glass-card rounded-2xl p-6">
                  <div className="mb-4">
                    <h2 className="text-sm font-semibold text-white">Customer Segments</h2>
                    <p className="text-xs text-white/35 mt-0.5">Distribution</p>
                  </div>
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={42} outerRadius={62} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2.5 mt-2">
                    {categoryData.map((c, i) => {
                      const total = stats?.totalOnboarded || 1;
                      const pct = Math.round((c.value / total) * 100);
                      return (
                        <div key={c.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                            <span className="text-xs text-white/55">{c.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1 rounded-full bg-white/[0.07] overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: PIE_COLORS[i] }} />
                            </div>
                            <span className="text-xs font-semibold text-white/70 w-10 text-right">{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Charts row 2 */}
              <div className="grid lg:grid-cols-2 gap-5">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.55 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-white mb-1">Top Recommended Products</h2>
                  <p className="text-xs text-white/35 mb-6">By recommendation count</p>
                  <ResponsiveContainer width="100%" height={230}>
                    <BarChart data={productData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 7, 7, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ ...spring, delay: 0.65 }} className="glass-card rounded-2xl p-6">
                  <h2 className="text-sm font-semibold text-white mb-1">Recent Onboardings</h2>
                  <p className="text-xs text-white/35 mb-5">Latest customers</p>
                  <div className="space-y-1">
                    {(stats?.recentOnboardings || []).slice(0, 8).map((r, i) => {
                      const catColor = {
                        student:  { bg: 'rgba(99,102,241,0.15)',  text: '#a5b4fc', dot: '#6366f1' },
                        salaried: { bg: 'rgba(16,185,129,0.15)',  text: '#6ee7b7', dot: '#10b981' },
                        business: { bg: 'rgba(245,158,11,0.15)',  text: '#fcd34d', dot: '#f59e0b' },
                      }[r.profile?.category] || { bg: 'rgba(255,255,255,0.08)', text: '#fff', dot: '#fff' };
                      return (
                        <motion.div key={r._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.04 }}
                          className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-colors">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: catColor.bg, color: catColor.text }}>
                            {(r.profile?.name || 'U').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white/85 truncate">{r.profile?.name || 'Unknown'}</p>
                            <p className="text-xs text-white/35 truncate capitalize">{r.profile?.occupation || r.profile?.category}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0" style={{ background: catColor.bg, color: catColor.text }}>
                            {r.profile?.category}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* ══ CUSTOMERS TAB ══ */}
          {activeTab === 'customers' && (
            <motion.div
              key="customers"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-white">Customer Management</h2>
                <p className="text-sm text-white/40 mt-0.5">Search, filter, and manage KYC for all onboarded customers</p>
              </div>
              <CustomersPanel />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
