/* ═════════════════════════════════════════════════
   CARO MOBILITY — 운영관리 · 예약 차량 교체 v1 (2026-11-27)
   ─────────────────────────────────────────────────
   · 고객이 예약한 차를 쓸 수 없을 때(고장 · 사고 · 단말 이상 · 배터리) 다른 차로 바꾼다.
   · 예약 [관리] 모달(admin-manage.js) 바닥에 [차량 교체] 버튼을 붙인다.
   · 직원이 바꿀 차와 사유를 고르면 서버(staffSwapCar)가 '변경 요청' 을 만들고 고객에게 알림을 보낸다.
     고객이 앱에서 [동의] 를 눌러야 실제로 차가 바뀐다(answerCarSwap). 거절하면 그대로 두고 알림함에 뜬다.
   · 요금은 원래 예약 그대로 · 새 차는 주행 전 사진을 다시 찍어야 문이 열린다 (서버가 처리).
══════════════════════════════════════════════════ */
(function(){
  'use strict';
  function FN(){ return window.FB_FN; }
  function DB(){ return window.FB_DB; }
  function notify(m){ try{ if(typeof window.toast==='function'){ window.toast(m); return; } }catch(e){} try{ alert(m); }catch(e){} }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function curNo(){ var el=document.getElementById('rmNo'); return el?el.textContent.trim():''; }
  function errOf(e){ var m=(e&&e.message)||(e&&e.code)||String(e||''); if(/not-found/.test((e&&e.code)||'')&&/function/i.test(m)) return '서버에 차량 교체 기능이 아직 없습니다 (functions 배포 필요)'; return m.replace(/^functions\//,''); }

  function css(){
    if(document.getElementById('sw-css')) return;
    var s=document.createElement('style'); s.id='sw-css';
    s.textContent=
      '.fr-btn.swap{border-color:#3f6fb5;color:#8fb3ea;}'
     +'.sw-state{width:100%;font-size:12px;line-height:1.5;padding:8px 10px;border-radius:9px;background:rgba(63,111,181,.12);color:#8fb3ea;display:none;}'
     +'#sw-ov{position:fixed;inset:0;z-index:100000;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;}'
     +'#sw-ov .sw-box{background:var(--panel,#16181d);color:var(--txt,#e6e6e6);border:1px solid var(--border,#2b2e34);border-radius:14px;width:min(480px,94vw);max-height:86vh;display:flex;flex-direction:column;}'
     +'#sw-ov .sw-hd{padding:14px 16px;font-weight:800;font-size:15px;border-bottom:1px solid var(--border,#2b2e34);}'
     +'#sw-ov .sw-bd{padding:12px 16px;overflow:auto;}'
     +'#sw-ov .sw-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border:1px solid var(--border,#2b2e34);border-radius:10px;margin-bottom:7px;cursor:pointer;}'
     +'#sw-ov .sw-row.on{border-color:#3f6fb5;background:rgba(63,111,181,.14);}'
     +'#sw-ov .sw-row .n{font-weight:700;flex:1;} #sw-ov .sw-row .s{font-size:11.5px;color:var(--muted,#999);}'
     +'#sw-ov .sw-row.dis{opacity:.4;cursor:default;}'
     +'#sw-ov textarea{width:100%;box-sizing:border-box;min-height:58px;border-radius:9px;border:1px solid var(--border,#2b2e34);background:var(--panel2,#1c1f25);color:inherit;padding:9px;font:inherit;font-size:13px;}'
     +'#sw-ov .sw-ft{display:flex;gap:8px;padding:12px 16px;border-top:1px solid var(--border,#2b2e34);}'
     +'#sw-ov .sw-ft button{flex:1;padding:10px;border-radius:9px;border:1px solid var(--border,#333);background:var(--panel2,#1c1f25);color:inherit;font-weight:700;cursor:pointer;}'
     +'#sw-ov .sw-ft .go{background:#3f6fb5;border-color:#3f6fb5;color:#fff;} #sw-ov .sw-ft .go:disabled{opacity:.45;}'
     +'#sw-ov .sw-lbl{font-size:12px;color:var(--muted,#999);margin:10px 0 6px;}';
    document.head.appendChild(s);
  }

  /* 차량 목록 (일반 + 블랙라벨) */
  function loadCars(){
    var f=FN(), db=DB();
    if(!f||!db||!f.getDocs||!f.collection) return Promise.resolve([]);
    return Promise.all(['cars','bl_cars'].map(function(col){
      return f.getDocs(f.collection(db,col)).then(function(snap){ var a=[]; snap.forEach(function(d){ var x=d.data()||{}; a.push({col:col, id:String(x.id!=null?x.id:d.id), name:x.name||x.model||'차량', num:x.carNumber||x.plate||'', region:x.region||'', status:String(x.status||''), dis:x.devDisabled===true}); }); return a; }).catch(function(){ return []; });
    })).then(function(l){ return l[0].concat(l[1]); });
  }

  function openPicker(no, d){
    css();
    var old=document.getElementById('sw-ov'); if(old) old.remove();
    var curId=String((d.carId!=null?d.carId:(d.car&&d.car.id))||''), curCol=d.col||'cars';
    var ov=document.createElement('div'); ov.id='sw-ov';
    ov.innerHTML='<div class="sw-box"><div class="sw-hd">차량 교체 — '+esc(no)+'</div>'
      +'<div class="sw-bd"><div style="font-size:12.5px;line-height:1.55;color:var(--muted,#aaa)">지금 차량 : <b style="color:inherit">'+esc((d.car&&d.car.name)||'-')+' '+esc((d.car&&(d.car.carNumber||d.car.plate))||'')+'</b><br>바꿀 차를 고르고 사유를 적으면 고객에게 동의 요청이 갑니다. 고객이 동의해야 바뀝니다 · 요금은 그대로입니다.</div>'
      +'<div class="sw-lbl">바꿀 차량</div><div id="swList">불러오는 중…</div>'
      +'<div class="sw-lbl">고객에게 보여 줄 사유</div><textarea id="swWhy" placeholder="예) 예약하신 차량에 고장이 생겨 같은 거점의 다른 차량으로 바꿔 드리려고 합니다."></textarea></div>'
      +'<div class="sw-ft"><button id="swNo">닫기</button><button class="go" id="swGo" disabled>고객에게 변경 요청 보내기</button></div></div>';
    document.body.appendChild(ov);
    var pick=null, list=ov.querySelector('#swList'), go=ov.querySelector('#swGo'), why=ov.querySelector('#swWhy');
    function upd(){ go.disabled=!(pick&&why.value.trim()); }
    why.addEventListener('input',upd);
    ov.querySelector('#swNo').onclick=function(){ ov.remove(); };
    ov.addEventListener('click',function(e){ if(e.target===ov) ov.remove(); });
    loadCars().then(function(cars){
      cars=cars.filter(function(c){ return !(c.id===curId && c.col===curCol); });
      if(!cars.length){ list.textContent='바꿀 수 있는 차량이 없습니다.'; return; }
      list.innerHTML=cars.map(function(c,i){ var bad=c.dis||/unavail|maint|점검|off|disable|사고|고장|불가/i.test(c.status);
        return '<div class="sw-row'+(bad?' dis':'')+'" data-i="'+i+'"><span class="n">'+esc(c.name)+' '+esc(c.num)+(c.col==='bl_cars'?' · 블랙라벨':'')+'</span><span class="s">'+esc(bad?'이용 불가':(c.region||''))+'</span></div>'; }).join('');
      list.querySelectorAll('.sw-row').forEach(function(row){ row.onclick=function(){ if(row.classList.contains('dis')) return; list.querySelectorAll('.sw-row').forEach(function(r){ r.classList.remove('on'); }); row.classList.add('on'); pick=cars[+row.getAttribute('data-i')]; upd(); }; });
    });
    go.onclick=function(){
      if(!pick||!why.value.trim()) return;
      if(typeof window.FB_CALL!=='function'){ notify('서버 연결 준비 중입니다'); return; }
      go.disabled=true; go.textContent='보내는 중…';
      window.FB_CALL('staffSwapCar',{ bookNo:no, carId:pick.id, col:pick.col, reason:why.value.trim() }).then(function(r){
        notify('✅ 고객에게 차량 변경 요청을 보냈습니다 → '+pick.name+' '+pick.num+' (고객이 동의하면 바뀝니다)');
        ov.remove(); try{ if(window.openResManage) openResManage(no); }catch(e){}
      }).catch(function(e){ notify('⚠ 변경 요청 실패: '+errOf(e)); go.disabled=false; go.textContent='고객에게 변경 요청 보내기'; });
    };
  }

  function start(no, btn){
    var f=FN(), db=DB();
    if(!no||!f||!db){ notify('연결 준비 중입니다'); return; }
    btn.disabled=true;
    f.getDoc(f.doc(db,'reservations',no)).then(function(s){
      var d=(s&&s.exists&&s.exists())?s.data():null;
      if(!d){ notify('예약을 찾을 수 없습니다'); return; }
      if(d.cancelled||d.returned){ notify('이미 끝난 예약은 차량을 바꿀 수 없습니다'); return; }
      if(d.swapRequest&&d.swapRequest.status==='pending'){ notify('이미 고객 동의를 기다리는 변경 요청이 있습니다 ('+((d.swapRequest.toCar&&d.swapRequest.toCar.name)||'')+')'); }
      openPicker(no, d);
    }).catch(function(e){ notify('예약을 불러오지 못했습니다: '+errOf(e)); }).then(function(){ btn.disabled=false; });
  }

  /* 모달이 열릴 때마다 '동의 대기' 상태를 보여 준다 */
  function showState(no, box){
    var f=FN(), db=DB(); if(!no||!f||!db){ box.style.display='none'; return; }
    f.getDoc(f.doc(db,'reservations',no)).then(function(s){
      var d=(s&&s.exists&&s.exists())?s.data():{}; var q=d.swapRequest, h=Array.isArray(d.swapHistory)?d.swapHistory:[];
      if(q&&q.status==='pending'){ box.style.display='block'; box.textContent='⏳ 차량 교체 — 고객 동의 대기 중 : '+((q.fromCar&&q.fromCar.name)||'')+' → '+((q.toCar&&q.toCar.name)||'')+' '+((q.toCar&&q.toCar.carNumber)||'')+' (사유 : '+(q.reason||'')+')'; return; }
      var last=h.length?h[h.length-1]:null;
      if(last){ box.style.display='block'; box.textContent=(last.status==='accepted'?'✅ 고객이 차량 교체에 동의함 — 지금 차량 : ':'✖ 고객이 차량 교체를 거절함 — 지금 차량 : ')+((d.car&&d.car.name)||'')+' '+((d.car&&d.car.carNumber)||''); return; }
      box.style.display='none';
    }).catch(function(){ box.style.display='none'; });
  }

  function inject(){
    var save=document.getElementById('rmSaveBtn'); if(!save) return false;
    var foot=save.parentNode; if(!foot) return false;
    var wrap=foot.querySelector('.fr-wrap'); if(!wrap) return false;      /* 강제 반납 버튼 줄에 같이 붙인다 */
    if(wrap.querySelector('.fr-btn.swap')) return true;
    css();
    var b=document.createElement('button'); b.className='fr-btn swap'; b.textContent='차량 교체 (고객 동의)';
    wrap.appendChild(b);
    var st=document.createElement('div'); st.className='sw-state'; foot.appendChild(st);
    b.addEventListener('click',function(){ start(curNo(), b); });
    /* [관리] 를 누를 때마다 상태 다시 읽기 */
    var orig=window.openResManage;
    if(typeof orig==='function' && !orig.__swap){
      window.openResManage=function(no){ var r=orig.apply(this,arguments); setTimeout(function(){ showState(no||curNo(), st); },300); return r; };
      window.openResManage.__swap=true;
    }
    return true;
  }
  var n=0, iv=setInterval(function(){ n++; if(inject()||n>160) clearInterval(iv); }, 500);
  console.log('[CARO 운영] ✅ 차량 교체(고객 동의) v1 로드');
})();
