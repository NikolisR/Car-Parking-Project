// src/pages/LiveFeeds.jsx
import React, { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Nav,
  Offcanvas,
  Button
} from 'react-bootstrap';
import { Video, Power } from 'lucide-react';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import CameraFeed from '../components/CameraFeed';
import { LIVE_FEED_URL } from '../api/parkingAPI';

export default function LiveFeeds({ showSidebar, setShowSidebar }) {
  const [offcanvasVisible, setOffcanvasVisible] = useState(false);
  const [feedOn, setFeedOn] = useState(true);
  const [activeCamera, setActiveCamera] = useState('frontGate');

  const cameras = [
    { id: 'frontGate',   title: 'Front Gate',   url: LIVE_FEED_URL },
    { id: 'lotEntrance', title: 'Lot Entrance', url: LIVE_FEED_URL },
  ];
  const selected = cameras.find(c => c.id === activeCamera);

  return (
    <>
      {/* Top Bar + Mobile Offcanvas */}
      <TopBar toggleSidebar={() => setOffcanvasVisible(true)} />
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

      {/* Desktop Layout */}
      <Container fluid className="bg-light  d-none d-md-flex p-0">
        <Row className="g-0 flex-grow-1">
          <Col md={2} className="bg-primary text-white pe-2 overflow-auto">
            <SideBar onLinkClick={() => setOffcanvasVisible(false)} />
          </Col>
          <Col md={10} className="p-4 overflow-auto">
            <h2 className="mb-4">Live Camera Feeds</h2>
            <Row>


              {/* Main Feed Card */}
                <Col md={9} className="mb-3">
                  <Card
                    className="shadow-sm h-100"
                    style={{ width: '100%', height: '60vh', overflow: 'hidden' }}  // fixed card height
                  >
                    <Card.Header
                      className="d-flex justify-content-between align-items-center bg-secondary text-white"
                      style={{ height: '3rem' }} // ensure you know your header height
                    >
                      <span>{selected.title}</span>
                      <Button
                        size="sm"
                        variant="light"
                        onClick={() => setFeedOn(!feedOn)}
                      >
                        <Power size={16} className="me-1" />
                        {feedOn ? 'Stop' : 'Start'}
                      </Button>
                    </Card.Header>

                    <Card.Body
                      className="p-0"
                      style={{
                        position: 'relative',
                        height: 'calc(100% - 3rem)', // fill remaining space
                      }}
                    >
                      {feedOn ? (
                        <CameraFeed url={selected.url} mode="fixed" />
                      ) : (
                        /* placeholder absolutely fills same box */
                        <div
                          style={{
                            position: 'absolute',
                            top: 0, left: 0, width: '100%', height: '100%',
                          }}
                          className="d-flex align-items-center justify-content-center text-muted"
                        >
                          Feed is off
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>



              {/* Camera Selector */}
              <Col md={3}>
                <Nav variant="pills" className="flex-column">
                  {cameras.map(cam => (
                    <Nav.Item key={cam.id} className="mb-2">
                      <Nav.Link
                        active={cam.id === activeCamera}
                        onClick={() => {
                          setActiveCamera(cam.id);
                          setFeedOn(true);
                        }}
                        className="d-flex align-items-center shadow-sm"
                        style={{ cursor: 'pointer' }}
                      >
                        <Video size={20} className="me-2" />
                        {cam.title}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Mobile Layout: Stacked Cards */}
      <Container fluid className="d-md-none p-3">
        <h2 className="mb-3">Live Camera Feeds</h2>
        <Row className="g-3">
          {cameras.map(cam => (
            <Col xs={12} key={cam.id}>
              <Card className="shadow-sm">
                <Card.Header className="d-flex justify-content-between align-items-center bg-secondary text-white">
                  <span>{cam.title}</span>
                  <Button
                    size="sm"
                    variant="light"
                    onClick={() => {
                      if (activeCamera === cam.id) {
                        setFeedOn(!feedOn);
                      } else {
                        setActiveCamera(cam.id);
                        setFeedOn(true);
                      }
                    }}
                  >
                    <Power size={16} />
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {feedOn ? (
                    <CameraFeed url={selected.url} />
                  ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                      Feed is off
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
