import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

function parseBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**')
      ? <strong key={i} style={{ fontWeight: 700, color: '#0A1F6E' }}>{p.slice(2, -2)}</strong>
      : p
  );
}

function renderAIContent(text) {
  if (!text) return null;
  const result = [];
  const lines = text.split('\n');
  let listItems = [];

  const flushList = (key) => {
    if (!listItems.length) return;
    result.push(<div key={`l-${key}`} style={{ marginBottom: 8 }}>{listItems}</div>);
    listItems = [];
  };

  lines.forEach((line, i) => {
    if (!line.trim()) {
      flushList(i);
      result.push(<div key={i} style={{ height: 6 }} />);
      return;
    }
    if (/^#{1,3}\s/.test(line)) {
      flushList(i);
      result.push(
        <p key={i} style={{ fontSize: 14, fontWeight: 700, color: '#0A1F6E', margin: '14px 0 6px', letterSpacing: '-0.01em' }}>
          {parseBold(line.replace(/^#{1,3}\s*/, ''))}
        </p>
      );
      return;
    }
    if (/^[-•*]\s/.test(line)) {
      listItems.push(
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'linear-gradient(135deg, #0A2A8A, #0A58F5)', flexShrink: 0, marginTop: 9 }} />
          <span style={{ fontSize: 15, lineHeight: 1.75, color: '#1a1a2e' }}>{parseBold(line.replace(/^[-•*]\s/, ''))}</span>
        </div>
      );
      return;
    }
    if (/^\d+\.\s/.test(line)) {
      const num = line.match(/^(\d+)/)[1];
      listItems.push(
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 6 }}>
          <span style={{ minWidth: 20, height: 20, borderRadius: '50%', background: 'rgba(10,88,245,0.08)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#0A58F5', marginTop: 3 }}>
            {num}
          </span>
          <span style={{ fontSize: 15, lineHeight: 1.75, color: '#1a1a2e' }}>{parseBold(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
      return;
    }
    flushList(i);
    result.push(
      <p key={i} style={{ fontSize: 15, lineHeight: 1.85, color: '#1a1a2e', margin: '0 0 2px' }}>
        {parseBold(line)}
      </p>
    );
  });
  flushList('end');
  return result;
}

export default function ChatBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, x: 16 }}
        animate={{ opacity: 1, y: 0, x: 0 }}
        transition={{ duration: 0.24, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ display: 'flex', justifyContent: 'flex-end', paddingLeft: '15%' }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #0A2A8A 0%, #0A58F5 100%)',
          borderRadius: '22px 22px 6px 22px',
          padding: '14px 22px',
          boxShadow: '0 6px 24px rgba(10,88,245,0.24), inset 0 1px 0 rgba(255,255,255,0.12)',
        }}>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: '#ffffff', margin: 0 }}>
            {message.content}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
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

      <div style={{ flex: 1, paddingTop: 2, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0A58F5', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            HyperOne AI
          </span>
          <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#10b981' }} />
          <span style={{ fontSize: 11, color: '#8e8e93' }}>Financial Copilot</span>
        </div>

        <div style={{ paddingRight: '8%' }}>
          {renderAIContent(message.content)}
          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                display: 'inline-block', width: 2, height: 18,
                marginLeft: 3, verticalAlign: 'middle',
                borderRadius: 2, background: '#0A58F5',
              }}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
