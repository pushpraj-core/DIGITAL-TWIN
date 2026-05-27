"""
Risk Simulation Engine
=======================
Computes grid-based composite risk heatmaps by blending:

* **Visibility score** – how exposed a cell is (terrain class driven).
* **Terrain danger** – chokepoint proximity (count of obstacle neighbours).
* **Threat proximity** – inverse-square falloff from known threats.
* **Elevation risk** – lower ground ⇒ higher risk.

All weights are configurable via ``config.py``.
"""

from __future__ import annotations

import logging
from typing import Optional, Sequence

import numpy as np
from scipy.ndimage import uniform_filter

from config import (
    RISK_WEIGHT_VISIBILITY,
    RISK_WEIGHT_TERRAIN_DANGER,
    RISK_WEIGHT_THREAT_PROXIMITY,
    RISK_WEIGHT_ELEVATION,
)
from models.threat import RiskCell, RiskHeatmapResult
from utils.grid_utils import CLASS_TO_NAME, TERRAIN_CLASSES

logger = logging.getLogger(__name__)

# ── Terrain visibility lookup ───────────────────────────────────────────────
_VISIBILITY_MAP: dict[str, float] = {
    "open": 1.0,
    "exposed": 1.0,
    "road": 0.9,
    "bridge": 0.85,
    "safe": 0.5,
    "urban": 0.3,
    "building": 0.25,
    "high_ground": 0.6,
    "hill": 0.6,
    "forest": 0.1,
    "vegetation": 0.15,
    "obstacle": 0.0,
    "water": 0.0,
    "unknown": 0.5,
}


class RiskSimulationEngine:
    """Stateless engine — call ``compute_risk_heatmap`` with grids and threats."""

    # ── Public API ──────────────────────────────────────────────────────────

    def compute_risk_heatmap(
        self,
        terrain_grid: np.ndarray,
        threats: Optional[Sequence[dict]] = None,
        elevation_grid: Optional[np.ndarray] = None,
        bounds: Optional[dict[str, float]] = None,
    ) -> RiskHeatmapResult:
        """Compute a composite risk heatmap.

        Parameters
        ----------
        terrain_grid : np.ndarray (H, W) int
            Terrain class IDs.
        threats : list of dicts, optional
            Each dict has keys ``lat``, ``lng``, ``radius``, ``type``.
        elevation_grid : np.ndarray (H, W) float, optional
            Elevation in metres.  If *None*, a flat plane is assumed.
        bounds : dict, optional
            Geographic bounds for threat distance calculations.

        Returns
        -------
        RiskHeatmapResult
        """
        rows, cols = terrain_grid.shape
        threats = threats or []

        if elevation_grid is None:
            elevation_grid = np.zeros((rows, cols), dtype=np.float32)
        if bounds is None:
            bounds = {"min_lat": 0, "max_lat": 1, "min_lng": 0, "max_lng": 1}

        # Component scores (each in [0, 1])
        vis_score = self._visibility_score(terrain_grid)
        terrain_danger = self._terrain_danger(terrain_grid)
        threat_prox = self._threat_proximity(
            rows, cols, threats, bounds
        )
        elev_risk = self._elevation_risk(elevation_grid)

        # Composite
        composite = (
            RISK_WEIGHT_VISIBILITY * vis_score
            + RISK_WEIGHT_TERRAIN_DANGER * terrain_danger
            + RISK_WEIGHT_THREAT_PROXIMITY * threat_prox
            + RISK_WEIGHT_ELEVATION * elev_risk
        )

        # Normalise to [0, 1]
        c_min, c_max = composite.min(), composite.max()
        if c_max - c_min > 1e-9:
            composite = (composite - c_min) / (c_max - c_min)
        else:
            composite = np.zeros_like(composite)

        # Smooth slightly
        composite = uniform_filter(composite, size=3)
        composite = np.clip(composite, 0.0, 1.0)

        # Stats
        stats = {
            "mean_risk": round(float(composite.mean()), 4),
            "max_risk": round(float(composite.max()), 4),
            "min_risk": round(float(composite.min()), 4),
            "high_risk_pct": round(
                float(np.mean(composite > 0.66) * 100), 2
            ),
            "low_risk_pct": round(
                float(np.mean(composite < 0.33) * 100), 2
            ),
        }

        return RiskHeatmapResult(
            grid=composite.tolist(),
            bounds=bounds,
            stats=stats,
        )

    def detect_chokepoints(
        self, terrain_grid: np.ndarray
    ) -> list[tuple[int, int]]:
        """Find narrow passages: traversable cells with ≥3 obstacle neighbours."""
        rows, cols = terrain_grid.shape
        obstacle_id = TERRAIN_CLASSES.get("obstacle", 7)
        water_id = TERRAIN_CLASSES.get("water", 3)
        chokepoints: list[tuple[int, int]] = []

        for r in range(1, rows - 1):
            for c in range(1, cols - 1):
                if terrain_grid[r, c] in (obstacle_id, water_id):
                    continue  # cell itself is impassable
                # Count impassable neighbours (8-connected)
                neighbours = terrain_grid[r - 1 : r + 2, c - 1 : c + 2].ravel()
                block_count = int(
                    np.isin(neighbours, [obstacle_id, water_id]).sum()
                )
                # Exclude centre cell
                if terrain_grid[r, c] in (obstacle_id, water_id):
                    block_count -= 1
                if block_count >= 3:
                    chokepoints.append((r, c))

        return chokepoints

    def compute_ambush_probability(
        self,
        terrain_grid: np.ndarray,
        risk_grid: np.ndarray,
    ) -> np.ndarray:
        """Heuristic ambush probability: high risk + nearby cover = danger.

        Returns a float array [0, 1] of the same shape as *terrain_grid*.
        """
        rows, cols = terrain_grid.shape
        forest_id = TERRAIN_CLASSES.get("forest", 6)
        urban_id = TERRAIN_CLASSES.get("urban", 10)
        building_id = TERRAIN_CLASSES.get("building", 4)

        cover_mask = np.isin(terrain_grid, [forest_id, urban_id, building_id]).astype(
            np.float32
        )
        # Dilate cover mask to represent "near cover"
        cover_proximity = uniform_filter(cover_mask, size=7)
        cover_proximity = np.clip(cover_proximity * 3, 0.0, 1.0)

        ambush = risk_grid * cover_proximity
        # Normalise
        a_max = ambush.max()
        if a_max > 1e-9:
            ambush /= a_max
        return ambush

    # ── Internal component scores ───────────────────────────────────────────

    @staticmethod
    def _visibility_score(terrain_grid: np.ndarray) -> np.ndarray:
        """Per-cell visibility based on terrain class."""
        result = np.zeros_like(terrain_grid, dtype=np.float32)
        for cls_id in np.unique(terrain_grid):
            name = CLASS_TO_NAME.get(int(cls_id), "unknown")
            result[terrain_grid == cls_id] = _VISIBILITY_MAP.get(name, 0.5)
        return result

    @staticmethod
    def _terrain_danger(terrain_grid: np.ndarray) -> np.ndarray:
        """Count obstacle neighbours → normalise to [0, 1]."""
        obstacle_id = TERRAIN_CLASSES.get("obstacle", 7)
        water_id = TERRAIN_CLASSES.get("water", 3)
        block_mask = np.isin(terrain_grid, [obstacle_id, water_id]).astype(
            np.float32
        )
        # Convolution counts blocked neighbours
        danger = uniform_filter(block_mask, size=3) * 9  # undo averaging
        danger = np.clip(danger / 8.0, 0.0, 1.0)  # max 8 neighbours
        return danger

    @staticmethod
    def _threat_proximity(
        rows: int,
        cols: int,
        threats: Sequence[dict],
        bounds: dict[str, float],
    ) -> np.ndarray:
        """Inverse-square influence from each threat."""
        prox = np.zeros((rows, cols), dtype=np.float32)
        if not threats:
            return prox

        lat_range = bounds["max_lat"] - bounds["min_lat"]
        lng_range = bounds["max_lng"] - bounds["min_lng"]

        for threat in threats:
            t_lat = threat.get("lat", 0)
            t_lng = threat.get("lng", 0)
            t_radius = max(threat.get("radius", 100), 1.0)

            # Threat position in grid space
            t_row = (bounds["max_lat"] - t_lat) / max(lat_range, 1e-9) * (rows - 1)
            t_col = (t_lng - bounds["min_lng"]) / max(lng_range, 1e-9) * (cols - 1)

            # Radius in grid cells (approximate)
            cell_size_m = (lat_range * 111_000) / max(rows, 1)  # rough m/cell
            radius_cells = t_radius / max(cell_size_m, 1.0)

            # Build distance array
            rr, cc = np.mgrid[0:rows, 0:cols]
            dist = np.sqrt((rr - t_row) ** 2 + (cc - t_col) ** 2)
            influence = np.clip(1.0 - (dist / max(radius_cells, 1.0)), 0.0, 1.0)
            # Inverse-square falloff for cells outside the core radius
            far = dist > radius_cells
            influence[far] = np.clip(
                (radius_cells / (dist[far] + 1e-9)) ** 2, 0.0, 1.0
            )
            prox = np.maximum(prox, influence)

        return prox

    @staticmethod
    def _elevation_risk(elevation_grid: np.ndarray) -> np.ndarray:
        """Lower ground ⇒ higher risk (inverted normalised elevation)."""
        e_min, e_max = elevation_grid.min(), elevation_grid.max()
        if e_max - e_min < 1e-9:
            return np.full_like(elevation_grid, 0.5, dtype=np.float32)
        normalised = (elevation_grid - e_min) / (e_max - e_min)
        return (1.0 - normalised).astype(np.float32)  # low ground → high risk
