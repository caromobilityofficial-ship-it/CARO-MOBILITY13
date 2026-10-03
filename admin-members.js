/* ═══════════════════════════════════════════════════════════════
   admin-members.js — ★[24차] 회원 관리 탭 (운영 화면)
   · users 컬렉션(규칙: 예약·관제 직원 읽기 가능)을 읽어 이름·이메일·전화·면허·가입일·마지막 로그인 표시
   · 검색(이름·이메일·전화·면허), 미납·정지 상태 함께 표시
   · 회원 카드에서: 이용 정지/해제, 추가 청구 등록(admin-charges.js), 예약 이력 보기
   ※ 개인정보는 화면에서만 보고, 기록(CSV 등)은 남기지 않는다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var users=[], debts=[], susps=[], resvByUid={}, q='', onlyFlag='';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function won(n){ try{ return (Number(n)||0).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function fmt(v){ try{ var d=(v&&v.toDate)?v.toDate():(typeof v==='number'?new Date(v):new Date(v)); if(isNaN(d.getTime())) return '—'; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }catch(e){ return '—'; } }
  function notify(m){ try{ if(window.toast) return toast(m); }catch(e){} alert(m); }
  function me(){ try{ return (window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||'staff'; }catch(e){ return 'staff'; } }

  function css(){
    if(document.getElementById('mb-css')) return;
    var s=document.createElement('style'); s.id='mb-css';
    s.textContent=
      '#tab-members .mb-head{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:12px;}'
     +'#tab-members .mb-head input,#tab-members .mb-head select{background:var(--panel2,#1f2228);border:1px solid var(--border,#333);color:var(--txt,#ddd);border-radius:10px;padding:9px 12px;font-size:13px;}'
     +'#tab-members .mb-head input{flex:1;min-width:220px;}'
     +'.mb-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:12px;}'
     +'.mb-kpi{background:var(--panel);border:1px solid var(--border);border-radius:12px;padding:12px;text-align:center;} .mb-kpi .v{font-size:20px;font-weight:800;} .mb-kpi .l{font-size:11px;color:var(--muted);}'
     +'.mb-card{display:grid;grid-template-columns:1fr auto;gap:10px;background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:12px 14px;margin-bottom:8px;}'
     +'.mb-card.bad{border-color:rgba(213,122,104,.45);}'
     +'.mb-nm{font-weight:800;font-size:14px;} .mb-sub{font-size:12px;color:var(--muted);margin-top:2px;line-height:1.6;} .mb-sub a{color:inherit;}'
     +'.mb-tag{display:inline-block;font-size:11px;padding:2px 7px;border-radius:999px;border:1px solid var(--border);margin-right:4px;}'
     +'.mb-tag.red{color:#ff8f85;border-color:rgba(213,122,104,.5);} .mb-tag.gold{color:var(--gold,#c8a96e);border-color:rgba(200,169,110,.5);} .mb-tag.gray{color:var(--muted);}'
     +'.mb-act{display:flex;flex-direction:column;gap:6px;min-width:120px;}'
     +'.mb-act button{background:var(--panel2,#1c1f25);border:1px solid var(--border,#333);color:var(--txt,#ddd);border-radius:9px;padding:7px 10px;font-size:12px;cursor:pointer;}'
     +'.mb-act button.warn{color:#ff8f85;} .mb-act button.gold{color:var(--gold,#c8a96e);}'
     +'.mb-empty{padding:30px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:14px;}'
     +'.mb-hist{grid-column:1/-1;font-size:12px;color:var(--muted);border-top:1px dashed var(--border);padding-top:8px;display:none;} .mb-card.open .mb-hist{display:block;}'
     +'@media(max-width:720px){.mb-card{grid-template-columns:1fr;} .mb-act{flex-direction:row;flex-wrap:wrap;}}';
    document.head.appendChild(s);
  }

  function suspOf(uid){ var s=susps.find(function(x){ return x._id===uid; }); if(!s||s.active===false) return null; var t=Number(s.untilTs)||Date.parse(s.until)||0; return (s.requiresApproval===true||s.habitual===true||t>Date.now())?s:null; }
  function unpaidOf(uid){ return debts.filter(function(d){ return d.userId===uid && (d.status==='unpaid'||d.status==='due'); }); }
  function licOf(u){ var l=u.license; if(l&&typeof l==='object'&&l.number) return String(l.number); if(typeof l==='string'&&l) return l; return u.licenseText||''; }
  function phoneOf(u){ return u.phoneFull||u.phone||u.phoneE164||''; }
  function nameOf(u){ return u.name||u.id||(u.email?u.email.split('@')[0]:'회원'); }

  function render(){
    var root=document.getElementById('membersRoot'); if(!root) return;
    css();
    var ql=q.toLowerCase();
    var list=users.filter(function(u){
      if(u.provider==='device' || /@device\.caromobility\.kr$|@caro\.local$/.test(u.email||'')) return false;
      if(onlyFlag==='susp' && !suspOf(u._id)) return false;
      if(onlyFlag==='unpaid' && !unpaidOf(u._id).length) return false;
      if(onlyFlag==='nolic' && licOf(u)) return false;
      if(ql){ var hay=[nameOf(u),u.email,u.id,phoneOf(u),licOf(u)].join(' ').toLowerCase(); if(hay.indexOf(ql)<0) return false; }
      return true;
    }).sort(function(a,b){ return (ts(b.lastLoginAt)||ts(b.createdAt))-(ts(a.lastLoginAt)||ts(a.createdAt)); });
    var nS=users.filter(function(u){ return suspOf(u._id); }).length, nU=users.filter(function(u){ return unpaidOf(u._id).length; }).length, nL=users.filter(function(u){ return !licOf(u); }).length;
    var h='<div class="mb-head"><input id="mbQ" placeholder="검색: 이름 · 이메일 · 전화 · 면허번호" value="'+esc(q)+'">'
      +'<select id="mbF"><option value="">전체</option><option value="susp"'+(onlyFlag==='susp'?' selected':'')+'>정지 중</option><option value="unpaid"'+(onlyFlag==='unpaid'?' selected':'')+'>미납 있음</option><option value="nolic"'+(onlyFlag==='nolic'?' selected':'')+'>면허 미등록</option></select>'
      +'<span class="sub">'+list.length+'명</span></div>'
      +'<div class="mb-kpis"><div class="mb-kpi"><div class="v">'+users.length+'</div><div class="l">전체 회원</div></div><div class="mb-kpi"><div class="v" style="color:#ff8f85">'+nS+'</div><div class="l">정지 중</div></div><div class="mb-kpi"><div class="v" style="color:var(--warn,#e0a86c)">'+nU+'</div><div class="l">미납 있음</div></div><div class="mb-kpi"><div class="v">'+nL+'</div><div class="l">면허 미등록</div></div></div>';
    if(!list.length) h+='<div class="mb-empty">'+(users.length?'조건에 맞는 회원이 없습니다.':'회원 정보를 읽을 수 없거나 아직 없습니다. (예약·관제 권한 필요)')+'</div>';
    h+=list.slice(0,200).map(card).join('');
    if(list.length>200) h+='<div class="mb-empty">검색어를 더 넣어 주세요 (200명까지만 표시)</div>';
    root.innerHTML=h;
    var qi=document.getElementById('mbQ'); if(qi){ qi.addEventListener('input', function(){ q=qi.value; var pos=qi.selectionStart; render(); var n=document.getElementById('mbQ'); if(n){ n.focus(); try{ n.setSelectionRange(pos,pos); }catch(e){} } }); }
    var fs=document.getElementById('mbF'); if(fs) fs.addEventListener('change', function(){ onlyFlag=fs.value; render(); });
    root.querySelectorAll('[data-act]').forEach(function(b){ b.addEventListener('click', function(){ act(b.dataset.act, b.dataset.uid, b); }); });
  }
  function ts(v){ try{ if(!v) return 0; if(v.toMillis) return v.toMillis(); if(typeof v==='number') return v; var t=Date.parse(v); return isNaN(t)?0:t; }catch(e){ return 0; } }
  function card(u){
    var uid=u._id, sp=suspOf(uid), up=unpaidOf(uid), upSum=up.reduce(function(a,d){ return a+(Number(d.amount)||0); },0);
    var lic=licOf(u), ph=phoneOf(u), rv=resvByUid[uid]||[];
    var tags='';
    if(sp) tags+='<span class="mb-tag red">정지 중'+(sp.untilTs?' · ~'+fmt(sp.untilTs):'')+'</span>';
    if(up.length) tags+='<span class="mb-tag red">미납 '+won(upSum)+'원 ('+up.length+'건)</span>';
    tags+=lic?'<span class="mb-tag gray">면허 '+esc(lic.slice(0,2))+'-**-******-**'+(u.license&&u.license.verified?' ✓':' (미인증)')+'</span>':'<span class="mb-tag gold">면허 미등록</span>';
    if(u.phoneVerified||u.certCI) tags+='<span class="mb-tag gray">본인인증 ✓</span>';
    if(u.withdrawalPending) tags+='<span class="mb-tag gray">탈퇴 대기</span>';
    var hist=rv.slice(0,8).map(function(r){ return '· '+esc(r.no)+' '+esc(r.car)+' '+esc(r.period)+' — '+esc(r.status); }).join('<br>')||'예약 이력 없음';
    return '<div class="mb-card'+(sp||up.length?' bad':'')+'" id="mb-'+esc(uid)+'">'
      +'<div><div class="mb-nm">'+esc(nameOf(u))+' <span style="font-weight:400;color:var(--muted);font-size:12px">'+esc(u.email||u.id||'')+'</span></div>'
      +'<div class="mb-sub">'+(ph?'<a href="tel:'+esc(ph.replace(/[^\d+]/g,''))+'">📞 '+esc(ph)+'</a> · ':'📞 미등록 · ')+'가입 '+fmt(u.createdAt||u.signupAt)+' · 마지막 로그인 '+fmt(u.lastLoginAt)+(u.lastDevice?' ('+esc(u.lastDevice)+')':'')+' · 예약 '+rv.length+'건</div>'
      +'<div class="mb-sub">'+tags+'</div></div>'
      +'<div class="mb-act">'
      +(sp?'<button data-act="unsusp" data-uid="'+esc(uid)+'">정지 해제</button>':'<button class="warn" data-act="susp" data-uid="'+esc(uid)+'">이용 정지</button>')
      +'<button class="gold" data-act="charge" data-uid="'+esc(uid)+'">추가 청구</button>'
      +'<button data-act="hist" data-uid="'+esc(uid)+'">예약 이력</button>'
      +'</div>'
      +'<div class="mb-hist">'+hist+'</div>'
      +'</div>';
  }
  function act(a, uid, btn){
    var FN=window.FB_FN, db=window.FB_DB, u=users.find(function(x){ return x._id===uid; })||{};
    if(a==='hist'){ var c=document.getElementById('mb-'+uid); if(c) c.classList.toggle('open'); return; }
    if(a==='charge'){ if(window.caroOpenCharge) window.caroOpenCharge({ uid:uid, name:nameOf(u), email:u.email||'' }); else notify('추가 청구 모듈이 로드되지 않았습니다'); return; }
    if(a==='susp'){
      var reason=window.prompt('정지 사유 (고객 앱에 표시됩니다)', '운영팀 확인 필요 · 고객센터로 연락 주세요'); if(reason===null) return;
      var days=window.prompt('정지 기간(일). 비워 두면 직원이 해제할 때까지', ''); if(days===null) return;
      var n=parseInt(days,10); var data={ userId:uid, userName:nameOf(u), idName:u.email||u.id||'', license:licOf(u), active:true, reason:reason, createdAt:new Date().toISOString(), heldBy:me() };
      if(n>0){ data.untilTs=Date.now()+n*86400000; data.until=new Date(data.untilTs).toISOString(); data.requiresApproval=false; } else { data.untilTs=null; data.until=null; data.requiresApproval=true; }
      FN.setDoc(FN.doc(db,'suspensions',uid),data,{merge:true}).then(function(){ notify('이용 정지를 적용했습니다'); }).catch(function(e){ notify('정지 실패: 권한 확인'); console.error(e); });
      return;
    }
    if(a==='unsusp'){
      if(!window.confirm('정지를 해제할까요?')) return;
      FN.setDoc(FN.doc(db,'suspensions',uid),{ active:false, liftedAt:new Date().toISOString(), liftedBy:me() },{merge:true}).then(function(){ notify('정지를 해제했습니다'); }).catch(function(e){ notify('해제 실패: 권한 확인'); console.error(e); });
    }
  }

  var subscribed=false;
  function subscribe(){
    if(subscribed||!ready()) return; subscribed=true;
    var FN=window.FB_FN, db=window.FB_DB;
    try{ FN.onSnapshot(FN.collection(db,'users'), function(s){ users=[]; s.forEach(function(d){ users.push(Object.assign({}, d.data()||{}, {_id:d.id})); }); render(); }, function(e){ console.warn('[회원] users 구독 실패', e&&e.code); render(); }); }catch(e){}
    try{ FN.onSnapshot(FN.collection(db,'unpaid_debts'), function(s){ debts=[]; s.forEach(function(d){ debts.push(Object.assign({}, d.data()||{}, {_id:d.id})); }); render(); }, function(){}); }catch(e){}
    try{ FN.onSnapshot(FN.collection(db,'suspensions'), function(s){ susps=[]; s.forEach(function(d){ susps.push(Object.assign({}, d.data()||{}, {_id:d.id})); }); render(); }, function(){}); }catch(e){}
    try{ FN.onSnapshot(FN.collection(db,'reservations'), function(s){ resvByUid={}; s.forEach(function(d){ var x=d.data()||{}; if(!x.userId) return; (resvByUid[x.userId]=resvByUid[x.userId]||[]).push({ no:d.id, car:(x.car&&x.car.name)||'', period:String(x.start||'').slice(0,16).replace('T',' '), status:x.cancelled?'취소':(x.returned?'반납완료':'진행'), ms:Date.parse(x.start)||0 }); }); Object.keys(resvByUid).forEach(function(k){ resvByUid[k].sort(function(a,b){ return b.ms-a.ms; }); }); render(); }, function(){}); }catch(e){}
  }
  window.renderMembers=function(){ subscribe(); render(); };
  function boot(){ var t=0, iv=setInterval(function(){ t++; if(ready()){ clearInterval(iv); if(!document.getElementById('tab-members').classList.contains('hide')) subscribe(); } if(t>100) clearInterval(iv); }, 300); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  console.log('[회원] ✅ 회원 관리 탭 로드');
})();
