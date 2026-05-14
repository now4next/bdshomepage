# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

BDS (Beyond Dream Scholars) 학교 홈페이지. 빌드 도구 없는 순수 정적 HTML/CSS/JS 사이트.

- **GitHub**: https://github.com/now4next/bdshomepage
- **프로덕션 URL**: https://bdshomepage.pages.dev
- **메인 브랜치**: `main`

## 배포 워크플로우

`git push origin HEAD:main` → Cloudflare Pages 자동 배포 (1–3분 소요).

```bash
git add <변경 파일>       # git add . 금지 — 변경 파일만 명시
git commit -m "feat|fix|refactor: <설명>"
git push origin HEAD:main
```

로컬 전용(실험적 수정, 사용자 리뷰 필요)인 경우만 push를 보류한다.

### CDN 캐시 무효화

배포 후 변경이 반영되지 않으면 `.cloudflare-cache-bust` 파일의 `version`·`last_update`를 올린 뒤 재push한다.

## 로컬 미리보기

`.claude/launch.json`의 `bds-static` 서버(Python http.server, 포트 8000)를 사용한다.  
시작: `mcp__Claude_Preview__preview_start` / 변경 확인: 브라우저 Ctrl+Shift+R

## 아키텍처

### 페이지 구성
| 파일 | 역할 |
|---|---|
| `index.html` | 메인 페이지 — 모든 CSS/JS 인라인 (~4500+ 줄) |
| `ongdalsam.html` | 캠퍼스 소개 페이지 (시설, 갤러리, 학부모 섹션) |
| `academic-calendar.html` | 학사 일정 페이지 |
| `admin.html` | 문의 관리 대시보드 (현재 클라이언트사이드 데모) |

### 다국어(i18n) 시스템
- **`js/langs.js`** — `window.BDS_LANGS = { en, ko, ja, de }` 딕셔너리 정의
- **`js/i18n.js`** — 페이지 로드 시 `data-i18n` 속성을 순회하며 텍스트를 교체. `localStorage('bds_lang')`로 언어 상태 유지
- 마크업: `<el data-i18n="key">fallback text</el>`
- 새 텍스트 추가 시 langs.js의 **en·ko·ja·de 4개 블록 모두** 동시 수정 필요
- **키 미등록 시 키 이름 자체가 화면에 노출됨** (i18n 엔진 fallback 동작)

### 이미지 구조
```
images/
├── campus/       # 캠퍼스 시설 사진 (18장)
├── students/     # 학생 활동 사진 (32장)
└── achievements/ # 대학 합격 성과 사진 (5장)
```

### 관리자 페이지 (admin.html) — 현재 한계
- 인증: 클라이언트 JS에 `ADMIN_EMAIL / ADMIN_PASS` 하드코딩 → 소스 보기로 노출
- 데이터: `localStorage`에 저장 → 다른 브라우저·기기에서 제출된 문의 열람 불가
- 실 운영 전환 시 **Cloudflare Workers + D1** 또는 **Supabase** 백엔드 필요

## 주의사항

- `index.html`은 단일 파일에 모든 마크업·스타일·스크립트 포함. Edit 도구로 구체적 블록만 수정하고 전체 재작성 금지.
- 한국어 텍스트 줄바꿈 제어: `word-break: keep-all` 사용.
- 디자인 시스템: Harvard Crimson `#A51C30`, Merriweather(제목) + Inter·Pretendard(본문), max-width 1200–1400px.
- 외부 리소스(Google Fonts)는 CDN 로드이므로 오프라인 환경에서는 폰트가 깨질 수 있다.
