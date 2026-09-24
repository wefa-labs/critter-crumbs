import { Readable } from 'node:stream';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { expect, test } from 'vitest';
import { createApi, nodeHandler, type ApiReply } from '@critter-crumbs/api';
import { apiHarness, apiTestTimeout } from './support.js';
const id = '00000000-0000-4000-8000-000000000001';
const protectedRoutes = [
  ['DELETE', '/session'], ['GET', '/me'], ['PUT', '/me'], ['POST', '/burrows'], ['GET', `/burrows/${id}`],
  ...['members', 'join', 'leave', 'feasts'].map(action => ['POST', `/burrows/${id}/${action}`]),
  ...['open', 'cancel', 'extend', 'ballots', 'result-attestation'].map(action => ['POST', `/feasts/${id}/${action}`]),
  ['PUT', `/feasts/${id}/statements/0x${'11'.repeat(32)}`], ['GET', `/feasts/${id}/ballots`], ['GET', `/feasts/${id}/key`],
];
const unavailable = async (): Promise<never> => { throw new Error('No store access authorized'); };
const minimal = () => createApi({ db: { query: unavailable, batch: unavailable, close: async () => {} }, clock: () => 1800000000123, sessionSecret: 'local-session-secret-for-tests-only', origin: 'https://critter.test' });
test.each(protectedRoutes)('API contract requires a session before %s %s reaches the store', async (method, path) => {
  const response = await minimal()({ method: method!, path: `/api${path}` });
  expect(response.status).toBe(401); expect(response.body).toEqual({ error: 'err.generic', serverNow: 1800000000123 });
});
test.each(['success', 'validation', 'authorization', 'store failure'] as const)('API contract stamps every required header on %s responses', async kind => {
  const h = await apiHarness({ connectOrigins: ['https://shutter.example/api', 'https://base.example/rpc'] });
  try {
    const { headers } = await h.connect();
    const response = kind === 'store failure' ? await minimal()({ method: 'GET', path: '/api/session/nonce' }) : await h.api({ method: kind === 'success' ? 'GET' : 'POST', path: kind === 'success' ? '/api/me' : '/api/burrows', headers: kind === 'authorization' ? {} : headers, body: { name: '' } });
    expect(response.status).toBe({ success: 200, validation: 400, authorization: 401, 'store failure': 503 }[kind]);
    expect(response.body.serverNow).toBe(1800000000123);
    expect(response.headers).toMatchObject({
      'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), geolocation=(), microphone=(), accelerometer=()', 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
    });
    const csp = response.headers['Content-Security-Policy'];
    for (const directive of ["default-src 'self'", "script-src 'self' 'wasm-unsafe-eval'", "img-src 'self' data:", "style-src 'self' 'unsafe-inline'", "font-src 'self'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'"]) expect(csp).toContain(directive);
    if (kind !== 'store failure') expect(csp).toContain("connect-src 'self' https://shutter.example https://base.example");
  } finally { await h.close(); }
}, apiTestTimeout);
test.each(['invalid JSON', 'oversized body'] as const)('API HTTP adapter returns a stamped copy-ID error for %s without a socket', async failure => {
  const request = Object.assign(Readable.from([failure === 'invalid JSON' ? '{' : 'x'.repeat(2 * 1024 * 1024 + 1)]), { method: 'POST', url: '/api/session', headers: {} }) as unknown as IncomingMessage;
  let status = 0, headers: Record<string, string> = {}, body = '';
  const response = { writeHead(code: number, value: Record<string, string>) { status = code; headers = value; }, end(value: string) { body = value; } } as unknown as ServerResponse;
  await nodeHandler(async (): Promise<ApiReply> => { throw new Error('Parsing should stop before dispatch'); }, () => 42)(request, response);
  expect(status).toBe(400); expect(JSON.parse(body)).toEqual({ error: 'err.generic', serverNow: 42 }); expect(headers['X-Content-Type-Options']).toBe('nosniff');
});
