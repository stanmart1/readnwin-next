'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEReaderStore } from '@/stores/ereaderStore';
import { Book, Settings, Bookmark, StickyNote, X, Menu, ChevronLeft, ChevronRight } from 'lucide-react';
import LeftDrawer from './LeftDrawer';
import RightDrawer from './RightDrawer';
import ProgressBar from './ProgressBar';
import TextToSpeech from './TextToSpeech';
import { useSession } from 'next-auth/react';

interface EReaderProps {
  bookId: string;
  onClose: () => void;
}

export default function EReader({ bookId, onClose }: EReaderProps) {
  const { data: session } = useSession();
  const {
    currentBook,
    isLoading,
    error,
    readingProgress,
    settings,
    drawerState,
    isTextToSpeechPlaying,
    selectedText,
    loadBook,
    saveProgress,
    toggleDrawer,
    setSelectedText,
    startTextToSpeech,
    stopTextToSpeech,
  } = useEReaderStore();

  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollTimeout, setScrollTimeout] = useState<NodeJS.Timeout | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load book on mount
  useEffect(() => {
    if (bookId && session?.user?.id) {
      loadBook(bookId);
    }
  }, [bookId, session?.user?.id, loadBook]);

  // Handle scroll events for progress tracking
  const handleScroll = useCallback(() => {
    if (!contentRef.current || !containerRef.current) return;

    setIsScrolling(true);
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    // Calculate progress
    const scrollTop = containerRef.current.scrollTop;
    const scrollHeight = containerRef.current.scrollHeight;
    const clientHeight = containerRef.current.clientHeight;
    const progress = Math.min(100, Math.max(0, (scrollTop / (scrollHeight - clientHeight)) * 100));

    // Save progress
    saveProgress({
      currentPosition: scrollTop,
      percentage: progress,
    });

    // Set timeout to mark scrolling as stopped
    const timeout = setTimeout(() => {
      setIsScrolling(false);
    }, 1000);

    setScrollTimeout(timeout);
  }, [saveProgress, scrollTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [scrollTimeout]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    } else {
      setSelectedText(null);
    }
  }, [setSelectedText]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        toggleDrawer('left', true);
        break;
      case 'ArrowRight':
        e.preventDefault();
        toggleDrawer('right', true);
        break;
      case 't':
      case 'T':
        if (e.ctrlKey) {
          e.preventDefault();
          if (isTextToSpeechPlaying) {
            stopTextToSpeech();
          } else {
            startTextToSpeech();
          }
        }
        break;
    }
  }, [onClose, toggleDrawer, isTextToSpeechPlaying, startTextToSpeech, stopTextToSpeech]);

  // Handle swipe gestures
  const handleTouchStart = useRef<{ x: number; y: number } | null>(null);
  const handleTouchMove = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    handleTouchStart.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!handleTouchStart.current) return;
    
    const touch = e.touches[0];
    handleTouchMove.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!handleTouchStart.current || !handleTouchMove.current) return;

    const startX = handleTouchStart.current.x;
    const startY = handleTouchStart.current.y;
    const endX = handleTouchMove.current.x;
    const endY = handleTouchMove.current.y;

    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const minSwipeDistance = 50;

    // Check if it's a horizontal swipe
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - open left drawer
        toggleDrawer('left', true);
      } else {
        // Swipe left - open right drawer
        toggleDrawer('right', true);
      }
    }

    handleTouchStart.current = null;
    handleTouchMove.current = null;
  }, [toggleDrawer]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Book</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!currentBook) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-40">
      {/* Header */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 z-30"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toggleDrawer('left')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentBook.title}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentBook.author}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {settings.showProgressBar && readingProgress && (
              <div className="hidden sm:block text-xs text-gray-500 dark:text-gray-400">
                {Math.round(readingProgress.percentage)}%
              </div>
            )}
            <button
              onClick={() => toggleDrawer('right')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        {settings.showProgressBar && readingProgress && (
          <ProgressBar progress={readingProgress.percentage} />
        )}
      </motion.header>

      {/* Main Content */}
      <div
        ref={containerRef}
        className="pt-20 pb-4 h-full overflow-y-auto"
        onScroll={handleScroll}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <div className="max-w-4xl mx-auto px-4">
          <div
            ref={contentRef}
            className={`prose prose-lg max-w-none ${
              settings.theme === 'dark' ? 'prose-invert' : ''
            } ${
              settings.theme === 'sepia' ? 'prose-amber' : ''
            }`}
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              lineHeight: settings.lineHeight,
              fontWeight: settings.fontWeight,
              margin: `${settings.margins}px`,
              padding: `${settings.padding}px`,
              textAlign: settings.justifyText ? 'justify' : 'left',
              maxWidth: settings.readingWidth === 'narrow' ? '600px' : 
                        settings.readingWidth === 'wide' ? 'none' : '800px',
            }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: currentBook.content }}
          />
        </div>
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50"
          >
            <button
              onClick={() => {
                // Add highlight logic
                console.log('Add highlight for:', selectedText);
              }}
              className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700"
            >
              <Bookmark className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                // Add note logic
                console.log('Add note for:', selectedText);
              }}
              className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700"
            >
              <StickyNote className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drawers */}
      <LeftDrawer />
      <RightDrawer />

      {/* Text-to-Speech */}
      {settings.textToSpeech.enabled && (
        <TextToSpeech />
      )}
    </div>
  );
}
