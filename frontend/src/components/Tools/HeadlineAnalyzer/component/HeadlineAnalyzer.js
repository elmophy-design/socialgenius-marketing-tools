import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BsBarChartLine, BsSearch, BsArrowRepeat, BsBullseye } from 'react-icons/bs';
import { guardToolAction, handleToolActionError } from '../../../../utils/toolAccessGuard';
import './HeadlineAnalyzer.css';

function HeadlineAnalyzer() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    headline: '',
    contentType: 'blog',
    targetAudience: 'general',
    tone: 'neutral',
    platform: 'web'
  });

  // Results state
  const [analysis, setAnalysis] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Character count
  const charCount = formData.headline.length;
  const maxChars = 200;

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Analyze headline
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError('');

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'headline-analyze',
      actionLabel: 'analyze headlines',
      toolName: 'Headline Analyzer',
    })) {
      return;
    }
    
    if (!formData.headline.trim()) {
      setError('Please enter a headline to analyze');
      return;
    }

    if (formData.headline.length > maxChars) {
      setError(`Headline is too long (max ${maxChars} characters)`);
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/headline/analyze`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAnalysis(response.data.data);
        setShowResults(true);
        
        // Scroll to results
        setTimeout(() => {
          document.getElementById('results-section')?.scrollIntoView({ 
            behavior: 'smooth' 
          });
        }, 100);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      if (handleToolActionError(err, navigate)) {
        return;
      }
      setError(
        err.response?.data?.message || 
        'Failed to analyze headline. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate alternative headlines
  const handleGenerateAlternatives = async () => {
    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'headline-alternatives',
      actionLabel: 'generate headline alternatives',
      toolName: 'Headline Analyzer',
    })) {
      return;
    }

    if (!formData.headline.trim()) {
      setError('Please enter a headline first');
      return;
    }

    setLoadingAlternatives(true);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/headline/alternatives`,
        { headline: formData.headline, count: 5 },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setAlternatives(response.data.data.alternatives);
      }
    } catch (err) {
      console.error('Alternatives error:', err);
      if (handleToolActionError(err, navigate)) {
        return;
      }
      setError('Failed to generate alternatives');
    } finally {
      setLoadingAlternatives(false);
    }
  };

  // Update score circle with animation
  const updateScoreCircle = useCallback((score) => {
    const circle = document.getElementById('score-circle');
    if (circle) {
      const percentage = score;
      const color = getScoreColor(score);
      circle.style.background = `conic-gradient(${color} ${percentage}%, #e9ecef ${percentage}%)`;
    }
  }, []);

  // Update score circle animation
  useEffect(() => {
    if (analysis && showResults) {
      updateScoreCircle(analysis.overallScore);
    }
  }, [analysis, showResults, updateScoreCircle]);

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    if (score >= 40) return '#ff6b35';
    return '#dc3545';
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A': '#28a745',
      'B': '#17a2b8',
      'C': '#ffc107',
      'D': '#ff6b35',
      'F': '#dc3545'
    };
    return colors[grade] || '#6c757d';
  };

  // Test alternative headline
  const testAlternative = (headline) => {
    setFormData({ ...formData, headline });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="headline-analyzer">
      {/* Header */}
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <div className="tool-title">
              <span className="tool-icon">🚀</span>
              <h1>Headline Analyzer</h1>
            </div>
            <p className="tool-subtitle">
              Optimize your headlines for maximum impact, engagement, and SEO performance
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Input Section */}
          <section className="input-section">
            <h2>Analyze Your Headline</h2>
            
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleAnalyze}>
              <div className="headline-input-container">
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="headline-input"
                    name="headline"
                    placeholder="Enter your headline here..."
                    value={formData.headline}
                    onChange={handleChange}
                    maxLength={maxChars}
                    required
                  />
                  <span className="char-counter">
                    {charCount}/{maxChars}
                  </span>
                </div>
                
                <button 
                  type="submit" 
                  className="analyze-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-small"></span>
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Headline'
                  )}
                </button>
              </div>

              <div className="input-options">
                <div className="option-group">
                  <label htmlFor="contentType">Content Type</label>
                  <select
                    className="option-select"
                    id="contentType"
                    name="contentType"
                    value={formData.contentType}
                    onChange={handleChange}
                  >
                    <option value="blog">Blog Post</option>
                    <option value="news">News Article</option>
                    <option value="product">Product Page</option>
                    <option value="email">Email Subject</option>
                    <option value="social">Social Media</option>
                    <option value="ad">Advertisement</option>
                  </select>
                </div>

                <div className="option-group">
                  <label htmlFor="targetAudience">Target Audience</label>
                  <select
                    className="option-select"
                    id="targetAudience"
                    name="targetAudience"
                    value={formData.targetAudience}
                    onChange={handleChange}
                  >
                    <option value="general">General Audience</option>
                    <option value="business">Business Professionals</option>
                    <option value="tech">Tech Enthusiasts</option>
                    <option value="marketers">Marketers</option>
                    <option value="consumers">Consumers</option>
                  </select>
                </div>

                <div className="option-group">
                  <label htmlFor="tone">Desired Tone</label>
                  <select
                    className="option-select"
                    id="tone"
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                  >
                    <option value="neutral">Neutral/Informative</option>
                    <option value="urgent">Urgent</option>
                    <option value="emotional">Emotional</option>
                    <option value="curious">Curious/Questioning</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                </div>

                <div className="option-group">
                  <label htmlFor="platform">Platform</label>
                  <select
                    className="option-select"
                    id="platform"
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                  >
                    <option value="web">Website/Blog</option>
                    <option value="facebook">Facebook</option>
                    <option value="twitter">Twitter</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            </form>
          </section>

          {/* Results Section */}
          <section className="results-section" id="results-section">
            <h2>Analysis Results</h2>

            {!showResults && !loading && (
              <div className="results-placeholder">
                <div className="score-card">
                  <h3>Overall Score</h3>
                  <div className="score-circle" id="score-circle">
                    <div className="score-circle-inner">
                      <div className="score-value">0</div>
                      <div className="score-label">out of 100</div>
                    </div>
                  </div>
                  <div className="score-description">
                    Enter a headline to see your score and analysis
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>AI is analyzing your headline...</p>
              </div>
            )}

            {showResults && analysis && (
              <div className="results-content">
                {/* Score Card */}
                <div className="score-card">
                  <h3>Overall Score</h3>
                  <div className="score-circle" id="score-circle">
                    <div className="score-circle-inner">
                      <div className="score-value" style={{ color: getScoreColor(analysis.overallScore) }}>
                        {analysis.overallScore}
                      </div>
                      <div className="score-label">out of 100</div>
                    </div>
                  </div>
                  <div 
                    className="grade-badge" 
                    style={{ background: getGradeColor(analysis.grade) }}
                  >
                    Grade: {analysis.grade}
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-value">{analysis.wordCount}</div>
                    <div className="metric-label">Word Count</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analysis.characterCount}</div>
                    <div className="metric-label">Character Count</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analysis.sentimentScore}</div>
                    <div className="metric-label">Sentiment Score</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-value">{analysis.readabilityScore}</div>
                    <div className="metric-label">Readability</div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {analysis.scoreBreakdown && (
                  <div className="score-breakdown">
                    <h3 className="section-title">Score Breakdown</h3>
                    <div className="breakdown-grid">
                      {Object.entries(analysis.scoreBreakdown).map(([key, value]) => (
                        <div key={key} className="breakdown-item">
                          <div className="breakdown-label">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </div>
                          <div className="breakdown-bar">
                            <div 
                              className="breakdown-fill"
                              style={{ 
                                width: `${value}%`,
                                background: getScoreColor(value)
                              }}
                            ></div>
                          </div>
                          <div className="breakdown-value">{value}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Emotional Impact */}
                {analysis.emotionalImpact && analysis.emotionalImpact.length > 0 && (
                  <div className="emotional-impact">
                    <h3 className="section-title">🎭 Emotional Impact</h3>
                    <div className="emotion-tags">
                      {analysis.emotionalImpact.map((emotion, index) => (
                        <span key={index} className="emotion-tag">{emotion}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Power Words */}
                {analysis.powerWords && analysis.powerWords.length > 0 && (
                  <div className="power-words-section">
                    <h3 className="section-title">⚡ Power Words Detected</h3>
                    <div className="power-words-list">
                      {analysis.powerWords.map((word, index) => (
                        <span key={index} className="power-word">{word}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Details */}
                <div className="analysis-details">
                  {/* Strengths */}
                  <div className="analysis-section">
                    <h3 className="section-title">✅ Strengths</h3>
                    <ul className="strengths-list">
                      {analysis.strengths?.map((strength, index) => (
                        <li key={index}>
                          <span className="strength-icon">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div className="analysis-section">
                    <h3 className="section-title">⚠️ Areas for Improvement</h3>
                    <ul className="improvements-list">
                      {analysis.improvements?.map((improvement, index) => (
                        <li key={index}>
                          <span className="improvement-icon">💡</span>
                          {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Optimization Suggestions */}
                  <div className="analysis-section">
                    <h3 className="section-title">💡 Optimization Suggestions</h3>
                    <div className="suggestions-grid">
                      {analysis.suggestions?.map((suggestion, index) => (
                        <div key={index} className="suggestion-card">
                          <div className="suggestion-title">{suggestion.title}</div>
                          <div className="suggestion-text">{suggestion.description}</div>
                          {suggestion.example && (
                            <div className="suggestion-example">
                              Example: "{suggestion.example}"
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Best Practices */}
                {analysis.bestPractices && (
                  <div id="best-practices" data-section="best-practices" className="best-practices">
                    <h3 className="section-title">📋 Best Practices</h3>
                    <div className="practices-grid">
                      <div className="practices-column met">
                        <h4>✅ Met</h4>
                        <ul>
                          {analysis.bestPractices.met?.map((practice, index) => (
                            <li key={index}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="practices-column missed">
                        <h4>❌ Missed</h4>
                        <ul>
                          {analysis.bestPractices.missed?.map((practice, index) => (
                            <li key={index}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Metrics */}
                <div className="additional-metrics">
                  <h3 className="section-title">📊 Additional Insights</h3>
                  <div className="metrics-list">
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.hasNumber ? '✅' : '❌'}
                      </span>
                      Contains Number: {analysis.metrics?.hasNumber ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.hasQuestion ? '✅' : '❌'}
                      </span>
                      Question Format: {analysis.metrics?.hasQuestion ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.hasEmoji ? '✅' : '❌'}
                      </span>
                      Uses Emoji: {analysis.metrics?.hasEmoji ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.allCaps ? '⚠️' : '✅'}
                      </span>
                      All Caps: {analysis.metrics?.allCaps ? 'Yes (Avoid)' : 'No (Good)'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Alternative Headlines Section */}
        {showResults && (
          <section className="comparison-section">
            <div className="comparison-header">
              <h3 className="comparison-title">🔄 Alternative Headlines</h3>
              <button 
                className="generate-btn"
                onClick={handleGenerateAlternatives}
                disabled={loadingAlternatives}
              >
                {loadingAlternatives ? 'Generating...' : 'Generate Alternatives'}
              </button>
            </div>

            {alternatives.length > 0 ? (
              <div className="comparison-cards">
                {alternatives.map((alt, index) => (
                  <div key={index} className="comparison-card">
                    <div className="comparison-score" style={{ background: getScoreColor(alt.score) }}>
                      Score: {alt.score}
                    </div>
                    <div className="comparison-text">{alt.headline}</div>
                    <div className="comparison-improvement">{alt.improvement}</div>
                    <button 
                      className="test-alt-btn"
                      onClick={() => testAlternative(alt.headline)}
                    >
                      Test This Version
                    </button>
                  </div>
                ))}
              </div>
            ) : analysis?.alternatives ? (
              <div className="comparison-cards">
                {analysis.alternatives.map((alt, index) => (
                  <div key={index} className="comparison-card">
                    <div className="comparison-score" style={{ background: getScoreColor(alt.score) }}>
                      Score: {alt.score}
                    </div>
                    <div className="comparison-text">{alt.headline}</div>
                    <div className="comparison-improvement">{alt.improvement}</div>
                    <button 
                      className="test-alt-btn"
                      onClick={() => testAlternative(alt.headline)}
                    >
                      Test This Version
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="comparison-placeholder">
                <p>Click "Generate Alternatives" to see improved variations</p>
              </div>
            )}
          </section>
        )}

        {/* Features Section */}
        <section id="features" data-section="features" className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-chart"><span className="feature-icon-badge"><BsBarChartLine size={34} /></span></div>
              <div className="feature-title">Comprehensive Analysis</div>
              <div className="feature-text">
                Get detailed insights on word count, character count, sentiment, and readability.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-search"><span className="feature-icon-badge"><BsSearch size={34} /></span></div>
              <div className="feature-title">SEO Optimization</div>
              <div className="feature-text">
                Learn how to optimize your headlines for search engines and higher click-through rates.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-refresh"><span className="feature-icon-badge"><BsArrowRepeat size={34} /></span></div>
              <div className="feature-title">Alternative Suggestions</div>
              <div className="feature-text">
                Generate multiple headline variations to test which performs best.
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon feature-icon-target"><span className="feature-icon-badge"><BsBullseye size={34} /></span></div>
              <div className="feature-title">Platform-Specific Advice</div>
              <div className="feature-text">
                Get tailored recommendations based on where your headline will be used.
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" data-section="how-it-works" className="how-it-works-section">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-title">Enter Your Headline</div>
              <div className="step-text">Type or paste your headline into the input field.</div>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-title">Set Your Parameters</div>
              <div className="step-text">Select content type, target audience, tone, and platform for tailored analysis.</div>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-title">Get Instant Analysis</div>
              <div className="step-text">Receive a comprehensive score and detailed feedback on your headline.</div>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <div className="step-title">Optimize & Improve</div>
              <div className="step-text">Use the suggestions and alternative headlines to create the perfect headline.</div>
            </div>
          </div>
        </section>

        <section id="best-practices" data-section="best-practices" className="tool-resource-section">
          <h2>Best Practices</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Make the Promise Clear</h3>
              <p>Readers should understand the value of clicking in seconds. Clarity consistently outperforms vague cleverness.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Use Emotional Precision</h3>
              <p>Good headlines trigger curiosity, urgency, or confidence, but they still need to feel truthful and relevant.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Match the Channel</h3>
              <p>Search, email, landing pages, and social posts each reward different headline styles. Optimize for the actual destination.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Test Multiple Structures</h3>
              <p>Try questions, lists, promises, and benefit-led headlines to find the pattern that earns the best response from your audience.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="tool-footer">
        <div className="container">
          <p>&copy; 2024 Headline Analyzer Tool. All rights reserved.</p>
          <p>Designed to help you create better headlines that convert.</p>
        </div>
      </footer>
    </div>
  );
}

export default HeadlineAnalyzer;


