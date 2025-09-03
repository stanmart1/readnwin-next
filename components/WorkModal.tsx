'use client';

import { useEffect } from 'react';
import Modal from '@/components/ui/Modal';

interface WorkModalProps {
  isOpen: boolean;
  onClose: () => void;
  work: {
    id: number;
    src: string;
    alt: string;
    title: string;
    description: string;
  } | null;
}

export default function WorkModal({ isOpen, onClose, work }: WorkModalProps) {
  if (!isOpen || !work) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      className="rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
    >
        
        {/* Modal Body */}
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="lg:w-1/2 flex-shrink-0">
            <img
              src={work.src}
              alt={work.alt}
              className="w-full h-64 lg:h-full object-cover object-center"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = '/images/placeholder.svg';
              }}
            />
          </div>
          
          {/* Content Section */}
          <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col overflow-y-auto">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              {work.title}
            </h2>
            <div className="flex-1">
              <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                {work.description || 'Innovative solutions that enhance the digital reading experience and connect readers with their favorite books.'}
              </p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Add any additional action here (e.g., navigate to project page)
                  console.log('View project details for:', work.title);
                }}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                View Project
              </button>
            </div>
          </div>
        </div>
    </Modal>
  );
} 