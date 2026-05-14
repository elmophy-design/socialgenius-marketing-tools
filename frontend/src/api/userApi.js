// frontend/src/api/userApi.js
import api from './axiosConfig';
import { ENDPOINTS } from './endpoints';

const getUserPayload = (responseData) => (
  responseData?.data ||
  responseData?.user ||
  responseData?.profile ||
  null
);

export const userApi = {
  /**
   * Get user profile
   * @returns {Promise} - User profile data
   */
  getProfile: async () => {
    try {
      const response = await api.get(ENDPOINTS.USER.PROFILE);
      const profileData = getUserPayload(response.data);
      return {
        success: true,
        data: profileData,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch profile',
        status: error.status,
      };
    }
  },
  
  /**
   * Update user profile
   * @param {Object} profileData - Updated profile data
   * @returns {Promise} - Update response
   */
  updateProfile: async (profileData) => {
    try {
      const response = await api.put(ENDPOINTS.USER.UPDATE_PROFILE, profileData);
      const updatedProfile = getUserPayload(response.data);
      
      // Update stored user data
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = { ...currentUser, ...updatedProfile };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        data: updatedProfile,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to update profile',
        status: error.status,
        errors: error.errors,
      };
    }
  },
  
  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise} - Password change response
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post(ENDPOINTS.USER.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
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
        error: error.error || 'Failed to change password',
        status: error.status,
      };
    }
  },
  
  /**
   * Upload user avatar
   * @param {File} avatarFile - Avatar image file
   * @returns {Promise} - Upload response
   */
  uploadAvatar: async (avatarFile) => {
    try {
      const imageUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('Failed to read image file'));
        reader.readAsDataURL(avatarFile);
      });

      const response = await api.post(ENDPOINTS.USER.UPLOAD_AVATAR, { imageUrl });
      const avatarUrl = response.data?.profilePicture || response.data?.data?.profilePicture || imageUrl;
      
      // Update stored user data with new avatar
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        avatar: avatarUrl,
        profilePicture: avatarUrl,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return {
        success: true,
        data: {
          profilePicture: avatarUrl,
        },
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to upload avatar',
        status: error.status,
      };
    }
  },
  
  /**
   * Delete user account
   * @param {string} password - User password for confirmation
   * @returns {Promise} - Account deletion response
   */
  deleteAccount: async (password) => {
    try {
      const response = await api.delete(ENDPOINTS.USER.DELETE_ACCOUNT, {
        data: { password },
      });
      
      // Clear local storage on successful deletion
      if (response.data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('subscription');
        localStorage.removeItem('refreshToken');
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
        error: error.error || 'Failed to delete account',
        status: error.status,
      };
    }
  },
  
  /**
   * Get user preferences
   * @returns {Promise} - User preferences
   */
  getPreferences: async () => {
    try {
      const response = await api.get(ENDPOINTS.USER.PREFERENCES);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to fetch preferences',
        status: error.status,
      };
    }
  },
  
  /**
   * Update user preferences
   * @param {Object} preferences - Updated preferences
   * @returns {Promise} - Update response
   */
  updatePreferences: async (preferences) => {
    try {
      const response = await api.put(ENDPOINTS.USER.PREFERENCES, preferences);
      return {
        success: true,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to update preferences',
        status: error.status,
      };
    }
  },

  updateBrandVoice: async (brandVoiceData) => {
    try {
      const response = await api.put('/users/brand-voice', brandVoiceData);
      return {
        success: true,
        data: response.data.brandVoice,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to update brand voice',
        status: error.status,
      };
    }
  },

  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return {
        success: true,
        data: response.data?.data || [],
        unreadCount: response.data?.unreadCount || 0,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        unreadCount: 0,
        error: error.error || 'Failed to fetch notifications',
        status: error.status,
      };
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return {
        success: true,
        data: response.data?.data || null,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to mark notification as read',
        status: error.status,
      };
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await api.patch('/notifications/read-all');
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Failed to mark all notifications as read',
        status: error.status,
      };
    }
  },

  clearNotifications: async () => {
    try {
      await api.delete('/notifications');
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Failed to clear notifications',
        status: error.status,
      };
    }
  },

  getConnectedAccounts: async () => {
    try {
      const response = await api.get('/users/connected-accounts');
      return {
        success: true,
        data: response.data?.connectedAccounts || [],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.error || 'Failed to fetch connected accounts',
        status: error.status,
      };
    }
  },

  connectSocialAccount: async (payload) => {
    try {
      const response = await api.post('/users/connected-accounts', payload);
      return {
        success: true,
        data: response.data?.connectedAccounts || [],
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.error || 'Failed to connect social account',
        status: error.status,
      };
    }
  },

  disconnectSocialAccount: async (platform, accountId) => {
    try {
      await api.delete(`/users/connected-accounts/${platform}/${accountId}`);
      return {
        success: true,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        error: error.error || 'Failed to disconnect social account',
        status: error.status,
      };
    }
  },
};

export default userApi;
