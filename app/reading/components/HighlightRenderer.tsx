"use client";

import React, { useEffect, useRef, RefObject } from "react";
import { Highlight } from "@/types/ereader";


interface HighlightRendererProps {
  highlights: Highlight[];
  contentRef: RefObject<HTMLDivElement>;
  onHighlightClick: (highlight: Highlight) => void;
  onHighlightHover?: (highlight: Highlight | null) => void;
}

interface HighlightRange {
  startContainer: Node;
  startOffset: number;
  endContainer: Node;
  endOffset: number;
}

export default function HighlightRenderer({
  highlights,
  contentRef,
  onHighlightClick,
  onHighlightHover,
}: HighlightRendererProps) {
  const highlightElementsRef = useRef<Map<string, HTMLElement[]>>(new Map());

  // Color mapping for highlight types
  const getHighlightColor = (color: string) => {
    const colors = {
      yellow: "rgba(255, 255, 0, 0.3)",
      green: "rgba(34, 197, 94, 0.3)",
      blue: "rgba(59, 130, 246, 0.3)",
      pink: "rgba(236, 72, 153, 0.3)",
      purple: "rgba(147, 51, 234, 0.3)",
    };
    return colors[color as keyof typeof colors] || colors.yellow;
  };

  // Find text nodes within a container
  const getTextNodes = (container: Node): Text[] => {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && node.textContent.trim()) {
        textNodes.push(node as Text);
      }
    }
    return textNodes;
  };

  // Find the range for a highlight based on text content and offsets
  const findHighlightRange = (highlight: Highlight): HighlightRange | null => {
    if (!contentRef.current) return null;

    const textNodes = getTextNodes(contentRef.current);
    let currentOffset = 0;
    let startContainer: Node | null = null;
    let startOffset = 0;
    let endContainer: Node | null = null;
    let endOffset = 0;

    // Find start and end positions
    for (const textNode of textNodes) {
      const nodeLength = textNode.textContent?.length || 0;
      const nodeStartOffset = currentOffset;
      const nodeEndOffset = currentOffset + nodeLength;

      // Check if highlight starts in this node
      if (
        !startContainer &&
        highlight.startOffset >= nodeStartOffset &&
        highlight.startOffset <= nodeEndOffset
      ) {
        startContainer = textNode;
        startOffset = highlight.startOffset - nodeStartOffset;
      }

      // Check if highlight ends in this node
      if (
        !endContainer &&
        highlight.endOffset >= nodeStartOffset &&
        highlight.endOffset <= nodeEndOffset
      ) {
        endContainer = textNode;
        endOffset = highlight.endOffset - nodeStartOffset;
        break;
      }

      currentOffset += nodeLength;
    }

    if (startContainer && endContainer) {
      return {
        startContainer,
        startOffset,
        endContainer,
        endOffset,
      };
    }

    return null;
  };

  // Create highlight span element
  const createHighlightSpan = (highlight: Highlight): HTMLSpanElement => {
    const span = document.createElement("span");
    span.className = "highlight-span";
    span.style.backgroundColor = getHighlightColor(highlight.color);
    span.style.cursor = "pointer";
    span.style.borderRadius = "2px";
    span.style.padding = "1px 2px";
    span.style.margin = "0 1px";
    span.style.transition = "background-color 0.2s ease";
    span.dataset.highlightId = highlight.id;
    span.dataset.highlightColor = highlight.color;

    // Add event listeners
    span.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      onHighlightClick(highlight);
    });

    if (onHighlightHover) {
      span.addEventListener("mouseenter", () => {
        onHighlightHover(highlight);
        span.style.backgroundColor = getHighlightColor(highlight.color).replace(
          "0.3",
          "0.5",
        );
      });

      span.addEventListener("mouseleave", () => {
        onHighlightHover(null);
        span.style.backgroundColor = getHighlightColor(highlight.color);
      });
    }

    return span;
  };

  // Apply highlight to a range
  const applyHighlight = (highlight: Highlight) => {
    const range = findHighlightRange(highlight);
    if (!range) return;

    try {
      const domRange = document.createRange();
      domRange.setStart(range.startContainer, range.startOffset);
      domRange.setEnd(range.endContainer, range.endOffset);

      // Check if the range is valid and contains text
      if (domRange.collapsed || !domRange.toString().trim()) {
        return;
      }

      // Create highlight span
      const highlightSpan = createHighlightSpan(highlight);

      // Extract and wrap the content
      try {
        const contents = domRange.extractContents();
        highlightSpan.appendChild(contents);
        domRange.insertNode(highlightSpan);

        // Store reference to the highlight element
        const existingElements =
          highlightElementsRef.current.get(highlight.id) || [];
        highlightElementsRef.current.set(highlight.id, [
          ...existingElements,
          highlightSpan,
        ]);
      } catch (error) {
        console.warn("Failed to apply highlight:", error);
      }
    } catch (error) {
      console.warn("Failed to create range for highlight:", error);
    }
  };

  // Remove all highlights
  const removeAllHighlights = () => {
    highlightElementsRef.current.forEach((elements, highlightId) => {
      elements.forEach((element) => {
        try {
          if (element.parentNode) {
            // Move children back to parent
            while (element.firstChild) {
              element.parentNode.insertBefore(element.firstChild, element);
            }
            // Remove the highlight span
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          console.warn("Failed to remove highlight element:", error);
        }
      });
    });
    highlightElementsRef.current.clear();

    // Normalize text nodes to merge adjacent text nodes
    if (contentRef.current) {
      contentRef.current.normalize();
    }
  };

  // Remove specific highlight
  const removeHighlight = (highlightId: string) => {
    const elements = highlightElementsRef.current.get(highlightId);
    if (elements) {
      elements.forEach((element) => {
        try {
          if (element.parentNode) {
            while (element.firstChild) {
              element.parentNode.insertBefore(element.firstChild, element);
            }
            element.parentNode.removeChild(element);
          }
        } catch (error) {
          console.warn("Failed to remove highlight element:", error);
        }
      });
      highlightElementsRef.current.delete(highlightId);
    }
  };

  // Apply all highlights
  const applyAllHighlights = () => {
    if (!contentRef.current || !highlights.length) return;

    // Sort highlights by start position to avoid conflicts
    const sortedHighlights = [...highlights].sort(
      (a, b) => a.startOffset - b.startOffset,
    );

    sortedHighlights.forEach((highlight) => {
      applyHighlight(highlight);
    });
  };

  // Effect to handle highlight changes
  useEffect(() => {
    if (!contentRef.current) return;

    // Remove existing highlights
    removeAllHighlights();

    // Apply new highlights
    applyAllHighlights();

    // Cleanup function
    return () => {
      removeAllHighlights();
    };
  }, [highlights, contentRef.current]);

  // Function to get highlight at position (for external use)
  const getHighlightAtPosition = (x: number, y: number): Highlight | null => {
    const element = document.elementFromPoint(x, y);
    if (element && element.classList.contains("highlight-span")) {
      const highlightId = (element as HTMLElement).dataset.highlightId;
      return highlights.find((h) => h.id === highlightId) || null;
    }
    return null;
  };

  // Function to scroll to highlight (for external use)
  const scrollToHighlight = (highlightId: string) => {
    const elements = highlightElementsRef.current.get(highlightId);
    if (elements && elements.length > 0) {
      const firstElement = elements[0];
      firstElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Add temporary visual emphasis
      const originalBg = firstElement.style.backgroundColor;
      firstElement.style.backgroundColor = getHighlightColor("blue").replace(
        "0.3",
        "0.7",
      );

      setTimeout(() => {
        firstElement.style.backgroundColor = originalBg;
      }, 1000);
    }
  };

  // Expose methods for parent component
  React.useImperativeHandle(
    contentRef,
    () => ({
      getHighlightAtPosition,
      scrollToHighlight,
      removeHighlight,
      removeAllHighlights,
    }),
    [
      highlights,
      getHighlightAtPosition,
      scrollToHighlight,
      removeAllHighlights,
    ],
  );

  // This component doesn't render anything directly
  // It manipulates the DOM of the content element
  return null;
}
