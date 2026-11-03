/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관제 실시간 동기화 복구 v1
   ─────────────────────────────────────────────────────────
   [문제]
     여러 관리자 모듈이 "로그인 완료"를 기다리지 않고 곧바로
     Firestore를 구독함 → 이때는 request.auth 가 없어서
     보안 규칙이 거부(permission-denied) → 리스너가 죽고
     로그인 후에도 아무도 재구독하지 않음
     → 화면이 안 채워지고, F5를 눌러야 가끔 됨(캐시 복원 경합)

   [해결]
     FB_FN.onSnapshot 을 "인증 인식형"으로 감쌈.
       · 로그인 전 호출  → 대기열에 넣고, 로그인 완료 시 자동 실행
       · 권한 거부 발생  → 로그인 완료 후 자동 재구독
       · 로그아웃 → 재로그인 → 전부 자동 재연결
     기존 모듈 파일은 한 줄도 수정하지 않음.

   ※ 반드시 firebase-config.js 다음, 다른 admin-*.js 보다 먼저 로드할 것
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var pending = [];      /* 로그인 전에 들어온 구독 요청 */
  var live    = [];      /* 성공적으로 걸린 구독 (재연결용 보관) */
  var authed  = false;
  var wrapped = false;
  var authHooked = false;

  function hasUser(){
    try{ return !!(window.FB_AUTH && window.FB_AUTH.currentUser); }
    catch(e){ return false; }
  }

  /* 실제 구독 실행 */
  function run(item){
    var FN = window.FB_FN;
    if(!FN || !item.orig) return;
    try{
      var unsub = item.orig.apply(FN, item.args);
      item.unsub = unsub;
      item.active = true;
    }catch(e){
      console.warn('[관제 동기화] 구독 실패', e && e.code);
      item.active = false;
    }
  }

  /* 대기 중인 구독 일괄 실행 */
  function flush(){
    if(!hasUser()) return;
    var q = pending.splice(0, pending.length);
    if(q.length) console.log('[관제 동기화] 로그인 확인 → 대기 구독 ' + q.length + '건 실행');
    q.forEach(function(item){
      run(item);
      live.push(item);
    });
  }

  /* 권한 거부로 죽은 구독을 로그인 후 되살림 */
  function revive(force){
    if(!hasUser()) return;
    if(force) live.forEach(function(i){ if(i.denied && !i.active && !i.dead) i.retries = 0; });   /* 로그인(계정)이 바뀌면 처음부터 다시 */
    var dead = live.filter(function(i){ return i.denied && !i.active && !i.dead && (i.retries||0) <= 2; });
    if(!dead.length) return;
    console.log('[관제 동기화] 권한거부로 끊긴 구독 ' + dead.length + '건 재연결');
    dead.forEach(function(item){
      item.denied = false;
      run(item);
    });
  }

  /* onSnapshot 을 인증 인식형으로 교체 */
  function wrap(){
    var FN = window.FB_FN;
    if(wrapped || !FN || typeof FN.onSnapshot !== 'function') return false;

    var orig = FN.onSnapshot;

    FN.onSnapshot = function(){
      var args = Array.prototype.slice.call(arguments);
      var item = { orig: orig, args: args, active:false, denied:false };

      /* 권한 거부 감지기 — 로그인 후 자동 재구독용 */
      function onDenied(err){
        var code = (err && err.code) || '';
        if(code.indexOf('permission') >= 0 || code.indexOf('unauthenticated') >= 0){
          item.active = false;
          item.denied = true;
          /* ★[v108] 권한이 정말 없는 구독은 2번만 다시 시도하고 멈춘다 — 예전엔 0.8초마다 영원히 재시도해 Firestore 요청·콘솔 오류가 폭주했다 */
          item.retries = (item.retries||0) + 1;
          if(hasUser() && item.retries <= 2){
            setTimeout(function(){ if(item.denied){ item.denied = false; run(item); } }, 800 * item.retries);
          }
        }
      }

      /* 콜백 함수 개수 파악 (onNext / onError) */
      var fnIdx = [];
      for(var i = 1; i < args.length; i++){
        if(typeof args[i] === 'function') fnIdx.push(i);
      }

      if(fnIdx.length >= 2){
        /* 에러 콜백이 있음 → 감싸서 거부를 감지 */
        var ei = fnIdx[1];
        var userErr = args[ei];
        args[ei] = function(err){
          onDenied(err);
          try{ userErr.apply(null, arguments); }catch(e){}
        };
      } else if(fnIdx.length === 1){
        /* 에러 콜백이 없음 → 추가해서 조용히 죽는 것을 방지 */
        args.splice(fnIdx[0] + 1, 0, function(err){
          onDenied(err);
          console.warn('[관제 동기화] 구독 오류', err && err.code);
        });
      }
      item.args = args;

      /* 아직 로그인 전이면 대기열에 넣고, 로그인 완료 시 자동 실행 */
      if(!hasUser()){
        pending.push(item);
        return function(){
          var k = pending.indexOf(item);
          if(k >= 0) pending.splice(k, 1);
          item.active=false; item.denied=false; item.dead=true;
          if(item.unsub){ try{ item.unsub(); }catch(e){} }
        };
      }

      /* 로그인 상태면 즉시 실행 */
      run(item);
      live.push(item);
      return function(){
        item.active = false; item.denied=false; item.dead=true;
        if(item.unsub){ try{ item.unsub(); }catch(e){} }
      };
    };

    wrapped = true;
    console.log('[관제 동기화] ✅ 인증 인식형 실시간 구독 활성화');
    return true;
  }

  /* 로그인 상태 감시 */
  function hookAuth(){
    var A = window.FB_AUTH, FN = window.FB_FN;
    if(authHooked || !A || !FN || typeof FN.onAuthStateChanged !== 'function') return false;
    authHooked = true;

    FN.onAuthStateChanged(A, function(u){
      if(u){
        if(!authed){
          authed = true;
          /* 인증 토큰이 완전히 반영되도록 아주 짧게 대기 후 실행 */
          setTimeout(function(){ flush(); revive(true); }, 120);
        } else {
          flush(); revive(true);
        }
      } else {
        authed = false;
      }
    });
    return true;
  }

  /* FB_FN 이 준비되는 즉시 감싸기 (다른 모듈보다 먼저) */
  (function init(n){
    n = n || 0;
    var ok1 = wrap();
    var ok2 = hookAuth();
    if(ok1 && ok2){
      /* 이미 로그인된 상태로 진입한 경우(캐시 복원) 즉시 처리 */
      if(hasUser()) setTimeout(function(){ flush(); revive(); }, 100);
      return;
    }
    if(n > 150) {
      console.warn('[관제 동기화] Firebase 준비 안 됨 — firebase-config.js 확인');
      return;
    }
    setTimeout(function(){ init(n + 1); }, 100);
  })();

  /* 화면 복귀 시 끊긴 구독 점검 (탭 전환·절전 후) */
  document.addEventListener('visibilitychange', function(){
    if(!document.hidden && hasUser()) revive();
  });
})();
