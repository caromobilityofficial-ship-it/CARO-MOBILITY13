/* ═════════════════════════════════════════════════
   CARO MOBILITY — 관제 · 예약 강제 반납 / 취소 v1 (2026-09-07)
   ─────────────────────────────────────────────────
   · admin-ops.html 이 예전부터 <script src="admin-force-return.js"> 로 불렀지만 파일이 없어 404 였고,
     예약 관리 모달에는 "강제변경/취소는 다음 단계에서 연결" 안내만 있었다.
   · 이 파일은 예약 [관리] 모달(admin-manage.js) 하단에 두 버튼을 붙인다:
       [강제 반납 처리]  — 이용 중/예약 상태를 반납 완료로 (returned:true, forceReturned:true)
       [예약 취소 처리]  — 예약을 취소 상태로 (cancelled:true, cancelledBy:'admin')
     두 버튼 모두 '한 번 더 누르면 확정' 2단계 (앱 안 웹뷰에서는 confirm() 이 자동 승인되므로 confirm 을 쓰지 않는다).
   · 고객 앱(v101)은 서버 예약 상태를 그대로 따르므로 처리 즉시 손님 화면에도 반영된다.
   · 환불: 서버 모드(Functions)가 켜지면 cancelReservation 함수로 토스 환불까지 처리하고,
           그 전(테스트 모드)에는 문서 상태만 바꾸고 토스 콘솔에서 수동 환불해야 함을 안내한다.
══════════════════════════════════════════════════ */
(function(){
  'use strict';
  function FN(){ return window.FB_FN; }
  function DB(){ return window.FB_DB; }
  function ready(){ return !!(DB() && FN() && typeof FN().setDoc==='function'); }
  function me(){ try{ return (window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||'admin'; }catch(e){ return 'admin'; } }
  function notify(m){ try{ if(typeof window.toast==='function'){ window.toast(m); return; } }catch(e){} console.log('[강제반납]', m); }
  function nowIso(){ return new Date().toISOString(); }
  function curNo(){ var el=document.getElementById('rmNo'); return el?el.textContent.trim():''; }

  function css(){
    if(document.getElementById('fr-css')) return;
    var s=document.createElement('style'); s.id='fr-css';
    s.textContent=
      '.fr-wrap{display:flex;gap:8px;flex-wrap:wrap;margin-right:auto;}'
     +'.fr-btn{background:var(--panel2,#1c1f25);border:1px solid var(--border,#333);color:var(--txt,#ddd);border-radius:9px;padding:8px 12px;font-size:12.5px;cursor:pointer;}'
     +'.fr-btn.ret{border-color:#2f7a55;color:#7cc79a;}'
     +'.fr-btn.can{border-color:#c0392b;color:#ff8f85;}'
     +'.fr-btn.arm{background:#c0392b;color:#fff;border-color:#c0392b;font-weight:800;}'
     +'.fr-btn.ret.arm{background:#2f7a55;border-color:#2f7a55;}'
     +'.fr-btn:disabled{opacity:.5;cursor:default;}'
     +'.fr-note{width:100%;font-size:11.5px;color:var(--muted,#999);line-height:1.5;}';
    document.head.appendChild(s);
  }

  /* 2단계 버튼: 1번 → '한 번 더 누르면 확정' (4초), 2번 → 실행 */
  function twoStep(btn, label, armLabel, run){
    var armed=false, t=null;
    btn.addEventListener('click', function(){
      if(btn.disabled) return;
      if(!armed){
        armed=true; btn.classList.add('arm'); btn.textContent=armLabel;
        t=setTimeout(function(){ armed=false; btn.classList.remove('arm'); btn.textContent=label; }, 4000);
        return;
      }
      clearTimeout(t); armed=false; btn.classList.remove('arm'); btn.textContent=label;
      run();
    });
  }

  function refreshModal(no){
    try{ if(typeof window.openResManage==='function') window.openResManage(no); }catch(e){}
  }
  function logAlert(kind, no, extra){
    try{
      var f=FN(), db=DB();
      var id='adm_'+kind+'_'+no+'_'+Date.now();
      f.setDoc(f.doc(db,'admin_alerts',id), Object.assign({
        id:id, type:kind, bookNo:no, by:me(), createdAt:nowIso(), createdTs:Date.now(), read:false
      }, extra||{}), {merge:true}).catch(function(){});
    }catch(e){}
  }

  function forceReturn(no, btns){
    if(!ready()||!no) { notify('연결 준비 중입니다'); return; }
    var f=FN(), db=DB(), t=nowIso();
    btns.forEach(function(b){ b.disabled=true; });
    f.getDoc(f.doc(db,'reservations',no)).then(function(s){
      var d=(s&&s.exists&&s.exists())?s.data():{};
      if(d.returned){ notify('이미 반납 처리된 예약입니다'); return null; }
      if(d.cancelled){ notify('취소된 예약은 반납 처리할 수 없습니다'); return null; }
      var patch={ returned:true, returnedAt:t, forceReturned:true, forceReturnedBy:me(), forceReturnedAt:t,
                  adminNote:((d.adminNote?d.adminNote+'\n':'')+'['+t.slice(0,16).replace('T',' ')+'] 관제 강제 반납 처리 ('+me()+')'),
                  clientUpdatedAt:t };
      return f.setDoc(f.doc(db,'reservations',no), patch, {merge:true}).then(function(){
        /* 서버 모드용 가용성 문서가 있으면 제거 (없으면 조용히 무시) */
        try{ if(typeof f.deleteDoc==='function') f.deleteDoc(f.doc(db,'availability',no)).catch(function(){}); }catch(e){}
        logAlert('force_return', no, { userId:d.userId||'', carName:(d.car&&d.car.name)||'' });
        notify('✅ '+no+' 강제 반납 처리 완료 — 손님 앱에도 바로 반영됩니다');
        refreshModal(no);
      });
    }).catch(function(e){
      notify('처리 실패: '+((e&&e.code)||e)+' (관리자 권한 확인)'); console.error(e);
    }).then(function(){ btns.forEach(function(b){ b.disabled=false; }); });
  }

  function forceCancel(no, btns){
    if(!ready()||!no) { notify('연결 준비 중입니다'); return; }
    var f=FN(), db=DB(), t=nowIso();
    var secure=!!(window.CARO_CONFIG&&window.CARO_CONFIG.SECURE_SERVER);
    btns.forEach(function(b){ b.disabled=true; });
    var p;
    if(secure && typeof window.FB_CALL==='function'){
      /* 서버 모드: 함수가 환불 규정·토스 환불까지 처리 (관리자 호출은 함수 쪽 isAdmin 검사) */
      p=window.FB_CALL('cancelReservation', { orderId:no, bookNo:no, byAdmin:true, reason:'관제 취소' })
        .then(function(r){ notify('✅ 취소 완료'+(r&&r.refundAmt!=null?' · 환불 '+Number(r.refundAmt).toLocaleString()+'원':'')); });
    } else {
      p=f.getDoc(f.doc(db,'reservations',no)).then(function(s){
        var d=(s&&s.exists&&s.exists())?s.data():{};
        if(d.cancelled){ notify('이미 취소된 예약입니다'); return null; }
        if(d.returned){ notify('반납 완료된 예약은 취소할 수 없습니다'); return null; }
        var patch={ cancelled:true, cancelledAt:t, cancelledBy:'admin:'+me(), cancelReason:'관제 취소',
                    refundPct:(d.refundPct||0), refundAmt:(d.refundAmt||0), manualRefund:true,
                    adminNote:((d.adminNote?d.adminNote+'\n':'')+'['+t.slice(0,16).replace('T',' ')+'] 관제 예약 취소 ('+me()+') — 환불은 토스 콘솔에서 수동 처리'),
                    clientUpdatedAt:t };
        return f.setDoc(f.doc(db,'reservations',no), patch, {merge:true}).then(function(){
          try{ if(typeof f.deleteDoc==='function') f.deleteDoc(f.doc(db,'availability',no)).catch(function(){}); }catch(e){}
          logAlert('force_cancel', no, { userId:d.userId||'', manualRefund:true, total:d.total||0 });
          notify('✅ '+no+' 취소 처리 완료 — 결제된 금액은 토스 콘솔에서 수동 환불하세요 (테스트 모드)');
        });
      });
    }
    p.catch(function(e){ notify('처리 실패: '+((e&&e.code)||(e&&e.message)||e)); console.error(e); })
     .then(function(){ btns.forEach(function(b){ b.disabled=false; }); refreshModal(no); });
  }

  /* 예약 관리 모달 하단에 버튼 주입 */
  function inject(){
    var save=document.getElementById('rmSaveBtn'); if(!save) return false;
    var foot=save.parentNode; if(!foot || foot.querySelector('.fr-wrap')) return true;
    css();
    var wrap=document.createElement('div'); wrap.className='fr-wrap';
    var bRet=document.createElement('button'); bRet.className='fr-btn ret'; bRet.textContent='강제 반납 처리';
    var bCan=document.createElement('button'); bCan.className='fr-btn can'; bCan.textContent='예약 취소 처리';
    wrap.appendChild(bRet); wrap.appendChild(bCan);
    var note=document.createElement('div'); note.className='fr-note';
    note.textContent=(window.CARO_CONFIG&&window.CARO_CONFIG.SECURE_SERVER)
      ? '취소 시 환불은 서버(cancelReservation)가 환불 규정대로 처리합니다.'
      : '테스트 모드: 취소해도 카드 환불은 자동으로 되지 않습니다 — 토스 콘솔에서 수동 환불하세요.';
    foot.insertBefore(wrap, foot.firstChild);
    foot.appendChild(note);
    twoStep(bRet, '강제 반납 처리', '한 번 더 누르면 반납 확정', function(){ forceReturn(curNo(), [bRet,bCan]); });
    twoStep(bCan, '예약 취소 처리', '한 번 더 누르면 취소 확정', function(){ forceCancel(curNo(), [bRet,bCan]); });
    return true;
  }
  var n=0, iv=setInterval(function(){ n++; if(inject()||n>120) clearInterval(iv); }, 500);

  /* 표의 [관리] 버튼이 아직 '다음 단계' 토스트만 띄우는 경우를 대비 — admin-manage.js 가 연결하므로 보통 불필요 */
  console.log('[CARO 관제] ✅ 강제 반납 / 취소 v1 로드');
})();
