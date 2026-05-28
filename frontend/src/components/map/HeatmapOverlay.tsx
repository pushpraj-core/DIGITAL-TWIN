import React, { useMemo } from 'react';
import { Rectangle, useMap } from 'react-leaflet';
import { useMissionStore } from '../../stores/missionStore';
import { useMapStore } from '../../stores/mapStore';
import { riskToHeatColor } from '../../utils/colors';

const HeatmapOverlay = React.memo(() => {
  const riskHeatmap = useMissionStore((s) => s.riskHeatmap);
  const layers = useMapStore((s) => s.layers);
  const heatmapLayer = layers.find((l) => l.id === 'heatmap');
  const opacity = heatmapLayer?.opacity ?? 0.6;

  // Downsample large grids for performance
  const cells = useMemo(() => {
    if (!riskHeatmap || !riskHeatmap.grid || !riskHeatmap.grid.length) return null;

    const { bounds, grid } = riskHeatmap;
    const rows = grid.length;
    const cols = grid[0]?.length ?? 0;
    if (rows === 0 || cols === 0) return null;

    const latStep = (bounds.max_lat - bounds.min_lat) / rows;
    const lngStep = (bounds.max_lng - bounds.min_lng) / cols;

    // Skip cells with very low risk for performance
    const result: Array<{
      south: number;
      north: number;
      west: number;
      east: number;
      score: number;
    }> = [];

    // Downsample if grid is too large (> 50x50)
    const stepR = rows > 50 ? Math.ceil(rows / 50) : 1;
    const stepC = cols > 50 ? Math.ceil(cols / 50) : 1;
    const adjLatStep = latStep * stepR;
    const adjLngStep = lngStep * stepC;

    for (let i = 0; i < rows; i += stepR) {
      for (let j = 0; j < cols; j += stepC) {
        // Backend sends grid as float[][] — each cell is a raw number, NOT an object
        const rawCell = grid[i][j];
        const score = typeof rawCell === 'number' 
          ? rawCell 
          : (rawCell as any)?.risk_score ?? 0;

        // Skip very low risk cells for cleaner overlay
        if (score < 0.05) continue;

        result.push({
          south: bounds.min_lat + i * latStep,
          north: bounds.min_lat + i * latStep + adjLatStep,
          west: bounds.min_lng + j * lngStep,
          east: bounds.min_lng + j * lngStep + adjLngStep,
          score,
        });
      }
    }

    return result;
  }, [riskHeatmap]);

  if (!cells) return null;

  return (
    <>
      {cells.map((cell, idx) => (
        <Rectangle
          key={idx}
          bounds={[
            [cell.south, cell.west],
            [cell.north, cell.east],
          ]}
          pathOptions={{
            color: 'transparent',
            fillColor: riskToHeatColor(cell.score, 1),
            fillOpacity: opacity * Math.min(cell.score * 0.9, 0.7),
            weight: 0,
          }}
        />
      ))}
    </>
  );
});

export default HeatmapOverlay;
