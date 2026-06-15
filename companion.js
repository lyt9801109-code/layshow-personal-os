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
  var FACE = SUPA + '/storage/v1/object/public/ai-generated-images/leina_full.png';
  // leina.html 相對於目前頁（同目錄）
  var LEINA = location.pathname.replace(/[^/]*$/, '') + 'leina.html';

  var css = '#lna-fab{position:fixed;right:16px;bottom:84px;width:62px;height:62px;border-radius:50%;z-index:2147483000;'
    + 'box-shadow:0 8px 24px rgba(243,112,33,.5);cursor:pointer;border:3px solid #fff;overflow:hidden;background:#16294a;transition:transform .15s}'
    + '#lna-fab:active{transform:scale(.9)}'
    + '#lna-fab img{width:150%;height:150%;object-fit:cover;object-position:50% 8%;margin:-6px 0 0 -16%}'
    + '#lna-fab .ring{position:absolute;inset:-3px;border-radius:50%;box-shadow:0 0 0 0 rgba(243,112,33,.55);animation:lnaPulse 2.4s infinite}'
    + '@keyframes lnaPulse{0%{box-shadow:0 0 0 0 rgba(243,112,33,.5)}70%{box-shadow:0 0 0 12px rgba(243,112,33,0)}100%{box-shadow:0 0 0 0 rgba(243,112,33,0)}}'
    + '#lna-fab .lbl{position:absolute;bottom:-2px;left:0;right:0;text-align:center;font-size:8px;font-weight:800;color:#fff;background:rgba(12,35,64,.82);padding:1px 0}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('div');
  fab.id = 'lna-fab';
  fab.title = '雷娜 · 隨身軍師';
  fab.innerHTML = '<span class="ring"></span>'
    + '<img src="' + FACE + '" alt="雷娜" onerror="this.style.display=\'none\';this.parentNode.style.background=\'#16294a\'">'
    + '<span class="lbl">雷娜</span>';
  fab.onclick = function () { location.href = LEINA; };
  document.body.appendChild(fab);
})();
