/**
 * backend/src/routes/tools/headline.js
 * Headline Analyzer Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { headlineValidation, validate } from '../../middleware/validator.js';
import { 
  analyzeHeadline,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Analyze Headline
 * POST /api/tools/headline/analyze
 */
router.post(
  '/analyze',
  authenticateToken,
  headlineValidation,
  validate,
  asyncHandler(analyzeHeadline)
);

/**
 * Get User's Analyzed Headlines
 * GET /api/tools/headline/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'headline-analyzer';
    return getContent(req, res);
  })
);

/**
 * Delete Headline Analysis
 * DELETE /api/tools/headline/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/headline/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/headline/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'headline-analyzer',
      name: 'Headline Analyzer',
      icon: '📰',
      description: 'Analyze and score your headlines for maximum impact',
      features: [
        'Overall effectiveness score (0-100)',
        'Word count analysis',
        'Emotional impact assessment',
        'Power words detection',
        'Sentiment analysis',
        'Improvement suggestions',
        'SEO optimization tips'
      ],
      requiredFields: ['headline'],
      scoring: {
        excellent: '80-100',
        good: '60-79',
        average: '40-59',
        needsWork: '0-39'
      }
    }
  });
});

export default router;
