/* ═══════════════════════════════════════════════════════════════
   caro-photo.js — ★v1 주행 전 차량 촬영 (한 화면 · 4방향 순서대로)
   ───────────────────────────────────────────────────────────────
   예전 : 아래에서 올라오는 창에 '전면/후면/좌측/우측/기타' 목록 → 하나씩 들어가 찍기
   지금 : 전체 화면 한 장
          · 위에서 내려다본 차 그림 + 앞/뒤/왼쪽/오른쪽 표시 (찍은 곳은 체크)
          · 4칸 사진판 : 찍은 사진이 바로 보이고, 누르면 다시 보기·지우기·더 찍기
          · 아래 큰 버튼 하나 : 다음에 찍을 방향을 알려 주고 바로 카메라
          · [촬영 완료] 는 언제든 누를 수 있다 — 몇 방향을 찍을지는 고객 마음 (다 찍으면 큰 버튼이 '촬영 완료 · 사진 등록')
   그대로 쓰는 것 : 사진 보관(pcarPhotos) · 카메라(openCaroCamera / 앱 카메라) ·
                  등록(finishPhotoCapture → 서버 저장 · 잠금화면 카드) · 대여 시작 10분 뒤 촬영 마감
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroPhoto) return; window.__caroPhoto = true;

  var SIDES = ['front','rear','left','right'];
  var INFO = {
    front:{ n:'앞쪽',   d:'번호판과 범퍼가 보이게' },
    rear: { n:'뒤쪽',   d:'번호판과 트렁크가 보이게' },
    left: { n:'왼쪽',   d:'운전석 쪽 · 문 두 짝이 다 보이게' },
    right:{ n:'오른쪽', d:'조수석 쪽 · 문 두 짝이 다 보이게' },
    misc: { n:'흠집·파손', d:'이미 있던 흠집은 가까이 한 장 더' }
  };
  var LOCK_MIN = 10, guided = false, lastBook = null, ov = null;

  function P(){ return window.pcarPhotos || {}; }
  function n(s){ return (P()[s] || []).length; }
  function doneCount(){ return SIDES.filter(function(s){ return n(s) > 0; }).length; }
  function nextSide(){ for(var i=0;i<SIDES.length;i++){ if(!n(SIDES[i])) return SIDES[i]; } return null; }
  function tms(x){ if(!x) return NaN; return (x instanceof Date) ? x.getTime() : (x.toDate ? x.toDate().getTime() : new Date(x).getTime()); }
  function res(){
    try{
      var rs = window.myReservations || [];
      if(window.ctrlResIdx >= 0 && rs[window.ctrlResIdx]) return rs[window.ctrlResIdx];
      /* 제어 화면 밖에서 열었으면 지금 이용 중(또는 10분 안에 시작)인 예약 */
      var now = Date.now();
      for(var i = 0; i < rs.length; i++){ var r = rs[i]; if(r && !r.returned && r.status !== 'cancelled' && now >= tms(r.start) - 10*60000 && now <= tms(r.end)) return r; }
    }catch(e){}
    return null;
  }
  /* ★ 한 번 [촬영 완료] 를 누르면 그 예약(그 차)은 다시 찍을 수 없다 — 이 휴대폰 기록 + 서버에 사진이 올라가 있으면 */
  var DKEY = 'caro_photo_done';
  function keyOf(r){ if(!r) return ''; var c = r.car || {}; return String(r.bookNo || '') + '|' + String(c.id != null ? c.id : (r.carId || '')); }
  function doneMap(){ try{ return JSON.parse(localStorage.getItem(DKEY) || '{}') || {}; }catch(e){ return {}; } }
  function markDone(){
    var k = keyOf(res()); if(!k || k === '|') return;
    try{ var m = doneMap(), now = Date.now(); Object.keys(m).forEach(function(x){ if(now - Number(m[x]) > 7*86400000) delete m[x]; }); m[k] = now; localStorage.setItem(DKEY, JSON.stringify(m)); }catch(e){}
  }
  function isDone(){ var r = res(); if(!r) return false; return !!doneMap()[keyOf(r)] || Number(r.photoCount) > 0; }
  function blocked(){ return locked() || isDone(); }
  function blockMsg(){ toast(isDone() ? '주행 전 사진은 이미 등록했어요 · 다시 찍을 수 없습니다.' : '주행전 사진 촬영이 마감되었습니다.'); }
  function locked(){
    var r = res(); if(!r) return false; if(r.returned) return true; if(!r.start) return false;
    var s = (r.start instanceof Date) ? r.start : (r.start && r.start.toDate ? r.start.toDate() : new Date(r.start));
    return !isNaN(s) && Date.now() - s.getTime() > LOCK_MIN * 60000;
  }
  function toast(m){ try{ if(window.showToast) showToast(m); }catch(e){} }

  /* ── 선 아이콘 ── */
  var IC = {
    x:'<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    cam:'<svg viewBox="0 0 24 24"><path d="M4 8.5h3l1.6-2.5h6.8L17 8.5h3v10H4z"/><circle cx="12" cy="13.2" r="3.4"/></svg>',
    ok:'<svg viewBox="0 0 24 24"><path d="M5 12.5l4.2 4.2L19 7"/></svg>',
    plus:'<svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg>',
    shield:'<svg viewBox="0 0 24 24"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>',
    lock:'<svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'
  };
  /* 위에서 내려다본 차 (앞이 위) */
  var CAR = '<svg class="cph-car" viewBox="0 0 120 200" aria-hidden="true">'
    + '<rect x="22" y="14" width="76" height="172" rx="30" class="b"/>'
    + '<path d="M32 62 Q60 50 88 62 L84 84 Q60 78 36 84 Z" class="g"/>'
    + '<path d="M36 140 Q60 146 84 140 L88 156 Q60 166 32 156 Z" class="g"/>'
    + '<rect x="37" y="88" width="46" height="48" rx="8" class="r"/>'
    + '<rect x="13" y="44" width="9" height="26" rx="4" class="w"/><rect x="98" y="44" width="9" height="26" rx="4" class="w"/>'
    + '<rect x="13" y="132" width="9" height="26" rx="4" class="w"/><rect x="98" y="132" width="9" height="26" rx="4" class="w"/>'
    + '<path d="M36 22 h48" class="l"/><path d="M36 178 h48" class="l"/>'
    + '</svg>';

  function css(){
    if(document.getElementById('cph-css')) return;
    var s = document.createElement('style'); s.id = 'cph-css';
    s.textContent = [
      /* 예전 아래 창은 안 보이게만 (잠금 계산 · 다른 스크립트 호환 때문에 그대로 둔다) */
      '#photo-modal-overlay{visibility:hidden!important;pointer-events:none!important;}',
      '#cph{position:fixed;inset:0;z-index:1015;background:#eef0f3;display:flex;flex-direction:column;transform:translateY(100%);transition:transform .32s cubic-bezier(.22,1,.36,1);visibility:hidden;font-family:var(--font,"Pretendard",sans-serif);color:#18191c;}',
      '#cph.open{transform:none;visibility:visible;}',
      '#cph svg{fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}',
      '#cph .hd{display:flex;align-items:center;gap:6px;padding:calc(10px + var(--sat,0px)) 10px 8px;}',
      '#cph .hd h1{flex:1;margin:0;font-size:17px;font-weight:800;letter-spacing:-.2px;text-align:center;padding-right:44px;}',
      '#cph .ib{width:44px;height:44px;border:0;background:transparent;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#18191c;cursor:pointer;}',
      '#cph .ib svg{width:22px;height:22px;}',
      '#cph .bd{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px 20px;}',
      '#cph .note{display:flex;gap:10px;align-items:flex-start;background:#fff;border:1px solid #e3e6ea;border-radius:14px;padding:12px 13px;font-size:13px;line-height:1.5;color:#4b525c;}',
      '#cph .note svg{width:20px;height:20px;flex:0 0 auto;color:#18191c;margin-top:1px;}',
      '#cph .note b{color:#18191c;}',
      '#cph .note.lk{background:#fbf1f0;border-color:#f0d2cf;color:#8a3a36;} #cph .note.lk svg{color:#b0413f;}',
      /* 차 그림 + 네 방향 */
      '#cph .map{position:relative;height:280px;margin:12px 0 4px;}',
      '#cph .cph-car{position:absolute;left:50%;top:50%;width:92px;height:154px;transform:translate(-50%,-50%);}',
      '#cph .cph-car .b{fill:#fff;stroke:#b9c0c9;stroke-width:1.6;} #cph .cph-car .g{fill:#e7eaee;stroke:#b9c0c9;stroke-width:1.4;}',
      '#cph .cph-car .r{fill:#f4f5f7;stroke:#d3d8de;stroke-width:1.2;} #cph .cph-car .w{fill:#5a6470;stroke:none;} #cph .cph-car .l{stroke:#d3d8de;stroke-width:1.4;}',
      '#cph .pin{position:absolute;display:flex;flex-direction:column;align-items:center;gap:4px;border:0;background:transparent;cursor:pointer;font-family:inherit;padding:0;}',
      '#cph .pin i{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:14px;font-weight:800;background:#fff;color:#18191c;border:1.5px solid #c9cfd6;box-shadow:0 2px 6px rgba(20,22,28,.08);transition:all .2s;}',
      '#cph .pin i svg{width:18px;height:18px;stroke-width:2.4;}',
      '#cph .pin span{font-size:12px;font-weight:700;color:#5a6470;}',
      '#cph .pin.on i{background:#18191c;border-color:#18191c;color:#fff;transform:scale(1.08);box-shadow:0 0 0 6px rgba(24,25,28,.1);}',
      '#cph .pin.ok i{background:#2c7a52;border-color:#2c7a52;color:#fff;}',
      '#cph .pin.f{left:50%;top:0;transform:translateX(-50%);flex-direction:column-reverse;} #cph .pin.r{left:50%;bottom:0;transform:translateX(-50%);}',
      '#cph .pin.lf{left:calc(50% - 120px);top:50%;transform:translateY(-50%);} #cph .pin.rt{right:calc(50% - 120px);top:50%;transform:translateY(-50%);}',
      '#cph .prog{display:flex;align-items:center;gap:10px;margin:6px 2px 12px;font-size:13px;color:#5a6470;font-weight:600;}',
      '#cph .prog .bar{flex:1;height:4px;border-radius:2px;background:#dde1e6;overflow:hidden;} #cph .prog .bar u{display:block;height:100%;background:#18191c;border-radius:2px;transition:width .3s;}',
      '#cph .prog b{color:#18191c;}',
      /* 사진판 */
      '#cph .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}',
      '#cph .tile{position:relative;aspect-ratio:4/3;border-radius:14px;overflow:hidden;border:1.5px dashed #c3c9d1;background:#f7f8fa;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:8px;text-align:center;font-family:inherit;color:#18191c;}',
      '#cph .tile svg{width:24px;height:24px;color:#8b929d;}',
      '#cph .tile .t{font-size:14px;font-weight:800;} #cph .tile .s{font-size:11px;color:#8b929d;line-height:1.35;}',
      '#cph .tile.on{border:2px solid #18191c;background:#fff;} #cph .tile.on svg{color:#18191c;}',
      '#cph .tile.has{border:0;padding:0;background:#000;}',
      '#cph .tile.has img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;}',
      '#cph .tile.has .cap{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:space-between;padding:18px 10px 8px;background:linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,.62));color:#fff;font-size:13px;font-weight:800;}',
      '#cph .tile.has .cap em{font-style:normal;font-size:11px;font-weight:700;background:rgba(255,255,255,.22);border-radius:10px;padding:2px 7px;}',
      '#cph .tile.has .ck{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:50%;background:#2c7a52;display:flex;align-items:center;justify-content:center;}',
      '#cph .tile.has .ck svg{width:14px;height:14px;color:#fff;stroke-width:2.6;}',
      '#cph .misc{margin-top:10px;width:100%;display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e3e6ea;border-radius:14px;padding:12px 14px;cursor:pointer;font-family:inherit;text-align:left;color:#18191c;}',
      '#cph .misc .mi{width:40px;height:40px;border-radius:10px;background:#eef0f3;display:flex;align-items:center;justify-content:center;overflow:hidden;flex:0 0 auto;}',
      '#cph .misc .mi svg{width:20px;height:20px;} #cph .misc .mi img{width:100%;height:100%;object-fit:cover;}',
      '#cph .misc .tx{flex:1;} #cph .misc .tx b{display:block;font-size:14px;} #cph .misc .tx span{font-size:12px;color:#8b929d;}',
      '#cph .misc .ct{font-size:12px;font-weight:700;color:#5a6470;}',
      '#cph .tips{margin:14px 2px 0;font-size:12px;color:#8b929d;line-height:1.7;}',
      '#cph .ft{padding:10px 16px calc(12px + var(--sab,0px));background:#eef0f3;border-top:1px solid #e1e4e8;}',
      '#cph .go{width:100%;height:54px;border:0;border-radius:14px;background:#18191c;color:#fff;font-family:inherit;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}',
      '#cph .go svg{width:20px;height:20px;} #cph .go:disabled{background:#c3c9d1;color:#f4f5f7;cursor:default;}',
      '#cph .go.fin{background:linear-gradient(135deg,#20232b,#14151a);}',
      '#cph .sub{display:block;text-align:center;margin-top:8px;font-size:12px;color:#8b929d;}',
      '#cph .row{display:flex;gap:8px;} #cph .row .go{flex:1.4;}',
      '#cph .done{flex:1;height:54px;border:1.5px solid #c9cfd6;border-radius:14px;background:#fff;color:#18191c;font-family:inherit;font-size:15px;font-weight:800;cursor:pointer;}',
      '#cph .done[hidden]{display:none;}',
      '#cph.dn .tile:not(.has),#cph.dn .misc,#cph.dn .pin:not(.ok){opacity:.4;}'
    ].join('\n');
    document.head.appendChild(s);
  }

  function build(){
    if(ov) return ov;
    css();
    ov = document.createElement('div'); ov.id = 'cph'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-label','주행 전 차량 촬영');
    ov.innerHTML = '<div class="hd"><button class="ib" data-a="close" aria-label="닫기">' + IC.x + '</button><h1>주행 전 차량 촬영</h1></div>'
      + '<div class="bd"><div class="note" id="cphNote"></div>'
      + '<div class="map">' + CAR
      + '<button class="pin f" data-s="front"><i>1</i><span>앞쪽</span></button>'
      + '<button class="pin r" data-s="rear"><i>2</i><span>뒤쪽</span></button>'
      + '<button class="pin lf" data-s="left"><i>3</i><span>왼쪽</span></button>'
      + '<button class="pin rt" data-s="right"><i>4</i><span>오른쪽</span></button></div>'
      + '<div class="prog"><span id="cphProgT"></span><div class="bar"><u id="cphBar"></u></div></div>'
      + '<div class="grid" id="cphGrid"></div>'
      + '<button class="misc" data-s="misc"><span class="mi" id="cphMiscI"></span><span class="tx"><b>흠집·파손 추가 촬영 <small style="font-weight:600;color:#8b929d">(선택)</small></b><span>이미 있던 흠집 · 찌그러짐 · 실내 오염</span></span><span class="ct" id="cphMiscC"></span></button>'
      + '<div class="tips">· 차 전체가 화면에 들어오게 2~3걸음 떨어져서 찍어 주세요<br>· 어두운 주차장이면 휴대폰 플래시를 켜 주세요<br>· 등록한 사진은 반납 후 파손 확인 때 고객님을 보호하는 증거가 됩니다</div></div>'
      + '<div class="ft"><div class="row"><button class="done" id="cphDone">촬영 완료</button><button class="go" id="cphGo"></button></div><span class="sub" id="cphSub"></span></div>';
    document.body.appendChild(ov);
    ov.addEventListener('click', function(e){
      var b = e.target.closest('[data-a],[data-s]'); if(!b) return;
      if(b.getAttribute('data-a') === 'close'){ close(); return; }
      var s = b.getAttribute('data-s'); if(s) tap(s);
    });
    ov.querySelector('#cphGo').addEventListener('click', function(){
      if(isDone()){ close(); return; }   /* 등록을 마친 뒤엔 '닫기' 버튼 */
      if(locked()){ blockMsg(); return; }
      var nx = nextSide();
      if(nx){ guided = true; shoot(nx); return; }
      finish();
    });
    /* ★ 몇 방향을 찍었든(0장이어도) 고객이 [촬영 완료] 를 누르면 그대로 넘어간다 */
    ov.querySelector('#cphDone').addEventListener('click', function(){ if(blocked()){ close(); return; } finish(); });
    return ov;
  }

  function setSide(s){ try{ window.pcarCurrentSide = s; }catch(e){} try{ pcarCurrentSide = s; }catch(e){} }
  function shoot(s){
    if(blocked()){ blockMsg(); return; }
    setSide(s);
    try{ if(window.Android && typeof window.Android.capturePhoto === 'function'){ window.Android.capturePhoto(s, INFO[s].n + ' 촬영'); return; } }catch(e){}
    try{ window.openCaroCamera(); }catch(e){ toast('카메라를 열 수 없습니다.'); }
    var t = document.getElementById('caro-cam-title'); if(t) t.textContent = INFO[s].n + ' 촬영 · ' + INFO[s].d;
  }
  /* 사진이 있으면 그 방향 사진 보기(지우기·더 찍기), 없으면 바로 카메라 */
  function tap(s){
    if(blocked()){ blockMsg(); return; }
    if(n(s) > 0 && typeof window.openSideCapture === 'function'){ guided = false; window.openSideCapture(s); return; }
    guided = (s !== 'misc'); shoot(s);
  }

  function render(){
    if(!ov) return;
    var dn = isDone(), lk = dn || locked(), dc = doneCount(), nx = nextSide(), r = res();
    var note = ov.querySelector('#cphNote');
    ov.classList.toggle('dn', dn);
    if(dn){ var pc = Math.max(Number(r && r.photoCount) || 0, dc + n('misc') ? SIDES.concat(['misc']).reduce(function(a, x){ return a + n(x); }, 0) : 0);
      note.className = 'note'; note.innerHTML = IC.ok + '<div><b>주행 전 사진 등록을 마쳤어요' + (pc ? ' (' + pc + '장)' : '') + '.</b><br>한 번 [촬영 완료] 를 누른 뒤에는 다시 찍을 수 없어요.</div>'; }
    else if(lk){ note.className = 'note lk'; note.innerHTML = IC.lock + '<div><b>주행 전 사진 촬영이 마감되었습니다.</b><br>대여 시작 ' + LOCK_MIN + '분이 지나 더 이상 찍을 수 없어요.</div>'; }
    else {
      var prev = r && Number(r.photoCount) > 0 && !(dc || n('misc')) ? '<br><b>이미 ' + Number(r.photoCount) + '장 등록되어 있어요.</b> 더 찍으면 함께 저장됩니다.' : '';
      note.className = 'note'; note.innerHTML = IC.shield + '<div><b>출발 전에 차 네 방향을 찍어 주세요.</b><br>이전 이용자가 낸 흠집을 고객님 책임으로 오해받지 않아요.' + prev + '</div>';
    }
    ov.querySelectorAll('.pin').forEach(function(p){
      var s = p.getAttribute('data-s'), i = p.querySelector('i'), k = SIDES.indexOf(s) + 1;
      p.classList.toggle('ok', n(s) > 0); p.classList.toggle('on', !lk && s === nx);
      i.innerHTML = n(s) > 0 ? IC.ok : k;
    });
    ov.querySelector('#cphProgT').innerHTML = '<b>' + dc + '</b> / 4 방향';
    ov.querySelector('#cphBar').style.width = (dc * 25) + '%';
    var g = '';
    SIDES.forEach(function(s){
      var ph = P()[s] || [];
      if(ph.length) g += '<button class="tile has" data-s="' + s + '"><img src="' + ph[ph.length - 1] + '" alt=""/><span class="ck">' + IC.ok + '</span><span class="cap">' + INFO[s].n + '<em>' + ph.length + '장</em></span></button>';
      else g += '<button class="tile' + (!lk && s === nx ? ' on' : '') + '" data-s="' + s + '">' + IC.cam + '<span class="t">' + INFO[s].n + '</span><span class="s">' + INFO[s].d + '</span></button>';
    });
    ov.querySelector('#cphGrid').innerHTML = g;
    var mp = P().misc || [];
    ov.querySelector('#cphMiscI').innerHTML = mp.length ? '<img src="' + mp[mp.length - 1] + '" alt=""/>' : IC.plus;
    ov.querySelector('#cphMiscC').textContent = mp.length ? mp.length + '장' : '';
    var go = ov.querySelector('#cphGo'), sub = ov.querySelector('#cphSub');
    go.disabled = lk; go.classList.toggle('fin', !nx);
    ov.querySelector('#cphDone').hidden = lk || !nx;   /* 다 찍었으면 큰 버튼 하나가 '촬영 완료' */
    if(dn){ go.disabled = false; go.classList.add('fin'); go.innerHTML = '<span>닫기</span>'; sub.textContent = '등록 완료 · 다시 찍을 수 없어요'; }
    else if(lk){ go.innerHTML = IC.lock + '<span>촬영 마감</span>'; sub.textContent = ''; }
    else if(nx){ go.innerHTML = IC.cam + '<span>' + INFO[nx].n + ' 촬영하기</span>'; sub.textContent = dc ? '남은 방향 ' + (4 - dc) + '곳 · 다 안 찍어도 [촬영 완료] 로 넘어갈 수 있어요' : '앞쪽부터 차례로 안내해 드려요 · 건너뛰려면 [촬영 완료]'; }
    else { go.innerHTML = IC.ok + '<span>촬영 완료 · 사진 등록</span>'; sub.textContent = '네 방향 모두 찍었어요' + (mp.length ? ' · 흠집 사진 ' + mp.length + '장 포함' : ''); }
  }

  function open(){
    build(); render();
    ov.classList.add('open');
    try{ document.documentElement.classList.add('cph-on'); }catch(e){}
  }
  function close(){
    if(!ov) return; ov.classList.remove('open'); guided = false;
    try{ document.documentElement.classList.remove('cph-on'); }catch(e){}
  }
  function finish(){
    markDone(); close();
    try{ window.finishPhotoCapture(); }catch(e){ console.warn('[caro-photo]', e); }
  }

  /* ── 기존 함수 감싸기 ── */
  function wrapOpen(){
    var f = window.openPhotoModal;
    if(typeof f !== 'function' || f.__cph) return;
    var w = function(){
      /* 예전 함수는 열 때마다 사진을 비운다 → 같은 예약이면 찍어 둔 사진을 지킨다 */
      var r = res(), bk = r ? String(r.bookNo || '') : '', keep = {};
      if(bk && bk === lastBook) Object.keys(P()).forEach(function(s){ keep[s] = (P()[s] || []).slice(); });
      var out; try{ out = f.apply(this, arguments); }catch(e){}
      try{ var o = document.getElementById('photo-modal-overlay'); if(o) o.classList.remove('open'); }catch(e){}
      Object.keys(keep).forEach(function(s){ if(P()[s]) { P()[s].length = 0; Array.prototype.push.apply(P()[s], keep[s]); } try{ window.updatePcarCount(s); }catch(e){} });
      lastBook = bk || lastBook;
      open();
      return out;
    };
    w.__cph = true; window.openPhotoModal = w;
  }
  function wrapCount(){
    var f = window.updatePcarCount;
    if(typeof f !== 'function' || f.__cph) return;
    var w = function(side){
      var out = f.apply(this, arguments);
      try{ render(); }catch(e){}
      /* 웹 카메라로 순서대로 찍는 중이면 : 그 방향 첫 장을 저장하면 화면으로 돌아와 다음 방향을 보여 준다 */
      try{
        if(guided && SIDES.indexOf(side) >= 0 && n(side) === 1){
          var cam = document.getElementById('caro-camera-screen');
          if(cam && cam.classList.contains('open') && typeof window.closeCaroCamera === 'function') setTimeout(function(){ window.closeCaroCamera(); }, 250);
          var nx = nextSide();
          setTimeout(function(){ toast(nx ? '✓ ' + INFO[side].n + ' 완료 · 다음은 ' + INFO[nx].n : '✓ 네 방향 촬영 완료 · 아래 [촬영 완료] 를 눌러 주세요'); }, 400);
          if(!nx) guided = false;
        }
      }catch(e){}
      return out;
    };
    w.__cph = true; window.updatePcarCount = w;
  }
  function wrapFinish(){
    var f = window.finishPhotoCapture;
    if(typeof f !== 'function' || f.__cphClose) return;
    var w = function(){ markDone(); close(); var o = f.apply(this, arguments); try{ render(); }catch(e){} return o; };
    w.__cphClose = true;
    /* 다른 스크립트(caro-live · 사진 저장)의 표시는 그대로 둔다 */
    if(f.__caroLive) w.__caroLive = true;
    if(f.__caroPhotoWrapped) w.__caroPhotoWrapped = true;
    window.finishPhotoCapture = w;
  }
  /* 방향 사진 보기 창을 닫으면 내 화면도 새로 그린다 */
  function wrapSideClose(){
    ['closeSideCaptureBtn','deleteSidePhoto'].forEach(function(k){
      var f = window[k]; if(typeof f !== 'function' || f.__cph) return;
      var w = function(){ var o = f.apply(this, arguments); try{ render(); }catch(e){} return o; };
      w.__cph = true; window[k] = w;
    });
  }
  /* 다른 길(제어 화면 '앞쪽 촬영' 바로가기 등)로도 등록 뒤엔 카메라·사진 편집이 안 열리게 */
  function wrapBlock(){
    ['openSideCapture','openCaroCamera'].forEach(function(k){
      var f = window[k]; if(typeof f !== 'function' || f.__cphBlock) return;
      var w = function(){ if(isDone()){ blockMsg(); return; } return f.apply(this, arguments); };
      w.__cphBlock = true; window[k] = w;
    });
  }
  function hookAll(){ wrapOpen(); wrapCount(); wrapFinish(); wrapSideClose(); wrapBlock(); }
  hookAll();
  var tries = 0, t = setInterval(function(){ hookAll(); if(++tries > 40) clearInterval(t); }, 1500);   /* 다른 스크립트가 나중에 감싸도 다시 바깥에 */
  window.addEventListener('load', hookAll);
  /* 뒤로 가기(안드로이드)로 닫기 */
  var prevBack = window.caroBack;
  window.caroBack = function(){
    if(ov && ov.classList.contains('open')){
      var sc = document.getElementById('side-capture-overlay');
      var cam = document.getElementById('caro-camera-screen');
      if(cam && cam.classList.contains('open')){ try{ window.closeCaroCamera(); }catch(e){} return true; }
      if(sc && sc.classList.contains('open')){ try{ window.closeSideCaptureBtn(); }catch(e){} return true; }
      close(); return true;
    }
    return typeof prevBack === 'function' ? prevBack.apply(this, arguments) : false;
  };
  window.caroPhotoRender = render;
  console.log('✅ 주행 전 차량 촬영 (caro-photo v1)');
})();
