/* caro-dialog.js — 앱 웹뷰에서 native confirm()/prompt() 가 자동 승인되는 문제 대응.
   window.caroConfirm(msg, {ok,cancel,danger}) → Promise<boolean>
   window.caroPrompt(msg, def, {ok,cancel})     → Promise<string|null>  (취소 = null)
   window.caroAlert(msg)                        → Promise<void>
   한 번에 하나만 띄우고, 겹치면 순서대로 기다린다. 의존성 없음(ES5). */
(function(){
  'use strict';
  var ov=null, box=null, msgEl=null, inputEl=null, btnRow=null, okBtn=null, cancelBtn=null;
  var queue=[], busy=false, cur=null;

  function isLight(){
    var de=document.documentElement, b=document.body;
    return (de&&de.classList&&de.classList.contains('light')) || (b&&b.classList&&b.classList.contains('light'))
        || (de&&de.getAttribute('data-theme')==='light');
  }
  function build(){
    if(ov) return;
    ov=document.createElement('div');
    ov.setAttribute('style','position:fixed;inset:0;top:0;left:0;right:0;bottom:0;z-index:2147483000;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;');
    box=document.createElement('div');
    box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true');
    box.setAttribute('style','max-width:420px;width:92vw;padding:18px;border-radius:14px;box-sizing:border-box;font-family:inherit;font-size:14px;line-height:1.5;box-shadow:0 12px 40px rgba(0,0,0,.45);');
    msgEl=document.createElement('div');
    msgEl.setAttribute('style','white-space:pre-wrap;word-break:break-word;margin:0 0 14px;');
    inputEl=document.createElement('input');
    inputEl.type='text';
    inputEl.setAttribute('style','display:none;width:100%;box-sizing:border-box;margin:0 0 14px;padding:9px 11px;border-radius:8px;font:inherit;font-size:14px;outline:none;');
    btnRow=document.createElement('div');
    btnRow.setAttribute('style','display:flex;justify-content:flex-end;gap:8px;');
    cancelBtn=mkBtn(); okBtn=mkBtn();
    btnRow.appendChild(cancelBtn); btnRow.appendChild(okBtn);
    box.appendChild(msgEl); box.appendChild(inputEl); box.appendChild(btnRow); ov.appendChild(box);
    cancelBtn.addEventListener('click', function(){ finish(false); });
    okBtn.addEventListener('click', function(){ finish(true); });
    document.addEventListener('keydown', function(e){
      if(!cur) return;
      var k=e.key||e.keyCode;
      if(k==='Escape'||k==='Esc'||k===27){ e.preventDefault(); e.stopPropagation(); finish(false); }
      else if((k==='Enter'||k===13) && cur.kind==='prompt'){ e.preventDefault(); e.stopPropagation(); finish(true); }
    }, true);
    ov.addEventListener('click', function(e){ if(e.target===ov && cur && cur.kind==='alert') finish(true); });
    (document.body||document.documentElement).appendChild(ov);
  }
  function mkBtn(){
    var b=document.createElement('button'); b.type='button';
    b.setAttribute('style','padding:8px 16px;border-radius:9px;border:1px solid transparent;font:inherit;font-size:14px;font-weight:600;cursor:pointer;min-width:72px;');
    return b;
  }
  function paint(o){
    var light=isLight();
    box.style.background=light?'#fff':'#1e2026';
    box.style.color=light?'#1a1b1e':'#eee';
    box.style.border='1px solid '+(light?'#d9dce3':'#3a3d46');
    inputEl.style.background=light?'#f4f5f8':'#15161a';
    inputEl.style.color=light?'#1a1b1e':'#eee';
    inputEl.style.border='1px solid '+(light?'#c9cdd6':'#3a3d46');
    cancelBtn.style.background='transparent';
    cancelBtn.style.color=light?'#444':'#ccc';
    cancelBtn.style.borderColor=light?'#c9cdd6':'#4a4d56';
    okBtn.style.background=o.danger?'#e0705e':'#c8a96e';
    okBtn.style.color=o.danger?'#fff':'#15161a';
    okBtn.style.borderColor=okBtn.style.background;
  }
  function open(job){
    build(); cur=job; busy=true;
    var o=job.opts||{};
    msgEl.textContent=(job.msg==null)?'':String(job.msg);
    okBtn.textContent=o.ok||'확인';
    cancelBtn.textContent=o.cancel||'취소';
    cancelBtn.style.display=(job.kind==='alert')?'none':'';
    inputEl.style.display=(job.kind==='prompt')?'block':'none';
    inputEl.value=(job.kind==='prompt' && job.def!=null)?String(job.def):'';
    paint(o);
    ov.style.display='flex';
    try{ if(job.kind==='prompt'){ inputEl.focus(); inputEl.select(); } else okBtn.focus(); }catch(e){}
  }
  function finish(ok){
    var job=cur; if(!job) return;
    cur=null;
    var val=(job.kind==='prompt')?(ok?inputEl.value:null):(job.kind==='alert'?undefined:!!ok);
    ov.style.display='none';
    inputEl.value='';
    try{ if(job.active && job.active.focus) job.active.focus(); }catch(e){}
    busy=false;
    job.resolve(val);
    next();
  }
  function next(){
    if(busy||!queue.length) return;
    var job=queue.shift();
    job.active=document.activeElement;
    open(job);
  }
  function enqueue(job){
    return new Promise(function(resolve){
      var done=false;
      job.resolve=function(v){ if(done) return; done=true; resolve(v); };
      queue.push(job);
      if(document.body) next();
      else document.addEventListener('DOMContentLoaded', next);
    });
  }

  window.caroConfirm=function(msg, opts){ return enqueue({ kind:'confirm', msg:msg, opts:opts||{} }); };
  window.caroPrompt=function(msg, def, opts){ return enqueue({ kind:'prompt', msg:msg, def:def, opts:opts||{} }); };
  window.caroAlert=function(msg){ return enqueue({ kind:'alert', msg:msg, opts:{} }); };
})();
