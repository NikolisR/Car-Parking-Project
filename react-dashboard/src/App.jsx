import React, { useState, useEffect } from 'react';
import {Container, Row, Col, Card} from 'react-bootstrap';

import ParkingMap from './components/ParkingMap';
import SideBar from './components/SideBar';
import TopBar from './components/TopBar';
import ChartAndStatus from './components/ChartAndStatus';
import AvailableDisplay from './components/AvailabilityDisplay.jsx';
import spotsData from './data/spots.json';
import { fetchParkingSpot } from './api/parkingAPI';
import './components/ParkingMap.css';


export default function App() {
  const MAP_WIDTH = 1874;
  const MAP_HEIGHT = 1218;

  const [statuses, setStatuses] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        const data = await fetchParkingSpot();
        if (isMounted) setStatuses(data);
      } catch (err) {
        console.error('Error fetching statuses:', err);
      }
    }

    fetchData();                                // initial load
    const intervalId = setInterval(fetchData, 10000); // poll every 10s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // derive stats and chart data
  const total = spotsData.length;
  const available = statuses.filter(s => s.available).length;
  const occupied = total - available;

  const chartData = [
    { time: '8 AM',  occupiedPercentage: Math.round((occupied/total)*100) },
    { time: '12 PM', occupiedPercentage: Math.round((occupied/total)*100) },
    { time: '4 PM',  occupiedPercentage: Math.round((occupied/total)*100) },
  ];

  const stats = [
    { id: 1, title: 'Total Spots',  value: total,     variant: 'primary' },
    { id: 2, title: 'Available',    value: available, variant: 'success' },
    { id: 3, title: 'Occupied',     value: occupied,  variant: 'danger'  },
    { id: 4, title: 'Change (24h)', value: '–',       variant: 'warning' }
  ];

  return (
    <Container fluid className="vh-flex bg-primary">
      <Row className="h-100">

        {/* Sidebar */}
        <Col xs={2} className="bg-primary text-white d-flex flex-column p-3">
          <SideBar />
        </Col>

        {/* Top Bar */}
        <Col xs={10} className="p-4 overflow-auto">
          <TopBar />

          {/* Spot Status */}
          <AvailableDisplay stats={stats} />

          {/* Map */}
          <Row className="mb-4">
            <Col>
              <Card className="h-100 shadow-soft">
                <Card.Header className="bg-primary text-white">
                  Parking Lot Map
                </Card.Header>
                <Card.Body
                  className="p-0"
                  style={{
                    height: '800px',
                    overflow: 'hidden'
                  }}
                >
                  <ParkingMap
                    spotsData={spotsData}
                    statuses={statuses}
                    width={MAP_WIDTH}
                    height={MAP_HEIGHT}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Chart & Status Table */}
          <ChartAndStatus chartData={chartData} statuses={statuses} />


        </Col>
      </Row>
    </Container>
  );
}
