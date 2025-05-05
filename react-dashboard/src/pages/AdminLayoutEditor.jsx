import React, { useState, useRef } from 'react';
import axios from 'axios';
import {Container, Row, Col, Card, Form, Button, Toast, ProgressBar, Offcanvas} from 'react-bootstrap';
import { Stage, Layer, Line, Circle, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';

export default function AdminLayoutEditor({ darkMode, setDarkMode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState('success');

  const [points, setPoints] = useState([]);
  const [boxes, setBoxes] = useState([]);
  const stageRef = useRef();

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setError(null);
      setProgress(0);
      setPoints([]);
      setBoxes([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please choose an image first.');
      return;
    }
    setUploading(true);
    setError(null);
    setShowToast(false);
    const data = new FormData();
    data.append('image', selectedFile);

    try {
      const res = await axios.post(
        'https://localhost:8000/admin/upload-image',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: e => {
            const pct = Math.round((e.loaded * 100) / e.total);
            setProgress(pct);
          }
        }
      );
      const url = `https://localhost:8000${res.data.url}`;
      setImageUrl(url);
      setToastMessage('Upload successful! You can now draw boxes.');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setError('Upload failed.');
      setToastMessage('Upload failed.');
      setToastVariant('danger');
      setShowToast(true);
    } finally {
      setUploading(false);
    }
  };

  const handleCaptureSnapshot = async () => {
    try {
      const res = await axios.post('https://localhost:8000/api/capture-snapshot');
      const snapshotUrl = `https://localhost:8000${res.data.url}`;
      setImageUrl(snapshotUrl);
      setSelectedFile(null);
      setPoints([]);
      setBoxes([]);
      setToastMessage('Snapshot captured!');
      setToastVariant('info');
      setShowToast(true);

      // Trigger browser download
      const imageBlob = await axios.get(snapshotUrl, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([imageBlob.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'snapshot.jpg');
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      console.error('Snapshot error:', err);
      setToastMessage('Failed to capture snapshot');
      setToastVariant('danger');
      setShowToast(true);
    }
  };


  const handleStageClick = e => {
    if (!imageUrl) return;
    const pos = e.target.getStage().getPointerPosition();
    const newPts = [...points, { x: pos.x, y: pos.y }];
    if (newPts.length === 4) {
      setBoxes([...boxes, newPts]);
      setPoints([]);
      setToastMessage('Box added');
      setToastVariant('success');
      setShowToast(true);
    } else {
      setPoints(newPts);
    }
  };

  const handleRemoveLast = () => {
    if (!boxes.length) return;
    setBoxes(boxes.slice(0, -1));
    setToastMessage('Last box removed');
    setToastVariant('info');
    setShowToast(true);
  };

  const handleSaveBoxes = async () => {
    if (!boxes.length) {
      setToastMessage('No boxes to save');
      setToastVariant('warning');
      setShowToast(true);
      return;
    }
    try {
      const formatted = boxes.map(box => ({ points: box.map(p => [Math.round(p.x), Math.round(p.y)]) }));
      await axios.post('https://localhost:8000/admin/save-bounding-boxes', { boxes: formatted });
      setToastMessage('Boxes saved to backend!');
      setToastVariant('success');
      setShowToast(true);
    } catch (err) {
      console.error(err);
      setToastMessage('Failed to save boxes');
      setToastVariant('danger');
      setShowToast(true);
    }
  };

  const [konvaImage] = useImage(imageUrl, 'Anonymous');

  return (
    <>
      <TopBar toggleSidebar={() => setShowSidebar(true)} />
      <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} className="d-md-none" placement="start">
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
          <Col md={10} className="p-4 overflow-auto">
            <Card className="shadow-lg mb-4 rounded-4">
              <Card.Header className="bg-secondary text-white">Parking Layout Editor</Card.Header>
              <Card.Body>
                <Row className="align-items-end">
                  <Col md={8}>
                    <Form.Group controlId="formFile">
                      <Form.Label>Select Lot Image/Video</Form.Label>
                      <Form.Control type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
                    </Form.Group>
                  </Col>
                  <Col md={2}>
                    <Button onClick={handleUpload} disabled={uploading || !selectedFile}>
                      {uploading ? 'Uploading...' : 'Upload'}
                    </Button>
                  </Col>
                  <Col md={2}>
                    <Button variant="secondary" onClick={handleCaptureSnapshot} disabled={uploading}>
                      Use Camera Snapshot
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {imageUrl && (
              <Card className="shadow-soft rounded-4 mb-4">
                <Card.Header className="bg-secondary text-white">Draw Bounding Boxes</Card.Header>
                <Card.Body>
                  <Stage width={konvaImage?.width || 800} height={konvaImage?.height || 600} onClick={handleStageClick} ref={stageRef}>
                    <Layer>
                      <KonvaImage image={konvaImage} />
                      {boxes.map((box, i) => (
                        <Line key={i} points={box.flatMap(p => [p.x, p.y])} closed stroke="blue" strokeWidth={2} />
                      ))}
                      {points.map((p, idx) => (
                        <Circle key={idx} x={p.x} y={p.y} radius={4} fill="red" />
                      ))}
                    </Layer>
                  </Stage>
                </Card.Body>
                <Card.Footer>
                  <Button variant="warning" onClick={handleRemoveLast} className="me-2">Remove Last Box</Button>
                  <Button variant="primary" onClick={handleSaveBoxes} disabled={!boxes.length}>Save Boxes</Button>
                </Card.Footer>
              </Card>
            )}

            {imageUrl && (
              <Toast onClose={() => setShowToast(false)} show={showToast} autohide delay={3000} bg={toastVariant} className="position-fixed bottom-0 end-0 m-3">
                <Toast.Body>{toastMessage}</Toast.Body>
              </Toast>
            )}
          </Col>
        </Row>
      </Container>

      <Container fluid className="d-md-none p-3">
        <Card className="shadow-soft rounded-4 mb-4">
          <Card.Header className="bg-secondary text-white">Parking Layout Editor</Card.Header>
          <Card.Body>
            <Form.Group controlId="formFileMobile">
              <Form.Label>Select Lot Image/Video</Form.Label>
              <Form.Control type="file" accept="image/*,video/*" onChange={handleFileChange} disabled={uploading} />
            </Form.Group>
            <Button className="mt-2" onClick={handleUpload} disabled={uploading || !selectedFile}>
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
            <Button className="mt-2 ms-2" variant="secondary" onClick={handleCaptureSnapshot} disabled={uploading}>
              Use Camera Snapshot
            </Button>
            {uploading && <ProgressBar className="mt-2" now={progress} label={`${progress}%`} />}
          </Card.Body>
        </Card>
        {imageUrl && (
          <Card className="shadow-soft rounded-4">
            <Card.Header className="bg-secondary text-white">Draw Bounding Boxes</Card.Header>
            <Card.Body>
              <Stage width={konvaImage?.width || 300} height={konvaImage?.height || 200} onClick={handleStageClick} ref={stageRef}>
                <Layer>
                  <KonvaImage image={konvaImage} />
                  {boxes.map((box, i) => (
                    <Line key={i} points={box.flatMap(p => [p.x, p.y])} closed stroke="blue" strokeWidth={2} />
                  ))}
                  {points.map((p, idx) => (
                    <Circle key={idx} x={p.x} y={p.y} radius={4} fill="red" />
                  ))}
                </Layer>
              </Stage>
            </Card.Body>
            <Card.Footer>
              <Button variant="warning" onClick={handleRemoveLast} className="me-2">Remove Last Box</Button>
              <Button variant="primary" onClick={handleSaveBoxes} disabled={!boxes.length}>Save Boxes</Button>
            </Card.Footer>
          </Card>
        )}
      </Container>
    </>
  );
}
