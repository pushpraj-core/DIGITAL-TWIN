import React, { useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Polygon } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
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
  const activeThreatType = useUIStore((s) => s.activeThreatType);
  const addThreat = useMissionStore((s) => s.addThreat);
  const setBounds = useMapStore((s) => s.setBounds);

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
          if (activeThreatType) {
            addThreat({
              id: `threat-${Date.now()}`,
              type: activeThreatType,
              position: point,
              radius: 200,
              active: true,
            });
          }
          break;
        case 'observer':
          const runVisibility = async () => {
            const terrainData = useMissionStore.getState().terrainData;
            if (!terrainData) return;
            try {
              const res = await api.post('/observation/visibility', {
                terrain_id: terrainData.analysis.id,
                observer_lat: point.lat,
                observer_lng: point.lng,
                range_m: 500,
                angle_deg: 90,
                direction_deg: 0 // In a full app, this would be draggable
              });
              useMissionStore.getState().setVisibility(res.data);
            } catch (e) {
              console.error(e);
            }
          };
          runVisibility();
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
    [clickMode, startPoint, setStartPoint, setEndPoint, setClickMode, addThreat, activeThreatType]
  );

  const throttleTimeout = useRef<number | null>(null);

  const map = useMapEvents({
    mousemove: (e) => {
      if (throttleTimeout.current) return;
      throttleTimeout.current = window.setTimeout(() => {
        setMousePosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        throttleTimeout.current = null;
      }, 50); // 50ms throttle (~20fps update rate is fine for coords)
    },
    click: handleClick,
    moveend: () => {
      const b = map.getBounds();
      const newBounds = {
        min_lat: b.getSouth(),
        max_lat: b.getNorth(),
        min_lng: b.getWest(),
        max_lng: b.getEast(),
      };
      setBounds(newBounds);

      // Auto-fetch Live Area if autoSync is enabled
      const autoSync = useMapStore.getState().autoSync;
      if (autoSync) {
        api.post('/terrain/fetch_live', { bounds: newBounds })
          .then((response) => {
            useMissionStore.getState().setTerrainData(response.data);
          })
          .catch((err) => console.error("Auto-sync fetch failed:", err));
      }
    }
  });

  // Initial bounds set
  React.useEffect(() => {
    const b = map.getBounds();
    setBounds({
      min_lat: b.getSouth(),
      max_lat: b.getNorth(),
      min_lng: b.getWest(),
      max_lng: b.getEast(),
    });
  }, [map, setBounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, []);

  return null;
}

export default function TacticalMap() {
  const center = useMapStore((s) => s.center);
  const zoom = useMapStore((s) => s.zoom);
  const startPoint = useMapStore((s) => s.startPoint);
  const endPoint = useMapStore((s) => s.endPoint);
  const setStartPoint = useMapStore((s) => s.setStartPoint);
  const setEndPoint = useMapStore((s) => s.setEndPoint);
  const layers = useMapStore((s) => s.layers);
  const visibility = useMissionStore((s) => s.visibility);

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

      {startPoint && (
        <Marker
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              setStartPoint({ lat: pos.lat, lng: pos.lng });
            },
          }}
          position={[startPoint.lat, startPoint.lng]}
          icon={startIcon}
        >
          <Popup>
            <div className="font-mono text-xs">
              <strong className="text-emerald-400">START POINT</strong>
              <br />
              <span className="text-[10px] text-slate-500">Drag to move</span>
            </div>
          </Popup>
        </Marker>
      )}

      {endPoint && (
        <Marker
          draggable={true}
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const pos = marker.getLatLng();
              setEndPoint({ lat: pos.lat, lng: pos.lng });
            },
          }}
          position={[endPoint.lat, endPoint.lng]}
          icon={endIcon}
        >
          <Popup>
            <div className="font-mono text-xs">
              <strong className="text-red-400">END POINT</strong>
              <br />
              <span className="text-[10px] text-slate-500">Drag to move</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* Conditional overlays */}
      {isLayerVisible('heatmap') && <HeatmapOverlay />}
      {isLayerVisible('routes') && <PathOverlay />}
      {isLayerVisible('threats') && <ThreatMarkers />}

      {/* Visibility Polygon Overlay */}
      {isLayerVisible('visibility') && visibility && (
        <>
          {visibility.visible_zones.length > 0 && (
            <Polygon 
              positions={visibility.visible_zones as [number, number][]} 
              pathOptions={{ color: '#00f0ff', fillColor: '#00f0ff', fillOpacity: 0.3, weight: 1 }} 
            />
          )}
          {visibility.hidden_zones.length > 0 && (
            <Polygon 
              positions={visibility.hidden_zones as [number, number][]} 
              pathOptions={{ color: '#333333', fillColor: '#000000', fillOpacity: 0.6, weight: 1 }} 
            />
          )}
        </>
      )}
    </MapContainer>
  );
}
