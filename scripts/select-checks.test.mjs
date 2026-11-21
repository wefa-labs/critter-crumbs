// Pins the proof the check selector asks for at each merge tier, and keeps its policy
// (scripts/data/validation-policy.json) in step with .agents/merge-policy.json.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { tierOf } from './merge-tiers.mjs';
import { loadPolicy, planValidation, resolveGitInputs } from './select-checks.mjs';

const policy = loadPolicy('scripts/data/validation-policy.json');
const plan = (paths, intent = 'ship') => planValidation({ intent, changedPaths: paths }, { policy });
const ids = (result) => result.checks.map((check) => check.id);

test('a routine change gets the targeted suite of its package, not the full check', () => {
  const result = plan(['packages/app/src/game/mound-size.ts']);
  assert.equal(result.risk, 'routine');
  assert.deepEqual(ids(result), ['lint', 'app-test']);
  assert.match(result.checks[1].command, /vitest\.mjs run --project app$/);
});

test('a sensitive change adds the full check', () => {
  const result = plan(['packages/shared/src/copy.ts']);
  assert.equal(result.risk, 'sensitive');
  assert.deepEqual(ids(result), ['lint', 'shared-test', 'full-check']);
  assert.equal(result.checks.find((check) => check.id === 'full-check').command, 'bun run check');
});

test('a critical change needs the full check and the production build', () => {
  const result = plan(['packages/core/src/tally/index.ts']);
  assert.equal(result.risk, 'critical');
  assert.deepEqual(ids(result), ['lint', 'core-test', 'full-check', 'vercel-build']);
  for (const id of ['full-check', 'vercel-build']) assert.equal(result.checks.find((check) => check.id === id).mandatory, true);
  assert.equal(result.checks.find((check) => check.id === 'vercel-build').command, 'bun run vercel-build');
});

test('a push names the test that proves a routine change', () => {
  assert.equal(plan(['packages/app/src/game/mound-size.ts'], 'push').status, 'needs-focus');
  const focused = planValidation({ intent: 'push', changedPaths: ['packages/app/src/game/mound-size.ts'], testPaths: { app: ['test/circle-motion.test.ts'] } }, { policy });
  assert.equal(focused.status, 'ready');
  assert.match(focused.checks.find((check) => check.id === 'app-test').command, /run --project app test\/circle-motion\.test\.ts$/);
});

test('every Vitest project a check runs exists, and every project has a check', () => {
  const config = readFileSync('vitest.config.ts', 'utf8');
  const projects = new Set([...config.matchAll(/\['([a-z', ]+)'\]\.map/g)].flatMap((match) => match[1].split(/', '/)).concat([...config.matchAll(/name: '([a-z-]+)'/g)].map((match) => match[1])));
  const named = new Set(policy.checks.flatMap((check) => [...check.command.matchAll(/--project ([a-z-]+)/g)].map((match) => match[1])));
  assert.deepEqual([...named].sort(), [...projects].sort());
});

test('a deployment test runs the deployment project', () => {
  assert.deepEqual(ids(plan(['tests/deployment/cli.test.ts'])), ['lint', 'deployment-test']);
});

test('a critical file moved to a routine path keeps the critical tier, staged and committed', (t) => {
  // A scratch repository with no global or system git config, so no hook, signing or identity of
  // the machine applies to it.
  const env = { ...Object.fromEntries(Object.entries(process.env).filter(([name]) => !name.startsWith('GIT_'))), GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_NOSYSTEM: '1' };
  const repo = realpathSync(mkdtempSync(path.join(tmpdir(), 'critter-crumbs-selector-rename-')));
  t.after(() => rmSync(repo, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', ['-c', 'user.name=t', '-c', 'user.email=t@example.invalid', '-c', 'init.defaultBranch=main', ...args], { cwd: repo, env, encoding: 'utf8' }).trim();
  const critical = 'packages/core/src/tally/index.ts';
  const routine = 'notes/index.ts';
  git('init', '--quiet');
  mkdirSync(path.join(repo, path.dirname(critical)), { recursive: true });
  writeFileSync(path.join(repo, critical), 'export const tally = () => 0;\n');
  git('add', critical);
  git('commit', '--quiet', '-m', 'add the tally');
  const base = git('rev-parse', 'HEAD');
  assert.equal(plan([routine]).risk, 'routine', 'the new path alone plans as routine');
  const moved = (stage) => {
    const inputs = resolveGitInputs({ base }, { cwd: repo, env });
    assert.deepEqual(inputs.changedPaths, [routine, critical], `${stage}: both paths changed`);
    assert.deepEqual(inputs.deletedPaths, [critical], `${stage}: the old path is deleted`);
    assert.equal(planValidation({ changedPaths: inputs.changedPaths, deletedPaths: inputs.deletedPaths }, { policy }).risk, 'critical', stage);
  };
  mkdirSync(path.join(repo, 'notes'));
  git('mv', critical, routine);
  moved('staged');
  git('commit', '--quiet', '-m', 'move the tally');
  moved('committed');
});

test('the selector gives every tracked file its merge tier, raising only package entries and manifests', () => {
  // The kit raises a package's entry file or manifest to sensitive: either can break compilation
  // anywhere in the package. Nothing else may differ, and nothing may be lowered.
  const order = ['routine', 'sensitive', 'critical'];
  const entry = /^packages\/[^/]+\/(package\.json|src\/(.+\/)?(index|main)\.ts)$/;
  const files = execFileSync('git', ['ls-files'], { encoding: 'utf8' }).split('\n').filter(Boolean);
  const disagreements = files
    .map((file) => ({ file, selector: plan([file]).risk, merge: tierOf(file) }))
    .filter(({ file, selector, merge }) => selector !== merge && !(entry.test(file) && order.indexOf(selector) > order.indexOf(merge)))
    .map(({ file, selector, merge }) => `${file}: selector ${selector}, merge policy ${merge}`);
  assert.deepEqual(disagreements, []);
});
