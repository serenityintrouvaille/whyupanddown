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
      goldImpact: string;
      kospiContext: string;
      volatilityContext: string;
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
      exchangeRateImpact: getExchangeRateImpactAnalysis(indicators.exchangeRate.change),
      goldImpact: getGoldImpactAnalysis(indicators.gold.change),
      kospiContext: getKospiContext(indicators.kospi.change),
      volatilityContext: getVolatilityContext(indicators.volatility.vix, indicators.volatility.korvix)
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

function getGoldImpactAnalysis(change: number): string {
  if (change > 1) return '금값 급등, 안전자산 선호 강화 → 금융주 약세';
  if (change > 0.3) return '금값 상승, 인플레이션 우려 증가';
  if (change > -0.3) return '금값 안정적, 경제 신호 중립적';
  return '금값 하락, 리스크 선호 심화 → 성장주 강세';
}

function getKospiContext(change: number): string {
  if (change > 1) return '코스피 강세, 시장 심리 긍정적';
  if (change > 0) return '코스피 소폭 상승, 기업 실적 개선 신호';
  if (change > -0.5) return '코스피 약세, 경기 둔화 우려';
  return '코스피 급락, 위험자산 회피 심화';
}

function getVolatilityContext(vix: number, korvix: number): string {
  if (vix > 25 || korvix > 30) return '변동성 극도로 높음, 시장 불안정 심화';
  if (vix > 20 || korvix > 25) return '변동성 높음, 지정학적 리스크 높음';
  if (vix > 15 || korvix > 20) return '변동성 정상 범위, 시장 안정적';
  return '변동성 매우 낮음, 시장 침체 가능성';
}
