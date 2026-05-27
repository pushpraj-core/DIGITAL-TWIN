from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routers import terrain, risk, pathfinding, observation, simulation, threats, whatif, assistant
import config as settings

app = FastAPI(
    title="Tactical Digital Twin API",
    description="Backend API for the Tactical Digital Twin & AI Mission Planner",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.MODEL_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include routers
app.include_router(terrain.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(pathfinding.router, prefix="/api")
app.include_router(observation.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(threats.router, prefix="/api")
app.include_router(whatif.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": app.version}
