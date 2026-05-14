// frontend/src/components/Tools/SocialMedia/modals/AnalyticsModal.jsx
import React, { useState, useEffect } from 'react';
import './AnalyticsModal.css';

const AnalyticsModal = ({ isOpen, onClose, userId, toolName }) => {
  const [timeRange, setTimeRange] = useState('7days');
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  const [analyticsData] = useState({
    overview: {
      totalReach: 45200,
      engagementRate: 4.2,
      newFollowers: 324,
      totalPosts: 156,
      totalLikes: 1234,
      totalComments: 324,
      totalShares: 567,
      totalSaves: 89
    },
    platformPerformance: [
      { platform: 'Instagram', reach: 18500, engagement: 5.2, posts: 45, color: '#E4405F' },
      { platform: 'Facebook', reach: 12300, engagement: 3.8, posts: 38, color: '#1877F2' },
      { platform: 'Twitter', reach: 8900, engagement: 4.5, posts: 42, color: '#1DA1F2' },
      { platform: 'TikTok', reach: 5500, engagement: 6.1, posts: 31, color: '#000000' }
    ],
    topPosts: [
      {
        id: 1,
        title: 'Summer Sale Announcement',
        platform: 'Instagram',
        engagement: 8.2,
        reach: 12400,
        date: '2 days ago',
        contentType: 'carousel'
      },
      {
        id: 2,
        title: 'Product Tutorial Video',
        platform: 'TikTok',
        engagement: 6.7,
        reach: 8900,
        date: '5 days ago',
        contentType: 'video'
      },
      {
        id: 3,
        title: 'Customer Success Story',
        platform: 'Facebook',
        engagement: 5.4,
        reach: 7200,
        date: '1 week ago',
        contentType: 'normal'
      }
    ],
    growthTrend: [
      { date: 'Mon', followers: 1200, reach: 4500, engagement: 3.8 },
      { date: 'Tue', followers: 1250, reach: 5200, engagement: 4.1 },
      { date: 'Wed', followers: 1280, reach: 4800, engagement: 4.3 },
      { date: 'Thu', followers: 1320, reach: 6200, engagement: 4.7 },
      { date: 'Fri', followers: 1380, reach: 5800, engagement: 4.5 },
      { date: 'Sat', followers: 1450, reach: 7100, engagement: 5.2 },
      { date: 'Sun', followers: 1524, reach: 6800, engagement: 4.9 }
    ],
    audience: {
      ageGroups: [
        { range: '18-24', percentage: 25 },
        { range: '25-34', percentage: 35 },
        { range: '35-44', percentage: 22 },
        { range: '45-54', percentage: 12 },
        { range: '55+', percentage: 6 }
      ],
      topLocations: [
        { country: 'United States', percentage: 45 },
        { country: 'United Kingdom', percentage: 18 },
        { country: 'Canada', percentage: 12 },
        { country: 'Australia', percentage: 10 },
        { country: 'Germany', percentage: 8 }
      ],
      gender: [
        { gender: 'Female', percentage: 58 },
        { gender: 'Male', percentage: 40 },
        { gender: 'Other', percentage: 2 }
      ]
    }
  });

  useEffect(() => {
    if (isOpen) {
      loadAnalyticsData();
    }
  }, [isOpen, timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In production, you would fetch real data:
      // const response = await fetch(`/api/analytics/${userId}?range=${timeRange}&tool=${toolName}`);
      // const data = await response.json();
      // setAnalyticsData(data);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setIsLoading(false);
    }
  };

  const timeRangeOptions = [
    { value: '7days', label: 'Last 7 days' },
    { value: '30days', label: 'Last 30 days' },
    { value: '90days', label: 'Last 90 days' },
    { value: 'all', label: 'All time' }
  ];

  const getChangeIndicator = (value) => {
    const isPositive = value > 0;
    return (
      <span className={`change-indicator ${isPositive ? 'positive' : 'negative'}`}>
        <i className={`fas fa-arrow-${isPositive ? 'up' : 'down'} mr-1`}></i>
        <span>{Math.abs(value)}%</span>
      </span>
    );
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      'Instagram': 'fab fa-instagram',
      'Facebook': 'fab fa-facebook',
      'Twitter': 'fab fa-twitter',
      'TikTok': 'fab fa-tiktok',
      'LinkedIn': 'fab fa-linkedin',
      'YouTube': 'fab fa-youtube',
      'Pinterest': 'fab fa-pinterest'
    };
    return icons[platform] || 'fas fa-share-alt';
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay analytics-modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <h3 className="modal-title">
              <i className="fas fa-chart-line mr-2 text-purple-500"></i>
              Performance Analytics
            </h3>
            <p className="modal-subtitle">
              Track your social media performance
            </p>
          </div>
          
          <div className="header-actions">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="time-range-select"
              disabled={isLoading}
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <button onClick={onClose} className="modal-close-btn">
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="analytics-tabs">
          <button
            className={`analytics-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <i className="fas fa-chart-pie mr-2"></i>
            Overview
          </button>
          <button
            className={`analytics-tab ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            <i className="fas fa-share-alt mr-2"></i>
            Platforms
          </button>
          <button
            className={`analytics-tab ${activeTab === 'audience' ? 'active' : ''}`}
            onClick={() => setActiveTab('audience')}
          >
            <i className="fas fa-users mr-2"></i>
            Audience
          </button>
          <button
            className={`analytics-tab ${activeTab === 'content' ? 'active' : ''}`}
            onClick={() => setActiveTab('content')}
          >
            <i className="fas fa-star mr-2"></i>
            Top Content
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="analytics-loading">
            <i className="fas fa-spinner fa-spin text-4xl text-blue-500"></i>
            <p>Loading analytics data...</p>
          </div>
        ) : (
          /* Modal Body */
          <div className="modal-body analytics-modal-body">
            
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="analytics-section">
                {/* Key Metrics */}
                <div className="analytics-metrics-grid">
                  <div className="metric-card">
                    <div className="metric-header">
                      <i className="fas fa-eye text-blue-500"></i>
                      <span className="metric-label">Total Reach</span>
                    </div>
                    <div className="metric-value">{analyticsData.overview.totalReach.toLocaleString()}</div>
                    {getChangeIndicator(12.4)}
                    <div className="metric-trend">+12% from last period</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <i className="fas fa-heart text-red-500"></i>
                      <span className="metric-label">Engagement Rate</span>
                    </div>
                    <div className="metric-value">{analyticsData.overview.engagementRate}%</div>
                    {getChangeIndicator(2.1)}
                    <div className="metric-trend">Above average</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <i className="fas fa-user-plus text-green-500"></i>
                      <span className="metric-label">New Followers</span>
                    </div>
                    <div className="metric-value">{analyticsData.overview.newFollowers}</div>
                    {getChangeIndicator(8.7)}
                    <div className="metric-trend">+8% growth</div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-header">
                      <i className="fas fa-paper-plane text-purple-500"></i>
                      <span className="metric-label">Total Posts</span>
                    </div>
                    <div className="metric-value">{analyticsData.overview.totalPosts}</div>
                    {getChangeIndicator(15.2)}
                    <div className="metric-trend">Active this period</div>
                  </div>
                </div>

                {/* Growth Chart */}
                <div className="chart-section">
                  <h4 className="section-title">Follower Growth Trend</h4>
                  <div className="growth-chart">
                    {analyticsData.growthTrend.map((day, index) => (
                      <div key={index} className="chart-bar-container">
                        <div className="chart-bar-group">
                          <div 
                            className="chart-bar followers"
                            style={{ 
                              height: `${(day.followers / 2000) * 100}%` 
                            }}
                          >
                            <div className="chart-bar-tooltip">
                              {day.followers} followers
                            </div>
                          </div>
                          <div 
                            className="chart-bar engagement"
                            style={{ 
                              height: `${day.engagement * 10}%` 
                            }}
                          >
                            <div className="chart-bar-tooltip">
                              {day.engagement}% engagement
                            </div>
                          </div>
                        </div>
                        <span className="chart-label">{day.date}</span>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <div className="legend-item">
                      <div className="legend-color followers"></div>
                      <span>Followers</span>
                    </div>
                    <div className="legend-item">
                      <div className="legend-color engagement"></div>
                      <span>Engagement %</span>
                    </div>
                  </div>
                </div>

                {/* Engagement Breakdown */}
                <div className="engagement-section">
                  <h4 className="section-title">Engagement Breakdown</h4>
                  <div className="engagement-grid">
                    <div className="engagement-item">
                      <div className="engagement-icon">
                        <i className="fas fa-thumbs-up text-blue-500"></i>
                      </div>
                      <div className="engagement-info">
                        <div className="engagement-value">{analyticsData.overview.totalLikes.toLocaleString()}</div>
                        <div className="engagement-label">Likes</div>
                      </div>
                      {getChangeIndicator(5.2)}
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">
                        <i className="fas fa-comment text-green-500"></i>
                      </div>
                      <div className="engagement-info">
                        <div className="engagement-value">{analyticsData.overview.totalComments}</div>
                        <div className="engagement-label">Comments</div>
                      </div>
                      {getChangeIndicator(8.1)}
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">
                        <i className="fas fa-share text-purple-500"></i>
                      </div>
                      <div className="engagement-info">
                        <div className="engagement-value">{analyticsData.overview.totalShares}</div>
                        <div className="engagement-label">Shares</div>
                      </div>
                      {getChangeIndicator(12.3)}
                    </div>
                    <div className="engagement-item">
                      <div className="engagement-icon">
                        <i className="fas fa-bookmark text-orange-500"></i>
                      </div>
                      <div className="engagement-info">
                        <div className="engagement-value">{analyticsData.overview.totalSaves}</div>
                        <div className="engagement-label">Saves</div>
                      </div>
                      {getChangeIndicator(15.7)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Platforms Tab */}
            {activeTab === 'platforms' && (
              <div className="analytics-section">
                <div className="platform-performance-section">
                  <h4 className="section-title">Platform Performance</h4>
                  <div className="platform-performance-grid">
                    {analyticsData.platformPerformance.map((platform, index) => (
                      <div key={index} className="platform-performance-card">
                        <div className="platform-header">
                          <div className="platform-info">
                            <i 
                              className={getPlatformIcon(platform.platform)}
                              style={{ color: platform.color }}
                            ></i>
                            <span className="platform-name">{platform.platform}</span>
                          </div>
                          <div className="platform-engagement">{platform.engagement}%</div>
                        </div>
                        
                        <div className="platform-stats">
                          <div className="platform-stat">
                            <span className="stat-label">Reach</span>
                            <span className="stat-value">{platform.reach.toLocaleString()}</span>
                          </div>
                          <div className="platform-stat">
                            <span className="stat-label">Posts</span>
                            <span className="stat-value">{platform.posts}</span>
                          </div>
                        </div>
                        
                        <div className="platform-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${(platform.engagement / 10) * 100}%`,
                                backgroundColor: platform.color
                              }}
                            ></div>
                          </div>
                          <div className="progress-label">
                            Engagement rate: {platform.engagement}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Comparison */}
                <div className="comparison-section">
                  <h4 className="section-title">Platform Comparison</h4>
                  <div className="comparison-chart">
                    <div className="comparison-metrics">
                      <div className="comparison-metric">Reach</div>
                      <div className="comparison-metric">Engagement</div>
                      <div className="comparison-metric">Posts</div>
                    </div>
                    {analyticsData.platformPerformance.map((platform, index) => (
                      <div key={index} className="comparison-platform">
                        <div className="platform-name">
                          <i 
                            className={getPlatformIcon(platform.platform)}
                            style={{ color: platform.color }}
                          ></i>
                          {platform.platform}
                        </div>
                        <div className="comparison-bars">
                          <div 
                            className="comparison-bar reach"
                            style={{ width: `${(platform.reach / 20000) * 100}%` }}
                            data-value={platform.reach.toLocaleString()}
                          ></div>
                          <div 
                            className="comparison-bar engagement"
                            style={{ width: `${platform.engagement * 10}%` }}
                            data-value={`${platform.engagement}%`}
                          ></div>
                          <div 
                            className="comparison-bar posts"
                            style={{ width: `${(platform.posts / 50) * 100}%` }}
                            data-value={platform.posts}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Audience Tab */}
            {activeTab === 'audience' && (
              <div className="analytics-section">
                <div className="demographics-section">
                  <h4 className="section-title">Audience Demographics</h4>
                  
                  {/* Age Distribution */}
                  <div className="demographic-chart-container">
                    <h5 className="chart-title">Age Distribution</h5>
                    <div className="demographic-chart">
                      {analyticsData.audience.ageGroups.map((group, index) => (
                        <div key={index} className="demographic-bar-container">
                          <div 
                            className="demographic-bar"
                            style={{ height: `${group.percentage * 3}px` }}
                          >
                            <div className="demographic-tooltip">
                              {group.percentage}% - {group.range}
                            </div>
                          </div>
                          <div className="demographic-label">{group.range}</div>
                          <div className="demographic-value">{group.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Locations */}
                  <div className="locations-section">
                    <h5 className="chart-title">Top Locations</h5>
                    <div className="locations-list">
                      {analyticsData.audience.topLocations.map((location, index) => (
                        <div key={index} className="location-item">
                          <div className="location-info">
                            <span className="location-rank">#{index + 1}</span>
                            <span className="location-name">{location.country}</span>
                          </div>
                          <div className="location-percentage">
                            <div className="location-bar">
                              <div 
                                className="location-bar-fill"
                                style={{ width: `${location.percentage}%` }}
                              ></div>
                            </div>
                            <span className="location-value">{location.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gender Distribution */}
                  <div className="gender-section">
                    <h5 className="chart-title">Gender Distribution</h5>
                    <div className="gender-chart">
                      {analyticsData.audience.gender.map((item, index) => (
                        <div key={index} className="gender-item">
                          <div className="gender-label">{item.gender}</div>
                          <div className="gender-bar">
                            <div 
                              className="gender-bar-fill"
                              style={{ width: `${item.percentage}%` }}
                            ></div>
                          </div>
                          <div className="gender-value">{item.percentage}%</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Top Content Tab */}
            {activeTab === 'content' && (
              <div className="analytics-section">
                <h4 className="section-title">Top Performing Posts</h4>
                <div className="top-posts-section">
                  {analyticsData.topPosts.map((post, index) => (
                    <div key={post.id} className="top-post-card">
                      <div className="post-rank">
                        <span className={`rank-badge rank-${index + 1}`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      </div>
                      
                      <div className="post-content">
                        <div className="post-header">
                          <div className="post-platform">
                            <i className={getPlatformIcon(post.platform)}></i>
                            <span>{post.platform}</span>
                          </div>
                          <div className="post-date">{post.date}</div>
                        </div>
                        
                        <h5 className="post-title">{post.title}</h5>
                        
                        <div className="post-stats">
                          <div className="post-stat">
                            <i className="fas fa-heart text-red-500"></i>
                            <span>{post.engagement}% engagement</span>
                          </div>
                          <div className="post-stat">
                            <i className="fas fa-eye text-blue-500"></i>
                            <span>{post.reach.toLocaleString()} reach</span>
                          </div>
                          <div className="post-stat">
                            <i className="fas fa-layer-group text-purple-500"></i>
                            <span>{post.contentType}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Content Insights */}
                <div className="content-insights">
                  <h4 className="section-title">Content Insights</h4>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <i className="fas fa-video text-purple-500"></i>
                      <div className="insight-content">
                        <div className="insight-value">Video Content</div>
                        <div className="insight-desc">Performs 3x better than images</div>
                      </div>
                    </div>
                    <div className="insight-card">
                      <i className="fas fa-hashtag text-blue-500"></i>
                      <div className="insight-content">
                        <div className="insight-value">5-10 Hashtags</div>
                        <div className="insight-desc">Optimal for maximum reach</div>
                      </div>
                    </div>
                    <div className="insight-card">
                      <i className="fas fa-clock text-green-500"></i>
                      <div className="insight-content">
                        <div className="insight-value">2-4 PM</div>
                        <div className="insight-desc">Best posting time for your audience</div>
                      </div>
                    </div>
                    <div className="insight-card">
                      <i className="fas fa-calendar-day text-orange-500"></i>
                      <div className="insight-content">
                        <div className="insight-value">Tuesday & Thursday</div>
                        <div className="insight-desc">Highest engagement days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => {
            // Export data functionality
            alert('Export functionality would be implemented here');
          }}>
            <i className="fas fa-download mr-2"></i>
            Export Report
          </button>
          <button className="btn btn-primary" onClick={onClose}>
            <i className="fas fa-check mr-2"></i>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsModal;
