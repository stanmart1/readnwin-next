'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModernEReaderStore } from '@/stores/modernEReaderStore';
import { useSession } from 'next-auth/react';
import { SecurityUtils } from '@/utils/security-utils';
import {
  Menu,
  Settings,
  X,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Search,
  Volume2,
  VolumeX,
  Pen,
  StickyNote,
  Share,
} from 'lucide-react';

import ModernLeftDrawer from './ModernLeftDrawer';
import ModernRightDrawer from './ModernRightDrawer';
import ModernProgressBar from './ModernProgressBar';
import ModernHighlightRenderer from './ModernHighlightRenderer';
import ModernTextToSpeech from './ModernTextToSpeech';
import BookSearchInterface from './BookSearchInterface';

interface ModernEReaderProps {
  bookId: string | null;
  onClose: () => void;
}

export default function ModernEReader({ bookId, onClose }: ModernEReaderProps) {
  const { data: session } = useSession();
  const {
    currentBook,
    currentChapter,
    readingProgress,
    settings,
    uiState,
    highlights,
    loadBook,
    unloadBook,
    updateProgress,
    goToChapter,
    nextChapter,
    previousChapter,
    toggleLeftDrawer,
    toggleRightDrawer,
    setSelectedText,
    toggleFullscreen,
    startTextToSpeech,
    pauseTextToSpeech,
    setError,
    clearError,
  } = useModernEReaderStore();

  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectionTimeoutRef = useRef<NodeJS.Timeout>();
  const progressSyncTimeout = useRef<NodeJS.Timeout>();

  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [scrollProgress, setScrollProgress] = useState(0);

  // Load ebook directly from storage (EPUB or HTML)
  const loadEbookFromStorage = useCallback(async (bookId: string, userId: string) => {
    try {
      // Get book info from database
      const response = await fetch(`/api/books/${bookId}`);
      if (!response.ok) {
        throw new Error(`Failed to load book info: ${response.status}`);
      }
      
      const data = await response.json();
      const bookInfo = data.book || data;
      if (!bookInfo.ebook_file_url) {
        throw new Error('No ebook file available');
      }

      // Load ebook file directly
      const ebookResponse = await fetch(bookInfo.ebook_file_url);
      if (!ebookResponse.ok) {
        throw new Error('Failed to load ebook file');
      }

      // Check file type by URL extension
      const fileUrl = bookInfo.ebook_file_url.toLowerCase();
      
      if (fileUrl.endsWith('.html') || fileUrl.endsWith('.htm')) {
        // Handle HTML ebook
        const htmlContent = await ebookResponse.text();
        
        const bookData = {
          id: bookId,
          title: bookInfo.title,
          author: bookInfo.author_name || 'Unknown Author',
          format: 'html',
          metadata: {
            wordCount: htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).length,
            estimatedReadingTime: Math.ceil(htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
            pages: 1
          },
          chapters: [{
            id: 'chapter-1',
            chapter_number: 1,
            chapter_title: bookInfo.title,
            content_html: htmlContent,
            reading_time_minutes: Math.ceil(htmlContent.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
          }]
        };
        
        loadBook(bookId, userId, bookData);
        return;
      }

      // Handle EPUB file
      const ebookBuffer = await ebookResponse.arrayBuffer();
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(ebookBuffer);

      // Parse EPUB structure
      const containerFile = zip.file('META-INF/container.xml');
      if (!containerFile) {
        throw new Error('Invalid EPUB: missing container.xml');
      }

      const containerXml = await containerFile.async('text');
      const opfMatch = containerXml.match(/full-path="([^"]+)"/i);
      if (!opfMatch) {
        throw new Error('Invalid EPUB: no OPF file found');
      }

      const opfFile = zip.file(opfMatch[1]);
      if (!opfFile) {
        throw new Error('Invalid EPUB: OPF file not found');
      }

      const opfXml = await opfFile.async('text');
      
      // Get spine order
      const spineMatches = opfXml.match(/<itemref[^>]*idref="([^"]+)"/gi) || [];
      const spine = spineMatches.map(match => {
        const idMatch = match.match(/idref="([^"]+)"/i);
        return idMatch ? idMatch[1] : null;
      }).filter(Boolean);
      
      // Get manifest
      const manifestMatches = opfXml.match(/<item[^>]*id="([^"]+)"[^>]*href="([^"]+)"[^>]*media-type="([^"]+)"/gi) || [];
      const manifest = {};
      manifestMatches.forEach(match => {
        const idMatch = match.match(/id="([^"]+)"/i);
        const hrefMatch = match.match(/href="([^"]+)"/i);
        const typeMatch = match.match(/media-type="([^"]+)"/i);
        if (idMatch && hrefMatch && typeMatch) {
          manifest[idMatch[1]] = { href: hrefMatch[1], mediaType: typeMatch[1] };
        }
      });

      // Build chapters
      const chapters = [];
      const opfDir = opfMatch[1].split('/').slice(0, -1).join('/');
      
      for (let i = 0; i < spine.length; i++) {
        const spineId = spine[i];
        const manifestItem = manifest[spineId];
        
        if (manifestItem && manifestItem.mediaType === 'application/xhtml+xml') {
          const chapterPath = opfDir ? `${opfDir}/${manifestItem.href}` : manifestItem.href;
          const chapterFile = zip.file(chapterPath);
          
          if (chapterFile) {
            const chapterContent = await chapterFile.async('text');
            
            // Extract title
            const titleMatch = chapterContent.match(/<title>([^<]+)<\/title>/i) || 
                              chapterContent.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i);
            const title = titleMatch?.[1]?.trim() || `Chapter ${i + 1}`;
            
            chapters.push({
              id: spineId,
              chapter_number: i + 1,
              chapter_title: title,
              content_html: chapterContent,
              reading_time_minutes: Math.ceil(chapterContent.replace(/<[^>]*>/g, '').split(/\s+/).length / 200)
            });
          }
        }
      }

      const bookData = {
        id: bookId,
        title: bookInfo.title,
        author: bookInfo.author_name || 'Unknown Author',
        format: 'epub',
        metadata: {
          wordCount: chapters.length * 1000,
          estimatedReadingTime: chapters.length * 5,
          pages: chapters.length * 2
        },
        chapters: chapters.length > 0 ? chapters : [{
          id: 'chapter-1',
          chapter_number: 1,
          chapter_title: bookInfo.title,
          content_html: '<p>No content available</p>',
          reading_time_minutes: 1
        }]
      };
      
      loadBook(bookId, userId, bookData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load book');
    }
  }, [loadBook, setError]);

  // Load book on mount
  useEffect(() => {
    if (bookId && session?.user?.id) {
      loadEbookFromStorage(bookId, session.user.id);
    } else if (!bookId) {
      unloadBook();
    }

    return () => {
      if (bookId) {
        unloadBook();
      }
    };
  }, [bookId, session?.user?.id, loadEbookFromStorage, unloadBook]);

  // Auto-hide menu
  useEffect(() => {
    const hideMenuTimeout = setTimeout(() => {
      if (Date.now() - lastInteraction > 3000) {
        setIsMenuVisible(false);
      }
    }, 3000);

    return () => clearTimeout(hideMenuTimeout);
  }, [lastInteraction]);

  const handleInteraction = useCallback(() => {
    setLastInteraction(Date.now());
    setIsMenuVisible(true);
  }, []);

  // Handle scroll for progress tracking
  const handleScroll = useCallback(() => {
    if (!containerRef.current || !currentChapter || !bookId) return;

    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    
    const scrollableHeight = scrollHeight - clientHeight;
    const progress = scrollableHeight > 0 
      ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
      : 100;
    setScrollProgress(progress);

    updateProgress({
      current_position: scrollTop,
      progress_percentage: progress,
    });

    handleInteraction();
  }, [currentChapter, updateProgress, handleInteraction, bookId]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    clearTimeout(selectionTimeoutRef.current);
    
    selectionTimeoutRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim() && selection.rangeCount > 0) {
        const selectedText = selection.toString().trim();
        const range = selection.getRangeAt(0);
        
        const startOffset = getTextOffset(contentRef.current!, range.startContainer, range.startOffset);
        const endOffset = getTextOffset(contentRef.current!, range.endContainer, range.endOffset);
        
        setSelectedText(selectedText, { start: startOffset, end: endOffset });
      } else {
        setSelectedText(null);
      }
    }, 100);
  }, [setSelectedText]);

  const getTextOffset = (container: Node, node: Node, offset: number): number => {
    let textOffset = 0;
    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode;
    while ((currentNode = walker.nextNode())) {
      if (currentNode === node) {
        return textOffset + offset;
      }
      textOffset += currentNode.textContent?.length || 0;
    }
    return textOffset;
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (uiState.noteModalOpen || uiState.highlightModalOpen || uiState.searchModalOpen) {
      return;
    }

    switch (e.key) {
      case 'Escape':
        if (uiState.isFullscreen) {
          toggleFullscreen();
        } else {
          onClose();
        }
        break;
      case 'ArrowLeft':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          previousChapter();
        } else {
          toggleLeftDrawer();
        }
        break;
      case 'ArrowRight':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          nextChapter();
        } else {
          toggleRightDrawer();
        }
        break;
      case 'F11':
        e.preventDefault();
        toggleFullscreen();
        break;
    }
  }, [
    uiState,
    onClose,
    toggleFullscreen,
    previousChapter,
    nextChapter,
    toggleLeftDrawer,
    toggleRightDrawer,
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Handle swipe gestures
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart || !settings.enableSwipeNavigation) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        if (Math.abs(deltaX) > 100) {
          previousChapter();
        } else {
          toggleLeftDrawer();
        }
      } else {
        if (Math.abs(deltaX) > 100) {
          nextChapter();
        } else {
          toggleRightDrawer();
        }
      }
    }

    setTouchStart(null);
  }, [touchStart, settings.enableSwipeNavigation, previousChapter, nextChapter, toggleLeftDrawer, toggleRightDrawer]);

  // Loading state
  if (uiState.isLoading) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading book...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (uiState.error) {
    return (
      <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Book</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{uiState.error}</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={() => {
                clearError();
                if (session?.user?.id && bookId) {
                  loadEbookFromStorage(bookId, session.user.id);
                }
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No book loaded
  if (!currentBook || !currentChapter) {
    if (!bookId) {
      return (
        <BookSearchInterface 
          onClose={onClose}
          onBookSelect={(selectedBookId) => {
            if (session?.user?.id) {
              loadEbookFromStorage(selectedBookId, session.user.id);
            }
          }}
        />
      );
    } else {
      return (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">No book content available</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      );
    }
  }

  // Apply theme styles
  const themeStyles = {
    light: {
      backgroundColor: settings.backgroundColor,
      color: settings.textColor,
    },
    dark: {
      backgroundColor: '#1a1a1a',
      color: '#e5e5e5',
    },
    sepia: {
      backgroundColor: '#f4f1ea',
      color: '#5c4b37',
    },
    'high-contrast': {
      backgroundColor: '#000000',
      color: '#ffffff',
    },
  };

  const currentThemeStyles = themeStyles[settings.theme];

  return (
    <div 
      className={`fixed inset-0 z-40 ${uiState.isFullscreen ? 'z-50' : ''}`}
      style={currentThemeStyles}
      onClick={handleInteraction}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <AnimatePresence>
        {(isMenuVisible || uiState.leftDrawerOpen || uiState.rightDrawerOpen) && !uiState.isFullscreen && (
          <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            className="fixed top-0 left-0 right-0 z-30 border-b"
            style={{
              backgroundColor: currentThemeStyles.backgroundColor,
              borderColor: settings.theme === 'dark' ? '#374151' : '#e5e7eb',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => toggleLeftDrawer()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Table of Contents"
                >
                  <Menu className="w-5 h-5" />
                </button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-sm font-medium truncate">
                    {currentBook.title}
                  </h1>
                  <p className="text-xs opacity-70 truncate">
                    {currentChapter.chapter_title}
                  </p>
                </div>
              </div>

              {settings.showProgressBar && readingProgress && (
                <div className="hidden sm:flex items-center space-x-2 text-xs opacity-70">
                  <span>{Math.round(readingProgress.progress_percentage)}%</span>
                  <div className="w-20 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${readingProgress.progress_percentage}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {}}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Search"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                {settings.textToSpeech.enabled && (
                  <button
                    onClick={() => {
                      if (uiState.isTextToSpeechPlaying) {
                        pauseTextToSpeech();
                      } else {
                        startTextToSpeech();
                      }
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title={uiState.isTextToSpeechPlaying ? 'Pause' : 'Play'}
                  >
                    {uiState.isTextToSpeechPlaying ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => toggleRightDrawer()}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Settings"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {settings.showProgressBar && (
              <ModernProgressBar 
                progress={scrollProgress}
                bookProgress={readingProgress?.progress_percentage || 0}
              />
            )}
          </motion.header>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        ref={containerRef}
        className={`h-full overflow-y-auto ${!uiState.isFullscreen ? 'pt-20 pb-4' : 'pt-4 pb-4'}`}
        onScroll={handleScroll}
        style={{
          scrollBehavior: settings.reduceMotion ? 'auto' : 'smooth',
        }}
      >
        <div 
          className="max-w-4xl mx-auto px-4"
          style={{
            maxWidth: settings.readingWidth === 'narrow' ? '600px' : 
                     settings.readingWidth === 'wide' ? '1200px' :
                     settings.readingWidth === 'full' ? '100%' : '800px',
          }}
        >
          <article
            ref={contentRef}
            className="prose prose-lg max-w-none"
            style={{
              fontSize: `${settings.fontSize}px`,
              fontFamily: settings.fontFamily,
              lineHeight: settings.lineHeight,
              fontWeight: settings.fontWeight,
              letterSpacing: `${settings.letterSpacing}em`,
              margin: `${settings.margins}px 0`,
              padding: `${settings.padding}px`,
              textAlign: settings.justifyText ? 'justify' : 'left',
              columnCount: settings.columnCount,
              columnGap: settings.columnCount > 1 ? '2rem' : 'normal',
              color: currentThemeStyles.color,
            }}
            onMouseUp={handleTextSelection}
            onTouchEnd={handleTextSelection}
            dangerouslySetInnerHTML={{ __html: currentChapter.content_html }}
          />

          {/* Chapter Navigation */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={previousChapter}
              disabled={!currentBook.chapters.find(ch => ch.chapter_number < currentChapter.chapter_number)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="text-center">
              <p className="text-sm opacity-70">
                Chapter {currentChapter.chapter_number} of {currentBook.chapters.length}
              </p>
              <p className="text-xs opacity-50 mt-1">
                {currentChapter.reading_time_minutes} min read
              </p>
            </div>

            <button
              onClick={nextChapter}
              disabled={!currentBook.chapters.find(ch => ch.chapter_number > currentChapter.chapter_number)}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <AnimatePresence>
        {uiState.selectedText && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-4 right-4 flex flex-col space-y-2 z-50"
          >
            <button
              onClick={() => {}}
              className="p-3 bg-yellow-500 text-white rounded-full shadow-lg hover:bg-yellow-600 transition-colors"
              title="Highlight"
            >
              <Pen className="w-5 h-5" />
            </button>
            <button
              onClick={() => {}}
              className="p-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 transition-colors"
              title="Add Note"
            >
              <StickyNote className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                navigator.share?.({
                  title: currentBook.title,
                  text: uiState.selectedText || '',
                });
              }}
              className="p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors"
              title="Share"
            >
              <Share className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <ModernHighlightRenderer
        highlights={highlights}
        contentRef={contentRef}
        onHighlightClick={(highlight) => {
          console.log('Highlight clicked:', SecurityUtils.sanitizeForLog(JSON.stringify(highlight)));
        }}
      />

      <ModernLeftDrawer />
      <ModernRightDrawer />

      {settings.textToSpeech.enabled && <ModernTextToSpeech />}
    </div>
  );
}