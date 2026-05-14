import { useState, useCallback } from 'react';
import { socialMediaApi } from '../api';
import { useLocalStorage } from './useLocalStorage';

/**
 * Custom hook for Social Media Generator tool
 * Manages content generation, hashtags, analytics, and post history
 */
export const useSocialMedia = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPosts, setGeneratedPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  
  // Persist post history in localStorage
  const [postHistory, setPostHistory] = useLocalStorage('socialMediaHistory', []);
  const [savedPosts, setSavedPosts] = useLocalStorage('savedPosts', []);
  const [customTemplates, setCustomTemplates] = useLocalStorage('customTemplates', []);

  /**
   * Generate social media content
   */
  const generateContent = useCallback(async (options) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.generateContent(options);
      
      if (result.success) {
        const posts = result.data;
        setGeneratedPosts(posts);
        
        // Add to history with timestamp
        const historyEntry = {
          id: Date.now(),
          timestamp: new Date().toISOString(),
          options,
          posts,
          generatedCount: posts.length
        };
        
        setPostHistory(prev => [historyEntry, ...prev.slice(0, 49)]); // Keep last 50
        
        return { success: true, data: posts };
      } else {
        const errorMessage = result.error || 'Content generation failed';
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
  }, [setPostHistory]);

  /**
   * Generate hashtags for content
   */
  const generateHashtags = useCallback(async (content, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.generateHashtags({ 
        content, 
        ...options 
      });
      
      if (result.success) {
        const tags = result.data.hashtags || [];
        setHashtags(tags);
        return { success: true, data: tags };
      } else {
        const errorMessage = result.error || 'Hashtag generation failed';
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
   * Analyze content for engagement prediction
   */
  const analyzeContent = useCallback(async (content, platform) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.analyzeContent({ content, platform });
      
      if (result.success) {
        const analysisData = result.data;
        setAnalytics(analysisData);
        return { success: true, data: analysisData };
      } else {
        const errorMessage = result.error || 'Content analysis failed';
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
   * Optimize content for specific platform
   */
  const optimizeForPlatform = useCallback(async (content, platform) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.optimizeContent({ content, platform });
      
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        const errorMessage = result.error || 'Content optimization failed';
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
   * Save a post to favorites
   */
  const savePost = useCallback((post) => {
    const savedPost = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...post
    };
    
    setSavedPosts(prev => [savedPost, ...prev]);
    return savedPost;
  }, [setSavedPosts]);

  /**
   * Remove a saved post
   */
  const unsavePost = useCallback((postId) => {
    setSavedPosts(prev => prev.filter(p => p.id !== postId));
  }, [setSavedPosts]);

  /**
   * Create a custom template
   */
  const createTemplate = useCallback((template) => {
    const newTemplate = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...template
    };
    
    setCustomTemplates(prev => [newTemplate, ...prev]);
    return newTemplate;
  }, [setCustomTemplates]);

  /**
   * Delete a custom template
   */
  const deleteTemplate = useCallback((templateId) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== templateId));
  }, [setCustomTemplates]);

  /**
   * Update a custom template
   */
  const updateTemplate = useCallback((templateId, updates) => {
    setCustomTemplates(prev => 
      prev.map(t => t.id === templateId ? { ...t, ...updates } : t)
    );
  }, [setCustomTemplates]);

  /**
   * Clear post history
   */
  const clearHistory = useCallback(() => {
    setPostHistory([]);
  }, [setPostHistory]);

  /**
   * Get statistics from history
   */
  const getStatistics = useCallback(() => {
    const totalGenerated = postHistory.reduce((sum, entry) => 
      sum + (entry.generatedCount || 0), 0
    );
    
    const platformCounts = {};
    const nicheCounts = {};
    
    postHistory.forEach(entry => {
      entry.options.platforms?.forEach(platform => {
        platformCounts[platform] = (platformCounts[platform] || 0) + 1;
      });
      
      if (entry.options.niche) {
        nicheCounts[entry.options.niche] = (nicheCounts[entry.options.niche] || 0) + 1;
      }
    });
    
    return {
      totalSessions: postHistory.length,
      totalGenerated,
      savedCount: savedPosts.length,
      templateCount: customTemplates.length,
      platformCounts,
      nicheCounts,
      mostUsedPlatform: Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0],
      mostUsedNiche: Object.entries(nicheCounts).sort((a, b) => b[1] - a[1])[0]?.[0]
    };
  }, [postHistory, savedPosts, customTemplates]);

  /**
   * Export post history as JSON
   */
  const exportHistory = useCallback(() => {
    const dataStr = JSON.stringify({
      history: postHistory,
      savedPosts,
      templates: customTemplates,
      exportDate: new Date().toISOString()
    }, null, 2);
    
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = `socialgenius-export-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [postHistory, savedPosts, customTemplates]);

  /**
   * Import post history from JSON
   */
  const importHistory = useCallback((jsonData) => {
    try {
      const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      
      if (data.history) setPostHistory(data.history);
      if (data.savedPosts) setSavedPosts(data.savedPosts);
      if (data.templates) setCustomTemplates(data.templates);
      
      return { success: true };
    } catch (err) {
      setError('Failed to import data: ' + err.message);
      return { success: false, error: err.message };
    }
  }, [setPostHistory, setSavedPosts, setCustomTemplates]);

  /**
   * Generate content variations
   */
  const generateVariations = useCallback(async (originalContent, count = 3) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.generateVariations({ 
        content: originalContent, 
        count 
      });
      
      if (result.success) {
        return { success: true, data: result.data.variations || [] };
      } else {
        const errorMessage = result.error || 'Variation generation failed';
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
   * Get content suggestions based on trending topics
   */
  const getTrendingSuggestions = useCallback(async (niche) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await socialMediaApi.getTrending({ niche });
      
      if (result.success) {
        return { success: true, data: result.data.suggestions || [] };
      } else {
        const errorMessage = result.error || 'Failed to fetch trending topics';
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

  return {
    // State
    loading,
    error,
    generatedPosts,
    hashtags,
    analytics,
    postHistory,
    savedPosts,
    customTemplates,
    
    // Content Generation
    generateContent,
    generateHashtags,
    analyzeContent,
    optimizeForPlatform,
    generateVariations,
    getTrendingSuggestions,
    
    // Post Management
    savePost,
    unsavePost,
    setGeneratedPosts,
    
    // Template Management
    createTemplate,
    deleteTemplate,
    updateTemplate,
    
    // History Management
    clearHistory,
    getStatistics,
    exportHistory,
    importHistory,
    
    // Utilities
    setError,
    setLoading
  };
};

export default useSocialMedia;