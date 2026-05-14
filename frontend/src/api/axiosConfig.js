// frontend/src/api/axiosConfig.js
import axios from 'axios';

// Base configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Enable cookies for auth
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (token) {
      // Add authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add user ID to headers if available
    if (user && user._id) {
      config.headers['X-User-ID'] = user._id;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = generateRequestId();
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Handle network errors
    if (!error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        success: false,
        error: 'Network error. Please check your connection.',
        status: 0,
      });
    }
    
    const { status, data } = error.response;
    
    // Handle 401 Unauthorized (token expired)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Try to refresh token if refresh token exists
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          
          if (refreshResponse.data.success) {
            const { token, refreshToken: newRefreshToken } = refreshResponse.data;
            
            // Update tokens in storage
            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', newRefreshToken);
            
            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
        }
      }
      
      // If refresh fails, logout user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('subscription');
      localStorage.removeItem('refreshToken');
      
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}&reason=session_expired`;
      
      return Promise.reject({
        success: false,
        error: 'Session expired. Please login again.',
        status: 401,
      });
    }
    
    // Handle 403 Forbidden
    if (status === 403) {
      return Promise.reject({
        success: false,
        error: data.message || 'You do not have permission to access this resource.',
        status: 403,
        code: data.code,
      });
    }
    
    // Handle 429 Rate Limit
    if (status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 60;
      return Promise.reject({
        success: false,
        error: 'Too many requests. Please try again later.',
        status: 429,
        retryAfter,
      });
    }
    
    // Handle 500+ errors
    if (status >= 500) {
      return Promise.reject({
        success: false,
        error: 'Server error. Please try again later.',
        status: status,
      });
    }
    
    // Handle validation errors (422)
    if (status === 422 && data.errors) {
      return Promise.reject({
        success: false,
        error: 'Validation failed',
        errors: data.errors,
        status: 422,
      });
    }
    
    // Default error handling
    return Promise.reject({
      success: false,
      error: data.message || 'An error occurred',
      status: status,
      data: data,
    });
  }
);

// Helper function to generate unique request ID
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Add request/response logging in development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        data: config.data,
        params: config.params,
      });
      return config;
    },
    (error) => {
      console.error('Request error:', error);
      return Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      console.log(`✅ ${response.status} ${response.config.url}`, {
        data: response.data,
        headers: response.headers,
      });
      return response;
    },
    (error) => {
      console.error(`❌ ${error.response?.status || 'Network'} ${error.config?.url}`, {
        error: error.response?.data || error.message,
      });
      return Promise.reject(error);
    }
  );
}

export default api;
