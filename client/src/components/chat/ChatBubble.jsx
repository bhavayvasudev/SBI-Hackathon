import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={clsx('flex items-end gap-2.5 px-2', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {/* Avatar */}
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end mb-0.5"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
          }}
        >
          H
        </div>
      )}

      {/* Bubble */}
      <div
        className={clsx(
          'max-w-[78%] px-4 py-3 text-sm leading-[1.65]',
          isUser ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-white/90'
        )}
      >
        <span className="whitespace-pre-wrap">{message.content}</span>
        {isStreaming && !isUser && (
          <span
            className="inline-block w-[2px] h-[1.1em] ml-[2px] align-text-bottom rounded-sm"
            style={{
              background: '#818cf8',
              animation: 'blink-cursor 0.8s ease-in-out infinite',
            }}
          />
        )}
      </div>

      {isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 self-end mb-0.5"
          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          U
        </div>
      )}

      {/* Cursor keyframe inline — injected once */}
      <style>{`
        @keyframes blink-cursor {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
