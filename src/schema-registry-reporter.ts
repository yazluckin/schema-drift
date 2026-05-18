import { RegistryEntry, getAllVersions, listRegisteredSchemas } from './schema-registry';

export function formatRegistryEntry(name: string, entry: RegistryEntry): string {
  const desc = entry.description ? ` — ${entry.description}` : '';
  return `[${name}] v${entry.version}${desc} (registered: ${entry.registeredAt.toISOString()})`;
}

export function formatRegistrySnapshot(): string {
  const names = listRegisteredSchemas();
  if (names.length === 0) return 'Schema registry is empty.';

  const lines: string[] = ['=== Schema Registry Snapshot ==='];
  for (const name of names) {
    const versions = getAllVersions(name);
    lines.push(`\n${name} (${versions.length} version${versions.length !== 1 ? 's' : ''})`);
    for (const entry of versions) {
      const desc = entry.description ? ` — ${entry.description}` : '';
      lines.push(`  v${entry.version}${desc} @ ${entry.registeredAt.toISOString()}`);
    }
  }
  return lines.join('\n');
}

export function summarizeRegistry(): Record<string, number> {
  const names = listRegisteredSchemas();
  const summary: Record<string, number> = {};
  for (const name of names) {
    summary[name] = getAllVersions(name).length;
  }
  return summary;
}

export function printRegistrySnapshot(): void {
  console.log(formatRegistrySnapshot());
}
