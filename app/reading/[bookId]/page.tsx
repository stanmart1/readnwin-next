'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ModernEReader from '../components/ModernEReader';

interface BookInfo {
  id: number;
  title: string;
  format: 'physical' | 'ebook' | 'hybrid';
}

export default function ReadingPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookInfo, setBookInfo] = useState<BookInfo | null>(null);
  const [bookLoading, setBookLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookId = params.bookId as string;

  // Check if book is readable (ebook) and user has access
  useEffect(() => {
    const checkBookAccess = async () => {
      if (!bookId || status !== 'authenticated') return;
      
      try {
        setBookLoading(true);
        
        // First check if user has access to this book in their library
        const libraryResponse = await fetch('/api/dashboard/library');
        if (!libraryResponse.ok) {
          setError('Unable to verify book access.');
          return;
        }
        
        const libraryData = await libraryResponse.json();
        const userBooks = libraryData.books || [];
        const userBook = userBooks.find((book: any) => book.id.toString() === bookId);
        
        if (!userBook) {
          setError('You do not have access to this book. Please check your library or contact support.');
          return;
        }
        
        // Check if it's a physical-only book
        if (userBook.format === 'physical') {
          setError('Physical books cannot be read digitally. You can leave a review for this book instead.');
          return;
        }
        
        // Get full book details
        const response = await fetch(`/api/books/${bookId}`);
        if (response.ok) {
          const data = await response.json();
          setBookInfo(data.book);
        } else {
          // Fallback to library book info if book API fails
          setBookInfo(userBook);
        }
        
      } catch (error) {
        console.error('Error checking book access:', error);
        setError('Failed to load book information.');
      } finally {
        setBookLoading(false);
      }
    };

    checkBookAccess();
  }, [bookId, status]);

  if (status === 'loading' || bookLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  if (!bookId || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-book-line text-amber-600 text-2xl"></i>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error ? 'Cannot Read This Book' : 'Book Not Found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {error || 'The requested book could not be found.'}
          </p>
          {error && error.includes('do not have access') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <i className="ri-information-line text-blue-600 text-lg mr-3 mt-0.5"></i>
                <div>
                  <h4 className="font-medium text-blue-900 mb-1">Need Access?</h4>
                  <p className="text-blue-700 text-sm">
                    This book may be available for purchase or assignment. Check the book details or contact an administrator.
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="space-y-3">
            {error && error.includes('Physical books') && (
              <button
                onClick={() => router.push(`/book/${bookId}?tab=reviews`)}
                className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <i className="ri-star-line mr-2"></i>
                Leave a Review Instead
              </button>
            )}
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i className="ri-dashboard-line mr-2"></i>
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleClose = () => {
    router.push('/dashboard');
  };

  // Only render e-reader if we have valid book info and it's an ebook
  if (!bookInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Preparing your book...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernEReader 
      bookId={bookId} 
      onClose={handleClose}
    />
  );
}