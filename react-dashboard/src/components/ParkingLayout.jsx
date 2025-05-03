// ParkingLayout.jsx
import React, { useState, useEffect } from 'react';
import { fetchBoundingBoxes } from '../api/parkingAPI';

const VIEWBOX_WIDTH = 1024;
const VIEWBOX_HEIGHT = 768;

const ParkingLayout = ({ statuses }) => {
  const [boxes, setBoxes] = useState([]);

  useEffect(() => {
    fetchBoundingBoxes().then(setBoxes);
  }, []);

  return (
    <div className="bg-cardDark p-6 rounded-xl shadow-lg">
      <h3 className="text-white text-xl font-semibold mb-4">🅿️ Parking Map</h3>

      {/* Wrap the SVG and optional blueprint image in a relative container */}
      <div className="relative w-full overflow-hidden rounded-md">
        {/* Background blueprint image */}
        <img
          src="img_0.jpg"
          alt="Parking lot blueprint"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Overlay SVG on top */}
        <svg
          viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
          className="relative w-full h-auto"
          preserveAspectRatio="xMidYMid meet"
        >
          {boxes.map((box, i) => {
            const spotName = `Spot_${i + 1}`;
            const status = statuses.find((s) => s.spot === spotName);
            const fillColor = status?.available
              ? '#10B981'  // greenStatus
              : '#EF4444'; // redStatus

            return (
              <polygon
                key={spotName}
                points={box.points.map(p => p.join(',')).join(' ')}
                fill={fillColor}
                stroke="#374151"
                strokeWidth="2"
                className="transition-colors duration-200"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};

export default ParkingLayout;
