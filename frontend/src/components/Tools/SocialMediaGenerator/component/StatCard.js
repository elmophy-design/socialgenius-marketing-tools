import React from 'react';
import './StatCard.css';

const StatCard = ({ 
  icon, 
  label, 
  value, 
  change, 
  trend = 'neutral',
  color = '#3B82F6',
  onClick 
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return '↗';
    if (trend === 'down') return '↘';
    return '→';
  };

  const getTrendColor = () => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  return (
    <div 
      className={`stat-card ${onClick ? 'clickable' : ''}`}
      onClick={onClick}
      style={{ '--stat-color': color }}
    >
      <div className="stat-card-icon" style={{ background: `${color}15` }}>
        {typeof icon === 'string' ? (
          <span style={{ color }}>{icon}</span>
        ) : (
          <div style={{ color }}>{icon}</div>
        )}
      </div>

      <div className="stat-card-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        
        {change !== undefined && (
          <div 
            className="stat-change"
            style={{ color: getTrendColor() }}
          >
            <span className="trend-icon">{getTrendIcon()}</span>
            <span className="change-value">{change}</span>
            <span className="change-period">vs last month</span>
          </div>
        )}
      </div>

      {onClick && (
        <div className="stat-card-arrow">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="9 18 15 12 9 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
    </div>
  );
};

export default StatCard;