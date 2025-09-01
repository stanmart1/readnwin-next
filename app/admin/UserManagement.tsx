
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDate } from '@/utils/dateUtils';
import { useNotifications } from '@/components/ui/Notification';
import { LoadingSpinner, LoadingButton } from '@/components/ui/LoadingSpinner';
import Modal from '@/components/ui/Modal';
import UserReadingAnalytics from './UserReadingAnalytics';
import UserLibraryManagement from './UserLibraryManagement';
import BulkLibraryManagement from './BulkLibraryManagement';

interface User {
  id: number;
  email: string;
  username: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  status: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login?: string;
  roles?: Array<{
    id: number;
    name: string;
    display_name: string;
    description?: string;
    priority: number;
    is_system_role: boolean;
    created_at: string;
  }>;
}

interface UserRole {
  id: number;
  role_id: number;
  role: {
    id: number;
    name: string;
    display_name: string;
  };
}

interface ApiResponse {
  success: boolean;
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export default function UserManagement() {
  const { data: session } = useSession();
  const { addNotification } = useNotifications();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingUserRoles, setEditingUserRoles] = useState<number[]>([]);
  const [creatingUser, setCreatingUser] = useState({
    email: '',
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    role_id: ''
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showUserReadingAnalytics, setShowUserReadingAnalytics] = useState(false);
  const [selectedUserForAnalytics, setSelectedUserForAnalytics] = useState<number | null>(null);
  const [showUserLibraryManagement, setShowUserLibraryManagement] = useState(false);
  const [selectedUserForLibrary, setSelectedUserForLibrary] = useState<number | null>(null);
  const [showBulkLibraryManagement, setShowBulkLibraryManagement] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  
  // Loading states for different actions
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [createUserLoading, setCreateUserLoading] = useState(false);
  const [editUserLoading, setEditUserLoading] = useState(false);
  const [passwordUpdateLoading, setPasswordUpdateLoading] = useState(false);

  // Fetch users
  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterRole !== 'all') params.append('role', filterRole);

      const response = await fetch(`/api/admin/users?${params}`);
      
      // Check if response is ok and has content
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Users API error response:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
      }
      
      // Check if response has content before parsing JSON
      const responseText = await response.text();
      if (!responseText) {
        throw new Error('Empty response from server');
      }
      
      let data: ApiResponse;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError, 'Response text:', responseText);
        throw new Error('Invalid JSON response from server');
      }

      if (data.success) {
        // Fetch roles for each user
        const usersWithRoles = await Promise.all(
          data.users.map(async (user) => {
            try {
              const rolesResponse = await fetch(`/api/admin/users/${user.id}/roles`);
              const rolesData = await rolesResponse.json();
              return {
                ...user,
                roles: rolesData.success ? rolesData.roles.map((userRole: any) => ({
                  id: userRole.role?.id || userRole.role_id,
                  name: userRole.role?.name || userRole.role_name,
                  display_name: userRole.role?.display_name || userRole.role_display_name,
                  description: userRole.role?.description || userRole.role_description,
                  priority: userRole.role?.priority || userRole.role_priority || 0,
                  is_system_role: userRole.role?.is_system_role || userRole.role_is_system_role || false,
                  created_at: userRole.role?.created_at || userRole.role_created_at
                })) : []
              };
            } catch (error) {
              console.error(`Error fetching roles for user ${user.id}:`, error);
              return {
                ...user,
                roles: []
              };
            }
          })
        );
        
        setUsers(usersWithRoles);
        setTotalPages(data.pagination.pages);
        setTotalUsers(data.pagination.total);
        setCurrentPage(data.pagination.page);
        setError('');
      } else {
        setError('Failed to fetch users');
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to fetch users'
        });
      }
    } catch (error) {
      setError('Error fetching users');
      console.error('Error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch users. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchUsers();
    fetchRoles();
  }, []);

  useEffect(() => {
    fetchUsers(1);
  }, [searchTerm, filterRole, filterStatus]);

  const handleUserAction = async (userId: number, action: string) => {
    const user = users.find(u => u.id === userId);
    const actionKey = `${action}-${userId}`;
    
    if (action === 'view' && user) {
      setSelectedUser(user);
      setShowUserModal(true);
    } else if (action === 'edit' && user) {
      setEditingUser({...user});
      setShowEditModal(true);
    } else if (action === 'delete') {
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        try {
          setActionLoading(prev => ({ ...prev, [actionKey]: true }));
          setError('');
          
          const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE'
          });
          const data = await response.json();
          
          if (data.success) {
            await fetchUsers(currentPage);
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
            setError('');
            addNotification({
              type: 'success',
              title: 'Success',
              message: `User ${user?.first_name || user?.username || 'Unknown'} has been deleted successfully.`
            });
          } else {
            setError(`Failed to delete user: ${data.error || 'Unknown error'}`);
            addNotification({
              type: 'error',
              title: 'Error',
              message: `Failed to delete user: ${data.error || 'Unknown error'}`
            });
          }
        } catch (error) {
          console.error('Error deleting user:', error);
          setError(`Error deleting user: ${error instanceof Error ? error.message : 'Network error'}`);
          addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to delete user. Please try again.'
          });
        } finally {
          setActionLoading(prev => ({ ...prev, [actionKey]: false }));
        }
      }
    } else if (action === 'reading-analytics') {
      setSelectedUserForAnalytics(userId);
      setShowUserReadingAnalytics(true);
    } else if (action === 'library-management') {
      setSelectedUserForLibrary(userId);
      setShowUserLibraryManagement(true);
    } else if (action === 'password' && user) {
      setPasswordUser(user);
      setNewPassword('');
      setShowPasswordModal(true);
    } else if (action === 'suspend' || action === 'activate') {
      const newStatus = action === 'suspend' ? 'suspended' : 'active';
      const actionText = action === 'suspend' ? 'suspended' : 'activated';
      
      try {
        setActionLoading(prev => ({ ...prev, [actionKey]: true }));
        setError('');
        
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        const data = await response.json();
        
        if (data.success) {
          await fetchUsers(currentPage);
          addNotification({
            type: 'success',
            title: 'Success',
            message: `User ${user?.first_name || user?.username || 'Unknown'} has been ${actionText} successfully.`
          });
        } else {
          setError(`Failed to update user status: ${data.error || 'Unknown error'}`);
          addNotification({
            type: 'error',
            title: 'Error',
            message: `Failed to ${action} user: ${data.error || 'Unknown error'}`
          });
        }
      } catch (error) {
        console.error('Error updating user status:', error);
        setError(`Error updating user status: ${error instanceof Error ? error.message : 'Network error'}`);
        addNotification({
          type: 'error',
          title: 'Error',
          message: `Failed to ${action} user. Please try again.`
        });
      } finally {
        setActionLoading(prev => ({ ...prev, [actionKey]: false }));
      }
    }
  };

  const handleCreateUser = async () => {
    try {
      setCreateUserLoading(true);
      setError('');
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creatingUser)
      });
      const data = await response.json();
      
      if (data.success) {
        setShowCreateModal(false);
        setCreatingUser({
          email: '',
          username: '',
          password: '',
          first_name: '',
          last_name: '',
          role_id: ''
        });
        await fetchUsers(currentPage);
        addNotification({
          type: 'success',
          title: 'Success',
          message: `User ${creatingUser.first_name || creatingUser.username} has been created successfully.`
        });
      } else {
        setError(data.error || 'Failed to create user');
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to create user'
        });
      }
    } catch (error) {
      setError('Error creating user');
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create user. Please try again.'
      });
    } finally {
      setCreateUserLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editingUser) return;
    
    try {
      setEditUserLoading(true);
      setError('');
      
      console.log('🔍 Saving user:', editingUser.id, 'with roles:', editingUserRoles);
      
      // Update user details
      const userResponse = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editingUser.first_name,
          last_name: editingUser.last_name,
          email: editingUser.email,
          username: editingUser.username,
          status: editingUser.status
        })
      });
      const userData = await userResponse.json();
      
      console.log('✅ User update response:', userData);
      
      if (userData.success) {
        // Always update user roles (including empty array to remove all roles)
        console.log('🔄 Updating roles for user:', editingUser.id, 'roles:', editingUserRoles);
        
        const rolesResponse = await fetch(`/api/admin/users/${editingUser.id}/roles`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            role_ids: editingUserRoles
          })
        });
        
        const rolesData = await rolesResponse.json();
        console.log('✅ Roles update response:', rolesData);
        
        if (!rolesData.success) {
          setError('User updated but failed to update roles: ' + rolesData.error);
          addNotification({
            type: 'warning',
            title: 'Partial Success',
            message: 'User updated but failed to update roles: ' + rolesData.error
          });
          return;
        }
        
        console.log('✅ User and roles updated successfully');
        setError('');
        setShowEditModal(false);
        setEditingUser(null);
        setEditingUserRoles([]);
        await fetchUsers(currentPage);
        addNotification({
          type: 'success',
          title: 'Success',
          message: `User ${editingUser.first_name || editingUser.username} has been updated successfully.`
        });
      } else {
        setError(userData.error || 'Failed to update user');
        addNotification({
          type: 'error',
          title: 'Error',
          message: userData.error || 'Failed to update user'
        });
      }
    } catch (error) {
      setError('Error updating user');
      console.error('Error:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update user. Please try again.'
      });
    } finally {
      setEditUserLoading(false);
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleRoleToggle = (roleId: number) => {
    setEditingUserRoles(prev => 
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleEditUser = (user: User) => {
    setEditingUser({...user});
    // Map role IDs correctly from the user's roles
    const currentRoleIds = user.roles?.map(role => role.id) || [];
    setEditingUserRoles(currentRoleIds);
    setShowEditModal(true);
  };

  const handlePasswordUpdate = async () => {
    if (!passwordUser || !newPassword) return;
    
    if (newPassword.length < 6) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Password must be at least 6 characters long'
      });
      return;
    }
    
    try {
      setPasswordUpdateLoading(true);
      
      const response = await fetch(`/api/admin/users/${passwordUser.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        setShowPasswordModal(false);
        setPasswordUser(null);
        setNewPassword('');
        addNotification({
          type: 'success',
          title: 'Success',
          message: `Password updated successfully for ${passwordUser.first_name || passwordUser.username}`
        });
      } else {
        addNotification({
          type: 'error',
          title: 'Error',
          message: data.error || 'Failed to update password'
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update password. Please try again.'
      });
    } finally {
      setPasswordUpdateLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;
    
    const confirmMessage = action === 'delete' 
      ? `Are you sure you want to delete ${selectedUsers.length} users? This action cannot be undone.`
      : `Are you sure you want to ${action} ${selectedUsers.length} users?`;
    
    if (!confirm(confirmMessage)) return;

    try {
      setBulkActionLoading(true);
      setError('');
      const results = [];
      const actionText = action === 'delete' ? 'deleted' : action === 'activate' ? 'activated' : 'suspended';
      
      for (const userId of selectedUsers) {
        try {
          if (action === 'delete') {
            const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
            const data = await response.json();
            results.push({ userId, success: data.success, error: data.error });
          } else {
            const newStatus = action === 'activate' ? 'active' : 'suspended';
            const response = await fetch(`/api/admin/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: newStatus })
            });
            const data = await response.json();
            results.push({ userId, success: data.success, error: data.error });
          }
        } catch (error) {
          results.push({ userId, success: false, error: error instanceof Error ? error.message : 'Network error' });
        }
      }
      
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success);
      
      if (failed.length > 0) {
        const errorDetails = failed.map(f => `User ${f.userId}: ${f.error}`).join(', ');
        setError(`Bulk ${action} completed with errors. ${successful} succeeded, ${failed.length} failed. Errors: ${errorDetails}`);
        addNotification({
          type: 'warning',
          title: 'Partial Success',
          message: `Bulk ${action} completed with errors. ${successful} succeeded, ${failed.length} failed.`
        });
      } else {
        setError('');
        addNotification({
          type: 'success',
          title: 'Success',
          message: `Successfully ${actionText} ${successful} users.`
        });
      }
      
      await fetchUsers(currentPage);
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error);
      setError(`Error performing bulk ${action}: ${error instanceof Error ? error.message : 'Network error'}`);
      addNotification({
        type: 'error',
        title: 'Error',
        message: `Failed to perform bulk ${action}. Please try again.`
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-teal-500';
      case 'suspended': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'banned': return 'bg-gradient-to-r from-red-500 to-pink-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'super_admin': return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case 'admin': return 'bg-gradient-to-r from-blue-600 to-purple-600';
      case 'moderator': return 'bg-gradient-to-r from-cyan-500 to-blue-500';
      case 'author': return 'bg-gradient-to-r from-green-500 to-teal-500';
      case 'reader': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'no-role': return 'bg-gradient-to-r from-gray-400 to-gray-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  // Don't render anything until mounted to prevent hydration issues
  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading..." />
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" text="Loading users..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <i className="ri-error-warning-line text-red-400 text-xl flex-shrink-0 mt-0.5"></i>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1 whitespace-pre-wrap break-words">{error}</p>
              <button 
                onClick={() => setError('')}
                className="text-red-500 hover:text-red-700 text-sm mt-2 underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.name}>{role.display_name}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <i className="ri-add-line mr-2"></i>
            Add User
          </button>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800">
              {selectedUsers.length} users selected
            </span>
            <div className="flex space-x-2">
              <LoadingButton
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('activate')}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm rounded-full hover:from-green-600 hover:to-teal-600 transition-all duration-300"
              >
                Activate
              </LoadingButton>
              <LoadingButton
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('suspend')}
                className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-sm rounded-full hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
              >
                Suspend
              </LoadingButton>
              <LoadingButton
                loading={bulkActionLoading}
                onClick={() => handleBulkAction('delete')}
                className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-full hover:from-red-600 hover:to-pink-600 transition-all duration-300"
              >
                Delete
              </LoadingButton>
              <button
                onClick={() => setShowBulkLibraryManagement(true)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm rounded-full hover:from-green-600 hover:to-blue-600 transition-all duration-300"
              >
                <i className="ri-book-line mr-1"></i>
                Assign Ebooks
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Users - Mobile Cards */}
      <div className="xl:hidden space-y-4">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-md p-4 space-y-3">
            {/* User Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-semibold text-sm">
                    {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 break-words">
                    {user.first_name || ''} {user.last_name || ''}
                  </div>
                  <div className="text-sm text-gray-500 break-words">{user.email}</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1 ml-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(user.status)}`}>
                  {user.status}
                </span>
              </div>
            </div>

            {/* User Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Joined:</span>
                <span className="ml-1 font-medium text-gray-900 break-words">
                  {formatDate(user.created_at)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Username:</span>
                <span className="ml-1 font-medium text-gray-900 break-words">
                  {user.username}
                </span>
              </div>
            </div>

            {/* Roles */}
            <div className="border-t pt-3">
              <div className="text-sm">
                <span className="font-medium text-gray-700">Roles:</span>
                <div className="mt-1 flex flex-wrap gap-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span 
                        key={role.id} 
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor(role.name)}`}
                      >
                        {role.display_name}
                      </span>
                    ))
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor('no-role')}`}>
                      No Role
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleUserAction(user.id, 'view')}
                className="text-blue-600 hover:text-blue-800 flex items-center text-sm whitespace-nowrap"
                title="View User"
              >
                <i className="ri-eye-line mr-1"></i>
                View
              </button>
              <button
                onClick={() => handleUserAction(user.id, 'reading-analytics')}
                className="text-purple-600 hover:text-purple-800 flex items-center text-sm whitespace-nowrap"
                title="Reading Analytics"
              >
                <i className="ri-line-chart-line mr-1"></i>
                Analytics
              </button>
              <button
                onClick={() => handleUserAction(user.id, 'library-management')}
                className="text-green-600 hover:text-green-800 flex items-center text-sm whitespace-nowrap"
                title="Manage Library"
              >
                <i className="ri-book-line mr-1"></i>
                Library
              </button>
              <button
                onClick={() => handleEditUser(user)}
                className="text-green-600 hover:text-green-800 flex items-center text-sm whitespace-nowrap"
                title="Edit User"
              >
                <i className="ri-edit-line mr-1"></i>
                Edit
              </button>
              <button
                onClick={() => handleUserAction(user.id, 'password')}
                className="text-orange-600 hover:text-orange-800 flex items-center text-sm whitespace-nowrap"
                title="Update Password"
              >
                <i className="ri-lock-line mr-1"></i>
                Password
              </button>
              <LoadingButton
                loading={actionLoading[`${user.status === 'active' ? 'suspend' : 'activate'}-${user.id}`]}
                onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                className="text-yellow-600 hover:text-yellow-800 flex items-center text-sm whitespace-nowrap"
              >
                <i className={`ri-${user.status === 'active' ? 'pause' : 'play'}-circle-line mr-1`}></i>
                {user.status === 'active' ? 'Suspend' : 'Activate'}
              </LoadingButton>
              <LoadingButton
                loading={actionLoading[`delete-${user.id}`]}
                onClick={() => handleUserAction(user.id, 'delete')}
                className="text-red-600 hover:text-red-800 flex items-center text-sm whitespace-nowrap"
              >
                <i className="ri-delete-bin-line mr-1"></i>
                Delete
              </LoadingButton>
            </div>
          </div>
        ))}
      </div>

      {/* Users - Desktop Table */}
      <div className="hidden xl:block bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={() => {
                      if (selectedUsers.length === users.length) {
                        setSelectedUsers([]);
                      } else {
                        setSelectedUsers(users.map(u => u.id));
                      }
                    }}
                    className="cursor-pointer"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      className="cursor-pointer"
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-semibold text-sm">
                          {user.first_name?.charAt(0) || ''}{user.last_name?.charAt(0) || ''}
                        </span>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 break-words">
                          {user.first_name || ''} {user.last_name || ''}
                        </div>
                        <div className="text-sm text-gray-500 break-words">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles && user.roles.length > 0 ? (
                        user.roles.map((role, index) => (
                          <span 
                            key={role.id} 
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor(role.name)}`}
                          >
                            {role.display_name}
                          </span>
                        ))
                      ) : (
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white ${getRoleColor('no-role')}`}>
                          No Role
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full text-white ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-500 break-words">
                      {formatDate(user.created_at)}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleUserAction(user.id, 'view')}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                        title="View User"
                      >
                        <i className="ri-eye-line"></i>
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'reading-analytics')}
                        className="text-purple-600 hover:text-purple-800 cursor-pointer transition-colors duration-200"
                        title="Reading Analytics"
                      >
                        <i className="ri-line-chart-line"></i>
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'library-management')}
                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200"
                        title="Manage Library"
                      >
                        <i className="ri-book-line"></i>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200"
                        title="Edit User"
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        onClick={() => handleUserAction(user.id, 'password')}
                        className="text-orange-600 hover:text-orange-800 cursor-pointer transition-colors duration-200"
                        title="Update Password"
                      >
                        <i className="ri-lock-line"></i>
                      </button>
                      <LoadingButton
                        loading={actionLoading[`${user.status === 'active' ? 'suspend' : 'activate'}-${user.id}`]}
                        onClick={() => handleUserAction(user.id, user.status === 'active' ? 'suspend' : 'activate')}
                        className="text-yellow-600 hover:text-yellow-800 cursor-pointer transition-colors duration-200"
                      >
                        <i className={`ri-${user.status === 'active' ? 'pause' : 'play'}-circle-line`}></i>
                      </LoadingButton>
                      <LoadingButton
                        loading={actionLoading[`delete-${user.id}`]}
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </LoadingButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {users.length} of {totalUsers} users
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => fetchUsers(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {currentPage}
            </span>
            <button 
              onClick={() => fetchUsers(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        className="max-w-md w-full mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">Create New User</h2>
          </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={creatingUser.first_name}
                    onChange={(e) => setCreatingUser({...creatingUser, first_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={creatingUser.last_name}
                    onChange={(e) => setCreatingUser({...creatingUser, last_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={creatingUser.email}
                    onChange={(e) => setCreatingUser({...creatingUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <input
                    type="text"
                    value={creatingUser.username}
                    onChange={(e) => setCreatingUser({...creatingUser, username: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input
                    type="password"
                    value={creatingUser.password}
                    onChange={(e) => setCreatingUser({...creatingUser, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={creatingUser.role_id}
                    onChange={(e) => setCreatingUser({...creatingUser, role_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>{role.display_name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <LoadingButton
                    loading={createUserLoading}
                    type="button"
                    onClick={handleCreateUser}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Create User
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
      </Modal>

      {/* Edit User Modal */}
      <Modal 
        isOpen={showEditModal && !!editingUser} 
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
          setEditingUserRoles([]);
        }}
        className="rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {editingUser && (
          <div className="p-8">
            <div className="mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit User</h2>
                <p className="text-gray-600 mt-1">Update user information and roles</p>
              </div>
            </div>

              <form className="space-y-6">
                {/* User Avatar and Basic Info */}
                <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {editingUser.first_name?.charAt(0) || ''}{editingUser.last_name?.charAt(0) || ''}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {editingUser.first_name || ''} {editingUser.last_name || ''}
                    </h3>
                    <p className="text-gray-600">{editingUser.email}</p>
                  </div>
                </div>

                {/* User Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={editingUser.first_name}
                      onChange={(e) => setEditingUser({...editingUser, first_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={editingUser.last_name}
                      onChange={(e) => setEditingUser({...editingUser, last_name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                    <input
                      type="text"
                      value={editingUser.username}
                      onChange={(e) => setEditingUser({...editingUser, username: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={editingUser.status}
                      onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                  </div>
                </div>

                {/* Role Management */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Role Management</h3>
                    <p className="text-sm text-gray-600">Select the roles to assign to this user</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          editingUserRoles.includes(role.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={editingUserRoles.includes(role.id)}
                          onChange={() => handleRoleToggle(role.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{role.display_name}</div>
                          <div className="text-sm text-gray-600">{role.description || 'No description'}</div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getRoleColor(role.name).replace('bg-gradient-to-r', 'bg')}`}></div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6 border-t border-gray-200">
                  <LoadingButton
                    loading={editUserLoading}
                    type="button"
                    onClick={handleEditSave}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    <i className="ri-save-line mr-2"></i>
                    Save Changes
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setEditingUserRoles([]);
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
        )}
      </Modal>

      {/* User Detail Modal */}
      <Modal 
        isOpen={showUserModal && !!selectedUser} 
        onClose={() => setShowUserModal(false)}
        className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {selectedUser && (
          <div className="p-8">
            <div className="mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">User Profile</h2>
                <p className="text-gray-600 mt-1">Detailed user information and management</p>
              </div>
            </div>

              <div className="space-y-8">
                {/* User Header */}
                <div className="flex items-center space-x-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-xl">
                      {selectedUser.first_name?.charAt(0) || ''}{selectedUser.last_name?.charAt(0) || ''}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {selectedUser.first_name || ''} {selectedUser.last_name || ''}
                    </h3>
                    <p className="text-gray-600 text-lg mb-2">{selectedUser.email}</p>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status.charAt(0).toUpperCase() + selectedUser.status.slice(1)}
                      </span>
                      {selectedUser.email_verified && (
                        <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                          <i className="ri-check-line mr-1"></i>
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <span className="text-lg text-gray-900 font-medium">{selectedUser.username}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Status</label>
                        <span className={`inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full ${
                          selectedUser.email_verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          <i className={`ri-${selectedUser.email_verified ? 'check' : 'close'}-line mr-1`}></i>
                          {selectedUser.email_verified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                        <span className="text-lg text-gray-900 font-medium">{formatDate(selectedUser.created_at)}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                        <span className="text-lg text-gray-900 font-medium">{formatDate(selectedUser.updated_at)}</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                        <span className="text-lg text-gray-900 font-medium">
                          {selectedUser.last_login ? formatDate(selectedUser.last_login) : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Roles */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Assigned Roles</h4>
                  {selectedUser.roles && selectedUser.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {selectedUser.roles.map((role) => (
                        <span 
                          key={role.id} 
                          className={`inline-flex items-center px-4 py-2 text-sm font-semibold rounded-full text-white ${getRoleColor(role.name)}`}
                        >
                          <i className="ri-shield-user-line mr-2"></i>
                          {role.display_name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <i className="ri-user-line text-4xl text-gray-400 mb-2"></i>
                      <p className="text-gray-600">No roles assigned</p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200">
                  <button 
                    onClick={() => {
                      setShowUserModal(false);
                      handleEditUser(selectedUser);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    <i className="ri-edit-line mr-2"></i>
                    Edit User
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserModal(false);
                      handleUserAction(selectedUser.id, selectedUser.status === 'active' ? 'suspend' : 'activate');
                    }}
                    className={`px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 font-medium ${
                      selectedUser.status === 'active'
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                        : 'bg-gradient-to-r from-green-500 to-teal-500 text-white hover:from-green-600 hover:to-teal-600'
                    }`}
                  >
                    <i className={`ri-${selectedUser.status === 'active' ? 'pause' : 'play'}-line mr-2`}></i>
                    {selectedUser.status === 'active' ? 'Suspend' : 'Activate'} User
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 font-medium">
                    <i className="ri-message-3-line mr-2"></i>
                    Send Message
                  </button>
                  <button 
                    onClick={() => {
                      setShowUserModal(false);
                      handleUserAction(selectedUser.id, 'delete');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 font-medium"
                  >
                    <i className="ri-delete-bin-line mr-2"></i>
                    Delete User
                  </button>
                </div>
              </div>
            </div>
        )}
      </Modal>

      {/* User Reading Analytics Modal */}
      <Modal 
        isOpen={showUserReadingAnalytics && !!selectedUserForAnalytics} 
        onClose={() => {
          setShowUserReadingAnalytics(false);
          setSelectedUserForAnalytics(null);
        }}
        className="w-full max-w-7xl max-h-[90vh] overflow-y-auto"
        showCloseIcon={false}
      >
        {selectedUserForAnalytics && (
          <UserReadingAnalytics 
            userId={selectedUserForAnalytics}
            onClose={() => {
              setShowUserReadingAnalytics(false);
              setSelectedUserForAnalytics(null);
            }}
          />
        )}
      </Modal>

        {/* User Library Management Modal */}
        {showUserLibraryManagement && selectedUserForLibrary && (
          <UserLibraryManagement
            userId={selectedUserForLibrary}
            userName={(users.find(u => u.id === selectedUserForLibrary)?.first_name || '') + ' ' + (users.find(u => u.id === selectedUserForLibrary)?.last_name || '') || 'User'}
            onClose={() => {
              setShowUserLibraryManagement(false);
              setSelectedUserForLibrary(null);
            }}
          />
        )}

        {/* Bulk Library Management Modal */}
        {showBulkLibraryManagement && (
          <BulkLibraryManagement
            onClose={() => setShowBulkLibraryManagement(false)}
          />
        )}

        {/* Password Update Modal */}
        <Modal 
          isOpen={showPasswordModal && !!passwordUser} 
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordUser(null);
            setNewPassword('');
          }}
          className="max-w-md w-full mx-4"
        >
          {passwordUser && (
            <div className="p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Update Password</h2>
                <p className="text-gray-600 mt-1">
                  Update password for {passwordUser.first_name || ''} {passwordUser.last_name || ''}
                </p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <LoadingButton
                    loading={passwordUpdateLoading}
                    type="button"
                    onClick={handlePasswordUpdate}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full hover:from-orange-700 hover:to-red-700 transition-all duration-300"
                  >
                    Update Password
                  </LoadingButton>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordUser(null);
                      setNewPassword('');
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </Modal>
    </div>
  );
}
