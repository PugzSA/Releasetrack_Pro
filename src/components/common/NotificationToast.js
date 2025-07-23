import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Toast, ToastContainer } from "react-bootstrap";

/**
 * NotificationToast component for displaying email notification status
 * @param {Object} props Component props
 * @param {boolean} props.show Whether to show the toast
 * @param {string} props.message The message to display
 * @param {string} props.variant The variant of the toast (success, danger, warning, info)
 * @param {Function} props.onClose Function to call when toast is closed
 */
const NotificationToast = ({ show, message, variant = "success", onClose }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(show);

    // Auto-hide after 3 seconds
    let timer;
    if (show) {
      timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 3000);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show, onClose]);

  // Modern styling with custom inline styles
  const getToastStyles = () => {
    const baseStyles = {
      borderRadius: "12px",
      border: "none",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      backdropFilter: "blur(10px)",
      minWidth: "320px",
    };

    switch (variant) {
      case "success":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          color: "white",
        };
      case "danger":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
          color: "white",
        };
      case "warning":
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
        };
      default:
        return {
          ...baseStyles,
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          color: "white",
        };
    }
  };

  const getIcon = () => {
    switch (variant) {
      case "success":
        return "✓";
      case "danger":
        return "✕";
      case "warning":
        return "⚠";
      default:
        return "ℹ";
    }
  };

  const toastContent = (
    <ToastContainer
      position="top-center"
      className="p-3"
      style={{
        zIndex: 9999,
        position: "fixed",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
      }}
    >
      <Toast
        show={visible}
        onClose={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
        style={getToastStyles()}
        delay={3000}
        autohide
      >
        <Toast.Header
          closeButton={true}
          style={{
            background: "transparent",
            border: "none",
            color: "inherit",
            paddingBottom: "8px",
          }}
        >
          <strong className="me-auto d-flex align-items-center">
            <span className="me-2" style={{ fontSize: "16px" }}>
              {getIcon()}
            </span>
            {variant === "success"
              ? "Success"
              : variant === "danger"
              ? "Error"
              : variant === "warning"
              ? "Warning"
              : "Info"}
          </strong>
        </Toast.Header>
        <Toast.Body style={{ color: "inherit", paddingTop: "0" }}>
          {message}
        </Toast.Body>
      </Toast>
    </ToastContainer>
  );

  // Simple centered toast
  if (visible) {
    const toastStyles = getToastStyles();
    const simpleToast = (
      <div
        style={{
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          ...toastStyles,
          padding: "16px 24px",
          zIndex: 99999,
          minWidth: "300px",
          fontSize: "14px",
          fontWeight: "500",
        }}
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        {getIcon()} {message}
        <button
          style={{
            background: "none",
            border: "none",
            color: "white",
            float: "right",
            cursor: "pointer",
            fontSize: "16px",
            marginLeft: "10px",
          }}
          onClick={(e) => {
            e.stopPropagation();
            setVisible(false);
            if (onClose) onClose();
          }}
        >
          ×
        </button>
      </div>
    );
    return ReactDOM.createPortal(simpleToast, document.body);
  }

  return null;
};

export default NotificationToast;
