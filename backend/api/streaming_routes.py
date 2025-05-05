# This does all of my video feed. Anything that has to do with streamign or camera. This will take in live feed and route it back
# It also captures images in which admins will be able to save.

from fastapi import APIRouter, HTTPException, Request, Body
from fastapi.responses import StreamingResponse, JSONResponse
from pathlib import Path
from datetime import datetime
import json, cv2, io, asyncio
import numpy as np

from ..utils.settings import load_config, CONFIG_FILE, save_config, PROJECT_ROOT, ADMIN_UPLOAD_DIR
from ..utils.model import create_parking_model

router = APIRouter(
    prefix="/api",
    tags=["Video Streaming"]
)

@router.get("/live-feed")
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

@router.post("/capture-snapshot")
async def capture_snapshot():
    config = load_config()
    source = config.get("video_source", 0)

    if isinstance(source, str) and source.isdigit():
        source = int(source)
    elif isinstance(source, str) and not Path(source).is_absolute():
        source = str((PROJECT_ROOT / source).resolve())

    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        raise HTTPException(status_code=500, detail="Failed to access camera")

    ret, frame = cap.read()
    cap.release()

    if not ret:
        raise HTTPException(status_code=500, detail="Failed to read frame from camera")

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"snapshot_{timestamp}.jpg"
    filepath = ADMIN_UPLOAD_DIR / filename
    cv2.imwrite(str(filepath), frame)

    return JSONResponse(content={"url": f"/uploads/admin/{filename}"})

@router.post("/test-video")
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
