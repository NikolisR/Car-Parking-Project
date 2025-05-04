
from fastapi import FastAPI, Request, HTTPException, UploadFile, File, Form, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List
import asyncio, json, uuid
from pathlib import Path
import aiofiles
import cv2
from .db_handshake import connect_to_db




monitoring_thread = None
monitoring_active = False


app = FastAPI(
    title="Parking API",
    description="Provides parking status, layout management, and upload endpoints",
)

# CORS origins
origins = [
    "http://localhost:5173",
    "https://localhost:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# Directories
BASE_DIR = Path(__file__).parent
UPLOAD_DIR = BASE_DIR / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)

# Put this near the top, after you define BASE_DIR:
ADMIN_UPLOAD_DIR = BASE_DIR / "static" / "uploads" / "admin"
ADMIN_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Metadata for last uploaded layout image
META_FILE = BASE_DIR / "static" / "current_layout.json"

# Path to React data file
REACT_DATA_PATH = BASE_DIR.parent / "react-dashboard" / "src" / "data"
SPOTS_JSON = REACT_DATA_PATH / "spots.json"

templates = Jinja2Templates(directory=BASE_DIR / "templates")

# Data models
class ParkingStatus(BaseModel):
    spot: str
    available: bool
    timestamp: str

class Spot(BaseModel):
    x: float
    y: float
    width: float
    height: float





# --- Endpoints ---

@app.get("/api/parking-spot", response_model=List[ParkingStatus])
def get_parking_spots():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT SpotName, doyouexisthere, givememytime FROM parking_spots")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "spot": r[0],
            "available": r[1],
            "timestamp": r[2].isoformat() if r[2] else None
        }
        for r in rows
    ]

@app.get("/api/bounding-boxes")
def get_bounding_boxes():
    path = BASE_DIR / "static" / "bounding_boxes.json"
    if not path.exists():
        return JSONResponse(content={})
    data = json.loads(path.read_text())
    return JSONResponse(content=data)

@app.get("/api/spots")
async def get_spots():
    """
    Return the current parking spots definitions from React data folder.
    """
    if not SPOTS_JSON.exists():
        return []
    async with aiofiles.open(SPOTS_JSON, 'r', encoding='utf-8') as f:
        content = await f.read()
    return json.loads(content)

@app.post("/api/spots")
async def save_spots(spots: list = Body(...)):
    """
    Overwrite React data spots.json with the provided array of spots.
    Each spot must be { id:str, xPct:float, yPct:float }.
    """
    REACT_DATA_PATH.mkdir(parents=True, exist_ok=True)
    try:
        async with aiofiles.open(SPOTS_JSON, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(spots, indent=2))
    except Exception as e:
        raise HTTPException(500, f"Failed to save spots.json: {e}")
    return {"status": "ok", "count": len(spots)}

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/api/live-feed")
async def live_feed(request: Request):
    async def stream():
        cap = cv2.VideoCapture(0)
        try:
            while True:
                if await request.is_disconnected():
                    break
                ret, frame = cap.read()
                if not ret:
                    await asyncio.sleep(0.1)
                    continue
                success, buf = cv2.imencode('.jpg', frame)
                if not success:
                    await asyncio.sleep(0.1)
                    continue
                jpg = buf.tobytes()
                yield (
                    b'--frame\r\n'
                    b'Content-Type: image/jpeg\r\n\r\n' +
                    jpg +
                    b'\r\n'
                )
                await asyncio.sleep(0)
        finally:
            cap.release()

    return StreamingResponse(
        stream(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.post("/admin/upload-image")
async def upload_image(
    image: UploadFile = File(...),
    filename: str = Form(...)
):
    """
    Receive an image and a custom filename (without extension),
    save it to static/uploads/, update META_FILE,
    and return {"filename", "url"}.
    """
    ext = image.filename.rsplit('.', 1)[-1]
    safe_name = f"{filename}.{ext}"
    dest = UPLOAD_DIR / safe_name

    # Write the file
    async with aiofiles.open(dest, 'wb') as out:
        while chunk := await image.read(1024 * 1024):
            await out.write(chunk)

    # Update metadata
    meta = {"filename": safe_name, "url": f"/uploads/{safe_name}"}
    async with aiofiles.open(META_FILE, 'w', encoding='utf-8') as meta_f:
        await meta_f.write(json.dumps(meta))

    return meta

@app.get("/admin/current-layout-image")
async def current_layout_image():
    """
    Returns the URL of the most recently uploaded layout image.
    """
    if not META_FILE.exists():
        raise HTTPException(404, "No layout image uploaded yet")
    content = META_FILE.read_text()
    meta = json.loads(content)
    return {"url": meta["url"]}

@app.post("/admin/save-bounding-boxes")
async def save_bounding_boxes(payload: dict = Body(...)):
    print(">> Received request to save bounding boxes")
    print(">> Payload content:", payload)

    boxes = payload.get("boxes")
    if not isinstance(boxes, list):
        raise HTTPException(400, "'boxes' must be a list of point arrays")

    out_path = BASE_DIR / "bounding_boxes.json"
    print(">> Will save to:", out_path.resolve())

    out_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        async with aiofiles.open(out_path, 'w', encoding='utf-8') as out_file:
            await out_file.write(json.dumps(boxes, indent=2))
        print(f">> Successfully wrote {len(boxes)} boxes")
    except Exception as e:
        print(">> ERROR saving file:", e)
        raise HTTPException(500, f"Failed to save JSON file: {e}")

    return {"status": "ok", "saved": len(boxes)}


@app.post("/admin/upload-image")
async def upload_image(
    image: UploadFile = File(...),
    filename: str = Form(None),
):
    """
    Receive an image (and optional custom filename), save it under
    backend/static/uploads/admin/, and return its URL.
    """
    # derive final name
    ext = image.filename.rsplit('.', 1)[-1]
    # if user supplied a “filename” form-field, use it, else random UUID
    name = (filename.strip() if filename else uuid.uuid4().hex)
    safe_name = f"{name}.{ext}"
    dest = ADMIN_UPLOAD_DIR / safe_name

    # stream it to disk
    async with aiofiles.open(dest, 'wb') as out:
        while chunk := await image.read(1024 * 1024):
            await out.write(chunk)

    return {
        "filename": safe_name,
        "url": f"/uploads/admin/{safe_name}"
    }

