from fastapi import APIRouter
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
    return VisibilityResult(
        visible_zones=[],
        hidden_zones=[],
        coverage_pct=0.5
    )

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
