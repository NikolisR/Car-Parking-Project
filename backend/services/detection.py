import threading
from ..utils.settings import load_config, save_config, PROJECT_ROOT
from ..car_parked_detection_yolo import run_parking_detection
from pathlib import Path

# Shared detection state
detection_thread = None
detection_stop_event = threading.Event()

def auto_resume_detection():
    global detection_thread, detection_stop_event

    config = load_config()
    if config.get("status") != "running":
        return

    print("🔁 Auto-resuming detection from config...")

    detection_stop_event.clear()
    source = config.get("video_source", 0)

    if isinstance(source, str) and not Path(source).is_absolute():
        source = str((PROJECT_ROOT / source).resolve())

    def detection_loop():
        try:
            run_parking_detection(source, detection_stop_event)
        finally:
            config["status"] = "stopped"
            save_config(config)
            print("🛑 Detection thread exited.")

    detection_thread = threading.Thread(target=detection_loop, daemon=True)
    detection_thread.start()
