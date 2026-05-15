import {
  formatDiff,
  formatEvolutionEntry,
  formatEvolutionHistory,
  summarizeEvolution,
} from './evolution-reporter';
import { EvolutionEntry, SnapshotDiff } from './types';

const identicalDiff: SnapshotDiff = { added: [], removed: [], changed: [], identical: true };

const activeDiff: SnapshotDiff = {
  added: ['email'],
  removed: ['legacyId'],
  changed: ['name'],
  identical: false,
};

const mockEntry = (id: string, diff?: SnapshotDiff): EvolutionEntry => ({
  snapshotId: id,
  schema: { name: 'User', fields: {} },
  capturedAt: '2024-01-01T00:00:00.000Z',
  source: 'test',
  diff,
});

describe('formatDiff', () => {
  it('reports no changes for identical diff', () => {
    expect(formatDiff(identicalDiff)).toContain('No changes detected');
  });

  it('lists added fields', () => {
    expect(formatDiff(activeDiff)).toContain('+ Added fields: email');
  });

  it('lists removed fields', () => {
    expect(formatDiff(activeDiff)).toContain('- Removed fields: legacyId');
  });

  it('lists changed fields', () => {
    expect(formatDiff(activeDiff)).toContain('~ Changed fields: name');
  });
});

describe('formatEvolutionEntry', () => {
  it('includes snapshot id and source', () => {
    const result = formatEvolutionEntry(mockEntry('User-1'));
    expect(result).toContain('User-1');
    expect(result).toContain('source: test');
  });

  it('shows initial snapshot message when no diff', () => {
    const result = formatEvolutionEntry(mockEntry('User-1'));
    expect(result).toContain('Initial snapshot');
  });

  it('shows diff when present', () => {
    const result = formatEvolutionEntry(mockEntry('User-2', activeDiff));
    expect(result).toContain('+ Added fields: email');
  });
});

describe('formatEvolutionHistory', () => {
  it('shows message when no history', () => {
    const result = formatEvolutionHistory('User', []);
    expect(result).toContain('No evolution history found');
  });

  it('includes schema name and snapshot count', () => {
    const result = formatEvolutionHistory('User', [mockEntry('User-1'), mockEntry('User-2', activeDiff)]);
    expect(result).toContain('User');
    expect(result).toContain('2 snapshot(s)');
  });
});

describe('summarizeEvolution', () => {
  it('aggregates changes across entries', () => {
    const entries = [
      mockEntry('User-1'),
      mockEntry('User-2', activeDiff),
      mockEntry('User-3', { added: ['phone'], removed: [], changed: [], identical: false }),
    ];
    const result = summarizeEvolution(entries);
    expect(result).toContain('+2 added');
    expect(result).toContain('-1 removed');
    expect(result).toContain('~1 changed');
  });

  it('handles entries with no diffs', () => {
    const result = summarizeEvolution([mockEntry('User-1')]);
    expect(result).toContain('+0 added');
  });
});
