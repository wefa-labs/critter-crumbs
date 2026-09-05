import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { measureBundle } from './build-budget.mjs';

const chunk = (name, code = '', imports = []) => ({ type: 'chunk', name, fileName: `${name}.js`, isEntry: true, code, imports });
const bundle = () => ({ 'app.js': chunk('app'), 'three.js': chunk('three'), 'crypto.js': chunk('crypto') });

test('budgets count static imports and reject an oversized app shell', () => {
  const output = bundle();
  output['app.js'].imports.push('shared.js');
  output['shared.js'] = { ...chunk('shared', randomBytes(125_000).toString('hex')), isEntry: false };
  assert.throws(() => measureBundle(output), /shell: .* exceeds/);
});

test('the three budget rejects an oversized lazy chunk', () => {
  const output = bundle();
  output['three.js'].code = randomBytes(260_000).toString('hex');
  assert.throws(() => measureBundle(output), /three: .* exceeds/);
});

test('named lazy chunks cannot become static app imports', () => {
  for (const name of ['three', 'crypto']) {
    const output = bundle();
    output['app.js'].imports.push(`${name}.js`);
    assert.throws(() => measureBundle(output), /must stay outside/);
  }
});

test('empty chunks pass and crypto is measured without inventing a spec cap', () => {
  assert.deepEqual(measureBundle(bundle()), { shell: 20, three: 20, crypto: 20 });
  const output = bundle();
  delete output['crypto.js'];
  assert.throws(() => measureBundle(output), /Missing crypto/);
});
