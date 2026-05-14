import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './SEOMetaGenerator.css';

function SEOMetaGenerator() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    pageTitle: '',
    pageDescription: '',
    targetKeywords: '',
    pageType: 'article',
    industry: 'general',
    targetAudience: 'general',
    focusKeyword: ''
  });

  // Results state
  const [metaData, setMetaData] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [copiedField, setCopiedField] = useState('');

  // Character limits
  const TITLE_MAX = 60;
  const DESC_MAX = 160;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Generate SEO meta tags
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'seo-meta-generate',
      actionLabel: 'generate SEO metadata',
      toolName: 'SEO Meta Generator',
    })) {
      return;
    }
    
    if (!formData.pageTitle.trim() || !formData.pageDescription.trim()) {
      setError('Page title and description are required');
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/seo-meta/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setMetaData(response.data.data);
        setShowResults(true);
        
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }
    } catch (err) {
      console.error('Generation error:', err);
      if (handleToolActionError(err, navigate)) {
        return;
      }
      setError(
        err.response?.data?.message || 
        'Failed to generate meta tags. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(''), 2000);
  };

  // Copy all meta tags as HTML
  const copyAllMetaTags = () => {
    if (!metaData) return;

    const html = `<!-- Primary Meta Tags -->
<title>${metaData.optimizedTitle}</title>
<meta name="title" content="${metaData.optimizedTitle}">
<meta name="description" content="${metaData.optimizedDescription}">
<meta name="keywords" content="${metaData.keywordAnalysis.primaryKeyword}, ${metaData.keywordAnalysis.secondaryKeywords.join(', ')}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${metaData.openGraphTags['og:type']}">
<meta property="og:title" content="${metaData.openGraphTags['og:title']}">
<meta property="og:description" content="${metaData.openGraphTags['og:description']}">

<!-- Twitter -->
<meta property="twitter:card" content="${metaData.twitterCardTags['twitter:card']}">
<meta property="twitter:title" content="${metaData.twitterCardTags['twitter:title']}">
<meta property="twitter:description" content="${metaData.twitterCardTags['twitter:description']}">

<!-- Additional Meta Tags -->
<meta name="robots" content="${metaData.additionalMetaTags.robots}">
<meta name="author" content="${metaData.additionalMetaTags.author}">
<meta name="viewport" content="${metaData.additionalMetaTags.viewport}">`;

    copyToClipboard(html, 'all-tags');
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#ff6b35';
    return '#dc3545';
  };

  // Get character count color
  const getCharCountColor = (count, max) => {
    if (count > max) return '#dc3545';
    if (count > max * 0.9) return '#ffc107';
    return '#28a745';
  };

  return (
    <div className="seo-meta-generator">
      {/* Header */}
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <div className="tool-title">
              <span className="tool-icon">🔍</span>
              <h1>SEO Meta Generator</h1>
            </div>
            <p className="tool-subtitle">
              Generate optimized meta tags for better search engine rankings and click-through rates
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Input Section */}
          <section id="how-it-works" data-section="how-it-works" className="input-section">
            <h2>Generate Meta Tags</h2>
            
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label htmlFor="pageTitle">
                  Page Title *
                  <span 
                    className="char-count" 
                    style={{ color: getCharCountColor(formData.pageTitle.length, TITLE_MAX) }}
                  >
                    {formData.pageTitle.length}/{TITLE_MAX}
                  </span>
                </label>
                <input
                  type="text"
                  id="pageTitle"
                  name="pageTitle"
                  className="form-input"
                  placeholder="e.g., Best Digital Marketing Tools for 2024"
                  value={formData.pageTitle}
                  onChange={handleChange}
                  required
                />
                <small className="input-hint">
                  Optimal: 50-60 characters. Include your main keyword.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="pageDescription">
                  Page Description *
                  <span 
                    className="char-count"
                    style={{ color: getCharCountColor(formData.pageDescription.length, DESC_MAX) }}
                  >
                    {formData.pageDescription.length}/{DESC_MAX}
                  </span>
                </label>
                <textarea
                  id="pageDescription"
                  name="pageDescription"
                  className="form-textarea"
                  placeholder="e.g., Discover the top digital marketing tools that help businesses grow faster. Compare features, pricing, and find the perfect solution for your needs."
                  value={formData.pageDescription}
                  onChange={handleChange}
                  rows={4}
                  required
                />
                <small className="input-hint">
                  Optimal: 150-160 characters. Include keywords and a call-to-action.
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="focusKeyword">Focus Keyword</label>
                <input
                  type="text"
                  id="focusKeyword"
                  name="focusKeyword"
                  className="form-input"
                  placeholder="e.g., digital marketing tools"
                  value={formData.focusKeyword}
                  onChange={handleChange}
                />
                <small className="input-hint">
                  Main keyword you want to rank for
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="targetKeywords">Additional Keywords (Optional)</label>
                <input
                  type="text"
                  id="targetKeywords"
                  name="targetKeywords"
                  className="form-input"
                  placeholder="e.g., SEO tools, marketing automation, analytics"
                  value={formData.targetKeywords}
                  onChange={handleChange}
                />
                <small className="input-hint">
                  Separate with commas
                </small>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="pageType">Page Type</label>
                  <select
                    id="pageType"
                    name="pageType"
                    className="form-select"
                    value={formData.pageType}
                    onChange={handleChange}
                  >
                    <option value="article">Article/Blog Post</option>
                    <option value="product">Product Page</option>
                    <option value="service">Service Page</option>
                    <option value="homepage">Homepage</option>
                    <option value="category">Category Page</option>
                    <option value="landing">Landing Page</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    className="form-select"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="general">General</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS/Technology</option>
                    <option value="marketing">Marketing</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="real-estate">Real Estate</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="targetAudience">Target Audience</label>
                  <select
                    id="targetAudience"
                    name="targetAudience"
                    className="form-select"
                    value={formData.targetAudience}
                    onChange={handleChange}
                  >
                    <option value="general">General Public</option>
                    <option value="b2b">B2B Professionals</option>
                    <option value="b2c">B2C Consumers</option>
                    <option value="developers">Developers</option>
                    <option value="marketers">Marketers</option>
                    <option value="students">Students</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating Meta Tags...
                  </>
                ) : (
                  <>
                    <span>🚀</span>
                    Generate SEO Meta Tags
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results Section */}
          <section className="results-section" id="results-section">
            <h2>Generated Meta Tags</h2>

            {!showResults && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">🔍</div>
                <h3>Your optimized meta tags will appear here</h3>
                <p>Fill in the form and click "Generate SEO Meta Tags" to get started</p>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>AI is optimizing your meta tags for maximum SEO impact...</p>
              </div>
            )}

            {showResults && metaData && (
              <div className="results-content">
                {/* SEO Score */}
                <div className="score-overview">
                  <div className="score-card">
                    <div className="score-label">SEO Score</div>
                    <div 
                      className="score-value" 
                      style={{ color: getScoreColor(metaData.seoScore) }}
                    >
                      {metaData.seoScore}/100
                    </div>
                  </div>
                  
                  {metaData.scoreBreakdown && (
                    <div className="score-breakdown-mini">
                      {Object.entries(metaData.scoreBreakdown).map(([key, value]) => (
                        <div key={key} className="breakdown-item-mini">
                          <span className="breakdown-label-mini">
                            {key.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <div className="breakdown-bar-mini">
                            <div 
                              className="breakdown-fill-mini"
                              style={{ 
                                width: `${value}%`,
                                background: getScoreColor(value)
                              }}
                            ></div>
                          </div>
                          <span className="breakdown-value-mini">{value}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs Navigation */}
                <div className="tabs-nav">
                  <button 
                    className={`tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
                    onClick={() => setActiveTab('basic')}
                  >
                    📝 Basic Meta Tags
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'social' ? 'active' : ''}`}
                    onClick={() => setActiveTab('social')}
                  >
                    📱 Social Media
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
                    onClick={() => setActiveTab('preview')}
                  >
                    👁️ Preview
                  </button>
                  <button 
                    className={`tab-btn ${activeTab === 'html' ? 'active' : ''}`}
                    onClick={() => setActiveTab('html')}
                  >
                    💻 HTML Code
                  </button>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Basic Meta Tags Tab */}
                  {activeTab === 'basic' && (
                    <div className="tab-pane">
                      {/* Optimized Title */}
                      <div className="meta-tag-card">
                        <div className="meta-tag-header">
                          <h3>Title Tag</h3>
                          <div className="char-info">
                            <span className={metaData.titleLength <= TITLE_MAX ? 'good' : 'warning'}>
                              {metaData.titleLength} characters
                            </span>
                          </div>
                        </div>
                        <div className="meta-tag-value">
                          {metaData.optimizedTitle}
                        </div>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(metaData.optimizedTitle, 'title')}
                        >
                          {copiedField === 'title' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      {/* Optimized Description */}
                      <div className="meta-tag-card">
                        <div className="meta-tag-header">
                          <h3>Meta Description</h3>
                          <div className="char-info">
                            <span className={metaData.descriptionLength <= DESC_MAX ? 'good' : 'warning'}>
                              {metaData.descriptionLength} characters
                            </span>
                          </div>
                        </div>
                        <div className="meta-tag-value">
                          {metaData.optimizedDescription}
                        </div>
                        <button 
                          className="copy-btn"
                          onClick={() => copyToClipboard(metaData.optimizedDescription, 'description')}
                        >
                          {copiedField === 'description' ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>

                      {/* Alternative Titles */}
                      {metaData.alternativeTitles && metaData.alternativeTitles.length > 0 && (
                        <div className="alternatives-section">
                          <h3>Alternative Title Tags</h3>
                          <div className="alternatives-grid">
                            {metaData.alternativeTitles.map((title, index) => (
                              <div key={index} className="alternative-card">
                                <div className="alternative-label">Option {index + 1}</div>
                                <div className="alternative-text">{title}</div>
                                <button 
                                  className="copy-btn-small"
                                  onClick={() => copyToClipboard(title, `alt-title-${index}`)}
                                >
                                  {copiedField === `alt-title-${index}` ? '✓' : '📋'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternative Descriptions */}
                      {metaData.alternativeDescriptions && metaData.alternativeDescriptions.length > 0 && (
                        <div className="alternatives-section">
                          <h3>Alternative Meta Descriptions</h3>
                          <div className="alternatives-grid">
                            {metaData.alternativeDescriptions.map((desc, index) => (
                              <div key={index} className="alternative-card">
                                <div className="alternative-label">Option {index + 1}</div>
                                <div className="alternative-text">{desc}</div>
                                <button 
                                  className="copy-btn-small"
                                  onClick={() => copyToClipboard(desc, `alt-desc-${index}`)}
                                >
                                  {copiedField === `alt-desc-${index}` ? '✓' : '📋'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Keyword Analysis */}
                      {metaData.keywordAnalysis && (
                        <div className="keyword-analysis">
                          <h3>🔑 Keyword Analysis</h3>
                          <div className="keyword-grid">
                            <div className="keyword-item">
                              <strong>Primary Keyword:</strong>
                              <span className="keyword-tag primary">{metaData.keywordAnalysis.primaryKeyword}</span>
                            </div>
                            <div className="keyword-item">
                              <strong>Keyword Density:</strong>
                              <span className="keyword-tag">{metaData.keywordAnalysis.keywordDensity}</span>
                            </div>
                            {metaData.keywordAnalysis.secondaryKeywords && (
                              <div className="keyword-item full-width">
                                <strong>Secondary Keywords:</strong>
                                <div className="keyword-list">
                                  {metaData.keywordAnalysis.secondaryKeywords.map((kw, index) => (
                                    <span key={index} className="keyword-tag secondary">{kw}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {metaData.keywordAnalysis.lsiKeywords && (
                              <div className="keyword-item full-width">
                                <strong>LSI Keywords (Suggested):</strong>
                                <div className="keyword-list">
                                  {metaData.keywordAnalysis.lsiKeywords.map((kw, index) => (
                                    <span key={index} className="keyword-tag lsi">{kw}</span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Social Media Tab */}
                  {activeTab === 'social' && (
                    <div className="tab-pane">
                      {/* Open Graph Tags */}
                      {metaData.openGraphTags && (
                        <div className="social-section">
                          <h3>📘 Open Graph Tags (Facebook, LinkedIn)</h3>
                          <div className="meta-tags-list">
                            {Object.entries(metaData.openGraphTags).map(([key, value]) => (
                              <div key={key} className="meta-tag-row">
                                <div className="meta-tag-key">{key}</div>
                                <div className="meta-tag-val">{value}</div>
                                <button 
                                  className="copy-btn-small"
                                  onClick={() => copyToClipboard(value, key)}
                                >
                                  {copiedField === key ? '✓' : '📋'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Twitter Card Tags */}
                      {metaData.twitterCardTags && (
                        <div className="social-section">
                          <h3>🐦 Twitter Card Tags</h3>
                          <div className="meta-tags-list">
                            {Object.entries(metaData.twitterCardTags).map(([key, value]) => (
                              <div key={key} className="meta-tag-row">
                                <div className="meta-tag-key">{key}</div>
                                <div className="meta-tag-val">{value}</div>
                                <button 
                                  className="copy-btn-small"
                                  onClick={() => copyToClipboard(value, key)}
                                >
                                  {copiedField === key ? '✓' : '📋'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Additional Meta Tags */}
                      {metaData.additionalMetaTags && (
                        <div className="social-section">
                          <h3>⚙️ Additional Meta Tags</h3>
                          <div className="meta-tags-list">
                            {Object.entries(metaData.additionalMetaTags).map(([key, value]) => (
                              <div key={key} className="meta-tag-row">
                                <div className="meta-tag-key">{key}</div>
                                <div className="meta-tag-val">{value}</div>
                                <button 
                                  className="copy-btn-small"
                                  onClick={() => copyToClipboard(value, key)}
                                >
                                  {copiedField === key ? '✓' : '📋'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preview Tab */}
                  {activeTab === 'preview' && metaData.preview && (
                    <div className="tab-pane">
                      {/* Google Search Preview */}
                      <div className="preview-section">
                        <h3>🔍 Google Search Preview</h3>
                        <div className="google-preview">
                          <div className="google-url">https://example.com › your-page</div>
                          <div className="google-title">{metaData.preview.googleSearchPreview.title}</div>
                          <div className="google-description">{metaData.preview.googleSearchPreview.description}</div>
                        </div>
                      </div>

                      {/* Facebook Preview */}
                      <div className="preview-section">
                        <h3>📘 Facebook Preview</h3>
                        <div className="facebook-preview">
                          <div className="fb-image-placeholder">
                            {metaData.preview.facebookPreview.image}
                          </div>
                          <div className="fb-content">
                            <div className="fb-url">EXAMPLE.COM</div>
                            <div className="fb-title">{metaData.preview.facebookPreview.title}</div>
                            <div className="fb-description">{metaData.preview.facebookPreview.description}</div>
                          </div>
                        </div>
                      </div>

                      {/* Twitter Preview */}
                      <div className="preview-section">
                        <h3>🐦 Twitter Preview</h3>
                        <div className="twitter-preview">
                          <div className="twitter-image-placeholder">
                            {metaData.preview.twitterPreview.image}
                          </div>
                          <div className="twitter-content">
                            <div className="twitter-title">{metaData.preview.twitterPreview.title}</div>
                            <div className="twitter-description">{metaData.preview.twitterPreview.description}</div>
                            <div className="twitter-url">example.com</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* HTML Code Tab */}
                  {activeTab === 'html' && (
                    <div className="tab-pane">
                      <div className="html-code-section">
                        <div className="html-header">
                          <h3>📄 HTML Meta Tags Code</h3>
                          <button 
                            className="copy-all-btn"
                            onClick={copyAllMetaTags}
                          >
                            {copiedField === 'all-tags' ? '✓ Copied All!' : '📋 Copy All HTML'}
                          </button>
                        </div>
                        <pre className="html-code">
{`<!-- Primary Meta Tags -->
<title>${metaData.optimizedTitle}</title>
<meta name="title" content="${metaData.optimizedTitle}">
<meta name="description" content="${metaData.optimizedDescription}">
<meta name="keywords" content="${metaData.keywordAnalysis.primaryKeyword}, ${metaData.keywordAnalysis.secondaryKeywords?.join(', ')}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="${metaData.openGraphTags['og:type']}">
<meta property="og:title" content="${metaData.openGraphTags['og:title']}">
<meta property="og:description" content="${metaData.openGraphTags['og:description']}">

<!-- Twitter -->
<meta property="twitter:card" content="${metaData.twitterCardTags['twitter:card']}">
<meta property="twitter:title" content="${metaData.twitterCardTags['twitter:title']}">
<meta property="twitter:description" content="${metaData.twitterCardTags['twitter:description']}">

<!-- Additional Meta Tags -->
<meta name="robots" content="${metaData.additionalMetaTags.robots}">
<meta name="author" content="${metaData.additionalMetaTags.author}">
<meta name="viewport" content="${metaData.additionalMetaTags.viewport}">`}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Warnings */}
                {metaData.warnings && metaData.warnings.length > 0 && (
                  <div className="warnings-section">
                    <h3>⚠️ Warnings</h3>
                    <ul className="warnings-list">
                      {metaData.warnings.map((warning, index) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {metaData.suggestions && metaData.suggestions.length > 0 && (
                  <div className="suggestions-section">
                    <h3>💡 Optimization Suggestions</h3>
                    <ul className="suggestions-list">
                      {metaData.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Competitor Tips */}
                {metaData.competitorTips && metaData.competitorTips.length > 0 && (
                  <div className="tips-section">
                    <h3>🎯 Competitor Analysis Tips</h3>
                    <ul className="tips-list">
                      {metaData.competitorTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        <section id="features" data-section="features" className="tool-resource-section">
          <h2>Features</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Meta Title and Description Drafting</h3>
              <p>Generate optimized title and description pairs that balance keyword relevance with real click-through appeal.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Preview-Ready Output</h3>
              <p>Review how metadata may look in search results and social previews before you publish changes live.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Keyword and Warning Signals</h3>
              <p>See where your target keyword usage is weak, too repetitive, or likely to create truncation and quality issues.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Alternative Variants</h3>
              <p>Produce multiple versions so you can test different positioning angles, CTA phrasing, and SERP messaging.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
          <h2>How It Works</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Describe the Page</h3>
              <p>Give the generator page purpose, title context, audience, and keywords so the output reflects what the page is truly about.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Generate Metadata Options</h3>
              <p>The tool creates title tags, descriptions, and social metadata tailored to search visibility and click intent.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Review Warnings and Suggestions</h3>
              <p>Use the built-in feedback to catch issues like weak keyword placement, low clarity, or poor preview formatting.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Ship Cleaner Tags</h3>
              <p>Select the strongest option and use the generated code or preview-ready copy in your CMS or development workflow.</p>
            </div>
          </div>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices" data-section="best-practices" className="best-practices-section">
          <h2>📚 SEO Meta Tags Best Practices</h2>
          <div className="practices-grid">
            <div className="practice-card">
              <div className="practice-icon">📏</div>
              <h3>Optimal Length</h3>
              <p>Title: 50-60 characters. Description: 150-160 characters. Stay within limits to avoid truncation in search results.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🔑</div>
              <h3>Keyword Placement</h3>
              <p>Place primary keyword near the beginning of title and description. Use naturally, avoid keyword stuffing.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🎯</div>
              <h3>Unique Tags</h3>
              <p>Every page should have unique title and description. Duplicate meta tags hurt SEO performance.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">💬</div>
              <h3>Call-to-Action</h3>
              <p>Include compelling CTAs like "Learn More", "Discover", "Get Started" to improve click-through rates.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">📱</div>
              <h3>Mobile Optimization</h3>
              <p>Consider mobile display limits. Titles show ~50 chars, descriptions ~120 chars on mobile devices.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🎨</div>
              <h3>Brand Consistency</h3>
              <p>Include brand name in title (usually at the end). Maintain consistent voice across all pages.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="tool-footer">
        <div className="container">
          <p>&copy; 2024 SEO Meta Generator. All rights reserved.</p>
          <p>Optimize your meta tags for better search engine visibility.</p>
        </div>
      </footer>
    </div>
  );
}

export default SEOMetaGenerator;
