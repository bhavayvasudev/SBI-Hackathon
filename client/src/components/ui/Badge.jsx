import { clsx } from 'clsx';

const colorMap = {
  indigo: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
  purple: 'bg-purple-500/15 text-purple-300 border-purple-500/20',
  pink: 'bg-pink-500/15 text-pink-300 border-pink-500/20',
  default: 'bg-white/10 text-white/70 border-white/10',
};

export default function Badge({ children, color = 'default', className }) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      colorMap[color] || colorMap.default,
      className
    )}>
      {children}
    </span>
  );
}
