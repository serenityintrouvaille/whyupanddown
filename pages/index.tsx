import { useState, useEffect } from 'react';
import axios from 'axios';

interface Result {
  sector: string;
  changeRate: number;
  summary: string;
  continuity: string;
}

export default function Home() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await axios.get('/api/results');
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.post('/api/update');
      if (response.data.success) {
        setResults(response.data);
        await new Promise(r => setTimeout(r, 1000));
        await fetchResults();
      } else {
        setError(response.data.error || 'Update failed');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '30px', borderBottom: '2px solid #333', paddingBottom: '20px' }}>
        <h1>🤖 JAVIS1 - AI 금융비서</h1>
        <p>각 섹터가 왜 올랐는지 요약해주는 서비스</p>
      </header>

      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={handleUpdate}
          disabled={loading}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '분석 중...' : '지금 분석하기'}
        </button>
      </div>

      {error && (
        <div style={{ backgroundColor: '#f8d7da', color: '#721c24', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {results ? (
        <div>
          <div style={{ color: '#666', marginBottom: '20px' }}>
            분석일시: {results.date}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
            {results.results?.map((result: Result, idx: number) => (
              <div
                key={idx}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  backgroundColor: result.changeRate > 0 ? '#f0f8ff' : '#fff0f0'
                }}
              >
                <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                  {result.sector}
                  <span style={{
                    color: result.changeRate > 0 ? '#d32f2f' : '#1976d2',
                    marginLeft: '10px'
                  }}>
                    {result.changeRate > 0 ? '+' : ''}{result.changeRate.toFixed(2)}%
                  </span>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', marginBottom: '10px' }}>
                  {result.summary}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  📌 지속성: <strong>{result.continuity}</strong>
                </div>
              </div>
            ))}
          </div>

          {results.formatted && (
            <div style={{ marginTop: '30px', backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px' }}>
              <h3>📋 일일 분석 리포트</h3>
              <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', fontSize: '12px' }}>
                {results.formatted}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#999' }}>
          분석 결과를 기다리는 중입니다...
        </div>
      )}

      <footer style={{ marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#666', fontSize: '12px' }}>
        <p>JAVIS1 v1.0 | 매일 오후 4:00 KST 자동 업데이트</p>
      </footer>
    </div>
  );
}
