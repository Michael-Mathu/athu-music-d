import React from 'react';

interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode }, State
> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '40px',
          height: '100vh',
          backgroundColor: '#1E1E1E',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ marginBottom: '16px' }}>Something went wrong</h2>
          <pre style={{
            backgroundColor: '#2A2A2A',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#FF8A80',
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap'
          }}>
            {this.state.error?.message}
            {'\n'}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '16px',
              padding: '8px 20px',
              background: 'var(--adw-accent, #3584E4)',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
