import { clsx } from 'clsx';
import { motion } from 'framer-motion';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-[14px] ' +
    'transition-all duration-200 select-none cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none';

  const variants = {
    primary:
      'text-white ' +
      'bg-gradient-to-r from-indigo-500 to-violet-600 ' +
      'border border-indigo-400/40 ' +
      'shadow-[0_4px_20px_rgba(99,102,241,0.38),inset_0_1px_0_rgba(255,255,255,0.15)] ' +
      'hover:from-indigo-400 hover:to-violet-500 ' +
      'hover:shadow-[0_8px_30px_rgba(99,102,241,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] ' +
      'hover:-translate-y-0.5 active:scale-[0.97]',

    glass:
      'text-white/80 hover:text-white ' +
      'bg-white/[0.05] backdrop-blur-2xl ' +
      'border border-white/[0.09] ' +
      'shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] ' +
      'hover:bg-white/[0.09] hover:border-white/[0.16] ' +
      'hover:-translate-y-0.5 active:scale-[0.97]',

    ghost:
      'text-white/60 hover:text-white/90 ' +
      'hover:bg-white/[0.06] active:scale-[0.97]',

    danger:
      'text-red-400 ' +
      'bg-red-500/[0.12] border border-red-500/25 ' +
      'hover:bg-red-500/[0.2] active:scale-[0.97]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-[13px]',
    md: 'px-6 py-3 text-sm',
    lg: 'px-8 py-3.5 text-base',
    xl: 'px-10 py-[18px] text-[1.05rem]',
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      whileTap={disabled || loading ? {} : { scale: 0.97 }}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
