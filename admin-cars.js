/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관제 대시보드 '일반 차량 등록' v1
   ───────────────────────────────────────────────────────────
   · 차량 현황의 "+ 차량 등록" 버튼 → 등록 모달 (블랙과 동일 방식)
   · Firestore(cars)에 저장 → 대시보드 차량 현황에 실시간 반영
   적용: admin.html </body> 위, admin-black.js 줄 다음에
     <script src="admin-cars.js?v=1"></script>
   ※ cars 규칙은 이미 있음(allow write: if isAdmin()) — 추가 규칙 불필요
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.doc==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }

  /* ── 스타일 (일반 톤) ── */
  var st=document.createElement('style');
  st.textContent=
    '.cmodal{position:fixed;inset:0;background:rgba(0,0,0,.62);display:none;align-items:center;justify-content:center;z-index:99999;padding:16px;}'
    +'.cmodal.show{display:flex;}'
    +'.cbox{background:var(--panel);border:1px solid var(--border2);border-radius:16px;width:min(440px,94vw);max-height:90vh;overflow:auto;}'
    +'.chd{display:flex;justify-content:space-between;align-items:center;padding:16px 18px;border-bottom:1px solid var(--border);}'
    +'.chd h3{margin:0;font-size:15px;color:var(--txt);}'
    +'.cclose{background:transparent;border:none;color:var(--muted);font-size:18px;cursor:pointer;line-height:1;}'
    +'.cbody{padding:18px;}'
    +'.cfield{margin-bottom:15px;}'
    +'.cfield:last-child{margin-bottom:4px;}'
    +'.cbody label{display:block;font-size:12px;color:var(--muted);margin:0 0 7px;}'
    +'.cbody input,.cbody select{width:100%;height:44px;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);border-radius:9px;padding:0 12px;font-size:13px;box-sizing:border-box;}'
    +'.cbody select{cursor:pointer;}'
    +'.cbody input:focus,.cbody select:focus{outline:none;border-color:var(--border2);}'
    +'.crow{display:flex;gap:12px;align-items:flex-start;}.crow>div{flex:1;min-width:0;}'
    +'.cfoot{display:flex;gap:9px;justify-content:flex-end;padding:14px 18px;border-top:1px solid var(--border);}';
  document.head.appendChild(st);

  /* ── 모달 ── */
  var modal=document.createElement('div');
  modal.className='cmodal'; modal.id='carModal';
  modal.innerHTML=
    '<div class="cbox">'
    +'<div class="chd"><h3>＋ 차량 등록</h3><button class="cclose" id="carClose">✕</button></div>'
    +'<div class="cbody">'
      +'<div class="cfield"><label>차량명 *</label><input id="carName" placeholder="예: 디 올 뉴 코나" maxlength="40" /></div>'
      +'<div class="cfield"><label>번호판</label><input id="carPlate" placeholder="예: 12가 3456" maxlength="20" /></div>'
      +'<div class="cfield crow">'
        +'<div><label>시간당 요금 (원)</label><input id="carPrice" type="number" placeholder="예: 10000" /></div>'
        +'<div><label>월 요금 (원)</label><input id="carMonthly" type="number" placeholder="예: 600000" /></div>'
      +'</div>'
      +'<div class="cfield"><label>상태</label><select id="carStatus">'
        +'<option value="available">이용가능</option><option value="busy">이용중</option>'
        +'<option value="unavailable">점검·불가</option></select></div>'
      +'<div class="cfield"><label>위치</label><input id="carPlace" placeholder="예: 인천 부평구 부평대로 ..." maxlength="60" /></div>'
      +'<div class="cfield"><label>사진 URL (선택)</label><input id="carImage" placeholder="https://... 이미지 주소" maxlength="300" /></div>'
    +'</div>'
    +'<div class="cfoot"><button class="btn" id="carCancel">취소</button>'
    +'<button class="btn gold" id="carSave">등록</button></div>'
    +'</div>';
  document.body.appendChild(modal);

  function openModal(){
    ['carName','carPlate','carPrice','carMonthly','carPlace','carImage'].forEach(function(id){ modal.querySelector('#'+id).value=''; });
    modal.querySelector('#carStatus').value='available';
    modal.classList.add('show'); setTimeout(function(){ modal.querySelector('#carName').focus(); },50);
  }
  function closeModal(){ modal.classList.remove('show'); }
  modal.querySelector('#carClose').onclick=closeModal;
  modal.querySelector('#carCancel').onclick=closeModal;
  modal.addEventListener('click',function(e){ if(e.target===modal) closeModal(); });
  modal.querySelector('#carSave').onclick=function(){
    if(!ready()){ T('Firestore 연결 대기 중'); return; }
    var name=modal.querySelector('#carName').value.trim();
    if(!name){ T('차량명을 입력하세요'); return; }
    if(window.caroCan && !(caroCan('cars')||caroCan('pricing'))){ T('차량 등록은 [차량 관리] 권한이 필요합니다'); return; }
    var FN=window.FB_FN, db=window.FB_DB, refDoc, newId=String(Date.now());
    /* ★[v108] 문서 ID 를 숫자로 — 예전엔 무작위 ID 라서 단말(devices.carId)·예약(car.id)과 자동으로 연결되지 않았다 */
    try{ refDoc=FN.doc(db,'cars',newId); }catch(e){ T('저장 오류'); return; }
    var priceV=parseInt(modal.querySelector('#carPrice').value,10);
    var monthlyV=parseInt(modal.querySelector('#carMonthly').value,10);
    var data={ name:name, plate:modal.querySelector('#carPlate').value.trim(),
      price:(isNaN(priceV)?null:priceV), monthlyPrice:(isNaN(monthlyV)?null:monthlyV),
      status:modal.querySelector('#carStatus').value,
      place:modal.querySelector('#carPlace').value.trim(), image:modal.querySelector('#carImage').value.trim(),
      grade:'일반', id:newId, createdAt:(FN.serverTimestamp?FN.serverTimestamp():new Date().toISOString()) };
    FN.setDoc(refDoc,data).then(function(){ T('차량이 등록되었습니다'); closeModal(); })
      .catch(function(e){ console.error('[차량] 저장 실패',e); T('저장 실패 — 권한(cars)을 확인하세요'); });
  };

  /* ── "+ 차량 등록" 버튼 연결 ── */
  function wireBtn(){
    var btns=document.querySelectorAll('#tab-dash .card-hd button');
    for(var i=0;i<btns.length;i++){
      if(/차량\s*등록/.test(btns[i].textContent)){
        btns[i].removeAttribute('onclick'); btns[i].onclick=openModal; return true;
      }
    }
    return false;
  }
  if(!wireBtn()){ var t=setInterval(function(){ if(wireBtn()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[차량] ✅ 일반 차량 등록 모달 v1 활성화');
})();
