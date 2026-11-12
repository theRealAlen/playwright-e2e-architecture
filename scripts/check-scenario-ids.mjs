#!/usr/bin/env node
/**
 * SC ids share one namespace across every suite and each may be declared by exactly one `test.describe`.
 * Two branches can take the same "next free" id in different files and git merges both without a conflict,
 * so this runs on pre-push and in CI. Exit 1 lists every collision and the next free id.
 */
import { readFileSync } from 'node:fs';
import { relative } from 'node:path';
import { REPO_ROOT, suiteTestRoots, walk } from './files.mjs';

const DESCRIBE = /\btest\.describe(?:\.\w+)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g;

const roots = suiteTestRoots();
const specs = roots.flatMap((root) => walk(root, '.spec.ts'));
const plans = roots.flatMap((root) => walk(root, '.spec.md'));

const declared = new Map();
for (const file of specs) {
  const source = readFileSync(file, 'utf8');
  for (const match of source.matchAll(DESCRIBE)) {
    const id = match[2].match(/SC-(\d+)/)?.[1];
    if (!id) continue;
    const key = `SC-${id.padStart(3, '0')}`;
    const line = source.slice(0, match.index).split('\n').length;
    declared.set(key, [...(declared.get(key) ?? []), `${relative(REPO_ROOT, file)}:${line}  "${match[2].trim()}"`]);
  }
}

const reserved = new Set();
for (const file of [...specs, ...plans]) {
  for (const m of readFileSync(file, 'utf8').matchAll(/SC-(\d+)/g)) reserved.add(Number(m[1]));
}

const nextFree = (from = 1) => {
  let n = from;
  while (reserved.has(n)) n++;
  return `SC-${String(n).padStart(3, '0')}`;
};

const collisions = [...declared].filter(([, places]) => places.length > 1);
if (collisions.length) {
  console.error(`\n✖ ${collisions.length} scenario id collision(s):\n`);
  for (const [id, places] of collisions) console.error(`  ${id}\n${places.map((p) => `    - ${p}`).join('\n')}\n`);
  console.error(`Give the duplicate a fresh id. Next free: ${nextFree()} (UI) / ${nextFree(101)} (API).\n`);
  process.exit(1);
}

console.log(
  `✓ ${declared.size} unique scenario ids across ${specs.length} spec files. Next free: ${nextFree()} (UI) / ${nextFree(101)} (API).`
);
