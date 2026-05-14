import React from 'react';
import './UserHeader.css';

const UserHeader = ({ 
  user, 
  onOpenProfile, 
  onOpenSubscription, 
  onOpenSettings 
}) => {
  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPlanColor = (plan) => {
    const colors = {
      trial: '#6B7280',
      basic: '#3B82F6',
      premium: '#F59E0B',
      pro: '#8B5CF6'
    };
    return colors[plan?.toLowerCase()] || colors.trial;
  };

  const getPlanIcon = (plan) => {
    const icons = {
      trial: '🎯',
      basic: '⭐',
      premium: '👑',
      pro: '🚀'
    };
    return icons[plan?.toLowerCase()] || icons.trial;
  };

  return (
    <div className="user-header">
      <div className="user-header-content">
        {/* Avatar Section */}
        <div className="user-avatar-section" onClick={onOpenProfile}>
          {user?.avatar ? (
            <img 
              src={user.avatar} 
              alt={user.userName || 'User'}
              className="user-avatar"
            />
          ) : (
            <div 
              className="user-avatar-placeholder"
              style={{ 
                background: `linear-gradient(135deg, ${getPlanColor(user?.plan)}, ${getPlanColor(user?.plan)}dd)` 
              }}
            >
              <span>{getInitials(user?.userName)}</span>
            </div>
          )}
          <div className="avatar-status-indicator"></div>
        </div>

        {/* User Info */}
        <div className="user-info-section">
          <div className="user-name-row">
            <h2 className="user-name">{user?.userName || 'User'}</h2>
            <div 
              className="user-plan-badge"
              style={{ 
                borderColor: getPlanColor(user?.plan),
                color: getPlanColor(user?.plan)
              }}
            >
              <span className="plan-icon">{getPlanIcon(user?.plan)}</span>
              <span className="plan-text">
                {user?.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Trial'}
              </span>
            </div>
          </div>
          <p className="user-email">{user?.userEmail || 'email@example.com'}</p>
          {user?.company && (
            <p className="user-company">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {user.company}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="user-actions">
          <button 
            className="action-btn"
            onClick={onOpenProfile}
            aria-label="View Profile"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Profile</span>
          </button>

          <button 
            className="action-btn"
            onClick={onOpenSubscription}
            aria-label="Manage Subscription"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Subscription</span>
          </button>

          <button 
            className="action-btn"
            onClick={onOpenSettings}
            aria-label="Settings"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="user-quick-stats">
        <div className="quick-stat-item">
          <span className="stat-value">{user?.totalPosts || 0}</span>
          <span className="stat-label">Posts</span>
        </div>
        <div className="stat-divider"></div>
        <div className="quick-stat-item">
          <span className="stat-value">{user?.connectedCount || 0}</span>
          <span className="stat-label">Connected</span>
        </div>
        <div className="stat-divider"></div>
        <div className="quick-stat-item">
          <span className="stat-value">{user?.scheduledCount || 0}</span>
          <span className="stat-label">Scheduled</span>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;