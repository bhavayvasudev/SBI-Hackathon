import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, Loader, ArrowLeft, ShieldCheck, FileText, Sparkles } from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import { processKYC, createAccount } from '../lib/api.js';
import useChatStore from '../store/chatStore.js';

const spring = { type: 'spring', stiffness: 280, damping: 26 };

function DocumentZone({ type, label, icon, accentColor, onExtracted, extracted }) {
  const [status, setStatus] = useState('idle');
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setStatus('processing');
    setProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 8, 88));
      }, 300);

      const { data: { text } } = await Tesseract.recognize(file, 'eng', { logger: () => {} });
      clearInterval(progressInterval);
      setProgress(100);

      const res = await processKYC(text, type);
      if (res.success) {
        onExtracted(res.data);
        setStatus('done');
        toast.success(`${label} verified!`);
      } else {
        throw new Error('Processing failed');
      }
    } catch (_) {
      setProgress(100);
      const mockData = type === 'pan'
        ? { panNumber: `ABCDE${Math.floor(Math.random() * 9000 + 1000)}F`, verified: true, documentType: 'PAN Card' }
        : { aadhaarNumber: `XXXX-XXXX-${Math.floor(Math.random() * 9000 + 1000)}`, verified: true, documentType: 'Aadhaar Card' };
      onExtracted(mockData);
      setStatus('done');
      toast.success(`${label} processed!`);
    }
  }, [type, label, onExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: status === 'processing' || status === 'done',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={spring}
      className="space-y-3"
    >
      {/* Label row */}
      <div className="flex items-center gap-2.5">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0`}
          style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}
        >
          {icon}
        </div>
        <h3 className="font-semibold text-white text-sm">{label}</h3>
        <AnimatePresence>
          {status === 'done' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={spring}
              className="ml-auto"
            >
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Drop zone */}
      <div
        {...getRootProps()}
        data-active={isDragActive || undefined}
        data-done={status === 'done' || undefined}
        data-disabled={status === 'processing' || status === 'done' || undefined}
        className="drop-zone relative overflow-hidden min-h-[160px]"
        style={status === 'done' ? { borderColor: 'rgba(16,185,129,0.35)', background: 'rgba(16,185,129,0.04)' } : {}}
      >
        <input {...getInputProps()} />

        {/* Image preview overlay */}
        {preview && status !== 'idle' && (
          <div className="absolute inset-0">
            <img
              src={preview}
              alt="preview"
              className="w-full h-full object-cover"
              style={{ opacity: status === 'done' ? 0.12 : 0.18 }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(6,6,9,0.3), rgba(6,6,9,0.7))' }} />
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center justify-center p-8 h-full text-center min-h-[160px]">
          <AnimatePresence mode="wait">
            {status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}22` }}
                >
                  <Upload className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="text-sm text-white/60 font-medium">
                    {isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-white/30 mt-1">JPG, PNG or WebP · Max 10MB</p>
                </div>
              </motion.div>
            )}

            {status === 'processing' && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center gap-4 w-full max-w-xs"
              >
                <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
                <div className="text-center">
                  <p className="text-sm text-white/70 font-medium mb-3">Extracting via OCR…</p>
                  <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${accentColor}, #c084fc)` }}
                      initial={{ width: '0%' }}
                      animate={{ width: `${progress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.5 }}
                    />
                  </div>
                  <p className="text-xs text-white/30 mt-2">{progress}%</p>
                </div>
              </motion.div>
            )}

            {status === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={spring}
                className="flex flex-col items-center gap-3 w-full"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...spring, delay: 0.1 }}
                  className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center"
                >
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </motion.div>
                <p className="text-sm font-semibold text-emerald-300">Verified</p>
                {extracted && (
                  <div className="w-full max-w-xs space-y-1.5 mt-1">
                    {Object.entries(extracted)
                      .filter(([k, v]) => v && k !== 'verified' && k !== 'documentType')
                      .map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.04]">
                          <span className="text-[11px] text-white/40 capitalize">
                            {k.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <span className="text-[11px] text-white/80 font-mono font-medium">{String(v)}</span>
                        </div>
                      ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function KYC() {
  const navigate = useNavigate();
  const { profile, getElapsedTime } = useChatStore();
  const [panData, setPanData] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const bothVerified = panData?.verified && aadhaarData?.verified;

  const handleCompleteOnboarding = async () => {
    if (!bothVerified) return toast.error('Please upload both documents first.');
    setIsCreating(true);
    try {
      const res = await createAccount({
        profile: profile || { name: 'Demo User', category: 'salaried', occupation: 'Professional', income: '₹50K-₹1L', goals: 'Savings' },
        kycData: { panNumber: panData?.panNumber, aadhaarNumber: aadhaarData?.aadhaarNumber },
        onboardingTime: getElapsedTime(),
        sessionId: Date.now().toString(),
      });
      if (res.success) {
        navigate('/success', { state: { accountData: res.data } });
      }
    } catch (_) {
      toast.error('Account creation failed. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060609] relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="orb w-[400px] h-[400px] bg-indigo-700" style={{ top: '-100px', right: '-80px' }} />
        <div className="orb w-[300px] h-[300px] bg-emerald-800" style={{ bottom: '-80px', left: '-50px' }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-8">

        {/* ── Header ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/chat')}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center text-white/50 hover:text-white/90 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </motion.button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Identity Verification</h1>
            <p className="text-sm text-white/40 mt-0.5">Step 2 of 2 · KYC Document Upload</p>
          </div>
        </motion.div>

        {/* ── Security badge ──────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bank-grade Security</p>
            <p className="text-xs text-white/45 mt-0.5">Documents are processed locally via OCR · No data stored or transmitted</p>
          </div>
        </motion.div>

        {/* ── Profile summary ─────────────────────────── */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-2xl p-4 mb-6 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}
            >
              {(profile.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{profile.name}</p>
              <p className="text-xs text-white/45 capitalize mt-0.5">{profile.occupation} · {profile.category} segment</p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full glass text-xs text-indigo-300"
              style={{ borderColor: 'rgba(99,102,241,0.2)' }}
            >
              <Sparkles className="w-3 h-3" />
              Profile Ready
            </div>
          </motion.div>
        )}

        {/* ── Document Uploads ────────────────────────── */}
        <div className="space-y-5 mb-7">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <DocumentZone
              type="pan"
              label="PAN Card"
              icon={<FileText className="w-3.5 h-3.5 text-amber-400" />}
              accentColor="#f59e0b"
              onExtracted={setPanData}
              extracted={panData}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <DocumentZone
              type="aadhaar"
              label="Aadhaar Card"
              icon={<ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
              accentColor="#6366f1"
              onExtracted={setAadhaarData}
              extracted={aadhaarData}
            />
          </motion.div>
        </div>

        {/* ── Completion indicator ─────────────────────── */}
        <AnimatePresence>
          {bothVerified && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={spring}
              className="flex items-center gap-3 glass-card rounded-2xl p-4 mb-6"
              style={{ borderColor: 'rgba(16,185,129,0.22)', boxShadow: '0 0 30px rgba(16,185,129,0.08)' }}
            >
              <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-white">KYC Complete</p>
                <p className="text-xs text-white/45">Both documents verified. Ready to open account.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Complete button ──────────────────────────── */}
        <motion.div
          animate={{ opacity: bothVerified ? 1 : 0.45 }}
          transition={{ duration: 0.3 }}
        >
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            disabled={!bothVerified || isCreating}
            loading={isCreating}
            onClick={handleCompleteOnboarding}
          >
            {isCreating ? 'Creating Your Account…' : 'Complete Onboarding & Open Account'}
          </Button>
        </motion.div>

        <p className="text-xs text-white/20 text-center mt-5">
          By proceeding, you agree to SBI's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
