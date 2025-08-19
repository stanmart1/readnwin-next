import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Enhanced interfaces for modern e-reader
export interface ModernBook {
  id: string;
  title: string;
  author: string;
  cover_image_url?: string;
  book_type: 'physical' | 'ebook' | 'hybrid';
  primary_format: 'epub' | 'html' | 'pdf';
  word_count: number;
  reading_time_minutes: number;
  language: string;
  chapters: BookChapter[];
  table_of_contents: TableOfContentsItem[];
}

export interface BookChapter {
  id: string;
  chapter_number: number;
  chapter_title: string;
  content_html: string;
  word_count: number;
  reading_time_minutes: number;
  anchor?: string;
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  anchor: string;
  order: number;
  chapter_id?: string;
  children?: TableOfContentsItem[];
}

export interface ReadingProgress {
  book_id: string;
  user_id: string;
  current_chapter_id?: string;
  current_position: number; // Character offset or scroll position
  progress_percentage: number;
  total_reading_time_seconds: number;
  session_count: number;
  words_read: number;
  pages_read: number;
  started_at?: string;
  last_read_at: string;
  completed_at?: string;
  reading_settings?: ReaderSettings;
}

export interface UserHighlight {
  id: string;
  book_id: string;
  chapter_id?: string;
  highlighted_text: string;
  start_offset: number;
  end_offset: number;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple' | 'orange';
  note?: string;
  is_public: boolean;
  context_before?: string;
  context_after?: string;
  created_at: string;
  updated_at: string;
}

export interface UserNote {
  id: string;
  book_id: string;
  chapter_id?: string;
  highlight_id?: string;
  title?: string;
  content: string;
  note_type: 'general' | 'question' | 'insight' | 'quote' | 'summary';
  position_offset?: number;
  page_number?: number;
  tags: string[];
  category?: string;
  is_favorite: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReaderSettings {
  // Typography
  fontSize: number; // 12-32px
  fontFamily: string;
  lineHeight: number; // 1.0-3.0
  fontWeight: number; // 300-700
  letterSpacing: number; // -0.1 to 0.2em

  // Display
  theme: 'light' | 'dark' | 'sepia' | 'high-contrast';
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  
  // Layout
  readingWidth: 'narrow' | 'medium' | 'wide' | 'full';
  margins: number; // 0-100px
  padding: number; // 0-50px
  columnCount: 1 | 2;
  justifyText: boolean;
  
  // Navigation
  showProgressBar: boolean;
  showChapterNumbers: boolean;
  showPageNumbers: boolean;
  enableSwipeNavigation: boolean;
  
  // Reading Features
  highlightOnSelect: boolean;
  autoBookmark: boolean;
  readingGoals: {
    enabled: boolean;
    dailyMinutes: number;
    weeklyBooks: number;
  };
  
  // Text-to-Speech
  textToSpeech: {
    enabled: boolean;
    voice: string;
    speed: number; // 0.5-3.0
    pitch: number; // 0.5-2.0
    volume: number; // 0.0-1.0
    autoPlay: boolean;
    highlightSpeaking: boolean;
  };
  
  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
  focusIndicator: boolean;
  keyboardNavigation: boolean;
}

export interface ReadingSession {
  id: string;
  book_id: string;
  session_start: string;
  session_end?: string;
  duration_seconds: number;
  start_position: number;
  end_position: number;
  words_read: number;
  pages_read: number;
  device_type: string;
}

export interface ReaderUIState {
  // Drawer states
  leftDrawerOpen: boolean;
  rightDrawerOpen: boolean;
  leftDrawerTab: 'toc' | 'notes' | 'highlights' | 'bookmarks';
  rightDrawerTab: 'settings' | 'typography' | 'display' | 'accessibility';
  
  // Modal states
  searchModalOpen: boolean;
  noteModalOpen: boolean;
  highlightModalOpen: boolean;
  settingsModalOpen: boolean;
  
  // Selection and interaction
  selectedText: string | null;
  selectionRange: { start: number; end: number } | null;
  activeHighlight: string | null;
  
  // Reading state
  isFullscreen: boolean;
  isTextToSpeechPlaying: boolean;
  currentSpeechPosition: number;
  
  // Loading states
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
}

export interface ModernEReaderState {
  // Current reading state
  currentBook: ModernBook | null;
  currentChapter: BookChapter | null;
  readingProgress: ReadingProgress | null;
  currentSession: ReadingSession | null;
  
  // User data
  highlights: UserHighlight[];
  notes: UserNote[];
  bookmarks: Array<{
    id: string;
    book_id: string;
    chapter_id: string;
    position: number;
    title: string;
    created_at: string;
  }>;
  
  // Settings and preferences
  settings: ReaderSettings;
  
  // UI state
  uiState: ReaderUIState;
  
  // Actions - Book Management
  loadBook: (bookId: string, userId: string) => Promise<void>;
  unloadBook: () => void;
  
  // Actions - Navigation
  goToChapter: (chapterId: string) => void;
  goToPosition: (position: number) => void;
  goToPage: (page: number) => void;
  nextChapter: () => void;
  previousChapter: () => void;
  
  // Actions - Progress Tracking
  updateProgress: (progress: Partial<ReadingProgress>) => void;
  startReadingSession: () => void;
  endReadingSession: () => void;
  
  // Actions - Highlights and Notes
  addHighlight: (highlight: Omit<UserHighlight, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateHighlight: (id: string, updates: Partial<UserHighlight>) => Promise<void>;
  removeHighlight: (id: string) => Promise<void>;
  addNote: (note: Omit<UserNote, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<UserNote>) => Promise<void>;
  removeNote: (id: string) => Promise<void>;
  
  // Actions - Bookmarks
  addBookmark: (title: string, chapterId: string, position: number) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  
  // Actions - Settings
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  resetSettings: () => void;
  
  // Actions - UI State
  toggleLeftDrawer: (tab?: ReaderUIState['leftDrawerTab']) => void;
  toggleRightDrawer: (tab?: ReaderUIState['rightDrawerTab']) => void;
  setSelectedText: (text: string | null, range?: { start: number; end: number } | null) => void;
  toggleFullscreen: () => void;
  
  // Actions - Text-to-Speech
  startTextToSpeech: (text?: string) => void;
  pauseTextToSpeech: () => void;
  stopTextToSpeech: () => void;
  setTextToSpeechPosition: (position: number) => void;
  
  // Actions - Search
  searchInBook: (query: string) => Promise<Array<{
    chapterId: string;
    chapterTitle: string;
    matches: Array<{
      text: string;
      position: number;
      context: string;
    }>;
  }>>;
  
  // Actions - Error Handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Default settings
const defaultSettings: ReaderSettings = {
  // Typography
  fontSize: 16,
  fontFamily: 'Georgia, serif',
  lineHeight: 1.6,
  fontWeight: 400,
  letterSpacing: 0,
  
  // Display
  theme: 'light',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  linkColor: '#0066cc',
  
  // Layout
  readingWidth: 'medium',
  margins: 40,
  padding: 20,
  columnCount: 1,
  justifyText: false,
  
  // Navigation
  showProgressBar: true,
  showChapterNumbers: true,
  showPageNumbers: false,
  enableSwipeNavigation: true,
  
  // Reading Features
  highlightOnSelect: true,
  autoBookmark: true,
  readingGoals: {
    enabled: false,
    dailyMinutes: 30,
    weeklyBooks: 1,
  },
  
  // Text-to-Speech
  textToSpeech: {
    enabled: false,
    voice: 'default',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    autoPlay: false,
    highlightSpeaking: true,
  },
  
  // Accessibility
  highContrast: false,
  reduceMotion: false,
  screenReaderMode: false,
  focusIndicator: true,
  keyboardNavigation: true,
};

// Default UI state
const defaultUIState: ReaderUIState = {
  leftDrawerOpen: false,
  rightDrawerOpen: false,
  leftDrawerTab: 'toc',
  rightDrawerTab: 'settings',
  searchModalOpen: false,
  noteModalOpen: false,
  highlightModalOpen: false,
  settingsModalOpen: false,
  selectedText: null,
  selectionRange: null,
  activeHighlight: null,
  isFullscreen: false,
  isTextToSpeechPlaying: false,
  currentSpeechPosition: 0,
  isLoading: false,
  isProcessing: false,
  error: null,
};

export const useModernEReaderStore = create<ModernEReaderState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBook: null,
      currentChapter: null,
      readingProgress: null,
      currentSession: null,
      highlights: [],
      notes: [],
      bookmarks: [],
      settings: defaultSettings,
      uiState: defaultUIState,

      // Book Management Actions
      loadBook: async (bookId: string, userId: string) => {
        set(state => ({
          uiState: { ...state.uiState, isLoading: true, error: null }
        }));

        try {
          // Fetch book data from API
          const response = await fetch(`/api/books/${bookId}/content`, {
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          });

          if (!response.ok) {
            throw new Error('Failed to load book');
          }

          const bookData = await response.json();

          // Fetch reading progress
          const progressResponse = await fetch(`/api/reading/progress/${bookId}`, {
            credentials: 'include',
          });

          let progress: ReadingProgress | null = null;
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            progress = progressData.progress;
          }

          // Fetch user highlights and notes
          const [highlightsResponse, notesResponse] = await Promise.all([
            fetch(`/api/reading/highlights/${bookId}`, { credentials: 'include' }),
            fetch(`/api/reading/notes/${bookId}`, { credentials: 'include' }),
          ]);

          const highlights = highlightsResponse.ok ? (await highlightsResponse.json()).highlights : [];
          const notes = notesResponse.ok ? (await notesResponse.json()).notes : [];

          set(state => ({
            currentBook: bookData.book,
            currentChapter: bookData.book.chapters[0] || null,
            readingProgress: progress,
            highlights,
            notes,
            uiState: { ...state.uiState, isLoading: false },
          }));

          // Start reading session
          get().startReadingSession();
        } catch (error) {
          console.error('Error loading book:', error);
          set(state => ({
            uiState: {
              ...state.uiState,
              isLoading: false,
              error: error instanceof Error ? error.message : 'Failed to load book',
            },
          }));
        }
      },

      unloadBook: () => {
        get().endReadingSession();
        set({
          currentBook: null,
          currentChapter: null,
          readingProgress: null,
          currentSession: null,
          highlights: [],
          notes: [],
          bookmarks: [],
          uiState: defaultUIState,
        });
      },

      // Navigation Actions
      goToChapter: (chapterId: string) => {
        const { currentBook } = get();
        if (!currentBook) return;

        const chapter = currentBook.chapters.find(ch => ch.id === chapterId);
        if (chapter) {
          set({ currentChapter: chapter });
          get().updateProgress({ current_chapter_id: chapterId, current_position: 0 });
        }
      },

      goToPosition: (position: number) => {
        get().updateProgress({ current_position: position });
      },

      goToPage: (page: number) => {
        // Calculate position based on page (approximate)
        const { currentBook } = get();
        if (!currentBook) return;

        const wordsPerPage = 250; // Approximate
        const targetWords = page * wordsPerPage;
        const position = Math.floor((targetWords / currentBook.word_count) * 100);
        
        get().goToPosition(position);
      },

      nextChapter: () => {
        const { currentBook, currentChapter } = get();
        if (!currentBook || !currentChapter) return;

        const currentIndex = currentBook.chapters.findIndex(ch => ch.id === currentChapter.id);
        if (currentIndex < currentBook.chapters.length - 1) {
          get().goToChapter(currentBook.chapters[currentIndex + 1].id);
        }
      },

      previousChapter: () => {
        const { currentBook, currentChapter } = get();
        if (!currentBook || !currentChapter) return;

        const currentIndex = currentBook.chapters.findIndex(ch => ch.id === currentChapter.id);
        if (currentIndex > 0) {
          get().goToChapter(currentBook.chapters[currentIndex - 1].id);
        }
      },

      // Progress Tracking Actions
      updateProgress: (progress: Partial<ReadingProgress>) => {
        const { readingProgress, currentBook } = get();
        if (!currentBook) return;

        const updatedProgress: ReadingProgress = {
          ...readingProgress,
          book_id: currentBook.id,
          user_id: readingProgress?.user_id || '',
          last_read_at: new Date().toISOString(),
          ...progress,
        } as ReadingProgress;

        set({ readingProgress: updatedProgress });

        // Debounced API call to save progress
        clearTimeout((window as any).progressSaveTimeout);
        (window as any).progressSaveTimeout = setTimeout(async () => {
          try {
            await fetch(`/api/reading/progress/${currentBook.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify(updatedProgress),
            });
          } catch (error) {
            console.error('Error saving progress:', error);
          }
        }, 1000);
      },

      startReadingSession: () => {
        const { currentBook, readingProgress } = get();
        if (!currentBook) return;

        const session: ReadingSession = {
          id: `session-${Date.now()}`,
          book_id: currentBook.id,
          session_start: new Date().toISOString(),
          duration_seconds: 0,
          start_position: readingProgress?.current_position || 0,
          end_position: readingProgress?.current_position || 0,
          words_read: 0,
          pages_read: 0,
          device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
        };

        set({ currentSession: session });
      },

      endReadingSession: () => {
        const { currentSession, readingProgress } = get();
        if (!currentSession) return;

        const endTime = new Date();
        const startTime = new Date(currentSession.session_start);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const completedSession: ReadingSession = {
          ...currentSession,
          session_end: endTime.toISOString(),
          duration_seconds: duration,
          end_position: readingProgress?.current_position || currentSession.start_position,
        };

        // Save session to API
        fetch('/api/reading/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(completedSession),
        }).catch(console.error);

        set({ currentSession: null });
      },

      // Highlights and Notes Actions
      addHighlight: async (highlight: Omit<UserHighlight, 'id' | 'created_at' | 'updated_at'>) => {
        try {
          const response = await fetch('/api/reading/highlights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(highlight),
          });

          if (!response.ok) throw new Error('Failed to add highlight');

          const newHighlight = await response.json();
          set(state => ({
            highlights: [...state.highlights, newHighlight.highlight],
          }));
        } catch (error) {
          console.error('Error adding highlight:', error);
          get().setError('Failed to add highlight');
        }
      },

      updateHighlight: async (id: string, updates: Partial<UserHighlight>) => {
        try {
          const response = await fetch(`/api/reading/highlights/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update highlight');

          const updatedHighlight = await response.json();
          set(state => ({
            highlights: state.highlights.map(h => 
              h.id === id ? updatedHighlight.highlight : h
            ),
          }));
        } catch (error) {
          console.error('Error updating highlight:', error);
          get().setError('Failed to update highlight');
        }
      },

      removeHighlight: async (id: string) => {
        try {
          const response = await fetch(`/api/reading/highlights/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Failed to remove highlight');

          set(state => ({
            highlights: state.highlights.filter(h => h.id !== id),
          }));
        } catch (error) {
          console.error('Error removing highlight:', error);
          get().setError('Failed to remove highlight');
        }
      },

      addNote: async (note: Omit<UserNote, 'id' | 'created_at' | 'updated_at'>) => {
        try {
          const response = await fetch('/api/reading/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(note),
          });

          if (!response.ok) throw new Error('Failed to add note');

          const newNote = await response.json();
          set(state => ({
            notes: [...state.notes, newNote.note],
          }));
        } catch (error) {
          console.error('Error adding note:', error);
          get().setError('Failed to add note');
        }
      },

      updateNote: async (id: string, updates: Partial<UserNote>) => {
        try {
          const response = await fetch(`/api/reading/notes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(updates),
          });

          if (!response.ok) throw new Error('Failed to update note');

          const updatedNote = await response.json();
          set(state => ({
            notes: state.notes.map(n => 
              n.id === id ? updatedNote.note : n
            ),
          }));
        } catch (error) {
          console.error('Error updating note:', error);
          get().setError('Failed to update note');
        }
      },

      removeNote: async (id: string) => {
        try {
          const response = await fetch(`/api/reading/notes/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });

          if (!response.ok) throw new Error('Failed to remove note');

          set(state => ({
            notes: state.notes.filter(n => n.id !== id),
          }));
        } catch (error) {
          console.error('Error removing note:', error);
          get().setError('Failed to remove note');
        }
      },

      // Bookmarks Actions
      addBookmark: async (title: string, chapterId: string, position: number) => {
        const { currentBook } = get();
        if (!currentBook) return;

        const bookmark = {
          id: `bookmark-${Date.now()}`,
          book_id: currentBook.id,
          chapter_id: chapterId,
          position,
          title,
          created_at: new Date().toISOString(),
        };

        set(state => ({
          bookmarks: [...state.bookmarks, bookmark],
        }));

        // Save to API
        try {
          await fetch('/api/reading/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(bookmark),
          });
        } catch (error) {
          console.error('Error saving bookmark:', error);
        }
      },

      removeBookmark: async (id: string) => {
        set(state => ({
          bookmarks: state.bookmarks.filter(b => b.id !== id),
        }));

        try {
          await fetch(`/api/reading/bookmarks/${id}`, {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error removing bookmark:', error);
        }
      },

      // Settings Actions
      updateSettings: (settings: Partial<ReaderSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      resetSettings: () => {
        set({ settings: defaultSettings });
      },

      // UI State Actions
      toggleLeftDrawer: (tab?: ReaderUIState['leftDrawerTab']) => {
        set(state => ({
          uiState: {
            ...state.uiState,
            leftDrawerOpen: tab ? true : !state.uiState.leftDrawerOpen,
            leftDrawerTab: tab || state.uiState.leftDrawerTab,
            rightDrawerOpen: false, // Close right drawer when opening left
          },
        }));
      },

      toggleRightDrawer: (tab?: ReaderUIState['rightDrawerTab']) => {
        set(state => ({
          uiState: {
            ...state.uiState,
            rightDrawerOpen: tab ? true : !state.uiState.rightDrawerOpen,
            rightDrawerTab: tab || state.uiState.rightDrawerTab,
            leftDrawerOpen: false, // Close left drawer when opening right
          },
        }));
      },

      setSelectedText: (text: string | null, range?: { start: number; end: number } | null) => {
        set(state => ({
          uiState: {
            ...state.uiState,
            selectedText: text,
            selectionRange: range || null,
          },
        }));
      },

      toggleFullscreen: () => {
        set(state => ({
          uiState: {
            ...state.uiState,
            isFullscreen: !state.uiState.isFullscreen,
          },
        }));
      },

      // Text-to-Speech Actions
      startTextToSpeech: (text?: string) => {
        // Implementation would use Web Speech API
        set(state => ({
          uiState: {
            ...state.uiState,
            isTextToSpeechPlaying: true,
          },
        }));
      },

      pauseTextToSpeech: () => {
        set(state => ({
          uiState: {
            ...state.uiState,
            isTextToSpeechPlaying: false,
          },
        }));
      },

      stopTextToSpeech: () => {
        set(state => ({
          uiState: {
            ...state.uiState,
            isTextToSpeechPlaying: false,
            currentSpeechPosition: 0,
          },
        }));
      },

      setTextToSpeechPosition: (position: number) => {
        set(state => ({
          uiState: {
            ...state.uiState,
            currentSpeechPosition: position,
          },
        }));
      },

      // Search Actions
      searchInBook: async (query: string) => {
        const { currentBook } = get();
        if (!currentBook) return [];

        try {
          const response = await fetch(`/api/books/${currentBook.id}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ query }),
          });

          if (!response.ok) throw new Error('Search failed');

          const results = await response.json();
          return results.matches || [];
        } catch (error) {
          console.error('Error searching in book:', error);
          return [];
        }
      },

      // Error Handling Actions
      setError: (error: string | null) => {
        set(state => ({
          uiState: { ...state.uiState, error },
        }));
      },

      clearError: () => {
        set(state => ({
          uiState: { ...state.uiState, error: null },
        }));
      },
    }),
    {
      name: 'modern-ereader-storage',
      partialize: (state) => ({
        settings: state.settings,
        // Don't persist book data, highlights, notes - fetch fresh each time
      }),
    }
  )
);

export default useModernEReaderStore;