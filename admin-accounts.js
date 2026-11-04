/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 계정 · 권한 관리 v2
   ───────────────────────────────────────────────────────────
   · 직원 계정 = 입사 시 만든 이메일(아이디)에 권한 부여
   · 권한 항목: 차량 관리 / 요금 관리 / 공지·이벤트 / 예약 관리
   · 활성(재직)/정지 토글, 권한 수정, 삭제
   · Firestore admin_accounts/{이메일} 문서에 저장
   · CAROMOBILITY(최고관리자) = 모든 권한
   적용: admin.html, admin-settings.js 다음
     <script src="admin-accounts.js?v=2"></script>
   ※ Firestore 규칙 필요 — caro-firestore-rules.txt 참고
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var SUPER='caro.mobility.official@gmail.com';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ★[14차] onclick="f('…')" 처럼 글자가 다시 '코드' 로 읽히는 자리에는 esc 만으로는 부족하다
     (HTML 규칙상 &#39; 는 읽히는 순간 ' 로 돌아와 문자열을 끊는다) → 코드 문자열 규칙으로 먼저 막고 나서 HTML 로 막는다 */
  function jsa(s){ return esc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')); }
  /* ── 권한 정의 (차량/요금/공지·이벤트/예약) ── */
  /* ★ 권한을 화면(탭) 두 개에 맞춰 딱 둘로 단순화: 실시간 관제 / 운영 관리.
     - control → 실시간 관제 탭(위치·원격제어·층보정·진단)
     - ops     → 운영 관리 탭(요금·예약·월렌트·공지·상담·차량 등록 전부) */
  /* ★[v108] 권한을 화면 단위로 세분화: 실시간 관제 / 예약 관리 / 차량 관리 / 요금 관리 / 공지·이벤트.
     전부 체크 = 두 프로그램(관제·운영관리) 모두. 하나만 체크 = 그 탭만 보인다(admin-ops.html caroApplyPerms). */
  var PERMS=[
    {key:'control', label:'실시간 관제', sub:'실시간 위치·원격 제어(문열기·시동차단)·층 보정·기기 진단'},
    {key:'resv',    label:'예약 관리',   sub:'예약·강제반납·취소·미납·정지·회원·사고/문의·상담통계'},
    {key:'cars',    label:'차량 관리',   sub:'차량 등록·수정·점검 상태, 더블랙·월렌트 차량'},
    {key:'pricing', label:'요금 관리',   sub:'시간당 요금·km 요금·성수기/주말 요금'},
    {key:'notices', label:'공지·이벤트', sub:'공지·이벤트 등록·삭제'}
  ];
  var PILL={control:'관제',resv:'예약',cars:'차량',pricing:'요금',notices:'공지'};

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    '#tab-set .grid{align-items:stretch;}'
    +'#tab-set .card{height:100%;display:flex;flex-direction:column;}'
    +'#tab-set .card .panel-body{flex:1;}'
    +'.acct2{display:flex;align-items:flex-start;gap:11px;padding:12px 13px;border:1px solid var(--border);'
    +'border-radius:11px;margin-bottom:9px;background:var(--panel2);}'
    +'.acct2.off{opacity:.55;}'
    +'.acct2 .av{width:30px;height:30px;border-radius:8px;background:#2a2516;color:var(--gold);'
    +'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0;}'
    +'.acct2-info{flex:1;min-width:0;}'
    +'.acct2-name{font-size:13.5px;color:var(--txt);}'
    +'.acct2-name .stat{font-size:10.5px;padding:1px 7px;border-radius:20px;margin-left:7px;vertical-align:middle;}'
    +'.acct2-name .stat.on{color:#7bb89a;border:1px solid rgba(123,184,154,.4);}'
    +'.acct2-name .stat.no{color:#d57a68;border:1px solid rgba(213,122,104,.4);}'
    +'.acct2-role{font-size:11.5px;color:var(--muted);margin-top:2px;word-break:break-all;}'
    +'.acct2-perms{display:flex;gap:5px;margin-top:7px;flex-wrap:wrap;}'
    +'.apill{font-size:10.5px;padding:2px 9px;border-radius:20px;border:1px solid var(--border2);white-space:nowrap;}'
    +'.apill.cars{color:#6aa6db;border-color:rgba(106,166,219,.4);}'
    +'.apill.pricing{color:#d9c24a;border-color:rgba(217,194,74,.4);}'
    +'.apill.notices{color:#c79be0;border-color:rgba(199,155,224,.4);}'
    +'.apill.resv{color:#7bb89a;border-color:rgba(123,184,154,.4);}'
    +'.apill.control{color:#6aa6db;border-color:rgba(106,166,219,.45);}'
    +'.apill.ops{color:#d9c24a;border-color:rgba(217,194,74,.45);}'
    +'.apill.all{color:var(--gold-soft);border-color:rgba(200,168,90,.45);}'
    +'.apill.none{color:var(--muted);}'
    +'.acct2-btns{display:flex;flex-direction:column;gap:6px;flex-shrink:0;}'
    +'.acct2-btn{background:transparent;border:1px solid var(--border2);color:var(--muted);border-radius:8px;'
    +'padding:5px 11px;font-size:11.5px;cursor:pointer;white-space:nowrap;}'
    +'.acct2-btn:hover{background:rgba(255,255,255,.05);}'
    +'.acct2-btn.del{color:#d57a68;} .acct2-btn.del:hover{background:rgba(213,122,104,.12);}'
    +'.acct2-btn.edit{color:var(--gold-soft);}'
    +'.amodal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;'
    +'justify-content:center;z-index:99999;padding:16px;}'
    +'.amodal.show{display:flex;}'
    +'.abox{background:var(--panel);border:1px solid var(--border2);border-radius:16px;'
    +'width:min(460px,94vw);max-height:90vh;overflow:auto;}'
    +'.ahd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;'
    +'border-bottom:1px solid var(--border);}'
    +'.ahd h3{margin:0;font-size:15px;color:var(--txt);}'
    +'.aclose{background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;}'
    +'.abody{padding:16px 18px 4px;}'
    +'.abody label.fld{display:block;font-size:12px;color:var(--muted);margin:13px 0 6px;}'
    +'.abody label.fld:first-child{margin-top:0;}'
    +'.abody input.txt{width:100%;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);'
    +'border-radius:9px;padding:10px 12px;font-size:13px;box-sizing:border-box;}'
    +'.abody input.txt:disabled{opacity:.6;}'
    +'.abody input.txt:focus{outline:none;border-color:var(--gold);}'
    +'.abody .hint{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.5;}'
    +'.aperms{display:flex;flex-direction:column;gap:8px;margin-top:2px;margin-bottom:6px;}'
    +'.aperm{display:flex;align-items:center;gap:11px;padding:11px 13px;border:1px solid var(--border);'
    +'border-radius:10px;background:var(--panel2);cursor:pointer;}'
    +'.aperm input{width:17px;height:17px;accent-color:#c8a85a;flex-shrink:0;cursor:pointer;}'
    +'.aperm .pt{font-size:13px;color:var(--txt);}'
    +'.aperm .ps{font-size:11px;color:var(--muted);margin-top:1px;}'
    +'.aactive{display:flex;align-items:center;gap:10px;padding:11px 13px;border:1px solid var(--border);'
    +'border-radius:10px;background:var(--panel2);cursor:pointer;margin-top:2px;}'
    +'.aactive input{width:17px;height:17px;accent-color:#7bb89a;cursor:pointer;}'
    +'.afoot{display:flex;gap:9px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border);}';
  document.head.appendChild(st);

  /* ── 모달 ── */
  var editingEmail=null;
  var modal=document.createElement('div');
  modal.className='amodal'; modal.id='acctModal';
  modal.innerHTML=
    '<div class="abox">'
    +'<div class="ahd"><h3 id="acctTtl">직원 계정 권한 부여</h3><button class="aclose" id="acctClose">✕</button></div>'
    +'<div class="abody">'
      +'<label class="fld">직원 이메일 (아이디) *</label>'
      +'<input class="txt" id="acctEmail" placeholder="예: hong@caromobility.kr" maxlength="80" autocomplete="off" />'
      +'<div class="hint">회사 메일(@caromobility.kr)을 입력하면 로그인 계정이 자동으로 만들어지고, 그 메일로 <b>비밀번호 설정 메일</b>이 갑니다. 직원은 메일에서 비밀번호를 정한 뒤 관제 프로그램에 로그인하면 됩니다.</div>'
      +'<label class="fld">직원 이름 *</label>'
      +'<input class="txt" id="acctName" placeholder="예: 이현장" maxlength="30" />'
      +'<label class="fld">역할 / 직책 (선택)</label>'
      +'<div class="role-row">'
        +'<input class="txt" id="acctRole" placeholder="예: 송도점 운영 담당" maxlength="40" />'
        +'<select class="sel" id="acctPosition">'
          +'<option value="">직책 ▼</option>'
          +'<option>매니저</option>'
          +'<option>슈퍼바이저</option>'
          +'<option>어드바이저</option>'
          +'<option>사원</option>'
          +'<option>계약직</option>'
        +'</select>'
      +'</div>'
      +'<label class="fld">접근 권한 (체크한 메뉴만 사용 가능)</label>'
      +'<div class="aperms">'
        +PERMS.map(function(p){
          return '<label class="aperm"><input type="checkbox" data-perm="'+p.key+'">'
            +'<span><div class="pt">'+p.label+'</div><div class="ps">'+p.sub+'</div></span></label>';
        }).join('')
      +'</div>'
      +'<label class="fld">계정 상태</label>'
      +'<label class="aactive"><input type="checkbox" id="acctActive" checked>'
        +'<span><div class="pt">활성 (재직 중)</div><div class="ps">끄면 로그인해도 모든 관리 권한이 차단됩니다.</div></span></label>'
    +'</div>'
    +'<div class="afoot"><button class="btn" id="acctCancel">취소</button>'
    +'<button class="btn gold" id="acctSave">저장</button></div>'
    +'</div>';
  document.body.appendChild(modal);
  /* 역할/직책 행 스타일 */
  var _rrStyle=document.createElement('style');
  _rrStyle.textContent=
    '#acctModal .role-row{display:flex;gap:8px;align-items:stretch;}'
   +'#acctModal .role-row .txt{flex:1;min-width:0;}'
   +'#acctModal .role-row select.sel{flex:0 0 120px;width:120px;cursor:pointer;'
   +'background:#1f2228;border:1px solid #34383f;color:#e9eaed;border-radius:9px;'
   +'padding:10px 9px;font-size:13px;font-family:inherit;box-sizing:border-box;}'
   +'#acctModal .role-row select.sel:focus{outline:none;border-color:#c8a96e;}';
  document.head.appendChild(_rrStyle);

  function openModal(acct){
    editingEmail = acct ? (acct.id||acct.email||null) : null;
    modal.querySelector('#acctTtl').textContent = acct ? '직원 권한 수정' : '직원 계정 권한 부여';
    var em=modal.querySelector('#acctEmail');
    em.value = acct ? (acct.email||acct.id||'') : '';
    em.disabled = !!acct;   /* 수정 시 이메일(키) 고정 */
    modal.querySelector('#acctName').value = acct ? (acct.name||'') : '';
    modal.querySelector('#acctRole').value = acct ? (acct.role||'') : '';
    var posSel=modal.querySelector('#acctPosition'); if(posSel) posSel.value = acct ? (acct.position||'') : '';
    var perms=Object.assign({},(acct&&acct.perms)||{});
    if(perms.ops) perms=Object.assign({resv:true,cars:true,pricing:true,notices:true},perms);   /* ★[v108] 옛 '운영' 권한 = 네 권한 전부 */
    modal.querySelectorAll('.aperm input').forEach(function(c){ c.checked=!!perms[c.dataset.perm]; });
    modal.querySelector('#acctActive').checked = acct ? (acct.active!==false) : true;
    modal.classList.add('show');
    setTimeout(function(){ (acct?modal.querySelector('#acctName'):em).focus(); },50);
  }
  function closeModal(){ modal.classList.remove('show'); }
  modal.querySelector('#acctClose').onclick=closeModal;
  modal.querySelector('#acctCancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });

  modal.querySelector('#acctSave').onclick=function(){
    if(!ready()){ T('Firestore 연결 대기 중입니다'); return; }
    var email=(editingEmail || modal.querySelector('#acctEmail').value.trim().toLowerCase());
    var name=modal.querySelector('#acctName').value.trim();
    var role=modal.querySelector('#acctRole').value.trim();
    var position=(modal.querySelector('#acctPosition')||{}).value||'';
    if(!email || email.indexOf('@')<0){ T('직원 이메일(아이디)을 정확히 입력하세요'); return; }
    if(!name){ T('직원 이름을 입력하세요'); return; }
    if(email===SUPER){ T('최고관리자 계정은 여기서 수정할 수 없습니다'); return; }
    var perms={};
    modal.querySelectorAll('.aperm input').forEach(function(c){ perms[c.dataset.perm]=!!c.checked; });
    perms.ops=!!(perms.resv&&perms.cars&&perms.pricing&&perms.notices);   /* ★[v108] 네 권한 전부면 옛 표기 ops 도 켜 둔다(옛 규칙·화면 호환) */
    if(!perms.control&&!perms.resv&&!perms.cars&&!perms.pricing&&!perms.notices){ T('권한을 하나 이상 선택하세요'); return; }
    var active=modal.querySelector('#acctActive').checked;
    var FN=window.FB_FN, db=window.FB_DB;
    var data={ email:email, name:name, role:role, position:position, perms:perms, active:active,
      updatedAt:(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString()) };
    if(!editingEmail) data.createdAt=(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString());
    /* ★ v100: 권한 부여는 서버(setAdminAccount → Custom Claims)가 정식 경로.
       함수가 아직 배포되지 않았으면(not-found) 예전 방식(문서 직접 쓰기)으로 폴백 */
    var viaServer = (typeof window.FB_CALL==='function')
      ? window.FB_CALL('setAdminAccount',{ email:email, name:name, perms:perms, active:active, role:role, position:position, create:!editingEmail })   /* ★[v108.4] 새 직원 + 회사 메일이면 서버가 로그인 계정 생성 */
      : Promise.reject(Object.assign(new Error('no FB_CALL'),{code:'functions/not-found'}));
    viaServer.catch(function(e){
      /* ★[v108] '해당 이메일의 계정이 없습니다'(서버가 보낸 not-found)는 폴백하지 않는다 — 예전엔 가입 안 된 이메일에도 문서를 써서 '추가됨'으로 보였다 */
      if(e && /not-found|unavailable/.test(String(e.code||'')) && !/계정/.test(String(e.message||''))){ console.warn('[계정] 서버 함수 미배포 → 직접 쓰기 폴백'); return FN.setDoc(FN.doc(db,'admin_accounts',email), data, {merge:true}); }
      throw e;
    }).then(function(r){
      if(r && r.created){ sendPwMail(email, true); }
      else T(editingEmail?'권한이 수정되었습니다':'직원 계정이 추가되었습니다');
      closeModal();
      /* 즉시 반영 (onSnapshot 기다리지 않고 바로 목록 갱신) */
      try{
        var obj={id:email, email:email, name:name, role:role, position:position, perms:perms, active:active};
        var arr=window.__caroAccts||[]; var idx=-1;
        for(var i=0;i<arr.length;i++){ if((arr[i].id||arr[i].email)===email){ idx=i; break; } }
        if(idx>=0) arr[idx]=obj; else arr.push(obj);
        arr.sort(function(x,y){ return (x.name||'').localeCompare(y.name||''); });
        window.__caroAccts=arr; render(arr);
      }catch(e){}
    }).catch(function(e){
      console.error('[계정] 저장 실패', e);
      var m=(e&&e.message)||'';
      T(/not-found/.test(String(e&&e.code||'')) && /계정이 없습니다/.test(m) ? m : ('저장 실패 — '+(m||'권한을 확인하세요')));
    });
  };

  /* ★[v108.4] 비밀번호 설정 메일 — 새 직원(자동 생성) 또는 비밀번호를 잊은 직원에게 */
  function sendPwMail(email, isNew){
    var A=window.FB_AUTH, FN=window.FB_FN;
    if(!A || !FN || typeof FN.sendPasswordResetEmail!=='function'){ T('메일을 보낼 수 없습니다 — 새로고침 후 다시 시도'); return; }
    try{ A.languageCode='ko'; }catch(e){}
    FN.sendPasswordResetEmail(A, email).then(function(){
      caroAlert((isNew?'직원 계정을 만들었습니다.\n\n':'')+email+' 로 비밀번호 설정 메일을 보냈습니다.\n직원이 메일의 링크에서 비밀번호를 정한 뒤 관제 프로그램에 로그인하면 됩니다.\n(메일이 안 보이면 스팸함 확인 · 링크는 1시간 동안 유효)');
    }).catch(function(e){ console.error(e); T('메일 발송 실패 — '+((e&&e.code)||'')+' · 잠시 후 [비밀번호 메일] 버튼으로 다시 보내세요'); });
  }
  window.acctSendPw=function(email){
    caroConfirm(email+' 로 비밀번호 설정 메일을 보낼까요?\n(직원이 새 비밀번호를 정하면 예전 비밀번호는 쓸 수 없습니다)').then(function(ok){ if(ok) sendPwMail(email,false); });
  };
  /* ★[v108.4] 2단계 인증 초기화 — 휴대폰 분실·교체 */
  window.acctResetMfa=function(email){
    caroConfirm(email+' 의 2단계 인증(휴대폰 인증 앱 등록)을 초기화할까요?\n\n휴대폰을 잃어버렸거나 바꾼 경우에만 하세요. 그 직원은 지금 로그아웃되고,\n비밀번호로 다시 로그인해 새 휴대폰으로 다시 등록해야 합니다.',{danger:true, ok:'초기화'}).then(function(ok){
      if(!ok) return;
      if(typeof window.FB_CALL!=='function'){ T('서버에 연결할 수 없습니다'); return; }
      window.FB_CALL('resetStaffMfa',{email:email}).then(function(r){
        T(r && r.had ? '2단계 인증을 초기화했습니다 — 직원에게 다시 등록하라고 알려 주세요' : '이 직원은 등록된 2단계 인증이 없었습니다');
      }).catch(function(e){ console.error(e); var c=String((e&&e.code)||''); T(/not-found/.test(c)&&!/계정|목록/.test((e&&e.message)||'') ? '서버 업데이트(firebase deploy) 후 사용할 수 있습니다' : ('초기화 실패 — '+((e&&e.message)||c))); });
    });
  };

  /* ── 삭제 / 활성 토글 ── */
  window.delAcct=function(email){
    if(!ready()) return;
    caroConfirm('이 직원 계정의 권한을 삭제할까요?\n('+email+')',{danger:true}).then(function(ok){ if(!ok) return;
    var FN=window.FB_FN, db=window.FB_DB;
    var viaServer=(typeof window.FB_CALL==='function')?window.FB_CALL('setAdminAccount',{email:email, remove:true}):Promise.reject({code:'functions/not-found'});
    viaServer.catch(function(e){ if(e && /not-found|unavailable/.test(String(e.code||'')) && !/계정/.test(String(e.message||''))) return FN.deleteDoc(FN.doc(db,'admin_accounts',email)); throw e; })
      .then(function(){ T('삭제되었습니다'); })
      .catch(function(e){ console.error(e); T('삭제 실패 — '+((e&&e.message)||'')); });
    });
  };
  window.toggleAcctActive=function(email,next){
    if(!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    var a=(window.__caroAccts||[]).filter(function(x){return (x.id||x.email)===email;})[0]||{};
    var viaServer=(typeof window.FB_CALL==='function')?window.FB_CALL('setAdminAccount',{email:email, name:a.name||'', role:a.role||'', position:a.position||'', perms:a.perms||{}, active:!!next}):Promise.reject({code:'functions/not-found'});   /* ★[v108] 직책·직급이 지워지던 것 */
    viaServer.catch(function(e){ if(e && /not-found|unavailable/.test(String(e.code||'')) && !/계정/.test(String(e.message||''))) return FN.setDoc(FN.doc(db,'admin_accounts',email),{active:!!next},{merge:true}); throw e; })
      .then(function(){ T(next?'활성화되었습니다':'정지되었습니다'); })
      .catch(function(e){ console.error(e); T('변경 실패 — '+((e&&e.message)||'')); });
  };
  window.editAcct=function(email){
    var a=(window.__caroAccts||[]).filter(function(x){return (x.id||x.email)===email;})[0];
    if(a) openModal(a);
  };

  function badges(p){
    if(!p) return '<span class="apill none">권한 없음</span>';
    var q=Object.assign({},p); if(q.ops) q=Object.assign({resv:true,cars:true,pricing:true,notices:true},q);
    var keys=['control','resv','cars','pricing','notices'].filter(function(k){ return q[k]===true; });
    if(keys.length===5) return '<span class="apill all">모든 권한 (관제+운영)</span>';
    return keys.map(function(k){ return '<span class="apill '+k+'">'+PILL[k]+'</span>'; }).join('') || '<span class="apill none">권한 없음</span>';
  }
  function superEmail(){
    try{ if(window.FB_AUTH && FB_AUTH.currentUser && FB_AUTH.currentUser.email) return FB_AUTH.currentUser.email; }catch(e){}
    return SUPER;
  }
  function render(list){
    var box=document.getElementById('acctList'); if(!box) return;
    var isSuper=!!(window.caroPerms&&window.caroPerms.super);   /* ★[v108] 최고관리자 카드는 최고관리자에게만, 이메일은 본인 것만 */
    var html= isSuper ?
      ('<div class="acct2"><span class="av">C</span>'
      +'<div class="acct2-info"><div class="acct2-name">CAROMOBILITY<span class="stat on">최고관리자</span></div>'
      +'<div class="acct2-role">모든 권한 · 본인 ('+esc(superEmail())+')</div>'
      +'<div class="acct2-perms"><span class="apill all">모든 권한</span></div></div></div>') : '';
    (list||[]).forEach(function(a){
      var email=a.id||a.email||'';
      var on=a.active!==false;
      var initial=(a.name&&a.name[0]?a.name[0]:'?').toUpperCase();
      html+='<div class="acct2'+(on?'':' off')+'"><span class="av">'+esc(initial)+'</span>'
        +'<div class="acct2-info"><div class="acct2-name">'+esc(a.name||email)
        +'<span class="stat '+(on?'on':'no')+'">'+(on?'활성':'정지')+'</span></div>'
        +'<div class="acct2-role">'+((a.position||a.role)?((a.position?esc(a.position):'')+(a.position&&a.role?' · ':'')+(a.role?esc(a.role):'')+' · '):'')+esc(email)+'</div>'
        +'<div class="acct2-perms">'+badges(a.perms)+'</div></div>'
        +'<div class="acct2-btns">'
        +'<button class="acct2-btn edit" onclick="editAcct(\''+jsa(email)+'\')">수정</button>'
        +'<button class="acct2-btn" onclick="toggleAcctActive(\''+jsa(email)+'\','+(on?'false':'true')+')">'+(on?'정지':'활성')+'</button>'
        +'<button class="acct2-btn" onclick="acctSendPw(\''+jsa(email)+'\')" title="비밀번호 설정 메일 보내기">비밀번호 메일</button>'
        +'<button class="acct2-btn" onclick="acctResetMfa(\''+jsa(email)+'\')" title="휴대폰 분실·교체 시">2단계 초기화</button>'
        +'<button class="acct2-btn del" onclick="delAcct(\''+jsa(email)+'\')">삭제</button>'
        +'</div></div>';
    });
    box.innerHTML=html;
  }
  window.renderAccts=function(){ render(window.__caroAccts||[]); };

  function wire(){
    document.querySelectorAll('#tab-set .card-hd button').forEach(function(b){
      if(/계정/.test(b.textContent)){ b.removeAttribute('onclick'); b.textContent='+ 직원 계정'; b.onclick=function(){ openModal(null); }; }
    });
    render(window.__caroAccts||[]);
    if(!ready()) return false;
    /* ★[v108.1] 로그인(권한 확정) 전엔 계속 기다리고, 확정 뒤 최고관리자일 때만 한 번 구독 (v108 은 확정 전에 멈춰 목록이 늘 비어 있었다) */
    if(!(window.caroPerms&&window.caroPerms.ready)) return false;
    if(!window.caroPerms.super) return true;   /* 직원 계정 목록은 최고관리자만 (규칙상 직원은 읽기 거부) */
    if(wire._subbed) return true; wire._subbed=true;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'admin_accounts'), function(snap){
        var arr=[]; snap.forEach(function(d){ var o=d.data()||{}; o.id=d.id; arr.push(o); });
        arr.sort(function(x,y){ return (x.name||'').localeCompare(y.name||''); });
        window.__caroAccts=arr; render(arr);
      }, function(e){ console.warn('[계정] 목록 오류', e); });
    }catch(e){ console.warn('[계정] 리스너 오류', e); }
    return true;
  }
  if(!wire()){ var t=setInterval(function(){ if(wire()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},60000); }
  document.addEventListener('caro-perms', function(){ wire(); });   /* 로그인 뒤 권한이 확정되면 구독 시작(wire 가 render 도 한다) */
  console.log('[계정] ✅ 관리자 계정·권한 관리 v2 (이메일 연결 + 차량/요금/공지/예약)');
})();
