import React from 'react';

interface SliderProps {
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  label?: string;
  showValue?: boolean;
  formatValue?: (value: number) => string;
  className?: string;
}

export default function Slider({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label,
  showValue = true,
  formatValue,
  className = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`w-full ${className}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs text-slate-400 font-medium">{label}</span>
          )}
          {showValue && (
            <span className="text-xs font-mono text-cyan-400">
              {formatValue ? formatValue(value) : value}
            </span>
          )}
        </div>
      )}
      <div className="relative h-6 flex items-center">
        <div className="absolute inset-x-0 h-1.5 rounded-full bg-slate-700/60 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${percentage}%`,
              background: `linear-gradient(90deg, rgba(0,240,255,0.4), rgba(0,240,255,0.8))`,
              boxShadow: '0 0 8px rgba(0,240,255,0.3)',
            }}
          />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="absolute inset-x-0 w-full h-6 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-slate-900 shadow-[0_0_10px_rgba(0,240,255,0.5)] pointer-events-none transition-all duration-100"
          style={{ left: `calc(${percentage}% - 7px)` }}
        />
      </div>
    </div>
  );
}
