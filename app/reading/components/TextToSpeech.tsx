"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEReaderStore } from "@/stores/ereaderStore";
import {
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  MicOff,
} from "lucide-react";

interface TextToSpeechProps {
  className?: string;
}

export default function TextToSpeech({ className = "" }: TextToSpeechProps) {
  const {
    currentBook,
    isTextToSpeechPlaying,
    settings,
    startTextToSpeech,
    stopTextToSpeech,
    updateSettings,
  } = useEReaderStore();

  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentUtterance, setCurrentUtterance] =
    useState<SpeechSynthesisUtterance | null>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [totalLength, setTotalLength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [sentences, setSentences] = useState<string[]>([]);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      setIsSupported(true);
      synthRef.current = window.speechSynthesis;

      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);
      };

      loadVoices();
      synthRef.current.addEventListener("voiceschanged", loadVoices);

      return () => {
        synthRef.current?.removeEventListener("voiceschanged", loadVoices);
      };
    }
  }, []);

  // Parse text into sentences
  useEffect(() => {
    if (currentBook?.content) {
      const text = extractTextFromContent(currentBook.content);
      const sentenceArray = text.match(/[^\.!?]+[\.!?]+/g) || [text];
      setSentences(sentenceArray.map((s) => s.trim()));
      setTotalLength(text.length);
    }
  }, [currentBook]);

  // Update settings when TTS state changes
  useEffect(() => {
    if (settings.textToSpeech.enabled && !isTextToSpeechPlaying) {
      updateSettings({
        textToSpeech: {
          ...settings.textToSpeech,
          enabled: false,
        },
      });
    }
  }, [isTextToSpeechPlaying, settings.textToSpeech, updateSettings]);

  // Extract text content from book content
  const extractTextFromContent = (content: any): string => {
    if (typeof content === "string") {
      return content.replace(/<[^>]*>/g, "");
    }
    if (content?.chapters && Array.isArray(content.chapters)) {
      return content.chapters
        .map((chapter: any) => chapter.content || "")
        .join(" ")
        .replace(/<[^>]*>/g, "");
    }
    return "";
  };

  // Remove previous highlight
  const removeHighlight = useCallback(() => {
    if (highlightedElementRef.current) {
      highlightedElementRef.current.style.backgroundColor = "";
      highlightedElementRef.current.style.padding = "";
      highlightedElementRef.current = null;
    }
  }, []);

  // Highlight current sentence being read
  const highlightCurrentSentence = useCallback(
    (sentenceIndex: number) => {
      if (!contentRef.current || !sentences[sentenceIndex]) return;

      // Remove previous highlight
      removeHighlight();

      try {
        // Find the sentence in the DOM and highlight it
        const sentenceText = sentences[sentenceIndex];
        const walker = document.createTreeWalker(
          contentRef.current,
          NodeFilter.SHOW_TEXT,
        );

        let textNode;
        while ((textNode = walker.nextNode())) {
          const nodeText = textNode.textContent || "";
          if (nodeText.includes(sentenceText.substring(0, 20))) {
            const parentElement = textNode.parentElement;
            if (parentElement) {
              parentElement.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
              parentElement.style.padding = "2px 4px";
              parentElement.style.borderRadius = "3px";
              highlightedElementRef.current = parentElement;
              parentElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
              break;
            }
          }
        }
      } catch (error) {
        console.warn("Error highlighting sentence:", error);
      }
    },
    [sentences, removeHighlight],
  );

  // Start/resume speech
  const handlePlay = useCallback(() => {
    if (!isSupported || !synthRef.current || sentences.length === 0) return;

    setIsLoading(true);

    try {
      // Cancel any existing speech
      synthRef.current.cancel();

      const textToSpeak = sentences.slice(currentSentenceIndex).join(" ");
      const utterance = new SpeechSynthesisUtterance(textToSpeak);

      // Configure utterance
      const selectedVoice = voices.find(
        (voice) => voice.name === settings.textToSpeech.voice,
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.rate = settings.textToSpeech.speed;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;

      // Event handlers
      utterance.onstart = () => {
        setIsLoading(false);
        startTextToSpeech();
      };

      utterance.onend = () => {
        stopTextToSpeech();
        removeHighlight();
        setCurrentPosition(0);
        setCurrentSentenceIndex(0);
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        setIsLoading(false);
        stopTextToSpeech();
      };

      utterance.onboundary = (event) => {
        if (event.name === "sentence") {
          const newSentenceIndex = currentSentenceIndex + event.charIndex;
          setCurrentSentenceIndex(newSentenceIndex);
          highlightCurrentSentence(newSentenceIndex);
        }
        setCurrentPosition(event.charIndex);
      };

      setCurrentUtterance(utterance);
      synthRef.current.speak(utterance);
    } catch (error) {
      console.error("Error starting speech:", error);
      setIsLoading(false);
    }
  }, [
    isSupported,
    sentences,
    currentSentenceIndex,
    voices,
    settings.textToSpeech,
    isMuted,
    startTextToSpeech,
    stopTextToSpeech,
    removeHighlight,
    highlightCurrentSentence,
  ]);

  // Pause speech
  const handlePause = useCallback(() => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.pause();
      stopTextToSpeech();
    }
  }, [stopTextToSpeech]);

  // Stop speech
  const handleStop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      stopTextToSpeech();
      removeHighlight();
      setCurrentPosition(0);
      setCurrentSentenceIndex(0);
      setCurrentUtterance(null);
    }
  }, [stopTextToSpeech, removeHighlight]);

  // Navigate to previous sentence
  const handlePreviousSentence = useCallback(() => {
    if (currentSentenceIndex > 0) {
      setCurrentSentenceIndex(currentSentenceIndex - 1);
      if (isTextToSpeechPlaying) {
        handleStop();
        setTimeout(handlePlay, 100);
      }
    }
  }, [currentSentenceIndex, isTextToSpeechPlaying, handleStop, handlePlay]);

  // Navigate to next sentence
  const handleNextSentence = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      setCurrentSentenceIndex(currentSentenceIndex + 1);
      if (isTextToSpeechPlaying) {
        handleStop();
        setTimeout(handlePlay, 100);
      }
    }
  }, [
    currentSentenceIndex,
    sentences.length,
    isTextToSpeechPlaying,
    handleStop,
    handlePlay,
  ]);

  // Toggle mute
  const handleToggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (currentUtterance) {
      currentUtterance.volume = isMuted ? 1 : 0;
    }
  }, [isMuted, currentUtterance]);

  // Update voice setting
  const handleVoiceChange = (voiceName: string) => {
    updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        voice: voiceName,
      },
    });
  };

  // Update rate setting
  const handleSpeedChange = (speed: number) => {
    updateSettings({
      textToSpeech: {
        ...settings.textToSpeech,
        speed,
      },
    });
  };

  if (!isSupported) {
    return (
      <div className={`text-center p-4 ${className}`}>
        <MicOff className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-500">
          Text-to-speech is not supported in this browser
        </p>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Text-to-Speech
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{
              width: `${totalLength > 0 ? (currentPosition / totalLength) * 100 : 0}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>
            Sentence {currentSentenceIndex + 1} of {sentences.length}
          </span>
          <span>
            {Math.round(
              totalLength > 0 ? (currentPosition / totalLength) * 100 : 0,
            )}
            %
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-2 p-4">
        <button
          onClick={handlePreviousSentence}
          disabled={currentSentenceIndex === 0}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {isTextToSpeechPlaying ? (
          <button
            onClick={handlePause}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            <Pause className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={handlePlay}
            disabled={isLoading || sentences.length === 0}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
        )}

        <button
          onClick={handleStop}
          disabled={!isTextToSpeechPlaying && !currentUtterance}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Square className="w-5 h-5" />
        </button>

        <button
          onClick={handleNextSentence}
          disabled={currentSentenceIndex >= sentences.length - 1}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button
          onClick={handleToggleMute}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isMuted ? (
            <VolumeX className="w-5 h-5" />
          ) : (
            <Volume2 className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Voice
                </label>
                <select
                  value={settings.textToSpeech.voice}
                  onChange={(e) => handleVoiceChange(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </select>
              </div>

              {/* Rate Control */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speed: {settings.textToSpeech.speed.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={settings.textToSpeech.speed}
                  onChange={(e) =>
                    handleSpeedChange(parseFloat(e.target.value))
                  }
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
