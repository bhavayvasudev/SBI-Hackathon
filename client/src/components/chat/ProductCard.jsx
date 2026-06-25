import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

// Accent colors per product type — light mode palette
const TYPE_ACCENTS = {
  savings:    { bg: 'rgba(80,70,228,0.07)',  border: 'rgba(80,70,228,0.15)',  icon: '#5046e4',  bar: '#5046e4' },
  credit:     { bg: 'rgba(124,58,237,0.07)', border: 'rgba(124,58,237,0.15)', icon: '#7c3aed',  bar: '#7c3aed' },
  investment: { bg: 'rgba(16,185,129,0.07)', border: 'rgba(16,185,129,0.15)', icon: '#10b981',  bar: '#10b981' },
  insurance:  { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.18)', icon: '#d97706',  bar: '#f59e0b' },
  loan:       { bg: 'rgba(239,68,68,0.07)',  border: 'rgba(239,68,68,0.15)',  icon: '#ef4444',  bar: '#ef4444' },
};
const DEFAULT_ACCENT = { bg: 'rgba(80,70,228,0.07)', border: 'rgba(80,70,228,0.15)', icon: '#5046e4', bar: '#5046e4' };

function getAccent(type = '') {
  return TYPE_ACCENTS[type.toLowerCase()] || DEFAULT_ACCENT;
}

export default function ProductCard({ product, index }) {
  const accent = getAccent(product.type);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.09,
        type: 'spring',
        stiffness: 300,
        damping: 26,
      }}
      whileHover={{ y: -2, transition: { duration: 0.18 } }}
      className="rounded-[18px] p-5 cursor-default"
      style={{
        background: 'rgba(255,255,255,0.97)',
        border: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)',
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)'; }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: accent.bg, border: `1px solid ${accent.border}` }}
          >
            {product.icon}
          </div>
          <div>
            <h4 className="text-[14px] font-semibold leading-tight" style={{ color: '#1d1d1f' }}>
              {product.name}
            </h4>
            <p className="text-[11px] capitalize mt-0.5" style={{ color: '#8e8e93' }}>
              {product.type}
            </p>
          </div>
        </div>

        {/* Tag pill */}
        {product.tag && (
          <span
            className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: accent.bg,
              color: accent.icon,
              border: `1px solid ${accent.border}`,
            }}
          >
            {product.tag}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-[13px] leading-relaxed mb-3.5" style={{ color: '#6e6e73' }}>
        {product.description}
      </p>

      {/* Features */}
      <ul className="space-y-2 mb-4">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-[12px]" style={{ color: '#4e4e52' }}>
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <CheckCircle className="w-2.5 h-2.5" style={{ color: '#10b981' }} />
            </div>
            {f}
          </li>
        ))}
      </ul>

      {/* Highlight */}
      {product.highlight && (
        <div className="pt-3.5 mb-3.5" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <span className="text-[12px] font-semibold" style={{ color: accent.icon }}>
            {product.highlight}
          </span>
        </div>
      )}

      {/* Match score */}
      <div className="flex items-center gap-3">
        <div
          className="h-1.5 rounded-full flex-1 overflow-hidden"
          style={{ background: 'rgba(0,0,0,0.06)' }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, ${accent.bar}, ${accent.bar}bb)` }}
            initial={{ width: '0%' }}
            animate={{ width: `${product.suitabilityScore}%` }}
            transition={{ delay: index * 0.09 + 0.25, duration: 0.7, ease: 'easeOut' }}
          />
        </div>
        <span className="text-[11px] font-medium flex-shrink-0" style={{ color: '#8e8e93' }}>
          {product.suitabilityScore}% match
        </span>
      </div>
    </motion.div>
  );
}
