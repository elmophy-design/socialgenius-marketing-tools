// frontend/src/services/authService.js
import jwtDecode from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const normalizeServiceError = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    const joined = value
      .map((item) => normalizeServiceError(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }
  if (typeof value === 'object') {
    if (typeof value.message === 'string') {
      return value.message;
    }

    const joined = Object.values(value)
      .map((item) => normalizeServiceError(item, ''))
      .filter(Boolean)
      .join(', ');
    return joined || fallback;
  }
  return fallback;
};

class AuthService {
  // Validate token expiration
  static isTokenValid(token) {
    if (!token) return false;
    
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  }

  // Extract user info from token
  static getUserFromToken(token) {
    try {
      return jwtDecode(token);
    } catch (error) {
      return null;
    }
  }

  // Login user
  static async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store tokens and user data
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          data,
          user: data.user,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.error || 'Login failed',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        isNetworkError: true
      };
    }
  }

  // Signup user
  static async signup(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store tokens and user data
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          data,
          user: data.user,
          token: data.token
        };
      } else {
        // Handle validation errors
        let errorMessage = data.error || 'Signup failed';
        if (data.errors) {
          errorMessage = Object.values(data.errors).join(', ');
        }
        
        return {
          success: false,
          error: errorMessage,
          validationErrors: data.errors,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.',
        isNetworkError: true
      };
    }
  }

  // Forgot password
  static async forgotPassword(email) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message,
        error: normalizeServiceError(data.error || data.message, 'Failed to send reset email'),
        status: response.status,
        data
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Reset password
  static async resetPassword(token, newPassword, confirmPassword) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message,
        error: data.error,
        validationErrors: data.errors,
        status: response.status
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Update profile
  static async updateProfile(userId, profileData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Update stored user data
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, ...data.user };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return {
          success: true,
          user: data.user,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Profile update failed',
          validationErrors: data.errors,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Change password
  static async changePassword(userId, currentPassword, newPassword, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/change-password/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message,
        error: data.error,
        validationErrors: data.errors,
        status: response.status
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Logout
  static logout() {
    this.clearAuthData();
  }

  // Verify email
  static async verifyEmail(verificationToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email/${verificationToken}`, {
        method: 'POST'
      });

      const data = await response.json();

      return {
        success: response.ok,
        message: data.message,
        error: data.error,
        status: response.status
      };
    } catch (error) {
      console.error('Verify email error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Refresh token
  static async refreshToken(refreshToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          token: data.token,
          user: data.user
        };
      } else {
        return {
          success: false,
          error: data.error || 'Token refresh failed'
        };
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      return {
        success: false,
        error: 'Network error during token refresh'
      };
    }
  }

  // Helper methods
  static setAuthData(token, user) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Set token in axios interceptor if using axios
    if (window.axios) {
      window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  static clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
    
    // Clear axios authorization header
    if (window.axios) {
      delete window.axios.defaults.headers.common['Authorization'];
    }
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static getToken() {
    return localStorage.getItem('token');
  }

  static isAuthenticated() {
    const token = this.getToken();
    return token && this.isTokenValid(token);
  }

  // Social login methods (if implemented in backend)
  static async socialLogin(provider, accessToken) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/${provider}/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        this.setAuthData(data.token, data.user);
        return {
          success: true,
          data,
          user: data.user,
          token: data.token
        };
      } else {
        return {
          success: false,
          error: data.error || 'Social login failed'
        };
      }
    } catch (error) {
      console.error('Social login error:', error);
      return {
        success: false,
        error: 'Network error during social login'
      };
    }
  }
}

export default AuthService;
