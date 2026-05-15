import { Schema, SchemaField, DriftReport, Violation } from './types';
import { detectDrift } from './detector';

export interface ComparisonResult {
  added: string[];
  removed: string[];
  changed: Array<{ field: string; from: SchemaField; to: SchemaField }>;
  compatible: boolean;
}

/**
 * Compares two schemas and returns a structural diff.
 */
export function compareSchemas(base: Schema, updated: Schema): ComparisonResult {
  const added: string[] = [];
  const removed: string[] = [];
  const changed: Array<{ field: string; from: SchemaField; to: SchemaField }> = [];

  const baseKeys = new Set(Object.keys(base.fields));
  const updatedKeys = new Set(Object.keys(updated.fields));

  for (const key of updatedKeys) {
    if (!baseKeys.has(key)) {
      added.push(key);
    }
  }

  for (const key of baseKeys) {
    if (!updatedKeys.has(key)) {
      removed.push(key);
    } else {
      const baseField = base.fields[key];
      const updatedField = updated.fields[key];
      if (!fieldsEqual(baseField, updatedField)) {
        changed.push({ field: key, from: baseField, to: updatedField });
      }
    }
  }

  const compatible = removed.length === 0 && changed.length === 0;

  return { added, removed, changed, compatible };
}

function fieldsEqual(a: SchemaField, b: SchemaField): boolean {
  return (
    a.type === b.type &&
    a.required === b.required &&
    a.nullable === b.nullable
  );
}

/**
 * Validates a payload against both schemas and returns combined drift reports.
 */
export function comparePayloadAgainstSchemas(
  payload: Record<string, unknown>,
  base: Schema,
  updated: Schema
): { baseReport: DriftReport; updatedReport: DriftReport; regressions: Violation[] } {
  const baseReport = detectDrift(payload, base);
  const updatedReport = detectDrift(payload, updated);

  const baseViolationFields = new Set(baseReport.violations.map((v) => v.field));
  const regressions = updatedReport.violations.filter(
    (v) => !baseViolationFields.has(v.field)
  );

  return { baseReport, updatedReport, regressions };
}
