import { crawlNaverThemes } from '@/lib/crawler';
import { fetchThemeNews } from '@/lib/news-fetcher';
import { analyzeWithClaude, AnalysisResult } from '@/lib/claude-analyzer';
import { formatAllResults } from '@/lib/formatter';

export interface DailyUpdatePayload {
  date: string;
  timestamp: string;
  trigger: 'cron' | 'admin';
  results: AnalysisResult[];
  formatted: string;
}

async function storageSave(payload: DailyUpdatePayload): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  const filePath = path.join(process.cwd(), 'data', 'results-latest.json');
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

export async function storageGet(): Promise<DailyUpdatePayload | null> {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'data', 'results-latest.json');
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as DailyUpdatePayload;
    }
  } catch {}
  return null;
}

export async function runDailyUpdate(trigger: 'cron' | 'admin'): Promise<DailyUpdatePayload> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Server misconfiguration: ANTHROPIC_API_KEY required');
  }

  const themes = await crawlNaverThemes();
  if (themes.length === 0) {
    throw new Error('Failed to crawl themes');
  }

  const results: AnalysisResult[] = [];
  for (const theme of themes) {
    try {
      const news = await fetchThemeNews(theme.name);
      const analysis = await analyzeWithClaude(theme.name, theme.change, news);
      results.push(analysis);
    } catch (error) {
      console.error(`[ANALYZE ERROR] ${theme.name}:`, error);
    }
  }

  const now = new Date();
  const payload: DailyUpdatePayload = {
    date: now.toISOString().slice(0, 10),
    timestamp: now.toISOString(),
    trigger,
    results,
    formatted: formatAllResults(results)
  };

  await storageSave(payload);
  return payload;
}
