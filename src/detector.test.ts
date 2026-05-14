import { detectDrift } from './detector';
import { SchemaDefinition } from './types';

const userSchema: SchemaDefinition = {
  id: { type: 'number', required: true },
  name: { type: 'string', required: true },
  active: { type: 'boolean', required: false },
  address: {
    type: 'object',
    required: false,
    children: {
      street: { type: 'string', required: true },
      zip: { type: 'string', required: true },
    },
  },
  tags: {
    type: 'array',
    required: false,
    items: { type: 'string', required: true },
  },
};

describe('detectDrift', () => {
  it('returns valid for a fully matching payload', () => {
    const result = detectDrift(userSchema, {
      id: 1,
      name: 'Alice',
      active: true,
      address: { street: '123 Main St', zip: '90210' },
      tags: ['admin', 'user'],
    });
    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('detects a type mismatch on a primitive field', () => {
    const result = detectDrift(userSchema, { id: '1', name: 'Alice' });
    expect(result.valid).toBe(false);
    expect(result.violations[0].path).toBe('id');
    expect(result.violations[0].expected).toBe('number');
    expect(result.violations[0].received).toBe('string');
  });

  it('detects a missing required field', () => {
    const result = detectDrift(userSchema, { id: 1 });
    expect(result.valid).toBe(false);
    const nameMissing = result.violations.find(v => v.path === 'name');
    expect(nameMissing).toBeDefined();
  });

  it('detects nested object field type mismatch', () => {
    const result = detectDrift(userSchema, {
      id: 1,
      name: 'Bob',
      address: { street: 42, zip: '12345' },
    });
    expect(result.valid).toBe(false);
    const streetViolation = result.violations.find(v => v.path === 'address.street');
    expect(streetViolation).toBeDefined();
    expect(streetViolation?.received).toBe('number');
  });

  it('detects array item type mismatch', () => {
    const result = detectDrift(userSchema, { id: 1, name: 'Carol', tags: ['admin', 99] });
    expect(result.valid).toBe(false);
    const tagViolation = result.violations.find(v => v.path === 'tags[1]');
    expect(tagViolation).toBeDefined();
  });

  it('returns invalid when root payload is not an object', () => {
    const result = detectDrift(userSchema, 'not-an-object');
    expect(result.valid).toBe(false);
    expect(result.violations[0].path).toBe('$root');
  });
});
