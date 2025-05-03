import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function OccupancyChart({ dataPoints }) {
  const labels = dataPoints.map(dp => dp.time);
  const values = dataPoints.map(dp => dp.occupiedPercentage);

  const data = {
    labels,
    datasets: [
      {
        label: 'Occupied %',
        data: values,
        fill: false,
        tension: 0.3,
        pointRadius: 3,
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true, max: 100 }
    }
  };

  return <Line data={data} options={options} />;
}
