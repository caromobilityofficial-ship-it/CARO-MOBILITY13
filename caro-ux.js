/* ═══════════════════════════════════════════════════════════════
   caro-ux.js — 사용성 보정 (2026-09)
   ───────────────────────────────────────────────────────────────
   ① 지도(실시간 예약) 화면에 들어가면 자동으로 내 위치로 이동
      - 기존 customer-redesign.js 의 locateMe() 는 "버튼을 직접 누른 경우에만"
        동작하도록 막혀 있었다. 여기서는 노출된 window.caroLocateMe() 를
        화면 진입 시점에 호출한다 (버튼을 누른 것과 동일: 500m 확대).
   ② 홈에 들어오는 순간 위치를 미리 한 번 받아 둔다 (캐시 워밍)
      - getCurrentPosition 의 maximumAge 30초 안에 지도 화면을 열면
        기다림 없이 즉시 내 위치로 뜬다.
   ※ 위치 권한을 거부한 사용자는 아무 일도 일어나지 않고 기존 기본 지도가 나온다.
   ═══════════════════════════════════════════════════════════════ */
(function () {
  if (window.__caroUxLoaded) return;
  window.__caroUxLoaded = true;

  var warmed = false;
  function warmLocation() {
    if (warmed || !navigator.geolocation) return;
    warmed = true;
    try {
      navigator.geolocation.getCurrentPosition(
        function () {}, function () {},
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
      );
    } catch (e) {}
  }

  var locT = null;
  function autoLocate() {
    clearTimeout(locT);
    /* 화면 전환 애니메이션(.38s)과 지도 relayout 이 끝난 뒤 호출 */
    locT = setTimeout(function () {
      try { if (typeof window.caroLocateMe === "function") window.caroLocateMe(); } catch (e) {}
    }, 420);
  }

  function hook() {
    if (typeof window.goTo !== "function" || window.goTo.__caroUx) return false;
    var orig = window.goTo;
    window.goTo = function (id) {
      var r = orig.apply(this, arguments);
      if (id === "home-screen")   warmLocation();
      if (id === "rental-screen") autoLocate();
      return r;
    };
    window.goTo.__caroUx = true;
    return true;
  }

  /* goTo 는 여러 스크립트가 순서대로 감싸므로, 마지막에 한 번 더 감싼다 */
  if (!hook()) {
    var tries = 0, iv = setInterval(function () { if (hook() || ++tries > 40) clearInterval(iv); }, 100);
  }

  /* 이미 지도 화면이 떠 있는 상태로 로드된 경우(새로고침 등) */
  window.addEventListener("load", function () {
    setTimeout(function () {
      var r = document.getElementById("rental-screen");
      if (r && r.classList.contains("active")) autoLocate();
      var h = document.getElementById("home-screen");
      if (h && h.classList.contains("active")) warmLocation();
    }, 800);
  });

  console.log("[caro-ux] ✅ 지도 진입 시 자동 내 위치");
})();
