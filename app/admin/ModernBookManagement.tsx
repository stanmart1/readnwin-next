'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Book {
  id: number;
  title: string;
  author_name: string;
  category_name: string;
  price: number;
  status: string;
  stock_quantity: number;
  is_featured: boolean;
  cover_image_url: string;
  format: string;
  created_at: string;
}

export default function ModernBookManagement() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });
      
      if (filters.search) params.append('search', filters.search);
      if (filters.status) params.append('status', filters.status);

      const response = await fetch(`/api/books?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to load books');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setBooks(data.books || []);
        setPagination({
          currentPage: data.pagination?.currentPage || 1,
          totalPages: data.pagination?.totalPages || 1,
          totalItems: data.pagination?.totalItems || 0
        });
      } else {
        throw new Error(data.error || 'Failed to load books');
      }
    } catch (error) {
      console.error('Error loading books:', error);
      setError(error instanceof Error ? error.message : 'Failed to load books');
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    setBookToDelete(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    
    try {
      const response = await fetch(`/api/books?ids=${bookToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete book');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success('Book deleted successfully');
        setBooks(prev => prev.filter(book => book.id !== bookToDelete));
        setShowDeleteConfirm(false);
        setBookToDelete(null);
      } else {
        throw new Error(result.error || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete book');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
      return;
    }
    
    try {
      const response = await fetch(`/api/books?ids=${selectedBooks.join(',')}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete books');
      }
      
      const result = await response.json();
      
      if (result.success) {
        toast.success(`Successfully deleted ${result.deleted_count} books`);
        setBooks(prev => prev.filter(book => !selectedBooks.includes(book.id)));
        setSelectedBooks([]);
      } else {
        throw new Error(result.error || 'Failed to delete books');
      }
    } catch (error) {
      console.error('Error deleting books:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete books');
    }
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading books</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
              <div className="mt-3">
                <button
                  onClick={loadBooks}
                  className="bg-red-100 text-red-800 px-3 py-1 rounded text-sm hover:bg-red-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Modern Book Management</h1>
        <p className="mt-1 text-gray-600">Manage your book catalog using the new system</p>
      </div>

      {/* Actions */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex space-x-3">
          <button
            onClick={() => window.location.href = '/admin?tab=content&action=add'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add New Book
          </button>
          {selectedBooks.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Delete Selected ({selectedBooks.length})
            </button>
          )}
        </div>
        
        <div className="flex space-x-3">
          <input
            type="text"
            placeholder="Search books..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <button
            onClick={handleSearch}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Search
          </button>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBooks.length === books.length && books.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedBooks(books.map(b => b.id));
                    } else {
                      setSelectedBooks([]);
                    }
                  }}
                  className="rounded border-gray-300"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Book
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBooks(prev => [...prev, book.id]);
                      } else {
                        setSelectedBooks(prev => prev.filter(id => id !== book.id));
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-12 w-8 flex-shrink-0">
                      <img
                        className="h-12 w-8 object-cover rounded"
                        src={book.cover_image_url || '/placeholder-book.jpg'}
                        alt={book.title}
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-book.jpg';
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.format || 'Unknown'}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {book.author_name || 'Unknown'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {book.category_name || 'Uncategorized'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  ₦{book.price || 0}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    book.status === 'published' ? 'bg-green-100 text-green-800' :
                    book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status || 'draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(`/book/${book.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {books.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500 mb-4">
              {filters.search || filters.status ? 'Try adjusting your search filters.' : 'Get started by adding your first book.'}
            </p>
            <button
              onClick={() => setFilters({ search: '', status: '', page: 1, limit: 20 })}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.totalItems)} of {pagination.totalItems} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.max(prev.page - 1, 1) }))}
              disabled={pagination.currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: Math.min(prev.page + 1, pagination.totalPages) }))}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this book? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteBook}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setBookToDelete(null);
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}