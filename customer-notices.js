/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 홈 공지·이벤트 (Firestore 연동) v3
   ───────────────────────────────────────────────────────────
   · 시작 즉시 index.html의 "가짜 기본 공지"를 숨김
   · Firestore에 진짜 공지가 있을 때만 표시 (없으면 영역 숨김)
   · 클릭 시 제목 + 내용(body) 상세 모달
   적용: index.html 의 script.js 줄 다음에
     <script src="customer-notices.js?v=3"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var cache={};
  /* ★ 공지 본문 sanitizer — 허용: p br b strong i em u ul ol li h3 h4 a(href=http/https) span, 그 외 태그·속성·on*·script 제거 */
  function sanitizeHtml(html){
    try{
      var ALLOW={P:1,BR:1,B:1,STRONG:1,I:1,EM:1,U:1,UL:1,OL:1,LI:1,H3:1,H4:1,A:1,SPAN:1,DIV:1};
      var doc=new DOMParser().parseFromString('<div>'+String(html||'')+'</div>','text/html');
      var root=doc.body.firstChild;
      (function walk(node){
        var kids=Array.prototype.slice.call(node.childNodes);
        kids.forEach(function(c){
          if(c.nodeType===8){ c.remove(); return; }
          if(c.nodeType!==1) return;
          if(!ALLOW[c.tagName]){ var txt=doc.createTextNode(c.textContent||''); c.replaceWith(txt); return; }
          Array.prototype.slice.call(c.attributes).forEach(function(a){
            var n=a.name.toLowerCase();
            if(c.tagName==='A' && n==='href' && /^https?:\/\//i.test(a.value)){ return; }
            c.removeAttribute(a.name);
          });
          if(c.tagName==='A'){ c.setAttribute('target','_blank'); c.setAttribute('rel','noopener noreferrer'); }
          walk(c);
        });
      })(root);
      return root.innerHTML;
    }catch(e){ return esc(String(html||'')); }
  }
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtDate(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }catch(e){ return ''; } }
  function tagOf(n){ var t=(n&&n.type)||''; if(t==='이벤트') return {label:'이벤트',cls:'notice-tag new-tag'}; if(t==='공지') return {label:'공지',cls:'notice-tag'}; if(/이벤트|할인|혜택|event|sale/i.test((n&&n.title)||'')) return {label:'이벤트',cls:'notice-tag new-tag'}; return {label:'공지',cls:'notice-tag'}; }

  function setSection(show){
    var nl=document.querySelector('.home-notice-list'); if(!nl) return;
    nl.style.display = show ? '' : 'none';
    var title=nl.previousElementSibling;
    if(title && title.classList && title.classList.contains('home-section-title')){
      title.style.display = show ? '' : 'none';
    }
  }

  function render(notices){
    var nl=document.querySelector('.home-notice-list'); if(!nl) return;
    cache={};
    if(!notices.length){ nl.innerHTML=''; setSection(false); return; }   /* 공지 0개 → 숨김 */
    nl.innerHTML=notices.map(function(n){
      cache[n.id]=n;
      var tg=tagOf(n);
      return '<div class="home-notice-item" onclick="window.openFsNotice(\''+n.id+'\')">'+
        '<span class="'+tg.cls+'">'+tg.label+'</span>'+
        '<span class="notice-text">'+esc(n.title)+'</span>'+
        '<span class="notice-date">'+fmtDate(n.createdAt)+'</span>'+
        '</div>';
    }).join('');
    setSection(true);
  }

  window.openFsNotice=function(id){
    var n=cache[id]; if(!n) return;
    var t=document.getElementById('notice-title'), b=document.getElementById('notice-body');
    if(t) t.textContent=n.title;
    if(b) b.innerHTML = n.body ? sanitizeHtml(n.body) : ('<p>'+esc(n.title)+'</p>');   /* ★ FIX(H6): 허용 태그만 남김 (저장형 XSS 차단) */
    if(typeof window.openModal==='function') window.openModal('notice-modal');
  };

  function start(){
    if(!ready()) return false;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'notices'), function(snap){
        var arr=[]; snap.forEach(function(d){ var x=d.data()||{}; arr.push({id:d.id, title:x.title||'', body:x.body||'', type:x.type||'', createdAt:x.createdAt||''}); });
        arr.sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
        render(arr);
      }, function(err){ console.warn('[공지] 고객 리스너 오류', (err&&(err.code||err.message))||err); });
    }catch(e){ console.warn('[공지] 고객 시작 실패', e); return true; }
    return true;
  }

  /* ★ 시작 즉시: 가짜 기본 공지 숨김 (Firestore 응답 전부터) */
  setSection(false);

  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},20000); }
  console.log('[공지] ✅ 고객 홈 Firestore 공지 패치 v3 (가짜 기본공지 제거)');
})();
