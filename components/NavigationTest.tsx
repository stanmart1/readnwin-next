'use client';

import { useEffect } from 'react';

export default function NavigationTest() {
  useEffect(() => {
    const testNavigation = () => {
      console.log('🔍 Navigation test: Checking cart link...');
      
      const cartLink = document.querySelector('a[href="/cart-new"]');
      if (cartLink) {
        const element = cartLink as HTMLElement;
        const computedStyle = window.getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        
        console.log('Cart link analysis:', {
          element,
          pointerEvents: computedStyle.pointerEvents,
          zIndex: computedStyle.zIndex,
          position: computedStyle.position,
          display: computedStyle.display,
          visibility: computedStyle.visibility,
          opacity: computedStyle.opacity,
          rect,
          parent: element.parentElement,
          parentStyle: element.parentElement ? window.getComputedStyle(element.parentElement) : null
        });
        
        // Check what's covering the cart link
        const elementAtPoint = document.elementFromPoint(rect.left + rect.width/2, rect.top + rect.height/2);
        console.log('Element at cart link position:', elementAtPoint);
        
        // Test click
        element.addEventListener('click', (e) => {
          console.log('Cart link clicked!', e);
        });
      }
    };
    
    const timer = setTimeout(testNavigation, 2000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}