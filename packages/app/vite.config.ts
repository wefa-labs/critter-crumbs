import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { measureBundle } from '../../scripts/build-budget.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const shutter = dirname(require.resolve('@shutter-network/shutter-sdk'));

export default defineConfig({
  root,
  plugins: [
    react(),
    {
      name: 'critter-crumbs-assets-and-budgets',
      buildStart() {
        for (const name of ['three', 'crypto']) {
          this.emitFile({ type: 'chunk', id: resolve(root, `src/${name}/index.ts`), name, preserveSignature: 'strict' });
        }
        for (const fileName of ['blst.js', 'blst.wasm']) {
          this.emitFile({ type: 'asset', fileName, source: readFileSync(resolve(shutter, fileName)) });
        }
        this.emitFile({ type: 'asset', fileName: 'licenses/shutter-sdk-LICENSE', source: readFileSync(resolve(shutter, '../LICENSE')) });
        this.emitFile({ type: 'asset', fileName: 'licenses/react-three-fiber-LICENSE', source: readFileSync(resolve(root, '../../docs/research/licenses/react-three-fiber-LICENSE')) });
      },
      generateBundle(_options, bundle) {
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
        manualChunks(id) {
          const file = id.replaceAll('\\', '/');
          if (/\/src\/three\//.test(file) || /\/node_modules\/(?:three\/|@react-three\/)/.test(file)) return 'three';
          if (/\/src\/crypto\//.test(file) || /\/node_modules\/(?:viem\/|@shutter-network\/)/.test(file)) return 'crypto';
        },
      },
    },
  },
});
