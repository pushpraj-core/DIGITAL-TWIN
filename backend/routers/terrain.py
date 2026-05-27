import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List, Dict, Any

from models.terrain import TerrainUploadResponse, TerrainAnalysisResult
# from engines.terrain_intelligence import TerrainIntelligenceEngine # assuming instantiated globally or DI

router = APIRouter(prefix="/terrain", tags=["Terrain"])

# In a real app, this would be injected
# terrain_engine = TerrainIntelligenceEngine()

# Mock storage for development
STORE: Dict[str, Any] = {}

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

@router.post("/analyze/{terrain_id}", response_model=TerrainAnalysisResult)
async def analyze_terrain(terrain_id: str):
    if terrain_id not in STORE:
        raise HTTPException(status_code=404, detail="Terrain not found")
        
    filepath = STORE[terrain_id]["filepath"]
    
    try:
        # result = terrain_engine.analyze_image(filepath)
        # For now, returning a mock to unblock UI dev
        result = TerrainAnalysisResult(
            id=terrain_id,
            segments=[],
            layers={"safe": [], "exposed": [], "obstacle": []},
            terrain_classes={"safe": 100, "exposed": 200, "urban": 50},
            bounds={"north": 34.06, "south": 34.04, "east": -118.23, "west": -118.25}
        )
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
