/**
 * Supported primitive and composite types within a schema field.
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'
  | 'unknown';

/**
 * Describes a single field within a Schema.
 */
export interface SchemaField {
  type: FieldType;
  required: boolean;
  /** For object fields: nested schema definition */
  nested?: Schema;
  /** For array fields: schema of each item */
  items?: SchemaField;
}

/**
 * Represents the schema of a TypeScript interface or object shape.
 */
export interface Schema {
  name: string;
  fields: Record<string, SchemaField>;
}

/**
 * Describes a single drift violation found during validation.
 */
export interface Violation {
  field: string;
  expected: string;
  received: string;
  message: string;
}

/**
 * The result produced by detectDrift, containing all violations found.
 */
export interface DriftReport {
  schemaName: string;
  passed: boolean;
  violations: Violation[];
  timestamp?: string;
}
