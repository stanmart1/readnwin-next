// Global error handler utilities
export const suppressConsoleErrors = () => {
  if (typeof window !== 'undefined') {
    // Override console.error to filter out known issues
    const originalError = console.error;
    console.error = (...args) => {
      const message = args.join(' ');
      
      // Filter out known CSP and image loading errors that are handled
      if (
        message.includes('Content Security Policy') ||
        message.includes('Failed to load resource') ||
        message.includes('the server responded with a status of 400') ||
        message.includes('Refused to load') ||
        message.includes('violates the following Content Security Policy')
      ) {
        // Silently handle these errors as they're expected and handled
        return;
      }
      
      // Log other errors normally
      originalError.apply(console, args);
    };

    // Override console.warn for similar filtering
    const originalWarn = console.warn;
    console.warn = (...args) => {
      const message = args.join(' ');
      
      if (
        message.includes('Failed to load about section image') ||
        message.includes('using fallback')
      ) {
        // These are handled gracefully, no need to warn
        return;
      }
      
      originalWarn.apply(console, args);
    };
  }
};

export const handleImageError = (
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackSrc: string = '/images/placeholder.svg'
) => {
  const target = event.currentTarget;
  if (target.src !== fallbackSrc) {
    target.src = fallbackSrc;
  }
};

export const createImageErrorHandler = (fallbackSrc: string = '/images/placeholder.svg') => {
  return (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    handleImageError(event, fallbackSrc);
  };
};