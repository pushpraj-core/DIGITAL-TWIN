from fastapi import APIRouter
from models.threat import ThreatCreate, ThreatResponse

router = APIRouter(prefix="/threats", tags=["Threats"])

# Mock state
threats_db = []

@router.post("/", response_model=ThreatResponse)
async def add_threat(threat: ThreatCreate):
    t = ThreatResponse(
        id="t-1",
        type=threat.type,
        lat=threat.lat,
        lng=threat.lng,
        radius=threat.radius,
        active=threat.active
    )
    threats_db.append(t)
    return t

@router.delete("/{threat_id}")
async def remove_threat(threat_id: str):
    return {"success": True}

@router.get("/")
async def list_threats():
    return threats_db

from pydantic import BaseModel
class RecalculateRequest(BaseModel):
    terrain_id: str
    
@router.post("/recalculate")
async def recalculate(req: RecalculateRequest):
    return {"status": "recalculated"}
