import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import {
  Upload, CheckCircle, Loader, ShieldCheck, FileText,
  Sparkles, Zap, Check, ArrowRight, Lock, Cpu,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { processKYC, createAccount } from '../lib/api.js';
import useChatStore from '../store/chatStore.js';

const KYC_CSS = `
  @keyframes kycFloat1 {
    0%, 100% { transform: translateY(0px) rotate(-2deg); }
    50%       { transform: translateY(-12px) rotate(0deg); }
  }
  @keyframes kycFloat2 {
    0%, 100% { transform: translateY(0px) rotate(3deg); }
    50%       { transform: translateY(-10px) rotate(5deg); }
  }
  @keyframes kycFloat3 {
    0%, 100% { transform: translateY(0px) scale(1); }
    50%       { transform: translateY(-14px) scale(1.04); }
  }
  @keyframes kycFloat4 {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  .kyc-f1 { animation: kycFloat1 5s ease-in-out infinite; will-change: transform; }
  .kyc-f2 { animation: kycFloat2 6.5s ease-in-out infinite 1.2s; will-change: transform; }
  .kyc-f3 { animation: kycFloat3 4s ease-in-out infinite 2s; will-change: transform; }
  .kyc-f4 { animation: kycFloat4 3.8s ease-in-out infinite 0.7s; will-change: transform; }
`;

const FEATURES = [
  { icon: <Cpu style={{ width: 13, height: 13 }} />,        label: 'OCR-powered extraction',      color: '#60a5fa' },
  { icon: <ShieldCheck style={{ width: 13, height: 13 }} />, label: 'Aadhaar & PAN verification', color: '#34d399' },
  { icon: <Lock style={{ width: 13, height: 13 }} />,        label: 'RBI-compliant onboarding',    color: '#a78bfa' },
  { icon: <Zap style={{ width: 13, height: 13 }} />,         label: 'End-to-end encryption',       color: '#fbbf24' },
  { icon: <Sparkles style={{ width: 13, height: 13 }} />,    label: 'Instant account activation',  color: '#f472b6' },
];

const TIMELINE_STEPS = [
  'Upload documents',
  'AI OCR extraction',
  'Identity verification',
  'Account activation',
];

// ─── Floating card illustrations ────────────────────────────────────────────
function FloatingIllustrations() {
  return (
    <div style={{ position: 'relative', height: '230px', width: '100%' }}>
      {/* Aadhaar card */}
      <div className="kyc-f1" style={{
        position: 'absolute', left: '4%', top: '8px',
        width: '172px', height: '104px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.18), rgba(255,255,255,0.07))',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.22)',
        boxShadow: '0 20px 48px rgba(0,0,0,0.35)',
        padding: '12px 14px', overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
          <div style={{ width: '18px', height: '18px', borderRadius: '4px', background: 'rgba(255,165,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px' }}>🏛</div>
          <div>
            <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.6px', textTransform: 'uppercase' }}>Government of India</div>
            <div style={{ fontSize: '7.5px', fontWeight: 800, color: 'rgba(255,255,255,0.95)' }}>आधार</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <div style={{ width: '32px', height: '36px', borderRadius: '5px', background: 'rgba(255,255,255,0.14)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.25)', marginBottom: '4px', width: '85%' }} />
            <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.18)', marginBottom: '5px', width: '55%' }} />
            <div style={{ fontSize: '8px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '1.5px', fontFamily: 'monospace' }}>XXXX XXXX 4521</div>
          </div>
        </div>
      </div>

      {/* PAN card */}
      <div className="kyc-f2" style={{
        position: 'absolute', right: '4%', top: '48px',
        width: '156px', height: '92px', borderRadius: '12px',
        background: 'linear-gradient(135deg, rgba(245,158,11,0.32), rgba(217,119,6,0.16))',
        border: '1px solid rgba(245,158,11,0.32)',
        boxShadow: '0 18px 40px rgba(0,0,0,0.3)',
        padding: '12px 14px', overflow: 'hidden',
      }}>
        <div style={{ fontSize: '5px', color: 'rgba(255,255,255,0.42)', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: '3px' }}>Income Tax Dept · Govt of India</div>
        <div style={{ fontSize: '6px', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginBottom: '8px' }}>Permanent Account Number</div>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#FCD34D', letterSpacing: '2px', fontFamily: 'monospace', marginBottom: '7px' }}>ABCDE1234F</div>
        <div style={{ height: '2px', borderRadius: '1px', background: 'rgba(255,255,255,0.12)' }} />
      </div>

      {/* Shield orb */}
      <div className="kyc-f3" style={{
        position: 'absolute', left: '44%', bottom: '18px',
        width: '56px', height: '56px', borderRadius: '50%',
        background: 'rgba(16,185,129,0.18)',
        border: '2px solid rgba(16,185,129,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 32px rgba(16,185,129,0.3), 0 8px 24px rgba(0,0,0,0.2)',
      }}>
        <ShieldCheck style={{ width: 24, height: 24, color: '#34d399' }} />
      </div>

      {/* AI badge */}
      <div className="kyc-f4" style={{
        position: 'absolute', left: '10%', bottom: '10px',
        padding: '7px 14px', borderRadius: '100px',
        background: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.2)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', gap: '6px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}>
        <Cpu style={{ width: 11, height: 11, color: '#60a5fa' }} />
        <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.85)' }}>AI OCR Active</span>
      </div>

      {/* Glow under cards */}
      <div style={{
        position: 'absolute', bottom: '-16px', left: '50%', transform: 'translateX(-50%)',
        width: '200px', height: '50px',
        background: 'radial-gradient(ellipse, rgba(255,255,255,0.12), transparent 70%)',
        filter: 'blur(18px)', pointerEvents: 'none',
      }} />
    </div>
  );
}

// ─── Verification timeline ───────────────────────────────────────────────────
function VerificationTimeline({ panDone, aadhaarDone }) {
  const bothDone = panDone && aadhaarDone;
  const statuses = [panDone || aadhaarDone, bothDone, bothDone, false];

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {TIMELINE_STEPS.map((step, i) => (
        <motion.div
          key={step}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.07, type: 'spring', stiffness: 320, damping: 28 }}
          style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
            <motion.div
              animate={{ background: statuses[i] ? '#10b981' : 'rgba(0,0,0,0.06)' }}
              transition={{ duration: 0.3 }}
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                border: statuses[i] ? 'none' : '2px solid rgba(0,0,0,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              {statuses[i] && <Check style={{ width: 10, height: 10, color: 'white' }} />}
            </motion.div>
            {i < TIMELINE_STEPS.length - 1 && (
              <div style={{
                width: '1.5px', height: '22px', margin: '2px 0',
                background: statuses[i] ? 'rgba(16,185,129,0.3)' : 'rgba(0,0,0,0.07)',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
          <p style={{
            fontSize: '13px',
            color: statuses[i] ? '#10b981' : '#94a3b8',
            fontWeight: statuses[i] ? 500 : 400,
            paddingTop: '1px',
            paddingBottom: i < TIMELINE_STEPS.length - 1 ? '20px' : '0',
            transition: 'color 0.3s',
          }}>
            {step}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── EditableField (light theme) ────────────────────────────────────────────
function EditableField({ label, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const floated = focused || !!value;

  return (
    <div style={{
      position: 'relative', height: '56px', borderRadius: '12px',
      background: focused ? '#ffffff' : '#f8fafc',
      border: `1.5px solid ${focused ? '#0A58F5' : 'rgba(0,0,0,0.09)'}`,
      boxShadow: focused ? '0 0 0 3px rgba(10,88,245,0.08)' : 'none',
      transition: 'all 0.2s ease',
    }}>
      <label style={{
        position: 'absolute', left: '14px',
        top: floated ? '8px' : '50%',
        transform: floated ? 'translateY(0) scale(0.78)' : 'translateY(-50%)',
        transformOrigin: 'left',
        fontSize: '13px',
        color: focused ? '#0A58F5' : '#94a3b8',
        fontWeight: 500, transition: 'all 0.2s ease', pointerEvents: 'none',
      }}>
        {label}
      </label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          position: 'absolute', bottom: '8px', left: '14px', right: '14px',
          background: 'transparent', border: 'none', outline: 'none',
          fontSize: '14px', fontWeight: 500, color: '#0A0A0A', fontFamily: 'inherit',
        }}
      />
    </div>
  );
}

// ─── Demo modal ─────────────────────────────────────────────────────────────
function DemoModal({ onClose, onConfirm }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.45)',
        backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: '#ffffff', borderRadius: '28px', padding: '44px 40px',
          maxWidth: '420px', width: '100%',
          boxShadow: '0 40px 100px rgba(0,0,0,0.18)', textAlign: 'center',
        }}
      >
        <div style={{
          width: '68px', height: '68px', borderRadius: '20px',
          background: 'rgba(245,158,11,0.1)', border: '1.5px solid rgba(245,158,11,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: '30px',
        }}>⚡</div>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#0A0A0A', marginBottom: '12px' }}>Demo Mode</h2>
        <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.65, marginBottom: '8px' }}>
          You are bypassing identity verification.
        </p>
        <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.65, marginBottom: '0' }}>
          This option exists solely for hackathon demonstrations and will not be available in production.
        </p>
        <p style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A', margin: '24px 0' }}>Continue?</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              flex: 1, height: '52px', borderRadius: '100px',
              border: '1.5px solid rgba(0,0,0,0.12)', background: 'transparent',
              fontWeight: 600, fontSize: '14px', color: '#374151', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >Cancel</motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 12px 32px rgba(10,88,245,0.38)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onConfirm}
            style={{
              flex: 1, height: '52px', borderRadius: '100px',
              background: 'linear-gradient(135deg, #021B79, #0A58F5)',
              border: 'none', fontWeight: 600, fontSize: '14px', color: '#ffffff',
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 8px 24px rgba(10,88,245,0.28)',
            }}
          >Continue in Demo Mode</motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DocumentZone (light theme, all logic preserved) ────────────────────────
function DocumentZone({ type, label, icon, accentColor, onExtracted, extracted }) {
  const [status, setStatus] = useState('idle');
  const [preview, setPreview] = useState(null);
  const [progress, setProgress] = useState(0);

  const onDrop = useCallback(async (files) => {
    const file = files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setStatus('processing');
    setProgress(10);

    let progressInterval = null;
    try {
      progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 8, 88));
      }, 300);

      // DYNAMIC IMPORT: Prevents Vite top-level crashes and bundle evaluation errors
      const TesseractModule = await import('tesseract.js');
      let text = '';

      // Gracefully handle both v5 and v4 API structures
      if (typeof TesseractModule.createWorker === 'function') {
        const worker = await TesseractModule.createWorker('eng');
        const result = await worker.recognize(file);
        text = result.data.text;
        await worker.terminate();
      } else if (TesseractModule.default && typeof TesseractModule.default.recognize === 'function') {
        const result = await TesseractModule.default.recognize(file, 'eng');
        text = result.data.text;
      } else {
        throw new Error('Tesseract initialization failed');
      }

      clearInterval(progressInterval);
      progressInterval = null;
      setProgress(100);

      const res = await processKYC(text, type);
      if (res.success) {
        onExtracted(res.data);
        setStatus('done');
        toast.success(`${label} verified!`);
      } else {
        throw new Error(res.error || 'Processing failed');
      }
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      setProgress(0);
      setStatus('idle');
      toast.error(err?.message || `Could not verify ${label}. Please upload a valid ${type === 'pan' ? 'PAN card' : 'Aadhaar card'} image.`);
    }
  }, [type, label, onExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    maxFiles: 1,
    disabled: status === 'processing' || status === 'done',
  });

  const isDone = status === 'done';
  const isProcessing = status === 'processing';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
    >
      <motion.div
        {...getRootProps()}
        whileHover={status === 'idle' ? {
          scale: 1.015, y: -2,
          boxShadow: `0 12px 40px rgba(0,0,0,0.09), 0 0 0 2px ${accentColor}28`,
        } : {}}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
        style={{
          borderRadius: '20px',
          border: `2px ${isDone ? 'solid' : 'dashed'} ${
            isDone ? 'rgba(16,185,129,0.28)' :
            isDragActive ? accentColor :
            'rgba(0,0,0,0.1)'
          }`,
          background: isDone ? 'rgba(16,185,129,0.04)' : isDragActive ? `${accentColor}06` : '#ffffff',
          cursor: isProcessing || isDone ? 'default' : 'pointer',
          overflow: 'hidden',
          boxShadow: isDragActive
            ? `0 0 0 4px ${accentColor}18, 0 8px 32px rgba(0,0,0,0.07)`
            : '0 2px 12px rgba(0,0,0,0.05)',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      >
        <input {...getInputProps()} />

        {/* Card header */}
        <div style={{
          padding: '16px 20px',
          borderBottom: `1px solid ${isDone ? 'rgba(16,185,129,0.1)' : 'rgba(0,0,0,0.05)'}`,
          display: 'flex', alignItems: 'center', gap: '12px',
          background: isDone ? 'rgba(16,185,129,0.03)' : 'rgba(0,0,0,0.01)',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '11px', flexShrink: 0,
            background: `${accentColor}14`, border: `1.5px solid ${accentColor}28`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 600, fontSize: '14px', color: '#0A0A0A', marginBottom: '2px' }}>{label}</p>
            <p style={{ fontSize: '11px', color: '#94a3b8' }}>JPG, PNG or WebP · Max 10MB</p>
          </div>
          <AnimatePresence>
            {isDone && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  background: 'rgba(16,185,129,0.12)', border: '1.5px solid rgba(16,185,129,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Check style={{ width: 14, height: 14, color: '#10b981' }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Card body */}
        <div style={{ padding: '24px', minHeight: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Preview overlay */}
          {preview && status !== 'idle' && (
            <div style={{ position: 'absolute', inset: 0 }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: isDone ? 0.06 : 0.12 }} />
              <div style={{ position: 'absolute', inset: 0, background: isDone ? 'rgba(240,253,244,0.92)' : 'rgba(255,255,255,0.88)' }} />
            </div>
          )}

          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.div key="idle"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', textAlign: 'center' }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '16px',
                    background: `${accentColor}10`, border: `1.5px solid ${accentColor}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Upload style={{ width: 22, height: 22, color: accentColor }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
                      {isDragActive ? 'Drop here' : 'Drag & drop or click to upload'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>Accepts JPG, PNG, WebP</p>
                  </div>
                </motion.div>
              )}

              {status === 'processing' && (
                <motion.div key="processing"
                  initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.92 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '240px', textAlign: 'center' }}
                >
                  <Loader style={{ width: 28, height: 28, color: accentColor }} className="animate-spin" />
                  <div style={{ width: '100%' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '10px' }}>Extracting via OCR…</p>
                    <div style={{ width: '100%', height: '4px', borderRadius: '100px', background: 'rgba(0,0,0,0.07)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: '0%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ ease: 'easeOut', duration: 0.5 }}
                        style={{ height: '100%', borderRadius: '100px', background: `linear-gradient(90deg, ${accentColor}, #a78bfa)` }}
                      />
                    </div>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '6px' }}>{progress}%</p>
                  </div>
                </motion.div>
              )}

              {isDone && (
                <motion.div key="done"
                  initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26 }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '100%' }}
                >
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 380, damping: 22, delay: 0.1 }}
                    style={{
                      width: '48px', height: '48px', borderRadius: '50%',
                      background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CheckCircle style={{ width: 22, height: 22, color: '#10b981' }} />
                  </motion.div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>Verified</p>
                  {extracted && (
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                      {Object.entries(extracted)
                        .filter(([k, v]) => v && k !== 'verified' && k !== 'documentType')
                        .map(([k, v]) => (
                          <div key={k} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '6px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.06)',
                          }}>
                            <span style={{ fontSize: '11px', color: '#6b7280', textTransform: 'capitalize' }}>
                              {k.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, fontFamily: 'monospace' }}>
                              {String(v)}
                            </span>
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
    </motion.div>
  );
}

// ─── Main KYC page ───────────────────────────────────────────────────────────
export default function KYC() {
  const navigate = useNavigate();
  const { profile, getElapsedTime } = useChatStore();
  const [panData, setPanData] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const [showDemoModal, setShowDemoModal] = useState(false);

  const bothVerified = panData?.verified && aadhaarData?.verified;

  useEffect(() => {
    if (bothVerified) {
      setReviewData({
        name: profile?.name || '',
        panNumber: panData?.panNumber || '',
        aadhaarNumber: aadhaarData?.aadhaarNumber || '',
        occupation: profile?.occupation || '',
        income: profile?.income || '',
      });
    }
  }, [bothVerified]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCompleteOnboarding = async () => {
    if (!bothVerified) return toast.error('Please upload both documents first.');
    setIsCreating(true);
    try {
      const mergedProfile = {
        ...(profile || { category: 'salaried', goals: 'Savings' }),
        name: reviewData.name || profile?.name || 'Demo User',
        occupation: reviewData.occupation || profile?.occupation || 'Professional',
        income: reviewData.income || profile?.income || '₹50K-₹1L',
      };
      const res = await createAccount({
        profile: mergedProfile,
        kycData: {
          panNumber: reviewData.panNumber || panData?.panNumber,
          panName: panData?.name || null,
          panDob: panData?.dob || null,
          aadhaarNumber: reviewData.aadhaarNumber || aadhaarData?.aadhaarNumber,
          aadhaarName: aadhaarData?.name || null,
          aadhaarDob: aadhaarData?.dob || null,
          aadhaarGender: aadhaarData?.gender || null,
        },
        onboardingTime: getElapsedTime ? getElapsedTime() : 120,
        sessionId: Date.now().toString(),
      });
      if (res.success) {
        navigate('/success', { state: { accountData: res.data }, replace: true });
      }
    } catch (_) {
      toast.error('Account creation failed. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDemoSkip = async () => {
    setShowDemoModal(false);
    setIsCreating(true);
    try {
      const mergedProfile = {
        ...(profile || { category: 'salaried', goals: 'Savings' }),
        name: profile?.name || 'Demo User',
        occupation: profile?.occupation || 'Professional',
        income: profile?.income || '₹50K-₹1L',
      };
      const res = await createAccount({
        profile: mergedProfile,
        kycData: {
          panNumber: 'DEMOKYC001P',
          panName: profile?.name || 'Demo User',
          panDob: '01/01/1990',
          aadhaarNumber: '0000 0000 0000',
          aadhaarName: profile?.name || 'Demo User',
          aadhaarDob: '01/01/1990',
          aadhaarGender: 'M',
        },
        onboardingTime: getElapsedTime ? getElapsedTime() : 30,
        sessionId: Date.now().toString(),
      });
      if (res.success) {
        navigate('/success', { state: { accountData: res.data }, replace: true });
      }
    } catch (_) {
      toast.error('Demo skip failed. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'IBM Plex Sans', -apple-system, BlinkMacSystemFont, sans-serif",
      background: '#EEF1F8',
    }}>
      <style>{KYC_CSS}</style>

      {/* ── Left panel (sticky sidebar) ──────────────────────────────── */}
      <div
        className="hidden lg:flex"
        style={{
          width: '40%', minWidth: '340px',
          position: 'sticky', top: 0, height: '100vh', alignSelf: 'flex-start',
          background: 'linear-gradient(135deg, #021B79 0%, #0534A6 50%, #0A58F5 100%)',
          flexDirection: 'column', padding: '44px 40px',
          overflow: 'hidden',
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-60px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(10,88,245,0.4)', filter: 'blur(80px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'rgba(2,27,121,0.6)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
        >
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap style={{ width: 16, height: 16, color: '#ffffff' }} />
          </div>
          <span style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.3px' }}>HyperOne</span>
        </motion.div>

        {/* Floating illustrations */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          style={{ flex: 1, display: 'flex', alignItems: 'center' }}
        >
          <FloatingIllustrations />
        </motion.div>

        {/* Headline + copy + features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.14 }}
          style={{ flexShrink: 0, position: 'relative', zIndex: 1 }}
        >
          <h1 style={{
            fontSize: 'clamp(34px, 3.5vw, 52px)', fontWeight: 800, lineHeight: 1.08,
            color: '#ffffff', letterSpacing: '-1.5px', marginBottom: '14px',
          }}>
            Identity,<br />Verified.
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, maxWidth: '290px', marginBottom: '28px' }}>
            Verify your identity securely using AI-powered document analysis and RBI-compliant verification.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.32 + i * 0.07, type: 'spring', stiffness: 320, damping: 28 }}
                style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <div style={{
                  width: '26px', height: '26px', borderRadius: '8px', flexShrink: 0,
                  background: `${f.color}18`, border: `1px solid ${f.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: f.color,
                }}>
                  {f.icon}
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{f.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Right panel ──────────────────────────────────────────────── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        padding: 'clamp(24px, 4vw, 56px)',
        paddingTop: 'clamp(40px, 6vh, 72px)',
        paddingBottom: 'clamp(40px, 6vh, 72px)',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 28 }}
          style={{
            maxWidth: '620px', width: '100%',
            background: 'rgba(255,255,255,0.93)',
            backdropFilter: 'blur(30px)', WebkitBackdropFilter: 'blur(30px)',
            borderRadius: '40px',
            padding: 'clamp(28px, 4vw, 52px)',
            boxShadow: '0 40px 100px rgba(0,0,0,0.08), 0 0 0 1px rgba(255,255,255,0.7)',
          }}
        >
          {/* Step indicator */}
          <div style={{ marginBottom: '36px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#0A58F5', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Step 2 of 3</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>Identity Verification</span>
            </div>
            <div style={{ height: '3px', borderRadius: '100px', background: '#f1f5f9', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '33%' }}
                animate={{ width: bothVerified ? '100%' : '66%' }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
                style={{ height: '100%', borderRadius: '100px', background: 'linear-gradient(90deg, #021B79, #0A58F5)' }}
              />
            </div>
          </div>

          {/* Heading */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginBottom: '28px' }}>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: 800, color: '#0A0A0A', letterSpacing: '-0.8px', marginBottom: '8px', lineHeight: 1.15 }}>
              Verify your identity.
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6 }}>
              Upload your documents to continue onboarding.
            </p>
          </motion.div>

          {/* Profile summary */}
          {profile && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '14px 18px', borderRadius: '16px',
                background: 'rgba(10,88,245,0.04)', border: '1px solid rgba(10,88,245,0.1)',
                marginBottom: '28px',
              }}
            >
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #021B79, #0A58F5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '15px', fontWeight: 700, color: '#ffffff',
                boxShadow: '0 4px 12px rgba(10,88,245,0.3)',
              }}>
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: '14px', color: '#0A0A0A' }}>{profile.name}</p>
                <p style={{ fontSize: '12px', color: '#64748b', textTransform: 'capitalize' }}>{profile.occupation} · {profile.category} segment</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 11px', borderRadius: '100px', background: 'rgba(10,88,245,0.08)', border: '1px solid rgba(10,88,245,0.15)', flexShrink: 0 }}>
                <Sparkles style={{ width: 11, height: 11, color: '#0A58F5' }} />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#0A58F5' }}>Profile Ready</span>
              </div>
            </motion.div>
          )}

          {/* Upload zones */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px' }}>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}>
              <DocumentZone
                type="pan"
                label="PAN Card"
                icon={<FileText style={{ width: 16, height: 16, color: '#f59e0b' }} />}
                accentColor="#f59e0b"
                onExtracted={setPanData}
                extracted={panData}
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <DocumentZone
                type="aadhaar"
                label="Aadhaar Card"
                icon={<ShieldCheck style={{ width: 16, height: 16, color: '#0A58F5' }} />}
                accentColor="#0A58F5"
                onExtracted={setAadhaarData}
                extracted={aadhaarData}
              />
            </motion.div>
          </div>

          {/* Review details (after both verified) */}
          <AnimatePresence>
            {bothVerified && (
              <motion.div
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                style={{
                  borderRadius: '20px', background: 'rgba(16,185,129,0.04)',
                  border: '1px solid rgba(16,185,129,0.15)',
                  padding: '24px', marginBottom: '24px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                  <CheckCircle style={{ width: 15, height: 15, color: '#10b981' }} />
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#0A0A0A' }}>Documents Verified — Review Your Details</h3>
                  <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#94a3b8' }}>Editable</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <EditableField label="Full Name" value={reviewData.name} onChange={v => setReviewData(d => ({ ...d, name: v }))} />
                  <EditableField label="PAN Number" value={reviewData.panNumber} onChange={v => setReviewData(d => ({ ...d, panNumber: v }))} />
                  <EditableField label="Aadhaar (Masked)" value={reviewData.aadhaarNumber} onChange={v => setReviewData(d => ({ ...d, aadhaarNumber: v }))} />
                  {(profile?.occupation || reviewData.occupation) && (
                    <EditableField label="Occupation" value={reviewData.occupation} onChange={v => setReviewData(d => ({ ...d, occupation: v }))} />
                  )}
                  {(profile?.income || reviewData.income) && (
                    <EditableField label="Monthly Income" value={reviewData.income} onChange={v => setReviewData(d => ({ ...d, income: v }))} />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Verification timeline */}
          <div style={{ marginBottom: '32px', padding: '20px 24px', borderRadius: '16px', background: '#f8fafc', border: '1px solid rgba(0,0,0,0.05)' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>Verification Steps</p>
            <VerificationTimeline panDone={!!panData?.verified} aadhaarDone={!!aadhaarData?.verified} />
          </div>

          {/* Primary CTA */}
          <motion.button
            whileHover={bothVerified && !isCreating ? { scale: 1.02, boxShadow: '0 16px 48px rgba(10,88,245,0.42)' } : {}}
            whileTap={bothVerified && !isCreating ? { scale: 0.98 } : {}}
            onClick={handleCompleteOnboarding}
            disabled={!bothVerified || isCreating}
            style={{
              width: '100%', minHeight: '64px', borderRadius: '100px',
              background: !bothVerified || isCreating ? '#e5e7eb' : 'linear-gradient(135deg, #021B79, #0A58F5)',
              border: 'none',
              color: !bothVerified || isCreating ? '#9ca3af' : '#ffffff',
              fontSize: '16px', fontWeight: 700,
              cursor: !bothVerified || isCreating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
              boxShadow: bothVerified && !isCreating ? '0 8px 32px rgba(10,88,245,0.3)' : 'none',
              fontFamily: 'inherit',
              transition: 'background 0.25s, box-shadow 0.25s, color 0.25s',
              marginBottom: '14px',
            }}
          >
            {isCreating ? (
              <><Loader style={{ width: 18, height: 18 }} className="animate-spin" />Creating Your Account…</>
            ) : (
              <><ShieldCheck style={{ width: 18, height: 18 }} />Verify &amp; Continue<ArrowRight style={{ width: 18, height: 18 }} /></>
            )}
          </motion.button>

          {/* Demo skip */}
          <motion.button
            whileHover={{ opacity: 0.75, borderColor: 'rgba(0,0,0,0.22)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !isCreating && setShowDemoModal(true)}
            style={{
              width: '100%', height: '48px', borderRadius: '100px',
              background: 'transparent', border: '1.5px dashed rgba(0,0,0,0.12)',
              color: '#94a3b8', fontSize: '13px', fontWeight: 500,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s',
            }}
          >
            <Zap style={{ width: 14, height: 14 }} />
            Skip Verification (Demo Only)
          </motion.button>

          <p style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center', marginTop: '20px' }}>
            By proceeding you agree to SBI's Terms of Service · Built for SBI HackFest 2026
          </p>
        </motion.div>
      </div>

      {/* Demo modal */}
      <AnimatePresence>
        {showDemoModal && (
          <DemoModal onClose={() => setShowDemoModal(false)} onConfirm={handleDemoSkip} />
        )}
      </AnimatePresence>
    </div>
  );
}
