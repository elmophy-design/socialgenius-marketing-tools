import { useState, useCallback } from 'react';
import { toolsApi, authApi, userApi } from './toolsApi';

// Custom hook for API calls with loading and error states
export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const callApi = useCallback(async (apiFunction, ...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result.data);
      return result;
    } catch (err) {
      setError({
        message: err.message,
        status: err.status,
        code: err.code,
        timestamp: err.timestamp
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    callApi,
    reset,
    setData
  };
};

// Hook for specific tool APIs
export const useToolApi = (toolName) => {
  const api = useApi();

  const generate = useCallback(async (data) => {
    const apiMap = {
      'ad-copy': toolsApi.generateAdCopy,
      'headline-analyzer': toolsApi.analyzeHeadline,
      'seo-meta': toolsApi.generateSEOMeta,
      'email-tester': toolsApi.testEmailSubject,
      'content-idea': toolsApi.generateContentIdea,
      'funnel-builder': toolsApi.buildFunnel,
      'social-media': toolsApi.generateSocialMedia,
      'value-prop': toolsApi.generateValueProp
    };

    const apiFunction = apiMap[toolName];
    if (!apiFunction) {
      throw new Error(`No API function found for tool: ${toolName}`);
    }

    return api.callApi(apiFunction, data);
  }, [toolName, api]);

  return {
    ...api,
    generate
  };
};

// Hook for authentication
export const useAuthApi = () => {
  const api = useApi();

  const login = useCallback(async (credentials) => {
    return api.callApi(authApi.login, credentials);
  }, [api]);

  const signup = useCallback(async (userData) => {
    return api.callApi(authApi.signup, userData);
  }, [api]);

  const logout = useCallback(() => {
    authApi.logout();
    api.reset();
  }, [api]);

  const getCurrentUser = useCallback(async () => {
    return api.callApi(authApi.getCurrentUser);
  }, [api]);

  return {
    ...api,
    login,
    signup,
    logout,
    getCurrentUser
  };
};

// Hook for user data
export const useUserApi = () => {
  const api = useApi();

  const getSavedItems = useCallback(async (toolName) => {
    return api.callApi(userApi.getSavedItems, toolName);
  }, [api]);

  const saveItem = useCallback(async (toolName, data) => {
    return api.callApi(userApi.saveItem, toolName, data);
  }, [api]);

  const getActivity = useCallback(async (params) => {
    return api.callApi(userApi.getActivity, params);
  }, [api]);

  return {
    ...api,
    getSavedItems,
    saveItem,
    getActivity
  };
};