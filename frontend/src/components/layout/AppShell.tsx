import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomTimeline from './BottomTimeline';
import TacticalMap from '../map/TacticalMap';
import MapControls from '../map/MapControls';
import LayerPanel from '../map/LayerPanel';
import UploadPanel from '../panels/UploadPanel';
import TerrainPanel from '../panels/TerrainPanel';
import RiskPanel from '../panels/RiskPanel';
import PathPlannerPanel from '../panels/PathPlannerPanel';
import ObservationPanel from '../panels/ObservationPanel';
import ThreatPanel from '../panels/ThreatPanel';
import WhatIfPanel from '../panels/WhatIfPanel';
import AIAssistantPanel from '../panels/AIAssistantPanel';
import { useUIStore } from '../../stores/uiStore';

const panelMap: Record<string, React.ComponentType> = {
  upload: UploadPanel,
  terrain: TerrainPanel,
  risk: RiskPanel,
  routes: PathPlannerPanel,
  observation: ObservationPanel,
  threats: ThreatPanel,
  whatif: WhatIfPanel,
  assistant: AIAssistantPanel,
};

export default function AppShell() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const activeRightTab = useUIStore((s) => s.activeRightTab);

  const ActivePanel = panelMap[activeRightTab] || UploadPanel;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden tactical-grid">
      {/* Top Bar */}
      <TopBar />

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Center: Map */}
        <div className="flex-1 relative overflow-hidden">
          <TacticalMap />
          <MapControls />
          <LayerPanel />
        </div>

        {/* Right Panel */}
        <AnimatePresence mode="wait">
          {rightPanelOpen && (
            <motion.div
              key={activeRightTab}
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 380, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="border-l border-cyan-500/10 overflow-hidden flex-shrink-0"
              style={{ background: 'rgba(10, 14, 26, 0.95)' }}
            >
              <div className="w-[380px] h-full overflow-y-auto overflow-x-hidden">
                <ActivePanel />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Timeline */}
      <BottomTimeline />
    </div>
  );
}
