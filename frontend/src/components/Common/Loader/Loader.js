/**
 * Loader.jsx - Reusable Loading Spinner Component
 * Matches your project's blue theme
 */

import React from 'react';
import './Loader.css';

const Loader = ({
  size = 'medium', // small, medium, large
  variant = 'primary', // primary, secondary, white
  fullScreen = false,
  text = null,
  className = '',
}) => {
  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div className={`loader loader-${size} loader-${variant} ${className}`}>
          <div className="loader-spinner"></div>
        </div>
        {text && <p className="loader-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className={`loader-container ${className}`}>
      <div className={`loader loader-${size} loader-${variant}`}>
        <div className="loader-spinner"></div>
      </div>
      {text && <p className="loader-text">{text}</p>}
    </div>
  );
};

// Inline loader for buttons, cards, etc.
export const InlineLoader = ({ size = 'small', variant = 'primary' }) => (
  <span className={`loader-inline loader-${size} loader-${variant}`}>
    <span className="loader-spinner"></span>
  </span>
);

// Dots loader
export const DotsLoader = ({ variant = 'primary' }) => (
  <div className={`loader-dots loader-${variant}`}>
    <span className="dot"></span>
    <span className="dot"></span>
    <span className="dot"></span>
  </div>
);

export default Loader;