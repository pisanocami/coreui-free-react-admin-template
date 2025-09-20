import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Render custom fallback UI
      return (
        <div className="error-boundary p-4 m-4 border border-danger rounded bg-light">
          <div className="text-center">
            <h2 className="text-danger mb-3">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Something went wrong
            </h2>
            <p className="text-muted mb-3">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              className="btn btn-primary me-2"
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-refresh me-2"></i>
              Refresh Page
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            >
              <i className="fas fa-undo me-2"></i>
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3 text-start">
                <summary className="text-muted">Error Details (Development)</summary>
                <pre className="mt-2 p-2 bg-dark text-light rounded small">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
