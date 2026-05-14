/** Supported primitive field types for schema validation. */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'any';

/** Definition of a single field within a schema. */
export interface FieldDefinition {
  type: FieldType;
  required: boolean;
  /** For array fields: the expected type of each element. */
  itemType?: FieldType;
  /** For object fields: the nested schema definition. */
  nested?: SchemaDefinition;
}

/** Top-level schema definition describing an expected JSON shape. */
export interface SchemaDefinition {
  name: string;
  fields: Record<string, FieldDefinition>;
}

/** A single detected mismatch between schema and payload. */
export interface DriftViolation {
  field: string;
  expected: FieldType;
  received: string;
  message: string;
}

/** Aggregated result of a schema drift detection run. */
export interface DriftReport {
  schema: string;
  timestamp: string;
  violations: DriftViolation[];
  passed: boolean;
}
