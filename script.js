/* ============================================================
   CARO MOBILITY — script.js v5
   Android WebView + PWA 호환
   ============================================================ */

/* ─────────────────────────────────────────────
   1. 차량 SVG
───────────────────────────────────────────── */
function carSVG(color, label){
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">' +
    '<rect width="200" height="120" rx="8" fill="' + color + '"/>' +
    '<rect x="20" y="50" width="160" height="48" rx="10" fill="rgba(255,255,255,.16)"/>' +
    '<path d="M35 50 Q55 22 90 22 L130 22 Q160 22 170 50Z" fill="rgba(255,255,255,.2)"/>' +
    '<path d="M60 50 Q72 28 90 28 L130 28 Q145 28 150 50Z" fill="rgba(180,220,255,.5)"/>' +
    '<circle cx="58" cy="96" r="14" fill="#1a1c20"/><circle cx="58" cy="96" r="6" fill="#888"/>' +
    '<circle cx="142" cy="96" r="14" fill="#1a1c20"/><circle cx="142" cy="96" r="6" fill="#888"/>' +
    '<ellipse cx="178" cy="65" rx="9" ry="5" fill="rgba(255,240,100,.8)"/>' +
    '<ellipse cx="22" cy="65" rx="9" ry="5" fill="rgba(255,100,80,.7)"/>' +
    '<text x="100" y="115" text-anchor="middle" fill="rgba(255,255,255,.7)" font-size="9" font-family="Arial">' + label + '</text>' +
    '</svg>'
  );
}

/* ─────────────────────────────────────────────
   2. 일반 차량 데이터 (프레스티지 옵션 포함)
   주행요금: 전기차 km당 요금, 가솔린 50km 무료
───────────────────────────────────────────── */
/* ── 차량 요금 자동 적용 테이블 ── */
var CAR_PRICE_TABLE = [
  {name:'더뉴레이', pricePerHour:8209, kmRate:240},
  {name:'모닝 어반', pricePerHour:8209, kmRate:240},
  {name:'더뉴기아레이', pricePerHour:9042, kmRate:240},
  {name:'더뉴기아레이 루프탑', pricePerHour:11750, kmRate:285},
  {name:'더뉴모닝', pricePerHour:8709, kmRate:240},
  {name:'셀토스', pricePerHour:9834, kmRate:245},
  {name:'더뉴코나', pricePerHour:10000, kmRate:245},
  {name:'XM3', pricePerHour:10500, kmRate:245},
  {name:'베리 뉴 티볼리', pricePerHour:10417, kmRate:245},
  {name:'더뉴셀토스', pricePerHour:10500, kmRate:245},
  {name:'디 올뉴코나', pricePerHour:11084, kmRate:245},
  {name:'BMW X1', pricePerHour:16250, kmRate:285},
  {name:'BMW 520i M Sport', pricePerHour:22000, kmRate:285},
  {name:'벤츠 E200', pricePerHour:22042, kmRate:285},
  {name:'미니 컨버터블', pricePerHour:16959, kmRate:285},
  {name:'BMW 뉴 X3', pricePerHour:20167, kmRate:285},
  {name:'포르쉐 911 카레라 쿠페', pricePerHour:28778, kmRate:680},
  {name:'스타리아 11인승', pricePerHour:11792, kmRate:320},
  {name:'스타리아 캠퍼 4', pricePerHour:21625, kmRate:375},
  {name:'캐스퍼', pricePerHour:9125, kmRate:240},
  {name:'더뉴그랜저', pricePerHour:12750, kmRate:310},
  {name:'K8', pricePerHour:13167, kmRate:310},
  {name:'디 올뉴그랜저', pricePerHour:13667, kmRate:310},
  {name:'더 뉴 G80', pricePerHour:18959, kmRate:310},
  {name:'더 뉴 K8 하이브리드', pricePerHour:15000, kmRate:265},
  {name:'디 올 뉴 그랜저 하이브리드', pricePerHour:15625, kmRate:265},
  {name:'팰리세이드', pricePerHour:14292, kmRate:300},
  {name:'GV80', pricePerHour:19625, kmRate:310},
  {name:'올뉴아반떼', pricePerHour:9167, kmRate:245},
  {name:'더뉴K3', pricePerHour:9750, kmRate:245},
  {name:'더 뉴 아반떼', pricePerHour:8792, kmRate:245},
  {name:'더뉴아반떼N', pricePerHour:13209, kmRate:350},
  {name:'디 올뉴투싼', pricePerHour:11292, kmRate:275},
  {name:'디 올뉴스포티지', pricePerHour:11334, kmRate:275},
  {name:'쏘나타 센슈어스', pricePerHour:10625, kmRate:275},
  {name:'K5', pricePerHour:11084, kmRate:275},
  {name:'쏘나타 디 엣지', pricePerHour:11834, kmRate:275},
  {name:'더 뉴 K5', pricePerHour:11584, kmRate:275},
  {name:'디 올 뉴 싼타페', pricePerHour:13084, kmRate:300},
  {name:'QM6', pricePerHour:12209, kmRate:300},
  {name:'토레스', pricePerHour:11625, kmRate:300},
  {name:'GV70', pricePerHour:17375, kmRate:300},
  {name:'더 뉴 쏘렌토', pricePerHour:13417, kmRate:300},
  {name:'카니발 11인승', pricePerHour:12292, kmRate:320},
  {name:'더 뉴 카니발', pricePerHour:13792, kmRate:320},
  {name:'니로 EV', pricePerHour:16250, kmRate:0, fuel:'전기'},
  {name:'니로 플러스', pricePerHour:16250, kmRate:0, fuel:'전기'},
  {name:'아이오닉 6 롱레인지', pricePerHour:18667, kmRate:0, fuel:'전기'},
  {name:'폴스타 2 롱레인지', pricePerHour:17917, kmRate:0, fuel:'전기'},
  {name:'EV6 롱레인지', pricePerHour:18375, kmRate:0, fuel:'전기'},
  {name:'디 올 뉴 코나 EV 롱레인지', pricePerHour:16375, kmRate:0, fuel:'전기'},
  {name:'EV9 롱레인지', pricePerHour:22375, kmRate:0, fuel:'전기'},
  {name:'레이 EV', pricePerHour:11625, kmRate:0, fuel:'전기'},
  {name:'EV3 롱레인지', pricePerHour:15625, kmRate:0, fuel:'전기'},
  {name:'EV4 롱레인지', pricePerHour:16084, kmRate:0, fuel:'전기'},
  {name:'아이오닉 9', pricePerHour:21584, kmRate:0, fuel:'전기'},
];

function getCarPriceByName(name){
  if(!name) return null;
  var n=name.trim().toLowerCase();
  for(var i=0;i<CAR_PRICE_TABLE.length;i++){
    if(CAR_PRICE_TABLE[i].name.toLowerCase()===n) return CAR_PRICE_TABLE[i];
  }
  /* 부분 일치 */
  for(var j=0;j<CAR_PRICE_TABLE.length;j++){
    if(n.indexOf(CAR_PRICE_TABLE[j].name.toLowerCase())>=0 ||
       CAR_PRICE_TABLE[j].name.toLowerCase().indexOf(n)>=0){
      return CAR_PRICE_TABLE[j];
    }
  }
  return null;
}
window.getCarPriceByName=getCarPriceByName;
/* ─────────────────────────────────────────────
   차량 위치 (지역 지정 또는 자동 5:5 분배)
───────────────────────────────────────────── */
var INCHEON_AREAS = {
  '구월동': {lat:37.4490, lng:126.7080, spread:0.003},
  '송도':   {lat:37.3820, lng:126.6560, spread:0.004},
  '부평':   {lat:37.4893, lng:126.7235, spread:0.003},
  '동인천': {lat:37.4762, lng:126.6188, spread:0.003}
};

/* ─────────────────────────────────────────────
   거점(스테이션/와드) — 지도에 핀 표시
   · 해당 거점의 예약가능 차량이 1대 이상 → 원래 색(골드)
   · 전부 예약완료/사용불가 → 회색
───────────────────────────────────────────── */
var CARO_STATIONS = [
  {id:'st_dongincheon', name:'동인천 거점', place:'동화마을 제2공영주차장', area:'동인천', addr:'인천 제물포구 제물량로 307', lat:37.4762, lng:126.6188},
  {id:'st_bupyeong',    name:'부평 거점',    place:'부평역사쇼핑몰',        area:'부평',   addr:'인천 부평구 광장로 16',    lat:37.4893, lng:126.7235}
];
window.CARO_STATIONS=CARO_STATIONS;

function getRandomIncheonLocation(region){
  var area;
  if(region && region!=='auto' && INCHEON_AREAS[region]){
    /* 명시적 지역 지정 */
    area = INCHEON_AREAS[region];
  } else {
    /* 자동 분배 — 차량 수 기준 번갈아 */
    var currentCount = CARS_DATA.length + BL_CARS.length;
    var keys = ['구월동', '송도'];
    area = INCHEON_AREAS[keys[currentCount % 2]];
  }
  return {
    lat: area.lat + (Math.random()-0.5)*area.spread*2,
    lng: area.lng + (Math.random()-0.5)*area.spread*2,
    region: region&&region!=='auto'?region:(area===INCHEON_AREAS['구월동']?'구월동':'송도')
  };
}
/* ─────────────────────────────────────────────
   차량이 현재 지도 화면 안에 있는지 판별
───────────────────────────────────────────── */
function isCarInMapBounds(car){
  if(!caroMap || !caroMapReady) return true;
  try{
    return caroMap.getBounds().contains([car.lat, car.lng]);
  }catch(e){ return true; }
}
window.isCarInMapBounds=isCarInMapBounds;
var CARS_DATA = [];

/* ─────────────────────────────────────────────
   3. 카로 더 블랙 차량 데이터 (GV80 전기 제거, 연료를 옵션에 포함)
───────────────────────────────────────────── */
var BL_CARS = [];
/* ─────────────────────────────────────────────
   차량 데이터 영구 저장 (DEV CONSOLE 등록 차량 유지)
───────────────────────────────────────────── */
var CARS_STORAGE_KEY='caro_cars_data_v1';
var BL_STORAGE_KEY='caro_bl_cars_v1';

function saveCarsData(){
  try{
    localStorage.setItem(CARS_STORAGE_KEY, JSON.stringify(CARS_DATA));
    localStorage.setItem(BL_STORAGE_KEY, JSON.stringify(BL_CARS));
  }catch(e){
    if(e.name==='QuotaExceededError') showToast('⚠️ 저장 공간 부족 — 사진 용량을 줄여주세요');
  }
}

function loadCarsData(){
  try{
    var raw=localStorage.getItem(CARS_STORAGE_KEY);
    if(raw){var p=JSON.parse(raw); if(Array.isArray(p)) CARS_DATA=p;}
    var rawBL=localStorage.getItem(BL_STORAGE_KEY);
    if(rawBL){var pBL=JSON.parse(rawBL); if(Array.isArray(pBL)) BL_CARS=pBL;}
  }catch(e){}
}
window.saveCarsData=saveCarsData;
window.loadCarsData=loadCarsData;
/* ─────────────────────────────────────────────
   4. 면책 상품 (자동차손해배상보장법·보험업법 기준)
   자부담: 5만/30만/50만/70만원
───────────────────────────────────────────── */
var INSURANCE = [
  {id:'premium', badge:'BEST',
   name:'완전면책 (자부담 5만원)', nameen:'Full Coverage (₩50k)', nameja:'完全免責(5万W)', namezh:'完全免赔(5万W)',
   desc:'대인무한·대물 2억·자차손해 완전보상. 자기부담금 5만원. 긴급출동·대체차량 포함. 실제 렌터카 보험요율 적용 (국토교통부 고시 기준)',
   descen:'Unlimited liability, ₩200M property, full vehicle damage. ₩50,000 deductible. Roadside + replacement vehicle.',
   descja:'対人無制限・対物2億・車両損害完全補償。自己負担金5万W。緊急出動・代車含む。',
   desczh:'无限人身险·2亿物险·车损全赔。自付额5万韩元。含道路救援及替代车辆。',
   pricePerHour:4500},
  {id:'standard', badge:'',
   name:'일반면책 (자부담 30만원)', nameen:'Standard (₩300k)', nameja:'スタンダード(30万W)', namezh:'标准(30万W)',
   desc:'대인무한·대물 1억·자차손해 포함. 자기부담금 30만원. 렌터카 의무보험+자차 특약 기준.',
   descen:'Unlimited liability, ₩100M property, vehicle damage. ₩300,000 deductible.',
   descja:'対人無制限・対物1億・車両損害。自己負担金30万W。',
   desczh:'无限人身险·1亿物险·车损险。自付额30万韩元。',
   pricePerHour:2800},
  {id:'basic', badge:'',
   name:'기본 (자부담 70만원)', nameen:'Basic (₩700k)', nameja:'ベーシック(70万W)', namezh:'基本(70万W)',
   desc:'대인무한·대물 2천만원 기본 책임보험. 자차손해 미포함. 자기부담금 70만원. 자동차손해배상보장법 최저 의무보험 기준.',
   descen:'Basic liability only (unlimited person, ₩20M property). ₩700,000 deductible. No vehicle damage.',
   descja:'基本責任保険のみ。対人無制限・対物2千万W。自己負担金70万W。',
   desczh:'仅基本责任险。无限人身·2000万物险。自付额70万韩元。',
   pricePerHour:1200},
];

/* ─────────────────────────────────────────────
   5. 다국어
───────────────────────────────────────────── */
var LANGS = {
  ko:{
    tagline:'스마트한 이동의 시작',
    btn_login:'로그인', btn_find:'아이디 / 비밀번호 찾기', btn_find_short:'아이디/비밀번호 찾기',
    btn_signup:'회원가입', back:'뒤로', logout:'로그아웃',
    label_id:'아이디', label_pw:'비밀번호', label_pw2:'비밀번호 확인',
    save_id:'아이디 저장', auto_login:'자동 로그인',
    or:'또는', kakao_login:'카카오 로그인', naver_login:'네이버 로그인',
    welcome_msg:'지금 바로 CARO를 경험하세요 🚗',
    welcome_sub:'오늘도 CARO와 함께 스마트하게 이동하세요',
    map_title:'📍 주변 차량 현황', car_list_title:'🚘 차량 선택',
    available:'이용 가능', in_use:'이용 중',
    reserve_title:'차량 예약', pick_date:'이용 날짜 및 시간',
    start_dt:'대여 시작', end_dt:'반납 예정',
    discount_title:'할인 · 포인트', coupon_label:'할인 쿠폰 코드',
    point_label:'포인트 사용', use_all_point:'전액 사용', apply:'적용',
    insurance_title:'면책 상품 선택', go_payment:'결제하기',
    payment_title:'결제', pay_method:'결제 수단',
    card:'신용 / 체크카드', card_num:'카드 번호', card_exp:'유효기간',
    pay_confirm:'결제 확인 및 예약 완료',
    done_title:'예약이 완료되었습니다!', back_main:'홈으로 돌아가기',
    find_id:'아이디 찾기', find_pw:'비밀번호 찾기',
    find_id_desc:'가입 시 등록한 이름과 휴대폰 번호로 아이디를 확인할 수 있습니다.',
    find_pw_desc:'아이디와 가입 정보로 비밀번호를 재설정할 수 있습니다.',
    name:'이름', phone:'휴대폰 번호', code:'인증번호', birth:'생년월일',
    send_code:'인증번호 발송', reset_pw:'비밀번호 재설정 메일 발송',
    terms_title:'서비스 이용약관 동의', agree_all:'전체 동의',
    agree_all_desc:'선택 항목에 동의하지 않아도 서비스를 이용하실 수 있습니다.',
    term1:'[필수] CARO 모빌리티 서비스 이용약관', term2:'[필수] 개인정보 수집 및 이용 동의',
    term3:'[필수] 위치정보 서비스 이용약관', term4:'[선택] 마케팅 정보 수신 동의',
    term5:'[선택] 제3자 정보제공 동의',
    view:'보기', next:'다음', confirm:'확인',
    verify_title:'본인 인증', verify_done:'인증 완료',
    info_title:'회원 정보 입력', dup_check:'중복 확인', email:'이메일',
    license:'운전면허 번호', license_hint:'차량 이용 시 필요합니다. 나중에 입력 가능합니다.',
    signup_done:'가입 완료', signup_complete:'가입이 완료되었습니다',
    signup_complete_desc:'CARO 모빌리티 회원이 되신 것을 환영합니다.', go_login:'로그인 하러 가기',
    step1:'약관동의', step2:'본인인증', step3:'정보입력', step4:'완료',
    menu_reserve:'차량 예약', menu_my_reserve:'예약 확인',
    menu_black:'CARO THE BLACK', menu_mypage:'마이페이지',
    event_banner_title:'🎉 진행 중인 이벤트', notice_title:'📢 공지사항',
    no_reservation:'예약 내역이 없습니다',
    res_detail_title:'예약 상세 내역',
    bl_desc:'CARO 카로 더 블랙 · 프리미엄 전기차 대여 서비스\n서울 · 인천 지역 한정 운영',
    menu_event:'이벤트', ev_sub:'CARO의 특별한 혜택을 확인하세요',
    ev1_title:'신규 가입 첫 대여 30% 할인', ev1_desc:'가입 후 7일 이내 첫 대여 시 자동 적용',
    ev2_title:'CARO 카로 더 블랙 출시', ev2_desc:'프리미엄 차량 · 전담 컨시어지 서비스',
    ev3_title:'친구 추천 5,000P 적립', ev3_desc:'추천인·피추천인 모두 포인트 지급',
    ev4_title:'주말 특별 할인 최대 30%', ev4_desc:'전기차 한정 · 해당 차량에만 적용',
    always:'상시', weekend_period:'매주 토~일',
    notice1:'2026년 하절기 차량 점검 일정 안내',
    notice2:'CARO 앱 v2.0 업데이트 안내',
    notice3:'개인정보처리방침 개정 안내',
    mp_account:'계정 정보', mp_payment:'결제 수단', mp_point:'포인트 / 쿠폰',
    mp_my_point:'보유 포인트', mp_change_pw:'비밀번호 변경',
    mp_add_card:'카드 등록', mp_no_card:'등록된 카드가 없습니다.',
  },
  en:{
    tagline:'Smart mobility starts here',
    btn_login:'Login', btn_find:'Find ID / Password', btn_find_short:'Find ID/Password',
    btn_signup:'Sign Up', back:'Back', logout:'Logout',
    label_id:'ID', label_pw:'Password', label_pw2:'Confirm Password',
    save_id:'Save ID', auto_login:'Auto Login',
    or:'or', kakao_login:'Kakao Login', naver_login:'Naver Login',
    welcome_msg:'Experience CARO right now 🚗',
    welcome_sub:'Start your smart journey with CARO today',
    map_title:'📍 Nearby Vehicles', car_list_title:'🚘 Select Vehicle',
    available:'Available', in_use:'In Use',
    reserve_title:'Vehicle Reservation', pick_date:'Date & Time',
    start_dt:'Pickup', end_dt:'Return',
    discount_title:'Discount · Points', coupon_label:'Coupon Code',
    point_label:'Use Points', use_all_point:'Use All', apply:'Apply',
    insurance_title:'Select Coverage', go_payment:'Proceed to Payment',
    payment_title:'Payment', pay_method:'Payment Method',
    card:'Credit / Debit Card', card_num:'Card Number', card_exp:'Expiry',
    pay_confirm:'Confirm & Complete Reservation',
    done_title:'Reservation Complete!', back_main:'Back to Home',
    find_id:'Find ID', find_pw:'Find Password',
    find_id_desc:'Find your ID using your registered name and phone number.',
    find_pw_desc:'Reset your password using your ID and registered info.',
    name:'Name', phone:'Phone', code:'Code', birth:'Date of Birth',
    send_code:'Send Code', reset_pw:'Send Reset Email',
    terms_title:'Terms Agreement', agree_all:'Agree to All',
    agree_all_desc:'You can still use the service without agreeing to optional items.',
    term1:'[Required] CARO Service Terms', term2:'[Required] Privacy Policy',
    term3:'[Required] Location Service Terms', term4:'[Optional] Marketing Consent',
    term5:'[Optional] Third-party Information Consent',
    view:'View', next:'Next', confirm:'Confirm',
    verify_title:'Identity Verification', verify_done:'Verify Complete',
    info_title:'Enter Member Info', dup_check:'Check', email:'Email',
    license:'Driver\'s License', license_hint:'Required to use vehicles. Can be added later.',
    signup_done:'Complete', signup_complete:'Registration Complete',
    signup_complete_desc:'Welcome to CARO Mobility!', go_login:'Go to Login',
    step1:'Terms', step2:'Verify', step3:'Info', step4:'Done',
    menu_reserve:'Reserve', menu_my_reserve:'My Bookings',
    menu_black:'CARO THE BLACK', menu_mypage:'My Page',
    event_banner_title:'🎉 Current Events', notice_title:'📢 Notice',
    no_reservation:'No reservations yet',
    res_detail_title:'Booking Details',
    bl_desc:'CARO THE BLACK · Premium EV Rental\nSeoul · Incheon area only',
    menu_event:'Events', ev_sub:'Discover CARO\'s special offers',
    ev1_title:'30% off first ride for new members', ev1_desc:'Auto-applied within 7 days of signup',
    ev2_title:'CARO THE BLACK Launch', ev2_desc:'Premium vehicles · Dedicated concierge',
    ev3_title:'Refer a friend – earn 5,000P', ev3_desc:'Both referrer and referee earn points',
    ev4_title:'Weekend special up to 30% off', ev4_desc:'EV only · Applied to eligible vehicles',
    always:'Always', weekend_period:'Every Sat–Sun',
    notice1:'Summer 2026 vehicle maintenance schedule',
    notice2:'CARO App v2.0 update announcement',
    notice3:'Privacy policy revision notice',
    mp_account:'Account', mp_payment:'Payment', mp_point:'Points / Coupons',
    mp_my_point:'My Points', mp_change_pw:'Change Password',
    mp_add_card:'Add Card', mp_no_card:'No cards registered.',
  },
  ja:{
    tagline:'スマートモビリティの始まり',
    btn_login:'ログイン', btn_find:'ID / パスワード検索', btn_find_short:'ID/PW検索',
    btn_signup:'会員登録', back:'戻る', logout:'ログアウト',
    label_id:'ID', label_pw:'パスワード', label_pw2:'パスワード確認',
    save_id:'IDを保存', auto_login:'自動ログイン',
    or:'または', kakao_login:'Kakaoログイン', naver_login:'Naverログイン',
    welcome_msg:'今すぐCAROを体験しよう 🚗',
    welcome_sub:'今日もCAROと一緒にスマートに移動しよう',
    map_title:'📍 周辺車両', car_list_title:'🚘 車両選択',
    available:'利用可能', in_use:'使用中',
    reserve_title:'車両予約', pick_date:'日時選択',
    start_dt:'出発', end_dt:'返却',
    discount_title:'割引・ポイント', coupon_label:'クーポンコード',
    point_label:'ポイント使用', use_all_point:'全額使用', apply:'適用',
    insurance_title:'免責プラン選択', go_payment:'決済する',
    payment_title:'決済', pay_method:'決済方法',
    card:'クレジット/デビットカード', card_num:'カード番号', card_exp:'有効期限',
    pay_confirm:'決済確認・予約完了',
    done_title:'予約が完了しました！', back_main:'ホームへ',
    find_id:'ID検索', find_pw:'パスワード検索',
    find_id_desc:'登録した名前と電話番号でIDを確認できます。',
    find_pw_desc:'IDと登録情報でパスワードを再設定できます。',
    name:'名前', phone:'電話番号', code:'認証番号', birth:'生年月日',
    send_code:'認証番号送信', reset_pw:'再設定メールを送信',
    terms_title:'利用規約同意', agree_all:'全て同意',
    agree_all_desc:'任意項目に同意しなくてもサービスを利用できます。',
    term1:'[必須] CАROサービス利用規約', term2:'[必須] 個人情報収集・利用同意',
    term3:'[必須] 位置情報サービス規約', term4:'[任意] マーケティング情報受信同意',
    term5:'[任意] 第三者情報提供同意',
    view:'見る', next:'次へ', confirm:'確認',
    verify_title:'本人認証', verify_done:'認証完了',
    info_title:'会員情報入力', dup_check:'重複確認', email:'メール',
    license:'運転免許番号', license_hint:'車両利用時に必要です。後で入力可能です。',
    signup_done:'登録完了', signup_complete:'登録が完了しました',
    signup_complete_desc:'CAROモビリティへようこそ！', go_login:'ログインへ',
    step1:'規約', step2:'認証', step3:'情報', step4:'完了',
    menu_reserve:'車両予約', menu_my_reserve:'予約確認',
    menu_black:'CARO THE BLACK', menu_mypage:'マイページ',
    event_banner_title:'🎉 進行中イベント', notice_title:'📢 お知らせ',
    no_reservation:'予約内訳がありません',
    res_detail_title:'予約詳細',
    bl_desc:'CARO ブラックラベル · プレミアムEVレンタル\nソウル・仁川限定',
    menu_event:'イベント', ev_sub:'CAROの特別特典をご確認ください',
    ev1_title:'新規登録者初回30%割引', ev1_desc:'登録後7日以内の初回利用に自動適用',
    ev2_title:'CAROブラックラベル開始', ev2_desc:'プレミアム車両・専任コンシェルジュ',
    ev3_title:'友達紹介で5,000P積立', ev3_desc:'紹介者・被紹介者両方にポイント付与',
    ev4_title:'週末特別割引最大30%', ev4_desc:'電気自動車限定・対象車両のみ適用',
    always:'常時', weekend_period:'毎週土〜日',
    notice1:'2026年夏季車両点検スケジュール案内',
    notice2:'CAROアプリ v2.0アップデート案内',
    notice3:'個人情報処理方針改訂案内',
    mp_account:'アカウント情報', mp_payment:'決済手段', mp_point:'ポイント/クーポン',
    mp_my_point:'保有ポイント', mp_change_pw:'パスワード変更',
    mp_add_card:'カード登録', mp_no_card:'登録されたカードがありません。',
  },
  zh:{
    tagline:'智能出行，从这里开始',
    btn_login:'登录', btn_find:'找回账号/密码', btn_find_short:'找回账号/密码',
    btn_signup:'注册', back:'返回', logout:'退出',
    label_id:'账号', label_pw:'密码', label_pw2:'确认密码',
    save_id:'保存账号', auto_login:'自动登录',
    or:'或者', kakao_login:'Kakao登录', naver_login:'Naver登录',
    welcome_msg:'立即体验CARO 🚗',
    welcome_sub:'今天也与CARO一起智能出行',
    map_title:'📍 附近车辆', car_list_title:'🚘 选择车辆',
    available:'可用', in_use:'使用中',
    reserve_title:'预约车辆', pick_date:'选择日期和时间',
    start_dt:'取车时间', end_dt:'还车时间',
    discount_title:'优惠券·积分', coupon_label:'优惠券码',
    point_label:'使用积分', use_all_point:'全部使用', apply:'应用',
    insurance_title:'选择免责方案', go_payment:'前往付款',
    payment_title:'付款', pay_method:'付款方式',
    card:'信用/借记卡', card_num:'卡号', card_exp:'有效期',
    pay_confirm:'确认付款并完成预约',
    done_title:'预约成功！', back_main:'返回首页',
    find_id:'找回账号', find_pw:'找回密码',
    find_id_desc:'通过注册时填写的姓名和手机号找回账号。',
    find_pw_desc:'通过账号和注册信息重置密码。',
    name:'姓名', phone:'手机号', code:'验证码', birth:'出生日期',
    send_code:'发送验证码', reset_pw:'发送重置邮件',
    terms_title:'服务条款同意', agree_all:'全部同意',
    agree_all_desc:'不同意可选项也可以使用服务。',
    term1:'[必须] CARO出行服务条款', term2:'[必须] 个人信息收集及使用同意',
    term3:'[必须] 位置信息服务条款', term4:'[可选] 营销信息接收同意',
    term5:'[可选] 第三方信息提供同意',
    view:'查看', next:'下一步', confirm:'确认',
    verify_title:'本人验证', verify_done:'验证完成',
    info_title:'填写会员信息', dup_check:'重复确认', email:'电子邮件',
    license:'驾驶证号码', license_hint:'使用车辆时需要。也可以稍后输入。',
    signup_done:'注册完成', signup_complete:'注册完成',
    signup_complete_desc:'欢迎加入CARO出行！', go_login:'前往登录',
    step1:'条款', step2:'验证', step3:'信息', step4:'完成',
    menu_reserve:'预约车辆', menu_my_reserve:'预约确认',
    menu_black:'CARO THE BLACK', menu_mypage:'我的页面',
    event_banner_title:'🎉 进行中的活动', notice_title:'📢 公告',
    no_reservation:'暂无预约记录',
    res_detail_title:'预约详情',
    bl_desc:'CARO黑标 · 高级电动车租赁服务\n仅限首尔·仁川地区',
    menu_event:'活动', ev_sub:'查看CARO的特别优惠',
    ev1_title:'新用户首次租车享7折', ev1_desc:'注册7日内首次租车自动适用',
    ev2_title:'CARO黑标上线', ev2_desc:'高级车辆 · 专属礼宾服务',
    ev3_title:'推荐好友赚5,000积分', ev3_desc:'推荐人和被推荐人均可获得积分',
    ev4_title:'周末最高7折特惠', ev4_desc:'仅限电动车 · 适用于指定车辆',
    always:'长期', weekend_period:'每周六~日',
    notice1:'2026年夏季车辆维护时间表',
    notice2:'CARO应用v2.0更新公告',
    notice3:'个人信息处理方针修订公告',
    mp_account:'账户信息', mp_payment:'付款方式', mp_point:'积分/优惠券',
    mp_my_point:'我的积分', mp_change_pw:'修改密码',
    mp_add_card:'注册卡片', mp_no_card:'暂无注册卡片。',
  }
};

var currentLang = 'ko';
function t(k){ return (LANGS[currentLang]||LANGS.ko)[k]||k; }
function applyLang(){
  document.querySelectorAll('[data-i18n]').forEach(function(el){
    var v = t(el.getAttribute('data-i18n'));
    if(v) el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(function(el){
    var v = t(el.getAttribute('data-i18n-ph'));
    if(v) el.placeholder = v;
  });
  renderCars(); renderInsurance();
}

/* ─────────────────────────────────────────────
   6. 상태 변수
───────────────────────────────────────────── */
var currentStep=1, caroMap=null, selectedCar=null;
var selectedIns=INSURANCE[0], couponDiscount=0, pointDiscount=0;
var myReservations=[], savedCards=[], cancelledHistory=[];
var slideIdx=0, slideTimer=null;
var userInfo={id:'',email:'',license:'',name:''};
var timerHandles={};

/* ─────────────────────────────────────────────
   7. 초기화
───────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function(){
  loadCarsData(); /* ← 등록 차량 복원 */

  /* 아이디 저장 복원 */
  try{
    var sid=localStorage.getItem('caro_saved_id');
    if(sid){
      var idEl=document.getElementById('login-id');
      var chk=document.getElementById('save-id');
      if(idEl) idEl.value=sid;
      if(chk) chk.checked=true;
    }
  }catch(e){}

  /* ── 안드로이드/PWA standalone 감지 (단일 처리) ── */
  function checkStandalone(){
    if(window.matchMedia('(display-mode: standalone)').matches ||
       window.navigator.standalone === true){
      document.documentElement.classList.add('android-standalone');
    }
  }
  checkStandalone();
  /* 설치 직후 display-mode 변화 감지 */
  try{
    window.matchMedia('(display-mode: standalone)').addEventListener('change', function(e){
      if(e.matches) document.documentElement.classList.add('android-standalone');
    });
  }catch(e){}

  /* PWA 바로가기 파라미터 처리 */
  var urlParams = new URLSearchParams(window.location.search);
  var shortcut  = urlParams.get('shortcut');

  setTimeout(function(){
           window.__caroBootTimerDone=true;   /* ★ [v101] 부팅 타이머 완료 표시 (세션 만료 처리가 이 뒤에 오도록) */
           /* done-screen이 활성화 중이거나 이미 홈 진입했으면 스킵 */
           if(window._caroLoggedIn) return;
           var doneEl=document.getElementById('done-screen');
           if(doneEl&&doneEl.classList.contains('active')) return;
           if(userInfo.id) return;
         try{
           var al=localStorage.getItem('caro_auto_login');
        var aid=localStorage.getItem('caro_auto_id');
        var aname=localStorage.getItem('caro_auto_name')||aid;
        if(al==='1'&&aid){
          userInfo.id=aid; userInfo.name=aname;
          window._caroLoggedIn = true;      /* 하단바·홈 UI 활성화 */
          try{ loadUserData(aid); }catch(e){}  /* 예약·카드 데이터 복원 */
          var wn=document.getElementById('home-welcome-name');
          if(wn) wn.textContent=aname+' 님, 안녕하세요 👋';
          var hn=document.getElementById('hmenu-name');
          var hi=document.getElementById('hmenu-id');
          if(hn) hn.textContent=aname;
          if(hi) hi.textContent=aid;
          startSessionTimer();
          if(shortcut==='reserve') goTo('rental-screen',true);
          else if(shortcut==='myreserve') goTo('my-reservation-screen',true);
          else goTo('home-screen',true);
          setTimeout(showHomeCtrlSwitch,100);
          return;
        }
        var sid=localStorage.getItem('caro_saved_id');
        var spw=null; try{ localStorage.removeItem('caro_saved_pw'); localStorage.removeItem('caro_auto_pw'); }catch(e){}   /* ★ FIX(H2): 과거 저장분 정리 */
        if(sid){
          var idEl=document.getElementById('login-id');
          var pwEl=document.getElementById('login-pw');
          var schk=document.getElementById('save-id');
          if(idEl) idEl.value=sid;
          if(pwEl&&spw) pwEl.value=spw;
          if(schk) schk.checked=true;
        }
      }catch(e){}
      var _cur=document.querySelector('.screen.active');
      if(!_cur||_cur.id!=='main-screen') goTo('main-screen');   /* ★ [v101] 이미 main 이면 같은 화면 재전환(활성 화면 사라짐) 방지 */
      if(shortcut) window._pendingShortcut = shortcut;
    }, 4500);

  /* 토스페이먼츠 결제 성공 처리 */
  var urlParams2=new URLSearchParams(window.location.search);
  if(urlParams2.get('payment')==='success'){
      try{
              var aid=localStorage.getItem('caro_auto_id')||localStorage.getItem('caro_pay_uid')||'';
              var aname=localStorage.getItem('caro_auto_name')||aid;
              if(aid){
                userInfo.id=aid; userInfo.name=aname;
                startSessionTimer(); loadUserData(aid);
          var wn=document.getElementById('home-welcome-name');
          if(wn) wn.textContent=aname+' 님, 안녕하세요 👋';
          var hn=document.getElementById('hmenu-name');
          var hi=document.getElementById('hmenu-id');
          if(hn) hn.textContent=aname;
          if(hi) hi.textContent=aid;
        }
      }catch(e){}
      try{
            var savedPD=localStorage.getItem('caro_pay_data');
            if(savedPD){
              window._payData=JSON.parse(savedPD);
              window._payData.start=new Date(window._payData.start);
              window._payData.end=new Date(window._payData.end);
            }
            localStorage.removeItem('caro_pay_data');
          }catch(e){}
      var bookNo2=urlParams2.get('bookNo')||('CR'+Date.now().toString().slice(-8));
            var pd2=window._payData||{};
            if(pd2.car){
                          /* loadUserData가 이미 기존 예약을 로드 — 새 예약만 추가 */
                          var _exists=myReservations.some(function(r){ return r.bookNo===bookNo2; });
                          if(!_exists){
                            myReservations.unshift({
                              bookNo:bookNo2, car:pd2.car, ins:pd2.ins||INSURANCE[0],
                              start:pd2.start, end:pd2.end, hrs:pd2.hrs, total:pd2.total,
                              returned:false, extendedMins:0
                            });
                          }
                          saveUserData();
                          try{ localStorage.removeItem('caro_pay_uid'); }catch(e){}
                        }
      window._caroLoggedIn = true;
                  /* 🔧 모든 화면 완전 초기화 */
                  var allScreens=document.querySelectorAll('.screen');
                  allScreens.forEach(function(s){
                    s.classList.remove('active','exit');
                  });
                  /* 🔧 스플래시 명시적 차단 (CSS 잔존 영향 제거) */
                  var splashEl = document.getElementById('splash-screen');
                  if(splashEl){
                    splashEl.style.display = 'none';
                    splashEl.style.opacity = '0';
                    splashEl.style.visibility = 'hidden';
                  }
                  /* done-screen 활성화 + 최상단 표시 */
                  var doneScreen=document.getElementById('done-screen');
                  if(doneScreen){
                    doneScreen.classList.add('active');
                    doneScreen.style.zIndex = '999';
                    doneScreen.style.position = 'fixed';
                    doneScreen.style.top = '0';
                    doneScreen.style.left = '0';
                    doneScreen.style.right = '0';
                    doneScreen.style.bottom = '0';
                  }
      var sw=document.getElementById('home-ctrl-switch');
      if(sw) sw.classList.remove('visible');
      return;
    }
  setupDateInputs();
  updateHomeMenuBtn('splash-screen');

  /* 슬라이드 배너 클릭 → 이벤트 화면으로 */
  var slideWrap=document.getElementById('auto-slide-wrap-home');
  if(slideWrap){
    slideWrap.addEventListener('click', function(){
      goTo('event-screen');
    });
  }
});

/* goTo 이후 홈화면 복귀 시 마름모 버튼 보이게 — handleLogin에서도 호출 */
function showHomeCtrlSwitch(){
  var sw=document.getElementById('home-ctrl-switch');
  if(sw) sw.classList.add('visible');
}

/* ── 날짜 선택 UI ── */
var DAYS=['일','월','화','수','목','금','토'];
function fmtDateDisplay(d){
  if(!d||isNaN(d.getTime())) return '날짜 선택';
  var day=DAYS[d.getDay()];
  var p=function(n){return n<10?'0'+n:n;};
  var h=d.getHours();
  var ampm=h<12?'오전':'오후';
  var h12=h%12||12;
  return (d.getMonth()+1)+'월 '+d.getDate()+'일 ('+day+') '+ampm+' '+p(h12)+':'+p(d.getMinutes());
}
function syncDateDisplay(which){
  var inputId=which==='start'?'res-start':'res-end';
  var dispId=which==='start'?'res-start-display':'res-end-display';
  var inp=document.getElementById(inputId);
  var disp=document.getElementById(dispId);
  if(!inp||!disp) return;
  var d=new Date(inp.value);
  disp.textContent=isNaN(d)?'날짜 선택':fmtDateDisplay(d);
  disp.classList.toggle('res-date-set', !isNaN(d));
}

/* ══ 원통형 드럼롤 피커 ══ */
var drumTarget='start'; /* 'start' or 'end' */
var drumState={dateIdx:0,ampmIdx:0,hourIdx:0,minIdx:0};
var drumDates=[], drumAmpm=['오전','오후'], drumHours=[], drumMins=[];

function buildDrumData(){
  drumDates=[];
  var base=new Date(); base.setHours(0,0,0,0);
  for(var i=0;i<60;i++){
    var d=new Date(base.getTime()+i*86400000);
    drumDates.push(d);
  }
  drumHours=[];
  for(var h=1;h<=12;h++) drumHours.push(h);
  drumMins=[0,10,20,30,40,50];
}

function drumLabel(d){
  var day=DAYS[d.getDay()];
  var month=d.getMonth()+1;
  var date=d.getDate();
  return month+'월 '+date+'일 ('+day+')';
}

function openDrumPicker(which){
  drumTarget=which;
  buildDrumData();
  var inp=document.getElementById(which==='start'?'res-start':'res-end');
  var now=new Date();
  /* 분을 10분 단위로 올림 */
  now.setSeconds(0,0);
  var rem=now.getMinutes()%10;
  if(rem>0) now.setMinutes(now.getMinutes()+(10-rem));

  var cur;
  if(which==='start'){
    cur=inp&&inp.value?new Date(inp.value):now;
    if(isNaN(cur)) cur=now;
  } else {
    /* 반납 = 대여시작 + 1시간 기본 */
    var startInp=document.getElementById('res-start');
    var startDate=startInp&&startInp.value?new Date(startInp.value):now;
    if(isNaN(startDate)) startDate=now;
    cur=inp&&inp.value?new Date(inp.value):new Date(startDate.getTime()+60*60*1000);
    if(isNaN(cur)) cur=new Date(startDate.getTime()+60*60*1000);
    /* 최소 1시간 보장 */
    if(cur.getTime()<startDate.getTime()+60*60*1000){
      cur=new Date(startDate.getTime()+60*60*1000);
    }
  }

  var today=new Date(); today.setHours(0,0,0,0);
  var diffDays=Math.round((new Date(cur.getFullYear(),cur.getMonth(),cur.getDate())-today)/(86400000));
  drumState.dateIdx=Math.max(0,Math.min(diffDays,59));
  drumState.ampmIdx=cur.getHours()<12?0:1;
  var h12=cur.getHours()%12||12;
  drumState.hourIdx=h12-1;
  drumState.minIdx=Math.min(5,Math.round(cur.getMinutes()/10));

  var title=document.getElementById('drum-title');
  if(title) title.textContent=which==='start'?'대여 시작':'반납 예정';

  renderDrum('date', document.getElementById('drum-date-list'), drumDates.map(drumLabel), drumState.dateIdx);
  renderDrum('ampm', document.getElementById('drum-ampm-list'), drumAmpm, drumState.ampmIdx);
  renderDrum('hour', document.getElementById('drum-hour-list'), drumHours, drumState.hourIdx);
  renderDrum('min',  document.getElementById('drum-min-list'),  drumMins,  drumState.minIdx);

  var ov=document.getElementById('drum-overlay');
  if(ov){
    ov.classList.add('open');
    var isBL=!!(selectedCar&&selectedCar.isBlackLabel);
    ov.classList.toggle('bl-drum-mode', isBL);
  }
}
window.openDrumPicker=openDrumPicker;

var ITEM_H_DRUM=44;

function renderDrum(type, list, items, selIdx){
  if(!list) return;
  var ITEM_H=ITEM_H_DRUM, PAD=3;
  list.innerHTML='';
  for(var i=0;i<PAD;i++){
    var sp=document.createElement('div'); sp.className='drum-item'; sp.innerHTML='&nbsp;';
    list.appendChild(sp);
  }
  items.forEach(function(label,idx){
    var el=document.createElement('div');
    var diff=Math.abs(idx-selIdx);
    el.className='drum-item'+(idx===selIdx?' selected':diff===1?' near':diff===2?' far2':'');
    el.textContent=label;
    list.appendChild(el);
  });
  for(var j=0;j<PAD;j++){
    var sp2=document.createElement('div'); sp2.className='drum-item'; sp2.innerHTML='&nbsp;';
    list.appendChild(sp2);
  }
  list.style.transition='none';
  var PAD_OFFSET=3*ITEM_H-66;
  list.style.transform='translateY(-'+(PAD_OFFSET+selIdx*ITEM_H)+'px)';
  attachDrumDrag(type, list, items.length, selIdx, ITEM_H);
}

function setDrumIndex(type, list, count, newIdx, ITEM_H, animated){
  ITEM_H=ITEM_H||ITEM_H_DRUM;
  if(typeof count==='object') count=count.length;
  newIdx=Math.max(0,Math.min(count-1,newIdx));
  drumState[type+'Idx']=newIdx;
  list.querySelectorAll('.drum-item').forEach(function(el,i){
    var di=i-3;
    var diff=Math.abs(di-newIdx);
    el.classList.toggle('selected', di===newIdx);
    el.classList.toggle('near', diff===1);
    el.classList.toggle('far2', diff===2);
  });
  if(animated!==false){
    list.style.transition='transform .28s cubic-bezier(.25,.46,.45,.94)';
  }
  var PAD_OFFSET2=3*ITEM_H-66;
  list.style.transform='translateY(-'+(PAD_OFFSET2+newIdx*ITEM_H)+'px)';
}

function attachDrumDrag(type, list, count, initIdx, ITEM_H){
  ITEM_H=ITEM_H||ITEM_H_DRUM;
  var wrap=list.parentElement;
  var startY=0, startIdx=initIdx, dragging=false;
  var lastY=0, velY=0, lastT=0;

  function getIdx(){ return drumState[type+'Idx']; }

  function onStart(y){
    dragging=true; startY=y; startIdx=getIdx();
    lastY=y; velY=0; lastT=Date.now();
    list.style.transition='none';
  }
  function onMove(y){
    if(!dragging) return;
    var now=Date.now(); var dt=Math.max(now-lastT,1);
    velY=(lastY-y)/dt;
    lastY=y; lastT=now;
    var dy=startY-y;
    var rawOffset=startIdx*ITEM_H+dy;
    list.style.transform='translateY(-'+(3*ITEM_H-66+rawOffset)+'px)';
    var clamped=Math.max(0,Math.min(count-1,Math.round(rawOffset/ITEM_H)));
    list.querySelectorAll('.drum-item').forEach(function(el,i){
      var di=i-3; var diff=Math.abs(di-clamped);
      el.classList.toggle('selected', di===clamped);
      el.classList.toggle('near', diff===1);
      el.classList.toggle('far2', diff===2);
    });
  }
  function onEnd(){
    if(!dragging) return;
    dragging=false;
    var dy=startY-lastY;
    var momentum=velY*180;
    var currentOffset=startIdx*ITEM_H+dy;
    var targetOffset=currentOffset+momentum;
    var finalIdx=Math.max(0,Math.min(count-1,Math.round(targetOffset/ITEM_H)));
    setDrumIndex(type, list, count, finalIdx, ITEM_H, true);
  }

  wrap.addEventListener('touchstart',function(e){ onStart(e.touches[0].clientY); },{passive:true});
  wrap.addEventListener('touchmove',function(e){ onMove(e.touches[0].clientY); e.preventDefault(); },{passive:false});
  wrap.addEventListener('touchend',function(){ onEnd(); });
  wrap.addEventListener('touchcancel',function(){ onEnd(); });
  wrap.addEventListener('mousedown',function(e){ onStart(e.clientY); e.preventDefault(); });
  document.addEventListener('mousemove',function(e){ if(dragging) onMove(e.clientY); });
  document.addEventListener('mouseup',function(){ if(dragging) onEnd(); });
  list.querySelectorAll('.drum-item').forEach(function(el,i){
    el.addEventListener('click',function(){
      var di=i-3;
      if(di>=0&&di<count) setDrumIndex(type,list,count,di,ITEM_H,true);
    });
  });
}

function confirmDrumPicker(){
  var d=drumDates[drumState.dateIdx];
  if(!d){ closeDrumPicker(); return; }
  var ampm=drumState.ampmIdx;
  var h12=drumHours[drumState.hourIdx];
  var min=drumMins[drumState.minIdx];
  var hour24=h12%12+(ampm?12:0);
  var chosen=new Date(d.getFullYear(),d.getMonth(),d.getDate(),hour24,min,0);
  var pad=function(n){return n<10?'0'+n:n;};
  var fmt=chosen.getFullYear()+'-'+pad(chosen.getMonth()+1)+'-'+pad(chosen.getDate())+'T'+pad(hour24)+':'+pad(min);

  /* 반납 시간이 대여 시작보다 1시간 이상 이후인지 확인 */
  if(drumTarget==='end'){
    var startInp=document.getElementById('res-start');
    if(startInp&&startInp.value){
      var startDate=new Date(startInp.value);
      if(chosen.getTime()<startDate.getTime()+60*60*1000){
        showToast('반납 시간은 대여 시작 후 최소 1시간 이후여야 해요!');
        return;
      }
    }
  }

  /* 대여 시작 변경 시 반납 시간 자동 업데이트 */
  if(drumTarget==='start'){
    var endInp=document.getElementById('res-end');
    if(endInp){
      var newEnd=new Date(chosen.getTime()+60*60*1000);
      var pad2=function(n){return n<10?'0'+n:n;};
      endInp.value=newEnd.getFullYear()+'-'+pad2(newEnd.getMonth()+1)+'-'+pad2(newEnd.getDate())+'T'+pad2(newEnd.getHours())+':'+pad2(newEnd.getMinutes());
      endInp.dispatchEvent(new Event('change'));
    }
  }

  var inputId=drumTarget==='start'?'res-start':'res-end';
  var inp=document.getElementById(inputId);
  if(inp){
    inp.value=fmt;
    inp.dispatchEvent(new Event('change'));
  }
  updateDuration();
  syncDateDisplay(drumTarget);
  closeDrumPicker();
}
window.confirmDrumPicker=confirmDrumPicker;

function closeDrumPicker(){
  var ov=document.getElementById('drum-overlay');
  if(ov) ov.classList.remove('open');
}
window.closeDrumPicker=closeDrumPicker;

/* drum-sheet 클릭 시 overlay 닫힘 방지 */
document.addEventListener('DOMContentLoaded',function(){
  var sheet=document.getElementById('drum-sheet');
  if(sheet) sheet.addEventListener('click',function(e){ e.stopPropagation(); });
});

/* setupDateInputs 개선 — 화면 표시 동기화 */
function setupDateInputs(){
  var now=new Date();
  /* 분을 10분 단위로 올림 */
  now.setSeconds(0,0);
  var rem=now.getMinutes()%10;
  if(rem>0) now.setMinutes(now.getMinutes()+(10-rem));

  var later=new Date(now.getTime()+3600000); /* 1시간 후 */
  var pad=function(n){return n<10?'0'+n:n;};
  var fmt=function(d){return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate())+'T'+pad(d.getHours())+':'+pad(d.getMinutes());};

  var s=document.getElementById('res-start');
  var e=document.getElementById('res-end');
  if(s) s.value=fmt(now);
  if(e) e.value=fmt(later);
  syncDateDisplay('start');
  syncDateDisplay('end');
  updateDuration();
}

/* ─────────────────────────────────────────────
   8. 화면 전환
───────────────────────────────────────────── */
function goTo(screenId, immediate){
  var allActive=document.querySelectorAll('.screen.active');
  var next=document.getElementById(screenId);
  if(!next) return;
  if(allActive.length===1 && allActive[0]===next) return;

  /* BL 전환 시 body 배경 — 카로 더 블랙 차량일 때만 검정, 그 외 항상 초기화 */
    var isbl=!!(selectedCar&&selectedCar.isBlackLabel);
    if(isbl){
      document.body.style.background='#111215';
      document.documentElement.style.background='#111215';
    } else {
      document.body.style.background='';
      document.documentElement.style.background='';
    }

  /* 즉시 전환 모드 (로그인 성공 등) */
  if(immediate){
    allActive.forEach(function(s){ s.classList.remove('active','exit'); });
    next.classList.add('active');
    next.scrollTop=0;
    _afterGoTo(screenId, next);
    return;
  }

  /* 일반 전환 (애니메이션) */
  allActive.forEach(function(s){
    s.classList.add('exit');
    setTimeout(function(){ s.classList.remove('active','exit'); },380);
  });
  setTimeout(function(){
    next.classList.add('active'); next.scrollTop=0;
    _afterGoTo(screenId, next);
  },190);
}

function _afterGoTo(screenId, next){
  updateHomeMenuBtn(screenId);
  if(screenId==='rental-screen'){
    renderCars();
    setTimeout(function(){
      initMap();
      setTimeout(function(){
        if(caroMap) caroMap.invalidateSize();
        initCarBottomSheet();
      },300);
    },200);
  }
  if(screenId==='dev-screen') renderDevScreen();
  if(screenId==='home-screen') startSlider();
  if(screenId==='my-reservation-screen') renderMyReservations();
  if(screenId==='usage-history-screen') renderUsageHistory();
  if(screenId==='mypage-screen') renderMyPage();
  if(screenId==='black-label-screen') renderBLCars();
    if(screenId==='payment-info-screen') renderPaymentInfoScreen();
  closeDrawer();
  var sw=document.getElementById('home-ctrl-switch');
  if(sw) sw.classList.toggle('visible', screenId==='home-screen');
  var isbl=!!(selectedCar&&selectedCar.isBlackLabel);
    var blScreens=['reservation-screen','payment-screen','done-screen','bl-detail-screen'];
    if(blScreens.indexOf(screenId)>=0){
      if(next) next.classList.toggle('bl-mode',isbl);
      if(next){ next.style.background=''; var metalBg=next.querySelector('.metal-bg'); if(metalBg) metalBg.style.background=''; }
      /* BL 결제화면 상세 스타일 */
      if(screenId==='payment-screen'&&isbl){
        setTimeout(function(){
          var title=next.querySelector('.pay-screen-title');
          if(title){title.style.color='rgba(200,169,110,.9)';title.style.fontFamily="'Oswald',sans-serif";title.style.letterSpacing='.15em';}
          var payBtn=document.getElementById('pay-selected-btn');
          if(payBtn){payBtn.style.background='rgba(200,169,110,.08)';payBtn.style.border='1.5px solid rgba(200,169,110,.35)';}
          var payLabel=document.getElementById('pay-selected-label');
          if(payLabel) payLabel.style.color='rgba(200,169,110,.9)';
          var heading=next.querySelector('.step-heading');
          if(heading){heading.style.color='rgba(200,169,110,.8)';heading.style.fontFamily="'Oswald',sans-serif";}
          var submitBtn=next.querySelector('.submit-btn');
          if(submitBtn){submitBtn.style.background='linear-gradient(135deg,#c8a96e,#a07840)';submitBtn.style.color='#18191c';submitBtn.style.fontFamily="'Oswald',sans-serif";submitBtn.style.letterSpacing='.12em';submitBtn.style.border='none';}
          var totalRow=document.getElementById('pay-total-row');
          if(totalRow) totalRow.style.color='rgba(200,169,110,.8)';
        },100);
      } else if(screenId==='payment-screen'&&!isbl){
        setTimeout(function(){
          ['pay-screen-title','pay-selected-label','pay-total-row'].forEach(function(id){var el=document.getElementById(id)||next.querySelector('.'+id);if(el)el.style.cssText='';});
          var payBtn=document.getElementById('pay-selected-btn');if(payBtn){payBtn.style.background='';payBtn.style.border='';}
          var heading=next.querySelector('.step-heading');if(heading)heading.style.cssText='';
          var submitBtn=next.querySelector('.submit-btn');if(submitBtn)submitBtn.style.cssText='';
        },100);
      }
    }
}

/* ── 홈 메뉴 버튼: home-screen에서만 표시 ── */
function updateHomeMenuBtn(screenId){
  var btn=document.getElementById('home-menu-btn');
  if(!btn) return;
  if(screenId==='home-screen') btn.classList.remove('hidden');
  else btn.classList.add('hidden');
}

/* ─────────────────────────────────────────────
   9. 자동 슬라이드
───────────────────────────────────────────── */
function startSlider(){
  if(slideTimer) clearInterval(slideTimer);
  var total=document.querySelectorAll('.auto-slide-item').length||4;
  slideTimer=setInterval(function(){ moveSlide((slideIdx+1)%total); },3500);
}
function moveSlide(idx){
  var total=document.querySelectorAll('.auto-slide-item').length||4;
  slideIdx=idx%total;
  var tr=document.getElementById('auto-slide-track');
  if(tr) tr.style.transform='translateX(-'+(slideIdx*100)+'%)';
  document.querySelectorAll('.slide-dot').forEach(function(d,i){ d.classList.toggle('active',i===slideIdx); });
}

/* ─────────────────────────────────────────────
   10. 홈 메뉴 패널
───────────────────────────────────────────── */
function openHomeMenu(){
  var overlay=document.getElementById('home-menu-overlay');
  var panel=document.getElementById('home-menu-panel');
  if(overlay) overlay.classList.add('open');
  if(panel) panel.classList.add('open');
  /* 사용자 정보 업데이트 */
  var nm=document.getElementById('hmenu-name');
  var id=document.getElementById('hmenu-id');
  if(nm) nm.textContent=userInfo.id||'사용자';
  if(id) id.textContent=userInfo.id||'';
}
function closeHomeMenu(){
  var overlay=document.getElementById('home-menu-overlay');
  var panel=document.getElementById('home-menu-panel');
  if(overlay) overlay.classList.remove('open');
  if(panel) panel.classList.remove('open');
}

/* 기존 코드 호환용 (다른 곳에서 closeDrawer 호출 시 오류 방지) */
function toggleDrawer(){ openHomeMenu(); }
function closeDrawer(){ closeHomeMenu(); }
function drawerMyPage(){ closeHomeMenu(); goTo('mypage-screen'); }
function drawerChangePw(){
  closeHomeMenu();
  /* ★ FIX(M2): '준비 중' → 현재 계정 이메일로 비밀번호 재설정 메일 발송 */
  var em=(userInfo&&userInfo.email)||(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.email)||'';
  if(!fbReady()||!em||em.indexOf('@')<0){ showToast('비밀번호 변경은 로그인 상태에서 이용할 수 있습니다.'); return; }
  window.FB_FN.sendPasswordResetEmail(window.FB_AUTH, em)
    .then(function(){ showToast('📧 '+em+' 로 비밀번호 재설정 메일을 보냈습니다.'); })
    .catch(function(e){ showToast(e&&e.code==='auth/too-many-requests'?'요청이 많습니다. 잠시 후 다시 시도해 주세요.':'메일 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.'); });
}
function drawerChat(){ closeHomeMenu(); showToast('채팅 상담 서비스 준비 중입니다 💬'); }

var LANGS_META={ko:{flag:'🇰🇷',name:'한국어'},en:{flag:'🇺🇸',name:'English'},ja:{flag:'🇯🇵',name:'日本語'},zh:{flag:'🇨🇳',name:'中文'}};

/* ── 언어 변경 (대기화면 언어선택만) ── */
function setLang(code){
  currentLang=code;
  applyLang();
  var meta=LANGS_META[code]||LANGS_META.ko;
  var f=document.getElementById('lf-main');
  var n=document.getElementById('ln-main');
  if(f) f.textContent=meta.flag;
  if(n) n.textContent=meta.name;
  closeLangPicker();
  showToast(meta.flag+'  '+meta.name);
}

/* 대기화면 우측 상단 언어 드롭다운 토글 */
function toggleLP(pickerId, event){
  if(event) event.stopPropagation();
  var lp=document.getElementById(pickerId);
  if(!lp) return;
  var isOpen=lp.classList.contains('open');
  closeLangPicker();
  if(!isOpen) lp.classList.add('open');
}

/* 모든 언어 피커 닫기 */
function closeLangPicker(){
  document.querySelectorAll('.lang-picker').forEach(function(lp){
    lp.classList.remove('open');
  });
}

/* 외부 클릭 시 닫기 */
document.addEventListener('click', function(){
  closeLangPicker();
});

/* 호환용 (참조 오류 방지) */
function drawerSetLang(code){ setLang(code); }

/* ─────────────────────────────────────────────
   11. 토스트
───────────────────────────────────────────── */
function showToast(msg){
  var toast=document.getElementById('toast'); if(!toast) return;
  toast.textContent=msg; toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t=setTimeout(function(){ toast.classList.remove('show'); },2800);
}

/* ─────────────────────────────────────────────
   12. 보안 · 인증 시스템 (Firebase)
   - Firebase Authentication (이메일/비밀번호)
   - Firestore 사용자 데이터 저장
   - 로그인 시도 5회 제한 + 30분 잠금 (로컬)
   - 세션 만료 (30분 미활동 자동 로그아웃)
───────────────────────────────────────────── */

/* Firebase 준비 여부 */
function fbReady(){
  return !!(window.FB_AUTH && window.FB_FN && window.FB_DB);
}

/* 잠금 관련 (로컬 — Firebase 호출 전 차단) */
var MAX_ATTEMPTS = 5;
var LOCKOUT_MS   = 5 * 60 * 1000;
var LOCKOUT_KEY  = 'caro_lockout_v2';

function getLockout(){
  try{ return JSON.parse(localStorage.getItem(LOCKOUT_KEY)||'{}'); }catch(e){ return {}; }
}
function saveLockout(obj){ localStorage.setItem(LOCKOUT_KEY, JSON.stringify(obj)); }

function isLockedOut(id){
  var lo=getLockout(), rec=lo[id];
  if(!rec) return false;
  if(rec.attempts >= MAX_ATTEMPTS){
    var rem = rec.until - Date.now();
    if(rem > 0) return Math.ceil(rem/60000);
    rec.attempts=0; rec.until=0; saveLockout(lo);
  }
  return false;
}
function recordFailedAttempt(id){
  var lo=getLockout();
  if(!lo[id]) lo[id]={attempts:0,until:0};
  lo[id].attempts++;
  if(lo[id].attempts >= MAX_ATTEMPTS) lo[id].until = Date.now()+LOCKOUT_MS;
  saveLockout(lo);
  return MAX_ATTEMPTS - lo[id].attempts;
}
function clearAttempts(id){ var lo=getLockout(); delete lo[id]; saveLockout(lo); }

/* 세션 타이머 (30분 미활동 → 자동 로그아웃) */
var SESSION_MS  = 30 * 60 * 1000;
var sessionTimer = null;
function startSessionTimer(){
  /* 자동 로그아웃 비활성화 — 로그인 영구 유지 (로그아웃/탈퇴 전까지 유지) */
  if(sessionTimer){ clearTimeout(sessionTimer); sessionTimer=null; }
}
function clearSession(){
  if(sessionTimer){ clearTimeout(sessionTimer); sessionTimer=null; }
}
/* 활동 감지 → 타이머 리셋 */
document.addEventListener('click',    function(){ if(userInfo.id) startSessionTimer(); });
document.addEventListener('touchstart',function(){ if(userInfo.id) startSessionTimer(); });

/* ★ [v101] 운전면허 정보 표준형
   ─ 문제: 면허가 4곳에서 4가지 모양(마스킹 문자열 / number 빈 객체 / licenseText / JSON 문자열)으로 저장돼
           마이페이지·면허증 화면·홈 '이용 준비' 카드가 서로 다른 말을 했다.
   ─ 해결: 서버 users.license = {number,name,birth,type,expiry,verified} 한 가지.
           로컬 caro_license(객체) + caro_license_registered + userInfo.license(번호) 는 항상 이 함수로만 갱신. */
function caroNormLicense(v, ctx){
  ctx=ctx||{};
  var o=null;
  if(v&&typeof v==='object'){
    o={number:String(v.number||'').trim(), name:v.name||'', birth:v.birth||'', type:v.type||'', expiry:v.expiry||'', verified:!!v.verified};
  }else if(typeof v==='string'){
    var s=v.trim();
    if(s&&s.indexOf('*')===-1) o={number:s, name:'', birth:'', type:'', expiry:'', verified:false};  /* 마스킹된 옛 값(12-0****)은 무효 */
  }
  if(o){ if(!o.name&&ctx.name) o.name=ctx.name; if(!o.birth&&ctx.birth) o.birth=ctx.birth; }
  return (o&&o.number)?o:null;
}
function caroApplyLicenseLocal(lic){
  try{
    if(lic&&lic.number){
      userInfo.license=lic.number;
      localStorage.setItem('caro_license', JSON.stringify(lic));
      localStorage.setItem('caro_license_registered','true');
    }else{
      userInfo.license='';
      localStorage.removeItem('caro_license'); localStorage.removeItem('caro_license_registered');
    }
    var mpLic=document.getElementById('mp-license'); if(mpLic) mpLic.textContent=(lic&&lic.number)?lic.number:'';
    var piLic=document.getElementById('pi-license'); if(piLic&&document.activeElement!==piLic) piLic.value=(lic&&lic.number)?lic.number:'';
  }catch(e){}
  try{ if(window.__caroRR) window.__caroRR(); }catch(e){}
}
/* 서버에 저장(표준형) → 성공 시 로컬 반영. Promise<boolean> */
function caroSaveLicense(lic){
  lic=caroNormLicense(lic,{name:userInfo.name, birth:userInfo.birth});
  if(!lic) return Promise.resolve(false);
  var uid=userInfo.uid||(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.uid)||'';
  if(!fbReady()||!uid) return Promise.resolve(false);
  var fn=window.FB_FN;
  return fn.setDoc(fn.doc(window.FB_DB,'users',uid),
      {license:lic, licenseText:lic.number, licenseRegisteredAt:new Date().toISOString()},{merge:true})
    .then(function(){ caroApplyLicenseLocal(lic); return true; })
    .catch(function(e){ console.error('🔴 면허 저장 실패:',e&&e.code||e); return false; });
}
window.caroNormLicense=caroNormLicense; window.caroApplyLicenseLocal=caroApplyLicenseLocal; window.caroSaveLicense=caroSaveLicense;

/* Firestore에서 사용자 프로필 불러오기 */
function loadUserProfile(uid){
  if(!fbReady()) return;
  var fn=window.FB_FN, dbRef=window.FB_DB;
  fn.getDoc(fn.doc(dbRef,'users',uid)).then(function(snap){
    if(snap.exists()){
      var d=snap.data();
      userInfo.name    = d.name    || userInfo.id;
      userInfo.email   = d.email   || '';
      userInfo.phone   = d.phoneFull || d.phone || '';
      userInfo.birth   = d.birthFull || d.birth || '';
      /* ★ [v101] 면허: 서버값이 진실 — 표준형으로 userInfo.license(번호)+caro_license(객체) 동시 갱신 */
      var lic = caroNormLicense(d.license,{name:d.name,birth:userInfo.birth}) || caroNormLicense(d.licenseText,{name:d.name,birth:userInfo.birth});
      caroApplyLicenseLocal(lic);
      window._caroProfileLoaded=true;
      /* 홈 환영 메시지 갱신 */
      var wn=document.getElementById('home-welcome-name');
      if(wn) wn.textContent=(userInfo.name||userInfo.id)+' 님, 안녕하세요 👋';
      /* 홈 메뉴 패널 갱신 */
      var hn=document.getElementById('hmenu-name');
      var hi=document.getElementById('hmenu-id');
      if(hn) hn.textContent=userInfo.name||userInfo.id;
      if(hi) hi.textContent=userInfo.id;
    }
  }).catch(console.error);
}

/* ──────────────────────────────────────────
   로컬 사용자 DB (Firebase 미설정 시 fallback)
────────────────────────────────────────── */
var LOCAL_DB_KEY = 'caro_users_v2';
function localLoadUsers(){ try{ return JSON.parse(localStorage.getItem(LOCAL_DB_KEY)||'{}'); }catch(e){ return {}; } }
function localSaveUsers(db){ try{ localStorage.setItem(LOCAL_DB_KEY, JSON.stringify(db)); }catch(e){} }

/* ──────────────────────────────────────────
   SHA-256 — 순수 JS 구현
   (crypto.subtle은 file:// / WebView에서 미작동)
────────────────────────────────────────── */
function sha256(str){
  /* 순수 JS SHA-256 — RFC 6234 */
  function rightRotate(value, amount){
    return (value >>> amount) | (value << (32 - amount));
  }
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length';
  var i, j;
  var result = '';
  var words = [];
  var asciiBitLength = str[lengthProperty]*8;
  var hash = [];
  var k = [];
  var primeCounter = 0;
  var isComposite = {};
  for(var candidate = 2; primeCounter < 64; candidate++){
    if(!isComposite[candidate]){
      for(i = 0; i < 313; i += candidate){
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
    }
  }
  str += '\x80';
  while(str[lengthProperty]%64 - 56) str += '\x00';
  for(i = 0; i < str[lengthProperty]; i++){
    j = str.charCodeAt(i);
    if(j>>8) return ''; /* 비ASCII — 실패 */
    words[i>>2] |= j << ((3 - i)%4)*8;
  }
  words[words[lengthProperty]] = ((asciiBitLength/maxWord)|0);
  words[words[lengthProperty]] = (asciiBitLength);
  for(j = 0; j < words[lengthProperty];){
    var w = words.slice(j, j += 16);
    var oldHash = hash.slice(0);
    var a = hash[0], b = hash[1], c = hash[2], d = hash[3],
        e = hash[4], f = hash[5], g = hash[6], h = hash[7];
    for(i = 0; i < 64; i++){
      var noAction, isFirstBlock = i < 16;
      if(isFirstBlock){
        noAction = w[i];
      } else {
        noAction = w[i%16] =
          (rightRotate(w[(i+1)%16], 7) ^ rightRotate(w[(i+1)%16], 18) ^ (w[(i+1)%16]>>>3)) +
          w[(i+9)%16] +
          (rightRotate(w[(i+14)%16], 17) ^ rightRotate(w[(i+14)%16], 19) ^ (w[(i+14)%16]>>>10)) +
          w[i%16];
      }
      var t1 = h +
        (rightRotate(e,6) ^ rightRotate(e,11) ^ rightRotate(e,25)) +
        ((e&f)^(~e&g)) + k[i] + noAction;
      var t2 = (rightRotate(a,2) ^ rightRotate(a,13) ^ rightRotate(a,22)) +
        ((a&b)^(a&c)^(b&c));
      h = g; g = f; f = e;
      e = (d + t1)|0;
      d = c; c = b; b = a;
      a = (t1 + t2)|0;
    }
    hash = [(hash[0]+a)|0,(hash[1]+b)|0,(hash[2]+c)|0,(hash[3]+d)|0,
            (hash[4]+e)|0,(hash[5]+f)|0,(hash[6]+g)|0,(hash[7]+h)|0];
  }
  for(i = 0; i < 8; i++){
    for(j = 3; j+1; j--){
      var b2 = (hash[i]>>(j*8))&255;
      result += ((b2 < 16)?'0':'') + b2.toString(16);
    }
  }
  return result;
}

/* sha256 래퍼 — 항상 Promise 반환 (기존 코드 호환) */
function sha256Async(str){
  /* 1순위: 멀티바이트 문자를 UTF-8로 인코딩 후 처리 */
  try{
    /* 문자를 UTF-8 바이트 스트림으로 변환 */
    var encoded = unescape(encodeURIComponent(str));
    var hash = sha256(encoded);
    if(hash) return Promise.resolve(hash);
  }catch(e){}
  /* 2순위: crypto.subtle (HTTPS/localhost 환경) */
  if(window.crypto && window.crypto.subtle){
    var buf = new TextEncoder().encode(str);
    return window.crypto.subtle.digest('SHA-256', buf).then(function(ab){
      return Array.from(new Uint8Array(ab)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
    });
  }
  return Promise.resolve(sha256(str)||str);
}

/* ──────────────────────────────────────────
   로그인 (Firebase 우선 → 로컬 fallback)
────────────────────────────────────────── */
/* ★ 소셜(카카오/네이버) 로그인 완료 후 공통 진입 — handleLogin 내부 _doLoginSuccess 와 동일 */
function caroFinishLogin(id, uid, name, email){
  try{
    localStorage.setItem('caro_auto_login','1');
    localStorage.setItem('caro_auto_name',name||id||'');
    localStorage.setItem('caro_auto_id',id||'');
  }catch(e){}
  try{ clearAttempts(id); }catch(e){}
  var err=document.getElementById('login-error'); if(err) err.textContent='';
  window._caroLoggedIn = true;
  userInfo.id   = id||'';
  userInfo.uid  = uid||'';
  userInfo.name = name||id;
  userInfo.email= email||'';
  try{ startSessionTimer(); }catch(e){}
  try{ if(uid) loadUserProfile(uid); }catch(e){}
  try{ loadUserData(id); }catch(e){}
  var wn=document.getElementById('home-welcome-name');
  if(wn) wn.textContent=(userInfo.name||id)+' 님, 안녕하세요 👋';
  var hn=document.getElementById('hmenu-name');
  var hi=document.getElementById('hmenu-id');
  if(hn) hn.textContent=userInfo.name||id;
  if(hi) hi.textContent=id;
  goTo('home-screen', true);
  setTimeout(function(){ try{ showHomeCtrlSwitch(); }catch(e){} }, 100);
}
window.caroFinishLogin = caroFinishLogin;

function handleLogin(){
  var id=val('login-id'), pw=val('login-pw');
  var err=document.getElementById('login-error');
  var btn=document.querySelector('#login-screen .submit-btn');

  if(err) err.textContent='';
  if(!id||!pw){ if(err) err.textContent='아이디와 비밀번호를 입력해 주세요.'; return; }

  /* 아이디 저장 */
  var saveIdChk=document.getElementById('save-id');
    if(saveIdChk&&saveIdChk.checked){
      try{localStorage.setItem('caro_saved_id',id);localStorage.removeItem('caro_saved_pw');}catch(e){}   /* ★ FIX(H2): 비밀번호는 저장하지 않음 */
    } else {
      try{localStorage.removeItem('caro_saved_id');localStorage.removeItem('caro_saved_pw');}catch(e){}
    }
  /* 자동 로그인 저장 */
  var autoChk=document.getElementById('chk-auto-login');
  if(autoChk&&autoChk.checked){
    try{localStorage.setItem('caro_auto_id',id);localStorage.removeItem('caro_auto_pw');}catch(e){}   /* ★ FIX(H2): 자동 로그인은 Firebase 세션으로만 */
  } else {
    try{localStorage.removeItem('caro_auto_id');localStorage.removeItem('caro_auto_pw');}catch(e){}
  }

  /* 개발자(최고관리자) 로그인
     ★ 예전엔 비밀번호가 코드에 하드코딩돼서, 실제 Firebase 비번을 바꾸면
        인증이 실패 → 관리자 모드는 뜨지만 Firestore가 안 붙던(=연동 안됨) 문제가 있었음.
     ★ 이제 '입력한 비밀번호(pw)'를 그대로 Firebase 인증에 사용 → 지금 계정 비번으로 로그인됨.
     ★ 인증이 '성공했을 때만' 관리자 모드로 진입(가짜 super·데이터 없음 상태 방지). */
  if(id==='CAROMOBILITY'){
      if(fbReady()){
        var fn = window.FB_FN;
        fn.signInWithEmailAndPassword(
          window.FB_AUTH,
          'caro.mobility.official@gmail.com',
          pw
        ).then(function(cred){
          userInfo.id = 'CAROMOBILITY';
          userInfo.name = 'CAROMOBILITY';
          userInfo.uid = cred.user.uid;
          userInfo.email = cred.user.email;
          console.log('✅ 관리자 Firebase Auth 활성화:', cred.user.email);
          showDevLoginTransition();
        }).catch(function(e){
          console.error('❌ 관리자 Firebase Auth 실패:', e.code, e.message);
          if(err) err.textContent='비밀번호가 올바르지 않습니다';
          else if(typeof showToast === 'function'){ showToast('비밀번호가 올바르지 않습니다'); }
        });
      } else {
        /* Firebase 미연결(오프라인) — 예전처럼 로컬 관리자 진입만 허용 */
        userInfo.id = 'CAROMOBILITY';
        userInfo.name = 'CAROMOBILITY';
        showDevLoginTransition();
      }
      return;
  }

  /* 잠금 확인 */
  var locked=isLockedOut(id);
  if(locked){ if(err) err.textContent='로그인 시도 초과로 '+locked+'분 후 다시 시도하세요.'; return; }

  /* 버튼 처리 — 텍스트 변경 없이 비활성화만 */
  if(btn) btn.disabled=true;

 function loginSuccess(uid, name){
     /* ── 탈퇴 유예 기간 체크 ── */
     checkWithdrawalOnLogin(id, function(){
       _doLoginSuccess(uid, name);
     }, function(info, daysDiff){
       showWithdrawCancelModal(info, daysDiff, function(){
         _doLoginSuccess(uid, name);
       });
     }, uid);
   }

   function _doLoginSuccess(uid, name){
   /* 로그인 영구 유지 — 체크박스와 무관하게 항상 저장 (로그아웃/탈퇴 전까지 유지) */
   try{
     localStorage.setItem('caro_auto_login','1');
     localStorage.setItem('caro_auto_name',name||id||'');
     localStorage.setItem('caro_auto_id',id||'');
   }catch(e){}
    clearAttempts(id);
    /* 버튼 원복 */
    if(btn){ btn.disabled=false; }
    if(err) err.textContent='';
    window._caroLoggedIn = true;   /* 하단바·홈 UI 활성화 */
    /* userInfo 세팅 */
    userInfo.id   = id;
    userInfo.uid  = uid||'';
    userInfo.name = name||id;
    startSessionTimer();
    loadUserData(id);
    /* 홈 화면 텍스트 업데이트 */
    var wn=document.getElementById('home-welcome-name');
    if(wn) wn.textContent=(userInfo.name||id)+' 님, 안녕하세요 👋';
    var hn=document.getElementById('hmenu-name');
    var hi=document.getElementById('hmenu-id');
    if(hn) hn.textContent=userInfo.name||id;
    if(hi) hi.textContent=id;
    /* 즉시 전환 (immediate=true) */
    var sc=window._pendingShortcut;
    if(sc==='reserve')       goTo('rental-screen', true);
    else if(sc==='myreserve') goTo('my-reservation-screen', true);
    else                      goTo('home-screen', true);
    window._pendingShortcut=null;
    setTimeout(showHomeCtrlSwitch, 100);
  }

  function loginFail(){
    var rem=recordFailedAttempt(id);
    if(err) err.textContent = rem<=0
      ? '로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도하세요.'
      : '아이디 또는 비밀번호가 올바르지 않습니다. (남은 시도: '+rem+'회)';
    if(btn) btn.disabled=false;
  }

  /* ── Firebase 연결 시 ── */
  if(fbReady()){
    var email=id;
    var fn=window.FB_FN, fbAuth=window.FB_AUTH;
    fn.signInWithEmailAndPassword(fbAuth, email, pw)
      .then(function(cred){
        userInfo.email=cred.user.email||'';
        loadUserProfile(cred.user.uid);
        loginSuccess(cred.user.uid, cred.user.displayName||id);
      })
      .catch(function(e){
        if(e.code==='auth/too-many-requests'){
          if(err) err.textContent='너무 많은 시도로 잠금되었습니다. 잠시 후 다시 시도하세요.';
          if(btn) btn.disabled=false;
        } else if(e.code==='auth/network-request-failed'){
          if(err) err.textContent='네트워크 연결을 확인해 주세요.';
          if(btn) btn.disabled=false;
        } else {
          loginFail();
        }
      });
    return;
  }

  /* ── ★ FIX(H4): 로컬 fallback 차단 — Firebase 미연결이면 로그인 불가 (개발용 폴백이 실서비스에서 가짜 로그인을 만들던 문제) ── */
  if(!fbReady()){
    if(err) err.textContent='서버에 연결할 수 없습니다. 네트워크를 확인한 뒤 앱을 다시 열어 주세요.';
    if(btn) btn.disabled=false;
    return;
  }
  /* ── 로컬 fallback (Firebase 미설정 시 — 위 차단으로 실행되지 않음, 개발 참고용) ── */
  sha256Async(pw).then(function(hash){
    var db=localLoadUsers();
    var user=db[id];
    /* 가입된 계정만 허용 */
    if(user && user.pwHash===hash){
      userInfo.email   = user.email   || '';
      userInfo.license = user.license || '';
      userInfo.name    = user.name    || id;
      loginSuccess('', user.name||id);
    } else {
      loginFail();
    }
  }).catch(function(){ loginFail(); });
}
/* ──────────────────────────────────────────
   회원가입 (Firebase 우선 → 로컬 fallback)
────────────────────────────────────────── */
function handleSignup(){
  if(!validateInfo()) return;

  var email=val('su-email').toLowerCase(), pw=val('su-pw');
  var id=email;
  var name=val('su-name');
  var license=val('su-license'), birth=val('su-birth');
  var phone=val('su-phone');

  var btn=document.querySelector('#signup-step3 .submit-btn');
  if(btn){ btn.disabled=true; btn.textContent='가입 처리 중...'; }

  function signupDone(){
    userInfo.id=id; userInfo.email=email; userInfo.name=name; userInfo.phone=phone||''; userInfo.birth=birth||'';
    /* ★ [v101] 가입 때 입력한 면허를 즉시 로컬에도 표준형으로 반영 (서버에는 아래 setDoc 으로 저장됨) */
    try{ caroApplyLicenseLocal(license?{number:license,name:name,birth:birth,type:'',expiry:'',verified:false}:null); }catch(e){}
    if(btn){ btn.disabled=false; btn.textContent='가입 완료'; }
    goSignupStep(4);
  }
  function signupFail(msg){
    showToast(msg||'가입 중 오류가 발생했습니다.');
    if(btn){ btn.disabled=false; btn.textContent='가입 완료'; }
  }

  /* ── Firebase 연결 시 ── */
  if(fbReady()){
    var authEmail = email;
    var fn=window.FB_FN, fbAuth=window.FB_AUTH, dbRef=window.FB_DB;
    /* ★ caro-auth.js: 문자 인증으로 이미 로그인된 전화 계정이 있으면 이메일/비밀번호를 그 계정에 연결
         (계정 1개에 전화+이메일 모두 묶임). 없으면 기존처럼 신규 생성 */
    var createP = (typeof window.caroCreateOrLink==='function')
      ? window.caroCreateOrLink(authEmail, pw)
      : fn.createUserWithEmailAndPassword(fbAuth, authEmail, pw);
    createP
      .then(function(cred){
        var uid=cred.user.uid;
        fn.updateProfile(cred.user, {displayName: name}).catch(console.error);
        /* ★ [v101] 예전엔 전화·생년월일·면허를 마스킹(12-0****)해서 저장 → 실제 값이 어디에도 남지 않아
           면허증 화면엔 "없음", 홈 카드엔 "완료" 로 엇갈렸다. 본인 문서(users/{uid})는 규칙으로 본인·관리자만
           읽으므로 실제 값을 저장하고, 화면에서만 마스킹한다. */
        return fn.setDoc(fn.doc(dbRef,'users',uid), {
          id:id, name:name, email:email,
          phone: phone || '',
          birth: birth || '',
          license: license ? {number:license, name:name, birth:birth||'', type:'', expiry:'', verified:false} : '',
          licenseText: license || '',
          phoneVerified: !!window._caroPhoneVerified,
          phoneE164: (cred.user && cred.user.phoneNumber) || '',
          certCI: window._caroCertCI || '',
          createdAt: fn.serverTimestamp(), uid:uid
        }, {merge:true});
      })
      .then(signupDone)
      .catch(function(e){
        var msg='가입 중 오류가 발생했습니다.';
        if(e.code==='auth/email-already-in-use') msg='이미 가입된 이메일입니다. 로그인 화면에서 로그인해 주세요.';
        else if(e.code==='auth/weak-password')   msg='비밀번호가 너무 단순합니다.';
        else if(e.code==='auth/network-request-failed') msg='네트워크 연결을 확인해 주세요.';
        else if(e.code==='auth/credential-already-in-use' || e.code==='auth/provider-already-linked') msg='이미 가입된 이메일입니다. 로그인 화면에서 로그인해 주세요.';
        else if(e.code==='auth/requires-recent-login') msg='인증 시간이 지났습니다. 휴대폰 인증을 다시 진행해 주세요.';
        signupFail(msg);
      });
    return;
  }

  /* ── ★ FIX(H4): 로컬 fallback 차단 — Firebase 미연결이면 가입 불가 ── */
  if(!fbReady()){ signupFail('서버에 연결할 수 없습니다. 네트워크를 확인한 뒤 다시 시도해 주세요.'); return; }
  /* ── 로컬 fallback (위 차단으로 실행되지 않음) ── */
  var db = localLoadUsers();
  if(db[id]){ signupFail('이미 가입된 이메일입니다. 다른 이메일을 사용해 주세요.'); return; }
  sha256Async(pw).then(function(hash){
    db[id]={
      pwHash:hash, name:name, email:email,
      phone: phone ? phone.replace(/\d(?=\d{4})/g,'*') : '',
      birth: birth ? birth.slice(0,4)+'****' : '',
      license: license ? license.slice(0,4)+'**' : '',
      createdAt: new Date().toISOString()
    };
    localSaveUsers(db);
    signupDone();
  }).catch(function(){ signupFail(); });
}

/* 아이디 중복 확인 */
/* 아이디 중복 확인 */
function checkDuplicate(){
  var email=val('su-email').toLowerCase();
  var hint=document.getElementById('id-hint');
  if(!hint) return;
  if(!email){ showToast('이메일을 입력해 주세요.'); return; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    hint.textContent='올바른 이메일 형식으로 입력해 주세요.';
    hint.style.color='#b23a3a'; return;
  }
  /* 로컬 DB 확인 */
  var db=localLoadUsers();
  if(db[email]){
    hint.textContent='이미 사용중인 이메일입니다.';
    hint.style.color='#b23a3a'; return;
  }
  /* Firebase 미연결 */
  if(!fbReady()){
    hint.textContent='사용 가능한 이메일입니다.';
    hint.style.color='#1d7a3a'; return;
  }
  var fn=window.FB_FN, fbAuth=window.FB_AUTH;
  /* fetchSignInMethodsForEmail 함수 없으면 종료 */
  if(typeof fn.fetchSignInMethodsForEmail !== 'function'){
    hint.textContent='사용 가능한 이메일입니다.';
    hint.style.color='#1d7a3a'; return;
  }
  hint.textContent='확인 중...'; hint.style.color='#888';
  fn.fetchSignInMethodsForEmail(fbAuth, email)
    .then(function(methods){
      if(methods&&methods.length>0){
        hint.textContent='이미 사용중인 이메일입니다.';
        hint.style.color='#b23a3a';
      } else {
        hint.textContent='사용 가능한 이메일입니다.';
        hint.style.color='#1d7a3a';
      }
    })
    .catch(function(e){
      if(e.code==='auth/invalid-email'){
        hint.textContent='올바른 이메일 형식으로 입력해 주세요.';
        hint.style.color='#b23a3a';
      } else if(e.code==='auth/network-request-failed'){
        hint.textContent='네트워크 연결을 확인해 주세요.';
        hint.style.color='#b23a3a';
      } else {
        hint.textContent='오류 발생: '+(e.code||'unknown');
        hint.style.color='#b23a3a';
      }
    });
}

/* 이메일(아이디) 찾기 — PASS 인증 */
var _findCarrier = '';

function selectFindCarrier(btn, carrier){
  document.querySelectorAll('.find-carrier-btn').forEach(function(b){
    b.style.borderColor=''; b.style.background=''; b.style.color=''; b.style.fontWeight='';
  });
  btn.style.borderColor='#1d7a3a';
  btn.style.background='rgba(29,122,58,.1)';
  btn.style.color='#1d7a3a';
  btn.style.fontWeight='700';
  _findCarrier=carrier;
  checkFindIdReady();
}
window.selectFindCarrier=selectFindCarrier;

function checkFindIdReady(){
  var nm=val('find-name');
  var ph=document.getElementById('find-phone');
  var btn=document.getElementById('find-id-pass-btn');
  if(!btn) return;
  var ok=nm&&ph&&/^01[0-9]{8,9}$/.test(ph.value.trim())&&!!_findCarrier;
  btn.disabled=!ok;
  btn.style.opacity=ok?'1':'.5';
  btn.style.cursor=ok?'pointer':'not-allowed';
}
window.checkFindIdReady=checkFindIdReady;

function handleFindId(){
  var nm=val('find-name'), ph=val('find-phone');
  if(!nm){ showToast('이름을 입력해 주세요.'); return; }
  if(!ph||!/^01[0-9]{8,9}$/.test(ph)){ showToast('올바른 휴대폰 번호를 입력해 주세요.'); return; }
  if(!_findCarrier){ showToast('통신사를 선택해 주세요.'); return; }

  window._smsCode = String(Math.floor(100000 + Math.random() * 900000));
  window._smsExpire = Date.now() + 3 * 60 * 1000;
  window._findMode = 'id';

  var modal = document.getElementById('pass-auth-modal');
  if(modal) modal.style.display = 'flex';
  var spinner = document.getElementById('pass-spinner');
  var msg = document.getElementById('pass-modal-msg');
  var successIcon = document.getElementById('pass-success-icon');
  var completeBtn = document.getElementById('pass-modal-complete-btn');
  var inputArea = document.getElementById('sms-input-area');
  if(spinner) spinner.style.display = 'none';
  if(successIcon) successIcon.style.display = 'none';
  if(completeBtn) completeBtn.style.display = 'none';
  if(msg) msg.innerHTML =
    '📱 인증번호: <strong style="font-size:1.8rem;letter-spacing:.3em;color:#18191c;">' +
    window._smsCode + '</strong><br>' +
    '<span style="font-size:.74rem;color:#888;">화면의 번호를 입력해 주세요</span>';
  if(inputArea){ inputArea.style.display='block'; }
  /* 입력창 초기화 */
  var codeInp=document.getElementById('sms-code-input');
  if(codeInp) codeInp.value='';
  _startSmsTimer();
}
/* ── 비밀번호 찾기 PASS 인증 ── */
var _findPwCarrier = '';

function selectFindPwCarrier(btn, carrier){
  document.querySelectorAll('.find-pw-carrier-btn').forEach(function(b){
    b.style.borderColor=''; b.style.background=''; b.style.color=''; b.style.fontWeight='';
  });
  btn.style.borderColor='#1d7a3a';
  btn.style.background='rgba(29,122,58,.1)';
  btn.style.color='#1d7a3a';
  btn.style.fontWeight='700';
  _findPwCarrier=carrier;
  checkFindPwReady();
}
window.selectFindPwCarrier=selectFindPwCarrier;

function checkFindPwReady(){
  var email=val('find-pw-email');
  var nm=val('find-pw-name');
  var ph=document.getElementById('find-pw-phone');
  var btn=document.getElementById('find-pw-pass-btn');
  if(!btn) return;
  var ok=email&&nm&&ph&&/^01[0-9]{8,9}$/.test(ph.value.trim())&&!!_findPwCarrier;
  btn.disabled=!ok;
  btn.style.opacity=ok?'1':'.5';
  btn.style.cursor=ok?'pointer':'not-allowed';
}
window.checkFindPwReady=checkFindPwReady;

function handleFindPwStep1(){
  var email=val('find-pw-email'), nm=val('find-pw-name'), ph=val('find-pw-phone');
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){ showToast('올바른 이메일을 입력해 주세요.'); return; }
  if(!nm){ showToast('이름을 입력해 주세요.'); return; }
  if(!ph||!/^01[0-9]{8,9}$/.test(ph)){ showToast('올바른 휴대폰 번호를 입력해 주세요.'); return; }
  if(!_findPwCarrier){ showToast('통신사를 선택해 주세요.'); return; }

  /* 로컬 DB에서 계정 존재 여부 확인 */
  var db=localLoadUsers();
  var found=db[email];
  if(!found){
    var r=document.getElementById('find-pw-result');
    if(r){ r.style.display='block'; r.style.background='rgba(178,58,58,.06)'; r.style.border='1px solid rgba(178,58,58,.2)'; r.style.color='#b23a3a'; r.textContent='일치하는 계정을 찾을 수 없습니다.'; }
    return;
  }

  window._smsCode = String(Math.floor(100000 + Math.random() * 900000));
  window._smsExpire = Date.now() + 3 * 60 * 1000;
  window._findMode = 'pw';

  var modal = document.getElementById('pass-auth-modal');
  if(modal) modal.style.display = 'flex';
  var spinner = document.getElementById('pass-spinner');
  var msg = document.getElementById('pass-modal-msg');
  var successIcon = document.getElementById('pass-success-icon');
  var completeBtn = document.getElementById('pass-modal-complete-btn');
  var inputArea = document.getElementById('sms-input-area');
  if(spinner) spinner.style.display = 'none';
  if(successIcon) successIcon.style.display = 'none';
  if(completeBtn) completeBtn.style.display = 'none';
  if(msg) msg.innerHTML =
    '📱 인증번호: <strong style="font-size:1.8rem;letter-spacing:.3em;color:#18191c;">' +
    window._smsCode + '</strong><br>' +
    '<span style="font-size:.74rem;color:#888;">화면의 번호를 입력해 주세요</span>';
  if(inputArea) inputArea.style.display='block';
  var codeInp=document.getElementById('sms-code-input');
  if(codeInp) codeInp.value='';
  _startSmsTimer();
}
window.handleFindPwStep1=handleFindPwStep1;

function checkNewPwStrength(pw){
  var fill=document.getElementById('new-pw-strength-fill'), hint=document.getElementById('new-pw-hint');
  var score=0;
  if(pw.length>=8) score++;
  if(/[A-Z]/.test(pw)) score++;
  if(/[0-9]/.test(pw)) score++;
  if(/[!@#$%^&*]/.test(pw)) score++;
  var colors=['#b23a3a','#e07b00','#d4b000','#1d7a3a'];
  var labels=['매우 약함','약함','보통','강함'];
  if(fill){ fill.style.width=(score*25)+'%'; fill.style.background=colors[score-1]||'#b23a3a'; }
  if(hint){ hint.style.color=colors[score-1]||'#b23a3a'; hint.textContent=pw.length?'비밀번호 강도: '+(labels[score-1]||'매우 약함'):''; }
}
window.checkNewPwStrength=checkNewPwStrength;

function handleChangePw(){
  var pw=val('find-pw-new'), pw2=val('find-pw-new2');
  if(!pw||pw.length<8){ showToast('비밀번호는 8자 이상이어야 합니다.'); return; }
  if(!/[A-Z]/.test(pw)){ showToast('대문자를 포함해 주세요.'); return; }
  if(!/[0-9]/.test(pw)){ showToast('숫자를 포함해 주세요.'); return; }
  if(!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)){ showToast('특수문자를 포함해 주세요.'); return; }
  if(pw!==pw2){ showToast('비밀번호가 일치하지 않습니다.'); return; }

  var email=val('find-pw-email');
  var db=localLoadUsers();
  if(db[email]){
    sha256Async(pw).then(function(hash){
      db[email].pwHash=hash;
      localSaveUsers(db);
      showToast('✅ 비밀번호가 변경되었습니다!');
      setTimeout(function(){ goTo('login-screen'); }, 1000);
    });
  } else {
    showToast('계정을 찾을 수 없습니다.');
  }
}
window.handleChangePw=handleChangePw;
/* 비밀번호 재설정 */
function handleFindPw(){
  var id=val('find-pw-id'), email=val('find-pw-email')||'';
  if(!id){ showToast('아이디를 입력해 주세요.'); return; }
  var r=document.getElementById('find-pw-result');

  if(fbReady()){
    var authEmail = email || (id+'@caro.app');
    var fn=window.FB_FN, fbAuth=window.FB_AUTH;
    fn.sendPasswordResetEmail(fbAuth, authEmail)
      .then(function(){
        if(r){ r.style.display='block'; r.textContent='비밀번호 재설정 이메일을 발송했습니다.'; }
      })
      .catch(function(e){
        showToast(e.code==='auth/user-not-found'?'등록된 계정을 찾을 수 없습니다.':'이메일 발송에 실패했습니다.');
      });
  } else {
    /* 로컬 fallback — 아이디 존재 여부만 확인 */
    var db=localLoadUsers();
    if(r){
      r.style.display='block';
      r.textContent = db[id]
        ? '고객센터(support@caro.app)로 문의해 주세요. 비밀번호를 재설정해 드립니다.'
        : '등록된 계정을 찾을 수 없습니다.';
    }
  }
}

/* 비밀번호 복잡도 검사 */
function validateInfo(){
  var id=val('su-email').toLowerCase(), pw=val('su-pw'), pw2=val('su-pw2');
  if(!id){ showToast('이메일을 입력해 주세요.'); return false; }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)){ showToast('올바른 이메일 형식으로 입력해 주세요.'); return false; }
  if(!pw){ showToast('비밀번호를 입력해 주세요.'); return false; }
  if(pw.length<8){ showToast('비밀번호는 8자 이상이어야 합니다.'); return false; }
  if(!/[A-Z]/.test(pw)){ showToast('비밀번호에 대문자를 포함해 주세요.'); return false; }
  if(!/[0-9]/.test(pw)){ showToast('비밀번호에 숫자를 포함해 주세요.'); return false; }
  if(!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(pw)){ showToast('비밀번호에 특수문자를 포함해 주세요.'); return false; }
  if(pw!==pw2){ showToast('비밀번호가 일치하지 않습니다.'); return false; }
  var hint=document.getElementById('id-hint');
  if(!hint||hint.style.color!=='rgb(29, 122, 58)'){
    showToast('이메일 중복 확인을 먼저 해 주세요.'); return false;
  }
  return true;
}

function showDevLoginTransition(){
  /* 개발자 전용 전환 오버레이 */
  var overlay=document.getElementById('dev-login-overlay');
  if(!overlay){
    overlay=document.createElement('div');
    overlay.id='dev-login-overlay';
    overlay.style.cssText='position:fixed;inset:0;z-index:9999;background:#0a0a0f;display:flex;flex-direction:column;align-items:center;justify-content:center;opacity:0;transition:opacity .5s ease;pointer-events:none;';
    overlay.innerHTML=
      '<div style="font-family:\'Oswald\',sans-serif;font-size:.7rem;letter-spacing:.5em;color:rgba(100,180,255,.5);margin-bottom:20px;text-transform:uppercase;">DEVELOPER ONLY</div>'+
      '<div style="font-family:\'Oswald\',sans-serif;font-size:2rem;font-weight:500;letter-spacing:.2em;color:rgba(100,180,255,.9);">DEV CONSOLE</div>'+
      '<div style="width:200px;height:1px;background:linear-gradient(90deg,transparent,rgba(100,180,255,.5),transparent);margin:16px 0;"></div>'+
      '<div style="font-size:.72rem;color:rgba(100,180,255,.4);letter-spacing:.15em;">CARO MOBILITY ADMIN</div>';
    document.body.appendChild(overlay);
  }
  overlay.style.pointerEvents='all';
  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    overlay.style.opacity='1';
    setTimeout(function(){
      goTo('dev-screen');
      setTimeout(function(){ overlay.style.opacity='0'; overlay.style.pointerEvents='none'; },600);
    },2000);
  });});
}
/* ★ [v101] 계정별 로컬 데이터 제거 (로그아웃 / 다른 계정 로그인 감지 시). 미러 훅이 서버로 올리지 않도록 조용히 지운다 */
function caroClearUserLocal(prevId){
  try{
    window.__caroSilentStorage = true;
    var rm=['caro_apd_cards','caro_apd_credit','caro_apd_credit_history','caro_apd_coupons','caro_apd_unpaid','caro_apd_sns',
            'caro_apd_plan','caro_apd_notif','caro_apd_phone','caro_apd_phone_full','caro_apd_init_v3',
            'caro_license','caro_license_registered','caro_extra_driver','caro_plan_v1','caro_suspension_v1',
            'caro_mirror_ts','caro_res_pending','caro_pay_data','caro_pay_uid','caro_ext_pending','caro_ret_pending'];
    if(prevId) rm.push('caro_data_'+prevId);
    try{ for(var i=localStorage.length-1;i>=0;i--){ var k=localStorage.key(i); if(k&&(k.indexOf('caro_nf_')===0||k.indexOf('caro_nfx_')===0)) rm.push(k); } }catch(e){}
    rm.forEach(function(k){ try{ localStorage.removeItem(k); }catch(e){} });
  }catch(e){}
  finally{ window.__caroSilentStorage = false; }
}
window.caroClearUserLocal=caroClearUserLocal;
function handleLogout(){
   var id=document.getElementById('login-id'),pw=document.getElementById('login-pw'),er=document.getElementById('login-error');
   if(er) er.textContent='';
  try{
    var sid=localStorage.getItem('caro_saved_id');
    if(sid&&id){id.value=sid;var sc=document.getElementById('save-id');if(sc)sc.checked=true;}
    else if(id) id.value='';
    if(pw) pw.value='';
  }catch(e){if(id)id.value='';if(pw)pw.value='';}
  clearSession();
  /* ★ [v101] 진짜 로그아웃 — 예전엔 화면 플래그만 지우고 Firebase 세션은 그대로 둬서
     ① 다음 실행 때 이전 계정으로 서버 동기화가 계속 돌고 ② 카드 목록을 지운 직후 2초 폴링이
     '카드 0개'를 이전 계정 서버 문서에 써 버렸다(로그아웃 → 재로그인 시 카드 증발). */
  window.__caroLoggingOut = true;
  var _prevId = userInfo.id;
  try{ if(window.caroSyncCancel) window.caroSyncCancel(); }catch(e){}
  try{ if(fbReady()&&window.FB_FN.signOut) window.FB_FN.signOut(window.FB_AUTH).catch(function(){}); }catch(e){}
  window._caroLoggedIn = false;   /* 하단바 숨김 */
  userInfo={id:'',email:'',license:'',name:''};
  window.__caroResFromServer = null;
  /* 🔒 보안: 로그아웃 시 이전 계정의 예약·이용내역·카드 정보 메모리/캐시 완전 제거 */
  myReservations=[]; cancelledHistory=[]; savedCards=[];
  /* 기기에 남는 '계정별' 로컬 데이터 전부 제거 (다음 계정에 섞여 들어가던 문제) — 서버 백업(미러)에는 건드리지 않음 */
  caroClearUserLocal(_prevId);
  setTimeout(function(){ window.__caroLoggingOut = false; }, 4000);
  /* 컨트롤러 버튼 숨김 */
  var sw=document.getElementById('home-ctrl-switch');
  if(sw) sw.classList.remove('visible');
  closeExtendSheet();
  if(homeCtrlTimer){clearInterval(homeCtrlTimer);homeCtrlTimer=null;}
  try{localStorage.removeItem('caro_auto_login');localStorage.removeItem('caro_auto_id');localStorage.removeItem('caro_auto_pw');}catch(e){}
    closeDrawer(); goTo('main-screen');
  }
  function socialLogin(p){
    /* caro-auth.js 가 켜져 있으면 실제 카카오/네이버 로그인으로 위임 */
    if(typeof window.caroSocialLogin==='function') return window.caroSocialLogin(p);
    showToast(p+' 로그인 준비 중입니다.');
  }

/* ─────────────────────────────────────────────
   13-1. 카로 더 블랙 전환 모션 (4초 천천히)
───────────────────────────────────────────── */
function goBlackLabel(){
  var overlay=document.getElementById('bl-transition-overlay');
  if(!overlay){ goTo('black-label-screen'); return; }

  overlay.classList.remove('show');
  overlay.style.transition='opacity .7s ease';

  requestAnimationFrame(function(){ requestAnimationFrame(function(){
    overlay.classList.add('show');
  });});

  /* 3.0초 후 화면 전환 */
  setTimeout(function(){
    goTo('black-label-screen');
  }, 3000);

  /* 3.6초 후 천천히 페이드아웃 */
  setTimeout(function(){
    overlay.style.transition='opacity 1.2s ease';
    overlay.classList.remove('show');
  }, 3600);

  /* 5.0초 후 transition 원상복구 */
  setTimeout(function(){
    overlay.style.transition='opacity .7s ease';
  }, 5000);
}
var mapMarkers=[];
var caroMapReady=false;

function initMap(){
  var el=document.getElementById('caro-map'); if(!el) return;
  if(typeof L === 'undefined'){
    el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#888;font-size:.82rem;flex-direction:column;gap:8px;">📡<br>지도를 불러오려면<br>인터넷 연결이 필요합니다</div>';
    return;
  }
  if(caroMap){
    setTimeout(function(){ caroMap.invalidateSize(); updateMapMarkers(); },300);
    return;
  }
  caroMap=L.map('caro-map',{zoomControl:true,scrollWheelZoom:false}).setView([37.4150,126.6820],11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(caroMap);
  caroMapReady=true;
  /* 지도 이동/줌 시 차량 리스트 자동 필터링 */
    caroMap.on('moveend zoomend', function(){
      renderCars();
      updateCarSheetCount();
    });
  updateMapMarkers();
  renderCars();
}
function updateMapMarkers(){
  if(!caroMap) return;
  mapMarkers.forEach(function(m){ caroMap.removeLayer(m); });
  mapMarkers=[];
  var now=new Date();
  var reservedMap={};
  myReservations.forEach(function(r){
    if(r.start && r.end){
      if(!r.returned){
        reservedMap[r.car.id]={until:null};
      } else if(r.returnedAt){
        var releaseTimeR=new Date(r.returnedAt.getTime()+10*60000);
        if(now<releaseTimeR && !reservedMap[r.car.id])
          reservedMap[r.car.id]={until:releaseTimeR};
      }
    }
  });
  CARS_DATA.forEach(function(car){
    var res=reservedMap[car.id];
    var available=car.status==='available'&&!car.devDisabled&&!res;
    var col=available?'#1d7a3a':'#b23a3a';
    var label=available?'이용가능':(car.devDisabled?'예약불가':'대여중');
    var icon = L.divIcon({
            html: '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">' +
              '<svg width="25" height="32" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="93" rx="12" ry="3" fill="#3a3e46" opacity="0.25"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#a2aab6" transform="translate(1,1)"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#f4f7fa" stroke="' + col + '" stroke-width="3"/><path d="M50 26A14 14 0 1 0 50 50" fill="none" stroke="#18191c" stroke-width="7" stroke-linecap="round"/></svg>' +
              '<div style="font-size:9px;font-weight:700;color:' + col + ';background:rgba(255,255,255,.85);padding:1px 3px;border-radius:14px;white-space:nowrap;">' + label + '</div>' +
            '</div>',
            className: '', iconSize: [34,44], iconAnchor: [17,37]
          });
    var marker=L.marker([car.lat,car.lng],{icon:icon}).addTo(caroMap)
      .bindPopup('<b>'+getCarName(car)+'</b><br>'+car.fuel+' · '+car.pricePerHour.toLocaleString()+'원/h<br><span style="color:'+col+';font-weight:700;">'+label+'</span>');
    mapMarkers.push(marker);
  });

  /* ── 거점(와드) 마커 ── */
  if(window.CARO_STATIONS){
    CARO_STATIONS.forEach(function(st){
      var hasAvail=false;
      var allCars=CARS_DATA.concat(typeof BL_CARS!=='undefined'?BL_CARS:[]);
      allCars.forEach(function(car){
        if(car.lat==null||car.lng==null) return;
        var near=(car.place===st.area)||(car.region===st.area)||(car.place===st.place)||
                 (Math.sqrt(Math.pow(car.lat-st.lat,2)+Math.pow(car.lng-st.lng,2))<0.035);
        if(!near) return;
        var res=reservedMap[car.id];
        if(car.status==='available' && !car.devDisabled && !res) hasAvail=true;
      });
      var col=hasAvail?'#c8a96e':'#9aa0a8';   /* 예약가능=골드 / 마감=회색 */
      var sub=hasAvail?'예약 가능':'예약 마감';
      var sIcon=L.divIcon({
        html:'<div style="display:flex;flex-direction:column;align-items:center;gap:3px;">'+
          '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:'+col+';border:2.5px solid #fff;box-shadow:0 3px 9px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;">'+
            '<div style="transform:rotate(45deg);width:9px;height:9px;border-radius:50%;background:#fff;"></div>'+
          '</div>'+
          '<div style="font-size:9.5px;font-weight:800;color:#fff;background:'+col+';padding:2px 7px;border-radius:12px;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.25);letter-spacing:.02em;">'+st.name+'</div>'+
        '</div>',
        className:'',iconSize:[90,46],iconAnchor:[15,30]
      });
      var sm=L.marker([st.lat,st.lng],{icon:sIcon,zIndexOffset:1000}).addTo(caroMap)
        .bindPopup('<b>'+st.name+'</b><br>'+(st.place||'')+'<br>'+(st.addr||'')+'<br><span style="color:'+col+';font-weight:700;">'+sub+'</span>');
      mapMarkers.push(sm);
    });
  }
}
window.updateMapMarkers=updateMapMarkers;
function updateCarSheetCount(){
   var cnt=document.getElementById('car-sheet-count');
   if(!cnt) return;
   var visCars = CARS_DATA.filter(isCarInMapBounds);
   var visBL   = BL_CARS.filter(isCarInMapBounds);
   var total   = visCars.length + visBL.length;
   var avail   = visCars.filter(function(c){return c.status==='available'&&!c.devDisabled;}).length;
   cnt.textContent = avail+'대 이용가능 / 전체 '+total+'대';
 }
  function initCarBottomSheet(){
    updateCarSheetCount();
    if(typeof L === 'undefined' || !caroMap) return;
    BL_CARS.forEach(function(car){
      var col='#c8a96e';
      var label='CARO THE BLACK';
      var icon = L.divIcon({
              html: '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">' +
                '<svg width="25" height="32" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="93" rx="12" ry="3" fill="#3a3e46" opacity="0.25"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#a2aab6" transform="translate(1,1)"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#f4f7fa" stroke="' + col + '" stroke-width="3"/><path d="M50 26A14 14 0 1 0 50 50" fill="none" stroke="#18191c" stroke-width="7" stroke-linecap="round"/></svg>' +
                '<div style="font-size:9px;font-weight:700;color:' + col + ';background:rgba(255,255,255,.85);padding:1px 3px;border-radius:14px;white-space:nowrap;">' + label + '</div>' +
              '</div>',
              className: '', iconSize: [34,44], iconAnchor: [17,37]
            });
      var marker=L.marker([car.lat,car.lng],{icon:icon}).addTo(caroMap)
        .bindPopup('<b>⭐ '+car.name+'</b><br>'+car.fuel+' · '+car.pricePerHour.toLocaleString()+'원/h<br><span style="color:#c8a96e;font-weight:700;">CARO THE BLACK</span>');
      mapMarkers.push(marker);
    });
  }
  window.initCarBottomSheet=initCarBottomSheet;

function getCarName(car){
  return currentLang==='en'?car.nameen:currentLang==='ja'?car.nameja:currentLang==='zh'?car.namezh:car.name;
}

function renderCars(){
  var list=document.getElementById('car-list'); if(!list) return;
  list.innerHTML='';
  var now=new Date();

  /* 예약 현황: 반납 후 10분간은 대여중 유지 */
  var reservedMap={};
  myReservations.forEach(function(r){
    if(r.start && r.end){
      if(!r.returned){
        /* 미반납: 반납 전까지 무조건 대여중 (예정·이용중·연체 모두) */
        reservedMap[r.car.id]={start:r.start,end:r.end,release:null,returned:false};
      } else if(r.returnedAt){
        /* 반납 완료: 반납 시각 기준 10분까지만 유지 */
        var releaseTimeR=new Date(r.returnedAt.getTime()+10*60000);
        if(now<releaseTimeR && !reservedMap[r.car.id])
          reservedMap[r.car.id]={start:r.start,end:r.end,release:releaseTimeR,returned:true};
      }
    }
  });
  /* 지도 마커도 동기화 */
  updateMapMarkers();

  var visibleCars = CARS_DATA.filter(isCarInMapBounds);
  visibleCars.forEach(function(car){
    var res=reservedMap[car.id];
    var isReserved=!!res;
    var isDisabled=!!car.devDisabled;
    var ok=car.status==='available' && !isReserved && !isDisabled;

    /* 상태 레이블 */
    var statusLabel, statusCls;
    if(isDisabled){
      statusLabel='예약 불가'; statusCls='reserved';
    } else if(isReserved){
      statusLabel='대여 중'; statusCls='busy';
    } else if(car.status==='available'){
      statusLabel='이용 가능'; statusCls='ok';
    } else {
      statusLabel='대여 중'; statusCls='busy';
    }

    var kmInfo=car.fuel==='전기'?(car.kmRate+'원/km'):'50km 주행 무료';
    var optLines=(car.options||'').split('\n').map(function(l){return '<div class="car-opt-line">'+l+'</div>';}).join('');

    /* 가용 시간 막대바 */
    var availBar='';
    if(isReserved && res.start && res.end){
      /* 오늘 기준 0~24시간 범위에서 예약 블록 표시 */
      var dayStart=new Date(now); dayStart.setHours(0,0,0,0);
      var dayEnd=new Date(now); dayEnd.setHours(23,59,59,0);
      var total=dayEnd-dayStart;
      var busyLeft=Math.max(0,(res.start-dayStart)/total*100);
      var busyWidth=Math.min(100,Math.max(0,(res.end-res.start)/total*100));
      var nowPct=(now-dayStart)/total*100;
      var fmtTime=function(d){return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2);};
      availBar=
        '<div class="car-avail-bar">'+
          '<div class="car-avail-label">오늘 대여 현황 '+fmtTime(res.start)+'~'+fmtTime(res.end)+'</div>'+
          '<div class="car-avail-track">'+
            '<div class="car-avail-free" style="left:0;width:'+busyLeft+'%;"></div>'+
            '<div class="car-avail-busy" style="left:'+busyLeft+'%;width:'+busyWidth+'%;"></div>'+
            '<div class="car-avail-now" style="left:'+nowPct+'%;"></div>'+
          '</div>'+
        '</div>';
    }

    var div=document.createElement('div'); div.className='car-item';
    div.innerHTML=
      '<img class="car-thumb" src="'+car.img+'" alt="'+getCarName(car)+'"/>'+
      '<div class="car-info">'+
        '<div class="car-name">'+getCarName(car)+'</div>'+
        '<div class="car-opts">'+optLines+'</div>'+
        '<div class="car-km-info">🛣 '+kmInfo+'</div>'+
        '<div class="car-price-row">'+
          '<span class="car-status '+statusCls+'">'+statusLabel+'</span>'+
          '<span class="car-price"><strong>'+car.pricePerHour.toLocaleString()+'원</strong>/h</span>'+
        '</div>'+
        availBar+
      '</div>'+
      '<button class="car-rent-btn"'+(ok?' onclick="selectCar('+car.id+')"':' disabled')+'>'+(ok?'예약':'불가')+'</button>';
    list.appendChild(div);
  });
}

function goBackFromReservation(){
  if(selectedCar&&selectedCar.isBlackLabel) goTo('black-label-screen');
  else goTo('rental-screen');
}
window.goBackFromReservation=goBackFromReservation;

function selectCar(carId){
  selectedCar=CARS_DATA.find(function(c){ return c.id===carId; });
  if(!selectedCar) return;
  setupDateInputs();
  renderReservationCard();
  renderInsurance();
  updatePriceSummary();
  goTo('reservation-screen');
}

function renderReservationCard(){
  var el=document.getElementById('reserve-car-card'); if(!el||!selectedCar) return;
  var carId=selectedCar.id||selectedCar.name;
  var fuelPct=getFuelLevel(carId)||Math.floor(Math.random()*60)+20;
  fuelLevels[carId]=fuelPct;
  var fuelColor=fuelPct>60?'#1d7a3a':fuelPct>30?'#b07800':'#b23a3a';
  var fuelLabel=selectedCar.fuel==='전기'?'배터리':'연료';
  el.className='res-car-section';
  el.innerHTML=
    '<img class="res-car-img" src="'+selectedCar.img+'" alt="'+getCarName(selectedCar)+'"/>'+
    '<div class="res-car-info">'+
      '<div class="res-car-name">'+getCarName(selectedCar)+'</div>'+
      '<div class="res-car-sub">'+selectedCar.fuel+'</div>'+
      '<div class="res-car-price">'+selectedCar.pricePerHour.toLocaleString()+'원 / h</div>'+
      '<div style="margin-top:5px;">'+
        '<div style="font-size:.68rem;color:var(--text-m);margin-bottom:3px;">'+fuelLabel+' '+fuelPct+'%</div>'+
        '<div style="height:5px;background:rgba(0,0,0,.1);border-radius:14px;overflow:hidden;">'+
          '<div style="width:'+fuelPct+'%;height:100%;background:'+fuelColor+';border-radius:14px;"></div>'+
        '</div>'+
      '</div>'+
    '</div>';
}

/* ─────────────────────────────────────────────
   14. 면책 상품
───────────────────────────────────────────── */
function renderInsurance(){
  var list=document.getElementById('insurance-list'); if(!list) return;
  list.innerHTML='';
  INSURANCE.forEach(function(ins,i){
    var sel=selectedIns&&selectedIns.id===ins.id;
    var desc=currentLang==='en'?ins.descen:currentLang==='ja'?ins.descja:currentLang==='zh'?ins.desczh:ins.desc;
    var name=currentLang==='en'?ins.nameen:currentLang==='ja'?ins.nameja:currentLang==='zh'?ins.namezh:ins.name;
    var div=document.createElement('div');
    div.className='insurance-item'+(sel?' selected':'');
    div.onclick=function(){ selectedIns=ins; renderInsurance(); updatePriceSummary(); };
    div.innerHTML=
      '<div class="ins-top">'+
        '<span class="ins-name">'+name+(ins.badge?'&nbsp;<span class="ins-badge best">'+ins.badge+'</span>':'')+'</span>'+
        '<span class="ins-price">'+(ins.pricePerHour>0?'+'+ins.pricePerHour.toLocaleString()+'원/h':'무료')+'</span>'+
      '</div>'+
      '<div class="ins-desc">'+desc+'</div>';
    list.appendChild(div);
  });
}

/* ─────────────────────────────────────────────
   15. 예약 계산
───────────────────────────────────────────── */
function updateDuration(){
  var s=new Date(document.getElementById('res-start').value);
  var e=new Date(document.getElementById('res-end').value);
  var box=document.getElementById('duration-box');
  if(!box) return;
  if(isNaN(s)||isNaN(e)||e<=s){ box.style.display='none'; return; }
  var hrs=Math.ceil((e-s)/3600000);
  box.style.display='block';
  box.textContent='이용 시간: '+hrs+'시간';
  box.style.color='';
  box.style.background='';
  box.style.borderColor='';
  updatePriceSummary();
}
function fmtDT(d){
  if(!d||isNaN(new Date(d).getTime())) return '—';
  if(!(d instanceof Date)) d=new Date(d);
  var p=function(n){return n<10?'0'+n:n;};
  return (d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());
}

function updatePriceSummary(){
  if(!selectedCar) return;
  var s=new Date(document.getElementById('res-start').value);
  var e=new Date(document.getElementById('res-end').value);
  if(isNaN(s)||isNaN(e)||e<=s) return;
  var hrs=Math.ceil((e-s)/3600000);
  var ins=selectedIns||INSURANCE[0];
  var carCost=selectedCar.pricePerHour*hrs;
  var insCost=ins.pricePerHour*hrs;
  var pa=document.getElementById('point-amount');
  pointDiscount=pa&&pa.value?Math.min(parseInt(pa.value)||0,2500):0;
  var total=Math.max(0,carCost+insCost-couponDiscount-pointDiscount);
  var sum=document.getElementById('price-summary');
  if(!sum) return;
  var insName=currentLang==='en'?ins.nameen:currentLang==='ja'?ins.nameja:currentLang==='zh'?ins.namezh:ins.name;
  sum.style.display='block';
  sum.innerHTML=
    '<div class="price-row"><span>차량 요금</span><span>'+carCost.toLocaleString()+'원</span></div>'+
    '<div class="price-row"><span>면책 ('+insName+')</span><span>'+insCost.toLocaleString()+'원</span></div>'+
    (couponDiscount>0?'<div class="price-row"><span>쿠폰 할인</span><span style="color:#1d7a3a">-'+couponDiscount.toLocaleString()+'원</span></div>':'')+
    (pointDiscount>0?'<div class="price-row"><span>포인트 할인</span><span style="color:#1d7a3a">-'+pointDiscount.toLocaleString()+'원</span></div>':'')+
    '<div class="price-row total"><span>총 결제 금액</span><span>'+total.toLocaleString()+'원</span></div>';
}

function applyCoupon(){
  var code=val('coupon-code'), hint=document.getElementById('coupon-hint');
  if(code==='CARO30'){ couponDiscount=3000; if(hint){ hint.style.color='#1d7a3a'; hint.textContent='쿠폰 적용: -3,000원'; } updatePriceSummary(); }
  else{ couponDiscount=0; if(hint){ hint.style.color='#b23a3a'; hint.textContent='유효하지 않은 쿠폰 코드입니다.'; } }
}
function togglePoint(cb){
  var row=document.getElementById('point-input-row'), pa=document.getElementById('point-amount');
  if(!row) return;
  if(cb.checked){ pointDiscount=2500; if(pa) pa.value=2500; }
  else{ pointDiscount=0; if(pa) pa.value=''; }
  updatePriceSummary();
}

/* ─────────────────────────────────────────────
   16. 결제 화면
───────────────────────────────────────────── */
function goToPayment(){
  if(!selectedCar){ showToast('차량을 선택해 주세요.'); return; }
  var s=new Date(document.getElementById('res-start').value);
  var e=new Date(document.getElementById('res-end').value);
  if(isNaN(s)||isNaN(e)||e<=s){ showToast('이용 시간을 올바르게 설정해 주세요.'); return; }

  /* ── 시간 중복 예약 방지 ── */
  var overlapRes=null;
  myReservations.forEach(function(r){
    if(r.returned||!r.start||!r.end) return;
    if(s < r.end && e > r.start) overlapRes=r;
  });
  if(overlapRes){
    var p=function(n){return n<10?'0'+n:n;};
    var fmtR=function(d){return (d.getMonth()+1)+'/'+p(d.getDate())+' '+p(d.getHours())+':'+p(d.getMinutes());};
    showToast('⚠️ '+overlapRes.bookNo+' 예약과 시간이 겹쳐요!\n('+fmtR(overlapRes.start)+'~'+fmtR(overlapRes.end)+')\n기존 예약 취소 후 다시 시도해 주세요.');
    return;
  }

  var hrs=Math.ceil((e-s)/3600000);
  var ins=selectedIns||INSURANCE[0];
  var pa=document.getElementById('point-amount');
  pointDiscount=pa&&pa.value?Math.min(parseInt(pa.value)||0,2500):0;
  var total=Math.max(0,(selectedCar.pricePerHour+ins.pricePerHour)*hrs-couponDiscount-pointDiscount);
  window._payData={car:selectedCar,ins:ins,hrs:hrs,total:total,start:s,end:e};
  var pcc=document.getElementById('pay-car-card');
  var insName=currentLang==='en'?ins.nameen:currentLang==='ja'?ins.nameja:currentLang==='zh'?ins.namezh:ins.name;
  if(pcc) pcc.innerHTML=
    '<img class="pay-car-img" src="'+selectedCar.img+'" alt="'+getCarName(selectedCar)+'"/>'+
    '<div class="pay-car-details">'+
      '<div class="pay-car-name">'+getCarName(selectedCar)+'</div>'+
      '<div class="pay-car-meta">'+
        '<span>📅 '+fmtDT(s)+' → '+fmtDT(e)+'</span>'+
        '<span>⏱ '+hrs+'시간</span>'+
        '<span>⚡ '+selectedCar.fuel+'</span>'+
        '<span>🛡 '+insName+'</span>'+
      '</div>'+
    '</div>';
  var ptr=document.getElementById('pay-total-row');
  if(ptr) ptr.textContent='총 결제 금액: '+total.toLocaleString()+'원';
  renderPayMethods();
    goTo('payment-screen');
    /* BL 모드 결제 화면 스타일 */
    setTimeout(function(){
      var isbl=!!(selectedCar&&selectedCar.isBlackLabel);
      var ps=document.getElementById('payment-screen');
      if(!ps) return;
      if(isbl){
        ps.style.background='#111215';
        /* 타이틀 */
        var title=ps.querySelector('.screen-title,.page-title,h2,h3');
        if(title){ title.style.fontFamily="'Oswald',sans-serif"; title.style.letterSpacing='.15em'; title.style.color='rgba(200,169,110,.9)'; }
        /* 결제수단 버튼/행 전체 */
        ps.querySelectorAll('button,input,.pay-method-btn,.pay-select-row,[class*="pay"]').forEach(function(el){
          if(el.tagName==='BUTTON'&&el.textContent.trim()){
            el.style.background='rgba(200,169,110,.1)';
            el.style.border='1px solid rgba(200,169,110,.35)';
            el.style.color='rgba(200,169,110,.9)';
            el.style.fontFamily="'Oswald',sans-serif";
            el.style.letterSpacing='.08em';
          }
        });
        /* 레이블/텍스트 */
        ps.querySelectorAll('label,span,.pay-label,[class*="label"]').forEach(function(el){
          if(el.childElementCount===0) el.style.color='rgba(200,169,110,.7)';
        });
        /* 구분선 */
        ps.querySelectorAll('[class*="divider"],[class*="line"],hr').forEach(function(el){
          el.style.borderColor='rgba(200,169,110,.2)';
        });
        /* 결제하기 메인 버튼 */
        var mainBtn=ps.querySelector('.submit-btn,.pay-btn,[onclick*="handlePayment"]');
        if(mainBtn){
          mainBtn.style.background='linear-gradient(135deg,#c8a96e,#a07840)';
          mainBtn.style.color='#fff';
          mainBtn.style.fontFamily="'Oswald',sans-serif";
          mainBtn.style.letterSpacing='.12em';
          mainBtn.style.border='none';
        }
      } else {
        /* 일반 모드 원복 */
        ps.style.background='';
        ps.querySelectorAll('button,label,span,input').forEach(function(el){
          el.style.background=''; el.style.border=''; el.style.color='';
          el.style.fontFamily=''; el.style.letterSpacing='';
        });
      }
    },200);
  }

/* ─────────────────────────────────────────────
   15-1. 카드 입력 자동 포맷팅
───────────────────────────────────────────── */
function fmtCardNum(el){
  /* ★ FIX: AMEX(34/37 시작, 15자리, 4-6-5 형식) 지원 */
  var v=el.value.replace(/\D/g,'');
  var isAmex=/^3[47]/.test(v);
  v=v.slice(0,isAmex?15:16);
  var out='';
  if(isAmex){
    out=v.slice(0,4);
    if(v.length>4) out+=' '+v.slice(4,10);
    if(v.length>10) out+=' '+v.slice(10,15);
  }else{
    for(var i=0;i<v.length;i++){
      if(i>0&&i%4===0) out+=' ';
      out+=v[i];
    }
  }
  el.value=out;
}
/* 카드번호 유효성: 일반 16자리 / AMEX 15자리 */
function caroCardOk(numStr){
  var d=String(numStr||'').replace(/\D/g,'');
  return /^3[47]/.test(d) ? d.length===15 : d.length===16;
}
window.caroCardOk=caroCardOk;
function fmtCardExp(el){
  var v=el.value.replace(/\D/g,'').slice(0,4);
  if(v.length>=3) el.value=v.slice(0,2)+' / '+v.slice(2);
  else el.value=v;
}
function fmtCardCvc(el){
  /* ★ FIX: AMEX는 CVC 4자리 — 4자리까지 허용 */
  el.value=el.value.replace(/\D/g,'').slice(0,4);
}

function toggleCardInputs(){
  var m=document.querySelector('input[name="pay"]:checked');
  var ci=document.getElementById('card-inputs');
  if(ci) ci.style.display=(m&&m.value==='card')?'block':'none';
}

function handlePayment(){
  var pd=window._payData||{};
  var car=pd.car||selectedCar, ins=pd.ins||selectedIns||INSURANCE[0];
  var hrs=pd.hrs||0, total=pd.total||0;
  var startDt=pd.start instanceof Date?pd.start:(pd.start?new Date(pd.start):null);
  var endDt=pd.end instanceof Date?pd.end:(pd.end?new Date(pd.end):null);
  if(!car||!startDt||!endDt||isNaN(startDt)||isNaN(endDt)){
    showToast('예약 정보가 올바르지 않습니다. 다시 시도해 주세요.'); return;
  }
  var bookNo='CR'+Date.now().toString().slice(-8);
  var tossPayments=TossPayments((window.CARO_CONFIG&&CARO_CONFIG.TOSS_CLIENT_KEY)||'test_ck_6bJXmgo28eByJonkYwBE3LAnGKWx');   /* ★ caro-config.js 에서 한 곳 관리 */
/* 결제 전 데이터 localStorage에 저장 */
  try{
      localStorage.setItem('caro_pay_uid', userInfo.id||'');
      localStorage.setItem('caro_pay_data', JSON.stringify({
        car:{id:car.id,name:car.name,nameen:car.nameen,nameja:car.nameja,namezh:car.namezh,
             pricePerHour:car.pricePerHour,fuel:car.fuel,img:car.img,
             kmRate:car.kmRate,fuelFreeKm:car.fuelFreeKm,isBlackLabel:car.isBlackLabel,
             options:car.options||''},
        ins:{id:ins.id,name:ins.name,nameen:ins.nameen,nameja:ins.nameja,namezh:ins.namezh,
             pricePerHour:ins.pricePerHour,desc:ins.desc||'',descen:ins.descen||'',
             descja:ins.descja||'',desczh:ins.desczh||''},
        hrs:hrs, total:total,
        start:startDt.toISOString(), end:endDt.toISOString()
      }));
    }catch(e){}
  tossPayments.requestPayment('카드',{
    amount: total,
    orderId: bookNo,
    orderName: getCarName(car)+' 대여',
    customerName: userInfo.name||userInfo.id||'고객',
    successUrl: window.location.href.split('?')[0]+'?payment=success&bookNo='+bookNo,
    failUrl: window.location.href.split('?')[0]+'?payment=fail',
  }).catch(function(err){
    if(err.code!=='USER_CANCEL') showToast('결제 오류: '+err.message);
  });
}

/* ─────────────────────────────────────────────
   17. 예약 확인
───────────────────────────────────────────── */
function renderMyReservations(){
  var list=document.getElementById('my-reservation-list'); if(!list) return;
  if(myReservations.length===0){
    list.innerHTML='<div class="empty-reservation"><div class="empty-icon">📋</div><div class="empty-text">'+t('no_reservation')+'</div></div>';
    return;
  }
  /* 현재 대여중 → 예약예정 순으로 정렬 */
    var nowT=new Date();
    var sorted=myReservations.slice().sort(function(a,b){
      var aActive=!a.returned&&nowT>=a.start&&nowT<=a.end;
      var bActive=!b.returned&&nowT>=b.start&&nowT<=b.end;
      if(aActive&&!bActive) return -1;
      if(!aActive&&bActive) return 1;
      if(a.returned&&!b.returned) return 1;
      if(!a.returned&&b.returned) return -1;
      return a.start-b.start;
    });

    list.innerHTML='';
    sorted.forEach(function(r,i){
      /* 실제 myReservations 인덱스 찾기 */
      var realIdx=myReservations.indexOf(r);
    var _ins=r.ins||INSURANCE[0];
        var insName=currentLang==='en'?_ins.nameen:currentLang==='ja'?_ins.nameja:currentLang==='zh'?_ins.namezh:_ins.name;
    var now=new Date();
    var diffMs=r.start.getTime()-now.getTime();
    var isReturned=!!r.returned;
    var isActive=!isReturned && diffMs<=0 && now<r.end;
    var within10min=!isReturned && diffMs<=600000 && diffMs>0;

    var statusLabel=isReturned?'반납 완료':isActive?'대여 중':within10min?'대여 임박':'예약 완료';
    var statusColor=isReturned?'#888':isActive?'#b23a3a':within10min?'#b07800':'#1d7a3a';
    var statusBg=isReturned?'rgba(120,120,120,.1)':isActive?'rgba(178,58,58,.12)':within10min?'rgba(200,140,0,.12)':'rgba(29,122,58,.12)';

    var card=document.createElement('div'); card.className='my-res-card';
    card.innerHTML=
      '<div class="my-res-header">'+
        '<span class="my-res-no">'+r.bookNo+'</span>'+
        '<span class="my-res-status" style="background:'+statusBg+';color:'+statusColor+'">'+statusLabel+'</span>'+
      '</div>'+
      '<div class="my-res-car-row">'+
        '<img class="my-res-img" src="'+r.car.img+'" alt="'+getCarName(r.car)+'"/>'+
        '<div>'+
          '<div class="my-res-car-name">'+getCarName(r.car)+'</div>'+
          '<div class="my-res-car-sub">'+r.car.fuel+'</div>'+
        '</div>'+
      '</div>'+
      '<div class="my-res-detail">'+
        '<div class="my-res-row"><span class="my-res-label">대여</span><span class="my-res-value">'+fmtDT(r.start)+'</span></div>'+
        '<div class="my-res-row"><span class="my-res-label">반납</span><span class="my-res-value">'+fmtDT(r.end)+' ('+r.hrs+'h)</span></div>'+
        '<div class="my-res-row"><span class="my-res-label">결제</span><span class="my-res-value my-res-total">'+r.total.toLocaleString()+'원</span></div>'+
      '</div>'+
      '<button class="detail-btn" onclick="openResDetail('+realIdx+')">상세 내용 보기</button>';
    list.appendChild(card);
  });
}

/* ─────────────────────────────────────────────
   17-1. 컨트롤러 공통 변수
───────────────────────────────────────────── */
var ctrlResIdx=-1;
var ctrlPhotoOpen=false;
/* ─────────────────────────────────────────────
   디바이스 ↔ 차량 매핑 (하드코딩 제거 · 자동 해석)
   우선순위: devices 컬렉션 carId/carName 매핑
            → 차량 deviceId 필드 → 이름(코나)=CARO-001 → 레거시(1번차)
───────────────────────────────────────────── */
window.CARO_DEVICE_MAP = window.CARO_DEVICE_MAP || {};   /* {carId: deviceId} */

function caroFindCarById(carId){
  try{
    var all=(typeof CARS_DATA!=='undefined'?CARS_DATA:[]).concat(typeof BL_CARS!=='undefined'?BL_CARS:[]);
    return all.find(function(c){ return String(c.id)===String(carId); }) || null;
  }catch(e){ return null; }
}

function caroResolveDeviceId(carId){
  try{
    if(carId==null) return null;
    var key=String(carId);
    if(window.CARO_DEVICE_MAP[key]) return window.CARO_DEVICE_MAP[key];   /* 1) 관리자 등록 매핑 */
    var car=caroFindCarById(carId);
    if(!car){                                                            /* CARS_DATA에 없으면 예약의 차량 객체에서 */
      try{
        var rs=(typeof myReservations!=='undefined')?myReservations:[];
        for(var i=0;i<rs.length;i++){ if(rs[i] && rs[i].car && String(rs[i].car.id)===key){ car=rs[i].car; break; } }
      }catch(e){}
    }
    if(car && car.deviceId) return car.deviceId;                          /* 2) 차량 deviceId 필드 */
    if(car && /코나/.test(car.name||'')) return 'CARO-001';               /* 3) 코나 실기기 */
    if(key==='1') return 'CARO-001';                                      /* 4) 레거시 기본 */
  }catch(e){}
  return null;
}
window.caroResolveDeviceId = caroResolveDeviceId;

/* devices 컬렉션 실시간 스캔 → carId→deviceId 매핑 자동 구성
   (관리자 대시보드에서 기기에 carId 또는 carName을 지정해 두면 자동 반영) */
function caroLoadDeviceMap(){
  try{
    if(!(typeof fbReady==='function' && fbReady())){ setTimeout(caroLoadDeviceMap,1500); return; }
    var fn=window.FB_FN, db=window.FB_DB;
    fn.onSnapshot(fn.collection(db,'devices'), function(snap){
      var map={};
      snap.forEach(function(ds){
        var d=ds.data()||{};
        if(d.carId!=null){ map[String(d.carId)]=ds.id; return; }
        if(d.carName){
          var all=(typeof CARS_DATA!=='undefined'?CARS_DATA:[]).concat(typeof BL_CARS!=='undefined'?BL_CARS:[]);
          var c=all.find(function(x){ return (x.name||'')===d.carName; });
          if(c) map[String(c.id)]=ds.id;
        }
      });
      window.CARO_DEVICE_MAP=map;
    }, function(){ /* 권한/네트워크 오류 무시 */ });
  }catch(e){}
}
setTimeout(caroLoadDeviceMap, 2000);

/* ─────────────────────────────────────────────
   디바이스 명령 전송 (도어락/언락/시동차단)
───────────────────────────────────────────── */
function sendDeviceCommand(carId, cmdType){
  if(!fbReady()){
    showCtrlToast('⚠️ Firebase 연결 안 됨');
    return Promise.resolve(false);
  }
  if(!window.FB_AUTH || !window.FB_AUTH.currentUser){
    showCtrlToast('⚠️ 로그인이 필요합니다');
    return Promise.resolve(false);
  }
  var fn = window.FB_FN, db = window.FB_DB;
  var deviceId = caroResolveDeviceId(carId);
  if(!deviceId){
    console.warn('차량에 연결된 디바이스 없음:', carId);
    showCtrlToast('⚠️ 이 차량은 디바이스 미연결');
    return Promise.resolve(false);
  }
  var cmdId = 'cmd_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
  var cmdData = {
    type: cmdType,
    issuedBy: userInfo.uid || '',
    issuedByEmail: userInfo.email || userInfo.id || '',
    issuedAt: fn.serverTimestamp(),
    status: 'pending',
    timestamp: Date.now()
  };
  console.log('📡 디바이스 명령:', deviceId, cmdType, cmdId);
  return fn.setDoc(fn.doc(db, 'devices', deviceId, 'commands', cmdId), cmdData)
  .then(function(){
        console.log('✅ 명령 큐잉 성공:', cmdType);

        /* ── NEW: 명령 상태 실시간 추적 ── */
        var cmdRef = fn.doc(db, 'devices', deviceId, 'commands', cmdId);
        var unsub = null;
        var timeoutId = setTimeout(function(){
          if(unsub) unsub();
          showCtrlToast('⏱ 디바이스 응답 없음 (' + cmdType + ')');
        }, 30000);

        unsub = fn.onSnapshot(cmdRef, function(snap){
          if(!snap.exists()) return;
          var d = snap.data();
          console.log('📨 명령 상태:', d.status);

          if(d.status === 'acked'){
            showCtrlToast('📡 디바이스 응답 받음');
          } else if(d.status === 'done'){
            showCtrlToast(cmdType === 'unlock' ? '✅ 차량 문 열림' : '✅ 차량 문 잠김');
            clearTimeout(timeoutId);
            if(unsub) unsub();
          } else if(d.status === 'failed'){
            showCtrlToast('❌ 명령 실패: ' + (d.errorMsg || '알 수 없음'));
            clearTimeout(timeoutId);
            if(unsub) unsub();
          }
        });

        return true;
      })
      .catch(function(err){
      console.error('❌ 명령 전송 실패:', err.code, err.message);
      showCtrlToast('⚠️ 전송 실패: ' + err.code);
      return false;
    });
}
window.sendDeviceCommand = sendDeviceCommand;
/* ─────────────────────────────────────────────
   디바이스 status 실시간 표시 (컨트롤러 배지)
───────────────────────────────────────────── */
(function(){
  var _deviceStatusUnsub = null;

  function fmtRelativeTime(date){
    var diff = (new Date() - date) / 1000;
    if(diff < 60) return Math.floor(diff) + '초 전';
    if(diff < 3600) return Math.floor(diff/60) + '분 전';
    if(diff < 86400) return Math.floor(diff/3600) + '시간 전';
    return Math.floor(diff/86400) + '일 전';
  }

  function updateBadge(status, lastSeen){
    var badge = document.getElementById('device-status-badge');
    if(!badge){
      var carName = document.getElementById('home-ctrl-car-name');
      if(!carName) return;
      badge = document.createElement('div');
      badge.id = 'device-status-badge';
      badge.style.cssText = 'display:inline-flex;align-items:center;gap:6px;margin-top:8px;padding:4px 10px;border-radius:14px;font-size:.7rem;font-weight:700;letter-spacing:.04em;width:fit-content;';
      carName.parentNode.appendChild(badge);
    }
    if(status === 'online'){
      badge.style.background = 'rgba(29,122,58,.12)';
      badge.style.color = '#1d7a3a';
      badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#1d7a3a;box-shadow:0 0 6px rgba(29,122,58,.7);"></span> 디바이스 온라인';
    } else if(status === 'offline'){
      badge.style.background = 'rgba(120,120,120,.1)';
      badge.style.color = '#888';
      var timeStr = lastSeen ? '· ' + fmtRelativeTime(lastSeen) : '· 응답 없음';
      badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#888;"></span> 오프라인 ' + timeStr;
    } else {
      badge.style.background = 'rgba(178,58,58,.08)';
      badge.style.color = '#b23a3a';
      badge.innerHTML = '<span style="width:7px;height:7px;border-radius:50%;background:#b23a3a;"></span> 디바이스 미등록';
    }
  }

  function subscribeDeviceStatus(deviceId){
    if(_deviceStatusUnsub){ try{_deviceStatusUnsub();}catch(e){} _deviceStatusUnsub=null; }
    if(!fbReady() || !deviceId){ updateBadge('unknown'); return; }
    var fn = window.FB_FN, db = window.FB_DB;
    _deviceStatusUnsub = fn.onSnapshot(fn.doc(db, 'devices', deviceId), function(snap){
      if(!snap.exists()){ updateBadge('unknown'); return; }
      var d = snap.data();
      var lastSeen = (d.lastSeen && d.lastSeen.toDate) ? d.lastSeen.toDate() : null;
      var isOnline = d.status === 'online' && lastSeen && (new Date() - lastSeen) < 60000;
      updateBadge(isOnline ? 'online' : 'offline', lastSeen);

      /* ── 실기기 텔레메트리 반영 ── */
      try{
        var cid = (ctrlResIdx>=0 && myReservations[ctrlResIdx]) ? myReservations[ctrlResIdx].car.id : null;
        /* 연료/배터리 잔량 (fuel · fuelLevel · battery 중 존재하는 값) */
        var fuelVal = (d.fuel!=null?d.fuel:(d.fuelLevel!=null?d.fuelLevel:(d.battery!=null?d.battery:null)));
        if(cid!=null && fuelVal!=null && isFinite(fuelVal)){
          window.fuelLevels = window.fuelLevels || {};
          window.fuelLevels[cid] = Math.max(0,Math.min(100,Math.round(fuelVal)));
          /* ★ 실기기가 보고한 값만 별도 보관 — 연료 보충요금 청구는 이 값으로만 판단 */
          window.fuelRealLevels = window.fuelRealLevels || {};
          window.fuelRealLevels[cid] = window.fuelLevels[cid];
          if(typeof window.caroRefreshFuel==='function') window.caroRefreshFuel();
        }
        /* 주행거리(odometer/drivenKm) — 예약에 누적, 반납 정산에 자동 합산 */
        var km = (d.drivenKm!=null?d.drivenKm:(d.odometer!=null?d.odometer:null));
        if(cid!=null && km!=null && isFinite(km) && myReservations[ctrlResIdx]){
          myReservations[ctrlResIdx].deviceKm = Math.round(km);
        }
      }catch(e){}
    });
  }

  function unsubscribeDeviceStatus(){
    if(_deviceStatusUnsub){ try{_deviceStatusUnsub();}catch(e){} _deviceStatusUnsub=null; }
    var badge = document.getElementById('device-status-badge');
    if(badge) badge.remove();
  }

  /* openHomeCtrl 후크 */
  var origOpen = window.openHomeCtrl;
  if(typeof origOpen === 'function'){
    window.openHomeCtrl = function(){
      origOpen.apply(this, arguments);
      setTimeout(function(){
        if(typeof ctrlResIdx !== 'undefined' && ctrlResIdx >= 0 && myReservations[ctrlResIdx]){
          var carId = myReservations[ctrlResIdx].car.id;
          var deviceId = caroResolveDeviceId(carId);
          subscribeDeviceStatus(deviceId);
        }
      }, 250);
    };
  }

  /* close 후크 */
  var origClose = window.closeHomeCtrl;
  if(typeof origClose === 'function'){
    window.closeHomeCtrl = function(){ unsubscribeDeviceStatus(); origClose.apply(this, arguments); };
  }
  var origCloseDirect = window.closeHomeCtrlDirect;
  if(typeof origCloseDirect === 'function'){
    window.closeHomeCtrlDirect = function(){ unsubscribeDeviceStatus(); origCloseDirect.apply(this, arguments); };
  }

  console.log('✅ 디바이스 status 실시간 표시 활성화');
})();

/* 홈 컨트롤러 전용 액션 */
function ctrlActionHome(type){
  /* 방향별 사진 촬영 */
  if(type==='check'||type==='photo'){ openPhotoModal(); return; }
  if(type==='photo_front'){ openPhotoModal(); setTimeout(function(){ openSideCapture('front'); },350); return; }
  if(type==='photo_rear'){  openPhotoModal(); setTimeout(function(){ openSideCapture('rear');  },350); return; }
  if(type==='photo_left'){  openPhotoModal(); setTimeout(function(){ openSideCapture('left');  },350); return; }
  if(type==='photo_right'){ openPhotoModal(); setTimeout(function(){ openSideCapture('right'); },350); return; }
  if(type==='photo_misc'){  openPhotoModal(); setTimeout(function(){ openSideCapture('misc');  },350); return; }
  if(type==='extend'){ openExtendSheet(); return; }
  /* 문열림/잠금 */
  if(type==='unlock'){
      var b=document.getElementById('ctrl-btn-unlock');
      if(b){ b.classList.add('ctrl-sq-btn-active'); setTimeout(function(){ b.classList.remove('ctrl-sq-btn-active'); },2000); }
      var carIdU = (ctrlResIdx>=0 && myReservations[ctrlResIdx]) ? myReservations[ctrlResIdx].car.id : null;
      if(carIdU){
        sendDeviceCommand(carIdU, 'unlock').then(function(ok){
          if(ok) showCtrlToast('🔓 잠금 해제 명령 전송됨');
        });
      } else {
        showCtrlToast('🔓 차량 문이 열렸습니다.');
      }
      return;
    }
  if(type==='lock'){
      var b2=document.getElementById('ctrl-btn-lock');
      if(b2){ b2.classList.add('ctrl-sq-btn-active'); setTimeout(function(){ b2.classList.remove('ctrl-sq-btn-active'); },2000); }
      var carIdL = (ctrlResIdx>=0 && myReservations[ctrlResIdx]) ? myReservations[ctrlResIdx].car.id : null;
      if(carIdL){
        sendDeviceCommand(carIdL, 'lock').then(function(ok){
          if(ok) showCtrlToast('🔒 잠금 명령 전송됨');
        });
      } else {
        showCtrlToast('🔒 차량 문이 잠겼습니다.');
      }
      return;
    }
  /* 비상등 — 연결된 실기기가 있으면 실제 명령 전송, 없으면 안내 토스트 */
  if(type==='hazard'){
      var b3=document.getElementById('ctrl-btn-hazard');
      if(b3){ b3.classList.add('ctrl-sq-btn-active'); setTimeout(function(){ b3.classList.remove('ctrl-sq-btn-active'); },2000); }
      var carIdH=(ctrlResIdx>=0 && myReservations[ctrlResIdx]) ? myReservations[ctrlResIdx].car.id : null;
      var devH=(carIdH!=null && window.caroResolveDeviceId) ? caroResolveDeviceId(carIdH) : null;
      if(devH){
        sendDeviceCommand(carIdH,'hazard').then(function(ok){ if(ok) showCtrlToast('⚠️ 비상등 점멸 명령 전송됨'); });
      } else {
        showCtrlToast('⚠️ 비상등이 3회 점멸되었습니다.');
      }
      return;
    }
  var pkText=document.getElementById('home-ctrl-park')?document.getElementById('home-ctrl-park').textContent:'확인 중';
  var msgs={
    locate:'📍 주차 위치: '+pkText,
  };
  if(msgs[type]) showCtrlToast(msgs[type]);
  if(type==='return'){
    openReturnParkModal();
  }
}

function showCtrlToast(msg){
  var toast=document.getElementById('ctrl-action-toast');
  if(toast){
    toast.textContent=msg;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t=setTimeout(function(){ toast.classList.remove('show'); },2500);
  } else { showToast(msg); }
}
window.ctrlActionHome=ctrlActionHome;

/* ── 반납 주차 확인 플로우 ── */
var altParkPhotos=[];

function openReturnParkModal(){
  var pkText=document.getElementById('home-ctrl-park')?document.getElementById('home-ctrl-park').textContent:'지정 주차 구역';
  var sp=document.getElementById('return-park-spot');
  if(sp) sp.textContent=pkText;
  openModal('return-park-modal');
}
function closeReturnParkModal(e){
  if(e){var box=document.querySelector('#return-park-modal .modal-box');if(box&&box.contains(e.target)&&e.target!==document.getElementById('return-park-modal'))return;}
  closeModal('return-park-modal');
}
function closeReturnParkModalDirect(){ closeModal('return-park-modal'); }

function confirmReturn(choice){
  closeModal('return-park-modal');
  if(choice==='yes'){
    /* 정상 반납 진행 */
    doReturnCar();
  } else {
    /* 대체 주차 신고 */
    altParkPhotos=[];
    var pr=document.getElementById('alt-park-photo-preview'); if(pr) pr.innerHTML='';
    var cnt=document.getElementById('alt-park-photo-count'); if(cnt) cnt.textContent='📸 사진 첨부 (0장)';
    var desc=document.getElementById('alt-park-desc'); if(desc) desc.value='';
    openModal('alt-park-modal');
  }
}

function addAltParkPhoto(){
  if(altParkPhotos.length>=5){ showToast('최대 5장까지 첨부 가능합니다.'); return; }
  /* getUserMedia로 직접 촬영 — 갤러리 차단 */
  _openSimpleCam(function(dataUrl){
    altParkPhotos.push(dataUrl);
    var cnt=document.getElementById('alt-park-photo-count');
    if(cnt) cnt.textContent='📸 사진 첨부 ('+altParkPhotos.length+'장)';
    var pr=document.getElementById('alt-park-photo-preview');
    if(pr){
      var img=document.createElement('img');
      img.src=dataUrl;
      img.style.cssText='width:60px;height:50px;object-fit:cover;border-radius:8px;border:1px solid var(--border);';
      pr.appendChild(img);
    }
  });
}

function submitAltPark(){
  var desc=document.getElementById('alt-park-desc');
  if(!desc||!desc.value.trim()){ showToast('주차 위치 설명을 입력해 주세요.'); return; }
  if(altParkPhotos.length===0){ showToast('주차 위치 사진을 최소 1장 첨부해 주세요.'); return; }
  closeModal('alt-park-modal');
  showToast('📋 대체 주차 신고가 접수되었습니다.');
  setTimeout(function(){ doReturnCar(); }, 600);
}

function closeAltParkModal(e){
  if(e){var box=document.querySelector('#alt-park-modal .modal-box');if(box&&box.contains(e.target)&&e.target!==document.getElementById('alt-park-modal'))return;}
  closeModal('alt-park-modal');
}
function closeAltParkModalDirect(){ closeModal('alt-park-modal'); }

/* ★ 연료/충전 부족 반납 청구 정책 — 잔량 40% 이하일 때 보충 요금 청구 (금액은 조정 가능) */
var CARO_FUEL_POLICY={ threshold:40, fee:10000 };  /* 잔량 40% 이하 반납 시 1만원 (쏘카 기준) */
function doReturnCar(){
  if(homeCtrlTimer){clearInterval(homeCtrlTimer);homeCtrlTimer=null;}
  closeModal('home-ctrl-modal');
  var fuelNotice='';
  if(ctrlResIdx>=0&&myReservations[ctrlResIdx]){
    var resR=myReservations[ctrlResIdx];
    resR.returned=true;
    resR.returnedAt=new Date();
    /* ★ 반납 시점 연료/충전 잔량 확인 → 40% 이하면 청구 기록 */
    try{
      var carIdR=resR.car&&resR.car.id;
      /* ★ FIX(C4): 예전엔 getFuelLevel()이 난수를 돌려줘 무작위로 1만원이 청구됐음.
           실기기(IoT)가 실제로 보고한 값이 있을 때만 판단하고, 없으면 청구하지 않는다. */
      var pct=(carIdR!=null && window.fuelRealLevels && window.fuelRealLevels[carIdR]!=null)?window.fuelRealLevels[carIdR]:null;
      if(pct!=null){
        resR.fuelAtReturn=pct;
        if(pct<=CARO_FUEL_POLICY.threshold){
          resR.fuelFeeDue=CARO_FUEL_POLICY.fee;
          fuelNotice=' ⛽ 잔량 '+pct+'% — 연료/충전 보충 요금 '+CARO_FUEL_POLICY.fee.toLocaleString()+'원이 청구됩니다.';
          /* 관제에서 볼 수 있게 청구 기록 저장 */
          try{
            if(window.FB_FN&&window.FB_DB&&window.FB_FN.setDoc){
              var fid='fuel_'+resR.bookNo;
              window.FB_FN.setDoc(window.FB_FN.doc(window.FB_DB,'fuel_claims',fid),{
                bookNo:resR.bookNo, userId:userInfo.uid||userInfo.id||'',
                carId:carIdR, carName:(resR.car&&resR.car.name)||'',
                fuelPct:pct, fee:CARO_FUEL_POLICY.fee,
                status:'due', createdAt:Date.now()
              },{merge:true});
            }
          }catch(e){}
        }
      }
    }catch(e){}
  }
  saveUserData();
  showToast('반납이 완료되었습니다. 이용해 주셔서 감사합니다 🚗'+fuelNotice);
  setTimeout(function(){
    renderCars(); updateMapMarkers();
    setTimeout(function(){ renderCars(); updateMapMarkers(); },10*60000);
  },500);
}

window.openReturnParkModal=openReturnParkModal;
window.closeReturnParkModal=closeReturnParkModal;
window.closeReturnParkModalDirect=closeReturnParkModalDirect;
window.confirmReturn=confirmReturn;
window.addAltParkPhoto=addAltParkPhoto;
window.submitAltPark=submitAltPark;
window.closeAltParkModal=closeAltParkModal;
window.closeAltParkModalDirect=closeAltParkModalDirect;

/* ─────────────────────────────────────────────
   DEV CONSOLE — 전체 기능
───────────────────────────────────────────── */

/* 차량별 연료량 시뮬레이션 (id → 0~100%) */
var fuelLevels={};
function getFuelLevel(carId){
  if(fuelLevels[carId]==null) fuelLevels[carId]=Math.floor(Math.random()*60)+20;
  return fuelLevels[carId];
}
function fuelBar(pct){
  var color=pct>60?'#1d7a3a':pct>30?'#b07800':'#b23a3a';
  return '<div style="display:flex;align-items:center;gap:6px;margin-top:3px;">'+
    '<div style="flex:1;height:5px;background:rgba(0,0,0,.1);border-radius:14px;overflow:hidden;">'+
      '<div style="width:'+pct+'%;height:100%;background:'+color+';border-radius:14px;"></div>'+
    '</div>'+
    '<span style="font-size:.7rem;color:'+color+';font-weight:700;min-width:32px;">'+pct+'%</span>'+
  '</div>';
}

/* 개발자 화면 진입 시 전체 렌더 */
function renderDevScreen(){
  devRenderStats();
  devRenderCarOverview();
  devRenderBlOverview();
  devRenderCarSelect();
  devRenderBlCarSelect();
  devRenderCarStatusList();
  devRenderCarDeleteList();
  devRenderSwapDropdowns();
  devRenderPriceList();
  devRenderInsList();
  devRenderNoticeList();
  devRenderEventList();
}

/* 통계 */
function devRenderStats(){
  var s=document.getElementById('dev-s-car'); if(s) s.textContent=CARS_DATA.length;
  var b=document.getElementById('dev-s-bl'); if(b) b.textContent=BL_CARS.length;
  var r=document.getElementById('dev-s-res'); if(r) r.textContent=myReservations.length;
  var e=document.getElementById('dev-s-ev'); if(e) e.textContent=EVENT_DETAILS.length;
}

/* 일반 차량 현황 */
function devRenderCarOverview(){
  var list=document.getElementById('dev-car-overview'); if(!list) return;
  list.innerHTML='';
  if(!CARS_DATA.length){ list.innerHTML='<div class="dev-row"><span class="dev-label">등록 차량 없음</span></div>'; return; }
  CARS_DATA.forEach(function(car){
    var status=car.devDisabled?'점검중':(car.status==='available'?'이용가능':'이용중');
    var sc=car.devDisabled?'dev-status-disabled':(car.status==='available'?'dev-status-ok':'dev-status-busy');
    var fuel=getFuelLevel(car.id);
    var row=document.createElement('div'); row.className='dev-row'; row.style.flexWrap='wrap'; row.style.gap='4px';
    row.innerHTML=
      '<img src="'+car.img+'" style="width:44px;height:34px;object-fit:contain;border-radius:14px;background:#1a2030;flex-shrink:0;"/>'+
      '<div style="flex:1;min-width:80px;">'+
        '<div style="font-size:.8rem;color:rgba(180,220,255,.85);font-weight:600;">'+car.name+'</div>'+
        '<div style="font-size:.68rem;color:rgba(91,200,255,.5);">'+car.pricePerHour.toLocaleString()+'원/h · '+car.fuel+'</div>'+
        fuelBar(fuel)+
      '</div>'+
      '<span class="dev-status-badge '+sc+'">'+status+'</span>';
    list.appendChild(row);
  });
}

/* 카로 더 블랙 차량 현황 */
function devRenderBlOverview(){
  var list=document.getElementById('dev-bl-overview'); if(!list) return;
  list.innerHTML='';
  BL_CARS.forEach(function(car){
    var row=document.createElement('div'); row.className='dev-row'; row.style.flexWrap='wrap'; row.style.gap='4px';
    row.innerHTML=
      '<img src="'+car.img+'" style="width:44px;height:34px;object-fit:contain;border-radius:14px;background:#1a1c20;flex-shrink:0;"/>'+
      '<div style="flex:1;min-width:80px;">'+
        '<div style="font-size:.8rem;color:rgba(200,169,110,.85);font-weight:600;">'+car.name+'</div>'+
        '<div style="font-size:.68rem;color:rgba(200,169,110,.4);">'+car.pricePerHour.toLocaleString()+'원/h · '+car.area+'</div>'+
      '</div>'+
      '<span class="dev-status-badge dev-status-ok">운영중</span>';
    list.appendChild(row);
  });
}

/* 탭 전환 */
function devSwitchTab(tab){
  var norm=document.getElementById('dev-reg-normal');
  var bl=document.getElementById('dev-reg-bl');
  var tn=document.getElementById('dev-tab-normal');
  var tb=document.getElementById('dev-tab-bl');
  if(tab==='normal'){
    if(norm) norm.style.display='';
    if(bl) bl.style.display='none';
    if(tn) tn.classList.add('dev-tab-active');
    if(tb) tb.classList.remove('dev-tab-active');
  } else {
    if(norm) norm.style.display='none';
    if(bl) bl.style.display='';
    if(tn) tn.classList.remove('dev-tab-active');
    if(tb) tb.classList.add('dev-tab-active');
  }
}
window.devSwitchTab=devSwitchTab;

/* 차량 선택 드롭다운 */
function devRenderCarSelect(){
  var sel=document.getElementById('dev-photo-car'); if(!sel) return;
  sel.innerHTML='<option value="">➕ 신규 등록</option>';
  CARS_DATA.forEach(function(c){
    var label=c.name+(c.carNumber?' ['+c.carNumber+']':'')+(c.region?' · '+c.region:'');
    sel.innerHTML+='<option value="'+c.id+'">'+label+'</option>';
  });
}
function devRenderBlCarSelect(){
  var sel=document.getElementById('dev-bl-photo-car'); if(!sel) return;
  sel.innerHTML='<option value="">➕ 신규 등록</option>';
  BL_CARS.forEach(function(c){
    var label=c.name+(c.carNumber?' ['+c.carNumber+']':'')+(c.region?' · '+c.region:'');
    sel.innerHTML+='<option value="'+c.id+'">'+label+'</option>';
  });
}

/* 사진 미리보기 */
var devPhotoDataUrl=null;
var devBlPhotoDataUrl=null;

function devPreviewPhoto(input){
  var file=input.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    devPhotoDataUrl=ev.target.result;
    var p=document.getElementById('dev-photo-preview');
    if(p){ p.src=devPhotoDataUrl; p.style.display='block'; }
  };
  reader.readAsDataURL(file);
}
function devPreviewBlPhoto(input){
  var file=input.files[0]; if(!file) return;
  var reader=new FileReader();
  reader.onload=function(ev){
    devBlPhotoDataUrl=ev.target.result;
    var p=document.getElementById('dev-bl-photo-preview');
    if(p){ p.src=devBlPhotoDataUrl; p.style.display='block'; }
  };
  reader.readAsDataURL(file);
}
window.devPreviewPhoto=devPreviewPhoto;
window.devPreviewBlPhoto=devPreviewBlPhoto;

/* 통합 차량 등록/사진 적용 + 지역 이동 + 차량번호 */
function devApplyOrAddCar(type){
  if(type==='normal'){
    var selEl=document.getElementById('dev-photo-car');
    var selVal=selEl?selEl.value:'';
    var photo=devPhotoDataUrl;
    var regionEl=document.getElementById('dev-add-region');
    var region=regionEl?regionEl.value:'auto';
    var carnumEl=document.getElementById('dev-add-carnum');
    var carnum=carnumEl?carnumEl.value.trim():'';

    if(selVal){
      /* === 기존 차량 업데이트 (사진/지역/번호) === */
      var numId=parseInt(selVal);
      var car=CARS_DATA.find(function(c){return c.id===numId;});
      if(!car){ showToast('차량을 찾을 수 없습니다.'); return; }

      var changed=[];
      if(photo){ car.img=photo; changed.push('사진'); }
      if(region&&region!=='auto'){
        var newLoc=getRandomIncheonLocation(region);
        car.lat=newLoc.lat; car.lng=newLoc.lng; car.region=region;
        changed.push(region+'으로 이동');
      }
      if(carnum){ car.carNumber=carnum; changed.push('번호('+carnum+')'); }

      if(!changed.length){ showToast('변경할 내용을 선택/입력하세요.'); return; }

      saveCarsData();
      devRenderCarSelect(); devRenderCarOverview(); devRenderCarDeleteList();
      renderCars(); updateMapMarkers();

      devPhotoDataUrl=null;
      var pp=document.getElementById('dev-photo-preview'); if(pp) pp.style.display='none';
      if(carnumEl) carnumEl.value='';
      if(regionEl) regionEl.value='auto';

      showToast('✅ '+car.name+' 업데이트: '+changed.join(' · '));
      return;
    }

    /* === 신규 등록 === */
    var nameEl=document.getElementById('dev-add-name');
    var fuelEl=document.getElementById('dev-add-fuel');
    var priceEl=document.getElementById('dev-add-price');
    var optsEl=document.getElementById('dev-add-opts');
    var name=nameEl?nameEl.value.trim():'';
    if(!name){ showToast('차량명을 입력해 주세요.'); return; }

    var autoPrice=getCarPriceByName(name);
    var fuel=fuelEl?fuelEl.value:(autoPrice&&autoPrice.fuel?autoPrice.fuel:'전기');
    var price=getDevNum('dev-add-price')||(autoPrice?autoPrice.pricePerHour:10000);
    var kmRateInp=document.getElementById('dev-add-kmrate');
    var kmRateAuto=kmRateInp&&kmRateInp.value?parseInt(kmRateInp.value):(autoPrice?autoPrice.kmRate:100);
    var opts=optsEl?optsEl.value.trim():'- 기본 옵션';
    var maxId=CARS_DATA.length>0?Math.max.apply(null,CARS_DATA.map(function(c){return c.id;})):0;
    var colors=['#2a4a7a','#3a6a2a','#6a2a2a','#2a5a6a','#5a3a2a','#4a2a6a'];
    var newImg=photo||carSVG(colors[(maxId+1)%colors.length],name.slice(0,7));
    var _loc = getRandomIncheonLocation(region);

    CARS_DATA.push({
      id:maxId+1, name:name, carNumber:carnum,
      nameen:name, nameja:name, namezh:name,
      pricePerHour:price, lat:_loc.lat, lng:_loc.lng, region:_loc.region,
      status:'available', fuel:fuel, kmRate:kmRateAuto,
      fuelFreeKm:fuel==='전기'?0:50, options:opts, img:newImg
    });

    if(nameEl) nameEl.value=''; if(priceEl) priceEl.value=''; if(optsEl) optsEl.value='';
    if(carnumEl) carnumEl.value=''; if(regionEl) regionEl.value='auto';
    devPhotoDataUrl=null;
    var pv=document.getElementById('dev-photo-preview'); if(pv) pv.style.display='none';

    devRenderStats(); devRenderCarSelect(); devRenderCarDeleteList();
    devRenderCarStatusList(); devRenderPriceList(); devRenderCarOverview();
    renderCars();
    saveCarsData();
    showToast('✅ '+name+' 등록 ('+_loc.region+')');

  } else {
    /* === BL 차량 (동일한 패턴) === */
    var blSelEl=document.getElementById('dev-bl-photo-car');
    var blSelVal=blSelEl?blSelEl.value:'';
    var blPhoto=devBlPhotoDataUrl;
    var blRegionEl=document.getElementById('dev-bl-add-region');
    var blRegion=blRegionEl?blRegionEl.value:'auto';
    var blCarnumEl=document.getElementById('dev-bl-add-carnum');
    var blCarnum=blCarnumEl?blCarnumEl.value.trim():'';

    if(blSelVal){
      var blCar=BL_CARS.find(function(c){return c.id===blSelVal;});
      if(!blCar){ showToast('BL 차량을 찾을 수 없습니다.'); return; }
      var bChanged=[];
      if(blPhoto){ blCar.img=blPhoto; bChanged.push('사진'); }
      if(blRegion&&blRegion!=='auto'){
        var bLoc=getRandomIncheonLocation(blRegion);
        blCar.lat=bLoc.lat; blCar.lng=bLoc.lng; blCar.region=blRegion;
        bChanged.push(blRegion+'으로 이동');
      }
      if(blCarnum){ blCar.carNumber=blCarnum; bChanged.push('번호('+blCarnum+')'); }
      if(!bChanged.length){ showToast('변경할 내용을 선택/입력하세요.'); return; }
      saveCarsData(); renderBLCars(); devRenderBlOverview(); devRenderBlCarSelect();
      devBlPhotoDataUrl=null;
      var bpp=document.getElementById('dev-bl-photo-preview'); if(bpp) bpp.style.display='none';
      if(blCarnumEl) blCarnumEl.value=''; if(blRegionEl) blRegionEl.value='auto';
      showToast('✅ '+blCar.name+' 업데이트: '+bChanged.join(' · '));
      return;
    }

    /* BL 신규 */
    var blName=document.getElementById('dev-bl-add-name');
    var blFuel=document.getElementById('dev-bl-add-fuel');
    var blPrice=document.getElementById('dev-bl-add-price');
    var blOpts=document.getElementById('dev-bl-add-opts');
    var blArea=document.getElementById('dev-bl-add-area');
    var nm=blName?blName.value.trim():'';
    if(!nm){ showToast('차량명을 입력해 주세요.'); return; }
    var newBlId='bl'+(Date.now()%100000);
    var blFuelVal=blFuel?blFuel.value:'전기';
    var blImg=blPhoto||carSVG('#1a1c20',nm.slice(0,7));
    var _blLoc = getRandomIncheonLocation(blRegion);

    BL_CARS.push({
      id:newBlId, name:nm, carNumber:blCarnum,
      nameen:nm, nameja:nm, namezh:nm,
      pricePerHour:getDevNum('dev-bl-add-price')||40000,
      fuel:blFuelVal, kmRate:blFuelVal==='전기'?130:0,
      fuelFreeKm:blFuelVal==='전기'?0:100,
      lat:_blLoc.lat, lng:_blLoc.lng, region:_blLoc.region,
      options:blOpts?blOpts.value.trim():'- 프리미엄 옵션',
      area:blArea?blArea.value.trim():'인천', img:blImg
    });

    if(blName) blName.value=''; if(blPrice) blPrice.value='';
    if(blOpts) blOpts.value=''; if(blArea) blArea.value='';
    if(blCarnumEl) blCarnumEl.value=''; if(blRegionEl) blRegionEl.value='auto';
    devBlPhotoDataUrl=null;
    var bpv=document.getElementById('dev-bl-photo-preview'); if(bpv) bpv.style.display='none';
    devRenderStats(); devRenderBlCarSelect(); devRenderBlOverview();
    devRenderCarDeleteList(); renderBLCars();
    saveCarsData();
    showToast('✅ '+nm+' BL 등록 ('+_blLoc.region+')');
  }
}
window.devApplyOrAddCar=devApplyOrAddCar;

/* 차량 추가 */

/* 차량 삭제 — 체크박스 다중 선택 */
var delCheckedNormal=new Set(), delCheckedBL=new Set();

function devSwitchDelTab(tab){
  var tn=document.getElementById('dev-del-tab-normal');
  var tb=document.getElementById('dev-del-tab-bl');
  var ln=document.getElementById('dev-car-delete-list');
  var lb=document.getElementById('dev-bl-delete-list');
  if(tab==='normal'){
    if(tn) tn.classList.add('dev-tab-active');
    if(tb) tb.classList.remove('dev-tab-active');
    if(ln) ln.style.display='';
    if(lb) lb.style.display='none';
  } else {
    if(tn) tn.classList.remove('dev-tab-active');
    if(tb) tb.classList.add('dev-tab-active');
    if(ln) ln.style.display='none';
    if(lb) lb.style.display='';
  }
}
window.devSwitchDelTab=devSwitchDelTab;

function devToggleDelCheck(idRaw, type){
  var id=(type==='normal')?parseInt(idRaw):String(idRaw);
  var set=(type==='normal')?delCheckedNormal:delCheckedBL;
  if(set.has(id)) set.delete(id); else set.add(id);
  devRenderCarDeleteList();
}
window.devToggleDelCheck=devToggleDelCheck;

function devRenderCarDeleteList(){
  /* 일반 차량 */
  var list=document.getElementById('dev-car-delete-list'); if(!list) return;
  list.innerHTML='';
  if(!CARS_DATA.length){
    list.innerHTML='<div class="dev-row"><span class="dev-label">등록된 차량 없음</span></div>';
  } else {
    CARS_DATA.forEach(function(car){
      var chk=delCheckedNormal.has(car.id);
      var row=document.createElement('div'); row.className='dev-row';
      row.style.cssText='cursor:pointer;'+(chk?'background:rgba(200,50,50,.12);':'');
      row.onclick=function(){ devToggleDelCheck(car.id,'normal'); };
      row.innerHTML=
        '<label class="dev-del-chk" onclick="event.stopPropagation()">'+
          '<input type="checkbox" '+(chk?'checked':'')+' onchange="devToggleDelCheck('+car.id+',\'normal\')"/>'+
          '<span class="dev-del-chk-box"></span>'+
        '</label>'+
        '<img src="'+car.img+'" style="width:34px;height:26px;object-fit:contain;border-radius:14px;background:#1a2030;flex-shrink:0;"/>'+
        '<span class="dev-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+car.name+'</span>'+
        '<span style="font-size:.68rem;color:rgba(91,200,255,.4);flex-shrink:0;">'+car.pricePerHour.toLocaleString()+'원/h</span>';
      list.appendChild(row);
    });
  }
  /* 선택 카운트 표시 */
  var nb=document.getElementById('dev-del-count-normal');
  if(nb) nb.textContent=delCheckedNormal.size?'('+delCheckedNormal.size+'개 선택)':'';

  /* 카로 더 블랙 */
  var blList=document.getElementById('dev-bl-delete-list'); if(!blList) return;
  blList.innerHTML='';
  if(!BL_CARS.length){
    blList.innerHTML='<div class="dev-row"><span class="dev-label">등록된 BL 차량 없음</span></div>';
  } else {
    BL_CARS.forEach(function(car){
      var chk=delCheckedBL.has(car.id);
      var row=document.createElement('div'); row.className='dev-row';
      row.style.cssText='cursor:pointer;'+(chk?'background:rgba(200,50,50,.12);':'');
      row.onclick=function(){ devToggleDelCheck(car.id,'bl'); };
      row.innerHTML=
        '<label class="dev-del-chk" onclick="event.stopPropagation()">'+
          '<input type="checkbox" '+(chk?'checked':'')+' onchange="devToggleDelCheck(\''+car.id+'\',\'bl\')"/>'+
          '<span class="dev-del-chk-box"></span>'+
        '</label>'+
        '<img src="'+car.img+'" style="width:34px;height:26px;object-fit:contain;border-radius:14px;background:#1a1c20;flex-shrink:0;"/>'+
        '<span class="dev-label" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:rgba(200,169,110,.85);">'+car.name+'</span>'+
        '<span style="font-size:.68rem;color:rgba(200,169,110,.4);flex-shrink:0;">'+car.pricePerHour.toLocaleString()+'원/h</span>';
      blList.appendChild(row);
    });
  }
  var bb=document.getElementById('dev-del-count-bl');
  if(bb) bb.textContent=delCheckedBL.size?'('+delCheckedBL.size+'개 선택)':'';
}

function devSaveDelete(){
  var total=delCheckedNormal.size+delCheckedBL.size;
  if(!total){ showToast('삭제할 차량을 체크해 주세요.'); return; }
  /* 일반 삭제 */
  delCheckedNormal.forEach(function(id){
    var idx=CARS_DATA.findIndex(function(c){return c.id===id;});
    if(idx>=0) CARS_DATA.splice(idx,1);
  });
  delCheckedNormal.clear();
  /* BL 삭제 */
  delCheckedBL.forEach(function(id){
    var idx=BL_CARS.findIndex(function(c){return c.id===id;});
    if(idx>=0) BL_CARS.splice(idx,1);
  });
  delCheckedBL.clear();
  saveCarsData();showToast('🗑 '+total+'개 차량이 삭제되었습니다.');
  /* 즉시 전체 반영 */
  devRenderStats(); devRenderCarSelect(); devRenderBlCarSelect();
  devRenderCarDeleteList(); devRenderCarStatusList(); devRenderPriceList();
  devRenderCarOverview(); devRenderBlOverview(); devRenderSwapDropdowns();
  renderCars(); renderBLCars(); updateMapMarkers();
}
window.devSaveDelete=devSaveDelete;
function devDeleteCar(carId){
  var idx=CARS_DATA.findIndex(function(c){return c.id===carId;});
  if(idx<0) return;
  var name=CARS_DATA[idx].name;
  CARS_DATA.splice(idx,1);
  devRenderStats();
  devRenderCarSelect();
  devRenderCarDeleteList();
  devRenderCarStatusList();
  devRenderPriceList();
  devRenderCarOverview();
  devRenderSwapDropdowns();
  renderCars();
  showToast('🗑 '+name+' 차량이 삭제되었습니다.');
}
window.devDeleteCar=devDeleteCar;

/* 차량 상태 변경 */
function devRenderCarStatusList(){
  var list=document.getElementById('dev-car-status-list'); if(!list) return;
  list.innerHTML='';
  CARS_DATA.forEach(function(car){
    var isDisabled=car.devDisabled;
    var status=isDisabled?'disabled':(car.status==='available'?'ok':'busy');
    var statusTxt=isDisabled?'점검 중':(car.status==='available'?'이용 가능':'이용 중');
    var row=document.createElement('div'); row.className='dev-row';
    row.innerHTML=
      '<span class="dev-label" style="flex:1;">'+car.name+'</span>'+
      '<span class="dev-status-badge dev-status-'+status+'">'+statusTxt+'</span>'+
      '<button class="dev-btn '+(isDisabled?'dev-btn-primary':'dev-btn-danger')+'" onclick="devToggleCarStatus('+car.id+')">'+(isDisabled?'✅ 복구':'🚫 사용 불가')+'</button>';
    list.appendChild(row);
  });
}
function devToggleCarStatus(carId){
  var car=CARS_DATA.find(function(c){return c.id===carId;});
  var isBL=false;
  if(!car && window.BL_CARS){ car=BL_CARS.find(function(c){return c.id===carId;}); isBL=!!car; }
  if(!car) return;
  car.devDisabled=!car.devDisabled;
  car.status=car.devDisabled?'unavailable':'available';
  devRenderCarStatusList();
  renderCars();
  /* Firestore 저장 → 어드민(admin.html)·다른 기기와 동기화 */
  try{
    if(typeof fbReady==='function' && fbReady() && window.FB_FN && window.FB_DB && typeof FB_FN.setDoc==='function'){
      fsLastWriteTime=Date.now();
      var col=isBL?FS_BL_COL:FS_CARS_COL;
      FB_FN.setDoc(FB_FN.doc(FB_DB, col, String(car.id)), { status:car.status, devDisabled:car.devDisabled }, { merge:true })
        .catch(function(e){
          console.error('차량 상태 저장 실패:', e);
          var code=(e&&e.code)||'';
          if(/permission|denied/i.test(code)) showToast('저장 권한이 없어요 · Firestore 보안 규칙을 확인하세요');
          else showToast('저장 실패 · 네트워크를 확인하세요');
        });
    }
  }catch(e){ console.error(e); }
  showToast(car.devDisabled?('🚫 '+car.name+' 사용 불가 처리됨'):('✅ '+car.name+' 이용 가능으로 복구됨'));
}
window.devToggleCarStatus=devToggleCarStatus;

/* 예약 차량 강제 변경 */
function devRenderSwapDropdowns(){
  var resSel=document.getElementById('dev-swap-res');
  var carSel=document.getElementById('dev-swap-car');
  if(!resSel||!carSel) return;
  resSel.innerHTML='<option value="">예약 선택</option>';
  myReservations.forEach(function(r,i){
    if(!r.returned) resSel.innerHTML+='<option value="'+i+'">'+r.bookNo+' — '+r.car.name+'</option>';
  });
  carSel.innerHTML='<option value="">변경할 차량 선택</option>';
  CARS_DATA.forEach(function(c){
    var ok=c.status==='available'&&!c.devDisabled;
    if(ok) carSel.innerHTML+='<option value="'+c.id+'">'+c.name+'</option>';
  });
}
function devSwapCar(){
  var resIdx=parseInt(document.getElementById('dev-swap-res').value);
  var carId=parseInt(document.getElementById('dev-swap-car').value);
  if(isNaN(resIdx)||isNaN(carId)){ showToast('예약과 차량을 선택해 주세요.'); return; }
  var r=myReservations[resIdx];
  var newCar=CARS_DATA.find(function(c){return c.id===carId;});
  if(!r||!newCar){ showToast('선택 오류'); return; }
  var oldName=r.car.name;
  r.car=newCar;
  devRenderSwapDropdowns();
  renderMyReservations();
  showToast('✅ '+r.bookNo+': '+oldName+' → '+newCar.name+' 변경 완료');
}
window.devSwapCar=devSwapCar;

/* 요금 설정 */
function devRenderPriceList(){
  var list=document.getElementById('dev-price-list'); if(!list) return;
  list.innerHTML='';
  /* 헤더 */
  var hdr=document.createElement('div');
  hdr.className='dev-row';
  hdr.style.cssText='background:rgba(91,200,255,.06);';
  hdr.innerHTML=
    '<span style="flex:1;font-size:.68rem;color:rgba(91,200,255,.5);font-weight:700;">차량명</span>'+
    '<span style="width:74px;font-size:.68rem;color:rgba(91,200,255,.5);font-weight:700;text-align:center;flex:none;">대여/h</span>'+
    '<span style="width:62px;font-size:.68rem;color:rgba(91,200,255,.5);font-weight:700;text-align:center;flex:none;">km요금</span>';
  list.appendChild(hdr);
  /* 일반 차량 */
  CARS_DATA.forEach(function(car){
    var row=document.createElement('div'); row.className='dev-row';
    row.innerHTML=
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:.78rem;color:rgba(180,220,255,.85);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+car.name+'</div>'+
        '<div style="font-size:.64rem;color:rgba(91,200,255,.4);">'+car.fuel+(car.fuel==='전기'?' · 전기차':' · 유류')+'</div>'+
      '</div>'+
      '<input class="dev-input" id="dev-price-'+car.id+'" type="number" value="'+car.pricePerHour+'" style="width:70px;flex:none;text-align:center;" placeholder="원/h"/>'+
      '<input class="dev-input" id="dev-km-'+car.id+'" type="number" value="'+(car.kmRate||0)+'" style="width:58px;flex:none;text-align:center;" placeholder="원/km" '+(car.fuel!=='전기'?'disabled style="width:58px;flex:none;text-align:center;opacity:.35;"':'')+'/>';
    list.appendChild(row);
  });
  /* BL 차량 구분선 */
  var blHdr=document.createElement('div');
  blHdr.className='dev-row';
  blHdr.style.cssText='background:rgba(200,169,110,.06);';
  blHdr.innerHTML='<span style="flex:1;font-size:.68rem;color:rgba(200,169,110,.5);font-weight:700;">⭐ 카로 더 블랙 차량</span>';
  list.appendChild(blHdr);
  BL_CARS.forEach(function(car,i){
    var row=document.createElement('div'); row.className='dev-row';
    row.innerHTML=
      '<div style="flex:1;min-width:0;">'+
        '<div style="font-size:.78rem;color:rgba(200,169,110,.85);font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+car.name+'</div>'+
        '<div style="font-size:.64rem;color:rgba(200,169,110,.4);">'+car.fuel+' · 카로 더 블랙</div>'+
      '</div>'+
      '<input class="dev-input" id="dev-bl-price-'+i+'" type="number" value="'+car.pricePerHour+'" style="width:70px;flex:none;text-align:center;" placeholder="원/h"/>'+
      '<span style="width:58px;flex:none;text-align:center;font-size:.64rem;color:rgba(91,200,255,.3);">—</span>';
    list.appendChild(row);
  });
}
function devSavePrices(){
  var changed=[];
  CARS_DATA.forEach(function(car){
    var pr=document.getElementById('dev-price-'+car.id);
    var km=document.getElementById('dev-km-'+car.id);
    if(pr){var v=parseInt(pr.value);if(!isNaN(v)&&v>0&&v!==car.pricePerHour){car.pricePerHour=v;changed.push(car.name);}}
    if(km&&car.fuel==='전기'){var k=parseInt(km.value);if(!isNaN(k)&&k>=0)car.kmRate=k;}
  });
  BL_CARS.forEach(function(car,i){
    var pr=document.getElementById('dev-bl-price-'+i);
    if(pr){var v=parseInt(pr.value);if(!isNaN(v)&&v>0&&v!==car.pricePerHour){car.pricePerHour=v;changed.push(car.name);}}
  });
  renderCars(); renderBLCars();
  if(changed.length) showToast('✅ 요금 저장: '+changed.join(', '));
  else showToast('변경된 요금이 없습니다.');
}
window.devSavePrices=devSavePrices;
/* 개발자 콘솔 숫자 콤마 포맷 */
function fmtDevNum(el){
  var raw=el.value.replace(/[^0-9]/g,'');
  el.value=raw?parseInt(raw).toLocaleString():'';
}
function getDevNum(id){
  var el=document.getElementById(id);
  if(!el) return 0;
  var raw=(el.value||'').replace(/[^0-9]/g,'');
  return raw?parseInt(raw):0;
}
window.fmtDevNum=fmtDevNum;
window.getDevNum=getDevNum;

function calcHourlyFromDaily(){
  var daily=getDevNum('dev-add-daily');
  var prev=document.getElementById('dev-add-hourly-preview');
  if(prev) prev.textContent=daily>0?Math.round(daily/24).toLocaleString()+'원/h':'—원/h';
}
function applyDailyToHourly(){
  var daily=getDevNum('dev-add-daily');
  if(!daily){ showToast('하루 요금을 입력해 주세요.'); return; }
  var hourly=Math.round(daily/24);
  var priceEl=document.getElementById('dev-add-price');
  if(priceEl){ priceEl.value=hourly.toLocaleString(); }
  showToast('✅ 시간당 '+hourly.toLocaleString()+'원 자동 적용됨');
}
window.calcHourlyFromDaily=calcHourlyFromDaily;
window.applyDailyToHourly=applyDailyToHourly;

function calcBlHourlyFromDaily(){
  var daily=getDevNum('dev-bl-add-daily');
  var prev=document.getElementById('dev-bl-add-hourly-preview');
  if(prev) prev.textContent=daily>0?Math.round(daily/24).toLocaleString()+'원/h':'—원/h';
}
function applyBlDailyToHourly(){
  var daily=getDevNum('dev-bl-add-daily');
  if(!daily){ showToast('하루 요금을 입력해 주세요.'); return; }
  var hourly=Math.round(daily/24);
  var priceEl=document.getElementById('dev-bl-add-price');
  if(priceEl){ priceEl.value=hourly.toLocaleString(); }
  showToast('✅ 시간당 '+hourly.toLocaleString()+'원 자동 적용됨');
}
window.calcBlHourlyFromDaily=calcBlHourlyFromDaily;
window.applyBlDailyToHourly=applyBlDailyToHourly;
/* 면책 상품 설정 */
function devRenderInsList(){
  var list=document.getElementById('dev-ins-list'); if(!list) return;
  list.innerHTML='';
  INSURANCE.forEach(function(ins,i){
    var row=document.createElement('div'); row.className='dev-row'; row.style.flexWrap='wrap';row.style.gap='6px';
    row.innerHTML=
      '<span class="dev-label" style="width:100%;">'+ins.name+'</span>'+
      '<input class="dev-input" id="dev-ins-name-'+i+'" value="'+ins.name+'" placeholder="상품명" style="flex:1;min-width:100px;"/>'+
      '<input class="dev-input" id="dev-ins-price-'+i+'" type="number" value="'+ins.pricePerHour+'" placeholder="원/h" style="width:70px;flex:none;"/>'+
      '<span style="font-size:.72rem;color:rgba(100,180,255,.5);">원/h</span>';
    list.appendChild(row);
  });
}
function devSaveInsurance(){
  var changed=[];
  INSURANCE.forEach(function(ins,i){
    var nm=document.getElementById('dev-ins-name-'+i);
    var pr=document.getElementById('dev-ins-price-'+i);
    if(nm&&nm.value.trim()) ins.name=nm.value.trim();
    if(pr){var v=parseInt(pr.value); if(!isNaN(v)&&v>=0) ins.pricePerHour=v;}
    changed.push(ins.name);
  });
  renderInsurance();
  showToast('✅ 면책 상품 저장 완료');
}
window.devSaveInsurance=devSaveInsurance;

/* 공지사항 관리 */
function devRenderNoticeList(){
  var list=document.getElementById('dev-notice-list'); if(!list) return;
  list.innerHTML='';
  NOTICES.forEach(function(n,i){
    var row=document.createElement('div'); row.className='dev-row'; row.style.flexWrap='wrap';row.style.gap='6px';
    row.innerHTML=
      '<input class="dev-input" id="dev-notice-title-'+i+'" value="'+n.title+'" style="flex:1;"/>'+
      '<button class="dev-btn dev-btn-primary" onclick="devSaveNotice('+i+')">저장</button>'+
      '<button class="dev-btn dev-btn-danger" onclick="devDeleteNotice('+i+')">삭제</button>';
    list.appendChild(row);
  });
}
function devSaveNotice(i){
  var inp=document.getElementById('dev-notice-title-'+i);
  if(inp&&inp.value.trim()){
    NOTICES[i].title=inp.value.trim();
    /* 홈 화면 공지 텍스트 즉시 반영 */
    var items=document.querySelectorAll('.home-notice-item .notice-text');
    if(items[i]) items[i].textContent=NOTICES[i].title;
    showToast('✅ 공지 저장됨');
  }
}
function devDeleteNotice(i){
  NOTICES.splice(i,1);
  devRenderNoticeList();
  /* 홈 공지 목록 재렌더 */
  var nl=document.querySelector('.home-notice-list');
  if(nl){
    var items=nl.querySelectorAll('.home-notice-item');
    if(items[i]) items[i].style.display='none';
  }
  showToast('🗑 공지 삭제됨');
}
function devAddNotice(){
  NOTICES.push({title:'새 공지사항',body:'<p>내용을 입력하세요.</p>'});
  devRenderNoticeList();
  showToast('+ 공지 추가됨. 제목을 수정 후 저장하세요.');
}
window.devSaveNotice=devSaveNotice;
window.devDeleteNotice=devDeleteNotice;
window.devAddNotice=devAddNotice;

/* 이벤트 배너 관리 */
function devRenderEventList(){
  var list=document.getElementById('dev-event-list'); if(!list) return;
  list.innerHTML='';
  EVENT_DETAILS.forEach(function(ev,i){
    var row=document.createElement('div'); row.className='dev-row'; row.style.flexWrap='wrap';row.style.gap='6px';
    row.innerHTML=
      '<input class="dev-input" id="dev-ev-title-'+i+'" value="'+ev.title+'" style="flex:1;"/>'+
      '<input class="dev-input" id="dev-ev-period-'+i+'" value="'+(ev.period||'')+'" placeholder="기간" style="width:120px;flex:none;"/>'+
      '<button class="dev-btn dev-btn-primary" onclick="devSaveEvent('+i+')">저장</button>'+
      '<button class="dev-btn dev-btn-danger" onclick="devDeleteEvent('+i+')">삭제</button>';
    list.appendChild(row);
  });
}
function devSaveEvent(i){
  var title=document.getElementById('dev-ev-title-'+i);
  var period=document.getElementById('dev-ev-period-'+i);
  if(title&&title.value.trim()) EVENT_DETAILS[i].title=title.value.trim();
  if(period&&period.value.trim()) EVENT_DETAILS[i].period=period.value.trim();
  /* 이벤트 화면 카드 즉시 반영 */
  var cards=document.querySelectorAll('.ev-card-title');
  if(cards[i]) cards[i].textContent=EVENT_DETAILS[i].title;
  var periods=document.querySelectorAll('.ev-card-period');
  if(periods[i]) periods[i].textContent=EVENT_DETAILS[i].period;
  showToast('✅ 이벤트 저장됨');
}
function devDeleteEvent(i){
  EVENT_DETAILS.splice(i,1);
  devRenderEventList();
  showToast('🗑 이벤트 삭제됨');
}
function devAddEvent(){
  EVENT_DETAILS.push({title:'새 이벤트',titleen:'New Event',body:'<p>내용을 입력하세요.</p>',period:'상시'});
  devRenderEventList();
  showToast('+ 이벤트 추가됨.');
}
window.devSaveEvent=devSaveEvent;
window.devDeleteEvent=devDeleteEvent;
window.devAddEvent=devAddEvent;

/* 카로 더 블랙 차량 관리 */

/* 개발자 권한 부여 */
function devGrantAccess(){
  var id=document.getElementById('dev-new-dev-id');
  if(!id||!id.value.trim()){ showToast('아이디를 입력하세요.'); return; }
  showToast('✅ '+id.value.trim()+' 개발자 권한 부여 완료 (데모)');
  id.value='';
}
window.devGrantAccess=devGrantAccess;

/* 앱 버전 업데이트 */
function devUpdateVersion(){
  var inp=document.getElementById('dev-new-version');
  var cur=document.getElementById('dev-version');
  if(!inp||!inp.value.trim()){ showToast('버전을 입력하세요.'); return; }
  var v=inp.value.trim();
  if(cur) cur.textContent=v;
  inp.value='';
  showToast('✅ 앱 버전 '+v+'로 업데이트됨');
}
window.devUpdateVersion=devUpdateVersion;

/* 개발자 모달 공통 */
function closeDevModal(e){
  if(e&&e.target!==document.getElementById('dev-modal')) return;
  closeModal('dev-modal');
}
window.closeDevModal=closeDevModal;

/* 기존 devFeature는 더 이상 사용 안 함 — 오류 방지용 남김 */
function devFeature(name){ showToast('⚠ devFeature("'+name+'") — 이미 교체됨'); }
window.devFeature=devFeature;
window.renderDevScreen=renderDevScreen;

/* ─────────────────────────────────────────────
   홈 화면 컨트롤러 바텀시트
───────────────────────────────────────────── */
var homeCtrlTimer=null;

function setCtrlButtonsActive(active){
  var ids=['ctrl-btn-unlock','ctrl-btn-lock','ctrl-btn-hazard','ctrl-photo-toggle',
           'ctrl-btn-locate','ctrl-btn-extend','ctrl-btn-return'];
  ids.forEach(function(id){
      var btn=document.getElementById(id);
      if(!btn) return;
      /* 주행전 사진 버튼은 촬영완료 후 별도 관리 */
      if(id==='ctrl-photo-toggle'&&active){
            if(btn.getAttribute('data-photo-done')==='1') return;
            btn.classList.remove('ctrl-sq-disabled');
            btn.disabled=false;
            btn.style.opacity='';
            btn.style.pointerEvents='';
            return;
          }
      if(id==='ctrl-photo-toggle'&&!active){
        btn.disabled=true;
        btn.classList.add('ctrl-sq-disabled');
        return;
      }
      btn.disabled=!active;
      btn.classList.toggle('ctrl-sq-disabled',!active);
    });
}

function openHomeCtrl(){
  var now=new Date();
  var activeRes=null;
  var activeIdx=-1;
  /* 반납 안 된 예약 중 가장 최근 것을 표시 */
  var now2=new Date();
    myReservations.forEach(function(r,i){
      if(!r.returned && r.start && r.end){
        var rActive=now2>=r.start&&now2<=r.end;
        var prevActive=activeRes&&now2>=activeRes.start&&now2<=activeRes.end;
        if(!activeRes){
          activeRes=r; activeIdx=i;
        } else if(rActive&&!prevActive){
          /* 현재 진행 중인 예약 우선 */
          activeRes=r; activeIdx=i;
        } else if(!rActive&&!prevActive&&r.start<activeRes.start){
                  /* 둘 다 미래면 더 가까운 예약 우선 */
                  activeRes=r; activeIdx=i;
                }
      }
    });
  ctrlResIdx=activeIdx;

  var carName=document.getElementById('home-ctrl-car-name');
  var park=document.getElementById('home-ctrl-park');
  var notice=document.getElementById('home-ctrl-notice');
  var noRes=document.getElementById('home-ctrl-no-res');
  var resInfo=document.getElementById('home-ctrl-res-info');

  if(activeRes){
    /* 대여 시작 10분 전부터 버튼 활성화 (사진 촬영 시간 확보) */
    var isStarted=(activeRes.start-now)<=10*60*1000;
  setCtrlButtonsActive(isStarted);
    if(isStarted){var pb=document.getElementById('ctrl-photo-toggle');if(pb){pb.disabled=false;pb.style.opacity='';pb.style.pointerEvents='';}}

    var name=getCarName(activeRes.car);
    if(noRes) noRes.style.display='none';
    if(resInfo) resInfo.style.display='flex';
    if(carName) carName.textContent=name;
    var floors=['B1','B2','B2','B3','1F'], spots=['12번','23번','47번','55번','08번'];
    /* 차량번호 표시 — 사용 10분 전부터 */
        var minsToStart=(activeRes.start-now)/60000;
        var showCarNum=minsToStart<=10 && activeRes.car.carNumber;
        if(showCarNum && carName){
          carName.innerHTML=name+'<br><span style="font-size:.85rem;color:#1a6cff;font-weight:700;letter-spacing:.05em;">🚗 '+activeRes.car.carNumber+'</span>';
        }
    var hash=activeRes.bookNo.charCodeAt(activeRes.bookNo.length-1)%5;
    var pkText=floors[hash]+' · '+spots[hash]+' 구역';
    if(park) park.textContent=pkText;
    /* 시작 전이면 안내 문구 표시 */
    if(notice) notice.textContent=isStarted?'':'대여 시작 10분 전부터 버튼이 활성화됩니다';
    if(notice) notice.style.display='block';
    var dur=document.getElementById('home-ctrl-duration');
    if(dur){
      var s=activeRes.start, e=activeRes.end;
      var p=function(n){return n<10?'0'+n:n;};
      dur.textContent=(s.getMonth()+1)+'/'+p(s.getDate())+' '+p(s.getHours())+':'+p(s.getMinutes())+' ~ '+(e.getMonth()+1)+'/'+p(e.getDate())+' '+p(e.getHours())+':'+p(e.getMinutes());
    }
    var extEl=document.getElementById('home-ctrl-extend-info');
    if(extEl) extEl.textContent=activeRes.extendedMins?'+'+fmtExtendedMins(activeRes.extendedMins)+' 연장됨':'';
    startHomeCtrlTimer(activeRes.start, activeRes.end);
  } else {
    setCtrlButtonsActive(false);
    if(noRes){ noRes.style.display='block'; noRes.textContent='예약된 차량 없음'; }
    if(resInfo) resInfo.style.display='none';
    if(notice){ notice.style.display='block'; notice.textContent='예약 후 대여 시작 시각에 버튼이 활성화됩니다'; }
    var tm=document.getElementById('home-ctrl-timer');
    if(tm){ tm.textContent='—'; tm.style.color='var(--text-m)'; }
  }
  openModal('home-ctrl-modal');
}

function startHomeCtrlTimer(startTime, endTime){
  if(homeCtrlTimer) clearInterval(homeCtrlTimer);
  var el=document.getElementById('home-ctrl-timer'); if(!el) return;
  function pad(n){return n<10?'0'+n:n;}
  function tick(){
    var now=new Date();
    var diff=startTime.getTime()-now.getTime();
    if(diff<=0 && endTime){
      var remain=endTime.getTime()-now.getTime();
      if(remain<=0){ el.textContent='반납 필요'; el.style.color='#b23a3a'; el.style.fontWeight='700'; return; }
      var d=Math.floor(remain/86400000);
      var h=Math.floor((remain%86400000)/3600000);
      var m=Math.floor((remain%3600000)/60000);
      var s=Math.floor((remain%60000)/1000);
      if(d>0) el.textContent=d+'일 '+pad(h)+'시 '+pad(m)+'분';
      else if(h>0) el.textContent=pad(h)+'시간 '+pad(m)+'분 '+pad(s)+'초';
      else el.textContent=pad(m)+'분 '+pad(s)+'초';
      el.style.fontWeight='';
      el.style.color='#ff9966';
    } else if(diff>0){
      var d2=Math.floor(diff/86400000);
      var h2=Math.floor((diff%86400000)/3600000);
      var m2=Math.floor((diff%3600000)/60000);
      if(d2>0) el.textContent=d2+'일 '+pad(h2)+'시간 '+pad(m2)+'분 후 시작';
      else if(h2>0) el.textContent=pad(h2)+'시간 '+pad(m2)+'분 후 시작';
      else el.textContent=pad(m2)+'분 후 시작';
      el.style.color='#c8a96e';
      el.style.fontWeight='';
    }
  }
  tick(); homeCtrlTimer=setInterval(tick,1000);
}


function closeHomeCtrl(e){
  if(e){
    var box=document.querySelector('#home-ctrl-modal .modal-box');
    if(box&&box.contains(e.target)&&e.target!==document.getElementById('home-ctrl-modal')) return;
  }
  if(homeCtrlTimer){clearInterval(homeCtrlTimer);homeCtrlTimer=null;}
  ctrlPhotoOpen=false;
  var tb=document.getElementById('ctrl-photo-toggle');
  if(tb) tb.classList.remove('ctrl-sq-btn-active');
  closeModal('home-ctrl-modal');
}
function closeHomeCtrlDirect(){
  if(homeCtrlTimer){clearInterval(homeCtrlTimer);homeCtrlTimer=null;}
  ctrlPhotoOpen=false;
  var tb=document.getElementById('ctrl-photo-toggle');
  if(tb) tb.classList.remove('ctrl-sq-btn-active');
  closeModal('home-ctrl-modal');
}

/* ── 시간 연장 바텀시트 ── */
var selectedExtendMins=0;

window.ctrlAction=ctrlActionHome; /* ctrlActionHome으로 통합 */

function openExtendSheet(){
  selectedExtendMins=0;
  /* 현재 예약 정보 가져오기 */
  var res=ctrlResIdx>=0?myReservations[ctrlResIdx]:null;
  var car=res?res.car:null;
  var ins=res?res.ins:INSURANCE[0];
  var carRate=car?car.pricePerHour:0;
  var insRate=ins?ins.pricePerHour:0;
  /* 안내 정보 */
  var info=document.getElementById('ext-info');
  if(info){
    if(car) info.innerHTML='<strong>'+getCarName(car)+'</strong> · 대여 '+carRate.toLocaleString()+'원/h · 보험 '+insRate.toLocaleString()+'원/h';
    else info.textContent='예약 정보를 불러올 수 없습니다.';
  }
  /* 옵션 그리드 생성 */
  var grid=document.getElementById('ext-grid');
  if(grid){
    grid.innerHTML='';
    [10,20,30,40,50,60].forEach(function(m){
      var carCost=Math.round(carRate*(m/60));
      var insCost=Math.round(insRate*(m/60));
      var total=carCost+insCost;
      var btn=document.createElement('div');
      btn.className='extend-option';
      btn.setAttribute('data-mins',m);
      btn.innerHTML='<span class="ext-min">+'+m+'분</span><span class="ext-cost">'+total.toLocaleString()+'원</span>';
      btn.onclick=function(){
        selectedExtendMins=m;
        document.querySelectorAll('.extend-option').forEach(function(b){ b.classList.remove('selected'); });
        btn.classList.add('selected');
        /* 상세 금액 표시 */
        var box=document.getElementById('ext-confirm-box');
        if(box) box.classList.add('show');
        var el=function(id){return document.getElementById(id);};
        if(el('ext-conf-time')) el('ext-conf-time').textContent=m+'분';
        if(el('ext-conf-car')) el('ext-conf-car').textContent=carCost.toLocaleString()+'원';
        if(el('ext-conf-ins')) el('ext-conf-ins').textContent=insCost.toLocaleString()+'원';
        if(el('ext-conf-total')) el('ext-conf-total').textContent=total.toLocaleString()+'원';
        /* 예약 종료 시각 미리보기 */
        if(res){
          var previewEnd=new Date(res.end.getTime()+m*60000);
          var p2=function(n){return n<10?'0'+n:n;};
          var previewStr=(previewEnd.getMonth()+1)+'/'+p2(previewEnd.getDate())+' '+p2(previewEnd.getHours())+':'+p2(previewEnd.getMinutes());
          if(el('ext-conf-time')) el('ext-conf-time').textContent=m+'분  →  반납 '+previewStr;
        }
      };
      grid.appendChild(btn);
    });
  }
  var box=document.getElementById('ext-confirm-box');
  if(box) box.classList.remove('show');
  /* 바텀시트 열기 */
  var sheet=document.getElementById('extend-sheet');
  var overlay=document.getElementById('ext-overlay');
  if(sheet) sheet.classList.add('open');
  if(overlay) overlay.classList.add('show');
}

function closeExtendSheet(){
  var sheet=document.getElementById('extend-sheet');
  var overlay=document.getElementById('ext-overlay');
  if(sheet) sheet.classList.remove('open');
  if(overlay) overlay.classList.remove('show');
  selectedExtendMins=0;
}

/* 연장 시간 포맷 (00시간 00분 형식) */
function fmtExtendedMins(totalMins){
  var h=Math.floor(totalMins/60), m=totalMins%60;
  if(h>0 && m>0) return h+'시간 '+m+'분';
  if(h>0) return h+'시간';
  return m+'분';
}
function confirmExtendSheet(){
  if(!selectedExtendMins){ showToast('연장 시간을 선택해 주세요.'); return; }
  var mins=selectedExtendMins;
  closeExtendSheet();
  if(ctrlResIdx>=0&&myReservations[ctrlResIdx]){
    var r=myReservations[ctrlResIdx];
    r.end=new Date(r.end.getTime()+mins*60000);
    r.extendedMins=(r.extendedMins||0)+mins;
    startHomeCtrlTimer(r.start, r.end);
    var p=function(n){return n<10?'0'+n:n;};
    var s=r.start, e=r.end;
    var dur=document.getElementById('home-ctrl-duration');
    if(dur) dur.textContent=(s.getMonth()+1)+'/'+p(s.getDate())+' '+p(s.getHours())+':'+p(s.getMinutes())+' ~ '+(e.getMonth()+1)+'/'+p(e.getDate())+' '+p(e.getHours())+':'+p(e.getMinutes());
    var extEl=document.getElementById('home-ctrl-extend-info');
    if(extEl) extEl.textContent='+'+fmtExtendedMins(r.extendedMins)+' 연장됨';
    renderMyReservations();
    saveUserData();
    showToast(fmtExtendedMins(mins)+' 연장  반납: '+(e.getMonth()+1)+'/'+p(e.getDate())+' '+p(e.getHours())+':'+p(e.getMinutes()));
  } else {
    showToast(fmtExtendedMins(mins)+' 연장 완료되었습니다.');
  }
}

window.openExtendSheet=openExtendSheet;
window.closeExtendSheet=closeExtendSheet;
window.confirmExtendSheet=confirmExtendSheet;

/* ── 사진 촬영 모달 ── */
/* ── 사진 촬영 시스템 (방향별 최대 5장) ── */
var pcarPhotos={front:[],rear:[],left:[],right:[],misc:[]};
var pcarCurrentSide='front';
var pcarSideLabels={front:'전면 촬영',rear:'후면 촬영',left:'좌측 촬영',right:'우측 촬영',misc:'기타 부위 촬영'};

function openPhotoModal(){
  /* 초기화 */
  ['front','rear','left','right','misc'].forEach(function(side){
    pcarPhotos[side]=[];
    var cnt=document.getElementById('pcar-count-'+side);
    if(cnt) cnt.textContent='0/5';
    var btn=document.getElementById('pcar-btn-'+side);
    if(btn) btn.classList.remove('pcar-done');
  });
  var overlay=document.getElementById('photo-modal-overlay');
  if(overlay) overlay.classList.add('open');
}

function openSideCapture(side){
  pcarCurrentSide=side;
  var label = pcarSideLabels[side]||side;
  var title=document.getElementById('side-capture-title');
  if(title) title.textContent=label;
  /* 카메라 버튼 텍스트를 해당 방향 이름으로 */
  var btnLabel=document.getElementById('side-cam-label-text');
  if(btnLabel) btnLabel.textContent=label;
  renderSideThumbs();
  var overlay=document.getElementById('side-capture-overlay');
  if(overlay) overlay.classList.add('open');
}

function renderSideThumbs(){
  var row=document.getElementById('side-thumb-row'); if(!row) return;
  var photos=pcarPhotos[pcarCurrentSide]||[];
  row.innerHTML='';
  photos.forEach(function(src,i){
    var wrap=document.createElement('div');
    wrap.className='side-thumb-wrap';
    wrap.innerHTML=
      '<img src="'+src+'" class="side-thumb-img"/>'+
      '<button class="side-thumb-del" onclick="deleteSidePhoto('+i+')">✕</button>';
    row.appendChild(wrap);
  });
  /* 빈 슬롯 */
  var empty=5-photos.length;
  for(var j=0;j<empty;j++){
    var em=document.createElement('div');
    em.className='side-thumb-empty';
    em.innerHTML='<span style="font-size:1.4rem;color:var(--border);">+</span>';
    row.appendChild(em);
  }
  /* 추가 버튼 상태 업데이트 */
  var addBtn=document.getElementById('side-add-btn');
  if(addBtn) addBtn.disabled=photos.length>=5;
}

/* ── 간이 카메라 (1회 촬영용 — 대체주차 등) ── */
function _openSimpleCam(callback){
  /* Android Bridge */
  if(_hasAndroidBridge && _hasAndroidBridge()){
    window._simpleCamCallback = callback;
    window.onAndroidSimplePhoto = function(dataUrl){
      window._simpleCamCallback = null;
      callback(dataUrl);
    };
    if(window.Android && window.Android.captureSimplePhoto)
      window.Android.captureSimplePhoto();
    return;
  }
  /* getUserMedia (HTTPS) */
  if(_canUseGetUserMedia && _canUseGetUserMedia()){
    navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'},audio:false})
      .then(function(stream){
        var vid=document.createElement('video');
        vid.srcObject=stream; vid.autoplay=true; vid.playsInline=true; vid.muted=true;
        vid.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:cover;z-index:9998;background:#000;';
        var overlay=document.createElement('div');
        overlay.style.cssText='position:fixed;inset:0;z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:40px;';
        var shutterBtn=document.createElement('button');
        shutterBtn.innerHTML='<div style="width:64px;height:64px;border-radius:50%;border:3px solid #fff;display:flex;align-items:center;justify-content:center;"><div style="width:52px;height:52px;border-radius:50%;background:#fff;"></div></div>';
        shutterBtn.style.cssText='background:none;border:none;cursor:pointer;';
        var cancelBtn=document.createElement('button');
        cancelBtn.textContent='취소';
        cancelBtn.style.cssText='position:absolute;top:calc(14px + env(safe-area-inset-top,0px));right:18px;background:none;border:none;color:#fff;font-size:1rem;cursor:pointer;font-family:var(--font);';
        overlay.appendChild(shutterBtn); overlay.appendChild(cancelBtn);
        document.body.appendChild(vid); document.body.appendChild(overlay);
        function cleanup(){
          stream.getTracks().forEach(function(t){t.stop();});
          document.body.removeChild(vid); document.body.removeChild(overlay);
        }
        shutterBtn.onclick=function(){
          var canvas=document.createElement('canvas');
          canvas.width=vid.videoWidth||1280; canvas.height=vid.videoHeight||720;
          canvas.getContext('2d').drawImage(vid,0,0,canvas.width,canvas.height);
          var dataUrl=canvas.toDataURL('image/jpeg',0.88);
          cleanup(); callback(dataUrl);
        };
        cancelBtn.onclick=function(){ cleanup(); };
      })
      .catch(function(){ showToast('카메라에 접근할 수 없습니다.'); });
    return;
  }
  /* input[capture] 최후 수단 — 갤러리 완전 차단 */
  var input=document.createElement('input');
  input.type='file';
  input.setAttribute('accept','image/jpeg,image/png');
  input.setAttribute('capture','environment'); /* 카메라 직접 실행, 갤러리 차단 */
  input.onchange=function(){
    var file=input.files[0]; if(!file) return;
    if(Date.now()-(file.lastModified||0)>30000){
      showToast('📷 지금 바로 촬영한 사진만 등록 가능합니다.'); return;
    }
    var reader=new FileReader();
    reader.onload=function(ev){ callback(ev.target.result); };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* ──────────────────────────────────────────
   CARO 전용 카메라 (getUserMedia — 갤러리 완전 차단)
   Android WebView file:// 환경 대응 포함
────────────────────────────────────────── */
var caroCamStream = null;
var caroCamCaptured = null;

/* Android Bridge로 사진 수신 (네이티브 → JS 콜백) */
window.onAndroidPhoto = function(dataUrl, side){
  var targetSide = side || pcarCurrentSide;
  pcarPhotos[targetSide] = pcarPhotos[targetSide]||[];
  if(pcarPhotos[targetSide].length >= 5){
    showToast('최대 5장까지 촬영 가능합니다.'); return;
  }
  pcarPhotos[targetSide].push(dataUrl);
  updatePcarCount(targetSide);
  renderSideThumbs();
  showToast('✅ 사진이 저장되었습니다.');
};

/* 카메라 사용 가능 여부 판단 */
function _canUseGetUserMedia(){
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia &&
    (location.protocol === 'https:' || location.hostname === 'localhost' ||
     location.hostname === '127.0.0.1'));
}

/* Android Native Bridge 사용 가능 여부 */
function _hasAndroidBridge(){
  return !!(window.Android && typeof window.Android.capturePhoto === 'function');
}

/* 카메라 화면 열기 — 환경 자동 감지 */
function openCaroCamera(){
  var photos = pcarPhotos[pcarCurrentSide]||[];
  if(photos.length >= 5){ showToast('최대 5장까지 촬영 가능합니다.'); return; }

  var label = pcarSideLabels[pcarCurrentSide]||pcarCurrentSide;
  var screen = document.getElementById('caro-camera-screen');
  var title  = document.getElementById('caro-cam-title');
  if(title) title.textContent = label;

  /* 방법 1: Android Native Bridge (WebView file:// 환경) */
  if(_hasAndroidBridge()){
    window.Android.capturePhoto(pcarCurrentSide, label);
    return;
  }

  /* 방법 2: getUserMedia (HTTPS/localhost) */
  if(_canUseGetUserMedia()){
    caroCamCaptured = null;
    _caroCamShowLive();
    if(screen) screen.classList.add('open');

    navigator.mediaDevices.getUserMedia({
      video:{ facingMode:'environment', width:{ideal:1920}, height:{ideal:1080} },
      audio:false
    }).then(function(stream){
      caroCamStream = stream;
      var video = document.getElementById('caro-cam-video');
      if(video){ video.srcObject = stream; video.play(); }
    }).catch(function(){
      /* 후면 실패 시 기본 카메라 */
      navigator.mediaDevices.getUserMedia({ video:true, audio:false })
        .then(function(stream){
          caroCamStream = stream;
          var video = document.getElementById('caro-cam-video');
          if(video){ video.srcObject = stream; video.play(); }
        })
        .catch(function(){
          if(screen) screen.classList.remove('open');
          showToast('카메라에 접근할 수 없습니다. 권한을 확인해 주세요.');
        });
    });
    return;
  }

  /* 방법 3: input[capture] 최후 수단 — 갤러리 완전 차단 */
  var input = document.createElement('input');
  input.type='file';
  input.setAttribute('accept','image/jpeg,image/png');
  input.setAttribute('capture','environment'); /* 카메라 직접 실행, 갤러리 차단 */
  input.onchange = function(){
    var file = input.files[0]; if(!file) return;
    /* 최근 30초 내 촬영만 허용 — 갤러리 사진 차단 */
    if(Date.now() - (file.lastModified||0) > 30000){
      showToast('📷 지금 바로 촬영한 사진만 등록 가능합니다.');
      return;
    }
    var reader = new FileReader();
    reader.onload = function(ev){
      pcarPhotos[pcarCurrentSide] = pcarPhotos[pcarCurrentSide]||[];
      pcarPhotos[pcarCurrentSide].push(ev.target.result);
      updatePcarCount(pcarCurrentSide);
      renderSideThumbs();
      showToast('✅ 사진이 저장되었습니다.');
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

/* 라이브 촬영 상태 표시 */
function _caroCamShowLive(){
  var video  = document.getElementById('caro-cam-video');
  var canvas = document.getElementById('caro-cam-canvas');
  var shutter= document.getElementById('caro-cam-shutter-btn');
  var retry  = document.getElementById('caro-cam-retry-btn');
  var save   = document.getElementById('caro-cam-save-btn');
  var cancel = document.getElementById('caro-cam-cancel-btn');
  if(video)  video.style.display='block';
  if(canvas) canvas.style.display='none';
  if(shutter){ shutter.style.display='flex'; }
  if(retry)  retry.style.display='none';
  if(save)   save.style.display='none';
  if(cancel) cancel.style.display='flex';
}

/* 셔터 — 촬영 */
function caroShutter(){
  var video  = document.getElementById('caro-cam-video');
  var canvas = document.getElementById('caro-cam-canvas');
  if(!video||!canvas) return;

  canvas.width  = video.videoWidth  || 1280;
  canvas.height = video.videoHeight || 720;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  caroCamCaptured = canvas.toDataURL('image/jpeg', 0.88);

  /* 미리보기 전환 */
  video.style.display  = 'none';
  canvas.style.display = 'block';

  var shutter= document.getElementById('caro-cam-shutter-btn');
  var retry  = document.getElementById('caro-cam-retry-btn');
  var save   = document.getElementById('caro-cam-save-btn');
  var cancel = document.getElementById('caro-cam-cancel-btn');
  if(shutter) shutter.style.display='none';
  if(retry)   retry.style.display='flex';
  if(save)    save.style.display='flex';
  if(cancel)  cancel.style.display='none';
}

/* 다시 촬영 */
function caroRetake(){
  caroCamCaptured = null;
  _caroCamShowLive();
}

/* 저장 */
function caroSave(){
  if(!caroCamCaptured){ showToast('촬영된 사진이 없습니다.'); return; }
  pcarPhotos[pcarCurrentSide] = pcarPhotos[pcarCurrentSide]||[];
  pcarPhotos[pcarCurrentSide].push(caroCamCaptured);
  updatePcarCount(pcarCurrentSide);
  renderSideThumbs();
  caroCamCaptured = null;

  var remaining = 5 - pcarPhotos[pcarCurrentSide].length;
  if(remaining > 0){
    /* 연속 촬영 — 다시 라이브로 */
    _caroCamShowLive();
    showToast('저장됨 · 추가 촬영 가능 ('+remaining+'장 남음)');
  } else {
    /* 5장 완료 — 카메라 닫기 */
    closeCaroCamera();
    showToast('✅ 5장 촬영 완료');
  }
}

/* 카메라 닫기 */
function closeCaroCamera(){
  /* 스트림 정지 */
  if(caroCamStream){
    caroCamStream.getTracks().forEach(function(t){ t.stop(); });
    caroCamStream = null;
  }
  var video = document.getElementById('caro-cam-video');
  if(video){ video.srcObject = null; }
  var screen = document.getElementById('caro-camera-screen');
  if(screen) screen.classList.remove('open');
  caroCamCaptured = null;
}

/* CloseSideCapture 버튼 버전 (오버레이 클릭과 구분) */
function closeSideCaptureBtn(){
  var overlay=document.getElementById('side-capture-overlay');
  if(overlay) overlay.classList.remove('open');
}

function addSidePhoto(){
  /* 구버전 호환 — openCaroCamera로 리디렉션 */
  openCaroCamera();
}

window.openCaroCamera   = openCaroCamera;
window.caroShutter      = caroShutter;
window.caroRetake       = caroRetake;
window.caroSave         = caroSave;
window.closeCaroCamera  = closeCaroCamera;
window.closeSideCaptureBtn = closeSideCaptureBtn;

function deleteSidePhoto(idx){
  if(pcarPhotos[pcarCurrentSide]) pcarPhotos[pcarCurrentSide].splice(idx,1);
  renderSideThumbs();
  updatePcarCount(pcarCurrentSide);
}

function updatePcarCount(side){
  var n=(pcarPhotos[side]||[]).length;
  /* 기존 pcar-count 요소 */
  var cnt=document.getElementById('pcar-count-'+side);
  if(cnt){ cnt.textContent=n+'/5'; cnt.classList.toggle('has-photos',n>0); }
  var btn=document.getElementById('pcar-btn-'+side);
  if(btn){ btn.classList.toggle('pcar-done', n>0); }
  /* 컨트롤러 배지 동기화 */
  var cpc=document.getElementById('cpc-'+side);
  if(cpc){ cpc.textContent=n+'/5'; }
  var cpb=document.getElementById('cpb-'+side);
  if(cpb){ cpb.classList.toggle('ctrl-photo-done', n>0); }
  /* 총 카운트 배지 */
  var total=0;
  ['front','rear','left','right','misc'].forEach(function(s){ total+=(pcarPhotos[s]||[]).length; });
  var badge=document.getElementById('ctrl-photo-total-count');
  if(badge){ badge.textContent=total>0?total+'장':''; }
}

/* 사진촬영 패널 토글 */
function toggleCtrlPhoto(){
  /* 사진 촬영 버튼 → 바로 photo modal 열기 */
  closeHomeCtrlDirect();
  setTimeout(function(){ openPhotoModal(); }, 200);
}
window.toggleCtrlPhoto=toggleCtrlPhoto;

function closeSideCapture(e){
  if(e&&e.target!==document.getElementById('side-capture-overlay')) return;
  var overlay=document.getElementById('side-capture-overlay');
  if(overlay) overlay.classList.remove('open');
}

function closePhotoModal(e){
  if(e&&e.target!==document.getElementById('photo-modal-overlay')) return;
  var overlay=document.getElementById('photo-modal-overlay');
  if(overlay) overlay.classList.remove('open');
}

function finishPhotoCapture(){
  var total=0;
  ['front','rear','left','right','misc'].forEach(function(s){ total+=pcarPhotos[s].length; });
  var overlay=document.getElementById('photo-modal-overlay');
  if(overlay) overlay.classList.remove('open');
if(total>0) showToast('✅ '+total+'장 촬영 완료. 기록 저장됨.');
  else showToast('촬영된 사진이 없습니다. 파손 기록을 권장합니다.');
  var photoBtn = document.getElementById('ctrl-photo-toggle');
  if(!photoBtn) photoBtn = document.querySelector('[onclick*="photo"]');
  if(photoBtn){
      photoBtn.disabled = true;
      photoBtn.style.opacity = '0.3';
      photoBtn.style.pointerEvents = 'none';
      photoBtn.classList.add('ctrl-sq-disabled');
      photoBtn.setAttribute('data-photo-done','1');
    }
}
/* 구버전 호환 — capturePhoto 제거됨 */
function capturePhoto(side){ openSideCapture(side); }

window.openPhotoModal=openPhotoModal;
window.openSideCapture=openSideCapture;
window.closeSideCapture=closeSideCapture;
window.addSidePhoto=addSidePhoto;
window.deleteSidePhoto=deleteSidePhoto;
window.capturePhoto=capturePhoto;
window.closePhotoModal=closePhotoModal;
window.finishPhotoCapture=finishPhotoCapture;


function openResDetail(idx){
  var r=myReservations[idx]; if(!r) return;
  /* 방어 코드 — ins/car 없을 때 기본값 */
  var ins=r.ins||INSURANCE[0]||{name:'기본',nameen:'Basic',nameja:'基本',namezh:'基本',desc:'',descen:'',descja:'',desczh:'',pricePerHour:0};
  var insName=currentLang==='en'?ins.nameen:currentLang==='ja'?ins.nameja:currentLang==='zh'?ins.namezh:ins.name;
  var insDesc=currentLang==='en'?ins.descen:currentLang==='ja'?ins.descja:currentLang==='zh'?ins.desczh:ins.desc;
  var body=document.getElementById('res-detail-body'); if(!body) return;
  var carId=(r.car&&(r.car.id||r.car.name))||'unknown';
  var fuelPct=getFuelLevel(carId)||Math.floor(Math.random()*60)+20;
  fuelLevels[carId]=fuelPct;
  var fuelColor=fuelPct>60?'#1d7a3a':fuelPct>30?'#b07800':'#b23a3a';
  var fuelLabel=(r.car&&r.car.fuel)==='전기'?'배터리':'연료';
  var floors=['B1','B2','B2','B3','1F'], spots=['12번','23번','47번','55번','08번'];
  var hash=r.bookNo?r.bookNo.charCodeAt(r.bookNo.length-1)%5:0;
  var parkInfo=floors[hash]+' · '+spots[hash]+' 구역';
  body.innerHTML=
    /* 차량 사진 */
    '<img style="width:100%;height:130px;object-fit:contain;border-radius:14px;margin-bottom:12px;background:#dde2ea;" src="'+r.car.img+'" alt="'+getCarName(r.car)+'"/>'+
    /* 기본 정보 */
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);letter-spacing:.08em;margin-bottom:8px;">기본 정보</div>'+
      '<div style="display:flex;flex-direction:column;gap:5px;font-size:.82rem;">'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">예약번호</span><strong>'+r.bookNo+'</strong></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">차량</span><span>'+getCarName(r.car)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">대여</span><span>'+fmtDT(r.start)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">반납</span><span>'+fmtDT(r.end)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">이용 시간</span><span>'+r.hrs+'시간</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">결제 금액</span><strong style="color:var(--accent);">'+r.total.toLocaleString()+'원</strong></div>'+
      '</div>'+
    '</div>'+
    /* 차량 위치 */
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);letter-spacing:.08em;margin-bottom:8px;">차량 위치</div>'+
      '<div style="font-size:.86rem;font-weight:700;">🅿 '+parkInfo+'</div>'+
    '</div>'+
    /* 연료량 */
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);letter-spacing:.08em;margin-bottom:8px;">현재 '+fuelLabel+' 수준</div>'+
      '<div style="display:flex;align-items:center;gap:10px;">'+
        '<div style="flex:1;height:8px;background:rgba(0,0,0,.1);border-radius:14px;overflow:hidden;">'+
          '<div style="width:'+fuelPct+'%;height:100%;background:'+fuelColor+';border-radius:14px;transition:width .5s;"></div>'+
        '</div>'+
        '<span style="font-size:.9rem;font-weight:700;color:'+fuelColor+';min-width:38px;">'+fuelPct+'%</span>'+
      '</div>'+
    '</div>'+
    /* 면책 상품 */
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);letter-spacing:.08em;margin-bottom:8px;">보험 약관</div>'+
      '<div style="font-size:.85rem;font-weight:700;margin-bottom:5px;">'+insName+'</div>'+
      '<div style="font-size:.78rem;color:var(--text-2);line-height:1.6;">'+insDesc+'</div>'+
    '</div>'+
    /* 취소 버튼 */
    (function(){
      if(r.returned) return '<div style="padding:6px 0;text-align:center;font-size:.78rem;color:var(--text-m);">반납 완료된 예약입니다.</div>';
      var now=new Date();
      var diffMin=(r.start.getTime()-now.getTime())/60000;
      if(diffMin<0) return '<div style="padding:8px 0 2px;font-size:.76rem;color:var(--text-m);text-align:center;">대여 중에는 취소 대신 <b>반납</b> 버튼으로 조기 반납해 주세요</div>';
      var pol=getRefundPolicy(diffMin, r.total);
      if(pol.pct===-1) return '<div style="padding:8px 0 2px;font-size:.76rem;color:var(--error);text-align:center;">출발 10분 이내 취소 불가</div>';
      var btnColor=pol.pct===100?'rgba(29,122,58,.12);border:1px solid rgba(29,122,58,.3)':
                   pol.pct>=70  ?'rgba(29,122,58,.08);border:1px solid rgba(29,122,58,.25)':
                   pol.pct>=30  ?'rgba(180,120,30,.1);border:1px solid rgba(180,120,30,.3)':
                                 'rgba(178,58,58,.08);border:1px solid rgba(178,58,58,.3)';
      var txtColor=pol.pct>=30?'#1a7030':pol.pct===30?'#9a6a00':'#b23a3a';
      var refundStr=pol.pct>0?pol.amt.toLocaleString()+'원 ('+pol.pct+'%) 환불':'환불 없음';
      return '<button onclick="cancelReservation('+idx+')" style="width:100%;padding:12px;margin-top:10px;background:'+btnColor+';border-radius:var(--r);font-family:var(--font);font-size:.84rem;font-weight:700;color:'+txtColor+';cursor:pointer;transition:all .2s;">'+
               '🚫 예약 취소 · '+refundStr+
             '</button>';
    })();
  openModal('res-detail-modal');
}

/* ── 예약 취소 + 확인 모달 ── */
var cancelTargetIdx=-1;

function getRefundPolicy(diffMin, total){
  /* 새 환불 정책: 10h→100%, 5h→70%, 3h→30%, 1h→0% */
  var pct, label, note;
  if(diffMin>=600){       pct=100; label='전액 환불 (100%)'; note='10시간 전 취소';}
  else if(diffMin>=300){  pct=70;  label='70% 환불';         note='5~10시간 전 취소';}
  else if(diffMin>=180){  pct=30;  label='30% 환불';         note='3~5시간 전 취소';}
  else if(diffMin>=60){   pct=0;   label='환불 불가';         note='1~3시간 전 취소';}
  else if(diffMin>=10){   pct=0;   label='환불 불가';         note='10분~1시간 전 취소';}
  else if(diffMin>=0){    pct=0;   label='환불 불가';         note='1시간 이내 취소';}
  else{                   pct=0;   label='환불 불가';         note='대여 시작 후 취소';}
  var amt=pct>0?Math.round(total*pct/100):0;
  return {pct:pct, label:label, note:note, amt:amt};
}

function cancelReservation(idx){
  var r=myReservations[idx]; if(!r||r.returned) return;
  var photoBtn=document.getElementById('ctrl-photo-toggle');
  var photoDone=photoBtn&&photoBtn.getAttribute('data-photo-done')==='1';
  if(ctrlResIdx===idx&&photoDone){ showToast('🚗 운행 중에는 예약 취소가 불가합니다.'); return; }
  var now=new Date();
  var startTime=new Date(r.start);
  var diffMin=(startTime.getTime()-now.getTime())/60000;
  var pol=getRefundPolicy(diffMin, r.total);
  cancelTargetIdx=idx;
  var el=document.getElementById('cancel-confirm-content'); if(!el) return;
  var refundStr=pol.pct>0?pol.amt.toLocaleString()+'원 ('+pol.pct+'%)':'환불 없음';
  var btnColor=pol.pct===100?'#1d7a3a':pol.pct>=70?'#1d7a3a':pol.pct>=30?'#9a6a00':'#b23a3a';
  el.innerHTML=
    '<div style="margin-bottom:14px;">'+
      '<div style="font-size:.84rem;font-weight:700;color:var(--text-1);margin-bottom:4px;">'+r.bookNo+'</div>'+
      '<div style="font-size:.82rem;color:var(--text-2);">'+getCarName(r.car)+' · '+fmtDT(r.start)+'</div>'+
    '</div>'+
    '<div style="background:rgba(0,0,0,.04);border-radius:var(--r);padding:12px 14px;margin-bottom:12px;font-size:.76rem;line-height:2;">'+
      '<div style="font-weight:700;color:var(--text-1);margin-bottom:6px;font-size:.8rem;">환불 정책</div>'+
      '<div style="color:'+(diffMin>=600?'#1d7a3a':'var(--text-m)')+';">● 10시간 전 취소 → <strong>100% 환불</strong></div>'+
      '<div style="color:'+(diffMin>=300&&diffMin<600?'#1d7a3a':'var(--text-m)')+';">●&nbsp;&nbsp;5시간 전 취소 → <strong>70% 환불</strong></div>'+
      '<div style="color:'+(diffMin>=180&&diffMin<300?'#9a6a00':'var(--text-m)')+';">●&nbsp;&nbsp;3시간 전 취소 → <strong>30% 환불</strong></div>'+
      '<div style="color:'+(diffMin<180?'#b23a3a':'var(--text-m)')+';">●&nbsp;&nbsp;1시간 전 취소 → <strong>환불 불가</strong></div>'+
    '</div>'+
    '<div style="background:rgba(0,0,0,.05);border-radius:var(--r);padding:10px 14px;margin-bottom:14px;">'+
      '<div style="font-size:.74rem;color:var(--text-m);">현재 상태</div>'+
      '<div style="font-size:.9rem;font-weight:700;color:'+btnColor+';margin-top:2px;">'+pol.note+' · '+pol.label+'</div>'+
      '<div style="font-size:.82rem;color:var(--text-2);margin-top:3px;">환불 예정: <strong style="color:'+btnColor+';">'+refundStr+'</strong></div>'+
    '</div>'+
    '<div id="cancel-agree-row" onclick="onCancelAgreeChange()" style="display:flex;align-items:center;gap:10px;padding:12px 14px;background:rgba(178,58,58,.06);border:1px solid rgba(178,58,58,.2);border-radius:var(--r);cursor:pointer;margin-bottom:12px;transition:background .2s;">'+
      '<input type="checkbox" id="cancel-agree-chk" style="display:none;">'+
      '<span id="cancel-agree-box" style="width:20px;height:20px;flex-shrink:0;border:1.5px solid rgba(178,58,58,.4);border-radius:5px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;transition:all .18s;"></span>'+
      '<span style="font-size:.82rem;font-weight:700;color:#b23a3a;line-height:1.4;">예약 취소 확인</span>'+
    '</div>'+
    '<div style="display:flex;gap:8px;">'+
      '<button id="cancel-confirm-do-btn" onclick="doConfirmCancel()" disabled style="flex:1;padding:12px;background:rgba(178,58,58,.06);border:1px solid rgba(178,58,58,.2);border-radius:var(--r);font-family:var(--font);font-size:.86rem;font-weight:700;color:rgba(178,58,58,.4);cursor:not-allowed;transition:all .2s;">예약 취소 확정</button>'+
      '<button onclick="closeCancelConfirmModalDirect()" style="flex:1;padding:12px;background:rgba(29,122,58,.08);border:1px solid rgba(29,122,58,.3);border-radius:var(--r);font-family:var(--font);font-size:.86rem;font-weight:700;color:#1d7a3a;cursor:pointer;">취소 안함</button>'+
    '</div>';
  openModal('cancel-confirm-modal');
}
window.cancelReservation=cancelReservation;

function onCancelAgreeChange(){
  var chk=document.getElementById('cancel-agree-chk');
  var box=document.getElementById('cancel-agree-box');
  var btn=document.getElementById('cancel-confirm-do-btn');
  var row=document.getElementById('cancel-agree-row');
  if(!chk||!btn) return;
  chk.checked=!chk.checked;
  var checked=chk.checked;
  /* 체크박스 시각 */
  if(box){
    box.style.background=checked?'#b23a3a':'rgba(255,255,255,.06)';
    box.style.borderColor=checked?'#b23a3a':'rgba(178,58,58,.4)';
    box.innerHTML=checked?'<svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':'';
  }
  if(row) row.style.background=checked?'rgba(178,58,58,.12)':'rgba(178,58,58,.06)';
  /* 버튼 활성화 */
  btn.disabled=!checked;
  btn.style.background=checked?'rgba(178,58,58,.12)':'rgba(178,58,58,.06)';
  btn.style.borderColor=checked?'rgba(178,58,58,.5)':'rgba(178,58,58,.2)';
  btn.style.color=checked?'#b23a3a':'rgba(178,58,58,.4)';
  btn.style.cursor=checked?'pointer':'not-allowed';
}
window.onCancelAgreeChange=onCancelAgreeChange;

function doConfirmCancel(){
  var idx=cancelTargetIdx;
  var r=myReservations[idx]; if(!r) return;
  var now=new Date();
  var diffMin=(r.start.getTime()-now.getTime())/60000;
  var pol=getRefundPolicy(diffMin, r.total);
  cancelledHistory.unshift({
    bookNo:r.bookNo, car:r.car, ins:r.ins,
    start:r.start, end:r.end, hrs:r.hrs, total:r.total,
    extendedMins:r.extendedMins||0,
    cancelledAt:new Date(), refundPct:pol.pct, refundAmt:pol.amt,
    status:'cancelled'
  });
  myReservations.splice(idx,1);
  cancelTargetIdx=-1;
  closeModal('cancel-confirm-modal');
  closeModal('res-detail-modal');
  renderMyReservations(); renderCars(); updateMapMarkers();
  var msg=pol.pct>0?
    '✅ 예약 취소 완료 · '+pol.amt.toLocaleString()+'원 환불 처리됩니다.':
    '예약이 취소되었습니다. (환불 없음)';
  saveUserData();
  showToast(msg);
}
window.doConfirmCancel=doConfirmCancel;

function closeCancelConfirmModal(e){
  if(e&&e.target!==document.getElementById('cancel-confirm-modal')) return;
  closeModal('cancel-confirm-modal');
}
function closeCancelConfirmModalDirect(){ closeModal('cancel-confirm-modal'); }
window.closeCancelConfirmModal=closeCancelConfirmModal;
window.closeCancelConfirmModalDirect=closeCancelConfirmModalDirect;

function closeResDetail(e){
  if(e&&e.target!==document.getElementById('res-detail-modal')) return;
  closeModal('res-detail-modal');
}

/* ─────────────────────────────────────────────
   18. 카로 더 블랙
───────────────────────────────────────────── */
function renderBLCars(){
  var list=document.getElementById('bl-car-list'); if(!list) return;
  list.innerHTML='';
  BL_CARS.forEach(function(car){
    var carName=currentLang==='en'?car.nameen:currentLang==='ja'?car.nameja:currentLang==='zh'?car.namezh:car.name;
    var fuelIcon=car.fuel==='전기'?'⚡':'⛽';
    var div=document.createElement('div'); div.className='bl-car-card';
    div.innerHTML=
      '<img class="bl-car-img" src="'+car.img+'" alt="'+carName+'"/>'+
      '<div class="bl-car-info">'+
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">'+
          '<div class="bl-car-name">'+carName+'</div>'+
          '<span style="font-size:.65rem;letter-spacing:.08em;color:rgba(200,169,110,.45);white-space:nowrap;padding-top:3px;">'+fuelIcon+' '+car.fuel+'</span>'+
        '</div>'+
        '<div class="bl-car-options">'+car.options.replace(/\n/g,'<br>')+'</div>'+
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;">'+
          '<div class="bl-car-price">'+car.pricePerHour.toLocaleString()+'<span style="font-size:.72rem;font-family:var(--font);color:rgba(200,169,110,.55);"> 원/h</span></div>'+
          '<div class="bl-car-area">'+car.area+'</div>'+
        '</div>'+
        '<button class="bl-rent-btn" onclick="event.stopPropagation();selectBlCar(\''+car.id+'\')">예약하기</button>'+
      '</div>';
    div.onclick=function(e){ if(!e.target.classList.contains('bl-rent-btn')) openBLDetail(car); };
    list.appendChild(div);
  });
}

function selectBlCar(carId){
  var car=BL_CARS.find(function(c){return c.id===carId;});
  if(!car) return;
  /* BL 차량을 일반 차량 형태로 변환해서 예약 화면으로 */
  selectedCar={
    id:car.id, name:car.name, nameen:car.nameen, nameja:car.nameja, namezh:car.namezh,
    pricePerHour:car.pricePerHour, fuel:car.fuel, img:car.img, options:car.options,
    kmRate:car.kmRate||0, fuelFreeKm:car.fuelFreeKm||0, isBlackLabel:true
  };
  setupDateInputs();
  renderReservationCard();
  renderInsurance();
  updatePriceSummary();
  goTo('reservation-screen');
}
window.selectBlCar=selectBlCar;
window.renderBLCars=renderBLCars;
function openBLDetail(car){
  var content=document.getElementById('bl-detail-content'); if(!content) return;
  content.innerHTML=
    '<div class="form-container">'+
      '<img style="width:100%;height:140px;object-fit:cover;border-radius:14px;margin-bottom:16px;" src="'+car.img+'" alt="'+car.name+'"/>'+
      '<div style="font-family:var(--font-brand);font-size:1.2rem;font-weight:500;letter-spacing:.08em;color:var(--text-1);margin-bottom:8px;">'+(currentLang==='en'?car.nameen:currentLang==='ja'?car.nameja:currentLang==='zh'?car.namezh:car.name)+'</div>'+
      '<div style="font-size:.78rem;color:var(--text-m);margin-bottom:14px;">'+( car.fuel==='전기'?'⚡':'⛽')+' '+car.fuel+' · 📍 '+car.area+'</div>'+
      '<div style="font-size:.82rem;font-weight:700;color:var(--text-2);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;">차량 옵션</div>'+
      '<div style="font-size:.84rem;color:var(--text-2);line-height:1.9;">'+car.options.replace(/\n/g,'<br>')+'</div>'+
      '<div style="margin-top:16px;padding:14px;background:rgba(24,25,28,.06);border-radius:14px;display:flex;justify-content:space-between;align-items:center;">'+
        '<span style="font-size:.82rem;color:var(--text-m);">대여 가격</span>'+
        '<span style="font-size:1.1rem;font-weight:700;color:var(--accent);">'+car.pricePerHour.toLocaleString()+'원 / h</span>'+
      '</div>'+
    '</div>';
  goTo('bl-detail-screen');
}

/* ─────────────────────────────────────────────
   19. 이벤트 상세
───────────────────────────────────────────── */
var EVENT_DETAILS = [
  {
    title:'신규 가입 첫 대여 30% 할인',
    titleen:'30% Off First Ride for New Members',
    body:'<h4 style="text-align:center">이벤트 내용</h4><p>CARO 모빌리티에 신규 가입하신 후 <strong>7일 이내</strong>에 첫 차량 대여를 하시면 대여 요금의 <strong>30%를 자동 할인</strong>해 드립니다.</p><h4 style="text-align:center">적용 조건</h4><ul><li>가입일로부터 7일 이내 첫 대여 시 자동 적용</li><li>쿠폰 코드 입력 불필요 (자동 처리)</li><li>모든 차량 등급 적용 가능</li><li>포인트와 중복 할인 가능</li></ul><h4 style="text-align:center">이벤트 기간</h4><p style="text-align:center">2026년 3월 1일 ~ 2026년 12월 31일</p>',
    period:'2026.03.01 ~ 2026.12.31'
  },
  {
    title:'CARO 카로 더 블랙 출시 기념',
    titleen:'CARO THE BLACK Launch Event',
    body:'<h4 style="text-align:center">이벤트 내용</h4><p>CARO 카로 더 블랙 서비스 출시를 기념하여 <strong>카로 더 블랙 첫 이용 고객</strong>께 전담 컨시어지 서비스를 <strong>무료</strong>로 제공합니다.</p><h4 style="text-align:center">카로 더 블랙이란?</h4><ul><li>제네시스 GV80·G90, BMW iX, 메르세데스 EQS, 포르쉐 타이칸 등 프리미엄 차량</li><li>서울·인천 지역 한정 운영</li><li>전담 컨시어지 배차 및 반납 서비스</li><li>차량 내 프리미엄 어메니티 제공</li></ul><h4 style="text-align:center">이벤트 기간</h4><p style="text-align:center">2026년 3월 1일 ~ 2026년 6월 30일</p>',
    period:'2026.03.01 ~ 2026.06.30'
  },
  {
    title:'친구 추천 5,000P 적립',
    titleen:'Refer a Friend – Earn 5,000P',
    body:'<h4 style="text-align:center">이벤트 내용</h4><p>CARO 서비스를 친구에게 추천하고 <strong>추천인과 피추천인 모두 5,000P</strong>를 즉시 적립 받으세요!</p><h4 style="text-align:center">참여 방법</h4><ul><li>마이페이지에서 나만의 추천 코드 확인</li><li>친구에게 추천 코드 공유</li><li>친구가 코드 입력 후 첫 대여 완료 시 양측 5,000P 자동 적립</li></ul><h4 style="text-align:center">포인트 사용</h4><p>1P = 1원, 예약 화면에서 현금처럼 사용 가능</p><h4 style="text-align:center">이벤트 기간</h4><p style="text-align:center">상시 진행</p>',
    period:'상시 진행'
  },
  {
    title:'주말 특별 할인 최대 30%',
    titleen:'Weekend Special Up to 30% Off',
    body:'<h4 style="text-align:center">이벤트 내용</h4><p>매주 <strong>토·일요일</strong>에 전기차 대여 시 차량별로 최대 <strong>30% 자동 할인</strong>이 적용됩니다.</p><h4 style="text-align:center">적용 대상</h4><ul><li>현대 아이오닉 6: 15% 할인</li><li>기아 EV6: 15% 할인</li><li>기아 EV9: 20% 할인</li><li>제네시스 G80: 10% 할인</li><li>BMW iX: 30% 할인</li></ul><h4 style="text-align:center">유의 사항</h4><ul><li>전기차 전용 이벤트</li><li>쿠폰과 중복 불가</li><li>토요일 00:00 ~ 일요일 23:59 대여 시작 건만 적용</li></ul><h4 style="text-align:center">이벤트 기간</h4><p style="text-align:center">매주 토~일 (상시)</p>',
    period:'매주 토~일'
  }
];

function openEventDetail(idx){
  var ev=EVENT_DETAILS[idx]; if(!ev) return;
  var title=document.getElementById('ev-detail-title');
  var body=document.getElementById('ev-detail-body');
  if(title) title.textContent=currentLang==='en'?(ev.titleen||ev.title):ev.title;
  if(body) body.innerHTML=ev.body;
  openModal('event-detail-modal');
}
function closeEventDetail(e){
  if(e&&e.target!==document.getElementById('event-detail-modal')) return;
  closeModal('event-detail-modal');
}

/* ─────────────────────────────────────────────
   20. 공지사항
───────────────────────────────────────────── */
var NOTICES=[
  {
    title:'2026년 하절기 차량 점검 일정 안내',
    body:'<h4>점검 개요</h4><p>CARO 모빌리티는 안전한 차량 서비스 제공을 위해 2026년 하절기 정기 차량 점검을 실시합니다.</p><h4>점검 일정</h4><ul><li>점검 기간: 2026년 7월 14일(월) ~ 7월 16일(수)</li><li>점검 시간: 오전 00:00 ~ 오후 23:59</li></ul><h4>서비스 영향</h4><ul><li>점검 기간 동안 일부 차량의 예약이 제한될 수 있습니다.</li><li>이미 예약하신 건은 정상적으로 이용 가능합니다.</li><li>점검 차량은 앱 내 차량 선택 화면에서 별도 표시됩니다.</li></ul><h4>문의</h4><p>고객센터: 1588-0000 (평일 09:00~18:00)</p><p>이용에 불편을 드려 죄송합니다.</p>'
  },
  {
    title:'CARO 앱 v2.0 업데이트 안내',
    body:'<h4>업데이트 내용</h4><p>더욱 편리하고 빠른 서비스를 위해 CARO 앱 v3.0이 업데이트되었습니다.</p><h4>주요 변경 사항</h4><ul><li>🚗 차량 실시간 위치 추적 기능 추가</li><li>💳 간편 결제 (카카오페이·네이버페이) 지원</li><li>🗓 예약 일정 캘린더 연동 기능 추가</li><li>🌐 4개 국어 지원 (한국어·영어·일본어·중국어)</li><li>🎨 UI/UX 전면 개편으로 더 쉬운 사용 경험</li><li>🔔 예약 알림 및 반납 리마인더 기능 강화</li></ul><h4>업데이트 방법</h4><p>앱스토어 / 플레이스토어에서 최신 버전으로 업데이트하세요.</p><p>업데이트 일자: 2026년 3월 20일</p>'
  },
  {
    title:'개인정보처리방침 개정 안내',
    body:'<h4>개정 개요</h4><p>CARO 모빌리티는 2026년 1월 1일부로 개인정보처리방침을 개정합니다. 개인정보보호법 개정에 따른 사항을 반영하였습니다.</p><h4>주요 개정 내용</h4><ul><li>위치정보 수집 항목 명확화</li><li>마케팅 목적 개인정보 활용 동의 절차 강화</li><li>제3자 제공 항목 및 기간 명시</li><li>개인정보 처리 위탁 업체 목록 추가</li></ul><h4>시행일</h4><p>2026년 1월 1일부터 시행됩니다.</p><h4>동의 안내</h4><p>개정된 방침에 동의하지 않으시면 서비스 이용이 제한될 수 있습니다. 계속 서비스를 이용하시면 개정 방침에 동의하신 것으로 간주됩니다.</p>'
  }
];

function openNotice(idx){
  var n=NOTICES[idx]; if(!n) return;
  var title=document.getElementById('notice-title'), body=document.getElementById('notice-body');
  if(title) title.textContent=n.title;
  if(body) body.innerHTML=n.body;
  openModal('notice-modal');
}
function closeNotice(e){
  if(e&&e.target!==document.getElementById('notice-modal')) return;
  closeModal('notice-modal');
}

/* ─────────────────────────────────────────────
   21. 마이페이지
───────────────────────────────────────────── */
function renderMyPage(){
  var avatar = document.getElementById('mpn-avatar');
  var name   = document.getElementById('mpn-name');
  var email  = document.getElementById('mpn-email');
  if(avatar) avatar.textContent = (userInfo.id||'C')[0].toUpperCase();
  if(name)   name.textContent   = userInfo.name||userInfo.id||'사용자';
  if(email)  email.textContent  = userInfo.email||userInfo.id||'—';
}
function renderSavedCards(){
  var container=document.getElementById('mp-cards'); if(!container) return;
  if(savedCards.length===0){
    container.innerHTML='<div class="mp-empty-card">'+t('mp_no_card')+'</div>';
  } else {
    container.innerHTML='';
    savedCards.forEach(function(c,i){
      var row=document.createElement('div'); row.className='mp-saved-card';
      row.innerHTML=
        '<div><div class="mp-card-num">'+c.alias+' •••• '+c.last4+'</div><div class="mp-card-exp">'+c.exp+'</div></div>'+
        '<button class="mp-card-del" onclick="deleteCard('+i+')">삭제</button>';
      container.appendChild(row);
    });
  }
}
function openAddCard(){ openModal('add-card-modal'); }
function closeAddCard(e){
  if(e&&e.target!==document.getElementById('add-card-modal')) return;
  closeModal('add-card-modal');
}
function saveCard(){
  var num=val('ac-num'), exp=val('ac-exp'), cvc=val('ac-cvc'), alias=val('ac-name');
  if(!num||!caroCardOk(num)){ showToast('카드 번호를 올바르게 입력해 주세요. (일반 16자리 / AMEX 15자리)'); return; }
  if(!exp){ showToast('유효기간을 입력해 주세요.'); return; }
  if(!cvc||cvc.length<3){ showToast('CVC를 입력해 주세요.'); return; }
  var last4=num.replace(/\s/g,'').slice(-4);
  savedCards.push({last4:last4,exp:exp,alias:alias||'카드'});
  ['ac-num','ac-exp','ac-cvc','ac-name'].forEach(function(id){ var e=document.getElementById(id); if(e) e.value=''; });
  closeModal('add-card-modal');
  renderSavedCards();
  saveUserData();
  showToast('카드가 등록되었습니다 💳');
}
function deleteCard(idx){
  savedCards.splice(idx,1);
  renderSavedCards();
  saveUserData();
  showToast('카드가 삭제되었습니다.');
}

/* ─────────────────────────────────────────────
   22. 모달 공통
───────────────────────────────────────────── */
function openModal(id){
  var el=document.getElementById(id); if(!el) return;
  el.classList.add('open');
}
function closeModal(id){
  var el=document.getElementById(id); if(!el) return;
  el.classList.remove('open');
}

/* ─────────────────────────────────────────────
   23. 약관
───────────────────────────────────────────── */
var TERMS_CONTENT={
  service:'<h4>제1조 (목적)</h4><p>이 약관은 CARO 모빌리티가 제공하는 무인 차량 대여 서비스의 이용에 관한 조건 및 절차, 회사와 이용자의 권리·의무 및 책임사항을 규정합니다.</p><h4>제2조 (서비스 내용)</h4><p>무인 차량 대여, 예약, 결제, 반납 서비스를 제공합니다. 서비스는 앱 또는 웹을 통해 이용 가능합니다.</p><h4>제3조 (이용 자격)</h4><p>만 21세 이상, 국내 운전면허 보유자만 이용 가능합니다.</p>',
  privacy:'<h4>수집 항목</h4><p>이름, 생년월일, 휴대폰 번호, 이메일, 운전면허 번호, 결제 정보, 위치 정보</p><h4>수집 목적</h4><p>서비스 이용자 식별, 예약/결제 처리, 차량 대여 서비스 제공</p><h4>보유 기간</h4><p>회원 탈퇴 시까지. 단, 법령에 따라 일정 기간 보관이 필요한 경우 해당 기간까지 보관.</p>',
  location:'<h4>위치정보 수집</h4><p>차량 현황 조회 및 근처 차량 안내를 위해 이용자의 현재 위치 정보를 수집합니다.</p><h4>이용 목적</h4><p>주변 차량 현황 표시, 반납 위치 안내, 긴급출동 서비스 제공</p>',
  marketing:'<h4>마케팅 정보 수신 동의 (선택)</h4><p>CARO의 이벤트, 할인, 신규 서비스 안내를 문자/이메일로 받으실 수 있습니다. 동의하지 않아도 기본 서비스 이용에는 지장이 없습니다.</p>',
  third:'<h4>제3자 정보 제공 (선택)</h4><p>차량 보험사, 긴급출동 서비스 업체에 최소한의 개인정보를 제공할 수 있습니다. 제공 목적 외 사용은 금지됩니다.</p>'
};
function openTerms(type){
  var title=document.getElementById('modal-title'), body=document.getElementById('modal-body');
  var names={service:'서비스 이용약관',privacy:'개인정보 처리방침',location:'위치정보 서비스 이용약관',marketing:'마케팅 정보 수신 동의',third:'제3자 정보제공 동의'};
  if(title) title.textContent=names[type]||'약관';
  if(body) body.innerHTML=TERMS_CONTENT[type]||'내용을 불러올 수 없습니다.';
  openModal('terms-modal');
}
function closeTerms(){ closeModal('terms-modal'); }
function closeTermsBg(e){ if(e.target===document.getElementById('terms-modal')) closeModal('terms-modal'); }

/* ─────────────────────────────────────────────
   24. 회원가입
───────────────────────────────────────────── */
function goSignupStep(ns){
  var goingForward=ns>currentStep;
  if(goingForward){
    if(ns===2&&!validateTerms()) return;
    if(ns===3&&!validateVerify()) return;
    if(ns===4&&!validateInfo()) return;
  }
  var op=document.getElementById('signup-step'+currentStep), od=document.getElementById('step'+currentStep+'-dot');
  if(op) op.classList.remove('active');
  if(od){ od.classList.remove('active'); if(goingForward) od.classList.add('done'); else od.classList.remove('done'); }
  currentStep=ns;
  var np=document.getElementById('signup-step'+currentStep), nd=document.getElementById('step'+currentStep+'-dot');
  if(np) np.classList.add('active');
  if(nd){ nd.classList.remove('done'); nd.classList.add('active'); }
  var sc=document.getElementById('signup-screen'); if(sc) sc.scrollTop=0;
}
function validateTerms(){
  for(var i=0;i<3;i++){ var e=document.getElementById('term'+(i+1)); if(!e||!e.checked){ showToast('필수 약관에 모두 동의해 주세요.'); return false; } }
  return true;
}
/* ─── PASS 본인인증 ─── */
var _passVerified=false;
var _selectedCarrier='';

function selectCarrier(btn,carrier){
  document.querySelectorAll('.carrier-btn').forEach(function(b){ b.classList.remove('selected'); });
  btn.classList.add('selected');
  _selectedCarrier=carrier;
  checkPassReady();
}

function onPhoneInput(){ checkPassReady(); }

function checkPassReady(){
  var phone=document.getElementById('su-phone');
  var btn=document.getElementById('pass-auth-btn');
  if(!btn) return;
  var ok=phone&&/^01[0-9]{8,9}$/.test(phone.value.trim())&&!!_selectedCarrier;
  btn.disabled=!ok;
  btn.style.opacity=ok?'1':'.5';
  btn.style.cursor=ok?'pointer':'not-allowed';
}

function openPassAuth(){
  if(!val('su-phone')||!/^01[0-9]{8,9}$/.test(val('su-phone'))){
    showToast('올바른 휴대폰 번호를 입력해 주세요.'); return;
  }
  if(!_selectedCarrier){ showToast('통신사를 선택해 주세요.'); return; }

  /* ★ caro-auth.js: PASS 또는 실제 문자 인증이 켜져 있으면 그쪽으로 (아래 개발용 코드는 실행 안 됨) */
  if(typeof window.caroAuthActive==='function' && window.caroAuthActive()
     && typeof window.caroStartVerification==='function'){
    window.caroStartVerification(); return;
  }

  /* 인증번호 6자리 생성 — ※ 개발용. 실서비스 전에는 반드시 CARO_AUTH_CONFIG.phoneAuth 를 켤 것 */
  window._smsCode = String(Math.floor(100000 + Math.random() * 900000));
  window._smsExpire = Date.now() + 3 * 60 * 1000; /* 3분 */
  window._smsVerifiedPhone = val('su-phone');

  /* 모달 열기 → 발송 중 표시 */
  var modal = document.getElementById('pass-auth-modal');
  if(modal) modal.style.display = 'flex';
  var spinner = document.getElementById('pass-spinner');
  var completeBtn = document.getElementById('pass-modal-complete-btn');
  var successIcon = document.getElementById('pass-success-icon');
  var msg = document.getElementById('pass-modal-msg');
  if(spinner) spinner.style.display = 'block';
  if(completeBtn) completeBtn.style.display = 'none';
  if(successIcon) successIcon.style.display = 'none';
  if(msg) msg.innerHTML = '📱 인증번호를 발송 중입니다...';

 /* 개발 모드 — 화면에 코드 표시 */
   if(spinner) spinner.style.display = 'none';
   if(msg) msg.innerHTML =
     '📱 인증번호: <strong style="font-size:1.8rem;letter-spacing:.3em;color:#18191c;">' +
     window._smsCode + '</strong><br>' +
     '<span style="font-size:.74rem;color:#888;">화면의 번호를 입력해 주세요</span>';
   var inputArea = document.getElementById('sms-input-area');
   if(inputArea) inputArea.style.display='block';
   _startSmsTimer();
 }


/* SMS 타이머 */
function _startSmsTimer(){
  var timerEl = document.createElement('div');
  timerEl.id = 'sms-timer';
  timerEl.style.cssText = 'font-size:.78rem;color:#b23a3a;margin-top:6px;';
  var modalInner = document.querySelector('#pass-auth-modal > div');
  var old = document.getElementById('sms-timer');
  if(old) old.remove();
  if(modalInner) modalInner.appendChild(timerEl);
  var interval = setInterval(function(){
    var remain = Math.max(0, window._smsExpire - Date.now());
    var m = Math.floor(remain / 60000);
    var s = Math.floor((remain % 60000) / 1000);
    timerEl.textContent = '남은 시간: ' + m + ':' + (s < 10 ? '0' : '') + s;
    if(remain <= 0){
      clearInterval(interval);
      timerEl.textContent = '인증번호가 만료되었습니다.';
    }
  }, 1000);
}

/* 인증번호 확인 */
function verifySmsCode(){
  /* ★ caro-auth.js 실제 문자 인증 진행 중이면 그쪽에서 확인 */
  if(typeof window.caroHasPendingSms==='function' && window.caroHasPendingSms()
     && typeof window.caroVerifySms==='function'){
    window.caroVerifySms(); return;
  }
  var inp = document.getElementById('sms-code-input');
  if(!inp || !inp.value){ showToast('인증번호를 입력해 주세요.'); return; }
  if(Date.now() > window._smsExpire){ showToast('인증번호가 만료되었습니다. 다시 발송해 주세요.'); return; }
  if(inp.value.toString() === window._smsCode){
    completePassAuth();
  } else {
    showToast('❌ 인증번호가 올바르지 않습니다.');
  }
}
window.verifySmsCode = verifySmsCode;

function completePassAuth(){
  _passVerified=true;
  var modal=document.getElementById('pass-auth-modal');
  var spinner=document.getElementById('pass-spinner');
  var completeBtn=document.getElementById('pass-modal-complete-btn');
  var successIcon=document.getElementById('pass-success-icon');
  var msg=document.getElementById('pass-modal-msg');
  if(spinner) spinner.style.display='none';
  if(completeBtn) completeBtn.style.display='none';
  if(successIcon) successIcon.style.display='block';
  if(msg){ msg.innerHTML='본인인증이 완료되었습니다!'; msg.style.color='#1d7a3a'; msg.style.fontWeight='700'; }

    /* ── 아이디 찾기 모드 ── */
    if(window._findMode === 'id'){
      window._findMode = null;
      setTimeout(function(){
        if(modal) modal.style.display='none';
        var r = document.getElementById('find-id-result');
        var nm = val('find-name'), ph = val('find-phone');
        var db = localLoadUsers();
        var found = null;
        Object.keys(db).forEach(function(k){
          var u = db[k];
          var storedPhone = (u.phone||'').replace(/\D/g,'');
          var inputPhone = ph.replace(/\D/g,'');
          if(u.name === nm && storedPhone === inputPhone) found = k;
        });
        if(r){
          r.style.display='block';
          if(found){
            r.style.background='rgba(29,122,58,.08)';
            r.style.border='1px solid rgba(29,122,58,.2)';
            r.style.color='#1d7a3a';
            r.innerHTML='✅ 가입된 이메일<br><strong style="font-size:1.05rem;">'+found+'</strong>';
          } else {
            r.style.background='rgba(178,58,58,.06)';
            r.style.border='1px solid rgba(178,58,58,.2)';
            r.style.color='#b23a3a';
            r.textContent='일치하는 계정을 찾을 수 없습니다.';
          }
        }
      }, 1500);
      return;
          }

        /* ── 비밀번호 찾기 모드 ── */
        if(window._findMode === 'pw'){
          window._findMode = null;
          setTimeout(function(){
            if(modal) modal.style.display='none';
            var step1=document.getElementById('find-pw-step1');
            var step2=document.getElementById('find-pw-step2');
            if(step1) step1.style.display='none';
            if(step2) step2.style.display='block';
          }, 1500);
          return;
        }

    setTimeout(function(){
    if(modal) modal.style.display='none';
    var statusBox=document.getElementById('pass-status-box');
    if(statusBox){
      statusBox.style.display='block';
      statusBox.style.background='rgba(29,122,58,.1)';
      statusBox.style.border='1px solid rgba(29,122,58,.3)';
      statusBox.style.color='#1d7a3a';
      statusBox.innerHTML='✅ 본인인증 완료<br><span style="font-size:.78rem;font-weight:400;color:var(--text-m);">'+_selectedCarrier+' · '+val('su-phone')+'</span>';
    }
    var passBtn=document.getElementById('pass-auth-btn');
    if(passBtn){ passBtn.textContent='✅ 인증완료'; passBtn.style.background='rgba(29,122,58,.15)'; passBtn.style.color='#1d7a3a'; passBtn.disabled=true; }
    var nextBtn=document.getElementById('verify-next-btn');
    if(nextBtn) nextBtn.style.display='block';
    showToast('✅ 본인인증이 완료되었습니다!');
  },1500);
}

function cancelPassAuth(){
  var modal=document.getElementById('pass-auth-modal');
  if(modal) modal.style.display='none';
  _passVerified=false;
}
window.selectCarrier=selectCarrier;
window.onPhoneInput=onPhoneInput;
window.openPassAuth=openPassAuth;
window.completePassAuth=completePassAuth;
window.cancelPassAuth=cancelPassAuth;
function validateVerify(){
  if(!window._passVerified){
    showToast('PASS 본인인증을 먼저 완료해 주세요.');
    return false;
  }
  if(!val('su-name')){ showToast('이름을 입력해 주세요.'); return false; }
  if(!val('su-birth')){ showToast('생년월일을 입력해 주세요.'); return false; }
  return true;
}
function checkPwStrength(pw){
  var fill=document.getElementById('pw-strength-fill'), hint=document.getElementById('pw-hint');
  var score=0;
  if(pw.length>=8) score++;
  if(/[A-Z]/.test(pw)) score++;
  if(/[0-9]/.test(pw)) score++;
  if(/[!@#$%^&*]/.test(pw)) score++;
  var colors=['#b23a3a','#e07b00','#d4b000','#1d7a3a'];
  var labels=['매우 약함','약함','보통','강함'];
  if(fill){ fill.style.width=(score*25)+'%'; fill.style.background=colors[score-1]||'#b23a3a'; }
  if(hint){ hint.style.color=colors[score-1]||'#b23a3a'; hint.textContent=pw.length?('비밀번호 강도: '+(labels[score-1]||'매우 약함')):''; }
}
function toggleAllAgree(cb){
  document.querySelectorAll('.term-check').forEach(function(c){ c.checked=cb.checked; });
}
function syncAllCheck(){
  var all=document.querySelectorAll('.term-check'), allChecked=true;
  all.forEach(function(c){ if(!c.checked) allChecked=false; });
  var a=document.getElementById('agree-all'); if(a) a.checked=allChecked;
}

/* ─────────────────────────────────────────────
   25. 찾기 (탭·인증코드)
───────────────────────────────────────────── */
function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach(function(b){ b.classList.remove('active'); });
  document.querySelectorAll('.tab-panel').forEach(function(p){ p.classList.remove('active'); });
  var btn=document.getElementById('tab-'+tab), panel=document.getElementById('find-'+tab+'-panel');
  if(btn) btn.classList.add('active');
  if(panel) panel.classList.add('active');
}
function sendVerifyCode(rowId){
  var row=document.getElementById(rowId); if(!row){ showToast('입력란을 찾을 수 없습니다.'); return; }
  row.style.display='block';
  var timerKey='timer-'+rowId.replace(/-/g,'_');
  startTimer(rowId==='find-phone-code'?'timer-find-id':rowId==='find-pw-code'?'timer-find-pw':'timer-su');
  showToast('인증번호가 발송되었습니다. (데모: 123456)');
}
function startTimer(timerId){
  var el=document.getElementById(timerId); if(!el) return;
  if(timerHandles[timerId]) clearInterval(timerHandles[timerId]);
  var secs=180;
  el.textContent='3:00';
  timerHandles[timerId]=setInterval(function(){
    secs--;
    var m=Math.floor(secs/60), s=secs%60;
    el.textContent=m+':'+(s<10?'0':'')+s;
    if(secs<=0){ clearInterval(timerHandles[timerId]); el.textContent='만료'; }
  },1000);
}

/* ─────────────────────────────────────────────
   26. 유틸
───────────────────────────────────────────── */
/* ─────────────────────────────────────────────
   데이터 영속성 (로컬 저장)
───────────────────────────────────────────── */
function saveUserData(){
  if(!userInfo.id) return;
  var key='caro_data_'+userInfo.id;
  try{
    localStorage.setItem(key, JSON.stringify({
      myReservations: myReservations.map(function(r){
        return Object.assign({},r,{
          start:r.start instanceof Date?r.start.toISOString():r.start,
          end:r.end instanceof Date?r.end.toISOString():r.end,
          returnedAt:r.returnedAt instanceof Date?r.returnedAt.toISOString():r.returnedAt||null
        });
      }),
      cancelledHistory: cancelledHistory.map(function(r){
        return Object.assign({},r,{
          start:r.start instanceof Date?r.start.toISOString():r.start,
          end:r.end instanceof Date?r.end.toISOString():r.end,
          cancelledAt:r.cancelledAt instanceof Date?r.cancelledAt.toISOString():r.cancelledAt
        });
      }),
      savedCards: savedCards
    }));
  }catch(e){}
}

function loadUserData(uid){
  /* ★ [v101] 서버(Firestore) 예약 데이터가 이미 이 계정으로 로드돼 있으면 로컬 캐시로 되돌리지 않는다.
     (예전엔 1.6초·2.8초·4.5초 타이머가 서버 데이터 도착 '뒤'에 로컬 캐시를 다시 덮어써 옛 상태가 보였다) */
  if(window.__caroResFromServer && userInfo && userInfo.uid && window.__caroResFromServer===userInfo.uid){
    try{ if(userInfo.id && typeof _origSaveUserData==='function') _origSaveUserData(); }catch(e){}   /* 캐시를 서버 상태로 갱신 */
    return;
  }
  /* 🔒 보안: 계정 전환 시 이전 계정 데이터를 먼저 완전 초기화(빈 계정이어도 남지 않도록) */
  myReservations=[]; cancelledHistory=[]; savedCards=[];
  var key='caro_data_'+uid;
  try{
    var raw=localStorage.getItem(key);
    /* ★ FIX: 저장은 아이디 키(caro_data_아이디)로 되는데 복원은 uid 키로 시도하던
       키 불일치 해결 — 못 찾으면 아이디 키로도 찾아본다 */
    if(!raw && userInfo && userInfo.id && userInfo.id!==uid) raw=localStorage.getItem('caro_data_'+userInfo.id);
    if(!raw){ try{ if(window.__caroResBaseline) window.__caroResBaseline('local'); }catch(e){} return; }
    var d=JSON.parse(raw);
    if(d.myReservations) myReservations=d.myReservations.map(function(r){
      return Object.assign({},r,{
        start:new Date(r.start),
        end:new Date(r.end),
        returnedAt:r.returnedAt?new Date(r.returnedAt):null
      });
    });
    if(d.cancelledHistory) cancelledHistory=d.cancelledHistory.map(function(r){
      return Object.assign({},r,{
        start:new Date(r.start),
        end:new Date(r.end),
        cancelledAt:new Date(r.cancelledAt)
      });
    });
    if(d.savedCards) savedCards=d.savedCards;
  }catch(e){}
  /* ★ [v101] 방금 로드한 로컬 캐시를 '기준선'으로 기록 → 이후 saveUserData 는 기준선과 달라진 예약만 서버에 올린다 */
  try{ if(window.__caroResBaseline) window.__caroResBaseline('local'); }catch(e){}
}
function val(id){ var e=document.getElementById(id); return e?e.value.trim():''; }

/* ─────────────────────────────────────────────
   27. 전역 등록
───────────────────────────────────────────── */
window.goTo=goTo; window.showToast=showToast;
window.handleLogin=handleLogin; window.handleLogout=handleLogout; window.socialLogin=socialLogin;
window.setLang=setLang; window.toggleLP=toggleLP; window.closeLangPicker=closeLangPicker;
window.showDevLoginTransition=showDevLoginTransition;
window.openHomeMenu=openHomeMenu; window.closeHomeMenu=closeHomeMenu;
window.toggleDrawer=toggleDrawer; window.closeDrawer=closeDrawer;
window.drawerMyPage=drawerMyPage; window.drawerChangePw=drawerChangePw; window.drawerChat=drawerChat;
window.drawerSetLang=drawerSetLang; window.moveSlide=moveSlide;
window.goBlackLabel=goBlackLabel;
window.selectCar=selectCar; window.renderCars=renderCars;
window.goToPayment=goToPayment; window.toggleCardInputs=toggleCardInputs; window.handlePayment=handlePayment;
window.fmtCardNum=fmtCardNum; window.fmtCardExp=fmtCardExp; window.fmtCardCvc=fmtCardCvc;
window.applyCoupon=applyCoupon; window.togglePoint=togglePoint;
window.updateDuration=updateDuration; window.updatePriceSummary=updatePriceSummary;
function openMpDetail(title){
  var titleEl = document.getElementById('mpd-title');
  var emptyEl = document.getElementById('mpd-empty-text');
  if(titleEl) titleEl.textContent = title;
  if(emptyEl) emptyEl.textContent = title+' 기능을 준비 중입니다.';
  goTo('account-detail-screen');
}
window.openMpDetail = openMpDetail;

/* ─────────────────────────────────────────────
   이용 내역
───────────────────────────────────────────── */
function renderUsageHistory(){
  var list=document.getElementById('usage-history-list'); if(!list) return;
  var all=[];
  var now=new Date();
  myReservations.forEach(function(r,i){
    var st='reserved';
    if(r.returned) st='returned';
    else if(now>=r.start&&now<=r.end) st='active';
    else if(now>r.end) st='overdue';
    all.push({r:r,idx:i,status:st});
  });
  cancelledHistory.forEach(function(r){
    all.push({r:r,idx:-1,status:'cancelled'});
  });
  all.sort(function(a,b){
    var da=a.status==='cancelled'?a.r.cancelledAt:a.r.start;
    var db=b.status==='cancelled'?b.r.cancelledAt:b.r.start;
    return db-da;
  });
  if(!all.length){
    list.innerHTML='<div class="empty-reservation"><div class="empty-icon">📋</div><div class="empty-text">이용 내역이 없습니다</div></div>';
    return;
  }
  list.innerHTML='';
  window.usageHistoryData=all;
  all.forEach(function(item,i){
    var r=item.r;
    var stMap={
      reserved:{label:'예약 완료',color:'#1d7a3a',bg:'rgba(29,122,58,.12)'},
      active:  {label:'대여 중',  color:'#b23a3a',bg:'rgba(178,58,58,.12)'},
      returned:{label:'반납 완료',color:'#888',   bg:'rgba(120,120,120,.1)'},
      overdue: {label:'반납 필요',color:'#b23a3a',bg:'rgba(178,58,58,.12)'},
      cancelled:{label:'취소됨',  color:'#b23a3a',bg:'rgba(178,58,58,.08)'}
    };
    var st=stMap[item.status]||stMap.reserved;
    var events=[];
    events.push({icon:'📅',label:'예약 완료',time:r.start,color:'#1d7a3a'});
    if(item.status==='cancelled'){
      events.push({icon:'🚫',label:'예약 취소',time:r.cancelledAt,color:'#b23a3a'});
      if(r.refundPct>0) events.push({icon:'💰',label:'환불 예정 '+r.refundAmt.toLocaleString()+'원 ('+r.refundPct+'%)',time:null,color:'#1d7a3a'});
      else events.push({icon:'💰',label:'환불 없음',time:null,color:'#888'});
    } else {
      var now2=new Date();
      if(now2>=r.start) events.push({icon:'🚗',label:'대여 시작',time:r.start,color:'#2563a8'});
      if(r.extendedMins) events.push({icon:'⏱',label:'시간 연장 (+'+fmtExtendedMins(r.extendedMins)+')',time:null,color:'#b07800'});
      if(r.returned) events.push({icon:'✅',label:'반납 완료',time:r.returnedAt,color:'#1d7a3a'});
    }
    var evHtml=events.map(function(ev){
      return '<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid rgba(0,0,0,.05);">'+
        '<span style="font-size:.9rem;flex-shrink:0;">'+ev.icon+'</span>'+
        '<span style="font-size:.78rem;font-weight:700;color:'+ev.color+';flex:1;">'+ev.label+'</span>'+
        (ev.time?'<span style="font-size:.72rem;color:var(--text-m);">'+fmtDT(ev.time)+'</span>':'')+
      '</div>';
    }).join('');
    var card=document.createElement('div'); card.className='my-res-card';
    card.innerHTML=
      '<div class="my-res-header">'+
        '<span class="my-res-no">'+r.bookNo+'</span>'+
        '<span class="my-res-status" style="background:'+st.bg+';color:'+st.color+'">'+st.label+'</span>'+
      '</div>'+
      '<div class="my-res-car-row">'+
        '<img class="my-res-img" src="'+r.car.img+'" alt="'+getCarName(r.car)+'"/>'+
        '<div>'+
          '<div class="my-res-car-name">'+getCarName(r.car)+'</div>'+
          '<div class="my-res-car-sub">'+fmtDT(r.start)+' ~ '+fmtDT(r.end)+'</div>'+
        '</div>'+
      '</div>'+
      '<div style="margin:8px 0;padding:8px 12px;background:rgba(0,0,0,.03);border-radius:10px;">'+evHtml+'</div>'+
      '<button class="detail-btn" onclick="openUsageDetail('+i+')">상세 내역 보기</button>';
    list.appendChild(card);
  });
}
window.renderUsageHistory=renderUsageHistory;

function openUsageDetail(i){
  var data=window.usageHistoryData; if(!data) return;
  var item=data[i]; if(!item) return;
  var r=item.r;
  var body=document.getElementById('usage-detail-body'); if(!body) return;
  var ins=r.ins||INSURANCE[0];
  var insName=currentLang==='en'?ins.nameen:currentLang==='ja'?ins.nameja:currentLang==='zh'?ins.namezh:ins.name;
  var isCancelled=item.status==='cancelled';
  var now=new Date();
  body.innerHTML=
    '<img style="width:100%;height:120px;object-fit:contain;border-radius:14px;margin-bottom:12px;background:#dde2ea;" src="'+r.car.img+'" alt="'+getCarName(r.car)+'"/>'+
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);margin-bottom:8px;">예약 정보</div>'+
      '<div style="display:flex;flex-direction:column;gap:5px;font-size:.82rem;">'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">예약번호</span><strong>'+r.bookNo+'</strong></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">차량</span><span>'+getCarName(r.car)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">대여</span><span>'+fmtDT(r.start)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">반납 예정</span><span>'+fmtDT(r.end)+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">이용 시간</span><span>'+r.hrs+'시간'+(r.extendedMins?' (+'+fmtExtendedMins(r.extendedMins)+' 연장)':'')+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">보험</span><span>'+insName+'</span></div>'+
        '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text-m);">결제 금액</span><strong style="color:var(--accent);">'+r.total.toLocaleString()+'원</strong></div>'+
      '</div>'+
    '</div>'+
    '<div style="background:rgba(240,244,250,.7);border-radius:14px;padding:12px 14px;margin-bottom:10px;">'+
      '<div style="font-size:.7rem;font-weight:700;color:var(--text-m);margin-bottom:10px;">이용 타임라인</div>'+
      '<div style="position:relative;padding-left:18px;border-left:2px solid rgba(0,0,0,.1);">'+
        '<div style="margin-bottom:12px;"><span style="font-size:.8rem;font-weight:700;color:#1d7a3a;">📅 예약 완료</span><div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">'+fmtDT(r.start)+'</div></div>'+
        (!isCancelled&&now>=r.start?'<div style="margin-bottom:12px;"><span style="font-size:.8rem;font-weight:700;color:#2563a8;">🚗 대여 시작</span><div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">'+fmtDT(r.start)+'</div></div>':'')+
        (r.extendedMins?'<div style="margin-bottom:12px;"><span style="font-size:.8rem;font-weight:700;color:#b07800;">⏱ 시간 연장</span><div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">+'+fmtExtendedMins(r.extendedMins)+' · 반납 변경: '+fmtDT(r.end)+'</div></div>':'')+
        (isCancelled?'<div style="margin-bottom:12px;"><span style="font-size:.8rem;font-weight:700;color:#b23a3a;">🚫 예약 취소</span><div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">'+fmtDT(r.cancelledAt)+'</div></div>':'')+
        (r.returned?'<div><span style="font-size:.8rem;font-weight:700;color:#1d7a3a;">✅ 반납 완료</span><div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">'+fmtDT(r.returnedAt)+'</div></div>':'')+
      '</div>'+
    '</div>'+
    (isCancelled?
      '<div style="background:'+(r.refundPct>0?'rgba(29,122,58,.08)':'rgba(178,58,58,.06)')+';border-radius:14px;padding:14px;border:1px solid '+(r.refundPct>0?'rgba(29,122,58,.2)':'rgba(178,58,58,.2)')+';text-align:center;">'+
        '<div style="font-size:.8rem;font-weight:700;color:'+(r.refundPct>0?'#1d7a3a':'#b23a3a')+';">환불 내역</div>'+
        '<div style="font-size:1rem;font-weight:700;margin-top:4px;color:'+(r.refundPct>0?'#1d7a3a':'#888')+';"> '+(r.refundPct>0?r.refundAmt.toLocaleString()+'원 ('+r.refundPct+'%) 환불 예정':'환불 없음')+'</div>'+
      '</div>'
    :'');
  openModal('usage-detail-modal');
}
window.openUsageDetail=openUsageDetail;

function closeUsageDetail(e){
  if(e&&e.target!==document.getElementById('usage-detail-modal')) return;
  closeModal('usage-detail-modal');
}
window.closeUsageDetail=closeUsageDetail;

window.openResDetail=openResDetail; window.closeResDetail=closeResDetail;
window.openHomeCtrl=openHomeCtrl; window.closeHomeCtrl=closeHomeCtrl; window.closeHomeCtrlDirect=closeHomeCtrlDirect;
window.openEventDetail=openEventDetail; window.closeEventDetail=closeEventDetail;
window.openNotice=openNotice; window.closeNotice=closeNotice;
window.openBLDetail=openBLDetail;
window.openAddCard=openAddCard; window.closeAddCard=closeAddCard; window.saveCard=saveCard; window.deleteCard=deleteCard;
window.switchTab=switchTab; window.sendVerifyCode=sendVerifyCode;
window.handleFindId=handleFindId; window.handleFindPw=handleFindPw;
window.goSignupStep=goSignupStep; window.handleSignup=handleSignup;
window.checkDuplicate=checkDuplicate; window.checkPwStrength=checkPwStrength;
window.toggleAllAgree=toggleAllAgree; window.syncAllCheck=syncAllCheck;
window.openTerms=openTerms; window.closeTermsBg=closeTermsBg; window.closeTerms=closeTerms;

/* ══ 안드로이드 PWA 설치 배너 ══ */
var androidInstallPrompt = null;

/* beforeinstallprompt — 안드로이드 크롬에서 발생 */
window.addEventListener('beforeinstallprompt', function(e){
  e.preventDefault();
  androidInstallPrompt = e;
  var dismissed = false;
  try{ dismissed = !!localStorage.getItem('caro_android_banner'); }catch(ex){}
  if(!dismissed){
    setTimeout(function(){
      var b = document.getElementById('android-install-banner');
      if(b) b.style.display = 'block';
    }, 3000);
  }
});

/* 설치 버튼 클릭 */
function triggerAndroidInstall(){
  if(!androidInstallPrompt) return;
  androidInstallPrompt.prompt();
  androidInstallPrompt.userChoice.then(function(result){
    if(result.outcome === 'accepted'){
      dismissAndroidBanner();
    }
    androidInstallPrompt = null;
  });
}

/* 배너 닫기 */
function dismissAndroidBanner(){
  var b = document.getElementById('android-install-banner');
  if(b) b.style.display = 'none';
  try{ localStorage.setItem('caro_android_banner','1'); }catch(e){}
}

/* 앱으로 설치 완료 감지 */
window.addEventListener('appinstalled', function(){
  dismissAndroidBanner();
  showToast('✅ CARO MOBILITY 앱이 설치되었습니다!');
});

window.triggerAndroidInstall = triggerAndroidInstall;
window.dismissAndroidBanner  = dismissAndroidBanner;
/* ── 결제 정보 / 운전면허 화면 ── */
function renderPayMethods(){
  var label=document.getElementById('pay-selected-label');
  if(!label) return;
  if(savedCards.length===0){
    label.textContent='결제 수단 선택';
  } else {
    var c=savedCards[0];
    label.textContent=(c.alias||'카드')+' '+c.last4+' / 개인';
  }
  /* BL 모드 시 결제 수단 버튼 색상 적용 */
  var isbl=!!(selectedCar&&selectedCar.isBlackLabel);
  var btns=document.querySelectorAll('#payment-screen .pay-method-btn, #payment-screen [onclick*="openPaySheet"], #payment-screen .pay-select-row');
  btns.forEach(function(btn){
    if(isbl){
      btn.style.background='rgba(200,169,110,.12)';
      btn.style.borderColor='rgba(200,169,110,.35)';
      btn.style.color='rgba(200,169,110,.9)';
    } else {
      btn.style.background='';
      btn.style.borderColor='';
      btn.style.color='';
    }
  });
}

function renderPaymentInfoScreen(){
  var list=document.getElementById('pi-card-list'); if(!list) return;
  if(!savedCards.length){
    list.innerHTML='<div style="padding:10px 0;font-size:.82rem;color:var(--text-m);">등록된 카드가 없습니다.</div>';
  } else {
    list.innerHTML='';
    savedCards.forEach(function(card,i){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--border);';
      row.innerHTML=
        '<div>'+
          '<div style="font-size:.88rem;font-weight:700;color:var(--text-1);">'+(card.alias||'카드')+' •••• '+card.last4+'</div>'+
          '<div style="font-size:.72rem;color:var(--text-m);">'+(card.exp||'')+'</div>'+
        '</div>'+
        '<button onclick="deletePICard('+i+')" style="background:none;border:1px solid rgba(178,58,58,.3);color:#b23a3a;padding:5px 10px;border-radius:var(--r);font-size:.76rem;cursor:pointer;font-family:var(--font);">삭제</button>';
      list.appendChild(row);
    });
  }
  var lic=document.getElementById('pi-license');
  if(lic) lic.value=userInfo.license||'';
}

function saveCardFromPI(){
  var num=document.getElementById('pi-card-num');
  var exp=document.getElementById('pi-card-exp');
  var cvc=document.getElementById('pi-card-cvc');
  var alias=document.getElementById('pi-card-alias');
  if(!num||!caroCardOk(num.value)){showToast('카드 번호를 올바르게 입력해 주세요. (일반 16자리 / AMEX 15자리)');return;}
  if(!exp||!exp.value){showToast('유효기간을 입력해 주세요.');return;}
  if(!cvc||cvc.value.length<3){showToast('CVC를 입력해 주세요.');return;}
  var last4=num.value.replace(/\s/g,'').slice(-4);
  savedCards.push({last4:last4,exp:exp.value,alias:alias?alias.value.trim():''});
  num.value='';exp.value='';cvc.value='';if(alias)alias.value='';
  saveUserData();
  renderPaymentInfoScreen();
  showToast('카드가 등록되었습니다 💳');
}

function deletePICard(idx){
  savedCards.splice(idx,1);
  saveUserData();
  renderPaymentInfoScreen();
  showToast('카드가 삭제되었습니다.');
}

function saveLicenseFromPI(){
  var inp=document.getElementById('pi-license');
  if(!inp||!inp.value.trim()){showToast('운전면허 번호를 입력해 주세요.');return;}
  /* ★ [v101] 서버(users.license 표준형)에 먼저 저장하고, 성공했을 때만 '저장됨' 안내.
     예전엔 메모리에만 넣고 성공 토스트 → 앱을 다시 켜면 사라졌다. */
  var lic={number:inp.value.trim(), name:userInfo.name||'', birth:userInfo.birth||'', type:'', expiry:'', verified:false};
  if(!fbReady()||!userInfo.uid){ showToast('로그인 상태를 확인할 수 없어 저장하지 못했어요. 잠시 후 다시 시도해 주세요.'); return; }
  caroSaveLicense(lic).then(function(ok){
    if(ok){ showToast('운전면허가 저장되었습니다 ✅'); try{ renderPaymentInfoScreen(); }catch(e){} }
    else showToast('면허 저장에 실패했어요. 네트워크를 확인한 뒤 다시 시도해 주세요.');
  });
}

window.renderPayMethods=renderPayMethods;
window.renderPaymentInfoScreen=renderPaymentInfoScreen;
window.saveCardFromPI=saveCardFromPI;
window.deletePICard=deletePICard;
var _selectedPayIdx=0;
function openPaySheet(){
  var list=document.getElementById('pay-sheet-list'); if(!list) return;
  list.innerHTML='';
  var isbl=!!(selectedCar&&selectedCar.isBlackLabel);
  savedCards.forEach(function(card,i){
    var row=document.createElement('div');
    row.style.cssText='display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid '+(isbl?'rgba(200,169,110,.2)':'var(--border)')+';cursor:pointer;';
    row.onclick=function(){ _selectedPayIdx=i; renderPaySheetSelection(); };
    row.innerHTML='<div id="pay-radio-'+i+'" style="width:22px;height:22px;border-radius:50%;border:2px solid '+(i===_selectedPayIdx?(isbl?'#c8a96e':'#1a6cff'):'var(--border)')+';background:'+(i===_selectedPayIdx?(isbl?'#c8a96e':'#1a6cff'):'transparent')+';display:flex;align-items:center;justify-content:center;flex-shrink:0;">'+(i===_selectedPayIdx?'<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>':'')+'</div><span style="font-size:.95rem;font-weight:600;color:'+(isbl?'rgba(200,169,110,.9)':'var(--text-1)')+';">'+(card.alias||'카드')+' '+card.last4+' / 개인</span>';
    list.appendChild(row);
  });
  if(!savedCards.length) list.innerHTML='<div style="padding:14px 0;font-size:.86rem;color:'+(isbl?'rgba(200,169,110,.5)':'var(--text-m)')+';">등록된 카드가 없습니다.</div>';
  /* BL 모달 스타일 */
  var overlay=document.getElementById('pay-sheet-overlay');
  var box=overlay?overlay.querySelector('.modal-box'):null;
  if(box){
    box.style.background=isbl?'#111215':'';
    box.style.border=isbl?'1px solid rgba(200,169,110,.3)':'';
    /* 타이틀 */
    var titleEl=box.querySelector('div[style*="font-size:1.1rem"]');
    if(titleEl){ titleEl.style.color=isbl?'rgba(200,169,110,.9)':''; titleEl.style.fontFamily=isbl?"'Oswald',sans-serif":''; titleEl.style.letterSpacing=isbl?'.1em':''; }
    /* 추가 버튼 */
    var addBtn=box.querySelector('button[onclick*="payment-info-screen"]');
    if(addBtn){ addBtn.style.color=isbl?'rgba(200,169,110,.5)':''; addBtn.style.borderTopColor=isbl?'rgba(200,169,110,.2)':''; }
    /* 확인 버튼 */
    var confirmBtn=box.querySelector('button[onclick*="confirmPaySheet"]');
    if(confirmBtn){ confirmBtn.style.background=isbl?'linear-gradient(135deg,#c8a96e,#a07840)':''; confirmBtn.style.color=isbl?'#18191c':''; confirmBtn.style.fontFamily=isbl?"'Oswald',sans-serif":''; confirmBtn.style.letterSpacing=isbl?'.1em':''; }
  }
  openModal('pay-sheet-overlay');
}
function renderPaySheetSelection(){
  savedCards.forEach(function(card,i){
    var el=document.getElementById('pay-radio-'+i); if(!el) return;
    el.style.borderColor=i===_selectedPayIdx?'#1a6cff':'var(--border)';
    el.style.background=i===_selectedPayIdx?'#1a6cff':'transparent';
    el.innerHTML=i===_selectedPayIdx?'<div style="width:8px;height:8px;border-radius:50%;background:#fff;"></div>':'';
  });
}
function confirmPaySheet(){
  var label=document.getElementById('pay-selected-label');
  if(savedCards.length&&label){
    var c=savedCards[_selectedPayIdx]||savedCards[0];
    label.textContent=(c.alias||'카드')+' '+c.last4+' / 개인';
  }
  closeModal('pay-sheet-overlay');
}
function closePaySheet(e){
  if(e&&e.target!==document.getElementById('pay-sheet-overlay')) return;
  closeModal('pay-sheet-overlay');
}
window.openPaySheet=openPaySheet;
window.confirmPaySheet=confirmPaySheet;
window.closePaySheet=closePaySheet;
window.saveLicenseFromPI=saveLicenseFromPI;

/* ── 안드로이드 뒤로가기 버튼 처리 ── */
var _caroGoTo = goTo;
goTo = function(screenId, immediate) {
  _caroGoTo(screenId, immediate);
  history.pushState({screen: screenId}, '', '');
};

history.replaceState({screen: 'splash-screen'}, '', '');

var _backMap = {
  'login-screen': 'main-screen',
  'signup-screen': 'main-screen',
  'find-screen': 'main-screen',
  'cs-screen': 'home-screen',
  'usage-history-screen': 'home-screen',
  'event-screen': 'home-screen',
  'mypage-screen': 'home-screen',
  'account-detail-screen': 'mypage-screen',
  'my-reservation-screen': 'home-screen',
  'rental-screen': 'home-screen',
  'black-label-screen': 'home-screen',
  'bl-detail-screen': 'black-label-screen',
  'reservation-screen': selectedCar&&selectedCar.isBlackLabel?'black-label-screen':'rental-screen',
  'payment-screen': 'reservation-screen',
  'payment-info-screen': 'home-screen',
  'done-screen': 'home-screen',
};

window.addEventListener('popstate', function(e) {
  var active = document.querySelector('.screen.active');
  if (!active) return;
  var target = _backMap[active.id];
  if(active.id==='reservation-screen'){
    target=selectedCar&&selectedCar.isBlackLabel?'black-label-screen':'rental-screen';
  }
  if (target) {
    _caroGoTo(target);
  }
});
function goToDoneHome(){
  window._caroLoggedIn = true;

  /* 모든 화면 초기화 */
  var allScreens=document.querySelectorAll('.screen');
  allScreens.forEach(function(s){ s.classList.remove('active','exit'); });

  /* 1. 로그인 상태 즉시 복원 */
  try{
    var al=localStorage.getItem('caro_auto_login');
    var aid=localStorage.getItem('caro_auto_id');
    var aname=localStorage.getItem('caro_auto_name')||aid;
    if(al==='1'&&aid){
      userInfo.id=aid;
      userInfo.name=aname;
      userInfo.uid='';
      /* 예약 데이터 즉시 복원 */
      var key='caro_data_'+aid;
      try{
        var raw=localStorage.getItem(key);
        if(raw){
          var d=JSON.parse(raw);
          if(d.myReservations) myReservations=d.myReservations.map(function(r){
                      return Object.assign({},r,{
                        start:new Date(r.start),
                        end:new Date(r.end),
                        returnedAt:r.returnedAt?new Date(r.returnedAt):null
                      });
                    });
                    if(d.cancelledHistory) cancelledHistory=d.cancelledHistory.map(function(r){
                      return Object.assign({},r,{
                        start:new Date(r.start),
                        end:new Date(r.end),
                        cancelledAt:new Date(r.cancelledAt)
                      });
                    });
                    if(d.savedCards) savedCards=d.savedCards;
        }
        try{ if(window.__caroResBaseline) window.__caroResBaseline('local'); }catch(e3){}   /* ★ [v101] 기준선 */
      }catch(e2){}
      startSessionTimer();
      /* 홈 화면 텍스트 즉시 업데이트 */
      var wn=document.getElementById('home-welcome-name');
      if(wn) wn.textContent=aname+' 님, 안녕하세요 👋';
      var hn=document.getElementById('hmenu-name');
      var hi=document.getElementById('hmenu-id');
      if(hn) hn.textContent=aname;
      if(hi) hi.textContent=aid;
    }
  }catch(e){}

  /* ★★ FIX(데이터 소실): 새로고침/앱 재시작 시 Firebase 세션을 반드시 재확립하고,
     서버(Firestore)에서 예약·카드·면허 데이터를 다시 불러온다.
     ─ 기존 문제: uid가 빈 값으로 남아 서버 동기화 리스너가 영영 시작되지 않음
       → 새로고침·기기변경 시 데이터가 "사라진 것처럼" 보였음. */
  (function(){
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      var fb=window.FB_AUTH, fn=window.FB_FN;
      if(fb&&fn){
        clearInterval(iv);
        var applied=false;
        var apply=function(u){
          if(!u||applied) return; applied=true;
          userInfo.uid=u.uid;
          try{ if(userInfo.id) loadUserData(userInfo.id); }catch(e){}
          /* ★ [v101] 순서: ① 아직 서버에 못 올린 예약(대기열)만 올리고 ② 서버 리스너 시작.
             예전엔 로컬 캐시 '전부'를 서버에 덮어쓴 뒤 리스너를 켜서, 관제에서 바꾼 상태가 되돌아갔다. */
          try{ if(typeof flushPendingReservations==='function') flushPendingReservations(); }catch(e){}
          try{ startReservationsListener(); }catch(e){}
          try{ if(window.caroSyncPull) window.caroSyncPull(u.uid); }catch(e){}
          try{ renderMyReservations(); renderCars(); }catch(e){}
          console.log('✅ 세션 재확립 완료 — 서버 동기화 시작 (uid:'+u.uid.slice(0,6)+'…)');
        };
        if(fb.currentUser){ apply(fb.currentUser); return; }
        try{ fn.onAuthStateChanged(fb,function(u){ if(u) apply(u); }); }catch(e){}
        /* 3초 내 세션 복원이 안 되면 저장된 자동로그인 정보로 조용히 재인증 */
        setTimeout(function(){
          if(applied||fb.currentUser) return;
          var aid2=null,apw=null;
          try{ aid2=localStorage.getItem('caro_auto_id'); apw=null; }catch(e){}   /* ★ FIX(H2): 평문 비밀번호 재인증 제거 — Firebase persistence 가 세션을 복원함 */
          if(aid2&&apw&&typeof fn.signInWithEmailAndPassword==='function'){
            var em=aid2.indexOf('@')>=0?aid2:(aid2+'@caro.app');
            fn.signInWithEmailAndPassword(fb,em,apw)
              .then(function(c){ apply(c.user); })
              .catch(function(e){ console.warn('⚠️ 자동 재인증 실패:',e&&e.code); });
          }
        },3000);
      }
      if(tries>24) clearInterval(iv);
    },500);
  })();

  /* 2. 홈 화면으로 이동 */
    /* 2. 홈 화면으로 이동 */
      _caroGoTo('home-screen',true);
      history.replaceState({screen:'home-screen'},'','');

  /* 3. 홈 화면 기능 초기화 */
  setTimeout(function(){
    showHomeCtrlSwitch();
    var sw=document.getElementById('home-ctrl-switch');
    if(sw&&userInfo.id) sw.classList.add('visible');
    renderMyReservations();
    renderCars();
    updateHomeMenuBtn('home-screen');
    var menuBtn=document.getElementById('home-menu-btn');
    if(menuBtn) menuBtn.classList.remove('hidden');
  },100);
}
window.goToDoneHome=goToDoneHome;
/* ─────────────────────────────────────────────
   회원 탈퇴 시스템
───────────────────────────────────────────── */
var WITHDRAW_KEY='caro_withdrawn_v1';

function getWithdrawnInfo(id){
  try{
    var raw=localStorage.getItem(WITHDRAW_KEY);
    if(!raw) return null;
    var info=JSON.parse(raw);
    if(id&&info.id!==id) return null;
    return info;
  }catch(e){return null;}
}

function openWithdrawal(){
  var chk=document.getElementById('withdraw-agree-chk');
  var box=document.getElementById('withdraw-agree-box');
  var btn=document.getElementById('withdraw-confirm-btn');
  var row=document.getElementById('withdraw-agree-row');
  if(chk) chk.checked=false;
  if(box){box.style.background='rgba(255,255,255,.06)';box.style.borderColor='rgba(178,58,58,.4)';box.innerHTML='';}
  if(btn){btn.disabled=true;btn.style.background='rgba(178,58,58,.06)';btn.style.color='rgba(178,58,58,.4)';btn.style.cursor='not-allowed';btn.style.borderColor='rgba(178,58,58,.2)';}
  if(row) row.style.background='rgba(178,58,58,.06)';
  openModal('withdraw-confirm-modal');
}

function onWithdrawAgreeChange(){
  var chk=document.getElementById('withdraw-agree-chk');
  var box=document.getElementById('withdraw-agree-box');
  var btn=document.getElementById('withdraw-confirm-btn');
  var row=document.getElementById('withdraw-agree-row');
  if(!chk) return;
  chk.checked=!chk.checked;
  var checked=chk.checked;
  if(box){
    box.style.background=checked?'#b23a3a':'rgba(255,255,255,.06)';
    box.style.borderColor=checked?'#b23a3a':'rgba(178,58,58,.4)';
    box.innerHTML=checked?'<svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':'';
  }
  if(row) row.style.background=checked?'rgba(178,58,58,.12)':'rgba(178,58,58,.06)';
  if(btn){
    btn.disabled=!checked;
    btn.style.background=checked?'rgba(178,58,58,.12)':'rgba(178,58,58,.06)';
    btn.style.color=checked?'#b23a3a':'rgba(178,58,58,.4)';
    btn.style.cursor=checked?'pointer':'not-allowed';
    btn.style.borderColor=checked?'rgba(178,58,58,.5)':'rgba(178,58,58,.2)';
  }
}

function confirmWithdrawal(){
  var chk=document.getElementById('withdraw-agree-chk');
  if(!chk||!chk.checked){showToast('동의 체크를 해주세요.');return;}
  /* 탈퇴 정보 백업 */
  var info={
    id:userInfo.id, email:userInfo.email, name:userInfo.name,
    withdrawnAt:new Date().toISOString(),
    userData:null, localUserData:null
  };
  try{var raw=localStorage.getItem('caro_data_'+userInfo.id);if(raw) info.userData=JSON.parse(raw);}catch(e){}
  try{var db=localLoadUsers();if(db[userInfo.id]) info.localUserData=db[userInfo.id];}catch(e){}
  /* 탈퇴 기록 저장 */
  try{localStorage.setItem(WITHDRAW_KEY,JSON.stringify(info));}catch(e){}
  /* 데이터 삭제 */
  try{
    localStorage.removeItem('caro_data_'+userInfo.id);
    var db2=localLoadUsers(); delete db2[userInfo.id]; localSaveUsers(db2);
  }catch(e){}
  /* ★ [v101] 탈퇴 사실을 서버(users/{uid})에도 기록 — 예전엔 이 폰에만 남아 다른 기기·재설치에서 그대로 로그인됐다 */
  var uidW=userInfo.uid||(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.uid)||'';
  var srvP=Promise.resolve();
  if(fbReady()&&uidW){
    try{ srvP=window.FB_FN.setDoc(window.FB_FN.doc(window.FB_DB,'users',uidW),{withdrawalPending:true, withdrawnAt:info.withdrawnAt},{merge:true}).catch(function(e){ console.warn('탈퇴 기록 실패:',e&&e.code); }); }catch(e){}
  }
  closeModal('withdraw-confirm-modal');
  showToast('탈퇴 완료. 7일 이내 로그인 시 복구 가능합니다.');
  srvP.then(function(){
    /* Firebase 로그아웃 (계정 삭제 X — 7일 유예) */
    if(fbReady()){try{window.FB_FN.signOut(window.FB_AUTH);}catch(e){}}
    setTimeout(function(){handleLogout();},1200);
  });
}

function closeWithdrawConfirmModal(e){
  if(e&&e.target!==document.getElementById('withdraw-confirm-modal')) return;
  closeModal('withdraw-confirm-modal');
}

function checkWithdrawalOnLogin(id, onNormal, onWithdrawn, uidArg){
  var info=getWithdrawnInfo(id);
  if(info){
    var daysDiff=(new Date()-new Date(info.withdrawnAt))/(1000*60*60*24);
    if(daysDiff>7){ localStorage.removeItem(WITHDRAW_KEY); }
    else { onWithdrawn(info,daysDiff); return; }
  }
  /* ★ [v101] 이 폰에 기록이 없어도 서버(users/{uid}.withdrawalPending)를 확인 — 다른 기기·재설치 대응 */
  var uid=uidArg||(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.uid)||'';
  if(!fbReady()||!uid){ onNormal(); return; }
  var fn=window.FB_FN;
  fn.getDoc(fn.doc(window.FB_DB,'users',uid)).then(function(s){
    var d=(s&&s.exists&&s.exists())?s.data():null;
    if(!d||!d.withdrawalPending||!d.withdrawnAt){ onNormal(); return; }
    var days=(Date.now()-Date.parse(d.withdrawnAt))/(1000*60*60*24);
    if(days>7){
      /* 유예 기간 종료 — 운영팀이 정리하기 전까지 이용 차단 */
      try{ fn.signOut(window.FB_AUTH); }catch(e){}
      var er=document.getElementById('login-error'); if(er) er.textContent='탈퇴 처리된 계정입니다. 다시 이용하시려면 고객센터로 문의해 주세요.';
      showToast('탈퇴 처리된 계정입니다. 고객센터로 문의해 주세요.');
      var b=document.querySelector('#login-screen .submit-btn'); if(b) b.disabled=false;
      return;
    }
    var info2={id:id, uid:uid, email:d.email||'', name:d.name||'', withdrawnAt:d.withdrawnAt, userData:null, localUserData:null, fromServer:true};
    onWithdrawn(info2, days);
  }).catch(function(){ onNormal(); });
}

function showWithdrawCancelModal(info,daysDiff,loginCompleteFn){
  window._pendingWithdrawInfo=info;
  window._pendingLoginComplete=loginCompleteFn||null;
  var daysLeft=Math.ceil(7-daysDiff);
  var desc=document.getElementById('withdraw-cancel-desc');
  if(desc) desc.innerHTML='탈퇴 후 <strong>'+daysLeft+'일</strong>이 남았습니다.<br>탈퇴를 해지하고 계속 이용하시겠습니까?';
  var chk=document.getElementById('withdraw-cancel-chk');
  var box=document.getElementById('withdraw-cancel-box');
  var btn=document.getElementById('withdraw-cancel-btn');
  var row=document.getElementById('withdraw-cancel-row');
  if(chk) chk.checked=false;
  if(box){box.style.background='rgba(255,255,255,.06)';box.style.borderColor='rgba(29,122,58,.4)';box.innerHTML='';}
  if(btn){btn.disabled=true;btn.style.background='rgba(29,122,58,.06)';btn.style.color='rgba(29,122,58,.4)';btn.style.cursor='not-allowed';btn.style.borderColor='rgba(29,122,58,.2)';}
  if(row) row.style.background='rgba(29,122,58,.06)';
  openModal('withdraw-cancel-modal');
}

function onWithdrawCancelChange(){
  var chk=document.getElementById('withdraw-cancel-chk');
  var box=document.getElementById('withdraw-cancel-box');
  var btn=document.getElementById('withdraw-cancel-btn');
  var row=document.getElementById('withdraw-cancel-row');
  if(!chk) return;
  chk.checked=!chk.checked;
  var checked=chk.checked;
  if(box){
    box.style.background=checked?'#1d7a3a':'rgba(255,255,255,.06)';
    box.style.borderColor=checked?'#1d7a3a':'rgba(29,122,58,.4)';
    box.innerHTML=checked?'<svg width="12" height="9" viewBox="0 0 12 9"><polyline points="1,5 4,8 11,1" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>':'';
  }
  if(row) row.style.background=checked?'rgba(29,122,58,.12)':'rgba(29,122,58,.06)';
  if(btn){
    btn.disabled=!checked;
    btn.style.background=checked?'rgba(29,122,58,.12)':'rgba(29,122,58,.06)';
    btn.style.color=checked?'#1d7a3a':'rgba(29,122,58,.4)';
    btn.style.cursor=checked?'pointer':'not-allowed';
    btn.style.borderColor=checked?'rgba(29,122,58,.5)':'rgba(29,122,58,.2)';
  }
}

function cancelWithdrawal(){
  var chk=document.getElementById('withdraw-cancel-chk');
  if(!chk||!chk.checked){showToast('탈퇴 해지 동의를 체크해주세요.');return;}
  var info=window._pendingWithdrawInfo; if(!info) return;
  /* 데이터 복구 */
  try{if(info.userData) localStorage.setItem('caro_data_'+info.id,JSON.stringify(info.userData));}catch(e){}
  try{if(info.localUserData){var db=localLoadUsers();db[info.id]=info.localUserData;localSaveUsers(db);}}catch(e){}
  localStorage.removeItem(WITHDRAW_KEY);
  /* ★ [v101] 서버 기록도 해제 */
  try{
    var uidC=(window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.uid)||userInfo.uid||(info&&info.uid)||'';
    if(fbReady()&&uidC) window.FB_FN.setDoc(window.FB_FN.doc(window.FB_DB,'users',uidC),{withdrawalPending:false, withdrawnAt:null, withdrawalCancelledAt:new Date().toISOString()},{merge:true}).catch(function(){});
  }catch(e){}
  window._pendingWithdrawInfo=null;
  closeModal('withdraw-cancel-modal');
  showToast('✅ 탈퇴가 해지되었습니다! 계속 이용하실 수 있습니다 🎉');
  if(window._pendingLoginComplete){window._pendingLoginComplete();window._pendingLoginComplete=null;}
}

function proceedLogoutAfterWithdraw(){
  closeModal('withdraw-cancel-modal');
  window._pendingWithdrawInfo=null;
  window._pendingLoginComplete=null;
  userInfo={id:'',email:'',license:'',name:''};
  try{ if(fbReady()) window.FB_FN.signOut(window.FB_AUTH); }catch(e){}   /* ★ [v101] 로그인 세션 정리 */
  try{ localStorage.removeItem('caro_auto_login'); localStorage.removeItem('caro_auto_id'); localStorage.removeItem('caro_auto_name'); }catch(e){}
  goTo('main-screen');
}

window.openWithdrawal=openWithdrawal;
window.onWithdrawAgreeChange=onWithdrawAgreeChange;
window.confirmWithdrawal=confirmWithdrawal;
window.closeWithdrawConfirmModal=closeWithdrawConfirmModal;
window.onWithdrawCancelChange=onWithdrawCancelChange;
window.cancelWithdrawal=cancelWithdrawal;
window.proceedLogoutAfterWithdraw=proceedLogoutAfterWithdraw;

/* ════════════════════════════════════════════════════════
   🌐 CARO MOBILITY — Firestore 통합 실시간 동기화
   PC ↔ 안드로이드 ↔ iOS
   ──────────────────────────────────────────────────────── */

var FS_CARS_COL = 'cars';
var FS_BL_COL = 'bl_cars';
var FS_RES_COL = 'reservations';
var fsCarsUnsub = null, fsBlUnsub = null, fsResUnsub = null;
var fsLastWriteTime = 0;
var fsResLastWrite = 0;

function isDevUser(){ return userInfo && userInfo.id === 'CAROMOBILITY'; }

function detectDeviceInfo(){
  var ua = navigator.userAgent, platform = 'PC';
  if(/Android/i.test(ua)) platform = 'Android';
  else if(/iPhone|iPad|iPod/i.test(ua)) platform = 'iOS';
  else if(/Mac/i.test(ua)) platform = 'Mac';
  else if(/Windows/i.test(ua)) platform = 'Windows';
  var isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  return { platform: platform, isApp: isStandalone, screenW: screen.width, screenH: screen.height, lang: currentLang||'ko', ua: ua.slice(0,200) };
}
window.detectDeviceInfo = detectDeviceInfo;

/* 1. 차량 데이터 동기화 */
function compressImageBase64(dataUrl, maxW, maxH, quality){
  maxW=maxW||800; maxH=maxH||600; quality=quality||0.78;
  return new Promise(function(resolve){
    if(!dataUrl||dataUrl.indexOf('data:')!==0){resolve(dataUrl);return;}
    var img=new Image();
    img.onload=function(){
      var w=img.width,h=img.height,r=Math.min(maxW/w,maxH/h,1);
      w=Math.round(w*r); h=Math.round(h*r);
      var c=document.createElement('canvas');
      c.width=w; c.height=h;
      c.getContext('2d').drawImage(img,0,0,w,h);
      try{resolve(c.toDataURL('image/jpeg',quality));}catch(e){resolve(dataUrl);}
    };
    img.onerror=function(){resolve(dataUrl);};
    img.src=dataUrl;
  });
}
window.compressImageBase64=compressImageBase64;

function syncCarToFirestore(car, isBL){
  if(!fbReady()) return Promise.resolve();
  var fn=window.FB_FN, db=window.FB_DB;
  if(typeof fn.setDoc!=='function') return Promise.resolve();
  var col=isBL?FS_BL_COL:FS_CARS_COL, docId=String(car.id);
  var doUpload=function(d){return fn.setDoc(fn.doc(db,col,docId),d).catch(function(e){console.error('🔴 차량 업로드 실패:',car.name,e);});};
  if(car.img&&car.img.indexOf('data:image')===0&&car.img.length>200*1024){
    return compressImageBase64(car.img,800,600,0.78).then(function(comp){
      console.log('📷 압축:',car.name,Math.round(car.img.length/1024)+'KB →',Math.round(comp.length/1024)+'KB');
      return doUpload(Object.assign({},car,{img:comp}));
    });
  }
  return doUpload(car);
}

function syncAllCarsToFirestore(){
  if(!fbReady()||!isDevUser()) return;
  if(Date.now()-fsLastWriteTime<1500) return;
  fsLastWriteTime=Date.now();
  var ps=[];
  CARS_DATA.forEach(function(c){ps.push(syncCarToFirestore(c,false));});
  BL_CARS.forEach(function(c){ps.push(syncCarToFirestore(c,true));});
  Promise.all(ps).then(function(){console.log('✅ 차량 동기화:',CARS_DATA.length+BL_CARS.length,'대');});
}

function deleteCarFromFirestore(carId, isBL){
  if(!fbReady()||!isDevUser()) return Promise.resolve();
  var fn=window.FB_FN, db=window.FB_DB;
  if(typeof fn.deleteDoc!=='function') return Promise.resolve();
  return fn.deleteDoc(fn.doc(db,isBL?FS_BL_COL:FS_CARS_COL,String(carId))).catch(function(e){console.error('차량 삭제 실패:',e);});
}

/* ★ [v101] 차량 사진 기본값 (연회색 측면 실루엣, data URI) */
var CARO_CAR_PLACEHOLDER='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 104"><rect width="200" height="104" rx="14" fill="#eef0f3"/><path d="M28 66c0-6 4-10 10-10h14l18-20c3-3 6-4 10-4h44c5 0 8 2 11 5l16 19h13c6 0 10 4 10 10v10c0 3-2 5-5 5H33c-3 0-5-2-5-5V66z" fill="#c9ced6"/><path d="M76 56l14-16h28l14 16H76z" fill="#eef0f3"/><circle cx="62" cy="80" r="11" fill="#7d8591"/><circle cx="62" cy="80" r="5" fill="#eef0f3"/><circle cx="146" cy="80" r="11" fill="#7d8591"/><circle cx="146" cy="80" r="5" fill="#eef0f3"/></svg>');
window.CARO_CAR_PLACEHOLDER=CARO_CAR_PLACEHOLDER;
function normalizeCarStatus(c){
  /* 어드민은 status:'unavailable', 대시보드는 devDisabled 를 씀 → 하나로 통일 */
  try{
    var s=(''+(c && c.status || '')).toLowerCase();
    var unavail = (c && c.devDisabled===true) || /unavail|maint|점검|off|disable|사고|고장|불가/.test(s);
    c.devDisabled = !!unavail;
    if(unavail){ if(s==='available'||s===''){ c.status='unavailable'; } }
    else { if(s===''||s==='unavailable'){ c.status='available'; } }
    /* 이미지 필드 통일: 어드민은 image, 앱은 img */
    if(c.img===CARO_CAR_PLACEHOLDER) c.img='';        /* 기본 실루엣이 저장돼 있으면 없는 것으로 취급 (실제 사진이 들어오면 교체되도록) */
    if(c.image===CARO_CAR_PLACEHOLDER) c.image='';
    if(!c.img && c.image) c.img=c.image;
    if(!c.image && c.img) c.image=c.img;
    /* ★ [v101] 사진 없이 등록된 차량 → 기본 실루엣 (예전엔 src="undefined" 로 깨진 그림·404 요청 발생) */
    if(!c.img){ c.img=CARO_CAR_PLACEHOLDER; c.image=CARO_CAR_PLACEHOLDER; c.imgPlaceholder=true; }
    /* ★ FIX(H10): 관제(admin-cars.js)는 price/plate 로 저장하고 앱은 pricePerHour/carNumber 를 읽어
       관제에서 등록한 차량이 0원/시간으로 표시·청구되던 불일치 보정 */
    if((c.pricePerHour==null || c.pricePerHour==='') && c.price!=null && c.price!=='') c.pricePerHour=+c.price||0;
    if(!c.carNumber && c.plate) c.carNumber=c.plate;
    if(!c.model && c.name) c.model=c.name;
  }catch(e){}
  return c;
}
window.normalizeCarStatus=normalizeCarStatus;

function startCarsListener(){
  if(!fbReady()) return;
  var fn=window.FB_FN, db=window.FB_DB;
  if(typeof fn.collection!=='function'||typeof fn.onSnapshot!=='function') return;
  if(fsCarsUnsub) try{fsCarsUnsub();}catch(e){}
  if(fsBlUnsub) try{fsBlUnsub();}catch(e){}
  try{
    fsCarsUnsub=fn.onSnapshot(fn.collection(db,FS_CARS_COL),function(snap){
      if(Date.now()-fsLastWriteTime<1000) return;
      var nc=[]; snap.forEach(function(d){ var x=d.data()||{}; if(x.id==null||x.id==='') x.id=d.id; /* ★ 문서 id 보강 */ nc.push(normalizeCarStatus(x)); });
      CARS_DATA=nc;
      try{localStorage.setItem(CARS_STORAGE_KEY,JSON.stringify(CARS_DATA));}catch(e){}
      if(typeof renderCars==='function')renderCars();
      if(typeof updateMapMarkers==='function')updateMapMarkers();
      if(typeof devRenderCarOverview==='function')devRenderCarOverview();
      console.log('🔄 일반 차량 수신:',nc.length,'대');
    },function(err){ console.error('차량 리스너 오류:',(err&&err.code)||err); if(window.carsListenerRetry) carsListenerRetry(); });   /* ★ [v101] 오류 시 재시도 (예전엔 조용히 죽어 차량 목록이 비었음) */
    fsBlUnsub=fn.onSnapshot(fn.collection(db,FS_BL_COL),function(snap){
      if(Date.now()-fsLastWriteTime<1000) return;
      var nb=[]; snap.forEach(function(d){ var x=d.data()||{}; if(x.id==null||x.id==='') x.id=d.id; nb.push(normalizeCarStatus(x)); });
      BL_CARS=nb;
      try{localStorage.setItem(BL_STORAGE_KEY,JSON.stringify(BL_CARS));}catch(e){}
      if(typeof renderBLCars==='function')renderBLCars();
      if(typeof devRenderBlOverview==='function')devRenderBlOverview();
      console.log('🔄 BL 차량 수신:',nb.length,'대');
    },function(err){ console.error('BL 차량 리스너 오류:',(err&&err.code)||err); if(window.carsListenerRetry) carsListenerRetry(); });
  }catch(e){console.error('차량 리스너 실패:',e);}
}
window.startCarsListener=startCarsListener;

var _origSaveCarsData=saveCarsData;
saveCarsData=function(){
  if(typeof _origSaveCarsData==='function')_origSaveCarsData();
  if(isDevUser()&&fbReady())syncAllCarsToFirestore();
};
window.saveCarsData=saveCarsData;

var _origDevSaveDelete=window.devSaveDelete;
window.devSaveDelete=function(){
  var n=Array.from(delCheckedNormal),b=Array.from(delCheckedBL);
  if(typeof _origDevSaveDelete==='function')_origDevSaveDelete();
  if(isDevUser()&&fbReady()){
    n.forEach(function(id){deleteCarFromFirestore(id,false);});
    b.forEach(function(id){deleteCarFromFirestore(id,true);});
  }
};
var _origDevToggleCarStatus=window.devToggleCarStatus;
window.devToggleCarStatus=function(carId){
  if(typeof _origDevToggleCarStatus==='function')_origDevToggleCarStatus(carId);
  var c=CARS_DATA.find(function(c){return c.id===carId;});
  if(c&&isDevUser()&&fbReady())syncCarToFirestore(c,false);
};

/* 2. 사용자 로그인/활동 추적 */
function recordLoginEvent(uid, email){
  if(!fbReady()||!uid) return;
  var fn=window.FB_FN, db=window.FB_DB, dev=detectDeviceInfo();
  try{
    fn.setDoc(fn.doc(db,'users',uid),{
      lastLoginAt: fn.serverTimestamp(),
      lastDevice: dev.platform+(dev.isApp?' (앱)':' (웹)'),
      lastDeviceDetail: dev
    },{merge:true}).then(function(){console.log('✅ 로그인 기록:',email,'@',dev.platform);}).catch(function(e){console.error('로그인 기록 실패:',e);});
  }catch(e){}
  try{
    var eid=uid+'_'+Date.now();
    fn.setDoc(fn.doc(db,'login_events',eid),{
      uid:uid, email:email, loggedInAt:fn.serverTimestamp(),
      device:dev, timestamp:Date.now()
    }).catch(function(){});
  }catch(e){}
}
window.recordLoginEvent=recordLoginEvent;

(function(){
  var n=0;
  var ck=setInterval(function(){
    n++;
    if(window.FB_FN&&window.FB_FN.signInWithEmailAndPassword){
      clearInterval(ck);
      var orig=window.FB_FN.signInWithEmailAndPassword;
      window.FB_FN.signInWithEmailAndPassword=function(auth,email,pw){
        return orig(auth,email,pw).then(function(cred){
          recordLoginEvent(cred.user.uid,cred.user.email||email);
          return cred;
        });
      };
      console.log('🎯 로그인 추적 활성화');
    }
    if(n>20)clearInterval(ck);
  },300);
})();

(function(){
  var n=0;
  var ck=setInterval(function(){
    n++;
    if(window.FB_FN&&window.FB_FN.createUserWithEmailAndPassword){
      clearInterval(ck);
      var orig=window.FB_FN.createUserWithEmailAndPassword;
      window.FB_FN.createUserWithEmailAndPassword=function(auth,email,pw){
        return orig(auth,email,pw).then(function(cred){
          var fn=window.FB_FN, db=window.FB_DB;
          try{
            fn.setDoc(fn.doc(db,'users',cred.user.uid),{
              signupDevice:detectDeviceInfo(),
              signupAt:fn.serverTimestamp()
            },{merge:true}).catch(function(){});
          }catch(e){}
          return cred;
        });
      };
      console.log('🎯 가입 디바이스 추적 활성화');
    }
    if(n>20)clearInterval(ck);
  },300);
})();

/* 3. 예약 데이터 동기화
   ★ [v101] 원칙: 서버(Firestore reservations/*)가 진실, 로컬(caro_data_*)은 화면용 캐시.
   ─ 서버로 올리는 것은 "이 기기에서 방금 바뀐 예약"뿐 (기준선 대비 달라진 것 + 대기열).
   ─ 앱 시작 때 로컬 캐시 전체를 서버에 덮어쓰던 syncAll 은 폐기
     → 관제(강제반납·취소)나 다른 기기에서 바꾼 상태가 이 폰의 옛 캐시로 되돌아가지 않는다.
   ─ 리스너의 "쓰기 후 1.5초 스냅샷 무시" 도 폐기 (첫 서버 응답을 버리던 원인). Firestore 는 내 쓰기를
     스냅샷에 즉시 반영하므로(latency compensation) 무시할 필요가 없다.
   ─ 로그인 전(uid 없음)·전송 실패 시엔 대기열(caro_res_pending)에 넣고, 로그인 직후 올린다.
     대기열 항목은 서버 문서가 더 진행된 상태(반납·취소됨)면 절대 되돌리지 않는다.
   ─ 서버 모드(SECURE_SERVER=true)에서는 Functions 가 예약을 쓰므로 클라이언트는 올리지 않는다. */
var RES_PENDING_KEY='caro_res_pending';
var __resBase={}, __resBaseFrom='';
window.__caroResFromServer=null;

function resToIso(v){
  if(!v) return null;
  if(v instanceof Date) return isNaN(v.getTime())?null:v.toISOString();
  if(typeof v.toDate==='function'){ try{ return v.toDate().toISOString(); }catch(e){ return null; } }
  if(typeof v==='number') return new Date(v).toISOString();
  return String(v);
}
function resFromServerDate(v){
  if(!v) return null;
  if(typeof v.toDate==='function'){ try{ return v.toDate(); }catch(e){ return null; } }
  var d=new Date(v); return isNaN(d.getTime())?null:d;
}
function resPayload(res, isCancelled){
  return {
    bookNo:res.bookNo, userId:userInfo.uid||'',
    userEmail:userInfo.email||userInfo.id||'', userName:userInfo.name||userInfo.id||'',
    car:res.car?{
      id:res.car.id||'', name:res.car.name||'', nameen:res.car.nameen||res.car.name||'',
      fuel:res.car.fuel||'',
      img:(res.car.img&&res.car.img.length<200000)?res.car.img:'',
      pricePerHour:res.car.pricePerHour||0, isBlackLabel:!!res.car.isBlackLabel,
      carNumber:res.car.carNumber||''
    }:null,
    ins:res.ins?{id:res.ins.id||'',name:res.ins.name||'',pricePerHour:res.ins.pricePerHour||0}:null,
    start:resToIso(res.start), end:resToIso(res.end),
    hrs:res.hrs||0, total:res.total||0,
    returned:!!res.returned, returnedAt:resToIso(res.returnedAt),
    extendedMins:res.extendedMins||0, extensionHistory:res.extensionHistory||[],
    cancelled:!!isCancelled||res.status==='cancelled', cancelledAt:resToIso(res.cancelledAt),
    refundPct:res.refundPct||0, refundAmt:res.refundAmt||0
  };
}
function resFingerprint(p){
  return JSON.stringify([p.bookNo, p.car&&p.car.id, p.ins&&p.ins.id, p.start, p.end, p.hrs, p.total,
    p.returned, p.returnedAt, p.extendedMins, p.extensionHistory, p.cancelled, p.cancelledAt, p.refundPct, p.refundAmt]);
}
function resCurrentMap(){
  var m={};
  (myReservations||[]).forEach(function(r){ if(r&&r.bookNo){ var p=resPayload(r,false); m[r.bookNo]={p:p,fp:resFingerprint(p)}; } });
  (cancelledHistory||[]).forEach(function(r){ if(r&&r.bookNo){ var p=resPayload(r,true); m[r.bookNo]={p:p,fp:resFingerprint(p)}; } });
  return m;
}
/* 기준선 = "서버와 같다고 믿는 마지막 상태". 로컬 캐시 로드 직후('local') / 서버 스냅샷 직후('server') 기록 */
window.__caroResBaseline=function(from){
  var m=resCurrentMap(); __resBase={};
  Object.keys(m).forEach(function(k){ __resBase[k]=m[k].fp; });
  __resBaseFrom=from||'local';
};

function resQueueLoad(){ try{ var q=JSON.parse(localStorage.getItem(RES_PENDING_KEY)||'{}'); return (q&&typeof q==='object')?q:{}; }catch(e){ return {}; } }
function resQueueSave(q){ try{ if(Object.keys(q).length) localStorage.setItem(RES_PENDING_KEY,JSON.stringify(q)); else localStorage.removeItem(RES_PENDING_KEY); }catch(e){} }
function resEnqueue(p){ var q=resQueueLoad(); q[p.bookNo]={p:p, ts:Date.now()}; resQueueSave(q); }
function resDequeue(bookNo){ var q=resQueueLoad(); if(q[bookNo]){ delete q[bookNo]; resQueueSave(q); } }
function resSecureMode(){ return !!(window.CARO_CONFIG&&window.CARO_CONFIG.SECURE_SERVER); }

var __resFailToastAt=0;
function resWrite(p){
  var fn=window.FB_FN, db=window.FB_DB;
  p.userId=userInfo.uid;
  if(!p.userEmail) p.userEmail=userInfo.email||userInfo.id||'';
  if(!p.userName)  p.userName=userInfo.name||userInfo.id||'';
  p.clientUpdatedAt=new Date().toISOString();
  fsResLastWrite=Date.now();
  return fn.setDoc(fn.doc(db,FS_RES_COL,p.bookNo),p,{merge:true})
    .then(function(){ resDequeue(p.bookNo); __resBase[p.bookNo]=resFingerprint(p); return true; })
    .catch(function(e){
      console.error('🔴 예약 동기화 실패:',p.bookNo,(e&&e.code)||e);
      resEnqueue(p);
      if(Date.now()-__resFailToastAt>15000){
        __resFailToastAt=Date.now();
        try{ showToast('서버 저장에 실패했어요. 네트워크가 연결되면 자동으로 다시 올립니다.'); }catch(e2){}
      }
      return false;
    });
}

function syncReservationToFirestore(res, isCancelled){
  if(resSecureMode()||!res||!res.bookNo) return Promise.resolve(false);
  var p=resPayload(res,isCancelled);
  if(!fbReady()||!userInfo.uid||typeof window.FB_FN.setDoc!=='function'){ resEnqueue(p); return Promise.resolve(false); }
  return resWrite(p);
}
/* 기준선과 달라진 예약만 올린다 (saveUserData 때마다 호출) */
function syncDirtyReservations(){
  if(resSecureMode()) return;
  var m=resCurrentMap(), n=0;
  Object.keys(m).forEach(function(k){
    if(__resBase[k]===m[k].fp) return;
    n++;
    if(fbReady()&&userInfo.uid&&typeof window.FB_FN.setDoc==='function') resWrite(m[k].p); else resEnqueue(m[k].p);
  });
  if(n) console.log('☁️ 변경된 예약 '+n+'건 서버 반영');
}
/* 대기열 처리 — 로그인 직후 호출. 서버 문서가 더 진행된 상태면 건드리지 않는다 */
function flushPendingReservations(){
  if(resSecureMode()){ resQueueSave({}); return Promise.resolve(); }
  if(!fbReady()||!userInfo.uid) return Promise.resolve();
  var q=resQueueLoad(), keys=Object.keys(q); if(!keys.length) return Promise.resolve();
  var fn=window.FB_FN, db=window.FB_DB, myUid=userInfo.uid;
  return Promise.all(keys.map(function(k){
    var item=q[k];
    if(!item||!item.p||!item.p.bookNo){ resDequeue(k); return null; }
    if(Date.now()-(item.ts||0)>7*86400000){ resDequeue(k); return null; }   /* 7일 지난 대기건은 폐기 */
    return fn.getDoc(fn.doc(db,FS_RES_COL,k)).then(function(s){
      if(userInfo.uid!==myUid) return null;
      var d=(s&&typeof s.exists==='function'&&s.exists())?s.data():null;
      if(d){
        if(d.userId && d.userId!==myUid){ resDequeue(k); return null; }                                              /* 남의 예약 */
        if(d.clientUpdatedAt && item.ts && Date.parse(d.clientUpdatedAt)>=item.ts){ resDequeue(k); return null; }    /* 이미 반영됨 */
        if((d.returned&&!item.p.returned)||(d.cancelled&&!item.p.cancelled)){ resDequeue(k); return null; }          /* 서버가 더 진행됨 */
      }
      return resWrite(item.p);
    }).catch(function(){ return (userInfo.uid===myUid)?resWrite(item.p):null; });
  })).then(function(){ console.log('☁️ 예약 대기열 처리 완료 ('+keys.length+'건)'); });
}
/* 호환용 이름 — 이제 '대기열 + 달라진 것'만 */
function syncAllReservationsToFirestore(){ flushPendingReservations(); syncDirtyReservations(); }
window.syncDirtyReservations=syncDirtyReservations; window.flushPendingReservations=flushPendingReservations;

function startReservationsListener(){
  if(!fbReady()||!userInfo.uid) return;
  var fn=window.FB_FN, db=window.FB_DB;
  if(typeof fn.onSnapshot!=='function'||typeof fn.query!=='function'||typeof fn.where!=='function') return;
  if(fsResUnsub) try{fsResUnsub();}catch(e){}
  var listenUid=userInfo.uid;
  try{
    var q=fn.query(fn.collection(db,FS_RES_COL),fn.where('userId','==',listenUid));
    fsResUnsub=fn.onSnapshot(q,function(snap){
      window._caroResLoaded=true;   /* 예약 데이터 최초 응답 도착 — 홈 스켈레톤 해제 신호 */
      if(userInfo.uid!==listenUid) return;   /* 계정이 바뀐 뒤 늦게 온 스냅샷 무시 */
      var act=[],can=[],seen={};
      snap.forEach(function(doc){
        var d=doc.data()||{};
        var res={
          bookNo:d.bookNo||doc.id, car:d.car, ins:d.ins,
          start:resFromServerDate(d.start), end:resFromServerDate(d.end),
          hrs:d.hrs||0, total:d.total||0,
          returned:!!d.returned, returnedAt:resFromServerDate(d.returnedAt),
          extendedMins:d.extendedMins||0, extensionHistory:d.extensionHistory||[],
          refundPct:d.refundPct||0, refundAmt:d.refundAmt||0,
          cancelledAt:resFromServerDate(d.cancelledAt),
          status:d.cancelled?'cancelled':'active'
        };
        seen[res.bookNo]=true;
        if(res.car&&!res.car.img){
          var o=(CARS_DATA||[]).find(function(c){return c.id===res.car.id;})||(BL_CARS||[]).find(function(c){return c.id===res.car.id;});
          if(o&&o.img) res.car.img=o.img;
        }
        if(d.cancelled)can.push(res); else act.push(res);
      });
      /* 아직 서버에 못 올린 대기열 예약(방금 결제 등)은 화면에서 사라지지 않게 덧붙인다 */
      try{
        var pq=resQueueLoad();
        Object.keys(pq).forEach(function(k){
          if(seen[k]||!pq[k]||!pq[k].p) return;
          var p=pq[k].p;
          var r={ bookNo:p.bookNo, car:p.car, ins:p.ins, start:resFromServerDate(p.start), end:resFromServerDate(p.end),
            hrs:p.hrs||0, total:p.total||0, returned:!!p.returned, returnedAt:resFromServerDate(p.returnedAt),
            extendedMins:p.extendedMins||0, extensionHistory:p.extensionHistory||[], refundPct:p.refundPct||0, refundAmt:p.refundAmt||0,
            cancelledAt:resFromServerDate(p.cancelledAt), status:p.cancelled?'cancelled':'active', _pending:true };
          if(p.cancelled) can.push(r); else act.push(r);
        });
      }catch(e){}
      act.sort(function(a,b){return (b.start?b.start.getTime():0)-(a.start?a.start.getTime():0);});
      can.sort(function(a,b){return (b.cancelledAt?b.cancelledAt.getTime():0)-(a.cancelledAt?a.cancelledAt.getTime():0);});
      myReservations=act; cancelledHistory=can;
      window.__caroResFromServer=listenUid;
      try{ window.__caroResBaseline('server'); }catch(e){}
      try{ if(typeof _origSaveUserData==='function') _origSaveUserData(); }catch(e){}   /* 로컬 캐시 = 서버 상태 */
      if(typeof renderMyReservations==='function')renderMyReservations();
      if(typeof renderUsageHistory==='function')renderUsageHistory();
      if(typeof renderCars==='function')renderCars();
      if(typeof updateMapMarkers==='function')updateMapMarkers();
      console.log('🔄 예약 동기화:',act.length,'활성 +',can.length,'취소');
    },function(err){
      console.error('예약 리스너 오류:',err&&err.code||err);
      /* 일시 오류면 5초 뒤 재시도 (권한 오류는 규칙 문제이므로 재시도 안 함) */
      if(!(err&&err.code==='permission-denied')) setTimeout(function(){ if(userInfo.uid===listenUid) startReservationsListener(); },5000);
    });
  }catch(e){console.error('예약 리스너 실패:',e);}
}
window.startReservationsListener=startReservationsListener;

var _origSaveUserData=saveUserData;
saveUserData=function(){
  if(typeof _origSaveUserData==='function')_origSaveUserData();
  syncDirtyReservations();   /* ★ [v101] 전체가 아니라 '달라진 예약'만 서버로 */
};
window.saveUserData=saveUserData;

/* 4. 앱 시작 시 자동 시작 — ★ [v101] 폴링 시간 제한 제거 (caroOnAuth) */
var __carsRetryN=0;
function carsListenerRetry(){ if(__carsRetryN++>5) return; setTimeout(function(){ try{ startCarsListener(); }catch(e){} }, 3000*__carsRetryN); }
window.carsListenerRetry=carsListenerRetry;
var __caroBootT=Date.now();
document.addEventListener('DOMContentLoaded',function(){
  /* 차량 목록: Firebase 준비 즉시 (공개 읽기) */
  var t1=0;
  var c1=setInterval(function(){
    t1++;
    if(fbReady()){clearInterval(c1);console.log('🌐 Firestore 차량 리스너 시작');startCarsListener();}
    if(t1>240)clearInterval(c1);
  },500);
  /* 로그인 상태: caroOnAuth — Firebase 가 상태를 확정하면(그리고 바뀔 때마다) 호출. 시간 제한 없음 */
  var firstAuth=true;
  function onAuth(user){
    var wasFirst=firstAuth; firstAuth=false;
    if(user){
      if(userInfo.uid!==user.uid){ window.__caroResFromServer=null; }
      /* 이 기기에서 직전에 '다른' 계정이 로그인돼 있었다면 그 계정의 로컬 데이터를 먼저 비운다 (계정 간 섞임 방지) */
      var lastUid=null; try{ lastUid=localStorage.getItem('caro_last_uid'); }catch(e){}
      if(lastUid && lastUid!==user.uid){ console.log('👤 다른 계정 로그인 감지 → 이전 계정 로컬 데이터 정리'); caroClearUserLocal(null); myReservations=[]; cancelledHistory=[]; savedCards=[]; }
      try{ localStorage.setItem('caro_last_uid', user.uid); }catch(e){}
      userInfo.uid=user.uid;
      console.log('🔐 인증됨 — 예약 동기화 시작');
      try{ loadUserProfile(user.uid); }catch(e){}                 /* 이름·전화·면허 최신화 (재시작 후에도) */
      try{ startReservationsListener(); }catch(e){}
      try{ flushPendingReservations(); }catch(e){}                 /* 로그인 전에 쌓인 예약(결제 직후 등) 올리기 */
    }else{
      if(fsResUnsub)try{fsResUnsub();fsResUnsub=null;}catch(e){}
      window.__caroResFromServer=null;
      console.log('🔓 로그아웃 — 예약 리스너 종료');
      /* 저장된 '자동 로그인' 표시는 있는데 Firebase 세션이 없으면(세션 만료·계정 삭제 등)
         화면만 로그인된 척하며 아무것도 저장되지 않는 상태가 된다 → 로그인 화면으로 */
      if(wasFirst && !window.__caroLoggingOut){
        var flag=null; try{ flag=localStorage.getItem('caro_auto_login'); }catch(e){}
        if(flag==='1'){
          console.warn('⚠️ 자동로그인 표시는 있으나 Firebase 세션 없음 → 다시 로그인 필요');
          /* 부팅 타이머(4.5초, 스플래시→자동로그인 판정)가 끝난 뒤에 처리해야 화면 전환이 꼬이지 않는다 */
          var _w=0, _wiv=setInterval(function(){
            _w++;
            if(!window.__caroBootTimerDone && _w<60) return;
            clearInterval(_wiv);
            setTimeout(function(){
              try{ if(window.FB_AUTH&&window.FB_AUTH.currentUser) return; }catch(e){}   /* 그 사이 로그인됐으면 취소 */
              try{ handleLogout(); }catch(e){}
              try{ showToast('로그인이 만료되었어요. 다시 로그인해 주세요.'); }catch(e){}
            }, 350);
          }, 250);
        }
      }
    }
  }
  if(window.caroOnAuth) window.caroOnAuth(onAuth);
  else { var t3=0; var c3=setInterval(function(){ t3++; if(window.caroOnAuth){ clearInterval(c3); window.caroOnAuth(onAuth); } if(t3>240) clearInterval(c3); },250); }
});

window.devUploadAllCars=function(){
  if(!isDevUser()){showToast('⚠️ 개발자 계정만');return;}
  fsLastWriteTime=0; syncAllCarsToFirestore();
  showToast('🚀 차량 전체 업로드 시작');
};
/* ─── 결제 수단 선택 박스 UI 통일 ─── */
(function(){
  var style=document.createElement('style');
  style.id='caro-pay-select-fix';
  style.textContent = ''+
    '#payment-screen .pay-select-row,'+
    '#payment-screen [onclick*="openPaySheet"]{'+
      'border:1px solid var(--border,#d0d4dc) !important;'+
      'border-radius:14px !important;'+
      'padding:14px 16px !important;'+
      'background:transparent !important;'+
      'box-shadow:none !important;'+
    '}'+
    '#payment-screen.bl-mode .pay-select-row,'+
    '#payment-screen.bl-mode [onclick*="openPaySheet"]{'+
      'border:1px solid rgba(200,169,110,.35) !important;'+
      'background:rgba(200,169,110,.05) !important;'+
      'color:rgba(200,169,110,.9) !important;'+
    '}'+
    '#payment-screen .pay-select-arrow,'+
    '#payment-screen .pay-arrow,'+
    '#payment-screen .pay-select-row svg,'+
    '#payment-screen .pay-select-row .arrow,'+
    '#payment-screen .pay-select-row::after,'+
    '#payment-screen [onclick*="openPaySheet"] svg{'+
      'display:none !important;'+
    '}';
  document.head.appendChild(style);

  function fixPaySelectArrow(){
    var ps=document.getElementById('payment-screen');
    if(!ps) return;
    var boxes=ps.querySelectorAll('.pay-select-row, [onclick*="openPaySheet"]');
    boxes.forEach(function(box){
      Array.from(box.childNodes).forEach(function(node){
        if(node.nodeType===3){
          var t=node.textContent.trim();
          if(t==='⌄'||t==='v'||t==='V'||t==='∨'||t==='▼'||t==='˅'||t==='⌵'){
            node.textContent='';
          }
        } else if(node.nodeType===1){
          var t=(node.textContent||'').trim();
          if(t==='⌄'||t==='v'||t==='V'||t==='∨'||t==='▼'||t==='˅'||t==='⌵'){
            node.style.display='none';
          }
        }
      });
    });
  }

  var origGoTo=window.goTo;
  if(typeof origGoTo==='function'){
    window.goTo=function(s,i){
      origGoTo(s,i);
      if(s==='payment-screen'){
        setTimeout(fixPaySelectArrow,100);
        setTimeout(fixPaySelectArrow,500);
      }
    };
  }
  document.addEventListener('DOMContentLoaded',function(){
    setTimeout(fixPaySelectArrow,1500);
  });
})();

/* ─── 결제 화면 뒤로가기 버튼 추가 ─── */
(function(){
  function addPaymentBackBtn(){
    var ps = document.getElementById('payment-screen');
    if(!ps) return;

    var existing = ps.querySelector('.payment-back-btn');
    if(existing) existing.remove();

    var submitBtn = ps.querySelector('.submit-btn, .pay-btn, [onclick*="handlePayment"]');
    if(!submitBtn) return;

    var isBL = !!(window.selectedCar && window.selectedCar.isBlackLabel);

    var backBtn = document.createElement('button');
    backBtn.type = 'button';
    backBtn.className = 'payment-back-btn';
    backBtn.textContent = '뒤로가기';
    backBtn.onclick = function(){
      if(typeof window.goTo === 'function'){
        window.goTo('reservation-screen');
      }
    };

    var common = 'width:100%;padding:14px;margin-top:10px;border-radius:14px;font-size:.92rem;font-weight:600;cursor:pointer;transition:all .2s;display:block;box-sizing:border-box;';

    if(isBL){
      backBtn.style.cssText = common +
        'background:transparent !important;'+
        'border:1px solid rgba(200,169,110,.4) !important;'+
        'color:rgba(200,169,110,.85) !important;'+
        'font-family:\'Oswald\',sans-serif !important;'+
        'letter-spacing:.12em !important;';
    } else {
      backBtn.style.cssText = common +
        'background:transparent !important;'+
        'border:1px solid var(--border,#d0d4dc) !important;'+
        'color:var(--text-2,#555) !important;'+
        'font-family:var(--font,\'Inter\',sans-serif) !important;';
    }

    submitBtn.parentNode.insertBefore(backBtn, submitBtn.nextSibling);
  }

  if(typeof window.goTo === 'function'){
    var prevGoTo = window.goTo;
    window.goTo = function(s, i){
      prevGoTo(s, i);
      if(s === 'payment-screen'){
        setTimeout(addPaymentBackBtn, 150);
        setTimeout(addPaymentBackBtn, 500);
      }
    };
  }
})();
/* ─── 차량 이미지 배경색 통일 (예약/결제 화면) ─── */
(function(){
  var style=document.createElement('style');
  style.id='caro-car-img-bg-unify';
  style.textContent = ''+
    '.res-car-img,'+
    '.my-res-img,'+
    '.pay-car-img,'+
    '#reserve-car-card img,'+
    '#pay-car-card img,'+
    '#res-detail-body img:first-child{'+
      'background:#e8eaee !important;'+
      'background-color:#e8eaee !important;'+
      'object-fit:contain !important;'+
    '}'+
    '#reserve-car-card,'+
    '.res-car-section{'+
      'background:transparent !important;'+
    '}';
  document.head.appendChild(style);
})();
/* ─── 차량 이미지 검정 배경 → 밝은 색 변환 (Flood Fill) ─── */
(function(){
  /* 모서리에서 시작하는 Flood Fill — 배경만 변환, 차량 내부 보존 */
  function processCarImage(dataUrl){
    return new Promise(function(resolve){
      if(!dataUrl || dataUrl.indexOf('data:image') !== 0){
        resolve(dataUrl); return;
      }
      var img = new Image();
      img.onload = function(){
        try {
          var canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          var ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          var data = imgData.data;
          var W = canvas.width, H = canvas.height;
          var threshold = 35;
          var visited = new Uint8Array(W * H);
          var queue = [];
          var changed = 0;

          function isDark(dataIdx){
            return data[dataIdx] < threshold &&
                   data[dataIdx+1] < threshold &&
                   data[dataIdx+2] < threshold;
          }
          function tryAdd(x, y){
            if(x < 0 || y < 0 || x >= W || y >= H) return;
            var pi = y * W + x;
            if(visited[pi]) return;
            if(!isDark(pi * 4)) return;
            visited[pi] = 1;
            queue.push(x, y);
          }

          /* 4면의 모든 모서리 픽셀에서 시작 */
          for(var x = 0; x < W; x++){ tryAdd(x, 0); tryAdd(x, H-1); }
          for(var y = 0; y < H; y++){ tryAdd(0, y); tryAdd(W-1, y); }

          /* BFS Flood Fill — 배경만 따라가기 */
          while(queue.length > 0){
            var qx = queue.shift(), qy = queue.shift();
            var di = (qy * W + qx) * 4;
            data[di] = 232; data[di+1] = 234; data[di+2] = 238; data[di+3] = 255;
            changed++;
            tryAdd(qx+1, qy); tryAdd(qx-1, qy);
            tryAdd(qx, qy+1); tryAdd(qx, qy-1);
          }

          ctx.putImageData(imgData, 0, 0);
          var result = canvas.toDataURL('image/jpeg', 0.88);
          var pct = Math.round(changed / (W*H) * 100);
          console.log('🎨 배경 변환: ' + changed + '픽셀 (' + pct + '%)');
          resolve(result);
        } catch(e){
          console.error('이미지 처리 실패:', e);
          resolve(dataUrl);
        }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }
  window.processCarImage = processCarImage;

  if(typeof window.compressImageBase64 === 'function'){
    var origCompress = window.compressImageBase64;
    window.compressImageBase64 = function(dataUrl, maxW, maxH, quality){
      return origCompress(dataUrl, maxW, maxH, quality).then(function(compressed){
        return processCarImage(compressed);
      });
    };
    console.log('✅ 차량 이미지 자동 처리 활성화 (Flood Fill)');
  }

  window.devReprocessAllCars = function(){
    if(!window.isDevUser || !window.isDevUser()){
      window.showToast && window.showToast('⚠️ 개발자 계정만');
      return;
    }
    var cars = (window.CARS_DATA || []).slice();
    var blCars = (window.BL_CARS || []).slice();
    var total = cars.length + blCars.length;
    if(total === 0){ window.showToast && window.showToast('차량 없음'); return; }

    window.showToast && window.showToast('🎨 ' + total + '대 재처리 시작...');
    var done = 0;

    function processOne(car, isBL, callback){
      if(!car.img || car.img.indexOf('data:image') !== 0){ callback(); return; }
      processCarImage(car.img).then(function(newImg){
        car.img = newImg;
        if(typeof window.syncCarToFirestore === 'function'){
          window.fsLastWriteTime = 0;
          window.syncCarToFirestore(car, isBL).then(function(){
            done++;
            console.log('✅ ' + done + '/' + total + ' ' + car.name);
            callback();
          });
        } else { done++; callback(); }
      });
    }

    function processList(list, isBL, onDone){
      var i = 0;
      function next(){
        if(i >= list.length){ onDone(); return; }
        processOne(list[i++], isBL, next);
      }
      next();
    }

    processList(cars, false, function(){
      processList(blCars, true, function(){
        window.showToast && window.showToast('✅ 전체 ' + done + '대 재처리 완료!');
        if(typeof window.renderCars === 'function') window.renderCars();
        if(typeof window.renderBLCars === 'function') window.renderBLCars();
        try{ localStorage.setItem('caro_cars_data_v1', JSON.stringify(window.CARS_DATA)); }catch(e){}
        try{ localStorage.setItem('caro_bl_cars_v1', JSON.stringify(window.BL_CARS)); }catch(e){}
      });
    });
  };
})();
/* ─── 다중 사용자 실시간 예약 동기화 (인증 연동) ─── */
(function(){
  var fsGlobalResUnsub = null;
  window.globalActiveReservations = [];

  function startGlobalReservationsListener(){
    if(typeof window.fbReady !== 'function' || !window.fbReady()) return;
    /* ⭐ 인증 확인 — 로그인된 사용자만 */
    if(!window.FB_AUTH || !window.FB_AUTH.currentUser){
      console.log('⏸ 전역 예약 리스너 — 로그인 대기 중');
      return;
    }

    var fn = window.FB_FN, db = window.FB_DB;
    if(typeof fn.onSnapshot !== 'function') return;
    if(fsGlobalResUnsub){ try{fsGlobalResUnsub();}catch(e){} fsGlobalResUnsub = null; }

    try {
      fsGlobalResUnsub = fn.onSnapshot(fn.collection(db, 'reservations'), function(snap){
        var allRes = [];
        snap.forEach(function(doc){
          var d = doc.data();
          if(!d.cancelled && !d.returned && d.start && d.end){
            allRes.push({
              bookNo: d.bookNo || doc.id,
              userId: d.userId,
              car: d.car,
              start: new Date(d.start),
              end: new Date(d.end),
              returned: false,
              returnedAt: null,
              hrs: d.hrs || 0,
              total: d.total || 0,
              ins: d.ins
            });
          }
        });
        window.globalActiveReservations = allRes;
        console.log('🌐 전역 활성 예약:', allRes.length, '건');
        if(typeof window.renderCars === 'function') window.renderCars();
        if(typeof window.updateMapMarkers === 'function') window.updateMapMarkers();
      }, function(err){
        console.warn('전역 예약 리스너 오류 (무시 가능):', err.code || err.message);
      });
    } catch(e) {
      console.error('전역 예약 리스너 실패:', e);
    }
  }

  function stopGlobalReservationsListener(){
    if(fsGlobalResUnsub){ try{fsGlobalResUnsub();}catch(e){} fsGlobalResUnsub = null; }
    window.globalActiveReservations = [];
    console.log('🔓 전역 예약 리스너 종료');
  }

  window.startGlobalReservationsListener = startGlobalReservationsListener;
  window.stopGlobalReservationsListener = stopGlobalReservationsListener;

  function wrapWithGlobalRes(originalFn){
    return function(){
      var globalRes = window.globalActiveReservations || [];
      if(globalRes.length === 0){
        return originalFn.apply(this, arguments);
      }
      var myBookNos = {};
      (window.myReservations || []).forEach(function(r){
        if(r.bookNo) myBookNos[r.bookNo] = true;
      });
      var otherRes = globalRes.filter(function(r){
        return r.bookNo && !myBookNos[r.bookNo] && r.userId !== (window.userInfo && window.userInfo.uid);
      });

      var origMy = window.myReservations || [];
      window.myReservations = origMy.concat(otherRes);

      try {
        return originalFn.apply(this, arguments);
      } finally {
        window.myReservations = origMy;
      }
    };
  }

  function tryWrap(){
    if(typeof window.renderCars === 'function' && !window.renderCars._wrapped){
      window.renderCars = wrapWithGlobalRes(window.renderCars);
      window.renderCars._wrapped = true;
    }
    if(typeof window.updateMapMarkers === 'function' && !window.updateMapMarkers._wrapped){
      window.updateMapMarkers = wrapWithGlobalRes(window.updateMapMarkers);
      window.updateMapMarkers._wrapped = true;
    }
  }

  /* ⭐ 인증 상태 연동 — 로그인 시 시작, 로그아웃 시 종료 */
  function setupAuthListener(){
    if(!window.FB_FN || typeof window.FB_FN.onAuthStateChanged !== 'function' || !window.FB_AUTH){
      return false;
    }
    window.FB_FN.onAuthStateChanged(window.FB_AUTH, function(user){
      if(user){
        setTimeout(function(){
          console.log('🌐 전역 예약 리스너 시작');
          startGlobalReservationsListener();
        }, 1500);
      } else {
        stopGlobalReservationsListener();
      }
    });
    return true;
  }

  function autoStart(){
    var tries = 0;
    var check = setInterval(function(){
      tries++;
      tryWrap();
      if(setupAuthListener()){
        clearInterval(check);
      }
      if(tries > 30) clearInterval(check);
    }, 500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', autoStart);
  } else {
    setTimeout(autoStart, 100);
  }
})();
/* ─── 차량 이미지 처리 (통합 최종 버전 — 단일 압축) ─── */
(function(){
  /* 한 번에 처리: 리사이즈 + Flood Fill + JPEG 인코딩 */
  function processAndCompressCar(dataUrl, maxW, maxH, quality){
    maxW = maxW || 800;
    maxH = maxH || 600;
    quality = quality || 0.88;

    return new Promise(function(resolve){
      if(!dataUrl || dataUrl.indexOf('data:image') !== 0){
        resolve(dataUrl); return;
      }
      var img = new Image();
      img.onload = function(){
        try {
          var w = img.width, h = img.height;
          var ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);

          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, w, h);

          var imgData = ctx.getImageData(0, 0, w, h);
          var data = imgData.data;
          var threshold = 35;
          var visited = new Uint8Array(w * h);
          var queue = [];
          var changed = 0;

          function isDark(idx){
            return data[idx] < threshold &&
                   data[idx+1] < threshold &&
                   data[idx+2] < threshold;
          }
          function tryAdd(x, y){
            if(x < 0 || y < 0 || x >= w || y >= h) return;
            var pi = y * w + x;
            if(visited[pi]) return;
            if(!isDark(pi * 4)) return;
            visited[pi] = 1;
            queue.push(x, y);
          }

          for(var x = 0; x < w; x++){ tryAdd(x, 0); tryAdd(x, h-1); }
          for(var y = 0; y < h; y++){ tryAdd(0, y); tryAdd(w-1, y); }

          while(queue.length > 0){
            var qx = queue.shift(), qy = queue.shift();
            var di = (qy * w + qx) * 4;
            data[di] = 232; data[di+1] = 234; data[di+2] = 238; data[di+3] = 255;
            changed++;
            tryAdd(qx+1, qy); tryAdd(qx-1, qy);
            tryAdd(qx, qy+1); tryAdd(qx, qy-1);
          }

          ctx.putImageData(imgData, 0, 0);
          var result = canvas.toDataURL('image/jpeg', quality);
          var pct = Math.round(changed / (w*h) * 100);
          console.log('🎨 처리 완료: ' + w + 'x' + h + ', 배경 ' + pct + '% 변환');
          resolve(result);
        } catch(e) {
          console.error('이미지 처리 실패:', e);
          resolve(dataUrl);
        }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  /* 기존 함수들을 통합 함수로 덮어쓰기 (나중 정의가 이김) */
  window.compressImageBase64 = processAndCompressCar;
  window.processCarImage = processAndCompressCar;
  console.log('✅ 차량 이미지 처리 활성화 (통합 — 단일 압축)');

  /* devReprocessAllCars 재정의 — 통합 함수 사용 */
  window.devReprocessAllCars = function(){
    if(!window.isDevUser || !window.isDevUser()){
      window.showToast && window.showToast('⚠️ 개발자 계정만');
      return;
    }
    var cars = (window.CARS_DATA || []).slice();
    var blCars = (window.BL_CARS || []).slice();
    var total = cars.length + blCars.length;
    if(total === 0){ window.showToast && window.showToast('차량 없음'); return; }

    window.showToast && window.showToast('🎨 ' + total + '대 재처리 시작...');
    var done = 0;

    function processOne(car, isBL, callback){
      if(!car.img || car.img.indexOf('data:image') !== 0){ callback(); return; }
      processAndCompressCar(car.img, 800, 600, 0.88).then(function(newImg){
        car.img = newImg;
        if(typeof window.syncCarToFirestore === 'function'){
          window.fsLastWriteTime = 0;
          window.syncCarToFirestore(car, isBL).then(function(){
            done++;
            console.log('✅ ' + done + '/' + total + ' ' + car.name);
            callback();
          });
        } else { done++; callback(); }
      });
    }

    function processList(list, isBL, onDone){
      var i = 0;
      function next(){
        if(i >= list.length){ onDone(); return; }
        processOne(list[i++], isBL, next);
      }
      next();
    }

    processList(cars, false, function(){
      processList(blCars, true, function(){
        window.showToast && window.showToast('✅ 전체 ' + done + '대 재처리 완료!');
        if(typeof window.renderCars === 'function') window.renderCars();
        if(typeof window.renderBLCars === 'function') window.renderBLCars();
        try{ localStorage.setItem('caro_cars_data_v1', JSON.stringify(window.CARS_DATA)); }catch(e){}
        try{ localStorage.setItem('caro_bl_cars_v1', JSON.stringify(window.BL_CARS)); }catch(e){}
      });
    });
  };
})();
/* ─── 차량 이미지 처리 v3 (밝은 색 차량 대응) ─── */
(function(){
  function processAndCompressCar(dataUrl, maxW, maxH, quality){
    maxW = maxW || 800;
    maxH = maxH || 600;
    quality = quality || 0.88;

    return new Promise(function(resolve){
      if(!dataUrl || dataUrl.indexOf('data:image') !== 0){
        resolve(dataUrl); return;
      }
      var img = new Image();
      img.onload = function(){
        try {
          var w = img.width, h = img.height;
          var ratio = Math.min(maxW / w, maxH / h, 1);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);

          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = false;  /* ⭐ 스무딩 끄기 — 순검정 유지 */
          ctx.drawImage(img, 0, 0, w, h);

          var imgData = ctx.getImageData(0, 0, w, h);
          var data = imgData.data;
          var threshold = 20;  /* ⭐ 35 → 20 (더 엄격) */
          var visited = new Uint8Array(w * h);
          var queue = [];
          var changed = 0;

          function isDark(idx){
            return data[idx] < threshold &&
                   data[idx+1] < threshold &&
                   data[idx+2] < threshold;
          }
          function tryAdd(x, y){
            if(x < 0 || y < 0 || x >= w || y >= h) return;
            var pi = y * w + x;
            if(visited[pi]) return;
            if(!isDark(pi * 4)) return;
            visited[pi] = 1;
            queue.push(x, y);
          }

          /* 모서리에서 시작 */
          for(var x = 0; x < w; x++){ tryAdd(x, 0); tryAdd(x, h-1); }
          for(var y = 0; y < h; y++){ tryAdd(0, y); tryAdd(w-1, y); }

          /* BFS Flood Fill */
          while(queue.length > 0){
            var qx = queue.shift(), qy = queue.shift();
            var di = (qy * w + qx) * 4;
            data[di] = 232; data[di+1] = 234; data[di+2] = 238; data[di+3] = 255;
            changed++;
            tryAdd(qx+1, qy); tryAdd(qx-1, qy);
            tryAdd(qx, qy+1); tryAdd(qx, qy-1);
          }

          ctx.putImageData(imgData, 0, 0);
          var result = canvas.toDataURL('image/jpeg', quality);
          var pct = Math.round(changed / (w*h) * 100);
          var status = pct > 60 ? '⚠️ 너무 많음' : (pct < 15 ? '⚠️ 너무 적음' : '✅ 정상');
          console.log('🎨 v3 처리 완료: ' + w + 'x' + h + ', 배경 ' + pct + '% 변환 ' + status);
          resolve(result);
        } catch(e) {
          console.error('이미지 처리 실패:', e);
          resolve(dataUrl);
        }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  /* 최종 덮어쓰기 — 가장 마지막 정의가 이김 */
  window.compressImageBase64 = processAndCompressCar;
  window.processCarImage = processAndCompressCar;
  console.log('✅ 차량 이미지 처리 v3 활성화 (밝은 색 차량 대응)');
})();
/* ─── 차량 이미지 처리 v4 (원본 해상도에서 처리) ─── */
(function(){
  function processAndCompressCar(dataUrl, maxW, maxH, quality){
    maxW = maxW || 800;
    maxH = maxH || 600;
    quality = quality || 0.88;

    return new Promise(function(resolve){
      if(!dataUrl || dataUrl.indexOf('data:image') !== 0){
        resolve(dataUrl); return;
      }
      var img = new Image();
      img.onload = function(){
        try {
          /* === 1단계: 원본 해상도(최대 1600)에서 Flood Fill === */
          var origW = img.width, origH = img.height;
          var processW = origW, processH = origH;
          var maxProcDim = 1600;
          if(origW > maxProcDim || origH > maxProcDim){
            var pRatio = Math.min(maxProcDim / origW, maxProcDim / origH);
            processW = Math.round(origW * pRatio);
            processH = Math.round(origH * pRatio);
          }

          var pCanvas = document.createElement('canvas');
          pCanvas.width = processW;
          pCanvas.height = processH;
          var pCtx = pCanvas.getContext('2d');
          pCtx.imageSmoothingEnabled = false;
          pCtx.drawImage(img, 0, 0, processW, processH);

          var imgData = pCtx.getImageData(0, 0, processW, processH);
          var data = imgData.data;
          var threshold = 15;  /* ⭐ 더 엄격 */
          var visited = new Uint8Array(processW * processH);
          var queue = [];
          var changed = 0;

          function isDark(idx){
            return data[idx] < threshold &&
                   data[idx+1] < threshold &&
                   data[idx+2] < threshold;
          }
          function tryAdd(x, y){
            if(x < 0 || y < 0 || x >= processW || y >= processH) return;
            var pi = y * processW + x;
            if(visited[pi]) return;
            if(!isDark(pi * 4)) return;
            visited[pi] = 1;
            queue.push(x, y);
          }

          for(var x = 0; x < processW; x++){ tryAdd(x, 0); tryAdd(x, processH-1); }
          for(var y = 0; y < processH; y++){ tryAdd(0, y); tryAdd(processW-1, y); }

          while(queue.length > 0){
            var qx = queue.shift(), qy = queue.shift();
            var di = (qy * processW + qx) * 4;
            data[di] = 232; data[di+1] = 234; data[di+2] = 238; data[di+3] = 255;
            changed++;
            tryAdd(qx+1, qy); tryAdd(qx-1, qy);
            tryAdd(qx, qy+1); tryAdd(qx, qy-1);
          }

          /* ⚠️ 안전장치: 70% 이상 변환되면 원본 사용 */
          var pct = Math.round(changed / (processW * processH) * 100);
          if(pct > 70){
            console.warn('⚠️ v4 ' + pct + '% — 너무 많아서 원본 사용');
            pCtx.drawImage(img, 0, 0, processW, processH);
          } else {
            pCtx.putImageData(imgData, 0, 0);
          }

          /* === 2단계: 최종 크기로 축소 === */
          var fRatio = Math.min(maxW / processW, maxH / processH, 1);
          var finalW = Math.round(processW * fRatio);
          var finalH = Math.round(processH * fRatio);

          var fCanvas = document.createElement('canvas');
          fCanvas.width = finalW;
          fCanvas.height = finalH;
          var fCtx = fCanvas.getContext('2d');
          fCtx.imageSmoothingEnabled = true;
          fCtx.imageSmoothingQuality = 'high';
          fCtx.drawImage(pCanvas, 0, 0, finalW, finalH);

          var result = fCanvas.toDataURL('image/jpeg', quality);
          var status = pct > 65 ? '⚠️ 너무 많음' : (pct < 15 ? '⚠️ 너무 적음' : '✅ 정상');
          console.log('🎨 v4: ' + processW + 'x' + processH + ' → ' + finalW + 'x' + finalH +
                      ', 배경 ' + pct + '% ' + status);
          resolve(result);
        } catch(e) {
          console.error('이미지 처리 실패:', e);
          resolve(dataUrl);
        }
      };
      img.onerror = function(){ resolve(dataUrl); };
      img.src = dataUrl;
    });
  }

  window.compressImageBase64 = processAndCompressCar;
  window.processCarImage = processAndCompressCar;
  console.log('✅ 차량 이미지 처리 v4 활성화 (원본 해상도 처리)');
})();
/* ─── 차량 내용 변경 기능 (편집 팝업) ─── */
(function(){

  /* === CSS === */
  var style = document.createElement('style');
  style.id = 'caro-car-edit-styles';
  style.textContent =
    '#caro-car-edit-modal{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.85);align-items:center;justify-content:center;padding:20px;font-family:var(--font,"Pretendard",sans-serif);}' +
    '#caro-car-edit-modal.open{display:flex;}' +
    '#caro-car-edit-modal .cce-content{background:#0a1424;border:1px solid rgba(91,200,255,.3);border-radius:16px;max-width:480px;width:100%;max-height:90vh;overflow-y:auto;padding:22px;color:rgba(180,220,255,.85);box-shadow:0 8px 32px rgba(0,0,0,.5);}' +
    '#caro-car-edit-modal h3{color:rgba(91,200,255,.9);font-size:1.05rem;margin:0 0 4px 0;letter-spacing:.05em;}' +
    '#caro-car-edit-modal .cce-subtitle{color:rgba(91,200,255,.5);font-size:.74rem;margin-bottom:18px;}' +
    '#caro-car-edit-modal .cce-field{margin-bottom:11px;}' +
    '#caro-car-edit-modal .cce-field label{display:block;font-size:.72rem;color:rgba(91,200,255,.6);margin-bottom:4px;font-weight:600;}' +
    '#caro-car-edit-modal .cce-field input,#caro-car-edit-modal .cce-field select,#caro-car-edit-modal .cce-field textarea{width:100%;padding:9px 11px;background:rgba(91,200,255,.05);border:1px solid rgba(91,200,255,.25);border-radius:8px;color:rgba(180,220,255,.95);font-family:inherit;font-size:.85rem;box-sizing:border-box;transition:border-color .2s;}' +
    '#caro-car-edit-modal .cce-field input:focus,#caro-car-edit-modal .cce-field select:focus,#caro-car-edit-modal .cce-field textarea:focus{outline:none;border-color:rgba(91,200,255,.6);}' +
    '#caro-car-edit-modal .cce-field textarea{resize:vertical;min-height:60px;}' +
    '#caro-car-edit-modal .cce-row{display:flex;gap:8px;}' +
    '#caro-car-edit-modal .cce-row .cce-field{flex:1;}' +
    '#caro-car-edit-modal .cce-photo-preview{width:100%;max-height:140px;object-fit:contain;background:#1a2030;border-radius:8px;margin-bottom:8px;display:block;}' +
    '#caro-car-edit-modal .cce-photo-btn{width:100%;padding:9px;background:rgba(91,200,255,.08);border:1px dashed rgba(91,200,255,.35);border-radius:8px;color:rgba(91,200,255,.85);font-family:inherit;font-size:.8rem;cursor:pointer;}' +
    '#caro-car-edit-modal .cce-photo-btn:hover{background:rgba(91,200,255,.14);}' +
    '#caro-car-edit-modal .cce-actions{display:flex;gap:8px;margin-top:18px;}' +
    '#caro-car-edit-modal .cce-actions button{flex:1;padding:11px;border-radius:8px;font-family:inherit;font-size:.88rem;font-weight:700;cursor:pointer;transition:all .2s;}' +
    '#caro-car-edit-modal .cce-btn-cancel{background:rgba(120,120,120,.12);color:rgba(180,220,255,.6);border:1px solid rgba(120,120,120,.3);}' +
    '#caro-car-edit-modal .cce-btn-cancel:hover{background:rgba(120,120,120,.2);}' +
    '#caro-car-edit-modal .cce-btn-save{background:rgba(91,200,255,.15);color:#5bc8ff;border:1px solid rgba(91,200,255,.4);}' +
    '#caro-car-edit-modal .cce-btn-save:hover{background:rgba(91,200,255,.25);}' +
    '.caro-edit-btn{width:100%;padding:11px;background:rgba(91,200,255,.08) !important;border:1px solid rgba(91,200,255,.3) !important;border-radius:10px;color:#5bc8ff !important;font-family:var(--font,inherit);font-size:.85rem;font-weight:700;cursor:pointer;margin-bottom:8px;transition:all .2s;}' +
    '.caro-edit-btn:hover{background:rgba(91,200,255,.14) !important;}';
  document.head.appendChild(style);

  /* === Modal HTML === */
  function injectModal(){
    if(document.getElementById('caro-car-edit-modal')) return;
    var modal = document.createElement('div');
    modal.id = 'caro-car-edit-modal';
    modal.addEventListener('click', function(e){
      if(e.target === modal) closeEdit();
    });
    modal.innerHTML =
      '<div class="cce-content">' +
        '<h3>✏️ 차량 내용 변경</h3>' +
        '<div class="cce-subtitle" id="cce-target-name">차량 선택됨</div>' +
        '<div class="cce-row">' +
          '<div class="cce-field"><label>차량번호</label><input id="cce-carnum" type="text" placeholder="예: 12가 3456"></div>' +
          '<div class="cce-field"><label>거점</label><select id="cce-region"><option value="구월동">구월동</option><option value="송도">송도</option></select></div>' +
        '</div>' +
        '<div class="cce-field"><label>차량명</label><input id="cce-name" type="text" placeholder="예: 쏘나타 디 엣지"></div>' +
        '<div class="cce-row">' +
          '<div class="cce-field"><label>연료</label><select id="cce-fuel"><option value="가솔린">가솔린</option><option value="디젤">디젤</option><option value="전기">전기</option><option value="하이브리드">하이브리드</option><option value="LPG">LPG</option></select></div>' +
          '<div class="cce-field"><label>시간당 요금 (원)</label><input id="cce-price" type="number" placeholder="예: 9120"></div>' +
        '</div>' +
        '<div class="cce-field"><label>옵션</label><textarea id="cce-opts" placeholder="옵션 (줄바꿈 가능)"></textarea></div>' +
        '<div class="cce-field"><label>사진</label><img id="cce-photo-preview" class="cce-photo-preview"><input type="file" id="cce-photo-input" accept="image/*" style="display:none" onchange="ccPreviewPhoto(this)"><button class="cce-photo-btn" onclick="document.getElementById(\'cce-photo-input\').click()">📷 사진 변경</button></div>' +
        '<div class="cce-actions">' +
          '<button class="cce-btn-cancel" onclick="ccCloseEditModal()">취소</button>' +
          '<button class="cce-btn-save" onclick="ccSaveCarEdit()">💾 저장</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }

  /* === 선택된 차량 찾기 === */
  function findSelected(){
    var checked = [];
    if(typeof delCheckedNormal !== 'undefined'){
      delCheckedNormal.forEach(function(id){ checked.push({id:id, isBL:false}); });
    }
    if(typeof delCheckedBL !== 'undefined'){
      delCheckedBL.forEach(function(id){ checked.push({id:id, isBL:true}); });
    }
    return checked;
  }

  /* === 모달 열기 === */
  function openEdit(){
    var sel = findSelected();
    if(sel.length === 0){
      if(typeof showToast === 'function') showToast('수정할 차량을 1개 선택해 주세요.');
      return;
    }
    if(sel.length > 1){
      if(typeof showToast === 'function') showToast('한 번에 1대만 수정 가능합니다.');
      return;
    }

    var s = sel[0];
    var car;
    if(s.isBL){
      car = (window.BL_CARS || []).find(function(c){ return String(c.id) === String(s.id); });
    } else {
      car = (window.CARS_DATA || []).find(function(c){ return c.id === s.id; });
    }
    if(!car){
      if(typeof showToast === 'function') showToast('차량을 찾을 수 없습니다.');
      return;
    }

    window._ccEditingCar = car;
    window._ccEditingIsBL = s.isBL;
    window._ccNewPhoto = null;

    document.getElementById('cce-target-name').textContent =
      car.name + (car.carNumber ? ' [' + car.carNumber + ']' : '') +
      (car.region ? ' · ' + car.region : '') + (s.isBL ? ' (BL)' : '');
    document.getElementById('cce-carnum').value = car.carNumber || '';
    document.getElementById('cce-name').value = car.name || '';
    document.getElementById('cce-fuel').value = car.fuel || '가솔린';
    document.getElementById('cce-price').value = car.pricePerHour || '';
    document.getElementById('cce-opts').value = car.options || '';
    document.getElementById('cce-region').value = car.region || '구월동';
    document.getElementById('cce-photo-preview').src = car.img || '';
    document.getElementById('cce-photo-input').value = '';

    document.getElementById('caro-car-edit-modal').classList.add('open');
  }

  /* === 모달 닫기 === */
  function closeEdit(){
    var m = document.getElementById('caro-car-edit-modal');
    if(m) m.classList.remove('open');
    window._ccEditingCar = null;
    window._ccNewPhoto = null;
  }

  /* === 사진 미리보기 === */
  function previewPhoto(input){
    var file = input.files[0];
    if(!file) return;
    var reader = new FileReader();
    reader.onload = function(ev){
      window._ccNewPhoto = ev.target.result;
      document.getElementById('cce-photo-preview').src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  /* === 저장 === */
  function saveEdit(){
    var car = window._ccEditingCar;
    if(!car){
      if(typeof showToast === 'function') showToast('편집 중인 차량이 없습니다.');
      return;
    }

    var changes = [];

    var newCarnum = document.getElementById('cce-carnum').value.trim();
    if(newCarnum !== (car.carNumber || '')){
      car.carNumber = newCarnum;
      changes.push('차량번호');
    }

    var newName = document.getElementById('cce-name').value.trim();
    if(newName && newName !== car.name){
      car.name = newName;
      car.nameen = newName;
      car.nameja = newName;
      car.namezh = newName;
      changes.push('차량명');
    }

    var newFuel = document.getElementById('cce-fuel').value;
    if(newFuel && newFuel !== car.fuel){
      car.fuel = newFuel;
      changes.push('연료');
    }

    var newPrice = parseInt(document.getElementById('cce-price').value);
    if(!isNaN(newPrice) && newPrice > 0 && newPrice !== car.pricePerHour){
      car.pricePerHour = newPrice;
      changes.push('요금');
    }

    var newOpts = document.getElementById('cce-opts').value.trim();
    if(newOpts !== (car.options || '')){
      car.options = newOpts;
      changes.push('옵션');
    }

    var newRegion = document.getElementById('cce-region').value;
    if(newRegion && newRegion !== car.region){
      if(typeof getRandomIncheonLocation === 'function'){
        var loc = getRandomIncheonLocation(newRegion);
        car.lat = loc.lat;
        car.lng = loc.lng;
      }
      car.region = newRegion;
      changes.push('거점');
    }

    if(window._ccNewPhoto){
      car.img = window._ccNewPhoto;
      changes.push('사진');
    }

    if(changes.length === 0){
      if(typeof showToast === 'function') showToast('변경 사항이 없습니다.');
      return;
    }

    /* 강제 Firestore 동기화 (debounce 무시) */
    window.fsLastWriteTime = 0;
    if(typeof saveCarsData === 'function') saveCarsData();

    /* DEV CONSOLE 갱신 */
    if(typeof devRenderCarOverview === 'function') devRenderCarOverview();
    if(typeof devRenderBlOverview === 'function') devRenderBlOverview();
    if(typeof devRenderCarDeleteList === 'function') devRenderCarDeleteList();
    if(typeof devRenderCarSelect === 'function') devRenderCarSelect();
    if(typeof devRenderBlCarSelect === 'function') devRenderBlCarSelect();
    if(typeof devRenderPriceList === 'function') devRenderPriceList();
    if(typeof devRenderStats === 'function') devRenderStats();
    if(typeof renderCars === 'function') renderCars();
    if(typeof renderBLCars === 'function') renderBLCars();
    if(typeof updateMapMarkers === 'function') updateMapMarkers();

    if(typeof showToast === 'function') showToast('✅ ' + car.name + ' 업데이트: ' + changes.join(' · '));
    closeEdit();
  }

  /* === UI 적용 (헤더 변경 + 버튼 추가) === */
  function applyUI(){
    /* 헤더 텍스트 변경 */
    var allEls = document.querySelectorAll('div,span,h1,h2,h3,h4,h5,p,label');
    for(var i=0; i<allEls.length; i++){
      var el = allEls[i];
      if(el.children.length === 0){
        var text = (el.textContent || '').trim();
        if((text === '🗑 차량 삭제' || text === '차량 삭제') && !el.dataset.ccProcessed){
          el.textContent = '✏️ 차량 내용 변경 / 🗑 차량 삭제';
          el.dataset.ccProcessed = '1';
        }
      }
    }

    /* 차량 내용 변경 버튼 추가 */
    var btns = document.querySelectorAll('button');
    for(var j=0; j<btns.length; j++){
      var btn = btns[j];
      var btnText = (btn.textContent || '').trim();
      if((btnText.indexOf('선택 항목 삭제') >= 0 || btnText.indexOf('즉시 반영') >= 0) &&
         !btn.dataset.ccEditBtnAdded){
        btn.dataset.ccEditBtnAdded = '1';

        var editBtn = document.createElement('button');
        editBtn.className = 'caro-edit-btn';
        editBtn.textContent = '✏️ 선택 차량 내용 변경';
        editBtn.onclick = function(e){
          e.preventDefault();
          e.stopPropagation();
          openEdit();
        };

        btn.parentNode.insertBefore(editBtn, btn);
      }
    }
  }

  /* === Expose === */
  window.ccOpenEditModal = openEdit;
  window.ccCloseEditModal = closeEdit;
  window.ccPreviewPhoto = previewPhoto;
  window.ccSaveCarEdit = saveEdit;

  /* === Hook into renders === */
  var origRender = window.devRenderCarDeleteList;
  if(typeof origRender === 'function'){
    window.devRenderCarDeleteList = function(){
      origRender.apply(this, arguments);
      setTimeout(applyUI, 30);
    };
  }

  var origDevRender = window.renderDevScreen;
  if(typeof origDevRender === 'function'){
    window.renderDevScreen = function(){
      origDevRender.apply(this, arguments);
      setTimeout(function(){
        injectModal();
        applyUI();
      }, 100);
    };
  }

  /* === 초기화 === */
  function init(){
    injectModal();
    setTimeout(applyUI, 500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }

  console.log('✅ 차량 내용 변경 기능 활성화');
})();
/* ===== 차량 관리 버튼 좌우 정렬 IIFE ===== */
(function alignVehicleActionButtons(){
  'use strict';

  function findBtn(text){
    var btns = document.querySelectorAll('button');
    for(var i=0; i<btns.length; i++){
      if(btns[i].textContent.trim().includes(text)) return btns[i];
    }
    return null;
  }

  function alignButtons(){
    var editBtn = findBtn('선택 차량 내용 변경');
    var delBtn = findBtn('선택 항목 삭제');
    if(!editBtn || !delBtn) return false;

    if(editBtn.parentNode === delBtn.parentNode &&
       editBtn.parentNode.dataset.aligned === 'true') return true;

    var wrapper = document.createElement('div');
    wrapper.dataset.aligned = 'true';
    wrapper.style.cssText = 'display:flex; gap:12px; width:100%; margin:12px 0;';

    editBtn.parentNode.insertBefore(wrapper, editBtn);
    wrapper.appendChild(editBtn);
    wrapper.appendChild(delBtn);

    editBtn.style.flex = '1';
    editBtn.style.width = 'auto';
    editBtn.style.margin = '0';
    delBtn.style.flex = '1';
    delBtn.style.width = 'auto';
    delBtn.style.margin = '0';

    console.log('✅ 차량 관리 버튼 좌우 정렬 완료');
    return true;
  }

  if(!alignButtons()){
    var retries = 0;
    var iv = setInterval(function(){
      retries++;
      if(alignButtons() || retries > 20) clearInterval(iv);
    }, 500);
  }

  var observer = new MutationObserver(function(){
    var editBtn = findBtn('선택 차량 내용 변경');
    if(editBtn && editBtn.parentNode && editBtn.parentNode.dataset.aligned !== 'true'){
      alignButtons();
    }
  });
  if(document.body){
    observer.observe(document.body, {childList:true, subtree:true});
  }

  console.log('🎨 버튼 정렬 IIFE 활성화');
})();
/* ===== 차량 내용 변경 - km당 요금 필드 IIFE v4 ===== */
(function addKmFeeFieldV4(){
  'use strict';

  var KM_FIELD = 'kmRate';

  function findInputByLabel(labelText, root){
    root = root || document;
    var labels = root.querySelectorAll('label');
    for(var i=0; i<labels.length; i++){
      if(labels[i].textContent.indexOf(labelText) !== -1){
        var p = labels[i].parentElement;
        if(p){
          var input = p.querySelector('input');
          if(input) return input;
        }
      }
    }
    return null;
  }

  function findPopup(){
    var all = document.querySelectorAll('h1,h2,h3,h4');
    for(var i=0; i<all.length; i++){
      if(all[i].textContent.indexOf('차량 내용 변경') !== -1){
        var node = all[i];
        while(node && node !== document.body){
          if(node.querySelectorAll('input').length >= 3) return node;
          node = node.parentElement;
        }
      }
    }
    return null;
  }

  function findCarWithMeta(carNo){
    var carNoStr = String(carNo);
    var normal = window.CARS_DATA || [];
    var bl = window.BL_CARS_DATA || window.BLACK_CARS_DATA || [];
    for(var i=0; i<normal.length; i++){
      if(String(normal[i].id) === carNoStr || String(normal[i].carNumber) === carNoStr){
        return {car: normal[i], collection: 'cars'};
      }
    }
    for(var j=0; j<bl.length; j++){
      if(String(bl[j].id) === carNoStr || String(bl[j].carNumber) === carNoStr){
        return {car: bl[j], collection: 'bl_cars'};
      }
    }
    return null;
  }

  function addField(){
    var popup = findPopup();
    if(!popup) return false;
    if(popup.querySelector('[data-km-field]')) return true;

    var hourlyInput = findInputByLabel('시간당 요금', popup);
    if(!hourlyInput) return false;

    var hourlyWrapper = hourlyInput.parentElement;
    var kmWrapper = hourlyWrapper.cloneNode(true);
    kmWrapper.setAttribute('data-km-field', 'true');

    var kmLabel = kmWrapper.querySelector('label');
    if(kmLabel) kmLabel.textContent = 'km당 요금 (원)';

    var kmInput = kmWrapper.querySelector('input');
    if(kmInput){
      kmInput.id = 'editVehicleKmFee';
      kmInput.value = '';
      kmInput.placeholder = '예: 500';
      kmInput.removeAttribute('list');
    }

    hourlyWrapper.parentNode.insertBefore(kmWrapper, hourlyWrapper.nextSibling);

    var carNoInput = findInputByLabel('차량번호', popup);
    if(carNoInput && carNoInput.value){
      var meta = findCarWithMeta(carNoInput.value);
      if(meta && meta.car[KM_FIELD] != null){
        kmInput.value = meta.car[KM_FIELD];
      }
    }

    var btns = popup.querySelectorAll('button');
    var saveBtn = null;
    for(var j=0; j<btns.length; j++){
      if(btns[j].textContent.indexOf('저장') !== -1){
        saveBtn = btns[j];
        break;
      }
    }

    if(saveBtn && !saveBtn.hasAttribute('data-km-hook')){
      saveBtn.setAttribute('data-km-hook', 'true');
      saveBtn.addEventListener('click', function(){
        setTimeout(function(){
          var kmVal = parseInt(kmInput.value, 10);
          if(isNaN(kmVal)) kmVal = 0;

          var carNo = carNoInput ? carNoInput.value : null;
          if(!carNo) return;

          try {
            var fn = window.FB_FN;
            var db = window.FB_DB;
            if(!fn || !db){
              console.error('❌ Firebase SDK 접근 불가');
              return;
            }

            var meta = findCarWithMeta(carNo);
            var collection = meta ? meta.collection : 'cars';

            var docId;
            if(meta && meta.car){
              docId = meta.car.docId || meta.car.id || meta.car.carNumber || carNo;
            } else {
              docId = carNo;
            }
            docId = String(docId);

            console.log('📤 저장 시도:', collection + '/' + docId, '=', kmVal);

            var updateData = {};
            updateData[KM_FIELD] = kmVal;

            fn.setDoc(fn.doc(db, collection, docId), updateData, {merge: true})
              .then(function(){
                console.log('✅ km당 요금 저장:', kmVal, '원 →', collection + '/' + docId);
              })
              .catch(function(err){
                console.error('❌ km당 요금 저장 실패:', err.code, err.message);
              });
          } catch(err){
            console.error('❌ km요금 처리 오류:', err);
          }
        }, 800);
      });
    }

    console.log('✅ km당 요금 필드 추가 완료');
    return true;
  }

  var observer = new MutationObserver(function(){
    addField();
  });
  if(document.body){
    observer.observe(document.body, {childList: true, subtree: true});
  }

  setTimeout(addField, 500);
  console.log('🎨 km당 요금 IIFE v4 활성화 (필드명: ' + KM_FIELD + ', docId: id 우선)');
})();

/* ===== 이벤트 팝업 UI v2 (타이틀 중앙, 본문 좌측, 확인 버튼 가로 확장) ===== */
(function modifyEventPopupV2(){
  'use strict';

  function findEventPopup(){
    var modal = document.getElementById('event-detail-modal');
    if(modal && modal.classList.contains('open')) return modal;
    return null;
  }

  function modifyPopup(){
    var popup = findEventPopup();
    if(!popup) return false;
    if(popup.dataset.eventModifiedV2 === 'true') return true;

    // 1. X 버튼 재차 숨기기
    var allEls = popup.querySelectorAll('button, span, div, a, i');
    for(var i=0; i<allEls.length; i++){
      var el = allEls[i];
      if(el.children.length !== 0) continue;
      var text = el.textContent.trim();
      if(text === '×' || text === 'X' || text === '✕' || text === '✖'){
        el.style.display = 'none';
      }
    }

    // 2. 최상단 타이틀 중앙 정렬
    var titleEl = document.getElementById('ev-detail-title');
    if(titleEl){
      titleEl.style.textAlign = 'center';
      titleEl.style.width = '100%';
    }

    // 3. 본문 영역: 기본은 좌측
    var body = document.getElementById('ev-detail-body');
    if(body){
      body.style.textAlign = 'left';
    }

    // 4. 헤더(h1-h6) → 중앙
    var headers = popup.querySelectorAll('h1, h2, h3, h4, h5, h6');
    for(var h=0; h<headers.length; h++){
      headers[h].style.textAlign = 'center';
    }

    // 5. 단락 (p) → 좌측
    var paragraphs = popup.querySelectorAll('p');
    for(var p=0; p<paragraphs.length; p++){
      paragraphs[p].style.textAlign = 'left';
    }

    // 6. 리스트 → 좌측 + 일반 불릿
    var lists = popup.querySelectorAll('ul, ol');
    for(var k=0; k<lists.length; k++){
      lists[k].style.listStylePosition = 'outside';
      lists[k].style.paddingLeft = '24px';
      lists[k].style.textAlign = 'left';
    }
    var items = popup.querySelectorAll('li');
    for(var li=0; li<items.length; li++){
      items[li].style.textAlign = 'left';
    }

    // 7. 확인 버튼 가로로 늘리기 (대칭)
    var allBtns = popup.querySelectorAll('button');
    for(var m=0; m<allBtns.length; m++){
      if(allBtns[m].textContent.trim() === '확인'){
        var confirmBtn = allBtns[m];
        confirmBtn.style.width = '100%';
        confirmBtn.style.display = 'block';
        confirmBtn.style.padding = '14px 20px';
        confirmBtn.style.borderRadius = '12px';
        confirmBtn.style.boxSizing = 'border-box';
        confirmBtn.style.margin = '0';

        var btnParent = confirmBtn.parentElement;
        if(btnParent){
          btnParent.style.display = 'block';
          btnParent.style.width = '100%';
          btnParent.style.padding = '12px 16px';
          btnParent.style.boxSizing = 'border-box';
        }
        break;
      }
    }

    popup.dataset.eventModifiedV2 = 'true';
    console.log('✅ 이벤트 팝업 UI v2 적용 완료');
    return true;
  }

  var observer = new MutationObserver(function(){
    setTimeout(modifyPopup, 50);
  });
  if(document.body){
    observer.observe(document.body, {childList: true, subtree: true});
  }

  setTimeout(modifyPopup, 500);
  console.log('🎨 이벤트 팝업 UI v2 활성화');
})();
/* ===== 이벤트 내용 업데이트 ===== */
(function updateEventDetails(){
  if(typeof EVENT_DETAILS === 'undefined' || !EVENT_DETAILS.length){
    console.warn('⚠️ EVENT_DETAILS 없음');
    return;
  }

  // 1. 신규 가입 첫 대여 30% 할인
  if(EVENT_DETAILS[0]){
    EVENT_DETAILS[0].body = EVENT_DETAILS[0].body.replace(
      '2026년 3월 1일 ~ 2026년 12월 31일',
      '상시'
    );
    EVENT_DETAILS[0].period = '상시';
  }

  // 2. CARO THE BLACK 출시 기념
  if(EVENT_DETAILS[1]){
    EVENT_DETAILS[1].body = EVENT_DETAILS[1].body
      .replace(/<li>제네시스 GV80[^<]*<\/li>/, '')
      .replace('2026년 3월 1일 ~ 2026년 6월 30일', '');
    EVENT_DETAILS[1].period = '';
  }

  // 3. 주말 특별 할인 최대 30%
  if(EVENT_DETAILS[3]){
    EVENT_DETAILS[3].body =
      '<h4 style="text-align:center">이벤트 내용</h4>' +
      '<p>매주 <strong>토·일요일</strong>에 대여 시 차량별로 최대 <strong>30% 자동 할인</strong>이 적용됩니다.</p>' +
      '<h4 style="text-align:center">적용 대상</h4>' +
      '<ul>' +
        '<li>더 뉴 모닝: 10% 할인</li>' +
        '<li>더 뉴 아반떼: 10% 할인</li>' +
        '<li>쏘나타 디 엣지: 20% 할인</li>' +
        '<li>더 뉴 셀토스: 20% 할인</li>' +
        '<li>디 올 뉴 코나: 30% 할인</li>' +
      '</ul>' +
      '<h4 style="text-align:center">유의 사항</h4>' +
      '<ul>' +
        '<li>쿠폰과 중복 불가</li>' +
        '<li>토요일 00:00 ~ 일요일 23:59 대여 시작 건만 적용</li>' +
      '</ul>' +
      '<h4 style="text-align:center">이벤트 기간</h4>' +
      '<p style="text-align:center">매주 토~일 (상시)</p>';
  }

  console.log('✅ 이벤트 내용 업데이트 완료');
})();

/* ===== 홈 이벤트 배너 우측 단순화 ===== */
(function simplifyEventBanners(){
  'use strict';

  function getBannerConfig(bannerText){
    if(bannerText.indexOf('카로 더 블랙') >= 0){
      return {
        text: 'CARO THE BLACK',
        cssText: 'font-size:1.1rem;font-weight:700;letter-spacing:0.2em;font-family:"Oswald",sans-serif;color:#c8a96e;'
      };
    }
    if(bannerText.indexOf('친구 추천') >= 0){
      return {
        text: '5,000P',
        cssText: 'font-size:2rem;font-weight:900;color:#fff;letter-spacing:-0.02em;'
      };
    }
    if(bannerText.indexOf('신규 가입') >= 0){
      return {
        text: '30%',
        cssText: 'font-size:2.5rem;font-weight:900;color:#fff;'
      };
    }
    if(bannerText.indexOf('주말') >= 0){
      return {
        text: '30%',
        cssText: 'font-size:2.5rem;font-weight:900;color:#fff;'
      };
    }
    return null;
  }

  function simplify(banner){
    if(banner.dataset.bannerSimplifiedV1 === 'true') return;

    var config = getBannerConfig(banner.textContent || '');
    if(!config) return;

    // 1. 모든 img, svg 숨기기
    banner.querySelectorAll('img, svg').forEach(function(el){
      el.style.display = 'none';
    });

    // 2. 마지막 직계 자식이 우측 장식이면 숨기기
    var kids = Array.from(banner.children);
    if(kids.length >= 2){
      var last = kids[kids.length - 1];
      var lastText = (last.textContent || '').trim();
      if(lastText.length < 50){
        last.style.display = 'none';
      }
    }

    // 3. 우측 영역에 새 텍스트 추가
    var existing = banner.querySelector('.bs-right-v1');
    if(existing) existing.remove();

    var rightEl = document.createElement('div');
    rightEl.className = 'bs-right-v1';
    rightEl.textContent = config.text;
    rightEl.style.cssText =
      'position:absolute;right:24px;top:50%;transform:translateY(-50%);' +
      'z-index:10;text-align:right;line-height:1;pointer-events:none;' + config.cssText;

    if(getComputedStyle(banner).position === 'static'){
      banner.style.position = 'relative';
    }

    banner.appendChild(rightEl);
    banner.dataset.bannerSimplifiedV1 = 'true';
  }

  function applyAll(){
    document.querySelectorAll('.auto-slide-item').forEach(simplify);
  }

  setTimeout(applyAll, 300);
  setTimeout(applyAll, 800);
  setTimeout(applyAll, 1500);
  setTimeout(applyAll, 3000);

  console.log('🎨 이벤트 배너 단순화 IIFE 활성화');
})();

/* ===== 결제 화면 텍스트 중앙 정렬 (일반 + BL) ===== */
(function centerPaymentScreen(){
  'use strict';

  function applyCentering(){
    var ps = document.getElementById('payment-screen');
    if(!ps) return;

    // 1. 총 결제 금액
    var totalRow = document.getElementById('pay-total-row');
    if(totalRow) totalRow.style.textAlign = 'center';

    // 2. step-heading (결제 수단 등)
    var headings = ps.querySelectorAll('.step-heading');
    headings.forEach(function(h){
      h.style.textAlign = 'center';
      h.style.width = '100%';
    });

    // 3. pay-select-row (결제 수단 선택 버튼)
    var selectRows = ps.querySelectorAll('.pay-select-row, [onclick*="openPaySheet"]');
    selectRows.forEach(function(el){
      el.style.justifyContent = 'center';
      el.style.textAlign = 'center';
    });

    // 4. pay-selected-label
    var label = document.getElementById('pay-selected-label');
    if(label){
      label.style.textAlign = 'center';
      label.style.flex = '1';
      label.style.width = '100%';
    }

    // 5. 라디오 버튼 행 (신용/체크카드 등)
    var radios = ps.querySelectorAll('input[type="radio"]');
    radios.forEach(function(radio){
      var parent = radio.closest('label') || radio.parentElement;
      if(parent && parent.tagName !== 'INPUT'){
        parent.style.justifyContent = 'center';
        parent.style.textAlign = 'center';
        parent.style.display = 'flex';
        parent.style.alignItems = 'center';
        parent.style.gap = '10px';
      }
    });

    console.log('✅ 결제 화면 중앙 정렬 적용');
  }

  // goTo 함수 가로채기 - payment-screen 진입 시 매번 적용
  function hookGoTo(){
    if(typeof window.goTo !== 'function') return false;
    if(window.goTo._paymentCenterHooked) return true;

    var orig = window.goTo;
    window.goTo = function(s, i){
      orig.call(this, s, i);
      if(s === 'payment-screen'){
        setTimeout(applyCentering, 100);
        setTimeout(applyCentering, 400);
        setTimeout(applyCentering, 1000);
      }
    };
    window.goTo._paymentCenterHooked = true;
    return true;
  }

  if(!hookGoTo()){
    var tries = 0;
    var iv = setInterval(function(){
      tries++;
      if(hookGoTo() || tries > 20) clearInterval(iv);
    }, 200);
  }

  setTimeout(applyCentering, 500);
  setTimeout(applyCentering, 1500);

  console.log('🎨 결제 화면 중앙 정렬 IIFE 활성화');
})();

/* ═══════════════════════════════════════════════════════════════
   📌 STEP 4 — 카로 모빌리티 고객센터 JS 추가본

   ✅ 적용 방법: script.js 파일의 맨 아래에 통째로 붙여넣기

   포함 기능:
   1. 고객센터 상세 — 5개 카테고리 아코디언 (goToCsDetail)
   2. 사고 접수 — 폼 제출, 파일 첨부, 부상자 토글
   3. 간편 문의 — 탭 전환, FAQ, 글자수, 파일 첨부
   4. 채팅 상담 — 메시지 송수신, 키워드 자동 응답
   5. 공통 — 전화 연결, 성공 모달
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  /* 카로 고객센터 전화번호 — 실제 번호로 변경하세요 */
  var CARO_CS_PHONE = '1588-0000';

  /* ─── 공통 유틸 ─── */
  function csEscapeHtml(s) {
    return String(s).replace(/[<>&"']/g, function(c){
      return {'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function csNowTime() {
    var d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var ampm = h < 12 ? '오전' : '오후';
    h = h % 12 || 12;
    return ampm + ' ' + h + ':' + (m < 10 ? '0' + m : m);
  }

  /* ════════════════════════════════════════
     1. 고객센터 상세 — 아코디언
  ════════════════════════════════════════ */
  function csToggleAcc(btn) {
    var body = btn.nextElementSibling;
    var isOpen = btn.classList.contains('csd-open');

    document.querySelectorAll('#cs-detail-screen .csd-acc-head.csd-open').forEach(function(b){
      b.classList.remove('csd-open');
      b.nextElementSibling.classList.remove('csd-open');
    });

    if (!isOpen) {
      btn.classList.add('csd-open');
      body.classList.add('csd-open');
      setTimeout(function(){
        btn.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    }
  }

  /* 메인 메뉴(5개)에서 호출 — index = 0~4 */
  function goToCsDetail(index) {
    if (typeof goTo === 'function') goTo('cs-detail-screen');

    document.querySelectorAll('#cs-detail-screen .csd-acc-head.csd-open').forEach(function(b){
      b.classList.remove('csd-open');
      b.nextElementSibling.classList.remove('csd-open');
    });

    setTimeout(function(){
      var heads = document.querySelectorAll('#cs-detail-screen .csd-acc-head');
      if (heads[index]) {
        heads[index].classList.add('csd-open');
        heads[index].nextElementSibling.classList.add('csd-open');
        setTimeout(function(){
          heads[index].scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }, 150);
  }

  /* ════════════════════════════════════════
     2. 사고 접수
  ════════════════════════════════════════ */
  function csToggleInjury(show) {
    var el = document.getElementById('cs-injury-detail');
    if (!el) return;
    if (show) el.classList.add('csd-active');
    else el.classList.remove('csd-active');
  }

  var csAccFiles = [];
  /* ★ [v101] 첨부 배열을 window 와 동기화 — 실제 접수 함수(customer-redesign.js 의 csSubmitAccident 오버라이드)가
     window.csAccFiles 를 읽는데, 예전엔 이 배열이 파일 안에만 있어서 사진이 항상 0장으로 접수됐다. */
  function csSyncAcc(){ if (window.csAccFiles && window.csAccFiles !== csAccFiles) csAccFiles = window.csAccFiles; window.csAccFiles = csAccFiles; }
  function csHandleAccFiles(e) {
    csSyncAcc();
    var files = Array.from(e.target.files);
    files.forEach(function(f){
      if (csAccFiles.length >= 10) return;
      if (f.size > 10 * 1024 * 1024) {
        alert('한 파일당 10MB 이하만 첨부 가능합니다: ' + f.name);
        return;
      }
      csAccFiles.push(f);
    });
    csRenderAccFileList();
    e.target.value = '';
  }
  function csRenderAccFileList() {
    csSyncAcc();
    var list = document.getElementById('cs-acc-file-list');
    if (!list) return;
    list.innerHTML = '';
    csAccFiles.forEach(function(f, i){
      var chip = document.createElement('div');
      chip.className = 'csd-file-chip';
      chip.innerHTML = '📎 ' + csEscapeHtml(f.name) + ' <button onclick="csRemoveAccFile(' + i + ')" type="button">×</button>';
      list.appendChild(chip);
    });
  }
  function csRemoveAccFile(i) {
    csSyncAcc();
    csAccFiles.splice(i, 1);
    csRenderAccFileList();
  }

  function csGenReceiptNum(prefix) {
    return 'CR-' + prefix + '-' + Date.now().toString().slice(-6);
  }

  /* ★ 사고·문의 접수 Firestore 저장 (폴백 구현)
     ※ 실제 실행되는 구현은 customer-redesign.js 5800행 부근의 window.csSubmitAccident/csSubmitInquiry 오버라이드다
        (accident_reports / support_inquiries 컬렉션, userId·type 필드). 아래는 그 파일이 로드되지 않았을 때의 폴백이며
        필드·컬렉션 이름을 동일하게 맞춰 firestore.rules 를 통과하도록 했다.
     - 사진은 긴 변 900px / JPEG 0.5 로 압축해 문서 안에 저장(총 700KB 예산, Storage 없이 동작)
     - 저장이 실패하면 '접수 완료'를 띄우지 않고 고객센터 연락처를 안내한다 */
  function csCompressImage(file, maxDim, quality){
    return new Promise(function(resolve){
      try{
        if(!file || !/^image\//.test(file.type)){ resolve(null); return; }
        var url=URL.createObjectURL(file), img=new Image();
        img.onload=function(){
          try{
            var w=img.naturalWidth||img.width, h=img.naturalHeight||img.height;
            if(w>=h && w>maxDim){ h=Math.round(h*maxDim/w); w=maxDim; } else if(h>w && h>maxDim){ w=Math.round(w*maxDim/h); h=maxDim; }
            var c=document.createElement('canvas'); c.width=w; c.height=h; c.getContext('2d').drawImage(img,0,0,w,h);
            resolve(c.toDataURL('image/jpeg', quality));
          }catch(e){ resolve(null); } finally { try{ URL.revokeObjectURL(url); }catch(e){} }
        };
        img.onerror=function(){ resolve(null); };
        img.src=url;
      }catch(e){ resolve(null); }
    });
  }
  function csPackPhotos(files){
    var budget=700000, out=[], list=(files||[]).slice(0,6);
    return list.reduce(function(p,f){
      return p.then(function(){
        return csCompressImage(f, 900, 0.5).then(function(d){
          if(d && d.length<=budget){ out.push(d); budget-=d.length; }
        });
      });
    }, Promise.resolve()).then(function(){ return out; });
  }
  function csSaveReport(collectionName, payload, files){
    if(typeof fbReady!=='function' || !fbReady()) return Promise.reject(new Error('offline'));
    var fn=window.FB_FN, db=window.FB_DB;
    var u=(window.FB_AUTH&&window.FB_AUTH.currentUser)||null;
    return csPackPhotos(files).then(function(photos){
      var ref=fn.doc(fn.collection(db, collectionName));
      var _uid=(u&&u.uid)||(window.userInfo&&userInfo.uid)||'';
      var data=Object.assign({}, payload, {
        id: ref.id,
        userId: _uid, uid: _uid,
        type: payload.kind,
        userEmail: (u&&u.email)||(window.userInfo&&(userInfo.email||userInfo.id))||'',
        userName: (window.userInfo&&userInfo.name)||'',
        userPhone: payload.phone||'',
        photos: photos, photoCount: photos.length,
        status: 'received',
        createdAt: new Date().toISOString(), createdTs: Date.now(),
        app: 'customer', appVersion: (window.CARO_CONFIG&&CARO_CONFIG.appVersion)||''
      });
      return fn.setDoc(ref, data).then(function(){ return ref.id; });
    });
  }
  function csFormValues(form){
    var o={};
    try{ new FormData(form).forEach(function(v,k){ if(typeof v==='string') o[k]=v.trim(); }); }catch(e){}
    return o;
  }
  function csSupportPhone(){ return (window.CARO_CONFIG&&CARO_CONFIG.supportPhone)||'고객센터'; }

  function csSubmitAccident(e) {
    e.preventDefault();
    var btn = document.querySelector('#accident-screen .submit-btn');
    btn.disabled = true;
    btn.textContent = '접수 처리 중...';

    var form=document.getElementById('cs-accident-form');
    var v=csFormValues(form);
    var injuryEl=document.querySelector('#accident-screen #cs-injury-detail');
    var payload={
      kind:'accident',
      accidentType: v.type||'', location: v.location||'', datetime: v.datetime||'',
      vehicle: v.vehicle||'', description: v.description||'', phone: v.phone||'',
      injury: !!(injuryEl && injuryEl.classList.contains('csd-active')),
      injuryDetail: v.injury||v['injury-detail']||'',
      bookNo: (function(){ try{ var i=(typeof ctrlResIdx!=='undefined'&&ctrlResIdx>=0&&myReservations[ctrlResIdx])?myReservations[ctrlResIdx]:null; return i?i.bookNo:''; }catch(e){ return ''; } })()
    };
    csSaveReport('accident_reports', payload, csAccFiles).then(function(id){
      csShowSuccessModal(
        '사고 접수가 완료되었습니다',
        '접수 내용이 운영팀에 전달되었습니다.<br>담당자가 확인 후 연락드립니다. 접수 번호를 보관해 주세요.',
        'A-'+id.slice(0,8).toUpperCase()
      );
      form.reset(); csAccFiles=[]; csRenderAccFileList(); csToggleInjury(false);
    }).catch(function(err){
      console.error('[사고접수] 저장 실패', err);
      alert('사고 접수가 저장되지 않았습니다.\n네트워크를 확인한 뒤 다시 시도하시거나, 긴급한 경우 '+csSupportPhone()+' 로 바로 연락해 주세요.\n(입력하신 내용은 화면에 그대로 남아 있습니다)');
    }).then(function(){
      btn.disabled = false;
      btn.textContent = '사고 접수 제출하기';
    });
  }

  /* ════════════════════════════════════════
     3. 간편 문의
  ════════════════════════════════════════ */
  function csSwitchTab(name, btn) {
    document.querySelectorAll('#inquiry-screen .csd-tab-btn').forEach(function(t){ t.classList.remove('csd-tab-active'); });
    document.querySelectorAll('#inquiry-screen .csd-pane').forEach(function(p){ p.classList.remove('csd-pane-active'); });
    btn.classList.add('csd-tab-active');
    document.getElementById('cs-pane-' + name).classList.add('csd-pane-active');
    var bar = document.getElementById('cs-inq-submit-bar');
    if (bar) bar.style.display = (name === 'write') ? 'block' : 'none';
  }

  function csUpdateCharCount() {
    var el = document.getElementById('cs-inq-content');
    var cur = el ? el.value.length : 0;
    var cnt = document.getElementById('cs-char-cur');
    if (cnt) cnt.textContent = cur;
  }

  var csInqFiles = [];
  function csSyncInq(){ if (window.csInqFiles && window.csInqFiles !== csInqFiles) csInqFiles = window.csInqFiles; window.csInqFiles = csInqFiles; }   /* ★ [v101] */
  function csHandleInqFiles(e) {
    csSyncInq();
    var files = Array.from(e.target.files);
    files.forEach(function(f){
      if (csInqFiles.length >= 5) return;
      if (f.size > 10 * 1024 * 1024) {
        alert('한 파일당 10MB 이하만 첨부 가능합니다: ' + f.name);
        return;
      }
      csInqFiles.push(f);
    });
    csRenderInqFileList();
    e.target.value = '';
  }
  function csRenderInqFileList() {
    csSyncInq();
    var list = document.getElementById('cs-inq-file-list');
    if (!list) return;
    list.innerHTML = '';
    csInqFiles.forEach(function(f, i){
      var chip = document.createElement('div');
      chip.className = 'csd-file-chip';
      chip.innerHTML = '📎 ' + csEscapeHtml(f.name) + ' <button onclick="csRemoveInqFile(' + i + ')" type="button">×</button>';
      list.appendChild(chip);
    });
  }
  function csRemoveInqFile(i) {
    csSyncInq();
    csInqFiles.splice(i, 1);
    csRenderInqFileList();
  }

  function csToggleFAQ(btn) {
    var ans = btn.nextElementSibling;
    var isOpen = btn.classList.contains('csd-open');
    document.querySelectorAll('.csd-faq-q.csd-open').forEach(function(b){
      b.classList.remove('csd-open');
      b.nextElementSibling.classList.remove('csd-open');
    });
    if (!isOpen) {
      btn.classList.add('csd-open');
      ans.classList.add('csd-open');
    }
  }

  function csSubmitInquiry(e) {
    e.preventDefault();
    var btn = document.querySelector('#inquiry-screen .submit-btn');
    btn.disabled = true;
    btn.textContent = '접수 처리 중...';

    var form=document.getElementById('cs-inquiry-form');
    var v=csFormValues(form);
    var payload={
      kind:'inquiry',
      category: v.category||'', title: v.title||'', content: v.content||'',
      name: v.name||'', phone: v.phone||'', email: v.email||'', replyMethod: v.replyMethod||'',
      agree: v.agree==='on'||v.agree==='true'
    };
    csSaveReport('support_inquiries', payload, csInqFiles).then(function(id){
      csShowSuccessModal(
        '문의가 접수되었습니다',
        '영업일 기준 24시간 이내에<br>답변드릴 예정입니다.',
        'Q-'+id.slice(0,8).toUpperCase()
      );
      form.reset(); csInqFiles=[]; csRenderInqFileList(); csUpdateCharCount();
    }).catch(function(err){
      console.error('[문의접수] 저장 실패', err);
      alert('문의가 저장되지 않았습니다.\n네트워크를 확인한 뒤 다시 시도해 주세요. (입력하신 내용은 화면에 그대로 남아 있습니다)');
    }).then(function(){
      btn.disabled = false;
      btn.textContent = '문의 접수하기';
    });
  }

  /* ════════════════════════════════════════
     4. 채팅 상담
  ════════════════════════════════════════ */
  function csAddMessage(text, isUser) {
    var box = document.getElementById('cs-messages');
    if (!box) return;
    var wrap = document.createElement('div');
    wrap.className = 'csd-msg ' + (isUser ? 'csd-user-msg' : 'csd-agent-msg');
    var html = '';
    if (!isUser) html += '<div class="csd-msg-avatar">C</div>';
    html += '<div class="csd-msg-content">';
    html += '  <div class="csd-msg-bubble">' + text + '</div>';
    html += '  <div class="csd-msg-time">' + csNowTime() + '</div>';
    html += '</div>';
    wrap.innerHTML = html;
    box.appendChild(wrap);
    csScrollChatToBottom();
  }

  function csAddSystemMessage(text) {
    var box = document.getElementById('cs-messages');
    if (!box) return;
    var wrap = document.createElement('div');
    wrap.className = 'csd-msg csd-system';
    wrap.innerHTML = '<div class="csd-msg-bubble">' + text + '</div>';
    box.appendChild(wrap);
    csScrollChatToBottom();
  }

  function csShowTyping() {
    var box = document.getElementById('cs-messages');
    if (!box) return;
    var wrap = document.createElement('div');
    wrap.className = 'csd-msg csd-agent-msg';
    wrap.id = 'cs-typing-msg';
    wrap.innerHTML = '<div class="csd-msg-avatar">C</div><div class="csd-msg-content"><div class="csd-msg-bubble"><div class="csd-typing-dots"><span></span><span></span><span></span></div></div></div>';
    box.appendChild(wrap);
    csScrollChatToBottom();
  }
  function csRemoveTyping() {
    var t = document.getElementById('cs-typing-msg');
    if (t) t.remove();
  }

  function csScrollChatToBottom() {
    var box = document.getElementById('cs-messages');
    if (!box) return;
    setTimeout(function(){ box.scrollTop = box.scrollHeight; }, 50);
  }

  function csAutoGrow(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 100) + 'px';
  }

  function csHandleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      csSendMessage();
    }
  }

  function csSendQuick(text) {
    var input = document.getElementById('cs-msg-input');
    if (!input) return;
    input.value = text;
    csSendMessage();
  }

  function csSendMessage() {
    var input = document.getElementById('cs-msg-input');
    if (!input) return;
    var text = input.value.trim();
    if (!text) return;
    csAddMessage(csEscapeHtml(text), true);
    input.value = '';
    csAutoGrow(input);
    csRespondTo(text);
  }

  function csRespondTo(userText) {
    csShowTyping();
    var delay = 800 + Math.random() * 800;
    setTimeout(function(){
      csRemoveTyping();
      csAddMessage(csMatchReply(userText), false);
    }, delay);
  }

  function csMatchReply(text) {
    var t = text.toLowerCase();

    if (/이용|사용|방법|어떻게|가입/.test(t)) {
      return '카로 이용 절차를 안내드릴게요. 📱<br><br>'
           + '① <strong>가입</strong> — 운전면허증·결제카드 등록 (만 21세 이상, 면허 1년 이상)<br>'
           + '② <strong>예약</strong> — 시간·위치·차종 선택<br>'
           + '③ <strong>이용</strong> — 카로존에서 스마트키로 차량 개폐<br>'
           + '④ <strong>반납</strong> — 지정 장소 주차 후 앱 [반납하기]<br><br>'
           + '더 자세한 안내는 <strong>고객센터 → 카로 이용안내</strong>를 참고해 주세요.';
    }
    if (/예약\s*변경|변경하|시간\s*변경|차종\s*변경/.test(t)) {
      return '예약 변경 안내드릴게요. ✏️<br><br>'
           + '▪ <strong>변경 가능 시점</strong> — 이용 시작 1시간 전까지<br>'
           + '▪ <strong>변경 항목</strong> — 시간·위치·차종·운전자 추가<br>'
           + '▪ <strong>방법</strong> — 앱 [예약 내역] → [변경하기]<br>'
           + '▪ <strong>수수료</strong> — 3회까지 무료, 이후 건당 1,000원';
    }
    if (/취소|환불|돌려/.test(t) && !/수수료/.test(t)) {
      return '예약 취소 방법을 안내드릴게요. 🔁<br><br>'
           + '앱에서 <strong>[예약 내역] → [취소하기]</strong>로 즉시 처리 가능합니다.<br><br>'
           + '▪ 환불은 결제수단으로 자동 반환 (카드 3~5일, 계좌 2~3일)<br>'
           + '▪ 포인트·쿠폰은 즉시 복원<br>'
           + '▪ 시점에 따라 취소 수수료가 부과될 수 있습니다';
    }
    if (/수수료|취소료|위약/.test(t)) {
      return '취소 수수료 기준을 안내드려요. 💰<br><br>'
           + '▪ <strong>48시간 전</strong> — 없음 (전액 환불)<br>'
           + '▪ <strong>48~24시간 전</strong> — 10%<br>'
           + '▪ <strong>24시간~1시간 전</strong> — 20%<br>'
           + '▪ <strong>1시간 이내</strong> — 30%<br><br>'
           + '회사 귀책 사유 시 수수료 면제이며 전액 환불됩니다.';
    }
    if (/사고|충돌|접촉|긁|파손|접수/.test(t)) {
      return '🚨 사고 발생 시 다음 순서대로 진행해 주세요.<br><br>'
           + '① <strong>부상자 구호</strong> 및 119 신고<br>'
           + '② 안전한 곳으로 이동 및 비상등 점등<br>'
           + '③ 사고 현장 사진·동영상 촬영<br>'
           + '④ 인적 피해 시 <strong>112 신고 (의무)</strong><br>'
           + '⑤ 카로 앱 <strong>[사고 접수]</strong>로 즉시 신고<br><br>'
           + '⚠️ <strong>즉시 신고하지 않으면 면책 적용이 제외</strong>됩니다.';
    }
    if (/반납|반환|돌려놓|주차/.test(t)) {
      return '반납 절차 안내드릴게요. 🅿️<br><br>'
           + '① 지정 카로존 주차<br>'
           + '② 차량 내 소지품 확인<br>'
           + '③ 연료/충전 상태 확인 (Full to Full)<br>'
           + '④ 외관 4면 사진 촬영<br>'
           + '⑤ 차문 잠금 후 <strong>[반납하기]</strong><br><br>'
           + '주정차 금지 구역 반납 시 과태료는 본인 부담입니다.';
    }
    if (/연장|시간\s*추가|더\s*쓰/.test(t)) {
      return '이용 연장 안내드릴게요. ⏰<br><br>'
           + '▪ <strong>신청 시점</strong> — 이용 종료 10분 전까지<br>'
           + '▪ <strong>최소 단위</strong> — 10분<br>'
           + '▪ <strong>최대 연장</strong> — 24시간<br>'
           + '▪ <strong>방법</strong> — 앱 [이용 중] → [연장하기]';
    }
    if (/환불|언제.*돈|돌려받/.test(t)) {
      return '환불 처리 일정 안내드릴게요. 💳<br><br>'
           + '▪ <strong>신용·체크카드</strong> — 영업일 3~5일<br>'
           + '▪ <strong>계좌이체</strong> — 영업일 2~3일<br>'
           + '▪ <strong>포인트·쿠폰</strong> — 즉시 복원';
    }
    if (/운영|영업|시간|평일|주말/.test(t)) {
      return '고객센터 운영 안내드려요. 🕐<br><br>'
           + '▪ <strong>채팅·일반 상담</strong> — 평일 09:00 ~ 18:00<br>'
           + '▪ <strong>사고·고장 (24시간)</strong> — ' + CARO_CS_PHONE + '<br>'
           + '▪ <strong>주말·공휴일</strong> — 일반 상담 휴무';
    }
    if (/안녕|반갑|hi|hello/.test(t)) {
      return '안녕하세요! 카로 모빌리티 상담원입니다. 😊 어떤 부분을 도와드릴까요?';
    }
    if (/감사|고마|땡큐|thanks/.test(t)) {
      return '도움이 되셨다니 다행이에요! 😊 안전 운전 하세요!';
    }
    return '문의하신 내용을 확인했습니다. 더 자세한 안내를 위해 상담원이 곧 연결됩니다. 🙏<br><br>'
         + '급하신 경우 <strong>' + CARO_CS_PHONE + '</strong>으로 전화 상담 또는 <strong>[간편 문의]</strong>를 이용해 주세요.';
  }

  function csCallSupport() {
    if (confirm('카로 고객센터(' + CARO_CS_PHONE + ')로 전화 연결하시겠습니까?')) {
      window.location.href = 'tel:' + CARO_CS_PHONE;
    }
  }

  function csEndChat() {
    if (confirm('상담을 종료하시겠습니까?')) {
      csAddSystemMessage('상담이 종료되었습니다. 이용해 주셔서 감사합니다.');
      var inp = document.getElementById('cs-msg-input');
      var snd = document.getElementById('cs-send-btn');
      var chips = document.getElementById('cs-quick-chips');
      if (inp) inp.disabled = true;
      if (snd) snd.disabled = true;
      if (chips) chips.style.display = 'none';
    }
  }

  function csConfirmExitChat() {
    if (confirm('상담을 종료하고 나가시겠습니까?')) {
      if (typeof goTo === 'function') goTo('cs-screen');
    }
  }

  function csAttachChatFile() {
    alert('파일 첨부 기능은 곧 지원될 예정입니다.\n사진은 [간편 문의]에서 첨부해 주세요.');
  }

  /* ════════════════════════════════════════
     5. 공통 성공 모달
  ════════════════════════════════════════ */
  function csShowSuccessModal(title, text, num) {
    document.getElementById('cs-modal-title').textContent = title;
    document.getElementById('cs-modal-text').innerHTML = text;
    document.getElementById('cs-receipt-num').textContent = num;
    var modal = document.getElementById('cs-success-modal');
    modal.style.display = 'flex';
    modal.classList.add('active');
  }
  function csCloseSuccess() {
    var modal = document.getElementById('cs-success-modal');
    modal.style.display = 'none';
    modal.classList.remove('active');
    if (typeof goTo === 'function') goTo('cs-screen');
  }

  /* ════════════════════════════════════════
     6. 초기화
  ════════════════════════════════════════ */
  function csInit() {
    /* 사고 접수 — 일시 기본값 */
    var dtInput = document.querySelector('#accident-screen input[name="datetime"]');
    if (dtInput && !dtInput.value) {
      var now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      dtInput.value = now.toISOString().slice(0, 16);
    }

    /* 채팅 — 첫 메시지 시간, 날짜 라벨, 운영시간 배너 */
    var firstTime = document.getElementById('cs-first-time');
    if (firstTime) firstTime.textContent = csNowTime();

    var todayLabel = document.getElementById('cs-today-label');
    if (todayLabel) {
      var d = new Date();
      todayLabel.textContent = (d.getMonth()+1) + '월 ' + d.getDate() + '일 (' + ['일','월','화','수','목','금','토'][d.getDay()] + ')';
    }

    var banner = document.getElementById('cs-info-banner');
    if (banner) {
      var now2 = new Date();
      var h = now2.getHours();
      var day = now2.getDay();
      var isOpen = (day >= 1 && day <= 5) && (h >= 9 && h < 18);
      if (isOpen) banner.classList.add('csd-hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', csInit);
  } else {
    csInit();
  }

  /* ════════════════════════════════════════
     7. window 전역 등록
  ════════════════════════════════════════ */
  window.csToggleAcc           = csToggleAcc;
  window.goToCsDetail          = goToCsDetail;
  window.csToggleInjury        = csToggleInjury;
  window.csHandleAccFiles      = csHandleAccFiles;
  window.csRemoveAccFile       = csRemoveAccFile;
  window.csSubmitAccident      = csSubmitAccident;
  window.csSwitchTab           = csSwitchTab;
  window.csUpdateCharCount     = csUpdateCharCount;
  window.csHandleInqFiles      = csHandleInqFiles;
  window.csRemoveInqFile       = csRemoveInqFile;
  window.csToggleFAQ           = csToggleFAQ;
  window.csSubmitInquiry       = csSubmitInquiry;
  window.csAutoGrow            = csAutoGrow;
  window.csHandleKey           = csHandleKey;
  window.csSendQuick           = csSendQuick;
  window.csSendMessage         = csSendMessage;
  window.csCallSupport         = csCallSupport;
  window.csEndChat             = csEndChat;
  window.csConfirmExitChat     = csConfirmExitChat;
  window.csAttachChatFile      = csAttachChatFile;
  window.csCloseSuccess        = csCloseSuccess;
  window.csRenderAccFileList   = csRenderAccFileList;   /* ★ [v101] 접수 후 첨부 목록 초기화용 */
  window.csRenderInqFileList   = csRenderInqFileList;
  csSyncAcc(); csSyncInq();

}());
/* ═══════════════════════════════════════════════════════════════
   CARO MOBILITY — 고객센터 JS 수정 패치 v1
   적용 위치: script.js 파일 맨 아래에 추가

   수정 사항:
   1. goToCsDetail 오버라이드 — 선택한 카테고리만 보이게
   2. 채팅 — 24시간 운영 (운영시간 배너 항상 숨김 + 응답 메시지 변경)
═══════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ════════════════════════════════════════
     [수정 1] 카테고리별 별도 표시
     클릭한 카테고리만 보이고 나머지는 숨김
  ════════════════════════════════════════ */
  window.goToCsDetail = function(index) {
    if (typeof goTo === 'function') goTo('cs-detail-screen');

    setTimeout(function(){
      var items = document.querySelectorAll('#cs-detail-screen .csd-acc-item');

      items.forEach(function(item, i) {
        if (i === index) {
          /* 선택한 카테고리만 표시 + 자동 펼침 */
          item.classList.remove('csd-acc-hidden');
          var head = item.querySelector('.csd-acc-head');
          var body = item.querySelector('.csd-acc-body');
          if (head) head.classList.add('csd-open');
          if (body) body.classList.add('csd-open');
        } else {
          /* 나머지 모든 카테고리 숨김 */
          item.classList.add('csd-acc-hidden');
        }
      });

      /* 상단으로 스크롤 */
      var screen = document.getElementById('cs-detail-screen');
      if (screen) screen.scrollTop = 0;
    }, 150);
  };

  /* 뒤로 가기로 cs-screen으로 돌아갈 때 — 다음에 들어올 때 정상 표시 */
  /* (별도 처리 불필요 — goToCsDetail이 호출될 때마다 다시 세팅됨) */


  /* ════════════════════════════════════════
     [수정 2] 채팅 24시간 운영
     운영시간 응답을 24시간으로 변경
  ════════════════════════════════════════ */

  /* csSendMessage 오버라이드 — 운영시간 키워드 응답을 24시간으로 변경 */
  var _origSendMessage = window.csSendMessage;
  if (typeof _origSendMessage === 'function') {
    /* csReplyTo는 IIFE 내부 함수라 직접 접근 불가 →
       메시지 추가 후 DOM에서 운영시간 텍스트를 24시간으로 치환 */

    /* MutationObserver로 새 메시지 추가 감지 → 텍스트 치환 */
    var chatBody = document.getElementById('cs-chat-body')
                || document.querySelector('#chat-screen .csd-chat-body')
                || document.querySelector('#chat-screen .csd-msgs');

    function patchOperatingHours() {
      var bubbles = document.querySelectorAll('#chat-screen .csd-msg.csd-agent-msg .csd-msg-bubble');
      bubbles.forEach(function(bubble){
        if (bubble.dataset.csdPatched) return;
        var html = bubble.innerHTML;
        if (html && (html.indexOf('평일 09:00') !== -1 || html.indexOf('주말·공휴일') !== -1)) {
          /* 운영시간 응답 → 24시간 운영으로 치환 */
          html = html.replace(/▪ <strong>채팅·일반 상담<\/strong> — 평일 09:00 ~ 18:00<br>/g,
                               '▪ <strong>채팅·일반 상담</strong> — 24시간 운영<br>');
          html = html.replace(/▪ <strong>주말·공휴일<\/strong> — 일반 상담 휴무/g,
                               '▪ <strong>주말·공휴일</strong> — 정상 운영');
          bubble.innerHTML = html;
          bubble.dataset.csdPatched = '1';
        }
      });
    }

    /* 페이지 로드 시점에 옵저버 시작 */
    function startObserver() {
      var target = document.getElementById('chat-screen');
      if (!target) {
        setTimeout(startObserver, 500);
        return;
      }
      var observer = new MutationObserver(function(){
        patchOperatingHours();
      });
      observer.observe(target, { childList: true, subtree: true });
      /* 초기 한 번 실행 */
      patchOperatingHours();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', startObserver);
    } else {
      startObserver();
    }
  }


  /* 운영시간 배너 — 24시간 운영이므로 항상 숨김 */
  function hideBanner() {
    var banner = document.getElementById('cs-info-banner');
    if (banner) {
      banner.style.display = 'none';
      banner.classList.add('csd-hidden');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideBanner);
  } else {
    hideBanner();
  }

  console.log('[CARO] 고객센터 패치 v1 적용 완료');
})();
/* ═══════════════════════════════════════════════════════════════
   CARO MOBILITY — 계정관리 상세 화면 통합 JS 패치
   범위: 9개 항목 (회원 탈퇴 제외)
   - 비밀번호 재설정
   - 휴대폰 번호 재설정
   - 계정 연동 설정
   - 요금제 해지/변경
   - 결제 카드
   - 크레딧
   - 미결제 내역
   - 할인 쿠폰
   - 혜택 & 이벤트
   - 약관 및 정책
═══════════════════════════════════════════════════════════════ */

(function(){
  'use strict';

  /* ─── localStorage 헬퍼 ─── */
  const STORE = {
    get(key, def){
      try{ const v=localStorage.getItem('caro_apd_'+key); return v?JSON.parse(v):def; }
      catch(e){ return def; }
    },
    set(key, val){
      try{ localStorage.setItem('caro_apd_'+key, JSON.stringify(val)); }
      catch(e){}
    }
  };

  /* ─── 토스트 (기존 함수 활용) ─── */
  function toast(msg, ok){
    if(typeof showToast === 'function'){ showToast(msg, ok); return; }
    const t = document.getElementById('toast');
    if(!t){ alert(msg); return; }
    t.textContent = msg;
    t.classList.add('show');
    if(ok===false) t.style.background='rgba(178,58,58,.92)';
    setTimeout(()=>{ t.classList.remove('show'); t.style.background=''; }, 2000);
  }

  /* ═══════════════════════════════════════════
     1. 비밀번호 재설정
  ═══════════════════════════════════════════ */
  function renderPassword(){
    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🔒</span>비밀번호 변경</div>
        <p class="apd-section-desc">계정 보안을 위해 정기적으로 비밀번호를 변경하는 것을 권장합니다.</p>

        <div class="apd-input-group">
          <label class="apd-input-label">현재 비밀번호 <span class="req">*</span></label>
          <input type="password" id="apd-pw-cur" class="apd-input" placeholder="현재 비밀번호를 입력하세요" autocomplete="current-password">
        </div>

        <div class="apd-input-group">
          <label class="apd-input-label">새 비밀번호 <span class="req">*</span></label>
          <input type="password" id="apd-pw-new" class="apd-input" placeholder="영문+숫자+특수문자 8자 이상" autocomplete="new-password">
          <div class="apd-pw-bar"><div class="apd-pw-bar-fill" id="apd-pw-strength"></div></div>
          <span class="apd-input-hint" id="apd-pw-hint">8자 이상 영문·숫자·특수문자 조합 권장</span>
        </div>

        <div class="apd-input-group">
          <label class="apd-input-label">새 비밀번호 확인 <span class="req">*</span></label>
          <input type="password" id="apd-pw-new2" class="apd-input" placeholder="비밀번호를 다시 입력하세요" autocomplete="new-password">
          <span class="apd-input-hint" id="apd-pw-match"></span>
        </div>

        <button class="apd-btn apd-btn-primary" id="apd-pw-submit">비밀번호 변경</button>
        <div id="apd-pw-result"></div>
      </div>

      <div class="apd-info">
        <strong>💡 안전한 비밀번호 설정 가이드</strong><br>
        ▪ 8자 이상 영문·숫자·특수문자 혼합 또는 10자 이상<br>
        ▪ 생일·전화번호·연속된 문자 사용 금지<br>
        ▪ 다른 사이트와 동일한 비밀번호 사용 금지<br>
        ▪ 비밀번호 유출 의심 시 즉시 변경<br>
        <span class="apd-legal">근거 — 「개인정보보호법」 및 한국인터넷진흥원(KISA) 「패스워드 선택 및 이용 안내서」(2024)<br>※ 비밀번호 주기적 변경 의무는 2023년 폐지되었습니다.</span>
      </div>
    `;
  }

  function bindPassword(){
    const cur = document.getElementById('apd-pw-cur');
    const nw = document.getElementById('apd-pw-new');
    const nw2 = document.getElementById('apd-pw-new2');
    const strength = document.getElementById('apd-pw-strength');
    const hint = document.getElementById('apd-pw-hint');
    const match = document.getElementById('apd-pw-match');
    const btn = document.getElementById('apd-pw-submit');
    const result = document.getElementById('apd-pw-result');

    function checkStrength(v){
      let score = 0;
      if(v.length >= 8) score++;
      if(v.length >= 12) score++;
      if(/[A-Z]/.test(v)) score++;
      if(/[a-z]/.test(v)) score++;
      if(/[0-9]/.test(v)) score++;
      if(/[^A-Za-z0-9]/.test(v)) score++;
      strength.className = 'apd-pw-bar-fill';
      if(score <= 2){ strength.classList.add('weak'); hint.textContent='⚠ 매우 취약 — 8자 이상 + 영문·숫자·특수문자 조합 권장'; }
      else if(score <= 4){ strength.classList.add('medium'); hint.textContent='보통 — 더 강력한 조합 권장'; }
      else { strength.classList.add('strong'); hint.textContent='✅ 안전한 비밀번호입니다'; }
    }

    function checkMatch(){
      if(!nw2.value){ match.textContent=''; return; }
      if(nw.value === nw2.value){ match.textContent='✅ 일치'; match.style.color='#1d7a3a'; }
      else { match.textContent='❌ 일치하지 않음'; match.style.color='#b23a3a'; }
    }

    nw.addEventListener('input', e => checkStrength(e.target.value));
    nw2.addEventListener('input', checkMatch);
    nw.addEventListener('input', checkMatch);

    btn.addEventListener('click', () => {
      if(!cur.value){ toast('현재 비밀번호를 입력해주세요', false); return; }
      if(nw.value.length < 8){ toast('새 비밀번호는 8자 이상이어야 합니다', false); return; }
      if(nw.value !== nw2.value){ toast('새 비밀번호가 일치하지 않습니다', false); return; }
      if(cur.value === nw.value){ toast('현재 비밀번호와 동일합니다', false); return; }
      result.innerHTML = '<div class="apd-result success">✅ 비밀번호가 성공적으로 변경되었습니다</div>';
      cur.value = ''; nw.value = ''; nw2.value = '';
      strength.className = 'apd-pw-bar-fill';
      hint.textContent = '8자 이상 영문·숫자·특수문자 조합 권장';
      match.textContent = '';
      toast('비밀번호가 변경되었습니다');
    });
  }

  /* ═══════════════════════════════════════════
     2. 휴대폰 번호 재설정
  ═══════════════════════════════════════════ */
  function renderPhone(){
    const phone = STORE.get('phone', '010-****-1234');
    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📱</span>휴대폰 번호 변경</div>

        <div class="apd-row">
          <span class="apd-row-label">현재 번호</span>
          <span class="apd-row-value">${phone}</span>
        </div>

        <div class="apd-input-group" style="margin-top:14px;">
          <label class="apd-input-label">새 휴대폰 번호 <span class="req">*</span></label>
          <input type="tel" id="apd-phone-new" class="apd-input" placeholder="01012345678" maxlength="11">
        </div>

        <div class="apd-input-group">
          <label class="apd-input-label">통신사 <span class="req">*</span></label>
          <div class="apd-carrier-row">
            <button class="apd-carrier-btn" data-c="SKT">SKT</button>
            <button class="apd-carrier-btn" data-c="KT">KT</button>
            <button class="apd-carrier-btn" data-c="LGU+">LGU+</button>
            <button class="apd-carrier-btn" data-c="알뜰폰">알뜰폰</button>
          </div>
        </div>

        <button class="apd-btn apd-btn-pass" id="apd-phone-pass" disabled>📱 PASS 본인인증</button>
        <div id="apd-phone-result"></div>
      </div>

      <div class="apd-info">
        <strong>💡 본인인증 안내</strong><br>
        본인 명의의 휴대폰 번호로만 변경 가능합니다.<br>
        PASS 앱 인증 또는 SMS 인증을 통해 본인 확인이 진행됩니다.<br>
        <span class="apd-legal">근거 — 「전기통신사업법」 제32조의4 (본인확인기관 지정)</span>
      </div>
    `;
  }

  function bindPhone(){
    const phoneIn = document.getElementById('apd-phone-new');
    const btn = document.getElementById('apd-phone-pass');
    const result = document.getElementById('apd-phone-result');
    let selectedCarrier = null;

    phoneIn.addEventListener('input', e => {
      e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 11);
      checkReady();
    });

    document.querySelectorAll('.apd-carrier-btn').forEach(b => {
      b.addEventListener('click', () => {
        document.querySelectorAll('.apd-carrier-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        selectedCarrier = b.dataset.c;
        checkReady();
      });
    });

    function checkReady(){
      const ready = phoneIn.value.length >= 10 && selectedCarrier;
      btn.disabled = !ready;
    }

    btn.addEventListener('click', () => {
      const num = phoneIn.value;
      const formatted = num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
      result.innerHTML = '<div class="apd-result success">📱 PASS 본인인증이 완료되었습니다<br>휴대폰 번호가 ' + formatted + ' 으로 변경되었습니다</div>';
      STORE.set('phone', formatted);
      toast('휴대폰 번호가 변경되었습니다');
      setTimeout(()=> { openMpDetail('휴대폰 번호 재설정'); }, 1500);
    });
  }

  /* ═══════════════════════════════════════════
     3. 계정 연동 설정
  ═══════════════════════════════════════════ */
  function renderSns(){
    const sns = STORE.get('sns', { kakao:false, naver:false, google:false, apple:false });
    function row(key, name, icon, iconClass){
      const c = sns[key];
      return `
        <div class="apd-sns-item">
          <div class="apd-sns-left">
            <div class="apd-sns-icon ${iconClass}">${icon}</div>
            <div>
              <div class="apd-sns-name">${name}</div>
              <div class="apd-sns-status ${c?'connected':''}">${c?'✅ 연결됨':'미연결'}</div>
            </div>
          </div>
          <button class="apd-sns-btn ${c?'connected':''}" data-sns="${key}">${c?'해제':'연결'}</button>
        </div>
      `;
    }
    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🔗</span>SNS 간편 로그인 연동</div>
        <p class="apd-section-desc">연동된 계정으로 간편하게 로그인할 수 있습니다.</p>
        ${row('kakao', '카카오', 'K', 'kakao')}
        ${row('naver', '네이버', 'N', 'naver')}
        ${row('google', '구글', 'G', 'google')}
        ${row('apple', '애플', '', 'apple')}
      </div>
      <div class="apd-info">
        <strong>💡 SNS 연동 안내</strong><br>
        ▪ 동일한 이메일을 사용하는 계정만 연동 가능<br>
        ▪ 연동 해제 시 해당 SNS로 로그인할 수 없습니다<br>
        ▪ 최소 1개의 로그인 수단은 유지해야 합니다<br>
        <span class="apd-legal">근거 — 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 및 OAuth 2.0 표준</span>
      </div>
    `;
  }

  function bindSns(){
    document.querySelectorAll('[data-sns]').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sns;
        const sns = STORE.get('sns', { kakao:false, naver:false, google:false, apple:false });
        sns[key] = !sns[key];
        STORE.set('sns', sns);
        toast(sns[key] ? '계정이 연결되었습니다' : '계정 연결이 해제되었습니다');
        openMpDetail('계정 연동 설정'); // 재렌더링
      });
    });
  }

  /* ═══════════════════════════════════════════
     4. 요금제 해지/변경
  ═══════════════════════════════════════════ */
  function renderPlan(){
    const current = STORE.get('plan', 'lite');
    function plan(id, name, price, desc){
      return `
        <div class="apd-plan ${current===id?'current':''}" data-plan="${id}">
          <div class="apd-plan-name">${name}</div>
          <div class="apd-plan-price">${price}<small>${price==='무료'?'':'/월'}</small></div>
          <div class="apd-plan-desc">${desc}</div>
        </div>
      `;
    }
    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">💎</span>요금제 선택</div>
        <p class="apd-section-desc">언제든지 요금제를 변경하거나 해지할 수 있습니다.</p>

        ${plan('lite', 'CARO LITE', '무료', '기본 차량 이용 · 일반 회원가')}
        ${plan('standard', 'CARO STANDARD', '9,900원', '시간당 10% 할인 · 우선 예약 · 멤버십 포인트 1.5배')}
        ${plan('premium', 'CARO PREMIUM', '29,900원', '전 차량 20% 할인 · 카로 더 블랙 이용 · 무료 면책 포함 · 24시간 컨시어지')}

        <button class="apd-btn apd-btn-primary" id="apd-plan-submit" style="margin-top:14px;">요금제 변경 신청</button>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">⚠️</span>요금제 해지</div>
        <p class="apd-section-desc">해지 시 다음 결제일부터 LITE(무료) 요금제로 전환됩니다.</p>
        <button class="apd-btn apd-btn-danger" id="apd-plan-cancel">요금제 해지하기</button>
      </div>

      <div class="apd-info">
        <strong>💡 결제 및 환불 안내</strong><br>
        ▪ 매월 최초 결제일에 자동 결제됩니다<br>
        ▪ 결제일 7일 이내 청약철회 가능 (서비스 미사용 시)<br>
        ▪ 해지 시 잔여 기간은 일할 계산하여 환불됩니다<br>
        ▪ 환불은 영업일 기준 3~5일 소요됩니다<br>
        <span class="apd-legal">근거 — 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조(청약철회) 및 제18조(청약철회의 효과)</span>
      </div>
    `;
  }

  function bindPlan(){
    let selected = STORE.get('plan', 'lite');
    document.querySelectorAll('[data-plan]').forEach(el => {
      el.addEventListener('click', () => {
        document.querySelectorAll('.apd-plan').forEach(x => x.classList.remove('current'));
        el.classList.add('current');
        selected = el.dataset.plan;
      });
    });
    document.getElementById('apd-plan-submit').addEventListener('click', () => {
      const cur = STORE.get('plan', 'lite');
      if(selected === cur){ toast('이미 사용 중인 요금제입니다', false); return; }
      STORE.set('plan', selected);
      const names = { lite:'CARO LITE', standard:'CARO STANDARD', premium:'CARO PREMIUM' };
      toast(names[selected] + ' 으로 변경되었습니다');
      openMpDetail('요금제 해지/변경');
    });
    document.getElementById('apd-plan-cancel').addEventListener('click', () => {
      if(!confirm('정말 요금제를 해지하시겠습니까?\n해지 시 LITE(무료) 요금제로 전환됩니다.')) return;
      STORE.set('plan', 'lite');
      toast('요금제가 해지되었습니다');
      openMpDetail('요금제 해지/변경');
    });
  }

  /* ═══════════════════════════════════════════
     5. 결제 카드
  ═══════════════════════════════════════════ */
  function renderCards(){
    const cards = STORE.get('cards', [
      { id:1, bank:'신한', last4:'1234', alias:'내 신한카드', isDefault:true },
      { id:2, bank:'국민', last4:'5678', alias:'국민체크', isDefault:false }
    ]);

    let html = `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">💳</span>등록된 카드</div>
    `;
    if(cards.length === 0){
      html += `<div class="apd-empty"><div class="apd-empty-icon">💳</div><div class="apd-empty-text">등록된 카드가 없습니다</div></div>`;
    } else {
      cards.forEach(c => {
        html += `
          <div class="apd-card-item ${c.isDefault?'default':''}">
            <div class="apd-card-left">
              <div class="apd-card-icon">${(c.bank||c.brand||'CARD')}</div>
              <div>
                <div class="apd-card-num">**** **** **** ${c.last4} ${c.isDefault?'<span class="apd-card-default-badge">DEFAULT</span>':''}</div>
                <div class="apd-card-alias">${(c.alias||('카드 ****'+(c.last4||'')))}</div>
              </div>
            </div>
            <button class="apd-sns-btn" data-card-del="${c.id}">삭제</button>
          </div>
        `;
      });
    }
    html += `
      </div>

      <!-- ★ FIX(H3): 앱 자체 카드번호·CVC 입력 폼 제거 (PCI-DSS·PG 계약 위반 소지, 실제 결제에도 쓰이지 않던 화면) -->
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">💳</span>결제 방식 안내</div>
        <div class="apd-info">
          <strong>카드 정보는 결제 시점에 토스페이먼츠 결제창에서 입력합니다.</strong><br>
          ▪ CARO 앱은 카드번호·유효기간·CVC를 수집하거나 저장하지 않습니다<br>
          ▪ 결제대행사(PG): 토스페이먼츠 — 카드 정보는 PG사 보안 구간에서만 처리<br>
          ▪ 카드 등록(자동결제) 기능은 PG 빌링키 계약 후 제공 예정입니다<br>
          <span class="apd-legal">근거 — 「여신전문금융업법」 및 「전자금융거래법」 제21조</span>
        </div>
      </div>
    `;
    return html;
  }

  function bindCards(){
    const num = document.getElementById('apd-card-num');
    const exp = document.getElementById('apd-card-exp');
    const cvc = document.getElementById('apd-card-cvc');

    if(num){
      num.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 16);
        e.target.value = v.replace(/(.{4})/g, '$1 ').trim();
      });
      exp.addEventListener('input', e => {
        let v = e.target.value.replace(/\D/g, '').slice(0, 4);
        if(v.length > 2) v = v.slice(0,2) + '/' + v.slice(2);
        e.target.value = v;
      });
      cvc.addEventListener('input', e => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
      });
    }

    document.querySelectorAll('[data-card-del]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if(!confirm('이 카드를 삭제하시겠습니까?')) return;
        const id = parseInt(btn.dataset.cardDel);
        let cards = STORE.get('cards', []);
        cards = cards.filter(c => c.id !== id);
        STORE.set('cards', cards);
        toast('카드가 삭제되었습니다');
        openMpDetail('결제 카드');
      });
    });

    const addBtn = document.getElementById('apd-card-add');
    if(addBtn){
      addBtn.addEventListener('click', () => {
        const nv = num.value.replace(/\s/g, '');
        if(!caroCardOk(nv)){ toast('카드 번호를 확인해주세요 (일반 16자리 / AMEX 15자리)', false); return; }
        if(exp.value.length !== 5){ toast('유효기간을 입력해주세요 (MM/YY)', false); return; }
        if(cvc.value.length<3||cvc.value.length>4){ toast('CVC 3~4자리를 입력해주세요 (AMEX는 4자리)', false); return; }
        const cards = STORE.get('cards', []);
        const last4 = nv.slice(-4);
        cards.push({
          id: Date.now(),
          bank: '카드',
          last4: last4,
          alias: document.getElementById('apd-card-alias').value || ('카드 ****' + last4),
          isDefault: cards.length === 0
        });
        STORE.set('cards', cards);
        toast('카드가 등록되었습니다');
        openMpDetail('결제 카드');
      });
    }
  }

  /* ═══════════════════════════════════════════
     6. 크레딧
  ═══════════════════════════════════════════ */
  function renderCredit(){
    const balance = STORE.get('credit', 15000);
    const history = STORE.get('credit_history', [
      { date:'2026.05.20', desc:'예약 결제 사용', amount:-5000 },
      { date:'2026.05.10', desc:'친구 추천 적립', amount:+5000 },
      { date:'2026.04.15', desc:'신규 가입 적립', amount:+10000 }
    ]);

    let histHtml = '';
    history.forEach(h => {
      const sign = h.amount > 0 ? '+' : '';
      const color = h.amount > 0 ? '#1d7a3a' : '#b23a3a';
      histHtml += `
        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:600;color:var(--text-1);">${h.desc}</div>
            <div style="font-size:.72rem;color:var(--text-m);margin-top:2px;">${h.date}</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:${color};">${sign}${h.amount.toLocaleString()}원</div>
        </div>
      `;
    });

    return `
      <div class="apd-credit-box">
        <div class="apd-credit-label">CARO CREDIT</div>
        <div class="apd-credit-amount">${balance.toLocaleString()}<small>원</small></div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">💰</span>크레딧 충전</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">
          <button class="apd-btn apd-btn-secondary" data-charge="10000" style="padding:10px;">+10,000원</button>
          <button class="apd-btn apd-btn-secondary" data-charge="30000" style="padding:10px;">+30,000원</button>
          <button class="apd-btn apd-btn-secondary" data-charge="50000" style="padding:10px;">+50,000원</button>
        </div>
        <button class="apd-btn apd-btn-primary" id="apd-credit-custom">직접 입력 충전</button>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📋</span>사용 내역</div>
        ${history.length ? histHtml : '<div class="apd-empty"><div class="apd-empty-text">내역이 없습니다</div></div>'}
      </div>

      <div class="apd-info">
        <strong>💡 크레딧 사용 안내</strong><br>
        ▪ 1원 = 1크레딧으로 사용 가능<br>
        ▪ 충전 후 환불 가능 (충전일로부터 7일 이내, 미사용 시)<br>
        ▪ 적립 크레딧은 적립일로부터 1년간 유효<br>
        ▪ 출금이 아닌 서비스 내 사용만 가능<br>
        <span class="apd-legal">근거 — 「전자상거래 등에서의 소비자보호에 관한 법률」 제17조</span>
      </div>
    `;
  }

  function bindCredit(){
    document.querySelectorAll('[data-charge]').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = parseInt(btn.dataset.charge);
        if(!confirm(amount.toLocaleString() + '원을 충전하시겠습니까?\n기본 결제 카드로 결제됩니다.')) return;
        const cur = STORE.get('credit', 0);
        STORE.set('credit', cur + amount);
        const hist = STORE.get('credit_history', []);
        const today = new Date();
        const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
        hist.unshift({ date:dateStr, desc:'크레딧 충전', amount:+amount });
        STORE.set('credit_history', hist);
        toast(amount.toLocaleString() + '원이 충전되었습니다');
        openMpDetail('크레딧');
      });
    });
    document.getElementById('apd-credit-custom').addEventListener('click', () => {
      const v = prompt('충전할 금액을 입력해주세요 (1,000원 이상)');
      if(!v) return;
      const amt = parseInt(v.replace(/[^0-9]/g, ''));
      if(!amt || amt < 1000){ toast('1,000원 이상 입력해주세요', false); return; }
      if(!confirm(amt.toLocaleString() + '원을 충전하시겠습니까?')) return;
      const cur = STORE.get('credit', 0);
      STORE.set('credit', cur + amt);
      const hist = STORE.get('credit_history', []);
      const today = new Date();
      const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;
      hist.unshift({ date:dateStr, desc:'크레딧 충전', amount:+amt });
      STORE.set('credit_history', hist);
      toast(amt.toLocaleString() + '원이 충전되었습니다');
      openMpDetail('크레딧');
    });
  }

  /* ═══════════════════════════════════════════
     7. 미결제 내역
  ═══════════════════════════════════════════ */
  function renderUnpaid(){
    const items = STORE.get('unpaid', []);
    let html = `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">⚠️</span>미결제 내역</div>
    `;
    if(items.length === 0){
      html += `
        <div class="apd-empty">
          <div class="apd-empty-icon">✅</div>
          <div class="apd-empty-text">미결제 내역이 없습니다</div>
          <div class="apd-empty-sub">정상적으로 모든 결제가 완료되었습니다</div>
        </div>
      `;
    } else {
      items.forEach(it => {
        html += `
          <div class="apd-unpaid-item">
            <div class="apd-unpaid-title">${it.title}</div>
            <div class="apd-unpaid-date">${it.date}</div>
            <div class="apd-unpaid-amount">${it.amount.toLocaleString()}원</div>
            <button class="apd-btn apd-btn-primary" data-pay="${it.id}">지금 결제</button>
          </div>
        `;
      });
    }
    html += `</div>`;

    html += `
      <div class="apd-info ${items.length?'apd-warn':''}">
        <strong>💡 미결제 안내</strong><br>
        ▪ 결제 실패 또는 지연 결제 항목이 표시됩니다<br>
        ▪ 미결제 항목이 있을 경우 신규 예약이 제한될 수 있습니다<br>
        ▪ 3일 이상 미결제 시 연체 이자 및 신용정보 등록 대상이 됩니다<br>
        <span class="apd-legal">근거 — 「신용정보의 이용 및 보호에 관한 법률」 및 「전자상거래법」</span>
      </div>
    `;
    return html;
  }

  function bindUnpaid(){
    document.querySelectorAll('[data-pay]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.pay;
        if(!confirm('이 항목을 결제하시겠습니까?')) return;
        let items = STORE.get('unpaid', []);
        items = items.filter(x => String(x.id) !== String(id));
        STORE.set('unpaid', items);
        toast('결제가 완료되었습니다');
        openMpDetail('미결제 내역');
      });
    });
  }

  /* ═══════════════════════════════════════════
     8. 할인 쿠폰
  ═══════════════════════════════════════════ */
  function renderCoupons(){
    const tab = window._apdCouponTab || 'available';
    const coupons = STORE.get('coupons', [
      { id:1, name:'신규 가입 30% 할인', discount:'-30%', expires:'2026.12.31', status:'available' },
      { id:2, name:'주말 특별 할인', discount:'-5,000원', expires:'2026.06.30', status:'available' },
      { id:3, name:'친구 추천 쿠폰', discount:'-3,000원', expires:'2026.05.01', status:'expired' },
      { id:4, name:'이벤트 할인', discount:'-10%', expires:'2026.04.15', status:'used' }
    ]);

    const filtered = coupons.filter(c => c.status === tab);
    let html = `
      <div class="apd-tabs">
        <button class="apd-tab ${tab==='available'?'active':''}" data-tab="available">사용 가능</button>
        <button class="apd-tab ${tab==='used'?'active':''}" data-tab="used">사용 완료</button>
        <button class="apd-tab ${tab==='expired'?'active':''}" data-tab="expired">만료됨</button>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🎟️</span>쿠폰 코드 등록</div>
        <div style="display:flex;gap:8px;">
          <input type="text" id="apd-coupon-code" class="apd-input" placeholder="쿠폰 코드를 입력하세요" style="flex:1;">
          <button class="apd-btn apd-btn-primary" id="apd-coupon-apply" style="width:auto;padding:13px 20px;">등록</button>
        </div>
      </div>
    `;

    if(filtered.length === 0){
      html += `<div class="apd-empty"><div class="apd-empty-icon">🎟️</div><div class="apd-empty-text">${tab==='available'?'사용 가능한 쿠폰이 없습니다':tab==='used'?'사용한 쿠폰이 없습니다':'만료된 쿠폰이 없습니다'}</div></div>`;
    } else {
      filtered.forEach(c => {
        const badgeText = c.status === 'available' ? 'AVAILABLE' : c.status === 'used' ? 'USED' : 'EXPIRED';
        html += `
          <div class="apd-coupon ${c.status}">
            <div class="apd-coupon-badge ${c.status}">${badgeText}</div>
            <div class="apd-coupon-name">${c.name}</div>
            <div class="apd-coupon-discount">${c.discount}</div>
            <div class="apd-coupon-meta">유효기간: ~${c.expires}</div>
          </div>
        `;
      });
    }

    html += `
      <div class="apd-info">
        <strong>💡 쿠폰 사용 안내</strong><br>
        ▪ 쿠폰은 1회 사용 후 자동 소멸됩니다<br>
        ▪ 만료일 이후에는 사용 불가합니다<br>
        ▪ 일부 쿠폰은 중복 사용이 제한될 수 있습니다<br>
        ▪ 양도·환불·현금화 불가<br>
        <span class="apd-legal">근거 — 「표시·광고의 공정화에 관한 법률」 및 자체 이용약관</span>
      </div>
    `;
    return html;
  }

  function bindCoupons(){
    document.querySelectorAll('.apd-tab').forEach(t => {
      t.addEventListener('click', () => {
        window._apdCouponTab = t.dataset.tab;
        openMpDetail('할인 쿠폰');
      });
    });
    const applyBtn = document.getElementById('apd-coupon-apply');
    if(applyBtn){
      applyBtn.addEventListener('click', () => {
        const v = document.getElementById('apd-coupon-code').value.trim();
        if(!v){ toast('쿠폰 코드를 입력해주세요', false); return; }
        if(v.length < 6){ toast('유효하지 않은 쿠폰 코드입니다', false); return; }
        toast('쿠폰이 등록되었습니다');
        document.getElementById('apd-coupon-code').value = '';
      });
    }
  }

  /* ═══════════════════════════════════════════
     9. 혜택 & 이벤트 (알림 설정)
  ═══════════════════════════════════════════ */
  function renderBenefits(){
    const n = STORE.get('notif', {
      push: true,
      email: true,
      sms: false,
      marketing: false,
      night: false
    });

    function tog(key, title, desc){
      return `
        <div class="apd-toggle-row">
          <div class="apd-toggle-info">
            <div class="apd-toggle-title">${title}</div>
            <div class="apd-toggle-desc">${desc}</div>
          </div>
          <div class="apd-toggle ${n[key]?'on':''}" data-notif="${key}"></div>
        </div>
      `;
    }

    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🔔</span>알림 설정</div>
        ${tog('push', '앱 푸시 알림', '예약 알림, 차량 상태, 결제 등')}
        ${tog('email', '이메일 알림', '영수증 및 중요 안내사항')}
        ${tog('sms', 'SMS 알림', '본인인증 및 긴급 알림')}
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🎁</span>마케팅 정보 수신 동의</div>
        ${tog('marketing', '혜택 · 이벤트 정보', '할인 쿠폰, 신규 이벤트, 프로모션')}
        ${tog('night', '야간 광고성 정보 (21:00 ~ 익일 08:00)', '야간 시간대 광고 정보 별도 동의')}
      </div>

      <div class="apd-info apd-warn">
        <strong>📜 정보통신망법 제50조 안내</strong><br>
        ▪ 광고성 정보는 수신자의 명시적 동의가 있는 경우에만 전송됩니다<br>
        ▪ 21시부터 익일 8시 사이의 광고성 정보는 별도 동의가 필요합니다 (제50조 제3항)<br>
        ▪ 언제든지 수신 거부할 수 있으며, 거부 시 광고가 즉시 중단됩니다<br>
        ▪ 위반 시 3천만원 이하 과태료 부과<br>
        <span class="apd-legal">근거 — 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」 제50조 (영리목적의 광고성 정보 전송 제한)</span>
      </div>
    `;
  }

  function bindBenefits(){
    document.querySelectorAll('[data-notif]').forEach(tg => {
      tg.addEventListener('click', () => {
        const key = tg.dataset.notif;
        const n = STORE.get('notif', { push:true, email:true, sms:false, marketing:false, night:false });
        n[key] = !n[key];
        STORE.set('notif', n);
        tg.classList.toggle('on');
        if(key === 'marketing' || key === 'night'){
          const today = new Date().toISOString().slice(0,10);
          toast((n[key]?'동의':'거부') + ' 처리되었습니다 (' + today + ')');
        } else {
          toast(n[key] ? '알림이 활성화되었습니다' : '알림이 비활성화되었습니다');
        }
      });
    });
  }

  /* ═══════════════════════════════════════════
     10. 약관 및 정책
  ═══════════════════════════════════════════ */
  function renderTerms(){
    return `
      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📜</span>이용약관 및 정책</div>

        <div class="apd-terms-item" data-terms="service">
          <span class="apd-terms-name">서비스 이용약관</span>
          <span class="apd-terms-arrow">›</span>
        </div>
        <div class="apd-terms-item" data-terms="privacy">
          <span class="apd-terms-name">개인정보 처리방침</span>
          <span class="apd-terms-arrow">›</span>
        </div>
        <div class="apd-terms-item" data-terms="location">
          <span class="apd-terms-name">위치정보 이용약관</span>
          <span class="apd-terms-arrow">›</span>
        </div>
        <div class="apd-terms-item" data-terms="third">
          <span class="apd-terms-name">제3자 정보제공 동의</span>
          <span class="apd-terms-arrow">›</span>
        </div>
        <div class="apd-terms-item" data-terms="marketing">
          <span class="apd-terms-name">마케팅 정보 수신 동의</span>
          <span class="apd-terms-arrow">›</span>
        </div>
        <div class="apd-terms-item" data-terms="youth">
          <span class="apd-terms-name">청소년 보호정책</span>
          <span class="apd-terms-arrow">›</span>
        </div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">ℹ️</span>사업자 정보</div>
        <div class="apd-row"><span class="apd-row-label">상호</span><span class="apd-row-value">(주)카로모빌리티</span></div>
        <div class="apd-row"><span class="apd-row-label">대표자</span><span class="apd-row-value">허경준</span></div>
        <div class="apd-row"><span class="apd-row-label">사업자등록번호</span><span class="apd-row-value">851-88-03946</span></div>
        <div class="apd-row"><span class="apd-row-label">통신판매업신고</span><span class="apd-row-value">신고 준비 중</span></div>
        <div class="apd-row"><span class="apd-row-label">주소</span><span class="apd-row-value">인천광역시 연수구 센트럴로 313, 씨동 2304호 4-7 (송도동, 송도씨워크 인테라스한라)</span></div>
        <div class="apd-row"><span class="apd-row-label">고객센터</span><span class="apd-row-value">info@caromobility.kr (전화 준비 중)</span></div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📌</span>버전 정보</div>
        <div class="apd-row"><span class="apd-row-label">앱 버전</span><span class="apd-row-value">v3.0.0</span></div>
        <div class="apd-row"><span class="apd-row-label">최종 업데이트</span><span class="apd-row-value">2026.05.20</span></div>
        <div class="apd-row"><span class="apd-row-label">서비스 약관 버전</span><span class="apd-row-value">v2.1 (2026.01.01)</span></div>
      </div>

      <div class="apd-info">
        <strong>📜 관련 법령</strong><br>
        ▪ 「개인정보보호법」<br>
        ▪ 「위치정보의 보호 및 이용 등에 관한 법률」<br>
        ▪ 「전자상거래 등에서의 소비자보호에 관한 법률」<br>
        ▪ 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」<br>
        ▪ 「여객자동차 운수사업법」<br>
        ▪ 「자동차대여 표준약관」 (공정거래위원회 제10064호)<br>
      </div>
    `;
  }

  function bindTerms(){
    const TERMS_CONTENT = {
      service: { title:'서비스 이용약관', body: `<h3>제1조 (목적)</h3><p>본 약관은 (주)카로 모빌리티(이하 "회사")가 제공하는 차량 공유 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p><h3>제2조 (이용 자격)</h3><p>① 만 21세 이상이며, 운전면허 취득 후 1년 이상 경과한 자<br>② 본인 명의의 결제수단을 보유한 자<br>③ 「여객자동차 운수사업법」 제34조의2에 따른 운전자격 확인을 통과한 자</p><h3>제3조 (서비스 이용 계약)</h3><p>회원가입 신청에 대한 회사의 승낙으로 이용계약이 성립됩니다.</p>` },
      privacy: { title:'개인정보 처리방침', body:`<h3>1. 수집하는 개인정보</h3><p>이메일, 휴대폰 번호, 운전면허번호, 결제정보, 위치정보</p><h3>2. 수집 목적</h3><p>회원관리, 서비스 제공, 차량 대여 계약 이행, 본인확인</p><h3>3. 보유 기간</h3><p>회원 탈퇴 시까지 (관계 법령에 따라 일정 기간 보관)</p><p>▪ 계약 또는 청약철회 기록: 5년 (전자상거래법)<br>▪ 대금결제 및 재화공급 기록: 5년<br>▪ 소비자 불만 및 분쟁처리 기록: 3년</p>` },
      location: { title:'위치정보 이용약관', body:`<h3>제1조 (목적)</h3><p>본 약관은 「위치정보의 보호 및 이용 등에 관한 법률」에 따라 회사가 제공하는 위치기반 서비스 이용에 관한 권리·의무를 규정합니다.</p><h3>제2조 (위치정보 수집)</h3><p>차량 위치 파악 및 가까운 카로존 안내를 위해 GPS 위치정보를 수집합니다. 위치정보 수집을 거부할 권리가 있으며, 거부 시 일부 서비스 이용이 제한될 수 있습니다.</p><h3>제3조 (보유 기간)</h3><p>위치정보 수집·이용·제공 사실 확인자료는 6개월간 자동 저장됩니다.</p>` },
      third: { title:'제3자 정보제공 동의', body:`<h3>제공받는 자</h3><p>▪ 토스페이먼츠 (결제 처리)<br>▪ 보험사 (대인·대물 사고 처리)<br>▪ 경찰청 (교통사고 발생 시)</p><h3>제공 항목</h3><p>이름, 연락처, 결제 정보, 사고 관련 정보</p><h3>이용 목적</h3><p>결제 처리, 보험 청구, 법적 의무 이행</p><h3>보유 기간</h3><p>법령에 따른 보관 기간 (통상 5년)</p>` },
      marketing: { title:'마케팅 정보 수신 동의', body:`<h3>수집 목적</h3><p>이벤트, 할인 쿠폰, 신규 서비스 안내</p><h3>제공 항목</h3><p>이메일, 휴대폰 번호</p><h3>수신 채널</h3><p>이메일, SMS, 앱 푸시</p><h3>철회 안내</h3><p>언제든지 수신 거부 가능하며 정보통신망법 제50조에 따라 즉시 처리됩니다.</p>` },
      youth: { title:'청소년 보호정책', body:`<h3>1. 청소년 보호 책임자</h3><p>회사는 청소년 보호를 위해 보호책임자를 지정 운영합니다.</p><h3>2. 가입 제한</h3><p>본 서비스는 만 21세 이상만 가입 가능합니다.</p><h3>3. 청소년 보호 활동</h3><p>유해 정보 차단 및 청소년 관련 법령 준수</p>` }
    };

    document.querySelectorAll('[data-terms]').forEach(el => {
      el.addEventListener('click', () => {
        const key = el.dataset.terms;
        const t = TERMS_CONTENT[key];
        if(!t) return;
        const m = document.getElementById('terms-modal');
        document.getElementById('modal-title').textContent = t.title;
        document.getElementById('modal-body').innerHTML = t.body;
        if(m) m.classList.add('show');
      });
    });
  }

  /* ═══════════════════════════════════════════
     메인 디스패처
  ═══════════════════════════════════════════ */
  /* ═══════════════════════════════════════════
     ★ 운전면허증 확인 화면 (등록 면허 조회 + 추가운전자)
  ═══════════════════════════════════════════ */
  function _licMask(numStr){
    var v=String(numStr||'');
    if(v.length<6) return v||'—';
    var head=v.slice(0,5), tail=v.slice(-3);
    var mid=v.slice(5,-3).replace(/[0-9]/g,'•');
    return head+mid+tail;
  }
  function renderLicense(){
    var lic=null, reg=false, extra=null;
    try{ lic=JSON.parse(localStorage.getItem('caro_license')||'null'); }catch(e){}
    try{ reg=localStorage.getItem('caro_license_registered')==='true'; }catch(e){}
    try{ extra=JSON.parse(localStorage.getItem('caro_extra_driver')||'null'); }catch(e){}
    var h='<div class="apd-section">';
    h+='<div class="apd-section-title"><span class="apd-section-title-icon">🪪</span>등록된 운전면허증</div>';
    if(lic&&(lic.number||lic.name)){
      h+='<div class="apd-row"><span class="apd-row-label">상태</span><span class="apd-row-value" style="color:#1d7a3a;font-weight:700;">'+(reg?'등록 완료':'확인 중')+'</span></div>';
      h+='<div class="apd-row"><span class="apd-row-label">이름</span><span class="apd-row-value">'+(lic.name||(window.userInfo&&userInfo.name)||'—')+'</span></div>';   /* ★ [v101] 면허에 이름이 없으면 계정 이름 */
      h+='<div class="apd-row"><span class="apd-row-label">면허번호</span><span class="apd-row-value">'+_licMask(lic.number)+'</span></div>';
      h+='<div class="apd-row"><span class="apd-row-label">면허종류</span><span class="apd-row-value">'+(lic.type||'—')+'</span></div>';
      if(lic.birth) h+='<div class="apd-row"><span class="apd-row-label">생년월일</span><span class="apd-row-value">'+lic.birth+'</span></div>';
      if(lic.expiry) h+='<div class="apd-row"><span class="apd-row-label">갱신기간</span><span class="apd-row-value">'+lic.expiry+'</span></div>';
      h+='<div class="apd-row"><span class="apd-row-label">진위확인</span><span class="apd-row-value" style="color:'+(window.CARO_LICENSE_API&&window.CARO_LICENSE_API.enabled?'#1d7a3a':'#b07800')+';">'
        +(window.CARO_LICENSE_API&&window.CARO_LICENSE_API.enabled?'기관 확인 완료':'형식 확인 완료 · 기관 연동 대기')+'</span></div>';
    }else{
      h+='<div style="padding:18px 4px;color:var(--text-m);font-size:.86rem;line-height:1.6;">아직 등록된 면허증이 없습니다.<br>회원가입 또는 첫 예약 시 면허 정보를 등록하면 여기에서 확인할 수 있어요.</div>';
    }
    h+='</div>';
    /* 추가운전자 */
    h+='<div class="apd-section" style="margin-top:14px;">';
    h+='<div class="apd-section-title"><span class="apd-section-title-icon">👤</span>추가운전자 <span style="font-size:.7rem;color:var(--text-m);font-weight:400;">대여자 외 1명</span></div>';
    if(extra&&extra.name){
      h+='<div class="apd-row"><span class="apd-row-label">이름</span><span class="apd-row-value">'+extra.name+'</span></div>';
      h+='<div class="apd-row"><span class="apd-row-label">면허번호</span><span class="apd-row-value">'+_licMask(extra.license)+'</span></div>';
      h+='<div class="apd-row"><span class="apd-row-label">확인 상태</span><span class="apd-row-value">'+(extra.verified?'진위확인 완료':'형식 확인 완료')+'</span></div>';
    }else{
      h+='<div style="padding:14px 4px;color:var(--text-m);font-size:.84rem;">등록된 추가운전자가 없습니다.</div>';
    }
    h+='<button class="apd-btn" id="apd-extra-driver-btn" style="margin-top:10px;">'+(extra&&extra.name?'추가운전자 변경':'추가운전자 등록')+'</button>';
    h+='</div>';
    return h;
  }
  function bindLicense(){
    var b=document.getElementById('apd-extra-driver-btn');
    if(b) b.onclick=function(){ if(window.caroOpenExtraDriver) caroOpenExtraDriver(); else toast('등록 기능을 불러오지 못했습니다', false); };
  }

  const RENDERERS = {
    '면허증': { render:renderLicense, bind:bindLicense },
    '비밀번호 재설정': { render:renderPassword, bind:bindPassword },
    '휴대폰 번호 재설정': { render:renderPhone, bind:bindPhone },
    '계정 연동 설정': { render:renderSns, bind:bindSns },
    '요금제 해지/변경': { render:renderPlan, bind:bindPlan },
    '결제 카드': { render:renderCards, bind:bindCards },
    '크레딧': { render:renderCredit, bind:bindCredit },
    '미결제 내역': { render:renderUnpaid, bind:bindUnpaid },
    '할인 쿠폰': { render:renderCoupons, bind:bindCoupons },
    '혜택 & 이벤트': { render:renderBenefits, bind:bindBenefits },
    '약관 및 정책': { render:renderTerms, bind:bindTerms }
  };

  /* ─── openMpDetail 오버라이드 ─── */
  const originalOpenMpDetail = window.openMpDetail;
  window.openMpDetail = function(title){
    // 회원 탈퇴는 기존 함수 호출 (건들지 않기)
    if(title === '회원 탈퇴'){
      if(typeof originalOpenMpDetail === 'function') return originalOpenMpDetail(title);
      return;
    }

    // 화면 전환
    if(typeof goTo === 'function') goTo('account-detail-screen');

    // 타이틀 설정
    const titleEl = document.getElementById('mpd-title');
    if(titleEl) titleEl.textContent = title;

    // 콘텐츠 렌더링
    const content = document.querySelector('#account-detail-screen .mpd-content');
    if(!content) return;

    const r = RENDERERS[title];
    if(r){
      content.innerHTML = r.render();
      setTimeout(() => { if(r.bind) r.bind(); }, 0);
    } else {
      // 알 수 없는 타이틀 - 기존 함수 호출
      if(typeof originalOpenMpDetail === 'function') return originalOpenMpDetail(title);
    }

    // 콘텐츠 스크롤 맨 위로
    setTimeout(() => { content.scrollTop = 0; }, 10);
  };

  console.log('[CARO] 계정관리 패치 v1 적용 완료 — 9개 화면 + 회원 탈퇴 보존');

})();
/* ═══════════════════════════════════════════
   크레딧 화면 - 적립/지급 방식으로 재구성 패치
═══════════════════════════════════════════ */
(function(){
  'use strict';

  const STORE = {
    get(key, def){
      try{ const v=localStorage.getItem('caro_apd_'+key); return v?JSON.parse(v):def; }
      catch(e){ return def; }
    },
    set(key, val){
      try{ localStorage.setItem('caro_apd_'+key, JSON.stringify(val)); }
      catch(e){}
    }
  };

  const originalOpenMpDetail = window.openMpDetail;

  window.openMpDetail = function(title){
    // 크레딧이 아니면 기존 함수 호출
    if(title !== '크레딧'){
      if(typeof originalOpenMpDetail === 'function') return originalOpenMpDetail(title);
      return;
    }

    // 화면 전환
    if(typeof goTo === 'function') goTo('account-detail-screen');

    // 타이틀 설정
    const titleEl = document.getElementById('mpd-title');
    if(titleEl) titleEl.textContent = title;

    const content = document.querySelector('#account-detail-screen .mpd-content');
    if(!content) return;

    const balance = STORE.get('credit', 15000);
    const history = STORE.get('credit_history', [
      { date:'2026.05.25', desc:'차량 대여 적립 (셀토스 4시간)', amount:+2400 },
      { date:'2026.05.20', desc:'예약 결제 사용', amount:-5000 },
      { date:'2026.05.10', desc:'친구 추천 적립', amount:+5000 },
      { date:'2026.04.15', desc:'신규 가입 적립', amount:+10000 }
    ]);

    let histHtml = '';
    history.forEach(h => {
      const sign = h.amount > 0 ? '+' : '';
      const color = h.amount > 0 ? '#1d7a3a' : '#b23a3a';
      histHtml += `
        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:600;color:var(--text-1);">${h.desc}</div>
            <div style="font-size:.72rem;color:var(--text-m);margin-top:2px;">${h.date}</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:${color};">${sign}${h.amount.toLocaleString()}원</div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="apd-credit-box">
        <div class="apd-credit-label">CARO CREDIT</div>
        <div class="apd-credit-amount">${balance.toLocaleString()}<small>원</small></div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🎁</span>크레딧 적립 방법</div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">차량 대여 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">대여 결제 금액의 일정 비율 자동 적립</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">5%</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">신규 가입 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">가입 완료 시 자동 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">+10,000원</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">친구 추천 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">추천 코드 사용 시 추천인·피추천인 양쪽 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">+5,000원</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">이벤트 보너스</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">진행 중인 이벤트 참여 시 차등 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.92rem;font-weight:700;color:#1d7a3a;">변동</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">회사 지급</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">사과·보상·VIP 혜택 등 회사 정책에 따라 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.86rem;font-weight:700;color:#b07d2a;">개별 안내</div>
        </div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">⏰</span>만료 예정 크레딧</div>
        <div class="apd-row">
          <span class="apd-row-label">3개월 이내 만료 예정</span>
          <span class="apd-row-value" style="color:#b23a3a;">3,000원</span>
        </div>
        <div class="apd-row">
          <span class="apd-row-label">가장 빠른 만료일</span>
          <span class="apd-row-value">2026.07.31</span>
        </div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📋</span>적립/사용 내역</div>
        ${history.length ? histHtml : '<div class="apd-empty"><div class="apd-empty-text">내역이 없습니다</div></div>'}
      </div>

      <div class="apd-info">
        <strong>💡 크레딧 안내</strong><br>
        ▪ 적립된 크레딧은 <strong>1원 = 1크레딧</strong>으로 차량 대여 시 사용 가능<br>
        ▪ 적립일로부터 <strong>1년간 유효</strong>하며 만료 시 자동 소멸<br>
        ▪ 환불·양도·현금화 불가 (서비스 내 사용만 가능)<br>
        ▪ 회원 탈퇴 시 잔여 크레딧은 자동 소멸<br>
        ▪ 부정 적립 행위 적발 시 적립 취소 및 회수 가능<br>
        <span class="apd-legal">근거 — 「전자상거래 등에서의 소비자보호에 관한 법률」 및 자체 약관</span>
      </div>
    `;

    setTimeout(() => { content.scrollTop = 0; }, 10);
  };

  console.log('[CARO] 크레딧 화면 패치 v2 적용 — 적립/지급 방식');
})();
/* ═══════════════════════════════════════════
   계정관리 - 신규 가입자 데이터 초기화 + 크레딧 화면 업데이트
   ※ 한 번만 실행되며, 사용자 활동 시 자동 누적됨
═══════════════════════════════════════════ */
(function(){
  'use strict';

  const STORE = {
    get(key, def){
      try{ const v=localStorage.getItem('caro_apd_'+key); return v?JSON.parse(v):def; }
      catch(e){ return def; }
    },
    set(key, val){
      try{ localStorage.setItem('caro_apd_'+key, JSON.stringify(val)); }
      catch(e){}
    },
    has(key){
      return localStorage.getItem('caro_apd_'+key) !== null;
    }
  };

  /* ─── 1. 신규 가입자 초기화 (최초 1회만 실행) ─── */
  const INIT_KEY = 'init_v3';
  if(!STORE.has(INIT_KEY)){
    // 기존 테스트 데이터 모두 삭제
    const KEYS_TO_RESET = ['credit', 'credit_history', 'cards', 'coupons', 'unpaid', 'sns', 'plan', 'notif', 'phone'];
    KEYS_TO_RESET.forEach(k => localStorage.removeItem('caro_apd_' + k));

    // 오늘 날짜
    const today = new Date();
    const dateStr = `${today.getFullYear()}.${String(today.getMonth()+1).padStart(2,'0')}.${String(today.getDate()).padStart(2,'0')}`;

    // 1년 후 만료일 (쿠폰용)
    const expiry = new Date(today);
    expiry.setFullYear(expiry.getFullYear() + 1);
    const expiryStr = `${expiry.getFullYear()}.${String(expiry.getMonth()+1).padStart(2,'0')}.${String(expiry.getDate()).padStart(2,'0')}`;

    // 신규 가입 기본값 설정 — ★ [v101] CARO_CONFIG.DEMO_WALLET=false 면 시연용 크레딧·쿠폰을 주지 않는다
    const DEMO = !(window.CARO_CONFIG && window.CARO_CONFIG.DEMO_WALLET === false);
    STORE.set('credit', DEMO ? 10000 : 0);
    STORE.set('credit_history', DEMO ? [ { date: dateStr, desc: '신규 가입 적립', amount: +10000 } ] : []);
    STORE.set('cards', []);  // 등록 카드 없음
    STORE.set('coupons', DEMO ? [ { id:1, name:'신규 가입 30% 할인', discount:'-30%', expires: expiryStr, status:'available' } ] : []);
    STORE.set('unpaid', []);  // 미결제 없음
    STORE.set('sns', { kakao:false, naver:false, google:false, apple:false });  // SNS 미연결
    STORE.set('plan', 'lite');  // 기본 요금제 LITE (무료)
    STORE.set('notif', { push:true, email:true, sms:false, marketing:false, night:false });
    STORE.set('phone', '010-****-1234');  // 마스킹된 기본 번호

    // 초기화 완료 플래그
    STORE.set(INIT_KEY, true);

    console.log('[CARO] 신규 가입자 데이터 초기화 완료');
  }

  /* ─── 2. 크레딧 화면 - 적립/지급 방식 ─── */
  const originalOpenMpDetail = window.openMpDetail;

  window.openMpDetail = function(title){
    if(title !== '크레딧'){
      if(typeof originalOpenMpDetail === 'function') return originalOpenMpDetail(title);
      return;
    }

    if(typeof goTo === 'function') goTo('account-detail-screen');

    const titleEl = document.getElementById('mpd-title');
    if(titleEl) titleEl.textContent = title;

    const content = document.querySelector('#account-detail-screen .mpd-content');
    if(!content) return;

    const balance = STORE.get('credit', 0);
    const history = STORE.get('credit_history', []);

    // 만료 예정 계산 (적립일로부터 1년 후 - 30일 이내)
    let expiringSoon = 0;
    let earliestExpiry = '-';
    history.forEach(h => {
      if(h.amount > 0 && h.date){
        const earnDate = new Date(h.date.replace(/\./g, '-'));
        const expireDate = new Date(earnDate);
        expireDate.setFullYear(expireDate.getFullYear() + 1);
        const daysUntilExpire = Math.floor((expireDate - new Date()) / (1000 * 60 * 60 * 24));
        if(daysUntilExpire >= 0 && daysUntilExpire <= 90){
          expiringSoon += h.amount;
          if(earliestExpiry === '-'){
            earliestExpiry = `${expireDate.getFullYear()}.${String(expireDate.getMonth()+1).padStart(2,'0')}.${String(expireDate.getDate()).padStart(2,'0')}`;
          }
        }
      }
    });

    let histHtml = '';
    history.forEach(h => {
      const sign = h.amount > 0 ? '+' : '';
      const color = h.amount > 0 ? '#1d7a3a' : '#b23a3a';
      histHtml += `
        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:600;color:var(--text-1);">${h.desc}</div>
            <div style="font-size:.72rem;color:var(--text-m);margin-top:2px;">${h.date}</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:${color};">${sign}${h.amount.toLocaleString()}원</div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="apd-credit-box">
        <div class="apd-credit-label">CARO CREDIT</div>
        <div class="apd-credit-amount">${balance.toLocaleString()}<small>원</small></div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">🎁</span>크레딧 적립 방법</div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">차량 대여 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">대여 결제 금액의 일정 비율 자동 적립</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">5%</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">신규 가입 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">가입 완료 시 자동 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">+10,000원</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">친구 추천 적립</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">추천 코드 사용 시 추천인·피추천인 양쪽 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.96rem;font-weight:700;color:#1d7a3a;">+5,000원</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">이벤트 보너스</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">진행 중인 이벤트 참여 시 차등 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.92rem;font-weight:700;color:#1d7a3a;">변동</div>
        </div>

        <div class="apd-row">
          <div>
            <div style="font-size:.86rem;font-weight:700;color:var(--text-1);">회사 지급</div>
            <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">사과·보상·VIP 혜택 등 회사 정책에 따라 지급</div>
          </div>
          <div style="font-family:'Oswald',sans-serif;font-size:.86rem;font-weight:700;color:#b07d2a;">개별 안내</div>
        </div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">⏰</span>만료 예정 크레딧</div>
        <div class="apd-row">
          <span class="apd-row-label">3개월 이내 만료 예정</span>
          <span class="apd-row-value" style="color:${expiringSoon>0?'#b23a3a':'var(--text-m)'};">${expiringSoon.toLocaleString()}원</span>
        </div>
        <div class="apd-row">
          <span class="apd-row-label">가장 빠른 만료일</span>
          <span class="apd-row-value">${earliestExpiry}</span>
        </div>
      </div>

      <div class="apd-section">
        <div class="apd-section-title"><span class="apd-section-title-icon">📋</span>적립/사용 내역</div>
        ${history.length ? histHtml : '<div class="apd-empty"><div class="apd-empty-icon">📭</div><div class="apd-empty-text">내역이 없습니다</div></div>'}
      </div>

      <div class="apd-info">
        <strong>💡 크레딧 안내</strong><br>
        ▪ 적립된 크레딧은 <strong>1원 = 1크레딧</strong>으로 차량 대여 시 사용 가능<br>
        ▪ 적립일로부터 <strong>1년간 유효</strong>하며 만료 시 자동 소멸<br>
        ▪ 환불·양도·현금화 불가 (서비스 내 사용만 가능)<br>
        ▪ 회원 탈퇴 시 잔여 크레딧은 자동 소멸<br>
        ▪ 부정 적립 행위 적발 시 적립 취소 및 회수 가능<br>
        <span class="apd-legal">근거 — 「전자상거래 등에서의 소비자보호에 관한 법률」 및 자체 약관</span>
      </div>
    `;

    setTimeout(() => { content.scrollTop = 0; }, 10);
  };

  console.log('[CARO] 크레딧 패치 v3 적용 — 신규 가입자 초기화 + 적립 방식');
})();
/* ═══════════════════════════════════════════
   휴대폰 번호 - 가입 시 인증한 실제 번호 동기화
═══════════════════════════════════════════ */
(function(){
  'use strict';

  const STORE = {
    get(key, def){
      try{ const v=localStorage.getItem('caro_apd_'+key); return v?JSON.parse(v):def; }
      catch(e){ return def; }
    },
    set(key, val){
      try{ localStorage.setItem('caro_apd_'+key, JSON.stringify(val)); }
      catch(e){}
    }
  };

  /* 휴대폰 번호 포맷팅 (010-1234-5678) */
  function formatPhone(p){
    if(!p) return '';
    let num = String(p).replace(/[^0-9]/g, '');
    if(num.startsWith('82')) num = '0' + num.slice(2);
    if(num.length === 11) return num.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    if(num.length === 10) return num.replace(/(\d{3})(\d{3,4})(\d{4})/, '$1-$2-$3');
    return p;
  }

  /* 마스킹 (010-****-5678) */
  function maskPhone(p){
    if(!p) return '';
    const formatted = formatPhone(p);
    return formatted.replace(/(\d{3})-(\d{3,4})-(\d{4})/, '$1-****-$3');
  }

  /* 가입 시 인증한 번호 찾기 */
  function findRegisteredPhone(){
    // 1. Firebase Auth 사용자 metadata
    try{
      if(typeof firebase !== 'undefined' && firebase.auth){
        const u = firebase.auth().currentUser;
        if(u && u.phoneNumber) return formatPhone(u.phoneNumber);
      }
    }catch(e){}

    // 2. 다양한 localStorage 키 검색
    const userKeys = ['caro_user', 'caro_userinfo', 'caro_signup', 'caro_profile', 'user', 'currentUser', 'userInfo', 'profile'];
    for(const k of userKeys){
      try{
        const raw = localStorage.getItem(k);
        if(!raw) continue;
        const obj = JSON.parse(raw);
        const p = obj.phone || obj.phoneNumber || obj.mobile || obj.tel || obj.cell;
        if(p) return formatPhone(p);
      }catch(e){}
    }

    // 3. window 전역 변수
    try{
      const candidates = [window.currentUser, window.user, window.caroUser, window.userInfo];
      for(const c of candidates){
        if(!c) continue;
        const p = c.phone || c.phoneNumber || c.mobile;
        if(p) return formatPhone(p);
      }
    }catch(e){}

    // 4. 회원가입 폼에 입력된 값
    try{
      const phoneInput = document.getElementById('su-phone');
      if(phoneInput && phoneInput.value){
        return formatPhone(phoneInput.value);
      }
    }catch(e){}

    return null;
  }

  /* 번호 동기화 */
  function syncPhone(){
    const found = findRegisteredPhone();
    if(found){
      const masked = maskPhone(found);
      STORE.set('phone', masked);
      STORE.set('phone_full', found);  // 원본도 저장
      console.log('[CARO] 가입 휴대폰 번호 동기화:', masked);
    }
  }

  /* 즉시 + 지연 실행 (Firebase 로드 후) */
  syncPhone();
  setTimeout(syncPhone, 500);
  setTimeout(syncPhone, 2000);

  /* Firebase 인증 상태 변경 시 재동기화 */
  try{
    if(typeof firebase !== 'undefined' && firebase.auth){
      firebase.auth().onAuthStateChanged(() => {
        setTimeout(syncPhone, 300);
      });
    }
  }catch(e){}

  /* 회원가입 완료 시 번호 자동 저장 */
  if(typeof window.handleSignup === 'function'){
    const originalSignup = window.handleSignup;
    window.handleSignup = function(){
      try{
        const phoneInput = document.getElementById('su-phone');
        if(phoneInput && phoneInput.value){
          const formatted = formatPhone(phoneInput.value);
          STORE.set('phone', maskPhone(formatted));
          STORE.set('phone_full', formatted);
        }
      }catch(e){}
      return originalSignup.apply(this, arguments);
    };
  }

  /* 기본값 '010-****-1234' 제거 */
  const currentStored = STORE.get('phone', '');
  if(currentStored === '010-****-1234'){
    localStorage.removeItem('caro_apd_phone');
    syncPhone(); // 다시 시도
  }

  console.log('[CARO] 휴대폰 번호 동기화 패치 v1 적용');
})();

/* ═══════════════════════════════════════════
   카드 동기화 강화 패치 v2
   결제 화면을 직접 오버라이드해서 APD 카드 사용
═══════════════════════════════════════════ */
(function(){
  'use strict';

  const APD_KEY = 'caro_apd_cards';

  function getCards(){
    try{
      const raw = localStorage.getItem(APD_KEY);
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }

  function setCards(cards){
    try{
      localStorage.setItem(APD_KEY, JSON.stringify(cards));
    }catch(e){}
  }

  /* ─── 1. 결제 수단 선택 시트 렌더링 (openPaySheet) ─── */
  function renderPaySheetCards(){
    const list = document.getElementById('pay-sheet-list');
    if(!list) return;

    const cards = getCards();
    if(cards.length === 0){
      list.innerHTML = `
        <div style="padding:30px 0;text-align:center;color:var(--text-m);font-size:.86rem;">
          등록된 카드가 없습니다
        </div>`;
      return;
    }

    list.innerHTML = cards.map(c => `
      <label style="display:flex;align-items:center;gap:12px;padding:14px 0;border-bottom:1px solid var(--border);cursor:pointer;">
        <input type="radio" name="pay-card" value="${c.id}" ${c.isDefault?'checked':''} style="width:18px;height:18px;accent-color:#c8a96e;">
        <div style="width:40px;height:26px;border-radius:4px;background:linear-gradient(135deg,#3a3f47,#2e3138);display:flex;align-items:center;justify-content:center;font-size:.66rem;font-weight:700;color:#c8a96e;flex-shrink:0;">${(c.bank||c.brand||'CARD')}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Oswald',sans-serif;font-size:.88rem;color:var(--text-1);letter-spacing:.04em;">**** ${c.last4}</div>
          <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">${(c.alias||('카드 ****'+(c.last4||'')))}</div>
        </div>
      </label>
    `).join('');
  }

  /* openPaySheet 후킹 */
  const origOpenPaySheet = window.openPaySheet;
  window.openPaySheet = function(){
    if(typeof origOpenPaySheet === 'function'){
      try{ origOpenPaySheet.apply(this, arguments); }catch(e){}
    } else {
      const overlay = document.getElementById('pay-sheet-overlay');
      if(overlay) overlay.classList.add('show');
    }
    setTimeout(renderPaySheetCards, 30);
    setTimeout(renderPaySheetCards, 200);
  };

  /* confirmPaySheet 후킹 - 선택한 카드 표시 */
  const origConfirmPaySheet = window.confirmPaySheet;
  window.confirmPaySheet = function(){
    const selected = document.querySelector('input[name="pay-card"]:checked');

    if(selected){
      const cards = getCards();
      const card = cards.find(c => String(c.id) === String(selected.value));
      if(card){
        const label = document.getElementById('pay-selected-label');
        if(label){
          label.textContent = `**** ${card.last4} (${card.alias})`;
          label.style.color = 'var(--text-1)';
        }
      }
    }

    // 오버레이 닫기
    const overlay = document.getElementById('pay-sheet-overlay');
    if(overlay) overlay.classList.remove('show');

    if(typeof origConfirmPaySheet === 'function'){
      try{ origConfirmPaySheet.apply(this, arguments); }catch(e){}
    }
  };

  /* ─── 2. 결제 정보 화면 (pi-card-list) ─── */
  function renderPICardList(){
    const list = document.getElementById('pi-card-list');
    if(!list) return;

    const cards = getCards();
    if(cards.length === 0){
      list.innerHTML = `
        <div style="padding:20px;text-align:center;color:var(--text-m);font-size:.86rem;background:rgba(255,255,255,.6);border:1px dashed var(--border);border-radius:var(--r);">
          등록된 카드가 없습니다.<br>
          <span style="font-size:.74rem;">아래 폼에서 카드를 추가해주세요</span>
        </div>`;
      return;
    }

    list.innerHTML = cards.map(c => `
      <div style="display:flex;align-items:center;gap:12px;padding:14px;background:rgba(255,255,255,.7);border:1.5px solid ${c.isDefault?'#c8a96e':'var(--border)'};border-radius:var(--r);margin-bottom:8px;">
        <div style="width:40px;height:26px;border-radius:4px;background:linear-gradient(135deg,#3a3f47,#2e3138);display:flex;align-items:center;justify-content:center;font-size:.66rem;font-weight:700;color:#c8a96e;flex-shrink:0;">${(c.bank||c.brand||'CARD')}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:'Oswald',sans-serif;font-size:.88rem;color:var(--text-1);letter-spacing:.04em;">
            **** ${c.last4}
            ${c.isDefault?'<span style="font-family:Oswald,sans-serif;font-size:.6rem;letter-spacing:.1em;color:#c8a96e;font-weight:700;background:rgba(200,169,110,.12);padding:3px 8px;border-radius:4px;margin-left:6px;">DEFAULT</span>':''}
          </div>
          <div style="font-size:.74rem;color:var(--text-m);margin-top:2px;">${(c.alias||('카드 ****'+(c.last4||'')))}</div>
        </div>
        <button onclick="caroSyncDeleteCard(${c.id})" style="padding:6px 12px;background:rgba(178,58,58,.08);border:1px solid rgba(178,58,58,.25);border-radius:6px;color:#b23a3a;font-family:var(--font);font-size:.74rem;font-weight:700;cursor:pointer;">삭제</button>
      </div>
    `).join('');
  }

  /* 카드 삭제 (전역 함수) */
  window.caroSyncDeleteCard = function(id){
    if(!confirm('이 카드를 삭제하시겠습니까?')) return;
    let cards = getCards();
    cards = cards.filter(c => String(c.id) !== String(id));

    // 기본 카드가 삭제됐다면 첫 번째를 기본으로
    if(cards.length > 0 && !cards.some(c => c.isDefault)){
      cards[0].isDefault = true;
    }

    setCards(cards);
    renderPICardList();

    if(typeof showToast === 'function') showToast('카드가 삭제되었습니다');
  };

  /* ─── 3. saveCardFromPI 오버라이드 - APD에 저장 ─── */
  const origSaveCardFromPI = window.saveCardFromPI;
  window.saveCardFromPI = function(){
    const numInput = document.getElementById('pi-card-num');
    const expInput = document.getElementById('pi-card-exp');
    const cvcInput = document.getElementById('pi-card-cvc');
    const aliasInput = document.getElementById('pi-card-alias');

    if(!numInput) {
      if(typeof origSaveCardFromPI === 'function') return origSaveCardFromPI.apply(this, arguments);
      return;
    }

    const num = numInput.value.replace(/\s/g, '');
    if(!caroCardOk(num)){
      alert('카드 번호를 확인해주세요 (일반 16자리 / AMEX 15자리)');
      return;
    }
    if(!expInput.value || expInput.value.length < 5){
      alert('유효기간을 입력해주세요 (MM/YY)');
      return;
    }
    if(!cvcInput.value || cvcInput.value.length<3 || cvcInput.value.length>4){
      alert('CVC 3~4자리를 입력해주세요 (AMEX는 4자리)');
      return;
    }

    const cards = getCards();
    const last4 = num.slice(-4);

    if(cards.some(c => c.last4 === last4)){
      alert('이미 등록된 카드입니다');
      return;
    }

    cards.push({
      id: Date.now(),
      bank: '카드',
      last4: last4,
      alias: (aliasInput && aliasInput.value) || `카드 ****${last4}`,
      isDefault: cards.length === 0
    });
    setCards(cards);

    // 폼 초기화
    numInput.value = '';
    expInput.value = '';
    cvcInput.value = '';
    if(aliasInput) aliasInput.value = '';

    renderPICardList();

    if(typeof showToast === 'function') showToast('카드가 등록되었습니다');
    else alert('카드가 등록되었습니다');
  };

  /* ─── 4. 페이지 전환 시 자동 갱신 ─── */
  const origGoTo = window.goTo;
  if(typeof origGoTo === 'function'){
    window.goTo = function(screen){
      const result = origGoTo.apply(this, arguments);
      if(screen === 'payment-info-screen'){
        setTimeout(renderPICardList, 50);
        setTimeout(renderPICardList, 300);
      }
      if(screen === 'payment-screen' || screen === 'reservation-screen'){
        setTimeout(renderPaySheetCards, 50);
      }
      return result;
    };
  }

  /* 초기 렌더링 */
  setTimeout(() => {
    renderPICardList();
    renderPaySheetCards();
  }, 1000);

  console.log('[CARO] 카드 동기화 v2 — 결제화면 직접 렌더링 모드');
})();

/* ═══════════════════════════════════════════
   카드 + 면허증 Firestore 영구 저장 패치
   ※ 로그아웃/재접속 시에도 데이터 유지
═══════════════════════════════════════════ */
(function(){
  'use strict';

  /* Firestore + Auth 객체 가져오기 */
  function getDb(){
    try{
      if(window.FB_DB) return window.FB_DB;
      if(typeof firebase !== 'undefined' && firebase.firestore) return firebase.firestore();
      if(window.db) return window.db;
    }catch(e){}
    return null;
  }

  function getAuth(){
    try{
      if(window.FB_AUTH) return window.FB_AUTH;
      if(typeof firebase !== 'undefined' && firebase.auth) return firebase.auth();
    }catch(e){}
    return null;
  }

  function getCurrentUid(){
    try{
      const auth = getAuth();
      if(auth && auth.currentUser) return auth.currentUser.uid;
    }catch(e){}
    return null;
  }

  /* ─── 1. 카드를 Firestore에 저장 ─── */
  async function saveCardsToFirestore(cards){
    const db = getDb();
    const uid = getCurrentUid();
    if(!db || !uid){
      console.log('[CARO] Firestore 또는 사용자 없음 - 로컬 저장만');
      return false;
    }

    try{
      // Firestore v9 modular vs v8 compat
      if(window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc){
        await window.FB_FN.setDoc(
          window.FB_FN.doc(db, 'users', uid),
          {
            cards: cards,
            cardsUpdatedAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else {
        await db.collection('users').doc(uid).set({
          cards: cards,
          cardsUpdatedAt: new Date().toISOString()
        }, { merge: true });
      }
      console.log('[CARO] ✅ 카드 Firestore 저장 완료:', cards.length, '개');
      return true;
    }catch(e){
      console.error('[CARO] ❌ 카드 Firestore 저장 실패:', e.message);
      return false;
    }
  }

  /* ─── 2. Firestore에서 카드 불러오기 ─── */
  async function loadCardsFromFirestore(){
    const db = getDb();
    const uid = getCurrentUid();
    if(!db || !uid) return null;

    try{
      let docSnap;
      if(window.FB_FN && window.FB_FN.getDoc && window.FB_FN.doc){
        docSnap = await window.FB_FN.getDoc(window.FB_FN.doc(db, 'users', uid));
      } else {
        docSnap = await db.collection('users').doc(uid).get();
      }

      const exists = docSnap.exists ? (typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists) : false;
      if(!exists) return null;

      const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap.data;
      /* ★ [v101] cards 가 비어 있어도(옛 로그아웃 버그로 []가 써진 경우) savedCards 에 남아 있으면 그것으로 복원 */
      let srvCards = null;
      if(Array.isArray(data.cards) && data.cards.length) srvCards = data.cards;
      else if(Array.isArray(data.savedCards) && data.savedCards.length) srvCards = data.savedCards;
      else if(Array.isArray(data.cards)) srvCards = data.cards;
      if(Array.isArray(srvCards)){
        data.cards = srvCards;
        localStorage.setItem('caro_apd_cards', JSON.stringify(data.cards));
        try{ if(Array.isArray(window.savedCards)) window.savedCards = data.cards.slice(); }catch(e){}
        console.log('[CARO] ✅ 카드 Firestore 불러오기:', data.cards.length, '개');

        // UI 갱신
        if(typeof renderPICardList === 'function') renderPICardList();
        if(typeof renderPaySheetCards === 'function') renderPaySheetCards();

        return data.cards;
      }
    }catch(e){
      console.error('[CARO] ❌ 카드 Firestore 불러오기 실패:', e.message);
    }
    return null;
  }

  /* ─── 3. 면허증 정보 저장 ─── */
  async function saveLicenseToFirestore(licenseData){
    const db = getDb();
    const uid = getCurrentUid();
    if(!db || !uid) return false;
    /* ★ [v101] 표준형만 저장 (번호 없는 객체는 저장하지 않음) */
    licenseData = window.caroNormLicense ? caroNormLicense(licenseData, {name: window.userInfo && userInfo.name, birth: window.userInfo && userInfo.birth}) : licenseData;
    if(!licenseData || !licenseData.number) return false;

    try{
      if(window.FB_FN && window.FB_FN.setDoc && window.FB_FN.doc){
        await window.FB_FN.setDoc(
          window.FB_FN.doc(db, 'users', uid),
          {
            license: licenseData,
            licenseText: licenseData.number,
            licenseRegisteredAt: new Date().toISOString()
          },
          { merge: true }
        );
      } else {
        await db.collection('users').doc(uid).set({
          license: licenseData,
          licenseText: licenseData.number,
          licenseRegisteredAt: new Date().toISOString()
        }, { merge: true });
      }

      // 로컬에도 저장 (표준형)
      if(window.caroApplyLicenseLocal) caroApplyLicenseLocal(licenseData);
      console.log('[CARO] ✅ 면허증 정보 저장 완료');
      return true;
    }catch(e){
      console.error('[CARO] ❌ 면허증 저장 실패:', e.message);
      return false;
    }
  }

  /* ─── 4. 면허증 정보 불러오기 ─── */
  async function loadLicenseFromFirestore(){
    const db = getDb();
    const uid = getCurrentUid();
    if(!db || !uid) return null;

    try{
      let docSnap;
      if(window.FB_FN && window.FB_FN.getDoc && window.FB_FN.doc){
        docSnap = await window.FB_FN.getDoc(window.FB_FN.doc(db, 'users', uid));
      } else {
        docSnap = await db.collection('users').doc(uid).get();
      }

      const exists = docSnap.exists ? (typeof docSnap.exists === 'function' ? docSnap.exists() : docSnap.exists) : false;
      if(!exists) return null;

      const data = typeof docSnap.data === 'function' ? docSnap.data() : docSnap.data;
      /* ★ [v101] 서버값을 표준형으로만 로컬 반영 (문자열/빈 객체/마스킹 값이 그대로 저장되던 문제) */
      const lic = (window.caroNormLicense && (caroNormLicense(data.license,{name:data.name,birth:data.birth}) || caroNormLicense(data.licenseText,{name:data.name,birth:data.birth}))) || null;
      if(window.caroApplyLicenseLocal) caroApplyLicenseLocal(lic);
      if(lic){
        console.log('[CARO] ✅ 면허증 정보 불러오기 완료');
        return lic;
      }
    }catch(e){
      console.error('[CARO] ❌ 면허증 불러오기 실패:', e.message);
    }
    return null;
  }

  /* ─── 5. 카드 변경 감지 → Firestore 자동 동기화 ───
     ★ [v101] ① 로그인 직후 서버 카드를 먼저 내려받은 뒤(cardsSynced) 그 이후의 '이 기기 변경'만 올린다.
                (예전엔 앱을 켤 때마다 이 폰의 옛 카드 목록을 서버에 덮어써 다른 기기에서 지운 카드가 되살아났다)
              ② 로그아웃 중이거나 로그인 표시가 없으면 절대 쓰지 않는다 (로그아웃 시 '카드 0개'가 서버에 써지던 문제) */
  let lastCardsJson = '';
  let cardsSynced = false;
  setInterval(() => {
    try{
      if(!cardsSynced || window.__caroLoggingOut) return;
      if(localStorage.getItem('caro_auto_login') !== '1') return;
      if(!getCurrentUid()) return;
      const current = localStorage.getItem('caro_apd_cards') || '[]';
      if(current !== lastCardsJson && current !== '[]'){
        lastCardsJson = current;
        const cards = JSON.parse(current);
        saveCardsToFirestore(cards);
      } else if(current === '[]' && lastCardsJson !== '' && lastCardsJson !== '[]'){
        // 카드가 모두 삭제된 경우
        lastCardsJson = current;
        saveCardsToFirestore([]);
      }
    }catch(e){}
  }, 2000);

  /* ─── 6. 로그인 시 자동 데이터 불러오기 ───
     ★ [v101] caroOnAuth 사용 — 예전엔 이 코드가 Firebase 로드 '전'에 실행돼 리스너가 아예 등록되지 않았고,
              1.5초 뒤 한 번만 시도해서 그 안에 로그인 복원이 안 되면 카드·면허가 복원되지 않았다. */
  function setupAuthListener(){
    const sub = () => window.caroOnAuth(async (user) => {
      if(user){
        console.log('[CARO] 사용자 로그인 감지 - 데이터 불러오기 시작');
        cardsSynced = false;
        try{ await loadCardsFromFirestore(); }catch(e){}
        try{ await loadLicenseFromFirestore(); }catch(e){}
        try{ lastCardsJson = localStorage.getItem('caro_apd_cards') || '[]'; }catch(e){ lastCardsJson=''; }
        cardsSynced = true;
      } else {
        console.log('[CARO] 로그아웃 감지');
        lastCardsJson = ''; // 동기화 리셋
        cardsSynced = false;
      }
    });
    if(window.caroOnAuth) sub();
    else { let n=0; const iv=setInterval(() => { n++; if(window.caroOnAuth){ clearInterval(iv); sub(); } if(n>240) clearInterval(iv); }, 250); }
  }

  /* ─── 7. handleSignup 후킹 — ★ [v101] 제거.
     가입 폼에는 su-license-num 이 없어(su-license 뿐) 이 후킹이 항상 {number:''} 빈 면허 객체를 서버에 덮어쓰고
     '등록 완료' 표시만 켜던 원인이었다. 면허는 이제 handleSignup 이 users.license 표준형으로 직접 저장한다. */
  function setupSignupHook(){ /* no-op */ }

  /* ─── 8. 면허증 이미 등록됨 확인 함수 (전역) ─── */
  window.caroIsLicenseRegistered = function(){
    return localStorage.getItem('caro_license_registered') === 'true';
  };

  window.caroGetLicense = function(){
    try{
      return JSON.parse(localStorage.getItem('caro_license') || 'null');
    }catch(e){
      return null;
    }
  };

  /* ─── 9. 초기 실행 ─── */
  setupAuthListener();
  setupSignupHook();

  console.log('[CARO] 카드 + 면허증 영구 저장 패치 v1 적용');
})();

/* ═══════════════════════════════════════════
   등록 카드 결제 시 토스 건너뛰기 v2
   ※ 차량 정보 + 이미지 등 전체 데이터 보존
═══════════════════════════════════════════ */
(function(){
  'use strict';

  /* 선택한 카드 ID 추적 */
  window._caroSelectedCardId = null;

  const origConfirmPaySheet = window.confirmPaySheet;
  window.confirmPaySheet = function(){
    const selected = document.querySelector('input[name="pay-card"]:checked');
    if(selected){
      window._caroSelectedCardId = selected.value;
      console.log('[CARO] 선택한 카드:', window._caroSelectedCardId);
    }
    if(typeof origConfirmPaySheet === 'function'){
      return origConfirmPaySheet.apply(this, arguments);
    }
  };

  /* handlePayment 후킹 */
  const origHandlePayment = window.handlePayment;
  window.handlePayment = function(){
    let cards = [];
    try{
      cards = JSON.parse(localStorage.getItem('caro_apd_cards') || '[]');
    }catch(e){ cards = []; }

    const label = document.getElementById('pay-selected-label');
    const labelText = label ? label.textContent : '';
    const hasCardSelected = labelText.includes('****');

    // 카드 없거나 미선택 시 원본 함수 (토스) 호출
    if(cards.length === 0 || !hasCardSelected){
      if(typeof origHandlePayment === 'function'){
        return origHandlePayment.apply(this, arguments);
      }
      return;
    }

    // 카드 선택됨 → 토스 건너뛰기
    console.log('[CARO] ✅ 등록 카드 결제 (토스 건너뛰기)');

    const pd = window._payData || {};
    const car = pd.car || window.selectedCar;
    const ins = pd.ins || window.selectedIns || (window.INSURANCE && window.INSURANCE[0]);
    const total = pd.total || 0;
    const startDt = pd.start instanceof Date ? pd.start : (pd.start ? new Date(pd.start) : null);
    const endDt = pd.end instanceof Date ? pd.end : (pd.end ? new Date(pd.end) : null);

    if(!car || !startDt || !endDt || isNaN(startDt) || isNaN(endDt)){
      if(typeof showToast === 'function') showToast('예약 정보가 올바르지 않습니다.');
      return;
    }

    const selectedCard = cards.find(c => String(c.id) === String(window._caroSelectedCardId))
                       || cards.find(c => c.isDefault)
                       || cards[0];

    const bookNo = 'CR' + Date.now().toString().slice(-8);

    // 🔑 차량 전체 객체를 그대로 저장 (이미지, 연료, 번호판 등 모두 보존)
    try{
      localStorage.setItem('caro_pay_uid', (window.userInfo && window.userInfo.id) || '');
      localStorage.setItem('caro_pay_data', JSON.stringify({
        car: car,                    // ← 전체 car 객체!
        ins: ins,
        hrs: pd.hrs || 0,
        total: total,
        start: startDt.toISOString(),
        end: endDt.toISOString(),
        card: {
          bank: selectedCard.bank,
          last4: selectedCard.last4,
          alias: selectedCard.alias
        },
        paymentMethod: '등록된 카드',
        bookNo: bookNo
      }));
    }catch(e){}

    if(typeof showToast === 'function'){
      showToast(`✅ ${selectedCard.bank} 카드로 결제 완료!`);
    }

    // 결제 성공 페이지로 이동
    const successUrl = window.location.href.split('?')[0] + '?payment=success&bookNo=' + bookNo;
    setTimeout(() => {
      window.location.href = successUrl;
    }, 500);
  };

  console.log('[CARO] 토스 건너뛰기 패치 v2 — 차량 정보 전체 보존');
})();
/* ═══════════════════════════════════════════
   계정관리 - 약관 및 정책 6종 내용 (data-terms 매칭)
   ※ 2025-2026 현행 법령 기준
═══════════════════════════════════════════ */
(function(){
  'use strict';

  const TERMS_CONTENT = {

    /* ─── 1. 서비스 이용약관 ─── */
    service: {
      title: 'CARO MOBILITY 서비스 이용약관',
      body: `
        <h4>제1조 (목적)</h4>
        <p>본 약관은 카로 모빌리티(이하 "회사")가 제공하는 차량 대여 서비스(이하 "서비스") 이용에 관한 회사와 회원 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.</p>

        <h4>제2조 (용어의 정의)</h4>
        <ul>
          <li>"서비스": 회사가 운영하는 모바일 앱 및 웹사이트를 통해 제공되는 차량 대여 및 부가서비스</li>
          <li>"회원": 본 약관에 동의하고 회사와 이용계약을 체결한 자</li>
          <li>"차량": 회사가 보유하고 회원에게 대여하는 자동차</li>
          <li>"대여 기간": 회원이 차량을 인수한 시점부터 반납한 시점까지</li>
        </ul>

        <h4>제3조 (약관의 효력 및 변경)</h4>
        <p>본 약관은 회원이 동의하고 가입을 완료한 시점부터 효력이 발생합니다. 회사는 관련 법령을 위배하지 않는 범위에서 약관을 개정할 수 있으며, 개정 시 최소 7일 전(회원에게 불리한 경우 30일 전)에 사전 공지합니다.</p>

        <h4>제4조 (회원가입 및 자격)</h4>
        <ul>
          <li>만 21세 이상이며 유효한 운전면허 보유자</li>
          <li>외국인의 경우 한국에서 유효한 운전면허 보유자</li>
          <li>면허정지·취소 처분 중이 아닌 자</li>
        </ul>

        <h4>제5조 (회원의 의무)</h4>
        <ul>
          <li>도로교통법 등 관계 법령 준수</li>
          <li>음주·약물 복용 운전 금지</li>
          <li>차량을 선량한 관리자의 주의로 사용</li>
        </ul>

        <h4>제6조 (서비스 이용 제한 및 계약 해지)</h4>
        <p>회사는 회원이 본 약관을 위반한 경우 사전 통지 후 서비스 이용을 제한하거나 계약을 해지할 수 있습니다. 중대한 위반 시 즉시 해지 가능합니다.</p>

        <h4>제7조 (손해배상)</h4>
        <p>회원이 본 약관 또는 법령을 위반하여 회사에 손해를 끼친 경우 그 손해를 배상해야 합니다. 단, 천재지변 등 불가항력에 의한 손해는 제외됩니다.</p>

        <h4>제8조 (분쟁 해결)</h4>
        <p>본 약관에 관한 분쟁은 대한민국 법령을 준거법으로 하며, 「민사소송법」에 따른 관할법원에서 처리합니다.</p>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 약관은 2026년 5월 31일부터 시행합니다.</p>
      `
    },

    /* ─── 2. 개인정보 처리방침 ─── */
    privacy: {
      title: '개인정보 처리방침',
      body: `
        <p>CARO MOBILITY(이하 "회사")는 「개인정보 보호법」(법률 제20897호, 2025.10.2 시행)을 준수하며, 회원의 개인정보를 보호하기 위해 본 처리방침을 수립·공개합니다.</p>

        <h4>제1조 (수집 항목)</h4>
        <ul>
          <li><strong>회원가입 시:</strong> 성명, 생년월일, 휴대전화번호, 이메일, 운전면허 정보</li>
          <li><strong>서비스 이용 시:</strong> 차량 이용 기록, 결제정보, 위치정보, 사고/위반 정보</li>
        </ul>

        <h4>제2조 (처리 목적)</h4>
        <ul>
          <li>회원 본인확인 및 부정 이용 방지</li>
          <li>차량 대여 서비스 제공 및 결제 처리</li>
          <li>사고 대응 및 분쟁 처리</li>
          <li>마케팅 정보 제공 (별도 동의 시)</li>
        </ul>

        <h4>제3조 (보유 및 이용 기간)</h4>
        <ul>
          <li>회원 탈퇴 시까지 보관 후 즉시 파기</li>
          <li>계약·청약철회 기록: 5년 (전자상거래법)</li>
          <li>대금결제 기록: 5년 (전자상거래법)</li>
          <li>표시·광고 기록: 6개월 (전자상거래법)</li>
          <li>위치정보 기록: 6개월 (위치정보법)</li>
        </ul>

        <h4>제4조 (정보주체의 권리)</h4>
        <ul>
          <li>개인정보 열람·정정·삭제·처리정지 요구권</li>
          <li>자동화된 결정에 대한 거부·설명 요구권 (개인정보보호법 제37조의2)</li>
          <li>개인정보 전송 요구권 (개인정보보호법 제35조의2, 2025.10.2 시행)</li>
          <li>동의 철회 및 회원 탈퇴 권리</li>
        </ul>

        <h4>제5조 (안전성 확보 조치)</h4>
        <ul>
          <li>관리적 조치: 개인정보보호책임자 지정, 임직원 교육</li>
          <li>기술적 조치: 접근권한 관리, 암호화, 보안 솔루션</li>
          <li>물리적 조치: 전산실 출입 통제</li>
        </ul>

        <h4>제6조 (개인정보 보호책임자)</h4>
        <ul>
          <li>책임자: CARO MOBILITY 개인정보보호책임자</li>
          <li>연락처: privacy@caromobility.kr / 1588-0000</li>
        </ul>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 방침은 2026년 5월 31일부터 시행합니다.</p>
      `
    },

    /* ─── 3. 위치정보 이용약관 ─── */
    location: {
      title: '위치정보 이용약관',
      body: `
        <p>CARO MOBILITY(이하 "회사")는 「위치정보의 보호 및 이용 등에 관한 법률」(2025.10.1 시행, 이하 "위치정보법")에 따라 본 약관을 마련합니다.</p>

        <h4>제1조 (목적)</h4>
        <p>본 약관은 회사가 제공하는 위치기반서비스 이용에 관한 회사와 개인위치정보주체 간의 권리·의무를 규정함을 목적으로 합니다.</p>

        <h4>제2조 (서비스 내용)</h4>
        <ul>
          <li>가까운 차량 위치 안내</li>
          <li>차량 운행 중 위치 확인 및 경로 안내</li>
          <li>분실·도난 차량의 위치 추적</li>
          <li>사고 발생 시 긴급 위치 전송</li>
        </ul>

        <h4>제3조 (수집하는 위치정보)</h4>
        <ul>
          <li>회원 단말기의 GPS 좌표</li>
          <li>와이파이·기지국 기반 위치</li>
          <li>대여 차량의 GPS 좌표 (대여 기간 중)</li>
        </ul>

        <h4>제4조 (위치정보의 이용 및 제공)</h4>
        <ul>
          <li>회사는 위치정보를 서비스 제공 목적으로만 이용</li>
          <li>회원의 사전 동의 없이 제3자 제공 금지</li>
          <li>예외: 응급상황 시 동의한 경우, 법령에 의한 수사기관 요청</li>
        </ul>

        <h4>제5조 (보유 기간)</h4>
        <p>위치정보법 제16조에 따라 위치정보 수집·이용·제공사실 확인자료를 <strong>6개월간 보관</strong> 후 파기합니다.</p>

        <h4>제6조 (개인위치정보주체의 권리)</h4>
        <ul>
          <li>동의의 일부 또는 전부 철회권</li>
          <li>일시적 중지 요구권</li>
          <li>열람·고지·정정 요구권</li>
        </ul>

        <h4>제7조 (8세 이하 아동 등의 보호)</h4>
        <p>8세 이하 아동·피성년후견인·심신장애인은 보호의무자가 위치정보 수집에 동의할 수 있습니다(위치정보법 제26조).</p>

        <h4>제8조 (위치정보 관리책임자)</h4>
        <ul>
          <li>책임자: CARO MOBILITY 위치정보 관리책임자</li>
          <li>연락처: location@caromobility.kr / 1588-0000</li>
        </ul>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 약관은 2026년 5월 31일부터 시행합니다.</p>
      `
    },

    /* ─── 4. 제3자 정보제공 동의 ─── */
    third: {
      title: '제3자 정보제공 동의',
      body: `
        <p>CARO MOBILITY(이하 "회사")는 「개인정보 보호법」 제17조에 따라 회원의 개인정보를 제3자에게 제공할 경우 사전 동의를 받습니다.</p>

        <h4>제1조 (제3자 제공 대상 및 목적)</h4>
        <p>회사는 다음과 같이 회원의 개인정보를 제3자에게 제공할 수 있습니다.</p>

        <h4>제2조 (제공받는 자 및 제공 항목)</h4>
        <ul>
          <li><strong>토스페이먼츠 / KG이니시스 등 PG사</strong>
            <br>· 제공 항목: 결제정보, 카드 일부 정보
            <br>· 제공 목적: 결제 처리, 환불 처리
            <br>· 보유 기간: 결제 완료 후 5년 (전자상거래법)
          </li>
          <li><strong>삼성화재 / DB손해보험 등 보험사</strong>
            <br>· 제공 항목: 성명, 연락처, 운전면허정보, 차량정보
            <br>· 제공 목적: 차량 보험 가입 및 사고 처리
            <br>· 보유 기간: 보험 계약 종료 후 3년
          </li>
          <li><strong>한국도로공사 / 도로교통공단</strong>
            <br>· 제공 항목: 차량번호, 운전자 정보
            <br>· 제공 목적: 통행료 후불 정산, 교통법규 위반 처리
            <br>· 보유 기간: 처리 완료 후 즉시 파기
          </li>
          <li><strong>긴급구조기관 (소방청·경찰청)</strong>
            <br>· 제공 항목: 위치정보, 연락처
            <br>· 제공 목적: 사고·재난 시 긴급구조
            <br>· 보유 기간: 긴급상황 종료 후 6개월
          </li>
        </ul>

        <h4>제3조 (동의 거부 권리 및 불이익)</h4>
        <p>회원은 제3자 정보제공 동의를 거부할 권리가 있습니다. 다만 필수 제공 항목(결제·보험사)에 대한 동의 거부 시 서비스 이용이 제한될 수 있습니다.</p>

        <h4>제4조 (동의 철회)</h4>
        <ul>
          <li>회원은 언제든지 제3자 제공 동의를 철회할 수 있습니다.</li>
          <li>철회 방법: 고객센터(1588-0000) 또는 privacy@caromobility.kr</li>
          <li>철회 시 즉시 처리하며, 이미 제공된 정보는 제공처에 파기 요청</li>
        </ul>

        <h4>제5조 (제3자 국외 이전)</h4>
        <p>회사는 회원의 개인정보를 국외로 이전하지 않습니다. 향후 국외 이전이 필요한 경우 사전에 별도 동의를 받습니다(개인정보보호법 제28조의8).</p>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 동의는 2026년 5월 31일부터 시행합니다.</p>
      `
    },

    /* ─── 5. 마케팅 정보 수신 동의 ─── */
    marketing: {
      title: '마케팅 정보 수신 동의',
      body: `
        <p>CARO MOBILITY는 「정보통신망 이용촉진 및 정보보호 등에 관한 법률」(이하 "정보통신망법") 제50조에 따라 회원의 마케팅 정보 수신 동의를 받습니다.</p>

        <h4>제1조 (수신 동의 항목)</h4>
        <ul>
          <li>신규 차량 및 상품 안내</li>
          <li>이벤트·프로모션·할인 정보</li>
          <li>쿠폰·크레딧 적립 안내</li>
          <li>설문조사 및 회사 마케팅 활동</li>
        </ul>

        <h4>제2조 (수신 채널)</h4>
        <ul>
          <li>앱 푸시 알림</li>
          <li>이메일</li>
          <li>SMS / LMS / MMS</li>
          <li>카카오톡 알림톡</li>
        </ul>

        <h4>제3조 (야간 수신 동의 - 별도)</h4>
        <p>정보통신망법 제50조 제3항에 따라 <strong>오후 9시부터 오전 8시까지</strong>의 광고성 정보 전송은 별도 사전 동의가 필요합니다. 동의하지 않아도 일반 시간대(08시~21시)의 마케팅 정보는 받을 수 있습니다.</p>

        <h4>제4조 (수신 동의 철회)</h4>
        <ul>
          <li>회원은 언제든지 수신 동의를 철회할 수 있습니다.</li>
          <li>철회 방법: 「계정관리 → 혜택 & 이벤트」 토글 비활성화</li>
          <li>또는 수신 메시지의 수신거부 절차 이용</li>
          <li>회사는 철회 요청을 지체 없이 처리</li>
        </ul>

        <h4>제5조 (수신 동의 거부에 따른 안내)</h4>
        <p>마케팅 수신 동의를 거부하셔도 서비스 이용에는 제한이 없습니다. 다만 이벤트·할인 등의 혜택 정보를 받아보실 수 없습니다.</p>

        <h4>제6조 (위반 시 처벌)</h4>
        <p>정보통신망법 제74조에 따라 회사가 회원의 동의 없이 광고성 정보를 전송한 경우 3천만 원 이하의 과태료가 부과됩니다.</p>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 동의는 2026년 5월 31일부터 시행합니다.</p>
      `
    },

    /* ─── 6. 청소년 보호정책 ─── */
    youth: {
      title: '청소년 보호정책',
      body: `
        <p>CARO MOBILITY(이하 "회사")는 「청소년 보호법」, 「정보통신망법」 등 관련 법령에 따라 청소년을 유해정보로부터 보호하기 위해 본 정책을 수립합니다.</p>

        <h4>제1조 (목적)</h4>
        <p>본 정책은 만 19세 미만 청소년의 건전한 성장을 도모하고 유해환경으로부터 보호하기 위함을 목적으로 합니다.</p>

        <h4>제2조 (서비스 이용 제한)</h4>
        <ul>
          <li>차량 대여 서비스는 <strong>만 21세 이상</strong>만 이용 가능</li>
          <li>운전면허 취득 1년 이상 경과 필수</li>
          <li>청소년의 단독 가입 및 이용 불가</li>
        </ul>

        <h4>제3조 (청소년 유해정보 차단 조치)</h4>
        <ul>
          <li>회사는 청소년에게 유해한 정보를 게시하지 않습니다.</li>
          <li>광고·콘텐츠는 모든 연령에게 적합한 내용으로 구성됩니다.</li>
          <li>유해 콘텐츠 신고 시 즉시 조치합니다.</li>
        </ul>

        <h4>제4조 (청소년 개인정보 보호)</h4>
        <ul>
          <li>만 14세 미만 아동의 가입 시 법정대리인(부모)의 동의 필요</li>
          <li>만 14세 미만 아동의 개인정보는 최소한으로 수집·이용</li>
          <li>법정대리인은 아동의 개인정보에 대한 열람·정정·삭제·동의철회 권리 행사 가능</li>
        </ul>

        <h4>제5조 (청소년 유해정보 신고)</h4>
        <ul>
          <li>고객센터: 1588-0000</li>
          <li>이메일: youth@caromobility.kr</li>
          <li>방송통신심의위원회 (1377)</li>
          <li>청소년 사이버상담센터 (1388)</li>
        </ul>

        <h4>제6조 (청소년 보호 책임자)</h4>
        <ul>
          <li>책임자: CARO MOBILITY 청소년보호 책임자</li>
          <li>소속: 고객지원팀</li>
          <li>연락처: youth@caromobility.kr / 1588-0000</li>
        </ul>

        <h4>제7조 (관련 법령)</h4>
        <ul>
          <li>청소년 보호법</li>
          <li>청소년 기본법</li>
          <li>정보통신망 이용촉진 및 정보보호 등에 관한 법률</li>
          <li>개인정보 보호법 (만 14세 미만 아동 보호 규정)</li>
        </ul>

        <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 정책은 2026년 5월 31일부터 시행합니다.</p>
      `
    }
  };

  /* ─── 약관 클릭 핸들러 (data-terms 속성 매칭) ─── */
  document.addEventListener('click', function(e){
    const target = e.target.closest('.apd-terms-item[data-terms]');
    if(!target) return;

    const termsKey = target.getAttribute('data-terms');
    const content = TERMS_CONTENT[termsKey];

    if(!content){
      console.warn('[CARO] 약관 콘텐츠 없음:', termsKey);
      return;
    }

    // notice-modal에 내용 채우기
    const titleEl = document.getElementById('notice-title');
    const bodyEl = document.getElementById('notice-body');

    if(titleEl) titleEl.textContent = content.title;
    if(bodyEl) bodyEl.innerHTML = content.body;

    // 모달 열기
    if(typeof openModal === 'function'){
      openModal('notice-modal');
    } else {
      const modal = document.getElementById('notice-modal');
      if(modal){
        modal.classList.add('open');
        modal.style.display = 'flex';
      }
    }

    e.preventDefault();
    e.stopPropagation();
  }, true);

  console.log('[CARO] 약관 6종 콘텐츠 v2 적용 (data-terms 매칭)');
})();
/* ═══════════════════════════════════════════
   청소년 보호정책 → 차량손해면책제도 이용약관 교체
═══════════════════════════════════════════ */
(function(){
  'use strict';

  /* 차량손해면책제도 약관 내용 */
  const DAMAGE_WAIVER_CONTENT = {
    title: '차량손해면책제도 이용약관',
    body: `
      <p>본 약관은 CARO MOBILITY 차량 대여 시 임차인의 사고 손해배상 부담을 완화하기 위한 차량손해면책제도(CDW: Collision Damage Waiver) 이용에 관한 사항을 규정합니다.</p>

      <h4>제1조 (면책 상품 종류)</h4>
      <ul>
        <li><strong>완전면책 (자부담 5만원) — BEST</strong><br>
        · 대인 무한, 대물 2억원<br>
        · 자차손해 완전보상 + 긴급출동 + 대체차량<br>
        · 시간당 +4,500원<br>
        · 국토교통부 고시 기준
        </li>
        <li><strong>일반면책 (자부담 30만원)</strong><br>
        · 대인 무한, 대물 1억원<br>
        · 자차손해 포함<br>
        · 시간당 +2,800원<br>
        · 렌터카 의무보험 + 자차 특약 기준
        </li>
        <li><strong>기본면책 (자부담 70만원)</strong><br>
        · 대인 무한, 대물 2천만원<br>
        · 자차손해 미포함 (기본 책임보험만)<br>
        · 시간당 +1,200원<br>
        · 자동차손해배상보장법 최저 의무보험 기준
        </li>
      </ul>

      <h4>제2조 (면책 한도)</h4>
      <ul>
        <li>대인배상 Ⅰ: 「자동차손해배상보장법」 기준 무한</li>
        <li>대인배상 Ⅱ: 1억원 ~ 무한 (상품별 차등)</li>
        <li>대물배상: 2천만원 ~ 2억원 (상품별 차등)</li>
        <li>자차손해: 면책상품에 따라 적용</li>
      </ul>

      <h4>제3조 (면책 제외 사항 - 매우 중요)</h4>
      <p>다음의 경우 <strong style="color:#b23a3a">면책제도가 적용되지 않으며 임차인이 전액 책임</strong>집니다.</p>
      <ul>
        <li>음주 운전 (혈중알코올농도 0.03% 이상)</li>
        <li>약물 복용 운전</li>
        <li>무면허 운전 또는 면허 무자격자에게 운전 위임</li>
        <li>사고 후 미신고 또는 도주 (도로교통법 제54조 위반)</li>
        <li>음주 측정 거부</li>
        <li>차량 개조 또는 외관 변경</li>
        <li>영업 목적 사용 (대리운전, 택배, 승차공유 등)</li>
        <li>도로교통법 12대 중과실 위반</li>
        <li>회사와 사전 합의 없는 임의 수리</li>
      </ul>

      <h4>제4조 (사고 시 처리 절차)</h4>
      <ul>
        <li>사고 즉시 회사 콜센터(1588-0000) 신고 (필수)</li>
        <li>경찰서 신고 (인사사고 시 필수, 도로교통법 제54조)</li>
        <li>보험사 신고 (24시간 이내)</li>
        <li>사고 현장 사진·동영상 보존</li>
        <li>회사 직원 도착 시까지 차량 임의 이동 금지</li>
        <li>임의 합의·임의 수리 절대 금지 (면책 무효)</li>
      </ul>

      <h4>제5조 (휴차료 - 휴차손해)</h4>
      <p>임차인의 귀책으로 차량 수리가 필요한 경우 수리 기간 중 휴차료가 발생합니다.</p>
      <ul>
        <li>산정식: <strong>일일대여요금 × 50% × 수리일수</strong></li>
        <li>근거: 공정거래위원회 자동차대여 표준약관 (제10064호)</li>
      </ul>

      <h4>제6조 (자기부담금 결제)</h4>
      <ul>
        <li>사고 발생 시 자기부담금은 회사 정산 후 청구됩니다.</li>
        <li>등록된 카드로 자동 결제됩니다.</li>
        <li>분할 결제 가능 여부는 회사 정책에 따릅니다.</li>
      </ul>

      <h4>제7조 (면책 상품 변경 및 환불)</h4>
      <ul>
        <li>대여 시작 전: 면책 상품 변경 또는 환불 가능</li>
        <li>대여 시작 후: 변경·환불 불가</li>
        <li>대여 종료 후 무사고 시: 면책료는 환불되지 않음</li>
      </ul>

      <h4>제8조 (이중 보험 가입 시)</h4>
      <p>임차인이 별도의 자동차 보험(개인 차량 보험 등)에 가입되어 있더라도, 본 면책제도는 별개로 적용됩니다. 대여 차량은 회사 보험 및 면책제도가 우선 적용됩니다.</p>

      <h4>제9조 (분쟁 처리)</h4>
      <ul>
        <li>회사 분쟁 처리: 1588-0000 / claim@caromobility.kr</li>
        <li>금융감독원 분쟁조정위원회 (1332)</li>
        <li>한국소비자원 분쟁조정 (1372)</li>
      </ul>

      <h4>제10조 (근거 법령)</h4>
      <ul>
        <li>자동차손해배상보장법</li>
        <li>여신전문금융업법</li>
        <li>공정거래위원회 자동차대여 표준약관 (제10064호)</li>
        <li>국토교통부 자동차대여사업 면책상품 운용 기준</li>
        <li>도로교통법</li>
      </ul>

      <p style="margin-top:16px;color:#888;font-size:.78rem;text-align:center;">본 약관은 2026년 5월 31일부터 시행합니다.</p>
    `
  };

  /* "청소년 보호정책" 표시명 → "차량손해면책제도 이용약관"으로 변경 */
  function replaceTermsLabel(){
    const items = document.querySelectorAll('.apd-terms-item[data-terms="youth"]');
    items.forEach(item => {
      const nameEl = item.querySelector('.apd-terms-name');
      if(nameEl && (nameEl.textContent.includes('청소년') || nameEl.textContent.trim().startsWith('청'))){
        nameEl.textContent = '차량손해면책제도 이용약관';
      }
    });
  }

  /* 클릭 핸들러 - 차량손해면책제도 내용 표시 (높은 우선순위) */
  document.addEventListener('click', function(e){
    const target = e.target.closest('.apd-terms-item[data-terms="youth"]');
    if(!target) return;

    // 약간 지연 후 내용 덮어쓰기 (이전 핸들러 실행 후)
    setTimeout(() => {
      const titleEl = document.getElementById('notice-title');
      const bodyEl = document.getElementById('notice-body');
      if(titleEl) titleEl.textContent = DAMAGE_WAIVER_CONTENT.title;
      if(bodyEl) bodyEl.innerHTML = DAMAGE_WAIVER_CONTENT.body;
    }, 50);
  }, true);

  /* 화면 전환 시 텍스트 교체 */
  const origGoTo = window.goTo;
  if(typeof origGoTo === 'function'){
    window.goTo = function(screen){
      const result = origGoTo.apply(this, arguments);
      if(screen === 'account-detail-screen'){
        setTimeout(replaceTermsLabel, 30);
        setTimeout(replaceTermsLabel, 200);
        setTimeout(replaceTermsLabel, 500);
      }
      return result;
    };
  }

  /* DOM 변경 감지로 자동 교체 (백업) */
  const observer = new MutationObserver(() => {
    replaceTermsLabel();
  });

  if(document.body){
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  /* 초기 실행 */
  setTimeout(replaceTermsLabel, 500);
  setTimeout(replaceTermsLabel, 1500);

  console.log('[CARO] 청소년 보호정책 → 차량손해면책제도 이용약관 교체 완료');
})();

/* ═══════════════════════════════════════════
   1. 차량 10분 전 사용 가능
   2. 환불 정책 법령 기준 변경
      (자동차대여 표준약관 + 소비자분쟁해결기준)
═══════════════════════════════════════════ */
(function(){
  'use strict';

  /* ───── 1. 환불 정책 변경 ───── */
  window.getRefundPolicy = function(diffMin, total){
    var pct, label, note;

    if(diffMin >= 1440){          // 24시간 이전
      pct = 100;
      label = '전액 환불 (100%)';
      note = '24시간 이전 취소';
    }
    else if(diffMin >= 720){      // 12 ~ 24시간 전
      pct = 70;
      label = '70% 환불';
      note = '12~24시간 전 취소';
    }
    else if(diffMin >= 180){      // 3 ~ 12시간 전
      pct = 30;
      label = '30% 환불';
      note = '3~12시간 전 취소';
    }
    else if(diffMin >= 60){       // 1 ~ 3시간 전
      pct = 10;
      label = '10% 환불';
      note = '1~3시간 전 취소';
    }
    else if(diffMin > 0){          // 1시간 이내
      pct = 0;
      label = '환불 불가';
      note = '대여 1시간 이내 취소';
    }
    else {                          // 대여 시작 후
      pct = 0;
      label = '환불 불가';
      note = '대여 시작 후 (중도해지는 콜센터 문의)';
    }

    var amt = pct > 0 ? Math.round(total * pct / 100) : 0;
    return {pct: pct, label: label, note: note, amt: amt};
  };

  /* ───── 2. 10분 전 차량 사용 가능 ───── */
  function activate10minRentals(){
    // 모든 예약 카드에서 "대여 임박" → "대여 중"으로 표시 + 버튼 활성화
    var allEls = document.querySelectorAll('*');
    allEls.forEach(function(el){
      if(el.children.length === 0 && el.textContent && el.textContent.trim() === '대여 임박'){
        el.textContent = '대여 중';
        el.style.color = '#b23a3a';

        // 같은 카드 내 잠금/사용/스마트키 버튼 활성화
        var card = el.closest('[class*="resv"], [class*="card"], [class*="reservation"], li, .item');
        if(card){
          card.querySelectorAll('button').forEach(function(btn){
            var t = (btn.textContent || '').trim();
            if(t.includes('잠금') || t.includes('해제') || t.includes('스마트키') ||
               t.includes('사용') || t.includes('시작') || t.includes('키')){
              btn.disabled = false;
              btn.removeAttribute('disabled');
              btn.style.opacity = '1';
              btn.style.cursor = 'pointer';
              btn.style.pointerEvents = 'auto';
            }
          });
        }
      }
    });
  }

  // DOM 변경 감지로 자동 적용
  var observer = new MutationObserver(function(){
    activate10minRentals();
  });

  if(document.body){
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // 5초마다 갱신 (시간 흐름 따라)
  setInterval(activate10minRentals, 5000);
  setTimeout(activate10minRentals, 500);

  console.log('[CARO] 환불 정책 v2 + 10분 전 사용 가능 패치 완료');
  console.log('  - 24h+ → 100% / 12-24h → 70% / 3-12h → 30% / 1-3h → 10% / <1h → 0%');
  console.log('  - 대여 10분 전부터 차량 사용 가능');
})();

/* ═══════════════════════════════════
   CARO THE BLACK 로딩: 마름모 제거 + 로딩 라인
═══════════════════════════════════ */
(function(){
  'use strict';

  if(!document.getElementById('caro-load-line-style')){
    var st = document.createElement('style');
    st.id = 'caro-load-line-style';
    st.textContent =
      '.caro-load-line{position:relative;width:120px;height:2px;margin:20px auto 0;'+
      'border-radius:2px;background:rgba(200,169,110,.18);overflow:hidden;'+
      'opacity:0;transform:translateY(10px);animation:caroLineRise .6s ease forwards;}'+
      '.caro-load-line::after{content:"";position:absolute;top:0;left:-40%;width:40%;'+
      'height:100%;background:linear-gradient(90deg,transparent,#c8a96e,transparent);'+
      'animation:caroLineSweep 1.2s ease-in-out infinite;}'+
      '@keyframes caroLineRise{to{opacity:1;transform:translateY(0);}}'+
      '@keyframes caroLineSweep{0%{left:-40%;}100%{left:100%;}}';
    document.head.appendChild(st);
  }

  function apply(){
    var logo = document.querySelector('.bl-transition-logo');
    if(!logo || !logo.parentElement) return;
    var parent = logo.parentElement;

    // 1) 마름모(◆) 요소 숨기기
    parent.querySelectorAll('*').forEach(function(el){
      if(el === logo || el.classList.contains('caro-load-line')) return;
      var t = (el.textContent||'').replace(/\s/g,'');
      if(t && el.children.length===0 && /^[◆◇♦◈❖]+$/.test(t)){
        el.style.display='none';
      }
    });

    // 2) 로딩 라인 추가 (중복 방지)
    if(!parent.querySelector('.caro-load-line')){
      var line = document.createElement('div');
      line.className='caro-load-line';
      logo.insertAdjacentElement('afterend', line);
    }
  }

  [50,300,800,1500].forEach(function(t){ setTimeout(apply,t); });

  var scheduled=false;
  new MutationObserver(function(){
    if(scheduled) return; scheduled=true;
    requestAnimationFrame(function(){ scheduled=false; apply(); });
  }).observe(document.documentElement,{childList:true,subtree:true});

  console.log('[CARO] ✅ 로딩 마름모 → 라인 교체 완료');
})();

/* ═══════════════════════════════════════════════════════════════
   CARO MOBILITY — 점검중(주황) 표시 패치 v1
   ───────────────────────────────────────────────────────────────
   ✅ 적용 방법: script.js 파일의 "맨 아래"에 이 블록 전체를 붙여넣기
   (기존 코드는 한 줄도 건드리지 않습니다 — 추가만 하면 됩니다)

   하는 일:
   - 관리자가 차량을 "사용 불가/점검" 처리하면 (devDisabled=true 또는
     status='unavailable') 고객 화면 차량 목록 + 지도 마커에
     주황색 "점검중" 으로 표시됩니다.
   - 점검중 차량은 예약 버튼이 자동 비활성화됩니다.
═══════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* 1) "점검중" 배지 색상(주황) 주입 */
  if(!document.getElementById('caro-maint-status-style')){
    var st = document.createElement('style');
    st.id = 'caro-maint-status-style';
    st.textContent =
      '.car-status.maint{background:rgba(224,123,0,.14) !important;color:#e07b00 !important;}';
    document.head.appendChild(st);
  }

  /* 점검 상태 판별 — devDisabled(앱 콘솔) 또는 unavailable(관제 대시보드) */
  function isMaint(car){
    return !!(car && (car.devDisabled || car.status === 'unavailable'));
  }
  window.caroIsMaint = isMaint;

  /* 2) 차량 목록 — 점검중 표시 보정 (기존 renderCars 결과를 덧칠) */
  if(typeof window.renderCars === 'function'){
    var _origRenderCars = window.renderCars;
    window.renderCars = function(){
      var ret = _origRenderCars.apply(this, arguments);
      try{
        var list = document.getElementById('car-list');
        if(list && typeof CARS_DATA !== 'undefined' && typeof isCarInMapBounds === 'function'){
          /* 렌더 순서 = CARS_DATA.filter(isCarInMapBounds) 와 동일하므로 인덱스로 매칭 */
          var visible = CARS_DATA.filter(isCarInMapBounds);
          var items = list.querySelectorAll('.car-item');
          items.forEach(function(item, i){
            var car = visible[i];
            if(!car || !isMaint(car)) return;
            var badge = item.querySelector('.car-status');
            if(badge){ badge.textContent = '점검중'; badge.className = 'car-status maint'; }
            var btn = item.querySelector('.car-rent-btn');
            if(btn){ btn.disabled = true; btn.removeAttribute('onclick'); btn.textContent = '점검중'; }
          });
        }
      }catch(e){ console.warn('[CARO] 점검중 목록 보정 오류:', e); }
      return ret;
    };
    window.renderCars._maintPatched = true;
  }

  /* 3) 지도 마커 — 점검중(주황) 지원 (원본 로직 + 점검중 분기) */
  window.updateMapMarkers = function(){
    if(typeof caroMap === 'undefined' || !caroMap) return;
    if(typeof L === 'undefined') return;
    mapMarkers.forEach(function(m){ caroMap.removeLayer(m); });
    mapMarkers = [];
    var now = new Date();
    var reservedMap = {};
    myReservations.forEach(function(r){
      if(r.start && r.end){
        if(!r.returned){
          reservedMap[r.car.id] = { until: null };
        } else if(r.returnedAt){
          var releaseTimeR = new Date(r.returnedAt.getTime() + 10*60000);
          if(now < releaseTimeR && !reservedMap[r.car.id])
            reservedMap[r.car.id] = { until: releaseTimeR };
        }
      }
    });
    CARS_DATA.forEach(function(car){
      var res = reservedMap[car.id];
      var maint = isMaint(car);
      var available = car.status === 'available' && !maint && !res;
      var col = available ? '#1d7a3a' : (maint ? '#e07b00' : '#b23a3a');
      var label = available ? '이용가능' : (maint ? '점검중' : '대여중');
      var icon = L.divIcon({
              html: '<div style="display:flex;flex-direction:column;align-items:center;gap:1px;">' +
                '<svg width="25" height="32" viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="40" cy="93" rx="12" ry="3" fill="#3a3e46" opacity="0.25"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#a2aab6" transform="translate(1,1)"/><path d="M40 88C40 88 62 58 62 38A22 22 0 0 0 18 38C18 58 40 88 40 88Z" fill="#f4f7fa" stroke="' + col + '" stroke-width="3"/><path d="M50 26A14 14 0 1 0 50 50" fill="none" stroke="#18191c" stroke-width="7" stroke-linecap="round"/></svg>' +
                '<div style="font-size:9px;font-weight:700;color:' + col + ';background:rgba(255,255,255,.85);padding:1px 3px;border-radius:14px;white-space:nowrap;">' + label + '</div>' +
              '</div>',
              className: '', iconSize: [34,44], iconAnchor: [17,37]
            });
      var marker = L.marker([car.lat, car.lng], { icon: icon }).addTo(caroMap)
        .bindPopup('<b>' + getCarName(car) + '</b><br>' + car.fuel + ' · ' + car.pricePerHour.toLocaleString() + '원/h<br><span style="color:' + col + ';font-weight:700;">' + label + '</span>');
      mapMarkers.push(marker);
    });
  };
  window.updateMapMarkers._maintPatched = true;

  /* 4) 적용 직후 한 번 다시 그려서 즉시 반영 */
  try{
    if(typeof renderCars === 'function') renderCars();
    if(typeof updateMapMarkers === 'function') updateMapMarkers();
  }catch(e){}

  console.log('[CARO] ✅ 점검중(주황) 표시 패치 v1 적용 완료');
})();

/* ═══════════════════════════════════════════
   카드·면허 영구저장 보강 v2
   ※ 결제·면허 화면에서 등록한 '면허'도 Firestore에 저장(기존엔 회원가입 때만 저장됨)
   ※ 로그인/재설치 후 카드·면허를 복원해 userInfo.license / savedCards / caro_apd_cards 모두 채움
   ※ 앱 업데이트(재설치)로 localStorage가 지워져도 서버(users/{uid})에 남아 복원됨
═══════════════════════════════════════════ */
(function(){
  'use strict';
  function db(){ try{ return window.FB_DB||null; }catch(e){ return null; } }
  function uid(){ try{ return (window.userInfo&&window.userInfo.uid)
      || (window.FB_AUTH&&window.FB_AUTH.currentUser&&window.FB_AUTH.currentUser.uid) || ''; }catch(e){ return ''; } }
  function ready(){ return !!(db()&&uid()&&window.FB_FN&&window.FB_FN.doc); }

  function fsSet(obj){
    if(!ready()||typeof window.FB_FN.setDoc!=='function') return Promise.resolve(false);
    try{ return window.FB_FN.setDoc(window.FB_FN.doc(db(),'users',uid()),obj,{merge:true})
      .then(function(){return true;}).catch(function(){return false;}); }
    catch(e){ return Promise.resolve(false); }
  }
  function fsGet(){
    if(!ready()||typeof window.FB_FN.getDoc!=='function') return Promise.resolve(null);
    try{ return window.FB_FN.getDoc(window.FB_FN.doc(db(),'users',uid()))
      .then(function(s){ return (s&&s.exists&&s.exists())?s.data():null; }).catch(function(){return null;}); }
    catch(e){ return Promise.resolve(null); }
  }

  function curCards(){
    try{ if(window.savedCards&&window.savedCards.length) return window.savedCards; }catch(e){}
    try{ var a=JSON.parse(localStorage.getItem('caro_apd_cards')||'[]'); if(a&&a.length) return a; }catch(e){}
    return [];
  }
  function syncCards(){ try{ var c=curCards(); fsSet({ savedCards:c }); }catch(e){} }
  function syncLicense(){ try{ var lic=(window.userInfo&&window.userInfo.license)||''; if(lic) fsSet({ licenseText:lic }); }catch(e){} }

  /* 저장 함수 후킹 (다른 모듈이 나중에 덮어써도 잡도록 재시도) */
  function installHooks(){
    if(typeof window.saveLicenseFromPI==='function' && !window.saveLicenseFromPI.__fsv2){
      var oL=window.saveLicenseFromPI;
      window.saveLicenseFromPI=function(){ var r=oL.apply(this,arguments); setTimeout(syncLicense,50); return r; };
      window.saveLicenseFromPI.__fsv2=true;
    }
    if(typeof window.saveCardFromPI==='function' && !window.saveCardFromPI.__fsv2){
      var oC=window.saveCardFromPI;
      window.saveCardFromPI=function(){ var r=oC.apply(this,arguments); setTimeout(syncCards,120); return r; };
      window.saveCardFromPI.__fsv2=true;
    }
  }
  var _ht=0, _hiv=setInterval(function(){ _ht++; installHooks(); if(_ht>40) clearInterval(_hiv); }, 500);

  /* 로그인/재설치 후 복원 — 세션당 1회 */
  var _restored=false;
  function restore(){
    if(_restored||!ready()) return;
    fsGet().then(function(d){
      _restored=true;
      window._caroProfileLoaded=true;   /* ★ 서버 조회 완료(데이터 유무 무관) → 홈 '이용 준비' 카드 판단 시작 허용 */
      if(!d) return;
      try{
        /* ★ [v101] 면허 복원 — 서버값(표준형)이 진실. userInfo.license(번호)+caro_license(객체)를 함께 갱신 */
        var licObj = (window.caroNormLicense && (caroNormLicense(d.license,{name:d.name,birth:d.birth}) || caroNormLicense(d.licenseText,{name:d.name,birth:d.birth}))) || null;
        var lic = licObj ? licObj.number : '';
        if(window.caroApplyLicenseLocal) caroApplyLicenseLocal(licObj);
        /* 카드 복원 → savedCards + caro_apd_cards (로컬이 비어있을 때만) */
        var cards = (Array.isArray(d.savedCards)&&d.savedCards.length)?d.savedCards
                  : (Array.isArray(d.cards)&&d.cards.length)?d.cards : null;
        if(cards && !curCards().length){
          try{ window.savedCards=cards.slice(); }catch(e){}
          try{ localStorage.setItem('caro_apd_cards', JSON.stringify(cards)); }catch(e){}
        }
        try{ if(window.renderPaymentInfoScreen) renderPaymentInfoScreen(); }catch(e){}
        try{ if(window.renderPICardList) renderPICardList(); }catch(e){}
        try{ if(window.saveUserData) saveUserData(); }catch(e){}
        console.log('[CARO] ✅ 카드·면허 복원 완료 (면허:'+(lic?'O':'-')+' 카드:'+(cards?cards.length:0)+'개)');
      }catch(e){}
    });
  }

  /* ★ [v101] 로그인 확정 때마다 복원 — caroOnAuth (시간 제한 없음).
     예전엔 48초(60×0.8초) 안에 로그인이 안 되면 영영 복원되지 않았고, 아래 onAuthStateChanged 는
     이 시점에 FB_AUTH 가 없어서 등록조차 되지 않았다. */
  var _restoredUid='';
  function onAuthRestore(u){
    if(u){ if(_restoredUid!==u.uid){ _restored=false; _restoredUid=u.uid; } if(!window.userInfo.uid) window.userInfo.uid=u.uid; restore(); }
    else { _restored=false; _restoredUid=''; }
  }
  if(window.caroOnAuth) window.caroOnAuth(onAuthRestore);
  else { var _rt=0, _riv=setInterval(function(){ _rt++; if(window.caroOnAuth){ clearInterval(_riv); window.caroOnAuth(onAuthRestore); } if(_rt>240) clearInterval(_riv); }, 250); }

  console.log('[CARO] 카드·면허 영구저장 보강 v2 로드');
})();
