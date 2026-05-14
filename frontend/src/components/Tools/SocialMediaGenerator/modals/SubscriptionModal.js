// frontend/src/components/Tools/SocialMedia/modals/SubscriptionModal.jsx
import React, { useState } from 'react';
import './SubscriptionModal.css';

const SubscriptionModal = ({ isOpen, onClose, currentPlan = 'trial', onUpgrade }) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const plans = [
    {
      id: 'trial',
      name: '7-Day Free Trial',
      price: 0,
      period: '7 days',
      badge: 'Trial',
      badgeClass: 'badge-trial',
      features: [
        'Facebook & Twitter access',
        'Basic content scheduling',
        'Standard analytics',
        'Email support',
        'No credit card required',
        '3 posts per generation'
      ],
      buttonText: currentPlan === 'trial' ? 'Current Plan' : 'Start Trial',
      disabled: currentPlan === 'trial'
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 19,
      period: 'month',
      badge: 'Basic',
      badgeClass: 'badge-basic',
      features: [
        'Up to 3 social accounts',
        'All major platforms',
        'Basic content scheduling',
        'Standard analytics',
        'Email support',
        '5 posts per generation'
      ],
      buttonText: currentPlan === 'basic' ? 'Current Plan' : 'Upgrade to Basic',
      disabled: currentPlan === 'basic',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 49,
      period: 'month',
      badge: 'Premium',
      badgeClass: 'badge-premium',
      features: [
        'Unlimited social accounts',
        'AI content generation',
        'Advanced analytics',
        'Priority customer support',
        'Custom branding',
        'Auto-posting features',
        'Unlimited posts'
      ],
      buttonText: currentPlan === 'premium' ? 'Current Plan' : 'Upgrade to Premium',
      disabled: currentPlan === 'premium',
      popular: true
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 99,
      period: 'month',
      badge: 'Pro',
      badgeClass: 'badge-pro',
      features: [
        'Everything in Premium',
        'Team collaboration (5 seats)',
        'White-label solutions',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Advanced AI models'
      ],
      buttonText: currentPlan === 'pro' ? 'Current Plan' : 'Upgrade to Pro',
      disabled: currentPlan === 'pro',
      popular: false
    }
  ];

  const handleUpgrade = async (planId) => {
    if (planId === currentPlan) return;
    
    setIsProcessing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onUpgrade) {
        onUpgrade(planId);
      }
      
      setSelectedPlan(planId);
      onClose();
    } catch (error) {
      console.error('Upgrade failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentManagement = () => {
    // In real app, this would open payment management
    alert('Payment management would open here in production');
  };

  return (
    <div className="modal-overlay subscription-modal-overlay" onClick={onClose}>
      <div className="modal-content subscription-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-crown text-yellow-500 mr-2"></i>
              Upgrade Your Plan
            </h3>
            <p className="modal-subtitle">Choose the perfect plan for your needs</p>
          </div>
          <button onClick={onClose} className="modal-close-btn">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body subscription-modal-body">
          {/* Current Plan Banner */}
          {currentPlan && (
            <div className="current-plan-banner">
              <i className="fas fa-check-circle text-green-500 mr-2"></i>
              <span>
                You're currently on the <strong className="font-semibold">{plans.find(p => p.id === currentPlan)?.name}</strong>
              </span>
            </div>
          )}

          {/* Plans Grid */}
          <div className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${plan.popular ? 'popular' : ''} ${plan.id === currentPlan ? 'current' : ''}`}
              >
                {plan.popular && (
                  <div className="popular-badge">
                    <i className="fas fa-star mr-1"></i>
                    Most Popular
                  </div>
                )}
                
                {plan.id === currentPlan && (
                  <div className="current-badge">
                    <i className="fas fa-check-circle mr-1"></i>
                    Current Plan
                  </div>
                )}

                <div className="plan-header">
                  <h4 className="plan-name">{plan.name}</h4>
                  <span className={`plan-badge ${plan.badgeClass}`}>
                    {plan.badge}
                  </span>
                </div>

                <div className="plan-pricing">
                  <span className="price-amount">${plan.price}</span>
                  <span className="price-period">/{plan.period}</span>
                  {plan.price === 0 && <span className="price-free">FREE</span>}
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="plan-feature">
                      <i className="fas fa-check-circle text-green-500 mr-2"></i>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`plan-button ${plan.disabled ? 'disabled' : plan.popular ? 'primary' : 'secondary'}`}
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.disabled || isProcessing}
                >
                  {isProcessing && selectedPlan === plan.id ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    plan.buttonText
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Features Comparison */}
          <div className="features-comparison">
            <h4 className="comparison-title">
              <i className="fas fa-table mr-2 text-blue-500"></i>
              Feature Comparison
            </h4>
            <div className="comparison-table">
              <div className="comparison-row comparison-header">
                <div className="comparison-cell feature-name">Feature</div>
                <div className="comparison-cell">Trial</div>
                <div className="comparison-cell">Basic</div>
                <div className="comparison-cell">Premium</div>
                <div className="comparison-cell">Pro</div>
              </div>
              
              <div className="comparison-row">
                <div className="comparison-cell feature-name">Social Accounts</div>
                <div className="comparison-cell">2</div>
                <div className="comparison-cell">3</div>
                <div className="comparison-cell">Unlimited</div>
                <div className="comparison-cell">Unlimited</div>
              </div>
              
              <div className="comparison-row">
                <div className="comparison-cell feature-name">AI Content Generation</div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
              </div>
              
              <div className="comparison-row">
                <div className="comparison-cell feature-name">Advanced Analytics</div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
              </div>
              
              <div className="comparison-row">
                <div className="comparison-cell feature-name">Auto-Posting</div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
              </div>
              
              <div className="comparison-row">
                <div className="comparison-cell feature-name">API Access</div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-times text-red-500"></i></div>
                <div className="comparison-cell"><i className="fas fa-check text-green-500"></i></div>
              </div>
            </div>
          </div>

          {/* Payment Method (for paid plans) */}
          {currentPlan && currentPlan !== 'trial' && (
            <div className="payment-section">
              <h4 className="section-title">
                <i className="fas fa-credit-card mr-2 text-purple-500"></i>
                Payment Method
              </h4>
              <button 
                className="btn btn-outline manage-payment-btn"
                onClick={handlePaymentManagement}
              >
                <i className="fas fa-cog mr-2"></i>
                Manage Payment Methods
              </button>
            </div>
          )}

          {/* FAQ */}
          <div className="faq-section">
            <h4 className="faq-title">
              <i className="fas fa-question-circle mr-2 text-blue-500"></i>
              Frequently Asked Questions
            </h4>
            <div className="faq-list">
              <div className="faq-item">
                <strong>Can I cancel anytime?</strong>
                <p>Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
              </div>
              <div className="faq-item">
                <strong>Do I need a credit card for the trial?</strong>
                <p>No credit card required! Start your 7-day free trial immediately.</p>
              </div>
              <div className="faq-item">
                <strong>Can I upgrade or downgrade my plan?</strong>
                <p>Absolutely! You can change your plan at any time. Upgrades are immediate, downgrades take effect at the end of your billing period.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <div className="footer-text">
            <i className="fas fa-lock mr-1 text-green-500"></i>
            <span>Secure payment processing • 30-day money-back guarantee</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;