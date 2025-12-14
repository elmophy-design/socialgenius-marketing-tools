/**
 * backend/src/routes/tools/content-idea.js
 * Content Idea Generator Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { contentIdeaValidation, validate } from '../../middleware/validator.js';
import { 
  generateContentIdeas,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate Content Ideas
 * POST /api/tools/content-idea/generate
 */
router.post(
  '/generate',
  authenticateToken,
  contentIdeaValidation,
  validate,
  asyncHandler(generateContentIdeas)
);

/**
 * Get User's Content Ideas
 * GET /api/tools/content-idea/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'content-idea';
    return getContent(req, res);
  })
);

/**
 * Delete Content Ideas
 * DELETE /api/tools/content-idea/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/content-idea/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/content-idea/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'content-idea',
      name: 'Content Idea Generator',
      icon: '💡',
      description: 'Generate creative content ideas for your niche and audience',
      features: [
        'Topic suggestions',
        'Multiple content formats',
        'Trending topics integration',
        'Audience-specific ideas',
        'SEO keyword suggestions',
        'Content calendar integration',
        'Engagement predictions'
      ],
      requiredFields: ['topic', 'targetAudience'],
      optionalFields: ['niche', 'count', 'contentType'],
      contentTypes: [
        'Blog posts',
        'Video scripts',
        'Infographics',
        'Podcasts',
        'Social media series',
        'Email newsletters',
        'Case studies',
        'Ebooks'
      ],
      outputCount: {
        min: 1,
        max: 20,
        default: 5
      }
    }
  });
});

export default router;
