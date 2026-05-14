import React, { useState } from 'react';
import './ConnectionCard.css';

const PlatformGlyph = ({ platform }) => {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: 'platform-glyph'
  };

  switch (platform) {
    case 'instagram':
      return (
        <svg {...commonProps}>
          <rect x="4.5" y="4.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="2" />
          <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="2" />
          <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg {...commonProps}>
          <path d="M14 5c.7 1.6 2.1 2.7 4 3v2.6c-1.4-.1-2.7-.6-3.8-1.4v5.1a5.2 5.2 0 1 1-4.2-5.1v2.7a2.5 2.5 0 1 0 1.5 2.3V5H14Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      );
    case 'twitter':
      return (
        <svg {...commonProps}>
          <path d="M19 7.2c-.5.2-1.1.4-1.7.5.6-.4 1.1-.9 1.3-1.6-.6.3-1.3.6-2 .8A2.9 2.9 0 0 0 14.5 6c-1.8 0-3.1 1.7-2.7 3.4-2.5-.1-4.7-1.3-6.2-3.1-.8 1.4-.4 3.1 1 4-.5 0-1-.1-1.4-.4 0 1.5 1 2.8 2.5 3.1-.5.1-.9.2-1.4 0 .4 1.3 1.6 2.2 3 2.3A5.9 5.9 0 0 1 5 16.8 8.4 8.4 0 0 0 9.6 18c5.5 0 8.7-4.8 8.5-9 .6-.4 1.1-1 1.5-1.7Z" fill="currentColor" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg {...commonProps}>
          <rect x="4" y="4" width="16" height="16" rx="3.5" stroke="currentColor" strokeWidth="2" />
          <path d="M8.2 10.1V16M8.2 8.1h0M11.8 16v-3.2c0-1.4.8-2.3 2.1-2.3 1.2 0 1.9.8 1.9 2.3V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'facebook':
      return (
        <svg {...commonProps}>
          <path d="M14 8.5h2V5.4c-.4-.1-1.2-.2-2.2-.2-2.2 0-3.7 1.3-3.7 3.9v2.2H8v3.3h2.1v5.9h3.5v-5.9h2.4l.4-3.3H13.6V9.5c0-.7.2-1 1-1Z" fill="currentColor" />
        </svg>
      );
    case 'youtube':
      return (
        <svg {...commonProps}>
          <path d="M20.4 8.3a2.6 2.6 0 0 0-1.8-1.8C17 6 12 6 12 6s-5 0-6.6.5A2.6 2.6 0 0 0 3.6 8.3C3 9.9 3 12 3 12s0 2.1.6 3.7a2.6 2.6 0 0 0 1.8 1.8C7 18 12 18 12 18s5 0 6.6-.5a2.6 2.6 0 0 0 1.8-1.8C21 14.1 21 12 21 12s0-2.1-.6-3.7Z" fill="currentColor" />
          <path d="M10.3 14.8 15 12l-4.7-2.8v5.6Z" fill="#ffffff" />
        </svg>
      );
    case 'pinterest':
      return (
        <svg {...commonProps}>
          <path d="M12 2a10 10 0 0 0-3.5 19.4c0-2.6.5-5 1-7.2-.5-.9-.6-2.1-.6-3.2 0-3 1.8-5.3 4-5.3 1 0 2 .4 2.6 1 .7.6 1 1.5 1 2.5 0 2.5-1.6 4.7-4 4.7-.8 0-1.5-.4-1.8-1l-.5 2c-.2.8-.7 2-1 3.2.8.5 1.8.8 3 .8 5.4 0 9.4-4.9 9.4-10.4 0-4.6-3.3-7.8-8-7.8a8.3 8.3 0 0 0-8.5 8.3c0 1.7.6 3.2 1.6 4.4l.2.3-.2.8a3 3 0 0 1-1 .5c-1.5 0-2.8-2-2.8-4.7C2 6 6.5 2 12 2Z" fill="currentColor" />
        </svg>
      );
    default:
      return (
        <svg {...commonProps}>
          <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
  }
};

const ConnectionCard = ({
  platform,
  isConnected = false,
  accountName,
  accountHandle,
  followers,
  lastSync,
  onConnect,
  onDisconnect,
  onManage,
  isPublishReady = true,
  statusMessage
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const platformConfig = {
    instagram: {
      name: 'Instagram',
      color: '#E4405F',
      gradient: 'linear-gradient(135deg, #f58529 0%, #dd2a7b 55%, #8134af 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Likes'
    },
    twitter: {
      name: 'Twitter',
      color: '#1d9bf0',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Engagement'
    },
    facebook: {
      name: 'Facebook',
      color: '#1877F2',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Reach'
    },
    linkedin: {
      name: 'LinkedIn',
      color: '#0A66C2',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Views'
    },
    tiktok: {
      name: 'TikTok',
      color: '#111827',
      gradient: 'linear-gradient(135deg, #111827 0%, #334155 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Likes'
    },
    youtube: {
      name: 'YouTube',
      color: '#FF0000',
      gradient: 'linear-gradient(135deg, #ff4d4f 0%, #dc2626 100%)',
      primaryMetric: 'Posts',
      disconnectedMetric: 'Views'
    },
    pinterest: {
      name: 'Pinterest',
      color: '#E60023',
      gradient: 'linear-gradient(135deg, #ff4d4f 0%, #e60023 100%)',
      primaryMetric: 'Pins',
      disconnectedMetric: 'Likes'
    }
  };

  const config = platformConfig[platform] || platformConfig.instagram;

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect?.(platform);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsLoading(true);
    try {
      await onDisconnect?.(platform);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (typeof num === 'string') return num;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num?.toString() || '0';
  };

  const getTimeSince = (date) => {
    if (!date) return 'Awaiting first sync';
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just connected';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const primaryLabel = isConnected ? 'Published' : (config.primaryMetric || 'Posts');
  const secondaryLabel = isConnected ? 'Channel Status' : config.disconnectedMetric;
  const secondaryValue = isConnected ? getTimeSince(lastSync) : '0';
  const secondaryValueClassName = /\D/.test(String(secondaryValue)) ? 'stat-value is-textual' : 'stat-value';

  return (
    <div
      className={`connection-card ${isConnected ? 'connected' : 'disconnected'}`}
      style={{ '--platform-color': config.color }}
    >
      <div className="connection-toprow">
        <div className="platform-icon-wrapper">
          <div className="platform-icon" style={{ background: config.gradient }}>
            <PlatformGlyph platform={platform} />
          </div>
        </div>

        <div className={`connection-state-pill ${isConnected ? 'connected' : 'disconnected'}`}>
          <span className="state-pill-dot" aria-hidden="true">{isConnected ? 'OK' : '!'}</span>
          <span>{isConnected ? 'Connected' : 'Not Connected'}</span>
        </div>
        {!isPublishReady && (
          <div className="publish-ready-badge" title={statusMessage || 'Connection Only'}>
            <span className="badge-icon" aria-hidden="true">!</span>
            <span>{statusMessage || 'Connection Only'}</span>
          </div>
        )}
      </div>

      <div className="platform-info">
        <h3 className="platform-name">{config.name}</h3>
        {isConnected ? (
          <div className="account-details">
            <p className="account-name">{accountName || 'My Account'}</p>
            {accountHandle && <p className="account-handle">@{accountHandle}</p>}
          </div>
        ) : (
          <p className="connection-prompt">Connect your account</p>
        )}
      </div>

      <div className="connection-stats inline">
        <div className="stat-item align-left">
          <span className="stat-value">{isConnected ? formatNumber(followers) : '0'}</span>
          <span className="stat-label">{primaryLabel}</span>
        </div>

        <div className="stat-item align-right">
          <span className={secondaryValueClassName}>{secondaryValue}</span>
          <span className="stat-label">{secondaryLabel}</span>
        </div>
      </div>

      <div className="connection-actions">
        {isConnected ? (
          <>
            <button className="btn-manage" onClick={onManage} disabled={isLoading}>
              Manage
            </button>
            <button className="btn-disconnect" onClick={handleDisconnect} disabled={isLoading}>
              {isLoading ? <div className="btn-spinner"></div> : <>Disconnect</>}
            </button>
          </>
        ) : (
          <button
            className="btn-connect"
            onClick={handleConnect}
            disabled={isLoading}
            style={{ background: 'linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)' }}
          >
            {isLoading ? <div className="btn-spinner"></div> : <>Connect</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default ConnectionCard;
