'use client';

import { useState } from 'react';

interface BookUploadModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onBookUploaded?: (bookData: any) => void;
}

export function BookUploadModalV2({ isOpen, onClose, onBookUploaded }: BookUploadModalV2Props) {
  const [uploadState, setUploadState] = useState({
    uploading: false,
    processing: false,
    complete: false,
    error: null as string | null,
    bookData: null as any
  });

  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = ['.epub', '.pdf', '.docx'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExtension)) {
      setUploadState(prev => ({
        ...prev,
        error: `Unsupported file type. Please upload ${allowedTypes.join(', ')} files.`
      }));
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      uploading: true, 
      processing: true,
      error: null 
    }));

    const formData = new FormData();
    formData.append('book', file);

    try {
      const response = await fetch('/api/books/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadState({
          uploading: false,
          processing: false,
          complete: true,
          error: null,
          bookData: result.bookData
        });
        
        // Call parent callback
        if (onBookUploaded) {
          onBookUploaded(result.bookData);
        }
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadState(prev => ({
        ...prev,
        uploading: false,
        processing: false,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  const resetModal = () => {
    setUploadState({
      uploading: false,
      processing: false,
      complete: false,
      error: null,
      bookData: null
    });
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Upload Book (V2)</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {!uploadState.complete ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploadState.uploading || uploadState.processing ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    {uploadState.uploading ? 'Uploading...' : 'Processing book...'}
                  </p>
                  <div className="text-sm text-gray-500">
                    {uploadState.processing && 'Extracting metadata and converting to HTML...'}
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-4">
                  <div className="text-4xl mb-2">📚</div>
                  <p className="text-gray-600">
                    Drop your book here or click to browse
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Supports EPUB, PDF, DOCX files
                  </p>
                </div>
                <input
                  type="file"
                  accept=".epub,.pdf,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="book-upload-v2"
                />
                <label
                  htmlFor="book-upload-v2"
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                >
                  Choose File
                </label>
              </>
            )}

            {uploadState.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {uploadState.error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-green-600 text-4xl mb-2">✅</div>
              <h3 className="text-lg font-semibold text-green-800">
                Book Successfully Processed!
              </h3>
            </div>

            {uploadState.bookData && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Title</label>
                  <p className="text-gray-900">{uploadState.bookData.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Author</label>
                  <p className="text-gray-900">{uploadState.bookData.author}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Pages</label>
                    <p className="text-gray-900">{uploadState.bookData.pageCount}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Words</label>
                    <p className="text-gray-900">{uploadState.bookData.wordCount.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Chapters</label>
                  <p className="text-gray-900">{uploadState.bookData.chapters}</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to e-reader or library
                  window.location.href = `/reading`;
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Start Reading
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 