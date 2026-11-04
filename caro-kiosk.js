/* ═══════════════════════════════════════════════════════════════
   caro-kiosk.js — 관제 프로그램 전체화면 · 로그아웃으로만 종료 (v108.5, 2026-11-04)
   ─ 로그인하면 전체화면으로 바뀐다(Esc 한 번으로 빠져나가지 못하게 Esc 는 길게 눌러야 해제)
   ─ 로그인한 상태에서 창을 닫으려 하면(Alt+F4·작업표시줄 닫기) 브라우저가 "나가시겠습니까?" 를 묻는다
   ─ [로그아웃] 을 누르면 로그아웃한 뒤 프로그램 창이 닫힌다
   ─ 혹시 강제로 꺼져도 관제 창은 '창 닫으면 로그아웃' 이라(firebase-config.js) 다시 열면 비밀번호+6자리를 묻는다
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var inFrame = false; try{ inFrame = (window.self !== window.top); }catch(e){ inFrame = true; }
  if(window.caroKiosk) return;
  if(inFrame){   /* 관제센터 안의 운영관리 화면: 클릭하면 바깥 창에 '전체화면 복귀' 를 부탁한다(클릭 권한은 바깥 창에도 전달됨) */
    var tgt = (location.origin && location.origin !== 'null') ? location.origin : '*';
    window.addEventListener('pointerdown', function(){ try{ window.parent.postMessage({ caro: 'kiosk-full' }, tgt); }catch(e){} }, true);
    window.caroKiosk = { goFull: function(){}, exit: function(){ try{ window.parent.postMessage('caro-admin-exit', tgt); }catch(e){} }, leaving: function(){}, isFull: function(){ return true; } };
    return;
  }

  function signedIn(){ try{ return !!(window.FB_AUTH && window.FB_AUTH.currentUser); }catch(e){ return false; } }
  function isFull(){
    try{ if(document.fullscreenElement) return true; if(window.matchMedia && matchMedia('(display-mode: fullscreen)').matches) return true; }catch(e){}
    return Math.abs(window.innerHeight - screen.height) < 4 && Math.abs(window.innerWidth - screen.width) < 4;
  }
  function lockKeys(){ try{ if(navigator.keyboard && navigator.keyboard.lock) navigator.keyboard.lock(['Escape', 'F11']).catch(function(){}); }catch(e){} }

  /* 전체화면 — 반드시 클릭·키 입력 안에서 불러야 브라우저가 허용한다 */
  function goFull(){
    if(isFull()){ lockKeys(); return; }
    try{
      var el = document.documentElement, f = el.requestFullscreen || el.webkitRequestFullscreen;
      if(f){ var p = f.call(el, { navigationUI: 'hide' }); if(p && p.then) p.then(lockKeys).catch(function(){}); }
    }catch(e){}
  }
  /* 로그인돼 있는데 전체화면이 아니면(새로고침·자동 업데이트 뒤 등) 다음 클릭 때 다시 전체화면 */
  ['pointerdown', 'keydown'].forEach(function(ev){
    window.addEventListener(ev, function(e){
      if(!signedIn() || isFull()) return;
      if(e.target && e.target.closest && e.target.closest('#caroLock')) return;   /* 잠금 화면 입력 중엔 건드리지 않음 */
      goFull();
    }, true);
  });

  /* 닫기 막기 — 로그인 상태에서만. 프로그램이 스스로 새로고침·종료할 땐 caroKiosk.leaving() 으로 풀고 나간다 */
  var leaving = false;
  window.addEventListener('beforeunload', function(e){
    if(leaving || !signedIn()) return;
    e.preventDefault(); e.returnValue = ''; return '';
  });

  /* 로그아웃 → 종료 */
  function exit(){
    leaving = true;
    var A = window.FB_AUTH, FN = window.FB_FN;
    var close = function(){
      try{ sessionStorage.clear(); }catch(e){}
      try{ if(document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(function(){}); }catch(e){}
      try{ window.close(); }catch(e){}
      /* 브라우저가 창 닫기를 허락하지 않은 경우(일반 브라우저 탭) → 로그인 화면으로 */
      setTimeout(function(){ try{ location.replace(location.pathname); }catch(e){ location.reload(); } }, 400);
    };
    try{ if(A && FN && typeof FN.signOut === 'function'){ Promise.resolve(FN.signOut(A)).then(close, close); return; } }catch(e){}
    close();
  }

  window.addEventListener('message', function(e){
    if(!(e.origin === location.origin || location.origin === 'null')) return;
    if(e.data && e.data.caro === 'kiosk-full' && signedIn() && !isFull()) goFull();
  });
  window.caroKiosk = { goFull: goFull, exit: exit, leaving: function(){ leaving = true; }, isFull: isFull };
})();
