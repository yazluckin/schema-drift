import { PipelineResult } from './pipeline';
import { formatReport } from './reporter';

export interface PipelineSummary {
  total: number;
  passed: number;
  failed: number;
  passRate: string;
}

export function summarizePipelineResults(results: PipelineResult[]): PipelineSummary {
  const total = results.length;
  const passed = results.filter((r) => r.report.violations.length === 0).length;
  const failed = total - passed;
  const passRate = total === 0 ? '0%' : `${Math.round((passed / total) * 100)}%`;
  return { total, passed, failed, passRate };
}

export function formatPipelineSummary(summary: PipelineSummary): string {
  return [
    '=== Pipeline Summary ===',
    `Total:    ${summary.total}`,
    `Passed:   ${summary.passed}`,
    `Failed:   ${summary.failed}`,
    `Pass Rate: ${summary.passRate}`,
  ].join('\n');
}

export function formatPipelineResults(results: PipelineResult[]): string {
  if (results.length === 0) return 'No pipeline results to display.';

  const lines: string[] = [];
  results.forEach((result, index) => {
    const status = result.report.violations.length === 0 ? 'PASS' : 'FAIL';
    lines.push(`--- Result #${index + 1} [${status}] ---`);
    if (result.report.violations.length > 0) {
      lines.push(formatReport(result.report));
    }
  });

  const summary = summarizePipelineResults(results);
  lines.push('');
  lines.push(formatPipelineSummary(summary));

  return lines.join('\n');
}

export function printPipelineResults(results: PipelineResult[]): void {
  console.log(formatPipelineResults(results));
}
