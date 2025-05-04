// src/pages/Settings.jsx
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Offcanvas,
  Form
} from 'react-bootstrap';
import { Settings as SettingsIcon } from 'lucide-react';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';

export default function Settings({ showSidebar, setShowSidebar, darkMode, setDarkMode }) {
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);

  const handleToggle = () => {
    setDarkMode(!darkMode);

  };

  return (
    <>
      {/* Top bar with burger toggle */}
      <TopBar toggleSidebar={() => setOffcanvasVisible(true)} />

      {/* Mobile offcanvas sidebar */}
      <Offcanvas
        show={offcanvasVisible}
        onHide={() => setOffcanvasVisible(false)}
        className="d-md-none"
        placement="start"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <SideBar onLinkClick={() => setOffcanvasVisible(false)} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop layout: sidebar + main */}
      <Container fluid className="bg-light d-none d-md-flex p-0">
        <Row className="g-0 flex-grow-1">
          {/* Static sidebar */}
          <Col md={2} className="bg-primary text-white pe-3 overflow-auto">
            <SideBar onLinkClick={() => setOffcanvasVisible(false)} />
          </Col>

          {/* Main content */}
          <Col md={10} className="p-4 overflow-auto">
            <h2 className="mb-4 d-flex align-items-center">
              <SettingsIcon className="me-2" /> Settings
            </h2>

            {/* Appearance toggle card */}
            <Card className="shadow-soft mb-4" style={{ maxWidth: '400px' }}>
              <Card.Header className="bg-secondary text-white">
                Appearance
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Check
                    type="switch"
                    id="theme-toggle"
                    label={darkMode ? 'Dark Mode' : 'Light Mode'}
                    checked={darkMode}
                    onChange={handleToggle}
                  />
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Mobile single‐column scroll view */}
      <Container fluid className="d-md-none p-3">
        <h2 className="mb-4 d-flex align-items-center">
          <SettingsIcon className="me-2" /> Settings
        </h2>

        <Card className="shadow-soft mb-4">
          <Card.Header className="bg-secondary text-white">
            Appearance
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Check
                type="switch"
                id="theme-toggle-mobile"
                label={darkMode ? 'Dark Mode' : 'Light Mode'}
                checked={darkMode}
                onChange={handleToggle}
              />
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}