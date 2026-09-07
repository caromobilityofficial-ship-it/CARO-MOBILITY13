/* ═════════════════════════════════════════════════
   CARO MOBILITY — 관리자 접수함 (사고 · 1:1 문의) v1  (2026-09)
   ─────────────────────────────────────────────────
   · 고객 앱의 사고 접수(accident_reports) · 1:1 문의(support_inquiries)를 실시간 표시
   · 새 접수 배지, 사고는 항상 맨 위(빨간 표시), 사진 썸네일, 전화 바로걸기
   · 상태 변경: 신규 → 처리중 → 완료 (누가·언제 처리했는지 기록)
   적용: admin-ops.html 의 </body> 위에
     <script src="admin-inbox.js?v=1"></script>
   (탭 버튼·섹션은 이 파일이 스스로 만들어 붙인다)
══════════════════════════════════════════════════ */
(function(){
  'use strict';
  var TAB='inbox';
  var acc=[], inq=[], unsubA=null, unsubI=null, filter='all';

  function ready(){ return !!(window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'); }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function when(d){
    var t=ts(d); if(!t) return '';
    var x=new Date(t), p=function(n){return n<10?'0'+n:n;};
    return (x.getMonth()+1)+'/'+p(x.getDate())+' '+p(x.getHours())+':'+p(x.getMinutes());
  }
  function me(){ try{ return (window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||''; }catch(e){ return ''; } }
  function toast(m){ try{ if(typeof window.toast==='function') return window.toast(m); }catch(e){} try{ if(typeof window.T==='function') return window.T(m); }catch(e){} console.log('[접수함]',m); }

  /* ── 탭·섹션 주입 ── */
  function mount(){
    if(document.getElementById('tab-'+TAB)) return true;
    var tabs=document.querySelector('.tabs'); if(!tabs) return false;
    var btn=document.createElement('button'); btn.className='tab'; btn.dataset.tab=TAB; btn.id='tabbtn-'+TAB;
    btn.innerHTML='접수함 <span id="ib-badge" class="ib-badge" style="display:none">0</span>';
    tabs.appendChild(btn);

    var sec=document.createElement('section'); sec.id='tab-'+TAB; sec.className='hide';
    sec.innerHTML=
      '<div class="ib-head">'
      + '<div><div class="ib-title">접수함</div><div class="ib-sub">고객 앱에서 들어온 <b>사고 접수</b>와 <b>1:1 문의</b>. 사고는 항상 맨 위에 표시됩니다.</div></div>'
      + '<div class="ib-filters">'
      +   '<button class="ib-f on" data-f="all">전체</button><button class="ib-f" data-f="new">신규</button>'
      +   '<button class="ib-f" data-f="acc">사고만</button><button class="ib-f" data-f="inq">문의만</button><button class="ib-f" data-f="done">완료</button>'
      + '</div></div>'
      + '<div id="ib-list" class="ib-list"><div class="ib-empty">불러오는 중…</div></div>';
    // 마지막 section 뒤에 추가
    var last=null; document.querySelectorAll('section[id^="tab-"]').forEach(function(s){ last=s; });
    if(last && last.parentNode) last.parentNode.insertBefore(sec, last.nextSibling); else document.body.appendChild(sec);

    // 내 탭 클릭
    btn.addEventListener('click', function(){
      document.querySelectorAll('.tab').forEach(function(x){ x.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelectorAll('section[id^="tab-"]').forEach(function(s){ s.classList.toggle('hide', s.id!=='tab-'+TAB); });
      render();
    });
    // 다른 탭 클릭 시 내 섹션 숨김 (기존 핸들러는 내 섹션을 모름)
    tabs.addEventListener('click', function(e){
      var t=e.target.closest('.tab'); if(!t || t===btn) return;
      sec.classList.add('hide');
    }, true);
    document.querySelectorAll('.ib-f').forEach(function(f){
      f.addEventListener('click', function(){ document.querySelectorAll('.ib-f').forEach(function(x){ x.classList.remove('on'); }); f.classList.add('on'); filter=f.dataset.f; render(); });
    });
    injectCss();
    return true;
  }

  function injectCss(){
    if(document.getElementById('ib-css')) return;
    var s=document.createElement('style'); s.id='ib-css';
    s.textContent=
      '.ib-badge{display:inline-block;min-width:18px;padding:0 6px;margin-left:6px;border-radius:99px;background:#c0392b;color:#fff;font-size:11px;font-weight:800;line-height:18px;text-align:center;vertical-align:middle;}'
     +'.ib-head{display:flex;justify-content:space-between;align-items:flex-end;gap:14px;flex-wrap:wrap;margin-bottom:14px;}'
     +'.ib-title{font-size:20px;font-weight:800;color:var(--txt,#eee);}'
     +'.ib-sub{font-size:12.5px;color:var(--muted,#999);margin-top:2px;}'
     +'.ib-filters{display:flex;gap:6px;flex-wrap:wrap;}'
     +'.ib-f{background:var(--panel2,#1c1f25);border:1px solid var(--border,#333);color:var(--muted,#bbb);border-radius:99px;padding:5px 12px;font-size:12px;cursor:pointer;}'
     +'.ib-f.on{background:var(--gold,#c8a96e);color:#18191c;border-color:var(--gold,#c8a96e);font-weight:700;}'
     +'.ib-list{display:flex;flex-direction:column;gap:10px;}'
     +'.ib-card{background:var(--panel,#16181d);border:1px solid var(--border,#2a2d33);border-radius:14px;padding:14px 16px;display:grid;grid-template-columns:110px 1fr auto;gap:14px;align-items:start;}'
     +'.ib-card.acc{border-left:4px solid #c0392b;}'
     +'.ib-card.done{opacity:.6;}'
     +'.ib-kind{font-size:11px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:#c0392b;}'
     +'.ib-card.inq .ib-kind{color:var(--gold,#c8a96e);}'
     +'.ib-when{font-size:12px;color:var(--muted2,#888);margin-top:3px;}'
     +'.ib-st{display:inline-block;margin-top:6px;font-size:11px;padding:2px 8px;border-radius:99px;border:1px solid var(--border,#333);color:var(--muted,#bbb);}'
     +'.ib-st.new{background:#3a1d1a;border-color:#c0392b;color:#ff8f85;}'
     +'.ib-st.in_progress{background:#33280f;border-color:#c8a96e;color:#e5c88a;}'
     +'.ib-st.done{background:#16301f;border-color:#2f7a55;color:#7cc79a;}'
     +'.ib-main .ib-h{font-size:14.5px;font-weight:700;color:var(--txt,#eee);}'
     +'.ib-main .ib-p{font-size:13px;color:var(--txt,#ddd);margin-top:4px;white-space:pre-wrap;word-break:break-word;max-height:7.5em;overflow:hidden;}'
     +'.ib-main .ib-p.open{max-height:none;}'
     +'.ib-meta{font-size:12px;color:var(--muted,#999);margin-top:6px;display:flex;gap:12px;flex-wrap:wrap;}'
     +'.ib-meta a{color:var(--gold-soft,#dcc28f);text-decoration:none;font-weight:700;}'
     +'.ib-ph{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;}'
     +'.ib-ph img{width:64px;height:48px;object-fit:cover;border-radius:6px;border:1px solid var(--border,#333);cursor:zoom-in;}'
     +'.ib-act{display:flex;flex-direction:column;gap:6px;min-width:96px;}'
     +'.ib-act button{background:var(--panel2,#1c1f25);border:1px solid var(--border,#333);color:var(--txt,#ddd);border-radius:9px;padding:7px 10px;font-size:12px;cursor:pointer;}'
     +'.ib-act button.pri{background:var(--gold,#c8a96e);color:#18191c;border-color:var(--gold,#c8a96e);font-weight:700;}'
     +'.ib-empty{padding:34px;text-align:center;color:var(--muted,#999);border:1px dashed var(--border,#333);border-radius:14px;}'
     +'@media(max-width:720px){.ib-card{grid-template-columns:1fr;} .ib-act{flex-direction:row;flex-wrap:wrap;}}';
    document.head.appendChild(s);
  }

  /* ── 구독 ── */
  function subscribe(){
    if(!ready()){ setTimeout(subscribe, 600); return; }
    var FN=window.FB_FN, db=window.FB_DB;
    if(unsubA||unsubI) return;
    unsubA=FN.onSnapshot(FN.collection(db,'accident_reports'), function(s){ acc=[]; s.forEach(function(d){ acc.push(Object.assign({_id:d.id,_col:'accident_reports'}, d.data()||{})); }); render(); badge(); },
      function(e){ console.warn('[접수함] accident_reports 구독 실패', e&&e.code); showErr(e); });
    unsubI=FN.onSnapshot(FN.collection(db,'support_inquiries'), function(s){ inq=[]; s.forEach(function(d){ inq.push(Object.assign({_id:d.id,_col:'support_inquiries'}, d.data()||{})); }); render(); badge(); },
      function(e){ console.warn('[접수함] support_inquiries 구독 실패', e&&e.code); showErr(e); });
  }
  function showErr(e){
    var l=document.getElementById('ib-list'); if(!l) return;
    if(e && /permission/i.test(e.code||'')) l.innerHTML='<div class="ib-empty">🔒 접수함을 읽을 권한이 없습니다 — 관리자 권한(Custom Claim) 또는 Firestore 규칙을 확인하세요.</div>';
  }

  function st(d){ var v=d.status||'new'; return (v==='received'||v==='new')?'new':v; }
  function ts(d){ if(d.createdTs) return d.createdTs; if(d.createdAtMs) return d.createdAtMs; if(d.createdAt&&d.createdAt.toMillis) return d.createdAt.toMillis(); if(typeof d.createdAt==='string'){ var t=Date.parse(d.createdAt); if(!isNaN(t)) return t; } return 0; }
  function badge(){
    var n=acc.concat(inq).filter(function(d){ return st(d)==='new'; }).length;
    var b=document.getElementById('ib-badge'); if(b){ b.textContent=n; b.style.display=n?'inline-block':'none'; }
    var na=acc.filter(function(d){ return st(d)==='new'; }).length;
    try{ document.title=(na?'🚨('+na+') ':'')+document.title.replace(/^🚨\(\d+\)\s*/,''); }catch(e){}
  }

  /* ── 렌더 ── */
  function render(){
    var l=document.getElementById('ib-list'); if(!l) return;
    var rows=acc.concat(inq);
    rows.sort(function(a,b){
      var sa=st(a)==='done'?1:0, sb=st(b)==='done'?1:0; if(sa!==sb) return sa-sb;
      var ka=a._col==='accident_reports'?0:1, kb=b._col==='accident_reports'?0:1; if(ka!==kb) return ka-kb;
      return ts(b)-ts(a);
    });
    rows=rows.filter(function(d){
      var stv=st(d);
      if(filter==='new') return stv==='new';
      if(filter==='done') return stv==='done';
      if(filter==='acc') return d._col==='accident_reports';
      if(filter==='inq') return d._col==='inquiries';
      return true;
    });
    if(!rows.length){ l.innerHTML='<div class="ib-empty">'+(filter==='all'?'아직 접수된 건이 없습니다.':'해당하는 건이 없습니다.')+'</div>'; return; }
    l.innerHTML=rows.map(card).join('');
    l.querySelectorAll('[data-act]').forEach(function(b){ b.addEventListener('click', function(){ act(b.dataset.act, b.dataset.col, b.dataset.id); }); });
    l.querySelectorAll('.ib-p').forEach(function(p){ p.addEventListener('click', function(){ p.classList.toggle('open'); }); });
    l.querySelectorAll('.ib-ph img').forEach(function(im){ im.addEventListener('click', function(){ try{ var w=window.open(); w.document.write('<img src="'+im.src+'" style="max-width:100%">'); }catch(e){} }); });
  }
  var STL={new:'신규',in_progress:'처리중',done:'완료'};
  function card(d){
    var isAcc=d._col==='accident_reports', stv=st(d);
    var head, body, meta=[];
    if(isAcc){
      head=(d.accidentType?esc(d.accidentType)+' · ':'')+(d.vehicle?esc(d.vehicle):'차량 미기재')+(d.injury?' · <b style="color:#ff8f85">부상 있음</b>':'');
      body=esc(d.description||'');
      if(d.location) meta.push('📍 '+esc(d.location));
      if(d.datetime||d.occurredAt) meta.push('🕒 '+esc(d.datetime||d.occurredAt));
      if(d.otherVehicle) meta.push('상대 '+esc(d.otherVehicle)+(d.otherPhone?' '+esc(d.otherPhone):''));
      if(d.police) meta.push('경찰 '+esc(d.police));
      if(d.bookNo) meta.push('예약 '+esc(d.bookNo));
    } else {
      head=(d.category?'['+esc(d.category)+'] ':'')+esc(d.title||'(제목 없음)');
      body=esc(d.content||'');
      if(d.replyMethod) meta.push('회신: '+esc(d.replyMethod));
      if(d.email) meta.push('✉ '+esc(d.email));
    }
    var ph=d.phone||d.userPhone||''; var phone=ph.replace(/[^\d]/g,'');
    if(phone) meta.unshift('<a href="tel:'+phone+'">📞 '+esc(ph)+'</a>');
    if(d.name||d.userName) meta.push('👤 '+esc(d.name||d.userName)+(d.userEmail?' ('+esc(d.userEmail)+')':''));
    if(d.handledBy) meta.push('처리: '+esc(d.handledBy)+(d.handledAtMs?' · '+when({createdAtMs:d.handledAtMs}):''));
    var photos=(d.photos||[]).map(function(p){ return '<img src="'+p+'" alt="첨부">'; }).join('');
    var acts='';
    if(stv==='new') acts='<button class="pri" data-act="in_progress" data-col="'+d._col+'" data-id="'+d._id+'">처리 시작</button>';
    if(stv!=='done') acts+='<button data-act="done" data-col="'+d._col+'" data-id="'+d._id+'">완료 처리</button>';
    if(stv==='done') acts+='<button data-act="new" data-col="'+d._col+'" data-id="'+d._id+'">다시 열기</button>';
    return '<div class="ib-card '+(isAcc?'acc':'inq')+(stv==='done'?' done':'')+'">'
      + '<div><div class="ib-kind">'+(isAcc?'🚨 사고 접수':'1:1 문의')+'</div><div class="ib-when">'+when(d)+'</div><span class="ib-st '+stv+'">'+STL[stv]+'</span></div>'
      + '<div class="ib-main"><div class="ib-h">'+head+'</div><div class="ib-p" title="클릭하면 전체 보기">'+body+'</div>'
      +   (meta.length?'<div class="ib-meta">'+meta.join('')+'</div>':'')
      +   (photos?'<div class="ib-ph">'+photos+'</div>':'')
      + '</div>'
      + '<div class="ib-act">'+acts+'</div>'
      + '</div>';
  }
  function act(status, col, id){
    if(!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.setDoc(FN.doc(db,col,id),{ status:status, handledBy:me(), handledAtMs:Date.now(), handledAt:FN.serverTimestamp() },{merge:true})
      .then(function(){ toast(STL[status]+' 로 변경했습니다'); })
      .catch(function(e){ toast('변경 실패: '+(e&&e.code||'')); console.warn('[접수함] 상태 변경 실패', e); });
  }

  function boot(){ if(!mount()){ setTimeout(boot, 400); return; } subscribe(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
  window.renderInbox=render;
  console.log('[접수함] ✅ 사고·문의 접수함 로드');
})();
