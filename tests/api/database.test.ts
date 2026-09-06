import { expect, test } from 'vitest';
import { openTestDatabase } from './support.js';
test('API database honors read-only transaction options', async () => {
  const db = await openTestDatabase();
  try {
    await expect(db.batch([{ text: 'create table forbidden_write (id integer)' }], { readOnly: true, isolationLevel: 'Serializable' })).rejects.toThrow();
  } finally { await db.close(); }
});
