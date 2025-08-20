'use client';

import { useEffect, useRef, useState } from 'react';

interface SecureQuillProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export default function SecureQuill({
  value,
  onChange,
  placeholder = 'Start writing...',
  readOnly = false,
  className = '',
  style
}: SecureQuillProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const sanitizeHtml = (html: string): string => {
    // Basic HTML sanitization
    const allowedTags = ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'a', 'img'];
    const allowedAttributes = ['href', 'src', 'alt', 'title'];
    
    // Remove script tags and dangerous content
    let sanitized = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '');

    // Simple tag filtering (basic implementation)
    sanitized = sanitized.replace(/<(\/?)([\w]+)([^>]*)>/g, (match, slash, tag, attrs) => {
      if (!allowedTags.includes(tag.toLowerCase())) {
        return '';
      }
      
      // Filter attributes
      const cleanAttrs = attrs.replace(/(\w+)\s*=\s*["']([^"']*)["']/g, (attrMatch: string, name: string, val: string) => {
        if (allowedAttributes.includes(name.toLowerCase())) {
          return ` ${name}="${val}"`;
        }
        return '';
      });
      
      return `<${slash}${tag}${cleanAttrs}>`;
    });

    return sanitized;
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.innerHTML;
    const sanitized = sanitizeHtml(content);
    
    if (sanitized !== content) {
      e.currentTarget.innerHTML = sanitized;
    }
    
    onChange(sanitized);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sanitized = sanitizeHtml(text);
    
    document.execCommand('insertHTML', false, sanitized);
    onChange(editorRef.current?.innerHTML || '');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent dangerous key combinations
    if (e.ctrlKey || e.metaKey) {
      const key = e.key.toLowerCase();
      if (['u', 'shift+i', 'shift+j'].includes(key)) {
        e.preventDefault();
      }
    }
  };

  if (!isClient) {
    return (
      <div className="h-64 bg-gray-100 animate-pulse rounded-md flex items-center justify-center">
        <span className="text-gray-500">Loading editor...</span>
      </div>
    );
  }

  return (
    <div className={`secure-editor ${className}`} style={style}>
      {/* Toolbar */}
      <div className="border border-gray-300 border-b-0 rounded-t-md bg-gray-50 p-2 flex gap-1">
        <button
          type="button"
          onClick={() => document.execCommand('bold')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          disabled={readOnly}
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => document.execCommand('italic')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          disabled={readOnly}
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => document.execCommand('underline')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          disabled={readOnly}
        >
          <u>U</u>
        </button>
        <div className="border-l mx-2"></div>
        <button
          type="button"
          onClick={() => document.execCommand('formatBlock', false, 'h2')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          disabled={readOnly}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => document.execCommand('formatBlock', false, 'p')}
          className="px-2 py-1 text-sm border rounded hover:bg-gray-200"
          disabled={readOnly}
        >
          P
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable={!readOnly}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[200px] p-3 border border-gray-300 rounded-b-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        style={{ 
          ...style,
          minHeight: '200px'
        }}
        data-placeholder={placeholder}
      />

      <style jsx>{`
        .secure-editor [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}