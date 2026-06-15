import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Alert, Button, Container, Typography } from '@mui/material';
import * as Sentry from '@sentry/react';

interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', { error: error.message, stack: error.stack, componentStack: info.componentStack });
    Sentry.captureException(error, { extra: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Container sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" gutterBottom>Something went wrong</Typography>
          <Alert severity="error" sx={{ mb: 2 }}>{this.state.error?.message}</Alert>
          <Button variant="contained" onClick={() => window.location.reload()}>Reload Page</Button>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
