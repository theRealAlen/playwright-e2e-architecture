import { defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { sharedPlaywrightConfig } from '@e2e/utils';
import { SUITE_DIR } from './src/paths';

dotenv.config({ path: path.resolve(SUITE_DIR, '../../.env'), quiet: true });

const shared = sharedPlaywrightConfig(SUITE_DIR);

export default defineConfig({
  ...shared,
  testDir: path.join(SUITE_DIR, 'tests/api'),
  use: { trace: shared.use?.trace },
  projects: [
    { name: 'setup', testDir: SUITE_DIR, testMatch: 'auth.setup.ts' },
    { name: 'api', dependencies: ['setup'] },
  ],
});
