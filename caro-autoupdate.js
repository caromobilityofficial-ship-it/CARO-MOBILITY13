/* ═══════════════════════════════════════════════════════════════
   caro-autoupdate.js — 관제 화면 자동 업데이트 (v108.3, 2026-11-04)
   ───────────────────────────────────────────────────────────────
   무엇: 사장님이 깃허브에 새 파일을 올리면(배포 도구 CARO_올리기.bat 또는 웹 업로드)
         열려 있는 모든 직원 관제 창이 30초 안에 알아채고 새 버전으로 바꾼다.
   방법: 30초마다 version.txt · deploy-stamp.txt 를 캐시 없이 읽어 바뀌었는지 본다.
         바뀌면 상단에 안내 띠 → 10초 뒤 적용. 적용할 땐 화면이 쓰는 파일을 모두 새로 받아
         브라우저 캐시(최대 10분)를 비운 뒤 새로고침한다. 로그인은 그대로 유지된다.
   안전: 차량 명령 진행 중 · 확인창/입력창이 열림 · 글자를 입력하는 중이면 끝날 때까지 기다린다.
         "5분 뒤" 를 누르면 미룬다. 잠금 화면(자리 비움)은 새로고침 뒤에도 유지된다.
   제외: 운영관리가 관제센터 안(iframe)에 있을 땐 바깥 창이 한꺼번에 처리한다. 앱 안 로컬 사본(file:)은 동작 안 함.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroAU) return; window.__caroAU = true;
  var inFrame = false; try{ inFrame = (window.self !== window.top); }catch(e){ inFrame = true; }
  if(inFrame) return;
  if(!/^https?:$/.test(location.protocol)) return;

  var FILES = ['version.txt', 'deploy-stamp.txt'];
  var POLL = 30000, WAIT = 10, KEY = 'caro_au_sig';
  var base = null, pending = null, snoozeUntil = 0, bar = null, cd = null, applying = false;

  function lsGet(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function lsSet(k, v){ try{ localStorage.setItem(k, v); }catch(e){} }

  function sig(){
    return Promise.all(FILES.map(function(f){
      return fetch(f + '?t=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' })
        .then(function(r){ return r.ok ? r.text() : (r.status === 404 ? '' : null); })
        .catch(function(){ return null; });
    })).then(function(a){
      for(var i = 0; i < a.length; i++) if(a[i] === null) return null;   /* 인터넷 끊김 등 — 이번엔 판단 안 함 */
      return a.map(function(x){ return String(x).trim(); }).join('|');
    });
  }

  /* 지금 새로고침해도 되는가 */
  function busyReason(){
    try{
      var cb = window.CMD_BUSY; if(cb){ for(var k in cb) if(cb[k]) return '차량 명령 진행 중'; }
    }catch(e){}
    var docs = [document];
    try{ var fr = document.getElementById('opsframe'); if(fr && fr.contentDocument) docs.push(fr.contentDocument); }catch(e){}
    for(var i = 0; i < docs.length; i++){
      var d = docs[i];
      try{
        var dlg = d.querySelector('[data-caro-dialog]');   /* caro-dialog 확인/입력창 */
        if(dlg && dlg.style.display === 'flex') return '확인창이 열려 있음';
        var ae = d.activeElement;
        if(ae && /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName) && ae.type !== 'button' && ae.type !== 'checkbox' && String(ae.value || '').length) return '입력 중';
        if(ae && ae.isContentEditable) return '입력 중';
      }catch(e){}
    }
    return '';
  }

  function ui(){
    if(bar) return bar;
    bar = document.createElement('div');
    bar.setAttribute('style', 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:2147483600;'
      + 'background:#1e2026;color:#f1e3b8;border:1px solid #c8a96e;border-radius:12px;padding:10px 14px;'
      + 'display:flex;gap:10px;align-items:center;font:13px -apple-system,"Noto Sans KR","Malgun Gothic",sans-serif;'
      + 'box-shadow:0 8px 28px rgba(0,0,0,.45);max-width:94vw;');
    var msg = document.createElement('span'); msg.id = 'caroAuMsg';
    var now = document.createElement('button'); now.textContent = '지금 적용';
    now.setAttribute('style', 'border:0;border-radius:8px;padding:6px 12px;background:#c8a96e;color:#15161a;font-weight:700;cursor:pointer;font:inherit;');
    var later = document.createElement('button'); later.textContent = '5분 뒤';
    later.setAttribute('style', 'border:1px solid #555;border-radius:8px;padding:6px 10px;background:none;color:#ccc;cursor:pointer;font:inherit;');
    now.onclick = function(){ apply(true); };
    later.onclick = function(){ snoozeUntil = Date.now() + 5 * 60000; hide(); };
    bar.appendChild(msg); bar.appendChild(now); bar.appendChild(later);
    document.body.appendChild(bar);
    return bar;
  }
  function say(t){ ui(); document.getElementById('caroAuMsg').textContent = t; }
  function hide(){ if(cd){ clearInterval(cd); cd = null; } if(bar && bar.parentNode) bar.parentNode.removeChild(bar); bar = null; }

  function announce(){
    if(cd || applying) return;
    if(Date.now() < snoozeUntil) return;
    if(document.hidden && !busyReason()){ apply(false); return; }   /* 아무도 안 보고 있으면 바로 */
    var left = WAIT;
    say('관제 프로그램 새 버전이 올라왔습니다 — ' + left + '초 뒤 자동 적용');
    cd = setInterval(function(){
      var b = busyReason();
      if(b){ say('새 버전 대기 중 — ' + b + ' (끝나면 자동 적용)'); left = WAIT; return; }
      left--;
      if(left <= 0){ clearInterval(cd); cd = null; apply(false); return; }
      say('관제 프로그램 새 버전이 올라왔습니다 — ' + left + '초 뒤 자동 적용');
    }, 1000);
  }

  /* 화면이 쓰는 같은 사이트 파일을 전부 새로 받아 캐시를 갈아끼운 뒤 새로고침 */
  function apply(force){
    if(applying) return;
    if(!force && busyReason()) return;
    applying = true; say('새 버전 적용 중…');
    var urls = {}, add = function(u){ try{ var x = new URL(u, location.href); if(x.origin === location.origin) urls[x.href] = 1; }catch(e){} };
    var docs = [document];
    try{ var fr = document.getElementById('opsframe'); if(fr && fr.contentDocument) docs.push(fr.contentDocument); }catch(e){}
    docs.forEach(function(d){
      try{ Array.prototype.forEach.call(d.querySelectorAll('script[src]'), function(s){ add(s.src); }); }catch(e){}
      try{ Array.prototype.forEach.call(d.querySelectorAll('link[rel="stylesheet"][href]'), function(l){ add(l.href); }); }catch(e){}
      try{ add(d.location.href.split('#')[0]); }catch(e){}
    });
    ['admin-control.html', 'admin-ops.html'].forEach(add);
    var list = Object.keys(urls);
    var go = function(){
      if(pending) lsSet(KEY, pending);
      try{ if(window.CaroAdminLock && window.CaroAdminLock.carry) window.CaroAdminLock.carry(); }catch(e){}
      try{ if(window.caroKiosk) window.caroKiosk.leaving(); }catch(e){}
      location.reload();
    };
    var t = setTimeout(go, 10000);   /* 느린 회선이어도 10초 안에는 넘어간다 */
    Promise.all(list.map(function(u){ return fetch(u, { cache: 'reload', credentials: 'same-origin' }).catch(function(){}); }))
      .then(function(){ clearTimeout(t); go(); });
  }

  function check(){
    if(applying) return;
    sig().then(function(s){
      if(s === null) return;
      if(base === null){
        base = s;
        var seen = lsGet(KEY);
        if(seen === null){ lsSet(KEY, s); return; }        /* 처음 설치 — 지금 받은 것이 최신 */
        if(seen !== s){ pending = s; apply(false); }       /* 꺼져 있는 동안 새 버전이 나왔다 — 캐시된 옛 파일일 수 있으니 한 번 갈아끼운다 */
        return;
      }
      if(s !== base){ pending = s; announce(); }
    });
  }

  function start(){
    check();
    setInterval(check, POLL);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden) check(); });
    window.addEventListener('online', check);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

  window.CaroAutoUpdate = { check: check, applyNow: function(){ apply(true); } };
})();
