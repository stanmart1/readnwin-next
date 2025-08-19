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
  Mic,
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
  const [currentText, setCurrentText] = useState("");
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

      // Load voices
      const loadVoices = () => {
        const availableVoices = synthRef.current?.getVoices() || [];
        setVoices(availableVoices);

        // Set default voice if not set
        if (!settings.textToSpeech.voice && availableVoices.length > 0) {
          const defaultVoice =
            availableVoices.find((voice) => voice.default) ||
            availableVoices[0];
          updateSettings({
            textToSpeech: {
              ...settings.textToSpeech,
              voice: defaultVoice.name,
            },
          });
        }
      };

      loadVoices();

      // Voices might load asynchronously
      if (synthRef.current) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Extract text content from book
  const extractTextContent = useCallback(() => {
    if (!currentBook?.content) return "";

    // Create a temporary div to parse HTML content
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = currentBook.content;

    // Remove script and style tags
    const scripts = tempDiv.querySelectorAll("script, style");
    scripts.forEach((el) => el.remove());

    // Get text content
    const textContent = tempDiv.textContent || tempDiv.innerText || "";

    // Split into sentences for better control
    const sentenceArray = textContent
      .split(/[.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length > 0);

    setSentences(sentenceArray);
    return textContent;
  }, [currentBook?.content]);

  // Create speech utterance
  const createUtterance = useCallback(
    (text: string, startFromSentence = 0) => {
      if (!synthRef.current || !text) return null;

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice
      const selectedVoice = voices.find(
        (voice) => voice.name === settings.textToSpeech.voice,
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Set speech parameters
      utterance.rate = settings.textToSpeech.speed;
      utterance.pitch = 1;
      utterance.volume = isMuted ? 0 : 1;

      // Handle events
      utterance.onstart = () => {
        setIsLoading(false);
        startTextToSpeech();
      };

      utterance.onend = () => {
        stopTextToSpeech();
        setCurrentPosition(0);
        setCurrentSentenceIndex(0);
        removeHighlight();
      };

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        stopTextToSpeech();
        setIsLoading(false);
      };

      utterance.onpause = () => {
        // Handle pause state
      };

      utterance.onresume = () => {
        // Handle resume state
      };

      // Track progress using boundary events
      utterance.onboundary = (event) => {
        if (event.name === "sentence") {
          const sentenceIndex = Math.floor(
            event.charIndex / (text.length / sentences.length),
          );
          setCurrentSentenceIndex(sentenceIndex);
          highlightCurrentSentence(sentenceIndex);
        }

        setCurrentPosition(event.charIndex);
      };

      return utterance;
    },
    [
      voices,
      settings.textToSpeech,
      isMuted,
      sentences,
      startTextToSpeech,
      stopTextToSpeech,
    ],
  );

  // Highlight current sentence being read
  const highlightCurrentSentence = useCallback(
    (sentenceIndex: number) => {
      if (!contentRef.current || !sentences[sentenceIndex]) return;

      // Remove previous highlight
      removeHighlight();

      // Find the sentence in the DOM and highlight it
      const sentenceText = sentences[sentenceIndex];
      const walker = document.createTreeWalker(
        contentRef.current,
        NodeFilter.SHOW_TEXT,
        null,
        false,
      );

      let textNode;
      while ((textNode = walker.nextNode())) {
        const nodeText = textNode.textContent || "";
        if (nodeText.includes(sentenceText.substring(0, 20))) {
          const parentElement = textNode.parentElement;
          if (parentElement) {
            parentElement.style.backgroundColor = "rgba(59, 130, 246, 0.3)";
            parentElement.style.borderRadius = "4px";
            parentElement.style.padding = "2px 4px";
            parentElement.style.transition = "background-color 0.3s ease";

            highlightedElementRef.current = parentElement;

            // Scroll to highlighted sentence
            parentElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            break;
          }
        }
      }
    },
    [sentences],
  );

  // Remove highlight
  const removeHighlight = useCallback(() => {
    if (highlightedElementRef.current) {
      highlightedElementRef.current.style.backgroundColor = "";
      highlightedElementRef.current.style.borderRadius = "";
      highlightedElementRef.current.style.padding = "";
      highlightedElementRef.current = null;
    }
  }, []);

  // Start/resume speech
  const handlePlay = useCallback(() => {
    if (!synthRef.current || !isSupported) return;

    if (synthRef.current.paused) {
      // Resume paused speech
      synthRef.current.resume();
      startTextToSpeech();
    } else if (!isTextToSpeechPlaying) {
      // Start new speech
      setIsLoading(true);
      const text = extractTextContent();

      if (!text) {
        setIsLoading(false);
        return;
      }

      setCurrentText(text);
      setTotalLength(text.length);

      const utterance = createUtterance(text);
      if (utterance) {
        setCurrentUtterance(utterance);
        synthRef.current.speak(utterance);
      } else {
        setIsLoading(false);
      }
    }
  }, [
    isSupported,
    isTextToSpeechPlaying,
    extractTextContent,
    createUtterance,
    startTextToSpeech,
  ]);

  // Pause speech
  const handlePause = useCallback(() => {
    if (synthRef.current && isTextToSpeechPlaying) {
      synthRef.current.pause();
      stopTextToSpeech();
    }
  }, [isTextToSpeechPlaying, stopTextToSpeech]);

  // Stop speech
  const handleStop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      stopTextToSpeech();
      setCurrentPosition(0);
      setCurrentSentenceIndex(0);
      setCurrentUtterance(null);
      removeHighlight();
    }
  }, [stopTextToSpeech, removeHighlight]);

  // Skip to previous sentence
  const handlePrevious = useCallback(() => {
    if (currentSentenceIndex > 0) {
      const newIndex = currentSentenceIndex - 1;
      setCurrentSentenceIndex(newIndex);

      if (synthRef.current && isTextToSpeechPlaying) {
        synthRef.current.cancel();

        // Start from previous sentence
        const remainingText = sentences.slice(newIndex).join(". ");
        const utterance = createUtterance(remainingText, newIndex);
        if (utterance) {
          setCurrentUtterance(utterance);
          synthRef.current.speak(utterance);
        }
      }
    }
  }, [currentSentenceIndex, sentences, isTextToSpeechPlaying, createUtterance]);

  // Skip to next sentence
  const handleNext = useCallback(() => {
    if (currentSentenceIndex < sentences.length - 1) {
      const newIndex = currentSentenceIndex + 1;
      setCurrentSentenceIndex(newIndex);

      if (synthRef.current && isTextToSpeechPlaying) {
        synthRef.current.cancel();

        // Start from next sentence
        const remainingText = sentences.slice(newIndex).join(". ");
        const utterance = createUtterance(remainingText, newIndex);
        if (utterance) {
          setCurrentUtterance(utterance);
          synthRef.current.speak(utterance);
        }
      }
    }
  }, [currentSentenceIndex, sentences, isTextToSpeechPlaying, createUtterance]);

  // Toggle mute
  const handleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (currentUtterance) {
      currentUtterance.volume = isMuted ? 1 : 0;
    }
  }, [isMuted, currentUtterance]);

  // Update voice setting
  const handleVoiceChange = useCallback(
    (voiceName: string) => {
      updateSettings({
        textToSpeech: {
          ...settings.textToSpeech,
          voice: voiceName,
        },
      });
    },
    [settings.textToSpeech, updateSettings],
  );

  // Update speed setting
  const handleSpeedChange = useCallback(
    (speed: number) => {
      updateSettings({
        textToSpeech: {
          ...settings.textToSpeech,
          speed: Math.max(0.5, Math.min(2.0, speed)),
        },
      });

      // Apply to current utterance if playing
      if (currentUtterance && synthRef.current) {
        // Need to restart with new speed
        const wasPlaying = isTextToSpeechPlaying;
        if (wasPlaying) {
          synthRef.current.cancel();
          const remainingText = sentences
            .slice(currentSentenceIndex)
            .join(". ");
          const utterance = createUtterance(
            remainingText,
            currentSentenceIndex,
          );
          if (utterance) {
            setCurrentUtterance(utterance);
            synthRef.current.speak(utterance);
          }
        }
      }
    },
    [
      settings.textToSpeech,
      updateSettings,
      currentUtterance,
      isTextToSpeechPlaying,
      sentences,
      currentSentenceIndex,
      createUtterance,
    ],
  );

  // Calculate progress percentage
  const progressPercentage =
    totalLength > 0 ? (currentPosition / totalLength) * 100 : 0;

  if (!isSupported) {
    return (
      <div
        className={`text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg ${className}`}
      >
        <MicOff className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Text-to-Speech is not supported in your browser
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className={`fixed bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-40 ${className}`}
    >
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1 rounded-t-lg overflow-hidden">
        <motion.div
          className="h-full bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main Controls */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrevious}
              disabled={currentSentenceIndex === 0 || isLoading}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Previous sentence"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {isLoading ? (
              <div className="p-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
              </div>
            ) : (
              <button
                onClick={isTextToSpeechPlaying ? handlePause : handlePlay}
                className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-lg"
                title={isTextToSpeechPlaying ? "Pause" : "Play"}
              >
                {isTextToSpeechPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </button>
            )}

            <button
              onClick={handleStop}
              disabled={!isTextToSpeechPlaying && !synthRef.current?.paused}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stop"
            >
              <Square className="w-5 h-5" />
            </button>

            <button
              onClick={handleNext}
              disabled={
                currentSentenceIndex >= sentences.length - 1 || isLoading
              }
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Next sentence"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>

          {/* Center Info */}
          <div className="flex-1 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentBook?.title || "No book loaded"}
            </p>
            {sentences.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Sentence {currentSentenceIndex + 1} of {sentences.length}
              </p>
            )}
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMute}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Voice
                  </label>
                  <select
                    value={settings.textToSpeech.voice}
                    onChange={(e) => handleVoiceChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Speed Control */}
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
                    onChange={(e) =>
                      handleSpeedChange(parseFloat(e.target.value))
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
