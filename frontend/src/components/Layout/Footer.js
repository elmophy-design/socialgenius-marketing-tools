import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const FooterIcon = ({ type }) => {
  switch (type) {
    case 'privacy':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      );
    case 'terms':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
      );
    case 'refund':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      );
    case 'security':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      );
    case 'trust':
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      );
    default:
      return null;
  }
};

const Footer = () => {
  return (
    <footer className="landing-footer-refined">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <img src="/logo.svg" alt="Meritlives Logo" className="footer-logo" />
            <span className="footer-brand-name">Meritlives AI Tools</span>
          </div>
          <p className="footer-tagline">Enterprise-grade marketing tools powered by next-generation AI.</p>
        </div>

        <div className="footer-nav-central">
          <div className="footer-nav-group">
            <Link to="/features" className="footer-nav-link">Features</Link>
            <Link to="/pricing" className="footer-nav-link">Pricing</Link>
            <Link to="/contact" className="footer-nav-link">Contact</Link>
            <Link to="/about" className="footer-nav-link">About Us</Link>
          </div>
        </div>

        <div className="footer-legal-grid">
          <Link to="/privacy" className="legal-link-card">
            <span className="legal-icon"><FooterIcon type="privacy" /></span>
            <span className="legal-text">Privacy Policy</span>
          </Link>
          <Link to="/terms" className="legal-link-card">
            <span className="legal-icon"><FooterIcon type="terms" /></span>
            <span className="legal-text">Terms of Service</span>
          </Link>
          <Link to="/refund-policy" className="legal-link-card">
            <span className="legal-icon"><FooterIcon type="refund" /></span>
            <span className="legal-text">Refund Policy</span>
          </Link>
          <Link to="/security" className="legal-link-card">
            <span className="legal-icon"><FooterIcon type="security" /></span>
            <span className="legal-text">Security</span>
          </Link>
          <Link to="/trust" className="legal-link-card">
            <span className="legal-icon"><FooterIcon type="trust" /></span>
            <span className="legal-text">Trust Center</span>
          </Link>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom-refined">
          <p className="copyright">&copy; {new Date().getFullYear()} Meritlives LLC. All rights reserved.</p>
          <div className="footer-badges-container">
            {/* The badges logic usually comes from FooterPaymentBadges, we'll keep it compatible */}
            <div className="payment-badges-minimal">
              <span className="badge-item">Secure Payments</span>
              <span className="badge-item">Data Encrypted</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
