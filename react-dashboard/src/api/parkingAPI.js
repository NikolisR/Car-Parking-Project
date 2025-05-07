// This is the main api caller for front end.
const API_BASE = import.meta.env.VITE_API_BASE || 'https://localhost:8000';



/**
 * Upload a layout image with custom filename.
 * @param {FormData} formData – should include fields 'image' (File) and 'filename' (string)
 * @returns {Promise<{ filename: string, url: string }>}
 */
export async function uploadLayoutImage(formData) {
  const res = await fetch(`${API_BASE}/admin/upload-image`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed: ${text}`);
  }
  return res.json();
}

/**
 * Fetch the URL of the most recently uploaded layout image.
 * Returns a string: the full URL to the image.
 */
async function _fetchCurrentLayoutImage() {
  const res = await fetch(`${API_BASE}/admin/current-layout-image`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch layout image: ${text}`);
  }
  const { url } = await res.json();
  return `${API_BASE}${url}`;
}

export const fetchLayoutImage = _fetchCurrentLayoutImage;

/**
 * Fetch saved bounding boxes from backend.
 */
export async function fetchBoundingBoxes() {
  const response = await fetch(`${API_BASE}/api/bounding-boxes`);
  if (!response.ok) throw new Error('Failed to fetch bounding boxes');
  return response.json();
}

/**
 * Save bounding boxes to backend.
 * @param {Array<{points: number[][]}>} boxes
 */
export async function saveBoundingBoxes(boxes) {
  const response = await fetch(`${API_BASE}/admin/save-bounding-boxes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ boxes }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Save bounding boxes failed: ${err}`);
  }
  return response.json();
}


/**
 * Fetch current parking spot status.
 */
export async function fetchParkingSpot() {
  const response = await fetch(`${API_BASE}/api/parking-spot`);
  if (!response.ok) throw new Error('Failed to fetch parking spots');
  return response.json();
}

/**
 * Fetch user-defined parking map spots from backend.
 */
export async function fetchSpots() {
  const response = await fetch(`${API_BASE}/api/spots/definitions`);
  if (!response.ok) throw new Error('Failed to fetch spots.json');
  return response.json();
}

/**
 * Save user-defined parking map spots back to backend.
 * @param {Array<{id:string, xPct:number, yPct:number}>} spots
 */
export async function saveSpotsData(spots) {
  const response = await fetch(`${API_BASE}/api/spots/definitions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(spots),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Save spots.json failed: ${err}`);
  }
  return response.json();
}


/**
 * MJPEG video stream URL for live camera view.
 */
export const LIVE_FEED_URL = `${API_BASE}/api/live-feed`;
