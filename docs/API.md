# API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
No authentication required for development. Production deployment should add JWT/API key auth.

---

## Endpoints

### Health Check
```
GET /health
```
Returns system status.

---

### 1. Terrain Intelligence

#### Upload Terrain Image
```
POST /api/terrain/upload
Content-Type: multipart/form-data

Body: file (image/tiff/geotiff)
```

**Response:**
```json
{
  "id": "uuid",
  "filename": "satellite_image.jpg",
  "status": "uploaded"
}
```

#### Analyze Terrain
```
POST /api/terrain/analyze/{terrain_id}
```

**Response:**
```json
{
  "id": "uuid",
  "segments": [
    {
      "type": "building",
      "polygon": [[lat, lng], ...],
      "confidence": 0.92
    }
  ],
  "layers": {
    "safe": [...],
    "exposed": [...],
    "obstacle": [...]
  },
  "terrain_classes": {
    "safe": 340,
    "exposed": 520,
    "urban": 180
  },
  "bounds": {
    "north": 34.06,
    "south": 34.04,
    "east": -118.23,
    "west": -118.25
  }
}
```

#### Get Segments
```
GET /api/terrain/{terrain_id}/segments
```

#### Get Layers
```
GET /api/terrain/{terrain_id}/layers
```

#### List All
```
GET /api/terrain/
```

---

### 2. Risk Simulation

#### Compute Risk Heatmap
```
POST /api/risk/compute
Content-Type: application/json

{
  "terrain_id": "uuid",
  "include_threats": true
}
```

**Response:**
```json
{
  "grid": [[{"x": 0, "y": 0, "risk_score": 0.23, "risk_level": "low"}, ...]],
  "bounds": {...},
  "stats": {
    "avg_risk": 0.45,
    "max_risk": 0.92,
    "high_risk_pct": 0.15
  }
}
```

#### Detect Chokepoints
```
POST /api/risk/chokepoints

{"terrain_id": "uuid"}
```

---

### 3. Pathfinding

#### Plan Routes
```
POST /api/pathfinding/plan
Content-Type: application/json

{
  "start_lat": 34.0522,
  "start_lng": -118.2437,
  "end_lat": 34.0580,
  "end_lng": -118.2380,
  "mission_type": "stealth",
  "terrain_id": "uuid"
}
```

**Response:**
```json
{
  "routes": [
    {
      "id": "route-a",
      "name": "Stealth Route (Minimum Exposure)",
      "path": [[34.0522, -118.2437], ...],
      "distance_m": 1250.5,
      "estimated_time_s": 420,
      "exposure_score": 0.15,
      "risk_score": 0.22,
      "color": "#00f0ff"
    },
    ...
  ]
}
```

---

### 4. Observation Analysis

#### Line of Sight Check
```
POST /api/observation/los

{
  "observer_lat": 34.0522,
  "observer_lng": -118.2437,
  "target_lat": 34.0540,
  "target_lng": -118.2410
}
```

#### Compute Visibility Cone
```
POST /api/observation/visibility

{
  "observer_lat": 34.0522,
  "observer_lng": -118.2437,
  "range_m": 500,
  "angle_deg": 90,
  "direction_deg": 45
}
```

#### Find Vantage Points
```
POST /api/observation/vantage-points

{"terrain_id": "uuid", "count": 5}
```

#### Detect Blind Spots
```
POST /api/observation/blind-spots

{"terrain_id": "uuid", "observer_positions": [[lat, lng], ...]}
```

---

### 5. Simulation

#### Generate Mission Replay
```
POST /api/simulation/replay

{"route_id": "route-a", "terrain_id": "uuid"}
```

#### Compare Strategies
```
POST /api/simulation/compare

{"route_a_id": "route-a", "route_b_id": "route-b"}
```

---

### 6. Threats

#### Add Threat
```
POST /api/threats/

{
  "type": "sniper",
  "lat": 34.0550,
  "lng": -118.2400,
  "radius": 200,
  "active": true
}
```

#### Remove Threat
```
DELETE /api/threats/{threat_id}
```

#### List Threats
```
GET /api/threats/
```

#### Recalculate After Changes
```
POST /api/threats/recalculate

{"terrain_id": "uuid"}
```

---

### 7. What-If Simulation

#### Run Scenario
```
POST /api/whatif/simulate

{
  "scenario_type": "road_blocked",
  "params": {
    "lat": 34.0540,
    "lng": -118.2420,
    "radius": 100
  }
}
```

---

### 8. AI Assistant

#### Query
```
POST /api/assistant/query

{
  "query": "Find the safest route avoiding the northern sector",
  "context": {
    "terrain_id": "uuid",
    "current_routes": [...]
  }
}
```

**Response:**
```json
{
  "response": "I've analyzed the terrain and found a route...",
  "actions": [
    {"type": "show_route", "route_id": "route-safe-1"},
    {"type": "highlight_area", "bounds": {...}}
  ],
  "suggestions": [
    "Compare this with the stealth route",
    "Show risk heatmap for this area"
  ]
}
```

#### Get Suggestions
```
GET /api/assistant/suggestions
```
