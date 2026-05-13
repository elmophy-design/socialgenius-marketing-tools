/**
 * backend/src/controllers/userController.js
 * User Management Controller (ES Module Version)
 */

import User from '../models/User.js';
import { createUserNotification } from '../utils/notificationHelper.js';
import Subscription from '../models/Subscription.js';
import ToolContent from '../models/Tool.js';
import { buildToolRecommendations } from '../utils/toolRecommendations.js';

// ============================================
// PROFILE MANAGEMENT
// ============================================

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      bio: user.bio,
      profilePicture: user.profilePicture,
      timezone: user.timezone,
      language: user.language,
      subscription: user.subscription,
      stats: user.stats,
      brandVoice: user.brandVoice,
      createdAt: user.createdAt
    }
  });
};

export const updateBrandVoice = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const {
      voiceName,
      tone,
      targetAudience,
      brandValues,
      brandMission,
      dos,
      donts,
      knowledgeBase
    } = req.body;

    if (voiceName !== undefined) user.brandVoice.voiceName = voiceName;
    if (tone !== undefined) user.brandVoice.tone = tone;
    if (targetAudience !== undefined) user.brandVoice.targetAudience = targetAudience;
    if (brandValues !== undefined) user.brandVoice.brandValues = brandValues;
    if (brandMission !== undefined) user.brandVoice.brandMission = brandMission;
    if (dos !== undefined) user.brandVoice.dos = dos;
    if (donts !== undefined) user.brandVoice.donts = donts;
    if (knowledgeBase !== undefined) user.brandVoice.knowledgeBase = knowledgeBase;

    await user.save();

    res.json({
      success: true,
      message: 'Brand voice updated successfully',
      brandVoice: user.brandVoice
    });
  } catch (error) {
    console.error('updateBrandVoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating brand voice',
      error: error.message
    });
  }
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const {
    name,
    company,
    bio,
    timezone,
    language,
    businessType,
    primaryGoal,
    favoritePlatform,
    experienceLevel,
    interests,
    activityPreferences
  } = req.body;

  if (name) user.name = name;
  if (company !== undefined) user.company = company;
  if (bio !== undefined) user.bio = bio;
  if (timezone) user.timezone = timezone;
  if (language) user.language = language;

  // Update onboarding profile in metadata
  if (businessType !== undefined || primaryGoal !== undefined || favoritePlatform !== undefined ||
      experienceLevel !== undefined || interests !== undefined || activityPreferences !== undefined) {
    
    const onboardingProfile = user.metadata?.get ? (user.metadata.get('onboardingProfile') || {}) : (user.metadata?.onboardingProfile || {});
    
    if (businessType !== undefined) onboardingProfile.businessType = businessType;
    if (primaryGoal !== undefined) onboardingProfile.primaryGoal = primaryGoal;
    if (favoritePlatform !== undefined) onboardingProfile.favoritePlatform = favoritePlatform;
    if (experienceLevel !== undefined) onboardingProfile.experienceLevel = experienceLevel;
    if (interests !== undefined) onboardingProfile.interests = interests;
    if (activityPreferences !== undefined) onboardingProfile.activityPreferences = activityPreferences;
    
    if (user.metadata?.set) {
      user.metadata.set('onboardingProfile', onboardingProfile);
    } else {
      user.metadata = { ...user.metadata, onboardingProfile };
    }

    // Recalculate tool recommendations based on updated profile
    const newRecommendations = buildToolRecommendations({
      interests: onboardingProfile.interests || [],
      activityPreferences: onboardingProfile.activityPreferences || [],
      primaryGoal: onboardingProfile.primaryGoal || '',
      favoritePlatform: onboardingProfile.favoritePlatform || '',
      businessType: onboardingProfile.businessType || '',
      experienceLevel: onboardingProfile.experienceLevel || ''
    });

    if (user.metadata?.set) {
      user.metadata.set('toolRecommendations', newRecommendations);
    } else {
      user.metadata.toolRecommendations = newRecommendations;
    }

    // Notify user about updated recommendations
    try {
      await createUserNotification(user._id, {
        type: 'info',
        category: 'account',
        title: 'New tool suggestions ready',
        message: `Based on your updated profile, we've suggested ${newRecommendations.length} tools to help you grow.`,
        action: {
          label: 'View Tools',
          url: '/dashboard'
        }
      }, {
        sendEmail: false,
        dedupeWindowMinutes: 60
      });
    } catch (notifyError) {
      console.error('Error creating notification for updated recommendations:', notifyError);
    }
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      bio: user.bio,
      metadata: user.metadata
    }
  });
};

export const updateEmail = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid password');
  }

  const emailExists = await User.findOne({ email: email.toLowerCase() });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use');
  }

  user.email = email.toLowerCase();
  user.isEmailVerified = false;
  await user.save();

  res.json({
    success: true,
    message: 'Email updated successfully. Please verify your new email.'
  });
};

export const uploadProfilePicture = async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    res.status(400);
    throw new Error('Image URL is required');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.profilePicture = imageUrl;
  await user.save();

  res.json({
    success: true,
    message: 'Profile picture updated successfully',
    profilePicture: user.profilePicture
  });
};

export const updatePaymentMethod = async (req, res) => {
  const { cardNumber, expiryDate, cvv, billingAddress } = req.body;

  if (!cardNumber || !expiryDate || !cvv || !billingAddress) {
    res.status(400);
    throw new Error('Payment and billing address details are required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // In a real application, you would integrate with a payment gateway (e.g., Stripe) here.
  // This would involve:
  // 1. Tokenizing the card details on the frontend (never send raw card data to your backend).
  // 2. Sending the token to your backend.
  // 3. Using the token to update the customer's payment method in the payment gateway.
  // 4. Storing a reference to the payment method (e.g., last 4 digits, card type) in your database.

  // For this mock, we'll just simulate success and store some details.
  user.billing = {
    ...user.billing,
    paymentMethod: {
      type: 'card',
      last4: cardNumber.slice(-4),
      expiry: expiryDate,
      brand: 'Visa' // Mocked
    },
    address: billingAddress
  };
  await user.save();

  res.json({
    success: true,
    message: 'Payment method and billing address updated successfully'
  });
};

// ============================================
// STATISTICS
// ============================================

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    
    if (!userId) {
      console.error('User ID not found in req.user');
      return res.status(400).json({
        success: false,
        message: 'User ID not found'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const subscription = await Subscription.getActiveSubscription(userId);

    return res.json({
      success: true,
      stats: {
        user: user.stats || {},
        subscription: subscription ? {
          plan: subscription.plan,
          usage: subscription.usage || {},
          limits: subscription.features || {}
        } : null
      }
    });
  } catch (error) {
    console.error('getUserStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};

export const getLoginActivity = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // In a real application, you would fetch this from a dedicated LoginActivity log.
  // For this mock, we'll return some dummy data based on the user's lastLogin.
  const loginActivities = [
    { timestamp: user.lastLogin, ipAddress: '192.168.1.1', device: 'Chrome on Windows', location: 'San Francisco, CA' },
    { timestamp: new Date(user.lastLogin.getTime() - 86400000), ipAddress: '10.0.0.5', device: 'Safari on iOS', location: 'New York, NY' },
  ];

  res.json({
    success: true,
    data: {
      activities: loginActivities
    }
  });
};

// ============================================
// SETTINGS
// ============================================

export const updateSettings = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { notifications, privacy, preferences } = req.body;

  if (notifications) {
    user.settings.notifications = { ...user.settings.notifications, ...notifications };
  }

  if (privacy) {
    user.settings.privacy = { ...user.settings.privacy, ...privacy };
  }

  if (preferences) {
    user.settings.preferences = { ...user.settings.preferences, ...preferences };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Settings updated successfully',
    settings: user.settings
  });
};

export const getInvoices = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // In a real application, you would fetch this from your payment provider (e.g., Stripe)
  // or your own Invoice model.
  const mockInvoices = [
    { id: 'INV-001', date: new Date(Date.now() - 2592000000).toLocaleDateString(), amount: 9.99, status: 'Paid', description: 'Basic Plan - Monthly' },
    { id: 'INV-002', date: new Date(Date.now() - 5184000000).toLocaleDateString(), amount: 9.99, status: 'Paid', description: 'Basic Plan - Monthly' },
    { id: 'INV-003', date: new Date(Date.now() - 7776000000).toLocaleDateString(), amount: 9.99, status: 'Paid', description: 'Basic Plan - Monthly' },
  ];

  res.json({
    success: true,
    data: mockInvoices
  });
};

export const downloadInvoice = async (req, res) => {
  const { invoiceId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // In a real application, you would fetch the actual invoice file (e.g., PDF)
  // from your storage or payment provider.
  // For this mock, we'll send a dummy PDF content.
  const dummyPdfContent = `Invoice ${invoiceId} for User ${user.name}\n\nThis is a dummy invoice for demonstration purposes.`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="invoice_${invoiceId}.pdf"`);
  res.send(dummyPdfContent);
};

// ============================================
// CONNECTED ACCOUNTS
// ============================================

export const getConnectedAccounts = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json({
    success: true,
    connectedAccounts: user.connectedAccounts
  });
};

export const connectSocialAccount = async (req, res) => {
  const { platform, accountId, accountName, accessToken, refreshToken } = req.body;

  if (!platform || !accountId || !accountName) {
    res.status(400);
    throw new Error('Platform, account ID, and account name are required');
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.addConnectedAccount(platform, accountId, accountName, accessToken, refreshToken);

  await createUserNotification(user._id, {
    type: 'social',
    category: 'social-connection',
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} connected`,
    message: `${accountName} is now connected and ready for publishing workflows.`,
    action: {
      label: 'Open Social Media Generator',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tools/social-media`,
    },
  });

  res.json({
    success: true,
    message: 'Social account connected successfully',
    connectedAccounts: user.connectedAccounts
  });
};

export const disconnectSocialAccount = async (req, res) => {
  const { platform, accountId } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  await user.removeConnectedAccount(platform, accountId);

  await createUserNotification(user._id, {
    type: 'warning',
    category: 'social-connection',
    title: `${platform.charAt(0).toUpperCase() + platform.slice(1)} disconnected`,
    message: 'Auto-posting for this social account has been paused until you reconnect it.',
    action: {
      label: 'Review connections',
      url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tools/social-media`,
    },
  });

  res.json({
    success: true,
    message: 'Social account disconnected successfully'
  });
};

// ============================================
// SUBSCRIPTION
// ============================================

export const getSubscription = async (req, res) => {
  try {
    // First try to get from User model (denormalized data)
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get subscription data with defaults
    const userSubscription = user.subscription || {};

    // Ensure plan is set (default to trial if not set)
    const plan = userSubscription.plan || 'trial';

    // Trial windows should always be based on the signup date.
    const signupDate = new Date(user.createdAt);
    const fallbackTrialEndDate = new Date(
      signupDate.getTime() + 7 * 24 * 60 * 60 * 1000
    );

    let trialEndDate = userSubscription.trialEndDate;
    if (plan === 'trial') {
      trialEndDate = fallbackTrialEndDate;

      const storedTrialEndDate = userSubscription.trialEndDate
        ? new Date(userSubscription.trialEndDate)
        : null;
      const storedTrialEndTime = storedTrialEndDate?.getTime?.();
      const fallbackTrialEndTime = fallbackTrialEndDate.getTime();

      if (storedTrialEndTime !== fallbackTrialEndTime || userSubscription.plan !== 'trial') {
        await User.findByIdAndUpdate(
          req.user.id,
          {
            'subscription.plan': 'trial',
            'subscription.status': 'trialing',
            'subscription.trialEndDate': fallbackTrialEndDate
          },
          { new: true }
        );
      }
    } else if (!trialEndDate) {
      trialEndDate = fallbackTrialEndDate;
    }
    
    // Build response
    const finalSubscription = {
      plan: plan,
      status: plan === 'trial' ? 'trialing' : (userSubscription.status || 'active'),
      isActive: userSubscription.isActive !== false,
      isTrial: plan === 'trial',
      trialEndDate: trialEndDate,
      trialEndsAt: trialEndDate,
      features: userSubscription.features || {},
      usage: userSubscription.usage || {}
    };

    res.json({
      success: true,
      subscription: finalSubscription
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch subscription'
    });
  }
};

// ============================================
// ACCOUNT MANAGEMENT
// ============================================

export const deactivateAccount = async (req, res) => {
  const { password } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid password');
  }

  user.isActive = false;
  await user.save();

  res.json({
    success: true,
    message: 'Account deactivated successfully'
  });
};

export const reactivateAccount = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  user.isActive = true;
  await user.save();

  res.json({
    success: true,
    message: 'Account reactivated successfully'
  });
};

export const deleteAccount = async (req, res) => {
  const { password, reason } = req.body;

  if (!password) {
    res.status(400);
    throw new Error('Password is required');
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid password');
  }

  await user.softDelete();

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
};

export const exportUserData = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const subscription = await Subscription.getActiveSubscription(req.user.id);
  const content = await ToolContent.find({ userId: req.user.id, deletedAt: null });

  const userData = {
    profile: user.toJSON(),
    subscription: subscription ? subscription.toJSON() : null,
    content: content,
    exportDate: new Date()
  };

  res.json({
    success: true,
    data: userData
  });
};

// ============================================
// ADMIN FUNCTIONS
// ============================================

export const searchUsers = async (req, res) => {
  const { q, page = 1, limit = 10 } = req.query;

  if (!q) {
    res.status(400);
    throw new Error('Search query is required');
  }

  const query = {
    $or: [
      { name: { $regex: q, $options: 'i' } },
      { email: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } }
    ],
    deletedAt: null
  };

  const users = await User.find(query)
    .select('-password')
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  const count = await User.countDocuments(query);

  res.json({
    success: true,
    users,
    totalPages: Math.ceil(count / limit),
    currentPage: parseInt(page),
    totalUsers: count
  });
};
