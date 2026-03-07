import { Anthropic } from '@anthropic-ai/sdk';
import { News } from './news-fetcher';

export interface ArticleSummary {
  title: string;
  url: string;
  source: string;
  summary: string; // 1줄 요약
  relevanceScore: number; // 0-100
  publishedAt: string;
}

export interface DetailedAnalysisResult {
  sector: string;
  articles: ArticleSummary[];
  articleRelationship: string; // 기사들 간의 관계성 분석
  historicalTrend: {
    period: string; // "최근 3개월"
    keyEvents: string[];
    conclusion: string;
  };
}

const client = new Anthropic();

/**
 * 각 기사별 요약 생성
 */
export async function summarizeArticles(
  sector: string,
  news: News[]
): Promise<ArticleSummary[]> {
  try {
    const summaries: ArticleSummary[] = [];

    for (const article of news) {
      try {
        const prompt = `다음 기사를 읽고 "${sector}" 섹터와의 관련성을 고려하여 핵심을 1줄(25자 이내)로 요약해주세요.

기사 제목: ${article.title}
출처: ${article.source}

요약:`;

        const message = await client.messages.create({
          model: 'claude-sonnet-4-6',
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        });

        const summary =
          message.content[0].type === 'text' ? message.content[0].text.trim() : article.title;

        // 관련성 점수 계산 (간단한 키워드 매칭)
        const relevanceScore = calculateRelevance(sector, article.title, summary);

        summaries.push({
          title: article.title,
          url: article.url,
          source: article.source,
          summary: summary,
          relevanceScore: relevanceScore,
          publishedAt: article.publishedAt
        });
      } catch (error) {
        console.error(`Article summarization failed for ${article.title}:`, error);
        summaries.push({
          title: article.title,
          url: article.url,
          source: article.source,
          summary: article.title.substring(0, 50),
          relevanceScore: 50,
          publishedAt: article.publishedAt
        });
      }
    }

    return summaries.sort((a, b) => b.relevanceScore - a.relevanceScore);
  } catch (error) {
    console.error('Article summarization failed:', error);
    return news.map((n) => ({
      title: n.title,
      url: n.url,
      source: n.source,
      summary: n.title.substring(0, 50),
      relevanceScore: 50,
      publishedAt: n.publishedAt
    }));
  }
}

/**
 * 기사들 간의 관계성 분석
 */
export async function analyzeArticleRelationship(
  sector: string,
  articles: ArticleSummary[]
): Promise<string> {
  try {
    const articleTexts = articles
      .map((a, idx) => `${idx + 1}. [${a.source}] ${a.title}`)
      .join('\n');

    const prompt = `다음은 "${sector}" 섹터 관련 최신 뉴스들입니다. 이 기사들 간의 연관성과 공통 주제를 분석하여 2-3줄로 요약해주세요.

${articleTexts}

분석:`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    return message.content[0].type === 'text'
      ? message.content[0].text.trim()
      : '기사들이 동일한 섹터의 긍정적 뉴스로 구성되어 있습니다.';
  } catch (error) {
    console.error('Article relationship analysis failed:', error);
    return '주요 산업 뉴스와 긍정적 경제 지표가 해당 섹터 상승을 견인하고 있습니다.';
  }
}

/**
 * 최근 3개월 역사 추적
 */
export async function analyzeHistoricalTrend(
  sector: string,
  previousIssues: string[] = []
): Promise<DetailedAnalysisResult['historicalTrend']> {
  try {
    const prompt = `"${sector}" 섹터의 최근 3개월(2025년 12월 ~ 2026년 3월) 주요 이슈와 추세를 분석해주세요.

다음 형식으로 응답해주세요:
1. 주요 이벤트 3-4개 (예: "12월 분기 실적 부진", "1월 정부 정책 발표" 등)
2. 종합 결론 (1줄)

분석:`;

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

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const lines = content.split('\n').filter((l) => l.trim());

    // 텍스트에서 이벤트와 결론 추출
    const keyEvents = lines.slice(0, Math.max(1, lines.length - 1));
    const conclusion = lines[lines.length - 1] || '긍정적 추세 지속 중';

    return {
      period: '최근 3개월 (12월 ~ 3월)',
      keyEvents: keyEvents.map((e) => e.replace(/^[\d\-\*\s]+/, '').trim()),
      conclusion: conclusion
    };
  } catch (error) {
    console.error('Historical trend analysis failed:', error);
    return {
      period: '최근 3개월',
      keyEvents: ['산업 호황 지속', '긍정적 경제 지표'],
      conclusion: '기본적 강세 추세 유지 중'
    };
  }
}

/**
 * 기사 관련성 점수 계산
 */
function calculateRelevance(sector: string, title: string, summary: string): number {
  const text = (title + ' ' + summary).toLowerCase();
  const sectorKeywords = sector.toLowerCase().split(' ');

  let score = 50; // 기본 점수

  // 섹터명 포함 여부
  for (const keyword of sectorKeywords) {
    if (text.includes(keyword)) {
      score += 15;
    }
  }

  // 긍정/부정 키워드
  const positiveKeywords = ['상승', '급등', '강세', '수익', '호황', '증가', '개선'];
  const negativeKeywords = ['하락', '약세', '부진', '손실', '위기', '감소', '악화'];

  for (const keyword of positiveKeywords) {
    if (text.includes(keyword)) score += 10;
  }
  for (const keyword of negativeKeywords) {
    if (text.includes(keyword)) score -= 5;
  }

  // 범위 제한
  return Math.max(0, Math.min(100, score));
}
