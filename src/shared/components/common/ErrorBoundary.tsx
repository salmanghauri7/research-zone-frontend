"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Card, CardContent } from "@/shared/components/ui";

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

function DefaultErrorFallback({
  error,
  onRetry,
}: {
  error: Error | null;
  onRetry: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <Card className="w-full max-w-lg border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
        <CardContent className="p-8">
          <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300">
            <AlertTriangle className="h-6 w-6" aria-hidden="true" />
          </div>

          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Something went wrong
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            We hit an unexpected error while rendering this screen.
          </p>

          {error?.message ? (
            <p className="mt-4 rounded-lg bg-slate-100 p-3 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {error.message}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={onRetry}>
              Try again
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.location.reload()}
            >
              Reload page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled UI error:", error, errorInfo);
  }

  private resetBoundary = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <DefaultErrorFallback
          error={this.state.error}
          onRetry={this.resetBoundary}
        />
      );
    }

    return this.props.children;
  }
}
