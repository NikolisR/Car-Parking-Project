import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';

export default function CheckStatus({ statuses }) {
  return (
    <Card className="shadow-soft mb-4">
      <Card.Header className="bg-primary text-white">
        <h3 className="mb-0">
          📋 Parking Spot Status
        </h3>
      </Card.Header>
      <Card.Body className="p-0">
        <Table hover responsive className="mb-0">
          <thead className="table-dark text">
            <tr>
              <th>Spot</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(s => (
              <tr key={s.spot}>
                <td>{s.spot}</td>
                <td>
                  <Badge bg={s.available ? 'success' : 'danger'}>
                    {s.available ? '✅ Available' : '❌ Occupied'}
                  </Badge>
                </td>
                <td className="text-white">
                  {new Date(s.timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
