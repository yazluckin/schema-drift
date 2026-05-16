import {
  cacheSchema,
  getCachedSchema,
  cacheReport,
  getCachedReport,
  invalidateSchema,
  invalidateReport,
  clearAllCaches,
  getCacheStats,
} from './cache';
import { Schema, DriftReport } from './types';

const mockSchema: Schema = {
  name: 'TestSchema',
  fields: [{ name: 'id', type: 'number', required: true }],
};

const mockReport: DriftReport = {
  schema: mockSchema,
  violations: [],
  passed: true,
};

beforeEach(() => {
  clearAllCaches();
});

describe('schema cache', () => {
  it('stores and retrieves a schema by key', () => {
    cacheSchema('user', mockSchema);
    expect(getCachedSchema('user')).toEqual(mockSchema);
  });

  it('returns null for missing key', () => {
    expect(getCachedSchema('nonexistent')).toBeNull();
  });

  it('returns null for expired schema', () => {
    cacheSchema('user', mockSchema, -1);
    expect(getCachedSchema('user')).toBeNull();
  });

  it('invalidates a cached schema', () => {
    cacheSchema('user', mockSchema);
    const removed = invalidateSchema('user');
    expect(removed).toBe(true);
    expect(getCachedSchema('user')).toBeNull();
  });

  it('returns false when invalidating a non-existent key', () => {
    expect(invalidateSchema('ghost')).toBe(false);
  });
});

describe('report cache', () => {
  it('stores and retrieves a report by key', () => {
    cacheReport('run-1', mockReport);
    expect(getCachedReport('run-1')).toEqual(mockReport);
  });

  it('returns null for missing key', () => {
    expect(getCachedReport('missing')).toBeNull();
  });

  it('returns null for expired report', () => {
    cacheReport('run-1', mockReport, -1);
    expect(getCachedReport('run-1')).toBeNull();
  });

  it('invalidates a cached report', () => {
    cacheReport('run-1', mockReport);
    const removed = invalidateReport('run-1');
    expect(removed).toBe(true);
    expect(getCachedReport('run-1')).toBeNull();
  });
});

describe('cache stats', () => {
  it('returns correct counts after insertions', () => {
    cacheSchema('s1', mockSchema);
    cacheSchema('s2', mockSchema);
    cacheReport('r1', mockReport);
    expect(getCacheStats()).toEqual({ schemas: 2, reports: 1 });
  });

  it('returns zero counts after clearAllCaches', () => {
    cacheSchema('s1', mockSchema);
    cacheReport('r1', mockReport);
    clearAllCaches();
    expect(getCacheStats()).toEqual({ schemas: 0, reports: 0 });
  });
});
