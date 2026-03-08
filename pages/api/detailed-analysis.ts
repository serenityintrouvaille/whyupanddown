import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchThemeNews } from '@/lib/news-fetcher';
import {
  summarizeArticles,
  analyzeArticleRelationship,
  analyzeHistoricalTrend,
  DetailedAnalysisResult
} from '@/lib/detailed-analysis';
import { analyzeGeopoliticalContext } from '@/lib/geopolitical-analysis';
import { fetchMarketIndicators } from '@/lib/market-indicators';

interface ResponseData {
  success: boolean;
  data?: DetailedAnalysisResult & { geopolitical: any };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { sector } = req.body;

    if (!sector) {
      return res.status(400).json({ success: false, error: 'Sector is required' });
    }

    // 1. 뉴스 수집
    const news = await fetchThemeNews(sector);

    // 2. 각 기사별 요약
    const articles = await summarizeArticles(sector, news);

    // 3. 기사 관계성 분석
    const relationship = await analyzeArticleRelationship(sector, articles);

    // 4. 역사 추적
    const historicalTrend = await analyzeHistoricalTrend(
      sector,
      articles.map((a) => a.summary)
    );

    // 5. 국제 정세 & 매크로 경제 분석 (비용 최소화: 지표 수집 시)
    const indicators = await fetchMarketIndicators();
    const geopolitical = await analyzeGeopoliticalContext(sector, news, {
      oil: indicators.oil.price,
      exchangeRate: indicators.exchangeRate.usdKrw,
      gold: indicators.gold.price,
      kospi: indicators.kospi.index
    });

    const result = {
      sector: sector,
      articles: articles,
      articleRelationship: relationship,
      historicalTrend: historicalTrend,
      geopolitical: geopolitical
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('[DETAILED ANALYSIS ERROR]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
