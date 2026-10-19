// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('BALTI Service Worker activated')
})

// Required to pass the browser's PWA installability test
self.addEventListener('fetch', (event) => {
  // Pass-through for now. You can add offline caching here later.
})