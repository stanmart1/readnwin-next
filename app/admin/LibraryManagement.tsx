'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import Modal from '@/components/ui/Modal';

interface UserLibrary {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  book_id: number;
  book_title: string;
  book_author: string;
  assigned_at: string;
  progress: number;
  last_read: string;
  status: 'active' | 'completed' | 'paused';
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

interface Book {
  id: number;
  title: string;
  author_name: string;
}

export default function LibraryManagement() {
  const [libraries, setLibraries] = useState<UserLibrary[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    user_id: undefined as number | undefined
  });

  useEffect(() => {
    loadData();
    loadUsersAndBooks();
  }, [pagination.page, filters.search, filters.status, filters.user_id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: filters.search,
        status: filters.status
      });
      if (filters.user_id) params.append('user_id', filters.user_id.toString());

      const response = await fetch(`/api/admin/user-libraries?${params}`);
      if (!response.ok) throw new Error('Failed to load libraries');
      const result = await response.json();

      setLibraries(result.libraries || []);
      if (result.pagination) {
        setPagination(prev => ({
          ...prev,
          total: result.pagination.total || 0,
          pages: result.pagination.pages || 0
        }));
      }
    } catch (error) {
      console.error('Failed to load libraries:', error);
      toast.error('Failed to load user libraries');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersAndBooks = async () => {
    try {
      const [usersResponse, booksResponse] = await Promise.all([
        fetch('/api/admin/users?limit=1000'),
        fetch('/api/admin/books?limit=1000')
      ]);

      if (usersResponse.ok) {
        const usersResult = await usersResponse.json();
        setUsers(usersResult.users || []);
      }

      if (booksResponse.ok) {
        const booksResult = await booksResponse.json();
        setBooks(booksResult.books || []);
      }
    } catch (error) {
      console.error('Failed to load users/books:', error);
    }
  };

  const handleAssignBook = async () => {
    if (!selectedUser || !selectedBook) {
      toast.error('Please select both user and book');
      return;
    }

    try {
      const response = await fetch('/api/admin/user-libraries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser,
          book_id: selectedBook
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to assign book');
      }

      toast.success('Book assigned successfully!');
      setShowAssignModal(false);
      setSelectedUser(null);
      setSelectedBook(null);
      loadData();
    } catch (error) {
      console.error('Assignment error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to assign book');
    }
  };

  const handleRemoveAssignment = async (libraryId: number) => {
    if (!confirm('Are you sure you want to remove this book assignment?')) return;

    try {
      const response = await fetch(`/api/admin/user-libraries/${libraryId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to remove assignment');

      toast.success('Assignment removed successfully!');
      loadData();
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove assignment');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Library Management</h2>
        <p className="text-gray-600 mt-1">Manage user book assignments and reading progress</p>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by user name, email, or book title..."
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
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={filters.user_id || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, user_id: e.target.value ? parseInt(e.target.value) : undefined }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end">
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <i className="ri-add-line"></i>
            Assign Book
          </button>
        </div>
      </div>

      {/* Libraries Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Read
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="animate-pulse bg-gray-200 h-4 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : libraries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <i className="ri-book-line text-4xl text-gray-400 mb-4 block"></i>
                    <h3 className="text-lg font-medium text-gray-900">No assignments found</h3>
                    <p className="text-gray-500 mt-1">Start by assigning books to users</p>
                  </td>
                </tr>
              ) : (
                libraries.map((library) => (
                  <tr key={library.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{library.user_name}</div>
                        <div className="text-sm text-gray-500">{library.user_email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{library.book_title}</div>
                        <div className="text-sm text-gray-500">by {library.book_author}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${library.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-900">{library.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        library.status === 'active' ? 'bg-green-100 text-green-800' :
                        library.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {library.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {library.last_read ? new Date(library.last_read).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(library.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleRemoveAssignment(library.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.pages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
          />
        </div>
      )}

      {/* Assign Book Modal */}
      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Book to User</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
              <select
                value={selectedUser || ''}
                onChange={(e) => setSelectedUser(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a user...</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Book</label>
              <select
                value={selectedBook || ''}
                onChange={(e) => setSelectedBook(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a book...</option>
                {books.map(book => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setShowAssignModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAssignBook}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Assign Book
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}