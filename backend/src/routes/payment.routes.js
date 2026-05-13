/**
 * backend/src/routes/payment.routes.js
 * Paystack payment integration routes
 */

import dotenv from 'dotenv';
import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import { authenticateToken } from '../middleware/auth.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import { createUserNotification } from '../utils/notificationHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const router = express.Router();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || null;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || null;
const PAYPAL_BASE_URL = process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com';
const PAYPAL_WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID || null;
const PAYPAL_PLAN_BASIC = process.env.PAYPAL_PLAN_BASIC || null;
const PAYPAL_PLAN_PREMIUM = process.env.PAYPAL_PLAN_PREMIUM || null;
const PAYPAL_PLAN_PRO = process.env.PAYPAL_PLAN_PRO || null;

const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Trial',
    amount: 0,
    interval: 'one_time',
    duration: 7,
    plan_code: null,
  },
  basic: {
    name: 'Basic',
    amount: 1900000,
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_BASIC_PLAN_CODE || process.env.PAYSTACK_PLAN_BASIC_MONTHLY,
  },
  premium: {
    name: 'Premium',
    amount: 4900000,
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_PREMIUM_PLAN_CODE || process.env.PAYSTACK_PLAN_PREMIUM_MONTHLY,
  },
  pro: {
    name: 'Pro',
    amount: 9900000,
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_PRO_PLAN_CODE || process.env.PAYSTACK_PLAN_PRO_MONTHLY,
  },
};

const paystackAPI = async (endpoint, method = 'GET', data = null) => {
  const config = {
    method,
    url: `${PAYSTACK_BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    config.data = data;
  }

  const response = await axios(config);
  return response.data;
};

let paypalAccessTokenCache = {
  token: null,
  expiresAt: 0,
};

const PAYPAL_PLAN_IDS = {
  basic: PAYPAL_PLAN_BASIC,
  premium: PAYPAL_PLAN_PREMIUM,
  pro: PAYPAL_PLAN_PRO,
};

const PAYPAL_PLAN_LOOKUP = Object.entries(PAYPAL_PLAN_IDS).reduce((acc, [planKey, planValue]) => {
  if (planValue) {
    acc[planValue] = planKey;
  }

  return acc;
}, {});

const PLAN_PRICES = {
  basic: 19,
  premium: 49,
  pro: 99,
};

const getFrontendBaseUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

const getPayPalAccessToken = async () => {
  if (
    paypalAccessTokenCache.token &&
    paypalAccessTokenCache.expiresAt > Date.now() + 60 * 1000
  ) {
    return paypalAccessTokenCache.token;
  }

  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
  const response = await axios({
    method: 'POST',
    url: `${PAYPAL_BASE_URL}/v1/oauth2/token`,
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: 'grant_type=client_credentials',
  });

  paypalAccessTokenCache = {
    token: response.data.access_token,
    expiresAt: Date.now() + ((response.data.expires_in || 300) * 1000),
  };

  return paypalAccessTokenCache.token;
};

const paypalAPI = async (endpoint, method = 'GET', data = null) => {
  const accessToken = await getPayPalAccessToken();
  const response = await axios({
    method,
    url: `${PAYPAL_BASE_URL}${endpoint}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Prefer: 'return=representation',
    },
    data,
  });

  return response.data;
};

const normalizePlanId = (value) => {
  if (value === 'enterprise') {
    return 'pro';
  }

  return value;
};

const parsePayPalCustomId = (customId) => {
  if (!customId || typeof customId !== 'string') {
    return { userId: null, plan: null };
  }

  const [userId, plan] = customId.split(':');
  return {
    userId: userId || null,
    plan: normalizePlanId(plan),
  };
};

const getPlanFromPayPalResource = (resource) => {
  const parsed = parsePayPalCustomId(resource?.custom_id);
  if (parsed.plan) {
    return parsed.plan;
  }

  return normalizePlanId(PAYPAL_PLAN_LOOKUP[resource?.plan_id] || null);
};

const getPlanFromPayPalOrder = (order) => {
  const purchaseUnit = order?.purchase_units?.[0];
  const parsed = parsePayPalCustomId(purchaseUnit?.custom_id);

  return parsed.plan;
};

const syncSubscriptionState = async ({ userId, plan, provider, providerId, currency = 'USD' }) => {
  const normalizedPlan = normalizePlanId(plan);
  const planPrice = PLAN_PRICES[normalizedPlan] || 0;
  let subscription = await Subscription.getActiveSubscription(userId);

  if (subscription) {
    await subscription.upgradePlan(normalizedPlan, planPrice);
  } else {
    subscription = await Subscription.create({
      userId,
      plan: normalizedPlan,
      status: 'active',
      isActive: true,
      isTrial: false,
      price: planPrice,
      currency,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    subscription.updateFeaturesByPlan(normalizedPlan);
  }

  subscription.plan = normalizedPlan;
  subscription.status = 'active';
  subscription.isActive = true;
  subscription.isTrial = false;
  subscription.price = planPrice;
  subscription.currency = currency;
  subscription.paymentProvider = provider;
  subscription.paymentProviderId = providerId;
  subscription.paymentMethod = provider === 'paypal' ? 'paypal' : 'card';
  subscription.lastPaymentDate = new Date();
  subscription.nextBillingDate = subscription.currentPeriodEnd;
  await subscription.save();

  const user = await User.findById(userId);
  if (user) {
    user.subscriptionId = subscription._id;
    user.subscription.plan = normalizedPlan;
    user.subscription.status = 'active';
    user.subscription.isActive = true;
    await user.save();
  }

  return subscription;
};

const notifyBillingSuccess = async (userId, plan, provider) => (
  createUserNotification(userId, {
    type: 'success',
    category: 'billing',
    title: 'Subscription activated',
    message: `Your ${plan} plan is active and billing is connected through ${provider}.`,
    action: {
      label: 'Open dashboard',
      url: `${getFrontendBaseUrl()}/dashboard`,
    },
  }, {
    sendEmail: true,
    dedupeWindowMinutes: 60,
  })
);

const notifyBillingIssue = async (userId, title, message) => (
  createUserNotification(userId, {
    type: 'warning',
    category: 'billing',
    title,
    message,
    action: {
      label: 'Manage billing',
      url: `${getFrontendBaseUrl()}/settings`,
    },
  }, {
    sendEmail: true,
    dedupeWindowMinutes: 180,
  })
);

const PROVIDERS = {
  paystack: {
    id: 'paystack',
    name: 'Paystack',
    available: Boolean(PAYSTACK_SECRET_KEY && PAYSTACK_PUBLIC_KEY),
    mode: PAYSTACK_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
    message: PAYSTACK_SECRET_KEY && PAYSTACK_PUBLIC_KEY
      ? 'Card checkout is available with Paystack.'
      : 'Paystack keys are missing from the backend environment.',
  },
  paypal: {
    id: 'paypal',
    name: 'PayPal',
    available: Boolean(PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET),
    mode: PAYPAL_BASE_URL.includes('sandbox') ? 'sandbox' : 'live',
    message: PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET && PAYPAL_PLAN_BASIC && PAYPAL_PLAN_PREMIUM && PAYPAL_PLAN_PRO
      ? 'PayPal subscription checkout is available.'
      : 'PayPal sandbox checkout is available. Add billing plan IDs later for recurring subscriptions.',
  },
};

router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { plan, planId, email, provider = 'paystack' } = req.body;
    const selectedPlan = normalizePlanId(plan || planId);

    if (!PROVIDERS[provider]) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported payment provider',
      });
    }

    if (!selectedPlan || !SUBSCRIPTION_PLANS[selectedPlan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan',
      });
    }

    if (selectedPlan === 'trial') {
      return res.status(400).json({
        success: false,
        message: 'Trial plan does not require payment',
      });
    }

    if (provider === 'paypal') {
      const paypalPlanId = PAYPAL_PLAN_IDS[selectedPlan];

      if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
        return res.status(500).json({
          success: false,
          message: 'PayPal is not configured. Add PayPal client ID and secret.',
        });
      }

      if (!paypalPlanId) {
        const amount = PLAN_PRICES[selectedPlan];
        const response = await paypalAPI('/v2/checkout/orders', 'POST', {
          intent: 'CAPTURE',
          purchase_units: [
            {
              custom_id: `${req.user.id}:${selectedPlan}`,
              description: `${SUBSCRIPTION_PLANS[selectedPlan].name} plan checkout`,
              amount: {
                currency_code: 'USD',
                value: amount.toFixed(2),
              },
            },
          ],
          application_context: {
            brand_name: 'SocialGenius',
            user_action: 'PAY_NOW',
            shipping_preference: 'NO_SHIPPING',
            return_url: `${getFrontendBaseUrl()}/payment/callback?provider=paypal`,
            cancel_url: `${getFrontendBaseUrl()}/upgrade?payment=cancelled&provider=paypal`,
          },
        });

        const approvalLink = response.links?.find((link) => link.rel === 'approve')?.href;

        if (!approvalLink) {
          return res.status(400).json({
            success: false,
            message: 'Failed to generate PayPal approval link',
          });
        }

        return res.json({
          success: true,
          message: 'PayPal sandbox checkout initialized successfully',
          data: {
            authorization_url: approvalLink,
            reference: response.id,
            provider: 'paypal',
            status: response.status,
            checkout_type: 'order',
          },
        });
      }

      const response = await paypalAPI('/v1/billing/subscriptions', 'POST', {
        plan_id: paypalPlanId,
        custom_id: `${req.user.id}:${selectedPlan}`,
        subscriber: {
          email_address: email || req.user.email,
          name: {
            given_name: req.user.name?.split(' ')?.[0] || 'Subscriber',
            surname: req.user.name?.split(' ')?.slice(1).join(' ') || 'User',
          },
        },
        application_context: {
          brand_name: 'SocialGenius',
          user_action: 'SUBSCRIBE_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${getFrontendBaseUrl()}/payment/callback?provider=paypal`,
          cancel_url: `${getFrontendBaseUrl()}/upgrade?payment=cancelled&provider=paypal`,
        },
      });

      const approvalLink = response.links?.find((link) => link.rel === 'approve')?.href;

      if (!approvalLink) {
        return res.status(400).json({
          success: false,
          message: 'Failed to generate PayPal approval link',
        });
      }

      return res.json({
        success: true,
        message: 'PayPal subscription initialized successfully',
        data: {
          authorization_url: approvalLink,
          reference: response.id,
          provider: 'paypal',
          status: response.status,
        },
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[selectedPlan];

    if (!PAYSTACK_SECRET_KEY || !PAYSTACK_PUBLIC_KEY || !planDetails.plan_code) {
      return res.status(500).json({
        success: false,
        message: 'Payment gateway is not fully configured. Add Paystack live keys and plan codes.',
      });
    }

    const initData = {
      email: email || req.user.email,
      amount: planDetails.amount,
      plan: planDetails.plan_code,
      currency: 'NGN',
      metadata: {
        user_id: req.user.id,
        subscription_plan: selectedPlan,
        payment_provider: provider,
        custom_fields: [
          {
            display_name: 'Plan',
            variable_name: 'plan',
            value: planDetails.name,
          },
        ],
      },
      callback_url: `${getFrontendBaseUrl()}/payment/callback?provider=paystack`,
    };

    const response = await paystackAPI('/transaction/initialize', 'POST', initData);

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: 'Failed to initialize payment',
      });
    }

    return res.json({
      success: true,
      message: 'Payment initialized successfully',
      data: {
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: response.data.reference,
        public_key: PAYSTACK_PUBLIC_KEY,
        provider: 'paystack',
      },
    });
  } catch (error) {
    console.error('Initialize payment error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment initialization failed',
    });
  }
});

router.get('/verify/:reference', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.params;
    const provider = req.query.provider || (reference.startsWith('I-') ? 'paypal' : 'paystack');

    if (provider === 'paypal') {
      if (!reference.startsWith('I-')) {
        let response;

        try {
          response = await paypalAPI(`/v2/checkout/orders/${reference}/capture`, 'POST', {});
        } catch (error) {
          const paypalIssue = error.response?.data?.details?.[0]?.issue;
          if (paypalIssue === 'ORDER_ALREADY_CAPTURED') {
            response = await paypalAPI(`/v2/checkout/orders/${reference}`);
          } else {
            throw error;
          }
        }

        const plan = getPlanFromPayPalOrder(response) || normalizePlanId(req.query.plan);

        if (!plan) {
          return res.status(400).json({
            success: false,
            message: 'Unable to determine the PayPal checkout plan.',
          });
        }

        if (!['COMPLETED', 'APPROVED'].includes(response.status)) {
          return res.status(400).json({
            success: false,
            message: `PayPal checkout is not complete yet. Current status: ${response.status}`,
          });
        }

        const capture = response.purchase_units?.[0]?.payments?.captures?.[0] || {};
        const updatedSubscription = await syncSubscriptionState({
          userId: req.user.id,
          plan,
          provider: 'paypal',
          providerId: response.id,
          currency: capture.amount?.currency_code || 'USD',
        });

        await notifyBillingSuccess(req.user.id, plan, 'PayPal');

        return res.json({
          success: true,
          message: 'PayPal checkout verified successfully',
          data: {
            plan,
            amount: capture.amount?.value || PLAN_PRICES[plan] || null,
            customer: response.payer || null,
            paid_at: capture.create_time || response.update_time,
            provider: 'paypal',
            subscription: updatedSubscription ? updatedSubscription.toJSON() : null,
          },
        });
      }

      const response = await paypalAPI(`/v1/billing/subscriptions/${reference}`);
      const plan = getPlanFromPayPalResource(response) || normalizePlanId(req.query.plan);

      if (!plan) {
        return res.status(400).json({
          success: false,
          message: 'Unable to determine the PayPal subscription plan.',
        });
      }

      if (!['ACTIVE', 'APPROVED'].includes(response.status)) {
        return res.status(400).json({
          success: false,
          message: `PayPal subscription is not active yet. Current status: ${response.status}`,
        });
      }

      const updatedSubscription = await syncSubscriptionState({
        userId: req.user.id,
        plan,
        provider: 'paypal',
        providerId: response.id,
        currency: response.billing_info?.last_payment?.amount?.currency_code || 'USD',
      });

      await notifyBillingSuccess(req.user.id, plan, 'PayPal');

      return res.json({
        success: true,
        message: 'PayPal subscription verified successfully',
        data: {
          plan,
          amount: response.billing_info?.last_payment?.amount?.value || null,
          customer: response.subscriber || null,
          paid_at: response.status_update_time || response.create_time,
          provider: 'paypal',
          subscription: updatedSubscription ? updatedSubscription.toJSON() : null,
        },
      });
    }

    const response = await paystackAPI(`/transaction/verify/${reference}`);

    if (!response.status || response.data.status !== 'success') {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed',
      });
    }

    const plan = normalizePlanId(response.data.metadata?.subscription_plan);
    const updatedSubscription = await syncSubscriptionState({
      userId: req.user.id,
      plan,
      provider: 'paystack',
      providerId: reference,
      currency: response.data.currency || 'NGN',
    });

    await notifyBillingSuccess(req.user.id, plan, 'Paystack');

    return res.json({
      success: true,
      message: 'Payment verified successfully',
      data: {
        plan,
        amount: response.data.amount / 100,
        customer: response.data.customer,
        paid_at: response.data.paid_at,
        provider: 'paystack',
        subscription: updatedSubscription ? updatedSubscription.toJSON() : null,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Payment verification failed',
    });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    if (req.headers['paypal-transmission-id']) {
      if (PAYPAL_WEBHOOK_ID) {
        const verification = await paypalAPI('/v1/notifications/verify-webhook-signature', 'POST', {
          auth_algo: req.headers['paypal-auth-algo'],
          cert_url: req.headers['paypal-cert-url'],
          transmission_id: req.headers['paypal-transmission-id'],
          transmission_sig: req.headers['paypal-transmission-sig'],
          transmission_time: req.headers['paypal-transmission-time'],
          webhook_id: PAYPAL_WEBHOOK_ID,
          webhook_event: req.body,
        });

        if (verification.verification_status !== 'SUCCESS') {
          return res.status(400).json({ success: false, message: 'Invalid PayPal webhook signature' });
        }
      }

      const eventType = req.body.event_type;
      const resource = req.body.resource || {};
      const parsed = parsePayPalCustomId(resource.custom_id);
      const userId = parsed.userId;
      const plan = getPlanFromPayPalResource(resource);

      if (userId && plan && ['BILLING.SUBSCRIPTION.ACTIVATED', 'PAYMENT.SALE.COMPLETED'].includes(eventType)) {
        await syncSubscriptionState({
          userId,
          plan,
          provider: 'paypal',
          providerId: resource.id || resource.billing_agreement_id || null,
          currency: resource.amount?.currency_code || 'USD',
        });

        await notifyBillingSuccess(userId, plan, 'PayPal');
      }

      if (userId && ['BILLING.SUBSCRIPTION.CANCELLED', 'BILLING.SUBSCRIPTION.SUSPENDED', 'BILLING.SUBSCRIPTION.EXPIRED'].includes(eventType)) {
        const subscription = await Subscription.getActiveSubscription(userId);
        if (subscription) {
          subscription.status = eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ? 'past_due' : 'cancelled';
          subscription.isActive = eventType === 'BILLING.SUBSCRIPTION.SUSPENDED';
          await subscription.save();
        }

        const user = await User.findById(userId);
        if (user) {
          user.subscription.status = eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ? 'inactive' : 'cancelled';
          user.subscription.isActive = eventType === 'BILLING.SUBSCRIPTION.SUSPENDED';
          await user.save();
        }

        await notifyBillingIssue(
          userId,
          eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ? 'Subscription payment issue' : 'Subscription cancelled',
          eventType === 'BILLING.SUBSCRIPTION.SUSPENDED'
            ? 'Your subscription was suspended because of a billing issue. Update your payment details to restore access.'
            : 'Your subscription is no longer active. Renew or upgrade to continue using premium features.'
        );
      }

      return res.json({ success: true });
    }

    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    if (req.body.event === 'charge.success') {
      const data = req.body.data || {};
      const userId = data.metadata?.user_id;
      const plan = normalizePlanId(data.metadata?.subscription_plan);

      if (userId && plan) {
        await syncSubscriptionState({
          userId,
          plan,
          provider: 'paystack',
          providerId: data.reference || null,
          currency: data.currency || 'NGN',
        });

        await notifyBillingSuccess(userId, plan, 'Paystack');
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscription_code, email_token } = req.body;

    if (!subscription_code || !email_token) {
      return res.status(400).json({
        success: false,
        message: 'Subscription code and email token are required',
      });
    }

    const response = await paystackAPI('/subscription/disable', 'POST', {
      code: subscription_code,
      token: email_token,
    });

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: 'Failed to cancel subscription',
      });
    }

    await notifyBillingIssue(
      req.user.id,
      'Subscription cancellation requested',
      'Your subscription cancellation request was received. Access will remain available until the end of your current billing period if applicable.'
    );

    return res.json({ success: true, message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error.response?.data || error.message);
    return res.status(500).json({ success: false, message: 'Subscription cancellation failed' });
  }
});

router.get('/plans', (req, res) => {
  const plans = Object.keys(SUBSCRIPTION_PLANS).map((key) => ({
    id: key,
    name: SUBSCRIPTION_PLANS[key].name,
    amount: SUBSCRIPTION_PLANS[key].amount / 100,
    interval: SUBSCRIPTION_PLANS[key].interval,
    features: getFeatures(key),
  }));

  return res.json({ success: true, data: plans });
});

router.get('/providers', (req, res) => {
  return res.json({
    success: true,
    data: Object.values(PROVIDERS),
  });
});

router.get('/transaction-history', authenticateToken, async (req, res) => {
  try {
    const response = await paystackAPI(`/transaction?customer=${req.user.email}`);

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch transaction history',
      });
    }

    return res.json({
      success: true,
      data: response.data.map((txn) => ({
        reference: txn.reference,
        amount: txn.amount / 100,
        status: txn.status,
        paid_at: txn.paid_at,
        channel: txn.channel,
      })),
    });
  } catch (error) {
    console.error('Transaction history error:', error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history',
    });
  }
});

function getFeatures(plan) {
  const features = {
    trial: ['Facebook only', 'Basic content generation', 'Standard analytics', 'Email support', '7 days access'],
    basic: ['3 social accounts', 'All platforms', 'Basic scheduling', 'Standard analytics', 'Email support'],
    premium: ['Unlimited accounts', 'All platforms', 'AI content generation', 'Advanced analytics', 'Priority support', 'Custom branding'],
    pro: ['Everything in Premium', 'Team collaboration (5 seats)', 'White-label solution', 'API access', 'Dedicated account manager'],
  };

  return features[plan] || [];
}

export default router;
