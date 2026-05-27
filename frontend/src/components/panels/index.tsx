import React from 'react';

export const UploadPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Data Upload</h2>
    <div className="border-2 border-dashed border-accent-cyan/50 rounded-lg p-8 text-center bg-bg-card/50">
      <p className="text-text-secondary">Drag & drop terrain imagery here</p>
      <button className="mt-4 px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded hover:bg-accent-cyan/30 transition-colors">
        Browse Files
      </button>
    </div>
  </div>
);

export const TerrainPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-green">Terrain Intelligence</h2>
    <div className="space-y-2">
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-green">Safe</span><span>45%</span></div>
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-amber">Urban</span><span>30%</span></div>
      <div className="flex justify-between p-2 bg-bg-card rounded"><span className="text-accent-red">Exposed</span><span>25%</span></div>
    </div>
  </div>
);

export const RiskPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-red">Risk Analysis</h2>
    <div className="p-4 bg-bg-card rounded text-center">
      <p className="text-text-secondary text-sm">Overall Area Risk</p>
      <p className="text-3xl font-bold text-accent-amber">MEDIUM</p>
    </div>
  </div>
);

export const PathPlannerPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Movement Planner</h2>
    <div className="space-y-4">
      <button className="w-full py-2 bg-bg-card hover:bg-accent-cyan/20 border border-accent-cyan/30 rounded text-left px-4">Stealth (Min Exposure)</button>
      <button className="w-full py-2 bg-bg-card hover:bg-accent-amber/20 border border-accent-amber/30 rounded text-left px-4">Fastest (Min Distance)</button>
      <button className="w-full py-2 bg-bg-card hover:bg-accent-green/20 border border-accent-green/30 rounded text-left px-4">Safest (Min Risk)</button>
    </div>
  </div>
);

export const ObservationPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">Observation</h2>
    <p className="text-text-secondary">Click on map to run Line-of-Sight analysis.</p>
  </div>
);

import { MissionReplay } from '../mission/MissionReplay';
import { StrategyComparison } from '../mission/StrategyComparison';

export const ThreatPanel = () => {
  const [activeThreat, setActiveThreat] = React.useState<string | null>(null);

  const threats = [
    { id: 'sniper', label: 'Sniper Position', color: 'border-accent-red' },
    { id: 'checkpoint', label: 'Enemy Checkpoint', color: 'border-accent-amber' },
    { id: 'ied', label: 'IED Suspected', color: 'border-accent-red' },
    { id: 'patrol', label: 'Patrol Route', color: 'border-accent-amber' }
  ];

  return (
    <div className="p-4 text-text-primary">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-red">Threat Injection</h2>
      <p className="text-text-secondary text-sm mb-4">Select a threat type and click on the map to inject it into the simulation environment.</p>
      
      <div className="grid grid-cols-2 gap-3 mt-4">
        {threats.map(t => (
          <button 
            key={t.id}
            onClick={() => setActiveThreat(t.id)}
            className={`p-3 bg-bg-card rounded border-2 transition-colors ${activeThreat === t.id ? t.color + ' bg-bg-secondary' : 'border-transparent hover:border-bg-secondary'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeThreat && (
        <div className="mt-6 p-4 bg-accent-red/10 border border-accent-red/30 rounded">
          <p className="text-accent-red text-sm font-bold animate-pulse">Click on map to place threat</p>
        </div>
      )}
    </div>
  );
};

export const WhatIfPanel = () => {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [result, setResult] = React.useState<any>(null);

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate API call
    setTimeout(() => {
      setResult({
        metrics: { riskIncrease: '+15%', routeDivergence: '400m', timeDelay: '+12min' },
        message: 'Scenario resulted in elevated risk. Re-routing required.'
      });
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="p-4 text-text-primary flex flex-col h-full overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 glow-text text-accent-amber">What-If Simulation</h2>
      
      <div className="mb-6">
        <label className="block text-sm text-text-secondary mb-2">Scenario Type</label>
        <select className="w-full bg-bg-card border border-bg-secondary rounded p-2 text-text-primary">
          <option>Main Route Blocked</option>
          <option>Weather Deterioration (Fog)</option>
          <option>Unexpected Threat Encounter</option>
          <option>Comms Jamming</option>
        </select>
      </div>

      <button 
        onClick={runSimulation}
        disabled={isSimulating}
        className={`w-full p-3 rounded font-bold transition-colors ${isSimulating ? 'bg-bg-secondary text-text-secondary' : 'bg-accent-amber/20 border border-accent-amber text-accent-amber hover:bg-accent-amber/30'}`}
      >
        {isSimulating ? 'Running Simulation...' : 'Run Scenario'}
      </button>

      {result && (
        <div className="mt-6 border border-accent-amber/30 rounded p-4 bg-bg-card">
          <h3 className="font-bold text-accent-amber mb-2">Simulation Results</h3>
          <p className="text-sm text-text-secondary mb-4">{result.message}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-bg-primary p-2 rounded">
              <div className="text-text-secondary text-xs">Risk Change</div>
              <div className="text-accent-red font-bold">{result.metrics.riskIncrease}</div>
            </div>
            <div className="bg-bg-primary p-2 rounded">
              <div className="text-text-secondary text-xs">Time Delay</div>
              <div className="text-accent-amber font-bold">{result.metrics.timeDelay}</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-bg-secondary pt-4">
        <MissionReplay />
      </div>
      <div className="mt-4">
        <StrategyComparison />
      </div>
    </div>
  );
};

export const AIAssistantPanel = () => (
  <div className="p-4 text-text-primary flex flex-col h-full">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-cyan">AI Tactical Assistant</h2>
    <div className="flex-1 border border-bg-secondary rounded p-4 mb-4 bg-bg-card/50">
      <p className="text-accent-cyan mb-2">System: How can I assist with your mission planning?</p>
    </div>
    <div className="flex gap-2">
      <input type="text" className="flex-1 bg-bg-secondary border border-bg-card rounded p-2 text-text-primary outline-none focus:border-accent-cyan" placeholder="Ask AI..." />
      <button className="px-4 py-2 bg-accent-cyan text-bg-primary font-bold rounded">Send</button>
    </div>
  </div>
);
