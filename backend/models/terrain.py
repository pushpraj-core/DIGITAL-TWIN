"""Pydantic v2 models for terrain intelligence."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class TerrainUploadResponse(BaseModel):
    """Returned after a terrain image is uploaded."""

    id: str = Field(..., description="Unique terrain analysis ID")
    filename: str
    status: str = "uploaded"


class TerrainSegment(BaseModel):
    """A single segmented terrain region."""

    type: str = Field(
        ..., description="Segment category, e.g. water, vegetation, road"
    )
    polygon: list[list[float]] = Field(
        ...,
        description="List of [lng, lat] coordinate pairs forming the polygon",
    )
    confidence: float = Field(
        ge=0.0, le=1.0, description="Classification confidence"
    )


class TerrainAnalysisResult(BaseModel):
    """Full terrain analysis output."""

    id: str
    segments: list[TerrainSegment] = Field(default_factory=list)
    layers: dict[str, Any] = Field(
        default_factory=dict,
        description="Named raster / vector layers (base64-encoded or GeoJSON)",
    )
    terrain_classes: list[str] = Field(
        default_factory=list,
        description="Distinct terrain classes found",
    )
    bounds: dict[str, float] = Field(
        default_factory=dict,
        description="Bounding box: min_lat, max_lat, min_lng, max_lng",
    )
    weather: dict[str, Any] | None = Field(
        default=None,
        description="Live weather data for the area"
    )
