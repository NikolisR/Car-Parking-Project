# backend/api/config_routes.py

from fastapi import APIRouter
from pydantic import BaseModel

from ..utils.settings import load_config, save_config

router = APIRouter(
    prefix="/admin",
    tags=["Configuration"]
)

class VideoSourcePayload(BaseModel):
    source: str

@router.post("/set-video-source")
def set_video_source(payload: VideoSourcePayload):
    config = load_config()
    config["video_source"] = payload.source
    save_config(config)
    return {"status": "video source updated", "source": payload.source}

@router.get("/get-video-source")
def get_video_source():
    return {"source": load_config().get("video_source", 0)}
