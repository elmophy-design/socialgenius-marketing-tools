// frontend/src/api/usageApi.js
import api from './axiosConfig';
import { ENDPOINTS, TIME_PERIODS } from './endpoints';

export const usageApi = {
  /**
   * Get current usage data
   * @returns {Promise} - Usage statistics
   */
  getUsage: async () => {
    try {
      const response = await api.get(ENDPOINTS.USAGE.GET);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch usage data',
        status: error.status,
      };
    }
  },
  
  /**
   * Get detailed usage statistics
   * @param {string} period - Time period
   * @param {string} toolId - Specific tool (optional)
   * @returns {Promise} - Detailed usage stats
   */
  getStats: async (period = TIME_PERIODS.LAST_7_DAYS, toolId = null) => {
    try {
      const params = { period };
      if (toolId) params.tool = toolId;
      
      const response = await api.get(ENDPOINTS.USAGE.STATS, { params });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch usage stats',
        status: error.status,
      };
    }
  },
  
  /**
   * Get usage limits based on subscription
   * @returns {Promise} - Usage limits
   */
  getLimits: async () => {
    try {
      const response = await api.get(ENDPOINTS.USAGE.LIMITS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch usage limits',
        status: error.status,
      };
    }
  },
  
  /**
   * Get usage history
   * @param {string} period - Time period
   * @param {string} toolId - Specific tool (optional)
   * @param {number} limit - Number of records
   * @returns {Promise} - Usage history
   */
  getHistory: async (period = TIME_PERIODS.LAST_30_DAYS, toolId = null, limit = 50) => {
    try {
      const params = { period, limit };
      if (toolId) params.tool = toolId;
      
      const response = await api.get(ENDPOINTS.USAGE.HISTORY, { params });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch usage history',
        status: error.status,
      };
    }
  },
  
  /**
   * Reset usage counter (admin only or for new period)
   * @param {string} counter - Counter to reset
   * @returns {Promise} - Reset response
   */
  resetUsage: async (counter = null) => {
    try {
      const payload = counter ? { counter } : {};
      const response = await api.post(ENDPOINTS.USAGE.RESET, payload);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to reset usage',
        status: error.status,
      };
    }
  },
  
  /**
   * Check if user has reached usage limit
   * @param {string} feature - Feature to check
   * @param {Object} subscription - User subscription
   * @param {Object} usage - Current usage
   * @returns {Object} - Limit check result
   */
  checkLimit: (feature, subscription, usage) => {
    if (!subscription) {
      return { hasReachedLimit: true, limit: 0, used: 0, remaining: 0 };
    }
    
    const planLimits = {
      trial: {
        dailyRequests: 20,
        socialMediaPosts: 3,
        aiGenerations: 10,
      },
      basic: {
        dailyRequests: 100,
        socialMediaPosts: 50,
        aiGenerations: 500,
      },
      premium: {
        dailyRequests: 500,
        socialMediaPosts: 'unlimited',
        aiGenerations: 'unlimited',
      },
      enterprise: {
        dailyRequests: 'unlimited',
        socialMediaPosts: 'unlimited',
        aiGenerations: 'unlimited',
      },
    };
    
    const plan = subscription.plan || 'trial';
    const limits = planLimits[plan] || planLimits.trial;
    const featureLimit = limits[feature];
    
    if (featureLimit === 'unlimited') {
      return { hasReachedLimit: false, limit: Infinity, used: usage[feature] || 0, remaining: Infinity };
    }
    
    const used = usage[feature] || 0;
    const remaining = Math.max(0, featureLimit - used);
    const hasReachedLimit = used >= featureLimit;
    
    return {
      hasReachedLimit,
      limit: featureLimit,
      used,
      remaining,
    };
  },
  
  /**
   * Get real-time usage dashboard data
   * @returns {Promise} - Dashboard data
   */
  getDashboardData: async () => {
    try {
      const [usage, limits, stats] = await Promise.all([
        this.getUsage(),
        this.getLimits(),
        this.getStats(TIME_PERIODS.TODAY),
      ]);
      
      return {
        success: usage.success && limits.success && stats.success,
        data: {
          usage: usage.data,
          limits: limits.data,
          stats: stats.data,
        },
        errors: [
          !usage.success && usage.error,
          !limits.success && limits.error,
          !stats.success && stats.error,
        ].filter(Boolean),
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.message || 'Failed to fetch dashboard data',
      };
    }
  },
};

export default usageApi;