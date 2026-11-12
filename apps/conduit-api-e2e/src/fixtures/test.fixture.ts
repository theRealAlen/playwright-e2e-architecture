import { baseTest } from '@e2e/utils';
import { AUTH_FILE } from '../paths';

export const test = baseTest.extend({
  authFile: [AUTH_FILE, { scope: 'worker' }],
});

export { expect } from '@playwright/test';
