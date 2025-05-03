// ParkingLayout.jsx
import React from 'react';

const ParkingLayout = ({ statuses }) => {
  const renderColumns = (start, end) => (
    statuses.slice(start, end).map((spot) => (
      <div key={spot.spot} className="flex flex-col items-center gap-2">
        <div className="bg-cardDark p-2 rounded-lg w-16 text-center text-white font-medium">
          {spot.spot.replace('_', '')}
        </div>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${spot.available ? 'bg-greenStatus' : 'bg-redStatus'}`}>
          {spot.available ? '✅' : '❌'}
        </div>
      </div>
    ))
  );

  return (
    <div className="bg-cardDark p-6 rounded-xl shadow-lg mb-6">
      <h3 className="text-white text-xl font-semibold mb-4">🅿️ Parking Map</h3>
      <div className="border border-gray-700 rounded-xl p-4 relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white font-medium">Entry</span>
        <div className="bg-gray-800 p-4 rounded-lg flex justify-between">
          {renderColumns(0, Math.ceil(statuses.length / 2))}
          {renderColumns(Math.ceil(statuses.length / 2), statuses.length)}
        </div>
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white font-medium">Entry</span>
      </div>
    </div>
  );
};

export default ParkingLayout;
