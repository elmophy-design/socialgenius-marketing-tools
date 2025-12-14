/**
 * backend/src/models/User.js
 * User Model - MongoDB Schema (ES Module Version)
 * 
 * Manages user accounts, authentication, and profile information
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/**
 * User Schema
 * Core user account information
 */
const userSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name must be less than 50 characters']
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't include password in queries by default
  },

  // Profile Information
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name must be less than 100 characters'],
    default: ''
  },

  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio must be less than 500 characters'],
    default: ''
  },

  profilePicture: {
    type: String,
    default: null
  },

  timezone: {
    type: String,
    default: 'UTC'
  },

  language: {
    type: String,
    default: 'en',
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja']
  },

  // Subscription Reference
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    default: null
  },

  // Quick access to current subscription info (denormalized for performance)
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'pro'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'expired', 'trialing'],
      default: 'trialing'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    trialEndDate: {
      type: Date,
      default: function() {
        return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      }
    }
  },

  // Authentication
  isEmailVerified: {
    type: Boolean,
    default: false
  },

  emailVerificationToken: {
    type: String,
    default: null,
    select: false
  },

  emailVerificationExpires: {
    type: Date,
    default: null
  },

  passwordResetToken: {
    type: String,
    default: null,
    select: false
  },

  passwordResetExpires: {
    type: Date,
    default: null
  },

  lastPasswordChange: {
    type: Date,
    default: null
  },

  // OAuth
  googleId: {
    type: String,
    default: null,
    
  },

  facebookId: {
    type: String,
    default: null
  },

  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },

  // Role & Permissions
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },

  isAdmin: {
    type: Boolean,
    default: false
  },

  permissions: {
    type: [String],
    default: []
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isBanned: {
    type: Boolean,
    default: false
  },

  banReason: {
    type: String,
    default: null
  },

  bannedAt: {
    type: Date,
    default: null
  },

  // Statistics
  stats: {
    totalPosts: {
      type: Number,
      default: 0,
      min: 0
    },
    totalGenerations: {
      type: Number,
      default: 0,
      min: 0
    },
    totalEngagement: {
      type: Number,
      default: 0,
      min: 0
    },
    connectedAccounts: {
      type: Number,
      default: 0,
      min: 0
    },
    scheduledPosts: {
      type: Number,
      default: 0,
      min: 0
    },
    savedContent: {
      type: Number,
      default: 0,
      min: 0
    }
  },

  // Activity Tracking
  lastLoginAt: {
    type: Date,
    default: null
  },

  lastActiveAt: {
    type: Date,
    default: Date.now
  },

  loginCount: {
    type: Number,
    default: 0,
    min: 0
  },

  // Settings & Preferences
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      },
      marketing: {
        type: Boolean,
        default: false
      }
    },
    privacy: {
      profilePublic: {
        type: Boolean,
        default: false
      },
      showEmail: {
        type: Boolean,
        default: false
      }
    },
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light'
      },
      defaultPlatform: {
        type: String,
        enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
        default: 'facebook'
      }
    }
  },

  // Connected Social Accounts
  connectedAccounts: [{
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'instagram', 'linkedin', 'tiktok'],
      required: true
    },
    accountId: {
      type: String,
      required: true
    },
    accountName: {
      type: String,
      required: true
    },
    accessToken: {
      type: String,
      select: false
    },
    refreshToken: {
      type: String,
      select: false
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],

  // Metadata
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  // Referral
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  },

  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  collection: 'users'
});

// ============================================
// INDEXES
// ============================================

//userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'subscription.plan': 1 });
userSchema.index({ createdAt: -1 });

// ============================================
// VIRTUALS
// ============================================

userSchema.virtual('fullName').get(function() {
  return this.name;
});

userSchema.virtual('isPremium').get(function() {
  return this.subscription.plan === 'premium' || this.subscription.plan === 'pro';
});

userSchema.virtual('isTrial').get(function() {
  return this.subscription.plan === 'trial';
});

userSchema.virtual('daysSinceJoined').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// ============================================
// METHODS
// ============================================

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = async function() {
  this.lastLoginAt = new Date();
  this.lastActiveAt = new Date();
  this.loginCount += 1;
  await this.save();
  return this;
};

userSchema.methods.updateLastActive = async function() {
  this.lastActiveAt = new Date();
  await this.save();
  return this;
};

userSchema.methods.isVerified = function() {
  return this.isEmailVerified;
};

userSchema.methods.generatePasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

userSchema.methods.generateEmailVerificationToken = function() {
  const verifyToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verifyToken)
    .digest('hex');
  
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  
  return verifyToken;
};

userSchema.methods.addConnectedAccount = async function(platform, accountId, accountName, accessToken, refreshToken) {
  const exists = this.connectedAccounts.find(
    acc => acc.platform === platform && acc.accountId === accountId
  );
  
  if (!exists) {
    this.connectedAccounts.push({
      platform,
      accountId,
      accountName,
      accessToken,
      refreshToken
    });
    
    this.stats.connectedAccounts = this.connectedAccounts.length;
    await this.save();
  }
  
  return this;
};

userSchema.methods.removeConnectedAccount = async function(platform, accountId) {
  this.connectedAccounts = this.connectedAccounts.filter(
    acc => !(acc.platform === platform && acc.accountId === accountId)
  );
  
  this.stats.connectedAccounts = this.connectedAccounts.length;
  await this.save();
  
  return this;
};

userSchema.methods.softDelete = async function() {
  this.deletedAt = new Date();
  this.isActive = false;
  await this.save();
  return this;
};

// ============================================
// STATICS
// ============================================

userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email: email.toLowerCase() });
};

userSchema.statics.findByGoogleId = async function(googleId) {
  return await this.findOne({ googleId });
};

userSchema.statics.getActiveUsersCount = async function() {
  return await this.countDocuments({ isActive: true, deletedAt: null });
};

userSchema.statics.getUsersByPlan = async function(plan) {
  return await this.find({ 'subscription.plan': plan, isActive: true });
};

// ============================================
// PRE HOOKS
// ============================================

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userSchema.pre('save', function(next) {
  if (this.isBanned && !this.banReason) {
    return next(new Error('Ban reason is required when banning a user'));
  }
  next();
});

// ============================================
// POST HOOKS
// ============================================

userSchema.post('save', function(doc) {
  if (doc.isNew) {
    console.log(`✅ New user created: ${doc.email}`);
  }
});

// ============================================
// QUERY HELPERS
// ============================================

userSchema.query.active = function() {
  return this.where({ isActive: true, deletedAt: null });
};

userSchema.query.premium = function() {
  return this.where({
    'subscription.plan': { $in: ['premium', 'pro'] }
  });
};

// ============================================
// TOOBJECT/TOJSON
// ============================================

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.emailVerificationToken;
  delete obj.emailVerificationExpires;
  delete obj.__v;
  
  if (obj.connectedAccounts) {
    obj.connectedAccounts.forEach(account => {
      delete account.accessToken;
      delete account.refreshToken;
    });
  }
  
  return obj;
};

// ============================================
// EXPORT MODEL (ES MODULE)
// ============================================

const User = mongoose.model('User', userSchema);

export default User;  // ✅ Changed from module.exports