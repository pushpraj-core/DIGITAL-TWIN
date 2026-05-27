from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from models.mission import VisibilityRequest, VisibilityResult

router = APIRouter(prefix="/observation", tags=["Observation"])

class LOSRequest(BaseModel):
    observer_lat: float
    observer_lng: float
    target_lat: float
    target_lng: float

@router.post("/los")
async def check_los(req: LOSRequest):
    return {"has_los": True}

@router.post("/visibility", response_model=VisibilityResult)
async def compute_visibility(req: VisibilityRequest):
    from routers.terrain import STORE, terrain_engine
    from engines.observation_analysis import ObservationAnalysisEngine
    import numpy as np

    terrain_data = STORE.get(req.terrain_id)
    if not terrain_data or "analysis" not in terrain_data:
        raise HTTPException(status_code=404, detail="Terrain analysis not found")
        
    analysis = terrain_data["analysis"]
    terrain_grid = terrain_engine.generate_terrain_grid(analysis)
    elevation_grid = terrain_data.get("elevation_grid")

    if elevation_grid is None:
        elevation_grid = np.zeros(terrain_grid.shape, dtype=np.float32)

    obs_engine = ObservationAnalysisEngine()
    result = obs_engine.compute_visibility_cone(
        request=req,
        elevation_grid=elevation_grid,
        terrain_grid=terrain_grid,
        bounds=analysis.bounds
    )
    return result

class VantagePointRequest(BaseModel):
    terrain_id: str
    count: int = 5
    
@router.post("/vantage-points")
async def find_vantage_points(req: VantagePointRequest):
    return {"vantage_points": []}

class BlindSpotRequest(BaseModel):
    terrain_id: str
    observer_positions: list[list[float]]

@router.post("/blind-spots")
async def detect_blind_spots(req: BlindSpotRequest):
    return {"blind_spots": []}
