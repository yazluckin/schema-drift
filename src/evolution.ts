import { Schema, SchemaSnapshot, SnapshotDiff, EvolutionEntry } from './types';
import { compareSchemas } from './comparator';

const snapshotStore: Map<string, EvolutionEntry[]> = new Map();

export function captureSnapshot(schema: Schema, source: string = 'manual'): SchemaSnapshot {
  return {
    schema,
    capturedAt: new Date().toISOString(),
    source,
  };
}

export function recordEvolution(snapshot: SchemaSnapshot): EvolutionEntry {
  const schemaName = snapshot.schema.name;
  const history = snapshotStore.get(schemaName) ?? [];

  const snapshotId = `${schemaName}-${history.length + 1}`;
  const previous = history.length > 0 ? history[history.length - 1].schema : undefined;

  const entry: EvolutionEntry = {
    snapshotId,
    schema: snapshot.schema,
    capturedAt: snapshot.capturedAt,
    source: snapshot.source,
    diff: previous ? diffSchemas(previous, snapshot.schema) : undefined,
  };

  snapshotStore.set(schemaName, [...history, entry]);
  return entry;
}

export function getEvolutionHistory(schemaName: string): EvolutionEntry[] {
  return snapshotStore.get(schemaName) ?? [];
}

export function clearHistory(schemaName?: string): void {
  if (schemaName) {
    snapshotStore.delete(schemaName);
  } else {
    snapshotStore.clear();
  }
}

export function diffSchemas(previous: Schema, current: Schema): SnapshotDiff {
  const prevKeys = new Set(Object.keys(previous.fields));
  const currKeys = new Set(Object.keys(current.fields));

  const added = [...currKeys].filter((k) => !prevKeys.has(k));
  const removed = [...prevKeys].filter((k) => !currKeys.has(k));
  const changed: string[] = [];

  for (const key of prevKeys) {
    if (currKeys.has(key)) {
      const result = compareSchemas(previous, current);
      if (result.some((c) => c.field === key)) {
        changed.push(key);
      }
    }
  }

  return {
    added,
    removed,
    changed,
    identical: added.length === 0 && removed.length === 0 && changed.length === 0,
  };
}

export function getLatestSnapshot(schemaName: string): EvolutionEntry | undefined {
  const history = snapshotStore.get(schemaName);
  return history && history.length > 0 ? history[history.length - 1] : undefined;
}

/**
 * Returns the evolution entry at a specific index in the history for the given schema.
 * Supports negative indices (e.g., -1 for the last entry, -2 for the second to last).
 */
export function getSnapshotAt(schemaName: string, index: number): EvolutionEntry | undefined {
  const history = snapshotStore.get(schemaName);
  if (!history || history.length === 0) return undefined;

  const resolvedIndex = index < 0 ? history.length + index : index;
  if (resolvedIndex < 0 || resolvedIndex >= history.length) return undefined;

  return history[resolvedIndex];
}
