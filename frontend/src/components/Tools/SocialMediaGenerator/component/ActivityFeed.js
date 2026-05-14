import React from 'react';
import './ActivityFeed.css';

const ActivityFeed = ({ activities = [], maxItems = 10 }) => {
  const getActivityIcon = (type) => {
    const icons = {
      post_created: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M12 20h9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#3B82F6',
        background: '#EFF6FF'
      },
      post_published: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#10B981',
        background: '#D1FAE5'
      },
      post_scheduled: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        color: '#F59E0B',
        background: '#FEF3C7'
      },
      account_connected: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#8B5CF6',
        background: '#F5F3FF'
      },
      account_disconnected: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ),
        color: '#EF4444',
        background: '#FEE2E2'
      },
      settings_updated: {
        icon: (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="3" strokeWidth="2"/>
            <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ),
        color: '#6B7280',
        background: '#F3F4F6'
      }
    };
    return icons[type] || icons.post_created;
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    
    const seconds = Math.floor((new Date() - new Date(timestamp)) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  const displayActivities = activities.slice(0, maxItems);

  return (
    <div className="activity-feed">
      <div className="activity-feed-header">
        <h3 className="activity-feed-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Recent Activity
        </h3>
        {activities.length > maxItems && (
          <button className="view-all-btn">
            View All ({activities.length})
          </button>
        )}
      </div>

      <div className="activity-feed-content">
        {displayActivities.length === 0 ? (
          <div className="activity-empty">
            <div className="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="empty-text">No recent activity</p>
            <p className="empty-subtext">Your activity will appear here</p>
          </div>
        ) : (
          <div className="activity-timeline">
            {displayActivities.map((activity, index) => {
              const config = getActivityIcon(activity.type);
              return (
                <div key={activity.id || index} className="activity-item">
                  <div 
                    className="activity-icon"
                    style={{ 
                      background: config.background,
                      color: config.color
                    }}
                  >
                    {config.icon}
                  </div>

                  <div className="activity-content">
                    <div className="activity-text">
                      <span className="activity-action">{activity.action}</span>
                      {activity.target && (
                        <span className="activity-target"> • {activity.target}</span>
                      )}
                    </div>
                    <div className="activity-timestamp">
                      {getTimeAgo(activity.timestamp)}
                    </div>
                  </div>

                  {activity.status && (
                    <div className={`activity-status ${activity.status}`}>
                      {activity.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;