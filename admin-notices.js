/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 공지·이벤트 (Firestore 연동) v3
   ───────────────────────────────────────────────────────────
   · "추가" → 유형(공지/이벤트) 선택 + 제목 + 내용 입력 모달
   · 목록은 [이벤트] / [공지] 섹션으로 분리 표시
   · 추가/삭제 → Firestore(notices), 실시간 목록 (type 필드 저장)
   적용: admin.html </body> 위에
     <script src="admin-notices.js?v=3"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var cache=[];
  var selType='공지';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
   /* ★[14차] onclick="f('…')" 처럼 글자가 다시 '코드' 로 읽히는 자리에는 esc 만으로는 부족하다
     (HTML 규칙상 &#39; 는 읽히는 순간 ' 로 돌아와 문자열을 끊는다) → 코드 문자열 규칙으로 먼저 막고 나서 HTML 로 막는다 */
  function jsa(s){ return esc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')); }
 function fmtDate(iso){ try{ var d=new Date(iso); if(isNaN(d.getTime())) return ''; var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }catch(e){ return ''; } }
  function toast(m){ try{ if(typeof window.toast==='function') window.toast(m); }catch(e){} }
  function isEvent(n){ var t=(n&&n.type)||''; if(t) return t==='이벤트'; return /이벤트|할인|혜택|event|sale/i.test((n&&n.title)||''); }

  function injectCss(){
    if(document.getElementById('ne-typecss')) return;
    var s=document.createElement('style'); s.id='ne-typecss';
    s.textContent='.ne-typebtn{flex:1;padding:11px;border-radius:9px;border:1px solid var(--border,#2b2e34);background:var(--panel,#1b1d21);color:var(--muted,#868b94);font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;}'
      +'.ne-typebtn.on{background:var(--gold,#c8a96e);color:#1a1a1a;border-color:var(--gold,#c8a96e);}'
      +'.ne-badge{display:inline-block;font-size:11px;font-weight:700;padding:1px 8px;border-radius:20px;margin-right:7px;vertical-align:middle;}'
      +'.ne-badge.ev{background:rgba(200,169,110,.16);color:var(--gold,#c8a96e);border:1px solid rgba(200,169,110,.4);}'
      +'.ne-badge.no{background:rgba(140,145,155,.14);color:var(--muted,#9aa0aa);border:1px solid rgba(140,145,155,.3);}'
      +'.ne-grouphd{font-size:13px;font-weight:700;margin:6px 2px 9px;}'
      +'.ne-grouphd.ev{color:var(--gold,#c8a96e);} .ne-grouphd.no{color:var(--muted,#9aa0aa);}';
    document.head.appendChild(s);
  }

  /* ── 모달 ── */
  function buildModal(){
    if(document.getElementById('noticeEditModal')) return;
    injectCss();
    var ov=document.createElement('div');
    ov.id='noticeEditModal';
    ov.style.cssText='position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:99999;';
    ov.innerHTML=
      '<div id="ne-box" style="background:var(--panel2,#1f2228);border:1px solid var(--border2,#34383f);border-radius:14px;width:min(560px,92vw);padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.5);">'
      + '<div style="font-size:18px;font-weight:700;color:var(--gold,#c8a96e);margin-bottom:16px;">공지·이벤트 작성</div>'
      + '<label style="display:block;font-size:13px;color:var(--muted,#868b94);margin-bottom:6px;">유형</label>'
      + '<div style="display:flex;gap:8px;margin-bottom:16px;">'
      +   '<button type="button" class="ne-typebtn" data-type="공지">공지</button>'
      +   '<button type="button" class="ne-typebtn" data-type="이벤트">이벤트</button>'
      + '</div>'
      + '<label style="display:block;font-size:13px;color:var(--muted,#868b94);margin-bottom:6px;">제목</label>'
      + '<input id="ne-title" placeholder="예) 신규가입 1시간 무료 이용권" style="width:100%;box-sizing:border-box;background:var(--panel,#1b1d21);border:1px solid var(--border,#2b2e34);border-radius:8px;color:var(--txt,#e9eaed);padding:10px 12px;font-size:14px;margin-bottom:14px;outline:none;" />'
      + '<label style="display:block;font-size:13px;color:var(--muted,#868b94);margin-bottom:6px;">내용</label>'
      + '<textarea id="ne-body" rows="6" placeholder="상세 내용을 입력하세요. (줄바꿈 가능)" style="width:100%;box-sizing:border-box;background:var(--panel,#1b1d21);border:1px solid var(--border,#2b2e34);border-radius:8px;color:var(--txt,#e9eaed);padding:10px 12px;font-size:14px;resize:vertical;outline:none;font-family:inherit;line-height:1.5;"></textarea>'
      + '<div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px;">'
      + '<button id="ne-cancel" class="btn">취소</button>'
      + '<button id="ne-save" class="btn gold">등록</button>'
      + '</div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){ if(e.target===ov) closeModal(); });
    document.getElementById('ne-cancel').addEventListener('click',closeModal);
    document.getElementById('ne-save').addEventListener('click',submitModal);
    ov.querySelectorAll('.ne-typebtn').forEach(function(b){ b.addEventListener('click',function(){ selType=b.getAttribute('data-type'); updTypeBtns(); }); });
  }
  function updTypeBtns(){
    var ov=document.getElementById('noticeEditModal'); if(!ov) return;
    ov.querySelectorAll('.ne-typebtn').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-type')===selType); });
  }
  function openModal(prefillTitle){
    buildModal();
    var ov=document.getElementById('noticeEditModal');
    var t=document.getElementById('ne-title'), b=document.getElementById('ne-body');
    /* 제목에 이벤트성 단어 있으면 이벤트로 기본 선택 */
    selType = /이벤트|할인|혜택|event|sale/i.test(prefillTitle||'') ? '이벤트' : '공지';
    updTypeBtns();
    if(t) t.value=prefillTitle||''; if(b) b.value='';
    ov.style.display='flex';
    if(t) setTimeout(function(){ t.focus(); },50);
  }
  function closeModal(){ var ov=document.getElementById('noticeEditModal'); if(ov) ov.style.display='none'; }

  function submitModal(){
    var t=(document.getElementById('ne-title').value||'').trim();
    var bodyRaw=(document.getElementById('ne-body').value||'');
    if(!t){ toast('제목을 입력하세요'); return; }
    if(!ready()){ toast('연결 준비 중입니다'); return; }
    var bodyHtml = esc(bodyRaw).replace(/\n/g,'<br>');
    var FN=window.FB_FN, db=window.FB_DB;
    var ref=FN.doc(FN.collection(db,'notices'));
    FN.setDoc(ref,{ title:t, body:bodyHtml, type:selType, createdAt:new Date().toISOString() }).then(function(){
      closeModal();
      var ni=document.getElementById('noticeInput'); if(ni) ni.value='';
      toast((selType==='이벤트'?'이벤트':'공지')+'가 등록되었습니다');
    }).catch(function(e){ console.error('[공지] 등록 실패',e); toast('등록 실패: '+((e&&e.code)||'권한/연결 확인')); });
  }

  /* ── 목록 렌더 (이벤트 / 공지 분리) ── */
  function itemHtml(n){
    var ev=isEvent(n);
    var badge='<span class="ne-badge '+(ev?'ev':'no')+'">'+(ev?'이벤트':'공지')+'</span>';
    return '<div class="list-item"><div><div>'+badge+esc(n.title)+'</div>'+
      '<div class="meta">'+fmtDate(n.createdAt)+' · 게시중</div></div>'+
      '<button class="btn sm" onclick="window.delNotice(\''+jsa(n.id)+'\')">삭제</button></div>';
  }
  function render(){
    injectCss();
    var box=document.getElementById('noticeList'); if(!box) return;
    if(!cache.length){ box.innerHTML='<div style="color:var(--muted);padding:8px">등록된 공지·이벤트가 없습니다.</div>'; return; }
    var ev=cache.filter(isEvent), no=cache.filter(function(n){return !isEvent(n);});
    var html='';
    html+='<div class="ne-grouphd ev">◆ 이벤트</div>';
    html+= ev.length ? ev.map(itemHtml).join('') : '<div style="color:var(--muted);padding:4px 2px 6px;font-size:13px;">등록된 이벤트가 없습니다.</div>';
    html+='<div class="ne-grouphd no" style="margin-top:18px;">공지</div>';
    html+= no.length ? no.map(itemHtml).join('') : '<div style="color:var(--muted);padding:4px 2px 6px;font-size:13px;">등록된 공지가 없습니다.</div>';
    box.innerHTML=html;
  }

  function start(){
    if(!ready()) return false;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'notices'), function(snap){
        var arr=[]; snap.forEach(function(d){ var x=d.data()||{}; arr.push({id:d.id, title:x.title||'', type:x.type||'', createdAt:x.createdAt||''}); });
        arr.sort(function(a,b){ return (b.createdAt||'').localeCompare(a.createdAt||''); });
        cache=arr; render();
      }, function(err){ console.error('[공지] 리스너 오류', err); });
    }catch(e){ console.error('[공지] 시작 실패', e); return true; }
    return true;
  }

  window.addNotice=function(){
    var ni=document.getElementById('noticeInput');
    openModal(ni ? (ni.value||'').trim() : '');
  };
  window.delNotice=function(id){
    if(!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'notices',id)).then(function(){ toast('삭제되었습니다'); })
      .catch(function(e){ console.error('[공지] 삭제 실패',e); toast('삭제 실패: '+((e&&e.code)||'권한/연결 확인')); });
  };
  window.renderNotice=function(){ render(); };

  buildModal();
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[공지] ✅ 관리자 공지·이벤트 분리 v3 (유형 선택 + 섹션 분리)');
})();
