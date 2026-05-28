import React, { useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker, Popup, Polygon, useMap, Rectangle } from 'react-leaflet';
import L from 'leaflet';
import api from '../../services/api';
import { useMapStore } from '../../stores/mapStore';
import { useUIStore } from '../../stores/uiStore';
import { useMissionStore } from '../../stores/missionStore';
import HeatmapOverlay from './HeatmapOverlay';
import PathOverlay from './PathOverlay';
import ThreatMarkers from './ThreatMarkers';
import TerrainOverlay from './TerrainOverlay';

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
  const map = useMap();
  const clickMode = useUIStore((s) => s.clickMode);
  const setClickMode = useUIStore((s) => s.setClickMode);
  const startPoint = useMapStore((s) => s.startPoint);
  const setStartPoint = useMapStore((s) => s.setStartPoint);
  const setEndPoint = useMapStore((s) => s.setEndPoint);
  const setMousePosition = useMapStore((s) => s.setMousePosition);
  const setBounds = useMapStore((s) => s.setBounds);
  const addThreat = useMissionStore((s) => s.addThreat);
  const activeThreatType = useUIStore((s) => s.activeThreatType);

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
                terrain_id: terrainData.id,
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
        case 'area': {
          // Calculate a fixed 2km x 2km bounding box around the click
          const offset = 0.015; // Roughly 1.5km
          const clickBounds = {
            min_lat: point.lat - offset,
            max_lat: point.lat + offset,
            min_lng: point.lng - offset,
            max_lng: point.lng + offset,
          };
          
          useMapStore.getState().setAutoSync(false); // Disable auto-sync so it doesn't overwrite
          useMapStore.getState().setBounds(clickBounds);
          useMissionStore.getState().setIsFetchingTerrain(true);
          
          api.post('/terrain/fetch_live', { bounds: clickBounds })
            .then((response) => {
              useMissionStore.getState().setTerrainData(response.data);
            })
            .catch((err) => console.error("Click fetch failed:", err))
            .finally(() => {
              useMissionStore.getState().setIsFetchingTerrain(false);
            });

          map.panTo(point, { animate: true, duration: 1.0 });
          break;
        }
        default:
          break;
      }
    },
    [clickMode, startPoint, setStartPoint, setEndPoint, setClickMode, addThreat, activeThreatType, map]
  );

  const throttleTimeout = useRef<number | null>(null);

  useMapEvents({
    mousemove: (e) => {
      if (throttleTimeout.current) return;
      throttleTimeout.current = window.setTimeout(() => {
        setMousePosition({ lat: e.latlng.lat, lng: e.latlng.lng });
        throttleTimeout.current = null;
      }, 50); // 50ms throttle (~20fps update rate is fine for coords)
    },
    click: handleClick,
    moveend: () => {
      // Auto-fetch Live Area if autoSync is enabled
      const autoSync = useMapStore.getState().autoSync;
      if (autoSync) {
        const b = map.getBounds();
        const newBounds = {
          min_lat: b.getSouth(),
          max_lat: b.getNorth(),
          min_lng: b.getWest(),
          max_lng: b.getEast(),
        };
        setBounds(newBounds);
        useMissionStore.getState().setIsFetchingTerrain(true);
        api.post('/terrain/fetch_live', { bounds: newBounds })
          .then((response) => {
            useMissionStore.getState().setTerrainData(response.data);
          })
          .catch((err) => console.error("Auto-sync fetch failed:", err))
          .finally(() => {
            useMissionStore.getState().setIsFetchingTerrain(false);
          });
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
  const activeThreatType = useUIStore((s) => s.activeThreatType);
  const bounds = useMapStore((s) => s.bounds);
  const visibility = useMissionStore((s) => s.visibility);
  const layers = useMapStore((s) => s.layers);


  const isLayerVisible = (id: string) => layers.find((l) => l.id === id)?.visible ?? false;
  const terrainData = useMissionStore((s) => s.terrainData);
  const isFetching = useMissionStore((s) => s.isFetchingTerrain);
  const clickMode = useUIStore((s) => s.clickMode);

  return (
    <div className="w-full h-full relative">
      {/* Empty state overlay when no terrain is loaded */}
      {!terrainData && !isFetching && (
        <div className="absolute inset-0 z-[800] pointer-events-none flex items-center justify-center">
          <div className="text-center pointer-events-none">
            <div className="bg-slate-900/70 backdrop-blur-sm border border-cyan-500/20 rounded-xl px-8 py-6 shadow-[0_0_40px_rgba(0,240,255,0.08)]">
              <div className="w-10 h-10 mx-auto mb-3 rounded-full border-2 border-cyan-500/30 flex items-center justify-center">
                <span className="text-cyan-400 text-lg">⊕</span>
              </div>
              <h3 className="text-cyan-400 font-bold text-sm mb-1">Click to Select Mission Area</h3>
              <p className="text-slate-500 text-xs max-w-[220px]">Click anywhere on the map to define a ~3km tactical area</p>
            </div>
          </div>
        </div>
      )}

      {/* Fetching terrain spinner overlay */}
      {isFetching && (
        <div className="absolute inset-0 z-[900] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-cyan-400 font-bold text-sm animate-pulse">Downloading Mission Area...</p>
            <p className="text-slate-500 text-xs mt-1">Fetching satellite, terrain, and elevation data</p>
          </div>
        </div>
      )}
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={zoom}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={true}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        maxZoom={19}
      />
      {/* City labels, roads, borders overlay */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={20}
        pane="overlayPane"
      />

      <MapEventHandler />

      {bounds && !useMapStore.getState().autoSync && (
        <Rectangle
          bounds={[
            [bounds.min_lat, bounds.min_lng],
            [bounds.max_lat, bounds.max_lng],
          ]}
          pathOptions={{
            color: '#06b6d4', // cyan-500
            weight: 2,
            fillOpacity: 0.05,
            dashArray: '8, 8',
            className: 'pointer-events-none'
          }}
        />
      )}

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
      {isLayerVisible('terrain') && <TerrainOverlay />}
      {isLayerVisible('heatmap') && <HeatmapOverlay />}
      {isLayerVisible('routes') && <PathOverlay />}
      {isLayerVisible('threats') && <ThreatMarkers />}

      {/* Visibility Polygon Overlay */}
      {isLayerVisible('visibility') && visibility && (
        <>
          {visibility.visible_zones.length > 0 && (
            <Polygon 
              positions={visibility.visible_zones as any} 
              pathOptions={{ color: '#00f0ff', fillColor: '#00f0ff', fillOpacity: 0.3, weight: 1 }} 
            />
          )}
          {visibility.hidden_zones.length > 0 && (
            <Polygon 
              positions={visibility.hidden_zones as any} 
              pathOptions={{ color: '#333333', fillColor: '#000000', fillOpacity: 0.6, weight: 1 }} 
            />
          )}
        </>
      )}
    </MapContainer>
    </div>
  );
}
