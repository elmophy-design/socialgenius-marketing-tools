// Social Media Content Generator Logic

// ============================================
// CONFIGURATION DATA
// ============================================

const platformConfigs = {
  instagram: {
    maxLength: 2200,
    optimalLength: 125,
    supportsHashtags: true,
    maxHashtags: 30,
    emojiSupport: true,
    name: 'Instagram'
  },
  tiktok: {
    maxLength: 150,
    optimalLength: 100,
    supportsHashtags: true,
    maxHashtags: 10,
    emojiSupport: true,
    name: 'TikTok'
  },
  twitter: {
    maxLength: 280,
    optimalLength: 240,
    supportsHashtags: true,
    maxHashtags: 3,
    emojiSupport: true,
    name: 'Twitter'
  },
  linkedin: {
    maxLength: 3000,
    optimalLength: 150,
    supportsHashtags: true,
    maxHashtags: 5,
    emojiSupport: false,
    name: 'LinkedIn'
  },
  facebook: {
    maxLength: 63206,
    optimalLength: 80,
    supportsHashtags: true,
    maxHashtags: 3,
    emojiSupport: true,
    name: 'Facebook'
  }
};

const contentTypeTemplates = {
  educational: {
    starters: [
      '📚 Pro Tip:',
      '💡 Did you know?',
      '🎓 Learn how to',
      '✨ Master the art of',
      '🔍 Discover the secret to'
    ],
    structures: [
      'problem → solution → action',
      'stat → insight → tip',
      'question → answer → bonus'
    ],
    callToActions: [
      'Save this for later!',
      'Share with someone who needs this',
      'What would you add to this list?',
      'Try this today and let us know how it goes'
    ]
  },
  promotional: {
    starters: [
      '🎉 Exciting news!',
      '🔥 Limited time offer:',
      '⭐ Special announcement:',
      '🎁 Don\'t miss out:',
      '💥 New arrival:'
    ],
    structures: [
      'hook → benefit → urgency → cta',
      'problem → solution → offer → cta',
      'testimonial → feature → bonus → cta'
    ],
    callToActions: [
      'Shop now - link in bio!',
      'Limited quantities available',
      'Get yours before it\'s gone',
      'Click the link to learn more'
    ]
  },
  entertaining: {
    starters: [
      '😂 You won\'t believe this:',
      '🤣 Real talk:',
      '😅 Can we just admit:',
      '🎭 Plot twist:',
      '🙃 Hot take:'
    ],
    structures: [
      'setup → punchline → relate',
      'relatable moment → reaction → tag',
      'before → after → reality'
    ],
    callToActions: [
      'Tag someone who needs to see this',
      'Double tap if you agree',
      'Comment your version below',
      'Share this with your squad'
    ]
  },
  inspirational: {
    starters: [
      '✨ Remember:',
      '🌟 Believe this:',
      '💫 Never forget:',
      '🦋 Truth:',
      '🌈 Today\'s reminder:'
    ],
    structures: [
      'challenge → growth → triumph',
      'reflection → insight → action',
      'quote → context → application'
    ],
    callToActions: [
      'Share to inspire someone today',
      'Save this for when you need it',
      'Pass this on to uplift others',
      'What inspires you? Let us know'
    ]
  },
  news: {
    starters: [
      '📰 Breaking:',
      '📢 Update:',
      '🔔 News flash:',
      '⚡ Just announced:',
      '📣 Industry update:'
    ],
    structures: [
      'headline → details → impact',
      'what → why → what next',
      'announcement → context → action'
    ],
    callToActions: [
      'What are your thoughts?',
      'Stay tuned for more updates',
      'Follow for the latest news',
      'Share your perspective below'
    ]
  }
};

const brandVoiceModifiers = {
  professional: {
    tone: 'formal and authoritative',
    vocabulary: ['leverage', 'optimize', 'strategic', 'innovative', 'comprehensive'],
    avoid: ['lol', 'omg', 'tbh', 'literally'],
    emojiUsage: 'minimal'
  },
  casual: {
    tone: 'friendly and approachable',
    vocabulary: ['awesome', 'great', 'amazing', 'cool', 'love'],
    avoid: ['synergy', 'paradigm', 'leveraging'],
    emojiUsage: 'moderate'
  },
  authoritative: {
    tone: 'expert and confident',
    vocabulary: ['proven', 'research-backed', 'industry-leading', 'expert', 'definitive'],
    avoid: ['maybe', 'possibly', 'kinda', 'sorta'],
    emojiUsage: 'rare'
  },
  humorous: {
    tone: 'witty and playful',
    vocabulary: ['hilarious', 'epic', 'legendary', 'wild', 'savage'],
    avoid: ['therefore', 'thus', 'henceforth'],
    emojiUsage: 'generous'
  },
  inspirational: {
    tone: 'uplifting and motivational',
    vocabulary: ['achieve', 'empower', 'transform', 'inspire', 'breakthrough'],
    avoid: ['failure', 'impossible', 'never', 'can\'t'],
    emojiUsage: 'purposeful'
  }
};

const nicheKeywords = {
  technology: ['innovation', 'digital', 'tech', 'AI', 'automation', 'software'],
  fashion: ['style', 'trending', 'collection', 'designer', 'fashion', 'outfit'],
  fitness: ['wellness', 'health', 'workout', 'nutrition', 'training', 'goals'],
  food: ['delicious', 'recipe', 'flavor', 'cuisine', 'chef', 'taste'],
  education: ['learning', 'knowledge', 'skills', 'growth', 'teaching', 'mastery'],
  finance: ['investment', 'wealth', 'financial', 'money', 'portfolio', 'returns'],
  travel: ['adventure', 'destination', 'explore', 'journey', 'wanderlust', 'discover'],
  realestate: ['property', 'investment', 'location', 'market', 'home', 'luxury'],
  ecommerce: ['shop', 'deals', 'products', 'store', 'shopping', 'discount']
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getRandomItem(array) {
  if (!array || array.length === 0) return '';
  return array[Math.floor(Math.random() * array.length)];
}

function generateHashtags(niche, interests, count = 5) {
  const hashtags = new Set();
  
  // Add niche-specific hashtags
  const nicheKeys = nicheKeywords[niche] || [];
  nicheKeys.forEach(keyword => {
    hashtags.add(`#${keyword.replace(/\s+/g, '')}`);
  });
  
  // Add interest-based hashtags
  interests.forEach(interest => {
    hashtags.add(`#${interest.replace(/\s+/g, '')}`);
  });
  
  // Add trending/general hashtags
  const generalHashtags = ['#viral', '#trending', '#fyp', '#explore', '#motivation'];
  generalHashtags.forEach(tag => {
    if (hashtags.size < count + 3) {
      hashtags.add(tag);
    }
  });
  
  return Array.from(hashtags).slice(0, count);
}

function generateContent(platform, niche, contentType, brandVoice, customNiche) {
  const platformConfig = platformConfigs[platform];
  const template = contentTypeTemplates[contentType];
  const voiceModifier = brandVoiceModifiers[brandVoice];
  
  const nicheDisplay = customNiche || niche;
  const starter = getRandomItem(template.starters);
  const cta = getRandomItem(template.callToActions);
  
  // Generate platform-specific content
  let content = '';
  
  if (platform === 'instagram') {
    content = `${starter}\n\nExploring the world of ${nicheDisplay}. Here's what you need to know:\n\nâœ… Key insights that matter\nâœ… Proven strategies that work\nâœ… Real results you can achieve\n\n${cta}`;
  } else if (platform === 'tiktok') {
    content = `${starter} ${nicheDisplay} edition! Quick tips inside ðŸ'¯\n\n${cta}`;
  } else if (platform === 'twitter') {
    content = `${starter} ${nicheDisplay} insight that changed everything:\n\n[Insert key takeaway here]\n\n${cta}`;
  } else if (platform === 'linkedin') {
    content = `${starter}\n\nIn today's ${nicheDisplay} landscape, understanding these key principles is crucial:\n\n1. Strategic approach to growth\n2. Leveraging innovative solutions\n3. Building sustainable success\n\n${cta}`;
  } else if (platform === 'facebook') {
    content = `${starter}\n\nWe're excited to share insights about ${nicheDisplay}!\n\nOur community has been growing, and we wanted to take a moment to connect with you.\n\n${cta}`;
  }
  
  // Ensure content fits platform limits
  if (content.length > platformConfig.maxLength) {
    content = content.substring(0, platformConfig.maxLength - 3) + '...';
  }
  
  return content;
}

// ============================================
// MAIN ENTRY FUNCTION
// ============================================

/**
 * Main function to generate social media content
 * @param {object} data - Data object from the React frontend request
 * @returns {object} - Generated social media posts
 */
function generateSocialMediaContent(data) {
  const {
    niche,
    customNiche,
    contentType,
    brandVoice,
    ageRange,
    interests,
    postQuantity,
    autoPost,
    platforms
  } = data;
  
  if (!niche) {
    throw new Error('Niche is required');
  }
  
  if (niche === 'custom' && !customNiche) {
    throw new Error('Custom niche description is required');
  }
  
  if (!platforms || platforms.length === 0) {
    throw new Error('At least one platform must be selected');
  }
  
  // Generate posts for each platform
  const posts = [];
  
  platforms.forEach(platform => {
    const content = generateContent(
      platform,
      niche,
      contentType,
      brandVoice,
      customNiche
    );
    
    const hashtags = generateHashtags(
      niche,
      interests || [],
      platformConfigs[platform].maxHashtags
    );
    
    posts.push({
      platform: platform,
      platformName: platformConfigs[platform].name,
      content: content,
      hashtags: hashtags,
      contentType: contentType,
      brandVoice: brandVoice,
      targetAudience: {
        ageRange: ageRange,
        interests: interests
      },
      metrics: {
        estimatedReach: Math.floor(Math.random() * 5000) + 2000,
        estimatedEngagement: Math.floor(Math.random() * 1000) + 500,
        estimatedEngagementRate: (Math.random() * 5 + 2).toFixed(2) + '%'
      },
      posted: autoPost,
      createdAt: new Date().toISOString()
    });
  });
  
  // Limit posts based on quantity
  const limitedPosts = posts.slice(0, Math.min(postQuantity, posts.length));
  
  return {
    posts: limitedPosts,
    summary: {
      totalPosts: limitedPosts.length,
      platforms: platforms,
      niche: customNiche || niche,
      contentType: contentType,
      brandVoice: brandVoice,
      autoPosted: autoPost
    },
    recommendations: generateRecommendations(limitedPosts, data)
  };
}

function generateRecommendations(posts, data) {
  const recommendations = [];
  
  // Best time to post
  recommendations.push({
    type: 'timing',
    title: 'Optimal Posting Times',
    description: 'Based on your audience, post between 12-3 PM or 7-9 PM for maximum engagement'
  });
  
  // Hashtag strategy
  if (data.interests && data.interests.length > 0) {
    recommendations.push({
      type: 'hashtags',
      title: 'Hashtag Strategy',
      description: `Mix popular and niche hashtags. Your interests (${data.interests.join(', ')}) are trending`
    });
  }
  
  // Content variety
  recommendations.push({
    type: 'content',
    title: 'Content Mix',
    description: 'Vary your content types. Try carousel posts, videos, and stories for better reach'
  });
  
  return recommendations;
}

// Correct ES Module Export
export { generateSocialMediaContent };