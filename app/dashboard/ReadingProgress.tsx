'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import SafeImage from '@/components/ui/SafeImage';

interface CurrentlyReading {
  id: number;
  title: string;
  author_name: string;
  cover_image_url?: string;
  progress_percentage: number;
  current_chapter_id?: string;
  total_reading_time_seconds: number;
  last_read_at: string;
}

export default function ReadingProgress() {
  const { data: session, status } = useSession();
  const [currentlyReading, setCurrentlyReading] = useState<CurrentlyReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentlyReading = async () => {
      if (status === 'loading') return;
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/dashboard/currently-reading');
        if (response.ok) {
          const data = await response.json();
          setCurrentlyReading(data.books || []);
        }
      } catch (error) {
        console.error('Error fetching currently reading:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentlyReading();
  }, [session, status]);

  if (loading || status === 'loading') {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Currently Reading</h2>
        <Link 
          href="/dashboard?tab=library"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          View All
        </Link>
      </div>

      {currentlyReading.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-4">📖</div>
          <p className="text-gray-600 mb-4">No books in progress</p>
          <Link 
            href="/books"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Start Reading
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {currentlyReading.map(book => (
            <div key={book.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <SafeImage
                src={book.cover_image_url}
                alt={book.title}
                bookTitle={book.title}
                width={48}
                height={64}
                className="w-12 h-16 object-cover rounded"
              />
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">{book.title}</h3>
                <p className="text-sm text-gray-600">{book.author_name}</p>
                
                <div className="mt-2">
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

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {Math.round(book.total_reading_time_seconds / 3600)} hours read
                  </span>
                  <span className="text-xs text-gray-500">
                    Last read: {new Date(book.last_read_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <Link
                href={`/dashboard?tab=library`}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 whitespace-nowrap"
              >
                Continue
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}