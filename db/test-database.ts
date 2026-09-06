import { randomUUID } from 'node:crypto';
import type { Database } from '../api/_lib/database.js';
/** Dev-only schema isolation for the opt-in Neon suite; never alters application tables. */
export async function isolatedTestDatabase(base: Database): Promise<Database> {
  const schema = `cc_test_${randomUUID().replaceAll('-', '')}`;
  await base.batch([{ text: `create schema ${schema}` }]);
  let closed = false;
  const database: Database = {
    async query(text, values) { return (await database.batch([{ text, ...(values ? { values } : {}) }]))[0]!; },
    async batch(queries, options) {
      if (closed) throw new Error('Closed test database');
      const results = await base.batch([{ text: "select set_config('search_path',$1,true)", values: [schema] }, ...queries], options);
      return results.slice(1);
    },
    async close() { if (closed) return; await base.batch([{ text: `drop schema ${schema} cascade` }]); closed = true; },
  };
  return database;
}
