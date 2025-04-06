'use client';

import React, { ErrorInfo, ReactNode } from 'react';
import { FullPageErrorDisplay } from './ui/ErrorHandler';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <FullPageErrorDisplay error={this.state.error || new Error('Bilinmeyen bir hata oluştu')} />;
    }

    return this.props.children;
  }
}

// Custom hook for throwing errors in function components
export function useErrorHandler(error: Error | null | undefined): void {
  if (error) {
    throw error;
  }
} 