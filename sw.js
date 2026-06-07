// LAYSHOW Personal OS Service Worker v9 (2026-06-07)
// v9: 軍師管家正名 + 今日 3 件事 + 一鍵問軍師管家
const CACHE_VERSION = 'layshow-os-v9-' + new Date().toISOString().slice(0, 10);

self.addEventListener('install', e => {
  console.log('[SW] Installing', CACHE_VERSION);
  // 立刻啟用，不等舊版終止
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('[SW] Activating', CACHE_VERSION);
  e.waitUntil(
    Promise.all([
      // 刪除所有舊快取
      caches.keys().then(keys => {
        return Promise.all(
          keys.filter(k => k !== CACHE_VERSION).map(k => {
            console.log('[SW] Deleting old cache:', k);
            return caches.delete(k);
          })
        );
      }),
      // 立刻接管所有頁面
      self.clients.claim()
    ])
  );
});

// 網路優先（永遠抓最新），失敗才用快取
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        // 成功就更新快取
        const clone = r.clone();
        caches.open(CACHE_VERSION).then(c => c.put(e.request, clone));
        return r;
      })
      .catch(() => caches.match(e.request))
  );
});
