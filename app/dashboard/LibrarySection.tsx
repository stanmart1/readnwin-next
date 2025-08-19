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
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { key: 'all', label: 'All Books' },
          { key: 'reading', label: 'Currently Reading' },
          { key: 'completed', label: 'Completed' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📚</div>
          <p className="text-gray-600">No books in your library yet</p>
          <Link 
            href="/books"
            className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Books
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-[3/4] relative">
                <img
                  src={book.cover_image_url || '/placeholder-book.jpg'}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder-book.jpg';
                  }}
                />
                {book.book_type === 'ebook' && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                      Digital
                    </span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-xs mb-3">{book.author_name}</p>
                
                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-gray-600">Progress</span>
                    <span className="text-xs text-gray-600">{Math.round(book.progress_percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${book.progress_percentage}%` }}
                    />
                  </div>
                </div>

                {/* Reading Time */}
                {book.total_reading_time_seconds > 0 && (
                  <p className="text-xs text-gray-500 mb-3">
                    {Math.round(book.total_reading_time_seconds / 3600)} hours read
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  {book.book_type === 'ebook' ? (
                    <Link
                      href={`/reading/${book.id}`}
                      className="flex-1 bg-blue-600 text-white text-xs py-2 px-3 rounded-lg hover:bg-blue-700 text-center"
                    >
                      {book.progress_percentage > 0 ? 'Continue Reading' : 'Start Reading'}
                    </Link>
                  ) : (
                    <button className="flex-1 bg-gray-600 text-white text-xs py-2 px-3 rounded-lg">
                      Physical Book
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}