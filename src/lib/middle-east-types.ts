export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  topic: string;
}

export type NewsCategory =
  | 'OIL'
  | 'WAR'
  | 'US_STRIKE'
  | 'IRAN_ISRAEL'
  | 'WEAPON'
  | 'TARIFF_SANCTION'
  | 'HORMUZ'
  | 'SHIPPING'
  | 'SEMICONDUCTOR';

export type SignalThemeId =
  | 'defense'
  | 'oil'
  | 'energy'
  | 'shipping'
  | 'semiconductor'
  | 'materials';

export interface ClassifiedArticle extends NewsArticle {
  categories: NewsCategory[];
  relatedThemes: SignalThemeId[];
  severity: 'low' | 'medium' | 'high';
  alert: boolean;
  shortSummary: string;
}

export interface MarketSignal {
  stockId: string;
  code: string;
  price: number;
  threeDayReturn: number;
  volumeChange: number;
  volatility: number;
  asOf: string;
}

export interface AnalyzedStock {
  stockId: string;
  score: number;
  reason: string;
}

export interface AnalyzedTheme {
  id: string;
  label: string;
  rationale: string;
  confidence: number;
  newsWeight: number;
  stocks: AnalyzedStock[];
  score: number;
}

export interface EventAnalysis {
  title: string;
  summary: string;
  headlineBundle: string[];
  impactWindow: string;
  sentiment: 'risk-on' | 'risk-off' | 'mixed';
  confidence: number;
  keywords: string[];
  themes: AnalyzedTheme[];
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'event' | 'theme' | 'stock';
  score: number;
  subtitle?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
}

export interface RollingIngestPayload {
  timestamp: string;
  sourceCount: number;
  articles: NewsArticle[];
  event: EventAnalysis;
  marketSignals: MarketSignal[];
}

export interface DailySnapshotPayload extends RollingIngestPayload {
  date: string;
  trigger: 'cron' | 'admin';
  graph: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
}

export interface ThemeBoardItem {
  id: SignalThemeId;
  label: string;
  currentIssue: string;
  stockIds: string[];
  newsCount: number;
  articleIds: string[];
}

export interface StockBoardItem {
  stockId: string;
  code: string;
  name: string;
  themeId: SignalThemeId;
  rationale: string;
  relatedNews: ClassifiedArticle[];
  signal: MarketSignal | null;
}

export interface SignalBoard {
  updatedAt: string;
  alerts: ClassifiedArticle[];
  timeline: ClassifiedArticle[];
  themes: ThemeBoardItem[];
  defaultThemeId: SignalThemeId;
  stockBuckets: Record<string, StockBoardItem[]>;
}
