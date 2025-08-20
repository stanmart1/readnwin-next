'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth';
import Link from 'next/link';

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
  const { data: session } = useSession();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'reading' | 'completed'>('all');

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/dashboard/library');
        if (response.ok) {
          const data = await response.json();
          setBooks(data.books || []);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [session]);

  const filteredBooks = books.filter(book => {
    switch (filter) {
      case 'reading':
        return book.progress_percentage > 0 && book.progress_percentage < 100;
      case 'completed':
        return book.completed_at || book.progress_percentage >= 100;
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All Books', icon: 'ri-book-line' },
          { key: 'reading', label: 'Reading', icon: 'ri-play-line' },
          { key: 'completed', label: 'Completed', icon: 'ri-check-line' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`inline-flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                : 'bg-white text-gray-600 hover:text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-200'
            }`}
          >
            <i className={`${tab.icon} mr-2`}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
            <i className="ri-book-line text-3xl text-blue-600"></i>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No books in your library yet</h3>
          <p className="text-gray-600 mb-6">Start building your digital library today</p>
          <Link 
            href="/books"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
          >
            <i className="ri-search-line mr-2"></i>
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={book.cover_image_url || '/placeholder-book.jpg'}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-book.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Book Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
                    book.book_type === 'ebook' 
                      ? 'bg-blue-600/90 text-white' 
                      : 'bg-amber-600/90 text-white'
                  }`}>
                    {book.book_type === 'ebook' ? 'Digital' : 'Physical'}
                  </span>
                </div>

                {/* Progress Overlay */}
                {book.progress_percentage > 0 && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-white/20 rounded-full h-1.5">
                        <div 
                          className="bg-white h-1.5 rounded-full transition-all duration-300"
                          style={{ width: `${book.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-white text-xs font-medium">{Math.round(book.progress_percentage)}%</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-xs mb-3">{book.author_name}</p>
                
                {/* Reading Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <span>{Math.round(book.progress_percentage)}% complete</span>
                  {book.total_reading_time_seconds > 0 && (
                    <span>{Math.round(book.total_reading_time_seconds / 3600)}h read</span>
                  )}
                </div>

                {/* Action Button */}
                {book.book_type === 'ebook' ? (
                  <Link
                    href={`/reading/${book.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <i className={`${book.progress_percentage > 0 ? 'ri-play-line' : 'ri-book-open-line'} mr-2`}></i>
                    {book.progress_percentage > 0 ? 'Continue Reading' : 'Start Reading'}
                  </Link>
                ) : (
                  <button className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-sm font-medium rounded-xl shadow-sm">
                    <i className="ri-book-line mr-2"></i>
                    Physical Book
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}