import React from 'react';

const CheckStatus = ({ statuses }) => (
  <div className="bg-cardDark p-6 rounded-2xl shadow-lg">
    <h3 className="text-white text-xl font-semibold flex items-center gap-2 mb-4">
      📋 Parking Spot Status
    </h3>
    <table className="w-full text-left text-white table-auto">
      <thead className="bg-primaryDark text-gray-300">
        <tr>
          <th className="px-4 py-2">Spot</th>
          <th className="px-4 py-2">Status</th>
          <th className="px-4 py-2">Last Updated</th>
        </tr>
      </thead>
      <tbody>
        {statuses.map((s) => (
          <tr key={s.spot} className="border-b border-gray-700 hover:bg-gray-800 transition">
            <td className="px-4 py-2">{s.spot}</td>
            <td className={`px-4 py-2 font-medium ${s.available ? 'text-greenStatus' : 'text-redStatus'}`}>
              {s.available ? '✅ Available' : '❌ Occupied'}
            </td>
            <td className="px-4 py-2 text-gray-400">{new Date(s.timestamp).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default CheckStatus;