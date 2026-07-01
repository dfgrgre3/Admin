"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { AdminButton } from "./admin-button";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
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
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className={cn(
            "flex flex-col items-center justify-center p-12 rounded-2xl",
            "border border-red-500/20 bg-red-500/5",
            "text-center space-y-4"
          )}
        >
          <div className="p-4 rounded-full bg-red-500/10">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-1">
            <h3 className="font-black text-lg">حدث خطأ غير متوقع</h3>
            <p className="text-sm text-gray-400 font-medium max-w-md">
              تعذر تحميل هذا القسم. يرجى المحاولة مرة أخرى.
            </p>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="text-xs text-left text-red-400 bg-black/20 p-4 rounded-xl max-w-full overflow-auto border border-white/5">
              {this.state.error.message}
            </pre>
          )}
          <AdminButton
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            icon={RefreshCw}
            className="mt-2"
          >
            إعادة المحاولة
          </AdminButton>
        </div>
      );
    }

    return this.props.children;
  }
}