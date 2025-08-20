"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { formatDate } from "@/utils/dateUtils";
import Modal from "@/components/ui/Modal";

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
  const { data: session } = useSession();
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

  // Comprehensive permissions list
  const allAvailablePermissions = [
    // User Management
    {
      id: 1,
      name: "users.read",
      display_name: "View Users",
      resource: "users",
      action: "read",
    },
    {
      id: 2,
      name: "users.create",
      display_name: "Create Users",
      resource: "users",
      action: "create",
    },
    {
      id: 3,
      name: "users.update",
      display_name: "Update Users",
      resource: "users",
      action: "update",
    },
    {
      id: 4,
      name: "users.delete",
      display_name: "Delete Users",
      resource: "users",
      action: "delete",
    },
    {
      id: 5,
      name: "users.manage_roles",
      display_name: "Manage User Roles",
      resource: "users",
      action: "manage_roles",
    },

    // Role Management
    {
      id: 6,
      name: "roles.read",
      display_name: "View Roles",
      resource: "roles",
      action: "read",
    },
    {
      id: 7,
      name: "roles.create",
      display_name: "Create Roles",
      resource: "roles",
      action: "create",
    },
    {
      id: 8,
      name: "roles.update",
      display_name: "Update Roles",
      resource: "roles",
      action: "update",
    },
    {
      id: 9,
      name: "roles.delete",
      display_name: "Delete Roles",
      resource: "roles",
      action: "delete",
    },
    {
      id: 10,
      name: "roles.manage_permissions",
      display_name: "Manage Role Permissions",
      resource: "roles",
      action: "manage_permissions",
    },

    // Permission Management
    {
      id: 11,
      name: "permissions.read",
      display_name: "View Permissions",
      resource: "permissions",
      action: "read",
    },
    {
      id: 12,
      name: "permissions.create",
      display_name: "Create Permissions",
      resource: "permissions",
      action: "create",
    },
    {
      id: 13,
      name: "permissions.update",
      display_name: "Update Permissions",
      resource: "permissions",
      action: "update",
    },
    {
      id: 14,
      name: "permissions.delete",
      display_name: "Delete Permissions",
      resource: "permissions",
      action: "delete",
    },

    // Content Management
    {
      id: 15,
      name: "content.read",
      display_name: "View Content",
      resource: "content",
      action: "read",
    },
    {
      id: 16,
      name: "content.create",
      display_name: "Create Content",
      resource: "content",
      action: "create",
    },
    {
      id: 17,
      name: "content.update",
      display_name: "Update Content",
      resource: "content",
      action: "update",
    },
    {
      id: 18,
      name: "content.delete",
      display_name: "Delete Content",
      resource: "content",
      action: "delete",
    },
    {
      id: 19,
      name: "content.publish",
      display_name: "Publish Content",
      resource: "content",
      action: "publish",
    },
    {
      id: 20,
      name: "content.moderate",
      display_name: "Moderate Content",
      resource: "content",
      action: "moderate",
    },
    {
      id: 26,
      name: "content.manage",
      display_name: "Manage Content",
      resource: "content",
      action: "manage",
    },

    // System Management
    {
      id: 21,
      name: "system.settings",
      display_name: "Manage System Settings",
      resource: "system",
      action: "settings",
    },
    {
      id: 22,
      name: "system.analytics",
      display_name: "View Analytics",
      resource: "system",
      action: "analytics",
    },
    {
      id: 23,
      name: "system.audit_logs",
      display_name: "View Audit Logs",
      resource: "system",
      action: "audit_logs",
    },

    // Order Management
    {
      id: 27,
      name: "orders.create",
      display_name: "Create Orders",
      resource: "orders",
      action: "create",
    },
    {
      id: 28,
      name: "orders.read",
      display_name: "View Orders",
      resource: "orders",
      action: "read",
    },
    {
      id: 29,
      name: "orders.update",
      display_name: "Update Orders",
      resource: "orders",
      action: "update",
    },
    {
      id: 30,
      name: "orders.cancel",
      display_name: "Cancel Orders",
      resource: "orders",
      action: "cancel",
    },
    {
      id: 56,
      name: "orders.delete",
      display_name: "Delete Orders",
      resource: "orders",
      action: "delete",
    },
    {
      id: 57,
      name: "orders.view",
      display_name: "View Order Details",
      resource: "orders",
      action: "view",
    },

    // E-commerce
    {
      id: 31,
      name: "checkout.access",
      display_name: "Access Checkout",
      resource: "checkout",
      action: "access",
    },
    {
      id: 32,
      name: "checkout.complete",
      display_name: "Complete Checkout",
      resource: "checkout",
      action: "complete",
    },
    {
      id: 33,
      name: "checkout.guest",
      display_name: "Guest Checkout",
      resource: "checkout",
      action: "guest",
    },
    {
      id: 38,
      name: "cart.access",
      display_name: "Access Cart",
      resource: "cart",
      action: "access",
    },
    {
      id: 39,
      name: "cart.manage",
      display_name: "Manage Cart",
      resource: "cart",
      action: "manage",
    },
    {
      id: 36,
      name: "payment.process",
      display_name: "Process Payment",
      resource: "payment",
      action: "process",
    },
    {
      id: 37,
      name: "payment.verify",
      display_name: "Verify Payment",
      resource: "payment",
      action: "verify",
    },

    // Library Management
    {
      id: 34,
      name: "library.access",
      display_name: "Access Library",
      resource: "library",
      action: "access",
    },
    {
      id: 35,
      name: "library.manage",
      display_name: "Manage Library",
      resource: "library",
      action: "manage",
    },

    // Profile Management
    {
      id: 24,
      name: "profile.read",
      display_name: "View Own Profile",
      resource: "profile",
      action: "read",
    },
    {
      id: 25,
      name: "profile.update",
      display_name: "Update Own Profile",
      resource: "profile",
      action: "update",
    },

    // Blog Management
    {
      id: 58,
      name: "blog.read",
      display_name: "View Blog Posts",
      resource: "blog",
      action: "read",
    },
    {
      id: 59,
      name: "blog.create",
      display_name: "Create Blog Posts",
      resource: "blog",
      action: "create",
    },
    {
      id: 60,
      name: "blog.update",
      display_name: "Update Blog Posts",
      resource: "blog",
      action: "update",
    },
    {
      id: 61,
      name: "blog.delete",
      display_name: "Delete Blog Posts",
      resource: "blog",
      action: "delete",
    },
    {
      id: 62,
      name: "blog.publish",
      display_name: "Publish Blog Posts",
      resource: "blog",
      action: "publish",
    },

    // FAQ Management
    {
      id: 63,
      name: "faq.read",
      display_name: "View FAQs",
      resource: "faq",
      action: "read",
    },
    {
      id: 64,
      name: "faq.create",
      display_name: "Create FAQs",
      resource: "faq",
      action: "create",
    },
    {
      id: 65,
      name: "faq.update",
      display_name: "Update FAQs",
      resource: "faq",
      action: "update",
    },
    {
      id: 66,
      name: "faq.delete",
      display_name: "Delete FAQs",
      resource: "faq",
      action: "delete",
    },

    // Works Management
    {
      id: 67,
      name: "works.read",
      display_name: "View Works",
      resource: "works",
      action: "read",
    },
    {
      id: 68,
      name: "works.create",
      display_name: "Create Works",
      resource: "works",
      action: "create",
    },
    {
      id: 69,
      name: "works.update",
      display_name: "Update Works",
      resource: "works",
      action: "update",
    },
    {
      id: 70,
      name: "works.delete",
      display_name: "Delete Works",
      resource: "works",
      action: "delete",
    },

    // Email Management
    {
      id: 71,
      name: "email.read",
      display_name: "View Email Templates",
      resource: "email",
      action: "read",
    },
    {
      id: 72,
      name: "email.create",
      display_name: "Create Email Templates",
      resource: "email",
      action: "create",
    },
    {
      id: 73,
      name: "email.update",
      display_name: "Update Email Templates",
      resource: "email",
      action: "update",
    },
    {
      id: 74,
      name: "email.delete",
      display_name: "Delete Email Templates",
      resource: "email",
      action: "delete",
    },
    {
      id: 75,
      name: "email.send",
      display_name: "Send Emails",
      resource: "email",
      action: "send",
    },

    // About Management
    {
      id: 76,
      name: "about.read",
      display_name: "View About Content",
      resource: "about",
      action: "read",
    },
    {
      id: 77,
      name: "about.update",
      display_name: "Update About Content",
      resource: "about",
      action: "update",
    },

    // Contact Management
    {
      id: 78,
      name: "contact.read",
      display_name: "View Contact Info",
      resource: "contact",
      action: "read",
    },
    {
      id: 79,
      name: "contact.update",
      display_name: "Update Contact Info",
      resource: "contact",
      action: "update",
    },

    // Reading Analytics
    {
      id: 80,
      name: "reading.analytics",
      display_name: "View Reading Analytics",
      resource: "reading",
      action: "analytics",
    },
    {
      id: 81,
      name: "reading.reports",
      display_name: "Generate Reading Reports",
      resource: "reading",
      action: "reports",
    },

    // Reviews Management
    {
      id: 82,
      name: "reviews.read",
      display_name: "View Reviews",
      resource: "reviews",
      action: "read",
    },
    {
      id: 83,
      name: "reviews.moderate",
      display_name: "Moderate Reviews",
      resource: "reviews",
      action: "moderate",
    },
    {
      id: 84,
      name: "reviews.delete",
      display_name: "Delete Reviews",
      resource: "reviews",
      action: "delete",
    },

    // Shipping Management
    {
      id: 85,
      name: "shipping.read",
      display_name: "View Shipping",
      resource: "shipping",
      action: "read",
    },
    {
      id: 86,
      name: "shipping.update",
      display_name: "Update Shipping",
      resource: "shipping",
      action: "update",
    },

    // Notifications
    {
      id: 87,
      name: "notifications.read",
      display_name: "View Notifications",
      resource: "notifications",
      action: "read",
    },
    {
      id: 88,
      name: "notifications.create",
      display_name: "Create Notifications",
      resource: "notifications",
      action: "create",
    },
    {
      id: 89,
      name: "notifications.update",
      display_name: "Update Notifications",
      resource: "notifications",
      action: "update",
    },
    {
      id: 90,
      name: "notifications.delete",
      display_name: "Delete Notifications",
      resource: "notifications",
      action: "delete",
    },
  ];

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
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

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
      // Get current permissions
      const currentPermissionIds = rolePermissions.map((p) => p.id);

      // Remove permissions that are no longer selected
      for (const permissionId of currentPermissionIds) {
        if (!selectedPermissions.includes(permissionId)) {
          await fetch(
            `/api/admin/roles/${selectedRole.id}/permissions?permission_id=${permissionId}`,
            {
              method: "DELETE",
            },
          );
        }
      }

      // Add new permissions
      for (const permissionId of selectedPermissions) {
        if (!currentPermissionIds.includes(permissionId)) {
          await fetch(`/api/admin/roles/${selectedRole.id}/permissions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ permission_id: permissionId }),
          });
        }
      }

      // Refresh permissions
      await handleViewPermissions(selectedRole.id);
      setIsEditingPermissions(false);
      setError("");
    } catch (error) {
      setError("Error updating role permissions");
    } finally {
      setIsSavingPermissions(false);
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
        <div className="flex items-center justify-between">
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

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Priority: {role.priority}</span>
              {role.is_system_role && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  System Role
                </span>
              )}
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
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Saving...
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className={`rounded-lg p-4 border-2 transition-all duration-200 ${
                        selectedPermissions.includes(permission.id)
                          ? "bg-blue-50 border-blue-200"
                          : "bg-gray-50 border-gray-200"
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
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">
                              {permission.display_name}
                            </h4>
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {permission.resource}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {permission.description}
                          </p>
                          <div className="flex items-center text-xs text-gray-500">
                            <span className="mr-2">
                              Action: {permission.action}
                            </span>
                            <span>Scope: {permission.scope}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rolePermissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">
                          {permission.display_name}
                        </h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {permission.resource}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {permission.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="mr-2">
                          Action: {permission.action}
                        </span>
                        <span>Scope: {permission.scope}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isEditingPermissions && rolePermissions.length === 0 && (
                <div className="text-center py-8">
                  <i className="ri-shield-line text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">
                    No permissions assigned to this role
                  </p>
                </div>
              )}

              {isEditingPermissions && permissions.length === 0 && (
                <div className="text-center py-8">
                  <i className="ri-shield-line text-4xl text-gray-400 mb-4"></i>
                  <p className="text-gray-600">No permissions available</p>
                </div>
              )}
            </div>
        )}
      </Modal>
    </div>
  );
}
