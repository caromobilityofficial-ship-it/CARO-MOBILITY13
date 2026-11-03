/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY 관제 — 요금 관리 (성수기/비성수기 × 평일/주말) v1
   ───────────────────────────────────────────────────────────
   · 성수기/비성수기 토글(현재 적용 시즌) — 관리자가 직접 변경
   · 차종별 4요금 입력: 성수기 평일 / 성수기 주말 / 비성수기 평일 / 비성수기 주말
     (동일 차종은 한 번만 입력하면 같은 차종 전체에 적용됨 — 차종명 기준)
   · 주말요금 자동 적용 기준: 금요일 18시~ + 토·일 + 공휴일
   · 저장: Firestore settings/pricing + localStorage(caro_pricing_cfg)
   · 고객 앱(customer-redesign.js)의 요금 엔진이 이 설정을 읽어 자동 적용

   적용법: admin.html 의 </body> 바로 위에 아래 한 줄 추가
     <script src="admin-pricing.js?v=1"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var LS='caro_pricing_cfg';

  var FALLBACK=["더뉴레이","모닝 어반","더뉴기아레이","더뉴기아레이 루프탑","더뉴모닝","셀토스","더뉴코나","XM3","베리 뉴 티볼리","더뉴셀토스","디 올뉴코나","BMW X1","BMW 520i M Sport","벤츠 E200","미니 컨버터블","BMW 뉴 X3","포르쉐 911 카레라 쿠페","스타리아 11인승","스타리아 캠퍼 4","캐스퍼","더뉴그랜저","K8","디 올뉴그랜저","더 뉴 G80","더 뉴 K8 하이브리드","디 올 뉴 그랜저 하이브리드","팰리세이드","GV80","올뉴아반떼","더뉴K3","더 뉴 아반떼","더뉴아반떼N","디 올뉴투싼","디 올뉴스포티지","쏘나타 센슈어스","K5","쏘나타 디 엣지","더 뉴 K5","디 올 뉴 싼타페","QM6","토레스","GV70","더 뉴 쏘렌토","카니발 11인승","더 뉴 카니발","니로 EV","니로 플러스","아이오닉 6 롱레인지","폴스타 2 롱레인지","EV6 롱레인지","디 올 뉴 코나 EV 롱레인지","EV9 롱레인지","레이 EV","EV3 롱레인지","EV4 롱레인지","아이오닉 9"];

  function esc(s){ s=(s==null?'':''+s); return s.replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function toast(m){ try{ if(typeof window.toast==='function'){ window.toast(m); return; } if(typeof window.showToast==='function'){ window.showToast(m); return; } }catch(e){} try{ alert(m); }catch(e2){} }
  function won(n){ n=Number(n)||0; return n.toLocaleString('ko-KR'); }

  var cfg={season:'off',models:{}};
  function loadLS(){ try{ var r=localStorage.getItem(LS); if(r){ var d=JSON.parse(r); cfg={season:(d.season==='peak'?'peak':'off'), models:d.models||{}}; } }catch(e){} }
  function saveLS(){ try{ localStorage.setItem(LS, JSON.stringify(cfg)); }catch(e){} }
  function saveRemote(){
    try{
      var db=window.FB_DB, fn=window.FB_FN;
      if(db && fn && fn.setDoc && fn.doc){
        return fn.setDoc(fn.doc(db,'settings','pricing'), {season:cfg.season, models:cfg.models}, {mergeFields:['season','models']});   /* ★[v108.2] merge:true 는 비운 요금을 서버에서 못 지웠다 → 두 필드를 통째로 교체 */
      }
    }catch(e){}
    return null;
  }
  function loadRemote(cb){
    try{
      var db=window.FB_DB, fn=window.FB_FN;
      if(db && fn && fn.getDoc && fn.doc){
        fn.getDoc(fn.doc(db,'settings','pricing')).then(function(snap){
          var ex=snap && (typeof snap.exists==='function'?snap.exists():snap.exists);
          if(ex){ var d=(typeof snap.data==='function'?snap.data():snap.data)||{}; cfg={season:(d.season==='peak'?'peak':'off'), models:d.models||{}}; saveLS(); }
          cb&&cb();
        }).catch(function(){ cb&&cb(); });
        return;
      }
    }catch(e){}
    cb&&cb();
  }

  /* 실제 등록 차량(차종) 목록 — Firestore cars/bl_cars + (있으면)전역, 없을 때만 기본목록 */
  var FLEET=null, BASEMAP={};
  function addCar(o){ if(!o) return; var n=(o.name||o.model||o.carName||'').trim(); if(!n) return; BASEMAP[n]=1; if(BASE_RATE[n]==null){ var r=(o.__origRate!=null?o.__origRate:o.pricePerHour); if(r!=null) BASE_RATE[n]=r; } }
  var BASE_RATE={};
  function loadFleet(cb){
    var names={};
    [window.CARS_DATA, window.BL_CARS].forEach(function(l){ (l||[]).forEach(function(c){ addCar(c); var n=(c&&(c.name||c.model||c.carName)||'').trim(); if(n) names[n]=1; }); });
    function finish(){
      var arr=Object.keys(names);
      if(!arr.length) arr=FALLBACK.slice();
      FLEET=arr.sort(function(a,b){ return a.localeCompare(b,'ko'); });
      cb&&cb(FLEET);
    }
    try{
      var db=window.FB_DB, fn=window.FB_FN;
      if(db && fn && fn.getDocs && fn.collection){
        var grab=function(col){ return fn.getDocs(fn.collection(db,col)).then(function(s){ s.forEach(function(d){ var o=d.data()||{}; addCar(o); var n=(o.name||o.model||'').trim(); if(n) names[n]=1; }); }).catch(function(){}); };
        Promise.all([grab('cars'), grab('bl_cars')]).then(finish);
        return;
      }
    }catch(e){}
    finish();
  }
  function baseOf(name){ return (BASE_RATE[name]!=null)?BASE_RATE[name]:null; }

  /* ── 스타일 ── */
  var st=document.createElement('style'); st.id='caro-pricing-css';
  st.textContent=
    '#cpx-fab{position:fixed;right:16px;bottom:16px;z-index:9998;background:linear-gradient(135deg,#c8a96e,#a5854e);color:#1a1a1a;border:none;border-radius:26px;padding:12px 18px;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;box-shadow:0 6px 18px rgba(0,0,0,.4);}'
   +'#cpx-fab:active{transform:scale(.96);}'
   +'#cpx-ov{position:fixed;inset:0;z-index:9999;background:rgba(8,10,13,.55);display:none;}'
   +'#cpx-ov.open{display:block;}'
   +'#cpx-panel{position:absolute;right:0;top:0;bottom:0;width:min(560px,100%);background:#16181d;box-shadow:-8px 0 30px rgba(0,0,0,.5);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .28s cubic-bezier(.22,1,.36,1);}'
   +'#cpx-ov.open #cpx-panel{transform:translateX(0);}'
   +'.cpx-hd{display:flex;align-items:center;gap:10px;padding:16px 16px 12px;border-bottom:1px solid #2a2d34;}'
   +'.cpx-hd h2{flex:1;font-size:1.02rem;font-weight:800;color:#f0e6d2;margin:0;}'
   +'.cpx-x{background:none;border:none;color:#9aa0aa;font-size:1.4rem;cursor:pointer;line-height:1;padding:2px 6px;}'
   +'.cpx-season{display:flex;gap:8px;padding:14px 16px 6px;}'
   +'.cpx-season-lbl{font-size:.76rem;color:#9aa0aa;align-self:center;margin-right:2px;}'
   +'.cpx-sb{flex:1;padding:11px;border-radius:11px;border:1px solid #33373f;background:#1f2228;color:#cfd3da;font-size:.9rem;font-weight:800;font-family:inherit;cursor:pointer;}'
   +'.cpx-sb.on{background:linear-gradient(135deg,#c8a96e,#a5854e);color:#17181b;border-color:transparent;}'
   +'.cpx-note{font-size:.72rem;color:#8b909a;line-height:1.55;padding:6px 16px 8px;}'
   +'.cpx-search{margin:4px 16px 8px;}'
   +'.cpx-search input{width:100%;box-sizing:border-box;background:#1f2228;border:1px solid #33373f;border-radius:10px;color:#e9eaed;font-size:.86rem;padding:9px 12px;font-family:inherit;}'
   +'.cpx-list{flex:1;overflow-y:auto;padding:0 16px 12px;}'
   +'.cpx-card{border:1px solid #2a2d34;border-radius:13px;background:#1b1e23;padding:11px 12px;margin-bottom:9px;}'
   +'.cpx-nm{font-size:.9rem;font-weight:700;color:#e9eaed;margin-bottom:2px;}'
   +'.cpx-base{font-size:.68rem;color:#8b909a;margin-bottom:8px;}'
   +'.cpx-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;}'
   +'.cpx-fld label{display:block;font-size:.68rem;color:#9aa0aa;margin-bottom:3px;}'
   +'.cpx-fld .u{display:flex;align-items:center;background:#22262c;border:1px solid #363a42;border-radius:9px;padding:0 9px;}'
   +'.cpx-fld input{flex:1;width:100%;background:none;border:none;color:#f0e6d2;font-size:.86rem;font-weight:700;font-family:inherit;padding:9px 0;text-align:right;}'
   +'.cpx-fld .w{font-size:.7rem;color:#8b909a;padding-left:4px;}'
   +'.cpx-foot{padding:12px 16px calc(14px + env(safe-area-inset-bottom));border-top:1px solid #2a2d34;display:flex;gap:8px;}'
   +'.cpx-save{flex:1;background:linear-gradient(135deg,#c8a96e,#a5854e);color:#17181b;border:none;border-radius:12px;padding:13px;font-size:.94rem;font-weight:800;font-family:inherit;cursor:pointer;}'
   +'.cpx-save:active{transform:scale(.99);}';
  (document.head||document.documentElement).appendChild(st);

  var ov=null;
  function fields(name){
    var m=cfg.models[name]||{};
    var b=baseOf(name);
    function fld(k,lbl){ var v=(m[k]!=null?m[k]:''); return '<div class="cpx-fld"><label>'+lbl+'</label><div class="u"><input type="number" inputmode="numeric" data-nm="'+esc(name)+'" data-k="'+k+'" value="'+esc(v)+'" placeholder="'+(b!=null?won(b):'요금')+'"/><span class="w">원/h</span></div></div>'; }
    return '<div class="cpx-card" data-card="'+esc(name)+'"><div class="cpx-nm">'+esc(name)+'</div>'
      +(b!=null?'<div class="cpx-base">기본요금 '+won(b)+'원/h · 미입력 시 기본요금 적용</div>':'<div class="cpx-base">미입력 시 기본요금 적용</div>')
      +'<div class="cpx-grid">'+fld('pwd','성수기 · 평일')+fld('pwe','성수기 · 주말')+fld('owd','비성수기 · 평일')+fld('owe','비성수기 · 주말')+fld('own','비성수기 · 평일 · 심야')+'</div></div>';
  }
  function renderList(filter){
    var box=ov.querySelector('.cpx-list'); if(!box) return;
    if(FLEET==null){ box.innerHTML='<div style="color:#8b909a;text-align:center;padding:30px 0;font-size:.85rem;">차량 목록 불러오는 중…</div>'; return; }
    var models=FLEET.slice();
    if(filter){ var f=filter.toLowerCase(); models=models.filter(function(n){ return n.toLowerCase().indexOf(f)>=0; }); }
    box.innerHTML=models.length?models.map(fields).join(''):'<div style="color:#8b909a;text-align:center;padding:30px 0;font-size:.85rem;">등록된 차량이 없습니다.</div>';
  }
  function syncSeasonBtns(){
    var p=ov.querySelector('[data-season="peak"]'), o=ov.querySelector('[data-season="off"]');
    if(p) p.classList.toggle('on', cfg.season==='peak');
    if(o) o.classList.toggle('on', cfg.season!=='peak');
  }
  function collect(){
    var models=Object.assign({},cfg.models);   /* ★[v108.2] 검색으로 가려진 차종의 요금은 그대로 두고, 화면에 보이는 차종만 새로 쓴다 */
    ov.querySelectorAll('.cpx-card').forEach(function(c){ var k=c.getAttribute('data-card'); if(k) delete models[k]; });
    ov.querySelectorAll('.cpx-fld input').forEach(function(inp){
      var nm=inp.getAttribute('data-nm'), k=inp.getAttribute('data-k');
      var v=parseInt(inp.value,10);
      if(!isNaN(v) && v>0){ if(!models[nm]) models[nm]={}; models[nm][k]=v; }
    });
    cfg.models=models;
  }
  function doSave(){
    collect(); saveLS();
    var pr=saveRemote();
    if(pr && pr.then){ pr.then(function(){ toast('요금 설정을 저장했습니다.'); }).catch(function(){ toast('로컬 저장 완료 (서버 저장 실패 — 네트워크/권한 확인)'); }); }
    else { toast('요금 설정을 저장했습니다.'); }
    try{ if(window.caroReloadPricing) window.caroReloadPricing(); if(window.caroApplyPricing) window.caroApplyPricing(new Date()); }catch(e){}
    try{ syncApplied(); }catch(e){}
  }

  function build(){
    if(ov) return;
    ov=document.createElement('div'); ov.id='cpx-ov';
    ov.innerHTML=
      '<div id="cpx-panel">'
      +'<div class="cpx-hd"><h2>요금 관리 · 성수기/주말</h2><button class="cpx-x" type="button" aria-label="닫기">✕</button></div>'
      +'<div class="cpx-season"><span class="cpx-season-lbl">현재 적용 시즌</span><button class="cpx-sb" type="button" data-season="peak">성수기</button><button class="cpx-sb" type="button" data-season="off">비성수기</button></div>'
      +'<div class="cpx-note">· 주말요금 자동 적용: <b>금요일 18시~ + 토·일 + 공휴일</b><br>· 심야요금(비성수기 평일): <b>20:00~08:00</b> 자동 적용 (비우면 비성수기 평일 요금 적용)<br>· 동일 차종은 한 번만 입력하면 같은 차종 전체에 적용됩니다.<br>· 비워두면 해당 차종은 기존 기본요금이 적용됩니다.</div>'
      +'<div class="cpx-search"><input type="text" placeholder="차종 검색 (예: 아반떼, GV80)"/></div>'
      +'<div class="cpx-list"></div>'
      +'<div class="cpx-foot"><button class="cpx-save" type="button">저장</button></div>'
      +'</div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){ if(e.target===ov) close(); });
    ov.querySelector('.cpx-x').onclick=close;
    ov.querySelector('.cpx-save').onclick=doSave;
    ov.querySelector('.cpx-search input').addEventListener('input', function(){ renderList(this.value.trim()); });
    ov.querySelectorAll('[data-season]').forEach(function(b){
      b.onclick=function(){ cfg.season=b.getAttribute('data-season')==='peak'?'peak':'off'; syncSeasonBtns(); saveLS(); var pr=saveRemote(); if(pr&&pr.then){ pr.then(function(){ toast('현재 시즌: '+(cfg.season==='peak'?'성수기':'비성수기')); }).catch(function(){}); } else { toast('현재 시즌: '+(cfg.season==='peak'?'성수기':'비성수기')); } try{ if(window.caroReloadPricing) window.caroReloadPricing(); }catch(e){} };
    });
  }
  function open(){ build(); ov.classList.add('open'); renderList(''); loadFleet(function(){ loadRemote(function(){ loadLS(); syncSeasonBtns(); renderList(''); }); }); }
  function close(){ if(ov) ov.classList.remove('open'); }
  window.caroOpenPricingAdmin=open;

  function loggedIn(){ try{ return !!(window.FB_AUTH && window.FB_AUTH.currentUser); }catch(e){ return false; } }

  /* ── 버튼: "차량별 요금 관리" 헤더(빨간 칸)에 배치, 못 찾으면 우하단 플로팅 폴백 ── */
  function findHeaderHost(){
    var els=document.querySelectorAll('h1,h2,h3,h4,h5,div,span,p,strong,b,label');
    for(var i=0;i<els.length;i++){ var e=els[i]; if(e.childElementCount===0){ var tx=(e.textContent||'').trim(); if(tx==='차량별 요금 관리'){ if(e.offsetParent!==null && e.getClientRects().length) return e; } } }
    return null;   /* 보이는(요금관리 탭 활성) 제목만 반환 — 숨겨진 탭이면 null */
  }
  function wideAncestor(el){
    var n=el, best=el;
    for(var i=0;i<8 && n && n.parentElement;i++){ n=n.parentElement; if(n.offsetWidth && n.offsetWidth>=480){ best=n; break; } }
    return best;
  }
  function positionHeaderBtn(){ /* 절대배치 폐지 — 카드 헤더 안에 정상 배치하므로 불필요 */ }
  function ensureHeaderBtn(){
    var t=findHeaderHost(); if(!t) return false;
    /* 제목이 속한 카드 헤더(.card-hd)를 찾아 그 안에 버튼을 넣는다 → 제목 왼쪽·버튼 오른쪽 정렬 */
    var hd=(t.closest && t.closest('.card-hd')) || wideAncestor(t);
    if(document.getElementById('cpx-hdbtn')){
      var ex=document.getElementById('cpx-hdbtn');
      if(hd && ex.parentNode!==hd){ hd.appendChild(ex); }   /* 위치 어긋났으면 헤더로 복귀 */
      return true;
    }
    var b=document.createElement('button'); b.id='cpx-hdbtn'; b.type='button'; b.className='btn gold';
    b.textContent='성수기 / 주말 요금 설정';
    b.style.cssText='white-space:nowrap;border-radius:12px;padding:9px 16px;font-size:13px;font-weight:800;margin-left:12px;flex:0 0 auto;';
    b.onclick=open;
    if(hd){ hd.style.gap=hd.style.gap||'12px'; hd.appendChild(b); }
    else { document.body.appendChild(b); }
    return true;
  }
  /* ── 차량별 요금 관리 표에 '현재 적용 요금' 연동 표시 ── */
  var HFIX={'01-01':1,'03-01':1,'05-05':1,'06-06':1,'08-15':1,'10-03':1,'10-09':1,'12-25':1};
  var HVAR={'2026-02-16':1,'2026-02-17':1,'2026-02-18':1,'2026-05-24':1,'2026-05-25':1,'2026-09-24':1,'2026-09-25':1,'2026-09-26':1,'2027-02-06':1,'2027-02-07':1,'2027-02-08':1,'2027-05-13':1,'2027-09-14':1,'2027-09-15':1,'2027-09-16':1};
  function pad2(n){ return n<10?'0'+n:''+n; }
  function isHolidayNow(d){ try{ var md=pad2(d.getMonth()+1)+'-'+pad2(d.getDate()); if(HFIX[md])return true; return !!HVAR[d.getFullYear()+'-'+md]; }catch(e){ return false; } }
  function isWeekendNow(d){ d=d||new Date(); try{ var day=d.getDay(); if(day===0||day===6)return true; if(day===5&&d.getHours()>=18)return true; return isHolidayNow(d); }catch(e){ return false; } }
  function isNightNow(d){ d=d||new Date(); try{ var h=d.getHours(); return (h>=20||h<8); }catch(e){ return false; } }
  var KEYLBL={pwd:'성수기·평일',pwe:'성수기·주말',owd:'비성수기·평일',owe:'비성수기·주말',own:'비성수기·평일·심야'};
  function pickKey(m){
    var d=new Date(), we=isWeekendNow(d);
    if(cfg.season==='peak') return we?'pwe':'pwd';
    if(!we && isNightNow(d) && Number((m||{}).own)>0) return 'own';   /* 비성수기 평일 심야(20~08) */
    return we?'owe':'owd';
  }

  var priceObs=null;
  function enhanceTable(){
    var body=document.getElementById('priceBody'); if(!body) return;
    if(!findHeaderHost()) return;                 /* 요금관리 탭 활성일 때만 */
    if(priceObs) priceObs.disconnect();
    try{
      body.querySelectorAll('tr[data-id]').forEach(function(tr){
        var nel=tr.querySelector('.vn b'); if(!nel) return;
        var name=nel.textContent.trim();
        var ph=tr.querySelector('input.pin')||tr.querySelector('input[id^="ph_"]'); if(!ph) return;
        if(ph.dataset.cbase==null || ph.dataset.cbase==='') ph.dataset.cbase=ph.value;  /* 원래 기본요금 1회 보관 */
        var base=parseInt(ph.dataset.cbase,10)||0;
        var m=(cfg.models&&cfg.models[name])||{}; var key=pickKey(m); var ovv=Number(m[key]); var eff=(ovv>0)?ovv:base;
        /* 시간당 칸에 '지금 적용 요금'을 직접 표시(읽기전용) — 요금 변경은 성수기/주말 설정에서 */
        ph.value=eff; ph.readOnly=true; ph.title='적용 요금 (성수기/주말 설정에서 변경)';
        ph.style.color=(ovv>0)?'#c8a96e':''; ph.style.fontWeight=(ovv>0)?'800':'';
        var td=ph.parentNode; if(!td) return;
        var badge=td.querySelector('.cpx-eff');
        if(!badge){ badge=document.createElement('div'); badge.className='cpx-eff'; badge.style.cssText='margin-top:5px;font-size:11px;font-weight:700;white-space:nowrap;line-height:1.3;'; td.appendChild(badge); }
        if(ovv>0){ badge.style.color='#c8a96e'; badge.textContent='적용중 · '+KEYLBL[key]; }
        else { badge.style.color='#8b909a'; badge.textContent='기본요금 적용 · '+KEYLBL[key]; }
      });
    }catch(e){}
    if(!priceObs){ try{ priceObs=new MutationObserver(function(){ enhanceTable(); }); }catch(e){} }
    if(priceObs){ try{ priceObs.observe(body,{childList:true,subtree:true}); }catch(e){} }
  }
  function ensureSeasonChip(){
    var t=findHeaderHost(); if(!t) return;
    /* 제목 칸을 가로 배치로 → 제목 오른쪽 옆에 칩이 같은 줄에 붙는다 */
    var wrap=t.parentNode;
    if(wrap && wrap.style){ wrap.style.display='flex'; wrap.style.alignItems='center'; wrap.style.gap='10px'; wrap.style.flexWrap='wrap'; }
    var chip=document.getElementById('cpx-seasonchip');
    var today=isWeekendNow()?'주말/공휴일':(isNightNow()?'평일·심야':'평일');
    var label='현재 적용: '+(cfg.season==='peak'?'성수기':'비성수기')+' · 오늘 '+today;
    if(!chip){ chip=document.createElement('span'); chip.id='cpx-seasonchip'; chip.style.cssText='font-size:12px;font-weight:700;color:#c8a96e;background:rgba(200,169,110,.12);border:1px solid rgba(200,169,110,.35);border-radius:12px;padding:3px 10px;white-space:nowrap;'; try{ t.insertAdjacentElement('afterend', chip); }catch(e){ return; } }
    chip.textContent=label;
  }
  function syncApplied(){ enhanceTable(); ensureSeasonChip(); }
  window.caroSyncAppliedTable=syncApplied;

  function place(){
    var hd=document.getElementById('cpx-hdbtn');
    if(!loggedIn()){ if(hd) hd.remove(); if(ov) ov.classList.remove('open'); return; }
    if(findHeaderHost()){ ensureHeaderBtn(); syncApplied(); }   /* 요금관리 탭에서만 버튼+연동표시 */
    else if(hd){ hd.remove(); }
  }
  function watchAuth(){
    try{ var A=window.FB_AUTH, fn=window.FB_FN;
      if(A && fn && typeof fn.onAuthStateChanged==='function' && !watchAuth.__h){ watchAuth.__h=true; fn.onAuthStateChanged(A, function(u){ if(u){ try{ loadRemote(syncApplied); }catch(e){} } place(); }); }   /* ★[v108.2] 로그인되면 서버 요금 설정을 바로 받아 표·성수기 칩을 맞춘다 */
    }catch(e){}
  }

  /* ── 관제 대시보드 이모지 제거 (렌더된 텍스트에서 자동 삭제) ── */
  var EMO=/[\u{1F000}-\u{1FAFF}]\uFE0F?|[\u{2600}-\u{26FF}]\uFE0F?|[\u{2B00}-\u{2BFF}]\uFE0F?|\u2705|\u2714\uFE0F?|\u2728|\u2733|\u2734|\u2744|\u2747|\u2753|\u2754|\u2755|\u2757|\u2763|\u2764|\u2795|\u2796|\u2797|\u2049|\u203C|\u2122|\u2139\uFE0F?|\uFE0F|\u20E3|\u200D/gu;
  function stripText(t){ if(!t||t.nodeType!==3) return; var v=t.nodeValue; if(!v) return; var nv=v.replace(EMO,''); if(nv!==v) t.nodeValue=nv.replace(/[ \t]{2,}/g,' '); }
  function stripAll(root){ try{ var w=document.createTreeWalker(root||document.body,NodeFilter.SHOW_TEXT,null,false); var n,list=[]; while(n=w.nextNode())list.push(n); list.forEach(stripText); }catch(e){} }
  function startEmoji(){
    stripAll(document.body);
    if(startEmoji.__mo) return;
    try{ startEmoji.__mo=new MutationObserver(function(ms){ ms.forEach(function(m){
        if(m.type==='characterData'){ stripText(m.target); }
        (m.addedNodes||[]).forEach(function(nn){ if(nn.nodeType===3) stripText(nn); else if(nn.nodeType===1) stripAll(nn); });
      }); });
      startEmoji.__mo.observe(document.documentElement,{childList:true,subtree:true,characterData:true});
    }catch(e){}
  }

  loadLS();
  startEmoji(); setTimeout(startEmoji,1500); setTimeout(startEmoji,4000);
  setInterval(function(){ watchAuth(); place(); }, 1000);
  setTimeout(function(){ loadRemote(function(){ syncApplied(); }); }, 2000);
  setTimeout(function(){ loadRemote(function(){ syncApplied(); }); }, 5000);
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ startEmoji(); place(); }); else { place(); }
  console.log('[관제] 요금 관리(성수기/주말) 모듈 로드 · 이모지 제거 적용');
})();
