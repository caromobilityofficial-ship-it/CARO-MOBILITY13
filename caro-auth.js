/* ═══════════════════════════════════════════════════════════════
   caro-auth.js — CARO 인증 확장 모듈 (2026-09)
   ───────────────────────────────────────────────────────────────
   ① 휴대폰 문자 인증   Firebase Phone Auth (실제 SMS 발송)
   ② 카카오 로그인/가입  인가코드 → Cloud Function → Firebase 커스텀 토큰
   ③ 네이버 로그인/가입  동일
   ④ PASS 본인인증      PortOne(아임포트) 본인인증 → Cloud Function 검증
   ───────────────────────────────────────────────────────────────
   ★ 모든 기능은 아래 CONFIG 플래그가 true 일 때만 동작한다.
     false 이면 기존 동작(준비 중 안내 / 개발용 코드 표시)을 그대로 유지하므로
     이 파일을 올려도 앱은 아무것도 바뀌지 않는다. 콘솔 설정을 마친 뒤
     항목별로 true 로 바꾸면 그 기능만 켜진다.
   ★ 여기 적는 키(REST API 키, Client ID, 가맹점 코드)는 원래 공개되는 값이다.
     비밀키(Client Secret, PortOne API Secret)는 절대 이 파일에 넣지 않는다 —
     Cloud Functions 의 Secret 에만 저장한다.
   ═══════════════════════════════════════════════════════════════ */

import {
  RecaptchaVerifier, signInWithPhoneNumber, signInWithCustomToken,
  linkWithCredential, EmailAuthProvider, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-auth.js";
import { getFunctions, httpsCallable }
  from "https://www.gstatic.com/firebasejs/12.12.1/firebase-functions.js";

/* ───────────── 설정 (콘솔 작업 후 여기만 수정) ───────────── */
const CONFIG = {
  /* ① Firebase 콘솔 → Authentication → 로그인 방법 → 전화 '사용 설정' 후 true
        (Blaze 요금제 필요. 승인된 도메인에 toly1021-ui.github.io 추가) */
  phoneAuth: false,

  /* ② 카카오 개발자센터 → 내 애플리케이션 → 앱 키 → 'REST API 키' */
  kakao: { enabled: false, restApiKey: "" },

  /* ③ 네이버 개발자센터 → 애플리케이션 → 'Client ID' (Secret 은 Functions 에만) */
  naver: { enabled: false, clientId: "" },

  /* ④ PortOne 관리자콘솔 → 가맹점 식별코드 (imp 로 시작) */
  pass:  { enabled: false, impCode: "" },

  /* Cloud Functions 배포 리전 (서울) */
  functionsRegion: "asia-northeast3"
};
window.CARO_AUTH_CONFIG = CONFIG;

/* ───────────── 내부 준비 ───────────── */
const auth = window.FB_AUTH || null;
if (!auth) console.warn("[caro-auth] Firebase 가 초기화되지 않아 인증 확장을 대기 상태로 둡니다.");
const noAuth = () => { toast("서버 연결을 확인해 주세요."); };
const toast = (m) => (window.showToast ? window.showToast(m) : alert(m));
const $ = (id) => document.getElementById(id);
const val = (id) => (window.val ? window.val(id) : (($(id) || {}).value || "").trim());

/* 카카오/네이버 콘솔에 등록할 Redirect URI — 앱이 로드하는 주소 그대로 */
function redirectUri() {
  let p = location.pathname;
  if (p.endsWith("/")) p += "index.html";
  return location.origin + p;
}
window.CARO_OAUTH_REDIRECT_URI = redirectUri();

let _functions = null;
function fns() {
  if (!_functions) _functions = getFunctions(auth.app, CONFIG.functionsRegion);
  return _functions;
}

/* 한국 휴대폰 번호 → E.164 (+82) */
function toE164(kr) {
  const d = String(kr || "").replace(/\D/g, "");
  if (!/^01[0-9]{8,9}$/.test(d)) return null;
  return "+82" + d.slice(1);
}

/* 전화 전용(이메일 없는) 세션이 남아 있으면 정리 — 가입 도중 이탈한 경우 */
window._caroSignupInProgress = false;
if (auth) onAuthStateChanged(auth, (u) => {
  if (u && u.phoneNumber && !u.email && !window._caroSignupInProgress) {
    signOut(auth).catch(() => {});
  }
});

/* ═══════════════════════════════════════════════════════════════
   ① 휴대폰 문자 인증
   ═══════════════════════════════════════════════════════════════ */
let _recaptcha = null;
let _confirm = null;                       // ConfirmationResult
window._caroPhoneVerified = false;

function ensureRecaptcha() {
  if (_recaptcha) return _recaptcha;
  let host = $("caro-recaptcha");
  if (!host) {
    host = document.createElement("div");
    host.id = "caro-recaptcha";
    host.style.cssText = "position:fixed;bottom:0;left:0;width:1px;height:1px;overflow:hidden;opacity:0;pointer-events:none;";
    document.body.appendChild(host);
  }
  _recaptcha = new RecaptchaVerifier(auth, host, { size: "invisible" });
  return _recaptcha;
}
function resetRecaptcha() {
  try { if (_recaptcha) _recaptcha.clear(); } catch (e) {}
  _recaptcha = null;
  const host = $("caro-recaptcha"); if (host) host.innerHTML = "";
}

/* 인증 모달 UI 조작 (기존 pass-auth-modal 재사용) */
function modalShow(msgHtml, { spinner = false, input = false } = {}) {
  const modal = $("pass-auth-modal"); if (modal) modal.style.display = "flex";
  const sp = $("pass-spinner"), cb = $("pass-modal-complete-btn"), ok = $("pass-success-icon"),
        msg = $("pass-modal-msg"), ia = $("sms-input-area"), inp = $("sms-code-input");
  if (sp) sp.style.display = spinner ? "block" : "none";
  if (cb) cb.style.display = "none";
  if (ok) ok.style.display = "none";
  if (msg) { msg.innerHTML = msgHtml; msg.style.color = ""; msg.style.fontWeight = ""; }
  if (ia) ia.style.display = input ? "block" : "none";
  if (inp && input) { inp.value = ""; setTimeout(() => inp.focus(), 50); }
}
function modalHide() { const m = $("pass-auth-modal"); if (m) m.style.display = "none"; }

/* 문자 발송 — openPassAuth() 에서 위임 호출 */
async function caroSendSms() {
  if (!auth) return noAuth();
  const phone = val("su-phone") || val("find-phone");
  const e164 = toE164(phone);
  if (!e164) { toast("올바른 휴대폰 번호를 입력해 주세요."); return; }

  window._caroSignupInProgress = true;
  window._smsVerifiedPhone = phone;
  window._smsExpire = Date.now() + 3 * 60 * 1000;
  modalShow("인증번호를 문자로 보내는 중입니다…", { spinner: true });

  try {
    _confirm = await signInWithPhoneNumber(auth, e164, ensureRecaptcha());
    modalShow(
      "<b>" + phone.replace(/(\d{3})(\d{3,4})(\d{4})/, "$1-$2-$3") + "</b> 로<br>인증번호 6자리를 보냈습니다.",
      { input: true }
    );
    if (typeof window._startSmsTimer === "function") window._startSmsTimer();
  } catch (e) {
    resetRecaptcha();
    modalHide();
    const map = {
      "auth/invalid-phone-number":   "휴대폰 번호 형식이 올바르지 않습니다.",
      "auth/too-many-requests":      "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
      "auth/quota-exceeded":         "오늘 문자 발송 한도를 초과했습니다.",
      "auth/captcha-check-failed":   "보안 확인에 실패했습니다. 다시 시도해 주세요.",
      "auth/operation-not-allowed":  "전화 인증이 아직 활성화되지 않았습니다. (Firebase 콘솔 설정 필요)",
      "auth/billing-not-enabled":    "문자 인증은 Firebase Blaze 요금제에서만 동작합니다.",
      "auth/network-request-failed": "네트워크 연결을 확인해 주세요."
    };
    toast(map[e.code] || ("문자 발송 실패: " + (e.code || e.message)));
    console.error("[caro-auth] sms send", e);
  }
}

/* 인증번호 확인 — verifySmsCode() 에서 위임 호출 */
async function caroVerifySms() {
  if (!auth) return noAuth();
  const inp = $("sms-code-input");
  const code = (inp && inp.value || "").replace(/\D/g, "");
  if (code.length !== 6) { toast("인증번호 6자리를 입력해 주세요."); return; }
  if (!_confirm) { toast("먼저 인증번호를 받아 주세요."); return; }
  if (Date.now() > (window._smsExpire || 0)) { toast("인증번호가 만료되었습니다. 다시 발송해 주세요."); return; }

  try {
    const cred = await _confirm.confirm(code);
    const user = cred.user;

    /* 아이디 찾기 모드: 확인만 하고 세션은 남기지 않음 */
    if (window._findMode === "id") {
      window._caroPhoneVerified = true;
      if (typeof window.completePassAuth === "function") window.completePassAuth();
      setTimeout(() => signOut(auth).catch(() => {}), 1500);
      window._caroSignupInProgress = false;
      return;
    }

    /* 가입 모드: 이 번호가 이미 다른 계정에 묶여 있으면 중복 가입 차단 */
    if (user.email) {
      await signOut(auth);
      window._caroSignupInProgress = false;
      modalHide();
      toast("이미 가입된 휴대폰 번호입니다. 로그인 화면에서 로그인해 주세요.");
      return;
    }

    window._caroPhoneVerified = true;
    if (typeof window.completePassAuth === "function") window.completePassAuth();
  } catch (e) {
    const map = {
      "auth/invalid-verification-code": "인증번호가 올바르지 않습니다.",
      "auth/code-expired":              "인증번호가 만료되었습니다. 다시 발송해 주세요.",
      "auth/too-many-requests":         "시도 횟수를 초과했습니다. 잠시 후 다시 시도해 주세요."
    };
    toast(map[e.code] || ("인증 실패: " + (e.code || e.message)));
    console.error("[caro-auth] sms verify", e);
  }
}

/* 가입 3단계: 전화로 로그인된 상태면 이메일/비밀번호를 '연결', 아니면 신규 생성
   handleSignup() 에서 createUserWithEmailAndPassword 대신 호출 */
async function caroCreateOrLink(email, pw) {
  if (!auth) throw Object.assign(new Error("firebase not ready"), { code: "auth/network-request-failed" });
  const u = auth.currentUser;
  if (u && u.phoneNumber && !u.email) {
    try {
      const cred = await linkWithCredential(u, EmailAuthProvider.credential(email, pw));
      window._caroSignupInProgress = false;
      return cred;                                   // UserCredential { user }
    } catch (e) {
      if (e.code === "auth/email-already-in-use" || e.code === "auth/credential-already-in-use") {
        await signOut(auth).catch(() => {});
        window._caroSignupInProgress = false;
      }
      throw e;
    }
  }
  const { createUserWithEmailAndPassword } = window.FB_FN;
  const cred = await createUserWithEmailAndPassword(auth, email, pw);
  window._caroSignupInProgress = false;
  return cred;
}

/* 취소 시 전화 전용 세션 정리 */
function caroAbortPhone() {
  window._caroSignupInProgress = false;
  const u = auth ? auth.currentUser : null;
  if (u && u.phoneNumber && !u.email) signOut(auth).catch(() => {});
  _confirm = null;
}

/* ═══════════════════════════════════════════════════════════════
   ② ③ 카카오 / 네이버 로그인·가입
   ═══════════════════════════════════════════════════════════════ */
function randomState() {
  const a = new Uint8Array(16); crypto.getRandomValues(a);
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}

/* 버튼에서 호출: socialLogin('카카오'|'네이버') → 여기로 위임 */
function caroSocialLogin(provider) {
  const p = /kakao|카카오/i.test(provider) ? "kakao" : /naver|네이버/i.test(provider) ? "naver" : null;
  if (!p) return;
  const label = p === "kakao" ? "카카오" : "네이버";
  if (!CONFIG[p].enabled) { toast(label + " 로그인 준비 중입니다."); return; }
  if (!auth) return noAuth();

  const state = randomState();
  try {
    sessionStorage.setItem("caro_oauth_state", state);
    sessionStorage.setItem("caro_oauth_provider", p);
    sessionStorage.setItem("caro_oauth_from", window.currentScreen || "");
  } catch (e) {}

  const ru = encodeURIComponent(redirectUri());
  let url;
  if (p === "kakao") {
    url = "https://kauth.kakao.com/oauth/authorize?response_type=code"
        + "&client_id=" + encodeURIComponent(CONFIG.kakao.restApiKey)
        + "&redirect_uri=" + ru + "&state=" + state
        + "&scope=" + encodeURIComponent("profile_nickname account_email");
  } else {
    url = "https://nid.naver.com/oauth2.0/authorize?response_type=code"
        + "&client_id=" + encodeURIComponent(CONFIG.naver.clientId)
        + "&redirect_uri=" + ru + "&state=" + state;
  }
  location.href = url;                                // 같은 웹뷰 안에서 이동 → 돌아옴
}

/* 돌아왔을 때 (?code=…&state=…) 처리 */
async function handleOAuthReturn() {
  const qs = new URLSearchParams(location.search);
  const code = qs.get("code"), state = qs.get("state"), err = qs.get("error");
  if (!code && !err) return false;
  if (!auth) { toast("서버 연결을 확인해 주세요."); return true; }

  let provider = "", saved = "";
  try {
    provider = sessionStorage.getItem("caro_oauth_provider") || "";
    saved    = sessionStorage.getItem("caro_oauth_state") || "";
    sessionStorage.removeItem("caro_oauth_provider");
    sessionStorage.removeItem("caro_oauth_state");
  } catch (e) {}

  /* 주소창 정리 (뒤로가기로 code 재사용 방지) */
  try { history.replaceState({}, "", location.pathname); } catch (e) {}

  if (err) { toast("로그인이 취소되었습니다."); return true; }
  if (!provider || state !== saved) { toast("로그인 요청이 만료되었습니다. 다시 시도해 주세요."); return true; }

  const label = provider === "kakao" ? "카카오" : "네이버";
  toast(label + " 계정 확인 중…");
  try {
    const call = httpsCallable(fns(), provider === "kakao" ? "kakaoLogin" : "naverLogin");
    const res  = await call({ code, redirectUri: redirectUri(), state });
    const { token, profile } = res.data || {};
    if (!token) throw new Error("no-token");

    const cred = await signInWithCustomToken(auth, token);
    const user = cred.user;
    const id   = (profile && profile.id) || user.email || (provider + ":" + user.uid);
    const name = (profile && profile.name) || user.displayName || (label + " 회원");

    if (typeof window.caroFinishLogin === "function") {
      window.caroFinishLogin(id, user.uid, name, profile && profile.email || "");
    } else if (typeof window.goTo === "function") {
      window.goTo("home-screen", true);
    }
    toast(profile && profile.isNew ? label + " 계정으로 가입되었습니다." : label + " 로그인 완료");
  } catch (e) {
    console.error("[caro-auth] oauth", e);
    const c = e.code || "";
    const msg = /not-found/.test(c) ? label + " 로그인 서버(Cloud Functions)가 아직 배포되지 않았습니다."
              : /unauthenticated|permission/.test(c) ? "인증에 실패했습니다. 다시 시도해 주세요."
              : /failed-precondition/.test(c) ? (e.message || "설정이 완료되지 않았습니다.")
              : label + " 로그인 중 오류가 발생했습니다.";
    toast(msg);
  }
  return true;
}

/* ═══════════════════════════════════════════════════════════════
   ④ PASS 본인인증 (PortOne 본인인증)
   ═══════════════════════════════════════════════════════════════ */
function loadScript(src) {
  return new Promise((ok, no) => {
    if (document.querySelector('script[src="' + src + '"]')) return ok();
    const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = no;
    document.head.appendChild(s);
  });
}

async function caroPassAuth() {
  if (!auth) return noAuth();
  if (!CONFIG.pass.enabled || !CONFIG.pass.impCode) {
    /* 본인확인 계약 전: 문자 인증으로 대체 */
    if (CONFIG.phoneAuth) return caroSendSms();
    return null;                                      // 호출자가 기존 흐름 계속
  }
  try {
    await loadScript("https://cdn.iamport.kr/v1/iamport.js");
    const IMP = window.IMP; IMP.init(CONFIG.pass.impCode);
    const phone = val("su-phone").replace(/\D/g, "");
    const merchant_uid = "caro_cert_" + Date.now();
    modalShow("PASS 앱에서 본인인증을 진행해 주세요…", { spinner: true });

    IMP.certification(
      { merchant_uid, phone: phone || undefined, popup: false, m_redirect_url: redirectUri() + "?cert=1" },
      async (rsp) => {
        if (!rsp.success) { modalHide(); toast("본인인증이 취소되었습니다."); return; }
        try {
          const call = httpsCallable(fns(), "verifyCertification");
          const res  = await call({ imp_uid: rsp.imp_uid });
          const c = res.data || {};
          /* 인증된 실명·생년월일·휴대폰으로 입력칸 채움 (사용자가 다르게 적었으면 덮어씀) */
          if (c.name  && $("su-name"))  $("su-name").value  = c.name;
          if (c.birth && $("su-birth")) $("su-birth").value = c.birth;
          if (c.phone && $("su-phone")) $("su-phone").value = c.phone;
          window._smsVerifiedPhone = c.phone || phone;
          window._caroCertCI = c.ci || "";
          window._caroPhoneVerified = true;
          if (typeof window.completePassAuth === "function") window.completePassAuth();
        } catch (e) {
          modalHide();
          toast(/not-found/.test(e.code || "") ? "본인인증 검증 서버가 아직 배포되지 않았습니다." : "본인인증 검증에 실패했습니다.");
          console.error("[caro-auth] cert verify", e);
        }
      }
    );
  } catch (e) {
    modalHide(); toast("본인인증 모듈을 불러오지 못했습니다.");
    console.error("[caro-auth] pass", e);
  }
}

/* openPassAuth() 진입점 — PASS 우선, 없으면 문자, 둘 다 꺼져 있으면 null(기존 흐름) */
function caroStartVerification() {
  if (CONFIG.pass.enabled)  return caroPassAuth();
  if (CONFIG.phoneAuth)     return caroSendSms();
  return null;
}

/* ───────────── 전역 노출 (script.js 가 호출) ───────────── */
window.caroSendSms            = caroSendSms;
window.caroVerifySms          = caroVerifySms;
window.caroCreateOrLink       = caroCreateOrLink;
window.caroAbortPhone         = caroAbortPhone;
window.caroSocialLogin        = caroSocialLogin;
window.caroPassAuth           = caroPassAuth;
window.caroStartVerification  = caroStartVerification;
window.caroAuthActive         = () => !!(CONFIG.phoneAuth || CONFIG.pass.enabled);
window.caroHasPendingSms      = () => !!_confirm;

/* 기존 취소 버튼에 세션 정리 연결 */
if (typeof window.cancelPassAuth === "function" && !window.cancelPassAuth.__caro) {
  const orig = window.cancelPassAuth;
  window.cancelPassAuth = function () { caroAbortPhone(); return orig.apply(this, arguments); };
  window.cancelPassAuth.__caro = true;
}

/* 앱 준비 후 OAuth 복귀 처리 */
const boot = () => setTimeout(() => { handleOAuthReturn().catch(console.error); }, 400);
if (document.readyState === "complete") boot(); else window.addEventListener("load", boot);

console.log("[caro-auth] 로드됨 — phone:" + CONFIG.phoneAuth + " kakao:" + CONFIG.kakao.enabled
          + " naver:" + CONFIG.naver.enabled + " pass:" + CONFIG.pass.enabled
          + " | redirect_uri = " + redirectUri());
