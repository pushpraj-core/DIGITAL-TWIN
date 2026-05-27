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

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
}

const navItems: NavItem[] = [
  { id: 'upload', icon: <Upload className="w-5 h-5" />, label: 'Upload' },
  { id: 'terrain', icon: <Map className="w-5 h-5" />, label: 'Terrain' },
  { id: 'risk', icon: <Shield className="w-5 h-5" />, label: 'Risk' },
  { id: 'routes', icon: <Route className="w-5 h-5" />, label: 'Routes' },
  { id: 'observation', icon: <Eye className="w-5 h-5" />, label: 'Observation' },
  { id: 'threats', icon: <Crosshair className="w-5 h-5" />, label: 'Threats' },
  { id: 'whatif', icon: <GitBranch className="w-5 h-5" />, label: 'What-If' },
  { id: 'assistant', icon: <Bot className="w-5 h-5" />, label: 'AI Assistant' },
];

export default function Sidebar() {
  const activeRightTab = useUIStore((s) => s.activeRightTab);
  const setActiveRightTab = useUIStore((s) => s.setActiveRightTab);
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useUIStore((s) => s.toggleRightPanel);
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
          return (
            <div key={item.id} className="relative group">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleTabClick(item.id)}
                className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  transition-all duration-200 cursor-pointer relative
                  ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
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

              {/* Tooltip */}
              <div
                className="
                  absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50
                  px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap
                  bg-slate-800 text-slate-200 border border-slate-700
                  opacity-0 pointer-events-none group-hover:opacity-100
                  transition-opacity duration-150
                "
              >
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800" />
              </div>
            </div>
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
