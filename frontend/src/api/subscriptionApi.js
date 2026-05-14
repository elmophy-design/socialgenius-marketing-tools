// frontend/src/api/subscriptionApi.js
import api from './axiosConfig';
import { ENDPOINTS } from './endpoints';

export const subscriptionApi = {
  /**
   * Get current subscription
   * @returns {Promise} - Subscription data
   */
  getSubscription: async () => {
    try {
      const response = await api.get(ENDPOINTS.SUBSCRIPTION.GET);
      
      // Update stored subscription
      if (response.data.data) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data));
      }
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch subscription',
        status: error.status,
      };
    }
  },
  
  /**
   * Get available subscription plans
   * @returns {Promise} - Subscription plans
   */
  getPlans: async () => {
    try {
      const response = await api.get(ENDPOINTS.SUBSCRIPTION.PLANS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch plans',
        status: error.status,
      };
    }
  },
  
  /**
   * Upgrade subscription plan
   * @param {string} planId - Plan to upgrade to
   * @param {string} paymentMethodId - Payment method ID (optional)
   * @returns {Promise} - Upgrade response
   */
  upgrade: async (planId, paymentMethodId = null) => {
    try {
      const payload = { planId };
      if (paymentMethodId) {
        payload.paymentMethodId = paymentMethodId;
      }
      
      const response = await api.post(ENDPOINTS.SUBSCRIPTION.UPGRADE, payload);
      
      // Update stored subscription
      if (response.data.data) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data));
      }
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to upgrade subscription',
        status: error.status,
      };
    }
  },
  
  /**
   * Cancel subscription
   * @param {string} reason - Cancellation reason (optional)
   * @returns {Promise} - Cancellation response
   */
  cancel: async (reason = '') => {
    try {
      const response = await api.post(ENDPOINTS.SUBSCRIPTION.CANCEL, { reason });
      
      // Update stored subscription
      if (response.data.data) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data));
      }
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to cancel subscription',
        status: error.status,
      };
    }
  },
  
  /**
   * Reactivate cancelled subscription
   * @returns {Promise} - Reactivation response
   */
  reactivate: async () => {
    try {
      const response = await api.post(ENDPOINTS.SUBSCRIPTION.REACTIVATE);
      
      // Update stored subscription
      if (response.data.data) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data));
      }
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to reactivate subscription',
        status: error.status,
      };
    }
  },
  
  /**
   * Get subscription invoices
   * @param {number} limit - Number of invoices to fetch
   * @param {number} offset - Pagination offset
   * @returns {Promise} - Invoices list
   */
  getInvoices: async (limit = 10, offset = 0) => {
    try {
      const response = await api.get(ENDPOINTS.SUBSCRIPTION.INVOICES, {
        params: { limit, offset },
      });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch invoices',
        status: error.status,
      };
    }
  },
  
  /**
   * Get payment methods
   * @returns {Promise} - Payment methods list
   */
  getPaymentMethods: async () => {
    try {
      const response = await api.get(ENDPOINTS.SUBSCRIPTION.PAYMENT_METHODS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch payment methods',
        status: error.status,
      };
    }
  },
  
  /**
   * Update trial status (for internal use)
   * @param {Object} trialData - Trial data
   * @returns {Promise} - Update response
   */
  updateTrial: async (trialData) => {
    try {
      const response = await api.post(`${ENDPOINTS.SUBSCRIPTION.GET}/trial`, trialData);
      
      // Update stored subscription
      if (response.data.data) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data));
      }
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to update trial',
        status: error.status,
      };
    }
  },
  
  /**
   * Check if user can access feature
   * @param {string} feature - Feature name
   * @param {string} plan - Required plan level
   * @returns {Object} - Access check result
   */
  checkAccess: (subscription, feature, requiredPlan = 'basic') => {
    if (!subscription) {
      return { canAccess: false, reason: 'no_subscription' };
    }
    
    if (subscription.status !== 'active') {
      return { canAccess: false, reason: 'subscription_inactive' };
    }
    
    // Check trial expiry
    if (subscription.plan === 'trial' && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (trialEnd < new Date()) {
        return { canAccess: false, reason: 'trial_expired' };
      }
    }
    
    // Check plan hierarchy
    const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    if (userPlanIndex < requiredPlanIndex) {
      return { 
        canAccess: false, 
        reason: 'upgrade_required', 
        requiredPlan 
      };
    }
    
    return { canAccess: true };
  },
};

export default subscriptionApi;