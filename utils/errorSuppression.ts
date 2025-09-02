/**
 * Utility to suppress known non-critical errors from console
 * IMPORTANT: Never suppress navigation, interaction, or critical functionality errors
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// List of error patterns to suppress (ONLY image and resource loading errors)
const suppressedErrorPatterns = [
  /Failed to load resource.*404.*\.(jpg|png|jpeg|gif|webp|svg)/i,
  /Failed to load resource.*404.*covers.*\.(jpg|png)/i,
  /GET.*uploads\/covers.*404/i,
  /Failed to load.*image/i,
  /_next\/image.*400/i
];

// Patterns that should NEVER be suppressed (navigation, interaction, etc.)
const neverSuppressPatterns = [
  /navigation/i,
  /router/i,
  /click/i,
  /event/i,
  /listener/i,
  /handler/i,
  /interaction/i,
  /link/i,
  /button/i,
  /pointer/i,
  /mouse/i,
  /touch/i,
  /scroll/i,
  /focus/i,
  /blur/i
];

/**
 * Enhanced console.error that suppresses known non-critical errors
 */
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // NEVER suppress navigation or interaction errors
  const isImportantError = neverSuppressPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (isImportantError) {
    originalError.apply(console, args);
    return;
  }
  
  // Check if this error should be suppressed (only image/resource errors)
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
  
  // NEVER suppress navigation or interaction warnings
  const isImportantWarning = neverSuppressPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (isImportantWarning) {
    originalWarn.apply(console, args);
    return;
  }
  
  // Check if this warning should be suppressed (only image/resource warnings)
  const shouldSuppress = suppressedErrorPatterns.some(pattern => 
    pattern.test(message)
  );
  
  if (!shouldSuppress) {
    originalWarn.apply(console, args);
  }
};

export { originalError, originalWarn };

// Export function to temporarily disable error suppression for debugging
export function disableErrorSuppression() {
  console.error = originalError;
  console.warn = originalWarn;
  console.log('Error suppression disabled for debugging');
}

// Export function to re-enable error suppression
export function enableErrorSuppression() {
  // Re-apply the enhanced console methods
  console.error = (...args: any[]) => {
    const message = args.join(' ');
    const isImportantError = neverSuppressPatterns.some(pattern => pattern.test(message));
    if (isImportantError) {
      originalError.apply(console, args);
      return;
    }
    const shouldSuppress = suppressedErrorPatterns.some(pattern => pattern.test(message));
    if (!shouldSuppress) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    const isImportantWarning = neverSuppressPatterns.some(pattern => pattern.test(message));
    if (isImportantWarning) {
      originalWarn.apply(console, args);
      return;
    }
    const shouldSuppress = suppressedErrorPatterns.some(pattern => pattern.test(message));
    if (!shouldSuppress) {
      originalWarn.apply(console, args);
    }
  };
  
  console.log('Error suppression re-enabled');
}