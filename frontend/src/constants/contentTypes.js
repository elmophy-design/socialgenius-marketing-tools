// frontend/src/constants/contentTypes.js
/**
 * Content Type Configuration
 * Definitions for different content types and their properties
 */

const ContentTypes = {
  // Main content categories
  CATEGORIES: {
    marketing: {
      id: 'marketing',
      name: 'Marketing Content',
      icon: '🎯',
      description: 'Content designed to promote and sell products or services',
      color: 'blue',
    },
    educational: {
      id: 'educational',
      name: 'Educational Content',
      icon: '📚',
      description: 'Content that teaches, informs, or explains concepts',
      color: 'green',
    },
    entertainment: {
      id: 'entertainment',
      name: 'Entertainment Content',
      icon: '🎭',
      description: 'Content designed to amuse, engage, or entertain audiences',
      color: 'purple',
    },
    news: {
      id: 'news',
      name: 'News & Updates',
      icon: '📰',
      description: 'Current events, announcements, and updates',
      color: 'red',
    },
    personal: {
      id: 'personal',
      name: 'Personal Content',
      icon: '👤',
      description: 'Behind-the-scenes, personal stories, and experiences',
      color: 'yellow',
    },
    promotional: {
      id: 'promotional',
      name: 'Promotional Content',
      icon: '💰',
      description: 'Content focused on sales, offers, and promotions',
      color: 'orange',
    },
    thought_leadership: {
      id: 'thought_leadership',
      name: 'Thought Leadership',
      icon: '💡',
      description: 'Expert insights, industry analysis, and forward-thinking',
      color: 'indigo',
    },
  },

  // Content formats
  FORMATS: {
    text: {
      id: 'text',
      name: 'Text',
      icon: '📝',
      description: 'Plain text content',
      supportedBy: ['all'],
      maxLength: 10000,
    },
    image: {
      id: 'image',
      name: 'Image',
      icon: '🖼️',
      description: 'Visual content with images',
      supportedBy: ['facebook', 'instagram', 'twitter', 'linkedin', 'pinterest'],
      requirements: {
        minResolution: '400x400',
        maxSize: '10MB',
        formats: ['jpg', 'png', 'gif', 'webp'],
      },
    },
    video: {
      id: 'video',
      name: 'Video',
      icon: '🎥',
      description: 'Video content',
      supportedBy: ['facebook', 'instagram', 'tiktok', 'youtube', 'linkedin', 'twitter'],
      requirements: {
        minDuration: 1,
        maxDuration: 600,
        maxSize: '4GB',
        formats: ['mp4', 'mov', 'avi'],
      },
    },
    carousel: {
      id: 'carousel',
      name: 'Carousel',
      icon: '🔄',
      description: 'Multiple images or videos in a single post',
      supportedBy: ['instagram', 'facebook', 'linkedin'],
      requirements: {
        minItems: 2,
        maxItems: 10,
        consistentAspect: true,
      },
    },
    story: {
      id: 'story',
      name: 'Story',
      icon: '📖',
      description: 'Temporary content that disappears after 24 hours',
      supportedBy: ['instagram', 'facebook', 'linkedin'],
      requirements: {
        aspectRatio: '9:16',
        maxDuration: 15,
      },
    },
    reel: {
      id: 'reel',
      name: 'Reel',
      icon: '🎬',
      description: 'Short-form video content',
      supportedBy: ['instagram', 'facebook'],
      requirements: {
        aspectRatio: '9:16',
        minDuration: 3,
        maxDuration: 90,
      },
    },
    article: {
      id: 'article',
      name: 'Article',
      icon: '📄',
      description: 'Long-form written content',
      supportedBy: ['linkedin', 'medium', 'blog'],
      requirements: {
        minLength: 300,
        maxLength: 20000,
      },
    },
    poll: {
      id: 'poll',
      name: 'Poll',
      icon: '📊',
      description: 'Interactive poll or survey',
      supportedBy: ['twitter', 'instagram', 'linkedin', 'facebook'],
      requirements: {
        minOptions: 2,
        maxOptions: 4,
        duration: '1-7 days',
      },
    },
  },

  // Content purposes
  PURPOSES: {
    awareness: {
      id: 'awareness',
      name: 'Brand Awareness',
      description: 'Increase visibility and recognition',
      goals: ['reach', 'impressions', 'brand recall'],
      metrics: ['views', 'reach', 'mentions'],
    },
    engagement: {
      id: 'engagement',
      name: 'Engagement',
      description: 'Encourage interaction and conversation',
      goals: ['likes', 'comments', 'shares', 'saves'],
      metrics: ['engagement_rate', 'comments', 'shares'],
    },
    conversion: {
      id: 'conversion',
      name: 'Conversion',
      description: 'Drive actions and sales',
      goals: ['clicks', 'signups', 'purchases', 'leads'],
      metrics: ['ctr', 'conversion_rate', 'roas'],
    },
    education: {
      id: 'education',
      name: 'Education',
      description: 'Teach or inform audience',
      goals: ['knowledge_transfer', 'skill_development', 'understanding'],
      metrics: ['time_spent', 'completion_rate', 'feedback'],
    },
    community: {
      id: 'community',
      name: 'Community Building',
      description: 'Foster relationships and community',
      goals: ['membership_growth', 'participation', 'loyalty'],
      metrics: ['community_growth', 'active_members', 'sentiment'],
    },
    thought_leadership: {
      id: 'thought_leadership',
      name: 'Thought Leadership',
      description: 'Establish authority and expertise',
      goals: ['credibility', 'influence', 'expert_recognition'],
      metrics: ['mentions', 'shares_by_influencers', 'media_coverage'],
    },
  },

  // Content tones
  TONES: {
    professional: {
      id: 'professional',
      name: 'Professional',
      description: 'Formal, business-appropriate language',
      icon: '💼',
      bestFor: ['linkedin', 'corporate_blog', 'b2b'],
      characteristics: ['formal', 'precise', 'authoritative', 'structured'],
    },
    casual: {
      id: 'casual',
      name: 'Casual',
      description: 'Relaxed, conversational tone',
      icon: '😊',
      bestFor: ['instagram', 'twitter', 'facebook', 'personal_blog'],
      characteristics: ['conversational', 'friendly', 'approachable', 'relatable'],
    },
    enthusiastic: {
      id: 'enthusiastic',
      name: 'Enthusiastic',
      description: 'Energetic and excited tone',
      icon: '🎉',
      bestFor: ['announcements', 'product_launches', 'events'],
      characteristics: ['energetic', 'excited', 'passionate', 'celebratory'],
    },
    informative: {
      id: 'informative',
      name: 'Informative',
      description: 'Factual and educational tone',
      icon: '📚',
      bestFor: ['tutorials', 'guides', 'educational_content'],
      characteristics: ['factual', 'clear', 'detailed', 'educational'],
    },
    humorous: {
      id: 'humorous',
      name: 'Humorous',
      description: 'Funny and entertaining tone',
      icon: '😂',
      bestFor: ['entertainment', 'memes', 'lighthearted_content'],
      characteristics: ['funny', 'witty', 'playful', 'entertaining'],
    },
    inspirational: {
      id: 'inspirational',
      name: 'Inspirational',
      description: 'Motivational and uplifting tone',
      icon: '✨',
      bestFor: ['motivational', 'success_stories', 'personal_growth'],
      characteristics: ['motivational', 'uplifting', 'encouraging', 'aspirational'],
    },
    urgent: {
      id: 'urgent',
      name: 'Urgent',
      description: 'Creates sense of urgency or importance',
      icon: '⏰',
      bestFor: ['limited_time_offers', 'important_announcements'],
      characteristics: ['time-sensitive', 'important', 'action-oriented', 'direct'],
    },
  },

  // Content templates by tool
  TOOL_TEMPLATES: {
    'value-proposition': [
      {
        id: 'problem-solution',
        name: 'Problem-Solution',
        structure: 'Before [problem] → After [solution] → Benefit',
        example: 'Struggling with social media content? Our AI generates engaging posts in seconds. Save time and grow your audience.',
      },
      {
        id: 'feature-benefit',
        name: 'Feature-Benefit',
        structure: 'Feature → Benefit → Result',
        example: 'AI-powered content generation → Create posts 10x faster → More time for strategy and growth.',
      },
      {
        id: 'unique-positioning',
        name: 'Unique Positioning',
        structure: 'For [audience] who want [goal], we provide [solution] unlike [competitors]',
        example: 'For marketers who want to scale content creation, we provide AI-powered tools that generate platform-optimized posts unlike manual content creation.',
      },
      {
        id: 'value-stack',
        name: 'Value Stack',
        structure: 'Core Value + Bonus Value + Ultimate Value',
        example: 'Generate social media content + Get engagement predictions + Grow your brand exponentially',
      },
    ],
    'headline-analyzer': [
      {
        id: 'how-to',
        name: 'How-To Headline',
        structure: 'How to [achieve result] in [timeframe]',
        example: 'How to Double Your Social Media Engagement in 30 Days',
        scoreFactors: ['clarity', 'benefit', 'specificity'],
      },
      {
        id: 'list',
        name: 'List Headline',
        structure: 'Number + Adjective + Keyword + Promise',
        example: '7 Proven Strategies to Boost Your Content Marketing ROI',
        scoreFactors: ['specificity', 'curiosity', 'value'],
      },
      {
        id: 'question',
        name: 'Question Headline',
        structure: 'Question that addresses pain point or curiosity',
        example: 'Is Your Content Actually Reaching Your Target Audience?',
        scoreFactors: ['relevance', 'curiosity', 'engagement'],
      },
      {
        id: 'controversial',
        name: 'Controversial Headline',
        structure: 'Controversial statement + explanation',
        example: 'Why Traditional Marketing Is Dead (And What to Do Instead)',
        scoreFactors: ['emotional_impact', 'curiosity', 'boldness'],
      },
    ],
    'seo-meta': [
      {
        id: 'comprehensive',
        name: 'Comprehensive Meta',
        structure: 'Keyword-rich title | Clear description with CTA',
        titleLength: 50,
        descriptionLength: 155,
        example: {
          title: 'AI Content Generator - Create Marketing Content in Seconds | Meritlives',
          description: 'Generate SEO-optimized content for social media, blogs, and ads. Try our AI marketing tools free for 7 days. No credit card required.',
        },
      },
      {
        id: 'benefit-focused',
        name: 'Benefit-Focused',
        structure: 'Benefit + Solution + Differentiator',
        example: {
          title: 'Save 10+ Hours Weekly on Content Creation with AI',
          description: 'Our AI marketing tools automate content generation for social media, emails, and ads. Start your free trial today.',
        },
      },
      {
        id: 'question-based',
        name: 'Question-Based',
        structure: 'Question + Answer + Value proposition',
        example: {
          title: 'Need Better Marketing Content? Try AI-Powered Generation',
          description: 'Generate high-quality marketing content in seconds with our AI tools. Perfect for blogs, social media, and advertising.',
        },
      },
    ],
    'social-media': [
      {
        id: 'engagement-post',
        name: 'Engagement Post',
        platforms: ['instagram', 'facebook', 'twitter', 'linkedin'],
        structure: 'Hook + Question + CTA to engage',
        example: "What's your biggest challenge with content creation? 🤔\n\nDrop a comment below and let's discuss solutions! 👇\n\n#ContentCreation #MarketingTips #SocialMediaStrategy",
      },
      {
        id: 'educational-tip',
        name: 'Educational Tip',
        platforms: ['linkedin', 'twitter', 'facebook'],
        structure: 'Quick tip + Explanation + Value',
        example: "📈 Pro Tip: The 80/20 rule for social media\n\n80% of your content should educate, entertain, or engage\n20% can promote your products/services\n\nThis balance builds trust and drives better results!\n\n#SocialMediaTips #DigitalMarketing #ContentStrategy",
      },
      {
        id: 'product-showcase',
        name: 'Product Showcase',
        platforms: ['instagram', 'pinterest', 'facebook'],
        structure: 'Problem + Solution + Features + CTA',
        example: "Struggling to create consistent content? ✍️\n\nMeet our AI Content Generator! 🚀\n\n✅ Generate posts in seconds\n✅ Optimized for each platform\n✅ Saves 10+ hours weekly\n\nTry it free for 7 days! (Link in bio)\n\n#AIMarketing #ContentCreation #ProductLaunch",
      },
      {
        id: 'behind-scenes',
        name: 'Behind the Scenes',
        platforms: ['instagram', 'tiktok', 'linkedin'],
        structure: 'Context + Peek inside + Personal touch',
        example: "Ever wondered how we build our AI tools? 🛠️\n\nHere's a peek at our team working on the latest features!\n\nWe believe in transparency and sharing our journey with you. What feature would you like to see next?\n\n#BehindTheScenes #TechStartup #TeamWork",
      },
    ],
  },

  // Content statuses
  STATUSES: {
    draft: {
      id: 'draft',
      name: 'Draft',
      icon: '📝',
      color: 'gray',
      description: 'Content is being created or edited',
    },
    ready: {
      id: 'ready',
      name: 'Ready',
      icon: '✅',
      color: 'green',
      description: 'Content is complete and ready for publishing',
    },
    scheduled: {
      id: 'scheduled',
      name: 'Scheduled',
      icon: '📅',
      color: 'blue',
      description: 'Content is scheduled for future publishing',
    },
    published: {
      id: 'published',
      name: 'Published',
      icon: '🚀',
      color: 'purple',
      description: 'Content has been published',
    },
    archived: {
      id: 'archived',
      name: 'Archived',
      icon: '📁',
      color: 'gray',
      description: 'Content is archived for reference',
    },
  },

  // Content tags for organization
  TAGS: {
    // Marketing tags
    seo: { name: 'SEO', color: 'blue' },
    social_media: { name: 'Social Media', color: 'purple' },
    email_marketing: { name: 'Email Marketing', color: 'orange' },
    content_marketing: { name: 'Content Marketing', color: 'green' },
    paid_ads: { name: 'Paid Ads', color: 'red' },
    
    // Platform tags
    instagram: { name: 'Instagram', color: 'pink' },
    facebook: { name: 'Facebook', color: 'indigo' },
    twitter: { name: 'Twitter', color: 'black' },
    linkedin: { name: 'LinkedIn', color: 'blue' },
    tiktok: { name: 'TikTok', color: 'black' },
    youtube: { name: 'YouTube', color: 'red' },
    
    // Content type tags
    blog_post: { name: 'Blog Post', color: 'teal' },
    video_content: { name: 'Video Content', color: 'red' },
    infographic: { name: 'Infographic', color: 'yellow' },
    case_study: { name: 'Case Study', color: 'purple' },
    tutorial: { name: 'Tutorial', color: 'green' },
    
    // AI tags
    ai_generated: { name: 'AI Generated', color: 'purple' },
    human_edited: { name: 'Human Edited', color: 'blue' },
    
    // Campaign tags
    campaign_2024: { name: 'Campaign 2024', color: 'orange' },
    product_launch: { name: 'Product Launch', color: 'green' },
    seasonal: { name: 'Seasonal', color: 'red' },
  },

  // Content metrics and KPIs
  METRICS: {
    engagement: {
      name: 'Engagement',
      icon: '💬',
      metrics: ['likes', 'comments', 'shares', 'saves', 'clicks'],
      calculation: '(likes + comments + shares) / impressions * 100',
      benchmark: {
        good: 3,
        average: 1,
        poor: 0.5,
      },
    },
    reach: {
      name: 'Reach',
      icon: '👥',
      metrics: ['impressions', 'reach', 'unique_viewers'],
      calculation: 'Number of unique users who saw the content',
      benchmark: {
        good: 'Above average for your page',
        average: 'Similar to previous posts',
        poor: 'Below average',
      },
    },
    conversion: {
      name: 'Conversion',
      icon: '💰',
      metrics: ['ctr', 'conversion_rate', 'leads', 'sales'],
      calculation: 'Conversions / clicks * 100',
      benchmark: {
        good: 2,
        average: 1,
        poor: 0.5,
      },
    },
    sentiment: {
      name: 'Sentiment',
      icon: '😊',
      metrics: ['positive_comments', 'negative_comments', 'neutral_comments'],
      calculation: '(positive - negative) / total * 100',
      benchmark: {
        good: 80,
        average: 50,
        poor: 20,
      },
    },
  },
};

// Helper functions
export const getContentCategory = (categoryId) => {
  return ContentTypes.CATEGORIES[categoryId] || ContentTypes.CATEGORIES.marketing;
};

export const getContentFormat = (formatId) => {
  return ContentTypes.FORMATS[formatId] || ContentTypes.FORMATS.text;
};

export const getContentPurpose = (purposeId) => {
  return ContentTypes.PURPOSES[purposeId] || ContentTypes.PURPOSES.engagement;
};

export const getContentTone = (toneId) => {
  return ContentTypes.TONES[toneId] || ContentTypes.TONES.casual;
};

export const getToolTemplates = (toolId) => {
  return ContentTypes.TOOL_TEMPLATES[toolId] || [];
};

export const getContentStatus = (statusId) => {
  return ContentTypes.STATUSES[statusId] || ContentTypes.STATUSES.draft;
};

export const getContentTag = (tagId) => {
  return ContentTypes.TAGS[tagId] || { name: tagId, color: 'gray' };
};

export const getContentMetrics = (metricId) => {
  return ContentTypes.METRICS[metricId] || ContentTypes.METRICS.engagement;
};

export const getSupportedFormats = (platformId) => {
  return Object.values(ContentTypes.FORMATS).filter(format => 
    format.supportedBy.includes('all') || format.supportedBy.includes(platformId)
  );
};

export const getTonesForCategory = (categoryId) => {
  const category = getContentCategory(categoryId);
  
  // Map categories to appropriate tones
  const toneMapping = {
    marketing: ['professional', 'enthusiastic', 'urgent'],
    educational: ['informative', 'professional'],
    entertainment: ['humorous', 'casual', 'enthusiastic'],
    news: ['informative', 'professional', 'urgent'],
    personal: ['casual', 'inspirational'],
    promotional: ['enthusiastic', 'urgent', 'professional'],
    thought_leadership: ['professional', 'informative', 'inspirational'],
  };
  
  const toneIds = toneMapping[categoryId] || ['casual', 'professional'];
  return toneIds.map(toneId => getContentTone(toneId));
};

export const getPurposesForCategory = (categoryId) => {
  const purposeMapping = {
    marketing: ['awareness', 'conversion', 'engagement'],
    educational: ['education', 'awareness'],
    entertainment: ['engagement', 'awareness'],
    news: ['awareness', 'education'],
    personal: ['community', 'engagement'],
    promotional: ['conversion', 'awareness'],
    thought_leadership: ['thought_leadership', 'education'],
  };
  
  const purposeIds = purposeMapping[categoryId] || ['engagement', 'awareness'];
  return purposeIds.map(purposeId => getContentPurpose(purposeId));
};

export const generateContentPrompt = (toolId, templateId, variables = {}) => {
  const templates = getToolTemplates(toolId);
  const template = templates.find(t => t.id === templateId);
  
  if (!template) return null;
  
  let prompt = template.structure;
  
  // Replace variables in prompt
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(`[${key}]`, value);
  });
  
  return {
    prompt,
    example: template.example,
    variables: Object.keys(variables),
  };
};

export const calculateEngagementScore = (metrics) => {
  const engagementMetric = getContentMetrics('engagement');
  const benchmark = engagementMetric.benchmark;
  
  const engagementRate = metrics.engagementRate || 0;
  
  if (engagementRate >= benchmark.good) return { score: 90, grade: 'A', label: 'Excellent' };
  if (engagementRate >= benchmark.average) return { score: 70, grade: 'B', label: 'Good' };
  if (engagementRate >= benchmark.poor) return { score: 50, grade: 'C', label: 'Average' };
  return { score: 30, grade: 'D', label: 'Poor' };
};

export const getContentTypeIcon = (type, subType = null) => {
  if (subType && ContentTypes[subType] && ContentTypes[subType][type]) {
    return ContentTypes[subType][type]?.icon || '📄';
  }
  
  // Fallback to category icon
  return getContentCategory(type)?.icon || '📄';
};

export default ContentTypes;