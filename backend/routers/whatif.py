from fastapi import APIRouter
from models.mission import WhatIfRequest, WhatIfResult

router = APIRouter(prefix="/whatif", tags=["WhatIf"])

from routers.terrain import STORE
from fastapi import HTTPException

# ── Scenario Profiles ────────────────────────────────────────────────────────
# Each scenario defines its effects: risk_increase, time_delay, visibility_impact,
# and descriptive changes for the UI.

_SCENARIO_PROFILES = {
    "Main Route Blocked": {
        "changes": [
            "Primary road network marked as impassable.",
            "Pathfinder rerouted through secondary terrain.",
            "Vehicle support unavailable on alternate route.",
            "ETA increased by estimated 7.5 minutes.",
        ],
        "risk_increase": 0.18,
        "time_delay": 450,
        "visibility_impact": 0,
        "recommendation": "Switch to stealth routing and avoid open roads. Consider foot-mobile movement."
    },
    "Weather Deterioration (Fog)": {
        "changes": [
            "Visibility reduced to 50m due to dense fog.",
            "Observation coverage dropped by 40%.",
            "Aerial reconnaissance suspended.",
            "Thermal imaging effectiveness reduced by 60%.",
        ],
        "risk_increase": 0.25,
        "time_delay": 120,
        "visibility_impact": -40,
        "recommendation": "Delay movement until visibility improves, or switch to thermal-guided navigation."
    },
    "Unexpected Threat Encounter": {
        "changes": [
            "Injected 3 mobile patrol threats near chokepoints.",
            "Risk corridor expanded in eastern sector.",
            "Movement speed reduced to cautious pace.",
            "Nearest safe rally point identified 800m west.",
        ],
        "risk_increase": 0.35,
        "time_delay": 300,
        "visibility_impact": 0,
        "recommendation": "Activate threat avoidance routing. Consider fallback to rally point alpha."
    },
    "Comms Jamming": {
        "changes": [
            "Loss of live drone feed and satellite relay.",
            "GPS accuracy degraded to 50m CEP.",
            "Switching to dead-reckoning navigation.",
            "Team communication limited to line-of-sight radio.",
        ],
        "risk_increase": 0.15,
        "time_delay": 0,
        "visibility_impact": -20,
        "recommendation": "Pre-cache waypoints. Use compass-based navigation. Maintain visual contact between elements."
    },
    "Night Operations": {
        "changes": [
            "Ambient light reduced to near-zero.",
            "Movement speed reduced by 40%.",
            "NVG-dependent navigation activated.",
            "Thermal signatures become primary detection vector.",
        ],
        "risk_increase": 0.12,
        "time_delay": 600,
        "visibility_impact": -60,
        "recommendation": "Maximize terrain concealment. Use IR beacons for friendly identification."
    },
    "Reinforcements Arriving": {
        "changes": [
            "Enemy QRF inbound from north — ETA 12 minutes.",
            "Hostile helicopter patrol added to threat matrix.",
            "Risk zones expanded in open terrain sectors.",
            "Extraction window narrowed to 8 minutes.",
        ],
        "risk_increase": 0.40,
        "time_delay": 180,
        "visibility_impact": 0,
        "recommendation": "Expedite mission. Switch to fastest extraction route. Call for overwatch support."
    },
    "Bridge Destroyed": {
        "changes": [
            "Primary water crossing at bridge is impassable.",
            "Alternative ford point identified 1.2km downstream.",
            "Vehicle crossing impossible; foot-mobile only.",
            "Terrain risk elevated near riverbank.",
        ],
        "risk_increase": 0.20,
        "time_delay": 520,
        "visibility_impact": 0,
        "recommendation": "Replan route via downstream ford. Secure far bank before crossing."
    },
    "Civilian Presence": {
        "changes": [
            "Civilian population detected in AO.",
            "Rules of engagement restrict area fires.",
            "Movement constrained to avoid populated zones.",
            "Covert approach required — no flashbangs or smoke.",
        ],
        "risk_increase": 0.10,
        "time_delay": 240,
        "visibility_impact": 0,
        "recommendation": "Switch to precision engagement rules. Use non-lethal deterrents. Avoid main thoroughfares."
    },
}


@router.post("/simulate", response_model=WhatIfResult)
async def run_scenario(req: WhatIfRequest):
    terrain_id = req.params.get("terrain_id")
    terrain_data = STORE.get(terrain_id) if terrain_id else None
    
    base_risk = 0.35
    if terrain_data and "analysis" in terrain_data:
        base_risk = 0.42

    # Look up scenario profile
    profile = _SCENARIO_PROFILES.get(req.scenario_type)
    
    if profile:
        changes = list(profile["changes"])
        risk_increase = profile["risk_increase"]
        time_delay = profile["time_delay"]
        recommendation = profile.get("recommendation", "")
        if recommendation:
            changes.append(f"⚡ RECOMMENDATION: {recommendation}")
    else:
        changes = [f"Applied scenario: {req.scenario_type}"]
        risk_increase = 0.1
        time_delay = 0

    after_risk = min(base_risk + risk_increase, 1.0)
    
    return WhatIfResult(
        before_metrics={"avg_risk": round(base_risk, 4), "time_delay_s": 0},
        after_metrics={"avg_risk": round(after_risk, 4), "time_delay_s": time_delay},
        changes=changes,
    )
