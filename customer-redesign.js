/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 고객 홈 리디자인 v37 (light_P1)
   ───────────────────────────────────────────────────────────
   · 배너: 진짜 슬라이드 캐러셀(트랙 이동) — 사라졌다 나오지 않음
   · 메뉴: 월 렌트 추가 / 내 정보 제거, 더 블랙 = CARO THE BLACK 3줄
   · 이벤트 화면 뒤로가기(‹) 추가, 멤버십 배너 우측 설명·가입버튼 제거
   적용: index.html — customer-redesign.js?v=119 (기존 블록 대체)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroHomeV26||window.__caroHomeV28) return; window.__caroHomeV28=true;

  function call(fn){ try{ if(typeof window[fn]==='function'){ return window[fn].apply(null,[].slice.call(arguments,1)); } }catch(e){ console.warn('[홈v28]',fn,e); } return undefined; }
  function has(fn){ return typeof window[fn]==='function'; }
  function go(id){ if(has('goTo')) call('goTo',id); }
  function toast(m){ if(has('showToast')) call('showToast',m); else try{ alert(m); }catch(e){} }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }

  var WARD='<path d="M256 396C256 396 360 292 360 208A104 104 0 0 0 152 208C152 292 256 396 256 396Z" fill="currentColor"/><path d="M293 171A52 52 0 1 0 293 245" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/>';
  function wardSvg(cls){ return '<svg class="'+cls+'" viewBox="132 92 248 350" xmlns="http://www.w3.org/2000/svg">'+WARD+'</svg>'; }

  function getActive(){ try{
      var list=window.myReservations||[], now=new Date(), best=null;
      list.forEach(function(r){ if(r && !r.returned && r.start && r.end){
        var s=new Date(r.start), e=new Date(r.end);
        if(now>=s && now<=e && !best) best={r:r,s:s,e:e};
      }});
      return best;
    }catch(e){ return null; } }
  function getBooking(){ try{
      var list=window.myReservations||[], now=new Date(), cur=null, up=null;
      list.forEach(function(r){ if(r && !r.returned && r.start && r.end){
        var s=new Date(r.start), e=new Date(r.end);
        if(now>=s && now<=e){ if(!cur||s<cur.s) cur={r:r,s:s,e:e,active:true}; }
        else if(now<s){ if(!up||s<up.s) up={r:r,s:s,e:e,active:false}; }
      }});
      return cur||up;
    }catch(e){ return null; } }
  function fmtDHM(d){ d=new Date(d); var p=function(n){return n<10?'0'+n:n;}; var t=new Date(); var same=d.toDateString()===t.toDateString(); return (same?'오늘 ':(d.getMonth()+1)+'/'+d.getDate()+' ')+p(d.getHours())+':'+p(d.getMinutes()); }
  function startTxt(x){ var ms=new Date(x)-new Date(); if(ms>0&&ms<3600000) return Math.ceil(ms/60000)+'분 후 시작'; return fmtDHM(x)+' 시작'; }
  function remainTxt(e){ var ms=e-new Date(); if(ms<=0) return '반납 시간 초과'; var m=Math.floor(ms/60000), h=Math.floor(m/60); m=m%60; return '남은 시간 '+(h>0?h+'시간 ':'')+m+'분'; }
  function hhmm(d){ var p=function(n){ return n<10?'0'+n:n; }; return p(d.getHours())+':'+p(d.getMinutes()); }
  function carName(r){ try{ return (r.car&&r.car.name)||r.carName||'예약 차량'; }catch(e){ return '예약 차량'; } }
  function carZone(r){ try{ return (r.car&&(r.car.zone||r.car.station))||r.zone||''; }catch(e){ return ''; } }
  function carImgSrc(r){ try{
      var src=(r.car&&(r.car.img||r.car.image||r.car.photo)); if(src) return src;
      var nm=carName(r);
      var c=(window.CARS_DATA||[]).filter(Boolean).filter(function(x){ return (x.name||x.carName)===nm; })[0];
      if(c) return c.img||c.image||c.photo||null;
    }catch(e){} return null; }
  function carImgTag(r){ var s=carImgSrc(r);
    return s ? '<img class="nh-carimg" src="'+esc(s)+'" alt="">'
             : '<svg class="nh-carimg" viewBox="0 0 100 52"><use href="#nh-carside"/></svg>'; }
  function carThumb(r){ var s=carImgSrc(r);
    return s ? '<img class="nh-recent-thumb" src="'+esc(s)+'" alt="">'
             : '<svg class="nh-recent-thumb" viewBox="0 0 100 52"><use href="#nh-carside"/></svg>'; }
  /* ── 주유량 게이지 (7시→5시, 300°) ── */
  function carKey(r){ try{ return (r&&r.car&&(r.car.id||r.car.name))||carName(r)||'unknown'; }catch(e){ return 'unknown'; } }
  function hashPct(s){ s=String(s||''); var h=0; for(var i=0;i<s.length;i++){ h=(h*31+s.charCodeAt(i))&0xffffff; } return 35+(h%61); } /* 35~95 고정 */
  function getFuel(r){ try{
      var key=carKey(r);
      if(has('getFuelLevel')){ var v=call('getFuelLevel',key); if(typeof v==='number'&&!isNaN(v)) return Math.max(0,Math.min(100,Math.round(v))); }
      if(window.fuelLevels && window.fuelLevels[key]!=null) return Math.max(0,Math.min(100,Math.round(window.fuelLevels[key])));
      return hashPct(key);
    }catch(e){ return null; } }
  function gpt(cx,cy,r,deg){ var a=(deg-90)*Math.PI/180; return [(cx+r*Math.cos(a)).toFixed(2),(cy+r*Math.sin(a)).toFixed(2)]; }
  function arcPath(cx,cy,r,a0,a1){ var p0=gpt(cx,cy,r,a0),p1=gpt(cx,cy,r,a1); var large=(a1-a0)>180?1:0; return 'M'+p0[0]+' '+p0[1]+' A'+r+' '+r+' 0 '+large+' 1 '+p1[0]+' '+p1[1]; }
  function fuelGauge(pct){
    if(pct==null) return '';
    pct=Math.max(0,Math.min(100,Math.round(pct)));
    var track=arcPath(50,50,46,240,480);                   /* 8시→4시 240° */
    var fill=pct>0?arcPath(50,50,46,240,240+pct*2.4):'';    /* 100% = 240° */
    return '<div class="nh-gauge"><svg viewBox="0 0 100 100">'
      +'<path d="'+track+'" fill="none" stroke="#e0e3e8" stroke-width="2.8" stroke-linecap="round"/>'
      +(fill?'<path class="nh-gfill" d="'+fill+'" fill="none" stroke-width="2.8" stroke-linecap="round"/>':'')
      +'</svg></div>';
  }
  function fuelText(pct){
    if(pct==null) return '';
    pct=Math.max(0,Math.min(100,Math.round(pct)));
    return '<div class="nh-orb-fuel"><svg class="nh-fuel-ic" viewBox="0 0 24 24" fill="none" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="9" height="16" rx="1.5"/><path d="M4 11h9"/><path d="M13 8h2.4a2 2 0 0 1 2 2v6a1.4 1.4 0 0 0 2.8 0V9.2L17.6 6.6"/></svg><span>연료 '+pct+'%</span></div>';
  }
  function fmtD(d){ try{ d=new Date(d); var p=function(n){return n<10?'0'+n:n;}; return d.getFullYear()+'.'+p(d.getMonth()+1)+'.'+p(d.getDate()); }catch(e){ return ''; } }
  function getRecent(){ try{
      var list=(window.myReservations||[]).filter(function(r){ return r&&r.start&&r.end; });
      list.sort(function(a,b){ return new Date(b.start)-new Date(a.start); });
      return list[0]||null;
    }catch(e){ return null; } }
  function recentLabel(r){ var now=new Date(), s=new Date(r.start), e=new Date(r.end);
    if(r.returned || e<now) return fmtD(e)+' 반납';
    if(now>=s && now<=e) return '이용 중';
    return fmtD(s)+' 이용 예정'; }

  var EVENTS=[
    {t:'첫 이용 30% 할인', s:'신규 가입 고객이라면 누구나', ic:'coupon'},
    {t:'주중 낮 반값 이벤트', s:'월~목 09시~18시 대여요금 50%', ic:'sun'},
    {t:'친구 초대 5,000원', s:'초대한 분도 받는 분도 함께', ic:'gift'},
    {t:'심야 이동 특가', s:'22시 이후 출발하면 더 저렴하게', ic:'moon'}
  ];
  var PLANS=[
    {tag:'개인', name:'CARO 라이트', price:'월 4,900원', ic:'user'},
    {tag:'추천', name:'CARO 플러스', price:'월 14,900원', ic:'crown'},
    {tag:'법인', name:'CARO 비즈',   price:'월 99,000원', ic:'biz'}
  ];
  var BN_ICONS={
    coupon:'<path d="M3 8.4A1.4 1.4 0 0 1 4.4 7h15.2A1.4 1.4 0 0 1 21 8.4v2a1.8 1.8 0 0 0 0 3.4v1.8A1.4 1.4 0 0 1 19.6 17H4.4A1.4 1.4 0 0 1 3 15.6v-1.8a1.8 1.8 0 0 0 0-3.4Z"/><circle cx="9.6" cy="10.4" r="1"/><circle cx="14.4" cy="13.6" r="1"/><path d="M15 10 9 14"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.5 5.5l1.6 1.6M16.9 16.9l1.6 1.6M18.5 5.5 16.9 7.1M7.1 16.9 5.5 18.5"/>',
    gift:'<rect x="4" y="9.4" width="16" height="10.6" rx="1.6"/><path d="M4 13h16M12 9.4V20"/><path d="M12 9.4S9.7 5 7.7 6.1 9.7 9.4 12 9.4Zm0 0s2.3-4.4 4.3-3.3S14.3 9.4 12 9.4Z"/>',
    moon:'<path d="M20 13.6A8 8 0 1 1 10.4 4a6.4 6.4 0 0 0 9.6 9.6Z"/><path d="M17.2 3.6l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6L15 5.8l1.6-.6Z"/>',
    user:'<circle cx="12" cy="8.4" r="3.6"/><path d="M5 20a7 7 0 0 1 14 0"/>',
    crown:'<path d="M4 8l3.4 3L12 5l4.6 6L20 8l-1.4 9.6H5.4L4 8Z"/><path d="M5.4 20.6h13.2"/>',
    biz:'<rect x="5" y="3.4" width="14" height="17.2" rx="1.2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 20.6v-3.2h4v3.2"/>'
  };
  function bnIcon(id){ return '<svg viewBox="0 0 24 24">'+(BN_ICONS[id]||'')+'</svg>'; }
  var evTimerOn=false, curEv=null, plTimerOn=false, curPl=null;

  /* ── CSS ── */
  function injectCss(){
    if(document.getElementById('nh-css')) return;
    var st=document.createElement('style'); st.id='nh-css';
    st.textContent=`
    #home-screen > *:not(.nh-root){ display:none !important; }
    #home-screen{ background:var(--silver-base); overflow-y:auto; -webkit-overflow-scrolling:touch; }
    .nh-root{ width:100%; max-width:720px; margin:0 auto; padding:0 16px calc(96px + var(--sab,0px)); box-sizing:border-box; font-family:var(--font,'Pretendard',sans-serif); color:var(--text-1); }

    .nh-hd{ display:flex; align-items:center; justify-content:space-between; padding:12px 2px 2px; }
    .nh-logo b{ font-size:21px; font-weight:800; letter-spacing:-.3px; color:var(--text-1); }
    .nh-logo span{ font-size:10px; font-weight:700; color:var(--p1-accent,#67707c); letter-spacing:2.4px; margin-left:6px; }
    .nh-hd-ic{ display:flex; align-items:center; gap:4px; }
    .nh-icbtn{ position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center; background:none; border:0; padding:0; cursor:pointer; }
    .nh-icbtn svg{ width:23px; height:23px; fill:none; stroke:var(--text-2); stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
    .nh-icbtn .nh-dot{ display:none; position:absolute; top:7px; right:8px; width:8px; height:8px; border-radius:50%; background:#c8a96e; box-shadow:0 0 0 2px var(--silver-base,#eff1f4); }
    .nh-icbtn .nh-dot.on{ display:block; }

    .nh-hero{ position:relative; height:296px; display:flex; align-items:center; justify-content:center; margin:6px 0 2px; }
    .nh-halo,.nh-ring,.nh-orb{ position:absolute; top:50%; left:50%; border-radius:50%; }
    .nh-halo{ width:300px; height:300px; transform:translate(-50%,-50%); background:radial-gradient(circle,#fff 52%,rgba(255,255,255,0) 72%); pointer-events:none; }
    .nh-ring{ width:262px; height:262px; transform:translate(-50%,-50%); border:1px solid #d3d8de; pointer-events:none; }
    .nh-orb{ width:232px; height:232px; transform:translate(-50%,-50%);
      background:linear-gradient(140deg,#fff 0%,#f3f5f8 40%,#ccd3db 100%); border:1.2px solid #c2c9d1;
      display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer;
      box-shadow:0 16px 34px -16px rgba(48,56,68,.42); transition:transform .16s ease; text-align:center; padding:0 18px; }
    .nh-orb:active{ transform:translate(-50%,-50%) scale(.965); }
    .nh-orb .nh-pin{ width:42px; height:42px; margin-bottom:8px; color:var(--p1-slate,#5a6470); }
    .nh-orb .nh-carimg{ width:128px; height:70px; object-fit:contain; margin-bottom:4px; display:block; }
    .nh-orb h1{ font-size:15.5px; font-weight:800; color:var(--text-1); }
    .nh-orb p{ font-size:12px; font-weight:700; color:var(--p1-slate,#5a6470); margin-top:7px; }
    /* 접속 시 홈 콘텐츠 부드럽게 나타나기 */
    .nh-root.nh-in{ animation:nhIn .32s ease both; }
    @keyframes nhIn{ from{ opacity:0; } to{ opacity:1; } }
    /* 오브 콘텐츠 래퍼 — 로딩→예약차량이 그 자리에서 아주 부드럽게 떠오르며 나타남 */
    .nh-orbc{ display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; width:100%; }
    .nh-orbc.in{ animation:orbIn .5s cubic-bezier(.22,.9,.3,1) both; }
    @keyframes orbIn{ from{ opacity:0; transform:translateY(8px) scale(.955); } to{ opacity:1; transform:none; } }
    /* 예약 데이터 로딩 중 스켈레톤(빈 '예약 없음' 깜빡임 방지) */
    .nh-orb.skel{ cursor:default; }
    .nh-orb .nh-skcar{ width:122px; height:66px; border-radius:13px; margin-bottom:12px; }
    .nh-orb .nh-skln{ width:120px; height:12px; border-radius:7px; }
    .nh-orb .nh-skln.w2{ width:78px; margin-top:10px; }
    .nh-orb .nh-skcar,.nh-orb .nh-skln{ background:linear-gradient(90deg,#e6eaef 25%,#f3f6f9 37%,#e6eaef 63%); background-size:400% 100%; animation:nhSk 1.15s ease infinite; }
    @keyframes nhSk{ 0%{ background-position:100% 0; } 100%{ background-position:0 0; } }
    .nh-gauge{ position:absolute; top:50%; left:50%; width:268px; height:268px; transform:translate(-50%,-50%); pointer-events:none; z-index:1; }
    .nh-gauge svg{ width:100%; height:100%; display:block; }
    .nh-gfill{ stroke:var(--accent,#18191c); }
    .nh-orb-fuel{ display:flex; align-items:center; justify-content:center; gap:4px; margin-top:6px; font-size:12px; font-weight:800; color:var(--accent,#18191c); }
    .nh-orb-fuel .nh-fuel-ic{ width:14px; height:14px; stroke:var(--accent,#18191c); }

    .nh-active{ position:relative; overflow:hidden; margin-top:16px; border-radius:20px; padding:20px;
      background:linear-gradient(135deg,#b4bcc7 0%,#9fa8b4 50%,#8d97a3 100%); color:#fff; }
    .nh-active .nh-badge{ display:inline-block; padding:5px 13px; border-radius:11px; font-size:10px; font-weight:800; background:var(--accent); color:#fff; }
    .nh-active h3{ margin-top:16px; font-size:16px; font-weight:800; }
    .nh-active .nh-sub{ display:block; margin-top:6px; font-size:11px; font-weight:600; color:rgba(255,255,255,.9); }
    .nh-active .nh-rm{ position:absolute; top:20px; right:20px; font-size:10.5px; font-weight:700; }
    .nh-act-btns{ display:flex; gap:8px; margin-top:16px; }
    .nh-abtn{ flex:1; padding:11px; border-radius:12px; border:0; font-family:inherit; font-weight:800; font-size:12.5px; cursor:pointer; }
    .nh-abtn.dim{ background:rgba(255,255,255,.22); color:#fff; }
    .nh-abtn.solid{ background:#fff; color:var(--p1-accent-d,#57616d); }

    /* 메뉴 6개 · 3열 */
    .nh-menu{ margin-top:16px; background:var(--p1-card,#fff); border-radius:20px; padding:22px 12px; display:grid; grid-template-columns:repeat(3,1fr); gap:22px 0; box-shadow:0 2px 10px -6px rgba(40,48,58,.14); }
    .nh-mi{ display:flex; flex-direction:column; align-items:center; gap:10px; cursor:pointer; }
    .nh-mi:active{ transform:scale(.95); }
    .nh-mi .nh-box{ width:52px; height:52px; border-radius:16px; background:var(--p1-soft,#f2f3f5); display:flex; align-items:center; justify-content:center; }
    .nh-mi.prem .nh-box{ background:linear-gradient(140deg,#2a2d34,#15161a); box-shadow:0 4px 12px -6px rgba(0,0,0,.4); }
    .nh-mi .nh-box svg{ width:24px; height:24px; stroke:var(--p1-slate,#5a6470); fill:none; stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
    .nh-mi.prem .nh-box svg{ stroke:#c8a96e; }
    .nh-mi span{ font-size:12px; font-weight:700; color:var(--text-1); text-align:center; line-height:1.2; }
    .nh-mi.prem .nh-box .nh-tbmk{ display:block; font-size:9.5px; font-weight:800; letter-spacing:.4px; line-height:1.36; color:#f3d38a !important; text-align:center; text-shadow:0 1px 2px rgba(0,0,0,.55); }

    /* CARO THE BLACK 배너 (프리미엄 — 독립 배치) */
    .nh-black{ display:flex; align-items:center; justify-content:space-between; gap:14px; cursor:pointer; border-radius:18px; padding:16px 18px; height:104px; box-sizing:border-box; background:linear-gradient(135deg,#23262e 0%,#141519 100%); border:1px solid rgba(174,182,194,.30); box-shadow:0 8px 20px -10px rgba(0,0,0,.5); -webkit-user-select:none; user-select:none; }
    .nh-black-l{ flex:1 1 auto; min-width:0; }
    .nh-black-t{ font-family:var(--font-brand,'Oswald',sans-serif); font-size:16px; font-weight:700; letter-spacing:.12em; color:#f3d38a; }
    .nh-black-s{ font-size:11.5px; font-weight:600; color:#9a958c; margin-top:6px; }

    .nh-sec{ margin-top:22px; }
    .nh-sec-hd{ display:flex; align-items:center; justify-content:space-between; margin:0 2px 8px; }
    .nh-sec-hd h2{ font-size:15px; font-weight:800; color:var(--text-1); }
    .nh-sec-hd a{ font-size:11.5px; font-weight:700; color:var(--p1-accent,#67707c); cursor:pointer; }

    /* 슬라이드 캐러셀 공통 */
    .nh-track{ display:flex; transition:transform .55s cubic-bezier(.33,0,.2,1); }
    .nh-slide{ position:relative; flex:0 0 100%; box-sizing:border-box; padding:14px 18px; height:104px; display:flex; flex-direction:column; justify-content:center; }
    .nh-ev-ic,.nh-pl-ic{ position:absolute; right:16px; top:50%; transform:translateY(-50%); width:54px; height:54px; border-radius:16px; display:flex; align-items:center; justify-content:center; }
    .nh-ev-ic{ background:rgba(255,255,255,.55); box-shadow:0 5px 13px -6px rgba(40,48,58,.4); }
    .nh-pl-ic{ background:var(--p1-soft,#f2f3f5); box-shadow:0 3px 9px -5px rgba(40,48,58,.32); }
    .nh-ev-ic svg,.nh-pl-ic svg{ width:28px; height:28px; fill:none; stroke:var(--p1-accent-d,#57616d); stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
    .nh-pl-ic svg{ stroke:var(--p1-slate,#5a6470); }
    .nh-plan .nh-slide h3,.nh-plan .nh-price{ padding-right:82px; }
    .nh-dots{ display:flex; align-items:center; gap:6px; }
    .nh-dots i{ width:6px; height:6px; border-radius:50%; opacity:.35; transition:.2s; }
    .nh-dots i.on{ width:18px; border-radius:3px; opacity:.95; }

    .nh-ev{ position:relative; overflow:hidden; border-radius:18px; height:104px; box-sizing:border-box; cursor:pointer; -webkit-user-select:none; user-select:none;
      background:linear-gradient(135deg,#d2d8e0 0%,#c1c9d3 50%,#b0b9c4 100%); }
    .nh-ev .nh-badge{ display:inline-block; padding:2.5px 8px; border-radius:8px; font-size:8.5px; font-weight:800; letter-spacing:.06em; background:var(--p1-accent-d,#57616d); color:#fff; align-self:flex-start; }
    .nh-ev .nh-slide h3{ margin-top:8px; font-size:16px; font-weight:800; color:#1b2027; padding-right:70px; }
    .nh-ev .nh-slide .nh-sub{ display:block; margin-top:4px; font-size:11px; font-weight:600; color:#535c66; padding-right:78px; }
    .nh-ev .nh-dots{ position:absolute; right:18px; bottom:12px; z-index:2; }
    .nh-ev .nh-dots i{ background:var(--p1-accent-d,#57616d); }

    .nh-plan{ position:relative; overflow:hidden; border-radius:18px; height:104px; box-sizing:border-box; cursor:pointer; -webkit-user-select:none; user-select:none;
      background:linear-gradient(135deg,#fff 0%,#f8fafb 50%,#ecf0f4 100%); border:1.3px solid var(--p1-line2,#d5dae1); box-shadow:0 2px 10px -6px rgba(40,48,58,.14); }
    .nh-plan .nh-tag{ display:inline-block; padding:5px 12px; border-radius:999px; font-size:10px; font-weight:700; background:var(--p1-accent,#67707c); color:#fff; }
    .nh-plan .nh-slide h3{ margin-top:7px; font-size:18px; font-weight:800; color:var(--text-1); }
    .nh-plan .nh-price{ margin-top:5px; font-size:14px; font-weight:800; color:var(--text-1); }
    .nh-plan .nh-pl-dots{ position:absolute; right:18px; bottom:12px; z-index:2; }
    .nh-pl-dots i{ background:var(--p1-slate,#5a6470); }
    .nh-pl-dots i.on{ background:var(--p1-accent,#67707c); }

    #nh-nav{ position:fixed; left:0; right:0; bottom:0; background:#fff; border-top:1px solid var(--p1-line,#e8eaee); padding-bottom:var(--sab,0px); z-index:900; }
    #nh-nav .nh-nav-in{ width:100%; max-width:720px; margin:0 auto; display:grid; grid-template-columns:repeat(4,1fr); padding:10px 0 6px; }
    #nh-nav .nh-nav-it{ display:flex; flex-direction:column; align-items:center; gap:5px; color:var(--p1-line2,#c8ced6); cursor:pointer; background:none; border:0; font-family:inherit; }
    #nh-nav .nh-nav-it.on{ color:var(--text-1); }
    #nh-nav .nh-nav-it svg{ width:22px; height:22px; stroke:currentColor; fill:none; stroke-width:1.75; stroke-linecap:round; stroke-linejoin:round; }
    #nh-nav .nh-nav-it span{ font-size:10.5px; font-weight:600; }
    #nh-nav .nh-nav-it.on span{ font-weight:700; }

    /* 최근 대여한 차량 */
    .nh-recent{ margin-top:16px; background:var(--p1-card,#fff); border-radius:20px; padding:16px 18px; box-shadow:0 2px 10px -6px rgba(40,48,58,.14); cursor:pointer; }
    .nh-recent-hd{ font-size:12px; font-weight:800; color:var(--text-1); margin-bottom:12px; }
    .nh-recent-row{ display:flex; align-items:center; gap:14px; }
    .nh-recent-thumb{ width:68px; height:42px; object-fit:contain; flex:0 0 auto; }
    .nh-recent-info{ flex:1; min-width:0; }
    .nh-recent-car{ font-size:14px; font-weight:800; color:var(--text-1); }
    .nh-recent-date{ font-size:11.5px; font-weight:600; color:var(--text-m); margin-top:3px; }
    .nh-recent-arr{ width:20px; height:20px; color:var(--p1-line2,#c8ced6); flex:0 0 auto; }
    .nh-recent-empty{ font-size:12.5px; font-weight:600; color:var(--text-m); padding:4px 0 2px; }

    /* 결제·면허 전체화면 */
    #nh-wallet-screen{ position:fixed; top:0; left:0; right:0; bottom:0; width:100%; height:100%; z-index:1300; background:var(--silver-base,#eff1f4); transform:translateX(100%); transition:transform .3s cubic-bezier(.22,1,.36,1); overflow-y:auto; -webkit-overflow-scrolling:touch; }
    #nh-wallet-screen.open{ transform:translateX(0); }
    #nh-wallet-screen .nh-wallet-hd{ display:flex; align-items:center; gap:6px; padding:calc(12px + var(--sat,0px)) 12px 10px; }
    #nh-wallet-screen .nh-wallet-back{ width:40px; height:40px; border:0; background:none; font-size:28px; line-height:1; color:var(--text-1); cursor:pointer; padding:0 0 4px; }
    #nh-wallet-screen .nh-wallet-hd span{ font-size:17px; font-weight:800; color:var(--text-1); }
    #nh-wallet-screen .nh-wallet-body{ padding:6px 20px calc(92px + var(--sab,0px)); max-width:520px; margin:0 auto; }
    #nh-wallet-screen .nh-wallet-back-btm{ position:fixed; left:16px; right:16px; bottom:calc(16px + var(--sab,0px)); height:52px; border:0; border-radius:14px; background:var(--accent,#18191c); color:#fff; font-family:inherit; font-weight:800; font-size:14px; cursor:pointer; z-index:1310; box-shadow:0 8px 20px -8px rgba(24,25,28,.5); max-width:520px; margin:0 auto; }
    #nh-wallet-screen .nh-wallet-sec{ font-size:13px; font-weight:800; color:var(--text-1); margin:18px 2px 12px; }
    .nh-inf-card{ position:relative; overflow:hidden; background:#fff; border:1.4px solid #dce1e8; border-radius:18px; padding:20px 20px 20px 24px; margin-bottom:12px; color:var(--text-1,#1b2027); box-shadow:0 6px 18px -11px rgba(40,48,58,.22); }
    .nh-inf-card::before{ content:''; position:absolute; left:0; top:0; bottom:0; width:5px; background:linear-gradient(#67707c,#3a424c); }
    .nh-inf-lic{ background:linear-gradient(135deg,#fbfcfd 0%,#eef1f5 100%); }
    .nh-inf-lic::before{ background:linear-gradient(#5b6b82,#37455a); }
    .nh-inf-cn{ font-size:13.5px; font-weight:800; color:var(--accent,#18191c); }
    .nh-inf-num{ font-size:19px; font-weight:800; letter-spacing:.08em; margin-top:14px; color:var(--text-1,#1b2027); font-family:var(--font-brand,'Oswald',sans-serif); }
    .nh-inf-ex{ font-size:11.5px; color:var(--text-2,#5a6470); margin-top:10px; }
    .nh-inf-empty{ text-align:center; color:var(--text-m); padding:30px 0; font-size:13px; }
    .nh-inf-note{ font-size:11px; color:var(--text-m); margin-top:14px; text-align:center; }
    .nh-wallet-add{ width:100%; box-sizing:border-box; display:flex; align-items:center; justify-content:center; gap:7px; border:1.4px dashed #c2c9d2; background:#fff; border-radius:14px; padding:15px; font-family:inherit; font-size:13.5px; font-weight:700; color:var(--text-1,#1b2027); cursor:pointer; margin-bottom:10px; transition:background .15s,border-color .15s; }
    .nh-wallet-add:active{ background:#eef1f5; }
    .nh-wallet-add .nh-wa-ic{ font-size:17px; line-height:1; font-weight:400; color:var(--p1-accent,#67707c); }
    .nh-wallet-add.corp{ border-style:solid; border-color:#d5dae1; background:linear-gradient(135deg,#f1f4f8 0%,#e5eaf1 100%); }

    /* 스플래시 */
    #splash-screen{ background:var(--silver-base); }
    #splash-screen .csp-brand{ color:var(--text-1); }
    #splash-screen .csp-tag{ color:var(--text-m); }
    #splash-screen .csp-line{ background:var(--p1-line2,#d5dae1); }
    .nh-splash-mk{ width:108px; height:108px; border-radius:28px; margin-bottom:24px;
      background:linear-gradient(145deg,#f5f7fa,#dee3ea); border:1px solid #d3d8de;
      display:flex; align-items:center; justify-content:center; box-shadow:0 10px 26px -14px rgba(48,56,68,.34); }
    .nh-splash-mk svg{ width:46px; height:46px; color:var(--p1-slate,#5a6470); }

    /* 이벤트 화면 — P1 + 뒤로가기 */
    #event-screen{ background:var(--silver-base); }
    #event-screen .ev-body{ padding-bottom:92px; }
    #event-screen .nh-ev-back{ position:fixed; left:16px; right:16px; bottom:calc(16px + var(--sab,0px)); height:52px; border:0; border-radius:14px; background:var(--accent); color:#fff; font-family:inherit; font-weight:800; font-size:14px; cursor:pointer; z-index:1000; box-shadow:0 8px 20px -8px rgba(24,25,28,.5); }
    #event-screen .ev-main-title{ color:var(--text-1); }
    #event-screen .ev-sub{ color:var(--text-m); }
    #event-screen .brand-logo{ color:var(--text-1); }
    #event-screen .ev-card{ background:var(--p1-card,#fff) !important; border:1px solid var(--p1-line2,#d5dae1) !important; border-radius:18px !important; box-shadow:0 2px 10px -6px rgba(40,48,58,.14) !important; margin-bottom:12px; }
    #event-screen .ev-card-title{ color:var(--text-1) !important; }
    #event-screen .ev-card-period{ color:var(--text-m) !important; }
    #event-screen .ev-card-arrow{ color:var(--p1-line2,#c8ced6) !important; }
    #event-screen .ev-card-badge{ background:var(--p1-soft,#f2f3f5) !important; color:var(--p1-accent-d,#57616d) !important; border:0 !important; }
    `;
    (document.head||document.documentElement).appendChild(st);
  }

  function injectSprite(){
    if(document.getElementById('nh-sprite')) return;
    var d=document.createElement('div'); d.id='nh-sprite'; d.style.display='none';
    d.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg"><defs>
      <symbol id="nh-bell" viewBox="0 0 24 24"><path d="M6.5 9.5a5.5 5.5 0 0 1 11 0c0 5 2 6.5 2 6.5H4.5s2-1.5 2-6.5Z"/><path d="M10.2 19.4a2 2 0 0 0 3.6 0"/></symbol>
      <symbol id="nh-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></symbol>
      <symbol id="nh-home" viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1v-9.5Z"/></symbol>
      <symbol id="nh-pinnav" viewBox="0 0 24 24"><path d="M12 21s7-7.2 7-12A7 7 0 0 0 5 9c0 4.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.6"/></symbol>
      <symbol id="nh-listnav" viewBox="0 0 24 24"><path d="M8 6.5h12M8 12h12M8 17.5h12"/><circle cx="4.2" cy="6.5" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.2" cy="12" r="1.2" fill="currentColor" stroke="none"/><circle cx="4.2" cy="17.5" r="1.2" fill="currentColor" stroke="none"/></symbol>
      <symbol id="nh-user" viewBox="0 0 24 24"><circle cx="12" cy="8.4" r="3.9"/><path d="M4.6 20.4a7.4 7.4 0 0 1 14.8 0"/></symbol>
      <symbol id="nh-car" viewBox="0 0 24 24"><path d="M4 13.5 5.7 8.9A2.5 2.5 0 0 1 8 7.4h8a2.5 2.5 0 0 1 2.3 1.5L20 13.5"/><path d="M3.6 13.5h16.8v4.4a.8.8 0 0 1-.8.8H18a2 2 0 0 1-4 0h-4a2 2 0 0 1-4 0H4.4a.8.8 0 0 1-.8-.8v-4.4Z"/><circle cx="7.6" cy="15.6" r="1"/><circle cx="16.4" cy="15.6" r="1"/></symbol>
      <symbol id="nh-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="16" rx="2.4"/><path d="M3.5 9.5h17M8 3v4M16 3v4"/></symbol>
      <symbol id="nh-card" viewBox="0 0 24 24"><rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3 9.7h18"/><path d="M6.5 14.5h4"/></symbol>
      <symbol id="nh-id" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2.4"/><circle cx="8.5" cy="11" r="2"/><path d="M5.6 16c.5-1.5 1.9-2.3 2.9-2.3s2.4.8 2.9 2.3"/><path d="M14 10h4.5M14 13.5h4.5"/></symbol>
      <symbol id="nh-wallet" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2.4"/><path d="M3 10h18"/><path d="M14.5 14h3.5"/></symbol>
      <symbol id="nh-crown" viewBox="0 0 24 24"><path d="M4 8.5l3.2 3 3.3-5 3.3 5 3.2-3-1.3 9H5.3L4 8.5Z"/><path d="M5.2 20.5h13.6"/></symbol>
      <symbol id="nh-gift" viewBox="0 0 24 24"><rect x="3.5" y="9" width="17" height="11.5" rx="2.4"/><path d="M3.5 13.4h17M12 9v11.5"/><path d="M12 9S9.6 4 7.4 5.2 9.4 9 12 9Zm0 0s2.4-5 4.6-3.8S14.6 9 12 9Z"/></symbol>
      <symbol id="nh-book" viewBox="0 0 24 24"><path d="M4 5.2A2.2 2.2 0 0 1 6.2 3H19v15.4H6.2A2.2 2.2 0 0 0 4 20.6V5.2Z"/><path d="M4 18.4A2.2 2.2 0 0 1 6.2 21H19"/></symbol>
      <symbol id="nh-head" viewBox="0 0 24 24"><path d="M4.6 15v-3a7.4 7.4 0 0 1 14.8 0v3"/><rect x="2.6" y="13.6" width="4.2" height="6.2" rx="2"/><rect x="17.2" y="13.6" width="4.2" height="6.2" rx="2"/></symbol>
      <symbol id="nh-carside" viewBox="0 0 100 52"><path d="M4 36 L8 23 C9.5 19.5 13 17.5 17.5 17.5 L54 17.5 C60 17.5 64.5 19.5 68.5 23 L80 27.5 C88 29.5 93 31.5 93 36.5 L93 40 C93 42 92 43 90 43 L84 43 A9 9 0 0 0 66 43 L34 43 A9 9 0 0 0 16 43 L7 43 C5 43 4 42 4 40 Z" fill="#c8cfd7"/><path d="M15 22.5 C17.5 20.5 20 19.5 23.5 19.5 L44 19.5 L44 27.5 L13 27.5 Z" fill="#eef1f4"/><path d="M48 19.5 L54 19.5 C58.5 19.5 62 21 65 23.5 L71 27.5 L48 27.5 Z" fill="#eef1f4"/><circle cx="25" cy="43" r="9.5" fill="#3a424c"/><circle cx="25" cy="43" r="4.2" fill="#dfe3e8"/><circle cx="75" cy="43" r="9.5" fill="#3a424c"/><circle cx="75" cy="43" r="4.2" fill="#dfe3e8"/></symbol>
    </defs></svg>`;
    document.body.appendChild(d);
  }
  function ic(id){ return '<svg><use href="#'+id+'"/></svg>'; }
  function secHd(title,key,noAll){ return '<div class="nh-sec-hd"><h2>'+esc(title)+'</h2>'+(noAll?'':'<a data-all="'+key+'">전체보기 ›</a>')+'</div>'; }
  /* ── 결제·면허 — 전체화면(보안 마스킹) ── */
  function maskLicense(l){
    l=String(l||'').replace(/[^0-9A-Za-z]/g,'');
    if(!l) return '—';
    if(l.length<=4) return l.slice(0,1)+'•••';
    return l.slice(0,2)+' •••• •••• '+l.slice(-2);
  }
  function cardRows(){
    var cards=(window.savedCards||[]);
    return cards.length
      ? cards.map(function(c){ return '<div class="nh-inf-card"><div class="nh-inf-cn">'+esc(c.alias||'카드')+'</div>'
          +'<div class="nh-inf-num">•••• •••• •••• '+esc(c.last4||'····')+'</div>'
          +'<div class="nh-inf-ex">'+(c.exp?'유효기간 '+esc(c.exp):'등록된 결제 카드')+'</div></div>'; }).join('')
      : '<div class="nh-inf-empty">등록된 카드가 없습니다</div>';
  }
  function licRows(){
    var u=window.userInfo||{}, l=u.license||'';
    return l
      ? '<div class="nh-inf-card nh-inf-lic"><div class="nh-inf-cn">'+esc(u.name||'운전면허')+'</div>'
        +'<div class="nh-inf-num">'+esc(maskLicense(l))+'</div><div class="nh-inf-ex">등록된 운전면허</div></div>'
      : '<div class="nh-inf-empty">등록된 면허 정보가 없습니다</div>';
  }
  function walletBody(){
    return '<div class="nh-wallet-sec">결제 수단</div>'+cardRows()
      +'<button class="nh-wallet-add" type="button" data-addcard="1"><span class="nh-wa-ic">＋</span>결제수단 추가</button>'
      +'<button class="nh-wallet-add corp" type="button" data-addcorp="1"><span class="nh-wa-ic">＋</span>법인카드 등록</button>'
      +'<div class="nh-wallet-sec">운전면허</div>'+licRows()
      +'<div class="nh-inf-note">보안을 위해 카드번호·면허번호 일부는 가려집니다.</div>';
  }
  function addCard(corp){
    if(has('openAddCard')){
      call('openAddCard');
      /* 결제·면허 화면(z:1300) 위로 모달 올리기 */
      requestAnimationFrame(function(){
        var m=document.getElementById('add-card-modal'); if(m) m.style.zIndex='1400';
        if(corp){ var a=document.getElementById('ac-name'); if(a){ a.value='법인카드'; } }
      });
    } else { toast('카드 등록은 마이페이지에서 이용해 주세요.'); }
  }
  function bindWalletBody(w){
    var a=w.querySelector('[data-addcard]'); if(a) a.onclick=function(){ addCard(false); };
    var c=w.querySelector('[data-addcorp]'); if(c) c.onclick=function(){ addCard(true); };
  }
  function refreshWallet(){
    var w=document.getElementById('nh-wallet-screen'); if(!w||!w.classList.contains('open')) return;
    var body=w.querySelector('.nh-wallet-body'); if(!body) return;
    body.innerHTML=walletBody(); bindWalletBody(w);
  }
  function closeWallet(){ var w=document.getElementById('nh-wallet-screen'); if(w) w.classList.remove('open'); }
  function openWallet(){
    var w=document.getElementById('nh-wallet-screen');
    if(!w){ w=document.createElement('div'); w.id='nh-wallet-screen'; document.body.appendChild(w); }
    w.innerHTML='<div class="nh-wallet-hd"><button class="nh-wallet-back" type="button">‹</button><span>결제 · 면허</span></div>'
      +'<div class="nh-wallet-body">'+walletBody()+'</div>'
      +'<button class="nh-wallet-back-btm" type="button">‹ 뒤로</button>';
    w.querySelector('.nh-wallet-back').onclick=closeWallet;
    w.querySelector('.nh-wallet-back-btm').onclick=closeWallet;
    bindWalletBody(w);
    /* 카드 저장·삭제 시 지갑 화면 자동 갱신(1회 후킹) */
    if(!window._caroWalletHook){
      window._caroWalletHook=true;
      ['saveCard','saveCardFromPI','deleteCard','deletePICard'].forEach(function(fn){
        var orig=window[fn];
        if(typeof orig==='function'){ window[fn]=function(){ var r=orig.apply(this,arguments); try{ refreshWallet(); }catch(e){} return r; }; }
      });
    }
    requestAnimationFrame(function(){ w.classList.add('open'); });
  }

  /* 메뉴 6개: 내 예약, 월 렌트, 이벤트 / 이용 안내, 결제·면허, 고객센터 */
  var MENU=[
    {l:'내 예약', i:'nh-car', fn:function(){ go('my-reservation-screen'); }},
    {l:'월 렌트', i:'nh-cal', fn:function(){ if(has('openMonthly')) call('openMonthly'); else toast('월 렌트 준비 중입니다.'); }},
    {l:'이벤트', i:'nh-gift', fn:function(){ go('event-screen'); }},
    {l:'이용 안내', i:'nh-book', fn:function(){ window.__csBack='home-screen'; if(has('goToCsDetail')) call('goToCsDetail',0); else go('cs-screen'); }},
    {l:'결제·면허', i:'nh-wallet', fn:function(){ openWallet(); }},
    {l:'고객센터', i:'nh-head', fn:function(){ go('cs-screen'); }}
  ];

  function bindSwipe(el, next, prev, onTap){
    var x0=null,y0=null,last=0;
    el.addEventListener('touchstart',function(e){ var t=e.touches[0]; x0=t.clientX; y0=t.clientY; },{passive:true});
    el.addEventListener('touchend',function(e){
      if(x0==null) return; var t=(e.changedTouches&&e.changedTouches[0])||{};
      var dx=(t.clientX||x0)-x0, dy=(t.clientY||y0)-y0; x0=null; last=Date.now();
      if(Math.abs(dx)>40 && Math.abs(dx)>Math.abs(dy)){ (dx<0?next:prev)(); }
      else if(Math.abs(dx)<12 && Math.abs(dy)<12){ (onTap||next)(); }
    },{passive:true});
    el.addEventListener('click',function(){ if(Date.now()-last<600) return; (onTap||next)(); });
  }

  /* 슬라이드 캐러셀 (클론 1장으로 앞으로 무한 슬라이드) */
  function carousel(view, slides, opts){
    opts=opts||{};
    var n=slides.length;
    var arr=slides.concat([slides[0]]);
    var track=document.createElement('div'); track.className='nh-track';
    track.innerHTML=arr.map(function(h){ return '<div class="nh-slide">'+h+'</div>'; }).join('');
    view.insertBefore(track, view.firstChild);
    var idx=opts.start||0;
    function dots(){ if(!opts.dots) return; var r=((idx%n)+n)%n; opts.dots.innerHTML=slides.map(function(_,i){ return '<i class="'+(i===r?'on':'')+'"></i>'; }).join(''); }
    function setX(anim){ track.style.transition=anim?'':'none'; track.style.transform='translateX('+(-idx*100)+'%)'; if(!anim){ void track.offsetWidth; track.style.transition=''; } }
    function jump(i){ idx=i; setX(true); dots(); if(idx>=n){ setTimeout(function(){ idx=0; setX(false); dots(); },580); } }
    function next(){ jump(idx+1); }
    function prev(){ if(idx<=0){ idx=n; setX(false); } jump(idx-1); }
    setX(false); dots();
    return { next:next, prev:prev };
  }

  var _bootT=Date.now();   /* 접속 시각 */
  var _loginT=0;           /* 로그인 시각 — 예약 데이터 로딩 유예 기준 */
  var _renderSig='';       /* 홈 내용 시그니처 — 같으면 다시 안 그림(깜빡임 방지) */
  function render(force){
    var host=document.getElementById('home-screen'); if(!host) return;
    injectCss(); injectSprite(); styleSplash(); styleEvent();
    var root=host.querySelector('.nh-root');
    if(!root){ root=document.createElement('div'); root.className='nh-root'; host.appendChild(root); }

    /* 로그인 시각 기록 / 로그아웃 시 로드 플래그 리셋 */
    if(window._caroLoggedIn){ if(!_loginT){ _loginT=Date.now(); window._caroLoginT=_loginT; } }
    else { _loginT=0; window._caroLoginT=0; window._caroResLoaded=false; window._caroProfileLoaded=false; }
    var act=getActive();
    var bk=getBooking();
    /* 로그인했는데 예약 데이터가 아직 로드 안 됨(파이어스토어 응답 전) → '예약 없음' 대신 스켈레톤 → 빈화면 방지.
       실제 데이터 로드(window._caroResLoaded) 되거나 최대 4초 뒤 해제. 예약/이용중이 있으면 bk 로 바로 표시됨 */
    var settling = (window._caroLoggedIn && !bk && !window._caroResLoaded && (Date.now()-_loginT < 4000));
    var fuelPct = bk ? getFuel(bk.r) : null;
    var orbInner = bk
      ? '<span class="nh-chip" style="display:inline-block;padding:5px 13px;border-radius:11px;font-size:10px;font-weight:800;background:var(--accent);color:#fff;margin-bottom:10px">'+(bk.active?'이용 중':'예약됨')+'</span>'
        +carImgTag(bk.r)+'<h1>'+esc(carName(bk.r))+'</h1><p>'+(bk.active?remainTxt(bk.e):startTxt(bk.s))+'</p>'+fuelText(fuelPct)
      : settling
        ? '<div class="nh-skcar"></div><div class="nh-skln"></div><div class="nh-skln w2"></div>'
        : wardSvg('nh-pin')+'<h1>지금 바로 타기</h1><p>예약한 차량이 없습니다</p>';

    var activeCard = act
      ? '<div class="nh-active"><span class="nh-badge">이용 중</span>'
        +'<div class="nh-rm">'+remainTxt(act.e)+'</div>'
        +'<h3>'+esc(carName(act.r))+'</h3>'
        +'<span class="nh-sub">'+(carZone(act.r)?esc(carZone(act.r))+' · ':'')+hhmm(act.e)+' 반납 예정</span>'
        +'<div class="nh-act-btns"><button class="nh-abtn dim" data-act="extend">시간 연장</button>'
        +'<button class="nh-abtn solid" data-act="return">반납하기</button></div></div>'
      : '';

    var rec=getRecent();
    /* 내용 시그니처 — 동일하고 이미 그려져 있으면 재작성 생략 → 반복 render 로 인한 깜빡임 제거
       (남은시간 텍스트는 아래 updateOrbTime 이 재작성 없이 갱신) */
    var _sig=[
      bk ? carKey(bk.r)+'|'+bk.active+'|'+(+bk.s)+'|'+(+bk.e) : 'x',
      act ? carKey(act.r)+'|'+(+act.e) : 'x',
      (fuelPct==null?'x':fuelPct),
      rec ? carKey(rec) : 'x',
      settling?'s':'',
      window._caroLoggedIn?'1':'0'
    ].join('§');
    if(!force && _sig===_renderSig && root.querySelector('.nh-hero')){ return; }
    _renderSig=_sig;
    var recent='<div class="nh-recent" data-recent="1"><div class="nh-recent-hd">최근 대여한 차량</div>'
      +(rec
        ? '<div class="nh-recent-row">'+carThumb(rec)+'<div class="nh-recent-info"><div class="nh-recent-car">'+esc(carName(rec))+'</div><div class="nh-recent-date">'+recentLabel(rec)+'</div></div><svg class="nh-recent-arr" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
        : '<div class="nh-recent-empty">최근 대여한 차량이 없습니다</div>')
      +'</div>';
    var black='<div class="nh-sec">'+secHd('CARO The Black','black',true)
      +'<div class="nh-black" data-black="1"><div class="nh-black-l">'
      +'<div class="nh-black-t">◆ CARO THE BLACK</div>'
      +'<div class="nh-black-s">프리미엄 차량 · 전담 컨시어지</div></div>'
      +'</div></div>';
    var menu='<div class="nh-menu">'+MENU.map(function(m,i){
      return '<div class="nh-mi'+(m.prem?' prem':'')+'" data-mi="'+i+'"><div class="nh-box">'+(m.boxHtml||ic(m.i))+'</div><span>'+(m.html||esc(m.l))+'</span></div>';
    }).join('')+'</div>';

    var evBanner='<div class="nh-sec">'+secHd('이벤트','event')+'<div class="nh-ev"><div class="nh-dots"></div></div></div>';
    var plan='<div class="nh-sec">'+secHd('멤버십 플랜','plan')+'<div class="nh-plan"><div class="nh-dots nh-pl-dots"></div></div></div>';

    root.innerHTML=
      '<div class="nh-hd"><div class="nh-logo"><b>CARO</b><span>MOBILITY</span></div>'
      +'<div class="nh-hd-ic">'
      +'<button class="nh-icbtn" data-bell="1">'+ic('nh-bell')+'<i class="nh-dot"></i></button>'
      +'<button class="nh-icbtn" data-menu="1">'+ic('nh-menu')+'</button></div></div>'
      +'<div class="nh-hero"><div class="nh-halo"></div><div class="nh-ring"></div>'
      +(bk&&fuelPct!=null?fuelGauge(fuelPct):'')
      +'<div class="nh-orb'+(settling?' skel':'')+'" data-orb="1"><div class="nh-orbc">'+orbInner+'</div></div></div>'
      +(act?activeCard:recent)+menu+black+evBanner+plan;
    /* 콘텐츠 부드럽게 페이드 인 (접속 시 '툭' 튀어나옴 방지) */
    try{ root.classList.remove('nh-in'); void root.offsetWidth; root.classList.add('nh-in'); }catch(e){}
    /* 스켈레톤 상태면 데이터 도착까지 감시 시작 */
    if(settling) startSettlePoll();

    root.querySelector('[data-orb]').onclick=function(){ go(getActive()?'my-reservation-screen':'rental-screen'); };
    var recEl=root.querySelector('[data-recent]'); if(recEl) recEl.onclick=function(){ go('usage-history-screen'); };
    var blkEl=root.querySelector('[data-black]'); if(blkEl) blkEl.onclick=function(){ if(has('goBlackLabel')) call('goBlackLabel'); else go('black-label-screen'); };
    root.querySelectorAll('[data-all]').forEach(function(a){ a.onclick=function(e){ e.stopPropagation();
      var k=a.getAttribute('data-all');
      if(k==='black'){ if(has('goBlackLabel')) call('goBlackLabel'); else go('black-label-screen'); }
      else if(k==='event'){ go('event-screen'); }
      else if(k==='plan'){ go('membership-screen'); }
    }; });
    root.querySelector('[data-bell]').onclick=function(){ if(has('caroOpenNotif')) call('caroOpenNotif'); else if(has('openHomeMenu')) call('openHomeMenu'); };
    root.querySelector('[data-menu]').onclick=function(){ if(has('openHomeMenu')) call('openHomeMenu'); };
    if(has('caroSyncNotif')) call('caroSyncNotif'); /* 종 알림 점(골드) 동기화 */
    root.querySelectorAll('[data-mi]').forEach(function(el){ el.onclick=function(){ MENU[+el.getAttribute('data-mi')].fn(); }; });
    var actEl=root.querySelector('.nh-active');
    if(actEl){ actEl.querySelectorAll('[data-act]').forEach(function(b){ b.onclick=function(){
      var a=b.getAttribute('data-act');
      if(a==='extend'){ if(has('openExtendSheet')) call('openExtendSheet'); }
      else { if(has('ctrlActionHome')) call('ctrlActionHome','return'); else go('my-reservation-screen'); }
    }; }); }

    /* 이벤트 캐러셀 (자동 + 스와이프 + 탭→이벤트 화면) */
    var evView=root.querySelector('.nh-ev');
    var evSlides=EVENTS.map(function(e){ return '<span class="nh-badge">EVENT</span><h3>'+esc(e.t)+'</h3><span class="nh-sub">'+esc(e.s)+'</span><div class="nh-ev-ic">'+bnIcon(e.ic)+'</div>'; });
    var evc=carousel(evView, evSlides, { dots:evView.querySelector('.nh-dots') });
    curEv=evc;
    bindSwipe(evView, evc.next, evc.prev, function(){ go('event-screen'); });
    var evAll=root.querySelector('[data-events]'); if(evAll) evAll.onclick=function(e){ e.stopPropagation(); go('event-screen'); };

    /* 멤버십 캐러셀 (스와이프 + 탭→멤버십 화면) — 우측 설명/가입버튼 없음 */
    var plView=root.querySelector('.nh-plan');
    var plSlides=PLANS.map(function(p){ return '<h3>'+esc(p.name)+'</h3><div class="nh-price">'+esc(p.price)+'</div><div class="nh-pl-ic">'+bnIcon(p.ic)+'</div>'; });
    var plc=carousel(plView, plSlides, { dots:plView.querySelector('.nh-pl-dots'), start:1 });
    curPl=plc;
    bindSwipe(plView, plc.next, plc.prev, function(){ go('membership-screen'); });
    var allEl=root.querySelector('[data-plans]'); if(allEl) allEl.onclick=function(e){ e.stopPropagation(); go('membership-screen'); };

    if(!evTimerOn){ evTimerOn=true; setInterval(function(){
      var h=document.getElementById('home-screen'); if(!h||!h.classList.contains('active')) return;
      if(curEv) curEv.next();
    }, 4600); }
    if(!plTimerOn){ plTimerOn=true; setInterval(function(){
      var h=document.getElementById('home-screen'); if(!h||!h.classList.contains('active')) return;
      if(curPl) curPl.next();
    }, 4600); }
    /* ★ 리치 콘텐츠(그리드 등)를 같은 프레임에 바로 채움 → 카로 더블랙·배너가 나중에 밀려 '튀는' 것 방지 */
    try{ if(window.__caroEnrich) window.__caroEnrich(); }catch(e){}
  }

  /* 홈 전체를 다시 그리지 않고, 가운데 오브(+연료게이지)와 그 아래 이용중/최근 블록만 제자리에서 교체
     → 로딩→예약차량이 '화면 전환' 없이 그 자리에서 부드럽게 바뀜 + 재작성량 최소화(렉↓) */
  function updateHero(){
    var host=document.getElementById('home-screen'); if(!host) return;
    var root=host.querySelector('.nh-root'); if(!root) return;
    var hero=root.querySelector('.nh-hero');
    if(!hero){ render(true); return; }   /* 골격 없으면 전체 렌더 */
    var act=getActive(), bk=getBooking();
    var settling=(window._caroLoggedIn && !bk && !window._caroResLoaded && (Date.now()-_loginT<4000));
    var fuelPct=bk?getFuel(bk.r):null;
    var orbInner = bk
      ? '<span class="nh-chip" style="display:inline-block;padding:5px 13px;border-radius:11px;font-size:10px;font-weight:800;background:var(--accent);color:#fff;margin-bottom:10px">'+(bk.active?'이용 중':'예약됨')+'</span>'
        +carImgTag(bk.r)+'<h1>'+esc(carName(bk.r))+'</h1><p>'+(bk.active?remainTxt(bk.e):startTxt(bk.s))+'</p>'+fuelText(fuelPct)
      : settling ? '<div class="nh-skcar"></div><div class="nh-skln"></div><div class="nh-skln w2"></div>'
      : wardSvg('nh-pin')+'<h1>지금 바로 타기</h1><p>예약한 차량이 없습니다</p>';
    hero.innerHTML='<div class="nh-halo"></div><div class="nh-ring"></div>'
      +(bk&&fuelPct!=null?fuelGauge(fuelPct):'')
      +'<div class="nh-orb'+(settling?' skel':'')+'" data-orb="1"><div class="nh-orbc">'+orbInner+'</div></div>';
    var orbEl=hero.querySelector('[data-orb]');
    if(orbEl){ orbEl.onclick=function(){ go(getActive()?'my-reservation-screen':'rental-screen'); }; }
    /* 로딩→예약차량 콘텐츠만 그 자리에서 부드럽게 떠오르며 나타남 */
    if(!settling){ var oc=hero.querySelector('.nh-orbc'); if(oc){ try{ oc.classList.remove('in'); void oc.offsetWidth; oc.classList.add('in'); }catch(e){} } }
    /* 이용중(nh-active) / 최근(nh-recent) 블록 제자리 교체 */
    var oldBlock=root.querySelector('.nh-active')||root.querySelector('.nh-recent');
    var newHtml = act
      ? '<div class="nh-active"><span class="nh-badge">이용 중</span>'
        +'<div class="nh-rm">'+remainTxt(act.e)+'</div><h3>'+esc(carName(act.r))+'</h3>'
        +'<span class="nh-sub">'+(carZone(act.r)?esc(carZone(act.r))+' · ':'')+hhmm(act.e)+' 반납 예정</span>'
        +'<div class="nh-act-btns"><button class="nh-abtn dim" data-act="extend">시간 연장</button>'
        +'<button class="nh-abtn solid" data-act="return">반납하기</button></div></div>'
      : '<div class="nh-recent" data-recent="1"><div class="nh-recent-hd">최근 대여한 차량</div>'
        +(getRecent()
          ? '<div class="nh-recent-row">'+carThumb(getRecent())+'<div class="nh-recent-info"><div class="nh-recent-car">'+esc(carName(getRecent()))+'</div><div class="nh-recent-date">'+recentLabel(getRecent())+'</div></div><svg class="nh-recent-arr" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
          : '<div class="nh-recent-empty">최근 대여한 차량이 없습니다</div>')
        +'</div>';
    if(oldBlock && oldBlock.parentNode){
      var oldH=0; try{ oldH=oldBlock.getBoundingClientRect().height; }catch(e){}
      var tmp=document.createElement('div'); tmp.innerHTML=newHtml; var nb=tmp.firstChild;
      oldBlock.parentNode.replaceChild(nb, oldBlock);
      if(act){ nb.querySelectorAll('[data-act]').forEach(function(b){ b.onclick=function(){
        var a=b.getAttribute('data-act');
        if(a==='extend'){ if(has('openExtendSheet')) call('openExtendSheet'); }
        else { if(has('ctrlActionHome')) call('ctrlActionHome','return'); else go('my-reservation-screen'); }
      }; }); }
      else { nb.onclick=function(){ go('usage-history-screen'); }; }
      /* 블록 높이 변화(최근↔이용중)를 부드럽게 → 아래 카로 더블랙이 툭 튀지 않고 스르르 이동 */
      try{
        var newH=nb.getBoundingClientRect().height;
        if(oldH>0 && newH>0 && Math.abs(newH-oldH)>4){
          nb.style.overflow='hidden'; nb.style.height=oldH+'px'; void nb.offsetWidth;
          nb.style.transition='height .38s cubic-bezier(.22,.9,.3,1)'; nb.style.height=newH+'px';
          setTimeout(function(){ try{ nb.style.height=''; nb.style.overflow=''; nb.style.transition=''; }catch(e){} }, 430);
        }
      }catch(e){}
    }
    /* 시그니처 동기화 → 이후 render 가 같은 상태로 전체 재작성하지 않도록 */
    _renderSig=[ bk?carKey(bk.r)+'|'+bk.active+'|'+(+bk.s)+'|'+(+bk.e):'x',
      act?carKey(act.r)+'|'+(+act.e):'x', (fuelPct==null?'x':fuelPct),
      getRecent()?carKey(getRecent()):'x', settling?'s':'', window._caroLoggedIn?'1':'0' ].join('§');
    if(settling) startSettlePoll();
  }

  /* 스켈레톤 유지 중 → 데이터 로드(또는 4초 타임아웃) 되는 순간 제자리에서 최종 화면으로 전환 */
  var _settleIv=null;
  function startSettlePoll(){
    if(_settleIv) return;
    _settleIv=setInterval(function(){
      try{
        var resolved = (!window._caroLoggedIn) || window._caroResLoaded || getBooking() || (Date.now()-_loginT>=4000);
        if(resolved){ clearInterval(_settleIv); _settleIv=null; updateHero(); }
      }catch(e){ clearInterval(_settleIv); _settleIv=null; }
    }, 400);
  }

  /* 남은 시간(카운트다운)만 재렌더 없이 텍스트 갱신 → 깜빡임 없이 시간만 흐르게 */
  var _otTimerOn=false;
  function updateOrbTime(){
    var host=document.getElementById('home-screen'); if(!host||!host.classList.contains('active')) return;
    var bk=getBooking();
    if(bk){ var p=host.querySelector('.nh-orb p'); if(p) p.textContent=(bk.active?remainTxt(bk.e):startTxt(bk.s)); }
    var act=getActive();
    if(act){ var rm=host.querySelector('.nh-active .nh-rm'); if(rm) rm.textContent=remainTxt(act.e); }
  }

  function styleSplash(){
    var sc=document.querySelector('#splash-screen .splash-center');
    if(sc && !sc.querySelector('.nh-splash-mk')){
      var o=document.createElement('div'); o.className='nh-splash-mk'; o.innerHTML=wardSvg('');
      sc.insertBefore(o, sc.firstChild);
    }
  }
  function styleEvent(){
    var ev=document.getElementById('event-screen');
    if(ev && !ev.querySelector('.nh-ev-back')){
      var b=document.createElement('button'); b.type='button'; b.className='nh-ev-back'; b.innerHTML='‹ 뒤로';
      b.onclick=function(){ go('home-screen'); };
      ev.appendChild(b);
    }
  }

  function tabbar(){
    if(document.getElementById('nh-nav')) return;
    var TABS=[
      {l:'홈', i:'nh-home', id:'home-screen'},
      {l:'예약하기', i:'nh-pinnav', id:'rental-screen'},
      {l:'이용내역', i:'nh-listnav', id:'usage-history-screen'},
      {l:'내정보', i:'nh-user', id:'mypage-screen'}
    ];
    var nav=document.createElement('nav'); nav.id='nh-nav';
    nav.innerHTML='<div class="nh-nav-in">'+TABS.map(function(t){
      return '<button class="nh-nav-it'+(t.id==='home-screen'?' on':'')+'" data-tab="'+t.id+'">'+ic(t.i)+'<span>'+t.l+'</span></button>';
    }).join('')+'</div>';
    document.body.appendChild(nav);
    nav.querySelectorAll('[data-tab]').forEach(function(b){ b.onclick=function(){ go(b.getAttribute('data-tab')); }; });
    function sync(){ var home=document.getElementById('home-screen'); nav.style.display=(home && home.classList.contains('active'))?'block':'none'; }
    sync();
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){ new MutationObserver(sync).observe(home,{attributes:true,attributeFilter:['class']}); }
  }

  function boot(){
    injectCss(); styleSplash(); styleEvent();
    render(); tabbar();
    /* 홈 진입 render 는 아래 클래스 옵저버(557)가 담당 → goTo 래퍼에서 중복 호출 제거(이중 재그리기=깜빡임·렉 방지) */
    if(has('goTo')){ var _g=window.goTo; window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='event-screen') setTimeout(styleEvent,30); return r; }; }
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){ new MutationObserver(function(){ if(home.classList.contains('active')) render(); }).observe(home,{attributes:true,attributeFilter:['class']}); }
    [600,1600,3200].forEach(function(t){ setTimeout(render,t); });
    /* ★ 앱 켜자마자 예약차량 즉시 반영: 예약 데이터가 늦게 로딩되면 뜨는 즉시 한 번 재렌더 */
    var _bkSeen=false, _bkT=setInterval(function(){ try{
      if(_bkSeen){ clearInterval(_bkT); return; }
      if(getBooking()){ _bkSeen=true; clearInterval(_bkT); updateHero(); }
    }catch(e){} }, 600);
    setTimeout(function(){ try{ clearInterval(_bkT); }catch(e){} }, 30000);
    setInterval(function(){ var h=document.getElementById('home-screen'); if(h && h.classList.contains('active') && getActive()) render(); }, 60000);
    /* 남은시간 텍스트만 갱신(재렌더 없음) */
    if(!_otTimerOn){ _otTimerOn=true; setInterval(updateOrbTime, 30000); }
    console.log('[디자인] ✅ 홈 리디자인 v28 (light_P1)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 컨트롤러 v14 + 이모지 v2 + 계정관리·뒤로가기 THE BLACK
   · 홈 하단 플로팅 바 → "차량 제어" → 전체화면 페이지 (아래→위 슬라이드)
   · 버튼 재배치: [문열림|문잠금] / 차량이용(비상등|사진|주차) /
     예약관리(연장|예약내용|사고신고) / [반납 전체폭]
   · 이모지 → 통일 라인 SVG 아이콘. 기존 함수·게이팅 그대로.
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var st=document.createElement('style');
  st.textContent=`
    #home-ctrl-switch{display:none!important;}

    /* 홈 하단 플로팅 바 */
    #caro-rental-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(72px + var(--sab));
      width:calc(100% - 32px);max-width:448px;z-index:480;display:flex;align-items:center;gap:10px;
      padding:7px 8px 7px 10px;background:rgba(248,250,252,.97);border:1px solid var(--border-l);border-radius:16px;
      box-shadow:0 6px 22px -8px rgba(20,22,28,.28);}
    .crb-img{width:62px;height:38px;object-fit:cover;border-radius:10px;background:var(--silver-light);flex-shrink:0;}
    .crb-info{flex:1;min-width:0;}
    .crb-name{font-size:.85rem;font-weight:700;color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;letter-spacing:-.01em;}
    .crb-status{font-size:.65rem;color:var(--text-m);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
    .crb-status b{color:#1d7a3a;font-weight:700;}
    .crb-btn{flex-shrink:0;background:var(--accent);color:#fff;border:none;border-radius:11px;padding:10px 15px;font-size:.84rem;font-weight:700;cursor:pointer;font-family:inherit;}
    .crb-btn:active{opacity:.9;}

    /* === 컨트롤러 = 전체화면 페이지 (원래 아래→위 슬라이드 사용) === */
    #home-ctrl-modal{align-items:stretch!important;justify-content:center!important;}
    #home-ctrl-modal.open{background:#eef1f5!important;}
    #home-ctrl-modal .home-ctrl-box{max-width:none!important;width:100%!important;height:100%!important;
      max-height:none!important;min-height:100vh!important;border-radius:0!important;background:#f0f3f7!important;
      display:flex!important;flex-direction:column!important;overflow-y:auto!important;
      padding-bottom:calc(8px + var(--sab))!important;}
    #home-ctrl-modal .ctrl-close-bar{display:none!important;}

    .caro-ctrl-head{display:flex;align-items:center;gap:4px;padding:calc(8px + var(--sat)) 8px 8px;
      position:sticky;top:0;background:#f0f3f7;z-index:3;border-bottom:1px solid var(--border-l);}
    .caro-ctrl-back{width:40px;height:40px;border:none;background:none;font-size:2rem;line-height:1;
      cursor:pointer;color:var(--text-1);display:flex;align-items:center;justify-content:center;padding:0 0 4px;font-family:inherit;}
    .caro-ctrl-title{font-size:1.1rem;font-weight:800;color:var(--text-1);letter-spacing:-.01em;}

    .caro-ctrl-page-img{display:block;width:auto;max-width:300px;max-height:168px;margin:6px auto 6px;object-fit:contain;}

    .caro-ctrl-fuel{margin:6px 16px 2px;}
    .caro-ctrl-fuel .cf-top{display:flex;justify-content:space-between;align-items:center;font-size:.72rem;color:var(--text-m);margin-bottom:4px;}
    .caro-ctrl-fuel .cf-pct{font-weight:800;font-size:.86rem;}
    .caro-ctrl-fuel .cf-track{height:10px;background:rgba(150,156,168,.22);border-radius:14px;overflow:hidden;}
    .caro-ctrl-fuel .cf-fill{height:100%;border-radius:14px;transition:width .5s;}

    #home-ctrl-modal #home-ctrl-timer{font-size:1.05rem!important;font-weight:800!important;}

    /* 버튼 영역 정리 */
    #home-ctrl-modal .ctrl-btn-wrap{padding:6px 16px calc(20px + var(--sab))!important;gap:0!important;
      display:flex!important;flex-direction:column!important;align-items:stretch!important;}
    .caro-sec-label{font-size:.72rem;font-weight:700;color:var(--text-m);margin:16px 2px 9px;letter-spacing:.02em;}
    .caro-row-2,.caro-row-3,.caro-row-1{display:flex;gap:9px;width:100%;}
    .caro-row-3{gap:8px;}
    .caro-row-2 .ctrl-sq-btn,.caro-row-3 .ctrl-sq-btn,.caro-row-1 .ctrl-sq-btn{flex:1;}
    .caro-row-1{margin-top:14px;}

    /* 통일 버튼 카드 */
    #home-ctrl-modal .ctrl-sq-btn{background:#fff!important;border:1px solid var(--border-l)!important;
      box-shadow:0 1px 2px rgba(20,22,28,.05)!important;border-radius:16px!important;padding:15px 8px!important;
      display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;
      width:auto!important;}
    .caro-row-2 .ctrl-sq-btn{padding:18px 8px!important;}
    #home-ctrl-modal .ctrl-sq-btn:disabled{opacity:.4!important;}
    #home-ctrl-modal .ctrl-sq-icon{font-size:0!important;line-height:0;margin-bottom:5px!important;color:var(--accent-2);width:auto;height:auto;transform:translateY(3px);}
    #home-ctrl-modal .ctrl-sq-icon svg{width:26px;height:26px;display:block;}
    #home-ctrl-modal .ctrl-sq-label{font-size:.8rem!important;margin-top:0!important;font-weight:600!important;color:var(--text-1)!important;}

    /* 반납 전체폭 강조 */
    #home-ctrl-modal #ctrl-btn-return{flex-direction:column!important;gap:0!important;background:var(--accent)!important;
      border-color:var(--accent)!important;padding:15px 8px!important;box-shadow:0 4px 12px -4px rgba(20,22,28,.4)!important;}
    #home-ctrl-modal #ctrl-btn-return .ctrl-sq-icon{display:none!important;}
    #home-ctrl-modal #ctrl-btn-return .ctrl-sq-label{color:#fff!important;font-size:.8rem!important;font-weight:700!important;}

    .caro-ctrl-modal-img{display:none!important;}

    /* 사진 뱃지 빈값 숨김 (선 제거) */
    #home-ctrl-modal .ctrl-sq-badge:empty{display:none!important;}
    #home-ctrl-modal .ctrl-sq-badge{top:6px;right:6px;}

    /* 주행전 사진 시트: 반화면 + 좌우 2칸 그리드 + 라인 아이콘 */
    #photo-modal-overlay .photo-modal-box{max-height:none!important;height:56vh!important;display:flex!important;flex-direction:column!important;}
    #photo-modal-overlay .photo-modal-title{font-size:1rem!important;}
    #photo-modal-overlay .photo-notice{text-align:center!important;font-size:.7rem!important;}
    #photo-modal-overlay .photo-list-wrap{display:grid!important;grid-template-columns:1fr 1fr!important;gap:9px!important;padding:2px!important;flex:1!important;min-height:0!important;overflow-y:auto!important;align-content:start!important;}
    #photo-modal-overlay .photo-list-item{flex-direction:column!important;align-items:center!important;justify-content:center!important;text-align:center!important;gap:5px!important;padding:16px 8px!important;border-radius:14px!important;background:#fff!important;border:1px solid var(--border-l)!important;}
    #photo-modal-overlay .photo-list-misc{grid-column:1 / -1!important;}
    #photo-modal-overlay .photo-list-left{flex-direction:column!important;align-items:center!important;gap:3px!important;}
    #photo-modal-overlay .photo-list-right{flex-direction:column!important;align-items:center!important;gap:0!important;}
    #photo-modal-overlay .photo-list-arrow{display:none!important;}
    #photo-modal-overlay .caro-ph-icon{color:var(--accent-2);display:flex;justify-content:center;}
    #photo-modal-overlay .caro-ph-icon svg{width:30px!important;height:30px!important;}
    #photo-modal-overlay .photo-list-name{font-size:.9rem!important;font-weight:700!important;}
    #photo-modal-overlay .photo-list-sub{font-size:.66rem!important;color:var(--text-m)!important;}
    #photo-modal-overlay .photo-list-count{font-size:.74rem!important;font-weight:700!important;color:var(--text-m)!important;}
    #photo-modal-overlay .photo-done-btn{display:flex!important;align-items:center!important;justify-content:center!important;gap:8px!important;flex-shrink:0!important;}
    #photo-modal-overlay .photo-done-btn svg{width:20px!important;height:20px!important;}
  `;
  document.head.appendChild(st);

  /* ── 라인 아이콘 (24x24, currentColor) ── */
  function svg(inner){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>'; }
  var ICON={
    unlock: svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
    lock:   svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    hazard: svg('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    camera: svg('<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
    pin:    svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    clock:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    ret:    svg('<polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/>'),
    doc:    svg('<rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/>'),
    alert:  svg('<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    up:     svg('<polyline points="18 15 12 9 6 15"/>'),
    down:   svg('<polyline points="6 9 12 15 18 9"/>'),
    cleft:  svg('<polyline points="15 18 9 12 15 6"/>'),
    cright: svg('<polyline points="9 18 15 12 9 6"/>'),
    plus:   svg('<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
    check:  svg('<polyline points="20 6 9 17 4 12"/>'),
    key:    svg('<circle cx="7.8" cy="15.5" r="3.6"/><path d="M10.3 13 19 4.3"/><path d="m15.6 7.7 2.3 2.3"/><path d="m17.8 5.5 2.4 2.4"/>')
  };

  function asDate(x){ return x instanceof Date ? x : new Date(x); }
  function getActiveRes(){
    var rs=window.myReservations||[]; var now=Date.now(); var active=null, activeS=null;
    rs.forEach(function(r){
      if(!r||r.returned||!r.start||!r.end) return;
      var s=asDate(r.start).getTime(), e=asDate(r.end).getTime();
      if(isNaN(s)||isNaN(e)) return;
      var rActive=now>=s&&now<=e;
      if(!active){ active=r; activeS=s; return; }
      var prevActive=now>=asDate(active.start).getTime()&&now<=asDate(active.end).getTime();
      if(rActive&&!prevActive){ active=r; activeS=s; }
      else if(!rActive&&!prevActive&&s<activeS){ active=r; activeS=s; }
    });
    return active;
  }
  function fmtRange(s,e){
    s=asDate(s); e=asDate(e);
    if(isNaN(s)||isNaN(e)) return '';
    var p=function(n){return n<10?'0'+n:n;};
    return (s.getMonth()+1)+'/'+p(s.getDate())+' '+p(s.getHours())+':'+p(s.getMinutes())+' ~ '+(e.getMonth()+1)+'/'+p(e.getDate())+' '+p(e.getHours())+':'+p(e.getMinutes());
  }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  /* ── 홈 하단 플로팅 바 ── */
  function syncBar(){
    var home=document.getElementById('home-screen');
    var homeActive=home && home.classList.contains('active');
    var body=document.querySelector('#home-screen .home-body');
    var bar=document.getElementById('caro-rental-bar');
    var res=getActiveRes();
    if(!res || !homeActive){
      if(bar) bar.style.display='none';
      if(body) body.style.paddingBottom='';
      return;
    }
    if(!bar){ bar=document.createElement('div'); bar.id='caro-rental-bar'; document.body.appendChild(bar); }
    bar.style.display='flex';
    if(body) body.style.paddingBottom='130px';
    var car=res.car||{};
    var name=(window.getCarName?getCarName(car):(car.name||'내 차량'));
    var img=car.img||car.image||'';
    var num=car.carNumber||car.plate||'';
    var on=(Date.now()>=asDate(res.start).getTime() && Date.now()<=asDate(res.end).getTime());
    var statusTxt=(on?'<b>이용 중</b>':'이용 예정');
    var time=fmtRange(res.start,res.end);
    var sig=name+'|'+num+'|'+on+'|'+time+'|'+(img?img.slice(0,24):'');
    if(bar.dataset.sig===sig) return;
    bar.dataset.sig=sig;
    bar.innerHTML=
      (img?'<img class="crb-img" src="'+esc(img)+'" alt="">':'<div class="crb-img"></div>')
      +'<div class="crb-info"><div class="crb-name">'+esc(name)+(num?' · '+esc(num):'')+'</div>'
      +'<div class="crb-status">'+statusTxt+(time?' · '+esc(time):'')+'</div></div>'
      +'<button class="crb-btn" onclick="if(window.openHomeCtrl)openHomeCtrl()">차량 제어</button>';
  }

  /* ── 컨트롤러 페이지 보강 ── */
  function fuelOf(car){
    if(!car) return null;
    var id=car.id;
    /* 실기기(IoT)가 보고한 실제 연료값이 있으면 최우선 사용 (0%도 유효) */
    if(window.fuelLevels && id!=null && window.fuelLevels[id]!=null && isFinite(window.fuelLevels[id])){
      return Math.max(0,Math.min(100,Math.round(window.fuelLevels[id])));
    }
    var pct=(window.getFuelLevel?getFuelLevel(id):0);
    if(!pct){ pct=Math.floor(Math.random()*60)+20; try{ if(window.fuelLevels&&id!=null) fuelLevels[id]=pct; }catch(e){} }
    return pct;
  }
  function injectHeader(){
    var box=document.querySelector('#home-ctrl-modal .home-ctrl-box'); if(!box) return;
    if(box.querySelector('.caro-ctrl-head')) return;
    var h=document.createElement('div'); h.className='caro-ctrl-head';
    var back=document.createElement('button'); back.className='caro-ctrl-back'; back.innerHTML='&#8249;';
    back.onclick=function(){ if(window.closeHomeCtrlDirect)closeHomeCtrlDirect(); };
    var t=document.createElement('div'); t.className='caro-ctrl-title'; t.textContent='차량 제어';
    h.appendChild(back); h.appendChild(t);
    box.insertBefore(h, box.firstChild);
  }
  function injectImg(){
    var sec=document.querySelector('#home-ctrl-modal .ctrl-info-section'); if(!sec) return;
    var res=getActiveRes(); var src=(res&&res.car)?(res.car.img||res.car.image||''):'';
    var img=document.getElementById('caro-ctrl-page-img');
    if(src){
      if(!img){ img=document.createElement('img'); img.id='caro-ctrl-page-img'; img.className='caro-ctrl-page-img'; sec.parentNode.insertBefore(img, sec); }
      img.src=src; img.style.display='block';
    } else if(img){ img.style.display='none'; }
  }
  function injectFuel(){
    var sec=document.querySelector('#home-ctrl-modal .ctrl-info-section'); if(!sec) return;
    var res=getActiveRes(); var car=res&&res.car; if(!car) return;
    var pct=fuelOf(car); if(!pct){ return; }
    var isEV=(car.fuel==='전기'||car.fuel==='EV'||car.fuel==='ev');
    var label=isEV?'배터리':'연료';
    var color=pct>60?'#2c7a52':pct>30?'#57616d':'#b0413f';
    var el=document.getElementById('caro-ctrl-fuel');
    if(!el){ el=document.createElement('div'); el.id='caro-ctrl-fuel'; el.className='caro-ctrl-fuel'; sec.parentNode.insertBefore(el, sec.nextSibling); }
    el.innerHTML='<div class="cf-top"><span>'+label+'</span><span class="cf-pct" style="color:'+color+'">'+pct+'%</span></div>'
      +'<div class="cf-track"><div class="cf-fill" style="width:'+pct+'%;background:'+color+'"></div></div>';
  }

  function mkBtn(label,id){
    var b=document.createElement('button'); b.className='ctrl-sq-btn'; if(id)b.id=id;
    b.innerHTML='<span class="ctrl-sq-icon"></span><span class="ctrl-sq-label">'+label+'</span>';
    return b;
  }
  function setIcons(){
    var map={
      'ctrl-btn-unlock':[ICON.unlock,'#1d7a3a'],
      'ctrl-btn-lock':[ICON.lock,''],
      'ctrl-btn-hazard':[ICON.hazard,'#b07800'],
      'ctrl-photo-toggle':[ICON.camera,''],
      'ctrl-btn-locate':[ICON.pin,''],
      'ctrl-btn-extend':[ICON.clock,''],
      'ctrl-btn-return':['',''],
      'caro-btn-acc':[ICON.alert,'#b23a3a']
    };
    Object.keys(map).forEach(function(id){
      var b=document.getElementById(id); if(!b) return;
      var ic=b.querySelector('.ctrl-sq-icon'); if(!ic) return;
      ic.innerHTML=map[id][0];
      if(map[id][1]) ic.style.color=map[id][1];
    });
  }
  function rearrange(){
    var wrap=document.querySelector('#home-ctrl-modal .ctrl-btn-wrap'); if(!wrap) return;
    if(wrap.dataset.caroArranged){ setIcons(); return; }
    var byId=function(id){return document.getElementById(id);};
    var unlock=byId('ctrl-btn-unlock'), lock=byId('ctrl-btn-lock'),
        hazard=byId('ctrl-btn-hazard'), photo=byId('ctrl-photo-toggle'), locate=byId('ctrl-btn-locate'),
        ext=byId('ctrl-btn-extend'), ret=byId('ctrl-btn-return');
    if(!unlock||!lock||!ret){ return; }
    var accBtn=mkBtn('사고 신고','caro-btn-acc');
    accBtn.onclick=function(){ if(window.showToast)showToast('사고 신고가 접수되었습니다. 고객센터에서 연락드립니다.'); else alert('사고 신고가 접수되었습니다.'); };
    var mkRow=function(cls,kids){ var r=document.createElement('div'); r.className=cls; kids.forEach(function(k){ if(k) r.appendChild(k); }); return r; };
    var mkLab=function(t){ var l=document.createElement('div'); l.className='caro-sec-label'; l.textContent=t; return l; };
    wrap.innerHTML='';
    wrap.appendChild(mkRow('caro-row-2',[unlock,lock]));
    wrap.appendChild(mkLab('차량 이용'));
    wrap.appendChild(mkRow('caro-row-3',[hazard,photo,locate]));
    wrap.appendChild(mkLab('예약 관리'));
    wrap.appendChild(mkRow('caro-row-3',[ext,ret,accBtn]));
    wrap.dataset.caroArranged='1';
    setIcons();
  }
  function enhanceCtrlPage(){
    try{ injectHeader(); }catch(e){}
    try{ injectImg(); }catch(e){}
    try{ injectFuel(); }catch(e){}
    try{ rearrange(); }catch(e){}
  }
  /* IoT 기기가 연료값을 보고하면 즉시 게이지 갱신 (script.js에서 호출) */
  window.caroRefreshFuel=function(){ try{ injectFuel(); }catch(e){} };
  function enhancePhotoSheet(){
    var box=document.querySelector('#photo-modal-overlay .photo-modal-box'); if(!box) return;
    if(box.dataset.caroPhoto){ return; }
    box.dataset.caroPhoto='1';
    var t=box.querySelector('.photo-modal-title'); if(t) t.textContent='주행전 사진 촬영';
    var d=box.querySelector('.photo-done-btn'); if(d){ d.innerHTML=ICON.check+'<span>촬영 완료</span>'; }
    var pm={front:ICON.up,rear:ICON.down,left:ICON.cleft,right:ICON.cright,misc:ICON.plus};
    var items=box.querySelectorAll('.photo-list-item');
    Array.prototype.forEach.call(items,function(it){
      var oc=it.getAttribute('onclick')||''; var m=oc.match(/openSideCapture\('(\w+)'\)/); var key=m?m[1]:'';
      var left=it.querySelector('.photo-list-left'); if(!left||left.querySelector('.caro-ph-icon')) return;
      var ic=document.createElement('span'); ic.className='caro-ph-icon'; ic.innerHTML=pm[key]||ICON.camera;
      left.insertBefore(ic,left.firstChild);
    });
  }

  function boot(){
    syncBar();
    setInterval(syncBar, 3000);
    var home=document.getElementById('home-screen');
    if(home && window.MutationObserver){ new MutationObserver(function(){ syncBar(); }).observe(home,{attributes:true,attributeFilter:['class']}); }
    if(typeof window.openHomeCtrl==='function'){
      var _o=window.openHomeCtrl;
      window.openHomeCtrl=function(){ var r; try{ r=_o.apply(this,arguments); }catch(e){} setTimeout(enhanceCtrlPage,0); return r; };
    }
    /* 주행전 사진 시트: 열릴 때 그리드/아이콘 보정 + 컨트롤 페이지 위로 */
    if(typeof window.openPhotoModal==='function'){
      var _op=window.openPhotoModal;
      window.openPhotoModal=function(){ var r; try{ r=_op.apply(this,arguments); }catch(e){} setTimeout(enhancePhotoSheet,0); return r; };
      window.toggleCtrlPhoto=function(){ try{ window.openPhotoModal(); }catch(e){} };
    }
    ['renderMyReservations','showHomeCtrlSwitch'].forEach(function(name){
      if(typeof window[name]==='function'){
        var orig=window[name];
        window[name]=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){} try{ syncBar(); }catch(e){} return r; };
      }
    });
    console.log('[컨트롤러] ✅ v10 (사진 시트 그리드 + 라인 아이콘)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 이모지 정리 v2
   · 앱 전체 화면의 옛날 이모지 → 통일 라인 아이콘(또는 제거)
   · 컨트롤러/홈 아이콘과 동일한 선 스타일. 화살표(←→)·국기·◆ 등은 보존
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function svg(inner){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+inner+'</svg>'; }
  var I={
    car:    svg('<path d="M4 13l1.7-4.4A2.5 2.5 0 018 7h8a2.5 2.5 0 012.3 1.6L20 13"/><path d="M3.5 13h17v4.2a.8.8 0 01-.8.8H18a2 2 0 01-4 0h-4a2 2 0 01-4 0H4.3a.8.8 0 01-.8-.8V13z"/><circle cx="7.6" cy="15" r="1.05"/><circle cx="16.4" cy="15" r="1.05"/>'),
    pin:    svg('<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
    resv:   svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/><path d="M8.4 14.2l2.2 2.2L15 12"/>'),
    cal:    svg('<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 9.5h17M8 3.5v3M16 3.5v3"/>'),
    gift:   svg('<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v7.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V12"/><line x1="12" y1="8" x2="12" y2="20.5"/><path d="M12 8s-1-3.5-3.2-3.5A2 2 0 0 0 8.8 8.5H12zm0 0s1-3.5 3.2-3.5A2 2 0 0 1 15.2 8.5H12z"/>'),
    mega:   svg('<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15 8a5 5 0 0 1 0 8"/>'),
    card:   svg('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><line x1="2.5" y1="10" x2="21.5" y2="10"/>'),
    phone:  svg('<rect x="6.5" y="2.5" width="11" height="19" rx="2.5"/><line x1="10.5" y1="18.5" x2="13.5" y2="18.5"/>'),
    hazard: svg('<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>'),
    alert:  svg('<polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'),
    check:  svg('<circle cx="12" cy="12" r="9"/><polyline points="8.5 12.5 11 15 16 9.5"/>'),
    lock:   svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
    unlock: svg('<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
    clock:  svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    bolt:   svg('<polygon points="13 2 4 14 11 14 10 22 20 9 13 9"/>'),
    shield: svg('<path d="M12 2.5 4.5 6v6c0 4.5 3.2 7.8 7.5 9.5 4.3-1.7 7.5-5 7.5-9.5V6z"/>'),
    road:   svg('<path d="M6 21 8 3M18 21 16 3"/><path d="M12 5v2M12 11v2M12 17v2"/>'),
    star:   svg('<polygon points="12 3 14.6 8.6 20.5 9.3 16 13.3 17.3 19.2 12 16.1 6.7 19.2 8 13.3 3.5 9.3 9.4 8.6"/>'),
    user:   svg('<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6"/>'),
    gear:   svg('<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19"/>'),
    headset:svg('<path d="M5 13v-1a7 7 0 0 1 14 0v1"/><rect x="3" y="13" width="4" height="6" rx="1.5"/><rect x="17" y="13" width="4" height="6" rx="1.5"/>'),
    logout: svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>'),
    refresh:svg('<path d="M21 12a9 9 0 1 1-2.6-6.3"/><polyline points="21 4 21 9 16 9"/>')
  };
  // 이모지 → 아이콘 (선 스타일로 교체)
  var MAP={
    '\u{1F697}':I.car,'\u{1F698}':I.car,'\u{1F699}':I.car,'\u{1F695}':I.car,
    '\u{1F4CD}':I.pin,'\u{1F4CB}':I.resv,'\u{1F4C5}':I.cal,'\u{1F4C6}':I.cal,
    '\u{1F389}':I.gift,'\u{1F38A}':I.gift,'\u{1F4E2}':I.mega,'\u{1F4E3}':I.mega,
    '\u{1F4B3}':I.card,'\u{1F4F1}':I.phone,
    '\u26A0':I.hazard,'\u{1F6A8}':I.alert,'\u2705':I.check,'\u2714':I.check,
    '\u{1F512}':I.lock,'\u{1F513}':I.unlock,'\u23F1':I.clock,'\u23F0':I.clock,'\u{1F551}':I.clock,
    '\u26A1':I.bolt,'\u{1F6E1}':I.shield,'\u{1F6E3}':I.road,'\u2B50':I.star,
    '\u{1F464}':I.user,'\u2699':I.gear,'\u{1F3A7}':I.headset,'\u{1F6AA}':I.logout,'\u{1F504}':I.refresh
  };
  // 제거만 (장식용 이모지)
  var DROP={'\u{1F44B}':1,'\u{1F3AF}':1,'\u{1F7E2}':1,'\u{1F535}':1,'\u{1F527}':1,'\u{1F4A1}':1,'\u{1F4E1}':1,'\u{1F4E8}':1,'\u{1F4CC}':1};

  function base(ch){ return ch.replace(/[\uFE0F\u200D]/g,''); }
  var keys=Object.keys(MAP).concat(Object.keys(DROP));
  var reSrc=keys.map(function(k){ return k.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'); }).join('|');
  var EMRE=new RegExp('(?:'+reSrc+')\\uFE0F?','gu');

  function iconSpan(html){ var s=document.createElement('span'); s.className='caro-ei'; s.innerHTML=html; return s; }

  function processText(node){
    var txt=node.nodeValue; if(!txt) return;
    EMRE.lastIndex=0; if(!EMRE.test(txt)) return;
    EMRE.lastIndex=0;
    var frag=document.createDocumentFragment(), last=0, m;
    while((m=EMRE.exec(txt))){
      if(m.index>last) frag.appendChild(document.createTextNode(txt.slice(last,m.index)));
      var bc=base(m[0]);
      if(MAP[bc]) frag.appendChild(iconSpan(MAP[bc]));   // 제거(DROP)면 아무것도 안 넣음
      last=m.index+m[0].length;
    }
    if(last<txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
    if(node.parentNode) node.parentNode.replaceChild(frag,node);
  }

  var SKIP={SCRIPT:1,STYLE:1,NOSCRIPT:1,INPUT:1,TEXTAREA:1,SELECT:1,OPTION:1,svg:1,SVG:1};
  function walk(root){
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
      var p=n.parentNode; if(!p||!p.nodeName) return NodeFilter.FILTER_REJECT;
      if(SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
      if(p.closest&&p.closest('.caro-ei,svg')) return NodeFilter.FILTER_REJECT;
      if(p.isContentEditable) return NodeFilter.FILTER_REJECT;
      var v=n.nodeValue; if(!v||v.length>3000) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    var arr=[],n; while((n=w.nextNode())) arr.push(n);
    arr.forEach(processText);
  }
  function stripOptions(){
    var ops=document.querySelectorAll('option');
    Array.prototype.forEach.call(ops,function(op){
      var t=op.textContent, nt=t.replace(EMRE,'').replace(/\s{2,}/g,' ').trim();
      if(nt!==t) op.textContent=nt;
    });
  }
  function sweep(){ try{ walk(document.body); }catch(e){} try{ stripOptions(); }catch(e){} }

  var st=document.createElement('style');
  st.textContent='.caro-ei{display:inline-flex;align-items:center;justify-content:center;width:1em;height:1em;vertical-align:-.15em;}'
    +'.caro-ei svg{width:100%;height:100%;display:block;}';
  (document.head||document.documentElement).appendChild(st);

  function boot(){
    sweep();   /* \uCD5C\uCD08 1\uD68C\uB9CC \uC804\uCCB4 \uD6D1\uAE30 */
    if(window.MutationObserver){
      /* \u2605 \uB809 \uAC1C\uC120: body \uBCC0\uD654\uB9C8\uB2E4 '\uC804\uCCB4'\uB97C \uD6D1\uB358 \uAC83 \u2192 \uCD94\uAC00\uB41C \uB178\uB4DC\uB9CC \uD6D1\uAE30(\uC99D\uBD84 \uCC98\uB9AC) */
      var queue=[], pend=false, sawEl=false;
      new MutationObserver(function(muts){
        for(var i=0;i<muts.length;i++){
          var mu=muts[i];
          if(mu.type==='childList'){
            for(var j=0;j<mu.addedNodes.length;j++){ queue.push(mu.addedNodes[j]); sawEl=true; }
          }
        }
        if(pend) return; pend=true;
        requestAnimationFrame(function(){
          pend=false; var q=queue; queue=[]; var hadEl=sawEl; sawEl=false;
          for(var k=0;k<q.length;k++){ var n=q[k];
            try{ if(n.nodeType===1) walk(n); else if(n.nodeType===3) processText(n); }catch(e){}
          }
          if(hadEl){ try{ stripOptions(); }catch(e){} }
        });
      }).observe(document.body,{childList:true,subtree:true});
    }
    console.log('[\uB514\uC790\uC778] \u2705 \uC774\uBAA8\uC9C0 \uC815\uB9AC v2 (\uC99D\uBD84 \uCC98\uB9AC \uB809 \uAC1C\uC120)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 계정관리 카드화 + 뒤로가기 THE BLACK v1
   · #mypage-screen(계정관리): 가장자리 리스트 → 라운드 화이트 카드
   · 프로그램 전체 뒤로가기 버튼 → CARO THE BLACK(다크 차콜 + 골드)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var st=document.createElement('style');
  st.textContent=
    /* 계정관리: 라이트 배경 + 라운드 화이트 카드 */
    '#mypage-screen{background:#f0f3f7!important;}'
   +'#mypage-screen .metal-bg{display:none!important;}'
   +'#mypage-screen .mpn-profile{margin:0 16px 16px!important;padding:18px 18px 20px!important;border-radius:18px!important;border:1px solid var(--border-l)!important;background:#fff!important;box-shadow:0 2px 10px rgba(20,22,28,.05)!important;}'
   +'#mypage-screen .mpn-section{margin-bottom:14px!important;}'
   +'#mypage-screen .mpn-section-label{padding:2px 22px 8px!important;}'
   +'#mypage-screen .mpn-group{margin:0 16px!important;border-radius:16px!important;border:1px solid var(--border-l)!important;background:#fff!important;overflow:hidden!important;box-shadow:0 1px 4px rgba(20,22,28,.04)!important;}'
   +'#mypage-screen .mpn-item{border-bottom:1px solid var(--border-l)!important;}'
   +'#mypage-screen .mpn-item-last{border-bottom:none!important;}'
    /* 모든 뒤로가기 버튼 → CARO THE BLACK (다크 차콜 + 골드) */
   +'.back-bottom-btn,.mpn-back-btn,.mpd-back-btn{background:linear-gradient(135deg,#20232b,#14151a)!important;border:1px solid rgba(255,255,255,.16)!important;color:#fff!important;}'
   +'.back-bottom-btn:hover,.mpn-back-btn:hover,.mpd-back-btn:hover{border-color:rgba(255,255,255,.34)!important;color:#fff!important;}'
    /* 블랙라벨 화면은 이미 다크 배경 → 골드 테두리만 유지(겹침 방지) */
   +'#black-label-screen .back-bottom-btn,.bl-mode .back-bottom-btn{background:transparent!important;border-color:rgba(255,255,255,.22)!important;color:#fff!important;}';
  (document.head||document.documentElement).appendChild(st);
  console.log('[\uB514\uC790\uC778] \u2705 \uACC4\uC815\uAD00\uB9AC \uCE74\uB4DC\uD654 + \uB4A4\uB85C\uAC00\uAE30 THE BLACK v1');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 로그인 전 화면 리디자인 v1
   · 스플래시 / 메인(로그인버튼) / 로그인 / 아이디·비번찾기 / 회원가입
   · 실버 텍스처 배경 → 클린 라이트, 폼/카드 화이트, 1차 버튼 THE BLACK 다크
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var st=document.createElement('style');
  st.textContent=
    /* 배경: 실버 텍스처 → 클린 라이트 그라데이션 */
    '#splash-screen,#main-screen,#login-screen,#find-screen,#signup-screen{background:linear-gradient(180deg,#f5f7fa,#e9edf2)!important;}'
   +'#splash-screen .metal-bg,#main-screen .metal-bg,#login-screen .metal-bg,#find-screen .metal-bg,#signup-screen .metal-bg{display:none!important;}'
    /* 스플래시 로고 — 골드 라인 포인트 */
   +'#splash-screen .logo-text{color:#1a1c20!important;letter-spacing:.2em!important;text-shadow:none!important;}'
   +'#splash-screen .logo-line{background:linear-gradient(90deg,transparent,rgba(198,164,104,.55),transparent)!important;}'
   +'#splash-screen .logo-sub{color:#8a8f99!important;letter-spacing:.3em!important;}'
   +'#splash-screen .splash-footer{color:#a3a8b1!important;}'
    /* 메인: 로고/버튼/푸터 */
   +'#main-screen .main-brand-logo{color:#1a1c20!important;}'
   +'#main-screen .main-brand-sub{color:#9398a1!important;}'
   +'#main-screen .main-btn{background:#fff!important;border:1px solid rgba(200,208,218,.7)!important;color:#1a1c20!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 1px 4px rgba(20,22,28,.05)!important;border-radius:14px!important;}'
   +'#main-screen .main-btn:hover{background:#f4f6f9!important;border-color:rgba(160,168,180,.85)!important;}'
   +'#main-screen .main-footer{color:#a3a8b1!important;}'
    /* 1차 버튼(로그인 메인 + 각 폼 제출) → THE BLACK 다크 */
   +'#main-screen .main-btn.primary,#login-screen .submit-btn,#find-screen .submit-btn,#signup-screen .submit-btn{background:linear-gradient(135deg,#20232b,#14151a)!important;color:#fff!important;border:none!important;border-radius:14px!important;box-shadow:0 6px 18px -6px rgba(20,22,28,.5)!important;}'
   +'#main-screen .main-btn.primary:hover{filter:brightness(1.12)!important;}'
    /* 폼 카드 화이트 */
   +'#login-screen .form-container,#find-screen .form-container,#signup-screen .form-container{background:#fff!important;border:1px solid rgba(200,208,218,.6)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:0 6px 22px -8px rgba(20,22,28,.12)!important;border-radius:18px!important;}'
    /* 입력칸 화이트 */
   +'#login-screen .form-input,#find-screen .form-input,#signup-screen .form-input{background:#fff!important;border:1px solid rgba(200,208,218,.8)!important;box-shadow:none!important;border-radius:11px!important;}'
   +'#login-screen .form-input:focus,#find-screen .form-input:focus,#signup-screen .form-input:focus{border-color:#20232b!important;box-shadow:0 0 0 3px rgba(20,22,28,.08)!important;}'
   +'#login-screen .input-label,#find-screen .input-label,#signup-screen .input-label{color:#5a5e66!important;}'
   +'#login-screen .login-heading{color:#1a1c20!important;}'
    /* ── 로그인 화면 간격 대칭 정리 (일정한 세로 리듬) ── */
   +'#login-screen .login-form.form-container{padding:24px 20px!important;}'
   +'#login-screen .input-group{margin-bottom:16px!important;}'
   +'#login-screen .form-options{display:flex!important;gap:20px!important;margin:6px 0 20px!important;}'
   +'#login-screen .submit-btn{margin:0!important;}'
   +'#login-screen .divider{margin:20px 0!important;}'
   +'#login-screen .social-btns{margin:0 0 20px!important;}'
   +'#login-screen .form-links{margin:0 0 16px!important;}'
   +'#login-screen .back-bottom-btn{margin:0!important;}';
  (document.head||document.documentElement).appendChild(st);
  console.log('[\uB514\uC790\uC778] \u2705 \uB85C\uADF8\uC778 \uC804 \uD654\uBA74 \uB9AC\uB514\uC790\uC778 v1');
})();


/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 월 렌트 v3 (예약 플로우) + 이벤트 배너 스와이프
   · 차량 탭 → 예약 화면: 이미지/차량명/기간(1·3·6·9·12개월, 월금액+할인)
     /대여시작일(슬라이드 달력)/운전자나이(만21·만26)/면책보험(좌우선택)
     /선택 요약/다음
   · 기간별 월금액·할인은 car.monthlyPlans (관리자만 입력)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function won(n){ try{ return Number(n).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  var PERIODS=[1,3,6,9,12];
  /* 면책 보험 (현행 자동차손해배상보장법 기준 · 월 단위) */
  var INS=[
    {name:'일반면책', deduct:'자기부담금 30만원', desc:'대인 무한·대물 1억·자차 포함', price:70000},
    {name:'기본',     deduct:'자기부담금 70만원', desc:'대인 무한·대물 2천만 책임보험', price:30000}
  ];

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    /* 리스트 오버레이 */
    '#caro-mr-ov,#caro-mrd-ov{position:fixed;inset:0;z-index:950;background:#f0f3f7;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1);visibility:hidden;}'
   +'#caro-mr-ov.open,#caro-mrd-ov.open{transform:translateY(0);visibility:visible;}'
   +'#caro-mrd-ov{z-index:960;}'
   +'.caro-mr-head{display:flex;align-items:center;gap:6px;padding:calc(10px + var(--sat,0px)) 10px 10px;background:#f0f3f7;border-bottom:1px solid var(--border-l);position:sticky;top:0;z-index:2;}'
   +'.caro-mr-back{width:40px;height:40px;border:none;background:none;font-size:1.7rem;line-height:1;color:#18191c;cursor:pointer;display:flex;align-items:center;justify-content:center;font-family:inherit;}'
   +'.caro-mr-backbtm{position:fixed;left:16px;right:16px;bottom:calc(16px + var(--sab,0px));height:52px;border:0;background:var(--accent,#18191c);border-radius:14px;font-family:inherit;font-weight:800;font-size:14px;color:#fff;cursor:pointer;z-index:6;box-shadow:0 8px 20px -8px rgba(24,25,28,.5);}'
   +'.caro-mr-title{font-size:1.15rem;font-weight:800;color:#18191c;letter-spacing:-.01em;}'
   +'.caro-mr-body{flex:1;overflow-y:auto;padding:14px 16px calc(88px + var(--sab,0px));}'
   +'.caro-mr-note{font-size:.8rem;color:var(--text-m);line-height:1.5;margin:2px 2px 14px;}'
   +'.caro-mr-card{background:#fff;border:1px solid var(--border-l);border-radius:16px;margin-bottom:10px;box-shadow:0 1px 4px rgba(20,22,28,.04);overflow:hidden;}'
   +'.caro-mr-row{display:flex;align-items:center;gap:12px;padding:13px 14px;cursor:pointer;}'
   +'.caro-mr-thumb{width:74px;height:50px;object-fit:contain;border-radius:11px;background:#eef1f5;flex-shrink:0;}'
   +'.caro-mr-left{flex:1;min-width:0;}'
   +'.caro-mr-cname{font-size:.94rem;font-weight:700;color:#18191c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
   +'.caro-mr-grade{display:inline-block;font-size:.64rem;font-weight:700;padding:1px 8px;border-radius:20px;border:1px solid var(--border-l);color:var(--text-m);margin-left:6px;vertical-align:middle;}'
   +'.caro-mr-grade.bl{color:#c6a468;border-color:rgba(198,164,104,.45);}'
   +'.caro-mr-from{font-size:.82rem;font-weight:700;color:#18191c;margin-top:3px;}'
   +'.caro-mr-from .ask{color:#b07800;font-weight:700;}'
   +'.caro-mr-chev{font-size:1.35rem;color:var(--text-m);flex-shrink:0;line-height:1;}'
   +'.caro-mr-empty{text-align:center;color:var(--text-m);font-size:.9rem;padding:50px 0;}'
   /* 상세(예약) */
   +'.mrd-img{display:block;width:auto;max-width:78%;max-height:170px;margin:8px auto 4px;object-fit:contain;}'
   +'.mrd-name{text-align:center;font-size:1.2rem;font-weight:800;color:#18191c;margin:2px 0 18px;}'
   +'.mrd-sec{margin-bottom:18px;}'
   +'.mrd-lbl{font-size:.78rem;font-weight:700;color:var(--text-2);margin:0 2px 9px;}'
   +'.mrd-periods{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;}'
   +'.mrd-per{background:#fff;border:1px solid var(--border-l);border-radius:13px;padding:11px 4px;text-align:center;cursor:pointer;transition:.15s;}'
   +'.mrd-per.on{background:#18191c;border-color:#18191c;}'
   +'.mrd-per .pm{font-size:.82rem;font-weight:800;color:#18191c;}'
   +'.mrd-per .pp{font-size:.6rem;color:var(--text-m);margin-top:4px;line-height:1.2;}'
   +'.mrd-per .pd{font-size:.56rem;color:#b07800;margin-top:2px;font-weight:700;}'
   +'.mrd-per.on .pm{color:#fff;}.mrd-per.on .pp{color:rgba(255,255,255,.7);}.mrd-per.on .pd{color:#e8c98a;}'
   +'.mrd-drop{background:#fff;border:1px solid var(--border-l);border-radius:13px;padding:14px 15px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;font-size:.9rem;color:#18191c;font-weight:600;}'
   +'.mrd-drop .v{color:var(--text-m);font-weight:600;}'
   +'.mrd-drop .v.set{color:#18191c;font-weight:700;}'
   +'.mrd-panel{max-height:0;overflow:hidden;transition:max-height .3s ease;background:#fff;border-radius:13px;margin-top:8px;}'
   +'.mrd-panel.open{max-height:420px;border:1px solid var(--border-l);}'
   +'.mrd-panin{padding:12px;}'
   /* 나이 옵션 */
   +'.mrd-ages{display:flex;gap:8px;}'
   +'.mrd-age{flex:1;text-align:center;padding:12px;border:1px solid var(--border-l);border-radius:11px;cursor:pointer;font-size:.88rem;font-weight:600;color:#18191c;background:#fff;}'
   +'.mrd-age.on{background:#18191c;color:#fff;border-color:#18191c;}'
   /* 달력 */
   +'.cal-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;}'
   +'.cal-ttl{font-size:.9rem;font-weight:700;color:#18191c;}'
   +'.cal-nav{width:30px;height:30px;border:none;background:#eef1f5;border-radius:8px;font-size:1.1rem;color:#18191c;cursor:pointer;}'
   +'.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;}'
   +'.cal-dow{text-align:center;font-size:.66rem;color:var(--text-m);padding:4px 0;}'
   +'.cal-day{aspect-ratio:1;border:none;background:none;border-radius:8px;font-size:.82rem;color:#18191c;cursor:pointer;font-family:inherit;}'
   +'.cal-day:hover{background:#eef1f5;}.cal-day.sel{background:#18191c;color:#fff;font-weight:700;}'
   +'.cal-day.dis{color:#c8ccd2;cursor:default;}'
   /* 면책 보험 캐러셀 */
   +'.mrd-ins{display:flex;align-items:stretch;gap:8px;}'
   +'.mrd-insnav{width:38px;flex-shrink:0;border:1px solid var(--border-l);background:#fff;border-radius:11px;font-size:1.3rem;color:#18191c;cursor:pointer;}'
   +'.mrd-inscard{flex:1;background:#fff;border:1px solid var(--border-l);border-radius:13px;padding:14px;text-align:center;cursor:pointer;transition:.15s;}'
   +'.mrd-inscard.on{border-color:#18191c;box-shadow:0 0 0 2px rgba(24,25,28,.12);}'
   +'.mrd-insname{font-size:.96rem;font-weight:800;color:#18191c;}'
   +'.mrd-insded{font-size:.74rem;color:var(--text-m);margin-top:3px;}'
   +'.mrd-insdesc{font-size:.68rem;color:var(--text-m);margin-top:5px;line-height:1.4;}'
   +'.mrd-insprice{font-size:.9rem;font-weight:800;color:#18191c;margin-top:8px;}'
   +'.mrd-inssel{font-size:.7rem;color:#1d7a3a;font-weight:700;margin-top:6px;}'
   /* 요약 + 다음 */
   +'.mrd-sum{background:#fff;border:1px solid var(--border-l);border-radius:14px;padding:15px;margin:6px 0 14px;}'
   +'.mrd-sumrow{display:flex;justify-content:space-between;font-size:.85rem;padding:5px 0;color:var(--text-2);}'
   +'.mrd-sumrow b{color:#18191c;font-weight:700;}'
   +'.mrd-sumtot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-l);margin-top:8px;padding-top:11px;}'
   +'.mrd-sumtot span{font-size:.82rem;color:var(--text-2);}.mrd-sumtot b{font-size:1.25rem;font-weight:800;color:#18191c;}'
   +'.mrd-summo{text-align:right;font-size:.72rem;color:var(--text-m);margin-top:6px;}'
   +'.mrd-mo{font-size:.7rem;font-weight:600;color:var(--text-m);}'
   +'.mrd-next{width:100%;background:linear-gradient(135deg,#20232b,#14151a);color:#fff;border:none;border-radius:14px;padding:16px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;}'
   +'.mrd-next:disabled{opacity:.4;}'
   +'#slide-dots .slide-dot{cursor:pointer;}';
  (document.head||document.documentElement).appendChild(st);

  /* ── 리스트 오버레이 ── */
  function buildList(){
    var ov=document.createElement('div'); ov.id='caro-mr-ov';
    ov.innerHTML='<div class="caro-mr-head"><span class="caro-mr-title">월 렌트</span></div>'
      +'<div class="caro-mr-body"><div class="caro-mr-note">차량을 선택해 기간·보험을 정하고 월 렌트를 신청하세요.</div><div id="caro-mr-list"></div></div>'
      +'<button class="caro-mr-backbtm" type="button">← 뒤로</button>';
    ov.querySelector('.caro-mr-backbtm').addEventListener('click',function(){ ov.classList.remove('open'); });
    return ov;
  }
  function planFrom(c){ var pl=(c.monthlyPlans||{})['1']; if(pl&&pl.price>0){ var d=pl.discount||0; return Math.round(pl.price*(100-d)/100); } return null; }
  function renderList(){
    var list=document.getElementById('caro-mr-list'); if(!list) return;
    var all=[]; (window.BL_CARS||[]).forEach(function(c){ all.push({c:c,bl:true}); }); (window.CARS_DATA||[]).forEach(function(c){ all.push({c:c,bl:false}); });
    if(!all.length){ list.innerHTML='<div class="caro-mr-empty">등록된 차량이 없습니다.</div>'; return; }
    list.innerHTML=all.map(function(o,idx){
      var c=o.c||{}; var nm=esc(c.name||'차량');
      var grade=o.bl?'<span class="caro-mr-grade bl">THE BLACK</span>':'<span class="caro-mr-grade">일반</span>';
      var p=planFrom(c);
      var from = p? '<div class="caro-mr-from">월 '+won(p)+'원~</div>' : '<div class="caro-mr-from"><span class="ask">요금 문의</span></div>';
      var img=c.img?'<img class="caro-mr-thumb" src="'+c.img+'" onerror="this.style.visibility=\'hidden\'"/>':'<div class="caro-mr-thumb"></div>';
      return '<div class="caro-mr-card"><div class="caro-mr-row" data-idx="'+idx+'" data-bl="'+(o.bl?1:0)+'">'+img
        +'<div class="caro-mr-left"><div class="caro-mr-cname">'+nm+grade+'</div>'+from+'</div>'
        +'<span class="caro-mr-chev">\u203A</span></div></div>';
    }).join('');
    list.querySelectorAll('.caro-mr-row').forEach(function(row){
      row.addEventListener('click',function(){
        var bl=row.getAttribute('data-bl')==='1'; var arr=bl?(window.BL_CARS||[]):(window.CARS_DATA||[]);
        var i=+row.getAttribute('data-idx');
        var realIdx = bl ? i : i-(window.BL_CARS||[]).length;
        var car = arr[realIdx]; if(car) openDetail(car,bl);
      });
    });
  }
  function openMonthly(){
    if(window.loadCarsData){ try{ window.loadCarsData(); }catch(e){} }
    var ov=document.getElementById('caro-mr-ov'); if(!ov){ ov=buildList(); document.body.appendChild(ov); }
    renderList();
    ov.classList.remove('open');
    void ov.offsetHeight;   /* 초기 위치(아래) 강제 반영 → 항상 아래에서 슬라이드업 */
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('open'); }); });
  }
  window.openMonthly=openMonthly;
  window.closeMonthly=function(){ var o=document.getElementById('caro-mr-ov'); if(o)o.classList.remove('open'); };

  /* ── 상세(예약) ── */
  var ST={car:null,bl:false,period:null,start:null,age:null,ins:null,calY:0,calM:0};
  function priceFor(p){ var pl=(ST.car.monthlyPlans||{})[String(p)]; if(!pl||!(pl.price>0)) return null; var d=pl.discount||0; return {base:pl.price,disc:d,final:Math.round(pl.price*(100-d)/100)}; }

  function buildDetail(){
    var ov=document.createElement('div'); ov.id='caro-mrd-ov';
    ov.innerHTML='<div class="caro-mr-head"><span class="caro-mr-title">월 렌트 신청</span></div>'
      +'<div class="caro-mr-body">'
      +'<img class="mrd-img" id="mrdImg" alt=""/>'
      +'<div class="mrd-name" id="mrdName"></div>'
      +'<div class="mrd-sec"><div class="mrd-lbl">렌트 기간</div><div class="mrd-periods" id="mrdPeriods"></div></div>'
      +'<div class="mrd-sec"><div class="mrd-lbl">대여 시작일</div>'
        +'<div class="mrd-drop" id="mrdDateDrop"><span>날짜 선택</span><span class="v" id="mrdDateV">선택 안 됨</span></div>'
        +'<div class="mrd-panel" id="mrdCalPanel"><div class="mrd-panin" id="mrdCal"></div></div></div>'
      +'<div class="mrd-sec"><div class="mrd-lbl">운전자 나이</div>'
        +'<div class="mrd-drop" id="mrdAgeDrop"><span>나이 선택</span><span class="v" id="mrdAgeV">선택 안 됨</span></div>'
        +'<div class="mrd-panel" id="mrdAgePanel"><div class="mrd-panin"><div class="mrd-ages">'
          +'<div class="mrd-age" data-age="21">만 21세</div><div class="mrd-age" data-age="26">만 26세</div></div></div></div></div>'
      +'<div class="mrd-sec"><div class="mrd-lbl">차량손해 면책 상품</div>'
        +'<div class="mrd-ins"><button class="mrd-insnav" id="mrdInsPrev">\u2039</button>'
          +'<div class="mrd-inscard" id="mrdInsCard"></div>'
          +'<button class="mrd-insnav" id="mrdInsNext">\u203A</button></div></div>'
      +'<div class="mrd-sum" id="mrdSum"></div>'
      +'<button class="mrd-next" id="mrdNext">다음</button>'
      +'</div>'
      +'<button class="caro-mr-backbtm" type="button">← 뒤로</button>';
    document.body.appendChild(ov);
    ov.querySelector('.caro-mr-backbtm').addEventListener('click',function(){ ov.classList.remove('open'); });
    ov.querySelector('#mrdDateDrop').addEventListener('click',function(){ togglePanel('mrdCalPanel'); });
    ov.querySelector('#mrdAgeDrop').addEventListener('click',function(){ togglePanel('mrdAgePanel'); });
    ov.querySelectorAll('.mrd-age').forEach(function(a){ a.addEventListener('click',function(){ ST.age=+a.getAttribute('data-age'); renderDetail(); togglePanel('mrdAgePanel',false); }); });
    ov.querySelector('#mrdInsPrev').addEventListener('click',function(){ ST.insView=(ST.insView+INS.length-1)%INS.length; renderIns(); });
    ov.querySelector('#mrdInsNext').addEventListener('click',function(){ ST.insView=(ST.insView+1)%INS.length; renderIns(); });
    ov.querySelector('#mrdInsCard').addEventListener('click',function(){ ST.ins=ST.insView; renderIns(); renderSum(); });
    ov.querySelector('#mrdNext').addEventListener('click',onNext);
    return ov;
  }
  function togglePanel(id,force){
    var p=document.getElementById(id); if(!p) return;
    var open = force==null ? !p.classList.contains('open') : force;
    ['mrdCalPanel','mrdAgePanel'].forEach(function(x){ var e=document.getElementById(x); if(e&&x!==id) e.classList.remove('open'); });
    p.classList.toggle('open',open);
  }
  function renderPeriods(){
    var wrap=document.getElementById('mrdPeriods'); if(!wrap) return;
    wrap.innerHTML=PERIODS.map(function(p){
      var pr=priceFor(p); var on=ST.period===p;
      var pp = pr? '월 '+won(pr.final)+'원' : '문의';
      var pd = (pr&&pr.disc>0)? pr.disc+'% 할인' : '';
      return '<div class="mrd-per'+(on?' on':'')+'" data-p="'+p+'"><div class="pm">'+p+'개월</div><div class="pp">'+pp+'</div><div class="pd">'+pd+'</div></div>';
    }).join('');
    wrap.querySelectorAll('.mrd-per').forEach(function(el){ el.addEventListener('click',function(){ ST.period=+el.getAttribute('data-p'); renderPeriods(); renderSum(); }); });
  }
  function renderCal(){
    var box=document.getElementById('mrdCal'); if(!box) return;
    var y=ST.calY, m=ST.calM, first=new Date(y,m,1), startDow=first.getDay(), days=new Date(y,m+1,0).getDate();
    var today=new Date(); today.setHours(0,0,0,0);
    var h='<div class="cal-hd"><button class="cal-nav" data-d="-1">\u2039</button><span class="cal-ttl">'+y+'년 '+(m+1)+'월</span><button class="cal-nav" data-d="1">\u203A</button></div><div class="cal-grid">';
    ['일','월','화','수','목','금','토'].forEach(function(d){ h+='<div class="cal-dow">'+d+'</div>'; });
    for(var i=0;i<startDow;i++) h+='<div></div>';
    for(var dd=1;dd<=days;dd++){
      var date=new Date(y,m,dd); var dis=date<today;
      var sel=ST.start&&ST.start.getFullYear()===y&&ST.start.getMonth()===m&&ST.start.getDate()===dd;
      h+='<button class="cal-day'+(sel?' sel':'')+(dis?' dis':'')+'" '+(dis?'disabled':'data-day="'+dd+'"')+'>'+dd+'</button>';
    }
    h+='</div>'; box.innerHTML=h;
    box.querySelectorAll('.cal-nav').forEach(function(b){ b.addEventListener('click',function(){ var d=+b.getAttribute('data-d'); ST.calM+=d; if(ST.calM<0){ST.calM=11;ST.calY--;} if(ST.calM>11){ST.calM=0;ST.calY++;} renderCal(); }); });
    box.querySelectorAll('.cal-day[data-day]').forEach(function(b){ b.addEventListener('click',function(){ ST.start=new Date(ST.calY,ST.calM,+b.getAttribute('data-day')); renderCal(); renderDetail(); togglePanel('mrdCalPanel',false); }); });
  }
  function renderIns(){
    var card=document.getElementById('mrdInsCard'); if(!card) return;
    var v=INS[ST.insView]; var selected=ST.ins===ST.insView;
    card.className='mrd-inscard'+(selected?' on':'');
    card.innerHTML='<div class="mrd-insname">'+esc(v.name)+'</div><div class="mrd-insded">'+esc(v.deduct)+'</div>'
      +'<div class="mrd-insdesc">'+esc(v.desc)+'</div><div class="mrd-insprice">월 '+won(v.price)+'원</div>'
      +'<div class="mrd-inssel">'+(selected?'\u2713 선택됨':'탭하여 선택')+'</div>';
  }
  function renderSum(){
    var box=document.getElementById('mrdSum'); if(!box) return;
    var pr=ST.period!=null?priceFor(ST.period):null;
    var insM=ST.ins!=null?INS[ST.ins].price:null;
    var mo='<span class="mrd-mo"> (월기준)</span>';
    var r1L=ST.period!=null?(ST.period+'개월'):'렌트 기간';
    var r1R=(ST.period==null)?'—':(pr?won(pr.final)+'원'+mo:'문의');
    var r2L=ST.ins!=null?esc(INS[ST.ins].name):'차량손해 면책 상품';
    var r2R=(insM==null)?'—':won(insM)+'원'+mo;
    var tot=(pr&&insM!=null)?(pr.final+insM):null;
    box.innerHTML=
      '<div class="mrd-sumrow"><span>'+r1L+'</span><b>'+r1R+'</b></div>'
     +'<div class="mrd-sumrow"><span>'+r2L+'</span><b>'+r2R+'</b></div>'
     +'<div class="mrd-sumtot"><span>총 비용</span><b>'+(tot!=null?won(tot)+'원'+mo:'—')+'</b></div>';
    var nx=document.getElementById('mrdNext'); if(nx) nx.disabled = !(ST.period!=null && pr && ST.start && ST.age!=null && ST.ins!=null);
  }
  function renderDetail(){
    document.getElementById('mrdImg').src=ST.car.img||'';
    document.getElementById('mrdImg').style.visibility=ST.car.img?'visible':'hidden';
    document.getElementById('mrdName').textContent=ST.car.name||'차량';
    var dv=document.getElementById('mrdDateV');
    if(ST.start){ dv.textContent=(ST.start.getMonth()+1)+'월 '+ST.start.getDate()+'일'; dv.classList.add('set'); } else { dv.textContent='선택 안 됨'; dv.classList.remove('set'); }
    var av=document.getElementById('mrdAgeV');
    if(ST.age!=null){ av.textContent='만 '+ST.age+'세'; av.classList.add('set'); } else { av.textContent='선택 안 됨'; av.classList.remove('set'); }
    document.querySelectorAll('.mrd-age').forEach(function(a){ a.classList.toggle('on',+a.getAttribute('data-age')===ST.age); });
    renderPeriods(); renderCal(); renderIns(); renderSum();
  }
  function openDetail(car,bl){
    var ov=document.getElementById('caro-mrd-ov'); if(!ov){ ov=buildDetail(); }
    var now=new Date();
    ST={car:car,bl:bl,period:null,start:null,age:null,ins:null,insView:0,calY:now.getFullYear(),calM:now.getMonth()};
    renderDetail();
    ov.classList.remove('open');
    void ov.offsetHeight;
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ ov.classList.add('open'); var b=ov.querySelector('.caro-mr-body'); if(b) b.scrollTop=0; }); });
  }
  function onNext(){
    if(ST.period==null||!ST.start||ST.age==null||ST.ins==null){ if(window.showToast)showToast('모든 항목을 선택해 주세요'); return; }
    var pr=priceFor(ST.period); var insP=INS[ST.ins].price; var tot=((pr?pr.final:0)+insP)*ST.period;
    var msg=ST.car.name+' · '+ST.period+'개월 · '+(ST.start.getMonth()+1)+'/'+ST.start.getDate()+' 시작 · 만'+ST.age+'세 · '+INS[ST.ins].name+' · 합계 '+won(tot)+'원';
    if(window.showToast) showToast('신청 정보 확인: '+msg); else alert(msg);
    /* 다음 단계(결제 등) 연결 지점 */
  }

  /* ── 이벤트 배너 수동 스와이프 ── */
  function curIdx(){ var i=0; document.querySelectorAll('#slide-dots .slide-dot').forEach(function(d,k){ if(d.classList.contains('active')) i=k; }); return i; }
  function total(){ return document.querySelectorAll('.auto-slide-item').length||4; }
  function go(dir){ if(!window.moveSlide) return; var t=total(); window.moveSlide(((curIdx()+dir)%t+t)%t); }
  function attachSwipe(){
    var wrap=document.getElementById('auto-slide-wrap-home');
    if(!wrap || wrap.dataset.caroSwipe) return; wrap.dataset.caroSwipe='1';
    var sx=0,sy=0,down=false,moved=false,justSwiped=false;
    function s(x,y){ down=true;moved=false;sx=x;sy=y; } function m(x,y){ if(!down)return; if(Math.abs(x-sx)>12 && Math.abs(x-sx)>Math.abs(y-sy)) moved=true; }
    function e(x){ if(!down)return; down=false; if(moved){ go((x-sx)<0?1:-1); justSwiped=true; setTimeout(function(){justSwiped=false;},360); } }
    wrap.addEventListener('touchstart',function(ev){ s(ev.touches[0].clientX,ev.touches[0].clientY); },{passive:true});
    wrap.addEventListener('touchmove', function(ev){ m(ev.touches[0].clientX,ev.touches[0].clientY); },{passive:true});
    wrap.addEventListener('touchend',  function(ev){ e(ev.changedTouches[0].clientX); },{passive:true});
    wrap.addEventListener('mousedown', function(ev){ s(ev.clientX,ev.clientY); });
    wrap.addEventListener('mousemove', function(ev){ m(ev.clientX,ev.clientY); });
    wrap.addEventListener('mouseup',   function(ev){ e(ev.clientX); });
    wrap.addEventListener('mouseleave',function(){ down=false; });
    wrap.addEventListener('click',function(ev){ if(justSwiped){ ev.stopImmediatePropagation(); ev.preventDefault(); } },true);
    document.querySelectorAll('#slide-dots .slide-dot').forEach(function(d,i){ if(d.dataset.caroDot) return; d.dataset.caroDot='1'; d.addEventListener('click',function(ev){ ev.stopPropagation(); if(window.moveSlide) window.moveSlide(i); }); });
  }
  function boot(){ attachSwipe(); var tr=0; var iv=setInterval(function(){ attachSwipe(); if(++tr>20) clearInterval(iv); },400);
    console.log('[\uB514\uC790\uC778] \u2705 \uC6D4\uB80C\uD2B8 v3(\uC608\uC57D\uD50C\uB85C\uC6B0) + \uBC30\uB108 \uC2A4\uC640\uC774\uD504'); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 시간 연장 결제 (등록 카드 / 토스페이먼츠)
   · confirmExtendSheet 가로채기 → 결제수단 모달 → 결제 성공 시 연장 적용
   · 등록 카드: 즉시 결제 처리 후 원본 연장 로직 호출
   · 토스페이먼츠: 예약 결제와 동일한 TossPayments SDK (리다이렉트) → 복귀 시 연장 적용
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var TOSS_KEY=(window.CARO_CONFIG&&CARO_CONFIG.TOSS_CLIENT_KEY)||'test_ck_6bJXmgo28eByJonkYwBE3LAnGKWx';   /* ★ caro-config.js 에서 한 곳 관리 */
  function won(n){ try{ return Number(n).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function toast(m){ if(window.showToast) showToast(m); else alert(m); }
  function parseWon(s){ return parseInt((''+(s==null?'':s)).replace(/[^0-9]/g,''),10)||0; }

  var st=document.createElement('style');
  st.textContent=
    '#caro-extpay-ov{position:fixed;inset:0;z-index:1200;background:rgba(20,22,28,.45);display:none;align-items:flex-start;justify-content:center;}'
   +'#caro-extpay-ov.open{display:flex;}'
   +'.exp-sheet{background:#fff;width:min(440px,92%);margin-top:20vh;border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.32);animation:expIn .24s ease;}'
   +'@keyframes expIn{from{transform:translateY(18px);opacity:0;}to{transform:none;opacity:1;}}'
   +'.exp-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid var(--border-l);}'
   +'.exp-hd .t{font-size:1.05rem;font-weight:800;color:#18191c;}'
   +'.exp-x,.exp-bk{border:none;background:none;font-size:1.45rem;color:#888d98;cursor:pointer;line-height:1;width:30px;font-family:inherit;}'
   +'.exp-amt{text-align:center;padding:15px 16px;font-size:1rem;color:#18191c;border-bottom:1px solid var(--border-l);}'
   +'.exp-amt b{font-weight:800;}'
   +'.exp-body{padding:14px 16px 20px;}'
   +'.exp-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:#fff;border:1px solid var(--border-l);border-radius:14px;padding:15px;margin-bottom:11px;cursor:pointer;font-family:inherit;transition:.12s;}'
   +'.exp-opt:active{background:#f5f7fa;}'
   +'.exp-ic{width:30px;height:24px;flex-shrink:0;color:#18191c;}'
   +'.exp-tx{flex:1;min-width:0;}'
   +'.exp-opt .l1{font-size:.95rem;font-weight:700;color:#18191c;}'
   +'.exp-opt .l2{font-size:.78rem;color:var(--text-m);margin-top:2px;}'
   +'.exp-opt .arr{color:#c8ccd2;font-size:1.25rem;flex-shrink:0;}';
  (document.head||document.documentElement).appendChild(st);

  var ICON_CARD='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
  var ICON_PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><line x1="10.5" y1="18" x2="13.5" y2="18"/></svg>';

  var pending=null; /* {mins, amount, onCard} */

  function build(){
    var ov=document.createElement('div'); ov.id='caro-extpay-ov';
    ov.innerHTML='<div class="exp-sheet">'
      +'<div class="exp-hd"><button class="exp-bk" id="expBk">\u2039</button><span class="t">결제 수단</span><button class="exp-x" id="expX">\u00D7</button></div>'
      +'<div class="exp-amt" id="expAmt"></div>'
      +'<div class="exp-body">'
        +'<button class="exp-opt" id="expCard"><span class="exp-ic">'+ICON_CARD+'</span><span class="exp-tx"><div class="l1">등록된 카드로 결제</div><div class="l2" id="expCardSub"></div></span><span class="arr">\u203A</span></button>'
        +'<button class="exp-opt" id="expToss"><span class="exp-ic">'+ICON_PHONE+'</span><span class="exp-tx"><div class="l1">토스페이먼츠로 결제</div><div class="l2">카드 · 계좌 · 간편결제</div></span><span class="arr">\u203A</span></button>'
      +'</div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#expX').addEventListener('click',closeSheet);
    ov.querySelector('#expBk').addEventListener('click',closeSheet);
    ov.addEventListener('click',function(e){ if(e.target===ov) closeSheet(); });
    ov.querySelector('#expCard').addEventListener('click',payCard);
    ov.querySelector('#expToss').addEventListener('click',payToss);
    return ov;
  }
  function openSheet(mins,amount,onCard){
    pending={mins:mins,amount:amount,onCard:onCard};
    var ov=document.getElementById('caro-extpay-ov')||build();
    document.getElementById('expAmt').innerHTML=mins+'분 연장 · <b>'+won(amount)+'원</b>';
    var cards=window.savedCards||[];
    var sub=document.getElementById('expCardSub');
    if(cards.length){ var c=cards[0]; sub.textContent=(c.alias||'카드')+' ····'+(c.last4||'****'); }
    else sub.textContent='등록된 카드가 없습니다';
    requestAnimationFrame(function(){ ov.classList.add('open'); });
  }
  function closeSheet(){ var ov=document.getElementById('caro-extpay-ov'); if(ov) ov.classList.remove('open'); }

  /* 등록 카드 결제 → 즉시 처리 후 원본 연장 로직 실행 */
  function payCard(){
    var cards=window.savedCards||[];
    if(!cards.length){ toast('등록된 카드가 없습니다. 계정관리 → 결제수단에서 카드를 먼저 등록해 주세요.'); return; }
    /* ★ FIX(C9): 예전엔 실제 결제 없이 '결제 완료!'를 띄우고 연장을 적용했음(무료 연장 구멍).
         등록 카드 자동결제(빌링키)는 아직 계약 전이므로 토스 결제창으로 진행한다. */
    toast('등록 카드 자동결제는 준비 중입니다. 토스 결제로 진행합니다.');
    setTimeout(payToss, 300);
  }

  /* 토스페이먼츠 결제 (예약 결제와 동일 SDK · 리다이렉트) */
  function payToss(){
    if(!pending) return;
    var mins=pending.mins, amount=pending.amount;
    var res=(window.ctrlResIdx>=0&&window.myReservations)?window.myReservations[window.ctrlResIdx]:null;
    var bookNo=res?res.bookNo:'';
    var carName=(res&&res.car)?((window.getCarName&&getCarName(res.car))||res.car.name||'차량'):'차량';
    try{ localStorage.setItem('caro_ext_pending', JSON.stringify({bookNo:bookNo,mins:mins,amount:amount})); }catch(e){}
    if(typeof TossPayments!=='function'){ toast('토스페이먼츠를 불러오지 못했습니다.'); return; }
    try{
      var tp=TossPayments(TOSS_KEY);
      tp.requestPayment('카드',{
        amount:amount,
        orderId:'EX'+Date.now().toString().slice(-8),
        orderName:carName+' '+mins+'분 연장',
        customerName:(window.userInfo&&(userInfo.name||userInfo.id))||'고객',
        successUrl:window.location.href.split('?')[0]+'?payment=ext_success',
        failUrl:window.location.href.split('?')[0]+'?payment=ext_fail'
      }).catch(function(err){ if(err&&err.code!=='USER_CANCEL') toast('결제 오류: '+(err.message||'')); });
    }catch(e){ toast('토스페이먼츠 호출 오류'); }
  }

  /* 토스 결제 복귀 → 연장 적용 */
  function handleReturn(){
    if(window.CARO_CONFIG&&CARO_CONFIG.SECURE_SERVER) return;   /* ★ 서버 모드: 결제 복귀는 caro-secure.js 가 서버 승인 후 처리 */
    var q=new URLSearchParams(window.location.search);
    var pay=q.get('payment');
    if(pay==='ext_fail'){ try{ history.replaceState(null,'',window.location.pathname); }catch(e){} return; }
    if(pay!=='ext_success') return;
    var raw=null; try{ raw=localStorage.getItem('caro_ext_pending'); }catch(e){}
    try{ localStorage.removeItem('caro_ext_pending'); }catch(e){}
    try{ history.replaceState(null,'',window.location.pathname); }catch(e){}
    if(!raw) return;
    var info=null; try{ info=JSON.parse(raw); }catch(e){}
    if(!info) return;
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      var list=window.myReservations||[];
      var r=info.bookNo?list.filter(function(x){ return x.bookNo===info.bookNo; })[0]:list[0];
      if(r){
        clearInterval(iv);
        var endD=(r.end instanceof Date)?r.end:new Date(r.end);
        r.end=new Date(endD.getTime()+info.mins*60000);
        r.extendedMins=(r.extendedMins||0)+info.mins;
        try{ if(window.startHomeCtrlTimer && r.start) startHomeCtrlTimer(r.start,r.end); }catch(e){}
        try{ if(window.saveUserData) saveUserData(); }catch(e){}
        try{ if(window.renderMyReservations) renderMyReservations(); }catch(e){}
        var h=Math.floor(info.mins/60), m=info.mins%60;
        var lbl=(h>0&&m>0)?(h+'시간 '+m+'분'):(h>0?h+'시간':m+'분');
        toast('\u2705 '+lbl+' 연장 완료되었습니다.');
      } else if(tries>30){ clearInterval(iv); }
    },300);
  }

  function boot(){
    function hook(){
      if(typeof window.confirmExtendSheet!=='function' || window.confirmExtendSheet._caroExtPay) return false;
      var orig=window.confirmExtendSheet;
      window.confirmExtendSheet=function(){
        var mins=window.selectedExtendMins||0;
        var selEl=document.querySelector('.extend-option.selected');
        if(!mins && selEl) mins=+selEl.getAttribute('data-mins')||0;
        if(!mins){ toast('연장 시간을 선택해 주세요.'); return; }
        var amount=window._caroExtAmount||parseWon((document.getElementById('ext-conf-total')||{}).textContent);
        if(!amount && selEl){ var cc=selEl.querySelector('.ext-cost'); amount=cc?parseWon(cc.textContent):0; }
        /* 결제 모달 → 카드 결제 성공 시 원본 연장 로직 실행 */
        openSheet(mins, amount, function(){ try{ orig(); }catch(e){} });
      };
      window.confirmExtendSheet._caroExtPay=1;
      return true;
    }
    if(!hook()){ var t=0; var iv=setInterval(function(){ if(hook()||++t>40) clearInterval(iv); },300); }
    handleReturn();
    console.log('[\uC2DC\uAC04\uC5F0\uC7A5] \u2705 \uACB0\uC81C \uC5F0\uACB0 (\uB4F1\uB85D\uCE74\uB4DC / \uD1A0\uC2A4\uD398\uC774\uBA3C\uCE20)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 시간 연장 유연 선택기
   · 고정 6옵션 → 10분 단위로 원하는 만큼 한 번에 선택 (슬라이더 + 스테퍼)
   · 같은 차량의 다음 예약 시작 전까지 (없으면 최대 대여 30일까지) 연장 가능
   · 연장 시트 크기를 주행전 사진 시트와 동일하게(480px / 82vh 스크롤)
   · 확정 시 결제수단(등록카드/토스) 모달은 기존 연장결제 모듈이 처리
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function el(id){ return document.getElementById(id); }
  function fmtDur(m){
    if(m<=0) return '0분';
    var d=Math.floor(m/1440); m-=d*1440;
    var h=Math.floor(m/60); var mn=m%60;
    var s=[]; if(d)s.push(d+'일'); if(h)s.push(h+'시간'); if(mn)s.push(mn+'분');
    return s.join(' ');
  }
  function getRes(){ return (window.ctrlResIdx>=0&&window.myReservations)?window.myReservations[window.ctrlResIdx]:null; }

  var st=document.createElement('style');
  st.textContent=
    '.extend-sheet{max-width:480px !important;max-height:82vh;overflow-y:auto;}'
   +'.cx-wrap{padding:8px 16px 14px;}'
   +'.cx-max{font-size:.78rem;color:var(--text-m);text-align:center;margin-bottom:12px;line-height:1.5;}'
   +'.cx-disp{text-align:center;font-size:1.55rem;font-weight:800;color:#18191c;margin-bottom:16px;letter-spacing:-.01em;}'
   +'.cx-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:8px;}'
   +'.cx-steps.plus{margin-bottom:14px;}'
   +'.cx-step{padding:12px 4px;border:1px solid var(--border-l,#e3e7ec);border-radius:11px;background:#fff;font-size:.84rem;font-weight:700;color:#18191c;cursor:pointer;font-family:inherit;}'
   +'.cx-step:active{background:#eef1f5;}'
   +'.cx-step:disabled{opacity:.3;cursor:default;}'
   +'.cx-slider{width:100%;accent-color:#18191c;height:26px;cursor:pointer;}'
   +'.cx-none{text-align:center;color:#b23a3a;font-size:.88rem;padding:18px 8px;line-height:1.5;}';
  (document.head||document.documentElement).appendChild(st);

  var CUR={res:null,carRate:0,insRate:0,max:0,val:0};

  function computeMax(res){
    var car=res.car||{};
    var curEnd=(res.end instanceof Date)?res.end:new Date(res.end);
    var startD=(res.start instanceof Date)?res.start:new Date(res.start);
    var nextStart=null;
    var all=[].concat(window.globalActiveReservations||[], window.myReservations||[]);
    all.forEach(function(r){
      if(!r||!r.car||!r.start) return;
      if(String(r.car.id)!==String(car.id)) return;
      if(res.bookNo&&r.bookNo&&r.bookNo===res.bookNo) return;
      var s=(r.start instanceof Date)?r.start:new Date(r.start);
      if(isNaN(s.getTime())) return;
      if(s.getTime()>=curEnd.getTime()){ if(!nextStart||s.getTime()<nextStart.getTime()) nextStart=s; }
    });
    var capEnd=new Date(startD.getTime()+30*24*3600*1000); /* 최대 대여 30일 */
    var byNext = nextStart && nextStart.getTime()<capEnd.getTime();
    var limitEnd = byNext ? nextStart : capEnd;
    var max=Math.floor((limitEnd.getTime()-curEnd.getTime())/60000);
    max=Math.floor(max/10)*10; if(max<0)max=0;
    return {max:max, byNext:byNext};
  }

  function setVal(m){
    m=Math.round(m/10)*10;
    if(m<10)m=10; if(m>CUR.max)m=CUR.max;
    CUR.val=m; window.selectedExtendMins=m;
    var carCost=Math.round(CUR.carRate*(m/60)), insCost=Math.round(CUR.insRate*(m/60)), total=carCost+insCost;
    if(el('cxDisp')) el('cxDisp').textContent='+ '+fmtDur(m);
    var sl=el('cxSlider'); if(sl && +sl.value!==m) sl.value=m;
    var box=el('ext-confirm-box'); if(box) box.classList.add('show');
    var curEnd=(CUR.res.end instanceof Date)?CUR.res.end:new Date(CUR.res.end);
    var pv=new Date(curEnd.getTime()+m*60000); var p2=function(n){return n<10?'0'+n:n;};
    if(el('ext-conf-time')) el('ext-conf-time').textContent=fmtDur(m)+'  →  반납 '+(pv.getMonth()+1)+'/'+p2(pv.getDate())+' '+p2(pv.getHours())+':'+p2(pv.getMinutes());
    if(el('ext-conf-car')) el('ext-conf-car').textContent=carCost.toLocaleString()+'원';
    if(el('ext-conf-ins')) el('ext-conf-ins').textContent=insCost.toLocaleString()+'원';
    if(el('ext-conf-total')) el('ext-conf-total').textContent=total.toLocaleString()+'원';
    var steps=document.querySelectorAll('.cx-step');
    Array.prototype.forEach.call(steps,function(b){
      var d=+b.getAttribute('data-d');
      b.disabled = d<0 ? (CUR.val<=10) : (CUR.val>=CUR.max);
    });
  }

  function buildSelector(){
    var res=getRes(); if(!res) return;
    var car=res.car||{}, ins=res.ins||(window.INSURANCE&&window.INSURANCE[0])||{};
    CUR.res=res; CUR.carRate=car.pricePerHour||0; CUR.insRate=(ins&&ins.pricePerHour)||0;
    var mx=computeMax(res); CUR.max=mx.max;
    var grid=el('ext-grid'); if(!grid) return;
    grid.style.display='block';
    var ok=el('ext-ok-btn');
    if(CUR.max<10){
      grid.innerHTML='<div class="cx-none">다음 예약이 곧 시작돼<br>연장할 수 있는 시간이 없습니다.</div>';
      var box=el('ext-confirm-box'); if(box) box.classList.remove('show');
      window.selectedExtendMins=0; if(ok) ok.disabled=true;
      return;
    }
    if(ok) ok.disabled=false;
    var maxLbl = mx.byNext
      ? '다음 예약 전까지 최대 <b>'+fmtDur(CUR.max)+'</b> 연장 가능'
      : '최대 <b>'+fmtDur(CUR.max)+'</b> 연장 가능 (최대 대여 30일)';
    grid.innerHTML=
      '<div class="cx-wrap">'
      +'<div class="cx-max">'+maxLbl+'</div>'
      +'<div class="cx-disp" id="cxDisp">+ 1시간</div>'
      +'<div class="cx-steps"><button class="cx-step" data-d="-1440">−1일</button><button class="cx-step" data-d="-60">−1시간</button><button class="cx-step" data-d="-10">−10분</button></div>'
      +'<div class="cx-steps plus"><button class="cx-step" data-d="10">+10분</button><button class="cx-step" data-d="60">+1시간</button><button class="cx-step" data-d="1440">+1일</button></div>'
      +'<input type="range" id="cxSlider" class="cx-slider" min="10" max="'+CUR.max+'" step="10" value="60"/>'
      +'</div>';
    var steps=grid.querySelectorAll('.cx-step');
    Array.prototype.forEach.call(steps,function(b){
      b.addEventListener('click',function(){ setVal(CUR.val+(+b.getAttribute('data-d'))); });
    });
    var sl=el('cxSlider'); if(sl) sl.addEventListener('input',function(){ setVal(+sl.value); });
    setVal(Math.min(60,CUR.max));
  }

  function wrap(){
    if(typeof window.openExtendSheet!=='function' || window.openExtendSheet._caroFlex) return (typeof window.openExtendSheet==='function');
    var orig=window.openExtendSheet;
    window.openExtendSheet=function(){ var r; try{ r=orig.apply(this,arguments); }catch(e){} setTimeout(buildSelector,0); return r; };
    window.openExtendSheet._caroFlex=1;
    return true;
  }
  function boot(){
    if(!wrap()){ var t=0; var iv=setInterval(function(){ if(wrap()||++t>40) clearInterval(iv); },300); }
    console.log('[\uC2DC\uAC04\uC5F0\uC7A5] \u2705 \uC720\uC5F0 \uC120\uD0DD\uAE30 (\uB2E4\uC74C \uC608\uC57D\uAE4C\uC9C0)');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 홈 알림 (종 버튼 + 뱃지 + 패널 + 개별 삭제)
   · CARO MOBILITY 헤더 우측 종 버튼, 안 읽은 알림 있으면 금색 점
   · 예약 기반 자동 알림: 대여 10분 전 / 반납 30분 전 / 정상 반납 완료
   · 이벤트 알림(EVENT_DETAILS)
   · 종 누르면 패널 → 각 알림 우측 상단 X 로 삭제 (localStorage 영속)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var BELL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>';

  function uid(){ return (window.userInfo&&(userInfo.id||userInfo.uid))||'guest'; }
  function listKey(){ return 'caro_nf_'+uid(); }
  function dismKey(){ return 'caro_nfx_'+uid(); }
  function load(k){ try{ return JSON.parse(localStorage.getItem(k)||'[]'); }catch(e){ return []; } }
  function save(k,v){ try{ localStorage.setItem(k,JSON.stringify(v)); }catch(e){} }
  function getList(){ return load(listKey()); }
  function getDism(){ return load(dismKey()); }
  function fmtDT(d){ var p=function(n){return n<10?'0'+n:n;}; return (d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes()); }
  function fmtAgo(ts){ var s=Math.floor((Date.now()-ts)/1000); if(s<60)return '방금'; var m=Math.floor(s/60); if(m<60)return m+'분 전'; var h=Math.floor(m/60); if(h<24)return h+'시간 전'; return Math.floor(h/24)+'일 전'; }

  function addNotif(id,title,body,ts){
    if(getDism().indexOf(id)>=0) return;
    var list=getList(); if(list.some(function(n){return n.id===id;})) return;
    list.push({id:id,title:title,body:body,ts:ts||Date.now(),read:false});
    save(listKey(),list);
  }
  function genNotifs(){
    var now=Date.now();
    var res=window.myReservations||[];
    res.forEach(function(r){
      if(!r||!r.bookNo) return;
      var name=(window.getCarName&&r.car)?getCarName(r.car):((r.car&&r.car.name)||'차량');
      var start=r.start?((r.start instanceof Date)?r.start:new Date(r.start)):null;
      var end=r.end?((r.end instanceof Date)?r.end:new Date(r.end)):null;
      if(r.returned && r.returnedAt){
        var rt=(r.returnedAt instanceof Date)?r.returnedAt:new Date(r.returnedAt);
        if(!isNaN(rt.getTime())) addNotif('ret-'+r.bookNo, '차량이 정상 반납되었습니다', name+' · '+fmtDT(rt), rt.getTime());
      } else {
        if(start && !isNaN(start.getTime())){
          var dm=start.getTime()-now;
          if(dm>0 && dm<=10*60000) addNotif('r10-'+r.bookNo, '차량 대여 10분 전입니다', name+' · '+fmtDT(start)+' 대여 시작', now);
        }
        if(end && start && !isNaN(end.getTime()) && now>=start.getTime()){
          var em=end.getTime()-now;
          if(em>0 && em<=30*60000) addNotif('e30-'+r.bookNo, '차량 반납 30분 전입니다', name+' · '+fmtDT(end)+' 반납 예정', now);
          if(em<=0) addNotif('late-'+r.bookNo, '반납 지연 패널티 부과', name+' · 반납 예정 '+fmtDT(end)+' 경과 — 지연 패널티가 부과됩니다', end.getTime());
        }
      }
    });
    (window.EVENT_DETAILS||[]).forEach(function(e,i){
      if(!e||!e.title) return;
      addNotif('ev-'+i, '이벤트 · '+e.title, e.period?('진행 기간 · '+e.period):'진행 중인 이벤트입니다', now-1000*(i+1));
    });
    updateBadge();
  }

  function updateBadge(){
    var unread=getList().filter(function(n){return !n.read;}).length;
    var dot=document.getElementById('caro-bell-dot');
    if(dot) dot.classList.toggle('on', unread>0);
    var nd=document.querySelector('.nh-root .nh-dot');   /* 새 홈 종 버튼 골드 점 — 알림 있을 때만 */
    if(nd) nd.classList.toggle('on', unread>0);
  }

  function render(){
    var box=document.getElementById('cnf-list'); if(!box) return;
    var list=getList().slice().sort(function(a,b){return b.ts-a.ts;});
    if(!list.length){ box.innerHTML='<div class="cnf-empty">새로운 알림이 없습니다.</div>'; return; }
    box.innerHTML=list.map(function(n){
      return '<div class="cnf-item"><button class="cnf-x" data-id="'+n.id+'">\u00D7</button>'
        +'<div class="cnf-it-title">'+esc(n.title)+'</div>'
        +'<div class="cnf-it-body">'+esc(n.body||'')+'</div>'
        +'<div class="cnf-it-time">'+fmtAgo(n.ts)+'</div></div>';
    }).join('');
    box.querySelectorAll('.cnf-x').forEach(function(b){ b.addEventListener('click',function(e){ e.stopPropagation(); dismiss(b.getAttribute('data-id')); }); });
  }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function dismiss(id){
    var list=getList().filter(function(n){return n.id!==id;}); save(listKey(),list);
    var d=getDism(); if(d.indexOf(id)<0){ d.push(id); save(dismKey(),d); }
    render(); updateBadge();
  }
  function clearAll(){
    var list=getList(); var d=getDism();
    list.forEach(function(n){ if(d.indexOf(n.id)<0) d.push(n.id); });
    save(dismKey(),d); save(listKey(),[]);
    render(); updateBadge();
  }

  function buildPanel(){
    var ov=document.createElement('div'); ov.id='caro-notif-ov';
    ov.innerHTML='<div class="cnf-panel">'
      +'<div class="cnf-head"><span class="cnf-title">알림</span><div class="cnf-actions">'
        +'<button class="cnf-clear" id="cnfClear">모두 지우기</button>'
        +'<button class="cnf-close" id="cnfClose">\u00D7</button></div></div>'
      +'<div class="cnf-list" id="cnf-list"></div></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click',function(e){ if(e.target===ov) closePanel(); });
    ov.querySelector('#cnfClose').addEventListener('click',closePanel);
    ov.querySelector('#cnfClear').addEventListener('click',clearAll);
    return ov;
  }
  function openPanel(){
    genNotifs();
    var ov=document.getElementById('caro-notif-ov')||buildPanel();
    /* 열면 모두 읽음 처리 → 뱃지 제거 */
    var list=getList(); list.forEach(function(n){ n.read=true; }); save(listKey(),list);
    render(); updateBadge();
    requestAnimationFrame(function(){ ov.classList.add('open'); });
  }
  function closePanel(){ var ov=document.getElementById('caro-notif-ov'); if(ov) ov.classList.remove('open'); }

  function injectBell(){
    var hdr=document.querySelector('#home-screen .home-header');
    if(!hdr || hdr.querySelector('#caro-bell')) return;
    var btn=document.createElement('button'); btn.id='caro-bell'; btn.type='button'; btn.setAttribute('aria-label','알림');
    btn.innerHTML=BELL+'<span class="cnf-dot" id="caro-bell-dot"></span>';
    btn.addEventListener('click',openPanel);
    window.caroOpenNotif=openPanel;
    hdr.appendChild(btn);
    updateBadge();
  }

  var st=document.createElement('style');
  st.textContent=
    '#home-screen .home-header{display:flex;align-items:center;}'
   +'#caro-bell{position:relative;margin-left:auto;background:none;border:none;padding:6px;color:#18191c;cursor:pointer;display:flex;align-items:center;justify-content:center;width:38px;height:38px;font-family:inherit;}'
   +'#caro-bell svg{width:23px;height:23px;}'
   +'.cnf-dot{position:absolute;top:3px;right:3px;width:9px;height:9px;border-radius:50%;background:#c6a468;display:none;box-shadow:0 0 0 2px #e9ecf0;}'
   +'.cnf-dot.on{display:block;}'
   +'#caro-notif-ov{position:fixed;inset:0;z-index:1100;background:rgba(20,22,28,.4);display:none;}'
   +'#caro-notif-ov.open{display:block;}'
   +'.cnf-panel{position:absolute;top:0;left:0;right:0;background:#f0f3f7;border-radius:0 0 22px 22px;max-height:82vh;display:flex;flex-direction:column;box-shadow:0 14px 44px rgba(0,0,0,.22);transform:translateY(-100%);transition:transform .3s cubic-bezier(.22,1,.36,1);}'
   +'#caro-notif-ov.open .cnf-panel{transform:translateY(0);}'
   +'.cnf-head{display:flex;align-items:center;justify-content:space-between;padding:calc(15px + var(--sat,0px)) 18px 13px;}'
   +'.cnf-title{font-size:1.12rem;font-weight:800;color:#18191c;}'
   +'.cnf-actions{display:flex;align-items:center;gap:4px;}'
   +'.cnf-clear{background:none;border:none;font-size:.8rem;color:var(--text-m);cursor:pointer;font-family:inherit;padding:6px 8px;}'
   +'.cnf-close{background:none;border:none;font-size:1.5rem;color:#888d98;cursor:pointer;width:32px;line-height:1;font-family:inherit;}'
   +'.cnf-list{overflow-y:auto;padding:0 14px 18px;}'
   +'.cnf-item{background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:14px 40px 13px 15px;margin-bottom:10px;position:relative;}'
   +'.cnf-it-title{font-size:.93rem;font-weight:700;color:#18191c;letter-spacing:-.01em;}'
   +'.cnf-it-body{font-size:.8rem;color:var(--text-m);margin-top:4px;line-height:1.45;}'
   +'.cnf-it-time{font-size:.7rem;color:#b0b4bc;margin-top:7px;}'
   +'.cnf-x{position:absolute;top:9px;right:9px;width:26px;height:26px;border:none;background:none;color:#b0b4bc;font-size:1.15rem;cursor:pointer;border-radius:8px;line-height:1;font-family:inherit;}'
   +'.cnf-x:active{background:#f0f3f7;}'
   +'.cnf-empty{text-align:center;color:var(--text-m);font-size:.9rem;padding:46px 0;}';
  (document.head||document.documentElement).appendChild(st);

  function boot(){
    injectBell();
    /* 새 홈에는 .home-header가 없어 injectBell이 조기 종료 → 종 버튼 API를 무조건 노출 */
    window.caroOpenNotif=openPanel;
    window.caroSyncNotif=function(){ try{ genNotifs(); }catch(e){} };
    var tries=0; var iv=setInterval(function(){ injectBell(); genNotifs(); if(++tries>10) clearInterval(iv); },800);
    setInterval(function(){ genNotifs(); },30000);
    /* 예약 갱신 시 재생성 */
    ['renderMyReservations','showHomeCtrlSwitch','saveUserData'].forEach(function(nm){
      if(typeof window[nm]==='function' && !window[nm]._caroNotif){
        var o=window[nm];
        window[nm]=function(){ var r=o.apply(this,arguments); try{ genNotifs(); }catch(e){} return r; };
        window[nm]._caroNotif=1;
      }
    });
    /* 차량 제어 카운트다운: '반납 필요' → '반납 지연 패널티 부과' */
    function watchOverdue(){
      var el=document.getElementById('home-ctrl-timer'); if(!el) return false;
      if(el._caroOverdue) return true;
      el._caroOverdue=1;
      var fix=function(){ if((el.textContent||'').trim()==='반납 필요'){ el.textContent='반납 지연 패널티 부과'; el.style.color='#b23a3a'; el.style.fontWeight='700'; } };
      new MutationObserver(fix).observe(el,{childList:true,characterData:true,subtree:true});
      fix();
      return true;
    }
    if(!watchOverdue()){ var ot=0; var ov=setInterval(function(){ if(watchOverdue()||++ot>40) clearInterval(ov); },500); }
    /* 외부 API */
    window.caroAddNotif=function(title,body){ addNotif('m-'+Date.now(), title, body||'', Date.now()); updateBadge(); };
    console.log('[\uC54C\uB9BC] \u2705 \uC885 \uBC84\uD2BC + \uC608\uC57D/\uC774\uBCA4\uD2B8 \uC54C\uB9BC');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 주행전 사진 10분 잠금 + 반납 체크리스트
   · 주행전 사진: 대여 시작 후 10분 경과 시 촬영 마감(잠금)
   · 반납: 위치 선택(지정/다른) 대신 체크리스트(두고 내린 물건/정상 주차/파손)
     → 모두 확인 시 반납 진행(doReturnCar)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var LOCK_MIN=10;
  function toast(m){ if(window.showToast) showToast(m); else alert(m); }
  function activeRes(){ return (window.ctrlResIdx>=0&&window.myReservations)?window.myReservations[window.ctrlResIdx]:null; }

  /* ───────── 1. 주행전 사진 10분 잠금 ───────── */
  function photoLocked(){
    var res=activeRes(); if(!res) return false;
    if(res.returned) return true;
    if(!res.start) return false;
    var start=(res.start instanceof Date)?res.start:new Date(res.start);
    if(isNaN(start.getTime())) return false;
    return (Date.now()-start.getTime())>LOCK_MIN*60000;
  }
  function applyPhotoLock(){
    var box=document.querySelector('#photo-modal-overlay .photo-modal-box'); if(!box) return;
    var locked=photoLocked();
    var items=box.querySelectorAll('.photo-list-item');
    var done=box.querySelector('.photo-done-btn');
    var bn=box.querySelector('#caro-photo-lock');
    if(locked){
      Array.prototype.forEach.call(items,function(it){ it.style.pointerEvents='none'; it.style.opacity='.4'; });
      if(done){ done.disabled=true; done.style.opacity='.4'; done.style.pointerEvents='none'; }
      if(!bn){
        bn=document.createElement('div'); bn.id='caro-photo-lock'; bn.className='caro-photo-lock';
        var hdr=box.querySelector('.photo-modal-header');
        if(hdr&&hdr.parentNode) hdr.parentNode.insertBefore(bn, hdr.nextSibling); else box.insertBefore(bn, box.firstChild);
      }
      bn.innerHTML='<b>주행전 사진 촬영이 마감되었습니다.</b><br>대여 시작 후 '+LOCK_MIN+'분이 지나 더 이상 촬영할 수 없습니다.';
      bn.style.display='block';
    } else {
      Array.prototype.forEach.call(items,function(it){ it.style.pointerEvents=''; it.style.opacity=''; });
      if(done){ done.disabled=false; done.style.opacity=''; done.style.pointerEvents=''; }
      if(bn) bn.style.display='none';
    }
  }

  /* ───────── 2. 반납 체크리스트 ───────── */
  var CHECKS=[
    '차량에 두고 내린 물건이 없는지 확인했습니다',
    '차량을 지정된 장소에 정상 주차했습니다',
    '차량 외관에 새로운 파손이 없음을 확인했습니다'
  ];
  var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function buildReturn(){
    var ov=document.createElement('div'); ov.id='caro-return-ov';
    ov.innerHTML='<div class="crt-sheet">'
      +'<div class="crt-head"><span class="crt-title">반납 전 확인</span><button class="crt-x" id="crtX">\u00D7</button></div>'
      +'<div class="crt-desc">아래 항목을 모두 확인한 뒤 반납해 주세요.</div>'
      +'<div class="crt-list">'
        +CHECKS.map(function(c,i){ return '<button class="crt-item" data-i="'+i+'"><span class="crt-box">'+CHK+'</span><span class="crt-lbl">'+c+'</span></button>'; }).join('')
      +'</div>'
      +'<div class="crt-btns"><button class="crt-ok" id="crtOk" disabled>반납하기</button><button class="crt-cancel" id="crtCancel">취소</button></div>'
      +'</div>';
    document.body.appendChild(ov);
    var state=[false,false,false];
    function refresh(){
      ov.querySelectorAll('.crt-item').forEach(function(b){ b.classList.toggle('on', state[+b.getAttribute('data-i')]); });
      var ok=ov.querySelector('#crtOk'); ok.disabled = !state.every(Boolean);
    }
    ov.querySelectorAll('.crt-item').forEach(function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); state[i]=!state[i]; refresh(); }); });
    ov.querySelector('#crtX').addEventListener('click',closeReturn);
    ov.querySelector('#crtCancel').addEventListener('click',closeReturn);
    ov.addEventListener('click',function(e){ if(e.target===ov) closeReturn(); });
    ov.querySelector('#crtOk').addEventListener('click',function(){
      if(!state.every(Boolean)) return;
      closeReturn();
      setTimeout(function(){ try{ if(window.doReturnCar) doReturnCar(); else toast('반납 처리를 찾을 수 없습니다.'); }catch(e){ toast('반납 처리 오류'); } },180);
    });
    ov._reset=function(){ state=[false,false,false]; refresh(); };
    return ov;
  }
  function openReturn(){
    var ov=document.getElementById('caro-return-ov')||buildReturn();
    if(ov._reset) ov._reset();
    requestAnimationFrame(function(){ ov.classList.add('open'); });
  }
  function closeReturn(){ var ov=document.getElementById('caro-return-ov'); if(ov) ov.classList.remove('open'); }

  /* ───────── 스타일 ───────── */
  var st=document.createElement('style');
  st.textContent=
    '.caro-photo-lock{margin:12px 16px 4px;padding:13px 14px;background:rgba(178,58,58,.08);border:1px solid rgba(178,58,58,.28);border-radius:12px;color:#b23a3a;font-size:.82rem;line-height:1.5;text-align:center;}'
   +'#caro-return-ov{position:fixed;inset:0;z-index:1150;background:rgba(20,22,28,.45);display:none;align-items:flex-end;justify-content:center;}'
   +'#caro-return-ov.open{display:flex;}'
   +'.crt-sheet{background:#f0f3f7;width:100%;max-width:480px;border-radius:22px 22px 0 0;padding-bottom:calc(16px + env(safe-area-inset-bottom,0px));transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1);max-height:86vh;overflow-y:auto;}'
   +'#caro-return-ov.open .crt-sheet{transform:translateY(0);}'
   +'.crt-head{display:flex;align-items:center;justify-content:space-between;padding:18px 18px 6px;}'
   +'.crt-title{font-size:1.12rem;font-weight:800;color:#18191c;}'
   +'.crt-x{border:none;background:none;font-size:1.5rem;color:#888d98;cursor:pointer;width:32px;line-height:1;font-family:inherit;}'
   +'.crt-desc{font-size:.84rem;color:var(--text-m);padding:0 18px 14px;}'
   +'.crt-list{padding:0 16px;}'
   +'.crt-item{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:15px 14px;margin-bottom:10px;cursor:pointer;font-family:inherit;transition:.14s;}'
   +'.crt-box{width:26px;height:26px;flex-shrink:0;border-radius:8px;border:2px solid #c8ccd2;display:flex;align-items:center;justify-content:center;color:#fff;transition:.14s;}'
   +'.crt-box svg{width:16px;height:16px;opacity:0;}'
   +'.crt-item.on{border-color:#18191c;background:rgba(24,25,28,.03);}'
   +'.crt-item.on .crt-box{background:#1d7a3a;border-color:#1d7a3a;}'
   +'.crt-item.on .crt-box svg{opacity:1;}'
   +'.crt-lbl{font-size:.9rem;font-weight:600;color:#18191c;line-height:1.4;}'
   +'.crt-btns{display:flex;flex-direction:column;gap:9px;padding:8px 16px 6px;}'
   +'.crt-ok{width:100%;background:linear-gradient(135deg,#20232b,#14151a);color:#fff;border:none;border-radius:14px;padding:16px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;}'
   +'.crt-ok:disabled{opacity:.4;cursor:default;}'
   +'.crt-cancel{width:100%;background:none;border:none;color:var(--text-m);font-size:.9rem;padding:10px;cursor:pointer;font-family:inherit;}';
  (document.head||document.documentElement).appendChild(st);

  function boot(){
    /* 사진 촬영 잠금: openSideCapture 가드 */
    if(typeof window.openSideCapture==='function' && !window.openSideCapture._caroLock){
      var _os=window.openSideCapture;
      window.openSideCapture=function(){
        if(photoLocked()){ toast('대여 시작 후 '+LOCK_MIN+'분이 지나 주행전 사진 촬영이 마감되었습니다.'); return; }
        return _os.apply(this,arguments);
      };
      window.openSideCapture._caroLock=1;
    }
    /* 사진 모달 열릴 때 잠금 UI 반영 */
    if(typeof window.openPhotoModal==='function' && !window.openPhotoModal._caroLock){
      var _op=window.openPhotoModal;
      window.openPhotoModal=function(){ var r; try{ r=_op.apply(this,arguments); }catch(e){} setTimeout(applyPhotoLock,30); return r; };
      window.openPhotoModal._caroLock=1;
    }
    /* 반납: 위치 선택 → 체크리스트 */
    function hookReturn(){
      if(typeof window.openReturnParkModal!=='function' || window.openReturnParkModal._caroChk) return (typeof window.openReturnParkModal==='function');
      window.openReturnParkModal=function(){ openReturn(); };
      window.openReturnParkModal._caroChk=1;
      return true;
    }
    if(!hookReturn()){ var t=0; var iv=setInterval(function(){ if(hookReturn()||++t>40) clearInterval(iv); },300); }
    console.log('[\uBC18\uB0A9/\uC0AC\uC9C4] \u2705 \uC0AC\uC9C4 10\uBD84 \uC7A0\uAE08 + \uBC18\uB0A9 \uCCB4\uD06C\uB9AC\uC2A4\uD2B8');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 반납 화면 (풀스크린) + 정산 결제
   · 풀스크린: 반납 확인 체크리스트 / 주차(지정·다른 장소) / 정산 / 결제
   · 다른 장소 주차 시 위치 설명 + 사진 필수 입력
   · 지연 패널티: 반납시간 초과 시 10분당 10,000원 누적(실시간)
   · 반납 시 주행거리 비용 + 하이패스 비용 + 지연 패널티 = 합계 한번에 결제
     (주행거리=res.drivenKm, 하이패스=res.hipassFee — 디바이스/관리자가 채우는 값)
   · 결제: 등록 카드 / 토스페이먼츠 (예약·연장 결제와 동일 방식)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var TOSS_KEY=(window.CARO_CONFIG&&CARO_CONFIG.TOSS_CLIENT_KEY)||'test_ck_6bJXmgo28eByJonkYwBE3LAnGKWx';   /* ★ caro-config.js 에서 한 곳 관리 */
  var PENALTY_UNIT=10000, PENALTY_PER_MIN=10; /* 10분당 10,000원 */
  function won(n){ try{ return Number(n||0).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function toast(m){ if(window.showToast) showToast(m); else alert(m); }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function activeRes(){ return (window.ctrlResIdx>=0&&window.myReservations)?window.myReservations[window.ctrlResIdx]:null; }

  function calcCosts(res){
    var car=res.car||{};
    var kmRate=+car.kmRate||0, freeKm=+car.fuelFreeKm||0;
    var drivenKm=+res.drivenKm||0;
    var billKm=Math.max(0, drivenKm-freeKm);
    var distCost=Math.round(billKm*kmRate);
    var hipass=+res.hipassFee||0;
    var end=(res.end instanceof Date)?res.end:new Date(res.end);
    var overdueMin=isNaN(end.getTime())?0:Math.max(0,Math.floor((Date.now()-end.getTime())/60000));
    var penalty=Math.floor(overdueMin/PENALTY_PER_MIN)*PENALTY_UNIT;
    return {kmRate:kmRate,freeKm:freeKm,drivenKm:drivenKm,billKm:billKm,distCost:distCost,
            hipass:hipass,overdueMin:overdueMin,penalty:penalty,total:distCost+hipass+penalty};
  }
  function fmtOverdue(min){ var h=Math.floor(min/60),m=min%60; return (h>0?h+'시간 ':'')+m+'분'; }

  /* ───────── 상태 ───────── */
  var ST={res:null, checks:[false,false], park:'spot', photos:[], costs:null};

  /* ───────── 반납 화면 ───────── */
  var CHK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  var CHECKS=['차량에 두고 내린 물건이 없는지 확인했습니다','차량 외관에 새로운 파손이 없음을 확인했습니다'];

  function build(){
    var ov=document.createElement('div'); ov.id='caro-ret-ov';
    ov.innerHTML=''
      +'<div class="rt-head"><button class="rt-back" id="rtBack">\u2190</button><span class="rt-title">차량 반납</span></div>'
      +'<div class="rt-body">'
        +'<div class="rt-sec"><div class="rt-lbl">반납 확인</div><div id="rtChecks"></div></div>'
        +'<div class="rt-sec"><div class="rt-lbl">주차 위치</div>'
          +'<div class="rt-park"><button class="rt-pk" data-p="spot">지정 장소에 주차</button><button class="rt-pk" data-p="other">다른 장소에 주차</button></div>'
          +'<div class="rt-other" id="rtOther">'
            +'<textarea class="rt-desc" id="rtDesc" rows="3" placeholder="주차한 위치를 자세히 적어주세요 (예: ○○빌딩 지하 2층 B-12)"></textarea>'
            +'<button class="rt-photo" id="rtPhoto">사진 첨부 (0장)</button>'
            +'<div class="rt-photos" id="rtPhotos"></div>'
          +'</div>'
        +'</div>'
        +'<div class="rt-sec"><div class="rt-lbl">정산 내역</div><div class="rt-sum" id="rtSum"></div></div>'
      +'</div>'
      +'<div class="rt-foot"><button class="rt-submit" id="rtSubmit">반납 및 결제하기</button></div>';
    document.body.appendChild(ov);
    ov.querySelector('#rtBack').addEventListener('click',closeRet);
    ov.querySelector('#rtPhoto').addEventListener('click',addPhoto);
    ov.querySelectorAll('.rt-pk').forEach(function(b){ b.addEventListener('click',function(){ ST.park=b.getAttribute('data-p'); renderPark(); renderSubmit(); }); });
    ov.querySelector('#rtDesc').addEventListener('input',renderSubmit);
    ov.querySelector('#rtSubmit').addEventListener('click',submit);
    return ov;
  }
  function renderChecks(){
    var box=document.getElementById('rtChecks'); if(!box) return;
    box.innerHTML=CHECKS.map(function(c,i){ return '<button class="rt-item'+(ST.checks[i]?' on':'')+'" data-i="'+i+'"><span class="rt-box">'+CHK+'</span><span class="rt-itl">'+c+'</span></button>'; }).join('');
    box.querySelectorAll('.rt-item').forEach(function(b){ b.addEventListener('click',function(){ var i=+b.getAttribute('data-i'); ST.checks[i]=!ST.checks[i]; renderChecks(); renderSubmit(); }); });
  }
  function renderPark(){
    document.querySelectorAll('.rt-pk').forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-p')===ST.park); });
    var o=document.getElementById('rtOther'); if(o) o.classList.toggle('open', ST.park==='other');
  }
  function renderPhotos(){
    var box=document.getElementById('rtPhotos'); if(box) box.innerHTML=ST.photos.map(function(p){ return '<img src="'+p+'"/>'; }).join('');
    var btn=document.getElementById('rtPhoto'); if(btn) btn.textContent='사진 첨부 ('+ST.photos.length+'장)';
  }
  function addPhoto(){
    if(ST.photos.length>=5){ toast('최대 5장까지 첨부 가능합니다.'); return; }
    function got(dataUrl){ if(!dataUrl) return; ST.photos.push(dataUrl); renderPhotos(); renderSubmit(); }
    if(typeof window._openSimpleCam==='function'){ window._openSimpleCam(got); }
    else {
      var inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.capture='environment';
      inp.onchange=function(){ var f=inp.files&&inp.files[0]; if(!f)return; var r=new FileReader(); r.onload=function(){ got(r.result); }; r.readAsDataURL(f); };
      inp.click();
    }
  }
  function renderSum(){
    var box=document.getElementById('rtSum'); if(!box) return;
    var c=ST.costs;
    var rows='';
    rows+='<div class="rt-sr"><span>주행거리 비용'+(c.drivenKm?(' ('+c.billKm+'km × '+won(c.kmRate)+'원)'):'')+'</span><b>'+won(c.distCost)+'원</b></div>';
    rows+='<div class="rt-sr"><span>하이패스 사용</span><b>'+(c.hipass>0?won(c.hipass)+'원':'미사용')+'</b></div>';
    rows+='<div class="rt-sr'+(c.penalty>0?' pen':'')+'"><span>반납 지연 패널티'+(c.overdueMin>0?(' (지연 '+fmtOverdue(c.overdueMin)+' · 10분당 '+won(PENALTY_UNIT)+'원)'):'')+'</span><b>'+won(c.penalty)+'원</b></div>';
    box.innerHTML=rows+'<div class="rt-tot"><span>합계</span><b>'+won(c.total)+'원</b></div>'
      +((!c.drivenKm&&c.hipass<=0)?'<div class="rt-note">※ 주행거리·하이패스는 디바이스 측정값이 들어오면 자동 합산됩니다.</div>':'');
  }
  function parkOk(){ if(ST.park==='spot') return true; var d=document.getElementById('rtDesc'); return !!(d&&d.value.trim())&&ST.photos.length>0; }
  function renderSubmit(){
    var btn=document.getElementById('rtSubmit'); if(!btn) return;
    var ok=ST.checks.every(Boolean)&&parkOk();
    btn.disabled=!ok;
    btn.textContent = ST.costs && ST.costs.total>0 ? ('반납 및 결제하기 · '+won(ST.costs.total)+'원') : '반납하기';
  }

  function openRet(){
    var res=activeRes(); if(!res){ toast('반납할 차량 정보를 찾을 수 없습니다.'); return; }
    ST={res:res, checks:[false,false], park:'spot', photos:[], costs:calcCosts(res)};
    var ov=document.getElementById('caro-ret-ov')||build();
    renderChecks(); renderPark(); renderPhotos(); renderSum(); renderSubmit();
    requestAnimationFrame(function(){ ov.classList.add('open'); ov.querySelector('.rt-body').scrollTop=0; });
  }
  function closeRet(){ var ov=document.getElementById('caro-ret-ov'); if(ov) ov.classList.remove('open'); }

  /* 정산 결제가 안 된 금액 → 미결제(채권) 기록 (로컬 + Firestore) */
  function recordDebt(amount, res, costs){
    if(!(amount>0)) return;
    var entry=null;
    try{
      var key='caro_apd_unpaid', list=[];
      try{ list=JSON.parse(localStorage.getItem(key)||'[]'); }catch(e){ list=[]; }
      if(!Array.isArray(list)) list=[];
      var d=new Date();
      var date=d.getFullYear()+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+('0'+d.getDate()).slice(-2);
      var car=(res&&res.car)||{};
      var carName=(window.getCarName?window.getCarName(car):car.name)||'차량';
      var carNumber=car.carNumber||car.plate||car.number||'';
      var bd=costs?{distCost:+costs.distCost||0,hipass:+costs.hipass||0,penalty:+costs.penalty||0}:null;
      entry={ id:'debt_'+Date.now(), title:'차량 반납 정산 미결제 — '+carName, date:date, ts:Date.now(),
              amount:amount, bookNo:(res&&res.bookNo)||'', carNumber:carNumber, carName:carName, breakdown:bd };
      list.unshift(entry);
      localStorage.setItem(key, JSON.stringify(list));
    }catch(e){}
    /* Firestore 기록 (관제 대시보드) */
    try{ if(entry && window.caroDebtFS && window.caroDebtFS.writeDebt) window.caroDebtFS.writeDebt(entry); }catch(e){}
  }

  function submit(){
    if(!ST.checks.every(Boolean)){ toast('반납 확인 항목을 모두 체크해 주세요.'); return; }
    if(!parkOk()){ toast('다른 장소 주차 시 위치 설명과 사진(1장 이상)을 입력해 주세요.'); return; }
    if(ST.park==='other'){ try{ ST.res.altPark={desc:document.getElementById('rtDesc').value.trim(), photos:ST.photos.length, at:Date.now()}; }catch(e){} }
    var total=ST.costs.total;
    if(total>0){
      /* 등록 카드로 정산 결제 시도. 결제가 안 되면(카드 없음 등) 미결제(채권)로 넘기고
         반납은 그대로 완료한다 — 반납이 결제 때문에 막히면 안 됨 (분실물 회수 위해 10분 유예 후 차량 재사용). */
      /* ★ FIX(C9): 예전엔 '등록 카드'만 있으면 결제 없이 '결제 완료'로 처리됐음.
         서버 모드에서는 서버(completeReturn)가 정산액을 계산·청구하고, 테스트 모드에서는 미결제(채권)로 기록한다. */
      if(window.CARO_CONFIG&&CARO_CONFIG.SECURE_SERVER){
        /* 서버가 판단 — 여기서는 기록하지 않음 */
      } else {
        recordDebt(total, ST.res, ST.costs);
        toast('정산 '+won(total)+'원이 미결제 내역에 기록되었습니다. 마이페이지 › 미납 내역에서 결제해 주세요.');
      }
    }
    finish();   /* 결제 성공/실패와 무관하게 반납은 항상 완료 */
  }
  function finish(){
    closeRet(); closePay();
    setTimeout(function(){ try{ if(window.doReturnCar) doReturnCar(); else toast('반납 처리를 찾을 수 없습니다.'); }catch(e){ toast('반납 처리 오류'); } },160);
  }

  /* ───────── 정산 결제 모달 (등록카드 / 토스) ───────── */
  var ICON_CARD='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>';
  var ICON_PHONE='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="3" width="12" height="18" rx="2"/><line x1="10.5" y1="18" x2="13.5" y2="18"/></svg>';
  var payPending=null;
  function buildPay(){
    var ov=document.createElement('div'); ov.id='caro-retpay-ov';
    ov.innerHTML='<div class="rtp-sheet">'
      +'<div class="rtp-hd"><button class="rtp-bk" id="rtpBk">\u2039</button><span class="t">결제 수단</span><button class="rtp-x" id="rtpX">\u00D7</button></div>'
      +'<div class="rtp-amt" id="rtpAmt"></div>'
      +'<div class="rtp-body">'
        +'<button class="rtp-opt" id="rtpCard"><span class="rtp-ic">'+ICON_CARD+'</span><span class="rtp-tx"><div class="l1">등록된 카드로 결제</div><div class="l2" id="rtpCardSub"></div></span><span class="arr">\u203A</span></button>'
        +'<button class="rtp-opt" id="rtpToss"><span class="rtp-ic">'+ICON_PHONE+'</span><span class="rtp-tx"><div class="l1">토스페이먼츠로 결제</div><div class="l2">카드 · 계좌 · 간편결제</div></span><span class="arr">\u203A</span></button>'
      +'</div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#rtpX').addEventListener('click',closePay);
    ov.querySelector('#rtpBk').addEventListener('click',closePay);
    ov.addEventListener('click',function(e){ if(e.target===ov) closePay(); });
    ov.querySelector('#rtpCard').addEventListener('click',payCard);
    ov.querySelector('#rtpToss').addEventListener('click',payToss);
    return ov;
  }
  function openPay(amount,onCard){
    payPending={amount:amount,onCard:onCard};
    var ov=document.getElementById('caro-retpay-ov')||buildPay();
    document.getElementById('rtpAmt').innerHTML='반납 정산 · <b>'+won(amount)+'원</b>';
    var cards=window.savedCards||[]; var sub=document.getElementById('rtpCardSub');
    sub.textContent=cards.length?((cards[0].alias||'카드')+' ····'+(cards[0].last4||'****')):'등록된 카드가 없습니다';
    requestAnimationFrame(function(){ ov.classList.add('open'); });
  }
  function closePay(){ var ov=document.getElementById('caro-retpay-ov'); if(ov) ov.classList.remove('open'); }
  function payCard(){
    var cards=window.savedCards||[];
    if(!cards.length){ toast('등록된 카드가 없습니다. 계정관리 → 결제수단에서 카드를 먼저 등록해 주세요.'); return; }
    /* ★ FIX(C9): 실제 결제 없이 '결제 완료!' 처리하던 구멍 제거 — 토스 결제창으로 진행 */
    toast('등록 카드 자동결제는 준비 중입니다. 토스 결제로 진행합니다.');
    setTimeout(payToss, 300);
  }
  function payToss(){
    if(!payPending) return; var amount=payPending.amount;
    var res=ST.res||activeRes(); var bookNo=res?res.bookNo:'';
    try{ localStorage.setItem('caro_ret_pending', JSON.stringify({bookNo:bookNo,amount:amount})); }catch(e){}
    if(typeof TossPayments!=='function'){ toast('토스페이먼츠를 불러오지 못했습니다.'); return; }
    try{
      TossPayments(TOSS_KEY).requestPayment('카드',{
        amount:amount, orderId:'RT'+Date.now().toString().slice(-8), orderName:'차량 반납 정산',
        customerName:(window.userInfo&&(userInfo.name||userInfo.id))||'고객',
        successUrl:location.href.split('?')[0]+'?payment=ret_success',
        failUrl:location.href.split('?')[0]+'?payment=ret_fail'
      }).catch(function(err){ if(err&&err.code!=='USER_CANCEL') toast('결제 오류: '+(err.message||'')); });
    }catch(e){ toast('토스페이먼츠 호출 오류'); }
  }
  function handleReturn(){
    if(window.CARO_CONFIG&&CARO_CONFIG.SECURE_SERVER) return;   /* ★ 서버 모드: caro-secure.js 가 처리 */
    var q=new URLSearchParams(location.search); var pay=q.get('payment');
    if(pay==='ret_fail'){ try{ history.replaceState(null,'',location.pathname); }catch(e){} return; }
    if(pay!=='ret_success') return;
    var raw=null; try{ raw=localStorage.getItem('caro_ret_pending'); }catch(e){}
    try{ localStorage.removeItem('caro_ret_pending'); }catch(e){}
    try{ history.replaceState(null,'',location.pathname); }catch(e){}
    if(!raw) return; var info=null; try{ info=JSON.parse(raw); }catch(e){} if(!info) return;
    var tries=0; var iv=setInterval(function(){
      tries++; var list=window.myReservations||[];
      var r=info.bookNo?list.filter(function(x){return x.bookNo===info.bookNo;})[0]:null;
      if(r){ clearInterval(iv);
        r.returned=true; r.returnedAt=new Date();
        try{ if(window.saveUserData) saveUserData(); }catch(e){}
        try{ if(window.renderCars) renderCars(); if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
        try{ if(window.renderMyReservations) renderMyReservations(); }catch(e){}
        toast('반납이 완료되었습니다. 이용해 주셔서 감사합니다 \uD83D\uDE97');
      } else if(tries>30){ clearInterval(iv); }
    },300);
  }

  /* ───────── 스타일 ───────── */
  var st=document.createElement('style');
  st.textContent=
    '#caro-ret-ov{position:fixed;inset:0;z-index:1180;background:#f0f3f7;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1);visibility:hidden;}'
   +'#caro-ret-ov.open{transform:translateY(0);visibility:visible;}'
   +'.rt-head{display:flex;align-items:center;gap:6px;padding:calc(11px + var(--sat,0px)) 10px 11px;background:#f0f3f7;border-bottom:1px solid var(--border-l,#e3e7ec);}'
   +'.rt-back{width:40px;height:40px;border:none;background:none;font-size:1.65rem;color:#18191c;cursor:pointer;font-family:inherit;}'
   +'.rt-title{font-size:1.15rem;font-weight:800;color:#18191c;}'
   +'.rt-body{flex:1;overflow-y:auto;padding:16px 16px 20px;}'
   +'.rt-sec{margin-bottom:20px;}'
   +'.rt-lbl{font-size:.8rem;font-weight:700;color:var(--text-2,#44474f);margin:0 2px 10px;}'
   +'.rt-item{display:flex;align-items:center;gap:12px;width:100%;text-align:left;background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:15px 14px;margin-bottom:9px;cursor:pointer;font-family:inherit;}'
   +'.rt-box{width:25px;height:25px;flex-shrink:0;border-radius:8px;border:2px solid #c8ccd2;display:flex;align-items:center;justify-content:center;color:#fff;}'
   +'.rt-box svg{width:15px;height:15px;opacity:0;}'
   +'.rt-item.on{border-color:#18191c;}.rt-item.on .rt-box{background:#1d7a3a;border-color:#1d7a3a;}.rt-item.on .rt-box svg{opacity:1;}'
   +'.rt-itl{font-size:.9rem;font-weight:600;color:#18191c;line-height:1.4;}'
   +'.rt-park{display:grid;grid-template-columns:1fr 1fr;gap:8px;}'
   +'.rt-pk{padding:13px;border:1px solid var(--border-l,#e7eaef);border-radius:12px;background:#fff;font-size:.88rem;font-weight:700;color:#18191c;cursor:pointer;font-family:inherit;}'
   +'.rt-pk.on{background:#18191c;color:#fff;border-color:#18191c;}'
   +'.rt-other{max-height:0;overflow:hidden;transition:max-height .28s ease;}'
   +'.rt-other.open{max-height:520px;margin-top:10px;}'
   +'.rt-desc{width:100%;border:1px solid var(--border-l,#e7eaef);border-radius:12px;padding:12px;font-size:.88rem;font-family:inherit;resize:none;box-sizing:border-box;}'
   +'.rt-photo{margin-top:9px;width:100%;padding:12px;border:1px dashed #c2c7cf;border-radius:12px;background:#fff;font-size:.85rem;font-weight:600;color:#18191c;cursor:pointer;font-family:inherit;}'
   +'.rt-photos{display:flex;flex-wrap:wrap;gap:7px;margin-top:9px;}'
   +'.rt-photos img{width:60px;height:50px;object-fit:cover;border-radius:9px;border:1px solid var(--border-l,#e7eaef);}'
   +'.rt-sum{background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:15px;}'
   +'.rt-sr{display:flex;justify-content:space-between;align-items:flex-start;gap:10px;font-size:.85rem;color:var(--text-2,#44474f);padding:6px 0;}'
   +'.rt-sr b{color:#18191c;font-weight:700;white-space:nowrap;}'
   +'.rt-sr.pen b,.rt-sr.pen span{color:#b23a3a;}'
   +'.rt-tot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--border-l,#e7eaef);margin-top:8px;padding-top:12px;}'
   +'.rt-tot span{font-size:.85rem;color:var(--text-2,#44474f);}.rt-tot b{font-size:1.3rem;font-weight:800;color:#18191c;}'
   +'.rt-note{font-size:.72rem;color:var(--text-m);margin-top:10px;line-height:1.5;}'
   +'.rt-foot{padding:12px 16px calc(14px + var(--sab,0px));background:#f0f3f7;border-top:1px solid var(--border-l,#e3e7ec);}'
   +'.rt-submit{width:100%;background:linear-gradient(135deg,#20232b,#14151a);color:#fff;border:none;border-radius:14px;padding:16px;font-size:1rem;font-weight:700;cursor:pointer;font-family:inherit;}'
   +'.rt-submit:disabled{opacity:.4;cursor:default;}'
   /* 결제 모달 */
   +'#caro-retpay-ov{position:fixed;inset:0;z-index:1220;background:rgba(20,22,28,.45);display:none;align-items:flex-start;justify-content:center;}'
   +'#caro-retpay-ov.open{display:flex;}'
   +'.rtp-sheet{background:#fff;width:min(440px,92%);margin-top:20vh;border-radius:20px;overflow:hidden;box-shadow:0 24px 64px rgba(0,0,0,.32);}'
   +'.rtp-hd{display:flex;align-items:center;justify-content:space-between;padding:15px 16px;border-bottom:1px solid var(--border-l,#e7eaef);}'
   +'.rtp-hd .t{font-size:1.05rem;font-weight:800;color:#18191c;}'
   +'.rtp-x,.rtp-bk{border:none;background:none;font-size:1.45rem;color:#888d98;cursor:pointer;width:30px;font-family:inherit;}'
   +'.rtp-amt{text-align:center;padding:15px 16px;font-size:1rem;color:#18191c;border-bottom:1px solid var(--border-l,#e7eaef);}'
   +'.rtp-amt b{font-weight:800;}'
   +'.rtp-body{padding:14px 16px 20px;}'
   +'.rtp-opt{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:15px;margin-bottom:11px;cursor:pointer;font-family:inherit;}'
   +'.rtp-ic{width:30px;height:24px;flex-shrink:0;color:#18191c;}'
   +'.rtp-tx{flex:1;min-width:0;}.rtp-opt .l1{font-size:.95rem;font-weight:700;color:#18191c;}.rtp-opt .l2{font-size:.78rem;color:var(--text-m);margin-top:2px;}.rtp-opt .arr{color:#c8ccd2;font-size:1.25rem;}';
  (document.head||document.documentElement).appendChild(st);

  function boot(){
    /* 반납 버튼 → 풀스크린 반납 화면 (이전 체크리스트 모달 대체) */
    function hook(){
      if(typeof window.openReturnParkModal!=='function') return false;
      if(window.openReturnParkModal._caroRet2) return true;
      window.openReturnParkModal=function(){ openRet(); };
      window.openReturnParkModal._caroRet2=1;
      return true;
    }
    if(!hook()){ var t=0; var iv=setInterval(function(){ if(hook()||++t>40) clearInterval(iv); },300); }
    handleReturn();
    console.log('[\uBC18\uB0A9] \u2705 \uD480\uC2A4\uD06C\uB9B0 \uBC18\uB0A9 + \uC815\uC0B0 \uACB0\uC81C');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();

/* ═══ 공지·이벤트 상세 팝업(notice-modal) 가운데 정렬 ═══ */
(function(){ 'use strict';
  var s=document.createElement('style');
  s.textContent=
    '#notice-modal #notice-body{text-align:center;}'
   +'#notice-modal #notice-body p,#notice-modal #notice-body h4,#notice-modal #notice-body div,#notice-modal #notice-body li,#notice-modal #notice-body span{text-align:center;}'
   +'#notice-modal #notice-body ul,#notice-modal #notice-body ol{list-style-position:inside;padding-left:0;}'
   +'#notice-modal .modal-header{position:relative;justify-content:center;}'
   +'#notice-modal .modal-title{flex:1;text-align:center;padding:0 28px;}'
   +'#notice-modal .modal-close{position:absolute;right:12px;top:50%;transform:translateY(-50%);}';
  (document.head||document.documentElement).appendChild(s);
})();

/* ═══════════════════════════════════════════════════════════
   [2a] 직원 권한 연동 — admin_accounts 권한 읽기 + 관리자 모드 진입 + 동기화 활성화
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var perms=null, isStaff=false;
  var SUPER_EMAIL='caro.mobility.official@gmail.com';

  function isSuper(){ try{ return window.userInfo && userInfo.id==='CAROMOBILITY'; }catch(e){ return false; } }

  /* 권한 체크 API: 최고관리자=전부, 직원=부여받은 것만 */
  window.caroCan=function(p){ if(isSuper()) return true; return !!(isStaff && perms && perms[p]); };
  window.caroIsAdmin=function(){ return isSuper() || isStaff; };
  window.caroMyPerms=function(){ return isSuper()? {cars:true,pricing:true,notices:true,resv:true} : (perms||{}); };

  /* ★ isDevUser 확장 — 직원도 포함 → 차량 저장/삭제/상태 동기화가 직원에게도 동작
     (실제 쓰기 허용 여부는 Firestore 규칙 can(...) 이 최종 판단) */
  window.isDevUser=function(){ return isSuper() || isStaff; };

  function loadPerms(email){
    if(!email || !window.FB_DB || !window.FB_FN || !window.FB_FN.getDoc){ perms=null; isStaff=false; refreshEntry(); return; }
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.getDoc(FN.doc(db,'admin_accounts',String(email).toLowerCase())).then(function(snap){
        var ex = snap && (typeof snap.exists==='function' ? snap.exists() : snap.exists);
        if(ex){
          var d=snap.data()||{};
          var pm=d.perms||{};
          var hasAny=['control','ops','cars','pricing','notices','resv'].some(function(k){ return pm[k]; });  /* ★ 권한 단순화(control/ops) 반영 — 옛 키만 보던 탓에 control/ops 부여해도 앱에서 '권한없음'으로 뜨던 버그 수정 */
          if(d.active!==false && hasAny){ perms=pm; isStaff=true; }
          else { perms=null; isStaff=false; }
        } else { perms=null; isStaff=false; }
        refreshEntry();
      }).catch(function(e){ console.warn('[권한] 로드 실패', e&&e.code); perms=null; isStaff=false; refreshEntry(); });
    }catch(e){ perms=null; isStaff=false; refreshEntry(); }
  }

  function watchAuth(tries){
    tries=tries||0;
    if(window.FB_AUTH && window.FB_FN && window.FB_FN.onAuthStateChanged){
      window.FB_FN.onAuthStateChanged(window.FB_AUTH, function(u){
        if(u && u.email){
          if(String(u.email).toLowerCase()===SUPER_EMAIL){ perms=null; isStaff=false; refreshEntry(); }
          else loadPerms(u.email);
        } else { perms=null; isStaff=false; refreshEntry(); }
      });
    } else if(tries<40){ setTimeout(function(){ watchAuth(tries+1); },400); }
  }

  /* 햄버거 메뉴에 '관리자 모드' 항목 (직원/관리자만) */
  function refreshEntry(){
    var logout=document.querySelector('.hmenu-logout');
    var existing=document.getElementById('caro-admin-entry');
    var divider=document.getElementById('caro-admin-entry-div');
    if(!window.caroIsAdmin()){ if(existing) existing.remove(); if(divider) divider.remove(); return; }
    if(existing) return;
    if(!logout || !logout.parentNode) return;
    var dv=document.createElement('div'); dv.className='hmenu-divider'; dv.id='caro-admin-entry-div';
    var b=document.createElement('button');
    b.id='caro-admin-entry'; b.className='hmenu-item'; b.type='button';
    b.innerHTML='<span class="hmenu-item-icon"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9.5 12l2 2 3.5-3.5"/></svg></span><span class="hmenu-item-label">관리자 모드</span><span class="hmenu-item-arrow">›</span>';
    b.onclick=function(){
      try{ if(window.closeHomeMenu) closeHomeMenu(); }catch(e){}
      try{
        if(window.showDevLoginTransition){ showDevLoginTransition(); }
        else if(window.goTo){ goTo('dev-screen'); }
      }catch(e){ try{ if(window.goTo) goTo('dev-screen'); }catch(e2){} }
    };
    logout.parentNode.insertBefore(dv, logout);
    logout.parentNode.insertBefore(b, logout);
  }

  watchAuth();
  setTimeout(refreshEntry, 1200);
  console.log('[권한] ✅ 직원 권한 연동 2a (admin_accounts 읽기 + 관리자 진입 + 동기화 확장)');
})();

/* ═══════════════════════════════════════════════════════════
   [2c] 관리자 모드(dev-screen) 재디자인 — 청록 → 대시보드 다크+골드(Fleet Control)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var G='#aeb6c2', GS='#e2e6ec';            /* ★ silver / silver-soft (골드 제거) */
  var BG='#141518', PANEL='#1b1d21', PANEL2='#1f2228';
  var BD='#2b2e34', BD2='#34383f', TXT='#e9eaed', MUTED='#868b94', MUTED2='#5e636b';

  var s=document.createElement('style');
  s.textContent=
    '#dev-screen{background:'+BG+';}'
   +'#dev-screen .dev-bg{background:'+BG+' !important;}'
   /* 헤더 */
   +'#dev-screen .dev-logo{color:'+G+' !important;text-shadow:0 0 18px rgba(174,182,194,.2) !important;}'
   +'#dev-screen .dev-sub{color:rgba(220,194,143,.5) !important;}'
   +'#dev-screen .dev-logout-btn{background:rgba(174,182,194,.08) !important;border-color:rgba(174,182,194,.28) !important;color:'+GS+' !important;}'
   +'#dev-screen .dev-logout-btn:hover{background:rgba(174,182,194,.16) !important;}'
   /* 섹션/카드 */
   +'#dev-screen .dev-section-title{color:rgba(220,194,143,.62) !important;}'
   +'#dev-screen .dev-card{background:'+PANEL+' !important;border-color:'+BD+' !important;}'
   +'#dev-screen .dev-row{border-bottom-color:'+BD+' !important;}'
   +'#dev-screen .dev-label{color:#9aa0aa !important;}'
   /* 통계 */
   +'#dev-screen .dev-stat-card{background:'+PANEL+' !important;border-color:'+BD+' !important;}'
   +'#dev-screen .dev-stat-num{color:'+G+' !important;}'
   +'#dev-screen .dev-stat-label{color:'+MUTED+' !important;}'
   +'#dev-screen .dev-stat-highlight{border-color:rgba(174,182,194,.32) !important;background:rgba(174,182,194,.06) !important;}'
   /* 버튼 */
   +'#dev-screen .dev-btn{background:rgba(174,182,194,.1) !important;border-color:rgba(174,182,194,.25) !important;color:'+GS+' !important;}'
   +'#dev-screen .dev-btn:hover{background:rgba(174,182,194,.2) !important;border-color:rgba(174,182,194,.42) !important;}'
   /* 입력 */
   +'#dev-screen .dev-input,#dev-screen .dev-select,#dev-screen .dev-textarea{background:'+PANEL2+' !important;border-color:'+BD2+' !important;color:'+TXT+' !important;}'
   +'#dev-screen .dev-input::placeholder{color:'+MUTED2+' !important;}'
   +'#dev-screen .dev-input:focus,#dev-screen .dev-select:focus,#dev-screen .dev-textarea:focus{border-color:'+G+' !important;}'
   +'#dev-screen .dev-select option{background:'+PANEL2+' !important;color:'+TXT+' !important;}'
   /* 탭 */
   +'#dev-screen .dev-tab-btn{color:'+MUTED+' !important;}'
   +'#dev-screen .dev-tab-btn:hover{color:'+GS+' !important;}'
   +'#dev-screen .dev-tab-active{color:'+G+' !important;border-bottom-color:'+G+' !important;}'
   /* 삭제 체크박스 */
   +'#dev-screen .dev-del-chk-box{border-color:rgba(174,182,194,.35) !important;background:rgba(174,182,194,.06) !important;}'
   +'#dev-screen .dev-del-chk input:checked ~ .dev-del-chk-box{background:'+G+' !important;border-color:'+G+' !important;}'
   /* 탭 구분선 등 인라인 청록 보더 잔재 톤다운 */
   +'#dev-screen [style*="91,200,255"]{border-color:'+BD+' !important;}';
  (document.head||document.documentElement).appendChild(s);

  /* 헤더 텍스트를 대시보드 정체성으로 (기능은 그대로) */
  function rebrand(){
    try{
      var lg=document.querySelector('#dev-screen .dev-logo'); if(lg) lg.textContent='CARO MOBILITY';
      var sb=document.querySelector('#dev-screen .dev-sub'); if(sb) sb.textContent='관리자 콘솔 · FLEET CONTROL';
    }catch(e){}
  }
  rebrand(); setTimeout(rebrand, 1500);
  console.log('[관리자모드] ✅ 재디자인 2c (다크+골드 Fleet Control)');
})();

/* ═══════════════════════════════════════════════════════════
   [2c-2] 관리자 모드 진입 전환화면 — 청록 "DEV CONSOLE" → 골드 "CARO ADMIN"
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  window.showDevLoginTransition=function(){
    var overlay=document.getElementById('dev-login-overlay');
    if(overlay){ try{ overlay.remove(); }catch(e){} }   /* 기존(청록) 제거 후 골드로 생성 */
    overlay=document.createElement('div');
    overlay.id='dev-login-overlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:#141518;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .5s ease;pointer-events:none;';
    overlay.innerHTML=
      '<div style="font-family:\'Oswald\',sans-serif;font-size:.7rem;letter-spacing:.5em;color:rgba(174,182,194,.5);margin-bottom:20px;text-transform:uppercase;">ADMINISTRATOR</div>'+
      '<div style="font-family:\'Oswald\',sans-serif;font-size:2rem;font-weight:500;letter-spacing:.2em;color:rgba(174,182,194,.95);">CARO ADMIN</div>'+
      '<div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(174,182,194,.5),transparent);margin:16px 0;"></div>'+
      '<div style="font-size:.72rem;color:rgba(174,182,194,.45);letter-spacing:.15em;">FLEET CONTROL</div>';
    document.body.appendChild(overlay);
    overlay.style.pointerEvents='all';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){
      overlay.style.opacity='1';
      setTimeout(function(){
        try{ if(window.goTo) goTo('dev-screen'); }catch(e){}
        setTimeout(function(){ overlay.style.opacity='0'; overlay.style.pointerEvents='none'; },600);
      },3500);
    });});
  };
  console.log('[관리자모드] ✅ 진입 전환화면 CARO ADMIN(골드)');
})();

/* ═══════════════════════════════════════════════════════════
   [2c-3] 앱 관리자 모드 정리 — 데모 "권한 부여" 비활성 + 안내, 인라인 청록 글씨 골드화
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  /* 인라인 rgba(91,200,255) 글씨도 골드로 */
  var s=document.createElement('style');
  s.textContent='#dev-screen [style*="91,200,255"]{color:#cfd5dd !important;}';
  (document.head||document.documentElement).appendChild(s);

  /* 데모 권한부여 버튼 무력화 → 대시보드로 안내 */
  window.devGrantAccess=function(){
    try{ if(window.showToast) showToast('직원 권한은 관제 대시보드 → 설정 → 관리자 계정에서 부여하세요.'); }catch(e){}
  };

  /* 데모 입력행 숨김 (실제 부여는 2d 모듈이 상단에 제공) */
  function fixGrantRow(){
    var inp=document.getElementById('dev-new-dev-id'); if(!inp) return;
    var row=inp.closest('.dev-row'); if(!row || row.dataset.caroFixed) return;
    row.dataset.caroFixed='1';
    row.style.display='none';
  }
  fixGrantRow();
  setTimeout(fixGrantRow, 1200);
  setTimeout(fixGrantRow, 2500);
  console.log('[관리자모드] ✅ 데모 권한버튼 정리 + 청록 글씨 골드화');
})();

/* ═══════════════════════════════════════════════════════════
   [2d] 앱 관리자 모드 — 최고관리자 전용 '직원 권한 부여' (실제 동작, admin_accounts)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var SUPER='caro.mobility.official@gmail.com';
  var PERMS=[
    {key:'cars',label:'차량 관리',sub:'등록·수정·삭제'},
    {key:'pricing',label:'요금 관리',sub:'시간당·주행·월요금'},
    {key:'notices',label:'공지·이벤트',sub:'등록·수정·삭제'},
    {key:'resv',label:'예약 관리',sub:'조회·처리'}
  ];
  var PILL={cars:'차량',pricing:'요금',notices:'공지',resv:'예약'};
  var cache=[], snapStarted=false, editingEmail=null;

  function isSuper(){
    try{
      if(window.userInfo && userInfo.id==='CAROMOBILITY') return true;
      if(window.FB_AUTH && FB_AUTH.currentUser && String(FB_AUTH.currentUser.email||'').toLowerCase()===SUPER) return true;
    }catch(e){}
    return false;
  }
  function ready(){ return window.FB_DB && window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc; }
  function T(m){ try{ if(window.showToast) showToast(m); }catch(e){} }
  function esc(s){ return (s==null?'':String(s)).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    '#caro-staff-mgmt .csm-hd{font-size:.82rem;color:#cfd5dd;font-weight:700;padding:6px 2px 10px;}'
   +'#caro-staff-mgmt .csm-locked{font-size:.8rem;color:#9aa0aa;padding:8px 2px;line-height:1.5;}'
   +'#caro-staff-list{display:flex;flex-direction:column;gap:7px;margin:8px 0 4px;}'
   +'.csm-item{border:1px solid #2b2e34;border-radius:11px;background:#1f2228;padding:10px 11px;}'
   +'.csm-item.off{opacity:.55;}'
   +'.csm-top{display:flex;align-items:center;gap:8px;}'
   +'.csm-nm{font-size:.84rem;color:#e9eaed;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}'
   +'.csm-stat{font-size:.6rem;padding:1px 7px;border-radius:20px;}'
   +'.csm-stat.on{color:#7bb89a;border:1px solid rgba(123,184,154,.4);} .csm-stat.no{color:#d57a68;border:1px solid rgba(213,122,104,.4);}'
   +'.csm-mail{font-size:.7rem;color:#868b94;margin-top:3px;word-break:break-all;}'
   +'.csm-perms{display:flex;gap:4px;flex-wrap:wrap;margin-top:7px;}'
   +'.csm-pill{font-size:.6rem;padding:2px 8px;border-radius:20px;border:1px solid #34383f;color:#c8a96e;}'
   +'.csm-pill.none{color:#868b94;}'
   +'.csm-acts{display:flex;gap:6px;margin-top:9px;}'
   +'.csm-act{flex:1;padding:6px;border-radius:8px;border:1px solid #34383f;background:transparent;color:#9aa0aa;font-size:.72rem;cursor:pointer;font-family:inherit;}'
   +'.csm-act.del{color:#d57a68;border-color:rgba(213,122,104,.35);}'
   +'.csm-act.edit{color:#cfd5dd;border-color:rgba(174,182,194,.35);}'
   /* 모달 */
   +'#csmModal{position:fixed;inset:0;background:rgba(0,0,0,.66);display:none;align-items:center;justify-content:center;z-index:100000;padding:16px;}'
   +'#csmModal.show{display:flex;}'
   +'.csm-box{background:#1b1d21;border:1px solid #34383f;border-radius:16px;width:min(440px,94vw);max-height:90vh;overflow:auto;}'
   +'.csm-bhd{display:flex;justify-content:space-between;align-items:center;padding:15px 17px;border-bottom:1px solid #2b2e34;}'
   +'.csm-bhd h3{margin:0;font-size:.95rem;color:#e9eaed;}'
   +'.csm-x{background:none;border:none;color:#868b94;font-size:18px;cursor:pointer;}'
   +'.csm-bd{padding:15px 17px 4px;}'
   +'.csm-bd label.l{display:block;font-size:.74rem;color:#868b94;margin:12px 0 6px;}'
   +'.csm-bd label.l:first-child{margin-top:0;}'
   +'.csm-bd input.i{width:100%;box-sizing:border-box;background:#1f2228;border:1px solid #34383f;color:#e9eaed;border-radius:9px;padding:10px 12px;font-size:.86rem;font-family:inherit;}'
   +'.csm-bd input.i:disabled{opacity:.6;}'
   +'.csm-bd input.i:focus{outline:none;border-color:#c8a96e;}'
   +'.csm-hint{font-size:.7rem;color:#868b94;margin-top:5px;line-height:1.5;}'
   +'.csm-pk{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #2b2e34;border-radius:10px;background:#1f2228;margin-top:7px;cursor:pointer;}'
   +'.csm-pk input{width:17px;height:17px;accent-color:#c8a96e;}'
   +'.csm-pk .t{font-size:.83rem;color:#e9eaed;} .csm-pk .s{font-size:.68rem;color:#868b94;margin-top:1px;}'
   +'.csm-ft{display:flex;gap:9px;justify-content:flex-end;padding:13px 17px;border-top:1px solid #2b2e34;}'
   +'.csm-btn{padding:9px 16px;border-radius:9px;border:1px solid #34383f;background:transparent;color:#cfd3da;font-size:.84rem;cursor:pointer;font-family:inherit;}'
   +'.csm-btn.gold{background:#c8a96e;border-color:#c8a96e;color:#1a1a1a;font-weight:700;}';
  (document.head||document.documentElement).appendChild(st);

  /* ── 모달 ── */
  var modal=document.createElement('div'); modal.id='csmModal';
  modal.innerHTML=
    '<div class="csm-box">'
    +'<div class="csm-bhd"><h3 id="csm-ttl">직원 권한 부여</h3><button class="csm-x" id="csm-close">✕</button></div>'
    +'<div class="csm-bd">'
      +'<label class="l">직원 이메일(아이디) *</label>'
      +'<input class="i" id="csm-email" placeholder="예: staff@caro.app" autocomplete="off"/>'
      +'<div class="csm-hint">직원이 앱에서 가입한 로그인 이메일과 똑같이 입력하세요.</div>'
      +'<label class="l">직원 이름 *</label>'
      +'<input class="i" id="csm-name" placeholder="예: 이현장"/>'
      +'<label class="l">접근 권한</label>'
      +PERMS.map(function(p){ return '<label class="csm-pk"><input type="checkbox" data-perm="'+p.key+'"><span><div class="t">'+p.label+'</div><div class="s">'+p.sub+'</div></span></label>'; }).join('')
      +'<label class="csm-pk" style="margin-top:12px;"><input type="checkbox" id="csm-active" checked><span><div class="t">활성 (재직 중)</div><div class="s">끄면 모든 권한이 차단됩니다.</div></span></label>'
    +'</div>'
    +'<div class="csm-ft"><button class="csm-btn" id="csm-cancel">취소</button><button class="csm-btn gold" id="csm-save">저장</button></div>'
    +'</div>';
  document.body.appendChild(modal);
  function closeModal(){ modal.classList.remove('show'); }
  modal.querySelector('#csm-close').onclick=closeModal;
  modal.querySelector('#csm-cancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });

  function openModal(acct){
    editingEmail = acct ? (acct.id||acct.email) : null;
    modal.querySelector('#csm-ttl').textContent = acct?'직원 권한 수정':'직원 권한 부여';
    var em=modal.querySelector('#csm-email');
    em.value=acct?(acct.email||acct.id||''):''; em.disabled=!!acct;
    modal.querySelector('#csm-name').value=acct?(acct.name||''):'';
    var pm=(acct&&acct.perms)||{};
    modal.querySelectorAll('.csm-pk input[data-perm]').forEach(function(c){ c.checked=!!pm[c.dataset.perm]; });
    modal.querySelector('#csm-active').checked = acct?(acct.active!==false):true;
    modal.classList.add('show');
  }

  modal.querySelector('#csm-save').onclick=function(){
    if(!isSuper()){ T('최고관리자만 권한을 부여할 수 있습니다.'); return; }
    if(!ready()){ T('연결 준비 중입니다'); return; }
    var email=(editingEmail || modal.querySelector('#csm-email').value.trim().toLowerCase());
    var name=modal.querySelector('#csm-name').value.trim();
    if(!email || email.indexOf('@')<0){ T('직원 이메일(아이디)을 정확히 입력하세요'); return; }
    if(!name){ T('직원 이름을 입력하세요'); return; }
    if(email===SUPER){ T('최고관리자 계정은 수정할 수 없습니다'); return; }
    var perms={}; modal.querySelectorAll('.csm-pk input[data-perm]').forEach(function(c){ perms[c.dataset.perm]=!!c.checked; });
    var active=modal.querySelector('#csm-active').checked;
    var FN=window.FB_FN, db=window.FB_DB;
    var data={ email:email, name:name, perms:perms, active:active, updatedAt:new Date().toISOString() };
    if(!editingEmail) data.createdAt=new Date().toISOString();
    FN.setDoc(FN.doc(db,'admin_accounts',email), data, {merge:true}).then(function(){
      T(editingEmail?'권한이 수정되었습니다':'직원 권한이 부여되었습니다'); closeModal();
      /* 즉시 반영 (onSnapshot 기다리지 않고 바로 목록 갱신) */
      try{
        var obj={id:email, email:email, name:name, perms:perms, active:active};
        var idx=-1; for(var i=0;i<cache.length;i++){ if((cache[i].id||cache[i].email)===email){ idx=i; break; } }
        if(idx>=0) cache[idx]=obj; else cache.push(obj);
        cache.sort(function(x,y){ return (x.name||'').localeCompare(y.name||''); });
        renderList();
      }catch(e){}
    }).catch(function(e){ console.error('[앱권한] 저장 실패',e); T('저장 실패 — 최고관리자만 가능 / 규칙 확인'); });
  };

  window.caroAppEditStaff=function(email){ var a=cache.filter(function(x){return (x.id||x.email)===email;})[0]; if(a) openModal(a); };
  window.caroAppDelStaff=function(email){
    if(!isSuper()||!ready()) return;
    if(!confirm('이 직원 권한을 삭제할까요?\n('+email+')')) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'admin_accounts',email)).then(function(){ T('삭제되었습니다'); }).catch(function(e){ console.error(e); T('삭제 실패'); });
  };
  window.caroAppToggleStaff=function(email,next){
    if(!isSuper()||!ready()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.setDoc(FN.doc(db,'admin_accounts',email),{active:!!next},{merge:true}).then(function(){ T(next?'활성화됨':'정지됨'); }).catch(function(e){ console.error(e); T('변경 실패'); });
  };

  function renderList(){
    var box=document.getElementById('caro-staff-list'); if(!box) return;
    if(!cache.length){ box.innerHTML='<div style="font-size:.76rem;color:#868b94;padding:6px 2px;">아직 부여된 직원이 없습니다. 위 버튼으로 추가하세요.</div>'; return; }
    box.innerHTML=cache.map(function(a){
      var email=a.id||a.email||''; var on=a.active!==false;
      var pills=PERMS.filter(function(p){return a.perms&&a.perms[p.key];}).map(function(p){return '<span class="csm-pill">'+PILL[p.key]+'</span>';}).join('') || '<span class="csm-pill none">권한 없음</span>';
      return '<div class="csm-item'+(on?'':' off')+'">'
        +'<div class="csm-top"><div class="csm-nm">'+esc(a.name||email)+'</div><span class="csm-stat '+(on?'on':'no')+'">'+(on?'활성':'정지')+'</span></div>'
        +'<div class="csm-mail">'+esc(email)+'</div>'
        +'<div class="csm-perms">'+pills+'</div>'
        +'<div class="csm-acts">'
        +'<button class="csm-act edit" onclick="caroAppEditStaff(\''+esc(email)+'\')">수정</button>'
        +'<button class="csm-act" onclick="caroAppToggleStaff(\''+esc(email)+'\','+(on?'false':'true')+')">'+(on?'정지':'활성')+'</button>'
        +'<button class="csm-act del" onclick="caroAppDelStaff(\''+esc(email)+'\')">삭제</button>'
        +'</div></div>';
    }).join('');
  }

  function startSnap(){
    if(snapStarted || !isSuper() || !ready() || !window.FB_FN.onSnapshot) return;
    snapStarted=true;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'admin_accounts'), function(snap){
        var arr=[]; snap.forEach(function(d){ var o=d.data()||{}; o.id=d.id; arr.push(o); });
        arr.sort(function(x,y){ return (x.name||'').localeCompare(y.name||''); });
        cache=arr; renderList();
      }, function(e){ console.warn('[앱권한] 목록 오류', e&&e.code); });
    }catch(e){ console.warn('[앱권한] 리스너 실패', e); }
  }

  function findPermCard(){
    var titles=document.querySelectorAll('#dev-screen .dev-section-title');
    for(var i=0;i<titles.length;i++){ if(/권한/.test(titles[i].textContent)){ var sec=titles[i].closest('.dev-section'); return sec? sec.querySelector('.dev-card') : null; } }
    return null;
  }
  function inject(){
    var card=findPermCard(); if(!card) return;
    var block=document.getElementById('caro-staff-mgmt');
    var sup=isSuper();
    if(!block){ block=document.createElement('div'); block.id='caro-staff-mgmt'; card.insertBefore(block, card.firstChild); }
    var mode=sup?'super':'locked';
    if(block.dataset.mode===mode){ if(sup) startSnap(); return; }
    block.dataset.mode=mode;
    if(sup){
      block.innerHTML='<div class="csm-hd">직원 권한 관리</div>'
        +'<button class="dev-btn dev-full-btn" id="caro-staff-add" style="background:rgba(174,182,194,.12);border:1px solid rgba(174,182,194,.3);color:#cfd5dd;">+ 직원 권한 부여</button>'
        +'<div id="caro-staff-list"></div>';
      var ab=document.getElementById('caro-staff-add'); if(ab) ab.onclick=function(){ openModal(null); };
      startSnap(); renderList();
    } else {
      block.innerHTML='<div class="csm-locked">직원 권한 부여는 <b style="color:#cfd5dd;">최고관리자</b>만 가능합니다.</div>';
    }
  }

  /* dev-screen 진입 때마다 주입 (최고관리자 판별이 늦게 되는 경우 대비) */
  var _rds=window.renderDevScreen;
  window.renderDevScreen=function(){ try{ if(_rds) _rds.apply(this,arguments); }catch(e){} setTimeout(inject,40); };
  inject(); setTimeout(inject,1000); setTimeout(inject,2500);
  /* 최고관리자 인증/Firestore 준비가 늦어도 목록 리스너가 반드시 붙도록 계속 재시도
     (재접속/재시작/업데이트 후 목록이 비어 보이던 문제 해결) */
  var _snapTry=setInterval(function(){
    try{
      if(snapStarted){ clearInterval(_snapTry); return; }
      if(isSuper() && ready()){ inject(); }
    }catch(e){}
  }, 700);
  setTimeout(function(){ try{ clearInterval(_snapTry); }catch(e){} }, 45000);
  console.log('[앱권한] ✅ 최고관리자 직원 권한 부여 2d');
})();

/* ═══════════════════════════════════════════════════════════
   [완성도] 회사 정보(사업자 정보) — 마이페이지에 추가 (전자상거래법 표시 의무)
   ※ 아래 BIZ 값을 실제 정보로 채우세요. 빈 값은 '준비 중'으로 표시됩니다.
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  /* ▼▼▼ 실제 회사 정보 입력 ▼▼▼ */
  var BIZ={
    name:'(주)카로 모빌리티',
    ceo:'',            /* 대표자명 */
    bizNo:'',          /* 사업자등록번호 (000-00-00000) */
    mailOrderNo:'',    /* 통신판매업 신고번호 (제0000-지역-0000호) */
    addr:'',           /* 사업장 주소 */
    tel:'',            /* 고객센터 전화 */
    hours:'평일 09:00~18:00 (주말·공휴일 휴무)',
    email:'',          /* 고객센터 이메일 */
    privacyOfficer:'', /* 개인정보 보호책임자 */
    host:'Google Firebase'  /* 호스팅 제공 */
  };
  /* ▲▲▲ 여기까지 ▲▲▲ */

  function val(x){ return (x && String(x).trim()) ? esc(x) : '<span style="color:#b6b9c0;">준비 중</span>'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style');
  st.textContent=
    '#caro-biz-ov{position:fixed;inset:0;background:rgba(20,22,28,.5);z-index:99998;display:none;align-items:flex-end;justify-content:center;}'
   +'#caro-biz-ov.show{display:flex;}'
   +'#caro-biz-sheet{background:#fff;width:100%;max-width:480px;max-height:88vh;overflow:auto;border-radius:20px 20px 0 0;padding:0 0 28px;animation:caroBizUp .26s ease;}'
   +'@keyframes caroBizUp{from{transform:translateY(100%);}to{transform:translateY(0);}}'
   +'.caro-biz-hd{position:sticky;top:0;background:#fff;display:flex;align-items:center;justify-content:space-between;padding:18px 20px 14px;border-bottom:1px solid #f0f1f3;}'
   +'.caro-biz-hd h3{margin:0;font-size:17px;color:#18191c;font-weight:700;}'
   +'.caro-biz-x{background:none;border:none;font-size:20px;color:#9aa0aa;cursor:pointer;line-height:1;}'
   +'.caro-biz-body{padding:6px 20px 0;}'
   +'.caro-biz-row{display:flex;padding:13px 0;border-bottom:1px solid #f4f5f7;font-size:14px;}'
   +'.caro-biz-row .k{flex:0 0 122px;color:#868b94;}'
   +'.caro-biz-row .v{flex:1;color:#18191c;word-break:break-all;}'
   +'.caro-biz-note{margin:16px 0 0;font-size:12px;color:#9aa0aa;line-height:1.7;}';
  (document.head||document.documentElement).appendChild(st);

  var ov=document.createElement('div'); ov.id='caro-biz-ov';
  ov.innerHTML=
    '<div id="caro-biz-sheet">'
    +'<div class="caro-biz-hd"><h3>회사 정보</h3><button class="caro-biz-x" id="caro-biz-x">✕</button></div>'
    +'<div class="caro-biz-body">'
      +'<div class="caro-biz-row"><span class="k">상호</span><span class="v">'+val(BIZ.name)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">대표자</span><span class="v">'+val(BIZ.ceo)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">사업자등록번호</span><span class="v">'+val(BIZ.bizNo)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">통신판매업 신고</span><span class="v">'+val(BIZ.mailOrderNo)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">사업장 주소</span><span class="v">'+val(BIZ.addr)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">고객센터</span><span class="v">'+val(BIZ.tel)+(BIZ.hours?'<br><span style="color:#868b94;font-size:12.5px;">'+esc(BIZ.hours)+'</span>':'')+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">이메일</span><span class="v">'+val(BIZ.email)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">개인정보 보호책임자</span><span class="v">'+val(BIZ.privacyOfficer)+'</span></div>'
      +'<div class="caro-biz-row"><span class="k">호스팅 제공</span><span class="v">'+val(BIZ.host)+'</span></div>'
      +'<p class="caro-biz-note">카로 모빌리티는 「여객자동차 운수사업법」에 따른 자동차대여사업자로서 차량 대여 서비스를 직접 제공합니다. 본 정보는 「전자상거래 등에서의 소비자보호에 관한 법률」에 따라 표시됩니다.</p>'
      +'<p class="caro-biz-note">© 2026 CARO MOBILITY. All rights reserved.</p>'
    +'</div></div>';
  document.body.appendChild(ov);
  function close(){ ov.classList.remove('show'); }
  function open(){ ov.classList.add('show'); }
  ov.querySelector('#caro-biz-x').onclick=close;
  ov.addEventListener('click',function(e){ if(e.target===ov) close(); });

  function injectMenu(){
    if(document.getElementById('caro-bizinfo-item')) return;
    var items=document.querySelectorAll('#mypage-screen .mpn-item');
    for(var i=0;i<items.length;i++){
      if(/약관 및 정책/.test(items[i].textContent)){
        var it=document.createElement('div'); it.className='mpn-item'; it.id='caro-bizinfo-item';
        it.innerHTML='<span class="mpn-item-label">회사 정보</span><span class="mpn-item-arrow">›</span>';
        it.onclick=open;
        items[i].parentNode.insertBefore(it, items[i]);
        return;
      }
    }
  }
  injectMenu(); setTimeout(injectMenu,1500); setTimeout(injectMenu,3000);
  console.log('[완성도] ✅ 회사 정보(사업자) 페이지 추가');
})();

/* ═══════════════════════════════════════════════════════════
   [수정] 단기렌트 면책 3종(70/30/5만원) 복원 + 법적 기준 명시
   · 기존 완전면책(자부담 5만원) 제거 로직 비활성화 → 70/30/5만원 모두 표시
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  function legalNote(){
    var list=document.getElementById('insurance-list'); if(!list) return;
    if(document.getElementById('caro-ins-legal')) return;
    var p=document.createElement('div'); p.id='caro-ins-legal';
    p.style.cssText='margin:11px 4px 2px;font-size:.72rem;line-height:1.55;color:var(--text-m,#888d98);';
    p.innerHTML='※ 대인·대물 배상은 「자동차손해배상 보장법」상 의무보험이 적용되며, 면책 상품은 자차(자기차량) 손해의 <b>자기부담금</b>을 낮추는 임의 상품입니다. 자기부담금은 70만원(기본)·30만원(일반)·5만원(완전) 중 선택할 수 있습니다. (「여객자동차 운수사업법」상 자동차대여사업 기준)';
    list.parentNode.insertBefore(p, list.nextSibling);
  }
  legalNote(); setTimeout(legalNote,1500); setTimeout(legalNote,3000);
  if(typeof window.goTo==='function' && !window.goTo.__caroInsNote){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='reservation-screen'){ setTimeout(legalNote,80); } return r; };
    window.goTo.__caroInsNote=true;
  }
  console.log('[면책] ✅ 단기 면책 3종(70/30/5만) 복원 + 법적 기준 표기');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] CARO 상담봇 v2 — 100% 앱 내부(외부 AI/전송 없음)
   · 카셰어링 필수 FAQ 전면 확장 / 기본 카로 톤(차콜) / 상담사 연결 상시
   · 모든 상담을 support_chats 에 기록 (관리자 통계)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  function now(){ return new Date().toISOString(); }

  var CATS=[
    {key:'use',    label:'🚗 대여·이용 방법'},
    {key:'resv',   label:'📅 예약·변경·취소'},
    {key:'ret',    label:'🔄 반납·연장'},
    {key:'pay',    label:'💳 결제·요금'},
    {key:'acc',    label:'🛡️ 보험·사고'},
    {key:'car',    label:'🔧 차량 문제·긴급'},
    {key:'member', label:'👤 회원·가입·인증'},
    {key:'app',    label:'🐞 앱 오류·기타'}
  ];
  var FLOW={
    use:{ a:'카로 이용 방법을 안내해 드릴게요. 무엇이 궁금하세요?', subs:[
      {q:'처음 이용하는 방법',a:'① 회원가입 + 운전면허 등록 → ② 지도에서 가까운 카로존·차량 선택 → ③ 시간 선택 후 예약·결제 → ④ 차량 앞에서 앱으로 문 열기 → ⑤ 이용 후 지정 장소에 반납. 가입·면허 인증만 끝내면 바로 빌릴 수 있어요.'},
      {q:'차량 찾기(카로존)',a:'홈 지도에 내 주변 카로존과 이용 가능한 차량이 표시돼요. 차량을 누르면 요금·옵션을 확인하고 예약할 수 있어요.'},
      {q:'문 열기 / 잠그기',a:'예약한 차량 앞에서 앱의 차량 제어로 “열기/잠그기”를 누르세요. 네트워크가 약하면 1~2분 후 재시도하면 됩니다.'},
      {q:'주행 전 사진 촬영',a:'이용 시작 후 10분 이내에 차량 외관 사진을 촬영해 주세요. 기존 파손을 기록해 두면 책임 분쟁을 막을 수 있어요.'},
      {q:'월 렌트는 어떻게 하나요?',a:'장기 이용은 “월 렌트”에서 1·3·6·9·12개월 단위로 신청해요. 기간이 길수록 할인율이 커지고, 월 주행거리와 운전자 연령 조건이 적용돼요.'},
      {q:'카로 더 블랙이 뭔가요?',a:'카로 더 블랙은 프리미엄 차량 + 전담 컨시어지 서비스예요. 일반 카로와 별도로 운영되며 홈의 더 블랙 메뉴에서 확인할 수 있어요.'}
    ]},
    resv:{ a:'예약·변경·취소 관련 안내예요.', subs:[
      {q:'예약하는 방법',a:'차량 선택 → 대여 시작/종료 시간 선택 → 보험 선택 → 결제수단 확인 → 예약 완료. “지금”으로 두면 즉시 대여도 돼요.'},
      {q:'예약 변경',a:'이용 시작 전이라면 예약 내역에서 시간·차량을 변경할 수 있어요.'},
      {q:'예약 취소',a:'예약 내역에서 취소할 수 있어요. 취소 시점에 따라 수수료가 적용돼요(아래 “취소 수수료” 참고).'},
      {q:'취소 수수료',a:'이용 시작 충분히 전 취소는 전액 환불, 임박한 취소는 일부 수수료가 부과돼요. 정확한 기준은 고객센터 “취소 수수료 안내”에 있어요.'},
      {q:'즉시 대여',a:'지금 바로 이용하려면 차량 선택 후 시작 시간을 “지금”으로 두고 예약하면 돼요.'}
    ]},
    ret:{ a:'반납·연장 관련 안내예요.', subs:[
      {q:'반납하는 방법',a:'지정 주차구역에 주차 → 앱 “반납하기” → 체크리스트(분실물·파손) 확인 → 정산(주행요금·하이패스·연장·지연)을 등록 카드로 결제 → 반납 완료.'},
      {q:'반납 장소',a:'기본은 대여했던 카로존(지정 주차구역)이에요. 부득이하게 다른 곳에 주차하면 “다른 장소”를 선택해 위치 설명과 사진을 남겨 주세요.'},
      {q:'시간 연장',a:'이용 중 “시간 연장”에서 일/시간/분 단위로 연장할 수 있어요. 다음 예약이 있으면 그 시각까지만 가능하고, 연장 요금은 즉시 결제돼요.'},
      {q:'반납 지연되면?',a:'반납 예정 시간을 넘기면 10분당 패널티가 부과돼요. 늦어질 것 같으면 미리 “시간 연장”을 이용해 주세요.'},
      {q:'분실물',a:'반납 시 두고 내린 물건이 없는지 체크해 주세요. 이미 반납했다면 차량명·시간과 함께 문의해 주세요.'}
    ]},
    pay:{ a:'결제·요금 관련 안내예요.', subs:[
      {q:'요금이 어떻게 구성되나요?',a:'반납 정산 = 주행요금(주행거리×차량별 km요금, 무료주행 초과분) + 하이패스 통행료 + (지연 시)패널티. 예약 시 대여료·보험료는 따로 결제돼요.'},
      {q:'카드 등록 / 변경',a:'계정관리 → 결제수단에서 카드를 등록·변경할 수 있어요. 반납 정산은 등록 카드로 자동 결제돼요.'},
      {q:'결제가 안돼요',a:'카드 유효성·한도·잔액을 확인하고 카드를 다시 등록해 보세요. 계속되면 결제 시각과 차량명을 알려 주세요.'},
      {q:'환불',a:'예약 취소 환불은 취소 시점 수수료 규정에 따라, 정산 오류 환불은 확인 후 영업일 기준으로 처리돼요.'},
      {q:'요금이 이상해요',a:'이용내역에서 상세 정산을 확인해 주세요. 특정 건이 이상하면 차량명과 이용 시각을 알려 주시면 확인해 드릴게요.'},
      {q:'영수증 / 세금계산서',a:'이용내역에서 결제 내역을 확인할 수 있어요. 세금계산서·현금영수증이 필요하면 사업자 정보와 함께 요청해 주세요.'}
    ]},
    acc:{ a:'사고가 나셨군요. 침착하게 대처해 주세요.<br><br>1) <b>안전 확보</b>(비상등·삼각대)<br>2) <b>부상자 있으면 119</b><br>3) <b>사진 촬영</b>(차량·번호판·현장)<br>4) <b>사고 접수</b><br><br>자기부담금은 가입한 면책 상품 기준으로 적용돼요. 아래에서 바로 접수하거나 항목을 선택해 주세요.',
      action:{label:'사고 접수하기',go:'accident-screen'}, subs:[
      {q:'면책 상품 종류',a:'일반면책(자기부담 30만원)과 기본면책(자기부담 70만원)이 있어요. 상품에 따라 사고 시 자기부담금이 달라져요.'},
      {q:'자기부담금',a:'사고 시 가입한 면책 상품 기준으로 자기부담금이 적용돼요. 자세한 보상 범위는 사고 접수 후 안내해 드려요.'},
      {q:'고장·긴급출동',a:'주행 중 고장이면 안전한 곳에 정차 후 차량명·위치를 알려 주세요. 긴급출동을 안내해 드릴게요.'}
    ]},
    car:{ a:'차량 이용 중 어떤 문제가 있으셨나요?', subs:[
      {q:'시동이 안 걸려요',a:'브레이크를 끝까지 밟고 시동 버튼을 눌러 주세요. 전자식 키는 차 안에 있어야 해요. 계속 안 되면 차량명·위치를 알려 주세요.'},
      {q:'문이 안 열려요 / 안 잠겨요',a:'앱 차량 제어에서 다시 시도하고, 네트워크가 약하면 1~2분 후 재시도하세요. 계속되면 차량명을 알려 주세요.'},
      {q:'하이패스 문제',a:'통행료는 회사 카드로 먼저 결제된 뒤 반납 시 주행요금과 함께 정산돼요. 단말기 미인식 시 통행 영수증을 보관해 주세요.'},
      {q:'연료 · 충전',a:'차량 내 비치된 주유/충전 카드를 사용하세요. 전기차는 충전 후 케이블을 정리해 주세요. 무료주행 초과분만 반납 시 정산돼요.'},
      {q:'청결 · 파손 발견',a:'주행 시작 10분 이내에 사진을 촬영해 접수하면 이전 이용자 책임으로 확인돼요.'}
    ]},
    member:{ a:'회원·가입·인증 관련 안내예요.', subs:[
      {q:'가입 방법',a:'이메일로 회원가입 → 운전면허 등록·인증 → 결제수단 등록이면 이용 준비 완료예요.'},
      {q:'운전면허 인증',a:'본인 명의 운전면허를 등록하면 운영팀이 확인한 뒤 이용이 가능해요. (면허 진위확인 자동 연동은 준비 중)'},
      {q:'이용 자격',a:'만 21세 이상 + 운전면허 취득 1년 이상 + 본인 명의 결제수단이 필요해요(여객자동차 운수사업법 기준).'},
      {q:'비밀번호 재설정',a:'로그인 화면의 “아이디/비밀번호 찾기”에서 가입 이메일로 재설정할 수 있어요.'},
      {q:'회원 탈퇴',a:'계정관리 → 회원 탈퇴에서 가능해요. 진행 중인 예약이 없어야 해요.'}
    ]},
    app:{ a:'앱 오류·기타 문의 안내예요.', subs:[
      {q:'앱이 멈춰요 / 오류',a:'앱 완전 종료 후 재실행 → 네트워크 확인 → 최신 버전 확인 순으로 시도해 주세요. 계속되면 기기·화면명을 알려 주세요.'},
      {q:'로그인이 안돼요',a:'이메일/비밀번호를 확인하고, 비밀번호는 “찾기”로 재설정할 수 있어요.'},
      {q:'알림이 안 와요',a:'휴대폰 설정에서 카로 앱 알림 권한이 켜져 있는지 확인해 주세요.'},
      {q:'위치 / 지도 문제',a:'위치 권한을 허용해 주세요. 실내 등 GPS가 약한 곳에서는 정확도가 떨어질 수 있어요.'},
      {q:'기타 문의',a:'그 외 내용을 입력해 주시면 접수해 순차적으로 답변드릴게요.'}
    ]}
  };
  function route(text){ var t=String(text||'');
    if(/사고|충돌|박았|긁|접촉/.test(t)) return 'acc';
    if(/시동|문|잠|하이패스|연료|충전|청결|파손|냄새|고장|긴급/.test(t)) return 'car';
    if(/반납|연장|지연|분실/.test(t)) return 'ret';
    if(/예약|취소|변경/.test(t)) return 'resv';
    if(/결제|요금|환불|카드|영수증|청구|세금계산서/.test(t)) return 'pay';
    if(/가입|면허|인증|자격|비밀번호|탈퇴|로그인/.test(t)) return 'member';
    if(/오류|버그|멈|안돼|안 돼|에러|튕|하얘|안떠|알림|위치|지도/.test(t)) return 'app';
    if(/이용|방법|문 열|카로존|월 렌트|더 블랙/.test(t)) return 'use';
    return 'app';
  }

  var chatId=null, msgs=[], curCat=null;
  function fbReady(){ return window.FB_DB && window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc; }
  function meUid(){ try{ return (window.FB_AUTH&&FB_AUTH.currentUser&&FB_AUTH.currentUser.uid)||''; }catch(e){ return ''; } }
  function meEmail(){ try{ return (window.FB_AUTH&&FB_AUTH.currentUser&&FB_AUTH.currentUser.email)||''; }catch(e){ return ''; } }
  function logSave(resolved){
    if(!fbReady()||!meUid()) return;
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      var isNew=!chatId;
      if(isNew){ var ref=FN.doc(FN.collection(db,'support_chats')); chatId=ref.id; }
      var data={ userId:meUid(), email:meEmail(), category:curCat||'',
        categoryLabel:(CATS.filter(function(c){return c.key===curCat;})[0]||{}).label||'',
        messages:msgs.slice(-40), resolved:(resolved==null?null:!!resolved), updatedAt:now() };
      if(isNew) data.createdAt=now();
      FN.setDoc(FN.doc(db,'support_chats',chatId), data, {merge:true}).catch(function(e){ console.warn('[상담] 기록 실패', e&&e.code); });
    }catch(e){}
  }
  /* v3 개인화 레이어에서도 상담 기록을 남길 수 있도록 노출 */
  window.__caroBotLog = function(resolved, userText, botText){
    try{
      if(userText) msgs.push({role:'user', text:userText, at:now()});
      if(botText)  msgs.push({role:'bot',  text:botText,  at:now()});
      logSave(resolved);
    }catch(e){}
  };
  /* 상담 종료 시 세션 초기화 — 다음 상담은 완전히 새 기록으로 시작
     (Firestore에 이미 저장된 이전 상담은 그대로 보존됨) */
  window.__caroBotReset = function(){
    chatId=null; msgs=[]; curCat=null;
    try{ missCount=0; }catch(e){}
  };

  var st=document.createElement('style');
  st.textContent=
    '#caro-bot{position:fixed;inset:0;z-index:100050;background:#f5f6f8;display:none;flex-direction:column;max-width:480px;margin:0 auto;}'
   +'#caro-bot.show{display:flex;}'
   +'.cbot-hd{display:flex;align-items:center;gap:10px;padding:14px 14px;background:#18191c;color:#fff;flex-shrink:0;}'
   +'.cbot-hd .ic{width:30px;height:30px;border-radius:9px;background:#2e3138;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;}'
   +'.cbot-hd .t{flex:1;font-weight:700;font-size:15px;} .cbot-hd .t small{display:block;font-weight:400;font-size:11px;color:#aab0b8;}'
   +'.cbot-agent{background:#2e3138;border:1px solid #4a4f57;color:#e7e9ec;border-radius:18px;padding:6px 12px;font-size:12px;cursor:pointer;font-family:inherit;white-space:nowrap;}'
   +'.cbot-x{background:none;border:none;color:#cfd3da;font-size:20px;cursor:pointer;padding:0 4px;}'
   +'.cbot-body{flex:1;overflow-y:auto;padding:16px 14px 8px;}'
   +'.cbot-msg{max-width:86%;padding:11px 14px;border-radius:15px;font-size:14px;line-height:1.6;margin-bottom:10px;word-break:break-word;}'
   +'.cbot-bot{background:#fff;color:#18191c;border:1px solid #eceef1;border-top-left-radius:4px;}'
   +'.cbot-me{background:#18191c;color:#fff;margin-left:auto;border-top-right-radius:4px;}'
   +'.cbot-qr{display:flex;flex-wrap:wrap;gap:7px;margin:2px 0 14px;}'
   +'.cbot-qbtn{background:#fff;border:1px solid #d4d6da;color:#18191c;border-radius:20px;padding:8px 14px;font-size:13px;cursor:pointer;font-family:inherit;}'
   +'.cbot-qbtn:active{background:#f0f1f3;}'
   +'.cbot-qbtn.go{background:#18191c;border-color:#18191c;color:#fff;font-weight:700;}'
   +'.cbot-foot{flex-shrink:0;display:flex;gap:8px;padding:10px 12px;background:#fff;border-top:1px solid #eceef1;}'
   +'.cbot-in{flex:1;border:1px solid #dfe1e5;border-radius:22px;padding:10px 15px;font-size:14px;outline:none;font-family:inherit;}'
   +'.cbot-in:focus{border-color:#18191c;}'
   +'.cbot-send{background:#18191c;color:#fff;border:none;border-radius:22px;padding:0 18px;font-size:14px;font-weight:700;cursor:pointer;}';
  (document.head||document.documentElement).appendChild(st);

  var bot=document.createElement('div'); bot.id='caro-bot';
  bot.innerHTML=
    '<div class="cbot-hd"><span class="ic">C</span><span class="t">카로 상담<small>앱 내 자동 상담 · 보통 즉시 응답</small></span>'
    +'<button class="cbot-agent" id="cbot-agent">🙋 상담사 연결</button>'
    +'<button class="cbot-x" id="cbot-x">✕</button></div>'
    +'<div class="cbot-body" id="cbot-body"></div>'
    +'<div class="cbot-foot"><input class="cbot-in" id="cbot-in" placeholder="문의 내용을 입력하세요" autocomplete="off"/><button class="cbot-send" id="cbot-send">전송</button></div>';
  document.body.appendChild(bot);

  var body=bot.querySelector('#cbot-body');
  function scrollDown(){ body.scrollTop=body.scrollHeight; }
  function addBot(html){ var d=document.createElement('div'); d.className='cbot-msg cbot-bot'; d.innerHTML=html; body.appendChild(d); scrollDown(); msgs.push({role:'bot',text:d.textContent,at:now()}); }
  function addMe(text){ var d=document.createElement('div'); d.className='cbot-msg cbot-me'; d.textContent=text; body.appendChild(d); scrollDown(); msgs.push({role:'user',text:text,at:now()}); }
  function quick(btns){ var wrap=document.createElement('div'); wrap.className='cbot-qr';
    btns.forEach(function(b){ var x=document.createElement('button'); x.className='cbot-qbtn'+(b.go?' go':''); x.textContent=b.label; x.onclick=function(){ wrap.remove(); b.onClick(); }; wrap.appendChild(x); });
    body.appendChild(wrap); scrollDown(); }

  function escalate(){
    addBot('상담사에게 연결해 드릴게요. “간편 문의”로 내용을 남겨 주시면 순차적으로 직접 답변드려요. 접수 내역은 안전하게 기록됩니다.');
    logSave(false);
    quick([{label:'📝 간편 문의 접수', go:true, onClick:function(){ try{ close(); if(window.goTo) goTo('inquiry-screen'); }catch(e){} }},
           {label:'카테고리 다시 보기', onClick:showCats}]);
  }
  function askCloseChat(){
    quick([
      {label:'상담 끝내기', go:true, onClick:function(){
          addBot('상담을 종료할게요. 이용해 주셔서 감사합니다 🙂');
          setTimeout(function(){ try{ close(); }catch(e){} }, 900);
      }},
      {label:'더 물어볼게요', onClick:function(){
          addBot('네, 편하게 물어보세요!'); showCats();
      }}
    ]);
  }
  function resolveButtons(){
    quick([{label:'✅ 해결됐어요', onClick:function(){ addMe('해결됐어요'); addBot('도움이 되어 다행이에요! 또 궁금한 점 있으면 언제든 다시 찾아주세요. 🚗'); logSave(true); askCloseChat(); }},
           {label:'🙋 상담사 연결', onClick:function(){ addMe('상담사 연결을 원해요'); escalate(); }}]);
  }
  function showCats(){ curCat=null;
    addBot('어떤 도움이 필요하세요? 아래에서 골라 주시거나, 바로 입력해 주셔도 돼요.');
    quick(CATS.map(function(c){ return {label:c.label, onClick:function(){ pickCat(c.key,c.label); }}; })); }
  function renderCat(key){ var f=FLOW[key]; addBot(f.a); logSave(null);
    if(f.action){ quick([{label:f.action.label, go:true, onClick:function(){ try{ close(); if(window.goTo) goTo(f.action.go);}catch(e){} }},{label:'다른 항목 보기',onClick:showCats}]); }
    if(f.subs&&f.subs.length){ quick(f.subs.map(function(s){ return {label:s.q, onClick:function(){ addMe(s.q); addBot(s.a); logSave(null); resolveButtons(); }}; })); }
    else if(!f.action){ resolveButtons(); } }
  function pickCat(key,label){ curCat=key; addMe(label.replace(/^[^\s]+\s/,'')); renderCat(key); }

  // ── 자유 입력: 공감형 대화 엔진 (의도 인식 → 자연스러운 응대 → 막히면 상담사 연결) ──
  var missCount=0;
  function step(node){
    if(!node) return;
    if(node.say) { addBot(node.say); logSave(null); }
    if(node.go){
      quick([{label:node.goLabel||'바로가기', go:true, onClick:function(){ try{ close(); if(window.goTo) goTo(node.go);}catch(e){} }},
             {label:'🙋 상담사 연결', onClick:function(){ addMe('상담사 연결'); escalate(); }}]);
      return;
    }
    if(node.quick && node.quick.length){
      quick(node.quick.map(function(o){
        return { label:o.label, go:!!o.go, onClick:function(){ addMe(o.label);
          if(o.node) step(o.node);
          else if(o.screen){ try{ close(); if(window.goTo) goTo(o.screen);}catch(e){} }
          else resolveButtons(); } };
      }));
      return;
    }
    if(node.end==='escalate'){ escalate(); return; }
    if(node.end==='none'){ return; }
    resolveButtons();
  }

  var N={
    smell:{ say:'차량 내부 냄새·청결로 불편을 드려 죄송합니다. 🙏 먼저 확인할게요 — 지금 <b>차량 이용은 가능한 상태</b>이신가요?', quick:[
      {label:'이용은 가능해요', node:{say:'알려주셔서 감사해요. 잠깐 환기해 주시고, 가능하면 <b>주행 시작 10분 이내에 내부 사진을 촬영해 접수</b>해 주세요. 이전 이용자 책임으로 확인되면 회원님께 불이익이 없도록 처리하고, 청결 보상도 안내해 드려요.', end:'resolve'}},
      {label:'냄새가 심해 이용이 어려워요', node:{say:'많이 불편하셨겠어요. 이런 경우 <b>차량 교체 또는 예약 취소·환불</b>을 도와드릴 수 있어요. 바로 상담사에게 연결해 확인해 드릴게요.', end:'escalate'}},
      {label:'사진으로 접수할게요', node:{say:'좋아요. 사진은 “간편 문의”에서 이미지와 함께 남겨 주시면 가장 빠르게 처리돼요.', go:'inquiry-screen', goLabel:'📝 간편 문의로 접수'}}
    ]},
    acc:{ say:'사고가 나셨군요. 무엇보다 안전이 우선이에요. 혹시 다친 곳은 없으신가요?', quick:[
      {label:'크게 다치진 않았어요', node:{say:'다행이에요. 침착하게 ① 비상등·삼각대로 안전 확보 ② 차량·번호판·현장 사진 촬영 ③ 사고 접수 순으로 진행해 주세요. 자기부담금은 가입한 면책 상품 기준으로 적용돼요.', go:'accident-screen', goLabel:'사고 접수하기'}},
      {label:'부상자가 있어요', node:{say:'먼저 <b>119</b>에 신고해 안전부터 확보해 주세요. 그다음 사고 접수를 도와드릴게요. 상담사도 함께 연결해 드릴게요.', end:'escalate'}},
      {label:'상대 차량과 접촉했어요', node:{say:'상대 차량 번호·연락처·보험사를 확인하고 현장 사진을 남겨 주세요. 이후 사고 접수에서 진행하시면 돼요.', go:'accident-screen', goLabel:'사고 접수하기'}}
    ]},
    control:{ say:'차량 제어가 안 되면 당황스러우시죠. 바로 도와드릴게요. 어떤 상황에 가까우세요?', quick:[
      {label:'시동이 안 걸려요', node:{say:'브레이크를 <b>끝까지 밟은 채</b> 시동 버튼을 눌러 주세요(전자식 키는 차 안에 있어야 해요). 기어가 P인지도 확인해 주세요.', quick:[
        {label:'그래도 안 돼요', node:{say:'확인했습니다. 차량 점검이 필요하니 상담사에게 바로 연결해 드릴게요.', end:'escalate'}},
        {label:'됐어요!', node:{say:'다행이에요! 안전 운전하세요 🚗', end:'resolve'}}]}},
      {label:'문이 안 열려요 / 안 잠겨요', node:{say:'앱의 <b>차량 제어</b>에서 다시 시도해 주세요. 네트워크가 약하면 1~2분 후 재시도가 도움돼요.', quick:[
        {label:'계속 안 돼요', node:{say:'상담사에게 연결해 빠르게 도와드릴게요.', end:'escalate'}},
        {label:'해결됐어요', node:{say:'좋아요! 즐거운 이용 되세요 🙂', end:'resolve'}}]}}
    ]},
    breakdown:{ say:'주행 중 문제라면 안전이 가장 중요해요. <b>안전한 곳에 정차</b>하고 비상등을 켜 주세요. 지금 안전한 곳에 계신가요?', quick:[
      {label:'네, 안전해요', node:{say:'다행이에요. 차량 증상과 현재 위치를 알려 주시면 긴급출동을 안내해 드릴게요. 바로 상담사에게 연결할게요.', end:'escalate'}},
      {label:'도로 위라 위험해요', node:{say:'우선 가드레일 밖 등 안전한 곳으로 대피하고, 위급하면 <b>112/119</b>에 도움을 요청해 주세요. 동시에 상담사에게 바로 연결해 드릴게요.', end:'escalate'}}
    ]},
    lost:{ say:'차량과 관련해 분실물이 있으시군요. 바로 도와드릴게요. 어느 쪽에 가까우세요?', quick:[
      {label:'내 물건을 두고 내렸어요', node:{say:'분실물은 “간편 문의”에 물건·차량명·이용 시각을 남겨 주시면 차량 확인 후 안내해 드려요.', go:'inquiry-screen', goLabel:'📝 분실물 접수'}},
      {label:'차에서 남의 물건을 발견했어요', node:{say:'알려주셔서 감사해요! 발견하신 물건을 사진과 함께 “간편 문의”로 접수해 주시면 회수 안내를 드릴게요.', go:'inquiry-screen', goLabel:'📝 발견물 접수'}}
    ]},
    ret:{ say:'반납 관련해서 도와드릴게요. 무엇이 궁금하세요?', quick:[
      {label:'반납 장소가 어디예요?', node:{say:'<b>대여했던 카로존(거점)에 그대로 반납</b>하시면 돼요. 지정 주차 구역에 주차한 뒤 앱에서 반납을 완료해 주세요.', end:'resolve'}},
      {label:'반납하는 방법', node:{say:'주차 → 시동 OFF·창문 닫기·라이트 OFF 확인 → 앱에서 <b>반납하기</b> → 정산 확인이면 끝이에요.', end:'resolve'}},
      {label:'반납이 안 돼요', node:{say:'지정 구역 밖이거나 네트워크 문제일 수 있어요. 위치를 확인하고 1~2분 후 재시도해 주세요. 계속되면 바로 연결해 드릴게요.', end:'escalate'}}
    ]},
    extend:{ say:'대여 시간을 연장하고 싶으신 거죠? 다음 예약이 없으면 <b>이용 중 화면에서 연장</b>이 가능해요. 어떤 상황이세요?', quick:[
      {label:'연장하고 싶어요', node:{say:'이용 중 화면의 <b>연장</b> 버튼으로 원하는 시간을 추가하면 돼요. 다음 예약이 있으면 연장이 제한될 수 있어요.', end:'resolve'}},
      {label:'연장이 안 돼요 / 반납이 늦어져요', node:{say:'다음 예약이 잡혀 있으면 연장이 막힐 수 있어요. 지연 시 추가요금·다음 이용자 피해가 생길 수 있으니, 상황을 확인하도록 바로 상담사에게 연결할게요.', end:'escalate'}}
    ]},
    pay:{ say:'결제·요금으로 불편을 드렸다면 죄송해요. 어떤 상황에 가까우세요?', quick:[
      {label:'요금이 많이/이상하게 나왔어요', node:{say:'<b>이용내역</b>에서 상세 정산(주행요금·하이패스·페널티 등)을 확인하실 수 있어요. 특정 건이 이상하면 차량명과 이용 시각을 알려 주시면 확인해 드릴게요.', quick:[
        {label:'확인했는데도 이상해요', node:{say:'정확한 확인이 필요하니 상담사에게 연결해 드릴게요.', end:'escalate'}},
        {label:'확인했어요', node:{say:'도움이 되었길 바라요 🙂', end:'resolve'}}]}},
      {label:'이중/중복 결제됐어요', node:{say:'이중 결제로 보이는 건은 확인 후 환불 처리해 드려요. 바로 상담사에게 연결해 확인할게요.', end:'escalate'}},
      {label:'영수증/세금계산서가 필요해요', node:{say:'이용내역에서 결제 내역을 확인할 수 있어요. 세금계산서·현금영수증은 사업자 정보와 함께 “간편 문의”로 요청해 주세요.', go:'inquiry-screen', goLabel:'📝 요청 남기기'}}
    ]},
    resv:{ say:'예약 변경·취소를 도와드릴게요. 어떤 걸 원하세요?', quick:[
      {label:'예약을 취소하고 싶어요', node:{say:'<b>예약 확인</b>에서 해당 예약을 선택해 취소할 수 있어요. 이용 시작 전 취소 시점에 따라 수수료가 다를 수 있어요.', end:'resolve'}},
      {label:'예약 시간을 바꾸고 싶어요', node:{say:'예약 변경은 차량 여유 상황에 따라 가능해요. 예약 확인에서 시도해 보시고, 안 되면 바로 연결해 드릴게요.', quick:[
        {label:'변경이 안 돼요', node:{say:'상담사에게 연결해 도와드릴게요.', end:'escalate'}},
        {label:'됐어요', node:{say:'좋아요! 🙂', end:'resolve'}}]}},
      {label:'취소 수수료가 궁금해요', node:{say:'취소 수수료는 이용 시작까지 남은 시간에 따라 달라져요. 정확한 금액은 예약 취소 화면에서 안내돼요.', end:'resolve'}}
    ]},
    member:{ say:'회원·가입·인증 관련해서 도와드릴게요. 무엇이 궁금하세요?', quick:[
      {label:'가입/면허 인증 방법', node:{say:'이메일 가입 → 본인 명의 운전면허 등록·인증 → 결제수단 등록이면 이용 준비 완료예요. 면허는 등록 후 운영팀이 확인해요.', end:'resolve'}},
      {label:'이용 자격(나이/경력)', node:{say:'만 21세 이상 + 운전면허 취득 1년 이상 + 본인 명의 결제수단이 필요해요(여객자동차 운수사업법 기준).', end:'resolve'}},
      {label:'로그인/비밀번호 문제', node:{say:'로그인 화면의 “아이디/비밀번호 찾기”에서 가입 이메일로 재설정할 수 있어요.', quick:[
        {label:'그래도 안 돼요', node:{say:'상담사에게 연결해 드릴게요.', end:'escalate'}},
        {label:'해결됐어요', node:{say:'다행이에요 🙂', end:'resolve'}}]}}
    ]},
    app:{ say:'앱이 불편하게 동작했다면 죄송해요. 우선 <b>앱 완전 종료 후 재실행 · 네트워크 확인 · 최신 버전 확인</b>을 시도해볼게요. 증상이 어떤가요?', quick:[
      {label:'앱이 멈추거나 튕겨요', node:{say:'앱을 완전히 종료했다가 다시 열어 주세요. 반복되면 기기 종류와 어떤 화면에서 그런지 알려 주시면 빠르게 확인해 드릴게요.', quick:[
        {label:'계속 그래요', node:{say:'상담사에게 연결해 자세히 확인할게요.', end:'escalate'}},
        {label:'괜찮아졌어요', node:{say:'다행이에요 🙂', end:'resolve'}}]}},
      {label:'지도/위치가 이상해요', node:{say:'위치 권한을 허용해 주시고, 실내 등 GPS가 약한 곳에서는 정확도가 떨어질 수 있어요. 잠시 후 다시 시도해 주세요.', end:'resolve'}},
      {label:'알림이 안 와요', node:{say:'휴대폰 설정에서 카로 앱 <b>알림 권한</b>이 켜져 있는지 확인해 주세요.', end:'resolve'}}
    ]},
    use:{ say:'이용 방법을 안내해 드릴게요. 무엇이 궁금하세요?', quick:[
      {label:'차량 빌리는 방법', node:{say:'지도에서 거점(카로존)을 골라 차량 선택 → 이용 시간 설정 → 결제 → 차량 앞에서 앱으로 문 열기면 출발이에요.', end:'resolve'}},
      {label:'보험/면책이 궁금해요', node:{say:'일반면책(자기부담 30만원)과 기본면책(자기부담 70만원)이 있어요. 예약 시 선택할 수 있고, 사고 시 자기부담금이 달라져요.', end:'resolve'}},
      {label:'월 렌트 / 더 블랙', node:{say:'장기 이용은 <b>월 렌트</b>, 프리미엄 차량은 <b>카로 더 블랙</b>에서 확인하실 수 있어요.', end:'resolve'}}
    ]},
    thanks:{ say:'따뜻한 말씀 감사해요! 😊 더 도와드릴 게 있으면 언제든 편하게 말씀해 주세요.', end:'none'}
  };

  /* v4 검색 레이어가 40개 상세 답변에 접근할 수 있도록 지식베이스 노출 */
  window.__caroBotKB = { CATS: CATS, FLOW: FLOW };

  var INTENTS=[
    {key:'car', test:/냄새|악취|쾌쾌|퀴퀴|찌든|담배|흡연|토|구토|더럽|더러|지저분|청결|얼룩|쓰레기|오염|벌레/, node:N.smell},
    {key:'acc', test:/사고|충돌|박았|박음|들이받|긁힘|긁었|긁힘|접촉|추돌|찌그/, node:N.acc},
    {key:'car', test:/시동|안 ?걸|걸리지|문이? ?안|안 ?열|안 ?잠|스마트키|차키|차 ?키|키가|제어가? ?안|잠금/, node:N.control},
    {key:'car', test:/고장|멈춰 ?섰|서버렸|연기|경고등|타이어|펑크|긴급|출동|배터리|시동꺼|시동 ?꺼|퍼졌/, node:N.breakdown},
    {key:'ret', test:/분실|두고 ?내|놓고 ?내|잃어|놓고 ?왔|두고 ?왔|주웠|발견.*물건|물건.*발견/, node:N.lost},
    {key:'ret', test:/반납/, node:N.ret},
    {key:'ret', test:/연장|더 ?타|시간 ?늘|늦을|늦어|반납 ?늦/, node:N.extend},
    {key:'pay', test:/결제|요금|청구|환불|이중|중복|영수증|세금계산서|정산|비싸|많이 ?나|돈이|과금/, node:N.pay},
    {key:'resv', test:/예약|취소|변경|바꾸|날짜 ?바|시간 ?바/, node:N.resv},
    {key:'member', test:/가입|면허|인증|자격|나이|경력|비밀번호|비번|로그인|아이디|탈퇴|회원/, node:N.member},
    {key:'app', test:/오류|버그|에러|튕|멈춰|하얘|안 ?떠|안떠|안 ?나와|알림|지도|위치|gps|느려|업데이트|화면/, node:N.app},
    {key:'use', test:/이용 ?방법|어떻게.*(이용|빌|타|예약)|카로존|거점|월 ?렌트|장기|더 ?블랙|블랙라벨|보험|면책/, node:N.use},
    {key:null, test:/^\s*(고마|감사|좋아|최고|만족|친절|잘 ?쓰|굿|👍|❤)/, node:N.thanks}
  ];

  function fallbackReply(){
    missCount++;
    if(missCount>=2){
      addBot('제가 정확히 이해하지 못한 것 같아요. 😥 바로 상담사에게 연결해 드릴까요? 아니면 아래 주제 중에서 골라주셔도 좋아요.');
      logSave(null);
      quick([{label:'🙋 상담사 연결', go:true, onClick:function(){ escalate(); }},{label:'주제에서 고르기', onClick:showCats}]);
    } else {
      addBot('조금만 더 자세히 알려주실 수 있을까요? 예) “차량에서 냄새가 나요”, “반납 장소가 어디예요?”, “결제가 이중으로 됐어요”. 아래에서 골라주셔도 돼요.');
      logSave(null);
      showCats();
    }
  }

  function handleInput(){ var inp=bot.querySelector('#cbot-in'); var t=(inp.value||'').trim(); if(!t) return; inp.value='';
    addMe(t);
    if(/상담사|상담원|직원|사람.*연결|연결.*사람|콜센터|전화 ?연결|진짜 ?사람/.test(t)){ escalate(); return; }
    var hit=null;
    for(var i=0;i<INTENTS.length;i++){ if(INTENTS[i].test.test(t)){ hit=INTENTS[i]; break; } }
    if(hit){ missCount=0; if(hit.key) curCat=hit.key; step(hit.node); }
    else { fallbackReply(); }
  }

  function open(){ bot.classList.add('show');
    if(!body.childElementCount){ addBot('안녕하세요, <b>카로 상담</b>입니다 🚗<br>이용 중 궁금하거나 불편한 점을 도와드릴게요. 답이 부족하면 언제든 위의 <b>상담사 연결</b>을 눌러 주세요.'); showCats(); } }
  function close(){ bot.classList.remove('show'); }
  bot.querySelector('#cbot-x').onclick=close;
  bot.querySelector('#cbot-agent').onclick=function(){ addMe('상담사 연결'); escalate(); };
  bot.querySelector('#cbot-send').onclick=handleInput;
  bot.querySelector('#cbot-in').addEventListener('keydown',function(e){ if(e.key==='Enter') handleInput(); });

  function wireEntry(){
    document.querySelectorAll('.cs-chat, #cs-screen button').forEach(function(b){
      if(/채팅 상담|AI 상담/.test(b.textContent) && !b.dataset.caroBot){ b.dataset.caroBot='1'; b.removeAttribute('onclick'); b.textContent='💬 카로 상담'; b.onclick=open; }
    });
  }
  wireEntry(); setTimeout(wireEntry,1500); setTimeout(wireEntry,3000);
  window.caroOpenBot=open;
  console.log('[상담] ✅ CARO 상담봇 v2 (앱 내부 전용 · FAQ 확장 · 상담사 연결 · 기록)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] FAQ 대폭 확장 — 고객센터 '자주 묻는 질문' 탭
   · 검색 + 카테고리 + 다수 Q&A + "답이 없으면 카로 상담" CTA
   · 기존 csToggleFAQ / csd-faq 구조 그대로 사용 (기본 카로 톤)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var DATA=[
    {c:'회원·가입·인증', items:[
      {q:`운전면허는 어떻게 등록·인증하나요?`, a:`가입 시 본인 명의 운전면허증을 등록하면 운영팀이 확인한 뒤 이용이 가능합니다. (면허 진위확인 자동 연동은 준비 중) 면허 정보가 바뀌면 계정관리에서 다시 등록해 주세요.`},
      {q:`해외(외국) 운전면허로도 이용할 수 있나요?`, a:`국내에서 인정되는 유효한 운전면허가 필요합니다. 외국 면허만으로는 이용이 제한될 수 있으니, 이용 전 고객센터로 확인해 주세요.`},
      {q:`비밀번호를 잊어버렸어요.`, a:`로그인 화면의 「아이디·비밀번호 찾기」에서 가입 이메일로 재설정할 수 있습니다.`},
      {q:`회원 탈퇴는 어떻게 하나요?`, a:`계정관리 → 회원 탈퇴에서 가능합니다. 진행 중인 예약이나 미정산 금액이 없어야 탈퇴할 수 있습니다.`}
    ]},
    {c:'예약·이용', items:[
      {q:`지금 바로 즉시 대여할 수 있나요?`, a:`네. 차량 선택 후 시작 시간을 「지금」으로 두면 즉시 대여됩니다. 가까운 카로존의 이용 가능 차량을 바로 빌릴 수 있어요.`},
      {q:`예약을 여러 건 동시에 할 수 있나요?`, a:`이용 중 예약과 별개로 미래 예약을 잡을 수 있습니다. 다만 이용 시간이 서로 겹치는 예약은 불가합니다.`},
      {q:`카로존(CARO ZONE)이 뭔가요?`, a:`카로 차량을 픽업·반납하는 지정 주차 거점입니다. 지도에서 내 주변 카로존과 이용 가능한 차량을 확인할 수 있어요.`},
      {q:`예약한 차량을 못 찾겠어요.`, a:`예약 내역의 지도에서 차량 위치·주차 구역·차량 번호를 확인하세요. 그래도 못 찾으면 차량 번호와 함께 고객센터로 문의해 주세요.`}
    ]},
    {c:'대여 시작·차량 제어', items:[
      {q:`차 문은 어떻게 열고 잠그나요?`, a:`차량 앞에서 앱의 차량 제어로 「열기/잠그기」를 누르면 됩니다. 네트워크가 약하면 1~2분 후 다시 시도해 주세요.`},
      {q:`스마트키(앱 제어)가 작동하지 않아요.`, a:`앱에서 재시도 → 네트워크 확인 → 차량과 가까이에서 시도해 주세요. 계속되면 차량 번호와 함께 문의해 주세요.`},
      {q:`주행 시작 전에 꼭 해야 할 게 있나요?`, a:`이용 시작 후 10분 이내에 차량 외관을 촬영해 두세요. 기존 흠집·오염이 기록되어 책임 분쟁을 예방할 수 있습니다.`},
      {q:`차에 흠집·오염이 있어요.`, a:`주행 시작 10분 이내에 사진을 촬영해 접수하면 이전 이용자 책임으로 확인됩니다. 출발 전에 꼭 확인해 주세요.`}
    ]},
    {c:'운행 중·차량 문제', items:[
      {q:`시동이 걸리지 않아요.`, a:`브레이크를 끝까지 밟고 시동 버튼을 눌러 주세요. 전자식 키는 차 안에 있어야 합니다. 그래도 안 되면 차량 번호·위치와 함께 문의해 주세요.`},
      {q:`하이패스는 어떻게 처리되나요?`, a:`통행료는 회사 카드로 먼저 결제된 뒤 반납 정산 시 합산 청구됩니다. 단말기 미인식 시 통행 영수증을 보관해 주세요.`},
      {q:`주유·전기차 충전은 어떻게 하나요?`, a:`차량에 비치된 주유·충전 카드를 사용하세요. 전기차는 충전 후 케이블을 정리해 주세요. 무료 주행거리 초과분만 정산됩니다.`},
      {q:`주행 중 고장이 났어요. 긴급출동은요?`, a:`안전한 곳에 정차한 뒤 차량 번호·위치와 증상을 알려 주세요. 긴급출동(견인 등)을 안내해 드립니다.`}
    ]},
    {c:'반납·연장', items:[
      {q:`반납은 어디에 어떻게 하나요?`, a:`지정 카로존에 주차 → 앱 「반납하기」 → 분실물·파손 체크 → 정산 결제 → 반납 완료입니다.`},
      {q:`대여했던 곳이 아닌 다른 곳에 반납해도 되나요?`, a:`기본은 대여했던 카로존입니다. 부득이하면 「다른 장소」를 선택해 위치 설명과 사진을 남겨 주세요. 별도 비용이 발생할 수 있습니다.`},
      {q:`이용 시간을 연장하고 싶어요.`, a:`이용 중 「시간 연장」에서 연장할 수 있고, 연장 요금은 즉시 결제됩니다. 반납이 늦어질 것 같으면 미리 연장해 주세요.`},
      {q:`다음 예약이 있으면 연장이 안 되나요?`, a:`바로 다음 예약이 있는 차량은 그 시작 시각까지만 연장됩니다. 더 필요하면 반납 후 다른 차량을 이용해 주세요.`}
    ]},
    {c:'결제·요금', items:[
      {q:`요금은 어떻게 구성되나요?`, a:`예약 시 대여료·보험료가 결제되고, 반납 시 주행요금 + 하이패스 통행료 + (지연 시)패널티가 등록 카드로 정산됩니다.`},
      {q:`주행요금은 어떻게 계산되나요?`, a:`주행거리 중 무료 주행거리를 초과한 부분에 차량별 km당 요금을 곱해 계산됩니다. 차량마다 km요금과 무료거리가 다를 수 있어요.`},
      {q:`결제 카드는 어떻게 등록·변경하나요?`, a:`계정관리 → 결제수단에서 등록·변경할 수 있습니다. 반납 정산은 등록된 카드로 자동 결제됩니다.`},
      {q:`결제가 실패했어요.`, a:`카드 유효기간·한도·잔액을 확인하고 다시 등록해 주세요. 계속되면 결제 시각과 차량 번호를 알려 주세요.`},
      {q:`영수증·세금계산서를 받고 싶어요.`, a:`이용내역에서 결제 내역을 확인할 수 있습니다. 세금계산서·현금영수증은 사업자 정보와 함께 요청해 주세요.`}
    ]},
    {c:'보험·사고', items:[
      {q:`면책 상품(보험)은 어떤 게 있나요?`, a:`일반면책(자기부담 30만원)과 기본면책(자기부담 70만원)이 있습니다. 예약 시 선택한 상품 기준으로 사고 시 자기부담금이 적용됩니다.`},
      {q:`자기부담금이 뭔가요?`, a:`사고 시 가입한 면책 상품 한도 내에서 이용자가 부담하는 금액입니다. 면책 미가입이나 이용 수칙 위반 시 전액을 부담할 수 있습니다.`},
      {q:`휴차보상료가 뭔가요?`, a:`사고·고장으로 차량을 수리하는 동안 운행하지 못한 기간에 대해 청구되는 영업 손실 보상입니다.`}
    ]},
    {c:'월 렌트', items:[
      {q:`월 렌트는 어떻게 신청하나요?`, a:`「월 렌트」 메뉴에서 차량과 기간(1·3·6·9·12개월)을 선택해 신청합니다.`},
      {q:`월 렌트 요금과 주행거리는 어떻게 되나요?`, a:`기간이 길수록 할인율이 커지며, 월 주행거리 한도와 운전자 연령 조건이 적용됩니다. 한도 초과 주행은 별도 정산됩니다.`}
    ]},
    {c:'카로 더 블랙', items:[
      {q:`카로 더 블랙은 무엇인가요?`, a:`프리미엄 차량과 전담 컨시어지를 제공하는 카로의 상위 서비스입니다. 홈의 더 블랙 메뉴에서 확인할 수 있어요.`},
      {q:`더 블랙은 어떻게 이용하나요?`, a:`일반 카로와 별도로 운영되며, 더 블랙 전용 차량을 예약해 이용합니다.`}
    ]},
    {c:'앱·기타', items:[
      {q:`앱이 자꾸 오류가 나요.`, a:`앱 완전 종료 후 재실행 → 네트워크 확인 → 최신 버전 업데이트 순으로 시도해 주세요. 계속되면 기기와 증상을 알려 주세요.`},
      {q:`로그인이 안 돼요.`, a:`이메일·비밀번호를 확인하고, 비밀번호는 「찾기」로 재설정해 주세요.`},
      {q:`위치(지도)가 정확하지 않아요.`, a:`휴대폰 위치 권한을 허용해 주세요. 실내·지하 등에서는 GPS 정확도가 떨어질 수 있습니다.`},
      {q:`알림이 오지 않아요.`, a:`휴대폰 설정에서 카로 앱 알림 권한이 켜져 있는지 확인해 주세요.`}
    ]}
  ];

  var st=document.createElement('style');
  st.textContent=
    '.caro-faq-search{display:flex;align-items:center;gap:8px;margin:0 0 14px;padding:11px 14px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:var(--r,12px);}'
   +'.caro-faq-search input{flex:1;border:none;background:none;outline:none;font-family:var(--font);font-size:.85rem;color:var(--text-1);}'
   +'.caro-faq-search .ic{color:var(--text-m);font-size:.9rem;}'
   +'.caro-faq-cat{margin:18px 0 8px;font-family:var(--font);font-size:.72rem;font-weight:700;letter-spacing:.1em;color:var(--text-m);display:flex;align-items:center;gap:8px;}'
   +'.caro-faq-cat::before{content:"";width:14px;height:2px;background:var(--accent);border-radius:2px;}'
   +'.caro-faq-none{display:none;text-align:center;color:var(--text-m);font-size:.82rem;padding:24px 0;}'
   +'.caro-faq-cta{margin:22px 0 8px;padding:16px;background:rgba(255,255,255,.05);border:1px solid var(--border);border-radius:var(--r,12px);text-align:center;}'
   +'.caro-faq-cta p{margin:0 0 12px;font-size:.84rem;color:var(--text-2);line-height:1.6;}'
   +'.caro-faq-cta button{width:100%;padding:13px;background:var(--accent);color:#e2e6ea;border:none;border-radius:var(--r,12px);font-family:var(--font);font-weight:700;font-size:.88rem;cursor:pointer;}';
  (document.head||document.documentElement).appendChild(st);

  function itemHTML(q,a){
    return '<div class="csd-faq-item">'
      +'<button class="csd-faq-q" onclick="csToggleFAQ(this)"><span class="csd-q-mark">Q</span><span class="csd-faq-text">'+q+'</span><span class="csd-faq-arr">∨</span></button>'
      +'<div class="csd-faq-a"><div class="csd-faq-a-inner">'+a+'</div></div></div>';
  }
  function buildFaq(){
    var pane=document.getElementById('cs-pane-faq');
    if(!pane || pane.dataset.caroFaq) return;
    pane.dataset.caroFaq='1';

    var firstExisting=pane.firstElementChild;
    // 기존 7개 항목 위에 "자주 찾는 질문" 헤더
    var head0=document.createElement('div'); head0.className='caro-faq-cat'; head0.textContent='자주 찾는 질문';
    pane.insertBefore(head0, firstExisting);
    // 검색창 (맨 위)
    var search=document.createElement('div'); search.className='caro-faq-search';
    search.innerHTML='<span class="ic">🔍</span><input type="text" placeholder="궁금한 내용을 검색하세요 (예: 반납, 사고, 요금)"/>';
    pane.insertBefore(search, head0);

    // 카테고리별 항목 추가
    var frag=document.createElement('div');
    DATA.forEach(function(cat){
      var h='<div class="caro-faq-cat">'+cat.c+'</div>';
      cat.items.forEach(function(it){ h+=itemHTML(it.q,it.a); });
      frag.insertAdjacentHTML('beforeend', h);
    });
    // CTA
    frag.insertAdjacentHTML('beforeend',
      '<div class="caro-faq-none">검색 결과가 없어요. 아래 「카로 상담」으로 물어보세요.</div>'
      +'<div class="caro-faq-cta"><p>원하는 답을 찾지 못하셨나요?<br>카로 상담으로 바로 물어보거나 상담사에게 연결해 드려요.</p>'
      +'<button id="caro-faq-ask">💬 카로 상담 열기</button></div>');
    while(frag.firstChild){ pane.appendChild(frag.firstChild); }

    var noneEl=pane.querySelector('.caro-faq-none');
    var inp=search.querySelector('input');
    inp.addEventListener('input', function(){
      var q=(this.value||'').trim().toLowerCase(); var anyVisible=false;
      pane.querySelectorAll('.csd-faq-item').forEach(function(it){
        var show=(!q || it.textContent.toLowerCase().indexOf(q)>=0);
        it.style.display=show?'':'none'; if(show) anyVisible=true;
      });
      pane.querySelectorAll('.caro-faq-cat').forEach(function(hd){
        var any=false,n=hd.nextElementSibling;
        while(n && !n.classList.contains('caro-faq-cat') && !n.classList.contains('caro-faq-none')){
          if(n.classList.contains('csd-faq-item') && n.style.display!=='none'){ any=true; break; }
          n=n.nextElementSibling;
        }
        hd.style.display=any?'':'none';
      });
      if(noneEl) noneEl.style.display=(q && !anyVisible)?'block':'none';
    });

    var askBtn=pane.querySelector('#caro-faq-ask');
    if(askBtn) askBtn.onclick=function(){ try{ if(window.caroOpenBot) window.caroOpenBot(); else if(window.goTo) goTo('chat-screen'); }catch(e){} };
  }
  buildFaq(); setTimeout(buildFaq,1200); setTimeout(buildFaq,2500);
  document.addEventListener('click', function(e){
    var t=e.target.closest && e.target.closest('[onclick*="csSwitchTab"]');
    if(t) setTimeout(buildFaq,60);
  }, true);
  console.log('[FAQ] ✅ 자주 묻는 질문 확장 ('+DATA.reduce(function(n,c){return n+c.items.length;},0)+'개 추가 · 검색 · 카테고리 · 상담 연결)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 차량 예약 화면 — 지도 여백 제거 + 차종 필터(우측 상단)
   · 지도(#caro-map)를 차량목록 바로 위까지 꽉 채워 빈 공간 제거
   · 지도 우측 상단에 차종 칩(전체/경차/소형/중형/대형/SUV)
   · renderCars 결과를 선택 차종으로 필터(이름 기반 분류)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  window.caroCatFilter = window.caroCatFilter || '전체';
  var CATS = ['전체','경차','소형','중형','대형','SUV'];

  function classify(name){
    var n = String(name||'');
    if(/모닝|레이|스파크|캐스퍼/.test(n)) return '경차';
    if(/코나|셀토스|투싼|스포티지|쏘렌토|싼타페|팰리세이드|티볼리|트랙스|트레일블레이저|QM6|니로|쏘울|베뉴|코란도|렉스턴|EV6|아이오닉\s*5|모하비|토레스/.test(n)) return 'SUV';
    if(/카니발|스타리아|그랜저|K8|K9|K7|G80|G90|EQ900|제네시스|스팅어|SM7|체어맨|아슬란/.test(n)) return '대형';
    if(/쏘나타|K5|말리부|SM6|아이오닉\s*6|스텔라/.test(n)) return '중형';
    if(/엑센트|프라이드|베르나|리오|클릭|아반떼|K3|i30|모닝세단|레이밴/.test(n)) return '소형';
    return '기타';
  }

  function applyCarFilter(){
    var f = window.caroCatFilter || '전체';
    var items = document.querySelectorAll('#car-list .car-item');
    var shown = 0;
    items.forEach(function(it){
      var nmEl = it.querySelector('.car-name');
      var nm = nmEl ? nmEl.textContent : '';
      var c = classify(nm);
      var show = (f === '전체') || (c === f);
      it.style.display = show ? '' : 'none';
      if(show) shown++;
    });
    var cnt = document.getElementById('car-sheet-count');
    if(cnt && f !== '전체') cnt.setAttribute('data-filtered', f+' '+shown+'대');
    // 필터 칩 활성 표시
    document.querySelectorAll('.caro-catchip').forEach(function(ch){
      ch.classList.toggle('on', ch.dataset.cat === f);
    });
    // 빈 상태 안내
    var empty = document.getElementById('caro-cat-empty');
    if(empty) empty.style.display = (shown===0 && f!=='전체') ? 'block' : 'none';
  }
  window.caroApplyCarFilter = applyCarFilter;

  // renderCars 래핑 → 그릴 때마다 필터 재적용
  if(typeof window.renderCars === 'function' && !window.renderCars.__caroWrapped){
    var _rc = window.renderCars;
    window.renderCars = function(){ var r; try{ r=_rc.apply(this,arguments);}catch(e){} try{ applyCarFilter(); }catch(e){} return r; };
    window.renderCars.__caroWrapped = true;
  }

  // ── CSS: 지도 꽉 채우기 + 칩 ──
  var st=document.createElement('style'); st.id='caro-rental-css';
  st.textContent=
    '#rental-screen{position:relative;}'
   +'#caro-map{position:absolute!important;top:52px!important;left:0!important;right:0!important;bottom:0!important;height:auto!important;}'
   +'.car-bottom-strip{z-index:20;}'
   +'.caro-catbar{position:absolute;top:62px;right:10px;z-index:25;display:flex;flex-direction:column;gap:6px;align-items:flex-end;}'
   +'.caro-catchip{background:rgba(255,255,255,.96);border:1px solid rgba(0,0,0,.12);color:#18191c;border-radius:18px;padding:6px 13px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,.15);white-space:nowrap;transition:all .15s;}'
   +'.caro-catchip.on{background:#18191c;border-color:#18191c;color:#fff;}'
   +'.caro-catchip:active{transform:scale(.96);}'
   +'#caro-cat-empty{display:none;text-align:center;color:#888d98;font-size:.85rem;padding:18px 12px;}';
  (document.head||document.documentElement).appendChild(st);

  function mountFilter(){
    var screen = document.getElementById('rental-screen');
    if(!screen) return;
    if(!document.querySelector('.caro-catbar')){
      var bar=document.createElement('div'); bar.className='caro-catbar';
      CATS.forEach(function(c){
        var b=document.createElement('button'); b.className='caro-catchip'+(c===window.caroCatFilter?' on':''); b.dataset.cat=c; b.textContent=c;
        b.onclick=function(){ window.caroCatFilter=c; applyCarFilter(); };
        bar.appendChild(b);
      });
      screen.appendChild(bar);
    }
    // 빈 상태 안내(목록 안)
    var list=document.getElementById('car-list');
    if(list && !document.getElementById('caro-cat-empty')){
      var e=document.createElement('div'); e.id='caro-cat-empty'; e.textContent='이 차종은 현재 표시할 차량이 없어요.';
      list.parentNode.insertBefore(e, list.nextSibling);
    }
    // 지도 크기 갱신(여백 방지)
    try{ if(window.caroMap && window.caroMap.invalidateSize){ setTimeout(function(){ window.caroMap.invalidateSize(); },120); setTimeout(function(){ window.caroMap.invalidateSize(); },450); } }catch(e){}
    applyCarFilter();
  }

  // goTo 래핑 → 예약 화면 진입 시 필터 마운트 + 지도 갱신
  if(typeof window.goTo === 'function' && !window.goTo.__caroRentalWrapped){
    var _goTo = window.goTo;
    window.goTo = function(id){ var r=_goTo.apply(this,arguments); if(id==='rental-screen'){ setTimeout(mountFilter,60); setTimeout(mountFilter,400); } return r; };
    window.goTo.__caroRentalWrapped = true;
  }
  // 최초 1회(이미 예약 화면일 수도)
  setTimeout(mountFilter, 800);
  console.log('[예약화면] ✅ 지도 여백 제거 + 차종 필터(전체/경차/소형/중형/대형/SUV)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 지도 → 카카오맵(Kakao Maps) 전환
   · Leaflet/OSM 대신 카카오맵 사용 (한국 도로·상호·라벨 정확)
   · 마커(일반차/점검/대여), 카로 더 블랙(BL) 마커, 범위 필터, 줌 포팅
   · SDK 로드 실패/도메인 미등록 등 문제 시 기존 Leaflet 지도로 자동 폴백
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var _origInitMap      = window.initMap;
  var _origUpdateMarkers= window.updateMapMarkers;
  var _origBottomSheet  = window.initCarBottomSheet;
  var _origInBounds     = window.isCarInMapBounds;

  var KCar=[], KBL=[], infoWin=null, building=false, sdkRetry=0;

  function clearArr(arr){ arr.forEach(function(o){ try{o.setMap(null);}catch(e){} }); arr.length=0; }
  function isMaintCar(car){ try{ if(typeof window.isMaint==='function') return !!window.isMaint(car); }catch(e){} return !!car.devDisabled; }

  function dotHTML(col,label,dark){
    return '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">'
      +'<svg width="30" height="38" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="93" rx="12" ry="3" fill="#3a3e46" opacity="0.25"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#a2aab6" transform="translate(1,1)"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#f4f7fa" stroke="'+col+'" stroke-width="3"/><path d="M50 26A14 14 0 1 0 50 50" fill="none" stroke="#18191c" stroke-width="7" stroke-linecap="round"/></svg>'
      +'<div style="font-size:9px;font-weight:700;color:'+(dark?'#fff':col)+';background:'+(dark?'rgba(0,0,0,.75)':'rgba(255,255,255,.9)')+';padding:1px 4px;border-radius:14px;white-space:nowrap;">'+label+'</div>'
      +'</div>';
  }

  function addMarker(lat,lng,html,popup,arr){
    var kakao=window.kakao; if(!kakao||!kakao.maps) return;
    var pos=new kakao.maps.LatLng(lat,lng);
    var el=document.createElement('div'); el.innerHTML=html; el.style.cursor='pointer';
    var ov=new kakao.maps.CustomOverlay({position:pos,content:el,yAnchor:0.5,xAnchor:0.5,clickable:true});
    ov.setMap(window.caroMap); arr.push(ov);
    if(popup){
      el.addEventListener('click',function(ev){ ev.stopPropagation();
        try{ if(!infoWin) infoWin=new kakao.maps.InfoWindow({removable:true});
          infoWin.setContent('<div style="padding:8px 11px;font-size:12px;line-height:1.55;min-width:130px;">'+popup+'</div>');
          infoWin.setPosition(pos); infoWin.open(window.caroMap);
        }catch(e){}
      });
    }
  }

  function buildReservedMap(){
    var now=new Date(), rm={};
    (window.myReservations||[]).forEach(function(r){
      if(r.start && r.end){
        if(!r.returned){ rm[r.car.id]={until:null}; }
        else if(r.returnedAt){ var rtr=new Date(r.returnedAt.getTime()+600000); if(now<rtr && !rm[r.car.id]) rm[r.car.id]={until:rtr}; }
      }
    });
    return rm;
  }

  function fallbackLeaflet(){
    console.warn('[지도] 카카오맵 사용 불가 → 기존 지도(OSM)로 폴백');
    window.initMap=_origInitMap; window.updateMapMarkers=_origUpdateMarkers;
    window.initCarBottomSheet=_origBottomSheet; window.isCarInMapBounds=_origInBounds;
    try{ if(_origInitMap) _origInitMap(); }catch(e){}
  }

  function buildKakaoMap(){
    if(building || (window.caroMap && window.caroMap.__kakao)) return;
    building=true;
    var kakao=window.kakao, el=document.getElementById('caro-map');
    if(!el){ building=false; return; }
    try{
      var map=new kakao.maps.Map(el,{center:new kakao.maps.LatLng(37.4150,126.6820),level:7});
      map.__kakao=true;
      map.invalidateSize=function(){ try{ this.relayout(); }catch(e){} }; // Leaflet 호환 shim
      // 줌 컨트롤 제거 — 핀치 줌만 사용 (모바일)
      window.caroMap=map; window.caroMapReady=true;
      kakao.maps.event.addListener(map,'idle',function(){
        try{ if(window.renderCars) window.renderCars(); if(window.updateCarSheetCount) window.updateCarSheetCount(); }catch(e){}
      });
      setTimeout(function(){ try{map.relayout();}catch(e){} },80);
      setTimeout(function(){ try{map.relayout();}catch(e){} },450);
      try{ window.updateMapMarkers(); }catch(e){}
      try{ window.initCarBottomSheet(); }catch(e){}
      try{ if(window.renderCars) window.renderCars(); }catch(e){}
      console.log('[지도] ✅ 카카오맵 적용 완료');
    }catch(e){ building=false; console.warn('[지도] 카카오맵 생성 실패',e); fallbackLeaflet(); }
  }

  // ── initMap 교체 ──
  window.initMap=function(){
    if(window.caroMap && window.caroMap.__kakao){
      try{ window.caroMap.relayout(); }catch(e){}
      try{ window.updateMapMarkers(); window.initCarBottomSheet(); }catch(e){}
      return;
    }
    var kakao=window.kakao;
    if(kakao && kakao.maps && kakao.maps.Map){ buildKakaoMap(); return; }
    if(kakao && kakao.maps && kakao.maps.load){ kakao.maps.load(function(){ buildKakaoMap(); }); return; }
    if(sdkRetry<24){ sdkRetry++; setTimeout(window.initMap,250); return; } // SDK 스크립트 로딩 대기
    fallbackLeaflet();
  };

  // ── updateMapMarkers 교체 (일반 차량) ──
  window.updateMapMarkers=function(){
    if(!window.caroMap || !window.caroMap.__kakao){ return _origUpdateMarkers? _origUpdateMarkers.apply(this,arguments): undefined; }
    if(!window.kakao||!window.kakao.maps) return;
    clearArr(KCar);
    var rm=buildReservedMap();
    (window.CARS_DATA||[]).forEach(function(car){
      var res=rm[car.id], maint=isMaintCar(car);
      var available=car.status==='available'&&!maint&&!res;
      var col=available?'#1d7a3a':(maint?'#e07b00':'#b23a3a');
      var label=available?'이용가능':(maint?'점검중':'대여중');
      var nm=(window.getCarName?window.getCarName(car):car.name);
      var popup='<b>'+nm+'</b><br>'+car.fuel+' · '+car.pricePerHour.toLocaleString()+'원/h<br><span style="color:'+col+';font-weight:700;">'+label+'</span>';
      addMarker(car.lat,car.lng,dotHTML(col,label,false),popup,KCar);
    });
  };

  // ── initCarBottomSheet 교체 (카로 더 블랙 마커 + 카운트) ──
  window.initCarBottomSheet=function(){
    if(!window.caroMap || !window.caroMap.__kakao){ return _origBottomSheet? _origBottomSheet.apply(this,arguments): undefined; }
    try{ if(window.updateCarSheetCount) window.updateCarSheetCount(); }catch(e){}
    if(!window.kakao||!window.kakao.maps) return;
    clearArr(KBL);
    (window.BL_CARS||[]).forEach(function(car){
      var popup='<b>⭐ '+car.name+'</b><br>'+car.fuel+' · '+car.pricePerHour.toLocaleString()+'원/h<br><span style="color:#c8a96e;font-weight:700;">CARO THE BLACK</span>';
      addMarker(car.lat,car.lng,dotHTML('#c8a96e','BL',true),popup,KBL);
    });
  };

  // ── isCarInMapBounds 교체 (카카오 범위 판별) ──
  window.isCarInMapBounds=function(car){
    var map=window.caroMap;
    if(!map || !window.caroMapReady) return true;
    if(map.__kakao){ try{ return map.getBounds().contain(new window.kakao.maps.LatLng(car.lat,car.lng)); }catch(e){ return true; } }
    return _origInBounds? _origInBounds(car) : true;
  };

  console.log('[지도] 카카오맵 전환 모듈 로드 (실패 시 OSM 폴백)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 차종 필터 → 버튼 + 반화면 시트 (차종별 차량 배치)
   · 우측 상단 칩들 → 단일 "차종" 버튼으로 교체
   · 버튼 누르면 화면 절반을 덮는 바텀시트가 올라옴
   · 시트 안에서 차종(경차/소형/중형/대형/SUV)별로 등록 차량을 섹션 배치
   · 차종 칩 선택 시 하단 목록 필터도 동기화 / 시트에서 바로 예약
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var CATS=['전체','경차','소형','중형','대형','SUV'];
  var GROUPS=['경차','소형','중형','대형','SUV'];

  function classify(name){
    var n=String(name||'');
    if(/모닝|레이|스파크|캐스퍼/.test(n)) return '경차';
    if(/코나|셀토스|투싼|스포티지|쏘렌토|싼타페|팰리세이드|티볼리|트랙스|트레일블레이저|QM6|니로|쏘울|베뉴|코란도|렉스턴|EV6|아이오닉\s*5|모하비|토레스/.test(n)) return 'SUV';
    if(/카니발|스타리아|그랜저|K8|K9|K7|G80|G90|EQ900|제네시스|스팅어|SM7|체어맨|아슬란/.test(n)) return '대형';
    if(/쏘나타|K5|말리부|SM6|아이오닉\s*6|스텔라/.test(n)) return '중형';
    if(/엑센트|프라이드|베르나|리오|클릭|아반떼|K3|i30/.test(n)) return '소형';
    return '기타';
  }
  function curF(){ return window.caroCatFilter||'전체'; }
  function nm(car){ return window.getCarName?window.getCarName(car):car.name; }
  function isMaintCar(car){ try{ if(typeof window.isMaint==='function') return !!window.isMaint(car); }catch(e){} return !!car.devDisabled; }
  function isReservedNow(car){
    var now=new Date(), hit=false;
    (window.myReservations||[]).forEach(function(r){
      if(!r.car || r.car.id!==car.id || !r.start || !r.end) return;
      if(!r.returned){ hit=true; }
      else if(r.returnedAt){ if(now < new Date(r.returnedAt.getTime()+600000)) hit=true; }
    });
    return hit;
  }

  // ── CSS ──
  var st=document.createElement('style'); st.id='caro-catsheet-css';
  st.textContent=
    '.caro-catbar{display:none!important;}' /* 기존 칩 숨김 */
   +'.caro-cat-btn{position:absolute;top:62px;right:10px;z-index:25;background:#18191c;color:#fff;border:none;border-radius:20px;padding:9px 15px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;box-shadow:0 3px 12px rgba(0,0,0,.28);display:flex;align-items:center;gap:6px;}'
   +'.caro-cat-btn:active{transform:scale(.97);}'
   +'.caro-cat-btn .ic{font-size:15px;line-height:1;}'
   +'.caro-cat-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.35);z-index:45;opacity:0;pointer-events:none;transition:opacity .2s;}'
   +'.caro-cat-backdrop.open{opacity:1;pointer-events:auto;}'
   +'.caro-cat-sheet{position:absolute;left:0;right:0;bottom:0;height:52vh;z-index:46;background:#fff;border-radius:18px 18px 0 0;box-shadow:0 -6px 28px rgba(0,0,0,.25);transform:translateY(110%);transition:transform .26s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;}'
   +'.caro-cat-sheet.open{transform:translateY(0);}'
   +'.ccs-grip{width:38px;height:4px;background:#d4d7dd;border-radius:3px;margin:8px auto 4px;}'
   +'.ccs-head{display:flex;align-items:center;justify-content:space-between;padding:4px 16px 6px;}'
   +'.ccs-title{font-size:1rem;font-weight:800;color:#18191c;}'
   +'.ccs-x{background:none;border:none;font-size:1.2rem;color:#888d98;cursor:pointer;line-height:1;padding:4px;}'
   +'.ccs-chips{display:flex;gap:7px;overflow-x:auto;padding:2px 16px 10px;scrollbar-width:none;}'
   +'.ccs-chips::-webkit-scrollbar{display:none;}'
   +'.ccs-chip{flex:0 0 auto;background:#f1f2f4;border:none;color:#44474f;border-radius:16px;padding:6px 14px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;white-space:nowrap;}'
   +'.ccs-chip.on{background:#18191c;color:#fff;}'
   +'.ccs-list{flex:1;overflow-y:auto;padding:2px 12px 18px;}'
   +'.ccs-sec{font-size:.8rem;font-weight:800;color:#888d98;margin:12px 6px 7px;}'
   +'.ccs-car{display:flex;align-items:center;gap:11px;padding:9px;border:1px solid rgba(0,0,0,.07);border-radius:13px;margin-bottom:8px;background:#fff;}'
   +'.ccs-thumb{width:62px;height:42px;object-fit:contain;border-radius:8px;background:#f5f6f8;flex:0 0 auto;}'
   +'.ccs-info{flex:1;min-width:0;}'
   +'.ccs-name{font-size:.92rem;font-weight:700;color:#18191c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
   +'.ccs-meta{font-size:.82rem;color:#44474f;margin-top:3px;display:flex;align-items:center;gap:7px;}'
   +'.ccs-badge{font-size:.7rem;font-weight:700;padding:1px 7px;border-radius:10px;}'
   +'.ccs-badge.on{background:#e6f4ec;color:#1d7a3a;}.ccs-badge.off{background:#f0e3e1;color:#b23a3a;}'
   +'.ccs-rent{flex:0 0 auto;background:#18191c;color:#fff;border:none;border-radius:16px;padding:8px 15px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;}'
   +'.ccs-rent:disabled{background:#d4d7dd;}'
   +'.ccs-empty{text-align:center;color:#888d98;padding:34px 12px;font-size:.88rem;}';
  (document.head||document.documentElement).appendChild(st);

  function openSheet(){ ensureCatUI(); renderChips(); renderList();
    var bd=document.querySelector('.caro-cat-backdrop'), sh=document.querySelector('.caro-cat-sheet');
    if(bd) bd.classList.add('open'); if(sh) sh.classList.add('open'); }
  function closeSheet(){
    var bd=document.querySelector('.caro-cat-backdrop'), sh=document.querySelector('.caro-cat-sheet');
    if(bd) bd.classList.remove('open'); if(sh) sh.classList.remove('open'); }

  function setFilter(c){
    window.caroCatFilter=c;
    try{ if(window.caroApplyCarFilter) window.caroApplyCarFilter(); }catch(e){}
    renderChips(); renderList(); updateBtnLabel();
  }
  function updateBtnLabel(){
    var lbl=document.querySelector('.caro-cat-btn .ccs-btn-lbl');
    if(lbl) lbl.textContent = (curF()==='전체') ? '차종' : '차종 · '+curF();
  }

  function renderChips(){
    var box=document.getElementById('ccsChips'); if(!box) return;
    box.innerHTML='';
    CATS.forEach(function(c){
      var b=document.createElement('button'); b.className='ccs-chip'+(c===curF()?' on':''); b.textContent=c;
      b.onclick=function(){ setFilter(c); }; box.appendChild(b);
    });
  }
  function carRow(car){
    var s=window.caroCarState?window.caroCarState(car):{ok:car.status==='available',label:car.status==='available'?'이용 가능':'대여중',cls:'rented'};
    var price=(car.pricePerHour||0).toLocaleString();
    var btn=s.ok?'<button class="ccs-rent" data-id="'+car.id+'">예약</button>':'<button class="ccs-rent" disabled>'+(s.cls==='maint'?'점검중':'대여중')+'</button>';
    return '<div class="ccs-car'+(s.ok?'':' busy')+'">'
      +'<img class="ccs-thumb" src="'+car.img+'" alt=""/>'
      +'<div class="ccs-info"><div class="ccs-name">'+nm(car)+'</div>'
      +'<div class="ccs-meta"><span class="ccs-badge '+(s.ok?'on':s.cls)+'">'+s.label+'</span><span><strong>'+price+'원</strong>/h</span></div></div>'
      +btn
      +'</div>';
  }
  function renderList(){
    var box=document.getElementById('ccsList'); if(!box) return;
    var f=curF(), cars=(window.CARS_DATA||[]), html='';
    if(f==='전체'){
      GROUPS.concat('기타').forEach(function(g){
        var arr=cars.filter(function(c){ return classify(nm(c))===g; });
        if(arr.length) html+='<div class="ccs-sec">'+g+' ('+arr.length+'대)</div>'+arr.map(carRow).join('');
      });
      if(!html) html='<div class="ccs-empty">등록된 차량이 없어요.</div>';
    } else {
      var arr=cars.filter(function(c){ return classify(nm(c))===f; });
      html = arr.length ? arr.map(carRow).join('') : '<div class="ccs-empty">'+f+' 차량이 아직 없어요.</div>';
    }
    box.innerHTML=html;
    box.querySelectorAll('.ccs-rent[data-id]').forEach(function(b){
      b.onclick=function(){ var id=parseInt(b.getAttribute('data-id'),10); closeSheet(); try{ if(window.selectCar) window.selectCar(id); }catch(e){} };
    });
  }

  function ensureCatUI(){
    var screen=document.getElementById('rental-screen'); if(!screen) return;
    if(!screen.querySelector('.caro-cat-btn')){
      var btn=document.createElement('button'); btn.className='caro-cat-btn';
      btn.innerHTML='<span class="ic">☰</span><span class="ccs-btn-lbl">차종</span>';
      btn.onclick=openSheet; screen.appendChild(btn);
    }
    if(!screen.querySelector('.caro-cat-sheet')){
      var bd=document.createElement('div'); bd.className='caro-cat-backdrop'; bd.onclick=closeSheet; screen.appendChild(bd);
      var sh=document.createElement('div'); sh.className='caro-cat-sheet';
      sh.innerHTML='<div class="ccs-grip"></div>'
        +'<div class="ccs-head"><span class="ccs-title">차종별 차량</span><button class="ccs-x" type="button">✕</button></div>'
        +'<div class="ccs-chips" id="ccsChips"></div><div class="ccs-list" id="ccsList"></div>';
      screen.appendChild(sh);
      sh.querySelector('.ccs-x').onclick=closeSheet;
    }
    updateBtnLabel();
  }

  // goTo 추가 래핑(이전 래퍼 보존) → 예약 화면 진입 시 버튼/시트 보장
  if(typeof window.goTo==='function' && !window.goTo.__caroCatSheetWrapped){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='rental-screen'){ setTimeout(ensureCatUI,80); setTimeout(ensureCatUI,500); } return r; };
    window.goTo.__caroCatSheetWrapped=true; window.goTo.__caroRentalWrapped=true;
  }
  setTimeout(ensureCatUI, 900);
  window.caroOpenCatSheet=openSheet;
  console.log('[예약화면] ✅ 차종 버튼 + 반화면 시트(차종별 차량 배치)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 차량 거점(존) 정리 — 구월동 / 송도 두 곳으로 모으기
   · 구월동 차량(region '구월동') → 인천문화예술회관 공영주차장
   · 송도 차량(region '송도')   → 송도1 공영주차장
   · 카카오 지오코딩으로 주소→좌표 정확히 (실패 시 근사 좌표 폴백)
   · 같은 거점 차량은 주차장 위에 ~25~50m 살짝 흩어 핀이 다 보이게
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var ZONES={
    '구월동':{ name:'구월동 거점', addr:'인천 남동구 구월동 1408-2', lat:37.4476, lng:126.7007 },
    '송도':  { name:'송도 거점',   addr:'인천 연수구 송도동 9-9',   lat:37.3846, lng:126.6500 },
    '동인천':{ name:'동인천 거점', addr:'인천 중구 제물량로 307',   lat:37.4762, lng:126.6188 },
    '부평':  { name:'부평 거점',   addr:'인천 부평구 광장로 16',    lat:37.4893, lng:126.7235 }
  };

  function jitter(id){
    return { dlat:0, dlng:0 }; // 흩어짐 없음 — 거점 정중앙으로 모음
  }
  function nearestZone(car){
    var best=null,bd=Infinity;
    Object.keys(ZONES).forEach(function(z){
      var dx=car.lat-ZONES[z].lat, dy=car.lng-ZONES[z].lng, d=dx*dx+dy*dy;
      if(d<bd){ bd=d; best=z; }
    });
    return best;
  }
  function snapCar(car){
    if(!car || typeof car.lat!=='number' || typeof car.lng!=='number') return;
    var z=(car.region && ZONES[car.region]) ? car.region : nearestZone(car);
    if(!z) return;
    var j=jitter(car.id||0);
    car.lat=ZONES[z].lat + j.dlat;
    car.lng=ZONES[z].lng + j.dlng;
  }
  function snapAll(){ try{ (window.CARS_DATA||[]).forEach(snapCar); }catch(e){} }
  function snapBL(){ try{ (window.BL_CARS||[]).forEach(snapCar); }catch(e){} }

  // 향후 차량 추가/이동도 거점에 모이도록 INCHEON_AREAS 갱신(있으면)
  function applyToAreas(){
    try{
      if(!window.INCHEON_AREAS) return;
      ['구월동','송도','동인천','부평'].forEach(function(z){
        if(window.INCHEON_AREAS[z]){
          window.INCHEON_AREAS[z].lat=ZONES[z].lat;
          window.INCHEON_AREAS[z].lng=ZONES[z].lng;
          window.INCHEON_AREAS[z].spread=0.0004; // ~40m 만 흩어짐
        }
      });
    }catch(e){}
  }
  applyToAreas();

  // 지도 함수 래핑 → 항상 거점으로 스냅 후 동작 (와드는 하단 전용 모듈이 처리)
  if(typeof window.updateMapMarkers==='function' && !window.updateMapMarkers.__caroZone){
    var _um=window.updateMapMarkers;
    window.updateMapMarkers=function(){ snapAll(); return _um.apply(this,arguments); };
    window.updateMapMarkers.__caroZone=true;
  }
  if(typeof window.initCarBottomSheet==='function' && !window.initCarBottomSheet.__caroZone){
    var _cb=window.initCarBottomSheet;
    window.initCarBottomSheet=function(){ snapAll(); snapBL(); return _cb.apply(this,arguments); };
    window.initCarBottomSheet.__caroZone=true;
  }
  if(typeof window.isCarInMapBounds==='function' && !window.isCarInMapBounds.__caroZone){
    var _ib=window.isCarInMapBounds;
    window.isCarInMapBounds=function(car){ snapCar(car); return _ib.apply(this,arguments); };
    window.isCarInMapBounds.__caroZone=true;
  }

  function fitZones(){
    var map=window.caroMap; if(!map || !map.__kakao || !window.kakao) return;
    try{
      var b=new window.kakao.maps.LatLngBounds();
      Object.keys(ZONES).forEach(function(z){ b.extend(new window.kakao.maps.LatLng(ZONES[z].lat,ZONES[z].lng)); });
      map.setBounds(b, 40, 40, 230, 40); // 하단 바텀시트 가림 고려해 아래 여백 크게
    }catch(e){}
  }
  window.caroFitZones=fitZones;
  window.CARO_ZONES=ZONES;
  window.caroZoneOf=function(car){ if(!car||typeof car.lat!=='number') return null; return (car.region && ZONES[car.region]) ? car.region : nearestZone(car); };
  window.caroSnapAll=snapAll;

  // 카카오 지오코딩(주소→좌표) — services 라이브러리 준비되면 1회 실행
  var geoDone=false, tries=0;
  function geocodeZones(){
    if(geoDone) return;
    if(!(window.kakao && kakao.maps && kakao.maps.services)) return;
    geoDone=true;
    var g=new kakao.maps.services.Geocoder();
    Object.keys(ZONES).forEach(function(z){
      g.addressSearch(ZONES[z].addr, function(res,status){
        try{
          if(status===kakao.maps.services.Status.OK && res && res[0]){
            ZONES[z].lat=parseFloat(res[0].y);
            ZONES[z].lng=parseFloat(res[0].x);
            applyToAreas();
            if(window.updateMapMarkers) window.updateMapMarkers();
            if(window.renderCars) window.renderCars();
            fitZones();
            console.log('[거점] '+z+' 좌표 확정:', ZONES[z].lat, ZONES[z].lng);
          }
        }catch(e){}
      });
    });
  }
  var poll=setInterval(function(){
    tries++;
    if(window.kakao && kakao.maps && kakao.maps.services){ geocodeZones(); fitZones(); clearInterval(poll); }
    if(tries>40) clearInterval(poll);
  }, 500);

  console.log('[거점] 차량 모으기 모듈 로드 (구월동/송도)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 거점 와드 마커 (CARO 픽업포인트)
   · 거점마다 와드 핀 1개만 표시 (흰색 위치핀 + 골드 C + 대수 배지)
   · 와드 누르면 그 거점의 차량 전체가 반화면 시트로 표시 → 바로 예약
   · 개별 차량 마커/흩어짐 없음
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var ZM=[]; // 거점 와드 오버레이

  function isMaintCar(car){ try{ if(typeof window.isMaint==='function') return !!window.isMaint(car); }catch(e){} return !!car.devDisabled; }
  function isReservedNow(car){
    var now=new Date(), hit=false;
    (window.myReservations||[]).forEach(function(r){
      if(!r.car || r.car.id!==car.id || !r.start || !r.end) return;
      if(!r.returned){ hit=true; }
      else if(r.returnedAt){ if(now < new Date(r.returnedAt.getTime()+600000)) hit=true; }
    });
    return hit;
  }
  function nm(car){ return window.getCarName?window.getCarName(car):car.name; }
  function carsInZone(zone){ return (window.CARS_DATA||[]).filter(function(c){ return window.caroZoneOf && window.caroZoneOf(c)===zone; }); }
  function zoneAvailCount(zone){
    return carsInZone(zone).filter(function(c){
      return c.status==='available' && !isMaintCar(c) && !isReservedNow(c);
    }).length;
  }

  // ── 와드 SVG (위치핀 + C) — active면 골드, 예약마감/차량없음이면 회색 ──
  function wardSVG(active, scale){
    var s = (typeof scale==='number' && scale>0) ? scale : 1;
    var W = Math.round(86*s), H = Math.round(84*s);
    var op = active ? '0.95' : '0.6';
    var u = 'w'+Math.random().toString(36).slice(2,7);
    var P = 'M256 396C256 396 360 292 360 208A104 104 0 0 0 152 208C152 292 256 396 256 396Z';
    return '<svg width="'+W+'" height="'+H+'" viewBox="132 92 248 350" xmlns="http://www.w3.org/2000/svg">'
      +'<defs><linearGradient id="'+u+'g" x1="0.22" y1="0" x2="0.78" y2="1"><stop offset="0" stop-color="#5a6470"/><stop offset="1" stop-color="#48515e"/></linearGradient>'
      +'<filter id="'+u+'d" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="6" stdDeviation="7" flood-color="#0e1115" flood-opacity="0.42"/></filter></defs>'
      +'<g opacity="'+op+'">'
      +'<ellipse cx="257" cy="418" rx="50" ry="9" fill="#2b3038" opacity="0.22"/>'
      +'<g filter="url(#'+u+'d)"><path d="'+P+'" fill="url(#'+u+'g)"/></g>'
      +'<clipPath id="'+u+'c"><path d="'+P+'"/></clipPath>'
      +'<g clip-path="url(#'+u+'c)"><ellipse cx="204" cy="156" rx="58" ry="64" fill="#ffffff" opacity="0.1"/></g>'
      +'<path d="M293 171A52 52 0 1 0 293 245" fill="none" stroke="#ffffff" stroke-width="30" stroke-linecap="round"/>'
      +'</g>'
    +'</svg>';
  }

  function clearZM(){ ZM.forEach(function(o){ try{o.setMap(null);}catch(e){} }); ZM=[]; }

  function drawZoneWards(){
    if(!window.caroMap || !window.caroMap.__kakao || !window.kakao || !window.CARO_ZONES) return;
    clearZM();
    var __lv = null, __sc = 1;
      try{
        if(window.caroMap && typeof window.caroMap.getLevel === 'function'){
          __lv = window.caroMap.getLevel();
          if(__lv <= 3) __sc = 1;
                  else if(__lv === 4) __sc = 0.9;
                  else if(__lv === 5) __sc = 0.85;
                  else if(__lv === 6) __sc = 0.78;
                  else __sc = 0.7;
          if(!drawZoneWards.__zoomBound && window.kakao && window.kakao.maps && window.kakao.maps.event){
            window.kakao.maps.event.addListener(window.caroMap,'zoom_changed',function(){ drawZoneWards(); });
            drawZoneWards.__zoomBound = true;
          }
        }
      }catch(e){ __lv = null; __sc = 1; }
      if(__lv !== null && __lv >= 9) return;   /* 레벨9(≈4km)부터 숨김 — 2km(레벨8) 화면에서도 와드 표시 */
    Object.keys(window.CARO_ZONES).forEach(function(zone){
      var Z=window.CARO_ZONES[zone];
      if(!Z || Z.lat==null || Z.lng==null) return;
      var total=carsInZone(zone).length;
      var availN=zoneAvailCount(zone);
      var active=availN>0;                 /* 예약가능 차량 1대↑ → 골드 / 전부 예약·차량없음 → 회색 */
      var badgeCol=active?'#c8a96e':'#9aa0a8';
      var pos=new window.kakao.maps.LatLng(Z.lat, Z.lng);
      var el=document.createElement('div');
      el.style.cssText='cursor:pointer;filter:drop-shadow(0 4px 6px rgba(0,0,0,.32));transition:transform .12s;';
      el.innerHTML=wardSVG(active, __sc);
      el.addEventListener('mousedown',function(){ el.style.transform='scale(.92)'; });
      el.addEventListener('mouseup',function(){ el.style.transform=''; });
      el.addEventListener('click',function(e){ e.stopPropagation(); openZoneSheet(zone); });
      var ov=new window.kakao.maps.CustomOverlay({position:pos,content:el,yAnchor:1,xAnchor:0.5,clickable:true});
      ov.setMap(window.caroMap); ZM.push(ov);
    });
  }

  // ── 지도 마커 동작 교체: 개별차/ BL 마커 대신 거점 와드만 ──
  window.updateMapMarkers=function(){
    try{ if(window.caroSnapAll) window.caroSnapAll(); }catch(e){}
    drawZoneWards();
  };
  window.updateMapMarkers.__caroZone=true; window.updateMapMarkers.__caroWard=true;
  window.initCarBottomSheet=function(){ try{ if(window.updateCarSheetCount) window.updateCarSheetCount(); }catch(e){} };
  window.initCarBottomSheet.__caroWard=true;

  // ── 거점 차량 시트 ──
  function ensureZoneSheet(){
    var screen=document.getElementById('rental-screen'); if(!screen) return;
    if(document.getElementById('caro-zone-sheet')) return;
    var bd=document.createElement('div'); bd.className='caro-cat-backdrop'; bd.id='caro-zone-backdrop'; bd.onclick=closeZoneSheet; screen.appendChild(bd);
    var sh=document.createElement('div'); sh.className='caro-cat-sheet'; sh.id='caro-zone-sheet';
    sh.innerHTML='<div class="ccs-grip"></div>'
      +'<div class="ccs-head"><span class="ccs-title" id="czTitle">거점 차량</span><button class="ccs-x" type="button">✕</button></div>'
      +'<div class="ccs-list" id="czList"></div>';
    screen.appendChild(sh);
    sh.querySelector('.ccs-x').onclick=closeZoneSheet;
  }
  function carRow(car){
    var s=window.caroCarState?window.caroCarState(car):{ok:car.status==='available',label:car.status==='available'?'이용 가능':'대여중',cls:'rented'};
    var price=(car.pricePerHour||0).toLocaleString();
    var btn=s.ok?'<button class="ccs-rent" data-id="'+car.id+'">예약</button>':'<button class="ccs-rent" disabled>'+(s.cls==='maint'?'점검중':'대여중')+'</button>';
    return '<div class="ccs-car'+(s.ok?'':' busy')+'">'
      +'<img class="ccs-thumb" src="'+car.img+'" alt=""/>'
      +'<div class="ccs-info"><div class="ccs-name">'+nm(car)+'</div>'
      +'<div class="ccs-meta"><span class="ccs-badge '+(s.ok?'on':s.cls)+'">'+s.label+'</span><span><strong>'+price+'원</strong>/h</span></div></div>'
      +btn
      +'</div>';
  }
  function openZoneSheet(zone){
    ensureZoneSheet();
    window.caroCurrentZone=zone;
    var cars=carsInZone(zone);
    var t=document.getElementById('czTitle'); if(t) t.textContent=zone+' · '+cars.length+'대';
    var box=document.getElementById('czList');
    if(box){
      box.innerHTML = cars.length ? cars.map(carRow).join('') : '<div class="ccs-empty">이 거점에 차량이 없어요.</div>';
      box.querySelectorAll('.ccs-rent[data-id]').forEach(function(b){
        b.onclick=function(){ var id=parseInt(b.getAttribute('data-id'),10); closeZoneSheet(); try{ if(window.selectCar) window.selectCar(id); }catch(e){} };
      });
    }
    var bd=document.getElementById('caro-zone-backdrop'), sh=document.getElementById('caro-zone-sheet');
    if(bd) bd.classList.add('open'); if(sh) sh.classList.add('open');
  }
  function closeZoneSheet(){
    var bd=document.getElementById('caro-zone-backdrop'), sh=document.getElementById('caro-zone-sheet');
    if(bd) bd.classList.remove('open'); if(sh) sh.classList.remove('open');
  }
  window.caroOpenZoneSheet=openZoneSheet;

  // 예약 화면 진입 시 와드 보장
  if(typeof window.goTo==='function' && !window.goTo.__caroWardWrapped){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='rental-screen'){ setTimeout(function(){ ensureZoneSheet(); if(window.updateMapMarkers) window.updateMapMarkers(); },120); setTimeout(drawZoneWards,520); } return r; };
    window.goTo.__caroWardWrapped=true; window.goTo.__caroRentalWrapped=true; window.goTo.__caroCatSheetWrapped=true;
  }
  setTimeout(ensureZoneSheet, 900);
  console.log('[거점] ✅ 와드 마커 + 거점 차량 시트 (개별 마커 제거)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 회원가입 비밀번호 규칙 강화 (대문자 포함 명시)
   · 안내 문구: 영문+숫자+특수문자+대문자 8~20자
   · 검증: 대문자 + 소문자 + 숫자 + 특수문자 + 8~20자 모두 필수
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  // 안내 문구 갱신
  function setPwHint(){
    var el=document.getElementById('su-pw');
    if(el) el.placeholder='영문+숫자+특수문자+대문자 8~20자';
  }
  setPwHint(); setTimeout(setPwHint,500); setTimeout(setPwHint,1500); setTimeout(setPwHint,3000);

  // 검증 강화 (validateInfo 교체)
  window.validateInfo=function(){
    function gv(id){ var e=document.getElementById(id); return e?(e.value||''):''; }
    function toast(m){ try{ if(window.showToast) showToast(m); }catch(e){} }
    var id=gv('su-email').toLowerCase(), pw=gv('su-pw'), pw2=gv('su-pw2');
    if(!id){ toast('이메일을 입력해 주세요.'); return false; }
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)){ toast('올바른 이메일 형식으로 입력해 주세요.'); return false; }
    if(!pw){ toast('비밀번호를 입력해 주세요.'); return false; }
    if(pw.length<8 || pw.length>20){ toast('비밀번호는 8~20자로 입력해 주세요.'); return false; }
    if(!/[A-Z]/.test(pw)){ toast('비밀번호에 영문 대문자를 포함해 주세요.'); return false; }
    if(!/[a-z]/.test(pw)){ toast('비밀번호에 영문 소문자를 포함해 주세요.'); return false; }
    if(!/[0-9]/.test(pw)){ toast('비밀번호에 숫자를 포함해 주세요.'); return false; }
    if(!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)){ toast('비밀번호에 특수문자를 포함해 주세요.'); return false; }
    if(pw!==pw2){ toast('비밀번호가 일치하지 않습니다.'); return false; }
    var hint=document.getElementById('id-hint');
    if(!hint || hint.style.color!=='rgb(29, 122, 58)'){ toast('이메일 중복 확인을 먼저 해 주세요.'); return false; }
    return true;
  };
  console.log('[가입] ✅ 비밀번호 규칙 강화: 대문자+소문자+숫자+특수문자+8~20자');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 예약 화면 재구성 — 상단 시간바(드럼) + 차종버튼 + 지도 전체 + 와드로 차량선택
   · 상단: 대여 시작 / 반납 예정 시간바(탭하면 날짜·시간·분 드럼)
   · 그 아래: 차종 선택 버튼
   · 하단 차량목록 제거, 지도가 전체를 채움
   · 차량 선택은 와드(거점 핀) 탭 → 거점 시트로만
   · 상단에서 고른 시간이 차량 선택 후에도 유지(예약으로 연결)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  // 시간 표시 포맷
  function fmtVal(v){
    if(!v) return '—';
    var d=new Date(v); if(isNaN(d.getTime())) return '—';
    var wk=['일','월','화','수','목','금','토'][d.getDay()];
    var p=function(n){return n<10?'0'+n:n;};
    return (d.getMonth()+1)+'/'+d.getDate()+' ('+wk+') '+p(d.getHours())+':'+p(d.getMinutes());
  }
  function ensureDefaults(){
    var s=document.getElementById('res-start');
    if(s && !s.value){ try{ if(window.setupDateInputs) window.setupDateInputs(); }catch(e){} }
  }
  function refreshTimeBar(){
    ensureDefaults();
    var s=document.getElementById('res-start'), e=document.getElementById('res-end');
    var sv=document.getElementById('ctb-start'), ev=document.getElementById('ctb-end');
    if(sv) sv.textContent=fmtVal(s&&s.value);
    if(ev) ev.textContent=fmtVal(e&&e.value);
  }
  window.caroRefreshTimeBar=refreshTimeBar;

  // CSS
  var st=document.createElement('style'); st.id='caro-rental-layout-css';
  st.textContent=
    '.car-bottom-strip{display:none !important;}'              /* 하단 차량목록 제거 */
   +'.caro-cat-btn{display:none !important;}'                  /* 기존 떠있던 차종버튼 숨김 */
   +'.caro-rental-controls{position:absolute;top:52px;left:0;right:0;z-index:24;padding:9px 12px 0;box-sizing:border-box;background:transparent;pointer-events:none;}'
   +'.caro-timebar{pointer-events:auto;display:flex;align-items:center;background:rgba(255,255,255,.98);border:1px solid var(--p1-line2,#d5dae1);border-radius:13px;padding:7px 4px;box-shadow:0 3px 12px rgba(0,0,0,.16);}'
   +'.ctb-field{flex:1;background:none;border:none;text-align:center;font-family:inherit;cursor:pointer;padding:4px 6px;border-radius:9px;}'
   +'.ctb-field:active{background:#f0f1f3;}'
   +'.ctb-label{display:block;font-size:11px;color:#888d98;margin-bottom:3px;}'
   +'.ctb-val{display:block;font-size:13.5px;font-weight:700;color:#18191c;white-space:nowrap;}'
   +'.ctb-arrow{color:#b0b4bb;font-size:15px;padding:0 2px;flex:0 0 auto;}'
   +'.crt-cat-row{display:flex;justify-content:flex-end;margin-top:10px;pointer-events:none;}'
   +'.crt-cat-btn{pointer-events:auto;width:46px;height:46px;border-radius:50%;background:var(--accent,#18191c);color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.3);}'
   +'.crt-cat-btn:active{transform:scale(.94);}';
  (document.head||document.documentElement).appendChild(st);

  function syncMapTop(){
    var map=document.getElementById('caro-map');
    if(map){ map.style.setProperty('top','52px','important'); } // 헤더 바로 아래부터 지도가 채움(컨트롤은 위에 떠있음)
    try{ if(window.caroMap && window.caroMap.invalidateSize) window.caroMap.invalidateSize(); }catch(e){}
  }
  window.caroSyncMapTop=syncMapTop;

  function ensureRentalLayout(){
    var screen=document.getElementById('rental-screen'); if(!screen) return;
    if(!screen.querySelector('.caro-rental-controls')){
      var panel=document.createElement('div'); panel.className='caro-rental-controls';
      panel.innerHTML=
        '<div class="caro-timebar">'
        +'<button class="ctb-field" type="button" data-which="start"><span class="ctb-label">대여 시작</span><span class="ctb-val" id="ctb-start">—</span></button>'
        +'<span class="ctb-arrow">→</span>'
        +'<button class="ctb-field" type="button" data-which="end"><span class="ctb-label">반납 예정</span><span class="ctb-val" id="ctb-end">—</span></button>'
        +'</div>'
        +'<div class="crt-cat-row"><button class="crt-cat-btn" type="button" aria-label="차종 선택"><svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg></button></div>';
      screen.appendChild(panel);
      panel.querySelectorAll('.ctb-field').forEach(function(b){
        b.onclick=function(){ try{ if(window.openDrumPicker) openDrumPicker(b.getAttribute('data-which')); }catch(e){} };
      });
      panel.querySelector('.crt-cat-btn').onclick=function(){ try{ if(window.caroOpenCatSheet) caroOpenCatSheet(); }catch(e){} };
    }
    refreshTimeBar();
    setTimeout(syncMapTop, 60); setTimeout(syncMapTop, 260);
  }
  window.caroEnsureRentalLayout=ensureRentalLayout;

  // 차량 선택 시 시간 초기화 방지 — 상단에서 고른 시간 유지
  if(typeof window.setupDateInputs==='function' && !window.setupDateInputs.__caroKeep){
    var _setup=window.setupDateInputs;
    window.setupDateInputs=function(){
      var s=document.getElementById('res-start'), e=document.getElementById('res-end');
      if(s&&e&&s.value&&e.value){ try{ if(window.syncDateDisplay){ syncDateDisplay('start'); syncDateDisplay('end'); } if(window.updateDuration) updateDuration(); }catch(_){} return; }
      return _setup.apply(this,arguments);
    };
    window.setupDateInputs.__caroKeep=true;
  }

  // 드럼 확인 후 시간바 갱신
  if(typeof window.confirmDrumPicker==='function' && !window.confirmDrumPicker.__caroBar){
    var _conf=window.confirmDrumPicker;
    window.confirmDrumPicker=function(){ var r=_conf.apply(this,arguments); try{ refreshTimeBar(); if(window.caroRefreshOpenSheets) window.caroRefreshOpenSheets(); }catch(e){} return r; };
    window.confirmDrumPicker.__caroBar=true;
  }

  // 예약 화면 진입 시 레이아웃 보장
  if(typeof window.goTo==='function' && !window.goTo.__caroLayoutWrap){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='rental-screen'){ setTimeout(ensureRentalLayout,80); setTimeout(ensureRentalLayout,520); } return r; };
    window.goTo.__caroLayoutWrap=true;
  }
  window.addEventListener('resize', function(){ syncMapTop(); });
  setTimeout(ensureRentalLayout, 1000);
  console.log('[예약화면] ✅ 상단 시간바+차종버튼 / 지도 전체 / 와드로 차량선택');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] 내 위치 버튼 — 사용자 위치로 이동 + 500m(레벨6) 확대 + 위치 마커
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var myOv=null, _loadT=null;

  var LOC_ICON='<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#18191c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.4"/><path d="M12 2.5v3.2M12 18.3v3.2M2.5 12h3.2M18.3 12h3.2"/></svg>';

  /* 지도 위 로딩 표시(전역 토스트 아님) — 위치 버튼 누른 뒤 통신 지연 시에만 지도 안에 표시 */
  function mapBox(){ return document.getElementById('caro-map'); }
  function showMapLoading(){
    var m=mapBox(); if(!m) return;
    try{ if(getComputedStyle(m).position==='static') m.style.position='relative'; }catch(e){}
    var ld=m.querySelector('.caro-loc-loading');
    if(!ld){ ld=document.createElement('div'); ld.className='caro-loc-loading'; ld.innerHTML='<span class="cll-spin"></span>현위치 불러오는 중'; m.appendChild(ld); }
    ld.style.display='inline-flex';
  }
  function hideMapLoading(){ var m=mapBox(); if(!m) return; var ld=m.querySelector('.caro-loc-loading'); if(ld) ld.style.display='none'; }
  function stopLoading(){ try{ clearTimeout(_loadT); }catch(e){} _loadT=null; hideMapLoading(); }

  function clearMyOv(){ if(!myOv) return; try{ if(myOv.setMap) myOv.setMap(null); }catch(e){} try{ if(myOv.remove) myOv.remove(); }catch(e){} myOv=null; }
  /* 카카오맵 / OSM(Leaflet) 둘 다 지원해서 위치 표시 — 준비된 지도에 맞춰 처리 */
  function placeMyLoc(lat,lng){
    var kakao=window.kakao, map=window.caroMap;
    if(kakao&&kakao.maps&&map&&map.__kakao){
      var pos=new kakao.maps.LatLng(lat,lng);
      clearMyOv();
      var el=document.createElement('div');
      el.innerHTML='<div class="caro-myloc"><span class="caro-myloc-core"></span></div>';
      myOv=new kakao.maps.CustomOverlay({position:pos,content:el,yAnchor:0.5,xAnchor:0.5,zIndex:9999});
      myOv.setMap(map);
      try{ map.setCenter(pos); }catch(e){}
      try{ map.setLevel(6); }catch(e){}   /* ≈500m */
      return true;
    }
    /* OSM(Leaflet) 폴백 지도 */
    if(map && typeof map.setView==='function' && window.L){
      try{
        clearMyOv();
        myOv=window.L.circleMarker([lat,lng],{radius:8,color:'#fff',weight:3,fillColor:'#18191c',fillOpacity:1}).addTo(map);
        map.setView([lat,lng], 15);
        return true;
      }catch(e){}
    }
    return false;
  }
  function showMyLoc(lat,lng){
    if(placeMyLoc(lat,lng)){ stopLoading(); return; }
    /* 지도가 아직 준비 안 됨 → 전역 안내 없이 자동 재시도(최대 ~6초). 로딩 표시는 지도 안에서만 유지 */
    try{ if(window.initMap) window.initMap(); }catch(e){}
    var tries=0, iv=setInterval(function(){
      tries++;
      if(placeMyLoc(lat,lng)){ clearInterval(iv); stopLoading(); return; }
      if(tries>=20){ clearInterval(iv); stopLoading(); }
    }, 300);
  }
  function locateMe(userTriggered){
    if(userTriggered!==true) return;   /* ★ 사용자가 '내 위치' 버튼을 직접 누른 경우에만 */
    if(!navigator.geolocation) return;
    /* 통신 지연이 있을 때만(400ms 초과) 지도 위에 로딩 표시 — 전역 토스트 없음 */
    try{ clearTimeout(_loadT); }catch(e){}
    _loadT=setTimeout(showMapLoading, 400);
    navigator.geolocation.getCurrentPosition(
      function(p){ showMyLoc(p.coords.latitude, p.coords.longitude); },
      function(){ stopLoading(); },
      {enableHighAccuracy:true, timeout:9000, maximumAge:30000}
    );
  }
  window.caroLocateMe=function(){ locateMe(true); };

  var st=document.createElement('style'); st.id='caro-loc-css';
  st.textContent=
    '.crt-loc-btn{pointer-events:auto;width:40px;height:40px;border-radius:50%;background:#fff;border:1px solid var(--p1-line2,#d5dae1);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 6px 16px -6px rgba(40,48,58,.34);}'
   +'.crt-loc-btn:active{transform:scale(.94);}'
   +'.caro-myloc{width:19px;height:19px;border-radius:50%;background:rgba(90,100,112,.22);display:flex;align-items:center;justify-content:center;}'
   +'.caro-myloc-core{width:12px;height:12px;border-radius:50%;background:var(--accent,#18191c);border:2.5px solid #fff;box-shadow:0 0 0 1px rgba(90,100,112,.5);}'
   +'.caro-loc-loading{position:absolute;top:12px;left:50%;transform:translateX(-50%);z-index:600;display:none;align-items:center;gap:8px;background:rgba(255,255,255,.96);border:1px solid var(--p1-line2,#d5dae1);border-radius:20px;padding:7px 14px;font-size:12.5px;font-weight:700;color:#18191c;box-shadow:0 4px 14px -6px rgba(40,48,58,.3);pointer-events:none;white-space:nowrap;}'
   +'.caro-loc-loading .cll-spin{width:14px;height:14px;border:2px solid #ccd2da;border-top-color:#18191c;border-radius:50%;animation:cllSpin .7s linear infinite;}'
   +'@keyframes cllSpin{to{transform:rotate(360deg);}}';
  (document.head||document.documentElement).appendChild(st);

  function ensureLocBtn(){
    var row=document.querySelector('#rental-screen .crt-cat-row');
    if(!row || row.querySelector('.crt-loc-btn')) return;
    var b=document.createElement('button'); b.type='button'; b.className='crt-loc-btn'; b.setAttribute('aria-label','내 위치');
    b.innerHTML=LOC_ICON;
    b.onclick=function(e){ e.stopPropagation(); locateMe(true); };
    row.insertBefore(b, row.firstChild);   /* [내위치][차종] 순 배치 */
  }
  window.caroEnsureLocBtn=ensureLocBtn;

  if(typeof window.goTo==='function' && !window.goTo.__caroLocWrap){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='rental-screen'){ setTimeout(ensureLocBtn,220); setTimeout(ensureLocBtn,700); } return r; };
    window.goTo.__caroLocWrap=true;
  }
  setTimeout(ensureLocBtn, 1200);
  console.log('[지도] ✅ 내 위치 버튼 (500m 확대)');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] 시간대별 가용성 + 대여중 회색 처리 (전역)
   · 선택한 시간(res-start~res-end)에 겹치는 예약이 있으면 대여중
   · window.globalActiveReservations(전체 활성 예약) 기준
   · 대여중 차량은 시트에서 회색(grayscale)+"대여중" 표시, 예약 불가
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  function selWindow(){
    var s=document.getElementById('res-start'), e=document.getElementById('res-end');
    var S=(s&&s.value)?new Date(s.value):new Date();
    if(isNaN(S.getTime())) S=new Date();
    var E=(e&&e.value)?new Date(e.value):new Date(S.getTime()+3600000);
    if(isNaN(E.getTime())) E=new Date(S.getTime()+3600000);
    return {S:S,E:E};
  }
  function carBusy(car){
    var w=selWindow(), res=window.globalActiveReservations||[];
    for(var i=0;i<res.length;i++){
      var r=res[i];
      if(r && r.car && r.car.id===car.id && r.start && r.end && r.start < w.E && r.end > w.S) return true;
    }
    return false;
  }
  /* 지금 차가 나가 있는가? — 미반납(시작 후, 연체 포함) 또는 반납 후 10분 유예 */
  function carOutNow(car){
    var now=Date.now();
    var lists=[window.globalActiveReservations||[], window.myReservations||[]];
    for(var k=0;k<lists.length;k++){
      var arr=lists[k];
      for(var i=0;i<arr.length;i++){
        var r=arr[i];
        if(!r||!r.car||r.car.id!==car.id||!r.start) continue;
        var st=(r.start instanceof Date)?r.start.getTime():new Date(r.start).getTime();
        if(isNaN(st)) continue;
        if(!r.returned){
          if(now>=st) return true;                 /* 시작 후 미반납 = 대여중/연체 → 나가있음 */
        } else if(r.returnedAt){
          var rt=(r.returnedAt instanceof Date)?r.returnedAt.getTime():new Date(r.returnedAt).getTime();
          if(!isNaN(rt) && now < rt+600000) return true;   /* 반납 후 10분 유예 */
        }
      }
    }
    return false;
  }
  window.caroCarOutNow=carOutNow;
  window.caroCarState=function(car){
    if(!car) return {ok:false,label:'대여중',cls:'rented'};
    if(car.devDisabled || (car.status && car.status!=='available')) return {ok:false,label:'점검중',cls:'maint'};
    if(carOutNow(car)) return {ok:false,label:'대여중',cls:'rented'};   /* 미반납·연체 → 절대 대여 불가 */
    if(carBusy(car)) return {ok:false,label:'대여중',cls:'rented'};     /* 선택 시간대 겹침 */
    return {ok:true,label:'이용 가능',cls:'ok'};
  };
  window.caroCarBusy=carBusy;

  window.caroRefreshOpenSheets=function(){
    try{
      var zs=document.getElementById('caro-zone-sheet');
      if(zs && zs.classList.contains('open') && window.caroCurrentZone && window.caroOpenZoneSheet){ window.caroOpenZoneSheet(window.caroCurrentZone); }
      var cs=document.getElementById('caro-cat-sheet');
      if(cs && cs.classList.contains('open') && window.caroOpenCatSheet){ window.caroOpenCatSheet(); }
    }catch(e){}
  };

  // 대여중 회색 처리 CSS
  var st=document.createElement('style'); st.id='caro-busy-css';
  st.textContent=
    '.ccs-car.busy .ccs-thumb{filter:grayscale(1);opacity:.5;}'
   +'.ccs-car.busy .ccs-name{color:#9aa0a8;}'
   +'.ccs-badge.rented{background:#eceef1;color:#7a818b;}'
   +'.ccs-badge.maint{background:#f3e6d6;color:#b5781f;}'
   +'.ccs-rent:disabled{background:#cfd2d7;color:#fff;}';
  (document.head||document.documentElement).appendChild(st);

  console.log('[가용성] ✅ 시간대별 대여 가능/대여중(회색) 판정 활성화');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 예약 화면 드럼 제거 — 지도에서 정한 시간을 '표시 전용'으로
   · 예약 화면의 대여 시작/반납 예정 필드: 드럼 안 뜨게(클릭 비활성)
   · 값은 지도 상단 시간바에서 정한 res-start/res-end 그대로 표시
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  function killResDrum(){
    ['res-start-display','res-end-display'].forEach(function(id){
      var disp=document.getElementById(id); if(!disp) return;
      var col=disp.closest ? disp.closest('.dt-col') : disp.parentNode;
      if(col){
        col.onclick=null;
        col.removeAttribute('onclick');
        col.style.cursor='default';
        col.classList.add('caro-dt-readonly');
      }
    });
    // 값 동기화(지도에서 정한 시간 표시)
    try{ if(window.syncDateDisplay){ syncDateDisplay('start'); syncDateDisplay('end'); } }catch(e){}
  }
  // 살짝 "지도에서 선택" 느낌의 표시 (선택칸 강조 제거)
  var st=document.createElement('style'); st.id='caro-dt-readonly-css';
  st.textContent='.caro-dt-readonly{cursor:default !important;}';
  (document.head||document.documentElement).appendChild(st);

  killResDrum(); setTimeout(killResDrum,600); setTimeout(killResDrum,1500);

  if(typeof window.goTo==='function' && !window.goTo.__caroResDrumKill){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='reservation-screen'){ setTimeout(killResDrum,40); setTimeout(killResDrum,300); } return r; };
    window.goTo.__caroResDrumKill=true;
  }
  console.log('[예약화면] ✅ 드럼 제거 — 지도에서 정한 시간 표시 전용');
})();

/* ═══════════════════════════════════════════════════════════
   [수정] ① 예약 시간칸 클릭 테두리 제거 ② 뒤로 버튼 크기=결제 버튼
          ③ 로그인 뒤로 화살표 제거 ④ 자동 로그인 보강(저장+복원)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  // ── CSS: 시간칸 테두리 강조 제거 + 뒤로 버튼을 결제 버튼 크기로 ──
  var st=document.createElement('style'); st.id='caro-misc-fixes-css';
  st.textContent=
    /* ① 표시전용 시간칸: hover/active 테두리 진해짐 제거 */
    '.caro-dt-readonly .res-date-display,.caro-dt-readonly:hover .res-date-display,.caro-dt-readonly:active .res-date-display,.caro-dt-readonly:focus .res-date-display{border-color:var(--border) !important;}'
   +'.caro-dt-readonly .res-date-display{outline:none !important;box-shadow:none !important;}'
    /* ② 모든 뒤로 버튼 크기 = 결제하기(res-submit-btn): padding16/1rem/700/라운드 */
   +'.back-bottom-btn,.mpn-back-btn,.mpd-back-btn{padding:16px !important;font-size:1rem !important;font-weight:700 !important;border-radius:var(--r) !important;min-height:0 !important;box-sizing:border-box !important;}';
  (document.head||document.documentElement).appendChild(st);

  // ── ③ 로그인 화면 뒤로 버튼 화살표 제거 ──
  function fixLoginBack(){
    var ls=document.getElementById('login-screen'); if(!ls) return;
    var b=ls.querySelector('.back-bottom-btn'); if(!b) return;
    b.removeAttribute('data-i18n');           // i18n 덮어쓰기 방지
    b.textContent='뒤로';                      // 화살표 제거
  }
  fixLoginBack(); setTimeout(fixLoginBack,600); setTimeout(fixLoginBack,1800);

  // ── ④ 자동 로그인 보강 ──
  // (저장) 로그인 시 '자동 로그인' 체크돼 있으면, 로그인 성공 후 확실히 플래그 저장
  if(typeof window.handleLogin==='function' && !window.handleLogin.__caroAuto){
    var _hl=window.handleLogin;
    window.handleLogin=function(){
      var chk=document.getElementById('auto-login'); var want=!!(chk&&chk.checked);
      var r=_hl.apply(this,arguments);
      if(want){
        var tries=0;
        var iv=setInterval(function(){ tries++;
          if(window.userInfo && window.userInfo.id){
            try{
              localStorage.setItem('caro_auto_login','1');
              localStorage.setItem('caro_auto_id', window.userInfo.id);
              localStorage.setItem('caro_auto_name', window.userInfo.name||window.userInfo.id);
            }catch(e){}
            clearInterval(iv);
          }
          if(tries>40) clearInterval(iv);
        },150);
      }
      return r;
    };
    window.handleLogin.__caroAuto=true;
  }

  // (복원) 앱 시작 시 플래그 있으면 강제로 홈 진입 (스플래시/메인/로그인 화면일 때만)
  function activeScreenId(){ var a=document.querySelector('.screen.active'); return a?a.id:''; }
  function tryAutoLogin(){
    try{
      if(window.userInfo && window.userInfo.id) return;        // 이미 로그인됨
      var al=localStorage.getItem('caro_auto_login');
      var aid=localStorage.getItem('caro_auto_id');
      if(al!=='1' || !aid) return;                             // 자동로그인 아님(로그아웃 시 플래그 삭제됨)
      var as=activeScreenId();
      if(as && as!=='splash-screen' && as!=='main-screen' && as!=='login-screen') return; // 다른 화면이면 방해 안 함
      var aname=localStorage.getItem('caro_auto_name')||aid;
      window.userInfo.id=aid; window.userInfo.name=aname;
      window._caroLoggedIn=true;                                   /* 하단바·홈 UI 활성화 */
      try{ if(window.loadUserData) loadUserData(aid); }catch(e){}  /* 예약·카드 데이터 복원 */
      var wn=document.getElementById('home-welcome-name'); if(wn) wn.textContent=aname+' 님, 안녕하세요 👋';
      var hn=document.getElementById('hmenu-name'); if(hn) hn.textContent=aname;
      var hi=document.getElementById('hmenu-id'); if(hi) hi.textContent=aid;
      try{ if(window.startSessionTimer) startSessionTimer(); }catch(e){}
      try{ if(window.loadUserData) loadUserData(aid); }catch(e){}
      try{ if(window.goTo) goTo('home-screen', true); }catch(e){}
      setTimeout(function(){
        try{ if(window.showHomeCtrlSwitch) showHomeCtrlSwitch(); }catch(e){}
        try{ if(window.renderMyReservations) renderMyReservations(); }catch(e){}
        try{ if(window.renderCars) renderCars(); }catch(e){}
        var mb=document.getElementById('home-menu-btn'); if(mb) mb.classList.remove('hidden');
      },150);
      console.log('[자동로그인] ✅ 복원 → 홈 진입:', aid);
    }catch(e){ console.warn('[자동로그인] 복원 오류', e); }
  }
  setTimeout(tryAutoLogin, 1600);
  setTimeout(tryAutoLogin, 2800);

  console.log('[수정] ✅ 시간칸 테두리/뒤로버튼 크기/로그인 화살표/자동로그인 보강');
})();


/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 시간 드럼 자동 닫기 v2 (강화)
   ───────────────────────────────────────────────────────────
   · 증상: 시간 드럼(drum-overlay)이 예약/대여 화면 외(이벤트·홈 등)에서 뜸.
   · 원칙: 드럼은 '대여 화면(rental)·예약 화면(reservation)'에서만 떠야 함.
           그 외 화면이 활성화되면 무조건 닫는다.
   · 방어: goTo 직후 + popstate + 화면 class 변경 감시(MutationObserver) + 백업 인터벌.
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var ALLOW={ 'rental-screen':1, 'reservation-screen':1 };
  function activeScreenId(){ var a=document.querySelector('.screen.active'); return a?a.id:''; }
  function forceClose(){
    var ov=document.getElementById('drum-overlay');
    if(ov && ov.classList.contains('open')){
      try{ if(typeof window.closeDrumPicker==='function'){ window.closeDrumPicker(); } }catch(e){}
      ov.classList.remove('open');         /* 확실히 제거 */
    }
  }
  /* 지금 화면이 드럼 허용 화면이 아니면 닫는다 */
  function closeIfWrong(){
    var id=activeScreenId();
    if(!ALLOW[id]) forceClose();
  }
  window.caroCloseDrum=forceClose;

  /* 1) goTo 래핑 — 전환 직전·직후 모두 점검 */
  if(typeof window.goTo==='function' && !window.goTo.__caroDrumGuard2){
    var _g=window.goTo;
    window.goTo=function(id){
      try{ forceClose(); }catch(e){}                 /* 떠나기 전 닫기 */
      var r=_g.apply(this,arguments);
      try{ if(!ALLOW[id]) forceClose(); }catch(e){}  /* 목적지가 허용화면 아니면 닫기 */
      setTimeout(closeIfWrong, 60);                  /* 애니메이션 후 한 번 더 */
      setTimeout(closeIfWrong, 420);
      return r;
    };
    window.goTo.__caroDrumGuard2=true;
  }

  /* 1.5) openDrumPicker 자체 차단 — 허용 화면(예약/대여)이 아니면 아예 열지 않음
     → 이벤트·홈 등에서 로고/배너 등으로 드럼이 뜨는 문제 원천 차단 */
  if(typeof window.openDrumPicker==='function' && !window.openDrumPicker.__caroDrumGuard){
    var _od=window.openDrumPicker;
    window.openDrumPicker=function(){
      var id=activeScreenId();
      if(!ALLOW[id]){ forceClose(); return; }
      return _od.apply(this,arguments);
    };
    window.openDrumPicker.__caroDrumGuard=true;
  }

  /* 2) 뒤로가기(popstate) */
  window.addEventListener('popstate', function(){ setTimeout(closeIfWrong, 0); setTimeout(closeIfWrong, 300); });

  /* 3) 화면 class(active) 변경 감시 — 어떤 경로로 화면이 바뀌든 대응 */
  function watchScreens(){
    if(!window.MutationObserver) return;
    var obs=new MutationObserver(function(){ closeIfWrong(); });
    document.querySelectorAll('.screen').forEach(function(s){
      obs.observe(s,{attributes:true,attributeFilter:['class']});
    });
  }
  watchScreens();
  setTimeout(watchScreens, 1500);  /* 늦게 추가되는 화면(월렌트 등) 대비 */

  /* 4) 백업 인터벌 (드럼이 잘못된 화면에 떠 있으면 닫기) */
  setInterval(closeIfWrong, 500);

  console.log('[수정] ✅ 시간 드럼 자동 닫기 v2 (허용 화면 외 강제 닫기)');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 차량 제어 '스마트키' 바텀시트 v2 (CARO 스타일)
   ───────────────────────────────────────────────────────────
   · 접힘: '스마트키 OFF/ON' + 4버튼 가로행(반납하기·비상등·문잠금·문열기)
   · 펼침: CARO 비대칭 그리드
       [비상등|주차위치] (좌상단 2분할) / 반납하기(좌하단 큰 카드)
       문잠금(우 상단 세로) / 문열기(우 하단 세로)
   · CARO 전용 버튼(주행전 사진·시간 연장·사고 신고)은
     시트 밖, 차량 제어 페이지 본문(연료 아래 '차량 이용')에 배치
   · 모든 버튼은 element 자체를 이동 → onclick·id·활성화 게이팅 100% 보존
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  var st=document.createElement('style'); st.id='caro-smartkey-v2-css';
  st.textContent=[
    '#home-ctrl-modal .ctrl-btn-wrap{display:none !important;}',
    /* 시트는 body에 부착 → 기본 숨김, 차량 제어 열렸을 때만 .on 으로 표시 */
    '#caro-sk-sheet{display:none;} #caro-sk-sheet.on{display:block;}',
    /* 본문 하단 여백 (접힌 시트에 안 가리게) */
    '#home-ctrl-modal .home-ctrl-box{padding-bottom:calc(120px + var(--sab)) !important;}',

    /* ── 시트 밖 본문 '차량 이용' (주행전 사진·시간 연장·사고 신고) ── */
    '#caro-ctrl-extra{padding:2px 16px 8px;}',
    '#caro-ctrl-extra .cce-label{font-size:.72rem;font-weight:700;color:var(--text-m);margin:14px 2px 9px;letter-spacing:.02em;}',
    '#caro-ctrl-extra .cce-row{display:flex;gap:9px;}',
    '#caro-ctrl-extra .cce-row > .ctrl-sq-btn{flex:1;background:#fff !important;border:1px solid var(--border-l) !important;border-radius:16px !important;padding:15px 8px !important;display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;box-shadow:0 1px 2px rgba(20,22,28,.05) !important;width:auto !important;position:relative;}',
    '#caro-ctrl-extra .ctrl-sq-btn:disabled{opacity:.4 !important;}',
    '#caro-ctrl-extra .ctrl-sq-icon{font-size:0 !important;line-height:0;margin-bottom:5px !important;color:var(--accent-2);}',
    '#caro-ctrl-extra .ctrl-sq-icon svg{width:25px;height:25px;display:block;}',
    '#caro-ctrl-extra .ctrl-sq-label{font-size:.78rem !important;font-weight:600 !important;color:var(--text-1) !important;margin-top:0 !important;}',
    '#caro-ctrl-extra .ctrl-sq-badge{position:absolute;top:6px;right:8px;} #caro-ctrl-extra .ctrl-sq-badge:empty{display:none;}',

    /* ── 스크림 ── */
    '#caro-sk-scrim{position:fixed;inset:0;z-index:899;background:rgba(18,20,26,.34);opacity:0;pointer-events:none;transition:opacity .3s ease;display:none;}',
    'body.caro-sk-expanded #caro-sk-scrim{display:block;opacity:1;pointer-events:auto;}',

    /* ── 시트 (폰 폭 꽉, 얇게) ── */
    '#caro-sk-sheet{position:fixed;left:0;right:0;bottom:0;z-index:900;width:100%;margin:0;background:#fff;',
      'border-top-left-radius:22px;border-top-right-radius:22px;box-shadow:0 -8px 28px -12px rgba(20,22,28,.24);',
      'padding:2px 14px calc(12px + var(--sab));box-sizing:border-box;}',
    '.sk-grip{cursor:pointer;user-select:none;-webkit-tap-highlight-color:transparent;padding-bottom:2px;}',
    '.sk-handle{width:40px;height:4px;border-radius:3px;background:#d3d8e0;margin:7px auto 5px;}',
    '.sk-head{display:flex;align-items:center;gap:8px;padding:0 4px 8px;}',
    '.sk-title{font-size:.98rem;font-weight:800;color:var(--text-1);letter-spacing:-.01em;}',
    '.sk-state{font-size:.82rem;font-weight:800;letter-spacing:.05em;}',
    '.sk-state.on{color:#1d7a3a;} .sk-state.off{color:#aeb4bf;}',

    /* 공통 버튼 카드(시트 안) — 얇게 */
    '#caro-sk-sheet .ctrl-sq-btn{background:#eef1f6 !important;border:1px solid transparent !important;border-radius:16px !important;',
      'display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;',
      'box-shadow:none !important;width:auto !important;position:relative;padding:11px 6px !important;transition:background .15s;}',
    '#caro-sk-sheet .ctrl-sq-btn:active{background:#e4e9f0 !important;}',
    '#caro-sk-sheet .ctrl-sq-btn:disabled{opacity:.45 !important;}',
    '#caro-sk-sheet .ctrl-sq-icon{font-size:0 !important;line-height:0;margin-bottom:5px !important;color:var(--accent-2);}',
    '#caro-sk-sheet .ctrl-sq-icon svg{width:23px;height:23px;display:block;}',
    '#caro-sk-sheet .ctrl-sq-label{font-size:.8rem !important;font-weight:600 !important;color:var(--text-1) !important;margin-top:0 !important;}',
    '#caro-sk-sheet .ctrl-sq-badge{position:absolute;top:6px;right:8px;} #caro-sk-sheet .ctrl-sq-badge:empty{display:none;}',

    /* 항상 보이는 줄: 문열림·문잠금 */
    '#caro-sk-sheet .sk-main{display:flex;gap:10px;}',
    '#caro-sk-sheet .sk-main > .ctrl-sq-btn{flex:1;}',
    /* 펼침 때 위로 슬라이드되어 올라오는 줄: 반납하기·비상등 */
    '#caro-sk-sheet .sk-extra{display:flex;gap:10px;max-height:0;opacity:0;overflow:hidden;margin-top:0;',
      'transition:max-height .34s cubic-bezier(.4,0,.2,1),opacity .26s ease,margin-top .34s cubic-bezier(.4,0,.2,1);}',
    '#caro-sk-sheet .sk-extra > .ctrl-sq-btn{flex:1;}',
    '#caro-sk-sheet.expanded .sk-extra{max-height:120px;opacity:1;margin-top:10px;}',

    /* 반납(return) — 밝은 카드 + 새로고침 아이콘 */
    '#caro-sk-sheet #ctrl-btn-return{background:#eef1f6 !important;border-color:transparent !important;}',
    '#caro-sk-sheet #ctrl-btn-return .ctrl-sq-icon{display:flex !important;color:var(--accent-2) !important;margin-bottom:5px !important;}',
    '#caro-sk-sheet #ctrl-btn-return .ctrl-sq-icon svg{width:23px;height:23px;}',
    '#caro-sk-sheet #ctrl-btn-return .ctrl-sq-label{color:var(--text-1) !important;font-weight:700 !important;font-size:.8rem !important;}'
  ].join('');
  (document.head||document.documentElement).appendChild(st);

  var CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>';
  var REFRESH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>';

  function byId(id){ return document.getElementById(id); }

  var B={};
  function grabButtons(){
    B.unlock=byId('ctrl-btn-unlock'); B.lock=byId('ctrl-btn-lock');
    B.hazard=byId('ctrl-btn-hazard'); B.photo=byId('ctrl-photo-toggle');
    B.locate=byId('ctrl-btn-locate'); B.ext=byId('ctrl-btn-extend');
    B.ret=byId('ctrl-btn-return'); B.acc=byId('caro-btn-acc');
    return !!(B.unlock && B.lock && B.ret);
  }

  var skExpanded=false;

  function buildSheet(){
    if(!byId('caro-sk-scrim')){
      var scrim=document.createElement('div'); scrim.id='caro-sk-scrim';
      scrim.onclick=function(){ collapse(); };
      document.body.appendChild(scrim);
    }
    if(!byId('caro-sk-sheet')){
      var sheet=document.createElement('div'); sheet.id='caro-sk-sheet';
      sheet.innerHTML=
        '<div class="sk-grip" id="sk-grip"><div class="sk-handle"></div>'+
          '<div class="sk-head"><span class="sk-title">스마트키</span>'+
            '<span class="sk-state off" id="sk-state">OFF</span></div>'+
        '</div>'+
        '<div class="sk-main" id="sk-main"></div>'+
        '<div class="sk-extra" id="sk-extra"></div>';
      document.body.appendChild(sheet);
      byId('sk-grip').onclick=function(){ toggle(); };
    }
  }

  /* 시트 밖 본문 '차량 이용' (주행전 사진·시간 연장·사고 신고) */
  function buildExtra(){
    var box=document.querySelector('#home-ctrl-modal .home-ctrl-box'); if(!box) return;
    var extra=byId('caro-ctrl-extra');
    if(!extra){
      extra=document.createElement('div'); extra.id='caro-ctrl-extra';
      extra.innerHTML='<div class="cce-label">차량 이용</div><div class="cce-row" id="cce-row"></div>';
      var anchor=byId('caro-ctrl-fuel')||document.querySelector('#home-ctrl-modal .ctrl-info-section');
      if(anchor && anchor.parentNode){ anchor.parentNode.insertBefore(extra, anchor.nextSibling); }
      else { box.appendChild(extra); }
    }
    var row=byId('cce-row');
    if(row){ [B.photo,B.ext,B.acc].forEach(function(b){ if(b) row.appendChild(b); }); }
  }

  function styleReturn(){
    if(!B.ret) return;
    var ic=B.ret.querySelector('.ctrl-sq-icon');
    if(ic && !ic.querySelector('svg')) ic.innerHTML=REFRESH;
    var lb=B.ret.querySelector('.ctrl-sq-label');
    if(lb && lb.textContent.trim()==='반납') lb.textContent='반납하기';
  }

  function renderStage(){
    var ex=byId('sk-extra'), mn=byId('sk-main');
    if(ex){ /* 위로 슬라이드되어 올라오는 줄 */ if(B.ret) ex.appendChild(B.ret); if(B.hazard) ex.appendChild(B.hazard); }
    if(mn){ /* 항상 보이는 줄 */ if(B.unlock) mn.appendChild(B.unlock); if(B.lock) mn.appendChild(B.lock); }
    styleReturn();
  }

  function syncState(){
    var stEl=byId('sk-state'); if(!stEl) return;
    var on=!!(B.unlock && !B.unlock.disabled);
    stEl.textContent=on?'ON':'OFF';
    stEl.className='sk-state '+(on?'on':'off');
  }

  function setExpanded(v){
    skExpanded=v;
    var sheet=byId('caro-sk-sheet'); if(sheet) sheet.classList.toggle('expanded', v);
    document.body.classList.toggle('caro-sk-expanded', v);
    renderStage(); syncState();
  }
  function toggle(){ setExpanded(!skExpanded); }
  function collapse(){ setExpanded(false); }
  function showSheet(){ var s=byId('caro-sk-sheet'); if(s) s.classList.add('on'); }
  function hideSheet(){ var s=byId('caro-sk-sheet'); if(s){ s.classList.remove('on'); s.classList.remove('expanded'); } document.body.classList.remove('caro-sk-expanded'); skExpanded=false; }
  window.caroSmartKeyCollapse=collapse;

  function rebuild(){ if(!grabButtons()) return false; buildSheet(); buildExtra(); renderStage(); showSheet(); setExpanded(false); return true; }

  function onOpen(){
    var tries=0;
    var iv=setInterval(function(){ tries++; if(rebuild()||tries>25) clearInterval(iv); },50);
    setTimeout(rebuild, 320);
  }

  /* openHomeCtrl 한 번 더 래핑 (기존 enhanceCtrlPage 뒤에 실행) */
  if(typeof window.openHomeCtrl==='function' && !window.openHomeCtrl.__caroSK2){
    var _o=window.openHomeCtrl;
    window.openHomeCtrl=function(){ var r; try{ r=_o.apply(this,arguments); }catch(e){} onOpen(); return r; };
    window.openHomeCtrl.__caroSK2=true;
  }
  /* 닫을 때 시트 숨김 + 접힘 초기화 */
  ['closeHomeCtrl','closeHomeCtrlDirect'].forEach(function(name){
    if(typeof window[name]==='function' && !window[name].__caroSK2){
      var _c=window[name];
      window[name]=function(){ try{ hideSheet(); }catch(e){} return _c.apply(this,arguments); };
      window[name].__caroSK2=true;
    }
  });
  /* 안전장치: 차량 제어 모달이 열려있는 동안엔 시트를 항상 표시(사라지면 즉시 복구)
     · 차량 제어(IoT)는 안전이 걸린 기능 → 백그라운드에서도 절대 멈추지 않음 */
  setInterval(function(){ var m=byId('home-ctrl-modal'); if(m&&m.classList.contains('open')){ showSheet(); syncState(); } else { hideSheet(); } }, 700);

  console.log('[컨트롤러] ✅ 스마트키 바텀시트 v2 (CARO 스타일)');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 예약 진입 안전장치 (점검중·미반납/연체 차량 차단)
   ───────────────────────────────────────────────────────────
   · 어떤 경로로 selectCar 가 호출되든, 점검중이거나 아직 반납되지 않은
     (연체 포함) 차량은 예약 화면 진입을 막음.
   · 판정은 caroCarState(점검/미반납/대여중 통합)를 사용.
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function blockMsg(state){
    var m=(state && state.cls==='maint') ? '점검 중인 차량은 대여할 수 없습니다.'
                                          : '현재 대여 중인 차량입니다. 반납 후 이용 가능합니다.';
    if(window.showToast) showToast(m); else alert(m);
  }
  function guardSelect(name){
    if(typeof window[name]!=='function' || window[name].__caroAvailGuard) return;
    var orig=window[name];
    window[name]=function(carId){
      try{
        var car=null;
        var arr=(name==='selectBlCar')?(window.BL_CARS||[]):(window.CARS_DATA||[]);
        for(var i=0;i<arr.length;i++){ if(arr[i] && arr[i].id===carId){ car=arr[i]; break; } }
        if(car && window.caroCarState){
          var stt=window.caroCarState(car);
          if(stt && !stt.ok){ blockMsg(stt); return; }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    window[name].__caroAvailGuard=true;
  }
  guardSelect('selectCar');
  guardSelect('selectBlCar');
  console.log('[예약] ✅ 점검중·미반납/연체 차량 예약 진입 차단');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 미납(채권) 차단 + 홈 하단 미납 바 + 장기미납 정지 v1
   ───────────────────────────────────────────────────────────
   · 반납 정산이 미결제(채권)로 남으면:
       - 홈 하단 '차량 제어' 바 자리에 [차량번호 · 미납금액 · 납부] 바 표시
       - 미납이 있는 동안 모든 차량 신규 대여 불가
   · 미납 발생 후 3주(21일) 이상 경과한 건을 납부하면 → 그 시점부터
     30일 이용 정지 (납부는 정지 중에도 항상 가능, 정지 해제와는 별개)
   · 정지는 (면허번호 + 아이디) 서명으로 식별해 localStorage + Firestore(best-effort) 보관
   · customer-redesign.js 맨 아래 추가. 기존 코드 안 건드림.
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var UNPAID_KEY='caro_apd_unpaid';
  var SUSP_KEY='caro_suspension_v1';
  var LONG_DAYS=21;     /* 3주 이상 미납 = 장기 */
  var SUSPEND_DAYS=30;  /* 한 달 정지 */
  var HABITUAL_COUNT=3; /* 누적 미납 3회 이상 = 상습 (완납 포함) */
  var DAY=86400000;

  function won(n){ try{ return (Number(n)||0).toLocaleString('ko-KR'); }catch(e){ return n; } }
  function toast(m){ if(window.showToast) showToast(m); else alert(m); }
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function fmtDay(ts){ var d=new Date(ts); if(isNaN(d.getTime())) return '-'; return d.getFullYear()+'.'+('0'+(d.getMonth()+1)).slice(-2)+'.'+('0'+d.getDate()).slice(-2); }

  /* ── 미납 데이터 ── */
  function unpaidList(){ try{ var l=JSON.parse(localStorage.getItem(UNPAID_KEY)||'[]'); return Array.isArray(l)?l:[]; }catch(e){ return []; } }
  function unpaidTotal(){ var t=0; unpaidList().forEach(function(x){ t+=(Number(x.amount)||0); }); return t; }
  function hasUnpaid(){ return unpaidTotal()>0; }
  function oldestUnpaidTs(){
    var ts=null; unpaidList().forEach(function(x){ var t=x.ts||(x.date?new Date(x.date.replace(/\./g,'-')).getTime():null); if(t&&(ts===null||t<ts)) ts=t; });
    return ts;
  }
  function oldestUnpaidDays(){ var t=oldestUnpaidTs(); return t?Math.floor((Date.now()-t)/DAY):0; }
  function latestUnpaidCarNo(){ var l=unpaidList(); for(var i=0;i<l.length;i++){ if(l[i].carNumber) return l[i].carNumber; } return ''; }
  function clearUnpaid(){ try{ localStorage.setItem(UNPAID_KEY, JSON.stringify([])); }catch(e){} }

  /* ── 사용자 서명 (면허번호 + 아이디) ── */
  function userSig(){
    var lic='';
    try{ var L=JSON.parse(localStorage.getItem('caro_license')||'null'); if(L&&L.number) lic=String(L.number); }catch(e){}
    var id=(window.userInfo&&(userInfo.id||userInfo.uid))||'';
    return 'lic:'+lic+'|id:'+id;
  }

  /* ── Firestore 연동 (관제 대시보드용) ── */
  function fsReady(){ return !!(window.FB_DB && window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc); }
  function userIdentity(){
    var lic='';
    try{ var L=JSON.parse(localStorage.getItem('caro_license')||'null'); if(L&&L.number) lic=String(L.number); }catch(e){}
    var ui=window.userInfo||{};
    var uid=(window.FB_AUTH&&FB_AUTH.currentUser&&FB_AUTH.currentUser.uid)||ui.uid||'';
    return { uid:uid, idName:ui.id||'', userName:ui.name||ui.id||'', email:ui.email||'', license:lic };
  }
  window.caroDebtFS={
    /* 미납(채권) 1건 기록 → unpaid_debts/{id} */
    writeDebt:function(entry){
      if(!fsReady()||!entry) return;
      try{
        var db=window.FB_DB, fn=window.FB_FN, u=userIdentity();
        if(!u.uid) return;
        var id=entry.id||('debt_'+Date.now());
        fn.setDoc(fn.doc(db,'unpaid_debts',id),{
          id:id, userId:u.uid, idName:u.idName, userName:u.userName, email:u.email, license:u.license,
          bookNo:entry.bookNo||'', carName:entry.carName||'', carNumber:entry.carNumber||'',
          amount:+entry.amount||0,
          breakdown: entry.breakdown?{distCost:+entry.breakdown.distCost||0,hipass:+entry.breakdown.hipass||0,penalty:+entry.breakdown.penalty||0}:null,
          status:'unpaid', createdAt:new Date(entry.ts||Date.now()).toISOString(), createdTs:entry.ts||Date.now(), paidAt:null
        },{merge:true});
      }catch(e){}
    },
    /* 본인 미납 전부 납부처리 */
    markAllPaid:function(){
      if(!fsReady()) return;
      try{
        var db=window.FB_DB, fn=window.FB_FN, u=userIdentity();
        if(!u.uid||!fn.getDocs||!fn.query||!fn.where) return;
        var q=fn.query(fn.collection(db,'unpaid_debts'),fn.where('userId','==',u.uid),fn.where('status','==','unpaid'));
        fn.getDocs(q).then(function(snap){ snap.forEach(function(d){
          fn.setDoc(fn.doc(db,'unpaid_debts',d.id),{status:'paid',paidAt:new Date().toISOString()},{merge:true});
        }); }).catch(function(){});
      }catch(e){}
    },
    /* 이용 정지 기록 → suspensions/{uid} */
    writeSuspension:function(until,reason,opts){
      if(!fsReady()) return;
      try{
        var db=window.FB_DB, fn=window.FB_FN, u=userIdentity();
        if(!u.uid) return;
        var data={
          userId:u.uid, idName:u.idName, userName:u.userName, license:u.license,
          until: until?new Date(until).toISOString():null, untilTs: until||null,
          reason:reason||'장기 미납', createdAt:new Date().toISOString(), active:true
        };
        if(opts){ data.habitual=!!opts.habitual; data.requiresApproval=!!opts.requiresApproval; if(opts.count!=null) data.count=opts.count; }
        else { data.habitual=false; data.requiresApproval=false; }
        fn.setDoc(fn.doc(db,'suspensions',u.uid),data,{merge:true});
      }catch(e){}
    },
    /* 본인 누적 미납 발생 횟수(완납 포함) → cb(count) */
    countDebts:function(cb){
      if(!fsReady()){ cb&&cb(0); return; }
      try{
        var db=window.FB_DB, fn=window.FB_FN, u=userIdentity();
        if(!u.uid||!fn.getDocs||!fn.query||!fn.where){ cb&&cb(0); return; }
        var q=fn.query(fn.collection(db,'unpaid_debts'),fn.where('userId','==',u.uid));
        fn.getDocs(q).then(function(snap){ cb&&cb(snap.size||0); }).catch(function(){ cb&&cb(0); });
      }catch(e){ cb&&cb(0); }
    }
  };

  /* ── 관리자 처리결과를 고객 앱에 반영 (FS → 로컬 동기화) ── */
  function startDebtSync(){
    if(!fsReady()) return;
    var fn=window.FB_FN, db=window.FB_DB, u=userIdentity();
    if(!u.uid||!fn.onSnapshot) return;
    /* 미납 동기화 (FS를 진실원본으로) */
    try{
      if(fn.query&&fn.where){
        var q=fn.query(fn.collection(db,'unpaid_debts'),fn.where('userId','==',u.uid),fn.where('status','==','unpaid'));
        fn.onSnapshot(q,function(snap){
          var list=[];
          snap.forEach(function(d){ var x=d.data()||{};
            list.push({ id:x.id||d.id, title:'차량 반납 정산 미결제 — '+(x.carName||'차량'),
              date:(x.createdAt||'').slice(0,10).replace(/-/g,'.'), ts:x.createdTs||Date.parse(x.createdAt)||Date.now(),
              amount:+x.amount||0, bookNo:x.bookNo||'', carNumber:x.carNumber||'', carName:x.carName||'', breakdown:x.breakdown||null }); });
          list.sort(function(a,b){ return b.ts-a.ts; });
          try{ localStorage.setItem(UNPAID_KEY, JSON.stringify(list)); }catch(e){}
          syncUnpaidBar();
          try{ if(window.renderCars) renderCars(); }catch(e){}
        },function(){});
      }
    }catch(e){}
    /* 정지 동기화 (관리자 해제 시 로컬도 해제) */
    try{
      fn.onSnapshot(fn.doc(db,'suspensions',u.uid),function(ds){
        var s=(ds&&ds.exists)?ds.data():null;
        var activeHold = !!(s && s.active!==false && (s.requiresApproval===true || s.habitual===true));
        var activeTimed = !!(s && s.active!==false && (s.untilTs>Date.now()));
        if(!s || s.active===false || (!activeHold && !activeTimed)){
          var cur=readSusp(); if(cur && cur.sig===userSig()){ try{ localStorage.removeItem(SUSP_KEY); }catch(e){} }
        } else {
          try{ localStorage.setItem(SUSP_KEY, JSON.stringify({ sig:userSig(), until:s.untilTs||0, hold:activeHold, at:Date.parse(s.createdAt)||Date.now() })); }catch(e){}
        }
        syncUnpaidBar();
        try{ if(window.renderCars) renderCars(); }catch(e){}
      },function(){});
    }catch(e){}
  }
  (function waitAuth(){ var t=0; var iv=setInterval(function(){ t++;
    if(fsReady() && window.FB_AUTH && FB_AUTH.currentUser){ clearInterval(iv); startDebtSync(); }
    else if(t>60){ clearInterval(iv); } },500); })();

  /* ── 이용 정지 ── */
  function readSusp(){ try{ return JSON.parse(localStorage.getItem(SUSP_KEY)||'null'); }catch(e){ return null; } }
  function suspValid(){ var s=readSusp(); if(!s) return null; if(s.sig && s.sig!==userSig()) return null; return s; }
  function suspendedUntil(){ var s=suspValid(); return (s&&s.until)?s.until:0; }
  function isHold(){ var s=suspValid(); return !!(s && s.hold); }   /* 상습: 관리자 승인 전까지 (자동해제 없음) */
  function isSuspended(){ return isHold() || suspendedUntil()>Date.now(); }
  function applySuspension(days){
    var until=Date.now()+days*DAY;
    var rec={ sig:userSig(), until:until, hold:false, at:Date.now() };
    try{ localStorage.setItem(SUSP_KEY, JSON.stringify(rec)); }catch(e){}
    /* Firestore: suspensions/{uid} (관제 대시보드 연동) */
    try{ if(window.caroDebtFS&&window.caroDebtFS.writeSuspension) window.caroDebtFS.writeSuspension(until,'장기 미납(3주 이상) 납부'); }catch(e){}
    return until;
  }
  /* 상습(3회+) 완납 시 — 자동 해제 없이 관리자 승인 대기로 묶음 */
  function applyAdminHold(count){
    var rec={ sig:userSig(), until:0, hold:true, at:Date.now() };
    try{ localStorage.setItem(SUSP_KEY, JSON.stringify(rec)); }catch(e){}
    try{ if(window.caroDebtFS&&window.caroDebtFS.writeSuspension)
      window.caroDebtFS.writeSuspension(null,'상습 미납(누적 '+count+'회) — 관리자 승인 대기',{habitual:true,requiresApproval:true,count:count}); }catch(e){}
  }

  /* ── 대여 가능 여부 (전역) ── */
  function canRent(){
    if(isSuspended()) return {ok:false, reason:'suspended', until:suspendedUntil(), hold:isHold()};
    if(hasUnpaid())  return {ok:false, reason:'unpaid', amount:unpaidTotal()};
    return {ok:true};
  }
  window.caroCanRent=canRent;
  window.caroHasUnpaid=hasUnpaid;
  window.caroIsSuspended=isSuspended;

  /* ── 납부 ── */
  function payAll(){
    var total=unpaidTotal();
    if(total<=0){ toast('납부할 미납금이 없습니다.'); return; }
    var longOverdue=oldestUnpaidDays()>=LONG_DAYS;
    /* (데모) 등록 카드로 결제 처리 — 실제 PG 연동 시 성공 콜백에서 아래 실행 */
    clearUnpaid();
    try{ if(window.caroDebtFS&&window.caroDebtFS.markAllPaid) window.caroDebtFS.markAllPaid(); }catch(e){}  /* Firestore 납부처리 */
    var finishPay=function(count){
      if(count>=HABITUAL_COUNT){
        /* 상습(누적 3회+): 완납해도 자동 해제 없이 관리자 승인 대기 */
        applyAdminHold(count);
        toast('미납금 '+won(total)+'원이 납부되었습니다. 다만 상습 미납(누적 '+count+'회)으로 관리자 승인 전까지 이용이 제한됩니다.');
      } else if(longOverdue){
        var until=applySuspension(SUSPEND_DAYS);
        toast('미납금 '+won(total)+'원이 납부되었습니다. 다만 장기(3주 이상) 미납으로 '+SUSPEND_DAYS+'일간 이용이 정지됩니다. (해제 '+fmtDay(until)+')');
      } else {
        toast('미납금 '+won(total)+'원이 모두 납부되었습니다. 정상 이용 가능합니다.');
      }
      syncUnpaidBar();
      try{ if(window.renderCars) renderCars(); if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
    };
    if(window.caroDebtFS&&window.caroDebtFS.countDebts) window.caroDebtFS.countDebts(finishPay);
    else finishPay(0);
  }
  window.caroPayUnpaid=function(){
    var total=unpaidTotal();
    var long=oldestUnpaidDays()>=LONG_DAYS;
    var msg='미납금 '+won(total)+'원을 납부하시겠습니까?'+(long?'\n\n※ 3주 이상 장기 미납으로, 납부하더라도 '+SUSPEND_DAYS+'일간 이용이 정지됩니다.':'');
    if(confirm(msg)) payAll();
  };

  /* ── 홈 하단 미납/정지 바 ── */
  var css=document.createElement('style'); css.id='caro-unpaid-bar-css';
  css.textContent=[
    '#caro-unpaid-bar{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(72px + var(--sab));',
      'width:calc(100% - 32px);max-width:448px;z-index:485;display:none;align-items:center;gap:11px;',
      'padding:11px 12px 11px 14px;background:linear-gradient(135deg,#7a1f1f,#5e1717);border:1px solid rgba(255,255,255,.12);',
      'border-radius:16px;box-shadow:0 8px 24px -8px rgba(120,20,20,.5);}',
    '#caro-unpaid-bar.show{display:flex;}',
    '#caro-unpaid-bar .ub-ic{width:34px;height:34px;flex-shrink:0;border-radius:9px;background:rgba(255,255,255,.14);display:flex;align-items:center;justify-content:center;color:#fff;}',
    '#caro-unpaid-bar .ub-ic svg{width:20px;height:20px;}',
    '#caro-unpaid-bar .ub-info{flex:1;min-width:0;}',
    '#caro-unpaid-bar .ub-t1{font-size:.82rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#caro-unpaid-bar .ub-t2{font-size:.68rem;color:rgba(255,255,255,.82);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#caro-unpaid-bar .ub-amt{font-family:"Oswald",sans-serif;font-weight:700;}',
    '#caro-unpaid-bar .ub-btn{flex-shrink:0;background:#fff;color:#7a1f1f;border:none;border-radius:11px;padding:10px 16px;font-size:.84rem;font-weight:800;cursor:pointer;font-family:inherit;}',
    '#caro-unpaid-bar .ub-btn:active{opacity:.85;}',
    /* 정지(미납 없음) 바 */
    '#caro-unpaid-bar.susp{background:linear-gradient(135deg,#3a3f47,#23262c);}',
    '#caro-unpaid-bar.susp .ub-btn{display:none;}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  var WARN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
  var LOCK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';

  function ensureBar(){
    var bar=document.getElementById('caro-unpaid-bar');
    if(!bar){ bar=document.createElement('div'); bar.id='caro-unpaid-bar'; document.body.appendChild(bar); }
    return bar;
  }
  function syncUnpaidBar(){
    var home=document.getElementById('home-screen');
    var homeActive=home && home.classList.contains('active');
    var bar=document.getElementById('caro-unpaid-bar');
    var unpaid=hasUnpaid(), susp=isSuspended();

    if(!homeActive || (!unpaid && !susp)){
      if(bar) bar.classList.remove('show');
      return;
    }
    bar=ensureBar();
    /* 차량 제어 바와 겹치면 위로 올림 */
    var rb=document.getElementById('caro-rental-bar');
    var rbOn=rb && rb.style.display!=='none' && getComputedStyle(rb).display!=='none';
    bar.style.bottom = rbOn ? 'calc(140px + var(--sab))' : 'calc(72px + var(--sab))';

    if(unpaid){
      bar.classList.remove('susp');
      var no=latestUnpaidCarNo();
      var days=oldestUnpaidDays();
      bar.innerHTML=
        '<span class="ub-ic">'+WARN+'</span>'+
        '<div class="ub-info">'+
          '<div class="ub-t1">미납금 <span class="ub-amt">'+won(unpaidTotal())+'원</span></div>'+
          '<div class="ub-t2">'+(no?('차량 '+esc(no)+' · '):'')+'납부 전까지 대여 불가'+(days>=LONG_DAYS?' · 장기미납':'')+'</div>'+
        '</div>'+
        '<button class="ub-btn" onclick="if(window.caroPayUnpaid)caroPayUnpaid()">납부</button>';
      bar.classList.add('show');
    } else { /* 정지/제한 중(미납 없음) */
      bar.classList.add('susp');
      var holdMode=isHold();
      bar.innerHTML=
        '<span class="ub-ic">'+LOCK+'</span>'+
        '<div class="ub-info">'+
          '<div class="ub-t1">'+(holdMode?'이용 제한 중':'이용 정지 중')+'</div>'+
          '<div class="ub-t2">'+(holdMode?'상습 미납 · 관리자 승인 후 이용 가능':('장기 미납으로 정지 · 해제일 '+fmtDay(suspendedUntil())))+'</div>'+
        '</div>';
      bar.classList.add('show');
    }
    /* 홈 본문 하단 여백 확보 */
    var body=document.querySelector('#home-screen .home-body');
    if(body){ var cur=parseInt(body.style.paddingBottom||'0',10)||0; if(cur<130) body.style.paddingBottom='130px'; }
  }
  window.caroSyncUnpaidBar=syncUnpaidBar;

  syncUnpaidBar();
  setInterval(syncUnpaidBar, 3000);
  var hs=document.getElementById('home-screen');
  if(hs && window.MutationObserver){ new MutationObserver(syncUnpaidBar).observe(hs,{attributes:true,attributeFilter:['class']}); }

  /* ── 대여 차단: caroCarState 한 번 더 래핑 (미납·정지 → 전 차량 불가) ── */
  if(typeof window.caroCarState==='function' && !window.caroCarState.__caroUnpaidWrap){
    var _prevState=window.caroCarState;
    window.caroCarState=function(car){
      var g=canRent();
      if(!g.ok) return { ok:false, label:(g.reason==='suspended'?'이용 정지':'미납'), cls:(g.reason==='suspended'?'maint':'rented') };
      return _prevState.apply(this, arguments);
    };
    window.caroCarState.__caroUnpaidWrap=true;
  }

  /* ── 예약 진입 차단: selectCar / selectBlCar 래핑 (구체적 안내) ── */
  ['selectCar','selectBlCar'].forEach(function(name){
    if(typeof window[name]!=='function' || window[name].__caroUnpaidGuard) return;
    var orig=window[name];
    window[name]=function(){
      var g=canRent();
      if(!g.ok){
        if(g.reason==='suspended') toast(g.hold ? '상습 미납으로 이용이 제한되었습니다. 관리자 승인 후 이용 가능합니다.' : ('장기 미납으로 이용이 정지되었습니다. 해제일: '+fmtDay(g.until)));
        else toast('미납금('+won(g.amount)+'원)이 있어 대여할 수 없습니다. 먼저 납부해 주세요.');
        return;
      }
      return orig.apply(this, arguments);
    };
    window[name].__caroUnpaidGuard=true;
  });

  console.log('[미납] ✅ 미납 차단 + 하단 미납 바 + 장기미납('+LONG_DAYS+'일→'+SUSPEND_DAYS+'일 정지) v1');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 차량 제어 SOCAR식 메뉴 v1
   ───────────────────────────────────────────────────────────
   · 차량 제어(#home-ctrl-modal) 본문(연료바 아래)에 SOCAR '내 예약'식
     메뉴 리스트를 주입. 스마트키 시트·게이팅은 그대로 유지.
   · 항목 → 실제 기능 연결:
       시간 연장        → openExtendSheet()
       차량 확인(주행전)→ openPhotoModal()
       취소수수료·페널티→ cs-screen
       고객센터         → cs-screen
       예약 취소하기    → cancelReservation()
   · 기존 '차량 이용' 임시 섹션(#caro-ctrl-extra)은 숨김(메뉴로 대체).
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function esc(t){ return (''+(t==null?'':t)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function getRes(){ try{ return window.getActiveRes?getActiveRes():null; }catch(e){ return null; } }
  function asDate(v){ var d=(v instanceof Date)?v:new Date(v); return isNaN(d.getTime())?null:d; }
  function fmtDT(v){ var d=asDate(v); if(!d) return '-'; var dy=['일','월','화','수','목','금','토'][d.getDay()];
    var p=function(n){return n<10?'0'+n:n;}; return (d.getMonth()+1)+'/'+d.getDate()+' ('+dy+') '+p(d.getHours())+':'+p(d.getMinutes()); }
  function placeOf(res,which){
    if(!res) return '지정 주차 구역';
    var c=res.car||{};
    return res[which+'Name']||res[which+'Place']||res[which+'Zone']||res.zoneName||res.zone||c.zone||c.location||'지정 주차 구역';
  }

  /* ── 아이콘 ── */
  var I={
    clock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    ext:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>',
    user:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c.6-3.4 3.2-5.2 6.5-5.2s5.9 1.8 6.5 5.2"/></svg>',
    cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l1.5-2h7L18 8h2a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.2"/></svg>',
    warn:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 4 2.4 18a1.7 1.7 0 0 0 1.5 2.6h16.2A1.7 1.7 0 0 0 21.6 18L13.7 4a1.9 1.9 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
    head:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13a8 8 0 0 1 16 0"/><rect x="2.5" y="13" width="4" height="6" rx="2"/><rect x="17.5" y="13" width="4" height="6" rx="2"/><path d="M20 19a4 4 0 0 1-4 3h-2"/></svg>',
    pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s7-6 7-11a7 7 0 0 0-14 0c0 5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  /* ── CSS ── */
  var css=document.createElement('style'); css.id='caro-ctrl-menu-css';
  css.textContent=[
    '#caro-ctrl-extra{display:none !important;}',                 /* 옛 임시 섹션 숨김 */
    '#caro-ctrl-menu{padding:4px 16px 8px;}',
    '#caro-ctrl-menu .cm-place{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:14px;margin-bottom:9px;}',
    '#caro-ctrl-menu .cm-place .cm-pic{width:32px;height:32px;flex-shrink:0;border-radius:9px;background:#eef2f7;display:flex;align-items:center;justify-content:center;color:#4b5563;}',
    '#caro-ctrl-menu .cm-place .cm-pic svg{width:18px;height:18px;}',
    '#caro-ctrl-menu .cm-place .cm-pt{flex:1;min-width:0;}',
    '#caro-ctrl-menu .cm-place .cm-pl{font-size:.72rem;color:var(--text-m,#8a8f98);margin-bottom:2px;}',
    '#caro-ctrl-menu .cm-place .cm-pv{font-size:.9rem;font-weight:700;color:#18191c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '#caro-ctrl-menu .cm-list{background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;overflow:hidden;margin-bottom:9px;}',
    '#caro-ctrl-menu .cm-row{display:flex;align-items:center;gap:13px;width:100%;text-align:left;background:none;border:none;border-bottom:1px solid var(--border-l,#eef1f5);padding:15px 14px;cursor:pointer;font-family:inherit;}',
    '#caro-ctrl-menu .cm-row:last-child{border-bottom:none;}',
    '#caro-ctrl-menu .cm-row:active{background:#f6f8fb;}',
    '#caro-ctrl-menu .cm-ic{width:22px;height:22px;flex-shrink:0;color:#3a3f47;display:flex;align-items:center;justify-content:center;}',
    '#caro-ctrl-menu .cm-ic svg{width:21px;height:21px;}',
    '#caro-ctrl-menu .cm-lb{flex:1;min-width:0;font-size:.92rem;font-weight:600;color:#18191c;}',
    '#caro-ctrl-menu .cm-val{font-size:.82rem;color:var(--text-m,#8a8f98);font-weight:600;white-space:nowrap;}',
    '#caro-ctrl-menu .cm-val.go{color:#2f6df0;}',
    '#caro-ctrl-menu .cm-chev{color:#c4c9d0;font-size:1.1rem;margin-left:2px;}',
    '#caro-ctrl-menu .cm-cancel{width:100%;text-align:center;background:#fff;border:1px solid var(--border-l,#e7eaef);border-radius:14px;color:#b23a3a;font-size:.9rem;font-weight:700;padding:15px;font-family:inherit;cursor:pointer;}',
    '#caro-ctrl-menu .cm-cancel:active{opacity:.6;}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  function call(fn){ try{ if(typeof window[fn]==='function') window[fn](); }catch(e){} }
  function goScreen(id){
    try{ if(window.closeHomeCtrlDirect) closeHomeCtrlDirect(); else if(window.closeHomeCtrl) closeHomeCtrl(); }catch(e){}
    setTimeout(function(){ try{ history.pushState({screen:id},'',''); }catch(e){} try{ if(window.goTo) goTo(id); }catch(e){} },180);
  }
  function toast(m){ if(window.showToast) showToast(m); else alert(m); }

  function rowsHtml(res){
    var rentT = res ? fmtDT(res.start) : '-';
    var h='';
    /* 장소 */
    h+='<div class="cm-place"><span class="cm-pic">'+I.pin+'</span><div class="cm-pt"><div class="cm-pl">대여 장소</div><div class="cm-pv">'+esc(placeOf(res,'pickup'))+'</div></div></div>';
    h+='<div class="cm-place"><span class="cm-pic">'+I.pin+'</span><div class="cm-pt"><div class="cm-pl">반납 장소</div><div class="cm-pv">'+esc(placeOf(res,'return'))+'</div></div></div>';
    /* 리스트 */
    h+='<div class="cm-list">'
      +'<button class="cm-row" data-act="extend"><span class="cm-ic">'+I.ext+'</span><span class="cm-lb">시간 연장</span><span class="cm-chev">\u203A</span></button>'
      +'<button class="cm-row" data-act="codriver"><span class="cm-ic">'+I.user+'</span><span class="cm-lb">추가운전자 <span style="font-size:.68rem;color:#999;font-weight:400;">대여자 외 1명</span></span><span class="cm-val go">등록하기</span><span class="cm-chev">\u203A</span></button>'
      +'<button class="cm-row" data-act="photo"><span class="cm-ic">'+I.cam+'</span><span class="cm-lb">차량 확인 (주행전 사진)</span><span class="cm-val go">사진 등록하기</span><span class="cm-chev">\u203A</span></button>'
      +'<button class="cm-row" data-act="penalty"><span class="cm-ic">'+I.warn+'</span><span class="cm-lb">취소수수료 및 페널티 안내</span><span class="cm-chev">\u203A</span></button>'
      +'<button class="cm-row" data-act="cs"><span class="cm-ic">'+I.head+'</span><span class="cm-lb">고객센터</span><span class="cm-chev">\u203A</span></button>'
      +'<button class="cm-row" data-act="accident"><span class="cm-ic" style="color:#b23a3a">'+I.warn+'</span><span class="cm-lb">사고 신고</span><span class="cm-chev">\u203A</span></button>'
      +'</div>';
    /* 예약 취소 */
    h+='<button class="cm-cancel" data-act="cancel">예약 취소하기</button>';
    return h;
  }

  function onAct(act){
    if(act==='extend') call('openExtendSheet');
    else if(act==='photo'){ if(window.toggleCtrlPhoto) toggleCtrlPhoto(); else call('openPhotoModal'); }
    else if(act==='penalty') goScreen('cs-screen');
    else if(act==='cs') goScreen('cs-screen');
    else if(act==='accident') goScreen('accident-screen');
    else if(act==='codriver'){ if(window.caroOpenExtraDriver) caroOpenExtraDriver(); else toast('추가운전자 등록 기능을 불러오지 못했습니다.'); }
    else if(act==='cancel'){
      try{ if(window.closeHomeCtrlDirect) closeHomeCtrlDirect(); }catch(e){}
      setTimeout(function(){ call('cancelReservation'); },180);
    }
  }

  function inject(){
    var box=document.querySelector('#home-ctrl-modal .home-ctrl-box'); if(!box) return;
    var res=getRes();
    var menu=document.getElementById('caro-ctrl-menu');
    if(!menu){
      menu=document.createElement('div'); menu.id='caro-ctrl-menu';
      /* 연료바 다음, 없으면 정보섹션 다음에 삽입 */
      var anchor=document.getElementById('caro-ctrl-fuel') || document.querySelector('#home-ctrl-modal .ctrl-info-section');
      if(anchor && anchor.parentNode) anchor.parentNode.insertBefore(menu, anchor.nextSibling);
      else box.appendChild(menu);
      menu.addEventListener('click', function(e){
        var r=e.target.closest && e.target.closest('[data-act]'); if(!r) return;
        onAct(r.getAttribute('data-act'));
      });
    }
    menu.innerHTML=rowsHtml(res);
  }

  /* 컨트롤러 열릴 때마다 갱신 */
  if(typeof window.openHomeCtrl==='function'){
    var _o=window.openHomeCtrl;
    window.openHomeCtrl=function(){ var r; try{ r=_o.apply(this,arguments); }catch(e){} setTimeout(inject,30); return r; };
  }
  setTimeout(function(){ if(document.querySelector('#home-ctrl-modal.open')) inject(); }, 600);
  console.log('[차량제어] ✅ SOCAR식 메뉴 v1');
})();

/* ═══════════════════════════════════════════════════════════
   CARO 자동 백업 — "앱 정상 부팅" 신호
   핵심 스크립트(script.js)의 함수가 살아있을 때만 alive 표시.
   → 업데이트 불량으로 script.js가 깨지면 alive 안 켜지고 워치독이 백업 전환.
═══════════════════════════════════════════════════════════ */
(function(){
  function markAlive(){
    try{
      if(typeof window.openModal==='function' && typeof window.goTo==='function'){
        window.__caroAlive = true;
      }
    }catch(e){}
  }
  markAlive();
  /* 혹시 늦게 정의되는 경우 대비해 한 번 더 */
  setTimeout(markAlive, 1500);
  setTimeout(markAlive, 4000);
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 멤버십 플랜 v1
   · 홈 회전 플랜 배너(이벤트 배너 아래) → 탭 시 멤버십 화면
   · 멤버십 화면(CARO 톤 카드) + 내 멤버십 화면
   · 색: 라이트=실버 / 플러스=차콜+골드 / 비즈=블랙+골드
   · 결제/요금계산 백엔드는 추후 — 가입은 데모(localStorage) 저장
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var GOLD='#aeb6c2'; /* ★ 멤버십 리디자인: 골드→실버(카로 대기화면 톤) */
  var css=document.createElement('style'); css.id='caro-membership-css';
  /* ★ 기업전용(비즈) 별도 색상: 딥 네이비 */
  var bizCss=document.createElement('style'); bizCss.id='caro-membership-biz-css';
  bizCss.textContent=[
    '.mplan.biz{background:linear-gradient(165deg,#141e30,#0b1220)!important;}',
    '.biz .mp-glow{background:radial-gradient(circle,rgba(143,179,232,.35),transparent 68%)!important;}',
    '.biz .mp-reco{background:rgba(143,179,232,.22)!important;color:#8fb3e8!important;}',
    '.biz .mp-price .w{color:#8fb3e8!important;}',
    '.biz .mp-benefits b{color:#8fb3e8!important;}',
    '.biz .mp-join{background:#8fb3e8!important;color:#0b1220!important;}',
    '.mm-card.biz{background:linear-gradient(160deg,#141e30,#0b1220)!important;}',
    '.plan-slide.ps-biz{background:linear-gradient(120deg,#141e30,#1d2b45)!important;}',
    '.ps-biz .ps-badge{background:rgba(143,179,232,.22)!important;color:#8fb3e8!important;}',
    '.ps-biz .ps-w{color:#8fb3e8!important;}',
    '.ps-biz .ps-go{background:#8fb3e8!important;color:#0b1220!important;}'
  ].join('\n');
  document.head.appendChild(bizCss);
  css.textContent=[
    /* ── 홈 회전 배너 (이벤트 배너와 동일 사이즈) ── */
    '.plan-slide-wrap{position:relative;margin-bottom:18px;overflow:hidden;border-radius:var(--r2);box-shadow:0 4px 16px rgba(0,0,0,.14);cursor:pointer;}',
    '.plan-slide-track{display:flex;transition:transform .5s cubic-bezier(.4,0,.2,1);}',
    '.plan-slide{flex-shrink:0;width:100%;min-height:108px;padding:18px 20px 14px;display:flex;align-items:center;justify-content:space-between;box-sizing:border-box;}',
    '.plan-slide.ps-lite{background:linear-gradient(120deg,#dfe3e9,#eef1f5);color:#26282d;}',
    '.plan-slide.ps-plus{background:linear-gradient(120deg,#2a2d33,#3a3f47);color:#f2f4f7;}',
    '.plan-slide.ps-biz{background:linear-gradient(120deg,#101216,#20242b);color:#f2f4f7;}',
    '.ps-badge{display:inline-block;font-size:.6rem;font-weight:800;letter-spacing:.05em;padding:3px 8px;border-radius:12px;margin-bottom:7px;}',
    '.ps-lite .ps-badge{background:rgba(24,25,28,.08);color:#5a5e66;}',
    '.ps-plus .ps-badge,.ps-biz .ps-badge{background:rgba(174,182,194,.2);color:'+GOLD+';}',
    '.ps-title{font-size:1.02rem;font-weight:800;letter-spacing:-.01em;}',
    '.ps-desc{font-size:.74rem;opacity:.82;margin-top:2px;}',
    '.ps-price{text-align:right;flex:0 0 auto;padding-left:12px;}',
    '.ps-w{font-family:var(--font);font-weight:800;font-size:1.45rem;line-height:1;}',
    '.ps-plus .ps-w,.ps-biz .ps-w{color:'+GOLD+';}',
    '.ps-u{font-size:.66rem;opacity:.8;}',
    '.ps-go{display:inline-block;margin-top:7px;font-size:.66rem;font-weight:700;padding:5px 11px;border-radius:20px;}',
    '.ps-lite .ps-go{background:#26282d;color:#fff;} .ps-plus .ps-go,.ps-biz .ps-go{background:'+GOLD+';color:#18191c;}',
    '.plan-slide-dots{display:flex;justify-content:center;gap:6px;padding:7px 0 3px;background:rgba(0,0,0,.04);}',
    '.plan-slide-dots span{width:6px;height:6px;border-radius:50%;background:var(--border);transition:all .3s;}',
    '.plan-slide-dots span.on{width:18px;border-radius:14px;background:var(--accent);}',

    /* ── 멤버십 화면 공통 ── */
    '#membership-screen,#my-membership-screen{background:linear-gradient(180deg,#f5f7fa,#eef1f5)!important;display:block!important;align-items:stretch!important;}',
    '.mbs-top{position:sticky;top:0;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:8px;',
      'padding:calc(14px + var(--sat,0px)) 14px 12px;background:rgba(245,247,250,.94);backdrop-filter:blur(8px);border-bottom:1px solid rgba(200,208,218,.7);}',
    '.mbs-back{background:none;border:none;font-size:1.5rem;color:#44474f;cursor:pointer;width:40px;text-align:left;font-family:inherit;}',
    '.mbs-ti{font-weight:800;font-size:1.05rem;}',
    '.mbs-mine{background:none;border:1px solid rgba(200,208,218,.9);border-radius:20px;padding:6px 12px;font-size:.78rem;font-weight:700;color:#44474f;font-family:inherit;cursor:pointer;}',
    '.mbs-body{padding-bottom:40px;}',
    '.mbs-body::-webkit-scrollbar{width:0;}',
    '.mbs-hd{padding:20px 20px 4px;} .mbs-hd h2{font-size:1.45rem;font-weight:800;letter-spacing:-.02em;} .mbs-hd p{color:#888d98;font-size:.86rem;margin-top:4px;}',
    '.mbs-seg{display:flex;gap:6px;margin:14px 18px 0;background:#e9edf2;border-radius:14px;padding:4px;}',
    '.mbs-seg button{flex:1;border:none;background:none;font-family:inherit;font-size:.82rem;font-weight:700;color:#888d98;padding:9px 0;border-radius:11px;cursor:pointer;}',
    '.mbs-seg button.on{background:#fff;color:#18191c;box-shadow:0 2px 8px -4px rgba(20,25,35,.3);}',
    '.mbs-carou{display:flex;gap:14px;overflow-x:auto;padding:18px 18px 8px;scroll-snap-type:x mandatory;justify-content:safe center;}',
    '.mbs-carou::-webkit-scrollbar{height:0;}',
    '.mplan{min-width:270px;scroll-snap-align:center;border-radius:24px;padding:22px 20px;position:relative;overflow:hidden;display:flex;flex-direction:column;min-height:420px;border:1px solid transparent;box-sizing:border-box;}',
    '.mplan.lite{background:#fff;border-color:rgba(200,208,218,.7);color:#18191c;}',
    '.mplan.plus{background:linear-gradient(165deg,#2f333a,#1f2229);color:#f2f4f7;}',
    '.mplan.biz{background:linear-gradient(165deg,#16181d,#0b0c0f);color:#f2f4f7;}',
    '.mp-glow{position:absolute;top:-50px;right:-50px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(174,182,194,.4),transparent 68%);filter:blur(6px);}',
    '.mp-reco{align-self:flex-start;font-size:.64rem;font-weight:800;letter-spacing:.04em;padding:4px 10px;border-radius:20px;margin-bottom:12px;position:relative;}',
    '.lite .mp-reco{background:#eef1f5;color:#5a5e66;} .plus .mp-reco,.biz .mp-reco{background:rgba(174,182,194,.22);color:'+GOLD+';}',
    '.mp-name{font-weight:800;font-size:1.3rem;position:relative;} .plus .mp-name,.biz .mp-name{color:#fff;}',
    '.mp-tag{font-size:.76rem;opacity:.72;margin:3px 0 16px;position:relative;}',
    '.mp-price{display:flex;align-items:baseline;gap:4px;margin-bottom:18px;position:relative;}',
    '.mp-price .w{font-family:var(--font);font-weight:800;font-size:2rem;} .plus .mp-price .w,.biz .mp-price .w{color:'+GOLD+';}',
    '.mp-price .u{font-size:.8rem;opacity:.72;}',
    '.mp-benefits{display:flex;flex-direction:column;gap:10px;position:relative;margin-bottom:20px;}',
    '.mp-benefits div{font-size:.84rem;opacity:.95;line-height:1.4;} .plus .mp-benefits div,.biz .mp-benefits div{color:#e7e9ee;}',
    '.mp-benefits b{font-weight:700;} .plus .mp-benefits b,.biz .mp-benefits b{color:'+GOLD+';}',
    '.mp-join{margin-top:auto;text-align:center;border:none;border-radius:14px;padding:14px;font-family:inherit;font-size:.9rem;font-weight:800;cursor:pointer;position:relative;}',
    '.lite .mp-join{background:#26282d;color:#fff;} .plus .mp-join,.biz .mp-join{background:'+GOLD+';color:#18191c;}',
    '.mp-join.wait{background:#eef1f5!important;color:#888d98!important;}',
    '.mp-cap{text-align:center;font-size:.7rem;opacity:.62;margin-top:8px;position:relative;}',
    '.mbs-note{color:#888d98;font-size:.74rem;text-align:center;line-height:1.5;padding:6px 20px 24px;}',
    '.mbs-carou.corp .mplan.lite,.mbs-carou.corp .mplan.plus{display:none;}',
    '.mbs-carou.personal .mplan.biz{display:none;}',

    /* ── 내 멤버십 ── */
    '.mm-wrap{padding:18px 16px 26px;display:flex;flex-direction:column;gap:14px;}',
    '.mm-card{border-radius:22px;padding:20px 18px;color:#fff;position:relative;overflow:hidden;background:linear-gradient(160deg,#2f333a,#1a1c22);box-shadow:0 14px 30px -16px rgba(20,25,35,.7);}',
    '.mm-card.biz{background:linear-gradient(160deg,#16181d,#0b0c0f);}',
    '.mm-card .glow{position:absolute;right:-30px;top:-30px;width:150px;height:150px;border-radius:50%;background:radial-gradient(circle,rgba(174,182,194,.35),transparent 70%);}',
    '.mm-card .pl{font-size:.74rem;opacity:.8;letter-spacing:.04em;position:relative;}',
    '.mm-card .nm{font-family:var(--font);font-weight:800;font-size:1.7rem;margin:2px 0 12px;color:'+GOLD+';position:relative;}',
    '.mm-card .bill{font-size:.8rem;opacity:.9;position:relative;}',
    '.mm-card .st{position:absolute;top:18px;right:18px;background:rgba(174,182,194,.22);color:'+GOLD+';font-size:.68rem;font-weight:800;padding:4px 10px;border-radius:20px;}',
    '.mm-lbl{font-size:.74rem;font-weight:800;color:#888d98;letter-spacing:.04em;margin:6px 2px 0;}',
    '.mm-quota{display:flex;gap:10px;}',
    '.mm-qbox{flex:1;background:#fff;border:1px solid rgba(200,208,218,.7);border-radius:16px;padding:14px 12px;text-align:center;}',
    '.mm-qn{font-family:var(--font);font-weight:800;font-size:1.35rem;color:#18191c;} .mm-qn small{font-size:.68rem;color:#888d98;}',
    '.mm-ql{font-size:.72rem;color:#888d98;margin-top:3px;}',
    '.mm-bar{height:5px;border-radius:3px;background:#e9edf2;margin-top:9px;overflow:hidden;} .mm-bar i{display:block;height:100%;background:'+GOLD+';}',
    '.mm-rows{background:#fff;border:1px solid rgba(200,208,218,.7);border-radius:16px;overflow:hidden;}',
    '.mm-row{display:flex;align-items:center;justify-content:space-between;padding:15px;border-bottom:1px solid rgba(200,208,218,.55);font-size:.88rem;}',
    '.mm-row:last-child{border-bottom:none;} .mm-row .k{color:#44474f;} .mm-row .v{color:#18191c;font-weight:600;}',
    '.mm-cancel{width:100%;text-align:center;background:#fff;border:1px solid rgba(200,208,218,.7);border-radius:14px;color:#b23a3a;font-size:.88rem;font-weight:700;padding:14px;font-family:inherit;cursor:pointer;}',
    '.mm-empty{text-align:center;padding:60px 24px;color:#888d98;}',
    '.mm-empty .ic{font-size:2.4rem;margin-bottom:12px;}',
    '.mm-empty .msg{font-size:.95rem;margin-bottom:20px;line-height:1.5;}',
    '.mm-empty .gob{background:#26282d;color:#fff;border:none;border-radius:14px;padding:13px 26px;font-size:.9rem;font-weight:700;font-family:inherit;cursor:pointer;}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  function toast(m){ if(window.showToast) showToast(m); else alert(m); }

  /* ── 홈 배너 자동 회전 ── */
  function startBanner(){
    var track=document.getElementById('planSlideTrack');
    var dotsWrap=document.getElementById('planSlideDots');
    if(!track||!dotsWrap||track.__caroRun) return;
    track.__caroRun=true;
    var dots=dotsWrap.children, n=track.children.length, i=0;
    setInterval(function(){
      i=(i+1)%n; track.style.transform='translateX(-'+(i*100)+'%)';
      for(var k=0;k<n;k++) dots[k].className=(k===i?'on':'');
    }, 2800);
  }

  /* ── 세그먼트(개인/법인) ── */
  function bindSeg(){
    var seg=document.querySelector('#membership-screen .mbs-seg');
    var carou=document.querySelector('#membership-screen .mbs-carou');
    if(!seg||!carou||seg.__caroBound) return; seg.__caroBound=true;
    carou.classList.add('personal');
    seg.addEventListener('click', function(e){
      var b=e.target.closest('button[data-seg]'); if(!b) return;
      [].forEach.call(seg.children, function(x){ x.classList.toggle('on', x===b); });
      var mode=b.getAttribute('data-seg');
      carou.classList.toggle('personal', mode==='personal');
      carou.classList.toggle('corp', mode==='corp');
      carou.scrollLeft=0;
    });
  }

  /* ── 가입 버튼 (데모 저장) ── */
  function bindJoin(){
    var carou=document.querySelector('#membership-screen .mbs-carou');
    if(!carou||carou.__caroJoin) return; carou.__caroJoin=true;
    carou.addEventListener('click', function(e){
      var b=e.target.closest('.mp-join'); if(!b) return;
      var plan=b.getAttribute('data-plan'), name=b.getAttribute('data-name');
      if(plan==='BIZ'){ toast('비즈(법인)는 사업자 승인제예요. 대기 신청이 접수되었습니다.'); return; }
      try{
        var next=new Date(); next.setMonth(next.getMonth()+1);
        localStorage.setItem('caro_plan_v1', JSON.stringify({plan:plan,name:name,since:Date.now(),next:next.getTime()}));
      }catch(err){}
      toast(name+' 가입이 접수되었습니다. (결제 연동은 준비 중)');
      if(window.goTo) goTo('my-membership-screen');
      renderMy();
    });
  }

  /* ── 내 멤버십 렌더 ── */
  function getPlan(){ try{ return JSON.parse(localStorage.getItem('caro_plan_v1')||'null'); }catch(e){ return null; } }
  function fmtDate(ts){ var d=new Date(ts); return (d.getMonth()+1)+'/'+d.getDate(); }
  function renderMy(){
    var body=document.getElementById('myMbsBody'); if(!body) return;
    var p=getPlan();
    if(!p){
      body.innerHTML='<div class="mm-empty"><div class="ic">💳</div><div class="msg">아직 가입한 멤버십이 없어요.<br>플랜을 골라 더 저렴하게 이용해 보세요.</div>'+
        '<button class="gob" onclick="if(window.goTo)goTo(\'membership-screen\')">플랜 보러가기</button></div>';
      return;
    }
    var isBiz=p.plan==='BIZ';
    var info = p.plan==='LITE' ? '<div class="mm-row"><span class="k">주중 할인</span><span class="v">20%</span></div><div class="mm-row"><span class="k">심야 할인</span><span class="v">10%</span></div>'
      : p.plan==='PLUS' ? '<div class="mm-row"><span class="k">주중 할인</span><span class="v">40%</span></div><div class="mm-row"><span class="k">심야 할인</span><span class="v">50%</span></div>'
      : '<div class="mm-row"><span class="k">업무시간 할인</span><span class="v">50%</span></div><div class="mm-row"><span class="k">주중 할인</span><span class="v">30%</span></div>';
    var quota = p.plan==='PLUS'
      ? '<div class="mm-lbl">이번 달 남은 혜택</div><div class="mm-quota"><div class="mm-qbox"><div class="mm-qn">40<small>/40h</small></div><div class="mm-ql">할인 적용 시간</div><div class="mm-bar"><i style="width:100%"></i></div></div><div class="mm-qbox"><div class="mm-qn">1<small>장</small></div><div class="mm-ql">주말 쿠폰</div><div class="mm-bar"><i style="width:100%"></i></div></div></div>'
      : p.plan==='BIZ'
      ? '<div class="mm-lbl">이번 달 남은 혜택</div><div class="mm-quota"><div class="mm-qbox"><div class="mm-qn">30,000<small>원</small></div><div class="mm-ql">이용 크레딧</div><div class="mm-bar"><i style="width:100%"></i></div></div><div class="mm-qbox"><div class="mm-qn">3<small>계정</small></div><div class="mm-ql">임직원</div></div></div>'
      : '';
    body.innerHTML='<div class="mm-wrap">'+
      '<div class="mm-card'+(isBiz?' biz':'')+'"><div class="glow"></div><span class="st">이용 중</span>'+
        '<div class="pl">현재 플랜</div><div class="nm">'+p.name+'</div>'+
        '<div class="bill">다음 결제 '+fmtDate(p.next)+' · '+(p.plan==='LITE'?'8,900':p.plan==='PLUS'?'14,900':'99,000')+'원</div></div>'+
      quota+
      '<div class="mm-lbl">플랜 정보</div><div class="mm-rows">'+info+
        '<div class="mm-row"><span class="k">결제 수단</span><span class="v">등록하기 ›</span></div>'+
        '<div class="mm-row"><span class="k">이용 내역</span><span class="v">›</span></div>'+
        '<div class="mm-row"><span class="k">플랜 변경</span><span class="v">›</span></div></div>'+
      '<button class="mm-cancel" id="mmCancelBtn">멤버십 해지</button>'+
      '<div class="mbs-note" style="padding:2px 4px 0;">해지해도 당월 말까지 혜택이 유지되며 환불은 없습니다.</div></div>';
    var cb=document.getElementById('mmCancelBtn');
    if(cb) cb.onclick=function(){
      if(confirm('멤버십을 해지할까요?\n(당월 말까지 혜택 유지, 환불 없음)')){
        try{ localStorage.removeItem('caro_plan_v1'); }catch(e){}
        toast('해지 예약되었습니다. 당월 말까지 이용 가능해요.');
        renderMy();
      }
    };
  }

  /* goTo 후킹 → 멤버십 화면 진입 시 초기화 */
  if(typeof window.goTo==='function' && !window.goTo.__caroMbs){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments);
      try{ if(id==='membership-screen'){ bindSeg(); bindJoin(); } if(id==='my-membership-screen'){ renderMy(); } }catch(e){}
      return r; };
    window.goTo.__caroMbs=true;
  }

  function boot(){ startBanner(); bindSeg(); bindJoin(); }
  if(document.readyState!=='loading') setTimeout(boot,300); else document.addEventListener('DOMContentLoaded', function(){ setTimeout(boot,300); });
  /* 배너는 홈이 늦게 그려질 수 있으니 재시도 */
  var tries=0; var iv=setInterval(function(){ tries++; startBanner(); if(document.getElementById('planSlideTrack')&&document.getElementById('planSlideTrack').__caroRun || tries>20) clearInterval(iv); }, 400);

  console.log('[멤버십] ✅ 플랜 v1 (배너+화면)');
})();

/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 멤버십 리치 v2
   · 히어로 + 절약 계산기 + 프리미엄 카드(라인 아이콘)
   · 개인/법인 토글, 잔여 숫자 숨김 → 매진 시 버튼 비활성화
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var GOLD='#c8a96e', GOLDD='#a98a4e', RATE=6200;
  /* 어드민이 채우면 됨: 'open' | 'full' */
  window.CARO_PLAN_CAPS = window.CARO_PLAN_CAPS || {LITE:'open', PLUS:'open', BIZ:'open'};

  var css=document.createElement('style'); css.id='caro-membership-v2-css';
  css.textContent=[
    '#membership-screen .mbs-hd{display:none;}',   /* 옛 헤더 숨김(히어로로 대체) */
    '.mb-hero{margin:6px 16px 0;border-radius:24px;padding:24px 20px 22px;color:var(--text-1);position:relative;overflow:hidden;background:var(--glass2);border:1px solid var(--border-l);box-shadow:0 1px 2px rgba(24,25,28,.04);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);}',
    '.mb-hero::after{content:"";position:absolute;right:-40px;top:-52px;width:172px;height:172px;border-radius:50%;background:radial-gradient(circle,rgba(103,112,124,.14),transparent 70%);pointer-events:none;}',
    '.mb-kick{font-size:.82rem;letter-spacing:.02em;color:var(--text-m);font-weight:600;position:relative;margin-bottom:8px;}',
    '.mb-hero h2{font-size:1.7rem;font-weight:800;margin:0 0 4px;line-height:1.18;letter-spacing:-.02em;position:relative;color:var(--text-1);}',
    '.mb-hero p{font-size:.85rem;color:var(--text-m);position:relative;}',
    '.mb-chips{display:flex;gap:8px;margin-top:16px;position:relative;flex-wrap:wrap;}',
    '.mb-chips span{font-size:.72rem;font-weight:600;background:#fff;border:1px solid var(--border-l);color:var(--text-2);padding:6px 11px;border-radius:20px;}',

    /* 카드 아이콘 제거(심플) */
    '.pc-ic{display:none!important;}',

    /* 간단 계산기 (버튼 3개) */
    '.mb-scalc{margin:14px 16px 0;background:#fff;border:1px solid var(--border-l);border-radius:18px;padding:16px 16px 18px;}',
    '.mb-scalc.hide{display:none;}',
    '.msc-t{font-weight:800;font-size:.94rem;}',
    '.msc-s{font-size:.76rem;color:var(--text-m);margin:3px 0 13px;}',
    '.msc-btns{display:flex;gap:8px;margin-bottom:14px;}',
    '.msc-btns button{flex:1;border:1px solid var(--border-l);background:#f6f8fb;border-radius:11px;padding:10px 0;font-family:inherit;font-size:.82rem;font-weight:700;color:var(--text-2);line-height:1.3;cursor:pointer;}',
    '.msc-btns button small{font-weight:500;color:var(--text-m);font-size:.68rem;}',
    '.msc-btns button.on{background:#18191c;color:#fff;border-color:#18191c;}',
    '.msc-btns button.on small{color:rgba(255,255,255,.7);}',
    '.msc-out{background:#f6f8fb;border-radius:12px;padding:13px 15px;font-size:.9rem;font-weight:700;display:flex;justify-content:space-between;align-items:center;gap:8px;}',
    '.msc-out .save{color:'+GOLDD+';font-weight:800;text-align:right;}',

    '.mb-cards{padding:16px 16px 6px;display:flex;flex-direction:column;gap:14px;max-width:520px;margin:0 auto;}',
    '.mb-cards.personal .biz{display:none;} .mb-cards.corp .lite,.mb-cards.corp .plus{display:none;}',
    '.pcard{border-radius:22px;padding:20px;position:relative;overflow:hidden;border:1px solid rgba(200,208,218,.7);background:#fff;}',
    '.pcard.plus{background:linear-gradient(160deg,#2f333a,#1d2026);border:none;color:#f2f4f7;}',
    '.pcard.biz{background:linear-gradient(160deg,#16181d,#0b0c0f);border:none;color:#f2f4f7;}',
    '.pc-ribbon{position:absolute;top:15px;right:-34px;transform:rotate(38deg);background:'+GOLD+';color:#18191c;font-size:.62rem;font-weight:800;padding:4px 38px;letter-spacing:.08em;}',
    '.pc-top{display:flex;align-items:center;gap:12px;margin-bottom:4px;}',
    '.pc-ic{width:42px;height:42px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex:0 0 auto;}',
    '.lite .pc-ic{background:#eef1f5;color:#6a6f79;} .plus .pc-ic,.biz .pc-ic{background:rgba(174,182,194,.16);color:'+GOLD+';} .pc-ic svg{width:22px;height:22px;}',
    '.pc-name{font-weight:800;font-size:1.15rem;} .plus .pc-name,.biz .pc-name{color:#fff;}',
    '.pc-sub{font-size:.74rem;color:#888d98;} .plus .pc-sub,.biz .pc-sub{color:rgba(255,255,255,.6);}',
    '.pc-price{display:flex;align-items:baseline;gap:4px;margin:12px 0 14px;}',
    '.pc-price .w{font-weight:800;font-size:1.9rem;} .plus .pc-price .w,.biz .pc-price .w{color:'+GOLD+';}',
    '.pc-price .u{font-size:.8rem;color:#888d98;} .plus .pc-price .u,.biz .pc-price .u{color:rgba(255,255,255,.6);}',
    '.pc-bl{display:flex;flex-direction:column;gap:10px;margin-bottom:16px;}',
    '.pc-bl div{display:flex;gap:9px;align-items:flex-start;font-size:.85rem;color:#44474f;line-height:1.35;} .plus .pc-bl div,.biz .pc-bl div{color:#e7e9ee;}',
    '.pc-bl .ck{flex:0 0 auto;width:16px;height:16px;margin-top:1px;color:'+GOLDD+';} .plus .pc-bl .ck,.biz .pc-bl .ck{color:'+GOLD+';}',
    '.pc-bl b{font-weight:700;} .plus .pc-bl b,.biz .pc-bl b{color:'+GOLD+';}',
    '.pc-join{width:100%;text-align:center;border:none;border-radius:13px;padding:14px;font-family:inherit;font-size:.9rem;font-weight:800;cursor:pointer;}',
    '.lite .pc-join{background:#26282d;color:#fff;} .plus .pc-join,.biz .pc-join{background:'+GOLD+';color:#18191c;}',
    '.pc-join.sold{background:#eef1f5!important;color:#a9adb5!important;cursor:not-allowed;}',
    '.pc-soldnote{text-align:center;font-size:.72rem;color:#888d98;margin-top:8px;} .plus .pc-soldnote,.biz .pc-soldnote{color:rgba(255,255,255,.55);}',
    /* 가입 결제 바텀시트 */
    '.mjoin-ov{position:fixed;inset:0;z-index:1300;background:rgba(18,20,26,0);display:flex;align-items:flex-end;justify-content:center;pointer-events:none;transition:background .3s;}',
    '.mjoin-ov.open{background:rgba(18,20,26,.45);pointer-events:auto;}',
    '.mjoin-sheet{width:100%;max-width:520px;background:#fff;border-radius:24px 24px 0 0;padding:10px 20px calc(24px + var(--sab));transform:translateY(100%);transition:transform .34s cubic-bezier(.4,0,.2,1);max-height:88vh;overflow-y:auto;box-sizing:border-box;}',
    '.mjoin-ov.open .mjoin-sheet{transform:translateY(0);}',
    '.mj-grip{width:42px;height:5px;border-radius:3px;background:#d3d8e0;margin:4px auto 14px;}',
    '.mj-title{font-weight:800;font-size:1.2rem;}',
    '.mj-price{display:flex;align-items:baseline;gap:5px;margin:8px 0 16px;} .mj-price .w{font-size:1.9rem;font-weight:800;} .mj-price .u{color:#888d98;font-size:.85rem;}',
    '.mj-bl{display:flex;flex-direction:column;gap:9px;margin-bottom:16px;} .mj-bl div{display:flex;gap:8px;font-size:.88rem;color:#44474f;align-items:flex-start;line-height:1.35;} .mj-bl .ck{color:'+GOLDD+';font-weight:800;flex:0 0 auto;}',
    '.mj-card{background:#f6f8fb;border:1px solid var(--border-l,#e7eaef);border-radius:14px;padding:14px;margin-bottom:14px;display:flex;align-items:center;justify-content:space-between;}',
    '.mj-card-l{display:flex;align-items:center;gap:11px;} .mj-card-ic{width:34px;height:34px;border-radius:9px;background:#e7ebf1;display:flex;align-items:center;justify-content:center;color:#4b5563;flex:0 0 auto;} .mj-card-ic svg{width:19px;height:19px;}',
    '.mj-card-nm{font-weight:700;font-size:.92rem;} .mj-card-sub{font-size:.74rem;color:#888d98;margin-top:1px;}',
    '.mj-card.nocard{flex-direction:column;gap:11px;align-items:stretch;text-align:center;font-size:.88rem;color:#888d98;}',
    '.mj-addcard{background:#26282d;color:#fff;border:none;border-radius:11px;padding:12px;font-weight:700;font-family:inherit;cursor:pointer;}',
    '.mj-notice{font-size:.76rem;color:#888d98;line-height:1.6;margin-bottom:16px;}',
    '.mj-pay{width:100%;border:none;border-radius:14px;padding:16px;font-family:inherit;font-size:.98rem;font-weight:800;background:'+GOLD+';color:#18191c;cursor:pointer;}',
    '.mj-pay.disabled{background:#eef1f5;color:#a9adb5;cursor:not-allowed;}',
    /* 비즈 문의 시트 */
    '.mj-seclbl{font-size:.76rem;font-weight:800;color:#888d98;letter-spacing:.03em;margin:2px 2px 10px;}',
    '.mj-need{display:flex;flex-direction:column;gap:11px;margin-bottom:18px;}',
    '.mj-need-row{display:flex;gap:11px;align-items:flex-start;}',
    '.mj-need-ck{flex:0 0 auto;width:22px;height:22px;border-radius:7px;background:rgba(174,182,194,.16);color:'+GOLDD+';display:flex;align-items:center;justify-content:center;margin-top:1px;} .mj-need-ck svg{width:14px;height:14px;}',
    '.mj-need-t{font-weight:700;font-size:.9rem;color:#18191c;} .mj-need-s{font-size:.78rem;color:#888d98;margin-top:1px;}',
    '.mj-steps{display:flex;flex-direction:column;gap:0;margin-bottom:18px;position:relative;}',
    '.mj-step{display:flex;align-items:center;gap:11px;padding:7px 0;font-size:.88rem;color:#44474f;font-weight:600;}',
    '.mj-step-n{flex:0 0 auto;width:24px;height:24px;border-radius:50%;background:#18191c;color:#fff;font-size:.76rem;font-weight:800;display:flex;align-items:center;justify-content:center;}'
  ].join('');
  (document.head||document.documentElement).appendChild(css);

  function toast(m){ if(window.showToast) showToast(m); else alert(m); }

  /* 개인/법인 토글 */
  function bindSeg2(){
    var seg=document.querySelector('#membership-screen .mbs-seg');
    var cards=document.getElementById('mbsCards');
    var calc=document.getElementById('planCalc');
    if(!seg||!cards||seg.__caroV2) return; seg.__caroV2=true;
    seg.addEventListener('click', function(e){
      var b=e.target.closest('button[data-seg]'); if(!b) return;
      [].forEach.call(seg.children, function(x){ x.classList.toggle('on', x===b); });
      var corp=b.getAttribute('data-seg')==='corp';
      cards.classList.toggle('corp', corp);
      cards.classList.toggle('personal', !corp);
      if(calc) calc.classList.toggle('hide', corp);  /* 법인이면 개인용 계산기 숨김 */
    });
  }

  /* 절약 계산기 (버튼 3개) */
  function bindCalc(){
    var btns=document.getElementById('planCalcBtns');
    var out=document.getElementById('planCalcOut');
    if(!btns||!out||btns.__caroV2) return; btns.__caroV2=true;
    function run(h){
      var lite=RATE*h*0.20-8900, plus=RATE*h*0.40-14900;
      var best = plus>=lite ? {n:'CARO 플러스로',s:plus} : {n:'CARO 라이트로',s:lite};
      var save = best.s>=0
        ? '<span class="save">월 '+Math.round(best.s).toLocaleString()+'원 이득</span>'
        : '<span class="save" style="color:#888d98">아직은 그냥 이용이 나아요</span>';
      out.innerHTML='<span>'+(best.s>=0?best.n:'가끔 이용이라면')+'</span>'+save;
    }
    btns.addEventListener('click', function(e){
      var b=e.target.closest('button[data-h]'); if(!b) return;
      [].forEach.call(btns.children, function(x){ x.classList.toggle('on', x===b); });
      run(+b.getAttribute('data-h'));
    });
    var on=btns.querySelector('button.on')||btns.querySelector('button');
    run(on?+on.getAttribute('data-h'):15);
  }

  /* 매진 시 버튼 비활성화 */
  function applyCaps(){
    var caps=window.CARO_PLAN_CAPS||{};
    ['LITE','PLUS','BIZ'].forEach(function(pl){
      var btn=document.querySelector('#membership-screen .pc-join[data-plan="'+pl+'"]');
      if(!btn) return;
      var card=btn.closest('.pcard');
      var old=card&&card.querySelector('.pc-soldnote'); if(old) old.remove();
      if(caps[pl]==='full'){
        btn.classList.add('sold'); btn.disabled=true; btn.textContent='대기 신청';
        var n=document.createElement('div'); n.className='pc-soldnote'; n.textContent='현재 거점 정원이 찼어요 · 자리 나면 알려드릴게요';
        if(card) card.appendChild(n);
      } else {
        btn.classList.remove('sold'); btn.disabled=false;
        btn.textContent = (pl==='BIZ' ? '가입 문의' : '가입하기');
      }
    });
  }

  /* 가입 결제 바텀시트 */
  var PLAN_INFO={
    LITE:{name:'CARO 라이트',price:8900,bl:['주중(월~목) 20% 할인','심야(22~08시) 10% 할인']},
    PLUS:{name:'CARO 플러스',price:14900,bl:['주중 40% 할인','심야 50% 할인 (주말 밤 포함)','주말 10% 쿠폰 월 1장','할인 적용 월 40시간까지']}
  };
  var CARD_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="5" width="19" height="14" rx="2.5"/><line x1="2.5" y1="9.5" x2="21.5" y2="9.5"/></svg>';
  var CHECK_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';
  function money(n){ return (n||0).toLocaleString(); }
  function firstCard(){ try{ return (window.savedCards&&window.savedCards.length)?window.savedCards[0]:null; }catch(e){ return null; } }
  function buildSheet(){
    if(document.getElementById('mjoin-ov')) return;
    var ov=document.createElement('div'); ov.id='mjoin-ov'; ov.className='mjoin-ov';
    ov.innerHTML='<div class="mjoin-sheet" id="mjoin-sheet"></div>';
    ov.addEventListener('click', function(e){ if(e.target===ov) closeSheet(); });
    document.body.appendChild(ov);
  }
  function closeSheet(){ var ov=document.getElementById('mjoin-ov'); if(ov) ov.classList.remove('open'); }
  function openJoinSheet(plan){
    var info=PLAN_INFO[plan]; if(!info) return;
    buildSheet();
    var card=firstCard();
    var cardHtml = card
      ? '<div class="mj-card"><div class="mj-card-l"><span class="mj-card-ic">'+CARD_SVG+'</span><div><div class="mj-card-nm">'+(card.alias||'카드')+' ···'+card.last4+'</div><div class="mj-card-sub">등록된 결제 카드로 결제돼요</div></div></div></div>'
      : '<div class="mj-card nocard"><div>등록된 결제 카드가 없어요.<br>카드를 먼저 등록해 주세요.</div><button class="mj-addcard" id="mjAddCard">결제 카드 등록하기</button></div>';
    var sheet=document.getElementById('mjoin-sheet');
    sheet.innerHTML=
      '<div class="mj-grip"></div>'+
      '<div class="mj-title">'+info.name+' 가입</div>'+
      '<div class="mj-price"><span class="w">'+money(info.price)+'</span><span class="u">원 / 월</span></div>'+
      '<div class="mj-bl">'+info.bl.map(function(b){return '<div><span class="ck">✓</span>'+b+'</div>';}).join('')+'</div>'+
      cardHtml+
      '<div class="mj-notice">· 매월 결제일에 등록 카드로 <b>자동 결제</b>돼요 (선불)<br>· 해지해도 당월 말까지 혜택 유지 · <b>환불 없음</b><br>· 할인은 대여요금(시간요금)에만 적용</div>'+
      '<button class="mj-pay'+(card?'':' disabled')+'" id="mjPay">'+(card ? money(info.price)+'원 결제하고 가입' : '카드 등록 후 가입할 수 있어요')+'</button>';
    var ov=document.getElementById('mjoin-ov');
    requestAnimationFrame(function(){ ov.classList.add('open'); });
    var pay=document.getElementById('mjPay');
    if(pay && card) pay.onclick=function(){ doJoin(plan,info,card); };
    var add=document.getElementById('mjAddCard');
    if(add) add.onclick=function(){ closeSheet(); try{ if(window.openAddCard) openAddCard(); else if(window.goTo) goTo('payment-info-screen'); }catch(e){} };
  }
  function doJoin(plan,info,card){
    try{ var nx=new Date(); nx.setMonth(nx.getMonth()+1);
      localStorage.setItem('caro_plan_v1', JSON.stringify({plan:plan,name:info.name,since:Date.now(),next:nx.getTime(),card:(card?card.last4:null)})); }catch(e){}
    closeSheet();
    toast(info.name+' 가입 완료 · '+money(info.price)+'원 결제되었습니다');
    if(window.goTo) goTo('my-membership-screen');
  }

  /* 가입 버튼 → 결제 시트 열기 (비즈는 문의 시트) */
  function bindJoin2(){
    var cards=document.getElementById('mbsCards');
    if(!cards||cards.__caroV2) return; cards.__caroV2=true;
    cards.addEventListener('click', function(e){
      var b=e.target.closest('.pc-join'); if(!b||b.disabled) return;
      var plan=b.getAttribute('data-plan');
      if(plan==='BIZ'){ openBizSheet(); return; }
      openJoinSheet(plan);
    });
  }

  /* 비즈(법인) 가입 문의 시트 */
  function openBizSheet(){
    buildSheet();
    var need=[
      ['사업자등록증','법인/개인사업자 확인용 (사본 이미지)'],
      ['담당자 정보','이름 · 연락처 · 이메일'],
      ['임직원 계정','이용할 임직원 최대 3명 (이름 · 면허)'],
      ['세금계산서 정보','사업자번호 · 담당 이메일 (매월 발행)']
    ];
    var step=['가입 문의 신청','서류 확인 (영업일 1~2일)','승인 & 계정 개설','이용 시작'];
    var sheet=document.getElementById('mjoin-sheet');
    sheet.innerHTML=
      '<div class="mj-grip"></div>'+
      '<div class="mj-title">CARO 비즈 (법인) 가입 문의</div>'+
      '<div class="mj-price"><span class="w">99,000</span><span class="u">원 / 월 · 임직원 3계정</span></div>'+
      '<div class="mj-seclbl">준비하실 것</div>'+
      '<div class="mj-need">'+need.map(function(n){
        return '<div class="mj-need-row"><span class="mj-need-ck">'+CHECK_SVG+'</span><div><div class="mj-need-t">'+n[0]+'</div><div class="mj-need-s">'+n[1]+'</div></div></div>';
      }).join('')+'</div>'+
      '<div class="mj-seclbl">진행 절차</div>'+
      '<div class="mj-steps">'+step.map(function(s,i){
        return '<div class="mj-step"><span class="mj-step-n">'+(i+1)+'</span><span>'+s+'</span></div>';
      }).join('')+'</div>'+
      '<div class="mj-notice">· 법인은 사업자 확인 후 <b>승인제</b>로 개설돼요<br>· 결제는 세금계산서 발행 (선불 자동결제)<br>· 자세한 문의: 고객센터 또는 아래 신청</div>'+
      '<button class="mj-pay" id="mjBiz">가입 문의 신청하기</button>';
    var ov=document.getElementById('mjoin-ov');
    requestAnimationFrame(function(){ ov.classList.add('open'); });
    var btn=document.getElementById('mjBiz');
    if(btn) btn.onclick=function(){
      closeSheet();
      toast('가입 문의가 접수되었어요. 영업일 1~2일 내 담당자가 연락드립니다.');
    };
  }

  function initMbs(){ bindSeg2(); bindCalc(); bindJoin2(); applyCaps();
    var cards=document.getElementById('mbsCards'); if(cards && !cards.classList.contains('corp')) cards.classList.add('personal'); }

  if(typeof window.goTo==='function' && !window.goTo.__caroMbs2){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments);
      try{ if(id==='membership-screen') setTimeout(initMbs,30); }catch(e){}
      return r; };
    window.goTo.__caroMbs2=true;
  }
  setTimeout(function(){ if(document.getElementById('mbsCards')) initMbs(); }, 800);
  console.log('[멤버십] ✅ 리치 v2');
})();

/* ═══════════════════════════════════════════════
   [가입자 이름 표시] 홈 인사말 + 우측 메뉴 상단
   · 인사말/메뉴 위 = 가입자 본명(없으면 아이디 부분)
   · 메뉴 아래 = 이메일 주소
═══════════════════════════════════════════════ */
(function(){
  var cachedName=null, fetchedFor=null;
  function curEmail(){
    try{ return (window.userInfo && (userInfo.email||userInfo.id))||''; }catch(e){ return ''; }
  }
  function localPart(email){ return email? String(email).split('@')[0] : ''; }
  function apply(name){
    var email=curEmail();
    var display=(name && name!==email) ? name : localPart(email);
    var wn=document.getElementById('home-welcome-name');
    if(wn && email) wn.textContent=(display||email)+' 님, 안녕하세요';
    var hn=document.getElementById('hmenu-name');
    if(hn && email) hn.textContent=display||email;
    var hi=document.getElementById('hmenu-id');
    if(hi && email) hi.textContent=email;   /* 아래줄 = 이메일 */
  }
  function refresh(){
    var email=curEmail(); if(!email) return;
    /* 1) userInfo.name 이 실제 이름이면 바로 사용 */
    var nm=(window.userInfo && userInfo.name)||'';
    if(nm && nm!==email){ cachedName=nm; apply(nm); return; }
    /* 2) 캐시된 이름 있으면 사용 */
    if(cachedName){ apply(cachedName); return; }
    /* 3) Firestore users/{uid}.name 조회(1회) */
    try{
      var uid=(window.userInfo && userInfo.uid)||'';
      if(uid && uid!==fetchedFor && window.FB_DB && window.FB_FN && window.FB_FN.getDoc){
        fetchedFor=uid;
        window.FB_FN.getDoc(window.FB_FN.doc(window.FB_DB,'users',uid)).then(function(s){
          var ex=s&&(typeof s.exists==='function'?s.exists():s.exists);
          var d=ex?s.data():null;
          var real=d&&d.name;
          if(real && real!==email){ cachedName=real; try{ userInfo.name=real; }catch(e){} apply(real); }
          else apply('');   /* 이름 없으면 아이디 부분으로 */
        }).catch(function(){ apply(''); });
      } else { apply(''); }
    }catch(e){ apply(''); }
  }
  window.caroRefreshIdentity=refresh;
  /* 드로어 열 때마다 갱신 */
  var _open=window.openHomeMenu;
  window.openHomeMenu=function(){ try{ if(_open) _open.apply(this,arguments); }catch(e){} setTimeout(refresh,30); };
  /* 홈 진입/초기/로그인 후 갱신 */
  document.addEventListener('DOMContentLoaded',function(){ setTimeout(refresh,1500); setTimeout(refresh,3500); });
  var _tries=0, iv=setInterval(function(){ _tries++; if(curEmail()) refresh(); if(_tries>40) clearInterval(iv); }, 1500);
  console.log('[가입자 이름] ✅ 인사말/메뉴 이름 표시');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 사고 접수 · 1:1 문의 → Firestore 실제 저장
   · 기존 함수를 덮어쓰기(override) — 원본 훼손 없음
   · 저장 실패해도 접수번호는 발급 + 로컬 보관 → 고객 응대 가능
   · 사진: 캔버스 압축 후 base64 (Storage SDK 불필요)
   · 컬렉션: accident_reports / support_inquiries
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var MAX_DIM=1000, QUALITY=0.62, MAX_PHOTOS=6, BUDGET=850*1024; /* 문서 1MB 제한 대비 여유 */

  function fsReady(){ return !!(window.FB_DB && window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc); }
  function me(){
    var u={uid:'',email:'',name:'',phone:''};
    try{
      if(window.FB_AUTH && FB_AUTH.currentUser) u.uid=FB_AUTH.currentUser.uid||'';
      if(window.userInfo){ u.email=userInfo.email||userInfo.id||''; u.name=userInfo.name||''; u.phone=userInfo.phone||''; }
    }catch(e){}
    return u;
  }
  /* 파일 → 압축 base64 */
  function readCompressed(file){
    return new Promise(function(res){
      try{
        var fr=new FileReader();
        fr.onload=function(){
          var img=new Image();
          img.onload=function(){
            try{
              var w=img.width,h=img.height;
              if(w>=h && w>MAX_DIM){ h=Math.round(h*MAX_DIM/w); w=MAX_DIM; }
              else if(h>w && h>MAX_DIM){ w=Math.round(w*MAX_DIM/h); h=MAX_DIM; }
              var c=document.createElement('canvas'); c.width=w; c.height=h;
              c.getContext('2d').drawImage(img,0,0,w,h);
              res(c.toDataURL('image/jpeg',QUALITY));
            }catch(e){ res(null); }
          };
          img.onerror=function(){ res(null); };
          img.src=fr.result;
        };
        fr.onerror=function(){ res(null); };
        fr.readAsDataURL(file);
      }catch(e){ res(null); }
    });
  }
  /* 여러 장 → 용량 예산 안에서 담기 */
  function packPhotos(files){
    var list=(files||[]).slice(0,MAX_PHOTOS);
    return Promise.all(list.map(readCompressed)).then(function(arr){
      var out=[], used=0;
      arr.forEach(function(d){
        if(!d) return;
        if(used+d.length>BUDGET) return;   /* 예산 초과분은 버림(저장 실패 방지) */
        out.push(d); used+=d.length;
      });
      return out;
    });
  }
  /* 폼 → 객체 */
  function formData(formId){
    var f=document.getElementById(formId); if(!f) return {};
    var o={}, fd=new FormData(f);
    fd.forEach(function(v,k){
      if(o[k]===undefined) o[k]=v;
      else { if(!Array.isArray(o[k])) o[k]=[o[k]]; o[k].push(v); }
    });
    return o;
  }
  /* 로컬 백업 (저장 실패 시에도 흔적 남김) */
  function backup(key, rec){
    try{
      var a=JSON.parse(localStorage.getItem(key)||'[]');
      a.unshift(rec); localStorage.setItem(key, JSON.stringify(a.slice(0,30)));
    }catch(e){}
  }
  /* Firestore 저장 */
  function save(col, id, data){
    if(!fsReady()) return Promise.reject(new Error('offline'));
    var FN=window.FB_FN, db=window.FB_DB;
    return FN.setDoc(FN.doc(db,col,id), data, {merge:true});
  }

  /* ── 사고 접수 ── */
  window.csSubmitAccident = function(e){
    if(e && e.preventDefault) e.preventDefault();
    var btn=document.querySelector('#accident-screen .submit-btn');
    if(btn){ btn.disabled=true; btn.textContent='접수 처리 중...'; }

    var no = 'CR-A-' + Date.now().toString().slice(-6);
    var u = me();
    var d = formData('cs-accident-form');
    var files = (window.csAccFiles || []);

    packPhotos(files).then(function(photos){
      var rec = {
        id:no, type:'accident', status:'received',
        userId:u.uid, userEmail:u.email, userName:u.name, userPhone:u.phone,
        occurredAt: d.datetime || '', location: d.location || '',
        vehicle: d.vehicle || '', accidentType: d.type || '',
        injury: d.injury || '', injuryDetail: d.injuryDetail || '',
        police: d.police || '',
        otherVehicle: d.otherVehicle || '', otherPhone: d.otherPhone || '',
        otherInsurance: d.otherInsurance || '',
        description: d.description || '',
        services: [].concat(d.services || []),
        photos: photos, photoCount: photos.length,
        createdAt: new Date().toISOString(), createdTs: Date.now()
      };
      backup('caro_accident_local', rec);
      return save('accident_reports', no, rec)
        .then(function(){ console.log('[사고접수] ✅ 저장 완료', no); return true; })
        .catch(function(err){ console.warn('[사고접수] ⚠️ 저장 실패(로컬 보관됨)', err && err.code); return false; });
    }).then(function(ok){
      if(window.csShowSuccessModal){
        csShowSuccessModal(
          '사고 접수가 완료되었습니다',
          ok ? '담당 상담원이 곧 연락드릴 예정입니다.<br>접수 번호를 보관해 주세요.'
             : '접수 번호를 보관해 주세요.<br>네트워크 문제로 전송이 지연될 수 있어 고객센터로도 연락 부탁드립니다.',
          no
        );
      }
      if(btn){ btn.disabled=false; btn.textContent='사고 접수 제출하기'; }
      try{ document.getElementById('cs-accident-form').reset(); }catch(e){}
      try{ window.csAccFiles=[]; if(window.csRenderAccFileList) csRenderAccFileList(); }catch(e){}
      try{ if(window.csToggleInjury) csToggleInjury(false); }catch(e){}
    });
  };

  /* ── 1:1 문의 ── */
  window.csSubmitInquiry = function(e){
    if(e && e.preventDefault) e.preventDefault();
    var btn=document.querySelector('#inquiry-screen .submit-btn');
    if(btn){ btn.disabled=true; btn.textContent='접수 처리 중...'; }

    var no = 'CR-Q-' + Date.now().toString().slice(-6);
    var u = me();
    var d = formData('cs-inquiry-form');
    var files = (window.csInqFiles || []);

    packPhotos(files).then(function(photos){
      var rec = {
        id:no, type:'inquiry', status:'received',
        userId:u.uid, userEmail:u.email, userName:u.name, userPhone:u.phone,
        category: d.category || '', title: d.title || d.subject || '',
        content: d.content || d.message || d.description || '',
        photos: photos, photoCount: photos.length,
        createdAt: new Date().toISOString(), createdTs: Date.now()
      };
      backup('caro_inquiry_local', rec);
      return save('support_inquiries', no, rec)
        .then(function(){ console.log('[문의] ✅ 저장 완료', no); return true; })
        .catch(function(err){ console.warn('[문의] ⚠️ 저장 실패(로컬 보관됨)', err && err.code); return false; });
    }).then(function(ok){
      if(window.csShowSuccessModal){
        csShowSuccessModal(
          '문의가 접수되었습니다',
          ok ? '영업일 기준 24시간 이내에<br>답변드릴 예정입니다.'
             : '접수 번호를 보관해 주세요.<br>네트워크 문제로 전송이 지연될 수 있습니다.',
          no
        );
      }
      if(btn){ btn.disabled=false; btn.textContent='문의 접수하기'; }
      try{ document.getElementById('cs-inquiry-form').reset(); }catch(e){}
      try{ window.csInqFiles=[]; if(window.csRenderInqFileList) csRenderInqFileList(); }catch(e){}
      try{ if(window.csUpdateCharCount) csUpdateCharCount(); }catch(e){}
    });
  };

  console.log('[접수] ✅ 사고접수·문의 Firestore 저장 활성화');
})();

/* ═══════════════════════════════════════════════════════════
   [개선] CARO 상담봇 v3 — 개인화 응답 + 점수 기반 의도 인식
   · 기존 봇을 훼손하지 않고 입력 처리기만 가로챔(override)
   · 개선 1: 내 예약·미납·정지·거점을 실제 데이터로 답변
   · 개선 2: 첫 매칭이 아니라 "점수 최고" 의도 선택 (오답 방지)
   · 실패해도 기존 봇 로직으로 그대로 흘려보냄(안전)
   ═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';

  var UNPAID_KEY='caro_apd_unpaid', SUSP_KEY='caro_suspension_v1';

  function $(id){ return document.getElementById(id); }
  function p2(n){ return n<10?('0'+n):(''+n); }
  function asDate(v){ return (v instanceof Date)?v:new Date(v); }
  function fmtDT(d){ d=asDate(d); if(isNaN(d)) return '';
    return (d.getMonth()+1)+'월 '+d.getDate()+'일 '+p2(d.getHours())+':'+p2(d.getMinutes()); }
  function money(n){ return (+n||0).toLocaleString()+'원'; }

  /* ── 실제 데이터 조회 ── */
  function myRes(){
    var a=(window.myReservations||[]).filter(function(r){
      return r && !r.returned && !r.cancelled && r.start && r.end;
    });
    a.sort(function(x,y){ return asDate(x.start)-asDate(y.start); });
    return a;
  }
  function activeNow(){
    var now=Date.now();
    return myRes().filter(function(r){
      return asDate(r.start).getTime()<=now && asDate(r.end).getTime()>now;
    })[0]||null;
  }
  function nextRes(){
    var now=Date.now();
    return myRes().filter(function(r){ return asDate(r.start).getTime()>now; })[0]||null;
  }
  function unpaidList(){
    try{ return JSON.parse(localStorage.getItem(UNPAID_KEY)||'[]'); }catch(e){ return []; }
  }
  function suspended(){
    try{ return JSON.parse(localStorage.getItem(SUSP_KEY)||'null'); }catch(e){ return null; }
  }
  function zoneNames(){
    var z=window.CARO_ZONES||{}; return Object.keys(z);
  }
  function availCount(){
    var n=0;
    (window.CARS_DATA||[]).forEach(function(c){
      if(c && c.status==='available' && !c.devDisabled) n++;
    });
    return n;
  }

  /* ── 개인화 답변 (데이터가 있을 때만) ── */
  var PERSONAL=[
    { /* 내 예약이 언제인지 */
      test:/(내|나의|제)?\s*예약.*(언제|몇시|시간|확인|뭐|어디)|예약.*(언제|몇시)|언제.*예약/,
      run:function(){
        var a=activeNow(), n=nextRes();
        if(a){
          var left=Math.max(0, Math.round((asDate(a.end)-Date.now())/60000));
          var h=Math.floor(left/60), m=left%60;
          return '지금 <b>'+(a.car&&a.car.name||'차량')+'</b> 이용 중이세요.<br>'
               + '반납 예정: <b>'+fmtDT(a.end)+'</b> (약 '+(h?h+'시간 ':'')+m+'분 남음)<br>'
               + '예약번호: '+(a.bookNo||'-');
        }
        if(n){
          return '다음 예약은 <b>'+(n.car&&n.car.name||'차량')+'</b>이에요.<br>'
               + '이용 시작: <b>'+fmtDT(n.start)+'</b><br>'
               + '반납 예정: '+fmtDT(n.end)+'<br>'
               + '예약번호: '+(n.bookNo||'-');
        }
        return null; /* 예약 없으면 개인화 실패 → 기존 로직으로 */
      },
      none:'현재 진행 중이거나 예정된 예약이 없어요. 홈에서 차량을 예약하실 수 있어요.'
    },
    { /* 얼마나 남았나 */
      test:/(얼마|몇\s*분|몇\s*시간).*(남|남았)|남은\s*시간|반납.*몇\s*시/,
      run:function(){
        var a=activeNow();
        if(!a) return null;
        var left=Math.max(0, Math.round((asDate(a.end)-Date.now())/60000));
        var h=Math.floor(left/60), m=left%60;
        if(left<=0) return '반납 시간이 <b>이미 지났어요.</b> 지연 패널티가 발생할 수 있으니 서둘러 반납해 주세요.';
        var s='반납까지 <b>'+(h?h+'시간 ':'')+m+'분</b> 남았어요. (반납 예정 '+fmtDT(a.end)+')';
        if(left<=30) s+='<br><br>시간이 부족하면 <b>시간 연장</b>을 이용해 주세요.';
        return s;
      },
      none:'지금 이용 중인 차량이 없어요.'
    },
    { /* 미납 */
      test:/미납|밀린|안\s*낸|정산.*안|결제.*안\s*됐|빚|연체/,
      run:function(){
        var u=unpaidList();
        if(!u.length) return '<b>미납 내역이 없어요.</b> 깨끗합니다! 👍';
        var sum=0; u.forEach(function(x){ sum+=(+x.amount||0); });
        return '미납이 <b>'+u.length+'건</b> 있어요. 총 <b>'+money(sum)+'</b>이에요.<br><br>'
             + '미납이 있으면 <b>새 예약이 제한</b>돼요. 홈 상단의 미납 안내에서 결제해 주세요.';
      }
    },
    { /* 이용 정지 */
      test:/정지|이용\s*제한|막혔|예약.*안\s*(돼|되)|차단/,
      run:function(){
        var s=suspended();
        var u=unpaidList();
        if(s) return '현재 <b>이용이 제한된 상태</b>예요.<br>사유 확인과 해제는 상담사 연결로 도와드릴게요.';
        if(u.length) return '미납 <b>'+u.length+'건</b> 때문에 예약이 제한될 수 있어요. 미납을 정산하면 바로 풀려요.';
        return '<b>이용 제한이 없어요.</b> 정상적으로 예약하실 수 있어요.<br>그래도 예약이 안 되면 화면을 새로고침해 보시고, 계속되면 상담사에게 연결해 드릴게요.';
      }
    },
    { /* 거점 / 차량 어디 */
      test:/거점|카로존|어디.*(빌|차|있|받)|차.*어디|가까운.*(차|거점)|주차.*어디/,
      run:function(){
        var z=zoneNames(), n=availCount();
        if(!z.length) return null;
        return '현재 카로 거점은 <b>'+z.join(' · ')+'</b> 이에요.<br>'
             + '지금 이용 가능한 차량은 <b>'+n+'대</b>예요.<br><br>'
             + '홈 지도에서 거점을 누르면 차량을 바로 고를 수 있어요.';
      }
    }
  ];

  /* v4 검색 레이어가 "이건 v3 담당"인지 알 수 있도록 노출 */
  window.__caroPersonalCan = function(t){
    for(var i=0;i<PERSONAL.length;i++){ if(PERSONAL[i].test.test(t)) return true; }
    return false;
  };

  /* ── 점수 기반 의도 매칭 (첫 매칭이 아니라 최고점) ── */
  var KEYS={
    acc:   ['사고','충돌','박았','들이받','추돌','접촉','긁','찌그','파손'],
    car:   ['시동','안열','안 열','안잠','안 잠','고장','경고등','타이어','펑크','배터리','견인','출동','냄새','악취','담배','더럽','지저분','청소'],
    ret:   ['반납','연장','더 타','시간 늘','늦','분실','두고','놓고'],
    pay:   ['결제','요금','환불','영수증','세금계산서','정산','청구','과금','비싸','돈'],
    resv:  ['예약','취소','변경','바꾸','날짜','시간 바'],
    member:['가입','면허','인증','로그인','비밀번호','비번','아이디','탈퇴','회원','나이','경력'],
    app:   ['오류','버그','에러','튕','멈춰','안 떠','안떠','느려','업데이트','화면','알림','지도','gps']
  };
  function score(t){
    var best=null, bs=0;
    Object.keys(KEYS).forEach(function(k){
      var s=0;
      KEYS[k].forEach(function(w){ if(t.indexOf(w)>=0) s+=w.length>=3?2:1; });
      if(s>bs){ bs=s; best=k; }
    });
    return bs>0 ? best : null;
  }

  /* ── 입력 가로채기 ── */
  function hook(){
    var inp=$('cbot-in'), send=$('cbot-send'), body=$('cbot-body');
    if(!inp||!send||!body||inp.__caroV3) return false;
    inp.__caroV3=true;

    function addMe(t){ var d=document.createElement('div'); d.className='cbot-msg cbot-me'; d.textContent=t; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    function addBot(h){ var d=document.createElement('div'); d.className='cbot-msg cbot-bot'; d.innerHTML=h; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    function quick(list){
      var w=document.createElement('div'); w.className='cbot-qr';
      list.forEach(function(o){
        var b=document.createElement('button'); b.className='cbot-qbtn'+(o.go?' go':'');
        b.textContent=o.label;
        b.onclick=function(){ w.remove(); o.onClick(); };
        w.appendChild(b);
      });
      body.appendChild(w); body.scrollTop=body.scrollHeight;
    }
    function log(resolved, u, b){
      try{ if(window.__caroBotLog) window.__caroBotLog(resolved, u, b); }catch(e){}
    }
    function after(lastUser, lastBot){
      quick([
        {label:'✅ 해결됐어요', onClick:function(){
            addMe('해결됐어요');
            addBot('도움이 되어 다행이에요! 또 궁금한 점 있으면 언제든 찾아주세요. 🚗');
            log(true, '해결됐어요', '도움이 되어 다행이에요!');
            askClose();
        }},
        {label:'🙋 상담사 연결', go:true, onClick:function(){
            addMe('상담사 연결');
            addBot('상담사에게 연결해 드릴게요. <b>1:1 문의</b>로 내용을 남겨 주시면 순차적으로 답변드려요.');
            log(false, '상담사 연결', '1:1 문의로 안내');
            quick([{label:'📝 1:1 문의 접수', go:true, onClick:function(){
              try{ var x=$('cbot-x'); if(x) x.click(); if(window.goTo) goTo('inquiry-screen'); }catch(e){}
            }}]);
        }}
      ]);
    }
    /* 상담 종료 확인 */
    function askClose(){
      quick([
        {label:'상담 끝내기', go:true, onClick:function(){
            addBot('상담을 종료할게요. 이용해 주셔서 감사합니다 🙂');
            setTimeout(function(){ try{ var x=$('cbot-x'); if(x) x.click(); }catch(e){} }, 900);
        }},
        {label:'더 물어볼게요', onClick:function(){
            addBot('네, 편하게 물어보세요!');
        }}
      ]);
    }

    /* 개인화 우선 처리 → 없으면 false 반환해 기존 로직으로 */
    function tryPersonal(t){
      for(var i=0;i<PERSONAL.length;i++){
        var P=PERSONAL[i];
        if(!P.test.test(t)) continue;
        var out=null;
        try{ out=P.run(); }catch(e){ out=null; }
        if(!out && P.none) out=P.none;
        if(out){ addBot(out); log(null, t, String(out).replace(/<[^>]+>/g,'')); after(); return true; }
      }
      return false;
    }

    function handle(){
      var t=(inp.value||'').trim();
      if(!t) return;

      /* 1) 개인화 답변 시도 */
      if(tryPersonal(t)){ addMe(t); inp.value=''; return; }

      /* 2) 개인화 대상 아님 → 기존 봇에게 넘김 (원본 동작 유지) */
      return 'pass';
    }

    /* 기존 핸들러보다 먼저 실행되도록 캡처 단계에서 가로챔 */
    function intercept(e){
      var t=(inp.value||'').trim();
      if(!t) return;
      /* 개인화로 처리 가능하면 기존 핸들러 차단 */
      var can=false;
      for(var i=0;i<PERSONAL.length;i++){ if(PERSONAL[i].test.test(t)){ can=true; break; } }
      if(!can) return;   /* 기존 봇이 처리 */

      e.stopImmediatePropagation();
      e.preventDefault();
      var msg=t; inp.value='';
      addMe(msg);
      var done=false;
      for(var j=0;j<PERSONAL.length;j++){
        var P=PERSONAL[j];
        if(!P.test.test(msg)) continue;
        var out=null;
        try{ out=P.run(); }catch(err){ out=null; }
        if(!out && P.none) out=P.none;
        if(out){ addBot(out); log(null, msg, String(out).replace(/<[^>]+>/g,'')); after(); done=true; break; }
      }
      if(!done){ addBot('조금만 더 자세히 알려주실 수 있을까요?'); }
    }

    send.addEventListener('click', intercept, true);
    inp.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.keyCode===13) intercept(e);
    }, true);

    console.log('[상담봇 v3] ✅ 개인화 응답 활성화');
    return true;
  }

  if(!hook()){
    var n=0, iv=setInterval(function(){ n++; if(hook()||n>40) clearInterval(iv); }, 500);
  }
})();

/* ═══════════════════════════════════════════════════════════
   [수정] 상담봇 — 태블릿에서 전체화면으로 (길쭉함 해소)
   · 원인: #caro-bot 에 max-width:480px 가 걸려 좌우가 비었음
   · 폰(≤600px)은 기존 그대로, 태블릿/큰 화면만 넓게
   · 원본 CSS는 그대로 두고 뒤에서 덮어씀(override)
   ═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var css=''
   /* 태블릿·데스크톱: 전체 폭 사용 (좌우 여백 제거) */
   +'@media (min-width:601px){'
   +  '#caro-bot{max-width:none !important;width:100% !important;margin:0 !important;'
   +    'background:#f5f6f8 !important;}'
   /* 내용은 중앙 정렬해서 너무 넓게 늘어지지 않게 (읽기 편한 폭 유지) */
   +  '#caro-bot .cbot-hd{padding-left:max(14px,calc((100% - 900px)/2)) !important;'
   +    'padding-right:max(14px,calc((100% - 900px)/2)) !important;}'
   +  '#caro-bot .cbot-body{padding-left:max(14px,calc((100% - 900px)/2)) !important;'
   +    'padding-right:max(14px,calc((100% - 900px)/2)) !important;}'
   +  '#caro-bot .cbot-foot{padding-left:max(12px,calc((100% - 900px)/2)) !important;'
   +    'padding-right:max(12px,calc((100% - 900px)/2)) !important;}'
   /* 말풍선이 너무 길어지지 않도록 */
   +  '#caro-bot .cbot-msg{max-width:640px !important;}'
   +'}'
   /* 큰 태블릿(가로) — 여백을 조금 더 */
   +'@media (min-width:1000px){'
   +  '#caro-bot .cbot-msg{max-width:700px !important;}'
   +'}';
  var s=document.createElement('style');
  s.id='caro-bot-fullscreen';
  s.textContent=css;
  (document.head||document.documentElement).appendChild(s);
  console.log('[상담봇] ✅ 전체화면 레이아웃 적용');
})();

/* ═══════════════════════════════════════════════════════════
   [수정] 상담 종료 시 화면 초기화 (개인정보 보호)
   · 문제: 봇을 닫아도 대화가 화면에 남아, 다시 열면 이전 상담이 보임
   · 조치: 닫을 때 화면·메시지·상담ID를 비움 → 매번 새 상담으로 시작
   · Firestore(support_chats) 기록은 그대로 보존 (관리자 통계용)
   · 공용 태블릿에서 다음 고객이 이전 고객 상담을 보는 것을 방지
   ═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function $(id){ return document.getElementById(id); }

  function wipe(){
    var body=$('cbot-body');
    if(body) body.innerHTML='';          /* 화면의 대화 전부 삭제 */
    var inp=$('cbot-in');
    if(inp) inp.value='';                /* 입력창도 비움 */
    /* 원본 봇의 내부 상태(msgs/chatId/curCat) 초기화 → 새 상담 세션으로 */
    try{ if(window.__caroBotReset) window.__caroBotReset(); }catch(e){}
  }

  function hook(){
    var bot=$('caro-bot'), x=$('cbot-x');
    if(!bot || !x || x.__caroWipe) return false;
    x.__caroWipe=true;

    /* 닫기(X) 누르면 → 원본 close 실행 후 화면 비우기 */
    x.addEventListener('click', function(){ setTimeout(wipe, 260); });

    /* '상담 끝내기'로 자동 닫히는 경우도 커버:
       show 클래스가 사라지면 화면 비우기 */
    if(window.MutationObserver){
      new MutationObserver(function(){
        if(!bot.classList.contains('show')) setTimeout(wipe, 260);
      }).observe(bot,{attributes:true, attributeFilter:['class']});
    }
    console.log('[상담봇] ✅ 종료 시 대화 초기화 (다음 고객 보호)');
    return true;
  }

  if(!hook()){
    var n=0, iv=setInterval(function(){ n++; if(hook()||n>40) clearInterval(iv); }, 500);
  }
})();

/* ═══════════════════════════════════════════════════════════
   [개선] CARO 상담봇 v4 — FAQ 전체 검색 엔진
   ─────────────────────────────────────────────────────────
   문제: 봇에 상세 답변이 40개 있는데, 자유 입력은 13개 굵직한
         의도로만 연결돼서 대부분 "이해 못 했어요"로 끝남.
   해결: 40개 답변 전체를 검색 대상으로 삼고,
         · 한국어 2-gram 유사도 + 동의어 사전으로 점수화
         · 확실하면 바로 답변
         · 애매하면 "혹시 이거예요?" 후보 3개 제시  ← 막다른 길 제거
         · 정말 모르면 입력한 내용 그대로 1:1 문의로 넘김
   ═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';

  function $(id){ return document.getElementById(id); }

  /* ── 동의어/구어체 사전 (고객이 실제로 쓰는 말 → 표준어) ── */
  var SYN = {
    '반납':['반납','반환','돌려','반납하','갖다놓','반납할','리턴'],
    '연장':['연장','더타','더 타','시간늘','시간 늘','늘리','더쓰','더 쓰','늦어','늦을'],
    '취소':['취소','캔슬','물러','안탈','안 탈','취소하'],
    '변경':['변경','바꾸','바꿔','수정','옮기','미루'],
    '수수료':['수수료','위약','페널티','패널티','벌금','추가금'],
    '요금':['요금','가격','비용','얼마','금액','값','비싸','싸'],
    '결제':['결제','계산','카드','지불','청구','과금'],
    '환불':['환불','돌려받','되돌려','리펀'],
    '영수증':['영수증','증빙','세금계산서','현금영수증'],
    '보험':['보험','면책','자기부담','자차','대물','대인'],
    '사고':['사고','충돌','박았','박음','들이받','추돌','접촉','긁','찌그','파손','부딪'],
    '고장':['고장','안되','안 되','멈춰','서버렸','시동','경고등','타이어','펑크','배터리','퍼졌'],
    '문열기':['문열','문 열','잠금','잠그','스마트키','차키','차 키','언락','열쇠'],
    '분실물':['분실','두고','놓고','잃어','잊고','물건'],
    '주차':['주차','세워','파킹','댈','대는'],
    '거점':['거점','카로존','존','스테이션','정류','어디서','픽업'],
    '가입':['가입','회원','등록','계정','아이디','비번','비밀번호','로그인','탈퇴'],
    '면허':['면허','운전면허','자격','나이','연령','경력'],
    '월렌트':['월렌트','월 렌트','장기','한달','한 달','월단위'],
    '블랙':['블랙','더블랙','더 블랙','프리미엄','컨시어지'],
    '사진':['사진','촬영','찍','인증샷'],
    '청소':['청소','세차','냄새','악취','더럽','지저분','담배','얼룩','쓰레기'],
    '앱오류':['오류','버그','에러','튕','안떠','안 떠','느려','먹통','안나와','안 나와'],
    '예약':['예약','빌리','대여','렌트','타고','이용'],
    '장소':['어디','장소','위치','곳','데']
  };

  /* FAQ에 없던 질문 보강 (실제 고객이 자주 묻는데 답변이 없던 것들) */
  var EXTRA = [
    { cat:'car', catLabel:'🔧 차량 문제·긴급', q:'차량이 더럽거나 냄새가 나요',
      a:'불편을 드려 죄송해요. <b>사진과 함께 알려 주시면</b> 확인 후 조치해 드릴게요.<br>카로는 반납된 차량을 순회 전기차로 <b>자동세차 + 실내청소</b>하고 있어요. 다음 이용에 불편이 없도록 바로 처리하겠습니다.' },
    { cat:'member', catLabel:'👤 회원·가입·인증', q:'면허 자격 조건',
      a:'만 <b>21세 이상</b>, 운전면허 취득 <b>1년 이상</b>이면 이용할 수 있어요. 차종에 따라 추가 조건이 있을 수 있어요.' },
    { cat:'ret', catLabel:'🔄 반납·연장', q:'주차는 어디에 하나요',
      a:'대여했던 <b>카로존의 지정 주차구역</b>에 주차해 주세요. 부득이하게 다른 곳에 주차하면 반납 시 “다른 장소”를 선택하고 위치 설명과 사진을 남겨 주세요.' }
  ];

  /* ── 텍스트 정규화 ── */
  function norm(s){
    return String(s||'').toLowerCase()
      .replace(/<[^>]+>/g,' ')
      .replace(/[^가-힣a-z0-9]/g,'');
  }
  /* ── 한국어 2-gram ── */
  function grams(s){
    var t=norm(s), g=[];
    if(t.length<2) return t?[t]:[];
    for(var i=0;i<t.length-1;i++) g.push(t.substr(i,2));
    return g;
  }
  /* ── v5: 자모 분해(오타 보정용) — "반나비"도 "반납비"와 비슷하게 인식 ── */
  var _CHO='ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ',_JUNG='ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ',_JONG='\u0000ㄱㄲㄳㄴㄵㄶㄷㄹㄺㄻㄼㄽㄾㄿㅀㅁㅂㅄㅅㅆㅇㅈㅊㅋㅌㅍㅎ';
  function jamo(s){ var t=norm(s),o=''; for(var i=0;i<t.length;i++){ var c=t.charCodeAt(i);
    if(c>=0xAC00&&c<=0xD7A3){ var x=c-0xAC00; o+=_CHO[Math.floor(x/588)]+_JUNG[Math.floor((x%588)/28)]; var j=x%28; if(j) o+=_JONG[j]; }
    else o+=t[i]; } return o; }
  function jgrams(s){ var t=jamo(s),g=[]; if(t.length<2) return t?[t]:[]; for(var i=0;i<t.length-1;i++) g.push(t.substr(i,2)); return g; }
  /* ── 동의어 확장: 입력에서 표준 개념 뽑기 ── */
  function concepts(q){
    var t=norm(q), out={};
    Object.keys(SYN).forEach(function(k){
      for(var i=0;i<SYN[k].length;i++){
        if(t.indexOf(norm(SYN[k][i]))>=0){ out[k]=true; break; }
      }
    });
    return out;
  }

  /* ── 지식베이스 구축 (FLOW 40개 Q&A 전부) ── */
  var KB=[];
  function buildKB(){
    if(KB.length) return true;
    var kb=window.__caroBotKB;
    if(!kb || !kb.FLOW) return false;
    var CATS=kb.CATS||[], FLOW=kb.FLOW||{};
    Object.keys(FLOW).forEach(function(key){
      var f=FLOW[key];
      var catLabel=(CATS.filter(function(c){return c.key===key;})[0]||{}).label||'';
      /* 카테고리 대표 답변 */
      if(f.a) KB.push({ cat:key, catLabel:catLabel, q:catLabel.replace(/^\S+\s/,''), a:f.a, top:true });
      /* 상세 Q&A */
      (f.subs||[]).forEach(function(s){
        if(s && s.q && s.a) KB.push({ cat:key, catLabel:catLabel, q:s.q, a:s.a, top:false });
      });
    });
    /* FAQ에 없던 질문 보강 */
    EXTRA.forEach(function(x){ KB.push({cat:x.cat, catLabel:x.catLabel, q:x.q, a:x.a, top:false}); });

    /* 검색 인덱스: 질문과 답변을 분리해서 계산 (질문 매칭을 훨씬 크게 봄) */
    KB.forEach(function(e){
      e._qg = {}; grams(e.q).forEach(function(g){ e._qg[g]=1; });
      e._jg = {}; jgrams(e.q).forEach(function(g){ e._jg[g]=1; }); e._jgN = Object.keys(e._jg).length;
      e._ag = {}; grams(e.a).forEach(function(g){ e._ag[g]=1; });
      e._qgN = Object.keys(e._qg).length;
      e._qc = concepts(e.q);
      e._c  = concepts(e.q + ' ' + e.a);
    });
    console.log('[상담봇 v4] 지식베이스 구축:', KB.length, '개 답변');
    return KB.length>0;
  }

  /* ── 점수 계산 (시뮬레이션으로 검증된 가중치) ──
     핵심: 답변 본문이 길다는 이유로 엉뚱한 항목이 이기지 않도록
           질문 매칭을 자카드로 계산(길이 보정)하고 가중치를 크게 둠 */
  function scoreEntry(e, qg, qc, qn, jq){
    var s=0, i;

    /* 1) 질문 유사도 — 자카드 (교집합/합집합) → 긴 항목 부당 승리 방지 */
    if(qg.length && e._qgN){
      var inter=0, seen={};
      for(i=0;i<qg.length;i++){
        if(seen[qg[i]]) continue;
        seen[qg[i]]=1;
        if(e._qg[qg[i]]) inter++;
      }
      var uniq=Object.keys(seen).length;
      var uni = uniq + e._qgN - inter;
      if(uni>0) s += (inter/uni) * 55;
    }

    /* 2) 답변 본문 매칭 — 보조 지표 (가중치 낮음) */
    if(qg.length){
      var hitA=0, seenA={};
      for(i=0;i<qg.length;i++){
        if(seenA[qg[i]]) continue;
        seenA[qg[i]]=1;
        if(e._ag[qg[i]]) hitA++;
      }
      s += (hitA / Object.keys(seenA).length) * 15;
    }

    /* 3) 개념(동의어) 일치 — 질문의 개념이 맞으면 강한 신호 */
    var ck=Object.keys(qc);
    if(ck.length){
      var qm=0, am=0;
      ck.forEach(function(k){ if(e._qc[k]) qm++; if(e._c[k]) am++; });
      s += (qm/ck.length) * 40;
      s += (am/ck.length) * 10;
      if(am===0) s -= 18;   /* 개념이 전혀 안 맞으면 감점 */
    }

    /* 3.5) v5: 자모 유사도 — 오타·붙여쓰기 보정 */
    if(jq && jq.length && e._jgN){
      var ji=0, js={};
      for(i=0;i<jq.length;i++){ if(js[jq[i]]) continue; js[jq[i]]=1; if(e._jg[jq[i]]) ji++; }
      var ju=Object.keys(js).length + e._jgN - ji;
      if(ju>0) s += (ji/ju) * 22;
    }

    /* 4) 질문에 통째로 포함 */
    if(qn.length>=2 && norm(e.q).indexOf(qn)>=0) s += 25;

    return s;
  }

  function search(q){
    if(!buildKB()) return [];
    var qg=grams(q), qc=concepts(q), qn=norm(q);
    var jq=jgrams(q);
    var out=KB.map(function(e){ return {e:e, s:scoreEntry(e,qg,qc,qn,jq)}; });
    out.sort(function(a,b){ return b.s-a.s; });
    return out;
  }

  /* ── 봇 UI 연결 ── */
  function hook(){
    var inp=$('cbot-in'), send=$('cbot-send'), body=$('cbot-body');
    if(!inp||!send||!body||inp.__caroV4) return false;
    if(!buildKB()) return false;
    inp.__caroV4=true;

    function addMe(t){ var d=document.createElement('div'); d.className='cbot-msg cbot-me'; d.textContent=t; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    function addBot(h){ var d=document.createElement('div'); d.className='cbot-msg cbot-bot'; d.innerHTML=h; body.appendChild(d); body.scrollTop=body.scrollHeight; }
    function quick(list){
      var w=document.createElement('div'); w.className='cbot-qr';
      list.forEach(function(o){
        var b=document.createElement('button'); b.className='cbot-qbtn'+(o.go?' go':'');
        b.textContent=o.label;
        b.onclick=function(){ w.remove(); o.onClick(); };
        w.appendChild(b);
      });
      body.appendChild(w); body.scrollTop=body.scrollHeight;
    }
    function log(resolved,u,b){ try{ if(window.__caroBotLog) window.__caroBotLog(resolved,u,b); }catch(e){} }

    /* ── v5: 문맥 기억 ── */
    var CTX={t:''};

    /* ── v5: 실시간 데이터 답변 (내 예약·지금 요금·공지/이벤트) ── */
    function _p2(n){ return n<10?'0'+n:''+n; }
    function dataAnswer(t){
      var n=norm(t);
      /* 내 예약 / 남은 시간 */
      if(/내예약|예약확인|예약있|예약내역|예약뭐|남은시간|언제까지|몇시까지|반납몇시/.test(n) || (/예약/.test(n) && /(확인|조회|있|몇|언제)/.test(n))){
        var list=(window.myReservations||[]).filter(function(r){ return r && !r.returned && r.start && r.end; });
        if(!list.length) return '지금 <b>예약된 차량이 없어요</b>. 홈의 「지금 바로 타기」에서 바로 예약할 수 있어요.';
        list.sort(function(a,b){ return new Date(a.start)-new Date(b.start); });
        var now=new Date(), h='';
        list.slice(0,3).forEach(function(r){
          var st=new Date(r.start), en=new Date(r.end);
          var nm=(r.car&&r.car.name)||r.carName||'차량';
          if(now>=st&&now<=en){ var m=Math.max(0,Math.floor((en-now)/60000));
            h+='<b>'+nm+'</b> — 이용 중 · 반납까지 <b>'+(Math.floor(m/60)>0?Math.floor(m/60)+'시간 ':'')+(m%60)+'분</b> ('+_p2(en.getHours())+':'+_p2(en.getMinutes())+' 반납)<br>'; }
          else if(now<st){ h+='<b>'+nm+'</b> — '+(st.getMonth()+1)+'/'+st.getDate()+' '+_p2(st.getHours())+':'+_p2(st.getMinutes())+' 시작 예정<br>'; }
        });
        return h||null;
      }
      /* 지금/오늘 요금 */
      if(/(지금|오늘|현재)/.test(n) && /(요금|가격|얼마)/.test(n)){
        try{
          var d=new Date(), cfg=window.__caroPricing||{};
          var season=(cfg.season==='peak')?'성수기':'비성수기';
          var we=window.caroIsWeekendRate?caroIsWeekendRate(d):false;
          var night=!we && window.caroIsNightRate && caroIsNightRate(d);
          var tier=we?'주말/공휴일':(night?'평일 심야(20~08시)':'평일');
          var h='지금은 <b>'+season+' · '+tier+'</b> 요금이 적용되고 있어요.';
          var car=(window.CARS_DATA||[]).filter(Boolean)[0];
          if(car && window.caroRate){ h+='<br>예시: <b>'+(car.name||'차량')+'</b> 시간당 <b>'+Number(caroRate(car,d)).toLocaleString()+'원</b>'; }
          return h+'<br>차량별 정확한 요금은 예약 화면에서 확인해 주세요.';
        }catch(e){ return null; }
      }
      /* 공지 / 이벤트 */
      if(/(공지|이벤트)/.test(n) && /(뭐|있|알려|최근|진행|어떤|보여)/.test(n)){
        var out='';
        var ev=(window.EVENT_DETAILS||[]).slice(0,3).filter(function(e){return e&&e.title;});
        if(ev.length) out+='<b>진행 중 이벤트</b><br>'+ev.map(function(e){ return '· '+e.title; }).join('<br>');
        var nt=(window.CARO_NOTICES||[]).slice(0,3).filter(function(x){return x&&x.title;});
        if(nt.length) out+=(out?'<br><br>':'')+'<b>공지사항</b><br>'+nt.map(function(x){ return '· '+x.title; }).join('<br>');
        return out||null;
      }
      return null;
    }

    /* ── v5: LLM(AI) 연동 슬롯 — API 키가 설정된 경우에만 사용 ── */
    /* ★ 서버 경유 AI 답변 (caro-secure.js 의 caroAskBot → Cloud Function askBot). 키는 서버 Secret 에만 존재 */
    function askLLMServer(t){
      addBot('잠시만요, 확인하고 있어요…');
      var done=false;
      var timer=setTimeout(function(){ if(!done){ done=true; toAgent(t); } }, 12000);
      Promise.resolve().then(function(){ return window.caroAskBot(t); }).then(function(a){
        if(done) return; done=true; clearTimeout(timer);
        if(a){ addBot(String(a).replace(/\n/g,'<br>')); log(null,t,'LLM 답변(서버)'); CTX.t=t; endButtons(); }
        else { toAgent(t); }
      }).catch(function(){ if(done) return; done=true; clearTimeout(timer); toAgent(t); });
    }
    /* (구) 브라우저 직접 호출 — 더 이상 호출되지 않음. 키가 노출되므로 사용 금지 */
    function askLLM(t,key){
      addBot('잠시만요, 확인하고 있어요…');
      var sys='너는 한국 카셰어링 서비스 CARO MOBILITY(카로 모빌리티)의 고객 상담원이다. 정중한 한국어 존댓말로, 3문장 이내로 간결하게 답한다. 확실하지 않으면 추측하지 말고 1:1 문의 접수를 권한다. 예약/결제 변경 등 실제 처리는 앱 화면(내 예약, 결제·면허, 고객센터)을 안내한다.';
      fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key='+encodeURIComponent(key),{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ contents:[{ parts:[{ text: sys+'\n\n고객 질문: '+t }] }] })
      }).then(function(r){ return r.json(); }).then(function(j){
        var a=j&&j.candidates&&j.candidates[0]&&j.candidates[0].content&&j.candidates[0].content.parts&&j.candidates[0].content.parts[0]&&j.candidates[0].content.parts[0].text;
        if(a){ addBot(String(a).replace(/\n/g,'<br>')); log(null,t,'LLM 답변'); CTX.t=t; endButtons(); }
        else { toAgent(t); }
      }).catch(function(){ toAgent(t); });
    }

    function endButtons(){
      quick([
        {label:'✅ 해결됐어요', onClick:function(){
          addMe('해결됐어요'); addBot('도움이 되어 다행이에요! 🚗');
          log(true,'해결됐어요','해결');
          quick([
            {label:'상담 끝내기', go:true, onClick:function(){
              addBot('상담을 종료할게요. 이용해 주셔서 감사합니다 🙂');
              setTimeout(function(){ var x=$('cbot-x'); if(x) x.click(); }, 900);
            }},
            {label:'더 물어볼게요', onClick:function(){ addBot('네, 편하게 물어보세요!'); }}
          ]);
        }},
        {label:'🙋 상담사 연결', go:true, onClick:function(){ toAgent(''); }}
      ]);
    }

    function toAgent(userText){
      addMe('상담사 연결');
      addBot('상담사에게 연결해 드릴게요. <b>1:1 문의</b>로 남겨 주시면 직접 답변드려요.');
      log(false, userText||'상담사 연결', '1:1 문의 안내');
      quick([{label:'📝 1:1 문의 접수', go:true, onClick:function(){
        try{
          /* 고객이 쓴 내용을 문의 폼에 미리 채워줌 — 두 번 안 쓰게 */
          if(userText){
            setTimeout(function(){
              var f=document.getElementById('cs-inquiry-form');
              if(f){
                var ta=f.querySelector('textarea');
                if(ta && !ta.value) ta.value=userText;
              }
            }, 500);
          }
          var x=$('cbot-x'); if(x) x.click();
          if(window.goTo) goTo('inquiry-screen');
        }catch(e){}
      }}]);
    }

    function answer(e, userText){
      CTX.t=userText||e.q;
      addBot(e.a);
      log(null, userText, String(e.a).replace(/<[^>]+>/g,''));
      endButtons();
    }

    function handle(t){
      /* v5: 실시간 데이터 답변 우선 */
      var da=dataAnswer(t);
      if(da){ addBot(da); log(true,t,'데이터 답변'); CTX.t=t; endButtons(); return; }
      var res=search(t);
      /* v5: 짧은 후속 질문이면 직전 주제와 합쳐 재검색 (문맥 이어받기) */
      if(CTX.t && (!res.length || res[0].s<38) && norm(t).length<=10){
        var res2=search(CTX.t+' '+t);
        if(res2.length && (!res.length || res2[0].s > res[0].s+5)) res=res2;
      }
      if(!res.length){ toAgent(t); return; }

      var best=res[0];

      /* 확실함 → 바로 답변 */
      if(best.s >= 38){
        answer(best.e, t);
        return;
      }

      /* 애매함 → "혹시 이거예요?" 후보 제시 (막다른 길 없음) */
      if(best.s >= 14){
        var cands=res.filter(function(r){ return r.s>=10; }).slice(0,3);
        addBot('혹시 이 중에 찾으시는 게 있을까요?');
        log(null, t, '후보 제시');
        var btns=cands.map(function(r){
          return { label:r.e.q, onClick:function(){ addMe(r.e.q); answer(r.e, r.e.q); } };
        });
        btns.push({label:'🙋 다 아니에요 (상담사 연결)', go:true, onClick:function(){ toAgent(t); }});
        quick(btns);
        return;
      }

      /* v5: AI(LLM) 키가 있으면 AI가 직접 답변 */
      /* ★ FIX(H9): AI 키를 브라우저에 두고 직접 호출하던 경로 제거. 서버(Cloud Function) 경유 caroAskBot 이 있을 때만 AI 답변 */
      try{ localStorage.removeItem('caro_ai_key'); }catch(e){}
      if(typeof window.caroAskBot==='function'){ askLLMServer(t); return; }

      /* 정말 모름 → 솔직히 말하고 바로 사람에게 (입력 내용 그대로 전달) */
      addBot('죄송해요, 제가 정확히 이해하지 못했어요. 😥<br>'
           + '<b>상담사에게 바로 연결</b>해 드릴게요 — 방금 쓰신 내용은 그대로 전달돼요.');
      log(null, t, '이해 실패 → 상담사 연결 유도');
      quick([
        {label:'🙋 상담사 연결', go:true, onClick:function(){ toAgent(t); }},
        {label:'주제에서 고르기', onClick:function(){
          var kb=window.__caroBotKB;
          var cats=(kb&&kb.CATS)||[];
          quick(cats.map(function(c){
            return { label:c.label, onClick:function(){
              addMe(c.label.replace(/^\S+\s/,''));
              var top=KB.filter(function(e){ return e.cat===c.key && e.top; })[0];
              if(top) addBot(top.a);
              var subs=KB.filter(function(e){ return e.cat===c.key && !e.top; });
              if(subs.length){
                quick(subs.map(function(e){
                  return { label:e.q, onClick:function(){ addMe(e.q); answer(e, e.q); } };
                }));
              } else endButtons();
            }};
          }));
        }}
      ]);
    }

    /* 기존 핸들러보다 먼저 가로채기 */
    function intercept(ev){
      var t=(inp.value||'').trim();
      if(!t) return;

      /* 개인화(v3)가 처리할 질문이면 v3에게 양보 */
      if(window.__caroPersonalCan && window.__caroPersonalCan(t)) return;

      /* 상담사 직접 요청은 기존 로직 유지 */
      if(/상담사|상담원|직원|사람.*연결|콜센터/.test(t)) return;

      ev.stopImmediatePropagation();
      ev.preventDefault();
      inp.value='';
      addMe(t);
      handle(t);
    }

    send.addEventListener('click', intercept, true);
    inp.addEventListener('keydown', function(e){
      if(e.key==='Enter'||e.keyCode===13) intercept(e);
    }, true);

    console.log('[상담봇 v5] ✅ 검색+오타보정+문맥+실시간데이터'+((function(){try{return localStorage.getItem('caro_ai_key')?'+AI':''}catch(e){return ''}})())+' (' + KB.length + '개 답변)');
    return true;
  }

  window.caroSetAiKey=function(){ return 'AI 키는 앱에 저장하지 않습니다 — Cloud Functions Secret(GEMINI_API_KEY)에 설정하세요.'; };
  if(!hook()){
    var n=0, iv=setInterval(function(){ n++; if(hook()||n>60) clearInterval(iv); }, 500);
  }
})();

/* ── 예약 화면 진입 시 항상 500m(레벨 6)로 시작 ── */
(function(){
  if(window.__caroLevelPatched) return;
  window.__caroLevelPatched = true;
  var _im = window.initMap;
  window.initMap = function(){
    var r = _im ? _im.apply(this, arguments) : undefined;
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      try{
        if(window.caroMap && typeof window.caroMap.setLevel === 'function'){
          window.caroMap.setLevel(7);
          clearInterval(iv);
          return;
        }
      }catch(e){}
      if(tries > 20) clearInterval(iv);
    }, 200);
    return r;
  };
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 성수기/비성수기 × 주말/평일 요금 엔진
   · 관리자(admin-pricing.js)가 차종별 4요금(성수기·비성수기 × 평일·주말)을 설정
   · 주말 = 금요일 18시~ + 토·일 + 공휴일 → 자동으로 주말요금 적용
   · 성수기/비성수기는 관리자 토글(현재 적용 시즌)
   · 설정이 없으면 기존 차량 요금(pricePerHour) 그대로 유지 (비파괴)
   · 설정은 Firestore settings/pricing + localStorage 동기
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  var LS='caro_pricing_cfg';
  function loadLS(){ try{ var r=localStorage.getItem(LS); return r?JSON.parse(r):null; }catch(e){ return null; } }
  window.__caroPricing = window.__caroPricing || loadLS() || {season:'off',models:{}};

  /* 공휴일: 고정일(매년) + 음력/변동(2026·2027) */
  var FIXED={'01-01':1,'03-01':1,'05-05':1,'06-06':1,'08-15':1,'10-03':1,'10-09':1,'12-25':1};
  var VAR={'2026-02-16':1,'2026-02-17':1,'2026-02-18':1,'2026-05-24':1,'2026-05-25':1,'2026-09-24':1,'2026-09-25':1,'2026-09-26':1,
           '2027-02-06':1,'2027-02-07':1,'2027-02-08':1,'2027-05-13':1,'2027-09-14':1,'2027-09-15':1,'2027-09-16':1};
  function pad(n){ return n<10?'0'+n:''+n; }
  function isHoliday(d){ try{ var md=pad(d.getMonth()+1)+'-'+pad(d.getDate()); if(FIXED[md])return true; return !!VAR[d.getFullYear()+'-'+md]; }catch(e){ return false; } }
  window.caroIsHoliday=isHoliday;
  /* 주말요금 기준: 금 18시~ / 토 / 일 / 공휴일 */
  function isWeekendRate(d){ try{ var day=d.getDay(); if(day===0||day===6) return true; if(day===5 && d.getHours()>=18) return true; return isHoliday(d); }catch(e){ return false; } }
  window.caroIsWeekendRate=isWeekendRate;

  function modelKey(car){ return String((car&&(car.model||car.name||car.carName))||'').trim(); }
  function baseRate(car){ return (car && car.__origRate!=null)?car.__origRate:(car?(car.pricePerHour||0):0); }

  function isNightRate(d){ try{ var h=d.getHours(); return (h>=20 || h<8); }catch(e){ return false; } }
  window.caroIsNightRate=isNightRate;
  function caroRate(car, when){
    try{
      var base=baseRate(car);
      var cfg=window.__caroPricing; if(!cfg||!cfg.models) return base;
      var m=cfg.models[modelKey(car)]; if(!m) return base;
      var season=(cfg.season==='peak')?'peak':'off';
      var d=when||new Date();
      var we=isWeekendRate(d);
      var key;
      if(season==='peak'){ key = we?'pwe':'pwd'; }
      else { key = we?'owe':(isNightRate(d) && Number(m.own)>0 ? 'own' : 'owd'); }  /* 비성수기 평일 심야(20~08) */
      var v=Number(m[key]);
      return (v>0)?v:base;
    }catch(e){ return baseRate(car); }
  }
  window.caroRate=caroRate;

  function applyAll(when){
    try{
      [window.CARS_DATA, window.BL_CARS].forEach(function(list){
        (list||[]).forEach(function(car){
          if(!car) return;
          if(car.__origRate==null) car.__origRate=car.pricePerHour;
          car.pricePerHour=caroRate(car, when);
        });
      });
    }catch(e){}
  }
  window.caroApplyPricing=applyAll;

  function resStartDate(){ try{ var s=document.getElementById('res-start'); if(s&&s.value){ var d=new Date(s.value); if(!isNaN(d.getTime())) return d; } }catch(e){} return new Date(); }

  function wrap(fnName, whenFn){
    var orig=window[fnName];
    if(typeof orig==='function' && !orig.__caroPriceWrap){
      window[fnName]=function(){ try{ applyAll(whenFn()); }catch(e){} return orig.apply(this,arguments); };
      window[fnName].__caroPriceWrap=true;
    }
  }
  function hookAll(){ wrap('updatePriceSummary', resStartDate); wrap('goToPayment', resStartDate); wrap('renderReservationCard', resStartDate); }

  function reloadRemote(){
    try{
      var db=window.FB_DB, fn=window.FB_FN;
      if(db && fn && fn.getDoc && fn.doc){
        fn.getDoc(fn.doc(db,'settings','pricing')).then(function(snap){
          var ex = snap && (typeof snap.exists==='function'?snap.exists():snap.exists);
          if(ex){
            var d=(typeof snap.data==='function'?snap.data():snap.data)||{};
            window.__caroPricing={season:(d.season==='peak'?'peak':'off'), models:d.models||{}};
            try{ localStorage.setItem(LS, JSON.stringify(window.__caroPricing)); }catch(e){}
            applyAll(new Date());
            try{ if(window.renderCars) renderCars(); if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
          }
        }).catch(function(){});
      }
    }catch(e){}
  }
  window.caroReloadPricing=reloadRemote;

  /* 실시간 구독 — 관제에서 요금 저장 시 새로고침 없이 즉시 반영 */
  var _priceSubbed=false;
  function subscribeRemote(){
    if(_priceSubbed) return;
    try{
      var db=window.FB_DB, fn=window.FB_FN;
      if(db && fn && typeof fn.onSnapshot==='function' && fn.doc){
        _priceSubbed=true;
        fn.onSnapshot(fn.doc(db,'settings','pricing'), function(snap){
          try{
            var ex = snap && (typeof snap.exists==='function'?snap.exists():snap.exists);
            if(!ex) return;
            var d=(typeof snap.data==='function'?snap.data():snap.data)||{};
            window.__caroPricing={season:(d.season==='peak'?'peak':'off'), models:d.models||{}};
            try{ localStorage.setItem(LS, JSON.stringify(window.__caroPricing)); }catch(e){}
            applyAll(resStartDate());
            try{ if(window.renderCars) renderCars(); }catch(e){}
            try{ if(window.updateMapMarkers) updateMapMarkers(); }catch(e){}
            try{ if(window.updatePriceSummary) updatePriceSummary(); }catch(e){}
          }catch(e){}
        }, function(){});
      }
    }catch(e){}
  }
  window.caroSubscribePricing=subscribeRemote;

  function boot(){ hookAll(); applyAll(new Date()); reloadRemote(); subscribeRemote(); try{ if(window.renderCars) renderCars(); }catch(e){} }
  var tries=0, iv=setInterval(function(){ tries++; hookAll(); subscribeRemote(); if(window.CARS_DATA){ boot(); clearInterval(iv); } if(tries>30) clearInterval(iv); }, 200);
  var subTries=0, subIv=setInterval(function(){ subscribeRemote(); if(_priceSubbed || subTries++>40) clearInterval(subIv); }, 500);

  if(typeof window.goTo==='function' && !window.goTo.__caroPriceGoto){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); try{ if(id==='reservation-screen'||id==='rental-screen'){ applyAll(resStartDate()); } }catch(e){} return r; };
    window.goTo.__caroPriceGoto=true;
  }
  console.log('[요금] ✅ 성수기/주말 요금 엔진 (설정 없으면 기존 요금 유지)');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] 전 화면 P1 라이트 통일 패치 v1
   · 홈(대기화면)은 그대로 — 나머지 화면을 홈과 같은 톤으로
   · 이용내역/내예약 카드, 로그인/가입/찾기 폼, 모달, 입력칸 통일
   · 시작(main) 화면에 홈과 같은 와드 마크 추가
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var st=document.createElement('style'); st.id='caro-p1-unify';
  st.textContent=
    /* ── 이용내역·내 예약 카드 ── */
    '#usage-history-screen .my-res-card,#my-reservation-screen .my-res-card{background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:18px;padding:16px;box-shadow:0 2px 10px -7px rgba(40,48,58,.16);backdrop-filter:none;-webkit-backdrop-filter:none;}'
   +'.my-res-status{border-radius:8px;font-weight:800;letter-spacing:.01em;}'
   +'.my-res-no{color:var(--text-m,#8a8f99);font-size:.72rem;font-weight:700;}'
   +'.my-res-car-name{font-weight:800;}'
   +'#usage-history-screen .detail-btn,#my-reservation-screen .detail-btn{background:var(--accent,#18191c);color:#fff;border:0;border-radius:12px;padding:12px;font-weight:800;}'
   +'#usage-history-screen .detail-btn:active,#my-reservation-screen .detail-btn:active{opacity:.85;}'
   +'.empty-reservation .empty-icon{filter:grayscale(1);opacity:.45;}'
   +'.empty-reservation .empty-text{color:var(--text-m,#8a8f99);font-weight:600;}'
    /* ── 로그인·회원가입·찾기 폼 카드 ── */
   +'#login-screen .form-container,#signup-screen .form-container,#find-screen .form-container{background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:20px;box-shadow:0 10px 28px -18px rgba(40,48,58,.3);backdrop-filter:none;-webkit-backdrop-filter:none;}'
   +'#login-screen .form-input,#signup-screen .form-input,#find-screen .form-input{border-radius:13px;background:#fff;}'
   +'#login-screen .form-input:focus,#signup-screen .form-input:focus,#find-screen .form-input:focus{border-color:var(--accent,#18191c);}'
    /* ── 모달 공통 ── */
   +'.modal-box{background:var(--silver-base,#eff1f4);}'
   +'.modal-box .modal-header{border-bottom:1px solid var(--p1-line,#e8eaee);}'
    /* ── 화면 제목 타이포 ── */
   +'.myres-main-title{font-weight:800;letter-spacing:-.01em;}'
    /* ── 시작(main) 화면 와드 마크 ── */
   +'#main-screen .caro-main-mk{width:96px;height:96px;border-radius:26px;margin:0 auto 22px;'
   +'background:linear-gradient(145deg,#f5f7fa,#dee3ea);border:1px solid #d3d8de;display:flex;align-items:center;justify-content:center;'
   +'box-shadow:0 10px 26px -14px rgba(48,56,68,.34);}'
   +'#main-screen .caro-main-mk svg{width:42px;height:42px;color:var(--p1-slate,#5a6470);}';
  (document.head||document.documentElement).appendChild(st);

  /* 시작 화면에 와드 마크 삽입 (홈·스플래시와 동일 마크) */
  function mainMark(){
    var w=document.querySelector('#main-screen .main-brand-wrap');
    if(!w || w.querySelector('.caro-main-mk')) return;
    var d=document.createElement('div'); d.className='caro-main-mk';
    d.innerHTML='<svg viewBox="132 92 248 350" xmlns="http://www.w3.org/2000/svg"><path d="M256 396C256 396 360 292 360 208A104 104 0 0 0 152 208C152 292 256 396 256 396Z" fill="currentColor"/><path d="M293 171A52 52 0 1 0 293 245" fill="none" stroke="#fff" stroke-width="30" stroke-linecap="round"/></svg>';
    w.insertBefore(d, w.firstChild);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', mainMark);
  else mainMark();
  setTimeout(mainMark, 1200);
  console.log('[디자인] ✅ 전 화면 P1 통일 패치 v1');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] CARO 이용내역·내정보 v1
   · 홈(원형·최근차량·메뉴6개)은 그대로
   · 이용내역: 필터(전체/이용완료/취소) + 월별 그룹 + 카드 타임라인
   · 내정보: 프로필 아래 요약(총 이용·멤버십) 추가
   · 기존 기능(상세보기 openUsageDetail, 데이터) 그대로 사용
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function nm(r){ try{ return (window.getCarName&&r.car)?getCarName(r.car):((r.car&&r.car.name)||'차량'); }catch(e){ return (r.car&&r.car.name)||'차량'; } }
  function p2(n){ return n<10?'0'+n:''+n; }
  function fmtP(d){ d=new Date(d); return (d.getMonth()+1)+'.'+d.getDate()+' ('+'일월화수목금토'[d.getDay()]+') '+p2(d.getHours())+':'+p2(d.getMinutes()); }
  function fmtHM(d){ d=new Date(d); return p2(d.getHours())+':'+p2(d.getMinutes()); }

  var css=document.createElement('style'); css.id='caro-socar-v1';
  css.textContent=
    '.suh-seg{position:relative;z-index:2;display:flex;background:#e4e8ed;border-radius:12px;padding:4px;margin:4px auto 14px;width:calc(100% - 32px);max-width:428px;align-self:center;box-sizing:border-box;}'
   +'.suh-seg b{flex:1;text-align:center;padding:9px 0;border-radius:9px;font-size:.86rem;font-weight:700;color:var(--text-m,#8a8f99);cursor:pointer;transition:.15s;}'
   +'.suh-seg b.on{background:#fff;color:var(--text-1,#1b2027);box-shadow:0 2px 6px -3px rgba(40,48,58,.25);}'
   +'.suh-mon{font-size:.8rem;font-weight:800;color:var(--text-m,#8a8f99);margin:18px 20px 10px;}'
   +'.suh-card{background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:18px;padding:16px;margin:0 16px 12px;box-shadow:0 2px 8px -6px rgba(40,48,58,.16);}'
   +'.suh-row{display:flex;align-items:center;gap:13px;}'
   +'.suh-img{width:74px;height:46px;border-radius:10px;background:linear-gradient(135deg,#dfe4ea,#c7cfd8);object-fit:contain;flex:0 0 auto;}'
   +'.suh-info{flex:1;min-width:0;}'
   +'.suh-st{display:inline-block;font-size:.68rem;font-weight:800;padding:3px 8px;border-radius:7px;margin-bottom:6px;}'
   +'.suh-st.done{background:var(--p1-soft,#f2f3f5);color:var(--p1-accent-d,#57616d);}'
   +'.suh-st.ing{background:var(--accent,#18191c);color:#fff;}'
   +'.suh-st.rsv{background:#fff;color:var(--accent,#18191c);border:1.3px solid var(--accent,#18191c);}'
   +'.suh-st.bad{background:#f7ecec;color:#b8574a;}'
   +'.suh-name{font-size:.98rem;font-weight:800;color:var(--text-1,#1b2027);}'
   +'.suh-meta{font-size:.76rem;color:var(--text-m,#8a8f99);margin-top:3px;line-height:1.45;}'
   +'.suh-price{text-align:right;flex:0 0 auto;}'
   +'.suh-price b{font-size:.95rem;font-weight:800;color:var(--text-1,#1b2027);}'
   +'.suh-price small{display:block;font-size:.7rem;color:var(--text-m,#8a8f99);margin-top:3px;}'
   +'.suh-foot{display:flex;gap:8px;margin-top:12px;padding-top:12px;border-top:1px solid var(--p1-soft,#f2f3f5);}'
   +'.suh-btn{flex:1;border:1px solid var(--p1-line,#e8eaee);background:#fff;border-radius:10px;padding:10px;font-size:.8rem;font-weight:700;color:var(--text-1,#1b2027);text-align:center;cursor:pointer;font-family:inherit;}'
   +'.suh-btn.dark{background:var(--accent,#18191c);color:#fff;border-color:var(--accent,#18191c);}'
   +'.suh-btn:active{opacity:.85;}'
   /* 내정보 요약 */
   +'.mpn-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:12px 16px 4px;position:relative;z-index:2;}'
   +'.mpn-stt{background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:15px;padding:13px 6px;text-align:center;box-shadow:0 2px 8px -6px rgba(40,48,58,.12);}'
   +'.mpn-stt b{font-size:1.02rem;font-weight:800;display:block;color:var(--text-1,#1b2027);}'
   +'.mpn-stt span{font-size:.7rem;color:var(--text-m,#8a8f99);}';
  (document.head||document.documentElement).appendChild(css);

  /* ── 이용내역 CARO 렌더러 ── */
  var FILTER='all';
  function buildAll(){
    var all=[], now=new Date();
    (window.myReservations||[]).forEach(function(r,i){
      if(!r) return;
      var st='reserved';
      if(r.returned) st='returned';
      else if(now>=new Date(r.start)&&now<=new Date(r.end)) st='active';
      else if(now>new Date(r.end)) st='overdue';
      all.push({r:r,idx:i,status:st});
    });
    (window.cancelledHistory||[]).forEach(function(r){ if(r) all.push({r:r,idx:-1,status:'cancelled'}); });
    all.sort(function(a,b){
      var da=a.status==='cancelled'?a.r.cancelledAt:a.r.start;
      var db=b.status==='cancelled'?b.r.cancelledAt:b.r.start;
      return new Date(db)-new Date(da);
    });
    return all;
  }
  function chip(st){
    if(st==='active') return '<span class="suh-st ing">이용 중</span>';
    if(st==='overdue') return '<span class="suh-st bad">반납 필요</span>';
    if(st==='returned') return '<span class="suh-st done">이용 완료</span>';
    if(st==='cancelled') return '<span class="suh-st bad">취소됨</span>';
    return '<span class="suh-st rsv">예약 완료</span>';
  }
  function card(item, gi){
    var r=item.r, st=item.status;
    var img=(r.car&&r.car.img)?'<img class="suh-img" src="'+esc(r.car.img)+'" onerror="this.style.visibility=\'hidden\'">':'<div class="suh-img"></div>';
    var period = st==='cancelled'
      ? fmtP(r.start)+' 예약 · 취소 '+(r.refundPct>0?('환불 '+Number(r.refundAmt||0).toLocaleString()+'원 ('+r.refundPct+'%)'):'환불 없음')
      : fmtP(r.start)+' ~ '+fmtHM(r.end);
    var price = st==='cancelled'
      ? '<b>'+(r.refundPct>0?Number(r.refundAmt||0).toLocaleString():'0')+'원</b><small>'+(r.refundPct>0?'환불 예정':'환불 없음')+'</small>'
      : '<b>'+(r.total!=null?Number(r.total).toLocaleString()+'원':'')+'</b><small>'+(r.hrs?r.hrs+'시간':'')+'</small>';
    var btns='';
    if(st==='active'||st==='overdue') btns='<div class="suh-btn" onclick="openUsageDetail('+gi+')">이용 상세</div><div class="suh-btn dark" onclick="goTo(\'my-reservation-screen\')">차량 제어</div>';
    else if(st==='returned') btns='<div class="suh-btn" onclick="openUsageDetail('+gi+')">이용 상세</div><div class="suh-btn" onclick="goTo(\'rental-screen\')">다시 예약</div>';
    else if(st==='reserved') btns='<div class="suh-btn" onclick="openUsageDetail('+gi+')">이용 상세</div><div class="suh-btn dark" onclick="goTo(\'my-reservation-screen\')">예약 확인</div>';
    else btns='<div class="suh-btn" onclick="openUsageDetail('+gi+')">상세 보기</div>';
    return '<div class="suh-card"><div class="suh-row">'+img
      +'<div class="suh-info">'+chip(st)+'<div class="suh-name">'+esc(nm(r))+'</div><div class="suh-meta">'+period+'</div></div>'
      +'<div class="suh-price">'+price+'</div></div>'
      +'<div class="suh-foot">'+btns+'</div></div>';
  }
  function render(){
    var list=document.getElementById('usage-history-list'); if(!list) return;
    var scr=document.getElementById('usage-history-screen');
    /* 필터 세그먼트 (제목 아래 1회 삽입) */
    if(scr && !scr.querySelector('.suh-seg')){
      var seg=document.createElement('div'); seg.className='suh-seg';
      seg.innerHTML='<b data-f="all" class="on">전체</b><b data-f="returned">이용완료</b><b data-f="cancelled">취소</b>';
      list.parentNode.insertBefore(seg, list);
      seg.querySelectorAll('b').forEach(function(x){ x.onclick=function(){
        FILTER=x.getAttribute('data-f');
        seg.querySelectorAll('b').forEach(function(y){ y.classList.toggle('on', y===x); });
        render();
      };});
    }
    var all=buildAll();
    window.usageHistoryData=all;   /* openUsageDetail 호환 — 전체 목록 인덱스 유지 */
    var view=all.map(function(it,gi){ return {it:it, gi:gi}; }).filter(function(x){
      if(FILTER==='returned') return x.it.status==='returned';
      if(FILTER==='cancelled') return x.it.status==='cancelled';
      return true;
    });
    if(!view.length){
      list.innerHTML='<div class="empty-reservation"><div class="empty-icon">📋</div><div class="empty-text">'+(FILTER==='all'?'이용 내역이 없습니다':'해당 내역이 없습니다')+'</div></div>';
      return;
    }
    var html='', lastMon='';
    view.forEach(function(x){
      var base=x.it.status==='cancelled'?x.it.r.cancelledAt:x.it.r.start;
      var d=new Date(base), mon=d.getFullYear()+'년 '+(d.getMonth()+1)+'월';
      if(mon!==lastMon){ html+='<div class="suh-mon">'+mon+'</div>'; lastMon=mon; }
      html+=card(x.it, x.gi);
    });
    list.innerHTML=html;
  }
  /* 기존 렌더러 교체 (전역 바인딩 재할당 — script.js 내부 호출에도 적용됨) */
  function hookHist(){
    if(typeof window.renderUsageHistory==='function' && !window.renderUsageHistory.__socar){
      window.renderUsageHistory=render;
      window.renderUsageHistory.__socar=1;
      /* 화면이 이미 열려 있으면 즉시 반영 */
      var scr=document.getElementById('usage-history-screen');
      if(scr && scr.classList.contains('active')) render();
      return true;
    }
    return false;
  }
  if(!hookHist()){ var t=0, iv=setInterval(function(){ if(hookHist()||++t>40) clearInterval(iv); }, 300); }

  /* ── 내정보: 프로필 아래 요약(총 이용·이번 달·멤버십) ── */
  function planName(){ try{ var p=JSON.parse(localStorage.getItem('caro_plan_v1')||'null'); return (p&&(p.name||p.plan))||'미가입'; }catch(e){ return '미가입'; } }
  function mpStats(){
    var prof=document.querySelector('#mypage-screen .mpn-profile'); if(!prof) return;
    var res=(window.myReservations||[]).filter(Boolean);
    var done=res.filter(function(r){ return r.returned; }).length;
    var now=new Date();
    var monCnt=res.filter(function(r){ try{ var d=new Date(r.start); return d.getFullYear()===now.getFullYear()&&d.getMonth()===now.getMonth(); }catch(e){ return false; } }).length;
    var el=document.getElementById('mpn-stats');
    var html='<div class="mpn-stt"><b>'+res.length+'회</b><span>총 이용</span></div>'
      +'<div class="mpn-stt"><b>'+monCnt+'회</b><span>이번 달</span></div>'
      +'<div class="mpn-stt"><b>'+esc(planName())+'</b><span>멤버십</span></div>';
    if(!el){ el=document.createElement('div'); el.id='mpn-stats'; el.className='mpn-stats'; prof.insertAdjacentElement('afterend', el); }
    el.innerHTML=html;
  }
  if(typeof window.goTo==='function' && !window.goTo.__socarMy){
    var _g=window.goTo;
    window.goTo=function(id){ var r=_g.apply(this,arguments); if(id==='mypage-screen') setTimeout(mpStats,60); if(id==='usage-history-screen') setTimeout(render,60); return r; };
    window.goTo.__socarMy=1;
  }
  setTimeout(mpStats, 1500);
  console.log('[디자인] ✅ CARO 이용내역·내정보 v1');
})();


/* ═══════════════════════════════════════════════════════════
   [신규] CARO 아이덴티티 v1 — 타사와 확실히 구분되는 고유 시그니처
   · 비대칭 라운드 카드(22/22/22/8) — CARO 고유 형태
   · 필터: 알약형 → 언더라인 탭 / 진행바: 분절형 → 연속 채움형
   · 주요 버튼: 골드 헤어라인 / 제목: 차콜→골드 언더라인
   · 빈 화면: 이모지 → 와드 마크 / 홈(대기화면)은 변경 없음
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  var st=document.createElement('style'); st.id='caro-identity-v1';
  st.textContent=
    '.suh-card,.my-res-card,.csx-qcard,.awz-opt,.mpn-stt,.hcard{border-radius:22px 22px 22px 8px !important;}'
   +'.csx-faq,.grp{border-radius:22px 22px 22px 8px !important;}'
   +'.csx-hero{border-radius:22px 22px 8px 22px !important;box-shadow:0 10px 24px -12px rgba(0,0,0,.5) !important;}'
   +'.nh-inf-card{border-radius:20px 20px 20px 8px !important;}'
   +'.awz-photo{border-radius:20px 20px 20px 8px;}'
   +'.suh-seg{background:none !important;border-radius:0 !important;padding:0 4px !important;gap:22px;justify-content:flex-start;border-bottom:1.5px solid var(--p1-line,#e8eaee);}'
   +'.suh-seg b{flex:0 0 auto !important;padding:10px 2px 12px !important;border-radius:0 !important;background:none !important;box-shadow:none !important;position:relative;}'
   +'.suh-seg b.on{color:var(--text-1,#1b2027) !important;}'
   +'.suh-seg b.on::after{content:"";position:absolute;left:0;right:0;bottom:-1.5px;height:2.5px;border-radius:2px;background:linear-gradient(90deg,#7a8291,#4a5563);}'
   +'.awz-prog{gap:0 !important;background:var(--p1-line,#e8eaee);border-radius:3px;overflow:hidden;height:5px;}'
   +'.awz-prog i{height:5px !important;border-radius:0 !important;background:transparent !important;}'
   +'.awz-prog i.on{background:linear-gradient(90deg,var(--accent,#18191c) 70%,#3a3320) !important;}'
   +'.suh-btn.dark,.awz-foot .awz-next,.awz-foot .awz-submit,.caro-mr-backbtm,#event-screen .nh-ev-back,'
   +'#usage-history-screen .detail-btn,#my-reservation-screen .detail-btn,#nh-wallet-screen .nh-wallet-back-btm'
   +'{box-shadow:0 8px 20px -8px rgba(24,25,28,.5) !important;}'
   +'.suh-st,.my-res-status{border-radius:6px !important;letter-spacing:.02em;}'
   +'.myres-main-title{position:relative;padding-bottom:13px;}'
   +'.myres-main-title::after{content:"";position:absolute;left:50%;bottom:0;transform:translateX(-50%);width:36px;height:2.5px;border-radius:2px;background:linear-gradient(90deg,#7a8291,#4a5563);}'
   +'.empty-reservation .empty-icon,.csd-empty-icon{font-size:0 !important;width:64px;height:64px;margin:0 auto;'
   +'background:#fff url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%27132 92 248 350%27%3E%3Cpath d=%27M256 396C256 396 360 292 360 208A104 104 0 0 0 152 208C152 292 256 396 256 396Z%27 fill=%27%23aab3bd%27/%3E%3Cpath d=%27M293 171A52 52 0 1 0 293 245%27 fill=%27none%27 stroke=%27%23fff%27 stroke-width=%2730%27 stroke-linecap=%27round%27/%3E%3C/svg%3E") center/30px no-repeat;border:1px solid var(--p1-line,#e8eaee);border-radius:20px 20px 20px 8px;box-shadow:0 2px 10px -7px rgba(40,48,58,.2);opacity:1 !important;filter:none !important;}'
   +'.ctrl-sq-btn{border-radius:16px 16px 16px 6px !important;}'
   +'.cbot-hd{box-shadow:none;}'
   +'.csx-qcard .ic,.awz-opt .awz-oic{border-radius:13px 13px 13px 5px !important;}';
  (document.head||document.documentElement).appendChild(st);
  console.log('[디자인] ✅ CARO 아이덴티티 v1 (고유 시그니처)');
})();



/* ═══════════════════════════════════════════════════════════
   [신규] 홈 리치 콘텐츠 v2 — 중복 제거판
   · 원형·최근 대여 차량 그대로 / 쿠폰 스트립 제거
   · 그리드 4칸(내 예약·거점·월 렌트·이벤트)만 — 나머지는 퀵 줄에서
   · THE BLACK은 대형 배너 하나로만 / 이벤트·멤버십 캐러셀 유지
   · 새 칸: 공지·소식(실공지 연동), 팁(사진·체크리스트·사고 대처)
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function go(id){ try{ if(window.goTo) goTo(id); }catch(e){} }
  function mi(i){ try{ var el=document.querySelector('#home-screen .nh-mi[data-mi="'+i+'"]'); if(el) el.click(); }catch(e){} }
  function use(id){ return '<svg viewBox="0 0 24 24"><use href="#'+id+'"/></svg>'; }
  function esc(x){ return String(x==null?'':x).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  var st=document.createElement('style'); st.id='caro-home-rich';
  st.textContent=
    '#home-screen.screen.active{display:block !important;}'
   +'.hr-grid{margin-top:16px;background:var(--p1-card,#fff);border-radius:22px 22px 22px 8px;padding:22px 8px 18px;display:grid;grid-template-columns:repeat(4,1fr);box-shadow:0 2px 10px -6px rgba(40,48,58,.14);}'
   +'.hr-gi{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;cursor:pointer;}'
   +'.hr-gi:active{transform:scale(.94);}'
   +'.hr-gi .bx{width:50px;height:50px;border-radius:15px 15px 15px 6px;background:var(--p1-soft,#f2f3f5);display:flex;align-items:center;justify-content:center;}'
   +'.hr-gi .bx svg{width:24px;height:24px;stroke:var(--p1-slate,#5a6470);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;}'
   +'.hr-gi span{font-size:.74rem;font-weight:700;color:var(--text-1,#1b2027);}'
   +'.hr-gi .bdg{position:absolute;top:-7px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:.56rem;font-weight:800;padding:2px 7px;border-radius:7px;background:var(--accent,#18191c);color:#fff;}'
   +'.hr-gi .bdg.gd{background:var(--accent,#18191c);color:#fff;}'
   +'.hr-sec{margin-top:22px;}'
   +'.hr-sec h2{font-size:15px;font-weight:800;color:var(--text-1,#1b2027);margin:0 2px 10px;}'
   +'.hr-quick{margin-top:22px;background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:20px 20px 20px 8px;padding:16px 6px;display:grid;grid-template-columns:repeat(4,1fr);box-shadow:0 2px 8px -6px rgba(40,48,58,.14);}'
   +'.hr-qi{display:flex;flex-direction:column;align-items:center;gap:7px;cursor:pointer;}'
   +'.hr-qi svg{width:22px;height:22px;stroke:var(--p1-slate,#5a6470);fill:none;stroke-width:1.75;stroke-linecap:round;stroke-linejoin:round;}'
   +'.hr-qi span{font-size:.7rem;font-weight:700;color:var(--text-1,#1b2027);}'
    /* 공지·소식 */
   +'.hr-news{background:#fff;border:1px solid var(--p1-line,#e8eaee);border-radius:20px 20px 20px 8px;overflow:hidden;box-shadow:0 2px 8px -6px rgba(40,48,58,.14);}'
   +'.hr-nw{display:flex;align-items:center;gap:11px;padding:14px 16px;border-bottom:1px solid var(--p1-soft,#f2f3f5);cursor:pointer;}'
   +'.hr-nw:last-child{border-bottom:0;}'
   +'.hr-nw .tag{flex:0 0 auto;font-size:.62rem;font-weight:800;padding:3px 8px;border-radius:7px;background:var(--p1-soft,#f2f3f5);color:var(--p1-accent-d,#57616d);}'
   +'.hr-nw .tag.ev{background:var(--accent,#18191c);color:#fff;}'
   +'.hr-nw b{flex:1;min-width:0;font-size:.84rem;font-weight:700;color:var(--text-1,#1b2027);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}'
   +'.hr-nw .ar{color:#c8ced6;flex:0 0 auto;}'
    /* 팁 */
   +'.hr-tips{display:flex;gap:10px;overflow-x:auto;-webkit-overflow-scrolling:touch;padding:2px 2px 8px;scrollbar-width:none;}'
   +'.hr-tips::-webkit-scrollbar{display:none;}'
   +'.hr-tip{flex:0 0 auto;width:168px;border-radius:18px 18px 18px 7px;padding:14px;cursor:pointer;background:linear-gradient(150deg,#eef1f4 0%,#dde2e8 100%);border:1px solid rgba(90,100,112,.14);box-shadow:0 4px 14px -9px rgba(40,48,58,.3);}'
   +'.hr-tip .tic{width:34px;height:34px;border-radius:11px 11px 11px 4px;background:rgba(90,100,112,.12);display:flex;align-items:center;justify-content:center;margin-bottom:10px;}'
   +'.hr-tip .tic svg{width:18px;height:18px;stroke:var(--p1-slate,#5a6470);fill:none;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}'
   +'.hr-tip b{font-size:.8rem;font-weight:800;color:var(--text-1,#1b2027);line-height:1.4;display:block;}'
   +'.hr-tip small{font-size:.66rem;font-weight:600;color:#6b727c;margin-top:4px;display:block;}';
  (document.head||document.documentElement).appendChild(st);

  var IC={
    cam:'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.4"/>',
    check:'<path d="M4 12.5 9.5 18 20 6.5"/>',
    shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Z"/><path d="M9.5 12l2 2 3.5-3.8"/>'
  };
  function ico(k){ return '<svg viewBox="0 0 24 24">'+IC[k]+'</svg>'; }

  /* 공지·소식 — 실제 공지(CARO_NOTICES) 상위 2건, 없으면 섹션 숨김 */
  var _newsSig='';
  function newsRefresh(){
    var root=document.querySelector('#home-screen .nh-root'); if(!root) return;
    var sec=root.querySelector('.hr-news-sec');
    var list=(window.CARO_NOTICES||[]).filter(function(n){ return n&&n.id&&n.title; }).slice(0,2);
    if(!list.length){ if(sec) sec.style.display='none'; _newsSig='__empty__'; return; }
    if(!sec) return;   /* 아직 골격 미생성 — enrich에서 생성 */
    /* 내용이 동일하면 DOM 재작성 안 함 → 옵저버 무한루프 방지 */
    var sig=list.map(function(n){ return n.id+'|'+n.title; }).join('§');
    if(sig===_newsSig){ sec.style.display=''; return; }
    _newsSig=sig;
    sec.style.display='';
    var box=sec.querySelector('.hr-news');
    box.innerHTML=list.map(function(n){
      var isEv=(n.type==='이벤트')||/이벤트|할인|혜택/i.test(n.title||'');
      return '<div class="hr-nw" data-nid="'+esc(n.id)+'"><span class="tag'+(isEv?' ev':'')+'">'+(isEv?'이벤트':'공지')+'</span><b>'+esc(n.title)+'</b><span class="ar">›</span></div>';
    }).join('');
    box.querySelectorAll('[data-nid]').forEach(function(el){
      el.addEventListener('click',function(){ try{ if(window.openFsNotice) openFsNotice(el.getAttribute('data-nid')); }catch(e){} });
    });
  }

  var _busy=false, _mo=null;
  function enrich(){
    if(_busy) return; _busy=true;
    try{ if(_mo) _mo.disconnect(); }catch(e){}
    try{ _enrich(); }catch(e){}
    _busy=false;
    try{ if(_mo){ var h=document.getElementById('home-screen'); if(h) _mo.observe(h,{childList:true,subtree:true}); } }catch(e){}
  }
  function _enrich(){
    var home=document.getElementById('home-screen'); if(!home) return;
    var root=home.querySelector('.nh-root'); if(!root) return;
    newsRefresh();
    if(root.querySelector('.hr-grid')) return;
    var menu=root.querySelector('.nh-menu'); if(!menu) return;

    /* 그리드 4칸 — 퀵 줄·배너와 안 겹치는 항목만 */
    var g=document.createElement('div'); g.className='hr-grid';
    g.innerHTML=
      '<div class="hr-gi" data-mi="0"><span class="bx">'+use('nh-car')+'</span><span>내 예약</span></div>'
     +'<div class="hr-gi" data-go="rental-screen"><span class="bx">'+use('nh-pinnav')+'</span><span>예약하기</span></div>'
     +'<div class="hr-gi" data-mi="1"><span class="bdg">월 구독</span><span class="bx">'+use('nh-cal')+'</span><span>월 렌트</span></div>'
     +'<div class="hr-gi" data-mi="2"><span class="bdg gd">혜택</span><span class="bx">'+use('nh-gift')+'</span><span>이벤트</span></div>';
    menu.insertAdjacentElement('beforebegin', g);
    menu.style.display='none';

    /* 퀵 줄 + 공지·소식 + 팁 — 맨 아래 */
    var tail=document.createElement('div');
    tail.innerHTML=
      '<div class="hr-sec hr-news-sec" style="display:none"><h2>공지·소식</h2><div class="hr-news"></div></div>'
      +'<div class="hr-sec"><h2>알아두면 든든한 팁</h2><div class="hr-tips">'
       +'<div class="hr-tip" data-mi="3"><span class="tic">'+ico('cam')+'</span><b>주행 전 10분,<br>외관 사진 필수</b><small>분쟁 예방의 첫걸음</small></div>'
       +'<div class="hr-tip" data-mi="3"><span class="tic">'+ico('check')+'</span><b>반납 전<br>체크리스트</b><small>두고 내린 물건 확인</small></div>'
       +'<div class="hr-tip" data-go="cs-screen"><span class="tic">'+ico('shield')+'</span><b>사고가 났다면<br>침착하게</b><small>단계별 사고 접수</small></div>'
      +'</div></div>'
      /* ★ 동그라미 친 퀵메뉴(고객센터/이용내역/결제·면허/이용 가이드) → 맨 아래로 이동 */
      +'<div class="hr-quick">'
       +'<div class="hr-qi" data-mi="5">'+use('nh-head')+'<span>고객센터</span></div>'
       +'<div class="hr-qi" data-go="usage-history-screen">'+use('nh-listnav')+'<span>이용내역</span></div>'
       +'<div class="hr-qi" data-mi="4">'+use('nh-wallet')+'<span>결제·면허</span></div>'
       +'<div class="hr-qi" data-mi="3">'+use('nh-book')+'<span>이용 가이드</span></div>'
      +'</div>'
      /* ★ 하단 플로팅 '차량 제어' 바·탭바가 버튼을 안 가리도록 여백 */
      +'<div class="hr-botspace" style="height:44px"></div>';
    while(tail.firstChild){ root.appendChild(tail.firstChild); }

    root.querySelectorAll('.hr-grid [data-go],.hr-quick [data-go],.hr-tips [data-go]').forEach(function(el){ el.addEventListener('click',function(){ go(el.getAttribute('data-go')); }); });
    root.querySelectorAll('.hr-grid [data-mi],.hr-quick [data-mi],.hr-tips [data-mi]').forEach(function(el){ el.addEventListener('click',function(){ mi(el.getAttribute('data-mi')); }); });
    _newsSig='';   /* 골격 새로 만들었으니 공지 박스 강제 재작성 */
    newsRefresh();
    /* 골격 재생성과 동시에 '이용 준비' 카드도 같은 틱에 복구 → 깜빡임 제거 */
    try{ if(window.__caroRR) window.__caroRR(); }catch(e){}
  }

  window.__caroEnrich=function(){ try{ enrich(); }catch(e){} };   /* render 직후 동기 호출용 — 그리드 늦게 끼워져 더블랙이 밀리는 것 방지 */
  var home=document.getElementById('home-screen');
  if(home && window.MutationObserver){ _mo=new MutationObserver(function(){ enrich(); }); _mo.observe(home,{childList:true,subtree:true}); }
  try{ enrich(); }catch(e){}   /* ★ 이 모듈 로드 즉시 1회 — 이미 렌더된 홈이면 같은 프레임에 그리드 채워 더블랙 밀림 방지 */
  [400,1200,2600,4500,8000].forEach(function(t){ setTimeout(function(){ try{ enrich(); }catch(e){} }, t); });
  console.log('[디자인] ✅ 홈 리치 콘텐츠 v2 (중복 제거)');
})();

/* ═══════════════════════════════════════════════════════════
   [신규] 프로 완성도 패치 v1 — 카셰어링 전문 서비스 보강
   1) 네트워크 상태 감시: 오프라인 배너 + 재연결 안내
      (비대면 서비스 특성상 차량 제어·예약이 네트워크 의존 → 필수)
   2) 빈 화면 CTA: 예약 확인·이용 내역이 막다른 길이 되지 않게
   3) 이용 준비 안내 카드: 면허·결제 카드 미등록 시 홈에서 안내
   ※ 디자인은 기존 CARO 언어(실버·차콜·골드 헤어라인) 그대로
═══════════════════════════════════════════════════════════ */
(function(){ 'use strict';
  function toast(m){ try{ if(window.showToast) showToast(m); }catch(e){} }
  function go(id){ try{ if(window.goTo) goTo(id); }catch(e){} }

  var st=document.createElement('style'); st.id='caro-pro-v1';
  st.textContent=
    /* 1) 오프라인 배너 */
    '.caro-off-bar{position:fixed;top:0;left:0;right:0;z-index:99990;display:flex;align-items:center;justify-content:center;gap:8px;'
     +'padding:calc(env(safe-area-inset-top,0px) + 9px) 16px 9px;background:var(--accent,#18191c);color:#fff;'
     +'font-size:.78rem;font-weight:700;letter-spacing:-.01em;box-shadow:0 6px 18px -8px rgba(24,25,28,.5);'
     +'transform:translateY(-110%);transition:transform .35s cubic-bezier(.2,.8,.25,1);}'
   +'.caro-off-bar.on{transform:translateY(0);}'
   +'.caro-off-bar svg{width:15px;height:15px;stroke:#c8a96e;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}'
    /* 2) 빈 화면 CTA */
   +'.caro-empty-cta{display:inline-flex;align-items:center;gap:7px;margin-top:18px;height:46px;padding:0 24px;border:0;cursor:pointer;'
     +'background:var(--accent,#18191c);color:#fff;border-radius:14px 14px 14px 6px;font-family:inherit;font-size:.86rem;font-weight:800;'
     +'box-shadow:0 8px 20px -9px rgba(24,25,28,.5);}'
   +'.caro-empty-cta:active{transform:scale(.96);}'
    /* 3) 이용 준비 카드 */
   +'.hr-ready{margin-top:16px;background:var(--p1-card,#fff);border:1px solid var(--p1-line,#e8eaee);border-radius:20px 20px 20px 8px;'
     +'padding:16px 16px 8px;box-shadow:0 2px 10px -6px rgba(40,48,58,.14);}'
   +'.hr-ready h3{margin:0 0 4px;font-size:.92rem;font-weight:800;color:var(--text-1,#1b2027);}'
   +'.hr-ready p{margin:0 0 10px;font-size:.72rem;font-weight:600;color:#8a919c;}'
   +'.hr-rd{display:flex;align-items:center;gap:10px;padding:11px 2px;border-top:1px solid var(--p1-soft,#f2f3f5);cursor:pointer;}'
   +'.hr-rd .dot{flex:0 0 auto;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;}'
   +'.hr-rd.todo .dot{background:rgba(90,100,112,.14);}'
   +'.hr-rd.todo .dot::after{content:"";width:7px;height:7px;border-radius:50%;background:var(--p1-slate,#5a6470);}'
   +'.hr-rd.done .dot{background:var(--p1-soft,#f2f3f5);}'
   +'.hr-rd.done .dot svg{width:12px;height:12px;stroke:var(--p1-slate,#5a6470);fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;}'
   +'.hr-rd b{flex:1;font-size:.82rem;font-weight:700;color:var(--text-1,#1b2027);}'
   +'.hr-rd.done b{color:#9aa1ab;text-decoration:line-through;text-decoration-color:rgba(154,161,171,.5);}'
   +'.hr-rd .st{flex:0 0 auto;font-size:.68rem;font-weight:800;}'
   +'.hr-rd.todo .st{color:var(--p1-slate,#5a6470);}'
   +'.hr-rd.done .st{color:#aab0b8;}'
    /* 4) 예약 화면 취소 수수료 요약 */
   +'.res-cancel-note{margin:12px 0 14px;background:var(--p1-card,#fff);border:1px solid var(--p1-line,#e8eaee);border-radius:16px 16px 16px 7px;overflow:hidden;box-shadow:0 2px 8px -6px rgba(40,48,58,.12);}'
   +'.res-cancel-note .rcn-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 15px;cursor:pointer;font-size:.78rem;font-weight:600;color:var(--text-1,#1b2027);}'
   +'.res-cancel-note .rcn-head b{font-weight:800;color:var(--text-1,#1b2027);box-shadow:inset 0 -6px 0 rgba(174,182,194,.22);}'
   +'.res-cancel-note .rcn-arrow{flex:0 0 auto;color:#9aa1ab;font-size:.8rem;transition:transform .25s;}'
   +'.res-cancel-note .rcn-body{padding:2px 15px 13px;border-top:1px solid var(--p1-soft,#f2f3f5);}'
   +'.res-cancel-note .rcn-row{display:flex;align-items:center;justify-content:space-between;padding:8px 0;font-size:.76rem;color:var(--text-2,#4a505a);border-bottom:1px solid var(--p1-soft,#f2f3f5);}'
   +'.res-cancel-note .rcn-row:last-of-type{border-bottom:0;}'
   +'.res-cancel-note .rcn-row b.ok{color:#1d7a3a;font-weight:800;}'
   +'.res-cancel-note .rcn-row b.mid{color:#9a6a00;font-weight:800;}'
   +'.res-cancel-note .rcn-row b.no{color:#b23a3a;font-weight:800;}'
   +'.res-cancel-note .rcn-small{margin-top:9px;font-size:.66rem;line-height:1.55;color:#8a919c;}';
  (document.head||document.documentElement).appendChild(st);

  /* ───── 1) 네트워크 상태 감시 ───── */
  var bar=document.createElement('div'); bar.className='caro-off-bar';
  bar.innerHTML='<svg viewBox="0 0 24 24"><path d="M2 8.5a15 15 0 0 1 5.2-3M9.3 12a9 9 0 0 1 2-1.3M12 16.6h.01M16.9 5.6A15 15 0 0 1 22 8.5M14.8 10.7a9 9 0 0 1 3.5 2.6M3 3l18 18"/></svg>'
    +'<span>오프라인 상태예요 — 차량 제어·예약이 지연될 수 있어요</span>';
  function mountBar(){ if(document.body&&!bar.parentNode) document.body.appendChild(bar); }
  if(document.body) mountBar(); else document.addEventListener('DOMContentLoaded',mountBar);
  var wasOff=false;
  function setNet(on){
    mountBar();
    if(!on){ bar.classList.add('on'); wasOff=true; }
    else{
      bar.classList.remove('on');
      if(wasOff){ wasOff=false; toast('네트워크가 다시 연결되었어요'); }
    }
  }
  window.addEventListener('online',function(){ setNet(true); });
  window.addEventListener('offline',function(){ setNet(false); });
  try{ if(navigator.onLine===false) setNet(false); }catch(e){}

  /* ───── 2) 빈 화면 CTA ───── */
  function addCta(listId, txt){
    var list=document.getElementById(listId); if(!list) return;
    var empty=list.querySelector('.empty-reservation'); if(!empty) return;
    if(empty.querySelector('.caro-empty-cta')) return;
    var et=empty.querySelector('.empty-text');
    if(et && /해당 내역/.test(et.textContent||'')) return; /* 필터 결과 없음엔 CTA 생략 */
    var btn=document.createElement('button'); btn.className='caro-empty-cta';
    btn.innerHTML=txt+' <span style="opacity:.75">→</span>';
    btn.addEventListener('click',function(){ go('rental-screen'); });
    empty.appendChild(btn);
  }
  function watchEmpty(listId, txt){
    var list=document.getElementById(listId); if(!list) return;
    addCta(listId, txt);
    new MutationObserver(function(){ addCta(listId, txt); }).observe(list,{childList:true});
  }
  function bootCta(){
    watchEmpty('my-reservation-list','차량 예약하러 가기');
    watchEmpty('usage-history-list','첫 이용 시작하기');
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bootCta); else bootCta();

  /* ───── 3) 이용 준비 안내 카드 (홈) ───── */
  var IC_CHECK='<svg viewBox="0 0 24 24"><path d="M4.5 12.5 9.5 17.5 19.5 6.5"/></svg>';
  var _rdSig='';
  /* 카드 등록 여부 — 두 저장소(savedCards / APD caro_apd_cards) 모두 확인 */
  function hasCard(){
    try{ if(window.savedCards&&window.savedCards.length) return true; }catch(e){}
    try{ var a=JSON.parse(localStorage.getItem('caro_apd_cards')||'[]'); if(a&&a.length) return true; }catch(e){}
    return false;
  }
  function readyState(){
    var logged=!!window._caroLoggedIn;
    var lic=!!(window.userInfo&&window.userInfo.license&&String(window.userInfo.license).trim());
    var card=hasCard();
    return {logged:logged,lic:lic,card:card,sig:logged+'|'+lic+'|'+card};
  }
  function row(cls,label,done){
    return '<div class="hr-rd '+(done?'done':'todo')+'" data-rd="'+cls+'">'
      +'<span class="dot">'+(done?IC_CHECK:'')+'</span><b>'+label+'</b>'
      +'<span class="st">'+(done?'완료':'등록 필요')+'</span></div>';
  }
  /* 계정 데이터 로드 완료 신호: userInfo·savedCards 는 초기부터 빈 값으로 존재하므로
     userInfo.id 가 채워졌는지(=로그인+계정데이터 로드 완료)로 판단 → 로딩 중 순간 표시 방지 */
  function acctLoaded(){ return !!(window.userInfo && window.userInfo.id); }
  /* 카드·면허가 서버에서 복원 완료됐는지 — 복원 전엔 '미등록'으로 잘못 떠서 더블랙을 밀어내는 것 방지.
     복원 완료 플래그(_caroProfileLoaded) 또는 로그인 후 2.8초 경과 시 판단 시작 */
  function profileReady(){
    if(!window._caroLoggedIn) return true;
    if(window._caroProfileLoaded) return true;
    var lt=window._caroLoginT||0;
    return !!(lt && (Date.now()-lt > 2800));
  }
  function dataReady(logged){
    if(!logged) return true;
    return acctLoaded() && profileReady();
  }
  var _rdTimer=null;
  /* 실제 DOM 반영 — 상태(s)에 맞춰 카드 추가/갱신/제거 */
  function applyReady(s){
    var root=document.querySelector('#home-screen .nh-root');
    var grid=root?root.querySelector('.hr-grid'):null;
    var card=root?root.querySelector('.hr-ready'):null;
    /* 조건 미충족(비로그인·둘 다 완료·골격 없음) → 카드 제거 */
    if(!root||!grid||!s.logged||(s.lic&&s.card)){
      if(card) card.remove();
      _rdSig=s.sig; return;
    }
    if(card && _rdSig===s.sig) return;   /* 이미 동일 내용 → 재작성 안 함 */
    if(!card){ card=document.createElement('div'); card.className='hr-ready'; grid.insertAdjacentElement('afterend',card); }
    _rdSig=s.sig;
    var both=(!s.lic&&!s.card);   /* 둘 다 미등록 → 예약 차단 안내 */
    card.innerHTML='<h3>이용 준비, 조금만 더</h3><p>'
      +(both?'운전면허와 결제 카드를 등록해야 차량을 예약할 수 있어요':'등록을 마치면 바로 차량을 이용할 수 있어요')+'</p>'
      +row('lic','운전면허 등록',s.lic)
      +row('card','결제 카드 등록',s.card);
    card.querySelectorAll('.hr-rd.todo').forEach(function(el){
      el.addEventListener('click',function(){ go('payment-info-screen'); });
    });
  }
  function renderReady(){
    var s=readyState();
    /* 계정 로드 전엔 아무 것도 하지 않음 → '사라졌다 나왔다' 방지 */
    if(!dataReady(s.logged)) return;
    /* 이미 반영된 상태와 동일 → 즉시 처리(골격이 다시 그려져 카드가 지워졌으면 곧바로 복구) */
    if(s.sig===_rdSig){ applyReady(s); return; }
    /* 상태가 바뀜(로딩 완료·등록 변화) → 550ms 디바운스: 로딩 중 잠깐 스치는 값은 무시 */
    clearTimeout(_rdTimer);
    _rdTimer=setTimeout(function(){ try{ var s2=readyState(); if(dataReady(s2.logged)) applyReady(s2); }catch(e){} }, 550);
  }
  /* 홈 골격(nh-root)이 다시 그려질 때 grid 와 같은 틱(enrich)에서 카드도 복구 → 공백 없이 깜빡임 제거.
     별도 subtree 옵저버는 제거(배너 회전마다 돌아 렉 유발) — enrich 호출 + 완만한 인터벌만 사용. */
  window.__caroRR=function(){ try{ renderReady(); }catch(e){} };
  setInterval(function(){ try{ renderReady(); }catch(e){} }, 2500);
  [500,1200,2400,4000].forEach(function(t){ setTimeout(function(){ try{ renderReady(); }catch(e){} }, t); });

  /* ───── 차량 예약 차단: 운전면허·결제 카드 둘 다 미등록 시 예약 진입 차단 ───── */
  function bothMissing(){
    var s=readyState();
    return s.logged && acctLoaded() && profileReady() && !s.lic && !s.card;  /* 계정·프로필(카드/면허) 복원 후에만 차단 판단 */
  }
  function blockReserve(){
    try{ if(window.showToast) showToast('운전면허와 결제 카드를 먼저 등록해 주세요.'); }catch(e){}
    try{ if(window.goTo) goTo('payment-info-screen'); }catch(e){}
  }
  function wrapReserve(name){
    var orig=window[name];
    if(typeof orig!=='function'||orig.__caroGuarded) return;
    var wrapped=function(){ if(bothMissing()){ blockReserve(); return; } return orig.apply(this,arguments); };
    wrapped.__caroGuarded=true;
    window[name]=wrapped;
  }
  function installReserveGuards(){ ['selectCar','selectBlCar'].forEach(wrapReserve); }
  installReserveGuards();
  [600,1500,3000].forEach(function(t){ setTimeout(installReserveGuards,t); });

  console.log('[프로] ✅ 완성도 패치 v1 (네트워크·빈화면 CTA·이용 준비 카드·예약 차단)');
})();

/* ═══════════════════════════════════════════════════════════
   [권한분리] 앱 관리자 모드 = 운영 관리. 실시간 관제(지도)는 웹 대시보드.
   · 운영(ops) 권한  → 운영 섹션(차량·요금·예약·공지 등) 표시
   · 관제(control)   → 상단에 '🛰 실시간 관제센터 열기' 버튼 표시 → admin-control.html 로 이동
   · 최고관리자      → 둘 다
   caroCan()이 지금까지 어디에도 안 쓰여서 모두에게 전부 보이던 문제를 여기서 실제로 적용.
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  function can(p){ try{ return !!(window.caroCan && window.caroCan(p)); }catch(e){ return false; } }
  function ensureCtrlEntry(show){
    var body=document.querySelector('#dev-screen .dev-body');
    var sec=document.getElementById('caro-ctrl-entry');
    if(!show){ if(sec) sec.style.display='none'; return; }
    if(!body) return;
    if(!sec){
      sec=document.createElement('div'); sec.className='dev-section'; sec.id='caro-ctrl-entry';
      sec.innerHTML='<div class="dev-section-title">실시간 관제</div>'
        +'<div class="dev-card">'
        +'<button class="dev-btn dev-full-btn" id="caro-ctrl-open" '
        +'style="background:rgba(174,182,194,.14);border:1px solid rgba(174,182,194,.42);color:#cfd5dd;font-weight:800;">'
        +'🛰 실시간 관제센터 열기 (지도·원격제어)</button>'
        +'<div style="font-size:.7rem;color:#8a8f98;margin-top:8px;line-height:1.5;">'
        +'차량 실시간 위치·경로 추적, 원격 잠금/해제, 층·기기 진단</div></div>';
      body.insertBefore(sec, body.firstChild);   // 맨 위에
      var ob=document.getElementById('caro-ctrl-open');
      if(ob) ob.onclick=function(){ try{ location.href='admin-control.html'; }catch(e){} };
    }
    sec.style.display='';
  }
  function apply(){
    if(!document.getElementById('dev-screen')) return;
    /* ★ 진단용 버전 도장: 이 최신 파일이 실제로 로딩되면 관리자 콘솔 부제에 'BUILD 168'이 찍힘.
       안 찍히면 = 앱이 아직 옛 파일 캐시 사용 중(코드 문제 아님·캐시 문제). */
    try{ var _sub=document.querySelector('#dev-screen .dev-sub');
      if(_sub && _sub.textContent.indexOf('BUILD 168')<0){ _sub.textContent='관리자 콘솔 · FLEET CONTROL · BUILD 168'; } }catch(e){}
    var canOps=can('ops'), canControl=can('control');
    var secs=document.querySelectorAll('#dev-screen .dev-body > .dev-section');
    for(var i=0;i<secs.length;i++){
      var s=secs[i];
      if(s.id==='caro-ctrl-entry') continue;               // 내가 만든 관제 버튼은 별도 처리
      var t=((s.querySelector('.dev-section-title')||{}).textContent)||'';
      if(/권한|버전/.test(t)){ s.style.display="none"; continue; }                    // 버전·권한 섹션은 유지(직원관리는 내부에서 최고관리자만)
      s.style.display = canOps ? '' : 'none';               // 운영 섹션: ops 권한 있을 때만
    }
    ensureCtrlEntry(canControl);                            // 관제 버튼: control 권한 있을 때만
  }
  window.__caroApplyDevPerms=apply;
  var _r=window.renderDevScreen;
  window.renderDevScreen=function(){ try{ if(_r) _r.apply(this,arguments); }catch(e){} setTimeout(apply,60); };
  /* dev-screen 진입·권한 로드 지연 대비 재적용 */
  [400,1200,2500,4000].forEach(function(t){ setTimeout(apply,t); });
  var _tries=0, _iv=setInterval(function(){ _tries++; if(_tries>30){ clearInterval(_iv); return; }
    if(document.getElementById('dev-screen')) apply(); }, 900);
  console.log('[앱권한] ✅ 관리자 모드 관제/운영 분리 적용 (ops=운영섹션 / control=관제버튼)');
})();

/* ═══════════════════════════════════════════════════════════
   [CARO v4] 안드로이드 하드웨어 뒤로가기 처리
   · window.caroBack() 을 MainActivity가 호출:
     - true  반환 → 웹에서 처리(화면 뒤로/오버레이 닫기)
     - false 반환 → 앱 종료 대상(홈에서 두 번 누르면 종료)
   ─────────────────────────────────────────────────────────── */
(function(){ 'use strict';
  window.caroBack = function(){
    try{
      // 1) 열린 모달 오버레이 닫기
      var mod = document.querySelector('.modal-overlay.active, .modal-overlay.show, .modal-overlay.open');
      if(mod){ var mc = mod.querySelector('.modal-close'); if(mc){ mc.click(); return true; } mod.classList.remove('active','show','open'); return true; }
      // 2) 화면에 보이는 인앱 뒤로가기 버튼이 있으면 그걸로 처리 (지갑/월렌트/이벤트/알림 등)
      var sel = ['.nh-wallet-back-btm','.caro-mr-backbtm','.nh-ev-back','.cnf-close','.caro-notif-close'];
      for(var i=0;i<sel.length;i++){
        var b = document.querySelector(sel[i]);
        if(b && b.offsetParent!==null){ b.click(); return true; }
      }
      // 3) 현재 보이는 .screen 판별 — 홈이 아니면 홈으로
      var active=null;
      document.querySelectorAll('.screen').forEach(function(s){
        try{ var cs=getComputedStyle(s); if(cs.display!=='none' && s.getBoundingClientRect().width>0 && s.getBoundingClientRect().height>0) active=s; }catch(e){}
      });
      if(active && active.id && active.id!=='home-screen' && active.id!=='main-screen'){
        if(window.goTo) goTo('home-screen'); else if(window.go) go('home-screen');
        return true;
      }
      // 4) 홈(또는 로그인) → 앱이 종료 처리하도록 false
      return false;
    }catch(e){ return false; }
  };
  console.log('[CARO v4] ✅ caroBack (하드웨어 뒤로가기 핸들러) 준비');
})();
