import { inferSchema, mergeSchemas } from './schema-builder';
import { SchemaDefinition } from './types';

describe('inferSchema', () => {
  it('infers primitive field types from a flat object', () => {
    const sample = { id: 1, name: 'Alice', active: true };
    const schema = inferSchema(sample, 'User');

    expect(schema.name).toBe('User');
    expect(schema.fields.id.type).toBe('number');
    expect(schema.fields.name.type).toBe('string');
    expect(schema.fields.active.type).toBe('boolean');
    expect(schema.fields.id.required).toBe(true);
  });

  it('marks null/undefined fields as non-required with type any', () => {
    const sample = { id: 1, nickname: null };
    const schema = inferSchema(sample);

    expect(schema.fields.nickname.type).toBe('any');
    expect(schema.fields.nickname.required).toBe(false);
  });

  it('infers array fields with item type', () => {
    const sample = { tags: ['typescript', 'json'] };
    const schema = inferSchema(sample);

    expect(schema.fields.tags.type).toBe('array');
    expect(schema.fields.tags.itemType).toBe('string');
  });

  it('infers empty array fields with itemType any', () => {
    const sample = { items: [] };
    const schema = inferSchema(sample);

    expect(schema.fields.items.type).toBe('array');
    expect(schema.fields.items.itemType).toBe('any');
  });

  it('infers nested object fields', () => {
    const sample = { address: { city: 'NYC', zip: '10001' } };
    const schema = inferSchema(sample);

    expect(schema.fields.address.type).toBe('object');
    expect(schema.fields.address.nested?.fields.city.type).toBe('string');
  });
});

describe('mergeSchemas', () => {
  const schemaA: SchemaDefinition = {
    name: 'A',
    fields: {
      id:    { type: 'number',  required: true },
      name:  { type: 'string',  required: true },
    },
  };

  const schemaB: SchemaDefinition = {
    name: 'B',
    fields: {
      id:    { type: 'number',  required: true },
      email: { type: 'string',  required: true },
    },
  };

  it('includes fields present in both schemas', () => {
    const merged = mergeSchemas(schemaA, schemaB);
    expect(merged.fields.id).toBeDefined();
  });

  it('marks fields only in one schema as optional', () => {
    const merged = mergeSchemas(schemaA, schemaB);
    expect(merged.fields.name.required).toBe(false);
    expect(merged.fields.email.required).toBe(false);
  });

  it('keeps required true only when both schemas agree', () => {
    const merged = mergeSchemas(schemaA, schemaB);
    expect(merged.fields.id.required).toBe(true);
  });

  it('uses provided name for merged schema', () => {
    const merged = mergeSchemas(schemaA, schemaB, 'Merged');
    expect(merged.name).toBe('Merged');
  });
});
