import React, { useState, useEffect } from 'react';
import { useMissionStore } from '../../stores/missionStore';

export const MissionReplay = () => {
  const { routes, selectedRouteId } = useMissionStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const route = routes.find(r => r.id === selectedRouteId);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return p + 2; // +2% per tick
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!route) {
    return <div className="text-text-secondary">Select a route to replay.</div>;
  }

  return (
    <div className="bg-bg-card p-4 rounded border border-bg-secondary">
      <h3 className="font-bold text-accent-cyan mb-2">Mission Replay: {route.name}</h3>
      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="px-4 py-2 bg-accent-cyan/20 text-accent-cyan rounded hover:bg-accent-cyan/30"
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button 
          onClick={() => { setIsPlaying(false); setProgress(0); }}
          className="px-4 py-2 bg-bg-secondary text-text-primary rounded hover:bg-bg-primary"
        >
          Stop
        </button>
      </div>
      
      <div className="w-full bg-bg-primary h-2 rounded overflow-hidden">
        <div 
          className="bg-accent-cyan h-full transition-all duration-100 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-text-secondary mt-1">
        <span>Start</span>
        <span>Est: {Math.floor(route.estimated_time_s / 60)} min</span>
      </div>

      <div className="mt-4 text-sm text-text-secondary">
        <p>Current Risk Encounter: {progress > 40 && progress < 60 ? <span className="text-accent-amber">Elevated</span> : <span className="text-accent-green">Low</span>}</p>
        <p>Cover Status: {progress > 70 ? 'Exposed' : 'Concealed'}</p>
      </div>
    </div>
  );
};
