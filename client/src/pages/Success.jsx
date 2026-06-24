import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, BarChart3, Download, Smartphone, Sparkles, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b', '#06b6d4'];

const spring = { type: 'spring', stiffness: 280, damping: 26 };

function Confetti() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: -24,
            rotate: 0,
            opacity: 1,
            scale: 0.8 + Math.random() * 0.6,
          }}
          animate={{
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 30,
            rotate: (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360),
            opacity: [1, 1, 0.8, 0],
          }}
          transition={{
            duration: 3.5 + Math.random() * 2.5,
            delay: Math.random() * 1.8,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          style={{
            position: 'absolute',
            width: 7 + Math.random() * 7,
            height: 7 + Math.random() * 7,
            borderRadius: Math.random() > 0.45 ? '50%' : '2px',
            backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
          }}
        />
      ))}
    </div>
  );
}

function CopyableField({ label, value }) {
  const copy = () => {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copied!`);
  };
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.055] last:border-0">
      <div>
        <p className="text-[10px] text-white/35 uppercase tracking-wide font-medium">{label}</p>
        <p className="text-sm font-mono font-semibold text-white/90 mt-0.5">{value}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={copy}
        className="w-8 h-8 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/35 hover:text-white/80 transition-colors ml-4"
      >
        <Copy className="w-3.5 h-3.5" />
      </motion.button>
    </div>
  );
}

export default function Success() {
  const location = useLocation();
  const navigate = useNavigate();
  const accountData = location.state?.accountData;

  const mockData = {
    accountNumber: '3' + Math.floor(Math.random() * 9e10 + 1e10).toString().slice(0, 10),
    customerId: 'SBIH' + Math.floor(Math.random() * 9e5 + 1e5),
    ifscCode: 'SBIN0001234',
    branchName: 'HyperOne Digital Branch',
    profile: { name: 'Demo User', category: 'salaried' },
    recommendedProducts: ['SBI Salary Account', 'SBI Fixed Deposit', 'SBI SimplyCLICK Credit Card'],
  };

  const data = accountData || mockData;

  return (
    <div className="min-h-screen bg-[#060609] flex items-center justify-center relative overflow-hidden px-5 py-12">
      <Confetti />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[500px] h-[500px] bg-emerald-700" style={{ top: '-200px', left: '-100px' }} />
        <div className="orb w-[400px] h-[400px] bg-indigo-700" style={{ bottom: '-100px', right: '-100px' }} />
        <div className="orb w-[300px] h-[300px] bg-purple-700" style={{ top: '40%', right: '5%', opacity: 0.08 }} />
      </div>

      <div className="relative z-10 max-w-lg w-full space-y-5">

        {/* ── Success header ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.75, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 240, damping: 22 }}
          className="text-center"
        >
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center">
              <CheckCircle className="w-9 h-9 text-emerald-400" />
            </div>
            {/* Ring pulse */}
            <motion.div
              className="absolute inset-0 rounded-full border border-emerald-400/25"
              animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border border-emerald-400/15"
              animate={{ scale: [1, 2], opacity: [0.4, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeOut', delay: 0.4 }}
            />
          </div>

          <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Account Opened! 🎉</h1>
          <p className="text-white/50">
            Welcome to SBI,{' '}
            <span className="text-white/80 font-semibold">{data.profile?.name || 'Customer'}</span>!
            Your account is live.
          </p>
        </motion.div>

        {/* ── Credit card visual ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 28, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ delay: 0.2, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative rounded-[24px] overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #312e81 0%, #6d28d9 50%, #9d174d 100%)',
            boxShadow: '0 32px 80px rgba(99,102,241,0.4), 0 8px 24px rgba(0,0,0,0.5)',
          }}
        >
          {/* Shine overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 75% 20%, rgba(255,255,255,0.22) 0%, transparent 55%)',
            }}
          />
          {/* Noise texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <div className="relative p-6 pb-7">
            <div className="flex items-start justify-between mb-10">
              <div>
                <p className="text-white/55 text-[10px] uppercase tracking-[0.18em] font-semibold">State Bank of India</p>
                <p className="text-white font-bold text-lg mt-1 tracking-tight">HyperOne Digital Account</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>

            <p className="text-white/55 text-[10px] uppercase tracking-[0.14em] mb-1.5 font-medium">Account Number</p>
            <p className="text-white font-mono text-[1.35rem] font-bold tracking-[0.12em] mb-7">
              {data.accountNumber?.replace(/(\d{4})(\d{4})(\d{3,})/, '$1 $2 $3') || '3456 7890 1234'}
            </p>

            <div className="flex justify-between">
              <div>
                <p className="text-white/45 text-[10px] uppercase tracking-wide mb-1">Customer ID</p>
                <p className="text-white font-mono font-semibold text-sm">{data.customerId}</p>
              </div>
              <div>
                <p className="text-white/45 text-[10px] uppercase tracking-wide mb-1">IFSC Code</p>
                <p className="text-white font-mono font-semibold text-sm">{data.ifscCode}</p>
              </div>
              <div>
                <p className="text-white/45 text-[10px] uppercase tracking-wide mb-1">Branch</p>
                <p className="text-white font-semibold text-xs">{data.branchName}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Account details ─────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass-card rounded-2xl p-5"
        >
          <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.16em] mb-3">Account Details</p>
          <CopyableField label="Account Number" value={data.accountNumber || '—'} />
          <CopyableField label="Customer ID" value={data.customerId || '—'} />
          <CopyableField label="IFSC Code" value={data.ifscCode || '—'} />
        </motion.div>

        {/* ── Products activated ──────────────────────── */}
        {data.recommendedProducts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.16em]">Products Activated</p>
            </div>
            <div className="space-y-2.5">
              {data.recommendedProducts.map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06, ...spring }}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-sm text-white/75">{p}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Actions ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.58 }}
          className="flex gap-3"
        >
          <Button variant="glass" className="flex-1" onClick={() => navigate('/')}>
            <Download className="w-4 h-4" />
            Download Kit
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => navigate('/dashboard')}>
            View Dashboard
            <BarChart3 className="w-4 h-4" />
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.68 }}
          className="text-center text-xs text-white/25 pb-2"
        >
          Welcome aboard! Download YONO to start banking immediately.
        </motion.p>
      </div>
    </div>
  );
}
