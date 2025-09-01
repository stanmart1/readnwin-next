'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEReaderStore } from '@/stores/ereaderStore';
import { 
  Settings, 
  Type, 
  Eye, 
  Layout, 
  Volume2, 
  Accessibility, 
  X, 
  Sun,
  Moon,
  Palette,
  RotateCcw,
  Search
} from 'lucide-react';

export default function RightDrawer() {
  const {
    drawerState,
    settings,
    updateSettings,
    setDrawerSection,
  } = useEReaderStore();

  const [searchTerm, setSearchTerm] = useState('');

  const isOpen = drawerState.rightDrawer.isOpen;
  const activeSection = drawerState.rightDrawer.activeSection;

  const sections = [
    { id: 'typography', label: 'Typography', icon: Type },
    { id: 'display', label: 'Display', icon: Eye },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'audio', label: 'Audio', icon: Volume2 },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility },
  ];

  const filteredSections = sections.filter(section =>
    section.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFontSizeChange = (newSize: number) => {
    updateSettings({ fontSize: Math.max(12, Math.min(24, newSize)) });
  };

  const handleLineHeightChange = (newHeight: number) => {
    updateSettings({ lineHeight: Math.max(1.2, Math.min(2.0, newHeight)) });
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'sepia') => {
    updateSettings({ theme });
  };

  const handleReadingWidthChange = (width: 'narrow' | 'medium' | 'wide') => {
    updateSettings({ readingWidth: width });
  };

  const handleMarginsChange = (margins: number) => {
    updateSettings({ margins: Math.max(0, Math.min(100, margins)) });
  };

  const handlePaddingChange = (padding: number) => {
    updateSettings({ padding: Math.max(0, Math.min(50, padding)) });
  };

  const handleTTSEnabledChange = (enabled: boolean) => {
    updateSettings({
      textToSpeech: { ...settings.textToSpeech, enabled }
    });
  };

  const handleTTSSpeedChange = (speed: number) => {
    updateSettings({
      textToSpeech: { ...settings.textToSpeech, speed: Math.max(0.5, Math.min(2.0, speed)) }
    });
  };

  const resetToDefaults = () => {
    updateSettings({
      fontSize: 18,
      fontFamily: 'serif',
      lineHeight: 1.6,
      fontWeight: 400,
      theme: 'light',
      readingWidth: 'medium',
      margins: 20,
      padding: 16,
      justifyText: true,
      showProgressBar: true,
      showChapterNumbers: true,
      textToSpeech: {
        enabled: false,
        voice: '',
        speed: 1.0,
        autoPlay: false,
      },
      highContrast: false,
      reduceMotion: false,
      screenReaderMode: false,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => useEReaderStore.getState().toggleDrawer('right', false)}
          />
          
          {/* Drawer */}
    <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 z-50 flex flex-col"
    >
      {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Settings
              </h2>
          <button
                onClick={() => useEReaderStore.getState().toggleDrawer('right', false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

            {/* Search */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
      </div>
      </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-2">
                {filteredSections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setDrawerSection('right', section.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === section.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <section.icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                ))}
            </div>

              {/* Section Content */}
              <div className="px-4 pb-4">
                {activeSection === 'typography' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Size: {settings.fontSize}px
                      </label>
                      <input
                        type="range"
                        min="12"
                        max="24"
              value={settings.fontSize}
                        onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Family
                      </label>
              <select
                value={settings.fontFamily}
                onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="serif">Serif</option>
                        <option value="sans-serif">Sans Serif</option>
                        <option value="monospace">Monospace</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Arial">Arial</option>
                        <option value="Helvetica">Helvetica</option>
              </select>
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Line Height: {settings.lineHeight}
                      </label>
                      <input
                        type="range"
                        min="1.2"
                        max="2.0"
                        step="0.1"
                        value={settings.lineHeight}
                        onChange={(e) => handleLineHeightChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Font Weight
                      </label>
                      <select
                        value={settings.fontWeight}
                        onChange={(e) => updateSettings({ fontWeight: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value={300}>Light (300)</option>
                        <option value={400}>Regular (400)</option>
                        <option value={500}>Medium (500)</option>
                        <option value={600}>Semi Bold (600)</option>
                        <option value={700}>Bold (700)</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeSection === 'display' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'light', label: 'Light', icon: Sun },
                          { id: 'dark', label: 'Dark', icon: Moon },
                          { id: 'sepia', label: 'Sepia', icon: Palette },
                        ].map((theme) => (
                  <button
                            key={theme.id}
                            onClick={() => handleThemeChange(theme.id as 'light' | 'dark' | 'sepia')}
                            className={`p-3 rounded-lg border-2 transition-colors ${
                              settings.theme === theme.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                            }`}
                          >
                            <theme.icon className="w-6 h-6 mx-auto mb-2" />
                            <span className="text-xs font-medium">{theme.label}</span>
                  </button>
                ))}
              </div>
            </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Reading Width
                      </label>
            <div className="space-y-2">
                        {[
                          { id: 'narrow', label: 'Narrow' },
                          { id: 'medium', label: 'Medium' },
                          { id: 'wide', label: 'Wide' },
                        ].map((width) => (
                  <button
                            key={width.id}
                            onClick={() => handleReadingWidthChange(width.id as 'narrow' | 'medium' | 'wide')}
                            className={`w-full p-2 rounded-lg text-left ${
                              settings.readingWidth === width.id
                                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {width.label}
                  </button>
                ))}
              </div>
            </div>

              <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Margins: {settings.margins}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={settings.margins}
                        onChange={(e) => handleMarginsChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
              </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Padding: {settings.padding}px
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="50"
                        value={settings.padding}
                        onChange={(e) => handlePaddingChange(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
            </div>
                )}

                {activeSection === 'layout' && (
                  <div className="space-y-6">
            <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Justify Text
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.justifyText}
                        onChange={(e) => updateSettings({ justifyText: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
            </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Progress Bar
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.showProgressBar}
                        onChange={(e) => updateSettings({ showProgressBar: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Show Chapter Numbers
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.showChapterNumbers}
                        onChange={(e) => updateSettings({ showChapterNumbers: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {activeSection === 'audio' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Enable Text-to-Speech
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.textToSpeech.enabled}
                        onChange={(e) => handleTTSEnabledChange(e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                </div>

                    {settings.textToSpeech.enabled && (
                      <>
                  <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Speed: {settings.textToSpeech.speed}x
                          </label>
                          <input
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.1"
                            value={settings.textToSpeech.speed}
                            onChange={(e) => handleTTSSpeedChange(parseFloat(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          />
                  </div>

                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Auto Play
                          </label>
                          <input
                            type="checkbox"
                            checked={settings.textToSpeech.autoPlay}
                            onChange={(e) => updateSettings({
                              textToSpeech: { ...settings.textToSpeech, autoPlay: e.target.checked }
                            })}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                </div>
              </>
            )}
                  </div>
                )}

                {activeSection === 'accessibility' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        High Contrast
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.highContrast}
                        onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Reduce Motion
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.reduceMotion}
                        onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Screen Reader Mode
                      </label>
                      <input
                        type="checkbox"
                        checked={settings.screenReaderMode}
                        onChange={(e) => updateSettings({ screenReaderMode: e.target.checked })}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={resetToDefaults}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset to Defaults</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 