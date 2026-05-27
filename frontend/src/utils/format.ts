/** Format distance in km with appropriate unit */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(2)}km`;
}

/** Format duration in seconds to human-readable */
export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Format risk score as percentage with label */
export function formatRiskScore(score: number): string {
  const pct = Math.round(score * 100);
  if (pct <= 30) return `${pct}% LOW`;
  if (pct <= 60) return `${pct}% MED`;
  return `${pct}% HIGH`;
}

/** Format risk score as simple percentage */
export function formatRiskPercent(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/** Format coordinates in decimal format */
export function formatCoordinates(
  lat: number,
  lng: number,
  format: 'decimal' | 'dms' = 'decimal'
): string {
  if (format === 'dms') {
    return `${toDMS(lat, true)} ${toDMS(lng, false)}`;
  }
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

function toDMS(decimal: number, isLat: boolean): string {
  const dir = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W';
  const abs = Math.abs(decimal);
  const d = Math.floor(abs);
  const mDec = (abs - d) * 60;
  const m = Math.floor(mDec);
  const s = ((mDec - m) * 60).toFixed(1);
  return `${d}°${m}'${s}"${dir}`;
}

/** Format a timestamp to HH:MM:SS */
export function formatTimestamp(seconds: number): string {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

/** Format a file size */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
