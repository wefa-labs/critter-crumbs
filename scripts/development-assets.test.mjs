import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const shutter = dirname(require.resolve('@shutter-network/shutter-sdk'));

test('development serves the published BLST files with browser content types', async () => {
  const server = await createServer({
    configFile: fileURLToPath(new URL('../packages/app/vite.config.ts', import.meta.url)),
    server: { port: 0, strictPort: false, host: '127.0.0.1' },
    logLevel: 'silent',
  });
  try {
    await server.listen();
    const address = server.httpServer.address();
    for (const [name, type] of [['blst.js', 'text/javascript'], ['blst.wasm', 'application/wasm']]) {
      const response = await fetch(`http://127.0.0.1:${address.port}/${name}`);
      assert.equal(response.status, 200);
      assert.equal(response.headers.get('content-type'), type);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), await readFile(join(shutter, name)));
    }
  } finally {
    await server.close();
  }
});
