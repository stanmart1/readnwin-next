"use client";

import React, { useState, useEffect } from "react";
import { usePermissions } from "@/app/hooks/usePermissions";
import ModernAboutManagement from "./ModernAboutManagement";
import AboutUsSectionsManagement from "./AboutUsSectionsManagement";

type TabType = "modern" | "sections";

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "modern",
    label: "About Page",
    icon: "ri-file-text-line",
    description:
      "Modern unified about page content management with real-time sync",
  },
];

export default function EnhancedAboutManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("modern");

  // Check if user has proper permissions for about management
  const { hasAnyPermission, loading } = usePermissions();
  const hasPermission = hasAnyPermission(['content.aboutus', 'content.update']);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="ri-lock-line text-4xl text-gray-400 mb-4"></i>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don&apos;t have permission to manage about content.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              About Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your website&apos;s about page content with modern tools
              and real-time sync
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <i className="ri-check-circle-line"></i>
              <span>Real-time Sync</span>
            </div>
            <button
              onClick={() => window.open("/about", "_blank")}
              className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <i className="ri-external-link-line mr-2"></i>
              View Live Page
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                `}
              >
                <i className={`${tab.icon} text-lg`}></i>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Descriptions */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {TABS.find((tab) => tab.id === activeTab)?.description}
          </p>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
              <i className="ri-sparkle-line"></i>
              <span>
                Modern unified about page management with real-time preview
                and auto-save functionality.
              </span>
            </div>
            <ModernAboutManagement />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <i className="ri-magic-line text-xl text-blue-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Modern CMS</h3>
              <p className="text-sm text-gray-500">
                Unified content management
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <i className="ri-refresh-line text-xl text-green-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Real-time Sync</h3>
              <p className="text-sm text-gray-500">Instant page updates</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <i className="ri-eye-line text-xl text-purple-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Live Preview</h3>
              <p className="text-sm text-gray-500">See changes instantly</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg shadow-sm border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <i className="ri-lightbulb-line text-xl text-blue-600 mt-0.5"></i>
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              Modern About Management Features
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>✨ Unified Interface:</strong> Manage all about page
                sections in one modern interface with real-time preview and
                auto-save.
              </p>
              <p>
                <strong>🔄 Live Sync:</strong> Changes are instantly reflected
                on the public page without requiring manual refresh or cache
                clearing.
              </p>
              <p>
                <strong>📱 Responsive Design:</strong> Content management
                interface works seamlessly across desktop, tablet, and mobile
                devices.
              </p>
              <p>
                <strong>🎨 Rich Editor:</strong> Use the built-in rich text
                editor for formatting descriptions and content with full HTML
                support.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
