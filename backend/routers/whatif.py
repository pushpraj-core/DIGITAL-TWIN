from fastapi import APIRouter
from models.mission import WhatIfRequest, WhatIfResult

router = APIRouter(prefix="/whatif", tags=["WhatIf"])

@router.post("/simulate", response_model=WhatIfResult)
async def run_scenario(req: WhatIfRequest):
    return WhatIfResult(
        before_metrics={"avg_risk": 0.4},
        after_metrics={"avg_risk": 0.6},
        changes=["Added threat"]
    )
