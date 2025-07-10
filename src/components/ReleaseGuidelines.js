import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import './ReleaseGuidelines.css';

const ReleaseGuidelines = () => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="release-guidelines-container">
      <div className={`page-header ${isFullScreen ? 'd-none' : ''}`}>
        <div>
          <h1>Release Guidelines</h1>
          <p className="page-subtitle">View the software development release guidelines</p>
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

      <Card className={`release-guidelines-card ${isFullScreen ? 'fullscreen' : ''}`}>
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
              src="/images/release-guidelines.png" 
              alt="Software Development Release Guidelines" 
              className="release-guidelines-image"
            />
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ReleaseGuidelines;
