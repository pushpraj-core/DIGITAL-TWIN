"""Pydantic v2 models for threats and risk heatmaps."""

from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel, Field


class ThreatCreate(BaseModel):
    """Payload for adding a new threat."""

    type: str = Field(..., description="E.g. sniper, ied, patrol, artillery")
    lat: float
    lng: float
    radius: float = Field(default=100.0, description="Effect radius in metres")
    active: bool = True


class ThreatResponse(BaseModel):
    """Threat after storage (includes server-assigned id)."""

    id: str
    type: str
    lat: float
    lng: float
    radius: float
    active: bool


class RiskCell(BaseModel):
    """Risk score for a single grid cell."""

    x: int
    y: int
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_level: str = Field(
        default="low",
        description="One of: low, medium, high",
    )


class RiskHeatmapResult(BaseModel):
    """Complete risk heatmap over the analysis grid."""

    grid: list[list[float]] = Field(
        default_factory=list,
        description="2-D array of risk scores [0-1]",
    )
    bounds: dict[str, float] = Field(default_factory=dict)
    stats: dict[str, Any] = Field(default_factory=dict)
