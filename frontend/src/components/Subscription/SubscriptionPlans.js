import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import SubscriptionPlansConfig, {
  getPlanById,
  getPlanPrice,
  getRecommendedUpgrade,
  comparePlans,
} from '../../constants/plans';
import PaymentGatewayModal from '../Payment/PaymentGatewayModal';
import '../../css/Subscription.css';

const PLAN_ORDER = ['trial', 'basic', 'premium', 'enterprise'];

const formatPrice = (planId, billingCycle) => {
  if (planId === 'trial') {
    return {
      amount: 'Free',
      detail: '7-day access',
      savings: null,
    };
  }

  if (planId === 'enterprise') {
    return {
      amount: 'Custom',
      detail: 'Tailored pricing',
      savings: billingCycle === 'annual' ? 'Annual contracts available' : null,
    };
  }

  if (billingCycle === 'annual') {
    const annual = getPlanPrice(planId, 'annual');
    return {
      amount: `$${annual.monthlyEquivalent}`,
      detail: `/month, billed $${annual.annualPrice}/year`,
      savings: annual.savings ? `Save ${annual.savings}` : null,
    };
  }

  const plan = getPlanById(planId);
  return {
    amount: `$${plan.price}`,
    detail: `/${plan.interval}`,
    savings: plan.savings || null,
  };
};

export default function SubscriptionPlans({ mode = 'plans' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [checkoutPlanId, setCheckoutPlanId] = useState(null);
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState(null);

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const subscription = JSON.parse(localStorage.getItem('subscription') || '{}');

  const currentPlanId = subscription?.plan || 'trial';
  const currentPlan = getPlanById(currentPlanId);
  const recommendedUpgrade = getRecommendedUpgrade(currentPlanId);
  const requiredPlan = location.state?.requiredPlan || null;
  const requestedPlan = location.state?.requestedPlan || requiredPlan || recommendedUpgrade?.recommended || null;
  const upgradeMessage = location.state?.message || null;
  const pageTitle = mode === 'upgrade' ? 'Upgrade Your Workspace' : 'Choose The Right Plan';
  const pageSubtitle = mode === 'upgrade'
    ? 'Select the plan that fits your next stage, review the included limits, then continue to secure checkout.'
    : 'Compare every plan, see what is included, and move to the option that matches your growth stage.';

  const planCards = useMemo(
    () => PLAN_ORDER.map((planId) => SubscriptionPlansConfig.PLANS[planId]),
    []
  );

  const recommendedCheckoutPlan = useMemo(() => {
    const candidate = requestedPlan || recommendedUpgrade?.recommended || 'premium';

    if (!candidate || candidate === 'trial' || candidate === 'enterprise' || candidate === currentPlanId) {
      return recommendedUpgrade?.recommended && recommendedUpgrade.recommended !== 'enterprise'
        ? recommendedUpgrade.recommended
        : 'premium';
    }

    return candidate;
  }, [currentPlanId, recommendedUpgrade, requestedPlan]);

  const getActionLabel = (planId) => {
    if (planId === currentPlanId) {
      return 'Current Plan';
    }

    if (planId === 'enterprise') {
      return 'Talk to Sales';
    }

    if (comparePlans(planId, currentPlanId) < 0) {
      return 'Switch in Billing';
    }

    return `Select ${getPlanById(planId).name}`;
  };

  const handlePlanAction = async (planId) => {
    if (planId === currentPlanId) {
      navigate('/billing');
      return;
    }

    if (planId === 'enterprise') {
      window.location.href = 'mailto:support@meritlives.com?subject=Enterprise%20Plan%20Inquiry';
      return;
    }

    setSelectedCheckoutPlan(planId);
    setCheckoutPlanId(planId);
  };

  return (
    <div className="subscription-page">
      <div className="subscription-shell">
        <section className="subscription-hero-card">
          <div className="subscription-hero-copy">
            <span className="subscription-kicker">
              {mode === 'upgrade' ? 'Upgrade Center' : 'Subscription Plans'}
            </span>
            <h1>{pageTitle}</h1>
            <p>{pageSubtitle}</p>

            <div className="subscription-highlights">
              <div className="subscription-highlight-chip">Choose your plan first</div>
              <div className="subscription-highlight-chip">Paystack and PayPal checkout</div>
              <div className="subscription-highlight-chip">Cancel or change later</div>
            </div>
          </div>

          <div className="subscription-status-panel">
            <p className="subscription-status-label">Current plan</p>
            <h2>{currentPlan.name}</h2>
            <p className="subscription-status-copy">{currentPlan.description}</p>

            {upgradeMessage && (
              <div className="subscription-required-plan">
                {upgradeMessage}
              </div>
            )}

            {requiredPlan && !upgradeMessage && (
              <div className="subscription-required-plan">
                This feature needs the {getPlanById(requiredPlan).name} plan or higher.
              </div>
            )}

            {recommendedUpgrade && (
              <>
                <div className="subscription-recommendation">
                  Recommended next step: <strong>{getPlanById(recommendedUpgrade.recommended).name}</strong>
                </div>
                <p className="subscription-recommendation-copy">{recommendedUpgrade.message}</p>
              </>
            )}

            <div className="subscription-status-actions">
              <button className="subscription-primary-btn" onClick={() => navigate('/billing')}>
                Manage Billing
              </button>
              <button className="subscription-secondary-btn" onClick={() => navigate('/dashboard')}>
                Back to Dashboard
              </button>
            </div>
          </div>
        </section>

        <section className="subscription-step-strip" aria-label="Upgrade steps">
          <div className="subscription-step-card">
            <span>1</span>
            <div>
              <h3>Compare plans</h3>
              <p>Review limits, included tools, and support level before making a choice.</p>
            </div>
          </div>
          <div className="subscription-step-card">
            <span>2</span>
            <div>
              <h3>Select your plan</h3>
              <p>Choose Basic, Premium, or Enterprise based on how your workspace will grow.</p>
            </div>
          </div>
          <div className="subscription-step-card">
            <span>3</span>
            <div>
              <h3>Proceed securely</h3>
              <p>Continue to provider-managed checkout with Paystack or PayPal.</p>
            </div>
          </div>
        </section>

        <section className="subscription-toolbar">
          <div>
            <h3>Billing cadence</h3>
            <p>Switch the display to compare monthly and annual pricing.</p>
          </div>

          <div className="subscription-billing-toggle" role="tablist" aria-label="Billing cycle">
            <button
              type="button"
              className={billingCycle === 'monthly' ? 'active' : ''}
              onClick={() => setBillingCycle('monthly')}
            >
              Monthly
            </button>
            <button
              type="button"
              className={billingCycle === 'annual' ? 'active' : ''}
              onClick={() => setBillingCycle('annual')}
            >
              Annual
            </button>
          </div>
        </section>

        <section className="subscription-plan-grid">
          {planCards.map((plan) => {
            const price = formatPrice(plan.id, billingCycle);
            const isCurrent = plan.id === currentPlanId;
            const isFeatured = plan.featured || recommendedUpgrade?.recommended === plan.id;
            const isRequired = requiredPlan === plan.id;
            const isRequested = requestedPlan === plan.id && !isCurrent;

            return (
              <article
                key={plan.id}
                className={[
                  'subscription-plan-card',
                  isCurrent ? 'is-current' : '',
                  isFeatured ? 'is-featured' : '',
                  isRequired ? 'is-required' : '',
                  isRequested ? 'is-requested' : '',
                ].filter(Boolean).join(' ')}
              >
                {(plan.badge || isCurrent || isRequested) && (
                  <div className="subscription-plan-badge">
                    {isCurrent ? 'Your Plan' : isRequested ? 'Suggested' : plan.badge}
                  </div>
                )}

                <div className="subscription-plan-header">
                  <div>
                    <h3>{plan.name}</h3>
                    <p>{plan.description}</p>
                  </div>
                  <div className="subscription-plan-price">
                    <span className="amount">{price.amount}</span>
                    <span className="detail">{price.detail}</span>
                  </div>
                  {price.savings && (
                    <div className="subscription-plan-savings">{price.savings}</div>
                  )}
                </div>

                <ul className="subscription-feature-list">
                  {plan.features.slice(0, 7).map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <div className="subscription-metric-grid">
                  <div>
                    <span className="label">Requests</span>
                    <strong>{String(plan.limits.dailyRequests)}</strong>
                  </div>
                  <div>
                    <span className="label">Social Posts</span>
                    <strong>{String(plan.limits.socialMediaPosts)}</strong>
                  </div>
                  <div>
                    <span className="label">Team Seats</span>
                    <strong>{String(plan.limits.teamMembers)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  className={`subscription-plan-btn ${isCurrent ? 'is-disabled' : ''}`}
                  onClick={() => handlePlanAction(plan.id)}
                  disabled={isCurrent}
                >
                  {checkoutPlanId === plan.id ? 'Choose Payment Method' : getActionLabel(plan.id)}
                </button>

                <p className="subscription-plan-footnote">
                  {plan.id === 'enterprise'
                    ? 'Includes custom onboarding, security review, and sales-assisted rollout.'
                    : 'You can review plan details and billing options before confirming any change.'}
                </p>
              </article>
            );
          })}
        </section>

        <section className="subscription-checkout-assurance">
          <div>
            <span className="subscription-kicker">Before payment</span>
            <h2>Nothing is charged until you choose a provider</h2>
            <p>
              Selecting a plan opens a secure payment choice screen. From there, Paystack or PayPal
              handles the sensitive payment details directly.
            </p>
          </div>
          <div className="subscription-assurance-list">
            <span>Provider-managed checkout</span>
            <span>Plan confirmation before redirect</span>
            <span>Subscription updates after payment verification</span>
          </div>
        </section>

        <section className="subscription-comparison-card">
          <div className="subscription-section-heading">
            <div>
              <span className="subscription-kicker">Feature Comparison</span>
              <h2>See what changes as you move up</h2>
            </div>
            <p>Use this table to compare the practical differences between plans before you switch.</p>
          </div>

          <div className="subscription-comparison-table">
            <div className="comparison-header">Feature</div>
            {PLAN_ORDER.map((planId) => (
              <div key={planId} className="comparison-header plan-column">
                {getPlanById(planId).name}
              </div>
            ))}

            {SubscriptionPlansConfig.COMPARISON.map((row) => (
              <React.Fragment key={row.feature}>
                <div className="comparison-cell feature-name">{row.feature}</div>
                {PLAN_ORDER.map((planId) => (
                  <div key={`${row.feature}-${planId}`} className="comparison-cell">
                    {row[planId]}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </section>

        <section className="subscription-trust-grid">
          <article className="subscription-trust-card">
            <h3>Built for real usage</h3>
            <p>
              Plans are structured around actual team growth, from a single operator on trial to enterprise
              teams managing brand, reporting, and approvals at scale.
            </p>
          </article>
          <article className="subscription-trust-card">
            <h3>Clear upgrade path</h3>
            <p>
              Trial users can keep momentum with Basic, Premium unlocks the advanced automation layer,
              and Enterprise adds custom onboarding, security, and support.
            </p>
          </article>
          <article className="subscription-trust-card">
            <h3>Need a tailored setup?</h3>
            <p>
              If you need invoicing, a custom rollout, or team onboarding, use the enterprise contact option
              and we will route you to the right setup flow.
            </p>
          </article>
        </section>

        <section className="subscription-bottom-bar">
          <div>
            <h3>{user?.name ? `${user.name}, ready to review your plan options?` : 'Ready to review your plan options?'}</h3>
            <p>Pick a plan now, then choose a secure payment provider when you are ready to proceed.</p>
          </div>
          <div className="subscription-bottom-actions">
            <button
              className="subscription-primary-btn"
              onClick={() => {
                setSelectedCheckoutPlan(recommendedCheckoutPlan);
                setCheckoutPlanId(recommendedCheckoutPlan);
              }}
            >
              Select Recommended Plan
            </button>
            <button className="subscription-secondary-btn" onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
          </div>
        </section>
      </div>

      <PaymentGatewayModal
        isOpen={Boolean(selectedCheckoutPlan)}
        onClose={() => {
          setSelectedCheckoutPlan(null);
          setCheckoutPlanId(null);
        }}
        planId={selectedCheckoutPlan}
        planLabel={selectedCheckoutPlan ? getPlanById(selectedCheckoutPlan).name : ''}
        userEmail={user?.email || ''}
      />
    </div>
  );
}
