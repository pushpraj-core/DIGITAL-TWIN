import React from 'react';
import { Rectangle } from 'react-leaflet';
import { useMissionStore } from '../../stores/missionStore';
import { useMapStore } from '../../stores/mapStore';
import { riskToHeatColor } from '../../utils/colors';

const HeatmapOverlay = React.memo(() => {
  const riskHeatmap = useMissionStore((s) => s.riskHeatmap);
  const layers = useMapStore((s) => s.layers);
  const heatmapLayer = layers.find((l) => l.id === 'heatmap');
  const opacity = heatmapLayer?.opacity ?? 0.6;

  if (!riskHeatmap || !riskHeatmap.grid.length) return null;

  const { bounds, grid } = riskHeatmap;
  const rows = grid.length;
  const cols = grid[0].length;
  const latStep = (bounds.max_lat - bounds.min_lat) / rows;
  const lngStep = (bounds.max_lng - bounds.min_lng) / cols;

  return (
    <>
      {grid.map((row, i) =>
        row.map((cell, j) => {
          const south = bounds.min_lat + i * latStep;
          const north = south + latStep;
          const west = bounds.min_lng + j * lngStep;
          const east = west + lngStep;

          return (
            <Rectangle
              key={`${i}-${j}`}
              bounds={[
                [south, west],
                [north, east],
              ]}
              pathOptions={{
                color: 'transparent',
                fillColor: riskToHeatColor(cell.risk_score, 1),
                fillOpacity: opacity * cell.risk_score * 0.8,
                weight: 0,
              }}
            />
          );
        })
      )}
    </>
  );
});

export default HeatmapOverlay;
