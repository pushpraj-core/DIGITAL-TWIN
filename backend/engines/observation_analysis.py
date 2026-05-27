"""
Observation Analysis Engine
============================
Line-of-sight, visibility cones, vantage-point ranking, blind-spot
detection, and coverage-map generation.

Core algorithms:
* **Bresenham ray-casting** for line-of-sight checks.
* **Cone sweeping** – fans of rays from each observer.
* **Coverage aggregation** – how many observers can see each cell.
"""

from __future__ import annotations

import logging
import math
from typing import Optional, Sequence

import numpy as np

from models.mission import VisibilityRequest, VisibilityResult
from utils.geo_utils import bresenham_line, grid_to_lat_lng, lat_lng_to_grid
from utils.grid_utils import CLASS_TO_NAME, TERRAIN_CLASSES

logger = logging.getLogger(__name__)

# Terrain classes that block line-of-sight
_LOS_BLOCKERS = {
    TERRAIN_CLASSES.get("building", 4),
    TERRAIN_CLASSES.get("obstacle", 7),
}


class ObservationAnalysisEngine:
    """Stateless engine for visibility computations."""

    # ── Line of sight ───────────────────────────────────────────────────────

    @staticmethod
    def compute_line_of_sight(
        observer: tuple[int, int],
        target: tuple[int, int],
        elevation_grid: np.ndarray,
        terrain_grid: Optional[np.ndarray] = None,
        observer_height: float = 1.8,
    ) -> bool:
        """Return *True* if the observer can see the target.

        Uses Bresenham to walk the cells between observer and target,
        checking both terrain blockers and elevation differences.
        """
        cells = bresenham_line(observer[1], observer[0], target[1], target[0])

        obs_elev = float(elevation_grid[observer[0], observer[1]]) + observer_height
        tgt_elev = float(elevation_grid[target[0], target[1]])

        total_dist = max(len(cells) - 1, 1)

        for idx, (cx, cy) in enumerate(cells[1:-1], start=1):
            # Bounds check
            if not (0 <= cy < elevation_grid.shape[0] and 0 <= cx < elevation_grid.shape[1]):
                return False

            # Terrain blocker
            if terrain_grid is not None:
                if int(terrain_grid[cy, cx]) in _LOS_BLOCKERS:
                    return False

            # Elevation interpolation check (is this cell above the sight-line?)
            t = idx / total_dist
            expected_elev = obs_elev + t * (tgt_elev - obs_elev)
            cell_elev = float(elevation_grid[cy, cx])
            if cell_elev > expected_elev + 0.5:
                return False

        return True

    # ── Visibility cone ─────────────────────────────────────────────────────

    def compute_visibility_cone(
        self,
        request: VisibilityRequest,
        elevation_grid: np.ndarray,
        terrain_grid: np.ndarray,
        bounds: dict[str, float],
    ) -> VisibilityResult:
        """Cast a fan of rays from the observer and classify cells as visible / hidden."""
        grid_shape = terrain_grid.shape
        obs_rc = lat_lng_to_grid(
            request.observer_lat, request.observer_lng, bounds, grid_shape
        )

        # Convert range from metres to grid cells (approximate)
        lat_span_m = (bounds["max_lat"] - bounds["min_lat"]) * 111_000
        cell_size_m = lat_span_m / max(grid_shape[0], 1)
        range_cells = int(request.range_m / max(cell_size_m, 1.0))
        range_cells = max(range_cells, 5)  # minimum 5 cells

        half_angle = request.angle_deg / 2.0
        direction = request.direction_deg

        # Angular sweep
        num_rays = max(int(request.angle_deg), 36)
        start_angle = direction - half_angle
        step = request.angle_deg / max(num_rays - 1, 1)

        visible_set: set[tuple[int, int]] = set()
        checked_set: set[tuple[int, int]] = set()

        for i in range(num_rays):
            angle_deg = start_angle + i * step
            angle_rad = math.radians(angle_deg)
            # End point of ray
            end_r = obs_rc[0] - int(range_cells * math.cos(angle_rad))
            end_c = obs_rc[1] + int(range_cells * math.sin(angle_rad))
            end_r = max(0, min(grid_shape[0] - 1, end_r))
            end_c = max(0, min(grid_shape[1] - 1, end_c))

            ray_cells = bresenham_line(obs_rc[1], obs_rc[0], end_c, end_r)
            blocked = False
            for cx, cy in ray_cells[1:]:
                if not (0 <= cy < grid_shape[0] and 0 <= cx < grid_shape[1]):
                    break
                checked_set.add((cy, cx))
                if blocked:
                    continue
                # Check LOS blockage
                if int(terrain_grid[cy, cx]) in _LOS_BLOCKERS:
                    blocked = True
                    continue
                # Elevation check
                t = ray_cells.index((cx, cy)) / max(len(ray_cells) - 1, 1)
                obs_elev = float(elevation_grid[obs_rc[0], obs_rc[1]]) + 1.8
                cell_elev = float(elevation_grid[cy, cx])
                expected = obs_elev - t * obs_elev * 0.1  # gentle slope assumption
                if cell_elev > expected + 2.0:
                    blocked = True
                    continue
                visible_set.add((cy, cx))

        hidden_set = checked_set - visible_set

        # Convert to lat/lng lists
        visible_zones = [
            list(grid_to_lat_lng(r, c, bounds, grid_shape))
            for r, c in visible_set
        ]
        hidden_zones = [
            list(grid_to_lat_lng(r, c, bounds, grid_shape))
            for r, c in hidden_set
        ]
        coverage = (
            len(visible_set) / max(len(checked_set), 1) * 100
        )

        return VisibilityResult(
            visible_zones=visible_zones,
            hidden_zones=hidden_zones,
            coverage_pct=round(coverage, 2),
        )

    # ── Vantage points ──────────────────────────────────────────────────────

    @staticmethod
    def find_vantage_points(
        terrain_grid: np.ndarray,
        elevation_grid: np.ndarray,
        n: int = 5,
    ) -> list[tuple[int, int]]:
        """Return the *n* best vantage points (high elevation, good terrain)."""
        rows, cols = terrain_grid.shape
        high_ground = {
            TERRAIN_CLASSES.get("high_ground", 12),
            TERRAIN_CLASSES.get("hill", 8),
            TERRAIN_CLASSES.get("open", 5),
            TERRAIN_CLASSES.get("exposed", 11),
        }

        candidates: list[tuple[float, int, int]] = []
        for r in range(rows):
            for c in range(cols):
                cls_id = int(terrain_grid[r, c])
                if cls_id in _LOS_BLOCKERS:
                    continue
                elev = float(elevation_grid[r, c])
                bonus = 10.0 if cls_id in high_ground else 0.0
                score = elev + bonus
                candidates.append((score, r, c))

        candidates.sort(reverse=True)

        # Select top-n with minimum spacing
        selected: list[tuple[int, int]] = []
        min_dist = max(rows, cols) // (n + 1)
        for score, r, c in candidates:
            if len(selected) >= n:
                break
            too_close = any(
                abs(r - sr) + abs(c - sc) < min_dist for sr, sc in selected
            )
            if not too_close:
                selected.append((r, c))

        return selected

    # ── Blind spots ─────────────────────────────────────────────────────────

    def detect_blind_spots(
        self,
        observation_points: list[tuple[int, int]],
        terrain_grid: np.ndarray,
        elevation_grid: np.ndarray,
        max_range_cells: int = 30,
    ) -> list[tuple[int, int]]:
        """Return cells not visible from *any* observation point."""
        coverage = self.generate_coverage_map(
            observation_points, terrain_grid, elevation_grid, max_range_cells
        )
        rows, cols = terrain_grid.shape
        blind: list[tuple[int, int]] = []
        for r in range(rows):
            for c in range(cols):
                if int(terrain_grid[r, c]) in _LOS_BLOCKERS:
                    continue
                if coverage[r, c] == 0:
                    blind.append((r, c))
        return blind

    # ── Coverage map ────────────────────────────────────────────────────────

    def generate_coverage_map(
        self,
        observation_points: list[tuple[int, int]],
        terrain_grid: np.ndarray,
        elevation_grid: np.ndarray,
        max_range_cells: int = 30,
    ) -> np.ndarray:
        """For each cell, count how many observers can see it.

        Returns an integer array of shape ``terrain_grid.shape``.
        """
        rows, cols = terrain_grid.shape
        coverage = np.zeros((rows, cols), dtype=np.int32)

        for obs in observation_points:
            # Cast rays in 360°
            num_rays = 72
            for i in range(num_rays):
                angle = math.radians(i * (360 / num_rays))
                end_r = obs[0] - int(max_range_cells * math.cos(angle))
                end_c = obs[1] + int(max_range_cells * math.sin(angle))
                end_r = max(0, min(rows - 1, end_r))
                end_c = max(0, min(cols - 1, end_c))

                ray = bresenham_line(obs[1], obs[0], end_c, end_r)
                for cx, cy in ray[1:]:
                    if not (0 <= cy < rows and 0 <= cx < cols):
                        break
                    if int(terrain_grid[cy, cx]) in _LOS_BLOCKERS:
                        break
                    # Simple elevation check
                    if float(elevation_grid[cy, cx]) > float(elevation_grid[obs[0], obs[1]]) + 5:
                        break
                    coverage[cy, cx] += 1

        return coverage
