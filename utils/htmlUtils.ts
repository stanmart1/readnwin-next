/**
 * Decode HTML entities in a string
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window !== 'undefined') {
    // Client-side: use DOM API
    const textarea = document.createElement('textarea');
    textarea.innerHTML = text;
    return textarea.value;
  } else {
    // Server-side: manual replacement for common entities
    return text
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ');
  }
}