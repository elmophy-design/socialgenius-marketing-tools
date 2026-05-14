// frontend/src/contexts/ThemeContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme) {
      return savedTheme;
    }
    
    // Default to light
    return 'light';
  });

  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme
  useEffect(() => {
    const initializeTheme = () => {
      // Apply theme to document
      document.documentElement.setAttribute('data-theme', theme);
      
      // Add theme class to body
      document.body.classList.remove('light-theme', 'dark-theme');
      document.body.classList.add(`${theme}-theme`);
      
      // Save to localStorage
      localStorage.setItem('theme', theme);
      
      setIsLoading(false);
    };

    initializeTheme();
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    // System theme listening disabled for consistency
  }, []);

  // Toggle between light/dark
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Set specific theme
  const setThemeMode = (mode) => {
    if (['light', 'dark', 'auto'].includes(mode)) {
      if (mode === 'auto') {
        // Remove saved theme to use system preference
        localStorage.removeItem('theme');
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        setTheme(systemTheme);
      } else {
        setTheme(mode);
      }
    }
  };

  // Get theme colors
  const getThemeColors = () => {
    const themes = {
      light: {
        primary: '#3b82f6',
        secondary: '#8b5cf6',
        background: '#ffffff',
        surface: '#f9fafb',
        text: '#111827',
        textSecondary: '#6b7280',
        border: '#e5e7eb',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#06b6d4',
      },
      dark: {
        primary: '#60a5fa',
        secondary: '#a78bfa',
        background: '#111827',
        surface: '#1f2937',
        text: '#f9fafb',
        textSecondary: '#d1d5db',
        border: '#374151',
        success: '#34d399',
        warning: '#fbbf24',
        error: '#f87171',
        info: '#22d3ee',
      },
    };

    return themes[theme] || themes.light;
  };

  // Get CSS variables for theme
  const getCSSVariables = () => {
    const colors = getThemeColors();
    return {
      '--color-primary': colors.primary,
      '--color-secondary': colors.secondary,
      '--color-background': colors.background,
      '--color-surface': colors.surface,
      '--color-text': colors.text,
      '--color-text-secondary': colors.textSecondary,
      '--color-border': colors.border,
      '--color-success': colors.success,
      '--color-warning': colors.warning,
      '--color-error': colors.error,
      '--color-info': colors.info,
    };
  };

  const value = {
    theme,
    isLoading,
    toggleTheme,
    setThemeMode,
    getThemeColors,
    getCSSVariables,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  if (isLoading) {
    return (
      <div className="theme-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={value}>
      <style>
        {`
          :root {
            --color-primary: ${getThemeColors().primary};
            --color-secondary: ${getThemeColors().secondary};
            --color-background: ${getThemeColors().background};
            --color-surface: ${getThemeColors().surface};
            --color-text: ${getThemeColors().text};
            --color-text-secondary: ${getThemeColors().textSecondary};
            --color-border: ${getThemeColors().border};
            --color-success: ${getThemeColors().success};
            --color-warning: ${getThemeColors().warning};
            --color-error: ${getThemeColors().error};
            --color-info: ${getThemeColors().info};
          }
        `}
      </style>
      {children}
    </ThemeContext.Provider>
  );
};