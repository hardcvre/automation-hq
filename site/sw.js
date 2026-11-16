/* Offline shell for Automation HQ. Bump VERSION when shell files change. */
var VERSION = 'hq-v2';
var SHELL = ['./', 'index.html', 'manifest.webmanifest', 'vendor/three.min.js', 'vendor/OrbitControls.js', 'icons/icon-192.png', 'icons/icon-180.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(SHELL); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  var path = new URL(req.url).pathname;
  var fresh = req.mode === 'navigate' || /(status\.json|index\.html)$/.test(path);
  if (fresh) {
    /* Page and status: network first, cached copy when offline. */
    e.respondWith(fetch(req).then(function (res) {
      var copy = res.clone(); caches.open(VERSION).then(function (c) { c.put(req, copy); }); return res;
    }).catch(function () { return caches.match(req).then(function (m) { return m || caches.match('index.html'); }); }));
  } else {
    /* Libraries and icons: cached copy first. */
    e.respondWith(caches.match(req).then(function (m) { return m || fetch(req); }));
  }
});
