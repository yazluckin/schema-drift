import {
  formatRegistryEntry,
  formatRegistrySnapshot,
  summarizeRegistry,
} from './schema-registry-reporter';
import { registerSchemaVersion, clearRegistry } from './schema-registry';
import { Schema } from './types';

const schema: Schema = {
  fields: [
    { name: 'id', type: 'number', required: true },
    { name: 'title', type: 'string', required: true },
  ],
};

beforeEach(() => clearRegistry());

describe('formatRegistryEntry', () => {
  it('includes name, version, and timestamp', () => {
    const entry = registerSchemaVersion('Post', schema, 'first draft');
    const output = formatRegistryEntry('Post', entry);
    expect(output).toContain('[Post]');
    expect(output).toContain('v1');
    expect(output).toContain('first draft');
  });

  it('omits description when not provided', () => {
    const entry = registerSchemaVersion('Post', schema);
    const output = formatRegistryEntry('Post', entry);
    expect(output).not.toContain('—');
  });
});

describe('formatRegistrySnapshot', () => {
  it('returns empty message when registry is empty', () => {
    const output = formatRegistrySnapshot();
    expect(output).toBe('Schema registry is empty.');
  });

  it('includes all registered schemas and versions', () => {
    registerSchemaVersion('Post', schema, 'v1');
    registerSchemaVersion('Post', schema, 'v2');
    registerSchemaVersion('Comment', schema);
    const output = formatRegistrySnapshot();
    expect(output).toContain('Post');
    expect(output).toContain('2 versions');
    expect(output).toContain('Comment');
    expect(output).toContain('1 version');
  });

  it('contains the registry header', () => {
    registerSchemaVersion('X', schema);
    expect(formatRegistrySnapshot()).toContain('Schema Registry Snapshot');
  });
});

describe('summarizeRegistry', () => {
  it('returns empty object when registry is empty', () => {
    expect(summarizeRegistry()).toEqual({});
  });

  it('returns version counts per schema name', () => {
    registerSchemaVersion('Alpha', schema);
    registerSchemaVersion('Alpha', schema);
    registerSchemaVersion('Beta', schema);
    const summary = summarizeRegistry();
    expect(summary['Alpha']).toBe(2);
    expect(summary['Beta']).toBe(1);
  });
});
