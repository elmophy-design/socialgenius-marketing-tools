// frontend/src/constants/routes.js
/**
 * Frontend Route Configuration
 * Centralized route definitions for the entire application
 */

const Routes = {
  // Public routes
  PUBLIC: {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    PRICING: '/pricing',
    FEATURES: '/features',
    ABOUT: '/about',
    CONTACT: '/contact',
    PRIVACY: '/privacy',
    TERMS: '/terms',
    COOKIES: '/cookies',
    FAQ: '/faq',
    BLOG: '/blog',
    CASE_STUDIES: '/case-studies',
  },

  // Protected routes (require authentication)
  PROTECTED: {
    DASHBOARD: '/dashboard',
    PROFILE: '/profile',
    BILLING: '/billing',
    USAGE: '/usage',
    SETTINGS: '/settings',
    TEAM: '/team',
    API_KEYS: '/api-keys',
    INTEGRATIONS: '/integrations',
  },

  // Subscription routes
  SUBSCRIPTION: {
    PLANS: '/subscription',
    UPGRADE: '/upgrade',
    PAYMENT_CALLBACK: '/payment/callback',
    PAYMENT_SUCCESS: '/payment/success',
    PAYMENT_FAILED: '/payment/failed',
    INVOICES: '/invoices',
  },

  // Tool routes
  TOOLS: {
    VALUE_PROPOSITION: '/tools/value-proposition',
    HEADLINE_ANALYZER: '/tools/headline-analyzer',
    SEO_META: '/tools/seo-meta',
    EMAIL_TESTER: '/tools/email-tester',
    CONTENT_IDEA: '/tools/content-idea',
    AD_COPY: '/tools/ad-copy',
    FUNNEL_BUILDER: '/tools/funnel-builder',
    SOCIAL_MEDIA: '/tools/social-media',
    
    // Sub-tools for social media
    SOCIAL_MEDIA_POSTS: '/tools/social-media/posts',
    SOCIAL_MEDIA_SCHEDULE: '/tools/social-media/schedule',
    SOCIAL_MEDIA_ANALYTICS: '/tools/social-media/analytics',
    SOCIAL_MEDIA_HASHTAGS: '/tools/social-media/hashtags',
  },

  // Content management routes
  CONTENT: {
    LIBRARY: '/content',
    SAVED: '/content/saved',
    DRAFTS: '/content/drafts',
    ARCHIVED: '/content/archived',
    EXPORT: '/content/export',
    TEMPLATES: '/content/templates',
  },

  // Analytics routes
  ANALYTICS: {
    OVERVIEW: '/analytics',
    TOOL_USAGE: '/analytics/tool-usage',
    CONTENT_PERFORMANCE: '/analytics/content-performance',
    ROI: '/analytics/roi',
    REPORTS: '/analytics/reports',
  },

  // Admin routes (for admin users only)
  ADMIN: {
    DASHBOARD: '/admin',
    USERS: '/admin/users',
    SUBSCRIPTIONS: '/admin/subscriptions',
    USAGE_ANALYTICS: '/admin/analytics',
    TOOL_CONFIG: '/admin/tools',
    BILLING: '/admin/billing',
    SUPPORT: '/admin/support',
  },

  // Error routes
  ERRORS: {
    NOT_FOUND: '/404',
    UNAUTHORIZED: '/unauthorized',
    MAINTENANCE: '/maintenance',
    SERVER_ERROR: '/500',
  },
};

// Helper functions for route management
export const getRoute = (category, key) => {
  if (Routes[category] && Routes[category][key]) {
    return Routes[category][key];
  }
  console.warn(`Route ${category}.${key} not found`);
  return '/';
};

export const isPublicRoute = (path) => {
  const publicRoutes = Object.values(Routes.PUBLIC);
  return publicRoutes.some(route => {
    if (route.includes(':')) {
      // Handle dynamic routes like /reset-password/:token
      const basePath = route.split('/:')[0];
      return path.startsWith(basePath);
    }
    return route === path;
  });
};

export const isProtectedRoute = (path) => {
  const allProtectedRoutes = [
    ...Object.values(Routes.PROTECTED),
    ...Object.values(Routes.SUBSCRIPTION),
    ...Object.values(Routes.TOOLS),
    ...Object.values(Routes.CONTENT),
    ...Object.values(Routes.ANALYTICS),
  ];
  
  return allProtectedRoutes.some(route => {
    if (route.includes(':')) {
      const basePath = route.split('/:')[0];
      return path.startsWith(basePath);
    }
    return route === path;
  });
};

export const isAdminRoute = (path) => {
  return Object.values(Routes.ADMIN).some(route => path.startsWith(route));
};

export const getToolRoutes = () => {
  return Object.entries(Routes.TOOLS).map(([key, path]) => ({
    id: key.toLowerCase().replace(/_/g, '-'),
    name: key.replace(/_/g, ' '),
    path,
    requiresAuth: true,
  }));
};

// Route parameter helpers
export const buildResetPasswordUrl = (token) => `/reset-password/${token}`;
export const buildPaymentCallbackUrl = (sessionId) => `/payment/callback?session_id=${sessionId}`;

export default Routes;