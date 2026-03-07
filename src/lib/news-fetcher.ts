import axios from 'axios';

export interface News {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

export async function fetchThemeNews(themeName: string): Promise<News[]> {
  try {
    const apiKey = process.env.GOOGLE_NEWS_API_KEY;
    if (!apiKey) {
      console.warn('Google News API key not configured');
      return getMockNews(themeName);
    }

    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: themeName,
        sortBy: 'publishedAt',
        language: 'ko',
        pageSize: 5,
        apiKey: apiKey
      },
      timeout: 10000
    });

    return (response.data.articles || []).map((article: any) => ({
      title: article.title,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));
  } catch (error) {
    console.error(`뉴스 검색 실패 (${themeName}):`, error);
    return getMockNews(themeName);
  }
}

function getMockNews(themeName: string): News[] {
  const newsMap: { [key: string]: News[] } = {
    '반도체': [
      {
        title: '반도체 수요 증가로 시장 강세',
        url: 'https://example.com/news1',
        source: '연합뉴스',
        publishedAt: new Date().toISOString()
      },
      {
        title: '삼성전자 차세대 칩 개발 가속',
        url: 'https://example.com/news2',
        source: '뉴스1',
        publishedAt: new Date().toISOString()
      }
    ],
    '원유': [
      {
        title: '중동 긴장으로 유가 상승',
        url: 'https://example.com/oil1',
        source: '매일경제',
        publishedAt: new Date().toISOString()
      },
      {
        title: '글로벌 원유 수급 악화',
        url: 'https://example.com/oil2',
        source: '이데일리',
        publishedAt: new Date().toISOString()
      }
    ]
  };

  return newsMap[themeName] || [
    {
      title: `${themeName} 관련 최신 뉴스`,
      url: 'https://example.com',
      source: '뉴스',
      publishedAt: new Date().toISOString()
    }
  ];
}
