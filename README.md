# 경동시장 서울 관광정보 가이드

한국어 독립 방문 안내입니다. 시장이나 정부·관광기관의 공식 사이트가 아니며 예약·판매 기능이 없습니다.

## 실행과 구조

Node 24.19.0, pnpm 11.22.0. `pnpm install --frozen-lockfile`, `pnpm check`, `pnpm build`로 설치·검사·빌드합니다. Astro는 모든 안내·법적 페이지를 정적 HTML로 생성합니다. 기존 `/`, `/privacy/`, `/terms/`, `/cookies/`를 유지하며 실제 404 페이지를 추가합니다. 한국어 외의 페이지를 새로 만들지 않습니다.

정규 도메인은 `https://gyeongdongmkt.com/`입니다. 필수 도메인이 빌드 환경변수 누락으로 사라지지 않도록 설정에 명시합니다. canonical·OG·한국어 alternate·홈페이지 sitemap이 생성됩니다. 기존에 추적하지 않던 `dist/`는 계속 빌드 결과로만 유지하고 모든 원본·공개 자산을 Git에 저장합니다.

Cloudflare Worker 프로젝트는 `gyeongdongmkt`입니다. ASSETS `run_worker_first`로 HTTP/www를 경로·쿼리 보존 301 처리하고 없는 주소에 실제 404와 noindex를 적용합니다. `pnpm deploy`는 빌드 후 배포하며 게시 권한자가 별도로 실행합니다.

## 편집과 사진

2026년 10월 20일 확인한 Maps 시간과 Visit Seoul의 운영·휴무 안내를 구분합니다. 점포·건물·문화 공간 전체에 하나의 일정이나 무료·시설 보장을 적용하지 않습니다. 요금·시간·평가는 schema에서 제거합니다. FAQ는 화면과 JSON-LD가 같은 배열에서 생성됩니다. [SOURCES.md](SOURCES.md)에 출처와 역사 사진의 작가·CC BY-SA 2.0 조건, 이전 사진의 교체 사유를 기록합니다.

## 개인정보

지도는 외부 링크이며 자동 iframe이 없습니다. Google Analytics는 `/cookies/`의 명시적 허용 후에만 로드합니다. 새 키 `gyeongdongmkt_cookie_preferences`는 이전 허용을 가져오지 않습니다. 기존 허용을 거부할 때 저장이 실패하면 즉시 런타임을 끄고 가능한 경우 세션 거부를 기록하여 같은 탭의 이동·새로고침에 유지합니다. 자동 새로고침하지 않으며 저장 실패 범위를 한국어로 알립니다. 계정·예약·문의·메일 창구나 사용하지 않는 환경설정 기능은 없습니다.
