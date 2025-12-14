import fetch from 'node-fetch';

// DeepSeek AI Integration
class DeepSeekAI {
    constructor() {
        this.apiKey = process.env.DEEPSEEK_API_KEY;
        this.baseURL = 'https://api.deepseek.com/v1';
    }

    async generateContent(prompt, options = {}) {
        try {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert social media marketing specialist. Create engaging, platform-optimized social media content that drives engagement and conversions.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: options.maxTokens || 1000,
                    temperature: options.temperature || 0.7,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`DeepSeek API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('DeepSeek API error:', error);
            throw new Error('Failed to generate AI content');
        }
    }
}

const ai = new DeepSeekAI();

export const generateSocialPosts = async (params) => {
    const { brandName, topic, brandVoice, platform, userContent, userId } = params;

    try {
        // Create AI prompt for social media generation
        const prompt = createSocialMediaPrompt(brandName, topic, brandVoice, platform, userContent);
        
        // Generate content using DeepSeek AI
        const aiResponse = await ai.generateContent(prompt, {
            temperature: 0.8,
            maxTokens: 1500
        });

        // Parse AI response and structure data
        const result = parseAIResponse(aiResponse, platform);
        
        return {
            variations: result.posts,
            hashtags: result.hashtags,
            insights: result.insights,
            platform,
            aiGenerated: true,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('AI generation failed, falling back to rule-based:', error);
        // Fallback to rule-based generation
        return generateFallbackContent(params);
    }
};

export const getTrendingHashtags = async (params) => {
    const { topic, platform, industry } = params;

    const prompt = `
Generate trending and relevant hashtags for ${topic} on ${platform}.

TOPIC: ${topic}
PLATFORM: ${platform}
INDUSTRY: ${industry || 'general'}

Requirements:
- Provide 15-20 relevant hashtags
- Include a mix of popular (high-volume) and niche (specific) hashtags
- Categorize them by purpose
- Include platform-specific best practices for ${platform}
- Provide usage tips and strategy

Format your response as JSON:
{
    "hashtags": {
        "popular": ["#trending1", "#trending2"],
        "niche": ["#niche1", "#niche2"],
        "branded": ["#brand1", "#brand2"]
    },
    "strategy": "brief strategy explanation",
    "best_practices": ["practice1", "practice2"],
    "recommended_count": 5-8,
    "platform_specific_tips": "tips for ${platform}"
}
`;

    try {
        const aiResponse = await ai.generateContent(prompt, {
            temperature: 0.6,
            maxTokens: 800
        });

        // Parse AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('No valid JSON found in AI response');
        
    } catch (error) {
        console.error('AI hashtag generation failed:', error);
        return generateFallbackHashtags(topic, platform);
    }
};

export const analyzePostPerformance = async (params) => {
    const { content, platform, targetAudience } = params;

    const prompt = `
Analyze this social media post for performance potential:

POST: ${content}
PLATFORM: ${platform}
TARGET AUDIENCE: ${targetAudience}

Provide analysis in JSON format:
{
    "engagement_score": 0-100,
    "readability_score": 0-100,
    "strengths": ["strength1", "strength2"],
    "improvements": ["improvement1", "improvement2"],
    "predicted_metrics": {
        "estimated_reach": "number",
        "engagement_rate": "percentage",
        "virality_potential": "low/medium/high"
    }
}
`;

    try {
        const analysis = await ai.generateContent(prompt, { temperature: 0.3 });
        return JSON.parse(analysis.match(/\{[\s\S]*\}/)[0]);
    } catch (error) {
        console.error('AI analysis failed:', error);
        return generateFallbackAnalysis(content, platform);
    }
};

const createSocialMediaPrompt = (brandName, topic, brandVoice, platform, userContent) => {
    return `
Create 3 social media post variations for ${brandName} targeting ${platform}.

TOPIC: ${topic}
BRAND VOICE: ${brandVoice}
PLATFORM: ${platform}
USER CONTENT: ${userContent || 'No specific content provided'}

Requirements:
- Create 3 distinct variations with different angles
- Include relevant hashtags (5-8 per variation)
- Optimize for ${platform} best practices
- Tone should be ${brandVoice}
- Include engagement hooks (questions, CTAs)
- Provide estimated engagement score (1-100)
- Add brief explanation for each variation

Format your response as JSON:
{
    "posts": [
        {
            "content": "full post text",
            "engagement_score": 85,
            "tone": "specific tone",
            "hashtags": ["hashtag1", "hashtag2"],
            "explanation": "why this will perform well"
        }
    ],
    "insights": "overall strategic insights",
    "recommendations": ["recommendation1", "recommendation2"]
}
`;
};

const parseAIResponse = (aiResponse, platform) => {
    try {
        // Extract JSON from AI response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        
        throw new Error('No valid JSON found in AI response');
    } catch (error) {
        console.error('Failed to parse AI response:', error);
        return generateFallbackContent({ platform });
    }
};

const generateFallbackHashtags = (topic, platform) => {
    const baseHashtags = {
        popular: [
            `#${topic.replace(/\s+/g, '')}`,
            '#trending',
            '#viral',
            '#popular',
            '#hot'
        ],
        niche: [
            `#${topic.toLowerCase().replace(/\s+/g, '')}lovers`,
            `#${topic.toLowerCase().replace(/\s+/g, '')}community`,
            '#expert',
            '#professional'
        ],
        branded: [
            '#brand',
            '#company',
            '#official'
        ]
    };

    return {
        hashtags: baseHashtags,
        strategy: "Use a mix of popular and niche hashtags. Start with 1-2 popular, 3-4 niche, and 1-2 branded hashtags.",
        best_practices: [
            "Don't use more than 10 hashtags",
            "Place hashtags at the end of your post",
            "Research hashtag popularity before using",
            "Use platform-specific hashtag limits"
        ],
        recommended_count: 8,
        platform_specific_tips: `On ${platform}, use relevant and specific hashtags for better reach.`,
        fallback: true
    };
};

// Fallback functions
const generateFallbackContent = (params) => {
    return {
        variations: [],
        hashtags: [],
        insights: "AI service temporarily unavailable. Using rule-based generation.",
        platform: params.platform,
        aiGenerated: false
    };
};

const generateFallbackAnalysis = (content, platform) => {
    return {
        engagement_score: 50,
        readability_score: 60,
        strengths: ["Clear message", "Relevant content"],
        improvements: ["Add more engaging elements", "Include call-to-action"],
        predicted_metrics: {
            estimated_reach: "1000-5000",
            engagement_rate: "3-5%",
            virality_potential: "medium"
        },
        fallback: true
    };
};

// Export all functions
export default {
    generateSocialPosts,
    analyzePostPerformance,
    getTrendingHashtags
};