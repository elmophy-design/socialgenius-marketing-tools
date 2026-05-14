/**
 * Input.jsx - Reusable Input Component
 * Matches your project's UI/UX
 */

import React, { useState } from 'react';
import './Input.css';

const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left', // left, right
  showPasswordToggle = false,
  className = '',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === 'password' && showPassword ? 'text' : type;

  const containerClass = [
    'input-container',
    fullWidth && 'input-full-width',
    error && 'input-has-error',
    disabled && 'input-disabled',
    isFocused && 'input-focused',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  return (
    <div className={containerClass}>
      {/* Label */}
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="input-wrapper">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <span className="input-icon input-icon-left">{icon}</span>
        )}

        {/* Input Field */}
        <input
          type={inputType}
          className={`input-field ${icon ? `input-with-icon-${iconPosition}` : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          required={required}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {type === 'password' && showPasswordToggle ? (
          <button
            type="button"
            className="input-password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="3" strokeWidth="2"/>
              </svg>
            )}
          </button>
        ) : (
          icon && iconPosition === 'right' && (
            <span className="input-icon input-icon-right">{icon}</span>
          )
        )}
      </div>

      {/* Error or Helper Text */}
      {error ? (
        <span className="input-error">{error}</span>
      ) : helperText ? (
        <span className="input-helper">{helperText}</span>
      ) : null}
    </div>
  );
};
  
export default Input;