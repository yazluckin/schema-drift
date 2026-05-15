import { SchemaDefinition, DriftReport } from './types';
import { detectDrift } from './detector';
import { normalizePayload } from './normalizer';
import { captureSnapshot } from './evolution';
import { serializeReport } from './serializer';

export interface PipelineOptions {
  schema: SchemaDefinition;
  normalize?: boolean;
  trackEvolution?: boolean;
  serializeOutput?: boolean;
}

export interface PipelineResult {
  payload: Record<string, unknown>;
  report: DriftReport;
  serialized?: string;
}

export function runPipeline(
  rawPayload: Record<string, unknown>,
  options: PipelineOptions
): PipelineResult {
  const { schema, normalize = true, trackEvolution = false, serializeOutput = false } = options;

  const payload = normalize ? normalizePayload(rawPayload, schema) : rawPayload;
  const report = detectDrift(schema, payload);

  if (trackEvolution) {
    captureSnapshot(schema);
  }

  const result: PipelineResult = { payload, report };

  if (serializeOutput) {
    result.serialized = serializeReport(report);
  }

  return result;
}

export function runBatchPipeline(
  payloads: Record<string, unknown>[],
  options: PipelineOptions
): PipelineResult[] {
  return payloads.map((payload) => runPipeline(payload, options));
}

export function filterFailedResults(results: PipelineResult[]): PipelineResult[] {
  return results.filter((r) => r.report.violations.length > 0);
}

export function filterPassedResults(results: PipelineResult[]): PipelineResult[] {
  return results.filter((r) => r.report.violations.length === 0);
}
