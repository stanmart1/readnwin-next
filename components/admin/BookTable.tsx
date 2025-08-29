import React from 'react';

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

interface BookTableProps {
  books: Book[];
  selectedBooks: number[];
  onSelectionChange: (bookIds: number[]) => void;
  onBookAction: (action: string, book: Book) => void;
}

export default function BookTable({ 
  books, 
  selectedBooks, 
  onSelectionChange, 
  onBookAction 
}: BookTableProps) {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(books.map(book => book.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectBook = (bookId: number, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedBooks, bookId]);
    } else {
      onSelectionChange(selectedBooks.filter(id => id !== bookId));
    }
  };

  return (
    <div className="space-y-2 xs:space-y-3">
      {/* Select All Header - Mobile Only */}
      <div className="bg-gray-50 px-3 xs:px-4 py-2 xs:py-3 rounded-lg border border-gray-200 sm:hidden">
        <label className="flex items-center gap-2 xs:gap-3">
          <input
            type="checkbox"
            checked={selectedBooks.length === books.length && books.length > 0}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-3 xs:h-4 w-3 xs:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-xs xs:text-sm font-medium text-gray-700">
            Select All ({books.length} books)
          </span>
        </label>
      </div>

      {/* Desktop Table Header */}
      <div className="hidden sm:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 md:px-6 py-3 border-b border-gray-200">
          <div className="grid grid-cols-12 lg:grid-cols-14 gap-3 md:gap-4 items-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <div className="col-span-1">
              <input
                type="checkbox"
                checked={selectedBooks.length === books.length && books.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
            </div>
            <div className="col-span-1">Cover</div>
            <div className="col-span-3 lg:col-span-2">Title</div>
            <div className="col-span-2">Author</div>
            <div className="col-span-2 hidden md:block">Category</div>
            <div className="col-span-1">Price</div>
            <div className="col-span-1">Status</div>
            <div className="col-span-1 hidden lg:block">Stock</div>
            <div className="col-span-2 lg:col-span-3">Actions</div>
          </div>
        </div>

        {/* Desktop Table Body */}
        <div className="divide-y divide-gray-200">
          {books.map((book) => (
            <div key={book.id} className="px-4 md:px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="grid grid-cols-12 lg:grid-cols-14 gap-3 md:gap-4 items-center">
                {/* Checkbox */}
                <div className="col-span-1 flex justify-center">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>

                {/* Cover Image */}
                <div className="col-span-1 flex justify-center">
                  <div className="w-12 h-16 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
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
                <div className="col-span-3 lg:col-span-2 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 leading-tight truncate" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-xs text-gray-500 capitalize mt-1">{book.format}</p>
                </div>

                {/* Author */}
                <div className="col-span-2 min-w-0">
                  <p className="text-sm text-gray-900 leading-tight truncate" title={book.author_name}>
                    {book.author_name}
                  </p>
                </div>

                {/* Category - Hidden on small screens */}
                <div className="col-span-2 hidden md:block min-w-0">
                  <p className="text-sm text-gray-900 leading-tight truncate" title={book.category_name}>
                    {book.category_name}
                  </p>
                </div>

                {/* Price */}
                <div className="col-span-1 text-right">
                  <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                    ₦{book.price.toLocaleString()}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                    book.status === 'published' ? 'bg-green-100 text-green-800' :
                    book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status}
                  </span>
                </div>

                {/* Stock - Hidden on medium screens */}
                <div className="col-span-1 hidden lg:block text-center">
                  <span className="text-sm text-gray-900">{book.stock_quantity}</span>
                </div>

                {/* Actions */}
                <div className="col-span-2 lg:col-span-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button
                      onClick={() => onBookAction('toggleFeature', book)}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        book.is_featured 
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={book.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                    >
                      <i className="ri-star-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('edit', book)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                      title="Edit Book"
                    >
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('view', book)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                      title="View Details"
                    >
                      <i className="ri-eye-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('delete', book)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
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

      {/* Mobile Card Layout */}
      <div className="sm:hidden space-y-2 xs:space-y-3">
        {books.map((book) => (
          <div key={book.id} className="bg-white rounded-lg border border-gray-200 p-3 xs:p-4">
            <div className="flex items-start gap-2 xs:gap-3">
              {/* Checkbox */}
              <input
                type="checkbox"
                checked={selectedBooks.includes(book.id)}
                onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                className="h-3 xs:h-4 w-3 xs:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
              />

              {/* Cover Image */}
              <div className="flex-shrink-0">
                <div className="w-12 xs:w-14 h-15 xs:h-17 bg-gray-100 rounded overflow-hidden relative">
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

              {/* Book Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      by {book.author_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate max-w-24">
                        {book.category_name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {book.format}
                      </span>
                    </div>
                  </div>
                  
                  {/* Price and Status */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-sm font-medium text-green-600 whitespace-nowrap">
                      ₦{book.price.toLocaleString()}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${
                      book.status === 'published' ? 'bg-green-100 text-green-800' :
                      book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {book.status}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onBookAction('toggleFeature', book)}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        book.is_featured 
                          ? 'text-yellow-600 bg-yellow-50 hover:bg-yellow-100' 
                          : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50'
                      }`}
                      title={book.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                    >
                      <i className="ri-star-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('toggleStatus', book)}
                      className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                        book.status === 'published'
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                      }`}
                      title={book.status === 'published' ? 'Deactivate' : 'Activate'}
                    >
                      <i className={`text-sm ${book.status === 'published' ? 'ri-toggle-line' : 'ri-toggle-fill'}`}></i>
                    </button>
                    <button
                      onClick={() => onBookAction('edit', book)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex-shrink-0"
                      title="Edit Book"
                    >
                      <i className="ri-edit-line text-sm"></i>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onBookAction('assign', book)}
                      className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
                      title="Assign to User"
                    >
                      <i className="ri-user-add-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('view', book)}
                      className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors flex-shrink-0"
                      title="View Details"
                    >
                      <i className="ri-eye-line text-sm"></i>
                    </button>
                    <button
                      onClick={() => onBookAction('delete', book)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                      title="Delete Book"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                  </div>
                </div>

                {/* Stock info for mobile */}
                <div className="mt-2 pt-1">
                  <span className="text-xs text-gray-500">
                    Stock: {book.stock_quantity}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}