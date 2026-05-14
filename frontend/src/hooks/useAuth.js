import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api';

/**
 * Custom hook for authentication management
 * Handles login, register, logout, password reset, and auth state
 */
export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  /**
   * Initialize authentication state from localStorage
   */
  const initializeAuth = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error('Auth initialization error:', err);
      clearAuth();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user with email and password
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.login(email, password);
      
      if (result.success) {
        const { token, user: userData } = result.data;
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Update state
        setUser(userData);
        setIsAuthenticated(true);
        
        // Navigate to dashboard
        navigate('/dashboard');
        
        return { success: true, data: userData };
      } else {
        const errorMessage = result.error || 'Login failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred during login';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Register new user
   */
  const register = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.register(userData);
      
      if (result.success) {
        const { token, user: newUser } = result.data;
        
        // Store auth data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // Update state
        setUser(newUser);
        setIsAuthenticated(true);
        
        // Navigate to dashboard
        navigate('/dashboard');
        
        return { success: true, data: newUser };
      } else {
        const errorMessage = result.error || 'Registration failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred during registration';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  /**
   * Logout user and clear auth state
   */
  const logout = useCallback(() => {
    clearAuth();
    navigate('/login');
  }, [navigate]);

  /**
   * Clear all authentication data
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('subscription');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Request password reset
   */
  const requestPasswordReset = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.requestPasswordReset(email);
      
      if (result.success) {
        return { success: true, message: result.message || 'Password reset email sent' };
      } else {
        const errorMessage = result.error || 'Password reset request failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Reset password with token
   */
  const resetPassword = useCallback(async (token, newPassword) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.resetPassword(token, newPassword);
      
      if (result.success) {
        return { success: true, message: 'Password reset successful' };
      } else {
        const errorMessage = result.error || 'Password reset failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update user profile
   */
  const updateProfile = useCallback(async (updates) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authApi.updateProfile(updates);
      
      if (result.success) {
        const updatedUser = { ...user, ...result.data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, data: updatedUser };
      } else {
        const errorMessage = result.error || 'Profile update failed';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Get current user data
   */
  const getCurrentUser = useCallback(() => {
    return user;
  }, [user]);

  /**
   * Check if user has specific role
   */
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user]);

  /**
   * Verify authentication token is still valid
   */
  const verifyToken = useCallback(async () => {
    try {
      const result = await authApi.verifyToken();
      
      if (!result.success) {
        clearAuth();
        return false;
      }
      
      return true;
    } catch (err) {
      clearAuth();
      return false;
    }
  }, [clearAuth]);

  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Actions
    login,
    register,
    logout,
    requestPasswordReset,
    resetPassword,
    updateProfile,
    getCurrentUser,
    hasRole,
    verifyToken,
    
    // Utilities
    setError,
    clearAuth
  };
};

export default useAuth;