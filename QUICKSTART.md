# ⚡ JAVIS1 빠른 시작 (5분)

## 🎯 핵심 요약

```
네이버 증권 테마 크롤링
    ↓ (상위 5개 추출)
뉴스 수집 (Google News API)
    ↓ (각 테마별)
Claude AI 분석 (지정학적 맥락)
    ↓ (3줄 요약)
웹 UI + GitHub 자동화
```

## 🚀 1분 안에 시작하기

### 로컬 테스트
```bash
cd ~/.claude/javis1

# 1. 의존성 설치
npm install

# 2. 개발 서버 실행
npm run dev

# 3. http://localhost:3000 접속
# 4. "지금 분석하기" 클릭
```

## 📋 3가지 핵심 역할

### 1️⃣ Stock Trader (주식 트레이더)
- **담당**: 네이버 테마 크롤링 & 시장 분석
- **파일**: `src/lib/crawler.ts`
- **결과**: 상위 5개 테마 + 등락률

### 2️⃣ PM (프로덕트 매니저)
- **담당**: 뉴스 수집 & Claude 분석
- **파일**: `src/lib/news-fetcher.ts`, `src/lib/claude-analyzer.ts`
- **결과**: 3줄 요약 + 지정학적 맥락

### 3️⃣ QA Agent (검증 에이전트)
- **담당**: 데이터 검증 & 자동화 모니터링
- **파일**: `src/lib/formatter.ts`, `.github/workflows/daily-update.yml`
- **결과**: 최종 결과 포맷 + GitHub Actions

## 🔑 필수 API 키 3개

| API | 용도 | 링크 | 비용 |
|-----|------|------|------|
| Anthropic | Claude AI 분석 | https://console.anthropic.com | 사용량 기반 |
| Google News | 뉴스 수집 | https://newsapi.org | 무료 (100/월) |
| (선택) GitHub Token | Actions 자동화 | 이미 설정됨 | 무료 |

## ⚙️ 30초 환경 변수 설정

**.env.local 파일 생성**
```
GOOGLE_NEWS_API_KEY=your_newsapi_key
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key
```

## 🌐 Vercel 배포 (2단계)

```bash
# 1단계: Vercel CLI 설치 & 로그인
npm install -g vercel
vercel login

# 2단계: 배포
vercel --prod

# 완료! https://javis1.vercel.app
```

## 📅 자동화 (매일 4:00 PM KST)

- ✅ GitHub Actions 설정됨
- ✅ Cron 스케줄 설정됨 (`0 7 * * *` = 오후 4:00 KST)
- ✅ Vercel Serverless로 실행

## 📊 결과 샘플

```
1. 반도체 - +5.20%
   중동 이슈로 인한 글로벌 리스크 회피 → 기술주 선호 강화
   지속성: 중기

2. 원유 - +4.80%
   유가 급등으로 에너지주 강세, 공급 우려
   지속성: 장기
```

## ✅ 완료 확인

### 로컬
- [ ] `npm run dev` 실행 가능
- [ ] http://localhost:3000 접속 가능
- [ ] "지금 분석하기" 버튼 동작

### 배포 후
- [ ] https://javis1.vercel.app 접속 가능
- [ ] API 응답 (< 30초)
- [ ] GitHub Actions 자동 실행 (매일 4:00 PM)

## 🎓 학습 자료

1. **Trader 역할**: `TRADER_AGENT.md`
   - BeautifulSoup 크롤링
   - 시장 분석 알고리즘

2. **PM 역할**: `PM_AGENT.md`
   - Google News API 통합
   - Claude API 프롬프트 엔지니어링

3. **QA 역할**: `VERIFICATION_AGENT.md`
   - GitHub Actions 워크플로우
   - 결과 검증 & 로깅

## 🔗 다음 단계

1. API 키 획득 → .env.local 설정
2. `npm install && npm run dev` 실행
3. 로컬 테스트 완료
4. `vercel --prod` 배포
5. 매일 4:00 PM 자동 결과 확인!

---

**준비 시간: 5분 | 배포 시간: 15분 | 총 20분**
