'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import Modal from '@/components/ui/Modal';

interface Category {
  id: number;
  name: string;
  description: string;
  book_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: ''
  });

  useEffect(() => {
    loadCategories();
  }, [pagination.page, filters.search, filters.status]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status
      });

      const response = await fetch(`/api/admin/categories?${params}`);
      if (!response.ok) throw new Error('Failed to load categories');
      const result = await response.json();

      setCategories(result.categories || []);
      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total || 0,
          pages: result.pagination.pages || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save category');
      }

      toast.success(`Category ${editingCategory ? 'updated' : 'created'} successfully!`);
      setShowModal(false);
      resetForm();
      loadCategories();
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      is_active: category.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully!');
      loadCategories();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  const toggleStatus = async (categoryId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category status');
      }

      toast.success(`Category ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      loadCategories();
    } catch (error) {
      console.error('Status update error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update category status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      is_active: true
    });
    setEditingCategory(null);
  };

  const handleModalClose = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Categories Management</h2>
        <p className="text-gray-600 mt-1">Organize your books with categories</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search categories..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Add Category
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </div>
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <i className="ri-folder-line text-4xl text-gray-400 mb-4 block"></i>
            <h3 className="text-lg font-medium text-gray-900">No categories found</h3>
            <p className="text-gray-500 mt-1">Create your first category to organize books</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{category.name}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{category.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => toggleStatus(category.id, category.is_active)}
                    className={`p-1 rounded ${
                      category.is_active 
                        ? 'text-green-600 hover:bg-green-50' 
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={category.is_active ? 'Deactivate' : 'Activate'}
                  >
                    <i className={`ri-${category.is_active ? 'eye' : 'eye-off'}-line`}></i>
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">
                    <i className="ri-book-line mr-1"></i>
                    {category.book_count} books
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <span className="text-gray-500">
                  {new Date(category.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Add/Edit Category Modal */}
      <Modal isOpen={showModal} onClose={handleModalClose}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter category description"
                rows={3}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active category
              </label>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleModalClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? 'Update' : 'Create'} Category
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}