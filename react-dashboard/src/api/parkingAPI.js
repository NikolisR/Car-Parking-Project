export async function fetchParkingSpot(){
    const response = await fetch("http://localhost:8000/api/parking-spot");
    return response.json();
}

// let boundingBox = null;
//
// export async function fetchBoundingBoxes(){
//     if(!boundingBox){
//         const response = await fetch("http://localhost:8000/api/bounding-boxes");
//         boundingBox = await response.json();
//     }
//     return boundingBox;
// }
