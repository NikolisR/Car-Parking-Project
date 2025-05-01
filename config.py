from dotenv import load_dotenv
import os
from ultralytics import solutions

load_dotenv()

DATABASE_CONFIG= {
        "host": os.getenv("DB_HOST"),
        "port": os.getenv("DB_PORT"),
        "database": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD")
}

def create_parking_model(model="yolo11n.pt", json_file="bounding_boxes.json",verbose=False, show=True):
    return solutions.ParkingManagement(
        model=model,  # path to model file
        json_file=json_file,  # path to parking annotations file
        verbose=verbose,
        show=show
    )

