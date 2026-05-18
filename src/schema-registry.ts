import { Schema } from './types';

export interface RegistryEntry {
  schema: Schema;
  version: number;
  registeredAt: Date;
  description?: string;
}

const registry = new Map<string, RegistryEntry[]>();

export function registerSchemaVersion(
  name: string,
  schema: Schema,
  description?: string
): RegistryEntry {
  const existing = registry.get(name) ?? [];
  const version = existing.length + 1;
  const entry: RegistryEntry = {
    schema,
    version,
    registeredAt: new Date(),
    description,
  };
  registry.set(name, [...existing, entry]);
  return entry;
}

export function getLatestSchema(name: string): RegistryEntry | undefined {
  const entries = registry.get(name);
  if (!entries || entries.length === 0) return undefined;
  return entries[entries.length - 1];
}

export function getSchemaVersion(
  name: string,
  version: number
): RegistryEntry | undefined {
  const entries = registry.get(name);
  if (!entries) return undefined;
  return entries.find((e) => e.version === version);
}

export function getAllVersions(name: string): RegistryEntry[] {
  return registry.get(name) ?? [];
}

export function listRegisteredSchemas(): string[] {
  return Array.from(registry.keys());
}

export function clearRegistry(): void {
  registry.clear();
}

export function hasSchema(name: string): boolean {
  return registry.has(name) && (registry.get(name)?.length ?? 0) > 0;
}
