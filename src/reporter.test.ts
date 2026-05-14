import { formatReport, printReport } from './reporter';
import { DriftReport } from './types';

const mockCleanReport: DriftReport = {
  schemaName: 'UserSchema',
  timestamp: 1700000000000,
  hasDrift: false,
  violations: [],
};

const mockDriftReport: DriftReport = {
  schemaName: 'UserSchema',
  timestamp: 1700000000000,
  hasDrift: true,
  violations: [
    {
      field: 'age',
      expectedType: 'number',
      actualType: 'string',
      severity: 'error',
      message: 'Field type mismatch',
    },
    {
      field: 'nickname',
      expectedType: 'string',
      actualType: 'undefined',
      severity: 'warning',
      message: 'Optional field missing',
    },
  ],
};

describe('formatReport', () => {
  it('formats a clean report as text with no violations', () => {
    const result = formatReport(mockCleanReport, { includeTimestamp: false });
    expect(result).toContain('No Drift');
    expect(result).not.toContain('Violations');
  });

  it('formats a drift report listing all violations', () => {
    const result = formatReport(mockDriftReport, { includeTimestamp: false });
    expect(result).toContain('Drift Detected');
    expect(result).toContain('Violations (2)');
    expect(result).toContain('Field "age"');
    expect(result).toContain('Field "nickname"');
  });

  it('includes verbose messages when verbose option is true', () => {
    const result = formatReport(mockDriftReport, { includeTimestamp: false, verbose: true });
    expect(result).toContain('Field type mismatch');
    expect(result).toContain('Optional field missing');
  });

  it('returns valid JSON when format is json', () => {
    const result = formatReport(mockDriftReport, { format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.schemaName).toBe('UserSchema');
    expect(parsed.violations).toHaveLength(2);
  });

  it('returns a one-line summary when format is summary', () => {
    const result = formatReport(mockDriftReport, { format: 'summary', includeTimestamp: false });
    expect(result).toContain('DRIFT DETECTED');
    expect(result).toContain('2 violation(s)');
    expect(result.split('\n').length).toBeLessThanOrEqual(2);
  });

  it('shows NO DRIFT in summary for clean report', () => {
    const result = formatReport(mockCleanReport, { format: 'summary', includeTimestamp: false });
    expect(result).toContain('NO DRIFT');
  });
});

describe('printReport', () => {
  it('calls console.warn when drift is detected', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    printReport(mockDriftReport, { includeTimestamp: false });
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('calls console.log when no drift is detected', () => {
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    printReport(mockCleanReport, { includeTimestamp: false });
    expect(logSpy).toHaveBeenCalled();
    logSpy.mockRestore();
  });
});
