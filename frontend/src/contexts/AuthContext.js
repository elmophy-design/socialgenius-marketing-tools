// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { authApi, userApi } from '../api';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Update user function
  const updateUser = useCallback((userData) => {
    setAuthState(prev => ({
      ...prev,
      user: { ...prev.user, ...userData },
    }));
    
    // Update localStorage
    authApi.updateStoredUser(userData);
  }, []);

  // Initialize auth from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const session = authApi.getCurrentSession();
        
        if (session.isAuthenticated && authApi.isTokenValid()) {
          // Token is valid, set auth state
          setAuthState({
            user: session.user,
            token: session.token,
            isLoading: false,
            isAuthenticated: true,
          });
          
          // Refresh user data from API
          const profileResult = await userApi.getProfile();
          if (profileResult.success) {
            updateUser(profileResult.data);
          }
        } else {
          // Clear invalid session
          if (session.token) {
            authApi.logout();
          }
          setAuthState({
            user: null,
            token: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          user: null,
          token: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    };

    initializeAuth();
  }, [updateUser]);

  // Login function
  const login = async (email, password, rememberMe = false) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await authApi.login(email, password, rememberMe);
      
      if (result.success) {
        // Set initial auth state from login response
        setAuthState({
          user: result.data.user,
          token: result.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Refresh user profile from database immediately
        const profileResult = await userApi.getProfile();
        if (profileResult.success) {
          // Update with latest profile data from database
          setAuthState(prev => ({
            ...prev,
            user: { ...prev.user, ...profileResult.data },
          }));
          // Also update localStorage with fresh data
          authApi.updateStoredUser(profileResult.data);
        }
        
        return { success: true, data: result.data };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      const result = await authApi.signup(userData);
      
      if (result.success) {
        setAuthState({
          user: result.data.user,
          token: result.data.token,
          isLoading: false,
          isAuthenticated: true,
        });
        return { success: true, data: result.data };
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        token: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  // Refresh token function
  const refreshToken = async () => {
    try {
      const session = authApi.getCurrentSession();
      if (session.token) {
        const decoded = jwtDecode(session.token);
        const currentTime = Date.now() / 1000;
        
        // Refresh if token expires in less than 5 minutes
        if (decoded.exp - currentTime < 300) {
          // Implement token refresh logic here
          // This would require a refresh token endpoint
          console.log('Token needs refresh');
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
  };

  // Check if user has role
  const hasRole = (role) => {
    return authState.user?.roles?.includes(role) || false;
  };

  // Check if user has permission
  const hasPermission = (permission) => {
    return authState.user?.permissions?.includes(permission) || false;
  };

  // Get user initials
  const getUserInitials = () => {
    if (!authState.user?.name) return 'U';
    return authState.user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Check if token is expired
  const isTokenExpired = useCallback(() => {
    if (!authState.token) return true;
    
    try {
      const decoded = jwtDecode(authState.token);
      const currentTime = Date.now() / 1000;
      return decoded.exp < currentTime;
    } catch (error) {
      return true;
    }
  }, [authState.token]);

  // Auto-logout on token expiration
  useEffect(() => {
    const checkTokenExpiration = () => {
      if (authState.isAuthenticated && isTokenExpired()) {
        logout();
      }
    };

    // Check every minute
    const interval = setInterval(checkTokenExpiration, 60000);
    return () => clearInterval(interval);
  }, [authState.isAuthenticated, isTokenExpired, logout]);

  const value = {
    ...authState,
    login,
    signup,
    logout,
    updateUser,
    refreshToken,
    hasRole,
    hasPermission,
    getUserInitials,
    isTokenExpired,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
