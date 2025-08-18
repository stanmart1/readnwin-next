'use client';

import React, { useState } from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  EyeIcon,
  StarIcon,
  ArchiveBoxIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

interface Book {
  id: number;
  title: string;
  subtitle?: string;
  author_name: string;
  category_name: string;
  price: number;
  original_price?: number;
  format: string;
  status: string;
  stock_quantity: number;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_release: boolean;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
}

interface BookDataTableProps {
  books: Book[];
  loading: boolean;
  selectedBooks: number[];
  onSelectionChange: (selectedIds: number[]) => void;
  onEdit: (bookId: number) => void;
  onDelete: (bookId: number) => void;
  onRefresh: () => void;
}

export default function BookDataTable({
  books,
  loading,
  selectedBooks,
  onSelectionChange,
  onEdit,
  onDelete,
  onRefresh
}: BookDataTableProps) {
  const [sortField, setSortField] = useState<keyof Book>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Book) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

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

  const sortedBooks = [...books].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue && bValue && aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue && bValue && aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      published: { color: 'bg-green-100 text-green-800', label: 'Published' },
      archived: { color: 'bg-yellow-100 text-yellow-800', label: 'Archived' },
      out_of_stock: { color: 'bg-red-100 text-red-800', label: 'Out of Stock' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getFormatBadge = (format: string) => {
    const formatConfig = {
      ebook: { color: 'bg-blue-100 text-blue-800', label: 'Ebook' },
      physical: { color: 'bg-purple-100 text-purple-800', label: 'Physical' },
      audiobook: { color: 'bg-orange-100 text-orange-800', label: 'Audiobook' },
      both: { color: 'bg-indigo-100 text-indigo-800', label: 'Both' }
    };

    const config = formatConfig[format as keyof typeof formatConfig] || formatConfig.ebook;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const SortableHeader = ({ field, children }: { field: keyof Book; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="group inline-flex items-center text-left font-medium text-gray-900 hover:text-gray-700"
    >
      {children}
      <span className="ml-2 flex-none rounded text-gray-400 group-hover:visible">
        {sortField === field ? (
          sortDirection === 'asc' ? '↑' : '↓'
        ) : (
          <span className="invisible group-hover:visible">↕</span>
        )}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-4 h-4 bg-gray-200 rounded"></div>
              <div className="w-12 h-16 bg-gray-200 rounded"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="w-20 h-4 bg-gray-200 rounded"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
              <div className="w-24 h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3">
              <input
                type="checkbox"
                checked={selectedBooks.length === books.length && books.length > 0}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Book
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="author_name">Author</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="category_name">Category</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="format">Format</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="price">Price</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="stock_quantity">Stock</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="status">Status</SortableHeader>
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <SortableHeader field="created_at">Created</SortableHeader>
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedBooks.map((book) => (
            <tr key={book.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={selectedBooks.includes(book.id)}
                  onChange={(e) => handleSelectBook(book.id, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-12 w-8">
                    {book.cover_image_url ? (
                      <img
                        className="h-12 w-8 object-cover rounded"
                        src={book.cover_image_url}
                        alt={book.title}
                      />
                    ) : (
                      <div className="h-12 w-8 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">📚</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {book.title}
                    </div>
                    {book.subtitle && (
                      <div className="text-sm text-gray-500">{book.subtitle}</div>
                    )}
                    <div className="flex items-center space-x-2 mt-1">
                      {book.is_featured && (
                        <StarIcon className="w-4 h-4 text-yellow-500" />
                      )}
                      {book.is_bestseller && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Bestseller
                        </span>
                      )}
                      {book.is_new_release && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {book.author_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {book.category_name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getFormatBadge(book.format)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div>
                  <div className="font-medium">{formatPrice(book.price)}</div>
                  {book.original_price && book.original_price > book.price && (
                    <div className="text-xs text-gray-500 line-through">
                      {formatPrice(book.original_price)}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  <span className={book.stock_quantity === 0 ? 'text-red-600' : 'text-gray-900'}>
                    {book.stock_quantity}
                  </span>
                  {book.stock_quantity === 0 && (
                    <span className="ml-2 text-xs text-red-600">Out of stock</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getStatusBadge(book.status)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(book.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEdit(book.id)}
                    className="text-blue-600 hover:text-blue-900"
                    title="Edit book"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => window.open(`/book/${book.id}`, '_blank')}
                    className="text-gray-600 hover:text-gray-900"
                    title="View book"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(book.id)}
                    className="text-red-600 hover:text-red-900"
                    title="Delete book"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {books.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
          <p className="text-gray-500 mb-4">
            Get started by adding your first book to the catalog.
          </p>
          <button
            onClick={onRefresh}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
} 