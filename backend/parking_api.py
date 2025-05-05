# This is the main driver. It's role is to be the main driver and router for my FastAPI (RESTful API) to call back from my front end
# my front end is Vite + React ( I really don't know why I did this to my self). This is the main driver

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from .api import spots_routes, admin_routes, streaming_routes, config_routes
from .services.detection import auto_resume_detection

app = FastAPI(
    title="Parking API",
    description="Provides parking status, layout management, and upload endpoints"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static upload directory
BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Routers
app.include_router(spots_routes.router)
app.include_router(admin_routes.router)
app.include_router(streaming_routes.router)
app.include_router(config_routes.router)

# Resume detection at startup (if previously running)
@app.on_event("startup")
def resume_detection_if_needed():
    auto_resume_detection()
