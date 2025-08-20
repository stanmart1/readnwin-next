'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

interface ModernBookUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  authors: Array<{ id: number; name: string }>;
  categories: Array<{ id: number; name: string }>;
}

interface BookFormData {
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
  track_inventory: boolean;
  cover_image: File | null;
  ebook_file: File | null;
}

export default function ModernBookUploadModal({
  isOpen,
  onClose,
  onSuccess,
  authors,
  categories
}: ModernBookUploadModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<BookFormData>({
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
    stock_quantity: '0',
    track_inventory: true,
    cover_image: null,
    ebook_file: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dragActive, setDragActive] = useState({ cover: false, ebook: false });
  const [isParsingEbook, setIsParsingEbook] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const ebookInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: keyof BookFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileChange = async (field: 'cover_image' | 'ebook_file', file: File) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Parse ebook file to extract pages
    if (field === 'ebook_file' && file.type === 'application/epub+zip') {
      await parseEbookFile(file);
    }
  };

  const parseEbookFile = async (file: File) => {
    setIsParsingEbook(true);
    try {
      const formData = new FormData();
      formData.append('ebook_file', file);
      
      const response = await fetch('/api/admin/books/parse-ebook', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.pages) {
          setFormData(prev => ({ ...prev, pages: result.pages.toString() }));
          toast.success(`Extracted ${result.pages} pages from ebook`);
        }
      }
    } catch (error) {
      console.error('Error parsing ebook:', error);
    } finally {
      setIsParsingEbook(false);
    }
  };

  const handleDrag = (e: React.DragEvent, type: 'cover' | 'ebook') => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(prev => ({ ...prev, [type]: true }));
    } else if (e.type === 'dragleave') {
      setDragActive(prev => ({ ...prev, [type]: false }));
    }
  };

  const handleDrop = async (e: React.DragEvent, type: 'cover' | 'ebook') => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(prev => ({ ...prev, [type]: false }));
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const field = type === 'cover' ? 'cover_image' : 'ebook_file';
      await handleFileChange(field, files[0]);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (!formData.author_id) newErrors.author_id = 'Author is required';
      if (!formData.category_id) newErrors.category_id = 'Category is required';
      if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    }

    if (step === 2) {
      if (!formData.cover_image) newErrors.cover_image = 'Cover image is required';
      if (formData.format === 'ebook' && !formData.ebook_file) {
        newErrors.ebook_file = 'Ebook file is required for digital books';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const submitData = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key !== 'cover_image' && key !== 'ebook_file' && value !== null) {
          submitData.append(key, String(value));
        }
      });

      // Add files
      if (formData.cover_image) {
        submitData.append('cover_image', formData.cover_image);
      }
      if (formData.ebook_file) {
        submitData.append('ebook_file', formData.ebook_file);
      }

      // Set book type based on format
      submitData.append('book_type', formData.format);

      console.log('📤 Submitting book data...');
      setUploadProgress(25);

      const response = await fetch('/api/admin/books', {
        method: 'POST',
        body: submitData,
        credentials: 'include'
      });

      setUploadProgress(75);

      const result = await response.json();
      
      if (response.ok && result.success) {
        setUploadProgress(100);
        toast.success('Book uploaded successfully!');
        
        // Show success for a moment then close
        setTimeout(() => {
          onSuccess();
          resetForm();
        }, 1500);
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
      stock_quantity: '0',
      track_inventory: true,
      cover_image: null,
      ebook_file: null
    });
    setErrors({});
    setCurrentStep(1);
    setUploadProgress(0);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      className="rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden"
      closeOnOutsideClick={!isSubmitting}
    >
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Book</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Step {currentStep} of 2 - {currentStep === 1 ? 'Book Information' : 'Upload Files'}
          </p>
        </div>
      </div>

        {/* Progress Bar */}
        <div className="px-4 sm:px-6 py-3">
          <div className="flex items-center space-x-2 mb-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>1</div>
            <div className={`flex-1 h-1 rounded-full ${
              currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
            }`}></div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
            }`}>2</div>
          </div>
          <div className="flex justify-between text-xs text-gray-600">
            <span>Book Details</span>
            <span>Upload Files</span>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 overflow-y-auto max-h-[calc(95vh-220px)]">
          {currentStep === 1 && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Title */}
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Book Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="Enter the book title"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1 flex items-center"><i className="ri-error-warning-line mr-1"></i>{errors.title}</p>}
                </div>

                {/* Author */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Author *
                  </label>
                  <select
                    value={formData.author_id}
                    onChange={(e) => handleInputChange('author_id', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white ${
                      errors.author_id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select an author</option>
                    {authors.map(author => (
                      <option key={author.id} value={author.id}>
                        {author.name}
                      </option>
                    ))}
                  </select>
                  {errors.author_id && <p className="text-red-500 text-sm mt-1 flex items-center"><i className="ri-error-warning-line mr-1"></i>{errors.author_id}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => handleInputChange('category_id', e.target.value)}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none bg-white ${
                      errors.category_id ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && <p className="text-red-500 text-sm mt-1 flex items-center"><i className="ri-error-warning-line mr-1"></i>{errors.category_id}</p>}
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (₦) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.price ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                {/* Format */}
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-2">
                    Book Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleInputChange('format', 'ebook')}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.format === 'ebook'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <i className="ri-smartphone-line text-xl mb-1 block"></i>
                      <span className="text-sm font-medium">Digital Ebook</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('format', 'physical')}
                      className={`p-3 rounded-xl border-2 transition-all text-center ${
                        formData.format === 'physical'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <i className="ri-book-line text-xl mb-1 block"></i>
                      <span className="text-sm font-medium">Physical Book</span>
                    </button>
                  </div>
                </div>

                {/* ISBN */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <input
                    type="text"
                    value={formData.isbn}
                    onChange={(e) => handleInputChange('isbn', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="978-0-000-00000-0"
                  />
                </div>

                {/* Pages */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pages {isParsingEbook && <span className="text-blue-600">(Parsing...)</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={formData.pages}
                      onChange={(e) => handleInputChange('pages', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Number of pages"
                      disabled={isParsingEbook}
                    />
                    {isParsingEbook && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Publisher (for physical books) */}
                {formData.format === 'physical' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Publisher
                    </label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) => handleInputChange('publisher', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Publisher name"
                    />
                  </div>
                )}

                {/* Inventory Management (for physical books) */}
                {formData.format === 'physical' && (
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Inventory Management
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.track_inventory}
                          onChange={(e) => handleInputChange('track_inventory', e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.track_inventory ? 'bg-blue-600' : 'bg-gray-200'
                        }`}>
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.track_inventory ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {formData.track_inventory ? 'Track inventory' : 'Don\'t track inventory'}
                        </span>
                      </label>
                    </div>
                    
                    {formData.track_inventory && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stock Quantity
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.stock_quantity}
                          onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Available units"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter book description..."
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              {/* Cover Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Cover Image *
                </label>
                <div
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragActive.cover
                      ? 'border-blue-400 bg-blue-50'
                      : formData.cover_image
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-300 hover:border-gray-400'
                  } ${errors.cover_image ? 'border-red-400' : ''}`}
                  onDragEnter={(e) => handleDrag(e, 'cover')}
                  onDragLeave={(e) => handleDrag(e, 'cover')}
                  onDragOver={(e) => handleDrag(e, 'cover')}
                  onDrop={(e) => handleDrop(e, 'cover')}
                  onClick={() => coverInputRef.current?.click()}
                >
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileChange('cover_image', e.target.files[0])}
                    className="hidden"
                  />
                  
                  {formData.cover_image ? (
                    <div className="space-y-3">
                      <i className="ri-image-line text-4xl text-green-600"></i>
                      <div>
                        <p className="font-medium text-green-800">{formData.cover_image.name}</p>
                        <p className="text-sm text-green-600">
                          {(formData.cover_image.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, cover_image: null }));
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <i className="ri-image-add-line text-4xl text-gray-400"></i>
                      <div>
                        <p className="text-lg font-medium text-gray-700">
                          Drop cover image here or click to browse
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports JPG, PNG, WebP (Max 5MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {errors.cover_image && <p className="text-red-500 text-sm mt-2">{errors.cover_image}</p>}
              </div>

              {/* Ebook File Upload (only for digital books) */}
              {formData.format === 'ebook' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3">
                    Ebook File *
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                      dragActive.ebook
                        ? 'border-blue-400 bg-blue-50 scale-[1.02]'
                        : formData.ebook_file
                        ? 'border-green-400 bg-green-50'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50/30'
                    } ${errors.ebook_file ? 'border-red-400 bg-red-50' : ''}`}
                    onDragEnter={(e) => handleDrag(e, 'ebook')}
                    onDragLeave={(e) => handleDrag(e, 'ebook')}
                    onDragOver={(e) => handleDrag(e, 'ebook')}
                    onDrop={(e) => handleDrop(e, 'ebook')}
                    onClick={() => ebookInputRef.current?.click()}
                  >
                    <input
                      ref={ebookInputRef}
                      type="file"
                      accept=".epub,.html,.htm"
                      onChange={async (e) => e.target.files?.[0] && await handleFileChange('ebook_file', e.target.files[0])}
                      className="hidden"
                    />
                    
                    {formData.ebook_file ? (
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                          <i className="ri-file-text-line text-2xl text-green-600"></i>
                        </div>
                        <div>
                          <p className="font-semibold text-green-800">{formData.ebook_file.name}</p>
                          <p className="text-sm text-green-600">
                            {(formData.ebook_file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({ ...prev, ebook_file: null }));
                          }}
                          className="inline-flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <i className="ri-delete-bin-line mr-1"></i>
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-upload-cloud-line text-2xl text-blue-600"></i>
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-800">
                            Drop ebook file here or click to browse
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Supports EPUB, HTML (Max 50MB)
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {errors.ebook_file && <p className="text-red-500 text-sm mt-2 flex items-center"><i className="ri-error-warning-line mr-1"></i>{errors.ebook_file}</p>}
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-800">
                      {uploadProgress < 100 ? 'Uploading...' : 'Complete!'}
                    </span>
                    <span className="text-sm text-blue-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-4 border-t border-gray-100 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all"
                >
                  <i className="ri-arrow-left-line mr-2"></i>
                  Previous
                </button>
              )}
            </div>

            <div className="flex space-x-3 w-full sm:w-auto">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 transition-all"
              >
                Cancel
              </button>
              
              {currentStep < 2 ? (
                <button
                  onClick={handleNext}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all"
                >
                  Next Step
                  <i className="ri-arrow-right-line ml-2"></i>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="ri-upload-cloud-line mr-2"></i>
                      Upload Book
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
    </Modal>
  );
}