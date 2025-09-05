'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Search, BookOpen, X } from 'lucide-react';
import SafeImage from '@/components/ui/SafeImage';
import { decodeHtmlEntities } from '@/utils/htmlUtils';

interface LibraryBook {
  id: number;
  title: string;
  author_name: string;
  cover_image_url?: string;
  format: 'physical' | 'ebook' | 'hybrid';
  progress_percentage: number;
}

interface BookSearchInterfaceProps {
  onClose: () => void;
  onBookSelect: (bookId: string) => void;
}

export default function BookSearchInterface({ onClose, onBookSelect }: BookSearchInterfaceProps) {
  const { data: session } = useSession();
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<LibraryBook[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!session?.user?.id) return;

      try {
        // Fetch library books with reading progress
        const [libraryResponse, progressResponse] = await Promise.all([
          fetch('/api/dashboard/library'),
          fetch('/api/reading/progress')
        ]);
        
        if (libraryResponse.ok) {
          const libraryData = await libraryResponse.json();
          let libraryBooks = (libraryData.books || []).filter((book: LibraryBook) => 
            book.format === 'ebook' || book.format === 'hybrid'
          );
          
          // Merge with reading progress if available
          if (progressResponse.ok) {
            const progressData = await progressResponse.json();
            const progressMap = new Map(progressData.progress?.map((p: any) => [p.book_id, p]) || []);
            
            libraryBooks = libraryBooks.map((book: LibraryBook) => {
              const progress = progressMap.get(book.id);
              return {
                ...book,
                progress_percentage: progress?.progress_percentage || 0,
                last_read_at: progress?.last_read_at
              };
            });
          }
          
          setBooks(libraryBooks);
          setFilteredBooks(libraryBooks);
        }
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [session]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredBooks(books);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author_name.toLowerCase().includes(query)
      );
      setFilteredBooks(filtered);
    }
  }, [searchQuery, books]);

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Select a Book</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose from your library to start reading</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 dark:bg-gray-700 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No books found' : 'No digital books available'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Add some ebooks to your library to start reading'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBooks.map(book => (
              <div
                key={book.id}
                onClick={() => onBookSelect(book.id.toString())}
                className="group cursor-pointer bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 transform hover:-translate-y-2"
              >
                <div className="aspect-[3/4] relative overflow-hidden">
                  <SafeImage
                    src={book.cover_image_url}
                    alt={book.title}
                    bookTitle={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                  {/* Progress Overlay */}
                  {book.progress_percentage > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 bg-white/20 rounded-full h-1">
                          <div 
                            className="bg-white h-1 rounded-full transition-all duration-300"
                            style={{ width: `${book.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-white text-xs font-medium">{Math.round(book.progress_percentage)}%</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-2 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors leading-tight">
                    {decodeHtmlEntities(book.title)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-xs truncate">{book.author_name}</p>
                  
                  {book.progress_percentage > 0 && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {Math.round(book.progress_percentage)}% complete
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}