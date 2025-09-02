'use client';

/**
 * Navigation Protection Utility
 * Ensures navigation links remain responsive and prevents interference from other components
 */

let isNavigationProtected = false;

export function protectNavigation() {
  if (isNavigationProtected || typeof window === 'undefined') return;
  
  isNavigationProtected = true;
  
  // Ensure navigation elements are always clickable
  const protectNavigationElements = () => {
    const selectors = [
      'header',
      'header nav',
      'header nav a',
      'header button',
      '[data-navigation]',
      '.navigation-safe'
    ];
    
    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const el = element as HTMLElement;
        el.style.pointerEvents = 'auto';
        el.style.zIndex = '50';
      });
    });
  };
  
  // Run protection immediately and on DOM changes
  protectNavigationElements();
  
  // Use MutationObserver to protect navigation on DOM changes
  const observer = new MutationObserver(() => {
    protectNavigationElements();
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['style', 'class']
  });
  
  // Protect on window focus
  window.addEventListener('focus', protectNavigationElements);
  
  // Protect on scroll (in case of sticky elements)
  let scrollTimeout: NodeJS.Timeout;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(protectNavigationElements, 100);
  });
  
  console.log('✅ Navigation protection enabled');
}

export function ensureNavigationResponsive() {
  if (typeof window === 'undefined') return;
  
  // Remove any potential blocking overlays
  const removeBlockingElements = () => {
    const potentialBlockers = document.querySelectorAll('[style*="pointer-events: none"]');
    potentialBlockers.forEach(element => {
      const el = element as HTMLElement;
      if (!el.closest('header') && !el.classList.contains('navigation-safe')) {
        // Only remove pointer-events: none from non-navigation elements
        if (el.style.pointerEvents === 'none') {
          el.style.pointerEvents = 'auto';
        }
      }
    });
  };
  
  removeBlockingElements();
  
  // Check for invisible overlays that might block navigation
  const checkForOverlays = () => {
    const header = document.querySelector('header');
    if (!header) return;
    
    const headerRect = header.getBoundingClientRect();
    const elementsAtHeaderPosition = document.elementsFromPoint(
      headerRect.left + headerRect.width / 2,
      headerRect.top + headerRect.height / 2
    );
    
    // If header is not the topmost element, there might be an overlay
    if (elementsAtHeaderPosition[0] !== header && !elementsAtHeaderPosition[0]?.closest('header')) {
      console.warn('Potential overlay detected over navigation:', elementsAtHeaderPosition[0]);
      
      // Try to fix by adjusting z-index
      if (header instanceof HTMLElement) {
        header.style.zIndex = '9999';
      }
    }
  };
  
  checkForOverlays();
}