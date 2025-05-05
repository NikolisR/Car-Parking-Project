import datetime
import cv2
import numpy as np
from threading import Event

from .utils.model import create_parking_model
from .utils.db_handshake import connect_to_db, update_parking_status

from pathlib import Path

def run_parking_detection(source=0, stop_event: Event = None):
    # Convert string webcam index like "0" → 0
    if isinstance(source, str) and source.isdigit():
        source = int(source)
    # If it's a file path and not a digit or RTSP, check if it exists
    elif isinstance(source, str) and not source.startswith("rtsp"):
        if not Path(source).exists():
            print(f"❌ Video file does not exist: {source}")
            return False

    print(f"🎥 Opening video source: {source}")
    cap = cv2.VideoCapture(source)
    if not cap.isOpened():
        print(f"❌ Unable to open video source: {source}")
        return False



    parkingmanager = create_parking_model()
    conn = connect_to_db()
    cur = conn.cursor()

    try:
        while cap.isOpened() and not stop_event.is_set():
            ret, im0 = cap.read()
            if not ret:
                print("⚠️ Failed to read frame from source")
                break

            results = parkingmanager(im0)
            spot_status = {}

            for i, region in enumerate(parkingmanager.json):
                spot_name = f"Spot_{i+1}"
                pts_array = np.array(region["points"], dtype=np.int32).reshape((-1, 1, 2))
                occupied = False

                for box, cls in zip(parkingmanager.boxes, parkingmanager.clss):
                    xc, yc = int((box[0] + box[2]) / 2), int((box[1] + box[3]) / 2)
                    if cv2.pointPolygonTest(pts_array, (xc, yc), False) >= 0:
                        occupied = True
                        break

                spot_status[spot_name] = occupied

            for spot, is_occupied in spot_status.items():
                update_parking_status(cur, spot, is_occupied, datetime.datetime.now())
            conn.commit()
    finally:
        cap.release()
        conn.close()
        print("🛑 Detection stopped")
        return True  # success


