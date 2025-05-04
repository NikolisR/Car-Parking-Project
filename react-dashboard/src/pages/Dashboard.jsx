import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Offcanvas } from 'react-bootstrap';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import AvailableDisplay from '../components/AvailabilityDisplay';
import CheckStatus from '../components/CheckStatus';
import ParkingMap from '../components/ParkingMap';
import spotsData from '../data/spots.json';
import { fetchParkingSpot } from '../api/parkingAPI';

export default function Dashboard() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [statuses, setStatuses] = useState([]);

  // fetch parking statuses every 15s
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const data = await fetchParkingSpot();
        if (isMounted) setStatuses(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, 5000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // derive total from API data
  const total = statuses.length;
  const available = statuses.filter(s => s.available).length;
  const occupied = total - available;

  const stats = [
    { id: 1, title: 'Total Spots', value: total },
    { id: 2, title: 'Available', value: available },
    { id: 3, title: 'Occupied', value: occupied },
  ];

  return (
    <>
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

      {/* Desktop layout */}
      <Container fluid className="bg-light d-none d-md-flex p-0">
        <Row className="g-0 flex-grow-1 overflow-hidden">
          <Col md={2} className="bg-primary text-white pe-2 overflow-auto">
            <SideBar />
          </Col>
          <Col md={7} className="p-3 d-flex flex-column gap-3 overflow-auto">
            <AvailableDisplay stats={stats} />
            <Card className="shadow-soft" style={{ width: '100%', aspectRatio: '16/10', overflow: 'hidden' }}>
              <Card.Header className="bg-secondary text-white">Parking Lot Map</Card.Header>
              <Card.Body className="p-0">
                <div className="map-responsive p-2">
                  <ParkingMap spotsData={spotsData} statuses={statuses} />
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="p-3 d-flex flex-column gap-3 overflow-auto">
            <CheckStatus statuses={statuses} />
          </Col>
        </Row>
      </Container>

      {/* Mobile layout */}
      <Container fluid className="d-md-none p-3">
        <AvailableDisplay stats={stats} />
        <Card className="shadow-soft mb-3" style={{ height: '250px', overflowY: 'auto' }}>
          <Card.Header className="bg-secondary text-white">Parking Lot Map</Card.Header>
          <Card.Body className="p-0">
            <div className="map-responsive p-2">
              <ParkingMap spotsData={spotsData} statuses={statuses} />
            </div>
          </Card.Body>
        </Card>
        <CheckStatus statuses={statuses} />
      </Container>
    </>
  );
}
