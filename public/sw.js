// Service Worker to handle failed image requests
const CACHE_NAME = 'readnwin-images-v1';
const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

self.addEventListener('fetch', (event) => {
  // Only handle image requests
  if (event.request.destination === 'image' || 
      event.request.url.includes('/_next/image') ||
      event.request.url.includes('/images/')) {
    
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // If the image loads successfully, return it
          if (response.ok) {
            return response;
          }
          
          // If it fails, return placeholder
          return fetch(PLACEHOLDER_IMAGE);
        })
        .catch(() => {
          // If fetch fails entirely, return placeholder
          return fetch(PLACEHOLDER_IMAGE);
        })
    );
  }
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});