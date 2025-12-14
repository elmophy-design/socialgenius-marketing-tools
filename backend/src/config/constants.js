/**
 * backend/src/config/constants.js
 * Backend-specific constants for Meritlives Tools Platform
 */

// API Configuration
const API_CONFIG = {
  VERSION: 'v1',
  BASE_PATH: '/api',
  PORT: process.env.PORT || 5000,
  TIMEOUT: 30000, // 30 seconds
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
};

// Database Configuration
const DB_CONFIG = {
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/meritlives-tools',
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  MAX_RETRIES: 3,
  RETRY_DELAY: 5000, // 5 seconds
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// JWT Configuration
const JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  EXPIRATION: process.env.JWT_EXPIRATION || '7d',
  ALGORITHM: 'HS256',
  ISSUER: 'meritlives-tools',
};

// Password Configuration
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 10,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBER: true,
  REQUIRE_SPECIAL_CHAR: false,
};

// Rate Limiting
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // Max 100 requests per window
  MESSAGE: 'Too many requests, please try again later.',
  SKIP_SUCCESSFUL_REQUESTS: false,
};

// CORS Configuration
const CORS_CONFIG = {
  ORIGIN: process.env.CLIENT_URL || 'http://localhost:3000',
  CREDENTIALS: true,
  METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization'],
};

// Subscription Plans
const SUBSCRIPTION_PLANS = {
  TRIAL: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    duration: 7, // days
    features: {
      tools: 8,
      socialAccounts: 1,
      platforms: ['facebook'],
      postsPerDay: 3,
      analytics: false,
      aiContent: false,
      customBranding: false,
      apiAccess: false,
      teamSeats: 1,
      support: 'community',
    },
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 19,
    currency: 'USD',
    interval: 'month',
    features: {
      tools: 8,
      socialAccounts: 3,
      platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
      postsPerDay: 10,
      analytics: false,
      aiContent: false,
      customBranding: false,
      apiAccess: false,
      teamSeats: 1,
      support: 'email',
    },
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 49,
    currency: 'USD',
    interval: 'month',
    popular: true,
    features: {
      tools: 8,
      socialAccounts: 'unlimited',
      platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
      postsPerDay: 'unlimited',
      analytics: true,
      aiContent: true,
      customBranding: true,
      apiAccess: false,
      teamSeats: 1,
      support: 'priority',
    },
  },
  PRO: {
    id: 'pro',
    name: 'Pro',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: {
      tools: 8,
      socialAccounts: 'unlimited',
      platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
      postsPerDay: 'unlimited',
      analytics: true,
      aiContent: true,
      customBranding: true,
      apiAccess: true,
      teamSeats: 5,
      whiteLabel: true,
      dedicatedManager: true,
      support: '24/7',
    },
  },
};

// Tool Limits by Plan
const TOOL_LIMITS = {
  trial: {
    DAILY_GENERATIONS: 3,
    SAVED_CONTENT: 10,
  },
  basic: {
    DAILY_GENERATIONS: 10,
    SAVED_CONTENT: 50,
  },
  premium: {
    DAILY_GENERATIONS: 'unlimited',
    SAVED_CONTENT: 'unlimited',
  },
  pro: {
    DAILY_GENERATIONS: 'unlimited',
    SAVED_CONTENT: 'unlimited',
  },
};

// Social Media Platform Configuration
const SOCIAL_PLATFORMS = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    maxLength: 63206,
    recommendedLength: 500,
    trialAccess: true,
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter/X',
    maxLength: 280,
    recommendedLength: 270,
    trialAccess: false,
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    maxLength: 2200,
    recommendedLength: 300,
    trialAccess: false,
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    maxLength: 3000,
    recommendedLength: 1300,
    trialAccess: false,
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    maxLength: 2200,
    recommendedLength: 150,
    trialAccess: false,
  },
};

// HTTP Status Codes
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Error Messages
const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_EXISTS: 'User already exists with this email',
  USER_NOT_FOUND: 'User not found',
  TOKEN_REQUIRED: 'Access token required',
  INVALID_TOKEN: 'Invalid or expired token',
  UNAUTHORIZED: 'Unauthorized access',
  
  // Validation Errors
  INVALID_EMAIL: 'Invalid email format',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  REQUIRED_FIELD: 'This field is required',
  
  // Subscription Errors
  INVALID_PLAN: 'Invalid subscription plan',
  SUBSCRIPTION_REQUIRED: 'Premium subscription required',
  TRIAL_EXPIRED: 'Trial period has expired',
  LIMIT_REACHED: 'You have reached your plan limit',
  
  // Tool Errors
  TOOL_NOT_FOUND: 'Tool not found',
  GENERATION_FAILED: 'Content generation failed',
  DAILY_LIMIT_REACHED: 'Daily generation limit reached',
  
  // General Errors
  SERVER_ERROR: 'Internal server error',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  VALIDATION_ERROR: 'Validation error',
};

// Success Messages
const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  CONTENT_GENERATED: 'Content generated successfully',
  SAVED_SUCCESS: 'Saved successfully',
  DELETED_SUCCESS: 'Deleted successfully',
};

// Validation Rules
const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  COMPANY_MAX_LENGTH: 100,
  BIO_MAX_LENGTH: 500,
  CONTENT_MAX_LENGTH: 5000,
};

// Pagination
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// File Upload
const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
};

// Email Configuration
const EMAIL_CONFIG = {
  SERVICE: process.env.EMAIL_SERVICE || 'gmail',
  HOST: process.env.EMAIL_HOST,
  PORT: process.env.EMAIL_PORT || 587,
  SECURE: process.env.EMAIL_SECURE === 'true',
  AUTH: {
    USER: process.env.EMAIL_USER,
    PASS: process.env.EMAIL_PASS,
  },
  FROM: process.env.EMAIL_FROM || 'noreply@meritlives.com',
  SUPPORT: process.env.SUPPORT_EMAIL || 'support@meritlives.com',
};

// Logging Configuration
const LOG_CONFIG = {
  LEVEL: process.env.LOG_LEVEL || 'info',
  FILE: process.env.LOG_FILE || './logs/app.log',
  ERROR_FILE: process.env.ERROR_LOG_FILE || './logs/error.log',
  MAX_SIZE: '20m',
  MAX_FILES: 5,
};

// Cache Configuration
const CACHE_CONFIG = {
  TTL: 60 * 60, // 1 hour in seconds
  CHECK_PERIOD: 60 * 2, // 2 minutes
};

// API Keys (for external services)
const API_KEYS = {
  OPENAI: process.env.OPENAI_API_KEY,
  STRIPE: process.env.STRIPE_SECRET_KEY,
  GOOGLE_OAUTH_CLIENT_ID: process.env.GOOGLE_OAUTH_CLIENT_ID,
  GOOGLE_OAUTH_CLIENT_SECRET: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
};

module.exports = {
  API_CONFIG,
  DB_CONFIG,
  JWT_CONFIG,
  PASSWORD_CONFIG,
  RATE_LIMIT,
  CORS_CONFIG,
  SUBSCRIPTION_PLANS,
  TOOL_LIMITS,
  SOCIAL_PLATFORMS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION,
  PAGINATION,
  FILE_UPLOAD,
  EMAIL_CONFIG,
  LOG_CONFIG,
  CACHE_CONFIG,
  API_KEYS,
};
