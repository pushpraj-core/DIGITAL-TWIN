import React from 'react';
import { Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMissionStore } from '../../stores/missionStore';
import { threatTypeColors, threatTypeIcons, threatTypeLabels } from '../../utils/colors';

function createThreatIcon(type: string): L.DivIcon {
  const emoji = threatTypeIcons[type as keyof typeof threatTypeIcons] || '⚠';
  return L.divIcon({
    className: '',
    html: `<div class="tactical-marker tactical-marker-threat">${emoji}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function ThreatMarkers() {
  const threats = useMissionStore((s) => s.threats);
  const removeThreat = useMissionStore((s) => s.removeThreat);

  if (threats.length === 0) return null;

  return (
    <>
      {threats.map((threat) => {
        const color = threatTypeColors[threat.type] || '#f59e0b';
        const label = threatTypeLabels[threat.type] || threat.type;

        return (
          <React.Fragment key={threat.id}>
            {/* Influence radius circle */}
            {threat.active && (
              <Circle
                center={[threat.position.lat, threat.position.lng]}
                radius={threat.radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.08,
                  weight: 1.5,
                  opacity: 0.4,
                  dashArray: '6 4',
                }}
              />
            )}
            {/* Inner danger radius */}
            {threat.active && (
              <Circle
                center={[threat.position.lat, threat.position.lng]}
                radius={threat.radius * 0.4}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.15,
                  weight: 1,
                  opacity: 0.6,
                }}
              />
            )}
            {/* Marker */}
            <Marker
              position={[threat.position.lat, threat.position.lng]}
              icon={createThreatIcon(threat.type)}
            >
              <Popup>
                <div className="font-mono text-xs space-y-1">
                  <div className="font-bold" style={{ color }}>
                    {label}
                  </div>
                  <div className="text-slate-400">
                    Radius: {threat.radius}m
                  </div>
                  <div className="text-slate-400">
                    Status: {threat.active ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                  <button
                    onClick={() => removeThreat(threat.id)}
                    className="mt-1 px-2 py-0.5 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        );
      })}
    </>
  );
}
