import type { APIRequest, APIRequestContext, APIResponse } from '@playwright/test';
import { apiUrl, extraApiHeaders } from '../config/env';

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Params = Record<string, string | number | boolean>;

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly method: Method,
    readonly url: string,
    readonly body: unknown
  ) {
    super(`${method} ${url} failed with ${status}\n${typeof body === 'string' ? body : JSON.stringify(body, null, 2)}`);
    this.name = 'ApiError';
  }
}

export interface HttpClient {
  get<T>(path: string, params?: Params): Promise<T>;
  post<T>(path: string, data?: unknown): Promise<T>;
  put<T>(path: string, data?: unknown): Promise<T>;
  delete<T = void>(path: string): Promise<T>;
  /** The untouched response, for tests that assert on a refusal. */
  raw(method: Method, path: string, data?: unknown): Promise<APIResponse>;
}

export function newApiContext(request: APIRequest, token?: string): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: `${apiUrl()}/`,
    extraHTTPHeaders: { ...extraApiHeaders(), ...(token && { Authorization: `Token ${token}` }) },
  });
}

/**
 * Typed JSON over a context from `newApiContext`. Paths are relative ("articles", not "/articles"): a leading
 * slash would resolve against the host and drop the `/api` prefix. A failed call throws `ApiError`, which
 * carries the status and body so a seeding failure explains itself and cleanup can tell a 404 apart.
 */
export function createHttpClient(context: APIRequestContext): HttpClient {
  const send = (method: Method, path: string, data?: unknown, params?: Params) =>
    context.fetch(path.replace(/^\//, ''), { method, data, params, maxRetries: method === 'GET' ? 2 : 0 });

  async function json<T>(method: Method, path: string, data?: unknown, params?: Params): Promise<T> {
    const response = await send(method, path, data, params);
    const isJson = (response.headers()['content-type'] ?? '').includes('application/json');
    const body = isJson ? await response.json() : await response.text();
    if (!response.ok()) throw new ApiError(response.status(), method, response.url(), body);
    return body as T;
  }

  return {
    get: (path, params) => json('GET', path, undefined, params),
    post: (path, data) => json('POST', path, data),
    put: (path, data) => json('PUT', path, data),
    delete: (path) => json('DELETE', path),
    raw: (method, path, data) => send(method, path, data),
  };
}
