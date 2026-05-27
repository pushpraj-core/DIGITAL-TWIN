import React from 'react';
import { Polygon, Tooltip } from 'react-leaflet';
import { useMissionStore } from '../../stores/missionStore';

// Define tactical colors and opacity for different terrain types
const terrainStyles: Record<string, { color: string, fillColor: string, opacity: number, fillOpacity: number, label: string, description: string }> = {
  road: { color: '#ffffff', fillColor: '#aaaaaa', opacity: 0.8, fillOpacity: 0.4, label: 'Road', description: 'Fast movement, high exposure.' },
  building: { color: '#ff4444', fillColor: '#cc0000', opacity: 0.8, fillOpacity: 0.5, label: 'Structure', description: 'Impassable. Hard cover.' },
  water: { color: '#00ccff', fillColor: '#0066cc', opacity: 0.6, fillOpacity: 0.4, label: 'Water', description: 'Impassable. Extreme exposure.' },
  vegetation: { color: '#33cc33', fillColor: '#1a661a', opacity: 0.6, fillOpacity: 0.35, label: 'Dense Vegetation', description: 'Slow movement, excellent concealment.' },
  forest: { color: '#22aa22', fillColor: '#115511', opacity: 0.7, fillOpacity: 0.4, label: 'Forest', description: 'Concealed movement, reduced speed.' },
  urban: { color: '#888888', fillColor: '#444444', opacity: 0.8, fillOpacity: 0.5, label: 'Urban Zone', description: 'Complex cover. High ambush risk.' },
  obstacle: { color: '#ff8800', fillColor: '#cc6600', opacity: 0.8, fillOpacity: 0.5, label: 'Obstacle', description: 'Impassable.' },
  default: { color: '#cccccc', fillColor: '#888888', opacity: 0.4, fillOpacity: 0.2, label: 'Terrain', description: 'Standard terrain.' },
};

export default function TerrainOverlay() {
  const terrainData = useMissionStore((s) => s.terrainData);

  if (!terrainData || !terrainData.segments || terrainData.segments.length === 0) {
    return null;
  }

  return (
    <>
      {terrainData.segments.map((segment, index) => {
        const style = terrainStyles[segment.type] || terrainStyles.default;
        
        // Convert to LatLngExpression format [lat, lng]
        const positions = segment.polygon.map(p => [p.lat, p.lng] as [number, number]);

        return (
          <Polygon
            key={`terrain-${index}`}
            positions={positions}
            pathOptions={{
              color: style.color,
              fillColor: style.fillColor,
              weight: 1,
              opacity: style.opacity,
              fillOpacity: style.fillOpacity,
              className: 'terrain-polygon',
            }}
          >
            <Tooltip
              sticky
              direction="auto"
              className="!bg-slate-900/90 !border !border-cyan-500/30 !text-slate-200 !shadow-lg"
            >
              <div className="font-mono text-xs max-w-[150px]">
                <strong style={{ color: style.color }}>{style.label}</strong>
                <div className="text-[10px] text-slate-400 mt-1">
                  {style.description}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  Conf: {(segment.confidence * 100).toFixed(0)}%
                </div>
              </div>
            </Tooltip>
          </Polygon>
        );
      })}
    </>
  );
}
