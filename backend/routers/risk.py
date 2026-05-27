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
