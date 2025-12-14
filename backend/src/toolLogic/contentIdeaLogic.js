// socialgenius-backend/toolLogic/contentIdeaLogic.js

// --- Configurations and Templates (Copied from original script.js) ---

const contentTypeConfigs = {
    blog: { name: 'Blog Posts', formats: ['how-to', 'list', 'tips', 'case-study', 'review', 'trends'], maxLength: 120 },
    'social-media': { name: 'Social Media Posts', formats: ['tips', 'list', 'how-to', 'engagement'], maxLength: 280 },
    video: { name: 'Video Content', formats: ['tutorial', 'review', 'entertainment', 'educational'], maxLength: 100 },
    podcast: { name: 'Podcast Episodes', formats: ['interview', 'discussion', 'solo', 'qa'], maxLength: 80 },
    email: { name: 'Email Newsletter', formats: ['update', 'tips', 'news', 'promotion'], maxLength: 100 },
    ebook: { name: 'E-book/Guide', formats: ['comprehensive', 'beginner', 'advanced', 'specialized'], maxLength: 60 }
};

const formatTemplates = {
    'how-to': { templates: ["How to [Achieve Goal] in [Timeframe]", "Step-by-Step Guide to [Action]", "The Complete Beginner's Guide to [Topic]", "How We [Achieved Result] in [Timeframe]"], descriptions: ["A comprehensive guide that walks readers through the process of achieving specific goals.", "Detailed instructions and best practices for completing a particular task or project."] },
    'list': { templates: ["[Number] [Topic] Tips That Actually Work", "[Number] Common Mistakes to Avoid When [Action]", "[Number] Best [Tools/Resources] for [Audience]", "[Number] Signs You're [Situation]"], descriptions: ["Actionable tips and insights presented in an easy-to-digest list format.", "Common pitfalls and how to avoid them in your specific niche or industry."] },
    'tips': { templates: ["[Number] Proven Strategies for [Goal]", "Expert Tips for Better [Result]", "[Number] Little-Known [Topic] Secrets", "Quick Wins for [Improvement]"], descriptions: ["Practical advice and strategies that deliver immediate results.", "Expert insights and proven methods for achieving specific outcomes."] },
    'case-study': { templates: ["Case Study: How [Company] Achieved [Result]", "Real Results: [Metric] Improvement in [Timeframe]", "Success Story: [Client]'s Journey to [Achievement]", "Behind the Scenes: How We [Accomplishment]"], descriptions: ["Detailed analysis of real-world success stories and their key takeaways.", "In-depth look at strategies that delivered measurable results for businesses."] }
};

const toneTemplates = {
    professional: { adjectives: ['comprehensive', 'strategic', 'professional', 'effective', 'proven'], phrases: ['industry best practices', 'data-driven approach', 'expert insights'] },
    casual: { adjectives: ['awesome', 'simple', 'easy', 'fun', 'practical'], phrases: ['you\'ll love this', 'game-changing tips', 'super helpful'] },
    authoritative: { adjectives: ['definitive', 'comprehensive', 'expert', 'master', 'ultimate'], phrases: ['must-know strategies', 'industry secrets', 'professional guidance'] },
    humorous: { adjectives: ['hilarious', 'entertaining', 'funny', 'witty', 'amusing'], phrases: ['you won\'t believe this', 'laugh while you learn', 'entertaining insights'] },
    inspirational: { adjectives: ['transformative', 'life-changing', 'empowering', 'motivational', 'inspiring'], phrases: ['unlock your potential', 'transform your approach', 'achieve amazing results'] }
};

const goalTemplates = {
    education: { focus: ['teach', 'educate', 'explain', 'demonstrate', 'guide'], outcomes: ['understanding', 'knowledge', 'skills', 'expertise'] },
    entertainment: { focus: ['entertain', 'engage', 'amuse', 'delight', 'captivate'], outcomes: ['enjoyment', 'engagement', 'entertainment', 'fun'] },
    conversion: { focus: ['convert', 'persuade', 'convince', 'motivate', 'inspire'], outcomes: ['action', 'conversion', 'purchase', 'sign-up'] },
    awareness: { focus: ['introduce', 'showcase', 'highlight', 'feature', 'present'], outcomes: ['awareness', 'recognition', 'visibility', 'exposure'] },
    engagement: { focus: ['engage', 'interact', 'connect', 'involve', 'participate'], outcomes: ['engagement', 'interaction', 'discussion', 'community'] }
};


// --- Utility Functions (Copied from original script.js) ---

function getRandomItem(array) {
    if (!array || array.length === 0) return '';
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomNumber() {
    const numbers = [5, 7, 10, 15, 21, 25, 30];
    return numbers[Math.floor(Math.random() * numbers.length)];
}

function getRandomTimeframe() {
    const timeframes = ['30 Days', '1 Week', '24 Hours', '5 Simple Steps', '2024', 'This Year'];
    return getRandomItem(timeframes);
}

// --- Generation Functions (Copied from original script.js) ---

function generateTitle(formatTemplate, toneTemplate, goalTemplate, niche, targetAudience, keywords) {
    const templates = formatTemplate.templates;
    const adjectives = toneTemplate.adjectives;
    const focusWords = goalTemplate.focus;
    
    let template = getRandomItem(templates);
    
    template = template.replace('[Number]', getRandomNumber());
    template = template.replace('[Topic]', niche);
    template = template.replace('[Action]', getRandomItem(focusWords));
    template = template.replace('[Goal]', getRandomItem(goalTemplate.outcomes));
    template = template.replace('[Audience]', targetAudience);
    template = template.replace('[Timeframe]', getRandomTimeframe());
    
    if (Math.random() > 0.5) {
        template = getRandomItem(adjectives) + ' ' + template.replace('[', '');
    }
    
    if (keywords.length > 0 && Math.random() > 0.7) {
        template += ` (${getRandomItem(keywords)})`;
    }
    
    return template;
}

function generateDescription(formatTemplate, toneTemplate, goalTemplate, niche, targetAudience) {
    const descriptions = formatTemplate.descriptions;
    const phrases = toneTemplate.phrases;
    const focusWords = goalTemplate.focus;
    
    let description = getRandomItem(descriptions);
    
    description = description.replace('[Topic]', niche.toLowerCase());
    description = description.replace('[audience]', targetAudience.toLowerCase());
    
    if (Math.random() > 0.5) {
        description += ` ${getRandomItem(phrases)}.`;
    }
    
    description += ` Perfect for ${getRandomItem(focusWords)}ing ${getRandomItem(goalTemplate.outcomes)}.`;
    
    return description;
}

function generateTags(niche, keywords, contentFormatValue, toneValue) {
    const contentFormatOption = contentFormatValue; // We don't have DOM access, so use the value directly
    const toneTag = toneValue;

    const baseTags = [niche, contentFormatOption];
    const additionalTags = keywords.slice(0, 3);
    
    return [...new Set([...baseTags, ...additionalTags, toneTag])]
        .map(tag => tag.replace(/[^a-zA-Z0-9\s]/g, '').trim())
        .filter(tag => tag.length > 0)
        .slice(0, 5);
}

function generateContentCalendar(ideas) {
    const today = new Date();
    const calendar = [];
    
    ideas.slice(0, 5).forEach((idea, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + (index * 2)); // Schedule every 2 days
        
        calendar.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            idea: idea.title,
            type: idea.type
        });
    });
    
    return calendar;
}

// --- Main Entry Function ---

/**
 * Main function to generate content ideas.
 * @param {object} data - Data object from the React frontend request.
 * @returns {object} - Generated ideas and calendar.
 */
function generateContentIdeaLogic(data) {
    const { 
        niche, 
        targetAudience, 
        contentType, 
        contentFormat, 
        tone, 
        ideaCount, 
        keywords, 
        goal 
    } = data;
    
    const config = contentTypeConfigs[contentType] || contentTypeConfigs.blog;
    const formatTemplate = formatTemplates[contentFormat] || formatTemplates['how-to'];
    const toneTemplate = toneTemplates[tone] || toneTemplates.professional;
    const goalTemplate = goalTemplates[goal] || goalTemplates.education;

    const ideas = [];
    for (let i = 0; i < ideaCount; i++) {
        const title = generateTitle(formatTemplate, toneTemplate, goalTemplate, niche, targetAudience, keywords);
        const description = generateDescription(formatTemplate, toneTemplate, goalTemplate, niche, targetAudience);
        const tags = generateTags(niche, keywords, contentFormat, tone);

        ideas.push({
            id: i + 1,
            title: title,
            description: description,
            type: config.name,
            format: contentFormat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Title Case conversion
            tags: tags
        });
    }

    const calendar = generateContentCalendar(ideas);

    return {
        contentType: contentType,
        contentTypeName: config.name,
        ideaCount: ideas.length,
        ideas: ideas,
        calendar: calendar
    };
}

// Correct ES Module Export
export { generateContentIdeaLogic };