import { SchemaField, SchemaDefinition } from './types';

/**
 * Normalizes a JSON payload by coercing values to match expected schema types.
 * Returns the normalized payload and a list of fields that were coerced.
 */
export function normalizePayload(
  payload: Record<string, unknown>,
  schema: SchemaDefinition
): { normalized: Record<string, unknown>; coerced: string[] } {
  const normalized: Record<string, unknown> = { ...payload };
  const coerced: string[] = [];

  for (const [key, field] of Object.entries(schema.fields)) {
    if (!(key in payload)) continue;

    const value = payload[key];
    const result = normalizeField(value, field, key);

    if (result.coerced) {
      normalized[key] = result.value;
      coerced.push(key);
    }
  }

  return { normalized, coerced };
}

/**
 * Attempts to coerce a single value to the expected field type.
 */
export function normalizeField(
  value: unknown,
  field: SchemaField,
  path: string
): { value: unknown; coerced: boolean } {
  if (value === null || value === undefined) {
    return { value, coerced: false };
  }

  switch (field.type) {
    case 'number': {
      if (typeof value === 'string' && !isNaN(Number(value))) {
        return { value: Number(value), coerced: true };
      }
      break;
    }
    case 'string': {
      if (typeof value === 'number' || typeof value === 'boolean') {
        return { value: String(value), coerced: true };
      }
      break;
    }
    case 'boolean': {
      if (value === 'true') return { value: true, coerced: true };
      if (value === 'false') return { value: false, coerced: true };
      if (value === 1) return { value: true, coerced: true };
      if (value === 0) return { value: false, coerced: true };
      break;
    }
    case 'array': {
      if (!Array.isArray(value) && typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) return { value: parsed, coerced: true };
        } catch {
          // not parseable, leave as-is
        }
      }
      break;
    }
  }

  return { value, coerced: false };
}

/**
 * Strips unknown keys from a payload that are not present in the schema.
 */
export function stripUnknownFields(
  payload: Record<string, unknown>,
  schema: SchemaDefinition
): { stripped: Record<string, unknown>; removedKeys: string[] } {
  const schemaKeys = new Set(Object.keys(schema.fields));
  const stripped: Record<string, unknown> = {};
  const removedKeys: string[] = [];

  for (const [key, value] of Object.entries(payload)) {
    if (schemaKeys.has(key)) {
      stripped[key] = value;
    } else {
      removedKeys.push(key);
    }
  }

  return { stripped, removedKeys };
}
