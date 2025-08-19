"use client";

import React, { useState, useEffect } from "react";
import AboutManagement from "./AboutManagement";
import AboutUsSectionsManagement from "./AboutUsSectionsManagement";

type TabType = "page" | "sections";

interface TabConfig {
  id: TabType;
  label: string;
  icon: string;
  description: string;
}

const TABS: TabConfig[] = [
  {
    id: "page",
    label: "About Page",
    icon: "ri-file-text-line",
    description: "Manage the main about page layout and content",
  },
  {
    id: "sections",
    label: "About Sections",
    icon: "ri-list-check-line",
    description: "Manage individual about us sections",
  },
];

export default function EnhancedAboutManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("page");

  // Check if user has proper permissions for about management
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    // This could be enhanced with actual permission checking
    // For now, assume user has access if they reached this component
    setHasPermission(true);
  }, []);

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
              Manage your website&apos;s about page content and sections
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <i className="ri-information-line"></i>
            <span>Changes are saved automatically</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
          {activeTab === "page" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                <i className="ri-information-line"></i>
                <span>
                  This manages the overall about page layout, hero sections, and
                  structured content.
                </span>
              </div>
              <AboutManagement />
            </div>
          )}

          {activeTab === "sections" && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
                <i className="ri-information-line"></i>
                <span>
                  This manages individual about us sections like mission,
                  vision, team, etc.
                </span>
              </div>
              <AboutUsSectionsManagement />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <i className="ri-file-text-line text-xl text-blue-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">About Page</h3>
              <p className="text-sm text-gray-500">
                Main page content & layout
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <i className="ri-list-check-line text-xl text-green-600"></i>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Content Sections</h3>
              <p className="text-sm text-gray-500">Individual about sections</p>
            </div>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <div className="flex items-start gap-3">
          <i className="ri-lightbulb-line text-xl text-blue-600 mt-0.5"></i>
          <div>
            <h3 className="font-medium text-blue-900 mb-2">
              About Management Guide
            </h3>
            <div className="space-y-2 text-sm text-blue-800">
              <p>
                <strong>About Page:</strong> Manage the overall page structure,
                hero sections, mission grids, statistics, and team layouts. This
                controls the main about page appearance.
              </p>
              <p>
                <strong>About Sections:</strong> Manage individual content
                sections like mission, vision, story, team info, and values.
                These are displayed as structured content blocks.
              </p>
              <p>
                <strong>Best Practices:</strong> Keep content concise, update
                sections regularly, and ensure consistency between page layout
                and individual sections.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
