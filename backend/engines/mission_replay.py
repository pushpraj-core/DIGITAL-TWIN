"""
Mission Replay Engine
======================
Generates a chronological timeline of mission events along a planned route,
and compares two strategies head-to-head.
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Optional, Sequence

import numpy as np

from config import DEFAULT_MOVEMENT_SPEED_MPS
from models.mission import MissionEvent, MissionTimelineResult
from utils.geo_utils import grid_to_lat_lng, haversine_distance
from utils.grid_utils import CLASS_TO_NAME

logger = logging.getLogger(__name__)

# ── Risk-level thresholds ───────────────────────────────────────────────────
_RISK_LOW = 0.33
_RISK_HIGH = 0.66


class MissionReplayEngine:
    """Generates mission timelines and compares strategies."""

    def generate_timeline(
        self,
        route_path: list[list[float]],
        risk_grid: np.ndarray,
        threats: list[dict],
        terrain_grid: Optional[np.ndarray] = None,
        bounds: Optional[dict[str, float]] = None,
    ) -> MissionTimelineResult:
        """Walk *route_path* and emit timestamped events.

        Parameters
        ----------
        route_path : list of [lat, lng]
        risk_grid : 2-D float array [0, 1]
        threats : list of threat dicts (lat, lng, radius, type)
        terrain_grid : optional int terrain grid
        bounds : geographic bounds
        """
        if bounds is None:
            bounds = {"min_lat": 0, "max_lat": 1, "min_lng": 0, "max_lng": 1}

        events: list[MissionEvent] = []
        current_time = 0.0
        prev_risk_level = "low"
        total_distance = 0.0

        # Start event
        if route_path:
            events.append(
                MissionEvent(
                    timestamp_s=0.0,
                    event_type="waypoint",
                    lat=route_path[0][0],
                    lng=route_path[0][1],
                    description="Mission start",
                )
            )

        grid_shape = risk_grid.shape

        for i in range(1, len(route_path)):
            lat0, lng0 = route_path[i - 1]
            lat1, lng1 = route_path[i]

            # Distance and time
            seg_dist = haversine_distance(lat0, lng0, lat1, lng1)
            total_distance += seg_dist
            seg_time = seg_dist / DEFAULT_MOVEMENT_SPEED_MPS
            current_time += seg_time

            # Movement event (every ~5 waypoints or if significant turn)
            if i % 5 == 0 or i == len(route_path) - 1:
                events.append(
                    MissionEvent(
                        timestamp_s=round(current_time, 1),
                        event_type="movement",
                        lat=lat1,
                        lng=lng1,
                        description=f"Moving – {total_distance:.0f}m covered",
                    )
                )

            # Risk change detection
            from utils.geo_utils import lat_lng_to_grid

            row, col = lat_lng_to_grid(lat1, lng1, bounds, grid_shape)
            cell_risk = float(risk_grid[row, col])
            risk_level = (
                "low" if cell_risk < _RISK_LOW
                else "high" if cell_risk > _RISK_HIGH
                else "medium"
            )
            if risk_level != prev_risk_level:
                events.append(
                    MissionEvent(
                        timestamp_s=round(current_time, 1),
                        event_type="risk_change",
                        lat=lat1,
                        lng=lng1,
                        description=f"Risk level changed: {prev_risk_level} → {risk_level} (score={cell_risk:.2f})",
                    )
                )
                prev_risk_level = risk_level

            # Threat proximity
            for threat in threats:
                t_dist = haversine_distance(lat1, lng1, threat["lat"], threat["lng"])
                if t_dist < threat.get("radius", 100) * 1.5:
                    events.append(
                        MissionEvent(
                            timestamp_s=round(current_time, 1),
                            event_type="threat_proximity",
                            lat=lat1,
                            lng=lng1,
                            description=(
                                f"Near {threat.get('type', 'threat')} "
                                f"({t_dist:.0f}m away, radius {threat.get('radius', 100):.0f}m)"
                            ),
                        )
                    )

            # Terrain/visibility change
            if terrain_grid is not None and i % 8 == 0:
                cls_name = CLASS_TO_NAME.get(int(terrain_grid[row, col]), "unknown")
                events.append(
                    MissionEvent(
                        timestamp_s=round(current_time, 1),
                        event_type="visibility_change",
                        lat=lat1,
                        lng=lng1,
                        description=f"Terrain: {cls_name}",
                    )
                )

        # End event
        if route_path:
            events.append(
                MissionEvent(
                    timestamp_s=round(current_time, 1),
                    event_type="waypoint",
                    lat=route_path[-1][0],
                    lng=route_path[-1][1],
                    description="Mission complete",
                )
            )

        # Summary
        risk_changes = sum(1 for e in events if e.event_type == "risk_change")
        threat_encounters = sum(
            1 for e in events if e.event_type == "threat_proximity"
        )
        high_risk_time = self._estimate_high_risk_time(events)

        summary: dict[str, Any] = {
            "total_distance_m": round(total_distance, 2),
            "total_duration_s": round(current_time, 1),
            "event_count": len(events),
            "risk_changes": risk_changes,
            "threat_encounters": threat_encounters,
            "high_risk_duration_s": round(high_risk_time, 1),
        }

        return MissionTimelineResult(
            events=events,
            total_duration_s=round(current_time, 1),
            summary=summary,
        )

    # ── Strategy comparison ─────────────────────────────────────────────────

    @staticmethod
    def compare_strategies(
        timeline_a: MissionTimelineResult,
        timeline_b: MissionTimelineResult,
    ) -> dict[str, Any]:
        """Compare two timelines and declare per-metric winners."""
        sa = timeline_a.summary
        sb = timeline_b.summary

        metrics = [
            "total_duration_s",
            "total_distance_m",
            "risk_changes",
            "threat_encounters",
            "high_risk_duration_s",
        ]

        comparison: dict[str, Any] = {"metrics": {}}
        a_wins = 0
        b_wins = 0

        for m in metrics:
            va = sa.get(m, 0)
            vb = sb.get(m, 0)
            # Lower is better for all these metrics
            winner = "A" if va <= vb else "B"
            if va == vb:
                winner = "tie"
            else:
                if winner == "A":
                    a_wins += 1
                else:
                    b_wins += 1
            comparison["metrics"][m] = {
                "strategy_a": va,
                "strategy_b": vb,
                "winner": winner,
            }

        comparison["overall_winner"] = (
            "A" if a_wins > b_wins else "B" if b_wins > a_wins else "tie"
        )
        return comparison

    # ── Helper ──────────────────────────────────────────────────────────────

    @staticmethod
    def _estimate_high_risk_time(events: list[MissionEvent]) -> float:
        """Estimate total seconds spent in high-risk zones."""
        in_high = False
        high_start = 0.0
        total = 0.0
        for ev in events:
            if ev.event_type == "risk_change" and "high" in ev.description:
                in_high = True
                high_start = ev.timestamp_s
            elif ev.event_type == "risk_change" and in_high:
                total += ev.timestamp_s - high_start
                in_high = False
        return total
