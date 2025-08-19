'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';

interface AboutUsSection {
  id: number;
  section: string;
  title: string;
  content: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: number;
  updated_by?: number;
}

interface SectionFormData {
  section: string;
  title: string;
  content: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
}

const DEFAULT_FORM_DATA: SectionFormData = {
  section: '',
  title: '',
  content: '',
  image_url: '',
  sort_order: 0,
  is_active: true,
};

export default function AboutUsSectionsManagement() {
  const [sections, setSections] = useState<AboutUsSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingSection, setEditingSection] = useState<AboutUsSection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<SectionFormData>(DEFAULT_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'sort_order' | 'title' | 'updated_at'>('sort_order');

  const loadSections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/about-us');

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error loading about us sections:', error);
      toast.error('Failed to load about us sections');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked :
              name === 'sort_order' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.section.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast.error('Section, title, and content are required');
      return;
    }

    setSaving(true);

    try {
      const url = editingSection ? '/api/admin/about-us' : '/api/admin/about-us';
      const method = editingSection ? 'PUT' : 'POST';
      const payload = editingSection
        ? { ...formData, id: editingSection.id }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();

      if (editingSection) {
        setSections(prev => prev.map(section =>
          section.id === editingSection.id ? result : section
        ));
        toast.success('Section updated successfully');
      } else {
        setSections(prev => [...prev, result]);
        toast.success('Section created successfully');
      }

      resetForm();
    } catch (error) {
      console.error('Error saving section:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save section');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (section: AboutUsSection) => {
    setEditingSection(section);
    setFormData({
      section: section.section,
      title: section.title,
      content: section.content,
      image_url: section.image_url || '',
      sort_order: section.sort_order,
      is_active: section.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (section: AboutUsSection) => {
    if (!confirm(`Are you sure you want to delete the "${section.title}" section?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/about-us?id=${section.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      setSections(prev => prev.filter(s => s.id !== section.id));
      toast.success('Section deleted successfully');
    } catch (error) {
      console.error('Error deleting section:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete section');
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_FORM_DATA);
    setEditingSection(null);
    setShowForm(false);
  };

  const filteredSections = sections
    .filter(section =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'sort_order':
          return a.sort_order - b.sort_order;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updated_at':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading about us sections...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">About Us Sections</h1>
          <p className="text-gray-600 mt-1">Manage the sections displayed on the about page</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Add Section
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="sort_order">Sort by Order</option>
          <option value="title">Sort by Title</option>
          <option value="updated_at">Sort by Last Updated</option>
        </select>
      </div>

      {/* Section Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  {editingSection ? 'Edit Section' : 'Add New Section'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Section Key
                    </label>
                    <input
                      type="text"
                      name="section"
                      value={formData.section}
                      onChange={handleInputChange}
                      placeholder="e.g., mission, vision, team"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={!!editingSection}
                    />
                    {editingSection && (
                      <p className="text-xs text-gray-500 mt-1">Section key cannot be changed</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      name="sort_order"
                      value={formData.sort_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Section title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder="Section content"
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL (Optional)
                  </label>
                  <input
                    type="url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    {saving ? 'Saving...' : editingSection ? 'Update Section' : 'Create Section'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Sections List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredSections.length === 0 ? (
          <div className="p-8 text-center">
            <i className="ri-information-line text-4xl text-gray-400 mb-2"></i>
            <p className="text-gray-500">No sections found</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-700 mt-2"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSections.map((section) => (
                  <tr key={section.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="ri-information-line text-blue-600"></i>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {section.section}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {section.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {section.content}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {section.sort_order}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        section.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {section.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(section.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(section)}
                          className="text-blue-600 hover:text-blue-700 p-1"
                          title="Edit section"
                        >
                          <i className="ri-edit-line"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(section)}
                          className="text-red-600 hover:text-red-700 p-1"
                          title="Delete section"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-file-list-line text-2xl text-blue-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Sections</p>
              <p className="text-lg font-semibold text-gray-900">{sections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-eye-line text-2xl text-green-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Sections</p>
              <p className="text-lg font-semibold text-gray-900">
                {sections.filter(s => s.is_active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="ri-eye-off-line text-2xl text-gray-600"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Inactive Sections</p>
              <p className="text-lg font-semibold text-gray-900">
                {sections.filter(s => !s.is_active).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
