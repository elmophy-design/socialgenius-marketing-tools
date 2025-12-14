/**
 * backend/src/controllers/userController.js
 * User Management Controller (ES Module Version)
 */

import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import ToolContent from '../models/Tool.js';

// ============================================
// PROFILE MANAGEMENT
// ============================================

export const getProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

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
      createdAt: user.createdAt
    }
  });
};

export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const { name, company, bio, timezone, language } = req.body;

  if (name) user.name = name;
  if (company !== undefined) user.company = company;
  if (bio !== undefined) user.bio = bio;
  if (timezone) user.timezone = timezone;
  if (language) user.language = language;

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      company: user.company,
      bio: user.bio
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

// ============================================
// STATISTICS
// ============================================

export const getUserStats = async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const subscription = await Subscription.getActiveSubscription(req.user.id);

  res.json({
    success: true,
    stats: {
      user: user.stats,
      subscription: subscription ? {
        plan: subscription.plan,
        usage: subscription.usage,
        limits: subscription.features
      } : null
    }
  });
};

// ============================================
// SETTINGS
// ============================================

export const updateSettings = async (req, res) => {
  const user = await User.findById(req.user.id);

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

  res.json({
    success: true,
    message: 'Social account disconnected successfully'
  });
};

// ============================================
// SUBSCRIPTION
// ============================================

export const getSubscription = async (req, res) => {
  const subscription = await Subscription.getActiveSubscription(req.user.id);

  if (!subscription) {
    res.status(404);
    throw new Error('No active subscription found');
  }

  res.json({
    success: true,
    subscription: {
      plan: subscription.plan,
      status: subscription.status,
      isActive: subscription.isActive,
      features: subscription.features,
      usage: subscription.usage,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd
    }
  });
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