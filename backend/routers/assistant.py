from fastapi import APIRouter
from models.mission import AIQueryRequest, AIQueryResponse

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/query", response_model=AIQueryResponse)
async def query_assistant(req: AIQueryRequest):
    return AIQueryResponse(
        response="This is a mock AI response.",
        actions=[],
        suggestions=["Find safest route", "Compare routes"]
    )

@router.get("/suggestions")
async def get_suggestions():
    return {"suggestions": ["Find safest route", "Show highest risk region", "Compare all routes", "Show blind spots"]}
