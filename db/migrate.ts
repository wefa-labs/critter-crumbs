import { readdir, readFile } from 'node:fs/promises';
import type { Database } from '@critter-crumbs/api';
/** Migrations contain ordinary SQL statements, not procedural function bodies. */
export async function migrateDatabase(db: Database, directory: string): Promise<void> {
  await db.batch([{ text: 'create table if not exists schema_migrations (name text primary key)' }]);
  const applied = await db.query('select name from schema_migrations');
  for (const name of (await readdir(directory)).filter(name => /^\d+_.+\.sql$/.test(name)).sort()) {
    if (applied.some(row => row.name === name)) continue;
    const source = await readFile(`${directory}/${name}`, 'utf8');
    const statements = source.replace(/--[^\n]*/g, '').split(';').map(text => text.trim()).filter(Boolean);
    await db.batch([...statements.map(text => ({ text })), { text: 'insert into schema_migrations (name) values ($1)', values: [name] }]);
  }
}
