import { expect, test } from 'vitest';
import { createPGliteDatabase } from '../../db/pglite.js';
import { isolatedTestDatabase } from '../../db/test-database.js';
import { apiHarness, apiTestTimeout } from './support.js';
test('API isolated Postgres schemas run the migrations and preserve independent fixture histories', async () => {
  const base = await createPGliteDatabase();
  const one = await apiHarness({ databaseFactory: () => isolatedTestDatabase(base) });
  const two = await apiHarness({ databaseFactory: () => isolatedTestDatabase(base) });
  try {
    const first = await one.connect(), second = await two.connect();
    expect((await one.api({ method: 'POST', path: '/api/burrows', headers: first.headers, body: { name: 'Oak' } })).status).toBe(201);
    expect((await two.api({ method: 'GET', path: '/api/me', headers: second.headers })).body.burrows).toEqual([]);
    await one.close();
    expect((await two.api({ method: 'POST', path: '/api/burrows', headers: second.headers, body: { name: 'Ash' } })).status).toBe(201);
  } finally { await one.close(); await two.close(); await base.close(); }
}, apiTestTimeout);
