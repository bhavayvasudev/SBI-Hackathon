import { clsx } from 'clsx';

const colorMap = {
  indigo: 'bg-indigo-500/[0.14] text-indigo-300 border-indigo-500/[0.22]',
  emerald: 'bg-emerald-500/[0.14] text-emerald-300 border-emerald-500/[0.22]',
  amber: 'bg-amber-500/[0.14] text-amber-300 border-amber-500/[0.22]',
  purple: 'bg-purple-500/[0.14] text-purple-300 border-purple-500/[0.22]',
  pink: 'bg-pink-500/[0.14] text-pink-300 border-pink-500/[0.22]',
  default: 'bg-white/[0.08] text-white/60 border-white/[0.1]',
};

export default function Badge({ children, color = 'default', className }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border',
        colorMap[color] || colorMap.default,
        className
      )}
    >
      {children}
    </span>
  );
}
