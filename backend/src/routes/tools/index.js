/**
 * backend/src/routes/tools/index.js
 * Main Tools Router - Combines All Tool Routes
 */

import express from 'express';

// Import individual tool routes
import socialMediaRoutes from './social-media.js';
import valuePropRoutes from './value-prop.js';
import headlineRoutes from './headline.js';
import seoMetaRoutes from './seo-meta.js';
import emailTesterRoutes from './email-tester.js';
import contentIdeaRoutes from './content-idea.js';
import adCopyRoutes from './ad-copy.js';
import funnelBuilderRoutes from './funnel-builder.js';

const router = express.Router();

// Mount individual tool routes
router.use('/social-media', socialMediaRoutes);
router.use('/value-prop', valuePropRoutes);
router.use('/headline', headlineRoutes);
router.use('/seo-meta', seoMetaRoutes);
router.use('/email-tester', emailTesterRoutes);
router.use('/content-idea', contentIdeaRoutes);
router.use('/ad-copy', adCopyRoutes);
router.use('/funnel-builder', funnelBuilderRoutes);

/**
 * Get All Tools List
 * GET /api/tools/list
 */
router.get('/list', (req, res) => {
  res.json({
    success: true,
    tools: [
      {
        id: 'social-media',
        name: 'Social Media Generator',
        icon: '📱',
        description: 'Generate engaging social media posts for multiple platforms',
        endpoint: '/api/tools/social-media',
        category: 'content',
        requiresAuth: true
      },
      {
        id: 'value-proposition',
        name: 'Value Proposition Generator',
        icon: '💎',
        description: 'Create compelling value propositions for your products',
        endpoint: '/api/tools/value-prop',
        category: 'content',
        requiresAuth: true
      },
      {
        id: 'headline-analyzer',
        name: 'Headline Analyzer',
        icon: '📰',
        description: 'Analyze and score your headlines for maximum impact',
        endpoint: '/api/tools/headline',
        category: 'analysis',
        requiresAuth: true
      },
      {
        id: 'seo-meta',
        name: 'SEO Meta Generator',
        icon: '🔍',
        description: 'Generate SEO-optimized meta tags and descriptions',
        endpoint: '/api/tools/seo-meta',
        category: 'seo',
        requiresAuth: true
      },
      {
        id: 'email-tester',
        name: 'Email Subject Line Tester',
        icon: '📧',
        description: 'Test and optimize your email subject lines',
        endpoint: '/api/tools/email-tester',
        category: 'analysis',
        requiresAuth: true
      },
      {
        id: 'content-idea',
        name: 'Content Idea Generator',
        icon: '💡',
        description: 'Generate creative content ideas for your niche',
        endpoint: '/api/tools/content-idea',
        category: 'content',
        requiresAuth: true
      },
      {
        id: 'ad-copy',
        name: 'Ad Copy Generator',
        icon: '📢',
        description: 'Create high-converting ad copy for any platform',
        endpoint: '/api/tools/ad-copy',
        category: 'content',
        requiresAuth: true
      },
      {
        id: 'funnel-builder',
        name: 'Marketing Funnel Builder',
        icon: '🎯',
        description: 'Build complete marketing funnel strategies',
        endpoint: '/api/tools/funnel-builder',
        category: 'strategy',
        requiresAuth: true
      }
    ],
    categories: ['content', 'analysis', 'seo', 'strategy'],
    totalTools: 8
  });
});

/**
 * Tools Service Health Check
 * GET /api/tools/health
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'tools',
    timestamp: new Date(),
    availableTools: 8,
    routes: {
      'social-media': 'operational',
      'value-prop': 'operational',
      'headline': 'operational',
      'seo-meta': 'operational',
      'email-tester': 'operational',
      'content-idea': 'operational',
      'ad-copy': 'operational',
      'funnel-builder': 'operational'
    }
  });
});

export default router;
