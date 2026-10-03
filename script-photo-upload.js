/* ═══════════════════════════════════════════════════════════
   CARO MOBILITY — 사용 전 사진 저장 패치 v2 (무료 방식)
   ───────────────────────────────────────────────────────────
   Storage/유료(Blaze) 불필요!
   고객이 사진 촬영을 "완료(finishPhotoCapture)"하면:
     1) 사진을 작게 압축 (긴 변 900px, JPEG)
     2) 예약 문서(reservations/{bookNo})의 photos 필드에 저장 (1MB 한도 내)
   → 관리자 화면(admin-manage.js)에서 자동 표시.

   적용: index.html 에서 <script src="script.js"></script> 다음 줄에
     <script src="script-photo-upload.js?v=2"></script>
═══════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  var MAX_DIM = 900;       // 가장 긴 변 최대 px
  var QUALITY = 0.5;       // JPEG 품질
  var BUDGET  = 820000;    // 예약 문서 사진 총 용량 한도 (문자수≈바이트, 1MB 미만 안전선)

  function toast(m){ try{ if(typeof window.showToast==='function'){ window.showToast(m); } }catch(e){} }

  function currentBookNo(){
    try{
      var idx = window.ctrlResIdx;
      if(idx!=null && idx>=0 && window.myReservations && window.myReservations[idx]){
        return window.myReservations[idx].bookNo || null;
      }
    }catch(e){}
    return null;
  }
  function snapshotPhotos(){
    var p = window.pcarPhotos || {};
    var out = {front:[],rear:[],left:[],right:[],misc:[]}; var any=false;
    ['front','rear','left','right','misc'].forEach(function(s){
      (p[s]||[]).forEach(function(d){ if(typeof d==='string'&&d.indexOf('data:')===0&&d.length>30){ out[s].push(d); any=true; } });
    });
    return any?out:null;
  }

  /* 캔버스로 압축 */
  function compress(dataUrl){
    return new Promise(function(resolve){
      try{
        var img=new Image();
        img.onload=function(){
          var w=img.width,h=img.height;
          if(w>=h && w>MAX_DIM){ h=Math.round(h*MAX_DIM/w); w=MAX_DIM; }
          else if(h>w && h>MAX_DIM){ w=Math.round(w*MAX_DIM/h); h=MAX_DIM; }
          try{
            var c=document.createElement('canvas'); c.width=w; c.height=h;
            c.getContext('2d').drawImage(img,0,0,w,h);
            resolve(c.toDataURL('image/jpeg',QUALITY));
          }catch(e){ resolve(dataUrl); }
        };
        img.onerror=function(){ resolve(dataUrl); };
        img.src=dataUrl;
      }catch(e){ resolve(dataUrl); }
    });
  }

  /* 압축 후 예산(1MB 미만) 안에서 담기 */
  function buildWithinBudget(snap){
    var sides=['front','rear','left','right','misc'];
    var jobs=[];
    sides.forEach(function(side){ snap[side].forEach(function(d){ jobs.push({side:side,src:d}); }); });
    return Promise.all(jobs.map(function(j){ return compress(j.src).then(function(c){ return {side:j.side,data:c}; }); }))
      .then(function(items){
        var photos={front:[],rear:[],left:[],right:[],misc:[]};
        var total=0, kept=0, dropped=0;
        items.forEach(function(it){
          var len=it.data.length;
          if(total+len<=BUDGET){ photos[it.side].push(it.data); total+=len; kept++; }
          else dropped++;
        });
        return {photos:photos, kept:kept, dropped:dropped};
      });
  }

  function saveDoc(bookNo, photos, extra){
    var FN=window.FB_FN, db=window.FB_DB;
    if(!db||typeof FN.setDoc!=='function') return Promise.reject(new Error('DB 미준비'));
    return FN.setDoc(FN.doc(db,'reservations',bookNo),Object.assign({ photos:photos, photosUploadedAt:new Date().toISOString() },extra||{}),{merge:true});
  }
  /* ★[24차] Storage 가 준비돼 있으면 파일로 올리고(1MB 제한·용량 탈락 없음, 서버 시각 기록) 예약 문서에는 주소만 남긴다.
     Storage 가 없거나 실패하면 예전 방식(문서 안 base64)으로 저장한다. 경로: reservations/{uid}/{bookNo}/pre_{면}_{n}_{시각}.jpg */
  function uploadToStorage(bookNo, photos){
    var FN=window.FB_FN, st=window.FB_STORAGE, u=window.FB_AUTH&&window.FB_AUTH.currentUser;
    if(!st||!u||!FN||typeof FN.storageRef!=='function'||typeof FN.uploadString!=='function') return Promise.reject(new Error('no-storage'));
    var sides=['front','rear','left','right','misc'], jobs=[], ts=Date.now();
    sides.forEach(function(side){ (photos[side]||[]).forEach(function(d,i){ jobs.push({side:side,i:i,data:d}); }); });
    return Promise.all(jobs.map(function(j){
      var ref=FN.storageRef(st, 'reservations/'+u.uid+'/'+bookNo+'/pre_'+j.side+'_'+j.i+'_'+ts+'.jpg');
      return FN.uploadString(ref, j.data, 'data_url', { contentType:'image/jpeg', customMetadata:{ bookNo:bookNo, side:j.side } }).then(function(){ return FN.getDownloadURL(ref); }).then(function(url){ return {side:j.side,url:url}; });
    })).then(function(items){
      var out={front:[],rear:[],left:[],right:[],misc:[]};
      items.forEach(function(it){ out[it.side].push(it.url); });
      return out;
    });
  }
  function save(bookNo, photos){
    return uploadToStorage(bookNo, photos)
      .then(function(urls){ return saveDoc(bookNo, urls, { photoStorage:'storage', photoCount:Object.keys(urls).reduce(function(a,k){ return a+urls[k].length; },0) }); })
      .catch(function(e){ console.warn('[CARO 사진] Storage 저장 실패 → 문서 저장으로 대체', e&&(e.code||e.message)); return saveDoc(bookNo, photos, { photoStorage:'doc' }); });
  }

  function run(bookNo, snap){
    if(!snap) return;                                        // 사진 없음
    if(!bookNo){ console.warn('[CARO 사진] 활성 예약 없음 — 저장 생략'); return; }
    if(!window.FB_FN || typeof window.FB_FN.setDoc!=='function'){ toast('사진 저장 준비 중'); return; }
    toast('📤 사진 저장 중…');
    buildWithinBudget(snap).then(function(r){
      return save(bookNo, r.photos).then(function(){
        var msg='✅ 사진 '+r.kept+'장 저장 완료';
        if(r.dropped>0) msg+=' (용량 제한으로 '+r.dropped+'장 제외)';
        toast(msg);
        console.log('[CARO 사진] 저장 완료', bookNo, r);
      });
    }).catch(function(e){
      console.error('[CARO 사진] 저장 실패', e);
      toast('사진 저장 실패: '+((e&&(e.code||e.message))||'오류'));
    });
  }

  /* finishPhotoCapture 래핑 */
  function hook(){
    if(typeof window.finishPhotoCapture!=='function') return false;
    if(window.finishPhotoCapture.__caroPhotoWrapped) return true;
    var orig=window.finishPhotoCapture;
    var wrapped=function(){
      var snap, bookNo;
      try{ snap=snapshotPhotos(); bookNo=currentBookNo(); }catch(e){ console.error(e); }
      var rv; try{ rv=orig.apply(this,arguments); }catch(e){ console.error(e); }
      try{ run(bookNo, snap); }catch(e){ console.error(e); }
      return rv;
    };
    wrapped.__caroPhotoWrapped=true;
    window.finishPhotoCapture=wrapped;
    return true;
  }
  if(!hook()){ var t=setInterval(function(){ if(hook()) clearInterval(t); },400); setTimeout(function(){ clearInterval(t); },15000); }
  console.log('[CARO 사진] ✅ 사진 저장 v3 (Storage 우선 · 문서 대체)');
})();
