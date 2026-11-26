/* ═══════════════════════════════════════════════════════════════
   caro-swap.js — ★[v110.59] 예약 차량 변경 동의 (고객 앱)
   ───────────────────────────────────────────────────────────────
   운영팀이 '차량 교체' 를 보내면(staffSwapCar) 예약에 swapRequest 가 붙는다.
   → 앱을 열면 창이 떠서 [동의] / [거절] 을 고른다 (answerCarSwap). 동의해야 예약 차량이 바뀐다.
   · 요금은 그대로 · 새 차는 주행 전 사진을 다시 찍은 뒤 문을 연다 (서버가 처리)
   · [나중에] 를 누르면 10분 뒤 다시 묻는다. 예약 화면에서도 언제든 다시 볼 수 있다(홈 진입 시 확인).
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroSwap) return; window.__caroSwap = true;
  var later = {}, busy = false;
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function toast(m){ try{ if(window.showToast) showToast(m); else alert(m); }catch(e){} }
  function p2(n){ return n<10?'0'+n:''+n; }
  function fmt(d){ d = d instanceof Date ? d : new Date(d); if(isNaN(d)) return ''; return (d.getMonth()+1)+'/'+d.getDate()+' '+p2(d.getHours())+':'+p2(d.getMinutes()); }
  function errOf(e){ return String((e&&e.message)||(e&&e.code)||'잠시 후 다시 시도해 주세요').replace(/^functions\//,''); }

  function css(){
    if(document.getElementById('csw-css')) return;
    var s=document.createElement('style'); s.id='csw-css';
    s.textContent=
      '#csw-ov{position:fixed;inset:0;z-index:2147482000;background:rgba(20,22,28,.5);display:flex;align-items:flex-end;justify-content:center;}'
     +'#csw-ov .csw-s{background:#f7f9fb;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding:20px 18px calc(18px + env(safe-area-inset-bottom,0px));box-shadow:0 -10px 40px rgba(0,0,0,.2);}'
     +'#csw-ov .csw-t{font-size:1.1rem;font-weight:800;color:#18191c;margin-bottom:6px;}'
     +'#csw-ov .csw-d{font-size:.86rem;color:#5a6470;line-height:1.55;margin-bottom:14px;}'
     +'#csw-ov .csw-cars{display:flex;align-items:center;gap:10px;margin-bottom:12px;}'
     +'#csw-ov .csw-c{flex:1;background:#fff;border:1px solid #e8eaee;border-radius:14px;padding:12px;}'
     +'#csw-ov .csw-c.to{border-color:#18191c;}'
     +'#csw-ov .csw-c .l{font-size:.72rem;color:#8b929d;} #csw-ov .csw-c .n{font-size:.98rem;font-weight:800;color:#18191c;margin-top:2px;} #csw-ov .csw-c .p{font-size:.8rem;color:#5a6470;}'
     +'#csw-ov .csw-ar{font-size:1.2rem;color:#8b929d;}'
     +'#csw-ov .csw-why{background:#fff;border:1px solid #e8eaee;border-radius:12px;padding:11px 12px;font-size:.84rem;color:#18191c;line-height:1.5;margin-bottom:10px;}'
     +'#csw-ov .csw-note{font-size:.78rem;color:#5a6470;line-height:1.55;margin-bottom:14px;}'
     +'#csw-ov .csw-ok{width:100%;border:none;border-radius:14px;padding:15px;font-size:1rem;font-weight:800;color:#fff;background:linear-gradient(135deg,#20232b,#14151a);cursor:pointer;font-family:inherit;}'
     +'#csw-ov .csw-row{display:flex;gap:8px;margin-top:8px;}'
     +'#csw-ov .csw-row button{flex:1;border:1px solid #d5dae1;background:#fff;border-radius:12px;padding:12px;font-size:.9rem;font-weight:700;color:#18191c;cursor:pointer;font-family:inherit;}'
     +'#csw-ov .csw-row .no{color:#b0413f;}'
     +'#csw-ov button:disabled{opacity:.5;}';
    document.head.appendChild(s);
  }

  function pending(){
    var rs = window.myReservations || [];
    for(var i=0;i<rs.length;i++){ var r=rs[i]; var q=r&&r.swapRequest; if(q&&q.status==='pending'&&!r.returned&&r.status!=='cancelled'&&!(later[q.id]&&Date.now()<later[q.id])) return r; }
    return null;
  }

  function answer(r, accept, ov){
    if(busy) return; busy=true;
    var q=r.swapRequest; ov.querySelectorAll('button').forEach(function(b){ b.disabled=true; });
    var call = (typeof window.FB_CALL==='function') ? window.FB_CALL('answerCarSwap',{ bookNo:r.bookNo, swapId:q.id, accept:accept }) : Promise.reject(new Error('서버 연결 준비 중입니다'));
    call.then(function(res){
      ov.remove();
      if(res && res.status==='accepted'){
        try{ r.car = Object.assign({}, r.car||{}, res.toCar||q.toCar); r.photoCount=0; r.firstUnlockAt=null; }catch(e){}
        try{ r.swapRequest=null; }catch(e){}
        toast('✅ 예약 차량이 '+((q.toCar&&q.toCar.name)||'새 차량')+(q.toCar&&q.toCar.carNumber?' ('+q.toCar.carNumber+')':'')+' 으로 바뀌었습니다. 주행 전 사진을 찍고 문을 열어 주세요.');
        try{ if(window.renderMyReservations) renderMyReservations(); if(window.renderCars) renderCars(); if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
      } else if(res && res.status==='rejected'){
        try{ r.swapRequest=null; }catch(e){}
        toast('차량 변경을 거절했습니다. 운영팀이 곧 연락드립니다.');
      } else toast('이미 처리된 요청입니다.');
    }).catch(function(e){
      toast('⚠ '+errOf(e));
      ov.querySelectorAll('button').forEach(function(b){ b.disabled=false; });
    }).then(function(){ busy=false; });
  }

  function show(r){
    if(document.getElementById('csw-ov')) return;
    css();
    var q=r.swapRequest, f=q.fromCar||r.car||{}, t=q.toCar||{};
    var ov=document.createElement('div'); ov.id='csw-ov';
    ov.innerHTML='<div class="csw-s">'
      +'<div class="csw-t">예약 차량 변경 요청</div>'
      +'<div class="csw-d">'+esc(fmt(r.start))+' ~ '+esc(fmt(r.end))+' 예약 · 운영팀이 다른 차량으로 바꿔 드리려고 합니다.</div>'
      +'<div class="csw-cars"><div class="csw-c"><div class="l">지금 차량</div><div class="n">'+esc(f.name||'-')+'</div><div class="p">'+esc(f.carNumber||'')+'</div></div>'
      +'<span class="csw-ar">→</span>'
      +'<div class="csw-c to"><div class="l">바뀔 차량</div><div class="n">'+esc(t.name||'-')+'</div><div class="p">'+esc(t.carNumber||'')+'</div></div></div>'
      +(q.reason?'<div class="csw-why"><b>사유</b> · '+esc(q.reason)+'</div>':'')
      +'<div class="csw-note">· 요금은 원래 예약 그대로입니다 (추가 요금 없음)<br>· 동의하시면 새 차량의 주행 전 사진을 찍은 뒤 문을 열 수 있어요</div>'
      +'<button class="csw-ok" id="cswOk">동의하고 차량 바꾸기</button>'
      +'<div class="csw-row"><button id="cswLater">나중에</button><button class="no" id="cswNo">거절</button></div>'
      +'</div>';
    document.body.appendChild(ov);
    ov.querySelector('#cswOk').onclick=function(){ answer(r, true, ov); };
    ov.querySelector('#cswLater').onclick=function(){ later[q.id]=Date.now()+10*60000; ov.remove(); };
    var noArmed=false, noBtn=ov.querySelector('#cswNo');
    noBtn.onclick=function(){ if(!noArmed){ noArmed=true; noBtn.textContent='한 번 더 누르면 거절'; setTimeout(function(){ noArmed=false; noBtn.textContent='거절'; },4000); return; } answer(r, false, ov); };
  }

  function tick(){ try{ var r=pending(); if(r) show(r); }catch(e){} }
  setInterval(tick, 4000);
  setTimeout(tick, 2500);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tick(); });
  window.caroSwapCheck = tick;
  console.log('✅ 예약 차량 변경 동의 (caro-swap v1)');
})();
