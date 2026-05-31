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
        
        # ── Route Planning ───────────────────────────────────────────
        if "safest route" in query:
            response = (
                "🛡️ **SAFEST ROUTE ANALYSIS**\n\n"
                "Calculating the lowest-risk corridor by analyzing:\n"
                "• Terrain concealment scores per grid cell\n"
                "• Distance from all active threat positions\n"
                "• Elevation advantage (higher ground preferred)\n"
                "• Proximity to cover (forest, urban structures)\n\n"
                "This route prioritizes survival over speed."
            )
            actions.append({"type": "plan_route", "mission_type": "safest"})
            suggestions = ["Compare with fastest route", "Show risk along this route", "Run what-if: weather fog"]
            
        elif "fastest route" in query or "quick" in query:
            response = (
                "⚡ **FASTEST ROUTE ANALYSIS**\n\n"
                "Optimizing for minimum transit time:\n"
                "• Road surfaces prioritized for speed\n"
                "• Minimal elevation changes\n"
                "• Direct-line preference when terrain allows\n\n"
                "⚠️ Warning: Speed routes may cross exposed terrain."
            )
            actions.append({"type": "plan_route", "mission_type": "fastest"})
            suggestions = ["Compare with safest route", "Show exposure zones", "Add threat avoidance"]

        elif "stealth" in query or "covert" in query:
            response = (
                "🌑 **STEALTH ROUTE GENERATION**\n\n"
                "Maximizing concealment using:\n"
                "• Dense vegetation and forest corridors\n"
                "• Urban structure shadows and building cover\n"
                "• Low-profile terrain (defilades, ravines)\n"
                "• Maximum distance from enemy observation posts\n\n"
                "Movement speed will be significantly reduced."
            )
            actions.append({"type": "plan_route", "mission_type": "stealth"})
            suggestions = ["Check enemy line-of-sight", "Run mission replay", "Show observation coverage"]

        # ── Risk & Threat Analysis ───────────────────────────────────
        elif "highest risk" in query or "danger" in query or "hot zone" in query:
            response = (
                "🔴 **HIGH-RISK ZONE IDENTIFICATION**\n\n"
                "Highlighting areas with risk scores above 66%:\n"
                "• Open terrain with no concealment\n"
                "• Chokepoints surrounded by obstacles\n"
                "• Direct threat influence zones\n"
                "• Low-elevation exposed positions\n\n"
                "Recommend avoiding these areas or using smoke/suppressive fire for crossing."
            )
            actions.append({"type": "show_heatmap", "filter": "high_risk"})
            suggestions = ["Find routes avoiding these areas", "Show vantage points", "Run what-if: reinforcements"]
            
        elif "threat" in query and ("summary" in query or "report" in query or "analysis" in query):
            num_threats = context.get("threat_count", 0)
            response = (
                f"📊 **THREAT SITUATION REPORT**\n\n"
                f"Active threats in AO: **{num_threats}**\n\n"
                "Threat categories by risk priority:\n"
                "1. Snipers — High precision, lethal in open terrain\n"
                "2. IEDs — Area denial, unpredictable placement\n"
                "3. Patrols — Mobile, variable engagement patterns\n"
                "4. Outposts — Fixed positions with sustained observation\n"
                "5. Hostile Zones — Broad area threat coverage\n\n"
                "Each threat type has unique falloff characteristics in the risk model."
            )
            suggestions = ["Show threat influence radii", "Find gaps between threats", "Run what-if: unexpected encounter"]

        elif "chokepoint" in query or "choke" in query:
            response = (
                "🔍 **CHOKEPOINT DETECTION**\n\n"
                "Identified narrow passages where movement is constrained:\n"
                "• Cells with ≥3 impassable neighbours (obstacles/water)\n"
                "• High ambush probability due to restricted maneuver space\n"
                "• Recommend overwatch positions before crossing\n\n"
                "Mark chokepoints as high-priority observation targets."
            )
            actions.append({"type": "detect_chokepoints"})
            suggestions = ["Show observation coverage at chokepoints", "Plan route avoiding chokepoints"]

        # ── Observation & Visibility ─────────────────────────────────
        elif "blind spot" in query or "dead zone" in query:
            response = (
                "👁️ **BLIND SPOT ANALYSIS**\n\n"
                "Calculating areas invisible to all current observer positions:\n"
                "• Terrain-masked zones behind ridgelines\n"
                "• Building shadows in urban areas\n"
                "• Deep valleys below observer elevation\n\n"
                "These are high-risk areas for enemy concealment and infiltration."
            )
            actions.append({"type": "show_blind_spots"})
            suggestions = ["Place new observation post", "Show coverage overlap", "Check enemy approach routes"]
            
        elif "observation" in query or "viewshed" in query or "line of sight" in query:
            response = (
                "🔭 **OBSERVATION ANALYSIS**\n\n"
                "Current viewshed capabilities:\n"
                "• Line-of-sight computed using Bresenham ray-casting\n"
                "• Elevation and terrain blockers (buildings, obstacles) considered\n"
                "• Direction and FOV cone configurable in the panel\n\n"
                "Enable Vision Mode and click any point to compute the viewshed."
            )
            suggestions = ["Show blind spots", "Find best vantage point", "Check coverage at chokepoints"]

        elif "vantage" in query or "overwatch" in query:
            response = (
                "⛰️ **VANTAGE POINT ANALYSIS**\n\n"
                "Identifying optimal observation positions based on:\n"
                "• Elevation advantage (highest ground)\n"
                "• Maximum visible area (coverage percentage)\n"
                "• Defensive terrain nearby (cover availability)\n"
                "• Distance from known threats\n\n"
                "Top positions will be marked on the map."
            )
            actions.append({"type": "find_vantage_points"})
            suggestions = ["Check line-of-sight from vantage point", "Plan route to vantage point"]

        # ── Route Comparison ─────────────────────────────────────────
        elif "compare" in query and "route" in query:
            response = (
                "📈 **ROUTE COMPARISON MATRIX**\n\n"
                "Comparing all planned routes across:\n"
                "• Total distance and estimated transit time\n"
                "• Average risk score along corridor\n"
                "• Terrain exposure percentage\n"
                "• Concealment rating (inverse of exposure)\n"
                "• Number of threat zones crossed\n\n"
                "Select routes in the Movement Planner to compare."
            )
            actions.append({"type": "compare_routes"})
            suggestions = ["Show highest-risk segment", "Run mission replay for each", "Overlay all routes on map"]

        # ── What-If & Scenario ───────────────────────────────────────
        elif "what if" in query or "scenario" in query:
            response = (
                "🎯 **WHAT-IF SCENARIO ENGINE**\n\n"
                "Available scenarios for stress-testing:\n"
                "• Main Route Blocked — Tests rerouting capability\n"
                "• Weather Deterioration (Fog) — Visibility constraints\n"
                "• Unexpected Threat Encounter — Dynamic threat injection\n"
                "• Comms Jamming — Degraded C2 operations\n"
                "• Night Operations — Low-light constraints\n"
                "• Reinforcements Arriving — Time-critical extraction\n"
                "• Bridge Destroyed — Water crossing denied\n"
                "• Civilian Presence — ROE restrictions\n\n"
                "Run scenarios from the What-If panel."
            )
            suggestions = ["Run fog scenario", "Run reinforcements scenario", "Compare before/after risk"]

        # ── Terrain ──────────────────────────────────────────────────
        elif "terrain" in query and ("summary" in query or "report" in query or "analysis" in query):
            response = (
                "🗺️ **TERRAIN INTELLIGENCE SUMMARY**\n\n"
                "Terrain has been classified into the following categories:\n"
                "• Open/Exposed — High visibility, fast movement\n"
                "• Forest/Vegetation — Concealment, slow movement\n"
                "• Urban/Building — Hard cover, ambush risk\n"
                "• Water — Impassable barrier\n"
                "• Road — Fast movement, high exposure\n"
                "• Obstacle — Impassable, creates chokepoints\n\n"
                "Elevation data integrated for 3D line-of-sight calculations."
            )
            suggestions = ["Show terrain overlay", "Find chokepoints", "Show elevation profile"]

        elif "weather" in query:
            response = (
                "🌤️ **WEATHER CONDITIONS**\n\n"
                "Current weather data is fetched with terrain analysis:\n"
                "• Visibility range affects observation cone\n"
                "• Wind speed impacts smoke/gas dispersal\n"
                "• Cloud cover affects aerial reconnaissance\n"
                "• Temperature impacts personnel endurance\n\n"
                "Run 'Weather Deterioration (Fog)' scenario to stress-test visibility."
            )
            suggestions = ["Run fog scenario", "Show observation coverage", "Check route exposure in fog"]

        # ── Mission Summary ──────────────────────────────────────────
        elif "mission" in query and ("summary" in query or "status" in query or "brief" in query):
            num_threats = context.get("threat_count", 0)
            num_routes = context.get("route_count", 0)
            response = (
                f"📋 **MISSION STATUS BRIEFING**\n\n"
                f"• Active threats: **{num_threats}**\n"
                f"• Planned routes: **{num_routes}**\n"
                "• Terrain: Analyzed and classified\n"
                "• Risk heatmap: Live and updating\n\n"
                "All mission components are operational. "
                "Proceed through the workflow stages for full tactical preparation."
            )
            suggestions = ["Show highest risk areas", "Compare routes", "Run what-if scenario"]

        # ── Help ─────────────────────────────────────────────────────
        elif "help" in query or "what can you do" in query:
            response = (
                "🤖 **TACTICAL AI ASSISTANT — CAPABILITIES**\n\n"
                "I can help you with:\n"
                "• **Route Planning** — 'find safest route', 'stealth route', 'fastest route'\n"
                "• **Risk Analysis** — 'show danger zones', 'threat summary', 'chokepoints'\n"
                "• **Observation** — 'show blind spots', 'find vantage points', 'viewshed analysis'\n"
                "• **Comparison** — 'compare routes', 'mission summary'\n"
                "• **Scenarios** — 'what-if scenarios', 'weather impact'\n"
                "• **Terrain** — 'terrain report', 'elevation analysis'\n\n"
                "Ask me anything about your tactical situation."
            )
            suggestions = ["Find safest route", "Show threat summary", "Run what-if", "Mission status"]

        # ── Fallback ─────────────────────────────────────────────────
        else:
            response = (
                f"📡 I've received your query: *\"{query_request.query}\"*\n\n"
                "I'm currently operating in rule-based intelligence mode. "
                "Try one of these tactical queries:\n\n"
                "• 'Find safest route' — Route optimization\n"
                "• 'Show danger zones' — Risk identification\n"
                "• 'Threat analysis report' — Threat summary\n"
                "• 'Show blind spots' — Coverage gaps\n"
                "• 'Compare routes' — Multi-route comparison\n"
                "• 'Help' — Full capability list"
            )
            suggestions = ["Find safest route", "Show danger zones", "Threat analysis", "Help"]
            
        return AIQueryResponse(
            response=response,
            actions=actions,
            suggestions=suggestions
        )
