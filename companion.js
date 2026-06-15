/* ============================================================
   雷娜行動指揮官 — 手機 OS 浮動軍師精靈（頭像）
   每頁右下浮現雷娜頭像 → 點開 = 全身雷娜對話頁 leina.html。
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
  // leina.html 相對於目前頁（同目錄）
  var LEINA = location.pathname.replace(/[^/]*$/, '') + 'leina.html';

  var css = '#lna-fab{position:fixed;right:16px;bottom:84px;width:62px;height:62px;border-radius:50%;z-index:2147483000;'
    + 'box-shadow:0 8px 24px rgba(243,112,33,.5);cursor:pointer;border:3px solid #fff;overflow:hidden;background:#16294a;transition:transform .15s}'
    + '#lna-fab:active{transform:scale(.9)}'
    + '#lna-fab img{width:150%;height:150%;object-fit:cover;object-position:50% 8%;margin:-6px 0 0 -16%}'
    + '#lna-fab .ring{position:absolute;inset:-3px;border-radius:50%;box-shadow:0 0 0 0 rgba(243,112,33,.55);animation:lnaPulse 2.4s infinite}'
    + '@keyframes lnaPulse{0%{box-shadow:0 0 0 0 rgba(243,112,33,.5)}70%{box-shadow:0 0 0 12px rgba(243,112,33,0)}100%{box-shadow:0 0 0 0 rgba(243,112,33,0)}}'
    + '#lna-fab .lbl{position:absolute;bottom:-2px;left:0;right:0;text-align:center;font-size:8px;font-weight:800;color:#fff;background:rgba(12,35,64,.82);padding:1px 0}'
    + '#lna-dot{position:absolute;top:-3px;right:-3px;min-width:20px;height:20px;border-radius:10px;background:#ff3b30;border:2px solid #fff;color:#fff;font-size:11px;font-weight:800;display:none;align-items:center;justify-content:center;padding:0 4px;z-index:1}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('div');
  fab.id = 'lna-fab';
  fab.title = '雷娜 · 隨身軍師';
  fab.innerHTML = '<span class="ring"></span>'
    + '<img src="' + FACE + '" alt="雷娜" onerror="this.style.display=\'none\';this.parentNode.style.background=\'#16294a\'">'
    + '<span class="lbl">雷娜</span><span id="lna-dot"></span>';
  fab.onclick = function () { location.href = LEINA; };
  document.body.appendChild(fab);

  // 雷娜主動提醒：有新 feed(id > 本地已讀) 就在頭像亮紅點數字 → 點開到 leina.html 看
  var dot = fab.querySelector('#lna-dot');
  async function checkFeed() {
    try {
      var r = await fetch(SUPA + '/rest/v1/leina_feed?select=id&order=id.desc&limit=20', { headers: { apikey: ANON, Authorization: 'Bearer ' + ANON } });
      var rows = await r.json();
      if (!Array.isArray(rows) || !rows.length) return;
      var seen = parseInt(localStorage.getItem('leina_feed_seen') || '0', 10);
      var unread = rows.filter(function (x) { return x.id > seen; }).length;
      if (unread > 0) { dot.textContent = unread > 9 ? '9+' : String(unread); dot.style.display = 'flex'; }
      else dot.style.display = 'none';
    } catch (e) {}
  }
  checkFeed();
  setInterval(checkFeed, 60000);
})();
