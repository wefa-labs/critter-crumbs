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

test('a lazy chunk is not charged for what the chunk that asks for it already holds', () => {
  const output = bundle();
  // the game asks for three, and already holds a library both of them use
  output['game.js'] = { ...chunk('game', '', ['library.js']), isEntry: false, dynamicImports: ['three.js'] };
  output['library.js'] = { ...chunk('library', randomBytes(20_000).toString('hex')), isEntry: false };
  output['own.js'] = { ...chunk('own', randomBytes(1_000).toString('hex')), isEntry: false };
  output['three.js'].imports.push('library.js', 'own.js');
  const held = measureBundle(output).three;
  assert.ok(held > 1_000 && held < 3_000, `three counted ${held}`);
  // asked for by the shell as well, which holds none of it, the library is three's to bring
  output['app.js'].dynamicImports = ['three.js'];
  assert.ok(measureBundle(output).three - held > 19_000);
});

test('a lazy chunk that every chunk asking for it also holds statically is refused', () => {
  const output = bundle();
  output['game.js'] = { ...chunk('game', '', ['three.js']), isEntry: false, dynamicImports: ['three.js'] };
  assert.throws(() => measureBundle(output), /behind import\(\)/);
});
