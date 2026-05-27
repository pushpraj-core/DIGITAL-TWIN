import React from 'react';
import { motion } from 'framer-motion';
import {
  Upload,
  Map,
  Shield,
  Route,
  Eye,
  Crosshair,
  GitBranch,
  Bot,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import Tooltip from '../common/Tooltip';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  reqStage: number; // minimum missionStage to fully unlock
}

const navItems: NavItem[] = [
  { id: 'upload', icon: <Upload className="w-5 h-5" />, label: 'Environment', description: 'Fetch satellite imagery and elevation data.', reqStage: 0 },
  { id: 'terrain', icon: <Map className="w-5 h-5" />, label: 'Terrain Analysis', description: 'Review terrain passability and elevation.', reqStage: 1 },
  { id: 'risk', icon: <Shield className="w-5 h-5" />, label: 'Risk Heatmap', description: 'View danger zones based on terrain and weather.', reqStage: 1 },
  { id: 'threats', icon: <Crosshair className="w-5 h-5" />, label: 'Threats', description: 'Inject enemy positions to update risk models.', reqStage: 1 },
  { id: 'routes', icon: <Route className="w-5 h-5" />, label: 'Routes', description: 'Plan paths avoiding threats and hazards.', reqStage: 2 },
  { id: 'observation', icon: <Eye className="w-5 h-5" />, label: 'Vision Mode', description: 'Check direct lines of sight on the map.', reqStage: 3 },
  { id: 'whatif', icon: <GitBranch className="w-5 h-5" />, label: 'What-If Scenarios', description: 'Simulate unexpected mission events.', reqStage: 4 },
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
                        ? 'text-slate-700 hover:text-slate-600'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }
                `}
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
              </motion.button>
            </Tooltip>
          );
        })}
      </div>

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
