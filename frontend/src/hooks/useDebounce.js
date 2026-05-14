import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for debouncing values
 * Delays updating the value until after the specified delay has passed
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clear timeout if value changes or component unmounts
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Custom hook for debouncing callback functions
 * Useful for search inputs, API calls, etc.
 */
export const useDebouncedCallback = (callback, delay = 500, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Cancel function to manually cancel pending debounced calls
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Flush function to immediately execute pending debounced calls
  const flush = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      callbackRef.current(...args);
    }
  }, []);

  return [debouncedCallback, cancel, flush];
};

/**
 * Custom hook for debounced search with loading state
 * Perfect for search inputs with API calls
 */
export const useDebouncedSearch = (searchFunction, delay = 500) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, delay);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedSearchTerm.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const searchResults = await searchFunction(debouncedSearchTerm);
        setResults(searchResults);
      } catch (err) {
        setError(err.message || 'Search failed');
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [debouncedSearchTerm, searchFunction]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    clearSearch
  };
};

/**
 * Custom hook for debouncing with immediate first call
 * Executes immediately on first call, then debounces subsequent calls
 */
export const useDebouncedCallbackImmediate = (callback, delay = 500, deps = []) => {
  const timeoutRef = useRef(null);
  const callbackRef = useRef(callback);
  const isFirstCall = useRef(true);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args) => {
    // Execute immediately on first call
    if (isFirstCall.current) {
      callbackRef.current(...args);
      isFirstCall.current = false;
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay, ...deps]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const reset = useCallback(() => {
    isFirstCall.current = true;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  return [debouncedCallback, reset];
};

/**
 * Custom hook for input debouncing with controlled component pattern
 * Returns both immediate and debounced values
 */
export const useDebouncedInput = (initialValue = '', delay = 500) => {
  const [immediateValue, setImmediateValue] = useState(initialValue);
  const [debouncedValue, setDebouncedValue] = useState(initialValue);
  const timeoutRef = useRef(null);

  const setValue = useCallback((value) => {
    const newValue = typeof value === 'function' ? value(immediateValue) : value;
    
    setImmediateValue(newValue);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
    }, delay);
  }, [delay, immediateValue]);

  const reset = useCallback(() => {
    setImmediateValue(initialValue);
    setDebouncedValue(initialValue);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [initialValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    value: immediateValue,
    debouncedValue,
    setValue,
    reset,
    isPending: immediateValue !== debouncedValue
  };
};

export default useDebounce;