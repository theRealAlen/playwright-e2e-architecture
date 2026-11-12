import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const REPO_ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

export function walk(dir, suffix, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === 'node_modules') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, suffix, out);
    else if (entry.endsWith(suffix)) out.push(full);
  }
  return out;
}

export function suiteTestRoots() {
  return readdirSync(join(REPO_ROOT, 'apps'))
    .map((name) => join(REPO_ROOT, 'apps', name, 'tests'))
    .filter((p) => {
      try {
        return statSync(p).isDirectory();
      } catch {
        return false;
      }
    });
}
