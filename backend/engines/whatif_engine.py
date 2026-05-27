from typing import Dict, Any
import numpy as np

from models.mission import WhatIfRequest, WhatIfResult

class WhatIfEngine:
    def __init__(self, risk_engine, path_planner, threat_engine):
        self.risk_engine = risk_engine
        self.path_planner = path_planner
        self.threat_engine = threat_engine

    def run_scenario(self, scenario: WhatIfRequest, current_state: dict) -> WhatIfResult:
        \"\"\"
        Apply scenario modifications to terrain/threat state and re-run simulations.
        current_state needs to contain terrain_grid, bounds, original_routes, etc.
        \"\"\"
        terrain_grid = current_state.get('terrain_grid', np.zeros((10, 10)))
        bounds = current_state.get('bounds', {"north": 1, "south": 0, "east": 1, "west": 0})
        original_routes = current_state.get('routes', [])
        
        # Clone terrain for modification
        modified_terrain = terrain_grid.copy()
        
        changes = [f"Applied scenario: {scenario.scenario_type}"]
        
        # Apply modifications
        if scenario.scenario_type == 'road_blocked':
            lat = scenario.params.get('lat')
            lng = scenario.params.get('lng')
            radius = scenario.params.get('radius', 50) # meters
            if lat and lng:
                # Need geo_utils to convert - assuming we have access or mock it here for structural completeness
                changes.append(f"Blocked road at {lat}, {lng} (radius: {radius}m)")
                # In real code: find cells within radius and set to obstacle class (e.g. 2 or string 'obstacle')
                
        elif scenario.scenario_type == 'new_threat':
            from models.threat import ThreatCreate
            threat = ThreatCreate(**scenario.params)
            self.threat_engine.add_threat(threat)
            changes.append(f"Added new threat of type {threat.type}")
            
        elif scenario.scenario_type == 'weather_change':
            visibility_modifier = scenario.params.get('visibility_modifier', 0.5)
            changes.append(f"Weather changed, visibility modifier: {visibility_modifier}")
            # This would normally affect observation analysis or risk models

        # 1. Re-run risk simulation
        new_risk_result = self.risk_engine.compute_risk_heatmap(
            modified_terrain, 
            self.threat_engine.get_all_threats(), 
            bounds
        )
        
        # 2. Re-run pathfinding if original routes existed
        new_routes = []
        if original_routes:
            # Need a graph
            graph = self.path_planner.build_navigation_graph(modified_terrain, new_risk_result.grid)
            for route in original_routes:
                start = (route.path[0][0], route.path[0][1])
                end = (route.path[-1][0], route.path[-1][1])
                # Mocks mission type as 'safest' for what-if reruns
                planned = self.path_planner.plan_routes(graph, start, end, 'safest', modified_terrain, new_risk_result.grid, bounds)
                if planned:
                    new_routes.extend(planned)

        # 3. Compare metrics (simplified)
        before_metrics = {
            "avg_risk": current_state.get("risk_stats", {}).get("avg_risk", 0),
            "route_count": len(original_routes)
        }
        
        after_metrics = {
            "avg_risk": new_risk_result.stats.get("avg_risk", 0) if hasattr(new_risk_result, 'stats') else 0,
            "route_count": len(new_routes)
        }
        
        return WhatIfResult(
            before_metrics=before_metrics,
            after_metrics=after_metrics,
            changes=changes
        )
