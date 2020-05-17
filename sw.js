const cacheName = 'pwa';
const filesToCache = [
  'index.html',
  'assets/css/bootstrap.min.css',
  'assets/css/fontawesome.min.css',
  'assets/css/style.css',
  'assets/js/jquery.min.js',
  'assets/js/bootstrap.min.js',
  'assets/js/main.js'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.match(e.request).then(function(response) {
      return response || fetch(e.request);
    })
  );
});
