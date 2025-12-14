/**
 * backend/src/models/Subscription.js
 * Subscription Model - User Subscription Management (ES Module)
 */

import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    
  },

  plan: {
    type: String,
    enum: ['trial', 'basic', 'premium', 'pro'],
    default: 'trial',
    required: true
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'cancelled', 'expired', 'trialing', 'past_due'],
    default: 'trialing',
    required: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  isTrial: {
    type: Boolean,
    default: true
  },

  trialStartDate: {
    type: Date,
    default: Date.now
  },

  trialEndDate: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }
  },

  currentPeriodStart: {
    type: Date,
    default: Date.now
  },

  currentPeriodEnd: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
  },

  billingCycle: {
    type: String,
    enum: ['monthly', 'yearly'],
    default: 'monthly'
  },

  price: {
    type: Number,
    default: 0,
    min: 0
  },

  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'NGN']
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'bank_transfer', null],
    default: null
  },

  paymentProvider: {
    type: String,
    enum: ['stripe', 'paystack', 'paypal', null],
    default: null
  },

  paymentProviderId: {
    type: String,
    default: null
  },

  lastPaymentDate: {
    type: Date,
    default: null
  },

  nextBillingDate: {
    type: Date,
    default: null
  },

  features: {
    dailyGenerations: {
      type: Number,
      default: 10
    },
    
    monthlyGenerations: {
      type: Number,
      default: 300
    },

    platforms: {
      type: [String],
      default: ['facebook', 'twitter', 'instagram']
    },

    tools: {
      type: [String],
      default: [
        'social-media',
        'value-proposition',
        'headline-analyzer',
        'seo-meta',
        'email-tester',
        'content-idea',
        'ad-copy',
        'funnel-builder'
      ]
    },

    aiCredits: {
      type: Number,
      default: 100
    },

    teamMembers: {
      type: Number,
      default: 1
    },

    scheduledPosts: {
      type: Number,
      default: 5
    },

    analytics: {
      type: Boolean,
      default: false
    },

    prioritySupport: {
      type: Boolean,
      default: false
    },

    customBranding: {
      type: Boolean,
      default: false
    },

    apiAccess: {
      type: Boolean,
      default: false
    }
  },

  usage: {
    generationsUsed: {
      type: Number,
      default: 0,
      min: 0
    },

    generationsResetDate: {
      type: Date,
      default: Date.now
    },

    aiCreditsUsed: {
      type: Number,
      default: 0,
      min: 0
    },

    lastGenerationDate: {
      type: Date,
      default: null
    }
  },

  cancelAtPeriodEnd: {
    type: Boolean,
    default: false
  },

  cancelledAt: {
    type: Date,
    default: null
  },

  cancellationReason: {
    type: String,
    default: null
  },

  planHistory: [{
    plan: String,
    startDate: Date,
    endDate: Date,
    price: Number
  }],

  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },

  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'subscriptions'
});

// Indexes
//subscriptionSchema.index({ userId: 1 }, { unique: true });
subscriptionSchema.index({ plan: 1, status: 1 });
subscriptionSchema.index({ status: 1, isActive: 1 });
subscriptionSchema.index({ nextBillingDate: 1 });

// Virtuals
subscriptionSchema.virtual('isPremium').get(function() {
  return this.plan === 'premium' || this.plan === 'pro';
});

subscriptionSchema.virtual('isTrialExpired').get(function() {
  return this.isTrial && new Date() > this.trialEndDate;
});

subscriptionSchema.virtual('daysUntilRenewal').get(function() {
  if (!this.nextBillingDate) return null;
  const diff = this.nextBillingDate - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

subscriptionSchema.virtual('usagePercentage').get(function() {
  if (this.features.dailyGenerations === 0) return 0;
  return Math.round((this.usage.generationsUsed / this.features.dailyGenerations) * 100);
});

// Methods
subscriptionSchema.methods.canGenerate = function() {
  if (!this.isActive || this.status !== 'active') return false;
  if (this.isTrial && new Date() > this.trialEndDate) return false;
  if (this.usage.generationsUsed >= this.features.dailyGenerations) return false;
  return true;
};

subscriptionSchema.methods.incrementGeneration = async function() {
  this.usage.generationsUsed += 1;
  this.usage.lastGenerationDate = new Date();
  await this.save();
  return this;
};

subscriptionSchema.methods.resetDailyUsage = async function() {
  this.usage.generationsUsed = 0;
  this.usage.generationsResetDate = new Date();
  await this.save();
  return this;
};

subscriptionSchema.methods.upgradePlan = async function(newPlan, price) {
  this.planHistory.push({
    plan: this.plan,
    startDate: this.currentPeriodStart,
    endDate: new Date(),
    price: this.price
  });

  this.plan = newPlan;
  this.price = price;
  this.isTrial = false;
  this.status = 'active';
  this.currentPeriodStart = new Date();
  this.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  this.updateFeaturesByPlan(newPlan);

  await this.save();
  return this;
};

subscriptionSchema.methods.cancelSubscription = async function(reason = null, immediate = false) {
  this.cancelledAt = new Date();
  this.cancellationReason = reason;

  if (immediate) {
    this.status = 'cancelled';
    this.isActive = false;
  } else {
    this.cancelAtPeriodEnd = true;
  }

  await this.save();
  return this;
};

subscriptionSchema.methods.renew = async function() {
  this.currentPeriodStart = new Date();
  this.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  this.lastPaymentDate = new Date();
  this.nextBillingDate = this.currentPeriodEnd;
  this.status = 'active';
  this.isActive = true;

  await this.save();
  return this;
};

subscriptionSchema.methods.updateFeaturesByPlan = function(plan) {
  switch (plan) {
    case 'trial':
      this.features.dailyGenerations = 5;
      this.features.monthlyGenerations = 50;
      this.features.aiCredits = 50;
      this.features.scheduledPosts = 3;
      this.features.teamMembers = 1;
      this.features.analytics = false;
      this.features.prioritySupport = false;
      break;

    case 'basic':
      this.features.dailyGenerations = 20;
      this.features.monthlyGenerations = 500;
      this.features.aiCredits = 200;
      this.features.scheduledPosts = 10;
      this.features.teamMembers = 2;
      this.features.analytics = true;
      this.features.prioritySupport = false;
      break;

    case 'premium':
      this.features.dailyGenerations = 50;
      this.features.monthlyGenerations = 1500;
      this.features.aiCredits = 1000;
      this.features.scheduledPosts = 50;
      this.features.teamMembers = 5;
      this.features.analytics = true;
      this.features.prioritySupport = true;
      break;

    case 'pro':
      this.features.dailyGenerations = 200;
      this.features.monthlyGenerations = 5000;
      this.features.aiCredits = 5000;
      this.features.scheduledPosts = 200;
      this.features.teamMembers = 20;
      this.features.analytics = true;
      this.features.prioritySupport = true;
      this.features.customBranding = true;
      this.features.apiAccess = true;
      break;
  }
};

// Statics
subscriptionSchema.statics.getActiveSubscription = async function(userId) {
  return await this.findOne({
    userId,
    isActive: true
  });
};

subscriptionSchema.statics.createTrialSubscription = async function(userId) {
  const subscription = await this.create({
    userId,
    plan: 'trial',
    status: 'trialing',
    isTrial: true,
    isActive: true
  });

  subscription.updateFeaturesByPlan('trial');
  await subscription.save();

  return subscription;
};

subscriptionSchema.statics.getExpiringSoon = async function(days = 7) {
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + days);

  return await this.find({
    nextBillingDate: {
      $gte: new Date(),
      $lte: futureDate
    },
    status: 'active',
    isActive: true
  });
};

// Pre hooks
subscriptionSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

subscriptionSchema.pre('save', function(next) {
  const now = new Date();
  const resetDate = this.usage.generationsResetDate;
  
  if (resetDate && (now - resetDate) > 24 * 60 * 60 * 1000) {
    this.usage.generationsUsed = 0;
    this.usage.generationsResetDate = now;
  }
  
  next();
});

// Post hooks
subscriptionSchema.post('save', function(doc) {
  if (doc.isNew) {
    console.log(`✅ Subscription created: ${doc.plan} for user ${doc.userId}`);
  }
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;