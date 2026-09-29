/* ═══════════════════════════════════════════════════════════════
   caro-admin-lock.js — 관제 화면 자동 잠금 (2026-09, 13차 보안)
   ───────────────────────────────────────────────────────────────
   왜: 관제 화면은 로그인이 계속 유지된다. 태블릿을 두고 자리를 뜨거나 분실하면
       화면만 열면 시동차단·문열기 명령을 보낼 수 있었다.
   무엇: 일정 시간(기본 10분) 아무 조작이 없으면 화면을 가리고 **비밀번호를 다시 입력해야** 풀린다.
         · 잠긴 동안에도 데이터 수신·경보음은 계속된다(감시는 멈추지 않음). 화면과 조작만 막는다.
         · 관제 페이지 안의 운영관리(iframe) 조작도 '조작 있음' 으로 친다.
   조절: window.CARO_LOCK_MIN (분). 기본 10, 최소 1, 0 이하는 무시(끌 수 없음).
   한계: 이것은 '자리 비운 사람' 을 막는 장치다. 비밀번호를 아는 사람이 다른 기기에서 들어오는 것은
         서버 쪽(2단계 인증·앱 검증)에서 막아야 한다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var inFrame = false;
  try{ inFrame = (window.self !== window.top); }catch(e){ inFrame = true; }

  var MIN = Number(window.CARO_LOCK_MIN);
  if(!isFinite(MIN) || MIN < 1) MIN = 10;
  var LIMIT = MIN * 60 * 1000;
  var last = Date.now(), locked = false, ov = null, tries = 0, lockedUntil = 0;

  function now(){ return Date.now(); }

  /* ── iframe(운영관리) 안에서는 잠그지 않고, 조작이 있었다고 부모에게만 알린다 ── */
  if(inFrame){
    var sent = 0;
    var ping = function(){ var t = now(); if(t - sent < 5000) return; sent = t;
      try{ window.parent.postMessage({caro:'admin-activity'}, location.origin); }catch(e){} };
    ['pointerdown','keydown','touchstart','wheel'].forEach(function(ev){
      window.addEventListener(ev, ping, {passive:true, capture:true}); });
    return;
  }

  function touch(){ if(!locked) last = now(); }
  ['pointerdown','keydown','touchstart','wheel','mousemove'].forEach(function(ev){
    window.addEventListener(ev, touch, {passive:true, capture:true}); });
  window.addEventListener('message', function(e){
    if(e.origin === location.origin && e.data && e.data.caro === 'admin-activity') touch(); });

  function signedIn(){
    var a = window.FB_AUTH; return !!(a && a.currentUser && a.currentUser.email);
  }

  function build(){
    var d = document.createElement('div');
    d.id = 'caroLock';
    d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true');
    d.style.cssText = 'position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;'
      + 'background:#0f1013;color:#e8e8ea;font-family:-apple-system,"Noto Sans KR","Malgun Gothic",sans-serif;padding:20px;';
    var box = document.createElement('div');
    box.style.cssText = 'width:min(360px,100%);text-align:center;';
    var h = document.createElement('div'); h.textContent = '🔒 화면이 잠겼습니다';
    h.style.cssText = 'font-size:20px;font-weight:700;margin-bottom:8px;';
    var p = document.createElement('div');
    p.style.cssText = 'font-size:13px;color:#9aa0ab;margin-bottom:16px;line-height:1.5;';
    p.textContent = MIN + '분 동안 조작이 없어 잠갔습니다. 로그인한 계정의 비밀번호를 입력하세요. (경보음·수신은 계속됩니다)';
    var acct = document.createElement('div'); acct.id = 'caroLockAcct';
    acct.style.cssText = 'font-size:12px;color:#c9a227;margin-bottom:10px;word-break:break-all;';
    var pw = document.createElement('input'); pw.type = 'password'; pw.id = 'caroLockPw';
    pw.autocomplete = 'current-password'; pw.placeholder = '비밀번호';
    pw.style.cssText = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid #3a3d45;'
      + 'background:#1a1c21;color:#fff;font-size:16px;margin-bottom:10px;';
    var btn = document.createElement('button'); btn.type = 'button'; btn.textContent = '잠금 해제';
    btn.style.cssText = 'width:100%;padding:12px;border-radius:10px;border:0;background:#c9a227;color:#15161a;'
      + 'font-size:15px;font-weight:700;cursor:pointer;';
    var err = document.createElement('div'); err.id = 'caroLockErr';
    err.style.cssText = 'min-height:18px;font-size:12px;color:#ff7a68;margin-top:10px;';
    box.appendChild(h); box.appendChild(p); box.appendChild(acct); box.appendChild(pw); box.appendChild(btn); box.appendChild(err);
    d.appendChild(box);
    function submit(){
      var t = now();
      if(t < lockedUntil){ err.textContent = Math.ceil((lockedUntil - t)/1000) + '초 뒤에 다시 시도하세요'; return; }
      var A = window.FB_AUTH, FN = window.FB_FN;
      var em = A && A.currentUser && A.currentUser.email;
      if(!em || !FN || typeof FN.signInWithEmailAndPassword !== 'function'){
        err.textContent = '서버에 연결할 수 없습니다 — 인터넷을 확인하세요'; return; }
      if(!pw.value){ err.textContent = '비밀번호를 입력하세요'; return; }
      btn.disabled = true; err.textContent = '확인 중…';
      FN.signInWithEmailAndPassword(A, em, pw.value).then(function(){
        pw.value = ''; tries = 0; unlock();
      }).catch(function(e){
        btn.disabled = false; pw.value = ''; tries++;
        var c = (e && e.code) || '';
        if(/network/.test(c)) err.textContent = '네트워크 오류 — 인터넷을 확인하세요';
        else if(/too-many/.test(c)) err.textContent = '시도가 너무 잦습니다 — 잠시 후 다시';
        else err.textContent = '비밀번호가 올바르지 않습니다';
        if(tries >= 5){ lockedUntil = now() + 30000; tries = 0; err.textContent = '5회 실패 — 30초 뒤에 다시 시도하세요'; }
      });
    }
    btn.addEventListener('click', submit);
    pw.addEventListener('keydown', function(e){ if(e.key === 'Enter') submit(); });
    return d;
  }

  function setInert(on){
    var kids = document.body.children;
    for(var i = 0; i < kids.length; i++){
      var k = kids[i]; if(k === ov) continue;
      try{ if(on){ k.setAttribute('inert',''); k.setAttribute('aria-hidden','true'); }
           else { k.removeAttribute('inert'); k.removeAttribute('aria-hidden'); } }catch(e){}
    }
  }

  function lock(){
    if(locked) return;
    locked = true;
    ov = build(); document.body.appendChild(ov);
    var a = ov.querySelector('#caroLockAcct'); a.textContent = (window.FB_AUTH.currentUser.email) || '';
    setInert(true);
    try{ if(document.activeElement && document.activeElement.blur) document.activeElement.blur(); }catch(e){}
    setTimeout(function(){ var i = ov && ov.querySelector('#caroLockPw'); if(i) i.focus(); }, 50);
  }
  function unlock(){
    if(!locked) return;
    setInert(false);
    if(ov && ov.parentNode) ov.parentNode.removeChild(ov);
    ov = null; locked = false; last = now();
  }

  /* 오버레이가 개발자도구 등으로 지워지면 다시 세운다 */
  setInterval(function(){
    if(locked){
      if(!ov || !document.body.contains(ov)){ locked = false; ov = null; lock(); }
      return;
    }
    if(signedIn() && now() - last > LIMIT) lock();
  }, 5000);

  window.CaroAdminLock = { lockNow: function(){ if(signedIn()) lock(); }, isLocked: function(){ return locked; } };
})();
