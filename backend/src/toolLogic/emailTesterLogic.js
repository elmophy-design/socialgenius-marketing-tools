// Email Subject Line Tester Logic

// ============================================
// CONFIGURATION DATA
// ============================================
const spamWords = [
  'free', 'guarantee', 'winner', 'prize', 'cash', 'money', 'income',
  'earn', 'extra', 'home based', 'work from home', 'make money',
  'million', 'billion', 'risk free', 'special promotion', 'click here',
  'subscribe', 'order now', 'buy now', 'discount', 'deal', 'offer',
  'limited time', 'act now', 'urgent', 'important', 'alert', 'warning',
  'congratulations', 'help', 'reminder', 'sale', 'clearance', 'bargain'
];

const powerWords = [
  'you', 'your', 'discover', 'secret', 'proven', 'instant', 'easy',
  'simple', 'quick', 'fast', 'amazing', 'incredible', 'unbelievable',
  'exclusive', 'limited', 'new', 'improved', 'advanced', 'premium',
  'ultimate', 'complete', 'comprehensive', 'essential', 'must-have'
];

const industryBenchmarks = {
  ecommerce: { openRate: 18.0, clickRate: 2.6 },
  saas: { openRate: 22.1, clickRate: 3.2 },
  education: { openRate: 20.5, clickRate: 2.8 },
  health: { openRate: 23.4, clickRate: 3.1 },
  finance: { openRate: 21.8, clickRate: 2.9 },
  entertainment: { openRate: 25.2, clickRate: 3.5 }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Analyze subject line for spam words
 */
function analyzeSpamWords(subjectLine) {
  const lowerSubject = subjectLine.toLowerCase();
  const foundSpamWords = spamWords.filter(word => 
    lowerSubject.includes(word.toLowerCase())
  );
  const spamWordCount = foundSpamWords.length;
  
  let risk = 'low';
  if (spamWordCount >= 3) risk = 'high';
  else if (spamWordCount >= 1) risk = 'medium';

  return {
    foundWords: foundSpamWords,
    count: spamWordCount,
    risk: risk
  };
}

/**
 * Calculate overall score for the subject line
 */
function calculateOverallScore(subjectLine, spamAnalysis) {
  let score = 0;
  const length = subjectLine.length;
  const words = subjectLine.trim().split(/\s+/).length;

  // Length scoring (optimal: 28-39 characters)
  if (length >= 28 && length <= 39) {
    score += 30;
  } else if (length >= 20 && length <= 50) {
    score += 20;
  } else if (length >= 15 && length <= 60) {
    score += 10;
  } else {
    score += 5;
  }

  // Word count scoring (optimal: 3-7 words)
  if (words >= 3 && words <= 7) {
    score += 20;
  } else if (words >= 2 && words <= 10) {
    score += 15;
  } else {
    score += 5;
  }

  // Personalization bonus
  const hasPersonalization = subjectLine.includes('{name}') || 
                             subjectLine.includes('{firstName}');
  if (hasPersonalization) score += 15;

  // Spam word penalty
  if (spamAnalysis.risk === 'high') {
    score -= 30;
  } else if (spamAnalysis.risk === 'medium') {
    score -= 15;
  }

  // Power words bonus
  const powerWordCount = powerWords.filter(word => 
    subjectLine.toLowerCase().includes(word.toLowerCase())
  ).length;
  score += Math.min(powerWordCount * 5, 15);

  // Emoji consideration
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/gu.test(subjectLine);
  if (hasEmoji && length <= 35) score += 5;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate predicted metrics based on score and industry
 */
function calculatePredictedMetrics(score, industry) {
  const benchmark = industryBenchmarks[industry] || industryBenchmarks.ecommerce;
  const scoreMultiplier = score / 100;
  
  const predictedOpenRate = benchmark.openRate * (0.7 + (scoreMultiplier * 0.6));
  const predictedClickRate = benchmark.clickRate * (0.6 + (scoreMultiplier * 0.8));
  const spamRisk = Math.max(0, 100 - (predictedOpenRate * 3));
  const mobileScore = Math.max(0, 100 - (Math.abs(35 - subjectLine.length) * 2));

  return {
    openRate: Math.min(40, Math.round(predictedOpenRate * 10) / 10),
    clickRate: Math.min(8, Math.round(predictedClickRate * 10) / 10),
    spamScore: Math.round(spamRisk),
    mobileScore: Math.min(100, Math.round(mobileScore))
  };
}

/**
 * Generate list of strengths for the subject line
 */
function generateStrengths(subjectLine, spamAnalysis) {
  const strengths = [];
  const length = subjectLine.length;
  const hasPersonalization = subjectLine.includes('{name}') || 
                             subjectLine.includes('{firstName}');
  const hasNumbers = /\d/.test(subjectLine);
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/gu.test(subjectLine);

  if (length >= 28 && length <= 39) {
    strengths.push("Optimal length for email clients");
  }
  if (hasPersonalization) {
    strengths.push("Personalization increases engagement");
  }
  if (spamAnalysis.risk === 'low') {
    strengths.push("Low spam risk - good deliverability");
  }
  if (hasNumbers) {
    strengths.push("Numbers can increase open rates");
  }
  if (length <= 50) {
    strengths.push("Good length for mobile devices");
  }
  if (hasEmoji && length <= 35) {
    strengths.push("Strategic emoji use can stand out");
  }

  return strengths.length > 0 ? strengths : ["Good starting point - consider the suggestions below"];
}

/**
 * Generate list of improvements for the subject line
 */
function generateImprovements(subjectLine, spamAnalysis) {
  const improvements = [];
  const length = subjectLine.length;
  const hasPersonalization = subjectLine.includes('{name}') || 
                             subjectLine.includes('{firstName}');
  const hasNumbers = /\d/.test(subjectLine);

  if (length > 60) {
    improvements.push("Consider shortening for mobile preview");
  } else if (length < 20) {
    improvements.push("Add more context to increase relevance");
  }
  if (!hasPersonalization) {
    improvements.push("Add personalization (e.g., {name})");
  }
  if (spamAnalysis.risk === 'high') {
    improvements.push("Remove spam trigger words");
  } else if (spamAnalysis.risk === 'medium') {
    improvements.push("Consider reducing spam trigger words");
  }
  if (!hasNumbers) {
    improvements.push("Consider adding numbers for specificity");
  }

  return improvements.length > 0 ? improvements : ["Subject line looks good! Test different variations"];
}

/**
 * Generate alternative suggestions for the subject line
 */
function generateSuggestions(subjectLine, score, spamAnalysis) {
  const suggestions = [];

  // Personalization suggestion
  if (!subjectLine.includes('{name}')) {
    suggestions.push({
      text: `{name}, ${subjectLine}`,
      score: Math.min(100, score + 15),
      type: "personalized"
    });
  }

  // Shortened version
  if (subjectLine.length > 40) {
    suggestions.push({
      text: subjectLine.substring(0, 37) + "...",
      score: Math.min(100, score + 10),
      type: "shortened"
    });
  }

  // Question format
  if (!subjectLine.includes('?')) {
    suggestions.push({
      text: subjectLine.replace(/\.$/, '') + '?',
      score: Math.min(100, score + 8),
      type: "question"
    });
  }

  // Clean version (remove spam words)
  if (spamAnalysis.foundWords.length > 0) {
    let cleanSubject = subjectLine;
    spamAnalysis.foundWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      cleanSubject = cleanSubject.replace(regex, '');
    });
    cleanSubject = cleanSubject.replace(/\s+/g, ' ').trim();
    if (cleanSubject.length > 10) {
      suggestions.push({
        text: cleanSubject,
        score: Math.min(100, score + 20),
        type: "clean"
      });
    }
  }

  return suggestions.slice(0, 4);
}

// ============================================
// MAIN ENTRY FUNCTION
// ============================================

/**
 * Main function to test and analyze email subject line
 * @param {object} data - Data object from the React frontend request
 * @returns {object} - Analysis results
 */
function testSubjectLineLogic(data) {
  const { 
    subjectLine,
    emailType,
    audience,
    industry,
    senderName
  } = data;

  if (!subjectLine || subjectLine.trim() === '') {
    throw new Error('Subject line is required');
  }

  // Perform analysis
  const spamAnalysis = analyzeSpamWords(subjectLine);
  const overallScore = calculateOverallScore(subjectLine, spamAnalysis);
  const predictedMetrics = calculatePredictedMetrics(overallScore, industry, subjectLine);
  const strengths = generateStrengths(subjectLine, spamAnalysis);
  const improvements = generateImprovements(subjectLine, spamAnalysis);
  const suggestions = generateSuggestions(subjectLine, overallScore, spamAnalysis);

  return {
    subjectLine: subjectLine,
    senderName: senderName || 'Your Company',
    emailType: emailType,
    audience: audience,
    industry: industry,
    charCount: subjectLine.length,
    wordCount: subjectLine.trim().split(/\s+/).length,
    overallScore: overallScore,
    spamAnalysis: spamAnalysis,
    predictedMetrics: predictedMetrics,
    strengths: strengths,
    improvements: improvements,
    suggestions: suggestions
  };
}

// Correct ES Module Export
export { testSubjectLineLogic };