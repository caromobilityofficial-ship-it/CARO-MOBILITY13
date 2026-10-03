/* ═══════════════════════════════════════════════════════════════
   admin-charges.js — ★[24차] 추가 청구 등록 (과태료·하이패스·수리비·청소비·휴차료 등)
   · 서버 함수 staffCharge 가 정산 주문(orders)과 미납(unpaid_debts)을 만든다 → 고객 앱 미납 바에 뜨고 토스로 결제
   · 예약 상세(관리 모달)·회원 탭·미납 탭 어디서든 window.caroOpenCharge({uid|bookNo, name}) 로 연다
   · 미납 탭에서 '청구 취소(void)' 도 서버 함수로
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var KINDS=[['fine','과태료·범칙금'],['toll','하이패스·통행료'],['repair','수리비'],['cleaning','청소비'],['idle','휴차료'],['fuel','연료·충전비'],['penalty','패널티'],['other','기타']];
  function esc(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }
  function notify(m){ try{ if(window.toast) return toast(m); }catch(e){} alert(m); }
  var ov=null;
  function build(){
    if(ov) return ov;
    var st=document.createElement('style');
    st.textContent='.ch-ov{position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:9998;display:none;align-items:center;justify-content:center;padding:16px;} .ch-ov.on{display:flex;}'
      +'.ch-box{width:100%;max-width:440px;background:var(--panel,#17191d);border:1px solid var(--border,#2b2e34);border-radius:16px;padding:18px;color:var(--txt,#ddd);}'
      +'.ch-box h3{margin:0 0 4px;font-size:16px;} .ch-box .sub{font-size:12px;color:var(--muted,#999);margin-bottom:12px;}'
      +'.ch-box label{display:block;font-size:12px;color:var(--muted,#999);margin:10px 0 4px;}'
      +'.ch-box input,.ch-box select,.ch-box textarea{width:100%;box-sizing:border-box;background:var(--panel2,#1f2228);border:1px solid var(--border,#333);color:var(--txt,#ddd);border-radius:10px;padding:9px 12px;font-size:13px;font-family:inherit;}'
      +'.ch-ft{display:flex;gap:8px;margin-top:14px;} .ch-ft button{flex:1;padding:10px;border-radius:10px;border:1px solid var(--border,#333);background:var(--panel2,#1f2228);color:var(--txt,#ddd);cursor:pointer;font-weight:700;}'
      +'.ch-ft button.go{background:var(--gold,#c8a96e);color:#18191c;border-color:var(--gold,#c8a96e);}';
    document.head.appendChild(st);
    ov=document.createElement('div'); ov.className='ch-ov';
    ov.innerHTML='<div class="ch-box"><h3>추가 청구 등록</h3><div class="sub" id="chWho">—</div>'
      +'<label>청구 종류</label><select id="chKind">'+KINDS.map(function(k){ return '<option value="'+k[0]+'">'+k[1]+'</option>'; }).join('')+'</select>'
      +'<label>금액(원)</label><input id="chAmt" type="number" min="1" step="100" placeholder="예: 40000">'
      +'<label>내용(고객 앱에 표시)</label><textarea id="chMemo" rows="2" placeholder="예: 9/30 인천대로 과속 과태료 (고지서 번호 …)"></textarea>'
      +'<div class="sub" style="margin-top:8px">등록하면 고객 앱 미납 목록에 바로 뜨고, 결제 전까지 새 예약이 막힙니다. 잘못 등록했으면 미납 탭에서 \'청구 취소\'.</div>'
      +'<div class="ch-ft"><button id="chCancel">닫기</button><button class="go" id="chGo">청구 등록</button></div></div>';
    document.body.appendChild(ov);
    ov.querySelector('#chCancel').onclick=function(){ ov.classList.remove('on'); };
    ov.addEventListener('click', function(e){ if(e.target===ov) ov.classList.remove('on'); });
    return ov;
  }
  var target=null;
  window.caroOpenCharge=function(t){
    target=t||{}; build();
    ov.querySelector('#chWho').textContent=(t.name?t.name+' ':'')+(t.email?'('+t.email+') ':'')+(t.bookNo?'· 예약 '+t.bookNo:'');
    ov.querySelector('#chAmt').value=''; ov.querySelector('#chMemo').value='';
    ov.classList.add('on');
    ov.querySelector('#chGo').onclick=submit;
  };
  function submit(){
    if(typeof window.FB_CALL!=='function'){ notify('서버 함수 연결이 준비되지 않았습니다'); return; }
    var kind=ov.querySelector('#chKind').value, amt=Math.round(Number(ov.querySelector('#chAmt').value)||0), memo=ov.querySelector('#chMemo').value.trim();
    if(!(amt>0)){ notify('금액을 입력해 주세요'); return; }
    if(!window.confirm((KINDS.find(function(k){return k[0]===kind;})||['','기타'])[1]+' '+amt.toLocaleString()+'원을 청구할까요?')) return;
    var btn=ov.querySelector('#chGo'); btn.disabled=true;
    var data={ kind:kind, amount:amt, memo:memo }; if(target.bookNo) data.bookNo=target.bookNo; else data.uid=target.uid;
    window.FB_CALL('staffCharge', data).then(function(r){ notify('청구 등록 완료 · '+(r&&r.amount||amt).toLocaleString()+'원 (고객 앱 미납에 표시됨)'); ov.classList.remove('on'); })
      .catch(function(e){ notify('등록 실패: '+((e&&e.message)||(e&&e.code)||e)); })
      .then(function(){ btn.disabled=false; });
  }
  window.caroVoidCharge=function(debtId){
    if(typeof window.FB_CALL!=='function'){ notify('서버 함수 연결이 준비되지 않았습니다'); return; }
    var reason=window.prompt('청구 취소 사유', '잘못 등록'); if(reason===null) return;
    window.FB_CALL('staffCharge',{ action:'void', debtId:debtId, reason:reason }).then(function(){ notify('청구를 취소했습니다'); }).catch(function(e){ notify('취소 실패: '+((e&&e.message)||(e&&e.code)||e)); });
  };

  /* 예약 관리 모달 하단에 '추가 청구' 버튼 */
  function injectResBtn(){
    var save=document.getElementById('rmSaveBtn'); if(!save) return false;
    var foot=save.parentNode; if(!foot||foot.querySelector('#rmChargeBtn')) return true;
    var b=document.createElement('button'); b.className='btn'; b.id='rmChargeBtn'; b.textContent='추가 청구';
    b.onclick=function(){ var no=(document.getElementById('rmNo')||{}).textContent||''; var who=(document.querySelector('#rmBody .rm-grid .v')||{}).textContent||''; window.caroOpenCharge({ bookNo:no.trim(), name:who.trim() }); };
    foot.insertBefore(b, save); return true;
  }
  var t=0, iv=setInterval(function(){ if(injectResBtn()||++t>60) clearInterval(iv); }, 500);
  console.log('[청구] ✅ 추가 청구 모듈 로드');
})();
