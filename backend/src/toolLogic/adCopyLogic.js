

// --- Configurations and Templates (Copied from original script.js) ---

const platformConfigs = {
    google: { maxTitleLength: 30, maxDescLength: 90, urlRequired: true, platformName: 'Google Ads' },
    facebook: { maxTitleLength: 40, maxDescLength: 125, urlRequired: true, platformName: 'Facebook' },
    instagram: { maxTitleLength: 150, maxDescLength: 125, urlRequired: false, platformName: 'Instagram' },
    twitter: { maxTitleLength: 280, maxDescLength: 280, urlRequired: false, platformName: 'Twitter/X' },
    linkedin: { maxTitleLength: 150, maxDescLength: 600, urlRequired: true, platformName: 'LinkedIn' },
    tiktok: { maxTitleLength: 100, maxDescLength: 150, urlRequired: false, platformName: 'TikTok' }
};

const ctaOptions = {
    'buy-now': ['Purchase Now', 'Acquire Today', 'Secure Your Order'],
    'learn-more': ['Learn More', 'Discover Details', 'Explore Features'],
    'sign-up': ['Register Now', 'Create Account', 'Join Today'],
    'get-started': ['Get Started', 'Begin Journey', 'Start Today'],
    'shop-now': ['Shop Now', 'Browse Collection', 'View Products'],
    'download': ['Download Now', 'Get Application', 'Install Software']
};

const toneTemplates = {
    professional: {
        adjectives: ['enterprise-grade', 'premium', 'advanced', 'sophisticated', 'comprehensive'],
        phrases: ['Maximize efficiency', 'Enterprise-ready solution', 'Professional-grade performance'],
        powerWords: ['Optimize', 'Streamline', 'Enhance', 'Transform', 'Accelerate']
    },
    casual: {
        adjectives: ['intuitive', 'streamlined', 'user-friendly', 'efficient', 'reliable'],
        phrases: ['Experience the difference', 'Discover new possibilities', 'Simplify your workflow'],
        powerWords: ['Discover', 'Experience', 'Simplify', 'Elevate', 'Transform']
    },
    urgent: {
        adjectives: ['limited-time', 'exclusive', 'time-sensitive', 'priority', 'immediate'],
        phrases: ['Limited availability', 'Exclusive opportunity', 'Time-sensitive offer'],
        powerWords: ['Act', 'Secure', 'Reserve', 'Access', 'Claim']
    },
    authoritative: {
        adjectives: ['industry-leading', 'expert', 'premier', 'definitive', 'comprehensive'],
        phrases: ['Industry-best performance', 'Expert-crafted solution', 'Premier quality standards'],
        powerWords: ['Lead', 'Dominate', 'Excel', 'Master', 'Achieve']
    },
    inspirational: {
        adjectives: ['transformative', 'empowering', 'visionary', 'innovative', 'progressive'],
        phrases: ['Unlock potential', 'Achieve excellence', 'Drive innovation'],
        powerWords: ['Inspire', 'Empower', 'Transform', 'Elevate', 'Achieve']
    }
};

// --- Utility Functions (Copied from original script.js) ---

function getRandomItem(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

function getPlatformName(platform) {
    const names = {
        google: 'Google Ads',
        facebook: 'Facebook',
        instagram: 'Instagram',
        twitter: 'Twitter/X',
        linkedin: 'LinkedIn',
        tiktok: 'TikTok'
    };
    return names[platform] || platform;
}

// --- Generation Functions (Copied from original script.js) ---

function generateTitle(productName, toneTemplate, config) {
    const adjectives = toneTemplate.adjectives;
    const phrases = toneTemplate.phrases;
    const powerWords = toneTemplate.powerWords;
    
    const templates = [
        `${productName}: ${getRandomItem(phrases)}`,
        `${getRandomItem(adjectives)} ${productName} Solution`,
        `${getRandomItem(powerWords)} Your Results with ${productName}`,
        `${productName} - ${getRandomItem(adjectives)} Performance`,
        `Achieve ${getRandomItem(powerWords)} with ${productName}`
    ];

    let title = getRandomItem(templates);
    
    if (title.length > config.maxTitleLength) {
        title = title.substring(0, config.maxTitleLength - 3) + '...';
    }
    
    return title;
}

function generateDescription(productDesc, productName, toneTemplate, ctaPhrases, config) {
    const adjectives = toneTemplate.adjectives;
    const phrases = toneTemplate.phrases;
    const powerWords = toneTemplate.powerWords;
    const cta = getRandomItem(ctaPhrases);
    
    // Note: The original script used productNameInput.value inside the function, 
    // we pass it explicitly here.
    
    const templates = [
        `${productDesc}. ${getRandomItem(phrases)}. ${cta} to ${getRandomItem(powerWords).toLowerCase()} your outcomes.`,
        `Discover our ${getRandomItem(adjectives)} solution designed for optimal performance. ${productDesc}. ${cta} for superior results.`,
        `${getRandomItem(phrases)} with our comprehensive ${productName} platform. ${productDesc}. ${cta} to begin your transformation.`,
        `Experience ${getRandomItem(adjectives)} quality with ${productName}. ${productDesc}. ${cta} to access premium features.`
    ];

    let description = getRandomItem(templates);
    
    if (description.length > config.maxDescLength) {
        description = description.substring(0, config.maxDescLength - 3) + '...';
    }
    
    return description;
}

function generateVariation(index, productName, toneTemplate, ctaPhrases, keywords, targetAudience) {
    const adjectives = toneTemplate.adjectives;
    const powerWords = toneTemplate.powerWords;
    const cta = getRandomItem(ctaPhrases);
    
    // Placeholder for targetAudience name (since original code used DOM selection)
    const audienceName = targetAudience.charAt(0).toUpperCase() + targetAudience.slice(1);

    const variationTemplates = [
        `${getRandomItem(powerWords)} your performance with ${productName}.\n\n` +
        `Key features include:\n` +
        `• ${keywords[0] || 'Advanced functionality'}\n` +
        `• ${keywords[1] || 'Premium quality'}\n` +
        `• ${keywords[2] || 'Reliable performance'}\n\n` +
        `${cta} to experience the difference.`,

        `Transform your workflow with our ${getRandomItem(adjectives)} ${productName} solution.\n\n` +
        `Designed specifically for ${audienceName.toLowerCase()}, ` +
        `this platform delivers measurable results and exceptional value.\n\n` +
        `${cta} to unlock your potential.`,

        `Addressing critical challenges for modern professionals.\n\n` +
        `${productName} provides the ${getRandomItem(adjectives)} solution you need to ` +
        `${getRandomItem(powerWords).toLowerCase()} outcomes and drive success.\n\n` +
        `${cta} to implement this strategic advantage.`
    ];

    return variationTemplates[index] || variationTemplates[0];
}

function generateHashtags(productName, keywords) {
    const baseHashtags = [
        productName.replace(/\s+/g, ''),
        'Business',
        'Solution',
        'Professional'
    ];
    
    const keywordHashtags = keywords.slice(0, 3).map(k => k.replace(/\s+/g, ''));
    
    // We can't use platformSelect.value here, so we use a generic set.
    const industryTags = ['Innovation', 'Technology', 'Growth', 'Success'];
    
    return [...new Set([...baseHashtags, ...keywordHashtags, ...industryTags])]
        .map(tag => '#' + tag.replace(/[^a-zA-Z0-9]/g, ''))
        .slice(0, 8);
}

function generateUrl(productName) {
    const baseUrl = 'www.' + productName.toLowerCase().replace(/\s+/g, '') + '.com';
    return baseUrl.replace(/[^a-zA-Z0-9.-]/g, '');
}

// --- Main Entry Function ---

/**
 * Main function to generate Ad Copy based on user input.
 * @param {object} data - Data object from the React frontend request.
 * @returns {object} - Generated ad copy results.
 */
function generateAdCopyLogic(data) {
    const { 
        productName, 
        productDescription, 
        platform, 
        tone, 
        targetAudience, 
        cta, 
        keywords 
    } = data;
    
    const config = platformConfigs[platform];
    const toneTemplate = toneTemplates[tone] || toneTemplates.professional;
    const ctaPhrases = ctaOptions[cta];

    const variations = [];
    for (let i = 0; i < 3; i++) {
        variations.push(generateVariation(i, productName, toneTemplate, ctaPhrases, keywords, targetAudience));
    }

    const generatedHashtags = generateHashtags(productName, keywords);

    return {
        platform: platform,
        platformName: getPlatformName(platform),
        title: generateTitle(productName, toneTemplate, config),
        description: generateDescription(productDescription, productName, toneTemplate, ctaPhrases, config),
        variations: variations,
        hashtags: generatedHashtags,
        url: generateUrl(productName)
    };
}

// Correct ES Module Export
export { generateAdCopyLogic };