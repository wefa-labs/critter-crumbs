import { neon } from '@neondatabase/serverless';
export type Row = Record<string, unknown>;
export interface Query { text: string; values?: unknown[] }
export interface Database {
  query(text: string, values?: unknown[]): Promise<Row[]>;
  batch(queries: Query[], options?: { readOnly?: boolean; isolationLevel?: 'ReadCommitted' | 'RepeatableRead' | 'Serializable' }): Promise<Row[][]>;
  close(): Promise<void>;
}
export function createNeonDatabase(url: string): Database {
  const sql = neon(url);
  return {
    async query(text, values = []) { return await sql.query(text, values) as Row[]; },
    async batch(queries, options = {}) { return await sql.transaction(queries.map(q => sql.query(q.text, q.values ?? [])), options) as Row[][]; },
    async close() { /* HTTP holds no persistent connection. */ },
  };
}
