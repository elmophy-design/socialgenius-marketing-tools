/**
 * backend/src/controllers/toolController.js
 * Tool Operations Controller (ES Module Version)
 */

import User from '../models/User.js';
 import Subscription from '../models/Subscription.js';  // Uncomment when you have this model
 import ToolContent from '../models/Tool.js';  // Uncomment when you have this model

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if user can use tool (subscription check)
 */
const checkToolAccess = async (userId, toolId) => {
  // For now, allow all users (you can add subscription logic later)
  return { plan: 'free', isActive: true };
  
   
  const subscription = await Subscription.getActiveSubscription(userId);

  if (!subscription || !subscription.isActive) {
    const error = new Error('Active subscription required');
    error.statusCode = 403;
    throw error;
  }

  if (subscription.isTrial && new Date() > subscription.trialEndDate) {
    const error = new Error('Trial has expired. Please upgrade your plan.');
    error.statusCode = 403;
    throw error;
  }

  return subscription;
  
};

/**
 * Check usage limits
 */
const checkUsageLimits = async (subscription) => {
  // For now, allow unlimited usage
  return true;
  
   
  if (!subscription.canGenerate()) {
    const error = new Error(`Daily generation limit reached. Please upgrade.`);
    error.statusCode = 403;
    throw error;
  }
  
};

/**
 * Save generated content
 */
const saveGeneratedContent = async (userId, toolId, toolName, contentType, input, output, platform = null) => {
  // For now, just return a mock saved content object
  return {
    _id: Date.now().toString(),
    userId,
    toolId,
    toolName,
    contentType,
    platform,
    input,
    output,
    isSaved: true,
    createdAt: new Date()
  };
  
  
  const content = await ToolContent.create({
    userId,
    toolId,
    toolName,
    contentType,
    platform,
    input,
    output,
    isSaved: true
  });

  return content;

};

// ============================================
// 1. SOCIAL MEDIA GENERATOR
// ============================================

export const generateSocialMedia = async (req, res) => {
  const { platform, topic, tone, template, hashtags, emojis } = req.body;

  // Check access
  const subscription = await checkToolAccess(req.user.id, 'social-media');
  await checkUsageLimits(subscription);

  const generatedContent = {
    content: `🎯 ${topic}\n\nThis is a ${tone} post about ${topic}. ${
      emojis ? '✨🚀💡' : ''
    }\n\n${hashtags ? '#marketing #success #business' : ''}`,
    platform,
    characterCount: 150,
    hashtags: hashtags ? ['#marketing', '#success', '#business'] : [],
    suggestions: [
      'Add a call-to-action',
      'Include an image',
      'Post during peak hours'
    ]
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'social-media',
    'Social Media Generator',
    'social-post',
    { platform, topic, tone, template },
    generatedContent,
    platform
  );

  res.json({
    success: true,
    message: 'Social media content generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 2. VALUE PROPOSITION GENERATOR
// ============================================

export const generateValueProposition = async (req, res) => {
  const { productName, targetAudience, problemSolved, uniqueFeatures } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'value-proposition');
  await checkUsageLimits(subscription);

  const generatedContent = {
    headline: `Transform Your ${targetAudience}'s Experience`,
    subheadline: `${productName} helps ${targetAudience} ${problemSolved}`,
    valueProps: [
      `Solve ${problemSolved} in minutes, not hours`,
      `Unique ${uniqueFeatures} that competitors don't offer`,
      `Trusted by thousands of satisfied customers`
    ],
    cta: 'Get Started Today'
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'value-proposition',
    'Value Proposition Generator',
    'value-proposition',
    { productName, targetAudience, problemSolved, uniqueFeatures },
    generatedContent
  );

  res.json({
    success: true,
    message: 'Value proposition generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 3. HEADLINE ANALYZER
// ============================================

export const analyzeHeadline = async (req, res) => {
  const { headline } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'headline-analyzer');
  await checkUsageLimits(subscription);

  const wordCount = headline.split(' ').length;
  const characterCount = headline.length;
  const hasNumber = /\d/.test(headline);
  const hasQuestion = headline.includes('?');
  const hasEmotionalWord = /amazing|incredible|powerful|essential|important/i.test(headline);

  let score = 50;
  if (wordCount >= 6 && wordCount <= 12) score += 15;
  if (characterCount >= 40 && characterCount <= 60) score += 15;
  if (hasNumber) score += 10;
  if (hasQuestion) score += 5;
  if (hasEmotionalWord) score += 5;

  const analysis = {
    headline,
    score: Math.min(score, 100),
    metrics: {
      wordCount,
      characterCount,
      hasNumber,
      hasQuestion,
      hasEmotionalWord
    },
    sentiment: score >= 70 ? 'positive' : score >= 50 ? 'neutral' : 'needs improvement',
    suggestions: []
  };

  if (wordCount < 6) analysis.suggestions.push('Consider adding more words (6-12 is optimal)');
  if (!hasNumber) analysis.suggestions.push('Adding a number can increase engagement');
  if (!hasEmotionalWord) analysis.suggestions.push('Include power words to evoke emotion');

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'headline-analyzer',
    'Headline Analyzer',
    'headline',
    { headline },
    analysis
  );

  res.json({
    success: true,
    message: 'Headline analyzed successfully!',
    data: {
      analysis,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 4. SEO META GENERATOR
// ============================================

export const generateSEOMeta = async (req, res) => {
  const { title, description, keywords, url } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'seo-meta');
  await checkUsageLimits(subscription);

  const generatedContent = {
    metaTitle: title.length <= 60 ? title : title.substring(0, 57) + '...',
    metaDescription: description || `Learn more about ${title}. Discover insights, tips, and strategies.`,
    ogTitle: title,
    ogDescription: description || `Learn more about ${title}`,
    ogImage: url ? `${url}/og-image.jpg` : null,
    twitterCard: 'summary_large_image',
    keywords: keywords || [],
    canonicalUrl: url,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: title,
      description: description
    }
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'seo-meta',
    'SEO Meta Generator',
    'seo-meta',
    { title, description, keywords, url },
    generatedContent
  );

  res.json({
    success: true,
    message: 'SEO meta tags generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 5. EMAIL SUBJECT LINE TESTER
// ============================================

export const testEmailSubject = async (req, res) => {
  const { subject } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'email-tester');
  await checkUsageLimits(subscription);

  const wordCount = subject.split(' ').length;
  const characterCount = subject.length;
  const hasNumber = /\d/.test(subject);
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(subject);
  const hasPersonalization = /\{.*\}|\[.*\]/.test(subject);

  let score = 50;
  if (wordCount >= 4 && wordCount <= 7) score += 15;
  if (characterCount >= 30 && characterCount <= 50) score += 15;
  if (hasNumber) score += 10;
  if (hasEmoji) score += 5;
  if (hasPersonalization) score += 5;

  const analysis = {
    subject,
    score: Math.min(score, 100),
    metrics: {
      wordCount,
      characterCount,
      hasNumber,
      hasEmoji,
      hasPersonalization
    },
    estimatedOpenRate: `${15 + Math.floor(score / 5)}%`,
    spamScore: Math.max(0, 100 - score),
    suggestions: []
  };

  if (wordCount > 7) analysis.suggestions.push('Consider shortening subject line');
  if (!hasPersonalization) analysis.suggestions.push('Add personalization tokens');
  if (characterCount > 50) analysis.suggestions.push('Keep under 50 characters for mobile');

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'email-tester',
    'Email Subject Line Tester',
    'email-subject',
    { subject },
    analysis
  );

  res.json({
    success: true,
    message: 'Email subject line tested successfully!',
    data: {
      analysis,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 6. CONTENT IDEA GENERATOR
// ============================================

export const generateContentIdeas = async (req, res) => {
  const { topic, niche, audience, count = 10 } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'content-idea');
  await checkUsageLimits(subscription);

  const ideas = [];
  const formats = ['How-to', 'List', 'Case Study', 'Tutorial', 'Guide', 'Comparison'];
  
  for (let i = 1; i <= count; i++) {
    const format = formats[i % formats.length];
    ideas.push({
      id: i,
      title: `${format}: ${topic} for ${audience}`,
      description: `A comprehensive ${format.toLowerCase()} covering ${topic} tailored for ${audience}`,
      format,
      estimatedLength: `${Math.floor(Math.random() * 1000) + 500} words`,
      difficulty: ['Beginner', 'Intermediate', 'Advanced'][Math.floor(Math.random() * 3)]
    });
  }

  const generatedContent = {
    niche,
    audience,
    ideas,
    totalIdeas: count
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'content-idea',
    'Content Idea Generator',
    'content-ideas',
    { topic, niche, audience, count },
    generatedContent
  );

  res.json({
    success: true,
    message: `${count} content ideas generated successfully!`,
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 7. AD COPY GENERATOR
// ============================================

export const generateAdCopy = async (req, res) => {
  const { product, audience, platform, length, tone } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'ad-copy');
  await checkUsageLimits(subscription);

  const generatedContent = {
    headline: `Discover ${product} - Perfect for ${audience}`,
    body: `Transform your experience with ${product}. Join thousands who've already made the switch.`,
    cta: 'Learn More',
    variations: [
      {
        headline: `Why ${audience} Love ${product}`,
        body: `See what makes ${product} the #1 choice for ${audience}.`,
        cta: 'Get Started'
      },
      {
        headline: `${product}: Built for ${audience}`,
        body: `Everything you need, nothing you don't. Try ${product} today.`,
        cta: 'Try Free'
      }
    ],
    platform,
    tone,
    estimatedCTR: '2.5-4.5%'
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'ad-copy',
    'Ad Copy Generator',
    'ad-copy',
    { product, audience, platform, length, tone },
    generatedContent
  );

  res.json({
    success: true,
    message: 'Ad copy generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// 8. MARKETING FUNNEL BUILDER
// ============================================

export const generateFunnel = async (req, res) => {
  const { goal, audience, budget, timeline } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'funnel-builder');
  await checkUsageLimits(subscription);

  const generatedContent = {
    goal,
    audience,
    stages: [
      {
        name: 'Awareness',
        objective: 'Attract attention',
        tactics: ['Social media ads', 'Content marketing', 'SEO'],
        budget: `$${Math.round(budget * 0.3)}`,
        duration: `${Math.round(timeline * 0.25)} days`
      },
      {
        name: 'Interest',
        objective: 'Generate leads',
        tactics: ['Lead magnets', 'Email capture', 'Webinars'],
        budget: `$${Math.round(budget * 0.25)}`,
        duration: `${Math.round(timeline * 0.25)} days`
      },
      {
        name: 'Decision',
        objective: 'Nurture prospects',
        tactics: ['Email sequences', 'Case studies', 'Free trials'],
        budget: `$${Math.round(budget * 0.25)}`,
        duration: `${Math.round(timeline * 0.25)} days`
      },
      {
        name: 'Action',
        objective: 'Convert to customers',
        tactics: ['Sales calls', 'Limited offers', 'Guarantees'],
        budget: `$${Math.round(budget * 0.2)}`,
        duration: `${Math.round(timeline * 0.25)} days`
      }
    ],
    kpis: [
      'Website traffic',
      'Lead conversion rate',
      'Email open rate',
      'Sales conversion rate'
    ],
    estimatedROI: '250-400%'
  };

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'funnel-builder',
    'Marketing Funnel Builder',
    'funnel',
    { goal, audience, budget, timeline },
    generatedContent
  );

  res.json({
    success: true,
    message: 'Marketing funnel generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id
    }
  });
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export const getContent = async (req, res) => {
  // Mock response for now
  res.json({
    success: true,
    data: {
      content: [],
      totalPages: 0,
      currentPage: 1,
      totalContent: 0
    }
  });
};

export const getContentById = async (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Content not found'
  });
};

export const deleteContent = async (req, res) => {
  res.json({
    success: true,
    message: 'Content deleted successfully!'
  });
};

export const toggleFavorite = async (req, res) => {
  res.json({
    success: true,
    message: 'Favorite toggled!'
  });
};