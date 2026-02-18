# Cloudflare Pages 배포 문제 해결 가이드

## 현재 상황

✅ **GitHub 저장소**: 업데이트 완료 (유튜브 영상 포함)
❌ **Cloudflare Pages**: 자동 배포 미작동

## 문제 원인

Cloudflare Pages의 GitHub 자동 배포가 설정되지 않았거나 비활성화된 것으로 보입니다.

## 해결 방법

### 방법 1: Cloudflare Dashboard에서 GitHub 연동 확인

1. **Cloudflare Dashboard 접속**
   - https://dash.cloudflare.com/ 로그인

2. **Pages 프로젝트 확인**
   - 왼쪽 메뉴: **Pages** 클릭
   - 프로젝트 목록에서 `bdshomepage` 찾기

3. **두 가지 시나리오**:

#### 시나리오 A: 프로젝트가 GitHub 연동됨
   - 프로젝트 클릭 → **Settings** → **Builds & deployments**
   - **Production branch**: `main`으로 설정되어 있는지 확인
   - **Automatic deployments**: 활성화되어 있는지 확인
   - 만약 비활성화되어 있다면 → 활성화

#### 시나리오 B: 프로젝트가 직접 업로드 방식
   - 이 경우 GitHub push가 자동 배포를 트리거하지 않습니다
   - **해결책**: 프로젝트를 GitHub 연동 방식으로 재생성

### 방법 2: 프로젝트를 GitHub 연동으로 재생성 (권장)

1. **기존 프로젝트 삭제** (선택사항)
   - Cloudflare Dashboard → Pages → bdshomepage
   - Settings → Scroll down → **Delete project**

2. **새 프로젝트 생성**
   - Pages → **Create a project**
   - **Connect to Git** 선택 (Upload assets 아님!)
   - **GitHub** 선택
   - 저장소: `now4next/bdshomepage` 선택
   - Branch: `main`
   - Build settings:
     - **Framework preset**: None
     - **Build command**: (비워두기)
     - **Build output directory**: `/`
   - **Save and Deploy**

3. **프로젝트 이름 설정**
   - 프로젝트 이름을 `bdshomepage`로 설정
   - 배포 URL: `bdshomepage.pages.dev`

### 방법 3: Wrangler CLI로 수동 배포

현재 디렉토리에서 실행:

```bash
# Cloudflare 로그인 (브라우저에서 인증)
wrangler login

# Pages 프로젝트 배포
wrangler pages deploy . --project-name=bdshomepage

# 또는 새 프로젝트로 배포
wrangler pages deploy . --project-name=bdshomepage-new
```

### 방법 4: Cloudflare Dashboard에서 수동 배포

1. **파일 다운로드**
   - GitHub에서 최신 파일 다운로드
   - 또는 현재 로컬 파일 사용

2. **Cloudflare Dashboard 업로드**
   - Pages → Create a project
   - **Upload assets** 선택
   - `index.html`, `_redirects`, `wrangler.toml` 파일 드래그 앤 드롭
   - **Deploy site**

## 확인 체크리스트

- [ ] GitHub 저장소에 최신 코드가 있는가? ✅
- [ ] Cloudflare Pages 프로젝트가 존재하는가?
- [ ] GitHub 연동이 활성화되어 있는가?
- [ ] Production branch가 `main`으로 설정되어 있는가?
- [ ] Automatic deployments가 활성화되어 있는가?

## 배포 후 확인

배포 후 캐시를 지우고 확인:
- Ctrl + Shift + R (하드 리프레시)
- 시크릿 모드로 https://bdshomepage.pages.dev 접속

## 참고 링크

- Cloudflare Dashboard: https://dash.cloudflare.com/
- GitHub Repository: https://github.com/now4next/bdshomepage
- Cloudflare Pages Docs: https://developers.cloudflare.com/pages/
