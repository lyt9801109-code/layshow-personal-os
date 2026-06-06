// LAYSHOW 爬蟲客戶池 Service Worker
const CACHE = 'layshow-pool-v1-' + new Date().toISOString().slice(0, 10);

self.addEventListener('install', e => {
  console.log('[SW Pool] Installing', CACHE);
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW Pool] Activating', CACHE);
  e.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE && k.startsWith('layshow-pool-')).map(k => caches.delete(k))
    )),
    self.clients.claim()
  ]));
});

// 網路優先，失敗才用快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Supabase API 不快取（要即時資料）
  if (e.request.url.includes('supabase.co')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(r => {
        const clone = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
