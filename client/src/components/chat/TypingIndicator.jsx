import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="flex items-end gap-2.5 pr-12"
    >
      {/* Avatar — matches ChatBubble AI avatar */}
      <div
        className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 self-end"
        style={{
          background: 'linear-gradient(135deg, #5046e4, #7c3aed)',
          boxShadow: '0 2px 8px rgba(80,70,228,0.22)',
        }}
      >
        H
      </div>

      {/* Bubble — matches .chat-bubble-ai light style */}
      <div
        className="px-[18px] py-[14px]"
        style={{
          background: 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(0,0,0,0.07)',
          borderRadius: '20px 20px 20px 6px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        <div className="flex gap-[5px] items-center" style={{ height: '1rem' }}>
          {[0, 1, 2].map(i => (
            <span
              key={i}
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                borderRadius: '50%',
                background: '#8e8e93',
                animation: `typing-bounce 1.5s ease-in-out infinite`,
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
