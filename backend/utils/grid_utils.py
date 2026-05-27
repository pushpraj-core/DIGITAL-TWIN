"""
Grid manipulation utilities for terrain analysis and risk computation.
"""

from __future__ import annotations

from typing import Any, Optional, Sequence

import numpy as np
from scipy.ndimage import uniform_filter


# ── Terrain class encoding ──────────────────────────────────────────────────

TERRAIN_CLASSES: dict[str, int] = {
    "unknown": 0,
    "road": 1,
    "vegetation": 2,
    "water": 3,
    "building": 4,
    "open": 5,
    "forest": 6,
    "obstacle": 7,
    "hill": 8,
    "bridge": 9,
    "urban": 10,
    "exposed": 11,
    "high_ground": 12,
    "safe": 13,
}

CLASS_TO_NAME: dict[int, str] = {v: k for k, v in TERRAIN_CLASSES.items()}


# ── Grid creation ───────────────────────────────────────────────────────────


def create_terrain_grid(
    width: int, height: int, default_class: str = "open"
) -> np.ndarray:
    """Create a *height × width* integer grid filled with *default_class*."""
    cls_id = TERRAIN_CLASSES.get(default_class, 0)
    return np.full((height, width), cls_id, dtype=np.int32)


def apply_segments_to_grid(
    grid: np.ndarray,
    segments: Sequence[dict[str, Any]],
) -> np.ndarray:
    """Paint *segments* onto *grid*.

    Each segment dict must have keys ``type`` (str) and ``polygon`` (list of
    [col, row] coordinate pairs in *grid* space).  The polygon interior is
    filled with the matching terrain class.
    """
    h, w = grid.shape[:2]
    for seg in segments:
        cls_id = TERRAIN_CLASSES.get(seg["type"], 0)
        poly = np.array(seg["polygon"], dtype=np.int32)
        if poly.ndim != 2 or poly.shape[1] != 2:
            continue
        # Create a mask for the polygon and apply
        import cv2

        mask = np.zeros((h, w), dtype=np.uint8)
        cv2.fillPoly(mask, [poly], 1)
        grid[mask == 1] = cls_id
    return grid


# ── Grid → GeoJSON ──────────────────────────────────────────────────────────


def grid_to_geojson(
    grid: np.ndarray,
    bounds: dict[str, float],
) -> dict:
    """Convert every cell in *grid* to a GeoJSON FeatureCollection of points.

    Each Feature carries ``terrain_class`` and ``value`` properties.
    """
    rows, cols = grid.shape
    lat_range = bounds.get("max_lat", 0) - bounds.get("min_lat", 0)
    lng_range = bounds.get("max_lng", 0) - bounds.get("min_lng", 0)

    features: list[dict] = []
    # Sample at most 10000 features to keep payloads manageable
    step_r = max(1, rows // 100)
    step_c = max(1, cols // 100)
    for r in range(0, rows, step_r):
        for c in range(0, cols, step_c):
            val = int(grid[r, c])
            lat = bounds.get("max_lat", 0) - (r / max(rows - 1, 1)) * lat_range
            lng = bounds.get("min_lng", 0) + (c / max(cols - 1, 1)) * lng_range
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [lng, lat],
                    },
                    "properties": {
                        "terrain_class": CLASS_TO_NAME.get(val, "unknown"),
                        "value": val,
                    },
                }
            )
    return {"type": "FeatureCollection", "features": features}


# ── Elevation helpers ───────────────────────────────────────────────────────


def compute_slope(elevation_grid: np.ndarray) -> np.ndarray:
    """Return the gradient magnitude at each cell (approximated via Sobel)."""
    gy, gx = np.gradient(elevation_grid.astype(np.float64))
    return np.sqrt(gx**2 + gy**2).astype(np.float32)


def smooth_grid(
    grid: np.ndarray, kernel_size: int = 3
) -> np.ndarray:
    """Apply a uniform (box) filter to *grid*."""
    return uniform_filter(
        grid.astype(np.float64), size=kernel_size
    ).astype(np.float32)


def generate_synthetic_elevation(
    rows: int, cols: int, seed: int = 42
) -> np.ndarray:
    """Generate a plausible synthetic elevation grid using Perlin-style noise.

    Uses multiple octaves of sine/cosine waves for a quick approximation.
    Values are in the range [0, 100] metres.
    """
    rng = np.random.default_rng(seed)
    grid = np.zeros((rows, cols), dtype=np.float32)
    for octave in range(1, 5):
        freq = octave * 2
        phase_x = rng.uniform(0, 2 * np.pi)
        phase_y = rng.uniform(0, 2 * np.pi)
        xs = np.linspace(0, freq * np.pi, cols) + phase_x
        ys = np.linspace(0, freq * np.pi, rows) + phase_y
        xv, yv = np.meshgrid(xs, ys)
        grid += (np.sin(xv) * np.cos(yv)) / octave
    # Normalise to [0, 100]
    grid -= grid.min()
    if grid.max() > 0:
        grid = grid / grid.max() * 100.0
    return grid
