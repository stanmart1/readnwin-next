'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useModernEReaderStore } from '@/stores/modernEReaderStore';
import { X, Settings, Type, Palette, Eye, Volume2 } from 'lucide-react';

export default function ModernRightDrawer() {
  const {
    settings,
    uiState,
    toggleRightDrawer,
    updateSettings,
  } = useModernEReaderStore();

  const fontSizes = [12, 14, 16, 18, 20, 22, 24, 28, 32];
  const fontFamilies = [
    { name: 'System Default', value: 'system-ui, -apple-system, sans-serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Times New Roman', value: 'Times, serif' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
  ];

  const themes = [
    { name: 'Light', value: 'light' },
    { name: 'Dark', value: 'dark' },
    { name: 'Sepia', value: 'sepia' },
    { name: 'High Contrast', value: 'high-contrast' },
  ];

  return (
    <AnimatePresence>
      {uiState.rightDrawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={(e) => { e.stopPropagation(); toggleRightDrawer(); }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="font-semibold">Reading Settings</h2>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); toggleRightDrawer(); }}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Theme */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Palette className="w-4 h-4" />
                  <h3 className="font-medium">Theme</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {themes.map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => updateSettings({ theme: theme.value as 'light' | 'dark' | 'sepia' | 'high-contrast' })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        settings.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {theme.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Type className="w-4 h-4" />
                  <h3 className="font-medium">Font Size</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">A</span>
                  <input
                    type="range"
                    min={12}
                    max={32}
                    step={2}
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-lg">A</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{settings.fontSize}px</p>
              </div>

              {/* Font Family */}
              <div>
                <h3 className="font-medium mb-3">Font Family</h3>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
                >
                  {fontFamilies.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Height */}
              <div>
                <h3 className="font-medium mb-3">Line Height</h3>
                <div className="flex items-center space-x-2">
                  <span className="text-sm">1.2</span>
                  <input
                    type="range"
                    min={1.2}
                    max={2.0}
                    step={0.1}
                    value={settings.lineHeight}
                    onChange={(e) => updateSettings({ lineHeight: parseFloat(e.target.value) })}
                    className="flex-1"
                  />
                  <span className="text-sm">2.0</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{settings.lineHeight}</p>
              </div>

              {/* Reading Width */}
              <div>
                <h3 className="font-medium mb-3">Reading Width</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Narrow', value: 'narrow' },
                    { name: 'Normal', value: 'normal' },
                    { name: 'Wide', value: 'wide' },
                    { name: 'Full', value: 'full' },
                  ].map((width) => (
                    <button
                      key={width.value}
                      onClick={() => updateSettings({ readingWidth: width.value as 'narrow' | 'normal' | 'wide' | 'full' })}
                      className={`p-2 text-sm rounded-lg border transition-colors ${
                        settings.readingWidth === width.value
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {width.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text-to-Speech */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Volume2 className="w-4 h-4" />
                  <h3 className="font-medium">Text-to-Speech</h3>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={settings.textToSpeech.enabled}
                      onChange={(e) => updateSettings({
                        textToSpeech: { ...settings.textToSpeech, enabled: e.target.checked }
                      })}
                      className="rounded"
                    />
                    <span className="text-sm">Enable Text-to-Speech</span>
                  </label>
                  
                  {settings.textToSpeech.enabled && (
                    <>
                      <div>
                        <label className="block text-sm mb-1">Speed</label>
                        <input
                          type="range"
                          min={0.5}
                          max={2.0}
                          step={0.1}
                          value={settings.textToSpeech.speed}
                          onChange={(e) => updateSettings({
                            textToSpeech: { ...settings.textToSpeech, speed: parseFloat(e.target.value) }
                          })}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">{settings.textToSpeech.speed}x</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm mb-1">Volume</label>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={settings.textToSpeech.volume}
                          onChange={(e) => updateSettings({
                            textToSpeech: { ...settings.textToSpeech, volume: parseFloat(e.target.value) }
                          })}
                          className="w-full"
                        />
                        <p className="text-xs text-gray-500">{Math.round(settings.textToSpeech.volume * 100)}%</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Other Settings */}
              <div className="space-y-3">
                <h3 className="font-medium">Other Settings</h3>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.showProgressBar}
                    onChange={(e) => updateSettings({ showProgressBar: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Show Progress Bar</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.justifyText}
                    onChange={(e) => updateSettings({ justifyText: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Justify Text</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.enableSwipeNavigation}
                    onChange={(e) => updateSettings({ enableSwipeNavigation: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Swipe Navigation</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.reduceMotion}
                    onChange={(e) => updateSettings({ reduceMotion: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm">Reduce Motion</span>
                </label>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}