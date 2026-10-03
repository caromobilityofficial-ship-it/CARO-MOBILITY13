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
      '.fr-wrap{display:flex;gap:8px;flex-wrap:wrap;margin-right:auto;}'   /* ★[24차] 모달 바닥에서는 .rm-ft .fr-wrap 규칙이 한 줄 전체를 차지하게 덮어쓴다 */
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

  /* 강제 반납 뒤 차 문 잠그기 (기기가 연결돼 있을 때만) */
  function lockAfterReturn(d){
    var carId = (d && d.car && (d.car.id != null ? d.car.id : d.car.carId));
    if(carId == null) return;
    var map = window.CARO_DEVICE_MAP || {};
    var dev = map[String(carId)] || map[carId];
    if(!dev) return;                                   // IoT 미연결 차량 — 조용히 넘어간다
    if(!window.confirm('강제 반납했습니다.\n이 차량의 문도 지금 잠글까요?\n(기기 ' + dev + ')')) return;
    var f=FN(), db=DB();
    if(!f || !db || typeof f.setDoc!=='function') { notify('⚠ 잠금 명령을 보낼 수 없습니다 (연결 대기)'); return; }
    var cmdId='cmd_'+Date.now()+'_'+Math.random().toString(36).slice(2,8);
    /* ★[14차] 서버 함수(staffCommand) 우선, 배포 전(not-found)이면 예전처럼 직접 쓰기 */
    var direct=function(){ return f.setDoc(f.doc(db,'devices',dev,'commands',cmdId), {
      type:'lock', status:'pending', issuedBy:'admin', issuedByEmail:me(),
      issuedAt:(typeof f.serverTimestamp==='function'?f.serverTimestamp():new Date()), timestamp:Date.now()
    }); };
    var queued=(typeof window.FB_CALL==='function')
      ? window.FB_CALL('staffCommand',{deviceId:dev,type:'lock'}).catch(function(e){
          if(/not-found|unimplemented/.test((e&&e.code)||'')) return direct();
          throw e; })
      : direct();
    queued.then(function(){ notify('🔒 문 잠금 명령 전송 — 주차 절전 중이면 최대 80초 걸립니다'); })
      .catch(function(e){ notify('⚠ 잠금 명령 전송 실패: '+((e&&e.code)||e)); });
  }

  function hasFn(){ return typeof window.FB_CALL==='function'; }
  function isNotFound(e){ return /not-found|unimplemented/.test((e&&e.code)||'') && /function|not found/i.test(((e&&e.code)||'')+((e&&e.message)||'')); }

  /* ★[23차] 강제 반납 = 서버 staffReturn — 고객 반납과 같은 정산(초과요금→미납 기록)·잠금 명령·availability 삭제·사유 기록.
     예전엔 운영화면이 returned:true 만 직접 써서 요금이 안 남고, 그 시간대 예약이 계속 막혀 있었다. 서버 함수가 없을 때만 예전 방식. */
  function forceReturn(no, btns){
    if(!ready()||!no) { notify('연결 준비 중입니다'); return; }
    var f=FN(), db=DB(), t=nowIso();
    var reason=window.prompt('강제 반납 사유를 적어 주세요 (고객에게는 보이지 않고 기록용)', '고객 연락 두절');
    if(reason===null){ return; }
    var waive=false;
    if(hasFn()) waive=window.confirm('초과 이용 요금을 면제할까요?\n[확인] = 면제(차량 고장·회사 귀책 등)   [취소] = 규정대로 청구');
    btns.forEach(function(b){ b.disabled=true; });
    var legacy=function(){
      return f.getDoc(f.doc(db,'reservations',no)).then(function(s){
        var d=(s&&s.exists&&s.exists())?s.data():{};
        if(d.returned){ notify('이미 반납 처리된 예약입니다'); return null; }
        if(d.cancelled){ notify('취소된 예약은 반납 처리할 수 없습니다'); return null; }
        var patch={ returned:true, returnedAt:t, forceReturned:true, forceReturnedBy:me(), forceReturnedAt:t, forceReason:reason,
                    adminNote:((d.adminNote?d.adminNote+'\n':'')+'['+t.slice(0,16).replace('T',' ')+'] 관제 강제 반납 처리 ('+me()+') '+reason), clientUpdatedAt:t };
        return f.setDoc(f.doc(db,'reservations',no), patch, {merge:true}).then(function(){
          logAlert('force_return', no, { userId:d.userId||'', carName:(d.car&&d.car.name)||'' });
          notify('✅ '+no+' 강제 반납 처리 완료 (서버 함수 미배포 — 초과요금·가용성은 수동 확인 필요)');
          try{ lockAfterReturn(d); }catch(e){}
        });
      });
    };
    var p=hasFn()
      ? window.FB_CALL('staffReturn',{ bookNo:no, reason:reason, waiveFees:waive }).then(function(r){
          if(r&&r.already){ notify('이미 반납 처리된 예약입니다'); return; }
          var amt=Number(r&&r.amount)||0;
          notify('✅ '+no+' 강제 반납 완료'+(amt>0?(waive?' · 추가요금 '+amt.toLocaleString()+'원 면제':' · 추가요금 '+amt.toLocaleString()+'원 미납 등록(고객 앱에서 결제)'):' · 추가요금 없음')+(r&&r.lockCmdId?' · 문 잠금 명령 전송':' · 단말 미연결(잠금 명령 없음)'));
          logAlert('force_return', no, { amount:amt, waived:waive, reason:reason });
        }).catch(function(e){ if(isNotFound(e)) return legacy(); throw e; })
      : legacy();
    p.catch(function(e){ notify('처리 실패: '+((e&&e.message)||(e&&e.code)||e)); console.error(e); })
     .then(function(){ btns.forEach(function(b){ b.disabled=false; }); refreshModal(no); });
  }

  /* ★[23차] 예약 취소 = 서버 cancelReservation(직원) — 환불률을 직원이 정하고(기본: 고객 규정) 토스 환불까지 서버가 처리.
     예전엔 CARO_CONFIG 가 운영화면에 없어 서버 호출 분기가 항상 꺼져 있었고, 직접 쓰기만 돼서 환불이 안 됐다. */
  function forceCancel(no, btns){
    if(!ready()||!no) { notify('연결 준비 중입니다'); return; }
    var f=FN(), db=DB(), t=nowIso();
    var reason=window.prompt('취소 사유 (기록용)', '고객 요청');
    if(reason===null) return;
    var pctIn=window.prompt('환불 비율(%)을 적어 주세요. 비워 두면 고객 취소 규정대로 계산합니다.\n(예: 100 = 전액 환불, 0 = 환불 없음)', '');
    if(pctIn===null) return;
    var pct=(pctIn.trim()==='')?null:Math.max(0,Math.min(100,parseInt(pctIn,10)||0));
    btns.forEach(function(b){ b.disabled=true; });
    var legacy=function(){
      return f.getDoc(f.doc(db,'reservations',no)).then(function(s){
        var d=(s&&s.exists&&s.exists())?s.data():{};
        if(d.cancelled){ notify('이미 취소된 예약입니다'); return null; }
        if(d.returned){ notify('반납 완료된 예약은 취소할 수 없습니다'); return null; }
        var patch={ cancelled:true, status:'cancelled', cancelledAt:t, cancelledBy:'admin:'+me(), cancelReason:reason, manualRefund:true,
                    adminNote:((d.adminNote?d.adminNote+'\n':'')+'['+t.slice(0,16).replace('T',' ')+'] 관제 예약 취소 ('+me()+') — 환불은 토스 콘솔에서 수동 처리'), clientUpdatedAt:t };
        return f.setDoc(f.doc(db,'reservations',no), patch, {merge:true}).then(function(){
          logAlert('force_cancel', no, { userId:d.userId||'', manualRefund:true, total:d.total||0 });
          notify('✅ '+no+' 취소 처리 완료 — 결제된 금액은 토스 콘솔에서 수동 환불하세요 (서버 함수 미배포)');
        });
      });
    };
    var data={ bookNo:no, reason:reason }; if(pct!=null) data.refundPct=pct;
    var p=hasFn()
      ? window.FB_CALL('cancelReservation', data).then(function(r){
          if(r&&r.already){ notify('이미 취소된 예약입니다'); return; }
          notify('✅ 취소 완료 · 환불 '+(Number(r&&r.refundAmt)||0).toLocaleString()+'원 ('+(r&&r.refundPct!=null?r.refundPct:0)+'%)'+(r&&r.manualRefund?' — ⚠ 자동 환불 안 됨: 알림함에서 수동 환불 처리 필요':' — 토스 자동 환불 완료'));
        }).catch(function(e){ if(isNotFound(e)) return legacy(); throw e; })
      : legacy();
    p.catch(function(e){ notify('처리 실패: '+((e&&e.message)||(e&&e.code)||e)); console.error(e); })
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
    note.textContent='강제 반납: 초과요금 계산·미납 등록·문 잠금·가용성 정리까지 서버가 처리합니다. 예약 취소: 환불 비율을 정하면 서버가 토스 환불까지 처리합니다.';
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
