import React, { useState, useEffect, useRef, createContext, useCallback, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
// Ai Icons (outlined variants)
import { AiOutlineRobot, AiOutlineBarChart, AiOutlineSearch, AiOutlineClockCircle, AiOutlineBulb, AiOutlineDollar, AiOutlineMobile, AiOutlineAudio, AiOutlineTool, AiOutlineBell, AiOutlineUser, AiOutlineSetting, AiOutlineCreditCard, AiOutlineLogout } from 'react-icons/ai';
// Material Design Icons (filled colored variants)
import { MdEmail, MdPhone, MdLocationOn, MdMessage } from 'react-icons/md';
// Remix Icons (colorful alternatives)
import { RiTwitterFill, RiLinkedinFill, RiFacebookFill, RiInstagramFill } from 'react-icons/ri';
// Bootstrap Icons
import {
  BsChevronDown,
  BsBullseye,
  BsPeople,
  BsBookmarkStar,
  BsShare,
  BsCalendar2Week,
  BsTypeH1,
  BsSearch,
  BsEnvelopeOpen,
  BsLightbulb,
  BsMegaphone,
  BsDiagram3,
  BsCpu,
  BsBarChartLine,
  BsGraphUpArrow,
  BsGrid1X2
} from 'react-icons/bs';
import './css/App.css';
import './css/Dashboard.css';
import './css/Auth.css';
import './css/Landing.css';
import './css/Subscription.css';
import './css/Icons.css';
import './css/NotFound.css';

// ============================================
// IMPORT ALL MARKETING TOOLS
// ============================================
import ValuePropositionGenerator from './components/Tools/valueProposition/component/ValuePropositionGenerator';
import HeadlineAnalyzer from './components/Tools/HeadlineAnalyzer/component/HeadlineAnalyzer';
import SEOMetaGenerator from './components/Tools/SEOMetaGenerator/SEOMetaGenerator';
import EmailSubjectTester from './components/Tools/EmailSubjectTester/EmailSubjectTester';
import AdCopyGenerator from './components/Tools/AdCopyGenerator/AdCopyGenerator';
import ContentIdeaGenerator from './components/Tools/ContentIdeaGenerator/ContentIdeaGenerator';
import FunnelBuilder from './components/Tools/FunnelBuilder/FunnelBuilder';
import SocialMediaGenerator from './components/Tools/SocialMediaGenerator/SocialMediaGenerator';
import ToolPageShell from './components/Tools/ToolPageShell';

// ============================================
// IMPORT AUTH COMPONENTS
// ============================================
// Login/Signup pages are implemented inline as `LoginPage`/`SignupPage` in this file
// so we don't import the standalone components to avoid unused-import warnings.
import ForgotPassword from './components/Auth/ForgotPassword';
import ResetPassword from './components/Auth/ResetPassword';
import Profile from './components/Auth/Profile';
import ComingSoonModal from './components/Common/ComingSoonModal/ComingSoonModal';
import { userApi } from './api';
import { useNotification } from './contexts/NotificationContext';
import { PrivacyPage, TermsPage, RefundPolicyPage, SecurityPage, TrustCenterPage, AboutPage } from './components/Public/LegalPages';

// ============================================
// IMPORT SUBSCRIPTION COMPONENTS
// ============================================
import SubscriptionPlans from './components/Subscription/SubscriptionPlans';
import PaymentCallback from './components/Payment/PaymentCallback';
import Billing from './components/Subscription/Billing';
import UsageDashboard from './components/Subscription/UsageDashboard';
import GlobalPaymentGatewayHost from './components/Payment/GlobalPaymentGatewayHost';
import { openPaymentGateway } from './utils/paymentGateway';

// ============================================
// CONTEXT PROVIDERS
// ============================================

// Auth Context
export const AuthContext = createContext(null);
export const SubscriptionContext = createContext(null);

// ============================================
// UTILITY FUNCTIONS & CONSTANTS
// ============================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

function LegalLinks() {
  const navigate = useNavigate();
  const links = [
    { name: 'Privacy Policy', path: '/privacy', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
    )},
    { name: 'Terms of Service', path: '/terms', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
    )},
    { name: 'Refund Policy', path: '/refund-policy', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>
    )},
    { name: 'Security', path: '/security', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
    )},
    { name: 'Trust Center', path: '/trust', icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><line x1="9" y1="9" x2="9.01" y2="9" /><line x1="15" y1="9" x2="15.01" y2="9" /></svg>
    )}
  ];

  return (
    <div className="legal-links-container">
      <div className="legal-links-grid">
        {links.map((link) => (
          <div key={link.name} className="legal-link-item" onClick={() => navigate(link.path)}>
            <span className="legal-link-icon">{link.icon}</span>
            <span className="legal-link-name">{link.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FooterPaymentBadges() {
  return (
    <div className="footer-payment-strip" aria-label="Accepted payments">
      <span className="footer-payment-badge is-paystack">
        <span className="footer-payment-badge-icon"><img src="/payment-logos/paystack.svg" alt="Paystack" /></span>
        <span className="footer-payment-badge-copy">
          <strong>Paystack</strong>
          <small>Cards and bank transfer</small>
        </span>
      </span>
      <span className="footer-payment-badge is-paypal">
        <span className="footer-payment-badge-icon"><img src="/payment-logos/paypal.svg" alt="PayPal" /></span>
        <span className="footer-payment-badge-copy">
          <strong>PayPal</strong>
          <small>Global checkout</small>
        </span>
      </span>
      <span className="footer-payment-badge is-card">
        <span className="footer-payment-badge-icon"><img src="/payment-logos/visa.svg" alt="Visa" /></span>
        <span className="footer-payment-badge-copy">
          <strong>Visa</strong>
          <small>Secure card payments</small>
        </span>
      </span>
      <span className="footer-payment-badge is-card">
        <span className="footer-payment-badge-icon"><img src="/payment-logos/mastercard.svg" alt="Mastercard" /></span>
        <span className="footer-payment-badge-copy">
          <strong>Mastercard</strong>
          <small>Accepted worldwide</small>
        </span>
      </span>
    </div>
  );
}

// Subscription plans
const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Free Trial',
    price: 0,
    features: [
      '7-day free access to all tools',
      'Limited usage per tool',
      'Basic AI capabilities',
      'Email support',
      'Export functionality'
    ],
    limits: {
      dailyRequests: 20,
      socialMediaPosts: 3,
      aiGenerations: 10,
      storage: '100MB'
    }
  },
  basic: {
    name: 'Basic',
    price: 29,
    interval: 'month',
    features: [
      'All tools unlocked',
      'Unlimited AI generations',
      '50 social media posts/month',
      'Priority email support',
      'Advanced analytics',
      'Team collaboration (up to 3 users)'
    ],
    limits: {
      dailyRequests: 100,
      socialMediaPosts: 50,
      aiGenerations: 'unlimited',
      storage: '5GB'
    }
  },
  premium: {
    name: 'Premium',
    price: 79,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Unlimited social media posts',
      'Advanced AI models (GPT-4)',
      'Priority phone support',
      'Custom templates',
      'API access',
      'Team collaboration (up to 10 users)',
      'White-label option'
    ],
    limits: {
      dailyRequests: 500,
      socialMediaPosts: 'unlimited',
      aiGenerations: 'unlimited',
      storage: '50GB'
    }
  },
  enterprise: {
    name: 'Enterprise',
    price: 299,
    interval: 'month',
    features: [
      'Everything in Premium',
      'Unlimited everything',
      'Dedicated account manager',
      'Custom AI model training',
      'SLA guarantee',
      'On-premise deployment',
      'Custom integrations',
      'Unlimited team members'
    ],
    limits: {
      dailyRequests: 'unlimited',
      socialMediaPosts: 'unlimited',
      aiGenerations: 'unlimited',
      storage: 'unlimited'
    }
  }
};
// ============================================
// PROTECTED ROUTE COMPONENT
// ============================================

const ProtectedRoute = ({ children, requireSubscription = false, requiredPlan = 'basic' }) => {
  const { user, loading } = useContext(AuthContext);
  const subscriptionContext = useContext(SubscriptionContext);
  const subLoading = subscriptionContext?.loading;
  const subscription = subscriptionContext;
  const currentLocation = useLocation();
  const hasActiveSubscription = subscription && ['active', 'trialing'].includes(subscription.status);

  if (loading || subLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: currentLocation }} replace />;
  }

  if (requireSubscription) {
    if (!subscription || !hasActiveSubscription) {
      return <Navigate to="/subscription" state={{ from: currentLocation }} replace />;
    }

    // Check plan requirements
    const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      return <Navigate to="/upgrade" state={{ requiredPlan, from: currentLocation }} replace />;
    }
  }

  return children;
};

// ============================================
// PRICING PAGE (PUBLIC)
// ============================================

function PricingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  return (
    
    <div className="pricing-page">
      <header className="landing-header">
        <nav className="landing-nav">
              <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <img 
                src="/logo.svg" 
                alt="Meritlives Logo" 
                style={{height: '2.2rem', width: '2.2rem', display: 'block'}} 
              />
            </span>
            <span style={{fontWeight: 700, fontSize: '1.7rem', letterSpacing: '0.5px'}}>
              Meritlives AI Tools
            </span>
          </div>
          
          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="nav-actions">
            <button onClick={() => navigate('/login')} className="btn-outline">
              Sign In
            </button>
            <button onClick={() => navigate('/signup')} className="btn-primary">
              Start Free Trial
            </button>
          </div>
        </nav>
      </header>

      <main className="pricing-main">
        <div className="pricing-hero">
          <h1>Simple, Transparent Pricing</h1>
          <p>Start with a 7-day free trial. No credit card required.</p>
        </div>

        <div className="pricing-grid">
          {/* Show ALL 4 plans including trial */}
          {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
            <div key={key} className={`pricing-card ${key === 'premium' ? 'featured' : ''}`}>
              {key === 'premium' && (
                <div className="featured-badge">Most Popular</div>
              )}
              
              <div className="plan-name">{plan.name}</div>
              
              <div className="plan-price">
                <span className="price">${plan.price}</span>
                {key !== 'trial' && (
                  <span className="interval">/{plan.interval}</span>
                )}
              </div>
              
              <ul className="plan-features">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              
              <button 
                onClick={() => {
                  if (user) {
                    if (key === 'trial') {
                      // For trial, go to dashboard if already signed up
                      navigate('/dashboard');
                    } else {
                      openPaymentGateway({ planId: key, planLabel: plan.name });
                    }
                  } else {
                    // For new users, always go to signup
                    navigate('/signup');
                  }
                }}
                className={`pricing-btn ${key === 'premium' ? 'primary' : 'secondary'}`}
              >
                {key === 'trial' ? 'Start Free Trial' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section with 6 items */}
        <div className="pricing-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>Can I cancel anytime?</h3>
              <p>Yes, you can cancel your subscription at any time. No questions asked.</p>
            </div>
            <div className="faq-item">
              <h3>What's included in the free trial?</h3>
              <p>Full access to all tools and features for 7 days. No credit card required.</p>
            </div>
            <div className="faq-item">
              <h3>Do you offer discounts for teams?</h3>
              <p>Yes! Contact our sales team for custom enterprise pricing and team discounts.</p>
            </div>
            <div className="faq-item">
              <h3>Is there a money-back guarantee?</h3>
              <p>Yes, we offer a 14-day money-back guarantee on all paid plans.</p>
            </div>
            <div className="faq-item">
              <h3>Can I upgrade or downgrade my plan?</h3>
              <p>Yes, you can change your plan at any time. Changes take effect immediately.</p>
            </div>
            <div className="faq-item">
              <h3>What payment methods do you accept?</h3>
              <p>We accept all major credit cards (Visa, Mastercard, Amex) and PayPal.</p>
            </div>
          </div>
        </div>
      </main>
       {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/security">Security</a>
            <a href="/trust">Trust Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Meritlives LLC. All rights reserved.</p>
          <FooterPaymentBadges />
        </div>
      </footer>
    </div>
    
  );
}
// ============================================
// CONTACT PAGE (PUBLIC)
// ============================================

function ContactPage() {
  const navigate = useNavigate();
  const notify = useNotification();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }
    
    // Actual API call
    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        notify.success(data.message || 'Your message has been sent. Our team will reply as soon as possible.');
        setFormData({ name: '', email: '', subject: '', message: '' });
        // Reset success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to send message');
        notify.error(data.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Contact submit error:', err);
      setError('An error occurred. Please try again later.');
      notify.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <img 
                src="/logo.svg" 
                alt="Meritlives Logo" 
                style={{height: '2.2rem', width: '2.2rem', display: 'block'}} 
              />
            </span>
            <span style={{fontWeight: 700, fontSize: '1.7rem', letterSpacing: '0.5px'}}>
              Meritlives AI Tools
            </span>
          </div>

       <div className="nav-links">
  <Link to="/features">Features</Link>                {/* Will cause page reload */}
  <Link to="/pricing">Pricing</Link>                  {/* Proper SPA navigation */}
  <a href="#tools" onClick={(e) => {
    e.preventDefault();
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  }}>Tools</a>                                        {/* Smooth scroll to section */}
  <Link to="/contact">Contact</Link>                  {/* Proper SPA navigation */}
</div>
          <div className="nav-actions">
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/login')}
              style={{marginRight: '0.7em'}}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M10.09 15.59L8.67 17l-5-5 5-5 1.41 1.41L6.83 11H20v2H6.83l3.26 3.59z"/></svg>
              </span>
              Login
            </button>
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/signup')}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              </span>
              Signup for Free
            </button>
          </div>
        </nav>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="contact-hero-section">
          <div className="contact-hero-content">
            <h1>Get In Touch With Us</h1>
            <p>Have questions about our AI marketing tools? We're here to help you succeed.</p>
            <div className="contact-stats">
              <div className="contact-stat">
                <span className="stat-number">24/7</span>
                <span className="stat-label">Support Response</span>
              </div>
              <div className="contact-stat">
                <span className="stat-number">&lt; 2 hours</span>
                <span className="stat-label">Average Response Time</span>
              </div>
              <div className="contact-stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        <div className="contact-container">
          {/* Contact Info & Form */}
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info-section">
              <h2>Contact Information</h2>
              <p className="contact-subtitle">
                Reach out to us through any of these channels. Our team is ready to assist you.
              </p>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="method-icon" style={{color: '#e11d48'}}>{React.createElement(MdEmail, {size: 32})}</div>
                  <div className="method-details">
                    <h3>Email Us</h3>
                    <p>For general inquiries and support</p>
                    <a href="mailto:support@meritlives.com" className="method-link">
                      support@meritlives.com
                    </a>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon" style={{color: '#059669'}}>{React.createElement(MdPhone, {size: 32})}</div>
                  <div className="method-details">
                    <h3>Call Us</h3>
                    <p>Mon-Fri, 9AM-6PM EST</p>
                    <a href="tel:+18885551234" className="method-link">
                      +1 (888) 555-1234
                    </a>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon" style={{color: '#2563eb'}}>{React.createElement(MdLocationOn, {size: 32})}</div>
                  <div className="method-details">
                    <h3>Visit Our Office</h3>
                    <p>123 Tech Street, Suite 500</p>
                    <p className="method-address">San Francisco, CA 94107</p>
                  </div>
                </div>
                
                <div className="contact-method">
                  <div className="method-icon" style={{color: '#1d4ed8'}}>{React.createElement(MdMessage, {size: 32})}</div>
                  <div className="method-details">
                    <h3>Live Chat</h3>
                    <p>Available during business hours</p>
                    <button className="chat-btn" onClick={() => notify.info('Live chat is coming soon. Email support is available right now.')}>
                      Start Chat
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="social-links">
                <h3>Follow Us</h3>
                <div className="social-icons">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#1DA1F2"}} title="Twitter">{React.createElement(RiTwitterFill, {size: 24})}</a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#0A66C2"}} title="LinkedIn">{React.createElement(RiLinkedinFill, {size: 24})}</a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#1877F2"}} title="Facebook">{React.createElement(RiFacebookFill, {size: 24})}</a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon" style={{color: "#E4405F"}} title="Instagram">{React.createElement(RiInstagramFill, {size: 24})}</a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2>Send Us a Message</h2>
              <p className="form-subtitle">
                Fill out the form below and we'll get back to you as soon as possible.
              </p>
              {success && (
                <div className="success-message">
                  <span>Success:</span> Message sent successfully. We will be in touch shortly.
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span>Notice:</span> {error}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help you?"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your project or questions..."
                    rows="6"
                    required
                  ></textarea>
                </div>
                
                <div className="form-group">
                  <label className="checkbox">
                    <input type="checkbox" required />
                    <span>
                      I agree to the <a href="/privacy">Privacy Policy</a> and consent to receiving communications.
                    </span>
                  </label>
                </div>
                
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Sending Message...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          {/* FAQ Section */}
          <section className="contact-faq-section">
            <h2>Common Questions</h2>
            <div className="faq-grid">
              <div className="faq-item">
                <h3>Do you offer custom enterprise solutions?</h3>
                <p>Yes, we provide custom AI model training, white-label solutions, and API integrations for enterprise clients. Contact our sales team for a custom quote.</p>
              </div>
              <div className="faq-item">
                <h3>What's your typical response time?</h3>
                <p>Our support team responds to all inquiries within 2 hours during business hours (9AM-6PM EST, Mon-Fri).</p>
              </div>
              <div className="faq-item">
                <h3>Do you offer training or onboarding?</h3>
                <p>Yes, we provide comprehensive onboarding sessions and training materials for all new customers, with premium support available for enterprise plans.</p>
              </div>
              <div className="faq-item">
                <h3>Can I integrate your API with my existing tools?</h3>
                <p>Absolutely! Our REST API allows seamless integration with your existing marketing stack. Documentation is available for all subscription levels.</p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <section className="contact-cta-section">
          <div className="cta-content">
            <h2>Ready to Transform Your Marketing?</h2>
            <p>Start your 7-day free trial and experience the power of AI-driven marketing tools.</p>
            <div className="cta-actions">
              <button onClick={() => navigate('/signup')} className="btn-primary btn-xl">
                Start Free Trial
              </button>
              <button onClick={() => navigate('/pricing')} className="btn-outline btn-xl">
                View Pricing Plans
              </button>
            </div>
          </div>
        </section>
        <LegalLinks />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/security">Security</a>
            <a href="/trust">Trust Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Meritlives LLC. All rights reserved.</p>
          <FooterPaymentBadges />
        </div>
      </footer>
    </div>
  );
}
// ============================================
// LOADING SCREEN COMPONENT
// ============================================

const LoadingScreen = () => (
  <div className="loading-screen">
    <div className="loading-spinner"></div>
    <p>Loading your workspace...</p>
  </div>
);

// Dummy UpgradePage for missing import
const UpgradePage = () => <SubscriptionPlans mode="upgrade" />;

// ============================================
// MAIN APP COMPONENT WITH PROVIDERS
// ============================================

function App() {
  const [auth, setAuth] = useState({
    user: null,
    token: null,
    loading: true
  });

  const [subscription, setSubscription] = useState({
    plan: null,
    status: null,
    expiresAt: null,
    trialEndsAt: null,
    loading: true
  });

  const [usage, setUsage] = useState({
    dailyRequests: 0,
    monthlyRequests: 0,
    socialMediaPosts: 0,
    aiGenerations: 0,
    storageUsed: 0
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize auth
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      const subscriptionData = localStorage.getItem('subscription');

      if (token && userData) {
        try {
          // Verify token is not expired
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuth({ user: null, token: null, loading: false });
            return;
          }

          const parsedUser = JSON.parse(userData);
          setAuth({
            user: parsedUser,
            token,
            loading: false
          });

          // Load subscription data
          if (subscriptionData) {
            const sub = JSON.parse(subscriptionData);
            // Normalize field names
            const normalized = {
              ...sub,
              trialEndsAt: sub.trialEndsAt || sub.trialEndDate,
              trialEndDate: sub.trialEndDate || sub.trialEndsAt
            };
            setSubscription({ ...normalized, loading: false });
          }
          
          // Always fetch fresh subscription data from API
          await fetchSubscription(token);

          // Fetch usage data
          await fetchUsageData(token);

        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('subscription');
          setAuth({ user: null, token: null, loading: false });
          setSubscription({ plan: null, status: null, expiresAt: null, loading: false });
        }
      } else {
        setAuth({ user: null, token: null, loading: false });
        setSubscription({ plan: null, status: null, expiresAt: null, loading: false });
      }
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (!auth.loading && subscription.loading) {
      setSubscription(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, [auth.loading, subscription.loading]);

  // API functions
  const fetchSubscription = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const subscriptionData = data.subscription || data;
        
        console.log('Subscription data received:', subscriptionData);
        
        // Normalize field names - ensure both trialEndsAt and trialEndDate are set
        const normalized = {
          ...subscriptionData,
          trialEndsAt: subscriptionData.trialEndsAt || subscriptionData.trialEndDate,
          trialEndDate: subscriptionData.trialEndDate || subscriptionData.trialEndsAt
        };
        
        console.log('Normalized subscription:', normalized);
        
        setSubscription({ ...normalized, loading: false });
        localStorage.setItem('subscription', JSON.stringify(normalized));
      } else {
        console.error('Subscription API error:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    }
  };

  const fetchUsageData = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/usage`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUsage(data);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    }
  };

  const fetchNotifications = useCallback(async () => {
    if (!auth.token) return;
    try {
      const result = await userApi.getNotifications();
      if (result.success) {
        setNotifications(result.data);
        setUnreadCount(result.unreadCount);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, [auth.token]);

  // Poll for notifications every 60 seconds when logged in
  useEffect(() => {
    let interval;
    if (auth.token) {
      fetchNotifications();
      interval = setInterval(fetchNotifications, 60000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [auth.token]);

  const completeAuthSession = async (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    setAuth({
      user,
      token,
      loading: false
    });

    await fetchSubscription(token);
    await fetchUsageData(token);
    await fetchNotifications();

    return { success: true };
  };

  // Auth actions
  const login = async (email, password) => {
    try {
      console.log('[LOGIN] calling', `${API_BASE_URL}/auth/login`, { email });
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      console.log('[LOGIN] response', response.status, data);
      const authPayload = data?.data || data;
      const token = authPayload?.token || data?.token;
      const user = authPayload?.user || data?.user;

      if (response.ok && data.success && token && user) {
        await completeAuthSession(token, user);

        return { success: true, data };
      } else {
        return { success: false, error: data.error || data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('[LOGIN] CATCH ERROR:', error?.message, error);
      return { success: false, error: error?.message || 'Network error. Please try again.' };
    }
  };

  const socialLogin = async (token, user) => {
    try {
      if (!token) {
        return { success: false, error: 'Missing social login session token.' };
      }

      let resolvedUser = user;

      if (!resolvedUser) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();
        const fetchedUser = data?.user;

        if (!response.ok || !data?.success || !fetchedUser) {
          return { success: false, error: data?.message || data?.error || 'Unable to load your account after Google sign-in.' };
        }

        resolvedUser = fetchedUser;
      }

      await completeAuthSession(token, resolvedUser);
      return { success: true };
    } catch (error) {
      console.error('[SOCIAL LOGIN] CATCH ERROR:', error?.message, error);
      return { success: false, error: error?.message || 'Social login failed. Please try again.' };
    }
  };

  const signup = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      const authPayload = data?.data || data;
      const token = authPayload?.token || data?.token;
      const user = authPayload?.user || data?.user;

      if (response.ok && data.success && token && user) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setAuth({
          user,
          token,
          loading: false
        });

        // New users get 7-day trial
        const trialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const trialSubscription = {
          plan: 'trial',
          status: 'active',
          trialEndsAt: trialEndsAt.toISOString(),
          expiresAt: trialEndsAt.toISOString(),
          loading: false
        };

        setSubscription(trialSubscription);
        localStorage.setItem('subscription', JSON.stringify(trialSubscription));

        return { success: true, data };
      } else {
        return { success: false, error: data.error || data.message || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
    setAuth({ user: null, token: null, loading: false });
    setSubscription({ plan: null, status: null, expiresAt: null, loading: false });
    setUsage({
      dailyRequests: 0,
      monthlyRequests: 0,
      socialMediaPosts: 0,
      aiGenerations: 0,
      storageUsed: 0
    });
  };

  const updateUser = (userData) => {
    setAuth(prev => {
      const nextUser = { ...(prev.user || {}), ...(userData || {}) };
      localStorage.setItem('user', JSON.stringify(nextUser));

      return {
        ...prev,
        user: nextUser
      };
    });
  };

  const updateSubscription = (newSubscription) => {
    setSubscription({ ...newSubscription, loading: false });
    localStorage.setItem('subscription', JSON.stringify(newSubscription));
  };

  const updateUsage = (tool, count = 1) => {
    setUsage(prev => ({
      ...prev,
      [tool]: prev[tool] + count,
      monthlyRequests: prev.monthlyRequests + count
    }));
  };

  const getEffectiveTrialEndDate = () => {
    if (subscription?.plan === 'trial') {
      let fallbackTrialDate = null;
      const createdAt = auth?.user?.createdAt;
      if (createdAt) {
        const signupDate = new Date(createdAt);
        if (!Number.isNaN(signupDate.getTime())) {
          fallbackTrialDate = new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
      }

      const explicitTrialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
      if (explicitTrialDate) {
        const parsedTrialDate = new Date(explicitTrialDate);
        if (!Number.isNaN(parsedTrialDate.getTime())) {
          if (!fallbackTrialDate || parsedTrialDate > fallbackTrialDate) {
            return parsedTrialDate;
          }
        }
      }

      return fallbackTrialDate;
    }

    const explicitTrialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
    if (explicitTrialDate) {
      const parsedTrialDate = new Date(explicitTrialDate);
      if (!Number.isNaN(parsedTrialDate.getTime())) {
        return parsedTrialDate;
      }
    }

    return null;
  };

  // Check if user can access tool
  const canAccessTool = (toolId, requiredPlan = 'basic') => {
    if (!auth.user) return { canAccess: false, reason: 'login' };
    const hasActiveSubscription = subscription.plan && ['active', 'trialing'].includes(subscription.status);
    
    if (!hasActiveSubscription) {
      return { canAccess: false, reason: 'subscription' };
    }

    // Check trial expiry
    if (subscription.plan === 'trial') {
      const effectiveTrialEndDate = getEffectiveTrialEndDate();
      if (effectiveTrialEndDate && effectiveTrialEndDate < new Date()) {
        return { canAccess: false, reason: 'trial_expired' };
      }
    }

    if (subscription.plan === 'trial' && toolId !== 'social-media') {
      return { canAccess: true };
    }

    // Check plan requirements
    const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

    if (userPlanIndex < requiredPlanIndex) {
      return { canAccess: false, reason: 'upgrade_required', requiredPlan };
    }

    // Check usage limits
    const limits = SUBSCRIPTION_PLANS[subscription.plan]?.limits || {};
    
    // Social media generator has special limits
    if (toolId === 'social-media') {
      if (limits.socialMediaPosts !== 'unlimited' && usage.socialMediaPosts >= limits.socialMediaPosts) {
        return { canAccess: false, reason: 'limit_reached', limit: 'socialMediaPosts' };
      }
    }

    if (limits.dailyRequests !== 'unlimited' && usage.dailyRequests >= limits.dailyRequests) {
      return { canAccess: false, reason: 'limit_reached', limit: 'dailyRequests' };
    }

    return { canAccess: true };
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, signup, logout, updateUser, socialLogin }}>
      <SubscriptionContext.Provider value={{ ...subscription, updateSubscription, usage, updateUsage, canAccessTool }}>
        <Router>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/refund-policy" element={<RefundPolicyPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/trust" element={<TrustCenterPage />} />
            <Route path="/about" element={<AboutPage />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard 
                  notifications={notifications} 
                  unreadCount={unreadCount} 
                  fetchNotifications={fetchNotifications} 
                />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute>
                <Billing />
              </ProtectedRoute>
            } />
            <Route path="/usage" element={
              <ProtectedRoute>
                <UsageDashboard />
              </ProtectedRoute>
            } />

            {/* Subscription Routes */}
            <Route path="/subscription" element={
              <ProtectedRoute>
                <SubscriptionPlans />
              </ProtectedRoute>
            } />
            <Route path="/upgrade" element={
              <ProtectedRoute>
                <UpgradePage />
              </ProtectedRoute>
            } />
            <Route path="/payment/callback" element={
              <ProtectedRoute>
                <PaymentCallback />
              </ProtectedRoute>
            } />

            {/* Tool Routes with Protection */}
            <Route path="/tools/value-proposition" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="value-proposition">
                  <ValuePropositionGenerator />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/headline-analyzer" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="headline-analyzer">
                  <HeadlineAnalyzer />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/seo-meta" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="seo-meta">
                  <SEOMetaGenerator />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/email-tester" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="email-tester">
                  <EmailSubjectTester />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/content-idea" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="content-idea">
                  <ContentIdeaGenerator />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/ad-copy" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="ad-copy">
                  <AdCopyGenerator />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            <Route path="/tools/funnel-builder" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="funnel-builder">
                  <FunnelBuilder />
                </ToolPageShell>
              </ProtectedRoute>
            } />
            
            {/* Social Media Generator - temporarily unlocked for testing */}
            <Route path="/tools/social-media" element={
              <ProtectedRoute requireSubscription requiredPlan="trial">
                <ToolPageShell toolKey="social-media">
                  <SocialMediaGenerator />
                </ToolPageShell>
              </ProtectedRoute>
            } />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          <GlobalPaymentGatewayHost />
        </Router>
      </SubscriptionContext.Provider>
    </AuthContext.Provider>
  );
}

// ============================================
// LANDING PAGE (PUBLIC)
// ============================================
// ============================================
// 404 PAGE
// ============================================

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <div className="not-found-actions">
          <button onClick={() => navigate(-1)} className="btn-outline">
            Go Back
          </button>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
  <div className="landing-page">
    <header className="landing-header">
      <nav className="landing-nav">
        <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className="logo-icon">
            <img 
              src="/logo.svg" 
              alt="Meritlives Logo" 
              style={{height: '2.2rem', width: '2.2rem', display: 'block'}} 
            />
          </span>
          <span style={{fontWeight: 700, fontSize: '1.7rem', letterSpacing: '0.5px'}}>
            Meritlives AI Tools
          </span>
        </div>
        
       <div className="nav-links">
  <Link to="/features">Features</Link>                {/* Will cause page reload */}
  <Link to="/pricing">Pricing</Link>                  {/* Proper SPA navigation */}
  <a href="#tools" onClick={(e) => {
    e.preventDefault();
    document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
  }}>Tools</a>                                        {/* Smooth scroll to section */}
  <Link to="/contact">Contact</Link>                  {/* Proper SPA navigation */}
</div>
          <div className="nav-actions">
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/login')}
              style={{marginRight: '0.7em'}}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M10.09 15.59L8.67 17l-5-5 5-5 1.41 1.41L6.83 11H20v2H6.83l3.26 3.59z"/></svg>
              </span>
              Login
            </button>
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/signup')}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              </span>
              Signup for Free
            </button>
          </div>
        </nav>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1>AI-Powered Marketing Suite for Modern Businesses</h1>
            <p>Create, analyze, and optimize marketing content with our comprehensive suite of AI tools. Start your 7-day free trial today.</p>
            <div className="hero-actions">
              <button onClick={() => navigate('/signup')} className="btn-primary btn-lg">
                Start Free Trial
              </button>
              <button onClick={() => navigate('/pricing')} className="btn-outline btn-lg">
                View Pricing
              </button>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">8</span>
                <span className="stat-label">Powerful Tools</span>
              </div>
              <div className="stat">
                <span className="stat-number">2.4k+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">10,000+</span>
                <span className="stat-label">Content Generated</span>
              </div>
              <div className="stat">
                <span className="stat-number">98%</span>
                <span className="stat-label">Customer Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <h2>Everything Is Under One Roof</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/feature-icons/ai-powered-generation.svg" alt="AI-powered generation" />
              </div>
              <h3>AI-Powered Generation</h3>
              <p>Generate high-quality content using advanced AI models including GPT-4 and Claude.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/feature-icons/advanced-analytics.svg" alt="Advanced analytics" />
              </div>
              <h3>Advanced Analytics</h3>
              <p>Get insights and optimization suggestions based on performance data.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/feature-icons/multi-platform.svg" alt="Multi-platform integration" />
              </div>
              <h3>Multi-Platform Integration</h3>
              <p>Create content optimized for different social media platforms and formats.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/feature-icons/enterprise-features.svg" alt="Enterprise features" />
              </div>
              <h3>Enterprise Features</h3>
              <p>Team collaboration, custom templates, API access, and white-label options.</p>
            </div>
          </div>
        </section>

        {/* Tools Preview */}
        <section id="tools" className="tools-preview-section">
          <h2>Our Marketing Tools Suite</h2>
          <div className="tools-preview-grid">
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsBullseye size={34} /></div>
              <h4>Value Proposition Generator</h4>
              <p>Create compelling value propositions</p>
            </div>
            <div className="tool-preview-card premium highlight-green-border">
              <div className="tool-preview-icon"><BsShare size={34} /></div>
              <h4>Social Media Generator</h4>
              <p>AI-powered multi-platform content</p>
              <span className="premium-badge">Premium</span>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsTypeH1 size={34} /></div>
              <h4>Headline Analyzer</h4>
              <p>Optimize headlines for engagement</p>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsSearch size={34} /></div>
              <h4>SEO Meta Generator</h4>
              <p>Create SEO-friendly meta content</p>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsEnvelopeOpen size={34} /></div>
              <h4>Email Subject Line Tester</h4>
              <p>Test and optimize email subject lines</p>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsLightbulb size={34} /></div>
              <h4>Content Idea Generator</h4>
              <p>Generate endless content ideas</p>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsMegaphone size={34} /></div>
              <h4>Ad Copy Generator</h4>
              <p>Create high-converting ad copy</p>
            </div>
            <div className="tool-preview-card">
              <div className="tool-preview-icon"><BsDiagram3 size={34} /></div>
              <h4>Marketing Funnel Builder</h4>
              <p>Build complete marketing funnels</p>
            </div>
          </div>
        </section>

        {/* Pricing CTA */}
        <section id="pricing" className="pricing-cta-section">
          <h2>Start Your 7-Day Free Trial</h2>
          <p>All features included. No credit card required.</p>
          <button onClick={() => navigate('/signup')} className="btn-primary btn-xl">
            Get Started Free
          </button>
          <p className="cta-note">Full access to all tools during trial period</p>
        </section>
        <LegalLinks />
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/security">Security</a>
            <a href="/trust">Trust Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Meritlives LLC. All rights reserved.</p>
          <FooterPaymentBadges />
        </div>
      </footer>
    </div>
  );
}

// ============================================
// NOTIFICATION DROPDOWN
// ============================================

function NotificationDropdown({ notifications, onMarkRead, onMarkAllRead, onClearAll, onClose }) {
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'subscription': return '💳';
      case 'login': return '🔐';
      case 'registration': return '🎉';
      case 'upgrade': return '🚀';
      case 'system': return '⚙️';
      default: return '🔔';
    }
  };

  return (
    <div className="notification-dropdown">
      <div className="notification-dropdown-header">
        <h3>Notifications</h3>
        <div className="notification-actions">
          <button onClick={onMarkAllRead} className="action-link">Mark all as read</button>
          <button onClick={onClearAll} className="action-link danger">Clear all</button>
        </div>
      </div>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <div className="notification-empty">
            <AiOutlineBell size={40} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification._id} 
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => !notification.read && onMarkRead(notification._id)}
            >
              <div className="notification-icon-wrapper">
                <span className="notification-type-icon">{getIcon(notification.type)}</span>
                {!notification.read && <span className="unread-dot"></span>}
              </div>
              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{getTimeAgo(notification.createdAt)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================
// DASHBOARD COMPONENT (PROTECTED)
// ============================================

function Dashboard({ notifications, unreadCount, fetchNotifications }) {
  const navigate = useNavigate();
  const notify = useNotification();
  const { user, logout, updateUser } = useContext(AuthContext);
  const subscriptionContext = useContext(SubscriptionContext);
  const { usage, canAccessTool } = subscriptionContext;
  const subscription = subscriptionContext;
  const [activeCategory, setActiveCategory] = useState('all');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationMenuOpen, setNotificationMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewTool, setPreviewTool] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profilePicture || user?.avatar || null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [selectedTheme, setSelectedTheme] = useState('System');
  const [resultsPerPage, setResultsPerPage] = useState('20');
  const [dangerAction, setDangerAction] = useState(null);
  const fileInputRef = useRef(null);
  const userMenuRef = useRef(null);
  const notificationMenuRef = useRef(null);

  const firstName = user?.name?.split(' ')[0] || 'User';
  const displayAvatar = profileImageUrl || user?.profilePicture || user?.avatar || null;

  useEffect(() => {
    setProfileImageUrl(user?.profilePicture || user?.avatar || null);
  }, [user?.profilePicture, user?.avatar]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
      if (notificationMenuRef.current && !notificationMenuRef.current.contains(event.target)) {
        setNotificationMenuOpen(false);
      }
    };

    if (userMenuOpen || notificationMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen, notificationMenuOpen]);

  const handleMarkRead = async (id) => {
    try {
      await userApi.markNotificationRead(id);
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await userApi.markAllNotificationsRead();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await userApi.clearNotifications();
      fetchNotifications();
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    }
  };

  const handleProfileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingAvatar(true);
      const result = await userApi.uploadAvatar(file);

      if (!result.success) {
        throw new Error(result.error || 'Failed to upload profile picture');
      }

      const uploadedUrl = result.data?.profilePicture;
      if (uploadedUrl) {
        setProfileImageUrl(uploadedUrl);
        if (updateUser) {
          updateUser({
            profilePicture: uploadedUrl,
            avatar: uploadedUrl,
          });
        }
      }
    } catch (error) {
      notify.error(error.message || 'Profile picture upload failed.');
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = '';
    }
  };

  const handleResetPassword = () => {
    if (!user?.email) {
      notify.error('No email address is available for this account.');
      return;
    }

    fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    })
      .then(async (response) => {
        const data = await response.json();

        if (response.ok && data.success) {
          notify.success(data.message || 'A password reset link has been sent to your email.');
          return;
        }

        notify.error(data.message || data.error || 'Unable to send a password reset link right now.');
      })
      .catch((error) => {
        console.error('Dashboard reset password error:', error);
        notify.error('Network error. Please try again.');
      });
  };

  const handleSaveSettings = () => {
    setSettingsOpen(false);
    notify.success('Your settings have been saved.');
  };

  const handleDeactivateAccount = () => {
    setDangerAction('deactivate');
  };

  const handleDeleteAccount = () => {
    setDangerAction('delete');
  };

  const confirmDangerAction = () => {
    if (dangerAction === 'deactivate') {
      notify.warning('Account deactivation requested.');
    }

    if (dangerAction === 'delete') {
      notify.warning('Account deletion requested.');
    }

    setDangerAction(null);
  };

  const handleExportData = () => {
    notify.info('Your data export request has been submitted.');
  };

  const handleViewLoginActivity = () => {
    notify.info('Detailed login activity is coming in a future release.');
  };

  const getDashboardTrialEndDate = () => {
    if (subscription?.plan === 'trial') {
      let fallbackTrialDate = null;
      const createdAt = user?.createdAt;
      if (createdAt) {
        const signupDate = new Date(createdAt);
        if (!Number.isNaN(signupDate.getTime())) {
          fallbackTrialDate = new Date(signupDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        }
      }

      const explicitTrialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
      if (explicitTrialDate) {
        const parsedTrialDate = new Date(explicitTrialDate);
        if (!Number.isNaN(parsedTrialDate.getTime())) {
          if (!fallbackTrialDate || parsedTrialDate > fallbackTrialDate) {
            return parsedTrialDate;
          }
        }
      }

      return fallbackTrialDate;
    }

    const explicitTrialDate = subscription?.trialEndDate || subscription?.trialEndsAt;
    if (explicitTrialDate) {
      const parsedTrialDate = new Date(explicitTrialDate);
      if (!Number.isNaN(parsedTrialDate.getTime())) {
        return parsedTrialDate;
      }
    }

    return null;
  };

  // Tools data with access requirements
  const tools = [
    {
      id: 'value-proposition',
      name: 'Value Proposition Generator',
      description: 'Create compelling value propositions that clearly communicate your unique business value.',
      icon: AiOutlineRobot,
      iconImage: '/tool-icons/value-proposition.svg',
      path: '/tools/value-proposition',
      categories: ['content', 'ai'],
      features: ['AI Powered', 'Email Export'],
      requiredPlan: 'basic'
    },
    {
      id: 'headline-analyzer',
      name: 'Headline Analyzer',
      description: 'Analyze and optimize headlines for maximum impact and engagement.',
      icon: AiOutlineBarChart,
      iconImage: '/tool-icons/headline-analyzer.svg',
      path: '/tools/headline-analyzer',
      categories: ['analysis', 'ai'],
      features: ['AI Powered', 'Engagement Score'],
      requiredPlan: 'basic'
    },
    {
      id: 'seo-meta',
      name: 'SEO Meta Generator',
      description: 'Generate optimized meta descriptions and titles for better SEO performance.',
      icon: AiOutlineSearch,
      iconImage: '/tool-icons/seo-meta.svg',
      path: '/tools/seo-meta',
      categories: ['content', 'analysis'],
      features: ['SEO Optimized', 'Length Check'],
      requiredPlan: 'basic'
    },
    {
      id: 'email-tester',
      name: 'Email Subject Line Tester',
      description: 'Test and optimize email subject lines for better open rates.',
      icon: AiOutlineClockCircle,
      iconImage: '/tool-icons/email-tester.svg',
      path: '/tools/email-tester',
      categories: ['analysis'],
      features: ['Open Rate Predict', 'Spam Check'],
      requiredPlan: 'basic'
    },
    {
      id: 'content-idea',
      name: 'Content Idea Generator',
      description: 'Generate endless content ideas and create comprehensive content calendars.',
      icon: AiOutlineBulb,
      iconImage: '/tool-icons/content-idea.svg',
      path: '/tools/content-idea',
      categories: ['content', 'planning', 'ai'],
      features: ['AI Powered', 'Calendar View'],
      requiredPlan: 'basic'
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      description: 'Create high-converting ad copy for multiple advertising platforms.',
      icon: AiOutlineDollar,
      iconImage: '/tool-icons/ad-copy.svg',
      path: '/tools/ad-copy',
      categories: ['content', 'ai'],
      features: ['AI Powered', 'Multi-Platform'],
      requiredPlan: 'basic'
    },
    {
      id: 'funnel-builder',
      name: 'Marketing Funnel Builder',
      description: 'Build complete marketing funnels with content suggestions for each stage.',
      icon: AiOutlineBarChart,
      iconImage: '/tool-icons/funnel-builder.svg',
      path: '/tools/funnel-builder',
      categories: ['planning'],
      features: ['Visual Builder', 'Stage Content'],
      requiredPlan: 'basic'
    },
    {
      id: 'social-media',
      name: 'Social Media Generator',
      description: 'AI-powered multi-platform content generation optimized for social media.',
      icon: AiOutlineMobile,
      iconImage: '/tool-icons/social-media.svg',
      path: '/tools/social-media',
      categories: ['content', 'social', 'ai'],
      features: ['AI Powered', 'Multi-Platform'],
      requiredPlan: 'trial'
    },
    {
      id: 'voice-to-speech-studio',
      name: 'Voice to Speech Studio',
      description: 'Turn voice ideas into polished studio-ready audio workflows with AI-assisted production.',
      icon: AiOutlineAudio,
      iconImage: '/tool-icons/voice-studio.svg',
      path: '#',
      categories: ['content', 'ai'],
      features: ['Voice Workflow', 'Coming Soon'],
      requiredPlan: 'basic',
      comingSoon: true
    },
    {
      id: 'skill-hub',
      name: 'Skill Hub',
      description: 'Build reusable prompt skills, team playbooks, and organized content workflows in one hub.',
      icon: AiOutlineTool,
      iconImage: '/tool-icons/skill-hub.svg',
      path: '#',
      categories: ['content', 'planning', 'ai'],
      features: ['Workflow Library', 'Coming Soon'],
      requiredPlan: 'basic',
      comingSoon: true
    }
  ];
  // Handle tool click with access check
  const handleToolClick = (tool) => {
    if (tool.comingSoon) {
      setPreviewTool(tool);
      return;
    }

    const access = canAccessTool(tool.id, tool.requiredPlan);
    
    if (!access.canAccess) {
      if (access.reason === 'login') {
        navigate('/login', { state: { from: tool.path } });
      } else if (access.reason === 'subscription') {
        openPaymentGateway({ planId: 'premium', planLabel: 'Premium' });
      } else if (access.reason === 'trial_expired') {
        openPaymentGateway({ planId: 'premium', planLabel: 'Premium' });
      } else if (access.reason === 'upgrade_required') {
        openPaymentGateway({ planId: tool.requiredPlan || 'premium', planLabel: tool.requiredPlan || 'Premium' });
      } else if (access.reason === 'limit_reached') {
        notify.warning(`You've reached your ${access.limit} limit for this period. Please upgrade your plan.`);
        openPaymentGateway({ planId: tool.requiredPlan || 'premium', planLabel: tool.requiredPlan || 'Premium' });
      }
      return;
    }
    
    navigate(tool.path);
  };

  // Filter tools by category
  const filteredTools = activeCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.categories.includes(activeCategory));

  // Calculate trial days remaining
  const getTrialDaysRemaining = () => {
    const trialEnd = getDashboardTrialEndDate();
    if (!trialEnd) return 7; // Default to 7 days if not set

    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(diffDays, 0);
  };

  const trialDaysRemaining = getTrialDaysRemaining();
  const connectedAccounts = usage.connectedAccounts ?? 0;
  const postsThisMonth = usage.socialMediaPosts ?? 0;
  const scheduledPosts = usage.scheduledPosts ?? 0;
  const availableToolsCount = tools.filter(tool => !tool.comingSoon && canAccessTool(tool.id, tool.requiredPlan).canAccess).length;
  const premiumLockedCount = tools.filter(tool => !tool.comingSoon && !canAccessTool(tool.id, tool.requiredPlan).canAccess).length;
  const dashboardFocus = connectedAccounts === 0
    ? {
        title: 'Connect your first channel',
        copy: 'Link a social account to unlock publishing workflows, scheduling, and performance tracking.',
        action: 'Open Social Tool',
        onClick: () => handleToolClick(tools.find(tool => tool.id === 'social-media'))
      }
    : postsThisMonth === 0
      ? {
          title: 'Create your first campaign asset',
          copy: 'Start with a headline, value proposition, or ad copy draft and build momentum from there.',
          action: 'Start with Ad Copy',
          onClick: () => handleToolClick(tools.find(tool => tool.id === 'ad-copy'))
        }
      : {
          title: 'Keep the workflow moving',
          copy: 'You have activity in progress. Review usage, schedule posts, or explore another AI tool.',
          action: 'View Usage',
          onClick: () => navigate('/usage')
        };

  return (
    <div className="dashboard">
      {/* Header with user menu */}
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="nav-left">
            <Link to="/dashboard" className="logo">
              <span className="logo-icon">
                <img 
                  src="/logo.svg" 
                  alt="Meritlives Logo" 
                  style={{height: '2.2rem', width: '2.2rem', display: 'block'}} 
                />
              </span>
              <span>Meritlives AI Tools</span>
            </Link>
            
            <div className="nav-links">
              <Link to="/dashboard" className="nav-link active">Dashboard</Link>
              <Link to="/tools/value-proposition" className="nav-link">Tools</Link>
              <Link to="/usage" className="nav-link">Usage</Link>
              <Link to="/billing" className="nav-link">Billing</Link>
            </div>
          </div>
          
          <div className="nav-right">
            {/* Subscription Status */}
            {subscription?.plan && (
              <div className="subscription-status">
                <div className={`plan-badge ${subscription.plan}`}>
                  {subscription.plan.toUpperCase()}
                </div>
                <span className="trial-days-badge">
                  {subscription?.plan === 'trial' ? `${trialDaysRemaining} DAYS LEFT` : 'ACTIVE'}
                </span>
              </div>
            )}

            <div className="notification-menu-container" ref={notificationMenuRef}>
              <button 
                className={`notification-button ${notificationMenuOpen ? 'active' : ''}`} 
                aria-label="Notifications"
                onClick={() => setNotificationMenuOpen(!notificationMenuOpen)}
              >
                <AiOutlineBell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {notificationMenuOpen && (
                <NotificationDropdown 
                  notifications={notifications}
                  onMarkRead={handleMarkRead}
                  onMarkAllRead={handleMarkAllRead}
                  onClearAll={handleClearAll}
                  onClose={() => setNotificationMenuOpen(false)}
                />
              )}
            </div>
            
            <div className="user-menu" ref={userMenuRef}>
              <div className={`user-info ${userMenuOpen ? 'open' : ''}`} onClick={() => setUserMenuOpen(!userMenuOpen)}>
                <div className="profile-pill">
                  <span className="profile-pill-icon">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Profile" className="profile-pill-avatar-img" />
                    ) : (
                      <AiOutlineUser size={16} />
                    )}
                  </span>
                  <span className="profile-pill-text">{firstName}</span>
                  <BsChevronDown className="dropdown-chevron" />
                </div>
              </div>
              
              <div className={`user-dropdown ${userMenuOpen ? 'open' : ''}`}>
                <div className="user-dropdown-header">
                  <div className="dropdown-profile-avatar">
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="Profile" className="dropdown-profile-avatar-img" />
                    ) : (
                      user?.name?.charAt(0).toUpperCase() || 'U'
                    )}
                  </div>
                  <div className="dropdown-profile-info">
                    <div className="dropdown-profile-name">{user?.name || user?.email}</div>
                    <div className="dropdown-profile-email">{user?.email}</div>
                    <span className={`plan-pill ${subscription?.plan || 'free'}`}>{subscription?.plan?.toUpperCase()}</span>
                  </div>
                </div>
                <Link to="/profile" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <AiOutlineUser className="dropdown-item-icon" />
                  <span>Profile</span>
                </Link>
                <button
                  type="button"
                  className="dropdown-item"
                  onClick={() => {
                    setSettingsOpen(true);
                    setUserMenuOpen(false);
                  }}
                >
                  <AiOutlineSetting className="dropdown-item-icon" />
                  <span>Quick Settings</span>
                </button>
                <Link to="/billing" className="dropdown-item" onClick={() => setUserMenuOpen(false)}>
                  <AiOutlineCreditCard className="dropdown-item-icon" />
                  <span>Billing</span>
                </Link>
                <div className="dropdown-divider"></div>
                <button onClick={() => { logout(); setUserMenuOpen(false); setSettingsOpen(false); }} className="dropdown-item logout">
                  <AiOutlineLogout className="dropdown-item-icon" />
                  <span>Logout</span>
                </button>
              </div>

              {settingsOpen && (
                <div className="settings-modal-overlay" onClick={() => setSettingsOpen(false)}>
                  <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="settings-modal-header">
                      <div>
                        <div className="settings-modal-title">Quick Settings</div>
                        <div className="settings-modal-subtitle">Manage account preferences without leaving your dashboard.</div>
                      </div>
                      <button className="popover-close" onClick={() => setSettingsOpen(false)}>&times;</button>
                    </div>
                    <div className="settings-modal-body">
                      <div className="settings-section">
                        <h4>Profile Picture Upload</h4>
                        <div className="settings-upload-row">
                          <div className="settings-avatar-preview">
                            {displayAvatar ? <img src={displayAvatar} alt="Profile" className="settings-avatar-img" /> : (user?.name?.charAt(0).toUpperCase() || 'U')}
                          </div>
                          <div>
                            <p>Upload a profile image</p>
                            <button type="button" className="settings-action-btn" onClick={handleProfileUploadClick} disabled={isUploadingAvatar}>
                              {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                            </button>
                            <input
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              style={{ display: 'none' }}
                              onChange={handleProfileImageChange}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="settings-section">
                        <h4>Password Reset</h4>
                        <button type="button" className="settings-action-btn" onClick={handleResetPassword}>Reset Password</button>
                      </div>
                      <div className="settings-section">
                        <h4>Notification Preferences</h4>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Email Notifications</span>
                            <span>Receive updates about your account</span>
                          </div>
                          <label className="settings-switch">
                            <input type="checkbox" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                            <span className="settings-slider"></span>
                          </label>
                        </div>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Push Notifications</span>
                            <span>Get alerts for new features</span>
                          </div>
                          <label className="settings-switch">
                            <input type="checkbox" checked={pushNotifications} onChange={() => setPushNotifications(!pushNotifications)} />
                            <span className="settings-slider"></span>
                          </label>
                        </div>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Marketing Emails</span>
                            <span>Receive tips and promotional content</span>
                          </div>
                          <label className="settings-switch">
                            <input type="checkbox" checked={marketingEmails} onChange={() => setMarketingEmails(!marketingEmails)} />
                            <span className="settings-slider"></span>
                          </label>
                        </div>
                      </div>
                      <div className="settings-section">
                        <h4>Privacy & Security</h4>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Two-Factor Authentication</span>
                            <span>Add an extra layer of security</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}>
                            {twoFactorEnabled ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Login Activity</span>
                            <span>View recent account activity</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={handleViewLoginActivity}>View</button>
                        </div>
                        <div className="settings-toggle-row">
                          <div>
                            <span>Data Export</span>
                            <span>Download your account data</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={handleExportData}>Export</button>
                        </div>
                      </div>
                      <div className="settings-section">
                        <h4>Application Settings</h4>
                        <div className="settings-select-row">
                          <label>
                            Language
                            <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)}>
                              <option>English</option>
                              <option>Spanish</option>
                              <option>French</option>
                              <option>German</option>
                            </select>
                          </label>
                        </div>
                        <div className="settings-select-row">
                          <label>
                            Theme
                            <select value={selectedTheme} onChange={(e) => setSelectedTheme(e.target.value)}>
                              <option>System</option>
                              <option>Light</option>
                              <option>Dark</option>
                            </select>
                          </label>
                        </div>
                        <div className="settings-select-row">
                          <label>
                            Results Per Page
                            <select value={resultsPerPage} onChange={(e) => setResultsPerPage(e.target.value)}>
                              <option value="10">10</option>
                              <option value="20">20</option>
                              <option value="50">50</option>
                            </select>
                          </label>
                        </div>
                      </div>
                      <div className="settings-section">
                        <h4>Billing Information</h4>
                        <div className="settings-action-row">
                          <div>
                            <span>Payment Method</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={() => navigate('/billing')}>Edit</button>
                        </div>
                        <div className="settings-action-row">
                          <div>
                            <span>Billing Address</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={() => navigate('/billing')}>Edit</button>
                        </div>
                        <div className="settings-action-row">
                          <div>
                            <span>Invoice History</span>
                            <span>View and download past invoices</span>
                          </div>
                          <button type="button" className="settings-action-btn" onClick={() => navigate('/billing')}>View</button>
                        </div>
                      </div>
                      <div className="settings-section danger-section">
                        <h4>Danger Zone</h4>
                        <div className="settings-action-row">
                          <button type="button" className="settings-danger-btn" onClick={handleDeactivateAccount}>Deactivate Account</button>
                          <span>Temporarily disable your account</span>
                        </div>
                        <div className="settings-action-row">
                          <button type="button" className="settings-danger-btn delete" onClick={handleDeleteAccount}>Delete Account</button>
                          <span>Permanently delete your account and all data</span>
                        </div>
                      </div>
                      <div className="settings-modal-footer">
                        <button type="button" className="settings-cancel-btn" onClick={() => setSettingsOpen(false)}>Cancel</button>
                        <button type="button" className="settings-save-btn" onClick={handleSaveSettings}>Save Settings</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {dangerAction && (
                <div className="settings-modal-overlay" onClick={() => setDangerAction(null)}>
                  <div className="danger-confirm-modal" onClick={(event) => event.stopPropagation()}>
                    <span className="danger-confirm-kicker">Account Safety</span>
                    <h3>{dangerAction === 'delete' ? 'Delete account request?' : 'Deactivate account request?'}</h3>
                    <p>
                      {dangerAction === 'delete'
                        ? 'This starts a permanent deletion request. Your account data should be reviewed before final removal.'
                        : 'This starts an account deactivation request. You can contact support if this was not intended.'}
                    </p>
                    <div className="danger-confirm-actions">
                      <button type="button" className="settings-cancel-btn" onClick={() => setDangerAction(null)}>Cancel</button>
                      <button type="button" className="settings-danger-btn delete" onClick={confirmDangerAction}>
                        {dangerAction === 'delete' ? 'Request Delete' : 'Request Deactivation'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      <div className="dashboard-container">
        {/* Welcome & Stats */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>
            <p>Ready to create amazing marketing content? Pick up where you left off or try a new tool.</p>
          </div>
          
          {trialDaysRemaining !== null && trialDaysRemaining <= 3 && (
            <div className="trial-warning">
              <div className="warning-content">
                <span className="warning-icon">!</span>
                <div>
                  <strong>Your trial ends in {trialDaysRemaining} days</strong>
                  <p>Upgrade now to continue using all features without interruption.</p>
                </div>
                <button onClick={() => openPaymentGateway({ planId: 'premium', planLabel: 'Premium' })} className="btn-primary">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="quick-stats">
          {[
            {
              id: 'connectedAccounts',
              label: 'Connected Accounts',
              value: (usage.connectedAccounts ?? 0),
              iconImage: '/stat-icons/connected-accounts.svg',
              colorClass: 'blue'
            },
            {
              id: 'postsThisMonth',
              label: 'Posts This Month',
              value: (usage.socialMediaPosts ?? 0),
              iconImage: '/stat-icons/posts-this-month.svg',
              colorClass: 'green'
            },
            {
              id: 'engagementRate',
              label: 'Engagement Rate',
              value: `${(usage.engagementRate ?? 0)}%`,
              iconImage: '/stat-icons/engagement-rate.svg',
              colorClass: 'purple'
            },
            {
              id: 'scheduledPosts',
              label: 'Scheduled Posts',
              value: (usage.scheduledPosts ?? 0),
              iconImage: '/stat-icons/scheduled-posts.svg',
              colorClass: 'orange'
            }
          ].map((stat) => {
            return (
              <div key={stat.id} className={`stat-card stat-card-metric stat-card-small stat-card-${stat.colorClass}`}>
                <div className="stat-icon">
                  <img src={stat.iconImage} alt={`${stat.label} icon`} />
                </div>
                <div className="stat-copy">
                  <div className="stat-number">{stat.value}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="dashboard-insight-strip">
          <div className="insight-card insight-card-primary">
            <span className="insight-kicker">Recommended Next Step</span>
            <h2>{dashboardFocus.title}</h2>
            <p>{dashboardFocus.copy}</p>
            <button type="button" onClick={dashboardFocus.onClick}>
              {dashboardFocus.action}
            </button>
          </div>
          <div className="insight-card">
            <span className="insight-kicker">Workspace Health</span>
            <div className="workspace-health-grid">
              <div>
                <strong>{availableToolsCount}</strong>
                <span>Tools available</span>
              </div>
              <div>
                <strong>{premiumLockedCount}</strong>
                <span>Upgrade opportunities</span>
              </div>
              <div>
                <strong>{scheduledPosts}</strong>
                <span>Scheduled posts</span>
              </div>
            </div>
            <p className="workspace-health-note">Your dashboard updates as you connect accounts, generate content, and activate paid billing.</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>Quick Start</h2>
          <div className="quick-actions">
            {tools.slice(0, 5).map(tool => {
              const access = canAccessTool(tool.id, tool.requiredPlan);
              return (
                <div 
                  key={tool.id}
                  className={`quick-action ${!access.canAccess ? 'disabled' : ''} ${tool.comingSoon ? 'coming-soon' : ''}`}
                  onClick={() => handleToolClick(tool)}
                  title={tool.comingSoon ? 'Coming soon' : !access.canAccess ? 'Upgrade required' : ''}
                >
                  <div className="quick-action-icon">
                    <img src={tool.iconImage} alt={`${tool.name} icon`} />
                  </div>
                  <div className="quick-action-label">{tool.name}</div>
                  {tool.comingSoon ? (
                    <span className="coming-soon-badge">Coming Soon</span>
                  ) : tool.requiredPlan === 'premium' && (
                    <span className="premium-badge">Premium</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Filter */}
        <div className="tool-categories">
          <button 
            className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All Tools
          </button>
          <button 
            className={`category-btn ${activeCategory === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveCategory('ai')}
          >
            AI Powered
          </button>
          <button 
            className={`category-btn ${activeCategory === 'content' ? 'active' : ''}`}
            onClick={() => setActiveCategory('content')}
          >
            Content Creation
          </button>
          <button 
            className={`category-btn ${activeCategory === 'social' ? 'active' : ''}`}
            onClick={() => setActiveCategory('social')}
          >
            Social Media
          </button>
        </div>

        {/* Tools Grid */}
        <div className="tools-grid">
          {filteredTools.map(tool => {
            const access = canAccessTool(tool.id, tool.requiredPlan);
            
            return (
              <div 
                key={tool.id}
                className={`tool-card ${!access.canAccess ? 'disabled' : ''} ${tool.comingSoon ? 'coming-soon' : ''}`}
                onClick={() => handleToolClick(tool)}
              >
                <div className="tool-card-glow"></div>
                <div className="tool-header">
                  <div className="tool-icon-shell">
                    <div className="tool-icon">
                      <img src={tool.iconImage} alt={`${tool.name} icon`} />
                    </div>
                  </div>
                  <div className="tool-header-meta">
                    <span className="tool-category-label">{tool.categories[0]}</span>
                    {tool.comingSoon ? (
                      <span className="tool-coming-soon-badge">Coming Soon</span>
                    ) : tool.requiredPlan === 'premium' && (
                      <span className="tool-premium-badge">Premium</span>
                    )}
                  </div>
                </div>
                
                <h3>{tool.name}</h3>
                <p>{tool.description}</p>
                
                <div className="tool-features">
                  {tool.features.map((feature, idx) => (
                    <span key={idx} className="feature-badge">
                      {feature}
                    </span>
                  ))}
                </div>
                
                <div className="tool-footer">
                  {tool.comingSoon ? (
                    <div className="access-denied">
                      <span className="lock-icon">Soon</span><span>Launching soon</span>
                    </div>
                  ) : !access.canAccess ? (
                    <div className="access-denied">
                      {access.reason === 'upgrade_required' ? (
                        <>
                          <span className="lock-icon">Locked</span><span>Upgrade to {tool.requiredPlan}</span>
                        </>
                      ) : access.reason === 'trial_expired' ? (
                        <>
                          <span className="lock-icon">Expired</span><span>Trial expired</span>
                        </>
                      ) : (
                        <>
                          <span className="lock-icon">Locked</span><span>Subscription required</span>
                        </>
                      )}
                    </div>
                  ) : (
                    <button className="tool-action-btn">
                      Use Tool
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Upgrade CTA */}
        {subscription?.plan !== 'premium' && subscription?.plan !== 'enterprise' && (
          <div className="upgrade-cta">
            <div className="upgrade-content">
              <div className="upgrade-text">
                <h2>Unlock Premium Features</h2>
                <p>Get access to advanced AI models, unlimited generations, and priority support.</p>
              </div>
              <button 
                onClick={() => openPaymentGateway({ planId: 'premium', planLabel: 'Premium' })}
                className="upgrade-btn"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        )}
      </div>

      <ComingSoonModal
        isOpen={Boolean(previewTool)}
        tool={previewTool}
        onClose={() => setPreviewTool(null)}
      />

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/security">Security</a>
            <a href="/trust">Trust Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Meritlives LLC. All rights reserved.</p>
          <FooterPaymentBadges />
        </div>
      </footer>
    </div>
  );
}

// ============================================
// LOGIN PAGE
// ============================================

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, socialLogin, user } = useContext(AuthContext);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const serializedUser = params.get('user');
    const authError = params.get('error');

    if (authError) {
      setError(authError.replace(/_/g, ' '));
      return;
    }

    if (!token) {
      return;
    }

    let parsedUser = null;
    if (serializedUser) {
      try {
        parsedUser = JSON.parse(serializedUser);
      } catch (parseError) {
        console.warn('Google login returned an unreadable user payload, falling back to /auth/me.');
      }
    }

    let isMounted = true;

    const completeGoogleLogin = async () => {
      setLoading(true);
      const result = await socialLogin(token, parsedUser);

      if (!isMounted) {
        return;
      }

      if (result.success) {
        const isNewUser = params.get('isNewUser') === 'true';
        if (isNewUser) {
          navigate('/profile', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setError(result.error);
        setLoading(false);
      }
    };

    completeGoogleLogin();

    return () => {
      isMounted = false;
    };
  }, [location.search, navigate, socialLogin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    setError('');
    setLoading(true);
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Welcome Back</h1>
            <p>Sign in to access your marketing tools</p>
          </div>

          {error && (
            <div className="auth-error">
              <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.14" /><path d="M12 7.25v6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="17" r="1.2" fill="currentColor" /></svg></span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>

            <div className="form-options">
              <label className="checkbox">
                <input type="checkbox" />
                <span>Remember me</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot password?
              </Link>
            </div>

            <button type="submit" className="auth-btn primary" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button type="button" className="auth-btn secondary" onClick={handleGoogleLogin} disabled={loading}>
            <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.805 10.023H12.24v3.955h5.48c-.236 1.272-.964 2.35-2.055 3.073v2.55h3.318c1.942-1.789 3.062-4.426 3.062-7.56 0-.67-.06-1.313-.17-1.94Z" fill="#4285F4"/><path d="M12.24 22c2.745 0 5.047-.91 6.73-2.47l-3.318-2.55c-.922.618-2.102.986-3.412.986-2.623 0-4.847-1.77-5.64-4.148H3.17v2.63A10.16 10.16 0 0 0 12.24 22Z" fill="#34A853"/><path d="M6.6 13.818a6.106 6.106 0 0 1-.316-1.906c0-.661.114-1.304.316-1.907v-2.63H3.17a10.16 10.16 0 0 0 0 9.073l3.43-2.63Z" fill="#FBBC05"/><path d="M12.24 5.857c1.493 0 2.834.514 3.89 1.522l2.916-2.916C17.282 2.823 14.98 2 12.24 2A10.16 10.16 0 0 0 3.17 7.375l3.43 2.63c.788-2.382 3.017-4.148 5.64-4.148Z" fill="#EA4335"/></svg></span> Continue with Google
          </button>

          <div className="auth-footer">
            <p>
              Don't have an account?{' '}
              <Link to="/signup" className="auth-link">
                Sign up for free
              </Link>
            </p>
            <p className="trial-note">
              Includes 7-day free trial of all features
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// SIGNUP PAGE
// ============================================

const SIGNUP_BUSINESS_TYPES = [
  { value: 'creator', label: 'Creator / Influencer' },
  { value: 'ecommerce', label: 'E-commerce Brand' },
  { value: 'saas', label: 'SaaS / Tech Product' },
  { value: 'agency', label: 'Agency / Marketing Team' },
  { value: 'consulting', label: 'Consultant / Coach' },
  { value: 'local-business', label: 'Local Business' }
];

const SIGNUP_GOAL_OPTIONS = [
  { value: 'brand-awareness', label: 'Grow brand awareness' },
  { value: 'lead-generation', label: 'Generate more leads' },
  { value: 'sales', label: 'Increase sales / conversions' },
  { value: 'traffic', label: 'Drive website traffic' },
  { value: 'retention', label: 'Improve retention / nurture' },
  { value: 'launches', label: 'Run launches and campaigns' }
];

const SIGNUP_PLATFORM_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'twitter', label: 'X / Twitter' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube', label: 'YouTube' }
];

const SIGNUP_EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Just getting started' },
  { value: 'growing', label: 'Growing and testing channels' },
  { value: 'advanced', label: 'Running active campaigns already' }
];

const SIGNUP_INTEREST_OPTIONS = [
  { value: 'social-media', label: 'Social media posts', detail: 'Captions, post ideas, and publishing support' },
  { value: 'content-marketing', label: 'Content marketing', detail: 'Campaign themes, hooks, and content planning' },
  { value: 'email-marketing', label: 'Email campaigns', detail: 'Subjects, nurture flows, and launch emails' },
  { value: 'paid-ads', label: 'Paid ads', detail: 'Ad angles, copy testing, and promotions' },
  { value: 'seo', label: 'SEO visibility', detail: 'Search traffic, meta content, and discoverability' },
  { value: 'positioning', label: 'Brand positioning', detail: 'Offers, messaging, and value proposition clarity' }
];

const SIGNUP_ACTIVITY_OPTIONS = [
  { value: 'campaign-ideas', label: 'Campaign ideas' },
  { value: 'content-calendar', label: 'Planning content calendars' },
  { value: 'publish', label: 'Publishing on social' },
  { value: 'community', label: 'Growing community engagement' },
  { value: 'newsletter', label: 'Sending newsletters' },
  { value: 'funnels', label: 'Building funnels' }
];

const SIGNUP_TOOL_CATALOG = [
  {
    key: 'social-media',
    name: 'Social Media Generator',
    route: '/tools/social-media',
    description: 'Best for platform-ready posts, captions, and social publishing workflows.',
    signals: ['social-media', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'facebook', 'publish', 'community', 'content-calendar', 'brand-awareness']
  },
  {
    key: 'content-idea',
    name: 'Content Idea Generator',
    route: '/tools/content-idea',
    description: 'Great for fresh campaign themes, post angles, and idea generation.',
    signals: ['content-marketing', 'campaign-ideas', 'creator', 'brand-awareness', 'traffic']
  },
  {
    key: 'ad-copy',
    name: 'Ad Copy Generator',
    route: '/tools/ad-copy',
    description: 'A strong fit for paid ads, promotions, and conversion-focused copy.',
    signals: ['paid-ads', 'sales', 'lead-generation', 'promotions', 'ecommerce']
  },
  {
    key: 'funnel-builder',
    name: 'Funnel Builder',
    route: '/tools/funnel-builder',
    description: 'Ideal for lead capture, offer journeys, launches, and conversion paths.',
    signals: ['lead-generation', 'sales', 'funnels', 'launches', 'consulting', 'saas']
  },
  {
    key: 'email-tester',
    name: 'Email Subject Tester',
    route: '/tools/email-tester',
    description: 'Useful when email performance, open rates, and nurture flows matter most.',
    signals: ['email-marketing', 'newsletter', 'retention', 'launches']
  },
  {
    key: 'seo-meta',
    name: 'SEO Meta Generator',
    route: '/tools/seo-meta',
    description: 'Recommended for search traffic, discoverability, and page optimization.',
    signals: ['seo', 'traffic', 'website']
  },
  {
    key: 'headline-analyzer',
    name: 'Headline Analyzer',
    route: '/tools/headline-analyzer',
    description: 'Useful for stronger hooks, titles, headlines, and click-worthy openers.',
    signals: ['content-marketing', 'campaign-ideas', 'traffic', 'brand-awareness']
  },
  {
    key: 'value-proposition',
    name: 'Value Proposition Generator',
    route: '/tools/value-proposition',
    description: 'Perfect for sharpening your promise, offer, and business positioning.',
    signals: ['positioning', 'consulting', 'saas', 'agency', 'brand-awareness']
  }
];

const normalizeSignupSignals = (values = []) => values
  .filter(Boolean)
  .flatMap((value) => Array.isArray(value) ? value : [value])
  .map((value) => String(value).trim().toLowerCase())
  .filter(Boolean);

const getSignupToolRecommendations = (formData) => {
  const signals = normalizeSignupSignals([
    formData.businessType,
    formData.primaryGoal,
    formData.favoritePlatform,
    formData.experienceLevel,
    ...(formData.interests || []),
    ...(formData.activityPreferences || [])
  ]);

  const ranked = SIGNUP_TOOL_CATALOG
    .map((tool) => ({
      ...tool,
      score: signals.reduce((total, signal) => {
        if (tool.signals.includes(signal)) {
          return total + 3;
        }

        if (tool.signals.some((candidate) => candidate.includes(signal) || signal.includes(candidate))) {
          return total + 1;
        }

        return total;
      }, 0)
    }))
    .sort((a, b) => b.score - a.score);

  const matched = ranked.filter((tool) => tool.score > 0).slice(0, 4);
  return matched.length > 0 ? matched : ranked.slice(0, 4);
};

const toggleMultiSelect = (currentValues, nextValue) => (
  currentValues.includes(nextValue)
    ? currentValues.filter((value) => value !== nextValue)
    : [...currentValues, nextValue]
);

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
    businessType: '',
    primaryGoal: '',
    favoritePlatform: '',
    experienceLevel: '',
    interests: [],
    activityPreferences: []
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const recommendedTools = getSignupToolRecommendations(formData);
  const recommendationLead = recommendedTools[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.businessType || !formData.primaryGoal) {
      setError('Please complete your business type and primary goal so we can personalize your workspace.');
      return;
    }
    if (formData.interests.length === 0) {
      setError('Choose at least one interest so we can recommend the right tools for you.');
      return;
    }
    setLoading(true);
    const result = await signup({
      name: formData.name,
      email: formData.email,
      company: formData.company,
      password: formData.password,
      businessType: formData.businessType,
      primaryGoal: formData.primaryGoal,
      favoritePlatform: formData.favoritePlatform,
      experienceLevel: formData.experienceLevel,
      interests: formData.interests,
      activityPreferences: formData.activityPreferences
    });
    setLoading(false);
    if (result.success) {
      navigate('/dashboard', {
        state: {
          onboardingComplete: true,
          recommendedTools: result.data?.user?.recommendedTools || recommendedTools
        }
      });
    } else {
      setError(result.error);
    }
  };

  const updateField = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value
    }));
  };

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-wide">
        <div className="auth-card">
          <div className="auth-signup-layout">
            <div className="auth-signup-main">
              <div className="auth-header auth-header-left">
                <h1>Create Your Workspace</h1>
                <p>Tell us how you plan to grow and we will recommend the most relevant tools for your workflow.</p>
              </div>

              {error && (
                <div className="auth-error">
                  <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.14" /><path d="M12 7.25v6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="12" cy="17" r="1.2" fill="currentColor" /></svg></span> {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="auth-form signup-form-rich">
                <div className="signup-section">
                  <div className="signup-section-heading">
                    <h3>Account details</h3>
                    <p>Set up the essentials for your new account.</p>
                  </div>

                  <div className="signup-form-grid">
                    <div className="form-group">
                      <label>Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateField('email', e.target.value)}
                        placeholder="you@example.com"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Company or Brand</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => updateField('company', e.target.value)}
                        placeholder="Your company or brand"
                      />
                    </div>

                    <div className="form-group">
                      <label>Primary Business Type</label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => updateField('businessType', e.target.value)}
                        required
                      >
                        <option value="">Select your business type</option>
                        {SIGNUP_BUSINESS_TYPES.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Password</label>
                      <input
                        type="password"
                        value={formData.password}
                        onChange={(e) => updateField('password', e.target.value)}
                        placeholder="At least 8 characters"
                        required
                        minLength={8}
                      />
                    </div>

                    <div className="form-group">
                      <label>Confirm Password</label>
                      <input
                        type="password"
                        value={formData.confirmPassword}
                        onChange={(e) => updateField('confirmPassword', e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="signup-section">
                  <div className="signup-section-heading">
                    <h3>What do you want to achieve?</h3>
                    <p>These answers help us tailor your starting tool stack.</p>
                  </div>

                  <div className="signup-form-grid">
                    <div className="form-group">
                      <label>Primary Goal</label>
                      <select
                        value={formData.primaryGoal}
                        onChange={(e) => updateField('primaryGoal', e.target.value)}
                        required
                      >
                        <option value="">Select your main goal</option>
                        {SIGNUP_GOAL_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Main Platform</label>
                      <select
                        value={formData.favoritePlatform}
                        onChange={(e) => updateField('favoritePlatform', e.target.value)}
                      >
                        <option value="">Choose your main platform</option>
                        {SIGNUP_PLATFORM_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group form-group-full">
                      <label>Experience Level</label>
                      <div className="choice-chip-row">
                        {SIGNUP_EXPERIENCE_OPTIONS.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            className={`choice-chip choice-chip-single ${formData.experienceLevel === option.value ? 'selected' : ''}`}
                            onClick={() => updateField('experienceLevel', option.value)}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="signup-section">
                  <div className="signup-section-heading">
                    <h3>Your interests</h3>
                    <p>Pick the kinds of work you want the platform to help you with.</p>
                  </div>

                  <div className="choice-card-grid">
                    {SIGNUP_INTEREST_OPTIONS.map((option) => {
                      const selected = formData.interests.includes(option.value);

                      return (
                        <button
                          key={option.value}
                          type="button"
                          className={`choice-card ${selected ? 'selected' : ''}`}
                          onClick={() => updateField('interests', toggleMultiSelect(formData.interests, option.value))}
                        >
                          <strong>{option.label}</strong>
                          <span>{option.detail}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="signup-section">
                  <div className="signup-section-heading">
                    <h3>Platform activity</h3>
                    <p>Choose the actions you care about most right now.</p>
                  </div>

                  <div className="choice-chip-row">
                    {SIGNUP_ACTIVITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        className={`choice-chip ${formData.activityPreferences.includes(option.value) ? 'selected' : ''}`}
                        onClick={() => updateField('activityPreferences', toggleMultiSelect(formData.activityPreferences, option.value))}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="checkbox terms-checkbox">
                  <input
                    type="checkbox"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                  />
                  <span>
                    I agree to the <a href="/terms">Terms of Service</a> and{' '}
                    <a href="/privacy">Privacy Policy</a>
                  </span>
                </label>

                <button type="submit" className="auth-btn primary" disabled={loading}>
                  {loading ? 'Creating Account...' : 'Start Free Trial'}
                </button>
              </form>
            </div>

            <aside className="signup-recommendation-panel">
              <div className="signup-recommendation-pill">Suggested Tool Stack</div>
              <h3>{recommendationLead?.name || 'Your best tools will appear here'}</h3>
              <p>
                {recommendationLead
                  ? recommendationLead.description
                  : 'Complete a few fields and we will suggest the right starting tools for your workflow.'}
              </p>

              <div className="signup-recommendation-list">
                {recommendedTools.map((tool, index) => (
                  <div key={tool.key} className="signup-recommendation-item">
                    <div className="signup-recommendation-rank">0{index + 1}</div>
                    <div>
                      <strong>{tool.name}</strong>
                      <span>{tool.description}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="trial-features signup-trial-features">
                <h4>Your free trial includes:</h4>
                <ul>
                  <li>&#10003; Full access to all 8 marketing tools</li>
                  <li>&#10003; AI-powered content generation</li>
                  <li>&#10003; Social publishing and campaign planning</li>
                  <li>&#10003; Analytics and optimization tools</li>
                  <li>&#10003; Export and workflow-ready content support</li>
                </ul>
              </div>

              <div className="auth-footer auth-footer-compact">
                <p>
                  Already have an account?{' '}
                  <Link to="/login" className="auth-link">
                    Sign in
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeaturesPage() {
  const navigate = useNavigate();
  const features = [
    {
      category: 'AI-Powered Content',
      description: 'Advanced AI models for creating high-quality marketing content',
      items: [
        { icon: React.createElement(BsCpu, { size: 34 }), iconClass: 'is-ai', title: 'Advanced AI Models', desc: 'GPT-4, Claude, and custom models for superior content generation' },
        { icon: React.createElement(BsLightbulb, { size: 34 }), iconClass: 'is-idea', title: 'Content Generation', desc: 'Generate high-quality marketing copy for any platform' },
        { icon: React.createElement(BsGraphUpArrow, { size: 34 }), iconClass: 'is-chart', title: 'Smart Optimization', desc: 'AI-powered suggestions for improving content performance' }
      ]
    },
    {
      category: 'Social Media Tools',
      description: 'Create and manage content across all social platforms',
      items: [
        { icon: React.createElement(BsShare, { size: 34 }), iconClass: 'is-share', title: 'Multi-Platform', desc: 'Create content optimized for Facebook, Twitter, Instagram, LinkedIn' },
        { icon: React.createElement(BsBullseye, { size: 34 }), iconClass: 'is-target', title: 'Smart Hashtags', desc: 'AI-powered hashtag suggestions for maximum reach' },
        { icon: React.createElement(BsCalendar2Week, { size: 34 }), iconClass: 'is-calendar', title: 'Content Scheduling', desc: 'Plan and schedule posts in advance with calendar view' }
      ]
    },
    {
      category: 'Analytics & Insights',
      description: 'Track performance and get actionable insights',
      items: [
        { icon: React.createElement(BsBarChartLine, { size: 34 }), iconClass: 'is-chart', title: 'Performance Tracking', desc: 'Monitor engagement, clicks, and conversion metrics' },
        { icon: React.createElement(BsGraphUpArrow, { size: 34 }), iconClass: 'is-growth', title: 'ROI Analytics', desc: 'Measure campaign effectiveness and return on investment' },
        { icon: React.createElement(BsSearch, { size: 34 }), iconClass: 'is-search', title: 'Competitor Analysis', desc: 'Benchmark your performance against competitors' }
      ]
    },
    {
      category: 'Enterprise Features',
      description: 'Advanced features for teams and businesses',
      items: [
        { icon: React.createElement(BsPeople, { size: 34 }), iconClass: 'is-team', title: 'Team Collaboration', desc: 'Work together with role-based permissions and workflows' },
        { icon: React.createElement(BsGrid1X2, { size: 34 }), iconClass: 'is-grid', title: 'API Access', desc: 'Integrate with your existing tools and workflows' },
        { icon: React.createElement(BsBookmarkStar, { size: 34 }), iconClass: 'is-brand', title: 'White Label', desc: 'Brand the platform as your own solution' }
      ]
    }
  ];

  return (
    <div className="landing-page">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-icon">
              <img 
                src="/logo.svg" 
                alt="Meritlives Logo" 
                style={{height: '2.2rem', width: '2.2rem', display: 'block'}} 
              />
            </span>
            <span style={{fontWeight: 700, fontSize: '1.7rem', letterSpacing: '0.5px'}}>
              Meritlives AI Tools
            </span>
          </div>
          
          <div className="nav-links">
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <a href="#tools" onClick={(e) => {
              e.preventDefault();
              const toolsSection = document.getElementById('tools');
              if (toolsSection) {
                toolsSection.scrollIntoView({ behavior: 'smooth' });
              } else {
                navigate('/');
                setTimeout(() => {
                  document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }
            }}>Tools</a>
            <Link to="/contact">Contact</Link>
          </div>
          
          <div className="nav-actions">
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/login')}
              style={{marginRight: '0.7em'}}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M10.09 15.59L8.67 17l-5-5 5-5 1.41 1.41L6.83 11H20v2H6.83l3.26 3.59z"/></svg>
              </span>
              Login
            </button>
            <button
              className="btn-fancy-auth"
              onClick={() => navigate('/signup')}
            >
              <span style={{marginRight: '0.5em', display: 'inline-flex', alignItems: 'center'}}>
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z"/></svg>
              </span>
              Signup for Free
            </button>
          </div>
        </nav>
      </header>

      <main className="features-main">
        {/* Hero Section */}
        <section className="features-hero">
          <div className="features-hero-content">
            <h1>Powerful Features for Modern Marketers</h1>
            <p className="features-hero-subtitle">
              Everything you need to create, analyze, and optimize marketing content in one unified platform.
              Start with a 7-day free trial.
            </p>
            <div className="features-hero-stats">
              <div className="features-stat">
                <span className="features-stat-number">12</span>
                <span className="features-stat-label">Core Features</span>
              </div>
              <div className="features-stat">
                <span className="features-stat-number">8</span>
                <span className="features-stat-label">AI Tools</span>
              </div>
              <div className="features-stat">
                <span className="features-stat-number">24/7</span>
                <span className="features-stat-label">Support</span>
              </div>
              <div className="features-stat">
                <span className="features-stat-number">98%</span>
                <span className="features-stat-label">Satisfaction</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid with Categories */}
        <div className="features-categories-container">
          {features.map((category, categoryIndex) => (
            <section key={categoryIndex} className="feature-category-section">
              <div className="feature-category-header">
                <h2 className="feature-category-title">{category.category}</h2>
                <p className="feature-category-description">{category.description}</p>
              </div>
              
              <div className="feature-category-grid">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="feature-item-card">
                    <div className={`feature-item-icon ${item.iconClass || ''}`}>
                      <span className="feature-item-icon-badge">{item.icon}</span>
                    </div>
                    <h3 className="feature-item-title">{item.title}</h3>
                    <p className="feature-item-description">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* CTA Section */}
        <section className="features-cta-section">
          <div className="features-cta-content">
            <h2>Ready to Transform Your Marketing?</h2>
            <p>Join thousands of marketers who trust our platform. Start your 7-day free trial today.</p>
            <div className="features-cta-actions">
              <button onClick={() => navigate('/signup')} className="btn-primary btn-xl">
                Start Free Trial
              </button>
              <button onClick={() => navigate('/pricing')} className="btn-outline btn-xl">
                View Pricing
              </button>
            </div>
          </div>
        </section>
        <LegalLinks />
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Meritlives AI Tools</h3>
            <p>Enterprise-grade marketing tools powered by AI.</p>
          </div>
          <div className="footer-section">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/#tools">Tools</Link>
            <Link to="/pricing">Pricing</Link>
          </div>
          <div className="footer-section">
            <h4>Company</h4>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/trust">Trust Center</Link>
          </div>
          <div className="footer-section">
            <h4>Legal</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
            <a href="/refund-policy">Refund Policy</a>
            <a href="/security">Security</a>
            <a href="/trust">Trust Center</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Meritlives LLC. All rights reserved.</p>
          <FooterPaymentBadges />
        </div>
      </footer>
    </div>
  );
}

export default App;
