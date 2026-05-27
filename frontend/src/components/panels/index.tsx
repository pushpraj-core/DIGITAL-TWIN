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

export const ThreatPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-red">Threat Injection</h2>
    <p className="text-text-secondary">Select threat type to place on map.</p>
    <div className="grid grid-cols-2 gap-2 mt-4">
      <button className="p-2 bg-bg-card rounded border border-accent-red/30">Sniper</button>
      <button className="p-2 bg-bg-card rounded border border-accent-red/30">Checkpoint</button>
    </div>
  </div>
);

export const WhatIfPanel = () => (
  <div className="p-4 text-text-primary">
    <h2 className="text-xl font-bold mb-4 glow-text text-accent-amber">What-If Simulation</h2>
    <button className="w-full p-2 bg-accent-amber/20 border border-accent-amber text-accent-amber rounded">Run Scenario</button>
  </div>
);

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
