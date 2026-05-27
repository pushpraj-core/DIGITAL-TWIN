import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  onClick?: () => void;
  hoverable?: boolean;
}

export default function Card({
  title,
  subtitle,
  icon,
  children,
  className = '',
  noPadding = false,
  onClick,
  hoverable = false,
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onClick={onClick}
      className={`
        glass-card
        ${hoverable ? 'glass-card-hover cursor-pointer' : ''}
        ${noPadding ? '' : 'p-4'}
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && (
            <span className="text-cyan-400 flex-shrink-0">{icon}</span>
          )}
          <div className="min-w-0">
            {title && (
              <h3 className="text-sm font-semibold text-slate-200 truncate">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 truncate">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </motion.div>
  );
}
