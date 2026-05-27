"""
Movement Planner
=================
Builds a NetworkX graph from the terrain/risk grids and computes optimal
routes using **A*** and **Dijkstra** with mission-type-specific cost functions.

Three candidate routes are always generated:
* **Path A** – optimised for the requested mission type.
* **Path B** – optimised for the next-best complementary type.
* **Path C** – balanced cost across all factors.
"""

from __future__ import annotations

import logging
import math
import uuid
from typing import Optional

import networkx as nx
import numpy as np

from config import DEFAULT_MOVEMENT_SPEED_MPS, DIAGONAL_FACTOR
from models.mission import RouteResult, RoutePlanResult
from utils.geo_utils import grid_to_lat_lng, haversine_distance
from utils.grid_utils import CLASS_TO_NAME, TERRAIN_CLASSES

logger = logging.getLogger(__name__)

# ── Terrain traversal costs (multiplier on base distance) ───────────────────
_TERRAIN_SPEED_FACTOR: dict[str, float] = {
    "open": 1.0,
    "exposed": 1.0,
    "road": 0.8,      # faster on roads
    "bridge": 0.85,
    "safe": 0.9,
    "urban": 1.2,
    "building": 999.0, # impassable
    "high_ground": 1.5,
    "hill": 1.5,
    "forest": 1.8,
    "vegetation": 1.6,
    "obstacle": 999.0,
    "water": 999.0,
    "unknown": 1.0,
}

# Impassable terrain class IDs
_IMPASSABLE = {
    TERRAIN_CLASSES.get("obstacle", 7),
    TERRAIN_CLASSES.get("water", 3),
    TERRAIN_CLASSES.get("building", 4),
}

# ── Mission type → complementary type ──────────────────────────────────────
_COMPLEMENT: dict[str, str] = {
    "stealth": "safest",
    "fastest": "safest",
    "safest": "stealth",
    "reconnaissance": "stealth",
    "extraction": "fastest",
}

# ── Colours ─────────────────────────────────────────────────────────────────
PATH_COLOURS = ["#00f0ff", "#f59e0b", "#a855f7"]


class MovementPlanner:
    """Builds a navigation graph and plans multi-criterion routes."""

    # ── Graph construction ──────────────────────────────────────────────────

    @staticmethod
    def build_navigation_graph(
        terrain_grid: np.ndarray,
        risk_grid: np.ndarray,
    ) -> nx.Graph:
        """Create a weighted graph where each traversable cell is a node.

        Edges connect 8-neighbours.  Attributes on each edge:
        ``distance``, ``risk``, ``exposure``, ``terrain_difficulty``.
        """
        rows, cols = terrain_grid.shape
        G = nx.Graph()

        for r in range(rows):
            for c in range(cols):
                cls_id = int(terrain_grid[r, c])
                if cls_id in _IMPASSABLE:
                    continue
                G.add_node((r, c), terrain=cls_id, risk=float(risk_grid[r, c]))

        # Directions: 8-connected
        directions = [
            (-1, -1), (-1, 0), (-1, 1),
            (0, -1),           (0, 1),
            (1, -1),  (1, 0),  (1, 1),
        ]

        for r in range(rows):
            for c in range(cols):
                if (r, c) not in G:
                    continue
                src_cls = CLASS_TO_NAME.get(int(terrain_grid[r, c]), "unknown")
                for dr, dc in directions:
                    nr, nc = r + dr, c + dc
                    if (nr, nc) not in G:
                        continue

                    dst_cls = CLASS_TO_NAME.get(int(terrain_grid[nr, nc]), "unknown")
                    diag = abs(dr) + abs(dc) == 2
                    base_dist = DIAGONAL_FACTOR if diag else 1.0

                    # Terrain difficulty (average of src/dst speed factors)
                    src_factor = _TERRAIN_SPEED_FACTOR.get(src_cls, 1.0)
                    dst_factor = _TERRAIN_SPEED_FACTOR.get(dst_cls, 1.0)
                    terrain_diff = (src_factor + dst_factor) / 2.0

                    distance = base_dist * terrain_diff
                    risk = (float(risk_grid[r, c]) + float(risk_grid[nr, nc])) / 2.0
                    exposure = 1.0 if src_cls in ("open", "exposed", "road") else 0.3

                    G.add_edge(
                        (r, c),
                        (nr, nc),
                        distance=distance,
                        risk=risk,
                        exposure=exposure,
                        terrain_difficulty=terrain_diff,
                    )

        return G

    # ── Route planning ──────────────────────────────────────────────────────

    def plan_routes(
        self,
        graph: nx.Graph,
        start: tuple[int, int],
        end: tuple[int, int],
        mission_type: str,
        terrain_grid: np.ndarray,
        risk_grid: np.ndarray,
        bounds: Optional[dict[str, float]] = None,
    ) -> RoutePlanResult:
        """Generate up to 3 candidate routes between *start* and *end*.

        Falls back to Dijkstra if A* fails (e.g. disconnected components).
        """
        if bounds is None:
            bounds = {"min_lat": 0, "max_lat": 1, "min_lng": 0, "max_lng": 1}

        # Snap start/end to nearest graph node
        start = self._snap_to_graph(graph, start)
        end = self._snap_to_graph(graph, end)

        if start is None or end is None:
            logger.warning("Start or end not reachable on graph")
            return RoutePlanResult(routes=[])

        routes: list[RouteResult] = []

        # Path A – primary mission type
        path_a = self._find_path(graph, start, end, mission_type)
        if path_a:
            routes.append(
                self._build_route_result(
                    path_a,
                    f"Path A – {mission_type.title()}",
                    risk_grid,
                    terrain_grid,
                    bounds,
                    PATH_COLOURS[0],
                )
            )

        # Path B – complementary type
        comp_type = _COMPLEMENT.get(mission_type, "safest")
        path_b = self._find_path(graph, start, end, comp_type)
        if path_b and path_b != path_a:
            routes.append(
                self._build_route_result(
                    path_b,
                    f"Path B – {comp_type.title()}",
                    risk_grid,
                    terrain_grid,
                    bounds,
                    PATH_COLOURS[1],
                )
            )

        # Path C – balanced
        path_c = self._find_path(graph, start, end, "balanced")
        if path_c and path_c not in (path_a, path_b):
            routes.append(
                self._build_route_result(
                    path_c,
                    "Path C – Balanced",
                    risk_grid,
                    terrain_grid,
                    bounds,
                    PATH_COLOURS[2],
                )
            )

        return RoutePlanResult(routes=routes)

    def smooth_path(
        self, path: list[tuple[int, int]], window: int = 3
    ) -> list[tuple[int, int]]:
        """Smooth a grid path using a moving-average window."""
        if len(path) <= window:
            return path
        arr = np.array(path, dtype=np.float64)
        smoothed = np.copy(arr)
        half = window // 2
        for i in range(half, len(arr) - half):
            smoothed[i] = arr[i - half : i + half + 1].mean(axis=0)
        # Keep start/end exact
        smoothed[0] = arr[0]
        smoothed[-1] = arr[-1]
        return [tuple(map(int, pt)) for pt in smoothed]

    # ── Internal helpers ────────────────────────────────────────────────────

    def _find_path(
        self,
        graph: nx.Graph,
        start: tuple[int, int],
        end: tuple[int, int],
        mission_type: str,
    ) -> Optional[list[tuple[int, int]]]:
        """Run A* (with heuristic) → fallback to Dijkstra."""
        cost_fn = self._make_cost_function(mission_type)

        def heuristic(a: tuple[int, int], b: tuple[int, int]) -> float:
            return math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2)

        try:
            path = nx.astar_path(
                graph, start, end, heuristic=heuristic, weight=cost_fn
            )
            return self.smooth_path(path)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            pass

        try:
            path = nx.dijkstra_path(graph, start, end, weight=cost_fn)
            return self.smooth_path(path)
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            logger.warning("No path found from %s to %s", start, end)
            return None

    @staticmethod
    def _make_cost_function(mission_type: str):
        """Return an edge-weight key function for the given mission type.

        NetworkX ``weight`` parameter can be a callable
        ``(u, v, edge_data) → float``.
        """
        weights: dict[str, tuple[float, float, float, float]] = {
            # (distance, risk, exposure, terrain_difficulty)
            "stealth":          (0.2, 0.0, 0.8, 0.0),
            "fastest":          (0.9, 0.1, 0.0, 0.0),
            "safest":           (0.1, 0.9, 0.0, 0.0),
            "reconnaissance":   (0.3, 0.3, 0.0, 0.4),
            "extraction":       (0.6, 0.4, 0.0, 0.0),
            "balanced":         (0.4, 0.3, 0.15, 0.15),
        }
        w_d, w_r, w_e, w_t = weights.get(mission_type, weights["balanced"])

        def cost(u, v, data):
            return (
                w_d * data.get("distance", 1.0)
                + w_r * data.get("risk", 0.5)
                + w_e * data.get("exposure", 0.5)
                + w_t * data.get("terrain_difficulty", 1.0)
            )

        return cost

    @staticmethod
    def _snap_to_graph(
        graph: nx.Graph, pos: tuple[int, int]
    ) -> Optional[tuple[int, int]]:
        """Return the nearest graph node to *pos*, or *None* if graph empty."""
        if pos in graph:
            return pos
        if not graph.nodes:
            return None
        best, best_dist = None, float("inf")
        for node in graph.nodes:
            d = (node[0] - pos[0]) ** 2 + (node[1] - pos[1]) ** 2
            if d < best_dist:
                best, best_dist = node, d
        return best

    def _build_route_result(
        self,
        path: list[tuple[int, int]],
        name: str,
        risk_grid: np.ndarray,
        terrain_grid: np.ndarray,
        bounds: dict[str, float],
        colour: str,
    ) -> RouteResult:
        """Assemble a ``RouteResult`` from a grid path."""
        grid_shape = terrain_grid.shape

        # Convert to lat/lng
        latlng_path: list[list[float]] = []
        for r, c in path:
            lat, lng = grid_to_lat_lng(r, c, bounds, grid_shape)
            latlng_path.append([lat, lng])

        # Distance (sum of haversine between consecutive points)
        total_dist = 0.0
        for i in range(1, len(latlng_path)):
            total_dist += haversine_distance(
                latlng_path[i - 1][0],
                latlng_path[i - 1][1],
                latlng_path[i][0],
                latlng_path[i][1],
            )

        # Risk / exposure scores (average along path)
        risks = [float(risk_grid[r, c]) for r, c in path]
        avg_risk = sum(risks) / max(len(risks), 1)

        exposure_classes = {"open", "exposed", "road"}
        exposed_count = sum(
            1
            for r, c in path
            if CLASS_TO_NAME.get(int(terrain_grid[r, c]), "unknown") in exposure_classes
        )
        exposure_score = exposed_count / max(len(path), 1)

        est_time = total_dist / DEFAULT_MOVEMENT_SPEED_MPS if total_dist > 0 else 0

        return RouteResult(
            id=uuid.uuid4().hex[:10],
            name=name,
            path=latlng_path,
            distance_m=round(total_dist, 2),
            estimated_time_s=round(est_time, 1),
            exposure_score=round(exposure_score, 4),
            risk_score=round(avg_risk, 4),
            color=colour,
        )
