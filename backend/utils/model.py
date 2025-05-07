from ultralytics import solutions
from pathlib import Path

BOX_FILE = Path(__file__).resolve().parents[1] / "bounding_boxes.json"

def create_parking_model(model="yolo11n.pt", json_file=str(BOX_FILE), verbose=False, show=False):
    return solutions.ParkingManagement(
        model=model,
        json_file=json_file,
        verbose=verbose,
        show=show
    )
