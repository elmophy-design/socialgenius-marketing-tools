/**
 * Client-side formatting utilities
 * Date, currency, number, text formatting functions
 */

/**
 * Format date to various formats
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'default') => {
  if (!date) return '';

  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const formats = {
    default: { month: 'short', day: 'numeric', year: 'numeric' }, // Dec 22, 2025
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }, // Monday, December 22, 2025
    short: { month: 'numeric', day: 'numeric', year: '2-digit' }, // 12/22/25
    medium: { month: 'short', day: 'numeric' }, // Dec 22
    time: { hour: '2-digit', minute: '2-digit' }, // 03:45 PM
    datetime: { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }, // Dec 22, 03:45 PM
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' },
    iso: null // Will use toISOString
  };

  if (format === 'iso') {
    return dateObj.toISOString();
  }

  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }

  const options = formats[format] || formats.default;
  
  try {
    return new Intl.DateTimeFormat('en-US', options).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return dateObj.toLocaleDateString();
  }
};

/**
 * Format date as relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - Date to format
 * @returns {string} - Relative time string
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';

  const dateObj = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now - dateObj) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths = Math.floor(diffInDays / 30);
  const diffInYears = Math.floor(diffInDays / 365);

  // Future dates
  if (diffInSeconds < 0) {
    const absDiff = Math.abs(diffInSeconds);
    if (absDiff < 60) return 'in a few seconds';
    if (absDiff < 3600) return `in ${Math.abs(diffInMinutes)} ${Math.abs(diffInMinutes) === 1 ? 'minute' : 'minutes'}`;
    if (absDiff < 86400) return `in ${Math.abs(diffInHours)} ${Math.abs(diffInHours) === 1 ? 'hour' : 'hours'}`;
    if (absDiff < 604800) return `in ${Math.abs(diffInDays)} ${Math.abs(diffInDays) === 1 ? 'day' : 'days'}`;
    return formatDate(dateObj, 'medium');
  }

  // Past dates
  if (diffInSeconds < 60) return 'just now';
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
  if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? 'week' : 'weeks'} ago`;
  if (diffInMonths < 12) return `${diffInMonths} ${diffInMonths === 1 ? 'month' : 'months'} ago`;
  return `${diffInYears} ${diffInYears === 1 ? 'year' : 'years'} ago`;
};

/**
 * Format time duration (e.g., "2h 30m", "5m 23s")
 * @param {number} seconds - Duration in seconds
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted duration
 */
export const formatDuration = (seconds, options = {}) => {
  const { short = false, showSeconds = true } = options;

  if (!seconds || seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}${short ? 'h' : hours === 1 ? ' hour' : ' hours'}`);
  }

  if (minutes > 0 || (hours > 0 && secs > 0)) {
    parts.push(`${minutes}${short ? 'm' : minutes === 1 ? ' minute' : ' minutes'}`);
  }

  if (showSeconds && (secs > 0 || parts.length === 0)) {
    parts.push(`${secs}${short ? 's' : secs === 1 ? ' second' : ' seconds'}`);
  }

  return parts.join(' ');
};

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: NGN)
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted currency string
 */
export const formatCurrency = (amount, currency = 'NGN', options = {}) => {
  const {
    locale = 'en-NG',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard' // 'standard', 'compact'
  } = options;

  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₦0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
      notation
    }).format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currency} ${amount.toFixed(2)}`;
  }
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted number
 */
export const formatNumber = (num, options = {}) => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard', // 'standard', 'scientific', 'engineering', 'compact'
    compactDisplay = 'short' // 'short', 'long'
  } = options;

  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      notation,
      compactDisplay
    }).format(num);
  } catch (error) {
    console.error('Number formatting error:', error);
    return num.toString();
  }
};

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} num - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Abbreviated number
 */
export const formatNumberAbbreviated = (num, decimals = 1) => {
  if (num === null || num === undefined || isNaN(num)) return '0';

  const absNum = Math.abs(num);

  if (absNum >= 1e12) {
    return (num / 1e12).toFixed(decimals) + 'T';
  }
  if (absNum >= 1e9) {
    return (num / 1e9).toFixed(decimals) + 'B';
  }
  if (absNum >= 1e6) {
    return (num / 1e6).toFixed(decimals) + 'M';
  }
  if (absNum >= 1e3) {
    return (num / 1e3).toFixed(decimals) + 'K';
  }

  return num.toString();
};

/**
 * Format percentage
 * @param {number} value - Value to format as percentage
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || isNaN(value)) return '0%';

  return `${value.toFixed(decimals)}%`;
};

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  if (!bytes) return 'N/A';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

/**
 * Format phone number
 * @param {string} phone - Phone number to format
 * @param {string} format - Format type
 * @returns {string} - Formatted phone number
 */
export const formatPhoneNumber = (phone, format = 'default') => {
  if (!phone) return '';

  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');

  if (format === 'nigerian') {
    // Nigerian format: +234 XXX XXX XXXX
    if (cleaned.startsWith('234')) {
      return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
    }
    if (cleaned.startsWith('0')) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
    }
  }

  if (format === 'us') {
    // US format: (XXX) XXX-XXXX
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }

  // Default: Add spaces every 3 digits
  return cleaned.replace(/(\d{3})(?=\d)/g, '$1 ');
};

/**
 * Format credit card number
 * @param {string} cardNumber - Card number to format
 * @returns {string} - Formatted card number
 */
export const formatCreditCard = (cardNumber) => {
  if (!cardNumber) return '';

  const cleaned = cardNumber.replace(/\s/g, '');
  
  // American Express: XXXX XXXXXX XXXXX
  if (/^3[47]/.test(cleaned)) {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }

  // Most cards: XXXX XXXX XXXX XXXX
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default: '...')
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;

  return text.substring(0, maxLength - suffix.length).trim() + suffix;
};

/**
 * Capitalize first letter of each word
 * @param {string} text - Text to capitalize
 * @returns {string} - Capitalized text
 */
export const capitalizeWords = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Convert to title case
 * @param {string} text - Text to convert
 * @returns {string} - Title cased text
 */
export const toTitleCase = (text) => {
  if (!text) return '';

  const smallWords = ['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'if', 'in', 'nor', 'of', 'on', 'or', 'so', 'the', 'to', 'up', 'yet'];

  return text
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      if (index === 0 || !smallWords.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    })
    .join(' ');
};

/**
 * Format slug (URL-friendly string)
 * @param {string} text - Text to convert to slug
 * @returns {string} - Slug
 */
export const formatSlug = (text) => {
  if (!text) return '';

  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Format initials from name
 * @param {string} name - Full name
 * @param {number} maxInitials - Maximum number of initials (default: 2)
 * @returns {string} - Initials
 */
export const formatInitials = (name, maxInitials = 2) => {
  if (!name) return '';

  return name
    .split(' ')
    .filter(word => word.length > 0)
    .slice(0, maxInitials)
    .map(word => word[0].toUpperCase())
    .join('');
};

/**
 * Format address
 * @param {Object} address - Address object
 * @returns {string} - Formatted address
 */
export const formatAddress = (address) => {
  if (!address) return '';

  const parts = [
    address.street,
    address.city,
    address.state,
    address.zipCode,
    address.country
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * Format time ago with precise units
 * @param {string|Date} date - Date to format
 * @returns {string} - Time ago string
 */
export const formatTimeAgo = (date) => {
  return formatRelativeTime(date);
};

/**
 * Format ordinal numbers (1st, 2nd, 3rd, etc.)
 * @param {number} num - Number to format
 * @returns {string} - Ordinal number
 */
export const formatOrdinal = (num) => {
  if (!num) return '';

  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) return num + 'st';
  if (j === 2 && k !== 12) return num + 'nd';
  if (j === 3 && k !== 13) return num + 'rd';
  return num + 'th';
};

/**
 * Format social media handle
 * @param {string} handle - Social media handle
 * @param {string} platform - Platform name
 * @returns {string} - Formatted handle
 */
export const formatSocialHandle = (handle, platform = 'twitter') => {
  if (!handle) return '';

  const cleaned = handle.replace(/^@/, '');

  const urls = {
    twitter: `https://twitter.com/${cleaned}`,
    instagram: `https://instagram.com/${cleaned}`,
    facebook: `https://facebook.com/${cleaned}`,
    linkedin: `https://linkedin.com/in/${cleaned}`,
    tiktok: `https://tiktok.com/@${cleaned}`,
    youtube: `https://youtube.com/@${cleaned}`
  };

  return urls[platform.toLowerCase()] || `@${cleaned}`;
};

/**
 * Mask sensitive data
 * @param {string} value - Value to mask
 * @param {string} type - Type of masking
 * @returns {string} - Masked value
 */
export const maskSensitiveData = (value, type = 'default') => {
  if (!value) return '';

  const masks = {
    email: (val) => {
      const [name, domain] = val.split('@');
      return `${name.slice(0, 2)}${'*'.repeat(name.length - 2)}@${domain}`;
    },
    phone: (val) => {
      const cleaned = val.replace(/\D/g, '');
      return `${'*'.repeat(cleaned.length - 4)}${cleaned.slice(-4)}`;
    },
    card: (val) => {
      const cleaned = val.replace(/\s/g, '');
      return `${'*'.repeat(cleaned.length - 4)} ${cleaned.slice(-4)}`;
    },
    default: (val) => `${'*'.repeat(val.length - 4)}${val.slice(-4)}`
  };

  const maskFn = masks[type] || masks.default;
  return maskFn(value);
};

export default {
  formatDate,
  formatRelativeTime,
  formatDuration,
  formatCurrency,
  formatNumber,
  formatNumberAbbreviated,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatCreditCard,
  truncateText,
  capitalizeWords,
  toTitleCase,
  formatSlug,
  formatInitials,
  formatAddress,
  formatTimeAgo,
  formatOrdinal,
  formatSocialHandle,
  maskSensitiveData
};