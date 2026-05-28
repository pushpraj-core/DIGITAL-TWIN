import type { TerrainClass, ThreatType } from '../types';

/** Maps a 0–1 risk score to a color along green→yellow→red gradient */
export function riskToColor(score: number): string {
  const clamped = Math.max(0, Math.min(1, score));
  if (clamped <= 0.33) {
    const t = clamped / 0.33;
    const r = Math.round(16 + t * (245 - 16));
    const g = Math.round(185 + t * (158 - 185));
    const b = Math.round(129 + t * (11 - 129));
    return `rgb(${r}, ${g}, ${b})`;
  }
  const t = (clamped - 0.33) / 0.67;
  const r = Math.round(245 + t * (239 - 245));
  const g = Math.round(158 - t * 158);
  const b = Math.round(11 + t * (68 - 11));
  return `rgb(${r}, ${g}, ${b})`;
}

/** Returns a hex color with alpha for risk heatmap tiles */
export function riskToHeatColor(score: number, alpha: number = 0.5): string {
  const clamped = Math.max(0, Math.min(1, score));
  if (clamped <= 0.33) return `rgba(16, 185, 129, ${alpha})`;
  if (clamped <= 0.66) return `rgba(245, 158, 11, ${alpha})`;
  return `rgba(239, 68, 68, ${alpha})`;
}

export const terrainClassColors: Record<TerrainClass, string> = {
  safe: '#10b981',
  exposed: '#f59e0b',
  obstacle: '#ef4444',
  high_ground: '#8b5cf6',
  urban: '#6366f1',
  forest: '#22c55e',
};

export const terrainClassLabels: Record<TerrainClass, string> = {
  safe: 'Safe Zone',
  exposed: 'Exposed Area',
  obstacle: 'Obstacle',
  high_ground: 'High Ground',
  urban: 'Urban Area',
  forest: 'Forest Cover',
};

export const threatTypeColors: Record<string, string> = {
  checkpoint: '#f59e0b',
  sniper: '#ef4444',
  tower: '#f97316',
  blocked_road: '#a855f7',
  danger_zone: '#dc2626',
  ied: '#ff3333',
  patrol: '#ff8c00',
  enemy_outpost: '#dc2626',
  hostile_zone: '#b91c1c',
};

export const threatTypeLabels: Record<string, string> = {
  checkpoint: 'Checkpoint',
  sniper: 'Sniper Position',
  tower: 'Watch Tower',
  blocked_road: 'Blocked Road',
  danger_zone: 'Danger Zone',
  ied: 'IED Suspected',
  patrol: 'Enemy Patrol',
  enemy_outpost: 'Enemy Outpost',
  hostile_zone: 'Hostile Zone',
};

export const threatTypeIcons: Record<string, string> = {
  checkpoint: '🛡',
  sniper: '🎯',
  tower: '🗼',
  blocked_road: '🚧',
  danger_zone: '☠',
  ied: '💣',
  patrol: '👥',
  enemy_outpost: '🏴',
  hostile_zone: '⛔',
};

export const missionTypeColors: Record<string, string> = {
  stealth: '#8b5cf6',
  fastest: '#f59e0b',
  safest: '#10b981',
  reconnaissance: '#00f0ff',
  extraction: '#ef4444',
};
