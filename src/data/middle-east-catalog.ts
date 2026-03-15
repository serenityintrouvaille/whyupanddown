export interface ThemeDefinition {
  id: string;
  label: string;
  description: string;
  keywords: string[];
}

export interface StockDefinition {
  id: string;
  code: string;
  name: string;
  market: 'KOSPI';
  themes: string[];
  rationale: string;
}

export const MIDDLE_EAST_TOPICS = [
  'middle east war',
  'israel iran strike',
  'gaza ceasefire',
  'air strike middle east',
  'arms deal middle east',
  'hormuz strait',
  'oil price middle east',
  'shipping red sea',
  'semiconductor supply chain war',
  'sanction tariff middle east'
] as const;

export const THEME_DEFINITIONS: ThemeDefinition[] = [
  {
    id: 'defense',
    label: '방산 수출',
    description: '공습, 미사일, 드론, 군사 행동과 연결되는 방산 대표 테마.',
    keywords: ['weapon', 'arms', 'missile', 'drone', 'fighter', 'defense', 'military']
  },
  {
    id: 'shipbuilding',
    label: '조선',
    description: '특수선, 군함, LNG선 발주와 해상 리스크에 반응하는 조선 테마.',
    keywords: ['shipyard', 'vessel', 'fleet', 'shipbuilding', 'lng carrier']
  },
  {
    id: 'oil_refining',
    label: '정유',
    description: '원유 급등락과 정제마진 변화에 민감한 정유 테마.',
    keywords: ['oil', 'crude', 'brent', 'wti', 'refining', 'petroleum']
  },
  {
    id: 'gas_energy',
    label: '에너지',
    description: 'LNG, 가스, 발전 인프라와 에너지 안보 이슈에 반응하는 테마.',
    keywords: ['lng', 'gas', 'energy', 'pipeline', 'utility']
  },
  {
    id: 'shipping_logistics',
    label: '해운·물류',
    description: '호르무즈, 홍해, 항로 차질, 운임 상승에 반응하는 해운 테마.',
    keywords: ['hormuz', 'red sea', 'shipping', 'freight', 'route', 'logistics']
  },
  {
    id: 'tariff_supply_chain',
    label: '관세·공급망',
    description: '제재, 관세, 수출 통제, 공급망 불안에 반응하는 무역 테마.',
    keywords: ['tariff', 'sanction', 'supply chain', 'trade', 'export control']
  },
  {
    id: 'currency_safehaven',
    label: '환율·안전자산',
    description: '달러 강세와 위험회피 심리 확대로 반응하는 환율·안전자산 테마.',
    keywords: ['usd', 'fx', 'exchange rate', 'safe haven', 'volatility']
  }
] as const;

export const STOCK_DEFINITIONS: StockDefinition[] = [
  {
    id: 'hanwha-aerospace',
    code: '012450',
    name: '한화에어로스페이스',
    market: 'KOSPI',
    themes: ['defense'],
    rationale: '미사일, 방공체계, 방산 수출 기대와 직접 연결되는 핵심 방산주.'
  },
  {
    id: 'lig-nex1',
    code: '079550',
    name: 'LIG넥스원',
    market: 'KOSPI',
    themes: ['defense'],
    rationale: '유도무기와 방공체계 중심 포트폴리오로 군사 충돌 뉴스에 민감하다.'
  },
  {
    id: 'korea-aerospace',
    code: '047810',
    name: '한국항공우주',
    market: 'KOSPI',
    themes: ['defense'],
    rationale: '군용기와 국방 플랫폼 수출 모멘텀이 반영되는 대표 종목.'
  },
  {
    id: 'hyundai-rotem',
    code: '064350',
    name: '현대로템',
    market: 'KOSPI',
    themes: ['defense'],
    rationale: '지상 무기와 전략 장비 수출 기대가 살아나는 종목.'
  },
  {
    id: 'hanwha-ocean',
    code: '042660',
    name: '한화오션',
    market: 'KOSPI',
    themes: ['shipbuilding', 'defense'],
    rationale: '군함과 특수선 수주 기대가 전쟁 리스크와 맞물리는 조선주.'
  },
  {
    id: 'hd-ksoe',
    code: '009540',
    name: 'HD한국조선해양',
    market: 'KOSPI',
    themes: ['shipbuilding', 'oil_refining'],
    rationale: '대형 조선과 해양플랜트 노출이 높아 유가·운임 변동에 민감하다.'
  },
  {
    id: 'samsung-heavy',
    code: '010140',
    name: '삼성중공업',
    market: 'KOSPI',
    themes: ['shipbuilding'],
    rationale: 'LNG선과 해양 엔지니어링 수요 기대가 반영되는 종목.'
  },
  {
    id: 'hmm',
    code: '011200',
    name: 'HMM',
    market: 'KOSPI',
    themes: ['shipping_logistics'],
    rationale: '항로 차질과 운임 할증이 실적 기대에 반영되는 대표 해운주.'
  },
  {
    id: 'korea-line',
    code: '005880',
    name: '대한해운',
    market: 'KOSPI',
    themes: ['shipping_logistics'],
    rationale: '전쟁 리스크에 따른 벌크 운임 변동 영향을 받는 해운주.'
  },
  {
    id: 'heung-a-shipping',
    code: '003280',
    name: '흥아해운',
    market: 'KOSPI',
    themes: ['shipping_logistics'],
    rationale: '항로 리스크 헤드라인에 민감하게 반응하는 중소형 해운주.'
  },
  {
    id: 'hyundai-glovis',
    code: '086280',
    name: '현대글로비스',
    market: 'KOSPI',
    themes: ['shipping_logistics', 'tariff_supply_chain'],
    rationale: '글로벌 물류와 해상 운송 변화가 실적 기대에 반영되는 종목.'
  },
  {
    id: 's-oil',
    code: '010950',
    name: 'S-Oil',
    market: 'KOSPI',
    themes: ['oil_refining'],
    rationale: '원유 급등과 정제마진 변화에 민감한 대표 정유주.'
  },
  {
    id: 'gs-holdings',
    code: '078930',
    name: 'GS',
    market: 'KOSPI',
    themes: ['oil_refining'],
    rationale: '정유·에너지 계열사 가치가 유가 변동에 연동되는 지주사.'
  },
  {
    id: 'sk-innovation',
    code: '096770',
    name: 'SK이노베이션',
    market: 'KOSPI',
    themes: ['oil_refining', 'gas_energy'],
    rationale: '정유와 에너지 포트폴리오 노출이 높은 종목.'
  },
  {
    id: 'kogas',
    code: '036460',
    name: '한국가스공사',
    market: 'KOSPI',
    themes: ['gas_energy'],
    rationale: 'LNG 도입과 에너지 안보 이슈에 직접 연결되는 공기업.'
  },
  {
    id: 'posco-international',
    code: '047050',
    name: '포스코인터내셔널',
    market: 'KOSPI',
    themes: ['gas_energy', 'tariff_supply_chain'],
    rationale: '상사·에너지·자원 포트폴리오로 공급망 이슈에 민감하다.'
  },
  {
    id: 'lg-international',
    code: '001120',
    name: 'LX인터내셔널',
    market: 'KOSPI',
    themes: ['tariff_supply_chain', 'gas_energy'],
    rationale: '원자재 흐름과 무역 정책 변화에 민감한 상사주.'
  },
  {
    id: 'samsung-candt',
    code: '028260',
    name: '삼성물산',
    market: 'KOSPI',
    themes: ['tariff_supply_chain', 'gas_energy'],
    rationale: '상사와 해외 프로젝트 노출로 원자재·에너지 변수에 연동된다.'
  },
  {
    id: 'samsung-electronics',
    code: '005930',
    name: '삼성전자',
    market: 'KOSPI',
    themes: ['currency_safehaven', 'tariff_supply_chain'],
    rationale: '반도체와 글로벌 공급망, 수출 규제 변수에 민감한 대표 대형주.'
  },
  {
    id: 'sk-hynix',
    code: '000660',
    name: 'SK하이닉스',
    market: 'KOSPI',
    themes: ['currency_safehaven', 'tariff_supply_chain'],
    rationale: '반도체 메모리와 글로벌 공급망 변수에 직접 반응하는 대표 반도체주.'
  },
  {
    id: 'hyundai-motor',
    code: '005380',
    name: '현대차',
    market: 'KOSPI',
    themes: ['currency_safehaven', 'tariff_supply_chain'],
    rationale: '관세와 환율 변화에 민감한 글로벌 수출주.'
  },
  {
    id: 'kia',
    code: '000270',
    name: '기아',
    market: 'KOSPI',
    themes: ['currency_safehaven', 'tariff_supply_chain'],
    rationale: '글로벌 판매 비중이 높아 관세와 환율 변화에 민감한 수출주.'
  },
  {
    id: 'posco-holdings',
    code: '005490',
    name: '포스코홀딩스',
    market: 'KOSPI',
    themes: ['tariff_supply_chain', 'gas_energy'],
    rationale: '철강과 이차전지 소재 노출이 높아 원자재와 공급망 이슈에 민감하다.'
  },
  {
    id: 'korea-zinc',
    code: '010130',
    name: '고려아연',
    market: 'KOSPI',
    themes: ['tariff_supply_chain', 'gas_energy'],
    rationale: '비철금속과 희소금속 가격 변동, 자원 공급 이슈에 연동되는 원자재 대표주.'
  }
] as const;

export const THEME_BY_ID = Object.fromEntries(
  THEME_DEFINITIONS.map((theme) => [theme.id, theme])
) as Record<string, ThemeDefinition>;

export const STOCK_BY_ID = Object.fromEntries(
  STOCK_DEFINITIONS.map((stock) => [stock.id, stock])
) as Record<string, StockDefinition>;
