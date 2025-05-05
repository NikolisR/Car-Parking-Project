from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import asyncio, json, uuid, threading, io
from pathlib import Path
import aiofiles
import cv2
import numpy as np

from .config import create_parking_model
from .db_handshake import connect_to_db
from backend.car_parked_detection_yolo import run_parking_detection

app = FastAPI(title="Parking API", description="Provides parking status, layout management, and upload endpoints")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories
BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ADMIN_UPLOAD_DIR = UPLOAD_DIR / "admin"
ADMIN_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
META_FILE = BASE_DIR / "static" / "current_layout.json"
REACT_DATA_PATH = PROJECT_ROOT / "react-dashboard" / "src" / "data"
SPOTS_JSON = REACT_DATA_PATH / "spots.json"
CONFIG_FILE = BASE_DIR / "detection_config.json"
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

# Templates
templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Config management
def load_config():
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text())
        except Exception:
            pass
    return {"status": "stopped", "video_source": 0, "model": "yolo11n.pt"}

def save_config(config):
    CONFIG_FILE.write_text(json.dumps(config, indent=2))

# Models
class ParkingStatus(BaseModel):
    spot: str
    available: bool
    timestamp: str

class Spot(BaseModel):
    x: float
    y: float
    width: float
    height: float

class VideoSourcePayload(BaseModel):
    source: str

# Detection state
detection_thread = None
detection_stop_event = threading.Event()

# --- API routes ---

@app.get("/api/parking-spot", response_model=List[ParkingStatus])
def get_parking_spots():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT SpotName, doyouexisthere, givememytime FROM parking_spots")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"spot": r[0], "available": r[1], "timestamp": r[2].isoformat() if r[2] else None}
        for r in rows
    ]

@app.get("/api/bounding-boxes")
def get_bounding_boxes():
    path = BASE_DIR / "static" / "bounding_boxes.json"
    if not path.exists():
        return JSONResponse(content={})
    return JSONResponse(content=json.loads(path.read_text()))

@app.get("/api/spots")
async def get_spots():
    if not SPOTS_JSON.exists():
        return []
    async with aiofiles.open(SPOTS_JSON, 'r', encoding='utf-8') as f:
        return json.loads(await f.read())

@app.post("/api/spots")
async def save_spots(spots: list = Body(...)):
    REACT_DATA_PATH.mkdir(parents=True, exist_ok=True)
    try:
        async with aiofiles.open(SPOTS_JSON, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(spots, indent=2))
    except Exception as e:
        raise HTTPException(500, f"Failed to save spots.json: {e}")
    return {"status": "ok", "count": len(spots)}

@app.get("/")
def home(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/api/live-feed")
async def live_feed(request: Request):
    config = load_config()
    source = config.get("video_source", 0)
    try:
        if isinstance(source, str) and source.isdigit():
            source = int(source)
        elif not Path(source).is_absolute():
            source = str((PROJECT_ROOT / source).resolve())
    except Exception as e:
        raise HTTPException(400, f"Invalid video source format: {e}")

    async def stream():
        cap = cv2.VideoCapture(source)
        try:
            parkingmanager = create_parking_model()
            while True:
                if await request.is_disconnected():
                    break

                ret, frame = cap.read()
                if not ret:
                    await asyncio.sleep(0.1)
                    continue

                results = parkingmanager(frame)
                success, buf = cv2.imencode(".jpg", results.plot_im)
                if not success:
                    await asyncio.sleep(0.1)
                    continue

                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + buf.tobytes() + b"\r\n"
                )
                await asyncio.sleep(0)
        finally:
            cap.release()

    return StreamingResponse(stream(), media_type="multipart/x-mixed-replace; boundary=frame")



@app.post("/admin/upload-image")
async def upload_image(image: UploadFile = File(...), filename: str = Form(...)):
    ext = image.filename.rsplit('.', 1)[-1]
    safe_name = f"{filename}.{ext}"
    dest = UPLOAD_DIR / safe_name
    async with aiofiles.open(dest, 'wb') as out:
        while chunk := await image.read(1024 * 1024):
            await out.write(chunk)
    meta = {"filename": safe_name, "url": f"/uploads/{safe_name}"}
    async with aiofiles.open(META_FILE, 'w', encoding='utf-8') as meta_f:
        await meta_f.write(json.dumps(meta))
    return meta

@app.get("/admin/current-layout-image")
async def current_layout_image():
    if not META_FILE.exists():
        raise HTTPException(404, "No layout image uploaded yet")
    return {"url": json.loads(META_FILE.read_text())["url"]}

@app.post("/admin/save-bounding-boxes")
async def save_bounding_boxes(payload: dict = Body(...)):
    boxes = payload.get("boxes")
    if not isinstance(boxes, list):
        raise HTTPException(400, "'boxes' must be a list of point arrays")
    out_path = BASE_DIR / "bounding_boxes.json"
    try:
        async with aiofiles.open(out_path, 'w', encoding='utf-8') as out_file:
            await out_file.write(json.dumps(boxes, indent=2))
    except Exception as e:
        raise HTTPException(500, f"Failed to save JSON file: {e}")
    return {"status": "ok", "saved": len(boxes)}

@app.post("/admin/upload-image")
async def upload_admin_image(image: UploadFile = File(...), filename: str = Form(None)):
    ext = image.filename.rsplit('.', 1)[-1]
    name = (filename.strip() if filename else uuid.uuid4().hex)
    safe_name = f"{name}.{ext}"
    dest = ADMIN_UPLOAD_DIR / safe_name
    async with aiofiles.open(dest, 'wb') as out:
        while chunk := await image.read(1024 * 1024):
            await out.write(chunk)
    return {"filename": safe_name, "url": f"/uploads/admin/{safe_name}"}

@app.post("/admin/start-detection")
def start_detection():
    global detection_thread, detection_stop_event
    if detection_thread and detection_thread.is_alive():
        raise HTTPException(400, "Detection is already running")

    detection_stop_event.clear()
    config = load_config()
    source = config.get("video_source", 0)

    try:
        if isinstance(source, str) and source.isdigit():
            source = int(source)
        elif not Path(source).is_absolute():
            resolved_path = (PROJECT_ROOT / source).resolve()
            if not resolved_path.exists():
                raise HTTPException(400, f"Video source file does not exist: {resolved_path}")
            source = str(resolved_path)
    except Exception as e:
        raise HTTPException(400, f"Invalid video source format: {e}")

    def detection_loop():
        config["status"] = "running"
        save_config(config)
        try:
            run_parking_detection(source, detection_stop_event)
        finally:
            config["status"] = "stopped"
            save_config(config)
            print("🛑 Detection finished or was stopped.")

    detection_thread = threading.Thread(target=detection_loop, daemon=True)
    detection_thread.start()
    return {"status": "detection starting"}

@app.post("/admin/stop-detection")
def stop_detection():
    global detection_thread, detection_stop_event
    if not detection_thread or not detection_thread.is_alive():
        raise HTTPException(400, "Detection is not running")
    detection_stop_event.set()
    detection_thread.join(timeout=5)
    config = load_config()
    config["status"] = "stopped"
    save_config(config)
    return {"status": "detection stopped"}

@app.get("/admin/detection-status")
def get_detection_status():
    return {"status": load_config().get("status", "stopped")}

@app.on_event("startup")
def resume_detection_if_needed():
    global detection_thread, detection_stop_event
    config = load_config()
    if config.get("status") == "running":
        print("🔁 Auto-resuming detection from config...")
        detection_stop_event.clear()
        source = config.get("video_source", 0)
        if isinstance(source, str) and not Path(source).is_absolute():
            source = str((PROJECT_ROOT / source).resolve())
        detection_thread = threading.Thread(
            target=lambda: run_parking_detection(source, detection_stop_event),
            daemon=True
        )
        detection_thread.start()

@app.post("/admin/set-video-source")
def set_video_source(payload: VideoSourcePayload):
    config = load_config()
    config["video_source"] = payload.source
    save_config(config)
    return {"status": "video source updated", "source": payload.source}

@app.get("/admin/get-video-source")
def get_video_source():
    return {"source": load_config().get("video_source", 0)}

@app.post("/api/test-video")
async def test_video_preview(payload: dict = Body(...)):
    source = payload.get("source", "0")
    try:
        if isinstance(source, str) and source.isdigit():
            source = int(source)
        elif not Path(source).is_absolute():
            resolved_path = (PROJECT_ROOT / source).resolve()
            if not resolved_path.exists():
                raise HTTPException(400, f"Video source '{resolved_path}' could not be opened")
            source = str(resolved_path)
    except Exception as e:
        raise HTTPException(400, f"Invalid source format: {e}")

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise HTTPException(400, f"Video source '{source}' could not be opened")

    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise HTTPException(500, "Failed to read from video source")

    success, buffer = cv2.imencode(".jpg", frame)
    if not success:
        raise HTTPException(500, "Failed to encode video frame")

    return StreamingResponse(io.BytesIO(buffer.tobytes()), media_type="image/jpeg")
