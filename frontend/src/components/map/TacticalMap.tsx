import React, { useCallback } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useMapStore } from '../../stores/mapStore';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import HeatmapOverlay from './HeatmapOverlay';
import PathOverlay from './PathOverlay';
import ThreatMarkers from './ThreatMarkers';

// Custom start marker icon
const startIcon = L.divIcon({
  className: '',
  html: `<div class="tactical-marker tactical-marker-start">S</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Custom end marker icon
const endIcon = L.divIcon({
  className: '',
  html: `<div class="tactical-marker tactical-marker-end">E</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

function MapEventHandler() {
  const setMousePosition = useMapStore((s) => s.setMousePosition);
  const setStartPoint = useMapStore((s) => s.setStartPoint);
  const setEndPoint = useMapStore((s) => s.setEndPoint);
  const startPoint = useMapStore((s) => s.startPoint);
  const clickMode = useUIStore((s) => s.clickMode);
  const setClickMode = useUIStore((s) => s.setClickMode);
  const addThreat = useMissionStore((s) => s.addThreat);

  const handleClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      const point = { lat, lng };

      switch (clickMode) {
        case 'start':
          setStartPoint(point);
          setClickMode('none');
          break;
        case 'end':
          setEndPoint(point);
          setClickMode('none');
          break;
        case 'threat':
          addThreat({
            id: `threat-${Date.now()}`,
            type: 'danger_zone',
            position: point,
            radius: 200,
            active: true,
          });
          break;
        case 'observer':
          setClickMode('none');
          break;
        default:
          // Auto: first click = start, second = end
          if (!startPoint) {
            setStartPoint(point);
          } else {
            setEndPoint(point);
          }
          break;
      }
    },
    [clickMode, startPoint, setStartPoint, setEndPoint, setClickMode, addThreat]
  );

  useMapEvents({
    mousemove: (e) => {
      setMousePosition({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
    click: handleClick,
  });

  return null;
}

export default function TacticalMap() {
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const layers = useMapStore((s) => s.layers);

  const isLayerVisible = (id: string) => layers.find((l) => l.id === id)?.visible ?? false;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
      />

      <MapEventHandler />

      {/* Start marker */}
      {startPoint && (
        <Marker
          position={[startPoint.lat, startPoint.lng]}
          icon={startIcon}
        >
          <Popup>
            <div className="font-mono text-xs">
              <strong className="text-emerald-400">START POINT</strong>
              <br />
              {startPoint.lat.toFixed(6)}, {startPoint.lng.toFixed(6)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* End marker */}
      {endPoint && (
        <Marker
          position={[endPoint.lat, endPoint.lng]}
          icon={endIcon}
        >
          <Popup>
            <div className="font-mono text-xs">
              <strong className="text-red-400">END POINT</strong>
              <br />
              {endPoint.lat.toFixed(6)}, {endPoint.lng.toFixed(6)}
            </div>
          </Popup>
        </Marker>
      )}

      {/* Conditional overlays */}
      {isLayerVisible('heatmap') && <HeatmapOverlay />}
      {isLayerVisible('routes') && <PathOverlay />}
      {isLayerVisible('threats') && <ThreatMarkers />}
    </MapContainer>
  );
}
