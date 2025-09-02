// Console suppressions for development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Suppress React DevTools message
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    const message = args.join(' ');
    if (message.includes('Download the React DevTools')) {
      return; // Suppress this message
    }
    originalConsoleLog.apply(console, args);
  };

  // Suppress specific cart context warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.join(' ');
    if (message.includes('useCart called outside CartProvider') || 
        message.includes('useGuestCart called outside GuestCartProvider')) {
      return; // Suppress these warnings as they have fallbacks
    }
    originalConsoleWarn.apply(console, args);
  };
}

export {};