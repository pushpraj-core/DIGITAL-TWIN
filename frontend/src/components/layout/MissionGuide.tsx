import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import { AlertCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { id: 0, title: 'Fetch Area', description: 'Pan the map to your target location and fetch live terrain data.' },
  { id: 1, title: 'Analyze Terrain', description: 'Review the base risk heatmap calculated from elevation and weather.' },
  { id: 2, title: 'Add Threats', description: 'Inject known enemy positions to dynamically update the risk model.' },
  { id: 3, title: 'Plan Route', description: 'Drop Start and End points to calculate the optimal path.' },
  { id: 4, title: 'Run Observation', description: 'Use Vision Mode to verify line-of-sight along your route.' },
  { id: 5, title: 'Simulate Mission', description: 'Run What-If scenarios or replay the timeline.' },
  { id: 6, title: 'Ask AI Assistant', description: 'Request tactical advice or an intelligence briefing.' },
];

export default function MissionGuide() {
  const missionStage = useUIStore((s) => s.missionStage);
  const setMissionStage = useUIStore((s) => s.setMissionStage);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);
  
  const terrainData = useMissionStore((s) => s.terrainData);
  const threats = useMissionStore((s) => s.threats);
  const routes = useMissionStore((s) => s.routes);
  const visibility = useMissionStore((s) => s.visibility);
  const timeline = useMissionStore((s) => s.missionTimeline);

  const [expanded, setExpanded] = useState(true);

  // Auto-advance logic
  useEffect(() => {
    let maxStage = 0;
    if (terrainData) maxStage = Math.max(maxStage, 1);
    // After terrain is fetched, they might view Risk or add Threats
    if (terrainData && threats.length > 0) maxStage = Math.max(maxStage, 2);
    // Once they have threats/terrain, next is routes
    if (routes.length > 0) maxStage = Math.max(maxStage, 3);
    // After routes, observation
    if (visibility) maxStage = Math.max(maxStage, 4);
    // Timeline/simulation
    if (timeline?.events && timeline.events.length > 0) maxStage = Math.max(maxStage, 5);

    if (maxStage > missionStage) {
      setMissionStage(maxStage);
    }
  }, [terrainData, threats, routes, visibility, timeline, missionStage, setMissionStage]);

  const currentStage = STAGES[missionStage] || STAGES[STAGES.length - 1];

  const handleActionClick = () => {
    // Navigate to the relevant tab based on current stage
    const tabMap: Record<number, string> = {
      0: 'upload',
      1: 'terrain',
      2: 'threats',
      3: 'routes',
      4: 'observation',
      5: 'whatif',
      6: 'assistant'
    };
    const targetTab = tabMap[missionStage];
    if (targetTab) {
      setActiveRightTab(targetTab);
    }
  };

  return (
    <div className="absolute bottom-6 right-[400px] z-[2000] pointer-events-none">
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-bg-card/90 backdrop-blur-md border border-cyan-500/30 rounded-xl p-4 shadow-[0_0_20px_rgba(0,240,255,0.15)] w-80 pointer-events-auto"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Mission Guide</span>
              </div>
              <div className="text-xs font-mono text-slate-400">
                Stage {missionStage + 1}/{STAGES.length}
              </div>
            </div>

            <div className="mb-3">
              <h3 className="text-sm font-bold text-white mb-1">{currentStage.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{currentStage.description}</p>
            </div>

            {/* Mini Progress Bar */}
            <div className="flex gap-1 mb-3">
              {STAGES.map((s) => (
                <div 
                  key={s.id} 
                  className={`h-1 flex-1 rounded-full ${
                    s.id < missionStage ? 'bg-emerald-400' :
                    s.id === missionStage ? 'bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]' :
                    'bg-slate-700'
                  }`}
                />
              ))}
            </div>

            <button 
              onClick={handleActionClick}
              className="w-full flex items-center justify-between px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded text-cyan-400 text-xs font-bold transition-colors"
            >
              <span>Open Relevant Panel</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
