#!/usr/bin/env node
/**
 * Checks one plan against the specs it names: every `Automated` row must mirror a `test()` title verbatim.
 * Titles built from template literals match on their static prefix, so a plan can list each generated case.
 *
 *   node .claude/skills/e2e-test/scripts/check-plan-rows.mjs <plan.spec.md>
 */
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function checkPlan(planPath) {
  const md = readFileSync(planPath, 'utf8');
  const problems = [];
  const normalize = (s) =>
    s
      .replace(/[`*\\]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

  const rows = [...md.matchAll(/^\|\s*(SC-\d+)\s*\|([^|]*)\|\s*(\w+)/gm)];
  if (!rows.length) problems.push('no SC- rows: a placeholder, not a plan');

  const allPlanned = rows.length > 0 && rows.every(([, , , status]) => status === 'Planned');
  const specsLine = md.match(/^\*\*Specs?:\*\*(.+)$/m)?.[1] ?? '';
  const specs = specsLine.match(/[\w.-]+\.spec\.ts/g) ?? [];
  if (!specs.length && !(allPlanned && /none yet/i.test(specsLine))) problems.push('no **Spec(s):** line naming the files it covers');

  let source = '';
  for (const spec of specs) {
    const path = join(dirname(planPath), spec);
    if (existsSync(path)) source += readFileSync(path, 'utf8');
    else problems.push(`names \`${spec}\`, which does not exist`);
  }

  const titles = [...source.matchAll(/(?<![.\w])test(?:\.\w+)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1/g)].map((m) =>
    m[2].replace(/\\(.)/g, '$1')
  );
  const exact = new Set(titles.filter((t) => !t.includes('${')).map(normalize));
  const prefixes = titles
    .filter((t) => t.includes('${'))
    .map((t) => normalize(t.slice(0, t.indexOf('${'))))
    .filter(Boolean);

  for (const [, sc, title, status] of rows) {
    if (status !== 'Automated') continue;
    const t = normalize(title);
    if (!exact.has(t) && !prefixes.some((p) => t.startsWith(p))) problems.push(`${sc} "${title.trim()}" matches no test() title`);
  }

  return { name: basename(planPath), specs: specs.map((s) => join(dirname(planPath), s)), problems };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const plan = process.argv[2];
  if (!plan) {
    console.error('usage: check-plan-rows.mjs <plan.spec.md>');
    process.exit(2);
  }
  const { name, problems } = checkPlan(plan);
  if (problems.length) {
    console.error(`✖ ${name}\n${problems.map((p) => `    ${p}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`✓ ${name}`);
}
