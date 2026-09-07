/* ════════════════════════════════════════════════════════════
   CARO SYNC FIX v1 — 데이터 영속화 · 뒤로가기 · 추가운전자
   ────────────────────────────────────────────────────────────
   ① localStorage ↔ Firestore 자동 미러
      - 카드/면허/크레딧/쿠폰/요금제 등 기기에만 저장되던 데이터를
        users/{uid} 문서에 자동 백업하고, 로그인 시 자동 복원.
      - 새로고침·로그아웃·기기 변경 후에도 데이터 유지.
   ② 안드로이드 시스템 뒤로가기 버튼 지원 (화면 이력 연동)
   ③ 추가운전자 등록 (구 동승운전자) — 면허 형식 검증 포함
   ════════════════════════════════════════════════════════════ */
(function(){
'use strict';

/* ═══ 1. localStorage ↔ Firestore 미러 ═══
   ★ [v101] 범위 축소 + 삭제 반영 + 로그아웃 보호
   ─ 예전엔 예약 캐시(caro_data_*)·결제 임시값(caro_pay_*)·차량 캐시까지 미러해서, 재설치 후 옛 예약 캐시가
     서버에서 되살아나 다음 실행 때 서버 예약을 덮어쓰는 고리를 만들었다. 이제 '기기에만 있는 계정 설정'만 미러한다.
   ─ 카드(caro_apd_cards)는 카드 모듈이 users.cards 로 따로 동기화하므로 미러에서 제외 (두 경로가 서로 되살리던 문제).
   ─ 미납(caro_apd_unpaid)은 서버 unpaid_debts 가 진실이므로 제외.
   ─ removeItem(삭제)도 기록해(tombstone) 다른 기기·재설치에서 지운 항목이 되살아나지 않게 한다.
   ─ 로그아웃 중(__caroLoggingOut / __caroSilentStorage)에는 기록·전송하지 않는다. */
var MIRROR_RE=/^caro_(apd_credit|apd_credit_history|apd_coupons|apd_sns|apd_plan|apd_notif|apd_phone|apd_phone_full|license|license_registered|plan_v1|extra_driver)$/;
var SKIP_RE=/(pw|ai_key|auto_login|saved_id|auto_id|auto_name|android_banner)/;
var TS_KEY='caro_mirror_ts';
var pushTimer=null, pulling=false, blocked=false;

function uid(){ try{ return (window.FB_AUTH&&window.FB_AUTH.currentUser)?window.FB_AUTH.currentUser.uid:null; }catch(e){ return null; } }
function fbOK(){ return !!(window.FB_DB&&window.FB_FN&&window.FB_FN.setDoc&&window.FB_FN.doc&&window.FB_FN.getDoc); }
function tsMap(){ try{ return JSON.parse(localStorage.getItem(TS_KEY)||'{}'); }catch(e){ return {}; } }
function setTs(k,t){ try{ var m=tsMap(); m[k]=t; localStorage.setItem(TS_KEY,JSON.stringify(m)); }catch(e){} }
function silent(){ return !!(window.__caroSilentStorage||window.__caroLoggingOut); }

function collect(){
  var out={}, m=tsMap();
  try{
    for(var i=0;i<localStorage.length;i++){
      var k=localStorage.key(i);
      if(!MIRROR_RE.test(k)||SKIP_RE.test(k)) continue;
      var v=localStorage.getItem(k);
      if(v==null||v.length>180000) continue;   /* Firestore 문서 1MB 제한 보호 */
      out[k]={v:v,t:m[k]||Date.now()};
    }
    /* 삭제 표시(tombstone): 타임스탬프는 있는데 값이 없는 키 */
    Object.keys(m).forEach(function(k){
      if(!MIRROR_RE.test(k)||SKIP_RE.test(k)||out[k]) return;
      var has=null; try{ has=localStorage.getItem(k); }catch(e){}
      if(has==null) out[k]={v:null,t:m[k]};
    });
  }catch(e){}
  return out;
}

function push(){
  var u=uid(); if(!u||!fbOK()||pulling||blocked||silent()) return;
  var fn=window.FB_FN, db=window.FB_DB;
  var data=collect();
  if(!Object.keys(data).length) return;
  fn.setDoc(fn.doc(db,'users',u),{ caroMirror:data, caroMirrorAt:Date.now() },{merge:true})
    .then(function(){ console.log('☁️ 내 설정 서버 백업 완료 ('+Object.keys(data).length+'개)'); })
    .catch(function(e){ console.warn('☁️ 서버 백업 실패:',e&&e.code); });
}
function schedulePush(){ if(silent()) return; if(pushTimer)clearTimeout(pushTimer); pushTimer=setTimeout(push,1500); }

window.caroSyncPush=push;
window.caroSyncCancel=function(){ if(pushTimer){ clearTimeout(pushTimer); pushTimer=null; } blocked=true; };   /* 로그아웃 직전 호출 */
window.caroSyncPull=function(u){
  if(!u||!fbOK()) return Promise.resolve(false);
  var fn=window.FB_FN, db=window.FB_DB;
  pulling=true;
  return fn.getDoc(fn.doc(db,'users',u)).then(function(snap){
    pulling=false;
    if(!snap||typeof snap.data!=='function') return false;
    var d=snap.data(); if(!d||!d.caroMirror) return false;
    var mir=d.caroMirror, m=tsMap(), applied=0;
    window.__caroSilentStorage=true;   /* 복원 중 setItem/removeItem 은 다시 서버로 올리지 않음 */
    try{
      Object.keys(mir).forEach(function(k){
        if(!MIRROR_RE.test(k)||SKIP_RE.test(k)) return;
        var srv=mir[k]; if(!srv||typeof srv!=='object') return;
        var localT=m[k]||0;
        var has=null;
        try{ has=localStorage.getItem(k); }catch(e){}
        if(srv.v===null){                                   /* 서버의 삭제 표시 */
          if(has!=null && (srv.t||0)>localT){ try{ localStorage.removeItem(k); setTs(k,srv.t||Date.now()); applied++; }catch(e){} }
          return;
        }
        if(typeof srv.v!=='string') return;
        if(has==null || (srv.t||0)>localT){
          try{ localStorage.setItem(k,srv.v); setTs(k,srv.t||Date.now()); applied++; }catch(e){}
        }
      });
    }finally{ window.__caroSilentStorage=false; }
    if(applied>0){
      console.log('☁️ 서버에서 내 설정 복원: '+applied+'개');
      ['renderMyReservations','renderUsageHistory','renderCars','updateMapMarkers','renderPaymentInfoScreen','renderPICardList'].forEach(function(f){
        try{ if(typeof window[f]==='function') window[f](); }catch(e){}
      });
      try{ if(window.__caroRR) window.__caroRR(); }catch(e){}
      try{ document.dispatchEvent(new CustomEvent('caro-sync-applied')); }catch(e){}
    }
    return applied>0;
  }).catch(function(e){ pulling=false; console.warn('☁️ 서버 복원 실패:',e&&e.code); return false; });
};

/* localStorage 쓰기·삭제를 감지해 자동으로 서버 백업 예약 */
try{
  var _set=Storage.prototype.setItem, _rm=Storage.prototype.removeItem;
  Storage.prototype.setItem=function(k,v){
    _set.apply(this,arguments);
    try{
      if(this===window.localStorage && MIRROR_RE.test(k) && !SKIP_RE.test(k) && !silent()){
        setTs(k,Date.now()); schedulePush();
      }
    }catch(e){}
  };
  Storage.prototype.removeItem=function(k){
    _rm.apply(this,arguments);
    try{
      if(this===window.localStorage && MIRROR_RE.test(k) && !SKIP_RE.test(k) && !silent()){
        setTs(k,Date.now()); schedulePush();
      }
    }catch(e){}
  };
}catch(e){}

/* 로그인(세션 복원) 시 자동 복원 + 앱 숨김/종료 직전 마지막 백업 — ★ [v101] caroOnAuth (시간 제한 없음) */
(function(){
  function onAuth(u){
    if(u){ blocked=false; setTimeout(function(){ if(uid()===u.uid) window.caroSyncPull(u.uid); },300); }
    else { blocked=true; if(pushTimer){ clearTimeout(pushTimer); pushTimer=null; } }
  }
  if(window.caroOnAuth) window.caroOnAuth(onAuth);
  else { var t=setInterval(function(){ if(window.caroOnAuth){ clearInterval(t); window.caroOnAuth(onAuth); } },250); setTimeout(function(){ clearInterval(t); },60000); }
})();
document.addEventListener('visibilitychange',function(){ if(document.visibilityState==='hidden') push(); });
window.addEventListener('beforeunload',push);

/* ═══ 2. 안드로이드 시스템 뒤로가기 ═══
   화면(.screen.active)이 바뀔 때마다 브라우저 이력을 쌓아,
   시스템 뒤로가기 → popstate → 기존 _backMap 내비게이션이 동작하게 함. */
(function(){
  var lastScreen=null, popping=false;
  window.addEventListener('popstate',function(){ popping=true; setTimeout(function(){ popping=false; },700); });
  setInterval(function(){
    var s=document.querySelector('.screen.active');
    var cur=s?s.id:null;
    if(cur&&cur!==lastScreen){
      if(!popping&&lastScreen!==null){
        try{ history.pushState({screen:cur},'',''); }catch(e){}
      }
      lastScreen=cur;
    }
  },300);
})();

/* ═══ 3. 추가운전자 등록 (구 동승운전자) ═══ */
window.caroOpenExtraDriver=function(){
  var old=document.getElementById('caro-xdrv-ov'); if(old) old.remove();
  var saved=null;
  try{ saved=JSON.parse(localStorage.getItem('caro_extra_driver')||'null'); }catch(e){}
  var ov=document.createElement('div');
  ov.id='caro-xdrv-ov';
  ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:99999;display:flex;align-items:flex-end;justify-content:center;';
  ov.innerHTML=
    '<div style="background:#fff;width:100%;max-width:520px;border-radius:18px 18px 0 0;padding:22px 20px calc(26px + var(--sab,0px));box-shadow:0 -6px 30px rgba(0,0,0,.18);font-family:inherit;max-height:calc(100vh - 40px);overflow-y:auto;box-sizing:border-box;">'
    +'<div style="font-size:1.05rem;font-weight:700;margin-bottom:4px;">추가운전자 등록</div>'
    +'<div style="font-size:.8rem;color:#777;margin-bottom:14px;">대여자 외 1명까지 등록할 수 있어요. 추가운전자도 면허 정보 확인이 필요합니다.</div>'
    +'<label style="font-size:.75rem;color:#555;">이름</label>'
    +'<input id="xdrv-name" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 10px;font-size:.9rem;" placeholder="홍길동" value="'+(saved&&saved.name?saved.name:'')+'">'
    +'<label style="font-size:.75rem;color:#555;">생년월일 (6자리)</label>'
    +'<input id="xdrv-birth" inputmode="numeric" maxlength="6" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 10px;font-size:.9rem;" placeholder="900101" value="'+(saved&&saved.birth?saved.birth:'')+'">'
    +'<label style="font-size:.75rem;color:#555;">운전면허번호</label>'
    +'<input id="xdrv-lic" inputmode="numeric" maxlength="15" style="width:100%;padding:11px;border:1px solid #ddd;border-radius:9px;margin:4px 0 4px;font-size:.9rem;" placeholder="12-34-567890-12" value="'+(saved&&saved.license?saved.license:'')+'">'
    +'<div style="font-size:.72rem;color:#999;margin-bottom:14px;line-height:1.5;word-break:keep-all;">형식: 2-2-6-2 자리 (지역코드-연도-일련번호-체크)</div>'
    +'<div style="display:flex;gap:9px;">'
    +'<button id="xdrv-cancel" style="flex:1;padding:13px;border:1px solid #ddd;background:#fff;border-radius:10px;font-size:.9rem;">닫기</button>'
    +'<button id="xdrv-save" style="flex:2;padding:13px;border:none;background:#111;color:#fff;border-radius:10px;font-size:.9rem;font-weight:600;">등록하기</button>'
    +'</div></div>';
  document.body.appendChild(ov);
  var toast=function(m){ if(window.showToast) showToast(m); else alert(m); };
  ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
  document.getElementById('xdrv-cancel').onclick=function(){ ov.remove(); };
  document.getElementById('xdrv-lic').addEventListener('input',function(){
    var v=this.value.replace(/\D/g,'').slice(0,12), out='';
    if(v.length>0) out=v.slice(0,2);
    if(v.length>2) out+='-'+v.slice(2,4);
    if(v.length>4) out+='-'+v.slice(4,10);
    if(v.length>10) out+='-'+v.slice(10,12);
    this.value=out;
  });
  document.getElementById('xdrv-save').onclick=function(){
    var name=document.getElementById('xdrv-name').value.trim();
    var birth=document.getElementById('xdrv-birth').value.trim();
    var lic=document.getElementById('xdrv-lic').value.trim();
    if(!name){ toast('이름을 입력해 주세요.'); return; }
    if(!/^\d{6}$/.test(birth)){ toast('생년월일 6자리를 입력해 주세요.'); return; }
    /* ★ 면허 진위확인 프레임 사용 (연동 전엔 형식 검증, 승인 후 자동 실검증) */
    window.caroVerifyLicense({name:name,birth:birth,license:lic}).then(function(vr){
      if(!vr.ok){ toast(vr.msg||'면허 정보를 확인해 주세요.'); return; }
      var data={name:name,birth:birth,license:lic,verified:!!vr.verified,pendingVerify:!!vr.pending,at:Date.now()};
      try{ localStorage.setItem('caro_extra_driver',JSON.stringify(data)); }catch(e){}
      try{
        var u=uid();
        if(u&&fbOK()){
          window.FB_FN.setDoc(window.FB_FN.doc(window.FB_DB,'users',u),{extraDriver:data},{merge:true});
        }
      }catch(e){}
      ov.remove();
      toast(vr.verified?'✅ 추가운전자 등록 완료 — 진위확인 완료':'✅ 추가운전자 등록 완료 — '+(vr.msg||'형식 확인됨'));
    });
  };
};

/* ═══ 4. 운전면허 진위확인 프레임 ═══
   지금은 '형식 검증'만 수행. 기관(도로교통공단 등) API 사용 허가가 나면
   아래 CARO_LICENSE_API 세 값만 채우면 실제 진위확인이 자동 활성화됨. */
window.CARO_LICENSE_API={
  enabled:false,   /* ★ 허가 후 true 로 변경 */
  endpoint:'',     /* ★ 승인받은 진위확인 API 주소 */
  apiKey:''        /* ★ 발급받은 API 키 */
};
window.caroVerifyLicense=function(o){
  o=o||{};
  var lic=String(o.license||'').trim();
  var name=String(o.name||'').trim();
  var birth=String(o.birth||'').trim();
  /* 1단계: 형식 검증 (2-2-6-2) */
  if(!/^\d{2}-\d{2}-\d{6}-\d{2}$/.test(lic)){
    return Promise.resolve({ok:false, verified:false, reason:'format', msg:'면허번호 형식이 올바르지 않습니다. (예: 12-34-567890-12)'});
  }
  var api=window.CARO_LICENSE_API;
  /* 2단계: 기관 연동 전 — 형식 확인만 하고 '대기' 상태로 통과 */
  if(!api.enabled||!api.endpoint){
    return Promise.resolve({ok:true, verified:false, pending:true, msg:'면허 형식 확인 완료 · 기관 진위확인은 연동 승인 후 자동 적용됩니다.'});
  }
  /* 3단계: 기관 연동 후 — 실제 진위확인 호출 */
  return fetch(api.endpoint,{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+api.apiKey},
    body:JSON.stringify({name:name,birth:birth,licenseNo:lic})
  }).then(function(r){ return r.json(); })
    .then(function(d){
      var okRes=!!(d&&(d.valid===true||d.result==='VALID'||d.status==='valid'));
      return okRes
        ? {ok:true, verified:true, msg:'✅ 면허 진위확인 완료'}
        : {ok:false, verified:false, reason:'invalid', msg:'면허 진위확인에 실패했습니다. 정보를 다시 확인해 주세요.'};
    })
    .catch(function(){ return {ok:true, verified:false, pending:true, msg:'진위확인 서버에 연결하지 못했습니다. 형식 확인만 완료된 상태로 저장합니다.'}; });
};

/* ═══ 6. 뒤로 버튼 전체 통일 (B안 규격) ═══
   프로그램의 모든 뒤로 버튼을 예약확인 화면(B안)과 동일한 모양·크기로 강제 통일.
   대상: back-bottom-btn(로그인·회원가입·아이디찾기·이용안내·블랙라벨·예약·고객센터 등)
        / mpn-back-btn·mpd-back-btn(마이페이지) / caro-mr-backbtm(월렌트)
        / nh-ev-back(이벤트) / nh-wallet-back-btm(지갑) / payment-back-btn(결제) */
(function(){
  var SEL='.back-bottom-btn,.mpn-back-btn,.mpd-back-btn,.caro-mr-backbtm,.nh-ev-back,.nh-wallet-back-btm,.payment-back-btn';
  /* 결제하기(res-submit-btn)와 완전히 동일한 규격:
     width:100% · padding:16px · border-radius:var(--r) · font-size:1rem · font-weight:800 · height auto */
  var B='position:relative!important;z-index:2!important;display:block!important;flex:none!important;'
   +'width:100%!important;max-width:none!important;height:auto!important;min-height:0!important;'
   +'padding:16px!important;margin:12px 0 calc(20px + var(--sab,0px))!important;box-sizing:border-box!important;'
   +'inset:auto!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;'
   +'background:var(--accent,#18191c)!important;color:#fff!important;border:0!important;border-radius:var(--r,16px)!important;'
   +'font-family:inherit!important;font-weight:800!important;font-size:1rem!important;line-height:normal!important;'
   +'text-align:center!important;letter-spacing:0!important;'
   +'box-shadow:0 6px 18px -8px rgba(24,25,28,.42)!important;cursor:pointer!important;';
  var css=SEL+'{'+B+'}'
    /* ID 셀렉터(!important) 규칙보다 우선해야 하는 예외들 */
   +'#login-screen .back-bottom-btn,#black-label-screen .back-bottom-btn,.bl-mode .back-bottom-btn,#event-screen .nh-ev-back,#nh-wallet-screen .nh-wallet-back-btm{'+B+'}'
    /* 좌우 여백 없는 화면(예약확인·마이페이지 등)은 18px 인셋 부여 → 결제하기와 동일한 좌우 정렬 */
   +'#my-reservation-screen>.back-bottom-btn,#mypage-screen .mpn-back-btn,#mypage-screen>.back-bottom-btn{width:calc(100% - 36px)!important;margin-left:18px!important;margin-right:18px!important;}'
   +SEL.split(',').map(function(s){return s+':hover';}).join(',')+'{background:var(--accent,#18191c)!important;color:#fff!important;border:0!important;filter:brightness(1.1);}'
    /* 옛 고정버튼용 하단 여백·바 정리 */
   +'#event-screen .ev-body{padding-bottom:12px!important;}'
   +'#nh-wallet-screen .nh-wallet-body{padding-bottom:12px!important;}'
   +'.caro-mr-body{padding-bottom:14px!important;}'
   +'.mpd-footer{background:none!important;border-top:0!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;padding:0!important;}';
  function inject(){
    var st=document.getElementById('caro-back-unify-css');
    if(!st){ st=document.createElement('style'); st.id='caro-back-unify-css'; st.textContent=css; }
    (document.head||document.documentElement).appendChild(st); /* 항상 마지막 스타일로 유지 → 최우선 적용 */
  }
  inject();
  function normalize(){
    try{
      inject();
      /* 월렌트 리스트/상세: 버튼을 스크롤 본문 맨 아래로 이동 (B안: 마지막 카드 바로 아래) */
      ['caro-mr-ov','caro-mrd-ov'].forEach(function(id){
        var ov=document.getElementById(id); if(!ov) return;
        var btn=null;
        for(var i=0;i<ov.children.length;i++){
          var c=ov.children[i];
          if(c.classList && c.classList.contains('caro-mr-backbtm')){ btn=c; break; }
        }
        var body=ov.querySelector('.caro-mr-body');
        if(btn && body && btn.parentNode!==body) body.appendChild(btn);
      });
      /* 개별 인라인 스타일 제거(결제 뒤로 등) + 문구 '← 뒤로'로 통일 */
      var list=document.querySelectorAll(SEL);
      for(var i=0;i<list.length;i++){
        var b=list[i];
        if(b.getAttribute('style')) b.removeAttribute('style');
        var t=b.textContent.trim();
        if(/뒤로/.test(t)){ /* '취소' 등 다른 용도 버튼은 문구 유지 */
          if(b.getAttribute('data-i18n')) b.removeAttribute('data-i18n');
          if(t!=='← 뒤로') b.textContent='← 뒤로';
        }
      }
    }catch(e){}
  }
  normalize();
  setTimeout(normalize,800); setTimeout(normalize,2000); setTimeout(normalize,3500);
  try{
    var _t=null;
    var mo=new MutationObserver(function(){
      if(_t) return;
      _t=setTimeout(function(){ _t=null; normalize(); },150);
    });
    mo.observe(document.body||document.documentElement,{childList:true,subtree:true});
  }catch(e){}
  console.log('🔙 뒤로 버튼 전체 통일(B안) 적용');
})();

console.log('🔧 CARO SYNC FIX v1 로드됨 — 데이터 영속화·뒤로가기·추가운전자·면허검증 활성');
})();
