/* ═══════════════════════════════════════════════════════════════
   caro-secure-auth.js — 고객 앱 보안 (v109, 2026-11-05)
   ① 중요 작업 재인증: 면허 변경·탈퇴 전에 비밀번호를 다시 확인한다(서버도 10분 안의 로그인만 허용).
      카카오·네이버 등 비밀번호가 없는 계정은 "다시 로그인" 으로 확인.
   ② 장기 미사용 자동 로그아웃: 30일 동안 앱을 쓰지 않은 기기는 로그아웃된다(분실·양도된 폰 대비).
   ③ 서버 호출 도우미 caroCallSecure: 서버가 '재인증 필요' 를 돌려주면 재인증 후 한 번 다시 보낸다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.caroReauth) return;
  var IDLE_DAYS = 30, KEY = 'caro_last_active';
  function esc(s){ return String(s == null ? '' : s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function user(){ try{ return window.FB_AUTH && window.FB_AUTH.currentUser; }catch(e){ return null; } }
  function toast(m){ try{ if(window.showToast) return window.showToast(m); }catch(e){} try{ alert(m); }catch(e){} }
  function hasPassword(u){ try{ return (u.providerData || []).some(function(p){ return p && p.providerId === 'password'; }); }catch(e){ return false; } }

  /* 비밀번호 확인 창 */
  function askPassword(why){
    return new Promise(function(resolve){
      var ov = document.createElement('div');
      ov.setAttribute('style', 'position:fixed;inset:0;z-index:2147483000;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;padding:18px;');
      ov.innerHTML = '<div style="width:100%;max-width:360px;background:#fff;color:#1a1b1e;border-radius:16px;padding:20px;font-family:inherit;box-shadow:0 12px 40px rgba(0,0,0,.3)">'
        + '<div style="font-weight:800;font-size:16px;margin-bottom:6px">🔒 비밀번호 확인</div>'
        + '<div style="font-size:13px;color:#666;line-height:1.55;margin-bottom:12px">' + esc(why || '보안을 위해 비밀번호를 한 번 더 입력해 주세요.') + '</div>'
        + '<input type="password" id="caroRaPw" autocomplete="current-password" placeholder="비밀번호" style="width:100%;box-sizing:border-box;padding:12px;border:1px solid #ccd;border-radius:10px;font-size:15px;margin-bottom:6px">'
        + '<div id="caroRaErr" style="min-height:18px;font-size:12px;color:#c0392b;margin-bottom:8px"></div>'
        + '<div style="display:flex;gap:8px"><button type="button" id="caroRaNo" style="flex:1;padding:12px;border-radius:10px;border:1px solid #ccd;background:#fff;font-size:14px">취소</button>'
        + '<button type="button" id="caroRaOk" style="flex:1;padding:12px;border-radius:10px;border:0;background:#1a1b1e;color:#fff;font-weight:700;font-size:14px">확인</button></div></div>';
      document.body.appendChild(ov);
      var pw = ov.querySelector('#caroRaPw'), err = ov.querySelector('#caroRaErr'), ok = ov.querySelector('#caroRaOk');
      setTimeout(function(){ pw.focus(); }, 50);
      var close = function(v){ if(ov.parentNode) ov.parentNode.removeChild(ov); resolve(v); };
      ov.querySelector('#caroRaNo').onclick = function(){ close(false); };
      var submit = function(){
        var u = user(), FN = window.FB_FN;
        if(!pw.value){ err.textContent = '비밀번호를 입력해 주세요.'; return; }
        if(!u || !FN || !FN.reauthenticateWithCredential || !FN.EmailAuthProvider){ err.textContent = '잠시 후 다시 시도해 주세요.'; return; }
        ok.disabled = true; err.textContent = '확인 중…';
        FN.reauthenticateWithCredential(u, FN.EmailAuthProvider.credential(u.email, pw.value)).then(function(){
          return u.getIdToken(true);   /* 새 로그인 시각이 담긴 토큰으로 바꿔 서버가 '방금 확인됨' 을 알게 한다 */
        }).then(function(){ close(true); }).catch(function(e){
          ok.disabled = false; pw.value = '';
          var c = (e && e.code) || '';
          err.textContent = /wrong-password|invalid-cred/.test(c) ? '비밀번호가 올바르지 않습니다.' : /too-many/.test(c) ? '시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.' : /network/.test(c) ? '네트워크 연결을 확인해 주세요.' : '확인하지 못했습니다 (' + c + ')';
        });
      };
      ok.onclick = submit;
      pw.addEventListener('keydown', function(e){ if(e.key === 'Enter') submit(); });
    });
  }

  /* 재인증 — Promise<boolean> */
  window.caroReauth = function(why){
    var u = user(); if(!u) return Promise.resolve(false);
    if(hasPassword(u)) return askPassword(why);
    /* 카카오·네이버 등: 비밀번호가 없으므로 다시 로그인으로 확인 */
    toast('보안을 위해 다시 로그인한 뒤 진행해 주세요.');
    setTimeout(function(){ try{ if(window.handleLogout) window.handleLogout(); }catch(e){} }, 900);
    return Promise.resolve(false);
  };

  function needsRecent(e){ var m = String((e && (e.message || e.code)) || ''); return /requires-recent-login/.test(m); }
  /* 서버 호출 + 재인증 1회 재시도 */
  window.caroCallSecure = function(name, data, why){
    if(typeof window.FB_CALL !== 'function') return Promise.reject(new Error('서버에 연결할 수 없습니다'));
    return window.FB_CALL(name, data).catch(function(e){
      if(!needsRecent(e)) throw e;
      return window.caroReauth(why).then(function(ok){
        if(!ok){ var er = new Error('재인증을 취소했습니다'); er.code = 'cancelled'; throw er; }
        return window.FB_CALL(name, data);
      });
    });
  };

  /* ── 장기 미사용 자동 로그아웃 ── */
  function lsGet(){ try{ return Number(localStorage.getItem(KEY)) || 0; }catch(e){ return 0; } }
  function lsSet(){ try{ localStorage.setItem(KEY, String(Date.now())); }catch(e){} }
  var last = 0;
  function touch(){ var t = Date.now(); if(t - last > 60000){ last = t; if(user()) lsSet(); } }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function(ev){ window.addEventListener(ev, touch, { passive: true, capture: true }); });
  var checked = false;
  var iv = setInterval(function(){
    var u = user(); if(!u || checked) return;
    checked = true; clearInterval(iv);
    var prev = lsGet();
    if(prev && Date.now() - prev > IDLE_DAYS * 86400000){
      try{ localStorage.removeItem(KEY); }catch(e){}
      toast('보안을 위해 ' + IDLE_DAYS + '일 이상 사용하지 않은 기기는 로그아웃됩니다. 다시 로그인해 주세요.');
      setTimeout(function(){ try{ if(window.handleLogout) window.handleLogout(); else if(window.FB_FN) window.FB_FN.signOut(window.FB_AUTH); }catch(e){} }, 1200);
    } else lsSet();
  }, 1000);
  setTimeout(function(){ clearInterval(iv); }, 60000);
})();
