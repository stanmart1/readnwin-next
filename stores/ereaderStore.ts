import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  EReaderState,
  Book,
  ReadingProgress,
  Highlight,
  Note,
  ReaderSettings,
  ReadingAnalytics,
  ReadingSession,
  DrawerState,
} from "@/types/ereader";

const defaultSettings: ReaderSettings = {
  // Typography
  fontSize: 18,
  fontFamily: "serif",
  lineHeight: 1.6,
  fontWeight: 400,

  // Display
  theme: "light",
  readingWidth: "medium",
  margins: 20,
  padding: 16,

  // Layout
  justifyText: true,
  showProgressBar: true,
  showChapterNumbers: true,

  // Audio
  textToSpeech: {
    enabled: false,
    voice: "",
    speed: 1.0,
    autoPlay: false,
  },

  // Accessibility
  highContrast: false,
  reduceMotion: false,
  screenReaderMode: false,
};

const defaultDrawerState: DrawerState = {
  leftDrawer: {
    isOpen: false,
    activeTab: "notes",
  },
  rightDrawer: {
    isOpen: false,
    activeSection: "typography",
  },
};

export const useEReaderStore = create<EReaderState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBook: null,
      isLoading: false,
      error: null,
      readingProgress: null,
      currentSession: null,
      highlights: [],
      notes: [],
      settings: defaultSettings,
      analytics: [],
      drawerState: defaultDrawerState,
      isTextToSpeechPlaying: false,
      selectedText: null,

      // Actions
      loadBook: async (bookId: string) => {
        set({ isLoading: true, error: null });
        try {
          // Load book from API
          const response = await fetch(`/api/books/${bookId}/content`);
          if (!response.ok) {
            throw new Error("Failed to load book");
          }

          const data = await response.json();
          const book: Book = {
            id: bookId,
            title: data.title,
            author: data.author,
            content: data.content,
            contentType: data.contentType,
            wordCount: data.wordCount,
            filePath: data.filePath,
            coverImage: data.coverImage,
            createdAt: new Date(data.createdAt),
            updatedAt: new Date(data.updatedAt),
          };

          // Load user data for this book (progress, highlights, notes)
          try {
            const [progressResponse, highlightsResponse, notesResponse] =
              await Promise.all([
                fetch(`/api/books/${bookId}/progress`),
                fetch(`/api/books/${bookId}/highlights`),
                fetch(`/api/books/${bookId}/notes`),
              ]);

            const progressData = progressResponse.ok
              ? await progressResponse.json()
              : null;
            const highlightsData = highlightsResponse.ok
              ? await highlightsResponse.json()
              : [];
            const notesData = notesResponse.ok
              ? await notesResponse.json()
              : [];

            set({
              currentBook: book,
              readingProgress: progressData,
              highlights: highlightsData,
              notes: notesData,
              isLoading: false,
            });

            // Start new reading session
            const session: ReadingSession = {
              id: `session-${Date.now()}`,
              bookId,
              userId,
              startTime: new Date(),
              duration: 0,
              wordsRead: 0,
              progress: 0,
            };
            set({ currentSession: session });
          } catch (userDataError) {
            console.warn("Failed to load user data:", userDataError);
            // Continue with book loading even if user data fails
            const session: ReadingSession = {
              id: `session-${Date.now()}`,
              bookId,
              userId,
              startTime: new Date(),
              duration: 0,
              wordsRead: 0,
              progress: 0,
            };
            set({
              currentBook: book,
              readingProgress: null,
              highlights: [],
              notes: [],
              isLoading: false,
              currentSession: session,
            });
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to load book",
            isLoading: false,
          });
        }
      },

      saveProgress: async (progress: Partial<ReadingProgress>) => {
        const currentProgress = get().readingProgress;
        const currentSession = get().currentSession;
        const currentBook = get().currentBook;

        if (!currentBook) return;

        const updatedProgress: ReadingProgress = {
          bookId: currentBook.id,
          userId: "current-user", // Replace with actual user ID from session
          currentPosition:
            progress.currentPosition || currentProgress?.currentPosition || 0,
          percentage: progress.percentage || currentProgress?.percentage || 0,
          timeSpent:
            (currentProgress?.timeSpent || 0) + (progress.timeSpent || 0),
          lastReadAt: new Date(),
          sessionStartTime: currentProgress?.sessionStartTime || new Date(),
          wordsRead: progress.wordsRead || currentProgress?.wordsRead || 0,
          chaptersCompleted:
            progress.chaptersCompleted ||
            currentProgress?.chaptersCompleted ||
            0,
        };

        // Update session if exists
        let updatedSession = currentSession;
        if (currentSession) {
          updatedSession = {
            ...currentSession,
            endTime: new Date(),
            duration: currentSession.startTime
              ? Math.floor(
                  (new Date().getTime() - currentSession.startTime.getTime()) /
                    1000,
                )
              : 0,
            wordsRead: progress.wordsRead || currentSession.wordsRead,
            progress: progress.percentage || currentSession.progress,
          };
        }

        set({
          readingProgress: updatedProgress,
          currentSession: updatedSession,
        });

        // Save to server
        try {
          await fetch(`/api/books/${currentBook.id}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedProgress),
          });
        } catch (error) {
          console.warn("Failed to save progress to server:", error);
        }
      },

      addHighlight: (highlight: Omit<Highlight, "id" | "createdAt">) => {
        const newHighlight: Highlight = {
          ...highlight,
          id: `highlight-${Date.now()}`,
          createdAt: new Date(),
        };

        set((state) => ({
          highlights: [...state.highlights, newHighlight],
        }));
      },

      removeHighlight: (highlightId: string) => {
        set((state) => ({
          highlights: state.highlights.filter((h) => h.id !== highlightId),
        }));
      },

      addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
        const newNote: Note = {
          ...note,
          id: `note-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        set((state) => ({
          notes: [...state.notes, newNote],
        }));
      },

      updateNote: (noteId: string, updates: Partial<Note>) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === noteId
              ? { ...note, ...updates, updatedAt: new Date() }
              : note,
          ),
        }));
      },

      removeNote: (noteId: string) => {
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== noteId),
        }));
      },

      updateSettings: (settings: Partial<ReaderSettings>) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      toggleDrawer: (drawer: "left" | "right", isOpen?: boolean) => {
        set((state) => ({
          drawerState: {
            ...state.drawerState,
            [drawer === "left" ? "leftDrawer" : "rightDrawer"]: {
              ...state.drawerState[
                drawer === "left" ? "leftDrawer" : "rightDrawer"
              ],
              isOpen:
                isOpen !== undefined
                  ? isOpen
                  : !state.drawerState[
                      drawer === "left" ? "leftDrawer" : "rightDrawer"
                    ].isOpen,
            },
          },
        }));
      },

      setDrawerTab: (drawer: "left", tab: "notes" | "highlights") => {
        if (drawer !== "left") return;
        set((state) => ({
          drawerState: {
            ...state.drawerState,
            leftDrawer: {
              ...state.drawerState.leftDrawer,
              activeTab: tab,
            },
          },
        }));
      },

      setDrawerSection: (drawer: "right", section: string) => {
        if (drawer !== "right") return;
        set((state) => ({
          drawerState: {
            ...state.drawerState,
            rightDrawer: {
              ...state.drawerState.rightDrawer,
              activeSection: section as any,
            },
          },
        }));
      },

      startTextToSpeech: () => {
        set({ isTextToSpeechPlaying: true });
        // Implement actual TTS logic here
      },

      stopTextToSpeech: () => {
        set({ isTextToSpeechPlaying: false });
        // Implement actual TTS logic here
      },

      setSelectedText: (text: string | null) => {
        set({ selectedText: text });
      },

      // Analytics functions
      updateAnalytics: (analytics: ReadingAnalytics) => {
        set((state) => ({
          analytics: [...state.analytics, analytics],
        }));
      },

      // Export functions
      exportData: () => {
        const state = get();
        return {
          highlights: state.highlights,
          notes: state.notes,
          readingProgress: state.readingProgress ? [state.readingProgress] : [],
          settings: state.settings,
          analytics: state.analytics,
        };
      },

      // Utility functions
      getHighlightsForBook: (bookId: string) => {
        return get().highlights.filter((h) => h.bookId === bookId);
      },

      getNotesForBook: (bookId: string) => {
        return get().notes.filter((n) => n.bookId === bookId);
      },

      getReadingProgressForBook: (bookId: string) => {
        const progress = get().readingProgress;
        return progress && progress.bookId === bookId ? progress : null;
      },
    }),
    {
      name: "ereader-storage",
      partialize: (state) => ({
        highlights: state.highlights,
        notes: state.notes,
        settings: state.settings,
        analytics: state.analytics,
        drawerState: state.drawerState,
      }),
    },
  ),
);
