import type { NextApiRequest, NextApiResponse } from 'next';
import {
  fetchMarketIndicators,
  getOilImpactAnalysis,
  getExchangeRateImpactAnalysis,
  MarketIndicators
} from '@/lib/market-indicators';

interface ResponseData {
  success: boolean;
  data?: {
    indicators: MarketIndicators;
    analysis: {
      oilImpact: string;
      exchangeRateImpact: string;
    };
  };
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  try {
    const indicators = await fetchMarketIndicators();

    const analysis = {
      oilImpact: getOilImpactAnalysis(indicators.oil.price, indicators.oil.change),
      exchangeRateImpact: getExchangeRateImpactAnalysis(indicators.exchangeRate.change)
    };

    res.status(200).json({
      success: true,
      data: {
        indicators: indicators,
        analysis: analysis
      }
    });
  } catch (error) {
    console.error('[MARKET INDICATORS ERROR]', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
