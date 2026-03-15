import { STOCK_BY_ID } from '@/data/middle-east-catalog';
import type {
  ClassifiedArticle,
  DailySnapshotPayload,
  MarketSignal,
  NewsCategory,
  RollingIngestPayload,
  SignalBoard,
  SignalThemeId,
  StockBoardItem,
  ThemeBoardItem
} from '@/lib/middle-east-types';

type SourcePayload = RollingIngestPayload | DailySnapshotPayload;

interface DisplayThemeDefinition {
  id: SignalThemeId;
  label: string;
  categories: NewsCategory[];
  stockIds: string[];
}

const DISPLAY_THEMES: DisplayThemeDefinition[] = [
  {
    id: 'defense',
    label: '방산',
    categories: ['WAR', 'US_STRIKE', 'IRAN_ISRAEL', 'WEAPON'],
    stockIds: ['hanwha-aerospace', 'lig-nex1', 'korea-aerospace', 'hyundai-rotem']
  },
  {
    id: 'oil',
    label: '유가',
    categories: ['OIL', 'HORMUZ'],
    stockIds: ['s-oil', 'gs-holdings', 'sk-innovation']
  },
  {
    id: 'energy',
    label: '에너지',
    categories: ['OIL', 'HORMUZ', 'TARIFF_SANCTION'],
    stockIds: ['kogas', 'sk-innovation', 'posco-international', 'samsung-candt']
  },
  {
    id: 'shipping',
    label: '해운/물류',
    categories: ['HORMUZ', 'SHIPPING', 'WAR'],
    stockIds: ['hmm', 'korea-line', 'heung-a-shipping', 'hyundai-glovis']
  },
  {
    id: 'semiconductor',
    label: '반도체',
    categories: ['SEMICONDUCTOR', 'TARIFF_SANCTION'],
    stockIds: ['samsung-electronics', 'sk-hynix']
  },
  {
    id: 'materials',
    label: '원자재',
    categories: ['OIL', 'SHIPPING', 'TARIFF_SANCTION'],
    stockIds: ['posco-holdings', 'korea-zinc', 'posco-international']
  }
];

const CATEGORY_RULES: Array<{
  category: NewsCategory;
  keywords: string[];
  themes: SignalThemeId[];
}> = [
  {
    category: 'OIL',
    keywords: ['oil', 'brent', 'wti', 'crude', 'petroleum', 'refinery'],
    themes: ['oil', 'energy', 'materials']
  },
  {
    category: 'WAR',
    keywords: ['war', 'conflict', 'troops', 'battle', 'military', 'bombardment'],
    themes: ['defense', 'shipping']
  },
  {
    category: 'US_STRIKE',
    keywords: ['u.s. strike', 'us strike', 'u.s. attack', 'us attack', 'american strike'],
    themes: ['defense', 'oil', 'shipping']
  },
  {
    category: 'IRAN_ISRAEL',
    keywords: ['iran', 'israel', 'tehran', 'idf', 'gaza', 'hezbollah'],
    themes: ['defense', 'oil', 'shipping']
  },
  {
    category: 'WEAPON',
    keywords: ['missile', 'drone', 'fighter', 'munition', 'air defense', 'rocket'],
    themes: ['defense']
  },
  {
    category: 'TARIFF_SANCTION',
    keywords: ['tariff', 'sanction', 'embargo', 'restriction', 'export control'],
    themes: ['energy', 'semiconductor', 'materials']
  },
  {
    category: 'HORMUZ',
    keywords: ['hormuz', 'strait of hormuz', 'gulf shipping', 'tanker', 'shipping lane'],
    themes: ['shipping', 'oil', 'energy']
  },
  {
    category: 'SHIPPING',
    keywords: ['shipping', 'freight', 'cargo', 'container', 'vessel', 'route'],
    themes: ['shipping', 'materials']
  },
  {
    category: 'SEMICONDUCTOR',
    keywords: ['chip', 'chips', 'semiconductor', 'memory', 'fab', 'supply chain'],
    themes: ['semiconductor', 'materials']
  }
];

export const BOARD_STOCK_IDS = [...new Set(DISPLAY_THEMES.flatMap((theme) => theme.stockIds))];

function includesAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function uniqueBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function classifySeverity(text: string, categories: NewsCategory[]): 'low' | 'medium' | 'high' {
  if (
    includesAny(text, [
      'surge',
      'spike',
      'jump',
      'plunge',
      'closure',
      'blockade',
      'retaliation',
      'warship',
      'attacked'
    ])
  ) {
    return 'high';
  }

  if (categories.includes('US_STRIKE') || categories.includes('HORMUZ')) {
    return 'high';
  }

  if (categories.length >= 2 || categories.includes('WAR') || categories.includes('OIL')) {
    return 'medium';
  }

  return 'low';
}

function titleHas(text: string, keywords: string[]) {
  return includesAny(text, keywords);
}

function buildHeadlineKo(article: SourcePayload['articles'][number], categories: NewsCategory[]) {
  const text = `${article.title} ${article.summary} ${article.topic}`.toLowerCase();

  if (categories.includes('HORMUZ')) {
    if (titleHas(text, ['open', 'reopen', 'secure', 'escort', 'protect'])) {
      return '호르무즈 해협 통항 확보 움직임 부각';
    }
    if (titleHas(text, ['ship', 'vessel', 'tanker', 'terminal', 'cargo'])) {
      return '호르무즈 인근 선박·물류 리스크 확대';
    }
    return '호르무즈 해협 리스크 재부각';
  }

  if (categories.includes('OIL')) {
    if (titleHas(text, ['surge', 'soar', 'gain', 'rise', 'higher'])) {
      return '중동 긴장에 국제유가 상승 압력 확대';
    }
    if (titleHas(text, ['drop', 'fall', 'decline', 'lower'])) {
      return '국제유가 조정 가능성 부각';
    }
    return '원유 수급 변수와 유가 테마 점검';
  }

  if (categories.includes('US_STRIKE')) {
    return '미국 직접 개입 가능성에 시장 긴장 고조';
  }

  if (categories.includes('WEAPON')) {
    if (titleHas(text, ['drone'])) {
      return '드론 전개와 요격 이슈 확산';
    }
    if (titleHas(text, ['missile', 'rocket', 'ballistic'])) {
      return '미사일 공방 격화 소식 부각';
    }
    return '무기 활용 정보가 방산 테마 자극';
  }

  if (categories.includes('SEMICONDUCTOR')) {
    return '반도체 공급망 변수 점검 필요';
  }

  if (categories.includes('TARIFF_SANCTION')) {
    return '제재·관세 이슈가 공급망 변수로 확산';
  }

  if (categories.includes('IRAN_ISRAEL')) {
    if (titleHas(text, ['strike', 'air strike', 'launches', 'attack'])) {
      return '이란·이스라엘 공습 격화';
    }
    if (titleHas(text, ['ceasefire', 'dialogue', 'truce'])) {
      return '휴전·대화 가능성 재점검';
    }
    return '이란·이스라엘 충돌 지속';
  }

  if (categories.includes('WAR')) {
    if (titleHas(text, ['ceasefire', 'dialogue', 'truce'])) {
      return '중동 휴전 협상 가능성 주목';
    }
    return '중동 전황 변화가 시장 변수로 부각';
  }

  return '중동 지정학 뉴스 요약';
}

function buildSummary(article: SourcePayload['articles'][number], categories: NewsCategory[]) {
  const title = article.title.toLowerCase();
  const text = `${article.title} ${article.summary} ${article.topic}`.toLowerCase();

  if (categories.includes('HORMUZ')) {
    if (titleHas(title, ['close', 'closure', 'blockade', 'open strait', 'protect strait'])) {
      return '호르무즈 해협 통항 안정성과 선박 보호 이슈가 해운·에너지 종목으로 번질 수 있습니다.';
    }
    if (titleHas(title, ['warship', 'ship', 'vessel', 'tanker', 'drone'])) {
      return '해협 인근 선박과 군함 관련 긴장이 커지며 해운·유가 테마 변동성이 확대될 수 있습니다.';
    }
    return '호르무즈 해협 리스크가 해운·에너지·유가 테마에 직접 연결되는 뉴스입니다.';
  }

  if (categories.includes('US_STRIKE')) {
    if (titleHas(title, ['airbase', 'military base', 'embassy'])) {
      return '미군 기지와 미국 자산이 직접 거론되며 방산과 유가 관련 종목에 부담을 줄 수 있습니다.';
    }
    return '미국의 직접 군사 개입 여부가 방산과 유가 관련 종목에 영향을 줄 수 있는 뉴스입니다.';
  }

  if (categories.includes('OIL')) {
    if (titleHas(text, ['surge', 'soar', 'jump', 'gain', 'rise', 'higher'])) {
      return '국제유가 상승 압력이 커지며 정유·에너지·원자재 테마가 함께 반응할 수 있습니다.';
    }
    if (titleHas(text, ['plunge', 'drop', 'fall', 'decline', 'lower'])) {
      return '국제유가 하락 가능성이 커지며 정유와 에너지 종목의 단기 변동성이 확대될 수 있습니다.';
    }
    return '국제유가와 원유 수급 이슈가 정유·에너지 테마에 연결되는 뉴스입니다.';
  }

  if (categories.includes('SEMICONDUCTOR')) {
    if (titleHas(text, ['supply chain', 'export control', 'restriction'])) {
      return '반도체 공급망과 수출 규제 변수로 삼성전자·SK하이닉스 등 대형주가 영향을 받을 수 있습니다.';
    }
    return '반도체 공급망 불안과 물류 차질 여부를 점검해야 하는 뉴스입니다.';
  }

  if (categories.includes('TARIFF_SANCTION')) {
    if (titleHas(text, ['tariff', 'sanction', 'embargo'])) {
      return '제재나 관세 발표가 현실화되면 공급망·원자재 관련 종목으로 영향이 번질 수 있습니다.';
    }
    return '무역 규제와 공급망 재편 가능성을 점검해야 하는 뉴스입니다.';
  }

  if (categories.includes('WEAPON')) {
    if (titleHas(text, ['drone', 'shahed'])) {
      return '드론 활용과 요격 체계 이슈가 방산 대표주 모멘텀으로 연결될 수 있습니다.';
    }
    if (titleHas(text, ['missile', 'rocket', 'air defense'])) {
      return '미사일과 방공 체계 이슈가 방산 대표주에 직접 반영될 수 있는 뉴스입니다.';
    }
    return '무기 활용 정보가 방산 대표주에 연결될 수 있는 뉴스입니다.';
  }

  if (categories.includes('IRAN_ISRAEL')) {
    if (titleHas(text, ['strikes', 'strike', 'air strike', 'bomb'])) {
      return '이란과 이스라엘의 공습 강도 변화가 방산·유가·해운 테마를 동시에 자극할 수 있습니다.';
    }
    if (titleHas(text, ['killed', 'dead', 'casualties'])) {
      return '사상자 확대 소식이 중동 리스크 프리미엄을 키우며 시장 심리를 흔들 수 있습니다.';
    }
    return '이란·이스라엘 충돌이 이어지며 지정학 리스크 관련 종목이 재평가될 수 있습니다.';
  }

  if (categories.includes('WAR')) {
    if (titleHas(text, ['ceasefire', 'truce'])) {
      return '휴전 여부에 따라 방산·해운·유가 테마의 단기 방향성이 달라질 수 있습니다.';
    }
    if (titleHas(text, ['warships', 'troops', 'military'])) {
      return '군사 충돌 확대 신호가 위험자산 심리와 해상 물류 기대를 동시에 흔들 수 있습니다.';
    }
    return '중동 군사 충돌 강도 변화가 위험자산 심리에 영향을 줄 수 있는 뉴스입니다.';
  }

  return '중동 지정학 리스크와 연결된 최신 속보입니다.';
}

function classifyArticle(article: SourcePayload['articles'][number]): ClassifiedArticle {
  const text = `${article.title} ${article.summary} ${article.topic}`.toLowerCase();
  const matchedCategories = new Set<NewsCategory>();
  const matchedThemes = new Set<SignalThemeId>();

  CATEGORY_RULES.forEach((rule) => {
    if (includesAny(text, rule.keywords)) {
      matchedCategories.add(rule.category);
      rule.themes.forEach((themeId) => matchedThemes.add(themeId));
    }
  });

  if (matchedCategories.size === 0) {
    matchedCategories.add('WAR');
    matchedThemes.add('defense');
  }

  const categories = [...matchedCategories];
  const severity = classifySeverity(text, categories);
  const alert =
    severity === 'high' ||
    categories.includes('US_STRIKE') ||
    categories.includes('HORMUZ') ||
    (categories.includes('OIL') && includesAny(text, ['surge', 'jump', 'plunge', 'collapse']));

  return {
    ...article,
    categories,
    relatedThemes: [...matchedThemes],
    severity,
    alert,
    headlineKo: buildHeadlineKo(article, categories),
    shortSummary: buildSummary(article, categories)
  };
}

function buildThemeCards(timeline: ClassifiedArticle[]): ThemeBoardItem[] {
  const drafts = DISPLAY_THEMES.map((theme) => ({
    theme,
    relatedArticles: timeline.filter((article) => article.relatedThemes.includes(theme.id))
  })).sort((a, b) => b.relatedArticles.length - a.relatedArticles.length);

  const usedLeadArticleIds = new Set<string>();

  return drafts.map(({ theme, relatedArticles }) => {
    const leadArticle =
      relatedArticles.find((article) => !usedLeadArticleIds.has(article.id)) || relatedArticles[0];

    if (leadArticle) {
      usedLeadArticleIds.add(leadArticle.id);
    }

    return {
      id: theme.id,
      label: theme.label,
      currentIssue:
        leadArticle?.shortSummary ||
        `${theme.label} 테마와 직접 연결된 중동 뉴스가 들어오면 이 영역에 표시됩니다.`,
      stockIds: theme.stockIds.filter((stockId) => STOCK_BY_ID[stockId]),
      newsCount: relatedArticles.length,
      articleIds: relatedArticles.map((article) => article.id)
    };
  });
}

function buildStockBuckets(
  timeline: ClassifiedArticle[],
  signals: MarketSignal[]
): Record<string, StockBoardItem[]> {
  const signalByStockId = Object.fromEntries(signals.map((signal) => [signal.stockId, signal]));

  return Object.fromEntries(
    DISPLAY_THEMES.map((theme) => {
      const themeArticles = timeline.filter((article) => article.relatedThemes.includes(theme.id));

      const stocks = theme.stockIds
        .filter((stockId) => STOCK_BY_ID[stockId])
        .map((stockId) => {
          const stock = STOCK_BY_ID[stockId];
          const aliasPool = [
            stock.name.toLowerCase(),
            stock.code.toLowerCase(),
            stock.name.toLowerCase().replace(/\s+/g, '')
          ];

          const matchedNews = uniqueBy(
            themeArticles.filter((article) => {
              const text = `${article.title} ${article.summary}`.toLowerCase();
              return aliasPool.some((alias) => alias && text.includes(alias));
            }),
            (article) => article.url || article.title
          );

          const fallbackNews = uniqueBy(themeArticles, (article) => article.url || article.title).slice(0, 5);

          return {
            stockId,
            code: stock.code,
            name: stock.name,
            themeId: theme.id,
            rationale: stock.rationale,
            relatedNews: (matchedNews.length ? matchedNews : fallbackNews).slice(0, 5),
            signal: signalByStockId[stockId] || null
          } satisfies StockBoardItem;
        });

      return [theme.id, stocks];
    })
  );
}

export function buildSignalBoard(source: SourcePayload | null): SignalBoard | null {
  if (!source) {
    return null;
  }

  const timeline = uniqueBy(
    source.articles
      .map(classifyArticle)
      .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()),
    (article) => article.url || article.title
  ).slice(0, 30);

  const alerts = timeline.filter((article) => article.alert).slice(0, 5);
  const themes = buildThemeCards(timeline);
  const stockBuckets = buildStockBuckets(timeline, source.marketSignals);

  return {
    updatedAt: source.timestamp,
    alerts,
    timeline,
    themes,
    defaultThemeId: themes[0]?.id || 'defense',
    stockBuckets
  };
}
