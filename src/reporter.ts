import { DriftReport, DriftViolation } from './types';

export type ReportFormat = 'text' | 'json' | 'summary';

export interface ReporterOptions {
  format?: ReportFormat;
  includeTimestamp?: boolean;
  verbose?: boolean;
}

const DEFAULT_OPTIONS: Required<ReporterOptions> = {
  format: 'text',
  includeTimestamp: true,
  verbose: false,
};

function formatViolation(violation: DriftViolation, verbose: boolean): string {
  const base = `  [${violation.severity.toUpperCase()}] Field "${violation.field}": expected ${violation.expectedType}, got ${violation.actualType}`;
  if (verbose && violation.message) {
    return `${base}\n    → ${violation.message}`;
  }
  return base;
}

export function formatReport(report: DriftReport, options: ReporterOptions = {}): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (opts.format === 'json') {
    return JSON.stringify(report, null, 2);
  }

  const lines: string[] = [];
  const timestamp = opts.includeTimestamp ? ` (${new Date(report.timestamp).toISOString()})` : '';

  if (opts.format === 'summary') {
    const status = report.hasDrift ? '✗ DRIFT DETECTED' : '✓ NO DRIFT';
    lines.push(`Schema: ${report.schemaName}${timestamp} — ${status}`);
    if (report.hasDrift) {
      lines.push(`  ${report.violations.length} violation(s) found.`);
    }
    return lines.join('\n');
  }

  // text format
  lines.push(`Schema Drift Report: ${report.schemaName}${timestamp}`);
  lines.push(`Status: ${report.hasDrift ? '✗ Drift Detected' : '✓ No Drift'}`);

  if (report.violations.length > 0) {
    lines.push(`Violations (${report.violations.length}):`);
    for (const violation of report.violations) {
      lines.push(formatViolation(violation, opts.verbose));
    }
  }

  return lines.join('\n');
}

export function printReport(report: DriftReport, options: ReporterOptions = {}): void {
  const output = formatReport(report, options);
  if (report.hasDrift) {
    console.warn(output);
  } else {
    console.log(output);
  }
}
