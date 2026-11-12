export function getEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Environment variable ${name} is not set. Copy .env.example to .env or export it.`);
  }
  return value;
}

export const appUrl = () => getEnv('BASE_URL', 'https://conduit.bondaracademy.com').replace(/\/$/, '');

export const apiUrl = () => getEnv('API_URL', 'https://conduit-api.bondaracademy.com/api').replace(/\/$/, '');

export function extraApiHeaders(): Record<string, string> {
  const raw = process.env['E2E_EXTRA_HEADERS'];
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Record<string, string>;
  } catch {
    throw new Error('E2E_EXTRA_HEADERS must be a JSON object, e.g. {"X-QA-Bypass":"secret"}');
  }
}
