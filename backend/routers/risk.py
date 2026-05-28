from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any

from models.threat import RiskHeatmapResult
from engines.risk_simulation import RiskSimulationEngine
router = APIRouter(prefix="/risk", tags=["Risk"])

class ComputeRiskRequest(BaseModel):
    terrain_id: str
    include_threats: bool = True
    threats: List[Dict[str, Any]] = []

@router.post("/compute", response_model=RiskHeatmapResult)
async def compute_risk_heatmap(req: ComputeRiskRequest):
    from routers.terrain import STORE, terrain_engine
    terrain_data = STORE.get(req.terrain_id)
    if not terrain_data or "analysis" not in terrain_data:
        raise HTTPException(status_code=404, detail="Terrain analysis not found")
        
    analysis = terrain_data["analysis"]
    terrain_grid = terrain_engine.generate_terrain_grid(analysis)
    elevation_grid = terrain_data.get("elevation_grid")
    
    risk_engine = RiskSimulationEngine()
    
    # Use threats from request payload
    threats = req.threats if req.include_threats else []
    
    result = risk_engine.compute_risk_heatmap(terrain_grid, threats=threats, elevation_grid=elevation_grid, bounds=analysis.bounds)
    return result

class ChokepointRequest(BaseModel):
    terrain_id: str
    
@router.post("/chokepoints")
async def detect_chokepoints(req: ChokepointRequest):
    return {"chokepoints": []}

@router.get("/{terrain_id}/heatmap")
async def get_heatmap(terrain_id: str):
    return {"grid": [], "bounds": {}}

class SimulateRiskRequest(BaseModel):
    terrain_id: str
    include_threats: bool = True
    threats: List[Dict[str, Any]] = []

@router.post("/simulate", response_model=RiskHeatmapResult)
async def simulate_risk(req: SimulateRiskRequest):
    """Alias endpoint for /risk/compute — used by the frontend auto-sync."""
    from routers.terrain import STORE, terrain_engine
    import numpy as np

    terrain_data = STORE.get(req.terrain_id)
    if not terrain_data or "analysis" not in terrain_data:
        raise HTTPException(status_code=404, detail="Terrain analysis not found")
        
    analysis = terrain_data["analysis"]
    terrain_grid = terrain_engine.generate_terrain_grid(analysis)
    elevation_grid = terrain_data.get("elevation_grid")
    
    risk_engine = RiskSimulationEngine()
    
    # Transform frontend threat format {id, type, position: {lat, lng}, radius, active}
    # to backend format {lat, lng, radius, type}
    transformed_threats = []
    if req.include_threats and req.threats:
        for t in req.threats:
            if isinstance(t, dict):
                pos = t.get("position", {})
                transformed_threats.append({
                    "lat": pos.get("lat", t.get("lat", 0)),
                    "lng": pos.get("lng", t.get("lng", 0)),
                    "radius": t.get("radius", 200),
                    "type": t.get("type", "danger_zone"),
                })
    
    result = risk_engine.compute_risk_heatmap(
        terrain_grid, 
        threats=transformed_threats, 
        elevation_grid=elevation_grid, 
        bounds=analysis.bounds
    )
    return result
