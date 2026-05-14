// frontend/src/components/Tools/SocialMedia/modals/PremiumWallModal.jsx
import React from 'react';
import './PremiumWallModal.css';

const PremiumWallModal = ({ 
  isOpen, 
  onClose, 
  featureName = "This Premium Feature",
  onUpgrade 
}) => {
  if (!isOpen) return null;

  const premiumFeatures = [
    {
      icon: 'fas fa-infinity',
      title: 'Unlimited Content Generation',
      description: 'Generate as many posts as you need without limits'
    },
    {
      icon: 'fas fa-robot',
      title: 'AI-Powered Generation',
      description: 'Advanced AI models for better content quality'
    },
    {
      icon: 'fas fa-share-alt',
      title: 'Connect All Platforms',
      description: 'Access to all social media platforms'
    },
    {
      icon: 'fas fa-bolt',
      title: 'Auto-Posting',
      description: 'Automatically publish to all your social platforms'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Advanced Analytics',
      description: 'Deep insights and performance tracking'
    },
    {
      icon: 'fas fa-calendar-check',
      title: 'Content Scheduling',
      description: 'Schedule unlimited posts in advance'
    },
    {
      icon: 'fas fa-headset',
      title: 'Priority Support',
      description: '24/7 premium customer support'
    },
    {
      icon: 'fas fa-palette',
      title: 'Custom Branding',
      description: 'White-label and custom brand options'
    }
  ];

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    }
    onClose();
  };

  return (
    <div className="modal-overlay premium-wall-overlay" onClick={onClose}>
      <div className="modal-content premium-wall-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="premium-wall-close">
          <i className="fas fa-times"></i>
        </button>

        {/* Premium Icon */}
        <div className="premium-wall-icon">
          <div className="premium-icon-circle">
            <i className="fas fa-crown"></i>
          </div>
          <div className="premium-icon-text">PREMIUM</div>
        </div>

        {/* Content */}
        <div className="premium-wall-body">
          <h2 className="premium-wall-title">
            Unlock {featureName}
          </h2>
          <p className="premium-wall-subtitle">
            Upgrade to Premium to access this feature and unlock your full potential
          </p>

          {/* Features Grid */}
          <div className="premium-features-grid">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="premium-feature-item">
                <div className="premium-feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <div className="premium-feature-content">
                  <h4 className="premium-feature-title">{feature.title}</h4>
                  <p className="premium-feature-description">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Card */}
          <div className="premium-pricing-card">
            <div className="pricing-badge">
              <i className="fas fa-star mr-1"></i>
              Most Popular
            </div>
            <div className="pricing-header">
              <div className="pricing-plan">Premium Plan</div>
              <div className="pricing-amount">
                <span className="price">$49</span>
                <span className="period">/month</span>
              </div>
              <div className="pricing-savings">Save 20% with annual billing</div>
            </div>
            <div className="pricing-features">
              <div className="pricing-feature">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Everything in Basic</span>
              </div>
              <div className="pricing-feature">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Unlimited content generation</span>
              </div>
              <div className="pricing-feature">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>All social platforms</span>
              </div>
              <div className="pricing-feature">
                <i className="fas fa-check-circle text-green-500"></i>
                <span>Priority support</span>
              </div>
            </div>
            <div className="pricing-note">Cancel anytime • No long-term commitment</div>
          </div>

          {/* Actions */}
          <div className="premium-wall-actions">
            <button className="btn premium-upgrade-btn" onClick={handleUpgrade}>
              <i className="fas fa-crown mr-2"></i>
              Upgrade to Premium
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Maybe Later
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="premium-trust">
            <div className="trust-item">
              <i className="fas fa-check-circle text-green-500"></i>
              <span>30-day money-back guarantee</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-shield-alt text-blue-500"></i>
              <span>Secure payment processing</span>
            </div>
            <div className="trust-item">
              <i className="fas fa-users text-purple-500"></i>
              <span>Join 10,000+ premium users</span>
            </div>
          </div>

          {/* Testimonials */}
          <div className="premium-testimonials">
            <div className="testimonial">
              <div className="testimonial-content">
                "This tool increased our social engagement by 300%! Worth every penny."
              </div>
              <div className="testimonial-author">- Sarah M., Marketing Director</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumWallModal;