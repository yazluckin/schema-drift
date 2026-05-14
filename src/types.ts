/**
 * Core types for schema-drift detection.
 */

export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'undefined';

export type SchemaType =
  | PrimitiveType
  | 'object'
  | 'array'
  | 'unknown';

export interface FieldSchema {
  type: SchemaType;
  required: boolean;
  children?: Record<string, FieldSchema>; // for object types
  items?: FieldSchema;                    // for array types
}

export interface SchemaDefinition {
  [fieldName: string]: FieldSchema;
}

export interface DriftViolation {
  path: string;
  expected: SchemaType;
  received: SchemaType;
  message: string;
}

export interface DriftResult {
  valid: boolean;
  violations: DriftViolation[];
}
