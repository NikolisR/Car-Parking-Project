import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { CircleParking, User, Menu } from 'lucide-react';
import {useAuth0} from "@auth0/auth0-react";

export default function TopBar({ toggleSidebar }) {
  const {user, isAuthenticated, isLoading, logout} = useAuth0();
  const displayName = user?.given_name || user?.email || 'there';



  return (
    <Navbar
      bg="secondary"
      variant="dark"
      className="border-info"
    >
      <Container fluid className="px-4 d-flex align-items-center">
        {/* Mobile burger menu */}
        <Button
          variant="link"
          className="d-md-none text-white me-3 p-0"
          onClick={toggleSidebar}
        >
          <Menu size={24} />
        </Button>
        {/* Logo + Title */}
        <Navbar.Brand className="d-flex align-items-center m-0">
          <CircleParking size={28} className="me-2 text-info" />
          <span className="fs-4 fw-bold text-white m-0">
            PCT Parking Mobile
          </span>
        </Navbar.Brand>



        {/* User greeting (md+) */}


        <Nav className="ms-auto align-items-center d-none d-md-flex">
          {isLoading ? (
            <Nav.Item className="text-white">Loading...</Nav.Item>
          ) : isAuthenticated ? (
            <Nav.Item className="d-flex align-items-center text-white">
              <User size={20} className="me-1 text-white" />
              <span className="fw-medium text-white">Hello, {displayName}</span>
            </Nav.Item>
          ) : null}
        </Nav>




      </Container>
    </Navbar>
  );
}
