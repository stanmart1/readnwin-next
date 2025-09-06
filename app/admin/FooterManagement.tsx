'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface FooterData {
  company: { name: string; description: string; tagline: string };
  contact: { address: string; phone: string; email: string };
  social: { facebook: string; twitter: string; instagram: string; linkedin: string };
  links: { quick_links: Array<{ name: string; url: string }>; categories: Array<{ name: string; url: string }> };
  newsletter: { enabled: boolean; title: string; description: string };
}

export default function FooterManagement() {
  const [data, setData] = useState<FooterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState('');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await fetch('/api/admin/footer');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        toast.error('Failed to load footer data');
      }
    } catch (error) {
      toast.error('Failed to load footer data');
    } finally {
      setLoading(false);
    }
  };

  const updateSection = async (section: string, content: any) => {
    setSaving(section);
    try {
      const response = await fetch('/api/admin/footer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, content })
      });
      
      if (response.ok) {
        toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} updated successfully`);
        await fetchFooterData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update footer');
      }
    } catch (error) {
      toast.error('Error updating footer');
    } finally {
      setSaving('');
    }
  };

  const addQuickLink = () => {
    if (!data) return;
    const newLinks = [...data.links.quick_links, { name: '', url: '' }];
    setData({...data, links: {...data.links, quick_links: newLinks}});
  };

  const removeQuickLink = (index: number) => {
    if (!data) return;
    const newLinks = data.links.quick_links.filter((_, i) => i !== index);
    setData({...data, links: {...data.links, quick_links: newLinks}});
  };

  const updateQuickLink = (index: number, field: 'name' | 'url', value: string) => {
    if (!data) return;
    const newLinks = [...data.links.quick_links];
    newLinks[index] = {...newLinks[index], [field]: value};
    setData({...data, links: {...data.links, quick_links: newLinks}});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading footer settings...</span>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="text-center py-12">
        <i className="ri-error-warning-line text-4xl text-red-400 mb-4"></i>
        <p className="text-gray-600 font-medium">Failed to load footer data</p>
        <button 
          onClick={fetchFooterData}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Footer Management</h1>
            <p className="text-gray-600 mt-1">Manage footer content and links across your site</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center"
            >
              <i className={`ri-${previewMode ? 'edit' : 'eye'}-line mr-2`}></i>
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
            <button
              onClick={fetchFooterData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center disabled:opacity-50"
            >
              <i className={`ri-refresh-line mr-2 ${loading ? 'animate-spin' : ''}`}></i>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="ri-building-line text-blue-600 text-xl"></i>
            <h3 className="text-lg font-semibold text-gray-900">Company Information</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Brand Identity
          </span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
            <input
              type="text"
              placeholder="ReadnWin"
              value={data.company.name}
              onChange={(e) => setData({...data, company: {...data.company, name: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
            <input
              type="text"
              placeholder="Your Digital Bookstore"
              value={data.company.tagline}
              onChange={(e) => setData({...data, company: {...data.company, tagline: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              placeholder="Company description that appears in the footer"
              value={data.company.description}
              onChange={(e) => setData({...data, company: {...data.company, description: e.target.value}})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">{data.company.description.length}/500 characters</p>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateSection('company', data.company)}
            disabled={saving === 'company'}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {saving === 'company' ? (
              <><i className="ri-loader-4-line animate-spin mr-2"></i>Updating...</>
            ) : (
              <><i className="ri-save-line mr-2"></i>Update Company Info</>
            )}
          </button>
        </div>
      </div>



      {/* Social Media Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="ri-share-line text-purple-600 text-xl"></i>
            <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Social Presence
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="ri-facebook-fill text-blue-600 mr-1"></i>Facebook
            </label>
            <input
              type="url"
              placeholder="https://facebook.com/readnwin"
              value={data.social.facebook}
              onChange={(e) => setData({...data, social: {...data.social, facebook: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="ri-twitter-fill text-blue-400 mr-1"></i>Twitter
            </label>
            <input
              type="url"
              placeholder="https://twitter.com/readnwin"
              value={data.social.twitter}
              onChange={(e) => setData({...data, social: {...data.social, twitter: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="ri-instagram-fill text-pink-600 mr-1"></i>Instagram
            </label>
            <input
              type="url"
              placeholder="https://instagram.com/readnwin"
              value={data.social.instagram}
              onChange={(e) => setData({...data, social: {...data.social, instagram: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <i className="ri-linkedin-fill text-blue-700 mr-1"></i>LinkedIn
            </label>
            <input
              type="url"
              placeholder="https://linkedin.com/company/readnwin"
              value={data.social.linkedin}
              onChange={(e) => setData({...data, social: {...data.social, linkedin: e.target.value}})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateSection('social', data.social)}
            disabled={saving === 'social'}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {saving === 'social' ? (
              <><i className="ri-loader-4-line animate-spin mr-2"></i>Updating...</>
            ) : (
              <><i className="ri-save-line mr-2"></i>Update Social Links</>
            )}
          </button>
        </div>
      </div>

      {/* Quick Links Management */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="ri-links-line text-orange-600 text-xl"></i>
            <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
          </div>
          <button
            onClick={addQuickLink}
            className="px-3 py-1 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm flex items-center"
          >
            <i className="ri-add-line mr-1"></i>Add Link
          </button>
        </div>
        <div className="space-y-3">
          {data.links.quick_links.map((link, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Link Name"
                  value={link.name}
                  onChange={(e) => updateQuickLink(index, 'name', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="URL (e.g., /about)"
                  value={link.url}
                  onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => removeQuickLink(index)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateSection('links', data.links)}
            disabled={saving === 'links'}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {saving === 'links' ? (
              <><i className="ri-loader-4-line animate-spin mr-2"></i>Updating...</>
            ) : (
              <><i className="ri-save-line mr-2"></i>Update Links</>
            )}
          </button>
        </div>
      </div>

      {/* Newsletter Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <i className="ri-mail-send-line text-indigo-600 text-xl"></i>
            <h3 className="text-lg font-semibold text-gray-900">Newsletter Settings</h3>
          </div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Email Marketing
          </span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="newsletter-enabled"
              checked={data.newsletter.enabled}
              onChange={(e) => setData({...data, newsletter: {...data.newsletter, enabled: e.target.checked}})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor="newsletter-enabled" className="text-sm font-medium text-gray-700">
              Enable Newsletter Signup
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Title</label>
              <input
                type="text"
                placeholder="Stay Updated"
                value={data.newsletter.title}
                onChange={(e) => setData({...data, newsletter: {...data.newsletter, title: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <input
                type="text"
                placeholder="Get the latest books and offers"
                value={data.newsletter.description}
                onChange={(e) => setData({...data, newsletter: {...data.newsletter, description: e.target.value}})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => updateSection('newsletter', data.newsletter)}
            disabled={saving === 'newsletter'}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center"
          >
            {saving === 'newsletter' ? (
              <><i className="ri-loader-4-line animate-spin mr-2"></i>Updating...</>
            ) : (
              <><i className="ri-save-line mr-2"></i>Update Newsletter</>
            )}
          </button>
        </div>
      </div>

      {/* Preview Section */}
      {previewMode && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <i className="ri-eye-line text-gray-600 text-xl"></i>
              <h3 className="text-lg font-semibold text-gray-900">Footer Preview</h3>
            </div>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              Live Preview
            </span>
          </div>
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gray-900 text-white p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="lg:col-span-1">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <i className="ri-book-line text-white text-lg"></i>
                    </div>
                    <span className="text-xl font-bold">{data.company.name}</span>
                  </div>
                  <p className="text-gray-400 mb-6 text-sm leading-relaxed">
                    {data.company.description}
                  </p>
                  <div className="flex space-x-4">
                    {data.social.facebook && (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <i className="ri-facebook-fill text-lg"></i>
                      </div>
                    )}
                    {data.social.twitter && (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <i className="ri-twitter-fill text-lg"></i>
                      </div>
                    )}
                    {data.social.instagram && (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <i className="ri-instagram-fill text-lg"></i>
                      </div>
                    )}
                    {data.social.linkedin && (
                      <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
                        <i className="ri-linkedin-fill text-lg"></i>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Empty space */}
                <div className="lg:col-span-2"></div>
                
                {/* Quick Links */}
                <div className="lg:col-span-1">
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    {data.links.quick_links.map((link, index) => (
                      <li key={index}>
                        <span className="text-gray-400 text-sm">{link.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Bottom Bar */}
              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400 text-sm">
                  © 2025 {data.company.name}. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}