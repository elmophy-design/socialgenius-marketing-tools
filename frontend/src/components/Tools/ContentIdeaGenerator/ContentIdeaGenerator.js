import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsBullseye, BsBarChartLine, BsCpu, BsCalendar2Week } from 'react-icons/bs';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './ContentIdeaGenerator.css';

function ContentIdeaGenerator() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    niche: '',
    targetAudience: '',
    contentType: 'blog',
    contentFormat: 'how-to',
    tone: 'professional',
    ideaCount: '10',
    keywords: '',
    goal: 'education'
  });

  // Results state
  const [ideas, setIdeas] = useState([]);
  const [calendar, setCalendar] = useState([]);
  const [metadata, setMetadata] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Generate content ideas
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'content-idea-generate',
      actionLabel: 'generate content ideas',
      toolName: 'Content Idea Generator',
    })) {
      return;
    }
    
    // Validation
    if (!formData.niche || !formData.targetAudience) {
      setError('Please fill in niche and target audience');
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/content-idea/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setIdeas(response.data.data.ideas);
        setCalendar(response.data.data.calendar);
        setMetadata(response.data.data.metadata);
        setShowResults(true);
        
        // Scroll to results
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
        'Failed to generate ideas. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Save all ideas
  const handleSaveIdeas = () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'content-idea-save',
      actionLabel: 'save generated ideas',
      toolName: 'Content Idea Generator',
    })) {
      return;
    }

    const dataStr = JSON.stringify(ideas, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `content-ideas-${formData.niche}-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Copy idea to clipboard
  const handleCopyIdea = (idea) => {
    const text = `${idea.title}\n\n${idea.description}\n\nTags: ${idea.tags.join(', ')}`;
    navigator.clipboard.writeText(text);
    alert('Idea copied to clipboard!');
  };

  return (
    <div className="content-idea-generator">
      {/* Header */}
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <div className="tool-title">
              <span className="tool-icon">💡</span>
              <h1>Content Idea Generator</h1>
            </div>
            <p className="tool-subtitle">
              Never run out of content ideas again. Generate blog topics, social media posts, video ideas, and more in seconds.
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Input Section */}
          <section id="how-it-works" data-section="how-it-works" className="input-section">
            <h2>Generate Content Ideas</h2>
            
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label htmlFor="niche">Your Niche/Industry *</label>
                <input
                  type="text"
                  id="niche"
                  name="niche"
                  className="form-input"
                  placeholder="e.g., Digital Marketing, Fitness, Cooking"
                  value={formData.niche}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="targetAudience">Target Audience *</label>
                <input
                  type="text"
                  id="targetAudience"
                  name="targetAudience"
                  className="form-input"
                  placeholder="e.g., Small Business Owners, Fitness Enthusiasts"
                  value={formData.targetAudience}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="contentType">Content Type</label>
                  <select
                    id="contentType"
                    name="contentType"
                    className="form-select"
                    value={formData.contentType}
                    onChange={handleChange}
                  >
                    <option value="blog">Blog Posts</option>
                    <option value="social-media">Social Media</option>
                    <option value="video">Video Content</option>
                    <option value="podcast">Podcast Episodes</option>
                    <option value="email">Email Newsletter</option>
                    <option value="ebook">E-book/Guide</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="contentFormat">Content Format</label>
                  <select
                    id="contentFormat"
                    name="contentFormat"
                    className="form-select"
                    value={formData.contentFormat}
                    onChange={handleChange}
                  >
                    <option value="how-to">How-to Guides</option>
                    <option value="list">Listicles</option>
                    <option value="tips">Tips & Tricks</option>
                    <option value="case-study">Case Studies</option>
                    <option value="review">Reviews</option>
                    <option value="trends">Trend Analysis</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tone">Tone of Voice</label>
                  <select
                    id="tone"
                    name="tone"
                    className="form-select"
                    value={formData.tone}
                    onChange={handleChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual/Friendly</option>
                    <option value="authoritative">Authoritative</option>
                    <option value="humorous">Humorous</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="ideaCount">Number of Ideas</label>
                  <select
                    id="ideaCount"
                    name="ideaCount"
                    className="form-select"
                    value={formData.ideaCount}
                    onChange={handleChange}
                  >
                    <option value="5">5 Ideas</option>
                    <option value="10">10 Ideas</option>
                    <option value="15">15 Ideas</option>
                    <option value="20">20 Ideas</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="keywords">Keywords/Topics (Optional)</label>
                <input
                  type="text"
                  id="keywords"
                  name="keywords"
                  className="form-input"
                  placeholder="e.g., SEO, content marketing, social media strategy"
                  value={formData.keywords}
                  onChange={handleChange}
                />
                <small className="input-hint">Separate with commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="goal">Content Goal</label>
                <select
                  id="goal"
                  name="goal"
                  className="form-select"
                  value={formData.goal}
                  onChange={handleChange}
                >
                  <option value="education">Educate Audience</option>
                  <option value="entertainment">Entertain</option>
                  <option value="conversion">Drive Conversions</option>
                  <option value="awareness">Brand Awareness</option>
                  <option value="engagement">Increase Engagement</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating Ideas...
                  </>
                ) : (
                  'Generate Ideas'
                )}
              </button>
            </form>
          </section>

          {/* Results Section */}
          <section className="results-section" id="results-section">
            <h2>Content Ideas</h2>

            {!showResults && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">✨</div>
                <h3>Your content ideas will appear here</h3>
                <p>Fill out the form and click "Generate Ideas" to get creative content suggestions</p>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>AI is brainstorming creative ideas for you...</p>
              </div>
            )}

            {showResults && ideas.length > 0 && (
              <div className="results-content">
                <div className="results-header">
                  <div className="results-badge">
                    {metadata?.contentType?.replace('-', ' ') || 'Content Ideas'}
                  </div>
                  <div className="results-count">
                    {ideas.length} ideas generated
                  </div>
                </div>

                <div className="ideas-grid">
                  {ideas.map((idea, index) => (
                    <div key={index} className="idea-card">
                      <div className="idea-header">
                        <div className="idea-type">{idea.type}</div>
                        <div className={`engagement-badge ${idea.engagement?.toLowerCase()}`}>
                          {idea.engagement || 'Medium'} Engagement
                        </div>
                      </div>
                      <h3 className="idea-title">{idea.title}</h3>
                      <p className="idea-description">{idea.description}</p>
                      <div className="idea-meta">
                        {idea.tags?.map((tag, i) => (
                          <span key={i} className="meta-tag">{tag}</span>
                        ))}
                      </div>
                      <button 
                        className="copy-btn"
                        onClick={() => handleCopyIdea(idea)}
                      >
                        📋 Copy Idea
                      </button>
                    </div>
                  ))}
                </div>

                {/* Content Calendar */}
                {showCalendar && calendar.length > 0 && (
                  <div className="content-calendar">
                    <h3>📅 Content Calendar Suggestions</h3>
                    <p className="calendar-subtitle">
                      Suggested publishing schedule for the next 4 weeks
                    </p>
                    <div className="calendar-grid">
                      {calendar.map((item, index) => (
                        <div key={index} className="calendar-item">
                          <div className="calendar-date">
                            <strong>{item.dayOfWeek}</strong>
                            <br />
                            {new Date(item.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="calendar-week">Week {item.week}</div>
                          <div className="calendar-idea">{item.title}</div>
                          <div className="calendar-type">{item.type}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="actions-section">
                  <button className="action-btn" onClick={handleSaveIdeas}>
                    <span>💾</span> Save All Ideas
                  </button>
                  <button 
                    className="action-btn secondary" 
                    onClick={handleGenerate}
                  >
                    <span>🔄</span> Generate More
                  </button>
                  <button 
                    className="action-btn secondary" 
                    onClick={() => setShowCalendar(!showCalendar)}
                  >
                    <span>📅</span> {showCalendar ? 'Hide' : 'Show'} Calendar
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Features Section */}
        <section id="features" data-section="features" className="features-section">
          <h2>Powerful Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-target"><span className="feature-icon-badge"><BsBullseye size={34} /></span></div>
              <h3>Niche-Specific Ideas</h3>
              <p>Get content ideas tailored to your specific industry and target audience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-chart"><span className="feature-icon-badge"><BsBarChartLine size={34} /></span></div>
              <h3>Multiple Formats</h3>
              <p>Generate ideas for blogs, social media, videos, podcasts, and more.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-ai"><span className="feature-icon-badge"><BsCpu size={34} /></span></div>
              <h3>AI-Powered</h3>
              <p>Leverage advanced AI to create unique, engaging content ideas.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-calendar"><span className="feature-icon-badge"><BsCalendar2Week size={34} /></span></div>
              <h3>Content Calendar</h3>
              <p>Get scheduling suggestions to plan your content strategy.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
          <h2>How It Works</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Define Your Audience</h3>
              <p>Start with a niche, audience, content type, and goal so the generator can shape ideas around a clear marketing outcome.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Guide the AI Direction</h3>
              <p>Use tone, format, keywords, and idea count to control whether you want broad discovery, campaign concepts, or a focused editorial plan.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Review the Idea Set</h3>
              <p>Evaluate topic variety, search intent, and engagement potential across the generated list before choosing what deserves production time.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Turn Ideas into Calendar Plans</h3>
              <p>Use the calendar suggestions to group ideas into weekly publishing themes, launch sequences, and repeatable content pillars.</p>
            </div>
          </div>
        </section>

        <section id="best-practices" data-section="best-practices" className="tool-resource-section">
          <h2>Best Practices</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Use Specific Inputs</h3>
              <p>Detailed audience and niche information produces stronger ideas than broad labels like “business” or “marketing.”</p>
            </div>
            <div className="tool-resource-card">
              <h3>Mix Short and Long Horizon Ideas</h3>
              <p>Blend quick-win posts with evergreen topics so your content pipeline supports both immediate engagement and long-term traffic.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Cluster Around Themes</h3>
              <p>Group ideas into campaigns, series, or monthly pillars so one idea can lead to multiple channel-ready assets.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Validate Before Producing</h3>
              <p>Check search demand, competitor saturation, and audience fit before investing in execution, especially for high-effort formats.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="tool-footer">
        <div className="container">
          <p>&copy; 2024 Content Idea Generator. All rights reserved.</p>
          <p>Never run out of creative content ideas again.</p>
        </div>
      </footer>
    </div>
  );
}

export default ContentIdeaGenerator;


