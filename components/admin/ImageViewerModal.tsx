import React, { useState } from 'react';
import Image from 'next/image';

interface ImageViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
}

function ImageWithFallback({ imageUrl, fileName }: { imageUrl: string; fileName: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="mb-4">
          <i className="ri-image-line text-4xl text-gray-300"></i>
        </div>
        <p className="text-sm">Unable to load image</p>
        <a 
          href={imageUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
        >
          Open in new tab
        </a>
      </div>
    );
  }

  return (
    <div className="relative max-w-full max-h-[70vh]">
      <Image
        src={imageUrl}
        alt={fileName}
        width={800}
        height={600}
        className="object-contain"
        onError={() => setHasError(true)}
      />
    </div>
  );
}

export default function ImageViewerModal({ isOpen, onClose, imageUrl, fileName }: ImageViewerModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
          <div className="flex justify-center">
            {fileName.toLowerCase().endsWith('.pdf') ? (
              <div className="w-full">
                <iframe
                  src={imageUrl}
                  className="w-full h-[70vh] border border-gray-200 rounded"
                  title={fileName}
                />
                <div className="mt-4 text-center">
                  <a
                    href={imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Open PDF in new tab
                  </a>
                </div>
              </div>
            ) : (
              <ImageWithFallback imageUrl={imageUrl} fileName={fileName} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 