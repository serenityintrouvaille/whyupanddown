import axios from 'axios';

export interface MarketIndicators {
  oil: {
    price: number;
    change: number; // %
    lastUpdate: string;
  };
  exchangeRate: {
    usdKrw: number;
    change: number; // %
    lastUpdate: string;
  };
  gold: {
    price: number;
    change: number; // %
    lastUpdate: string;
  };
  kospi: {
    index: number;
    change: number; // %
    lastUpdate: string;
  };
  volatility: {
    vix: number; // VIX (미국)
    korvix: number; // KOR-VIX (한국)
    change: number; // %
    lastUpdate: string;
  };
}

export async function fetchMarketIndicators(): Promise<MarketIndicators> {
  try {
    // 모든 지표를 병렬로 가져오기 (무료 API 활용)
    const [exchangeRateRes] = await Promise.all([
      axios.get(
        'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=demo',
        { timeout: 5000 }
      ).catch(() => ({ data: {} }))
    ]);

    // 실제 API 또는 Mock 데이터
    let usdKrw = 1200;
    let exchangeChange = 0;

    if (exchangeRateRes.data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']) {
      const rate = parseFloat(
        exchangeRateRes.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
      );
      usdKrw = rate;
      exchangeChange = -0.3 + Math.random() * 0.6;
    }

    // Mock 데이터 (비용 최소화: 무료 API 우선)
    const mockOilPrice = 85.5 + Math.random() * 5;
    const mockOilChange = -0.5 + Math.random() * 1.5;

    const mockGoldPrice = 2050 + Math.random() * 50;
    const mockGoldChange = -0.3 + Math.random() * 1.2;

    const mockKospiIndex = 2800 + Math.random() * 100;
    const mockKospiChange = -0.4 + Math.random() * 1.0;

    const mockVix = 15 + Math.random() * 8;
    const mockKorVix = 18 + Math.random() * 10;
    const mockVolatilityChange = -0.2 + Math.random() * 0.8;

    return {
      oil: {
        price: mockOilPrice,
        change: mockOilChange,
        lastUpdate: new Date().toLocaleString('ko-KR')
      },
      exchangeRate: {
        usdKrw: usdKrw,
        change: exchangeChange,
        lastUpdate: new Date().toLocaleString('ko-KR')
      },
      gold: {
        price: mockGoldPrice,
        change: mockGoldChange,
        lastUpdate: new Date().toLocaleString('ko-KR')
      },
      kospi: {
        index: mockKospiIndex,
        change: mockKospiChange,
        lastUpdate: new Date().toLocaleString('ko-KR')
      },
      volatility: {
        vix: mockVix,
        korvix: mockKorVix,
        change: mockVolatilityChange,
        lastUpdate: new Date().toLocaleString('ko-KR')
      }
    };
  } catch (error) {
    console.error('Market indicators fetch failed:', error);

    // 기본 Mock 데이터
    return getMockIndicators();
  }
}

function getMockIndicators(): MarketIndicators {
  return {
    oil: {
      price: 88.5,
      change: 0.8,
      lastUpdate: new Date().toLocaleString('ko-KR')
    },
    exchangeRate: {
      usdKrw: 1202.5,
      change: -0.15,
      lastUpdate: new Date().toLocaleString('ko-KR')
    },
    gold: {
      price: 2075.50,
      change: 0.45,
      lastUpdate: new Date().toLocaleString('ko-KR')
    },
    kospi: {
      index: 2845.30,
      change: 0.62,
      lastUpdate: new Date().toLocaleString('ko-KR')
    },
    volatility: {
      vix: 16.5,
      korvix: 22.3,
      change: -0.8,
      lastUpdate: new Date().toLocaleString('ko-KR')
    }
  };
}

export function getOilImpactAnalysis(oilPrice: number, oilChange: number): string {
  if (oilChange > 2) {
    return '유가 급등으로 에너지/해운주 강세, 경기 불안 우려';
  } else if (oilChange > 0.5) {
    return '유가 상승으로 에너지주 수익성 개선 기대';
  } else if (oilChange > -0.5) {
    return '유가 안정적 추이, 경기 선행 업종 주목';
  } else if (oilChange > -2) {
    return '유가 하락으로 저유가 수혜주(항공/운송) 강세';
  } else {
    return '유가 급락으로 에너지주 약세, 수출주 강세';
  }
}

export function getExchangeRateImpactAnalysis(exchangeChange: number): string {
  if (exchangeChange > 0.5) {
    return '달러 강세로 수출주/기술주 강세, 수입주 약세';
  } else if (exchangeChange > 0) {
    return '원화 약세로 수출경쟁력 개선, 기술주 우호적';
  } else if (exchangeChange > -0.5) {
    return '환율 안정적, 일반 기업 실적에 큰 영향 없음';
  } else {
    return '원화 강세로 수출주 약세, 외국인 매수 주목';
  }
}

export function getGoldImpactAnalysis(change: number): string {
  if (change > 1) return '금값 급등, 안전자산 선호 강화 → 금융주 약세';
  if (change > 0.3) return '금값 상승, 인플레이션 우려 증가';
  if (change > -0.3) return '금값 안정적, 경제 신호 중립적';
  return '금값 하락, 리스크 선호 심화 → 성장주 강세';
}

export function getKospiContext(change: number): string {
  if (change > 1) return '코스피 강세, 시장 심리 긍정적';
  if (change > 0) return '코스피 소폭 상승, 기업 실적 개선 신호';
  if (change > -0.5) return '코스피 약세, 경기 둔화 우려';
  return '코스피 급락, 위험자산 회피 심화';
}

export function getVolatilityContext(vix: number, korvix: number): string {
  if (vix > 25 || korvix > 30) return '변동성 극도로 높음, 시장 불안정 심화';
  if (vix > 20 || korvix > 25) return '변동성 높음, 지정학적 리스크 높음';
  if (vix > 15 || korvix > 20) return '변동성 정상 범위, 시장 안정적';
  return '변동성 매우 낮음, 시장 침체 가능성';
}
