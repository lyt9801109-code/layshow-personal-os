// LAYSHOW Personal OS Service Worker v11 (2026-06-17)
// v11: 🔔 補上 push / notificationclick handler——之前完全沒有，所以系統推播送到也不會跳！
// v10: 修「待跟進客戶」bug + 30 處副官→軍師管家全替換
const CACHE_VERSION = 'layshow-os-v11-' + new Date().toISOString().slice(0, 10);

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

// 🔔 收到系統推播 → 跳通知欄（之前缺這段，所以推播送到也不顯示）
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {
    try { d = { title: 'LAYSHOW', body: e.data ? e.data.text() : '' }; } catch (__) { d = {}; }
  }
  const title = d.title || '雷娜 · LAYSHOW';
  const opts = {
    body: d.body || '',
    icon: d.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: d.tag || 'layshow',
    renotify: true,                 // 同 tag 也要再震一次（不被靜默合併）
    requireInteraction: false,
    vibrate: [120, 60, 120],
    data: { url: d.url || '/' }
  };
  e.waitUntil(self.registration.showNotification(title, opts));
});

// 點通知 → 開/聚焦對應頁面
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) {
          if (c.navigate && target !== '/') { try { c.navigate(target); } catch (_) {} }
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
