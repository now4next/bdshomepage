# BDS Homepage — Claude 작업 가이드

## 프로젝트 개요

BDS (Beyond Dream Scholars) 웹사이트. 빌드 도구 없는 순수 정적 HTML/CSS/JavaScript 사이트. 모든 스타일/스크립트는 `index.html`에 인라인으로 포함.

- **GitHub**: https://github.com/now4next/bdshomepage
- **프로덕션 URL**: https://bdshomepage.pages.dev
- **메인 브랜치**: `main`

## 배포 워크플로우 (중요)

이 프로젝트는 **GitHub `main` → Cloudflare Pages 자동 배포** 파이프라인이 구성되어 있다.

### 개발 작업 완료 후 기본 절차

특별히 로컬에서만 수정·확인이 필요한 경우가 아니라면, 개발 작업이 끝나면 **항상 commit & push 까지 수행해 프로덕션에 바로 반영**한다:

```bash
git add <변경 파일>
git commit -m "<메시지>"
git push origin main
# → 1-3분 내 https://bdshomepage.pages.dev 에 자동 배포
```

- 파일 스테이징은 `git add .` 대신 변경한 파일을 명시해서 추가한다.
- 커밋 메시지 스타일은 기존 커밋 히스토리(`feat:`, `fix:`, `docs:`, `refactor:` 등 Conventional Commits)를 따른다.
- 푸시 후에는 Cloudflare Pages 자동 배포가 1-3분 내 완료됨을 사용자에게 알려준다.

### 로컬 전용 작업인 경우

다음과 같은 경우는 push하지 않고 로컬에서만 작업 후 사용자 확인을 받는다:
- 실험적/탐색적 수정
- 프로덕션에 반영하기 전 사용자 리뷰가 필요한 변경
- 사용자가 명시적으로 "push 하지 마"라고 지시한 경우

## 로컬 미리보기

작업 중에는 Claude Code의 **Preview** 기능을 사용해 오른쪽 패널에 사이트를 띄운다.

- `.claude/launch.json` 에 `bds-static` 서버 설정이 등록되어 있음 (Python http.server, 포트 8000).
- 작업 시작 시 `mcp__Claude_Preview__preview_start` 로 서버를 기동한다 (이미 실행 중이면 재사용됨).
- 변경 후 브라우저에서 강력 새로고침(Ctrl+Shift+R)으로 확인한다.

## 파일 구조

```
bdshomepage/
├── index.html                    # 메인 페이지 (모든 CSS/JS 인라인)
├── academic-calendar.html        # 학사 일정 페이지
├── harvard_style_sections.html   # Harvard 스타일 섹션 템플릿
├── modern_sections.html          # 모던 섹션 템플릿
├── _redirects                    # SPA 라우팅 리다이렉트
├── wrangler.toml                 # Cloudflare Wrangler 설정
├── .cloudflare-cache-bust        # CDN 캐시 무효화 트리거
├── *.py                          # 최적화 보조 스크립트
└── *.md                          # 변경 이력/가이드 문서
```

## 주의사항

- `index.html` 은 단일 파일에 모든 마크업/스타일/스크립트가 포함되어 매우 큼. 수정 시 Edit 도구로 구체적인 블록만 바꾸고 전체 재작성은 피한다.
- 외부 리소스(Google Fonts, Unsplash 이미지)는 CDN 로드이므로 오프라인 환경에서는 스타일이 일부 깨질 수 있다.
- 강력한 CDN 캐시 때문에 배포 후 변경이 안 보이면 `.cloudflare-cache-bust` 파일을 갱신하거나 하드 리프레시를 안내한다.
