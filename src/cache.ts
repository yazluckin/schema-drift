import { Schema, DriftReport } from './types';

interface CacheEntry<T> {
  value: T;
  timestamp: number;
  ttl: number;
}

type SchemaCache = Map<string, CacheEntry<Schema>>;
type ReportCache = Map<string, CacheEntry<DriftReport>>;

const schemaCache: SchemaCache = new Map();
const reportCache: ReportCache = new Map();

const DEFAULT_TTL_MS = 60_000;

function isExpired<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp > entry.ttl;
}

export function cacheSchema(key: string, schema: Schema, ttl = DEFAULT_TTL_MS): void {
  schemaCache.set(key, { value: schema, timestamp: Date.now(), ttl });
}

export function getCachedSchema(key: string): Schema | null {
  const entry = schemaCache.get(key);
  if (!entry) return null;
  if (isExpired(entry)) {
    schemaCache.delete(key);
    return null;
  }
  return entry.value;
}

export function cacheReport(key: string, report: DriftReport, ttl = DEFAULT_TTL_MS): void {
  reportCache.set(key, { value: report, timestamp: Date.now(), ttl });
}

export function getCachedReport(key: string): DriftReport | null {
  const entry = reportCache.get(key);
  if (!entry) return null;
  if (isExpired(entry)) {
    reportCache.delete(key);
    return null;
  }
  return entry.value;
}

export function invalidateSchema(key: string): boolean {
  return schemaCache.delete(key);
}

export function invalidateReport(key: string): boolean {
  return reportCache.delete(key);
}

export function clearAllCaches(): void {
  schemaCache.clear();
  reportCache.clear();
}

export function getCacheStats(): { schemas: number; reports: number } {
  return {
    schemas: schemaCache.size,
    reports: reportCache.size,
  };
}
