import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../../css/Auth.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function normalizeErrorMessage(value, fallback = 'Failed to reset password. Please try again.') {
  if (!value) {
    return fallback;
  }

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => normalizeErrorMessage(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }

  if (typeof value === 'object') {
    if (typeof value.message === 'string') {
      return value.message;
    }

    const joined = Object.values(value)
      .map((item) => normalizeErrorMessage(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }

  return fallback;
}

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: 'weak',
    feedback: []
  });
  const errorMessage = normalizeErrorMessage(error, '');
  const safeFeedback = Array.isArray(passwordStrength.feedback)
    ? passwordStrength.feedback
        .map((tip) => normalizeErrorMessage(tip, ''))
        .filter(Boolean)
    : [];

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
    }
  }, [token]);

  useEffect(() => {
    if (formData.password) {
      const password = formData.password;
      let score = 0;
      const feedback = [];

      if (password.length >= 8) {
        score += 25;
      } else {
        feedback.push('Use at least 8 characters');
      }

      if (/[A-Z]/.test(password)) {
        score += 25;
      } else {
        feedback.push('Add uppercase letters');
      }

      if (/[a-z]/.test(password)) {
        score += 25;
      } else {
        feedback.push('Add lowercase letters');
      }

      if (/[0-9]/.test(password)) {
        score += 25;
      } else {
        feedback.push('Add numbers');
      }

      let level = 'weak';
      if (score >= 75) level = 'strong';
      else if (score >= 50) level = 'good';
      else if (score >= 25) level = 'fair';

      setPasswordStrength({ score, level, feedback });
      return;
    }

    setPasswordStrength({
      score: 0,
      level: 'weak',
      feedback: []
    });
  }, [formData.password]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(normalizeErrorMessage(data.error || data.message || data.errors));
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="error-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="#dc3545" />
                  <line x1="15" y1="9" x2="9" y2="15" strokeWidth="2" strokeLinecap="round" stroke="#dc3545" />
                  <line x1="9" y1="9" x2="15" y2="15" strokeWidth="2" strokeLinecap="round" stroke="#dc3545" />
                </svg>
              </div>
              <h1>Invalid Reset Link</h1>
              <p>This password reset link is invalid or has expired</p>
            </div>

            <Link to="/forgot-password" className="auth-button">
              Request New Reset Link
            </Link>

            <div className="auth-footer" style={{ marginTop: '2rem' }}>
              <Link to="/login" className="auth-link">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="#28a745" />
                  <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#28a745" />
                </svg>
              </div>
              <h1>Password Reset Successful</h1>
              <p>Your password has been changed successfully</p>
            </div>

            <div className="success-message">
              <p>Redirecting you to the login page...</p>
            </div>

            <Link to="/login" className="auth-button">
              Continue to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link to="/login" className="back-link">
              Back to Sign In
            </Link>
            <h1>Set New Password</h1>
            <p>Enter your new password below</p>
          </div>

          {errorMessage && (
            <div className="error-message">
              <span>!</span> {errorMessage}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="8"
                  autoFocus
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {formData.password && (
                <div className="password-strength">
                  <div className="strength-text">
                    Strength: <strong className={`strength-${passwordStrength.level}`}>
                      {passwordStrength.level.charAt(0).toUpperCase() + passwordStrength.level.slice(1)}
                    </strong>
                  </div>
                  <div className="strength-bar">
                    <div
                      className={`strength-fill strength-${passwordStrength.level}`}
                      style={{ width: `${passwordStrength.score}%` }}
                    />
                  </div>
                  {safeFeedback.length > 0 && (
                    <ul className="strength-feedback">
                      {safeFeedback.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-button"
              disabled={loading}
            >
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
