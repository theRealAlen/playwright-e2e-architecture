import { test as base } from '@playwright/test';
import { createHttpClient, ApiError, newApiContext, type HttpClient } from '../api/http-client';
import { applyRouteHeaders } from '../api/route-headers';
import { createArticle, deleteArticle } from '../api/articles';
import { registerUser } from '../api/users';
import type { Article, Credentials, User } from '../api/types';
import { loadSession, type SavedSession } from '../auth/session';
import { apiUrl, extraApiHeaders } from '../config/env';

export class Cleanup {
  private readonly tasks: { label: string; run: () => Promise<unknown> }[] = [];

  add(label: string, run: () => Promise<unknown>): void {
    this.tasks.push({ label, run });
  }

  async runAll(): Promise<void> {
    const failures: string[] = [];
    for (const task of this.tasks.reverse()) {
      try {
        await task.run();
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) continue;
        failures.push(`${task.label}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    if (failures.length) throw new Error(`Cleanup failed:\n  ${failures.join('\n  ')}`);
  }
}

export interface UserHandle {
  user: User;
  credentials: Credentials;
  client: HttpClient;
}

export type SharedWorkerFixtures = {
  authFile: string;
  session: SavedSession;
  apiClient: HttpClient;
  anonClient: HttpClient;
  otherUser: UserHandle;
};

export type SharedTestFixtures = {
  cleanup: Cleanup;
  articleCount: number;
  testArticles: Article[];
  testArticle: Article;
  freshUser: UserHandle;
};

export const baseTest = base.extend<SharedTestFixtures, SharedWorkerFixtures>({
  authFile: ['', { option: true, scope: 'worker' }],

  session: [
    async ({ authFile }, use) => {
      if (!authFile) throw new Error('authFile is not set. Each suite sets it in its test.fixture.');
      await use(loadSession(authFile));
    },
    { scope: 'worker' },
  ],

  anonClient: [
    async ({ playwright }, use) => {
      const context = await newApiContext(playwright.request);
      await use(createHttpClient(context));
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  apiClient: [
    async ({ playwright, session }, use) => {
      const context = await newApiContext(playwright.request, session.user.token);
      await use(createHttpClient(context));
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  otherUser: [
    async ({ playwright, anonClient }, use) => {
      const { user, credentials } = await registerUser(anonClient);
      const context = await newApiContext(playwright.request, user.token);
      await use({ user, credentials, client: createHttpClient(context) });
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  page: async ({ page }, use) => {
    await applyRouteHeaders(page.context(), new URL(apiUrl()).origin, extraApiHeaders());
    await use(page);
  },

  cleanup: async ({}, use) => {
    const cleanup = new Cleanup();
    await use(cleanup);
    await cleanup.runAll();
  },

  articleCount: [1, { option: true }],

  testArticles: async ({ apiClient, cleanup, articleCount }, use) => {
    const articles = await Promise.all(Array.from({ length: articleCount }, () => createArticle(apiClient)));
    for (const article of articles) cleanup.add(`delete article ${article.slug}`, () => deleteArticle(apiClient, article.slug));
    await use(articles);
  },

  testArticle: async ({ testArticles }, use) => {
    await use(testArticles[0]!);
  },

  freshUser: async ({ playwright, anonClient }, use) => {
    const { user, credentials } = await registerUser(anonClient);
    const context = await newApiContext(playwright.request, user.token);
    await use({ user, credentials, client: createHttpClient(context) });
    await context.dispose();
  },
});
