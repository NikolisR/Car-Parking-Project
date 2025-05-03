from fastapi import FastAPI, Request, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse
from pathlib import Path
import json
from .db_handshake import connect_to_db
from pydantic import BaseModel
from typing import List
import asyncio

app = FastAPI()

origins = [
    "http://localhost:5173",  # Vite dev server
]

# ✅ Add CORS middleware
app.add_middleware(
    CORSMiddleware, # type: ignore
    allow_origins=origins,              # Your frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# For template rendering (optional if not using dashboard.html anymore)
templates = Jinja2Templates(directory=Path(__file__).parent / "templates")

# WebSocket connections
clients = []

class ParkingStatus(BaseModel):
    spot: str
    available: bool
    timestamp: str


@app.get("/api/parking-spot", response_model=List[ParkingStatus])
def get_parking_spots():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT SpotName, doyouexisthere, givememytime FROM parking_spots")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"spot": row[0],
         "available": row[1],
         "timestamp": row[2].isoformat() if rows[2] else None
         }
        for row in rows
    ]


@app.get("/api/bounding-boxes")
def get_bounding_boxes():
    json_path = Path(__file__).parent / "bounding_boxes.json"
    with open(json_path, "r") as f:
        data = json.load(f)
    return JSONResponse(content=data)


@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})
