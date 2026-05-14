import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { guardToolAction, handleToolActionError } from '../../../utils/toolAccessGuard';
import './EmailSubjectTester.css';

function EmailSubjectTester() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    subjectLine: '',
    industry: 'marketing',
    targetAudience: 'general',
    emailType: 'promotional',
    tone: 'professional'
  });

  // Results state
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);

  // Example subjects for quick testing
  const examples = [
    "🎉 Limited Time: 50% Off Everything!",
    "Your Weekly Marketing Insights Are Here",
    "Don't Miss Out: Last Chance to Save Big",
    "John, We Have Something Special For You",
    "5 Proven Strategies to Double Your Revenue"
  ];

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Load example
  const loadExample = (example) => {
    setFormData({
      ...formData,
      subjectLine: example
    });
  };

  // Test subject line
  const handleTest = async (e) => {
    e.preventDefault();
    setError('');

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'email-subject-test',
      actionLabel: 'test email subject lines',
      toolName: 'Email Subject Line Tester',
    })) {
      return;
    }
    
    if (!formData.subjectLine.trim()) {
      setError('Please enter a subject line to test');
      return;
    }

    if (formData.subjectLine.length > 150) {
      setError('Subject line is too long (max 150 characters)');
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/email-tester/test`,
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
      console.error('Test error:', err);
      if (handleToolActionError(err, navigate)) {
        return;
      }
      setError(
        err.response?.data?.message || 
        'Failed to analyze subject line. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Get score color
  const getScoreColor = (score) => {
    if (score >= 80) return '#10B981';
    if (score >= 60) return '#F59E0B';
    return '#EF4444';
  };

  // Get grade color
  const getGradeColor = (grade) => {
    const colors = {
      'A': '#10B981',
      'B': '#3B82F6',
      'C': '#F59E0B',
      'D': '#EF4444',
      'F': '#DC2626'
    };
    return colors[grade] || '#6B7280';
  };

  return (
    <div className="email-subject-tester">
      {/* Header */}
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <div className="tool-title">
              <span className="tool-icon">✉️</span>
              <h1>Email Subject Line Tester</h1>
            </div>
            <p className="tool-subtitle">
              Test and optimize your email subject lines for better open rates and engagement
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Input Section */}
          <section id="how-it-works" data-section="how-it-works" className="input-section">
            <h2>Test Your Subject Line</h2>
            
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleTest}>
              <div className="form-group">
                <label htmlFor="subjectLine">
                  Email Subject Line *
                  <span className="char-count">
                    {formData.subjectLine.length}/150
                  </span>
                </label>
                <textarea
                  id="subjectLine"
                  name="subjectLine"
                  className="form-textarea"
                  placeholder="Enter your email subject line here..."
                  value={formData.subjectLine}
                  onChange={handleChange}
                  required
                  maxLength={150}
                  rows={3}
                />
                <small className="input-hint">
                  Best practices: 40-50 characters, avoid spam words, use personalization
                </small>
              </div>

              {/* Quick Examples */}
              <div className="examples-section">
                <label>Quick Examples:</label>
                <div className="examples-grid">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      className="example-btn"
                      onClick={() => loadExample(example)}
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="industry">Industry</label>
                  <select
                    id="industry"
                    name="industry"
                    className="form-select"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS/Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="other">Other</option>
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
                    <option value="general">General</option>
                    <option value="b2b">B2B Professionals</option>
                    <option value="b2c">B2C Consumers</option>
                    <option value="millennials">Millennials</option>
                    <option value="gen-z">Gen Z</option>
                    <option value="executives">Executives</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="emailType">Email Type</label>
                  <select
                    id="emailType"
                    name="emailType"
                    className="form-select"
                    value={formData.emailType}
                    onChange={handleChange}
                  >
                    <option value="promotional">Promotional</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="transactional">Transactional</option>
                    <option value="announcement">Announcement</option>
                    <option value="welcome">Welcome Email</option>
                    <option value="re-engagement">Re-engagement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="tone">Tone</label>
                  <select
                    id="tone"
                    name="tone"
                    className="form-select"
                    value={formData.tone}
                    onChange={handleChange}
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="urgent">Urgent</option>
                    <option value="friendly">Friendly</option>
                    <option value="authoritative">Authoritative</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="test-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>🔍</span>
                    Test Subject Line
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results Section */}
          <section className="results-section" id="results-section">
            <h2>Analysis Results</h2>

            {!showResults && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">📊</div>
                <h3>Your analysis will appear here</h3>
                <p>Enter a subject line and click "Test Subject Line" to see detailed insights</p>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>AI is analyzing your subject line...</p>
              </div>
            )}

            {showResults && analysis && (
              <div className="results-content">
                {/* Score Overview */}
                <div className="score-overview">
                  <div className="score-circle" style={{ borderColor: getScoreColor(analysis.overallScore) }}>
                    <div className="score-value" style={{ color: getScoreColor(analysis.overallScore) }}>
                      {analysis.overallScore}
                    </div>
                    <div className="score-label">Overall Score</div>
                  </div>
                  <div className="grade-badge" style={{ background: getGradeColor(analysis.grade) }}>
                    Grade: {analysis.grade}
                  </div>
                </div>

                <div className="verdict-box">
                  <strong>📝 Verdict:</strong> {analysis.verdict}
                </div>

                {/* Key Metrics */}
                <div className="metrics-grid">
                  <div className="metric-card">
                    <div className="metric-icon">📈</div>
                    <div className="metric-label">Open Rate</div>
                    <div className="metric-value">{analysis.openRatePrediction}</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">🚫</div>
                    <div className="metric-label">Spam Score</div>
                    <div className="metric-value">
                      {analysis.spamScore}/10
                      <span className={`spam-status ${analysis.spamScore <= 3 ? 'good' : analysis.spamScore <= 6 ? 'warning' : 'danger'}`}>
                        {analysis.spamScore <= 3 ? 'Low Risk' : analysis.spamScore <= 6 ? 'Medium' : 'High Risk'}
                      </span>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">📱</div>
                    <div className="metric-label">Character Count</div>
                    <div className="metric-value">
                      {analysis.characterCount}
                      <small>{analysis.characterRecommendation}</small>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon">📊</div>
                    <div className="metric-label">Word Count</div>
                    <div className="metric-value">{analysis.metrics?.wordCount || 0} words</div>
                  </div>
                </div>

                {/* Mobile Preview */}
                <div className="mobile-preview">
                  <h3>📱 Mobile Preview</h3>
                  <div className="preview-box">
                    <div className="preview-device">
                      <div className="preview-screen">
                        <div className="preview-header">
                          <div className="preview-sender">Sender Name</div>
                          <div className="preview-time">Now</div>
                        </div>
                        <div className="preview-subject">{analysis.mobilePreview}</div>
                        <div className="preview-preheader">Preheader text appears here...</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Emotion Analysis */}
                {analysis.emotionAnalysis && (
                  <div className="emotion-section">
                    <h3>🎭 Emotion Analysis</h3>
                    <div className="emotion-grid">
                      <div className="emotion-item">
                        <strong>Primary:</strong> {analysis.emotionAnalysis.primary}
                      </div>
                      <div className="emotion-item">
                        <strong>Secondary:</strong> {analysis.emotionAnalysis.secondary}
                      </div>
                      <div className="emotion-item">
                        <strong>Impact:</strong> 
                        <span className={`impact-badge ${analysis.emotionAnalysis.impact.toLowerCase()}`}>
                          {analysis.emotionAnalysis.impact}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Power Words */}
                {analysis.powerWords && analysis.powerWords.length > 0 && (
                  <div className="power-words-section">
                    <h3>⚡ Power Words Detected</h3>
                    <div className="power-words-list">
                      {analysis.powerWords.map((word, index) => (
                        <span key={index} className="power-word">{word}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths & Weaknesses */}
                <div className="feedback-grid">
                  <div className="feedback-card strengths">
                    <h3>✅ Strengths</h3>
                    <ul>
                      {analysis.strengths?.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="feedback-card weaknesses">
                    <h3>⚠️ Weaknesses</h3>
                    <ul>
                      {analysis.weaknesses?.map((weakness, index) => (
                        <li key={index}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Improvement Suggestions */}
                <div className="suggestions-section">
                  <h3>💡 Improvement Suggestions</h3>
                  <ol className="suggestions-list">
                    {analysis.suggestions?.map((suggestion, index) => (
                      <li key={index}>{suggestion}</li>
                    ))}
                  </ol>
                </div>

                {/* A/B Test Variations */}
                {analysis.abTestVariations && (
                  <div className="ab-test-section">
                    <h3>🧪 A/B Test Variations</h3>
                    <p className="ab-subtitle">Try these alternative subject lines:</p>
                    <div className="variations-grid">
                      {analysis.abTestVariations.map((variation, index) => (
                        <div key={index} className="variation-card">
                          <div className="variation-label">Version {String.fromCharCode(66 + index)}</div>
                          <div className="variation-text">{variation}</div>
                          <button 
                            className="test-variation-btn"
                            onClick={() => setFormData({ ...formData, subjectLine: variation })}
                          >
                            Test This Version
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Best Time to Send */}
                {analysis.bestTimeToSend && (
                  <div className="best-time-section">
                    <h3>⏰ Best Time to Send</h3>
                    <div className="time-info">
                      <div className="time-day">
                        <strong>{analysis.bestTimeToSend.day}</strong> at{' '}
                        <strong>{analysis.bestTimeToSend.time}</strong>
                      </div>
                      <p className="time-reason">{analysis.bestTimeToSend.reason}</p>
                    </div>
                  </div>
                )}

                {/* Additional Metrics */}
                <div className="additional-metrics">
                  <h3>📊 Additional Insights</h3>
                  <div className="metrics-list">
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.hasEmoji ? '✅' : '❌'}
                      </span>
                      Emoji Usage: {analysis.metrics?.hasEmoji ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.hasNumbers ? '✅' : '❌'}
                      </span>
                      Numbers: {analysis.metrics?.hasNumbers ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.personalization ? '✅' : '❌'}
                      </span>
                      Personalization: {analysis.metrics?.personalization ? 'Yes' : 'No'}
                    </div>
                    <div className="metric-item">
                      <span className="metric-icon">
                        {analysis.metrics?.allCaps ? '⚠️' : '✅'}
                      </span>
                      All Caps: {analysis.metrics?.allCaps ? 'Yes (Avoid)' : 'No (Good)'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="actions-section">
                  <button className="action-btn" onClick={handleTest}>
                    <span>🔄</span> Test Another
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => {
                      const text = `Email Subject Line Analysis\n\nSubject: ${analysis.subjectLine}\nScore: ${analysis.overallScore}/100\nGrade: ${analysis.grade}\nOpen Rate: ${analysis.openRatePrediction}\n\nStrengths:\n${analysis.strengths?.join('\n')}\n\nSuggestions:\n${analysis.suggestions?.join('\n')}`;
                      navigator.clipboard.writeText(text);
                      alert('Analysis copied to clipboard!');
                    }}
                  >
                    <span>📋</span> Copy Analysis
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <section id="features" data-section="features" className="tool-resource-section">
          <h2>Features</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Score-Based Feedback</h3>
              <p>Review a simple overall score plus targeted analysis on strength, weakness, and likely open-rate performance.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Mobile Preview</h3>
              <p>Check how your subject line may appear in limited mobile inbox space before sending your campaign.</p>
            </div>
            <div className="tool-resource-card">
              <h3>A/B Variation Ideas</h3>
              <p>Generate alternate subject lines that you can test for curiosity, urgency, clarity, or personalization.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Spam and Tone Signals</h3>
              <p>Spot risks like all caps, weak emotional framing, overuse of trigger language, or poor timing cues.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
          <h2>How It Works</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Enter the Subject Line</h3>
              <p>Start with the exact subject line you plan to send so the tool evaluates the real wording, not an abstract concept.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Set Campaign Context</h3>
              <p>Audience, industry, email type, and tone help the analysis weigh relevance, clarity, and likely message fit.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Read the Breakdown</h3>
              <p>Use the strengths, weaknesses, emotional cues, and suggestions to decide whether to refine or ship the line.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Test Better Variations</h3>
              <p>Compare the generated alternatives so you can move from a decent subject line to one that earns more opens.</p>
            </div>
          </div>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices" data-section="best-practices" className="best-practices-section">
          <h2>📚 Email Subject Line Best Practices</h2>
          <div className="practices-grid">
            <div className="practice-card">
              <div className="practice-icon">📏</div>
              <h3>Optimal Length</h3>
              <p>Keep subject lines between 40-50 characters for best results. Mobile devices typically show 30-40 characters.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🎯</div>
              <h3>Personalization</h3>
              <p>Use recipient's name or company. Personalized subject lines increase open rates by 26%.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">⚡</div>
              <h3>Power Words</h3>
              <p>Use action words like "Discover", "Exclusive", "Limited", "New", "Free" to grab attention.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🚫</div>
              <h3>Avoid Spam Triggers</h3>
              <p>Avoid ALL CAPS, excessive punctuation!!!, and words like "FREE", "SALE", "ACT NOW".</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🔢</div>
              <h3>Use Numbers</h3>
              <p>Numbers and statistics increase credibility. "5 Ways" performs better than "Ways to".</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">😊</div>
              <h3>Emojis (Sparingly)</h3>
              <p>One relevant emoji can increase open rates by 15-20%, but don't overdo it.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="tool-footer">
        <div className="container">
          <p>&copy; 2024 Email Subject Line Tester. All rights reserved.</p>
          <p>Optimize your email campaigns for maximum engagement.</p>
        </div>
      </footer>
    </div>
  );
}

export default EmailSubjectTester;
