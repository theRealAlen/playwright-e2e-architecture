import type { Page, Request, Response } from '@playwright/test';

type Matcher = { method?: string; path: RegExp };

const matches = (request: Request, { method, path }: Matcher) =>
  (!method || request.method() === method) && path.test(new URL(request.url()).pathname);

/**
 * Runs `action` and returns the parsed JSON of the response it triggered. Use it to learn ids the UI created
 * (a slug, a record id) so the test can clean them up or seed against them, without scraping the DOM.
 */
export async function captureJson<T>(page: Page, matcher: Matcher, action: () => Promise<void>): Promise<T> {
  const [response] = await Promise.all([page.waitForResponse((r) => matches(r.request(), matcher)), action()]);
  if (!response.ok()) throw new Error(`${matcher.method ?? ''} ${matcher.path} answered ${response.status()}: ${await response.text()}`);
  return (await response.json()) as T;
}

/** Answers matching requests with a canned body; every other request carries on through `fallback`. */
export async function mockJson(page: Page, matcher: Matcher, body: unknown, status = 200): Promise<void> {
  await page.route(
    (url) => matcher.path.test(url.pathname),
    (route) => (matches(route.request(), matcher) ? route.fulfill({ status, json: body }) : route.fallback())
  );
}

/** Collects 4xx/5xx answers from `origin` while `action` runs, so a stalled UI flow can say what the API rejected. */
export async function withRejectedResponses<T>(page: Page, origin: string, action: () => Promise<T>): Promise<T> {
  const rejected: string[] = [];
  const collect = (response: Response) => {
    if (response.status() >= 400 && response.url().startsWith(origin)) {
      rejected.push(`${response.status()} ${response.request().method()} ${response.url()}`);
    }
  };

  page.on('response', collect);
  try {
    return await action();
  } catch (error) {
    if (rejected.length === 0) throw error;
    throw new Error(`The API rejected:\n  ${rejected.join('\n  ')}`, { cause: error });
  } finally {
    page.off('response', collect);
  }
}
