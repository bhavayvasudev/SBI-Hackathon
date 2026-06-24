import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, TrendingUp, Clock, CheckCircle, ArrowLeft,
  Zap, GraduationCap, Briefcase, Building2, Activity,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import { getDashboardStats } from '../lib/api.js';

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

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

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
            style={{
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              boxShadow: '0 0 40px rgba(99,102,241,0.4)',
            }}
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
    { name: 'Students', value: stats.categories.student, icon: GraduationCap },
    { name: 'Salaried', value: stats.categories.salaried, icon: Briefcase },
    { name: 'Business', value: stats.categories.business, icon: Building2 },
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

  return (
    <div className="min-h-screen bg-[#060609] relative">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[500px] h-[500px] bg-indigo-700" style={{ top: '-200px', right: '-100px' }} />
        <div className="orb w-[300px] h-[300px] bg-purple-800" style={{ bottom: '-100px', left: '-80px', opacity: 0.09 }} />
      </div>

      {/* ── Header ──────────────────────────────────── */}
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
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center"
                style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
              >
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">HyperOne Analytics</h1>
                <p className="text-[11px] text-white/40">Real-time onboarding intelligence</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 glass rounded-full px-4 py-2">
            <span className="flex relative">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </span>
            <span className="text-xs text-white/50 font-medium">Live</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </motion.header>

      {/* ── Content ─────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Onboarded"
            value={stats?.totalOnboarded?.toLocaleString() || '0'}
            subtitle="All time"
            icon={Users}
            color="indigo"
            index={0}
          />
          <StatCard
            title="Conversion Rate"
            value={`${stats?.conversionRate || 0}%`}
            subtitle="Lead → Account"
            icon={TrendingUp}
            color="emerald"
            index={1}
          />
          <StatCard
            title="Avg. Onboarding"
            value={`${Math.floor((stats?.avgOnboardingTime || 0) / 60)}m ${(stats?.avgOnboardingTime || 0) % 60}s`}
            subtitle="vs. 3 days at branch"
            icon={Clock}
            color="purple"
            index={2}
          />
          <StatCard
            title="KYC Success"
            value="98.4%"
            subtitle="Digital verification"
            icon={CheckCircle}
            color="amber"
            index={3}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-5">

          {/* Daily onboardings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.35 }}
            className="lg:col-span-2 glass-card rounded-2xl p-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-sm font-semibold text-white">Daily Onboardings</h2>
                <p className="text-xs text-white/35 mt-0.5">Last 14 days</p>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}
              >
                Trend ↑
              </div>
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
                <XAxis
                  dataKey="date"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(99,102,241,0.3)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="onboardings"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#areaGrad)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Customer segments pie */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.45 }}
            className="glass-card rounded-2xl p-6"
          >
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-white">Customer Segments</h2>
              <p className="text-xs text-white/35 mt-0.5">Distribution</p>
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
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} opacity={0.9} />
                  ))}
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
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: PIE_COLORS[i] }}
                        />
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

          {/* Top products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.55 }}
            className="glass-card rounded-2xl p-6"
          >
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
                <XAxis
                  type="number"
                  tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  type="category" dataKey="name" width={150}
                  tick={{ fill: 'rgba(255,255,255,0.45)', fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[0, 7, 7, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent onboardings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.65 }}
            className="glass-card rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Recent Onboardings</h2>
            <p className="text-xs text-white/35 mb-5">Latest customers</p>
            <div className="space-y-1">
              {(stats?.recentOnboardings || []).slice(0, 8).map((r, i) => {
                const catColor = {
                  student: { bg: 'rgba(99,102,241,0.15)', text: '#a5b4fc', dot: '#6366f1' },
                  salaried: { bg: 'rgba(16,185,129,0.15)', text: '#6ee7b7', dot: '#10b981' },
                  business: { bg: 'rgba(245,158,11,0.15)', text: '#fcd34d', dot: '#f59e0b' },
                }[r.profile?.category] || { bg: 'rgba(255,255,255,0.08)', text: '#fff', dot: '#fff' };

                return (
                  <motion.div
                    key={r._id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.04 }}
                    className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white/[0.04] transition-colors"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ background: catColor.bg, color: catColor.text }}
                    >
                      {(r.profile?.name || 'U').charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white/85 truncate">{r.profile?.name || 'Unknown'}</p>
                      <p className="text-xs text-white/35 truncate capitalize">{r.profile?.occupation || r.profile?.category}</p>
                    </div>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize flex-shrink-0"
                      style={{ background: catColor.bg, color: catColor.text }}
                    >
                      {r.profile?.category}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
