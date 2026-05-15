import { Component, ErrorInfo, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface State { hasError: boolean; message: string; }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen relative flex items-center justify-center px-4">
          <div className="mesh-bg" />
          <div className="relative z-10 glass p-10 max-w-md w-full text-center">
            <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>⚠️</span>
            <h1 className="text-2xl font-extrabold text-white mb-3">Something went wrong</h1>
            <p className="text-slate-400 text-sm mb-2">A page error occurred. Please try again.</p>
            {this.state.message && (
              <p className="text-xs font-mono text-rose-400 bg-rose-950/30 border border-rose-900/40 rounded-xl px-4 py-2 mb-6">
                {this.state.message}
              </p>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => { this.setState({ hasError: false, message: '' }); window.location.reload(); }}
                className="btn-primary"
              >
                Try Again
              </button>
              <Link to="/" className="btn-ghost">Back to Home</Link>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
