/* ═══════════════════════════════════════════════════════════════
   caro-wake.js — ★v1 (v110.62) 차량 명령 '빠른 깨우기' (고객앱 · 관제 공용)
   ───────────────────────────────────────────────────────────────
   예전 : 서버가 명령을 만들어 두면 기기가 정해진 간격마다 확인하러 왔다
          (평소 몇 초 · 달리는 중 10초 · 주차 절전 중 최대 80초) → 주차된 차 앞에서 '문 열기' 가 한참 걸렸다.
   지금 : 명령이 만들어지는 즉시(issueCommand · staffCommand 성공 직후) 위치 중계 서버에
          "이 기기 지금 명령 확인해" 를 보낸다 → 중계 서버가 기기에 UDP 로 짧은 신호를 보내 바로 가져가게 한다.
          · 명령 내용은 싣지 않는다. 중계 서버는 그 사람의 로그인 표로 그 명령 문서가 읽히는지(본인 명령인지) 확인한 뒤에만 보낸다.
          · 중계 서버 주소는 사이트의 relay.json (관제와 같은 것). 없거나 실패하면 아무 일도 없이 예전처럼 동작한다.
          · 펌웨어 v9.9-precise62 이상 + 새 중계 서버(relay.js 2판)에서 효과가 난다.
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.__caroWake) return; window.__caroWake = true;
  var url = null, cfgP = null, open = 0;

  function cfg(){
    if(cfgP) return cfgP;
    cfgP = fetch('relay.json?t=' + Date.now(), { cache:'no-store' }).then(function(r){ return r.ok ? r.json() : null; }).then(function(j){
      var u = j && typeof j.url === 'string' ? j.url.trim() : '';
      if(/^wss:\/\/[a-z0-9.\-]+(:\d+)?\/live$/i.test(u)) url = u;
      return url;
    }).catch(function(){ cfgP = null; return null; });
    return cfgP;
  }

  function wake(dev, cmd){
    if(open >= 3) return;                                  /* 한꺼번에 여러 개를 열지 않는다 */
    var t0 = Date.now();
    cfg().then(function(u){
      var usr = window.FB_AUTH && window.FB_AUTH.currentUser;
      if(!u || !usr || typeof usr.getIdToken !== 'function') return;
      return usr.getIdToken().then(function(tok){
        var ws; try{ ws = new WebSocket(u); }catch(e){ return; }
        open++;
        var fin = false, to = setTimeout(end, 6000);
        function end(){ if(fin) return; fin = true; open--; clearTimeout(to); try{ ws.close(); }catch(e){} }
        ws.onopen = function(){ try{ ws.send(JSON.stringify({ type:'wake', token:tok, dev:dev, cmd:cmd })); }catch(e){ end(); } };
        ws.onmessage = function(ev){
          try{ var m = JSON.parse(ev.data); if(m && m.type === 'wake'){ window.__caroWakeLast = { at:Date.now(), ms:Date.now() - t0, dev:dev, ok:!!m.ok, sent:m.sent || m.why || '' }; end(); } }catch(e){}
        };
        ws.onerror = end; ws.onclose = function(){ if(!fin){ fin = true; open--; clearTimeout(to); } };
      });
    }).catch(function(){});
  }
  window.caroWake = wake;

  /* 서버 함수 부르기(FB_CALL)를 감싸서 : 명령이 만들어지면 곧바로 깨운다. 원래 결과는 그대로 돌려준다 */
  function wrap(){
    var f = window.FB_CALL;
    if(typeof f !== 'function') return false;
    if(f.__caroWake) return true;
    var w = function(name, data){
      var p = f.apply(this, arguments);
      if(name === 'issueCommand' || name === 'staffCommand'){
        try{ p.then(function(r){
          var dev = r && (r.deviceId || (data && data.deviceId)), cmd = r && r.cmdId;
          if(dev && cmd) wake(String(dev), String(cmd));
        }, function(){}); }catch(e){}
      }
      return p;
    };
    w.__caroWake = true;
    window.FB_CALL = w;
    return true;
  }
  if(!wrap()){ var n = 0, t = setInterval(function(){ if(wrap() || ++n > 120) clearInterval(t); }, 500); }
  /* 로그인 뒤 다른 스크립트가 FB_CALL 을 다시 넣는 경우에도 다시 감싼다 */
  setInterval(wrap, 5000);
  setTimeout(cfg, 4000);                                   /* 주소는 미리 읽어 둔다 (첫 명령이 빨라지게) */
  console.log('✅ 차량 명령 빠른 깨우기 (caro-wake v1)');
})();
