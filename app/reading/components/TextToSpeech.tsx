'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useEReaderStore } from '@/stores/ereaderStore';
import { Play, Pause, Square } from 'lucide-react';

export default function TextToSpeech() {
  const { settings, isTextToSpeechPlaying, startTextToSpeech, stopTextToSpeech } = useEReaderStore();

  if (!settings.textToSpeech.enabled) {
    return null;
  }

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 z-50"
    >
      <div className="flex items-center space-x-2">
        {isTextToSpeechPlaying ? (
          <button
            onClick={stopTextToSpeech}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
          >
            <Pause className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={startTextToSpeech}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700"
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        
                 <button
           onClick={stopTextToSpeech}
           className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
         >
           <Square className="w-4 h-4" />
         </button>
      </div>
    </motion.div>
  );
}
