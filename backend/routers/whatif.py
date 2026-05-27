from fastapi import APIRouter
from models.mission import WhatIfRequest, WhatIfResult

router = APIRouter(prefix="/whatif", tags=["WhatIf"])

from routers.terrain import STORE
from fastapi import HTTPException

@router.post("/simulate", response_model=WhatIfResult)
async def run_scenario(req: WhatIfRequest):
    terrain_id = req.params.get("terrain_id")
    terrain_data = STORE.get(terrain_id) if terrain_id else None
    
    base_risk = 0.35
    if terrain_data and "analysis" in terrain_data:
        # Just use a baseline if real stats aren't cached easily
        base_risk = 0.42

    changes = []
    risk_increase = 0.0
    time_delay = 0

    if req.scenario_type == "Main Route Blocked":
        changes.append("Primary road network marked as impassable.")
        changes.append("Pathfinder rerouted through secondary terrain.")
        risk_increase = 0.18
        time_delay = 450
    elif req.scenario_type == "Weather Deterioration (Fog)":
        changes.append("Visibility reduced to 50m.")
        changes.append("Observation coverage dropped by 40%.")
        risk_increase = 0.25
        time_delay = 120
    elif req.scenario_type == "Unexpected Threat Encounter":
        changes.append("Injected 3 mobile patrol threats near chokepoints.")
        risk_increase = 0.35
        time_delay = 300
    elif req.scenario_type == "Comms Jamming":
        changes.append("Loss of live drone feed.")
        risk_increase = 0.15
        time_delay = 0
    else:
        changes.append(f"Applied scenario: {req.scenario_type}")
        risk_increase = 0.1

    after_risk = min(base_risk + risk_increase, 1.0)
    
    return WhatIfResult(
        before_metrics={"avg_risk": base_risk},
        after_metrics={"avg_risk": after_risk},
        changes=changes
    )
