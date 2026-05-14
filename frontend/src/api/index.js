// frontend/src/api/index.js
import api from './axiosConfig';
import { ENDPOINTS, buildUrl, TIME_PERIODS } from './endpoints';
import authApi from './authApi';
import userApi from './userApi';
import subscriptionApi from './subscriptionApi';
import toolsApi from './toolsApi';
import socialMediaApi from './socialMediaApi';
import usageApi from './usageApi';
import paymentApi from './paymentApi';
import { errorHandler, ApiError } from './errorHandler';

// Export everything
export {
  api,
  ENDPOINTS,
  buildUrl,
  TIME_PERIODS,
  authApi,
  userApi,
  subscriptionApi,
  toolsApi,
  socialMediaApi,
  usageApi,
  paymentApi,
  errorHandler,
  ApiError,
};

// Default export for easy imports
const apiDefaultExport = {
  api,
  endpoints: ENDPOINTS,
  auth: authApi,
  user: userApi,
  subscription: subscriptionApi,
  tools: toolsApi,
  socialMedia: socialMediaApi,
  usage: usageApi,
  payment: paymentApi,
  errorHandler,
};

export default apiDefaultExport;