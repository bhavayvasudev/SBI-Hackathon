import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, ArrowRight, BarChart3, Download, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';

function Confetti() {
  const colors = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {Array.from({ length: 40 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: -20,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            y: window.innerHeight + 20,
            rotate: Math.random() * 720,
            opacity: [1, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            delay: Math.random() * 1.5,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: 8 + Math.random() * 6,
            height: 8 + Math.random() * 6,
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            backgroundColor: colors[Math.floor(Math.random() * colors.length)],
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
    <div className="flex items-center justify-between py-2.5 border-b border-white/[0.06] last:border-0">
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-sm font-mono font-semibold text-white mt-0.5">{value}</p>
      </div>
      <button onClick={copy} className="text-white/30 hover:text-white transition-colors ml-4">
        <Copy className="w-4 h-4" />
      </button>
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
    <div className="min-h-screen bg-[#050508] flex items-center justify-center relative overflow-hidden px-6 py-12">
      <Confetti />
      <div className="orb w-[500px] h-[500px] bg-emerald-700 top-[-200px] left-[-100px]" />
      <div className="orb w-[400px] h-[400px] bg-indigo-700 bottom-[-100px] right-[-100px]" />

      <div className="relative z-10 max-w-lg w-full space-y-6">
        {/* Success header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
          className="text-center"
        >
          <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Account Opened! 🎉</h1>
          <p className="text-white/50">
            Welcome to SBI, <span className="text-white font-medium">{data.profile?.name || 'Customer'}</span>! Your account is ready to use.
          </p>
        </motion.div>

        {/* Account card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #3730a3 0%, #6d28d9 50%, #be185d 100%)',
          }}
        >
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
            }}
          />
          <div className="relative p-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-white/60 text-xs uppercase tracking-widest font-medium">State Bank of India</p>
                <p className="text-white font-bold text-lg mt-0.5">HyperOne Account</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
            </div>

            <p className="text-white/60 text-xs mb-1">Account Number</p>
            <p className="text-white font-mono text-xl font-bold tracking-widest mb-6">
              {data.accountNumber?.replace(/(\d{4})(\d{4})(\d{4})/, '$1 $2 $3') || '3456 7890 1234'}
            </p>

            <div className="flex justify-between">
              <div>
                <p className="text-white/50 text-xs">Customer ID</p>
                <p className="text-white font-mono font-semibold">{data.customerId}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">IFSC Code</p>
                <p className="text-white font-mono font-semibold">{data.ifscCode}</p>
              </div>
              <div>
                <p className="text-white/50 text-xs">Branch</p>
                <p className="text-white font-semibold text-xs">{data.branchName}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Account Details</h3>
          <CopyableField label="Account Number" value={data.accountNumber || '—'} />
          <CopyableField label="Customer ID" value={data.customerId || '—'} />
          <CopyableField label="IFSC Code" value={data.ifscCode || '—'} />
        </motion.div>

        {/* Products activated */}
        {data.recommendedProducts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-3">Products Activated</h3>
            <div className="space-y-2">
              {data.recommendedProducts.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-white/80">{p}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
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
          transition={{ delay: 0.65 }}
          className="text-center text-xs text-white/25"
        >
          Welcome aboard! Download YONO to start banking immediately.
        </motion.p>
      </div>
    </div>
  );
}
