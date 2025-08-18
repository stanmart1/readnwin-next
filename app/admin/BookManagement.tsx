'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import BulkLibraryManagement from './BulkLibraryManagement';
import Pagination from '@/components/Pagination';

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

export default function BookManagement() {
  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] = useState('books');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('book');
  const [bookType, setBookType] = useState('ebook');
  const [formData, setFormData] = useState<{
    title: string;
    author_id: string;
    category_id: string;
    price: string;
    isbn: string;
    description: string;
    language: string;
    pages: string;
    publication_date: string;
    publisher: string;
    format: string;
    stock_quantity: string;
    print_quality?: string;
    condition?: string;
    cover_image: File | null;
    ebook_file: File | null;
  }>({
    title: '',
    author_id: '',
    category_id: '',
    price: '',
    isbn: '',
    description: '',
    language: 'English',
    pages: '',
    publication_date: '',
    publisher: '',
    format: 'ebook',
    stock_quantity: '',
    print_quality: 'standard',
    condition: 'new',
    cover_image: null,
    ebook_file: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileValidation, setFileValidation] = useState<{
    cover_image?: { valid: boolean; message: string };
    ebook_file?: { valid: boolean; message: string };
  }>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // New author and category creation states
  const [showNewAuthorForm, setShowNewAuthorForm] = useState(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newAuthorData, setNewAuthorData] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [newCategoryData, setNewCategoryData] = useState({
    name: '',
    description: ''
  });
  const [isCreatingAuthor, setIsCreatingAuthor] = useState(false);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  
  // Book editing and viewing states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [editFormData, setEditFormData] = useState<{
    title: string;
    author_id: string;
    category_id: string;
    price: string;
    isbn: string;
    description: string;
    language: string;
    pages: string;
    publication_date: string;
    publisher: string;
    format: string;
    stock_quantity: string;
    cover_image: File | null;
    ebook_file: File | null;
  }>({
    title: '',
    author_id: '',
    category_id: '',
    price: '',
    isbn: '',
    description: '',
    language: 'English',
    pages: '',
    publication_date: '',
    publisher: '',
    format: 'ebook',
    stock_quantity: '',
    cover_image: null,
    ebook_file: null
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  
  // Library assignment states
  const [showLibraryAssignment, setShowLibraryAssignment] = useState(false);
  const [selectedBookForAssignment, setSelectedBookForAssignment] = useState<Book | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  // Batch delete states
  const [selectedBooks, setSelectedBooks] = useState<number[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  // Load data on component mount and when pagination/filters change
  useEffect(() => {
    if (status === 'authenticated' && session) {
      loadData();
    }
  }, [currentPage, itemsPerPage, selectedFilters, session, status]);

  // Helper function for authenticated API calls
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    if (!session) {
      throw new Error('No session available');
    }
    
    // Don't set Content-Type for FormData (let browser set it automatically)
    const headers = options.body instanceof FormData 
      ? { ...options.headers }
      : { 'Content-Type': 'application/json', ...options.headers };
    
    return fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Check authentication
      if (!session) {
        console.log('No session available, skipping data load');
        return;
      }
      
      // Load books with pagination
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      // Add filters if they exist
      if (selectedFilters.category) {
        params.append('category_id', selectedFilters.category);
      }
      if (selectedFilters.status) {
        params.append('status', selectedFilters.status);
      }
      if (selectedFilters.search) {
        params.append('search', selectedFilters.search);
      }

      const booksResponse = await authenticatedFetch(`/api/admin/books?${params.toString()}`);
      const booksData = await booksResponse.json();
      if (booksData.success) {
        setBooks(booksData.books);
        setTotalPages(booksData.pagination.pages);
        setTotalItems(booksData.pagination.total);
      }

      // Load categories
      const categoriesResponse = await authenticatedFetch('/api/admin/categories');
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      // Load authors
      const authorsResponse = await authenticatedFetch('/api/admin/authors');
      const authorsData = await authorsResponse.json();
      if (authorsData.success) {
        setAuthors(authorsData.authors);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = (type: string) => {
    setModalType(type);
    setShowAddModal(true);
    // Reset form data when opening modal
    if (type === 'book') {
      setFormData({
        title: '',
        author_id: '',
        category_id: '',
        price: '',
        isbn: '',
        description: '',
        language: 'English',
        pages: '',
        publication_date: '',
        publisher: '',
        format: 'ebook',
        stock_quantity: '',
        print_quality: 'standard',
        condition: 'new',
        cover_image: null,
        ebook_file: null
      });
      setFormErrors({});
      setFileValidation({});
      setGeneralError(null);
      setSuccessMessage(null);
      setUploadProgress(0);
      // Reset new author and category forms
      setShowNewAuthorForm(false);
      setShowNewCategoryForm(false);
      setNewAuthorData({ name: '', email: '', bio: '' });
      setNewCategoryData({ name: '', description: '' });
    }
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setFormErrors({});
    setFileValidation({});
    setGeneralError(null);
    setSuccessMessage(null);
    setUploadProgress(0);
    setShowNewAuthorForm(false);
    setShowNewCategoryForm(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleFileChange = (field: string, file: File) => {
    // Clear previous errors
    setGeneralError(null);
    setSuccessMessage(null);
    
    // Validate file
    const validation = validateFile(field, file);
    setFileValidation(prev => ({
      ...prev,
      [field]: validation
    }));
    
    if (validation.valid) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
      // Clear form error for this field
      if (formErrors[field]) {
        setFormErrors(prev => ({
          ...prev,
          [field]: ''
        }));
      }
    }
  };

  const validateFile = (field: string, file: File) => {
    const maxSizes = {
      cover_image: 5 * 1024 * 1024, // 5MB
      ebook_file: 50 * 1024 * 1024  // 50MB
    };
    
    const allowedTypes = {
      cover_image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      ebook_file: [
        'application/epub+zip',
        'application/epub',
        'application/x-epub',
        'application/octet-stream',
        'application/zip',
        'application/x-zip-compressed',
        'application/pdf',
        'application/x-mobipocket-ebook'
      ]
    };
    
    // Check file size
    if (file.size > maxSizes[field as keyof typeof maxSizes]) {
      return {
        valid: false,
        message: `File size exceeds ${maxSizes[field as keyof typeof maxSizes] / (1024 * 1024)}MB limit`
      };
    }
    
    // Check file type with enhanced validation for ebooks
    const fileName = file.name.toLowerCase();
    const validExtensions = field === 'cover_image' 
      ? ['.jpg', '.jpeg', '.png', '.webp']
      : ['.epub', '.pdf', '.mobi'];
    
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    const hasValidMimeType = allowedTypes[field as keyof typeof allowedTypes].includes(file.type);
    
    // For ebook files, prioritize extension check as browsers often misidentify MIME types
    if (field === 'ebook_file') {
      if (hasValidExtension) {
        console.log(`✅ Ebook file validation passed via extension: ${file.name} (${file.type})`);
        return { valid: true, message: 'File is valid (validated by extension)' };
      }
    } else {
      // For cover images, check both MIME type and extension
      if (hasValidMimeType || hasValidExtension) {
        console.log(`✅ Cover image validation passed: ${file.name} (${file.type})`);
        return { valid: true, message: 'File is valid' };
      }
    }
    
    return {
      valid: false,
      message: `Invalid file type. Allowed: ${field === 'cover_image' ? 'JPG, PNG, WebP' : 'EPUB, PDF, MOBI'}`
    };
  };

  const validateForm = () => {
    const errors: any = {};
    
    // Clear previous messages
    setGeneralError(null);
    setSuccessMessage(null);
    
    // Debug logging for form validation
    console.log('🔍 Form validation check:', {
      title: formData.title,
      author_id: formData.author_id,
      category_id: formData.category_id,
      price: formData.price,
      bookType,
      hasCoverImage: !!formData.cover_image,
      hasEbookFile: !!formData.ebook_file,
      coverImageValid: fileValidation.cover_image?.valid,
      ebookFileValid: fileValidation.ebook_file?.valid
    });
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author_id) errors.author_id = 'Author is required';
    if (!formData.category_id) errors.category_id = 'Category is required';
    if (!formData.price || parseFloat(formData.price) <= 0) errors.price = 'Valid price is required';
    
    if (bookType === 'physical') {
      if (!formData.publisher) errors.publisher = 'Publisher is required for physical books';
      // Make stock quantity optional - only validate if provided
      if (formData.stock_quantity && parseInt(formData.stock_quantity) < 0) {
        errors.stock_quantity = 'Stock quantity must be 0 or greater';
      }
    }
    
    if (bookType === 'ebook') {
      if (!formData.ebook_file) errors.ebook_file = 'Ebook file is required';
    }
    
    if (!formData.cover_image) errors.cover_image = 'Cover image is required';
    
    // Check file validation errors
    if (formData.cover_image && fileValidation.cover_image && !fileValidation.cover_image.valid) {
      errors.cover_image = fileValidation.cover_image.message;
    }
    
    if (formData.ebook_file && fileValidation.ebook_file && !fileValidation.ebook_file.valid) {
      errors.ebook_file = fileValidation.ebook_file.message;
    }
    
    console.log('❌ Validation errors:', errors);
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAuthor = async () => {
    if (!newAuthorData.name.trim()) {
      toast.error('Author name is required');
      return;
    }

    setIsCreatingAuthor(true);
    try {
      const response = await authenticatedFetch('/api/admin/authors', {
        method: 'POST',
        body: JSON.stringify(newAuthorData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Author created successfully!');
        setShowNewAuthorForm(false);
        setNewAuthorData({ name: '', email: '', bio: '' });
        await loadData(); // Reload authors list
        
        // Set the newly created author as selected
        if (result.author) {
          handleInputChange('author_id', result.author.id.toString());
        }
      } else {
        toast.error(result.error || 'Failed to create author');
      }
    } catch (error) {
      console.error('Error creating author:', error);
      toast.error('An error occurred while creating the author');
    } finally {
      setIsCreatingAuthor(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsCreatingCategory(true);
    try {
      const response = await authenticatedFetch('/api/admin/categories', {
        method: 'POST',
        body: JSON.stringify(newCategoryData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Category created successfully!');
        setShowNewCategoryForm(false);
        setNewCategoryData({ name: '', description: '' });
        await loadData(); // Reload categories list
        
        // Set the newly created category as selected
        if (result.category) {
          handleInputChange('category_id', result.category.id.toString());
        }
      } else {
        toast.error(result.error || 'Failed to create category');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('An error occurred while creating the category');
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setGeneralError(null);
    setSuccessMessage(null);
    
    console.log('🚀 Starting book submission...');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      setGeneralError('Please fix the errors in the form before submitting');
      return;
    }
    
    console.log('✅ Form validation passed');
    setIsSubmitting(true);
    setUploadProgress(0);
    
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      
      // Add text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'cover_image' && key !== 'ebook_file' && formData[key as keyof typeof formData] !== null) {
          submitData.append(key, String(formData[key as keyof typeof formData]));
        }
      });
      
      // Add files
      if (formData.cover_image) {
        submitData.append('cover_image', formData.cover_image);
        console.log('📁 Added cover image:', formData.cover_image.name, 'Size:', formData.cover_image.size);
      }
      if (formData.ebook_file) {
        submitData.append('ebook_file', formData.ebook_file);
        console.log('📁 Added ebook file:', formData.ebook_file.name, 'Size:', formData.ebook_file.size);
      }
      
      // Add book type - map bookType to the correct format value
      const formatValue = bookType === 'ebook' ? 'ebook' : 'physical';
      submitData.append('format', formatValue);
      
      // Debug logging
      console.log('📤 Submitting book with:', {
        bookType,
        formatValue,
        hasEbookFile: !!formData.ebook_file,
        hasCoverImage: !!formData.cover_image,
        formDataKeys: Object.keys(formData)
      });
      
      // Ensure format is explicitly set
      submitData.set('format', formatValue);
      
      console.log('🚀 Starting upload process...');
      setUploadProgress(10);
      
      console.log('📋 Preparing FormData...');
      setUploadProgress(20);
      
      console.log('🌐 Making API request to /api/admin/books...');
      setUploadProgress(25);
      console.log('📤 FormData contents:', {
        title: submitData.get('title'),
        author_id: submitData.get('author_id'),
        category_id: submitData.get('category_id'),
        price: submitData.get('price'),
        format: submitData.get('format'),
        cover_image: submitData.get('cover_image') ? 'present' : 'missing',
        ebook_file: submitData.get('ebook_file') ? 'present' : 'missing'
      });
      
      console.log('📤 Sending request with progress tracking...');
      setUploadProgress(30);
      
      // Use XMLHttpRequest for progress tracking
      const result = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        // Track upload progress
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            // Map upload progress from 30% to 90% (reserving 10% for processing)
            const mappedProgress = 30 + (percentComplete * 0.6);
            setUploadProgress(mappedProgress);
            console.log(`📤 Upload progress: ${percentComplete}% (mapped to ${mappedProgress}%)`);
          }
        });
        
        // Handle response
        xhr.addEventListener('load', () => {
          console.log('📥 Request completed, processing response...');
          setUploadProgress(90);
          
          console.log('📥 Response status:', xhr.status);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const result = JSON.parse(xhr.responseText);
              console.log('📥 Response data:', result);
              resolve(result);
            } catch (parseError) {
              console.error('❌ Failed to parse response:', parseError);
              reject(new Error('Invalid response format'));
            }
          } else {
            console.error('❌ Upload failed:', xhr.responseText);
            reject(new Error(`Upload failed: ${xhr.status} ${xhr.statusText}`));
          }
        });
        
        // Handle errors
        xhr.addEventListener('error', () => {
          console.error('❌ Network error during upload');
          reject(new Error('Network error during upload'));
        });
        
        xhr.addEventListener('abort', () => {
          console.error('❌ Upload was aborted');
          reject(new Error('Upload was aborted'));
        });
        
        // Set timeout
        xhr.timeout = 60000; // 60 seconds
        xhr.addEventListener('timeout', () => {
          console.error('❌ Upload timed out');
          reject(new Error('Upload timed out. Please try again.'));
        });
        
        // Open and send request
        xhr.open('POST', '/api/admin/books');
        
        // Add authentication headers if needed
        const token = sessionStorage.getItem('auth-token') || localStorage.getItem('auth-token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.send(submitData);
      });
      
      // Move the success handling inside the try block
      if (result) {
        setUploadProgress(100);
        setSuccessMessage('Book created successfully!');
        console.log('✅ Book created successfully!');
        
        // Reset form
        setFormData({
          title: '',
          author_id: '',
          category_id: '',
          price: '',
          isbn: '',
          description: '',
          language: 'English',
          pages: '',
          publication_date: '',
          publisher: '',
          format: 'ebook',
          stock_quantity: '',
          print_quality: 'standard',
          condition: 'new',
          cover_image: null,
          ebook_file: null
        });
        setFormErrors({});
        setFileValidation({});
        
        // Close modal after a short delay to show success message
        setTimeout(() => {
          setShowAddModal(false);
          loadData(); // Reload the books list
          setSuccessMessage(null);
          setUploadProgress(0);
        }, 1500);
        
      } else {
        const errorMessage = (result as any)?.message || (result as any)?.error || 'Failed to create book. Please try again.';
        console.error('❌ Book creation failed:', {
          status: response.status,
          statusText: response.statusText,
          result,
          bookType,
          formatValue
        });
        setGeneralError(`${errorMessage} (Book Type: ${bookType}, Format: ${formatValue})`);
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('❌ Error creating book:', error);
      
      // Provide more specific error messages
      let errorMessage = 'An error occurred while creating the book. Please check your connection and try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('Upload failed:')) {
          errorMessage = 'File upload failed. Please check your files and try again.';
        } else if (error.message.includes('Failed to fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setGeneralError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleFeature = async (bookId: number) => {
    try {
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      console.log(`🔍 Toggling featured status for book ${bookId} from ${book.is_featured} to ${!book.is_featured}`);

      const response = await authenticatedFetch(`/api/admin/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify({ is_featured: !book.is_featured })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Book ${book.is_featured ? 'unfeatured' : 'featured'} successfully`);
        loadData(); // Reload data
      } else {
        console.error('❌ Failed to update book:', result);
        const errorMessage = result.error || result.details || 'Failed to update book';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error toggling feature:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update book';
      toast.error(errorMessage);
    }
  };

  const handleStatusChange = async (bookId: number, newStatus: string) => {
    try {
      console.log(`🔍 Updating status for book ${bookId} to ${newStatus}`);

      const response = await authenticatedFetch(`/api/admin/books/${bookId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(`Book status updated to ${newStatus}`);
        loadData(); // Reload data
      } else {
        console.error('❌ Failed to update book status:', result);
        const errorMessage = result.error || result.details || 'Failed to update book status';
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('❌ Error updating status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update book status';
      toast.error(errorMessage);
    }
  };

  const handleViewBook = async (bookId: number) => {
    try {
      const response = await authenticatedFetch(`/api/admin/books/${bookId}`);
      const result = await response.json();

      if (response.ok) {
        setSelectedBook(result.book);
        setShowViewModal(true);
      } else {
        toast.error(result.error || 'Failed to fetch book details');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to fetch book details');
    }
  };

  const handleEditBook = async (bookId: number) => {
    try {
      const response = await authenticatedFetch(`/api/admin/books/${bookId}`);
      const result = await response.json();

      if (response.ok) {
        const book = result.book;
        setSelectedBook(book);
        
        // Populate edit form with book data
        setEditFormData({
          title: book.title || '',
          author_id: book.author_id?.toString() || '',
          category_id: book.category_id?.toString() || '',
          price: book.price?.toString() || '',
          isbn: book.isbn || '',
          description: book.description || '',
          language: book.language || 'English',
          pages: book.pages?.toString() || '',
          publication_date: book.publication_date || '',
          publisher: book.publisher || '',
          format: book.format || 'ebook',
          stock_quantity: book.stock_quantity?.toString() || '',
          cover_image: null,
          ebook_file: null
        });
        
        setShowEditModal(true);
        setEditErrors({});
      } else {
        toast.error(result.error || 'Failed to fetch book details');
      }
    } catch (error) {
      console.error('Error fetching book:', error);
      toast.error('Failed to fetch book details');
    }
  };

  const handleEditInputChange = (field: string, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEditForm = () => {
    const errors: Record<string, string> = {};

    if (!editFormData.title.trim()) {
      errors.title = 'Title is required';
    }
    if (!editFormData.author_id) {
      errors.author_id = 'Author is required';
    }
    if (!editFormData.category_id) {
      errors.category_id = 'Category is required';
    }
    if (!editFormData.price || parseFloat(editFormData.price) <= 0) {
      errors.price = 'Valid price is required';
    }
    
    // Only validate stock quantity for physical books
    if (editFormData.format === 'physical') {
      if (!editFormData.stock_quantity || parseInt(editFormData.stock_quantity) < 0) {
        errors.stock_quantity = 'Valid stock quantity is required for physical books';
      }
    }

    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm() || !selectedBook) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setIsEditing(true);
    
    try {
      const updateData = {
        title: editFormData.title,
        author_id: parseInt(editFormData.author_id),
        category_id: parseInt(editFormData.category_id),
        price: parseFloat(editFormData.price),
        isbn: editFormData.isbn,
        description: editFormData.description,
        language: editFormData.language,
        pages: editFormData.pages ? parseInt(editFormData.pages) : null,
        publication_date: editFormData.publication_date,
        publisher: editFormData.publisher,
        format: editFormData.format,
        stock_quantity: editFormData.format === 'ebook' ? 0 : (editFormData.stock_quantity ? parseInt(editFormData.stock_quantity) : 0)
      };

      const response = await authenticatedFetch(`/api/admin/books/${selectedBook.id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast.success('Book updated successfully!');
        setShowEditModal(false);
        setSelectedBook(null);
        loadData(); // Reload the books list
      } else {
        toast.error(result.error || 'Failed to update book');
      }
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('An error occurred while updating the book');
    } finally {
      setIsEditing(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    const book = books.find(b => b.id === bookId);
    if (!book) return;
    
    setBookToDelete(book);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteBook = async () => {
    if (!bookToDelete) return;

    setDeletingBookId(bookToDelete.id);
    
    try {
      console.log(`🔍 Attempting to delete book ${bookToDelete.id}...`);
      
      const response = await authenticatedFetch(`/api/admin/books/${bookToDelete.id}`, {
        method: 'DELETE',
      });

      console.log(`🔍 Delete response status: ${response.status}`);
      console.log(`🔍 Delete response headers:`, Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log(`🔍 Delete response data:`, result);

      if (response.ok) {
        toast.success('Book deleted successfully');
        loadData(); // Reload data
        setShowDeleteConfirm(false);
        setBookToDelete(null);
      } else {
        // Provide more specific error messages based on status code
        let errorMessage = 'Failed to delete book';
        
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to delete books.';
        } else if (response.status === 404) {
          errorMessage = 'Book not found or could not be deleted.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        toast.error(errorMessage);
        console.error('Delete book error:', {
          status: response.status,
          statusText: response.statusText,
          result,
          bookId: bookToDelete.id
        });
      }
    } catch (error) {
      console.error('Network error deleting book:', error);
      
      // Check if it's a network error or CORS issue
      let errorMessage = 'Network error: Failed to delete book. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
      } else if (error instanceof TypeError && error.message.includes('CORS')) {
        errorMessage = 'CORS error: Please contact support.';
      }
      
      toast.error(errorMessage);
    } finally {
      setDeletingBookId(null);
    }
  };

  const handleLibraryAssignment = (book: Book) => {
    setSelectedBookForAssignment(book);
    setShowLibraryAssignment(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleFilterChange = () => {
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleSelectBook = (bookId: number) => {
    setSelectedBooks(prev => 
      prev.includes(bookId) 
        ? prev.filter(id => id !== bookId)
        : [...prev, bookId]
    );
  };

  const handleSelectAllBooks = () => {
    if (selectedBooks.length === books.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks(books.map(book => book.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedBooks.length === 0) return;
    
    const confirmMessage = `Are you sure you want to delete ${selectedBooks.length} books? This action cannot be undone.`;
    if (!confirm(confirmMessage)) return;

    try {
      setBulkActionLoading(true);
      console.log(`🔍 Attempting bulk delete for books:`, selectedBooks);
      
      const response = await authenticatedFetch(`/api/admin/books?ids=${selectedBooks.join(',')}`, {
        method: 'DELETE',
      });

      console.log(`🔍 Bulk delete response status: ${response.status}`);

      const result = await response.json();
      console.log(`🔍 Bulk delete response data:`, result);

      if (response.ok) {
        const message = result.message || `Successfully deleted ${result.deleted_count} books`;
        toast.success(message);
        setSelectedBooks([]);
        loadData(); // Reload data
      } else {
        // Provide more specific error messages based on status code
        let errorMessage = 'Failed to delete books';
        
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (response.status === 403) {
          errorMessage = 'You do not have permission to delete books.';
        } else if (response.status === 404) {
          errorMessage = 'API endpoint not available.';
        } else if (response.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (result.error) {
          errorMessage = result.error;
        } else if (result.message) {
          errorMessage = result.message;
        }
        
        toast.error(errorMessage);
        console.error('Bulk delete error:', {
          status: response.status,
          statusText: response.statusText,
          result,
          bookIds: selectedBooks
        });
      }
    } catch (error) {
      console.error('Network error in bulk delete:', error);
      
      // Check if it's a network error or CORS issue
      let errorMessage = 'Network error: Failed to delete books. Please try again.';
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to server. Please check your connection.';
      } else if (error instanceof TypeError && error.message.includes('CORS')) {
        errorMessage = 'CORS error: Please contact support.';
      }
      
      toast.error(errorMessage);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Show loading state while session is loading
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading book management...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-lg font-semibold mb-2">Authentication Required</div>
          <p className="text-gray-600">Please log in to access the book management page.</p>
        </div>
      </div>
    );
  }

  const renderBooks = () => (
    <div className="space-y-4 sm:space-y-6">
      {/* Actions */}
      <div className="space-y-4">
        {/* Mobile Actions */}
        <div className="lg:hidden space-y-3">
          {/* Primary Action */}
          <div className="w-full">
            <button
              onClick={() => handleAddNew('book')}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer flex items-center justify-center"
            >
              <i className="ri-add-line mr-2"></i>
              Add New Book
            </button>
          </div>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center text-sm">
              <i className="ri-upload-line mr-1"></i>
              Import
            </button>
            <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer flex items-center justify-center text-sm">
              <i className="ri-download-line mr-1"></i>
              Export
            </button>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-2 gap-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
              <option>All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex justify-between items-center">
          <div className="flex space-x-4">
            <button
              onClick={() => handleAddNew('book')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line mr-2"></i>
              Add New Book
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">
              <i className="ri-upload-line mr-2"></i>
              Import Books
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap">
              <i className="ri-download-line mr-2"></i>
              Export Books
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-3 py-2 border border-gray-300 rounded-lg pr-8">
              <option>All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
            <select className="px-3 py-2 border border-gray-300 rounded-lg pr-8">
              <option>All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedBooks.length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
          <span className="text-sm text-blue-800">
            {selectedBooks.length} books selected
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleBulkDelete}
              disabled={bulkActionLoading}
              className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {bulkActionLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </div>
              ) : (
                <div className="flex items-center">
                  <i className="ri-delete-bin-line mr-2"></i>
                  Delete Selected
                </div>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Books - Mobile Cards */}
      <div className="xl:hidden space-y-4">
        {/* Mobile Select All */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Books</span>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedBooks.length === books.length && books.length > 0}
              onChange={handleSelectAllBooks}
              className="cursor-pointer"
            />
            <span className="text-xs text-gray-500">Select All</span>
          </div>
        </div>
        
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            {/* Book Header */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={selectedBooks.includes(book.id)}
                onChange={() => handleSelectBook(book.id)}
                className="mt-1 cursor-pointer"
              />
              <img 
                src={book.cover_image_url || '/placeholder-book.jpg'} 
                alt={book.title} 
                className="w-12 h-18 object-cover object-top rounded flex-shrink-0"
                onError={(e) => {
                  // Fallback to placeholder image
                  e.currentTarget.src = '/placeholder-book.jpg';
                }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 flex items-center break-words">
                      {book.title}
                      {book.is_featured && (
                        <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex-shrink-0">
                          Featured
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 break-words">{book.author_name}</div>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-lg font-bold text-gray-900 break-words">₦{book.price}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Category:</span>
                  <div className="text-gray-900 break-words">{book.category_name}</div>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Type:</span>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      book.format === 'ebook' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      <i className={`mr-1 ${
                        book.format === 'ebook' 
                          ? 'ri-file-text-line' 
                          : 'ri-book-line'
                      }`}></i>
                      {book.format === 'ebook' ? 'Ebook' : 'Physical'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Status and Inventory */}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-gray-700 text-sm">Status:</span>
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${
                      book.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : book.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-700 text-sm">Stock:</span>
                  <div className="text-sm">
                    {book.format === 'ebook' ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : (
                      <span className={book.stock_quantity < 50 ? 'text-red-600' : 'text-gray-900'}>
                        {book.stock_quantity}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-3">
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleEditBook(book.id)}
                  className="flex items-center text-blue-600 hover:text-blue-800 cursor-pointer text-sm whitespace-nowrap"
                  title="Edit Book"
                >
                  <i className="ri-edit-line mr-1"></i>
                  Edit
                </button>
                <button 
                  onClick={() => handleViewBook(book.id)}
                  className="flex items-center text-green-600 hover:text-green-800 cursor-pointer text-sm whitespace-nowrap"
                  title="View Book Details"
                >
                  <i className="ri-eye-line mr-1"></i>
                  View
                </button>
                {book.format === 'ebook' && (
                  <button 
                    onClick={() => handleLibraryAssignment(book)}
                    className="flex items-center text-purple-600 hover:text-purple-800 cursor-pointer text-sm whitespace-nowrap"
                    title="Assign to Library"
                  >
                    <i className="ri-user-add-line mr-1"></i>
                    Assign
                  </button>
                )}
                <button 
                  onClick={() => handleToggleFeature(book.id)}
                  className={`flex items-center cursor-pointer text-sm whitespace-nowrap ${
                    book.is_featured 
                      ? 'text-yellow-600 hover:text-yellow-800' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  title={book.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                >
                  <i className={`mr-1 ${book.is_featured ? 'ri-star-fill' : 'ri-star-line'}`}></i>
                  {book.is_featured ? 'Featured' : 'Feature'}
                </button>
                <button 
                  onClick={() => handleDeleteBook(book.id)}
                  disabled={deletingBookId === book.id}
                  className="flex items-center text-red-600 hover:text-red-800 cursor-pointer text-sm whitespace-nowrap disabled:opacity-50"
                  title="Delete Book"
                >
                  {deletingBookId === book.id ? (
                    <i className="ri-loader-4-line animate-spin mr-1"></i>
                  ) : (
                    <i className="ri-delete-bin-line mr-1"></i>
                  )}
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Books - Desktop Table */}
      <div className="hidden xl:block bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBooks.length === books.length && books.length > 0}
                  onChange={handleSelectAllBooks}
                  className="cursor-pointer"
                />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Details</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inventory</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={() => handleSelectBook(book.id)}
                    className="cursor-pointer"
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    <img 
                      src={book.cover_image_url || '/placeholder-book.jpg'} 
                      alt={book.title} 
                      className="w-12 h-18 object-cover object-top rounded flex-shrink-0"
                      onError={(e) => {
                        // Fallback to placeholder image
                        e.currentTarget.src = '/placeholder-book.jpg';
                      }}
                    />
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 flex items-center break-words">
                        {book.title}
                        {book.is_featured && (
                          <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full flex-shrink-0">
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 break-words">{book.author_name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 break-words">{book.category_name}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      book.format === 'ebook' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      <i className={`mr-1 ${
                        book.format === 'ebook' 
                          ? 'ri-file-text-line' 
                          : 'ri-book-line'
                      }`}></i>
                      {book.format === 'ebook' ? 'Ebook' : 'Physical'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium text-gray-900">₦{book.price}</div>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={book.status}
                    onChange={(e) => handleStatusChange(book.id, e.target.value)}
                    className={`px-2 py-1 text-xs font-semibold rounded-full border-0 cursor-pointer ${
                      book.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : book.status === 'draft'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">
                    {book.format === 'ebook' ? (
                      <span className="text-gray-400 italic">N/A</span>
                    ) : (
                      <span className={book.stock_quantity < 50 ? 'text-red-600 font-medium' : 'text-gray-900'}>
                        {book.stock_quantity}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button 
                      onClick={() => handleEditBook(book.id)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-1 rounded hover:bg-blue-50"
                      title="Edit Book"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button 
                      onClick={() => handleViewBook(book.id)}
                      className="text-green-600 hover:text-green-800 cursor-pointer p-1 rounded hover:bg-green-50"
                      title="View Book Details"
                    >
                      <i className="ri-eye-line"></i>
                    </button>
                    {book.format === 'ebook' && (
                      <button
                        onClick={() => handleLibraryAssignment(book)}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer p-1 rounded hover:bg-purple-50"
                        title="Assign to Library"
                      >
                        <i className="ri-user-add-line"></i>
                      </button>
                    )}
                    <button 
                      onClick={() => handleToggleFeature(book.id)}
                      className={`cursor-pointer p-1 rounded ${
                        book.is_featured 
                          ? 'text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50' 
                          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                      }`}
                      title={book.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                    >
                      <i className={book.is_featured ? 'ri-star-fill' : 'ri-star-line'}></i>
                    </button>
                    <button 
                      onClick={() => handleDeleteBook(book.id)}
                      disabled={deletingBookId === book.id}
                      className="text-red-600 hover:text-red-800 cursor-pointer p-1 rounded hover:bg-red-50 disabled:opacity-50"
                      title="Delete Book"
                    >
                      {deletingBookId === book.id ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-delete-bin-line"></i>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          showItemsPerPage={true}
        />
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleAddNew('category')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line mr-2"></i>
          Add New Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                {category.book_count} books
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-4">{category.description}</p>
            <div className="flex space-x-2">
              <button className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 cursor-pointer whitespace-nowrap">
                <i className="ri-edit-line mr-2"></i>
                Edit
              </button>
              <button className="px-3 py-2 text-sm text-red-600 hover:text-red-800 cursor-pointer">
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAuthors = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={() => handleAddNew('author')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer whitespace-nowrap"
        >
          <i className="ri-user-add-line mr-2"></i>
          Invite New Author
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Books</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Sales</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Join Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {authors.map((author) => (
              <tr key={author.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <img
                      src={author.avatar_url}
                      alt={author.name}
                      className="w-10 h-10 rounded-full object-cover object-top"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{author.name}</div>
                      <div className="text-sm text-gray-500">{author.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{author.books_count}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{author.total_sales}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₦{author.revenue}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{author.created_at}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    author.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : author.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                  }`}>
                    {author.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 cursor-pointer">
                      <i className="ri-mail-line"></i>
                    </button>
                    <button className="text-green-600 hover:text-green-800 cursor-pointer">
                      <i className="ri-eye-line"></i>
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-800 cursor-pointer">
                      <i className="ri-money-dollar-circle-line"></i>
                    </button>
                    <button className="text-red-600 hover:text-red-800 cursor-pointer">
                      <i className="ri-user-unfollow-line"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const sections = [
    { id: 'books', label: 'Books', icon: 'ri-book-line' },
    { id: 'categories', label: 'Categories', icon: 'ri-price-tag-3-line' },
    { id: 'authors', label: 'Authors', icon: 'ri-user-line' }
  ];

  return (
    <div className="space-y-6">
      {/* Section Navigation */}
      <div className="space-y-4">
        {/* Desktop Navigation */}
        <div className="hidden lg:flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap cursor-pointer ${
                activeSection === section.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <i className={section.icon}></i>
              <span>{section.label}</span>
            </button>
          ))}
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <div className="grid grid-cols-3 gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex flex-col items-center justify-center py-3 px-2 rounded-lg font-medium text-sm cursor-pointer transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <i className={`${section.icon} text-lg mb-1`}></i>
                <span className="text-xs">{section.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'books' && renderBooks()}
      {activeSection === 'categories' && renderCategories()}
      {activeSection === 'authors' && renderAuthors()}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Add New {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleSubmit}>
                {modalType === 'book' && (
                  <>
                    {/* Book Type Selection */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Book Type</label>
                      <div className="flex space-x-6">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="ebook"
                            checked={bookType === 'ebook'}
                            onChange={(e) => setBookType(e.target.value)}
                            className="mr-2"
                          />
                          <span className="font-medium">Digital Ebook</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            value="physical"
                            checked={bookType === 'physical'}
                            onChange={(e) => setBookType(e.target.value)}
                            className="mr-2"
                          />
                          <span className="font-medium">Physical Book</span>
                        </label>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Selected:</span> {bookType === 'ebook' ? 'Digital Ebook' : 'Physical Book'}
                      </div>
                    </div>

                    {/* Basic Information */}
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                          <input
                            type="text"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              formErrors.title ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter book title"
                            value={formData.title}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            required
                          />
                          {formErrors.title && (
                            <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                          {!showNewAuthorForm ? (
                            <div className="space-y-2">
                              <select 
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                                  formErrors.author_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.author_id}
                                onChange={(e) => {
                                  if (e.target.value === 'new') {
                                    setShowNewAuthorForm(true);
                                  } else {
                                    handleInputChange('author_id', e.target.value);
                                  }
                                }}
                              >
                                <option value="">Select author</option>
                                {authors.map((author) => (
                                  <option key={author.id} value={author.id}>
                                    {author.name}
                                  </option>
                                ))}
                                <option value="new" className="font-medium text-blue-600">
                                  ➕ Add New Author
                                </option>
                              </select>
                              {formErrors.author_id && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.author_id}</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-blue-900">Add New Author</h4>
                                <button
                                  type="button"
                                  onClick={() => setShowNewAuthorForm(false)}
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-blue-800 mb-1">Name *</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Author name"
                                    value={newAuthorData.name}
                                    onChange={(e) => setNewAuthorData(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-800 mb-1">Email</label>
                                  <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="author@example.com"
                                    value={newAuthorData.email}
                                    onChange={(e) => setNewAuthorData(prev => ({ ...prev, email: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-blue-800 mb-1">Bio</label>
                                  <textarea
                                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Author biography"
                                    rows={2}
                                    value={newAuthorData.bio}
                                    onChange={(e) => setNewAuthorData(prev => ({ ...prev, bio: e.target.value }))}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCreateAuthor}
                                  disabled={isCreatingAuthor}
                                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isCreatingAuthor
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-blue-600 text-white hover:bg-blue-700'
                                  }`}
                                >
                                  {isCreatingAuthor ? (
                                    <>
                                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                                      Creating...
                                    </>
                                  ) : (
                                    'Create Author'
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                          {!showNewCategoryForm ? (
                            <div className="space-y-2">
                              <select 
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                                  formErrors.category_id ? 'border-red-500' : 'border-gray-300'
                                }`}
                                value={formData.category_id}
                                onChange={(e) => {
                                  if (e.target.value === 'new') {
                                    setShowNewCategoryForm(true);
                                  } else {
                                    handleInputChange('category_id', e.target.value);
                                  }
                                }}
                              >
                                <option value="">Select category</option>
                                {categories.map((category) => (
                                  <option key={category.id} value={category.id}>
                                    {category.name}
                                  </option>
                                ))}
                                <option value="new" className="font-medium text-green-600">
                                  ➕ Add New Category
                                </option>
                              </select>
                              {formErrors.category_id && (
                                <p className="text-red-500 text-sm mt-1">{formErrors.category_id}</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-green-900">Add New Category</h4>
                                <button
                                  type="button"
                                  onClick={() => setShowNewCategoryForm(false)}
                                  className="text-green-600 hover:text-green-800 text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="block text-xs font-medium text-green-800 mb-1">Name *</label>
                                  <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="Category name"
                                    value={newCategoryData.name}
                                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, name: e.target.value }))}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-green-800 mb-1">Description</label>
                                  <textarea
                                    className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                                    placeholder="Category description"
                                    rows={2}
                                    value={newCategoryData.description}
                                    onChange={(e) => setNewCategoryData(prev => ({ ...prev, description: e.target.value }))}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCreateCategory}
                                  disabled={isCreatingCategory}
                                  className={`w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isCreatingCategory
                                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                      : 'bg-green-600 text-white hover:bg-green-700'
                                  }`}
                                >
                                  {isCreatingCategory ? (
                                    <>
                                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                                      Creating...
                                    </>
                                  ) : (
                                    'Create Category'
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                                                  <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                            <div className="relative">
                              <span className="absolute left-3 top-2 text-gray-500">₦</span>
                              <input
                                type="number"
                                step="0.01"
                                className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                  formErrors.price ? 'border-red-500' : 'border-gray-300'
                                }`}
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                              />
                            </div>
                            {formErrors.price && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.price}</p>
                            )}
                          </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="978-0-000-00000-0"
                            value={formData.isbn}
                            onChange={(e) => handleInputChange('isbn', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Publication Date</label>
                          <input
                            type="date"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={formData.publication_date}
                            onChange={(e) => handleInputChange('publication_date', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                          <select 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                            value={formData.language}
                            onChange={(e) => handleInputChange('language', e.target.value)}
                          >
                            <option value="English">English</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Italian">Italian</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Pages</label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Number of pages"
                            value={formData.pages}
                            onChange={(e) => handleInputChange('pages', e.target.value)}
                          />
                        </div>
                        {/* Publisher field - only show for physical books */}
                        {bookType === 'physical' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Publisher *</label>
                            <input
                              type="text"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.publisher ? 'border-red-500' : 'border-gray-300'
                              }`}
                              placeholder="Publisher name"
                              value={formData.publisher}
                              onChange={(e) => handleInputChange('publisher', e.target.value)}
                              required
                            />
                            {formErrors.publisher && (
                              <p className="text-red-500 text-sm mt-1">{formErrors.publisher}</p>
                            )}
                          </div>
                        )}
                        {/* Stock quantity - only show for physical books */}
                        {bookType === 'physical' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity (Optional)</label>
                            <input
                              type="number"
                              value={formData.stock_quantity}
                              onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Available units (optional)"
                              min="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">Leave empty if inventory is not tracked</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter book description"
                          maxLength={500}
                          value={formData.description}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                      </div>
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image *</label>
                        <input
                          type="file"
                          accept="image/*"
                          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            formErrors.cover_image ? 'border-red-500' : 'border-gray-300'
                          }`}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleFileChange('cover_image', file);
                            }
                          }}
                          required
                        />
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500">Supported: JPG, PNG, WebP (Max 5MB)</p>
                          {formData.cover_image && (
                            <div className="flex items-center space-x-2">
                              <i className="ri-file-image-line text-blue-600"></i>
                              <span className="text-sm text-gray-700">{formData.cover_image.name}</span>
                              <span className="text-xs text-gray-500">
                                ({(formData.cover_image.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                          )}
                          {fileValidation.cover_image && (
                            <p className={`text-xs ${fileValidation.cover_image.valid ? 'text-green-600' : 'text-red-500'}`}>
                              {fileValidation.cover_image.message}
                            </p>
                          )}
                          {formErrors.cover_image && (
                            <p className="text-red-500 text-sm">{formErrors.cover_image}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Type-specific Information */}
                    {bookType === 'ebook' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-blue-900 mb-4">Digital Content Settings</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ebook File *</label>
                            <input
                              type="file"
                              accept=".epub,.pdf,.mobi"
                              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                formErrors.ebook_file ? 'border-red-500' : 'border-gray-300'
                              }`}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileChange('ebook_file', file);
                                }
                              }}
                              required
                            />
                            <div className="mt-2 space-y-1">
                              <p className="text-xs text-gray-500">Supported: EPUB, PDF, MOBI (Max 50MB)</p>
                              {formData.ebook_file && (
                                <div className="flex items-center space-x-2">
                                  <i className="ri-file-text-line text-blue-600"></i>
                                  <span className="text-sm text-gray-700">{formData.ebook_file.name}</span>
                                  <span className="text-xs text-gray-500">
                                    ({(formData.ebook_file.size / 1024 / 1024).toFixed(2)} MB)
                                  </span>
                                </div>
                              )}
                              {fileValidation.ebook_file && (
                                <p className={`text-xs ${fileValidation.ebook_file.valid ? 'text-green-600' : 'text-red-500'}`}>
                                  {fileValidation.ebook_file.message}
                                </p>
                              )}
                              {formErrors.ebook_file && (
                                <p className="text-red-500 text-sm">{formErrors.ebook_file}</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">File Size (MB)</label>
                            <input
                              type="number"
                              step="0.1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Auto-calculated"
                              readOnly
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">DRM Protection</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                              <option value="none">No DRM Protection</option>
                              <option value="basic">Basic DRM</option>
                              <option value="advanced">Advanced DRM</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sample Preview</label>
                            <input
                              type="file"
                              accept=".epub,.pdf,.mobi"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">Optional: First few chapters for preview</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Encryption Level</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8">
                              <option value="low">Low Security</option>
                              <option value="medium">Medium Security</option>
                              <option value="high">High Security</option>
                            </select>
                          </div>
                        </div>

                      </div>
                    )}

                    {bookType === 'physical' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-4">Physical Book Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Book Format *</label>
                            <select 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                              value={formData.format}
                              onChange={(e) => handleInputChange('format', e.target.value)}
                            >
                              <option value="hardcover">Hardcover</option>
                              <option value="paperback">Paperback</option>
                              <option value="mass_market">Mass Market Paperback</option>
                              <option value="spiral_bound">Spiral Bound</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Print Quality</label>
                            <select 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                              value={formData.print_quality || 'standard'}
                              onChange={(e) => handleInputChange('print_quality', e.target.value)}
                            >
                              <option value="standard">Standard</option>
                              <option value="premium">Premium</option>
                              <option value="luxury">Luxury</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Condition</label>
                            <select 
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                              value={formData.condition || 'new'}
                              onChange={(e) => handleInputChange('condition', e.target.value)}
                            >
                              <option value="new">New</option>
                              <option value="like_new">Like New</option>
                              <option value="good">Good</option>
                              <option value="fair">Fair</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {modalType === 'category' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Category Information</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter category name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          placeholder="Enter category description"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {modalType === 'author' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Author Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter author name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="author@example.com"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Biography</label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        placeholder="Enter author biography"
                      />
                    </div>
                  </div>
                )}

                {/* User Feedback Section */}
                {(generalError || successMessage || uploadProgress > 0) && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    {/* Progress Bar */}
                    {uploadProgress > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                          </span>
                          <span className="text-sm text-gray-500">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center">
                          <i className="ri-check-line text-green-600 text-lg mr-2"></i>
                          <p className="text-green-800 font-medium">{successMessage}</p>
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {generalError && (
                      <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center">
                          <i className="ri-error-warning-line text-red-600 text-lg mr-2"></i>
                          <p className="text-red-800">{generalError}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-6 py-2 text-white rounded-lg whitespace-nowrap ${
                      isSubmitting 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Creating...
                      </>
                    ) : (
                      `Create ${modalType.charAt(0).toUpperCase() + modalType.slice(1)}`
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Book Modal */}
      {showViewModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Book Cover */}
                <div className="lg:col-span-1">
                  <img 
                    src={selectedBook.cover_image_url} 
                    alt={selectedBook.title} 
                    className="w-full h-96 object-cover rounded-lg shadow-md"
                  />
                </div>

                {/* Book Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedBook.title}</h3>
                    <p className="text-gray-600 mb-4">by {selectedBook.author_name}</p>
                    
                    <div className="flex items-center space-x-4 mb-4">
                      <span className="text-2xl font-bold text-green-600">₦{selectedBook.price}</span>
                      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedBook.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : selectedBook.status === 'draft'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedBook.status.charAt(0).toUpperCase() + selectedBook.status.slice(1)}
                      </span>
                      {selectedBook.is_featured && (
                        <span className="px-3 py-1 text-sm font-semibold bg-yellow-100 text-yellow-800 rounded-full">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <p className="text-gray-900">{selectedBook.category_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Format</label>
                      <p className="text-gray-900">{selectedBook.format}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
                      <p className={`${selectedBook.stock_quantity < 50 ? 'text-red-600' : 'text-gray-900'}`}>
                        {selectedBook.stock_quantity}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Created</label>
                      <p className="text-gray-900">{new Date(selectedBook.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4 pt-6 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setShowViewModal(false);
                        handleEditBook(selectedBook.id);
                      }}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Edit Book
                    </button>
                    <button
                      onClick={() => setShowViewModal(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Book Modal */}
      {showEditModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Book</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleEditSubmit}>
                {/* Basic Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          editErrors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter book title"
                        value={editFormData.title}
                        onChange={(e) => handleEditInputChange('title', e.target.value)}
                        required
                      />
                      {editErrors.title && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.title}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Author *</label>
                      <select 
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                          editErrors.author_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editFormData.author_id}
                        onChange={(e) => handleEditInputChange('author_id', e.target.value)}
                      >
                        <option value="">Select author</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.id}>
                            {author.name}
                          </option>
                        ))}
                      </select>
                      {editErrors.author_id && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.author_id}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                      <select 
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 ${
                          editErrors.category_id ? 'border-red-500' : 'border-gray-300'
                        }`}
                        value={editFormData.category_id}
                        onChange={(e) => handleEditInputChange('category_id', e.target.value)}
                      >
                        <option value="">Select category</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      {editErrors.category_id && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.category_id}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">₦</span>
                        <input
                          type="number"
                          step="0.01"
                          className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            editErrors.price ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="0.00"
                          value={editFormData.price}
                          onChange={(e) => handleEditInputChange('price', e.target.value)}
                        />
                      </div>
                      {editErrors.price && (
                        <p className="text-red-500 text-sm mt-1">{editErrors.price}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ISBN</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="978-0-000-00000-0"
                        value={editFormData.isbn}
                        onChange={(e) => handleEditInputChange('isbn', e.target.value)}
                      />
                    </div>
                    {editFormData.format === 'physical' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="0"
                          value={editFormData.stock_quantity}
                          onChange={(e) => handleEditInputChange('stock_quantity', e.target.value)}
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        value={editFormData.language}
                        onChange={(e) => handleEditInputChange('language', e.target.value)}
                      >
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Italian">Italian</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                      <select 
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        value={editFormData.format}
                        onChange={(e) => handleEditInputChange('format', e.target.value)}
                      >
                        <option value="ebook">Ebook</option>
                        <option value="physical">Physical</option>
                        <option value="audiobook">Audiobook</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Enter book description"
                    value={editFormData.description}
                    onChange={(e) => handleEditInputChange('description', e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isEditing}
                    className={`px-6 py-2 text-white rounded-lg ${
                      isEditing 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                    }`}
                  >
                    {isEditing ? (
                      <>
                        <i className="ri-loader-4-line animate-spin mr-2"></i>
                        Updating...
                      </>
                    ) : (
                      'Update Book'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && bookToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0">
                  <i className="ri-error-warning-line text-red-500 text-2xl"></i>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900">Delete Book</h3>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to delete <strong>"{bookToDelete.title}"</strong>? This action cannot be undone.
                </p>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-800 mb-2">This will permanently delete:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• The book and all its data</li>
                    <li>• All customer reviews and ratings</li>
                    <li>• Cart items containing this book</li>
                    <li>• Order history for this book</li>
                    <li>• Reading progress and library entries</li>
                    <li>• Wishlist entries</li>
                    <li>• Inventory transactions</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setBookToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteBook}
                  disabled={deletingBookId === bookToDelete.id}
                  className={`px-4 py-2 text-white rounded-lg ${
                    deletingBookId === bookToDelete.id
                      ? 'bg-red-400 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 cursor-pointer'
                  }`}
                >
                  {deletingBookId === bookToDelete.id ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Deleting...
                    </>
                  ) : (
                    'Delete Book'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Library Assignment Modal */}
      {showLibraryAssignment && selectedBookForAssignment && (
        <BulkLibraryManagement
          preSelectedBook={selectedBookForAssignment}
          onClose={() => {
            setShowLibraryAssignment(false);
            setSelectedBookForAssignment(null);
          }}
        />
      )}
    </div>
  );
}
