// frontend/src/constants/plans.js
/**
 * Subscription Plan Configuration
 * UI display configurations for all subscription plans
 */

const SubscriptionPlans = {
  // Plan hierarchy for access control
  HIERARCHY: ['trial', 'basic', 'premium', 'enterprise'],
  
  // Plan details for UI display
  PLANS: {
    trial: {
      id: 'trial',
      name: 'Free Trial',
      description: '7-day free trial with limited access',
      price: 0,
      interval: '7 days',
      badge: 'Free',
      color: 'gray',
      cta: 'Start Free Trial',
      features: [
        'Access to all 8 marketing tools',
        'Limited usage per tool',
        'Basic AI capabilities',
        'Email support',
        'Export functionality',
        '7-day duration',
      ],
      limits: {
        dailyRequests: 20,
        socialMediaPosts: 3,
        aiGenerations: 10,
        storage: '100MB',
        teamMembers: 1,
        apiAccess: false,
        whiteLabel: false,
        prioritySupport: false,
      },
      toolAccess: {
        'value-proposition': true,
        'headline-analyzer': true,
        'seo-meta': true,
        'email-tester': true,
        'content-idea': true,
        'ad-copy': true,
        'funnel-builder': true,
        'social-media': true,
      },
      highlights: [
        'No credit card required',
        'Full feature access',
        'Perfect for testing',
      ],
    },
    basic: {
      id: 'basic',
      name: 'Basic',
      description: 'Perfect for individuals and small teams',
      price: 29,
      interval: 'month',
      badge: 'Popular',
      color: 'blue',
      cta: 'Get Started',
      features: [
        'All tools unlocked',
        'Unlimited AI generations',
        '50 social media posts/month',
        'Priority email support',
        'Advanced analytics',
        'Team collaboration (up to 3 users)',
        'Content library',
        'Export capabilities',
      ],
      limits: {
        dailyRequests: 100,
        socialMediaPosts: 50,
        aiGenerations: 'unlimited',
        storage: '5GB',
        teamMembers: 3,
        apiAccess: false,
        whiteLabel: false,
        prioritySupport: 'email',
      },
      toolAccess: {
        'value-proposition': true,
        'headline-analyzer': true,
        'seo-meta': true,
        'email-tester': true,
        'content-idea': true,
        'ad-copy': true,
        'funnel-builder': true,
        'social-media': true,
      },
      highlights: [
        'Most popular choice',
        'Great value for money',
        'Perfect for growing businesses',
      ],
      savings: 'Save 20% with annual billing',
    },
    premium: {
      id: 'premium',
      name: 'Premium',
      description: 'Advanced features for marketing professionals',
      price: 79,
      interval: 'month',
      badge: 'Recommended',
      color: 'purple',
      cta: 'Try Premium',
      featured: true,
      features: [
        'Everything in Basic',
        'Unlimited social media posts',
        'Advanced AI models (GPT-4)',
        'Priority phone support',
        'Custom templates',
        'API access',
        'Team collaboration (up to 10 users)',
        'White-label option',
        'Advanced analytics dashboard',
        'Content scheduling',
        'Bulk content generation',
      ],
      limits: {
        dailyRequests: 500,
        socialMediaPosts: 'unlimited',
        aiGenerations: 'unlimited',
        storage: '50GB',
        teamMembers: 10,
        apiAccess: true,
        whiteLabel: true,
        prioritySupport: 'phone',
      },
      toolAccess: {
        'value-proposition': true,
        'headline-analyzer': true,
        'seo-meta': true,
        'email-tester': true,
        'content-idea': true,
        'ad-copy': true,
        'funnel-builder': true,
        'social-media': true, // Premium feature
      },
      highlights: [
        'Best for agencies',
        'Advanced AI models',
        'Priority support',
        'API access included',
      ],
      savings: 'Save 25% with annual billing',
    },
    enterprise: {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Custom solutions for large organizations',
      price: 299,
      interval: 'month',
      badge: 'Enterprise',
      color: 'gold',
      cta: 'Contact Sales',
      features: [
        'Everything in Premium',
        'Unlimited everything',
        'Dedicated account manager',
        'Custom AI model training',
        'SLA guarantee (99.9% uptime)',
        'On-premise deployment',
        'Custom integrations',
        'Unlimited team members',
        'Advanced security features',
        'Custom reporting',
        'Training & onboarding',
      ],
      limits: {
        dailyRequests: 'unlimited',
        socialMediaPosts: 'unlimited',
        aiGenerations: 'unlimited',
        storage: 'unlimited',
        teamMembers: 'unlimited',
        apiAccess: true,
        whiteLabel: true,
        prioritySupport: 'dedicated',
      },
      toolAccess: {
        'value-proposition': true,
        'headline-analyzer': true,
        'seo-meta': true,
        'email-tester': true,
        'content-idea': true,
        'ad-copy': true,
        'funnel-builder': true,
        'social-media': true,
      },
      highlights: [
        'Custom solutions',
        'Dedicated support',
        'Highest security',
        'Scalable for large teams',
      ],
      customQuote: true,
    },
  },

  // Annual pricing (for display)
  ANNUAL_PRICING: {
    basic: {
      monthlyEquivalent: 24,
      annualPrice: 290,
      savings: '20%',
      interval: 'year',
    },
    premium: {
      monthlyEquivalent: 59,
      annualPrice: 710,
      savings: '25%',
      interval: 'year',
    },
    enterprise: {
      monthlyEquivalent: 249,
      annualPrice: 2990,
      savings: '17%',
      interval: 'year',
    },
  },

  // Plan comparison matrix
  COMPARISON: [
    {
      feature: 'Marketing Tools',
      trial: 'All (limited)',
      basic: 'All',
      premium: 'All + Advanced',
      enterprise: 'All + Custom',
    },
    {
      feature: 'AI Models',
      trial: 'Basic',
      basic: 'Standard',
      premium: 'Advanced (GPT-4)',
      enterprise: 'Custom Training',
    },
    {
      feature: 'Social Media Posts',
      trial: '3 posts',
      basic: '50/month',
      premium: 'Unlimited',
      enterprise: 'Unlimited',
    },
    {
      feature: 'Team Members',
      trial: '1',
      basic: 'Up to 3',
      premium: 'Up to 10',
      enterprise: 'Unlimited',
    },
    {
      feature: 'Storage',
      trial: '100MB',
      basic: '5GB',
      premium: '50GB',
      enterprise: 'Unlimited',
    },
    {
      feature: 'API Access',
      trial: '✗',
      basic: '✗',
      premium: '✓',
      enterprise: '✓',
    },
    {
      feature: 'Priority Support',
      trial: 'Email',
      basic: 'Email',
      premium: 'Phone',
      enterprise: 'Dedicated',
    },
    {
      feature: 'White Label',
      trial: '✗',
      basic: '✗',
      premium: '✓',
      enterprise: '✓',
    },
    {
      feature: 'SLA Guarantee',
      trial: '✗',
      basic: '✗',
      premium: '✗',
      enterprise: '99.9%',
    },
    {
      feature: 'Custom Integrations',
      trial: '✗',
      basic: '✗',
      premium: '✗',
      enterprise: '✓',
    },
  ],

  // Feature categories for detailed breakdown
  FEATURE_CATEGORIES: [
    {
      id: 'tools',
      name: 'Marketing Tools',
      description: 'Access to AI-powered marketing tools',
      features: [
        'Value Proposition Generator',
        'Headline Analyzer',
        'SEO Meta Generator',
        'Email Subject Tester',
        'Content Idea Generator',
        'Ad Copy Generator',
        'Funnel Builder',
        'Social Media Generator',
      ],
    },
    {
      id: 'ai',
      name: 'AI Capabilities',
      description: 'Advanced AI models and features',
      features: [
        'GPT-3.5 Model',
        'GPT-4 Model',
        'Claude Integration',
        'Custom AI Training',
        'Bulk Generation',
        'AI Optimization',
      ],
    },
    {
      id: 'collaboration',
      name: 'Team Collaboration',
      description: 'Features for team workflow',
      features: [
        'Team Members',
        'Role-based Access',
        'Content Sharing',
        'Approval Workflows',
        'Team Analytics',
        'Collaborative Editing',
      ],
    },
    {
      id: 'support',
      name: 'Support & Service',
      description: 'Customer support and service levels',
      features: [
        'Email Support',
        'Priority Email Support',
        'Phone Support',
        'Dedicated Account Manager',
        'SLA Guarantee',
        'Training & Onboarding',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise Features',
      description: 'Advanced features for businesses',
      features: [
        'API Access',
        'White Label',
        'Custom Integrations',
        'On-premise Deployment',
        'Advanced Security',
        'Custom Reporting',
      ],
    },
  ],

  // Upgrade paths and recommendations
  UPGRADE_PATHS: {
    trial: {
      recommended: 'basic',
      message: 'Upgrade to Basic to continue using all features after trial',
      benefits: [
        'No usage limits',
        'Priority support',
        'Team collaboration',
      ],
    },
    basic: {
      recommended: 'premium',
      message: 'Upgrade to Premium for advanced AI and unlimited social media',
      benefits: [
        'Unlimited social media posts',
        'GPT-4 access',
        'API access',
        'White label option',
      ],
    },
    premium: {
      recommended: 'enterprise',
      message: 'Upgrade to Enterprise for custom solutions and dedicated support',
      benefits: [
        'Custom AI training',
        'Dedicated account manager',
        'SLA guarantee',
        'Unlimited everything',
      ],
    },
  },

  // Trial configuration
  TRIAL: {
    durationDays: 7,
    features: 'All features included',
    limits: 'Limited usage per tool',
    noCreditCard: true,
    autoCancel: true,
    reminderDays: [3, 1, 0], // Days before expiry to send reminders
  },

  // Billing cycles
  BILLING_CYCLES: [
    {
      id: 'monthly',
      name: 'Monthly',
      interval: 'month',
      discount: 0,
    },
    {
      id: 'annual',
      name: 'Annual',
      interval: 'year',
      discount: 20,
      note: 'Save 20% with annual billing',
    },
  ],
};

// Helper functions
export const getPlanById = (planId) => {
  return SubscriptionPlans.PLANS[planId] || SubscriptionPlans.PLANS.trial;
};

export const getPlanPrice = (planId, billingCycle = 'monthly') => {
  const plan = getPlanById(planId);
  
  if (billingCycle === 'annual' && SubscriptionPlans.ANNUAL_PRICING[planId]) {
    return SubscriptionPlans.ANNUAL_PRICING[planId];
  }
  
  return {
    monthlyEquivalent: plan.price,
    annualPrice: plan.price * 12,
    savings: '0%',
    interval: plan.interval,
  };
};

export const canAccessFeature = (planId, feature) => {
  const plan = getPlanById(planId);
  
  // Check if feature is in tool access
  if (plan.toolAccess && plan.toolAccess[feature] !== undefined) {
    return plan.toolAccess[feature];
  }
  
  // Check feature categories
  for (const category of SubscriptionPlans.FEATURE_CATEGORIES) {
    if (category.features.includes(feature)) {
      // For simplicity, assume all features in basic+ plans
      return planId !== 'trial';
    }
  }
  
  return true;
};

export const getRecommendedUpgrade = (currentPlan) => {
  return SubscriptionPlans.UPGRADE_PATHS[currentPlan] || null;
};

export const comparePlans = (planA, planB) => {
  const hierarchy = SubscriptionPlans.HIERARCHY;
  const indexA = hierarchy.indexOf(planA);
  const indexB = hierarchy.indexOf(planB);
  
  if (indexA === -1 || indexB === -1) return 0;
  return indexA - indexB;
};

export const isPlanAtLeast = (userPlan, requiredPlan) => {
  const hierarchy = SubscriptionPlans.HIERARCHY;
  const userIndex = hierarchy.indexOf(userPlan);
  const requiredIndex = hierarchy.indexOf(requiredPlan);
  
  if (userIndex === -1 || requiredIndex === -1) return false;
  return userIndex >= requiredIndex;
};

export const getPlanLimits = (planId) => {
  const plan = getPlanById(planId);
  return plan.limits || {};
};

export const getPlanFeatures = (planId, category = null) => {
  const plan = getPlanById(planId);
  
  if (category) {
    const featureCategory = SubscriptionPlans.FEATURE_CATEGORIES.find(c => c.id === category);
    if (featureCategory) {
      return featureCategory.features.filter(feature => 
        canAccessFeature(planId, feature)
      );
    }
    return [];
  }
  
  return plan.features || [];
};

// Plan badges for UI
export const PLAN_BADGES = {
  trial: { text: 'Free Trial', color: 'gray', variant: 'outline' },
  basic: { text: 'Basic', color: 'blue', variant: 'solid' },
  premium: { text: 'Premium', color: 'purple', variant: 'solid' },
  enterprise: { text: 'Enterprise', color: 'gold', variant: 'solid' },
};

export default SubscriptionPlans;