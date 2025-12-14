/**
 * backend/src/routes/tools/email-tester.js
 * Email Subject Line Tester Routes
 */

import express from 'express';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { emailSubjectValidation, validate } from '../../middleware/validator.js';
import { 
  testEmailSubject,
  getContent,
  deleteContent,
  toggleFavorite 
} from '../../controllers/toolController.js';

const router = express.Router();

/**
 * Test Email Subject Line
 * POST /api/tools/email-tester/test
 */
router.post(
  '/test',
  authenticateToken,
  emailSubjectValidation,
  validate,
  asyncHandler(testEmailSubject)
);

/**
 * Get User's Tested Subject Lines
 * GET /api/tools/email-tester/content
 */
router.get(
  '/content',
  authenticateToken,
  asyncHandler(async (req, res) => {
    req.query.toolId = 'email-tester';
    return getContent(req, res);
  })
);

/**
 * Delete Subject Line Test
 * DELETE /api/tools/email-tester/content/:id
 */
router.delete(
  '/content/:id',
  authenticateToken,
  asyncHandler(deleteContent)
);

/**
 * Toggle Favorite
 * POST /api/tools/email-tester/content/:id/favorite
 */
router.post(
  '/content/:id/favorite',
  authenticateToken,
  asyncHandler(toggleFavorite)
);

/**
 * Get Tool Info
 * GET /api/tools/email-tester/info
 */
router.get('/info', (req, res) => {
  res.json({
    success: true,
    tool: {
      id: 'email-tester',
      name: 'Email Subject Line Tester',
      icon: '📧',
      description: 'Test and optimize your email subject lines for higher open rates',
      features: [
        'Overall effectiveness score',
        'Character and word count',
        'Spam score analysis',
        'Personalization detection',
        'Urgency detection',
        'Emoji usage analysis',
        'Open rate prediction',
        'A/B testing suggestions'
      ],
      requiredFields: ['subject'],
      metrics: {
        optimalLength: '30-50 characters',
        optimalWords: '4-7 words',
        spamTriggers: ['Free', 'Buy Now', 'Act Now', '!!!', 'LIMITED'],
        powerWords: ['You', 'New', 'Exclusive', 'Secret', 'Proven']
      },
      tips: [
        'Keep it under 50 characters',
        'Use personalization like {name}',
        'Ask questions to increase engagement',
        'Test with and without emojis',
        'Avoid spam trigger words'
      ]
    }
  });
});

export default router;
