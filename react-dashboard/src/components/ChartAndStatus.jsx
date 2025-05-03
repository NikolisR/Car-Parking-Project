import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import OccupancyChart from './OccupancyChart';
import CheckStatus    from './CheckStatus';

export default function ChartAndStatus({ chartData, statuses }) {
  return (
    <Row className="g-4">
      <Col md={6}>
        <Card className="h-100 shadow-soft">
          <Card.Header className="bg-primary text-white">
            Occupancy Over Time
          </Card.Header>
          <Card.Body className="p-4">
            <OccupancyChart dataPoints={chartData} />
          </Card.Body>
        </Card>
      </Col>
      <Col md={6}>
        <CheckStatus statuses={statuses} />
      </Col>
    </Row>
  );
}
