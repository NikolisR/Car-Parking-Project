// CheckStatus.jsx
import React from 'react';

const CheckStatus = ({ statuses }) => (
  <div className="bg-cardDark p-6 rounded-xl shadow-lg">
    <h3 className="text-white text-xl font-semibold flex items-center gap-2 mb-4">
      <span>📋</span> Parking Spot Status
    </h3>
    <table className="w-full text-left text-white table-auto">
      <thead className="bg-primaryDark text-gray-300">
        <tr>
          <th className="px-6 py-3">Spot</th>
          <th className="px-6 py-3">Status</th>
          <th className="px-6 py-3">Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((s) => (
          <tr key={s.spot} className="border-b border-gray-700 hover:bg-gray-800 transition">
            <td className="px-6 py-4">{s.spot}</td>
            <td className={`px-6 py-4 font-medium ${s.available ? 'text-greenStatus' : 'text-redStatus'}`}>
              {s.available ? '✅ Available' : '❌ Occupied'}
            </td>
            <td className="px-6 py-4 text-gray-400">{new Date(s.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CheckStatus;
