import type { NextApiRequest, NextApiResponse } from 'next';
import { crawlNaverThemes } from '@/lib/crawler';
import { fetchThemeNews } from '@/lib/news-fetcher';
import { analyzeWithClaude } from '@/lib/claude-analyzer';
import { formatAllResults } from '@/lib/formatter';
import fs from 'fs';
import path from 'path';

interface ResponseData {
  success: boolean;
  timestamp: string;
  results?: any[];
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, timestamp: new Date().toISOString(), error: 'Method not allowed' });
  }

  try {
    console.log('[UPDATE] 시작:', new Date().toLocaleString('ko-KR'));

    // 1. 테마 크롤링
    console.log('[1/3] 네이버 테마 크롤링...');
    const themes = await crawlNaverThemes();

    if (themes.length === 0) {
      return res.status(500).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: 'Failed to crawl themes'
      });
    }

    // 2. 각 테마의 뉴스 수집 및 분석
    console.log('[2/3] 뉴스 수집 및 Claude 분석...');
    const results = [];

    for (const theme of themes) {
      try {
        const news = await fetchThemeNews(theme.name);
        const analysis = await analyzeWithClaude(theme.name, theme.change, news);
        results.push(analysis);
      } catch (error) {
        console.error(`[ERROR] ${theme.name} 분석 실패:`, error);
      }
    }

    // 3. 결과 저장
    console.log('[3/3] 결과 저장...');
    const formatted = formatAllResults(results);

    // 결과를 파일로 저장
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().split('T')[0];
    const filePath = path.join(dataDir, `results-${timestamp}.json`);

    fs.writeFileSync(filePath, JSON.stringify({
      date: new Date().toLocaleString('ko-KR'),
      results: results,
      formatted: formatted
    }, null, 2));

    console.log('[성공] 분석 완료:', timestamp);

    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      results: results
    });
  } catch (error) {
    console.error('[FATAL ERROR]', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
