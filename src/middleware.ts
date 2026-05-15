import { detectDrift } from './detector';
import { SchemaDefinition, DriftReport, DriftViolation } from './types';
import { normalizePayload } from './normalizer';

export interface MiddlewareOptions {
  schema: SchemaDefinition;
  onViolation?: (report: DriftReport) => void;
  strict?: boolean;
  normalize?: boolean;
}

export interface MiddlewareContext {
  payload: Record<string, unknown>;
  violations: DriftViolation[];
  passed: boolean;
}

export type MiddlewareHandler = (
  payload: Record<string, unknown>,
  next: (ctx: MiddlewareContext) => void
) => void;

export function createDriftMiddleware(options: MiddlewareOptions): MiddlewareHandler {
  const { schema, onViolation, strict = false, normalize = false } = options;

  return function driftMiddleware(
    payload: Record<string, unknown>,
    next: (ctx: MiddlewareContext) => void
  ): void {
    const input = normalize ? normalizePayload(payload, schema) : payload;
    const report = detectDrift(schema, input);

    if (report.violations.length > 0 && onViolation) {
      onViolation(report);
    }

    if (strict && report.violations.length > 0) {
      const ctx: MiddlewareContext = { payload: input, violations: report.violations, passed: false };
      next(ctx);
      return;
    }

    next({ payload: input, violations: report.violations, passed: report.violations.length === 0 });
  };
}

export function composeMiddlewares(...middlewares: MiddlewareHandler[]): MiddlewareHandler {
  return function composed(
    payload: Record<string, unknown>,
    next: (ctx: MiddlewareContext) => void
  ): void {
    let index = 0;
    let currentPayload = payload;

    function dispatch(ctx?: MiddlewareContext): void {
      if (ctx) currentPayload = ctx.payload;
      if (index >= middlewares.length) {
        next(ctx ?? { payload: currentPayload, violations: [], passed: true });
        return;
      }
      const middleware = middlewares[index++];
      middleware(currentPayload, dispatch);
    }

    dispatch();
  };
}
