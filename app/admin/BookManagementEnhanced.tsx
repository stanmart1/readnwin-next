'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { useLoadingState, useSkeletonLoading } from '@/hooks/useLoadingState';

import { LoadingSpinner, CardSkeleton } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import ModernBookUploadModal from '@/components/ModernBookUploadModal';
import BookEditModal from '@/components/admin/BookEditModal';
import LibraryManagement from './LibraryManagement';
import BookAnalytics from './BookAnalytics';
import CategoriesManagement from './CategoriesManagement';
import AuthorsManagement from './AuthorsManagement';
import BulkLibraryManagement from './BulkLibraryManagement';
import BookFilters from '@/components/admin/BookFilters';
import BookTable from '@/components/admin/BookTable';
import { useBookManagement } from '@/hooks/useBookManagement';

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
  
  // Use custom hook for book management
  const {
    books,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPagination,
    updateBook,
    deleteBooks,
    batchUpdateBooks,
    setError
  } = useBookManagement();
  
  // Loading states
  
  const { isLoading: skeletonLoading } = useSkeletonLoading();
  
  // State management
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<number | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBatchUpdateModal, setShowBatchUpdateModal] = useState(false);
  const [selectedBookForAction, setSelectedBookForAction] = useState<Book | null>(null);
  const [showBookAssignModal, setShowBookAssignModal] = useState(false);
  const [batchUpdateData, setBatchUpdateData] = useState({
    status: '',
    category_id: '',
    price_adjustment: { value: '', type: 'percentage' as 'percentage' | 'fixed' }
  });

  // Load authors and categories on mount
  useEffect(() => {
    loadAuthorsAndCategories();
  }, []);

  // Reload data when modal closes
  const handleModalClose = () => {
    setShowAddModal(false);
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

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const result = await response.json();
        setUsers(result.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAssignBook = async () => {
    if (!selectedUser || !selectedBookForAction) return;
    
    setAssignLoading(true);
    try {
      const response = await fetch('/api/admin/user-libraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUser.id,
          book_id: selectedBookForAction.id
        }),
      });

      if (response.ok) {
        const bookType = selectedBookForAction.format === 'physical' ? 'Physical Book' : 'Ebook';
        toast.success(`${bookType} "${selectedBookForAction.title}" assigned to ${selectedUser.name} successfully!`);
        setShowAssignModal(false);
        setSelectedUser(null);
        setUserSearchQuery('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to assign book');
      }
    } catch (error) {
      console.error('Error assigning book:', error);
      toast.error('Failed to assign book');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    setBookToDelete(bookId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete || deleteLoading) return;
    
    setDeleteLoading(true);
    const success = await deleteBooks([bookToDelete]);
    if (success) {
      setShowDeleteConfirm(false);
      setBookToDelete(null);
      // Clear from selected books if it was selected
      setSelectedBooks(prev => prev.filter(id => id !== bookToDelete));
    }
    setDeleteLoading(false);
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedBooks.length} selected books? This action cannot be undone.`)) {
      return;
    }
    
    const success = await deleteBooks(selectedBooks);
    if (success) {
      setSelectedBooks([]);
    }
  };

  const handleBatchUpdate = async () => {
    if (selectedBooks.length === 0) {
      toast.error('Please select books to update');
      return;
    }

    const success = await batchUpdateBooks(selectedBooks, batchUpdateData);
    if (success) {
      setSelectedBooks([]);
      setShowBatchUpdateModal(false);
      setBatchUpdateData({ status: '', category_id: '', price_adjustment: { value: '', type: 'percentage' } });
    }
  };

  const handleBookAction = async (action: string, book: Book) => {
    switch (action) {
      case 'toggleFeature':
        const success1 = await updateBook(book.id, { is_featured: !book.is_featured });
        if (success1) {
          toast.success(book.is_featured ? 'Book removed from featured' : 'Book added to featured');
        }
        break;
      case 'toggleStatus':
        const newStatus = book.status === 'published' ? 'draft' : 'published';
        const success2 = await updateBook(book.id, { status: newStatus });
        if (success2) {
          toast.success(`Book ${newStatus === 'published' ? 'activated' : 'deactivated'} successfully`);
        }
        break;
      case 'edit':
        setSelectedBookForAction(book);
        setShowEditModal(true);
        break;
      case 'view':
        setSelectedBookForAction(book);
        setShowDetailsModal(true);
        break;
      case 'delete':
        handleDeleteBook(book.id);
        break;
      case 'assign':
        setSelectedBookForAction(book);
        setShowBookAssignModal(true);
        break;
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-error-warning-line text-red-600"></i>
              </div>
              <div>
                <h3 className="text-lg font-medium text-red-900">Failed to Load Books</h3>
                <p className="text-sm text-red-700 mt-1">
                  {error instanceof Error ? error.message : 'An unknown error occurred'}
                </p>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Troubleshooting Steps:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                <li>Check if the database is running and accessible</li>
                <li>Verify your environment variables are set correctly</li>
                <li>Ensure you have the required permissions</li>
                <li>Check the browser console for additional error details</li>
              </ol>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => { setError(null); }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => window.open('/api/debug/books', '_blank')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                Debug Info
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
            Book Management
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed break-words">
            Manage your digital library collection
          </p>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 shadow-xl">
              <LoadingSpinner size="lg" text="Loading books..." />
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-thin px-3 sm:px-4 md:px-6">
              {['books', 'library', 'analytics', 'categories', 'authors'].map((section) => (
                <button
                  key={section}
                  onClick={() => setActiveSection(section)}
                  className={`flex-shrink-0 mr-3 sm:mr-4 md:mr-6 lg:mr-8 py-3 sm:py-4 px-2 border-b-2 font-medium text-sm sm:text-base capitalize whitespace-nowrap transition-colors duration-200 ${
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
            <div className="p-3 sm:p-4 md:p-6">
              <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                {/* Search and Filters Row */}
                <div className="w-full">
                  <BookFilters
                    filters={filters}
                    categories={categories}
                    onFiltersChange={setFilters}
                  />
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col gap-3">
                  {selectedBooks.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setShowBatchUpdateModal(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-edit-2-line"></i>
                        <span className="truncate">Update ({selectedBooks.length})</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-delete-bin-line"></i>
                        <span className="truncate">Delete ({selectedBooks.length})</span>
                      </button>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="w-full sm:w-auto btn-primary text-sm font-medium flex items-center justify-center gap-2 px-4 py-2.5"
                    >
                      <i className="ri-add-line"></i>
                      <span>Add Book</span>
                    </button>
                  </div>
                </div>
              </div>

              {skeletonLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <CardSkeleton key={i} />
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-8 sm:py-12 px-4">
                  <i className="ri-book-line text-4xl sm:text-5xl text-gray-400 mb-4 block"></i>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">No books found</h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed break-words max-w-sm mx-auto">
                    Get started by uploading your first book to build your digital library.
                  </p>
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
                  <BookTable
                    books={books}
                    selectedBooks={selectedBooks}
                    onSelectionChange={setSelectedBooks}
                    onBookAction={handleBookAction}
                  />

                  {pagination.pages > 1 && (
                    <div className="mt-6 md:mt-8">
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
          className="max-w-sm xs:max-w-md w-full mx-2 xs:mx-3 sm:mx-4"
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-red-100 rounded-full flex items-center justify-center">
                <i className="ri-alert-line text-red-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Confirm Delete</h3>
            </div>
            <p className="text-xs xs:text-sm sm:text-base text-gray-600 mb-4 xs:mb-5 sm:mb-6 leading-relaxed break-words">
              Are you sure you want to delete this book? This action cannot be undone and will permanently remove the book from your library.
            </p>
            <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteBook}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs xs:text-sm font-medium flex items-center justify-center gap-1 xs:gap-2"
              >
                <i className="ri-delete-bin-line text-sm xs:text-base"></i>
                Delete Book
              </button>
            </div>
          </div>
        </Modal>

        {/* Assign to User Modal */}
        <Modal 
          isOpen={showAssignModal} 
          onClose={() => {
            setShowAssignModal(false);
            setSelectedUser(null);
            setUserSearchQuery('');
          }}
          className="max-w-sm xs:max-w-md sm:max-w-lg w-full mx-2 xs:mx-3 sm:mx-4"
          showCloseIcon={true}
          closeOnOutsideClick={true}
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-3 xs:mb-4">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-user-add-line text-blue-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Assign Book to User Library</h3>
            </div>
            {selectedBookForAction && (
              <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-gray-50 rounded-lg">
                <p className="text-xs xs:text-sm font-medium text-gray-900 leading-tight break-words">{selectedBookForAction.title}</p>
                <p className="text-xs text-gray-600 break-words">by {selectedBookForAction.author_name}</p>
              </div>
            )}
            <div className="mb-3 xs:mb-4">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Search and Select User</label>
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {userSearchQuery && (
                <div className="mt-1 xs:mt-2 max-h-32 xs:max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {users
                    .filter(user => 
                      user.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                      user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setUserSearchQuery(`${user.name} (${user.email})`);
                        }}
                        className="w-full text-left px-2 xs:px-3 py-1.5 xs:py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                      >
                        <p className="text-xs xs:text-sm font-medium text-gray-900 truncate">{user.name}</p>
                        <p className="text-xs text-gray-600 truncate">{user.email}</p>
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
            <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedUser(null);
                  setUserSearchQuery('');
                }}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBook}
                disabled={!selectedUser || assignLoading}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs xs:text-sm font-medium flex items-center justify-center gap-1 xs:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {assignLoading ? (
                  <i className="ri-loader-4-line animate-spin text-sm xs:text-base"></i>
                ) : (
                  <i className="ri-user-add-line text-sm xs:text-base"></i>
                )}
                <span className="truncate">{assignLoading ? 'Assigning...' : 'Assign Book'}</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* Reading Analytics Modal */}
        <Modal 
          isOpen={showAnalyticsModal} 
          onClose={() => setShowAnalyticsModal(false)}
          className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl w-full mx-2 xs:mx-3 sm:mx-4"
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-bar-chart-line text-purple-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Reading Analytics</h3>
            </div>
            {selectedBookForAction && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedBookForAction.cover_image_url || '/placeholder-book.jpg'}
                    alt={selectedBookForAction.title}
                    className="w-12 xs:w-14 sm:w-16 h-15 xs:h-17 sm:h-20 object-cover rounded mx-auto xs:mx-0"
                  />
                  <div className="text-center xs:text-left w-full">
                    <h4 className="text-xs xs:text-sm sm:text-base font-medium text-gray-900 leading-tight break-words">{selectedBookForAction.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">by {selectedBookForAction.author_name}</p>
                    <p className="text-xs text-gray-500 break-words">{selectedBookForAction.category_name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 xs:gap-3 sm:gap-4 mt-3 xs:mt-4 sm:mt-6">
                  <div className="bg-white p-2 xs:p-3 sm:p-4 rounded-lg border">
                    <div className="flex items-center gap-1 xs:gap-2 mb-1 xs:mb-2">
                      <i className="ri-eye-line text-blue-600 text-sm xs:text-base"></i>
                      <span className="text-xs xs:text-sm font-medium text-gray-700">Total Views</span>
                    </div>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">1,234</p>
                  </div>
                  <div className="bg-white p-2 xs:p-3 sm:p-4 rounded-lg border">
                    <div className="flex items-center gap-1 xs:gap-2 mb-1 xs:mb-2">
                      <i className="ri-time-line text-green-600 text-sm xs:text-base"></i>
                      <span className="text-xs xs:text-sm font-medium text-gray-700">Reading Time</span>
                    </div>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">45h 30m</p>
                  </div>
                  <div className="bg-white p-2 xs:p-3 sm:p-4 rounded-lg border xs:col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-1 xs:gap-2 mb-1 xs:mb-2">
                      <i className="ri-user-line text-purple-600 text-sm xs:text-base"></i>
                      <span className="text-xs xs:text-sm font-medium text-gray-700">Active Readers</span>
                    </div>
                    <p className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-900">89</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAnalyticsModal(false)}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs xs:text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Book Modal */}
        <BookEditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          book={selectedBookForAction}
          categories={categories}
          authors={authors}
          onSuccess={() => {
            // Refresh the books list
            window.location.reload();
          }}
        />

        {/* Book Details Modal */}
        <Modal 
          isOpen={showDetailsModal} 
          onClose={() => setShowDetailsModal(false)}
          className="max-w-sm xs:max-w-md sm:max-w-2xl md:max-w-3xl w-full mx-2 xs:mx-3 sm:mx-4"
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <i className="ri-book-line text-gray-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Book Details</h3>
            </div>
            {selectedBookForAction && (
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 xs:gap-4 sm:gap-6">
                  <div className="flex-shrink-0 mx-auto sm:mx-0">
                    <img
                      src={selectedBookForAction.cover_image_url || '/placeholder-book.jpg'}
                      alt={selectedBookForAction.title}
                      className="w-24 xs:w-28 sm:w-32 h-30 xs:h-35 sm:h-40 object-cover rounded-lg shadow-md"
                    />
                  </div>
                  <div className="flex-1 space-y-3 xs:space-y-4">
                    <div className="text-center sm:text-left">
                      <h4 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 leading-tight break-words">{selectedBookForAction.title}</h4>
                      <p className="text-sm xs:text-base sm:text-lg text-gray-600 break-words">by {selectedBookForAction.author_name}</p>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 xs:gap-3 sm:gap-4">
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Category</span>
                        <p className="text-xs xs:text-sm text-gray-900 break-words">{selectedBookForAction.category_name}</p>
                      </div>
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Format</span>
                        <p className="text-xs xs:text-sm text-gray-900 capitalize">{selectedBookForAction.format}</p>
                      </div>
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Price</span>
                        <p className="text-xs xs:text-sm font-semibold text-green-600">₦{selectedBookForAction.price.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Stock</span>
                        <p className="text-xs xs:text-sm text-gray-900">{selectedBookForAction.stock_quantity}</p>
                      </div>
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Status</span>
                        <span className={`inline-flex px-1.5 xs:px-2 py-0.5 xs:py-1 text-xs font-medium rounded-full ${
                          selectedBookForAction.status === 'published' ? 'bg-green-100 text-green-800' :
                          selectedBookForAction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedBookForAction.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs xs:text-sm font-medium text-gray-500">Featured</span>
                        <p className="text-xs xs:text-sm text-gray-900">{selectedBookForAction.is_featured ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs xs:text-sm font-medium text-gray-500">Created</span>
                      <p className="text-xs xs:text-sm text-gray-900">{new Date(selectedBookForAction.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end mt-4 xs:mt-5 sm:mt-6">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs xs:text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Book Assignment Modal */}
        <Modal
          isOpen={showBookAssignModal && selectedBookForAction !== null}
          onClose={() => {
            setShowBookAssignModal(false);
            setSelectedBookForAction(null);
          }}
          className="max-w-4xl w-full mx-4"
          showCloseIcon={true}
          closeOnOutsideClick={true}
        >
          {selectedBookForAction && (
            <BulkLibraryManagement
              preSelectedBook={selectedBookForAction}
              onClose={() => {
                setShowBookAssignModal(false);
                setSelectedBookForAction(null);
              }}
            />
          )}
        </Modal>

        {/* Batch Update Modal */}
        <Modal 
          isOpen={showBatchUpdateModal} 
          onClose={() => setShowBatchUpdateModal(false)}
          className="max-w-sm xs:max-w-md sm:max-w-lg w-full mx-2 xs:mx-3 sm:mx-4"
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-edit-2-line text-blue-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Batch Update Books</h3>
            </div>
            <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-gray-50 rounded-lg">
              <p className="text-xs xs:text-sm text-gray-600">Updating {selectedBooks.length} selected books</p>
            </div>
            <div className="space-y-3 xs:space-y-4">
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Status (optional)</label>
                <select
                  value={batchUpdateData.status}
                  onChange={(e) => setBatchUpdateData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current status</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Category (optional)</label>
                <select
                  value={batchUpdateData.category_id}
                  onChange={(e) => setBatchUpdateData(prev => ({ ...prev, category_id: e.target.value }))}
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Price Adjustment (optional)</label>
                <div className="flex gap-1 xs:gap-2">
                  <select
                    value={batchUpdateData.price_adjustment.type}
                    onChange={(e) => setBatchUpdateData(prev => ({ ...prev, price_adjustment: { ...prev.price_adjustment, type: e.target.value as 'percentage' | 'fixed' } }))}
                    className="w-16 xs:w-20 px-1 xs:px-2 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₦</option>
                  </select>
                  <input
                    type="number"
                    placeholder={batchUpdateData.price_adjustment.type === 'percentage' ? '10' : '1000'}
                    value={batchUpdateData.price_adjustment.value}
                    onChange={(e) => setBatchUpdateData(prev => ({ ...prev, price_adjustment: { ...prev.price_adjustment, value: e.target.value } }))}
                    className="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                  {batchUpdateData.price_adjustment.type === 'percentage' ? 'Increase/decrease by percentage (use negative for decrease)' : 'Add/subtract fixed amount (use negative to subtract)'}
                </p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-4 xs:mt-5 sm:mt-6">
              <button
                onClick={() => setShowBatchUpdateModal(false)}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleBatchUpdate}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs xs:text-sm font-medium flex items-center justify-center gap-1 xs:gap-2"
              >
                <i className="ri-save-line text-sm xs:text-base"></i>
                Update Books
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}