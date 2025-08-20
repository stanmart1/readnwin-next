'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useLoadingState, useSkeletonLoading } from '@/hooks/useLoadingState';
import { EnhancedErrorDisplay } from '@/components/ui/EnhancedErrorDisplay';
import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import ModernBookUploadModal from '@/components/ModernBookUploadModal';
import LibraryManagement from './LibraryManagement';
import BookAnalytics from './BookAnalytics';
import CategoriesManagement from './CategoriesManagement';
import AuthorsManagement from './AuthorsManagement';

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
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBatchUpdateModal, setShowBatchUpdateModal] = useState(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<Book | null>(null);
  const [batchUpdateData, setBatchUpdateData] = useState({
    status: '',
    category_id: '',
    price_adjustment: '',
    adjustment_type: 'percentage' // 'percentage' or 'fixed'
  });

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
      
      const response = await fetch(`/api/admin/books?${params}`);
      if (!response.ok) throw new Error('Failed to load books');
      const result = await response.json();
      
      setBooks(result.books || []);
      if (result.pagination) {
        setPagination({
          page: result.pagination.page || 1,
          limit: result.pagination.limit || 20,
          total: result.pagination.total || 0,
          pages: result.pagination.pages || 0
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
      const response = await fetch(`/api/admin/books?${params}`, { method: 'DELETE' });
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
      const response = await fetch(`/api/admin/books?${params}`, { method: 'DELETE' });
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

  const handleBatchUpdate = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to update');
      return;
    }

    try {
      const updatePayload: any = {
        book_ids: selectedBooks
      };

      if (batchUpdateData.status) {
        updatePayload.status = batchUpdateData.status;
      }

      if (batchUpdateData.category_id) {
        updatePayload.category_id = parseInt(batchUpdateData.category_id);
      }

      if (batchUpdateData.price_adjustment) {
        updatePayload.price_adjustment = {
          value: parseFloat(batchUpdateData.price_adjustment),
          type: batchUpdateData.adjustment_type
        };
      }

      const response = await fetch('/api/admin/books/batch-update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update books');
      }

      const result = await response.json();
      setSelectedBooks([]);
      setShowBatchUpdateModal(false);
      setBatchUpdateData({ status: '', category_id: '', price_adjustment: '', adjustment_type: 'percentage' });
      loadData();
      toast.success(`Successfully updated ${result.updated_count || selectedBooks.length} books`);
    } catch (error) {
      console.error('Batch update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update books');
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
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
                  <div className="flex flex-col sm:flex-row gap-3">
                    {selectedBooks.length > 0 && (
                      <>
                        <button
                          onClick={() => setShowBatchUpdateModal(true)}
                          className="px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="ri-edit-2-line"></i>
                          <span className="truncate">Batch Update ({selectedBooks.length})</span>
                        </button>
                        <button
                          onClick={handleBulkDelete}
                          className="px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <i className="ri-delete-bin-line"></i>
                          <span className="truncate">Delete Selected ({selectedBooks.length})</span>
                        </button>
                      </>
                    )}
                  </div>
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
                  {/* List View */}
                  <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                      <div className="grid grid-cols-12 gap-4 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={selectedBooks.length === books.length && books.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBooks(books.map(book => book.id));
                              } else {
                                setSelectedBooks([]);
                              }
                            }}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                        </div>
                        <div className="col-span-1">Cover</div>
                        <div className="col-span-2">Title</div>
                        <div className="col-span-2">Author</div>
                        <div className="col-span-1">Category</div>
                        <div className="col-span-1">Price</div>
                        <div className="col-span-1">Status</div>
                        <div className="col-span-1">Stock</div>
                        <div className="col-span-2">Actions</div>
                      </div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {books.map((book) => (
                        <div key={book.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="grid grid-cols-12 gap-4 items-center">
                            {/* Checkbox */}
                            <div className="col-span-1">
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
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                            </div>

                            {/* Cover Image */}
                            <div className="col-span-1">
                              <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden relative">
                                <img
                                  src={book.cover_image_url || '/placeholder-book.jpg'}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder-book.jpg';
                                  }}
                                />
                                {book.is_featured && (
                                  <div className="absolute -top-1 -right-1">
                                    <i className="ri-star-fill text-yellow-400 text-xs"></i>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <div className="col-span-2">
                              <h3 className="text-sm font-medium text-gray-900 truncate" title={book.title}>
                                {book.title}
                              </h3>
                              <p className="text-xs text-gray-500 capitalize">{book.format}</p>
                            </div>

                            {/* Author */}
                            <div className="col-span-2">
                              <p className="text-sm text-gray-900 truncate" title={book.author_name}>
                                {book.author_name}
                              </p>
                            </div>

                            {/* Category */}
                            <div className="col-span-1">
                              <p className="text-sm text-gray-900 truncate" title={book.category_name}>
                                {book.category_name}
                              </p>
                            </div>

                            {/* Price */}
                            <div className="col-span-1">
                              <span className="text-sm font-medium text-green-600">
                                ₦{book.price.toLocaleString()}
                              </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                book.status === 'published' ? 'bg-green-100 text-green-800' :
                                book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {book.status}
                              </span>
                            </div>

                            {/* Stock */}
                            <div className="col-span-1">
                              <span className="text-sm text-gray-900">{book.stock_quantity}</span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-2">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setSelectedBookForAction(book);
                                    setShowAssignModal(true);
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Assign to User"
                                >
                                  <i className="ri-user-add-line text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBookForAction(book);
                                    setShowAnalyticsModal(true);
                                  }}
                                  className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="View Reading Analytics"
                                >
                                  <i className="ri-bar-chart-line text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBookForAction(book);
                                    setShowEditModal(true);
                                  }}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Edit Book"
                                >
                                  <i className="ri-edit-line text-sm"></i>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedBookForAction(book);
                                    setShowDetailsModal(true);
                                  }}
                                  className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                  title="View Book Details"
                                >
                                  <i className="ri-eye-line text-sm"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteBook(book.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Book"
                                >
                                  <i className="ri-delete-bin-line text-sm"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {pagination.pages > 1 && (
                    <div className="mt-6 sm:mt-8">
                      <Pagination
                        currentPage={pagination.page}
                        totalPages={pagination.pages}
                        totalItems={pagination.total}
                        itemsPerPage={pagination.limit}
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

          {activeSection === 'library' && <LibraryManagement />}
          {activeSection === 'analytics' && <BookAnalytics />}
          {activeSection === 'categories' && <CategoriesManagement />}
          {activeSection === 'authors' && <AuthorsManagement />}
        </div>

        {showAddModal && (
          <ModernBookUploadModal
            isOpen={showAddModal}
            onClose={handleModalClose}
            onSuccess={handleModalClose}
            categories={categories}
            authors={authors}
          />
        )}

        {/* Delete Confirmation Modal */}
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

        {/* Assign to User Modal */}
        <Modal 
          isOpen={showAssignModal} 
          onClose={() => setShowAssignModal(false)}
          className="max-w-lg w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-add-line text-blue-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Assign Book to User</h3>
            </div>
            {selectedBookForAction && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{selectedBookForAction.title}</p>
                <p className="text-xs text-gray-600">by {selectedBookForAction.author_name}</p>
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <input
                type="text"
                placeholder="Search users by name or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Book assigned successfully!');
                  setShowAssignModal(false);
                }}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <i className="ri-user-add-line"></i>
                Assign Book
              </button>
            </div>
          </div>
        </Modal>

        {/* Reading Analytics Modal */}
        <Modal 
          isOpen={showAnalyticsModal} 
          onClose={() => setShowAnalyticsModal(false)}
          className="max-w-4xl w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-bar-chart-line text-purple-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Reading Analytics</h3>
            </div>
            {selectedBookForAction && (
              <div className="mb-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedBookForAction.cover_image_url || '/placeholder-book.jpg'}
                    alt={selectedBookForAction.title}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedBookForAction.title}</h4>
                    <p className="text-sm text-gray-600">by {selectedBookForAction.author_name}</p>
                    <p className="text-xs text-gray-500">{selectedBookForAction.category_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-eye-line text-blue-600"></i>
                      <span className="text-sm font-medium text-gray-700">Total Views</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-time-line text-green-600"></i>
                      <span className="text-sm font-medium text-gray-700">Reading Time</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">45h 30m</p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ri-user-line text-purple-600"></i>
                      <span className="text-sm font-medium text-gray-700">Active Readers</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Book Modal */}
        <Modal 
          isOpen={showEditModal} 
          onClose={() => setShowEditModal(false)}
          className="max-w-2xl w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <i className="ri-edit-line text-green-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Edit Book</h3>
            </div>
            {selectedBookForAction && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <input
                      type="text"
                      defaultValue={selectedBookForAction.title}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                    <input
                      type="text"
                      defaultValue={selectedBookForAction.author_name}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      defaultValue={selectedBookForAction.price}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                    <input
                      type="number"
                      defaultValue={selectedBookForAction.stock_quantity}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={selectedBookForAction.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  toast.success('Book updated successfully!');
                  setShowEditModal(false);
                  loadData();
                }}
                className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <i className="ri-save-line"></i>
                Save Changes
              </button>
            </div>
          </div>
        </Modal>

        {/* Book Details Modal */}
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)}
          className="max-w-3xl w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-book-line text-gray-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Book Details</h3>
            </div>
            {selectedBookForAction && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src={selectedBookForAction.cover_image_url || '/placeholder-book.jpg'}
                      alt={selectedBookForAction.title}
                      className="w-32 h-40 object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{selectedBookForAction.title}</h4>
                      <p className="text-lg text-gray-600">by {selectedBookForAction.author_name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Category</span>
                        <p className="text-sm text-gray-900">{selectedBookForAction.category_name}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Format</span>
                        <p className="text-sm text-gray-900 capitalize">{selectedBookForAction.format}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Price</span>
                        <p className="text-sm font-semibold text-green-600">₦{selectedBookForAction.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Stock</span>
                        <p className="text-sm text-gray-900">{selectedBookForAction.stock_quantity}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Status</span>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          selectedBookForAction.status === 'published' ? 'bg-green-100 text-green-800' :
                          selectedBookForAction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBookForAction.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Featured</span>
                        <p className="text-sm text-gray-900">{selectedBookForAction.is_featured ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500">Created</span>
                      <p className="text-sm text-gray-900">{new Date(selectedBookForAction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Batch Update Modal */}
        <Modal 
          isOpen={showBatchUpdateModal} 
          onClose={() => setShowBatchUpdateModal(false)}
          className="max-w-lg w-full mx-4"
        >
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-edit-2-line text-blue-600"></i>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Batch Update Books</h3>
            </div>
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Updating {selectedBooks.length} selected books</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status (optional)</label>
                <select
                  value={batchUpdateData.status}
                  onChange={(e) => setBatchUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category (optional)</label>
                <select
                  value={batchUpdateData.category_id}
                  onChange={(e) => setBatchUpdateData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Adjustment (optional)</label>
                <div className="flex gap-2">
                  <select
                    value={batchUpdateData.adjustment_type}
                    onChange={(e) => setBatchUpdateData(prev => ({ ...prev, adjustment_type: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₦</option>
                  </select>
                  <input
                    type="number"
                    placeholder={batchUpdateData.adjustment_type === 'percentage' ? '10' : '1000'}
                    value={batchUpdateData.price_adjustment}
                    onChange={(e) => setBatchUpdateData(prev => ({ ...prev, price_adjustment: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {batchUpdateData.adjustment_type === 'percentage' ? 'Increase/decrease by percentage (use negative for decrease)' : 'Add/subtract fixed amount (use negative to subtract)'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBatchUpdateModal(false)}
                className="px-4 py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchUpdate}
                className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <i className="ri-save-line"></i>
                Update Books
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}