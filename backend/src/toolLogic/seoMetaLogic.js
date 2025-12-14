// seoMetaLogic.js - Backend logic for SEO Meta Generator

// SEO configurations
const contentTypeConfigs = {
    'blog': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "The Ultimate Guide to {keyword} | {year}",
                "{number} Best {keyword} Strategies That Actually Work",
                "How to {keyword}: Complete {year} Guide",
                "{keyword} Made Simple: Step-by-Step Tutorial"
            ],
            description: [
                "Learn how to {keyword} with our comprehensive guide. Discover {benefits} and get {results}. Start today!",
                "Want to {solve problem}? Our {year} guide shows you exactly how. Get {number} proven strategies and {benefit}.",
                "Discover the secrets of successful {keyword}. Learn {key points} and avoid common mistakes. Read now!"
            ]
        }
    },
    'product': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "Buy {product} | {features} | {brand}",
                "{product} - {key benefit} | Free Shipping",
                "{product} Review: {year} Buyer's Guide",
                "Best {product} for {use case} | {brand}"
            ],
            description: [
                "Shop {product} with {key features}. {benefits}. Free shipping and {guarantee}. Order now and save!",
                "Looking for the best {product}? Our {product} offers {features} and {benefits}. Buy now with confidence!",
                "Get amazing {results} with our {product}. Features include {key features}. {special offer}. Shop today!"
            ]
        }
    },
    'service': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "{service} Services | {location} | {brand}",
                "Professional {service} | {benefits} | {brand}",
                "Best {service} Company | {year} | {location}",
                "{service} Made Easy | Get Quote | {brand}"
            ],
            description: [
                "Get professional {service} services with {benefits}. Serving {location}. Free consultation. Contact us today!",
                "Need reliable {service}? Our experts provide {quality} service with {guarantee}. Get free quote now!",
                "Top-rated {service} company. We offer {services} with {benefits}. {satisfaction guarantee}. Call today!"
            ]
        }
    },
    'landing': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "{offer} | {brand} | {benefit}",
                "Get {offer} Now | {time limit} | {brand}",
                "{solution} for {problem} | {brand}",
                "Transform Your {area} | {offer} | {brand}"
            ],
            description: [
                "Get {offer} and achieve {results}. Limited time offer. {number} people have already {achievement}. Join now!",
                "Stop {problem} and start {benefit}. Our {solution} delivers {results}. {guarantee}. Get started today!",
                "Discover how to {achieve goal} with our {solution}. {social proof}. {call to action}. Limited spots available!"
            ]
        }
    },
    'homepage': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "{brand} | {primary offering} | {location}",
                "Welcome to {brand} | {tagline}",
                "{brand} - {primary benefit} | Since {year}",
                "Home of {specialty} | {brand}"
            ],
            description: [
                "{brand} provides {primary offering} with {key benefits}. Serving {location} since {year}. {call to action} today!",
                "Discover {primary offering} at {brand}. We specialize in {specialties} and deliver {results}. Learn more!",
                "Your trusted source for {primary offering}. {brand} offers {benefits} and {guarantee}. Visit us today!"
            ]
        }
    },
    'article': {
        titleLength: [50, 60],
        descLength: [120, 155],
        patterns: {
            title: [
                "{headline} | {year} News | {source}",
                "Breaking: {headline} | Latest Updates",
                "{headline}: What You Need to Know",
                "The Truth About {topic} | {year} Report"
            ],
            description: [
                "Latest news on {topic}. Get the facts about {headline}. Stay informed with {source} coverage.",
                "Breaking news update: {headline}. Learn about {key points} and {implications}. Read full story.",
                "In-depth analysis of {topic}. Understand {headline} and its impact. Expert insights from {source}."
            ]
        }
    }
};

const toneTemplates = {
    'professional': {
        adjectives: ['comprehensive', 'professional', 'advanced', 'enterprise', 'strategic', 'expert'],
        verbs: ['discover', 'learn', 'achieve', 'optimize', 'implement', 'enhance'],
        phrases: ['industry best practices', 'proven strategies', 'expert guidance', 'professional solutions'],
        benefits: ['improved performance', 'increased efficiency', 'better results', 'enhanced productivity']
    },
    'casual': {
        adjectives: ['awesome', 'simple', 'easy', 'fun', 'practical', 'user-friendly'],
        verbs: ['check out', 'discover', 'get', 'try', 'enjoy', 'explore'],
        phrases: ["you'll love", 'super helpful', 'game-changing tips', 'must-have'],
        benefits: ['save time', 'have fun', 'get better results', 'make life easier']
    },
    'authoritative': {
        adjectives: ['definitive', 'comprehensive', 'expert', 'master', 'ultimate', 'premium'],
        verbs: ['master', 'dominate', 'excel', 'succeed', 'win', 'lead'],
        phrases: ['must-know strategies', 'industry secrets', 'professional guidance', 'expert insights'],
        benefits: ['market leadership', 'competitive advantage', 'superior results', 'industry recognition']
    },
    'urgent': {
        adjectives: ['limited', 'exclusive', 'urgent', 'time-sensitive', 'last-chance', 'once-in-a-lifetime'],
        verbs: ['act now', "don't miss", 'secure', 'claim', 'grab', 'reserve'],
        phrases: ['limited time offer', 'while supplies last', "don't wait", 'last chance'],
        benefits: ['immediate results', 'exclusive access', 'special pricing', 'priority treatment']
    },
    'educational': {
        adjectives: ['educational', 'informative', 'comprehensive', 'detailed', 'thorough', 'insightful'],
        verbs: ['learn', 'understand', 'discover', 'explore', 'study', 'master'],
        phrases: ['step-by-step guide', 'comprehensive tutorial', 'in-depth analysis', 'detailed explanation'],
        benefits: ['deeper understanding', 'new skills', 'expert knowledge', 'practical insights']
    }
};

const powerWords = [
    'ultimate', 'complete', 'essential', 'proven', 'secret', 'amazing',
    'incredible', 'unbelievable', 'revolutionary', 'breakthrough', 'exclusive',
    'limited', 'free', 'bonus', 'instant', 'easy', 'simple', 'quick', 'fast',
    'guaranteed', 'effective', 'powerful', 'professional', 'premium', 'advanced'
];

// Helper functions
function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber() {
    return [5, 7, 10, 15, 21, 25][Math.floor(Math.random() * 6)];
}

function getCurrentYear() {
    return new Date().getFullYear();
}

function generateSlug(text) {
    return text.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

function getRandomBenefits(tone) {
    const template = toneTemplates[tone] || toneTemplates.professional;
    return getRandomItem(template.benefits);
}

function getRandomProblem(keyword) {
    const problems = [
        `common ${keyword} challenges`,
        `struggling with ${keyword}`,
        `${keyword} difficulties`,
        `frustrating ${keyword} issues`,
        `${keyword} problems`
    ];
    return getRandomItem(problems);
}

function getRandomGoal(keyword) {
    const goals = [
        `master ${keyword}`,
        `improve your ${keyword}`,
        `excel at ${keyword}`,
        `succeed with ${keyword}`,
        `become expert in ${keyword}`
    ];
    return getRandomItem(goals);
}

function getRandomFeatures(keywords) {
    if (keywords && keywords.length > 0) {
        return keywords.slice(0, 2).join(', ');
    }
    return 'advanced features, easy setup';
}

function generateTitle(template, tone, primaryKeyword, secondaryKeywords = [], pageTitle) {
    const toneTemplate = toneTemplates[tone] || toneTemplates.professional;
    const patterns = contentTypeConfigs[template]?.patterns?.title || contentTypeConfigs.blog.patterns.title;
    const pattern = getRandomItem(patterns);
    
    const replacements = {
        '{keyword}': primaryKeyword,
        '{year}': getCurrentYear(),
        '{number}': getRandomNumber(),
        '{product}': primaryKeyword,
        '{service}': primaryKeyword,
        '{brand}': 'Your Brand',
        '{location}': 'Your Location',
        '{benefit}': getRandomItem(toneTemplate.adjectives) + ' Results',
        '{solution}': primaryKeyword + ' Solution',
        '{problem}': getRandomProblem(primaryKeyword),
        '{offer}': primaryKeyword + ' Offer',
        '{area}': primaryKeyword,
        '{headline}': pageTitle || primaryKeyword,
        '{topic}': primaryKeyword,
        '{source}': 'Your Brand'
    };
    
    let title = pattern;
    Object.keys(replacements).forEach(key => {
        title = title.replace(key, replacements[key]);
    });
    
    // Add power word if title is short
    if (title.length < 40 && Math.random() > 0.5) {
        title = getRandomItem(powerWords).charAt(0).toUpperCase() + getRandomItem(powerWords).slice(1) + ' ' + title;
    }
    
    // Ensure optimal length
    const maxLength = contentTypeConfigs[template]?.titleLength?.[1] || 60;
    if (title.length > maxLength) {
        title = title.substring(0, maxLength - 3) + '...';
    }
    
    return title;
}

function generateDescription(template, tone, primaryKeyword, secondaryKeywords = [], pageContent) {
    const toneTemplate = toneTemplates[tone] || toneTemplates.professional;
    const patterns = contentTypeConfigs[template]?.patterns?.description || contentTypeConfigs.blog.patterns.description;
    const pattern = getRandomItem(patterns);
    
    const replacements = {
        '{keyword}': primaryKeyword.toLowerCase(),
        '{product}': primaryKeyword.toLowerCase(),
        '{service}': primaryKeyword.toLowerCase(),
        '{topic}': primaryKeyword.toLowerCase(),
        '{year}': getCurrentYear(),
        '{number}': getRandomNumber(),
        '{brand}': 'our company',
        '{location}': 'your area',
        '{benefits}': getRandomItem(toneTemplate.adjectives) + ' results',
        '{features}': getRandomFeatures(secondaryKeywords),
        '{results}': getRandomItem(toneTemplate.verbs) + ' amazing outcomes',
        '{goal}': getRandomGoal(primaryKeyword),
        '{problem}': getRandomProblem(primaryKeyword),
        '{solution}': primaryKeyword + ' solution',
        '{achievement}': getRandomItem(['transformed their business', 'achieved amazing results', 'doubled their traffic', 'improved their rankings']),
        '{offer}': 'special offer',
        '{guarantee}': 'satisfaction guarantee',
        '{quality}': getRandomItem(toneTemplate.adjectives),
        '{specialties}': secondaryKeywords ? secondaryKeywords.join(', ') : 'our services',
        '{headline}': primaryKeyword,
        '{key points}': getRandomFeatures(secondaryKeywords) || 'key insights',
        '{implications}': 'important implications'
    };
    
    let description = pattern;
    Object.keys(replacements).forEach(key => {
        description = description.replace(key, replacements[key]);
    });
    
    // Add secondary keywords if available
    if (secondaryKeywords && secondaryKeywords.length > 0 && description.length < 100) {
        const extraKeywords = secondaryKeywords.slice(0, 2).join(', ');
        description += ` Features ${extraKeywords}.`;
    }
    
    // Add call to action
    if (!description.includes('!') && description.length < 130) {
        const ctas = ['Start today!', 'Learn more!', 'Get started!', 'Try now!'];
        description += ' ' + getRandomItem(ctas);
    }
    
    // Ensure optimal length
    const maxLength = contentTypeConfigs[template]?.descLength?.[1] || 155;
    if (description.length > maxLength) {
        description = description.substring(0, maxLength - 3) + '...';
    }
    
    return description;
}

function generateKeywordSuggestions(primaryKeyword, secondaryKeywords = [], pageContent) {
    const baseSuggestions = [
        primaryKeyword,
        `best ${primaryKeyword}`,
        `${primaryKeyword} tips`,
        `${primaryKeyword} guide`,
        `how to ${primaryKeyword}`,
        `${primaryKeyword} strategies`,
        `${primaryKeyword} techniques`,
        `${primaryKeyword} for beginners`,
        `advanced ${primaryKeyword}`,
        `${primaryKeyword} tutorial`
    ];
    
    // Add LSI keywords based on content type
    const lsiKeywords = [];
    if (primaryKeyword.toLowerCase().includes('marketing')) {
        lsiKeywords.push('digital marketing', 'online marketing', 'marketing strategies', 'marketing tips');
    }
    if (primaryKeyword.toLowerCase().includes('seo')) {
        lsiKeywords.push('search engine optimization', 'seo techniques', 'seo best practices', 'seo tools');
    }
    
    return [...new Set([...baseSuggestions, ...lsiKeywords, ...(secondaryKeywords || [])])].slice(0, 12);
}

function calculateKeywordScore(title, description, primaryKeyword) {
    let score = 0;
    const keyword = primaryKeyword.toLowerCase();
    const titleLower = title.toLowerCase();
    const descLower = description.toLowerCase();
    
    // Keyword in title
    if (titleLower.includes(keyword)) {
        score += 40;
        const position = titleLower.indexOf(keyword);
        if (position <= 20) score += 10; // Early placement bonus
    }
    
    // Keyword in description
    if (descLower.includes(keyword)) {
        score += 30;
    }
    
    // Keyword density
    const titleWords = titleLower.split(/\s+/).length;
    const descWords = descLower.split(/\s+/).length;
    const titleKeywordCount = (titleLower.match(new RegExp(keyword.split(' ')[0], 'g')) || []).length;
    const descKeywordCount = (descLower.match(new RegExp(keyword.split(' ')[0], 'g')) || []).length;
    
    const titleDensity = titleKeywordCount / Math.max(titleWords, 1);
    const descDensity = descKeywordCount / Math.max(descWords, 1);
    
    if (titleDensity <= 0.03 && titleDensity > 0) score += 10; // Good title density
    if (descDensity <= 0.02 && descDensity > 0) score += 10; // Good description density
    
    return Math.min(100, score);
}

function calculateLengthScore(title, description, template) {
    const config = contentTypeConfigs[template] || contentTypeConfigs.blog;
    const [titleMin, titleMax] = config.titleLength;
    const [descMin, descMax] = config.descLength;
    
    let score = 0;
    
    // Title length score
    if (title.length >= titleMin && title.length <= titleMax) {
        score += 50;
    } else if (title.length >= titleMin - 5 && title.length <= titleMax + 5) {
        score += 30;
    } else {
        score += 10;
    }
    
    // Description length score
    if (description.length >= descMin && description.length <= descMax) {
        score += 50;
    } else if (description.length >= descMin - 10 && description.length <= descMax + 10) {
        score += 30;
    } else {
        score += 10;
    }
    
    return Math.min(100, Math.round(score));
}

function calculateEngagementScore(title, description) {
    let score = 50;
    
    // Power words in title
    const titlePowerWords = powerWords.filter(word => title.toLowerCase().includes(word));
    score += titlePowerWords.length * 5;
    
    // Power words in description
    const descPowerWords = powerWords.filter(word => description.toLowerCase().includes(word));
    score += descPowerWords.length * 3;
    
    // Numbers in title
    if (/\d/.test(title)) score += 10;
    
    // Numbers in description
    if (/\d/.test(description)) score += 5;
    
    // Action words/CTAs
    const actionWords = ['discover', 'learn', 'get', 'try', 'start', 'join', 'buy', 'shop', 'download'];
    const hasActionWord = actionWords.some(word => 
        description.toLowerCase().includes(word) || title.toLowerCase().includes(word)
    );
    if (hasActionWord) score += 10;
    
    // Emotional triggers
    const emotionalWords = ['amazing', 'incredible', 'unbelievable', 'secret', 'ultimate', 'free'];
    const hasEmotionalWord = emotionalWords.some(word => 
        description.toLowerCase().includes(word) || title.toLowerCase().includes(word)
    );
    if (hasEmotionalWord) score += 5;
    
    // Question marks or exclamation
    if (title.includes('?') || description.includes('?')) score += 5;
    if (title.includes('!') || description.includes('!')) score += 5;
    
    return Math.min(100, score);
}

function calculateReadabilityScore(title, description) {
    let score = 70;
    
    // Title readability
    const titleWords = title.split(/\s+/).length;
    if (titleWords >= 5 && titleWords <= 8) score += 10;
    if (titleWords > 8) score -= 10;
    
    // Description readability
    const descWords = description.split(/\s+/).length;
    if (descWords >= 15 && descWords <= 25) score += 10;
    
    // Sentence structure
    const titleChars = /[|:—]/.test(title);
    if (!titleChars) score += 10;
    
    // Natural language flow
    const descSentences = description.split(/[.!?]+/).filter(s => s.trim()).length;
    if (descSentences >= 2 && descSentences <= 4) score += 10;
    
    return Math.min(100, Math.max(0, score));
}

function generateAnalysisDetails(title, description, primaryKeyword, template) {
    const config = contentTypeConfigs[template] || contentTypeConfigs.blog;
    const [titleMin, titleMax] = config.titleLength;
    const [descMin, descMax] = config.descLength;
    
    const keywordInTitle = title.toLowerCase().includes(primaryKeyword.toLowerCase());
    const keywordInDesc = description.toLowerCase().includes(primaryKeyword.toLowerCase());
    const keywordPosition = title.toLowerCase().indexOf(primaryKeyword.toLowerCase());
    
    const details = {
        keyword: '',
        length: '',
        engagement: '',
        readability: ''
    };
    
    // Keyword details
    if (keywordInTitle && keywordInDesc && keywordPosition <= 20) {
        details.keyword = "Perfect keyword placement in title and description";
    } else if (keywordInTitle && keywordInDesc) {
        details.keyword = "Good keyword usage in both title and description";
    } else if (keywordInTitle) {
        details.keyword = "Keyword in title but missing in description";
    } else if (keywordInDesc) {
        details.keyword = "Keyword in description but missing in title";
    } else {
        details.keyword = "Primary keyword missing from both title and description";
    }
    
    // Length details
    const titleStatus = title.length >= titleMin && title.length <= titleMax ? "optimal" :
                       title.length < titleMin ? "too short" : "too long";
    const descStatus = description.length >= descMin && description.length <= descMax ? "optimal" :
                      description.length < descMin ? "too short" : "too long";
    details.length = `Title: ${title.length} chars (${titleStatus}), Description: ${description.length} chars (${descStatus})`;
    
    // Engagement details
    const features = [];
    if (powerWords.some(word => title.toLowerCase().includes(word))) features.push("power words in title");
    if (powerWords.some(word => description.toLowerCase().includes(word))) features.push("power words in description");
    if (/\d/.test(title)) features.push("numbers in title");
    if (description.includes('!') || description.includes('?')) features.push("engagement punctuation");
    if (description.toLowerCase().includes('discover') || description.toLowerCase().includes('learn')) features.push("action-oriented");
    
    details.engagement = features.length > 0 ? 
        `Good engagement features: ${features.join(', ')}` :
        "Consider adding power words, numbers, or action phrases";
    
    // Readability details
    const titleWordCount = title.split(/\s+/).length;
    const descSentenceCount = description.split(/[.!?]+/).filter(s => s.trim()).length;
    details.readability = `Title: ${titleWordCount} words, Description: ${descSentenceCount} sentences - Good readability`;
    
    return details;
}

// Main function
function generateMetaTagsLogic(data) {
    const {
        pageTitle,
        pageContent,
        primaryKeyword,
        contentType = 'blog',
        tone = 'professional',
        targetAudience = 'general',
        secondaryKeywords = [],
        competitors = []
    } = data;
    
    if (!pageTitle || !primaryKeyword) {
        throw new Error('Page title and primary keyword are required');
    }
    
    // Generate variations
    const variations = [];
    for (let i = 0; i < 3; i++) {
        const title = generateTitle(contentType, tone, primaryKeyword, secondaryKeywords, pageTitle);
        const description = generateDescription(contentType, tone, primaryKeyword, secondaryKeywords, pageContent);
        
        variations.push({
            title: title,
            description: description,
            titleLength: title.length,
            descLength: description.length
        });
    }
    
    // Analyze first variation
    const analysis = {
        overallScore: 0,
        keywordScore: calculateKeywordScore(variations[0].title, variations[0].description, primaryKeyword),
        lengthScore: calculateLengthScore(variations[0].title, variations[0].description, contentType),
        engagementScore: calculateEngagementScore(variations[0].title, variations[0].description),
        readabilityScore: calculateReadabilityScore(variations[0].title, variations[0].description),
        details: generateAnalysisDetails(variations[0].title, variations[0].description, primaryKeyword, contentType)
    };
    
    // Calculate overall score
    analysis.overallScore = Math.round(
        (analysis.keywordScore + analysis.lengthScore + analysis.engagementScore + analysis.readabilityScore) / 4
    );
    
    // Generate keyword suggestions
    const keywordSuggestions = generateKeywordSuggestions(primaryKeyword, secondaryKeywords, pageContent);
    
    // Generate URL
    const url = `https://www.yourwebsite.com/${generateSlug(pageTitle)}`;
    
    return {
        contentType: contentType.charAt(0).toUpperCase() + contentType.slice(1),
        variations: variations,
        keywordSuggestions: keywordSuggestions,
        analysis: analysis,
        url: url,
        metadata: {
            title: variations[0].title,
            description: variations[0].description
        }
    };
}

export { generateMetaTagsLogic };