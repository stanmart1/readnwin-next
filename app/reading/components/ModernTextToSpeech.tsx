'use client';

import React, { useEffect, useRef } from 'react';
import { useModernEReaderStore } from '@/stores/modernEReaderStore';
import { SecurityUtils } from '@/utils/security';

export default function ModernTextToSpeech() {
  const {
    currentChapter,
    settings,
    uiState,
    updateTextToSpeechState,
  } = useModernEReaderStore();

  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!settings.textToSpeech.enabled || !currentChapter) return;

    // Initialize speech synthesis
    if (uiState.isTextToSpeechPlaying && !isPlayingRef.current) {
      startSpeech();
    } else if (!uiState.isTextToSpeechPlaying && isPlayingRef.current) {
      pauseSpeech();
    }

    return () => {
      if (speechRef.current) {
        speechSynthesis.cancel();
        isPlayingRef.current = false;
      }
    };
  }, [uiState.isTextToSpeechPlaying, currentChapter, settings.textToSpeech]);

  const startSpeech = () => {
    if (!currentChapter || isPlayingRef.current) return;

    // Extract text content from HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = SecurityUtils.sanitizeHTML(currentChapter.content_html);
    const textContent = tempDiv.textContent || tempDiv.innerText || '';

    if (!textContent.trim()) return;

    // Create speech utterance
    const utterance = new SpeechSynthesisUtterance(textContent);
    utterance.rate = settings.textToSpeech.rate;
    utterance.volume = settings.textToSpeech.volume;
    utterance.pitch = settings.textToSpeech.pitch;

    // Set voice if available
    const voices = speechSynthesis.getVoices();
    if (settings.textToSpeech.voice && voices.length > 0) {
      const selectedVoice = voices.find(voice => voice.name === settings.textToSpeech.voice);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Event handlers
    utterance.onstart = () => {
      isPlayingRef.current = true;
      updateTextToSpeechState({ isPlaying: true });
    };

    utterance.onend = () => {
      isPlayingRef.current = false;
      updateTextToSpeechState({ isPlaying: false });
      speechRef.current = null;
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', SecurityUtils.sanitizeLogInput(String(event)));
      isPlayingRef.current = false;
      updateTextToSpeechState({ isPlaying: false });
      speechRef.current = null;
    };

    utterance.onpause = () => {
      updateTextToSpeechState({ isPlaying: false });
    };

    utterance.onresume = () => {
      updateTextToSpeechState({ isPlaying: true });
    };

    speechRef.current = utterance;
    speechSynthesis.speak(utterance);
  };

  const pauseSpeech = () => {
    if (speechRef.current && isPlayingRef.current) {
      speechSynthesis.pause();
    }
  };

  const resumeSpeech = () => {
    if (speechRef.current && !isPlayingRef.current) {
      speechSynthesis.resume();
    }
  };

  const stopSpeech = () => {
    if (speechRef.current) {
      speechSynthesis.cancel();
      isPlayingRef.current = false;
      updateTextToSpeechState({ isPlaying: false });
      speechRef.current = null;
    }
  };

  // Expose methods to the store
  useEffect(() => {
    // This is a bit of a hack, but we need to expose these methods
    // to the store so they can be called from other components
    (window as any).__modernEReaderTTS = {
      start: startSpeech,
      pause: pauseSpeech,
      resume: resumeSpeech,
      stop: stopSpeech,
    };

    return () => {
      delete (window as any).__modernEReaderTTS;
    };
  }, []);

  return null; // This component doesn't render anything
}