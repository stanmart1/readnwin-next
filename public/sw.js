// Service Worker to handle failed image requests only (not navigation)
const CACHE_NAME = 'readnwin-images-v1';
const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle image requests, never navigation or API requests
  if (event.request.destination === 'image' || 
      (event.request.url.includes('/_next/image') && event.request.method === 'GET') ||
      (event.request.url.includes('/images/') && event.request.method === 'GET')) {
    
    // Don't handle navigation requests or API calls
    if (event.request.mode === 'navigate' || 
        event.request.url.includes('/api/') ||
        event.request.url.includes('/_next/static/') ||
        event.request.destination === 'document') {
      return;
    }
    
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

