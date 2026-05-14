/**
 * Client-side form validation utilities
 * Comprehensive validation functions for all form inputs
 */

/**
 * Email validation
 * @param {string} email - Email address to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Password validation
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string, strength: string }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true
  } = options;

  if (!password) {
    return { isValid: false, error: 'Password is required', strength: 'none' };
  }

  if (password.length < minLength) {
    return { 
      isValid: false, 
      error: `Password must be at least ${minLength} characters long`,
      strength: 'weak'
    };
  }

  const checks = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  if (requireUppercase && !checks.uppercase) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter',
      strength: 'weak'
    };
  }

  if (requireLowercase && !checks.lowercase) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one lowercase letter',
      strength: 'weak'
    };
  }

  if (requireNumbers && !checks.numbers) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one number',
      strength: 'medium'
    };
  }

  if (requireSpecialChars && !checks.specialChars) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one special character',
      strength: 'medium'
    };
  }

  // Calculate password strength
  let strength = 'weak';
  const passedChecks = Object.values(checks).filter(Boolean).length;
  
  if (passedChecks === 4 && password.length >= 12) {
    strength = 'strong';
  } else if (passedChecks >= 3 && password.length >= 10) {
    strength = 'medium';
  }

  return { isValid: true, error: null, strength };
};

/**
 * Confirm password validation
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your password' };
  }

  if (password !== confirmPassword) {
    return { isValid: false, error: 'Passwords do not match' };
  }

  return { isValid: true, error: null };
};

/**
 * Name validation
 * @param {string} name - Name to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 50, required = true } = options;

  if (!name || !name.trim()) {
    return { 
      isValid: !required, 
      error: required ? 'Name is required' : null 
    };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < minLength) {
    return { 
      isValid: false, 
      error: `Name must be at least ${minLength} characters long` 
    };
  }

  if (trimmedName.length > maxLength) {
    return { 
      isValid: false, 
      error: `Name must not exceed ${maxLength} characters` 
    };
  }

  // Check for invalid characters (only letters, spaces, hyphens, apostrophes)
  const nameRegex = /^[a-zA-Z\s'-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return { 
      isValid: false, 
      error: 'Name can only contain letters, spaces, hyphens, and apostrophes' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Phone number validation
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code (default: 'NG' for Nigeria)
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePhone = (phone, country = 'NG') => {
  if (!phone || !phone.trim()) {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  // Country-specific validation
  const patterns = {
    NG: /^(0|\+?234)?[789]\d{9}$/, // Nigerian numbers
    US: /^(\+?1)?[2-9]\d{9}$/, // US numbers
    UK: /^(\+?44)?[1-9]\d{9,10}$/, // UK numbers
    INTERNATIONAL: /^\+?[1-9]\d{1,14}$/ // E.164 format
  };

  const pattern = patterns[country] || patterns.INTERNATIONAL;

  if (!pattern.test(phone)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid phone number' 
    };
  }

  return { isValid: true, error: null };
};

/**
 * URL validation
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateURL = (url, options = {}) => {
  const { required = false, allowHTTP = true } = options;

  if (!url || !url.trim()) {
    return { 
      isValid: !required, 
      error: required ? 'URL is required' : null 
    };
  }

  try {
    const urlObj = new URL(url);
    
    if (!allowHTTP && urlObj.protocol === 'http:') {
      return { 
        isValid: false, 
        error: 'Only HTTPS URLs are allowed' 
      };
    }

    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { 
        isValid: false, 
        error: 'URL must start with http:// or https://' 
      };
    }

    return { isValid: true, error: null };
  } catch (err) {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Credit card validation (Luhn algorithm)
 * @param {string} cardNumber - Credit card number
 * @returns {Object} - { isValid: boolean, error: string, type: string }
 */
export const validateCreditCard = (cardNumber) => {
  if (!cardNumber || !cardNumber.trim()) {
    return { isValid: false, error: 'Card number is required', type: null };
  }

  const cleaned = cardNumber.replace(/\s/g, '');

  if (!/^\d+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number must contain only digits', type: null };
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  const isValid = sum % 10 === 0;

  // Detect card type
  let type = 'unknown';
  if (/^4/.test(cleaned)) type = 'visa';
  else if (/^5[1-5]/.test(cleaned)) type = 'mastercard';
  else if (/^3[47]/.test(cleaned)) type = 'amex';
  else if (/^6(?:011|5)/.test(cleaned)) type = 'discover';

  return { 
    isValid, 
    error: isValid ? null : 'Invalid card number', 
    type 
  };
};

/**
 * Date validation
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateDate = (date, options = {}) => {
  const { 
    minDate = null, 
    maxDate = null, 
    futureOnly = false,
    pastOnly = false 
  } = options;

  if (!date) {
    return { isValid: false, error: 'Date is required' };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  const now = new Date();

  if (futureOnly && dateObj <= now) {
    return { isValid: false, error: 'Date must be in the future' };
  }

  if (pastOnly && dateObj >= now) {
    return { isValid: false, error: 'Date must be in the past' };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return { isValid: false, error: `Date must be after ${new Date(minDate).toLocaleDateString()}` };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return { isValid: false, error: `Date must be before ${new Date(maxDate).toLocaleDateString()}` };
  }

  return { isValid: true, error: null };
};

/**
 * Age validation
 * @param {string|Date} birthDate - Birth date
 * @param {number} minAge - Minimum age required
 * @returns {Object} - { isValid: boolean, error: string, age: number }
 */
export const validateAge = (birthDate, minAge = 18) => {
  if (!birthDate) {
    return { isValid: false, error: 'Birth date is required', age: null };
  }

  const birthDateObj = new Date(birthDate);
  const today = new Date();
  
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }

  if (age < minAge) {
    return { 
      isValid: false, 
      error: `You must be at least ${minAge} years old`, 
      age 
    };
  }

  return { isValid: true, error: null, age };
};

/**
 * Required field validation
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateRequired = (value, fieldName = 'This field') => {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value === 'string' && !value.trim()) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: `${fieldName} must have at least one item` };
  }

  return { isValid: true, error: null };
};

/**
 * Length validation
 * @param {string|Array} value - Value to validate
 * @param {number} min - Minimum length
 * @param {number} max - Maximum length
 * @param {string} fieldName - Field name for error message
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateLength = (value, min, max, fieldName = 'This field') => {
  if (!value) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const length = typeof value === 'string' ? value.length : value.length;

  if (min && length < min) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${min} characters` 
    };
  }

  if (max && length > max) {
    return { 
      isValid: false, 
      error: `${fieldName} must not exceed ${max} characters` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Number validation
 * @param {any} value - Value to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateNumber = (value, options = {}) => {
  const { 
    min = null, 
    max = null, 
    integer = false, 
    positive = false 
  } = options;

  if (value === null || value === undefined || value === '') {
    return { isValid: false, error: 'Number is required' };
  }

  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' };
  }

  if (integer && !Number.isInteger(num)) {
    return { isValid: false, error: 'Must be a whole number' };
  }

  if (positive && num <= 0) {
    return { isValid: false, error: 'Must be a positive number' };
  }

  if (min !== null && num < min) {
    return { isValid: false, error: `Must be at least ${min}` };
  }

  if (max !== null && num > max) {
    return { isValid: false, error: `Must not exceed ${max}` };
  }

  return { isValid: true, error: null };
};

/**
 * File validation
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options;

  if (!file) {
    return { isValid: false, error: 'File is required' };
  }

  if (maxSize && file.size > maxSize) {
    const sizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    return { 
      isValid: false, 
      error: `File size must not exceed ${sizeMB}MB` 
    };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type must be one of: ${allowedTypes.join(', ')}` 
    };
  }

  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return { 
        isValid: false, 
        error: `File extension must be one of: ${allowedExtensions.join(', ')}` 
      };
    }
  }

  return { isValid: true, error: null };
};

/**
 * Validate entire form
 * @param {Object} formData - Form data object
 * @param {Object} validationRules - Validation rules object
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  Object.keys(validationRules).forEach(fieldName => {
    const rules = validationRules[fieldName];
    const value = formData[fieldName];

    for (const rule of rules) {
      const result = rule.validator(value, rule.options);
      
      if (!result.isValid) {
        errors[fieldName] = result.error;
        isValid = false;
        break; // Stop at first error for this field
      }
    }
  });

  return { isValid, errors };
};

/**
 * Common validation rules presets
 */
export const validationRules = {
  email: (value) => validateEmail(value),
  password: (value) => validatePassword(value),
  required: (value, fieldName) => validateRequired(value, fieldName),
  phone: (value) => validatePhone(value),
  url: (value) => validateURL(value),
  name: (value) => validateName(value)
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhone,
  validateURL,
  validateCreditCard,
  validateDate,
  validateAge,
  validateRequired,
  validateLength,
  validateNumber,
  validateFile,
  validateForm,
  validationRules
};