import React, { useMemo } from 'react';
import { useMapStore } from '../../stores/mapStore';
import { useMissionStore } from '../../stores/missionStore';

export default function CoordinateOverlay() {
  const mousePosition = useMapStore(s => s.mousePosition);
  const terrainData = useMissionStore(s => s.terrainData);
  const riskHeatmap = useMissionStore(s => s.riskHeatmap);

  if (!mousePosition) return null;

  // Look up elevation from the real elevation grid
  const elevation = useMemo(() => {
    if (!terrainData || !terrainData.elevation_grid) return null;
    const grid = terrainData.elevation_grid;
    const bounds = terrainData.bounds;
    if (!bounds || !grid.length) return null;

    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return null;

    // Map mouse position to grid cell
    const latPct = (mousePosition.lat - bounds.min_lat) / (bounds.max_lat - bounds.min_lat);
    const lngPct = (mousePosition.lng - bounds.min_lng) / (bounds.max_lng - bounds.min_lng);

    if (latPct < 0 || latPct > 1 || lngPct < 0 || lngPct > 1) return null;

    const row = Math.min(Math.floor((1 - latPct) * rows), rows - 1);
    const col = Math.min(Math.floor(lngPct * cols), cols - 1);
    return Math.round(grid[row][col]);
  }, [mousePosition, terrainData]);

  // Look up risk from the real risk heatmap
  const riskScore = useMemo(() => {
    if (!riskHeatmap || !riskHeatmap.grid || !riskHeatmap.bounds) return null;
    const { grid, bounds } = riskHeatmap;
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return null;

    const latPct = (mousePosition.lat - bounds.min_lat) / (bounds.max_lat - bounds.min_lat);
    const lngPct = (mousePosition.lng - bounds.min_lng) / (bounds.max_lng - bounds.min_lng);

    if (latPct < 0 || latPct > 1 || lngPct < 0 || lngPct > 1) return null;

    const row = Math.min(Math.floor((1 - latPct) * rows), rows - 1);
    const col = Math.min(Math.floor(lngPct * cols), cols - 1);
    const rawCell = grid[row][col];
    const score = typeof rawCell === 'number' ? rawCell : 0;
    return score;
  }, [mousePosition, riskHeatmap]);

  const riskColor = riskScore !== null 
    ? riskScore > 0.6 ? 'text-red-400' : riskScore > 0.3 ? 'text-amber-400' : 'text-emerald-400'
    : '';

  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900/85 backdrop-blur-sm border border-cyan-500/20 rounded-lg px-4 py-2.5 text-xs font-mono text-cyan-400 flex gap-4 pointer-events-none shadow-[0_0_20px_rgba(0,0,0,0.4)]">
      <div className="flex flex-col">
        <span className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Coordinates</span>
        <span>
          {Math.abs(mousePosition.lat).toFixed(5)}° {mousePosition.lat >= 0 ? 'N' : 'S'}
          {' '}
          {Math.abs(mousePosition.lng).toFixed(5)}° {mousePosition.lng >= 0 ? 'E' : 'W'}
        </span>
      </div>
      {elevation !== null && (
        <div className="flex flex-col border-l border-cyan-500/20 pl-4">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Elevation</span>
          <span className="text-emerald-400">{elevation} m</span>
        </div>
      )}
      {riskScore !== null && (
        <div className="flex flex-col border-l border-cyan-500/20 pl-4">
          <span className="text-slate-500 text-[9px] uppercase tracking-wider mb-0.5">Risk</span>
          <span className={riskColor}>{(riskScore * 100).toFixed(0)}%</span>
        </div>
      )}
    </div>
  );
}
