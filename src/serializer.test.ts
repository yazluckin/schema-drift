import {
  serializeSchema,
  deserializeSchema,
  serializeField,
  deserializeField,
  serializeReport,
} from './serializer';
import { Schema, SchemaField, DriftReport } from './types';

const sampleSchema: Schema = {
  name: 'User',
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: false },
    address: {
      type: 'object',
      required: false,
      nested: {
        name: 'address',
        fields: {
          street: { type: 'string', required: true },
        },
      },
    },
    tags: {
      type: 'array',
      required: false,
      items: { type: 'string', required: false },
    },
  },
};

describe('serializeSchema / deserializeSchema', () => {
  it('round-trips a schema without data loss', () => {
    const serialized = serializeSchema(sampleSchema);
    const restored = deserializeSchema(serialized);
    expect(restored.name).toBe(sampleSchema.name);
    expect(restored.fields.id.type).toBe('number');
    expect(restored.fields.id.required).toBe(true);
    expect(restored.fields.address.nested?.fields.street.type).toBe('string');
    expect(restored.fields.tags.items?.type).toBe('string');
  });

  it('throws when schema name is missing', () => {
    expect(() => deserializeSchema({ fields: {} })).toThrow(
      'Invalid schema: missing or invalid "name" field'
    );
  });

  it('throws when fields are missing', () => {
    expect(() => deserializeSchema({ name: 'Test' })).toThrow(
      'Invalid schema: missing or invalid "fields" field'
    );
  });
});

describe('serializeField / deserializeField', () => {
  it('round-trips a primitive field', () => {
    const field: SchemaField = { type: 'boolean', required: true };
    const restored = deserializeField(serializeField(field));
    expect(restored.type).toBe('boolean');
    expect(restored.required).toBe(true);
  });

  it('throws when type is missing', () => {
    expect(() => deserializeField({ required: true })).toThrow(
      'Invalid field: missing or invalid "type"'
    );
  });
});

describe('serializeReport', () => {
  it('serializes a drift report to a JSON string', () => {
    const report: DriftReport = {
      schemaName: 'User',
      passed: false,
      violations: [
        { field: 'id', expected: 'number', received: 'string', message: 'Type mismatch' },
      ],
    };
    const json = serializeReport(report);
    const parsed = JSON.parse(json);
    expect(parsed.schemaName).toBe('User');
    expect(parsed.passed).toBe(false);
    expect(parsed.violations).toHaveLength(1);
    expect(parsed.timestamp).toBeDefined();
  });
});
