import React from 'react';
import './InterestCheckbox.css';

const InterestCheckbox = ({ 
  interest,
  icon,
  label,
  isSelected = false,
  onClick,
  count
}) => {
  const interestConfig = {
    technology: { icon: '💻', color: '#3B82F6' },
    business: { icon: '💼', color: '#10B981' },
    lifestyle: { icon: '🌟', color: '#F59E0B' },
    health: { icon: '🏥', color: '#EF4444' },
    fitness: { icon: '💪', color: '#EC4899' },
    food: { icon: '🍔', color: '#F97316' },
    travel: { icon: '✈️', color: '#06B6D4' },
    fashion: { icon: '👗', color: '#8B5CF6' },
    sports: { icon: '⚽', color: '#14B8A6' },
    music: { icon: '🎵', color: '#A855F7' },
    art: { icon: '🎨', color: '#EC4899' },
    gaming: { icon: '🎮', color: '#6366F1' },
    education: { icon: '📚', color: '#0EA5E9' },
    finance: { icon: '💰', color: '#059669' },
    entertainment: { icon: '🎬', color: '#DC2626' },
    science: { icon: '🔬', color: '#7C3AED' }
  };

  const config = interestConfig[interest] || interestConfig.technology;
  const displayIcon = icon || config.icon;
  const displayColor = config.color;

  return (
    <div 
      className={`interest-checkbox ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick?.(interest)}
      style={{ '--interest-color': displayColor }}
    >
      <div className="interest-check-mark">
        {isSelected && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>

      <div className="interest-content">
        <div className="interest-icon">
          <span>{displayIcon}</span>
        </div>
        <div className="interest-label">{label}</div>
      </div>

      {count !== undefined && (
        <div className="interest-count">{count}</div>
      )}
    </div>
  );
};

export default InterestCheckbox;