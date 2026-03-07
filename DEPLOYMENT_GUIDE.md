# 🚀 JAVIS1 배포 가이드 (1시간 완성)

## ✅ 완료된 작업

- ✅ 프로젝트 구조 생성 (Next.js)
- ✅ API 라우트 구현 (`/api/update`, `/api/results`)
- ✅ 웹 UI 개발 (메인 대시보드)
- ✅ GitHub Actions 워크플로우 (매일 4:00 PM KST)
- ✅ 3명 협업 에이전트 역할 정의
- ✅ 로컬 테스트 가능

## 🔑 필수 API 키

### 1. Anthropic API 키 획득
```bash
# https://console.anthropic.com 접속
# API Keys 메뉴에서 생성
# 비용: 사용량 기반 (Claude Sonnet 4.6은 저가)
```

### 2. Google News API 키 (선택사항)
```bash
# https://newsapi.org 접속
# 무료 플랜 가능 (월 100 요청)
# 또는 수동 뉴스 수집으로 대체 가능
```

## 📦 배포 단계 (3단계, ~15분)

### 1단계: GitHub 리포지토리 생성
```bash
cd ~/.claude/javis1

# 초기 커밋
git add .
git commit -m "Initial: JAVIS1 AI Financial Assistant v1.0"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/javis1.git
git push -u origin main
```

### 2단계: Vercel에 배포
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

**Vercel 설정 중**
- Project name: `javis1`
- Framework: Next.js
- Root directory: `.`

### 3단계: 환경 변수 설정 (Vercel)

1. [Vercel Dashboard](https://vercel.com) 접속
2. `javis1` 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 다음 변수 추가:
   - `GOOGLE_NEWS_API_KEY`: `sk-news-xxxx`
   - `ANTHROPIC_API_KEY`: `sk-ant-xxxx`
   - `UPDATE_SECRET`: `javis1-secret-key-2024`

### 4단계: GitHub Actions 설정

1. GitHub 리포지토리 접속
2. **Settings** → **Secrets and variables** → **Actions**
3. 다음 시크릿 추가:
   ```
   GOOGLE_NEWS_API_KEY=your_api_key
   ANTHROPIC_API_KEY=your_anthropic_key
   UPDATE_SECRET=javis1-secret-key-2024
   SLACK_WEBHOOK=https://hooks.slack.com/services/... (선택사항)
   ```

## ✨ 배포 후 확인 사항

### 웹 UI 테스트
```bash
# 1. 배포된 URL 접속
https://javis1.vercel.app

# 2. "지금 분석하기" 버튼 클릭
# 3. 결과 확인
```

### 수동 API 테스트
```bash
# 분석 실행
curl -X POST https://javis1.vercel.app/api/update

# 결과 조회
curl https://javis1.vercel.app/api/results
```

### GitHub Actions 확인
1. 리포지토리 → **Actions** 탭
2. `Daily Market Analysis Update` 워크플로우 확인
3. 테스트 실행: **Run workflow** → **Run workflow**

## 📅 자동화 확인

### 매일 오후 4:00 KST 자동 실행
- **시간**: 16:00 KST (= 07:00 UTC)
- **빈도**: 매일 1회
- **작업**:
  1. 네이버 테마 크롤링
  2. 뉴스 수집 + Claude 분석
  3. 결과 저장 및 GitHub 커밋

### 수동 트리거
```bash
# GitHub UI에서
# Actions → Daily Market Analysis Update → Run workflow
```

## 📊 결과 확인

### 웹 대시보드
- URL: `https://javis1.vercel.app`
- 자동 새로고침: 매일 4:00 PM

### JSON 데이터
- 저장 위치: `/data/results-YYYY-MM-DD.json`
- 형식:
```json
{
  "date": "2026-03-08 16:00:00",
  "results": [
    {
      "sector": "반도체",
      "changeRate": 5.2,
      "summary": "...",
      "continuity": "중기"
    }
  ],
  "formatted": "..."
}
```

## 🔧 문제 해결

### "Cannot find module" 에러
```bash
# node_modules 재설치
rm -rf node_modules
npm install
vercel --prod
```

### API 키 오류
```bash
# Vercel 대시보드에서 키 확인
# 값에 공백이나 따옴표 없는지 확인
```

### GitHub Actions 실패
1. Actions 로그 확인
2. 시크릿이 올바르게 설정되었는지 확인
3. API 할당량 확인

## 📞 지원

- Anthropic API: https://console.anthropic.com
- Vercel: https://vercel.com
- GitHub Actions: https://docs.github.com/en/actions

## ✅ 최종 체크리스트

- [ ] GitHub 리포지토리 생성
- [ ] Vercel 배포 완료
- [ ] 환경 변수 설정 (Vercel)
- [ ] GitHub Actions 시크릿 설정
- [ ] 수동 테스트 성공 (`/api/update`)
- [ ] 웹 UI 접속 확인
- [ ] 자동 스케줄 확인

---

**배포 완료 시간: ~1시간**
**상태: 🟢 준비 완료**
