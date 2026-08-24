# 경동시장 관광정보 가이드

서울특별시 동대문구 경동시장의 역사·시장문화와 실용 방문 정보를 정리한 독립 비영리 단일 관광지 사이트입니다. 디자인은 전통시장의 간판 구조, 약재 상자의 종이 질감, 짙은 녹색·적갈색 계열을 모티프로 제작했습니다.

## 기술 구성

- Astro 7.2.3
- Tailwind CSS 4.3.3 (`@tailwindcss/vite`)
- TypeScript 6.0.3
- `@astrojs/check` 0.9.10
- `@astrojs/cloudflare` 14.2.2
- `@astrojs/sitemap` 3.7.3
- Wrangler 4.124.0
- pnpm 11.22.0
- Node.js 24.19.0 LTS
- Cloudflare Workers

모든 직접 의존성은 `package.json`에 정확한 버전으로 고정합니다. pnpm 11은 의존성 빌드 스크립트를 명시적으로 승인해야 하므로 `pnpm-workspace.yaml`을 사용하며, 단일 패키지 조건에 맞게 `packages: ['.']`을 포함하고 `esbuild`, `sharp`, `workerd`만 빌드를 허용합니다.

## 시작하기

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm build
```

## 도메인 설정

도메인은 **한 곳**에서만 설정합니다. 배포 또는 빌드 환경의 `SITE_URL` 값을 실제 HTTPS 주소로 지정하세요.

```bash
SITE_URL=https://실제-도메인.kr pnpm build
```

`SITE_URL`이 비어 있어도 빌드는 정상적으로 완료됩니다. 이 경우:

- canonical 절대 URL은 출력하지 않습니다.
- Open Graph의 `og:url`은 생략합니다.
- JSON-LD의 절대 `url`/`image` 항목은 생략합니다.
- `@astrojs/sitemap`은 활성화하지 않으므로 잘못된 임시 도메인의 sitemap이 생성되지 않습니다.

실제 도메인을 설정하면 canonical, Open Graph URL, JSON-LD URL과 sitemap이 모두 `Astro.site`에서 파생됩니다.

## Cloudflare Workers

```bash
pnpm build
pnpm deploy
```

`wrangler.jsonc`는 Astro Cloudflare Worker 엔트리포인트를 사용합니다. `compatibility_date`는 배포 재현성을 위해 프로젝트 기술 설정으로 고정했습니다.

## 개인정보·쿠키

- `/privacy/` 개인정보처리방침
- `/terms/` 이용약관
- `/cookies/` 쿠키 설정

세 문서는 팝업이 아닌 독립 페이지입니다. Google 애널리틱스 4(`G-HXM22WWPKP`)는 사용자가 `/cookies/`에서 분석 기능에 동의한 경우에만 동적으로 로드됩니다. 맞춤형 광고용 마케팅 쿠키는 사용하지 않습니다.

## 빌드 후 자체 검증

`pnpm build`는 Astro 빌드 뒤 `scripts/verify-build.mjs`를 자동 실행하여 다음을 검사합니다.

- `example.com`, `localhost`, `chrome-extension://` 금지 문자열
- `SITE_URL` 미설정 상태에서 sitemap이 잘못 생성되는지 여부
- sitemap이 있을 경우 모든 `<loc>`가 HTTPS 절대 URL인지 여부
- sitemap에 임의의 `<lastmod>`가 들어가지 않았는지 여부

권장 최종 검증:

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
```

## 사진 저작권

사진은 프로젝트에 로컬 포함되어 외부 이미지 서버에 의존하지 않습니다. 사진의 소유권과 저작권은 원 촬영자 및 권리자에게 있으며, 출처와 편집 원칙은 `SOURCES.md`를 참고하세요.
