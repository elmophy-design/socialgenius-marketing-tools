/**
 * backend/src/utils/tokenHelper.js
 * JWT Token Utilities
 * 
 * Handles all JWT token operations:
 * - Token generation
 * - Token verification
 * - Token decoding
 * - Refresh token management
 */

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  issuer: 'meritlives-tools',
  audience: 'socialgenius-users',
  algorithm: 'HS256'
};

const TOKEN_EXPIRY = {
  access: '7d',           // Access token: 7 days
  refresh: '30d',         // Refresh token: 30 days
  verification: '24h',    // Email verification: 24 hours
  resetPassword: '1h',    // Password reset: 1 hour
  rememberMe: '30d'       // Remember me: 30 days
};

// ============================================
// TOKEN GENERATION
// ============================================

/**
 * Generate JWT Access Token
 * @param {Object} payload - User data to encode
 * @param {String} expiresIn - Token expiration (default: 7d)
 * @returns {String} JWT token
 */
export const generateAccessToken = (payload, expiresIn = TOKEN_EXPIRY.access) => {
  try {
    const token = jwt.sign(
      {
        ...payload,
        type: 'access'
      },
      JWT_CONFIG.secret,
      {
        expiresIn,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience,
        algorithm: JWT_CONFIG.algorithm
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Token generation failed: ${error.message}`);
  }
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - User data to encode
 * @returns {String} JWT refresh token
 */
export const generateRefreshToken = (payload) => {
  try {
    const token = jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
        type: 'refresh'
      },
      JWT_CONFIG.secret,
      {
        expiresIn: TOKEN_EXPIRY.refresh,
        issuer: JWT_CONFIG.issuer,
        audience: JWT_CONFIG.audience
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Refresh token generation failed: ${error.message}`);
  }
};

/**
 * Generate Token Pair (Access + Refresh)
 * @param {Object} payload - User data
 * @returns {Object} { accessToken, refreshToken }
 */
export const generateTokenPair = (payload, rememberMe = false) => {
  const expiresIn = rememberMe ? TOKEN_EXPIRY.rememberMe : TOKEN_EXPIRY.access;

  return {
    accessToken: generateAccessToken(payload, expiresIn),
    refreshToken: generateRefreshToken(payload),
    expiresIn: rememberMe ? '30 days' : '7 days'
  };
};

/**
 * Generate Email Verification Token
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @returns {String} Verification token
 */
export const generateVerificationToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        type: 'verification'
      },
      JWT_CONFIG.secret,
      {
        expiresIn: TOKEN_EXPIRY.verification,
        issuer: JWT_CONFIG.issuer
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Verification token generation failed: ${error.message}`);
  }
};

/**
 * Generate Password Reset Token
 * @param {String} userId - User ID
 * @param {String} email - User email
 * @returns {String} Reset token
 */
export const generatePasswordResetToken = (userId, email) => {
  try {
    const token = jwt.sign(
      {
        userId,
        email,
        type: 'reset-password'
      },
      JWT_CONFIG.secret,
      {
        expiresIn: TOKEN_EXPIRY.resetPassword,
        issuer: JWT_CONFIG.issuer
      }
    );

    return token;
  } catch (error) {
    throw new Error(`Reset token generation failed: ${error.message}`);
  }
};

// ============================================
// TOKEN VERIFICATION
// ============================================

/**
 * Verify JWT Token
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, JWT_CONFIG.secret, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience
    });

    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    }
    if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    }
    throw new Error(`Token verification failed: ${error.message}`);
  }
};

/**
 * Verify Access Token
 * @param {String} token - Access token
 * @returns {Object} Decoded payload
 */
export const verifyAccessToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'access') {
    throw new Error('Invalid token type');
  }

  return decoded;
};

/**
 * Verify Refresh Token
 * @param {String} token - Refresh token
 * @returns {Object} Decoded payload
 */
export const verifyRefreshToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid refresh token');
  }

  return decoded;
};

/**
 * Verify Verification Token
 * @param {String} token - Verification token
 * @returns {Object} Decoded payload
 */
export const verifyVerificationToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'verification') {
    throw new Error('Invalid verification token');
  }

  return decoded;
};

/**
 * Verify Password Reset Token
 * @param {String} token - Reset token
 * @returns {Object} Decoded payload
 */
export const verifyPasswordResetToken = (token) => {
  const decoded = verifyToken(token);
  
  if (decoded.type !== 'reset-password') {
    throw new Error('Invalid reset token');
  }

  return decoded;
};

// ============================================
// TOKEN DECODING
// ============================================

/**
 * Decode JWT Token Without Verification
 * @param {String} token - JWT token
 * @returns {Object} Decoded payload
 */
export const decodeToken = (token) => {
  try {
    return jwt.decode(token);
  } catch (error) {
    throw new Error(`Token decoding failed: ${error.message}`);
  }
};

/**
 * Get Token Expiration Time
 * @param {String} token - JWT token
 * @returns {Date} Expiration date
 */
export const getTokenExpiration = (token) => {
  const decoded = decodeToken(token);
  
  if (!decoded || !decoded.exp) {
    throw new Error('Invalid token or no expiration');
  }

  return new Date(decoded.exp * 1000);
};

/**
 * Check if Token is Expired
 * @param {String} token - JWT token
 * @returns {Boolean} True if expired
 */
export const isTokenExpired = (token) => {
  try {
    const expiration = getTokenExpiration(token);
    return expiration < new Date();
  } catch (error) {
    return true;
  }
};

/**
 * Get Time Until Expiration
 * @param {String} token - JWT token
 * @returns {Number} Milliseconds until expiration
 */
export const getTimeUntilExpiration = (token) => {
  const expiration = getTokenExpiration(token);
  return expiration - new Date();
};

// ============================================
// TOKEN EXTRACTION
// ============================================

/**
 * Extract Token from Authorization Header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} Token or null
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Return as-is if no Bearer prefix
  return authHeader;
};

/**
 * Extract Token from Request
 * @param {Object} req - Express request object
 * @returns {String|null} Token or null
 */
export const extractTokenFromRequest = (req) => {
  // Try Authorization header first
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (authHeader) {
    return extractTokenFromHeader(authHeader);
  }

  // Try query parameter
  if (req.query.token) {
    return req.query.token;
  }

  // Try cookies
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// ============================================
// RANDOM TOKEN GENERATION
// ============================================

/**
 * Generate Random Token (for verification codes, etc.)
 * @param {Number} length - Token length (default: 32)
 * @returns {String} Random token
 */
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate Numeric Code
 * @param {Number} digits - Number of digits (default: 6)
 * @returns {String} Numeric code
 */
export const generateNumericCode = (digits = 6) => {
  const min = Math.pow(10, digits - 1);
  const max = Math.pow(10, digits) - 1;
  return Math.floor(Math.random() * (max - min + 1) + min).toString();
};

/**
 * Generate Short Code (alphanumeric)
 * @param {Number} length - Code length (default: 8)
 * @returns {String} Short code
 */
export const generateShortCode = (length = 8) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return code;
};

// ============================================
// TOKEN BLACKLIST (Optional)
// ============================================

// In-memory blacklist (use Redis in production)
const tokenBlacklist = new Set();

/**
 * Add Token to Blacklist
 * @param {String} token - Token to blacklist
 */
export const blacklistToken = (token) => {
  tokenBlacklist.add(token);
  
  // Auto-remove after expiration
  try {
    const expiration = getTokenExpiration(token);
    const timeout = expiration - new Date();
    
    if (timeout > 0) {
      setTimeout(() => {
        tokenBlacklist.delete(token);
      }, timeout);
    }
  } catch (error) {
    // If can't get expiration, remove after 30 days
    setTimeout(() => {
      tokenBlacklist.delete(token);
    }, 30 * 24 * 60 * 60 * 1000);
  }
};

/**
 * Check if Token is Blacklisted
 * @param {String} token - Token to check
 * @returns {Boolean} True if blacklisted
 */
export const isTokenBlacklisted = (token) => {
  return tokenBlacklist.has(token);
};

/**
 * Clear Token Blacklist
 */
export const clearBlacklist = () => {
  tokenBlacklist.clear();
};

// ============================================
// TOKEN INFO
// ============================================

/**
 * Get Token Information
 * @param {String} token - JWT token
 * @returns {Object} Token info
 */
export const getTokenInfo = (token) => {
  try {
    const decoded = decodeToken(token);
    const expiration = getTokenExpiration(token);
    const timeUntilExpiration = getTimeUntilExpiration(token);

    return {
      userId: decoded.userId,
      email: decoded.email,
      type: decoded.type,
      issuedAt: new Date(decoded.iat * 1000),
      expiresAt: expiration,
      isExpired: isTokenExpired(token),
      timeRemaining: timeUntilExpiration,
      issuer: decoded.iss,
      audience: decoded.aud
    };
  } catch (error) {
    throw new Error(`Failed to get token info: ${error.message}`);
  }
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Generation
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  generateVerificationToken,
  generatePasswordResetToken,
  
  // Verification
  verifyToken,
  verifyAccessToken,
  verifyRefreshToken,
  verifyVerificationToken,
  verifyPasswordResetToken,
  
  // Decoding
  decodeToken,
  getTokenExpiration,
  isTokenExpired,
  getTimeUntilExpiration,
  
  // Extraction
  extractTokenFromHeader,
  extractTokenFromRequest,
  
  // Random tokens
  generateRandomToken,
  generateNumericCode,
  generateShortCode,
  
  // Blacklist
  blacklistToken,
  isTokenBlacklisted,
  clearBlacklist,
  
  // Info
  getTokenInfo,
  
  // Config
  TOKEN_EXPIRY
};
