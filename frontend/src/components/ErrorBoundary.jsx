import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-canvas-soft px-4">
          <div className="card-elevated w-full max-w-md p-8 text-center scale-in">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[12px] bg-red-50">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="mb-2 text-xl font-medium text-ink">Something went wrong</h1>
            <p className="mb-1 text-sm text-ink-mute">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <p className="mb-6 text-xs text-ink-mute">Try refreshing the page or go back.</p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="btn-secondary-outline"
              >
                Go to Dashboard
              </button>
              <button onClick={this.handleRetry} className="btn-primary-green">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
