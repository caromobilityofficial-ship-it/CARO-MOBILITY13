/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 사고접수 · 1:1 문의 관리 v1
   · Firestore: accident_reports / support_inquiries 실시간 구독
   · 상담통계(ssRoot) 아래에 독립 영역으로 추가 (기존 파일 무수정)
   · 상태 변경: 접수 → 처리중 → 완료
   ═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var ACC_COL = 'accident_reports';
  var INQ_COL = 'support_inquiries';
  var accCache = [], inqCache = [];
  var accSub = false, inqSub = false;
  var view = 'acc';   /* acc | inq */

  function ready(){
    /* 로그인(인증)까지 끝나야 Firestore 규칙을 통과함 */
    var authed = false;
    try{ authed = !!(window.FB_AUTH && window.FB_AUTH.currentUser); }catch(e){ authed = false; }
    return !!(window.FB_DB && window.FB_FN && window.FB_FN.onSnapshot && authed);
  }
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;');
  }
  function fmt(ts){
    if(!ts) return '-';
    var d = new Date(ts);
    if(isNaN(d.getTime())) return '-';
    var p = function(n){ return n < 10 ? '0'+n : n; };
    return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
  }
  function toast(m){
    try{ if(window.toast) return window.toast(m); }catch(e){}
    alert(m);
  }

  var STATUS = {
    received:  { label:'접수',   cls:'rp-st-new'  },
    progress:  { label:'처리중', cls:'rp-st-prog' },
    done:      { label:'완료',   cls:'rp-st-done' }
  };

  /* ── 스타일 ── */
  function css(){
    if(document.getElementById('rp-css')) return;
    var s = document.createElement('style');
    s.id = 'rp-css';
    s.textContent = ''
      + '#rpRoot{margin-top:18px;}'
      + '.rp-card{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px;color:var(--txt);}'
      + '.rp-hd{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px;flex-wrap:wrap;}'
      + '.rp-title{font-size:1rem;font-weight:800;}'
      + '.rp-seg{display:inline-flex;background:rgba(130,140,155,.12);border-radius:10px;padding:3px;}'
      + '.rp-seg button{border:none;background:none;padding:7px 14px;border-radius:8px;font-size:.82rem;font-weight:700;'
        + 'color:var(--muted2,#7c838f);cursor:pointer;font-family:inherit;}'
      + '.rp-seg button.on{background:var(--panel2);color:var(--txt);box-shadow:0 1px 3px rgba(0,0,0,.28);}'
      + '.rp-list{display:flex;flex-direction:column;gap:9px;}'
      + '.rp-item{border:1px solid var(--border);border-radius:12px;padding:12px 13px;cursor:pointer;transition:background .15s;}'
      + '.rp-item:hover{background:rgba(130,140,155,.06);}'
      + '.rp-top{display:flex;align-items:center;gap:8px;margin-bottom:5px;flex-wrap:wrap;}'
      + '.rp-no{font-family:ui-monospace,Menlo,monospace;font-size:.76rem;font-weight:700;color:var(--muted2,#7c838f);}'
      + '.rp-badge{font-size:.68rem;font-weight:800;padding:2px 8px;border-radius:20px;}'
      + '.rp-st-new{background:rgba(178,58,58,.12);color:#b23a3a;}'
      + '.rp-st-prog{background:rgba(200,169,110,.18);color:#8a6d36;}'
      + '.rp-st-done{background:rgba(29,122,58,.12);color:#1d7a3a;}'
      + '.rp-tag{font-size:.68rem;font-weight:700;padding:2px 8px;border-radius:20px;background:rgba(130,140,155,.14);color:#5d646f;}'
      + '.rp-h{font-size:.9rem;font-weight:700;margin-bottom:3px;}'
      + '.rp-sub{font-size:.78rem;color:var(--muted2,#7c838f);}'
      + '.rp-empty{text-align:center;padding:36px 12px;color:var(--muted2,#7c838f);font-size:.86rem;}'
      /* 상세 */
      + '#rp-ov{position:fixed;inset:0;background:rgba(15,18,24,.55);z-index:1400;display:none;'
        + 'align-items:center;justify-content:center;padding:18px;}'
      + '#rp-ov.on{display:flex;}'
      + '.rp-modal{background:var(--panel);color:var(--txt);border-radius:16px;width:100%;max-width:560px;max-height:86vh;overflow-y:auto;'
        + 'padding:20px;box-shadow:0 20px 50px -12px rgba(0,0,0,.4);}'
      + '.rp-mh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}'
      + '.rp-mt{font-size:1.02rem;font-weight:800;}'
      + '.rp-x{border:none;background:none;font-size:1.3rem;cursor:pointer;color:#8a8f99;line-height:1;}'
      + '.rp-row{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid var(--border);font-size:.85rem;}'
      + '.rp-row:last-of-type{border-bottom:none;}'
      + '.rp-k{flex:0 0 108px;color:var(--muted2,#7c838f);font-weight:600;}'
      + '.rp-v{flex:1;font-weight:600;word-break:break-word;white-space:pre-wrap;}'
      + '.rp-photos{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px;}'
      + '.rp-photos img{width:88px;height:88px;object-fit:cover;border-radius:9px;border:1px solid var(--border);cursor:zoom-in;}'
      + '.rp-acts{display:flex;gap:7px;margin-top:16px;}'
      + '.rp-acts button{flex:1;padding:11px;border-radius:10px;border:1px solid var(--border);'
        + 'background:var(--panel2);color:var(--txt);font-weight:700;font-size:.84rem;cursor:pointer;font-family:inherit;}'
      + '.rp-acts button.pri{background:var(--txt);color:var(--panel);border-color:var(--txt);}'
      + '#rp-zoom{position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:1500;display:none;align-items:center;justify-content:center;padding:20px;}'
      + '#rp-zoom.on{display:flex;}'
      + '#rp-zoom img{max-width:100%;max-height:100%;border-radius:8px;}';
    document.head.appendChild(s);
  }

  /* ── 마운트 ── */
  function mount(){
    var host = document.getElementById('tab-chat');
    if(!host || document.getElementById('rpRoot')) return true;
    var d = document.createElement('div');
    d.id = 'rpRoot';
    host.appendChild(d);
    return true;
  }

  /* ── 목록 렌더 ── */
  function render(){
    var root = document.getElementById('rpRoot');
    if(!root) return;
    var list = (view === 'acc') ? accCache : inqCache;

    var body;
    if(!list.length){
      body = '<div class="rp-empty">'
           + (view === 'acc' ? '접수된 사고가 없습니다.' : '접수된 문의가 없습니다.')
           + '</div>';
    } else {
      body = '<div class="rp-list">' + list.map(function(r){
        var st = STATUS[r.status] || STATUS.received;
        var head, sub;
        if(view === 'acc'){
          head = esc(r.accidentType || '사고') + ' · ' + esc(r.vehicle || '차량 미상');
          sub  = esc((r.location || '장소 미기재')) + ' · ' + esc(r.occurredAt || '');
        } else {
          head = esc(r.title || r.category || '문의');
          sub  = esc((r.content || '').slice(0, 44)) + ((r.content||'').length > 44 ? '…' : '');
        }
        var injury = (view==='acc' && r.injury && r.injury !== '없음')
                     ? '<span class="rp-tag" style="background:rgba(178,58,58,.12);color:#b23a3a;">부상 '+esc(r.injury)+'</span>' : '';
        var pc = r.photoCount ? '<span class="rp-tag">사진 '+esc(r.photoCount)+'</span>' : '';
        return '<div class="rp-item" data-id="'+esc(r.id)+'">'
             +   '<div class="rp-top">'
             +     '<span class="rp-no">'+esc(r.id)+'</span>'
             +     '<span class="rp-badge '+st.cls+'">'+st.label+'</span>'
             +     injury + pc
             +   '</div>'
             +   '<div class="rp-h">'+head+'</div>'
             +   '<div class="rp-sub">'+sub+'</div>'
             +   '<div class="rp-sub" style="margin-top:3px;">'+esc(r.userName || r.userEmail || '')+' · '+fmt(r.createdTs)+'</div>'
             + '</div>';
      }).join('') + '</div>';
    }

    root.innerHTML =
      '<div class="rp-hd">'                          /* 헤더를 카드 밖 위로 배치 */
      +   '<span class="rp-title">사고 접수 · 문의</span>'
      +   '<span class="rp-seg">'
      +     '<button data-v="acc" class="'+(view==='acc'?'on':'')+'">사고 '+accCache.length+'</button>'
      +     '<button data-v="inq" class="'+(view==='inq'?'on':'')+'">문의 '+inqCache.length+'</button>'
      +   '</span>'
      + '</div>'
      + '<div class="rp-card">'
      + body
      + '</div>';

    root.querySelectorAll('.rp-seg button').forEach(function(b){
      b.onclick = function(){ view = b.getAttribute('data-v'); render(); };
    });
    root.querySelectorAll('.rp-item').forEach(function(it){
      it.onclick = function(){ detail(it.getAttribute('data-id')); };
    });
  }

  /* ── 상세 ── */
  function detail(id){
    var list = (view === 'acc') ? accCache : inqCache;
    var r = null;
    for(var i=0;i<list.length;i++){ if(list[i].id === id){ r = list[i]; break; } }
    if(!r) return;

    var rows = [];
    var add = function(k,v){ if(v) rows.push('<div class="rp-row"><div class="rp-k">'+k+'</div><div class="rp-v">'+esc(v)+'</div></div>'); };

    add('접수번호', r.id);
    add('상태', (STATUS[r.status]||STATUS.received).label);
    add('접수일시', fmt(r.createdTs));
    add('고객', (r.userName||'') + (r.userEmail ? ' ('+r.userEmail+')' : ''));
    add('연락처', r.userPhone);

    if(view === 'acc'){
      add('사고일시', r.occurredAt);
      add('장소', r.location);
      add('차량', r.vehicle);
      add('사고종류', r.accidentType);
      add('부상', r.injury + (r.injuryDetail ? ' — '+r.injuryDetail : ''));
      add('경찰신고', r.police);
      add('상대차량', r.otherVehicle);
      add('상대연락처', r.otherPhone);
      add('상대보험사', r.otherInsurance);
      add('필요지원', (r.services||[]).join(', '));
      add('사고경위', r.description);
    } else {
      add('분류', r.category);
      add('제목', r.title);
      add('내용', r.content);
    }

    var photos = '';
    if(r.photos && r.photos.length){
      photos = '<div class="rp-row" style="display:block;"><div class="rp-k" style="margin-bottom:6px;">사진 ('+r.photos.length+')</div>'
             + '<div class="rp-photos">'
             + r.photos.map(function(p){ return '<img src="'+esc(p)+'" alt="사진"/>'; }).join('')
             + '</div></div>';
    }

    var ov = document.getElementById('rp-ov');
    if(!ov){
      ov = document.createElement('div'); ov.id='rp-ov';
      document.body.appendChild(ov);
      ov.addEventListener('click', function(e){ if(e.target === ov) ov.classList.remove('on'); });
    }
    ov.innerHTML =
      '<div class="rp-modal">'
      + '<div class="rp-mh"><span class="rp-mt">'+(view==='acc'?'사고 접수':'문의')+' 상세</span>'
      +   '<button class="rp-x" id="rp-close">&times;</button></div>'
      + rows.join('') + photos
      + '<div class="rp-acts">'
      +   '<button data-st="progress">처리중</button>'
      +   '<button data-st="done" class="pri">완료</button>'
      + '</div>'
      + '</div>';
    ov.classList.add('on');

    ov.querySelector('#rp-close').onclick = function(){ ov.classList.remove('on'); };
    ov.querySelectorAll('.rp-acts button').forEach(function(b){
      b.onclick = function(){ setStatus(r.id, b.getAttribute('data-st'), ov); };
    });
    ov.querySelectorAll('.rp-photos img').forEach(function(img){
      img.onclick = function(){
        var z = document.getElementById('rp-zoom');
        if(!z){
          z = document.createElement('div'); z.id='rp-zoom';
          document.body.appendChild(z);
          z.addEventListener('click', function(){ z.classList.remove('on'); });
        }
        z.innerHTML = '<img src="'+esc(img.getAttribute('src'))+'"/>';
        z.classList.add('on');
      };
    });
  }

  /* ── 상태 변경 ── */
  function setStatus(id, st, ov){
    if(!ready()){ toast('연결이 준비되지 않았습니다.'); return; }
    var col = (view === 'acc') ? ACC_COL : INQ_COL;
    var FN = window.FB_FN, db = window.FB_DB;
    FN.setDoc(FN.doc(db, col, id), {
      status: st,
      updatedAt: new Date().toISOString(),
      updatedTs: Date.now()
    }, { merge:true }).then(function(){
      toast(st === 'done' ? '완료 처리되었습니다.' : '처리중으로 변경되었습니다.');
      /* 즉시 반영 */
      var list = (view === 'acc') ? accCache : inqCache;
      for(var i=0;i<list.length;i++){ if(list[i].id === id){ list[i].status = st; break; } }
      if(ov) ov.classList.remove('on');
      render();
    }).catch(function(e){
      console.warn('[접수관리] 상태 변경 실패', e && e.code);
      toast('변경 실패 — 권한을 확인해 주세요.');
    });
  }

  /* ── 구독 ── */
  function sub(col, setter, flagName){
    if(!ready()) return false;
    var FN = window.FB_FN, db = window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db, col), function(snap){
        var arr = [];
        snap.forEach(function(d){
          var o = d.data() || {};
          o.id = o.id || d.id;
          arr.push(o);
        });
        arr.sort(function(a,b){ return (b.createdTs||0) - (a.createdTs||0); });
        setter(arr);
        render();
      }, function(e){
        console.warn('[접수관리] '+col+' 구독 실패', e && e.code);
      });
      return true;
    }catch(e){ return false; }
  }

  /* ── 시작 ── */
  function boot(){
    css();
    if(!mount()) return false;
    render();
    if(!accSub) accSub = sub(ACC_COL, function(a){ accCache = a; }, 'acc');
    if(!inqSub) inqSub = sub(INQ_COL, function(a){ inqCache = a; }, 'inq');
    return accSub && inqSub;
  }

  if(!boot()){
    var n = 0;
    var iv = setInterval(function(){
      n++;
      if(boot() || n > 120) clearInterval(iv);
    }, 700);
  }
  /* 로그인 완료 시점에 확실히 한 번 더 시도 */
  (function hookAuth(t){
    t = t || 0;
    var A = window.FB_AUTH, FN = window.FB_FN;
    if(!A || !FN || typeof FN.onAuthStateChanged !== 'function'){
      if(t > 100) return;
      return setTimeout(function(){ hookAuth(t + 1); }, 150);
    }
    FN.onAuthStateChanged(A, function(u){
      if(u) setTimeout(boot, 150);
    });
  })();
  console.log('[접수관리] ✅ 사고접수·문의 관리 v1');
})();
