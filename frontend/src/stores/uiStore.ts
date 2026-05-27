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

  clickMode: 'area' | 'none' | 'start' | 'end' | 'threat' | 'observer';
  activeThreatType: string | null;

  // UX additions
  missionStage: number; // 0: Upload, 1: Terrain/Risk, 2: Threats, 3: Routes, 4: Observation, 5: WhatIf/Timeline, 6: Assistant
  hasCompletedOnboarding: boolean;
  onboardingStep: number;
  showOnboarding: boolean;

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
  setClickMode: (mode: 'area' | 'none' | 'start' | 'end' | 'threat' | 'observer') => void;
  setActiveThreatType: (type: string | null) => void;

  setMissionStage: (stage: number) => void;
  setHasCompletedOnboarding: (val: boolean) => void;
  setOnboardingStep: (step: number) => void;
  setShowOnboarding: (val: boolean) => void;
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

  clickMode: 'area',
  activeThreatType: null,

  // Load from localStorage or default to false
  missionStage: 0,
  hasCompletedOnboarding: localStorage.getItem('tactical_onboarding_done') === 'true',
  onboardingStep: 0,
  showOnboarding: localStorage.getItem('tactical_onboarding_done') !== 'true',

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
  setActiveThreatType: (type) => set({ activeThreatType: type }),

  setMissionStage: (stage) => set({ missionStage: stage }),
  setHasCompletedOnboarding: (val) => {
    localStorage.setItem('tactical_onboarding_done', val.toString());
    set({ hasCompletedOnboarding: val });
  },
  setOnboardingStep: (step) => set({ onboardingStep: step }),
  setShowOnboarding: (val) => set({ showOnboarding: val }),
}));
