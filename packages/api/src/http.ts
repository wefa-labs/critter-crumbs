import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ApiReply, ApiRequest } from './api.js';
export function responseHeaders(connectOrigins: string[] = []): Record<string, string> {
  const origins = [...new Set(connectOrigins.map(url => new URL(url).origin))];
  return {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains', 'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin', 'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), accelerometer=()',
    'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    'Content-Security-Policy': `default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ${origins.join(' ')}; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'`,
  };
}
export function nodeHandler(api: (request: ApiRequest) => Promise<ApiReply>, clock: () => number) {
  return async (request: IncomingMessage & { body?: unknown }, response: ServerResponse): Promise<void> => {
    let result: ApiReply;
    try {
      let body = request.body;
      if (body === undefined && !['GET', 'HEAD'].includes(request.method ?? 'GET')) {
        const chunks: Buffer[] = []; let size = 0;
        for await (const chunk of request) {
          const bytes = Buffer.from(chunk); size += bytes.length;
          if (size > 2 * 1024 * 1024) throw new Error('Request too large');
          chunks.push(bytes);
        }
        const raw = Buffer.concat(chunks).toString('utf8'); body = raw ? JSON.parse(raw) : undefined;
      }
      const headers = Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]));
      result = await api({ method: request.method ?? 'GET', path: request.url ?? '/', headers, ...(body === undefined ? {} : { body }) });
    } catch { result = { status: 400, headers: responseHeaders(), body: { error: 'err.generic', serverNow: clock() } }; }
    response.writeHead(result.status, result.headers); response.end(JSON.stringify(result.body));
  };
}
