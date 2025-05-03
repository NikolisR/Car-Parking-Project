import React from 'react';

const ParkingMap = ({ spotsData, statuses, width, height }) => {
  // Merge coordinates with availability status
  const spotsWithStatus = spotsData.map(spot => {
    const record = statuses.find(s => s.spot === spot.id);
    const isTaken = record ? !record.available : false;
    return { ...spot, isTaken };
  });

  return (
    <div style={{ position: 'relative', width, height }}>
      {/* Base parking lot image */}
      <img
        src="/ccMap.png"
        alt="Parking Lot"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />

      {/* SVG overlay for status dots */}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
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
};

export default ParkingMap;
