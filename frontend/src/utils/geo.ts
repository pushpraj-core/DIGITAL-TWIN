import type { LatLng } from '../types';

const EARTH_RADIUS_KM = 6371;

/** Haversine distance between two points in kilometers */
export function calculateDistance(a: LatLng, b: LatLng): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinDlat = Math.sin(dLat / 2);
  const sinDlng = Math.sin(dLng / 2);
  const h =
    sinDlat * sinDlat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinDlng * sinDlng;
  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Total distance along a path */
export function pathDistance(path: LatLng[]): number {
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    total += calculateDistance(path[i - 1], path[i]);
  }
  return total;
}

/** Generate a grid of LatLng points within bounds */
export function generateGrid(
  bounds: { north: number; south: number; east: number; west: number },
  resolution: number
): LatLng[][] {
  const grid: LatLng[][] = [];
  const latStep = (bounds.north - bounds.south) / resolution;
  const lngStep = (bounds.east - bounds.west) / resolution;

  for (let i = 0; i < resolution; i++) {
    const row: LatLng[] = [];
    for (let j = 0; j < resolution; j++) {
      row.push({
        lat: bounds.south + i * latStep + latStep / 2,
        lng: bounds.west + j * lngStep + lngStep / 2,
      });
    }
    grid.push(row);
  }
  return grid;
}

/** Convert degrees to radians */
function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Convert decimal degrees to DMS string */
export function decimalToDMS(decimal: number, isLat: boolean): string {
  const direction = isLat
    ? decimal >= 0 ? 'N' : 'S'
    : decimal >= 0 ? 'E' : 'W';
  const abs = Math.abs(decimal);
  const degrees = Math.floor(abs);
  const minutesDecimal = (abs - degrees) * 60;
  const minutes = Math.floor(minutesDecimal);
  const seconds = ((minutesDecimal - minutes) * 60).toFixed(1);
  return `${degrees}°${minutes}'${seconds}"${direction}`;
}

/** Get bearing between two points */
export function getBearing(from: LatLng, to: LatLng): number {
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Interpolate a point along a path at a fraction t (0-1) */
export function interpolatePath(path: LatLng[], t: number): LatLng {
  if (path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1 || t <= 0) return path[0];
  if (t >= 1) return path[path.length - 1];

  const totalDist = pathDistance(path);
  const targetDist = totalDist * t;
  let accumulated = 0;

  for (let i = 1; i < path.length; i++) {
    const segDist = calculateDistance(path[i - 1], path[i]);
    if (accumulated + segDist >= targetDist) {
      const segT = (targetDist - accumulated) / segDist;
      return {
        lat: path[i - 1].lat + segT * (path[i].lat - path[i - 1].lat),
        lng: path[i - 1].lng + segT * (path[i].lng - path[i - 1].lng),
      };
    }
    accumulated += segDist;
  }
  return path[path.length - 1];
}
