# BDS Website

BDS Beyond Dream Scholars 웹사이트

## Cloudflare Pages 배포 방법

### 방법 1: Cloudflare Dashboard를 통한 배포

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. 왼쪽 메뉴에서 **Pages** 선택
3. **Create a project** 클릭
4. **Upload assets** 선택
5. 이 폴더의 모든 파일을 드래그 앤 드롭하여 업로드
6. 프로젝트 이름 입력 (예: `bds-website`)
7. **Deploy site** 클릭

### 방법 2: Git 연동을 통한 배포

1. 이 프로젝트를 Git 저장소에 푸시
2. Cloudflare Dashboard에서 **Pages** > **Create a project** 선택
3. **Connect to Git** 선택
4. 저장소 연결 및 빌드 설정:
   - Build command: (없음 - 정적 사이트)
   - Build output directory: `/` (또는 빈 값)

### 방법 3: Wrangler CLI를 통한 배포

```bash
# Wrangler 설치
npm install -g wrangler

# 로그인
wrangler login

# 배포
wrangler pages deploy .
```

## 파일 구조

```
bds-website/
├── index.html          # 메인 HTML 파일
├── _redirects          # SPA 라우팅용 리다이렉트 설정
└── README.md           # 이 파일
```

## 참고사항

- 모든 스타일과 스크립트는 `index.html`에 인라인으로 포함되어 있습니다.
- 외부 리소스(Google Fonts, Unsplash 이미지)는 CDN을 통해 로드됩니다.
- Cloudflare Pages는 무료로 정적 사이트를 호스팅할 수 있습니다.

