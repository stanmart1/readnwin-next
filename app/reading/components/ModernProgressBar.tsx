'use client';

import React from 'react';

interface ModernProgressBarProps {
  progress: number; // Current scroll progress (0-100)
  bookProgress: number; // Overall book progress (0-100)
}

export default function ModernProgressBar({ progress, bookProgress }: ModernProgressBarProps) {
  return (
    <div className="w-full h-1 bg-gray-200 dark:bg-gray-700">
      {/* Chapter progress */}
      <div 
        className="h-full bg-blue-600 transition-all duration-300 relative"
        style={{ width: `${progress}%` }}
      >
        {/* Book progress indicator */}
        <div 
          className="absolute top-0 right-0 h-full w-1 bg-green-500"
          style={{ 
            transform: `translateX(${((bookProgress - progress) / progress) * 100}%)`,
            opacity: bookProgress > progress ? 1 : 0
          }}
        />
      </div>
    </div>
  );
}