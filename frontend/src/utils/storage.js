/**
 * Client-side storage utilities
 * Enhanced localStorage and sessionStorage helpers with type safety and encryption support
 */

/**
 * Storage class for managing localStorage/sessionStorage
 */
class StorageManager {
  constructor(storageType = 'localStorage') {
    this.storage = storageType === 'sessionStorage' ? window.sessionStorage : window.localStorage;
    this.prefix = 'socialgenius_'; // App prefix to avoid conflicts
  }

  /**
   * Get item from storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} - Stored value or default
   */
  get(key, defaultValue = null) {
    try {
      const prefixedKey = this.prefix + key;
      const item = this.storage.getItem(prefixedKey);

      if (item === null) {
        return defaultValue;
      }

      const parsed = JSON.parse(item);

      // Check for expiration
      if (parsed.expiry && Date.now() > parsed.expiry) {
        this.remove(key);
        return defaultValue;
      }

      return parsed.value;
    } catch (error) {
      console.error(`Error getting item from storage: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * Set item in storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   * @param {number} expiryMinutes - Optional expiry time in minutes
   */
  set(key, value, expiryMinutes = null) {
    try {
      const prefixedKey = this.prefix + key;
      const item = {
        value,
        timestamp: Date.now(),
        expiry: expiryMinutes ? Date.now() + expiryMinutes * 60 * 1000 : null
      };

      this.storage.setItem(prefixedKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error setting item in storage: ${key}`, error);
      
      // Handle quota exceeded error
      if (error.name === 'QuotaExceededError') {
        console.warn('Storage quota exceeded, attempting to clear old items...');
        this.clearExpired();
        
        // Try again
        try {
          this.storage.setItem(this.prefix + key, JSON.stringify({ value, timestamp: Date.now() }));
          return true;
        } catch (retryError) {
          console.error('Failed to set item after clearing expired items', retryError);
        }
      }
      
      return false;
    }
  }

  /**
   * Remove item from storage
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      const prefixedKey = this.prefix + key;
      this.storage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Error removing item from storage: ${key}`, error);
      return false;
    }
  }

  /**
   * Check if key exists in storage
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  has(key) {
    const prefixedKey = this.prefix + key;
    return this.storage.getItem(prefixedKey) !== null;
  }

  /**
   * Clear all storage items with app prefix
   */
  clear() {
    try {
      const keys = Object.keys(this.storage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          this.storage.removeItem(key);
        }
      });
      return true;
    } catch (error) {
      console.error('Error clearing storage', error);
      return false;
    }
  }

  /**
   * Clear expired items
   */
  clearExpired() {
    try {
      const keys = Object.keys(this.storage);
      const now = Date.now();

      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(this.storage.getItem(key));
            if (item.expiry && now > item.expiry) {
              this.storage.removeItem(key);
            }
          } catch (e) {
            // Invalid JSON, remove it
            this.storage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.error('Error clearing expired items', error);
    }
  }

  /**
   * Get all keys with app prefix
   * @returns {Array} - Array of keys
   */
  getAllKeys() {
    try {
      const keys = Object.keys(this.storage);
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting all keys', error);
      return [];
    }
  }

  /**
   * Get storage size in bytes
   * @returns {number} - Storage size
   */
  getSize() {
    try {
      let size = 0;
      const keys = Object.keys(this.storage);
      
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          const item = this.storage.getItem(key);
          size += item.length + key.length;
        }
      });
      
      return size;
    } catch (error) {
      console.error('Error calculating storage size', error);
      return 0;
    }
  }

  /**
   * Get formatted storage size
   * @returns {string} - Formatted size (e.g., "1.2 KB")
   */
  getFormattedSize() {
    const bytes = this.getSize();
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  /**
   * Check if storage is available
   * @returns {boolean}
   */
  isAvailable() {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple items at once
   * @param {Array} keys - Array of keys
   * @returns {Object} - Object with key-value pairs
   */
  getMultiple(keys) {
    const result = {};
    keys.forEach(key => {
      result[key] = this.get(key);
    });
    return result;
  }

  /**
   * Set multiple items at once
   * @param {Object} items - Object with key-value pairs
   */
  setMultiple(items) {
    Object.entries(items).forEach(([key, value]) => {
      this.set(key, value);
    });
  }

  /**
   * Remove multiple items at once
   * @param {Array} keys - Array of keys to remove
   */
  removeMultiple(keys) {
    keys.forEach(key => {
      this.remove(key);
    });
  }

  /**
   * Update existing item (merge objects)
   * @param {string} key - Storage key
   * @param {Object} updates - Updates to merge
   */
  update(key, updates) {
    const current = this.get(key);
    
    if (current && typeof current === 'object' && !Array.isArray(current)) {
      this.set(key, { ...current, ...updates });
    } else {
      this.set(key, updates);
    }
  }

  /**
   * Export storage data
   * @returns {Object} - All storage data
   */
  export() {
    const data = {};
    const keys = this.getAllKeys();
    
    keys.forEach(key => {
      data[key] = this.get(key);
    });
    
    return data;
  }

  /**
   * Import storage data
   * @param {Object} data - Data to import
   * @param {boolean} clearFirst - Clear existing data first
   */
  import(data, clearFirst = false) {
    if (clearFirst) {
      this.clear();
    }
    
    Object.entries(data).forEach(([key, value]) => {
      this.set(key, value);
    });
  }
}

// Create singleton instances
export const localStorage = new StorageManager('localStorage');
export const sessionStorage = new StorageManager('sessionStorage');

/**
 * Cookie management utilities
 */
export const cookies = {
  /**
   * Set cookie
   * @param {string} name - Cookie name
   * @param {string} value - Cookie value
   * @param {number} days - Expiry in days
   * @param {Object} options - Additional options
   */
  set(name, value, days = 7, options = {}) {
    const { path = '/', secure = true, sameSite = 'Strict' } = options;
    
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `; expires=${date.toUTCString()}`;
    }
    
    const secureFlag = secure ? '; Secure' : '';
    const sameSiteFlag = sameSite ? `; SameSite=${sameSite}` : '';
    
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}${secureFlag}${sameSiteFlag}`;
  },

  /**
   * Get cookie
   * @param {string} name - Cookie name
   * @returns {string|null} - Cookie value
   */
  get(name) {
    const nameEQ = name + '=';
    const ca = document.cookie.split(';');
    
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length, c.length));
      }
    }
    
    return null;
  },

  /**
   * Remove cookie
   * @param {string} name - Cookie name
   * @param {Object} options - Additional options
   */
  remove(name, options = {}) {
    this.set(name, '', -1, options);
  },

  /**
   * Check if cookie exists
   * @param {string} name - Cookie name
   * @returns {boolean}
   */
  has(name) {
    return this.get(name) !== null;
  }
};

/**
 * Simple encryption/decryption for sensitive data
 * Note: This is basic obfuscation, not true encryption
 */
export const secureStorage = {
  /**
   * Encrypt and store data
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  set(key, value) {
    try {
      const encrypted = btoa(JSON.stringify(value));
      localStorage.set(key, encrypted);
    } catch (error) {
      console.error('Error encrypting data', error);
    }
  },

  /**
   * Retrieve and decrypt data
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value
   * @returns {any} - Decrypted value
   */
  get(key, defaultValue = null) {
    try {
      const encrypted = localStorage.get(key);
      if (!encrypted) return defaultValue;
      
      const decrypted = JSON.parse(atob(encrypted));
      return decrypted;
    } catch (error) {
      console.error('Error decrypting data', error);
      return defaultValue;
    }
  },

  /**
   * Remove encrypted data
   * @param {string} key - Storage key
   */
  remove(key) {
    localStorage.remove(key);
  }
};

/**
 * Memory storage (for sensitive data that shouldn't persist)
 */
class MemoryStorage {
  constructor() {
    this.data = new Map();
  }

  set(key, value) {
    this.data.set(key, value);
  }

  get(key, defaultValue = null) {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }

  remove(key) {
    this.data.delete(key);
  }

  clear() {
    this.data.clear();
  }

  has(key) {
    return this.data.has(key);
  }
}

export const memoryStorage = new MemoryStorage();

export default {
  localStorage,
  sessionStorage,
  cookies,
  secureStorage,
  memoryStorage
};