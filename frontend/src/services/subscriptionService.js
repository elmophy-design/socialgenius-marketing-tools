// frontend/src/services/subscriptionService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class SubscriptionService {
  // Get user subscription
  static async getSubscription(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: data.subscription,
          planDetails: data.planDetails,
          nextBillingDate: data.nextBillingDate,
          trialInfo: data.trialInfo
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch subscription',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get subscription error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get all subscription plans
  static async getPlans(token = null) {
    try {
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      
      const response = await fetch(`${API_BASE_URL}/subscription/plans`, {
        headers
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          plans: data.plans,
          currentPlan: data.currentPlan,
          recommendedPlan: data.recommendedPlan
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch plans',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get plans error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Create subscription (start trial or subscribe)
  static async createSubscription(planId, token, paymentMethod = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ planId, paymentMethod })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: data.subscription,
          message: data.message,
          requiresAction: data.requiresAction,
          clientSecret: data.clientSecret
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create subscription',
          requiresPayment: data.requiresPayment,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Create subscription error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Update subscription plan
  static async updateSubscription(newPlanId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPlanId })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: data.subscription,
          proratedAmount: data.proratedAmount,
          effectiveDate: data.effectiveDate,
          invoice: data.invoice
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to update subscription',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Update subscription error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Cancel subscription
  static async cancelSubscription(token, reason = '') {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          cancellationDate: data.cancellationDate,
          accessUntil: data.accessUntil
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to cancel subscription',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Cancel subscription error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Reactivate subscription
  static async reactivateSubscription(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/reactivate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          subscription: data.subscription,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to reactivate subscription',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Reactivate subscription error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get billing history
  static async getBillingHistory(token, limit = 20, offset = 0) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/subscription/billing?limit=${limit}&offset=${offset}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          invoices: data.invoices,
          total: data.total,
          hasMore: data.hasMore
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch billing history',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get billing history error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get invoice by ID
  static async getInvoice(invoiceId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/invoice/${invoiceId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          blob,
          filename: `invoice-${invoiceId}.pdf`
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          error: data.error || 'Failed to fetch invoice',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get invoice error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Update payment method
  static async updatePaymentMethod(paymentMethodId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/payment-method`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethodId })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          paymentMethod: data.paymentMethod
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to update payment method',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Update payment method error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get payment methods
  static async getPaymentMethods(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/payment-methods`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentMethods: data.paymentMethods,
          defaultMethod: data.defaultMethod
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch payment methods',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get payment methods error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Add payment method
  static async addPaymentMethod(paymentMethodData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/payment-methods`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(paymentMethodData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentMethod: data.paymentMethod,
          message: data.message,
          requiresVerification: data.requiresVerification
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to add payment method',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Add payment method error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Remove payment method
  static async removePaymentMethod(paymentMethodId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/payment-methods/${paymentMethodId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          removedId: paymentMethodId
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to remove payment method',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Remove payment method error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get usage limits
  static async getUsageLimits(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/usage-limits`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          limits: data.limits,
          usage: data.usage,
          resetsAt: data.resetsAt,
          plan: data.plan
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch usage limits',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get usage limits error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Check if feature is available
  static async checkFeatureAccess(feature, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/feature-access/${feature}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          hasAccess: data.hasAccess,
          reason: data.reason,
          requiredPlan: data.requiredPlan,
          limitInfo: data.limitInfo
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to check feature access',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Check feature access error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Apply coupon code
  static async applyCoupon(couponCode, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/coupon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ couponCode })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          coupon: data.coupon,
          discount: data.discount,
          message: data.message,
          validUntil: data.validUntil
        };
      } else {
        return {
          success: false,
          error: data.error || 'Invalid coupon code',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Apply coupon error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get subscription analytics
  static async getAnalytics(token, period = 'month') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/subscription/analytics?period=${period}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          analytics: data.analytics,
          usageTrends: data.usageTrends,
          costAnalysis: data.costAnalysis,
          recommendations: data.recommendations
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch analytics',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
}

export default SubscriptionService;