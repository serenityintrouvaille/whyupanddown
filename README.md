# 🤖 JAVIS1 - AI 금융비서

> **각 섹터가 왜 올랐는지 요약해주는 AI 금융비서**

## 📋 프로젝트 개요

JAVIS1은 다음 작업을 매일 자동으로 수행하는 AI 금융 비서입니다:

1. **네이버 증권 테마 크롤링** → 오늘 가장 많이 오른 상위 5개 테마 추출
2. **뉴스 수집** → 각 테마의 최신 뉴스 검색
3. **AI 분석** → Claude API로 뉴스와 중동 전쟁/유가 이슈와의 상관관계 분석
4. **결과 제시** → `섹터명 - 등락률 - 상승 원인 - 지속성 판단` 형식으로 표시

## 🏗️ 아키텍처

### 협업 에이전트

| 역할 | 담당자 | 책임 |
|------|--------|------|
| 🚀 Stock Trader | [TRADER_AGENT.md](./TRADER_AGENT.md) | 데이터 수집 & 시장 분석 |
| 📊 Product Manager | [PM_AGENT.md](./PM_AGENT.md) | 뉴스 수집 & Claude 분석 |
| ✅ QA Agent | [VERIFICATION_AGENT.md](./VERIFICATION_AGENT.md) | 검증 & 자동화 모니터링 |

### 기술 스택

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Backend**: Next.js API Routes (Serverless on Vercel)
- **AI**: Claude Sonnet 4.6 (Anthropic)
- **News API**: Google News API / NewsAPI
- **Data**: Naver 증권 (BeautifulSoup 크롤링)
- **Automation**: GitHub Actions (매일 오후 4:00 KST)
- **Database**: GitHub (JSON 파일 저장)

## 🚀 배포

### 1단계: 환경 변수 설정

```bash
# .env.local 생성
GOOGLE_NEWS_API_KEY=your_api_key
ANTHROPIC_API_KEY=your_anthropic_key
UPDATE_SECRET=your_secret_key
```

### 2단계: Vercel 배포

```bash
npm install
npm run build
vercel --prod
```

### 3단계: GitHub Actions 설정

1. 저장소 Settings → Secrets and variables → Actions
2. 다음 시크릿 추가:
   - `GOOGLE_NEWS_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `UPDATE_SECRET`

## 📅 자동화 스케줄

| 시간 | 작업 | 빈도 |
|------|------|------|
| 매일 16:00 KST | 시장 분석 자동 실행 | 일일 |
| 매일 16:05 KST | GitHub에 결과 커밋 | 일일 |

## 📖 API 문서

### `POST /api/update`
시장 분석 실행

**Request**
```bash
curl -X POST https://javis1.vercel.app/api/update
```

**Response**
```json
{
  "success": true,
  "timestamp": "2026-03-08T07:00:00Z",
  "results": [
    {
      "sector": "반도체",
      "changeRate": 5.2,
      "summary": "...",
      "continuity": "중기"
    }
  ]
}
```

### `GET /api/results`
최신 분석 결과 조회

## 🔧 개발 가이드

### 로컬 실행

```bash
npm install
npm run dev
# http://localhost:3000 접속
```

### 테스트

```bash
# Mock 데이터로 테스트
curl -X POST http://localhost:3000/api/update
```

## 📊 결과 포맷

```
=== JAVIS1 일일 시장분석 ===

분석일시: 2026-03-08 16:00:00

1. 반도체 - +5.20% - 중동 이슈로 인한 글로벌 리스크 회피 → 기술주 선호 - 중기
2. 원유 - +4.80% - 유가 급등으로 인한 에너지주 강세 - 장기
```

## 🤝 협업 방식

각 에이전트가 담당 역할의 `.md` 파일을 참고하여 작업:
- Trader: 데이터 수집 & 크롤링
- PM: 뉴스 & Claude 분석
- QA: 검증 & 자동화

## 📝 라이선스

MIT

## 🔗 관련 문서

- [주식 트레이더 역할](./TRADER_AGENT.md)
- [PM 역할](./PM_AGENT.md)
- [QA 에이전트 역할](./VERIFICATION_AGENT.md)
