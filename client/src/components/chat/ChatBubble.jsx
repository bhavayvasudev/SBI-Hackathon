import { motion } from 'framer-motion';

export default function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse pl-12' : 'flex-row pr-12'}`}
    >
      {/* AI avatar */}
      {!isUser && (
        <div
          className="w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0 self-end mb-0.5"
          style={{
            background: 'linear-gradient(135deg, #5046e4, #7c3aed)',
            boxShadow: '0 2px 8px rgba(80,70,228,0.22)',
          }}
        >
          H
        </div>
      )}

      {/* Bubble */}
      <div
        className="px-[16px] py-[12px] whitespace-pre-wrap"
        style={{
          maxWidth: '80%',
          fontSize: '15px',
          lineHeight: '1.65',
          ...(isUser
            ? {
                background: 'linear-gradient(145deg, #5046e4 0%, #6d28d9 100%)',
                borderRadius: '20px 20px 6px 20px',
                color: '#ffffff',
                boxShadow: '0 3px 14px rgba(80,70,228,0.26), inset 0 1px 0 rgba(255,255,255,0.12)',
              }
            : {
                background: 'rgba(255,255,255,0.97)',
                borderRadius: '20px 20px 20px 6px',
                color: '#1d1d1f',
                border: '1px solid rgba(0,0,0,0.07)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
              }),
        }}
      >
        {message.content}
        {isStreaming && !isUser && (
          <span
            style={{
              display: 'inline-block',
              width: '2px',
              height: '14px',
              marginLeft: '2px',
              verticalAlign: 'middle',
              borderRadius: '2px',
              background: '#5046e4',
              animation: 'hyperone-cursor 0.75s ease-in-out infinite',
              opacity: 0.7,
            }}
          />
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 self-end mb-0.5"
          style={{
            background: 'rgba(0,0,0,0.07)',
            color: '#6e6e73',
            border: '1px solid rgba(0,0,0,0.09)',
          }}
        >
          U
        </div>
      )}

      <style>{`
        @keyframes hyperone-cursor {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}
