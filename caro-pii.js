/* ═══════════════════════════════════════════════════════════════
   caro-pii.js — 관제 화면 개인정보 보호 (v108.5, 2026-11-04)
   개인정보 보호법 · 개인정보의 안전성 확보조치 기준 · 개인정보 표시제한 보호조치에 맞춤
   ───────────────────────────────────────────────────────────────
   1) 가림 표시: 이름 홍*동 · 전화 010-****-1234 · 이메일 ab***@도메인 · 면허 12-**-******-**
   2) 원래 값 보기: [보기] → 열람 사유 선택 → 서버(staffRevealPii)가 사유·열람자·시각을 기록한 뒤 1건만 돌려줌
      → 60초 뒤 다시 가림. 면허번호·생년월일은 최고관리자만.
   3) 화면 워터마크(로그인 계정·시각) · 인쇄 차단 → 화면 촬영·출력 유출 억제
   4) 관제 로그인 기록(staffAudit) · 최고관리자용 '개인정보 접근기록' 조회 (설정 탭)
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.caroPii) return;
  var inFrame = false; try{ inFrame = (window.self !== window.top); }catch(e){ inFrame = true; }

  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function name(s){ s = String(s || '').trim(); if(!s) return ''; if(/[*]/.test(s)) return s; var a = Array.from(s); if(a.length <= 1) return '*'; if(a.length === 2) return a[0] + '*'; return a[0] + new Array(a.length - 1).join('*') + a[a.length - 1]; }
  function phone(s){ var d = String(s || '').replace(/[^0-9]/g, '').replace(/^82(?=1)/, '0'); if(String(s || '').indexOf('*') >= 0) return String(s); if(d.length < 8) return d ? '***' : ''; return d.slice(0, 3) + '-****-' + d.slice(-4); }
  function email(s){ s = String(s || '').trim(); if(s.indexOf('*') >= 0) return s; var i = s.indexOf('@'); if(i < 0) return s ? s.slice(0, 2) + '***' : ''; return s.slice(0, Math.min(2, i)) + '***' + s.slice(i); }
  function lic(s){ var d = String(s || '').replace(/[^0-9]/g, ''); if(!d) return ''; return d.slice(0, 2) + '-**-******-**'; }
  function nameEmail(n, e){ return name(n) + (e ? ' (' + email(e) + ')' : ''); }

  /* ── 가린 값 + [보기] 버튼 HTML ── target: {uid} 또는 {col,id} · kind: phone | name | email | contact(이름+전화) */
  var cache = {};   /* 열어 본 값은 60초 동안 화면이 다시 그려져도 그대로 보이게 */
  function key(t, kind){ return (t.uid ? 'u:' + t.uid : 'd:' + t.col + '/' + t.id) + '|' + kind; }
  function span(kind, raw, target, opts){
    opts = opts || {};
    var t0 = target || {};
    if(t0.uid || (t0.col && t0.id)){ var c = cache[key(t0, kind)]; if(c && c.until > Date.now()) return '<span class="pii pii-open"><span class="pii-v">' + c.html + '</span></span>'; }
    var shown = (kind === 'phone' || kind === 'other') ? phone(raw) : kind === 'email' ? email(raw) : kind === 'license' ? lic(raw) : name(raw);
    if(!raw && kind !== 'contact') return opts.empty != null ? opts.empty : '';
    var t = target || {}; var attrs = ' data-pii-kind="' + esc(kind) + '"' + (t.uid ? ' data-pii-uid="' + esc(t.uid) + '"' : '') + (t.col ? ' data-pii-col="' + esc(t.col) + '" data-pii-id="' + esc(t.id) + '"' : '');
    var canReveal = !!(t.uid || (t.col && t.id));
    return '<span class="pii"' + attrs + '><span class="pii-v">' + esc(opts.label != null ? opts.label : shown) + '</span>'
      + (canReveal ? '<button type="button" class="pii-rv" title="원래 값 보기 (열람 기록이 남습니다)">보기</button>' : '') + '</span>';
  }

  /* ── 열람 사유 선택 창 ── */
  var REASONS = ['고객 연락(반납·사고·지연)', '예약·결제 확인', '미납·청구 안내', '고객 요청 처리', '법령·수사기관 요청'];
  var dlg = null;
  function askReason(what){
    return new Promise(function(resolve){
      if(!dlg){
        dlg = document.createElement('div'); dlg.setAttribute('data-caro-dialog', '1');
        dlg.setAttribute('style', 'position:fixed;inset:0;z-index:2147483001;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:16px;');
        document.body.appendChild(dlg);
      }
      var box = '<div style="max-width:420px;width:92vw;background:#1e2026;color:#eee;border:1px solid #3a3d46;border-radius:14px;padding:18px;font:14px -apple-system,\'Noto Sans KR\',\'Malgun Gothic\',sans-serif;">'
        + '<div style="font-weight:800;font-size:15px;margin-bottom:6px">🔒 개인정보 열람</div>'
        + '<div style="font-size:12.5px;color:#aab;line-height:1.55;margin-bottom:12px">' + esc(what) + '의 원래 값을 봅니다. 열람자·시각·사유가 기록되며 최고관리자가 확인합니다. 업무에 필요한 경우에만 여세요.</div>'
        + REASONS.map(function(r, i){ return '<button type="button" data-r="' + i + '" style="display:block;width:100%;text-align:left;margin:0 0 6px;padding:9px 12px;border-radius:9px;border:1px solid #3a3d46;background:#262931;color:#eee;cursor:pointer;font:inherit">' + esc(r) + '</button>'; }).join('')
        + '<input id="piiEtc" placeholder="기타 사유 직접 입력" maxlength="60" style="width:100%;box-sizing:border-box;margin:4px 0 12px;padding:9px 11px;border-radius:9px;border:1px solid #3a3d46;background:#15161a;color:#fff;font:inherit">'
        + '<div style="display:flex;justify-content:flex-end;gap:8px"><button type="button" data-x="1" style="padding:8px 14px;border-radius:9px;border:1px solid #555;background:none;color:#ccc;cursor:pointer;font:inherit">취소</button>'
        + '<button type="button" data-etc="1" style="padding:8px 14px;border-radius:9px;border:0;background:#c8a96e;color:#15161a;font-weight:700;cursor:pointer;font:inherit">기타 사유로 열람</button></div></div>';
      dlg.innerHTML = box; dlg.style.display = 'flex';
      var done = function(v){ dlg.style.display = 'none'; dlg.innerHTML = ''; document.removeEventListener('keydown', key, true); resolve(v); };
      var key = function(e){ if(e.key === 'Escape'){ e.preventDefault(); done(null); } };
      document.addEventListener('keydown', key, true);
      dlg.onclick = function(e){
        var b = e.target.closest ? e.target.closest('button') : null;
        if(e.target === dlg || (b && b.getAttribute('data-x'))) return done(null);
        if(!b) return;
        if(b.hasAttribute('data-r')) return done(REASONS[Number(b.getAttribute('data-r'))]);
        if(b.getAttribute('data-etc')){ var v = (dlg.querySelector('#piiEtc').value || '').trim(); if(v.length < 2){ dlg.querySelector('#piiEtc').focus(); return; } done('기타: ' + v); }
      };
    });
  }

  function toast(m){ try{ if(window.toast) return window.toast(m); }catch(e){} try{ console.log(m); }catch(e){} }

  /* 원래 값 받아오기 */
  function reveal(target, fields, what){
    if(typeof window.FB_CALL !== 'function') return Promise.reject(new Error('서버에 연결할 수 없습니다'));
    return askReason(what || '고객 정보').then(function(reason){
      if(!reason) return null;
      var data = { fields: fields, reason: reason };
      if(target.uid) data.uid = target.uid; else { data.col = target.col; data.id = target.id; }
      return window.FB_CALL('staffRevealPii', data).then(function(r){ return (r && r.values) || {}; });
    });
  }

  /* 화면의 [보기] 버튼 처리 (모든 모듈 공통, 이벤트 위임) */
  document.addEventListener('click', function(e){
    var b = e.target && e.target.closest ? e.target.closest('.pii-rv') : null;
    if(!b) return;
    e.preventDefault(); e.stopPropagation();
    var sp = b.closest('.pii'); if(!sp) return;
    var kind = sp.getAttribute('data-pii-kind');
    var target = sp.getAttribute('data-pii-uid') ? { uid: sp.getAttribute('data-pii-uid') } : { col: sp.getAttribute('data-pii-col'), id: sp.getAttribute('data-pii-id') };
    var fields = kind === 'contact' || kind === 'phone' ? ['name', 'phone'] : kind === 'other' ? ['other'] : kind === 'license' ? ['license'] : kind === 'email' ? ['email'] : ['name'];
    b.disabled = true;
    reveal(target, fields, kind === 'license' ? '운전면허번호' : '연락처').then(function(v){
      b.disabled = false; if(!v) return;
      var vv = sp.querySelector('.pii-v'); var old = vv.innerHTML;
      var html = '';
      if(kind === 'phone' || kind === 'contact' || kind === 'other'){
        var pv = kind === 'other' ? v.other : v.phone, d = String(pv || '').replace(/[^0-9+]/g, '');
        html = (kind === 'contact' && v.name ? esc(v.name) + ' ' : '') + (d ? '<a href="tel:' + esc(d) + '" style="color:inherit;font-weight:700">' + esc(pv) + '</a>' : '(연락처 없음)');
      } else html = esc(v[fields[0]] || '(없음)');
      cache[key(target, kind)] = { html: html, until: Date.now() + 60000 };
      vv.innerHTML = html + ' <small style="opacity:.6">· 60초 후 가림</small>'; b.style.display = 'none';
      setTimeout(function(){ if(document.body.contains(vv)){ vv.innerHTML = old; b.style.display = ''; } }, 60000);
    }).catch(function(err){
      b.disabled = false;
      var m = (err && err.message) || ''; var c = String((err && err.code) || '');
      toast(/not-found/.test(c) && !/회원|문서/.test(m) ? '서버 업데이트(firebase deploy) 후 사용할 수 있습니다' : ('열람 실패 — ' + (m || c)));
    });
  }, true);

  /* ── 공통 스타일 · 인쇄 차단 ── */
  var st = document.createElement('style');
  st.textContent = '.pii{white-space:nowrap}.pii-rv{margin-left:6px;padding:1px 7px;font-size:11px;border-radius:7px;border:1px solid rgba(200,169,110,.55);background:none;color:#c8a96e;cursor:pointer;vertical-align:1px}'
    + '.pii-rv:disabled{opacity:.5}'
    + '@media print{body *{visibility:hidden!important}body:before{visibility:visible!important;content:"개인정보 보호를 위해 관제 화면은 인쇄할 수 없습니다";display:block;padding:40px;font-size:18px}}';
  (document.head || document.documentElement).appendChild(st);

  /* ── 워터마크 (바깥 창만 — 안쪽 운영관리 화면도 덮는다) ── */
  function who(){ try{ return (window.FB_AUTH && window.FB_AUTH.currentUser && window.FB_AUTH.currentUser.email) || ''; }catch(e){ return ''; } }
  var wm = null;
  function paintWm(){
    if(inFrame) return;
    var em = who();
    if(!em){ if(wm){ wm.remove(); wm = null; } return; }
    var d = new Date(), p = function(n){ return n < 10 ? '0' + n : n; };
    var txt = em + '  ' + d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="220"><text x="10" y="120" transform="rotate(-22 210 110)" font-family="sans-serif" font-size="15" fill="#888">' + esc(txt) + '</text></svg>';
    if(!wm){ wm = document.createElement('div'); wm.id = 'caroWm'; wm.setAttribute('aria-hidden', 'true');
      wm.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;z-index:2147482000;opacity:.07;'); document.body.appendChild(wm); }
    wm.style.backgroundImage = 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  /* ── 관제 로그인 기록 (창마다 1번) ── */
  function audit(){
    if(inFrame) return;
    var em = who(); if(!em || typeof window.FB_CALL !== 'function') return;
    var P = window.caroPerms; if(!P || !P.ready) return;
    var k = 'caro_audit_' + em; try{ if(sessionStorage.getItem(k)) return; sessionStorage.setItem(k, '1'); }catch(e){}
    window.FB_CALL('staffAudit', { kind: 'login', page: location.pathname.split('/').pop() }).catch(function(){ try{ sessionStorage.removeItem(k); }catch(e){} });
  }
  setInterval(function(){ paintWm(); audit(); }, 3000);

  /* ── 최고관리자: 개인정보 접근기록 (설정 탭) ── */
  var KIND = { reveal: '원래 값 열람', list: '회원 목록 조회', search: '회원 검색', login: '관제 로그인', export: '목록 내보내기', blocked: '열람 차단(한도 초과)' };
  function fmtT(x){ var t = x.atMs || (x.at && x.at.toMillis && x.at.toMillis()) || 0; if(!t) return ''; var d = new Date(t), p = function(n){ return n < 10 ? '0' + n : n; }; return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function logCard(){
    if(inFrame && !document.getElementById('tab-set')) return;
    var P = window.caroPerms; var set = document.getElementById('tab-set');
    if(!set || !P || !P.super || document.getElementById('piiLogCard')) return;
    var card = document.createElement('div'); card.className = 'card'; card.id = 'piiLogCard'; card.style.marginTop = '14px';
    card.innerHTML = '<div class="card-hd" style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--border)"><b>🔒 개인정보 접근기록</b>'
      + '<span style="display:flex;gap:6px"><input id="piiLogQ" placeholder="직원 이메일로 거르기" style="padding:6px 10px;border-radius:8px;border:1px solid var(--border);background:var(--panel2);color:var(--txt);font-size:12px">'
      + '<button class="btn" id="piiLogLoad" style="padding:6px 12px;font-size:12px">불러오기</button></span></div>'
      + '<div style="padding:10px 18px;font-size:12px;color:var(--muted);line-height:1.6">직원이 회원 정보를 조회·열람한 기록입니다(최근 300건). 법령에 따라 <b>월 1회 이상</b> 확인하고, 업무와 무관한 열람이 보이면 해당 직원 계정을 정지하세요. 기록은 2년 이상 보관되며 누구도 고치거나 지울 수 없습니다.</div>'
      + '<div id="piiLogBody" style="padding:0 18px 16px;max-height:420px;overflow:auto;font-size:12.5px"></div>';
    var host = set.querySelector('.grid') || set; host.appendChild(card);
    card.querySelector('#piiLogLoad').onclick = loadLogs;
  }
  function loadLogs(){
    var FN = window.FB_FN, db = window.FB_DB, body = document.getElementById('piiLogBody'); if(!FN || !db || !body) return;
    body.textContent = '불러오는 중…';
    var q = (document.getElementById('piiLogQ').value || '').trim().toLowerCase();
    FN.getDocs(FN.query(FN.collection(db, 'pii_access_logs'), FN.orderBy('atMs', 'desc'), FN.limit(300))).then(function(s){
      var rows = []; s.forEach(function(d){ var x = d.data() || {}; if(q && String(x.by || '').toLowerCase().indexOf(q) < 0) return; rows.push(x); });
      var month = {}; rows.forEach(function(x){ if(x.kind === 'reveal') month[x.by] = (month[x.by] || 0) + 1; });
      var sum = Object.keys(month).map(function(k){ return esc(k) + ' ' + month[k] + '건'; }).join(' · ');
      body.innerHTML = (sum ? '<div style="margin:4px 0 10px;color:var(--gold,#c8a96e)">원래 값 열람: ' + sum + '</div>' : '')
        + (rows.length ? '<table style="width:100%;border-collapse:collapse">' + rows.map(function(x){
          return '<tr style="border-bottom:1px solid var(--border)"><td style="padding:6px 4px;white-space:nowrap;color:var(--muted)">' + fmtT(x) + '</td><td style="padding:6px 4px">' + esc(x.by || '') + '</td>'
            + '<td style="padding:6px 4px;' + (x.kind === 'blocked' ? 'color:#ff8f85;font-weight:700' : '') + '">' + esc(KIND[x.kind] || x.kind) + (x.mfa === false && x.kind === 'login' ? ' <span style="color:#ff8f85">(2단계 미사용)</span>' : '') + '</td>'
            + '<td style="padding:6px 4px;color:var(--muted)">' + esc([x.targetName, (x.fields || []).join('·'), x.reason, x.q, x.count != null && x.kind !== 'reveal' ? x.count + '건' : '', x.ip].filter(Boolean).join(' · ')) + '</td></tr>';
        }).join('') + '</table>' : '기록이 없습니다.');
    }).catch(function(e){ body.textContent = '불러오기 실패 — ' + ((e && e.code) || '') + ' (규칙 20차 게시 필요)'; });
  }
  document.addEventListener('caro-perms', function(){ setTimeout(logCard, 300); });
  setTimeout(logCard, 3000);

  window.caroPii = { name: name, phone: phone, email: email, lic: lic, nameEmail: nameEmail, span: span, reveal: reveal, esc: esc };
})();
