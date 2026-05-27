"""Pydantic v2 models for missions, routes, observations, what-if, and the AI assistant."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


# ── Routes / Pathfinding ────────────────────────────────────────────────────


class RouteRequest(BaseModel):
    """Input for the pathfinding engine."""

    start_lat: float
    start_lng: float
    end_lat: float
    end_lng: float
    mission_type: str = Field(
        default="safest",
        description="One of: stealth, fastest, safest, reconnaissance, extraction",
    )
    terrain_id: str = Field(..., description="ID of the analysed terrain")


class RouteResult(BaseModel):
    """A single planned route."""

    id: str
    name: str
    path: list[list[float]] = Field(
        ..., description="Ordered list of [lat, lng] waypoints"
    )
    distance_m: float
    estimated_time_s: float
    exposure_score: float
    risk_score: float
    color: str = Field(default="#00f0ff")


class RoutePlanResult(BaseModel):
    """Collection of candidate routes."""

    routes: list[RouteResult] = Field(default_factory=list)


# ── Observation / Visibility ────────────────────────────────────────────────


class VisibilityRequest(BaseModel):
    observer_lat: float
    observer_lng: float
    range_m: float = 500.0
    angle_deg: float = 90.0
    direction_deg: float = 0.0


class VisibilityResult(BaseModel):
    visible_zones: list[list[float]] = Field(default_factory=list)
    hidden_zones: list[list[float]] = Field(default_factory=list)
    coverage_pct: float = 0.0


# ── What-If ─────────────────────────────────────────────────────────────────


class WhatIfRequest(BaseModel):
    scenario_type: str = Field(
        ...,
        description="One of: road_blocked, new_threat, weather_change, terrain_change",
    )
    params: dict[str, Any] = Field(default_factory=dict)


class WhatIfResult(BaseModel):
    before_metrics: dict[str, Any] = Field(default_factory=dict)
    after_metrics: dict[str, Any] = Field(default_factory=dict)
    changes: list[str] = Field(default_factory=list)


# ── Mission Replay ──────────────────────────────────────────────────────────


class MissionEvent(BaseModel):
    timestamp_s: float
    event_type: str
    lat: float
    lng: float
    description: str = ""


class MissionTimelineResult(BaseModel):
    events: list[MissionEvent] = Field(default_factory=list)
    total_duration_s: float = 0.0
    summary: dict[str, Any] = Field(default_factory=dict)


# ── AI Assistant ────────────────────────────────────────────────────────────


class AIQueryRequest(BaseModel):
    query: str
    context: Optional[dict[str, Any]] = Field(default=None)


class AIQueryResponse(BaseModel):
    response: str
    actions: list[dict[str, Any]] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
