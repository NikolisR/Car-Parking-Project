import cv2
from ultralytics import solutions, YOLO
import psycopg2
import datetime
import numpy as np
from dotenv import load_dotenv
import os

load_dotenv()


# Database connection setup
try:
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
    )
    cursor = conn.cursor()
except psycopg2.Error as e:
    print(f"Error connecting to PostgreSQL database: {e}")
    exit()

# Video capture
cap = cv2.VideoCapture("myVideo3.mp4")
assert cap.isOpened(), "Error reading video file"

# Video writer setup
w, h, fps = (int(cap.get(x)) for x in (cv2.CAP_PROP_FRAME_WIDTH, cv2.CAP_PROP_FRAME_HEIGHT, cv2.CAP_PROP_FPS))
video_writer = cv2.VideoWriter("parking_management2.avi", cv2.VideoWriter_fourcc(*"mp4v"), fps, (w, h))

# My Parking Managment stuff. Lets make em
parkingmanager = solutions.ParkingManagement(
    model="yolo11n.pt",  # path to model file
    json_file="bounding_boxes.json",  # path to parking annotations file
    verbose=False,
    show=True
)

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

        # IS THERE ANYTHING INSIDE THE BOX????
        for box, cls in zip(parkingmanager.boxes, parkingmanager.clss):
            xc, yc = int((box[0] + box[2]) / 2), int((box[1] + box[3]) / 2)
            if cv2.pointPolygonTest(pts_array, (xc, yc), False) >= 0:
                occupied = True
                break


        spot_status[spot_name] = occupied

    # for my spots inside spot_status Items
    for spot, is_occupied in spot_status.items():
        # print(f"{spot}: {'Occupied' if is_occupied else 'Available'}") # THIS IS DEBUG AND IT WORKED

        # update it please I'll die
        timestamp = datetime.datetime.now()
        cursor.execute("""
            INSERT INTO parking_spots (SpotName, doyouexisthere, givememytime)
            VALUES (%s, %s, %s)
            ON CONFLICT (SpotName)
            DO UPDATE SET doyouexisthere = EXCLUDED.doyouexisthere, givememytime = EXCLUDED.givememytime;
        """, (spot, not is_occupied, timestamp))
        conn.commit()

    # Write out my file I beg you
    video_writer.write(results.plot_im)

# Its finally over
cap.release()
video_writer.release()
cursor.close()
conn.close()
cv2.destroyAllWindows()