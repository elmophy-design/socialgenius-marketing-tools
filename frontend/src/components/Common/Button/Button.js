/**
 * Button.jsx - Reusable Button Component
 * Matches your project's blue theme (#004aad) UI/UX
 */

import React from 'react';
import './Button.css';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary', // primary, secondary, outline, danger, success, google
  size = 'medium', // small, medium, large
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  className = '',
  ...props
}) => {
  const buttonClass = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    disabled && 'btn-disabled',
    className
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn-spinner"></span>
          <span className="btn-loading-text">{children}</span>
        </>
      ) : (
        <>
          {icon && <span className="btn-icon">{icon}</span>}
          <span className="btn-text">{children}</span>
        </>
      )}
    </button>
  );
};

export default Button;