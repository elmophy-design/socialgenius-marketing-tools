/**
 * backend/src/routes/tools/ad-copy.js
 * Ad Copy Generator Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { adCopyValidation, validate } from '../../middleware/validator.js';
import { 
  generateAdCopy,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate Ad Copy
 * POST /api/tools/ad-copy/generate
 */
router.post(
  '/generate',
  authenticateToken,
  adCopyValidation,
  validate,
  asyncHandler(generateAdCopy)
);

/**
 * Get User's Ad Copies
 * GET /api/tools/ad-copy/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'ad-copy';
    return getContent(req, res);
  })
);

/**
 * Delete Ad Copy
 * DELETE /api/tools/ad-copy/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/ad-copy/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/ad-copy/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'ad-copy',
      name: 'Ad Copy Generator',
      icon: '📢',
      description: 'Create high-converting ad copy for any platform',
      features: [
        'Platform-specific formatting',
        'Multiple copy variations',
        'Headline optimization',
        'CTA suggestions',
        'Tone customization',
        'A/B testing variants',
        'Hashtag generation',
        'Character limit compliance'
      ],
      requiredFields: ['product', 'productDescription'],
      optionalFields: ['audience', 'platform', 'tone', 'length'],
      platforms: [
        'Google Ads',
        'Facebook Ads',
        'Instagram Ads',
        'LinkedIn Ads',
        'Twitter Ads',
        'TikTok Ads'
      ],
      tones: [
        'Professional',
        'Casual',
        'Urgent',
        'Humorous',
        'Inspirational'
      ],
      lengths: {
        short: '50-100 chars',
        medium: '100-200 chars',
        long: '200-300 chars'
      }
    }
  });
});

export default router;
