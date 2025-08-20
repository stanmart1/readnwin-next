'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import BulkLibraryManagement from './BulkLibraryManagement';
import EnhancedReadingAnalytics from './EnhancedReadingAnalytics';
import Pagination from '@/components/Pagination';
import { useLoadingState, useSkeletonLoading } from '@/hooks/useLoadingState';
import { EnhancedErrorDisplay } from '@/components/ui/EnhancedErrorDisplay';
import { LoadingSpinner, CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSpinner';
import ModernBookUploadModal from '@/components/ModernBookUploadModal';

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

interface Category {
  id: number;
  name: string;
  description: string;
  book_count: number;
}

interface Author {
  id: number;
  name: string;
  email: string;
  books_count: number;
  total_sales: number;
  revenue: number;
  status: string;
  avatar_url: string;
  created_at: string;
}

export default function BookManagementEnhanced() {
  const [activeSection, setActiveSection] = useState('books');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkLibrary, setShowBulkLibrary] = useState(false);
  const [selectedBookForAssignment, setSelectedBookForAssignment] = useState<Book | null>(null);
  
  // Loading states
  const { loadingState, startLoading, stopLoading, updateProgress } = useLoadingState();
  const { isLoading: skeletonLoading } = useSkeletonLoading();
  
  // Error handling
  const [error, setError] = useState<any>(null);
  const [generalError, setGeneralError] = useState<any>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const clearError = () => setError(null);
  const clearAllErrors = () => {
    setFieldErrors({});
    setGeneralError(null);
  };
  const setFieldError = (field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }));
  };

  // State management
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    category_id: undefined as number | undefined
  });
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);



  // Load initial data
  useEffect(() => {
    loadData();
    loadAuthorsAndCategories();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = async () => {
    try {
      startLoading('Loading books...', 'spinner');
      updateProgress(25, 'Fetching books...');
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status
      });
      if (filters.category_id) params.append('category_id', filters.category_id.toString());
      
      const response = await fetch(`/api/books?${params}`);
      if (!response.ok) throw new Error('Failed to load books');
      const result = await response.json();
      
      updateProgress(75, 'Processing data...');
      
      setBooks(result.books);
      setPagination({
        page: result.pagination.currentPage,
        limit: result.pagination.itemsPerPage,
        total: result.pagination.totalItems,
        pages: result.pagination.totalPages
      });
      
      updateProgress(100, 'Completed');
      setTimeout(() => stopLoading(), 500);
      
    } catch (error) {
      setError(error);
      stopLoading();
    }
  };

  const loadAuthorsAndCategories = async () => {
    try {
      const [authorsResponse, categoriesResponse] = await Promise.all([
        fetch('/api/admin/authors'),
        fetch('/api/admin/categories')
      ]);
      
      if (authorsResponse.ok) {
        const authorsResult = await authorsResponse.json();
        setAuthors(authorsResult.authors || []);
      }
      
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        setCategories(categoriesResult.categories || []);
      }
    } catch (error) {
      console.error('Failed to load authors/categories:', error);
    }
  };



  const handleDeleteBook = async (bookId: number) => {
    setBookToDelete(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;
    
    try {
      startLoading('Deleting book...', 'spinner');
      
      const params = new URLSearchParams({ ids: bookToDelete.toString() });
      const response = await fetch(`/api/books?${params}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete book');
      
      stopLoading();
      setShowDeleteConfirm(false);
      setBookToDelete(null);
      loadData();
      toast.success('Book deleted successfully!');
      
    } catch (error) {
      setError(error);
      stopLoading();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to delete');
      return;
    }
    
    try {
      startLoading(`Deleting ${selectedBooks.length} books...`, 'progress');
      updateProgress(25, 'Preparing deletion...');
      
      const params = new URLSearchParams({ ids: selectedBooks.join(',') });
      const response = await fetch(`/api/books?${params}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete books');
      const result = await response.json();
      
      updateProgress(100, 'Books deleted successfully');
      setTimeout(() => {
        stopLoading();
        setSelectedBooks([]);
        loadData();
        toast.success(`Successfully deleted ${result.deleted_count} books`);
      }, 1000);
      
    } catch (error) {
      setError(error);
      stopLoading();
    }
  };

  const handleRetry = () => {
    clearError();
    loadData();
  };

  // Render loading states - removed overlay check as it's handled by the loading overlay below

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <EnhancedErrorDisplay
            error={error}
            onRetry={handleRetry}
            onDismiss={clearError}
            className="mb-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Book Management</h1>
          <p className="mt-2 text-gray-600">Manage your digital library collection</p>
        </div>

        {/* Error Display */}
        {generalError && (
          <div className="mb-6">
            <EnhancedErrorDisplay
              error={generalError}
              onRetry={handleRetry}
              onDismiss={() => setGeneralError(null)}
            />
          </div>
        )}

        {/* Loading Overlay */}
        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner 
                size="lg" 
                text={loadingState.message} 
                variant={loadingState.type === 'progress' ? 'bars' : 'spinner'}
              />
              {loadingState.progress !== undefined && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${loadingState.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{Math.round(loadingState.progress)}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow">
          {/* Tabs - Mobile Optimized */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-4 sm:px-6">
              {['books', 'library', 'analytics', 'categories', 'authors'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`py-4 px-3 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                    activeSection === section
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section.charAt(0).toUpperCase() + section.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {activeSection === 'books' && (
              <div>
                {/* Actions - Mobile Optimized */}
                <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 mb-6">
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
                    >
                      <i className="ri-add-line mr-2"></i>
                      Add Book
                    </button>
                    {selectedBooks.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                      >
                        <i className="ri-delete-bin-line mr-2"></i>
                        Delete ({selectedBooks.length})
                      </button>
                    )}
                  </div>
                  
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-auto"
                    />
                    <button
                      onClick={loadData}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
                    >
                      <i className="ri-search-line mr-2"></i>
                      Search
                    </button>
                  </div>
                </div>

                {/* Books Table - Mobile Optimized */}
                {skeletonLoading ? (
                  <TableSkeleton rows={5} columns={6} />
                ) : (
                  <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          <tr key={book.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
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
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 flex-shrink-0">
                                  <img
                                    className="h-10 w-10 rounded object-cover"
                                    src={book.cover_image_url || '/placeholder-book.png'}
                                    alt={book.title}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                  <div className="text-sm text-gray-500">{book.format}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.author_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.category_name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${book.price}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                book.status === 'published' ? 'bg-green-100 text-green-800' :
                                book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {book.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    setSelectedBookForAssignment(book);
                                    setShowBulkLibrary(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm"
                                  title="Assign to users"
                                >
                                  <i className="ri-user-add-line sm:hidden"></i>
                                  <span className="hidden sm:inline">Assign</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="text-red-600 hover:text-red-900 text-xs sm:text-sm"
                                  title="Delete book"
                                >
                                  <i className="ri-delete-bin-line sm:hidden"></i>
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={pagination.pages}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                      onPageChange={(page) => {
                        setPagination(prev => ({ ...prev, page }));
                        loadData();
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {activeSection === 'categories' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                {skeletonLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((category) => (
                      <div key={category.id} className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900">{category.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                        <p className="text-xs text-gray-500 mt-2">{category.book_count} books</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === 'library' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Library Management</h3>
                    <p className="text-sm text-gray-600">Assign ebooks to user libraries</p>
                  </div>
                  <button
                    onClick={() => setShowBulkLibrary(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Bulk Assign Books
                  </button>
                </div>
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <i className="ri-book-2-line text-4xl text-gray-400 mb-4"></i>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Assign Books to Users</h4>
                  <p className="text-gray-600 mb-4">Use the "Assign" button next to any book or click "Bulk Assign Books" to assign multiple books to multiple users at once.</p>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div>
                <EnhancedReadingAnalytics />
              </div>
            )}

            {activeSection === 'authors' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Authors</h3>
                {skeletonLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <CardSkeleton key={i} />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {authors.map((author) => (
                      <div key={author.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center">
                          <img
                            src={author.avatar_url || '/placeholder-avatar.png'}
                            alt={author.name}
                            className="h-10 w-10 rounded-full"
                          />
                          <div className="ml-3">
                            <h4 className="font-medium text-gray-900">{author.name}</h4>
                            <p className="text-sm text-gray-600">{author.email}</p>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-gray-600">
                          <p>{author.books_count} books</p>
                          <p>Revenue: ${author.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add Book Modal */}
        <ModernBookUploadModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            loadData();
            toast.success('Book added successfully!');
          }}
          authors={authors}
          categories={categories}
        />

        {/* Bulk Library Management Modal */}
        {showBulkLibrary && (
          <BulkLibraryManagement
            onClose={() => {
              setShowBulkLibrary(false);
              setSelectedBookForAssignment(null);
            }}
            preSelectedBook={selectedBookForAssignment || undefined}
          />
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
    </div>
  );
} 