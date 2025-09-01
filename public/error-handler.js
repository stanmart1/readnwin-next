// Early error handler to suppress known console errors
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // List of error patterns to suppress
  const suppressedErrorPatterns = [
    /Content Security Policy/i,
    /Failed to load resource.*400/i,
    /Refused to load.*violates.*Content Security Policy/i,
    /Failed to load about section image/i,
    /using fallback/i,
    /_next\/image.*400/i
  ];
  
  // Override console.error
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Check if this error should be suppressed
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      pattern.test(message)
    );
    
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
  
  // Override console.warn
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // Check if this warning should be suppressed
    const shouldSuppress = suppressedErrorPatterns.some(pattern => 
      pattern.test(message)
    );
    
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
  
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', function(event) {
    const message = event.reason?.message || event.reason || '';
    
    // Suppress known image loading errors
    if (message.includes('Failed to fetch') || 
        message.includes('400') ||
        message.includes('image')) {
      event.preventDefault();
      return;
    }
  });
  
  // Handle global errors
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    
    // Suppress known resource loading errors
    if (message.includes('Failed to load resource') ||
        message.includes('400') ||
        event.filename?.includes('_next/image')) {
      event.preventDefault();
      return;
    }
  });
})();