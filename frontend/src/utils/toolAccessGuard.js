const PLAN_ORDER = ['trial', 'basic', 'premium', 'enterprise'];

function safeJsonParse(value, fallback = null) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

export function getStoredSubscription() {
  return safeJsonParse(localStorage.getItem('subscription'), {});
}

export function isTrialExpired(subscription = getStoredSubscription()) {
  const plan = subscription?.plan || 'trial';
  const isTrial = plan === 'trial' || subscription?.status === 'trialing';
  const endDateValue = subscription?.trialEndDate || subscription?.trialEndsAt || subscription?.expiresAt;

  if (!isTrial || !endDateValue) {
    return false;
  }

  const endDate = new Date(endDateValue);

  if (Number.isNaN(endDate.getTime())) {
    return false;
  }

  return endDate.getTime() <= Date.now();
}

export function guardToolAction({
  navigate,
  requiredPlan = 'basic',
  source = 'tool-action',
  actionLabel = 'continue',
  toolName = 'this tool',
} = {}) {
  const token = localStorage.getItem('token') || localStorage.getItem('meritlives_token');
  const subscription = getStoredSubscription();
  const currentPlan = subscription?.plan || 'trial';
  const currentPlanIndex = PLAN_ORDER.indexOf(currentPlan);
  const requiredPlanIndex = PLAN_ORDER.indexOf(requiredPlan);
  const normalizedRequiredPlan = requiredPlanIndex >= 0 ? requiredPlan : 'premium';
  const upgradePlan = normalizedRequiredPlan === 'trial' ? 'premium' : normalizedRequiredPlan;

  if (!token) {
    navigate('/login', {
      state: {
        message: 'Please log in to use this tool.',
        from: window.location.pathname,
      },
    });
    return false;
  }

  if (isTrialExpired(subscription)) {
    navigate('/upgrade', {
      state: {
        requestedPlan: upgradePlan,
        requiredPlan: upgradePlan,
        source,
        message: `Your free trial has ended. Choose a plan to ${actionLabel} with ${toolName}.`,
      },
    });
    return false;
  }

  if (subscription?.status && ['cancelled', 'inactive', 'expired'].includes(subscription.status)) {
    navigate('/upgrade', {
      state: {
        requestedPlan: upgradePlan,
        requiredPlan: upgradePlan,
        source,
        message: 'Your subscription is not active. Choose a plan to continue using the tools.',
      },
    });
    return false;
  }

  if (
    currentPlanIndex >= 0 &&
    requiredPlanIndex >= 0 &&
    currentPlanIndex < requiredPlanIndex
  ) {
    navigate('/upgrade', {
      state: {
        requestedPlan: upgradePlan,
        requiredPlan: upgradePlan,
        source,
        message: `${toolName} requires the ${upgradePlan} plan or higher. Choose a plan to continue.`,
      },
    });
    return false;
  }

  return true;
}

export function handleToolActionError(error, navigate) {
  const status = error?.response?.status || error?.status;
  const message = error?.response?.data?.message || error?.message || '';
  const shouldUpgrade = [402, 403].includes(status) || /trial|subscription|upgrade|plan/i.test(message);

  if (!shouldUpgrade) {
    return false;
  }

  navigate('/upgrade', {
    state: {
      requestedPlan: 'premium',
      requiredPlan: 'premium',
      source: 'tool-action-error',
      message: message || 'Choose a plan to continue using this tool.',
    },
  });

  return true;
}
