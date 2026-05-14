import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('Frontend ErrorBoundary caught:', error, errorInfo);
    
    // Notify (if available)
    const notify = this.context || window.notify;
    if (notify) {
      notify.error(`App Error: ${error.message}`);
    }
  }

  componentDidUpdate() {
    // Reset on unmount or prop change
    if (!this.props.children) {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <h1>Something went wrong</h1>
            <p>Sorry, an unexpected error occurred.</p>
            <div className="error-actions">
              <button 
                onClick={() => window.location.reload()} 
                className="btn-primary"
              >
                Reload App
              </button>
              <button 
                onClick={() => window.history.back()} 
                className="btn-outline"
              >
                Go Back
              </button>
            </div>
            {this.props.showDetails && (
              <details className="error-details">
                <summary>Debug Info (click to expand)</summary>
                <pre>{this.state.error?.stack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.contextType = useNotification;

export default ErrorBoundary;
export { ErrorBoundary };

