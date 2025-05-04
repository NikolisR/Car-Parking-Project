import React from 'react';
import { Card, Table } from 'react-bootstrap';
import './CheckStatus.css';

export default function CheckStatus({ statuses }) {
  return (
    <Card className="shadow-soft">
      <Card.Header className="bg-primary text-white">
        <h6 className="mb-0">📋 Parking Spot Status</h6>
      </Card.Header>
      <Card.Body className="p-0 " style={{ maxHeight: 'auto', overflowY: 'auto' }}>
        <Table  hover responsive className="mb-0 table-dark">
          <thead>
            <tr>
              <th>Spot</th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(s => (
              <tr key={s.spot} className="status-row">
                <td className="text-white align-middle">{s.spot}</td>
                <td className="align-middle">
                  <div className="d-flex align-items-center">
                    <span
                      className={`status-dot ${s.available ? 'available' : 'occupied'}`}
                    ></span>
                    <span className="ms-2 text-white">
                      {s.available ? 'Available' : 'Occupied'}
                    </span>
                  </div>
                </td>
                <td className="text-white align-middle">
                  {new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
