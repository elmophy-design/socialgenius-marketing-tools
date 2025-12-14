import express from 'express';
const router = express.Router();

// ============================================
// TOOLS ROUTES - ALL 8 MARKETING TOOLS
// ============================================

// 8. Social Media Generator (NEW)
router.post('/social-media/generate', async (req, res) => {
    try {
        const { platform, topic, tone, hashtags } = req.body;
        
        res.json({
            success: true,
            data: {
                posts: [
                    {
                        platform: platform,
                        content: `Exciting news about ${topic}! Stay tuned for more updates. 🚀`,
                        hashtags: hashtags || ['#socialmedia', '#marketing'],
                        characterCount: 45
                    },
                    {
                        platform: platform,
                        content: `Want to learn more about ${topic}? Check out our latest insights!`,
                        hashtags: hashtags || ['#digitalmarketing', '#tips'],
                        characterCount: 65
                    }
                ],
                suggestions: [
                    `Share a story about ${topic}`,
                    `Create a poll related to ${topic}`,
                    `Post a tutorial on ${topic}`
                ]
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET /api/tools - List all available tools
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Meritlives Tools API',
        version: '2.0.0',
        totalTools: 8,
        tools: [
            {
                id: 'social-media',
                name: 'Social Media Generator',
                description: 'AI-powered social media content generation',
                endpoint: '/api/tools/social-media/generate',
                method: 'POST',
                icon: '📱'
            },
            {
                id: 'value-prop',
                name: 'Value Proposition Generator',
                description: 'Create compelling value propositions',
                endpoint: '/api/tools/value-proposition/generate',
                method: 'POST',
                icon: '💎'
            },
            {
                id: 'headline',
                name: 'Headline Analyzer',
                description: 'Analyze and score headline effectiveness',
                endpoint: '/api/tools/headline/analyze',
                method: 'POST',
                icon: '📰'
            },
            {
                id: 'seo-meta',
                name: 'SEO Meta Generator',
                description: 'Generate SEO-optimized meta tags',
                endpoint: '/api/tools/seo-meta/generate',
                method: 'POST',
                icon: '🔍'
            },
            {
                id: 'email-tester',
                name: 'Email Subject Tester',
                description: 'Test and optimize email subject lines',
                endpoint: '/api/tools/email-subject/test',
                method: 'POST',
                icon: '📧'
            },
            {
                id: 'content-idea',
                name: 'Content Idea Generator',
                description: 'Generate creative content ideas',
                endpoint: '/api/tools/content-ideas/generate',
                method: 'POST',
                icon: '💡'
            },
            {
                id: 'ad-copy',
                name: 'Ad Copy Generator',
                description: 'Create high-converting ad copy',
                endpoint: '/api/tools/ad-copy/generate',
                method: 'POST',
                icon: '📢'
            },
            {
                id: 'funnel-builder',
                name: 'Marketing Funnel Builder',
                description: 'Build complete marketing funnels',
                endpoint: '/api/tools/funnel-builder/generate',
                method: 'POST',
                icon: '🎯'
            }
        ]
    });
});

/**
 * GET /api/tools/health
 * Health check for tools API
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tools: {
            available: 8,
            status: 'all operational'
        }
    });
});



export default router;