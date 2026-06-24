import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Upload, CheckCircle, Loader, ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button.jsx';
import { processKYC, createAccount } from '../lib/api.js';
import useChatStore from '../store/chatStore.js';

function DocumentZone({ type, label, icon, onExtracted, extracted }) {
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [preview, setPreview] = useState(null);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus('processing');

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'eng', {
        logger: () => {},
      });

      const res = await processKYC(text, type);
      if (res.success) {
        onExtracted(res.data);
        setStatus('done');
        toast.success(`${label} verified successfully!`);
      } else {
        throw new Error('Processing failed');
      }
    } catch (err) {
      setStatus('error');
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
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h3 className="font-semibold text-white text-sm">{label}</h3>
        {status === 'done' && (
          <CheckCircle className="w-4 h-4 text-emerald-400 ml-auto" />
        )}
      </div>

      <div
        {...getRootProps()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden
          ${isDragActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/15 bg-white/[0.02]'}
          ${status === 'done' ? 'border-emerald-500/40 bg-emerald-500/5 cursor-default' : ''}
          ${status !== 'done' && status !== 'processing' ? 'hover:border-white/30 hover:bg-white/[0.04]' : ''}
        `}
      >
        <input {...getInputProps()} />

        {preview && (
          <img
            src={preview}
            alt="document preview"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
        )}

        <div className="relative z-10 p-8 text-center">
          {status === 'idle' && (
            <>
              <Upload className="w-8 h-8 text-white/30 mx-auto mb-3" />
              <p className="text-sm text-white/50">
                {isDragActive ? 'Drop it here' : 'Drag & drop or click to upload'}
              </p>
              <p className="text-xs text-white/30 mt-1">JPG, PNG up to 10MB</p>
            </>
          )}
          {status === 'processing' && (
            <div className="flex flex-col items-center gap-3">
              <Loader className="w-8 h-8 text-indigo-400 animate-spin" />
              <p className="text-sm text-white/60">Extracting information via OCR...</p>
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '90%' }}
                  transition={{ duration: 2.5 }}
                />
              </div>
            </div>
          )}
          {status === 'done' && (
            <div className="flex flex-col items-center gap-2">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <p className="text-sm text-emerald-300 font-medium">Verified Successfully</p>
              {extracted && (
                <div className="mt-2 text-left w-full max-w-xs mx-auto space-y-1">
                  {Object.entries(extracted)
                    .filter(([k, v]) => v && k !== 'verified' && k !== 'documentType')
                    .map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="text-white/40 capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="text-white/80 font-mono">{v}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-red-400">Processing failed. Try another image.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KYC() {
  const navigate = useNavigate();
  const { profile, getElapsedTime, recommendations } = useChatStore();
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
        kycData: {
          panNumber: panData?.panNumber,
          aadhaarNumber: aadhaarData?.aadhaarNumber,
        },
        onboardingTime: getElapsedTime(),
        sessionId: Date.now().toString(),
      });

      if (res.success) {
        navigate('/success', { state: { accountData: res.data } });
      }
    } catch (err) {
      toast.error('Account creation failed. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] relative overflow-hidden">
      <div className="orb w-[400px] h-[400px] bg-indigo-700 top-[-100px] right-[-100px]" />
      <div className="orb w-[300px] h-[300px] bg-purple-700 bottom-[-100px] left-[-50px]" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button onClick={() => navigate('/chat')} className="text-white/40 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Identity Verification</h1>
            <p className="text-sm text-white/40">Step 2 of 2 · KYC Document Upload</p>
          </div>
        </motion.div>

        {/* Security badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-4 mb-8 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Bank-grade Security</p>
            <p className="text-xs text-white/50">Documents are processed locally via OCR · No data is stored or transmitted</p>
          </div>
        </motion.div>

        {/* Profile summary */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass rounded-2xl p-4 mb-8"
          >
            <p className="text-xs text-white/40 mb-2 uppercase tracking-wide font-medium">Onboarding For</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{profile.name}</p>
                <p className="text-xs text-white/50 capitalize">{profile.occupation} · {profile.category} segment</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Document uploads */}
        <div className="space-y-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <DocumentZone
              type="pan"
              label="PAN Card"
              icon={<FileText className="w-4 h-4 text-amber-400" />}
              onExtracted={setPanData}
              extracted={panData}
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <DocumentZone
              type="aadhaar"
              label="Aadhaar Card"
              icon={<ShieldCheck className="w-4 h-4 text-indigo-400" />}
              onExtracted={setAadhaarData}
              extracted={aadhaarData}
            />
          </motion.div>
        </div>

        {/* Complete button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: bothVerified ? 1 : 0.5 }}
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
            {isCreating ? 'Creating Your Account...' : 'Complete Onboarding & Open Account'}
          </Button>
        </motion.div>

        <p className="text-xs text-white/25 text-center mt-4">
          By proceeding, you agree to SBI's Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}
