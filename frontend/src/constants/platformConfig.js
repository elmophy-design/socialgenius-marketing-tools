// frontend/src/constants/platformConfig.js
/**
 * Social Media Platform Configuration
 * Settings and requirements for different social media platforms
 */

const PlatformConfig = {
  // Available social media platforms
  PLATFORMS: {
    facebook: {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: '#1877F2',
      category: 'social',
      supported: true,
      premium: false,
      features: ['posts', 'ads', 'stories', 'reels'],
      characterLimits: {
        post: 63206,
        headline: 110,
        linkDescription: 1000,
        comments: 8000,
      },
      requirements: {
        image: {
          minWidth: 400,
          minHeight: 150,
          aspectRatios: ['1:1', '16:9', '4:5', '9:16'],
          maxSize: '8MB',
          formats: ['jpg', 'png', 'gif'],
        },
        video: {
          maxDuration: 240, // seconds
          maxSize: '4GB',
          formats: ['mp4', 'mov'],
        },
      },
      hashtags: {
        max: 30,
        recommended: 3,
        placement: 'anywhere',
      },
      bestPractices: {
        optimalLength: 80,
        emojiUsage: 'moderate',
        linkPlacement: 'end',
        callToAction: 'recommended',
        postFrequency: '1-2 per day',
        bestTimes: ['9 AM', '1 PM', '3 PM'],
      },
      aiTemplates: [
        'engagement_post',
        'promotional_post',
        'question_post',
        'video_post',
      ],
    },
    instagram: {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: '#E4405F',
      category: 'social',
      supported: true,
      premium: true,
      features: ['posts', 'stories', 'reels', 'carousel', 'igtv'],
      characterLimits: {
        caption: 2200,
        hashtags: 30,
        comments: 2200,
      },
      requirements: {
        image: {
          minWidth: 320,
          minHeight: 320,
          aspectRatios: ['1:1', '4:5', '16:9'],
          maxSize: '8MB',
          formats: ['jpg', 'png'],
        },
        video: {
          maxDuration: 60, // seconds for reels
          maxSize: '4GB',
          formats: ['mp4', 'mov'],
          aspectRatios: ['9:16', '1:1', '4:5'],
        },
      },
      hashtags: {
        max: 30,
        recommended: 11,
        placement: 'first_comment',
        strategy: 'mix_popular_niche',
      },
      bestPractices: {
        optimalLength: 138,
        emojiUsage: 'high',
        linkPlacement: 'bio_only',
        callToAction: 'essential',
        postFrequency: '1-3 per day',
        bestTimes: ['11 AM', '2 PM', '5 PM'],
        captionStructure: 'hook → value → cta',
      },
      aiTemplates: [
        'reel_caption',
        'carousel_post',
        'story_poll',
        'product_showcase',
      ],
    },
    twitter: {
      id: 'twitter',
      name: 'Twitter (X)',
      icon: '🐦',
      color: '#000000',
      category: 'social',
      supported: true,
      premium: false,
      features: ['tweets', 'threads', 'spaces', 'fleets'],
      characterLimits: {
        tweet: 280,
        thread: 280,
        username: 15,
        displayName: 50,
      },
      requirements: {
        image: {
          minWidth: 600,
          minHeight: 335,
          aspectRatios: ['16:9', '1:1', '2:1'],
          maxSize: '5MB',
          formats: ['jpg', 'png', 'gif'],
        },
        video: {
          maxDuration: 140, // seconds
          maxSize: '512MB',
          formats: ['mp4', 'mov'],
        },
      },
      hashtags: {
        max: 10,
        recommended: 2,
        placement: 'middle_or_end',
        characterLimit: 280,
      },
      bestPractices: {
        optimalLength: 71,
        emojiUsage: 'low',
        linkPlacement: 'end',
        callToAction: 'optional',
        postFrequency: '3-5 per day',
        bestTimes: ['8 AM', '12 PM', '6 PM'],
        engagementTips: 'ask questions, use polls',
      },
      aiTemplates: [
        'tweet_thread',
        'engagement_tweet',
        'news_announcement',
        'poll_question',
      ],
    },
    linkedin: {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: '💼',
      color: '#0A66C2',
      category: 'professional',
      supported: true,
      premium: true,
      features: ['posts', 'articles', 'company_updates', 'carousel'],
      characterLimits: {
        post: 3000,
        headline: 220,
        article: 40000,
        comment: 1250,
      },
      requirements: {
        image: {
          minWidth: 1200,
          minHeight: 627,
          aspectRatios: ['1.91:1', '1:1'],
          maxSize: '5MB',
          formats: ['jpg', 'png'],
        },
        video: {
          maxDuration: 600, // seconds
          maxSize: '5GB',
          formats: ['mp4', 'mov'],
        },
      },
      hashtags: {
        max: 30,
        recommended: 5,
        placement: 'end',
        strategy: 'professional',
      },
      bestPractices: {
        optimalLength: 150,
        emojiUsage: 'minimal',
        linkPlacement: 'first_comment',
        callToAction: 'professional',
        postFrequency: '1 per day',
        bestTimes: ['7 AM', '10 AM', '5 PM'],
        tone: 'professional, insightful',
      },
      aiTemplates: [
        'thought_leadership',
        'company_update',
        'article_intro',
        'job_post',
      ],
    },
    tiktok: {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      color: '#000000',
      category: 'video',
      supported: true,
      premium: true,
      features: ['videos', 'duets', 'stitches', 'live'],
      characterLimits: {
        caption: 2200,
        hashtags: 100,
        comments: 150,
      },
      requirements: {
        video: {
          minDuration: 3,
          maxDuration: 600, // seconds
          aspectRatios: ['9:16', '1:1'],
          maxSize: '287.6MB',
          formats: ['mp4', 'mov', 'avi'],
        },
        image: {
          supported: false,
        },
      },
      hashtags: {
        max: 100,
        recommended: 4,
        placement: 'caption',
        strategy: 'trending',
      },
      bestPractices: {
        optimalLength: 48,
        emojiUsage: 'high',
        linkPlacement: 'bio_only',
        callToAction: 'essential',
        postFrequency: '1-3 per day',
        bestTimes: ['6 PM', '10 PM'],
        videoTips: 'hook in first 3 seconds',
      },
      aiTemplates: [
        'trending_sound',
        'challenge_video',
        'tutorial_video',
        'duet_idea',
      ],
    },
    pinterest: {
      id: 'pinterest',
      name: 'Pinterest',
      icon: '📌',
      color: '#E60023',
      category: 'visual',
      supported: true,
      premium: false,
      features: ['pins', 'idea_pins', 'boards', 'stories'],
      characterLimits: {
        title: 100,
        description: 500,
        boardDescription: 500,
      },
      requirements: {
        image: {
          minWidth: 600,
          minHeight: 900,
          aspectRatios: ['2:3', '1:1', '16:9'],
          maxSize: '20MB',
          formats: ['jpg', 'png'],
          recommended: 'vertical',
        },
        video: {
          maxDuration: 240, // seconds
          maxSize: '2GB',
          formats: ['mp4', 'mov'],
        },
      },
      hashtags: {
        max: 20,
        recommended: 8,
        placement: 'description',
        strategy: 'descriptive',
      },
      bestPractices: {
        optimalLength: {
          title: 15,
          description: 150,
        },
        emojiUsage: 'low',
        linkPlacement: 'required',
        callToAction: 'essential',
        postFrequency: '5-30 per day',
        bestTimes: ['8 PM', '2 AM'],
        keywords: 'focus on search terms',
      },
      aiTemplates: [
        'product_pin',
        'tutorial_pin',
        'inspiration_pin',
        'seasonal_pin',
      ],
    },
    youtube: {
      id: 'youtube',
      name: 'YouTube',
      icon: '▶️',
      color: '#FF0000',
      category: 'video',
      supported: true,
      premium: true,
      features: ['videos', 'shorts', 'live', 'community'],
      characterLimits: {
        title: 100,
        description: 5000,
        tags: 500,
        comment: 1000,
      },
      requirements: {
        video: {
          minDuration: 1,
          maxDuration: 43200, // 12 hours
          aspectRatios: ['16:9', '4:3', '1:1'],
          maxSize: '256GB',
          formats: ['mp4', 'mov', 'avi', 'wmv'],
        },
        thumbnail: {
          width: 1280,
          height: 720,
          aspectRatio: '16:9',
          maxSize: '2MB',
          formats: ['jpg', 'png', 'gif'],
        },
      },
      hashtags: {
        max: 15,
        recommended: 3,
        placement: 'description',
        strategy: 'topic_based',
      },
      bestPractices: {
        optimalLength: {
          title: 50,
          description: 250,
        },
        emojiUsage: 'moderate',
        linkPlacement: 'description_top',
        callToAction: 'essential',
        postFrequency: '1-3 per week',
        bestTimes: ['2 PM', '6 PM', '9 PM'],
        seoTips: 'keywords in first 3 lines',
      },
      aiTemplates: [
        'video_title',
        'description_template',
        'end_screen_cta',
        'community_post',
      ],
    },
  },

  // Content categories for each platform
  CONTENT_CATEGORIES: {
    facebook: [
      'engagement',
      'promotional',
      'educational',
      'entertainment',
      'news',
      'question',
      'poll',
    ],
    instagram: [
      'lifestyle',
      'product',
      'tutorial',
      'behind_scenes',
      'user_generated',
      'quote',
      'carousel',
    ],
    twitter: [
      'news',
      'thread',
      'question',
      'poll',
      'retweet',
      'announcement',
      'engagement',
    ],
    linkedin: [
      'thought_leadership',
      'company_update',
      'industry_news',
      'career_advice',
      'achievement',
      'article',
      'event',
    ],
    tiktok: [
      'trend',
      'tutorial',
      'comedy',
      'dance',
      'challenge',
      'duet',
      'stitch',
    ],
    pinterest: [
      'diy',
      'recipe',
      'fashion',
      'home_decor',
      'travel',
      'inspiration',
      'product',
    ],
    youtube: [
      'tutorial',
      'review',
      'vlog',
      'entertainment',
      'educational',
      'interview',
      'live',
    ],
  },

  // Platform groups for UI
  PLATFORM_GROUPS: [
    {
      id: 'social',
      name: 'Social Networks',
      platforms: ['facebook', 'instagram', 'twitter'],
    },
    {
      id: 'professional',
      name: 'Professional',
      platforms: ['linkedin'],
    },
    {
      id: 'video',
      name: 'Video Platforms',
      platforms: ['youtube', 'tiktok'],
    },
    {
      id: 'visual',
      name: 'Visual Discovery',
      platforms: ['pinterest', 'instagram'],
    },
  ],

  // Hashtag strategies
  HASHTAG_STRATEGIES: {
    broad: {
      name: 'Broad Reach',
      description: 'Use popular hashtags to reach wider audience',
      examples: ['#marketing', '#socialmedia', '#digitalmarketing'],
      platforms: ['instagram', 'twitter', 'tiktok'],
    },
    niche: {
      name: 'Niche Focus',
      description: 'Use specific hashtags to target engaged communities',
      examples: ['#saasmarketing', '#contentstrategy', '#aigenerated'],
      platforms: ['instagram', 'linkedin', 'pinterest'],
    },
    branded: {
      name: 'Branded Hashtags',
      description: 'Create custom hashtags for your brand',
      examples: ['#meritlivesai', '#yourbrandname', '#campaignname'],
      platforms: ['all'],
    },
    trending: {
      name: 'Trending Topics',
      description: 'Use currently trending hashtags',
      examples: ['#tiktoktrend', '#currentevent', '#viraltopic'],
      platforms: ['twitter', 'tiktok', 'instagram'],
    },
    location: {
      name: 'Location Based',
      description: 'Include location-specific hashtags',
      examples: ['#nyc', '#londonbusiness', '#dubai'],
      platforms: ['instagram', 'facebook', 'twitter'],
    },
    community: {
      name: 'Community Hashtags',
      description: 'Join community conversations',
      examples: ['#marketingtwitter', '#linkedincreators', '#instablog'],
      platforms: ['twitter', 'linkedin', 'instagram'],
    },
  },

  // Optimal posting times (in local time)
  POSTING_TIMES: {
    facebook: ['9:00', '13:00', '15:00'],
    instagram: ['11:00', '14:00', '17:00'],
    twitter: ['8:00', '12:00', '18:00'],
    linkedin: ['7:00', '10:00', '17:00'],
    tiktok: ['18:00', '22:00'],
    pinterest: ['20:00', '02:00'],
    youtube: ['14:00', '18:00', '21:00'],
  },

  // Content templates
  CONTENT_TEMPLATES: {
    promotional: {
      name: 'Promotional Post',
      structure: 'Hook → Problem → Solution → CTA',
      platforms: ['facebook', 'instagram', 'linkedin', 'twitter'],
      tone: 'persuasive, clear, benefit-focused',
    },
    educational: {
      name: 'Educational Content',
      structure: 'Question → Explanation → Key Takeaways → CTA',
      platforms: ['linkedin', 'youtube', 'facebook', 'instagram'],
      tone: 'informative, authoritative, helpful',
    },
    engagement: {
      name: 'Engagement Post',
      structure: 'Question/Statement → Call to Engage → Response',
      platforms: ['instagram', 'twitter', 'facebook', 'linkedin'],
      tone: 'conversational, curious, inviting',
    },
    behind_scenes: {
      name: 'Behind the Scenes',
      structure: 'Context → Process/People → Insight → Relatability',
      platforms: ['instagram', 'tiktok', 'facebook', 'linkedin'],
      tone: 'authentic, personal, transparent',
    },
    user_generated: {
      name: 'User Generated Content',
      structure: 'Feature → Credit → Appreciation → Encouragement',
      platforms: ['instagram', 'tiktok', 'facebook', 'twitter'],
      tone: 'appreciative, community-focused, celebratory',
    },
    announcement: {
      name: 'Announcement',
      structure: 'Headline → Details → Importance → Next Steps',
      platforms: ['linkedin', 'twitter', 'facebook', 'instagram'],
      tone: 'exciting, official, clear',
    },
  },

  // AI content generation parameters
  AI_PARAMETERS: {
    creativity: {
      low: {
        name: 'Professional',
        temperature: 0.3,
        description: 'More factual and consistent',
        bestFor: ['linkedin', 'professional'],
      },
      medium: {
        name: 'Balanced',
        temperature: 0.7,
        description: 'Good mix of creativity and consistency',
        bestFor: ['facebook', 'instagram', 'twitter'],
      },
      high: {
        name: 'Creative',
        temperature: 1.0,
        description: 'Most creative and varied',
        bestFor: ['tiktok', 'youtube', 'pinterest'],
      },
    },
    tone: {
      professional: 'Formal, business-appropriate language',
      casual: 'Relaxed, conversational tone',
      enthusiastic: 'Energetic and excited',
      informative: 'Factual and educational',
      humorous: 'Funny and entertaining',
      inspirational: 'Motivational and uplifting',
    },
  },
};

// Helper functions
export const getPlatform = (platformId) => {
  return PlatformConfig.PLATFORMS[platformId] || null;
};

export const getAllPlatforms = (filter = {}) => {
  let platforms = Object.values(PlatformConfig.PLATFORMS);
  
  if (filter.premiumOnly) {
    platforms = platforms.filter(p => p.premium);
  }
  
  if (filter.supportedOnly) {
    platforms = platforms.filter(p => p.supported);
  }
  
  if (filter.category) {
    platforms = platforms.filter(p => p.category === filter.category);
  }
  
  return platforms;
};

export const getPlatformsByGroup = (groupId) => {
  const group = PlatformConfig.PLATFORM_GROUPS.find(g => g.id === groupId);
  if (!group) return [];
  
  return group.platforms.map(platformId => getPlatform(platformId));
};

export const getCharacterLimit = (platformId, contentType) => {
  const platform = getPlatform(platformId);
  if (!platform || !platform.characterLimits) return null;
  
  return platform.characterLimits[contentType] || null;
};

export const getOptimalPostLength = (platformId) => {
  const platform = getPlatform(platformId);
  if (!platform || !platform.bestPractices) return null;
  
  if (typeof platform.bestPractices.optimalLength === 'object') {
    return platform.bestPractices.optimalLength;
  }
  
  return platform.bestPractices.optimalLength || null;
};

export const getHashtagStrategy = (platformId, strategy = null) => {
  const platform = getPlatform(platformId);
  if (!platform) return null;
  
  if (strategy) {
    return PlatformConfig.HASHTAG_STRATEGIES[strategy] || null;
  }
  
  // Return platform-specific strategies
  const strategies = Object.entries(PlatformConfig.HASHTAG_STRATEGIES)
    .filter(([_, strategy]) => strategy.platforms.includes('all') || strategy.platforms.includes(platformId))
    .map(([id, strategy]) => ({ id, ...strategy }));
  
  return strategies;
};

export const getContentTemplates = (platformId) => {
  const templates = Object.entries(PlatformConfig.CONTENT_TEMPLATES)
    .filter(([_, template]) => template.platforms.includes(platformId))
    .map(([id, template]) => ({ id, ...template }));
  
  return templates;
};

export const getAIParameters = (platformId) => {
  const platform = getPlatform(platformId);
  if (!platform) return PlatformConfig.AI_PARAMETERS;
  
  // Filter creativity levels based on platform
  const creativity = Object.entries(PlatformConfig.AI_PARAMETERS.creativity)
    .filter(([_, level]) => level.bestFor.includes(platformId) || level.bestFor.includes(platform.category))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  return {
    ...PlatformConfig.AI_PARAMETERS,
    creativity,
  };
};

export const validateContentForPlatform = (platformId, content) => {
  const platform = getPlatform(platformId);
  if (!platform) return { valid: false, errors: ['Platform not supported'] };
  
  const errors = [];
  
  // Check character limits
  if (platform.characterLimits && content.text) {
    const charLimit = platform.characterLimits.post;
    if (charLimit && content.text.length > charLimit) {
      errors.push(`Text exceeds ${charLimit} character limit`);
    }
  }
  
  // Check hashtag count
  if (platform.hashtags && content.hashtags) {
    const hashtagCount = content.hashtags.length;
    const maxHashtags = platform.hashtags.max;
    if (hashtagCount > maxHashtags) {
      errors.push(`Exceeds maximum of ${maxHashtags} hashtags`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings: errors.length > 0 ? [] : ['Content meets platform requirements'],
  };
};

export const getPlatformIcon = (platformId) => {
  const platform = getPlatform(platformId);
  return platform?.icon || '📱';
};

export default PlatformConfig;