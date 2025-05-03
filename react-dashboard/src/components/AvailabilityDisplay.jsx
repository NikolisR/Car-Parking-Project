//Where I check my availability
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

export default function AvailableDisplay({ stats }) {
  return (
    <Row className="g-4 mb-4">
      {stats.map(s => (
        <Col sm={6} md={3} key={s.id}>
          <Card className="h-100 shadow-soft">
            <Card.Header className="bg-primary text-white">
              {s.title}
            </Card.Header>
            <Card.Body className="d-flex align-items-center justify-content-center">
              <h2 className="mb-0 text-white">{s.value}</h2>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
