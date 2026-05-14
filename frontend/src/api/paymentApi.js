import api from './axiosConfig';
import { ENDPOINTS } from './endpoints';

export const paymentApi = {
  /**
   * Initialize Paystack payment
   * @param {Object} paymentData - Payment initialization data
   * @returns {Promise} - Payment initialization response
   */
  initializePayment: async (paymentData) => {
    try {
      const response = await api.post(ENDPOINTS.PAYMENT.CREATE_CHECKOUT, paymentData);
      
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to initialize payment',
        status: error.status,
      };
    }
  },
  
  /**
   * Verify Paystack payment
   * @param {string} reference - Payment reference
   * @returns {Promise} - Payment verification response
   */
  verifyPayment: async (reference, provider = null) => {
    try {
      const response = await api.get(`${ENDPOINTS.PAYMENT.VERIFY}/${reference}`, {
        params: provider ? { provider } : undefined,
      });
      
      // Update local subscription if successful
      if (response.data.data?.subscription) {
        localStorage.setItem('subscription', JSON.stringify(response.data.data.subscription));
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
        error: error.error || 'Failed to verify payment',
        status: error.status,
      };
    }
  },
  
  /**
   * Get subscription plans
   * @returns {Promise} - Available plans
   */
  getPlans: async () => {
    try {
      const response = await api.get(ENDPOINTS.PAYMENT.PLANS);
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
   * Create subscription
   * @param {string} planId - Plan ID
   * @param {Object} paymentMethod - Payment method data
   * @returns {Promise} - Subscription creation response
   */
  createSubscription: async (planId, paymentMethod = null) => {
    try {
      const payload = { planId };
      if (paymentMethod) {
        payload.paymentMethod = paymentMethod;
      }
      
      const response = await api.post(`${ENDPOINTS.SUBSCRIPTION.UPGRADE}`, payload);
      
      // Update local subscription
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
        error: error.error || 'Failed to create subscription',
        status: error.status,
      };
    }
  },
  
  /**
   * Get payment methods
   * @returns {Promise} - User's payment methods
   */
  getPaymentMethods: async () => {
    return {
      success: false,
      data: null,
      error: 'Payment methods endpoint is not configured yet.',
      status: 501,
    };
  },

  getProviders: async () => {
    try {
      const response = await api.get(ENDPOINTS.PAYMENT.PROVIDERS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch payment providers',
        status: error.status,
      };
    }
  },
  
  /**
   * Add payment method
   * @param {Object} paymentMethod - Payment method data
   * @returns {Promise} - Add payment method response
   */
  addPaymentMethod: async (paymentMethod) => {
    return {
      success: false,
      data: null,
      error: 'Direct payment method updates are not configured yet.',
      status: 501,
    };
  },
  
  /**
   * Get invoices
   * @param {number} limit - Number of invoices
   * @param {number} offset - Pagination offset
   * @returns {Promise} - Invoices list
   */
  getInvoices: async (limit = 10, offset = 0) => {
    try {
      const response = await api.get('/payment/transaction-history', {
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
   * Download invoice
   * @param {string} invoiceId - Invoice ID
   * @returns {Promise} - Invoice PDF
   */
  downloadInvoice: async (invoiceId) => {
    try {
      const response = await api.get(`/users/invoices/${invoiceId}/download`, {
        responseType: 'blob',
      });
      return {
        success: true,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to download invoice',
        status: error.status,
      };
    }
  },
  
  /**
   * Generate Paystack reference
   * @returns {string} - Unique reference
   */
  generateReference: () => {
    return `MERIT_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  },

  startSubscriptionCheckout: async ({ plan, email, provider = 'paystack' }) => {
    const result = await paymentApi.initializePayment({ plan, email, provider });

    if (!result.success) {
      return result;
    }

    if (result.data?.authorization_url) {
      window.location.href = result.data.authorization_url;
      return {
        success: true,
        data: result.data,
        error: null,
      };
    }

    return {
      success: false,
      data: null,
      error: 'No authorization URL returned by payment gateway.',
      status: 500,
    };
  },
};

export default paymentApi;
