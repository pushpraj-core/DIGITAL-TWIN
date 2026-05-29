import React from 'react';
import { Marker, Circle, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMissionStore } from '../../stores/missionStore';
import { threatTypeColors, threatTypeIcons, threatTypeLabels } from '../../utils/colors';

function createThreatIcon(type: string): L.DivIcon {
  const emoji = threatTypeIcons[type as keyof typeof threatTypeIcons] || '⚠';
  const color = threatTypeColors[type as keyof typeof threatTypeColors] || '#f59e0b';
  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;width:36px;height:36px;">
        <div style="
          position:absolute;inset:0;
          border-radius:50%;
          border:2px solid ${color};
          background:rgba(0,0,0,0.5);
          box-shadow:0 0 18px ${color}66, inset 0 0 8px ${color}33;
          animation: threatPulse 2s ease-in-out infinite;
        "></div>
        <span style="position:relative;font-size:16px;z-index:1;filter:drop-shadow(0 0 4px ${color});">${emoji}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
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
            {/* Outer influence radius — dashed */}
            {threat.active && (
              <Circle
                center={[threat.position.lat, threat.position.lng]}
                radius={threat.radius}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.06,
                  weight: 1.5,
                  opacity: 0.35,
                  dashArray: '8 6',
                }}
              />
            )}
            {/* Mid danger ring */}
            {threat.active && (
              <Circle
                center={[threat.position.lat, threat.position.lng]}
                radius={threat.radius * 0.6}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.1,
                  weight: 1,
                  opacity: 0.5,
                  dashArray: '4 4',
                }}
              />
            )}
            {/* Inner kill zone */}
            {threat.active && (
              <Circle
                center={[threat.position.lat, threat.position.lng]}
                radius={threat.radius * 0.25}
                pathOptions={{
                  color: color,
                  fillColor: color,
                  fillOpacity: 0.2,
                  weight: 1.5,
                  opacity: 0.7,
                }}
              />
            )}
            {/* Marker */}
            <Marker
              position={[threat.position.lat, threat.position.lng]}
              icon={createThreatIcon(threat.type)}
            >
              <Popup>
                <div className="font-mono text-xs space-y-1.5">
                  <div className="font-bold text-sm" style={{ color }}>
                    {label}
                  </div>
                  <div className="text-slate-400 flex justify-between gap-4">
                    <span>Radius</span>
                    <span className="text-slate-200">{threat.radius}m</span>
                  </div>
                  <div className="text-slate-400 flex justify-between gap-4">
                    <span>Status</span>
                    <span className={threat.active ? 'text-red-400' : 'text-slate-500'}>
                      {threat.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>
                  <div className="text-slate-500 text-[9px] font-mono">
                    [{threat.position.lat.toFixed(4)}, {threat.position.lng.toFixed(4)}]
                  </div>
                  <button
                    onClick={() => removeThreat(threat.id)}
                    className="w-full mt-1 px-3 py-1 rounded text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 cursor-pointer font-bold"
                  >
                    Remove Threat
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
