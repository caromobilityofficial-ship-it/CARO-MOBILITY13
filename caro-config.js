/* ═══════════════════════════════════════════════════════════════
   caro-config.js — CARO 앱 전역 설정 (index.html 에서 가장 먼저 로드)
   ───────────────────────────────────────────────────────────────
   ★ SECURE_SERVER 스위치
     false : 지금까지의 방식 (브라우저가 예약·결제·차량명령을 직접 처리)
             → 개발·시연용. 보안 미적용. 화면 상단에 노란 띠가 표시된다.
     true  : Cloud Functions 경유 (결제 승인·예약 생성·차량 명령·반납·취소를 서버가 검증)
             → Firebase Blaze + functions 배포 + firestore.rules 배포 후에 켠다.
   이 파일 외에는 아무것도 바꾸지 않아도 된다.
   ═══════════════════════════════════════════════════════════════ */
window.CARO_CONFIG = {
  appVersion: "2026.09.09-v101 (회사 토스 키)",

  /* ── 서버 모드 ── */
  SECURE_SERVER: false,
  FUNCTIONS_REGION: "asia-northeast3",

  /* ── 결제 (토스페이먼츠) — ★ 회사 계정 키 (2026-09-09 교체) ──
     클라이언트 키는 공개값이다. 시크릿 키는 절대 여기 넣지 않는다 (Functions Secret: TOSS_SECRET_KEY).
     시크릿 키는 회사 계정의 test_sk_... 를 Firebase 금고에만 넣는다 (클라이언트 키와 같은 상점의 짝이어야 함).
     라이브 전환 시 test_ck_ → live_ck_ 로 교체. 한 곳만 바꾸면 결제 3경로(예약·연장·정산)에 모두 적용된다. */
  TOSS_CLIENT_KEY: "test_ck_oEjb0gm23P5NmQq577KkVpGwBJn5",

  /* ── 고객센터 ── (사고·문의 저장 실패 시 안내에 사용) */
  supportPhone: "010-6872-9807",

  /* ── 거점(반납 허용 지점) — 서버(functions) 의 STATIONS 와 동일하게 유지 ── */
  STATIONS: [
    { id: "st_songdo",      name: "송도 거점",   addr: "인천 연수구 송도동 9-9",     lat: 37.3846, lng: 126.6500, radiusM: 300 },
    { id: "st_guwol",       name: "구월동 거점", addr: "인천 남동구 구월동 1408-2",  lat: 37.4476, lng: 126.7007, radiusM: 300 },
    { id: "st_bupyeong",    name: "부평 거점",   addr: "인천 부평구 광장로 16",      lat: 37.4893, lng: 126.7235, radiusM: 300 },
    { id: "st_dongincheon", name: "동인천 거점", addr: "인천 제물포구 제물량로 307", lat: 37.4762, lng: 126.6188, radiusM: 300 }
  ],

  /* ── 차량 제어 허용 시간창 (분) — 서버와 동일 ── */
  CONTROL_BEFORE_START_MIN: 10,
  CONTROL_AFTER_END_MIN: 30,

  /* ── 시연용 지갑 ──
     true  : 새 계정에 가입 크레딧 10,000원 + 30% 쿠폰을 자동 지급 (시연·테스트용, 실제 돈 아님)
     false : 지급하지 않음 (실서비스 전환 시 false 로) */
  DEMO_WALLET: true
};

/* ═══════════════════════════════════════════════════════════════
   [v101] 로그인 상태 공용 알림 — window.caroOnAuth(cb)
   ───────────────────────────────────────────────────────────────
   문제: script.js 등은 Firebase(모듈, 나중에 로드)보다 먼저 실행되어
         "FB_AUTH 가 생길 때까지 0.5초마다 N번 확인" 하는 폴링을 파일마다 따로 두었고,
         제한 시간(30~48초) 안에 로그인이 안 되면 카드·면허·미납 복원이 영영 안 됐다.
   해결: 어떤 파일에서든 caroOnAuth(cb) 를 부르면, Firebase 가 로그인 상태를 확정한
         뒤(그리고 바뀔 때마다) cb(user|null) 가 호출된다. 시간 제한 없음.
         (firebase-config.js 가 __caroAuthEmit 으로 실제 상태를 흘려보낸다) */
(function(){
  if (window.caroOnAuth) return;
  var subs = [], state = { resolved: false, user: null };
  window.caroAuthState = state;
  window.caroOnAuth = function(cb){
    if (typeof cb !== 'function') return;
    subs.push(cb);
    if (state.resolved) { try { cb(state.user); } catch (e) { console.warn('[caroOnAuth]', e); } }
  };
  window.__caroAuthEmit = function(user){
    state.resolved = true; state.user = user || null;
    subs.slice().forEach(function(cb){ try { cb(state.user); } catch (e) { console.warn('[caroOnAuth]', e); } });
  };
})();
