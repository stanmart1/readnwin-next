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
  description?: string;
  isbn?: string;
  pages?: number;
  language?: string;
  publisher?: string;
  publication_date?: string;
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
  const bookManagement = useBookManagement();
  const {
    books,
    loading,
    error,
    filters,
    pagination,
    setFilters,
    setPagination,
    loadBooks,
    updateBook,
    deleteBooks,
    batchUpdateBooks,
    setError
  } = bookManagement;
  
  const { isLoading: skeletonLoading } = useSkeletonLoading();
  
  // Consolidated state management
  const [data, setData] = useState({ categories: [] as Category[], authors: [] as Author[], users: [] as any[] });
  const [selection, setSelection] = useState({ books: [] as number[], user: null as any, bookForAction: null as Book | null });
  const [modals, setModals] = useState({ deleteConfirm: false, assign: false, analytics: false, edit: false, details: false, batchUpdate: false, bookAssign: false });
  const [loadingStates, setLoadingStates] = useState({ delete: false, assign: false });
  const [forms, setForms] = useState({ 
    userSearch: '', 
    selectedFormat: 'both' as 'both' | 'ebook' | 'physical',
    bookToDelete: null as number | null,
    batchUpdate: { status: '', category_id: '', price_adjustment: { value: '', type: 'percentage' as 'percentage' | 'fixed' } }
  });

  // Load authors and categories on mount
  useEffect(() => {
    loadAuthorsAndCategories();
  }, []);
  
  // Load users when assign modal opens
  useEffect(() => {
    if (modals.assign) {
      loadUsers();
    }
  }, [modals.assign]);

  // Handle modal close without refresh
  const handleModalClose = () => {
    setShowAddModal(false);
  };

  // Handle successful book upload
  const handleBookUploadSuccess = () => {
    // Refresh the books list after successful upload
    bookManagement.loadBooks();
    // Close the modal
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
        setData(prev => ({ ...prev, authors: authorsResult.authors || [] }));
      }
      
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json();
        setData(prev => ({ ...prev, categories: categoriesResult.categories || [] }));
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
        setData(prev => ({ ...prev, users: result.users || [] }));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleAssignBook = async () => {
    if (!selection.user || !selection.bookForAction) return;
    
    setLoadingStates(prev => ({ ...prev, assign: true }));
    try {
      const assignments = [];
      
      // Determine which formats to assign based on selection and book availability
      const bookFormat = selection.bookForAction.format;
      
      if (forms.selectedFormat === 'both') {
        // Assign both formats if book supports both, otherwise assign the book's format
        if (bookFormat === 'both') {
          assignments.push({ format: 'ebook', book_id: selection.bookForAction.id });
          assignments.push({ format: 'physical', book_id: selection.bookForAction.id });
        } else {
          assignments.push({ format: bookFormat, book_id: selection.bookForAction.id });
        }
      } else if (forms.selectedFormat === 'ebook') {
        if (bookFormat === 'ebook' || bookFormat === 'both') {
          assignments.push({ format: 'ebook', book_id: selection.bookForAction.id });
        } else {
          toast.error('This book is not available as an ebook');
          setLoadingStates(prev => ({ ...prev, assign: false }));
          return;
        }
      } else if (forms.selectedFormat === 'physical') {
        if (bookFormat === 'physical' || bookFormat === 'both') {
          assignments.push({ format: 'physical', book_id: selection.bookForAction.id });
        } else {
          toast.error('This book is not available as a physical book');
          setLoadingStates(prev => ({ ...prev, assign: false }));
          return;
        }
      }
      
      const results = [];
      for (const assignment of assignments) {
        const response = await fetch('/api/admin/user-libraries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: selection.user.id,
            book_id: assignment.book_id,
            format: assignment.format
          }),
        });
        
        if (response.ok) {
          const result = await response.json();
          results.push({ success: true, format: assignment.format, message: result.message });
        } else {
          const error = await response.json();
          results.push({ success: false, format: assignment.format, error: error.error });
        }
      }
      
      // Show results
      const successful = results.filter(r => r.success);
      const failed = results.filter(r => !r.success);
      
      if (successful.length > 0) {
        const formats = successful.map(r => r.format === 'physical' ? 'Physical book' : 'Ebook').join(' and ');
        toast.success(`${formats} "${selection.bookForAction.title}" assigned to ${selection.user.name} successfully!`);
      }
      
      if (failed.length > 0) {
        failed.forEach(f => {
          const formatName = f.format === 'physical' ? 'Physical book' : 'Ebook';
          toast.error(`Failed to assign ${formatName}: ${f.error}`);
        });
      }
      
      if (successful.length > 0) {
        setModals(prev => ({ ...prev, assign: false }));
        setSelection(prev => ({ ...prev, user: null }));
        setForms(prev => ({ ...prev, userSearch: '', selectedFormat: 'both' }));
      }
    } catch (error) {
      console.error('Error assigning book:', error);
      toast.error('Failed to assign book');
    } finally {
      setLoadingStates(prev => ({ ...prev, assign: false }));
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    setForms(prev => ({ ...prev, bookToDelete: bookId }));
    setModals(prev => ({ ...prev, deleteConfirm: true }));
  };

  const confirmDeleteBook = async () => {
    if (!forms.bookToDelete || loadingStates.delete) return;
    
    setLoadingStates(prev => ({ ...prev, delete: true }));
    const success = await deleteBooks([forms.bookToDelete]);
    if (success) {
      setModals(prev => ({ ...prev, deleteConfirm: false }));
      setForms(prev => ({ ...prev, bookToDelete: null }));
      setSelection(prev => ({ ...prev, books: prev.books.filter(id => id !== forms.bookToDelete) }));
    }
    setLoadingStates(prev => ({ ...prev, delete: false }));
  };

  const handleBulkDelete = async () => {
    if (selection.books.length === 0) {
      toast.error('Please select books to delete');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selection.books.length} selected books? This action cannot be undone.`)) {
      return;
    }
    
    const success = await deleteBooks(selection.books);
    if (success) {
      setSelection(prev => ({ ...prev, books: [] }));
    }
  };

  const handleBatchUpdate = async () => {
    if (selection.books.length === 0) {
      toast.error('Please select books to update');
      return;
    }

    const success = await batchUpdateBooks(selection.books, forms.batchUpdate);
    if (success) {
      setSelection(prev => ({ ...prev, books: [] }));
      setModals(prev => ({ ...prev, batchUpdate: false }));
      setForms(prev => ({ ...prev, batchUpdate: { status: '', category_id: '', price_adjustment: { value: '', type: 'percentage' } } }));
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
        setSelection(prev => ({ ...prev, bookForAction: book }));
        setModals(prev => ({ ...prev, edit: true }));
        break;
      case 'view':
        setSelection(prev => ({ ...prev, bookForAction: book }));
        setModals(prev => ({ ...prev, details: true }));
        break;
      case 'delete':
        handleDeleteBook(book.id);
        break;
      case 'assign':
        setSelection(prev => ({ ...prev, bookForAction: book }));
        setModals(prev => ({ ...prev, bookAssign: true }));
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
              {['books', 'library', 'categories', 'authors'].map((section) => (
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
                    categories={data.categories}
                    onFiltersChange={setFilters}
                  />
                </div>

                {/* Action Buttons Row */}
                <div className="flex flex-col gap-3">
                  {selection.books.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => setModals(prev => ({ ...prev, batchUpdate: true }))}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-edit-2-line"></i>
                        <span className="truncate">Update ({selection.books.length})</span>
                      </button>
                      <button
                        onClick={handleBulkDelete}
                        className="w-full sm:w-auto px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <i className="ri-delete-bin-line"></i>
                        <span className="truncate">Delete ({selection.books.length})</span>
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
                <div className="space-y-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="w-12 h-16 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <i className="ri-book-line text-5xl text-gray-400 mb-4 block"></i>
                  <h3 className="text-lg font-medium text-gray-900">No books found</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Get started by uploading your first book to build your digital library.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium inline-flex items-center gap-2"
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
                    selectedBooks={selection.books}
                    onSelectionChange={(books) => setSelection(prev => ({ ...prev, books }))}
                    onBookAction={handleBookAction}
                  />

                  {pagination.pages > 1 && (
                    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Showing {books.length} of {pagination.total} books
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => {
                              setPagination(prev => ({ ...prev, page: pagination.page - 1 }));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={pagination.page === 1}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Previous
                          </button>
                          <span className="px-4 py-2 bg-blue-600 text-white rounded-md">
                            {pagination.page}
                          </span>
                          <button 
                            onClick={() => {
                              setPagination(prev => ({ ...prev, page: pagination.page + 1 }));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={pagination.page === pagination.pages}
                            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeSection === 'library' && <LibraryManagement />}
          {activeSection === 'categories' && <CategoriesManagement />}
          {activeSection === 'authors' && <AuthorsManagement />}
        </div>

        {showAddModal && (
          <ModernBookUploadModal
            isOpen={showAddModal}
            onClose={handleModalClose}
            onSuccess={handleBookUploadSuccess}
            categories={data.categories}
            authors={data.authors}
          />
        )}

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={modals.deleteConfirm} 
          onClose={() => setModals(prev => ({ ...prev, deleteConfirm: false }))}
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
                onClick={() => setModals(prev => ({ ...prev, deleteConfirm: false }))}
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
          isOpen={modals.assign} 
          onClose={() => {
            setModals(prev => ({ ...prev, assign: false }));
            setSelection(prev => ({ ...prev, user: null }));
            setForms(prev => ({ ...prev, userSearch: '' }));
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
            {selection.bookForAction && (
              <div className="mb-3 xs:mb-4 p-2 xs:p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 xs:gap-3 mb-2">
                  <img
                    src={selection.bookForAction.cover_image_url || '/placeholder-book.jpg'}
                    alt={selection.bookForAction.title}
                    className="w-10 xs:w-12 h-12 xs:h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="text-xs xs:text-sm font-medium text-gray-900 leading-tight break-words">{selection.bookForAction.title}</p>
                    <p className="text-xs text-gray-600 break-words">by {selection.bookForAction.author_name}</p>
                    <span className={`inline-flex px-1.5 py-0.5 text-xs font-medium rounded-full ${
                      selection.bookForAction.format === 'physical' ? 'bg-orange-100 text-orange-800' : 
                      selection.bookForAction.format === 'both' ? 'bg-purple-100 text-purple-800' : 
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {selection.bookForAction.format === 'physical' ? 'Physical Book' : 
                       selection.bookForAction.format === 'both' ? 'Both Formats' : 'Ebook'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="mb-3 xs:mb-4">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Assignment Format</label>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setForms(prev => ({ ...prev, selectedFormat: 'both' }))}
                  className={`flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-lg border transition-colors ${
                    forms.selectedFormat === 'both'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Both Formats
                </button>
                <button
                  type="button"
                  onClick={() => setForms(prev => ({ ...prev, selectedFormat: 'ebook' }))}
                  className={`flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-lg border transition-colors ${
                    forms.selectedFormat === 'ebook'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Ebook Only
                </button>
                <button
                  type="button"
                  onClick={() => setForms(prev => ({ ...prev, selectedFormat: 'physical' }))}
                  className={`flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm font-medium rounded-lg border transition-colors ${
                    forms.selectedFormat === 'physical'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Physical Only
                </button>
              </div>
            </div>
            <div className="mb-3 xs:mb-4">
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Search and Select User</label>
              <input
                type="text"
                placeholder="Search users..."
                value={forms.userSearch}
                onChange={(e) => setForms(prev => ({ ...prev, userSearch: e.target.value }))}
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {forms.userSearch && (
                <div className="mt-1 xs:mt-2 max-h-32 xs:max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                  {data.users
                    .filter(user => 
                      user.name?.toLowerCase().includes(forms.userSearch.toLowerCase()) ||
                      user.email?.toLowerCase().includes(forms.userSearch.toLowerCase())
                    )
                    .slice(0, 5)
                    .map(user => (
                      <button
                        key={user.id}
                        onClick={() => {
                          setSelection(prev => ({ ...prev, user }));
                          setForms(prev => ({ ...prev, userSearch: `${user.name} (${user.email})` }));
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
                  setModals(prev => ({ ...prev, assign: false }));
                  setSelection(prev => ({ ...prev, user: null }));
                  setForms(prev => ({ ...prev, userSearch: '', selectedFormat: 'both' }));
                }}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignBook}
                disabled={!selection.user || loadingStates.assign}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs xs:text-sm font-medium flex items-center justify-center gap-1 xs:gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStates.assign ? (
                  <i className="ri-loader-4-line animate-spin text-sm xs:text-base"></i>
                ) : (
                  <i className="ri-user-add-line text-sm xs:text-base"></i>
                )}
                <span className="truncate">{loadingStates.assign ? 'Assigning...' : `Assign ${forms.selectedFormat === 'both' ? 'Both Formats' : forms.selectedFormat === 'ebook' ? 'Ebook' : 'Physical Book'}`}</span>
              </button>
            </div>
          </div>
        </Modal>

        {/* Reading Analytics Modal */}
        <Modal 
          isOpen={modals.analytics} 
          onClose={() => setModals(prev => ({ ...prev, analytics: false }))}
          className="max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl w-full mx-2 xs:mx-3 sm:mx-4"
        >
          <div className="p-3 xs:p-4 sm:p-6">
            <div className="flex items-start xs:items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="flex-shrink-0 w-8 xs:w-10 h-8 xs:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <i className="ri-bar-chart-line text-purple-600 text-sm xs:text-base"></i>
              </div>
              <h3 className="text-sm xs:text-base sm:text-lg font-medium text-gray-900 leading-tight break-words">Reading Analytics</h3>
            </div>
            {selection.bookForAction && (
              <div className="mb-4 xs:mb-5 sm:mb-6">
                <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 p-2 xs:p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selection.bookForAction.cover_image_url || '/placeholder-book.jpg'}
                    alt={selection.bookForAction.title}
                    className="w-12 xs:w-14 sm:w-16 h-15 xs:h-17 sm:h-20 object-cover rounded mx-auto xs:mx-0"
                  />
                  <div className="text-center xs:text-left w-full">
                    <h4 className="text-xs xs:text-sm sm:text-base font-medium text-gray-900 leading-tight break-words">{selection.bookForAction.title}</h4>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">by {selection.bookForAction.author_name}</p>
                    <p className="text-xs text-gray-500 break-words">{selection.bookForAction.category_name}</p>
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
                onClick={() => setModals(prev => ({ ...prev, analytics: false }))}
                className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs xs:text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>

        {/* Edit Book Modal */}
        <BookEditModal
          isOpen={modals.edit}
          onClose={() => setModals(prev => ({ ...prev, edit: false }))}
          book={selection.bookForAction}
          categories={data.categories}
          authors={data.authors}
          onSuccess={() => {
            // Refresh the books list
            loadBooks();
          }}
        />

        {/* Book Details Modal */}
        <Modal 
          isOpen={modals.details} 
          onClose={() => setModals(prev => ({ ...prev, details: false }))}
          className="max-w-4xl w-full mx-4"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <i className="ri-book-line text-blue-600"></i>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Book Details</h2>
            </div>
            {selection.bookForAction && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cover Image Section */}
                <div className="lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Image
                  </label>
                  <div className="relative">
                    <img
                      src={selection.bookForAction.cover_image_url || '/placeholder-book.jpg'}
                      alt={selection.bookForAction.title}
                      className="w-full h-64 object-cover rounded-lg border shadow-md"
                    />
                  </div>
                </div>

                {/* Book Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <p className="text-base font-semibold text-gray-900">{selection.bookForAction.title}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author
                      </label>
                      <p className="text-base text-gray-900">{selection.bookForAction.author_name}</p>
                    </div>
                  </div>

                  {(selection.bookForAction as any).description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <p className="text-sm text-gray-700 leading-relaxed">{(selection.bookForAction as any).description}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price
                      </label>
                      <p className="text-lg font-semibold text-green-600">₦{selection.bookForAction.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Stock Quantity
                      </label>
                      <p className="text-base text-gray-900">{selection.bookForAction.stock_quantity}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                        selection.bookForAction.status === 'published' ? 'bg-green-100 text-green-800' :
                        selection.bookForAction.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selection.bookForAction.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <p className="text-base text-gray-900">{selection.bookForAction.category_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                      </label>
                      <p className="text-base text-gray-900 capitalize">{selection.bookForAction.format}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selection.bookForAction as any).isbn && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          ISBN
                        </label>
                        <p className="text-base text-gray-900">{(selection.bookForAction as any).isbn}</p>
                      </div>
                    )}
                    {(selection.bookForAction as any).pages && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Pages
                        </label>
                        <p className="text-base text-gray-900">{(selection.bookForAction as any).pages}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selection.bookForAction as any).language && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Language
                        </label>
                        <p className="text-base text-gray-900">{(selection.bookForAction as any).language}</p>
                      </div>
                    )}
                    {(selection.bookForAction as any).publisher && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Publisher
                        </label>
                        <p className="text-base text-gray-900">{(selection.bookForAction as any).publisher}</p>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selection.bookForAction as any).publication_date && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Publication Date
                        </label>
                        <p className="text-base text-gray-900">{new Date((selection.bookForAction as any).publication_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Featured
                      </label>
                      <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${
                        selection.bookForAction.is_featured ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <i className={`ri-${selection.bookForAction.is_featured ? 'star' : 'star-line'} mr-1`}></i>
                        {selection.bookForAction.is_featured ? 'Featured' : 'Not Featured'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Created
                    </label>
                    <p className="text-base text-gray-900">{new Date(selection.bookForAction.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-6 border-t mt-6">
              <button
                onClick={() => setModals(prev => ({ ...prev, details: false }))}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setModals(prev => ({ ...prev, details: false, edit: true }));
                }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <i className="ri-edit-line"></i>
                Edit Book
              </button>
            </div>
          </div>
        </Modal>

        {/* Book Assignment Modal */}
        <Modal
          isOpen={modals.bookAssign && selection.bookForAction !== null}
          onClose={() => {
            setModals(prev => ({ ...prev, bookAssign: false }));
            setSelection(prev => ({ ...prev, bookForAction: null }));
          }}
          className="max-w-4xl w-full mx-4"
          showCloseIcon={true}
          closeOnOutsideClick={true}
        >
          {selection.bookForAction && (
            <BulkLibraryManagement
              preSelectedBook={selection.bookForAction}
              onClose={() => {
                setModals(prev => ({ ...prev, bookAssign: false }));
                setSelection(prev => ({ ...prev, bookForAction: null }));
              }}
            />
          )}
        </Modal>

        {/* Batch Update Modal */}
        <Modal 
          isOpen={modals.batchUpdate} 
          onClose={() => setModals(prev => ({ ...prev, batchUpdate: false }))}
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
              <p className="text-xs xs:text-sm text-gray-600">Updating {selection.books.length} selected books</p>
            </div>
            <div className="space-y-3 xs:space-y-4">
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Status (optional)</label>
                <select
                  value={forms.batchUpdate.status}
                  onChange={(e) => setForms(prev => ({ ...prev, batchUpdate: { ...prev.batchUpdate, status: e.target.value } }))}
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
                  value={forms.batchUpdate.category_id}
                  onChange={(e) => setForms(prev => ({ ...prev, batchUpdate: { ...prev.batchUpdate, category_id: e.target.value } }))}
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Keep current category</option>
                  {data.categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">Price Adjustment (optional)</label>
                <div className="flex gap-1 xs:gap-2">
                  <select
                    value={forms.batchUpdate.price_adjustment.type}
                    onChange={(e) => setForms(prev => ({ ...prev, batchUpdate: { ...prev.batchUpdate, price_adjustment: { ...prev.batchUpdate.price_adjustment, type: e.target.value as 'percentage' | 'fixed' } } }))}
                    className="w-16 xs:w-20 px-1 xs:px-2 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">₦</option>
                  </select>
                  <input
                    type="number"
                    placeholder={forms.batchUpdate.price_adjustment.type === 'percentage' ? '10' : '1000'}
                    value={forms.batchUpdate.price_adjustment.value}
                    onChange={(e) => setForms(prev => ({ ...prev, batchUpdate: { ...prev.batchUpdate, price_adjustment: { ...prev.batchUpdate.price_adjustment, value: e.target.value } } }))}
                    className="flex-1 px-2 xs:px-3 py-1.5 xs:py-2 text-xs xs:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">
                  {forms.batchUpdate.price_adjustment.type === 'percentage' ? 'Increase/decrease by percentage (use negative for decrease)' : 'Add/subtract fixed amount (use negative to subtract)'}
                </p>
              </div>
            </div>
            <div className="flex flex-col xs:flex-row justify-end gap-2 xs:gap-3 mt-4 xs:mt-5 sm:mt-6">
              <button
                onClick={() => setModals(prev => ({ ...prev, batchUpdate: false }))}
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