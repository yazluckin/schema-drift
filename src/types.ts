export type PrimitiveType = 'string' | 'number' | 'boolean' | 'null' | 'undefined';

export type FieldType = PrimitiveType | 'object' | 'array' | 'unknown';

export interface FieldSchema {
  type: FieldType;
  required: boolean;
  nullable?: boolean;
  items?: FieldSchema;        // for arrays
  properties?: SchemaMap;    // for objects
}

export type SchemaMap = Record<string, FieldSchema>;

export interface Schema {
  name: string;
  version?: string;
  fields: SchemaMap;
}

export interface Violation {
  field: string;
  expectedType: FieldType;
  receivedType: FieldType;
  message: string;
  severity: 'error' | 'warning';
}

export interface DriftReport {
  schemaName: string;
  timestamp: string;
  violations: Violation[];
  passed: boolean;
  summary: string;
}

export interface SchemaSnapshot {
  schema: Schema;
  capturedAt: string;
  source: string;
}

export interface SnapshotDiff {
  added: string[];
  removed: string[];
  changed: string[];
  identical: boolean;
}

export interface EvolutionEntry {
  snapshotId: string;
  schema: Schema;
  capturedAt: string;
  source: string;
  diff?: SnapshotDiff;
}
