import React, { useState } from 'react';
import './GeneratedPostCard.css';

const GeneratedPostCard = ({ 
  post,
  platforms = [],
  onCopy,
  onSchedule,
  onEdit,
  onDelete
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(post.content);
    setIsCopied(true);
    onCopy?.(post);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      instagram: '📷',
      twitter: '🐦',
      facebook: '👍',
      linkedin: '💼',
      tiktok: '🎵',
      youtube: '📺'
    };
    return icons[platform] || '📱';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      instagram: '#E4405F',
      twitter: '#1DA1F2',
      facebook: '#1877F2',
      linkedin: '#0A66C2',
      tiktok: '#000000',
      youtube: '#FF0000'
    };
    return colors[platform] || '#6B7280';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="generated-post-card">
      {/* Header */}
      <div className="post-card-header">
        <div className="post-meta">
          <div className="post-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="post-info">
            <div className="post-author">Your Account</div>
            <div className="post-timestamp">
              {post.scheduledFor ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" strokeWidth="2"/>
                    <polyline points="12 6 12 12 16 14" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Scheduled for {formatDate(post.scheduledFor)}
                </>
              ) : (
                'Draft'
              )}
            </div>
          </div>
        </div>

        <div className="post-actions-menu">
          <button className="action-menu-btn" aria-label="More options">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="1" strokeWidth="2"/>
              <circle cx="19" cy="12" r="1" strokeWidth="2"/>
              <circle cx="5" cy="12" r="1" strokeWidth="2"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="post-card-content">
        <p className="post-text">{post.content}</p>
        
        {post.hashtags && post.hashtags.length > 0 && (
          <div className="post-hashtags">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="hashtag">#{tag}</span>
            ))}
          </div>
        )}

        {post.media && post.media.length > 0 && (
          <div className="post-media-preview">
            {post.media.map((item, index) => (
              <div key={index} className="media-item">
                {item.type === 'image' ? (
                  <img src={item.url} alt={`Media ${index + 1}`} />
                ) : (
                  <div className="video-placeholder">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Platforms */}
      {platforms && platforms.length > 0 && (
        <div className="post-platforms">
          <span className="platforms-label">Posting to:</span>
          <div className="platform-badges">
            {platforms.map((platform, index) => (
              <span 
                key={index}
                className="platform-badge"
                style={{ 
                  background: `${getPlatformColor(platform)}15`,
                  color: getPlatformColor(platform),
                  borderColor: `${getPlatformColor(platform)}30`
                }}
              >
                <span>{getPlatformIcon(platform)}</span>
                {platform.charAt(0).toUpperCase() + platform.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Engagement Preview (Optional) */}
      {post.predictedEngagement && (
        <div className="engagement-preview">
          <div className="engagement-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{post.predictedEngagement.likes || 0}</span>
          </div>
          <div className="engagement-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{post.predictedEngagement.comments || 0}</span>
          </div>
          <div className="engagement-item">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <polyline points="17 1 21 5 17 9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 11V9a4 4 0 0 1 4-4h14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="7 23 3 19 7 15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{post.predictedEngagement.shares || 0}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="post-card-actions">
        <button 
          className="action-btn"
          onClick={handleCopy}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {isCopied ? 'Copied!' : 'Copy'}
        </button>

        <button 
          className="action-btn"
          onClick={() => onSchedule?.(post)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Schedule
        </button>

        <button 
          className="action-btn"
          onClick={() => onEdit?.(post)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Edit
        </button>

        <button 
          className="action-btn danger"
          onClick={() => onDelete?.(post)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
};

export default GeneratedPostCard;