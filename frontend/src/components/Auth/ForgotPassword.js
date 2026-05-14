import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthService from '../../services/authService';
import '../../css/Auth.css';

function normalizeErrorMessage(value, fallback = 'Failed to send reset instructions. Please try again.') {
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

function AuthBrand() {
  return (
    <div
      className="auth-logo"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1rem'
      }}
    >
      <img
        src="/logo.svg"
        alt="Meritlives AI Tools"
        style={{ width: '2.5rem', height: '2.5rem', display: 'block' }}
      />
      <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a202c' }}>
        Meritlives AI Tools
      </span>
    </div>
  );
}

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const errorMessage = normalizeErrorMessage(error, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const result = await AuthService.forgotPassword(email);

      if (result.success) {
        if (result.data && result.data.resetUrl) {
          console.log('Reset URL (dev):', result.data.resetUrl);
        }
        setSuccess(true);
      } else {
        setError(normalizeErrorMessage(result.error || result.message || result.data));
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <AuthBrand />
              <div className="success-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" stroke="#28a745" />
                  <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="#28a745" />
                </svg>
              </div>
              <h1 className="auth-title">Check Your Email</h1>
              <p className="auth-subtitle">
                We&apos;ve sent password reset instructions to <strong>{email}</strong>
              </p>
            </div>

            <div className="success-message">
              <p><strong>Didn&apos;t receive the email?</strong></p>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', textAlign: 'left' }}>
                <li>Check your spam folder</li>
                <li>Make sure you entered the correct email</li>
                <li>Wait a few minutes and try again</li>
              </ul>
            </div>

            <button
              className="btn-secondary"
              onClick={() => {
                setSuccess(false);
                setEmail('');
              }}
              style={{ marginBottom: '1rem', width: '100%' }}
            >
              Try Another Email
            </button>

            <div className="auth-footer">
              <Link to="/login" className="auth-link">
                Back to Sign In
              </Link>
            </div>
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
            <AuthBrand />
            <h1 className="auth-title">Reset Your Password</h1>
            <p className="auth-subtitle">
              Enter your email and we&apos;ll send you instructions to reset your password
            </p>
          </div>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              className={`btn-primary ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              <span>{loading ? '' : 'Send Reset Instructions'}</span>
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '2rem' }}>
            <Link to="/login" className="auth-link">
              Back to Sign In
            </Link>
          </div>

          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="auth-link">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
