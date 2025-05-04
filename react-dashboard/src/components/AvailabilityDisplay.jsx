import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { List, CheckCircle, XCircle } from 'lucide-react';

export default function AvailabilityDisplay({ stats }) {
  const icons = {
    'Total Spots': <List size={24} className="mb-1 text-white" />,  // smaller icons
    'Available':   <CheckCircle size={24} className="mb-1" style={{ color: 'rgba(40, 167, 69, 0.6)' }} />,
    'Occupied':    <XCircle size={24} className="mb-1" style={{ color: 'rgba(220, 53, 69, 0.6)' }} />,
  };

  const backgrounds = {
    'Total Spots': 'rgba(13, 110, 253, 0.1)',
    'Available':   'rgba(40, 167, 69, 0.1)',
    'Occupied':    'rgba(220, 53, 69, 0.1)',
  };

  return (
    <Row className="g-3 mb-3 justify-content-center flex-nowrap overflow-auto">
      {stats.map(stat => (
        <Col key={stat.id} xs={4}>
          <Card
            style={{
              backgroundColor: backgrounds[stat.title],
              border: 'none',
            }}
            className="shadow-soft h-100 text-center p-2"
          >
            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
              {icons[stat.title]}
              <Card.Title className="fs-6 text-uppercase text-white">
                {stat.title}
              </Card.Title>
              <Card.Text className="fs-4 fw-bold text-white">
                {stat.value}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}