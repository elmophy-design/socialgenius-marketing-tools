// frontend/src/constants/navigation.js
/**
 * Navigation Configuration
 * All navigation menus and sidebar configurations
 */

const Navigation = {
  // Public navigation (landing page)
  PUBLIC: [
    {
      id: 'home',
      label: 'Home',
      path: '/',
      icon: '🏠',
      external: false,
    },
    {
      id: 'features',
      label: 'Features',
      path: '/features',
      icon: '✨',
      external: false,
    },
    {
      id: 'tools',
      label: 'Tools',
      path: '#tools',
      icon: '🛠️',
      external: false,
      isAnchor: true,
    },
    {
      id: 'pricing',
      label: 'Pricing',
      path: '/pricing',
      icon: '💰',
      external: true,
    },
    {
      id: 'blog',
      label: 'Blog',
      path: '/blog',
      icon: '📝',
      external: false,
    },
    {
      id: 'contact',
      label: 'Contact',
      path: '/contact',
      icon: '📧',
      external: false,
    },
  ],

  // Main dashboard navigation
  DASHBOARD: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: '📊',
      exact: true,
      permission: 'all',
    },
    {
      id: 'tools',
      label: 'Tools',
      icon: '🛠️',
      permission: 'all',
      submenu: [
        {
          id: 'value-proposition',
          label: 'Value Proposition',
          path: '/tools/value-proposition',
          icon: '🎯',
          description: 'Create compelling value propositions',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'headline-analyzer',
          label: 'Headline Analyzer',
          path: '/tools/headline-analyzer',
          icon: '📊',
          description: 'Optimize headlines for engagement',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'seo-meta',
          label: 'SEO Meta Generator',
          path: '/tools/seo-meta',
          icon: '🔍',
          description: 'Create SEO-friendly meta content',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'email-tester',
          label: 'Email Subject Tester',
          path: '/tools/email-tester',
          icon: '✉️',
          description: 'Test and optimize email subject lines',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'content-idea',
          label: 'Content Idea Generator',
          path: '/tools/content-idea',
          icon: '💡',
          description: 'Generate endless content ideas',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'ad-copy',
          label: 'Ad Copy Generator',
          path: '/tools/ad-copy',
          icon: '🎪',
          description: 'Create high-converting ad copy',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'funnel-builder',
          label: 'Funnel Builder',
          path: '/tools/funnel-builder',
          icon: '🔄',
          description: 'Build complete marketing funnels',
          permission: 'basic',
          requiredPlan: 'basic',
        },
        {
          id: 'social-media',
          label: 'Social Media Generator',
          path: '/tools/social-media',
          icon: '📱',
          description: 'AI-powered social media content',
          permission: 'basic',
          requiredPlan: 'basic',
        },
      ],
    },
    {
      id: 'content',
      label: 'Content Library',
      path: '/content',
      icon: '📚',
      permission: 'basic',
    },
    {
      id: 'analytics',
      label: 'Analytics',
      path: '/analytics',
      icon: '📈',
      permission: 'basic',
    },
    {
      id: 'schedule',
      label: 'Schedule',
      path: '/tools/social-media/schedule',
      icon: '📅',
      permission: 'basic',
      requiredPlan: 'basic',
    },
  ],

  // User menu (dropdown)
  USER_MENU: [
    {
      id: 'profile',
      label: 'Profile',
      path: '/profile',
      icon: '👤',
      permission: 'all',
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: '⚙️',
      permission: 'all',
    },
    {
      id: 'billing',
      label: 'Billing & Subscription',
      path: '/billing',
      icon: '💳',
      permission: 'all',
    },
    {
      id: 'usage',
      label: 'Usage Analytics',
      path: '/usage',
      icon: '📊',
      permission: 'all',
    },
    {
      id: 'api-keys',
      label: 'API Keys',
      path: '/api-keys',
      icon: '🔑',
      permission: 'premium',
      requiredPlan: 'premium',
    },
    {
      id: 'team',
      label: 'Team Management',
      path: '/team',
      icon: '👥',
      permission: 'premium',
      requiredPlan: 'premium',
    },
    {
      id: 'integrations',
      label: 'Integrations',
      path: '/integrations',
      icon: '🔌',
      permission: 'basic',
    },
    {
      type: 'divider',
    },
    {
      id: 'help',
      label: 'Help & Support',
      path: '/help',
      icon: '❓',
      external: true,
      permission: 'all',
    },
    {
      id: 'feedback',
      label: 'Send Feedback',
      path: 'mailto:support@meritlives.com',
      icon: '💬',
      external: true,
      permission: 'all',
    },
    {
      type: 'divider',
    },
    {
      id: 'logout',
      label: 'Logout',
      action: 'logout',
      icon: '🚪',
      permission: 'all',
    },
  ],

  // Footer navigation
  FOOTER: {
    PRODUCT: [
      { label: 'Features', path: '/features' },
      { label: 'Tools', path: '#tools' },
      { label: 'Pricing', path: '/pricing' },
      { label: 'API', path: '/api', permission: 'premium' },
      { label: 'Integrations', path: '/integrations' },
    ],
    COMPANY: [
      { label: 'About Us', path: '/about' },
      { label: 'Careers', path: '/careers' },
      { label: 'Blog', path: '/blog' },
      { label: 'Press', path: '/press' },
      { label: 'Contact', path: '/contact' },
    ],
    RESOURCES: [
      { label: 'Documentation', path: '/docs' },
      { label: 'Help Center', path: '/help' },
      { label: 'Community', path: '/community' },
      { label: 'Case Studies', path: '/case-studies' },
      { label: 'Tutorials', path: '/tutorials' },
    ],
    LEGAL: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Service', path: '/terms' },
      { label: 'Cookie Policy', path: '/cookies' },
      { label: 'GDPR', path: '/gdpr' },
      { label: 'Security', path: '/security' },
    ],
  },

  // Quick actions for dashboard
  QUICK_ACTIONS: [
    {
      id: 'value-proposition',
      label: 'Value Proposition',
      icon: '🎯',
      path: '/tools/value-proposition',
      color: 'blue',
      requiredPlan: 'basic',
    },
    {
      id: 'social-media',
      label: 'Social Media',
      icon: '📱',
      path: '/tools/social-media',
      color: 'purple',
      requiredPlan: 'basic',
    },
    {
      id: 'headline-analyzer',
      label: 'Headline Analyzer',
      icon: '📊',
      path: '/tools/headline-analyzer',
      color: 'green',
      requiredPlan: 'basic',
    },
    {
      id: 'content-idea',
      label: 'Content Ideas',
      icon: '💡',
      path: '/tools/content-idea',
      color: 'yellow',
      requiredPlan: 'basic',
    },
    {
      id: 'ad-copy',
      label: 'Ad Copy',
      icon: '🎪',
      path: '/tools/ad-copy',
      color: 'red',
      requiredPlan: 'basic',
    },
    {
      id: 'seo-meta',
      label: 'SEO Meta',
      icon: '🔍',
      path: '/tools/seo-meta',
      color: 'indigo',
      requiredPlan: 'basic',
    },
  ],

  // Tool categories for filtering
  TOOL_CATEGORIES: [
    {
      id: 'all',
      label: 'All Tools',
      icon: '🛠️',
      description: 'View all available tools',
    },
    {
      id: 'ai',
      label: 'AI Powered',
      icon: '🤖',
      description: 'Tools powered by artificial intelligence',
    },
    {
      id: 'content',
      label: 'Content Creation',
      icon: '✍️',
      description: 'Tools for creating marketing content',
    },
    {
      id: 'social',
      label: 'Social Media',
      icon: '📱',
      description: 'Social media content and scheduling',
      requiredPlan: 'premium',
    },
    {
      id: 'analysis',
      label: 'Analysis & Optimization',
      icon: '📈',
      description: 'Tools for analyzing and optimizing content',
    },
    {
      id: 'planning',
      label: 'Planning',
      icon: '📅',
      description: 'Content planning and strategy tools',
    },
  ],

  // Admin navigation
  ADMIN: [
    {
      id: 'admin-dashboard',
      label: 'Dashboard',
      path: '/admin',
      icon: '🏠',
      permission: 'admin',
    },
    {
      id: 'admin-users',
      label: 'Users',
      path: '/admin/users',
      icon: '👥',
      permission: 'admin',
    },
    {
      id: 'admin-subscriptions',
      label: 'Subscriptions',
      path: '/admin/subscriptions',
      icon: '💳',
      permission: 'admin',
    },
    {
      id: 'admin-analytics',
      label: 'Analytics',
      path: '/admin/analytics',
      icon: '📊',
      permission: 'admin',
    },
    {
      id: 'admin-tools',
      label: 'Tool Config',
      path: '/admin/tools',
      icon: '🛠️',
      permission: 'admin',
    },
    {
      id: 'admin-billing',
      label: 'Billing',
      path: '/admin/billing',
      icon: '💰',
      permission: 'admin',
    },
    {
      id: 'admin-support',
      label: 'Support',
      path: '/admin/support',
      icon: '🎧',
      permission: 'admin',
    },
  ],
};

// Helper functions
export const getNavigationForPlan = (plan) => {
  const filteredDashboard = Navigation.DASHBOARD.map(item => {
    if (item.submenu) {
      const filteredSubmenu = item.submenu.filter(subitem => {
        if (!subitem.requiredPlan) return true;
        const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
        const userPlanIndex = planHierarchy.indexOf(plan);
        const requiredPlanIndex = planHierarchy.indexOf(subitem.requiredPlan);
        return userPlanIndex >= requiredPlanIndex;
      });
      return { ...item, submenu: filteredSubmenu };
    }
    return item;
  }).filter(item => {
    if (item.requiredPlan) {
      const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
      const userPlanIndex = planHierarchy.indexOf(plan);
      const requiredPlanIndex = planHierarchy.indexOf(item.requiredPlan);
      return userPlanIndex >= requiredPlanIndex;
    }
    return true;
  });

  return filteredDashboard;
};

export const getQuickActionsForPlan = (plan) => {
  return Navigation.QUICK_ACTIONS.filter(action => {
    if (!action.requiredPlan) return true;
    const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(plan);
    const requiredPlanIndex = planHierarchy.indexOf(action.requiredPlan);
    return userPlanIndex >= requiredPlanIndex;
  });
};

export const getUserMenuForPlan = (plan) => {
  return Navigation.USER_MENU.filter(item => {
    if (item.type === 'divider') return true;
    if (!item.permission || item.permission === 'all') return true;
    if (item.permission === 'admin') return false; // Admin items filtered separately
    
    if (item.requiredPlan) {
      const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
      const userPlanIndex = planHierarchy.indexOf(plan);
      const requiredPlanIndex = planHierarchy.indexOf(item.requiredPlan);
      return userPlanIndex >= requiredPlanIndex;
    }
    
    const planHierarchy = ['trial', 'basic', 'premium', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(plan);
    const permissionIndex = planHierarchy.indexOf(item.permission);
    return userPlanIndex >= permissionIndex;
  });
};

export const getToolByPath = (path) => {
  for (const item of Navigation.DASHBOARD) {
    if (item.submenu) {
      const tool = item.submenu.find(subitem => subitem.path === path);
      if (tool) return tool;
    }
    if (item.path === path) return item;
  }
  return null;
};

export const isPremiumTool = (toolId) => {
  const tool = Navigation.DASHBOARD
    .flatMap(item => item.submenu || [])
    .find(t => t.id === toolId);
  
  return tool?.requiredPlan === 'premium';
};

export default Navigation;