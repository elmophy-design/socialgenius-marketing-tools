/**
 * backend/src/routes/tools/seo-meta.js
 * SEO Meta Generator Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { seoMetaValidation, validate } from '../../middleware/validator.js';
import { 
  generateSEOMeta,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Generate SEO Meta Tags
 * POST /api/tools/seo-meta/generate
 */
router.post(
  '/generate',
  authenticateToken,
  seoMetaValidation,
  validate,
  asyncHandler(generateSEOMeta)
);

/**
 * Get User's SEO Meta Tags
 * GET /api/tools/seo-meta/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'seo-meta';
    return getContent(req, res);
  })
);

/**
 * Delete SEO Meta Tags
 * DELETE /api/tools/seo-meta/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/seo-meta/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/seo-meta/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'seo-meta',
      name: 'SEO Meta Generator',
      icon: '🔍',
      description: 'Generate SEO-optimized meta tags and descriptions',
      features: [
        'Meta title generation (50-60 chars)',
        'Meta description (150-160 chars)',
        'Open Graph tags',
        'Twitter Card tags',
        'Schema.org markup',
        'Canonical URL setup',
        'Keyword optimization',
        'Character count validation'
      ],
      requiredFields: ['title', 'description'],
      optionalFields: ['keywords', 'url', 'image'],
      bestPractices: [
        'Keep titles under 60 characters',
        'Descriptions should be 150-160 characters',
        'Include target keywords naturally',
        'Make it compelling for clicks'
      ]
    }
  });
});

export default router;
