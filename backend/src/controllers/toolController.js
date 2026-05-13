/**
 * backend/src/controllers/toolController.js
 * Tool Operations Controller (ES Module Version)
 */

import axios from 'axios';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import ToolContent from '../models/Tool.js';
import { createUserNotification } from '../utils/notificationHelper.js';

// ============================================
// HELPER FUNCTIONS
// ============================================

const normalizeSocialPosts = (raw, fallbackPlatform, fallbackTone) => {
  const posts = Array.isArray(raw?.posts) ? raw.posts : [];

  return posts.map((post, index) => ({
    id: `ai-${Date.now()}-${index}`,
    platform: post.platform || fallbackPlatform,
    content: post.content || '',
    hashtags: Array.isArray(post.hashtags) ? post.hashtags : [],
    engagementScore: post.engagement_score || post.engagementScore || 0,
    tone: post.tone || fallbackTone,
    explanation: post.explanation || '',
    characterCount: (post.content || '').length,
    readingLevel: 'intermediate'
  }));
};

const buildSocialMediaPrompt = ({
  niche,
  contentType,
  tone,
  brandVoice,
  targetAudience,
  interests,
  postQuantity,
  platforms,
  includeHashtags,
  includeEmojis,
  callToAction,
  keywords,
  language
}) => `
You are an expert Social Media Content Architect. Create ${postQuantity} high-performance social media posts tailored for ${platforms.join(', ')}.

STRATEGIC CONTEXT:
- Niche/Industry: ${niche}
- Core Topic/Keywords: ${(keywords || []).join(', ')}
- Content Format: ${contentType}
- Target Audience: ${targetAudience}
- Audience Interests: ${(interests || []).join(', ')}

BRAND GUIDELINES:
- Brand Voice: ${brandVoice}
- Desired Tone: ${tone}
- Primary Call to Action: ${callToAction}
- Language: ${language}

FORMATTING RULES:
- Include Hashtags: ${includeHashtags ? 'Yes (5-8 relevant tags)' : 'No'}
- Use Emojis: ${includeEmojis ? 'Yes (strategic placement)' : 'No'}
- Content must be platform-specific (e.g., short for X, visual-focused description for Instagram).

Return ONLY a JSON object with this exact structure:
{
  "posts": [
    {
      "platform": "platform name",
      "content": "the full post copy",
      "hashtags": ["#tag1", "#tag2"],
      "engagement_score": 1-100,
      "tone": "detected tone",
      "explanation": "Brief strategic reasoning"
    }
  ],
  "insights": "Overall cross-platform strategy summary"
}
`;

const generateSocialMediaFallback = ({
  niche,
  tone,
  includeHashtags,
  includeEmojis,
  callToAction,
  platforms,
  postQuantity,
}) => {
  const platformList = Array.isArray(platforms) && platforms.length > 0 ? platforms : ['facebook'];
  const emojiBlock = includeEmojis ? ' [emoji-ready]' : '';
  const hashtagBlock = includeHashtags ? ['#marketing', '#growth', `#${String(niche).replace(/\s+/g, '')}`] : [];

  const posts = Array.from({ length: Math.max(1, postQuantity || 1) }).map((_, index) => {
    const platform = platformList[index % platformList.length];
    const content = `Here is a ${tone} ${platform} post for ${niche}.${emojiBlock} Focus on a clear benefit, a strong hook, and a simple ${callToAction} call to action.`;

    return {
      id: `fallback-${Date.now()}-${index}`,
      platform,
      content,
      hashtags: hashtagBlock,
      engagementScore: 68,
      tone,
      explanation: 'Fallback content generated because the AI service was unavailable.',
      characterCount: content.length,
      readingLevel: 'intermediate'
    };
  });

  return {
    posts,
    insights: 'AI service temporarily unavailable. Rule-based fallback content was generated.',
    aiGenerated: false
  };
};

const requestAI = async (prompt, systemPrompt = 'You are a senior social media strategist and copywriter. Return ONLY valid JSON in the requested format without any markdown wrappers or explanations.') => {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!deepseekKey && !openaiKey) {
    throw new Error('No AI API key configured (DeepSeek or OpenAI required)');
  }

  // Define providers to try
  const providers = [];
  if (deepseekKey) {
    providers.push({
      name: 'DeepSeek',
      url: 'https://api.deepseek.com/v1/chat/completions',
      key: deepseekKey,
      model: 'deepseek-chat'
    });
  }
  if (openaiKey) {
    providers.push({
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      key: openaiKey,
      model: 'gpt-4o-mini'
    });
  }

  let lastError;
  for (const provider of providers) {
    try {
      const response = await axios.post(
        provider.url,
        {
          model: provider.model,
          messages: [
            {
              role: 'system',
              content: systemPrompt
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.key}`
          },
          timeout: 60000
        }
      );

      const text = response.data?.choices?.[0]?.message?.content || '';
      if (!text) continue;

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) continue;

      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed) return parsed;
      } catch (e) {
        console.warn(`Failed to parse JSON from ${provider.name}, trying next...`);
      }
    } catch (error) {
      lastError = error;
      console.error(`AI request to ${provider.name} failed:`, error.message);
    }
  }

  throw lastError || new Error('All AI providers failed to generate valid content');
};

const requestSocialMediaAI = async (payload) => {
  const prompt = buildSocialMediaPrompt(payload);
  const result = await requestAI(prompt);
  if (!result.posts) {
    throw new Error('AI response did not contain "posts" array');
  }
  return result;
};

/**
 * Check if user can use tool (subscription check)
 */
const checkToolAccess = async (userId, toolId) => {
  let subscription = await Subscription.getActiveSubscription(userId);

  if (!subscription) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    if (user.subscription?.plan === 'trial') {
      subscription = await Subscription.createTrialSubscription(userId);
      user.subscriptionId = subscription._id;
      user.subscription.plan = subscription.plan;
      user.subscription.status = subscription.status;
      user.subscription.isActive = subscription.isActive;
      user.subscription.trialEndDate = subscription.trialEndDate;
      await user.save();
    }
  }

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

  await User.findByIdAndUpdate(userId, {
    $inc: {
      'stats.totalGenerations': 1,
      'stats.savedContent': 1,
      ...(toolId === 'social-media' ? { 'stats.totalPosts': 1 } : {})
    }
  });

  const subscription = await Subscription.getActiveSubscription(userId);
  if (subscription) {
    await subscription.incrementGeneration();
  }

  return content;
};

// ============================================
// 1. SOCIAL MEDIA GENERATOR
// ============================================

export const generateSocialMedia = async (req, res) => {
  const {
    niche,
    customNiche,
    topic,
    contentType = 'social-post',
    tone = 'professional',
    brandVoice = 'clear',
    targetAudience = 'general audience',
    interests = [],
    postQuantity = 3,
    platforms = [],
    platform,
    includeHashtags = true,
    includeEmojis = false,
    callToAction = 'Learn more',
    keywords = [],
    language = 'English',
    autoPost = false
  } = req.body;

  const subscription = await checkToolAccess(req.user.id, 'social-media');
  await checkUsageLimits(subscription);

  const resolvedTopic = niche || customNiche || topic;
  const resolvedPlatforms = Array.isArray(platforms) && platforms.length > 0
    ? platforms
    : [platform || 'facebook'];
  const requestedQuantity = Math.min(Math.max(Number(postQuantity) || 1, 1), 12);

  const requestPayload = {
    niche: resolvedTopic,
    contentType,
    tone,
    brandVoice,
    targetAudience,
    interests,
    postQuantity: requestedQuantity,
    platforms: resolvedPlatforms,
    includeHashtags,
    includeEmojis,
    callToAction,
    keywords,
    language
  };

  let aiResponse;
  let usedFallback = false;

  try {
    aiResponse = await requestSocialMediaAI(requestPayload);
  } catch (error) {
    console.error('Social media AI generation failed, using fallback:', error.message);
    aiResponse = generateSocialMediaFallback(requestPayload);
    usedFallback = true;
  }

  const normalizedPosts = normalizeSocialPosts(
    aiResponse,
    resolvedPlatforms[0],
    tone
  ).slice(0, requestedQuantity);

  const savedContent = await saveGeneratedContent(
    req.user.id,
    'social-media',
    'Social Media Generator',
    'social-post',
    requestPayload,
    {
      posts: normalizedPosts,
      insights: aiResponse?.insights || '',
      autoPost
    },
    resolvedPlatforms[0]
  );

  await createUserNotification(req.user.id || req.user._id, {
    type: 'success',
    category: 'content-generation',
    title: 'Social content is ready',
    message: `${normalizedPosts.length} ${contentType} draft${normalizedPosts.length > 1 ? 's are' : ' is'} ready for review and publishing.`,
    action: {
      label: 'Open Social Media Generator',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tools/social-media`,
    },
  }, {
    sendEmail: false,
  });

  res.json({
    success: true,
    message: usedFallback
      ? 'Social media content generated with fallback mode.'
      : 'Social media content generated successfully!',
    data: {
      posts: normalizedPosts,
      insights: aiResponse?.insights || 'Your posts are ready for review and publishing.',
      aiGenerated: !usedFallback,
      requestedPlatforms: resolvedPlatforms,
      requestedQuantity,
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

  let generatedContent;
  let usedFallback = false;

  try {
    const prompt = `
      Create a high-impact Value Proposition for the following product:
      PRODUCT: ${productName}
      TARGET AUDIENCE: ${targetAudience}
      PROBLEM SOLVED: ${problemSolved}
      UNIQUE FEATURES: ${uniqueFeatures}

      Return ONLY a JSON object:
      {
        "headline": "compelling main headline",
        "subheadline": "supportive subheadline",
        "valueProps": ["benefit 1", "benefit 2", "benefit 3"],
        "cta": "strong call to action"
      }
    `;
    generatedContent = await requestAI(prompt, 'You are an expert value proposition designer and conversion copywriter.');
  } catch (error) {
    console.error('Value prop AI generation failed:', error.message);
    generatedContent = {
      headline: `Transform Your ${targetAudience}'s Experience`,
      subheadline: `${productName} helps ${targetAudience} ${problemSolved}`,
      valueProps: [
        `Solve ${problemSolved} in minutes, not hours`,
        `Unique ${uniqueFeatures} that competitors don't offer`,
        `Trusted by thousands of satisfied customers`
      ],
      cta: 'Get Started Today'
    };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Value proposition generated (fallback mode)' : 'Value proposition generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let analysis;
  let usedFallback = false;

  try {
    const prompt = `
      Analyze this marketing headline for engagement, clarity, and SEO:
      HEADLINE: ${headline}

      Return ONLY a JSON object:
      {
        "headline": "${headline}",
        "score": 0-100,
        "metrics": {
          "wordCount": number,
          "characterCount": number,
          "hasNumber": boolean,
          "hasQuestion": boolean,
          "hasEmotionalWord": boolean
        },
        "sentiment": "positive/negative/neutral",
        "suggestions": ["improvement 1", "improvement 2"]
      }
    `;
    analysis = await requestAI(prompt, 'You are a senior conversion copywriter specializing in headline optimization.');
  } catch (error) {
    console.error('Headline AI analysis failed:', error.message);
    const wordCount = headline.split(' ').length;
    const characterCount = headline.length;
    analysis = {
      headline,
      score: 65,
      metrics: { wordCount, characterCount, hasNumber: false, hasQuestion: false, hasEmotionalWord: false },
      sentiment: 'neutral',
      suggestions: ['AI analysis unavailable. Consider adding more emotional power words.']
    };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Headline analyzed (fallback mode)' : 'Headline analyzed successfully!',
    data: {
      analysis,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let generatedContent;
  let usedFallback = false;

  try {
    const prompt = `
      Generate optimized SEO and Social Meta Tags for:
      TITLE: ${title}
      DESCRIPTION: ${description || 'N/A'}
      KEYWORDS: ${keywords || 'N/A'}
      URL: ${url || 'N/A'}

      Return ONLY a JSON object:
      {
        "metaTitle": "SEO title (max 60 chars)",
        "metaDescription": "SEO description (max 160 chars)",
        "ogTitle": "Facebook/OpenGraph title",
        "ogDescription": "Facebook/OpenGraph description",
        "ogImage": "URL for OG image",
        "twitterCard": "summary_large_image",
        "keywords": ["tag1", "tag2"],
        "canonicalUrl": "${url}",
        "structuredData": {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "${title}",
          "description": "SEO description"
        }
      }
    `;
    generatedContent = await requestAI(prompt, 'You are an SEO specialist and technical marketer.');
  } catch (error) {
    console.error('SEO AI generation failed:', error.message);
    generatedContent = {
      metaTitle: title.length <= 60 ? title : title.substring(0, 57) + '...',
      metaDescription: description || `Learn more about ${title}.`,
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
    usedFallback = true;
  }

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
    message: usedFallback ? 'SEO meta generated (fallback mode)' : 'SEO meta tags generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let analysis;
  let usedFallback = false;

  try {
    const prompt = `
      Test this email subject line for open-rate potential and spam risks:
      SUBJECT: ${subject}

      Return ONLY a JSON object:
      {
        "subject": "${subject}",
        "score": 0-100,
        "metrics": {
          "wordCount": number,
          "characterCount": number,
          "hasNumber": boolean,
          "hasEmoji": boolean,
          "hasPersonalization": boolean
        },
        "estimatedOpenRate": "percentage %",
        "spamScore": 0-100,
        "suggestions": ["suggestion 1", "suggestion 2"]
      }
    `;
    analysis = await requestAI(prompt, 'You are an email marketing specialist and deliverability expert.');
  } catch (error) {
    console.error('Email AI testing failed:', error.message);
    const wordCount = subject.split(' ').length;
    analysis = {
      subject,
      score: 55,
      metrics: { wordCount, characterCount: subject.length, hasNumber: false, hasEmoji: false, hasPersonalization: false },
      estimatedOpenRate: '15-20%',
      spamScore: 10,
      suggestions: ['AI testing unavailable. Keep it short and create curiosity.']
    };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Email subject tested (fallback mode)' : 'Email subject line tested successfully!',
    data: {
      analysis,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let generatedContent;
  let usedFallback = false;

  try {
    const prompt = `
      Generate ${count} high-quality content ideas for:
      TOPIC/NICHE: ${topic} (${niche})
      TARGET AUDIENCE: ${audience}

      Return ONLY a JSON object:
      {
        "niche": "${niche}",
        "audience": "${audience}",
        "ideas": [
          {
            "id": 1,
            "title": "catchy content title",
            "description": "brief overview of the content",
            "format": "How-to/List/Guide/Case Study/etc.",
            "estimatedLength": "word count range",
            "difficulty": "Beginner/Intermediate/Advanced"
          }
        ],
        "totalIdeas": ${count}
      }
    `;
    generatedContent = await requestAI(prompt, 'You are a professional content strategist and editor.');
  } catch (error) {
    console.error('Content ideas AI generation failed:', error.message);
    const ideas = [];
    const formats = ['How-to', 'List', 'Case Study', 'Tutorial', 'Guide', 'Comparison'];
    for (let i = 1; i <= count; i++) {
      const format = formats[i % formats.length];
      ideas.push({
        id: i,
        title: `${format}: ${topic} for ${audience}`,
        description: `A comprehensive ${format.toLowerCase()} covering ${topic}`,
        format,
        estimatedLength: '800-1200 words',
        difficulty: 'Intermediate'
      });
    }
    generatedContent = { niche, audience, ideas, totalIdeas: count };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Content ideas generated (fallback mode)' : `${count} content ideas generated successfully!`,
    data: {
      content: generatedContent,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let generatedContent;
  let usedFallback = false;

  try {
    const prompt = `
      Create compelling Ad Copy for:
      PRODUCT/SERVICE: ${product}
      TARGET AUDIENCE: ${audience}
      PLATFORM: ${platform}
      TONE: ${tone}
      DESIRED LENGTH: ${length}

      Return ONLY a JSON object:
      {
        "headline": "main catchy headline",
        "body": "primary ad body text",
        "cta": "strong call to action",
        "variations": [
          {
            "headline": "alternative headline",
            "body": "alternative body",
            "cta": "alternative cta"
          }
        ],
        "platform": "${platform}",
        "tone": "${tone}",
        "estimatedCTR": "percentage % range"
      }
    `;
    generatedContent = await requestAI(prompt, 'You are a high-conversion performance marketing specialist and copywriter.');
  } catch (error) {
    console.error('Ad copy AI generation failed:', error.message);
    generatedContent = {
      headline: `Discover ${product} - Perfect for ${audience}`,
      body: `Transform your experience with ${product}. Join thousands who've already made the switch.`,
      cta: 'Learn More',
      variations: [
        { headline: `Why ${audience} Love ${product}`, body: `See what makes ${product} the #1 choice.`, cta: 'Get Started' }
      ],
      platform,
      tone,
      estimatedCTR: '2.5-4.5%'
    };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Ad copy generated (fallback mode)' : 'Ad copy generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
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

  let generatedContent;
  let usedFallback = false;

  try {
    const prompt = `
      Design a comprehensive Marketing Funnel for:
      GOAL: ${goal}
      TARGET AUDIENCE: ${audience}
      MONTHLY BUDGET: ${budget}
      TIMELINE: ${timeline} days

      Return ONLY a JSON object:
      {
        "goal": "${goal}",
        "audience": "${audience}",
        "stages": [
          {
            "name": "Stage Name (e.g. Awareness)",
            "objective": "Stage objective",
            "tactics": ["tactic 1", "tactic 2"],
            "budget": "estimated budget for this stage",
            "duration": "days/weeks"
          }
        ],
        "kpis": ["KPI 1", "KPI 2"],
        "estimatedROI": "ROI range %"
      }
    `;
    generatedContent = await requestAI(prompt, 'You are a senior digital marketing strategist and growth hacker.');
  } catch (error) {
    console.error('Funnel AI generation failed:', error.message);
    generatedContent = {
      goal,
      audience,
      stages: [
        { name: 'Awareness', objective: 'Attract attention', tactics: ['Social media', 'SEO'], budget: `$${Math.round(budget * 0.3)}`, duration: '14 days' },
        { name: 'Action', objective: 'Convert', tactics: ['Email', 'Offers'], budget: `$${Math.round(budget * 0.2)}`, duration: '7 days' }
      ],
      kpis: ['Website traffic', 'Sales conversion'],
      estimatedROI: '250-400%'
    };
    usedFallback = true;
  }

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
    message: usedFallback ? 'Marketing funnel generated (fallback mode)' : 'Marketing funnel generated successfully!',
    data: {
      content: generatedContent,
      savedContent: savedContent._id,
      aiGenerated: !usedFallback
    }
  });
};

// ============================================
// CONTENT MANAGEMENT
// ============================================

export const getContent = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
  const query = {
    userId: req.user.id || req.user._id,
    deletedAt: null
  };

  if (req.query.toolId) {
    query.toolId = req.query.toolId;
  }

  if (req.query.status) {
    query.status = req.query.status;
  }

  if (req.query.favorite === 'true') {
    query.isFavorite = true;
  }

  const [content, totalContent] = await Promise.all([
    ToolContent.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ToolContent.countDocuments(query)
  ]);

  res.json({
    success: true,
    data: {
      content,
      totalPages: Math.ceil(totalContent / limit),
      currentPage: page,
      totalContent
    }
  });
};

export const getContentById = async (req, res) => {
  const content = await ToolContent.findOne({
    _id: req.params.id,
    userId: req.user.id || req.user._id,
    deletedAt: null
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  return res.json({
    success: true,
    data: content
  });
};

export const deleteContent = async (req, res) => {
  const content = await ToolContent.findOne({
    _id: req.params.id,
    userId: req.user.id || req.user._id,
    deletedAt: null
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  await content.softDelete();

  return res.json({
    success: true,
    message: 'Content deleted successfully!'
  });
};

export const toggleFavorite = async (req, res) => {
  const content = await ToolContent.findOne({
    _id: req.params.id,
    userId: req.user.id || req.user._id,
    deletedAt: null
  });

  if (!content) {
    return res.status(404).json({
      success: false,
      message: 'Content not found'
    });
  }

  await content.toggleFavorite();

  return res.json({
    success: true,
    message: content.isFavorite ? 'Added to favorites' : 'Removed from favorites',
    data: {
      id: content._id,
      isFavorite: content.isFavorite
    }
  });
};
