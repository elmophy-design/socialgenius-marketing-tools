import React, { useState, useEffect } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { paymentApi } from '../../api';
import { useNotification } from '../../contexts/NotificationContext';
import './PaystackPayment.css';

const PaystackPayment = ({
  plan,
  user,
  onSuccess,
  onClose,
  showModal = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const notify = useNotification();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePaymentSuccess = async (response) => {
    console.log('Payment successful:', response);

    setLoading(true);
    try {
      const verification = await paymentApi.verifyPayment(response.reference);

      if (verification.success) {
        if (onSuccess) {
          onSuccess(verification.data);
        }
        notify.success('Payment successful. Your subscription has been activated.');
      } else {
        setError('Payment verification failed: ' + verification.error);
      }
    } catch (err) {
      setError('Payment verification error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClose = () => {
    console.log('Payment closed');
    if (onClose) {
      onClose();
    }
  };

  const generatePaymentReference = () => {
    const ref = `MERIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    setReference(ref);

    setPaymentConfig({
      reference: ref,
      email: user.email,
      amount: plan.amount * 100,
      publicKey: process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
      currency: 'NGN',
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
      metadata: {
        planId: plan.id,
        planName: plan.name,
        userId: user._id,
        userName: user.name,
      },
      text: `Pay ${formatAmount(plan.amount)}`,
      onSuccess: handlePaymentSuccess,
      onClose: handlePaymentClose,
    });
  };

  useEffect(() => {
    if (plan && user) {
      generatePaymentReference();
    }
  }, [plan, user]);

  const initializePayment = usePaystackPayment(paymentConfig || {});

  const handlePayment = async () => {
    if (!paymentConfig) {
      setError('Payment configuration not ready');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await paymentApi.initializePayment({
        planId: plan.id,
        email: user.email,
        amount: plan.amount,
        reference: paymentConfig.reference,
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to initialize payment');
      }

      initializePayment();
    } catch (err) {
      setError(err.message || 'Payment initialization failed');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateSavings = () => {
    if (plan.interval === 'yearly') {
      const monthlyEquivalent = plan.amount / 12;
      const monthlyPlan = plan.amount === 490 ? 49 : 99;
      const savings = ((monthlyPlan - monthlyEquivalent) / monthlyPlan) * 100;
      return Math.round(savings);
    }
    return 0;
  };

  const savings = calculateSavings();

  if (!showModal) {
    return (
      <button
        onClick={handlePayment}
        disabled={loading || !paymentConfig}
        className="paystack-pay-btn"
      >
        {loading ? 'Processing...' : `Subscribe Now - ${formatAmount(plan.amount)}`}
      </button>
    );
  }

  return (
    <div className="paystack-modal-overlay">
      <div className="paystack-modal">
        <div className="modal-header">
          <h3>Complete Your Subscription</h3>
          <button onClick={onClose} className="close-btn">
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="plan-summary">
            <div className="plan-header">
              <h4>{plan.name}</h4>
              {savings > 0 && <div className="savings-badge">Save {savings}%</div>}
            </div>

            <div className="plan-price">
              <div className="amount">{formatAmount(plan.amount)}</div>
              <div className="interval">/{plan.interval}</div>
            </div>

            <div className="plan-features">
              {plan.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="check-icon">Included</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="payment-details">
            <div className="detail-row">
              <span>Email:</span>
              <span>{user.email}</span>
            </div>
            <div className="detail-row">
              <span>Amount:</span>
              <span>{formatAmount(plan.amount)}</span>
            </div>
            <div className="detail-row">
              <span>Reference:</span>
              <span className="reference">{reference}</span>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">Notice</span>
              {error}
            </div>
          )}

          <button
            onClick={handlePayment}
            disabled={loading || !paymentConfig}
            className="paystack-pay-btn primary"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing Payment...
              </>
            ) : (
              `Pay ${formatAmount(plan.amount)} with Paystack`
            )}
          </button>

          <div className="payment-methods">
            <div className="methods-title">Accepted Payment Methods</div>
            <div className="methods-icons">
              <span className="method-icon">Card</span>
              <span className="method-icon">Bank</span>
              <span className="method-icon">USSD</span>
              <span className="method-icon">Mobile</span>
              <span className="method-icon">QR</span>
            </div>
            <div className="methods-names">
              <span>Card</span>
              <span>Bank</span>
              <span>USSD</span>
              <span>Mobile Money</span>
              <span>QR</span>
            </div>
          </div>

          <div className="security-note">
            <span className="lock-icon">Secure</span>
            <span>Your payment is secured by Paystack. We never store your card details.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystackPayment;
