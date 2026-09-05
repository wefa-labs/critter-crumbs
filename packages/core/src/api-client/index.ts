import { copy, type CopyId } from '@critter-crumbs/shared';
import { clockOffset } from './clock-offset.js';
export interface ApiClientOptions { fetch?: typeof fetch; clock?: () => number; onClockSkew?: (id: 'err.clockSkew', milliseconds: number) => void }
export class ApiClientError extends Error {
  constructor(readonly copyId: CopyId, readonly status: number, readonly detail?: unknown, readonly retryAfter?: string | null) { super(copyId); }
}
export function createApiClient(options: ApiClientOptions = {}) {
  const transport = options.fetch ?? globalThis.fetch, time = clockOffset(options.clock);
  const cache = new Map<string, Promise<Record<string, unknown>>>(); let skewShown = false;
  async function request(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
    let response: Response;
    try { response = await transport(path, { credentials: 'same-origin', ...init }); }
    catch { throw new ApiClientError('err.storeUnreachable', 0); }
    let body: Record<string, unknown>;
    try {
      const parsed: unknown = await response.json();
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error();
      body = parsed as Record<string, unknown>;
      if (!Number.isSafeInteger(body.serverNow) || (body.serverNow as number) < 0) throw new Error();
    } catch { throw new ApiClientError('err.generic', response.status); }
    const skew = Math.abs(time.accept(body.serverNow as number));
    if (skew > 300000 && !skewShown) { skewShown = true; options.onClockSkew?.('err.clockSkew', skew); }
    if (!response.ok) {
      const id = typeof body.error === 'string' && Object.hasOwn(copy, body.error) ? body.error as CopyId : 'err.generic';
      throw new ApiClientError(id, response.status, body.detail, response.headers.get('Retry-After'));
    }
    return body;
  }
  return {
    now: time.now,
    invalidate() { cache.clear(); },
    get(path: string) {
      let result = cache.get(path);
      if (!result) {
        result = request(path).catch(error => { if (cache.get(path) === result) cache.delete(path); throw error; });
        cache.set(path, result);
      }
      return result;
    },
    async write(path: string, method: 'POST' | 'PUT' | 'DELETE', body?: unknown) {
      cache.clear();
      try { return await request(path, { method, ...(body === undefined ? {} : { body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }) }); }
      finally { cache.clear(); }
    },
  };
}
