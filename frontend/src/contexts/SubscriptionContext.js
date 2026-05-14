// frontend/src/contexts/SubscriptionContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { subscriptionApi, usageApi } from '../api';

const SubscriptionContext = createContext(null);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(() => {
    const saved = localStorage.getItem('subscription');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [usage, setUsage] = useState({
    dailyRequests: 0,
    monthlyRequests: 0,
    socialMediaPosts: 0,
    aiGenerations: 0,
    storageUsed: 0,
    lastUpdated: null,
  });
  
  const [limits, setLimits] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load subscription data
  const loadSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [subResult, usageResult, limitsResult] = await Promise.all([
        subscriptionApi.getSubscription(),
        usageApi.getUsage(),
        usageApi.getLimits(),
      ]);
      
      if (subResult.success) {
        setSubscription(subResult.data);
        localStorage.setItem('subscription', JSON.stringify(subResult.data));
      }
      
      if (usageResult.success) {
        setUsage({
          ...usageResult.data,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      if (limitsResult.success) {
        setLimits(limitsResult.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load subscription data');
      console.error('Load subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSubscription();
  }, [loadSubscription]);

  // Update subscription
  const updateSubscription = useCallback((newSubscription) => {
    setSubscription(newSubscription);
    localStorage.setItem('subscription', JSON.stringify(newSubscription));
  }, []);

  // Update usage
  const updateUsage = useCallback((tool, count = 1) => {
    setUsage(prev => ({
      ...prev,
      [tool]: (prev[tool] || 0) + count,
      monthlyRequests: prev.monthlyRequests + count,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  // Reset usage (admin only or new period)
  const resetUsage = useCallback(async (counter = null) => {
    try {
      const result = await usageApi.resetUsage(counter);
      if (result.success) {
        await loadSubscription();
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [loadSubscription]);

  // Check if user can access feature
  const canAccessTool = useCallback((toolId, requiredPlan = 'basic') => {
    if (!subscription) {
      return { canAccess: false, reason: 'no_subscription' };
    }
    
    if (subscription.status !== 'active') {
      return { canAccess: false, reason: 'subscription_inactive' };
    }
    
    // Check trial expiry
    if (subscription.plan === 'trial' && subscription.trialEndsAt) {
      const trialEnd = new Date(subscription.trialEndsAt);
      if (trialEnd < new Date()) {
        return { canAccess: false, reason: 'trial_expired' };
      }
    }
    
    // Check plan hierarchy
    const planHierarchy = ['trial', 'basic', 'premium', 'pro', 'enterprise'];
    const userPlanIndex = planHierarchy.indexOf(subscription.plan);
    const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);
    
    if (userPlanIndex < requiredPlanIndex) {
      return { 
        canAccess: false, 
        reason: 'upgrade_required', 
        requiredPlan 
      };
    }
    
    // Check usage limits
    const checkLimit = usageApi.checkLimit(toolId, subscription, usage);
    
    if (checkLimit.hasReachedLimit) {
      return { 
        canAccess: false, 
        reason: 'limit_reached', 
        limit: toolId,
        ...checkLimit 
      };
    }
    
    return { canAccess: true };
  }, [subscription, usage]);

  // Get trial days remaining
  const getTrialDaysRemaining = useCallback(() => {
    if (!subscription || subscription.plan !== 'trial' || !subscription.trialEndsAt) {
      return null;
    }
    
    const trialEnd = new Date(subscription.trialEndsAt);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  }, [subscription]);

  // Upgrade subscription
  const upgradeSubscription = useCallback(async (planId, paymentMethodId = null) => {
    try {
      setIsLoading(true);
      const result = await subscriptionApi.upgrade(planId, paymentMethodId);
      
      if (result.success) {
        updateSubscription(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [updateSubscription]);

  // Cancel subscription
  const cancelSubscription = useCallback(async (reason = '') => {
    try {
      const result = await subscriptionApi.cancel(reason);
      
      if (result.success) {
        updateSubscription(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [updateSubscription]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await subscriptionApi.reactivate();
      
      if (result.success) {
        updateSubscription(result.data);
        return { success: true, data: result.data };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [updateSubscription]);

  // Get subscription status color
  const getStatusColor = useCallback(() => {
    if (!subscription) return 'gray';
    
    switch (subscription.status) {
      case 'active':
        return subscription.plan === 'trial' ? 'yellow' : 'green';
      case 'cancelled':
        return 'orange';
      case 'expired':
        return 'red';
      case 'pending':
        return 'blue';
      default:
        return 'gray';
    }
  }, [subscription]);

  // Get plan color
  const getPlanColor = useCallback(() => {
    if (!subscription) return '#6B7280';
    
    const colors = {
      trial: '#6B7280',
      basic: '#3B82F6',
      premium: '#F59E0B',
      pro: '#8B5CF6',
      enterprise: '#EC4899'
    };
    
    return colors[subscription.plan] || '#6B7280';
  }, [subscription]);

  // Get plan icon
  const getPlanIcon = useCallback(() => {
    if (!subscription) return '🎯';
    
    const icons = {
      trial: '🎯',
      basic: '⭐',
      premium: '👑',
      pro: '🚀',
      enterprise: '💎'
    };
    
    return icons[subscription.plan] || '🎯';
  }, [subscription]);

  // Format subscription price
  const formatPrice = useCallback(() => {
    if (!subscription) return 'Free';
    
    const prices = {
      trial: 'Free',
      basic: '₦29000/month',
      premium: '₦49900/month',
      pro: '₦99900/month',
      enterprise: 'Custom',
    };
    
    return prices[subscription.plan] || 'Free';
  }, [subscription]);

  // Get formatted plan name
  const getPlanName = useCallback(() => {
    if (!subscription) return 'No Plan';
    
    const names = {
      trial: 'Trial',
      basic: 'Basic',
      premium: 'Premium',
      pro: 'Professional',
      enterprise: 'Enterprise'
    };
    
    return names[subscription.plan] || 'Unknown';
  }, [subscription]);

  // Check if subscription is about to expire
  const isExpiringSoon = useCallback(() => {
    if (!subscription || !subscription.expiresAt) return false;
    
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
  }, [subscription]);

  // Get days until expiry
  const getDaysUntilExpiry = useCallback(() => {
    if (!subscription || !subscription.expiresAt) return null;
    
    const expiresAt = new Date(subscription.expiresAt);
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry > 0 ? daysUntilExpiry : 0;
  }, [subscription]);

  // Check if plan is active
  const isActive = useCallback(() => {
    return subscription?.status === 'active';
  }, [subscription]);

  // Check if on trial
  const isOnTrial = useCallback(() => {
    return subscription?.plan === 'trial';
  }, [subscription]);

  // Check if plan is premium or higher
  const isPremiumOrHigher = useCallback(() => {
    const premiumPlans = ['premium', 'pro', 'enterprise'];
    return subscription && premiumPlans.includes(subscription.plan);
  }, [subscription]);

  // Get usage percentage for a specific limit
  const getUsagePercentage = useCallback((limitKey) => {
    if (!limits[limitKey] || limits[limitKey] === -1) return 0; // -1 means unlimited
    
    const used = usage[limitKey] || 0;
    const limit = limits[limitKey];
    
    return Math.min((used / limit) * 100, 100);
  }, [usage, limits]);

  // Check if approaching limit
  const isApproachingLimit = useCallback((limitKey, threshold = 80) => {
    const percentage = getUsagePercentage(limitKey);
    return percentage >= threshold;
  }, [getUsagePercentage]);

  // Get remaining usage for a limit
  const getRemainingUsage = useCallback((limitKey) => {
    if (!limits[limitKey] || limits[limitKey] === -1) return -1; // Unlimited
    
    const used = usage[limitKey] || 0;
    const limit = limits[limitKey];
    
    return Math.max(limit - used, 0);
  }, [usage, limits]);

  // Get all plan features
  const getPlanFeatures = useCallback(() => {
    if (!subscription) return [];
    
    const features = {
      trial: [
        'Limited content generation',
        'Basic social media tools',
        '5 posts per month',
        'Email support'
      ],
      basic: [
        '50 posts per month',
        'All basic tools',
        'Social media scheduling',
        'Priority email support',
        'Analytics dashboard'
      ],
      premium: [
        'Unlimited posts',
        'All tools included',
        'Advanced AI features',
        'Team collaboration',
        'Priority support',
        'Custom branding',
        'Advanced analytics'
      ],
      pro: [
        'Everything in Premium',
        'White-label options',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced reporting'
      ],
      enterprise: [
        'Everything in Pro',
        'Custom solutions',
        'Unlimited team members',
        'Custom AI training',
        'On-premise deployment',
        '24/7 phone support',
        'Custom contract terms'
      ]
    };
    
    return features[subscription.plan] || [];
  }, [subscription]);

  // Get subscription summary
  const getSubscriptionSummary = useCallback(() => {
    return {
      plan: getPlanName(),
      planId: subscription?.plan,
      status: subscription?.status,
      price: formatPrice(),
      color: getPlanColor(),
      icon: getPlanIcon(),
      isActive: isActive(),
      isOnTrial: isOnTrial(),
      isPremium: isPremiumOrHigher(),
      daysRemaining: getDaysUntilExpiry(),
      trialDaysRemaining: getTrialDaysRemaining(),
      isExpiringSoon: isExpiringSoon(),
      features: getPlanFeatures(),
      expiresAt: subscription?.expiresAt,
      startedAt: subscription?.startedAt
    };
  }, [
    subscription,
    getPlanName,
    formatPrice,
    getPlanColor,
    getPlanIcon,
    isActive,
    isOnTrial,
    isPremiumOrHigher,
    getDaysUntilExpiry,
    getTrialDaysRemaining,
    isExpiringSoon,
    getPlanFeatures
  ]);

  // Get usage summary
  const getUsageSummary = useCallback(() => {
    return {
      dailyRequests: usage.dailyRequests || 0,
      monthlyRequests: usage.monthlyRequests || 0,
      socialMediaPosts: usage.socialMediaPosts || 0,
      aiGenerations: usage.aiGenerations || 0,
      storageUsed: usage.storageUsed || 0,
      lastUpdated: usage.lastUpdated,
      
      // Percentages
      dailyRequestsPercentage: getUsagePercentage('dailyRequests'),
      monthlyRequestsPercentage: getUsagePercentage('monthlyRequests'),
      socialMediaPostsPercentage: getUsagePercentage('socialMediaPosts'),
      
      // Remaining
      dailyRequestsRemaining: getRemainingUsage('dailyRequests'),
      monthlyRequestsRemaining: getRemainingUsage('monthlyRequests'),
      socialMediaPostsRemaining: getRemainingUsage('socialMediaPosts'),
      
      // Warnings
      approachingDailyLimit: isApproachingLimit('dailyRequests'),
      approachingMonthlyLimit: isApproachingLimit('monthlyRequests'),
      approachingPostsLimit: isApproachingLimit('socialMediaPosts')
    };
  }, [usage, getUsagePercentage, getRemainingUsage, isApproachingLimit]);

  // Check if can upgrade
  const canUpgrade = useCallback(() => {
    if (!subscription) return true;
    
    const upgradePath = {
      trial: ['basic', 'premium', 'pro', 'enterprise'],
      basic: ['premium', 'pro', 'enterprise'],
      premium: ['pro', 'enterprise'],
      pro: ['enterprise'],
      enterprise: []
    };
    
    return upgradePath[subscription.plan]?.length > 0;
  }, [subscription]);

  // Get available upgrades
  const getAvailableUpgrades = useCallback(() => {
    if (!subscription) return ['basic', 'premium', 'pro', 'enterprise'];
    
    const upgradePath = {
      trial: ['basic', 'premium', 'pro', 'enterprise'],
      basic: ['premium', 'pro', 'enterprise'],
      premium: ['pro', 'enterprise'],
      pro: ['enterprise'],
      enterprise: []
    };
    
    return upgradePath[subscription.plan] || [];
  }, [subscription]);

  // Refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadSubscription();
      }
    }, 5 * 60 * 1000); // Refresh every 5 minutes
    
    return () => clearInterval(interval);
  }, [loadSubscription]);

  // Listen for subscription updates from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'subscription' && e.newValue) {
        try {
          const newSubscription = JSON.parse(e.newValue);
          setSubscription(newSubscription);
        } catch (error) {
          console.error('Error parsing subscription from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    // State
    subscription,
    usage,
    limits,
    isLoading,
    error,
    
    // Core actions
    loadSubscription,
    updateSubscription,
    updateUsage,
    resetUsage,
    upgradeSubscription,
    cancelSubscription,
    reactivateSubscription,
    
    // Access control
    canAccessTool,
    
    // Plan info
    getPlanName,
    getPlanColor,
    getPlanIcon,
    getPlanFeatures,
    formatPrice,
    
    // Status checks
    isActive,
    isOnTrial,
    isPremiumOrHigher,
    isExpiringSoon,
    canUpgrade,
    
    // Days/expiry
    getTrialDaysRemaining,
    getDaysUntilExpiry,
    
    // Usage tracking
    getUsagePercentage,
    isApproachingLimit,
    getRemainingUsage,
    
    // Summaries
    getSubscriptionSummary,
    getUsageSummary,
    getAvailableUpgrades,
    
    // Utilities
    getStatusColor
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export default SubscriptionContext;