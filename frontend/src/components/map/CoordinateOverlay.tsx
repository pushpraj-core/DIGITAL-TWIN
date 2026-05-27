import React from 'react';
import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';

export default function CoordinateOverlay() {
  const mousePosition = useMapStore(s => s.mousePosition);
  const terrainData = useMissionStore(s => s.terrainData);

  if (!mousePosition) return null;

  // Simple mock elevation calculation based on mouse pos and terrain
  // In a real app, we would look up the specific lat/lng in a DEM raster
  const mockElevation = terrainData 
    ? Math.floor(Math.abs(Math.sin(mousePosition.lat * 100) * 500) + 10) 
    : 0;

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/80 backdrop-blur-sm border border-cyan-500/30 rounded px-3 py-2 text-xs font-mono text-cyan-400 flex gap-4 pointer-events-none shadow-lg">
      <div className="flex flex-col">
        <span className="text-slate-500 text-[9px] uppercase tracking-wider">Coordinates</span>
        <span>
          {Math.abs(mousePosition.lat).toFixed(5)}° {mousePosition.lat >= 0 ? 'N' : 'S'}
          <br/>
          {Math.abs(mousePosition.lng).toFixed(5)}° {mousePosition.lng >= 0 ? 'E' : 'W'}
        </span>
      </div>
      {terrainData && (
        <div className="flex flex-col border-l border-cyan-500/30 pl-4">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider">Elevation</span>
          <span className="text-emerald-400">{mockElevation} m</span>
        </div>
      )}
    </div>
  );
}
