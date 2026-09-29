/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 미납·정지 관리 (unpaid_debts + suspensions) v1
   ───────────────────────────────────────────────────────────
   · 고객 앱이 기록한 미납(채권)·패널티·장기미납 정지를 실시간 조회
   · KPI + 미납 목록(납부처리) + 이용정지 목록(정지해제)
   · 관리 작업: 납부처리(status→paid), 정지해제(active→false)
   적용: admin.html
     - 탭 버튼:  <button class="tab" data-tab="debt">미납·정지</button>
     - 섹션:     <section id="tab-debt" class="hide"><div id="debtRoot"></div></section>
     - 탭 전환 배열에 'debt' 추가 + 'debt' 클릭 시 window.renderDebtAdmin()
     - </body> 위:  <script src="admin-debt.js?v=1"></script>
   ※ Firestore 규칙(unpaid_debts, suspensions) 필요 — README 참고
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var DAY=86400000, LONG_DAYS=21, HABITUAL_COUNT=3;
  var debts=[], susps=[];

  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
   /* ★[14차] onclick="f('…')" 처럼 글자가 다시 '코드' 로 읽히는 자리에는 esc 만으로는 부족하다
     (HTML 규칙상 &#39; 는 읽히는 순간 ' 로 돌아와 문자열을 끊는다) → 코드 문자열 규칙으로 먼저 막고 나서 HTML 로 막는다 */
  function jsa(s){ return esc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')); }
 function won(n){ try{ return (Number(n)||0).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function fmtDay(v){ try{ var d=(typeof v==='number')?new Date(v):new Date(v); if(isNaN(d.getTime())) return '—';
    var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }catch(e){ return '—'; } }
  function tsOf(x){ return x.createdTs || Date.parse(x.createdAt) || 0; }
  function daysSince(ts){ return ts? Math.floor((Date.now()-ts)/DAY) : 0; }

  function injectCss(){
    if(document.getElementById('debt-css')) return;
    var s=document.createElement('style'); s.id='debt-css';
    s.textContent=
      '#tab-debt .db-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;margin-bottom:16px;}'
     +'.db-kpi{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;}'
     +'.db-kpi .v{font-size:26px;font-weight:800;font-family:"Oswald",sans-serif;color:var(--gold-soft);}'
     +'.db-kpi .v.bad{color:var(--bad);}'
     +'.db-kpi .l{font-size:12px;color:var(--muted);margin-top:4px;}'
     +'.db-h{display:flex;align-items:center;gap:8px;margin:18px 2px 10px;font-size:14px;font-weight:700;color:var(--txt);}'
     +'.db-h .cnt{font-size:12px;color:var(--muted);font-weight:500;}'
     +'.db-row{display:flex;align-items:center;gap:12px;padding:13px 14px;border-bottom:1px solid var(--border);}'
     +'.db-row:last-child{border-bottom:none;}'
     +'.db-main{flex:1;min-width:0;}'
     +'.db-u{font-size:13px;color:var(--txt);font-weight:600;}'
     +'.db-u .sub{color:var(--muted);font-weight:400;font-size:12px;margin-left:6px;}'
     +'.db-meta{font-size:12px;color:var(--muted);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
     +'.db-bd{font-size:11px;color:var(--muted2);margin-top:2px;}'
     +'.db-amt{font-family:"Oswald",sans-serif;font-weight:700;font-size:16px;color:var(--txt);flex-shrink:0;text-align:right;}'
     +'.db-amt small{display:block;font-size:11px;color:var(--muted2);font-weight:400;font-family:"Noto Sans KR",sans-serif;}'
     +'.db-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;flex-shrink:0;white-space:nowrap;}'
     +'.db-badge.long{background:rgba(213,122,104,.16);color:var(--bad);border:1px solid rgba(213,122,104,.4);}'
     +'.db-badge.warn{background:rgba(224,168,108,.16);color:var(--warn);border:1px solid rgba(224,168,108,.4);}'
     +'.db-badge.susp{background:rgba(213,122,104,.16);color:var(--bad);border:1px solid rgba(213,122,104,.4);}'
     +'.db-badge.hab{background:rgba(224,168,108,.16);color:var(--warn);border:1px solid rgba(224,168,108,.4);}'
     +'.db-badge.ok{background:rgba(123,184,154,.16);color:var(--ok);border:1px solid rgba(123,184,154,.4);}'
     +'.db-btn{flex-shrink:0;border:1px solid var(--border2);background:var(--panel2);color:var(--txt);border-radius:9px;'
       +'padding:8px 13px;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;}'
     +'.db-btn:hover{border-color:var(--gold-dim);color:var(--gold-soft);}'
     +'.db-btn.go{background:var(--gold);color:#1a1c20;border-color:var(--gold);}'
     +'.db-empty{text-align:center;color:var(--muted);padding:30px 16px;font-size:13px;}'
     +'.db-empty .ic{font-size:26px;margin-bottom:8px;}';
    document.head.appendChild(s);
  }

  function isHoldSusp(s){ return s && s.active!==false && (s.requiresApproval===true || s.habitual===true); }
  function activeSusps(){ return susps.filter(function(s){ return s.active!==false && ( isHoldSusp(s) || ((s.untilTs||Date.parse(s.until)||0) > Date.now()) ); }); }
  function unpaidDebts(){ return debts.filter(function(d){ return (d.status||'unpaid')==='unpaid'; }); }
  function suspOf(uid){ for(var i=0;i<susps.length;i++){ if((susps[i].userId||susps[i]._id)===uid) return susps[i]; } return null; }
  /* 사용자별 누적 미납 발생 횟수(완납 포함) */
  function habitualMap(){
    var m={};
    debts.forEach(function(d){
      var k=d.userId||d.idName; if(!k) return;
      if(!m[k]) m[k]={ key:k, userId:d.userId||k, count:0, unpaid:0,
                       name:d.userName||d.idName||'사용자', idName:d.idName||'', license:d.license||'' };
      m[k].count++;
      if((d.status||'unpaid')==='unpaid') m[k].unpaid += (+d.amount||0);
      if(!m[k].license && d.license) m[k].license=d.license;
      if((!m[k].name||m[k].name==='사용자') && d.userName) m[k].name=d.userName;
    });
    return m;
  }
  function habitualUsers(){ var m=habitualMap();
    return Object.keys(m).map(function(k){return m[k];}).filter(function(u){return u.count>=HABITUAL_COUNT;})
      .sort(function(a,b){ return b.count-a.count; }); }

  function render(){
    var root=document.getElementById('debtRoot'); if(!root) return;
    injectCss();

    var un=unpaidDebts();
    var as=activeSusps();
    var habit=habitualUsers();
    var totalAmt=0, longCnt=0, users={};
    un.forEach(function(d){ totalAmt+=(+d.amount||0); users[d.userId||d.idName||'?']=1; if(daysSince(tsOf(d))>=LONG_DAYS) longCnt++; });
    var userCnt=Object.keys(users).length;

    var h='<div class="db-kpis">'
      +'<div class="db-kpi"><div class="v bad">'+won(totalAmt)+'</div><div class="l">총 미납 금액(원)</div></div>'
      +'<div class="db-kpi"><div class="v">'+un.length+'</div><div class="l">미납 건수</div></div>'
      +'<div class="db-kpi"><div class="v">'+userCnt+'</div><div class="l">미납 사용자</div></div>'
      +'<div class="db-kpi"><div class="v bad">'+habit.length+'</div><div class="l">상습 미납자(3회+)</div></div>'
      +'<div class="db-kpi"><div class="v bad">'+as.length+'</div><div class="l">이용 정지 사용자</div></div>'
      +'</div>';

    /* 상습 미납자 (누적 3회 이상) — 관리자가 이용 허용/정지 결정 */
    h+='<div class="db-h">상습 미납자 <span class="cnt">누적 '+HABITUAL_COUNT+'회 이상 · '+habit.length+'명</span></div>';
    h+='<div class="card">';
    if(!habit.length){
      h+='<div class="db-empty">상습 미납자가 없습니다.</div>';
    } else {
      habit.forEach(function(u){
        var s=suspOf(u.userId);
        var held=isHoldSusp(s);
        var timed=s && s.active!==false && (s.untilTs||Date.parse(s.until)||0)>Date.now();
        var blocked=held||timed;
        var statusBadge = held ? '<span class="db-badge hab">승인 대기</span>'
                        : timed ? '<span class="db-badge susp">정지중</span>'
                        : '<span class="db-badge ok">이용 가능</span>';
        var btns = blocked
          ? '<button class="db-btn go" onclick="window.caroDebtUnsuspend&&caroDebtUnsuspend(\''+jsa(u.userId)+'\')">이용 허용</button>'
          : '<button class="db-btn" onclick="window.caroDebtHold&&caroDebtHold(\''+jsa(u.userId)+'\')">정지 적용</button>';
        h+='<div class="db-row">'
          +'<div class="db-main">'
            +'<div class="db-u">'+esc(u.name)+'<span class="sub">'+esc(u.idName||'')+(u.license?(' · 면허 '+esc(u.license)):'')+'</span></div>'
            +'<div class="db-meta">누적 미납 '+u.count+'회'+(u.unpaid>0?(' · 현재 미납 '+won(u.unpaid)+'원'):' · 현재 미납 없음')+'</div>'
          +'</div>'
          +'<span class="db-badge long">상습</span>'
          +statusBadge
          +btns
          +'</div>';
      });
    }
    h+='</div>';

    /* 미납 목록 */
    h+='<div class="db-h">미납 내역 <span class="cnt">'+un.length+'건 · 장기미납('+LONG_DAYS+'일+) '+longCnt+'건</span></div>';
    h+='<div class="card">';
    if(!un.length){
      h+='<div class="db-empty">미납 내역이 없습니다.</div>';
    } else {
      un.sort(function(a,b){ return tsOf(b)-tsOf(a); }).forEach(function(d){
        var days=daysSince(tsOf(d));
        var isLong=days>=LONG_DAYS;
        var bd=d.breakdown||{};
        var bdTxt=[];
        if(bd.distCost) bdTxt.push('주행 '+won(bd.distCost));
        if(bd.hipass)   bdTxt.push('하이패스 '+won(bd.hipass));
        if(bd.penalty)  bdTxt.push('패널티 '+won(bd.penalty));
        h+='<div class="db-row">'
          +'<div class="db-main">'
            +'<div class="db-u">'+esc(d.userName||d.idName||'사용자')
              +'<span class="sub">'+esc(d.idName||'')+(d.license?(' · 면허 '+esc(d.license)):'')+'</span></div>'
            +'<div class="db-meta">'+esc(d.carName||'차량')+(d.carNumber?(' · '+esc(d.carNumber)):'')
              +' · 발생 '+fmtDay(tsOf(d))+' ('+days+'일 경과)'+(d.bookNo?(' · '+esc(d.bookNo)):'')+'</div>'
            +(bdTxt.length?'<div class="db-bd">'+esc(bdTxt.join(' / '))+'</div>':'')
          +'</div>'
          +(isLong?'<span class="db-badge long">장기미납</span>':'')
          +'<div class="db-amt">'+won(d.amount)+'원<small>미납</small></div>'
          +'<button class="db-btn go" onclick="window.caroDebtPay&&caroDebtPay(\''+jsa(d.id)+'\')">납부 처리</button>'
          +'</div>';
      });
    }
    h+='</div>';

    /* 정지 목록 */
    h+='<div class="db-h">이용 정지 <span class="cnt">'+as.length+'명</span></div>';
    h+='<div class="card">';
    if(!as.length){
      h+='<div class="db-empty">현재 이용 정지된 사용자가 없습니다.</div>';
    } else {
      as.sort(function(a,b){ return (b.untilTs||0)-(a.untilTs||0); }).forEach(function(s){
        var held=isHoldSusp(s);
        var until=s.untilTs||Date.parse(s.until)||0;
        var left=Math.max(0,Math.ceil((until-Date.now())/DAY));
        var meta = held ? (esc(s.reason||'상습 미납')+' · 관리자 승인 대기')
                        : (esc(s.reason||'장기 미납')+' · 해제일 '+fmtDay(until)+' (잔여 '+left+'일)');
        h+='<div class="db-row">'
          +'<div class="db-main">'
            +'<div class="db-u">'+esc(s.userName||s.idName||'사용자')
              +'<span class="sub">'+esc(s.idName||'')+(s.license?(' · 면허 '+esc(s.license)):'')+'</span></div>'
            +'<div class="db-meta">'+meta+'</div>'
          +'</div>'
          +(held?'<span class="db-badge hab">승인 대기</span>':'<span class="db-badge susp">정지중</span>')
          +'<button class="db-btn" onclick="window.caroDebtUnsuspend&&caroDebtUnsuspend(\''+jsa(s.userId||s._id)+'\')">'+(held?'이용 허용':'정지 해제')+'</button>'
          +'</div>';
      });
    }
    h+='</div>';

    root.innerHTML=h;
  }
  window.renderDebtAdmin=render;

  /* ── 관리 작업 ── */
  window.caroDebtPay=function(id){
    if(!ready()||!id) return;
    if(!confirm('이 미납 건을 납부 처리할까요?')) return;
    var db=window.FB_DB, FN=window.FB_FN;
    try{
      FN.setDoc(FN.doc(db,'unpaid_debts',id),{ status:'paid', paidAt:new Date().toISOString(), paidBy:'admin' },{merge:true})
        .then(function(){ if(window.toast) toast('납부 처리되었습니다.'); })
        .catch(function(e){ if(window.toast) toast('처리 실패: 권한/규칙을 확인하세요.'); console.warn(e); });
    }catch(e){ console.warn(e); }
  };
  window.caroDebtUnsuspend=function(uid){
    if(!ready()||!uid) return;
    if(!confirm('이 사용자의 이용 정지를 해제(이용 허용)할까요?')) return;
    var db=window.FB_DB, FN=window.FB_FN;
    try{
      FN.setDoc(FN.doc(db,'suspensions',uid),{ active:false, liftedAt:new Date().toISOString(), liftedBy:'admin' },{merge:true})
        .then(function(){ if(window.toast) toast('이용을 허용했습니다.'); })
        .catch(function(e){ if(window.toast) toast('처리 실패: 권한/규칙을 확인하세요.'); console.warn(e); });
    }catch(e){ console.warn(e); }
  };
  /* 상습 미납자 수동 이용정지(관리자 승인 전까지) */
  window.caroDebtHold=function(uid){
    if(!ready()||!uid) return;
    var m=habitualMap()[uid]||{}, cnt=m.count||0;
    if(!confirm('이 사용자를 상습 미납으로 이용 정지할까요?\n(누적 '+cnt+'회 · 관리자가 다시 허용하기 전까지 차량 이용 불가)')) return;
    var info=null; for(var i=0;i<debts.length;i++){ if(debts[i].userId===uid){ info=debts[i]; break; } }
    var db=window.FB_DB, FN=window.FB_FN;
    try{
      FN.setDoc(FN.doc(db,'suspensions',uid),{
        userId:uid, idName:(info&&info.idName)||m.idName||'', userName:(info&&info.userName)||m.name||'', license:(info&&info.license)||m.license||'',
        active:true, requiresApproval:true, habitual:true, count:cnt,
        reason:'상습 미납(누적 '+cnt+'회) — 관리자 적용', until:null, untilTs:null,
        createdAt:new Date().toISOString(), heldBy:'admin'
      },{merge:true})
        .then(function(){ if(window.toast) toast('상습 미납으로 이용 정지를 적용했습니다.'); })
        .catch(function(e){ if(window.toast) toast('처리 실패: 권한/규칙을 확인하세요.'); console.warn(e); });
    }catch(e){ console.warn(e); }
  };

  /* ── 구독 ── */
  var subscribed=false;
  function subscribe(){
    if(subscribed) return; subscribed=true;
    var db=window.FB_DB, FN=window.FB_FN;
    try{
      FN.onSnapshot(FN.collection(db,'unpaid_debts'), function(snap){
        debts=[]; snap.forEach(function(d){ var o=d.data()||{}; o._id=d.id; if(!o.id) o.id=d.id; debts.push(o); });
        render();
      }, function(e){ console.warn('[미납·정지] unpaid_debts 구독 실패', e&&e.code); subscribed=false; failMsg(); });
      FN.onSnapshot(FN.collection(db,'suspensions'), function(snap){
        susps=[]; snap.forEach(function(d){ var o=d.data()||{}; o._id=d.id; if(!o.userId) o.userId=d.id; susps.push(o); });
        render();
      }, function(e){ console.warn('[미납·정지] suspensions 구독 실패', e&&e.code); });
    }catch(e){ console.warn('[미납·정지] 오류', e); subscribed=false; }
  }
  function failMsg(){
    var root=document.getElementById('debtRoot');
    if(root && !debts.length) root.innerHTML='<div class="card"><div class="db-empty">'
      +'미납·정지 데이터를 불러올 수 없습니다.<br><span style="font-size:12px;color:var(--muted2)">Firestore 규칙(unpaid_debts, suspensions)과 관리자 로그인을 확인해 주세요.</span></div></div>';
  }

  function start(tries){
    tries=tries||0;
    if(!ready() || !window.FB_AUTH || !window.FB_FN.onAuthStateChanged){ if(tries>120) return; return void setTimeout(function(){start(tries+1);},500); }
    var A=window.FB_AUTH, FN=window.FB_FN;
    FN.onAuthStateChanged(A, function(u){ if(u) subscribe(); });
    if(A.currentUser) subscribe();
  }
  start();
  document.addEventListener('click', function(e){
    var t=e.target.closest && e.target.closest('.tab[data-tab="debt"]');
    if(t) setTimeout(render,30);
  }, true);
  console.log('[미납·정지] ✅ admin-debt v1 로드');
})();
