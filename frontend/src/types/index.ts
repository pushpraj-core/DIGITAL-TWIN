/* ═══════════════════════════════════════════════════════════════
   TACTICAL DIGITAL TWIN — TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

export interface LatLng {
  lat: number;
  lng: number;
}

export type TerrainSegmentType =
  | 'road'
  | 'building'
  | 'water'
  | 'vegetation'
  | 'bridge'
  | 'open'
  | 'obstacle'
  | 'hill'
  | 'urban';

export type TerrainClass =
  | 'safe'
  | 'exposed'
  | 'obstacle'
  | 'high_ground'
  | 'urban'
  | 'forest';

export interface TerrainSegment {
  type: TerrainSegmentType;
  polygon: LatLng[];
  confidence: number;
}

export interface TerrainData {
  id: string;
  name: string;
  segments: TerrainSegment[];
  layers: string[];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface RiskCell {
  x: number;
  y: number;
  risk_score: number;
  risk_level: RiskLevel;
}

export interface RiskHeatmap {
  grid: RiskCell[][];
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface Route {
  id: string;
  name: string;
  path: LatLng[];
  distance: number;
  estimated_time: number;
  exposure_score: number;
  risk_score: number;
  color: string;
}

export type MissionType =
  | 'stealth'
  | 'fastest'
  | 'safest'
  | 'reconnaissance'
  | 'extraction';

export type ThreatType =
  | 'checkpoint'
  | 'sniper'
  | 'tower'
  | 'blocked_road'
  | 'danger_zone';

export interface Threat {
  id: string;
  type: ThreatType;
  position: LatLng;
  radius: number;
  active: boolean;
}

export interface VisibilityResult {
  visible_zones: LatLng[][];
  hidden_zones: LatLng[][];
  los_lines: { from: LatLng; to: LatLng; visible: boolean }[];
}

export interface MissionEvent {
  timestamp: number;
  type: 'waypoint' | 'alert' | 'observation' | 'threat' | 'start' | 'end';
  position: LatLng;
  description: string;
}

export interface MissionTimeline {
  events: MissionEvent[];
  duration: number;
}

export interface WhatIfScenario {
  id: string;
  type: 'road_blocked' | 'new_threat' | 'weather_change' | 'custom';
  description: string;
  params: Record<string, unknown>;
}

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: AIAction[];
}

export interface AIAction {
  label: string;
  type: 'show_on_map' | 'highlight_route' | 'zoom_to' | 'toggle_layer';
  payload?: Record<string, unknown>;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'terrain' | 'heatmap' | 'routes' | 'threats' | 'visibility' | 'grid';
  data?: unknown;
  opacity: number;
}
