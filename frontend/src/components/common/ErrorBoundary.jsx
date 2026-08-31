import React from 'react';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          padding: '2rem'
        }}>
          <div className="card card-warning" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <AlertTriangle size={48} color="var(--warning)" style={{ margin: '0 auto 1rem' }} />
            <h2>Something went wrong.</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              The application encountered an unexpected error. Please refresh the page or contact support.
            </p>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Refresh Application
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <pre style={{ marginTop: '2rem', textAlign: 'left', background: 'var(--bg-main)', padding: '1rem', overflowX: 'auto', fontSize: '0.8rem' }}>
                {this.state.error?.toString()}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
