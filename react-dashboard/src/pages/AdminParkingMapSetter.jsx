import React, { useState, useRef } from 'react';
import axios from 'axios';
import {Container, Row, Col, Card, Form, Button, ProgressBar, Toast, Offcanvas, ButtonGroup} from 'react-bootstrap';
import TopBar from '../components/TopBar';
import SideBar from '../components/SideBar';
import { Stage, Layer, Circle, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { saveSpotsData } from '../api/parkingAPI';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
const MIN_WIDTH = 1280;
const MIN_HEIGHT = 720;

export default function SimpleAdminMapSetter({ darkMode, setDarkMode }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [file, setFile]               = useState(null);
  const [imgUrl, setImgUrl]           = useState(null);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [spots, setSpots]             = useState([]);
  const [toast, setToast]             = useState({ show: false, msg: '', variant: 'info' });
  const [errorMsg, setErrorMsg]       = useState(null);
  const [debugInfo, setDebugInfo]     = useState(null);
  const [konvaImage]                  = useImage(imgUrl, 'Anonymous');
  const stageRef                      = useRef();

  const onFileChange = e => {
    const f = e.target.files[0];
    if (!f) return;

    // validate dimensions before accepting
    const img = new window.Image();
    img.src = URL.createObjectURL(f);
    img.onload = () => {
      if (img.width < MIN_WIDTH || img.height < MIN_HEIGHT) {
        setErrorMsg(`Image must be at least ${MIN_WIDTH}×${MIN_HEIGHT}px`);
        setFile(null);
        setImgUrl(null);
      } else {
        setErrorMsg(null);
        setDebugInfo(null);
        setFile(f);
        setImgUrl(img.src);
        setSpots([]);
      }
    };
    img.onerror = () => {
      setErrorMsg('Failed to load image for validation');
      setFile(null);
      setImgUrl(null);
    };
  };

  const onUpload = async () => {
    if (!file) {
      setToast({ show: true, msg: 'Choose a file first', variant: 'warning' });
      return;
    }
    setUploading(true);
    setErrorMsg(null);

    const form = new FormData();
    form.append('image', file);
    const nameOnly = file.name.replace(/\.[^/.]+$/, '');
    form.append('filename', nameOnly);

    try {
      const res = await axios.post(
        `${API_BASE}/admin/upload-image`,
        form,
        { onUploadProgress: e => setProgress(Math.round((e.loaded * 100) / e.total)) }
      );
      const url = `${API_BASE}${res.data.url}`;
      setImgUrl(url);
      setToast({ show: true, msg: 'Upload successful!', variant: 'success' });
    } catch (err) {
      setErrorMsg(err.message);
      setToast({ show: true, msg: 'Upload failed', variant: 'danger' });
    } finally {
      setUploading(false);
    }
  };

  const onStageClick = e => {
    if (!imgUrl) return;
    const pos = e.target.getStage().getPointerPosition();
    setSpots(prev => [...prev, { x: pos.x, y: pos.y, id: null }]);
  };

  const removeLast = () => {
    setSpots(prev => prev.slice(0, -1));
    setToast({ show: true, msg: 'Removed last spot', variant: 'info' });
  };

  const clearAll = () => {
    setSpots([]);
    setToast({ show: true, msg: 'Cleared all spots', variant: 'info' });
  };

  const onSaveSpots = async () => {
    if (!spots.length) {
      setToast({ show: true, msg: 'No spots to save', variant: 'warning' });
      return;
    }
    try {
      // convert absolute to percent
      const imgNode = stageRef.current.getStage().findOne('Image');
      const w = imgNode.width(), h = imgNode.height();
      const payload = spots.map((p,i) => ({
        id: p.id || `Spot_${i+1}`,
        xPct: +(p.x / w).toFixed(4),
        yPct: +(p.y / h).toFixed(4)
      }));
      await saveSpotsData(payload);
      setToast({ show: true, msg: 'Spots saved!', variant: 'success' });
    } catch (err) {
      setToast({ show: true, msg: 'Save failed', variant: 'danger' });
    }
  };

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
            <SideBar />
          </Col>
          <Col md={10} className="p-4 overflow-auto">
            <Card className="mb-4">
              <Card.Header>Upload Parking Map</Card.Header>
              <Card.Body className="d-flex align-items-center">
                <Form.Control type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
                <Button className="ms-3" onClick={onUpload} disabled={uploading || !file}>
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
                {uploading && <ProgressBar className="ms-3 flex-grow-1" now={progress} label={`${progress}%`} />}
              </Card.Body>
              {errorMsg && <div className="text-danger ms-3 mb-2">Error: {errorMsg}</div>}
            </Card>

            {imgUrl && (
              <>
                <Card className="mb-4">
                  <Card.Header>Click on map to add spots (Next: {spots.length+1})</Card.Header>
                  <Card.Body>
                    <Stage width={konvaImage?.width||800} height={konvaImage?.height||600} onClick={onStageClick} ref={stageRef} className="border rounded">
                      <Layer>
                        <KonvaImage image={konvaImage} />
                        {spots.map((p,i)=><Circle key={i} x={p.x} y={p.y} radius={6} fill="green" />)}
                      </Layer>
                    </Stage>
                  </Card.Body>
                  <Card.Footer>
                    <ButtonGroup>
                      <Button variant="warning" onClick={removeLast} disabled={!spots.length}>Remove Last</Button>
                      <Button variant="danger" onClick={clearAll} disabled={!spots.length}>Clear All</Button>
                      <Button variant="primary" onClick={onSaveSpots} disabled={!spots.length}>Save Spots</Button>
                    </ButtonGroup>
                  </Card.Footer>
                </Card>
              </>
            )}

            <Toast show={toast.show} onClose={()=>setToast(t=>({...t,show:false}))} autohide delay={2000} bg={toast.variant} className="position-fixed bottom-0 end-0 m-3">
              <Toast.Body>{toast.msg}</Toast.Body>
            </Toast>
          </Col>
        </Row>
      </Container>

      {/* Mobile fallback */}
      <Container fluid className="d-md-none p-3">
        <Card>
          <Card.Header>Upload Parking Map</Card.Header>
          <Card.Body>
            <Form.Control type="file" accept="image/*" onChange={onFileChange} disabled={uploading} />
            <Button className="mt-2" onClick={onUpload} disabled={uploading||!file}>{uploading?'Uploading...':'Upload'}</Button>
            {uploading&&<ProgressBar className="mt-2" now={progress} label={`${progress}%`} />}
          </Card.Body>
        </Card>
        {imgUrl&&(
          <Card className="mt-3">
            <Card.Header>Click on map to add spots (Next: {spots.length+1})</Card.Header>
            <Card.Body>
              <Stage width={konvaImage?.width||300} height={konvaImage?.height||200} onClick={onStageClick} ref={stageRef}>
                <Layer>
                  <KonvaImage image={konvaImage} />
                  {spots.map((p,i)=><Circle key={i} x={p.x} y={p.y} radius={6} fill="green" />)}
                </Layer>
              </Stage>
            </Card.Body>
            <Card.Footer>
              <ButtonGroup>
                <Button variant="warning" onClick={removeLast} disabled={!spots.length}>Remove Last</Button>
                <Button variant="danger" onClick={clearAll} disabled={!spots.length}>Clear All</Button>
                <Button variant="primary" onClick={onSaveSpots} disabled={!spots.length}>Save Spots</Button>
              </ButtonGroup>
            </Card.Footer>
          </Card>
        )}
      </Container>
    </>
  );
}
