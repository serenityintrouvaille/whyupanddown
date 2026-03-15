import axios from 'axios';
import * as cheerio from 'cheerio';
import { MIDDLE_EAST_TOPICS } from '@/data/middle-east-catalog';
import type { NewsArticle } from '@/lib/middle-east-types';

const BLOCKED_SOURCES = new Set([
  'Facebook',
  'Instagram',
  'YouTube',
  'X',
  'TikTok'
]);

function makeId(url: string, title: string): string {
  return Buffer.from(`${url}:${title}`).toString('base64').slice(0, 24);
}

async function fetchNewsApi(topic: string): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY || process.env.GOOGLE_NEWS_API_KEY;
  if (!apiKey) {
    return [];
  }

  const response = await axios.get('https://newsapi.org/v2/everything', {
    params: {
      q: topic,
      language: 'en',
      sortBy: 'publishedAt',
      pageSize: 10,
      apiKey
    },
    timeout: 10000
  });

  return (response.data.articles || []).map((article: any) => ({
    id: makeId(article.url, article.title),
    title: article.title || '',
    summary: article.description || '',
    url: article.url || '',
    source: article.source?.name || 'NewsAPI',
    publishedAt: article.publishedAt || new Date().toISOString(),
    topic
  }));
}

async function fetchGoogleRss(topic: string): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`;
  const response = await axios.get(url, { timeout: 10000 });
  const $ = cheerio.load(response.data, { xmlMode: true });
  const articles: NewsArticle[] = [];

  $('item').each((_, element) => {
    const title = $(element).find('title').first().text().trim();
    const link = $(element).find('link').first().text().trim();
    const pubDate = $(element).find('pubDate').first().text().trim();
    const source = $(element).find('source').first().text().trim() || 'Google News';

    if (!title || !link) {
      return;
    }

    articles.push({
      id: makeId(link, title),
      title,
      summary: '',
      url: link,
      source,
      publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      topic
    });
  });

  return articles;
}

function dedupeAndSort(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();
  return articles
    .filter((article) => {
      const source = article.source.trim();
      return !BLOCKED_SOURCES.has(source);
    })
    .filter((article) => {
      const key = article.url || article.title;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    })
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
}

export async function fetchMiddleEastNews(): Promise<NewsArticle[]> {
  const batches = await Promise.all(
    MIDDLE_EAST_TOPICS.map(async (topic) => {
      const [apiArticles, rssArticles] = await Promise.allSettled([
        fetchNewsApi(topic),
        fetchGoogleRss(topic)
      ]);

      const merged: NewsArticle[] = [];
      if (apiArticles.status === 'fulfilled') {
        merged.push(...apiArticles.value);
      }
      if (rssArticles.status === 'fulfilled') {
        merged.push(...rssArticles.value);
      }
      return merged;
    })
  );

  return dedupeAndSort(batches.flat()).slice(0, 60);
}
