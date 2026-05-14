const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create a global API configuration
const apiConfig = {
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout for AI calls
  retryAttempts: 2,
  retryDelay: 1000
};

// Create axios-like fetch wrapper with better error handling
class ApiClient {
  constructor(config) {
    this.config = config;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  // Add request interceptor
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  // Add response interceptor
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  // Main request method
  async request(endpoint, method = 'GET', data = null, options = {}) {
    const url = `${this.config.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    // Apply request interceptors
    let requestConfig = { method, headers };
    for (const interceptor of this.requestInterceptors) {
      requestConfig = await interceptor(requestConfig);
    }

    // Add token if exists
    const token = localStorage.getItem('token');
    if (token) {
      requestConfig.headers['Authorization'] = `Bearer ${token}`;
    }

    if (data && method !== 'GET') {
      requestConfig.body = JSON.stringify(data);
    }

    let attempts = 0;
    const maxAttempts = options.retryAttempts || this.config.retryAttempts;

    while (attempts <= maxAttempts) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.config.timeout);
        
        const response = await fetch(url, {
          ...requestConfig,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // Handle response
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          result = await response.text();
        }

        // Apply response interceptors
        let processedResult = result;
        for (const interceptor of this.responseInterceptors) {
          processedResult = await interceptor(processedResult, response);
        }

        if (!response.ok) {
          const error = new Error(processedResult.message || processedResult.error || 'API request failed');
          error.status = response.status;
          error.data = processedResult;
          throw error;
        }

        return {
          success: true,
          data: processedResult.data || processedResult,
          timestamp: new Date().toISOString(),
          status: response.status
        };

      } catch (error) {
        attempts++;
        
        // Don't retry on certain errors
        if (
          error.name === 'AbortError' || 
          error.status === 400 || 
          error.status === 401 || 
          error.status === 403 ||
          attempts > maxAttempts
        ) {
          throw this.formatError(error);
        }

        // Wait before retry
        await new Promise(resolve => 
          setTimeout(resolve, this.config.retryDelay)
        );
      }
    }
  }

  formatError(error) {
    const formattedError = new Error(
      error.message || 'An unexpected error occurred'
    );
    
    formattedError.status = error.status || 500;
    formattedError.code = error.code || 'API_ERROR';
    formattedError.timestamp = new Date().toISOString();
    
    // Common error messages based on status
    if (error.status === 401) {
      formattedError.message = 'Authentication required. Please login again.';
      formattedError.code = 'AUTH_REQUIRED';
      // Auto logout on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } else if (error.status === 429) {
      formattedError.message = 'Too many requests. Please try again later.';
      formattedError.code = 'RATE_LIMIT';
    } else if (error.name === 'AbortError') {
      formattedError.message = 'Request timeout. Please check your connection.';
      formattedError.code = 'TIMEOUT';
    }

    return formattedError;
  }

  // HTTP method shortcuts
  get(endpoint, options = {}) {
    return this.request(endpoint, 'GET', null, options);
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, 'POST', data, options);
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, 'PUT', data, options);
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, 'DELETE', null, options);
  }
}

// Create API client instance
const apiClient = new ApiClient(apiConfig);

// Add request interceptor for adding auth token
apiClient.addRequestInterceptor(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
  }
  
  // Add request ID for tracking
  config.headers['X-Request-ID'] = Date.now() + Math.random().toString(36).substr(2, 9);
  
  return config;
});

// Add response interceptor for handling common responses
apiClient.addResponseInterceptor(async (result, response) => {
  // Log API calls in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`API Response [${response.status}]:`, result);
  }

  // Handle rate limiting
  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    if (retryAfter) {
      console.warn(`Rate limited. Retry after ${retryAfter} seconds`);
    }
  }

  return result;
});

// ========== TOOLS API FUNCTIONS ==========

export const toolsApi = {
  // 1. AD COPY GENERATOR (Enhanced with AI)
  generateAdCopy: async (data) => {
    return apiClient.post('/tools/ad-copy/generate', data, {
      timeout: 45000 // 45 seconds for AI generation
    });
  },

  saveAdCopy: async (data) => {
    return apiClient.post('/tools/ad-copy/save', data);
  },

  getAdCopyHistory: async (userId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tools/ad-copy/history/${userId}?${query}`);
  },

  // 2. HEADLINE ANALYZER (With real AI scoring)
  analyzeHeadline: async (data) => {
    return apiClient.post('/tools/headline-analyzer/analyze', data, {
      timeout: 30000
    });
  },

  getHeadlineScores: async (headlineId) => {
    return apiClient.get(`/tools/headline-analyzer/scores/${headlineId}`);
  },

  // 3. SEO META GENERATOR (With keyword research)
  generateSEOMeta: async (data) => {
    return apiClient.post('/tools/seo-meta/generate', data, {
      timeout: 35000
    });
  },

  analyzeKeywords: async (keywords) => {
    return apiClient.post('/tools/seo-meta/analyze-keywords', { keywords });
  },

  // 4. EMAIL SUBJECT TESTER (With A/B testing)
  testEmailSubject: async (data) => {
    return apiClient.post('/tools/email-tester/test', data);
  },

  getEmailTestResults: async (testId) => {
    return apiClient.get(`/tools/email-tester/results/${testId}`);
  },

  createABTest: async (data) => {
    return apiClient.post('/tools/email-tester/ab-test', data);
  },

  // 5. CONTENT IDEA GENERATOR (With AI brainstorming)
  generateContentIdea: async (data) => {
    return apiClient.post('/tools/content-idea/generate', data, {
      timeout: 40000
    });
  },

  getContentIdeas: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tools/content-idea/list?${query}`);
  },

  // 6. FUNNEL BUILDER (With template system)
  buildFunnel: async (data) => {
    return apiClient.post('/tools/funnel-builder/create', data, {
      timeout: 50000
    });
  },

  getFunnelTemplates: async () => {
    return apiClient.get('/tools/funnel-builder/templates');
  },

  saveFunnel: async (data) => {
    return apiClient.post('/tools/funnel-builder/save', data);
  },

  // 7. SOCIAL MEDIA GENERATOR (With scheduling)
  generateSocialMedia: async (data) => {
    return apiClient.post('/tools/social-media/generate', data, {
      timeout: 35000
    });
  },

  schedulePost: async (data) => {
    return apiClient.post('/social/schedule', data, {
      timeout: 30000
    });
  },

  getScheduledPosts: async (params = {}) => {
    return apiClient.get('/social/scheduled');
  },

  retryScheduledPost: async (jobId) => {
    return apiClient.post(`/social/scheduled/${jobId}/retry`, {});
  },

  deleteScheduledPost: async (jobId) => {
    return apiClient.delete(`/social/scheduled/${jobId}`);
  },

  getSocialConnections: async () => {
    const result = await apiClient.get('/social/connections');
    return {
      ...result,
      data: {
        connections: result.data?.connections || result.data?.data?.connections || [],
      },
    };
  },

  getSocialProviders: async () => {
    const result = await apiClient.get('/social/providers');
    return {
      ...result,
      data: result.data?.data || [],
    };
  },

  startSocialOAuth: async (platform) => {
    if (!['facebook', 'instagram', 'linkedin', 'twitter', 'tiktok', 'pinterest', 'youtube'].includes(platform)) {
      throw new Error(`${platform} live connection is not configured yet.`);
    }
    const endpointMap = {
      facebook: '/social/connect/meta',
      instagram: '/social/connect/meta',
      linkedin: '/social/connect/linkedin',
      twitter: '/social/connect/twitter',
      tiktok: '/social/connect/tiktok',
      pinterest: '/social/connect/pinterest',
      youtube: '/social/connect/youtube',
    };
    const endpoint = endpointMap[platform];
    return apiClient.get(endpoint);
  },

  connectSocialAccount: async (data) => {
    const result = await apiClient.post('/users/connected-accounts', data);
    return {
      ...result,
      data: result.data?.connectedAccounts || [],
    };
  },

  disconnectSocialAccount: async (platform, accountId) => {
    return apiClient.delete(`/social/connections/${platform}/${accountId}`);
  },

  getGeneratedPosts: async () => {
    const result = await apiClient.get('/tools/social-media/content');
    return {
      ...result,
      data: result.data?.content || [],
    };
  },

  saveSocialPosts: async (data) => {
    return {
      success: true,
      data: {
        saved: true,
        count: Array.isArray(data?.posts) ? data.posts.length : 0,
      },
    };
  },

  // 8. VALUE PROPOSITION GENERATOR (Enhanced)
  generateValueProp: async (data) => {
    return apiClient.post('/tools/value-prop/generate', data);
  },

  // Get all tools with status
  getAllTools: async () => {
    return apiClient.get('/tools/list');
  },

  // Tool analytics
  getToolAnalytics: async (toolName, period = 'week') => {
    return apiClient.get(`/tools/analytics/${toolName}?period=${period}`);
  },

  // User tool usage
  getUserToolUsage: async () => {
    return apiClient.get('/tools/usage');
  }
};

// ========== AUTH API FUNCTIONS ==========

export const authApi = {
  login: async (data) => {
    const result = await apiClient.post('/auth/login', data);
    
    // Store token and user data
    if (result.data.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
      
      // Update API client with new token
      apiClient.addRequestInterceptor(async (config) => {
        config.headers['Authorization'] = `Bearer ${result.data.token}`;
        return config;
      });
    }
    
    return result;
  },

  signup: async (data) => {
    const result = await apiClient.post('/auth/signup', data);
    
    // Auto login after signup
    if (result.data.token) {
      localStorage.setItem('token', result.data.token);
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any pending requests
    // You might want to implement request cancellation here
  },

  refreshToken: async () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
      const result = await apiClient.post('/auth/refresh-token', { token });
      
      if (result.data.token) {
        localStorage.setItem('token', result.data.token);
        return result.data.token;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      authApi.logout();
      return null;
    }
  },

  getCurrentUser: async () => {
    try {
      const result = await apiClient.get('/auth/me');
      return result;
    } catch (error) {
      if (error.status === 401) {
        authApi.logout();
      }
      throw error;
    }
  },

  updateProfile: async (data) => {
    const result = await apiClient.put('/auth/profile', data);
    
    if (result.data.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user));
    }
    
    return result;
  }
};

// ========== USER DATA API ==========

export const userApi = {
  getSavedItems: async (toolName) => {
    return apiClient.get(`/user/saved/${toolName}`);
  },

  saveItem: async (toolName, data) => {
    return apiClient.post(`/user/save/${toolName}`, data);
  },

  deleteSavedItem: async (toolName, itemId) => {
    return apiClient.delete(`/user/saved/${toolName}/${itemId}`);
  },

  getActivity: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/user/activity?${query}`);
  },

  getUsageStats: async () => {
    return apiClient.get('/user/stats');
  }
};

// ========== UTILITY FUNCTIONS ==========

// Create a hook-like function for API calls with loading state
export const useApiCall = () => {
  return {
    call: async (apiFunction, ...args) => {
      try {
        return await apiFunction(...args);
      } catch (error) {
        throw error;
      }
    }
  };
};

// API health check
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
};

// Named convenience exports for common tool functions (backwards compatible)
export const generateAdCopy = (...args) => toolsApi.generateAdCopy(...args);
export const saveAdCopy = (...args) => toolsApi.saveAdCopy(...args);
export const getUserAdCopies = (...args) => toolsApi.getAdCopyHistory(...args);

// Export everything
const toolsDefaultExport = {
  apiClient,
  toolsApi,
  authApi,
  userApi,
  checkApiHealth
};

export default toolsDefaultExport;
