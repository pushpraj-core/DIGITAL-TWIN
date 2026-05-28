import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMissionStore } from '../../stores/missionStore';

const PROCESSING_STEPS = [
  { label: 'Connecting to satellite feed...', icon: '📡', duration: 800 },
  { label: 'Downloading imagery tiles...', icon: '🛰', duration: 1200 },
  { label: 'Fetching elevation data (SRTM)...', icon: '⛰', duration: 1000 },
  { label: 'Analyzing terrain passability...', icon: '🗺', duration: 900 },
  { label: 'Detecting roads & structures...', icon: '🏗', duration: 1100 },
  { label: 'Scanning vegetation cover...', icon: '🌿', duration: 800 },
  { label: 'Classifying water bodies...', icon: '💧', duration: 700 },
  { label: 'Querying live weather data...', icon: '🌦', duration: 600 },
  { label: 'Generating risk heatmap...', icon: '🔥', duration: 900 },
  { label: 'Building tactical environment...', icon: '⚔', duration: 1000 },
];

export default function ProcessingOverlay() {
  const isFetching = useMissionStore((s) => s.isFetchingTerrain);
  const terrainData = useMissionStore((s) => s.terrainData);
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Show overlay when fetching starts
  useEffect(() => {
    if (isFetching) {
      setIsVisible(true);
      setCurrentStep(0);
      setCompletedSteps([]);
    }
  }, [isFetching]);

  // Auto-advance steps while fetching
  useEffect(() => {
    if (!isVisible || !isFetching) return;

    const step = PROCESSING_STEPS[currentStep];
    if (!step) return;

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, currentStep]);
      if (currentStep < PROCESSING_STEPS.length - 1) {
        setCurrentStep((prev) => prev + 1);
      }
    }, step.duration);

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, isFetching]);

  // When terrain data arrives, complete all steps and dismiss
  useEffect(() => {
    if (terrainData && isVisible && !isFetching) {
      // Mark all remaining steps as complete
      setCompletedSteps(PROCESSING_STEPS.map((_, i) => i));
      setCurrentStep(PROCESSING_STEPS.length - 1);

      const dismissTimer = setTimeout(() => {
        setIsVisible(false);
      }, 1200);

      return () => clearTimeout(dismissTimer);
    }
  }, [terrainData, isFetching, isVisible]);

  // Don't render if not visible
  if (!isVisible) return null;

  const progress = Math.min(
    ((completedSteps.length) / PROCESSING_STEPS.length) * 100,
    100
  );
  const allDone = completedSteps.length === PROCESSING_STEPS.length;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[9000] flex items-center justify-center"
          style={{ background: 'rgba(4, 8, 18, 0.85)' }}
        >
          {/* Scan lines effect */}
          <div className="absolute inset-0 pointer-events-none processing-scanlines" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: -10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md mx-4"
          >
            {/* Glowing border card */}
            <div className="bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 rounded-2xl overflow-hidden shadow-[0_0_80px_rgba(0,240,255,0.08)]">
              {/* Top progress bar */}
              <div className="h-1 w-full bg-slate-800 relative overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-cyan-400 to-emerald-400"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
                {/* Shimmer effect on progress bar */}
                {!allDone && (
                  <div className="absolute inset-0 processing-shimmer" />
                )}
              </div>

              <div className="p-8">
                {/* Spinner / Checkmark */}
                <div className="flex justify-center mb-6">
                  {allDone ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/50 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                    >
                      <span className="text-emerald-400 text-2xl">✓</span>
                    </motion.div>
                  ) : (
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full border-[3px] border-cyan-500/20 border-t-cyan-400 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg">{PROCESSING_STEPS[currentStep]?.icon}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className={`text-center font-bold text-lg mb-1 transition-colors duration-300 ${
                  allDone ? 'text-emerald-400' : 'text-cyan-400'
                }`}>
                  {allDone ? 'Environment Ready' : 'Building Tactical Environment'}
                </h2>
                <p className="text-center text-slate-500 text-xs mb-6">
                  {allDone 
                    ? 'All systems operational. Mission area loaded.' 
                    : 'Downloading and processing mission area data...'
                  }
                </p>

                {/* Step list */}
                <div className="space-y-1.5 max-h-[240px] overflow-y-auto pr-1 processing-steps-scroll">
                  {PROCESSING_STEPS.map((step, idx) => {
                    const isCompleted = completedSteps.includes(idx);
                    const isCurrent = idx === currentStep && !allDone;
                    const isPending = !isCompleted && !isCurrent;

                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.2 }}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                          isCurrent
                            ? 'bg-cyan-500/10 border border-cyan-500/20'
                            : isCompleted
                            ? 'bg-slate-800/30'
                            : 'opacity-40'
                        }`}
                      >
                        {/* Status indicator */}
                        <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                          {isCompleted ? (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-emerald-400 text-xs font-bold"
                            >
                              ✓
                            </motion.span>
                          ) : isCurrent ? (
                            <div className="w-3 h-3 rounded-full border-2 border-cyan-400/50 border-t-cyan-400 animate-spin" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-slate-600" />
                          )}
                        </div>

                        {/* Step icon */}
                        <span className="text-sm flex-shrink-0">{step.icon}</span>

                        {/* Label */}
                        <span className={`text-xs font-mono transition-colors duration-300 ${
                          isCurrent
                            ? 'text-cyan-400'
                            : isCompleted
                            ? 'text-slate-500'
                            : 'text-slate-600'
                        }`}>
                          {step.label}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress percentage */}
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-slate-600 uppercase tracking-wider">Processing</span>
                  <span className={`font-bold ${allDone ? 'text-emerald-400' : 'text-cyan-400'}`}>
                    {Math.round(progress)}%
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
