/* ═══════════════════════════════════════════════════════════════
   caro-mfa.js — 2단계 인증(TOTP · 인증앱) 처리 (2026-09, 14차 보안)
   ───────────────────────────────────────────────────────────────
   왜: 비밀번호 하나만 알면 어느 기기에서든 시동차단·문열기 명령을 보낼 수 있었다.
   무엇:
     ① 로그인 창구 하나(FB_FN.signInWithEmailAndPassword)를 감싸서, 서버가 '2단계 인증 필요' 라고
        답하면 6자리 코드 창을 띄우고 통과해야 로그인이 끝나게 한다.
        → 관제 로그인·자동잠금 해제·운영관리·고객앱의 관리자 로그인 전부 같은 창구라 한 번에 적용된다.
     ② 🔐 2단계 인증 설정 창 — 인증앱(구글 OTP·Microsoft Authenticator 등)을 QR 로 등록/해제.
   ★이 파일은 '코드 입력 창'까지다. 실제로 켜는 순서(콘솔 → 등록 → 규칙)는 읽어보세요.txt 를 따를 것.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var Z = 2147483647;
  var FN = function(){ return window.FB_FN || {}; };
  function mk(tag, css, txt){ var e = document.createElement(tag); if(css) e.style.cssText = css; if(txt != null) e.textContent = txt; return e; }
  function fail(code, msg){ var e = new Error(msg || code); e.code = code; return e; }

  var BOX = 'width:min(380px,100%);max-height:92vh;overflow:auto;background:#17181c;border:1px solid #33363e;border-radius:14px;padding:22px;color:#e8e8ea;text-align:center;box-sizing:border-box;';
  var BTN = 'padding:11px 16px;border-radius:10px;border:0;font-size:14px;font-weight:700;cursor:pointer;';
  var GOLD = BTN + 'background:#c9a227;color:#15161a;';
  var GRAY = BTN + 'background:#2a2d34;color:#e8e8ea;';
  var INPUT = 'width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1px solid #3a3d45;background:#1a1c21;color:#fff;font-size:20px;letter-spacing:6px;text-align:center;margin:10px 0;';

  function overlay(){
    var o = mk('div', 'position:fixed;inset:0;z-index:' + Z + ';display:flex;align-items:center;justify-content:center;background:rgba(8,9,11,.92);padding:18px;font-family:-apple-system,"Noto Sans KR","Malgun Gothic",sans-serif;');
    o.setAttribute('role', 'dialog'); o.setAttribute('aria-modal', 'true');
    var b = mk('div', BOX); o.appendChild(b); document.body.appendChild(o);
    return { root: o, box: b, close: function(){ if(o.parentNode) o.parentNode.removeChild(o); } };
  }
  function digits(input){ input.addEventListener('input', function(){ input.value = input.value.replace(/\D/g, '').slice(0, 6); }); }

  function msgOf(e){
    var c = (e && e.code) || '';
    if(/invalid-verification-code|code-expired/.test(c)) return '코드가 맞지 않습니다. 앱에 지금 떠 있는 6자리를 다시 입력하세요.';
    if(/requires-recent-login/.test(c)) return '보안을 위해 다시 로그인이 필요합니다. 로그아웃 → 다시 로그인한 뒤 등록하세요.';
    if(/unverified-email/.test(c)) return '이메일 인증이 먼저 필요합니다.';
    if(/operation-not-allowed|admin-restricted|second-factor-limit|unsupported-first-factor/.test(c)) return '서버에서 2단계 인증(인증앱)이 아직 켜져 있지 않습니다. (콘솔 설정 필요)';
    if(/network/.test(c)) return '네트워크 오류 — 인터넷을 확인하세요.';
    if(/too-many/.test(c)) return '시도가 너무 잦습니다 — 잠시 후 다시.';
    return '오류가 발생했습니다' + (c ? ' (' + c + ')' : '');
  }

  /* ── 6자리 코드 창: verify(code) 가 성공하면 그 결과로 풀리고, 취소하면 mfa-cancelled 로 거절 ── */
  function promptCode(verify, title){
    return new Promise(function(res, rej){
      var ov = overlay(), tries = 0, lockUntil = 0;
      ov.box.appendChild(mk('div', 'font-size:19px;font-weight:700;margin-bottom:6px;', '🔐 ' + (title || '2단계 인증')));
      ov.box.appendChild(mk('div', 'font-size:13px;color:#9aa0ab;line-height:1.5;', '인증 앱(구글 OTP 등)에 떠 있는 6자리 숫자를 입력하세요.'));
      var inp = mk('input', INPUT); inp.type = 'text'; inp.inputMode = 'numeric'; inp.autocomplete = 'one-time-code'; inp.placeholder = '000000'; inp.id = 'caroMfaCode';
      digits(inp); ov.box.appendChild(inp);
      var err = mk('div', 'min-height:18px;font-size:12px;color:#ff7a68;margin-bottom:10px;'); err.id = 'caroMfaErr'; ov.box.appendChild(err);
      var row = mk('div', 'display:flex;gap:8px;justify-content:center;');
      var ok = mk('button', GOLD, '확인'); ok.type = 'button'; ok.id = 'caroMfaOk';
      var no = mk('button', GRAY, '취소'); no.type = 'button';
      row.appendChild(ok); row.appendChild(no); ov.box.appendChild(row);
      function go(){
        if(Date.now() < lockUntil){ err.textContent = Math.ceil((lockUntil - Date.now()) / 1000) + '초 뒤에 다시 시도하세요'; return; }
        if(inp.value.length !== 6){ err.textContent = '6자리를 입력하세요'; return; }
        ok.disabled = true; err.textContent = '확인 중…';
        Promise.resolve().then(function(){ return verify(inp.value); }).then(function(r){ ov.close(); res(r); }).catch(function(e){
          ok.disabled = false; inp.value = ''; tries++;
          err.textContent = msgOf(e);
          if(tries >= 5){ lockUntil = Date.now() + 30000; tries = 0; err.textContent = '5회 실패 — 30초 뒤에 다시 시도하세요'; }
          inp.focus();
        });
      }
      ok.addEventListener('click', go);
      inp.addEventListener('keydown', function(e){ if(e.key === 'Enter') go(); });
      no.addEventListener('click', function(){ ov.close(); rej(fail('auth/mfa-cancelled', '2단계 인증을 취소했습니다')); });
      setTimeout(function(){ inp.focus(); }, 50);
    });
  }

  /* ── ① 로그인 창구 감싸기 ── */
  function resolveSignIn(auth, e){
    var f = FN();
    if(typeof f.getMultiFactorResolver !== 'function' || !f.TotpMultiFactorGenerator) throw fail('auth/mfa-unsupported', '이 화면은 2단계 인증을 지원하지 않는 버전입니다');
    var resolver = f.getMultiFactorResolver(auth, e);
    var hint = (resolver.hints || []).filter(function(h){ return h.factorId === 'totp'; })[0];
    if(!hint) throw fail('auth/mfa-unsupported-factor', '등록된 인증 방식이 인증앱이 아닙니다');
    return promptCode(function(code){
      return resolver.resolveSignIn(f.TotpMultiFactorGenerator.assertionForSignIn(hint.uid, code));
    });
  }
  function wrap(){
    var f = window.FB_FN;
    if(!f || typeof f.signInWithEmailAndPassword !== 'function') return false;
    if(f.__mfaWrapped) return true;
    var raw = f.signInWithEmailAndPassword;
    f.signInWithEmailAndPassword = function(auth, email, pw){
      return raw.call(f, auth, email, pw).catch(function(e){
        if(e && e.code === 'auth/multi-factor-auth-required') return resolveSignIn(auth, e);
        throw e;
      });
    };
    f.__mfaWrapped = true; return true;
  }
  /* 다른 스크립트(로그인 기록용 감싸기)보다 먼저 감싸야 하므로 짧은 간격으로 확인 */
  if(!wrap()){ var n = 0, iv = setInterval(function(){ if(wrap() || ++n > 400) clearInterval(iv); }, 25); }

  /* ── ② 설정 창 ── */
  function needApi(){ var f = FN(); return typeof f.multiFactor === 'function' && f.TotpMultiFactorGenerator; }

  function openSetup(){
    var A = window.FB_AUTH, user = A && A.currentUser;
    var ov = overlay();
    function head(t){ ov.box.appendChild(mk('div', 'font-size:19px;font-weight:700;margin-bottom:8px;', t)); }
    function line(t, c){ ov.box.appendChild(mk('div', 'font-size:13px;color:' + (c || '#9aa0ab') + ';line-height:1.55;margin:6px 0;', t)); }
    function status(t, c){ var s = ov.box.querySelector('#caroMfaStatus'); if(!s){ s = mk('div', 'min-height:18px;font-size:12px;margin:8px 0;'); s.id = 'caroMfaStatus'; ov.box.appendChild(s); } s.style.color = c || '#ff7a68'; s.textContent = t; }
    function btn(t, style, fn){ var b = mk('button', style, t); b.type = 'button'; b.style.margin = '4px'; b.addEventListener('click', fn); ov.box.appendChild(b); return b; }
    function clear(){ while(ov.box.firstChild) ov.box.removeChild(ov.box.firstChild); }

    function render(){
      clear(); head('🔐 2단계 인증 설정');
      if(!user){ line('로그인한 뒤에 설정할 수 있습니다.'); btn('닫기', GRAY, ov.close); return; }
      if(!needApi()){ line('이 화면 버전은 2단계 인증을 지원하지 않습니다. 최신 파일로 교체하세요.', '#ff7a68'); btn('닫기', GRAY, ov.close); return; }
      line(user.email, '#c9a227');
      var mf = FN().multiFactor(user), fs = mf.enrolledFactors || [];
      if(fs.length){
        line('✅ 2단계 인증이 켜져 있습니다. (' + fs.map(function(x){ return x.displayName || '인증앱'; }).join(', ') + ')', '#4db183');
        line('로그인할 때마다 인증 앱의 6자리를 입력해야 합니다.');
        btn('등록 해제', GRAY, function(){
          if(!confirm('2단계 인증을 해제할까요?\n해제하면 비밀번호만으로 로그인됩니다.')) return;
          Promise.resolve(mf.unenroll(fs[0])).then(render).catch(function(e){ status(msgOf(e)); });
        });
        btn('닫기', GOLD, ov.close);
        return;
      }
      line('아직 등록되지 않았습니다. 등록하면 비밀번호가 유출돼도 다른 기기에서는 로그인할 수 없습니다.');
      if(!user.emailVerified){
        line('먼저 이메일 인증이 필요합니다. (2단계 인증 등록의 서버 조건)', '#e6c34b');
        btn('인증 메일 보내기', GOLD, function(){
          if(typeof FN().sendEmailVerification !== 'function'){ status('이 버전은 인증 메일 보내기를 지원하지 않습니다'); return; }
          Promise.resolve(FN().sendEmailVerification(user)).then(function(){ status('메일을 보냈습니다. 메일의 링크를 누른 뒤 "다시 확인"을 누르세요. (스팸함도 확인)', '#4db183'); }).catch(function(e){ status(msgOf(e)); });
        });
        btn('다시 확인', GRAY, function(){ Promise.resolve(user.reload()).then(function(){ user = A.currentUser; render(); }).catch(function(e){ status(msgOf(e)); }); });
        btn('닫기', GRAY, ov.close);
        return;
      }
      btn('등록 시작', GOLD, start); btn('닫기', GRAY, ov.close);
    }

    function start(){
      var f = FN(), mf = f.multiFactor(user);
      clear(); head('🔐 인증 앱 등록'); line('잠시만요…');
      mf.getSession().then(function(sess){ return f.TotpMultiFactorGenerator.generateSecret(sess); }).then(function(secret){
        clear(); head('🔐 인증 앱 등록');
        line('① 휴대폰에 인증 앱(구글 OTP · Microsoft Authenticator 등)을 설치하고 아래 QR 을 스캔하세요.');
        var box = mk('div', 'background:#fff;border-radius:10px;padding:10px;display:inline-block;margin:6px 0;');
        try{
          var qr = window.qrcode(0, 'M'); /* QR 은 ASCII 만 안전하다(한글·공백은 인증 앱이 못 읽거나 잘림) → 발급자는 영문, 나머지도 퍼센트 인코딩 */
          var url = String(secret.generateQrCodeUrl(user.email, 'CARO-Control')).replace(/[^\x21-\x7e]/g, function(c){ return encodeURIComponent(c); });
          qr.addData(url); qr.make();
          var img = mk('img', 'display:block;width:200px;height:200px;image-rendering:pixelated;'); img.alt = 'QR'; img.src = qr.createDataURL(6, 0); box.appendChild(img);
        }catch(e){ box.appendChild(mk('div', 'color:#333;font-size:12px;', 'QR 을 그리지 못했습니다 — 아래 키를 앱에 직접 입력하세요')); }
        ov.box.appendChild(box);
        line('QR 이 안 되면 앱에서 "키 직접 입력" 후 아래 키를 넣으세요:');
        var key = mk('div', 'font-family:monospace;font-size:13px;word-break:break-all;background:#1a1c21;border:1px solid #3a3d45;border-radius:8px;padding:8px;margin:4px 0;', secret.secretKey); ov.box.appendChild(key);
        line('② 앱에 뜬 6자리를 입력하세요.');
        var inp = mk('input', INPUT); inp.type = 'text'; inp.inputMode = 'numeric'; inp.placeholder = '000000'; inp.id = 'caroMfaEnrollCode'; digits(inp); ov.box.appendChild(inp);
        var go = btn('등록 완료', GOLD, function(){
          if(inp.value.length !== 6){ status('6자리를 입력하세요'); return; }
          go.disabled = true; status('확인 중…', '#9aa0ab');
          Promise.resolve(mf.enroll(f.TotpMultiFactorGenerator.assertionForEnrollment(secret, inp.value), '인증앱')).then(function(){
            clear(); head('✅ 등록되었습니다');
            line('★지금 "로그아웃" 후 다시 로그인하세요. 다음 로그인부터 6자리 코드를 묻습니다.', '#e6c34b');
            line('★휴대폰을 잃어버리면 로그인이 안 됩니다. 복구 방법은 읽어보세요.txt 를 확인해 두세요.', '#e6c34b');
            btn('확인', GOLD, ov.close);
          }).catch(function(e){ go.disabled = false; inp.value = ''; status(msgOf(e)); });
        });
        btn('취소', GRAY, function(){ render(); });
      }).catch(function(e){ clear(); head('🔐 인증 앱 등록'); line(msgOf(e), '#ff7a68'); btn('닫기', GRAY, ov.close); });
    }
    render();
  }

  /* ── 미등록 안내띠 (관제 화면에서만, 로그인 뒤 한 번, 닫을 수 있음) ── */
  function banner(){
    if(!document.getElementById('adm')) return;
    var n = 0, iv = setInterval(function(){
      n++; var A = window.FB_AUTH, u = A && A.currentUser;
      if(n > 240){ clearInterval(iv); return; }
      if(!u || !needApi()) return;
      clearInterval(iv);
      var fs = []; try{ fs = FN().multiFactor(u).enrolledFactors || []; }catch(e){}
      if(fs.length) return;
      var b = mk('div', 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:' + (Z - 2) + ';background:#3a2f12;border:1px solid #c9a227;color:#f3e2a6;border-radius:10px;padding:9px 14px;font-size:13px;display:flex;gap:10px;align-items:center;max-width:94vw;font-family:-apple-system,"Noto Sans KR","Malgun Gothic",sans-serif;');
      b.appendChild(mk('span', '', '🔐 2단계 인증이 꺼져 있습니다'));
      var go = mk('button', BTN + 'background:#c9a227;color:#15161a;padding:6px 12px;', '설정'); go.type = 'button'; go.addEventListener('click', function(){ openSetup(); });
      var x = mk('button', BTN + 'background:none;color:#f3e2a6;padding:6px 8px;', '✕'); x.type = 'button'; x.addEventListener('click', function(){ if(b.parentNode) b.parentNode.removeChild(b); });
      b.appendChild(go); b.appendChild(x); document.body.appendChild(b);
    }, 500);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner); else banner();

  window.CaroMFA = { openSetup: openSetup, promptCode: promptCode };
})();
