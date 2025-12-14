/**
 * backend/src/utils/logger.js
 * Logging Utility
 * 
 * Provides comprehensive logging functionality:
 * - Console logging
 * - File logging
 * - Error tracking
 * - Request logging
 * - Performance monitoring
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// ============================================
// CONFIGURATION
// ============================================

const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  directory: process.env.LOG_DIRECTORY || 'logs',
  maxSize: '20m',      // Max size per log file
  maxFiles: '14d',     // Keep logs for 14 days
  datePattern: 'YYYY-MM-DD'
};

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

// Colors for console output
const LOG_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

// ============================================
// CREATE LOG DIRECTORY
// ============================================

const logsDir = path.join(process.cwd(), LOG_CONFIG.directory);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// ============================================
// CUSTOM LOG FORMATS
// ============================================

/**
 * Console Format (Colorized)
 */
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    const { timestamp, level, message, ...meta } = info;
    
    let log = `[${timestamp}] ${level}: ${message}`;
    
    // Add metadata if present
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

/**
 * File Format (JSON)
 */
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

/**
 * Simple Format (Plain Text)
 */
const simpleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf((info) => {
    return `[${info.timestamp}] ${info.level.toUpperCase()}: ${info.message}`;
  })
);

// ============================================
// CREATE WINSTON LOGGER
// ============================================

winston.addColors(LOG_COLORS);

const logger = winston.createLogger({
  levels: LOG_LEVELS,
  level: LOG_CONFIG.level,
  transports: []
});

// ============================================
// TRANSPORTS
// ============================================

// Console Transport (Development)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat
    })
  );
}

// File Transport - All Logs
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'combined.log'),
    format: fileFormat,
    maxsize: LOG_CONFIG.maxSize,
    maxFiles: LOG_CONFIG.maxFiles
  })
);

// File Transport - Error Logs Only
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'error.log'),
    level: 'error',
    format: fileFormat,
    maxsize: LOG_CONFIG.maxSize,
    maxFiles: LOG_CONFIG.maxFiles
  })
);

// File Transport - HTTP/Request Logs
logger.add(
  new winston.transports.File({
    filename: path.join(logsDir, 'http.log'),
    level: 'http',
    format: fileFormat,
    maxsize: LOG_CONFIG.maxSize,
    maxFiles: LOG_CONFIG.maxFiles
  })
);

// ============================================
// LOGGING METHODS
// ============================================

/**
 * Log Error
 * @param {String} message - Error message
 * @param {Object} meta - Additional metadata
 */
export const logError = (message, meta = {}) => {
  logger.error(message, meta);
};

/**
 * Log Warning
 * @param {String} message - Warning message
 * @param {Object} meta - Additional metadata
 */
export const logWarn = (message, meta = {}) => {
  logger.warn(message, meta);
};

/**
 * Log Info
 * @param {String} message - Info message
 * @param {Object} meta - Additional metadata
 */
export const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

/**
 * Log HTTP Request
 * @param {String} message - Request message
 * @param {Object} meta - Request metadata
 */
export const logHttp = (message, meta = {}) => {
  logger.http(message, meta);
};

/**
 * Log Debug
 * @param {String} message - Debug message
 * @param {Object} meta - Additional metadata
 */
export const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

// ============================================
// SPECIALIZED LOGGING
// ============================================

/**
 * Log Authentication Event
 * @param {String} event - Event type (login, logout, signup)
 * @param {String} userId - User ID
 * @param {Object} details - Additional details
 */
export const logAuth = (event, userId, details = {}) => {
  logInfo(`Auth: ${event}`, {
    event,
    userId,
    ...details,
    category: 'authentication'
  });
};

/**
 * Log Database Operation
 * @param {String} operation - Operation type
 * @param {String} collection - Collection/table name
 * @param {Object} details - Additional details
 */
export const logDatabase = (operation, collection, details = {}) => {
  logDebug(`DB: ${operation} on ${collection}`, {
    operation,
    collection,
    ...details,
    category: 'database'
  });
};

/**
 * Log API Request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Number} responseTime - Response time in ms
 */
export const logRequest = (req, res, responseTime) => {
  const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${responseTime}ms`;
  
  logHttp(message, {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    userId: req.user?.userId,
    category: 'request'
  });
};

/**
 * Log API Error
 * @param {Object} req - Express request object
 * @param {Error} error - Error object
 */
export const logApiError = (req, error) => {
  logError(`API Error: ${error.message}`, {
    method: req.method,
    url: req.originalUrl,
    error: error.message,
    stack: error.stack,
    userId: req.user?.userId,
    category: 'api-error'
  });
};

/**
 * Log Tool Usage
 * @param {String} toolId - Tool ID
 * @param {String} userId - User ID
 * @param {Object} details - Usage details
 */
export const logToolUsage = (toolId, userId, details = {}) => {
  logInfo(`Tool Used: ${toolId}`, {
    toolId,
    userId,
    ...details,
    category: 'tool-usage'
  });
};

/**
 * Log Subscription Event
 * @param {String} event - Event type (upgrade, cancel, renew)
 * @param {String} userId - User ID
 * @param {Object} details - Subscription details
 */
export const logSubscription = (event, userId, details = {}) => {
  logInfo(`Subscription: ${event}`, {
    event,
    userId,
    ...details,
    category: 'subscription'
  });
};

/**
 * Log Performance Metric
 * @param {String} metric - Metric name
 * @param {Number} value - Metric value
 * @param {String} unit - Unit of measurement
 */
export const logPerformance = (metric, value, unit = 'ms') => {
  logDebug(`Performance: ${metric}`, {
    metric,
    value,
    unit,
    category: 'performance'
  });
};

/**
 * Log Security Event
 * @param {String} event - Security event
 * @param {Object} details - Event details
 */
export const logSecurity = (event, details = {}) => {
  logWarn(`Security: ${event}`, {
    event,
    ...details,
    category: 'security'
  });
};

// ============================================
// REQUEST LOGGER MIDDLEWARE
// ============================================

/**
 * Express Middleware for Request Logging
 * @returns {Function} Express middleware
 */
export const requestLogger = () => {
  return (req, res, next) => {
    const startTime = Date.now();

    // Log request
    logHttp(`→ ${req.method} ${req.originalUrl}`, {
      method: req.method,
      url: req.originalUrl,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    // Capture response
    res.on('finish', () => {
      const responseTime = Date.now() - startTime;
      logRequest(req, res, responseTime);
    });

    next();
  };
};

// ============================================
// ERROR LOGGER MIDDLEWARE
// ============================================

/**
 * Express Middleware for Error Logging
 * @returns {Function} Express middleware
 */
export const errorLogger = () => {
  return (err, req, res, next) => {
    logApiError(req, err);
    next(err);
  };
};

// ============================================
// UTILITIES
// ============================================

/**
 * Create Child Logger
 * @param {Object} defaultMeta - Default metadata for all logs
 * @returns {Object} Child logger
 */
export const createChildLogger = (defaultMeta = {}) => {
  return logger.child(defaultMeta);
};

/**
 * Log Startup Info
 * @param {Number} port - Server port
 * @param {String} env - Environment
 */
export const logStartup = (port, env = process.env.NODE_ENV) => {
  logInfo('='.repeat(50));
  logInfo(`🚀 Server starting...`);
  logInfo(`📍 Port: ${port}`);
  logInfo(`🌍 Environment: ${env}`);
  logInfo(`📝 Log Level: ${LOG_CONFIG.level}`);
  logInfo(`📁 Logs Directory: ${logsDir}`);
  logInfo('='.repeat(50));
};

/**
 * Log Shutdown Info
 */
export const logShutdown = () => {
  logInfo('='.repeat(50));
  logInfo('🛑 Server shutting down...');
  logInfo('👋 Goodbye!');
  logInfo('='.repeat(50));
};

/**
 * Clear Old Logs
 * @param {Number} days - Number of days to keep
 */
export const clearOldLogs = (days = 14) => {
  const files = fs.readdirSync(logsDir);
  const now = Date.now();
  const cutoff = days * 24 * 60 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    const age = now - stats.mtimeMs;

    if (age > cutoff) {
      fs.unlinkSync(filePath);
      logInfo(`Deleted old log file: ${file}`);
    }
  });
};

/**
 * Get Log Statistics
 * @returns {Object} Log statistics
 */
export const getLogStats = () => {
  const files = fs.readdirSync(logsDir);
  let totalSize = 0;

  const fileStats = files.map(file => {
    const filePath = path.join(logsDir, file);
    const stats = fs.statSync(filePath);
    totalSize += stats.size;

    return {
      name: file,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size),
      modified: stats.mtime
    };
  });

  return {
    totalFiles: files.length,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    files: fileStats
  };
};

/**
 * Format Bytes
 * @param {Number} bytes - Bytes
 * @returns {String} Formatted string
 */
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// ============================================
// STREAM FOR MORGAN
// ============================================

/**
 * Stream for Morgan HTTP Logger
 */
export const morganStream = {
  write: (message) => {
    logHttp(message.trim());
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Core methods
  error: logError,
  warn: logWarn,
  info: logInfo,
  http: logHttp,
  debug: logDebug,

  // Specialized methods
  auth: logAuth,
  database: logDatabase,
  request: logRequest,
  apiError: logApiError,
  toolUsage: logToolUsage,
  subscription: logSubscription,
  performance: logPerformance,
  security: logSecurity,

  // Middleware
  requestLogger,
  errorLogger,

  // Utilities
  createChildLogger,
  startup: logStartup,
  shutdown: logShutdown,
  clearOldLogs,
  getLogStats,
  
  // Stream
  morganStream,

  // Direct access to Winston logger
  logger
};
