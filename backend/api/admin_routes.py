# Thie amdin router is only viable to admin. This tells the server if you are an admin and what is being added or changed.
# the core purpose is to do all the admin stuff such as seeing if the video feed is running, if they can upload photos, and create/ save bounding boxes

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Body
from pathlib import Path
import aiofiles, json, uuid

import threading

from ..utils.settings import save_config, load_config
from ..car_parked_detection_yolo import run_parking_detection

from pathlib import Path
from ..utils.settings import PROJECT_ROOT

router = APIRouter(
    prefix="/admin",
    tags=["Admin Tools"]
)

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
ADMIN_UPLOAD_DIR = UPLOAD_DIR / "admin"
META_FILE = BASE_DIR / "static" / "current_layout.json"

ADMIN_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Detection thread state

detection_thread = None
detection_stop_event = threading.Event()

@router.post("/start-detection")
def start_detection():
    global detection_thread, detection_stop_event
    if detection_thread and detection_thread.is_alive():
        raise HTTPException(400, "Detection is already running")

    detection_stop_event.clear()
    config = load_config()
    source = config.get("video_source", 0)

 # careful if circular; if so, lift to config file

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

@router.post("/stop-detection")
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

@router.get("/detection-status")
def get_detection_status():
    return {"status": load_config().get("status", "stopped")}

@router.post("/upload-image")
async def upload_admin_image(image: UploadFile = File(...), filename: str = Form(None)):
    ext = image.filename.rsplit('.', 1)[-1]
    name = (filename.strip() if filename else uuid.uuid4().hex)
    safe_name = f"{name}.{ext}"
    dest = ADMIN_UPLOAD_DIR / safe_name
    async with aiofiles.open(dest, 'wb') as out:
        while chunk := await image.read(1024 * 1024):
            await out.write(chunk)
    meta = {"filename": safe_name, "url": f"/uploads/admin/{safe_name}"}
    async with aiofiles.open(META_FILE, 'w', encoding='utf-8') as meta_f:
        await meta_f.write(json.dumps(meta))
    return meta

@router.get("/current-layout-image")
async def current_layout_image():
    if not META_FILE.exists():
        raise HTTPException(404, "No layout image uploaded yet")
    return {"url": json.loads(META_FILE.read_text())["url"]}

@router.post("/save-bounding-boxes")
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
