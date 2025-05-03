// StatsCards.jsx
import React from 'react';

const StatsCards = ({ statuses }) => {
  const total     = statuses.length;
  const occupied  = statuses.filter(s => !s.available).length;
  const available = statuses.filter(s => s.available).length;

  const card = (label, value, color) => (
    <div className="bg-cardDark p-6 rounded-xl shadow flex-1 text-center">
      <p className="text-sm text-accent uppercase">{label}</p>
      <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
    </div>
  );

  return (
    <div className="flex gap-6 mb-6">
      {card('Total',     total,     'text-white')}
      {card('Occupied',  occupied,  'text-redStatus')}
      {card('Available', available, 'text-greenStatus')}
    </div>
  );
};

export default StatsCards;
