import { compareSchemas, comparePayloadAgainstSchemas } from './comparator';
import { Schema } from './types';

const baseSchema: Schema = {
  name: 'User',
  fields: {
    id: { type: 'number', required: true, nullable: false },
    name: { type: 'string', required: true, nullable: false },
    email: { type: 'string', required: false, nullable: true },
  },
};

const updatedSchema: Schema = {
  name: 'User',
  fields: {
    id: { type: 'number', required: true, nullable: false },
    name: { type: 'string', required: true, nullable: false },
    email: { type: 'string', required: true, nullable: false },
    role: { type: 'string', required: true, nullable: false },
  },
};

describe('compareSchemas', () => {
  it('detects added fields', () => {
    const result = compareSchemas(baseSchema, updatedSchema);
    expect(result.added).toContain('role');
  });

  it('detects removed fields', () => {
    const result = compareSchemas(updatedSchema, baseSchema);
    expect(result.removed).toContain('role');
  });

  it('detects changed fields', () => {
    const result = compareSchemas(baseSchema, updatedSchema);
    const emailChange = result.changed.find((c) => c.field === 'email');
    expect(emailChange).toBeDefined();
    expect(emailChange?.from.required).toBe(false);
    expect(emailChange?.to.required).toBe(true);
  });

  it('marks schema as compatible when only fields are added', () => {
    const schemaWithExtra: Schema = {
      name: 'User',
      fields: {
        ...baseSchema.fields,
        extra: { type: 'string', required: false, nullable: true },
      },
    };
    const result = compareSchemas(baseSchema, schemaWithExtra);
    expect(result.compatible).toBe(true);
  });

  it('marks schema as incompatible when fields are removed', () => {
    const result = compareSchemas(updatedSchema, baseSchema);
    expect(result.compatible).toBe(false);
  });

  it('marks schema as incompatible when fields are changed', () => {
    const result = compareSchemas(baseSchema, updatedSchema);
    expect(result.compatible).toBe(false);
  });
});

describe('comparePayloadAgainstSchemas', () => {
  it('identifies regressions introduced by the updated schema', () => {
    const payload = { id: 1, name: 'Alice', email: null };
    const { regressions } = comparePayloadAgainstSchemas(
      payload as Record<string, unknown>,
      baseSchema,
      updatedSchema
    );
    const emailRegression = regressions.find((v) => v.field === 'email');
    expect(emailRegression).toBeDefined();
  });

  it('returns no regressions when payload satisfies both schemas', () => {
    const payload = { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' };
    const { regressions } = comparePayloadAgainstSchemas(
      payload as Record<string, unknown>,
      baseSchema,
      updatedSchema
    );
    expect(regressions).toHaveLength(0);
  });
});
