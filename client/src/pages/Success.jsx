import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Copy, Download, Smartphone, Sparkles, Zap, Home, LayoutDashboard, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore.js';

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
  const setAuth = useAuthStore(s => s.setAuth);
  const accountData = location.state?.accountData;

  useEffect(() => {
    sessionStorage.setItem('hyperone_auth', '1');
    sessionStorage.setItem('hyperone_role', 'customer');
    // If we have a JWT from account creation, store it
    if (accountData?.token) {
      const customerPayload = {
        customerId: accountData.customerId,
        accountNumber: accountData.accountNumber,
        profile: accountData.profile,
        kycDocuments: accountData.kycDocuments,
        recommendedProducts: accountData.recommendedProducts,
        ifscCode: accountData.ifscCode,
        branchName: accountData.branchName,
      };
      setAuth(accountData.token, customerPayload);
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
  const hasRealToken = !!(accountData?.token);

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

        {/* Logo nav */}
        <div className="flex justify-center mb-2">
          <button
            onClick={() => { navigate('/'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
          >
            <div className="w-6 h-6 rounded-[7px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-white text-sm font-bold tracking-tight">HyperOne</span>
          </button>
        </div>

        {/* Success header */}
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

        {/* Credit card visual */}
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
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 75% 20%, rgba(255,255,255,0.22) 0%, transparent 55%)' }}
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

        {/* MPIN card — prominent, save-this-once style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl p-5"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.14) 0%, rgba(5,150,105,0.10) 100%)',
            border: '1px solid rgba(16,185,129,0.25)',
          }}
        >
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <KeyRound className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-300 uppercase tracking-[0.16em]">Save Your MPIN</p>
              <p className="text-[11px] text-white/40">Shown only once — use it to sign in later</p>
            </div>
          </div>
          <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-3">
            <div>
              <p className="text-[10px] text-white/35 uppercase tracking-wide mb-1">6-digit MPIN</p>
              <p className="text-2xl font-mono font-bold tracking-[0.22em] text-white">{data.mpin || '——'}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => { navigator.clipboard.writeText(data.mpin || ''); toast.success('MPIN copied!'); }}
              className="w-9 h-9 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </motion.button>
          </div>
          <p className="text-[11px] text-white/30 mt-3">
            Sign in at any time using: <span className="text-white/55 font-mono">{data.customerId}</span> + this MPIN
          </p>
        </motion.div>

        {/* Account details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card rounded-2xl p-5"
        >
          <p className="text-[10px] font-semibold text-white/35 uppercase tracking-[0.16em] mb-3">Account Details</p>
          <CopyableField label="Account Number" value={data.accountNumber || '—'} />
          <CopyableField label="Customer ID" value={data.customerId || '—'} />
          <CopyableField label="IFSC Code" value={data.ifscCode || '—'} />
        </motion.div>

        {/* Products activated */}
        {data.recommendedProducts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
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
                  transition={{ delay: 0.55 + i * 0.06, ...spring }}
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

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.62 }}
          className="grid grid-cols-3 gap-3"
        >
          {/* Download */}
          <button
            onClick={() => {
              const el = document.createElement('a');
              el.setAttribute('download', 'hyperone-account-details.txt');
              el.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(
                `HyperOne Account Details\n\nAccount Number: ${data.accountNumber}\nCustomer ID: ${data.customerId}\nMPIN: ${data.mpin}\nIFSC Code: ${data.ifscCode}\nBranch: ${data.branchName}\n\nKeep your MPIN secret.`
              ));
              el.click();
            }}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
          >
            <Download className="w-4 h-4" />
            Save
          </button>

          {/* Go to Dashboard — primary if authenticated, else secondary */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/my-dashboard')}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white"
            style={{
              background: hasRealToken
                ? 'linear-gradient(135deg, #059669, #10b981)'
                : 'rgba(255,255,255,0.08)',
              border: hasRealToken ? 'none' : '1px solid rgba(255,255,255,0.12)',
              boxShadow: hasRealToken ? '0 4px 20px rgba(5,150,105,0.35)' : 'none',
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </motion.button>

          {/* Return Home */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-1.5 py-3 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: '#1d1d1f', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#2d2d2f'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#1d1d1f'; }}
          >
            <Home className="w-4 h-4" />
            Home
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.72 }}
          className="text-center text-xs text-white/25 pb-2"
        >
          Welcome aboard · Built for SBI HackFest 2026
        </motion.p>
      </div>
    </div>
  );
}
