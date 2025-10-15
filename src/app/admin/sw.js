// public/admin/sw.js
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// (Optional) Add caching later:
self.addEventListener('fetch', () => {});
