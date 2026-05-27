import uuid
from typing import Dict, List, Optional
import numpy as np

from models.threat import ThreatCreate, ThreatResponse

class ThreatInjectionEngine:
    def __init__(self):
        # In-memory storage for threats
        self.threats: Dict[str, ThreatResponse] = {}

    def add_threat(self, threat: ThreatCreate) -> ThreatResponse:
        threat_id = str(uuid.uuid4())
        new_threat = ThreatResponse(
            id=threat_id,
            type=threat.type,
            lat=threat.lat,
            lng=threat.lng,
            radius=threat.radius,
            active=threat.active
        )
        self.threats[threat_id] = new_threat
        return new_threat

    def remove_threat(self, threat_id: str) -> bool:
        if threat_id in self.threats:
            del self.threats[threat_id]
            return True
        return False

    def get_all_threats(self) -> List[ThreatResponse]:
        return list(self.threats.values())

    def compute_threat_influence(self, grid_shape: tuple, bounds: dict, geo_utils) -> np.ndarray:
        \"\"\"
        Compute a threat influence grid [0, 1] based on distance to each active threat.
        \"\"\"
        influence_grid = np.zeros(grid_shape)
        active_threats = [t for t in self.threats.values() if t.active]
        
        if not active_threats:
            return influence_grid

        # Simple inverse distance falloff
        for threat in active_threats:
            # Get grid coordinates of threat
            r, c = geo_utils.lat_lng_to_grid(threat.lat, threat.lng, bounds, grid_shape)
            
            # Very rough pixel radius assuming square cells
            # In a real system, would convert radius in meters to grid cells using proper projection
            lat_diff = bounds["north"] - bounds["south"]
            meters_per_lat_deg = 111000  # Approx
            lat_per_cell = lat_diff / grid_shape[0]
            meters_per_cell = lat_per_cell * meters_per_lat_deg
            cell_radius = int(threat.radius / max(meters_per_cell, 1))

            # Apply influence
            for i in range(max(0, r - cell_radius), min(grid_shape[0], r + cell_radius + 1)):
                for j in range(max(0, c - cell_radius), min(grid_shape[1], c + cell_radius + 1)):
                    dist = np.sqrt((i - r)**2 + (j - c)**2)
                    if dist <= cell_radius:
                        # Inverse distance or linear falloff
                        intensity = 1.0 - (dist / cell_radius)
                        # Different threats have different max risk multipliers
                        base_risk = 1.0
                        if threat.type == 'sniper':
                            base_risk = 0.9
                        elif threat.type == 'checkpoint':
                            base_risk = 0.8
                        elif threat.type == 'tower':
                            base_risk = 0.6
                        elif threat.type == 'danger_zone':
                            base_risk = 0.7
                        elif threat.type == 'blocked_road':
                            base_risk = 1.0 # Obstacle
                            
                        influence_grid[i, j] = max(influence_grid[i, j], intensity * base_risk)

        return influence_grid

    def recalculate_all(self, terrain_grid: np.ndarray, elevation_grid: Optional[np.ndarray], bounds: dict, risk_engine) -> dict:
        \"\"\"
        Recalculate risk heatmap with updated threats.
        (Route replanning usually happens separately based on updated risk)
        \"\"\"
        return risk_engine.compute_risk_heatmap(terrain_grid, self.get_all_threats(), bounds, elevation_grid)
