/**
 * Card.jsx - Reusable Card Component
 * Matches your project's UI/UX
 */

import React from 'react';
import './Card.css';

const Card = ({
  children,
  title,
  subtitle,
  footer,
  headerActions,
  variant = 'default', // default, elevated, outlined, flat
  padding = 'medium', // none, small, medium, large
  hoverable = false,
  clickable = false,
  onClick,
  className = '',
  ...props
}) => {
  const cardClass = [
    'card',
    `card-${variant}`,
    `card-padding-${padding}`,
    hoverable && 'card-hoverable',
    clickable && 'card-clickable',
    className
  ]
    .filter(Boolean)
    .join(' ');

  const CardWrapper = clickable ? 'button' : 'div';

  return (
    <CardWrapper
      className={cardClass}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {/* Header */}
      {(title || subtitle || headerActions) && (
        <div className="card-header">
          <div className="card-header-content">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
          {headerActions && (
            <div className="card-header-actions">{headerActions}</div>
          )}
        </div>
      )}

      {/* Body */}
      <div className="card-body">{children}</div>

      {/* Footer */}
      {footer && <div className="card-footer">{footer}</div>}
    </CardWrapper>
  );
};

// Card components for flexible usage
Card.Header = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

Card.Body = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

Card.Footer = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

export default Card;