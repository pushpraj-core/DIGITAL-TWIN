import React from 'react';
import { useMissionStore } from '../../stores/missionStore';

export const MissionReport = () => {
  const { routes, selectedRouteId } = useMissionStore();
  const [isExporting, setIsExporting] = React.useState(false);

  const route = routes.find(r => r.id === selectedRouteId);

  const handleExport = () => {
    setIsExporting(true);
    // Mock API call to backend /report endpoint
    setTimeout(() => {
      setIsExporting(false);
      alert('Mission Report PDF generated and downloaded successfully!');
    }, 2000);
  };

  if (!route) {
    return (
      <div className="p-4 bg-bg-card rounded border border-bg-secondary text-text-secondary text-sm">
        Select a finalized mission route to generate a report.
      </div>
    );
  }

  return (
    <div className="p-4 bg-bg-card rounded border border-bg-secondary">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-accent-cyan">Mission Briefing</h3>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className={`px-4 py-2 text-sm rounded font-bold transition-colors ${
            isExporting 
              ? 'bg-bg-secondary text-text-secondary' 
              : 'bg-accent-cyan text-bg-primary hover:bg-accent-cyan/80'
          }`}
        >
          {isExporting ? 'Generating PDF...' : 'Export PDF'}
        </button>
      </div>

      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-bg-primary p-3 rounded">
            <p className="text-text-secondary mb-1">Strategy</p>
            <p className="text-text-primary font-bold">{route.name}</p>
          </div>
          <div className="bg-bg-primary p-3 rounded">
            <p className="text-text-secondary mb-1">Total Distance</p>
            <p className="text-text-primary font-bold">{Math.round(route.distance_m)} m</p>
          </div>
        </div>

        <div className="bg-bg-primary p-3 rounded">
          <p className="text-text-secondary mb-2">Tactical Summary</p>
          <ul className="list-disc pl-4 text-text-primary space-y-1">
            <li>Route maximizes concealment using dense vegetation.</li>
            <li>Low exposure to known Sniper position (Alpha).</li>
            <li>Estimated traversal time: {Math.floor(route.estimated_time_s / 60)} minutes.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
