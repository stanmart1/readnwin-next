// E-Reader TypeScript Interfaces

export interface Book {
  id: string;
  title: string;
  author: string;
  content: string;
  contentType: 'markdown' | 'html' | 'epub';
  wordCount: number;
  filePath: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReadingProgress {
  bookId: string;
  userId: string;
  currentPosition: number; // Scroll position or chapter index
  percentage: number; // 0-100
  timeSpent: number; // Total time in seconds
  lastReadAt: Date;
  sessionStartTime?: Date;
  wordsRead: number;
  chaptersCompleted: number;
}

export interface Highlight {
  id: string;
  bookId: string;
  userId: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: 'yellow' | 'green' | 'blue' | 'pink' | 'purple';
  note?: string;
  createdAt: Date;
  chapterIndex?: number;
  position: number; // Scroll position when highlighted
}

export interface Note {
  id: string;
  bookId: string;
  userId: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  attachedToHighlight?: string; // Highlight ID if attached
  position: number; // Scroll position when note was created
  chapterIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReaderSettings {
  // Typography
  fontSize: number; // 12-24px
  fontFamily: string;
  lineHeight: number; // 1.2-2.0
  fontWeight: number; // 300-700
  
  // Display
  theme: 'light' | 'dark' | 'sepia';
  readingWidth: 'narrow' | 'medium' | 'wide';
  margins: number; // 0-100px
  padding: number; // 0-50px
  
  // Layout
  justifyText: boolean;
  showProgressBar: boolean;
  showChapterNumbers: boolean;
  
  // Audio
  textToSpeech: {
    enabled: boolean;
    voice: string;
    speed: number; // 0.5-2.0
    autoPlay: boolean;
  };
  
  // Accessibility
  highContrast: boolean;
  reduceMotion: boolean;
  screenReaderMode: boolean;
}

export interface ReadingAnalytics {
  userId: string;
  date: string; // YYYY-MM-DD
  totalReadingTime: number; // seconds
  wordsRead: number;
  booksRead: number;
  pagesRead: number;
  averageWPM: number; // words per minute
  readingStreak: number; // consecutive days
  sessionCount: number;
  longestSession: number; // seconds
}

export interface ReadingSession {
  id: string;
  bookId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // seconds
  wordsRead: number;
  progress: number; // 0-100
}

export interface DrawerState {
  leftDrawer: {
    isOpen: boolean;
    activeTab: 'notes' | 'highlights';
  };
  rightDrawer: {
    isOpen: boolean;
    activeSection: 'typography' | 'display' | 'layout' | 'audio' | 'accessibility';
  };
}

export interface EReaderState {
  // Current book
  currentBook: Book | null;
  isLoading: boolean;
  error: string | null;
  
  // Reading progress
  readingProgress: ReadingProgress | null;
  currentSession: ReadingSession | null;
  
  // User data
  highlights: Highlight[];
  notes: Note[];
  settings: ReaderSettings;
  analytics: ReadingAnalytics[];
  
  // UI state
  drawerState: DrawerState;
  isTextToSpeechPlaying: boolean;
  selectedText: string | null;
  
  // Actions
  loadBook: (bookId: string) => Promise<void>;
  saveProgress: (progress: Partial<ReadingProgress>) => void;
  addHighlight: (highlight: Omit<Highlight, 'id' | 'createdAt'>) => void;
  removeHighlight: (highlightId: string) => void;
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateNote: (noteId: string, updates: Partial<Note>) => void;
  removeNote: (noteId: string) => void;
  updateSettings: (settings: Partial<ReaderSettings>) => void;
  toggleDrawer: (drawer: 'left' | 'right', isOpen?: boolean) => void;
  setDrawerTab: (drawer: 'left', tab: 'notes' | 'highlights') => void;
  setDrawerSection: (drawer: 'right', section: string) => void;
  startTextToSpeech: () => void;
  stopTextToSpeech: () => void;
  setSelectedText: (text: string | null) => void;
}

// File processing interfaces
export interface FileProcessingResult {
  success: boolean;
  content: string;
  metadata: {
    title: string;
    author: string;
    wordCount: number;
    chapterCount: number;
  };
  error?: string;
}

export interface ContentChunk {
  id: string;
  content: string;
  wordCount: number;
  position: number;
  chapterIndex?: number;
}

// Text-to-speech interfaces
export interface TTSState {
  isPlaying: boolean;
  currentPosition: number;
  totalLength: number;
  voice: string;
  speed: number;
  text: string;
}

// Gesture and interaction interfaces
export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

// Export interfaces
export interface ExportData {
  highlights: Highlight[];
  notes: Note[];
  readingProgress: ReadingProgress[];
  settings: ReaderSettings;
  analytics: ReadingAnalytics[];
}

export interface ExportOptions {
  format: 'json' | 'csv' | 'txt';
  includeHighlights: boolean;
  includeNotes: boolean;
  includeProgress: boolean;
  includeSettings: boolean;
  includeAnalytics: boolean;
} 