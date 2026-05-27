from typing import Dict, Any
from models.mission import AIQueryRequest, AIQueryResponse

class AIAssistant:
    def __init__(self):
        # In a real app, this would integrate with an LLM (OpenAI/Gemini)
        pass

    def process_query(self, query_request: AIQueryRequest) -> AIQueryResponse:
        query = query_request.query.lower()
        context = query_request.context or {}
        
        actions = []
        suggestions = []
        
        if "safest route" in query:
            response = "I will calculate the safest route by prioritizing areas with low visibility exposure and staying away from known threats."
            actions.append({"type": "plan_route", "mission_type": "safest"})
            suggestions = ["Compare with fastest route", "Show highest risk areas along this route"]
            
        elif "highest risk" in query or "danger" in query:
            response = "I have highlighted the regions with the highest risk scores. These are typically open areas, chokepoints, or areas near known threats."
            actions.append({"type": "show_heatmap", "filter": "high_risk"})
            suggestions = ["Find routes avoiding these areas", "Show vantage points overlooking these areas"]
            
        elif "compare" in query and "route" in query:
            response = "Comparing the currently planned routes based on distance, exposure, and risk encounters."
            actions.append({"type": "compare_routes"})
            suggestions = ["Run mission replay for comparison"]
            
        elif "blind spot" in query:
            response = "Calculating blind spots that cannot be observed from current friendly positions due to terrain and elevation masking."
            actions.append({"type": "show_blind_spots"})
            suggestions = ["Place new observation post to cover blind spots"]
            
        elif "stealth" in query:
            response = "Generating a stealth route. This path will maximize the use of forested and urban cover while avoiding exposed terrain and high elevations."
            actions.append({"type": "plan_route", "mission_type": "stealth"})
            suggestions = ["Run mission replay", "Check line of sight from enemy positions"]
            
        else:
            response = f"I've received your query: '{query_request.query}'. I'm currently operating in rule-based fallback mode. Try asking me to 'find safest route', 'show blind spots', or 'compare routes'."
            suggestions = ["Find safest route", "Show highest risk region", "Compare all routes", "Show blind spots"]
            
        return AIQueryResponse(
            response=response,
            actions=actions,
            suggestions=suggestions
        )
