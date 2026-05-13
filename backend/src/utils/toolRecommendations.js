/**
 * toolRecommendations.js - Utility for building tool recommendations based on user profile
 */

export const TOOL_CATALOG = [
  {
    key: 'social-media',
    name: 'Social Media Generator',
    route: '/tools/social-media',
    description: 'Create posts, captions, and campaign-ready content for social channels.',
    signals: ['social-media', 'social', 'instagram', 'linkedin', 'twitter', 'tiktok', 'youtube', 'community', 'engagement', 'publish', 'brand-awareness', 'content-calendar']
  },
  {
    key: 'content-idea',
    name: 'Content Idea Generator',
    route: '/tools/content-idea',
    description: 'Generate fresh content themes and post ideas based on your niche and audience.',
    signals: ['content-marketing', 'content', 'blogging', 'creator', 'campaign-ideas', 'brand-awareness']
  },
  {
    key: 'headline-analyzer',
    name: 'Headline Analyzer',
    route: '/tools/headline-analyzer',
    description: 'Sharpen hooks, titles, and opening lines for stronger clicks and attention.',
    signals: ['headline', 'brand-awareness', 'traffic', 'blogging', 'campaign-ideas']
  },
  {
    key: 'seo-meta',
    name: 'SEO Meta Generator',
    route: '/tools/seo-meta',
    description: 'Generate SEO titles and meta descriptions to improve search visibility.',
    signals: ['seo', 'traffic', 'blogging', 'website']
  },
  {
    key: 'email-tester',
    name: 'Email Subject Tester',
    route: '/tools/email-tester',
    description: 'Optimize subject lines for email campaigns and nurture flows.',
    signals: ['email-marketing', 'email', 'newsletter', 'retention', 'launches']
  },
  {
    key: 'ad-copy',
    name: 'Ad Copy Generator',
    route: '/tools/ad-copy',
    description: 'Write sharper ad variations for paid campaigns and promotions.',
    signals: ['paid-ads', 'ads', 'conversions', 'sales', 'lead-generation', 'promotions']
  },
  {
    key: 'funnel-builder',
    name: 'Funnel Builder',
    route: '/tools/funnel-builder',
    description: 'Map user journeys and conversion steps for leads, sales, and launches.',
    signals: ['lead-generation', 'leads', 'conversions', 'sales', 'launches', 'funnels']
  },
  {
    key: 'value-proposition',
    name: 'Value Proposition Generator',
    route: '/tools/value-proposition',
    description: 'Clarify messaging, positioning, and the core promise of your brand or offer.',
    signals: ['positioning', 'messaging', 'brand-awareness', 'offers', 'consulting', 'saas']
  }
];

const normalizeSignals = (values = []) => values
  .filter(Boolean)
  .flatMap((value) => Array.isArray(value) ? value : [value])
  .map((value) => String(value).trim().toLowerCase())
  .filter(Boolean);

/**
 * Builds tool recommendations based on onboarding profile fields
 */
export const buildToolRecommendations = ({
  interests = [],
  activityPreferences = [],
  primaryGoal = '',
  favoritePlatform = '',
  businessType = '',
  experienceLevel = ''
}) => {
  const signals = normalizeSignals([
    primaryGoal,
    favoritePlatform,
    businessType,
    experienceLevel,
    ...interests,
    ...activityPreferences
  ]);

  const scored = TOOL_CATALOG.map((tool) => {
    const score = signals.reduce((total, signal) => {
      if (tool.signals.includes(signal)) {
        return total + 3;
      }

      if (tool.signals.some((candidate) => candidate.includes(signal) || signal.includes(candidate))) {
        return total + 1;
      }

      return total;
    }, 0);

    return {
      ...tool,
      score
    };
  });

  const recommendations = scored
    .filter((tool) => tool.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(({ key, name, route, description }) => ({
      key,
      name,
      route,
      description
    }));

  if (recommendations.length > 0) {
    return recommendations;
  }

  // Default fallback if no matches
  return TOOL_CATALOG.slice(0, 4).map(({ key, name, route, description }) => ({
    key,
    name,
    route,
    description
  }));
};
