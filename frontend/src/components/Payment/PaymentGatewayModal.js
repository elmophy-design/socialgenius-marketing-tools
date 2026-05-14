import React, { useEffect, useMemo, useState } from 'react';
import { paymentApi } from '../../api';
import './PaymentGatewayModal.css';

const FALLBACK_PROVIDERS = [
  {
    id: 'paystack',
    name: 'Paystack',
    available: true,
    mode: 'configured',
    message: 'Secure card checkout for subscriptions.',
  },
  {
    id: 'paypal',
    name: 'PayPal',
    available: false,
    mode: 'unconfigured',
    message: 'PayPal backend activation is still pending.',
  },
];

export default function PaymentGatewayModal({
  isOpen,
  onClose,
  planId,
  planLabel,
  userEmail,
}) {
  const [providers, setProviders] = useState(FALLBACK_PROVIDERS);
  const [loadingProviders, setLoadingProviders] = useState(false);
  const [activeProvider, setActiveProvider] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setActiveProvider(null);
      setError('');
      return;
    }

    let cancelled = false;

    const loadProviders = async () => {
      setLoadingProviders(true);
      const result = await paymentApi.getProviders();

      if (!cancelled) {
        setProviders(result.success && Array.isArray(result.data) && result.data.length > 0 ? result.data : FALLBACK_PROVIDERS);
        setLoadingProviders(false);
      }
    };

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  const availableProviders = useMemo(
    () => providers.filter((provider) => provider.available),
    [providers]
  );

  if (!isOpen) {
    return null;
  }

  const handleProviderCheckout = async (providerId) => {
    try {
      setActiveProvider(providerId);
      setError('');

      const result = await paymentApi.startSubscriptionCheckout({
        plan: planId,
        email: userEmail,
        provider: providerId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Unable to open checkout right now.');
      }
    } catch (checkoutError) {
      setError(checkoutError.message || 'Unable to open checkout right now.');
      setActiveProvider(null);
    }
  };

  return (
    <div className="payment-gateway-modal-overlay" onClick={onClose}>
      <div className="payment-gateway-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="payment-gateway-close" onClick={onClose} aria-label="Close payment modal">
          &times;
        </button>

        <div className="payment-gateway-header">
          <span className="payment-gateway-kicker">Subscription Checkout</span>
          <h2>Choose how you want to pay</h2>
          <p>
            Continue to secure checkout for the <strong>{planLabel}</strong> plan.
            {userEmail ? ` We will use ${userEmail} for the subscription.` : ''}
          </p>
        </div>

        <div className="payment-gateway-body">
          {loadingProviders ? (
            <div className="payment-gateway-loading">Checking payment providers...</div>
          ) : (
            <>
              <div className="payment-gateway-grid">
                {providers.map((provider) => (
                  <div
                    key={provider.id}
                    className={`payment-gateway-card${provider.available ? ' is-available' : ' is-disabled'}`}
                  >
                    <div className="payment-gateway-card-top">
                      <span className={`payment-gateway-pill is-${provider.id}`}>{provider.name}</span>
                      <span className={`payment-gateway-status ${provider.available ? 'is-live' : 'is-pending'}`}>
                        {provider.available ? 'Ready' : 'Pending'}
                      </span>
                    </div>
                    <p>{provider.message}</p>
                    <button
                      type="button"
                      className="payment-gateway-button"
                      disabled={!provider.available || activeProvider === provider.id}
                      onClick={() => handleProviderCheckout(provider.id)}
                    >
                      {activeProvider === provider.id ? 'Opening Checkout...' : provider.available ? `Continue with ${provider.name}` : 'Not Available Yet'}
                    </button>
                  </div>
                ))}
              </div>

              {availableProviders.length === 0 && (
                <p className="payment-gateway-note">
                  No live payment gateway is fully configured yet. Add your production keys in the backend environment to enable checkout.
                </p>
              )}

              {availableProviders.some((provider) => provider.id === 'paypal') ? (
                <p className="payment-gateway-note">
                  PayPal subscriptions are available through approval-based checkout. Make sure your live PayPal app, plan IDs, and webhook ID stay in sync with production.
                </p>
              ) : (
                <p className="payment-gateway-note">
                  Paystack is ready for checkout. PayPal will appear here as soon as its backend credentials, plan IDs, and webhook configuration are added.
                </p>
              )}

              {error && <p className="payment-gateway-error">{error}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
