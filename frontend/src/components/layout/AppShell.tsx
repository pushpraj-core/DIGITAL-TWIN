import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../../services/api';
import { useMissionStore } from '../../stores/missionStore';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import BottomTimeline from './BottomTimeline';
import TacticalMap from '../map/TacticalMap';
import MapControls from '../map/MapControls';
import LayerPanel from '../map/LayerPanel';
import CoordinateOverlay from '../map/CoordinateOverlay';
import {
  UploadPanel,
  TerrainPanel,
  RiskPanel,
  PathPlannerPanel,
  ObservationPanel,
  ThreatPanel,
  WhatIfPanel,
  AIAssistantPanel,
} from '../panels';
import { useUIStore } from '../../stores/uiStore';
import OnboardingTour from './OnboardingTour';
import MissionGuide from './MissionGuide';

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

function RiskDataSync() {
  const terrainData = useMissionStore((s) => s.terrainData);
  const threats = useMissionStore((s) => s.threats);
  const setRiskHeatmap = useMissionStore((s) => s.setRiskHeatmap);
  const setRoutes = useMissionStore((s) => s.setRoutes);

  useEffect(() => {
    if (!terrainData) {
      setRiskHeatmap(null);
      return;
    }
    
    let isMounted = true;
    const fetchRisk = async () => {
      try {
        const response = await api.post('/risk/simulate', {
          terrain_id: terrainData.id,
          include_threats: true,
          threats: threats.map(t => ({
            ...t,
            position: t.position,
            lat: t.position.lat,
            lng: t.position.lng,
          }))
        });
        if (isMounted) {
          setRiskHeatmap(response.data);
          setRoutes([]); // Clear old routes that are now invalid
        }
      } catch (err) {
        console.error("Failed to compute risk heatmap", err);
      }
    };
    
    // Debounce to prevent spamming the backend
    const timer = setTimeout(() => {
      fetchRisk();
    }, 400);
    
    return () => { 
      isMounted = false; 
      clearTimeout(timer);
    };
  }, [terrainData, threats, setRiskHeatmap, setRoutes]);

  return null;
}

export default function AppShell() {
  const rightPanelOpen = useUIStore((s) => s.rightPanelOpen);
  const activeRightTab = useUIStore((s) => s.activeRightTab);

  const ActivePanel = panelMap[activeRightTab] || UploadPanel;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden tactical-grid">
      <RiskDataSync />
      {/* Top Bar */}
      <div className="relative z-[2000]">
        <TopBar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <div className="relative z-[2000]">
          <Sidebar />
        </div>

        {/* Center: Map */}
        <div className="flex-1 relative overflow-hidden">
          <TacticalMap />
          <MapControls />
          <LayerPanel />
          <CoordinateOverlay />
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
              className="border-l border-cyan-500/10 overflow-hidden flex-shrink-0 relative z-[2000]"
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
      <div className="relative z-[2000]">
        <BottomTimeline />
      </div>

      {/* UX Overlays */}
      <MissionGuide />
      <OnboardingTour />
    </div>
  );
}
