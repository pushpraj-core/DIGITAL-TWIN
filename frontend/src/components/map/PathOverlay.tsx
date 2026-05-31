import React from 'react';
import { Polyline, Tooltip, CircleMarker } from 'react-leaflet';
import { useMissionStore } from '../../stores/missionStore';
import { formatDistance, formatDuration } from '../../utils/format';

export default function PathOverlay() {
  const routes = useMissionStore((s) => s.routes);
  const selectedRouteId = useMissionStore((s) => s.selectedRouteId);

  if (routes.length === 0) return null;

  return (
    <>
      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        const positions = route.path.map((p) => [p.lat, p.lng] as [number, number]);

        return (
          <React.Fragment key={route.id}>
            {/* Outer glow for selected route */}
            {isSelected && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: route.color,
                  weight: 12,
                  opacity: 0.1,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            {/* Mid glow */}
            {isSelected && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: route.color,
                  weight: 6,
                  opacity: 0.25,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
            )}
            {/* Main route line */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: route.color,
                weight: isSelected ? 3.5 : 2,
                opacity: isSelected ? 1 : 0.5,
                dashArray: isSelected ? '12 6' : '6 8',
                lineCap: 'round',
                lineJoin: 'round',
                className: isSelected ? 'animated-path' : '',
              }}
            >
              <Tooltip
                permanent={isSelected}
                direction="center"
                className="!bg-transparent !border-0 !shadow-none"
              >
                <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-cyan-500/20 text-[10px] font-mono text-slate-300 whitespace-nowrap shadow-lg">
                  <span className="text-cyan-400 font-bold">{route.name}</span>
                  <br />
                  {formatDistance(route.distance)} · {formatDuration(route.estimated_time)}
                  {route.risk_score !== undefined && (
                    <>
                      <br />
                      <span className={
                        route.risk_score > 0.6 ? 'text-red-400' :
                        route.risk_score > 0.3 ? 'text-amber-400' : 'text-emerald-400'
                      }>
                        Risk: {(route.risk_score * 100).toFixed(0)}%
                      </span>
                    </>
                  )}
                </div>
              </Tooltip>
            </Polyline>

            {/* Waypoint dots along the route (for selected route only) */}
            {isSelected && positions.length > 2 && (
              <>
                {positions.filter((_, i) => i > 0 && i < positions.length - 1 && i % Math.max(1, Math.floor(positions.length / 8)) === 0)
                  .map((pos, idx) => (
                    <CircleMarker
                      key={`wp-${route.id}-${idx}`}
                      center={pos}
                      radius={3}
                      pathOptions={{
                        color: route.color,
                        fillColor: route.color,
                        fillOpacity: 0.8,
                        weight: 1,
                        opacity: 0.6,
                      }}
                    />
                  ))}
              </>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
}
