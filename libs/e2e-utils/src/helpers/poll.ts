const POLL_INTERVAL_MS = 1000;

/**
 * Re-runs `fn` until `predicate` accepts its result or the deadline passes, then returns the last result
 * either way, so the caller's assertion can name what it was waiting for. For backend state; for anything
 * on screen use a web-first `expect` instead.
 */
export async function pollUntil<T>(fn: () => Promise<T>, predicate: (result: T) => boolean, timeoutMs: number): Promise<T> {
  const deadline = Date.now() + timeoutMs;
  let latest = await fn();

  while (!predicate(latest) && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
    latest = await fn();
  }

  return latest;
}
