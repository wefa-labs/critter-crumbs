import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import type { createApi } from '@critter-crumbs/api';

/**
 * Vercel serves one function per route file under api/ and answers every other /api path with a 404 of its own,
 * before the handler is asked (Technical Spec §10). These tests call the handler directly, so that rule is kept here:
 * a route added to the handler without its file fails every test that gets an answer from it.
 */
type Api = ReturnType<typeof createApi>;
const literal = (segment: string) => segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/** A file serves the path it is named for, index.ts serves its directory, and a [bracketed] name takes any one segment. */
function served(file: string) {
  const segments = file.replace(/\.ts$/, '').split('/');
  if (segments.at(-1) === 'index') segments.pop();
  return new RegExp(`^/${['api', ...segments].map(segment => /^\[.+\]$/.test(segment) ? '[^/]+' : literal(segment)).join('/')}$`);
}
const routeFiles = readdirSync(fileURLToPath(new URL('../../api/', import.meta.url)), { recursive: true, encoding: 'utf8' })
  .map(file => file.split('\\').join('/'))
  .filter(file => file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.split('/').some(segment => /^[_.]/.test(segment)))
  .map(file => ({ file: `api/${file}`, path: served(file) }));

export const routeFileFor = (path: string) => routeFiles.find(route => route.path.test(path))?.file;

/**
 * The one answered path with no route file. Only the local rehearsal API can answer it: scripts/local-api.ts supplies
 * recordTransaction, and the runtime that every route file exports (packages/api/src/runtime.ts) never does.
 */
const localOnly = new Set(['/api/dev/result-transaction']);

/**
 * Notes each answer that Vercel could not have given and reports them when asked. It never throws while a request is
 * being answered: the test still gets the reply, and requests running beside it are left to finish.
 */
export function routeFileCheck() {
  const unserved = new Set<string>();
  return {
    through: (handle: Api): Api => async request => {
      const reply = await handle(request), path = request.path.split('?')[0]!;
      if (reply.status < 300 && !routeFileFor(path) && !localOnly.has(path)) unserved.add(`${request.method} ${path}`);
      return reply;
    },
    verify() {
      if (unserved.size) throw new Error(`Answered, but no route file under api/ serves the path, so Vercel would answer with a 404 of its own: ${[...unserved].join(', ')}. Add the route file: one line, export { default } from '@critter-crumbs/api'.`);
    },
  };
}
