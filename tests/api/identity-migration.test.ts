import { mkdtemp, readdir, copyFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { expect, test } from 'vitest';
import { personTargetId } from '@critter-crumbs/core';
import { createPGliteDatabase } from '../../db/pglite.js';
import { migrateDatabase } from '../../db/migrate.js';
import { apiHarness, testAccount } from './support.js';

test('identity upgrade preserves old choices and labels old feast appearances as a current-known baseline', async () => {
  const directory = fileURLToPath(new URL('../../db/migrations', import.meta.url));
  const previous = await mkdtemp(join(tmpdir(), 'critter-identity-upgrade-'));
  const db = await createPGliteDatabase();
  try {
    for (const name of (await readdir(directory)).filter(name => name < '0009_' && name.endsWith('.sql'))) await copyFile(join(directory, name), join(previous, name));
    await migrateDatabase(db, previous);
    const account = testAccount(1), address = account.address.toLowerCase(), targetId = personTargetId(account.address);
    const burrowId = '00000000-0000-4000-8000-000000000001', feastId = '00000000-0000-4000-8000-000000000002';
    await db.batch([
      { text: 'insert into profiles (address,variant,rerolls_used,critter_locked,display_name) values ($1,3,3,true,$2)', values: [address, 'Moss'] },
      { text: 'insert into burrows (id,name,created_by) values ($1,$2,$3)', values: [burrowId, 'Oak', address] },
      { text: 'insert into burrow_members (burrow_id,address,added_by) values ($1,$2,$2)', values: [burrowId, address] },
      { text: "insert into feasts (id,burrow_id,created_by,kind,title,crumbs_per_critter,gathering_ends_at,scattering_ends_at,aggregate_public,individual_open,status) values ($1,$2,$3,'people','Earlier feast',100,'2026-09-01','2026-09-02',false,false,'cancelled')", values: [feastId, burrowId, address] },
      { text: "insert into targets (feast_id,target_id,kind,owner_address,name,position) values ($1,$2,'person',$3,'Moss',0)", values: [feastId, Buffer.from(targetId.slice(2), 'hex'), address] },
    ]);
    const h = await apiHarness({ databaseFactory: async () => db });
    const { headers } = await h.connect();
    expect((await h.api({ method: 'GET', path: '/api/me', headers })).body).toMatchObject({ generatorVersion: '1', rendererVersion: '1', variant: 3, rerollsUsed: 3, critterLocked: true, displayName: 'Moss' });
    const earlier = await h.api({ method: 'GET', path: `/api/feasts/${feastId}` });
    expect(earlier.body.portraits).toEqual([{ targetId, variant: 3, generatorVersion: '1', rendererVersion: '1', source: 'legacy-baseline', capturedAt: null }]);
    await migrateDatabase(db, directory);
    expect((await h.api({ method: 'PUT', path: '/api/me', headers, body: { variant: 4 } })).status).toBe(400);
    expect((await h.api({ method: 'GET', path: `/api/feasts/${feastId}` })).body.portraits).toEqual(earlier.body.portraits);
  } finally { await db.close(); await rm(previous, { recursive: true, force: true }); }
});

test('stored supported versions survive sign-in and profile edits while invalid pairs are rejected by storage', async () => {
  const db = await createPGliteDatabase();
  const h = await apiHarness({ databaseFactory: async () => db });
  try {
    const address = testAccount(1).address.toLowerCase();
    // A pre-existing v2 fixture exercises reads without introducing an adoption endpoint.
    await db.query("insert into profiles (address,generator_version,renderer_version) values ($1,'2','2')", [address]);
    const { headers, connected } = await h.connect();
    expect(connected.body).toMatchObject({ generatorVersion: '2', rendererVersion: '2', variant: 0 });
    const kept = await h.api({ method: 'PUT', path: '/api/me', headers, body: { displayName: 'Fern', keepCritter: true } });
    expect(kept.body).toMatchObject({ generatorVersion: '2', rendererVersion: '2', critterLocked: true });
    await expect(db.query("update profiles set generator_version='99' where address=$1", [address])).rejects.toThrow();
    await expect(db.query("update profiles set renderer_version='1' where address=$1", [address])).rejects.toThrow();
    expect((await h.connect()).connected.body).toMatchObject({ generatorVersion: '2', rendererVersion: '2', critterLocked: true });
  } finally { await h.close(); }
});
