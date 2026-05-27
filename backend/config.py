"""
Application configuration using environment variables with sensible defaults.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# ── Base Paths ──────────────────────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(BASE_DIR / "uploads")))
MODEL_DIR = Path(os.getenv("MODEL_DIR", str(BASE_DIR / "ml_weights")))

# ── Database ────────────────────────────────────────────────────────────────
DATABASE_URL: str = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./tactical_twin.db",
)

# ── CORS ────────────────────────────────────────────────────────────────────
CORS_ORIGINS: list[str] = os.getenv(
    "CORS_ORIGINS", "*"
).split(",")

# ── ML / Compute ────────────────────────────────────────────────────────────
ML_DEVICE: str = os.getenv("ML_DEVICE", "cpu")

# ── Application ─────────────────────────────────────────────────────────────
APP_TITLE = "Tactical Digital Twin – AI Mission Planner"
APP_DESCRIPTION = (
    "Defense-tech AI platform for terrain intelligence, risk simulation, "
    "movement planning, observation analysis, and mission replay."
)
APP_VERSION = "1.0.0"

# ── Terrain defaults ────────────────────────────────────────────────────────
DEFAULT_GRID_RESOLUTION = 100          # cells per axis
MAX_UPLOAD_SIZE_MB = 50
SUPPORTED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".tif", ".tiff", ".bmp"}

# ── Movement planner defaults ───────────────────────────────────────────────
DEFAULT_MOVEMENT_SPEED_MPS = 1.4       # average walking speed m/s
DIAGONAL_FACTOR = 1.414

# ── Risk weights (tunable) ──────────────────────────────────────────────────
RISK_WEIGHT_VISIBILITY = 0.30
RISK_WEIGHT_TERRAIN_DANGER = 0.25
RISK_WEIGHT_THREAT_PROXIMITY = 0.30
RISK_WEIGHT_ELEVATION = 0.15
