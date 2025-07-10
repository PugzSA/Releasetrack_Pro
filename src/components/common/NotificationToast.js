import React, { useState, useEffect } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

/**
 * NotificationToast component for displaying email notification status
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the toast
 * @param {string} props.message The message to display
 * @param {string} props.variant The variant of the toast (success, danger, warning, info)
 * @param {Function} props.onClose Function to call when toast is closed
 */
const NotificationToast = ({ show, message, variant = 'success', onClose }) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    setVisible(show);
    
    // Auto-hide after 5 seconds
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, onClose]);
  
  const bgClass = `bg-${variant === 'success' ? 'success' : 
                    variant === 'danger' ? 'danger' : 
                    variant === 'warning' ? 'warning' : 'info'}`;
  
  return (
    <ToastContainer position="top-end" className="p-3" style={{ zIndex: 1070 }}>
      <Toast 
        show={visible} 
        onClose={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        className={bgClass}
        delay={5000}
        autohide
      >
        <Toast.Header closeButton={true}>
          <strong className="me-auto">
            <i className={`bi bi-${variant === 'success' ? 'check-circle' : 
                              variant === 'danger' ? 'exclamation-circle' : 
                              variant === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2`}></i>
            Notification
          </strong>
        </Toast.Header>
        <Toast.Body className={variant === 'success' || variant === 'danger' ? 'text-white' : ''}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );
};

export default NotificationToast;
