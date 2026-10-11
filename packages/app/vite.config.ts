import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { measureBundle } from '../../scripts/build-budget.mjs';
import { refuseChunkCycles, refuseCodeFromStrings } from '../../scripts/build-policy.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const shutter = dirname(require.resolve('@shutter-network/shutter-sdk'));
const assets = [
  { fileName: 'blst.js', source: readFileSync(resolve(shutter, 'blst.js')), contentType: 'text/javascript' },
  { fileName: 'blst.wasm', source: readFileSync(resolve(shutter, 'blst.wasm')), contentType: 'application/wasm' },
  { fileName: 'licenses/shutter-sdk-LICENSE', source: readFileSync(resolve(shutter, '../LICENSE')), contentType: 'text/plain' },
  { fileName: 'licenses/react-three-fiber-LICENSE', source: readFileSync(resolve(root, '../../docs/research/licenses/react-three-fiber-LICENSE')), contentType: 'text/plain' },
];

export default defineConfig(({ command }) => ({
  root,
  plugins: [
    react(),
    {
      name: 'critter-crumbs-assets-and-budgets',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const pathname = request.url?.split('?')[0];
          const asset = assets.find((item) => pathname === `/${item.fileName}`);
          if (!asset) return next();
          response.setHeader('Content-Type', asset.contentType);
          response.end(asset.source);
        });
      },
      buildStart() {
        if (command !== 'build') return;
        for (const name of ['three', 'crypto']) {
          this.emitFile({ type: 'chunk', id: resolve(root, `src/${name}/index.ts`), name, preserveSignature: 'strict' });
        }
        for (const { fileName, source } of assets) this.emitFile({ type: 'asset', fileName, source });
      },
      generateBundle(_options, bundle) {
        refuseCodeFromStrings(bundle);
        refuseChunkCycles(bundle);
        const sizes = measureBundle(bundle);
        console.log(`Gzip bytes: shell=${sizes.shell}/120000; three=${sizes.three}/250000; crypto=${sizes.crypto} (no numeric cap in §17).`);
      },
    },
  ],
  server: { host: '127.0.0.1', port: 5173, strictPort: true, proxy: { '/api': 'http://127.0.0.1:3000' } },
  build: {
    outDir: '../../dist',
    emptyOutDir: true,
    target: ['safari15.4', 'chrome100', 'firefox100'],
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const file = id.replaceAll('\\', '/');
          if (/\/src\/three\//.test(file) || /\/node_modules\/(?:three\/|@react-three\/)/.test(file)) return 'three';
          // viem's own dependencies and the account code built on viem stay in viem's chunk. Left to Rollup they share
          // a second chunk that viem imports and that imports viem back, and that pair cannot load in the order the app
          // asks for it: connecting threw before the wallet was ever asked (scripts/build-policy.mjs refuses such a ring).
          if (/\/src\/crypto\//.test(file) || /\/packages\/core\/(?:src|dist)\/account\//.test(file) || /\/node_modules\/(?:viem|@shutter-network|abitype|ox|@noble)\//.test(file)) return 'crypto';
        },
      },
    },
  },
}));
