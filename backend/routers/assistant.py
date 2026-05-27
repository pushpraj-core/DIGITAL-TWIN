from fastapi import APIRouter
from models.mission import AIQueryRequest, AIQueryResponse

router = APIRouter(prefix="/assistant", tags=["Assistant"])

@router.post("/query", response_model=AIQueryResponse)
async def query_assistant(req: AIQueryRequest):
    from engines.ai_assistant import AIAssistant
    
    # In a full app, we might instantiate this once or use dependency injection
    assistant = AIAssistant()
    return assistant.process_query(req)

@router.get("/suggestions")
async def get_suggestions():
    return {"suggestions": ["Find safest route", "Show highest risk region", "Compare all routes", "Show blind spots"]}
