<div align="center">

# Tactical Digital Twin OS

### AI-Powered Defense Simulation & Mission Planning Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  <strong>Build virtual tactical environments from terrain data. Simulate missions. Analyze risks. Plan optimal routes.</strong>
</p>

</div>

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Upload  │  │  Tactical    │  │   AI Insights    │  │
│  │  Panel   │  │  Map (2D/3D) │  │   Panel          │  │
│  └──────────┘  └──────────────┘  └──────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Mission Timeline                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────┘
                      │ REST API + WebSocket
┌─────────────────────┴───────────────────────────────────┐
│                   BACKEND (FastAPI)                     │
│  ┌─────────────┐ ┌──────────┐ ┌───────────────────┐     │
│  │  Terrain    │ │  Risk    │ │  Movement         │     │
│  │  Intelligence │  Engine  │ │  Planner          │     │
│  ├─────────────┤ ├──────────┤ ├───────────────────┤     │
│  │  Observation│ │  Threat  │ │  What-If          │     │
│  │  Analysis   │ │ Injection│ │  Simulator        │     │
│  ├─────────────┤ ├──────────┤ ├───────────────────┤     │
│  │  Mission    │ │  AI      │ │  Report           │     │
│  │  Replay     │ │ Assistant│ │  Generator        │     │
│  └─────────────┘ └──────────┘ └───────────────────┘     │
└─────────────────────┬───────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────┐
│              AI / ML MODELS                             │
│  YOLOv8 │ SegFormer │ Random Forest │ NetworkX (A*)     │
└─────────────────────────────────────────────────────────┘
```

## Core Modules

| # | Module | Description |
|---|--------|-------------|
| 1 | **Terrain Intelligence Engine** | Computer vision pipeline (YOLOv8 + SegFormer) for terrain segmentation and classification. |
| 2 | **Digital Twin Generator** | Interactive 2D/3D tactical map with terrain layers, overlays, and navigation networks. |
| 3 | **AI Risk Simulation Engine** | Predicts danger regions using visibility, terrain, and strategic analysis to generate risk heatmaps. |
| 4 | **Smart Movement Planner** | Multi-objective pathfinding (A*, Dijkstra) for stealth, fastest, and safest routes. |
| 5 | **Observation Analysis System** | Line-of-sight, visibility cones, blind spot detection, and vantage point ranking. |
| 6 | **AI Mission Replay Engine** | Timeline-based mission simulation with strategy comparison capabilities. |
| 7 | **Threat Injection Simulator** | Manual and automated threat placement with automatic risk and path recalculation. |
| 8 | **What-If Simulation Engine** | Scenario-based re-simulation (e.g., "Main Route Blocked", "Weather Deterioration", "Comms Jamming"). |
| 9 | **AI Assistant** | Natural language tactical queries with LLM-ready context integration for over 15+ operational scenarios. |

## Tech Stack

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Leaflet, Deck.gl, Three.js, Zustand, Framer Motion

**Backend:** FastAPI, Python 3.11+, PyTorch, OpenCV, Ultralytics YOLOv8, Scikit-Learn, NetworkX, NumPy, SciPy

**Database:** PostgreSQL + PostGIS (SQLite for development)

**DevOps:** Docker, Docker Compose

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- Git

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Unix/MacOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Docker (Full Stack)
```bash
docker-compose up --build
```

## Project Structure

```
├── frontend/          # React + Vite + TypeScript
│   └── src/
│       ├── components/# UI components
│       ├── stores/    # Zustand state
│       ├── hooks/     # Custom hooks
│       ├── services/  # API client
│       └── types/     # TypeScript types
├── backend/           # FastAPI + Python
│   ├── engines/       # Core AI/ML engines
│   ├── ml/            # Model wrappers
│   ├── routers/       # API routes
│   ├── models/        # Data models
│   └── utils/         # Utilities
├── ml_models/         # Model configs & weights
├── data/              # Sample data & uploads
└── docs/              # Documentation
```

## Features

- **Interactive Tactical Map** — Dark-themed 2D/3D map with military-grade overlays and geospatial controls.
- **Risk Heatmaps** — Real-time danger zone visualization.
- **Smart Routing** — AI-optimized paths for stealth, speed, or safety.
- **Visibility Analysis** — Line-of-sight, blind spots, and observation coverage computations.
- **Threat Simulation** — Place hostiles and dynamically recalculate tactical advantages.
- **AI Assistant** — Natural language tactical queries and automated operational advice.
- **Mission Reports** — Auto-generated mission briefs and After Action Reports.

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  <strong>Built for defense-tech analysis and simulation</strong>
</div>
