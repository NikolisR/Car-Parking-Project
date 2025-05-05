import React, { useState, useEffect } from 'react';
import '../styles/ParkingMap.css';
import { fetchLayoutImage } from '../api/parkingAPI';

const MAP_LAYOUT_ID = 'default';  // match whatever ID you used in AdminParkingMapSetter

export default function ParkingMap({ spotsData, statuses }) {
  const width = 1874;
  const height = 1218;

  const [bgUrl, setBgUrl] = useState(null);
  const [error, setError] = useState(null);

  // 1️⃣ on mount, grab the current layout image URL from backend
  useEffect(() => {
    (async () => {
      try {
        const url = await fetchLayoutImage(MAP_LAYOUT_ID);
        setBgUrl(url);
      } catch (err) {
        console.error(err);
        setError('Failed to load map image');
      }
    })();
  }, []);

  // 2️⃣ merge each spot with its current occupied status
  const spotsWithStatus = spotsData.map(spot => {
    const record = statuses.find(s => s.spot === spot.id);
    return {
      ...spot,
      isTaken: record ? !record.available : false
    };
  });

  if (error) {
    return <div className="text-danger">{error}</div>;
  }

  return (
    <div className="parking-map-container">
      {/* show spinner? ????? */}
      {bgUrl ? (
        <img
          src={bgUrl}
          alt="Parking Lot"
          className="parking-map-image"
        />
      ) : (
        <div className="parking-map-placeholder">Loading map…</div>
      )}

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="parking-map-overlay"
      >
        {spotsWithStatus.map(spot => (
          <circle
            key={spot.id}
            cx={spot.xPct * width}
            cy={spot.yPct * height}
            r={8}
            fill={spot.isTaken ? 'red' : 'green'}
            stroke="#fff"
            strokeWidth={2}
          />
        ))}
      </svg>
    </div>
  );
}
