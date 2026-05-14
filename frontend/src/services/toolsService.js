// frontend/src/services/toolsService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

class ToolsService {
  // Get all available tools with user's access status
  static async getAvailableTools(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          tools: data.tools,
          categories: data.categories
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch tools',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get tools error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Value Proposition Generator
  static async generateValueProposition(inputData, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/value-proposition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(inputData)
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          propositions: data.propositions,
          variants: data.variants,
          suggestions: data.suggestions,
          usage: data.usage
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate value proposition',
          limitReached: data.limitReached,
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate value proposition error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Headline Analyzer
  static async analyzeHeadline(headline, token, context = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/headline-analyzer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ headline, ...context })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          score: data.score,
          analysis: data.analysis,
          suggestions: data.suggestions,
          improvedVersions: data.improvedVersions,
          metrics: data.metrics
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to analyze headline',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Analyze headline error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // SEO Meta Generator
  static async generateSEOMeta(keywords, description, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/seo-meta`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ keywords, description, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          title: data.title,
          metaDescription: data.metaDescription,
          ogTags: data.ogTags,
          twitterTags: data.twitterTags,
          suggestions: data.suggestions,
          characterCount: data.characterCount
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate SEO meta',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate SEO meta error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Email Subject Line Tester
  static async testEmailSubject(subjectLine, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/email-tester`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectLine, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          score: data.score,
          openRatePrediction: data.openRatePrediction,
          spamScore: data.spamScore,
          analysis: data.analysis,
          suggestions: data.suggestions,
          alternativeSubjects: data.alternativeSubjects
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to test email subject',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Test email subject error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Ad Copy Generator
  static async generateAdCopy(productInfo, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/ad-copy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productInfo, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          adCopies: data.adCopies,
          platforms: data.platforms,
          variations: data.variations,
          ctas: data.ctas,
          characterCounts: data.characterCounts
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate ad copy',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate ad copy error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Content Idea Generator
  static async generateContentIdeas(keywords, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/content-idea`, {
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
          ideas: data.ideas,
          categories: data.categories,
          contentCalendar: data.contentCalendar,
          trendingTopics: data.trendingTopics,
          seoSuggestions: data.seoSuggestions
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to generate content ideas',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Generate content ideas error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Funnel Builder
  static async buildFunnel(funnelData, token, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/funnel-builder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ funnelData, ...options })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          funnel: data.funnel,
          stages: data.stages,
          contentSuggestions: data.contentSuggestions,
          metrics: data.metrics,
          optimizationTips: data.optimizationTips
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to build funnel',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Build funnel error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Save generated content
  static async saveContent(contentData, token, toolType) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentData, toolType })
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          savedContent: data.savedContent,
          message: data.message
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
      const url = `${API_BASE_URL}/tools/saved?${queryParams}`;

      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          content: data.content,
          total: data.total,
          filters: data.filters
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

  // Export content
  static async exportContent(contentIds, format, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ contentIds, format })
      });

      if (response.ok) {
        const blob = await response.blob();
        return {
          success: true,
          blob,
          filename: response.headers.get('Content-Disposition')?.split('filename=')[1] || 'export'
        };
      } else {
        const data = await response.json();
        return {
          success: false,
          error: data.error || 'Failed to export content',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Export content error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get tool usage history
  static async getToolHistory(toolId, token, period = 'month') {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/history/${toolId}?period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          history: data.history,
          usageCount: data.usageCount,
          period: data.period
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to fetch tool history',
          status: response.status
        };
      }
    } catch (error) {
      console.error('Get tool history error:', error);
      return {
        success: false,
        error: 'Network error. Please try again.'
      };
    }
  }

  // Get tool templates
  static async getTemplates(toolId, token) {
    try {
      const response = await fetch(`${API_BASE_URL}/tools/templates/${toolId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          templates: data.templates,
          categories: data.categories
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
}

export default ToolsService;