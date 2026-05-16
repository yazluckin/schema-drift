import { Schema, DriftReport } from './types';
import { detectDrift } from './detector';
import {
  cacheSchema,
  getCachedSchema,
  cacheReport,
  getCachedReport,
} from './cache';

function buildReportKey(schemaKey: string, payload: unknown): string {
  try {
    return `${schemaKey}::${JSON.stringify(payload)}`;
  } catch {
    return `${schemaKey}::unparseable`;
  }
}

export function registerSchema(key: string, schema: Schema, ttl?: number): void {
  cacheSchema(key, schema, ttl);
}

export function cachedDetectDrift(
  schemaKey: string,
  payload: unknown,
  schema?: Schema,
  ttl?: number
): DriftReport {
  const reportKey = buildReportKey(schemaKey, payload);

  const cachedReport = getCachedReport(reportKey);
  if (cachedReport) {
    return cachedReport;
  }

  let resolvedSchema = schema ?? getCachedSchema(schemaKey);
  if (!resolvedSchema) {
    throw new Error(
      `No schema found for key "${schemaKey}". Register it first with registerSchema().`
    );
  }

  if (schema) {
    cacheSchema(schemaKey, schema, ttl);
  }

  const report = detectDrift(resolvedSchema, payload);
  cacheReport(reportKey, report, ttl);
  return report;
}

export function cachedDetectDriftBatch(
  schemaKey: string,
  payloads: unknown[],
  schema?: Schema,
  ttl?: number
): DriftReport[] {
  return payloads.map((payload) =>
    cachedDetectDrift(schemaKey, payload, schema, ttl)
  );
}
