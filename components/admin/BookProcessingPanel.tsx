'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface BookProcessingPanelProps {
  bookId: number;
  title: string;
  processingStatus: string;
  onProcessingComplete?: () => void;
}

interface ProcessingStats {
  wordCount: number;
  estimatedReadingTime: number;
  pages: number;
  chapterCount: number;
}

interface ProcessingStatus {
  bookId: number;
  title: string;
  processingStatus: string;
  error?: string;
  stats?: ProcessingStats;
}

export default function BookProcessingPanel({
  bookId,
  title,
  processingStatus: initialStatus,
  onProcessingComplete
}: BookProcessingPanelProps) {
  const [status, setStatus] = useState<ProcessingStatus>({
    bookId,
    title,
    processingStatus: initialStatus
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPolling, setIsPolling] = useState(false);

  // Poll for status updates when processing
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (status.processingStatus === 'processing' && !isPolling) {
      setIsPolling(true);
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/admin/books/process-ebook?bookId=${bookId}`);
          if (response.ok) {
            const data = await response.json();
            setStatus(data);
            
            if (data.processingStatus === 'completed') {
              setIsPolling(false);
              onProcessingComplete?.();
            } else if (data.processingStatus === 'failed') {
              setIsPolling(false);
            }
          }
        } catch (error) {
          console.error('Error polling status:', error);
        }
      }, 2000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [status.processingStatus, bookId, isPolling, onProcessingComplete]);

  const handleStartProcessing = async () => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/admin/books/process-ebook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(prev => ({
          ...prev,
          processingStatus: 'processing'
        }));
      } else {
        setStatus(prev => ({
          ...prev,
          processingStatus: 'failed',
          error: data.error
        }));
      }
    } catch (error) {
      setStatus(prev => ({
        ...prev,
        processingStatus: 'failed',
        error: error instanceof Error ? error.message : 'Processing failed'
      }));
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = () => {
    switch (status.processingStatus) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status.processingStatus) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = () => {
    switch (status.processingStatus) {
      case 'completed':
        return 'Ready for E-Reader';
      case 'failed':
        return 'Processing Failed';
      case 'processing':
        return 'Processing...';
      default:
        return 'Not Processed';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{getStatusText()}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {status.processingStatus === 'pending' && (
            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 mr-1" />
                  Process
                </>
              )}
            </button>
          )}

          {status.processingStatus === 'failed' && (
            <button
              onClick={handleStartProcessing}
              disabled={isProcessing}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <AnimatePresence>
        {status.error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md"
          >
            <div className="flex items-start">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-800">Processing Error</p>
                <p className="text-sm text-red-700 mt-1">{status.error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {status.stats && status.processingStatus === 'completed' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 p-3 bg-green-100 border border-green-200 rounded-md"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">{status.stats.chapterCount}</p>
                  <p className="text-green-700">Chapters</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <FileText className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">{status.stats.wordCount.toLocaleString()}</p>
                  <p className="text-green-700">Words</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">{status.stats.estimatedReadingTime} min</p>
                  <p className="text-green-700">Read Time</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="font-medium text-green-800">{status.stats.pages}</p>
                  <p className="text-green-700">Pages</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}