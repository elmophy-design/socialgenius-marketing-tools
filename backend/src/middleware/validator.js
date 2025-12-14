import { body, validationResult } from 'express-validator';

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

/**
 * Middleware to check validation results
 */
export const validate = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    
    next();
};
// Add this to your validator.js file

export const updateProfileValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    
    body('company')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Company name must be less than 100 characters'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be less than 500 characters'),
    
    body('timezone')
        .optional()
        .trim(),
    
    body('language')
        .optional()
        .trim()
        .isIn(['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja'])
        .withMessage('Invalid language')
];
// ============================================
// AD COPY VALIDATION
// ============================================

export const adCopyValidation = [
    body('productName')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    
    body('productDescription')
        .trim()
        .notEmpty()
        .withMessage('Product description is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Product description must be between 10 and 500 characters'),
    
    body('platform')
        .trim()
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(['google', 'facebook', 'instagram', 'twitter', 'linkedin', 'tiktok'])
        .withMessage('Invalid platform'),
    
    body('targetAudience')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Target audience must be less than 200 characters'),
    
    body('tone')
        .optional()
        .trim()
        .isIn(['professional', 'casual', 'urgent', 'humorous', 'inspirational'])
        .withMessage('Invalid tone')
];

// ============================================
// CONTENT IDEA VALIDATION
// ============================================

export const contentIdeaValidation = [
    body('niche')
        .trim()
        .notEmpty()
        .withMessage('Niche is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Niche must be between 2 and 100 characters'),
    
    body('targetAudience')
        .trim()
        .notEmpty()
        .withMessage('Target audience is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Target audience must be between 2 and 200 characters'),
    
    body('contentType')
        .trim()
        .notEmpty()
        .withMessage('Content type is required')
        .isIn(['blog', 'social', 'video', 'podcast', 'email', 'ebook'])
        .withMessage('Invalid content type'),
    
    body('ideaCount')
        .optional()
        .isInt({ min: 1, max: 50 })
        .withMessage('Idea count must be between 1 and 50')
];

// ============================================
// EMAIL SUBJECT VALIDATION
// ============================================

export const emailSubjectValidation = [
    body('subject')
        .trim()
        .notEmpty()
        .withMessage('Subject line is required')
        .isLength({ min: 5, max: 150 })
        .withMessage('Subject line must be between 5 and 150 characters')
];

// ============================================
// FUNNEL BUILDER VALIDATION
// ============================================

export const funnelBuilderValidation = [
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Business name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    
    body('businessType')
        .trim()
        .notEmpty()
        .withMessage('Business type is required')
        .isIn(['ecommerce', 'saas', 'service', 'infoproduct', 'agency'])
        .withMessage('Invalid business type'),
    
    body('targetAudience')
        .trim()
        .notEmpty()
        .withMessage('Target audience is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Target audience must be between 2 and 200 characters'),
    
    body('funnelGoal')
        .trim()
        .notEmpty()
        .withMessage('Funnel goal is required')
        .isIn(['leads', 'sales', 'enrollment', 'signups', 'calls'])
        .withMessage('Invalid funnel goal')
];

// ============================================
// HEADLINE ANALYZER VALIDATION
// ============================================

export const headlineValidation = [
    body('headline')
        .trim()
        .notEmpty()
        .withMessage('Headline is required')
        .isLength({ min: 5, max: 200 })
        .withMessage('Headline must be between 5 and 200 characters')
];

// ============================================
// SEO META VALIDATION
// ============================================

export const seoMetaValidation = [
    body('pageTitle')
        .trim()
        .notEmpty()
        .withMessage('Page title is required')
        .isLength({ min: 10, max: 70 })
        .withMessage('Page title must be between 10 and 70 characters'),
    
    body('pageDescription')
        .trim()
        .notEmpty()
        .withMessage('Page description is required')
        .isLength({ min: 50, max: 160 })
        .withMessage('Page description must be between 50 and 160 characters'),
    
    body('keywords')
        .optional()
        .isArray()
        .withMessage('Keywords must be an array')
        .custom((value) => value.length <= 10)
        .withMessage('Maximum 10 keywords allowed')
];

// ============================================
// SOCIAL MEDIA VALIDATION
// ============================================

export const socialMediaValidation = [
    body('topic')
        .trim()
        .notEmpty()
        .withMessage('Topic is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Topic must be between 2 and 200 characters'),
    
    body('platform')
        .trim()
        .notEmpty()
        .withMessage('Platform is required')
        .isIn(['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'])
        .withMessage('Invalid platform'),
    
    body('tone')
        .optional()
        .trim()
        .isIn(['professional', 'casual', 'friendly', 'humorous', 'inspirational'])
        .withMessage('Invalid tone')
];

// ============================================
// VALUE PROPOSITION VALIDATION
// ============================================

export const valuePropValidation = [
    body('businessName')
        .trim()
        .notEmpty()
        .withMessage('Business name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Business name must be between 2 and 100 characters'),
    
    body('targetAudience')
        .trim()
        .notEmpty()
        .withMessage('Target audience is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Target audience must be between 2 and 200 characters'),
    
    body('problem')
        .trim()
        .notEmpty()
        .withMessage('Problem is required')
        .isLength({ min: 10, max: 300 })
        .withMessage('Problem must be between 10 and 300 characters'),
    
    body('solution')
        .trim()
        .notEmpty()
        .withMessage('Solution is required')
        .isLength({ min: 10, max: 300 })
        .withMessage('Solution must be between 10 and 300 characters'),
    
    body('uniqueValue')
        .trim()
        .notEmpty()
        .withMessage('Unique value is required')
        .isLength({ min: 10, max: 300 })
        .withMessage('Unique value must be between 10 and 300 characters')
];

// ============================================
// EXPORT ALL VALIDATORS
// ============================================

export default {
    validate,
    adCopyValidation,
    contentIdeaValidation,
    emailSubjectValidation,
    funnelBuilderValidation,
    headlineValidation,
    seoMetaValidation,
    socialMediaValidation,
    valuePropValidation
};