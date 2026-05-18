import {
  registerSchemaVersion,
  getLatestSchema,
  getSchemaVersion,
  getAllVersions,
  listRegisteredSchemas,
  clearRegistry,
  hasSchema,
} from './schema-registry';
import { Schema } from './types';

const schemaA: Schema = {
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'string', required: true },
  ],
};

const schemaB: Schema = {
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'name', type: 'string', required: true },
    { name: 'email', type: 'string', required: false },
  ],
};

beforeEach(() => clearRegistry());

describe('registerSchemaVersion', () => {
  it('registers a schema with version 1', () => {
    const entry = registerSchemaVersion('User', schemaA, 'initial');
    expect(entry.version).toBe(1);
    expect(entry.description).toBe('initial');
  });

  it('increments version on subsequent registrations', () => {
    registerSchemaVersion('User', schemaA);
    const entry = registerSchemaVersion('User', schemaB);
    expect(entry.version).toBe(2);
  });
});

describe('getLatestSchema', () => {
  it('returns undefined for unknown schema', () => {
    expect(getLatestSchema('Unknown')).toBeUndefined();
  });

  it('returns the most recent entry', () => {
    registerSchemaVersion('User', schemaA);
    registerSchemaVersion('User', schemaB);
    const latest = getLatestSchema('User');
    expect(latest?.version).toBe(2);
    expect(latest?.schema.fields.length).toBe(3);
  });
});

describe('getSchemaVersion', () => {
  it('returns the correct versioned entry', () => {
    registerSchemaVersion('User', schemaA);
    registerSchemaVersion('User', schemaB);
    const v1 = getSchemaVersion('User', 1);
    expect(v1?.schema.fields.length).toBe(2);
  });

  it('returns undefined for non-existent version', () => {
    registerSchemaVersion('User', schemaA);
    expect(getSchemaVersion('User', 99)).toBeUndefined();
  });
});

describe('listRegisteredSchemas and hasSchema', () => {
  it('lists all registered schema names', () => {
    registerSchemaVersion('User', schemaA);
    registerSchemaVersion('Order', schemaB);
    const names = listRegisteredSchemas();
    expect(names).toContain('User');
    expect(names).toContain('Order');
  });

  it('hasSchema returns false when registry is empty', () => {
    expect(hasSchema('User')).toBe(false);
  });

  it('hasSchema returns true after registration', () => {
    registerSchemaVersion('User', schemaA);
    expect(hasSchema('User')).toBe(true);
  });
});

describe('getAllVersions', () => {
  it('returns all registered versions for a schema', () => {
    registerSchemaVersion('User', schemaA);
    registerSchemaVersion('User', schemaB);
    expect(getAllVersions('User').length).toBe(2);
  });

  it('returns empty array for unknown schema', () => {
    expect(getAllVersions('Ghost')).toEqual([]);
  });
});
