import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';

export default function TopBar() {
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="md"
      className="mb-4 px-3 rounded shadow-soft"
    >
      <Navbar.Brand>Dashboard</Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse className="justify-content-end">
        <Nav.Item className="text-white">👤 Hello, User</Nav.Item>
      </Navbar.Collapse>
    </Navbar>
  );
}
