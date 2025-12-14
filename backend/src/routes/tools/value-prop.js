/**
 * backend/src/routes/tools/value-prop.js
 * Value Proposition Generator Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { validate } from '../../middleware/validator.js';
import { 
  generateValueProposition,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate Value Proposition
 * POST /api/tools/value-prop/generate
 */
router.post(
  '/generate',
  authenticateToken,
  asyncHandler(generateValueProposition)
);

/**
 * Get User's Value Propositions
 * GET /api/tools/value-prop/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'value-proposition';
    return getContent(req, res);
  })
);

/**
 * Delete Value Proposition
 * DELETE /api/tools/value-prop/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/value-prop/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/value-prop/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'value-proposition',
      name: 'Value Proposition Generator',
      icon: '💎',
      description: 'Create compelling value propositions for your products and services',
      features: [
        'Customer-focused messaging',
        'Benefit-driven propositions',
        'Competitive differentiation',
        'Multiple variations',
        'Industry-specific templates'
      ],
      requiredFields: ['productName', 'targetAudience', 'problemSolved'],
      optionalFields: ['uniqueFeatures', 'competitors']
    }
  });
});

export default router;
