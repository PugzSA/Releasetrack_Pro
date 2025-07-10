import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import './ReleaseDates.css';

const ReleaseDates = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="release-dates-container">
      <div className={`page-header ${isFullScreen ? 'd-none' : ''}`}>
        <div>
          <h1>Release Dates</h1>
          <p className="page-subtitle">View the software development release schedule</p>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={toggleFullScreen}
          className="fullscreen-btn"
        >
          <i className="bi bi-fullscreen"></i>
          <span className="ms-1">Full Screen</span>
        </Button>
      </div>

      <Card className={`release-dates-card ${isFullScreen ? 'fullscreen' : ''}`}>
        {isFullScreen && (
          <Button 
            variant="light" 
            onClick={toggleFullScreen}
            className="exit-fullscreen-btn"
            aria-label="Exit Full Screen"
          >
            <i className="bi bi-fullscreen-exit"></i>
            <span className="ms-1">Exit Full Screen</span>
          </Button>
        )}
        <Card.Body className="p-0">
          <div className="image-container">
            <img 
              src="/images/release-schedule.png" 
              alt="Software Development Release Strategy 2025" 
              className="release-schedule-image"
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReleaseDates;
