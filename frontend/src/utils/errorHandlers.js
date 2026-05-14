/**
 * Client-side error handling utilities
 * Centralized error handling, logging, and user feedback
 */

import { ERROR_MESSAGES, HTTP_STATUS } from './constants';

/**
 * Error logger class
 */
class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
  }

  /**
   * Log error
   * @param {Error} error - Error object
   * @param {Object} context - Additional context
   */
  log(error, context = {}) {
    const errorLog = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      name: error.name,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(errorLog);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Send to error tracking service (e.g., Sentry)
    this.sendToErrorTracking(errorLog);
  }

  /**
   * Send error to tracking service
   * @param {Object} errorLog - Error log object
   */
  sendToErrorTracking(errorLog) {
    // Implement your error tracking service here
    // Example: Sentry, LogRocket, etc.
    
    if (window.Sentry) {
      window.Sentry.captureException(new Error(errorLog.message), {
        extra: errorLog.context
      });
    }
  }

  /**
   * Get all logs
   * @returns {Array} - Array of error logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
  }

  /**
   * Export logs as JSON
   * @returns {string} - JSON string of logs
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const errorLogger = new ErrorLogger();

/**
 * Parse API error response
 * @param {Object} error - Error object from API
 * @returns {Object} - Parsed error with user-friendly message
 */
export const parseAPIError = (error) => {
  // Network error
  if (!error.response) {
    return {
      message: ERROR_MESSAGES.NETWORK_ERROR,
      code: 'NETWORK_ERROR',
      status: null,
      details: error.message
    };
  }

  const { status, data } = error.response;

  // Map status codes to messages
  const statusMessages = {
    [HTTP_STATUS.BAD_REQUEST]: data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
    [HTTP_STATUS.UNAUTHORIZED]: ERROR_MESSAGES.UNAUTHORIZED,
    [HTTP_STATUS.FORBIDDEN]: ERROR_MESSAGES.FORBIDDEN,
    [HTTP_STATUS.NOT_FOUND]: ERROR_MESSAGES.NOT_FOUND,
    [HTTP_STATUS.CONFLICT]: data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
    [HTTP_STATUS.UNPROCESSABLE_ENTITY]: data?.error || ERROR_MESSAGES.VALIDATION_ERROR,
    [HTTP_STATUS.TOO_MANY_REQUESTS]: 'Too many requests. Please try again later.',
    [HTTP_STATUS.INTERNAL_SERVER_ERROR]: ERROR_MESSAGES.SERVER_ERROR,
    [HTTP_STATUS.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable. Please try again later.'
  };

  return {
    message: statusMessages[status] || ERROR_MESSAGES.UNKNOWN,
    code: data?.code || `HTTP_${status}`,
    status,
    details: data?.details || null,
    validationErrors: data?.validationErrors || null
  };
};

/**
 * Handle API error with user feedback
 * @param {Object} error - Error object
 * @param {Object} options - Options for error handling
 */
export const handleAPIError = (error, options = {}) => {
  const {
    showNotification = true,
    logError = true,
    context = {}
  } = options;

  const parsedError = parseAPIError(error);

  // Log error
  if (logError) {
    errorLogger.log(error, { ...context, parsedError });
  }

  // Show user notification
  if (showNotification && window.showNotification) {
    window.showNotification({
      type: 'error',
      message: parsedError.message
    });
  }

  return parsedError;
};

/**
 * Handle form validation errors
 * @param {Object} errors - Validation errors object
 * @returns {Object} - Formatted errors for display
 */
export const handleValidationErrors = (errors) => {
  if (!errors || typeof errors !== 'object') {
    return {};
  }

  const formattedErrors = {};

  Object.keys(errors).forEach(field => {
    const error = errors[field];
    
    if (typeof error === 'string') {
      formattedErrors[field] = error;
    } else if (Array.isArray(error)) {
      formattedErrors[field] = error[0]; // Take first error
    } else if (error.message) {
      formattedErrors[field] = error.message;
    }
  });

  return formattedErrors;
};

/**
 * Handle network errors
 * @param {Error} error - Network error
 */
export const handleNetworkError = (error) => {
  errorLogger.log(error, { type: 'NETWORK_ERROR' });

  if (window.showNotification) {
    window.showNotification({
      type: 'error',
      message: ERROR_MESSAGES.NETWORK_ERROR,
      duration: 5000
    });
  }
};

/**
 * Handle timeout errors
 * @param {Error} error - Timeout error
 */
export const handleTimeoutError = (error) => {
  errorLogger.log(error, { type: 'TIMEOUT_ERROR' });

  if (window.showNotification) {
    window.showNotification({
      type: 'warning',
      message: ERROR_MESSAGES.TIMEOUT,
      duration: 5000
    });
  }
};

/**
 * Handle authentication errors
 * @param {Object} error - Auth error
 * @param {Function} onUnauthorized - Callback for unauthorized
 */
export const handleAuthError = (error, onUnauthorized) => {
  const parsedError = parseAPIError(error);

  if (parsedError.status === HTTP_STATUS.UNAUTHORIZED) {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Call callback
    if (onUnauthorized) {
      onUnauthorized();
    }

    if (window.showNotification) {
      window.showNotification({
        type: 'warning',
        message: ERROR_MESSAGES.AUTH.SESSION_EXPIRED,
        duration: 5000
      });
    }
  }

  errorLogger.log(error, { type: 'AUTH_ERROR', parsedError });
};

/**
 * Handle file upload errors
 * @param {Error} error - Upload error
 * @param {File} file - File that failed to upload
 */
export const handleFileUploadError = (error, file) => {
  errorLogger.log(error, { 
    type: 'FILE_UPLOAD_ERROR',
    fileName: file?.name,
    fileSize: file?.size,
    fileType: file?.type
  });

  let message = 'File upload failed. Please try again.';

  if (file?.size > 10 * 1024 * 1024) {
    message = 'File is too large. Maximum size is 10MB.';
  } else if (error.message?.includes('network')) {
    message = 'Upload failed due to network error. Please check your connection.';
  }

  if (window.showNotification) {
    window.showNotification({
      type: 'error',
      message,
      duration: 5000
    });
  }
};

/**
 * Handle subscription errors
 * @param {Object} error - Subscription error
 */
export const handleSubscriptionError = (error) => {
  const parsedError = parseAPIError(error);

  errorLogger.log(error, { type: 'SUBSCRIPTION_ERROR', parsedError });

  const message = parsedError.details?.message || ERROR_MESSAGES.SUBSCRIPTION.PAYMENT_FAILED;

  if (window.showNotification) {
    window.showNotification({
      type: 'error',
      message,
      duration: 7000
    });
  }
};

/**
 * Global error handler
 * @param {Error} error - Error object
 * @param {Object} errorInfo - Error info from React
 */
export const globalErrorHandler = (error, errorInfo) => {
  errorLogger.log(error, { 
    type: 'GLOBAL_ERROR',
    componentStack: errorInfo?.componentStack
  });

  // Show generic error message to user
  if (window.showNotification) {
    window.showNotification({
      type: 'error',
      message: 'Something went wrong. Please refresh the page.',
      duration: 10000
    });
  }

  // In development, show detailed error
  if (process.env.NODE_ENV === 'development') {
    console.error('Global Error:', error, errorInfo);
  }
};

/**
 * Retry failed request
 * @param {Function} requestFn - Request function to retry
 * @param {number} maxRetries - Maximum retry attempts
 * @param {number} delay - Delay between retries (ms)
 * @returns {Promise} - Request promise
 */
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }

      // Wait before retry (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
};

/**
 * Safe async wrapper
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Wrapped function that won't throw
 */
export const safeAsync = (fn) => {
  return async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorLogger.log(error, { 
        type: 'SAFE_ASYNC_ERROR',
        function: fn.name
      });
      return null;
    }
  };
};

/**
 * Check if error is network error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && error.message?.toLowerCase().includes('network');
};

/**
 * Check if error is timeout error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isTimeoutError = (error) => {
  return error.code === 'ECONNABORTED' || error.message?.toLowerCase().includes('timeout');
};

/**
 * Check if error is authorization error
 * @param {Error} error - Error to check
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  return error.response?.status === HTTP_STATUS.UNAUTHORIZED;
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly message
 */
export const getUserFriendlyErrorMessage = (error) => {
  if (isNetworkError(error)) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  if (isTimeoutError(error)) {
    return ERROR_MESSAGES.TIMEOUT;
  }

  if (isAuthError(error)) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }

  const parsedError = parseAPIError(error);
  return parsedError.message;
};

export default {
  errorLogger,
  parseAPIError,
  handleAPIError,
  handleValidationErrors,
  handleNetworkError,
  handleTimeoutError,
  handleAuthError,
  handleFileUploadError,
  handleSubscriptionError,
  globalErrorHandler,
  retryRequest,
  safeAsync,
  isNetworkError,
  isTimeoutError,
  isAuthError,
  getUserFriendlyErrorMessage
};