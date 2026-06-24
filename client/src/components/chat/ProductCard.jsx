import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import Badge from '../ui/Badge.jsx';

export default function ProductCard({ product, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1, duration: 0.3, ease: 'easeOut' }}
      className="glass rounded-2xl p-5 product-card-glow gradient-border glass-hover cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{product.icon}</span>
          <div>
            <h4 className="text-sm font-semibold text-white leading-tight">{product.name}</h4>
            <p className="text-xs text-white/50 mt-0.5 capitalize">{product.type}</p>
          </div>
        </div>
        <Badge color={product.tagColor || 'indigo'}>{product.tag}</Badge>
      </div>

      <p className="text-xs text-white/60 mb-3 leading-relaxed">{product.description}</p>

      <ul className="space-y-1.5 mb-3">
        {product.features.map((f, i) => (
          <li key={i} className="flex items-center gap-2 text-xs text-white/70">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {product.highlight && (
        <div className="mt-3 pt-3 border-t border-white/[0.06]">
          <span className="text-xs font-semibold text-indigo-300">{product.highlight}</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1">
        <div className="h-1 rounded-full bg-white/10 flex-1">
          <div
            className="h-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            style={{ width: `${product.suitabilityScore}%` }}
          />
        </div>
        <span className="text-xs text-white/40 ml-2">{product.suitabilityScore}% match</span>
      </div>
    </motion.div>
  );
}
