import { randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import { createPGliteDatabase } from '../db/pglite.js';
import { migrateDatabase } from '../db/migrate.js';
export async function localData() {
  if (process.env.NODE_ENV === 'production' || (process.env.SHUTTER_MODE && process.env.SHUTTER_MODE !== 'mock')) throw new Error('Local development requires non-production mock mode');
  const directory = resolve(process.env.LOCAL_DATA_DIR || join(homedir(), '.local', 'share', 'critter-crumbs'));
  await mkdir(directory, { recursive: true, mode: 0o700 });
  async function secret(name: string, override?: string) {
    if (override) return override;
    const path = join(directory, name);
    try { await writeFile(path, randomBytes(32).toString('hex'), { flag: 'wx', mode: 0o600 }); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
    return readFile(path, 'utf8');
  }
  let offset = 0;
  try { offset = Number(await readFile(join(directory, 'clock-offset'), 'utf8')); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  if (!Number.isSafeInteger(offset)) throw new Error('Invalid saved clock offset');
  const db = await createPGliteDatabase(join(directory, 'postgres'));
  try {
    await migrateDatabase(db, resolve('db/migrations'));
    return { db, directory, offset, sessionSecret: await secret('session-secret', process.env.SESSION_SECRET), mockSecret: await secret('mock-secret', process.env.MOCK_SECRET),
      saveOffset: (value: number) => writeFile(join(directory, 'clock-offset'), String(value), { mode: 0o600 }) };
  } catch (error) { await db.close(); throw error; }
}
