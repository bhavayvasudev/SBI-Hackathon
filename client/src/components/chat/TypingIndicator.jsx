import { motion } from 'framer-motion';

export default function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-3 px-4"
    >
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
        H
      </div>
      <div className="chat-bubble-ai px-4 py-3">
        <div className="typing-dots flex gap-1 items-center h-4">
          <span />
          <span />
          <span />
        </div>
      </div>
    </motion.div>
  );
}
