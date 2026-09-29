/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 관리자 '월 렌트' 탭 v2
   · 저장 버튼 → '수정' : 누르면 차량 편집 모달
   · 모달: 이미지(미리보기/변경) + 연료 + 주행km(전기 원/km, 무료km) +
     시간당요금 + 월요금 + 차량옵션 편집 → Firestore setDoc(merge)
   · 차량 추가( setDoc 새 id ) / 삭제( deleteDoc )
   · 모두 Firestore → 고객 앱 onSnapshot 으로 실시간 동기화
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function ready(){ return window.FB_DB && window.FB_FN && typeof window.FB_FN.onSnapshot==='function'; }
  function T(m){ try{ if(window.toast) toast(m); }catch(e){} }
  function num(x){ return (typeof x==='number'&&!isNaN(x))?x:null; }
  function esc(s){ return (''+(s==null?'':s)).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function won(n){ return (Number(n)||0).toLocaleString(); }
  function intv(s){ var r=(''+(s==null?'':s)).replace(/[^0-9]/g,''); return r===''?null:parseInt(r,10); }
  var MR_PERIODS=[1,3,6,9,12];
  function plan1(d){ var pl=(d&&d.monthlyPlans)?d.monthlyPlans['1']:null; if(pl&&num(pl.price)!=null&&pl.price>0){ var disc=num(pl.discount)||0; return Math.round(pl.price*(100-disc)/100); } return null; }
  function gatherPlans(){ var o={}; MR_PERIODS.forEach(function(p){ var pe=document.querySelector('.mrm-pp[data-p="'+p+'"]'); var de=document.querySelector('.mrm-pd[data-p="'+p+'"]'); o[String(p)]={ price:(pe?(intv(pe.value)||0):0), discount:(de?(intv(de.value)||0):0) }; }); return o; }

  var HIDE=['dash','price','resv','notice','set','black','monthly'];

  /* ── 스타일 ── */
  var st=document.createElement('style');
  st.textContent=
    '.mr-page-hd{margin-bottom:16px;display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap;}'
   +'.mr-ttl{font-size:22px;color:var(--txt);letter-spacing:.01em;}'
   +'.mr-sub{font-size:12px;color:var(--muted);margin-top:6px;max-width:560px;}'
   +'.mr-add{background:var(--gold-soft,#c8a96e);color:#1a1813;border:none;border-radius:9px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;white-space:nowrap;}'
   +'.mr-add:hover{opacity:.92;}'
   +'.mr-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px;}'
   +'.mr-kpi{background:var(--panel);border:1px solid var(--border);border-radius:14px;padding:16px 12px;text-align:center;}'
   +'.mr-kpi .n{font-size:24px;font-family:"Saira",sans-serif;color:var(--gold-soft);font-variant-numeric:tabular-nums;line-height:1;}'
   +'.mr-kpi .l{font-size:12px;color:var(--muted);margin-top:7px;}'
   +'.mr-tbl{width:100%;border-collapse:collapse;font-size:13px;}'
   +'.mr-tbl th{text-align:left;padding:11px 14px;color:var(--muted);font-weight:500;font-size:11.5px;border-bottom:1px solid var(--border);white-space:nowrap;}'
   +'.mr-tbl td{padding:11px 14px;border-bottom:1px solid rgba(255,255,255,.035);white-space:nowrap;vertical-align:middle;text-align:left;}'
   +'.mr-tbl tr:last-child td{border-bottom:none;}'
   +'.mr-thumb{width:54px;height:36px;object-fit:contain;border-radius:8px;background:#11141a;vertical-align:middle;}'
   +'.mr-grade{font-size:11px;padding:2px 9px;border-radius:20px;border:1px solid var(--border2);color:var(--muted);}'
   +'.mr-grade.bl{color:var(--gold-soft);border-color:rgba(200,169,110,.4);}'
   +'.mr-edit{background:var(--gold-soft,#c8a96e);color:#1a1813;border:none;border-radius:8px;padding:8px 16px;font-size:12px;font-weight:700;cursor:pointer;}'
   +'.mr-edit:hover{opacity:.92;}'
   +'.mr-empty{padding:34px;text-align:center;color:var(--muted);font-size:13px;}'
   /* 모달 */
   +'#mrModal{position:fixed;inset:0;z-index:9000;background:rgba(8,9,12,.62);display:none;align-items:flex-start;justify-content:center;overflow-y:auto;padding:40px 16px;}'
   +'#mrModal.open{display:flex;}'
   +'.mrm-box{width:100%;max-width:460px;background:var(--panel);border:1px solid var(--border);border-radius:18px;padding:22px;}'
   +'.mrm-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;}'
   +'.mrm-ttl{font-size:18px;color:var(--txt);font-weight:600;}'
   +'.mrm-x{background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer;line-height:1;}'
   +'.mrm-imgwrap{display:flex;align-items:center;gap:14px;margin-bottom:16px;}'
   +'.mrm-img{width:120px;height:80px;object-fit:contain;border-radius:12px;background:#11141a;border:1px solid var(--border);flex-shrink:0;}'
   +'.mrm-imgbtn{background:var(--panel2);border:1px solid var(--border2);color:var(--txt);border-radius:8px;padding:8px 12px;font-size:12px;cursor:pointer;}'
   +'.mrm-field{margin-bottom:13px;}'
   +'.mrm-field label{display:block;font-size:11.5px;color:var(--muted);margin-bottom:5px;font-weight:600;}'
   +'.mrm-row2{display:grid;grid-template-columns:1fr 1fr;gap:10px;}'
   +'.mrm-plans{display:flex;flex-direction:column;gap:7px;}'
   +'.mrm-plan{display:grid;grid-template-columns:58px 1fr 84px;gap:8px;align-items:center;}'
   +'.mrm-plan .pl{font-size:12.5px;color:var(--txt);font-weight:700;}'
   +'.mrm-plan .mrm-in{padding:8px 10px;}'
   +'.mrm-in,.mrm-sel,.mrm-ta{width:100%;background:var(--panel2);border:1px solid var(--border2);color:var(--txt);border-radius:8px;padding:9px 11px;font-size:13px;font-family:inherit;box-sizing:border-box;}'
   +'.mrm-in:focus,.mrm-sel,.mrm-ta:focus{outline:none;}.mrm-in:focus,.mrm-ta:focus{border-color:var(--gold-dim);}'
   +'.mrm-ta{min-height:78px;resize:vertical;line-height:1.5;}'
   +'.mrm-hint{font-size:11px;color:var(--muted);margin-top:4px;}'
   +'.mrm-actions{display:flex;gap:10px;margin-top:20px;}'
   +'.mrm-save{flex:1;background:var(--gold-soft,#c8a96e);color:#1a1813;border:none;border-radius:10px;padding:13px;font-size:14px;font-weight:700;cursor:pointer;}'
   +'.mrm-del{background:rgba(210,90,80,.12);color:#e0746a;border:1px solid rgba(210,90,80,.4);border-radius:10px;padding:13px 18px;font-size:13px;font-weight:700;cursor:pointer;}'
   +'.mrm-save:hover{opacity:.92;}.mrm-del:hover{background:rgba(210,90,80,.2);}';
  document.head.appendChild(st);

  /* ── 탭 ── */
  function showMonthly(){
    document.querySelectorAll('.tabs .tab').forEach(function(x){ x.classList.remove('active'); });
    var b=document.querySelector('.tabs [data-tab="monthly"]'); if(b) b.classList.add('active');
    HIDE.forEach(function(id){ if(id!=='monthly'){ var el=document.getElementById('tab-'+id); if(el) el.classList.add('hide'); } });
    var s=document.getElementById('tab-monthly'); if(s) s.classList.remove('hide');
  }
  function mount(){
    if(document.getElementById('tab-monthly')) return;
    var dash=document.getElementById('tab-dash'); var tabs=document.querySelector('.tabs');
    if(!dash || !tabs) return;
    var section=document.createElement('section');
    section.id='tab-monthly'; section.className='hide';
    section.innerHTML=
      '<div class="mr-page-hd"><div><div class="mr-ttl">월 렌트 요금 관리</div>'
      +'<div class="mr-sub">차량을 <b>수정</b>해 이미지·연료·월 주행거리·옵션·<b>기간별 월 요금</b>을 편집하면 고객 앱에 실시간 반영됩니다. 차량 추가/삭제도 여기서 할 수 있어요.</div></div>'
      +'<button class="mr-add" onclick="mrOpenEdit(null,null)">+ 차량 추가</button></div>'
      +'<div class="mr-stats">'
        +'<div class="mr-kpi"><div class="n" id="mrTotal">0</div><div class="l">전체 차량</div></div>'
        +'<div class="mr-kpi"><div class="n" id="mrSet">0</div><div class="l">월 요금 설정됨</div></div>'
        +'<div class="mr-kpi"><div class="n" id="mrUnset">0</div><div class="l">미설정</div></div>'
      +'</div>'
      +'<div class="card"><div class="tbl-scroll"><table class="mr-tbl">'
        +'<thead><tr><th>차량</th><th>등급</th><th>월 요금(1개월~)</th><th style="text-align:right">관리</th></tr></thead>'
        +'<tbody id="mrBody"></tbody></table></div></div>';
    dash.parentNode.insertBefore(section, dash.nextSibling);
    var anchor=document.querySelector('.tabs [data-tab="black"]') || document.querySelector('.tabs [data-tab="dash"]');
    var btn=document.createElement('button');
    btn.className='tab'; btn.setAttribute('data-tab','monthly'); btn.textContent='월 렌트';
    anchor.parentNode.insertBefore(btn, anchor.nextSibling);
    btn.addEventListener('click', showMonthly);
    document.querySelectorAll('.tabs .tab').forEach(function(t){
      if(t.getAttribute('data-tab')!=='monthly'){
        t.addEventListener('click', function(){
          var s=document.getElementById('tab-monthly'); if(s) s.classList.add('hide');
          var mb=document.querySelector('.tabs [data-tab="monthly"]'); if(mb) mb.classList.remove('active');
        });
      }
    });
    buildModal();
  }

  /* ── 데이터 ── */
  var carsArr=[], blArr=[];
  function findCar(col,id){
    var arr=col==='bl_cars'?blArr:carsArr;
    for(var i=0;i<arr.length;i++){ if((''+arr[i].id)===(''+id)) return arr[i].d||{}; }
    return null;
  }

  /* ── 렌더(표) ── */
  function render(){
    mount();
    var body=document.getElementById('mrBody'); if(!body) return;
    var list=[];
    blArr.forEach(function(c){ list.push({col:'bl_cars', id:c.id, d:c.d, bl:true}); });
    carsArr.forEach(function(c){ list.push({col:'cars', id:c.id, d:c.d, bl:false}); });
    var total=list.length, setN=0;
    var rows=list.map(function(it){
      var d=it.d||{};
      var name=d.name||d.carName||d.title||'(이름 없음)';
      var ph=num(d.pricePerHour)!=null?num(d.pricePerHour):num(d.price);
      var mp=plan1(d); if(mp!=null) setN++;
      var idA=(''+it.id).replace(/\\/g,'').replace(/'/g,"\\'");
      var thumb=d.img?'<img class="mr-thumb" src="'+esc(d.img)+'" onerror="this.style.visibility=\'hidden\'"/> ':'';
      return '<tr>'
        +'<td style="color:var(--txt)">'+thumb+esc(name)+'</td>'
        +'<td><span class="mr-grade'+(it.bl?' bl':'')+'">'+(it.bl?'THE BLACK':'일반')+'</span></td>'
        +'<td style="font-family:\'Saira\',sans-serif;color:'+(mp==null?'var(--muted)':'var(--txt)')+'">'+(mp==null?'미설정':won(mp)+'원~')+'</td>'
        +'<td style="text-align:right"><button class="mr-edit" onclick="mrOpenEdit(\''+esc(it.col)+'\',\''+esc(idA)+'\')">수정</button></td>'
      +'</tr>';
    }).join('');
    body.innerHTML = rows || '<tr><td colspan="4" class="mr-empty">등록된 차량이 없습니다. 우측 상단 ‘+ 차량 추가’로 등록하세요.</td></tr>';
    var set=function(id,v){ var el=document.getElementById(id); if(el) el.textContent=v; };
    set('mrTotal',total); set('mrSet',setN); set('mrUnset',total-setN);
  }

  /* ── 모달 ── */
  function buildModal(){
    if(document.getElementById('mrModal')) return;
    var m=document.createElement('div'); m.id='mrModal';
    m.innerHTML=
      '<div class="mrm-box">'
      +'<div class="mrm-hd"><span class="mrm-ttl" id="mrmTtl">차량 수정</span><button class="mrm-x" onclick="mrCloseEdit()">✕</button></div>'
      +'<div class="mrm-imgwrap"><img class="mrm-img" id="mrmImg" alt=""/>'
        +'<div><button class="mrm-imgbtn" onclick="document.getElementById(\'mrmFile\').click()">이미지 변경</button>'
        +'<div class="mrm-hint">탭하면 사진 선택 (자동 축소 저장)</div>'
        +'<input id="mrmFile" type="file" accept="image/*" style="display:none"/></div></div>'
      +'<div class="mrm-field"><label>차량명</label><input class="mrm-in" id="mrmName" placeholder="예: 더 뉴 모닝"/></div>'
      +'<div class="mrm-field" id="mrmGradeWrap"><label>등급</label><select class="mrm-sel" id="mrmGrade"><option value="cars">일반</option><option value="bl_cars">CARO THE BLACK</option></select></div>'
      +'<div class="mrm-field"><label>사용 연료</label><input class="mrm-in" id="mrmFuel" list="mrmFuelList" placeholder="예: 가솔린 / 전기 / 디젤"/>'
        +'<datalist id="mrmFuelList"><option value="가솔린"></option><option value="디젤"></option><option value="전기"></option><option value="LPG"></option><option value="하이브리드"></option></datalist></div>'
      +'<div class="mrm-field"><label>월 주행거리 (km)</label><input class="mrm-in" id="mrmMonthlyKm" inputmode="numeric" placeholder="예: 2000 (비우면 무제한)"/></div>'
      +'<div class="mrm-field"><label>주행요금 (원/km) — 반납 시 주행거리 요금</label><input class="mrm-in" id="mrmKmRate" inputmode="numeric" placeholder="예: 245"/></div>'
      +'<div class="mrm-field"><label>기간별 월 렌트 요금 — 월 금액 / 할인 %</label><div class="mrm-plans">'
        +MR_PERIODS.map(function(p){ return '<div class="mrm-plan"><span class="pl">'+p+'개월</span>'
          +'<input class="mrm-in mrm-pp" data-p="'+p+'" inputmode="numeric" placeholder="월 금액(원)"/>'
          +'<input class="mrm-in mrm-pd" data-p="'+p+'" inputmode="numeric" placeholder="할인%"/></div>'; }).join('')
        +'</div><div class="mrm-hint">요금·할인은 관리자만 입력합니다. 고객 앱엔 할인 적용가가 표시돼요.</div></div>'
      +'<div class="mrm-field"><label>차량 옵션 (줄바꿈으로 구분)</label><textarea class="mrm-ta" id="mrmOpts" placeholder="예:\n스마트키\n후방카메라\n열선시트"></textarea></div>'
      +'<div class="mrm-actions"><button class="mrm-save" id="mrmSave">저장</button><button class="mrm-del" id="mrmDel">삭제</button></div>'
      +'</div>';
    document.body.appendChild(m);
    m.addEventListener('click',function(e){ if(e.target===m) mrCloseEdit(); });
    document.getElementById('mrmFile').addEventListener('change',onPickImg);
    document.getElementById('mrmSave').addEventListener('click',saveEdit);
    document.getElementById('mrmDel').addEventListener('click',delCar);
  }

  var EDIT={col:null,id:null,img:''};

  function onPickImg(e){
    var f=e.target.files&&e.target.files[0]; if(!f) return;
    var rd=new FileReader();
    rd.onload=function(){
      var im=new Image();
      im.onload=function(){
        var max=860, w=im.width, h=im.height;
        if(w>max||h>max){ if(w>h){ h=Math.round(h*max/w); w=max; } else { w=Math.round(w*max/h); h=max; } }
        var cv=document.createElement('canvas'); cv.width=w; cv.height=h;
        cv.getContext('2d').drawImage(im,0,0,w,h);
        var data=cv.toDataURL('image/jpeg',0.82);
        EDIT.img=data; document.getElementById('mrmImg').src=data;
      };
      im.src=rd.result;
    };
    rd.readAsDataURL(f);
  }

  window.mrOpenEdit=function(col,id){
    buildModal();
    var isNew=!id;
    EDIT={col:col,id:id,img:''};
    var d = isNew?{}:(findCar(col,id)||{});
    EDIT.img=d.img||'';
    document.getElementById('mrmTtl').textContent=isNew?'차량 추가':'차량 수정';
    document.getElementById('mrmGradeWrap').style.display=isNew?'':'none';
    document.getElementById('mrmGrade').value = (col==='bl_cars')?'bl_cars':'cars';
    document.getElementById('mrmImg').src=d.img||'';
    document.getElementById('mrmImg').style.visibility=d.img?'visible':'hidden';
    document.getElementById('mrmName').value=d.name||'';
    document.getElementById('mrmFuel').value=d.fuel||'';
    document.getElementById('mrmMonthlyKm').value=(d.monthlyKm!=null?d.monthlyKm:'');
    document.getElementById('mrmKmRate').value=(d.kmRate!=null?d.kmRate:'');
    var plans=d.monthlyPlans||{};
    MR_PERIODS.forEach(function(p){
      var pl=plans[String(p)]||{};
      var pe=document.querySelector('.mrm-pp[data-p="'+p+'"]'); if(pe) pe.value=(pl.price!=null&&pl.price!==''&&pl.price!==0)?pl.price:'';
      var de=document.querySelector('.mrm-pd[data-p="'+p+'"]'); if(de) de.value=(pl.discount!=null&&pl.discount!==''&&pl.discount!==0)?pl.discount:'';
    });
    document.getElementById('mrmOpts').value=d.options||'';
    document.getElementById('mrmDel').style.display=isNew?'none':'';
    document.getElementById('mrModal').classList.add('open');
  };
  window.mrCloseEdit=function(){ var m=document.getElementById('mrModal'); if(m) m.classList.remove('open'); };

  function saveEdit(){
    if(!ready()){ T('연결 대기 중'); return; }
    var FN=window.FB_FN, db=window.FB_DB;
    var name=(document.getElementById('mrmName').value||'').trim();
    if(!name){ T('차량명을 입력하세요'); return; }
    var payload={
      name:name,
      fuel:(document.getElementById('mrmFuel').value||'').trim(),
      monthlyKm:intv(document.getElementById('mrmMonthlyKm').value),
      kmRate:intv(document.getElementById('mrmKmRate').value),
      monthlyPlans:gatherPlans(),
      options:document.getElementById('mrmOpts').value||'',
      img:EDIT.img||''
    };
    if(EDIT.id){
      FN.setDoc(FN.doc(db,EDIT.col,EDIT.id), payload, {merge:true})
        .then(function(){ T('수정 저장됨 — 고객 앱에 반영됩니다'); mrCloseEdit(); })
        .catch(function(e){ console.error('[월렌트] 수정 실패',e); T('저장 실패 — 권한 확인'); });
    } else {
      var col=document.getElementById('mrmGrade').value||'cars';
      var bl=(col==='bl_cars');
      var newId=Date.now();
      payload.id=newId; payload.status='available'; payload.isBlackLabel=bl;
      payload.grade=bl?'블랙':'일반';
      payload.lat=37.4486; payload.lng=126.7053; payload.region='구월동'; /* 기본 위치(구월동) */
      FN.setDoc(FN.doc(db,col,String(newId)), payload, {merge:true})
        .then(function(){ T('차량 추가됨 — 고객 앱에 반영됩니다'); mrCloseEdit(); })
        .catch(function(e){ console.error('[월렌트] 추가 실패',e); T('추가 실패 — 권한 확인'); });
    }
  }

  function delCar(){
    if(!EDIT.id){ mrCloseEdit(); return; }
    if(!ready()){ T('연결 대기 중'); return; }
    if(!window.confirm('이 차량을 삭제할까요? 고객 앱에서도 사라집니다.')) return;
    var FN=window.FB_FN, db=window.FB_DB;
    FN.deleteDoc(FN.doc(db,EDIT.col,EDIT.id))
      .then(function(){ T('차량 삭제됨'); mrCloseEdit(); })
      .catch(function(e){ console.error('[월렌트] 삭제 실패',e); T('삭제 실패 — 권한 확인'); });
  }

  /* ── 실시간 연결 ── */
  function start(){
    mount();
    if(!ready()){ render(); return false; }
    var FN=window.FB_FN, db=window.FB_DB;
    try{
      FN.onSnapshot(FN.collection(db,'cars'), function(snap){
        carsArr=[]; snap.forEach(function(doc){ carsArr.push({id:doc.id, d:doc.data()||{}}); });
        carsArr.sort(function(x,y){ return (x.d.name||'').localeCompare(y.d.name||''); });
        render();
      }, function(e){ console.warn('[월렌트] cars 오류',e); });
      FN.onSnapshot(FN.collection(db,'bl_cars'), function(snap){
        blArr=[]; snap.forEach(function(doc){ blArr.push({id:doc.id, d:doc.data()||{}}); });
        blArr.sort(function(x,y){ return (x.d.name||'').localeCompare(y.d.name||''); });
        render();
      }, function(e){ console.warn('[월렌트] bl_cars 오류',e); });
    }catch(e){ console.warn('[월렌트] 리스너 오류',e); }
    return true;
  }
  if(!start()){ var t=setInterval(function(){ if(start()) clearInterval(t); },400); setTimeout(function(){clearInterval(t);},15000); }
  console.log('[월렌트] ✅ 관리자 월 렌트 탭 v2 (수정모달+추가/삭제+실시간)');
})();
