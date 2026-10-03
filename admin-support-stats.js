/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 상담 통계 (support_chats 집계) v1
   ───────────────────────────────────────────────────────────
   · 고객 상담봇 기록(support_chats)을 실시간 집계
   · KPI(총 상담·해결·상담사 연결·해결율) + 카테고리별 분포 + 최근 상담
   · 최고관리자만 전체 조회 가능 (Firestore 규칙)
   적용: admin.html
     - 탭 버튼:  <button class="tab" data-tab="chat">상담 통계</button>
     - 섹션:     <section id="tab-chat" class="hide"><div id="ssRoot"></div></section>
     - 탭 전환 배열에 'chat' 추가
     - </body> 위:  <script src="admin-support-stats.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var cache=[];
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmt(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;};
    return (d.getMonth()+1)+'/'+d.getDate()+' '+p(d.getHours())+':'+p(d.getMinutes()); }catch(e){ return ''; } }

  function injectCss(){
    if(document.getElementById('ss-css')) return;
    var s=document.createElement('style'); s.id='ss-css';
    s.textContent=
      '#tab-chat .ss-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;}'
     +'.ss-kpi{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;text-align:center;}'
     +'.ss-kpi .v{font-size:26px;font-weight:800;color:var(--gold-soft);font-family:"Oswald",sans-serif;}'
     +'.ss-kpi .l{font-size:12px;color:var(--muted);margin-top:4px;}'
     +'.ss-cat{display:flex;align-items:center;gap:12px;margin-bottom:11px;}'
     +'.ss-cat .nm{width:150px;font-size:13px;color:var(--txt);flex-shrink:0;}'
     +'.ss-cat .track{flex:1;height:14px;background:var(--panel2);border-radius:8px;overflow:hidden;}'
     +'.ss-cat .fill{height:100%;background:linear-gradient(90deg,var(--gold-dim),var(--gold));border-radius:8px;min-width:2px;transition:width .4s;}'
     +'.ss-cat .ct{width:54px;text-align:right;font-size:13px;color:var(--muted);flex-shrink:0;}'
     +'.ss-row{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid var(--border);}'
     +'.ss-row:last-child{border-bottom:none;}'
     +'.ss-row .ss-when{width:74px;font-size:12px;color:var(--muted2);flex-shrink:0;}'
     +'.ss-row .ss-main{flex:1;min-width:0;}'
     +'.ss-row .ss-cl{font-size:13px;color:var(--txt);font-weight:600;}'
     +'.ss-row .ss-sn{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
     +'.ss-row .ss-em{font-size:11px;color:var(--muted2);}'
     +'.ss-badge{font-size:11px;font-weight:700;padding:3px 9px;border-radius:20px;flex-shrink:0;}'
     +'.ss-badge.ok{background:rgba(123,184,154,.16);color:var(--ok);border:1px solid rgba(123,184,154,.4);}'
     +'.ss-badge.esc{background:rgba(224,168,108,.16);color:var(--warn);border:1px solid rgba(224,168,108,.4);}'
     +'.ss-badge.ing{background:rgba(140,145,155,.14);color:var(--muted);border:1px solid rgba(140,145,155,.3);}'
     +'.ss-empty{text-align:center;color:var(--muted);padding:40px 16px;font-size:14px;}'
     +'.ss-empty .ic{font-size:30px;margin-bottom:10px;}';
    document.head.appendChild(s);
  }

  function status(r){ if(r===true) return {k:'ok',t:'해결'}; if(r===false) return {k:'esc',t:'상담사 연결'}; return {k:'ing',t:'진행'}; }

  function render(){
    var root=document.getElementById('ssRoot');
    if(!root) return;
    injectCss();
    var list=cache.slice();

    if(!list.length){
      root.innerHTML='<div class="card"><div class="ss-empty"><div class="ic">💬</div>'
        +'아직 집계된 상담이 없습니다.<br><span style="font-size:12px;color:var(--muted2)">고객이 「카로 상담」을 이용하면 자동으로 기록·집계됩니다.</span></div></div>';
      return;
    }

    var total=list.length, ok=0, escN=0, ing=0, cats={};   /* ★[23차] esc 변수가 esc() 함수를 가려 통계가 깨지던 버그 */
    list.forEach(function(c){
      if(c.resolved===true) ok++; else if(c.resolved===false) escN++; else ing++;
      var k=c.categoryLabel||c.category||'기타';
      cats[k]=(cats[k]||0)+1;
    });
    var done=ok+escN;
    var rate=done? Math.round(ok/done*100):null;

    var catArr=Object.keys(cats).map(function(k){return {k:k,n:cats[k]};}).sort(function(a,b){return b.n-a.n;});
    var max=catArr.length? catArr[0].n:1;

    var recent=list.slice().sort(function(a,b){
      return String(b.createdAt||b.updatedAt||'').localeCompare(String(a.createdAt||a.updatedAt||''));
    }).slice(0,20);

    var h='';
    h+='<div class="ss-kpis">'
      +'<div class="ss-kpi"><div class="v">'+total+'</div><div class="l">총 상담</div></div>'
      +'<div class="ss-kpi"><div class="v" style="color:var(--ok)">'+ok+'</div><div class="l">해결 완료</div></div>'
      +'<div class="ss-kpi"><div class="v" style="color:var(--warn)">'+escN+'</div><div class="l">상담사 연결</div></div>'
      +'<div class="ss-kpi"><div class="v">'+(rate==null?'—':rate+'%')+'</div><div class="l">해결율</div></div>'
      +'</div>';

    h+='<div class="grid" style="grid-template-columns:1fr;gap:16px;">';
    // 카테고리 분포
    h+='<div class="card"><div class="card-hd"><div><h3>카테고리별 문의</h3></div>'
      +'<div style="font-size:12px;color:var(--muted2)">진행 '+ing+'건 포함</div></div><div class="panel-body">';
    catArr.forEach(function(c){
      var pct=Math.round(c.n/max*100);
      h+='<div class="ss-cat"><div class="nm">'+esc(c.k)+'</div>'
        +'<div class="track"><div class="fill" style="width:'+pct+'%"></div></div>'
        +'<div class="ct">'+c.n+'건</div></div>';
    });
    h+='</div></div>';

    // 최근 상담
    h+='<div class="card"><div class="card-hd"><div><h3>최근 상담</h3></div>'
      +'<div style="font-size:12px;color:var(--muted2)">최신 '+recent.length+'건</div></div><div class="panel-body" style="padding:0;">';
    recent.forEach(function(c){
      var st=status(c.resolved);
      var msgs=c.messages||[]; var lastUser='';
      for(var i=msgs.length-1;i>=0;i--){ if(msgs[i] && msgs[i].role==='user'){ lastUser=msgs[i].text; break; } }
      if(!lastUser && msgs.length) lastUser=msgs[msgs.length-1].text||'';
      h+='<div class="ss-row">'
        +'<div class="ss-when">'+esc(fmt(c.createdAt||c.updatedAt))+'</div>'
        +'<div class="ss-main"><div class="ss-cl">'+esc(c.categoryLabel||c.category||'기타')+'</div>'
        +'<div class="ss-sn">'+esc(lastUser||'—')+'</div>'
        +'<div class="ss-em">'+esc(c.email||'')+'</div></div>'
        +'<span class="ss-badge '+st.k+'">'+st.t+'</span></div>';
    });
    h+='</div></div>';
    h+='</div>';
    root.innerHTML=h;
  }
  window.renderSupportStats=render;

  var subscribed=false;
  function subscribe(){
    if(subscribed) return; subscribed=true;
    var db=window.FB_DB, FN=window.FB_FN;
    try{
      FN.onSnapshot(FN.collection(db,'support_chats'), function(snap){
        cache=[]; snap.forEach(function(d){ var o=d.data()||{}; o._id=d.id; cache.push(o); });
        render();
      }, function(e){ console.warn('[상담통계] support_chats 구독 실패', e&&e.code); subscribed=false;
        var root=document.getElementById('ssRoot');
        if(root && !cache.length) root.innerHTML='<div class="card"><div class="ss-empty"><div class="ic">🔒</div>상담 기록을 불러올 수 없습니다.<br><span style="font-size:12px;color:var(--muted2)">Firestore 규칙(support_chats)과 로그인 계정을 확인해 주세요.</span></div></div>';
      });
    }catch(e){ console.warn('[상담통계] 오류', e); subscribed=false; }
  }

  function start(tries){
    tries=tries||0;
    // FB 준비 + 인증(관리자 로그인) 완료까지 대기 — 로그인 전 구독 시 권한거부
    if(!ready() || !window.FB_AUTH || !window.FB_FN.onAuthStateChanged){ if(tries>120) return; return void setTimeout(function(){start(tries+1);},500); }
    var A=window.FB_AUTH, FN=window.FB_FN;
    FN.onAuthStateChanged(A, function(u){ if(u) subscribe(); });
    if(A.currentUser) subscribe();
  }
  start();
  // 탭 열릴 때 재렌더
  document.addEventListener('click', function(e){
    var t=e.target.closest && e.target.closest('.tab[data-tab="chat"]');
    if(t) setTimeout(render,30);
  }, true);
  console.log('[상담통계] ✅ admin-support-stats v1 로드');
})();
