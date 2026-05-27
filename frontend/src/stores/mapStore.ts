import { create } from 'zustand';
import type { MapLayer, LatLng } from '../types';

interface MapState {
  center: LatLng;
  zoom: number;
  layers: MapLayer[];
  selectedPoint: LatLng | null;
  startPoint: LatLng | null;
  endPoint: LatLng | null;
  mousePosition: LatLng | null;
  coordinateFormat: 'decimal' | 'dms';
  bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number } | null;
  autoSync: boolean;

  setCenter: (center: LatLng) => void;
  setZoom: (zoom: number) => void;
  toggleLayer: (layerId: string) => void;
  setLayerOpacity: (layerId: string, opacity: number) => void;
  setSelectedPoint: (point: LatLng | null) => void;
  setStartPoint: (point: LatLng | null) => void;
  setEndPoint: (point: LatLng | null) => void;
  setMousePosition: (position: LatLng | null) => void;
  setCoordinateFormat: (format: 'decimal' | 'dms') => void;
  setBounds: (bounds: { min_lat: number; max_lat: number; min_lng: number; max_lng: number }) => void;
  setAutoSync: (val: boolean) => void;
  resetPoints: () => void;
}

const defaultLayers: MapLayer[] = [
  { id: 'terrain', name: 'Terrain Analysis', visible: false, type: 'terrain', opacity: 0.7 },
  { id: 'heatmap', name: 'Risk Heatmap', visible: false, type: 'heatmap', opacity: 0.6 },
  { id: 'routes', name: 'Route Paths', visible: true, type: 'routes', opacity: 1 },
  { id: 'threats', name: 'Threat Markers', visible: true, type: 'threats', opacity: 0.9 },
  { id: 'visibility', name: 'Visibility Zones', visible: false, type: 'visibility', opacity: 0.5 },
  { id: 'grid', name: 'Tactical Grid', visible: false, type: 'grid', opacity: 0.3 },
];

export const useMapStore = create<MapState>((set) => ({
  center: { lat: 34.0522, lng: -118.2437 },
  zoom: 13,
  layers: defaultLayers,
  selectedPoint: null,
  startPoint: null,
  endPoint: null,
  mousePosition: null,
  coordinateFormat: 'decimal',
  bounds: null,
  autoSync: true,

  setCenter: (center) => set({ center }),
  setZoom: (zoom) => set({ zoom }),

  toggleLayer: (layerId) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, visible: !l.visible } : l
      ),
    })),

  setLayerOpacity: (layerId, opacity) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === layerId ? { ...l, opacity } : l
      ),
    })),

  setSelectedPoint: (point) => set({ selectedPoint: point }),
  setStartPoint: (point) => set({ startPoint: point }),
  setEndPoint: (point) => set({ endPoint: point }),
  setMousePosition: (position) => set({ mousePosition: position }),
  setCoordinateFormat: (format) => set({ coordinateFormat: format }),
  setBounds: (bounds) => set({ bounds }),
  setAutoSync: (val) => set({ autoSync: val }),
  resetPoints: () => set({ startPoint: null, endPoint: null, selectedPoint: null }),
}));
