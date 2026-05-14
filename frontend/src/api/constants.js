// API Endpoints
export const API_ENDPOINTS = {
  // Tools
  TOOLS: {
    AD_COPY: {
      GENERATE: '/tools/ad-copy/generate',
      SAVE: '/tools/ad-copy/save',
      HISTORY: '/tools/ad-copy/history'
    },
    HEADLINE_ANALYZER: {
      ANALYZE: '/tools/headline-analyzer/analyze',
      SCORES: '/tools/headline-analyzer/scores'
    },
    SEO_META: {
      GENERATE: '/tools/seo-meta/generate',
      ANALYZE_KEYWORDS: '/tools/seo-meta/analyze-keywords'
    },
    EMAIL_TESTER: {
      TEST: '/tools/email-tester/test',
      AB_TEST: '/tools/email-tester/ab-test'
    },
    CONTENT_IDEA: {
      GENERATE: '/tools/content-idea/generate',
      LIST: '/tools/content-idea/list'
    },
    FUNNEL_BUILDER: {
      CREATE: '/tools/funnel-builder/create',
      TEMPLATES: '/tools/funnel-builder/templates'
    },
    SOCIAL_MEDIA: {
      CREATE: '/tools/social-media-generator/create',
      SCHEDULE: '/tools/social-media-generator/schedule'
    }
  },
  
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    REFRESH: '/auth/refresh-token',
    PROFILE: '/auth/profile',
    ME: '/auth/me'
  },
  
  // User
  USER: {
    SAVED: '/user/saved',
    ACTIVITY: '/user/activity',
    STATS: '/user/stats'
  }
};

// API Error Codes
export const API_ERROR_CODES = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  RATE_LIMIT: 'RATE_LIMIT',
  TIMEOUT: 'TIMEOUT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
};

// API Timeouts (in milliseconds)
export const API_TIMEOUTS = {
  DEFAULT: 30000,
  AI_GENERATION: 45000,
  UPLOAD: 60000,
  SHORT: 10000
};

// API Retry Configuration
export const API_RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,
  DELAY: 1000,
  RETRYABLE_STATUS_CODES: [408, 429, 500, 502, 503, 504]
};

// Export constants
export default {
  API_ENDPOINTS,
  API_ERROR_CODES,
  API_TIMEOUTS,
  API_RETRY_CONFIG
};