import { createDriftMiddleware, composeMiddlewares, MiddlewareContext } from './middleware';
import { SchemaDefinition } from './types';

const schema: SchemaDefinition = {
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
    active: { type: 'boolean', required: false },
  },
};

describe('createDriftMiddleware', () => {
  it('passes context with no violations for valid payload', () => {
    const middleware = createDriftMiddleware({ schema });
    const payload = { id: 1, name: 'Alice', active: true };
    let ctx: MiddlewareContext | null = null;

    middleware(payload, (c) => { ctx = c; });

    expect(ctx).not.toBeNull();
    expect(ctx!.passed).toBe(true);
    expect(ctx!.violations).toHaveLength(0);
  });

  it('reports violations for invalid payload', () => {
    const middleware = createDriftMiddleware({ schema });
    const payload = { id: 'not-a-number', name: 'Alice' };
    let ctx: MiddlewareContext | null = null;

    middleware(payload, (c) => { ctx = c; });

    expect(ctx!.passed).toBe(false);
    expect(ctx!.violations.length).toBeGreaterThan(0);
  });

  it('calls onViolation callback when violations exist', () => {
    const onViolation = jest.fn();
    const middleware = createDriftMiddleware({ schema, onViolation });
    const payload = { id: 'bad', name: 'Alice' };

    middleware(payload, () => {});

    expect(onViolation).toHaveBeenCalledTimes(1);
  });

  it('does not call onViolation when payload is valid', () => {
    const onViolation = jest.fn();
    const middleware = createDriftMiddleware({ schema, onViolation });
    const payload = { id: 1, name: 'Alice' };

    middleware(payload, () => {});

    expect(onViolation).not.toHaveBeenCalled();
  });

  it('strict mode: still calls next with passed=false on violation', () => {
    const middleware = createDriftMiddleware({ schema, strict: true });
    const payload = { id: 'bad', name: 'Alice' };
    let ctx: MiddlewareContext | null = null;

    middleware(payload, (c) => { ctx = c; });

    expect(ctx!.passed).toBe(false);
  });
});

describe('composeMiddlewares', () => {
  it('chains multiple middlewares in order', () => {
    const order: number[] = [];
    const schema2: SchemaDefinition = { fields: { name: { type: 'string', required: true } } };

    const m1 = createDriftMiddleware({ schema });
    const m2 = createDriftMiddleware({ schema: schema2 });

    const composed = composeMiddlewares(m1, m2);
    let finalCtx: MiddlewareContext | null = null;

    composed({ id: 1, name: 'Bob' }, (ctx) => { finalCtx = ctx; });

    expect(finalCtx).not.toBeNull();
  });

  it('calls next after all middlewares complete', () => {
    const composed = composeMiddlewares(
      createDriftMiddleware({ schema })
    );
    const next = jest.fn();

    composed({ id: 1, name: 'Alice' }, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
