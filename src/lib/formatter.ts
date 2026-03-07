import { AnalysisResult } from './claude-analyzer';

export interface FormattedResult {
  sector: string;
  changeRate: string;
  analysis: string;
  continuity: string;
  raw: string; // "섹터명 - 등락률 - 상승 원인 - 지속성 판단"
}

export function formatResult(analysis: AnalysisResult): FormattedResult {
  const changeRateStr = `${analysis.changeRate > 0 ? '+' : ''}${analysis.changeRate.toFixed(2)}%`;

  // 요약에서 첫 문장만 추출 (상승 원인)
  const cause = analysis.summary.split('\n')[0] || analysis.summary;

  const raw = `${analysis.sector} - ${changeRateStr} - ${cause} - ${analysis.continuity}`;

  return {
    sector: analysis.sector,
    changeRate: changeRateStr,
    analysis: analysis.summary,
    continuity: analysis.continuity,
    raw: raw
  };
}

export function formatAllResults(results: AnalysisResult[]): string {
  const header = '=== JAVIS1 일일 시장분석 ===\n\n';
  const timestamp = `분석일시: ${new Date().toLocaleString('ko-KR')}\n\n`;

  const body = results
    .map((r, idx) => {
      const formatted = formatResult(r);
      return `${idx + 1}. ${formatted.raw}\n   └─ ${formatted.analysis}`;
    })
    .join('\n\n');

  return header + timestamp + body;
}
