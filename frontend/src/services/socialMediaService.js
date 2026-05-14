// frontend/src/services/socialMediaService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class SocialMediaService {
  // Generate social media content
  static async generateSocialMediaContent(contentData, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentData, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          posts: data.posts,
          platforms: data.platforms,
          hashtags: data.hashtags,
          images: data.images,
          captions: data.captions,
          suggestedTimes: data.suggestedTimes,
          usage: data.usage
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate social media content',
          limitReached: data.limitReached,
          requiresUpgrade: data.requiresUpgrade,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate social media content error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Generate platform-specific content
  static async generateForPlatform(platform, contentData, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/platform/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentData, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          posts: data.posts,
          hashtags: data.hashtags,
          characterCount: data.characterCount,
          platformOptimized: data.platformOptimized,
          bestPractices: data.bestPractices
        };
      } else {
        return {
          success: false,
          error: data.error || `Failed to generate ${platform} content`,
          status: response.status
        };
      }
    } catch (error) {
      console.error(`Generate ${platform} content error:`, error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Generate hashtags
  static async generateHashtags(keywords, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/hashtags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keywords, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          hashtags: data.hashtags,
          categories: data.categories,
          trending: data.trending,
          volume: data.volume,
          relevance: data.relevance
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate hashtags',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate hashtags error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Schedule social media posts
  static async schedulePosts(posts, token, scheduleData = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ posts, schedule: scheduleData })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          scheduled: data.scheduled,
          scheduleId: data.scheduleId,
          calendar: data.calendar,
          nextPostTime: data.nextPostTime
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to schedule posts',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Schedule posts error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get scheduled posts
  static async getScheduledPosts(token, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/social-media/scheduled?${queryParams}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          posts: data.posts,
          total: data.total,
          upcoming: data.upcoming,
          calendar: data.calendar
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch scheduled posts',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get scheduled posts error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Update scheduled post
  static async updateScheduledPost(postId, updates, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/scheduled/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          updatedPost: data.updatedPost,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to update scheduled post',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Update scheduled post error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Delete scheduled post
  static async deleteScheduledPost(postId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/scheduled/${postId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message,
          deletedId: postId
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to delete scheduled post',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Delete scheduled post error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Analyze post performance
  static async analyzePostPerformance(postData, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postData, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          analysis: data.analysis,
          score: data.score,
          suggestions: data.suggestions,
          optimalTiming: data.optimalTiming,
          competitorInsights: data.competitorInsights
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to analyze post performance',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Analyze post performance error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get social media templates
  static async getTemplates(platform, token, category = 'all') {
    try {
      const response = await fetch(
        `${API_BASE_URL}/social-media/templates/${platform}?category=${category}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          templates: data.templates,
          categories: data.categories,
          platform: data.platform
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch templates',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get templates error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Save social media content
  static async saveContent(content, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          savedContent: data.savedContent,
          message: data.message,
          folder: data.folder
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to save content',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Save content error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get saved content
  static async getSavedContent(token, filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/social-media/saved?${queryParams}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          content: data.content,
          total: data.total,
          folders: data.folders
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch saved content',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get saved content error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Connect social media accounts (for premium users)
  static async connectAccount(platform, authData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/connect/${platform}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(authData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          connectedAccount: data.connectedAccount,
          message: data.message
        };
      } else {
        return {
          success: false,
          error: data.error || `Failed to connect ${platform} account`,
          requiresPremium: data.requiresPremium,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Connect account error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get connected accounts
  static async getConnectedAccounts(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/accounts`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          accounts: data.accounts,
          total: data.total
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch connected accounts',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get connected accounts error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get social media insights
  static async getInsights(token, period = 'month') {
    try {
      const response = await fetch(`${API_BASE_URL}/social-media/insights?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          insights: data.insights,
          metrics: data.metrics,
          trends: data.trends,
          recommendations: data.recommendations
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch insights',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get insights error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }
}

export default SocialMediaService;