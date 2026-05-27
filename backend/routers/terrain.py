import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any

from pydantic import BaseModel
from models.terrain import TerrainUploadResponse, TerrainAnalysisResult
from engines.terrain_intelligence import TerrainIntelligenceEngine # assuming instantiated globally or DI

class LiveTerrainRequest(BaseModel):
    bounds: dict

router = APIRouter(prefix="/terrain", tags=["Terrain"])

# In a real app, this would be injected
terrain_engine = TerrainIntelligenceEngine()

# Mock storage for development
STORE: Dict[str, Any] = {}
CACHE: Dict[str, str] = {} # hash -> terrain_id

def hash_bounds(bounds: dict) -> str:
    return f"{bounds['min_lat']:.3f}_{bounds['max_lat']:.3f}_{bounds['min_lng']:.3f}_{bounds['max_lng']:.3f}"

@router.post("/upload", response_model=TerrainUploadResponse)
async def upload_terrain(file: UploadFile = File(...)):
    upload_dir = os.environ.get("UPLOAD_DIR", "./data/uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{file_id}{file_ext}"
    filepath = os.path.join(upload_dir, filename)
    
    try:
        with open(filepath, "wb") as f:
            content = await file.read()
            f.write(content)
            
        STORE[file_id] = {"filepath": filepath, "status": "uploaded", "filename": file.filename}
        
        return TerrainUploadResponse(
            id=file_id,
            filename=file.filename,
            status="uploaded"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/fetch_live", response_model=TerrainAnalysisResult)
async def fetch_live_terrain(req: LiveTerrainRequest):
    lat_diff = abs(req.bounds.get("max_lat", 0) - req.bounds.get("min_lat", 0))
    lng_diff = abs(req.bounds.get("max_lng", 0) - req.bounds.get("min_lng", 0))
    area = lat_diff * lng_diff
    
    if area > 1.0:
        raise HTTPException(
            status_code=400, 
            detail="Bounding box too large. Please zoom in to a specific tactical area (max ~100x100km)."
        )
        
    b_hash = hash_bounds(req.bounds)
    if b_hash in CACHE and CACHE[b_hash] in STORE:
        return STORE[CACHE[b_hash]]["analysis"]

    from engines.live_data import LiveDataEngine
    import asyncio
    
    live_engine = LiveDataEngine()
    
    try:
        # Fetch satellite image
        filepath = await live_engine.fetch_satellite_image(req.bounds, zoom=16)
        
        # Fetch elevation and weather concurrently
        elev_task = asyncio.create_task(live_engine.fetch_elevation_grid(req.bounds, grid_size=100))
        center_lat = (req.bounds["min_lat"] + req.bounds["max_lat"]) / 2
        center_lng = (req.bounds["min_lng"] + req.bounds["max_lng"]) / 2
        weather_task = asyncio.create_task(live_engine.fetch_weather(center_lat, center_lng))
        
        elevation_grid, weather = await asyncio.gather(elev_task, weather_task)
        
        terrain_id = str(uuid.uuid4())
        result = terrain_engine.analyze_image(filepath, analysis_id=terrain_id)
        
        # Override bounds with actual requested bounds
        result.bounds = req.bounds
        result.weather = weather
        
        STORE[terrain_id] = {
            "filepath": filepath,
            "status": "live",
            "filename": f"live_{terrain_id}.jpg",
            "analysis": result,
            "elevation_grid": elevation_grid,
            "weather": weather
        }
        CACHE[b_hash] = terrain_id
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Live fetch failed: {str(e)}")

@router.post("/analyze/{terrain_id}", response_model=TerrainAnalysisResult)
async def analyze_terrain(terrain_id: str):
    if terrain_id not in STORE:
        raise HTTPException(status_code=404, detail="Terrain not found")
        
    filepath = STORE[terrain_id]["filepath"]
    
    try:
        result = terrain_engine.analyze_image(filepath, analysis_id=terrain_id)
        STORE[terrain_id]["analysis"] = result
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@router.get("/{terrain_id}/segments")
async def get_segments(terrain_id: str):
    if terrain_id not in STORE or "analysis" not in STORE[terrain_id]:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return STORE[terrain_id]["analysis"].segments

@router.get("/{terrain_id}/layers")
async def get_layers(terrain_id: str):
    if terrain_id not in STORE or "analysis" not in STORE[terrain_id]:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return STORE[terrain_id]["analysis"].layers

@router.get("/")
async def list_terrains():
    return [{"id": k, "filename": v["filename"], "status": v["status"]} for k, v in STORE.items()]
