import { create } from 'zustand';

interface UIState {
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  bottomPanelOpen: boolean;
  activeRightTab: string;

  showHeatmap: boolean;
  showPaths: boolean;
  showThreats: boolean;
  showVisibility: boolean;
  showTerrain: boolean;
  show3DView: boolean;

  replaySpeed: number;
  isReplaying: boolean;
  replayProgress: number;

  clickMode: 'none' | 'start' | 'end' | 'threat' | 'observer';

  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  toggleBottomPanel: () => void;
  setActiveRightTab: (tab: string) => void;

  setShowHeatmap: (val: boolean) => void;
  setShowPaths: (val: boolean) => void;
  setShowThreats: (val: boolean) => void;
  setShowVisibility: (val: boolean) => void;
  setShowTerrain: (val: boolean) => void;
  setShow3DView: (val: boolean) => void;

  setReplaySpeed: (speed: number) => void;
  setIsReplaying: (val: boolean) => void;
  setReplayProgress: (progress: number) => void;
  setClickMode: (mode: 'none' | 'start' | 'end' | 'threat' | 'observer') => void;
}

export const useUIStore = create<UIState>((set) => ({
  leftPanelOpen: true,
  rightPanelOpen: true,
  bottomPanelOpen: false,
  activeRightTab: 'upload',

  showHeatmap: true,
  showPaths: true,
  showThreats: true,
  showVisibility: true,
  showTerrain: true,
  show3DView: false,

  replaySpeed: 1,
  isReplaying: false,
  replayProgress: 0,

  clickMode: 'none',

  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleBottomPanel: () => set((s) => ({ bottomPanelOpen: !s.bottomPanelOpen })),
  setActiveRightTab: (tab) => set({ activeRightTab: tab, rightPanelOpen: true }),

  setShowHeatmap: (val) => set({ showHeatmap: val }),
  setShowPaths: (val) => set({ showPaths: val }),
  setShowThreats: (val) => set({ showThreats: val }),
  setShowVisibility: (val) => set({ showVisibility: val }),
  setShowTerrain: (val) => set({ showTerrain: val }),
  setShow3DView: (val) => set({ show3DView: val }),

  setReplaySpeed: (speed) => set({ replaySpeed: speed }),
  setIsReplaying: (val) => set({ isReplaying: val }),
  setReplayProgress: (progress) => set({ replayProgress: progress }),
  setClickMode: (mode) => set({ clickMode: mode }),
}));
