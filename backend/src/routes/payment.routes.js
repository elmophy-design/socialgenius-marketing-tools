/**
 * backend/src/routes/payment.routes.js
 * COMPLETE PAYSTACK PAYMENT INTEGRATION (ES Module Version)
 */

import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { authenticateToken } from '../middleware/auth.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

const router = express.Router();

// Paystack configuration
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.PAYSTACK_PUBLIC_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Subscription plans configuration
const SUBSCRIPTION_PLANS = {
  trial: {
    name: 'Trial',
    amount: 0,
    interval: 'one_time',
    duration: 7,
    plan_code: null
  },
  basic: {
    name: 'Basic',
    amount: 1900000, // ₦19,000 in kobo
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_BASIC_PLAN_CODE
  },
  premium: {
    name: 'Premium',
    amount: 4900000, // ₦49,000 in kobo
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_PREMIUM_PLAN_CODE
  },
  pro: {
    name: 'Pro',
    amount: 9900000, // ₦99,000 in kobo
    interval: 'monthly',
    plan_code: process.env.PAYSTACK_PRO_PLAN_CODE
  }
};

// Helper function to make Paystack API calls
const paystackAPI = async (endpoint, method = 'GET', data = null) => {
  try {
    const config = {
      method,
      url: `${PAYSTACK_BASE_URL}${endpoint}`,
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error('Paystack API Error:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * @route   POST /api/payment/initialize
 * @desc    Initialize a payment transaction
 * @access  Private
 */
router.post('/initialize', authenticateToken, async (req, res) => {
  try {
    const { plan, email } = req.body;

    if (!plan || !SUBSCRIPTION_PLANS[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subscription plan'
      });
    }

    const planDetails = SUBSCRIPTION_PLANS[plan];

    if (plan === 'trial') {
      return res.status(400).json({
        success: false,
        message: 'Trial plan does not require payment'
      });
    }

    const initData = {
      email: email || req.user.email,
      amount: planDetails.amount,
      plan: planDetails.plan_code,
      currency: 'NGN',
      metadata: {
        user_id: req.user.id,
        subscription_plan: plan,
        custom_fields: [
          {
            display_name: 'Plan',
            variable_name: 'plan',
            value: planDetails.name
          }
        ]
      },
      callback_url: `${process.env.FRONTEND_URL}/payment/callback`
    };

    const response = await paystackAPI('/transaction/initialize', 'POST', initData);

    if (response.status) {
      res.json({
        success: true,
        message: 'Payment initialized successfully',
        data: {
          authorization_url: response.data.authorization_url,
          access_code: response.data.access_code,
          reference: response.data.reference
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to initialize payment'
      });
    }
  } catch (error) {
    console.error('Initialize payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment initialization failed'
    });
  }
});

/**
 * @route   GET /api/payment/verify/:reference
 * @desc    Verify a payment transaction
 * @access  Private
 */
router.get('/verify/:reference', authenticateToken, async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await paystackAPI(`/transaction/verify/${reference}`);

    if (response.status && response.data.status === 'success') {
      const metadata = response.data.metadata;
      const plan = metadata.subscription_plan;

      // Update user subscription
      const subscription = await Subscription.getActiveSubscription(req.user.id);
      
      if (subscription) {
        const planPrices = {
          basic: 19,
          premium: 49,
          pro: 99
        };
        
        await subscription.upgradePlan(plan, planPrices[plan]);
      }

      res.json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          plan,
          amount: response.data.amount / 100,
          customer: response.data.customer,
          paid_at: response.data.paid_at
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed'
    });
  }
});

/**
 * @route   POST /api/payment/webhook
 * @desc    Handle Paystack webhooks
 * @access  Public (verified with hash)
 */
router.post('/webhook', async (req, res) => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    const event = req.body;

    switch (event.event) {
      case 'charge.success':
        console.log('Payment successful:', event.data);
        break;

      case 'subscription.create':
        console.log('Subscription created:', event.data);
        break;

      case 'subscription.disable':
        console.log('Subscription cancelled:', event.data);
        break;

      case 'invoice.payment_failed':
        console.log('Payment failed:', event.data);
        break;

      default:
        console.log('Unhandled event:', event.event);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed'
    });
  }
});

/**
 * @route   POST /api/payment/cancel-subscription
 * @desc    Cancel a subscription
 * @access  Private
 */
router.post('/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const { subscription_code } = req.body;

    if (!subscription_code) {
      return res.status(400).json({
        success: false,
        message: 'Subscription code is required'
      });
    }

    const response = await paystackAPI(
      '/subscription/disable',
      'POST',
      {
        code: subscription_code,
        token: req.body.email_token
      }
    );

    if (response.status) {
      res.json({
        success: true,
        message: 'Subscription cancelled successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Subscription cancellation failed'
    });
  }
});

/**
 * @route   GET /api/payment/plans
 * @desc    Get all available subscription plans
 * @access  Public
 */
router.get('/plans', (req, res) => {
  const plans = Object.keys(SUBSCRIPTION_PLANS).map(key => ({
    id: key,
    name: SUBSCRIPTION_PLANS[key].name,
    amount: SUBSCRIPTION_PLANS[key].amount / 100,
    interval: SUBSCRIPTION_PLANS[key].interval,
    features: getFeatures(key)
  }));

  res.json({
    success: true,
    data: plans
  });
});

/**
 * @route   GET /api/payment/transaction-history
 * @desc    Get user's transaction history
 * @access  Private
 */
router.get('/transaction-history', authenticateToken, async (req, res) => {
  try {
    const response = await paystackAPI(
      `/transaction?customer=${req.user.email}`
    );

    if (response.status) {
      res.json({
        success: true,
        data: response.data.map(txn => ({
          reference: txn.reference,
          amount: txn.amount / 100,
          status: txn.status,
          paid_at: txn.paid_at,
          channel: txn.channel
        }))
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch transaction history'
      });
    }
  } catch (error) {
    console.error('Transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transaction history'
    });
  }
});

// Helper function
function getFeatures(plan) {
  const features = {
    trial: [
      'Facebook only',
      'Basic content generation',
      'Standard analytics',
      'Email support',
      '7 days access'
    ],
    basic: [
      '3 social accounts',
      'All platforms',
      'Basic scheduling',
      'Standard analytics',
      'Email support'
    ],
    premium: [
      'Unlimited accounts',
      'All platforms',
      'AI content generation',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ],
    pro: [
      'Everything in Premium',
      'Team collaboration (5 seats)',
      'White-label solution',
      'API access',
      'Dedicated account manager'
    ]
  };

  return features[plan] || [];
}

export default router;