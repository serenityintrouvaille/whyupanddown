import { STOCK_BY_ID } from '@/data/middle-east-catalog';
import { BOARD_STOCK_IDS } from '@/lib/middle-east-board';
import { analyzeMiddleEastEvent } from '@/lib/middle-east-analyzer';
import { fetchSignalsForStocks } from '@/lib/middle-east-market';
import { fetchMiddleEastNews } from '@/lib/middle-east-news';
import { getRolling, saveRolling, saveSnapshot } from '@/lib/middle-east-storage';
import type {
  DailySnapshotPayload,
  GraphEdge,
  GraphNode,
  MarketSignal,
  RollingIngestPayload
} from '@/lib/middle-east-types';

function buildGraph(payload: RollingIngestPayload): DailySnapshotPayload['graph'] {
  const nodes: GraphNode[] = [
    {
      id: 'event:center',
      label: payload.event.title,
      type: 'event',
      score: payload.event.confidence,
      subtitle: payload.event.impactWindow
    }
  ];

  const edges: GraphEdge[] = [];
  const signalByStockId = Object.fromEntries(
    payload.marketSignals.map((signal) => [signal.stockId, signal])
  ) as Record<string, MarketSignal>;

  for (const theme of payload.event.themes) {
    nodes.push({
      id: `theme:${theme.id}`,
      label: theme.label,
      type: 'theme',
      score: theme.score,
      subtitle: `신뢰도 ${theme.confidence}%`
    });
    edges.push({
      source: 'event:center',
      target: `theme:${theme.id}`,
      weight: theme.score
    });

    for (const stock of theme.stocks) {
      const stockMeta = STOCK_BY_ID[stock.stockId];
      const signal = signalByStockId[stock.stockId];
      nodes.push({
        id: `stock:${stock.stockId}`,
        label: stockMeta.name,
        type: 'stock',
        score: stock.score,
        subtitle: `${signal?.threeDayReturn.toFixed(1) || '0.0'}% / ${stockMeta.code}`
      });
      edges.push({
        source: `theme:${theme.id}`,
        target: `stock:${stock.stockId}`,
        weight: stock.score
      });
    }
  }

  const dedupedNodes = nodes.filter(
    (node, index) => nodes.findIndex((candidate) => candidate.id === node.id) === index
  );

  return {
    nodes: dedupedNodes,
    edges
  };
}

export async function runRollingIngest(): Promise<RollingIngestPayload> {
  const articles = await fetchMiddleEastNews();
  const initialSignals = await fetchSignalsForStocks(
    Object.keys(STOCK_BY_ID).slice(0, 6)
  );
  const initialEvent = await analyzeMiddleEastEvent(articles, initialSignals);

  const selectedStockIds = [
    ...initialEvent.themes.flatMap((theme) => theme.stocks.map((stock) => stock.stockId)),
    ...BOARD_STOCK_IDS
  ];
  const marketSignals = await fetchSignalsForStocks(selectedStockIds);
  const event = await analyzeMiddleEastEvent(articles, marketSignals);

  const payload: RollingIngestPayload = {
    timestamp: new Date().toISOString(),
    sourceCount: new Set(articles.map((article) => article.source)).size,
    articles: articles.slice(0, 24),
    event,
    marketSignals
  };

  await saveRolling(payload);
  return payload;
}

export async function runDailySnapshot(
  trigger: 'cron' | 'admin'
): Promise<DailySnapshotPayload> {
  const rolling = (await getRolling()) || (await runRollingIngest());
  const payload: DailySnapshotPayload = {
    ...rolling,
    date: new Date().toISOString().slice(0, 10),
    trigger,
    graph: buildGraph(rolling)
  };

  await saveSnapshot(payload);
  return payload;
}
