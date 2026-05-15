import { Schema, SchemaField, DriftReport } from './types';

/**
 * Serializes a Schema object to a plain JSON-compatible object.
 */
export function serializeSchema(schema: Schema): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.fields)) {
    fields[key] = serializeField(field);
  }
  return {
    name: schema.name,
    fields,
  };
}

/**
 * Serializes a single SchemaField to a plain object.
 */
export function serializeField(field: SchemaField): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: field.type,
    required: field.required,
  };
  if (field.nested) {
    result.nested = serializeSchema(field.nested);
  }
  if (field.items) {
    result.items = serializeField(field.items);
  }
  return result;
}

/**
 * Deserializes a plain object back into a Schema.
 */
export function deserializeSchema(raw: Record<string, unknown>): Schema {
  if (typeof raw.name !== 'string') {
    throw new Error('Invalid schema: missing or invalid "name" field');
  }
  if (typeof raw.fields !== 'object' || raw.fields === null) {
    throw new Error('Invalid schema: missing or invalid "fields" field');
  }
  const fields: Record<string, SchemaField> = {};
  for (const [key, value] of Object.entries(raw.fields as Record<string, unknown>)) {
    fields[key] = deserializeField(value as Record<string, unknown>);
  }
  return { name: raw.name, fields };
}

/**
 * Deserializes a plain object back into a SchemaField.
 */
export function deserializeField(raw: Record<string, unknown>): SchemaField {
  if (typeof raw.type !== 'string') {
    throw new Error('Invalid field: missing or invalid "type"');
  }
  const field: SchemaField = {
    type: raw.type as SchemaField['type'],
    required: raw.required === true,
  };
  if (raw.nested && typeof raw.nested === 'object') {
    field.nested = deserializeSchema(raw.nested as Record<string, unknown>);
  }
  if (raw.items && typeof raw.items === 'object') {
    field.items = deserializeField(raw.items as Record<string, unknown>);
  }
  return field;
}

/**
 * Serializes a DriftReport to a JSON string.
 */
export function serializeReport(report: DriftReport): string {
  return JSON.stringify({
    schemaName: report.schemaName,
    passed: report.passed,
    violations: report.violations.map((v) => ({ ...v })),
    timestamp: report.timestamp ?? new Date().toISOString(),
  }, null, 2);
}
