// headlineLogic.js - Backend logic for Headline Analyzer

const powerWords = [
  'amazing', 'best', 'brilliant', 'essential', 'exclusive', 'expert',
  'free', 'guaranteed', 'instant', 'limited', 'new', 'powerful',
  'proven', 'revolutionary', 'secret', 'simple', 'ultimate', 'winning'
];

const negativeWords = [
  'avoid', 'bad', 'beware', 'difficult', 'disaster', 'fail',
  'horrible', 'mistake', 'never', 'terrible', 'warning', 'worst'
];

const questionWords = ['how', 'what', 'why', 'when', 'where', 'who', 'which', 'are', 'can', 'do', 'does', 'is', 'will'];

// Configuration for different content types
const contentTypeConfigs = {
  'blog': { optimalWordCount: [8, 14], optimalCharCount: [50, 70], optimalSentiment: 60 },
  'news': { optimalWordCount: [6, 12], optimalCharCount: [40, 60], optimalSentiment: 50 },
  'product': { optimalWordCount: [5, 10], optimalCharCount: [40, 60], optimalSentiment: 70 },
  'email': { optimalWordCount: [4, 8], optimalCharCount: [30, 50], optimalSentiment: 65 },
  'social': { optimalWordCount: [5, 10], optimalCharCount: [40, 60], optimalSentiment: 65 },
  'ad': { optimalWordCount: [4, 8], optimalCharCount: [30, 50], optimalSentiment: 75 }
};

// Platform-specific recommendations
const platformConfigs = {
  'web': { maxCharCount: 60, recommendsQuestions: true, recommendsNumbers: true },
  'facebook': { maxCharCount: 80, recommendsQuestions: true, recommendsNumbers: true },
  'twitter': { maxCharCount: 280, recommendsQuestions: true, recommendsNumbers: true },
  'linkedin': { maxCharCount: 120, recommendsQuestions: false, recommendsNumbers: true },
  'instagram': { maxCharCount: 125, recommendsQuestions: false, recommendsNumbers: true },
  'email': { maxCharCount: 50, recommendsQuestions: true, recommendsNumbers: false }
};

// Helper functions
function calculateWordCount(headline) {
  return headline.trim().split(/\s+/).length;
}

function calculateCharCount(headline) {
  return headline.length;
}

function estimateSyllables(text) {
  text = text.toLowerCase();
  let count = 0;
  const vowels = 'aeiouy';
  let prevCharIsVowel = false;
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (vowels.includes(char)) {
      if (!prevCharIsVowel) {
        count++;
      }
      prevCharIsVowel = true;
    } else {
      prevCharIsVowel = false;
    }
  }
  
  if (text.endsWith('e')) count--;
  if (count === 0) count = 1;
  
  return count;
}

function calculateSentiment(headline) {
  const words = headline.toLowerCase().split(/\s+/);
  let score = 50; // Neutral baseline
  
  words.forEach(word => {
    if (powerWords.some(positive => word.includes(positive))) {
      score += 10;
    }
    if (negativeWords.some(negative => word.includes(negative))) {
      score -= 10;
    }
  });
  
  return Math.max(0, Math.min(100, score));
}

function calculateReadability(headline) {
  const wordCount = calculateWordCount(headline);
  const sentenceCount = headline.split(/[.!?]+/).length;
  const syllableCount = estimateSyllables(headline);
  
  if (wordCount === 0) return 100;
  
  // Simplified Flesch Reading Ease approximation
  let score = 100 - (wordCount / sentenceCount * 1.015) - (syllableCount / wordCount * 84.6);
  
  return Math.max(0, Math.min(100, score));
}

function calculateOverallScore(headline, contentType, platform, targetAudience, tone) {
  const wordCount = calculateWordCount(headline);
  const charCount = calculateCharCount(headline);
  const sentimentScore = calculateSentiment(headline);
  const readabilityScore = calculateReadability(headline);
  
  let score = 0;
  const config = contentTypeConfigs[contentType] || contentTypeConfigs.blog;
  
  // Word count scoring (optimal range: 6-12 words)
  if (wordCount >= config.optimalWordCount[0] && wordCount <= config.optimalWordCount[1]) {
    score += 25;
  } else if (wordCount >= config.optimalWordCount[0] - 2 && wordCount <= config.optimalWordCount[1] + 2) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Character count scoring
  if (charCount >= config.optimalCharCount[0] && charCount <= config.optimalCharCount[1]) {
    score += 25;
  } else if (charCount >= config.optimalCharCount[0] - 10 && charCount <= config.optimalCharCount[1] + 10) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Sentiment scoring
  if (Math.abs(sentimentScore - config.optimalSentiment) <= 10) {
    score += 25;
  } else if (Math.abs(sentimentScore - config.optimalSentiment) <= 20) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Readability scoring
  if (readabilityScore >= 70) {
    score += 25;
  } else if (readabilityScore >= 50) {
    score += 15;
  } else {
    score += 5;
  }
  
  // Bonus points
  const hasPowerWord = powerWords.some(word => headline.toLowerCase().includes(word));
  const hasNumber = /\d/.test(headline);
  const isQuestion = headline.includes('?') || questionWords.some(word => headline.toLowerCase().startsWith(word));
  const containsYou = /\byou\b|\byour\b/i.test(headline);
  
  if (hasPowerWord) score += 5;
  if (hasNumber) score += 5;
  if (isQuestion) score += 5;
  if (containsYou) score += 5;
  
  return Math.round(Math.min(100, score));
}

function generateStrengths(headline, contentType) {
  const strengths = [];
  const wordCount = calculateWordCount(headline);
  const charCount = calculateCharCount(headline);
  const sentimentScore = calculateSentiment(headline);
  const readabilityScore = calculateReadability(headline);
  const config = contentTypeConfigs[contentType] || contentTypeConfigs.blog;
  
  // Word count strengths
  if (wordCount >= config.optimalWordCount[0] && wordCount <= config.optimalWordCount[1]) {
    strengths.push("Optimal word count for engagement");
  }
  
  // Character count strengths
  if (charCount >= config.optimalCharCount[0] && charCount <= config.optimalCharCount[1]) {
    strengths.push("Ideal length for maximum impact");
  }
  
  // Sentiment strengths
  if (sentimentScore > 60) {
    strengths.push("Positive emotional appeal");
  } else if (sentimentScore >= 40 && sentimentScore <= 60) {
    strengths.push("Neutral and professional tone");
  }
  
  // Readability strengths
  if (readabilityScore > 70) {
    strengths.push("Easy to read and understand");
  }
  
  // Feature strengths
  const hasPowerWord = powerWords.some(word => headline.toLowerCase().includes(word));
  const hasNumber = /\d/.test(headline);
  const isQuestion = headline.includes('?') || questionWords.some(word => headline.toLowerCase().startsWith(word));
  const containsYou = /\byou\b|\byour\b/i.test(headline);
  
  if (hasPowerWord) strengths.push("Includes attention-grabbing power words");
  if (hasNumber) strengths.push("Numbers add specificity and credibility");
  if (isQuestion) strengths.push("Question format engages curiosity");
  if (containsYou) strengths.push("Directly addresses the reader");
  
  return strengths;
}

function generateImprovements(headline, contentType, platform) {
  const improvements = [];
  const wordCount = calculateWordCount(headline);
  const charCount = calculateCharCount(headline);
  const sentimentScore = calculateSentiment(headline);
  const readabilityScore = calculateReadability(headline);
  const config = contentTypeConfigs[contentType] || contentTypeConfigs.blog;
  const platformConfig = platformConfigs[platform] || platformConfigs.web;
  
  // Word count improvements
  if (wordCount < config.optimalWordCount[0]) {
    improvements.push("Consider adding more words for better context");
  } else if (wordCount > config.optimalWordCount[1]) {
    improvements.push("Consider shortening for better readability");
  }
  
  // Character count improvements
  if (charCount > platformConfig.maxCharCount) {
    improvements.push(`Shorten to avoid truncation (max ${platformConfig.maxCharCount} chars for ${platform})`);
  }
  
  // Sentiment improvements
  if (sentimentScore < 40) {
    improvements.push("Consider making the tone more positive");
  }
  
  // Readability improvements
  if (readabilityScore < 50) {
    improvements.push("Simplify language for better readability");
  }
  
  // Feature improvements
  const hasPowerWord = powerWords.some(word => headline.toLowerCase().includes(word));
  const hasNumber = /\d/.test(headline);
  const isQuestion = headline.includes('?') || questionWords.some(word => headline.toLowerCase().startsWith(word));
  const containsYou = /\byou\b|\byour\b/i.test(headline);
  
  if (!hasPowerWord) improvements.push("Add power words to increase click-through rate");
  if (platformConfig.recommendsNumbers && !hasNumber) improvements.push("Consider adding numbers for better performance");
  if (platformConfig.recommendsQuestions && !isQuestion) improvements.push("Try a question format to pique interest");
  if (!containsYou) improvements.push("Address the reader directly for better connection");
  
  return improvements;
}

function generateAlternativeHeadlines(headline, count = 4) {
  const alternatives = [];
  const words = headline.split(' ');
  
  for (let i = 0; i < count; i++) {
    let alternative;
    
    switch(i) {
      case 0: // Question format
        if (headline.includes('?')) {
          alternative = headline.replace('?', ' - The Ultimate Guide');
        } else {
          alternative = `Is ${headline.toLowerCase()} The Right Solution For You?`;
        }
        break;
      
      case 1: // Number format
        if (/\d/.test(headline)) {
          alternative = headline;
        } else {
          const numbers = ['5', '7', '10', '15'];
          const number = numbers[Math.floor(Math.random() * numbers.length)];
          alternative = `${number} ${headline}`;
        }
        break;
      
      case 2: // Power word format
        const powerWordsList = ['Amazing', 'Incredible', 'Proven', 'Secret', 'Ultimate'];
        const powerWord = powerWordsList[Math.floor(Math.random() * powerWordsList.length)];
        alternative = `${powerWord} ${headline}`;
        break;
      
      case 3: // Benefit-focused format
        alternative = `How ${headline.toLowerCase()} Can Transform Your Results`;
        break;
      
      default:
        alternative = headline;
    }
    
    alternatives.push({
      text: alternative,
      score: Math.min(100, calculateOverallScore(alternative, 'blog', 'web', 'general', 'neutral') + Math.floor(Math.random() * 10) + 5)
    });
  }
  
  return alternatives;
}

// Main function
function analyzeHeadlineLogic(data) {
  const { headline, contentType, targetAudience, tone, platform } = data;
  
  if (!headline || headline.trim().length === 0) {
    throw new Error('Headline is required');
  }
  
  const wordCount = calculateWordCount(headline);
  const charCount = calculateCharCount(headline);
  const sentimentScore = calculateSentiment(headline);
  const readabilityScore = calculateReadability(headline);
  const overallScore = calculateOverallScore(headline, contentType, platform, targetAudience, tone);
  
  return {
    overallScore,
    metrics: {
      wordCount,
      charCount,
      sentimentScore,
      readabilityScore: Math.round(readabilityScore)
    },
    strengths: generateStrengths(headline, contentType),
    improvements: generateImprovements(headline, contentType, platform),
    alternatives: generateAlternativeHeadlines(headline),
    analysis: {
      hasPowerWords: powerWords.some(word => headline.toLowerCase().includes(word)),
      hasNumbers: /\d/.test(headline),
      isQuestion: headline.includes('?') || questionWords.some(word => headline.toLowerCase().startsWith(word)),
      addressesReader: /\byou\b|\byour\b/i.test(headline),
      optimalLength: wordCount >= 6 && wordCount <= 12,
      optimalChars: charCount >= 50 && charCount <= 60
    }
  };
}

export { analyzeHeadlineLogic };