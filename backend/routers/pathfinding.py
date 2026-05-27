import numpy as np
from fastapi import APIRouter, HTTPException
from models.mission import RouteRequest, RoutePlanResult, RouteResult
from engines.movement_planner import MovementPlanner
from engines.risk_simulation import RiskSimulationEngine

router = APIRouter(prefix="/pathfinding", tags=["Pathfinding"])

@router.post("/plan", response_model=RoutePlanResult)
async def plan_routes(req: RouteRequest):
    # Retrieve terrain data
    from routers.terrain import STORE, terrain_engine
    terrain_data = STORE.get(req.terrain_id)
    if not terrain_data or "analysis" not in terrain_data:
        raise HTTPException(status_code=404, detail="Terrain analysis not found")
        
    analysis = terrain_data["analysis"]
    terrain_grid = terrain_engine.generate_terrain_grid(analysis)
    
    risk_engine = RiskSimulationEngine()
    risk_result = risk_engine.compute_risk_heatmap(
        terrain_grid, 
        threats=req.threats, 
        elevation_grid=terrain_data.get("elevation_grid"), 
        bounds=analysis.bounds
    )
    risk_grid = np.array(risk_result.grid)
    
    planner = MovementPlanner()
    graph = planner.build_navigation_graph(terrain_grid, risk_grid)
    
    # Map lat/lng to grid
    rows, cols = terrain_grid.shape
    bounds = analysis.bounds
    
    lat_range = bounds["max_lat"] - bounds["min_lat"]
    lng_range = bounds["max_lng"] - bounds["min_lng"]
    
    # Clamp to bounds
    start_lat = max(bounds["min_lat"], min(bounds["max_lat"], req.start_lat))
    start_lng = max(bounds["min_lng"], min(bounds["max_lng"], req.start_lng))
    end_lat = max(bounds["min_lat"], min(bounds["max_lat"], req.end_lat))
    end_lng = max(bounds["min_lng"], min(bounds["max_lng"], req.end_lng))
    
    start_row = int((bounds["max_lat"] - start_lat) / lat_range * (rows - 1))
    start_col = int((start_lng - bounds["min_lng"]) / lng_range * (cols - 1))
    end_row = int((bounds["max_lat"] - end_lat) / lat_range * (rows - 1))
    end_col = int((end_lng - bounds["min_lng"]) / lng_range * (cols - 1))
    
    start = (start_row, start_col)
    end = (end_row, end_col)
    
    real_routes = planner.plan_routes(graph, start, end, req.mission_type, terrain_grid, risk_grid, analysis.bounds)
    return real_routes

@router.get("/routes/{terrain_id}")
async def get_cached_routes(terrain_id: str):
    return {"routes": []}
