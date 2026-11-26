/* ═══════════════════════════════════════════════════════════════
   caro-live.js — ★v1 잠금화면 실시간 카드 (안드로이드 앱 3.4.0 이상)
   ───────────────────────────────────────────────────────────────
   무엇: 이용 중인 예약을 휴대폰 잠금화면·알림창에 카드로 띄운다.
         차량번호 · 차 이름 · 상태 · [⛽ 연료 칸] · [⏱ 남은 시간 칸] · 🔓 열기 / 🔒 잠금 / ⚠️ 비상등 / 📢 경적.
   언제: ★ 고객이 주행 전 외관 사진 [촬영 완료] 를 누르거나, 차량 버튼(문열기·잠금·비상등·경적)을 처음 누른 순간부터 뜬다 (예약만 해서는 안 뜸).
         다른 폰에서 이미 문을 열었던 예약(firstUnlockAt)도 뜬다. 반납하거나 반납 30분이 지나면 사라진다.
   방법: 10초마다 내 예약을 보고 앱(window.CaroLive.update)에 넘긴다. 연료는 90초마다 서버(myDeviceStatus)에 묻는다.
         카드 버튼을 누르면 앱이 window.caroLiveAction(type) 을 부르고, 여기서 서버(issueCommand)로 명령을 보낸다.
         → 예약 본인 · 이용 시간 · 주행 전 사진 · 이용 정지 확인은 서버가 앱 화면 버튼과 똑같이 한다.
   제외: 웹 브라우저 · 아이폰 · 예전 앱(3.3.x)에서는 아무것도 하지 않는다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroLive) return; window.__caroLive = true;
  var N = window.CaroLive;
  if(!N || typeof N.update !== 'function') return;          // 앱이 아니거나 카드 기능이 없는 예전 앱

  var SHOW_BEFORE = 30*60000, SHOW_AFTER = 30*60000;         // 시작 30분 전 ~ 반납 30분 뒤까지 보인다
  var lastSig = '', shown = true, fuelAt = 0, fuel = {}, busy = {};   /* shown 을 true 로 시작 : 지난번에 남은 카드가 있으면 첫 확인 때 지운다 */
  var KEY = 'caro_live_armed';

  /* ── '처음 버튼 조작' 기록 : 예약번호 → 누른 시각 (이 휴대폰에만 저장, 3일 지난 것은 지움) ── */
  function armedMap(){ try{ return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; }catch(e){ return {}; } }
  function arm(bookNo){
    if(!bookNo) return;
    try{
      var m = armedMap(), now = Date.now(), k = String(bookNo);
      Object.keys(m).forEach(function(x){ if(now - Number(m[x]) > 3*86400000) delete m[x]; });
      if(!m[k]){ m[k] = now; localStorage.setItem(KEY, JSON.stringify(m)); }
    }catch(e){}
  }
  function isArmed(r){ if(!r) return false; if(r.firstUnlockAt) return true; return !!armedMap()[String(r.bookNo)]; }
  function resForCar(carId){
    var found = null;
    (window.myReservations || []).some(function(x){ if(x && x.car && String(x.car.id) === String(carId) && !x.returned && !x.cancelled && x.status !== 'cancelled'){ found = x; return true; } return false; });
    return found || pick();
  }
  /* 앱 화면의 차량 버튼(ctrlActionHome → sendDeviceCommand)을 감싸서 '처음 누름' 을 기록한다. 원래 동작은 그대로 */
  function hook(){
    var f = window.sendDeviceCommand;
    if(typeof f !== 'function' || f.__caroLive) return;
    var w = function(carId, type){
      try{ var r = resForCar(carId); if(r && /^(unlock|lock|horn|hazard|find)$/.test(String(type))){ arm(r.bookNo); try{ if(typeof N.armed === 'function') N.armed(); }catch(x){} lastSig = ''; setTimeout(push, 300); } }catch(e){}   /* 지웠던 카드도 다시 보이게 */
      return f.apply(this, arguments);
    };
    w.__caroLive = true;
    window.sendDeviceCommand = w;
  }
  /* ★v2 주행 전 외관 사진 [촬영 완료] 를 누르면 그때부터 카드가 뜬다 (플립·폴드 바깥 화면 '나우 바' 에도) */
  function hookPhoto(){
    var f = window.finishPhotoCapture;
    if(typeof f !== 'function' || f.__caroLive) return;
    var w = function(){
      var out = f.apply(this, arguments);
      try{ var r = pick(); if(r){ arm(r.bookNo); try{ if(typeof N.armed === 'function') N.armed(); }catch(x){} lastSig = ''; setTimeout(push, 300); } }catch(e){}
      return out;
    };
    w.__caroLive = true;
    window.finishPhotoCapture = w;
  }

  function t(x){ if(!x) return NaN; var v = (x instanceof Date) ? x.getTime() : (x && typeof x.toDate === 'function') ? x.toDate().getTime() : new Date(x).getTime(); return v; }
  function p2(n){ return n < 10 ? '0' + n : '' + n; }
  function hm(ms){ var d = new Date(ms); return p2(d.getHours()) + ':' + p2(d.getMinutes()); }

  function pick(){
    var rs = window.myReservations || [], now = Date.now(), best = null, bestS = 0, bestOn = false;
    rs.forEach(function(r){
      if(!r || r.returned || r.cancelled || r.status === 'cancelled' || !r.start || !r.end) return;
      var s = t(r.start), e = t(r.end); if(isNaN(s) || isNaN(e)) return;
      if(now < s - SHOW_BEFORE || now > e + SHOW_AFTER) return;
      var on = now >= s - 10*60000 && now <= e + SHOW_AFTER;
      if(!best || (on && !bestOn) || (on === bestOn && s < bestS)){ best = r; bestS = s; bestOn = on; }
    });
    return best;
  }
  function carOf(r){
    var c = r.car || {}, id = c.id != null ? c.id : r.carId;
    if(!(c.carNumber || c.plate || c.number) && window.CARS_DATA && id != null){
      (window.CARS_DATA || []).some(function(x){ if(x && String(x.id) === String(id)){ c = Object.assign({}, x, c); return true; } return false; });
    }
    return { id: id, plate: c.carNumber || c.plate || c.number || '', name: (window.getCarName ? (function(){ try{ return getCarName(c); }catch(e){ return c.name; } })() : c.name) || '카로 차량', fuelType: c.fuelType || c.fuel || '' };
  }
  function fuelPct(car){
    var v = null;
    if(fuel[car.id] != null) v = fuel[car.id];
    else if(window.fuelRealLevels && window.fuelRealLevels[car.id] != null) v = window.fuelRealLevels[car.id];
    return (v == null || !isFinite(v)) ? null : Math.round(v);
  }
  function fuelName(car){
    var ft = String(car.fuelType || '');
    return /전기|EV|electric/i.test(ft) ? '배터리' : /경유|디젤|diesel/i.test(ft) ? '경유' : /LPG/i.test(ft) ? 'LPG' : /휘발유|가솔린|gasoline/i.test(ft) ? '휘발유' : '연료';
  }
  function fuelOf(car){
    var v = fuelPct(car);
    return v == null ? '' : fuelName(car) + ' ' + v + '%';
  }
  function baseStatus(r){
    var now = Date.now(), s = t(r.start), e = t(r.end);
    if(now < s - 10*60000) return { text: '이용 예정 · 10분 전부터 문열기', kind: '' };
    if(now < s) return { text: '곧 시작 · 지금 문을 열 수 있어요', kind: 'ok' };
    if(now <= e) return { text: (e - now < 15*60000) ? '반납 15분 전 · 거점으로 이동해 주세요' : '이용 중', kind: (e - now < 15*60000) ? 'warn' : '' };   /* 남은 시간은 카드의 '남은 시간' 칸이 보여 준다 */
    return { text: '반납 시간이 지났어요 · 반납해 주세요', kind: 'warn' };
  }

  function pollFuel(r){
    if(Date.now() - fuelAt < 90000 || typeof window.FB_CALL !== 'function') return;
    var now = Date.now(); if(now < t(r.start) - 60*60000) return;
    fuelAt = now;
    window.FB_CALL('myDeviceStatus', { bookNo: r.bookNo }).then(function(d){
      var c = carOf(r);
      if(d && d.found && d.fuel != null && isFinite(d.fuel)){ fuel[c.id] = Math.max(0, Math.min(100, Math.round(d.fuel))); push(); }
    }).catch(function(){});
  }

  function push(){
    try{
      hook(); hookPhoto();
      var r = pick();
      if(r && !isArmed(r)) r = null;                       /* 아직 버튼을 한 번도 안 눌렀으면 띄우지 않는다 */
      if(!r){ if(shown){ try{ N.stop(); }catch(e){} shown = false; lastSig = ''; } return; }
      var c = carOf(r), st = baseStatus(r);
      var fp = fuelPct(c);
      var data = { fuelName: fuelName(c), bookNo: String(r.bookNo || ''), plate: c.plate, name: c.name, fuel: fuelOf(c), fuelPct: fp == null ? -1 : fp, start: t(r.start), end: t(r.end), status: st.text, kind: st.kind };
      var sig = JSON.stringify(data);
      if(sig !== lastSig){ N.update(sig); lastSig = sig; shown = true; }
      pollFuel(r);
    }catch(e){ console.warn('[caro-live]', e); }
  }

  function say(text, kind){ try{ N.status(text, kind || ''); }catch(e){} }
  function toast(m){ try{ if(window.showCtrlToast) showCtrlToast(m); else if(window.showToast) showToast(m); }catch(e){} }
  function errText(e){
    var m = (e && (e.message || e.code)) || '';
    m = String(m).replace(/^FirebaseError:\s*/, '').replace(/^functions\//, '');
    if(/unauthenticated/i.test(m)) return '로그인이 필요해요 — 앱을 열어 로그인해 주세요';
    if(/internal|unavailable|deadline/i.test(m) || !m) return '서버에 연결하지 못했어요 — 잠시 후 다시 눌러 주세요';
    return m;
  }
  var DONE = { unlock: '문이 열렸어요', lock: '문이 잠겼어요', horn: '경적이 울렸어요', hazard: '비상등이 켜졌어요' };
  var GOING = { unlock: '문 여는 중…', lock: '문 잠그는 중…', horn: '경적 울리는 중…', hazard: '비상등 켜는 중…' };

  /* 카드 버튼 → 서버 명령. src : 'card'(잠금화면에서 바로) · 'open'(앱이 열리면서) */
  function waitReady(ms){
    var until = Date.now() + ms;
    return new Promise(function(res, rej){
      (function loop(){
        var ok = typeof window.FB_CALL === 'function' && window.FB_AUTH && window.FB_AUTH.currentUser && pick();
        if(ok) return res(pick());
        if(Date.now() > until) return rej(new Error(window.FB_AUTH && !window.FB_AUTH.currentUser ? '로그인이 필요해요 — 앱을 열어 로그인해 주세요' : '이용 중인 예약을 찾지 못했어요'));
        setTimeout(loop, 400);
      })();
    });
  }
  window.caroLiveAction = function(type, src){
    if(!/^(unlock|lock|horn|hazard)$/.test(String(type))) return;
    if(busy[type] && Date.now() - busy[type] < 8000) return;   // 연타 방지
    try{ var pr = pick(); if(pr) arm(pr.bookNo); }catch(e){}
    busy[type] = Date.now();
    say(GOING[type], 'busy');
    waitReady(25000).then(function(r){
      return window.FB_CALL('issueCommand', { bookNo: r.bookNo, type: type });
    }).then(function(res){
      if(!res || !res.cmdId){ say('명령을 보내지 못했어요 — 다시 눌러 주세요', 'fail'); return; }
      toast('📡 ' + GOING[type]);
      var fn = window.FB_FN, db = window.FB_DB, done = false, unsub = null;
      var to = setTimeout(function(){ if(done) return; done = true; try{ unsub && unsub(); }catch(e){} say('차량 응답이 늦어요 — 잠시 후 확인해 주세요', 'warn'); }, 100000);
      try{
        unsub = fn.onSnapshot(fn.doc(db, 'devices', res.deviceId, 'commands', res.cmdId), function(snap){
          var d = snap && snap.data && snap.data(); if(!d || done) return;
          if(d.status === 'acked') say('차량이 명령을 받았어요…', 'busy');
          if(d.status === 'done'){ done = true; clearTimeout(to); try{ unsub(); }catch(e){} say(DONE[type], 'ok'); toast('✅ ' + DONE[type]); }
          if(d.status === 'failed'){ done = true; clearTimeout(to); try{ unsub(); }catch(e){} say('실패 : ' + (d.error || '차량이 실행하지 못했어요'), 'fail'); }
        }, function(){ if(done) return; done = true; clearTimeout(to); say('명령을 보냈어요', 'ok'); });
      }catch(e){ say('명령을 보냈어요', 'ok'); }
    }).catch(function(e){
      var m = errText(e);
      say(m, 'fail'); toast('⚠️ ' + m);
      /* 주행 전 사진이 없어서 문이 안 열리면, 앱이 열린 경우 사진 화면으로 안내 */
      if(type === 'unlock' && /사진/.test(m) && src === 'open'){
        setTimeout(function(){ try{ if(window.toggleCtrlPhoto) toggleCtrlPhoto(); else if(window.openPhotoModal) openPhotoModal(); }catch(x){} }, 900);
      }
    }).then(function(){ busy[type] = 0; push(); });
  };

  if(window.__caroLivePending){ var pt = window.__caroLivePending; window.__caroLivePending = null; window.caroLiveAction(pt, 'open'); }
  hook(); hookPhoto(); var hookTries = 0, hookT = setInterval(function(){ hook(); hookPhoto(); if(++hookTries > 30) clearInterval(hookT); }, 2000);   /* caro-secure 가 나중에 바꿔 끼워도 다시 감싼다 */
  setInterval(push, 10000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) push(); });
  setTimeout(push, 3000);
  console.log('✅ 잠금화면 실시간 카드 (caro-live v2)');
})();
