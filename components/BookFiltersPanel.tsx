'use client';

import React, { useState } from 'react';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface BookFilters {
  search: string;
  status: string;
  category_id: string;
  format: string;
  price_range: string;
  featured: boolean;
  bestseller: boolean;
  new_release: boolean;
  in_stock: boolean;
}

interface BookFiltersPanelProps {
  filters: BookFilters;
  onFilterChange: (filters: BookFilters) => void;
  categories: any[];
  authors: any[];
}

export default function BookFiltersPanel({
  filters,
  onFilterChange,
  categories,
  authors
}: BookFiltersPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilter = (key: keyof BookFilters, value: any) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({
      search: '',
      status: '',
      category_id: '',
      format: '',
      price_range: '',
      featured: false,
      bestseller: false,
      new_release: false,
      in_stock: false
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== '' && value !== false
  );

  const priceRanges = [
    { value: '', label: 'All Prices' },
    { value: '0-10', label: 'Under $10' },
    { value: '10-25', label: '$10 - $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-100', label: '$50 - $100' },
    { value: '100+', label: 'Over $100' }
  ];

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' },
    { value: 'out_of_stock', label: 'Out of Stock' }
  ];

  const formatOptions = [
    { value: '', label: 'All Formats' },
    { value: 'ebook', label: 'Ebook' },
    { value: 'physical', label: 'Physical' },
    { value: 'audiobook', label: 'Audiobook' },
    { value: 'both', label: 'Both' }
  ];

  return (
    <div className="p-6">
      {/* Search Bar */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search books by title, author, or ISBN..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FunnelIcon className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {Object.values(filters).filter(v => v !== '' && v !== false).length}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            <XMarkIcon className="h-4 w-4 mr-2" />
            Clear
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category_id}
                onChange={(e) => updateFilter('category_id', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Format Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Format
              </label>
              <select
                value={filters.format}
                onChange={(e) => updateFilter('format', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {formatOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Price Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <select
                value={filters.price_range}
                onChange={(e) => updateFilter('price_range', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {priceRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Checkbox Filters */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => updateFilter('featured', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Featured Only</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.bestseller}
                  onChange={(e) => updateFilter('bestseller', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Bestsellers</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.new_release}
                  onChange={(e) => updateFilter('new_release', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">New Releases</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.in_stock}
                  onChange={(e) => updateFilter('in_stock', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">In Stock Only</span>
              </label>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: {filters.search}
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Status: {statusOptions.find(s => s.value === filters.status)?.label}
                    <button
                      onClick={() => updateFilter('status', '')}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-green-400 hover:bg-green-200 hover:text-green-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.category_id && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Category: {categories.find(c => c.id.toString() === filters.category_id)?.name}
                    <button
                      onClick={() => updateFilter('category_id', '')}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-purple-400 hover:bg-purple-200 hover:text-purple-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.format && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    Format: {formatOptions.find(f => f.value === filters.format)?.label}
                    <button
                      onClick={() => updateFilter('format', '')}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-orange-400 hover:bg-orange-200 hover:text-orange-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.price_range && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Price: {priceRanges.find(p => p.value === filters.price_range)?.label}
                    <button
                      onClick={() => updateFilter('price_range', '')}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-yellow-400 hover:bg-yellow-200 hover:text-yellow-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.featured && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800">
                    Featured Only
                    <button
                      onClick={() => updateFilter('featured', false)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-pink-400 hover:bg-pink-200 hover:text-pink-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.bestseller && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                    Bestsellers
                    <button
                      onClick={() => updateFilter('bestseller', false)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.new_release && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                    New Releases
                    <button
                      onClick={() => updateFilter('new_release', false)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
                
                {filters.in_stock && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                    In Stock Only
                    <button
                      onClick={() => updateFilter('in_stock', false)}
                      className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full text-emerald-400 hover:bg-emerald-200 hover:text-emerald-500"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 