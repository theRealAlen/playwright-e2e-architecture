import type { BrowserContext } from '@playwright/test';

const routed = new WeakSet<BrowserContext>();

/**
 * Adds headers to every browser request bound for `origin` (a rate-limit bypass, a feature flag, a tenant id).
 * Uses `route.fallback`, not `route.continue`: continue ends the handler chain, so a spec that later adds its
 * own `page.route` mock would silently drop these headers, or this handler would swallow the spec's mock.
 */
export async function applyRouteHeaders(context: BrowserContext, origin: string, headers: Record<string, string>): Promise<void> {
  if (Object.keys(headers).length === 0 || routed.has(context)) return;
  routed.add(context);

  await context.route(`${origin}/**`, (route) => route.fallback({ headers: { ...route.request().headers(), ...headers } }));
}
