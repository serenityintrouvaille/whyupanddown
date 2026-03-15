import { Anthropic } from '@anthropic-ai/sdk';
import { STOCK_DEFINITIONS, STOCK_BY_ID, THEME_BY_ID, THEME_DEFINITIONS } from '@/data/middle-east-catalog';
import type { EventAnalysis, NewsArticle, MarketSignal } from '@/lib/middle-east-types';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

interface RawThemeResponse {
  id: string;
  rationale: string;
  confidence: number;
  newsWeight: number;
  stocks: Array<{
    stockId: string;
    reason: string;
  }>;
}

interface RawAnalysisResponse {
  title: string;
  summary: string;
  headlineBundle: string[];
  impactWindow: string;
  sentiment: 'risk-on' | 'risk-off' | 'mixed';
  confidence: number;
  keywords: string[];
  themes: RawThemeResponse[];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalizeScore(signal?: MarketSignal): number {
  if (!signal) {
    return 30;
  }
  const priceScore = clamp((signal.threeDayReturn + 10) * 4, 0, 100);
  const volumeScore = clamp(signal.volumeChange / 2, 0, 100);
  const volatilityPenalty = clamp(signal.volatility * 8, 0, 25);
  return clamp(priceScore * 0.55 + volumeScore * 0.45 - volatilityPenalty, 0, 100);
}

function keywordFallback(articles: NewsArticle[]): RawAnalysisResponse {
  const text = articles.map((article) => `${article.title} ${article.summary}`.toLowerCase()).join(' ');
  const themeIds = new Set<string>();

  for (const theme of THEME_DEFINITIONS) {
    if (theme.keywords.some((keyword) => text.includes(keyword.toLowerCase()))) {
      themeIds.add(theme.id);
    }
  }

  const fallbackThemes = [...themeIds].slice(0, 6).map((themeId) => {
    const stocks = STOCK_DEFINITIONS.filter((stock) => stock.themes.includes(themeId)).slice(0, 4);
    return {
      id: themeId,
      rationale: `${THEME_BY_ID[themeId].label} 테마가 최근 중동 긴장과 항로 리스크에 반응하고 있습니다.`,
      confidence: 65,
      newsWeight: 60,
      stocks: stocks.map((stock) => ({
        stockId: stock.id,
        reason: stock.rationale
      }))
    };
  });

  return {
    title: '중동 긴장 고조로 유가·해운·방산 테마 동시 부각',
    summary:
      '호르무즈 해협, 공습, 유가 급등 관련 뉴스가 겹치면서 조선, 해운, 방산 중심의 KOSPI 테마 강도가 커지고 있습니다.',
    headlineBundle: articles.slice(0, 3).map((article) => {
      if (article.topic.includes('hormuz')) return '호르무즈 해협 통항 리스크가 재부각됐습니다.';
      if (article.topic.includes('oil')) return '중동 전쟁 장기화 우려로 유가 변동성이 확대됐습니다.';
      if (article.topic.includes('strike')) return '이스라엘·이란 공습 보도가 위험자산 심리를 흔들고 있습니다.';
      return '중동 전쟁 관련 속보가 시장 변동성을 키우고 있습니다.';
    }),
    impactWindow: '1~3거래일',
    sentiment: 'mixed',
    confidence: 60,
    keywords: ['중동전쟁', '유가', '해운', '방산'],
    themes: fallbackThemes.length > 0 ? fallbackThemes : [
      {
        id: 'oil_refining',
        rationale: '현재 뉴스 흐름에서 가장 직접적인 전이 경로는 유가 변동성입니다.',
        confidence: 60,
        newsWeight: 70,
        stocks: ['s-oil', 'sk-innovation', 'gs-holdings'].map((stockId) => ({
          stockId,
          reason: STOCK_BY_ID[stockId].rationale
        }))
      }
    ]
  };
}

async function runClaudeAnalysis(articles: NewsArticle[]): Promise<RawAnalysisResponse> {
  const catalogText = THEME_DEFINITIONS.map((theme) => {
    const stocks = STOCK_DEFINITIONS.filter((stock) => stock.themes.includes(theme.id))
      .map((stock) => `${stock.id} (${stock.name}, ${stock.code})`)
      .join(', ');
    return `Theme ${theme.id}: ${theme.label}\nDescription: ${theme.description}\nStocks: ${stocks}`;
  }).join('\n\n');

  const articleText = articles
    .slice(0, 16)
    .map(
      (article, index) =>
        `${index + 1}. [${article.source}] ${article.title}\nSummary: ${article.summary || 'n/a'}\nPublished: ${article.publishedAt}`
    )
    .join('\n\n');

  const prompt = `당신은 중동전쟁 중심의 한국 주식 테마맵을 만드는 분석가입니다.

뉴스 묶음을 읽고 JSON만 출력하세요.

뉴스 묶음:
${articleText}

테마와 종목 카탈로그:
${catalogText}

지시:
- 가장 주목해야 할 최신 중동 이벤트를 한국어 제목 한 줄로 요약하세요.
- 가장 중요한 뉴스 3건을 한국어 문장으로 headlineBundle 배열에 넣으세요.
- 요약문도 반드시 한국어로 작성하세요.
- 제공된 카탈로그에서만 5~7개 테마를 고르세요.
- 각 테마마다 카탈로그에서만 3~5개 stockId를 고르세요.
- 유가, 해운, 방산, 관세, 환율, 호르무즈 해협 리스크와 연결이 구체적인 KOSPI 종목을 우선하세요.
- confidence와 newsWeight는 0~100 정수입니다.
- sentiment는 risk-on, risk-off, mixed 중 하나입니다.

JSON 형식:
{
  "title": "한국어 제목",
  "summary": "한국어 요약",
  "headlineBundle": ["한국어 뉴스 요약1", "한국어 뉴스 요약2", "한국어 뉴스 요약3"],
  "impactWindow": "한국어 지속기간",
  "sentiment": "risk-on | risk-off | mixed",
  "confidence": 0,
  "keywords": ["한국어 키워드"],
  "themes": [
    {
      "id": "theme id from catalog",
      "rationale": "한국어 설명",
      "confidence": 0,
      "newsWeight": 0,
      "stocks": [
        {
          "stockId": "stock id from catalog",
          "reason": "한국어 설명"
        }
      ]
    }
  ]
}`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1400,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0]?.type === 'text' ? message.content[0].text : '{}';
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch?.[0] || '{}') as RawAnalysisResponse;
}

export async function analyzeMiddleEastEvent(
  articles: NewsArticle[],
  signals: MarketSignal[]
): Promise<EventAnalysis> {
  const signalByStockId = Object.fromEntries(signals.map((signal) => [signal.stockId, signal]));

  let raw: RawAnalysisResponse;
  try {
    raw =
      process.env.ANTHROPIC_API_KEY && articles.length > 0
        ? await runClaudeAnalysis(articles)
        : keywordFallback(articles);
  } catch {
    raw = keywordFallback(articles);
  }

  const themes = (raw.themes || [])
    .filter((theme) => THEME_BY_ID[theme.id])
    .map((theme) => {
      const stocks = (theme.stocks || [])
        .filter((stock) => STOCK_BY_ID[stock.stockId])
        .map((stock) => ({
          stockId: stock.stockId,
          reason: stock.reason,
          score: normalizeScore(signalByStockId[stock.stockId])
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 4);

      const averageStockScore =
        stocks.reduce((sum, stock) => sum + stock.score, 0) / Math.max(stocks.length, 1);
      const score = clamp(averageStockScore * 0.6 + theme.newsWeight * 0.4, 0, 100);

      return {
        id: theme.id,
        label: THEME_BY_ID[theme.id].label,
        rationale: theme.rationale,
        confidence: clamp(theme.confidence, 0, 100),
        newsWeight: clamp(theme.newsWeight, 0, 100),
        stocks,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    title: raw.title || '중동 전쟁 이슈 클러스터',
    summary: raw.summary || '요약 정보가 없습니다.',
    headlineBundle: raw.headlineBundle?.slice(0, 3) || keywordFallback(articles).headlineBundle,
    impactWindow: raw.impactWindow || '1~3거래일',
    sentiment: raw.sentiment || 'mixed',
    confidence: clamp(raw.confidence || 60, 0, 100),
    keywords: raw.keywords?.slice(0, 8) || [],
    themes
  };
}
