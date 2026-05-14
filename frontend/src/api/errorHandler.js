// frontend/src/api/errorHandler.js
export class ApiError extends Error {
  constructor(message, status = 500, code = null, errors = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export const errorHandler = {
  /**
   * Handle API errors
   * @param {Error} error - Error object
   * @returns {Object} - Formatted error response
   */
  handle: (error) => {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return {
            success: false,
            error: data.message || 'Bad request',
            status,
            code: data.code,
            errors: data.errors,
          };
          
        case 401:
          return {
            success: false,
            error: 'Session expired. Please login again.',
            status,
            code: 'SESSION_EXPIRED',
          };
          
        case 403:
          return {
            success: false,
            error: 'You do not have permission to access this resource.',
            status,
            code: 'FORBIDDEN',
          };
          
        case 404:
          return {
            success: false,
            error: 'Resource not found.',
            status,
            code: 'NOT_FOUND',
          };
          
        case 422:
          return {
            success: false,
            error: 'Validation failed',
            status,
            code: 'VALIDATION_ERROR',
            errors: data.errors,
          };
          
        case 429:
          return {
            success: false,
            error: 'Too many requests. Please try again later.',
            status,
            code: 'RATE_LIMIT',
          };
          
        case 500:
        case 502:
        case 503:
        case 504:
          return {
            success: false,
            error: 'Server error. Please try again later.',
            status,
            code: 'SERVER_ERROR',
          };
          
        default:
          return {
            success: false,
            error: data.message || 'An error occurred',
            status,
            code: data.code,
          };
      }
    } else if (error.request) {
      // Request was made but no response
      return {
        success: false,
        error: 'Network error. Please check your connection.',
        status: 0,
        code: 'NETWORK_ERROR',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: error.message || 'An unexpected error occurred',
        status: null,
        code: 'UNKNOWN_ERROR',
      };
    }
  },
  
  /**
   * Show user-friendly error message
   * @param {Object} error - Error object
   * @param {Function} showToast - Toast notification function
   */
  showUserError: (error, showToast) => {
    const messages = {
      SESSION_EXPIRED: 'Your session has expired. Please login again.',
      FORBIDDEN: 'You don\'t have permission to perform this action.',
      NOT_FOUND: 'The requested resource was not found.',
      VALIDATION_ERROR: 'Please check your input and try again.',
      RATE_LIMIT: 'You\'ve reached the usage limit. Please try again later or upgrade your plan.',
      NETWORK_ERROR: 'Network error. Please check your internet connection.',
      SERVER_ERROR: 'Server error. Our team has been notified.',
      SUBSCRIPTION_REQUIRED: 'Please upgrade your plan to access this feature.',
      TRIAL_EXPIRED: 'Your free trial has expired. Please upgrade to continue.',
    };
    
    const userMessage = messages[error.code] || error.error || 'An error occurred. Please try again.';
    
    if (showToast) {
      showToast({
        type: 'error',
        message: userMessage,
        duration: 5000,
      });
    } else {
      console.error('API Error:', error);
    }
  },
  
  /**
   * Check if error is a specific type
   * @param {Object} error - Error object
   * @param {string} code - Error code to check
   * @returns {boolean} - True if error matches code
   */
  isError: (error, code) => {
    return error.code === code;
  },
  
  /**
   * Extract validation errors
   * @param {Object} error - Error object
   * @returns {Object} - Validation errors by field
   */
  getValidationErrors: (error) => {
    if (error.errors && Array.isArray(error.errors)) {
      const errors = {};
      error.errors.forEach(err => {
        errors[err.field] = err.message;
      });
      return errors;
    }
    return {};
  },
};

export default errorHandler;