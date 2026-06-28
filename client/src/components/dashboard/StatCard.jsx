import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const colorMap = {
  blue:    { bg: 'rgba(26,86,219,0.12)',  border: 'rgba(26,86,219,0.2)',   icon: 'text-blue-400',   glow: 'rgba(26,86,219,0.12)' },
  indigo:  { bg: 'rgba(26,86,219,0.12)',  border: 'rgba(26,86,219,0.2)',   icon: 'text-blue-400',   glow: 'rgba(26,86,219,0.12)' },
  emerald: { bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.18)', icon: 'text-emerald-400',glow: 'rgba(16,185,129,0.1)' },
  purple:  { bg: 'rgba(26,86,219,0.12)',  border: 'rgba(26,86,219,0.2)',   icon: 'text-blue-400',   glow: 'rgba(26,86,219,0.12)' },
  amber:   { bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.18)', icon: 'text-amber-400',  glow: 'rgba(245,158,11,0.08)' },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', index = 0 }) {
  const c = colorMap[color] || colorMap.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 280, damping: 26 }}
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className="relative rounded-2xl p-5 overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(12px)',
        boxShadow: `0 0 32px ${c.glow}, 0 4px 16px rgba(0,0,0,0.3)`,
      }}
    >
      <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${c.glow} 0%, transparent 70%)`, transform: 'translate(30%,-30%)' }} />
      <div className="flex items-start justify-between mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.38)' }}>{title}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl flex items-center justify-center border flex-shrink-0"
            style={{ background: c.bg, borderColor: c.border }}>
            <Icon className={clsx('w-4.5 h-4.5', c.icon)} />
          </div>
        )}
      </div>
      <p className="text-[2rem] font-bold text-white tracking-tight leading-none mb-1.5">{value}</p>
      {subtitle && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{subtitle}</p>}
    </motion.div>
  );
}
