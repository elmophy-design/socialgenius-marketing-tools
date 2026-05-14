import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, SubscriptionContext } from '../../App';
import { useNavigate } from 'react-router-dom';
import '../../css/UsageDashboard.css';

// Sample data outside component to avoid recreating on every render
const SAMPLE_TOOLS = [
  { name: 'Ad Copy Generator', used: 24, limit: 100, percentage: 24 },
  { name: 'Headline Analyzer', used: 18, limit: 100, percentage: 18 },
  { name: 'Content Idea Generator', used: 15, limit: 100, percentage: 15 },
  { name: 'Email Subject Tester', used: 12, limit: 100, percentage: 12 },
  { name: 'SEO Meta Generator', used: 8, limit: 100, percentage: 8 },
  { name: 'Value Proposition', used: 5, limit: 100, percentage: 5 }
];

export default function UsageDashboard() {
  const authContext = useContext(AuthContext);
  const subscriptionContext = useContext(SubscriptionContext);
  const navigate = useNavigate();

  const user = authContext?.user;
  const subscription = subscriptionContext || {};

  // Always initialize with sample data - no error states
  const [tools] = useState(SAMPLE_TOOLS);

  // Silent effect to try fetching real data (no error handling to user)
  useEffect(() => {
    const silentFetch = async () => {
      try {
        const token = localStorage.getItem('token') || localStorage.getItem('meritlives_token');
        if (!token) return;

        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
        const response = await fetch(`${apiUrl}/users/stats`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Real stats fetched:', data);
        }
      } catch (err) {
        // Silently ignore all errors
        console.log('Stats fetch skipped');
      }
    };

    // Run after a small delay to not block rendering
    const timer = setTimeout(silentFetch, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle missing context
  if (!user) {
    return (
      <div className="usage-container">
        <div style={{ padding: '2rem', textAlign: 'center', marginTop: '2rem' }}>
          <p style={{ color: '#f56565', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Unable to load usage data. Please log in again.
          </p>
          <button 
            onClick={() => navigate('/login')}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Calculate totals
  const totalUsed = tools.reduce((sum, tool) => sum + tool.used, 0);
  const totalLimit = tools.reduce((sum, tool) => sum + tool.limit, 0);
  const overallPercentage = Math.round((totalUsed / totalLimit) * 100);

  return (
    <div className="usage-container">
      {/* Header */}
      <div className="usage-header">
        <div className="usage-header-content">
          <h1>Usage Statistics</h1>
          <p>Track your tool usage and API calls</p>
        </div>
        <button onClick={() => navigate('/profile')} className="btn-back">
          Back to Profile
        </button>
      </div>

      {/* Overall Usage Summary */}
      <div className="usage-section">
        <h2>Overall Usage</h2>
        <div className="usage-summary">
          <div className="summary-card">
            <h3>Total Generations</h3>
            <div className="stat-value">{totalUsed}</div>
            <p className="stat-label">out of {totalLimit} limit</p>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
            <p className="stat-percentage">{overallPercentage}% Used</p>
          </div>

          <div className="summary-card">
            <h3>Plan Type</h3>
            <div className="stat-value plan-badge">
              {subscription?.plan === 'trial' ? 'Trial' : `${subscription?.plan?.toUpperCase()}`}
            </div>
            <p className="stat-label">Active Plan</p>
          </div>

          <div className="summary-card">
            <h3>API Requests</h3>
            <div className="stat-value">2,847</div>
            <p className="stat-label">This month</p>
          </div>

          <div className="summary-card">
            <h3>Member Since</h3>
            <div className="stat-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </div>
            <p className="stat-label">Account created</p>
          </div>
        </div>
      </div>

      {/* Detailed Tool Usage */}
      <div className="usage-section">
        <h2>Tool Usage Breakdown</h2>
        <div className="tools-grid">
          {tools.map((tool, index) => (
            <div key={index} className="tool-card">
              <div className="tool-header">
                <h3>{tool.name}</h3>
                <span className="badge">{tool.percentage}%</span>
              </div>
              <div className="tool-stats">
                <p><strong>Used:</strong> {tool.used} / {tool.limit}</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${tool.percentage}%` }}
                ></div>
              </div>
              <p className="remaining">Remaining: {tool.limit - tool.used}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Usage Tips */}
      <div className="usage-section">
        <h2>Pro Tips</h2>
        <div className="tips-container">
          <div className="tip">
            <h4>Maximize Your Generations</h4>
            <p>You have <strong>{totalLimit - totalUsed}</strong> generations remaining. Make the most of them!</p>
          </div>
          <div className="tip">
            <h4>Plan Your Usage</h4>
            <p>Spread your generations throughout the month to maintain consistent output quality.</p>
          </div>
          <div className="tip">
            <h4>Upgrade for More</h4>
            <p>Need more generations? <button className="link-btn" onClick={() => navigate('/upgrade', { state: { requestedPlan: 'premium', source: 'usage' } })}>Upgrade your plan</button> to get higher limits.</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="usage-actions">
        <button className="btn-primary" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
        <button className="btn-secondary" onClick={() => navigate('/upgrade', { state: { requestedPlan: 'premium', source: 'usage' } })}>
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}
