/**
 * backend/src/routes/users.js
 * User Management Routes - Complete & Secure
 * 
 * Handles all user-related operations:
 * - Profile management
 * - Settings & preferences
 * - Connected social accounts
 * - Subscription info
 * - Account management
 */

import express from 'express';

// Import controllers
import {
  getProfile,
  updateProfile,
  updateEmail,
  uploadProfilePicture,
  getUserStats,
  updateSettings,
  getConnectedAccounts,
  connectSocialAccount,
  disconnectSocialAccount,
  getSubscription,
  deleteAccount,
  deactivateAccount,
  reactivateAccount,
  exportUserData,
  searchUsers
} from '../controllers/userController.js';

// Import middleware
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { updateProfileValidation, validate } from '../middleware/validator.js';

const router = express.Router();

// ============================================
// PROFILE ROUTES
// ============================================

/**
 * Get User Profile
 * GET /api/users/profile
 * 
 * Returns current user's profile information
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/profile',
  authenticateToken,
  asyncHandler(getProfile)
);

/**
 * Update Profile
 * PUT /api/users/profile
 * 
 * Updates user profile information
 * Body: { name?, company?, bio?, timezone?, language? }
 * Headers: Authorization: Bearer <token>
 */
router.put(
  '/profile',
  authenticateToken,
  updateProfileValidation,
  validate,
  asyncHandler(updateProfile)
);

/**
 * Update Email
 * PUT /api/users/email
 * 
 * Changes user's email address
 * Body: { email, password }
 * Headers: Authorization: Bearer <token>
 */
router.put(
  '/email',
  authenticateToken,
  asyncHandler(updateEmail)
);

/**
 * Upload Profile Picture
 * POST /api/users/profile-picture
 * 
 * Uploads or updates profile picture
 * Body: { imageUrl }
 * Headers: Authorization: Bearer <token>
 */
router.post(
  '/profile-picture',
  authenticateToken,
  asyncHandler(uploadProfilePicture)
);

/**
 * Delete Profile Picture
 * DELETE /api/users/profile-picture
 */
router.delete(
  '/profile-picture',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    user.profilePicture = null;
    await user.save();

    return sendSuccess(res, { user: user.toJSON() }, 'Profile picture removed!');
  })
);

// ============================================
// STATISTICS & ANALYTICS
// ============================================

/**
 * Get User Statistics
 * GET /api/users/stats
 * 
 * Returns user activity and usage statistics
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/stats',
  authenticateToken,
  asyncHandler(getUserStats)
);

/**
 * Get Dashboard Summary
 * GET /api/users/dashboard
 */
router.get(
  '/dashboard',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId).populate('subscriptionId');
    const subscription = user.subscriptionId;

    const recentContent = await ToolContent.find({
      userId: req.user.userId,
      deletedAt: null
    })
    .sort({ createdAt: -1 })
    .limit(5);

    const dashboard = {
      user: {
        name: user.name,
        email: user.email,
        memberSince: user.createdAt,
        lastActive: user.lastActiveAt
      },
      subscription: {
        plan: subscription?.plan || 'trial',
        status: subscription?.status || 'active',
        daysRemaining: subscription?.daysRemaining || 0
      },
      usage: {
        generationsToday: subscription?.usage.generationsUsed || 0,
        generationsLimit: subscription?.features.dailyGenerations || 0,
        percentageUsed: subscription ? 
          (subscription.usage.generationsUsed / subscription.features.dailyGenerations * 100) : 0
      },
      stats: user.stats,
      recentContent: recentContent
    };

    return sendSuccess(res, { dashboard });
  })
);

// ============================================
// SUBSCRIPTION
// ============================================

/**
 * Get Subscription Info
 * GET /api/users/subscription
 * 
 * Returns current subscription details
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/subscription',
  authenticateToken,
  asyncHandler(getSubscription)
);

/**
 * Upgrade Subscription
 * POST /api/users/subscription/upgrade
 */
router.post(
  '/subscription/upgrade',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { plan } = req.body;

    if (!['basic', 'premium', 'pro'].includes(plan)) {
      throw new AppError('Invalid plan', 400, 'INVALID_PLAN');
    }

    const subscription = await Subscription.getActiveSubscription(req.user.userId);

    if (!subscription) {
      throw new AppError('No active subscription', 404, 'NO_SUBSCRIPTION');
    }

    // Define plan features
    const planFeatures = {
      basic: {
        socialAccountsLimit: 3,
        platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
        postsPerDay: 10,
        dailyGenerations: 10,
        aiContent: false,
        analytics: false
      },
      premium: {
        socialAccountsLimit: -1,
        platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
        postsPerDay: -1,
        dailyGenerations: -1,
        aiContent: true,
        analytics: true,
        customBranding: true
      },
      pro: {
        socialAccountsLimit: -1,
        platforms: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
        postsPerDay: -1,
        dailyGenerations: -1,
        aiContent: true,
        analytics: true,
        customBranding: true,
        apiAccess: true,
        teamSeats: 5,
        whiteLabel: true
      }
    };

    await subscription.upgradePlan(plan, planFeatures[plan]);

    // Update user subscription cache
    const user = await User.findById(req.user.userId);
    user.subscription.plan = plan;
    await user.save();

    return sendSuccess(
      res,
      { subscription: subscription.toJSON() },
      `Successfully upgraded to ${plan} plan!`
    );
  })
);

/**
 * Cancel Subscription
 * POST /api/users/subscription/cancel
 */
router.post(
  '/subscription/cancel',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { reason, immediate } = req.body;

    const subscription = await Subscription.getActiveSubscription(req.user.userId);

    if (!subscription) {
      throw new AppError('No active subscription', 404, 'NO_SUBSCRIPTION');
    }

    await subscription.cancelSubscription(reason, immediate);

    return sendSuccess(
      res,
      { subscription: subscription.toJSON() },
      immediate ? 
        'Subscription cancelled immediately' : 
        'Subscription will cancel at the end of the billing period'
    );
  })
);

// ============================================
// SETTINGS & PREFERENCES
// ============================================

/**
 * Get Settings
 * GET /api/users/settings
 */
router.get(
  '/settings',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, { settings: user.settings });
  })
);

/**
 * Update Settings
 * PUT /api/users/settings
 * 
 * Updates user settings and preferences
 * Body: { notifications?, privacy?, preferences? }
 * Headers: Authorization: Bearer <token>
 */
router.put(
  '/settings',
  authenticateToken,
  asyncHandler(updateSettings)
);

// ============================================
// CONNECTED SOCIAL ACCOUNTS
// ============================================

/**
 * Get Connected Accounts
 * GET /api/users/connected-accounts
 * 
 * Returns list of connected social media accounts
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/connected-accounts',
  authenticateToken,
  asyncHandler(getConnectedAccounts)
);

/**
 * Connect Social Account
 * POST /api/users/connected-accounts
 * 
 * Connects a new social media account
 * Body: { platform, accountId, accountName, accessToken, refreshToken }
 * Headers: Authorization: Bearer <token>
 */
router.post(
  '/connected-accounts',
  authenticateToken,
  asyncHandler(connectSocialAccount)
);

/**
 * Disconnect Social Account
 * DELETE /api/users/connected-accounts/:platform/:accountId
 * 
 * Disconnects a social media account
 * Headers: Authorization: Bearer <token>
 */
router.delete(
  '/connected-accounts/:platform/:accountId',
  authenticateToken,
  asyncHandler(disconnectSocialAccount)
);

/**
 * Update Account Status
 * PUT /api/users/connected-accounts/:platform/:accountId
 */
router.put(
  '/connected-accounts/:platform/:accountId',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const { platform, accountId } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const account = user.connectedAccounts.find(
      acc => acc.platform === platform && acc.accountId === accountId
    );

    if (!account) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }

    account.isActive = isActive;
    await user.save();

    return sendSuccess(
      res,
      { account },
      `Account ${isActive ? 'activated' : 'deactivated'} successfully!`
    );
  })
);

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

/**
 * Deactivate Account
 * POST /api/users/deactivate
 * 
 * Temporarily deactivates account
 * Body: { password }
 * Headers: Authorization: Bearer <token>
 */
router.post(
  '/deactivate',
  authenticateToken,
  asyncHandler(deactivateAccount)
);

/**
 * Reactivate Account
 * POST /api/users/reactivate
 * 
 * Reactivates a deactivated account
 * Body: { email, password }
 */
router.post(
  '/reactivate',
  asyncHandler(reactivateAccount)
);

/**
 * Delete Account
 * DELETE /api/users/account
 * 
 * Permanently deletes account (soft delete)
 * Body: { password, reason? }
 * Headers: Authorization: Bearer <token>
 */
router.delete(
  '/account',
  authenticateToken,
  asyncHandler(deleteAccount)
);

/**
 * Export User Data (GDPR)
 * GET /api/users/export-data
 * 
 * Exports all user data
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/export-data',
  authenticateToken,
  asyncHandler(exportUserData)
);

// ============================================
// ADMIN ROUTES
// ============================================

/**
 * Search Users (Admin Only)
 * GET /api/users/search
 * 
 * Searches for users by name, email, or company
 * Query: ?q=search&page=1&limit=10
 * Headers: Authorization: Bearer <token>
 */
router.get(
  '/search',
  authenticateToken,
  requireAdmin,
  asyncHandler(searchUsers)
);

/**
 * Get All Users (Admin Only)
 * GET /api/users/all
 */
router.get(
  '/all',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = { deletedAt: null };
    if (status) query.isActive = status === 'active';

    const users = await User.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    return sendSuccess(res, {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      totalUsers: count
    });
  })
);

/**
 * Get User by ID (Admin Only)
 * GET /api/users/:userId
 */
router.get(
  '/:userId',
  authenticateToken,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId).populate('subscriptionId');

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return sendSuccess(res, { user: user.toJSON() });
  })
);

// ============================================
// UTILITY ROUTES
// ============================================

/**
 * User Service Status
 * GET /api/users/status
 */
router.get('/service/status', (req, res) => {
  res.json({
    success: true,
    service: 'users',
    status: 'operational',
    timestamp: new Date(),
    endpoints: {
      public: 1,
      protected: 20,
      admin: 3,
      total: 24
    }
  });
});

export default router;
