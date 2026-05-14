import React, { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { generateAdCopy, saveAdCopy, getUserAdCopies } from '../../../api/toolsApi';
import { BsBullseye, BsCpu, BsBarChartLine, BsLightningCharge } from 'react-icons/bs';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './AdCopyGenerator.css';


const AdCopyGenerator = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatedCopy, setGeneratedCopy] = useState(null);
  const [error, setError] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    productName: '',
    productDescription: '',
    platform: 'google',
    adFormat: 'search',
    tone: 'professional',
    targetAudience: 'general',
    keywords: '',
    cta: 'learn-more'
  });

  // Platform configurations
  const platformConfigs = {
    google: { name: 'Google Ads', icon: '🔍', color: '#4285F4' },
    facebook: { name: 'Facebook', icon: '👥', color: '#1877F2' },
    instagram: { name: 'Instagram', icon: '📸', color: '#E4405F' },
    twitter: { name: 'Twitter/X', icon: '🐦', color: '#1DA1F2' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: '#0A66C2' },
    tiktok: { name: 'TikTok', icon: '🎵', color: '#000000' }
  };

  const loadUserHistory = useCallback(async () => {
    try {
      const response = await getUserAdCopies(user._id);
      if (response.success) {
        setUserHistory(response.data.slice(0, 5)); // Show last 5
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [user]);

  // Load user history on component mount
  useEffect(() => {
    if (user) {
      loadUserHistory();
    }
  }, [user, loadUserHistory]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleGenerate = async () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'ad-copy-generate',
      actionLabel: 'generate ad copy',
      toolName: 'Ad Copy Generator',
    })) {
      return;
    }

    if (!formData.productName.trim() || !formData.productDescription.trim()) {
      setError('Please enter product name and description');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedCopy(null);

    try {
      const payload = {
        ...formData,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        userId: user?._id
      };

      const response = await generateAdCopy(payload);
      
      if (response.success) {
        setGeneratedCopy(response.data);
        setSaveStatus(null);
        
        // Reload history to include new generation
        if (user) {
          loadUserHistory();
        }
      } else {
        setError(response.error || 'Failed to generate ad copy');
      }
    } catch (err) {
      if (handleToolActionError(err, navigate)) {
        return;
      }
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'ad-copy-save',
      actionLabel: 'save generated ad copy',
      toolName: 'Ad Copy Generator',
    })) {
      return;
    }

    if (!user) {
      setError('Please login to save ad copies');
      return;
    }

    if (!generatedCopy) return;

    try {
      const saveData = {
        userId: user._id,
        adData: {
          ...formData,
          generatedCopy: generatedCopy
        },
        metadata: {
          savedAt: new Date().toISOString(),
          source: 'web-interface'
        }
      };

      const response = await saveAdCopy(saveData);
      
      if (response.success) {
        setSaveStatus('success');
        loadUserHistory();
        
        // Clear status after 3 seconds
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
    });
  };

  const handleCopyAll = () => {
    if (!generatedCopy) return;
    
    const allText = `
Ad Title: ${generatedCopy.title}
Description: ${generatedCopy.description}
URL: ${generatedCopy.urlSlug}

Variations:
${generatedCopy.variations.map((v, i) => `${i + 1}. ${v}`).join('\n')}

Hashtags: ${generatedCopy.hashtags.join(' ')}

Generated for ${platformConfigs[formData.platform].name}
Tone: ${formData.tone}
Target: ${formData.targetAudience}
    `.trim();

    handleCopyToClipboard(allText);
  };

  const handleRegenerate = () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'ad-copy-regenerate',
      actionLabel: 'regenerate ad copy',
      toolName: 'Ad Copy Generator',
    })) {
      return;
    }

    handleGenerate();
  };

  // Format keywords for display
  const formattedKeywords = formData.keywords
    .split(',')
    .map(k => k.trim())
    .filter(k => k)
    .map(k => `#${k.replace(/\s+/g, '')}`);

  return (
    <div className="ad-copy-generator">
      {/* Header */}
      <div className="generator-header">
        <h1>🎪 AI Ad Copy Generator</h1>
        <p>Create high-converting ad copy for multiple platforms with real AI</p>
      </div>

      {/* Main Content Grid */}
      <div className="generator-grid">
        {/* Input Section */}
        <div id="how-it-works" data-section="how-it-works" className="input-section">
          <div className="section-header">
            <h2>Ad Specifications</h2>
            <p>Fill in your product details and preferences</p>
          </div>

          <div className="form-group">
            <label>Product/Service Name *</label>
            <input
              type="text"
              name="productName"
              value={formData.productName}
              onChange={handleInputChange}
              placeholder="e.g., Smart Fitness Tracker"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Product Description *</label>
            <textarea
              name="productDescription"
              value={formData.productDescription}
              onChange={handleInputChange}
              placeholder="Describe your product or service in detail..."
              className="form-textarea"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Platform</label>
              <select
                name="platform"
                value={formData.platform}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="google">Google Ads</option>
                <option value="facebook">Facebook</option>
                <option value="instagram">Instagram</option>
                <option value="twitter">Twitter/X</option>
                <option value="linkedin">LinkedIn</option>
                <option value="tiktok">TikTok</option>
              </select>
            </div>

            <div className="form-group">
              <label>Ad Format</label>
              <select
                name="adFormat"
                value={formData.adFormat}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="search">Search Ad</option>
                <option value="display">Display Ad</option>
                <option value="video">Video Ad</option>
                <option value="carousel">Carousel Ad</option>
                <option value="story">Story Ad</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Tone of Voice</label>
              <select
                name="tone"
                value={formData.tone}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual/Friendly</option>
                <option value="urgent">Urgent</option>
                <option value="humorous">Humorous</option>
                <option value="inspirational">Inspirational</option>
              </select>
            </div>

            <div className="form-group">
              <label>Target Audience</label>
              <select
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="general">General Audience</option>
                <option value="business">Business Professionals</option>
                <option value="young-adults">Young Adults (18-25)</option>
                <option value="parents">Parents</option>
                <option value="entrepreneurs">Entrepreneurs</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Key Features/Benefits</label>
            <input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleInputChange}
              placeholder="e.g., waterproof, long battery, heart rate monitoring"
              className="form-input"
            />
            <small className="input-hint">Separate with commas</small>
            
            {formattedKeywords.length > 0 && (
              <div className="keywords-preview">
                {formattedKeywords.map((keyword, index) => (
                  <span key={index} className="keyword-tag">{keyword}</span>
                ))}
              </div>
            )}
          </div>

          <div className="form-group">
            <label>Call-to-Action</label>
            <select
              name="cta"
              value={formData.cta}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="buy-now">Buy Now</option>
              <option value="learn-more">Learn More</option>
              <option value="sign-up">Sign Up</option>
              <option value="get-started">Get Started</option>
              <option value="shop-now">Shop Now</option>
              <option value="download">Download</option>
            </select>
          </div>

          <button 
            className="generate-button"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating with AI...
              </>
            ) : (
              '🎯 Generate Ad Copy'
            )}
          </button>

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="results-section">
          <div className="section-header">
            <h2>Generated Ad Copy</h2>
            <div className="platform-badge" style={{ 
              backgroundColor: platformConfigs[formData.platform]?.color || '#4285F4' 
            }}>
              {platformConfigs[formData.platform]?.icon} {platformConfigs[formData.platform]?.name}
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="ai-loading">
                <div className="ai-spinner"></div>
                <p>AI is crafting your perfect ad copy...</p>
                <small>Using real AI models for best results</small>
              </div>
            </div>
          ) : generatedCopy ? (
            <div className="results-content">
              {/* Ad Preview */}
              <div className="ad-preview">
                <div className="ad-header">
                  <h3 className="ad-title">{generatedCopy.title}</h3>
                  <span className="ad-badge">AD</span>
                </div>
                <div className="ad-url">www.example.com/{generatedCopy.urlSlug}</div>
                <p className="ad-description">{generatedCopy.description}</p>
                
                {generatedCopy.emojis && generatedCopy.emojis.length > 0 && (
                  <div className="ad-emojis">
                    {generatedCopy.emojis.map((emoji, index) => (
                      <span key={index}>{emoji}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* Variations */}
              <div className="variations-section">
                <h3>Ad Copy Variations</h3>
                <div className="variations-grid">
                  {generatedCopy.variations.map((variation, index) => (
                    <div key={index} className="variation-card">
                      <div className="variation-header">
                        <span className="variation-number">#{index + 1}</span>
                        <button 
                          className="copy-btn"
                          onClick={() => handleCopyToClipboard(variation)}
                          title="Copy variation"
                        >
                          📋
                        </button>
                      </div>
                      <p className="variation-content">{variation}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hashtags */}
              <div className="hashtags-section">
                <h3>Hashtags</h3>
                <div className="hashtags-grid">
                  {generatedCopy.hashtags.map((hashtag, index) => (
                    <span 
                      key={index} 
                      className="hashtag-tag"
                      onClick={() => handleCopyToClipboard(hashtag)}
                    >
                      {hashtag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Character Count */}
              <div className="stats-section">
                <div className="stat-item">
                  <span className="stat-label">Title Length</span>
                  <span className="stat-value">
                    {generatedCopy.characterCount?.title || 0}/30 chars
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Description Length</span>
                  <span className="stat-value">
                    {generatedCopy.characterCount?.description || 0}/90 chars
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Generated</span>
                  <span className="stat-value">
                    {new Date(generatedCopy.generatedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button className="action-btn primary" onClick={handleCopyAll}>
                  📋 Copy All
                </button>
                <button className="action-btn secondary" onClick={handleRegenerate}>
                  🔄 Regenerate
                </button>
                {user && (
                  <button 
                    className={`action-btn ${saveStatus === 'success' ? 'success' : 'secondary'}`}
                    onClick={handleSave}
                    disabled={saveStatus === 'success'}
                  >
                    {saveStatus === 'success' ? '✅ Saved!' : '💾 Save'}
                  </button>
                )}
              </div>

              {!user && (
                <div className="login-prompt">
                  <p>💡 <strong>Login to save your ad copies</strong> and access your history!</p>
                </div>
              )}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">✨</div>
              <h3>Your ad copy will appear here</h3>
              <p>Fill out the form and generate professional ad copy using real AI</p>
              
              {/* Quick Start Examples */}
              <div className="quick-examples">
                <h4>Try these examples:</h4>
                <div className="example-buttons">
                  <button 
                    className="example-btn"
                    onClick={() => setFormData({
                      ...formData,
                      productName: 'Smart Fitness Tracker',
                      productDescription: 'Advanced fitness tracker with heart rate monitoring, sleep tracking, and 30-day battery life. Perfect for athletes and health enthusiasts.',
                      keywords: 'heart rate, sleep tracking, waterproof, long battery'
                    })}
                  >
                    🏃 Fitness Tracker
                  </button>
                  <button 
                    className="example-btn"
                    onClick={() => setFormData({
                      ...formData,
                      productName: 'Project Management Software',
                      productDescription: 'Collaborative project management tool with real-time updates, task assignment, and progress tracking for teams of all sizes.',
                      keywords: 'collaboration, real-time, task management, team'
                    })}
                  >
                    💼 Project Software
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User History Section */}
      {user && userHistory.length > 0 && (
        <div className="history-section">
          <div className="section-header">
            <h2>Recent Ad Copies</h2>
            <button 
              className="toggle-history"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} History
            </button>
          </div>
          
          {showHistory && (
            <div className="history-grid">
              {userHistory.map((item, index) => (
                <div key={index} className="history-card">
                  <div className="history-header">
                    <span className="history-platform">
                      {platformConfigs[item.platform]?.icon} {platformConfigs[item.platform]?.name}
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="history-title">{item.productName}</h4>
                  <p className="history-desc">{item.productDescription.substring(0, 100)}...</p>
                  <button 
                    className="view-history-btn"
                    onClick={() => {
                      setFormData({
                        productName: item.productName,
                        productDescription: item.productDescription,
                        platform: item.platform,
                        adFormat: item.adFormat,
                        tone: item.tone,
                        targetAudience: item.targetAudience,
                        keywords: item.keywords?.join(', ') || '',
                        cta: item.cta
                      });
                      setGeneratedCopy(item.generatedCopy);
                    }}
                  >
                    Reuse This
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <div id="features" data-section="features" className="features-section">
        <h2>Powerful Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon feature-icon-target">
              <span className="feature-icon-badge"><BsBullseye size={34} /></span>
            </div>
            <h3>Platform-Optimized</h3>
            <p>Generate ad copy specifically tailored for each platform&apos;s best practices and character limits.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-ai">
              <span className="feature-icon-badge"><BsCpu size={34} /></span>
            </div>
            <h3>AI-Powered</h3>
            <p>Leverage advanced AI to create compelling, human-like ad copy that converts.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-chart">
              <span className="feature-icon-badge"><BsBarChartLine size={34} /></span>
            </div>
            <h3>Multiple Variations</h3>
            <p>Get several ad copy options to A/B test and find what works best for your audience.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon feature-icon-speed">
              <span className="feature-icon-badge"><BsLightningCharge size={34} /></span>
            </div>
            <h3>Instant Generation</h3>
            <p>Create professional ad copy in seconds, not hours. Speed up your marketing workflow.</p>
          </div>
        </div>
      </div>

      <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
        <h2>How It Works</h2>
        <div className="tool-resource-grid">
          <div className="tool-resource-card">
            <h3>Describe the Offer</h3>
            <p>Feed the generator with product details, target audience, benefits, and CTA direction so the output is aligned to the campaign goal.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Match the Platform</h3>
            <p>Select the ad platform and format to guide tone, length, and structural choices that fit how people consume ads there.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Generate Variations</h3>
            <p>Review multiple hook angles, messaging patterns, and CTA combinations to identify what feels most persuasive for your audience.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Save Winning Copy</h3>
            <p>Use the history and save flow to keep top-performing styles available for future campaigns, split tests, and client work.</p>
          </div>
        </div>
      </section>

      <section id="best-practices" data-section="best-practices" className="tool-resource-section">
        <h2>Best Practices</h2>
        <div className="tool-resource-grid">
          <div className="tool-resource-card">
            <h3>Lead with the Hook</h3>
            <p>Make the first line unmistakably relevant. Good ad copy earns attention immediately before it explains the offer.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Prioritize One Promise</h3>
            <p>Strong ads focus on one core value proposition instead of trying to communicate every product feature at once.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Write for the Scroll</h3>
            <p>Keep copy sharp, skimmable, and benefit-led so it performs well in crowded feeds and paid placement environments.</p>
          </div>
          <div className="tool-resource-card">
            <h3>Test CTA Variants</h3>
            <p>Run multiple CTA styles such as “Learn More,” “Book a Demo,” or “Start Free” to match buying intent more precisely.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdCopyGenerator;
