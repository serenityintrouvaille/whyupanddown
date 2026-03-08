import { Anthropic } from '@anthropic-ai/sdk';

export interface GeopoliticalContext {
  internationalIssues: string[];
  macroeconomicFactors: string[];
  countryMovements: {
    usa: string;
    korea: string;
    china: string;
    europe: string;
  };
  synthesis: string; // 모두를 종합한 최종 분석
}

const client = new Anthropic();

/**
 * 국제 정세, 매크로 경제, 주요국 움직임을 기반으로 고도화된 분석
 */
export async function analyzeGeopoliticalContext(
  sector: string,
  news: Array<{ title: string }>,
  indicators: {
    oil: number;
    exchangeRate: number;
    gold: number;
    kospi: number;
  }
): Promise<GeopoliticalContext> {
  try {
    const newsText = news.map((n) => `- ${n.title}`).join('\n');

    const prompt = `당신은 국제 정세 분석 전문가입니다. 다음 정보를 바탕으로 "${sector}" 섹터의 상승을 분석해주세요.

## 시장 지표
- 유가: $${indicators.oil}
- USD/KRW: ${indicators.exchangeRate}
- 금값: $${indicators.gold}/oz
- KOSPI: ${indicators.kospi}

## 관련 뉴스
${newsText}

## 분석 요청

1. **국제 정세 이슈** (2-3개)
   - 중동 정세, 러시아-우크라이나, US-China 무역, 테러 위협 등

2. **매크로 경제 요인** (2-3개)
   - 금리, 인플레이션, 경기 사이클, 유동성, 환율 등

3. **주요국 움직임**
   - **미국**: 연방 정책, 기술 규제, 경기 신호
   - **한국**: 기업 실적, 정책, 시장 심리
   - **중국**: 경제 부양, 규제, 기술 개발
   - **유럽**: 에너지 위기, EU 규제, 경제 회복

4. **종합 분석**
   - 위 모든 요소가 "${sector}"에 미치는 영향을 2-3줄로 요약

JSON 형식으로 응답해주세요:
{
  "internationalIssues": ["이슈1", "이슈2"],
  "macroeconomicFactors": ["요인1", "요인2"],
  "countryMovements": {
    "usa": "미국의 움직임",
    "korea": "한국의 움직임",
    "china": "중국의 움직임",
    "europe": "유럽의 움직임"
  },
  "synthesis": "종합 분석"
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';

    try {
      // JSON 추출 시도
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : getMockGeopoliticalAnalysis(sector);
      return parsed;
    } catch {
      return getMockGeopoliticalAnalysis(sector);
    }
  } catch (error) {
    console.error('Geopolitical analysis failed:', error);
    return getMockGeopoliticalAnalysis(sector);
  }
}

function getMockGeopoliticalAnalysis(sector: string): GeopoliticalContext {
  const analyses: { [key: string]: GeopoliticalContext } = {
    '반도체': {
      internationalIssues: [
        '미국-중국 반도체 패권 경쟁 심화',
        '미국의 첨단 반도체 통제 강화 (EUV 장비 규제)',
        '일본의 반도체 수출 규제 강화'
      ],
      macroeconomicFactors: [
        '글로벌 AI 수요 급증으로 수익성 개선',
        '메모리칩 수급 균형 회복',
        '원화 약세로 수출경쟁력 향상'
      ],
      countryMovements: {
        usa: '첨단 반도체 산업 육성 정책, CHIPS 법안 지원 강화',
        korea: '한국 반도체 3사의 글로벌 시장점유율 회복',
        china: '자체 반도체 개발 가속화, 미국 규제 우회 노력',
        europe: 'Intel 공장 확대, EU 반도체 자급률 제고 목표'
      },
      synthesis: '미국의 중국 견제, 글로벌 AI 수요 증가, 한국의 기술 우위가 맞물려 반도체주 강세 지속될 것으로 예상됨'
    },
    '원유': {
      internationalIssues: [
        '중동 정세 긴장으로 유가 상승',
        'OPEC+ 감산 정책 유지',
        '러시아 원유 수출 제약'
      ],
      macroeconomicFactors: [
        '글로벌 경기 회복으로 수요 증가',
        '달러 약세로 유가 상승 가능성',
        '인플레이션 우려로 금리 인상 가능'
      ],
      countryMovements: {
        usa: '셰일유 생산 증가, 에너지 독립 강화',
        korea: '에너지 수입 의존도 높음, 에너지 효율 정책 강화',
        china: '석유 수입 감소, 신재생 에너지 전환',
        europe: '러시아산 원유 의존도 감소, 에너지 전환 가속'
      },
      synthesis: '중동 리스크와 OPEC+ 감산으로 유가 상승세 지속, 에너지주 및 에너지 관련 산업 호황 예상'
    },
    '금': {
      internationalIssues: [
        '중앙은행의 금 매입 증가 (지정학적 리스크 회피)',
        '미국 금리 인상 여부 불명확성',
        '달러 약세 가능성'
      ],
      macroeconomicFactors: [
        '인플레이션 우려로 금의 안전자산 선호',
        '실질금리 저하로 금 가치 상승',
        '글로벌 유동성 완화 신호'
      ],
      countryMovements: {
        usa: '금리 정책 불확실성으로 금 수요 증가',
        korea: '달러 약세시 금 수입 원가 하락',
        china: '중앙은행 금 매입 확대',
        europe: '경제 약세로 안전자산 선호'
      },
      synthesis: '지정학적 불확실성과 중앙은행 수요로 금값 상승세 지속, 금광주 및 귀금속주 강세 예상'
    }
  };

  return analyses[sector] || analyses['반도체'];
}
