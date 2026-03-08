import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/globals.css';

interface Result {
  sector: string;
  changeRate: number;
  summary: string;
  continuity: string;
}

interface MarketIndicators {
  oil: { price: number; change: number };
  exchangeRate: { usdKrw: number; change: number };
  gold: { price: number; change: number };
  kospi: { index: number; change: number };
  volatility: { vix: number; korvix: number; change: number };
}

interface DetailedAnalysis {
  sector: string;
  articles: any[];
  articleRelationship: string;
  historicalTrend: any;
  geopolitical?: any;
}

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detailed'>('overview');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<DetailedAnalysis | null>(null);
  const [marketIndicators, setMarketIndicators] = useState<MarketIndicators | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [resultsRes, indicatorsRes] = await Promise.all([
        axios.get('/api/results').catch(() => ({ data: { success: false } })),
        axios.get('/api/market-indicators').catch(() => ({ data: { success: false } }))
      ]);

      if (resultsRes.data.success) {
        setResults(resultsRes.data.data);
      }
      if (indicatorsRes.data.success) {
        setMarketIndicators(indicatorsRes.data.data.indicators);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/update');
      if (response.data.success) {
        setResults(response.data);
        await new Promise((r) => setTimeout(r, 1000));
        await fetchInitialData();
      } else {
        setError(response.data.error || 'Update failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (sector: string) => {
    setSelectedSector(sector);
    setLoading(true);
    try {
      const response = await axios.post('/api/detailed-analysis', { sector });
      if (response.data.success) {
        setDetailedAnalysis(response.data.data);
        setActiveTab('detailed');
      }
    } catch (err) {
      setError('상세 분석을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', padding: '20px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* 헤더 */}
        <div className="header">
          <div>
            <h1>📊 Why Up & Down</h1>
            <p>그날의 수혜주가 왜 올랐는지 요약해주는 AI 금융 비서</p>
          </div>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span> 분석 중..
              </>
            ) : (
              '📈 지금 분석하기'
            )}
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* 탭 */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? '#3b82f6' : 'transparent',
              color: activeTab === 'overview' ? '#ffffff' : '#6b7280',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              marginRight: '10px',
              borderRadius: '8px',
              fontWeight: 500
            }}
          >
            📈 오늘의 수혜주
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            style={{
              background: activeTab === 'detailed' ? '#3b82f6' : 'transparent',
              color: activeTab === 'detailed' ? '#ffffff' : '#6b7280',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '8px',
              fontWeight: 500,
              opacity: !selectedSector ? 0.5 : 1
            }}
            disabled={!selectedSector}
          >
            📊 상세 분석
          </button>
        </div>

        {/* 국제 지표 & 시장 현황 */}
        {marketIndicators && (
          <div className="section">
            <h2>🌍 국제 지표 & 시장 현황</h2>
            <div className="grid grid-3">
              {/* 유가 */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">🛢️ 유가 (WTI)</div>
                  <div className="value">${marketIndicators.oil.price.toFixed(2)}</div>
                  <div className={`change ${marketIndicators.oil.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.oil.change > 0 ? '+' : ''}
                    {marketIndicators.oil.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 환율 */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">💵 USD/KRW</div>
                  <div className="value">{marketIndicators.exchangeRate.usdKrw.toFixed(0)}</div>
                  <div className={`change ${marketIndicators.exchangeRate.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.exchangeRate.change > 0 ? '+' : ''}
                    {marketIndicators.exchangeRate.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* 금값 */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">🏆 금값 (XAU/USD)</div>
                  <div className="value">${marketIndicators.gold.price.toFixed(0)}</div>
                  <div className={`change ${marketIndicators.gold.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.gold.change > 0 ? '+' : ''}
                    {marketIndicators.gold.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* KOSPI */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">📈 KOSPI 지수</div>
                  <div className="value">{marketIndicators.kospi.index.toFixed(0)}</div>
                  <div className={`change ${marketIndicators.kospi.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.kospi.change > 0 ? '+' : ''}
                    {marketIndicators.kospi.change.toFixed(2)}%
                  </div>
                </div>
              </div>

              {/* VIX */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">📉 VIX (미국 변동성)</div>
                  <div className="value">{marketIndicators.volatility.vix.toFixed(1)}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    {marketIndicators.volatility.vix > 20 ? '⚠️ 높음' : '✅ 정상'}
                  </div>
                </div>
              </div>

              {/* KOR-VIX */}
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">📉 KOR-VIX (한국 변동성)</div>
                  <div className="value">{marketIndicators.volatility.korvix.toFixed(1)}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
                    {marketIndicators.volatility.korvix > 25 ? '⚠️ 높음' : '✅ 정상'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오늘의 수혜주 */}
        {activeTab === 'overview' && results && (
          <div className="section">
            <h2>📈 오늘의 수혜주 Top 5</h2>
            <div className="grid grid-1">
              {results.results?.map((result: Result, idx: number) => (
                <div key={idx} className="card card-glow">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                        {result.sector}
                      </div>
                      <div
                        style={{
                          fontSize: '24px',
                          fontWeight: 700,
                          color: result.changeRate > 0 ? '#10b981' : '#ef4444',
                          marginBottom: '8px'
                        }}
                      >
                        {result.changeRate > 0 ? '+' : ''}
                        {result.changeRate.toFixed(2)}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '15px', lineHeight: '1.5' }}>
                    {result.summary}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="badge badge-primary" style={{ fontSize: '11px' }}>
                      {result.continuity}
                    </span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleViewDetails(result.sector)}
                      style={{ fontSize: '12px', padding: '6px 12px' }}
                    >
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {results.formatted && (
              <div className="section" style={{ marginTop: '40px' }}>
                <h3 style={{ marginBottom: '15px' }}>📊 일일 분석 리포트</h3>
                <div className="card">
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontSize: '12px',
                      color: '#6b7280'
                    }}
                  >
                    {results.formatted}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상세 분석 */}
        {activeTab === 'detailed' && detailedAnalysis && (
          <div className="section">
            <h2>🔍 {detailedAnalysis.sector} - 상세 분석</h2>

            {/* 기사 요약 */}
            {detailedAnalysis.articles && detailedAnalysis.articles.length > 0 && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  📰 관련 기사 ({detailedAnalysis.articles.length}개)
                </h3>
                <div className="table-wrapper">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>제목</th>
                        <th>요약</th>
                        <th>관련도</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailedAnalysis.articles.map((article: any, idx: number) => (
                        <tr key={idx}>
                          <td>{article.title || '제목 없음'}</td>
                          <td>{article.summary || '요약 없음'}</td>
                          <td>{article.relevanceScore || 0}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 기사 관계성 */}
            {detailedAnalysis.articleRelationship && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  🔗 기사 관계성 분석
                </h3>
                <div className="card">
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    {detailedAnalysis.articleRelationship}
                  </p>
                </div>
              </div>
            )}

            {/* 역사 추적 */}
            {detailedAnalysis.historicalTrend && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  📅 최근 3개월 역사
                </h3>
                <div className="card">
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.6' }}>
                    {detailedAnalysis.historicalTrend.period || ''}
                  </p>
                  {detailedAnalysis.historicalTrend.keyEvents && (
                    <ul style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px' }}>
                      {detailedAnalysis.historicalTrend.keyEvents.map((event: string, idx: number) => (
                        <li key={idx}>- {event}</li>
                      ))}
                    </ul>
                  )}
                  <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '10px', fontWeight: 600 }}>
                    결론: {detailedAnalysis.historicalTrend.conclusion || ''}
                  </p>
                </div>
              </div>
            )}

            {/* 지정학적 분석 */}
            {detailedAnalysis.geopolitical && (
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                  🌐 국제 정세 & 매크로 경제 분석
                </h3>

                {/* 국제 정세 이슈 */}
                {detailedAnalysis.geopolitical.internationalIssues && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
                      🔴 국제 정세 이슈
                    </h4>
                    <ul style={{ fontSize: '13px', color: '#6b7280' }}>
                      {detailedAnalysis.geopolitical.internationalIssues.map((issue: string, idx: number) => (
                        <li key={idx}>- {issue}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 매크로 경제 요인 */}
                {detailedAnalysis.geopolitical.macroeconomicFactors && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
                      📊 매크로 경제 요인
                    </h4>
                    <ul style={{ fontSize: '13px', color: '#6b7280' }}>
                      {detailedAnalysis.geopolitical.macroeconomicFactors.map((factor: string, idx: number) => (
                        <li key={idx}>- {factor}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 주요국 움직임 */}
                {detailedAnalysis.geopolitical.countryMovements && (
                  <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 500, marginBottom: '10px' }}>
                      🌍 주요국 움직임
                    </h4>
                    <div className="grid grid-2" style={{ gap: '10px' }}>
                      <div className="card" style={{ padding: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>🇺🇸 미국</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {detailedAnalysis.geopolitical.countryMovements.usa || ''}
                        </p>
                      </div>
                      <div className="card" style={{ padding: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>🇰🇷 한국</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {detailedAnalysis.geopolitical.countryMovements.korea || ''}
                        </p>
                      </div>
                      <div className="card" style={{ padding: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>🇨🇳 중국</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {detailedAnalysis.geopolitical.countryMovements.china || ''}
                        </p>
                      </div>
                      <div className="card" style={{ padding: '10px' }}>
                        <p style={{ fontSize: '12px', fontWeight: 600, marginBottom: '5px' }}>🇪🇺 유럽</p>
                        <p style={{ fontSize: '12px', color: '#6b7280' }}>
                          {detailedAnalysis.geopolitical.countryMovements.europe || ''}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 종합 분석 */}
                {detailedAnalysis.geopolitical.synthesis && (
                  <div style={{ marginBottom: '20px', backgroundColor: '#f3f4f6', padding: '15px', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '10px' }}>
                      💡 종합 분석
                    </h4>
                    <p style={{ fontSize: '13px', color: '#1f2937', lineHeight: '1.6' }}>
                      {detailedAnalysis.geopolitical.synthesis}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
