// frontend/src/api/authApi.js
import api from './axiosConfig';
import jwtDecode from 'jwt-decode';
import { ENDPOINTS } from './endpoints';

export const authApi = {
  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {boolean} rememberMe - Remember user session
   * @returns {Promise} - Authentication response
   */
  login: async (email, password, rememberMe = false) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
        rememberMe,
      });
      
      if (response.data.success && response.data.token) {
        // Store tokens
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Store refresh token if provided
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Store subscription if provided
        if (response.data.subscription) {
          localStorage.setItem('subscription', JSON.stringify(response.data.subscription));
        }
      }
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Login failed',
        status: error.status,
      };
    }
  },
  
  /**
   * Sign up new user
   * @param {Object} userData - User registration data
   * @returns {Promise} - Registration response
   */
  signup: async (userData) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.SIGNUP, userData);
      
      if (response.data.success && response.data.token) {
        // Store tokens
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Set trial subscription for new users
        const trialSubscription = {
          plan: 'trial',
          status: 'active',
          trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        localStorage.setItem('subscription', JSON.stringify(trialSubscription));
      }
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Signup failed',
        status: error.status,
        errors: error.errors,
      };
    }
  },
  
  /**
   * Logout user
   * @returns {Promise} - Logout response
   */
  logout: async () => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('subscription');
      localStorage.removeItem('refreshToken');
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      // Still clear storage even if API call fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('subscription');
      localStorage.removeItem('refreshToken');
      
      return {
        success: false,
        data: null,
        error: error.error || 'Logout failed',
        status: error.status,
      };
    }
  },
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} - Password reset request response
   */
  forgotPassword: async (email) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email });
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to send reset email',
        status: error.status,
      };
    }
  },
  
  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise} - Password reset response
   */
  resetPassword: async (token, newPassword) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Failed to reset password',
        status: error.status,
      };
    }
  },
  
  /**
   * Verify email with token
   * @param {string} token - Verification token
   * @returns {Promise} - Email verification response
   */
  verifyEmail: async (token) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
      
      // Update user verification status
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user && response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Email verification failed',
        status: error.status,
      };
    }
  },
  
  /**
   * Login with Google OAuth
   * @param {string} token - Google OAuth token
   * @returns {Promise} - OAuth login response
   */
  googleLogin: async (token) => {
    try {
      const response = await api.post(ENDPOINTS.AUTH.GOOGLE_AUTH, { token });
      
      if (response.data.success && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        if (response.data.subscription) {
          localStorage.setItem('subscription', JSON.stringify(response.data.subscription));
        }
      }
      
      return {
        success: response.data.success,
        data: response.data,
        error: null,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error.error || 'Google login failed',
        status: error.status,
      };
    }
  },
  
  /**
   * Get current session information
   * @returns {Object} - Current session data
   */
  getCurrentSession: () => {
    const token = localStorage.getItem('token') || localStorage.getItem('meritlives_token');
    const user = JSON.parse(localStorage.getItem('user') || localStorage.getItem('meritlives_user') || 'null');
    const subscription = JSON.parse(localStorage.getItem('subscription') || 'null');
    
    return {
      isAuthenticated: !!token,
      token,
      user,
      subscription,
    };
  },
  
  /**
   * Check if token is valid
   * @returns {boolean} - Token validity
   */
  isTokenValid: () => {
    const token = localStorage.getItem('token') || localStorage.getItem('meritlives_token');
    if (!token) return false;
    
    try {
      const { exp } = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return exp > currentTime;
    } catch (error) {
      return false;
    }
  },
  
  /**
   * Update stored user data
   * @param {Object} userData - Updated user data
   */
  updateStoredUser: (userData) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...currentUser, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
  },
};

export default authApi;