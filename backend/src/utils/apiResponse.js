/**
 * backend/src/utils/apiResponse.js
 * Standard API Response Format
 * 
 * Provides consistent response formatting across all API endpoints:
 * - Success responses
 * - Error responses
 * - Pagination
 * - Standard HTTP status codes
 */

// ============================================
// HTTP STATUS CODES
// ============================================

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,

  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503
};

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  UNAUTHORIZED: 'UNAUTHORIZED',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Resources
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // User
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_INACTIVE: 'USER_INACTIVE',
  USER_BANNED: 'USER_BANNED',

  // Subscription
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  SUBSCRIPTION_EXPIRED: 'SUBSCRIPTION_EXPIRED',
  SUBSCRIPTION_LIMIT_REACHED: 'SUBSCRIPTION_LIMIT_REACHED',
  INVALID_SUBSCRIPTION: 'INVALID_SUBSCRIPTION',
  TRIAL_EXPIRED: 'TRIAL_EXPIRED',

  // Usage Limits
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  MONTHLY_LIMIT_REACHED: 'MONTHLY_LIMIT_REACHED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE'
};

// ============================================
// SUCCESS RESPONSES
// ============================================

/**
 * Standard Success Response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 * @param {Object} meta - Additional metadata
 */
export const sendSuccess = (res, data = {}, message = 'Success', statusCode = HTTP_STATUS.OK, meta = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  });
};

/**
 * Success with Data Only
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendData = (res, data, statusCode = HTTP_STATUS.OK) => {
  return sendSuccess(res, data, 'Success', statusCode);
};

/**
 * Success with Message Only
 * @param {Object} res - Express response object
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code (default: 200)
 */
export const sendMessage = (res, message, statusCode = HTTP_STATUS.OK) => {
  return sendSuccess(res, {}, message, statusCode);
};

/**
 * Created Response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {String} message - Success message
 */
export const sendCreated = (res, data, message = 'Resource created successfully') => {
  return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * No Content Response (204)
 * @param {Object} res - Express response object
 */
export const sendNoContent = (res) => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

// ============================================
// ERROR RESPONSES
// ============================================

/**
 * Standard Error Response
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Number} statusCode - HTTP status code (default: 500)
 * @param {String} errorCode - Error code
 * @param {Object} details - Additional error details
 */
export const sendError = (
  res,
  message = 'An error occurred',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  errorCode = ERROR_CODES.INTERNAL_ERROR,
  details = null
) => {
  const response = {
    success: false,
    message,
    error: {
      code: errorCode,
      statusCode
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  };

  if (details) {
    response.error.details = details;
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && details?.stack) {
    response.error.stack = details.stack;
  }

  return res.status(statusCode).json(response);
};

/**
 * Validation Error Response (400)
 * @param {Object} res - Express response object
 * @param {Array|Object} errors - Validation errors
 * @param {String} message - Error message
 */
export const sendValidationError = (res, errors, message = 'Validation failed') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.BAD_REQUEST,
    ERROR_CODES.VALIDATION_ERROR,
    { errors }
  );
};

/**
 * Not Found Error (404)
 * @param {Object} res - Express response object
 * @param {String} resource - Resource name
 * @param {String} message - Custom message
 */
export const sendNotFound = (res, resource = 'Resource', message = null) => {
  return sendError(
    res,
    message || `${resource} not found`,
    HTTP_STATUS.NOT_FOUND,
    ERROR_CODES.RESOURCE_NOT_FOUND
  );
};

/**
 * Unauthorized Error (401)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const sendUnauthorized = (res, message = 'Unauthorized access') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.UNAUTHORIZED,
    ERROR_CODES.UNAUTHORIZED
  );
};

/**
 * Forbidden Error (403)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const sendForbidden = (res, message = 'Access forbidden') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.FORBIDDEN,
    ERROR_CODES.UNAUTHORIZED
  );
};

/**
 * Conflict Error (409)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 */
export const sendConflict = (res, message = 'Resource already exists') => {
  return sendError(
    res,
    message,
    HTTP_STATUS.CONFLICT,
    ERROR_CODES.RESOURCE_ALREADY_EXISTS
  );
};

/**
 * Rate Limit Error (429)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Object} retryAfter - Retry after info
 */
export const sendRateLimitError = (res, message = 'Rate limit exceeded', retryAfter = null) => {
  if (retryAfter) {
    res.set('Retry-After', retryAfter);
  }

  return sendError(
    res,
    message,
    HTTP_STATUS.TOO_MANY_REQUESTS,
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    { retryAfter }
  );
};

/**
 * Internal Server Error (500)
 * @param {Object} res - Express response object
 * @param {String} message - Error message
 * @param {Error} error - Error object
 */
export const sendInternalError = (res, message = 'Internal server error', error = null) => {
  return sendError(
    res,
    message,
    HTTP_STATUS.INTERNAL_SERVER_ERROR,
    ERROR_CODES.INTERNAL_ERROR,
    error ? { message: error.message, stack: error.stack } : null
  );
};

// ============================================
// PAGINATED RESPONSES
// ============================================

/**
 * Paginated Success Response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total items count
 * @param {String} message - Success message
 */
export const sendPaginated = (
  res,
  data,
  page = 1,
  limit = 10,
  total = 0,
  message = 'Success'
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: parseInt(page),
      itemsPerPage: parseInt(limit),
      totalItems: total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};

/**
 * Cursor-based Pagination Response
 * @param {Object} res - Express response object
 * @param {Array} data - Array of items
 * @param {String} nextCursor - Cursor for next page
 * @param {String} prevCursor - Cursor for previous page
 * @param {Boolean} hasMore - Has more items
 */
export const sendCursorPaginated = (
  res,
  data,
  nextCursor = null,
  prevCursor = null,
  hasMore = false
) => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    data,
    pagination: {
      nextCursor,
      prevCursor,
      hasMore
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};

// ============================================
// SPECIALIZED RESPONSES
// ============================================

/**
 * Authentication Success Response
 * @param {Object} res - Express response object
 * @param {Object} user - User data
 * @param {String} token - JWT token
 * @param {Object} extra - Additional data
 */
export const sendAuthSuccess = (res, user, token, extra = {}) => {
  return sendSuccess(
    res,
    {
      user,
      token,
      ...extra
    },
    'Authentication successful',
    HTTP_STATUS.OK
  );
};

/**
 * Upload Success Response
 * @param {Object} res - Express response object
 * @param {String} url - Uploaded file URL
 * @param {Object} fileInfo - File information
 */
export const sendUploadSuccess = (res, url, fileInfo = {}) => {
  return sendSuccess(
    res,
    {
      url,
      ...fileInfo
    },
    'File uploaded successfully',
    HTTP_STATUS.CREATED
  );
};

/**
 * Subscription Response
 * @param {Object} res - Express response object
 * @param {Object} subscription - Subscription data
 * @param {String} message - Custom message
 */
export const sendSubscriptionSuccess = (res, subscription, message = 'Subscription updated') => {
  return sendSuccess(res, { subscription }, message);
};

/**
 * Usage Stats Response
 * @param {Object} res - Express response object
 * @param {Object} stats - Usage statistics
 */
export const sendStatsSuccess = (res, stats) => {
  return sendSuccess(res, { stats }, 'Statistics retrieved successfully');
};

// ============================================
// BATCH RESPONSES
// ============================================

/**
 * Batch Operation Response
 * @param {Object} res - Express response object
 * @param {Number} successful - Number of successful operations
 * @param {Number} failed - Number of failed operations
 * @param {Array} errors - Array of error details
 */
export const sendBatchResponse = (res, successful, failed, errors = []) => {
  const statusCode = failed === 0 ? HTTP_STATUS.OK : HTTP_STATUS.PARTIAL_CONTENT;

  return res.status(statusCode).json({
    success: failed === 0,
    message: `Batch operation completed: ${successful} successful, ${failed} failed`,
    data: {
      successful,
      failed,
      total: successful + failed,
      errors: errors.length > 0 ? errors : undefined
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
};

// ============================================
// CUSTOM RESPONSE BUILDER
// ============================================

/**
 * Custom Response Builder
 * @param {Object} res - Express response object
 * @param {Object} options - Response options
 */
export const sendCustom = (res, options = {}) => {
  const {
    success = true,
    message = 'Success',
    data = {},
    statusCode = HTTP_STATUS.OK,
    meta = {},
    error = null
  } = options;

  const response = {
    success,
    message,
    ...(data && { data }),
    ...(error && { error }),
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };

  return res.status(statusCode).json(response);
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Success
  sendSuccess,
  sendData,
  sendMessage,
  sendCreated,
  sendNoContent,

  // Errors
  sendError,
  sendValidationError,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendConflict,
  sendRateLimitError,
  sendInternalError,

  // Pagination
  sendPaginated,
  sendCursorPaginated,

  // Specialized
  sendAuthSuccess,
  sendUploadSuccess,
  sendSubscriptionSuccess,
  sendStatsSuccess,
  sendBatchResponse,

  // Custom
  sendCustom,

  // Constants
  HTTP_STATUS,
  ERROR_CODES
};
