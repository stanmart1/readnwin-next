"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Simple rich text editor replacement

interface AboutContent {
  hero: {
    title: string;
    subtitle: string;
  };
  aboutSection: {
    image: string;
    imageAlt: string;
    overlayTitle: string;
    overlayDescription: string;
  };
  mission: {
    title: string;
    description: string;
    features: string[];
  };
  missionGrid: Array<{
    icon: string;
    title: string;
    description: string;
    color: string;
  }>;
  stats: Array<{
    number: string;
    label: string;
  }>;
  values: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  story: {
    title: string;
    description: string;
    timeline: Array<{
      year: string;
      title: string;
      description: string;
    }>;
  };
  team: Array<{
    name: string;
    role: string;
    bio: string;
    image: string;
    linkedin: string;
    twitter: string;
  }>;
  cta: {
    title: string;
    description: string;
    primaryButton: string;
    secondaryButton: string;
  };
}

const defaultContent: AboutContent = {
  hero: {
    title: "About ReadnWin",
    subtitle:
      "Revolutionizing the way people read, learn, and grow through technology",
  },
  aboutSection: {
    image: "/images/about.png",
    imageAlt: "ReadnWin about section - Empowering minds through reading",
    overlayTitle: "About ReadnWin",
    overlayDescription: "Empowering minds through reading and technology"
  },
  mission: {
    title: "Our Mission",
    description:
      "At ReadnWin, we believe that reading is the foundation of personal growth and societal progress.",
    features: [
      "Unlimited Access",
      "AI-Powered Recommendations",
      "Global Community",
    ],
  },
  missionGrid: [
    {
      icon: "ri-book-line",
      title: "Digital Library",
      description: "Access millions of books instantly",
      color: "text-blue-600",
    },
    {
      icon: "ri-brain-line",
      title: "Smart Learning",
      description: "AI-powered reading insights",
      color: "text-purple-600",
    },
    {
      icon: "ri-group-line",
      title: "Reader Community",
      description: "Connect with fellow readers",
      color: "text-cyan-600",
    },
    {
      icon: "ri-device-line",
      title: "Multi-Platform",
      description: "Read anywhere, anytime",
      color: "text-green-600",
    },
  ],
  stats: [
    { number: "50K+", label: "Active Readers" },
    { number: "100K+", label: "Books Available" },
    { number: "95%", label: "Reader Satisfaction" },
    { number: "24/7", label: "Support Available" },
  ],
  values: [
    {
      icon: "ri-book-open-line",
      title: "Accessibility",
      description:
        "Making reading accessible to everyone, regardless of background or ability.",
    },
    {
      icon: "ri-lightbulb-line",
      title: "Innovation",
      description:
        "Continuously innovating to enhance the reading experience with cutting-edge technology.",
    },
    {
      icon: "ri-heart-line",
      title: "Community",
      description:
        "Building a global community of readers who share knowledge and inspire each other.",
    },
    {
      icon: "ri-shield-check-line",
      title: "Quality",
      description:
        "Maintaining the highest standards in content curation and platform reliability.",
    },
  ],
  story: {
    title: "Our Story",
    description:
      "ReadnWin was born from a simple observation: while technology was advancing rapidly, the way we read and access literature remained largely unchanged.",
    timeline: [
      {
        year: "2019",
        title: "Founded",
        description: "Started with a vision to democratize reading",
      },
      {
        year: "2021",
        title: "Growth",
        description: "Reached 10,000 active readers",
      },
      {
        year: "2023",
        title: "Innovation",
        description: "Launched AI-powered reading recommendations",
      },
      {
        year: "2024",
        title: "Expansion",
        description: "Expanded to serve readers worldwide",
      },
    ],
  },
  team: [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      image: "/images/team/sarah-johnson.jpg",
      bio: "Former librarian with 15+ years in digital education",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Dr. Michael Chen",
      role: "CTO",
      image: "/images/team/michael-chen.jpg",
      bio: "AI researcher with expertise in natural language processing",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Content",
      image: "/images/team/emma-rodriguez.jpg",
      bio: "Former publishing executive passionate about accessibility",
      linkedin: "#",
      twitter: "#",
    },
    {
      name: "David Wilson",
      role: "Head of Community",
      image: "/images/team/david-wilson.jpg",
      bio: "Community builder with experience in educational platforms",
      linkedin: "#",
      twitter: "#",
    },
  ],
  cta: {
    title: "Join the Reading Revolution",
    description:
      "Start your journey with ReadnWin and discover a world of knowledge, imagination, and growth.",
    primaryButton: "Get Started Free",
    secondaryButton: "Learn More",
  },
};

const iconOptions = [
  "ri-book-line",
  "ri-book-open-line",
  "ri-brain-line",
  "ri-lightbulb-line",
  "ri-heart-line",
  "ri-shield-check-line",
  "ri-group-line",
  "ri-device-line",
  "ri-star-line",
  "ri-award-line",
  "ri-trophy-line",
  "ri-flag-line",
  "ri-compass-line",
  "ri-rocket-line",
  "ri-magic-line",
  "ri-fire-line",
];

const colorOptions = [
  "text-blue-600",
  "text-purple-600",
  "text-cyan-600",
  "text-green-600",
  "text-red-600",
  "text-yellow-600",
  "text-pink-600",
  "text-indigo-600",
];



export default function ModernAboutManagement() {
  const [content, setContent] = useState<AboutContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [showPreview, setShowPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Load content on component mount
  useEffect(() => {
    loadContent();
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (unsavedChanges) {
      const autoSaveTimer = setTimeout(() => {
        handleSave(true);
      }, 10000); // Auto-save after 10 seconds of inactivity

      return () => clearTimeout(autoSaveTimer);
    }
  }, [content, unsavedChanges]);

  const loadContent = async () => {
    try {
      setLoading(true);

      // Try to load from system_settings first
      const response = await fetch("/api/admin/about", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.content) {
          try {
            const parsedContent =
              typeof data.content === "string"
                ? JSON.parse(data.content)
                : data.content;
            setContent({ ...defaultContent, ...parsedContent });
          } catch (parseError) {
            console.warn("Failed to parse content, using default");
            setContent(defaultContent);
          }
        }
      } else {
        console.warn("Failed to load content, using default");
        setContent(defaultContent);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      toast.error("Failed to load content");
      setContent(defaultContent);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (isAutoSave = false) => {
    try {
      setSaving(true);

      const response = await fetch("/api/admin/about", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          setting_key: "about_page_content",
          setting_value: JSON.stringify(content),
          description: "About page content configuration",
        }),
      });

      if (response.ok) {
        setLastSaved(new Date());
        setUnsavedChanges(false);

        if (!isAutoSave) {
          toast.success("Content saved successfully!");
        }

        // Trigger content update event for the public page
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("about-content-updated", {
              detail: { content, timestamp: Date.now() },
            }),
          );

          // Also store in localStorage as backup
          localStorage.setItem("about-content-updated", Date.now().toString());
        }
      } else {
        throw new Error("Failed to save content");
      }
    } catch (error) {
      console.error("Error saving content:", error);
      if (!isAutoSave) {
        toast.error("Failed to save content");
      }
    } finally {
      setSaving(false);
    }
  };

  const updateContent = useCallback((section: keyof AboutContent, data: any) => {
    setContent((prev) => {
      // Prevent unnecessary updates if data is the same
      if (JSON.stringify(prev[section]) === JSON.stringify(data)) {
        return prev;
      }
      return {
        ...prev,
        [section]: data,
      };
    });
    setUnsavedChanges(true);
  }, []);

  const handleImageUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "about");

    const response = await fetch("/api/admin/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to upload image");
    }

    const data = await response.json();
    return data.url;
  };

  const sections = [
    { id: "hero", label: "Hero Section", icon: "ri-home-line" },
    { id: "aboutSection", label: "About Section", icon: "ri-image-line" },
    { id: "mission", label: "Mission", icon: "ri-target-line" },
    { id: "missionGrid", label: "Mission Grid", icon: "ri-grid-line" },
    { id: "stats", label: "Statistics", icon: "ri-bar-chart-line" },
    { id: "values", label: "Values", icon: "ri-heart-line" },
    { id: "story", label: "Our Story", icon: "ri-book-line" },
    { id: "team", label: "Team", icon: "ri-team-line" },
    { id: "cta", label: "Call to Action", icon: "ri-megaphone-line" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              About Page Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage all content sections of your About Us page in real-time
            </p>
            {lastSaved && (
              <p className="text-sm text-green-600 mt-2">
                <i className="ri-check-line mr-1"></i>
                Last saved: {lastSaved.toLocaleTimeString()}
              </p>
            )}
            {unsavedChanges && (
              <p className="text-sm text-amber-600 mt-1">
                <i className="ri-time-line mr-1"></i>
                Unsaved changes (auto-save in progress)
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <i className="ri-eye-line mr-2"></i>
              {showPreview ? "Hide Preview" : "Show Preview"}
            </button>
            <button
              onClick={() => window.open("/about", "_blank")}
              className="px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
            >
              <i className="ri-external-link-line mr-2"></i>
              View Live Page
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {saving ? (
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
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
            <h3 className="font-semibold text-gray-900 mb-4">Page Sections</h3>
            <nav className="space-y-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeSection === section.id
                      ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <i className={`${section.icon} text-lg`}></i>
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {/* Hero Section */}
                {activeSection === "hero" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-home-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Hero Section
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Main Title
                        </label>
                        <input
                          type="text"
                          value={content.hero.title}
                          onChange={(e) =>
                            updateContent("hero", {
                              ...content.hero,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter main title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtitle
                        </label>
                        <textarea
                          value={content.hero.subtitle}
                          onChange={(e) =>
                            updateContent("hero", {
                              ...content.hero,
                              subtitle: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter subtitle description"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* About Section */}
                {activeSection === "aboutSection" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-image-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        About Section
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image URL
                        </label>
                        <input
                          type="text"
                          value={content.aboutSection.image}
                          onChange={(e) =>
                            updateContent("aboutSection", {
                              ...content.aboutSection,
                              image: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter image URL"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Image Alt Text
                        </label>
                        <input
                          type="text"
                          value={content.aboutSection.imageAlt}
                          onChange={(e) =>
                            updateContent("aboutSection", {
                              ...content.aboutSection,
                              imageAlt: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter alt text for accessibility"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlay Title
                        </label>
                        <input
                          type="text"
                          value={content.aboutSection.overlayTitle}
                          onChange={(e) =>
                            updateContent("aboutSection", {
                              ...content.aboutSection,
                              overlayTitle: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter overlay title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Overlay Description
                        </label>
                        <textarea
                          value={content.aboutSection.overlayDescription}
                          onChange={(e) =>
                            updateContent("aboutSection", {
                              ...content.aboutSection,
                              overlayDescription: e.target.value,
                            })
                          }
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter overlay description"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Mission Section */}
                {activeSection === "mission" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-target-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Mission Section
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mission Title
                        </label>
                        <input
                          type="text"
                          value={content.mission.title}
                          onChange={(e) =>
                            updateContent("mission", {
                              ...content.mission,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mission Description
                        </label>
                        <textarea
                          value={content.mission.description}
                          onChange={(e) =>
                            updateContent("mission", {
                              ...content.mission,
                              description: e.target.value,
                            })
                          }
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter mission description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Key Features
                        </label>
                        <div className="space-y-2">
                          {content.mission.features.map((feature, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [
                                    ...content.mission.features,
                                  ];
                                  newFeatures[index] = e.target.value;
                                  updateContent("mission", {
                                    ...content.mission,
                                    features: newFeatures,
                                  });
                                }}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const newFeatures =
                                    content.mission.features.filter(
                                      (_, i) => i !== index,
                                    );
                                  updateContent("mission", {
                                    ...content.mission,
                                    features: newFeatures,
                                  });
                                }}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => {
                              const newFeatures = [
                                ...content.mission.features,
                                "",
                              ];
                              updateContent("mission", {
                                ...content.mission,
                                features: newFeatures,
                              });
                            }}
                            className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                          >
                            <i className="ri-add-line mr-2"></i>
                            Add Feature
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mission Grid Section */}
                {activeSection === "missionGrid" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-grid-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Mission Grid
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.missionGrid.map((item, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              Grid Item {index + 1}
                            </h3>
                            <button
                              onClick={() => {
                                const newGrid = content.missionGrid.filter(
                                  (_, i) => i !== index,
                                );
                                updateContent("missionGrid", newGrid);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Icon
                              </label>
                              <select
                                value={item.icon}
                                onChange={(e) => {
                                  const newGrid = [...content.missionGrid];
                                  newGrid[index] = {
                                    ...item,
                                    icon: e.target.value,
                                  };
                                  updateContent("missionGrid", newGrid);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                {iconOptions.map((icon) => (
                                  <option key={icon} value={icon}>
                                    {icon}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Color
                              </label>
                              <select
                                value={item.color}
                                onChange={(e) => {
                                  const newGrid = [...content.missionGrid];
                                  newGrid[index] = {
                                    ...item,
                                    color: e.target.value,
                                  };
                                  updateContent("missionGrid", newGrid);
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              >
                                {colorOptions.map((color) => (
                                  <option key={color} value={color}>
                                    {color
                                      .replace("text-", "")
                                      .replace("-600", "")}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <input
                            type="text"
                            placeholder="Title"
                            value={item.title}
                            onChange={(e) => {
                              const newGrid = [...content.missionGrid];
                              newGrid[index] = {
                                ...item,
                                title: e.target.value,
                              };
                              updateContent("missionGrid", newGrid);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />

                          <textarea
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => {
                              const newGrid = [...content.missionGrid];
                              newGrid[index] = {
                                ...item,
                                description: e.target.value,
                              };
                              updateContent("missionGrid", newGrid);
                            }}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newItem = {
                            icon: "ri-star-line",
                            title: "",
                            description: "",
                            color: "text-blue-600",
                          };
                          updateContent("missionGrid", [
                            ...content.missionGrid,
                            newItem,
                          ]);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <i className="ri-add-line text-2xl mb-2"></i>
                        <p>Add Grid Item</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Stats Section */}
                {activeSection === "stats" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-bar-chart-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Statistics
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {content.stats.map((stat, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              Stat {index + 1}
                            </h3>
                            <button
                              onClick={() => {
                                const newStats = content.stats.filter(
                                  (_, i) => i !== index,
                                );
                                updateContent("stats", newStats);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Number (e.g., 50K+)"
                            value={stat.number}
                            onChange={(e) => {
                              const newStats = [...content.stats];
                              newStats[index] = {
                                ...stat,
                                number: e.target.value,
                              };
                              updateContent("stats", newStats);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />

                          <input
                            type="text"
                            placeholder="Label"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = [...content.stats];
                              newStats[index] = {
                                ...stat,
                                label: e.target.value,
                              };
                              updateContent("stats", newStats);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newStat = { number: "", label: "" };
                          updateContent("stats", [...content.stats, newStat]);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <i className="ri-add-line text-2xl mb-2"></i>
                        <p>Add Statistic</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Values Section */}
                {activeSection === "values" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-heart-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Company Values
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.values.map((value, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              Value {index + 1}
                            </h3>
                            <button
                              onClick={() => {
                                const newValues = content.values.filter(
                                  (_, i) => i !== index,
                                );
                                updateContent("values", newValues);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Icon
                            </label>
                            <select
                              value={value.icon}
                              onChange={(e) => {
                                const newValues = [...content.values];
                                newValues[index] = {
                                  ...value,
                                  icon: e.target.value,
                                };
                                updateContent("values", newValues);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            >
                              {iconOptions.map((icon) => (
                                <option key={icon} value={icon}>
                                  {icon}
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            type="text"
                            placeholder="Value Title"
                            value={value.title}
                            onChange={(e) => {
                              const newValues = [...content.values];
                              newValues[index] = {
                                ...value,
                                title: e.target.value,
                              };
                              updateContent("values", newValues);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Description
                            </label>
                            <textarea
                              value={value.description}
                              onChange={(e) => {
                                const newValues = [...content.values];
                                newValues[index] = {
                                  ...value,
                                  description: e.target.value,
                                };
                                updateContent("values", newValues);
                              }}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              placeholder="Enter value description"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newValue = {
                            icon: "ri-star-line",
                            title: "",
                            description: "",
                          };
                          updateContent("values", [
                            ...content.values,
                            newValue,
                          ]);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <i className="ri-add-line text-2xl mb-2"></i>
                        <p>Add Value</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* Story Section */}
                {activeSection === "story" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-book-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Our Story
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Story Title
                        </label>
                        <input
                          type="text"
                          value={content.story.title}
                          onChange={(e) =>
                            updateContent("story", {
                              ...content.story,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Story Description
                        </label>
                        <textarea
                          value={content.story.description}
                          onChange={(e) =>
                            updateContent("story", {
                              ...content.story,
                              description: e.target.value,
                            })
                          }
                          rows={6}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter story description"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-4">
                          Timeline
                        </label>
                        <div className="space-y-4">
                          {content.story.timeline.map((item, index) => (
                            <div
                              key={index}
                              className="border border-gray-200 rounded-lg p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-gray-900">
                                  Timeline Item {index + 1}
                                </h3>
                                <button
                                  onClick={() => {
                                    const newTimeline =
                                      content.story.timeline.filter(
                                        (_, i) => i !== index,
                                      );
                                    updateContent("story", {
                                      ...content.story,
                                      timeline: newTimeline,
                                    });
                                  }}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <i className="ri-delete-bin-line"></i>
                                </button>
                              </div>

                              <div className="grid grid-cols-3 gap-3">
                                <input
                                  type="text"
                                  placeholder="Year"
                                  value={item.year}
                                  onChange={(e) => {
                                    const newTimeline = [
                                      ...content.story.timeline,
                                    ];
                                    newTimeline[index] = {
                                      ...item,
                                      year: e.target.value,
                                    };
                                    updateContent("story", {
                                      ...content.story,
                                      timeline: newTimeline,
                                    });
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                                <input
                                  type="text"
                                  placeholder="Title"
                                  value={item.title}
                                  onChange={(e) => {
                                    const newTimeline = [
                                      ...content.story.timeline,
                                    ];
                                    newTimeline[index] = {
                                      ...item,
                                      title: e.target.value,
                                    };
                                    updateContent("story", {
                                      ...content.story,
                                      timeline: newTimeline,
                                    });
                                  }}
                                  className="px-3 py-2 border border-gray-300 rounded-lg"
                                />
                              </div>

                              <textarea
                                placeholder="Description"
                                value={item.description}
                                onChange={(e) => {
                                  const newTimeline = [
                                    ...content.story.timeline,
                                  ];
                                  newTimeline[index] = {
                                    ...item,
                                    description: e.target.value,
                                  };
                                  updateContent("story", {
                                    ...content.story,
                                    timeline: newTimeline,
                                  });
                                }}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              />
                            </div>
                          ))}

                          <button
                            onClick={() => {
                              const newItem = {
                                year: "",
                                title: "",
                                description: "",
                              };
                              updateContent("story", {
                                ...content.story,
                                timeline: [...content.story.timeline, newItem],
                              });
                            }}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                          >
                            <i className="ri-add-line mr-2"></i>
                            Add Timeline Item
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Team Section */}
                {activeSection === "team" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-team-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Team Members
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {content.team.map((member, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 space-y-4"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              Team Member {index + 1}
                            </h3>
                            <button
                              onClick={() => {
                                const newTeam = content.team.filter(
                                  (_, i) => i !== index,
                                );
                                updateContent("team", newTeam);
                              }}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <i className="ri-delete-bin-line"></i>
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Name"
                              value={member.name}
                              onChange={(e) => {
                                const newTeam = [...content.team];
                                newTeam[index] = {
                                  ...member,
                                  name: e.target.value,
                                };
                                updateContent("team", newTeam);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Role"
                              value={member.role}
                              onChange={(e) => {
                                const newTeam = [...content.team];
                                newTeam[index] = {
                                  ...member,
                                  role: e.target.value,
                                };
                                updateContent("team", newTeam);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>

                          <input
                            type="text"
                            placeholder="Image URL"
                            value={member.image}
                            onChange={(e) => {
                              const newTeam = [...content.team];
                              newTeam[index] = {
                                ...member,
                                image: e.target.value,
                              };
                              updateContent("team", newTeam);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />

                          <textarea
                            placeholder="Bio"
                            value={member.bio}
                            onChange={(e) => {
                              const newTeam = [...content.team];
                              newTeam[index] = {
                                ...member,
                                bio: e.target.value,
                              };
                              updateContent("team", newTeam);
                            }}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />

                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="LinkedIn URL"
                              value={member.linkedin}
                              onChange={(e) => {
                                const newTeam = [...content.team];
                                newTeam[index] = {
                                  ...member,
                                  linkedin: e.target.value,
                                };
                                updateContent("team", newTeam);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                            <input
                              type="text"
                              placeholder="Twitter URL"
                              value={member.twitter}
                              onChange={(e) => {
                                const newTeam = [...content.team];
                                newTeam[index] = {
                                  ...member,
                                  twitter: e.target.value,
                                };
                                updateContent("team", newTeam);
                              }}
                              className="px-3 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => {
                          const newMember = {
                            name: "",
                            role: "",
                            image: "/images/team/placeholder-avatar.jpg",
                            bio: "",
                            linkedin: "#",
                            twitter: "#",
                          };
                          updateContent("team", [...content.team, newMember]);
                        }}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition-colors"
                      >
                        <i className="ri-add-line text-2xl mb-2"></i>
                        <p>Add Team Member</p>
                      </button>
                    </div>
                  </div>
                )}

                {/* CTA Section */}
                {activeSection === "cta" && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="ri-megaphone-line text-2xl text-blue-600"></i>
                      <h2 className="text-2xl font-bold text-gray-900">
                        Call to Action
                      </h2>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Title
                        </label>
                        <input
                          type="text"
                          value={content.cta.title}
                          onChange={(e) =>
                            updateContent("cta", {
                              ...content.cta,
                              title: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CTA Description
                        </label>
                        <textarea
                          value={content.cta.description}
                          onChange={(e) =>
                            updateContent("cta", {
                              ...content.cta,
                              description: e.target.value,
                            })
                          }
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter CTA description"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Primary Button Text
                          </label>
                          <input
                            type="text"
                            value={content.cta.primaryButton}
                            onChange={(e) =>
                              updateContent("cta", {
                                ...content.cta,
                                primaryButton: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Secondary Button Text
                          </label>
                          <input
                            type="text"
                            value={content.cta.secondaryButton}
                            onChange={(e) =>
                              updateContent("cta", {
                                ...content.cta,
                                secondaryButton: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Live Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">
                  Live Preview
                </h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
                <div className="space-y-8">
                  {/* Preview Hero */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg">
                    <h1 className="text-3xl font-bold mb-4">
                      {content.hero.title}
                    </h1>
                    <p className="text-blue-100">{content.hero.subtitle}</p>
                  </div>

                  {/* Preview Mission */}
                  <div className="border border-gray-200 rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      {content.mission.title}
                    </h2>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: content.mission.description,
                      }}
                      className="text-gray-600 mb-4"
                    />
                    <div className="flex flex-wrap gap-2">
                      {content.mission.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preview Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {content.missionGrid.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 text-center"
                      >
                        <i
                          className={`${item.icon} text-2xl ${item.color} mb-2`}
                        ></i>
                        <h3 className="font-medium text-gray-900 mb-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {item.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Preview Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {content.stats.map((stat, index) => (
                      <div
                        key={index}
                        className="text-center border border-gray-200 rounded-lg p-4"
                      >
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {stat.number}
                        </div>
                        <p className="text-gray-600 text-sm">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
