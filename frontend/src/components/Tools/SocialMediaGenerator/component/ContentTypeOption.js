import React from 'react';
import './ContentTypeOption.css';

const ContentTypeOption = ({ 
  type,
  icon,
  label,
  description,
  isSelected = false,
  onClick,
  disabled = false
}) => {
  const typeConfig = {
    promotional: {
      icon: '🎯',
      color: '#F59E0B',
      gradient: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)'
    },
    educational: {
      icon: '📚',
      color: '#3B82F6',
      gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 100%)'
    },
    engagement: {
      icon: '💬',
      color: '#8B5CF6',
      gradient: 'linear-gradient(135deg, #A78BFA 0%, #8B5CF6 100%)'
    },
    inspirational: {
      icon: '✨',
      color: '#EC4899',
      gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)'
    },
    entertainment: {
      icon: '🎭',
      color: '#10B981',
      gradient: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)'
    },
    news: {
      icon: '📰',
      color: '#EF4444',
      gradient: 'linear-gradient(135deg, #F87171 0%, #EF4444 100%)'
    },
    poll: {
      icon: '📊',
      color: '#06B6D4',
      gradient: 'linear-gradient(135deg, #22D3EE 0%, #06B6D4 100%)'
    },
    story: {
      icon: '📖',
      color: '#F97316',
      gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)'
    }
  };

  const config = typeConfig[type] || typeConfig.promotional;
  const displayIcon = icon || config.icon;
  const displayColor = config.color;
  const displayGradient = config.gradient;

  return (
    <div 
      className={`content-type-option ${isSelected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={() => !disabled && onClick?.(type)}
      style={{ 
        '--option-color': displayColor,
        '--option-gradient': displayGradient
      }}
    >
      <div className="content-type-checkbox">
        {isSelected && (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <div 
        className="content-type-icon"
        style={{ background: displayGradient }}
      >
        <span>{displayIcon}</span>
      </div>

      <div className="content-type-info">
        <h4 className="content-type-label">{label}</h4>
        {description && (
          <p className="content-type-description">{description}</p>
        )}
      </div>

      {isSelected && (
        <div className="selection-indicator">
          <div className="pulse-ring"></div>
          <div className="pulse-dot"></div>
        </div>
      )}
    </div>
  );
};

export default ContentTypeOption;