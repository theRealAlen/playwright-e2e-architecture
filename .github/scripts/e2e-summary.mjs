#!/usr/bin/env node
/**
 * Turns Playwright's JSON report into a GitHub job summary and step outputs for notifications.
 * Splits "did not run" from "skipped": tests behind a failed setup project never start, and counting them
 * as skipped hides that the run produced no coverage for them.
 *
 *   node .github/scripts/e2e-summary.mjs <label> <results.json>
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';

const [label = 'e2e', resultsPath = 'results.json'] = process.argv.slice(2);

const write = (file, text) => file && appendFileSync(file, text);
const output = (key, value) => write(process.env.GITHUB_OUTPUT, `${key}<<__${key}__\n${value}\n__${key}__\n`);

if (!existsSync(resultsPath)) {
  write(process.env.GITHUB_STEP_SUMMARY, `## ${label}: no report\n\nThe run ended before Playwright wrote \`${resultsPath}\`.\n`);
  output('failed_count', '?');
  output('headline', `${label}: no report produced`);
  output('failed_list', '');
  process.exit(0);
}

const report = JSON.parse(readFileSync(resultsPath, 'utf8'));

function* walk(suite, path = []) {
  const here = suite.title ? [...path, suite.title] : path;
  for (const spec of suite.specs ?? []) yield { ...spec, path: here };
  for (const child of suite.suites ?? []) yield* walk(child, here);
}

const results = (spec) => (spec.tests ?? []).flatMap((t) => t.results ?? []);

function status(spec) {
  const tests = spec.tests ?? [];
  if (tests.length && tests.every((t) => t.status === 'skipped')) return results(spec).length ? 'skipped' : 'didNotRun';
  if (!spec.ok) return 'failed';
  return results(spec).some((r) => r.status === 'failed' || r.status === 'timedOut') ? 'flaky' : 'passed';
}

const scenario = (spec) => [...spec.path, spec.title].join(' ').match(/\bSC-\d+/)?.[0];
const ANSI_COLOR = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g');
const name = (spec) => (scenario(spec) ? `${scenario(spec)} ${spec.title}` : spec.title);
const firstError = (spec) =>
  (results(spec).find((r) => r.error?.message)?.error.message ?? '').replace(ANSI_COLOR, '').split('\n')[0].slice(0, 180);

const buckets = { failed: [], flaky: [], passed: [], skipped: [], didNotRun: [] };
for (const suite of report.suites ?? []) for (const spec of walk(suite)) buckets[status(spec)].push(spec);

const seconds = Math.round((report.stats?.duration ?? 0) / 1000);
const verdict = buckets.failed.length || buckets.didNotRun.length ? '❌' : buckets.flaky.length ? '⚠️' : '✅';
const counts = [
  `${buckets.passed.length} passed`,
  `${buckets.failed.length} failed`,
  `${buckets.flaky.length} flaky`,
  buckets.skipped.length && `${buckets.skipped.length} skipped`,
  buckets.didNotRun.length && `${buckets.didNotRun.length} did not run`,
]
  .filter(Boolean)
  .join(', ');
const headline = `${verdict} ${label}: ${counts} in ${Math.floor(seconds / 60)}m ${seconds % 60}s`;

let md = `## ${headline}\n\n`;
if (buckets.didNotRun.length)
  md += `> ${buckets.didNotRun.length} tests never started because a setup project failed. They are not passes.\n\n`;
if (buckets.failed.length) {
  md += '### Failed\n\n| Test | File | First error |\n| --- | --- | --- |\n';
  for (const spec of buckets.failed)
    md += `| ${name(spec)} | \`${spec.file}:${spec.line}\` | ${firstError(spec).replace(/\|/g, '\\|')} |\n`;
  md += '\n';
}
if (buckets.flaky.length) md += `### Flaky (passed on retry)\n\n${buckets.flaky.map((s) => `- ${name(s)}`).join('\n')}\n\n`;
md +=
  '<sub>Download the <b>e2e-report-*</b> artifact for this suite and run <code>npx playwright show-report &lt;folder&gt;</code> for traces and videos.</sub>\n';

write(process.env.GITHUB_STEP_SUMMARY, md);
output('failed_count', String(buckets.failed.length + buckets.didNotRun.length));
output('flaky_count', String(buckets.flaky.length));
output('headline', headline);
output(
  'failed_list',
  buckets.failed
    .slice(0, 5)
    .map((s) => `• ${name(s)}`)
    .join('\n') + (buckets.failed.length > 5 ? `\n• …and ${buckets.failed.length - 5} more` : '')
);
console.log(md);
