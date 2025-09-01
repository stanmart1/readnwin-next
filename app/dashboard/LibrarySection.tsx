'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

interface LibraryBook {
  id: number;
  title: string;
  author_name: string;
  cover_image_url?: string;
  book_type: 'physical' | 'ebook' | 'hybrid';
  primary_format?: string;
  progress_percentage: number;
  last_read_at?: string;
  completed_at?: string;
  total_reading_time_seconds: number;
}

export default function LibrarySection() {
  const { data: session, status } = useSession();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const fetchLibrary = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch library books
        const libraryResponse = await fetch('/api/dashboard/library');
        if (!libraryResponse.ok) {
          console.warn('Library API error:', libraryResponse.status);
          setBooks([]);
          return;
        }

        const libraryData = await libraryResponse.json();
        let libraryBooks = libraryData.books || [];

        // Fetch reading progress for each book
        if (libraryBooks.length > 0) {
          try {
            const progressResponse = await fetch('/api/reading/progress');
            if (progressResponse.ok) {
              const progressData = await progressResponse.json();
              const progressMap = new Map(progressData.progress?.map((p: any) => [p.book_id, p]) || []);
              
              // Merge progress data with library books
              libraryBooks = libraryBooks.map((book: LibraryBook) => {
                const progress = progressMap.get(book.id);
                return {
                  ...book,
                  progress_percentage: progress?.progress_percentage || 0,
                  last_read_at: progress?.last_read_at,
                  completed_at: progress?.completed_at,
                  total_reading_time_seconds: progress?.total_reading_time_seconds || 0
                };
              });
            }
          } catch (progressError) {
            console.warn('Failed to fetch reading progress:', progressError);
          }
        }

        setBooks(libraryBooks);
      } catch (error) {
        console.error('Error fetching library:', error);
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [session, status]);

  const { filteredBooks, counts } = useMemo(() => {
    const readingBooks = books.filter(book => book.progress_percentage > 0 && book.progress_percentage < 100);
    const completedBooks = books.filter(book => book.completed_at || book.progress_percentage >= 100);
    
    const filtered = (() => {
      switch (filter) {
        case 'reading':
          return readingBooks;
        case 'completed':
          return completedBooks;
        default:
          return books;
      }
    })();

    return {
      filteredBooks: filtered,
      counts: {
        all: books.length,
        reading: readingBooks.length,
        completed: completedBooks.length
      }
    };
  }, [books, filter]);

  if (loading || status === 'loading') {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-10 bg-gray-200 rounded-lg w-24"></div>
            ))}
          </div>
        </div>
        
        {/* Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[3/4] bg-gray-200 rounded-xl mb-3"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded-lg w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600 mt-1">
            {books.length === 0 ? 'No books yet' : `${books.length} book${books.length !== 1 ? 's' : ''} in your collection`}
          </p>
        </div>
        
        {books.length > 0 && (
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Grid view"
              >
                <i className="ri-grid-line text-lg"></i>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-all ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="List view"
              >
                <i className="ri-list-check text-lg"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      {books.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as const, label: 'All Books', icon: 'ri-book-line', count: counts.all },
            { key: 'reading' as const, label: 'Reading', icon: 'ri-play-line', count: counts.reading },
            { key: 'completed' as const, label: 'Completed', icon: 'ri-check-line', count: counts.completed }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`inline-flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-all ${
                filter === tab.key
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                  : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200'
              }`}
            >
              <i className={`${tab.icon} mr-1.5 sm:mr-2 text-sm sm:text-base`}></i>
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
              {tab.count > 0 && (
                <span className={`ml-1.5 sm:ml-2 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                  filter === tab.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12 sm:py-16">
          <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <i className="ri-book-line text-2xl sm:text-3xl text-blue-600"></i>
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
            {books.length === 0 ? 'No books in your library yet' : `No ${filter} books`}
          </h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            {books.length === 0 
              ? 'Start building your digital library today' 
              : `You don&apos;t have any ${filter} books at the moment`}
          </p>
          {books.length === 0 && (
            <Link 
              href="/books"
              className="inline-flex items-center px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
            >
              <i className="ri-search-line mr-2"></i>
              Browse Books
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4" 
          : "space-y-3"
        }>
          {filteredBooks.map(book => (
            viewMode === 'grid' ? (
              <div key={book.id} className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <SafeImage
                    src={book.cover_image_url}
                    alt={book.title}
                    bookTitle={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Book Type Badge */}
                  <div className="absolute top-2 right-2">
                    <span className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                      book.book_type === 'ebook' 
                        ? 'bg-blue-600/90 text-white' 
                        : 'bg-amber-600/90 text-white'
                    }`}>
                      {book.book_type === 'ebook' ? 'Digital' : 'Physical'}
                    </span>
                  </div>

                  {/* Progress Overlay */}
                  {book.progress_percentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 sm:p-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/20 rounded-full h-1 sm:h-1.5">
                          <div 
                            className="bg-white h-1 sm:h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-medium">{Math.round(book.progress_percentage)}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-gray-900 text-xs sm:text-sm mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors leading-tight">
                    {book.title}
                  </h3>
                  <p className="text-gray-600 text-xs mb-2 sm:mb-3 truncate">{book.author_name}</p>
                  
                  {/* Reading Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
                    <span>{Math.round(book.progress_percentage)}%</span>
                    {book.total_reading_time_seconds > 0 && (
                      <span className="hidden sm:inline">{Math.round(book.total_reading_time_seconds / 3600)}h</span>
                    )}
                  </div>

                  {/* Action Button */}
                  {book.book_type === 'ebook' ? (
                    <Link
                      href={`/read/${book.id}`}
                      className="w-full inline-flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                    >
                      <i className={`${book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'} mr-1 sm:mr-2 text-sm`}></i>
                      <span className="hidden sm:inline">
                        {book.progress_percentage > 0 ? 'Continue Reading' : 'Start Reading'}
                      </span>
                      <span className="sm:hidden">
                        {book.progress_percentage > 0 ? 'Continue' : 'Read'}
                      </span>
                    </Link>
                  ) : (
                    <div className="w-full inline-flex items-center justify-center px-2 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl shadow-sm transition-all">
                      <i className="ri-book-line mr-1 sm:mr-2 text-sm"></i>
                      <span className="hidden sm:inline">Physical Book</span>
                      <span className="sm:hidden">Physical</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div key={book.id} className="group bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 p-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-16 h-20 sm:w-20 sm:h-24 relative overflow-hidden rounded-lg">
                    <SafeImage
                      src={book.cover_image_url}
                      alt={book.title}
                      bookTitle={book.title}
                      className="w-full h-full object-cover"
                    />
                    {book.progress_percentage > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1">
                        <div className="bg-white/20 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                          {book.title}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">{book.author_name}</p>
                        
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
                          <span>{Math.round(book.progress_percentage)}% complete</span>
                          {book.total_reading_time_seconds > 0 && (
                            <span>{Math.round(book.total_reading_time_seconds / 3600)}h read</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.book_type === 'ebook' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {book.book_type === 'ebook' ? 'Digital' : 'Physical'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4">
                        {book.book_type === 'ebook' ? (
                          <Link
                            href={`/read/${book.id}`}
                            className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                          >
                            <i className={`${book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'} mr-1 sm:mr-2`}></i>
                            <span className="hidden sm:inline">
                              {book.progress_percentage > 0 ? 'Continue' : 'Read'}
                            </span>
                            <span className="sm:hidden">
                              <i className={book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'}></i>
                            </span>
                          </Link>
                        ) : (
                          <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-xs sm:text-sm font-medium rounded-lg shadow-sm transition-all">
                            <i className="ri-book-line mr-1 sm:mr-2"></i>
                            <span className="hidden sm:inline">Physical</span>
                            <span className="sm:hidden">
                              <i className="ri-book-line"></i>
                            </span>
                          </div>
                        )
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}