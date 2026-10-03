/* ═══════════════════════════════════════════════════════════════
   caro-launch.js — ★[23차] 실서비스 준비 보강 (2026-10)
   ───────────────────────────────────────────────────────────────
   ① 비밀번호 변경: 현재 비밀번호로 재인증 → 새 비밀번호 적용 (예전엔 '변경됨' 안내만)
   ② 대체 주차 신고: 설명+사진을 support_inquiries 에 실제로 남긴다 (예전엔 버려짐)
   ③ 고객센터 번호: 화면 어디든 옛 자리표시 번호(1588-0000)가 남아 있으면 설정값으로 바꾼다
   ④ 멤버십·월렌트·BIZ 문의처럼 결제/접수가 아직 연결되지 않은 버튼은 '결제되었습니다' 같은 거짓 안내 대신
      '준비 중' 으로 솔직하게 안내한다
   ⑤ 미납 결제 복귀(?payment=ret_success)는 caro-secure.js 가 confirmPayment 로 처리 — 여기서는 안내만 보강
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroLaunchLoaded) return; window.__caroLaunchLoaded=true;
  var CFG=window.CARO_CONFIG||{};
  var PHONE=CFG.supportPhone||'010-6872-9807';
  function toast(m){ try{ if(typeof window.showToast==='function') return window.showToast(m); }catch(e){} try{ alert(m); }catch(e){} }

  /* ── ① 비밀번호 변경 ── */
  window.caroChangePassword=function(currentPw, newPw){
    return new Promise(function(res){
      try{
        var fn=window.FB_FN, auth=window.FB_AUTH, u=auth&&auth.currentUser;
        if(!fn||!u||!u.email){ res('로그인 상태를 확인할 수 없습니다. 다시 로그인해 주세요.'); return; }
        if(!fn.updatePassword||!fn.reauthenticateWithCredential||!fn.EmailAuthProvider){ res('앱을 최신 버전으로 새로고침한 뒤 다시 시도해 주세요.'); return; }
        var cred=fn.EmailAuthProvider.credential(u.email, currentPw);
        fn.reauthenticateWithCredential(u, cred)
          .then(function(){ return fn.updatePassword(u, newPw); })
          .then(function(){ res(true); })
          .catch(function(e){
            var c=(e&&e.code)||'';
            if(/wrong-password|invalid-credential|invalid-login/.test(c)) res('현재 비밀번호가 올바르지 않습니다');
            else if(/weak-password/.test(c)) res('새 비밀번호가 너무 약합니다 (8자 이상, 영문·숫자 조합)');
            else if(/too-many-requests/.test(c)) res('시도가 너무 많습니다. 잠시 후 다시 시도해 주세요');
            else if(/requires-recent-login/.test(c)) res('보안을 위해 다시 로그인한 뒤 변경해 주세요');
            else res('비밀번호 변경에 실패했습니다 ('+c+')');
          });
      }catch(e){ res('비밀번호 변경에 실패했습니다'); }
    });
  };

  /* ── ② 대체 주차 신고 기록 ── */
  function shrink(dataUrl, max){
    return new Promise(function(res){
      try{
        var img=new Image();
        img.onload=function(){
          var w=img.width,h=img.height,sc=Math.min(1,max/Math.max(w,h));
          var c=document.createElement('canvas'); c.width=Math.round(w*sc); c.height=Math.round(h*sc);
          c.getContext('2d').drawImage(img,0,0,c.width,c.height);
          res(c.toDataURL('image/jpeg',0.5));
        };
        img.onerror=function(){ res(''); };
        img.src=dataUrl;
      }catch(e){ res(''); }
    });
  }
  window.caroSaveAltPark=function(desc, photos){
    try{
      var fn=window.FB_FN, db=window.FB_DB, u=window.FB_AUTH&&window.FB_AUTH.currentUser;
      if(!fn||!db||!u||!fn.setDoc||!fn.doc) return;
      var r=null; try{ var i=window.ctrlResIdx; if(typeof i==='number'&&i>=0&&window.myReservations) r=window.myReservations[i]; }catch(e){}
      Promise.all((photos||[]).slice(0,3).map(function(p){ return shrink(p, 800); })).then(function(imgs){
        imgs=imgs.filter(Boolean);
        var id='ALT-'+Date.now().toString().slice(-8)+Math.random().toString(36).slice(2,5).toUpperCase();
        return fn.setDoc(fn.doc(db,'support_inquiries',id),{
          id:id, userId:u.uid, userEmail:u.email||'', userName:(window.userInfo&&(userInfo.name||userInfo.id))||'',
          category:'대체 주차 신고', subject:'대체 주차 신고 — '+(r&&r.car&&r.car.name||'차량')+(r&&r.bookNo?' ('+r.bookNo+')':''),
          message:desc||'', bookNo:(r&&r.bookNo)||'', carName:(r&&r.car&&r.car.name)||'', photos:imgs,
          status:'new', createdAt:new Date().toISOString(), ts:Date.now(), source:'alt_park'
        });
      }).catch(function(e){ console.warn('[caro-launch] 대체주차 기록 실패', e&&e.code||e); });
    }catch(e){}
  };

  /* ── ③ 고객센터 번호 자리표시 교체 ── */
  function fixPhoneText(root){
    try{
      var walker=document.createTreeWalker(root||document.body, NodeFilter.SHOW_TEXT, null);
      var n, list=[];
      while((n=walker.nextNode())){ if(n.nodeValue && n.nodeValue.indexOf('1588-0000')>=0) list.push(n); }
      list.forEach(function(t){ t.nodeValue=t.nodeValue.split('1588-0000').join(PHONE); });
      document.querySelectorAll('a[href*="1588-0000"]').forEach(function(a){ a.setAttribute('href', a.getAttribute('href').split('1588-0000').join(PHONE)); });
    }catch(e){}
  }
  function boot(){ fixPhoneText(); [800,2500,6000].forEach(function(t){ setTimeout(function(){ fixPhoneText(); }, t); }); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  var _goTo=window.goTo;
  if(typeof _goTo==='function' && !_goTo.__caroLaunch){
    var wrapped=function(){ var r=_goTo.apply(this,arguments); setTimeout(function(){ fixPhoneText(); },120); return r; };
    wrapped.__caroLaunch=true; window.goTo=wrapped;
  }

  /* ── ④ 준비 중인 기능의 거짓 안내 차단 ── */
  var HONEST=[
    { re:/가입 완료 · .*결제되었습니다|가입 완료.*원 결제/, msg:'멤버십 정기 결제는 준비 중입니다. 오픈되면 공지로 안내드릴게요' },
    { re:/대기 신청이 접수되었습니다|영업일 1~2일 내 담당자/, msg:'BIZ 멤버십 문의는 고객센터('+PHONE+')로 연락해 주세요 (앱 접수는 준비 중)' },
    { re:/^신청 정보 확인|월렌트.*신청/, msg:'월렌트 신청은 준비 중입니다. 고객센터('+PHONE+')로 문의해 주세요' },
    { re:/사고 신고가 접수되었습니다\.?$/, msg:'사고 신고는 차량 제어 메뉴의 [사고 신고]에서 사진과 함께 접수해 주세요' }
  ];
  function hookToast(){
    var orig=window.showToast;
    if(typeof orig!=='function'||orig.__caroHonest) return false;
    var h=function(m){
      try{ var t=String(m==null?'':m); for(var i=0;i<HONEST.length;i++){ if(HONEST[i].re.test(t)){ return orig.call(this, HONEST[i].msg); } } }catch(e){}
      return orig.apply(this, arguments);
    };
    h.__caroHonest=true; window.showToast=h; return true;
  }
  if(!hookToast()){ var ht=0, hiv=setInterval(function(){ if(hookToast()||++ht>40) clearInterval(hiv); }, 250); }

  /* ── ⑤ 미납 결제 복귀 안내 (caro-secure 가 confirmPayment 처리) ── */
  try{
    var q=new URLSearchParams(location.search);
    if(q.get('payment')==='ret_success'){ setTimeout(function(){ toast('미납 정산 결제를 확인하고 있습니다…'); }, 400); }
  }catch(e){}

  console.log('[caro-launch] ✅ 실서비스 준비 보강 로드');
})();
