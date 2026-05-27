import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { Map, Shield, Crosshair, Route, Eye, GitBranch, Bot, ChevronRight, X } from 'lucide-react';

const steps = [
  {
    title: 'Welcome to Tactical Digital Twin',
    description: 'This platform provides real-time mission planning, terrain analysis, and threat simulation. Let\'s walk through the core workflow.',
    icon: <Map className="w-12 h-12 text-cyan-400" />
  },
  {
    title: '1. Fetch Area & Terrain',
    description: 'Start by panning the map to your target area. Use the Upload panel to fetch live satellite imagery and elevation data to build the environment.',
    icon: <Map className="w-12 h-12 text-emerald-400" />
  },
  {
    title: '2. Analyze Risk',
    description: 'The system automatically calculates a risk heatmap based on terrain exposure and weather conditions.',
    icon: <Shield className="w-12 h-12 text-amber-400" />
  },
  {
    title: '3. Inject Threats',
    description: 'Use the Threats panel to place known enemy positions like Snipers or Checkpoints on the map. This dynamically updates the risk heatmap.',
    icon: <Crosshair className="w-12 h-12 text-red-400" />
  },
  {
    title: '4. Plan Routes',
    description: 'Select Start and End points. The system will calculate the Stealthiest, Fastest, or Safest routes avoiding high-risk zones.',
    icon: <Route className="w-12 h-12 text-cyan-400" />
  },
  {
    title: '5. Observation & What-If',
    description: 'Use Vision Mode to check direct lines of sight. Run What-If scenarios like comms jamming or weather deterioration to see how routes adapt.',
    icon: <Eye className="w-12 h-12 text-purple-400" />
  },
  {
    title: '6. AI Assistant',
    description: 'At any point, ask the AI Assistant for tactical advice based on the current environment and active threats.',
    icon: <Bot className="w-12 h-12 text-cyan-400" />
  }
];

export default function OnboardingTour() {
  const showOnboarding = useUIStore((s) => s.showOnboarding);
  const onboardingStep = useUIStore((s) => s.onboardingStep);
  const setOnboardingStep = useUIStore((s) => s.setOnboardingStep);
  const setHasCompletedOnboarding = useUIStore((s) => s.setHasCompletedOnboarding);
  const setShowOnboarding = useUIStore((s) => s.setShowOnboarding);

  const handleNext = () => {
    if (onboardingStep < steps.length - 1) {
      setOnboardingStep(onboardingStep + 1);
    } else {
      finishTour();
    }
  };

  const handleSkip = () => {
    finishTour();
  };

  const finishTour = () => {
    setHasCompletedOnboarding(true);
    setShowOnboarding(false);
  };

  if (!showOnboarding) return null;

  const currentStep = steps[onboardingStep];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bg-primary/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={onboardingStep}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="bg-bg-card border border-cyan-500/30 rounded-xl shadow-[0_0_50px_rgba(0,240,255,0.15)] w-full max-w-lg overflow-hidden relative"
        >
          {/* Top glowing bar */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
          
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 text-text-secondary hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8 flex flex-col items-center text-center">
            <div className="mb-6 p-4 rounded-full bg-bg-secondary border border-cyan-500/20 shadow-[0_0_30px_rgba(0,240,255,0.1)]">
              {currentStep.icon}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-4 glow-text">
              {currentStep.title}
            </h2>
            
            <p className="text-text-secondary leading-relaxed mb-8">
              {currentStep.description}
            </p>

            {/* Progress indicators */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`w-2 h-2 rounded-full transition-colors ${idx === onboardingStep ? 'bg-cyan-400' : 'bg-slate-700'}`}
                />
              ))}
            </div>

            <div className="flex w-full gap-4">
              <button 
                onClick={handleSkip}
                className="flex-1 py-3 px-4 rounded-lg border border-slate-700 text-text-secondary font-bold hover:bg-slate-800 transition-colors"
              >
                Skip Tutorial
              </button>
              <button 
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-500/30 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                {onboardingStep === steps.length - 1 ? 'Start Mission' : 'Next'}
                {onboardingStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
