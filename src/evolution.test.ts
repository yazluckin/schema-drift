import {
  captureSnapshot,
  recordEvolution,
  getEvolutionHistory,
  clearHistory,
  diffSchemas,
  getLatestSnapshot,
} from './evolution';
import { Schema } from './types';

const baseSchema: Schema = {
  name: 'User',
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
  },
};

const updatedSchema: Schema = {
  name: 'User',
  fields: {
    id: { type: 'number', required: true },
    name: { type: 'string', required: true },
    email: { type: 'string', required: false },
  },
};

beforeEach(() => {
  clearHistory();
});

describe('captureSnapshot', () => {
  it('creates a snapshot with timestamp and source', () => {
    const snap = captureSnapshot(baseSchema, 'test');
    expect(snap.schema).toEqual(baseSchema);
    expect(snap.source).toBe('test');
    expect(snap.capturedAt).toBeTruthy();
  });

  it('defaults source to manual', () => {
    const snap = captureSnapshot(baseSchema);
    expect(snap.source).toBe('manual');
  });
});

describe('recordEvolution', () => {
  it('records first entry without diff', () => {
    const snap = captureSnapshot(baseSchema);
    const entry = recordEvolution(snap);
    expect(entry.snapshotId).toBe('User-1');
    expect(entry.diff).toBeUndefined();
  });

  it('records second entry with diff', () => {
    recordEvolution(captureSnapshot(baseSchema));
    const entry = recordEvolution(captureSnapshot(updatedSchema));
    expect(entry.snapshotId).toBe('User-2');
    expect(entry.diff).toBeDefined();
    expect(entry.diff?.added).toContain('email');
  });
});

describe('getEvolutionHistory', () => {
  it('returns empty array for unknown schema', () => {
    expect(getEvolutionHistory('Unknown')).toEqual([]);
  });

  it('returns all recorded entries', () => {
    recordEvolution(captureSnapshot(baseSchema));
    recordEvolution(captureSnapshot(updatedSchema));
    expect(getEvolutionHistory('User')).toHaveLength(2);
  });
});

describe('diffSchemas', () => {
  it('detects added fields', () => {
    const diff = diffSchemas(baseSchema, updatedSchema);
    expect(diff.added).toContain('email');
    expect(diff.identical).toBe(false);
  });

  it('detects removed fields', () => {
    const diff = diffSchemas(updatedSchema, baseSchema);
    expect(diff.removed).toContain('email');
  });

  it('reports identical when no changes', () => {
    const diff = diffSchemas(baseSchema, baseSchema);
    expect(diff.identical).toBe(true);
  });
});

describe('getLatestSnapshot', () => {
  it('returns undefined when no history', () => {
    expect(getLatestSnapshot('User')).toBeUndefined();
  });

  it('returns most recent entry', () => {
    recordEvolution(captureSnapshot(baseSchema));
    recordEvolution(captureSnapshot(updatedSchema));
    const latest = getLatestSnapshot('User');
    expect(latest?.snapshotId).toBe('User-2');
  });
});
