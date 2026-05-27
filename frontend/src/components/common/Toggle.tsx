import React from 'react';
import { motion } from 'framer-motion';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export default function Toggle({
  checked,
  onChange,
  label,
  size = 'md',
  className = '',
}: ToggleProps) {
  const trackW = size === 'sm' ? 'w-8' : 'w-10';
  const trackH = size === 'sm' ? 'h-4' : 'h-5';
  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const offset = size === 'sm' ? 14 : 18;

  return (
    <label
      className={`inline-flex items-center gap-2 cursor-pointer select-none ${className}`}
    >
      <div
        className={`
          relative ${trackW} ${trackH} rounded-full transition-colors duration-200
          ${checked
            ? 'bg-cyan-500/30 border-cyan-400/50'
            : 'bg-slate-700/60 border-slate-600/40'
          }
          border
        `}
        onClick={() => onChange(!checked)}
      >
        <motion.div
          animate={{ x: checked ? offset : 2 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={`
            absolute top-1/2 -translate-y-1/2 ${dotSize} rounded-full
            ${checked
              ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.6)]'
              : 'bg-slate-500'
            }
          `}
        />
      </div>
      {label && (
        <span className={`text-${size === 'sm' ? 'xs' : 'sm'} text-slate-400`}>
          {label}
        </span>
      )}
    </label>
  );
}
