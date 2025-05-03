import React from 'react';
import { Nav } from 'react-bootstrap';

export default function SideBar() {
  const items = ['Dashboard', 'Map', 'Reports', 'Settings'];

  return (
    <Nav className="flex-column bg-primary text-white vh-100 p-3">
      <h5 className="mb-4">Parking Lot</h5>
      {items.map(i => (
        <Nav.Link key={i} href="#" className="text-white">
          {i}
        </Nav.Link>
      ))}
    </Nav>
  );
}
