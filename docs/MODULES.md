# Modules Documentation

## Module 1: Terrain Intelligence Engine

### Purpose
Processes satellite imagery, drone footage, and maps to detect terrain features and create a classified terrain grid.

### Computer Vision Pipeline
1. **Preprocessing**: Resize, normalize, tile large images
2. **Color Analysis**: HSV thresholding for water (blue), vegetation (green), roads (gray)
3. **Edge Detection**: Canny edges for structure boundaries
4. **Object Detection**: YOLOv8 for buildings, vehicles, bridges
5. **Semantic Segmentation**: SegFormer for pixel-wise classification
6. **Post-processing**: Merge results, generate terrain grid

### Terrain Classes
| Class | Description | Risk Factor |
|-------|-------------|-------------|
| Safe | Clear movement areas with cover nearby | Low |
| Exposed | Open terrain with high visibility | High |
| Obstacle | Impassable terrain (water, walls, cliffs) | N/A |
| High Ground | Elevated positions with tactical advantage | Variable |
| Urban | Built-up areas with complex movement | Medium |
| Forest | Dense vegetation providing concealment | Low |

---

## Module 2: Digital Twin Generator

### 2D View (Leaflet)
- CartoDB dark matter tiles (free, no API key)
- Custom tactical overlays
- Layer toggle controls
- Deck.gl WebGL overlays for heatmaps

### 3D View (Three.js)
- Heightmap-based terrain mesh
- Color-coded by terrain type or risk
- Orbit controls for navigation
- Toggle between 2D/3D modes

---

## Module 3: AI Risk Simulation Engine

### Risk Factors
1. **Visibility Exposure** (30% weight): How visible is the position?
2. **Terrain Danger** (25% weight): Chokepoints, dead ends, obstacle density
3. **Strategic Danger** (25% weight): Ambush probability, elevation disadvantage
4. **Threat Proximity** (20% weight): Distance to known threats

### Risk Levels
- **Green (0.0-0.33)**: Low risk, safe for movement
- **Yellow (0.33-0.66)**: Medium risk, proceed with caution
- **Red (0.66-1.0)**: High risk, avoid or use extreme caution

---

## Module 4: Smart Movement Planner

### Algorithms
- **A***: Primary pathfinding with custom heuristic
- **Dijkstra**: Fallback for complete shortest path
- **Multi-objective**: Pareto-optimal route generation

### Mission Types
| Type | Optimization | Use Case |
|------|-------------|----------|
| Stealth | Minimize exposure (80%) | Covert insertion |
| Fastest | Minimize distance (90%) | Emergency response |
| Safest | Minimize risk (90%) | High-value escort |
| Reconnaissance | Balance coverage + safety | Intelligence gathering |
| Extraction | Fast exit + acceptable risk | Rapid withdrawal |

### Route Metrics
- Distance (meters)
- Estimated time (seconds)
- Exposure score (0-1)
- Risk score (0-1)

---

## Module 5: Observation Analysis System

### Capabilities
- **Line of Sight**: Can position A observe position B?
- **Visibility Cone**: What can be seen from a position within an angle/range?
- **Blind Spots**: Areas not visible from any observation point
- **Vantage Points**: Best observation positions ranked by coverage
- **Coverage Map**: How many observers can see each cell

### Methods
- Bresenham's line algorithm for ray casting on grid
- Elevation-based obstruction checking
- Terrain class visibility modifiers (forest blocks, buildings block, open exposes)

---

## Module 6: AI Mission Replay Engine

### Features
- Timeline with play/pause/speed controls
- Animated unit movement along route
- Event markers (risk changes, threat proximity, waypoints)
- Strategy A vs B comparison
- Analytics: exposure duration, travel time, risk encounters

---

## Module 7: Threat Injection Simulator

### Threat Types
| Type | Icon | Influence | Effect |
|------|------|-----------|--------|
| Hostile Checkpoint | 🛡️ | 300m radius | Blocks direct passage |
| Sniper Position | 🎯 | 500m radius | High danger in LOS |
| Surveillance Tower | 👁️ | 1000m radius | Visibility exposure |
| Blocked Road | 🚧 | Road segment | Forces reroute |
| Danger Zone | ⚠️ | Custom radius | General high risk |

### Recalculation Cascade
Adding/removing threats automatically triggers:
1. Risk heatmap recalculation
2. Route replanning
3. Visibility map update

---

## Module 8: What-If Simulation Engine

### Supported Scenarios
1. **Road Blocked**: Terrain cells become impassable
2. **New Threat**: Threat added at specified position
3. **Weather Change**: Visibility parameters modified
4. **Terrain Change**: Terrain class modified for area

### Output
- Before/after metrics comparison
- Updated risk heatmap
- Re-optimized routes
- Impact summary

---

## Module 9: AI Assistant

### Natural Language Commands
- "Find safest route" → Triggers pathfinding (safest mode)
- "Show highest risk region" → Highlights max risk area on map
- "Compare all routes" → Shows strategy comparison
- "Generate stealth strategy" → Plans stealth route with analysis
- "Show blind spots" → Runs observation analysis

### Architecture
- Pattern-matching NLP for common commands
- LLM integration for complex queries (optional)
- Context-aware responses using current terrain/risk state
- Map action triggers (show route, highlight area, etc.)
