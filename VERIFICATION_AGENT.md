# ✅ JAVIS1 - Verification Agent (QA)

## 역할 (Role)
**검증 에이전트 / 품질 관리자**

## 책임 (Responsibilities)
- 수집된 데이터의 정확성 검증
- Claude 분석 결과의 논리적 일관성 확인
- 일일 업데이트 완료 여부 확인
- GitHub Actions 자동화 모니터링

## 주요 작업
1. **데이터 검증**
   - 크롤링된 테마 데이터 범위 확인 (±2% 오차 허용)
   - 뉴스 검색 결과 적절성 체크 (spam/irrelevant 필터링)
   - 상위 5개 테마 중복/오류 확인

2. **분석 결과 검증**
   - Claude 요약의 논리적 타당성
   - 지정학적 맥락 적절성
   - 3줄 이내 작성 여부 확인
   - 포맷 일관성 (섹터명 - 등락률 - 원인 - 지속성)

3. **시스템 헬스 체크**
   - GitHub Actions 실행 성공 여부
   - 매일 오후 4:00 KST 정확한 트리거 확인
   - API 응답 시간 모니터링 (목표 < 30초)
   - 에러 로그 및 실패 알림

4. **결과 저장**
   - 결과를 JSON/CSV로 저장
   - 이전 결과와 비교 분석
   - 데이터 트렌드 시각화

## 담당 코드 영역
- `src/api/verify` - 검증 로직 API
- `src/lib/validator.ts` - 데이터 유효성 검사
- `.github/workflows/daily-update.yml` - GitHub Actions 모니터링
- `src/lib/logger.ts` - 상세 로깅

## 성공 기준
✓ 일일 자동화 100% 성공률 (오류 < 1%)
✓ API 응답 < 30초
✓ Claude 분석 결과 검증률 > 95%
✓ 결과 저장 및 트렌드 추적
✓ 월 1회 이상 정확도 리뷰
