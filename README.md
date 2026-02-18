# BDS Website

BDS Beyond Dream Scholars 웹사이트

## 🔗 GitHub Repository

**Repository URL**: [https://github.com/now4next/bdshomepage](https://github.com/now4next/bdshomepage)

이 프로젝트는 GitHub에서 버전 관리되고 있습니다.

### Git 명령어

```bash
# 저장소 클론
git clone https://github.com/now4next/bdshomepage.git

# 변경사항 확인
git status

# 변경사항 커밋
git add .
git commit -m "커밋 메시지"

# GitHub에 푸시
git push origin main
```

## 🚀 Cloudflare Pages 배포 방법

### 방법 1: Cloudflare Dashboard를 통한 배포

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. 왼쪽 메뉴에서 **Pages** 선택
3. **Create a project** 클릭
4. **Upload assets** 선택
5. 이 폴더의 모든 파일을 드래그 앤 드롭하여 업로드
6. 프로젝트 이름 입력 (예: `bds-website`)
7. **Deploy site** 클릭

### 방법 2: Git 연동을 통한 배포 (권장)

1. [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인
2. **Pages** > **Create a project** 선택
3. **Connect to Git** 선택
4. GitHub 저장소 선택: `now4next/bdshomepage`
5. 빌드 설정:
   - **Build command**: (비워두기 - 정적 사이트)
   - **Build output directory**: `/` (또는 빈 값)
6. **Save and Deploy** 클릭

이후 GitHub에 코드를 푸시하면 자동으로 Cloudflare Pages에 배포됩니다!

### 방법 3: Wrangler CLI를 통한 배포

```bash
# Wrangler 설치
npm install -g wrangler

# 로그인
wrangler login

# 배포
wrangler pages deploy .
```

## 📁 파일 구조

```
bds-website/
├── index.html          # 메인 HTML 파일
├── _redirects          # SPA 라우팅용 리다이렉트 설정
├── wrangler.toml       # Cloudflare Wrangler 설정
├── .gitignore          # Git 무시 파일 설정
└── README.md           # 이 파일
```

## 📝 참고사항

- 모든 스타일과 스크립트는 `index.html`에 인라인으로 포함되어 있습니다.
- 외부 리소스(Google Fonts, Unsplash 이미지)는 CDN을 통해 로드됩니다.
- Cloudflare Pages는 무료로 정적 사이트를 호스팅할 수 있습니다.
- GitHub와 연동하면 자동 배포가 가능합니다.

## 🛠️ 개발 환경

이 프로젝트는 순수 HTML/CSS/JavaScript로 작성된 정적 웹사이트입니다. 별도의 빌드 도구가 필요하지 않습니다.

### 로컬 개발 서버 실행

```bash
# Python을 사용하는 경우
python -m http.server 8000

# Node.js를 사용하는 경우
npx serve .

# PHP를 사용하는 경우
php -S localhost:8000
```

브라우저에서 `http://localhost:8000`으로 접속하여 확인할 수 있습니다.

## 📄 라이선스

Copyright © 2024 BDS (Beyond Dream Scholars). All rights reserved.

---

## 🌐 Live Deployment

**Production URL**: [https://bdshomepage.pages.dev](https://bdshomepage.pages.dev)

### Deployment Status

✅ **Status**: Live and Running  
🚀 **Platform**: Cloudflare Pages  
🔄 **Auto-Deploy**: Enabled (GitHub integration)  
📦 **CDN**: Global Cloudflare Network  

### Deployment Details

- **Project Name**: `bdshomepage`
- **Build Status**: Success
- **Content Type**: Static HTML/CSS/JavaScript
- **Response Code**: 200 OK
- **CDN**: Cloudflare Global Network
- **SSL/TLS**: Enabled (HTTPS)

### Automatic Deployment

이 프로젝트는 GitHub와 Cloudflare Pages가 연동되어 있어, `main` 브랜치에 코드를 푸시하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "업데이트 내용"
git push origin main
# → 자동으로 https://bdshomepage.pages.dev 에 배포됨
```

### Custom Domain Setup (선택사항)

커스텀 도메인을 연결하려면:

1. Cloudflare Dashboard → Pages → bdshomepage
2. **Custom domains** 탭 선택
3. **Set up a custom domain** 클릭
4. 도메인 입력 및 DNS 설정 완료

---
