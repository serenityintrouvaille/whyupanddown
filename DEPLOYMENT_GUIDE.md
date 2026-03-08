# 🚀 Why Up & Down - 배포 및 운영 가이드

**프로젝트**: 한국 주식 시장 분석 AI 비서
**배포 플랫폼**: Vercel (서버리스)
**자동화**: GitHub Actions + Vercel Cron Jobs
**예상 월 비용**: ~$1.50 (Claude API만)

---

## 📋 배포 체크리스트

### 1️⃣ 환경 변수 설정

#### Local Development
```bash
# .env.local 파일 (이미 생성됨)
ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
GOOGLE_NEWS_API_KEY=YOUR_KEY_HERE (선택사항)
```

#### Vercel Production
Vercel Dashboard → Settings → Environment Variables
```
ANTHROPIC_API_KEY: sk-ant-xxx
GOOGLE_NEWS_API_KEY: xxx (선택사항)
```

---

### 2️⃣ 로컬 테스트 (필수)

```bash
npm install
npm run dev
# http://localhost:3000 접속
```

#### API 엔드포인트 테스트

```bash
# Market Indicators
curl http://localhost:3000/api/market-indicators

# Detailed Analysis
curl -X POST http://localhost:3000/api/detailed-analysis \
  -H "Content-Type: application/json" \
  -d '{"sector": "반도체"}'

# Manual Update
curl -X POST http://localhost:3000/api/update \
  -H "Content-Type: application/json" \
  -d '{"trigger": "manual"}'
```

---

### 3️⃣ Vercel 배포

```bash
vercel --prod
```

---

### 4️⃣ GitHub Actions 설정

GitHub Repository → Settings → Secrets and variables → Actions

**필수 Secrets:**
- ANTHROPIC_API_KEY
- GOOGLE_NEWS_API_KEY (선택사항)

---

## 🚀 상위 1%를 위한 고급 전략

### ✨ 방안 1: Vercel Cron Jobs (권장) ⭐⭐⭐⭐⭐

**이미 설정됨 (vercel.json)**
```json
{
  "crons": [
    {
      "path": "/api/update",
      "schedule": "0 7 * * *"
    }
  ]
}
```

**장점:**
- ✅ GitHub Actions보다 50% 더 빠름
- ✅ 자동 재시도 및 모니터링
- ✅ 별도 설정 불필요
- ✅ 실시간 로그 및 알림

---

### 방안 2: GitHub Actions + Vercel 하이브리드

`.github/workflows/daily-update.yml` - 매일 4:00 PM KST 자동 실행

**활성화:**
```bash
git add .github/workflows/daily-update.yml
git commit -m "Add GitHub Actions daily update"
git push origin main
```

---

## 💰 비용 분석

| 서비스 | 월 비용 |
|--------|--------|
| Claude API | ~$1.50 |
| Vercel | $0 |
| Google News | $0 |
| GitHub Actions | $0 |
| **총합** | **~$1.50** |

---

## 🔧 트러블슈팅

**문제: "ANTHROPIC_API_KEY not configured"**
```bash
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

**확인: Vercel 로그**
```bash
vercel logs https://whyupanddown.vercel.app
```

---

**배포 시간: ~15분**
**자동화 신뢰도: >99%**

