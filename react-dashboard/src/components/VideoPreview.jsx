// src/components/VideoPreview.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Button, Spinner, Card } from 'react-bootstrap';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export default function VideoPreview({ source }) {
  const imageRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const testStream = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/test-video`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source })
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText);
      }
      const blob = await res.blob();
      const imageURL = URL.createObjectURL(blob);
      if (imageRef.current) {
        imageRef.current.src = ''; // Reset to force refresh
        imageRef.current.src = imageURL;
      }
    } catch (err) {
      console.error('Test video preview failed:', err);
      setError("Couldn't load video preview. Check path or camera availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4 mx-auto shadow" style={{ maxWidth: '600px', width: '100%' }}>
      <Card.Header className="text-center bg-light">
        <Button variant="warning" onClick={testStream} disabled={loading}>
          {loading ? <Spinner size="sm" animation="border" /> : 'Preview Video Source'}
        </Button>
      </Card.Header>
      <Card.Body className="text-center">
        {error && <div className="text-danger mb-3">{error}</div>}
        <img
          ref={imageRef}
          alt="Video Preview"
          width="100%"
          style={{ maxHeight: '360px', objectFit: 'contain' }}
        />
      </Card.Body>
    </Card>
  );
}
