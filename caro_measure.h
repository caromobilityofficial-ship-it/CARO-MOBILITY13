// =====================================================================================
//  caro_measure.h — CARO 정밀 측정 코어 v1.0  (기압 고도·층 / 주차장 판별 / 주차장 안 이동 궤적)
//  ------------------------------------------------------------------------------------
//  ★ 이 파일은 두 펌웨어(시험기 caro_v45, v9.8 기판 CARO_v9_firmware)가 똑같이 쓴다.
//    PC 에서도 그대로 컴파일되므로(아두이노 함수 안 씀) 모의 주행으로 검증한 뒤 굽는다.
//
//  원리 (예전 방식과 달라진 점)
//   1) 층은 '주차장 안' 에서만 센다.
//        실외(OUT)      : 위성이 잘 잡힘 → 항상 지상(1F), 고도 0 (터널도 같다). 언덕·고가·날씨는 층이 되지 않는다.
//        후보(CAND)     : 서행 중 위성이 끊김 → 아직 1F. 경사로(급경사·회전)나 주차가 확인돼야 주차장으로 인정.
//        주차장(PARK)   : 층·고도·궤적을 잰다. 위성이 돌아오고(빠르게 달리거나 입구에서 멀어지면) 실외로 복귀.
//        터널(TUNNEL)   : 빠르게 달리다 끊김 / 입구에서 300m 넘게 직진 → 지하차도·터널. 층 안 셈.
//   2) 입구 높이(=0m)는 '위성이 끊기기 직전의 평지' 로 잡는다 (지붕 없는 진입 경사로를 이미 내려온 만큼 되돌려 계산).
//   3) 서 있는 동안에는 고도가 변하지 않는다 → 그동안의 기압 변화(날씨·에어컨·문 여닫기)는 전부 버린다.
//      단 1.8m 넘는 변화가 3초 이상 이어지면 기계식 주차·차량용 승강기로 보고 받아들인다.
//   4) 고도 환산에 실제 온도를 쓴다 (표준대기 15℃ 고정식은 겨울·여름에 3~9% 틀린다 = 지하 4층에서 1m 이상).
//   5) 층 번호 규약은 관제와 같다 : 1=1F, 2=2F … / 0=B1, -1=B2 …  (반층은 0.5 단위)
// =====================================================================================
#ifndef CARO_MEASURE_H
#define CARO_MEASURE_H
#include <math.h>
#include <stdint.h>
#include <string.h>
#include <stdio.h>

namespace caro {

enum Ctx : uint8_t { CTX_UNKNOWN = 0, CTX_OUT = 1, CTX_CAND = 2, CTX_PARK = 3, CTX_TUNNEL = 4 };

struct MeasCfg {
  float floorStep     = 1.0f;    // 층 단위 : 1.0 = 정수층, 0.5 = 반층까지
  float floorH        = 3.0f;    // 층 표가 없을 때 쓰는 층고(m) — 주차하며 스스로 학습
  float floorHys      = 0.35f;   // 층 경계 히스테리시스(m)
  float selfHeatC     = 4.0f;    // 기판 자기발열 : 센서 온도 − 이 값 = 공기 온도로 본다
  float sensSigma     = 0.25f;   // 기압센서 상대 정밀도(m). BMP390 0.25 / BME280 0.6
  float entryMaxKmh   = 30.0f;   // 이 속도 이하에서 위성이 끊겨야 주차장 후보
  float tunnelKmh     = 38.0f;   // 위성 없이 이 속도 이상 3초 = 터널·지하차도
  float rampGrade     = 0.07f;   // 주차 경사로로 보는 최소 기울기(높이/주행거리). 지하차도는 6% 이하
  float rampMinH      = 1.5f;    // 경사로로 인정하는 최소 높이 변화(m)
  float rampTurnDeg   = 150.0f;  // 속도를 모를 때 : 이만큼 돌면서 rampMinH 이상 오르내리면 경사로
  float tunnelDistM   = 300.0f;  // 입구에서 직선거리로 이만큼 벗어나면 주차장이 아니다
  float parkRadiusM   = 150.0f;  // 위성이 돌아온 뒤 입구에서 이만큼 멀어지면 주차장을 나온 것
  float exitKmh       = 25.0f;   // 위성이 돌아온 뒤 이 속도로 달리면 주차장을 나온 것
  float slowRampH     = 2.2f;    // 속도를 모를 때 : 지붕 밑에서 45초 안에 이만큼 오르내리면 경사로로 본다
  float liftThreshM   = 1.8f;    // 정지 중 이보다 큰 높이 변화가 3초 이어지면 승강기·기계식 주차
  float holdAbsorbMps = 0.02f;   // 정지 중 기압 흐름을 흡수하는 최대 속도(m/s) — 날씨(최대 0.007)보다 크고 승강기(0.3~)보다 작게
};

struct Gnss {
  bool    valid   = false;       // 위치를 쓸 수 있는가 (위성 또는 추측항법)
  uint8_t fixType = 0;           // 0 없음 / 1 추측항법만 / 2 2D / 3 3D / 4 위성+추측항법
  uint8_t numSV   = 0;           // 계산에 쓴 위성 수
  float   hAcc    = -1;          // 수평 정확도(m). 모르면 음수
  float   hdop    = -1;          // 모르면 음수
  double  lat = 0, lon = 0;
  float   speedKmh = 0;
  float   headDeg  = -1;         // 진행 방향. 모르면 음수
  float   altMSL   = NAN;        // 위성 해발고도(m). 모르면 NAN
};

struct FloorEnt { float code; float z; };          // code = 관제 규약 층 번호, z = 입구(기준층) 대비 높이(m)
#define CARO_FLRMAP_N 14
#define CARO_TRK_N    400   // ★통신이 안 되는 지하에서도 6~7분치(1초 간격, 변화 있을 때만)를 들고 있다가 나와서 보낸다

class Measure {
public:
  MeasCfg cfg;
  // ---------- 결과 ----------
  Ctx    ctx = CTX_UNKNOWN;
  float  alt = 0;                // 입구(지상) 대비 높이(m). 실외에서는 0
  float  altErr = 0;             // 그 높이의 추정 오차(±m, 1σ)
  float  vz = 0;                 // 수직 속도(m/s, +위)
  float  floorCode = 1;          // 층 (1=1F, 0=B1, -1=B2 …)
  int    floorConf = 0;          // 층 판정 신뢰도 0~100
  float  floorMargin = 0;        // 다음 층 경계까지 남은 높이(m)
  bool   inPark = false;         // 주차장 안으로 확정됐는가
  float  relE = 0, relN = 0;     // 입구 기준 동·북 위치(m)
  bool   relValid = false;
  float  pathM = 0;              // 진입 후 주행 거리(m)
  float  turnDeg = 0;            // 진입 후 누적 회전(절대값 합, 도)
  float  heading = 0;            // 방위(도). GNSS 방향이 있으면 그것, 없으면 자이로 적분
  uint32_t inSec = 0;            // 주차장(후보 포함) 들어간 지 몇 초
  double entLat = 0, entLon = 0; bool entValid = false;   // 입구 좌표
  uint16_t session = 0;          // 주차장 진입 회차 (관제가 궤적을 구분)
  bool   lift = false;           // 정지 중 승강기·기계식 주차로 움직이는 중
  // ---------- 주행 고도·경사 (★층과 별개 : 실외 언덕은 층이 아니라 여기로 나온다) ----------
  float  roadAlt = 0;            // 이번 주행 출발점 대비 높이(m). 2분 넘게 서 있다 출발하거나 주차장을 나오면 0 에서 다시 시작
  float  grade = 0;              // 도로 경사(%, +오르막). 시속 9km 이상에서만 계산
  int    hill = 0;               // +1 오르막 / -1 내리막 / 0 평지 (경사 3.5% 이상이 이어질 때)
  float  elev = NAN;             // 위성 해발고도(m) — 참고값
  bool   skyGood = false, skyLost = true;
  bool   baroOk = false;
  float  tempAir = 15.0f;
  float  learnedFloorH = 0;      // 0 = 아직 학습 전
  // 층 표 (그 건물의 층별 바닥 높이)
  FloorEnt map[CARO_FLRMAP_N]; int mapN = 0;
  bool   mapHasPos = false; double mapLat = 0, mapLon = 0;   // 표가 속한 건물 위치 (있으면 200m 안에서만 적용)

  void begin() { *this = Measure(); }

  // ---------- 입력 ----------
  // 기압 : 4~10Hz 로 부른다. p = hPa, tC = 센서 온도
  void baro(uint32_t ms, float p_hPa, float tC) {
    if (!(p_hPa > 300.0f && p_hPa < 1200.0f)) return;
    // 5개 중앙값으로 순간 튐 제거
    pbuf_[pbi_] = p_hPa; pbi_ = (pbi_ + 1) % 5; if (pbn_ < 5) pbn_++;
    float t[5]; for (int i = 0; i < pbn_; i++) t[i] = pbuf_[i];
    for (int i = 0; i < pbn_; i++) for (int j = i + 1; j < pbn_; j++) if (t[j] < t[i]) { float x = t[i]; t[i] = t[j]; t[j] = x; }
    float p = t[pbn_ / 2];
    if (isfinite(tC) && tC > -45 && tC < 90) { float ta = tC - cfg.selfHeatC; tempAir = tInit_ ? tempAir + (ta - tempAir) * 0.01f : ta; tInit_ = true; }
    if (!pBase_) { pBase_ = p; tLastBaro_ = ms; hF_ = 0; hS_ = 0; hRaw_ = 0; vF_ = 0; baroOk = true; return; }
    float dt = (ms - tLastBaro_) / 1000.0f; tLastBaro_ = ms;
    if (dt <= 0 || dt > 5.0f) { dt = 0.25f; }
    // 온도 보정 기압 고도식 : Δh = 29.2717 · T(K) · ln(p기준 / p)
    float tk = tempAir + 273.15f; if (tk < 233) tk = 233; if (tk > 328) tk = 328;
    double h = 29.2717 * tk * log((double)pBase_ / (double)p);
    if (fabs(h - hRaw_) > 6.0 && rej_ < 3) { rej_++; return; }      // 한 번에 6m 는 불가능 → 3번까지 버림
    rej_ = 0; hRaw_ = (float)h;
    // 저역통과(시정수 : 센서 잡음에 맞춤) + 그 기울기로 수직속도. 호출 주기(dt)가 달라져도 같은 특성이 되게 지수식으로 계산
    float tau = cfg.sensSigma <= 0.3f ? 0.6f : 1.0f;
    float k = 1.0f - expf(-dt / tau), prevH = hS_;
    hS_ += ((float)h - hS_) * k;
    float vRaw = (hS_ - prevH) / dt;
    vF_ += (vRaw - vF_) * (1.0f - expf(-dt / 1.5f));
    if (vF_ > 6) vF_ = 6;
    if (vF_ < -6) vF_ = -6;
    hF_ = hS_ + vF_ * tau;                                           // 필터 지연만큼 앞당김(경사로에서 뒤처지지 않게)
    baroOk = true; tBaroOk_ = ms;
  }
  void gnss(uint32_t ms, const Gnss& g) { g_ = g; tGnss_ = ms; gSeen_ = true; }
  // 움직임 : still = 가속도계·속도로 본 '완전 정지', yawDps = 수직축 회전속도(모르면 NAN), acc = 시동(1 켜짐 0 꺼짐 -1 모름)
  void motion(uint32_t ms, bool still, float yawDps, int acc) { (void)ms; still_ = still; yaw_ = yawDps; acc_ = acc; }
  // GPS 를 일부러 꺼 둔 동안(주차 절전)에는 '위성 끊김' 을 실내 진입으로 보지 않게 한다
  void skyFreeze(bool on) { freeze_ = on; }

  // ---------- 계산 : 4~10Hz ----------
  void update(uint32_t ms) {
    float dt = tUpd_ ? (ms - tUpd_) / 1000.0f : 0.0f; tUpd_ = ms;
    float dtReal = dt < 0 ? 0 : (dt > 120 ? 120 : dt);           // 주차 절전(20초 낮잠) 뒤에도 날씨 흡수·승강기 판정이 이어지게
    if (dt < 0 || dt > 5) dt = 0;
    bool gFresh = gSeen_ && (ms - tGnss_) < 2500;
    bool posOk  = gFresh && g_.valid;
    // --- 하늘이 보이는가 ---
    bool good = posOk && g_.fixType >= 2 && g_.numSV >= 5 && (g_.hAcc < 0 || g_.hAcc <= 20.0f) && (g_.hdop < 0 || g_.hdop <= 4.0f);
    bool lost = !posOk || g_.fixType <= 1 || g_.numSV <= 3;
    if (freeze_) { tGood_ = 0; tLost_ = 0; }
    else if (good) { tGood_ += dt; tLost_ = 0; } else if (lost) { tLost_ += dt; tGood_ = 0; } else { tGood_ = 0; tLost_ = 0; }
    if (!still_) sinceMove_ = 0; else sinceMove_ += dt;
    skyGood = good; skyLost = lost;
    // --- 속도·방향·거리 ---
    bool spdKnown = posOk && g_.fixType >= 1;
    float v = spdKnown ? g_.speedKmh / 3.6f : NAN;                     // m/s
    if (spdKnown) { vLast_ = v; vAvg_ += (v - vAvg_) * fminf(1.0f, dt / 4.0f); }
    float vUse = spdKnown ? v : (still_ ? 0.0f : 3.0f);                // 속도를 모르면 서행(약 11km/h)으로 가정
    if (!still_) { odo_ += vUse * dt; }
    float yaw = isfinite(yaw_) ? yaw_ : 0.0f;
    if (posOk && g_.headDeg >= 0 && g_.speedKmh > 4.0f) {
      if (!isfinite(yaw_) && headInit_) { float d = angDiff(g_.headDeg, heading); yaw = dt > 0 ? d / dt : 0; }
      heading = g_.headDeg; headInit_ = true;
    } else if (isfinite(yaw_) && !still_) { heading = wrap360(heading + yaw_ * dt); }
    // --- 1초 기록 (입구 높이 되짚기용) ---
    if (ms - tRing_ >= 1000) { tRing_ = ms; if (!spdKnown) usp_++; ring_[ri_] = { hF_, odo_, good, usp_ }; ri_ = (ri_ + 1) % RING; if (rn_ < RING) rn_++; }
    if (good) { lastGoodLat_ = g_.lat; lastGoodLon_ = g_.lon; haveGood_ = true; tLastGoodMs_ = ms; }

    // --- 상태 전이 ---
    Ctx prev = ctx;
    switch (ctx) {
      case CTX_UNKNOWN:
        if (tGood_ >= 2.0f) toOut();
        else if (baroOk && !anchored_) { ground_ = hF_; bias_ = 0; anchored_ = true; }
        break;
      case CTX_OUT:
        if (tLost_ >= 2.0f && baroOk && sinceMove_ <= 15.0f) {      // 서 있던 차는 주차장에 '들어가지' 않는다
          float vIn = isfinite(vLast_) ? fmaxf(vAvg_, 0) * 3.6f : 0;
          bool road = vIn > cfg.entryMaxKmh;
          enter(ms, road ? CTX_TUNNEL : CTX_CAND); roadIn_ = road; tunT_ = 0;
        }
        break;
      case CTX_CAND: {
        float aabs = fabsf(altNow());
        if (tGood_ >= 3.0f) { toOut(); break; }                                        // 잠깐 끊긴 것 (고가 밑 등)
        if (spdKnown && v * 3.6f >= cfg.tunnelKmh) { tFast_ += dt; if (tFast_ >= 3.0f) { toTunnel(true); break; } } else tFast_ = 0;
        if (netDist() > cfg.tunnelDistM || (!relValid && pathIn() > 400.0f)) { toTunnel(false); break; }
        if (!rampSeen_ && rampNow(aabs)) rampSeen_ = true;                              // 지붕 밑에서 본 경사로(기울기 또는 회전)
        // ★속도를 모를 때의 경사로 (추측항법을 꺼 두면 지하에서는 속도가 없다 — 예전에는 직선 경사로 주차장에서 층이 끝내 안 나왔다)
        //   지붕 밑에서 45초 안에 2.2m 넘게 오르내렸고,
        //     내려간 것이면 → 지하주차장
        //     올라간 것이면 → 들어오기 직전에 내려온 만큼(지하차도 진입로)을 되찾고도 2.2m 더 올라갔을 때만 (주차타워). 지하차도에서 빠져나오는 오르막을 주차장으로 보지 않게
        //     단, 들어오기 전에 '완만한(10% 미만) 지붕 없는 내리막' 을 탔으면 지하차도 진입로의 모양이다 → 내려가는 쪽은 이 규칙을 쓰지 않는다 (주차하면 그때 확정)
        if (!rampSeen_ && !spdKnown && vertRun(cfg.slowRampH, 45)) { float a0 = altNow(); bool roadDip = entryRamp_ && entryGrade_ < 0.10f && entryDrop_ < 0;
          if ((a0 <= -cfg.slowRampH && !roadDip) || a0 >= cfg.slowRampH + fmaxf(0.0f, -entryDrop_)) rampSeen_ = true; }
        if (lift && aabs >= cfg.rampMinH) { confirm(); break; }                         // ★서 있는 채로 오르내렸다(차량 승강기·기계식 주차) → 시동선을 몰라도 주차 시설이다
        bool parked = (acc_ == 0 ? stillT_ >= 10.0f : (acc_ < 0 && stillT_ >= 180.0f));   // 시동 켠 채 서 있는 것(정체·신호)은 주차로 보지 않는다
        if (rampSeen_ && aabs >= cfg.rampMinH && inT_ >= 6.0f) { confirm(); break; }      // 경사로로 한 층 가까이 오르내림
        if (entryRamp_ && entryGrade_ >= 0.10f && aabs >= cfg.rampMinH && inT_ >= 6.0f) { confirm(); break; }   // 급한(10%↑) 진입 경사로를 내려와 지붕 밑으로 = 주차장 (지하차도 진입로는 6~8%)
        if (parked && (aabs < cfg.rampMinH || rampSeen_ || entryRamp_)) { confirm(); break; }   // 지붕 밑에 주차
        break; }
      case CTX_PARK: {
        bool far = entValid && posOk && distM(entLat, entLon, g_.lat, g_.lon) > cfg.parkRadiusM;
        if (tGood_ >= 5.0f && ((spdKnown && v * 3.6f >= cfg.exitKmh) || far)) { toOut(); break; }
        if (tGood_ >= 25.0f && fabsf(altNow()) < 1.2f) { toOut(); break; }
        if (spdKnown && v * 3.6f >= cfg.tunnelKmh + 5) { tFast_ += dt; if (tFast_ >= 5.0f) { toTunnel(true); break; } } else tFast_ = 0;
        if (relValid && netDist() > cfg.tunnelDistM) { toTunnel(true); break; }      // 건물 크기를 벗어남
        if (!relValid && moveT_ > 420.0f) { toTunnel(true); break; }   // 위치도 모르고 7분 내내 달림 = 주차장이 아니다(위성 불량)
        if (fabsf(altNow()) > 45.0f) { toTunnel(true); break; }        // ★입구에서 45m 넘게 오르내렸다 = 건물이 아니라 도로다 (위성이 죽은 채 언덕길을 달리는 중)
        break; }
      case CTX_TUNNEL:
        if (tGood_ >= 3.0f) { toOut(); break; }
        tunT_ += dt;
        // 지하에서 시동을 끄고 섬 = 지하 주차 (입구 높이는 끊기기 전 그대로).
        // ★단, 빠르게 달리다 위성이 끊겼거나(도로·터널) · 주차장이 아니라고 이미 판정했거나 · 끊긴 지 15분이 넘었거나(위성 수신 불량) · 입구에서 30m 넘게 오르내렸으면
        //   그것은 도로 위에 서 있는 것이다 → 주차장·층으로 만들지 않는다 (예전에는 위성이 죽은 채 달리다 3분만 서면 '주차장 ○층' 이 됐다)
        if (!roadIn_ && tunT_ < 900.0f && fabsf(altNow()) <= 30.0f && (acc_ == 0 ? stillT_ >= 10.0f : (acc_ < 0 && stillT_ >= 180.0f))) { confirm(); }
        break;
    }
    (void)prev;

    // --- 정지 유지 : 서 있는 동안 높이는 변하지 않는다 ---
    //   서 있는 동안의 기압 변화(날씨·에어컨 송풍·문 여닫기)는 높이로 치지 않는다.
    //   단 '꾸준한 수직 이동'(초속 0.12~1.5m)이 이어져 일정 높이를 넘으면 실제로 움직인 것으로 받아들인다 :
    //     시동 꺼짐 : 3초·1.8m 이상 → 기계식 주차·차량 승강기
    //     시동 켜짐 : 5초·1.5m 이상 → 정지로 잘못 본 서행(경사로) 또는 승강기. (에어컨 송풍은 1~3초 만에 끝나는 계단이라 여기 안 걸린다)
    float a = altNow();
    if (still_) {
      stillT_ += dt; moveT_ = 0;
      if (!holding_ && stillT_ >= 2.0f) { holding_ = true; holdAlt_ = a; liftT_ = 0; lift = false; }
      if (holding_) {
        float e = a - holdAlt_;
        float needT = (acc_ == 1) ? 5.0f : 3.0f, needE = (acc_ == 1) ? 1.5f : cfg.liftThreshM;
        bool rising = fabsf(vF_) >= 0.12f && fabsf(vF_) <= 1.5f;
        if (lift) { holdAlt_ = a; if (fabsf(vF_) < 0.06f) { liftStop_ += dt; if (liftStop_ >= 2.0f) lift = false; } else liftStop_ = 0; }
        else if (rising) { liftT_ += dt; if (liftT_ >= needT && fabsf(e) >= needE) { lift = true; liftStop_ = 0; holdAlt_ = a; tMove_ = 0; } }   // 오르내리는 동안에는 흡수하지 않는다
        else if (acc_ != 1 && fabsf(e) >= 2.5f) {                 // 낮잠 자는 사이 통째로 옮겨진 경우(기계식 주차) : 2.5m 넘는 차이가 4초 이상 그대로면 받아들인다
          napT_ += dtReal; if (napT_ >= 4.0f) { lift = true; liftStop_ = 0; holdAlt_ = a; tMove_ = 0; napT_ = 0; } }
        else { liftT_ = 0; napT_ = 0; float step = (acc_ == 1) ? 1e9f : cfg.holdAbsorbMps * dtReal; bias_ += (e > step ? step : (e < -step ? -step : e)); }
        a = lift ? altNow() : holdAlt_;
      }
    } else {
      if (holding_) { if (!lift) bias_ += altNow() - holdAlt_; holding_ = false; lift = false; tMove_ = 0; }   // 출발하는 순간 : 서 있던 높이에서 이어 간다
      stillT_ = 0; moveT_ += dt; tMove_ += dt; a = altNow();
    }
    if (ctx == CTX_CAND || ctx == CTX_PARK) { inT_ += dt; if (spdKnown && v > vMaxIn_) vMaxIn_ = v; }

    // --- 출력 ---
    vz = (still_ && !lift) ? 0.0f : vF_;
    if (ctx == CTX_OUT || ctx == CTX_TUNNEL) { alt = 0; altErr = 0; floorCode = 1; floorConf = (ctx == CTX_OUT) ? 100 : 60; floorMargin = 0; inPark = false; }   // 실외·터널 : 높이도 층도 세지 않는다
    else {
      alt = a;
      float drift = 0.002f * tMove_;
      altErr = sqrtf(cfg.sensSigma * cfg.sensSigma + (0.03f * a) * (0.03f * a) + drift * drift);
      if (ctx == CTX_PARK) { inPark = true; floorUpdate(a, dt); learnFloorH(a); }
      else { inPark = false; floorCode = 1; floorMargin = 0; floorConf = (ctx == CTX_UNKNOWN) ? 0 : 60; }
    }
    // --- 주행 고도·경사 : 층과 따로 낸다 (기압 높이 변화 ÷ 주행 속도) ---
    if (baroOk) {
      float hb = hF_ - bias_;
      if (!tripSet_) { tripBase_ = hb; tripSet_ = true; }
      if (still_) { if (stillT_ >= 120.0f) tripArm_ = true; }
      else { if (tripArm_) { tripArm_ = false; tripBase_ = hb; } roadAlt = hb - tripBase_; }
      float gr = 0; bool gOk = spdKnown && v >= 2.5f && !still_;
      if (gOk) { gr = 100.0f * vF_ / v; if (gr > 40) gr = 40; if (gr < -40) gr = -40; }
      grade += (gr - grade) * fminf(1.0f, dt / (gOk ? 3.0f : 1.5f));
      if (hill == 0) { if (grade >= 3.5f) hill = 1; else if (grade <= -3.5f) hill = -1; }
      else if (fabsf(grade) < 2.0f || (hill > 0) != (grade > 0)) hill = 0;
    }
    if (posOk && isfinite(g_.altMSL) && g_.fixType >= 2) elev = isfinite(elev) ? elev + (g_.altMSL - elev) * fminf(1.0f, dt / 3.0f) : g_.altMSL;

    // --- 주차장 안 위치·회전·궤적 ---
    if (ctx == CTX_CAND || ctx == CTX_PARK) {
      inSec = (uint32_t)inT_;
      if (!still_ && fabsf(yaw) > 2.0f) turnDeg += fabsf(yaw) * dt;
      if (posOk && entValid) { relE = (float)((g_.lon - entLon) * 111320.0 * cos(entLat * 0.01745329252)); relN = (float)((g_.lat - entLat) * 111320.0); relValid = true; }
      pathM = pathIn();
      if (ms - tTrk_ >= 1000) { tTrk_ = ms;
        bool moved = fabsf(alt - trkLastA_) >= 0.15f || fabsf(relE - trkLastE_) + fabsf(relN - trkLastN_) >= 0.8f || fabsf(angDiff(heading, trkLastH_)) >= 12.0f;
        if (moved || trkCount_ == 0) pushTrk(); }
    } else { inSec = 0; }
  }

  // ---------- 명령 ----------
  // 지금 차가 code 층에 있다고 알려 준다 (관제 '층 보정'). 주차장 안으로 확정하고 입구 높이를 다시 맞춘다.
  bool setFloorHere(float code) {
    if (!baroOk || code < -20 || code > 100) return false;
    float z = zOf(code);
    ground_ = hF_ - bias_ - z;            // altNow() == z 가 되게
    if (code == 1.0f && skyGood) { toOut(); return true; }
    if (ctx != CTX_PARK) { if (ctx != CTX_CAND) startSession(); ctx = CTX_PARK; }
    inPark = true; anchored_ = true; holding_ = false; stillT_ = 0; tMove_ = 0; floorCode = code; alt = z; pend_ = 0;
    return true;
  }
  void resetGround() { ctx = CTX_UNKNOWN; anchored_ = false; inPark = false; holding_ = false; floorCode = 1; tGood_ = 0; }
  // 전원이 꺼졌다 켜졌을 때 : 꺼지기 전 주차장 상태를 되살린다 (차는 그 사이 안 움직였다고 본다)
  void restorePark(float savedAlt, float code, double eLat, double eLon, bool eValid, uint16_t sess) {
    restoreAlt_ = savedAlt; restorePending_ = true; ctx = CTX_PARK; inPark = true; floorCode = code; alt = savedAlt;
    entLat = eLat; entLon = eLon; entValid = eValid; session = sess; rampSeen_ = true;
  }
  // 층 표 : "1:0,-1:-4.2,-2:-7.0"  (사람이 읽는 층 이름 : 1=1층, -1=지하1층, -2=지하2층. 0 은 없다)
  bool parseMap(const char* t) {
    FloorEnt tmp[CARO_FLRMAP_N]; int n = 0; const char* p = t;
    while (*p) {
      char* e; double fl = strtod(p, &e); if (e == p || *e != ':') return false; p = e + 1;
      double z = strtod(p, &e); if (e == p) return false; p = e;
      if (fl == 0 || fl < -20 || fl > 100 || !isfinite(z) || z < -80 || z > 400 || n >= CARO_FLRMAP_N) return false;
      tmp[n].code = humanToCode((float)fl); tmp[n].z = (float)z; n++;
      if (*p == ',') p++; else if (*p) return false;
    }
    if (n < 2) return false;
    for (int i = 0; i < n; i++) map[i] = tmp[i];
    mapN = n; return true;
  }
  int mapStr(char* out, int cap) { int k = 0; out[0] = 0;
    for (int i = 0; i < mapN && k < cap - 16; i++) k += snprintf(out + k, cap - k, "%s%g:%.2f", i ? "," : "", (double)codeToHuman(map[i].code), (double)map[i].z);
    return k; }
  bool markFloor(float humanFl) {            // 지금 높이를 그 층의 바닥으로 기록
    if (!baroOk || !anchored_ || humanFl == 0) return false;
    float code = humanToCode(humanFl), a = holding_ ? holdAlt_ : altNow();
    if (!isfinite(a) || a < -80 || a > 400) return false;
    for (int i = 0; i < mapN; i++) if (map[i].code == code) { map[i].z = a; return true; }
    if (mapN >= CARO_FLRMAP_N) return false;
    map[mapN].code = code; map[mapN].z = a; mapN++;
    if (entValid) { mapLat = entLat; mapLon = entLon; mapHasPos = true; }
    return true;
  }
  void clearMap() { mapN = 0; mapHasPos = false; }
  static float humanToCode(float h) { return h >= 1 ? h : h + 1; }      // -1(지하1층) → 0
  static float codeToHuman(float c) { return c >= 1 ? c : c - 1; }      // 0 → -1
  // "B2", "B1.5", "3", "1.5" → 층 번호(관제 규약). 실패하면 NAN
  static float parseFloorStr(const char* s) {
    while (*s == ' ') s++;
    if (*s == 'B' || *s == 'b') { char* e; double v = strtod(s + 1, &e); if (e == s + 1 || v <= 0) return NAN; return (float)(1.0 - v); }
    char* e; double v = strtod(s, &e); if (e == s) return NAN; return (float)v;
  }
  const char* envStr() const {
    switch (ctx) { case CTX_OUT: return hill > 0 ? "실외 · 오르막" : (hill < 0 ? "실외 · 내리막" : "실외"); case CTX_CAND: return "실내 확인중"; case CTX_PARK: return lift ? "주차장(승강기)" : "주차장";
                   case CTX_TUNNEL: return "터널·지하차도"; default: return "확인중"; } }
  const char* ctxStr() const {
    switch (ctx) { case CTX_OUT: return "out"; case CTX_CAND: return "cand"; case CTX_PARK: return "park"; case CTX_TUNNEL: return "tunnel"; default: return "unknown"; } }

  // ---------- 궤적 (1초 간격, 관제 원기둥용) ----------
  //  "seq0;e,n,a,h;e,n,a,h;…"  e,n = 입구 기준 동·북(0.1m 단위 정수), a = 높이(0.1m), h = 방위(도)
  //  마지막으로 넘겨준 뒤 새로 쌓인 점만 준다. 관제는 seq 로 이어 붙인다.
  int trackTake(char* out, int cap) {
    out[0] = 0; trkTaken_ = 0; if (trkCount_ == 0) return 0;
    int k = snprintf(out, cap, "%u", (unsigned)(trkSeq_ - trkCount_));
    int i = 0;
    for (; i < trkCount_ && k < cap - 28; i++) { const Trk& t = trk_[(trkHead_ + CARO_TRK_N - trkCount_ + i) % CARO_TRK_N];
      k += snprintf(out + k, cap - k, ";%d,%d,%d,%d", (int)t.e, (int)t.n, (int)t.a, (int)t.h); }
    trkTaken_ = i;                         // 이번에 실어 보낸 개수 (한 번에 다 못 실으면 나머지는 다음 보고에)
    return k;
  }
  // 전송에 성공했을 때 부른다 : 실어 보낸 만큼만 지운다 (실패하면 안 불러서 다음에 다시 보낸다). 예전에는 못 실은 점까지 통째로 지웠다
  void trackAck() { if (trkTaken_ > trkCount_) trkTaken_ = trkCount_; trkCount_ -= trkTaken_; trkTaken_ = 0; }
  int  trackPending() const { return trkCount_; }
  // 두 코어로 나뉜 펌웨어용 : 넘겨준 시점의 끝 번호까지만 지운다 (그 뒤에 쌓인 점은 남긴다)
  uint32_t trackSeqEnd() const { return trkSeq_; }
  void trackAckTo(uint32_t seqEnd) { uint32_t rem = trkSeq_ - seqEnd; if (rem > (uint32_t)trkCount_) rem = (uint32_t)trkCount_; trkCount_ = (int)rem; }
  float groundRaw() const { return ground_; }
  float holdAltV() const { return holdAlt_; }

private:
  struct Ring { float h, odo; bool good; uint16_t usp; };   // usp = 그때까지 '속도를 모르던 초' 의 누적 (두 기록의 값이 같아야 그 사이 주행거리를 믿을 수 있다)
  struct Trk { int16_t e, n, a, h; };
  enum { RING = 48 };
  Gnss g_; bool gSeen_ = false; uint32_t tGnss_ = 0;
  bool still_ = true; float yaw_ = NAN; int acc_ = -1;
  float pbuf_[5]; int pbi_ = 0, pbn_ = 0; float pBase_ = 0; bool tInit_ = false;
  float hF_ = 0, hS_ = 0, hRaw_ = 0, vF_ = 0; int rej_ = 0; uint32_t tLastBaro_ = 0, tBaroOk_ = 0, tUpd_ = 0, tRing_ = 0, tTrk_ = 0, tLastGoodMs_ = 0;
  float ground_ = 0, bias_ = 0; bool anchored_ = false;
  float tGood_ = 0, tLost_ = 0, tFast_ = 0, tSlow_ = 0, inT_ = 0, stillT_ = 0, moveT_ = 0, tMove_ = 0, liftT_ = 0;
  float vLast_ = NAN, vAvg_ = 0, vMaxIn_ = 0, odo_ = 0, odoIn_ = 0, hIn_ = 0;
  bool headInit_ = false, rampSeen_ = false, entryRamp_ = false, holding_ = false, freeze_ = false; float holdAlt_ = 0, sinceMove_ = 0, liftStop_ = 0, entryGrade_ = 0, napT_ = 0, tripBase_ = 0; bool tripSet_ = false, tripArm_ = false;
  Ring ring_[RING]; int ri_ = 0, rn_ = 0; uint16_t usp_ = 0; float entryDrop_ = 0, tunT_ = 0; bool roadIn_ = false;
  void toTunnel(bool road) { ctx = CTX_TUNNEL; inPark = false; roadIn_ = road; tunT_ = 0; }
  double lastGoodLat_ = 0, lastGoodLon_ = 0; bool haveGood_ = false;
  float pend_ = 0; float pendCode_ = 0;
  bool restorePending_ = false; float restoreAlt_ = 0;
  Trk trk_[CARO_TRK_N]; int trkHead_ = 0, trkCount_ = 0, trkTaken_ = 0; uint32_t trkSeq_ = 0; float trkLastA_ = 0, trkLastE_ = 0, trkLastN_ = 0, trkLastH_ = 0;
  // 층고 학습
  float fhBuf_[9]; int fhN_ = 0, fhI_ = 0; float parkedAlt_ = 0; bool parkedSet_ = false, capd_ = false;

  static float wrap360(float a) { while (a >= 360) a -= 360; while (a < 0) a += 360; return a; }
  static float angDiff(float a, float b) { float d = a - b; while (d > 180) d -= 360; while (d < -180) d += 360; return d; }
  static double distM(double la1, double lo1, double la2, double lo2) { double dy = (la2 - la1) * 111320.0, dx = (lo2 - lo1) * 111320.0 * cos(la1 * 0.01745329252); return sqrt(dx * dx + dy * dy); }
  float altNow() {
    if (restorePending_ && baroOk) { ground_ = hF_ - restoreAlt_; bias_ = 0; anchored_ = true; restorePending_ = false; }
    return hF_ - ground_ - bias_;
  }
  float pathIn() const { return odo_ - odoIn_; }
  float netDist() const { return relValid ? sqrtf(relE * relE + relN * relN) : 0.0f; }
  // 진입 뒤 지금까지 : 높이 변화 대비 주행거리(기울기) 또는 회전량으로 '경사로' 판단
  bool rampNow(float aabs) {
    if (aabs < cfg.rampMinH) return false;
    bool spdKnown = isfinite(vLast_) && gSeen_ && g_.valid;
    if (spdKnown) { if (rampWindow(80.0f, (int)inT_)) return true; }
    return turnDeg >= cfg.rampTurnDeg && (!relValid || netDist() <= cfg.parkRadiusM);
  }
  // 최근 기록 안에 '주행거리 대비 높이 변화가 rampGrade 이상' 인 구간이 있는가 (rampMinH 이상, 구간 길이 maxLen 이내)
  bool rampWindow(float maxLen, int maxSec) {
    for (int i = 1; i < rn_ && i <= maxSec; i++) { const Ring& a = ring_[(ri_ + RING - 1) % RING]; const Ring& b = ring_[(ri_ + RING - 1 - i) % RING];
      if (a.usp != b.usp) break;                 // ★그 사이에 속도를 모르던 초가 있다 → 주행거리가 '가정값(3m/s)' 이라 기울기를 믿을 수 없다
      { const Ring& c = ring_[(ri_ + RING - i) % RING]; if (fabsf(c.h - b.h) > 1.2f) break; }   // ★1초에 1.2m 넘게 뛰었다 = 기압이 갑자기 변한 것(송풍기·창문) → 그 앞쪽은 보지 않는다
      float dh = fabsf(a.h - b.h), dd = a.odo - b.odo;
      if (dd > maxLen) break;
      if (dh >= cfg.rampMinH && dd >= 3.0f && dh / dd >= cfg.rampGrade) return true; }
    return false;
  }
  // ★속도를 모를 때(추측항법 끔·위성 없음) : 지붕 밑에 들어온 뒤 maxSec 초 안에 need(m) 넘게 오르내렸는가
  bool vertRun(float need, int maxSec) {
    if (rn_ < 2) return false; const Ring& a = ring_[(ri_ + RING - 1) % RING];
    float prevH = a.h;
    for (int i = 1; i < rn_ && i <= maxSec && i <= (int)inT_; i++) { const Ring& b = ring_[(ri_ + RING - 1 - i) % RING]; if (b.good) break;
      if (fabsf(prevH - b.h) > 0.9f) return false;        // 1초에 0.9m 넘게 뛴 값이 끼어 있다 = 이동이 아니라 기압이 갑자기 변한 것(송풍기·창문·문) → 경사로로 치지 않는다
      prevH = b.h;
      if (fabsf(a.h - b.h) >= need) return true; }
    return false;
  }
  void startSession() { session++; inT_ = 0; odoIn_ = odo_; turnDeg = 0; relE = relN = 0; relValid = false; vMaxIn_ = 0; rampSeen_ = false; tFast_ = 0; tSlow_ = 0;
    trkCount_ = 0; trkSeq_ = 0; trkHead_ = 0; tMove_ = 0; parkedSet_ = false; capd_ = false; pend_ = 0; floorCode = 1;
    entValid = haveGood_; entLat = lastGoodLat_; entLon = lastGoodLon_; }
  // 위성이 끊긴 순간 : 입구 높이를 '끊기기 전 평지' 로 되짚어 잡는다
  void enter(uint32_t ms, Ctx to) {
    (void)ms; startSession();
    // 가장 최근의 '하늘이 보이던' 기록부터 뒤로 가며, 3초 구간 기울기가 5% 아래로 떨어지는 지점(=평지)을 찾는다. 최대 30초·45m·10m
    int k = 0; while (k < rn_ && !ring_[(ri_ + RING - 1 - k) % RING].good) k++;
    float g = hF_, g0 = hF_, od0 = odo_, odg = odo_, gmax = 0;
    if (k < rn_) { const Ring& r0 = ring_[(ri_ + RING - 1 - k) % RING]; g = g0 = r0.h; od0 = odg = r0.odo;
      for (int j = k; j + 3 < rn_ && j - k < 30; j++) { const Ring& a = ring_[(ri_ + RING - 1 - j) % RING]; const Ring& b = ring_[(ri_ + RING - 1 - j - 3) % RING];
        float dd = a.odo - b.odo, dh = fabsf(a.h - b.h);
        bool sloped = dd <= 30.0f && dh >= 0.3f && dh / fmaxf(dd, 1.0f) >= 0.05f;
        if (sloped && dh / fmaxf(dd, 1.0f) > gmax) gmax = dh / fmaxf(dd, 1.0f);
        if (r0.odo - b.odo > 45.0f || fabsf(r0.h - b.h) > 10.0f) { g = a.h; odg = a.odo; break; }
        if (!sloped) { g = b.h; odg = b.odo; break; }             // 평지에 닿았다 (구간의 오래된 쪽 끝이 평지)
        g = b.h; odg = b.odo; } }
    entryDrop_ = 0;                                            // 지붕 밑으로 들어오기 직전 30초 동안의 높이 변화 (내려왔으면 음수)
    if (k < rn_) { int j = k + 30; if (j > rn_ - 1) j = rn_ - 1; entryDrop_ = ring_[(ri_ + RING - 1 - k) % RING].h - ring_[(ri_ + RING - 1 - j) % RING].h; }
    // 지붕 없는 진입 경사로를 이미 탔는가 : 되짚은 구간이 1m 이상 · 평균 기울기 7% 이상
    (void)od0; (void)odg; entryGrade_ = gmax;                  // 되짚은 구간에서 가장 가파른 3초 기울기
    entryRamp_ = fabsf(g0 - g) >= 1.0f && entryGrade_ >= cfg.rampGrade;
    if (!entryRamp_) g = g0;            // 완만한 내리막(지하차도 진입로·언덕길)은 되짚지 않는다 — 끊기기 직전 높이가 입구
    ground_ = g; bias_ = 0; anchored_ = true; holding_ = false; ctx = to; inPark = false;
  }
  void confirm() { ctx = CTX_PARK; inPark = true; pend_ = 0; floorCode = nearestCode(altNow()); }
  void toOut() { if (ctx == CTX_PARK || ctx == CTX_CAND) { tripBase_ = hF_ - bias_; roadAlt = 0; tripArm_ = false; }   // 주차장을 나오면 주행 고도는 0 에서 다시
    ctx = CTX_OUT; inPark = false; floorCode = 1; alt = 0; holding_ = false; lift = false; tFast_ = 0; rampSeen_ = false; relValid = false; turnDeg = 0; }   // ★궤적(trk)은 지우지 않는다 — 지하에서 못 보낸 점을 나온 뒤에 보낸다
  bool mapActive() const {
    if (mapN < 2) return false;
    if (!mapHasPos || !entValid) return true;
    return distM(mapLat, mapLon, entLat, entLon) <= 200.0;
  }
  float fH() const { return cfg.floorH; }
  float zOf(float code) const { if (mapActive()) for (int i = 0; i < mapN; i++) if (map[i].code == code) return map[i].z; return (code - 1.0f) * fH(); }
  float nearestCode(float a) const {
    if (mapActive()) { int bi = 0; float bd = fabsf(a - map[0].z); for (int i = 1; i < mapN; i++) { float d = fabsf(a - map[i].z); if (d < bd) { bd = d; bi = i; } } return map[bi].code; }
    float q = roundf(a / fH() / cfg.floorStep) * cfg.floorStep; float c = 1.0f + q; if (c > 60) c = 60; if (c < -15) c = -15; return c;
  }
  void floorUpdate(float a, float dt) {
    float want = nearestCode(a), cur = floorCode;
    float zc = zOf(cur), zw = zOf(want);
    // 지금 층을 지키려는 힘 : 새 층이 '히스테리시스만큼 더' 가까워야 하고, 1초 이상 이어져야 바꾼다
    bool change = (want != cur) && (fabsf(a - zc) - fabsf(a - zw) >= 2.0f * cfg.floorHys);
    if (change) { if (pendCode_ != want) { pendCode_ = want; pend_ = 0; } pend_ += dt; if (pend_ >= 1.0f || still_) { floorCode = want; pend_ = 0; } }
    else pend_ = 0;
    // 여유 : 가장 가까운 다른 층과의 거리 차 / 2
    float zc2 = zOf(floorCode), second = 1e9f;
    if (mapActive()) { for (int i = 0; i < mapN; i++) if (map[i].code != floorCode) second = fminf(second, fabsf(a - map[i].z)); }
    else second = fminf(fabsf(a - (zc2 + fH() * cfg.floorStep)), fabsf(a - (zc2 - fH() * cfg.floorStep)));
    floorMargin = (second > 1e8f) ? 0.0f : (second - fabsf(a - zc2)) / 2.0f;
    float half = (mapActive() ? 1.5f : fH() * cfg.floorStep * 0.5f);
    float c1 = floorMargin / half; if (c1 < 0) c1 = 0; if (c1 > 1) c1 = 1;
    float c2 = 1.0f - altErr / half; if (c2 < 0) c2 = 0; if (c2 > 1) c2 = 1;
    floorConf = (int)(100.0f * (0.25f + 0.75f * c1) * c2 + 0.5f);
  }
  // 층고 학습 : 주차장 안에서 2.5초 이상 선 높이들 사이의 차가 한 층 범위(2.3~4.6m)면 표본으로 모아 중앙값
  void learnFloorH(float a) {
    if (mapActive()) return;
    if (still_ && stillT_ >= 2.5f) {
      if (!capd_) { capd_ = true;
        if (parkedSet_) { float d = fabsf(a - parkedAlt_);
          if (d >= 2.3f && d <= 4.6f) { fhBuf_[fhI_] = d; fhI_ = (fhI_ + 1) % 9; if (fhN_ < 9) fhN_++;
            if (fhN_ >= 3) { float t[9]; for (int i = 0; i < fhN_; i++) t[i] = fhBuf_[i];
              for (int i = 0; i < fhN_; i++) for (int j = i + 1; j < fhN_; j++) if (t[j] < t[i]) { float x = t[i]; t[i] = t[j]; t[j] = x; }
              float m = (fhN_ & 1) ? t[fhN_ / 2] : (t[fhN_ / 2 - 1] + t[fhN_ / 2]) * 0.5f;
              if (m >= 2.4f && m <= 4.4f) { cfg.floorH = m; learnedFloorH = m; } } } }
        parkedAlt_ = a; parkedSet_ = true; }
    } else if (!still_) capd_ = false;
  }
  void pushTrk() {
    auto cl = [](float v) { if (v > 32000) v = 32000; if (v < -32000) v = -32000; return (int16_t)lroundf(v); };
    Trk t; t.e = cl(relE * 10); t.n = cl(relN * 10); t.a = cl(alt * 10); t.h = cl(heading);
    trk_[trkHead_] = t; trkHead_ = (trkHead_ + 1) % CARO_TRK_N; if (trkCount_ < CARO_TRK_N) trkCount_++; trkSeq_++;
    trkLastA_ = alt; trkLastE_ = relE; trkLastN_ = relN; trkLastH_ = heading;
  }
};

// =====================================================================================
//  수직축 회전속도 — 센서가 어떤 자세로 붙어 있어도 맞게 (v9.8 기판은 MPU6050 이 세워져 있다)
//  예전 : gz 만 썼다 → 센서가 눕혀 있을 때만 맞고, 세워 달면 차가 돌아도 0 에 가깝게 나온다.
//  지금 : 중력 방향(가속도 저역통과)을 구해 '자이로 벡터 · 중력 단위벡터' = 수직축 회전.
// =====================================================================================
class YawEstimator {
public:
  float gx0 = 0, gy0 = 0, gz0 = 0;      // 자이로 영점(°/s)
  float ux = 0, uy = 0, uz = 1;         // 중력 단위벡터(센서 좌표)
  bool  init = false;
  // a* : 가속도(g), g* : 자이로(°/s). 돌려주는 값 : 수직축 회전속도(°/s, 위에서 볼 때 시계방향 +)
  float update(float ax, float ay, float az, float gx, float gy, float gz, bool still, float dt) {
    float m = sqrtf(ax * ax + ay * ay + az * az);
    if (m > 0.6f && m < 1.4f) { float k = init ? fminf(1.0f, dt / 1.5f) : 1.0f; ux += (ax / m - ux) * k; uy += (ay / m - uy) * k; uz += (az / m - uz) * k;
      float n = sqrtf(ux * ux + uy * uy + uz * uz); if (n > 0.1f) { ux /= n; uy /= n; uz /= n; } init = true; }
    if (still) { float k = fminf(1.0f, dt / 4.0f); gx0 += (gx - gx0) * k; gy0 += (gy - gy0) * k; gz0 += (gz - gz0) * k; }   // 정지 중 영점 추적
    float w = (gx - gx0) * ux + (gy - gy0) * uy + (gz - gz0) * uz;
    return -w;     // 중력 벡터는 위를 향한 반작용(+1g) → 위에서 본 시계방향을 + 로
  }
};

} // namespace caro
#endif
