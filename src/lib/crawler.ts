import axios from 'axios';
import * as cheerio from 'cheerio';

export interface Theme {
  name: string;
  change: number; // 등락률 (%)
  price: number;
  volume: string;
}

export async function crawlNaverThemes(): Promise<Theme[]> {
  try {
    // Naver 증권 테마 페이지
    const url = 'https://finance.naver.com/sise/theme.html';
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const themes: Theme[] = [];

    // 테마 테이블 파싱
    $('tr').each((index, element) => {
      try {
        const cells = $(element).find('td');
        if (cells.length >= 3) {
          const nameCell = $(cells[0]).text().trim();
          const changeText = $(cells[2]).text().trim();
          const priceText = $(cells[1]).text().trim();
          const volumeText = $(cells[3])?.text().trim() || '0';

          if (nameCell && changeText && !isNaN(parseFloat(changeText))) {
            themes.push({
              name: nameCell,
              change: parseFloat(changeText),
              price: parseFloat(priceText) || 0,
              volume: volumeText
            });
          }
        }
      } catch (e) {
        // Parse error 무시
      }
    });

    // 등락률 기준 내림차순 정렬
    themes.sort((a, b) => b.change - a.change);

    // 상위 5개 반환
    return themes.slice(0, 5);
  } catch (error) {
    console.error('Naver 크롤링 실패:', error);

    // Mock 데이터 반환 (개발용)
    return [
      { name: '반도체', change: 5.2, price: 450.5, volume: '1.2M' },
      { name: '원유', change: 4.8, price: 78.3, volume: '980K' },
      { name: '방위산업', change: 3.9, price: 125.0, volume: '650K' },
      { name: '에너지', change: 3.5, price: 92.1, volume: '540K' },
      { name: '디스플레이', change: 2.8, price: 180.5, volume: '420K' }
    ];
  }
}
