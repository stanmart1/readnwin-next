'use client';

import React, { useEffect } from 'react';

interface Highlight {
  id: string;
  text_content: string;
  start_offset: number;
  end_offset: number;
  color: string;
  note?: string;
}

interface ModernHighlightRendererProps {
  highlights: Highlight[];
  contentRef: React.RefObject<HTMLDivElement>;
  onHighlightClick: (highlight: Highlight) => void;
}

export default function ModernHighlightRenderer({ 
  highlights, 
  contentRef, 
  onHighlightClick 
}: ModernHighlightRendererProps) {
  
  useEffect(() => {
    if (!contentRef.current || !highlights.length) return;

    const content = contentRef.current;
    
    // Clear existing highlights
    const existingHighlights = content.querySelectorAll('.modern-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ''), el);
        parent.normalize();
      }
    });

    // Apply new highlights
    highlights.forEach(highlight => {
      try {
        const walker = document.createTreeWalker(
          content,
          NodeFilter.SHOW_TEXT,
          null
        );

        let currentOffset = 0;
        let textNode: Text | null = null;
        let startNode: Text | null = null;
        let endNode: Text | null = null;
        let startOffset = 0;
        let endOffset = 0;

        // Find start and end nodes
        while ((textNode = walker.nextNode() as Text)) {
          const nodeLength = textNode.textContent?.length || 0;
          
          if (!startNode && currentOffset + nodeLength > highlight.start_offset) {
            startNode = textNode;
            startOffset = highlight.start_offset - currentOffset;
          }
          
          if (!endNode && currentOffset + nodeLength >= highlight.end_offset) {
            endNode = textNode;
            endOffset = highlight.end_offset - currentOffset;
            break;
          }
          
          currentOffset += nodeLength;
        }

        if (startNode && endNode) {
          const range = document.createRange();
          range.setStart(startNode, startOffset);
          range.setEnd(endNode, endOffset);

          // Create highlight element
          const highlightElement = document.createElement('span');
          highlightElement.className = 'modern-highlight cursor-pointer';
          highlightElement.style.backgroundColor = highlight.color;
          highlightElement.style.padding = '2px 0';
          highlightElement.style.borderRadius = '2px';
          highlightElement.title = highlight.note || 'Click to view highlight';
          
          highlightElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onHighlightClick(highlight);
          });

          try {
            range.surroundContents(highlightElement);
          } catch (error) {
            // If surroundContents fails, extract and wrap the content
            const contents = range.extractContents();
            highlightElement.appendChild(contents);
            range.insertNode(highlightElement);
          }
        }
      } catch (error) {
        console.warn('Failed to render highlight:', error);
      }
    });
  }, [highlights, contentRef, onHighlightClick]);

  return null; // This component doesn't render anything directly
}