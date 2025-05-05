# this holds my basic configurations and are callable for my routes to call back to

import json
from pathlib import Path

# Shared paths
BASE_DIR = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BASE_DIR.parent
STATIC_DIR = BASE_DIR / "static"
UPLOAD_DIR = STATIC_DIR / "uploads"
ADMIN_UPLOAD_DIR = UPLOAD_DIR / "admin"
CONFIG_FILE = BASE_DIR / "detection_config.json"

# Ensure directories exist
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
ADMIN_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

def load_config():
    if CONFIG_FILE.exists():
        try:
            return json.loads(CONFIG_FILE.read_text())
        except Exception:
            pass
    return {"status": "stopped", "video_source": 0, "model": "yolo11n.pt"}

def save_config(config):
    CONFIG_FILE.write_text(json.dumps(config, indent=2))
