'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEReaderStore } from '@/stores/ereaderStore';
import { 
  StickyNote, 
  Bookmark, 
  Search, 
  Filter, 
  Download, 
  X, 
  Edit3, 
  Trash2,
  Calendar,
  Tag
} from 'lucide-react';

export default function LeftDrawer() {
  const {
    drawerState,
    highlights,
    notes,
    currentBook,
    toggleDrawer,
    setDrawerTab,
    removeHighlight,
    removeNote,
    updateNote,
  } = useEReaderStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'recent' | 'favorites'>('all');
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const isOpen = drawerState.leftDrawer.isOpen;
  const activeTab = drawerState.leftDrawer.activeTab;

  // Filter notes and highlights based on search and filter
  const filteredNotes = notes
    .filter(note => note.bookId === currentBook?.id)
    .filter(note => 
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(note => {
      if (filterType === 'recent') {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(note.createdAt) > oneWeekAgo;
      }
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const filteredHighlights = highlights
    .filter(highlight => highlight.bookId === currentBook?.id)
    .filter(highlight => 
      highlight.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      highlight.note?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleNoteEdit = (noteId: string, content: string) => {
    updateNote(noteId, { content });
    setEditingNote(null);
    setEditContent('');
  };

  const handleExport = () => {
    const data = {
      notes: filteredNotes,
      highlights: filteredHighlights,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBook?.title || 'book'}-notes-highlights.json`;
    a.click();
    URL.revokeObjectURL(url);
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
            onClick={() => toggleDrawer('left', false)}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: -400 }}
            animate={{ x: 0 }}
            exit={{ x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 max-w-[90vw] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notes & Highlights
              </h2>
              <button
                onClick={() => toggleDrawer('left', false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search notes and highlights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterType('recent')}
                  className={`px-3 py-1 rounded-md text-sm ${
                    filterType === 'recent'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setDrawerTab('left', 'notes')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'notes'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <StickyNote className="w-4 h-4" />
                  <span>Notes ({filteredNotes.length})</span>
                </div>
              </button>
              <button
                onClick={() => setDrawerTab('left', 'highlights')}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 ${
                  activeTab === 'highlights'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span>Highlights ({filteredHighlights.length})</span>
                </div>
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'notes' && (
                <div className="p-4 space-y-4">
                  {filteredNotes.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <StickyNote className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No notes yet</p>
                      <p className="text-sm">Select text to create a note</p>
                    </div>
                  ) : (
                    filteredNotes.map((note) => (
                      <div
                        key={note.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        {editingNote === note.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              placeholder="Note content..."
                            />
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleNoteEdit(note.id, editContent)}
                                className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingNote(null);
                                  setEditContent('');
                                }}
                                className="px-3 py-1 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {note.title}
                              </h3>
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => {
                                    setEditingNote(note.id);
                                    setEditContent(note.content);
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeNote(note.id)}
                                  className="p-1 text-gray-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                              {note.content}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                              {note.tags.length > 0 && (
                                <div className="flex space-x-1">
                                  {note.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag}
                                      className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'highlights' && (
                <div className="p-4 space-y-4">
                  {filteredHighlights.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No highlights yet</p>
                      <p className="text-sm">Select text to create a highlight</p>
                    </div>
                  ) : (
                    filteredHighlights.map((highlight) => (
                      <div
                        key={highlight.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div
                            className="w-4 h-4 rounded-full mr-3 mt-1"
                            style={{
                              backgroundColor: highlight.color === 'yellow' ? '#fbbf24' :
                                              highlight.color === 'green' ? '#34d399' :
                                              highlight.color === 'blue' ? '#60a5fa' :
                                              highlight.color === 'pink' ? '#f472b6' :
                                              highlight.color === 'purple' ? '#a78bfa' : '#fbbf24'
                            }}
                          />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900 dark:text-white mb-2">
                              "{highlight.text}"
                            </p>
                            {highlight.note && (
                              <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                {highlight.note}
                              </p>
                            )}
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                              <span>{new Date(highlight.createdAt).toLocaleDateString()}</span>
                              <button
                                onClick={() => removeHighlight(highlight.id)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
} 