#!/usr/bin/env node
/**
 * Runs the plan checker over every `.spec.md`, then checks the other direction: every `.spec.ts` is named
 * by exactly one plan, so "is this tested, and where is it written down" always has one answer.
 */
import { relative } from 'node:path';
import { checkPlan } from '../.claude/skills/e2e-test/scripts/check-plan-rows.mjs';
import { REPO_ROOT, suiteTestRoots, walk } from './files.mjs';

const roots = suiteTestRoots();
const plans = roots.flatMap((root) => walk(root, '.spec.md'));
const specs = roots.flatMap((root) => walk(root, '.spec.ts'));

let failed = false;
const owners = new Map(specs.map((spec) => [spec, []]));

for (const plan of plans) {
  const result = checkPlan(plan);
  for (const spec of result.specs) owners.get(spec)?.push(relative(REPO_ROOT, plan));
  if (result.problems.length) {
    failed = true;
    console.error(`✖ ${relative(REPO_ROOT, plan)}\n${result.problems.map((p) => `    ${p}`).join('\n')}`);
  }
}

for (const [spec, planList] of owners) {
  if (planList.length === 1) continue;
  failed = true;
  const where = planList.length ? `named by ${planList.length} plans: ${planList.join(', ')}` : 'named by no plan';
  console.error(`✖ ${relative(REPO_ROOT, spec)} is ${where}`);
}

if (failed) process.exit(1);
console.log(`✓ ${plans.length} plans cover ${specs.length} spec files; every row matches a test.`);
