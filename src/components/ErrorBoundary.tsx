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
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return (
        <div style={{
          padding: '40px',
          height: '100vh',
          backgroundColor: isDark ? '#1E1E1E' : '#FAFAFA',
          color: isDark ? '#FFFFFF' : '#1A1A1A',
          fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <h2 style={{ marginBottom: '16px', fontWeight: 700 }}>Something went wrong</h2>
          <p style={{ fontSize: '14px', marginBottom: '16px', opacity: 0.7 }}>
            The app encountered an unexpected error. Please reload to continue.
          </p>
          <pre style={{
            backgroundColor: isDark ? '#2A2A2A' : '#F0F0F0',
            padding: '20px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#E05C5C',
            overflow: 'auto',
            maxHeight: '300px',
            whiteSpace: 'pre-wrap',
            border: isDark ? '0.5px solid rgba(255,255,255,0.08)' : '0.5px solid rgba(0,0,0,0.1)',
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
              background: '#3584E4',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
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
