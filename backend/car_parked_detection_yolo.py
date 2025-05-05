# import datetime
#
# import json
# import requests
#
# import cv2
# import numpy as np
#
# from backend.config import create_parking_model
# from backend.db_handshake import connect_to_db, update_parking_status
#
# # initial setup
# conn = connect_to_db()
# cur = conn.cursor()
#
# # ⬇️ WIPE OUT EVERYTHING before you upsert your two boxes:
# cur.execute("DELETE FROM parking_spots;")
# conn.commit()
#
# # Video capture
# # cap = cv2.VideoCapture("myVideo3.mp4")
# cap = cv2.VideoCapture(0)
# assert cap.isOpened(), "Error reading video file"
#
# # Video writer setup
# w, h, fps = (int(cap.get(x)) for x in (cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT, cv2.CAP_PROP_FPS))
# video_writer = cv2.VideoWriter("parking_management2.avi", cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))
#
#
# parkingmanager = create_parking_model()
#
# # Process each frame
# while cap.isOpened():
#     ret, im0 = cap.read()
#     if not ret:
#         break
#
#     # Process frame with YOLO
#     results = parkingmanager(im0)
#
#     # STORE MY SPOT STATUS IN A DICTIONARY
#     spot_status = {}
#
#     # Iterate through the parking regions from JSON
#     for i, region in enumerate(parkingmanager.json):
#         spot_name = f"Spot_{i+1}"  # Dynamically generate spot names like Spot_1, Spot_2, etc.
#         pts_array = np.array(region["points"], dtype=np.int32).reshape((-1, 1, 2))
#         occupied = False
#
#         # This does the math to find the center point of my bounding box
#         # and checks if there is something in the very center or is
#         # intercepting the center
#         for box, cls in zip(parkingmanager.boxes, parkingmanager.clss):
#             xc, yc = int((box[0] + box[2]) / 2), int((box[1] + box[3]) / 2)
#             if cv2.pointPolygonTest(pts_array, (xc, yc), False) >= 0:
#                 occupied = True
#                 break
#
#
#         spot_status[spot_name] = occupied
#
#     # for my spots inside spot_status Items
#     for spot, is_occupied in spot_status.items():
#         # print(f"{spot}: {'Occupied' if is_occupied else 'Available'}") # THIS IS DEBUG AND IT WORKED
#
#         # This updates the database continuously,
#         # so if there is something within this box, it will say there is somthing within that spot
#         timestamp = datetime.datetime.now()
#         update_parking_status(cur, spot, is_occupied, timestamp)
#     conn.commit()
#
#
#     # Write out my file, I beg you
#     video_writer.write(results.plot_im)
#
# # When it's all finished, delete everything
# cap.release()
# video_writer.release()
# cur.close()
# conn.close()
# cv2.destroyAllWindows()


import datetime
import json
import requests
import cv2
import numpy as np
from threading import Event

from backend.config import create_parking_model
from backend.db_handshake import connect_to_db, update_parking_status

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

    ...


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


