from dotenv import load_dotenv
import os
from ultralytics import solutions
from pathlib import Path

load_dotenv()

DATABASE_CONFIG = {
    "host": os.getenv("DB_HOST"),
    "port": 5432,
    "database": os.getenv("DB_NAME"),
    "user": os.getenv("DB_USER"),
    "password": os.getenv("DB_PASSWORD")
}

# Define absolute path to bounding_boxes.json
BASE_DIR = Path(__file__).parent
BOX_FILE = BASE_DIR / "bounding_boxes.json"

def create_parking_model(model="yolo11n.pt", json_file=str(BOX_FILE), verbose=False, show=False):
    return solutions.ParkingManagement(
        model=model,
        json_file=json_file,
        verbose=verbose,
        show=show
    )
