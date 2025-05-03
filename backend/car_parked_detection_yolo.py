import datetime

import json
import requests

import cv2
import numpy as np

from backend.config import create_parking_model
from backend.db_handshake import connect_to_db, update_parking_status

# initial setup
conn = connect_to_db()
cur = conn.cursor()


# Video capture
cap = cv2.VideoCapture("myVideo3.mp4")
assert cap.isOpened(), "Error reading video file"

# Video writer setup
w, h, fps = (int(cap.get(x)) for x in (cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT, cv2.CAP_PROP_FPS))
video_writer = cv2.VideoWriter("parking_management2.avi", cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))


parkingmanager = create_parking_model()

# Process each frame
while cap.isOpened():
    ret, im0 = cap.read()
    if not ret:
        break

    # Process frame with YOLO
    results = parkingmanager(im0)

    # STORE MY SPOT STATUS IN A DICTIONARY
    spot_status = {}

    # Iterate through the parking regions from JSON
    for i, region in enumerate(parkingmanager.json):
        spot_name = f"Spot_{i+1}"  # Dynamically generate spot names like Spot_1, Spot_2, etc.
        pts_array = np.array(region["points"], dtype=np.int32).reshape((-1, 1, 2))
        occupied = False

        # This does the math to find the center point of my bounding box
        # and checks if there is something in the very center or is
        # intercepting the center
        for box, cls in zip(parkingmanager.boxes, parkingmanager.clss):
            xc, yc = int((box[0] + box[2]) / 2), int((box[1] + box[3]) / 2)
            if cv2.pointPolygonTest(pts_array, (xc, yc), False) >= 0:
                occupied = True
                break


        spot_status[spot_name] = occupied

    # for my spots inside spot_status Items
    for spot, is_occupied in spot_status.items():
        # print(f"{spot}: {'Occupied' if is_occupied else 'Available'}") # THIS IS DEBUG AND IT WORKED

        # This updates the database continuously,
        # so if there is something within this box, it will say there is somthing within that spot
        timestamp = datetime.datetime.now()
        update_parking_status(cur, spot, is_occupied, timestamp)
    conn.commit()

    # try:
    #     requests.post("http://localhost:8000/push-update")
    # except:
    #     pass

    # Write out my file, I beg you
    video_writer.write(results.plot_im)

# When it's all finished, delete everything
cap.release()
video_writer.release()
cur.close()
conn.close()
cv2.destroyAllWindows()