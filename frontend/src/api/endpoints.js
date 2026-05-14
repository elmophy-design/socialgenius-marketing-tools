// frontend/src/api/endpoints.js
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

export const ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: `${API_BASE}/auth/login`,
    SIGNUP: `${API_BASE}/auth/signup`,
    LOGOUT: `${API_BASE}/auth/logout`,
    REFRESH_TOKEN: `${API_BASE}/auth/refresh`,
    FORGOT_PASSWORD: `${API_BASE}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE}/auth/reset-password`,
    VERIFY_EMAIL: `${API_BASE}/auth/verify-email`,
    GOOGLE_AUTH: `${API_BASE}/auth/google`,
  },
  
  // User Management
  USER: {
    PROFILE: `${API_BASE}/users/profile`,
    UPDATE_PROFILE: `${API_BASE}/users/profile`,
    CHANGE_PASSWORD: `${API_BASE}/users/change-password`,
    UPLOAD_AVATAR: `${API_BASE}/users/profile-picture`,
    DELETE_ACCOUNT: `${API_BASE}/users/account`,
    PREFERENCES: `${API_BASE}/users/preferences`,
  },
  
  // Subscription & Billing
  SUBSCRIPTION: {
    GET: `${API_BASE}/subscription`,
    PLANS: `${API_BASE}/subscription/plans`,
    UPGRADE: `${API_BASE}/subscription/upgrade`,
    CANCEL: `${API_BASE}/subscription/cancel`,
    REACTIVATE: `${API_BASE}/subscription/reactivate`,
    INVOICES: `${API_BASE}/subscription/invoices`,
    PAYMENT_METHODS: `${API_BASE}/subscription/payment-methods`,
  },
  
  // Payment Processing
  PAYMENT: {
    CREATE_CHECKOUT: `${API_BASE}/payment/initialize`,
    VERIFY: `${API_BASE}/payment/verify`,
    PLANS: `${API_BASE}/payment/plans`,
    PROVIDERS: `${API_BASE}/payment/providers`,
    WEBHOOK: `${API_BASE}/payment/webhook`,
    CANCEL: `${API_BASE}/payment/cancel`,
  },
  
  // Usage Tracking
  USAGE: {
    GET: `${API_BASE}/usage`,
    STATS: `${API_BASE}/usage/stats`,
    LIMITS: `${API_BASE}/usage/limits`,
    HISTORY: `${API_BASE}/usage/history`,
    RESET: `${API_BASE}/usage/reset`,
  },
  
  // Tools - Generic
  TOOLS: {
    LIST: `${API_BASE}/tools`,
    STATS: `${API_BASE}/tools/stats`,
    FAVORITES: `${API_BASE}/tools/favorites`,
    RECENT: `${API_BASE}/tools/recent`,
  },
  
  // Individual Tools
  VALUE_PROPOSITION: `${API_BASE}/tools/value-proposition`,
  HEADLINE_ANALYZER: `${API_BASE}/tools/headline-analyzer`,
  SEO_META: `${API_BASE}/tools/seo-meta`,
  EMAIL_TESTER: `${API_BASE}/tools/email-tester`,
  CONTENT_IDEA: `${API_BASE}/tools/content-idea`,
  AD_COPY: `${API_BASE}/tools/ad-copy`,
  FUNNEL_BUILDER: `${API_BASE}/tools/funnel-builder`,
  
  // Social Media Generator (Premium)
  SOCIAL_MEDIA: {
    BASE: `${API_BASE}/tools/social-media`,
    GENERATE: `${API_BASE}/tools/social-media/generate`,
    SCHEDULE: `${API_BASE}/tools/social-media/schedule`,
    ANALYTICS: `${API_BASE}/tools/social-media/analytics`,
    PLATFORMS: `${API_BASE}/tools/social-media/platforms`,
    CONNECTIONS: `${API_BASE}/tools/social-media/connections`,
    POSTS: `${API_BASE}/tools/social-media/posts`,
    HISTORY: `${API_BASE}/tools/social-media/history`,
    HASHTAGS: `${API_BASE}/tools/social-media/hashtags`,
  },
  
  // Analytics
  ANALYTICS: {
    OVERVIEW: `${API_BASE}/analytics/overview`,
    TOOL_USAGE: `${API_BASE}/analytics/tool-usage`,
    USER_GROWTH: `${API_BASE}/analytics/user-growth`,
    REVENUE: `${API_BASE}/analytics/revenue`,
  },
  
  // Notifications
  NOTIFICATIONS: {
    GET: `${API_BASE}/notifications`,
    MARK_READ: `${API_BASE}/notifications/read`,
    CLEAR: `${API_BASE}/notifications/clear`,
    SETTINGS: `${API_BASE}/notifications/settings`,
  },
  
  // Settings
  SETTINGS: {
    GET: `${API_BASE}/settings`,
    UPDATE: `${API_BASE}/settings`,
    EXPORT_DATA: `${API_BASE}/settings/export`,
  },
};

// Helper function to build URL with query params
export const buildUrl = (baseUrl, params = {}) => {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });
  return url.toString();
};

// Time periods for analytics
export const TIME_PERIODS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  ALL_TIME: 'all',
};

export default ENDPOINTS;
