import React, { useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import { useUiStore } from './stores/uiStore';
import { 
  UploadPanel, TerrainPanel, RiskPanel, PathPlannerPanel, 
  ObservationPanel, ThreatPanel, WhatIfPanel, AIAssistantPanel 
} from './components/panels';

function App() {
  const { activeRightTab } = useUiStore();

  const renderActivePanel = () => {
    switch (activeRightTab) {
      case 'upload': return <UploadPanel />;
      case 'terrain': return <TerrainPanel />;
      case 'risk': return <RiskPanel />;
      case 'routes': return <PathPlannerPanel />;
      case 'observation': return <ObservationPanel />;
      case 'threats': return <ThreatPanel />;
      case 'whatif': return <WhatIfPanel />;
      case 'assistant': return <AIAssistantPanel />;
      default: return <UploadPanel />;
    }
  };

  return (
    <div className="w-screen h-screen bg-bg-primary overflow-hidden text-text-primary">
      <AppShell rightPanelContent={renderActivePanel()} />
    </div>
  );
}

export default App;
