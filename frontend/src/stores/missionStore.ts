import { create } from 'zustand';
import type {
  TerrainData,
  RiskHeatmap,
  Route,
  Threat,
  VisibilityResult,
  MissionTimeline,
  MissionType,
} from '../types';

interface MissionState {
  terrainData: TerrainData | null;
  riskHeatmap: RiskHeatmap | null;
  routes: Route[];
  threats: Threat[];
  visibility: VisibilityResult | null;
  missionTimeline: MissionTimeline | null;
  missionType: MissionType;
  isAnalyzing: boolean;
  isPlanning: boolean;
  activePanel: string;
  selectedRouteId: string | null;

  setTerrainData: (data: TerrainData | null) => void;
  setRiskHeatmap: (heatmap: RiskHeatmap | null) => void;
  setRoutes: (routes: Route[]) => void;
  addThreat: (threat: Threat) => void;
  removeThreat: (id: string) => void;
  updateThreat: (id: string, updates: Partial<Threat>) => void;
  setMissionType: (type: MissionType) => void;
  setVisibility: (vis: VisibilityResult | null) => void;
  setMissionTimeline: (timeline: MissionTimeline | null) => void;
  setIsAnalyzing: (val: boolean) => void;
  setIsPlanning: (val: boolean) => void;
  setActivePanel: (panel: string) => void;
  setSelectedRouteId: (id: string | null) => void;
  clearAll: () => void;
}

export const useMissionStore = create<MissionState>((set) => ({
  terrainData: null,
  riskHeatmap: null,
  routes: [],
  threats: [],
  visibility: null,
  missionTimeline: null,
  missionType: 'safest',
  isAnalyzing: false,
  isPlanning: false,
  activePanel: 'upload',
  selectedRouteId: null,

  setTerrainData: (data) => set({ terrainData: data }),
  setRiskHeatmap: (heatmap) => set({ riskHeatmap: heatmap }),
  setRoutes: (routes) => set({ routes }),
  addThreat: (threat) =>
    set((state) => ({ threats: [...state.threats, threat] })),
  removeThreat: (id) =>
    set((state) => ({ threats: state.threats.filter((t) => t.id !== id) })),
  updateThreat: (id, updates) =>
    set((state) => ({
      threats: state.threats.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  setMissionType: (type) => set({ missionType: type }),
  setVisibility: (vis) => set({ visibility: vis }),
  setMissionTimeline: (timeline) => set({ missionTimeline: timeline }),
  setIsAnalyzing: (val) => set({ isAnalyzing: val }),
  setIsPlanning: (val) => set({ isPlanning: val }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setSelectedRouteId: (id) => set({ selectedRouteId: id }),
  clearAll: () =>
    set({
      terrainData: null,
      riskHeatmap: null,
      routes: [],
      threats: [],
      visibility: null,
      missionTimeline: null,
      selectedRouteId: null,
    }),
}));
