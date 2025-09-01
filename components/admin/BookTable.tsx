import React from 'react';
import Image from 'next/image';

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

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedBooks.length === books.length && books.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
              </th>
              <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cover</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Category</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="w-32 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {books.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50">
                <td className="px-3 py-4">
                  <input
                    type="checkbox"
                    checked={selectedBooks.includes(book.id)}
                    onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </td>
                <td className="px-3 py-4">
                  <div className="w-10 h-14 bg-gray-100 rounded overflow-hidden relative">
                    <Image
                      src={book.cover_image_url || '/placeholder-book.jpg'}
                      alt={book.title}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                    {book.is_featured && (
                      <div className="absolute -top-1 -right-1">
                        <i className="ri-star-fill text-yellow-400 text-xs"></i>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="max-w-xs">
                    <h3 className="text-sm font-medium text-gray-900 truncate" title={book.title}>
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {book.format === 'ebook' ? 'Ebook' : 
                       book.format === 'physical' ? 'Physical' :
                       book.format === 'hybrid' ? 'Hybrid' :
                       book.format} • Stock: {book.stock_quantity}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <div className="max-w-xs">
                    <p className="text-sm text-gray-900 truncate" title={book.author_name}>
                      {book.author_name}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4 hidden lg:table-cell">
                  <div className="max-w-xs">
                    <p className="text-xs text-gray-600 truncate" title={book.category_name}>
                      {book.category_name}
                    </p>
                  </div>
                </td>
                <td className="px-3 py-4">
                  <span className="text-sm font-medium text-green-600">
                    ₦{book.price.toLocaleString()}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    book.status === 'published' ? 'bg-green-100 text-green-800' :
                    book.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {book.status}
                  </span>
                </td>
                <td className="px-3 py-4">
                  <div className="flex items-center gap-1">
                    <div className="relative group">
                      <button
                        onClick={() => onBookAction('toggleFeature', book)}
                        className={`p-1 rounded border transition-colors flex items-center justify-center text-xs ${
                          book.is_featured 
                            ? 'text-yellow-700 bg-yellow-100 border-yellow-200 hover:bg-yellow-200' 
                            : 'text-gray-700 bg-gray-100 border-gray-200 hover:bg-yellow-100 hover:text-yellow-700'
                        }`}
                      >
                        ⭐
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {book.is_featured ? 'Remove from Featured' : 'Add to Featured'}
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => onBookAction('assign', book)}
                        className="p-1 text-purple-700 bg-purple-100 border border-purple-200 hover:bg-purple-200 rounded transition-colors flex items-center justify-center text-xs"
                      >
                        👥
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Assign to Users
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => onBookAction('edit', book)}
                        className="p-1 text-blue-700 bg-blue-100 border border-blue-200 hover:bg-blue-200 rounded transition-colors flex items-center justify-center text-xs"
                      >
                        ✏️
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Edit Book
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => onBookAction('view', book)}
                        className="p-1 text-gray-700 bg-gray-100 border border-gray-200 hover:bg-gray-200 rounded transition-colors flex items-center justify-center text-xs"
                      >
                        👁️
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        View Details
                      </div>
                    </div>
                    <div className="relative group">
                      <button
                        onClick={() => onBookAction('delete', book)}
                        className="p-1 text-red-700 bg-red-100 border border-red-200 hover:bg-red-200 rounded transition-colors flex items-center justify-center text-xs"
                      >
                        🗑️
                      </button>
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        Delete Book
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                  <Image
                    src={book.cover_image_url || '/placeholder-book.jpg'}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="56px"
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
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      by {book.author_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500 truncate">
                        {book.category_name}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {book.format === 'ebook' ? 'Ebook' : 
                         book.format === 'physical' ? 'Physical' :
                         book.format === 'hybrid' ? 'Hybrid' :
                         book.format}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        Stock: {book.stock_quantity}
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
                <div className="flex items-center justify-center gap-1 mt-3 pt-2 border-t border-gray-100 flex-wrap">
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
                    onClick={() => onBookAction('assign', book)}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex-shrink-0"
                    title="Assign to Users"
                  >
                    <i className="ri-user-add-line text-sm"></i>
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
  );
}