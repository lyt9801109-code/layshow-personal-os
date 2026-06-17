/* ============================================================
   雷娜行動指揮官 — 手機 OS 浮動軍師精靈（頭像 + 主動對話泡泡）
   每頁右下浮現雷娜頭像；有新情報會「主動冒泡泡講出來」、頭像會呼吸。
   點頭像或泡泡 → 全身雷娜對話頁 leina.html。
   注入：<script src="companion.js" defer></script>
   ============================================================ */
(function () {
  if (window.__leinaLoaded) return; window.__leinaLoaded = true;
  // 被 PWA 殼以 iframe 內嵌的子頁不重複（殼那層已有）
  try { if (window.top !== window.self) return; } catch (e) { return; }
  // 雷娜自己的全身頁不需要再浮一顆頭像
  if (/leina\.html$/i.test(location.pathname)) return;

  var SUPA = 'https://ujaogedhwcbyczzpgzpy.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW9nZWRod2NieWN6enBnenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTk0ODAsImV4cCI6MjA5MjY3NTQ4MH0.8zWp-rDr8RXhSETxW1cGE4G68KqNZ-UfH74lbILBVxg';
  var FACE = SUPA + '/storage/v1/object/public/ai-generated-images/leina_full.png';
  var LEINA = location.pathname.replace(/[^/]*$/, '') + 'leina.html';
  var HEAD = { apikey: ANON, Authorization: 'Bearer ' + ANON };

  var css = '#lna-fab{position:fixed;right:16px;bottom:84px;width:62px;height:62px;border-radius:50%;z-index:2147483000;'
    + 'box-shadow:0 8px 24px rgba(243,112,33,.5);cursor:pointer;border:3px solid #fff;overflow:hidden;background:#16294a;transition:transform .15s}'
    + '#lna-fab:active{transform:scale(.9)}'
    + '#lna-fab img{width:150%;height:150%;object-fit:cover;object-position:50% 8%;margin:-6px 0 0 -16%;animation:lnaBreathe 4.5s ease-in-out infinite;transform-origin:50% 30%}'
    + '@keyframes lnaBreathe{0%,100%{transform:scale(1)}50%{transform:scale(1.06)}}'
    + '#lna-fab.lna-bounce{animation:lnaBounce .6s ease}'
    + '@keyframes lnaBounce{0%,100%{transform:translateY(0)}30%{transform:translateY(-8px)}60%{transform:translateY(-3px)}}'
    + '#lna-fab .ring{position:absolute;inset:-3px;border-radius:50%;box-shadow:0 0 0 0 rgba(243,112,33,.55);animation:lnaPulse 2.4s infinite}'
    + '@keyframes lnaPulse{0%{box-shadow:0 0 0 0 rgba(243,112,33,.5)}70%{box-shadow:0 0 0 12px rgba(243,112,33,0)}100%{box-shadow:0 0 0 0 rgba(243,112,33,0)}}'
    + '#lna-fab .lbl{position:absolute;bottom:-2px;left:0;right:0;text-align:center;font-size:8px;font-weight:800;color:#fff;background:rgba(12,35,64,.82);padding:1px 0}'
    + '#lna-dot{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;border-radius:10px;background:#ff3b30;border:2px solid #fff;color:#fff;font-size:11px;font-weight:800;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:1}'
    // 主動對話泡泡
    + '#lna-bubble{position:fixed;right:84px;bottom:96px;max-width:210px;z-index:2147483000;background:#fff;color:#16294a;'
    + 'border-radius:14px;border-bottom-right-radius:4px;padding:9px 12px;box-shadow:0 10px 28px rgba(12,35,64,.30);'
    + 'font-size:12.5px;line-height:1.45;display:flex;gap:7px;align-items:flex-start;cursor:pointer;'
    + 'opacity:0;transform:translateY(10px) scale(.94);pointer-events:none;transition:all .3s cubic-bezier(.2,.9,.3,1.4)}'
    + '#lna-bubble.show{opacity:1;transform:translateY(0) scale(1);pointer-events:auto}'
    + '#lna-bubble .lb-emo{font-size:16px;flex:0 0 auto;line-height:1.3}'
    + '#lna-bubble .lb-tx{font-weight:600}'
    + '#lna-bubble:after{content:"";position:absolute;right:16px;bottom:-7px;border:7px solid transparent;border-top-color:#fff;border-bottom:0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('div');
  fab.id = 'lna-fab';
  fab.title = '雷娜 · 隨身軍師';
  fab.innerHTML = '<span class="ring"></span>'
    + '<img src="' + FACE + '" alt="雷娜" onerror="this.style.display=\'none\';this.parentNode.style.background=\'#16294a\'">'
    + '<span class="lbl">雷娜</span><span id="lna-dot"></span>';
  fab.onclick = function () { location.href = LEINA; };
  document.body.appendChild(fab);

  var bubble = document.createElement('div');
  bubble.id = 'lna-bubble';
  bubble.onclick = function () { location.href = LEINA; };
  document.body.appendChild(bubble);

  var hideT = null;
  function say(emoji, text) {
    if (!text) return;
    bubble.innerHTML = '<span class="lb-emo"></span><span class="lb-tx"></span>';
    bubble.querySelector('.lb-emo').textContent = emoji || '💎';
    bubble.querySelector('.lb-tx').textContent = text;
    bubble.classList.add('show');
    fab.classList.remove('lna-bounce'); void fab.offsetWidth; fab.classList.add('lna-bounce');
    if (hideT) clearTimeout(hideT);
    hideT = setTimeout(function () { bubble.classList.remove('show'); }, 8000);
  }

  var dot = fab.querySelector('#lna-dot');
  var lastUnread = -1, greeted = false;

  async function checkFeed() {
    try {
      var r = await fetch(SUPA + '/rest/v1/leina_feed?select=id,title,emoji&order=id.desc&limit=20', { headers: HEAD });
      var rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) return;
      var seen = parseInt(localStorage.getItem('leina_feed_seen') || '0', 10);
      var unreadRows = rows.filter(function (x) { return x.id > seen; });
      var unread = unreadRows.length;
      if (unread > 0) { dot.textContent = unread > 9 ? '9+' : String(unread); dot.style.display = 'flex'; }
      else dot.style.display = 'none';
      // 主動開口：①首次進頁打招呼 ②有新情報進來就把它講出來
      if (unread > 0 && !greeted) {
        greeted = true;
        setTimeout(function () { say('💎', '少爺，雷娜有 ' + unread + ' 則新情報，點我看 👀'); }, 1500);
      } else if (unread > lastUnread && lastUnread >= 0 && unreadRows[0]) {
        say(unreadRows[0].emoji || '💎', (unreadRows[0].title || '有新情報').slice(0, 42));
      }
      lastUnread = unread;
    } catch (e) {}
  }
  checkFeed();
  setInterval(checkFeed, 60000);

  // 閒置輪播：每 3 分鐘若仍有未讀，輕輕再冒一次最新一則（讓精靈「活著」）
  setInterval(function () {
    var seen = parseInt(localStorage.getItem('leina_feed_seen') || '0', 10);
    fetch(SUPA + '/rest/v1/leina_feed?select=title,emoji&order=id.desc&limit=1&id=gt.' + seen, { headers: HEAD })
      .then(function (r) { return r.json(); })
      .then(function (rows) { if (Array.isArray(rows) && rows[0]) say(rows[0].emoji || '💎', (rows[0].title || '').slice(0, 42)); })
      .catch(function () {});
  }, 180000);

  /* ===== 🔔 系統推播訂閱（之前完全沒有，所以手機收不到推播）=====
     公鑰本就公開可放前端。訂閱寫進 push_subscriptions，桌機 layshow_webpush 直推。 */
  var VAPID_PUB = 'BOUxcBB73fO0yZq10B-8r8syZlPmLEY66gXHfNkv5G8HPR16XkIWYtk3-81faZdvJFGUtMSVr6E4rxFIt-dYUks';
  function b64ToU8(b64) {
    var pad = '='.repeat((4 - b64.length % 4) % 4);
    var s = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/');
    var raw = atob(s), arr = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
    return arr;
  }
  async function saveSub(sub) {
    // push_subscriptions RLS 鎖死 anon，改走 edge function(service_role)安全 upsert
    try {
      var seenKey = 'leina_push_ep';
      var known = localStorage.getItem(seenKey) === sub.endpoint;
      var r = await fetch(SUPA + '/functions/v1/save-push-sub',
        { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, HEAD),
          body: JSON.stringify({ endpoint: sub.endpoint, sub: sub, ua: navigator.userAgent }) });
      var j = await r.json().catch(function () { return {}; });
      if (j && j.ok) { localStorage.setItem(seenKey, sub.endpoint); return known ? 'exists' : 'new'; }
      return 'err';
    } catch (e) { return 'err'; }
  }
  async function ensurePush(askIfNeeded) {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      var perm = (typeof Notification !== 'undefined') ? Notification.permission : 'denied';
      if (perm === 'denied') return;
      if (perm === 'default') {
        if (!askIfNeeded) return;           // 不在使用者手勢內就先不打擾
        perm = await Notification.requestPermission();
        if (perm !== 'granted') return;
      }
      var reg = await navigator.serviceWorker.ready;
      var sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToU8(VAPID_PUB) });
      }
      var res = await saveSub(sub.toJSON ? sub.toJSON() : sub);
      if (res === 'new') { try { say('🔔', '手機推播開好了！之後戰報、影片、雷達都會直接跳通知。'); } catch (e) {} }
    } catch (e) {}
  }
  // 已授權 → 靜默確保訂閱有效（修舊的失效訂閱）；未授權 → 等第一次點擊手勢再問一次
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    ensurePush(false);
  } else {
    var askedOnce = false;
    var onGesture = function () {
      if (askedOnce) return; askedOnce = true;
      document.removeEventListener('pointerdown', onGesture, true);
      ensurePush(true);
    };
    document.addEventListener('pointerdown', onGesture, true);
    setTimeout(function () { try { say('🔔', '少爺，點我一下就幫你開手機推播 →'); } catch (e) {} }, 3500);
  }
})();
