import React from 'react';
import { motion } from 'framer-motion';
import {
  Globe,
  Map,
  Shield,
  Route,
  Eye,
  Crosshair,
  GitBranch,
  Bot,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import Tooltip from '../common/Tooltip';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  reqStage: number;
}

// Reordered to match the correct user flow:
// Area → Terrain → Risk → Threats → Observation → Routes → What-If → AI
const navItems: NavItem[] = [
  { id: 'upload', icon: <Globe className="w-5 h-5" />, label: 'Mission Area', description: 'Select a region and fetch live terrain data.', reqStage: 0 },
  { id: 'terrain', icon: <Map className="w-5 h-5" />, label: 'Terrain Intel', description: 'Review terrain analysis and passability.', reqStage: 1 },
  { id: 'risk', icon: <Shield className="w-5 h-5" />, label: 'Risk Heatmap', description: 'View danger zones from terrain and weather.', reqStage: 1 },
  { id: 'threats', icon: <Crosshair className="w-5 h-5" />, label: 'Threats', description: 'Inject enemy positions to update risk.', reqStage: 1 },
  { id: 'observation', icon: <Eye className="w-5 h-5" />, label: 'Observation', description: 'Analyze line of sight from any point.', reqStage: 1 },
  { id: 'routes', icon: <Route className="w-5 h-5" />, label: 'Movement', description: 'Plan routes avoiding threats and hazards.', reqStage: 1 },
  { id: 'whatif', icon: <GitBranch className="w-5 h-5" />, label: 'What-If', description: 'Simulate unexpected mission events.', reqStage: 1 },
  { id: 'assistant', icon: <Bot className="w-5 h-5" />, label: 'AI Assistant', description: 'Ask for tactical advice.', reqStage: 0 },
];

export default function Sidebar() {
  const activeRightTab = useUIStore((s) => s.activeRightTab);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
  const missionStage = useUIStore((s) => s.missionStage);
  const setActivePanel = useMissionStore((s) => s.setActivePanel);

  const handleTabClick = (id: string) => {
    if (activeRightTab === id && rightPanelOpen) {
      toggleRightPanel();
    } else {
      setActiveRightTab(id);
      setActivePanel(id);
    }
  };

  return (
    <div
      className="w-14 flex flex-col items-center py-2 border-r border-cyan-500/10 relative"
      style={{ background: 'rgba(10, 14, 26, 0.95)' }}
    >
      {/* Nav items */}
      <div className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeRightTab === item.id;
          const isLocked = missionStage < item.reqStage;
          const wasJustUnlocked = missionStage === item.reqStage && item.reqStage > 0;
          
          return (
            <Tooltip 
              key={item.id}
              title={item.label}
              description={isLocked ? 'Complete previous steps to unlock.' : item.description}
              position="right"
              delay={200}
            >
              <motion.button
                whileHover={{ scale: isLocked ? 1 : 1.1 }}
                whileTap={{ scale: isLocked ? 1 : 0.9 }}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  transition-all duration-200 cursor-pointer relative
                  ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : isLocked 
                        ? 'text-slate-700 hover:text-slate-600 cursor-not-allowed'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }
                `}
                disabled={isLocked}
              >
                {item.icon}
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.5)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                {/* "NEW" pulse dot for just-unlocked items */}
                {wasJustUnlocked && !isActive && (
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(0,240,255,0.8)]"
                  />
                )}
              </motion.button>
            </Tooltip>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-slate-700/40 my-2" />

      {/* Collapse toggle */}
      <button
        onClick={toggleRightPanel}
        className="w-10 h-10 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-400 hover:bg-slate-700/30 transition-colors cursor-pointer"
      >
        {rightPanelOpen ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
