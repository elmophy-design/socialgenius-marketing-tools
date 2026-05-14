import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { paymentApi } from '../../api';
import { openPaymentGateway } from '../../utils/paymentGateway';
import './PaymentCallback.css';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const trxref = searchParams.get('trxref');
      const subscriptionId = searchParams.get('subscription_id');
      const token = searchParams.get('token');
      const providerParam = searchParams.get('provider');
      const paymentReference = subscriptionId || reference || trxref || token;
      const provider = providerParam || ((subscriptionId || token || '').startsWith('I-') ? 'paypal' : 'paystack');

      if (!paymentReference) {
        setStatus('error');
        setMessage('No payment reference was returned from the payment gateway.');
        return;
      }

      try {
        setStatus('processing');
        setMessage(`Verifying your ${provider === 'paypal' ? 'PayPal' : 'Paystack'} payment...`);

        const result = await paymentApi.verifyPayment(paymentReference, provider);

        if (result.success) {
          setStatus('success');
          setMessage(`${provider === 'paypal' ? 'PayPal' : 'Paystack'} payment confirmed. Your subscription is now active.`);
          setSubscription(result.data.subscription);

          if (result.data.subscription) {
            localStorage.setItem('subscription', JSON.stringify(result.data.subscription));
          }

          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Payment verification failed.');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('error');
        setMessage('An error occurred while verifying your payment.');
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="payment-callback-container">
      <div className="payment-callback-card">
        {status === 'processing' && (
          <>
            <div className="status-icon processing">
              <div className="spinner"></div>
            </div>
            <h2>Processing Payment</h2>
            <p>{message}</p>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="status-icon success">
              <span>OK</span>
            </div>
            <h2>Payment Successful</h2>
            <p>{message}</p>

            {subscription && (
              <div className="subscription-details">
                <div className="detail-row">
                  <span>Plan</span>
                  <span className="plan-name">{subscription.plan.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span>Status</span>
                  <span className="status-badge active">Active</span>
                </div>
                <div className="detail-row">
                  <span>Next Billing</span>
                  <span>{subscription.nextBillingDate ? new Date(subscription.nextBillingDate).toLocaleDateString() : 'Active now'}</span>
                </div>
              </div>
            )}

            <div className="success-actions">
              <button onClick={() => navigate('/dashboard')} className="btn-primary">
                Go to Dashboard
              </button>
              <button onClick={() => navigate('/billing')} className="btn-secondary">
                Open Billing
              </button>
            </div>

            <div className="redirect-message">
              Redirecting to dashboard in 3 seconds...
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="status-icon error">
              <span>!</span>
            </div>
            <h2>Payment Verification Failed</h2>
            <p>{message}</p>

            <div className="error-actions">
              <button
                onClick={() => openPaymentGateway({ planId: 'premium', planLabel: 'Premium' })}
                className="btn-primary"
              >
                Try Again
              </button>
              <button onClick={() => navigate('/billing')} className="btn-secondary">
                Open Billing
              </button>
            </div>

            <div className="support-note">
              If you were charged but still see this message, contact support with your payment reference.
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
