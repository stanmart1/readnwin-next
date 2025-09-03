"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import EmailTemplateEditor from "@/components/EmailTemplateEditor";

interface EmailTemplate {
  id?: number;
  name: string;
  slug: string;
  subject: string;
  html_content: string;
  text_content?: string;
  description?: string;
  variables?: Record<string, any>;
  is_active: boolean;
  category: string;
  created_at?: string;
  updated_at?: string;
}

interface EmailFunction {
  id?: number;
  name: string;
  slug: string;
  description?: string;
  category: string;
  required_variables: string[];
  is_active: boolean;
  created_at?: string;
}

interface EmailFunctionAssignment {
  id?: number;
  function_id: number;
  template_id: number;
  is_active: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
  function_name?: string;
  function_slug?: string;
  template_name?: string;
  template_slug?: string;
}

interface EmailTemplateCategory {
  id?: number;
  name: string;
  description?: string;
  color: string;
  icon: string;
}

export default function EmailTemplateManagement() {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [emailFunctions, setEmailFunctions] = useState<EmailFunction[]>([]);
  const [assignments, setAssignments] = useState<EmailFunctionAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTemplate, setSelectedTemplate] =
    useState<EmailTemplate | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [showTestMailModal, setShowTestMailModal] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    isActive: "",
    search: "",
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byCategory: {} as Record<string, number>,
  });

  // Form state for create/edit
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    subject: "",
    html_content: "",
    text_content: "",
    description: "",
    category: "general",
    is_active: true,
  });

  useEffect(() => {
    fetchTemplates();
    fetchCategories();
    fetchEmailFunctions();
    fetchAssignments();
    fetchStats();
  }, [filters]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.isActive) params.append("is_active", filters.isActive);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/admin/email-templates?${params}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        setError("Failed to fetch templates");
      }
    } catch (error) {
      setError("Error fetching templates");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/email-templates/categories");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEmailFunctions = async () => {
    try {
      const response = await fetch("/api/admin/email-templates/functions");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setEmailFunctions(data.functions);
      }
    } catch (error) {
      console.error("Error fetching email functions:", error);
    }
  };

  const fetchAssignments = async () => {
    try {
      const response = await fetch("/api/admin/email-templates/assignments");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/email-templates/stats");
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      const response = await fetch("/api/admin/email-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setShowCreateModal(false);
        setFormData({
          name: "",
          slug: "",
          subject: "",
          html_content: "",
          text_content: "",
          description: "",
          category: "general",
          is_active: true,
        });
        fetchTemplates();
        fetchStats();
      } else {
        setError(data.error || "Failed to create template");
      }
    } catch (error) {
      setError("Error creating template");
      console.error("Error:", error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!selectedTemplate?.id) return;

    try {
      const encodedId = encodeURIComponent(selectedTemplate.id.toString());
      const response = await fetch(
        `/api/admin/email-templates/${encodedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();
      if (data.success) {
        setShowEditModal(false);
        setSelectedTemplate(null);
        fetchTemplates();
      } else {
        setError(data.error || "Failed to update template");
      }
    } catch (error) {
      setError("Error updating template");
      console.error("Error:", error);
    }
  };

  const handleDeleteTemplate = async (templateId: number) => {
    if (!confirm("Are you sure you want to delete this template?")) return;

    try {
      const encodedId = encodeURIComponent(templateId.toString());
      const response = await fetch(`/api/admin/email-templates/${encodedId}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        fetchTemplates();
        fetchStats();
      } else {
        setError(data.error || "Failed to delete template");
      }
    } catch (error) {
      setError("Error deleting template");
      console.error("Error:", error);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      name: template.name,
      slug: template.slug,
      subject: template.subject,
      html_content: template.html_content,
      text_content: template.text_content || "",
      description: template.description || "",
      category: template.category,
      is_active: template.is_active,
    });
    setShowEditModal(true);
  };

  const handlePreviewTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowPreviewModal(true);
  };

  const handleAssignTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowAssignmentsModal(true);
  };

  const handleTestMail = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setShowTestMailModal(true);
  };

  const handleAssignTemplateToFunction = async (
    functionId: number,
    priority: number = 1,
  ) => {
    if (!selectedTemplate?.id) return;

    try {
      const response = await fetch("/api/admin/email-templates/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          functionId,
          templateId: selectedTemplate.id,
          priority,
        }),
      });

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        setError("");
      } else {
        setError(data.error || "Failed to assign template");
      }
    } catch (error) {
      setError("Error assigning template");
      console.error("Error:", error);
    }
  };

  const handleUnassignTemplate = async (
    functionId: number,
    templateId: number,
  ) => {
    try {
      const params = new URLSearchParams({
        function_id: functionId.toString(),
        template_id: templateId.toString()
      });
      const response = await fetch(
        `/api/admin/email-templates/assignments?${params}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        setError("");
      } else {
        setError(data.error || "Failed to unassign template");
      }
    } catch (error) {
      setError("Error unassigning template");
      console.error("Error:", error);
    }
  };

  const handleUpdateAssignmentPriority = async (
    assignmentId: number,
    priority: number,
  ) => {
    try {
      const encodedId = encodeURIComponent(assignmentId.toString());
      const response = await fetch(
        `/api/admin/email-templates/assignments/${encodedId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ priority }),
        },
      );

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        setError("");
      } else {
        setError(data.error || "Failed to update priority");
      }
    } catch (error) {
      setError("Error updating priority");
      console.error("Error:", error);
    }
  };

  const handleToggleAssignmentStatus = async (assignmentId: number) => {
    try {
      const encodedId = encodeURIComponent(assignmentId.toString());
      const response = await fetch(
        `/api/admin/email-templates/assignments/${encodedId}`,
        {
          method: "PATCH",
        },
      );

      const data = await response.json();
      if (data.success) {
        fetchAssignments();
        setError("");
      } else {
        setError(data.error || "Failed to toggle status");
      }
    } catch (error) {
      setError("Error toggling status");
      console.error("Error:", error);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?.color || "#6B7280";
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((cat) => cat.name === categoryName);
    return category?.icon || "ri-mail-line";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 md:p-12">
            <div className="flex flex-col items-center justify-center py-8 sm:py-12">
              <div className="animate-spin rounded-full h-8 sm:h-10 md:h-12 w-8 sm:w-10 md:w-12 border-b-2 border-blue-600"></div>
              <span className="mt-3 sm:mt-4 text-sm sm:text-base text-gray-600 text-center">
                Loading email templates...
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-6 lg:py-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <i className="ri-error-warning-line text-red-400 text-lg sm:text-xl flex-shrink-0 mt-0.5"></i>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight break-words">
                Email Templates
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed break-words">
                Manage email templates for the application
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg sm:rounded-full hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 transform hover:scale-105 font-medium flex items-center justify-center gap-2"
            >
              <i className="ri-add-line"></i>
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-mail-line text-white text-sm sm:text-base md:text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Total Templates</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-check-line text-white text-sm sm:text-base md:text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Active Templates</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-folder-line text-white text-sm sm:text-base md:text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Categories</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
                  {categories.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12 bg-yellow-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-settings-line text-white text-sm sm:text-base md:text-xl"></i>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm text-gray-600 truncate">Management</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Ready</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 md:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.name} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Status
              </label>
              <select
                value={filters.isActive}
                onChange={(e) =>
                  setFilters({ ...filters, isActive: e.target.value })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) =>
                  setFilters({ ...filters, search: e.target.value })
                }
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search templates..."
              />
            </div>
          </div>
        </div>

        {/* Templates List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Template
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr
                      key={template.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-4 lg:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {template.slug}
                          </div>
                          {template.description && (
                            <div className="text-xs text-gray-400 mt-1 truncate">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className="w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center mr-2 flex-shrink-0"
                            style={{
                              backgroundColor: getCategoryColor(template.category),
                            }}
                          >
                            <i
                              className={`${getCategoryIcon(template.category)} text-white text-xs lg:text-sm`}
                            ></i>
                          </div>
                          <span className="text-sm text-gray-900 capitalize truncate">
                            {template.category}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            template.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {template.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">
                        {template.updated_at
                          ? new Date(template.updated_at).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex space-x-1 lg:space-x-2">
                          <button
                            onClick={() => handlePreviewTemplate(template)}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                            title="Preview template"
                          >
                            <i className="ri-eye-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleEditTemplate(template)}
                            className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                            title="Edit template"
                          >
                            <i className="ri-edit-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleAssignTemplate(template)}
                            className="text-purple-600 hover:text-purple-800 p-1 rounded transition-colors"
                            title="Assign to functions"
                          >
                            <i className="ri-link text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleTestMail(template)}
                            className="text-orange-600 hover:text-orange-800 p-1 rounded transition-colors"
                            title="Send test email"
                          >
                            <i className="ri-send-plane-line text-sm"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id!)}
                            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                            title="Delete template"
                          >
                            <i className="ri-delete-bin-line text-sm"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {templates.map((template) => (
                <div key={template.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {template.name}
                      </h3>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {template.slug}
                      </p>
                      {template.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                    </div>
                    <span
                      className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                        template.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {template.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: getCategoryColor(template.category),
                        }}
                      >
                        <i
                          className={`${getCategoryIcon(template.category)} text-white text-xs`}
                        ></i>
                      </div>
                      <span className="text-xs text-gray-600 capitalize truncate">
                        {template.category}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">
                        {template.updated_at
                          ? new Date(template.updated_at).toLocaleDateString()
                          : "Never"}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePreviewTemplate(template)}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Preview"
                      >
                        <i className="ri-eye-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleEditTemplate(template)}
                        className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <i className="ri-edit-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleAssignTemplate(template)}
                        className="text-purple-600 hover:text-purple-800 p-2 rounded-lg hover:bg-purple-50 transition-colors"
                        title="Assign"
                      >
                        <i className="ri-link text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleTestMail(template)}
                        className="text-orange-600 hover:text-orange-800 p-2 rounded-lg hover:bg-orange-50 transition-colors"
                        title="Test"
                      >
                        <i className="ri-send-plane-line text-sm"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id!)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <i className="ri-delete-bin-line text-sm"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {templates.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
            <i className="ri-mail-line text-3xl sm:text-4xl text-gray-400 mb-4 block"></i>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No email templates found</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
              Get started by creating your first email template to manage communications.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 font-medium inline-flex items-center gap-2"
            >
              <i className="ri-add-line"></i>
              Create Your First Template
            </button>
          </div>
        )}

      {/* Create Template Modal */}
      {showCreateModal && (
        <TemplateModal
          title="Create Email Template"
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onSubmit={handleCreateTemplate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Template Modal */}
      {showEditModal && selectedTemplate && (
        <TemplateModal
          title="Edit Email Template"
          formData={formData}
          setFormData={setFormData}
          categories={categories}
          onSubmit={handleUpdateTemplate}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {/* Preview Template Modal */}
      {showPreviewModal && selectedTemplate && (
        <PreviewModal
          template={selectedTemplate}
          onClose={() => setShowPreviewModal(false)}
        />
      )}

      {/* Assignments Modal */}
      {showAssignmentsModal && selectedTemplate && (
        <AssignmentsModal
          template={selectedTemplate}
          emailFunctions={emailFunctions}
          assignments={assignments}
          onAssign={handleAssignTemplateToFunction}
          onUnassign={handleUnassignTemplate}
          onUpdatePriority={handleUpdateAssignmentPriority}
          onToggleStatus={handleToggleAssignmentStatus}
          onClose={() => setShowAssignmentsModal(false)}
        />
      )}

        {/* Test Mail Modal */}
        {showTestMailModal && selectedTemplate && (
          <TestMailModal
            template={selectedTemplate}
            onClose={() => setShowTestMailModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Template Modal Component
function TemplateModal({
  title,
  formData,
  setFormData,
  categories,
  onSubmit,
  onClose,
}: {
  title: string;
  formData: any;
  setFormData: (data: any) => void;
  categories: EmailTemplateCategory[];
  onSubmit: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xs xs:max-w-sm sm:max-w-2xl md:max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        <div className="p-3 xs:p-4 sm:p-6">
          <div className="flex items-start xs:items-center justify-between mb-4 xs:mb-6">
            <h2 className="text-base xs:text-lg sm:text-xl font-semibold text-gray-900 leading-tight break-words pr-2">{title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <i className="ri-close-line text-lg xs:text-xl sm:text-2xl"></i>
            </button>
          </div>

          <div className="space-y-4 xs:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                  Template Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                  Slug
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="template-slug"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Email subject line"
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Template description"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
              <div>
                <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center pt-4 sm:pt-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-xs xs:text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                HTML Content
              </label>
              <EmailTemplateEditor
                value={formData.html_content}
                onChange={(value) =>
                  setFormData({ ...formData, html_content: value })
                }
                placeholder="Write your email template HTML content..."
                variables={[
                  "{{userName}}",
                  "{{userEmail}}",
                  "{{verificationToken}}",
                  "{{verificationUrl}}",
                ]}
              />
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Text Content (Optional)
              </label>
              <textarea
                value={formData.text_content}
                onChange={(e) =>
                  setFormData({ ...formData, text_content: e.target.value })
                }
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={5}
                placeholder="Plain text version of the email..."
              />
            </div>
          </div>

          <div className="mt-4 xs:mt-6 flex flex-col xs:flex-row justify-end gap-2 xs:gap-3">
            <button
              onClick={onClose}
              className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs xs:text-sm font-medium"
            >
              Save Template
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Preview Modal Component
function PreviewModal({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  const [previewData, setPreviewData] = useState({
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    verificationToken: "abc123def456",
    verificationUrl: "https://readnwin.com/verify?token=abc123def456",
    resetToken: "reset123token456",
    resetUrl: "https://readnwin.com/reset?token=reset123token456",
    orderNumber: "ORD-2025-001",
    orderTotal: "$29.99",
    trackingNumber: "TRK123456789",
    estimatedDelivery: "2025-01-15",
  });

  const renderPreview = () => {
    let content = template.html_content;
    Object.entries(previewData).forEach(([key, value]) => {
      const variable = `{{${key}}}`;
      // Escape HTML entities in the replacement value to prevent XSS
      const escapedValue = value.replace(/[&<>"']/g, (match) => {
        const escapeMap: { [key: string]: string } = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;'
        };
        return escapeMap[match];
      });
      content = content.replace(new RegExp(variable, "g"), escapedValue);
    });
    return content;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Preview: {template.name}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Preview Data */}
            <div className="lg:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg border">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Preview Variables
                </h3>
                <div className="space-y-3">
                  {Object.entries(previewData).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {key}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) =>
                          setPreviewData((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Email Preview */}
            <div className="lg:col-span-2">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700">
                      Email Preview
                    </h3>
                    <div className="text-xs text-gray-500">
                      Subject: {template.subject}
                    </div>
                  </div>
                </div>
                <div className="bg-white">
                  <div
                    className="p-4"
                    dangerouslySetInnerHTML={{ __html: renderPreview() }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assignments Modal Component
function AssignmentsModal({
  template,
  emailFunctions,
  assignments,
  onAssign,
  onUnassign,
  onUpdatePriority,
  onToggleStatus,
  onClose,
}: {
  template: EmailTemplate;
  emailFunctions: EmailFunction[];
  assignments: EmailFunctionAssignment[];
  onAssign: (functionId: number, priority: number) => void;
  onUnassign: (functionId: number, templateId: number) => void;
  onUpdatePriority: (assignmentId: number, priority: number) => void;
  onToggleStatus: (assignmentId: number) => void;
  onClose: () => void;
}) {
  const [selectedFunction, setSelectedFunction] = useState<number | "">("");
  const [priority, setPriority] = useState(1);

  const templateAssignments = assignments.filter(
    (a) => a.template_id === template.id,
  );
  const availableFunctions = emailFunctions.filter(
    (f) => !templateAssignments.some((a) => a.function_id === f.id),
  );

  const handleAssign = () => {
    if (selectedFunction && typeof selectedFunction === "number") {
      onAssign(selectedFunction, priority);
      setSelectedFunction("");
      setPriority(1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Assign Template: {template.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage which email functions use this template
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <i className="ri-close-line text-2xl"></i>
            </button>
          </div>

          {/* Assignment Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <i className="ri-link text-blue-600"></i>
                  <span className="text-sm font-medium text-gray-900">
                    Current Assignments:
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {templateAssignments.length} assigned
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {templateAssignments.filter((a) => a.is_active).length}{" "}
                    active
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {availableFunctions.length} available
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-600">
                  Template:{" "}
                  <code className="bg-white px-1 py-0.5 rounded text-xs">
                    {template.slug}
                  </code>
                </p>
                <p className="text-xs text-gray-600">
                  Category:{" "}
                  <span className="capitalize">{template.category}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Current Assignments */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <i className="ri-check-double-line text-green-600 mr-2"></i>
                  Current Assignments
                </h3>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {templateAssignments.length} assigned
                </span>
              </div>

              {templateAssignments.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <i className="ri-link text-4xl mb-2 text-gray-400"></i>
                  <p className="text-gray-600">No functions assigned yet</p>
                  <p className="text-sm text-gray-500 mt-1">
                    This template is not being used by any email functions
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {templateAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <h4 className="font-semibold text-gray-900">
                              {assignment.function_name}
                            </h4>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                assignment.is_active
                                  ? "bg-green-100 text-green-800 border border-green-200"
                                  : "bg-red-100 text-red-800 border border-red-200"
                              }`}
                            >
                              {assignment.is_active ? "✓ Active" : "✗ Inactive"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">
                              {assignment.function_slug}
                            </code>
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-600">
                            <span className="flex items-center">
                              <i className="ri-sort-asc mr-1"></i>
                              Priority:{" "}
                              <strong className="ml-1">
                                {assignment.priority}
                              </strong>
                            </span>
                            <span className="flex items-center">
                              <i className="ri-time-line mr-1"></i>
                              Assigned:{" "}
                              {new Date(
                                assignment.created_at || "",
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => onToggleStatus(assignment.id!)}
                            className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                              assignment.is_active
                                ? "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200 border border-green-200"
                            }`}
                            title={
                              assignment.is_active
                                ? "Disable this assignment"
                                : "Enable this assignment"
                            }
                          >
                            {assignment.is_active ? "Disable" : "Enable"}
                          </button>
                          <button
                            onClick={() =>
                              onUnassign(
                                assignment.function_id,
                                assignment.template_id,
                              )
                            }
                            className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 border border-red-200 font-medium transition-colors"
                            title="Remove this assignment"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Update Priority
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="1"
                            value={assignment.priority}
                            onChange={(e) =>
                              onUpdatePriority(
                                assignment.id!,
                                parseInt(e.target.value),
                              )
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-xs text-gray-500">
                            (Lower = Higher Priority)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Assign to Function */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <i className="ri-add-line text-blue-600 mr-2"></i>
                Assign to Function
              </h3>
              {availableFunctions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <i className="ri-check-line text-4xl mb-2 text-gray-400"></i>
                  <p className="text-gray-600">
                    All functions are already assigned
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    This template is assigned to all available email functions
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Function
                    </label>
                    <select
                      value={selectedFunction}
                      onChange={(e) =>
                        setSelectedFunction(
                          e.target.value ? parseInt(e.target.value) : "",
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose a function...</option>
                      {availableFunctions.map((func) => (
                        <option key={func.id} value={func.id}>
                          {func.name} ({func.slug})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedFunction && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Priority (lower number = higher priority)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={priority}
                        onChange={(e) => setPriority(parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {selectedFunction && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Function Details
                      </h4>
                      {(() => {
                        const func = emailFunctions.find(
                          (f) => f.id === selectedFunction,
                        );
                        return func ? (
                          <div className="text-sm text-blue-800">
                            <p>
                              <strong>Description:</strong> <span className="break-words">{func.description}</span>
                            </p>
                            <p>
                              <strong>Category:</strong> <span className="break-words">{func.category}</span>
                            </p>
                            <p>
                              <strong>Required Variables:</strong>
                            </p>
                            <ul className="list-disc list-inside ml-2">
                              {func.required_variables.map(
                                (variable, index) => (
                                  <li key={index} className="break-words">{variable}</li>
                                ),
                              )}
                            </ul>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}

                  <button
                    onClick={handleAssign}
                    disabled={!selectedFunction}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Assign Template
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Test Mail Modal Component
function TestMailModal({
  template,
  onClose,
}: {
  template: EmailTemplate;
  onClose: () => void;
}) {
  const [testEmail, setTestEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');

  const handleSendTest = async () => {
    if (!testEmail) {
      setMessage('Please enter an email address');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmail)) {
      setMessage('Please enter a valid email address');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/admin/email-templates/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateId: template.id,
          testEmail,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Test email sent successfully!');
      } else {
        setMessage(data.error || 'Failed to send test email');
      }
    } catch (error) {
      setMessage('Error sending test email');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xs xs:max-w-sm sm:max-w-md w-full mx-2 xs:mx-4">
        <div className="p-3 xs:p-4 sm:p-6">
          <div className="flex items-start xs:items-center justify-between mb-3 xs:mb-4">
            <h2 className="text-sm xs:text-base sm:text-lg font-semibold text-gray-900 leading-tight break-words pr-2">
              Send Test Email
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
            >
              <i className="ri-close-line text-lg xs:text-xl"></i>
            </button>
          </div>

          <div className="space-y-3 xs:space-y-4">
            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1">
                Template: {template.name}
              </label>
              <p className="text-xs xs:text-sm text-gray-500 break-words">{template.subject}</p>
            </div>

            <div>
              <label className="block text-xs xs:text-sm font-medium text-gray-700 mb-1 xs:mb-2">
                Test Email Address
              </label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                className="w-full px-2 xs:px-3 py-1.5 xs:py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter email address"
              />
            </div>

            {message && (
              <div className={`p-2 xs:p-3 rounded-lg text-xs xs:text-sm break-words ${
                message.includes('success') 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {message}
              </div>
            )}
          </div>

          <div className="mt-4 xs:mt-6 flex flex-col xs:flex-row justify-end gap-2 xs:gap-3">
            <button
              onClick={onClose}
              className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-xs xs:text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSendTest}
              disabled={sending || !testEmail}
              className="w-full xs:w-auto px-3 xs:px-4 py-2 xs:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-xs xs:text-sm font-medium"
            >
              {sending ? 'Sending...' : 'Send Test Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}