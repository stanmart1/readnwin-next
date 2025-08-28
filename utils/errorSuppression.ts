/**
 * Utility to suppress known non-critical errors from console
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// List of error patterns to suppress
const suppressedErrorPatterns = [
  /Failed to load resource.*404.*\.jpg/,
  /Failed to load resource.*404.*\.png/,
  /Failed to load resource.*404.*covers/,
  /GET.*uploads\/covers.*404/,
];

/**
 * Enhanced console.error that suppresses known non-critical errors
 */
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this error should be suppressed
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalError.apply(console, args);
  }
};

/**
 * Enhanced console.warn that suppresses known non-critical warnings
 */
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this warning should be suppressed
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

export { originalError, originalWarn };