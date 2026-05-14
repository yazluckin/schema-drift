import { SchemaDefinition, FieldSchema, DriftResult, DriftViolation, SchemaType } from './types';

function getRuntimeType(value: unknown): SchemaType {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return t;
  if (t === 'object') return 'object';
  return 'unknown';
}

function validateField(
  fieldSchema: FieldSchema,
  value: unknown,
  path: string,
  violations: DriftViolation[]
): void {
  const runtimeType = getRuntimeType(value);

  if (value === undefined || value === null) {
    if (fieldSchema.required) {
      violations.push({
        path,
        expected: fieldSchema.type,
        received: runtimeType,
        message: `Field "${path}" is required but received ${runtimeType}.`,
      });
    }
    return;
  }

  if (runtimeType !== fieldSchema.type) {
    violations.push({
      path,
      expected: fieldSchema.type,
      received: runtimeType,
      message: `Type mismatch at "${path}": expected ${fieldSchema.type}, got ${runtimeType}.`,
    });
    return;
  }

  if (fieldSchema.type === 'object' && fieldSchema.children) {
    validateSchema(fieldSchema.children, value as Record<string, unknown>, path, violations);
  }

  if (fieldSchema.type === 'array' && fieldSchema.items) {
    const arr = value as unknown[];
    arr.forEach((item, index) => {
      validateField(fieldSchema.items!, item, `${path}[${index}]`, violations);
    });
  }
}

function validateSchema(
  schema: SchemaDefinition,
  payload: Record<string, unknown>,
  basePath: string,
  violations: DriftViolation[]
): void {
  for (const [fieldName, fieldSchema] of Object.entries(schema)) {
    const path = basePath ? `${basePath}.${fieldName}` : fieldName;
    validateField(fieldSchema, payload[fieldName], path, violations);
  }
}

export function detectDrift(
  schema: SchemaDefinition,
  payload: unknown
): DriftResult {
  const violations: DriftViolation[] = [];

  if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
    return {
      valid: false,
      violations: [{
        path: '$root',
        expected: 'object',
        received: getRuntimeType(payload),
        message: 'Root payload must be a non-null object.',
      }],
    };
  }

  validateSchema(schema, payload as Record<string, unknown>, '', violations);

  return {
    valid: violations.length === 0,
    violations,
  };
}
