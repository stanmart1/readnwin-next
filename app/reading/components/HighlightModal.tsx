"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEReaderStore } from "@/stores/ereaderStore";
import { Highlighter, X, Save, Palette, MessageSquare } from "lucide-react";

interface HighlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  position: { x: number; y: number };
  bookId: string;
  currentPosition: number;
  textRange?: {
    startOffset: number;
    endOffset: number;
  };
}

export default function HighlightModal({
  isOpen,
  onClose,
  selectedText,
  position,
  bookId,
  currentPosition,
  textRange,
}: HighlightModalProps) {
  const { addHighlight, currentBook } = useEReaderStore();

  const [selectedColor, setSelectedColor] = useState<
    "yellow" | "green" | "blue" | "pink" | "purple"
  >("yellow");
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  // Color options for highlights
  const highlightColors = [
    {
      id: "yellow",
      name: "Yellow",
      color: "#fbbf24",
      bgColor: "rgba(251, 191, 36, 0.3)",
    },
    {
      id: "green",
      name: "Green",
      color: "#34d399",
      bgColor: "rgba(52, 211, 153, 0.3)",
    },
    {
      id: "blue",
      name: "Blue",
      color: "#60a5fa",
      bgColor: "rgba(96, 165, 250, 0.3)",
    },
    {
      id: "pink",
      name: "Pink",
      color: "#f472b6",
      bgColor: "rgba(244, 114, 182, 0.3)",
    },
    {
      id: "purple",
      name: "Purple",
      color: "#a78bfa",
      bgColor: "rgba(167, 139, 250, 0.3)",
    },
  ] as const;

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedColor("yellow");
      setNote("");
      setIsSaving(false);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Save highlight
  const handleSave = async () => {
    if (!selectedText.trim() || !currentBook || !textRange) return;

    setIsSaving(true);

    try {
      const highlightData = {
        bookId: currentBook.id,
        userId: "current-user", // Will be set by store
        text: selectedText.trim(),
        startOffset: textRange.startOffset,
        endOffset: textRange.endOffset,
        color: selectedColor,
        note: note.trim() || undefined,
        position: currentPosition,
        chapterIndex: 0, // Could be calculated based on position
      };

      // Add to local store
      addHighlight(highlightData);

      // Save to server
      await fetch(`/api/books/${bookId}/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(highlightData),
      });

      onClose();
    } catch (error) {
      console.error("Failed to save highlight:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Quick save with default color (no modal)
  const handleQuickSave = async () => {
    if (!selectedText.trim() || !currentBook || !textRange) return;

    try {
      const highlightData = {
        bookId: currentBook.id,
        userId: "current-user",
        text: selectedText.trim(),
        startOffset: textRange.startOffset,
        endOffset: textRange.endOffset,
        color: "yellow" as const,
        position: currentPosition,
        chapterIndex: 0,
      };

      addHighlight(highlightData);

      await fetch(`/api/books/${bookId}/highlights`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(highlightData),
      });

      onClose();
    } catch (error) {
      console.error("Failed to save quick highlight:", error);
    }
  };

  // Calculate modal position to keep it in viewport
  const getModalPosition = () => {
    const modalWidth = 300;
    const modalHeight = 350;
    const padding = 20;

    let x = position.x;
    let y = position.y;

    // Adjust horizontal position
    if (x + modalWidth > window.innerWidth - padding) {
      x = window.innerWidth - modalWidth - padding;
    }
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position
    if (y + modalHeight > window.innerHeight - padding) {
      y = position.y - modalHeight - 20; // Position above selection
    }
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  };

  const modalPosition = getModalPosition();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-25 z-50"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            style={{
              left: modalPosition.x,
              top: modalPosition.y,
              width: 300,
              maxHeight: 350,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <Highlighter className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create Highlight
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
              {/* Selected Text Preview */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                  &quot;
                  {selectedText.length > 100
                    ? selectedText.substring(0, 100) + "..."
                    : selectedText}
                  &quot;
                </p>
              </div>

              {/* Color Selection */}
              <div>
                <div className="flex items-center space-x-2 mb-3">
                  <Palette className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Highlight Color
                  </label>
                </div>
                <div className="flex space-x-2">
                  {highlightColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color.id)}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedColor === color.id
                          ? "border-gray-400 dark:border-gray-300 scale-110"
                          : "border-gray-200 dark:border-gray-600 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.color }}
                      title={color.name}
                    >
                      {selectedColor === color.id && (
                        <div className="w-2 h-2 bg-white rounded-full shadow-sm" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Note */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Note (Optional)
                  </label>
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add a note to this highlight..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
              <button
                onClick={handleQuickSave}
                className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Quick Save
              </button>

              <div className="flex space-x-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!selectedText.trim() || isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{isSaving ? "Saving..." : "Save"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
