/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY 관제 — 예약 "관리" 상세 패치 v1
   ───────────────────────────────────────────────────────────
   예약 관리 표의 [관리] 버튼 → 상세 모달
     · 대여자 / 이메일 / 차량 / 보험 / 대여 시간 / 상태 / 결제·환불
     · 비고(콜센터 문의 기록) 입력·저장
     · 사고 부위 / 사고 내용 입력·저장
     · 사용 전 사진: 클라우드에 올라오면 자동 표시 (현재는 안내문)
   저장은 Firestore reservations 문서에 merge (관리자 권한 필요).

   적용법: admin.html 의 </body> 바로 위에 아래 한 줄 추가
     <script src="admin-manage.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ---------- 도우미 ---------- */
  function esc(s){ s=(s==null?'':''+s); return s.replace(/[&<>"']/g,function(c){
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function fmtDate(v){
    if(!v) return '-';
    var d=(v instanceof Date)?v:new Date(v);
    if(isNaN(d.getTime())) return ''+v;
    var mm=d.getMonth()+1, dd=d.getDate();
    var hh=('0'+d.getHours()).slice(-2), mi=('0'+d.getMinutes()).slice(-2);
    return mm+'/'+dd+' '+hh+':'+mi;
  }
  function won(n){ n=Number(n)||0; return n.toLocaleString('ko-KR')+'원'; }
  function statusOf(d){
    if(d.cancelled) return {t:'취소', c:'var(--bad)'};
    if(d.returned)  return {t:'반납완료', c:'var(--muted)'};
    var now=Date.now();
    var s=d.start?new Date(d.start).getTime():0, e=d.end?new Date(d.end).getTime():0;
    if(s&&now<s) return {t:'예약확정', c:'var(--use)'};
    if(e&&now>e) return {t:'반납지연', c:'var(--warn)'};
    return {t:'대여중', c:'var(--ok)'};
  }
  function notify(msg){ try{ if(typeof window.toast==='function'){ window.toast(msg); return; } }catch(e){} try{ alert(msg); }catch(e2){} }

  /* ---------- 스타일 ---------- */
  var css = ''
   + '.rm-ov{position:fixed;inset:0;z-index:9000;background:rgba(8,9,11,.66);display:none;align-items:center;justify-content:center;padding:20px;}'
   + '.rm-ov.on{display:flex;}'
   + '.rm-box{width:100%;max-width:560px;max-height:88vh;overflow:hidden;display:flex;flex-direction:column;background:var(--panel,#1b1d21);border:1px solid var(--border2,#34383f);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.55);}'
   + '.rm-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:15px 18px;border-bottom:1px solid var(--border,#2b2e34);}'
   + '.rm-hd .no{font-family:Saira,sans-serif;letter-spacing:.04em;color:var(--gold-soft,#dcc28f);font-size:15px;}'
   + '.rm-badge{font-size:11.5px;font-weight:700;padding:3px 10px;border-radius:20px;border:1px solid currentColor;}'
   + '.rm-x{background:none;border:none;color:var(--muted,#868b94);font-size:20px;cursor:pointer;line-height:1;padding:2px 6px;}'
   + '.rm-x:hover{color:var(--txt,#e9eaed);}'
   + '.rm-bd{padding:16px 18px;overflow-y:auto;}'
   + '.rm-sec{margin-bottom:16px;}'
   + '.rm-sec-t{font-size:11.5px;font-weight:700;letter-spacing:.08em;color:var(--gold-dim,#7e6c49);text-transform:uppercase;margin-bottom:8px;}'
   + '.rm-grid{display:grid;grid-template-columns:auto 1fr;gap:7px 14px;font-size:13px;}'
   + '.rm-grid .k{color:var(--muted,#868b94);white-space:nowrap;}'
   + '.rm-grid .v{color:var(--txt,#e9eaed);text-align:right;word-break:break-all;}'
   + '.rm-note{width:100%;background:var(--panel2,#1f2228);border:1px solid var(--border,#2b2e34);border-radius:10px;color:var(--txt,#e9eaed);font-family:"Noto Sans KR",sans-serif;font-size:13px;padding:10px 12px;resize:vertical;outline:none;}'
   + '.rm-note:focus{border-color:var(--gold-dim,#7e6c49);}'
   + '.rm-lab{display:block;font-size:12px;color:var(--muted,#868b94);margin:10px 0 5px;}'
   + '.rm-photos{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}'
   + '.rm-photos img{width:100%;height:84px;object-fit:cover;border-radius:8px;border:1px solid var(--border,#2b2e34);cursor:pointer;}'
   + '.rm-photo-empty{font-size:12.5px;color:var(--muted2,#5e636b);line-height:1.6;background:var(--panel2,#1f2228);border:1px dashed var(--border2,#34383f);border-radius:10px;padding:14px;text-align:center;}'
   + '.rm-acc{background:rgba(213,122,104,.06);border:1px solid rgba(213,122,104,.25);border-radius:12px;padding:12px;}'
   + '.rm-ft{display:flex;gap:8px;padding:14px 18px;border-top:1px solid var(--border,#2b2e34);}'
   + '.rm-ft .btn{flex:1;justify-content:center;}'
   ;
  var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);

  /* ---------- 모달 DOM ---------- */
  var ov=document.createElement('div'); ov.className='rm-ov';
  ov.innerHTML =
    '<div class="rm-box">'
    + '<div class="rm-hd"><div style="display:flex;align-items:center;gap:10px;">'
    +   '<span class="no" id="rmNo">—</span><span class="rm-badge" id="rmBadge">—</span></div>'
    +   '<button class="rm-x" id="rmClose">\u2715</button></div>'
    + '<div class="rm-bd" id="rmBody"></div>'
    + '<div class="rm-ft">'
    +   '<button class="btn" id="rmCancelBtn">닫기</button>'
    +   '<button class="btn gold" id="rmSaveBtn">비고·사고 기록 저장</button>'
    + '</div></div>';
  document.body.appendChild(ov);
  var elNo=ov.querySelector('#rmNo'), elBadge=ov.querySelector('#rmBadge'), elBody=ov.querySelector('#rmBody');
  var curNo=null;

  function closeModal(){ ov.classList.remove('on'); curNo=null; }
  ov.querySelector('#rmClose').onclick=closeModal;
  ov.querySelector('#rmCancelBtn').onclick=closeModal;
  ov.addEventListener('click',function(e){ if(e.target===ov) closeModal(); });

  function photoHTML(d){
    var imgs=[], p=d.photos;
    if(p){
      if(Array.isArray(p)) imgs=p.slice();
      else if(typeof p==='object'){
        for(var k in p){ if(Array.isArray(p[k])) imgs=imgs.concat(p[k]); else if(typeof p[k]==='string') imgs.push(p[k]); }
      }
    }
    imgs=imgs.filter(function(s){ return typeof s==='string' && s.length>30; });
    if(imgs.length){
      return '<div class="rm-photos">'+imgs.map(function(s){ return '<img src="'+esc(s)+'" onclick="window.open(this.src)">'; }).join('')+'</div>';
    }
    return '<div class="rm-photo-empty">\uD83D\uDCF7 사용 전 사진이 아직 클라우드에 업로드되지 않았습니다.<br>(고객 앱에 사진 업로드 기능을 추가하면 여기에 표시됩니다)</div>';
  }

  function render(d){
    var s=statusOf(d);
    elBadge.textContent=s.t; elBadge.style.color=s.c;
    var car=d.car||{};
    var carLine = esc(car.name||'-') + (car.carNumber?(' \u00b7 '+esc(car.carNumber)):'')
                + (car.id!=null&&car.id!==''?(' <span style="color:var(--muted)">('+esc(car.id)+')</span>'):'');
    elBody.innerHTML = ''
     + '<div class="rm-sec"><div class="rm-sec-t">대여 정보</div><div class="rm-grid">'
     +   '<span class="k">대여자</span><span class="v">'+esc(d.userName||d.name||'-')+'</span>'
     +   '<span class="k">이메일</span><span class="v">'+esc(d.userEmail||'-')+'</span>'
     +   '<span class="k">전화</span><span class="v">'+(d.userPhone||d.phone?('<a href="tel:'+esc(d.userPhone||d.phone)+'" style="color:inherit">'+esc(d.userPhone||d.phone)+'</a>'):'<span style="color:var(--muted)">미등록 (10월 이후 예약부터 자동 기록)</span>')+'</span>'
     +   '<span class="k">차량</span><span class="v">'+carLine+'</span>'
     +   '<span class="k">보험</span><span class="v">'+esc((d.ins&&d.ins.name)||'없음')+'</span>'
     + '</div></div>'
     + '<div class="rm-sec"><div class="rm-sec-t">대여 시간</div><div class="rm-grid">'
     +   '<span class="k">시작</span><span class="v">'+fmtDate(d.start)+'</span>'
     +   '<span class="k">종료</span><span class="v">'+fmtDate(d.end)+'</span>'
     +   '<span class="k">이용 시간</span><span class="v">'+(Number(d.hrs)||0)+'시간'
        +((Number(d.extendedMins)||0)>0?(' (연장 '+(Number(d.extendedMins)||0)+'분)'):'')+'</span>'
     +   (d.returned?('<span class="k">반납</span><span class="v">'+fmtDate(d.returnedAt)+'</span>'):'')
     + '</div></div>'
     + '<div class="rm-sec"><div class="rm-sec-t">결제</div><div class="rm-grid">'
     +   '<span class="k">결제 금액</span><span class="v">'+won(d.total)+'</span>'
     +   (d.cancelled?('<span class="k">취소 시각</span><span class="v">'+fmtDate(d.cancelledAt)+'</span>'
        +'<span class="k">환불</span><span class="v">'+(Number(d.refundPct)||0)+'% \u00b7 '+won(d.refundAmt)+'</span>'):'')
     + '</div></div>'
     + (d.settlement?('<div class="rm-sec"><div class="rm-sec-t">반납 정산</div><div class="rm-grid">'
     +   '<span class="k">추가 요금</span><span class="v">'+won(d.settlement.amount||0)+(d.settlement.paid?' · 결제됨':(d.settlement.waived?' · 면제':' · <b style="color:var(--bad)">미납</b>'))+'</span>'
     +   ((d.settlement.breakdown||[]).map(function(b){ return '<span class="k">'+esc(b.label||b.key)+'</span><span class="v">'+won(b.amount)+'</span>'; }).join(''))
     +   (d.forceReturned?('<span class="k">강제 반납</span><span class="v">'+esc(d.forcedBy||d.forceReturnedBy||'')+' · '+esc(d.forceReason||'')+'</span>'):'')
     + '</div></div>'):'')
     + '<div class="rm-sec"><div class="rm-sec-t">사용 전 사진</div>'+photoHTML(d)+'</div>'
     + '<div class="rm-sec"><div class="rm-sec-t">이용 정지</div><div id="rmSuspBox" style="font-size:12.5px;color:var(--muted)">확인 중…</div>'
     +   '<div style="display:flex;gap:8px;margin-top:8px;"><button class="btn" id="rmSuspOn" style="flex:1;justify-content:center;color:#d57a68;">이 고객 이용 정지</button><button class="btn" id="rmSuspOff" style="flex:1;justify-content:center;">정지 해제</button></div>'
     + '</div>'
     + '<div class="rm-sec"><div class="rm-sec-t">비고 \u00b7 콜센터 문의 기록</div>'
     +   '<textarea class="rm-note" id="rmNote" rows="3" placeholder="고객 문의 내용, 특이사항 등을 기록하세요">'+esc(d.adminNote||'')+'</textarea>'
     + '</div>'
     + '<div class="rm-sec"><div class="rm-sec-t">사고 기록</div><div class="rm-acc">'
     +   '<label class="rm-lab" style="margin-top:0">사고 부위</label>'
     +   '<input class="rm-note" id="rmAccParts" placeholder="예: 앞범퍼 좌측, 운전석 도어" value="'+esc(d.accidentParts||'')+'">'
     +   '<label class="rm-lab">사고 내용</label>'
     +   '<textarea class="rm-note" id="rmAccNote" rows="3" placeholder="사고 경위, 파손 정도 등">'+esc(d.accidentNote||'')+'</textarea>'
     + '</div></div>'
     + (d.noteUpdatedAt?('<div style="font-size:11px;color:var(--muted2,#5e636b);text-align:right;">마지막 기록: '+fmtDate(d.noteUpdatedAt)+'</div>'):'');
    wireSusp(d);
  }

  /* ★[23차] 예약 상세에서 바로 고객 이용 정지/해제 — 반납 지연·사고·연락 두절 고객을 센터가 바로 막을 수 있게 (suspensions/{uid}) */
  function wireSusp(d){
    var box=ov.querySelector('#rmSuspBox'), on=ov.querySelector('#rmSuspOn'), off=ov.querySelector('#rmSuspOff');
    var FN=window.FB_FN, db=window.FB_DB, uid=d.userId||'';
    if(!box||!on||!off) return;
    if(!uid||!FN||!db){ box.textContent='고객 계정 정보가 없어 정지할 수 없습니다.'; on.disabled=off.disabled=true; return; }
    function show(){
      FN.getDoc(FN.doc(db,'suspensions',uid)).then(function(sn){
        var x=(sn&&sn.exists&&sn.exists())?(sn.data()||{}):null;
        var active=!!(x&&x.active!==false&&(x.requiresApproval===true||x.habitual===true||((Number(x.untilTs)||Date.parse(x.until)||0)>Date.now())));
        box.innerHTML=active?('<b style="color:#d57a68">정지 중</b> · '+esc(x.reason||'')+(x.untilTs?(' · 해제 예정 '+fmtDate(x.untilTs)):' · 직원이 해제할 때까지')):'정지 아님';
        on.disabled=active; off.disabled=!active;
      }).catch(function(){ box.textContent='정지 상태를 읽을 수 없습니다 (권한 확인)'; });
    }
    show();
    on.onclick=function(){
      var reason=window.prompt('정지 사유 (고객 앱에 표시됩니다)', '반납 지연 · 고객센터 연락 요망');
      if(reason===null) return;
      var days=window.prompt('정지 기간(일). 비워 두면 직원이 해제할 때까지 무기한', '');
      if(days===null) return;
      var n=parseInt(days,10); var data={ userId:uid, userName:d.userName||'', idName:d.userEmail||'', active:true, reason:reason, createdAt:new Date().toISOString(), heldBy:(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||'staff', bookNo:d.bookNo||'' };
      if(n>0){ data.untilTs=Date.now()+n*86400000; data.until=new Date(data.untilTs).toISOString(); data.requiresApproval=false; } else { data.untilTs=null; data.until=null; data.requiresApproval=true; }
      FN.setDoc(FN.doc(db,'suspensions',uid),data,{merge:true}).then(function(){ notify('이용 정지를 적용했습니다 — 이 고객은 예약·문 열기가 막힙니다'); show(); }).catch(function(e){ notify('정지 실패: 권한 확인'); console.error(e); });
    };
    off.onclick=function(){
      if(!window.confirm('이 고객의 이용 정지를 해제할까요?')) return;
      FN.setDoc(FN.doc(db,'suspensions',uid),{ active:false, liftedAt:new Date().toISOString(), liftedBy:(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||'staff' },{merge:true}).then(function(){ notify('정지를 해제했습니다'); show(); }).catch(function(e){ notify('해제 실패: 권한 확인'); console.error(e); });
    };
  }

  window.openResManage=function(no){
    if(!no) return;
    var FN=window.FB_FN, db=window.FB_DB;
    if(!FN||!db||typeof FN.getDoc!=='function'){ notify('잠시 후 다시 시도해 주세요 (연결 준비 중)'); return; }
    curNo=no;
    elNo.textContent=no; elBadge.textContent='불러오는 중'; elBadge.style.color='var(--muted)';
    elBody.innerHTML='<div style="padding:30px;text-align:center;color:var(--muted)">불러오는 중\u2026</div>';
    ov.classList.add('on');
    FN.getDoc(FN.doc(db,'reservations',no)).then(function(snap){
      if(curNo!==no) return;
      if(!snap.exists()){ elBody.innerHTML='<div style="padding:30px;text-align:center;color:var(--bad)">예약 정보를 찾을 수 없습니다.</div>'; return; }
      render(snap.data());
    }).catch(function(e){
      elBody.innerHTML='<div style="padding:30px;text-align:center;color:var(--bad)">불러오기 실패: '+esc(e&&e.message||e)+'</div>';
    });
  };

  ov.querySelector('#rmSaveBtn').onclick=function(){
    if(!curNo) return;
    var FN=window.FB_FN, db=window.FB_DB;
    if(!FN||!db||typeof FN.setDoc!=='function'){ notify('연결 준비 중입니다'); return; }
    var note=(ov.querySelector('#rmNote')||{}).value||'';
    var accP=(ov.querySelector('#rmAccParts')||{}).value||'';
    var accN=(ov.querySelector('#rmAccNote')||{}).value||'';
    var btn=ov.querySelector('#rmSaveBtn'); var old=btn.textContent; btn.textContent='저장 중\u2026'; btn.disabled=true;
    FN.setDoc(FN.doc(db,'reservations',curNo),{
      adminNote:note, accidentParts:accP, accidentNote:accN, noteUpdatedAt:new Date().toISOString()
    },{merge:true}).then(function(){
      notify('저장 완료 \u2713'); btn.textContent=old; btn.disabled=false; closeModal();
    }).catch(function(e){
      notify('저장 실패: 관리자 권한 확인'); console.error(e); btn.textContent=old; btn.disabled=false;
    });
  };

  /* ---------- 표의 [관리] 버튼 연결 ---------- */
  function wire(){
    var body=document.getElementById('resvBody'); if(!body) return;
    var btns=body.querySelectorAll('button');
    for(var i=0;i<btns.length;i++){
      var b=btns[i];
      if(b.textContent.trim()!=='관리') continue;
      if(b.getAttribute('data-rm')==='1') continue;
      var tr=b.closest('tr'); if(!tr) continue;
      var firstTd=tr.querySelector('td'); if(!firstTd) continue;
      var no=firstTd.textContent.trim(); if(!no) continue;
      b.setAttribute('data-rm','1');
      b.removeAttribute('onclick');
      (function(n){ b.onclick=function(){ window.openResManage(n); }; })(no);
    }
  }
  function start(b){ wire(); try{ new MutationObserver(wire).observe(b,{childList:true,subtree:true}); }catch(e){} }
  var b0=document.getElementById('resvBody');
  if(b0){ start(b0); }
  else { var t=setInterval(function(){ var b=document.getElementById('resvBody'); if(b){ clearInterval(t); start(b); } },500); }

  console.log('[CARO 관제] \u2705 예약 관리 상세 패치 v1 적용 완료');
})();
