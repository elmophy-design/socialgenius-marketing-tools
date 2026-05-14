import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { guardToolAction, handleToolActionError } from '../../../../utils/toolAccessGuard';
import './ValuePropositionGenerator.css';

function ValuePropositionGenerator() {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    brand: '',
    industry: 'technology',
    targetAudience: 'small-businesses',
    primaryGoal: 'increase-sales',
    uniqueStrength: '',
    problemSolved: '',
    competitorDifference: ''
  });

  // Results state
  const [valueProposition, setValueProposition] = useState(null);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [copiedField, setCopiedField] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  // Generate value proposition
  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');

    if (!guardToolAction({
      navigate,
      requiredPlan: 'basic',
      source: 'value-proposition-generate',
      actionLabel: 'generate value propositions',
      toolName: 'Value Proposition Generator',
    })) {
      return;
    }
    
    if (!formData.brand.trim()) {
      setError('Please enter your brand name');
      return;
    }

    setLoading(true);
    setShowResults(false);

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/tools/value-proposition/generate`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setValueProposition(response.data.data);
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
        'Failed to generate value proposition. Please try again.'
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

  return (
    <div className="value-proposition-generator">
      {/* Header */}
      <header className="tool-header">
        <div className="container">
          <div className="header-content">
            <button className="back-btn" onClick={() => navigate('/')}>
              ← Back to Dashboard
            </button>
            <div className="tool-title">
              <span className="tool-icon">🎯</span>
              <h1>Value Proposition Generator</h1>
            </div>
            <p className="tool-subtitle">
              Create compelling value propositions that resonate with your target audience and differentiate your brand
            </p>
          </div>
        </div>
      </header>

      <div className="container">
        <div className="main-content">
          {/* Input Section */}
          <section id="how-it-works" data-section="how-it-works" className="input-section">
            <h2>Generate Your Value Proposition</h2>
            
            {error && (
              <div className="error-message">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleGenerate}>
              <div className="form-group">
                <label htmlFor="brand">
                  Brand/Company Name *
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  className="form-input"
                  placeholder="e.g., TechSolutions Inc."
                  value={formData.brand}
                  onChange={handleChange}
                  required
                />
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
                    <option value="technology">Technology</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="finance">Finance</option>
                    <option value="education">Education</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="real-estate">Real Estate</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing</option>
                    <option value="ecommerce">E-commerce</option>
                    <option value="saas">SaaS</option>
                    <option value="hospitality">Hospitality</option>
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
                    <option value="small-businesses">Small Businesses</option>
                    <option value="startups">Startups</option>
                    <option value="enterprises">Enterprises</option>
                    <option value="freelancers">Freelancers</option>
                    <option value="professionals">Professionals</option>
                    <option value="students">Students</option>
                    <option value="millennials">Millennials</option>
                    <option value="gen-z">Gen Z</option>
                    <option value="parents">Parents</option>
                    <option value="seniors">Seniors</option>
                    <option value="healthcare-providers">Healthcare Providers</option>
                    <option value="educators">Educators</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="primaryGoal">Primary Business Goal</label>
                  <select
                    id="primaryGoal"
                    name="primaryGoal"
                    className="form-select"
                    value={formData.primaryGoal}
                    onChange={handleChange}
                  >
                    <option value="increase-sales">Increase Sales</option>
                    <option value="generate-leads">Generate Leads</option>
                    <option value="improve-efficiency">Improve Efficiency</option>
                    <option value="boost-engagement">Boost Engagement</option>
                    <option value="reduce-costs">Reduce Costs</option>
                    <option value="enhance-brand-awareness">Enhance Brand Awareness</option>
                    <option value="improve-customer-retention">Improve Customer Retention</option>
                    <option value="expand-market-reach">Expand Market Reach</option>
                    <option value="launch-new-product">Launch New Product</option>
                    <option value="optimize-operations">Optimize Operations</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="uniqueStrength">
                  Unique Strength (Optional)
                </label>
                <input
                  type="text"
                  id="uniqueStrength"
                  name="uniqueStrength"
                  className="form-input"
                  placeholder="e.g., AI-powered automation, 24/7 expert support"
                  value={formData.uniqueStrength}
                  onChange={handleChange}
                />
                <small className="input-hint">
                  What makes your solution unique?
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="problemSolved">
                  Problem You Solve (Optional)
                </label>
                <textarea
                  id="problemSolved"
                  name="problemSolved"
                  className="form-textarea"
                  placeholder="e.g., Businesses struggle with managing multiple marketing channels efficiently"
                  value={formData.problemSolved}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label htmlFor="competitorDifference">
                  How You're Different from Competitors (Optional)
                </label>
                <textarea
                  id="competitorDifference"
                  name="competitorDifference"
                  className="form-textarea"
                  placeholder="e.g., Unlike others, we offer real-time analytics and personalized insights"
                  value={formData.competitorDifference}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Generating...
                  </>
                ) : (
                  <>
                    <span>🎯</span>
                    Generate Value Proposition
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Results Section */}
          <section className="results-section" id="results-section">
            <h2>Your Value Propositions</h2>

            {!showResults && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">🎯</div>
                <h3>Your value propositions will appear here</h3>
                <p>Fill in the form and click "Generate Value Proposition" to get started</p>
              </div>
            )}

            {loading && (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>AI is crafting your perfect value proposition...</p>
              </div>
            )}

            {showResults && valueProposition && (
              <div className="results-content">
                {/* Primary Value Proposition */}
                <div className="primary-vp-card">
                  <div className="vp-header">
                    <h3>🌟 Primary Value Proposition</h3>
                    <span className="word-count">
                      {valueProposition.wordCounts?.primary} words
                    </span>
                  </div>
                  <div className="vp-text-large">
                    {valueProposition.primaryValueProp}
                  </div>
                  <button 
                    className="copy-btn"
                    onClick={() => copyToClipboard(valueProposition.primaryValueProp, 'primary')}
                  >
                    {copiedField === 'primary' ? '✓ Copied!' : '📋 Copy'}
                  </button>
                </div>

                {/* Headlines */}
                {valueProposition.headlines && valueProposition.headlines.length > 0 && (
                  <div className="headlines-section">
                    <h3>📰 Headline Options</h3>
                    <div className="headlines-grid">
                      {valueProposition.headlines.map((headline, index) => (
                        <div key={index} className="headline-card">
                          <div className="headline-number">Option {index + 1}</div>
                          <div className="headline-text">{headline}</div>
                          <button 
                            className="copy-btn-small"
                            onClick={() => copyToClipboard(headline, `headline-${index}`)}
                          >
                            {copiedField === `headline-${index}` ? '✓' : '📋'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elevator Pitch */}
                {valueProposition.elevatorPitch && (
                  <div className="elevator-pitch-card">
                    <div className="vp-header">
                      <h3>🎤 Elevator Pitch (30 seconds)</h3>
                      <span className="word-count">
                        {valueProposition.wordCounts?.elevator} words
                      </span>
                    </div>
                    <div className="vp-text">
                      {valueProposition.elevatorPitch}
                    </div>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(valueProposition.elevatorPitch, 'elevator')}
                    >
                      {copiedField === 'elevator' ? '✓ Copied!' : '📋 Copy'}
                    </button>
                  </div>
                )}

                {/* Value Statement Components */}
                {valueProposition.valueStatement && (
                  <div className="value-statement-section">
                    <h3>🧩 Value Statement Components</h3>
                    <div className="components-grid">
                      <div className="component-card">
                        <div className="component-label">For</div>
                        <div className="component-value">{valueProposition.valueStatement.targetAudience}</div>
                      </div>
                      <div className="component-card">
                        <div className="component-label">Who</div>
                        <div className="component-value">{valueProposition.valueStatement.painPoint}</div>
                      </div>
                      <div className="component-card">
                        <div className="component-label">Our Solution</div>
                        <div className="component-value">{valueProposition.valueStatement.solution}</div>
                      </div>
                      <div className="component-card">
                        <div className="component-label">Provides</div>
                        <div className="component-value">{valueProposition.valueStatement.keyBenefit}</div>
                      </div>
                      <div className="component-card">
                        <div className="component-label">Unlike</div>
                        <div className="component-value">{valueProposition.valueStatement.competitors}</div>
                      </div>
                      <div className="component-card">
                        <div className="component-label">We</div>
                        <div className="component-value">{valueProposition.valueStatement.differentiator}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Alternative Value Propositions */}
                {valueProposition.alternativeProps && valueProposition.alternativeProps.length > 0 && (
                  <div className="alternatives-section">
                    <h3>🔄 Alternative Value Propositions</h3>
                    <div className="alternatives-grid">
                      {valueProposition.alternativeProps.map((prop, index) => (
                        <div key={index} className="alternative-card">
                          <div className="alt-header">
                            <span className="alt-number">Version {index + 1}</span>
                            <button 
                              className="copy-btn-small"
                              onClick={() => copyToClipboard(prop, `alt-${index}`)}
                            >
                              {copiedField === `alt-${index}` ? '✓' : '📋'}
                            </button>
                          </div>
                          <div className="alt-text">{prop}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Benefits */}
                {valueProposition.keyBenefits && valueProposition.keyBenefits.length > 0 && (
                  <div className="benefits-section">
                    <h3>✨ Key Benefits</h3>
                    <ul className="benefits-list">
                      {valueProposition.keyBenefits.map((benefit, index) => (
                        <li key={index}>
                          <span className="benefit-icon">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Emotional Appeal */}
                {valueProposition.emotionalAppeal && (
                  <div className="emotional-appeal-section">
                    <h3>💭 Emotional Appeal</h3>
                    <div className="emotion-grid">
                      <div className="emotion-card primary">
                        <div className="emotion-label">Primary Emotion</div>
                        <div className="emotion-value">{valueProposition.emotionalAppeal.primary}</div>
                      </div>
                      <div className="emotion-card secondary">
                        <div className="emotion-label">Secondary Emotion</div>
                        <div className="emotion-value">{valueProposition.emotionalAppeal.secondary}</div>
                      </div>
                    </div>
                    <div className="emotion-reasoning">
                      <strong>Why it works:</strong> {valueProposition.emotionalAppeal.reasoning}
                    </div>
                  </div>
                )}

                {/* Call to Actions */}
                {valueProposition.callToActions && valueProposition.callToActions.length > 0 && (
                  <div className="cta-section">
                    <h3>🎬 Call-to-Action Suggestions</h3>
                    <div className="cta-grid">
                      {valueProposition.callToActions.map((cta, index) => (
                        <div key={index} className="cta-card">
                          <div className="cta-icon">→</div>
                          <div className="cta-text">{cta}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Proof Points */}
                {valueProposition.proofPoints && valueProposition.proofPoints.length > 0 && (
                  <div className="proof-section">
                    <h3>🏆 Proof Points to Highlight</h3>
                    <ul className="proof-list">
                      {valueProposition.proofPoints.map((proof, index) => (
                        <li key={index}>{proof}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Brand Positioning */}
                {valueProposition.brandPositioning && (
                  <div className="positioning-card">
                    <h3>🎯 Brand Positioning Statement</h3>
                    <div className="positioning-text">
                      {valueProposition.brandPositioning}
                    </div>
                    <button 
                      className="copy-btn"
                      onClick={() => copyToClipboard(valueProposition.brandPositioning, 'positioning')}
                    >
                      {copiedField === 'positioning' ? '✓ Copied!' : '📋 Copy'}
                    </button>
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
              <h3>Primary Messaging Direction</h3>
              <p>Create a clear core value proposition you can reuse across landing pages, ads, pitch decks, and sales conversations.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Supporting Headline Angles</h3>
              <p>Generate alternate headline styles so you can test different tones, benefits, and positioning narratives quickly.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Benefit Breakdown</h3>
              <p>Move from vague claims to concrete outcomes by turning your product strengths into audience-facing benefits.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Positioning Support</h3>
              <p>Use brand positioning statements and proof-point ideas to strengthen how your offer stands apart from competitors.</p>
            </div>
          </div>
        </section>

        <section id="how-it-works" data-section="how-it-works" className="tool-resource-section">
          <h2>How It Works</h2>
          <div className="tool-resource-grid">
            <div className="tool-resource-card">
              <h3>Clarify the Business Context</h3>
              <p>Provide your brand, audience, goals, and differentiators so the generator understands what your market actually cares about.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Translate Features into Value</h3>
              <p>The tool turns raw product strengths into customer-ready messaging that focuses on outcomes, clarity, and persuasion.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Review Multiple Frames</h3>
              <p>Compare headline options, benefit language, and positioning lines to find the clearest strategic message.</p>
            </div>
            <div className="tool-resource-card">
              <h3>Deploy Across Channels</h3>
              <p>Use the strongest proposition as the foundation for site copy, campaign messaging, outreach, and pitch materials.</p>
            </div>
          </div>
        </section>

        {/* Best Practices Section */}
        <section id="best-practices" data-section="best-practices" className="best-practices-section">
          <h2>📚 Value Proposition Best Practices</h2>
          <div className="practices-grid">
            <div className="practice-card">
              <div className="practice-icon">🎯</div>
              <h3>Be Specific</h3>
              <p>Clearly state what you offer and who it's for. Avoid vague language and generic promises.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">💎</div>
              <h3>Focus on Benefits</h3>
              <p>Highlight outcomes and results, not just features. Show how you improve customers' lives.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">⚡</div>
              <h3>Keep It Clear</h3>
              <p>Use simple, jargon-free language. Your audience should understand it in 5 seconds.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🔍</div>
              <h3>Differentiate</h3>
              <p>Clearly explain what makes you unique compared to alternatives and competitors.</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">📊</div>
              <h3>Quantify When Possible</h3>
              <p>Use numbers and metrics to add credibility. "50% faster" is better than "faster".</p>
            </div>
            <div className="practice-card">
              <div className="practice-icon">🎨</div>
              <h3>Test & Iterate</h3>
              <p>A/B test different versions. Monitor which resonates best with your audience.</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="tool-footer">
        <div className="container">
          <p>&copy; 2024 Value Proposition Generator. All rights reserved.</p>
          <p>Create compelling value propositions that convert.</p>
        </div>
      </footer>
    </div>
  );
}

export default ValuePropositionGenerator;
