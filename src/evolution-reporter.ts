import { EvolutionEntry, SnapshotDiff } from './types';

export function formatDiff(diff: SnapshotDiff): string {
  if (diff.identical) return '  No changes detected.';

  const lines: string[] = [];
  if (diff.added.length > 0) {
    lines.push(`  + Added fields: ${diff.added.join(', ')}`);
  }
  if (diff.removed.length > 0) {
    lines.push(`  - Removed fields: ${diff.removed.join(', ')}`);
  }
  if (diff.changed.length > 0) {
    lines.push(`  ~ Changed fields: ${diff.changed.join(', ')}`);
  }
  return lines.join('\n');
}

export function formatEvolutionEntry(entry: EvolutionEntry): string {
  const lines: string[] = [
    `[${entry.snapshotId}] captured at ${entry.capturedAt} (source: ${entry.source})`,
  ];
  if (entry.diff) {
    lines.push(formatDiff(entry.diff));
  } else {
    lines.push('  Initial snapshot — no previous version to compare.');
  }
  return lines.join('\n');
}

export function formatEvolutionHistory(schemaName: string, entries: EvolutionEntry[]): string {
  if (entries.length === 0) {
    return `No evolution history found for schema "${schemaName}".`;
  }

  const header = `Evolution history for schema "${schemaName}" (${entries.length} snapshot(s)):`;
  const body = entries.map(formatEvolutionEntry).join('\n\n');
  return `${header}\n\n${body}`;
}

export function printEvolutionHistory(schemaName: string, entries: EvolutionEntry[]): void {
  console.log(formatEvolutionHistory(schemaName, entries));
}

export function summarizeEvolution(entries: EvolutionEntry[]): string {
  const totalAdded = entries.reduce((acc, e) => acc + (e.diff?.added.length ?? 0), 0);
  const totalRemoved = entries.reduce((acc, e) => acc + (e.diff?.removed.length ?? 0), 0);
  const totalChanged = entries.reduce((acc, e) => acc + (e.diff?.changed.length ?? 0), 0);
  return `Total changes across ${entries.length} snapshot(s): +${totalAdded} added, -${totalRemoved} removed, ~${totalChanged} changed.`;
}
