// Early error handler to suppress known console errors (images only)
(function() {
  'use strict';
  
  if (typeof window === 'undefined') return;
  
  // Store original console methods
  const originalError = console.error;
  const originalWarn = console.warn;
  
  // List of error patterns to suppress (only image and resource loading errors)
  const suppressedErrorPatterns = [
    /Failed to load resource.*\.(jpg|png|jpeg|gif|webp|svg)/i,
    /Failed to load about section image/i,
    /using fallback/i,
    /_next\/image.*400/i,
    /\/uploads\/works\/.*404/i,
    /1755361316689_nwj1qoidkh/i,
    /1755366437045_aa12papdg4d/i,
    /1755383089021_4jrjnman35w/i,
    /Failed to load resource.*covers.*\.(jpg|png)/i,
    /GET.*uploads\/covers.*404/i
  ];
  
  // Override console.error
  console.error = function(...args) {
    const message = args.join(' ');
    
    // Check if this error should be suppressed (only suppress image/resource errors)
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
    
    // Check if this warning should be suppressed (only suppress image/resource warnings)
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
    
    // Only suppress specific image loading errors, not navigation errors
    if ((message.includes('Failed to fetch') && message.includes('image')) || 
        (message.includes('400') && (message.includes('jpg') || message.includes('png') || message.includes('covers'))) ||
        message.includes('_next/image')) {
      event.preventDefault();
      return;
    }
  });
  
  // Handle global errors
  window.addEventListener('error', function(event) {
    const message = event.message || '';
    const filename = event.filename || '';
    
    // Only suppress resource loading errors, not navigation or script errors
    if ((message.includes('Failed to load resource') && (filename.includes('image') || filename.includes('jpg') || filename.includes('png'))) ||
        (message.includes('400') && filename.includes('_next/image'))) {
      event.preventDefault();
      return;
    }
  });
})();