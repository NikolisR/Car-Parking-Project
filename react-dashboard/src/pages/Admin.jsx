import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Offcanvas } from 'react-bootstrap';
import { FaUsersCog } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import VideoPreview from '../components/VideoPreview.jsx';

export default function Admin({ darkMode, setDarkMode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("idle");
  const [videoSource, setVideoSource] = useState("0");

  const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/detection-status`);
        if (res.ok) {
          const data = await res.json();
          setDetectionStatus(data.status);
        }
      } catch (err) {
        console.error("Failed to fetch detection status", err);
      }
    };
    pollStatus();
    const interval = setInterval(pollStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchVideoSource = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/get-video-source`);
        if (res.ok) {
          const data = await res.json();
          setVideoSource(data.source?.toString() || "0");
        }
      } catch (err) {
        console.error("Failed to fetch video source", err);
      }
    };
    fetchVideoSource();
  }, []);

  const startDetection = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/start-detection`, { method: "POST" });
      if (res.ok) setDetectionStatus("running");
    } catch (err) {
      console.error("Failed to start detection", err);
    }
  };

  const stopDetection = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/stop-detection`, { method: "POST" });
      if (res.ok) setDetectionStatus("stopped");
    } catch (err) {
      console.error("Failed to stop detection", err);
    }
  };

  const updateVideoSource = async () => {
    try {
      const res = await fetch(`${API_BASE}/admin/set-video-source`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: videoSource })
      });
      if (res.ok) {
        console.log("✅ Video source updated");
      } else {
        const errText = await res.text();
        console.error("❌ Failed to update video source:", errText);
      }
    } catch (err) {
      console.error("❌ Network error while setting video source", err);
    }
  };

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

                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <Button as={Link} to="/admin/layout-editor" variant="secondary">
                      Manage Bounding Boxes
                    </Button>
                    <Button as={Link} to="/admin/parking-map-setter" variant="success">
                      Manage Parking Map View
                    </Button>
                  </div>

                  <div className="mt-5">
                    <h5>Detection Control</h5>
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                      <Button variant="success" onClick={startDetection}>Start Detection</Button>
                      <Button variant="danger" onClick={stopDetection}>Stop Detection</Button>
                    </div>
                    <p className="mt-3 text-muted">
                      Status:{" "}
                      {detectionStatus === "running" ? "🟢 Running" :
                       detectionStatus === "stopped" ? "🔴 Stopped" :
                       "⚪️ Idle"}
                    </p>
                  </div>

                  <div className="mt-4">
                    <h5>Video Source</h5>
                    <select
                      value={videoSource}
                      onChange={(e) => setVideoSource(e.target.value)}
                      className="form-select text-center"
                      style={{ maxWidth: "400px", margin: "0 auto" }}
                    >
                      <option value="0">Webcam 0</option>
                      <option value="1">Webcam 1</option>
                      <option value="backend/myVideo3.mp4">Test Video: myVideo3.mp4</option>
                      <option value="rtsp://example.com/stream">RTSP Stream</option>
                    </select>
                    <Button variant="info" className="mt-2" onClick={updateVideoSource}>
                      Save Video Source
                    </Button>
                  </div>

                  <VideoPreview source={videoSource} />
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </>
  );
}
