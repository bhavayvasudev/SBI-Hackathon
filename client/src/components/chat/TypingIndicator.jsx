import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 12, flexShrink: 0,
        background: 'linear-gradient(135deg, #0A1F6E, #0A58F5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 16px rgba(10,88,245,0.28)',
      }}>
        <Zap style={{ width: 18, height: 18, color: 'white' }} />
      </div>

      <div style={{ paddingTop: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0A58F5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            HyperOne AI
          </span>
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }}
          />
          <span style={{ fontSize: 11, color: '#8e8e93' }}>Thinking…</span>
        </div>

        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
              style={{
                display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
                background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)',
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
