import { createApi } from '../api/_lib/api.js';
import { serverNow } from '../api/_lib/clock.js';
import { createNeonDatabase } from '../api/_lib/database.js';
import { seedFixtures } from '../api/_lib/seed.js';
import { serverTimelock } from '../api/_lib/timelock.js';
const args = process.argv.slice(2);
function option(name: string, fallback: string) { const index = args.indexOf(name); return index < 0 ? fallback : args[index + 1] ?? ''; }
const direct = args.includes('--database'), phase = option('--phase', direct ? 'draft' : 'gathering'), kind = option('--kind', 'both');
if (direct) {
  const { DATABASE_URL, SESSION_SECRET, APP_ORIGIN, SHUTTER_MODE, MOCK_SECRET, NODE_ENV } = process.env;
  if (!DATABASE_URL || !SESSION_SECRET || !APP_ORIGIN) throw new Error('Database seeding requires DATABASE_URL, SESSION_SECRET and APP_ORIGIN.');
  if (phase !== 'draft' && (SHUTTER_MODE !== 'mock' || NODE_ENV === 'production')) throw new Error('Real deployment seeding creates drafts; opening requires the separately configured Shutter adapter.');
  const db = createNeonDatabase(DATABASE_URL);
  try {
    const timelock = phase === 'draft' ? undefined : serverTimelock(db, serverNow, { mode: 'mock', production: false, ...(MOCK_SECRET ? { mockSecret: MOCK_SECRET } : {}) });
    const api = createApi({ db, clock: serverNow, sessionSecret: SESSION_SECRET, origin: APP_ORIGIN, ...(timelock ? { timelock } : {}) });
    console.log(JSON.stringify(await seedFixtures(api, serverNow, { phase, kind }), null, 2));
  } finally { await db.close(); }
} else {
  const origin = process.env.LOCAL_API_URL || `http://127.0.0.1:${process.env.LOCAL_API_PORT || '3000'}`;
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(new URL(origin).hostname)) throw new Error('LOCAL_API_URL must use loopback.');
  const response = await fetch(new URL('/api/dev/seed', origin), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ phase, kind }) });
  const body: unknown = await response.json();
  if (!response.ok) throw new Error(`Seed failed (${response.status}): ${JSON.stringify(body)}`);
  console.log(JSON.stringify(body, null, 2));
}
