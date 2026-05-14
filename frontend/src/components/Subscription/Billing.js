import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext, SubscriptionContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import { paymentApi } from '../../api';
import { useNotification } from '../../contexts/NotificationContext';
import '../../css/Billing.css';

const PLAN_PRICES = {
  trial: 0,
  basic: 19,
  premium: 49,
  pro: 99,
  enterprise: 99,
};

export default function Billing() {
  const authContext = useContext(AuthContext);
  const subscriptionContext = useContext(SubscriptionContext);
  const navigate = useNavigate();
  const notify = useNotification();
  const user = authContext?.user;
  const subscription = subscriptionContext || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  useEffect(() => {
    const loadBillingData = async () => {
      if (!user) {
        setError('User data is not available. Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const invoiceResult = await paymentApi.getInvoices();
        if (invoiceResult.success && Array.isArray(invoiceResult.data)) {
          setInvoices(invoiceResult.data);
        }
      } catch (loadError) {
        console.error('Billing data load error:', loadError);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [user]);

  const currentPlan = subscription?.plan || 'trial';
  const planPrice = PLAN_PRICES[currentPlan] || 0;
  const nextBillingDate = subscription?.nextBillingDate || subscription?.expiresAt || null;
  const planLabel = useMemo(() => {
    if (currentPlan === 'trial') return '7-Day Free Trial';
    return currentPlan.toUpperCase();
  }, [currentPlan]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateBilling = (event) => {
    event.preventDefault();
    notify.info('Billing form captured. Connect this form to your gateway vault flow when you are ready to store payment methods.');
    setShowUpdateForm(false);
    setFormData({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  const downloadInvoice = async (invoiceId) => {
    const result = await paymentApi.downloadInvoice(invoiceId);
    if (!result.success) {
      notify.error(result.error || 'Unable to download invoice right now.');
      return;
    }

    const blobUrl = window.URL.createObjectURL(new Blob([result.data]));
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = `invoice-${invoiceId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(blobUrl);
    notify.success('Invoice download started.');
  };

  if (!user) {
    return (
      <div className="billing-container">
        <div className="error-message">
          <p>Unable to load billing data. Please log in again.</p>
          <button onClick={() => navigate('/login')} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="billing-container">
        <div className="billing-loading-card">
          <div className="billing-loading-spinner" aria-hidden="true"></div>
          <h2>Preparing your billing workspace</h2>
          <p>We are checking your subscription, invoice history, and payment provider status.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="billing-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/profile')} className="btn-back">
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="billing-container">
      <div className="billing-header">
        <div className="billing-header-content">
          <h1>Billing and Payments</h1>
          <p>Review your plan, invoices, and payment workflow in one place.</p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-back">
          Back to Profile
        </button>
      </div>

      <div className="billing-section">
        <h2>Current Plan</h2>
        <div className="plan-card">
          <div className="plan-info">
            <div className="plan-details">
              <h3>{planLabel}</h3>
              <p>{currentPlan === 'trial' ? 'You are currently exploring the full workspace on trial access.' : `$${planPrice}/month`}</p>
              <div className="plan-features">
                <span>AI marketing tools</span>
                <span>Subscription-managed access</span>
                <span>{currentPlan === 'trial' ? 'Upgrade whenever you are ready' : 'Active recurring access'}</span>
              </div>
            </div>
            <div className="plan-actions">
              {currentPlan === 'trial' ? (
                <button className="btn-upgrade" onClick={() => navigate('/upgrade', { state: { requestedPlan: 'premium', source: 'billing' } })}>
                  Upgrade Now
                </button>
              ) : (
                <>
                  <button className="btn-upgrade" onClick={() => navigate('/upgrade', { state: { requestedPlan: currentPlan, source: 'billing' } })}>
                    Change Plan
                  </button>
                  <button className="btn-cancel">Cancel Subscription</button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="billing-section">
        <h2>Billing Snapshot</h2>
        <div className="billing-info-card">
          <div className="info-row">
            <span className="label">Billing Cycle</span>
            <span className="value">Monthly</span>
          </div>
          <div className="info-row">
            <span className="label">Next Billing Date</span>
            <span className="value">{nextBillingDate ? new Date(nextBillingDate).toLocaleDateString() : currentPlan === 'trial' ? 'Trial period active' : 'Not available yet'}</span>
          </div>
          <div className="info-row">
            <span className="label">Current Amount</span>
            <span className="value">{currentPlan === 'trial' ? 'Free' : `$${planPrice}`}</span>
          </div>
          <div className="info-row">
            <span className="label">Payment Method</span>
            <span className="value">{currentPlan === 'trial' ? 'No paid method on file' : 'Managed through provider checkout'}</span>
          </div>
        </div>

        {currentPlan !== 'trial' && (
          <button className="btn-update-payment" onClick={() => setShowUpdateForm((prev) => !prev)}>
            {showUpdateForm ? 'Cancel Payment Method Update' : 'Update Payment Method'}
          </button>
        )}

        {showUpdateForm && (
          <form onSubmit={handleUpdateBilling} className="billing-form">
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  name="cvv"
                  placeholder="123"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn-primary">
              Save Payment Method
            </button>
          </form>
        )}
      </div>

      <div className="billing-section">
        <h2>Invoice History</h2>
        {invoices.length > 0 ? (
          <div className="invoices-table">
            <div className="table-header">
              <div className="col-id">Reference</div>
              <div className="col-date">Date</div>
              <div className="col-amount">Amount</div>
              <div className="col-status">Status</div>
              <div className="col-description">Channel</div>
              <div className="col-action">Action</div>
            </div>
            {invoices.map((invoice) => (
              <div key={invoice.reference || invoice.id} className="table-row">
                <div className="col-id">{invoice.reference || invoice.id}</div>
                <div className="col-date">{invoice.paid_at ? new Date(invoice.paid_at).toLocaleDateString() : invoice.date}</div>
                <div className="col-amount">${invoice.amount}</div>
                <div className="col-status">
                  <span className={`status-badge ${(invoice.status || 'paid').toLowerCase()}`}>
                    {invoice.status || 'Paid'}
                  </span>
                </div>
                <div className="col-description">{invoice.channel || invoice.description || 'Subscription payment'}</div>
                <div className="col-action">
                  <button className="btn-download" onClick={() => downloadInvoice(invoice.reference || invoice.id)}>
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="billing-empty-state">
            <div className="empty-state-icon" aria-hidden="true">INV</div>
            <h3>No invoices yet</h3>
            <p>Your transaction history will appear here after your first paid subscription. Trial users can upgrade anytime to activate provider-backed billing and invoice records.</p>
            <div className="empty-state-actions">
              <button className="btn-upgrade" onClick={() => navigate('/upgrade', { state: { requestedPlan: 'premium', source: 'billing-empty-state' } })}>
                View Upgrade Options
              </button>
              <button className="btn-secondary" onClick={() => navigate('/refund-policy')}>
                Read Billing Policy
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="billing-section">
        <h2>Tax and Legal</h2>
        <div className="legal-info">
          <p><strong>Tax handling:</strong> Applicable taxes can be calculated by your payment provider during checkout.</p>
          <p><strong>Refund policy:</strong> New subscriptions can be reviewed under your <button type="button" className="inline-policy-link" onClick={() => navigate('/refund-policy')}>refund and billing policy</button>.</p>
          <p><strong>Providers:</strong> Paystack and PayPal can both be offered once their live credentials and webhook settings are completed.</p>
          <p><strong>Security:</strong> Payment credentials are provider-managed, and card details should never be stored directly in the application database. Review the <button type="button" className="inline-policy-link" onClick={() => navigate('/security')}>security page</button> for more details.</p>
        </div>
      </div>

      <div className="billing-section">
        <h2>Need Help?</h2>
        <div className="support-links">
          <button className="link-btn" onClick={() => window.location.href = 'mailto:support@meritlives.com'}>
            Contact Support
          </button>
          <button className="link-btn" onClick={() => navigate('/pricing')}>
            Review Pricing
          </button>
        </div>
      </div>

      <div className="billing-actions">
        <button className="btn-primary" onClick={() => navigate('/profile')}>
          Back to Profile
        </button>
        <button className="btn-secondary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </div>

    </div>
  );
}
