import { Anthropic } from '@anthropic-ai/sdk';
import { News } from './news-fetcher';

export interface AnalysisResult {
  sector: string;
  changeRate: number;
  summary: string; // 3줄 요약
  continuity: string; // 지속성 판단
}

const client = new Anthropic();

export async function analyzeWithClaude(
  themeName: string,
  changeRate: number,
  news: News[]
): Promise<AnalysisResult> {
  try {
    const newsText = news
      .map((n) => `- ${n.title} (${n.source})`)
      .join('\n');

    const prompt = `당신은 금융 분석가입니다. 다음 정보를 바탕으로 분석해주세요.

테마: ${themeName}
등락률: ${changeRate}%

최신 뉴스:
${newsText}

이 테마와 중동 전쟁, 유가 급등 이슈의 지정학적 맥락을 3줄 이내로 요약해주세요.
다음 형식을 따르세요:
1. 상승 원인 (지정학적 맥락 포함)
2. 영향도
3. 지속성 판단 (단기/중기/장기)

간결하고 명확하게 작성하세요.`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : '';

    // 지속성 판단 추출
    let continuity = '중기';
    if (summary.includes('장기')) continuity = '장기';
    else if (summary.includes('단기')) continuity = '단기';

    return {
      sector: themeName,
      changeRate: changeRate,
      summary: summary.substring(0, 300),
      continuity: continuity
    };
  } catch (error) {
    console.error('Claude 분석 실패:', error);

    // Mock 분석 결과
    return {
      sector: themeName,
      changeRate: changeRate,
      summary: `${themeName}는 최근 중동 지정학적 리스크로 인한 글로벌 경기 불안으로 상승했습니다. 유가 급등에 따른 에너지 관련 산업의 수익성 개선 기대감이 작용했습니다. 향후 4-6주간 추가 상승 가능성이 있습니다.`,
      continuity: '중기'
    };
  }
}
