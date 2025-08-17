import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to console or error reporting service
    console.error("ErrorBoundary caught an error:", error);
    console.error("Error info:", errorInfo);

    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-gray-850 border border-red-500 rounded-lg p-8 text-center">
            <div className="text-red-400 mb-4">
              <AlertTriangle size={64} className="mx-auto" />
            </div>
            <h1 className="text-2xl font-semibold text-primary mb-4">
              Something went wrong
            </h1>
            <p className="text-secondary mb-6">
              The application encountered an unexpected error. This has been
              logged for investigation.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <details className="text-left mb-6 bg-gray-900 border border-default rounded p-4">
                <summary className="cursor-pointer text-sm font-medium text-secondary mb-2">
                  Error Details (Development Only)
                </summary>
                <div className="text-xs font-mono text-red-400 overflow-auto">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                  {this.state.errorInfo && (
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-primary-600 text-white rounded-md font-medium text-sm transition-all duration-200 hover:bg-primary-700"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-700 text-secondary rounded-md font-medium text-sm transition-all duration-200 hover:bg-gray-600 hover:text-primary"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-default text-xs text-muted">
              If this problem persists, please contact support with the error
              details above.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
