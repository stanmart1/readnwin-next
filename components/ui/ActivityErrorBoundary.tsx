'use client';

import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ActivityErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Activity Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8">
            <div className="text-red-400 mb-4">
              <i className="ri-error-warning-line text-3xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Activity Feed Error
            </h3>
            <p className="text-gray-600 mb-4">
              There was an issue loading your activity feed.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="ri-refresh-line mr-2"></i>
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}