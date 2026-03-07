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
}

interface DetailedAnalysis {
  sector: string;
  articles: any[];
  articleRelationship: string;
  historicalTrend: any;
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
        axios.get('/api/results'),
        axios.get('/api/market-indicators')
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
            <p>그날의 수혜주가 왜 올랐는지를 요약해주는 AI 금융 비서</p>
          </div>
          <button className="btn btn-primary" onClick={handleUpdate} disabled={loading}>
            {loading ? (
              <>
                <span className="loading"></span> 분석 중...
              </>
            ) : (
              '🔄 지금 분석하기'
            )}
          </button>
        </div>

        {error && <div className="error-message">⚠️ {error}</div>}

        {/* 탭 */}
        <div style={{ marginBottom: '30px', borderBottom: '1px solid #262b3d' }}>
          <button
            onClick={() => setActiveTab('overview')}
            style={{
              background: activeTab === 'overview' ? '#6366f1' : 'transparent',
              color: '#e2e8f0',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              marginRight: '10px',
              borderRadius: '8px'
            }}
          >
            📈 오늘의 수혜주
          </button>
          <button
            onClick={() => setActiveTab('detailed')}
            style={{
              background: activeTab === 'detailed' ? '#6366f1' : 'transparent',
              color: '#e2e8f0',
              border: 'none',
              padding: '10px 20px',
              cursor: 'pointer',
              borderRadius: '8px'
            }}
            disabled={!selectedSector}
          >
            📊 상세 분석
          </button>
        </div>

        {/* 국제 지표 */}
        {marketIndicators && (
          <div className="section">
            <h2>🌍 국제 지표</h2>
            <div className="grid grid-2">
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">유가 (WTI)</div>
                  <div className="value">${marketIndicators.oil.price.toFixed(2)}</div>
                  <div className={`change ${marketIndicators.oil.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.oil.change > 0 ? '+' : ''}
                    {marketIndicators.oil.change.toFixed(2)}%
                  </div>
                </div>
              </div>
              <div className="card card-glow">
                <div className="stat-box">
                  <div className="label">USD/KRW</div>
                  <div className="value">₩{marketIndicators.exchangeRate.usdKrw.toFixed(0)}</div>
                  <div className={`change ${marketIndicators.exchangeRate.change < 0 ? 'negative' : ''}`}>
                    {marketIndicators.exchangeRate.change > 0 ? '+' : ''}
                    {marketIndicators.exchangeRate.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 오늘의 수혜주 탭 */}
        {activeTab === 'overview' && results && (
          <div className="section">
            <h2>📈 오늘의 수혜주 Top 5</h2>
            <div className="grid grid-3">
              {results.results?.map((result: Result, idx: number) => (
                <div key={idx} className="card card-glow">
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                      {result.sector}
                    </div>
                    <div
                      style={{
                        fontSize: '24px',
                        fontWeight: 700,
                        color: result.changeRate > 0 ? '#22d3ee' : '#ef4444',
                        marginBottom: '8px'
                      }}
                    >
                      {result.changeRate > 0 ? '+' : ''}
                      {result.changeRate.toFixed(2)}%
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#d1d5db', marginBottom: '15px', lineHeight: '1.5' }}>
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
                <h3 style={{ marginBottom: '15px' }}>📋 일일 분석 리포트</h3>
                <div className="card">
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontSize: '12px',
                      color: '#d1d5db'
                    }}
                  >
                    {results.formatted}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 상세 분석 탭 */}
        {activeTab === 'detailed' && detailedAnalysis && (
          <div className="section">
            <h2>📊 {detailedAnalysis.sector} - 상세 분석</h2>

            {/* 기사별 요약 */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>
                📰 관련 기사 ({detailedAnalysis.articles.length}개)
              </h3>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>기사</th>
                      <th>출처</th>
                      <th>요약</th>
                      <th>관련성</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedAnalysis.articles.map((article, idx) => (
                      <tr key={idx}>
                        <td style={{ maxWidth: '300px' }}>
                          <a href={article.url} target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }}>
                            {article.title.substring(0, 40)}...
                          </a>
                        </td>
                        <td>{article.source}</td>
                        <td style={{ fontSize: '12px', color: '#d1d5db' }}>{article.summary}</td>
                        <td>
                          <span className="badge badge-success">{article.relevanceScore}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 기사 관계성 */}
            <div style={{ marginBottom: '40px' }}>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>🔗 기사 관계성</h3>
              <div className="card">{detailedAnalysis.articleRelationship}</div>
            </div>

            {/* 역사 추적 */}
            <div>
              <h3 style={{ marginBottom: '15px', fontSize: '16px', fontWeight: 600 }}>📅 최근 3개월 역사</h3>
              <div className="card">
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#22d3ee' }}>{detailedAnalysis.historicalTrend.period}</strong>
                </div>
                <div style={{ marginBottom: '15px' }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>주요 이벤트:</h4>
                  <ul style={{ marginLeft: '20px', color: '#d1d5db' }}>
                    {detailedAnalysis.historicalTrend.keyEvents.map((event: string, idx: number) => (
                      <li key={idx}>{event}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px' }}>결론:</h4>
                  <p style={{ color: '#d1d5db' }}>{detailedAnalysis.historicalTrend.conclusion}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!results && !loading && (
          <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>
            분석 결과를 기다리는 중입니다... "지금 분석하기"를 클릭하세요.
          </div>
        )}

        {/* 푸터 */}
        <footer style={{ marginTop: '60px', borderTop: '1px solid #262b3d', paddingTop: '30px', color: '#9ca3af', textAlign: 'center', fontSize: '12px' }}>
          <p>Why Up & Down v2.0 | 매일 오후 4:00 KST 자동 업데이트</p>
          <p style={{ marginTop: '10px' }}>3명의 AI 에이전트(Trader, PM, QA)가 협력하여 분석</p>
        </footer>
      </div>
    </div>
  );
}
