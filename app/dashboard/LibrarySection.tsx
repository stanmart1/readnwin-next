'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';
import Modal from '@/components/ui/Modal';
import ReviewForm from '@/components/ReviewForm';
import { decodeHtmlEntities } from '@/utils/htmlUtils';
import { toast } from 'react-hot-toast';

interface LibraryBook {
  id: number;
  title: string;
  author_name: string;
  cover_image_url?: string;
  format: 'physical' | 'ebook' | 'hybrid';
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
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedBookForReview, setSelectedBookForReview] = useState<LibraryBook | null>(null);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch library books
        const libraryResponse = await fetch('/api/dashboard/library', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });
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
            const progressResponse = await fetch('/api/reading/progress', {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json'
              }
            });
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

  const openReviewModal = (book: LibraryBook) => {
    setSelectedBookForReview(book);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedBookForReview(null);
  };

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
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <i className="ri-book-line text-white text-lg"></i>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Library</h1>
            </div>
            <p className="text-gray-600 ml-13">
              {books.length === 0 ? 'Start building your digital collection' : `${books.length} book${books.length !== 1 ? 's' : ''} in your collection`}
            </p>
          </div>
          
          {books.length > 0 && (
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-gray-200">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title="Grid view"
                >
                  <i className="ri-grid-line text-lg"></i>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 sm:p-3 rounded-lg transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                  title="List view"
                >
                  <i className="ri-list-check text-lg"></i>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      {books.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {[
              { key: 'all' as const, label: 'All Books', icon: 'ri-book-line', count: counts.all },
              { key: 'reading' as const, label: 'Reading', icon: 'ri-play-line', count: counts.reading },
              { key: 'completed' as const, label: 'Completed', icon: 'ri-check-line', count: counts.completed }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`inline-flex items-center px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 transform hover:scale-105 ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/25'
                    : 'bg-gray-50 text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 hover:shadow-md'
                }`}
              >
                <i className={`${tab.icon} mr-2 text-base`}></i>
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold ${
                    filter === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {filteredBooks.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-16 sm:py-20">
          <div className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-lg">
            <i className="ri-book-line text-3xl sm:text-4xl text-blue-600"></i>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
            {books.length === 0 ? 'Your Library Awaits' : `No ${filter} Books Found`}
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto text-base sm:text-lg">
            {books.length === 0 
              ? 'Discover amazing books and start your reading journey today' 
              : `You don't have any ${filter} books at the moment`}
          </p>
          {books.length === 0 && (
            <Link 
              href="/books"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-base sm:text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <i className="ri-search-line mr-2 text-lg"></i>
              Explore Books
            </Link>
          )}
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "flex flex-wrap gap-4 sm:gap-6" 
          : "space-y-3"
        }>
          {filteredBooks.map((book, index) => (
            viewMode === 'grid' ? (
              <div key={`grid-${book.id}-${index}`} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-2 w-full sm:w-72 md:w-80 flex-shrink-0">
                <div className="aspect-[3/4] relative overflow-hidden">
                  <SafeImage
                    src={book.cover_image_url}
                    alt={book.title}
                    bookTitle={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Book Type Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm shadow-lg ${
                      book.format === 'ebook' 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white' 
                        : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white'
                    }`}>
                      {book.format === 'ebook' ? 'Digital' : 'Physical'}
                    </span>
                  </div>

                  {/* Progress Overlay */}
                  {book.progress_percentage > 0 && (book.format === 'ebook' || book.format === 'hybrid') && (
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
                    {decodeHtmlEntities(book.title)}
                  </h3>
                  <p className="text-gray-600 text-xs mb-2 sm:mb-3 truncate">{book.author_name}</p>
                  
                  {/* Reading Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3 sm:mb-4">
                    {(book.format === 'ebook' || book.format === 'hybrid') && (
                      <span>{Math.round(book.progress_percentage)}%</span>
                    )}
                    {book.total_reading_time_seconds > 0 && (
                      <span className="hidden sm:inline">{Math.round(book.total_reading_time_seconds / 3600)}h</span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    {book.format === 'ebook' || book.format === 'hybrid' ? (
                      <Link
                        href={`/reading/${book.id}`}
                        className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                      >
                        <i className={`${book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'} mr-2 text-base`}></i>
                        <span className="hidden sm:inline">
                          {book.progress_percentage > 0 ? 'Continue Reading' : 'Start Reading'}
                        </span>
                        <span className="sm:hidden">
                          {book.progress_percentage > 0 ? 'Continue' : 'Read'}
                        </span>
                      </Link>
                    ) : (
                      <div className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg">
                        <i className="ri-book-line mr-2 text-base"></i>
                        <span className="hidden sm:inline">Physical Book</span>
                        <span className="sm:hidden">Physical</span>
                      </div>
                    )}
                    
                    <button
                      onClick={() => openReviewModal(book)}
                      className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                    >
                      <i className="ri-star-line mr-2 text-base"></i>
                      <span className="hidden sm:inline">Add Review</span>
                      <span className="sm:hidden">Review</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div key={`list-${book.id}-${index}`} className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 p-6 transform hover:-translate-y-1">
                <div className="flex items-center space-x-6">
                  <div className="flex-shrink-0 w-20 h-24 sm:w-24 sm:h-28 relative overflow-hidden rounded-xl shadow-md">
                    <SafeImage
                      src={book.cover_image_url}
                      alt={book.title}
                      bookTitle={book.title}
                      className="w-full h-full object-cover"
                    />
                    {book.progress_percentage > 0 && (book.format === 'ebook' || book.format === 'hybrid') && (
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
                          {decodeHtmlEntities(book.title)}
                        </h3>
                        <p className="text-gray-600 text-xs sm:text-sm mb-2">{book.author_name}</p>
                        
                        <div className="flex items-center space-x-4 text-xs sm:text-sm text-gray-500">
                          {(book.format === 'ebook' || book.format === 'hybrid') && (
                            <span>{Math.round(book.progress_percentage)}% complete</span>
                          )}
                          {book.total_reading_time_seconds > 0 && (
                            <span>{Math.round(book.total_reading_time_seconds / 3600)}h read</span>
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            book.format === 'ebook' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {book.format === 'ebook' ? 'Digital' : 'Physical'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-shrink-0 ml-4 flex flex-col space-y-3">
                        {book.format === 'ebook' || book.format === 'hybrid' ? (
                          <Link
                            href={`/reading/${book.id}`}
                            className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                          >
                            <i className={`${book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'} mr-2`}></i>
                            <span className="hidden sm:inline">
                              {book.progress_percentage > 0 ? 'Continue' : 'Read'}
                            </span>
                            <span className="sm:hidden">
                              <i className={book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'}></i>
                            </span>
                          </Link>
                        ) : (
                          <div className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-gray-400 to-gray-500 text-white text-sm font-semibold rounded-xl shadow-lg">
                            <i className="ri-book-line mr-2"></i>
                            <span className="hidden sm:inline">Physical</span>
                            <span className="sm:hidden">
                              <i className="ri-book-line"></i>
                            </span>
                          </div>
                        )}
                        
                        <button
                          onClick={() => openReviewModal(book)}
                          className="inline-flex items-center px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-sm font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                        >
                          <i className="ri-star-line mr-2"></i>
                          <span className="hidden sm:inline">Review</span>
                          <span className="sm:hidden">
                            <i className="ri-star-line"></i>
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}
      
      {/* Review Modal */}
      <Modal
        isOpen={reviewModalOpen}
        onClose={closeReviewModal}
        className="max-w-lg w-full mx-4 max-h-[95vh] overflow-hidden"
        showCloseIcon={false}
      >
        {selectedBookForReview && (
          <div className="flex flex-col h-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                  <i className="ri-star-line text-white text-lg"></i>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    Write a Review
                  </h2>
                  <p className="text-sm text-gray-600 truncate max-w-[200px] sm:max-w-none">
                    {decodeHtmlEntities(selectedBookForReview.title)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeReviewModal}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-gray-500 hover:text-gray-700 transition-all duration-200 shadow-sm"
              >
                <i className="ri-close-line text-lg"></i>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              <ReviewForm
                bookId={selectedBookForReview.id}
                onReviewSubmitted={() => {
                  toast.success('Review submitted successfully! It will be reviewed by our team.');
                  closeReviewModal();
                }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}