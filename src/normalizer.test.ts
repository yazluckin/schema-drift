import { normalizePayload, normalizeField, stripUnknownFields } from './normalizer';
import { SchemaDefinition, SchemaField } from './types';

const mockSchema: SchemaDefinition = {
  name: 'UserSchema',
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
    active: { type: 'boolean', required: false },
    tags: { type: 'array', required: false },
  },
};

describe('normalizeField', () => {
  it('coerces string to number when field type is number', () => {
    const field: SchemaField = { type: 'number', required: true };
    const result = normalizeField('42', field, 'id');
    expect(result).toEqual({ value: 42, coerced: true });
  });

  it('does not coerce non-numeric string to number', () => {
    const field: SchemaField = { type: 'number', required: true };
    const result = normalizeField('abc', field, 'id');
    expect(result).toEqual({ value: 'abc', coerced: false });
  });

  it('coerces number to string when field type is string', () => {
    const field: SchemaField = { type: 'string', required: true };
    const result = normalizeField(99, field, 'name');
    expect(result).toEqual({ value: '99', coerced: true });
  });

  it('coerces "true" string to boolean true', () => {
    const field: SchemaField = { type: 'boolean', required: false };
    const result = normalizeField('true', field, 'active');
    expect(result).toEqual({ value: true, coerced: true });
  });

  it('coerces 0 to boolean false', () => {
    const field: SchemaField = { type: 'boolean', required: false };
    const result = normalizeField(0, field, 'active');
    expect(result).toEqual({ value: false, coerced: true });
  });

  it('coerces JSON string to array when field type is array', () => {
    const field: SchemaField = { type: 'array', required: false };
    const result = normalizeField('["a","b"]', field, 'tags');
    expect(result).toEqual({ value: ['a', 'b'], coerced: true });
  });

  it('returns value unchanged when type already matches', () => {
    const field: SchemaField = { type: 'number', required: true };
    const result = normalizeField(10, field, 'id');
    expect(result).toEqual({ value: 10, coerced: false });
  });

  it('returns null unchanged', () => {
    const field: SchemaField = { type: 'string', required: false };
    const result = normalizeField(null, field, 'name');
    expect(result).toEqual({ value: null, coerced: false });
  });
});

describe('normalizePayload', () => {
  it('normalizes multiple fields and reports coerced keys', () => {
    const payload = { id: '7', name: 'Alice', active: '1', tags: '["x"]' };
    const { normalized, coerced } = normalizePayload(payload, mockSchema);
    expect(normalized.id).toBe(7);
    expect(normalized.active).toBe(true);
    expect(normalized.tags).toEqual(['x']);
    expect(coerced).toContain('id');
    expect(coerced).toContain('active');
  });

  it('leaves already-valid fields untouched', () => {
    const payload = { id: 1, name: 'Bob', active: true, tags: [] };
    const { coerced } = normalizePayload(payload, mockSchema);
    expect(coerced).toHaveLength(0);
  });
});

describe('stripUnknownFields', () => {
  it('removes keys not present in schema', () => {
    const payload = { id: 1, name: 'Carol', unknownField: 'extra', anotherExtra: 42 };
    const { stripped, removedKeys } = stripUnknownFields(payload, mockSchema);
    expect(stripped).not.toHaveProperty('unknownField');
    expect(stripped).not.toHaveProperty('anotherExtra');
    expect(removedKeys).toEqual(expect.arrayContaining(['unknownField', 'anotherExtra']));
  });

  it('keeps all valid schema keys', () => {
    const payload = { id: 1, name: 'Dave', active: false };
    const { stripped } = stripUnknownFields(payload, mockSchema);
    expect(stripped).toHaveProperty('id', 1);
    expect(stripped).toHaveProperty('name', 'Dave');
  });
});
