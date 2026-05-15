import { runPipeline, runBatchPipeline, filterFailedResults, filterPassedResults } from './pipeline';
import { SchemaDefinition } from './types';
import { clearHistory } from './evolution';

const schema: SchemaDefinition = {
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
  },
};

beforeEach(() => {
  clearHistory();
});

describe('runPipeline', () => {
  it('returns a result with payload and report for valid input', () => {
    const result = runPipeline({ id: 1, name: 'Alice' }, { schema });
    expect(result.payload).toEqual({ id: 1, name: 'Alice' });
    expect(result.report.violations).toHaveLength(0);
  });

  it('returns violations for invalid input', () => {
    const result = runPipeline({ id: 'bad', name: 'Alice' }, { schema });
    expect(result.report.violations.length).toBeGreaterThan(0);
  });

  it('serializes report when serializeOutput is true', () => {
    const result = runPipeline({ id: 1, name: 'Alice' }, { schema, serializeOutput: true });
    expect(result.serialized).toBeDefined();
    expect(typeof result.serialized).toBe('string');
  });

  it('does not serialize when serializeOutput is false', () => {
    const result = runPipeline({ id: 1, name: 'Alice' }, { schema, serializeOutput: false });
    expect(result.serialized).toBeUndefined();
  });

  it('tracks evolution when trackEvolution is true', () => {
    expect(() =>
      runPipeline({ id: 1, name: 'Alice' }, { schema, trackEvolution: true })
    ).not.toThrow();
  });
});

describe('runBatchPipeline', () => {
  it('processes multiple payloads', () => {
    const payloads = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
    const results = runBatchPipeline(payloads, { schema });
    expect(results).toHaveLength(2);
    results.forEach((r) => expect(r.report.violations).toHaveLength(0));
  });

  it('captures violations per payload', () => {
    const payloads = [
      { id: 1, name: 'Alice' },
      { id: 'bad', name: 'Bob' },
    ];
    const results = runBatchPipeline(payloads, { schema });
    expect(results[0].report.violations).toHaveLength(0);
    expect(results[1].report.violations.length).toBeGreaterThan(0);
  });
});

describe('filterFailedResults / filterPassedResults', () => {
  it('filters failed results correctly', () => {
    const results = runBatchPipeline(
      [{ id: 1, name: 'Alice' }, { id: 'bad', name: 'Bob' }],
      { schema }
    );
    expect(filterFailedResults(results)).toHaveLength(1);
    expect(filterPassedResults(results)).toHaveLength(1);
  });
});
