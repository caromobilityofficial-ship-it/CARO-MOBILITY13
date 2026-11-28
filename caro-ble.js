/* ═══════════════════════════════════════════════════════════
   caro-ble.js — ★v1 블루투스 스마트키 (안드로이드 앱 3.5.0 이상)
   ───────────────────────────────────────────────────────────
   무엇: 지하 주차장처럼 차 단말이 통신을 못 하는 곳에서도, 폰 블루투스로 차 문을 바로 열고 잠근다.
   방법: ① 이용 시간이 되면 서버(issueBleKey)에서 이 예약 전용 디지털 키를 받아 둔다 (본인 · 유효 예약 · 정지 아님을 서버가 확인).
         ② [문 열기]·[문 잠금] 을 누르면 먼저 블루투스로 차를 찾아(약 4초) 바로 실행한다.
         ③ 차가 근처에 없거나 블루투스가 안 되면 예전처럼 서버 명령으로 보낸다 (아무것도 달라지지 않음).
   권한: 처음 쓸 때 '블루투스 스마트키' 안내 창 → 안드로이드 '근처 기기' 권한 창 → (꺼져 있으면) 블루투스 켜기 창.
   제외: 웹 브라우저 · 아이폰 · 예전 앱(3.4.x 이하)에서는 아무것도 하지 않는다.
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroBle) return; window.__caroBle = true;
  var B = window.CaroBle;
  if(!B || typeof B.run !== 'function' || typeof B.status !== 'function') return;   // 앱이 아니거나 예전 앱

  var KEY_PFX = 'caro_blekey_', ASK_KEY = 'caro_ble_asked', SCAN_MS = 4000;
  var cbs = {}, seq = 0, fetching = {}, busyT = {};

  /* ── 앱 → 웹 결과 ── */
  window.__caroBleCb = function(id, result, code, ms){
    var f = cbs[id]; if(!f) return; delete cbs[id];
    try{ f({ result: String(result || ''), code: Number(code), ms: Number(ms) || 0 }); }catch(e){}
  };
  function st(){ try{ return JSON.parse(B.status()) || {}; }catch(e){ return {}; } }
  function runBle(key, cmd){
    return new Promise(function(res){
      var id = 'b' + Date.now() + '_' + (++seq);
      var to = setTimeout(function(){ if(cbs[id]){ delete cbs[id]; res({ result: 'timeout', code: -1 }); } }, SCAN_MS + 30000);
      cbs[id] = function(r){ clearTimeout(to); res(r); };
      try{ B.run(JSON.stringify({ id: id, token: key.token, sk: key.sk, devHash: key.devHash, name: key.name, cmd: cmd, scanMs: SCAN_MS })); }
      catch(e){ clearTimeout(to); delete cbs[id]; res({ result: 'error', code: -1 }); }
    });
  }

  /* ── 예약 고르기 (caro-live 와 같은 기준) ── */
  function t(x){ if(!x) return NaN; return (x instanceof Date) ? x.getTime() : (x && typeof x.toDate === 'function') ? x.toDate().getTime() : new Date(x).getTime(); }
  function live(r){ return r && !r.returned && !r.cancelled && r.status !== 'cancelled' && r.start && r.end; }
  function activeRes(){
    var now = Date.now(), best = null;
    (window.myReservations || []).forEach(function(r){
      if(!live(r)) return; var s = t(r.start), e = t(r.end);
      if(isNaN(s) || isNaN(e) || now < s - 10*60000 || now > e + 24*3600000) return;
      if(!best || s < t(best.start)) best = r;
    });
    return best;
  }
  function resForCar(carId){
    var f = null;
    (window.myReservations || []).some(function(x){ if(live(x) && x.car && String(x.car.id) === String(carId)){ f = x; return true; } return false; });
    return f || activeRes();
  }

  /* ── 디지털 키 (이 폰에만 · 끝나면 지움) ── */
  function loadKey(bookNo){ try{ var k = JSON.parse(localStorage.getItem(KEY_PFX + bookNo) || 'null'); return k && k.token ? k : null; }catch(e){ return null; } }
  function saveKey(bookNo, k){ try{ localStorage.setItem(KEY_PFX + bookNo, JSON.stringify(k)); }catch(e){} }
  function cleanKeys(){
    try{ var now = Date.now() / 1000;
      for(var i = localStorage.length - 1; i >= 0; i--){ var n = localStorage.key(i); if(n && n.indexOf(KEY_PFX) === 0){ var k = null; try{ k = JSON.parse(localStorage.getItem(n)); }catch(e){} if(!k || !(k.exp > now)) localStorage.removeItem(n); } }
    }catch(e){}
  }
  function keyOk(k, type){
    if(!k) return false; var now = Date.now() / 1000;
    if(now < k.nbf - 60) return false;
    if(type === 'unlock') return (k.perms & 1) && now < k.expUnlock;
    return (k.perms & 2) && now < k.exp;
  }
  function withTimeout(p, ms){ return Promise.race([p, new Promise(function(_, rej){ setTimeout(function(){ rej(new Error('timeout')); }, ms); })]); }
  function fetchKey(r){
    var b = String(r.bookNo);
    if(fetching[b]) return fetching[b];
    if(typeof window.FB_CALL !== 'function') return Promise.reject(new Error('no FB_CALL'));
    fetching[b] = withTimeout(window.FB_CALL('issueBleKey', { bookNo: b }), 8000).then(function(k){
      if(k && k.token){ k.fetchedAt = Date.now(); saveKey(b, k); }
      return k;
    }).then(function(k){ delete fetching[b]; return k; }, function(e){ delete fetching[b]; throw e; });
    return fetching[b];
  }
  function getKey(r, type){
    var k = loadKey(r.bookNo);
    var fresh = k && Date.now() - (k.fetchedAt || 0) < 30*60000;
    if(keyOk(k, type) && fresh) return Promise.resolve(k);
    return fetchKey(r).then(function(nk){ return keyOk(nk, type) ? nk : null; }, function(){ return keyOk(k, type) ? k : null; });   // 통신이 안 되면 받아 둔 키로
  }

  /* ── 안내 창 — 앱에 원래 있는 아래에서 올라오는 창(modal-overlay · modal-box) 과 버튼(submit-btn · back-bottom-btn) 을 그대로 쓴다 ── */
  function sheet(){
    return new Promise(function(res){
      var old = document.getElementById('caro-ble-sheet'); if(old) old.remove();
      var w = document.createElement('div'); w.id = 'caro-ble-sheet'; w.className = 'modal-overlay'; w.style.zIndex = '9999';
      w.innerHTML =
        '<div class="modal-box" style="padding:0">' +
          '<div class="modal-header" style="padding:16px 20px 14px">' +
            '<span style="display:flex;align-items:center;gap:12px">' +
              '<span aria-hidden="true" style="flex:none;width:36px;height:36px;border-radius:11px;background:var(--accent,#18191c);display:inline-flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,.18)">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 7l11 10L12 22V2l5.5 5-11 10"/></svg>' +
              '</span>' +
              '<span style="display:flex;flex-direction:column;gap:2px;line-height:1.3">' +
                '<span style="font-family:var(--font);font-size:1.02rem;font-weight:700;color:var(--text-1)">블루투스 스마트키</span>' +
                '<span style="font-size:.8rem;color:var(--text-m)">지하 주차장에서도 문이 바로 열려요</span>' +
              '</span>' +
            '</span>' +
            '<button class="modal-close" type="button" data-x="1">✕</button>' +
          '</div>' +
          '<div class="modal-body" style="padding:14px 20px calc(20px + var(--sab,0px));white-space:nowrap;line-height:1.5;font-size:.88rem;color:var(--text-2)">' +
            '<div style="padding:6px 14px;border:1px solid var(--border);border-radius:var(--r);background:var(--silver-light)">' +
            '<div style="display:flex;align-items:center;gap:10px;height:28px">' + '<span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--accent,#18191c);display:inline-flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + '<span>통신이 안 되는 곳에서도 열고 잠가요</span></div>' +
            '<div style="display:flex;align-items:center;gap:10px;height:28px">' + '<span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--accent,#18191c);display:inline-flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + '<span><b style="color:var(--text-1)">‘근처 기기’ 권한</b>을 허용해 주세요</span></div>' +
            '<div style="display:flex;align-items:center;gap:10px;height:28px">' + '<span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--accent,#18191c);display:inline-flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + '<span>예약 차량에만, 이용 시간에만 쓰여요</span></div>' +
            '<div style="display:flex;align-items:center;gap:10px;height:28px">' + '<span aria-hidden="true" style="flex:none;width:18px;height:18px;border-radius:50%;background:var(--accent,#18191c);display:inline-flex;align-items:center;justify-content:center"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>' + '<span>위치는 저장하지 않아요</span></div>' +
            '</div>' +
            '<button class="submit-btn" type="button" data-ok="1" style="margin-top:16px">허용하기</button>' +
            '<button class="back-bottom-btn" type="button" data-x="1" style="margin-top:10px">나중에</button>' +
          '</div>' +
        '</div>';
      document.body.appendChild(w);
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ w.classList.add('open'); }); });
      var fin = false;
      function done(v){ if(fin) return; fin = true; w.classList.remove('open'); setTimeout(function(){ try{ w.remove(); }catch(e){} }, 350); res(v); }
      w.addEventListener('click', function(ev){
        var tg = ev.target;
        if(tg === w) return done(false);
        if(tg.closest && tg.closest('[data-ok]')) return done(true);
        if(tg.closest && tg.closest('[data-x]')) return done(false);
      });
    });
  }
  function waitFor(fn, ms){
    var until = Date.now() + ms;
    return new Promise(function(res){ (function loop(){ if(fn()) return res(true); if(Date.now() > until) return res(false); setTimeout(loop, 400); })(); });
  }
  /* 권한 · 블루투스 켜짐 준비. ask=true 면 안내 창부터 */
  function ready(ask){
    var s = st();
    if(!s.hw) return Promise.resolve(false);
    var p = Promise.resolve(true);
    if(!s.perm){
      if(!ask) return Promise.resolve(false);
      p = sheet().then(function(ok){
        try{ localStorage.setItem(ASK_KEY, String(Date.now())); }catch(e){}
        if(!ok) return false;
        B.requestPerm();
        return waitFor(function(){ return st().perm; }, 25000);
      });
    }
    return p.then(function(ok){
      if(!ok) return false;
      if(st().on) return true;
      B.requestEnable();
      return waitFor(function(){ return st().on; }, 20000);
    });
  }

  /* ── 문 열기 · 잠금 : 블루투스 먼저 → 안 되면 서버 ── */
  var NAME = { unlock: '문 열기', lock: '문 잠금' };
  var WHY = { 4: '아직 이용 시간이 아니에요', 5: '키 사용 시간이 지났어요', 6: '주행 전 사진을 먼저 찍어 주세요', 8: '차량 시계 확인 중', 10: '이 예약의 키가 회수됐어요', 9: '잠시 뒤 다시 시도해 주세요' };
  function report(r, type, key){
    try{ if(typeof window.FB_CALL === 'function') window.FB_CALL('reportBleUse', { bookNo: String(r.bookNo), action: type, keyId: key.keyId, atMs: Date.now() }).catch(function(){}); }catch(e){}
  }
  /* 결과 : true(블루투스로 실행됨) / false(서버로 넘김) */
  function tryBle(r, type, ui){
    if(!r || !(type === 'unlock' || type === 'lock')) return Promise.resolve(false);
    var asked = 0; try{ asked = Number(localStorage.getItem(ASK_KEY) || 0); }catch(e){}
    if(busyT[type] && Date.now() - busyT[type] < 8000) return Promise.resolve(false);
    busyT[type] = Date.now();
    return ready(Date.now() - asked > 10*60000).then(function(ok){
      if(!ok) return false;
      return getKey(r, type).then(function(key){
        if(!key) return false;
        ui('🔵 블루투스로 ' + NAME[type] + ' 중…', 'busy');
        return runBle(key, type === 'unlock' ? 1 : 2).then(function(res){
          if(res.result === 'ok'){ report(r, type, key); return true; }
          if(res.result === 'denied' && res.code === 6) try{ localStorage.removeItem(KEY_PFX + r.bookNo); }catch(e){}   // 사진 뒤 새 키를 받게
          if(res.result === 'denied' && WHY[res.code]) ui('🔵 ' + WHY[res.code] + ' — 통신으로 보낼게요', 'warn');
          else if(res.result === 'not_found') ui('🔵 근처에서 차를 못 찾았어요 — 통신으로 보낼게요', 'warn');
          else if(res.result === 'bt_off') ui('🔵 블루투스가 꺼져 있어요 — 통신으로 보낼게요', 'warn');
          return false;
        });
      });
    }).catch(function(){ return false; }).then(function(v){ busyT[type] = 0; return v; });
  }
  window.caroBleTry = tryBle;

  function ctrlToast(m){ try{ if(window.showCtrlToast) return showCtrlToast(m); if(window.showToast) return showToast(m); }catch(e){} }
  function hookCmd(){
    var f = window.sendDeviceCommand;
    if(typeof f !== 'function' || window.__caroBleCmd) return !!window.__caroBleCmd;
    window.__caroBleCmd = true;
    window.sendDeviceCommand = function(carId, type){
      var self = this, args = arguments;
      if(type !== 'unlock' && type !== 'lock') return f.apply(self, args);
      var r = resForCar(carId);
      return tryBle(r, type, function(m){ ctrlToast(m); }).then(function(done){
        if(done){ ctrlToast(type === 'unlock' ? '✅ 차량 문 열림 (블루투스)' : '✅ 차량 문 잠김 (블루투스)'); return true; }
        return f.apply(self, args);
      });
    };
    return true;
  }
  function hookLive(){
    var f = window.caroLiveAction;
    if(typeof f !== 'function' || window.__caroBleLive) return !!window.__caroBleLive;
    window.__caroBleLive = true;
    window.caroLiveAction = function(type, src){
      var self = this, args = arguments;
      if(type !== 'unlock' && type !== 'lock') return f.apply(self, args);
      var N = window.CaroLive, say = function(m, k){ try{ N && N.status && N.status(m, k || ''); }catch(e){} };
      var r = activeRes();
      tryBle(r, type, say).then(function(done){
        if(done){ var m = type === 'unlock' ? '문이 열렸어요 (블루투스)' : '문이 잠겼어요 (블루투스)'; say(m, 'ok'); ctrlToast('✅ ' + m); return; }
        f.apply(self, args);
      });
    };
    return true;
  }

  /* ── 이용 시간이 되면 : 권한 안내(처음 한 번) · 키 미리 받기 ── */
  function tick(){
    try{
      hookCmd(); hookLive();
      var r = activeRes(); if(!r) return;
      if(!window.FB_AUTH || !window.FB_AUTH.currentUser) return;
      var s = st();
      if(s.hw && !s.perm && !document.getElementById('caro-ble-sheet')){
        var asked = 0; try{ asked = Number(localStorage.getItem(ASK_KEY) || 0); }catch(e){}
        if(Date.now() - asked > 3*86400000) ready(true);       // 처음 · 사흘에 한 번만 먼저 묻는다 (버튼을 누를 때는 그때 묻는다)
      }
      var k = loadKey(r.bookNo);
      if(!k || Date.now() - (k.fetchedAt || 0) > 30*60000) fetchKey(r).catch(function(){});
    }catch(e){ console.warn('[caro-ble]', e); }
  }
  cleanKeys();
  setTimeout(tick, 3000);
  setInterval(tick, 60000);
  var hn = 0, hiv = setInterval(function(){ var a = hookCmd(), b = hookLive(); if((a && b) || ++hn > 120) clearInterval(hiv); }, 500);
  console.log('✅ 블루투스 스마트키 (caro-ble v1)');
})();
