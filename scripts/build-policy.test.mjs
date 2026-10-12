import assert from 'node:assert/strict';
import { test } from 'node:test';
import { refuseChunkCycles, refuseCodeFromStrings, refuseGameInShell } from './build-policy.mjs';

const chunk = (fileName, code) => ({ type: 'chunk', fileName, code });
const asset = (fileName, source) => ({ type: 'asset', fileName, source });

test('a script that makes code from a string is refused by name, however it spells it', () => {
  for (const code of ['const set=new Function("index","store","value",body)', 'var g=Function("return this")()', 'eval("1+1")', 'var g=(0,eval)("this")']) {
    assert.throws(() => refuseCodeFromStrings({ 'assets/shell.js': chunk('assets/shell.js', code) }), /assets\/shell\.js/, code);
  }
});

test('scripts copied into the build are held to the same rule', () => {
  assert.throws(() => refuseCodeFromStrings({ 'blst.js': asset('blst.js', Buffer.from('eval("x")')) }), /blst\.js/);
});

test('code that only names functions passes, and so does anything that is not a script', () => {
  refuseCodeFromStrings({
    'assets/shell.js': chunk('assets/shell.js', 'if(typeof f==="function"&&f instanceof Function)isFunction(f);const s=Function.prototype.toString;tool.eval(1);retrieval(2)'),
    'assets/shell.css': asset('assets/shell.css', '.eval(x){}'),
    'blst.wasm': asset('blst.wasm', Buffer.from('eval(')),
  });
});

const linked = (fileName, imports) => ({ type: 'chunk', fileName, code: '', imports });

test('two chunks that import each other are refused, because one of them loads before what it needs', () => {
  const bundle = { 'shell.js': linked('shell.js', ['shared.js']), 'crypto.js': linked('crypto.js', ['account.js', 'shared.js']), 'account.js': linked('account.js', ['crypto.js']), 'shared.js': linked('shared.js', []) };
  assert.throws(() => refuseChunkCycles(bundle), /crypto\.js -> account\.js -> crypto\.js/);
});

test('a longer ring is found, and chunks that only share a dependency pass', () => {
  assert.throws(() => refuseChunkCycles({ 'a.js': linked('a.js', ['b.js']), 'b.js': linked('b.js', ['c.js']), 'c.js': linked('c.js', ['a.js']) }), /a\.js -> b\.js -> c\.js -> a\.js/);
  refuseChunkCycles({ 'a.js': linked('a.js', ['c.js']), 'b.js': linked('b.js', ['c.js']), 'c.js': linked('c.js', []), 'style.css': asset('style.css', '') });
});

test('the game\'s runtime is refused in the app shell and welcome in a chunk a feast loads', () => {
  const koota = { '/repo/node_modules/koota/dist/chunk-ZWIGMIL4.js': { renderedLength: 45109 } }, traits = { '/repo/packages/app/src/world/traits.ts': { renderedLength: 1283 } };
  const entry = (imports, dynamicImports = []) => ({ type: 'chunk', name: 'index', fileName: 'index.js', isEntry: true, code: '', imports, dynamicImports, modules: {} });
  const shared = modules => ({ type: 'chunk', name: 'shared', fileName: 'shared.js', isEntry: false, code: '', imports: [], modules });
  assert.throws(() => refuseGameInShell({ 'index.js': entry(['shared.js']), 'shared.js': shared({ ...traits, ...koota }) }), /Koota is in the app shell \(shared\.js\)/);
  // loaded by import() from the shell, it is the feast's to bring
  refuseGameInShell({ 'index.js': entry([], ['shared.js']), 'shared.js': shared({ ...traits, ...koota }) });
  // a module the bundler kept none of is not there
  refuseGameInShell({ 'index.js': entry(['shared.js']), 'shared.js': shared({ '/repo/node_modules/koota/dist/chunk-ZWIGMIL4.js': { renderedLength: 0 } }) });
});
