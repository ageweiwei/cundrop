// CunDrop service worker: 静态资源缓存优先, 页面和接口走网络
const CACHE = 'cundrop-v1';
const STATIC = [
  '/css/style.css',
  '/js/app.js',
  '/js/share.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/manifest.json',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return; // 第三方请求不管
  if (url.pathname.startsWith('/api/')) return; // 接口走网络
  if (STATIC.some((p) => url.pathname === p)) {
    // 静态资源: 缓存优先
    e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
  } else {
    // 页面: 网络优先, 断网时回缓存
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
  }
});
