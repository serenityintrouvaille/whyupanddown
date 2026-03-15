import axios from 'axios';
import * as cheerio from 'cheerio';
import { STOCK_BY_ID } from '@/data/middle-east-catalog';
import type { MarketSignal } from '@/lib/middle-east-types';

interface PricePoint {
  close: number;
  volume: number;
}

function average(values: number[]): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function stdev(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }
  const avg = average(values);
  const variance =
    values.reduce((sum, value) => sum + Math.pow(value - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

async function fetchSeries(code: string): Promise<PricePoint[]> {
  const url = `https://finance.naver.com/item/sise_day.naver?code=${code}&page=1`;
  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0'
    },
    timeout: 10000
  });

  const $ = cheerio.load(response.data);
  const rows: PricePoint[] = [];

  $('table.type2 tr').each((_, element) => {
    const tds = $(element).find('td');
    if (tds.length < 7) {
      return;
    }

    const closeText = $(tds[1]).text().replace(/,/g, '').trim();
    const volumeText = $(tds[6]).text().replace(/,/g, '').trim();
    const close = Number(closeText);
    const volume = Number(volumeText);

    if (Number.isFinite(close) && close > 0 && Number.isFinite(volume)) {
      rows.push({ close, volume });
    }
  });

  return rows.slice(0, 4);
}

function computeSignal(stockId: string, series: PricePoint[]): MarketSignal {
  const stock = STOCK_BY_ID[stockId];
  const latest = series[0] || { close: 0, volume: 0 };
  const base = series[3] || series[series.length - 1] || latest;
  const recentVolumes = series.slice(0, 3).map((point) => point.volume);
  const recentReturns = series.slice(0, 3).flatMap((point, index) => {
    const next = series[index + 1];
    if (!next || !next.close) {
      return [];
    }
    return [((point.close - next.close) / next.close) * 100];
  });

  const threeDayReturn = base.close ? ((latest.close - base.close) / base.close) * 100 : 0;
  const volumeChange = base.volume ? ((average(recentVolumes) - base.volume) / base.volume) * 100 : 0;
  const volatility = stdev(recentReturns);

  return {
    stockId,
    code: stock.code,
    price: latest.close,
    threeDayReturn,
    volumeChange,
    volatility,
    asOf: new Date().toISOString()
  };
}

function mockSignal(stockId: string): MarketSignal {
  const stock = STOCK_BY_ID[stockId];
  return {
    stockId,
    code: stock.code,
    price: 50000 + Math.random() * 200000,
    threeDayReturn: -2 + Math.random() * 8,
    volumeChange: -20 + Math.random() * 180,
    volatility: 0.5 + Math.random() * 4,
    asOf: new Date().toISOString()
  };
}

export async function fetchSignalsForStocks(stockIds: string[]): Promise<MarketSignal[]> {
  const uniqueIds = [...new Set(stockIds)].filter((stockId) => STOCK_BY_ID[stockId]);
  const settled = await Promise.allSettled(
    uniqueIds.map(async (stockId) => {
      try {
        const series = await fetchSeries(STOCK_BY_ID[stockId].code);
        if (series.length < 2) {
          return mockSignal(stockId);
        }
        return computeSignal(stockId, series);
      } catch {
        return mockSignal(stockId);
      }
    })
  );

  return settled
    .filter((item): item is PromiseFulfilledResult<MarketSignal> => item.status === 'fulfilled')
    .map((item) => item.value);
}
