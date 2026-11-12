import type { PlaywrightTestConfig, ReporterDescription } from '@playwright/test';
import * as path from 'node:path';

type SharedConfig = Pick<PlaywrightTestConfig, 'fullyParallel' | 'forbidOnly' | 'retries' | 'workers' | 'use' | 'reporter' | 'outputDir'>;

/**
 * Every suite spreads this into its own defineConfig, so retries, reporters and artifacts behave the same
 * everywhere. Pass the suite's own directory so report folders land next to it.
 */
export function sharedPlaywrightConfig(rootDir: string): SharedConfig {
  const isCI = !!process.env['CI'];

  const reporter: ReporterDescription[] = isCI
    ? [['list'], ['github'], ['blob', { outputDir: path.join(rootDir, 'blob-report') }]]
    : [['list'], ['html', { outputFolder: path.join(rootDir, 'playwright-report'), open: 'on-failure' }]];

  // The HTML reporter wipes its own folder, so the machine-readable twin lives in test-results.
  reporter.push(['json', { outputFile: path.join(rootDir, 'test-results', 'results.json') }]);

  return {
    fullyParallel: true,
    forbidOnly: isCI,
    retries: isCI ? 2 : 1,
    workers: isCI ? 4 : undefined,
    outputDir: path.join(rootDir, 'test-results'),
    reporter,
    use: {
      timezoneId: 'America/New_York',
      locale: 'en-US',
      trace: { mode: 'on-first-retry', screenshots: false },
      video: 'on-first-retry',
      screenshot: 'only-on-failure',
      actionTimeout: 15_000,
      navigationTimeout: 30_000,
    },
  };
}
