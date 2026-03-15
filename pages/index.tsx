import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { STOCK_BY_ID } from '@/data/middle-east-catalog';
import type {
  ClassifiedArticle,
  DailySnapshotPayload,
  RollingIngestPayload,
  SignalBoard,
  SignalThemeId
} from '@/lib/middle-east-types';
import { getSupabaseBrowserClient } from '@/lib/supabase-browser';

interface ResultsResponse {
  success: boolean;
  data?: {
    snapshot: DailySnapshotPayload | null;
    rolling: RollingIngestPayload | null;
    board: SignalBoard | null;
  };
  error?: string;
}

function severityLabel(value: ClassifiedArticle['severity']) {
  if (value === 'high') return '높음';
  if (value === 'medium') return '중간';
  return '낮음';
}

function formatTime(value: string) {
  return new Date(value).toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function themeLabel(themeId: SignalThemeId) {
  return {
    defense: '방산',
    oil: '유가',
    energy: '에너지',
    shipping: '해운/물류',
    semiconductor: '반도체',
    materials: '원자재'
  }[themeId];
}

export default function Home() {
  const [board, setBoard] = useState<SignalBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedThemeId, setSelectedThemeId] = useState<SignalThemeId>('defense');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await axios.get<ResultsResponse>('/api/results');
        if (response.data.success && response.data.data?.board) {
          setBoard(response.data.data.board);
          setSelectedThemeId(response.data.data.board.defaultThemeId);
        }
      } catch {
        setError('피드를 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    void fetchResults();
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    const refresh = async () => {
      try {
        const response = await axios.get<ResultsResponse>('/api/results');
        if (response.data.success && response.data.data?.board) {
          setBoard(response.data.data.board);
        }
      } catch {}
    };

    const channel = supabase
      .channel('middle-east-feed-live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'rolling_updates' },
        refresh
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'daily_snapshots' },
        refresh
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const selectedTheme = useMemo(
    () => board?.themes.find((theme) => theme.id === selectedThemeId) || board?.themes[0] || null,
    [board, selectedThemeId]
  );

  const selectedStocks = useMemo(
    () => (selectedTheme ? board?.stockBuckets[selectedTheme.id] || [] : []),
    [board, selectedTheme]
  );

  return (
    <div className="feed-shell">
      <header className="topbar">
        <div>
          <h1>Middle East War Signal Map</h1>
        </div>
        <div className="status-card">
          <span>마지막 업데이트</span>
          <strong>{board ? formatTime(board.updatedAt) : '-'}</strong>
          <small>실시간 수집 5~10분 간격</small>
        </div>
      </header>

      {error && <div className="banner error">{error}</div>}
      {loading && <div className="banner">피드를 불러오는 중입니다.</div>}

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">RED SIGN ALERT</p>
            <h2>오늘의 핵심 Alert</h2>
          </div>
        </div>

        <div className="alert-grid">
          {(board?.alerts || []).map((article) => (
            <a key={article.id} className="alert-card" href={article.url} target="_blank" rel="noreferrer">
              <div className="alert-dot" />
              <div className="alert-meta">
                <span>{formatTime(article.publishedAt)}</span>
                <span>{article.source}</span>
              </div>
              <strong>{article.title}</strong>
              <p>{article.shortSummary}</p>
              <div className="tag-row">
                {article.relatedThemes.map((theme) => (
                  <span key={theme} className="tag">
                    {themeLabel(theme)}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">실시간 뉴스 타임라인</p>
          </div>
        </div>

        <div className="timeline">
          {(board?.timeline || []).map((article) => (
            <a key={article.id} className="timeline-row" href={article.url} target="_blank" rel="noreferrer">
              <div className="timeline-left">
                <span className={`timeline-dot ${article.alert ? 'alert' : ''}`} />
                <span className="timeline-line" />
              </div>
              <div className="timeline-card">
                <div className="timeline-top">
                  <span className="timeline-time">{formatTime(article.publishedAt)}</span>
                  <span className={`severity ${article.severity}`}>중요도 {severityLabel(article.severity)}</span>
                </div>
                <strong>{article.title}</strong>
                <p>{article.shortSummary}</p>
                <div className="timeline-bottom">
                  <span>{article.source}</span>
                  <div className="tag-row">
                    {article.relatedThemes.map((theme) => (
                      <span key={`${article.id}-${theme}`} className="tag subtle">
                        {themeLabel(theme)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">주식 테마맵</p>
            <h2>테마주 관련 뉴스 모아보기</h2>
          </div>
        </div>

        <div className="theme-grid">
          {(board?.themes || []).map((theme) => (
            <button
              key={theme.id}
              type="button"
              className={`theme-tile ${selectedTheme?.id === theme.id ? 'active' : ''}`}
              onClick={() => setSelectedThemeId(theme.id)}
            >
              <div className="theme-tile-top">
                <strong>{theme.label}</strong>
                <span>{theme.newsCount}건</span>
              </div>
              <p>{theme.currentIssue}</p>
              <div className="tag-row">
                {theme.stockIds.slice(0, 4).map((stockId) => (
                  <span key={stockId} className="tag subtle">
                    {STOCK_BY_ID[stockId]?.name || stockId}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div>
            <p className="eyebrow">종목별 연관 뉴스</p>
            <h2>{selectedTheme?.label || '선택된 테마'} 대표 종목</h2>
          </div>
        </div>

        <div className="stock-grid">
          {selectedStocks.map((stock) => (
            <article key={stock.stockId} className="stock-card">
              <div className="stock-head">
                <div>
                  <strong>{stock.name}</strong>
                  <span>{stock.code}</span>
                </div>
                <div className="stock-signal">
                  <span>{selectedTheme?.label}</span>
                  <strong>{stock.signal ? `${stock.signal.threeDayReturn.toFixed(1)}%` : '-'}</strong>
                </div>
              </div>
              <p className="stock-rationale">{stock.rationale}</p>
              <div className="mini-stats">
                <span>3일 수익률 {stock.signal?.threeDayReturn.toFixed(1) ?? '-'}%</span>
                <span>거래대금 변화 {stock.signal?.volumeChange.toFixed(1) ?? '-'}%</span>
                <span>변동성 {stock.signal?.volatility.toFixed(1) ?? '-'}%</span>
              </div>
              <div className="stock-timeline">
                {stock.relatedNews.slice(0, 5).map((article, index, list) => (
                  <a
                    key={`${stock.stockId}-${article.id}`}
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="stock-timeline-item"
                  >
                    <div className="stock-timeline-left">
                      <span className={`timeline-dot ${article.alert ? 'alert' : ''}`} />
                      {index !== list.length - 1 && <span className="timeline-line" />}
                    </div>
                    <div className="linked-news">
                      <div className="linked-news-top">
                        <span>{formatTime(article.publishedAt)}</span>
                        <span>{article.source}</span>
                      </div>
                      <strong>{article.title}</strong>
                      <p>{article.shortSummary}</p>
                    </div>
                  </a>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
