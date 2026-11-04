/* ════════════════════════════════════════════════════════
   CARO MOBILITY — Firebase Config (caro-mobility-prod)
   Auth + Firestore (실시간 동기화)
   ────────────────────────────────────────────────────────
   ★ 관리자 페이지(admin.html)는 로그인 세션을 따로 쓰도록 분리.
     → 고객 앱 로그인과 서로 로그아웃되지 않음.
   ★ 관리자 페이지는 보안상 '세션 지속성' 사용
     → 브라우저/앱을 완전히 닫으면 로그아웃 (자동 로그인 방지).
   ──────────────────────────────────────────────────────── */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  sendPasswordResetEmail,
  updateProfile,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
/* ★[14차] 2단계 인증(TOTP) 부품 — 이름 하나씩 import 하면 없는 이름이 있을 때 파일 전체가 죽으므로
   네임스페이스로 받아 쓴다(없으면 undefined → 화면이 "미지원" 으로 안내). */
import * as __AUTHNS from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFunctions, httpsCallable } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-functions.js";
import * as __FSNS from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
/* ★[24차] 사진 저장소(Storage) — 예약 문서(1MB) 대신 파일로 저장 */
import * as __STNS from "https://www.gstatic.com/firebasejs/12.12.1/firebase-storage.js";
/* ★[v109] App Check — 진짜 카로 앱·사이트에서 온 요청에만 서버가 응답하게 한다(가짜 앱·스크립트 차단) */
import * as __ACNS from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app-check.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/* Firebase 프로젝트 설정 — caro-mobility-prod */
const firebaseConfig = {
  apiKey: "AIzaSyBSFjVMeA0-7Y5OvITqIRtLpho-wH_YqTk",
  authDomain: "caro-mobility-prod.firebaseapp.com",
  projectId: "caro-mobility-prod",
  storageBucket: "caro-mobility-prod.firebasestorage.app",
  messagingSenderId: "888783040851",
  appId: "1:888783040851:web:4afb58611a38867f85f1a6",
  measurementId: "G-W4WTTHK7L3"
};

/* 초기화
   ─ admin.html(주소에 'admin' 포함)은 'caroAdmin'이라는 별도 앱으로 시작
     → 로그인 저장 자리가 고객 앱과 분리됨 (서로 로그아웃 안 됨).
   ─ 고객 앱(index.html)은 기존과 100% 동일하게 기본 앱 사용. */
/* ★ 세션 공유: 앱(운영자)이 로그인한 상태로 관제센터(admin-control.html)를 열면
   재로그인 없이 '같은 계정·권한'이 그대로 넘어가야 한다(2중 로그인 제거 + 권한대로 탭 분리).
   그래서 관리자 페이지도 고객 앱과 '동일한 기본 세션'을 쓴다(예전엔 caroAdmin으로 분리해서
   앱에서 열 때마다 다시 로그인 → 최고관리자로 들어가 두 탭 다 뜨던 문제의 근본 원인). */
/* ★[v108.4] 관제 화면(admin-control.html · admin-ops.html)은 다시 '창을 닫으면 로그아웃' 으로.
   예전(false)엔 고객 앱과 같은 '영구 로그인' 을 써서, 관제 창을 닫았다 열어도 비밀번호·2단계 인증 없이 그대로 들어가졌다.
   ─ 관제 화면은 저장된 로그인(IndexedDB)을 아예 읽지 않는다 → 창을 새로 열 때마다 비밀번호 + 6자리
   ─ 같은 창 안의 새로고침·자동 업데이트·운영관리(iframe) 는 로그인 유지(sessionStorage)
   ─ 고객 앱(index.html)은 그대로 영구 로그인 */
const __isAdminPage = /\/admin[^\/]*\.html$/i.test(location.pathname);

const app = initializeApp(firebaseConfig);

/* ★[v109] App Check 사이트 키 (reCAPTCHA v3 '사이트 키' — 공개값). 비어 있으면 App Check 를 켜지 않는다.
   콘솔에서 등록한 뒤 이 값을 채우고, 한동안 지표를 확인한 다음 서버 APP_CHECK_ENFORCE=true 로 바꾼다 */
const APPCHECK_SITE_KEY = '6LfDPBAuAAAAAB8EG01g18v4S5VJjzuUEcL7yJPa';   // 2026-11-05 등록 (caro-mobility-prod, app.caromobility.kr)
if (APPCHECK_SITE_KEY && __ACNS && typeof __ACNS.initializeAppCheck === 'function' && /^https:$/.test(location.protocol)) {
  try { __ACNS.initializeAppCheck(app, { provider: new __ACNS.ReCaptchaV3Provider(APPCHECK_SITE_KEY), isTokenAutoRefreshEnabled: true }); }
  catch (e) { console.warn('App Check 시작 실패', e); }
  /* reCAPTCHA 떠 있는 배지는 화면(하단 메뉴·관제 버튼)을 가리므로 숨기고, 대신 로그인 화면에 구글 약관 안내 문구를 넣는다(구글 허용 방식) */
  try {
    const st = document.createElement('style'); st.textContent = '.grecaptcha-badge{visibility:hidden!important}'; document.head.appendChild(st);
    const note = function () {
      ['login-screen', 'gate', 'loginGate'].forEach(function (id) {
        const el = document.getElementById(id); if (!el || el.querySelector('.caro-rc-note')) return;
        const d = document.createElement('div'); d.className = 'caro-rc-note';
        d.style.cssText = 'font-size:10.5px;line-height:1.5;opacity:.55;text-align:center;padding:10px 16px 14px;';
        d.innerHTML = '이 서비스는 reCAPTCHA 로 보호되며 Google <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" style="color:inherit">개인정보처리방침</a>과 <a href="https://policies.google.com/terms" target="_blank" rel="noopener" style="color:inherit">서비스 약관</a>이 적용됩니다.';
        (el.firstElementChild && el.id !== 'login-screen' ? el.firstElementChild : el).appendChild(d);
      });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', note); else note();
  } catch (e) {}
}

let auth;
if (__isAdminPage && typeof __AUTHNS.initializeAuth === 'function') {
  try { auth = __AUTHNS.initializeAuth(app, { persistence: [browserSessionPersistence] }); }
  catch (e) { auth = getAuth(app); }
} else {
  auth = getAuth(app);
}
const db = getFirestore(app);

/* ★ 보안: 관리자 페이지는 '세션 지속성(SESSION)' 사용
   ─ 작업 중 새로고침은 로그인 유지
   ─ 브라우저/앱을 완전히 닫으면 로그아웃 → 다시 켜면 로그인 필요(자동 로그인 방지)
   ─ 고객 앱(index.html)은 손대지 않음 = 기존처럼 로그인 유지 */
if (__isAdminPage) {
  setPersistence(auth, browserSessionPersistence)   /* initializeAuth 가 없는 옛 SDK 대비 — 이미 SESSION 이면 아무 일 없음 */
    .then(function () {
      console.log('🔒 관리자 세션 지속성: SESSION — 닫으면 로그아웃(자동 로그인 방지)');
    })
    .catch(function (e) {
      console.warn('관리자 세션 지속성 설정 실패:', e);
    });
} else {
  /* ★ 고객 앱: 로그인 영구 유지 (LOCAL) — 앱을 껐다 켜도 로그아웃/탈퇴 전까지 유지 */
  setPersistence(auth, indexedDBLocalPersistence)
    .catch(function () { return setPersistence(auth, browserLocalPersistence); })
    .then(function () {
      console.log('🔓 고객 앱 지속성: LOCAL — 로그인 영구 유지');
    })
    .catch(function (e) {
      console.warn('고객 앱 지속성 설정 실패:', e);
    });
}

/* 전역 등록 (script.js / admin.html 에서 사용) */
window.FB_AUTH = auth;
window.FB_DB = db;
window.FB_FN = {
  /* === Auth === */
  signInWithEmailAndPassword: signInWithEmailAndPassword,
  createUserWithEmailAndPassword: createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail: fetchSignInMethodsForEmail,
  sendPasswordResetEmail: sendPasswordResetEmail,
  updateProfile: updateProfile,
  signOut: signOut,
  onAuthStateChanged: onAuthStateChanged,
  setPersistence: setPersistence,
  browserSessionPersistence: browserSessionPersistence,
  /* 2단계 인증 (caro-mfa.js 가 사용) */
  multiFactor: __AUTHNS.multiFactor,
  getMultiFactorResolver: __AUTHNS.getMultiFactorResolver,
  TotpMultiFactorGenerator: __AUTHNS.TotpMultiFactorGenerator,
  sendEmailVerification: __AUTHNS.sendEmailVerification,
  /* ★[23차] 비밀번호 변경(재인증 후) */
  updatePassword: __AUTHNS.updatePassword, reauthenticateWithCredential: __AUTHNS.reauthenticateWithCredential, EmailAuthProvider: __AUTHNS.EmailAuthProvider,
  /* === Firestore === */
  doc: doc,
  setDoc: setDoc,
  getDoc: getDoc,
  collection: collection,
  onSnapshot: onSnapshot,
  deleteDoc: deleteDoc,
  getDocs: getDocs,
  query: query,
  where: where,
  orderBy: orderBy,
  limit: limit,
  serverTimestamp: serverTimestamp,
  arrayUnion: __FSNS.arrayUnion, arrayRemove: __FSNS.arrayRemove,   /* ★[24차] 푸시 토큰 목록용 */
  /* === Storage (★24차) === */
  storageRef: __STNS.ref, uploadString: __STNS.uploadString, getDownloadURL: __STNS.getDownloadURL
};
try { window.FB_STORAGE = __STNS.getStorage(app); } catch (e) { console.warn('storage init', e); }

/* ★ Cloud Functions 호출 (서울 리전). 앱·관제 공용: window.FB_CALL('함수명', {…}) → Promise<result.data> */
const __fns = getFunctions(app, "asia-northeast3");
window.FB_CALL = function (name, data) { return httpsCallable(__fns, name)(data || {}).then(function (r) { return r.data; }); };
window.FB_READY = true;

/* ★ [v101] 로그인 상태 공용 알림 — caroOnAuth(cb) (정의는 caro-config.js, 여기서 실제 상태를 흘려보냄)
   관리자 페이지처럼 caro-config.js 가 없는 화면을 위해 같은 스텁을 한 번 더 둔다. */
if (!window.caroOnAuth) {
  (function () {
    var subs = [], state = { resolved: false, user: null };
    window.caroAuthState = state;
    window.caroOnAuth = function (cb) {
      if (typeof cb !== 'function') return;
      subs.push(cb);
      if (state.resolved) { try { cb(state.user); } catch (e) { console.warn('[caroOnAuth]', e); } }
    };
    window.__caroAuthEmit = function (user) {
      state.resolved = true; state.user = user || null;
      subs.slice().forEach(function (cb) { try { cb(state.user); } catch (e) { console.warn('[caroOnAuth]', e); } });
    };
  })();
}
onAuthStateChanged(auth, function (u) {
  try { window.__caroAuthEmit(u || null); } catch (e) { console.warn('[caroOnAuth emit]', e); }
});
console.log('🔥 Firebase 초기화 완료 (caro-mobility-prod)' +
  (__isAdminPage ? ' — 관리자 세션(caroAdmin) 분리 적용' : ''));
