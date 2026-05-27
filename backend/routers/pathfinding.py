from fastapi import APIRouter
from models.mission import RouteRequest, RoutePlanResult, RouteResult

router = APIRouter(prefix="/pathfinding", tags=["Pathfinding"])

@router.post("/plan", response_model=RoutePlanResult)
async def plan_routes(req: RouteRequest):
    # Return mock
    return RoutePlanResult(routes=[
        RouteResult(
            id="mock-1",
            name="Safest Route",
            path=[[req.start_lat, req.start_lng], [req.end_lat, req.end_lng]],
            distance_m=1000.0,
            estimated_time_s=300,
            exposure_score=0.2,
            risk_score=0.1,
            color="#10b981"
        )
    ])

@router.get("/routes/{terrain_id}")
async def get_cached_routes(terrain_id: str):
    return {"routes": []}
