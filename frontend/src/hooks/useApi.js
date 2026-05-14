import { useState, useCallback } from 'react';
import axios from 'axios';

/**
 * Generic API call wrapper hook with loading, error, and data states
 * Provides a reusable pattern for all API interactions
 */
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  /**
   * Execute API call with automatic loading and error handling
   * @param {Function} apiFunction - The API function to call
   * @param {Object} options - Configuration options
   */
  const execute = useCallback(async (apiFunction, options = {}) => {
    const {
      onSuccess,
      onError,
      showLoading = true,
      resetError = true,
      resetData = false
    } = options;

    if (showLoading) setLoading(true);
    if (resetError) setError(null);
    if (resetData) setData(null);

    try {
      const result = await apiFunction();

      if (result.success) {
        setData(result.data);
        onSuccess?.({success: true, data: result.data});
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Operation failed';
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An unexpected error occurred';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /**
   * Execute multiple API calls in parallel
   */
  const executeMultiple = useCallback(async (apiFunctions, options = {}) => {
    const { onSuccess, onError, showLoading = true } = options;

    if (showLoading) setLoading(true);
    setError(null);

    try {
      const promises = apiFunctions.map(fn => fn());
      const results = await Promise.all(promises);

      const allSuccessful = results.every(r => r.success);

      if (allSuccessful) {
        const combinedData = results.map(r => r.data);
        setData(combinedData);
        onSuccess?.(combinedData);
        return { success: true, data: combinedData };
      } else {
        const errors = results.filter(r => !r.success).map(r => r.error);
        const errorMessage = errors.join(', ');
        setError(errorMessage);
        onError?.(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.message || 'Multiple API calls failed';
      setError(errorMessage);
      onError?.(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  /**
   * Execute API call with retry logic
   */
  const executeWithRetry = useCallback(async (
    apiFunction,
    maxRetries = 3,
    retryDelay = 1000,
    options = {}
  ) => {
    let attempt = 0;
    let lastError;

    while (attempt < maxRetries) {
      try {
        const result = await execute(apiFunction, { ...options, showLoading: attempt === 0 });
        
        if (result.success) {
          return result;
        }
        
        lastError = result.error;
        attempt++;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      } catch (err) {
        lastError = err.message;
        attempt++;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
        }
      }
    }

    setError(lastError || 'Operation failed after retries');
    return { success: false, error: lastError };
  }, [execute]);

  /**
   * Reset all states
   */
  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  /**
   * Make a GET request
   */
  const get = useCallback(async (url, config = {}) => {
    return execute(() => axios.get(url, config));
  }, [execute]);

  /**
   * Make a POST request
   */
  const post = useCallback(async (url, data, config = {}) => {
    return execute(() => axios.post(url, data, config));
  }, [execute]);

  /**
   * Make a PUT request
   */
  const put = useCallback(async (url, data, config = {}) => {
    return execute(() => axios.put(url, data, config));
  }, [execute]);

  /**
   * Make a DELETE request
   */
  const del = useCallback(async (url, config = {}) => {
    return execute(() => axios.delete(url, config));
  }, [execute]);

  /**
   * Make a PATCH request
   */
  const patch = useCallback(async (url, data, config = {}) => {
    return execute(() => axios.patch(url, data, config));
  }, [execute]);

  return {
    // State
    loading,
    error,
    data,
    
    // Core methods
    execute,
    executeMultiple,
    executeWithRetry,
    
    // HTTP methods
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilities
    reset,
    setError,
    setData,
    setLoading
  };
};

export default useApi;