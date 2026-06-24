import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        delay: index * 0.1,
        duration: 0.35,
        type: 'spring',
        stiffness: 280,
        damping: 26,
      }}
      whileHover={{ y: -3 }}
      className="product-card-glow glass-card rounded-2xl p-5 gradient-border cursor-default"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-[12px] flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
          >
            {product.icon}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">{product.name}</h4>
            <p className="text-xs text-white/40 mt-0.5 capitalize">{product.type}</p>
          </div>
        </div>
        <Badge color={product.tagColor || 'indigo'}>{product.tag}</Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-white/50 mb-3.5 leading-relaxed">{product.description}</p>

      {/* Features */}
      <ul className="space-y-1.5 mb-4">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-white/65">
            <div className="w-4 h-4 rounded-full bg-emerald-500/12 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-2.5 h-2.5 text-emerald-400" />
            </div>
            {f}
          </li>
        ))}
      </ul>

      {/* Highlight */}
      {product.highlight && (
        <div className="pt-3 border-t border-white/[0.06] mb-3.5">
          <span className="text-xs font-semibold text-indigo-300">{product.highlight}</span>
        </div>
      )}

      {/* Match score bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 rounded-full bg-white/[0.07] flex-1 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)' }}
            initial={{ width: '0%' }}
            animate={{ width: `${product.suitabilityScore}%` }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <span className="text-xs text-white/35 flex-shrink-0 font-medium">{product.suitabilityScore}% match</span>
      </div>
    </motion.div>
  );
}
