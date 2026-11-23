/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 운영 관리 "설정 > 현황판 기기"  v1  (2026-11-23 · v110.45)
   ───────────────────────────────────────────────────────────
   사무실 현황판(board.html · 태블릿 전용 앱)을 연결하고 끊는 곳. 최고관리자에게만 보인다.
     · [연결 코드 만들기] → 숫자 8자리(10분 · 1회용) → 현황판 기기에 입력
     · 현황판 기기는 직원 계정으로 로그인하지 않는다. 보기 전용 열쇠만 받아, 서버가 만들어 주는 화면 내용(이름은 가린 값)만 받는다
     · [연결 끊기] → 1분 안에 그 현황판이 꺼지고 연결 화면으로 돌아간다
   서버 함수: boardPairCreate · boardKeys (서버 v107.10 부터)
   적용: admin-ops.html </body> 위  <script src="admin-board.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var CARD_ID='boardCard', list=[], srvNow=0, got=0, loading=false, err='', code=null, codeExp=0, timer=null;
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function isSuper(){ return !!(window.caroPerms&&window.caroPerms.super); }
  function call(name,data){ if(typeof window.FB_CALL!=='function') return Promise.reject(new Error('서버 연결 준비 중입니다')); return window.FB_CALL(name,data||{}); }
  function say(m){ try{ if(typeof window.toast==='function') window.toast(m); }catch(e){} }
  function ask(m){ try{ if(typeof window.caroConfirm==='function') return window.caroConfirm(m); }catch(e){} return Promise.resolve(window.confirm(m)); }
  function p2(n){ return (n<10?'0':'')+n; }
  function when(ms){ if(!ms) return '—'; var d=new Date(ms); return (d.getMonth()+1)+'/'+d.getDate()+' '+p2(d.getHours())+':'+p2(d.getMinutes()); }
  function seen(ms){ if(!ms) return '아직 접속 없음'; var now=srvNow?(srvNow+(Date.now()-got)):Date.now(), m=Math.round((now-ms)/60000);
    if(m<=6) return '<em style="font-style:normal;font-weight:700;color:var(--ok)">지금 켜져 있음</em>'; if(m<60) return m+'분 전까지 켜져 있었음'; if(m<1440) return Math.floor(m/60)+'시간 전까지 켜져 있었음'; return when(ms)+' 이후 접속 없음'; }
  function errMsg(e){ var c=String((e&&e.code)||'').replace(/^functions\//,''); if(c==='permission-denied') return '최고관리자만 쓸 수 있습니다.'; if(c==='not-found'&&!/기기/.test((e&&e.message)||'')) return '서버가 아직 새 버전(v107.10)이 아닙니다. 서버 함수를 먼저 올려 주세요.';
    return (e&&e.message&&!/internal/i.test(e.message))?e.message:'서버에 연결하지 못했습니다. 잠시 뒤 다시 해 주세요.'; }

  var st=document.createElement('style');
  st.textContent=
    '#'+CARD_ID+'{grid-column:1/-1;}'
   +'#'+CARD_ID+' .bd-note{font-size:12.5px;line-height:1.6;color:var(--muted);margin-bottom:12px;}'
   +'#'+CARD_ID+' .bd-new{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px;}'
   +'#'+CARD_ID+' .bd-new input{flex:1 1 200px;min-width:0;height:36px;border-radius:9px;border:1px solid var(--border2);background:var(--panel2);color:var(--txt);padding:0 11px;font:inherit;font-size:13px;}'
   +'#'+CARD_ID+' .bd-code{border:1px solid var(--gold);border-radius:12px;padding:14px 16px;margin-bottom:12px;background:var(--sel-bg,rgba(200,169,110,.08));display:flex;gap:16px;align-items:center;flex-wrap:wrap;}'
   +'#'+CARD_ID+' .bd-code b{font-family:"Saira",sans-serif;font-size:34px;letter-spacing:4px;color:var(--txt);font-variant-numeric:tabular-nums;white-space:nowrap;}'
   +'#'+CARD_ID+' .bd-code span{font-size:12.5px;line-height:1.55;color:var(--muted);flex:1 1 220px;}'
   +'#'+CARD_ID+' .bd-code em{font-style:normal;color:var(--gold-soft);font-weight:700;}'
   +'#'+CARD_ID+' .bd-row{display:flex;gap:12px;align-items:center;padding:11px 2px;border-top:1px solid var(--border);}'
   +'#'+CARD_ID+' .bd-row .nm{flex:1 1 auto;min-width:0;}'
   +'#'+CARD_ID+' .bd-row .nm b{display:block;font-size:14px;color:var(--txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
   +'#'+CARD_ID+' .bd-row .nm span{display:block;font-size:12px;color:var(--muted);margin-top:2px;}'
   +'#'+CARD_ID+' .bd-row.off{opacity:.55;}'
   +'#'+CARD_ID+' .bd-row button{flex:0 0 auto;white-space:nowrap;}'
   +'#'+CARD_ID+' .bd-empty{padding:16px 2px;font-size:13px;color:var(--muted);border-top:1px solid var(--border);}'
   +'#'+CARD_ID+' .bd-err{font-size:12.5px;color:var(--bad);margin-bottom:10px;line-height:1.5;}';
  document.head.appendChild(st);

  function card(){
    var c=document.getElementById(CARD_ID); if(c) return c;
    var g=document.querySelector('#tab-set .grid'); if(!g) return null;
    c=document.createElement('div'); c.className='card'; c.id=CARD_ID;
    c.innerHTML='<div class="card-hd"><h3>현황판 기기</h3><button class="btn sm" id="bd-refresh">새로 고침</button></div><div class="panel-body" id="bd-body"></div>';
    g.appendChild(c);
    c.addEventListener('click',onClick);
    return c;
  }
  function paint(){
    var c=card(); if(!c) return; var b=document.getElementById('bd-body'); if(!b) return;
    var curIn=document.getElementById('bd-name'); if(curIn) lastName=curIn.value;   /* 다시 그려도 입력하던 이름이 지워지지 않게 */
    var act=list.filter(function(x){return !x.revoked;}), old=list.filter(function(x){return x.revoked;});
    var h='<div class="bd-note">사무실 모니터에 띄우는 현황판을 연결하는 곳입니다. 현황판 기기는 <b>직원 계정으로 로그인하지 않고</b> 보기 전용 열쇠만 받습니다. '
         +'그 열쇠로는 화면 내용(이름은 가린 값)을 받는 것 말고는 아무것도 할 수 없고, 아래에서 끊으면 1분 안에 꺼집니다.</div>';
    if(err) h+='<div class="bd-err">'+esc(err)+'</div>';
    if(code){ var left=Math.max(0,Math.round((codeExp-Date.now())/1000));
      h+='<div class="bd-code"><b>'+esc(code.slice(0,4)+' '+code.slice(4))+'</b><span>현황판 화면에 이 숫자 8자리를 누르고 [연결] 을 누르세요.<br><em>'+Math.floor(left/60)+'분 '+p2(left%60)+'초</em> 뒤에 못 쓰게 됩니다 · 한 번만 쓸 수 있습니다 · 다른 사람에게 보여 주지 마세요.</span><button class="btn sm" data-a="hide">닫기</button></div>'; }
    h+='<div class="bd-new"><input id="bd-name" maxlength="30" placeholder="현황판 이름 (예: 사무실 현황판)" value="'+esc(lastName)+'"><button class="btn sm gold" data-a="new">연결 코드 만들기</button></div>';
    if(loading&&!list.length) h+='<div class="bd-empty">불러오는 중입니다</div>';
    else if(!act.length) h+='<div class="bd-empty">연결된 현황판이 없습니다. 위 단추로 연결 코드를 만들어 현황판 화면에 입력하세요.</div>';
    act.forEach(function(x){ h+='<div class="bd-row"><div class="nm"><b>'+esc(x.name)+'</b><span>'+when(x.createdAtMs)+' 연결 · '+seen(x.lastSeenMs)+'</span></div><button class="btn sm" data-a="revoke" data-id="'+esc(x.id)+'" data-nm="'+esc(x.name)+'">연결 끊기</button></div>'; });
    old.forEach(function(x){ h+='<div class="bd-row off"><div class="nm"><b>'+esc(x.name)+'</b><span>연결 끊음 · '+when(x.createdAtMs)+' 에 연결했던 기기</span></div><button class="btn sm" data-a="remove" data-id="'+esc(x.id)+'">목록에서 지우기</button></div>'; });
    var f=document.activeElement&&document.activeElement.id==='bd-name', pos=f?document.activeElement.selectionStart:0;
    b.innerHTML=h;
    if(f){ var i=document.getElementById('bd-name'); if(i){ i.focus(); try{ i.setSelectionRange(pos,pos); }catch(e){} } }
  }
  var lastName='', codeSeen=false;
  function load(){ if(!isSuper()||loading) return; loading=true;
    call('boardKeys',{action:'list'}).then(function(r){ var before=list.filter(function(x){return !x.revoked;}).length; list=(r&&r.list)||[]; srvNow=(r&&r.now)||0; got=Date.now(); err='';
        if(code&&codeSeen&&list.filter(function(x){return !x.revoked;}).length>before){ code=null; say('현황판이 연결되었습니다'); } codeSeen=true; })
      .catch(function(e){ err=errMsg(e); }).then(function(){ loading=false; paint(); }); }
  function onClick(e){
    var t=e.target; if(t.id==='bd-refresh'){ load(); return; }
    var a=t.getAttribute&&t.getAttribute('data-a'); if(!a) return;
    var nmEl=document.getElementById('bd-name'); if(nmEl) lastName=nmEl.value;
    if(a==='hide'){ code=null; paint(); return; }
    if(a==='new'){ t.disabled=true;
      call('boardPairCreate',{name:(lastName||'').trim()||'사무실 현황판'}).then(function(r){ code=String(r.code||''); codeExp=Date.now()+(Number(r.expMin)||10)*60000; err=''; lastName=''; var i2=document.getElementById('bd-name'); if(i2) i2.value=''; say('연결 코드를 만들었습니다'); load(); })
        .catch(function(x){ err=errMsg(x); }).then(function(){ paint(); });
      return; }
    var id=t.getAttribute('data-id');
    if(a==='revoke'){ ask('「'+(t.getAttribute('data-nm')||'현황판')+'」 연결을 끊을까요?\n1분 안에 그 화면이 꺼지고, 다시 쓰려면 새 연결 코드가 필요합니다.').then(function(ok){ if(!ok) return;
        call('boardKeys',{action:'revoke',id:id}).then(function(r){ list=(r&&r.list)||list; srvNow=(r&&r.now)||srvNow; got=Date.now(); err=''; say('연결을 끊었습니다'); }).catch(function(x){ err=errMsg(x); }).then(paint); });
      return; }
    if(a==='remove'){ call('boardKeys',{action:'remove',id:id}).then(function(r){ list=(r&&r.list)||list; err=''; }).catch(function(x){ err=errMsg(x); }).then(paint); }
  }
  function visible(){ var s=document.getElementById('tab-set'); return !!s&&!s.classList.contains('hide')&&s.offsetParent!==null; }
  /* 최고관리자로 확인되면 카드를 만들고, 설정 탭이 보이는 동안 30초마다 목록을 새로 받는다 */
  var made=false, lastLoad=0;
  setInterval(function(){
    if(!isSuper()){ var c=document.getElementById(CARD_ID); if(c) c.style.display='none'; return; }
    if(!made){ if(!card()) return; made=true; paint(); }
    document.getElementById(CARD_ID).style.display='';
    if(visible()){ if(Date.now()-lastLoad>30000){ lastLoad=Date.now(); load(); } else if(code){ if(Date.now()>codeExp){ code=null; load(); } paint(); } }
  },1000);
})();
