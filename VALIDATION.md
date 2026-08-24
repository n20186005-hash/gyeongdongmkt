# 검증 기록

## 정적 프로젝트 감사

다음 항목은 프로젝트 파일을 직접 검사해 통과했습니다.

- package.json 직접 의존성에 `latest`, `*`, `^`, `~` 등 부동 버전 없음
- `packageManager` = `pnpm@11.22.0`
- Node.js = `24.19.0` (`engines`, `.node-version` 일치)
- TypeScript 6.0.3 / @astrojs/check 0.9.10 호환 범위 확인
- `pnpm-workspace.yaml`의 `packages`가 `['.']`로 비어 있지 않음
- pnpm 11 빌드 승인: `esbuild`, `sharp`, `workerd`만 명시적으로 허용
- `SITE_URL` 미설정 시 sitemap 통합 비활성화
- Google 지도 언어·지역: `ko` / `KR`
- 개인정보처리방침·이용약관·쿠키 설정은 각각 독립 경로
- GA4는 분석 동의 전 로드되지 않음
- logo / favicon(16·32·180·SVG) / 현장 사진 로컬 포함
- 실제 앱 소스에서 `example.com`, `localhost`, `chrome-extension://` 미검출
- Baguio/중국어 템플릿 문구 혼입 미검출

## 이 실행 환경의 제한

요청한 최종 명령 `CI=1 corepack pnpm install --frozen-lockfile`도 실제로 시도했으나, 현재 작업 컨테이너가 `registry.npmjs.org:443`에 대한 외부 연결을 차단해 pnpm 자체 다운로드 단계에서 `ECONNREFUSED`가 발생했습니다. 따라서 이 환경에서는 `pnpm check`와 `pnpm build`까지 실행할 수 없었으며, 실행하지 않은 검사를 통과했다고 표시하지 않습니다.

인터넷 접속이 가능한 깨끗한 Node.js 24.19.0 환경에서 아래 순서로 최종 재현 검증하세요.

```bash
rm -rf node_modules
CI=1 corepack pnpm install --frozen-lockfile
pnpm check
pnpm build
```

`pnpm build`에는 `scripts/verify-build.mjs`가 포함되어 있어 빌드 산출물의 금지 문자열, sitemap HTTPS URL, 임의 lastmod, SITE_URL 미설정 상태의 잘못된 sitemap 생성을 자동 검사합니다.
