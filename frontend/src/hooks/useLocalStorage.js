import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for managing localStorage with React state synchronization
 * Automatically syncs state with localStorage and handles JSON serialization
 */
export const useLocalStorage = (key, initialValue) => {
  // State to store our value
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  /**
   * Return a wrapped version of useState's setter function that
   * persists the new value to localStorage
   */
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (valueToStore === undefined || valueToStore === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  /**
   * Remove the item from localStorage
   */
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  /**
   * Get the current value from localStorage (useful for reading without re-rendering)
   */
  const getValue = useCallback(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error getting localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  /**
   * Listen to storage events from other tabs/windows
   */
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      } else if (e.key === key && e.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    // Listen for changes in other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue, getValue];
};

/**
 * Hook for managing multiple localStorage items
 */
export const useLocalStorageMultiple = (items) => {
  const [values, setValues] = useState(() => {
    const initialValues = {};
    
    Object.entries(items).forEach(([key, defaultValue]) => {
      try {
        const item = window.localStorage.getItem(key);
        initialValues[key] = item ? JSON.parse(item) : defaultValue;
      } catch (error) {
        console.error(`Error loading localStorage key "${key}":`, error);
        initialValues[key] = defaultValue;
      }
    });
    
    return initialValues;
  });

  const setMultipleValues = useCallback((updates) => {
    setValues((prev) => {
      const newValues = { ...prev, ...updates };
      
      Object.entries(updates).forEach(([key, value]) => {
        try {
          if (value === undefined || value === null) {
            window.localStorage.removeItem(key);
          } else {
            window.localStorage.setItem(key, JSON.stringify(value));
          }
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error);
        }
      });
      
      return newValues;
    });
  }, []);

  const removeMultipleValues = useCallback((keys) => {
    keys.forEach((key) => {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
      }
    });
    
    setValues((prev) => {
      const newValues = { ...prev };
      keys.forEach((key) => {
        newValues[key] = items[key];
      });
      return newValues;
    });
  }, [items]);

  return [values, setMultipleValues, removeMultipleValues];
};

/**
 * Hook for localStorage with expiration
 */
export const useLocalStorageWithExpiry = (key, initialValue, expiryInMinutes = 60) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      
      if (!item) return initialValue;
      
      const parsed = JSON.parse(item);
      const now = new Date();
      
      // Check if expired
      if (parsed.expiry && now.getTime() > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }
      
      return parsed.value;
    } catch (error) {
      console.error(`Error loading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      
      const now = new Date();
      const item = {
        value: valueToStore,
        expiry: now.getTime() + (expiryInMinutes * 60 * 1000)
      };
      
      window.localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, expiryInMinutes, storedValue]);

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;