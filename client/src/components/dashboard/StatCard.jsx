import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function StatCard({ title, value, subtitle, icon: Icon, color = 'indigo', index = 0 }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', icon: 'text-indigo-400', border: 'border-indigo-500/20' },
    emerald: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', border: 'border-emerald-500/20' },
    purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', border: 'border-purple-500/20' },
    amber: { bg: 'bg-amber-500/10', icon: 'text-amber-400', border: 'border-amber-500/20' },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass rounded-2xl p-6 glass-hover"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2 tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center border', c.bg, c.border)}>
            <Icon className={clsx('w-5 h-5', c.icon)} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
