import React from 'react';
import { Polyline, Tooltip } from 'react-leaflet';
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
            {/* Glow effect for selected route */}
            {isSelected && (
              <Polyline
                positions={positions}
                pathOptions={{
                  color: route.color,
                  weight: 8,
                  opacity: 0.2,
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
                weight: isSelected ? 4 : 2.5,
                opacity: isSelected ? 1 : 0.6,
                dashArray: isSelected ? undefined : '8 6',
                lineCap: 'round',
                lineJoin: 'round',
              }}
            >
              <Tooltip
                permanent={isSelected}
                direction="center"
                className="!bg-transparent !border-0 !shadow-none"
              >
                <div className="px-2 py-1 rounded bg-slate-900/90 border border-cyan-500/20 text-[10px] font-mono text-slate-300 whitespace-nowrap">
                  <span className="text-cyan-400 font-bold">{route.name}</span>
                  <br />
                  {formatDistance(route.distance)} · {formatDuration(route.estimated_time)}
                </div>
              </Tooltip>
            </Polyline>
          </React.Fragment>
        );
      })}
    </>
  );
}
