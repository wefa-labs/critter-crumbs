import { resolve } from 'node:path';
import { createNeonDatabase } from '../api/_lib/database.js';
import { migrateDatabase } from '../db/migrate.js';
import { localData } from './local-data.js';
if (process.argv.includes('--local')) {
  const data = await localData(); await data.db.close(); console.log('Local migrations applied.');
} else {
  if (!process.env.DATABASE_URL) throw new Error('Set DATABASE_URL or use --local.');
  const db = createNeonDatabase(process.env.DATABASE_URL);
  try { await migrateDatabase(db, resolve('db/migrations')); console.log('Migrations applied.'); }
  finally { await db.close(); }
}
