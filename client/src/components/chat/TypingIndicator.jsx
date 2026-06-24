import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.22 }}
      className="flex items-end gap-2.5 px-2"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
          boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
        }}
      >
        H
      </div>
      <div className="chat-bubble-ai px-4 py-3.5">
        <div className="typing-dots flex gap-1.5 items-center" style={{ height: '1rem' }}>
          <span />
          <span />
          <span />
        </div>
      </div>
    </motion.div>
  );
}
