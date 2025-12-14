/**
 * backend/src/utils/passwordHelper.js
 * Password Hashing & Validation Utilities
 * 
 * Handles all password operations:
 * - Password hashing (bcrypt)
 * - Password comparison
 * - Password strength validation
 * - Password generation
 */

import bcrypt from 'bcrypt';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

const BCRYPT_CONFIG = {
  saltRounds: 10,           // Default salt rounds
  maxPasswordLength: 128,   // Maximum password length
  minPasswordLength: 8      // Minimum password length
};

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: false,  // Optional
  specialChars: '!@#$%^&*()_+-=[]{}|;:,.<>?'
};

// ============================================
// PASSWORD HASHING
// ============================================

/**
 * Hash Password
 * @param {String} password - Plain text password
 * @param {Number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<String>} Hashed password
 */
export const hashPassword = async (password, saltRounds = BCRYPT_CONFIG.saltRounds) => {
  try {
    // Validate password length
    if (password.length > BCRYPT_CONFIG.maxPasswordLength) {
      throw new Error(`Password too long (max ${BCRYPT_CONFIG.maxPasswordLength} characters)`);
    }

    // Generate salt and hash
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

/**
 * Hash Password Sync
 * @param {String} password - Plain text password
 * @param {Number} saltRounds - Number of salt rounds (default: 10)
 * @returns {String} Hashed password
 */
export const hashPasswordSync = (password, saltRounds = BCRYPT_CONFIG.saltRounds) => {
  try {
    if (password.length > BCRYPT_CONFIG.maxPasswordLength) {
      throw new Error(`Password too long (max ${BCRYPT_CONFIG.maxPasswordLength} characters)`);
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    return bcrypt.hashSync(password, salt);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
};

// ============================================
// PASSWORD COMPARISON
// ============================================

/**
 * Compare Password with Hash
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Promise<Boolean>} True if passwords match
 */
export const comparePassword = async (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

/**
 * Compare Password Sync
 * @param {String} password - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Boolean} True if passwords match
 */
export const comparePasswordSync = (password, hashedPassword) => {
  try {
    if (!password || !hashedPassword) {
      return false;
    }

    return bcrypt.compareSync(password, hashedPassword);
  } catch (error) {
    throw new Error(`Password comparison failed: ${error.message}`);
  }
};

// ============================================
// PASSWORD VALIDATION
// ============================================

/**
 * Validate Password Strength
 * @param {String} password - Password to validate
 * @returns {Object} { valid, errors, strength, score }
 */
export const validatePasswordStrength = (password) => {
  const errors = [];
  let score = 0;

  // Check length
  if (!password || password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  } else {
    score += 20;
  }

  if (password && password.length > PASSWORD_REQUIREMENTS.maxLength) {
    errors.push(`Password must not exceed ${PASSWORD_REQUIREMENTS.maxLength} characters`);
  }

  // Check uppercase
  if (PASSWORD_REQUIREMENTS.requireUppercase) {
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    } else {
      score += 20;
    }
  }

  // Check lowercase
  if (PASSWORD_REQUIREMENTS.requireLowercase) {
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    } else {
      score += 20;
    }
  }

  // Check number
  if (PASSWORD_REQUIREMENTS.requireNumber) {
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    } else {
      score += 20;
    }
  }

  // Check special character (optional but adds points)
  if (PASSWORD_REQUIREMENTS.requireSpecialChar) {
    const specialCharRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (!specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    } else {
      score += 20;
    }
  } else {
    const specialCharRegex = new RegExp(`[${PASSWORD_REQUIREMENTS.specialChars.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
    if (specialCharRegex.test(password)) {
      score += 10; // Bonus points for special char even if not required
    }
  }

  // Additional length bonus
  if (password && password.length >= 12) {
    score += 10;
  }

  // Determine strength
  let strength;
  if (score >= 80) strength = 'strong';
  else if (score >= 60) strength = 'good';
  else if (score >= 40) strength = 'fair';
  else strength = 'weak';

  return {
    valid: errors.length === 0,
    errors,
    strength,
    score,
    requirements: PASSWORD_REQUIREMENTS
  };
};

/**
 * Check Password Strength (Simple)
 * @param {String} password - Password to check
 * @returns {String} Strength level (weak, fair, good, strong)
 */
export const getPasswordStrength = (password) => {
  const { strength } = validatePasswordStrength(password);
  return strength;
};

/**
 * Is Password Valid
 * @param {String} password - Password to validate
 * @returns {Boolean} True if valid
 */
export const isPasswordValid = (password) => {
  const { valid } = validatePasswordStrength(password);
  return valid;
};

// ============================================
// PASSWORD GENERATION
// ============================================

/**
 * Generate Random Password
 * @param {Number} length - Password length (default: 12)
 * @param {Object} options - Generation options
 * @returns {String} Generated password
 */
export const generateRandomPassword = (length = 12, options = {}) => {
  const {
    includeUppercase = true,
    includeLowercase = true,
    includeNumbers = true,
    includeSpecialChars = true,
    excludeSimilar = true,  // Exclude similar characters (0, O, l, 1, etc.)
    excludeAmbiguous = true  // Exclude ambiguous characters
  } = options;

  let charset = '';
  
  if (includeLowercase) {
    charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
  }
  
  if (includeUppercase) {
    charset += excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  }
  
  if (includeNumbers) {
    charset += excludeSimilar ? '23456789' : '0123456789';
  }
  
  if (includeSpecialChars) {
    charset += excludeAmbiguous ? '!@#$%^&*-_+=?' : '!@#$%^&*()_+-=[]{}|;:,.<>?';
  }

  if (charset === '') {
    throw new Error('At least one character type must be included');
  }

  let password = '';
  const charsetLength = charset.length;

  // Use crypto for better randomness
  const randomBytes = crypto.randomBytes(length);
  
  for (let i = 0; i < length; i++) {
    const randomIndex = randomBytes[i] % charsetLength;
    password += charset[randomIndex];
  }

  return password;
};

/**
 * Generate Secure Password
 * @param {Number} length - Password length (default: 16)
 * @returns {String} Secure password that meets all requirements
 */
export const generateSecurePassword = (length = 16) => {
  let password;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    password = generateRandomPassword(length, {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSpecialChars: true,
      excludeSimilar: true,
      excludeAmbiguous: true
    });
    attempts++;
  } while (!isPasswordValid(password) && attempts < maxAttempts);

  if (!isPasswordValid(password)) {
    throw new Error('Failed to generate valid password');
  }

  return password;
};

/**
 * Generate Memorable Password (passphrase style)
 * @param {Number} wordCount - Number of words (default: 4)
 * @returns {String} Memorable password
 */
export const generateMemorablePassword = (wordCount = 4) => {
  const wordList = [
    'correct', 'horse', 'battery', 'staple', 'mountain', 'river', 'ocean', 'forest',
    'sunrise', 'moonlight', 'thunder', 'lightning', 'crystal', 'diamond', 'golden',
    'silver', 'copper', 'bronze', 'mighty', 'brave', 'swift', 'noble', 'wise',
    'ancient', 'modern', 'future', 'digital', 'cosmic', 'stellar', 'lunar'
  ];

  const words = [];
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = crypto.randomInt(0, wordList.length);
    words.push(wordList[randomIndex]);
  }

  // Capitalize first letter of each word and add numbers
  const password = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + crypto.randomInt(10, 99);

  return password;
};

// ============================================
// PASSWORD UTILITIES
// ============================================

/**
 * Check if Passwords Match
 * @param {String} password - Password
 * @param {String} confirmPassword - Confirmation password
 * @returns {Boolean} True if passwords match
 */
export const doPasswordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Estimate Password Crack Time
 * @param {String} password - Password to analyze
 * @returns {Object} Crack time estimation
 */
export const estimatePasswordCrackTime = (password) => {
  let charsetSize = 0;

  if (/[a-z]/.test(password)) charsetSize += 26;
  if (/[A-Z]/.test(password)) charsetSize += 26;
  if (/[0-9]/.test(password)) charsetSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) charsetSize += 32;

  const combinations = Math.pow(charsetSize, password.length);
  
  // Assume 1 billion attempts per second
  const attemptsPerSecond = 1000000000;
  const secondsToCrack = combinations / attemptsPerSecond;

  let timeString;
  if (secondsToCrack < 60) {
    timeString = 'Less than a minute';
  } else if (secondsToCrack < 3600) {
    timeString = `${Math.round(secondsToCrack / 60)} minutes`;
  } else if (secondsToCrack < 86400) {
    timeString = `${Math.round(secondsToCrack / 3600)} hours`;
  } else if (secondsToCrack < 31536000) {
    timeString = `${Math.round(secondsToCrack / 86400)} days`;
  } else {
    timeString = `${Math.round(secondsToCrack / 31536000)} years`;
  }

  return {
    seconds: secondsToCrack,
    timeString,
    combinations,
    charsetSize
  };
};

/**
 * Check for Common Passwords
 * @param {String} password - Password to check
 * @returns {Boolean} True if password is common
 */
export const isCommonPassword = (password) => {
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 
    '1234567', 'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou',
    'master', 'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow',
    '123123', '654321', 'superman', 'qazwsx', 'michael', 'football'
  ];

  return commonPasswords.includes(password.toLowerCase());
};

/**
 * Sanitize Password (remove invalid characters)
 * @param {String} password - Password to sanitize
 * @returns {String} Sanitized password
 */
export const sanitizePassword = (password) => {
  // Remove null bytes and control characters
  return password.replace(/[\x00-\x1F\x7F]/g, '');
};

// ============================================
// PASSWORD HISTORY
// ============================================

/**
 * Check if Password Used Before
 * @param {String} newPassword - New password
 * @param {Array} passwordHistory - Array of previous hashed passwords
 * @returns {Promise<Boolean>} True if password was used before
 */
export const isPasswordReused = async (newPassword, passwordHistory = []) => {
  for (const oldHash of passwordHistory) {
    const isMatch = await comparePassword(newPassword, oldHash);
    if (isMatch) {
      return true;
    }
  }
  return false;
};

// ============================================
// EXPORTS
// ============================================

export default {
  // Hashing
  hashPassword,
  hashPasswordSync,
  
  // Comparison
  comparePassword,
  comparePasswordSync,
  
  // Validation
  validatePasswordStrength,
  getPasswordStrength,
  isPasswordValid,
  
  // Generation
  generateRandomPassword,
  generateSecurePassword,
  generateMemorablePassword,
  
  // Utilities
  doPasswordsMatch,
  estimatePasswordCrackTime,
  isCommonPassword,
  sanitizePassword,
  isPasswordReused,
  
  // Config
  PASSWORD_REQUIREMENTS,
  BCRYPT_CONFIG
};
