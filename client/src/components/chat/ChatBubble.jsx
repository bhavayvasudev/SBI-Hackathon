import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx('flex items-end gap-3 px-4', isUser ? 'flex-row-reverse' : 'flex-row')}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-lg shadow-indigo-500/20">
          H
        </div>
      )}

      <div
        className={clsx(
          'max-w-[75%] px-4 py-3 text-sm leading-relaxed',
          isUser ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-white/90'
        )}
      >
        {message.content}
        {isStreaming && !isUser && (
          <span className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 animate-pulse align-middle" />
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/15 flex items-center justify-center text-xs font-bold flex-shrink-0">
          U
        </div>
      )}
    </motion.div>
  );
}
