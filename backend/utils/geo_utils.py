"""
Geospatial utility functions used across the platform.

Every function is pure-Python / NumPy — no heavy GIS libraries required.
"""

from __future__ import annotations

import math
from typing import Sequence

import numpy as np


# ── Constants ───────────────────────────────────────────────────────────────

EARTH_RADIUS_M = 6_371_000.0


# ── Distance & Bearing ──────────────────────────────────────────────────────


def haversine_distance(
    lat1: float, lng1: float, lat2: float, lng2: float
) -> float:
    """Return the great-circle distance in **metres** between two WGS-84 points."""
    rlat1, rlng1, rlat2, rlng2 = map(math.radians, (lat1, lng1, lat2, lng2))
    dlat = rlat2 - rlat1
    dlng = rlng2 - rlng1
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(rlat1) * math.cos(rlat2) * math.sin(dlng / 2) ** 2
    )
    return EARTH_RADIUS_M * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def bearing(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Return the initial bearing (degrees, 0-360) from point 1 → point 2."""
    rlat1, rlng1, rlat2, rlng2 = map(math.radians, (lat1, lng1, lat2, lng2))
    dlng = rlng2 - rlng1
    x = math.sin(dlng) * math.cos(rlat2)
    y = math.cos(rlat1) * math.sin(rlat2) - math.sin(rlat1) * math.cos(
        rlat2
    ) * math.cos(dlng)
    return (math.degrees(math.atan2(x, y)) + 360) % 360


# ── Point-in-Polygon (ray-casting) ─────────────────────────────────────────


def point_in_polygon(
    point: tuple[float, float],
    polygon: Sequence[tuple[float, float]],
) -> bool:
    """Return *True* if *point* (x, y) lies inside *polygon* (list of (x, y)).

    Uses the ray-casting algorithm.
    """
    x, y = point
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]
        xj, yj = polygon[j]
        if ((yi > y) != (yj > y)) and (x < (xj - xi) * (y - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside


# ── Bresenham's Line Algorithm ──────────────────────────────────────────────


def bresenham_line(
    x0: int, y0: int, x1: int, y1: int
) -> list[tuple[int, int]]:
    """Return all grid cells along the line from (x0, y0) to (x1, y1).

    Classic Bresenham integer-only line rasterisation.
    """
    cells: list[tuple[int, int]] = []
    dx = abs(x1 - x0)
    dy = -abs(y1 - y0)
    sx = 1 if x0 < x1 else -1
    sy = 1 if y0 < y1 else -1
    err = dx + dy  # note: dy is negative
    while True:
        cells.append((x0, y0))
        if x0 == x1 and y0 == y1:
            break
        e2 = 2 * err
        if e2 >= dy:
            err += dy
            x0 += sx
        if e2 <= dx:
            err += dx
            y0 += sy
    return cells


# ── Grid <-> Lat/Lng Conversion ─────────────────────────────────────────────


def generate_grid(
    bounds: dict[str, float], resolution: int
) -> np.ndarray:
    """Create a *resolution × resolution* 2-D float grid of zeros.

    *bounds* must contain keys: min_lat, max_lat, min_lng, max_lng.
    """
    return np.zeros((resolution, resolution), dtype=np.float32)


def lat_lng_to_grid(
    lat: float,
    lng: float,
    bounds: dict[str, float],
    grid_shape: tuple[int, int],
) -> tuple[int, int]:
    """Convert a (lat, lng) coordinate to (row, col) in the grid.

    Row 0 is the *top* of the grid (max_lat).
    """
    rows, cols = grid_shape
    lat_range = bounds["max_lat"] - bounds["min_lat"]
    lng_range = bounds["max_lng"] - bounds["min_lng"]

    if lat_range == 0 or lng_range == 0:
        return 0, 0

    row = int((bounds["max_lat"] - lat) / lat_range * (rows - 1))
    col = int((lng - bounds["min_lng"]) / lng_range * (cols - 1))
    row = max(0, min(rows - 1, row))
    col = max(0, min(cols - 1, col))
    return row, col


def grid_to_lat_lng(
    row: int,
    col: int,
    bounds: dict[str, float],
    grid_shape: tuple[int, int],
) -> tuple[float, float]:
    """Convert a grid (row, col) back to (lat, lng)."""
    rows, cols = grid_shape
    lat_range = bounds["max_lat"] - bounds["min_lat"]
    lng_range = bounds["max_lng"] - bounds["min_lng"]

    lat = bounds["max_lat"] - (row / max(rows - 1, 1)) * lat_range
    lng = bounds["min_lng"] + (col / max(cols - 1, 1)) * lng_range
    return lat, lng
