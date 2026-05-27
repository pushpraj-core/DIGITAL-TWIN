import axios from 'axios';
import type {
  TerrainData,
  RiskHeatmap,
  Route,
  MissionType,
  LatLng,
  Threat,
  VisibilityResult,
  WhatIfScenario,
  AIMessage,
} from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

export async function uploadTerrain(file: File): Promise<TerrainData> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post<TerrainData>('/terrain/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function analyzeTerrain(terrainId: string): Promise<TerrainData> {
  const { data } = await api.post<TerrainData>(`/terrain/${terrainId}/analyze`);
  return data;
}

export async function getRiskHeatmap(terrainId: string): Promise<RiskHeatmap> {
  const { data } = await api.get<RiskHeatmap>(`/terrain/${terrainId}/risk`);
  return data;
}

export async function planRoutes(params: {
  start: LatLng;
  end: LatLng;
  mission_type: MissionType;
  threats?: Threat[];
}): Promise<Route[]> {
  const { data } = await api.post<Route[]>('/routes/plan', params);
  return data;
}

export async function getVisibility(params: {
  observer: LatLng;
  angle?: number;
  range?: number;
  target?: LatLng;
}): Promise<VisibilityResult> {
  const { data } = await api.post<VisibilityResult>('/visibility/analyze', params);
  return data;
}

export async function addThreatAPI(threat: Omit<Threat, 'id'>): Promise<Threat> {
  const { data } = await api.post<Threat>('/threats', threat);
  return data;
}

export async function runWhatIf(scenario: WhatIfScenario): Promise<{
  original: Route[];
  modified: Route[];
  impact: Record<string, number>;
}> {
  const { data } = await api.post('/whatif/simulate', scenario);
  return data;
}

export async function askAssistant(
  messages: AIMessage[]
): Promise<AIMessage> {
  const { data } = await api.post<AIMessage>('/assistant/chat', { messages });
  return data;
}

export default api;
