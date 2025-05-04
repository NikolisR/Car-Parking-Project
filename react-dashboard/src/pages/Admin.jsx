// src/pages/Admin.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Offcanvas } from 'react-bootstrap';
import { FaUsersCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';

export default function Admin({ darkMode, setDarkMode }) {
  const [showSidebar, setShowSidebar] = useState(false);

  return (
    <>
      {/* Top bar & mobile offcanvas */}
      <TopBar toggleSidebar={() => setShowSidebar(true)} />
      <Offcanvas
        show={showSidebar}
        onHide={() => setShowSidebar(false)}
        className="d-md-none"
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SideBar onLinkClick={() => setShowSidebar(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop layout with sidebar */}
      <Container fluid className="bg-light d-none d-md-flex p-0">
        <Row className="g-0 flex-grow-1">
          <Col md={2} className="bg-primary text-white pe-2 overflow-auto">
            <SideBar onLinkClick={() => setShowSidebar(false)} />
          </Col>
          <Col md={10} className="p-5 overflow-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="shadow-lg rounded-4">
                <Card.Body className="text-center p-5">
                  <FaUsersCog size={48} className="mb-3 text-primary" />
                  <h2 className="mb-4">Admin Dashboard</h2>
                  <p className="mb-4">Welcome, Admin! Choose an action below:</p>
                  <div className="d-grid gap-3">
                    <Button as={Link} to="/admin/users" variant="primary">
                      Manage Users
                    </Button>
                    <Button as={Link} to="/admin/settings" variant="secondary">
                      Settings
                    </Button>
                    <Button as={Link} to="/admin/layout-editor" variant="success">
                      Edit Layout
                    </Button>
                    <Button as={Link} to="/admin/parking-map-setter" variant="info">
                      Set Parking Map
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Mobile single-column scroll view */}
      <Container fluid className="d-md-none p-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="shadow-lg rounded-4 mb-4">
            <Card.Body className="text-center p-4">
              <FaUsersCog size={36} className="mb-2 text-primary" />
              <h2 className="mb-3">Admin Dashboard</h2>
            </Card.Body>
            <Card.Footer className="text-center bg-transparent">
              <div className="d-grid gap-2">
                <Button as={Link} to="/admin/users" variant="primary">
                  Manage Users
                </Button>
                <Button as={Link} to="/admin/settings" variant="secondary">
                  Settings
                </Button>
                <Button as={Link} to="/admin/layout-editor" variant="success">
                  Edit Layout
                </Button>
                <Button as={Link} to="/admin/parking-map-setter" variant="info">
                  Set Parking Map
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </motion.div>
      </Container>
    </>
  );
}
