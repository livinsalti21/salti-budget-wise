import React from 'react';
import { ErrorLogger } from '@/utils/errorLogger';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    ErrorLogger.logError(error, {
      component: 'ErrorBoundary',
      action: 'react_component_error',
      metadata: {
        componentStack: errorInfo.componentStack
      }
    }, 'high');
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground mb-6">
              We've logged the error and will fix it soon.
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Return Home
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
