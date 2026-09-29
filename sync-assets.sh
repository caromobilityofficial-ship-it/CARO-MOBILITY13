#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
#  안드로이드 앱 자산 동기화 — 웹 파일을 app/src/main/assets/ 로 복사한다.
#
#  ★왜 필요한가 (v9.8 11차 검수):
#    안드로이드 앱은 웹 파일의 **사본**을 자기 assets/ 에 품고 산다.
#    이게 저절로 따라오지 않아서, 웹은 v101.3(2026-09-07) 인데
#    안드로이드는 2026-09-01 판이 그대로 들어 있었다 (script.js 만 39KB 차이).
#    → 웹을 고쳐도 **앱 사용자에게는 반영되지 않는다.**
#
#  쓰는 법:  ./sync-assets.sh          (동기화)
#            ./sync-assets.sh --check  (다른 것이 있으면 1 로 끝남 — CI/검사용)
#
#  ★안드로이드 앱을 새로 빌드하기 전에 반드시 한 번 돌릴 것.
# ═══════════════════════════════════════════════════════════════════════════
cd "$(dirname "$0")" || exit 1
AS=app/src/main/assets
[ -d "$AS" ] || { echo "★$AS 없음"; exit 1; }

check=0; [ "$1" = "--check" ] && check=1
n=0; diffs=()
for f in $(ls "$AS"); do
  [ -f "$f" ] || continue                      # 웹에 없는 앱 전용 파일은 건드리지 않는다
  if ! cmp -s "$f" "$AS/$f"; then
    diffs+=("$f")
    if [ $check -eq 0 ]; then cp "$f" "$AS/$f"; echo "  동기화: $f"; fi
    n=$((n+1))
  fi
done

if [ $check -eq 1 ]; then
  if [ $n -gt 0 ]; then
    echo "★안드로이드 자산이 웹과 다릅니다 ($n 개): ${diffs[*]}"
    echo "  ./sync-assets.sh 를 돌리고 앱을 다시 빌드하세요."
    exit 1
  fi
  echo "안드로이드 자산 = 웹 (동기화됨)"
else
  [ $n -eq 0 ] && echo "이미 같음 — 바꿀 것 없음" || echo "총 $n 개 동기화 완료. ★앱을 다시 빌드해야 사용자에게 전달됩니다."
fi
