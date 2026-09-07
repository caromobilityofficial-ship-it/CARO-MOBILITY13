/* ═══════════════════════════════════════════════════════════════
   caro-secure.js — 서버 모드 클라이언트 (2026-09, v100)
   ───────────────────────────────────────────────────────────────
   CARO_CONFIG.SECURE_SERVER 가 true 일 때, 돈·안전이 걸린 동작을
   브라우저가 직접 처리하지 않고 Cloud Functions 가 검증하도록 바꾼다.

     · 예약 결제  : createOrder → 토스 결제창 → confirmPayment(서버 승인·이중예약 검사·예약 생성)
     · 연장       : createOrder(extend) → 토스 → confirmPayment(서버가 종료시각 연장)
     · 취소       : cancelReservation(서버가 환불률 계산·토스 환불)
     · 차량 명령  : issueCommand(서버가 '내 유효 예약'인지 확인 후 명령 생성)
     · 반납       : completeReturn(서버가 거점 반경·잠금·초과요금 판정)
     · 차량 가용  : reservations 전체 대신 개인정보 없는 availability 컬렉션 구독
     · 상담봇 AI  : askBot (키는 서버 Secret)

   false 일 때는 아무것도 바꾸지 않고 화면 상단에 '테스트 모드' 띠만 표시한다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var CFG = window.CARO_CONFIG || {};
  var SECURE = !!CFG.SECURE_SERVER;
  var toast = function(m){ try{ if(typeof window.showToast==='function') return window.showToast(m); }catch(e){} try{ alert(m); }catch(e){} };
  var log = function(){ try{ console.log.apply(console, ['[caro-secure]'].concat([].slice.call(arguments))); }catch(e){} };

  /* ───────────────────────── 공통: 함수 호출 ───────────────────────── */
  function waitFor(pred, ms, step){
    ms = ms || 10000; step = step || 150;
    return new Promise(function(res, rej){
      var t0 = Date.now();
      (function tick(){
        try{ var v = pred(); if(v){ res(v); return; } }catch(e){}
        if(Date.now() - t0 > ms){ rej(new Error('timeout')); return; }
        setTimeout(tick, step);
      })();
    });
  }
  function callFn(){ return (typeof window.FB_CALL === 'function') ? window.FB_CALL : (typeof window.caroCallFn === 'function' ? window.caroCallFn : null); }
  function call(name, data){
    return waitFor(function(){ return callFn(); }, 12000)
      .catch(function(){ throw Object.assign(new Error('서버 연결 모듈이 준비되지 않았습니다.'), { code: 'functions/unavailable' }); })
      .then(function(f){ return f(name, data || {}); });
  }
  function errMsg(e, fallback){
    var c = (e && e.code) || '';
    if(/not-found/.test(c) && /function/i.test(c + (e && e.message || ''))) return '서버 기능이 아직 배포되지 않았습니다. (firebase deploy --only functions)';
    if(/unauthenticated/.test(c)) return '로그인이 필요합니다.';
    if(/permission-denied/.test(c)) return '권한이 없습니다.';
    if(/already-exists/.test(c)) return (e.message || '이미 예약된 시간입니다.');
    if(/failed-precondition|invalid-argument|out-of-range/.test(c)) return (e.message || fallback);
    if(/resource-exhausted/.test(c)) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
    if(/unavailable|deadline/.test(c)) return '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.';
    return (e && e.message) ? e.message : fallback;
  }
  function tossKey(){ return CFG.TOSS_CLIENT_KEY || 'test_ck_6bJXmgo28eByJonkYwBE3LAnGKWx'; }
  function baseUrl(){ return location.href.split('?')[0].split('#')[0]; }
  function requestToss(orderId, amount, orderName, kind){
    if(typeof TossPayments !== 'function'){ toast('토스페이먼츠를 불러오지 못했습니다. 네트워크를 확인해 주세요.'); return Promise.resolve(false); }
    var ok = { reservation:'success', extend:'ext_success', settlement:'ret_success' }[kind] || 'success';
    var ng = { reservation:'fail', extend:'ext_fail', settlement:'ret_fail' }[kind] || 'fail';
    try{
      return TossPayments(tossKey()).requestPayment('카드', {
        amount: amount, orderId: orderId, orderName: orderName,
        customerName: (window.userInfo && (userInfo.name || userInfo.id)) || '고객',
        successUrl: baseUrl() + '?payment=' + ok,
        failUrl: baseUrl() + '?payment=' + ng
      }).then(function(){ return true; }).catch(function(err){
        if(!err || err.code !== 'USER_CANCEL') toast('결제 오류: ' + ((err && err.message) || ''));
        return false;
      });
    }catch(e){ toast('토스페이먼츠 호출 오류'); return Promise.resolve(false); }
  }
  function myActiveReservations(){
    var list = window.myReservations || [];
    return list.filter(function(r){ return r && !r.returned && r.status !== 'cancelled'; });
  }
  function currentCtrlRes(){
    try{ if(typeof window.ctrlResIdx === 'number' && ctrlResIdx >= 0 && window.myReservations && myReservations[ctrlResIdx]) return myReservations[ctrlResIdx]; }catch(e){}
    var now = Date.now();
    var act = myActiveReservations().filter(function(r){ var s = +new Date(r.start), e = +new Date(r.end); return s - 10*60000 <= now && now <= e + 30*60000; });
    return act[0] || myActiveReservations()[0] || null;
  }
  function getPosition(){
    return new Promise(function(res, rej){
      if(!navigator.geolocation){ rej(new Error('nogeo')); return; }
      navigator.geolocation.getCurrentPosition(function(p){ res({ lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy }); },
        function(e){ rej(e); }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 15000 });
    });
  }

  /* ───────────────────────── 테스트 모드 띠 ───────────────────────── */
  if(!SECURE){
    log('SECURE_SERVER=false — 테스트 모드(보안 미적용). caro-config.js 에서 켤 수 있음');
    try{
      var showBar = function(){
        if(document.getElementById('caro-testmode-bar')) return;
        /* 6초간 띠로 안내 → 이후 우상단 작은 'TEST' 칩으로 축소 (화면 가림 최소화, 탭하면 다시 설명) */
        var b = document.createElement('div'); b.id = 'caro-testmode-bar';
        var full = 'position:fixed;left:0;right:0;top:0;z-index:2147483000;background:#F2C14E;color:#1a1a1a;font:700 11px/1.3 system-ui,sans-serif;padding:calc(var(--sat,0px) + 4px) 34px 4px 10px;text-align:center;box-shadow:0 1px 4px rgba(0,0,0,.25);transition:opacity .25s;';
        var chip = 'position:fixed;right:8px;top:calc(var(--sat,0px) + 6px);z-index:2147483000;background:#F2C14E;color:#1a1a1a;font:800 10px/1 system-ui,sans-serif;padding:5px 8px;border-radius:99px;box-shadow:0 1px 4px rgba(0,0,0,.25);letter-spacing:.06em;';
        var expanded = true;
        function render(){
          if(expanded){
            b.style.cssText = full;
            b.innerHTML = '⚠ 테스트 모드 — 결제·인증·차량제어 보안이 적용되지 않은 상태입니다 (실사용 금지)'
              + '<button aria-label="닫기" style="position:absolute;right:6px;top:calc(var(--sat,0px) + 1px);border:0;background:transparent;font-size:16px;line-height:1;cursor:pointer;color:#1a1a1a">×</button>';
            b.querySelector('button').onclick = function(ev){ ev.stopPropagation(); b.remove(); try{ sessionStorage.setItem('caro_testbar_off','1'); }catch(e){} };
          } else {
            b.style.cssText = chip; b.textContent = 'TEST';
          }
        }
        b.addEventListener('click', function(){ if(!expanded){ expanded = true; render(); setTimeout(function(){ expanded = false; render(); }, 5000); } });
        render();
        setTimeout(function(){ if(document.body.contains(b)){ expanded = false; render(); } }, 6000);
        document.body.appendChild(b);
      };
      var off = false; try{ off = sessionStorage.getItem('caro_testbar_off') === '1'; }catch(e){}
      if(!off){ if(document.body) showBar(); else document.addEventListener('DOMContentLoaded', showBar); }
    }catch(e){}
    return;   /* 테스트 모드에서는 여기서 끝 — 기존 동작 유지 */
  }

  log('SECURE_SERVER=true — 서버 모드 활성');

  /* ─────────────── ① 결제 복귀 URL 선점 (기존 핸들러보다 먼저 실행됨) ─────────────── */
  var pending = null;
  try{
    var q = new URLSearchParams(location.search);
    var pay = q.get('payment');
    if(pay){
      pending = { kind: pay, paymentKey: q.get('paymentKey') || '', orderId: q.get('orderId') || '', amount: Number(q.get('amount') || 0), code: q.get('code') || '', message: q.get('message') || '' };
      try{ history.replaceState(null, '', location.pathname); }catch(e){}
      try{ localStorage.removeItem('caro_pay_data'); localStorage.removeItem('caro_ext_pending'); localStorage.removeItem('caro_ret_pending'); }catch(e){}
      window.__caroSecurePay = pending;
    }
  }catch(e){}

  function afterAppReady(){
    return waitFor(function(){ return window.FB_AUTH && window.FB_AUTH.currentUser && callFn(); }, 20000);
  }
  function processPending(){
    if(!pending) return;
    var p = pending; pending = null;
    if(/fail$/.test(p.kind)){ toast(p.message ? ('결제가 완료되지 않았습니다: ' + p.message) : '결제가 취소되었습니다.'); return; }
    if(!p.orderId){ toast('결제 정보를 확인할 수 없습니다.'); return; }
    toast('결제를 확인하고 있습니다…');
    afterAppReady().then(function(){
      return call('confirmPayment', { paymentKey: p.paymentKey, orderId: p.orderId, amount: p.amount });
    }).then(function(r){
      var t = (r && r.type) || 'reservation';
      if(t === 'reservation'){ toast('✅ 결제가 완료되어 예약이 확정되었습니다.'); try{ if(window.goTo) setTimeout(function(){ goTo('my-reservation-screen'); }, 600); }catch(e){} }
      else if(t === 'extend'){ toast('✅ 결제 완료 — 이용 시간이 ' + (r.mins || '') + '분 연장되었습니다.'); }
      else if(t === 'settlement'){ toast('✅ 정산 결제 완료 — 반납이 처리되었습니다. 이용해 주셔서 감사합니다 🚗'); }
      else toast('✅ 결제가 완료되었습니다.');
    }).catch(function(e){
      console.error('[caro-secure] confirmPayment', e);
      var c = (e && e.code) || '';
      if(/already-exists/.test(c)) toast('⚠️ 결제 직전에 다른 고객이 같은 시간을 예약해 자동 환불 처리되었습니다. 다른 시간을 선택해 주세요.');
      else if(/timeout/.test(e && e.message || '')) toast('로그인 확인이 늦어져 결제 확인을 완료하지 못했습니다. 앱을 다시 열면 자동으로 확인합니다.');
      else toast('결제 확인 실패: ' + errMsg(e, '잠시 후 다시 시도해 주세요.'));
    });
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(processPending, 300); });
  else setTimeout(processPending, 300);

  /* ─────────────── ② 예약 결제: 서버 주문 → 토스 ─────────────── */
  var busy = false;
  function securePayment(){
    if(busy) return; busy = true;
    var pd = window._payData || {};
    var car = pd.car || window.selectedCar, ins = pd.ins || window.selectedIns;
    var s = pd.start instanceof Date ? pd.start : (pd.start ? new Date(pd.start) : null);
    var e = pd.end instanceof Date ? pd.end : (pd.end ? new Date(pd.end) : null);
    if(!car || !s || !e || isNaN(s) || isNaN(e)){ busy = false; toast('예약 정보가 올바르지 않습니다. 다시 시도해 주세요.'); return; }
    toast('주문을 생성하고 있습니다…');
    call('createOrder', {
      type: 'reservation',
      carId: String(car.id), col: car.isBlackLabel ? 'bl_cars' : 'cars',
      start: s.toISOString(), end: e.toISOString(),
      insId: (ins && ins.id) || 'premium',
      coupon: (window.couponDiscount > 0) ? 'CARO30' : '',
      points: Number(window.pointDiscount || 0)
    }).then(function(r){
      if(!r || !r.orderId) throw new Error('주문 생성 실패');
      if(r.amount !== pd.total){ log('금액 재계산: 화면', pd.total, '→ 서버', r.amount); }
      if(r.amount <= 0){
        return call('confirmPayment', { orderId: r.orderId, amount: 0 }).then(function(){ toast('✅ 예약이 확정되었습니다.'); try{ goTo('my-reservation-screen'); }catch(x){} });
      }
      var name = (window.getCarName ? getCarName(car) : (car.name || '차량')) + ' 대여';
      return requestToss(r.orderId, r.amount, name, 'reservation');
    }).catch(function(e){ console.error('[caro-secure] createOrder', e); toast('예약을 진행할 수 없습니다: ' + errMsg(e, '잠시 후 다시 시도해 주세요.')); })
      .then(function(){ busy = false; });
  }
  window.handlePayment = securePayment;
  window.__caroSecurePayment = securePayment;

  /* ─────────────── ③ 연장: 서버 주문 → 토스 ─────────────── */
  function secureExtend(){
    var mins = window.selectedExtendMins || 0;
    var selEl = document.querySelector('.extend-option.selected');
    if(!mins && selEl) mins = +selEl.getAttribute('data-mins') || 0;
    if(!mins){ toast('연장 시간을 선택해 주세요.'); return; }
    var r = currentCtrlRes(); if(!r){ toast('연장할 예약을 찾을 수 없습니다.'); return; }
    if(busy) return; busy = true;
    call('createOrder', { type: 'extend', bookNo: r.bookNo, mins: mins }).then(function(o){
      if(o.amount <= 0) return call('confirmPayment', { orderId: o.orderId, amount: 0 }).then(function(){ toast('✅ ' + mins + '분 연장되었습니다.'); });
      var name = ((r.car && (window.getCarName ? getCarName(r.car) : r.car.name)) || '차량') + ' ' + mins + '분 연장';
      return requestToss(o.orderId, o.amount, name, 'extend');
    }).catch(function(e){ toast('연장할 수 없습니다: ' + errMsg(e, '잠시 후 다시 시도해 주세요.')); })
      .then(function(){ busy = false; try{ if(window.closeExtendSheet) closeExtendSheet(); }catch(x){} });
  }
  function hookExtend(){
    if(typeof window.confirmExtendSheet !== 'function' || window.confirmExtendSheet.__caroSecure) return false;
    window.confirmExtendSheet = secureExtend; window.confirmExtendSheet.__caroSecure = true; return true;
  }
  if(!hookExtend()){ var hx = 0, hiv = setInterval(function(){ if(hookExtend() || ++hx > 50) clearInterval(hiv); }, 200); }

  /* ─────────────── ④ 취소: 서버 환불 ─────────────── */
  function secureCancel(){
    var idx = (typeof window.cancelTargetIdx === 'number') ? cancelTargetIdx : -1;
    var r = (window.myReservations || [])[idx]; if(!r){ toast('취소할 예약을 찾을 수 없습니다.'); return; }
    if(busy) return; busy = true;
    toast('취소를 처리하고 있습니다…');
    call('cancelReservation', { bookNo: r.bookNo }).then(function(res){
      try{ window.cancelTargetIdx = -1; if(window.closeModal) closeModal('cancel-confirm-modal'); }catch(e){}
      var pct = res && res.refundPct || 0, amt = res && res.refundAmt || 0;
      if(pct > 0 && res && res.manualRefund) toast('예약이 취소되었습니다. 환불 ' + amt.toLocaleString() + '원(' + pct + '%)은 운영팀 확인 후 처리됩니다.');
      else toast(pct > 0 ? ('예약이 취소되었습니다. ' + amt.toLocaleString() + '원(' + pct + '%)이 환불됩니다.') : '예약이 취소되었습니다. (환불 대상 아님)');
    }).catch(function(e){ toast('취소할 수 없습니다: ' + errMsg(e, '잠시 후 다시 시도해 주세요.')); })
      .then(function(){ busy = false; });
  }
  window.doConfirmCancel = secureCancel;

  /* ─────────────── ⑤ 차량 명령: 서버 발급 ─────────────── */
  var _ctrlToast = function(m){ try{ if(typeof window.showCtrlToast === 'function') return window.showCtrlToast(m); }catch(e){} toast(m); };
  function secureCommand(carId, cmdType){
    var r = null;
    (window.myReservations || []).some(function(x){ if(x && x.car && String(x.car.id) === String(carId) && !x.returned && x.status !== 'cancelled'){ r = x; return true; } return false; });
    if(!r) r = currentCtrlRes();
    if(!r){ _ctrlToast('⚠️ 이 차량의 유효한 예약이 없습니다'); return Promise.resolve(false); }
    return call('issueCommand', { bookNo: r.bookNo, type: cmdType }).then(function(res){
      if(!res || !res.cmdId) return false;
      _ctrlToast('📡 명령 전송 (' + (cmdType === 'unlock' ? '문 열기' : cmdType === 'lock' ? '문 잠금' : cmdType) + ')');
      return new Promise(function(resolve){
        try{
          var fn = window.FB_FN, db = window.FB_DB;
          var ref = fn.doc(db, 'devices', res.deviceId, 'commands', res.cmdId);
          var done = false, unsub = null;
          var to = setTimeout(function(){ if(done) return; done = true; try{ unsub && unsub(); }catch(e){} _ctrlToast('⏱ 디바이스 응답 없음'); resolve(false); }, 30000);
          unsub = fn.onSnapshot(ref, function(snap){
            var d = snap && snap.data && snap.data(); if(!d) return;
            if(d.status === 'acked') _ctrlToast('📡 디바이스 응답 받음');
            if(d.status === 'done' || d.status === 'failed'){
              if(done) return; done = true; clearTimeout(to); try{ unsub && unsub(); }catch(e){}
              _ctrlToast(d.status === 'done' ? (cmdType === 'unlock' ? '✅ 차량 문 열림' : '✅ 차량 문 잠김') : '❌ 명령 실패: ' + (d.error || ''));
              resolve(d.status === 'done');
            }
          }, function(){ if(done) return; done = true; clearTimeout(to); resolve(true); });
        }catch(e){ resolve(true); }
      });
    }).catch(function(e){ _ctrlToast('⚠️ ' + errMsg(e, '명령을 보낼 수 없습니다')); return false; });
  }
  window.sendDeviceCommand = secureCommand;

  /* ─────────────── ⑥ 반납: 서버 검증 ─────────────── */
  var origReturn = window.doReturnCar;
  var returning = false;
  function secureReturn(){
    if(returning) return; returning = true;
    var r = currentCtrlRes();
    if(!r){ returning = false; toast('반납할 예약을 찾을 수 없습니다.'); return; }
    toast('반납 위치를 확인하고 있습니다…');
    getPosition().then(function(pos){
      return call('completeReturn', { bookNo: r.bookNo, lat: pos.lat, lng: pos.lng, accuracy: pos.accuracy });
    }).then(function(res){
      if(!res || !res.returned){ toast('반납 처리 결과를 확인할 수 없습니다. 고객센터로 문의해 주세요.'); return; }
      /* 서버가 반납을 확정(잠금 명령 포함). 로컬 화면 정리는 기존 함수로 */
      try{ if(typeof origReturn === 'function') origReturn(); }catch(e){}
      if(res.amount > 0 && res.orderId){
        var why = (res.breakdown || []).map(function(b){ return b.label + ' ' + Number(b.amount).toLocaleString() + '원'; }).join(', ');
        toast('✅ ' + (res.stationName || '거점') + ' 반납 완료. 추가 요금 ' + Number(res.amount).toLocaleString() + '원' + (why ? ' (' + why + ')' : '') + ' — 결제 화면으로 이동합니다.');
        return new Promise(function(r2){ setTimeout(r2, 1200); }).then(function(){ return requestToss(res.orderId, res.amount, '차량 반납 정산', 'settlement'); });
      }
      toast('✅ ' + (res.stationName || '거점') + ' 반납 완료. 이용해 주셔서 감사합니다 🚗');
    }).catch(function(e){
      var m = (e && e.code === 1) ? '위치 권한이 꺼져 있어 반납 위치를 확인할 수 없습니다. 설정에서 위치 권한을 허용해 주세요.'
            : (e && (e.code === 2 || e.code === 3 || e.message === 'nogeo')) ? '현재 위치를 확인할 수 없습니다. 실외에서 잠시 후 다시 시도해 주세요.'
            : errMsg(e, '반납을 처리할 수 없습니다.');
      toast('⚠️ ' + m);
    }).then(function(){ returning = false; });
  }
  window.doReturnCar = secureReturn;

  /* ─────────────── ⑦ 차량 가용: availability 구독 (개인정보 없음) ─────────────── */
  var _availUnsub = null;
  function subscribeAvailability(){
    waitFor(function(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot === 'function' && window.FB_AUTH; }, 20000).then(function(){
      var fn = window.FB_FN, db = window.FB_DB;
      function start(){
        if(_availUnsub){ try{ _availUnsub(); }catch(e){} _availUnsub = null; }
        if(!window.FB_AUTH.currentUser) return;                    /* 규칙상 로그인 후에만 읽기 가능 */
        _availUnsub = fn.onSnapshot(fn.collection(db, 'availability'), function(snap){
          var arr = [];
          snap.forEach(function(doc){
            var d = doc.data() || {}; if(!d.start || !d.end) return;
            arr.push({ bookNo: d.bookNo || doc.id, userId: '', car: { id: d.carId }, start: new Date(d.start), end: new Date(d.end), returned: false, returnedAt: null, hrs: 0, total: 0, ins: null });
          });
          window.globalActiveReservations = arr;
          try{ if(window.renderCars) renderCars(); if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
        }, function(err){ console.warn('[caro-secure] availability 구독 실패', err && err.code); });
      }
      start();
      try{ if(typeof fn.onAuthStateChanged === 'function') fn.onAuthStateChanged(window.FB_AUTH, function(){ start(); }); }catch(e){}
    }).catch(function(){});
  }
  subscribeAvailability();

  /* ─────────────── ⑧ 상담봇 AI (서버 경유) ─────────────── */
  window.caroAskBot = function(question){
    return call('askBot', { question: String(question || '').slice(0, 1000) }).then(function(r){ return (r && r.answer) || ''; });
  };

  /* ─────────────── ⑨ 정산/기타 주문 생성 헬퍼 (customer-redesign 의 정산 결제가 사용) ─────────────── */
  window.caroCreateOrder = function(data){ return call('createOrder', data); };
  window.caroRequestToss = requestToss;
})();
