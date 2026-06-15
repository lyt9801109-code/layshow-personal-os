/* ============================================================
   雷娜行動指揮官 — 手機 OS 浮動軍師精靈
   無時無刻浮在身邊：點頭像開對話、切軍官、連 commander-chat。
   注入方式：在任何頁面 <script src="companion.js" defer></script>
   ============================================================ */
(function () {
  if (window.__leinaLoaded) return; window.__leinaLoaded = true;
  // 被 PWA 殼以 iframe 內嵌的子頁不重複長雷娜（殼那層已經有），避免雙重精靈
  try { if (window.top !== window.self) return; } catch (e) { return; }

  var SUPA = 'https://ujaogedhwcbyczzpgzpy.supabase.co';
  var ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqYW9nZWRod2NieWN6enBnenB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwOTk0ODAsImV4cCI6MjA5MjY3NTQ4MH0.8zWp-rDr8RXhSETxW1cGE4G68KqNZ-UfH74lbILBVxg';
  var FN = SUPA + '/functions/v1/commander-chat';
  var AVATAR = SUPA + '/storage/v1/object/public/ai-generated-images/leina_bust.jpg';
  var OFFICERS = [
    { k: '軍師', e: '💎', n: '雷娜' },
    { k: '財務官', e: '📊', n: '思妤' },
    { k: 'B2B軍師', e: '📈', n: '語彤' },
    { k: '戰情官', e: '📡', n: '子涵' },
    { k: '獵客官', e: '🎯', n: '宥潔' },
  ];
  var cur = '軍師';
  var busy = false;

  function hist(o) { try { return JSON.parse(localStorage.getItem('leina_hist_' + o) || '[]'); } catch (e) { return []; } }
  function saveHist(o, h) { try { localStorage.setItem('leina_hist_' + o, JSON.stringify(h.slice(-30))); } catch (e) {} }

  var css = ''
    + '#lna-fab{position:fixed;right:16px;bottom:80px;width:60px;height:60px;border-radius:50%;z-index:2147483000;'
    + 'box-shadow:0 8px 24px rgba(243,112,33,.45);cursor:pointer;border:3px solid #fff;overflow:hidden;background:#0c2340;transition:transform .15s}'
    + '#lna-fab:active{transform:scale(.92)}#lna-fab img{width:100%;height:100%;object-fit:cover}'
    + '#lna-fab .dot{position:absolute;top:-2px;right:-2px;width:16px;height:16px;border-radius:50%;background:#ff3b30;border:2px solid #fff;display:none}'
    + '#lna-panel{position:fixed;inset:0;z-index:2147483001;background:rgba(4,10,20,.55);display:none;align-items:flex-end;justify-content:center}'
    + '#lna-panel.show{display:flex}'
    + '.lna-box{background:#0a1424;color:#eaf2fc;width:100%;max-width:560px;height:82vh;border-radius:18px 18px 0 0;display:flex;flex-direction:column;animation:lnaUp .22s ease-out}'
    + '@keyframes lnaUp{from{transform:translateY(100%)}to{transform:translateY(0)}}'
    + '.lna-hd{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #1d3047}'
    + '.lna-hd img{width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid #ff8a3d}'
    + '.lna-hd .t{flex:1;font-weight:800;font-size:15px}.lna-hd .t small{display:block;font-weight:400;font-size:11px;color:#7d93ad}'
    + '.lna-x{background:none;border:none;color:#7d93ad;font-size:24px;cursor:pointer;padding:0 6px}'
    + '.lna-offs{display:flex;gap:6px;overflow-x:auto;padding:10px 14px;border-bottom:1px solid #1d3047}'
    + '.lna-off{flex:0 0 auto;padding:7px 12px;border-radius:999px;border:1px solid #24344a;background:#0f1d33;color:#aecbe8;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap}'
    + '.lna-off.on{background:linear-gradient(120deg,#f37021,#ff8a3d);color:#fff;border-color:transparent}'
    + '.lna-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px}'
    + '.lna-m{max-width:84%;padding:10px 13px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-break:break-word}'
    + '.lna-m.u{align-self:flex-end;background:#f37021;color:#fff;border-bottom-right-radius:4px}'
    + '.lna-m.a{align-self:flex-start;background:#13243d;border:1px solid #1d3047;border-bottom-left-radius:4px}'
    + '.lna-m.tip{align-self:center;color:#7d93ad;font-size:12px;background:none}'
    + '.lna-in{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #1d3047}'
    + '.lna-in input{flex:1;padding:11px 14px;border-radius:22px;border:1px solid #24344a;background:#0f1d33;color:#eaf2fc;font-size:14px;outline:none}'
    + '.lna-in button{padding:0 18px;border:none;border-radius:22px;background:linear-gradient(120deg,#f37021,#ff8a3d);color:#fff;font-weight:800;cursor:pointer}'
    + '.lna-in button:disabled{opacity:.5}';

  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var fab = document.createElement('div');
  fab.id = 'lna-fab';
  fab.innerHTML = '<img src="' + AVATAR + '" alt="雷娜" onerror="this.style.display=\'none\';this.parentNode.innerHTML=\'<div style=&quot;color:#ff8a3d;font-size:26px;text-align:center;line-height:60px&quot;>💎</div>\'"><span class="dot" id="lna-dot"></span>';
  document.body.appendChild(fab);

  var panel = document.createElement('div');
  panel.id = 'lna-panel';
  panel.innerHTML = ''
    + '<div class="lna-box">'
    + '  <div class="lna-hd"><img src="' + AVATAR + '" onerror="this.style.display=\'none\'"><div class="t" id="lna-title">雷娜 · 軍師</div><button class="lna-x" id="lna-close">×</button></div>'
    + '  <div class="lna-offs" id="lna-offs"></div>'
    + '  <div class="lna-msgs" id="lna-msgs"></div>'
    + '  <div class="lna-in"><input id="lna-input" placeholder="跟雷娜說話…" autocomplete="off"><button id="lna-send">送出</button></div>'
    + '</div>';
  document.body.appendChild(panel);

  var elOffs = panel.querySelector('#lna-offs');
  var elMsgs = panel.querySelector('#lna-msgs');
  var elIn = panel.querySelector('#lna-input');
  var elSend = panel.querySelector('#lna-send');
  var elTitle = panel.querySelector('#lna-title');

  function renderOffs() {
    elOffs.innerHTML = OFFICERS.map(function (o) {
      return '<button class="lna-off' + (o.k === cur ? ' on' : '') + '" data-k="' + o.k + '">' + o.e + ' ' + o.n + '</button>';
    }).join('');
    elOffs.querySelectorAll('.lna-off').forEach(function (b) {
      b.onclick = function () { cur = b.getAttribute('data-k'); var o = off(cur); elTitle.textContent = o.n + ' · ' + cur; elIn.placeholder = '跟' + o.n + '說話…'; renderOffs(); renderMsgs(); };
    });
  }
  function off(k) { for (var i = 0; i < OFFICERS.length; i++) if (OFFICERS[i].k === k) return OFFICERS[i]; return OFFICERS[0]; }

  function renderMsgs() {
    var h = hist(cur);
    if (!h.length) {
      var o = off(cur);
      elMsgs.innerHTML = '<div class="lna-m tip">' + o.e + ' ' + o.n + ' 在這，少爺有什麼吩咐？</div>';
      return;
    }
    elMsgs.innerHTML = h.map(function (m) {
      return '<div class="lna-m ' + (m.role === 'user' ? 'u' : 'a') + '">' + esc(m.content) + '</div>';
    }).join('');
    elMsgs.scrollTop = elMsgs.scrollHeight;
  }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function open() { panel.classList.add('show'); document.getElementById('lna-dot').style.display = 'none'; renderOffs(); renderMsgs(); setTimeout(function () { elIn.focus(); }, 200); }
  function close() { panel.classList.remove('show'); }
  fab.onclick = open;
  panel.querySelector('#lna-close').onclick = close;
  panel.onclick = function (e) { if (e.target === panel) close(); };

  async function send() {
    var text = (elIn.value || '').trim();
    if (!text || busy) return;
    busy = true; elSend.disabled = true; elIn.value = '';
    var h = hist(cur); h.push({ role: 'user', content: text }); saveHist(cur, h); renderMsgs();
    var thinking = document.createElement('div'); thinking.className = 'lna-m a'; thinking.textContent = '…'; elMsgs.appendChild(thinking); elMsgs.scrollTop = elMsgs.scrollHeight;
    try {
      var r = await fetch(FN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: 'Bearer ' + ANON },
        body: JSON.stringify({ officer: cur, message: text, history: h.slice(0, -1) })
      });
      var d = await r.json();
      var reply = d.reply || ('（' + (d.error || '沒回應') + '）');
      h.push({ role: 'assistant', content: reply }); saveHist(cur, h);
    } catch (e) {
      h.push({ role: 'assistant', content: '（連線出狀況，稍後再試）' }); saveHist(cur, h);
    }
    busy = false; elSend.disabled = false; renderMsgs();
  }
  elSend.onclick = send;
  elIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
})();
