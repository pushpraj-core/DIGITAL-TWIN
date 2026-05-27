import React from 'react';
import { useMissionStore } from '../../stores/missionStore';

export const StrategyComparison = () => {
  const { routes } = useMissionStore();

  if (routes.length < 2) {
    return <div className="text-text-secondary">Need at least 2 routes to compare.</div>;
  }

  return (
    <div className="bg-bg-card p-4 rounded border border-bg-secondary">
      <h3 className="font-bold text-accent-amber mb-4">Strategy Comparison</h3>
      <div className="space-y-4">
        {routes.map(route => (
          <div key={route.id} className="border-l-4 p-2 pl-3 bg-bg-primary rounded" style={{ borderColor: route.color }}>
            <div className="font-bold text-text-primary">{route.name}</div>
            <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
              <div>
                <div className="text-text-secondary text-xs">Distance</div>
                <div className="text-text-primary">{Math.round(route.distance)} m</div>
              </div>
              <div>
                <div className="text-text-secondary text-xs">Risk</div>
                <div className="text-text-primary">{(route.risk_score * 100).toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-text-secondary text-xs">Exposure</div>
                <div className="text-text-primary">{(route.exposure_score * 100).toFixed(1)}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
