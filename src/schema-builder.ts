import { SchemaDefinition, FieldDefinition, FieldType } from './types';

/**
 * Infers a SchemaDefinition from a sample JSON object at runtime.
 * Useful for bootstrapping schema validation from example payloads.
 */
export function inferSchema(sample: Record<string, unknown>, name = 'InferredSchema'): SchemaDefinition {
  const fields: Record<string, FieldDefinition> = {};

  for (const [key, value] of Object.entries(sample)) {
    fields[key] = inferField(value);
  }

  return { name, fields };
}

function inferField(value: unknown): FieldDefinition {
  if (value === null || value === undefined) {
    return { type: 'any', required: false };
  }

  if (Array.isArray(value)) {
    const itemType: FieldType = value.length > 0 ? inferPrimitive(value[0]) : 'any';
    return { type: 'array', required: true, itemType };
  }

  if (typeof value === 'object') {
    const nested = inferSchema(value as Record<string, unknown>);
    return { type: 'object', required: true, nested };
  }

  return { type: inferPrimitive(value), required: true };
}

function inferPrimitive(value: unknown): FieldType {
  switch (typeof value) {
    case 'string':  return 'string';
    case 'number':  return 'number';
    case 'boolean': return 'boolean';
    default:        return 'any';
  }
}

/**
 * Merges two SchemaDefinitions, marking fields absent in either as optional.
 */
export function mergeSchemas(
  base: SchemaDefinition,
  incoming: SchemaDefinition,
  name?: string
): SchemaDefinition {
  const allKeys = new Set([
    ...Object.keys(base.fields),
    ...Object.keys(incoming.fields),
  ]);

  const fields: Record<string, FieldDefinition> = {};

  for (const key of allKeys) {
    const baseField    = base.fields[key];
    const incomingField = incoming.fields[key];

    if (baseField && incomingField) {
      // Both present — keep base definition, preserve required only if both agree
      fields[key] = {
        ...baseField,
        required: baseField.required && incomingField.required,
      };
    } else {
      // Only one side has it — mark as optional
      fields[key] = { ...(baseField ?? incomingField), required: false };
    }
  }

  return { name: name ?? base.name, fields };
}
