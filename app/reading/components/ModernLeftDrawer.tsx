'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModernEReaderStore } from '@/stores/modernEReaderStore';
import { X, BookOpen, Clock } from 'lucide-react';

export default function ModernLeftDrawer() {
  const {
    currentBook,
    currentChapter,
    uiState,
    toggleLeftDrawer,
    goToChapter,
  } = useModernEReaderStore();

  if (!currentBook) return null;

  return (
    <AnimatePresence>
      {uiState.leftDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => { e.stopPropagation(); toggleLeftDrawer(); }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Table of Contents</h2>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleLeftDrawer(); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {currentBook.chapters && currentBook.chapters.length > 0 ? (
                <div className="space-y-2">
                  {currentBook.chapters.map((chapter) => (
                    <button
                      key={chapter.id}
                      onClick={() => {
                        goToChapter(chapter.id);
                        toggleLeftDrawer();
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentChapter?.id === chapter.id
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            Chapter {chapter.chapter_number}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {chapter.chapter_title}
                          </p>
                        </div>
                        {chapter.reading_time_minutes && (
                          <div className="flex items-center space-x-1 text-xs text-gray-500 ml-2">
                            <Clock className="w-3 h-3" />
                            <span>{chapter.reading_time_minutes}m</span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No chapters available</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}