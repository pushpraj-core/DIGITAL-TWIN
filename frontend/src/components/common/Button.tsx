import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'danger' | 'success' | 'ghost' | 'amber';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-cyan-500/10 border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(0,240,255,0.2)]',
  danger:
    'bg-red-500/10 border-red-500/40 text-red-400 hover:bg-red-500/20 hover:border-red-400/60 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]',
  success:
    'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400/60 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
  amber:
    'bg-amber-500/10 border-amber-500/40 text-amber-400 hover:bg-amber-500/20 hover:border-amber-400/60 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  ghost:
    'bg-transparent border-slate-600/30 text-slate-400 hover:bg-slate-700/30 hover:border-slate-500/40 hover:text-slate-300',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-2.5 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        inline-flex items-center justify-center rounded-md border font-medium
        transition-all duration-200 cursor-pointer
        backdrop-blur-sm
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      disabled={disabled || loading}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </motion.button>
  );
}
