/**
 * backend/src/routes/tools/social-media.js
 * Social Media Generator Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { socialMediaValidation, validate } from '../../middleware/validator.js';
import { 
  generateSocialMedia,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate Social Media Content
 * POST /api/tools/social-media/generate
 */
router.post(
  '/generate',
  authenticateToken,
  socialMediaValidation,
  validate,
  asyncHandler(generateSocialMedia)
);

/**
 * Get User's Social Media Content
 * GET /api/tools/social-media/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'social-media';
    return getContent(req, res);
  })
);

/**
 * Delete Social Media Content
 * DELETE /api/tools/social-media/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/social-media/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/social-media/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'social-media',
      name: 'Social Media Generator',
      icon: '📱',
      description: 'Generate engaging social media posts for multiple platforms',
      platforms: ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'TikTok'],
      features: [
        'Multi-platform support',
        'Customizable tone and style',
        'Hashtag suggestions',
        'Emoji integration',
        'Content templates',
        'Character count optimization'
      ],
      requiredFields: ['platform', 'topic'],
      optionalFields: ['tone', 'template', 'hashtags', 'emojis']
    }
  });
});

export default router;
