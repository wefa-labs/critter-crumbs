import { PGlite } from '@electric-sql/pglite';
import type { Database, Row } from '../api/_lib/database.js';
/** Dev-only adapter: expose the same noninteractive batches as Neon HTTP. */
export async function createPGliteDatabase(directory?: string): Promise<Database> {
  const engine = new PGlite(directory);
  await engine.waitReady;
  return {
    async query(text, values = []) { return (await engine.query<Row>(text, values)).rows; },
    async batch(queries) {
      return engine.transaction(async tx => {
        const rows: Row[][] = [];
        for (const query of queries) rows.push((await tx.query<Row>(query.text, query.values ?? [])).rows);
        return rows;
      });
    },
    async close() { await engine.close(); },
  };
}
