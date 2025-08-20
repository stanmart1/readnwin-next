'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useLoadingState, useSkeletonLoading } from '@/hooks/useLoadingState';
import { EnhancedErrorDisplay } from '@/components/ui/EnhancedErrorDisplay';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
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
  
  // Loading states
  const { loadingState, startLoading, stopLoading, updateProgress } = useLoadingState();
  const { isLoading: skeletonLoading } = useSkeletonLoading();
  
  // Error handling
  const [error, setError] = useState<any>(null);
  
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
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    loadData();
  }, [pagination.page, filters.search, filters.status, filters.category_id]);

  useEffect(() => {
    loadAuthorsAndCategories();
  }, []);

  // Reload data when modal closes
  const handleModalClose = () => {
    setShowAddModal(false);
    loadData();
  };

  const loadData = async () => {
    try {
      startLoading('Loading books...', 'spinner');
      
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
      
      setBooks(result.books || []);
      if (result.pagination) {
        setPagination({
          page: result.pagination.currentPage || 1,
          limit: result.pagination.itemsPerPage || 20,
          total: result.pagination.totalItems || 0,
          pages: result.pagination.totalPages || 0
        });
      }
      
      stopLoading();
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
    if (!bookToDelete || deleteLoading) return;
    
    try {
      setDeleteLoading(true);
      const params = new URLSearchParams({ ids: bookToDelete.toString() });
      const response = await fetch(`/api/books?${params}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete book');
      }
      
      setShowDeleteConfirm(false);
      setBookToDelete(null);
      loadData();
      toast.success('Book deleted successfully!');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete book');
      setShowDeleteConfirm(false);
      setBookToDelete(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedBooks.length} selected books? This action cannot be undone.`)) {
      return;
    }
    
    try {
      const params = new URLSearchParams({ ids: selectedBooks.join(',') });
      const response = await fetch(`/api/books?${params}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete books');
      }
      const result = await response.json();
      
      setSelectedBooks([]);
      loadData();
      toast.success(`Successfully deleted ${result.deleted_count || selectedBooks.length} books`);
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete books');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <EnhancedErrorDisplay
            error={error}
            onRetry={() => { setError(null); loadData(); }}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-balance">Book Management</h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 text-balance">Manage your digital library collection</p>
        </div>

        {loadingState.isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner size="lg" text={loadingState.message} />
            </div>
          </div>
        )}

        <div className="card">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex flex-wrap px-4 sm:px-6 overflow-x-auto scrollbar-thin">
              {['books', 'library', 'analytics', 'categories', 'authors'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`mr-4 sm:mr-8 py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm capitalize whitespace-nowrap transition-colors duration-200 ${
                    activeSection === section
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {section}
                </button>
              ))}
            </nav>
          </div>

          {activeSection === 'books' && (
            <div className="p-4 sm:p-6">
              <div className="flex flex-col gap-4 mb-6">
                {/* Search and Filters Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <div className="relative flex-1 min-w-0">
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <i className="ri-search-line text-gray-400"></i>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-w-0 sm:min-w-[120px]"
                    >
                      <option value="">All Status</option>
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>

                    <select
                      value={filters.category_id || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                      className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors min-w-0 sm:min-w-[140px]"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  {selectedBooks.length > 0 && (
                    <button
                      onClick={handleBulkDelete}
                      className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="ri-delete-bin-line"></i>
                      <span className="truncate">Delete Selected ({selectedBooks.length})</span>
                    </button>
                  )}
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-primary text-sm font-medium flex items-center justify-center gap-2 px-4 py-2.5"
                  >
                    <i className="ri-add-line"></i>
                    <span>Add Book</span>
                  </button>
                </div>
              </div>

              {skeletonLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <i className="ri-book-line text-4xl sm:text-5xl text-gray-400 mb-4 block"></i>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 text-balance">No books found</h3>
                  <p className="mt-2 text-sm text-gray-500 text-balance max-w-sm mx-auto">Get started by uploading your first book to build your digital library.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="btn-primary text-sm font-medium inline-flex items-center gap-2 px-4 py-2.5"
                    >
                      <i className="ri-add-line"></i>
                      Add Book
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
                    {books.map((book) => (
                      <div key={book.id} className="card group">
                        <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden relative">
                          <img
                            src={book.cover_image_url || '/placeholder-book.jpg'}
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-book.jpg';
                            }}
                          />
                          {book.is_featured && (
                            <div className="absolute top-2 left-2">
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-primary-100 text-primary-800 rounded-full">
                                <i className="ri-star-fill text-xs mr-1"></i>
                                Featured
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="p-3 sm:p-4">
                          <div className="flex items-start justify-between mb-3">
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
                              className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
                            />
                            <button
                              onClick={() => handleDeleteBook(book.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete book"
                            >
                              <i className="ri-delete-bin-line text-sm"></i>
                            </button>
                          </div>

                          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 text-balance leading-tight">{book.title}</h3>
                          <p className="text-xs text-gray-600 mb-1 truncate">{book.author_name}</p>
                          <p className="text-xs text-gray-500 mb-3 truncate">{book.category_name}</p>
                          
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-green-600 text-sm">₦{book.price.toLocaleString()}</span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              book.status === 'published' ? 'bg-green-100 text-green-800' :
                              book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {book.status}
                            </span>
                          </div>

                          <div className="text-xs text-gray-500">
                            <span>Stock: {book.stock_quantity}</span>
                            <span className="mx-2">•</span>
                            <span className="capitalize">{book.format}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {pagination.pages > 1 && (
                    <div className="mt-6 sm:mt-8">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        onPageChange={(page) => {
                          setPagination(prev => ({ ...prev, page }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection !== 'books' && (
            <div className="p-4 sm:p-6">
              <div className="text-center py-12 px-4">
                <i className="ri-tools-line text-4xl text-gray-400 mb-4 block"></i>
                <h3 className="text-base sm:text-lg font-medium text-gray-900 capitalize text-balance">{activeSection} Management</h3>
                <p className="text-sm text-gray-500 text-balance mt-2">This section is under development and will be available soon.</p>
              </div>
            </div>
          )}
        </div>

        {showAddModal && (
          <ModernBookUploadModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={handleModalClose}
            categories={categories}
            authors={authors}
          />
        )}

        <Modal 
          isOpen={showDeleteConfirm} 
          onClose={() => setShowDeleteConfirm(false)}
          className="max-w-md w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-red-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 text-balance">Confirm Delete</h3>
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-6 text-balance">Are you sure you want to delete this book? This action cannot be undone and will permanently remove the book from your library.</p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBook}
                className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <i className="ri-delete-bin-line"></i>
                Delete Book
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}