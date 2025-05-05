# the role of the spots_router is to route out the parking spots. It is a callable router calling back the to database and
# and updating and saving spots whenever bounding boxes need to be changed.
# Basically this to make the parking solutions router.

from fastapi import APIRouter, Body, HTTPException
from pydantic import BaseModel
from typing import List
from pathlib import Path
import aiofiles, json

from backend.utils.db_handshake import connect_to_db

# Adjust path to React project's data directory
REACT_DATA_PATH = Path(__file__).resolve().parents[2] / "react-dashboard" / "src" / "data"
SPOTS_JSON = REACT_DATA_PATH / "spots.json"

router = APIRouter(
    prefix="/api",
    tags=["Parking Spots"]
)

class ParkingStatus(BaseModel):
    spot: str
    available: bool
    timestamp: str



# connect and grab my parking status and see what's taken
@router.get("/parking-spot", response_model=List[ParkingStatus])
def get_parking_spots():
    conn = connect_to_db()
    cur = conn.cursor()
    cur.execute("SELECT SpotName, doyouexisthere, givememytime FROM parking_spots")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"spot": r[0], "available": r[1], "timestamp": r[2].isoformat() if r[2] else None}
        for r in rows
    ]

@router.get("/spots/definitions")
async def get_spot_definitions():
    if not SPOTS_JSON.exists():
        return []
    async with aiofiles.open(SPOTS_JSON, 'r', encoding='utf-8') as f:
        return json.loads(await f.read())



# this saves parkig post definitions from my admin UI in a local JSon file
@router.post("/spots/definitions")
async def save_spot_definitions(spots: list = Body(...)):
    REACT_DATA_PATH.mkdir(parents=True, exist_ok=True)
    try:
        async with aiofiles.open(SPOTS_JSON, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(spots, indent=2))
    except Exception as e:
        raise HTTPException(500, f"Failed to save spots.json: {e}")
    return {"status": "ok", "count": len(spots)}
