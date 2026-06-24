import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, TrendingUp, Clock, CheckCircle, ArrowLeft,
  Zap, GraduationCap, Briefcase, Building2,
} from 'lucide-react';
import StatCard from '../components/dashboard/StatCard.jsx';
import { getDashboardStats } from '../lib/api.js';

const COLORS = { student: '#6366f1', salaried: '#10b981', business: '#f59e0b' };
const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass rounded-xl px-3 py-2 text-sm">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
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
      <div className="min-h-screen bg-[#050508] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto animate-pulse">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <p className="text-white/50 text-sm">Loading analytics...</p>
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
    date: d.date.slice(5),
    onboardings: d.count,
  }));

  const productData = (stats?.topProducts || []).map(p => ({
    name: p.name.length > 20 ? p.name.slice(0, 20) + '…' : p.name,
    count: p.count,
  }));

  return (
    <div className="min-h-screen bg-[#050508] relative">
      <div className="orb w-[500px] h-[500px] bg-indigo-700 top-[-200px] right-[-100px]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-white/[0.06] px-6 py-5"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/')} className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">HyperOne Analytics</h1>
                <p className="text-xs text-white/40">Real-time onboarding intelligence</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/40">Live</span>
          </div>
        </div>
      </motion.header>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">
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
            title="Avg. Onboarding Time"
            value={`${Math.floor((stats?.avgOnboardingTime || 0) / 60)}m ${(stats?.avgOnboardingTime || 0) % 60}s`}
            subtitle="vs. 3 days branch"
            icon={Clock}
            color="purple"
            index={2}
          />
          <StatCard
            title="KYC Success Rate"
            value="98.4%"
            subtitle="Digital verification"
            icon={CheckCircle}
            color="amber"
            index={3}
          />
        </div>

        {/* Charts row 1 */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daily onboardings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Daily Onboardings</h2>
            <p className="text-xs text-white/40 mb-6">Last 14 days</p>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyChartData}>
                <defs>
                  <linearGradient id="indigo-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="onboardings"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#indigo-gradient)"
                  dot={false}
                  activeDot={{ r: 4, fill: '#6366f1' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Customer segments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Customer Segments</h2>
            <p className="text-xs text-white/40 mb-4">Distribution</p>
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryData.map((c, i) => {
                const total = stats?.totalOnboarded || 1;
                const pct = Math.round((c.value / total) * 100);
                return (
                  <div key={c.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                      <span className="text-xs text-white/60">{c.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white">{c.value} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Charts row 2 */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Top products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Top Recommended Products</h2>
            <p className="text-xs text-white/40 mb-6">By recommendation count</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="url(#bar-gradient)" radius={[0, 6, 6, 0]}>
                  <defs>
                    <linearGradient id="bar-gradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Recent onboardings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-sm font-semibold text-white mb-1">Recent Onboardings</h2>
            <p className="text-xs text-white/40 mb-4">Latest customers</p>
            <div className="space-y-3">
              {(stats?.recentOnboardings || []).slice(0, 7).map((r, i) => {
                const colorMap = { student: 'bg-indigo-500', salaried: 'bg-emerald-500', business: 'bg-amber-500' };
                const bg = colorMap[r.profile?.category] || 'bg-white';
                return (
                  <motion.div
                    key={r._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.05 }}
                    className="flex items-center justify-between py-1"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full ${bg} bg-opacity-20 border border-white/10 flex items-center justify-center text-xs font-bold`}>
                        {(r.profile?.name || 'U').charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{r.profile?.name || 'Unknown'}</p>
                        <p className="text-xs text-white/40 capitalize">{r.profile?.occupation || r.profile?.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        r.profile?.category === 'student' ? 'bg-indigo-500/15 text-indigo-300' :
                        r.profile?.category === 'business' ? 'bg-amber-500/15 text-amber-300' :
                        'bg-emerald-500/15 text-emerald-300'
                      }`}>
                        {r.profile?.category}
                      </span>
                    </div>
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
