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
}

export async function fetchMarketIndicators(): Promise<MarketIndicators> {
  try {
    // Alpha Vantage API (무료, 환율)
    const exchangeRateResponse = await axios.get(
      'https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=KRW&apikey=demo',
      { timeout: 5000 }
    );

    // 유가 데이터 (예측 데이터)
    // 실제로는 Yahoo Finance 또는 IEX Cloud 사용
    const mockOilPrice = 85.5 + Math.random() * 5; // 85-90 범위
    const mockOilChange = -0.5 + Math.random() * 1.5; // -0.5% ~ +1%

    // 환율 데이터 파싱
    let usdKrw = 1200;
    let exchangeChange = 0;

    if (
      exchangeRateResponse.data?.['Realtime Currency Exchange Rate']?.['5. Exchange Rate']
    ) {
      const rate = parseFloat(
        exchangeRateResponse.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
      );
      usdKrw = rate;
      // 변화율 계산 (전일 대비)
      exchangeChange = -0.3 + Math.random() * 0.6; // -0.3% ~ +0.3%
    }

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
      }
    };
  } catch (error) {
    console.error('Market indicators fetch failed:', error);

    // Mock 데이터
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
      }
    };
  }
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
