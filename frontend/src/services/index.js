// frontend/src/services/index.js
// Main export file for all services

import AuthService from './authService';
import ToolsService from './toolsService';
import SocialMediaService from './socialMediaService';
import SubscriptionService from './subscriptionService';
import NotificationService from './notificationService';

// API service configuration
const configureApiService = (baseURL) => {
  if (baseURL) {
    // Update all services with new base URL
    const services = [AuthService, ToolsService, SocialMediaService, SubscriptionService];
    
    // Note: In a real implementation, you might want to set this differently
    // This is just for demonstration
    if (process.env.NODE_ENV === 'development') {
      console.log('API base URL configured:', baseURL);
    }
  }
};

// Request interceptor for adding auth token
const addAuthInterceptor = () => {
  // This would typically be done with axios interceptors
  // For fetch-based services, we handle it in each service method
};

// Error handling utilities
const handleApiError = (error, context = 'API Request') => {
  console.error(`${context} Error:`, error);
  
  // Return standardized error response
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
    isNetworkError: !error.response,
    timestamp: new Date().toISOString()
  };
};

// Usage tracking
const trackServiceUsage = (serviceName, methodName, success, duration) => {
  // Send to analytics if configured
  if (window.gtag) {
    window.gtag('event', 'service_call', {
      service_name: serviceName,
      method_name: methodName,
      success: success,
      duration: duration
    });
  }
};

export {
  AuthService,
  ToolsService,
  SocialMediaService,
  SubscriptionService,
  NotificationService,
  configureApiService,
  addAuthInterceptor,
  handleApiError,
  trackServiceUsage
};

export default {
  AuthService,
  ToolsService,
  SocialMediaService,
  SubscriptionService,
  NotificationService,
  configureApiService,
  addAuthInterceptor,
  handleApiError,
  trackServiceUsage
};