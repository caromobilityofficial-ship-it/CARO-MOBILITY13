/* ═══════════════════════════════════════════════════════════════
   caro-travel.js — 인천, 한 바퀴 돌아볼까요 (드라이브 코스)  v1 · 2026-11-06
   ───────────────────────────────────────────────────────────────
   · 홈 화면에 '인천 드라이브 코스' 가로 카드 줄을 넣는다 (CARO The Black 아래)
   · 코스 목록 → 코스 상세(경로·팁·예약) → 여행지 상세(부가 설명·지도·이전/다음)
   · 내용은 홈페이지(caromobility.kr #course)와 같은 9개 코스 + 여행지별 설명
   · 그림은 직접 그린 SVG 일러스트(저작권 걱정 없음). 사진을 쓰려면 아래 데이터의
     img:'travel/xxx.jpg' 만 채우면 그 사진이 대신 들어간다 (공공누리 제1유형 사진 권장)
   · 안드로이드 뒤로가기(caroBack) · 브라우저 뒤로가기 모두 한 단계씩 닫힌다
   · 지도 버튼: 안드로이드 앱 → 카카오맵/네이버지도 앱 바로 열기, 그 외 → 웹 지도
   ═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  if(window.CaroTravel) return;

  /* ── 0. 글꼴: 앱 전체가 원래 의도한 Pretendard 를 실제로 불러온다 (홈페이지와 같은 CDN) ── */
  (function(){
    if(document.getElementById('caro-pretendard')) return;
    var l=document.createElement('link'); l.id='caro-pretendard'; l.rel='stylesheet';
    l.href='https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css';
    (document.head||document.documentElement).appendChild(l);
    var s=document.createElement('style'); s.id='caro-pretendard-var';
    s.textContent=":root{--font:'Pretendard Variable','Pretendard',-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Noto Sans KR','Malgun Gothic',sans-serif;}";
    (document.head||document.documentElement).appendChild(s);
  })();

  /* ═════════ 1. 데이터 ═════════ */
  var NOTE_DIST='거리는 CARO 거점(송도 · 구월동 · 부평 · 동인천) 출발 기준의 대략적인 참고 값이며, 출발 거점 · 실제 경로 · 교통 상황에 따라 달라집니다.';
  var NOTE_INFO='운영 시간 · 요금 · 개방 여부는 계절과 현장 사정에 따라 바뀔 수 있어요. 방문 전에 한 번 확인해 주세요.';

  var COURSES=[
    { id:'songdo', no:'01', art:'night_city', title:'송도 · 소래 야경', area:'연수구 · 남동구', tags:['야경','가장 가까움'], theme:['night'],
      dist:'약 30km', dur:'2~3시간', when:'해 질 무렵 ~ 밤', car:'모닝',
      sum:'퇴근하고 저녁에 다녀오기 좋은 코스. 센트럴파크 수변을 지나 소래습지 풍차까지, 인천 안에서만 도는 짧은 길입니다.',
      tips:['해 지기 30분 전 오션스코프에 닿으면 노을과 야경을 한 번에 볼 수 있어요.','소래포구는 주말 저녁 주차가 붐빕니다. 주변 공영주차장을 먼저 찾아 두세요.','가까운 코스라 3시간 대여로도 여유 있게 다녀올 수 있어요.'],
      stops:[
        { n:'송도 센트럴파크', q:'송도센트럴파크', cat:'park', lm:'canal', cl:'도심 공원', stay:'40분', hl:['산책','야경','사진'],
          one:'바닷물을 끌어들인 수로를 따라 걷는 도심 공원',
          d:['고층 빌딩 사이로 바닷물을 끌어들인 수로가 길게 이어지는 송도의 대표 공원입니다. 수로를 따라 산책로가 나 있어 가볍게 걷기 좋습니다.','해가 지면 주변 빌딩의 불빛이 물 위에 비쳐, 이 코스의 야경이 시작되는 곳이에요.'],
          t:['공원 주변 공영주차장을 이용하세요.','보트 등 수상 레저는 운영 시간과 요일이 달라 현장에서 확인하세요.'] },
        { n:'송도 오션스코프', q:'오션스코프', cat:'tower', cl:'전망대', stay:'30분', hl:['일몰','인천대교','무료'],
          one:'컨테이너로 만든 무료 전망대에서 보는 인천대교',
          d:['컨테이너를 비스듬히 쌓아 만든 전망대로, 바다 건너 인천대교와 송도 스카이라인이 한눈에 들어옵니다.','상시 개방하는 무료 전망대이고, 앞쪽 호수와 나무 데크가 있어 해 질 녘에 특히 사람이 많이 찾습니다.'],
          t:['일몰 시간에 맞춰 도착하면 가장 좋아요.','바닷바람이 강하니 얇은 겉옷을 챙기세요.'] },
        { n:'소래습지생태공원', q:'소래습지생태공원', cat:'wetland', cl:'생태공원', stay:'1시간', hl:['풍차','갈대','노을'],
          one:'옛 염전 위로 선 풍차와 드넓은 갈대밭',
          d:['옛 염전 자리에 갯골과 갈대숲이 펼쳐진 생태공원입니다. 공원의 상징인 풍차 주변은 해 질 무렵 사진 명소로 꼽힙니다.','평지 산책로가 길게 이어져 천천히 걷기 좋고, 계절마다 갈대와 억새의 색이 달라집니다.'],
          t:['그늘이 적어 여름에는 모자와 물을 챙기세요.','해가 지면 금방 어두워지니 조금 일찍 들르는 것이 좋아요.'] },
        { n:'소래포구', q:'소래포구', cat:'market', cl:'포구 · 어시장', stay:'1시간', hl:['꽃게','회','시장'],
          one:'갓 들어온 해산물이 가득한 인천의 대표 포구',
          d:['인천을 대표하는 재래 어항이자 어시장으로, 제철 꽃게와 새우, 젓갈을 사거나 회를 맛볼 수 있습니다.','포구 옆 옛 철교와 해안 산책로를 따라 걸으며 포구의 저녁 풍경을 보기 좋습니다.'],
          t:['해산물은 꼭 밀봉 포장해 주세요. 차 안에 냄새가 배면 다음 이용자가 불편해요.','주말 저녁에는 시장 주변 도로가 혼잡합니다.'] }
      ]},
    { id:'ara', no:'02', art:'sunset_canal', title:'아라뱃길 · 정서진 노을', area:'계양구 · 검단구 · 서구', tags:['노을','초보 추천'], theme:['night'],
      dist:'약 40km', dur:'3~4시간', when:'해 지기 1시간 전 도착', car:'모닝',
      sum:'뱃길을 따라 곧게 뻗은 길이라 운전이 편합니다. 해 지기 한 시간 전에 정서진에 닿으면 노을종 너머로 서해 낙조를 볼 수 있습니다.',
      tips:['뱃길을 따라 곧은 길이 이어져 초보 운전자에게 추천해요.','정서진에는 해 지기 한 시간 전쯤 도착하세요.','아라타워 전망대(무료)에 오르면 서해와 인천대교까지 보입니다.'],
      stops:[
        { n:'아라마루전망대', q:'아라마루전망대', cat:'tower', lm:'skywalk', cl:'전망대', stay:'30분', hl:['스카이워크','유리 바닥','무료'],
          one:'절벽 위로 둥글게 뻗은 유리 바닥 스카이워크',
          d:['경인아라뱃길 계양 구간의 절벽 위에 원형으로 뻗어 나간 전망대입니다. 바닥 일부가 유리로 되어 있어 까마득한 아래로 뱃길이 내려다보입니다.','입장료 없이 오를 수 있고, 가까운 아라폭포와 함께 둘러보기 좋습니다.'],
          t:['높은 곳이 무섭다면 유리 바닥 구간은 가장자리로 피해서 걸으세요.','바람이 강한 날에는 모자가 날아가지 않게 조심하세요.'] },
        { n:'아라폭포', q:'아라폭포', cat:'fall', cl:'폭포 · 경관', stay:'30분', hl:['야간 조명','사진'],
          one:'해가 지면 불이 켜지는 뱃길 옆 인공폭포',
          d:['아라뱃길 절벽을 따라 물이 쏟아지는 인공폭포로, 아라마루전망대와 가까워 함께 들르기 좋습니다.','해가 지면 조명이 들어와 낮과는 다른 야경을 볼 수 있습니다.'],
          t:['폭포는 계절과 요일에 따라 가동 시간이 다를 수 있어요. 방문 전에 확인하세요.'] },
        { n:'정서진 노을종', q:'정서진', cat:'sunset', lm:'sunset_ring', cl:'노을 명소', stay:'1시간', hl:['노을종','낙조','아라타워'],
          one:'서쪽 끝에서 맞는 서해 낙조',
          d:['경복궁을 기준으로 정서쪽에 있어 이름 붙은 일몰 명소입니다. 조약돌 모양의 노을종 가운데로 해가 지는 장면이 유명합니다.','소원을 적어 거는 노을벽, 피아노 조형물, 바다 위 나무다리인 아라빛섬도 함께 걸어 볼 만합니다.'],
          t:['바로 옆 아라타워 23층 전망대는 무료로 오를 수 있어요.','주차장이 넓어 차를 대기 편합니다.'] },
        { n:'청라호수공원', q:'청라호수공원', cat:'lake', cl:'호수공원', stay:'40분', hl:['야경','산책','분수'],
          one:'호수 둘레로 불이 켜지는 청라의 야경 공원',
          d:['청라국제도시 한가운데 큰 호수를 둘러싼 공원으로, 호수를 따라 산책로와 자전거길이 이어집니다.','해가 진 뒤 주변 빌딩과 조명이 호수에 비치는 야경이 이 코스의 마무리로 좋습니다.'],
          t:['음악분수는 운영 기간과 시간이 정해져 있으니 미리 확인하세요.'] }
      ]},
    { id:'yeongjong', no:'03', art:'golden_bridge', title:'영종 · 용유 선셋', area:'영종구', tags:['일몰','인기'], theme:['sea','night'],
      dist:'약 80km', dur:'반나절', when:'오후 출발 · 일몰', car:'아반떼',
      toll:'인천대교 통행료가 별도로 발생합니다',
      note:{k:'참고', t:'하늘정원은 봄·가을 꽃 시즌에 맞춰 개방하는 기간이 있어 방문 전에 개방 여부를 확인하세요.'},
      sum:'인천대교를 건너 바다를 끼고 도는 인천의 대표 코스. 해질 무렵 을왕리에 도착하도록 출발 시간을 잡는 것이 좋습니다.',
      tips:['해질 무렵 을왕리에 닿도록 출발 시간을 거꾸로 계산해 보세요.','주말 오후에는 영종 방향 정체가 잦아요. 대여 시간을 넉넉히 잡으세요.','갯벌이나 모래사장에 들렀다면 차에 타기 전에 신발을 한 번 털어 주세요.'],
      stops:[
        { n:'하늘정원', q:'인천공항 하늘정원', cat:'garden', cl:'정원', stay:'40분', hl:['꽃밭','비행기','무료'],
          one:'머리 위로 비행기가 내려앉는 공항 옆 꽃밭',
          d:['인천국제공항 옆에 조성된 넓은 정원으로, 계절마다 코스모스와 억새, 핑크뮬리 등이 피어납니다.','공항을 오가는 비행기가 가까이 지나가 사진 찍기 좋고, 해 질 무렵에는 영종도의 노을도 볼 수 있습니다.'],
          t:['꽃 시즌에 맞춰 개방하는 기간이 있어요. 방문 전에 개방 여부를 확인하세요.','입장료 없이 둘러볼 수 있습니다.'] },
        { n:'마시안해변', q:'마시안해변', cat:'beach', cl:'해변 · 갯벌', stay:'40분', hl:['갯벌','카페','산책'],
          one:'물이 빠지면 넓게 드러나는 갯벌 해변',
          d:['용유도 서쪽의 조용한 해변으로, 썰물 때면 넓은 갯벌이 드러나 산책과 갯벌 놀이를 즐기기 좋습니다.','해변을 따라 바다가 보이는 카페들이 모여 있어 노을 전 잠시 쉬어 가기 좋습니다.'],
          t:['물때(밀물·썰물 시간)를 확인하고 가면 갯벌을 더 넓게 볼 수 있어요.','갯벌에 들어간다면 갈아 신을 신발을 챙기세요.'] },
        { n:'을왕리해수욕장', q:'을왕리해수욕장', cat:'beach', cl:'해수욕장', stay:'1시간', hl:['일몰','조개구이','해변'],
          one:'수도권 서해 일몰의 대명사',
          d:['수도권에서 가장 많이 찾는 해변 중 하나로, 해변 정면 바다로 떨어지는 서해 일몰이 유명합니다.','해변 앞으로 조개구이집과 횟집이 줄지어 있어 노을을 보며 식사하기 좋습니다.'],
          t:['주말 저녁에는 해변 주차장이 붐빕니다.','일몰 시각을 미리 보고 30분 전에 도착하세요.'] },
        { n:'왕산마리나', q:'왕산마리나', cat:'marina', cl:'마리나', stay:'30분', hl:['요트','방파제','사진'],
          one:'요트가 줄지어 선 바다 위 항구',
          d:['을왕리 바로 옆, 요트들이 줄지어 정박한 마리나입니다. 방파제를 따라 걸으며 요트와 바다를 배경으로 사진을 남기기 좋습니다.','요트 체험 프로그램이 운영되기도 하니 관심이 있다면 미리 알아보세요.'],
          t:['방파제 위는 바람이 강하고 미끄러울 수 있어요.'] }
      ]},
    { id:'muui', no:'04', art:'island_day', title:'무의도 섬 한 바퀴', area:'영종구 무의도', tags:['바다','걷기 좋음'], theme:['sea'],
      dist:'약 85km', dur:'반나절', when:'오전 출발', car:'더 뉴 셀토스',
      toll:'인천대교 또는 영종대교 통행료가 별도로 발생합니다',
      sum:'다리로 이어져 있어 배를 타지 않고 섬에 들어갑니다. 하나개해변에서 소무의도까지 천천히 돌면 반나절이 알맞습니다.',
      tips:['소무의도는 차가 들어갈 수 없어요. 무의도 쪽에 주차하고 인도교를 걸어서 건너세요.','섬 안 도로는 좁고 굽은 길이 많으니 천천히 운전하세요.','편한 운동화를 신으면 무의바다누리길까지 걸을 수 있어요.'],
      stops:[
        { n:'잠진도', q:'잠진도', cat:'island', cl:'섬', stay:'20분', hl:['바닷길','드라이브'],
          one:'양옆으로 바다를 두고 달리는 둑길',
          d:['영종도에서 무의도로 가는 길목에 있는 작은 섬입니다. 양옆으로 바다가 펼쳐진 둑길을 달리는 구간이 이 코스에서 가장 시원한 드라이브 구간이에요.','물때에 따라 갯벌이 드러나거나 물이 차올라 풍경이 계속 바뀝니다.'],
          t:['둑길 위에서는 정차하지 말고 지정된 곳에 잠시 세우세요.'] },
        { n:'무의대교', q:'무의대교', cat:'bridge', cl:'다리', stay:'10분', hl:['바다 전망'],
          one:'배 없이 차로 섬에 드는 다리',
          d:['잠진도와 무의도를 잇는 다리로, 이 다리가 놓인 뒤로 배를 타지 않고 차로 무의도에 들어갈 수 있게 되었습니다.','다리 위에서 보는 바다와 섬 풍경이 무의도 여행의 첫인상이 됩니다.'],
          t:['다리 위에서는 정차할 수 없어요. 사진은 건너편에서 찍으세요.'] },
        { n:'하나개해수욕장', q:'하나개해수욕장', cat:'beach', cl:'해수욕장', stay:'1시간', hl:['갯벌','모래사장','데크길'],
          one:'넓은 갯벌과 모래사장이 펼쳐진 무의도의 대표 해변',
          d:['무의도에서 가장 큰 해변으로, 썰물이면 넓은 갯벌이 드러나고 모래사장이 길게 이어집니다.','해변 끝 바위 해안을 따라 데크 산책로가 이어져 바다를 가까이 보며 걷기 좋습니다.'],
          t:['입장료나 주차 요금이 있을 수 있으니 현장에서 확인하세요.','모래를 털고 차에 타 주세요.'] },
        { n:'소무의도', q:'소무의도', cat:'island', cl:'섬 · 걷기길', stay:'1시간 30분', hl:['인도교','무의바다누리길','트레킹'],
          one:'걸어서만 들어가는 작은 섬, 무의바다누리길',
          d:['무의도와 인도교로 이어진 작은 섬으로, 차는 들어갈 수 없고 걸어서 건넙니다.','섬 둘레를 잇는 무의바다누리길은 천천히 걸어도 한 시간 남짓이면 한 바퀴를 돌 수 있어, 반나절 코스의 마무리로 알맞습니다.'],
          t:['오르막과 계단이 있어요. 편한 신발을 신으세요.','섬 안에는 가게가 많지 않으니 물을 챙겨 가세요.'] }
      ]},
    { id:'airport', no:'05', art:'airport_dawn', title:'인천공항 픽업 · 배웅', area:'연수구 · 영종구', tags:['공항','가족'], theme:['sea'],
      dist:'약 90km', dur:'반나절', when:'항공편 시간', car:'대형 SUV',
      toll:'인천대교 또는 영종대교 통행료가 별도로 발생합니다',
      must:{k:'주의', t:'가족·지인을 태워 주는 용도로만 이용하세요. 돈을 받고 손님을 공항에 태워 주는 등 영업 목적으로 쓰는 것은 법으로 금지되어 있으며 적발 시 처벌받을 수 있습니다.'},
      note:{k:'참고', t:'공항 도착층 앞 도로는 오래 정차할 수 없어요. 마중 나갈 때는 단기주차장(요금 별도)에 세우고 입국장에서 만나세요.'},
      sum:'인천으로 여행 온 가족을 공항에서 맞이하고, 여행이 끝나면 다시 공항까지 편하게 배웅해 주세요. 짐이 많은 가족 여행도 넉넉한 SUV면 한 번에 실을 수 있습니다.',
      tips:['항공편 도착 시간과 터미널(제1·제2)을 미리 확인하고, 도착 30분 뒤쯤 공항에 닿도록 출발하세요.','캐리어가 많다면 넉넉한 SUV를 고르세요.','픽업과 배웅 사이 인천 여행은 위 드라이브 코스를 함께 둘러보세요.'],
      stops:[
        { n:'인천대교', q:'인천대교', cat:'bridge', lm:'cable', cl:'다리', stay:'지나가는 길', hl:['바다 위 드라이브','통행료'],
          one:'송도에서 영종도까지 바다 위를 달리는 다리',
          d:['송도국제도시와 영종도를 잇는 긴 바다 위 다리로, 송도·구월동 거점에서 공항으로 가는 가장 빠른 길입니다.','부평·동인천 거점에서 출발한다면 영종대교로 가는 길이 더 가까울 수 있어요.'],
          t:['통행료는 별도로 내야 합니다.','다리 위에서는 정차할 수 없어요.'] },
        { n:'인천공항 제1여객터미널', q:'인천국제공항 제1여객터미널', cat:'airport', cl:'공항', stay:'30분~1시간', hl:['T1','입국장','단기주차장'],
          one:'가족을 맞이하고 배웅하는 공항 제1터미널',
          d:['인천국제공항의 제1여객터미널입니다. 마중을 나갈 때는 단기주차장에 차를 세우고 입국장에서 만나는 것이 편합니다.','배웅할 때는 출국장 앞에 잠시 세워 짐을 내리고, 오래 머물러야 한다면 주차장을 이용하세요.'],
          t:['항공사에 따라 제1·제2터미널이 다릅니다. 항공권에 적힌 터미널을 꼭 확인하세요.','두 터미널은 서로 떨어져 있어요. 내비게이션 목적지를 정확한 터미널로 설정하세요.'] },
        { n:'인천공항 제2여객터미널', q:'인천국제공항 제2여객터미널', cat:'airport', cl:'공항', stay:'30분~1시간', hl:['T2','입국장','단기주차장'],
          one:'가족을 맞이하고 배웅하는 공항 제2터미널',
          d:['인천국제공항의 제2여객터미널입니다. 제1터미널과 떨어져 있으니 가족이 이용하는 항공사의 터미널을 먼저 확인하세요.','도착층 앞은 오래 정차할 수 없어, 단기주차장에 세운 뒤 마중 나가는 것이 좋습니다.'],
          t:['주차 요금은 이용 시간에 따라 따로 발생해요.','반납 시간에 늦지 않도록 공항에서 거점까지 걸리는 시간을 넉넉히 잡으세요.'] }
      ]},
    { id:'ganghwa', no:'06', art:'dusk_temple', title:'강화 남서부 해안도로', area:'강화군', tags:['장거리','낙조'], theme:['long','night'],
      dist:'약 120km', dur:'하루', when:'오후 출발 · 일몰', car:'쏘나타',
      sum:'초지대교로 들어가 갯벌을 끼고 서쪽으로 돌아 나오는 길. 장화리 일몰조망지는 강화에서 손꼽히는 낙조 자리입니다.',
      tips:['장거리 코스예요. 출발 전 연료 상태를 확인하세요.','주말에는 초지대교·강화대교 방면 정체가 잦습니다.','해넘이를 놓치기 싫다면 보문사를 먼저 들른 뒤 장화리에서 마무리하는 순서도 좋아요.'],
      stops:[
        { n:'초지대교', q:'초지대교', cat:'bridge', cl:'다리', stay:'10분', hl:['강화 관문','초지진'],
          one:'김포에서 강화로 드는 남쪽 관문',
          d:['김포와 강화도 남쪽을 잇는 다리로, 이 코스의 시작점입니다.','다리를 건너면 바로 옆에 조선 시대 해안 방어 시설인 초지진이 있어 잠깐 들러 보기 좋습니다.'],
          t:['초지진은 다리 건너 바로 오른편에 있어요.'] },
        { n:'전등사', q:'강화 전등사', cat:'temple', cl:'사찰', stay:'1시간', hl:['삼랑성','숲길','보물'],
          one:'삼랑성 안에 자리한 오래된 절',
          d:['정족산의 삼랑성(정족산성) 안에 자리한 오래된 절로, 숲길을 따라 성문을 지나 오르는 길이 운치 있습니다.','경내의 대웅보전은 보물로 지정된 목조 건물로, 처마 아래 조각에 얽힌 이야기로도 잘 알려져 있습니다.'],
          t:['주차장 이용 요금이 있을 수 있어요.','경내에서는 조용히 둘러봐 주세요.'] },
        { n:'동막해변', q:'동막해변', cat:'beach', cl:'해변 · 갯벌', stay:'40분', hl:['갯벌','소나무 숲','돈대'],
          one:'끝없이 펼쳐지는 강화 남쪽의 갯벌 해변',
          d:['강화도 남쪽 해안의 대표 해변으로, 물이 빠지면 넓게 펼쳐지는 갯벌이 장관입니다.','해변 뒤편 소나무 숲 그늘에서 쉬어 가기 좋고, 바로 옆 분오리돈대에 오르면 해안 풍경이 시원하게 내려다보입니다.'],
          t:['갯벌에 들어갈 땐 물때를 꼭 확인하세요.'] },
        { n:'장화리 낙조', q:'장화리 일몰조망지', cat:'sunset', cl:'노을 명소', stay:'40분', hl:['해넘이','갯벌'],
          one:'강화에서 손꼽히는 해넘이 자리',
          d:['강화도 서남쪽 장화리 해안의 일몰조망지로, 갯벌 너머 바다로 해가 떨어지는 장면을 볼 수 있습니다.','계절에 따라 해가 지는 자리가 조금씩 달라지고, 구름이 적은 날 붉은 노을이 특히 아름답습니다.'],
          t:['일몰 30분 전에 도착하세요.','해가 진 뒤에는 금방 추워지니 겉옷을 챙기세요.'] },
        { n:'외포항', q:'외포항', cat:'market', cl:'포구 · 젓갈시장', stay:'30분', hl:['젓갈','포구'],
          one:'강화 젓갈 시장이 있는 서쪽 포구',
          d:['강화도 서쪽의 포구로, 새우젓 등 강화 젓갈을 파는 수산시장이 있습니다.','바다 건너 석모도가 바로 보이고, 석모대교가 놓이기 전에는 석모도로 가는 배가 이곳에서 떠났습니다.'],
          t:['젓갈은 새지 않게 단단히 포장해 주세요.'] },
        { n:'보문사', q:'석모도 보문사', cat:'temple', cl:'사찰', stay:'1시간 30분', hl:['석모도','마애불','서해 전망'],
          one:'석모도 바닷가 산자락의 마애관음',
          d:['석모대교를 건너 석모도 낙가산 자락에 자리한 절로, 가파른 계단을 올라 만나는 눈썹바위 아래 마애석불좌상이 유명합니다.','계단 위에서 내려다보는 서해 풍경이 좋아, 오르는 수고가 아깝지 않은 곳입니다.'],
          t:['계단이 길고 가팔라요. 편한 신발을 신으세요.','주차장 이용 요금이 있을 수 있어요.'] }
      ]},
    { id:'gyodong', no:'07', art:'misty_river', title:'교동도 · 강화 북부', area:'강화군 교동면', tags:['장거리','한적함'], theme:['long'],
      dist:'약 145km', dur:'하루', when:'오전 출발', car:'아반떼',
      must:{k:'필수', t:'교동대교는 민통선 구간이라 다리 앞 해병대 검문소에서 신분증을 확인하고 출입증을 받아 차량 앞유리에 둡니다. 탑승자 전원 신분증을 챙기세요.'},
      note:{k:'참고', t:'군사 지역이라 해가 진 뒤에는 출입이 제한될 수 있어요. 해 지기 전에 섬을 나오도록 일정을 잡으세요.'},
      sum:'한강 하구를 따라 북쪽으로 올라가는 조용한 길. 교동도 대룡시장은 실향민이 만든 옛 시장 골목이 그대로 남아 있습니다.',
      tips:['탑승자 전원 신분증을 꼭 챙기세요. 검문소에서 확인합니다.','강화읍을 지나며 쉬어 가면 장거리 운전이 덜 피곤해요.','교동도 화개정원(전망대·모노레일, 유료)도 함께 들르기 좋아요.'],
      stops:[
        { n:'강화대교', q:'강화대교', cat:'bridge', cl:'다리', stay:'10분', hl:['강화 관문'],
          one:'김포에서 강화로 드는 북쪽 관문',
          d:['김포와 강화읍을 잇는 다리로, 강화 북부 여행의 시작점입니다.','다리를 건너면 강화읍 시내와 풍물시장이 가까워 출발 전 잠시 들르기 좋습니다.'],
          t:['주말 오전에는 다리 앞이 붐빌 수 있어요.'] },
        { n:'연미정', q:'연미정', cat:'pavilion', cl:'정자 · 문화유산', stay:'30분', hl:['돈대','한강 하구','조망'],
          one:'두 강이 만나 제비 꼬리처럼 갈라지는 곳',
          d:['한강과 임진강이 만나 강화 앞바다로 흘러가는 물길이 제비 꼬리처럼 갈라진다 하여 이름 붙은 정자입니다.','월곶돈대 위에 자리해 강 건너 북녘 땅까지 탁 트인 풍경이 펼쳐집니다.'],
          t:['돈대 위는 바람이 강해요.'] },
        { n:'교동대교', q:'교동대교', cat:'bridge', cl:'다리 · 검문소', stay:'검문 포함 20분', hl:['민통선','신분 확인'],
          one:'검문소를 지나 건너는 민통선의 다리',
          d:['강화도와 교동도를 잇는 다리로, 2014년 개통한 뒤로 차를 타고 교동도에 들어갈 수 있게 되었습니다.','다리 앞 해병대 검문소에서 신분 확인을 받고, 안내에 따라 출입증을 받아 차량 앞유리에 두어야 합니다.'],
          t:['탑승자 전원 신분증(운전면허증·주민등록증 등)이 필요해요.','최근에는 QR 코드 간편 등록도 운영된다고 해요. 검문소 안내를 따르세요.'] },
        { n:'대룡시장', q:'교동 대룡시장', cat:'oldmarket', cl:'골목시장', stay:'1시간', hl:['레트로','실향민','골목'],
          one:'실향민이 고향 시장을 본떠 만든 골목',
          d:['한국전쟁 때 건너온 황해도 연백 실향민들이 고향의 연백시장을 본떠 만든 골목시장입니다.','옛 간판과 이발소, 다방이 그대로 남아 있어 시간이 멈춘 듯한 골목을 천천히 걸어 볼 수 있습니다.'],
          t:['가게마다 다르지만 보통 오전 10시부터 오후 7시까지 문을 열어요.','차는 근처 공영주차장에 세우세요.'] },
        { n:'고구저수지', q:'교동 고구저수지', cat:'lake', lm:'reservoir', cl:'저수지', stay:'20분', hl:['한적함','풍경'],
          one:'들판과 낮은 산에 안긴 고요한 저수지',
          d:['교동도 고구리 마을 쪽의 저수지로, 들판과 낮은 산에 둘러싸여 한적한 풍경을 즐기기 좋습니다.','사람이 많지 않아 조용히 머물다 섬을 나서기 전 쉬어 가기 좋은 곳입니다.'],
          t:['해 지기 전에 섬을 나오도록 시간을 확인하세요.'] }
      ]}
  ];
  var SHORTS=[
    { id:'wolmi', short:true, art:'retro_port', title:'월미도 · 개항장 레트로', area:'제물포구', tags:['도보','레트로'], theme:['short'],
      dist:'약 15km', dur:'2~3시간', when:'오후 ~ 저녁', car:'모닝',
      sum:'차이나타운과 개항장 옛 건물 거리를 걷고, 월미문화의거리에서 바다를 봅니다.',
      tips:['개항장 일대는 골목이 좁아요. 차는 공영주차장에 두고 걸어서 둘러보세요.','월미바다열차(유료)를 타면 월미도를 한 바퀴 돌며 항구를 내려다볼 수 있어요.'],
      stops:[
        { n:'인천 차이나타운', q:'인천차이나타운', cat:'street', cl:'거리 · 먹거리', stay:'1시간', hl:['짜장면','패루','벽화거리'],
          one:'붉은 패루 아래 펼쳐지는 차이나타운',
          d:['개항 이후 청국 조계지가 들어서며 생긴 거리로, 붉은 패루와 중국풍 건물, 음식점들이 모여 있습니다.','짜장면박물관과 삼국지 벽화거리가 가까워 걸어서 함께 둘러보기 좋습니다.'],
          t:['주말 점심에는 인기 식당 대기가 길어요.'] },
        { n:'개항장 문화지구', q:'인천 개항장거리', cat:'street', lm:'modern', cl:'근대 거리', stay:'1시간', hl:['근대 건물','박물관','카페'],
          one:'근대 건물이 늘어선 옛 개항장 거리',
          d:['개항기에 지어진 은행과 관공서 건물들이 박물관과 카페로 남아 있는 거리입니다.','청·일 조계지의 경계였던 계단과 옛 건물들을 따라 걸으며 근대 인천의 모습을 볼 수 있습니다.'],
          t:['박물관은 요일별 휴관일이 있을 수 있어요.'] },
        { n:'월미문화의거리', q:'월미문화의거리', cat:'promenade', cl:'해안 거리', stay:'40분', hl:['바다','노을','산책'],
          one:'바다를 따라 걷는 월미도 해안길',
          d:['월미도 해안을 따라 이어진 거리로, 바다를 보며 걷거나 카페와 놀이시설에 들르기 좋습니다.','해 질 녘 인천항과 바다 건너 영종도 쪽으로 물드는 노을이 아름답습니다.'],
          t:['저녁에는 바닷바람이 차가워요.'] }
      ]},
    { id:'park', short:true, art:'green_park', title:'인천대공원 · 관교', area:'남동구', tags:['아이와 함께','산책'], theme:['short'],
      dist:'약 20km', dur:'2~3시간', when:'낮', car:'모닝',
      sum:'사계절 산책로가 잘 되어 있어 아이와 함께 가기 좋습니다. 주차가 넉넉합니다.',
      tips:['봄 벚꽃과 가을 단풍 시즌에는 주말 주차장이 붐벼요. 오전에 가면 여유로워요.','유모차와 함께 걷기 편한 평지 길이 많아요.'],
      stops:[
        { n:'인천대공원', q:'인천대공원', cat:'park', cl:'공원', stay:'1시간 30분', hl:['호수','벚꽃길','동물원'],
          one:'사계절 산책로가 잘 된 인천의 대표 공원',
          d:['호수와 넓은 잔디밭, 벚꽃길과 단풍길이 이어진 인천의 대표 공원입니다.','어린이동물원이 함께 있어 아이와 반나절 보내기 좋고, 주차장이 넉넉해 차로 가기 편합니다.'],
          t:['자전거 대여 등 시설 운영 시간은 현장에서 확인하세요.'] },
        { n:'인천수목원', q:'인천수목원', cat:'garden', lm:'arboretum', cl:'수목원', stay:'1시간', hl:['계절 꽃','숲길'],
          one:'인천대공원 안의 계절 수목원',
          d:['인천대공원 안에 자리한 수목원으로, 계절 꽃과 여러 나무를 주제별 정원에서 볼 수 있습니다.','길이 완만해 어르신, 아이와 함께 천천히 걷기 좋습니다.'],
          t:['운영 시간과 휴원일은 방문 전에 확인하세요.'] }
      ]},
    { id:'cheongna', short:true, art:'night_lake', title:'청라호수공원 야경', area:'서구', tags:['야경','짧게'], theme:['short','night'],
      dist:'약 25km', dur:'1~2시간', when:'밤', car:'모닝',
      sum:'호수를 한 바퀴 도는 짧은 야간 코스. 조명이 들어온 뒤가 특히 좋습니다.',
      tips:['해가 지고 조명이 들어온 뒤에 가세요.','호수 한 바퀴는 천천히 걸으면 한 시간 정도 잡으면 좋아요.'],
      stops:[
        { n:'청라호수공원', q:'청라호수공원', cat:'lake', cl:'호수공원', stay:'1시간', hl:['야경','분수','산책'],
          one:'호수 둘레로 불이 켜지는 청라의 야경 공원',
          d:['청라국제도시 한가운데 큰 호수를 둘러싼 공원으로, 호수를 따라 산책로와 자전거길이 이어집니다.','해가 진 뒤 주변 빌딩과 조명이 호수에 비치는 야경이 아름답고, 음악분수가 운영되는 기간에는 더 화려해집니다.'],
          t:['음악분수는 운영 기간과 시간이 정해져 있으니 미리 확인하세요.'] }
      ]}
  ];
  var ALL=COURSES.concat(SHORTS);
  function byId(id){ for(var i=0;i<ALL.length;i++) if(ALL[i].id===id) return ALL[i]; return null; }

  /* ═════════ 2. 일러스트 (SVG) ═════════ */
  function rnd(seed){ var a=seed>>>0; return function(){ a|=0; a=a+0x6D2B79F5|0; var t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
  var UID=0;
  function G(id,stops,x2,y2){ return '<linearGradient id="'+id+'" x1="0" y1="0" x2="'+(x2||0)+'" y2="'+(y2==null?1:y2)+'">'+stops.map(function(s){ return '<stop offset="'+s[0]+'" stop-color="'+s[1]+'"'+(s[2]!=null?' stop-opacity="'+s[2]+'"':'')+'/>'; }).join('')+'</linearGradient>'; }
  function RG(id,c,o){ return '<radialGradient id="'+id+'"><stop offset="0" stop-color="'+c+'" stop-opacity="'+(o||.9)+'"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient>'; }
  function ridge(r,base,amp,n,fill,op){ var pts=[],w=400; for(var i=0;i<=n;i++){ pts.push([i*w/n, base-amp*(.35+.65*r())]); }
    var d='M0 260 L0 '+pts[0][1].toFixed(1);
    for(i=0;i<n;i++){ var a=pts[i],b=pts[i+1],mx=(a[0]+b[0])/2; d+=' Q'+a[0].toFixed(1)+' '+a[1].toFixed(1)+' '+mx.toFixed(1)+' '+((a[1]+b[1])/2).toFixed(1); }
    d+=' T400 '+pts[n][1].toFixed(1)+' L400 260 Z';
    return '<path d="'+d+'" fill="'+fill+'"'+(op!=null?' opacity="'+op+'"':'')+'/>'; }
  function stars(r,n,h){ var s=''; for(var i=0;i<n;i++){ var x=r()*400,y=r()*h,rad=r()*1.1+.25; s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+rad.toFixed(2)+'" fill="#fff" opacity="'+(.35+r()*.6).toFixed(2)+'"/>'; } return s; }
  function shimmer(r,y0,y1,col,n,cx,spread){ var s=''; for(var i=0;i<n;i++){ var y=y0+r()*(y1-y0), w=6+r()*(cx!=null?40*(1-(y-y0)/(y1-y0)+.3):60), x=cx!=null?cx-w/2+(r()-.5)*spread*(.4+(y-y0)/(y1-y0)):r()*400; s+='<rect x="'+x.toFixed(1)+'" y="'+y.toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+(.8+r()*1.2).toFixed(1)+'" rx=".8" fill="'+col+'" opacity="'+(.25+r()*.55).toFixed(2)+'"/>'; } return s; }
  function birds(r,n,x0,y0,col){ var s=''; for(var i=0;i<n;i++){ var x=x0+r()*70,y=y0+r()*28,k=3+r()*3.5; s+='<path d="M'+(x-k).toFixed(1)+' '+y.toFixed(1)+' q'+(k/2).toFixed(1)+' '+(-k*.55).toFixed(1)+' '+k.toFixed(1)+' 0 q'+(k/2).toFixed(1)+' '+(-k*.55).toFixed(1)+' '+k.toFixed(1)+' 0" fill="none" stroke="'+col+'" stroke-width="1.2" stroke-linecap="round"/>'; } return s; }
  function skyline(r,base,x0,x1,col,win,maxH){ var s='',x=x0; while(x<x1){ var w=9+r()*18,h=18+r()*(maxH||80); s+='<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+col+'"/>';
      if(win){ for(var wy=base-h+5;wy<base-4;wy+=5.5){ for(var wx=x+2.5;wx<x+w-2.5;wx+=4){ if(r()<.32) s+='<rect x="'+wx.toFixed(1)+'" y="'+wy.toFixed(1)+'" width="1.8" height="2.4" fill="'+win+'" opacity="'+(.45+r()*.5).toFixed(2)+'"/>'; } } }
      x+=w+(r()<.3?2+r()*6:0.6); } return s; }
  function windmill(x,y,sc,col){ var t='<g transform="translate('+x+' '+y+') scale('+sc+')" fill="'+col+'"><path d="M-7 0 L-4.5 -46 L4.5 -46 L7 0 Z"/><rect x="-6" y="-52" width="12" height="7" rx="2"/>';
    [20,110,200,290].forEach(function(a){ t+='<g transform="translate(0 -49) rotate('+a+')"><rect x="-2" y="-40" width="4" height="40" rx="1.2"/><rect x="-8" y="-38" width="7" height="27" rx="1" opacity=".85"/></g>'; });
    return t+'<circle cx="0" cy="-49" r="3.2"/></g>'; }
  function bellRing(x,y,col){ return '<g transform="translate('+x+' '+y+')" fill="'+col+'"><path fill-rule="evenodd" d="M0 -92 C40 -92 50 -50 46 -22 C42 2 22 6 0 6 C-22 6 -42 2 -46 -22 C-50 -50 -40 -92 0 -92 Z M0 -84 C-32 -84 -40 -50 -38 -24 C-35 -4 -18 -1 0 -1 C18 -1 35 -4 38 -24 C40 -50 32 -84 0 -84 Z"/><rect x="-1" y="-76" width="2" height="18"/><path d="M-7 -58 Q0 -66 7 -58 L9 -44 L-9 -44 Z"/><rect x="-26" y="4" width="52" height="5" rx="1.5"/></g>'; }
  function cableBridge(y,col,towers){ var s='<path d="M-10 '+(y+4)+' Q200 '+(y-6)+' 410 '+(y+4)+' L410 '+(y+8)+' Q200 '+(y-2)+' -10 '+(y+8)+' Z" fill="'+col+'"/>';
    towers.forEach(function(tx){ var top=y-62; s+='<path d="M'+(tx-9)+' '+(y+30)+' L'+(tx-1.6)+' '+top+' L'+(tx+1.6)+' '+top+' L'+(tx+9)+' '+(y+30)+' L'+(tx+6)+' '+(y+30)+' L'+tx+' '+(top+18)+' L'+(tx-6)+' '+(y+30)+' Z" fill="'+col+'"/>';
      for(var i=1;i<=9;i++){ var d=i*13; s+='<line x1="'+tx+'" y1="'+(top+6+i*1.6)+'" x2="'+(tx-d)+'" y2="'+(y+1)+'" stroke="'+col+'" stroke-width=".7" opacity=".85"/><line x1="'+tx+'" y1="'+(top+6+i*1.6)+'" x2="'+(tx+d)+'" y2="'+(y+1)+'" stroke="'+col+'" stroke-width=".7" opacity=".85"/>'; } });
    for(var px=-10;px<410;px+=34) s+='<rect x="'+px+'" y="'+(y+6)+'" width="3" height="'+(28)+'" fill="'+col+'" opacity=".9"/>';
    return s; }
  function plane(x,y,sc,col){ return '<g transform="translate('+x+' '+y+') rotate(-8) scale('+sc+')" fill="'+col+'"><path d="M-22 0 Q-24 -2 -20 -2.6 L18 -2.6 Q24 -2 24 0 Q24 2 18 2.6 L-20 2.6 Q-24 2 -22 0Z"/><path d="M-2 -2 L-12 -16 L-6 -16 L8 -2Z"/><path d="M-2 2 L-12 16 L-6 16 L8 2Z"/><path d="M-18 -2 L-23 -9 L-19 -9 L-13 -2Z"/></g>'; }
  function templeRoof(x,y,sc,col){ return '<g transform="translate('+x+' '+y+') scale('+sc+')" fill="'+col+'"><path d="M-62 -26 Q-30 -30 0 -44 Q30 -30 62 -26 Q66 -24 70 -30 Q66 -18 52 -18 L-52 -18 Q-66 -18 -70 -30 Q-66 -24 -62 -26Z"/><rect x="-44" y="-18" width="88" height="20"/><rect x="-50" y="2" width="100" height="5"/><path d="M-36 -50 Q0 -60 36 -50 L30 -44 L-30 -44Z"/></g>'; }
  function paifang(x,y,sc,col,acc){ return '<g transform="translate('+x+' '+y+') scale('+sc+')"><g fill="'+col+'"><rect x="-40" y="-58" width="6" height="58"/><rect x="34" y="-58" width="6" height="58"/><rect x="-16" y="-50" width="5" height="50"/><rect x="11" y="-50" width="5" height="50"/><path d="M-52 -58 Q0 -66 52 -58 L56 -64 Q0 -74 -56 -64Z"/><path d="M-30 -76 Q0 -84 30 -76 L34 -82 Q0 -92 -34 -82Z"/><rect x="-30" y="-76" width="60" height="12"/></g><rect x="-22" y="-73" width="44" height="7" fill="'+acc+'" opacity=".9"/></g>'; }
  function wheel(x,y,R,col){ var s='<g fill="none" stroke="'+col+'" stroke-width="1.6"><circle cx="'+x+'" cy="'+y+'" r="'+R+'"/><circle cx="'+x+'" cy="'+y+'" r="'+(R*.18)+'"/>';
    for(var a=0;a<360;a+=22.5){ var rad=a*Math.PI/180; s+='<line x1="'+x+'" y1="'+y+'" x2="'+(x+R*Math.cos(rad)).toFixed(1)+'" y2="'+(y+R*Math.sin(rad)).toFixed(1)+'" stroke-width=".8"/>'; }
    s+='</g><g fill="'+col+'">'; for(a=0;a<360;a+=30){ rad=a*Math.PI/180; s+='<rect x="'+(x+R*Math.cos(rad)-3).toFixed(1)+'" y="'+(y+R*Math.sin(rad)-2).toFixed(1)+'" width="6" height="6" rx="1.5"/>'; }
    return s+'<path d="M'+(x-R*.55)+' '+(y+R+28)+' L'+x+' '+y+' L'+(x+R*.55)+' '+(y+R+28)+'" fill="none" stroke="'+col+'" stroke-width="2.4"/></g>'; }
  function tree(x,y,r,col){ return '<rect x="'+(x-1.2)+'" y="'+(y-r*.4)+'" width="2.4" height="'+(r*.9)+'" fill="'+col+'" opacity=".9"/><circle cx="'+x+'" cy="'+(y-r)+'" r="'+r+'" fill="'+col+'"/>'; }
  function reeds(r,y,n,col){ var s=''; for(var i=0;i<n;i++){ var x=r()*400,h=14+r()*26,b=(r()-.5)*10; s+='<path d="M'+x.toFixed(1)+' '+y+' q'+(b/2).toFixed(1)+' '+(-h/2).toFixed(1)+' '+b.toFixed(1)+' '+(-h).toFixed(1)+'" stroke="'+col+'" stroke-width="1" fill="none"/><ellipse cx="'+(x+b).toFixed(1)+'" cy="'+(y-h-3).toFixed(1)+'" rx="1.4" ry="4" fill="'+col+'" transform="rotate('+(b*2).toFixed(1)+' '+(x+b).toFixed(1)+' '+(y-h-3).toFixed(1)+')"/>'; } return s; }

  function scene(kind){
    var u='tv'+(++UID), r=rnd(kind.length*977+kind.charCodeAt(0)*13), s='', d='';
    var vb='<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">';
    if(kind==='night_city'){
      d=G(u+'s',[[0,'#0a1030'],[.55,'#25265a'],[1,'#5b3f73']])+G(u+'w',[[0,'#1c2147'],[1,'#070b1e']])+RG(u+'m','#fff3cf',.55);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/>'+stars(r,70,120)+'<circle cx="320" cy="46" r="40" fill="url(#'+u+'m)"/><circle cx="320" cy="46" r="13" fill="#fff6dc"/><circle cx="326" cy="42" r="11" fill="#2a2a5e" opacity=".25"/>'
        +ridge(r,160,18,6,'#2a2550',.8)+skyline(r,166,-4,290,'#141938','#ffd98a',92)+windmill(338,168,.72,'#11142c')+'<rect y="166" width="400" height="94" fill="url(#'+u+'w)"/>'
        +shimmer(r,170,250,'#ffd98a',46)+shimmer(r,170,250,'#9aa8ff',18);
    } else if(kind==='sunset_canal'){
      d=G(u+'s',[[0,'#4a3f86'],[.45,'#d4687a'],[.78,'#f59a63'],[1,'#ffd49a']])+G(u+'w',[[0,'#f2a06e'],[1,'#5a3f6e']])+RG(u+'g','#fff0c2',.9);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/><circle cx="214" cy="150" r="80" fill="url(#'+u+'g)"/><circle cx="214" cy="150" r="24" fill="#fff4d6"/>'
        +ridge(r,152,22,5,'#9a5a83',.75)+ridge(r,156,12,7,'#6e4473',.9)+'<rect y="154" width="400" height="106" fill="url(#'+u+'w)"/>'
        +'<path d="M150 260 L206 155 L222 155 L250 260 Z" fill="#ffe2ad" opacity=".18"/>'+shimmer(r,156,250,'#fff1c9',40,214,70)
        +'<path d="M0 196 L188 156 L0 168Z M400 200 L240 156 L400 170Z" fill="#3e2a4f" opacity=".7"/>'+bellRing(98,188,'#2e2040')+birds(r,5,250,62,'#3a2747');
    } else if(kind==='golden_bridge'){
      d=G(u+'s',[[0,'#f2b76c'],[.5,'#f39566'],[1,'#ffd9a8']])+G(u+'w',[[0,'#e8916a'],[1,'#4b3a5a']])+RG(u+'g','#fff3cc',.95);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/><circle cx="292" cy="140" r="86" fill="url(#'+u+'g)"/><circle cx="292" cy="140" r="22" fill="#fff6dd"/>'
        +ridge(r,146,10,6,'#b8706a',.6)+'<rect y="146" width="400" height="114" fill="url(#'+u+'w)"/>'+shimmer(r,150,252,'#fff0c4',44,292,80)
        +cableBridge(150,"#3d2b44",[120,232])+plane(196,40,.8,"#5a3a4a")+birds(r,4,300,70,'#5a3a4a');
    } else if(kind==='island_day'){
      d=G(u+'s',[[0,'#76c5ec'],[1,'#e3f5fb']])+G(u+'w',[[0,'#3ab0cf'],[1,'#13698f']])+RG(u+'g','#fffbe6',.95);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/><circle cx="70" cy="44" r="60" fill="url(#'+u+'g)"/><circle cx="70" cy="44" r="16" fill="#fffdf2"/>'
        +'<g fill="#fff" opacity=".9"><ellipse cx="250" cy="50" rx="44" ry="11"/><ellipse cx="282" cy="44" rx="28" ry="12"/><ellipse cx="160" cy="72" rx="30" ry="7"/></g>'
        +'<path d="M-10 160 Q40 96 110 120 Q150 92 210 132 Q240 150 250 160Z" fill="#3f9e8e"/><path d="M-10 160 Q60 118 120 136 Q170 120 230 160Z" fill="#2e8173"/>'
        +'<path d="M300 160 Q330 118 372 128 Q400 136 410 160Z" fill="#3f9e8e"/><path d="M228 150 Q266 132 304 150" fill="none" stroke="#f5f3ea" stroke-width="2"/><line x1="228" y1="150" x2="304" y2="150" stroke="#f5f3ea" stroke-width="2.6"/>'
        +'<rect y="158" width="400" height="102" fill="url(#'+u+'w)"/>'+shimmer(r,162,250,'#ffffff',54)
        +'<g transform="translate(300 206)"><path d="M0 0 L0 -40 L22 -4Z" fill="#fff"/><path d="M-3 -2 L0 -30 L-18 -3Z" fill="#fff" opacity=".85"/><path d="M-22 2 L26 2 Q20 10 -16 10Z" fill="#0e4f6c"/></g>';
    } else if(kind==='dusk_temple'){
      d=G(u+'s',[[0,'#2b2353'],[.5,'#a84a6c'],[.82,'#ef8f5a'],[1,'#f7c07a']])+G(u+'w',[[0,'#c0705f'],[1,'#3b2a48']])+RG(u+'g','#ffdca3',.9);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/>'+stars(r,18,60)+'<circle cx="250" cy="158" r="76" fill="url(#'+u+'g)"/><circle cx="250" cy="160" r="22" fill="#ffe7bd"/>'
        +'<rect y="158" width="400" height="102" fill="url(#'+u+'w)"/>';
      for(var i=0;i<9;i++){ var yy=170+i*10+r()*4; s+='<path d="M'+(-20+r()*60)+' '+yy.toFixed(1)+' Q200 '+(yy-3-r()*4).toFixed(1)+' '+(420-r()*60)+' '+yy.toFixed(1)+'" stroke="#2a1d36" stroke-width="'+(3+r()*5).toFixed(1)+'" opacity=".38" fill="none"/>'; }
      s+=shimmer(r,162,246,'#ffd9a0',28,250,70)+'<path d="M-10 170 Q40 96 120 104 Q170 112 196 170Z" fill="#2a1c37"/>'+templeRoof(92,108,.62,'#1d1328')+birds(r,6,280,70,'#2a1c37');
    } else if(kind==='misty_river'){
      d=G(u+'s',[[0,'#d6e0dd'],[1,'#f3eee4']])+G(u+'w',[[0,'#e6e3d8'],[1,'#a9b8b1']])+RG(u+'g','#fffaf0',.9);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/><circle cx="300" cy="70" r="54" fill="url(#'+u+'g)"/><circle cx="300" cy="70" r="16" fill="#fbf4e4"/>'
        +ridge(r,118,30,5,'#c3cfca',.9)+ridge(r,136,26,6,'#a7b8b0',.95)+ridge(r,152,18,7,'#8ca096',1)
        +'<rect y="150" width="400" height="110" fill="url(#'+u+'w)"/>'+'<path d="M200 150 L210 150 L214 154 L196 154Z" fill="#7c8f86"/><path d="M110 150 Q200 140 330 150" fill="none" stroke="#6c8078" stroke-width="1.4"/>'
        +shimmer(r,154,240,'#ffffff',30)+'<path d="M-10 260 L-10 214 Q60 200 130 216 Q200 230 260 222 Q330 214 410 226 L410 260Z" fill="#617a6c"/>'+reeds(r,224,70,'#4c6356')+birds(r,4,90,60,'#6c8078');
    } else if(kind==='retro_port'){
      d=G(u+'s',[[0,'#1d3a5b'],[.55,'#c96a66'],[1,'#f1c48a']])+G(u+'w',[[0,'#d9806b'],[1,'#1d2c45']])+RG(u+'g','#ffe0a8',.85);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/>'+stars(r,16,70)+'<circle cx="196" cy="150" r="70" fill="url(#'+u+'g)"/><circle cx="196" cy="152" r="18" fill="#ffeac4"/>'
        +'<rect y="156" width="400" height="104" fill="url(#'+u+'w)"/>'+shimmer(r,160,250,'#ffe3b0',36,196,60)+shimmer(r,160,250,'#ffd56b',16)
        +skyline(r,158,150,262,'#2a2a44','#ffcf7a',26)+wheel(318,104,40,'#2a2338')+paifang(78,168,1,'#2a2338','#c2423f')+'<rect y="168" width="400" height="3" fill="#2a2338" opacity=".7"/>';
    } else if(kind==='green_park'){
      d=G(u+'s',[[0,'#bfe2fb'],[1,'#f1f9ff']])+G(u+'w',[[0,'#8fd0e6'],[1,'#5aaec9']])+RG(u+'g','#fffbe0',.95);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/><circle cx="330" cy="46" r="50" fill="url(#'+u+'g)"/><circle cx="330" cy="46" r="14" fill="#fffef6"/>'
        +'<g fill="#fff" opacity=".9"><ellipse cx="120" cy="50" rx="36" ry="9"/><ellipse cx="146" cy="44" rx="22" ry="10"/></g>'
        +ridge(r,140,34,5,'#9fd3a6',1)+ridge(r,168,26,6,'#73b884',1)+'<ellipse cx="250" cy="196" rx="120" ry="20" fill="url(#'+u+'w)"/>'+shimmer(r,184,206,'#ffffff',14)
        +'<path d="M-10 260 Q120 210 230 236 Q320 256 410 226 L410 260Z" fill="#4f9b66"/><path d="M60 260 Q140 226 210 222" stroke="#f3ead6" stroke-width="7" fill="none" stroke-linecap="round"/>';
      [[40,186,14,'#3f8656'],[74,176,11,'#f3b6c8'],[102,190,13,'#3f8656'],[352,170,15,'#3f8656'],[380,186,11,'#f3b6c8'],[150,172,9,'#5aa06e']].forEach(function(t){ s+=tree(t[0],t[1],t[2],t[3]); });
    } else if(kind==='airport_dawn'){
      d=G(u+'s',[[0,'#26365f'],[.5,'#9a5d84'],[.8,'#ef916a'],[1,'#ffd6a2']])+G(u+'w',[[0,'#3a2c4a'],[1,'#1b1626']])+RG(u+'g','#ffe2b0',.9);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/>'+stars(r,14,60)+'<circle cx="96" cy="150" r="80" fill="url(#'+u+'g)"/><circle cx="96" cy="152" r="20" fill="#fff0d2"/>'
        +ridge(r,150,14,6,'#6c4a6e',.55)
        +'<path d="M150 70 Q210 92 300 74" fill="none" stroke="#ffffff" stroke-width="1.6" opacity=".55" stroke-linecap="round"/>'+plane(312,66,1.15,'#2a1f3c')
        +'<rect y="158" width="400" height="102" fill="url(#'+u+'w)"/>'
        /* 여객터미널: 물결 지붕 + 유리벽 */
        +'<path d="M24 160 L24 132 Q80 116 140 128 Q200 140 260 124 Q300 114 330 122 L330 160 Z" fill="#2b2140"/>'
        +'<path d="M24 132 Q80 116 140 128 Q200 140 260 124 Q300 114 330 122" fill="none" stroke="#ffd9a6" stroke-width="1.4" opacity=".7"/>';
      for(var gx=34;gx<322;gx+=9){ s+='<rect x="'+gx+'" y="'+(140+Math.sin(gx/22)*3).toFixed(1)+'" width="5" height="'+(18-Math.sin(gx/22)*3).toFixed(1)+'" fill="#ffd98a" opacity="'+(.28+r()*.4).toFixed(2)+'"/>'; }
      /* 관제탑 */
      s+='<path d="M356 160 L358 84 L362 84 L364 160 Z" fill="#241b36"/><path d="M346 84 L374 84 L370 70 L350 70 Z" fill="#241b36"/><rect x="349" y="74" width="22" height="5" fill="#ffd98a" opacity=".75"/><rect x="359" y="58" width="2" height="12" fill="#241b36"/>'
        +'<rect y="164" width="400" height="3" fill="#120e1a" opacity=".7"/>';
      for(var lx=6;lx<400;lx+=16){ s+='<circle cx="'+lx+'" cy="'+(190+((lx/16)%2))+'" r="1.6" fill="#ffd27a" opacity=".9"/><circle cx="'+(lx+8)+'" cy="214" r="1.3" fill="#9fd6ff" opacity=".8"/>'; }
      s+='<path d="M0 236 L400 226 L400 260 L0 260 Z" fill="#120e1a" opacity=".55"/>'+birds(r,3,200,92,'#3a2a4a');
    } else { /* night_lake */
      d=G(u+'s',[[0,'#0b1a2c'],[.6,'#1d2c4d'],[1,'#3d4f76']])+G(u+'w',[[0,'#1a2846'],[1,'#070e1c']])+RG(u+'f','#8fe6ff',.8);
      s='<rect width="400" height="260" fill="url(#'+u+'s)"/>'+stars(r,60,110)+skyline(r,150,-4,404,'#121d36','#9fd6ff',70)+'<rect y="150" width="400" height="110" fill="url(#'+u+'w)"/>'
        +shimmer(r,154,250,'#9fd6ff',40)+shimmer(r,154,250,'#ffd98a',16)+'<ellipse cx="200" cy="150" rx="90" ry="26" fill="url(#'+u+'f)" opacity=".45"/>';
      for(var k=-4;k<=4;k++){ var h=40-Math.abs(k)*6,x=200+k*14; s+='<path d="M200 152 Q'+(200+k*7)+' '+(152-h*2.1)+' '+x+' 152" fill="none" stroke="#bff1ff" stroke-width="1.2" opacity=".75"/>'; }
      for(k=0;k<26;k++){ var a=r()*Math.PI, rr=20+r()*40; s+='<circle cx="'+(200+Math.cos(a)*rr*1.2).toFixed(1)+'" cy="'+(150-Math.sin(a)*rr*1.6).toFixed(1)+'" r="'+(r()*1.2+.4).toFixed(2)+'" fill="#e3fbff" opacity=".8"/>'; }
    }
    return vb+'<defs>'+d+'</defs>'+s+'</svg>';
  }
  function art(kind){ return scene(kind); }   /* 매번 새로 그림 — 그라데이션 id 가 화면마다 겹치지 않게 */
  /* ── 여행지별 그림: 코스의 시간대 색 + 장소 종류별 풍경 ── */
  var PAL={
    night_city:{sky:[[0,'#0a1030'],[.55,'#25265a'],[1,'#5b3f73']],wat:[[0,'#1c2147'],[1,'#070b1e']],sun:[320,46,12,'#fff6dc'],glow:'#fff3cf',far:'#2a2550',sil:'#141938',lit:'#ffd98a',night:1},
    sunset_canal:{sky:[[0,'#4a3f86'],[.45,'#d4687a'],[.78,'#f59a63'],[1,'#ffd49a']],wat:[[0,'#f2a06e'],[1,'#5a3f6e']],sun:[214,150,22,'#fff4d6'],glow:'#fff0c2',far:'#9a5a83',sil:'#2e2040',lit:'#fff1c9'},
    golden_bridge:{sky:[[0,'#f2b76c'],[.5,'#f39566'],[1,'#ffd9a8']],wat:[[0,'#e8916a'],[1,'#4b3a5a']],sun:[292,140,22,'#fff6dd'],glow:'#fff3cc',far:'#b8706a',sil:'#3d2b44',lit:'#fff0c4'},
    island_day:{sky:[[0,'#76c5ec'],[1,'#e3f5fb']],wat:[[0,'#3ab0cf'],[1,'#13698f']],sun:[70,44,15,'#fffdf2'],glow:'#fffbe6',far:'#7cc2b4',sil:'#2e8173',lit:'#ffffff',day:1},
    dusk_temple:{sky:[[0,'#2b2353'],[.5,'#a84a6c'],[.82,'#ef8f5a'],[1,'#f7c07a']],wat:[[0,'#c0705f'],[1,'#3b2a48']],sun:[250,158,21,'#ffe7bd'],glow:'#ffdca3',far:'#5a3654',sil:'#1d1328',lit:'#ffd9a0'},
    misty_river:{sky:[[0,'#d6e0dd'],[1,'#f3eee4']],wat:[[0,'#e6e3d8'],[1,'#a9b8b1']],sun:[300,70,15,'#fbf4e4'],glow:'#fffaf0',far:'#a7b8b0',sil:'#556b60',lit:'#ffffff',day:1},
    retro_port:{sky:[[0,'#1d3a5b'],[.55,'#c96a66'],[1,'#f1c48a']],wat:[[0,'#d9806b'],[1,'#1d2c45']],sun:[196,152,17,'#ffeac4'],glow:'#ffe0a8',far:'#7a4c62',sil:'#2a2338',lit:'#ffe3b0'},
    green_park:{sky:[[0,'#bfe2fb'],[1,'#f1f9ff']],wat:[[0,'#8fd0e6'],[1,'#5aaec9']],sun:[330,46,14,'#fffef6'],glow:'#fffbe0',far:'#9fd3a6',sil:'#3f8656',lit:'#ffffff',day:1},
    airport_dawn:{sky:[[0,'#26365f'],[.5,'#9a5d84'],[.8,'#ef916a'],[1,'#ffd6a2']],wat:[[0,'#3a2c4a'],[1,'#1b1626']],sun:[96,150,20,'#fff0d2'],glow:'#ffe2b0',far:'#6c4a6e',sil:'#2b2140',lit:'#ffd98a'},
    night_lake:{sky:[[0,'#0b1a2c'],[.6,'#1d2c4d'],[1,'#3d4f76']],wat:[[0,'#1a2846'],[1,'#070e1c']],sun:[318,48,11,'#eef6ff'],glow:'#cfe6ff',far:'#24385a',sil:'#121d36',lit:'#9fd6ff',night:1}
  };
  var LAND={park:1,garden:1,temple:1,pavilion:1,oldmarket:1,street:1,modern:1,arboretum:1};
  function people(x,y,n,col){ var s=''; for(var i=0;i<n;i++){ var px=x+i*9, h=i%2?13:15; s+='<circle cx="'+px+'" cy="'+(y-h-3)+'" r="2.6" fill="'+col+'"/><path d="M'+(px-3)+' '+y+' L'+(px-2.4)+' '+(y-h+1)+' Q'+px+' '+(y-h-1)+' '+(px+2.4)+' '+(y-h+1)+' L'+(px+3)+' '+y+'Z" fill="'+col+'"/>'; } return s; }
  function boat(x,y,sc,col,lit){ return '<g transform="translate('+x+' '+y+') scale('+sc+')"><path d="M-24 0 L24 0 L18 9 L-19 9Z" fill="'+col+'"/><rect x="-10" y="-11" width="16" height="11" rx="1.5" fill="'+col+'"/><rect x="-7" y="-8" width="4" height="4" fill="'+lit+'" opacity=".8"/><rect x="0" y="-8" width="4" height="4" fill="'+lit+'" opacity=".8"/><line x1="12" y1="0" x2="12" y2="-26" stroke="'+col+'" stroke-width="1.4"/><line x1="12" y1="-24" x2="-14" y2="-11" stroke="'+col+'" stroke-width=".7"/></g>'; }
  function yacht(x,y,sc,col){ return '<g transform="translate('+x+' '+y+') scale('+sc+')" fill="'+col+'"><path d="M-20 0 L22 0 L16 7 L-16 7Z"/><rect x="-1" y="-46" width="1.6" height="46"/><path d="M1.4 -44 L18 -3 L1.4 -3Z" opacity=".55"/><path d="M-1 -40 L-15 -3 L-1 -3Z" opacity=".35"/></g>'; }
  function pavilion(x,y,sc,col){ return '<g transform="translate('+x+' '+y+') scale('+sc+')" fill="'+col+'"><path d="M-46 -40 Q-22 -44 0 -58 Q22 -44 46 -40 Q50 -38 54 -44 Q50 -32 38 -32 L-38 -32 Q-50 -32 -54 -44 Q-50 -38 -46 -40Z"/><rect x="-32" y="-32" width="4" height="30"/><rect x="28" y="-32" width="4" height="30"/><rect x="-10" y="-32" width="3" height="30"/><rect x="7" y="-32" width="3" height="30"/><rect x="-40" y="-4" width="80" height="5"/></g>'; }
  function rampart(y,col){ var s='<path d="M60 '+y+' L80 '+(y-34)+' L320 '+(y-34)+' L340 '+y+'Z" fill="'+col+'"/>'; for(var x=86;x<316;x+=14) s+='<rect x="'+x+'" y="'+(y-40)+'" width="9" height="7" fill="'+col+'"/>'; return s; }
  function shops(x0,x1,base,col,lit,r){ var s='',x=x0; while(x<x1){ var w=26+r()*16,h=26+r()*14; s+='<rect x="'+x.toFixed(1)+'" y="'+(base-h).toFixed(1)+'" width="'+w.toFixed(1)+'" height="'+h.toFixed(1)+'" fill="'+col+'"/><path d="M'+(x-3).toFixed(1)+' '+(base-h).toFixed(1)+' L'+(x+w/2).toFixed(1)+' '+(base-h-9).toFixed(1)+' L'+(x+w+3).toFixed(1)+' '+(base-h).toFixed(1)+'Z" fill="'+col+'"/><rect x="'+(x+4).toFixed(1)+'" y="'+(base-h+5).toFixed(1)+'" width="'+(w-8).toFixed(1)+'" height="6" rx="1" fill="'+lit+'" opacity=".55"/><rect x="'+(x+w/2-4).toFixed(1)+'" y="'+(base-12).toFixed(1)+'" width="8" height="12" fill="'+lit+'" opacity=".35"/>'; x+=w+3; } return s; }
  function girder(y,col){ var s='<rect x="-10" y="'+(y-6)+'" width="420" height="6" fill="'+col+'"/>'; for(var x=20;x<400;x+=64) s+='<rect x="'+x+'" y="'+y+'" width="7" height="34" fill="'+col+'"/>'; for(x=-10;x<410;x+=16) s+='<line x1="'+x+'" y1="'+(y-6)+'" x2="'+(x+8)+'" y2="'+(y-16)+'" stroke="'+col+'" stroke-width="1"/><line x1="'+(x+8)+'" y1="'+(y-16)+'" x2="'+(x+16)+'" y2="'+(y-6)+'" stroke="'+col+'" stroke-width="1"/>'; return s+'<rect x="-10" y="'+(y-17)+'" width="420" height="1.6" fill="'+col+'"/>'; }
  function containers(x,y,col,lit){ return '<g transform="translate('+x+' '+y+')"><rect x="-4" y="-30" width="3" height="30" fill="'+col+'"/><rect x="44" y="-38" width="3" height="38" fill="'+col+'"/><g transform="rotate(-8)"><rect x="-40" y="-46" width="74" height="18" fill="'+col+'"/><rect x="-30" y="-70" width="74" height="18" fill="'+col+'"/><rect x="-18" y="-94" width="74" height="18" fill="'+col+'"/>'
    +'<rect x="30" y="-43" width="3" height="12" fill="'+lit+'" opacity=".6"/><rect x="40" y="-67" width="3" height="12" fill="'+lit+'" opacity=".6"/><rect x="52" y="-91" width="3" height="12" fill="'+lit+'" opacity=".6"/></g></g>'; }
  function fallCliff(col,lit,r){ var s='<path d="M-10 60 L150 60 Q165 100 158 170 L-10 170Z" fill="'+col+'"/>'; for(var i=0;i<14;i++){ var x=150+i*1.6+r()*2; s+='<rect x="'+x.toFixed(1)+'" y="'+(62+r()*6).toFixed(1)+'" width="1.4" height="'+(96+r()*14).toFixed(1)+'" fill="'+lit+'" opacity="'+(.5+r()*.45).toFixed(2)+'"/>'; }
    return s+'<ellipse cx="160" cy="168" rx="34" ry="8" fill="'+lit+'" opacity=".45"/>'; }
  function flowers(r,y0,y1,cols){ var s=''; for(var i=0;i<140;i++){ var x=r()*400,y=y0+r()*(y1-y0),k=(y-y0)/(y1-y0); s+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+(.8+k*2.6).toFixed(2)+'" fill="'+cols[i%cols.length]+'" opacity="'+(.6+k*.4).toFixed(2)+'"/>'; } return s; }
  function umbrella(x,y,col,acc){ return '<g transform="translate('+x+' '+y+')"><rect x="-.8" y="-30" width="1.6" height="30" fill="'+col+'"/><path d="M-18 -26 Q0 -44 18 -26 Q12 -30 6 -26 Q0 -31 -6 -26 Q-12 -30 -18 -26Z" fill="'+acc+'"/></g>'; }

  function spotScene(kind,cat,seed){
    var P=PAL[kind]||PAL.golden_bridge, u='tvs'+(++UID), r=rnd(seed), H=160, land=!!LAND[cat];
    var d=G(u+'s',P.sky)+G(u+'w',P.wat)+RG(u+'g',P.glow,.9)+G(u+'l',[[0,P.far],[1,P.sil]]);
    var s='<rect width="400" height="260" fill="url(#'+u+'s)"/>';
    if(P.night) s+=stars(r,46,110);
    var sx=P.sun[0], sy=P.sun[1]; if(cat==='sunset'){ sx=200; sy=152; }
    s+='<circle cx="'+sx+'" cy="'+sy+'" r="'+(P.sun[2]*3.6)+'" fill="url(#'+u+'g)"/><circle cx="'+sx+'" cy="'+sy+'" r="'+(cat==='sunset'?P.sun[2]*1.35:P.sun[2])+'" fill="'+P.sun[3]+'"/>';
    if(P.day) s+='<g fill="#fff" opacity=".85"><ellipse cx="'+(140+r()*120)+'" cy="'+(40+r()*20)+'" rx="34" ry="8"/><ellipse cx="'+(260+r()*80)+'" cy="'+(60+r()*20)+'" rx="22" ry="6"/></g>';
    s+=ridge(r,H-2,22,5,P.far,.75);
    if(land){ s+='<rect y="'+H+'" width="400" height="'+(260-H)+'" fill="url(#'+u+'l)"/>'; }
    else { s+='<rect y="'+H+'" width="400" height="'+(260-H)+'" fill="url(#'+u+'w)"/>'+shimmer(r,H+4,252,P.lit,36,sx,P.day?200:70); }
    var c=P.sil, L=P.lit;
    switch(cat){
      case 'canal': s+=skyline(r,H+2,-4,404,c,P.night?L:null,96)+shimmer(r,H+6,250,P.lit,30)+'<path d="M-10 260 L120 '+(H+8)+' L150 '+(H+8)+' L60 260Z" fill="'+c+'" opacity=".7"/><path d="M410 260 L280 '+(H+8)+' L250 '+(H+8)+' L340 260Z" fill="'+c+'" opacity=".7"/>'; break;
      case 'skywalk': s+='<path d="M-10 70 L120 70 Q140 110 132 170 L-10 170Z" fill="'+c+'"/><ellipse cx="150" cy="78" rx="62" ry="15" fill="none" stroke="'+c+'" stroke-width="6"/><ellipse cx="150" cy="78" rx="62" ry="15" fill="'+L+'" opacity=".18"/><path d="M96 82 L88 120 M204 82 L120 132" stroke="'+c+'" stroke-width="3"/>'+people(150,74,2,c)+skyline(r,H+2,250,404,c,P.night?L:null,36); break;
      case 'reservoir': s+=ridge(r,H+4,16,7,c,.6)+shimmer(r,H+6,240,'#ffffff',18)+'<path d="M-10 238 Q100 226 200 234 Q300 242 410 230 L410 260 L-10 260Z" fill="'+c+'"/>'+reeds(r,238,60,c)+birds(r,4,220,70,c); break;
      case 'modern': s+='<rect y="'+(H+40)+'" width="400" height="80" fill="'+c+'" opacity=".55"/>'; [[10,70],[96,86],[196,64],[286,90]].forEach(function(b){ var x=b[0],w=b[1],top=H-24-r()*16;
          s+='<rect x="'+x+'" y="'+top.toFixed(1)+'" width="'+w+'" height="'+(H+40-top).toFixed(1)+'" fill="'+c+'"/><path d="M'+(x-4)+' '+top.toFixed(1)+' L'+(x+w/2)+' '+(top-16).toFixed(1)+' L'+(x+w+4)+' '+top.toFixed(1)+'Z" fill="'+c+'"/>';
          for(var cx2=x+8;cx2<x+w-6;cx2+=12) s+='<rect x="'+cx2+'" y="'+(top+12).toFixed(1)+'" width="5" height="'+(H+30-top-12).toFixed(1)+'" fill="'+L+'" opacity=".28"/>'; }); s+=people(160,H+40,3,c); break;
      case 'arboretum': s+=ridge(r,H+14,26,6,c,.8); [[40,H+44,16],[90,H+36,12],[150,H+46,14],[260,H+40,15],[320,H+48,17],[370,H+40,12]].forEach(function(tt){ s+=tree(tt[0],tt[1],tt[2],c); }); s+=flowers(r,H+52,260,['#ff9ec4','#ffffff','#ffd36b','#f5c7e0']); break;
      case 'airport': var s0=s; s='';
        s+='<path d="M20 '+(H+2)+' L20 '+(H-26)+' Q90 '+(H-44)+' 170 '+(H-30)+' Q250 '+(H-16)+' 320 '+(H-34)+' L320 '+(H+2)+' Z" fill="'+c+'"/>'; for(var ax=30;ax<312;ax+=9) s+='<rect x="'+ax+'" y="'+(H-18)+'" width="5" height="16" fill="'+L+'" opacity="'+(.3+r()*.4).toFixed(2)+'"/>';
        s+='<path d="M350 '+(H+2)+' L352 '+(H-74)+' L356 '+(H-74)+' L358 '+(H+2)+'Z" fill="'+c+'"/><path d="M341 '+(H-74)+' L367 '+(H-74)+' L363 '+(H-88)+' L345 '+(H-88)+'Z" fill="'+c+'"/>'+plane(250,60,1.1,c)+'<path d="M90 76 Q160 90 236 64" fill="none" stroke="#fff" stroke-width="1.4" opacity=".5"/>'; for(var bx=6;bx<400;bx+=16) s+='<circle cx="'+bx+'" cy="'+(H+36)+'" r="1.5" fill="'+L+'" opacity=".9"/>';
        s=s0+((seed&1)?'<g transform="translate(400 0) scale(-1 1)">'+s+'</g>':s); break;
      case 'tower': s+=skyline(r,H+2,180,404,c,P.night?L:null,70)+containers(110,H+30,c,L)+'<rect x="40" y="'+(H+26)+'" width="140" height="6" fill="'+c+'"/>'+people(88,H+26,3,c); break;
      case 'wetland': s+=windmill(290,H+8,.95,c)+'<path d="M-10 '+(H+30)+' Q200 '+(H+16)+' 410 '+(H+34)+' L410 260 L-10 260Z" fill="'+c+'" opacity=".92"/>'+reeds(r,H+40,90,c); break;
      case 'market': s+=shops(-6,170,H+4,c,L,r)+boat(250,H+26,1,c,L)+boat(330,H+40,1.25,c,L)+boat(196,H+52,.8,c,L); break;
      case 'fall': s+=fallCliff(c,L,r)+skyline(r,H+2,240,404,c,P.night?L:null,40); break;
      case 'sunset': if(seed===7){ s+=bellRing(110,H+30,c); } s+='<path d="M-10 '+(H+44)+' Q200 '+(H+34)+' 410 '+(H+46)+' L410 260 L-10 260Z" fill="'+c+'"/>'+people(258,H+44,2,c); for(var i=0;i<6;i++){ var yy=H+8+i*6; s+='<path d="M0 '+yy+' Q200 '+(yy-2)+' 400 '+yy+'" stroke="'+c+'" stroke-width="'+(1.2+i*.5)+'" opacity=".3" fill="none"/>'; } break;
      case 'lake': if(P.night) s+=skyline(r,H+2,-4,404,c,L,62); else { s+=ridge(r,H+2,14,8,c,.85); }
        for(var k=-4;k<=4;k++){ var hh=40-Math.abs(k)*6; s+='<path d="M200 '+(H+4)+' Q'+(200+k*7)+' '+(H+4-hh*2.1)+' '+(200+k*14)+' '+(H+4)+'" fill="none" stroke="'+(P.night?'#bff1ff':'#ffffff')+'" stroke-width="1.3" opacity=".8"/>'; }
        s+='<path d="M-10 236 Q120 222 220 232 Q320 242 410 228 L410 260 L-10 260Z" fill="'+c+'"/>'; break;
      case 'garden': s+=plane(90,58,.9,c)+'<path d="M-10 '+(H+14)+' Q200 '+(H+2)+' 410 '+(H+16)+' L410 260 L-10 260Z" fill="'+c+'" opacity=".55"/>'+flowers(r,H+12,260,['#ff9ec4','#ffffff','#f5c7e0','#ffd3e6']); break;
      case 'beach': s+='<path d="M-10 214 Q120 196 250 212 Q330 222 410 206 L410 260 L-10 260Z" fill="#f3dcb6" opacity="'+(P.night?.25:.9)+'"/><path d="M-10 214 Q120 196 250 212 Q330 222 410 206" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>'+umbrella(96,222,c,c)+umbrella(150,216,c,c)+people(300,226,2,c); break;
      case 'marina': s+='<rect x="-10" y="'+(H+38)+'" width="250" height="5" fill="'+c+'"/>'; for(var m=0;m<5;m++) s+=yacht(30+m*44,H+36,.9+r()*.2,c); s+=yacht(310,H+56,1.4,c); break;
      case 'island': s+='<path d="M60 '+(H+2)+' Q130 '+(H-58)+' 210 '+(H-20)+' Q250 '+(H-36)+' 290 '+(H+2)+'Z" fill="'+c+'"/><path d="M290 '+(H+2)+' Q330 '+(H-30)+' 380 '+(H+2)+'Z" fill="'+c+'" opacity=".8"/><path d="M262 '+(H-2)+' Q300 '+(H-18)+' 336 '+(H-2)+'" fill="none" stroke="'+L+'" stroke-width="1.6"/><line x1="262" y1="'+(H-2)+'" x2="336" y2="'+(H-2)+'" stroke="'+L+'" stroke-width="2"/>'; break;
      case 'bridge': s+=girder(H+18,c); break;
      case 'cable': s+=cableBridge(H-4,c,[130,250]); break;
      case 'temple': s+='<path d="M-10 '+(H+10)+' Q120 '+(H-62)+' 260 '+(H-30)+' Q330 '+(H-14)+' 410 '+(H+10)+'Z" fill="'+c+'"/>'+templeRoof(170,H-46,.72,c)+tree(70,H-14,14,c)+tree(300,H-8,12,c)+tree(330,H-2,10,c)+birds(r,4,260,60,c); break;
      case 'pavilion': s+=rampart(H+36,c)+pavilion(200,H+2,1,c)+birds(r,5,60,50,c); break;
      case 'oldmarket': s+=shops(-6,406,H+44,c,L,r)+'<rect y="'+(H+44)+'" width="400" height="60" fill="'+c+'" opacity=".55"/>'; break;
      case 'street': s+=paifang(200,H+46,1.25,c,'#c2423f'); for(var q=0;q<7;q++) s+='<circle cx="'+(60+q*48)+'" cy="'+(H-34+Math.sin(q)*6)+'" r="5" fill="#d9453f" opacity=".9"/>'; s+='<path d="M60 '+(H-36)+' Q200 '+(H-24)+' 350 '+(H-36)+'" stroke="'+c+'" stroke-width="1" fill="none"/>'; break;
      case 'promenade': s+=wheel(300,H-40,42,c)+'<rect x="-10" y="'+(H+30)+'" width="420" height="3" fill="'+c+'"/>'; for(var p=0;p<420;p+=18) s+='<rect x="'+p+'" y="'+(H+30)+'" width="2" height="16" fill="'+c+'"/>'; s+='<rect x="-10" y="'+(H+46)+'" width="420" height="80" fill="'+c+'" opacity=".9"/>'+people(120,H+46,3,c); break;
      default: /* park */ s+=ridge(r,H+20,20,6,c,.85);
        [[40,H+40,16],[78,H+52,12],[330,H+38,18],[366,H+52,13],[250,H+50,10]].forEach(function(t){ s+=tree(t[0],t[1],t[2],c); });
        s+='<path d="M120 260 Q170 210 220 '+(H+44)+'" stroke="'+(P.day?'#f3ead6':L)+'" stroke-width="7" fill="none" opacity=".8" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>'+d+'</defs>'+s+'</svg>';
  }
  function seedOf(t){ var h=7; t=String(t||''); for(var i=0;i<t.length;i++) h=(h*31+t.charCodeAt(i))>>>0; return h; }

  function visual(o,kind){ if(o&&o.img) return '<img class="tv-img" src="'+esc(o.img)+'" alt="" loading="lazy">';
    if(o&&o.cat) return spotScene(kind, o.lm==='sunset_ring'?'sunset':(o.lm||o.cat), o.lm==='sunset_ring'?7:seedOf(o.n)); return art(kind); }

  /* ═════════ 3. 아이콘 ═════════ */
  var I={
    back:'<path d="M15 5l-7 7 7 7"/>', share:'<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/>', chev:'<path d="M9 6l6 6-6 6"/>',
    route:'<circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8.2 17h6.3a3.5 3.5 0 0 0 0-7h-5a3.5 3.5 0 0 1 0-7h6.3"/>',
    clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>', sun:'<circle cx="12" cy="13" r="4"/><path d="M3 18h18M12 4v2M5.6 7.6l1.4 1.4M18.4 7.6 17 9"/>',
    car:'<path d="M4 16v-3.5l2-5h12l2 5V16"/><path d="M3 16h18v2.2H3z"/><circle cx="7.5" cy="18.4" r="1.6"/><circle cx="16.5" cy="18.4" r="1.6"/>',
    pin:'<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21Z"/><circle cx="12" cy="10" r="2.4"/>',
    info:'<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>', check:'<path d="M5 12.5 9.5 17 19 7.5"/>', toll:'<rect x="3.5" y="6.5" width="17" height="11" rx="2.2"/><path d="M3.5 10.5h17"/><path d="M7 14h3"/>',
    alert:'<path d="M12 4 21 19H3L12 4Z"/><path d="M12 10v4M12 16.8h.01"/>', map:'<path d="M9 4 3.5 6v14L9 18l6 2 5.5-2V4L15 6 9 4Z"/><path d="M9 4v14M15 6v14"/>', nav:'<path d="M4 11.5 20 4l-7.5 16-2-6.5-6.5-2Z"/>',
    walk:'<circle cx="13" cy="4.6" r="1.8"/><path d="M10 21l2-6-2.5-2.5 1.2-4.2L14 10l2.4 1.4"/><path d="M12.4 15 15 21"/>', spark:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/>',
    /* 장소 분류 */
    park:'<path d="M12 21v-5"/><path d="M12 16c-4 0-6-2.6-6-5.4C6 7.4 8.7 4 12 4s6 3.4 6 6.6C18 13.4 16 16 12 16Z"/><path d="M4 21h16"/>',
    tower:'<path d="M8 21 10 9h4l2 12"/><path d="M6 9h12l-1.5-4h-9L6 9Z"/><path d="M9.2 15h5.6"/>', wetland:'<path d="M12 20V9"/><path d="M12 9l-5-4M12 9l5-4M12 9l-4 5M12 9l4 5"/><path d="M4 20h16"/>',
    market:'<path d="M3 9.5 5 4h14l2 5.5"/><path d="M4 9.5V20h16V9.5"/><path d="M3 9.5a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M10 20v-5h4v5"/>',
    fall:'<path d="M4 6h16"/><path d="M8 6v9M12 6v12M16 6v9"/><path d="M5 20c2-1.5 4-1.5 7 0s5 1.5 7 0"/>', sunset:'<path d="M4 17h16M7 20h10"/><path d="M7.5 17a4.5 4.5 0 0 1 9 0"/><path d="M12 6v3M5.5 9.5l1.8 1.8M18.5 9.5l-1.8 1.8"/>',
    lake:'<path d="M3 14c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/><path d="M3 18c2-1.6 4-1.6 6 0s4 1.6 6 0 4-1.6 6 0"/><path d="M8 10l2.5-4 2.5 4M14 10l2-3 2 3"/>',
    garden:'<circle cx="12" cy="9" r="2.6"/><path d="M12 6.4V4M12 14.6v6.4M9.4 9H7M17 9h-2.4M10 7l-1.5-1.5M14 7l1.5-1.5M10 11l-1.5 1.5M14 11l1.5 1.5"/><path d="M12 17c-2-2.4-4.5-2.4-6-1.6M12 17c2-2.4 4.5-2.4 6-1.6"/>',
    beach:'<path d="M3 19c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M12 15V5"/><path d="M5 9a7 5 0 0 1 14 0Z"/>', marina:'<path d="M12 3v13"/><path d="M12 4l6 10h-6M11 6 6 14h5"/><path d="M3 17h18l-2.5 3.5h-13Z"/>',
    island:'<path d="M3 19c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M5 16c1.5-4.5 4-7 7-7s5.5 2.5 7 7"/><path d="M14 9c0-2.4 1.4-4 3.6-4.6"/>',
    bridge:'<path d="M2 15h20"/><path d="M6 15V7M18 15V7"/><path d="M6 7c3 4 9 4 12 0"/><path d="M10 15v-3M14 15v-3M2 19h20"/>',
    temple:'<path d="M3 10c4 0 6-2.6 9-5 3 2.4 5 5 9 5"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>', pavilion:'<path d="M3 9c4 0 6-2 9-4.5C15 7 17 9 21 9"/><path d="M6 9v11M18 9v11M4 14h16"/>',
    oldmarket:'<path d="M4 20V9l4-4 4 4 4-4 4 4v11"/><path d="M4 13h16"/><path d="M9 20v-4h6v4"/>', street:'<path d="M4 20V8l5-3v15M9 20V10h6v10M15 20V6l5 2v12"/><path d="M2 20h20"/>',
    airport:'<path d="M2.5 19h19"/><path d="M3.5 13.5 8 15l8-4.6c1.4-.8 3-.9 3.7 0 .5.7 0 1.6-.8 2L9.6 17.6 4.6 16Z"/><path d="M10.5 9.6 7 6.4l1.8-.8 5.2 2.4"/>',
    promenade:'<path d="M3 15c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><path d="M3 19c2-1.4 4-1.4 6 0s4 1.4 6 0 4-1.4 6 0"/><circle cx="16" cy="6" r="2.4"/>'
  };
  function ic(k,cls){ return '<svg class="'+(cls||'tv-i')+'" viewBox="0 0 24 24">'+(I[k]||I.pin)+'</svg>'; }
  function esc(s){ return String(s==null?'':s).replace(/[&<>"']/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
  function toast(m){ try{ if(window.showToast) return showToast(m); }catch(e){} }

  /* ═════════ 4. 저장(하트) ═════════ */
  var FKEY='caro_tv_fav';
  function favs(){ try{ return JSON.parse(localStorage.getItem(FKEY)||'[]')||[]; }catch(e){ return []; } }
  function isFav(id){ return favs().indexOf(id)>=0; }
  function toggleFav(id){ var f=favs(), i=f.indexOf(id); if(i>=0) f.splice(i,1); else f.push(id); try{ localStorage.setItem(FKEY,JSON.stringify(f)); }catch(e){} return i<0; }

  /* ═════════ 5. CSS ═════════ */
  function css(){
    if(document.getElementById('tv-css')) return;
    var st=document.createElement('style'); st.id='tv-css';
    st.textContent=[
    '.tv-layer{position:fixed;inset:0;z-index:1450;background:#f3f4f6;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;transform:translateX(100%);transition:transform .42s cubic-bezier(.22,1,.36,1),filter .42s;font-family:var(--font,"Pretendard Variable",sans-serif);color:#16181c;-webkit-font-smoothing:antialiased;}',
    '.tv-layer.in{transform:none;} .tv-layer.under{transform:translateX(-22%);filter:brightness(.92);} .tv-layer.out{transform:translateX(100%);}',
    '.tv-layer *{box-sizing:border-box;} .tv-layer button{font-family:inherit;}',
    '.tv-wrap{max-width:640px;margin:0 auto;}',
    '.tv-i{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;flex:0 0 auto;}',
    '.tv-art{position:relative;overflow:hidden;background:#1d2030;} .tv-art>svg,.tv-art>.tv-img{position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;}',
    /* 상단 바 */
    '.tv-bar{position:sticky;top:0;z-index:5;display:flex;align-items:center;gap:6px;padding:calc(10px + var(--sat,env(safe-area-inset-top,0px))) 12px 10px;background:rgba(243,244,246,.86);-webkit-backdrop-filter:saturate(1.6) blur(16px);backdrop-filter:saturate(1.6) blur(16px);}',
    '.tv-bar h1{flex:1;font-size:16.5px;font-weight:750;letter-spacing:-.2px;margin:0;text-align:center;padding-right:42px;}',
    '.tv-cb{width:42px;height:42px;border-radius:50%;border:0;background:transparent;display:flex;align-items:center;justify-content:center;color:#16181c;cursor:pointer;flex:0 0 auto;}',
    '.tv-cb:active{background:rgba(0,0,0,.06);} .tv-cb .tv-i{width:22px;height:22px;stroke-width:2;}',
    '.tv-glass{background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.28);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);color:#fff;}',
    '.tv-glass:active{background:rgba(255,255,255,.3);} .tv-glass.on .tv-i{fill:#ff5a6e;stroke:#ff5a6e;}',
    /* 목록 */
    '.tv-intro{padding:8px 20px 4px;} .tv-eyebrow{display:flex;align-items:center;gap:8px;font-size:10.5px;font-weight:800;letter-spacing:.2em;color:#8a919b;text-transform:uppercase;}',
    '.tv-eyebrow i{font-style:normal;color:#16181c;letter-spacing:.06em;} .tv-eyebrow:before{content:"";width:18px;height:1.5px;background:#c8a96e;border-radius:2px;}',
    '.tv-h{font-size:28px;line-height:1.22;font-weight:800;letter-spacing:-.8px;margin:12px 0 10px;} .tv-h em{font-style:normal;color:#8a919b;}',
    '.tv-lead{font-size:14px;line-height:1.65;color:#5b636e;margin:0;}',
    '.tv-chips{display:flex;gap:8px;overflow-x:auto;padding:18px 20px 6px;scrollbar-width:none;} .tv-chips::-webkit-scrollbar{display:none;}',
    '.tv-chip{flex:0 0 auto;height:36px;padding:0 15px;border-radius:18px;border:1px solid #e1e4e9;background:#fff;font-size:13px;font-weight:650;color:#4b525c;cursor:pointer;display:flex;align-items:center;gap:6px;transition:all .2s;}',
    '.tv-chip.on{background:#16181c;border-color:#16181c;color:#fff;} .tv-chip .tv-i{width:15px;height:15px;}',
    '.tv-list{padding:10px 16px 0;display:grid;gap:16px;}',
    '.tv-card{background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 1px 2px rgba(20,24,30,.04),0 10px 28px -16px rgba(20,24,30,.28);cursor:pointer;transition:transform .18s ease;animation:tvUp .5s cubic-bezier(.22,1,.36,1) both;}',
    '.tv-card:active{transform:scale(.985);}',
    '@keyframes tvUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:none;}}',
    '.tv-card .tv-art{height:188px;} .tv-card .tv-art:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.18) 0%,rgba(0,0,0,0) 36%,rgba(0,0,0,0) 58%,rgba(0,0,0,.48) 100%);}',
    '.tv-no{position:absolute;left:16px;bottom:13px;z-index:2;font-size:12px;font-weight:800;letter-spacing:.18em;color:rgba(255,255,255,.92);}',
    '.tv-no b{display:block;font-size:21px;letter-spacing:-.4px;color:#fff;margin-top:3px;text-shadow:0 2px 14px rgba(0,0,0,.25);}',
    '.tv-tags{position:absolute;left:14px;top:14px;z-index:2;display:flex;gap:6px;}',
    '.tv-tag{height:24px;padding:0 10px;border-radius:12px;font-size:11px;font-weight:750;display:inline-flex;align-items:center;}',
    '.tv-tags .tv-tag{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);color:#fff;-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);}',
    '.tv-fav{position:absolute;right:12px;top:10px;z-index:3;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;}',
    '.tv-fav .tv-i{width:20px;height:20px;} .tv-fav.on .tv-i{fill:#ff5a6e;stroke:#ff5a6e;}',
    '.tv-cbody{padding:16px 18px 18px;} .tv-sum{font-size:13.5px;line-height:1.6;color:#4b525c;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}',
    '.tv-route{display:flex;flex-wrap:wrap;align-items:center;gap:4px 6px;margin-top:12px;font-size:12.5px;font-weight:650;color:#16181c;}',
    '.tv-route i{width:12px;height:1.4px;background:#cfd3da;display:inline-block;border-radius:1px;}',
    '.tv-meta{display:flex;gap:6px;margin-top:14px;flex-wrap:wrap;}',
    '.tv-pill{height:28px;padding:0 10px;border-radius:9px;background:#f3f4f6;font-size:11.5px;font-weight:700;color:#4b525c;display:inline-flex;align-items:center;gap:5px;}',
    '.tv-pill .tv-i{width:14px;height:14px;stroke-width:2;} .tv-pill.gold{background:#f7f0e2;color:#8a6a2f;}',
    '.tv-sub{display:flex;align-items:center;gap:10px;margin:30px 20px 12px;font-size:15px;font-weight:800;letter-spacing:-.2px;} .tv-sub:after{content:"";flex:1;height:1px;background:#e3e6ea;}',
    '.tv-hs{display:flex;gap:12px;overflow-x:auto;padding:2px 16px 8px;scroll-padding:0 16px;scroll-snap-type:x mandatory;scrollbar-width:none;} .tv-hs::-webkit-scrollbar{display:none;}',
    '.tv-mini{flex:0 0 72%;max-width:280px;scroll-snap-align:start;background:#fff;border-radius:20px;overflow:hidden;cursor:pointer;box-shadow:0 8px 22px -16px rgba(20,24,30,.35);}',
    '.tv-mini .tv-art{height:120px;} .tv-mini .tv-mb{padding:12px 14px 14px;} .tv-mini b{display:block;font-size:14.5px;font-weight:780;letter-spacing:-.2px;}',
    '.tv-mini p{margin:5px 0 0;font-size:12px;line-height:1.5;color:#6b727c;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;} .tv-mini .tv-meta{margin-top:10px;}',
    '.tv-foot{margin:26px 20px 0;padding:16px;border-radius:16px;background:#e9ebee;font-size:12px;line-height:1.65;color:#5b636e;}',
    '.tv-foot b{color:#16181c;} .tv-empty{padding:40px 20px;text-align:center;color:#8a919b;font-size:13.5px;line-height:1.7;}',
    /* 코스 상세 */
    '.tv-hero{position:relative;height:min(84vw,380px);} .tv-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.30) 0%,rgba(0,0,0,0) 28%,rgba(0,0,0,0) 46%,rgba(0,0,0,.62) 100%);}',
    '.tv-hero>svg{transform:scale(1.06);transition:transform 1.6s cubic-bezier(.22,1,.36,1);} .tv-layer.in .tv-hero>svg{transform:scale(1);}',
    '.tv-htop{position:absolute;left:0;right:0;top:0;z-index:3;display:flex;gap:8px;padding:calc(10px + var(--sat,env(safe-area-inset-top,0px))) 12px 0;}',
    '.tv-htop .sp{flex:1;}',
    '.tv-htxt{position:absolute;left:20px;right:20px;bottom:36px;z-index:3;color:#fff;}',
    '.tv-htxt .tv-tag{background:rgba(255,255,255,.2);border:1px solid rgba(255,255,255,.3);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);margin-right:6px;}',
    '.tv-htxt h2{margin:12px 0 6px;font-size:30px;font-weight:820;letter-spacing:-.9px;line-height:1.18;text-shadow:0 2px 20px rgba(0,0,0,.25);}',
    '.tv-htxt p{margin:0;font-size:13px;font-weight:650;color:rgba(255,255,255,.86);display:flex;align-items:center;gap:6px;} .tv-htxt p .tv-i{width:15px;height:15px;}',
    '.tv-sheet{position:relative;z-index:4;margin-top:-22px;background:#f3f4f6;border-radius:24px 24px 0 0;padding:20px 16px calc(120px + var(--sab,0px));}',
    '.tv-stats{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}',
    '.tv-stat{background:#fff;border-radius:16px;padding:13px 14px;display:flex;gap:11px;align-items:center;}',
    '.tv-stat .bx{width:38px;height:38px;border-radius:12px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;color:#4b525c;flex:0 0 auto;}',
    '.tv-stat .bx .tv-i{width:19px;height:19px;} .tv-stat small{display:block;font-size:11px;font-weight:700;color:#8a919b;} .tv-stat b{display:block;font-size:14px;font-weight:780;margin-top:2px;letter-spacing:-.2px;}',
    '.tv-stat.car .bx{background:#16181c;color:#c8a96e;}',
    '.tv-card2{background:#fff;border-radius:20px;padding:18px;margin-top:12px;}',
    '.tv-card2 h3{margin:0 0 12px;font-size:15.5px;font-weight:800;letter-spacing:-.3px;display:flex;align-items:center;gap:8px;} .tv-card2 h3 small{font-size:12px;color:#8a919b;font-weight:700;}',
    '.tv-p{margin:0;font-size:14.5px;line-height:1.75;color:#3a4048;} .tv-p+.tv-p{margin-top:10px;}',
    '.tv-call{display:flex;gap:10px;align-items:flex-start;padding:13px 14px;border-radius:14px;margin-top:10px;font-size:13px;line-height:1.6;}',
    '.tv-call .tv-i{width:18px;height:18px;margin-top:1px;} .tv-call b{font-weight:800;margin-right:4px;}',
    '.tv-call.toll{background:#f2f4f7;color:#3a4048;} .tv-call.note{background:#f7f0e2;color:#6c5326;} .tv-call.must{background:#fdecec;color:#8c2a2a;}',
    /* 경로 타임라인 */
    '.tv-tl{position:relative;margin:4px 0 0;padding:0;list-style:none;}',
    '.tv-st{position:relative;display:flex;gap:14px;padding:12px 4px 12px 0;cursor:pointer;animation:tvUp .5s cubic-bezier(.22,1,.36,1) both;}',
    '.tv-st:active{opacity:.7;} .tv-st:not(:last-child):before{content:"";position:absolute;left:17px;top:48px;bottom:-12px;width:2px;background:repeating-linear-gradient(#d6dae0 0 4px,transparent 4px 8px);}',
    '.tv-dot{width:36px;height:36px;border-radius:50%;background:#16181c;color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex:0 0 auto;position:relative;z-index:1;box-shadow:0 0 0 4px #fff;}',
    '.tv-st:first-child .tv-dot{background:#c8a96e;color:#16181c;} .tv-st:last-child .tv-dot{background:#fff;color:#16181c;border:2px solid #16181c;}',
    '.tv-stb{flex:1;min-width:0;} .tv-stn{display:flex;align-items:center;gap:7px;flex-wrap:wrap;} .tv-stn b{font-size:15.5px;font-weight:780;letter-spacing:-.3px;}',
    '.tv-cl{font-size:10.5px;font-weight:750;padding:3px 8px;border-radius:7px;background:#f3f4f6;color:#5b636e;}',
    '.tv-st p{margin:5px 0 0;font-size:13px;line-height:1.55;color:#5b636e;} .tv-st small{display:inline-flex;align-items:center;gap:4px;margin-top:7px;font-size:11.5px;font-weight:700;color:#8a919b;} .tv-st small .tv-i{width:13px;height:13px;}',
    '.tv-thumb{width:64px;height:64px;border-radius:16px;overflow:hidden;flex:0 0 auto;align-self:center;position:relative;}',
    '.tv-thumb .tv-ti{position:absolute;right:4px;bottom:4px;width:22px;height:22px;border-radius:7px;display:flex;align-items:center;justify-content:center;color:#fff;background:rgba(10,12,16,.42);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);} .tv-thumb .tv-ti .tv-i{width:13px;height:13px;stroke-width:2;}',
    '.tv-tips{list-style:none;margin:0;padding:0;display:grid;gap:10px;}',
    '.tv-tips li{display:flex;gap:10px;font-size:13.5px;line-height:1.6;color:#3a4048;} .tv-tips .ck{width:22px;height:22px;border-radius:50%;background:#16181c;color:#fff;display:flex;align-items:center;justify-content:center;flex:0 0 auto;margin-top:1px;} .tv-tips .ck .tv-i{width:13px;height:13px;stroke-width:2.6;}',
    '.tv-small{margin:14px 4px 0;font-size:11.5px;line-height:1.6;color:#8a919b;}',
    /* 하단 고정 버튼 */
    '.tv-cta{position:fixed;left:0;right:0;bottom:0;z-index:20;padding:12px 16px calc(12px + var(--sab,0px));background:linear-gradient(180deg,rgba(243,244,246,0) 0%,#f3f4f6 30%);pointer-events:none;}',
    '.tv-cta-in{max-width:608px;margin:0 auto;display:flex;gap:8px;pointer-events:auto;}',
    '.tv-btn{height:54px;border-radius:16px;border:0;font-size:15px;font-weight:780;letter-spacing:-.2px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:transform .15s;}',
    '.tv-btn:active{transform:scale(.98);} .tv-btn.pri{flex:1;background:#16181c;color:#fff;box-shadow:0 12px 26px -12px rgba(22,24,28,.7);} .tv-btn.pri small{font-size:12px;font-weight:650;color:#c8a96e;margin-left:2px;}',
    '.tv-btn.sec{width:54px;background:#fff;color:#16181c;box-shadow:0 8px 20px -14px rgba(22,24,28,.5);} .tv-btn.sec.on .tv-i{fill:#ff5a6e;stroke:#ff5a6e;}',
    /* 여행지 상세 */
    '.tv-shero{position:relative;height:min(72vw,320px);} .tv-shero:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.32) 0%,rgba(0,0,0,0) 34%,rgba(0,0,0,.05) 60%,rgba(0,0,0,.55) 100%);}',
    '.tv-badge{position:absolute;right:20px;bottom:44px;z-index:3;width:66px;height:66px;border-radius:22px;display:flex;align-items:center;justify-content:center;}',
    '.tv-badge .tv-i{width:30px;height:30px;stroke-width:1.6;}',
    '.tv-stop{position:absolute;left:20px;bottom:42px;z-index:3;color:#fff;font-size:11.5px;font-weight:800;letter-spacing:.18em;} .tv-stop b{display:block;margin-top:4px;font-size:13px;letter-spacing:0;font-weight:700;color:rgba(255,255,255,.85);}',
    '.tv-stitle{margin:2px 4px 0;} .tv-stitle h2{margin:0;font-size:26px;font-weight:820;letter-spacing:-.8px;} .tv-stitle p{margin:6px 0 0;font-size:13px;font-weight:650;color:#6b727c;display:flex;align-items:center;gap:5px;} .tv-stitle p .tv-i{width:15px;height:15px;}',
    '.tv-one{margin:14px 4px 0;font-size:16px;line-height:1.55;font-weight:700;letter-spacing:-.3px;color:#16181c;padding-left:14px;border-left:3px solid #c8a96e;}',
    '.tv-hls{display:flex;gap:6px;flex-wrap:wrap;margin:14px 4px 0;} .tv-hls span{height:28px;padding:0 11px;border-radius:14px;background:#fff;border:1px solid #e3e6ea;font-size:12px;font-weight:700;color:#4b525c;display:inline-flex;align-items:center;}',
    '.tv-rows{display:grid;gap:0;} .tv-row{display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f0f1f3;font-size:13.5px;} .tv-row:last-child{border-bottom:0;}',
    '.tv-row .tv-i{width:18px;height:18px;color:#8a919b;} .tv-row span{color:#6b727c;font-weight:650;width:92px;flex:0 0 auto;} .tv-row b{flex:1;font-weight:750;color:#16181c;}',
    '.tv-maps{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}',
    '.tv-mapbtn{height:50px;border-radius:14px;border:1px solid #e3e6ea;background:#fff;font-size:13.5px;font-weight:750;color:#16181c;display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;}',
    '.tv-mapbtn:active{background:#f3f4f6;} .tv-mapbtn i{width:22px;height:22px;border-radius:7px;display:inline-flex;align-items:center;justify-content:center;font-style:normal;font-size:12px;font-weight:900;}',
    '.tv-mapbtn .k{background:#fee500;color:#191919;} .tv-mapbtn .n{background:#03c75a;color:#fff;}',
    '.tv-pn{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;}',
    '.tv-pnb{background:#fff;border-radius:16px;padding:13px 14px;cursor:pointer;border:0;text-align:left;min-height:66px;}',
    '.tv-pnb small{display:flex;align-items:center;gap:3px;font-size:11px;font-weight:800;color:#8a919b;letter-spacing:.04em;} .tv-pnb small .tv-i{width:13px;height:13px;stroke-width:2.4;}',
    '.tv-pnb b{display:block;margin-top:5px;font-size:13.5px;font-weight:780;color:#16181c;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}',
    '.tv-pnb.nx{text-align:right;} .tv-pnb.nx small{justify-content:flex-end;} .tv-pnb[disabled]{opacity:.45;cursor:default;}',
    /* 홈 섹션 */
    '.tv-home{margin-top:22px;} .tv-home .nh-sec-hd{margin:0 2px 10px;}',
    '.tv-home .tv-hs{padding:2px 0 8px;margin:0 -16px;padding-left:16px;padding-right:16px;}',
    '.tv-hc{flex:0 0 62%;max-width:240px;height:200px;scroll-snap-align:start;border-radius:20px;overflow:hidden;position:relative;cursor:pointer;box-shadow:0 10px 24px -16px rgba(20,24,30,.55);}',
    '.tv-hc:active{transform:scale(.98);} .tv-hc .tv-art{position:absolute;inset:0;} .tv-hc:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.1) 0%,rgba(0,0,0,0) 40%,rgba(0,0,0,.6) 100%);}',
    '.tv-hc .tv-hct{position:absolute;left:14px;right:14px;bottom:13px;z-index:2;color:#fff;} .tv-hc .tv-hct small{font-size:10.5px;font-weight:800;letter-spacing:.16em;opacity:.85;}',
    '.tv-hc .tv-hct b{display:block;margin-top:3px;font-size:16.5px;font-weight:800;letter-spacing:-.4px;line-height:1.25;} .tv-hc .tv-hct span{display:block;margin-top:4px;font-size:11.5px;font-weight:650;opacity:.85;}',
    '.tv-hc .tv-tags{left:12px;top:12px;} .tv-hc .tv-tag{height:22px;font-size:10.5px;}',
    '.tv-hc.more{background:#16181c;display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-end;padding:16px;color:#fff;flex-basis:44%;}',
    '.tv-hc.more:after{display:none;} .tv-hc.more .ar{width:40px;height:40px;border-radius:50%;background:#c8a96e;color:#16181c;display:flex;align-items:center;justify-content:center;margin-bottom:auto;}',
    '.tv-hc.more b{font-size:15px;font-weight:800;line-height:1.35;} .tv-hc.more span{font-size:11.5px;color:#9aa1ab;margin-top:5px;font-weight:650;}',
    '@media (min-width:600px){.tv-list{grid-template-columns:1fr 1fr;} .tv-card .tv-art{height:170px;} .tv-stats{grid-template-columns:repeat(4,1fr);}}',
    '@media (prefers-reduced-motion:reduce){.tv-layer,.tv-card,.tv-st,.tv-hero>svg{transition:none!important;animation:none!important;}}'
    ].join('\n');
    (document.head||document.documentElement).appendChild(st);
  }

  /* ═════════ 6. 레이어(화면) 관리 — 뒤로가기 한 단계씩 ═════════ */
  var STACK=[];
  function push(el){
    css(); document.body.appendChild(el);
    var prev=STACK[STACK.length-1]; STACK.push(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('in'); if(prev) prev.classList.add('under'); }); });
    try{ history.pushState({tv:STACK.length},'',''); }catch(e){}
    return el;
  }
  function popTop(){
    var el=STACK.pop(); if(!el) return false;
    el.classList.remove('in'); el.classList.add('out');
    var prev=STACK[STACK.length-1]; if(prev) prev.classList.remove('under');
    setTimeout(function(){ if(el.parentNode) el.parentNode.removeChild(el); }, 450);
    return true;
  }
  var skipPop=0;
  function back(){ if(!STACK.length) return false; try{ skipPop++; history.back(); }catch(e){ skipPop=0; } popTop(); return true; }
  function closeAll(){ var n=STACK.length; while(STACK.length) popTop(); if(n){ try{ skipPop++; history.go(-n); }catch(e){ skipPop=0; } } }
  function replaceTop(el){ css(); var old=STACK.pop(); STACK.push(el); el.style.transition='none'; el.classList.add('in'); document.body.appendChild(el); void el.offsetWidth; el.style.transition='';
    if(old){ old.style.transition='opacity .22s'; old.style.opacity='0'; setTimeout(function(){ if(old.parentNode) old.parentNode.removeChild(old); },240); } return el; }
  window.addEventListener('popstate',function(e){ if(skipPop>0){ skipPop--; e.stopImmediatePropagation&&e.stopImmediatePropagation(); return; } if(STACK.length){ popTop(); e.stopImmediatePropagation&&e.stopImmediatePropagation(); } }, true);
  /* 안드로이드 하드웨어 뒤로가기 — 기존 caroBack 보다 먼저 우리 화면을 닫는다 */
  function hookBack(){ var orig=window.caroBack; if(orig&&orig.__tv) return; var f=function(){ if(STACK.length){ back(); return true; } return orig?orig.apply(this,arguments):false; }; f.__tv=true; window.caroBack=f; }
  hookBack(); setTimeout(hookBack,1500); setTimeout(hookBack,5000);

  /* ═════════ 7. 지도 열기 ═════════ */
  var IS_ANDROID_APP=/Android/i.test(navigator.userAgent)&&/; wv\)|Version\/\d/i.test(navigator.userAgent);
  function openMap(kind,q){
    var e=encodeURIComponent(q);
    if(IS_ANDROID_APP){
      var u= kind==='kakao' ? 'intent://search?q='+e+'#Intent;scheme=kakaomap;package=net.daum.android.map;end'
                            : 'intent://search?query='+e+'&appname=com.caro.mobility#Intent;scheme=nmap;package=com.nhn.android.nmap;end';
      location.href=u; return;
    }
    var w= kind==='kakao' ? 'https://map.kakao.com/link/search/'+e : 'https://map.naver.com/p/search/'+e;
    var a=document.createElement('a'); a.href=w; a.target='_blank'; a.rel='noopener'; document.body.appendChild(a); a.click(); a.remove();
  }
  function share(c){
    var text='[CARO 드라이브 코스] '+c.title+'\n'+c.stops.map(function(s){ return s.n; }).join(' → ')+'\n왕복 '+c.dist+' · 추천 차종 '+c.car;
    var url='https://caromobility.kr/#course';
    if(navigator.share){ navigator.share({title:c.title, text:text, url:url}).catch(function(){}); return; }
    var full=text+'\n'+url;
    try{ navigator.clipboard.writeText(full).then(function(){ toast('코스 내용을 복사했어요. 원하는 곳에 붙여 넣어 공유하세요.'); },function(){ toast(full); }); }catch(e){ toast(full); }
  }
  function book(c){
    closeAll();
    setTimeout(function(){ try{ if(window.goTo) goTo('rental-screen'); }catch(e){}
      setTimeout(function(){ toast('추천 차종: '+c.car+' — 가까운 거점에서 골라 예약하세요.'); }, 500); }, 260);
  }

  /* ═════════ 8. 화면: 목록 ═════════ */
  var FILTERS=[{k:'all',l:'전체'},{k:'night',l:'노을 · 야경',i:'sun'},{k:'sea',l:'바다 · 섬',i:'island'},{k:'long',l:'하루 코스',i:'route'},{k:'short',l:'짧게',i:'clock'},{k:'fav',l:'저장한 코스',i:'heart'}];
  function routeLine(c){ return '<div class="tv-route">'+c.stops.map(function(s,i){ return (i?'<i></i>':'')+'<span>'+esc(s.n)+'</span>'; }).join('')+'</div>'; }
  function cardHtml(c,idx){
    return '<article class="tv-card" data-c="'+c.id+'" style="animation-delay:'+(idx*60)+'ms">'
      +'<div class="tv-art">'+visual(c,c.art)
      +'<div class="tv-tags">'+c.tags.map(function(t){ return '<span class="tv-tag">'+esc(t)+'</span>'; }).join('')+'</div>'
      +'<button class="tv-fav tv-glass'+(isFav(c.id)?' on':'')+'" data-fav="'+c.id+'" aria-label="코스 저장">'+ic('heart')+'</button>'
      +'<div class="tv-no">'+(c.no?'COURSE '+c.no:'SHORT TRIP')+'<b>'+esc(c.title)+'</b></div></div>'
      +'<div class="tv-cbody"><p class="tv-sum">'+esc(c.sum)+'</p>'+routeLine(c)
      +'<div class="tv-meta"><span class="tv-pill">'+ic('route')+'왕복 '+esc(c.dist)+'</span><span class="tv-pill">'+ic('clock')+esc(c.dur)+'</span><span class="tv-pill gold">'+ic('car')+esc(c.car)+'</span>'
      +(c.toll?'<span class="tv-pill">'+ic('toll')+'통행료</span>':'')+'</div></div></article>';
  }
  function miniHtml(c){
    return '<div class="tv-mini" data-c="'+c.id+'"><div class="tv-art">'+visual(c,c.art)+'</div><div class="tv-mb"><b>'+esc(c.title)+'</b><p>'+esc(c.sum)+'</p>'
      +'<div class="tv-meta"><span class="tv-pill">'+ic('route')+'왕복 '+esc(c.dist)+'</span><span class="tv-pill">'+ic('clock')+esc(c.dur)+'</span></div></div></div>';
  }
  function openList(filter){
    var el=document.createElement('section'); el.className='tv-layer'; el.setAttribute('aria-label','인천 드라이브 코스');
    el.innerHTML='<div class="tv-bar"><button class="tv-cb" data-back aria-label="뒤로">'+ic('back')+'</button><h1>드라이브 코스</h1></div>'
      +'<div class="tv-wrap"><div class="tv-intro"><div class="tv-eyebrow"><i>04</i>Drive course · Incheon</div>'
      +'<h2 class="tv-h">인천,<br><em>한 바퀴 돌아볼까요</em></h2>'
      +'<p class="tv-lead">영종부터 강화까지 인천에서 많이 찾는 드라이브 코스를 모았어요. 거점에서 가까운 순서로 정리했습니다. 코스를 누르면 들를 곳과 팁이 자세히 나와요.</p></div>'
      +'<div class="tv-chips">'+FILTERS.map(function(f){ return '<button class="tv-chip'+(f.k===(filter||'all')?' on':'')+'" data-f="'+f.k+'">'+(f.i?ic(f.i):'')+f.l+'</button>'; }).join('')+'</div>'
      +'<div class="tv-list"></div><div class="tv-shorts"></div>'
      +'<div class="tv-foot">'+esc(NOTE_DIST)+' <b>서두르지 마시고 여유 있게 다녀오세요.</b> 대여 시간이 부족하면 앱에서 연장할 수 있어요.</div><div style="height:calc(40px + var(--sab,0px))"></div></div>';
    var listEl=el.querySelector('.tv-list'), shortEl=el.querySelector('.tv-shorts');
    function draw(f){
      var main=COURSES.filter(function(c){ return f==='all'||(f==='fav'?isFav(c.id):c.theme.indexOf(f)>=0); });
      var sh=SHORTS.filter(function(c){ return f==='all'||f==='short'||(f==='fav'?isFav(c.id):c.theme.indexOf(f)>=0); });
      if(f==='short'){ main=[]; }
      listEl.innerHTML=main.map(cardHtml).join('');
      shortEl.innerHTML= sh.length ? (f==='short' ? '<div class="tv-list">'+sh.map(cardHtml).join('')+'</div>'
                         : '<div class="tv-sub">짧게 다녀오기</div><div class="tv-hs">'+sh.map(miniHtml).join('')+'</div>') : '';
      if(!main.length&&!sh.length) listEl.innerHTML='<div class="tv-empty">'+(f==='fav'?'아직 저장한 코스가 없어요.<br>마음에 드는 코스의 하트를 눌러 보세요.':'해당하는 코스가 없어요.')+'</div>';
    }
    draw(filter||'all');
    el.addEventListener('click',function(e){
      var t=e.target.closest('[data-back],[data-f],[data-fav],[data-c]'); if(!t) return;
      if(t.hasAttribute('data-back')){ back(); return; }
      if(t.hasAttribute('data-f')){ el.querySelectorAll('.tv-chip').forEach(function(b){ b.classList.toggle('on',b===t); }); draw(t.getAttribute('data-f')); return; }
      if(t.hasAttribute('data-fav')){ e.stopPropagation(); var on=toggleFav(t.getAttribute('data-fav')); t.classList.toggle('on',on); toast(on?'코스를 저장했어요.':'저장을 취소했어요.'); syncHome(); return; }
      openCourse(t.getAttribute('data-c'));
    });
    return push(el);
  }

  /* ═════════ 9. 화면: 코스 상세 ═════════ */
  function openCourse(id){
    var c=byId(id); if(!c) return;
    var el=document.createElement('section'); el.className='tv-layer'; el.setAttribute('aria-label',c.title);
    var fav=isFav(c.id);
    el.innerHTML='<div class="tv-hero tv-art">'+visual(c,c.art)
      +'<div class="tv-htop"><button class="tv-cb tv-glass" data-back aria-label="뒤로">'+ic('back')+'</button><span class="sp"></span>'
      +'<button class="tv-cb tv-glass" data-share aria-label="공유">'+ic('share')+'</button><button class="tv-cb tv-glass'+(fav?' on':'')+'" data-fav aria-label="코스 저장">'+ic('heart')+'</button></div>'
      +'<div class="tv-htxt">'+c.tags.map(function(t){ return '<span class="tv-tag">'+esc(t)+'</span>'; }).join('')
      +'<h2>'+esc(c.title)+'</h2><p>'+ic('pin')+esc(c.area)+' · '+c.stops.length+'곳</p></div></div>'
      +'<div class="tv-sheet"><div class="tv-wrap">'
      +'<div class="tv-stats">'
        +'<div class="tv-stat"><span class="bx">'+ic('route')+'</span><div><small>왕복 거리</small><b>'+esc(c.dist)+'</b></div></div>'
        +'<div class="tv-stat"><span class="bx">'+ic('clock')+'</span><div><small>예상 소요</small><b>'+esc(c.dur)+'</b></div></div>'
        +'<div class="tv-stat"><span class="bx">'+ic('sun')+'</span><div><small>추천 시간</small><b>'+esc(c.when)+'</b></div></div>'
        +'<div class="tv-stat car"><span class="bx">'+ic('car')+'</span><div><small>추천 차종</small><b>'+esc(c.car)+'</b></div></div>'
      +'</div>'
      +'<div class="tv-card2"><h3>코스 소개</h3><p class="tv-p">'+esc(c.sum)+'</p>'
        +(c.toll?'<div class="tv-call toll">'+ic('toll')+'<div>'+esc(c.toll)+'</div></div>':'')
        +(c.must?'<div class="tv-call must">'+ic('alert')+'<div><b>'+esc(c.must.k)+'</b>'+esc(c.must.t)+'</div></div>':'')
        +(c.note?'<div class="tv-call note">'+ic('info')+'<div><b>'+esc(c.note.k)+'</b>'+esc(c.note.t)+'</div></div>':'')
      +'</div>'
      +'<div class="tv-card2"><h3>코스 경로 <small>'+c.stops.length+'곳 · 눌러서 자세히</small></h3><ol class="tv-tl">'
        +c.stops.map(function(s,i){ return '<li class="tv-st" data-s="'+i+'" style="animation-delay:'+(120+i*70)+'ms"><span class="tv-dot">'+(i+1)+'</span>'
          +'<div class="tv-stb"><div class="tv-stn"><b>'+esc(s.n)+'</b><span class="tv-cl">'+esc(s.cl)+'</span></div><p>'+esc(s.one)+'</p><small>'+ic('clock')+(/^\d/.test(s.stay)?'머무는 시간 약 '+esc(s.stay):esc(s.stay))+'</small></div>'
          +'<div class="tv-thumb tv-art">'+visual(s,c.art)+'<span class="tv-ti">'+ic(s.cat)+'</span></div></li>'; }).join('')
      +'</ol></div>'
      +'<div class="tv-card2"><h3>이렇게 다녀오세요</h3><ul class="tv-tips">'+c.tips.map(function(t){ return '<li><span class="ck">'+ic('check')+'</span><span>'+esc(t)+'</span></li>'; }).join('')+'</ul></div>'
      +'<p class="tv-small">'+esc(NOTE_DIST)+' '+esc(NOTE_INFO)+'</p>'
      +'</div></div>'
      +'<div class="tv-cta"><div class="tv-cta-in"><button class="tv-btn sec'+(fav?' on':'')+'" data-fav2 aria-label="코스 저장">'+ic('heart')+'</button>'
      +'<button class="tv-btn pri" data-book>'+ic('car')+'이 코스로 예약하기 <small>'+esc(c.car)+' 추천</small></button></div></div>';
    el.addEventListener('click',function(e){
      var t=e.target.closest('[data-back],[data-share],[data-fav],[data-fav2],[data-s],[data-book]'); if(!t) return;
      if(t.hasAttribute('data-back')) return back();
      if(t.hasAttribute('data-share')) return share(c);
      if(t.hasAttribute('data-fav')||t.hasAttribute('data-fav2')){ var on=toggleFav(c.id); el.querySelectorAll('[data-fav],[data-fav2]').forEach(function(b){ b.classList.toggle('on',on); }); toast(on?'코스를 저장했어요.':'저장을 취소했어요.'); syncLists(); syncHome(); return; }
      if(t.hasAttribute('data-book')) return book(c);
      openSpot(c.id, +t.getAttribute('data-s'));
    });
    return push(el);
  }

  /* ═════════ 10. 화면: 여행지 상세 ═════════ */
  function openSpot(cid, i, replace){
    var c=byId(cid); if(!c) return; var s=c.stops[i]; if(!s) return;
    var prev=c.stops[i-1], next=c.stops[i+1];
    var el=document.createElement('section'); el.className='tv-layer'; el.setAttribute('aria-label',s.n);
    el.innerHTML='<div class="tv-shero tv-art">'+visual(s,c.art)
      +'<div class="tv-htop"><button class="tv-cb tv-glass" data-back aria-label="뒤로">'+ic('back')+'</button><span class="sp"></span></div>'
      +'<div class="tv-stop">STOP '+String(i+1).padStart(2,'0')+' / '+String(c.stops.length).padStart(2,'0')+'<b>'+esc(c.title)+'</b></div>'
      +'<div class="tv-badge tv-glass">'+ic(s.cat)+'</div></div>'
      +'<div class="tv-sheet"><div class="tv-wrap">'
      +'<div class="tv-stitle"><h2>'+esc(s.n)+'</h2><p>'+ic('pin')+esc(c.area)+' · '+esc(s.cl)+'</p></div>'
      +'<div class="tv-one">'+esc(s.one)+'</div>'
      +'<div class="tv-hls">'+(s.hl||[]).map(function(h){ return '<span>#'+esc(h)+'</span>'; }).join('')+'</div>'
      +'<div class="tv-card2" style="margin-top:16px"><h3>이런 곳이에요</h3>'+s.d.map(function(p){ return '<p class="tv-p">'+esc(p)+'</p>'; }).join('')+'</div>'
      +'<div class="tv-card2"><h3>알아두면 좋아요</h3><ul class="tv-tips">'+s.t.map(function(t){ return '<li><span class="ck">'+ic('check')+'</span><span>'+esc(t)+'</span></li>'; }).join('')+'</ul></div>'
      +'<div class="tv-card2"><h3>방문 정보</h3><div class="tv-rows">'
        +'<div class="tv-row">'+ic('clock')+'<span>머무는 시간</span><b>'+(/^\d/.test(s.stay)?'약 '+esc(s.stay):esc(s.stay))+'</b></div>'
        +'<div class="tv-row">'+ic('sun')+'<span>코스 추천 시간</span><b>'+esc(c.when)+'</b></div>'
        +'<div class="tv-row">'+ic('car')+'<span>추천 차종</span><b>'+esc(c.car)+'</b></div>'
      +'</div><div class="tv-maps"><button class="tv-mapbtn" data-map="kakao"><i class="k">K</i>카카오맵</button><button class="tv-mapbtn" data-map="naver"><i class="n">N</i>네이버지도</button></div></div>'
      +'<div class="tv-pn"><button class="tv-pnb" data-go="'+(i-1)+'"'+(prev?'':' disabled')+'><small>'+ic('back')+'이전</small><b>'+(prev?esc(prev.n):'첫 장소예요')+'</b></button>'
      +'<button class="tv-pnb nx" data-go="'+(i+1)+'"'+(next?'':' disabled')+'><small>다음'+ic('chev')+'</small><b>'+(next?esc(next.n):'마지막 장소예요')+'</b></button></div>'
      +'<p class="tv-small">'+esc(NOTE_INFO)+'</p>'
      +'</div></div>'
      +'<div class="tv-cta"><div class="tv-cta-in"><button class="tv-btn pri" data-book>'+ic('car')+'이 코스로 예약하기 <small>'+esc(c.car)+' 추천</small></button></div></div>';
    el.addEventListener('click',function(e){
      var t=e.target.closest('[data-back],[data-map],[data-go],[data-book]'); if(!t||t.disabled) return;
      if(t.hasAttribute('data-back')) return back();
      if(t.hasAttribute('data-map')) return openMap(t.getAttribute('data-map'), s.q||s.n);
      if(t.hasAttribute('data-book')) return book(c);
      var j=+t.getAttribute('data-go'); if(!c.stops[j]) return;
      /* 이전/다음: 지금 화면을 새 장소로 갈아끼운다 (뒤로가기 이력은 그대로) */
      openSpot(cid,j,true);
    });
    return replace?replaceTop(el):push(el);
  }

  function syncLists(){ document.querySelectorAll('.tv-layer [data-fav]').forEach(function(b){ var id=b.getAttribute('data-fav'); if(id) b.classList.toggle('on',isFav(id)); }); }

  /* ═════════ 11. 홈 화면 섹션 ═════════ */
  function homeHtml(){
    return '<div class="nh-sec tv-home"><div class="nh-sec-hd"><h2>인천, 한 바퀴 돌아볼까요</h2><a data-tvall>전체보기 ›</a></div><div class="tv-hs">'
      +COURSES.map(function(c){ return '<div class="tv-hc" data-tvc="'+c.id+'"><div class="tv-art">'+visual(c,c.art)+'</div><div class="tv-tags"><span class="tv-tag">'+esc(c.tags[0])+'</span></div>'
        +'<div class="tv-hct"><small>COURSE '+c.no+'</small><b>'+esc(c.title)+'</b><span>왕복 '+esc(c.dist)+' · '+esc(c.car)+' 추천</span></div></div>'; }).join('')
      +'<div class="tv-hc more" data-tvall><span class="ar">'+ic('chev')+'</span><b>짧은 코스까지<br>10곳 모두 보기</b><span>월미도 · 인천대공원 · 청라</span></div>'
      +'</div></div>';
  }
  var _homeBusy=false;
  function ensureHome(){
    if(_homeBusy) return; var root=document.querySelector('#home-screen .nh-root'); if(!root) return;
    if(root.querySelector('.tv-home')) return;
    var anchor=root.querySelector('.nh-black'); anchor=anchor?anchor.closest('.nh-sec'):null;
    if(!anchor) anchor=root.querySelector('.hr-grid')||root.querySelector('.nh-menu');
    if(!anchor) return;
    _homeBusy=true; css();
    var tmp=document.createElement('div'); tmp.innerHTML=homeHtml(); var sec=tmp.firstChild;
    anchor.insertAdjacentElement('afterend',sec);
    _homeBusy=false;
  }
  function syncHome(){}
  var home=document.getElementById('home-screen');
  /* 클릭은 홈 화면 전체에 한 번만 위임 — 홈이 다시 그려져도(innerHTML 교체) 항상 동작 */
  if(home) home.addEventListener('click',function(e){ var t=e.target.closest&&e.target.closest('.tv-home [data-tvc],.tv-home [data-tvall]'); if(!t) return; e.stopPropagation();
    if(t.hasAttribute('data-tvc')) openCourse(t.getAttribute('data-tvc')); else openList(); });
  if(home&&window.MutationObserver){ new MutationObserver(function(){ ensureHome(); }).observe(home,{childList:true,subtree:true}); }
  [300,900,2000,4000].forEach(function(t){ setTimeout(ensureHome,t); });

  window.CaroTravel={ open:openList, openCourse:openCourse, openSpot:openSpot, close:closeAll, courses:ALL, _art:art, _visual:visual };
  console.log('[여행] ✅ 인천 드라이브 코스 v1 ('+ALL.length+'개 코스)');
})();
