/**
 * Alert.jsx - Reusable Alert/Notification Component
 * Matches your project's design system
 */

import React, { useEffect } from 'react';
import './Alert.css';

const Alert = ({
  type = 'info', // success, error, warning, info
  title,
  message,
  onClose,
  dismissible = true,
  autoClose = false,
  autoCloseDelay = 5000,
  icon = null,
  actions = null,
  className = '',
}) => {
  // Auto close functionality
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [autoClose, autoCloseDelay, onClose]);

  const defaultIcons = {
    success: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    warning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    info: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="10" strokeWidth="2"/>
        <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  };

  return (
    <div className={`alert alert-${type} ${className}`}>
      {/* Icon */}
      <div className="alert-icon">{icon || defaultIcons[type]}</div>

      {/* Content */}
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
        {actions && <div className="alert-actions">{actions}</div>}
      </div>

      {/* Close Button */}
      {dismissible && onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
      )}
    </div>
  );
};

// Toast notification (appears at top/bottom)
export const Toast = ({
  isOpen,
  onClose,
  type = 'info',
  message,
  position = 'top-right', // top-left, top-right, bottom-left, bottom-right, top-center, bottom-center
  autoClose = true,
  autoCloseDelay = 3000,
}) => {
  useEffect(() => {
    if (isOpen && autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`toast toast-${position} toast-${type}`}>
      <Alert
        type={type}
        message={message}
        onClose={onClose}
        dismissible={true}
      />
    </div>
  );
};

export default Alert;