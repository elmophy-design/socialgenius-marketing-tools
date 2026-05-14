// frontend/src/api/socialMediaApi.js
import api from './axiosConfig';
import { ENDPOINTS } from './endpoints';

export const socialMediaApi = {
  /**
   * Generate social media content
   * @param {Object} params - Generation parameters
   * @returns {Promise} - Generated content
   */
  generateContent: async (params) => {
    try {
      const response = await api.post(ENDPOINTS.SOCIAL_MEDIA.GENERATE, params);
      return {
        success: true,
        data: response.data.data,
        usage: response.data.usage,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to generate social media content',
        status: error.status,
      };
    }
  },
  
  /**
   * Schedule social media post
   * @param {Object} postData - Post data for scheduling
   * @returns {Promise} - Scheduling response
   */
  schedulePost: async (postData) => {
    try {
      const response = await api.post(ENDPOINTS.SOCIAL_MEDIA.SCHEDULE, postData);
      return {
        success: true,
        data: response.data.data,
        usage: response.data.usage,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to schedule post',
        status: error.status,
      };
    }
  },
  
  /**
   * Get social media analytics
   * @param {string} period - Time period
   * @param {string} platform - Specific platform (optional)
   * @returns {Promise} - Analytics data
   */
  getAnalytics: async (period = '7days', platform = null) => {
    try {
      const params = { period };
      if (platform) params.platform = platform;
      
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.ANALYTICS, { params });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch analytics',
        status: error.status,
      };
    }
  },
  
  /**
   * Get supported platforms
   * @returns {Promise} - Platform list
   */
  getPlatforms: async () => {
    try {
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.PLATFORMS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch platforms',
        status: error.status,
      };
    }
  },
  
  /**
   * Get social media connections
   * @returns {Promise} - User's connected accounts
   */
  getConnections: async () => {
    try {
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.CONNECTIONS);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch connections',
        status: error.status,
      };
    }
  },
  
  /**
   * Connect social media account
   * @param {string} platform - Platform name
   * @param {Object} authData - Authentication data
   * @returns {Promise} - Connection response
   */
  connectAccount: async (platform, authData) => {
    try {
      const response = await api.post(`${ENDPOINTS.SOCIAL_MEDIA.CONNECTIONS}/${platform}`, authData);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to connect account',
        status: error.status,
      };
    }
  },
  
  /**
   * Disconnect social media account
   * @param {string} platform - Platform name
   * @returns {Promise} - Disconnection response
   */
  disconnectAccount: async (platform) => {
    try {
      const response = await api.delete(`${ENDPOINTS.SOCIAL_MEDIA.CONNECTIONS}/${platform}`);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to disconnect account',
        status: error.status,
      };
    }
  },
  
  /**
   * Get scheduled posts
   * @param {string} status - Post status (scheduled, published, failed)
   * @param {string} platform - Filter by platform
   * @param {number} limit - Number of posts
   * @param {number} offset - Pagination offset
   * @returns {Promise} - Scheduled posts
   */
  getScheduledPosts: async (status = 'scheduled', platform = null, limit = 20, offset = 0) => {
    try {
      const params = { status, limit, offset };
      if (platform) params.platform = platform;
      
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.POSTS, { params });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch scheduled posts',
        status: error.status,
      };
    }
  },
  
  /**
   * Update scheduled post
   * @param {string} postId - Post ID
   * @param {Object} updates - Updated post data
   * @returns {Promise} - Update response
   */
  updateScheduledPost: async (postId, updates) => {
    try {
      const response = await api.put(`${ENDPOINTS.SOCIAL_MEDIA.POSTS}/${postId}`, updates);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to update post',
        status: error.status,
      };
    }
  },
  
  /**
   * Delete scheduled post
   * @param {string} postId - Post ID
   * @returns {Promise} - Deletion response
   */
  deleteScheduledPost: async (postId) => {
    try {
      const response = await api.delete(`${ENDPOINTS.SOCIAL_MEDIA.POSTS}/${postId}`);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to delete post',
        status: error.status,
      };
    }
  },
  
  /**
   * Get generation history
   * @param {number} limit - Number of items
   * @param {number} offset - Pagination offset
   * @returns {Promise} - Generation history
   */
  getHistory: async (limit = 20, offset = 0) => {
    try {
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.HISTORY, {
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
        error: error.error || 'Failed to fetch history',
        status: error.status,
      };
    }
  },
  
  /**
   * Get hashtag suggestions
   * @param {string} keyword - Keyword for hashtags
   * @param {string} platform - Target platform
   * @returns {Promise} - Hashtag suggestions
   */
  getHashtagSuggestions: async (keyword, platform = 'instagram') => {
    try {
      const response = await api.get(ENDPOINTS.SOCIAL_MEDIA.HASHTAGS, {
        params: { keyword, platform },
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
        error: error.error || 'Failed to fetch hashtag suggestions',
        status: error.status,
      };
    }
  },
  
  /**
   * Get content calendar
   * @param {string} month - Month in YYYY-MM format
   * @returns {Promise} - Calendar data
   */
  getContentCalendar: async (month = null) => {
    try {
      const params = month ? { month } : {};
      const response = await api.get(`${ENDPOINTS.SOCIAL_MEDIA.BASE}/calendar`, { params });
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch content calendar',
        status: error.status,
      };
    }
  },
  
  /**
   * Bulk schedule posts
   * @param {Array} posts - Array of posts to schedule
   * @returns {Promise} - Bulk scheduling response
   */
  bulkSchedule: async (posts) => {
    try {
      const response = await api.post(`${ENDPOINTS.SOCIAL_MEDIA.BASE}/bulk-schedule`, { posts });
      return {
        success: true,
        data: response.data.data,
        usage: response.data.usage,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to bulk schedule posts',
        status: error.status,
      };
    }
  },
};

export default socialMediaApi;