import { motion } from 'framer-motion';
import { clsx } from 'clsx';

const colorMap = {
  indigo: {
    bg: 'rgba(99,102,241,0.12)',
    border: 'rgba(99,102,241,0.2)',
    icon: 'text-indigo-400',
    glow: 'rgba(99,102,241,0.15)',
  },
  emerald: {
    bg: 'rgba(16,185,129,0.12)',
    border: 'rgba(16,185,129,0.2)',
    icon: 'text-emerald-400',
    glow: 'rgba(16,185,129,0.12)',
  },
  purple: {
    bg: 'rgba(168,85,247,0.12)',
    border: 'rgba(168,85,247,0.2)',
    icon: 'text-purple-400',
    glow: 'rgba(168,85,247,0.12)',
  },
  amber: {
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    icon: 'text-amber-400',
    glow: 'rgba(245,158,11,0.1)',
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', index = 0 }) {
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.08,
        type: 'spring',
        stiffness: 260,
        damping: 26,
      }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="stat-card"
      style={{
        boxShadow: `0 0 40px ${c.glow}, 0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-white/40 uppercase tracking-wide">{title}</p>
          <p className="text-[1.85rem] font-bold text-white mt-2.5 tracking-tight leading-none">{value}</p>
          {subtitle && (
            <p className="text-xs text-white/35 mt-1.5">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
            style={{ background: c.bg, borderColor: c.border }}
          >
            <Icon className={clsx('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
