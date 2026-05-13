import express from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import axios from 'axios';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendPasswordResetEmail, sendWelcomeEmail } from '../controllers/emailController.js';
import { createUserNotification } from '../utils/notificationHelper.js';

const router = express.Router();

const generateToken = (userId, rememberMe = false) => (
  jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: rememberMe ? '30d' : '7d' }
  )
);

const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  company: user.company,
  plan: user.subscription?.plan || 'trial',
  isEmailVerified: user.isEmailVerified,
  profilePicture: user.profilePicture
});

const getGoogleOAuthRedirect = (req) => {
  const fallback = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/auth/google/callback';
  return fallback;
};

const buildFrontendRedirect = (path) => `${process.env.FRONTEND_URL || 'http://localhost:3000'}${path}`;

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      company: company?.trim() || ''
    });

    const subscription = await Subscription.createTrialSubscription(user._id);
    user.subscriptionId = subscription._id;
    user.subscription.plan = subscription.plan;
    user.subscription.status = subscription.status;
    user.subscription.isActive = subscription.isActive;
    user.subscription.trialEndDate = subscription.trialEndDate;
    await user.save();

    const token = generateToken(user._id);

    await createUserNotification(user._id, {
      type: 'success',
      category: 'account',
      title: 'Welcome to Meritlives',
      message: 'Your account is ready. Start exploring tools, notifications, and connected workflows.',
      action: {
        label: 'Open dashboard',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
      }
    }, {
      sendEmail: false,
      dedupeWindowMinutes: 60
    });

    try {
      await sendWelcomeEmail(user.email, user.name);
    } catch (error) {
      console.error('Welcome email error:', error.message);
    }

    return res.status(201).json({
      success: true,
      message: 'User created successfully',
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    await user.updateLastLogin();

    const token = generateToken(user._id, rememberMe);

    await createUserNotification(user._id, {
      type: 'info',
      category: 'account-activity',
      title: 'New sign-in detected',
      message: 'You signed in successfully to your Meritlives workspace.',
      action: {
        label: 'Review account',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`
      }
    }, {
      sendEmail: false,
      dedupeWindowMinutes: 5
    });

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.json({
      success: true,
      user: serializeUser(user)
    });
  } catch (error) {
    console.error('Get me error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

router.post('/logout', authenticateToken, async (req, res) => {
  return res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

router.get('/google', async (req, res) => {
  try {
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.redirect(buildFrontendRedirect('/login?error=google_oauth_not_configured'));
    }

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: getGoogleOAuthRedirect(req),
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'online',
      prompt: 'select_account'
    });

    return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  } catch (error) {
    console.error('Google auth start error:', error);
    return res.redirect(buildFrontendRedirect('/login?error=google_oauth_start_failed'));
  }
});

router.get('/google/callback', async (req, res) => {
  try {
    const { code, error } = req.query;

    if (error) {
      return res.redirect(buildFrontendRedirect(`/login?error=${encodeURIComponent(String(error))}`));
    }

    if (!code) {
      return res.redirect(buildFrontendRedirect('/login?error=no_google_auth_code'));
    }

    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        code: String(code),
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: getGoogleOAuthRedirect(req),
        grant_type: 'authorization_code'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const accessToken = tokenResponse.data?.access_token;

    if (!accessToken) {
      return res.redirect(buildFrontendRedirect('/login?error=google_access_token_missing'));
    }

    const profileResponse = await axios.get('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    const profile = profileResponse.data;
    const email = String(profile.email || '').toLowerCase().trim();

    if (!email) {
      return res.redirect(buildFrontendRedirect('/login?error=google_email_missing'));
    }

    let user = await User.findOne({
      $or: [
        { googleId: profile.sub || null },
        { email }
      ]
    });

    let isNewUser = false;
    if (!user) {
      isNewUser = true;
      user = await User.create({
        name: profile.name || email.split('@')[0],
        email,
        password: crypto.randomBytes(24).toString('hex'),
        googleId: profile.sub || null,
        authProvider: 'google',
        isEmailVerified: true,
        profilePicture: profile.picture || null
      });

      const subscription = await Subscription.createTrialSubscription(user._id);
      user.subscriptionId = subscription._id;
      user.subscription.plan = subscription.plan;
      user.subscription.status = subscription.status;
      user.subscription.isActive = subscription.isActive;
      user.subscription.trialEndDate = subscription.trialEndDate;
      await user.save();
    } else {
      user.googleId = user.googleId || profile.sub || null;
      user.authProvider = 'google';
      user.isEmailVerified = true;
      if (!user.profilePicture && profile.picture) {
        user.profilePicture = profile.picture;
      }

      if (!user.subscriptionId && user.subscription?.plan === 'trial') {
        const subscription = await Subscription.createTrialSubscription(user._id);
        user.subscriptionId = subscription._id;
        user.subscription.trialEndDate = subscription.trialEndDate;
      }

      await user.save();
    }

    await user.updateLastLogin();

    const token = generateToken(user._id);

    await createUserNotification(user._id, {
      type: 'info',
      category: 'account-activity',
      title: 'Signed in with Google',
      message: 'Your Google account was used to access your Meritlives workspace.',
      action: {
        label: 'Open dashboard',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`
      }
    }, {
      sendEmail: false,
      dedupeWindowMinutes: 5
    });

    return res.redirect(buildFrontendRedirect(`/login?token=${encodeURIComponent(token)}${isNewUser ? '&isNewUser=true' : ''}`));
  } catch (error) {
    console.error('Google auth callback error:', error?.response?.data || error);
    return res.redirect(buildFrontendRedirect('/login?error=google_auth_failed'));
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive password reset instructions'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedResetToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    const emailResult = await sendPasswordResetEmail(user.email, resetUrl, user.name);

    if (!emailResult?.success) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: emailResult?.error || 'Unable to send reset email right now. Please check email configuration and try again.'
      });
    }

    await createUserNotification(user._id, {
      type: 'warning',
      category: 'security',
      title: 'Password reset requested',
      message: 'A password reset link was generated for your account. If this was not you, secure your email and account immediately.',
      action: {
        label: 'Review security',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`
      }
    }, {
      sendEmail: false,
      dedupeWindowMinutes: 30
    });

    return res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      ...(process.env.NODE_ENV !== 'production' && { resetUrl, resetToken })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error processing password reset'
    });
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a new password'
      });
    }

    const passwordResetToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await createUserNotification(user._id, {
      type: 'success',
      category: 'security',
      title: 'Password updated successfully',
      message: 'Your password has been reset. If you did not make this change, contact support immediately.',
      action: {
        label: 'Open settings',
        url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings`
      }
    }, {
      sendEmail: true,
      dedupeWindowMinutes: 60
    });

    return res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Error resetting password'
    });
  }
});

export default router;
