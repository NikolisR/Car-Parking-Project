import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
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
        pointRadius: 4,
        borderColor: '#4dd0e1',         // light cyan line
        backgroundColor: '#4dd0e1',     // for points
        pointBackgroundColor: '#4dd0e1',
        pointHoverRadius: 6,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: 'rgba(255,255,255,0.9)' }  // legend text
      },
      title: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        titleColor: '#fff',
        bodyColor: '#eee',
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255,255,255,0.8)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },
      y: {
        beginAtZero: true,
        max: 100,
        ticks: { color: 'rgba(255,255,255,0.8)' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }
  };

  return (
    <Row className="g-0">
      <Col md={12}>
        <Card className="h-100 shadow-soft">
          <Card.Header className="bg-primary text-white">
            Occupancy Over Time
          </Card.Header>
          <Card.Body className="p-0" style={{ height: '300px', width: '100%' }}>
            <Line data={data} options={options} />
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
