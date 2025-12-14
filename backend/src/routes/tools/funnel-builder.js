/**
 * backend/src/routes/tools/funnel-builder.js
 * Marketing Funnel Builder Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validator.js';
import { 
  generateFunnel,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate Marketing Funnel
 * POST /api/tools/funnel-builder/generate
 */
router.post(
  '/generate',
  authenticateToken,
  asyncHandler(generateFunnel)
);

/**
 * Get User's Marketing Funnels
 * GET /api/tools/funnel-builder/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'funnel-builder';
    return getContent(req, res);
  })
);

/**
 * Delete Marketing Funnel
 * DELETE /api/tools/funnel-builder/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/funnel-builder/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/funnel-builder/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'funnel-builder',
      name: 'Marketing Funnel Builder',
      icon: '🎯',
      description: 'Build complete marketing funnel strategies',
      features: [
        'Multi-stage funnel creation',
        'Budget allocation',
        'Timeline planning',
        'Tactic recommendations',
        'KPI suggestions',
        'ROI predictions',
        'Conversion optimization',
        'A/B testing strategies'
      ],
      requiredFields: ['goal', 'audience', 'budget', 'timeline'],
      optionalFields: ['industry', 'currentStage'],
      stages: [
        {
          name: 'Awareness',
          objective: 'Attract attention',
          tactics: ['Social media ads', 'Content marketing', 'SEO', 'PR'],
          budgetPercent: 30
        },
        {
          name: 'Interest',
          objective: 'Generate leads',
          tactics: ['Lead magnets', 'Email capture', 'Webinars', 'Free trials'],
          budgetPercent: 25
        },
        {
          name: 'Decision',
          objective: 'Nurture prospects',
          tactics: ['Email sequences', 'Case studies', 'Demos', 'Consultations'],
          budgetPercent: 25
        },
        {
          name: 'Action',
          objective: 'Convert to customers',
          tactics: ['Sales calls', 'Limited offers', 'Guarantees', 'Easy checkout'],
          budgetPercent: 20
        }
      ],
      kpis: [
        'Website traffic',
        'Lead conversion rate',
        'Email open rate',
        'Click-through rate',
        'Sales conversion rate',
        'Customer acquisition cost',
        'Return on ad spend'
      ]
    }
  });
});

export default router;
