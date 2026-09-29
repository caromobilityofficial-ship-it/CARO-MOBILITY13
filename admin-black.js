/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 'CARO THE BLACK' 프리미엄 전용 탭 v2
   ───────────────────────────────────────────────────────────
   · 상단 탭에 'CARO THE BLACK' 추가 (관제 대시보드 옆)
   · 전용 페이지: 통계 + 차량 목록(bl_cars 실시간) + 추가/삭제
   적용: admin.html </body> 위 — 이미 추가돼 있음:
     <script src="admin-black.js?v=1"></script>
   ※ 파일만 덮어쓰면 됨. (안 바뀌면 admin.html에서 ?v=1 → ?v=2)
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }
  function num(x){ return (typeof x==='number'&&!isNaN(x))?x:null; }
  function esc(s){ return (''+(s==null?'':s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
   /* ★[14차] onclick="f('…')" 처럼 글자가 다시 '코드' 로 읽히는 자리에는 esc 만으로는 부족하다
     (HTML 규칙상 &#39; 는 읽히는 순간 ' 로 돌아와 문자열을 끊는다) → 코드 문자열 규칙으로 먼저 막고 나서 HTML 로 막는다 */
  function jsa(s){ return esc(String(s==null?'':s).replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n').replace(/\r/g,'\\r').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')); }
 function mapStatus(s){
    if(!s) return '이용가능'; s=(''+s).toLowerCase();
    if(s.indexOf('busy')>=0||s.indexOf('use')>=0||s.indexOf('rent')>=0||s.indexOf('이용중')>=0) return '이용중';
    if(s.indexOf('maint')>=0||s.indexOf('unavail')>=0||s.indexOf('점검')>=0||s.indexOf('off')>=0||s.indexOf('disable')>=0) return '점검';
    return '이용가능';
  }
  function stCls(st){ return st==='이용중'?'b-rent':(st==='점검'?'b-maint':'b-avail'); }
  function stLabel(st){ return st==='점검'?'점검·불가':st; }

  var OTHER_TABS=['dash','price','resv','notice','set'];

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    /* 탭 버튼 (프리미엄 표시) */
    '.tab.tab-black{color:#b89a5e;display:inline-flex;align-items:center;gap:7px;}'
    +'.tab.tab-black::before{content:"◆";font-size:8px;color:var(--gold);line-height:1;}'
    +'.tab.tab-black:hover{color:var(--gold-soft);}'
    /* 페이지 헤더 */
    +'.blk-page-hd{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:16px;flex-wrap:wrap;gap:12px;}'
    +'.blk-page-hd .ttl{font-size:22px;letter-spacing:.04em;color:var(--gold-soft);display:flex;align-items:center;gap:11px;}'
    +'.blk-page-hd .ttl .blk-tag{font-size:10px;letter-spacing:.13em;color:#1a1813;'
    +'background:linear-gradient(135deg,#e0c884,#c8a96e);padding:4px 9px;border-radius:5px;font-weight:800;}'
    +'.blk-page-hd .sub{font-size:12px;color:var(--muted);margin-top:6px;}'
    /* 카드 */
    +'.blk-card{border:1px solid var(--gold-dim);background:linear-gradient(160deg,rgba(200,169,110,.07),var(--panel) 55%);}'
    +'.blk-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:16px 18px 8px;}'
    +'.blk-kpi{background:rgba(255,255,255,.02);border:1px solid var(--border);border-radius:12px;padding:15px 10px;text-align:center;}'
    +'.blk-kpi .n{font-size:26px;font-family:"Saira",sans-serif;color:var(--gold-soft);font-variant-numeric:tabular-nums;line-height:1;}'
    +'.blk-kpi .l{font-size:11.5px;color:var(--muted);margin-top:7px;}'
    +'.blk-tbl{width:100%;border-collapse:collapse;font-size:13px;}'
    +'.blk-tbl th{text-align:left;padding:11px 14px;color:var(--muted);font-weight:500;font-size:11.5px;border-bottom:1px solid var(--border);white-space:nowrap;}'
    +'.blk-tbl td{padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.035);white-space:nowrap;}'
    +'.blk-tbl tr:last-child td{border-bottom:none;}'
    +'.blk-empty{padding:34px 18px;text-align:center;color:var(--muted);font-size:13px;}'
    +'.bdot{display:inline-flex;align-items:center;gap:6px;font-size:12px;}'
    +'.bdot i{width:7px;height:7px;border-radius:50%;display:inline-block;}'
    +'.b-avail{color:#7bb89a;} .b-avail i{background:#7bb89a;}'
    +'.b-rent{color:#6aa6db;} .b-rent i{background:#6aa6db;}'
    +'.b-maint{color:#e0a86c;} .b-maint i{background:#e0a86c;}'
    +'.blk-del{background:transparent;border:1px solid var(--border2);color:#d57a68;border-radius:7px;padding:4px 10px;font-size:11.5px;cursor:pointer;}'
    +'.blk-del:hover{background:rgba(213,122,104,.12);}'
    /* 모달 */
    +'.bmodal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;}'
    +'.bmodal.show{display:flex;}'
    +'.bbox{background:var(--panel);border:1px solid var(--gold-dim);border-radius:16px;width:min(440px,94vw);max-height:90vh;overflow:auto;}'
    +'.bbhd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border);}'
    +'.bbhd h3{margin:0;font-size:15px;color:var(--gold-soft);}'
    +'.bbclose{background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;}'
    +'.bbody{padding:18px;}'
    +'.bfield{margin-bottom:15px;}'
    +'.bfield:last-child{margin-bottom:4px;}'
    +'.bbody label{display:block;font-size:12px;color:var(--muted);margin:0 0 7px;}'
    +'.bbody input,.bbody select{width:100%;height:44px;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);border-radius:9px;padding:0 12px;font-size:13px;box-sizing:border-box;}'
    +'.bbody select{cursor:pointer;}'
    +'.bbody input:focus,.bbody select:focus{outline:none;border-color:var(--gold-dim);}'
    +'.bbrow{display:flex;gap:12px;align-items:flex-start;}.bbrow>div{flex:1;min-width:0;}'
    +'.bbfoot{display:flex;gap:9px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border);}';
  document.head.appendChild(st);

  /* ── 블랙 카드(내용물) ── */
  var card=document.createElement('div');
  card.className='card blk-card';
  card.innerHTML=
    '<div class="blk-stats">'
      +'<div class="blk-kpi"><div class="n" id="blkTotal">0</div><div class="l">총 대수</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkAvail">0</div><div class="l">이용 가능</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkBusy">0</div><div class="l">이용 중</div></div>'
      +'<div class="blk-kpi"><div class="n" id="blkMaint">0</div><div class="l">점검·불가</div></div>'
    +'</div>'
    +'<div class="tbl-scroll"><table class="blk-tbl">'
      +'<thead><tr><th>차량</th><th>번호판</th><th>상태</th><th>월 요금</th><th>연료량</th><th>위치</th><th></th></tr></thead>'
      +'<tbody id="blkBody"></tbody></table></div>';

  /* ── 탭 전환 ── */
  function showBlack(){
    document.querySelectorAll('.tabs .tab').forEach(function(x){ x.classList.remove('active'); });
    var b=document.querySelector('.tabs [data-tab="black"]'); if(b) b.classList.add('active');
    OTHER_TABS.forEach(function(id){ var el=document.getElementById('tab-'+id); if(el) el.classList.add('hide'); });
    var s=document.getElementById('tab-black'); if(s) s.classList.remove('hide');
  }

  /* ── 탭 + 섹션 장착 (1회) ── */
  function mount(){
    if(document.getElementById('tab-black')) return;
    var dash=document.getElementById('tab-dash');
    var tabs=document.querySelector('.tabs');
    var dashBtn=document.querySelector('.tabs [data-tab="dash"]');
    if(!dash || !tabs || !dashBtn) return;

    /* 섹션 생성 (dash 다음 위치) */
    var section=document.createElement('section');
    section.id='tab-black'; section.className='hide';
    section.innerHTML=
      '<div class="blk-page-hd">'
        +'<div><div class="ttl">CARO THE BLACK <span class="blk-tag">PREMIUM</span></div>'
        +'<div class="sub">프리미엄 차량 전용 관리 · Firestore(bl_cars) 실시간</div></div>'
        +'<button class="btn gold" id="blkAddBtn">+ 블랙 차량 등록</button>'
      +'</div>';
    section.appendChild(card);
    dash.parentNode.insertBefore(section, dash.nextSibling);

    /* 탭 버튼 (관제 대시보드 옆) */
    var btn=document.createElement('button');
    btn.className='tab tab-black'; btn.setAttribute('data-tab','black');
    btn.textContent='CARO THE BLACK';
    dashBtn.parentNode.insertBefore(btn, dashBtn.nextSibling);
    btn.addEventListener('click', showBlack);

    /* 다른 탭 누르면 블랙 숨기기 */
    document.querySelectorAll('.tabs .tab').forEach(function(t){
      if(t.getAttribute('data-tab')!=='black'){
        t.addEventListener('click', function(){
          var s=document.getElementById('tab-black'); if(s) s.classList.add('hide');
          var bb=document.querySelector('.tabs [data-tab="black"]'); if(bb) bb.classList.remove('active');
        });
      }
    });

    var ab=document.getElementById('blkAddBtn'); if(ab) ab.onclick=openModal;
  }

  /* ── 추가 모달 ── */
  var modal=document.createElement('div');
  modal.className='bmodal'; modal.id='blkModal';
  modal.innerHTML=
    '<div class="bbox">'
    +'<div class="bbhd"><h3>＋ CARO THE BLACK 차량 추가</h3><button class="bbclose" id="blkClose">✕</button></div>'
    +'<div class="bbody">'
      +'<div class="bfield"><label>차량명 *</label><input id="blkName" placeholder="예: 벤츠 S클래스" maxlength="40" /></div>'
      +'<div class="bfield"><label>번호판</label><input id="blkPlate" placeholder="예: 12가 3456" maxlength="20" /></div>'
      +'<div class="bfield bbrow">'
        +'<div><label>시간당 요금 (원)</label><input id="blkPrice" type="number" placeholder="예: 30000" /></div>'
        +'<div><label>월 요금 (원)</label><input id="blkMonthly" type="number" placeholder="예: 1500000" /></div>'
      +'</div>'
      +'<div class="bfield"><label>상태</label><select id="blkStatus">'
        +'<option value="available">이용가능</option><option value="busy">이용중</option>'
        +'<option value="unavailable">점검·불가</option></select></div>'
      +'<div class="bfield"><label>위치</label><input id="blkPlace" placeholder="예: 인천공항 제1터미널 주차장" maxlength="60" /></div>'
      +'<div class="bfield"><label>사진 URL (선택)</label><input id="blkImage" placeholder="https://... 이미지 주소" maxlength="300" /></div>'
    +'</div>'
    +'<div class="bbfoot"><button class="btn" id="blkCancel">취소</button>'
    +'<button class="btn gold" id="blkSave">등록</button></div>'
    +'</div>';
  document.body.appendChild(modal);

  function openModal(){
    ['blkName','blkPlate','blkPrice','blkMonthly','blkPlace','blkImage'].forEach(function(id){ modal.querySelector('#'+id).value=''; });
    modal.querySelector('#blkStatus').value='available';
    modal.classList.add('show'); setTimeout(function(){ modal.querySelector('#blkName').focus(); },50);
  }
  function closeModal(){ modal.classList.remove('show'); }
  modal.querySelector('#blkClose').onclick=closeModal;
  modal.querySelector('#blkCancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  modal.querySelector('#blkSave').onclick=function(){
    if(!ready()){ T('Firestore 연결 대기 중'); return; }
    var name=modal.querySelector('#blkName').value.trim();
    if(!name){ T('차량명을 입력하세요'); return; }
    var FN=window.FB_FN, db=window.FB_DB, refDoc;
    try{ refDoc=FN.doc(FN.collection(db,'bl_cars')); }catch(e){ T('저장 오류'); return; }
    var priceV=parseInt(modal.querySelector('#blkPrice').value,10);
    var monthlyV=parseInt(modal.querySelector('#blkMonthly').value,10);
    var data={ name:name, plate:modal.querySelector('#blkPlate').value.trim(),
      price:(isNaN(priceV)?null:priceV), monthlyPrice:(isNaN(monthlyV)?null:monthlyV),
      status:modal.querySelector('#blkStatus').value,
      place:modal.querySelector('#blkPlace').value.trim(), image:modal.querySelector('#blkImage').value.trim(),
      grade:'THE BLACK', createdAt:(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString()) };
    FN.setDoc(refDoc,data).then(function(){ T('블랙 차량이 추가되었습니다'); closeModal(); })
      .catch(function(e){ console.error('[블랙] 저장 실패',e); T('저장 실패 — 권한(bl_cars)을 확인하세요'); });
  };

  window.delBlack=function(id){
    if(!ready()) return;
    if(!confirm('이 블랙 차량을 삭제할까요?')) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,'bl_cars',id)).then(function(){ T('삭제되었습니다'); })
      .catch(function(e){ console.error(e); T('삭제 실패'); });
  };

  /* ── 렌더 ── */
  function render(list){
    mount();
    var body=document.getElementById('blkBody'); if(!body) return;
    var t=0,a=0,bu=0,m=0;
    var rows=(list||[]).map(function(c){
      var d=c.data||{};
      var name=d.name||d.carName||d.title||'(이름 없음)';
      var plate=d.plate||d.carNumber||d.number||'—';
      var stt=mapStatus(d.status), bat=num(d.battery);
      var mp=num(d.monthlyPrice);
      var place=d.place||d.location||d.parkingName||'위치 정보 없음';
      t++; if(stt==='이용중')bu++; else if(stt==='점검')m++; else a++;
      return '<tr>'
        +'<td style="color:var(--txt)">'+esc(name)+'</td>'
        +'<td style="color:var(--muted);font-family:\'Saira\',sans-serif">'+esc(plate)+'</td>'
        +'<td><span class="bdot '+stCls(stt)+'"><i></i>'+stLabel(stt)+'</span></td>'
        +'<td style="color:var(--gold-soft);font-family:\'Saira\',sans-serif">'+(mp==null?'<span style="color:var(--muted)">미설정</span>':mp.toLocaleString()+'원')+'</td>'
        +'<td>'+(bat==null?'<span style="color:var(--muted)">—</span>':bat+'%')+'</td>'
        +'<td style="color:var(--muted)">'+esc(place)+'</td>'
        +'<td style="text-align:right"><button class="blk-del" onclick="delBlack(\''+jsa(c.id)+'\')">삭제</button></td>'
      +'</tr>';
    }).join('');
    body.innerHTML = rows || '<tr><td colspan="7" class="blk-empty">아직 등록된 CARO THE BLACK 차량이 없습니다. <b>+ 블랙 차량 등록</b>으로 추가하세요.</td></tr>';
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('blkTotal',t); set('blkAvail',a); set('blkBusy',bu); set('blkMaint',m);
  }

  /* ── 실시간 연결 ── */
  function start(){
    mount();
    if(!ready()){ render([]); return false; }
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'bl_cars'), function(snap){
        var arr=[]; snap.forEach(function(doc){ arr.push({id:doc.id, data:doc.data()||{}}); });
        arr.sort(function(x,y){ return (x.data.name||'').localeCompare(y.data.name||''); });
        render(arr);
      }, function(e){ console.warn('[블랙] 목록 오류',e); });
    }catch(e){ console.warn('[블랙] 리스너 오류',e); }
    return true;
  }
  if(!start()){ var tt=setInterval(function(){ if(start()) clearInterval(tt); },400); setTimeout(function(){clearInterval(tt);},15000); }
  console.log('[블랙] ✅ CARO THE BLACK 전용 탭 v2 활성화');
})();
