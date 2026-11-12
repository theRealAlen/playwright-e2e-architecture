import type { Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Credentials, User } from '../api/types';

export interface SavedSession {
  user: User;
  credentials: Credentials;
}

export const sessionFileFor = (authFile: string) => authFile.replace(/\.json$/, '.user.json');

/**
 * Writes a Playwright storageState that logs the browser in without touching the login page: Conduit keeps
 * its JWT in localStorage, so seeding that key is a full login. Signing in through the form is exercised once,
 * by the login spec, instead of before every test.
 */
export function saveSession(authFile: string, appOrigin: string, session: SavedSession): void {
  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  const storageState = {
    cookies: [],
    origins: [{ origin: appOrigin, localStorage: [{ name: 'jwtToken', value: session.user.token }] }],
  };
  fs.writeFileSync(authFile, JSON.stringify(storageState, null, 2));
  fs.writeFileSync(sessionFileFor(authFile), JSON.stringify(session, null, 2));
}

export function loadSession(authFile: string): SavedSession {
  const file = sessionFileFor(authFile);
  if (!fs.existsSync(file)) {
    throw new Error(`No saved session at ${file}. Run the "setup" project first (it runs automatically as a dependency).`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8')) as SavedSession;
}

export async function signInInBrowser(page: Page, appOrigin: string, token: string): Promise<void> {
  await page.context().addInitScript(([key, value]) => window.localStorage.setItem(key, value), ['jwtToken', token] as const);
  await page.goto(appOrigin);
}
