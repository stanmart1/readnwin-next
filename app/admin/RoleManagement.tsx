"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/utils/dateUtils";
import Modal from "@/components/ui/Modal";
import toast from 'react-hot-toast';

interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  priority: number;
  is_system_role: boolean;
  created_at: string;
}

interface Permission {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  resource: string;
  action: string;
  scope: string;
}

export default function RoleManagement() {
  useSession(); // Session used for authentication context
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [creatingRole, setCreatingRole] = useState({
    name: "",
    display_name: "",
    description: "",
    priority: 0,
  });
  const [rolePermissions, setRolePermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [isEditingPermissions, setIsEditingPermissions] = useState(false);
  const [isSavingPermissions, setIsSavingPermissions] = useState(false);
  const [saveProgress, setSaveProgress] = useState('');
  const [permissionSearch, setPermissionSearch] = useState("");
  const [selectedResource, setSelectedResource] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Permissions are now fetched from the API instead of hardcoded

  // Fetch roles
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/roles");
      const data = await response.json();

      if (data.success) {
        setRoles(data.roles);
      } else {
        setError("Failed to fetch roles");
      }
    } catch (error) {
      setError("Error fetching roles");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch permissions
  const fetchPermissions = async () => {
    try {
      const response = await fetch("/api/admin/permissions");
      const data = await response.json();
      if (data.success) {
        setPermissions(data.permissions);
      } else {
        setError("Failed to fetch permissions");
      }
    } catch (error) {
      setError("Error fetching permissions");
      console.error("Error:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isEditingPermissions && e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        const filteredResources = Array.from(new Set(permissions.map(p => p.resource)))
          .sort()
          .filter(resource => selectedResource === "all" || resource === selectedResource)
          .filter(resource => {
            const resourcePermissions = permissions
              .filter(p => p.resource === resource)
              .filter(p => 
                permissionSearch === "" ||
                p.display_name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                p.description?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                p.action.toLowerCase().includes(permissionSearch.toLowerCase())
              );
            return resourcePermissions.length > 0;
          });
        
        const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
        if (currentPage < totalPages) {
          setCurrentPage(prev => prev + 1);
        }
      }
    };

    if (showPermissionsModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isEditingPermissions, showPermissionsModal, currentPage, itemsPerPage, permissions, selectedResource, permissionSearch]);

  const handleCreateRole = async () => {
    try {
      const response = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(creatingRole),
      });
      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setCreatingRole({
          name: "",
          display_name: "",
          description: "",
          priority: 0,
        });
        fetchRoles();
      } else {
        setError(data.error || "Failed to create role");
      }
    } catch (error) {
      setError("Error creating role");
    }
  };

  const handleEditRole = async () => {
    if (!editingRole) return;

    try {
      const response = await fetch(`/api/admin/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          display_name: editingRole.display_name,
          description: editingRole.description,
          priority: editingRole.priority,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setEditingRole(null);
        fetchRoles();
      } else {
        setError(data.error || "Failed to update role");
      }
    } catch (error) {
      setError("Error updating role");
    }
  };

  const handleDeleteRole = async (roleId: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        fetchRoles();
      } else {
        setError("Failed to delete role");
      }
    } catch (error) {
      setError("Error deleting role");
    }
  };

  const handleViewPermissions = async (roleId: number) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}/permissions`);
      const data = await response.json();
      if (data.success) {
        setRolePermissions(data.permissions);
        setSelectedPermissions(data.permissions.map((p: Permission) => p.id));
        setSelectedRole(roles.find((r) => r.id === roleId) || null);
        setShowPermissionsModal(true);
        setIsEditingPermissions(false);
      }
    } catch (error) {
      setError("Error fetching role permissions");
    }
  };

  const handlePermissionToggle = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId],
    );
  };

  const handleSavePermissions = async () => {
    if (!selectedRole) return;

    try {
      setIsSavingPermissions(true);
      setError("");
      setSaveProgress('Preparing permissions update...');
      
      // Add a small delay to show the progress message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaveProgress(`Updating ${selectedPermissions.length} permissions...`);
      
      // Send all selected permissions in a single batch update
      const response = await fetch(`/api/admin/roles/${selectedRole.id}/permissions/batch`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permission_ids: selectedPermissions }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSaveProgress('Refreshing permissions...');
        // Refresh permissions
        await handleViewPermissions(selectedRole.id);
        setIsEditingPermissions(false);
        setSaveProgress('');
        toast.success(`Successfully updated permissions for ${selectedRole.display_name}!`);
      } else {
        const errorMsg = data.error || "Failed to update permissions";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Save permissions error:', error);
      const errorMsg = error instanceof Error ? error.message : "Network error occurred";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSavingPermissions(false);
      setSaveProgress('');
    }
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case "super_admin":
        return "bg-gradient-to-r from-purple-600 to-pink-600";
      case "admin":
        return "bg-gradient-to-r from-blue-600 to-purple-600";
      case "moderator":
        return "bg-gradient-to-r from-cyan-500 to-blue-500";
      case "author":
        return "bg-gradient-to-r from-green-500 to-teal-500";
      case "editor":
        return "bg-gradient-to-r from-yellow-500 to-orange-500";
      case "reader":
        return "bg-gradient-to-r from-gray-500 to-gray-600";
      default:
        return "bg-gradient-to-r from-blue-600 to-purple-600";
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case "users": return "ri-user-line";
      case "roles": return "ri-shield-user-line";
      case "permissions": return "ri-shield-keyhole-line";
      case "books": return "ri-book-line";
      case "authors": return "ri-user-star-line";
      case "orders": return "ri-shopping-cart-line";
      case "content": return "ri-file-text-line";
      case "system": return "ri-settings-line";
      case "profile": return "ri-user-settings-line";
      case "blog": return "ri-article-line";
      case "faq": return "ri-question-answer-line";
      case "email": return "ri-mail-line";
      case "about": return "ri-information-line";
      case "contact": return "ri-contacts-line";
      case "reviews": return "ri-star-line";
      case "shipping": return "ri-truck-line";
      case "notifications": return "ri-notification-line";
      case "works": return "ri-palette-line";
      default: return "ri-folder-line";
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "create": return "bg-green-100 text-green-800";
      case "read": return "bg-blue-100 text-blue-800";
      case "update": return "bg-yellow-100 text-yellow-800";
      case "delete": return "bg-red-100 text-red-800";
      case "manage_roles": return "bg-purple-100 text-purple-800";
      case "manage_permissions": return "bg-indigo-100 text-indigo-800";
      case "publish": return "bg-teal-100 text-teal-800";
      case "moderate": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading roles...</span>
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
          <div className="flex">
            <i className="ri-error-warning-line text-red-400 text-xl"></i>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Role Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage system roles and permissions
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
          >
            <i className="ri-add-line mr-2"></i>
            Create Role
          </button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-shield-user-line text-blue-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total Roles</p>
                <p className="text-2xl font-bold text-blue-800">{roles.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-shield-keyhole-line text-green-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-green-600 font-medium">Total Permissions</p>
                <p className="text-2xl font-bold text-green-800">{permissions.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-settings-line text-purple-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-purple-600 font-medium">System Roles</p>
                <p className="text-2xl font-bold text-purple-800">{roles.filter(r => r.is_system_role).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
            <div className="flex items-center">
              <i className="ri-user-settings-line text-orange-600 text-2xl mr-3"></i>
              <div>
                <p className="text-sm text-orange-600 font-medium">Custom Roles</p>
                <p className="text-2xl font-bold text-orange-800">{roles.filter(r => !r.is_system_role).length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 ${getRoleColor(role.name)} rounded-full flex items-center justify-center`}
              >
                <i className="ri-shield-user-line text-white text-xl"></i>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleViewPermissions(role.id)}
                  className="p-2 text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
                  title="View Permissions"
                >
                  <i className="ri-settings-line"></i>
                </button>
                {!role.is_system_role && (
                  <>
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200"
                      title="Edit Role"
                    >
                      <i className="ri-edit-line"></i>
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="p-2 text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200"
                      title="Delete Role"
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </>
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {role.display_name}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {role.description || "No description provided"}
            </p>

            <div className="flex items-center justify-between text-sm mb-3">
              <span className="text-gray-500">Priority: {role.priority}</span>
              {role.is_system_role && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  System Role
                </span>
              )}
            </div>
            
            {/* Role capabilities preview */}
            <div className="text-xs text-gray-500">
              <span className="inline-flex items-center">
                <i className="ri-shield-keyhole-line mr-1"></i>
                Click to view permissions
              </span>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center text-sm text-gray-500">
                <i className="ri-time-line mr-1"></i>
                Created {formatDate(role.created_at)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Role Modal */}
      <Modal 
        isOpen={showCreateModal} 
        onClose={() => setShowCreateModal(false)}
        className="max-w-md w-full mx-4"
      >
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Create New Role
            </h2>
          </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={creatingRole.name}
                    onChange={(e) =>
                      setCreatingRole({ ...creatingRole, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., content_manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={creatingRole.display_name}
                    onChange={(e) =>
                      setCreatingRole({
                        ...creatingRole,
                        display_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Content Manager"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={creatingRole.description}
                    onChange={(e) =>
                      setCreatingRole({
                        ...creatingRole,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Describe the role's purpose and responsibilities"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={creatingRole.priority}
                    onChange={(e) =>
                      setCreatingRole({
                        ...creatingRole,
                        priority: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCreateRole}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Create Role
                  </button>
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

      {/* Edit Role Modal */}
      <Modal 
        isOpen={showEditModal && !!editingRole} 
        onClose={() => setShowEditModal(false)}
        className="max-w-md w-full mx-4"
      >
        {editingRole && (
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Role</h2>
            </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={editingRole.display_name}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        display_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editingRole.description || ""}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={editingRole.priority}
                    onChange={(e) =>
                      setEditingRole({
                        ...editingRole,
                        priority: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleEditRole}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
        )}
      </Modal>

      {/* Permissions Modal */}
      {showPermissionsModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Permissions for {selectedRole.display_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isEditingPermissions
                      ? "Select permissions to assign to this role"
                      : "View current permissions"}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  {!isEditingPermissions ? (
                    <button
                      onClick={() => setIsEditingPermissions(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
                    >
                      <i className="ri-edit-line mr-2"></i>
                      Edit Permissions
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSavePermissions}
                        disabled={isSavingPermissions}
                        className="px-4 py-2 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-full hover:from-green-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSavingPermissions ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            {saveProgress || 'Saving...'}
                          </>
                        ) : (
                          <>
                            <i className="ri-save-line mr-2"></i>
                            Save Changes
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingPermissions(false);
                          setSelectedPermissions(
                            rolePermissions.map((p) => p.id),
                          );
                          setPermissionSearch("");
                          setSelectedResource("all");
                          setCurrentPage(1);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                  >
                    <i className="ri-close-line text-xl"></i>
                  </button>
                </div>
              </div>

              {isEditingPermissions ? (
                <div className="space-y-6">
                  {/* Search and Filter Controls */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Search Permissions
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={permissionSearch}
                            onChange={(e) => {
                              setPermissionSearch(e.target.value);
                              setCurrentPage(1);
                            }}
                            placeholder="Search by name or description..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
                        </div>
                      </div>
                      <div className="sm:w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Filter by Resource
                        </label>
                        <select
                          value={selectedResource}
                          onChange={(e) => {
                            setSelectedResource(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">All Resources</option>
                          {Array.from(new Set(permissions.map(p => p.resource))).sort().map(resource => (
                            <option key={resource} value={resource} className="capitalize">
                              {resource}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Permission Categories */}
                  {(() => {
                    const filteredResources = Array.from(new Set(permissions.map(p => p.resource)))
                      .sort()
                      .filter(resource => selectedResource === "all" || resource === selectedResource)
                      .filter(resource => {
                        const resourcePermissions = permissions
                          .filter(p => p.resource === resource)
                          .filter(p => 
                            permissionSearch === "" ||
                            p.display_name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                            p.description?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                            p.action.toLowerCase().includes(permissionSearch.toLowerCase())
                          );
                        return resourcePermissions.length > 0;
                      });
                    
                    const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
                    const startIndex = (currentPage - 1) * itemsPerPage;
                    const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage);
                    
                    return (
                      <>
                        {paginatedResources.map(resource => {
                          const resourcePermissions = permissions
                            .filter(p => p.resource === resource)
                            .filter(p => 
                              permissionSearch === "" ||
                              p.display_name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                              p.description?.toLowerCase().includes(permissionSearch.toLowerCase()) ||
                              p.action.toLowerCase().includes(permissionSearch.toLowerCase())
                            );
                          
                          const selectedCount = resourcePermissions.filter(p => selectedPermissions.includes(p.id)).length;
                          
                          return (
                            <div key={resource} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center">
                                  <i className={`${getResourceIcon(resource)} text-gray-600 mr-2 text-xl`}></i>
                                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                                    {resource} Management
                                  </h3>
                                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {selectedCount}/{resourcePermissions.length}
                                  </span>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const resourcePermissionIds = resourcePermissions.map(p => p.id);
                                      setSelectedPermissions(prev => {
                                        const filtered = prev.filter(id => !resourcePermissionIds.includes(id));
                                        return [...filtered, ...resourcePermissionIds];
                                      });
                                    }}
                                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    title={`Select all ${resource} permissions`}
                                  >
                                    <i className="ri-checkbox-multiple-line mr-1"></i>
                                    Select All
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const resourcePermissionIds = resourcePermissions.map(p => p.id);
                                      setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
                                    }}
                                    className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                                    title={`Clear all ${resource} permissions`}
                                  >
                                    <i className="ri-checkbox-blank-line mr-1"></i>
                                    Clear All
                                  </button>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {resourcePermissions.map((permission) => (
                                  <div
                                    key={permission.id}
                                    className={`rounded-lg p-3 border-2 transition-all duration-200 ${
                                      selectedPermissions.includes(permission.id)
                                        ? "bg-blue-50 border-blue-200"
                                        : "bg-white border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-start space-x-3">
                                      <input
                                        type="checkbox"
                                        checked={selectedPermissions.includes(permission.id)}
                                        onChange={() => handlePermissionToggle(permission.id)}
                                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                      />
                                      <div className="flex-1">
                                        <div className="flex items-center mb-1">
                                          <i className={`${getResourceIcon(permission.resource)} text-gray-500 mr-2`}></i>
                                          <h4 className="font-medium text-gray-900 text-sm">
                                            {permission.display_name}
                                          </h4>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-2">
                                          {permission.description}
                                        </p>
                                        <div className="flex items-center gap-1 text-xs">
                                          <span className={`px-2 py-0.5 rounded-full ${getActionColor(permission.action)}`}>
                                            {permission.action}
                                          </span>
                                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                            {permission.scope}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4">
                            <div className="text-sm text-gray-700">
                              Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> 
                              ({filteredResources.length} resource categories)
                              {currentPage < totalPages && (
                                <span className="ml-2 text-xs text-blue-600">
                                  Press Enter for next page
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <i className="ri-arrow-left-line mr-1"></i>
                                Previous
                              </button>
                              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const pageNum = totalPages <= 5 ? i + 1 : 
                                  currentPage <= 3 ? i + 1 :
                                  currentPage >= totalPages - 2 ? totalPages - 4 + i :
                                  currentPage - 2 + i;
                                return (
                                  <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-2 py-1 text-sm rounded ${
                                      currentPage === pageNum
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    {pageNum}
                                  </button>
                                );
                              })}
                              <button
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Next
                                <i className="ri-arrow-right-line ml-1"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                  
                  {/* Summary */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <i className="ri-information-line text-blue-600 mr-2"></i>
                        <span className="text-sm text-blue-800">
                          <strong>{selectedPermissions.length}</strong> of <strong>{permissions.length}</strong> permissions selected
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setSelectedPermissions(permissions.map(p => p.id))}
                          className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Select All
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPermissions([])}
                          className="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                        >
                          Clear All
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group permissions by resource for read-only view */}
                  {Array.from(new Set(rolePermissions.map(p => p.resource))).sort().map(resource => {
                    const resourcePermissions = rolePermissions.filter(p => p.resource === resource);
                    
                    return (
                      <div key={resource} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center mb-4">
                          <i className={`${getResourceIcon(resource)} text-gray-600 mr-2 text-xl`}></i>
                          <h3 className="text-lg font-semibold text-gray-900 capitalize">
                            {resource} Management
                          </h3>
                          <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {resourcePermissions.length} permissions
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {resourcePermissions.map((permission) => (
                            <div
                              key={permission.id}
                              className="bg-white rounded-lg p-3 border border-gray-200"
                            >
                              <div className="flex items-center mb-2">
                                <i className={`${getResourceIcon(permission.resource)} text-gray-500 mr-2`}></i>
                                <h4 className="font-medium text-gray-900 text-sm">
                                  {permission.display_name}
                                </h4>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                {permission.description}
                              </p>
                              <div className="flex items-center gap-1 text-xs">
                                <span className={`px-2 py-0.5 rounded-full ${getActionColor(permission.action)}`}>
                                  {permission.action}
                                </span>
                                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full">
                                  {permission.scope}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {!isEditingPermissions && rolePermissions.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-shield-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Permissions Assigned
                  </h3>
                  <p className="text-gray-600 mb-4">
                    This role currently has no permissions assigned.
                  </p>
                  <button
                    onClick={() => setIsEditingPermissions(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  >
                    <i className="ri-add-line mr-2"></i>
                    Assign Permissions
                  </button>
                </div>
              )}

              {isEditingPermissions && permissions.length === 0 && (
                <div className="text-center py-12">
                  <i className="ri-shield-line text-6xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Permissions Available
                  </h3>
                  <p className="text-gray-600">
                    There are no permissions available in the system.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
