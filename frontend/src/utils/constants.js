/**
 * Client-side constants
 * Application-wide constants, enums, and configuration values
 */

// ========== API ENDPOINTS ==========
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    LOGOUT: '/api/auth/logout',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    REFRESH_TOKEN: '/api/auth/refresh-token',
    UPDATE_PROFILE: '/api/auth/profile'
  },
  
  TOOLS: {
    SOCIAL_MEDIA: '/api/tools/social-media',
    CONTENT_IDEAS: '/api/tools/content-ideas',
    EMAIL_SUBJECT: '/api/tools/email-subject',
    HEADLINE_ANALYZER: '/api/tools/headline',
    SEO_META: '/api/tools/seo-meta',
    VALUE_PROPOSITION: '/api/tools/value-proposition',
    AD_COPY: '/api/tools/ad-copy',
    FUNNEL_BUILDER: '/api/tools/funnel'
  },
  
  SUBSCRIPTION: {
    PLANS: '/api/subscription/plans',
    CURRENT: '/api/subscription/current',
    UPDATE: '/api/subscription/update',
    CANCEL: '/api/subscription/cancel',
    HISTORY: '/api/subscription/history'
  },
  
  PAYMENT: {
    INITIALIZE: '/api/payment/initialize',
    VERIFY: '/api/payment/verify',
    CALLBACK: '/api/payment/callback',
    HISTORY: '/api/payment/history'
  }
};

// ========== ROUTES ==========
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  UPGRADE: '/upgrade',
  PAYMENT_CALLBACK: '/payment/callback',
  
  TOOLS: {
    SOCIAL_MEDIA: '/tools/social-media',
    CONTENT_IDEAS: '/tools/content-ideas',
    EMAIL_SUBJECT: '/tools/email-subject',
    HEADLINE_ANALYZER: '/tools/headline-analyzer',
    SEO_META: '/tools/seo-meta',
    VALUE_PROPOSITION: '/tools/value-proposition',
    AD_COPY: '/tools/ad-copy',
    FUNNEL_BUILDER: '/tools/funnel-builder'
  }
};

// ========== SUBSCRIPTION PLANS ==========
export const SUBSCRIPTION_PLANS = {
  TRIAL: {
    id: 'trial',
    name: 'Trial',
    price: 0,
    interval: 'lifetime',
    features: [
      'Limited content generation',
      'Basic social media tools',
      '5 posts per month',
      'Email support'
    ],
    limits: {
      postsPerMonth: 5,
      toolsAccess: ['social-media', 'content-ideas'],
      apiCalls: 50
    },
    color: '#6B7280',
    icon: '🎯'
  },
  
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 2900,
    interval: 'monthly',
    features: [
      '50 posts per month',
      'All basic tools',
      'Social media scheduling',
      'Priority email support',
      'Analytics dashboard'
    ],
    limits: {
      postsPerMonth: 50,
      toolsAccess: ['social-media', 'content-ideas', 'email-subject', 'headline-analyzer'],
      apiCalls: 500
    },
    color: '#3B82F6',
    icon: '⭐'
  },
  
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 4900,
    interval: 'monthly',
    popular: true,
    features: [
      'Unlimited posts',
      'All tools included',
      'Advanced AI features',
      'Team collaboration',
      'Priority support',
      'Custom branding',
      'Advanced analytics'
    ],
    limits: {
      postsPerMonth: -1, // Unlimited
      toolsAccess: 'all',
      apiCalls: -1 // Unlimited
    },
    color: '#F59E0B',
    icon: '👑'
  },
  
  PRO: {
    id: 'pro',
    name: 'Professional',
    price: 9900,
    interval: 'monthly',
    features: [
      'Everything in Premium',
      'White-label options',
      'API access',
      'Dedicated account manager',
      'Custom integrations',
      'SLA guarantee',
      'Advanced reporting'
    ],
    limits: {
      postsPerMonth: -1,
      toolsAccess: 'all',
      apiCalls: -1,
      whiteLabel: true,
      apiAccess: true
    },
    color: '#8B5CF6',
    icon: '🚀'
  }
};

// ========== SOCIAL MEDIA PLATFORMS ==========
export const SOCIAL_PLATFORMS = {
  INSTAGRAM: {
    id: 'instagram',
    name: 'Instagram',
    icon: '📷',
    color: '#E4405F',
    maxLength: 2200,
    maxHashtags: 30,
    features: ['images', 'videos', 'stories', 'reels']
  },
  
  TWITTER: {
    id: 'twitter',
    name: 'Twitter',
    icon: '🐦',
    color: '#1DA1F2',
    maxLength: 280,
    maxHashtags: 10,
    features: ['text', 'images', 'videos', 'threads']
  },
  
  FACEBOOK: {
    id: 'facebook',
    name: 'Facebook',
    icon: '👍',
    color: '#1877F2',
    maxLength: 63206,
    maxHashtags: 20,
    features: ['text', 'images', 'videos', 'live']
  },
  
  LINKEDIN: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    maxLength: 3000,
    maxHashtags: 10,
    features: ['text', 'images', 'videos', 'articles']
  },
  
  TIKTOK: {
    id: 'tiktok',
    name: 'TikTok',
    icon: '🎵',
    color: '#000000',
    maxLength: 2200,
    maxHashtags: 30,
    features: ['videos', 'duets', 'stitches']
  },
  
  YOUTUBE: {
    id: 'youtube',
    name: 'YouTube',
    icon: '📺',
    color: '#FF0000',
    maxLength: 5000,
    maxHashtags: 15,
    features: ['videos', 'shorts', 'community']
  },
  
  PINTEREST: {
    id: 'pinterest',
    name: 'Pinterest',
    icon: '📌',
    color: '#E60023',
    maxLength: 500,
    maxHashtags: 20,
    features: ['images', 'pins', 'boards']
  }
};

// ========== CONTENT TYPES ==========
export const CONTENT_TYPES = {
  PROMOTIONAL: {
    id: 'promotional',
    name: 'Promotional',
    icon: '🎯',
    color: '#F59E0B',
    description: 'Sales-focused content to promote products or services'
  },
  
  EDUCATIONAL: {
    id: 'educational',
    name: 'Educational',
    icon: '📚',
    color: '#3B82F6',
    description: 'Informative content that teaches or explains'
  },
  
  ENGAGEMENT: {
    id: 'engagement',
    name: 'Engagement',
    icon: '💬',
    color: '#8B5CF6',
    description: 'Interactive content to boost audience engagement'
  },
  
  INSPIRATIONAL: {
    id: 'inspirational',
    name: 'Inspirational',
    icon: '✨',
    color: '#EC4899',
    description: 'Motivational content to inspire your audience'
  },
  
  ENTERTAINMENT: {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎭',
    color: '#10B981',
    description: 'Fun and entertaining content'
  },
  
  NEWS: {
    id: 'news',
    name: 'News & Updates',
    icon: '📰',
    color: '#EF4444',
    description: 'Latest news and industry updates'
  }
};

// ========== CONTENT NICHES ==========
export const CONTENT_NICHES = [
  { id: 'technology', name: 'Technology', icon: '💻', color: '#3B82F6' },
  { id: 'business', name: 'Business', icon: '💼', color: '#10B981' },
  { id: 'marketing', name: 'Marketing', icon: '📊', color: '#F59E0B' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '🌟', color: '#EC4899' },
  { id: 'health', name: 'Health & Fitness', icon: '🏥', color: '#EF4444' },
  { id: 'food', name: 'Food & Cooking', icon: '🍔', color: '#F97316' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: '#06B6D4' },
  { id: 'fashion', name: 'Fashion', icon: '👗', color: '#8B5CF6' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: '#14B8A6' },
  { id: 'music', name: 'Music', icon: '🎵', color: '#A855F7' },
  { id: 'art', name: 'Art & Design', icon: '🎨', color: '#EC4899' },
  { id: 'gaming', name: 'Gaming', icon: '🎮', color: '#6366F1' },
  { id: 'education', name: 'Education', icon: '📚', color: '#0EA5E9' },
  { id: 'finance', name: 'Finance', icon: '💰', color: '#059669' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#DC2626' }
];

// ========== TONE OPTIONS ==========
export const TONE_OPTIONS = [
  { id: 'professional', name: 'Professional', icon: '💼' },
  { id: 'casual', name: 'Casual', icon: '😊' },
  { id: 'friendly', name: 'Friendly', icon: '🤝' },
  { id: 'formal', name: 'Formal', icon: '🎩' },
  { id: 'humorous', name: 'Humorous', icon: '😄' },
  { id: 'inspirational', name: 'Inspirational', icon: '✨' },
  { id: 'authoritative', name: 'Authoritative', icon: '👨‍💼' },
  { id: 'conversational', name: 'Conversational', icon: '💬' }
];

// ========== TARGET AUDIENCES ==========
export const TARGET_AUDIENCES = [
  { id: 'general', name: 'General Public', icon: '👥' },
  { id: 'business', name: 'Business Professionals', icon: '💼' },
  { id: 'entrepreneurs', name: 'Entrepreneurs', icon: '🚀' },
  { id: 'students', name: 'Students', icon: '🎓' },
  { id: 'millennials', name: 'Millennials', icon: '📱' },
  { id: 'genz', name: 'Gen Z', icon: '🎮' },
  { id: 'parents', name: 'Parents', icon: '👨‍👩‍👧‍👦' },
  { id: 'professionals', name: 'Industry Professionals', icon: '👔' }
];

// ========== VALIDATION RULES ==========
export const VALIDATION_RULES = {
  EMAIL: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254
  },
  
  PASSWORD: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  NAME: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s'-]+$/
  },
  
  PHONE: {
    pattern: /^(\+?234)?[789]\d{9}$/
  },
  
  USERNAME: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Z0-9_]+$/
  }
};

// ========== ERROR MESSAGES ==========
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_EXISTS: 'This email is already registered.',
    WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address.'
  },
  
  SUBSCRIPTION: {
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    PLAN_NOT_FOUND: 'Selected plan not found.',
    ALREADY_SUBSCRIBED: 'You already have an active subscription.',
    UPGRADE_REQUIRED: 'Please upgrade your plan to access this feature.'
  }
};

// ========== SUCCESS MESSAGES ==========
export const SUCCESS_MESSAGES = {
  LOGIN: 'Successfully logged in!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Successfully logged out.',
  PASSWORD_RESET: 'Password reset email sent. Please check your inbox.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully.',
  PAYMENT_SUCCESS: 'Payment successful!',
  POST_CREATED: 'Post created successfully!',
  POST_SCHEDULED: 'Post scheduled successfully!',
  CONTENT_GENERATED: 'Content generated successfully!'
};

// ========== STATUS CODES ==========
export const HTTP_STATUS = {
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
  SERVICE_UNAVAILABLE: 503
};

// ========== LOCAL STORAGE KEYS ==========
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'token',
  USER: 'user',
  SUBSCRIPTION: 'subscription',
  THEME: 'theme',
  LANGUAGE: 'language',
  SOCIAL_MEDIA_HISTORY: 'socialMediaHistory',
  SAVED_POSTS: 'savedPosts',
  CUSTOM_TEMPLATES: 'customTemplates',
  RECENT_SEARCHES: 'recentSearches',
  USER_PREFERENCES: 'userPreferences'
};

// ========== DATE FORMATS ==========
export const DATE_FORMATS = {
  SHORT: 'short',
  MEDIUM: 'medium',
  LONG: 'long',
  FULL: 'full',
  ISO: 'iso',
  RELATIVE: 'relative'
};

// ========== FILE UPLOAD LIMITS ==========
export const FILE_LIMITS = {
  IMAGE: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  
  VIDEO: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo'],
    allowedExtensions: ['mp4', 'mov', 'avi']
  },
  
  DOCUMENT: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowedExtensions: ['pdf', 'doc', 'docx']
  }
};

// ========== PAGINATION ==========
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};

// ========== ANALYTICS EVENTS ==========
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  SIGNUP: 'signup',
  LOGIN: 'login',
  LOGOUT: 'logout',
  SUBSCRIPTION_START: 'subscription_start',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  CONTENT_GENERATED: 'content_generated',
  POST_CREATED: 'post_created',
  POST_SCHEDULED: 'post_scheduled',
  TOOL_USED: 'tool_used',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed'
};

// ========== THEME COLORS ==========
export const THEME_COLORS = {
  PRIMARY: '#3B82F6',
  SECONDARY: '#8B5CF6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#06B6D4',
  
  GRAY: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827'
  }
};

// ========== BREAKPOINTS ==========
export const BREAKPOINTS = {
  MOBILE: 480,
  TABLET: 768,
  DESKTOP: 1024,
  LARGE_DESKTOP: 1280,
  EXTRA_LARGE: 1536
};

// ========== REGEX PATTERNS ==========
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_NG: /^(\+?234)?[789]\d{9}$/,
  PHONE_US: /^(\+?1)?[2-9]\d{9}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  HASHTAG: /#[a-zA-Z0-9_]+/g,
  MENTION: /@[a-zA-Z0-9_]+/g,
  CREDIT_CARD: /^\d{13,19}$/,
  CVV: /^\d{3,4}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/
};

// ========== ANIMATION DURATIONS ==========
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 1000
};

// ========== Z-INDEX LAYERS ==========
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  NOTIFICATION: 1080
};

// ========== FEATURE FLAGS ==========
export const FEATURES = {
  SOCIAL_MEDIA_GENERATOR: true,
  CONTENT_IDEAS: true,
  EMAIL_SUBJECT_TESTER: true,
  HEADLINE_ANALYZER: true,
  SEO_META_GENERATOR: true,
  VALUE_PROPOSITION: true,
  AD_COPY_GENERATOR: true,
  FUNNEL_BUILDER: true,
  ANALYTICS: true,
  TEAM_COLLABORATION: false, // Coming soon
  API_ACCESS: false // Coming soon
};

// ========== EXTERNAL LINKS ==========
export const EXTERNAL_LINKS = {
  SUPPORT: 'mailto:support@socialgenius.meritlives.com',
  DOCUMENTATION: 'https://docs.socialgenius.meritlives.com',
  TERMS: 'https://socialgenius.meritlives.com/terms',
  PRIVACY: 'https://socialgenius.meritlives.com/privacy',
  TWITTER: 'https://twitter.com/socialgenius',
  FACEBOOK: 'https://facebook.com/socialgenius',
  LINKEDIN: 'https://linkedin.com/company/socialgenius'
};

export default {
  API_ENDPOINTS,
  ROUTES,
  SUBSCRIPTION_PLANS,
  SOCIAL_PLATFORMS,
  CONTENT_TYPES,
  CONTENT_NICHES,
  TONE_OPTIONS,
  TARGET_AUDIENCES,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  STORAGE_KEYS,
  DATE_FORMATS,
  FILE_LIMITS,
  PAGINATION,
  ANALYTICS_EVENTS,
  THEME_COLORS,
  BREAKPOINTS,
  REGEX_PATTERNS,
  ANIMATION,
  Z_INDEX,
  FEATURES,
  EXTERNAL_LINKS
};