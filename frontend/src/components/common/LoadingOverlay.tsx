import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

export default function LoadingOverlay({
  visible,
  message = 'Analyzing...',
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9998] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md"
        >
          {/* Spinner rings */}
          <div className="relative w-24 h-24 mb-6">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-[spin_3s_linear_infinite]" />
            {/* Middle ring */}
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-cyan-400 animate-[spin_1.5s_linear_infinite]" />
            {/* Inner ring */}
            <div className="absolute inset-4 rounded-full border-2 border-transparent border-t-cyan-300 border-b-cyan-300/30 animate-[spin_1s_linear_infinite_reverse]" />
            {/* Center dot */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.6)] animate-pulse" />
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
          </div>

          {/* Message */}
          <div className="text-center">
            <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase glow-text mb-2">
              {message}
            </p>
            <div className="flex items-center justify-center gap-1">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-cyan-400/60"
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
