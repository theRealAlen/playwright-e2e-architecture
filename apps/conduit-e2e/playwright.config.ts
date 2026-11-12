import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
import { appUrl, sharedPlaywrightConfig } from '@e2e/utils';
import { AUTH_FILE, SUITE_DIR } from './src/paths';

dotenv.config({ path: path.resolve(SUITE_DIR, '../../.env'), quiet: true });

const shared = sharedPlaywrightConfig(SUITE_DIR);
const LOGGED_OUT = /tests\/e2e\/authentication\//;

export default defineConfig({
  ...shared,
  testDir: path.join(SUITE_DIR, 'tests/e2e'),
  use: { ...shared.use, baseURL: appUrl() },
  projects: [
    {
      name: 'setup',
      testDir: SUITE_DIR,
      testMatch: 'auth.setup.ts',
    },
    {
      name: 'chromium',
      testIgnore: LOGGED_OUT,
      use: { ...devices['Desktop Chrome'], storageState: AUTH_FILE },
      dependencies: ['setup'],
    },
    {
      name: 'logged-out',
      testMatch: LOGGED_OUT,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
