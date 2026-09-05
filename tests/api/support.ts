import { fileURLToPath } from 'node:url';
import { createPGliteDatabase } from '../../db/pglite.js';
import { migrateDatabase } from '../../db/migrate.js';
export async function openTestDatabase() {
  const db = await createPGliteDatabase();
  await migrateDatabase(db, fileURLToPath(new URL('../../db/migrations', import.meta.url)));
  return db;
}
