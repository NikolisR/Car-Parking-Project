// src/components/ParkingSpotSetter.jsx
import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Rect, Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { Button } from 'react-bootstrap';

export default function ParkingSpotSetter({
  src,               // image URL or video frame
  layoutId,
  initialSpots = [], // normalized spots from API: [{x, y, width, height}]
  width = 800,
  height = 600,
  onSave,
}) {
  const [image] = useImage(src);
  const [spots, setSpots] = useState([]);
  const [drawing, setDrawing] = useState(false);
  const [newRect, setNewRect] = useState(null);
  const stageRef = useRef();

  // Load initial spots on mount or when initialSpots change
  useEffect(() => {
    const loaded = initialSpots.map(r => ({
      x: r.x * width,
      y: r.y * height,
      width: r.width * width,
      height: r.height * height,
    }));
    setSpots(loaded);
  }, [initialSpots, width, height]);

  const handleMouseDown = e => {
    if (drawing) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRect({ x: pos.x, y: pos.y, width: 0, height: 0 });
    setDrawing(true);
  };

  const handleMouseMove = e => {
    if (!drawing || !newRect) return;
    const pos = e.target.getStage().getPointerPosition();
    setNewRect({
      x: newRect.x,
      y: newRect.y,
      width: pos.x - newRect.x,
      height: pos.y - newRect.y,
    });
  };

  const handleMouseUp = () => {
    if (!drawing) return;
    setSpots([...spots, newRect]);
    setNewRect(null);
    setDrawing(false);
  };

  const handleSave = () => {
    const normalized = spots.map(r => ({
      x: r.x / width,
      y: r.y / height,
      width: r.width / width,
      height: r.height / height,
    }));
    onSave(normalized);
  };

  return (
    <div>
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer>
          {image && <KonvaImage image={image} width={width} height={height} />}
          {spots.map((rect, i) => (
            <Rect
              key={i}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              stroke="red"
            />
          ))}
          {newRect && (
            <Rect
              x={newRect.x}
              y={newRect.y}
              width={newRect.width}
              height={newRect.height}
              stroke="blue"
            />
          )}
        </Layer>
      </Stage>
      <Button className="mt-3" onClick={handleSave} disabled={spots.length === 0}>
        Save Spots ({spots.length})
      </Button>
    </div>
  );
}
