// src/components/CameraFeed.jsx
import React from 'react';
import { LIVE_FEED_URL } from '../api/parkingAPI';
import './CameraFeed.css';

export default function CameraFeed({ url = LIVE_FEED_URL }) {
  return (
    <div className="feed-responsive">
      <div className="feed-container">
        <img src={url} alt="Live Camera Feed" />
      </div>
    </div>
  );
}
