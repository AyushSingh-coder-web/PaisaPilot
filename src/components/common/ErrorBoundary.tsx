import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PaisaPilot Error Boundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('paisapilot_financial_state_v1');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div 
          role="alert" 
          aria-live="assertive"
          className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-900"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h1 className="text-xl font-bold text-slate-900">Application Error Encountered</h1>
              <p className="text-sm text-slate-600">
                PaisaPilot encountered an unexpected rendering error. Your financial data can be preserved or safely reset to baseline.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-lg text-left text-xs text-slate-700 font-mono overflow-x-auto max-h-28">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" aria-hidden="true" />
                <span>Reset to Day 1</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
